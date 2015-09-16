// Notes:

// I have taken the main sever given to us and rewritten it very slightly. From
// there I have begun adding extra parts on. It didn't make much sense to write
// it from scratch as what was already there was identical to anything else I 
// was going to come up with.

// ------------------------------ Requirements ------------------------------ //

var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var email_server = require("./server/server_email")
var stats_server = require("./server/server_user_statistics")
var forum_server = require("./server/server_forum")

// ------------------------------- Ports ------------------------------------ //

var http_port = 80; 
var https_port = 443;

// ------------------------------- Prefixing -------------------------------- //

var letter = "abcdefghijklmnopqrstuvwxyz".charAt(Math.floor(Math.random()*26));
var prefix = "/site-" + letter;

// ------------------------------- Response Codes --------------------------- //

var response_code = {
    'No_Response' : -1,
    'OK' : 200,
    'Redirect' : 307,
    'NotFound' : 404,
    'BadType' : 415,
    'Error' : 500,
}

// ------------------------------- Supported Types -------------------------- //

var types = {
    '.html' : 'text/html, application/xhtml+xml',
    '.css'  : 'text/css',
    '.map'  : 'text/css',
    '.js'   : 'application/javascript',
    '.png'  : 'image/png',
    '.mp3'  : 'audio/mpeg', 
    '.aac'  : 'audio/aac',  
    '.mp4'  : 'video/mp4',  
    '.webm' : 'video/webm', 
    '.gif'  : 'image/gif',  
    '.jpeg' : 'image/jpeg', 
    '.svg'  : 'image/svg+xml',
    '.json' : 'application/json',
    '.pdf'  : 'application/pdf',
    '.txt'  : 'text/plain', 
    '.xhtml': '#not suitable for dual delivery, use .html',
    '.htm'  : '#proprietary, non-standard, use .html',
    '.jpg'  : '#common but non-standard, use .jpeg',
    '.rar'  : '#proprietary, non-standard, platform dependent, use .zip',
    '.doc'  : '#proprietary, non-standard, platform dependent, ' +
              'closed source, unstable over versions and installations, ' +
              'contains unsharable personal and printer preferences, use .pdf',
};

// ----------------- Function for Main Part of the Server. ------------------ //

// Starts the http server and https server running.
function start() {
    test();
    start_http();
    start_https();
    console.log("Running at localhost.")
}

// Starts http server.
function start_http() {
    var httpService = http.createServer(serve);
    httpService.listen(http_port, 'localhost');
}

// Starts https server.
function start_https() {
    var options = { key: fs.readFileSync('keys/key.pem'), 
                    cert: fs.readFileSync('keys/cert.pem') };
    var httpsService = https.createServer(options, serve);
    httpsService.listen(https_port, 'localhost');
}

// If the serve function succeeds it uses this to write to the response.
function succeed(response, type, content) {
    var typeHeader = { 'Content-Type': type };
    response.writeHead(response_code['OK'], typeHeader);
    response.write(content);
    response.end();
}

// This redirects from the current location to a specified url.
function redirect(response, url) {
    var locationHeader = { 'Location': url };
    response.writeHead(response_code['Redirect'], locationHeader);
    response.end();
}

// If for any reason the server fails it writes the failure code to the head
// and then ends the response.
function fail(response, code) {
    response.writeHead(code);
    response.end();
}

// Check whether a string starts with a prefix, or ends with a suffix
function starts(s, x) { return s.lastIndexOf(x, 0) == 0; }
function ends(s, x) { return s.indexOf(x, s.length-x.length) == 0; }

// Serve function as called from the http and https functions.
function serve(request, response) {

    var file = request.url;

    if (file == '/') return redirect(response, prefix + '/');
    if (! starts(file,prefix)) return fail(response, response_code['NotFound']);

    // Anything with a / is considered a folder.
    file = file.substring(prefix.length);
    if (ends(file,'/')) file = file + 'index.html';
    file = "." + file;

    // Finds the type and checks it is valid and there are no errors.
    var type = findType(request, path.extname(file));
    resp = error_check(type, file, response)
    if( resp != response_code['No_Response'] ) return(resp); 

    // Tries to read in the file and write the content.
    try { fs.readFile(file, ready); }
    catch (err) { return fail(response, response_code['Error']); }

    // When ready reads in the file.
    function ready(error, content) {
        if (error) return fail(response, response_code['NotFound']);
        succeed(response, type, content);
    }
}

// Checks that the type of file is supported by the server, the file is in the
// site, the cases match and there are no spaces.
function error_check(type, file, response) {

    if (! type) return fail(response, response_code['BadType']);
    if (! inSite(file)) return fail(response, response_code['NotFound']);
    if (! matchCase(file)) return fail(response, response_code['NotFound']);
    if (! noSpaces(file)) return fail(response, response_code['NotFound']);
    return(response_code['No_Response'])

}

// If the type is not supported then type will be undefined and returned.
// If the extension is not html and is supported then type returned.
// If the extension is html need content negotiation.
// Sees according to the header what type is supported and then returns the
// necessary type accordingly.
function findType(request, extension) {

    var type = types[extension];
    if (! type) return type;
    if (extension != ".html") return type;

    var htmlTypes = types[".html"].split(", ");
    var accepts = request.headers['accept'].split(",");
    if (accepts.indexOf(htmlTypes[1]) >= 0) return htmlTypes[1];
    return htmlTypes[0];
}

// Check that a file is inside the site.  This is essential for security.
var site = fs.realpathSync('.') + path.sep;

function inSite(file) {
    var real;
    try { real = fs.realpathSync(file); }
    catch (err) { return false; }
    return starts(real, site);
}

// Check that the case of a path matches the actual case of the files.  This is
// needed in case the target publishing site is case-sensitive, and you are
// running this server on a case-insensitive file system such as Windows or
// (usually) OS X on a Mac.  The results are not (yet) cached for efficiency.
function matchCase(file) {
    var parts = file.split('/');
    var dir = '.';
    for (var i=1; i<parts.length; i++) {
        var names = fs.readdirSync(dir);
        if (names.indexOf(parts[i]) < 0) return false;
        dir = dir + '/' + parts[i];
    }
    return true;
}

// Check that a name contains no spaces.  This is because spaces are not
// allowed in URLs without being escaped, and escaping is too confusing.
// URLS with other special characters are also not allowed.
function noSpaces(name) {
    return (name.indexOf(' ') < 0);
}

// Do a few tests.
function test() {
    if (! fs.existsSync('./index.html')) failTest('no index.html page found');
    if (! inSite('./index.html')) failTest('inSite failure 1');
    if (inSite('./../site')) failTest('inSite failure 2');
    if (! matchCase('./index.html')) failTest('matchCase failure');
    if (matchCase('./Index.html')) failTest('matchCase failure');
    if (! noSpaces('./index.html')) failTest('noSpaces failure');
    if (noSpaces('./my index.html')) failTest('noSpaces failure');
}

function failTest(s) {
    console.log(s);
    process.exit(1);
}

// -------------------------- Start Everything Going. ----------------------- //

start();
