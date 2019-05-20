//Developers: Emmely Rogers, Audrey Dawson, Mae Wegbreit
//Date: May 1, 2019
//Description: It contains utility fucntions that can be used in other functions

// fucntion sends an object to the client
// Parameters:
// res: response object
// status: status code to be send in header
// out: object to be sent to the client
exports.sendJSONObj = function(res,status,out) {
    res.writeHead(status, { "Content-Type" : "application/json" });
    console.log(JSON.stringify(out));
    res.write(JSON.stringify(out));
    res.end();

}

// fucntion sends a text string to the client
// Parameters:
// res: response object
// status: status code to be send in header
// str: text string to be sent to the client
exports.sendText = function(res, status, str) {
    res.writeHead(status, { "content-type": "text/plain" });
    res.write(str);
    res.end();
}
