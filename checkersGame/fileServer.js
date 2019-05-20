
//Developers: Emmely Rogers, Audrey Dawson, Mae Wegbreit
//Date: May 1, 2019
//Description: exports the function that serves the file to the client 

fs = require('fs');
url = require('url');
path = require('path');

/* This is the exported function that serves the file to client. It handles errors and various content-types.*/
exports.fileServer  = (fileName, res) => {
    contentType = findExtention(fileName);

    fs.readFile(fileName,"binary",function(err,data) {
        if (err) {
            handleErrors(res);
        } 
        else {
            res.writeHead(200, {'Content-Type': contentType }); 
            res.write(data,"binary");
            res.end();
        }
    });
}

/* returns the appropriate content-type based on the extension of the file to be returned */
function findExtention(fileName) {
    extensions = {'.css': 'text/css', '.js': 'text/javascript','.html': 'text/html', '.tiff': 'image/tiff', 
    '.tif' : 'image/tiff', '.txt': 'text/plain', '.png' : 'image/png', '.jpeg' : 'image/jpeg', '.jpg': 'image/jpeg'};
    var ext = path.extname(fileName);
    return extensions[ext];
  
}

/* error handling function. Sends error code and message back to the client. */
function handleErrors(res) {
    res.writeHead(404, {'Content-Type': 'text/plain'}); 
    res.write('Error 404: resource not found.');
    res.end();
}