"use strict"

// -------------------------- Setting up and altering the SQLite DB ----------------------- //

// I left this in because it will let you see who I set up the user stats DB, and also let
// you reset it so you can see the database in action. It can be really easy to accidentally
// leave one page open and throw all of the stats out of whack. Although in real life
// that's fine, for the purposes of marking I can imagine it being a pain.

// -------------------------- Requirements and setting up the DB -------------------------- //

var sql = require("sqlite3");
sql.verbose();
var db = new sql.Database("test.db");

// Can run this to create a database. Don't run it as it is already created, but
// it lets you see what it would look like.

// db.serialize(startup);

// Creating the table for the statistics page.

function startup() {
  // db.run("create table stats_tab (Page text, Time int, Num_Clicks int, Hits int, Contacts int)", err);
  // db.close();
}

// Can be used to show what's going on on in the database if needed.

// db.each("select * from stats_tab", show); 
// db.close();

// IMPORTANT: Uncomment the first line to delete everything from the table
// and reset the stats. Try to avoid uncommenting the second line as it will
// delete the table itself and you will have to make it again.

// db.run("delete from stats_tab", err);
// db.run("drop table stats_tab", err);

// Shows what's going on in the database.

function show(err, row) {
    if (err) throw err;
    console.log(row);
}

function err(e) { if (e) throw e; }
