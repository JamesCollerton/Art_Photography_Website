// Run a minimal node.js web server for local development of a web site.
// Put this program in a site folder and start it with "node server.js".
// Then visit the site at the addresses printed on the console.
// The server is configured to match the most restrictive publishing sites.

// Load the web-server, file-system and file-path modules.
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');

// The default port numbers are the standard ones [80,443] for convenience.
// Change them to e.g. [8080,8443] to avoid privilege or clash problems.
var ports = [80, 443];

// The most common standard file extensions are supported.
// The most common non-standard file extensions are excluded, with a message.
var types = {
    '.html' : 'text/html, application/xhtml+xml',
    '.css'  : 'text/css',
    '.js'   : 'application/javascript',
    '.png'  : 'image/png',
    '.mp3'  : 'audio/mpeg', // audio
    '.aac'  : 'audio/aac',  // audio
    '.mp4'  : 'video/mp4',  // video
    '.webm' : 'video/webm', // video
    '.gif'  : 'image/gif',  // only if imported unchanged
    '.jpeg' : 'image/jpeg', // only if imported unchanged
    '.svg'  : 'image/svg+xml',
    '.json' : 'application/json',
    '.pdf'  : 'application/pdf',
    '.txt'  : 'text/plain', // plain text only
    '.xhtml': '#not suitable for dual delivery, use .html',
    '.htm'  : '#proprietary, non-standard, use .html',
    '.jpg'  : '#common but non-standard, use .jpeg',
    '.rar'  : '#proprietary, non-standard, platform dependent, use .zip',
    '.doc'  : '#proprietary, non-standard, platform dependent, ' +
              'closed source, unstable over versions and installations, ' +
              'contains unsharable personal and printer preferences, use .pdf',
};

// Start both the http and https services.  Requests can only come from
// localhost, for security.  (This can be changed to a specific computer, but
// shouldn't be removed, otherwise the site becomes public.)
function start() {
    test();
    var httpService = http.createServer(serve);
    httpService.listen(ports[0], 'localhost');
    var options = { key: key, cert: cert };
    var httpsService = https.createServer(options, serve);
    httpsService.listen(ports[1], 'localhost');
    printAddresses();
}

// Print out the server addresses.
function printAddresses() {
    var httpAddress = "http://localhost";
    if (ports[0] != 80) httpAddress += ":" + ports[0];
    httpAddress += "/";
    var httpsAddress = "https://localhost";
    if (ports[1] != 443) httpsAddress += ":" + ports[1];
    httpsAddress += "/";
    console.log('Server running at', httpAddress, 'and', httpsAddress);
}

// All URLs other than / start with a randomly chosen prefix /site-x so the
// site is forced to use relative links, and can then be published anywhere.
var letter = "abcdefghijklmnopqrstuvwxyz".charAt(Math.floor(Math.random()*26));
var prefix = "/site-" + letter;

// Response codes: see http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
var OK = 200, Redirect = 307, NotFound = 404, BadType = 415, Error = 500;

// Succeed, sending back the content and its type.
function succeed(response, type, content) {
    var typeHeader = { 'Content-Type': type };
    response.writeHead(OK, typeHeader);
    response.write(content);
    response.end();
}

// Tell the browser to try again at a different URL.
function redirect(response, url) {
    var locationHeader = { 'Location': url };
    response.writeHead(Redirect, locationHeader);
    response.end();
}

// Give a failure response with a given code.
function fail(response, code) {
    response.writeHead(code);
    response.end();
}

// Serve a single request.  Redirect / to add the prefix, but otherwise insist
// that every URL should start with the prefix.  A URL ending with / is treated
// as a folder and index.html is added.  A file name without an extension is
// reported as an error (because we don't know how to deliver it, or if it was
// meant to be a folder, it would inefficiently have to be redirected for the
// browser to get relative links right).
function serve(request, response) {
    var file = request.url;
    if (file == '/') return redirect(response, prefix + '/');
    if (! starts(file,prefix)) return fail(response, NotFound);
    file = file.substring(prefix.length);
    if (ends(file,'/')) file = file + 'index.html';
    file = "." + file;
    var type = findType(request, path.extname(file));
    if (! type) return fail(response, BadType);
    if (! inSite(file)) return fail(response, NotFound);
    if (! matchCase(file)) return fail(response, NotFound);
    if (! noSpaces(file)) return fail(response, NotFound);
    try { fs.readFile(file, ready); }
    catch (err) { return fail(response, Error); }

    function ready(error, content) {
        if (error) return fail(response, NotFound);
        succeed(response, type, content);
    }
}

// Find the content type (MIME type) to respond with.
// Content negotiation is used for XHTML delivery to new/old browsers.
function findType(request, extension) {
    var type = types[extension];
    if (! type) return type;
    if (extension != ".html") return type;
    var htmlTypes = types[".html"].split(", ");
    var accepts = request.headers['accept'].split(",");
    if (accepts.indexOf(htmlTypes[1]) >= 0) return htmlTypes[1];
    return htmlTypes[0];
}

// Check whether a string starts with a prefix, or ends with a suffix
function starts(s, x) { return s.lastIndexOf(x, 0) == 0; }
function ends(s, x) { return s.indexOf(x, s.length-x.length) == 0; }

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

// A dummy key and certificate are provided for https.
// They should not be used on a public site because they are insecure.
// They are effectively public, which private keys should never be.
var key =
    "-----BEGIN RSA PRIVATE KEY-----\n" +
    "MIICXAIBAAKBgQDGkGjkLwOG9gkuaBFj12n+dLc+fEFk1ns60vsE1LNTDtqe87vj\n" +
    "3cTMPpsSjzZpzm1+xQs3+ayAM2+wkhdjhthWwiG2v2Ime2afde3iFzA93r4UPlQv\n" +
    "aDVET8AiweE6f092R0riPpaG3zdx6gnsnNfIEzRH3MnPUe5eGJ/TAiwxsQIDAQAB\n" +
    "AoGAGz51JdnNghb/634b5LcJtAAPpGMoFc3X2ppYFrGYaS0Akg6fGQS0m9F7NXCw\n" +
    "5pOMMniWsXdwU6a7DF7/FojJ5d+Y5nWkqyg7FRnrR5QavIdA6IQCIq8by9GRZ0LX\n" +
    "EUpgIqE/hFbbPM2v2YxMe6sO7E63CU2wzSI2aYQtWCUYKAECQQDnfABYbySAJHyR\n" +
    "uxntTeuEahryt5Z/rc0XRluF5yUGkaafiDHoxqjvirN4IJrqT/qBxv6NxvKRu9F0\n" +
    "UsQOzMpJAkEA25ff5UQRGg5IjozuccopTLxLJfTG4Ui/uQKjILGKCuvnTYHYsdaY\n" +
    "cZeVjuSJgtrz5g7EKdOi0H69/dej1cFsKQJBAIkc/wti0ekBM7QScloItH9bZhjs\n" +
    "u71nEjs+FoorDthkP6DxSDbMLVat/n4iOgCeXRCv8SnDdPzzli5js/PcQ9kCQFWX\n" +
    "0DykGGpokN2Hj1WpMAnqBvyneXHMknaB0aXnrd/t7b2nVBiVhdwY8sG80ODBiXnt\n" +
    "3YZUKM1N6a5tBD5IY2kCQDIjsE0c39OLiFFnpBwE64xTNhkptgABWzN6vY7xWRJ/\n" +
    "bbMgeh+dQH20iq+O0dDjXkWUGDfbioqtRClhcyct/qE=\n" +
    "-----END RSA PRIVATE KEY-----\n";

var cert =
    "-----BEGIN CERTIFICATE-----\n" +
    "MIIClTCCAf4CCQDwoLa5kuCqOTANBgkqhkiG9w0BAQUFADCBjjELMAkGA1UEBhMC\n" +
    "VUsxDTALBgNVBAgMBEF2b24xEDAOBgNVBAcMB0JyaXN0b2wxDDAKBgNVBAoMA1VP\n" +
    "QjEZMBcGA1UECwwQQ29tcHV0ZXIgU2NpZW5jZTESMBAGA1UEAwwJbG9jYWxob3N0\n" +
    "MSEwHwYJKoZIhvcNAQkBFhJub25lQGNzLmJyaXMuYWMudWswHhcNMTMwNDA4MDgy\n" +
    "NjE2WhcNMTUwNDA4MDgyNjE2WjCBjjELMAkGA1UEBhMCVUsxDTALBgNVBAgMBEF2\n" +
    "b24xEDAOBgNVBAcMB0JyaXN0b2wxDDAKBgNVBAoMA1VPQjEZMBcGA1UECwwQQ29t\n" +
    "cHV0ZXIgU2NpZW5jZTESMBAGA1UEAwwJbG9jYWxob3N0MSEwHwYJKoZIhvcNAQkB\n" +
    "FhJub25lQGNzLmJyaXMuYWMudWswgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGB\n" +
    "AMaQaOQvA4b2CS5oEWPXaf50tz58QWTWezrS+wTUs1MO2p7zu+PdxMw+mxKPNmnO\n" +
    "bX7FCzf5rIAzb7CSF2OG2FbCIba/YiZ7Zp917eIXMD3evhQ+VC9oNURPwCLB4Tp/\n" +
    "T3ZHSuI+lobfN3HqCeyc18gTNEfcyc9R7l4Yn9MCLDGxAgMBAAEwDQYJKoZIhvcN\n" +
    "AQEFBQADgYEAQo4j5DAC04trL3nKDm54/COAEKmT0PGg87BvC88S5sTsWTF4jZdj\n" +
    "dgxV4FeBF6hW2pnchveJK4Kh56ShKF8SK1P8wiqHqV04O9p1OrkB6GxlIO37eq1U\n" +
    "xQMaMCUsZCWPP3ujKAVL7m3HY2FQ7EJBVoqvSvqSaHfnhog3WpgdyMw=\n" +
    "-----END CERTIFICATE-----\n";

// Start everything going.
start();