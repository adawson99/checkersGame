//Developers: Emmely Rogers, Mae Wegbreit, Audrey Dawson
//Date: May 1, 2019
//Description: Script that creates server, processes the client's incoming requests, and calls
// the function exported by the static file server module 

http = require('http');
url = require('url');
//gets the modules that exports the function in fileServer.js
myFs = require('./fileServer.js');

// gets the module that exports the function for processing queries in gameQuery.js
myQuery = require('./gameQuery.js');

//call back function
serveStatic = function (req, res) {
    var path = url.parse(req.url).pathname;
    var fileName = 'public_html/' + url.parse(req.url).pathname.substring(1); 
    var queryObj = url.parse(req.url,"true").query;
    if(path && path.length > 1) {
        // call the exported function from fileServer.js
        myFs.fileServer(fileName, res);
    }
    if (queryObj.request) {
        // call the exported function from albumQuery.js
        myQuery.processQuery(queryObj,res);
    }
   
    //printing the URL that is sent to the server 
    console.log(fileName);
    };

myserver = http.createServer(serveStatic); //create a server object 
myserver.listen(8080); //the server object listens on port 8080