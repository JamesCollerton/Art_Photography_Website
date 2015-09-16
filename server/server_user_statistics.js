// ------------ Requirements, Setting up SQL, Setting up Express ------------ //

var sql = require("sqlite3");
var express = require('express');

var app = express();

var io_server = require('http').createServer(app);
var io = require('socket.io').listen(io_server);

// Sets the stats server to listen at port 8090.
exports.stats_server = io_server.listen(8090);

// ---------------------- Setting up SQLite components ---------------------- //

sql.verbose();
var db = new sql.Database("test.db");

// --------- Functions for the User Statistics Part of the Server.----------- //

// --------- Data collection ----------- //
// All of these functions are constantly listening
// to the website and collecting the user's data.

// New time is used as the updated time from the last
// time data collection was done. Same for clicks. The
// current page is the information of the page we're on.
var new_time = 0, new_clicks = 0, new_hits = 0, new_contacts = 0;
var current_page = "";

// When the connection is made we constantly start
// searching for the website updating the information.
exports.user_stats_server = io.on('connection', function (socket) {
                              socket.on('stat update', function (data) {
                                db.serialize(update_stats_db(data));
                              });
                            });

// Wrapper for the function that checks if what we're interested
// in is taken. All of the below functions feed into each other
// to maintain synchronisity. Keeping everything timed was a bit
// of a headache and is mentioned in the report.
function update_stats_db(data) {

    db.serialize( check_taken( data ) );

}

// Here we check if the row we're trying to update exists or not.
// if it does we update it, if not we create it and enter values.
function check_taken(data) {
    var sql_cmmd = "select * from stats_tab where Page = '" + 
                    String(data['new_stats']['page']) +"'";

    db.get(sql_cmmd, function(err, row){

        if(err) throw err;
        if(typeof row == "undefined") { db.serialize( create_record(data) ); } 
        else { db.serialize( update_values(data) ); }

    }); 
}

// So when we update values, the first thing we do is get a new
// time.
function update_values(data){

    db.serialize( get_new_time(data) );

}

// I played with putting the four functions below into one function,
// but it turned out not to work as well as doing it this way. The
// structure is the same, but almost all of the arguments are different
// which meant that the function declaration was very long. I know it
// looks a little repetitive but I think it is the best way of doing it.

// To update the time we work out how much time has passed on the
// page between when we last accessed the database, and then add it
// to the existing amount.

function get_new_time(data){

    var sql_cmmd = "select Time from stats_tab where Page = '" 
                    + String(data['new_stats']['page']) + "'";

    db.get(sql_cmmd, function(err, row){

        if(err) throw err;
        new_time = row['Time'] + data['new_stats']['time_on_page'];
        get_new_hits(data);

    }); 
}

// We add on the number of hits.

function get_new_hits(data){

    var sql_cmmd = "select Hits from stats_tab where Page = '" 
                    + String(data['new_stats']['page']) + "'";

    db.get(sql_cmmd, function(err, row){

        if(err) throw err;
        new_hits = row['Hits'] + data['new_stats']['hits'];
        get_new_contacts(data);

    }); 
}

// Add on the number of contacts.

function get_new_contacts(data){

    var sql_cmmd = "select Contacts from stats_tab where Page = '" 
                    + String(data['new_stats']['page']) + "'";

    db.get(sql_cmmd, function(err, row){

        if(err) throw err;
        new_contacts = row['Contacts'] + data['new_stats']['author_contacts'];
        get_new_clicks(data);

    }); 
}

// From the above function we pass to this one to collect the number of
// clicks that have occurred since the last data collection.

function get_new_clicks(data){

    var sql_cmmd = "select Num_Clicks from stats_tab where Page = '" 
                    + String(data['new_stats']['page']) + "'";

    db.get(sql_cmmd, function(err, row){

        if(err) throw err;
        new_clicks = row['Num_Clicks'] + data['new_stats']['clicks_on_page'];
        run_update(data);
    }); 
}

// This actually runs the update part and adds the new num of clicks and new
// time to the page.

function run_update(data){

    var sql_cmmd = "update stats_tab set " +
                   "Time = " + new_time +
                   ", Num_Clicks = " + new_clicks +
                   ", Hits =" + new_hits +
                   ", Contacts =" + new_contacts + 
                   " where Page = '" + String(data['new_stats']['page']) + "'";

    db.run(sql_cmmd, err);

    // Uncomment this line to see the stats!
    console.log("\n\n");
    db.each("select * from stats_tab", show);
}

// This creates a record if we detect that we haven't had one before. We delete
// all existing ones (not necessary, but worth it just in case). Then we insert
// the relevant row.

function create_record(data){

    var sql_cmmd = "delete from stats_tab where Page = '" + 
                    String(data['new_stats']['page']) +"'";
    db.run(sql_cmmd, err);

    var sql_cmmd = "insert into stats_tab values ('" +
                    String(data['new_stats']['page']) +
                    "', " + data['new_stats']['time_on_page'] +
                    ", " + data['new_stats']['clicks_on_page'] + 
                    ", " + data['new_stats']['hits'] +
                    ", " + data['new_stats']['author_contacts'] + ")";

    db.run(sql_cmmd, err);
}

// This is only used for testing so we can see what's being added onto
// the database.

function show(err, row) {
    if (err) throw err;
    console.log(row);
}

function err(e) { if (e) throw e; }

// ---------------------------- Data distribution --------------------------- //

// These functions are used to distribute the data from the
// database back up to the client side.

// This socket is used in communicating using Socket IO back
// up to the server.
var req_socket;

// When we connect we look out for stat requests from the 
// client side.
io.on('connection', function (socket) {
  socket.on('stat request', function (data) {
    req_socket = socket;
    db.serialize(deliver_stats(data));
  });
});

// This is used to tell what kind of data we need to send back
// to the client side for the d3 graph.
var curr_type;

function deliver_stats(data) {
    get_stat(data['req']['type']);
}

// Gets the page and the type from the database in order to
// give the page name and the necessary data back to the client
// side.
function get_stat(type, page) {
    var sql_cmmd = "select Page, " + type + " from stats_tab";
    curr_type = type;
    db.all(sql_cmmd, get_time);
}

// This function is used to get all stats of the correct type
// from the database and then feed them back to the client side
// with socket IO.
function get_time(err, rows){
    if (err) throw err;
    req_socket.emit('request ans', { ans: rows }); 
}
