
//Developers: M. Wegbreit, A. Dawson, E. Rogers
//Date: April 28, 2019
//Description: Processes the queries and send the requested information to the client


fs = require('fs');
url = require('url');
path = require('path');
utils = require('./utils.js');

 // all of the cell ids in the gameboard, ordered for easy set up in setUpGameData()
 var cells = ["01", "03", "05", "07", "10", "12", "14", "16", "21", "23", "25", "27", 
 "50", "52", "54", "56", "61", "63", "65", "67", "70", "72", "74", "76", 
 "30", "32", "34", "36", "41", "43", "45", "47"];
 
 // holds an object for each cell of the game board containing cell id, color, and type
 var gameBoard = [];

 // latest id of a client
 var latestId = 0;

 // array of user info, will be object that contains color, numJailed, previousTurnChanges in userInfo[id]
 var userInfo = [];

 // keeps track of whose turn it is (black, red, none)
 var currentTurn = "black";

 // set up the inital location of the game pieces
 function setUpGameData() {
    for(i = 0; i < 32; i++) {
        // first 12 ids in cells are black upon starting the game
        if (i < 12) {
            var newCell = initializeCell(cells[i], "black", "regular");
        }
        else if (i >= 12 && i < 24) {
            // the next 12 are regular pieces
            var newCell = initializeCell(cells[i], "red", "regular");
        }
        else {
            // the remaining 12 are the red pieces
            var newCell = initializeCell(cells[i], "none", "none");
        }
            gameBoard.push(newCell)
    }
 }

/* helper function for initializing each cell of the board*/
function initializeCell(id, color, type) {
    return {"id": id,"color": color, "type": type};
}

/* This is the exported function that responds to the queries */
exports.processQuery  = (query, res) => {

    switch (query.request) { 
        case "init": 
            processInit(res); 
            break; 
        case "turnUpdate": 
            processTurn(res); 
            break;
        case "endGame":
            endGame(query, res); 
            break;
        case "endTurn":
            endTurn(query, res);
            break;
        case "updateBoard":
            updateBoard(query, res);
            break;
        case "pieceInfo":
            pieceInfo(query, res);
            break;
        case "arrSingleColor":
            allPiecesOneColor(query, res);
            break;
        default: 
            var errObj = {message: "Query not supported"}; 
            utils.sendJSONObj(res,500,errObj);
            break; 
        }
    }

    /* generates the id and color for the new client, initializes user data in server and current player
     * sets up gameBoard array in server once per game*/
    function processInit(res) { // must figure out the id for the client
       
        if (gameBoard.length == 0) {
            // the first time start is pressed, the game data is set up
            setUpGameData();
        }

        var answer = {};
        //assign the user an id (latestId starts as 0)
        answer.id = latestId;
        // tells the user the state of gameBoard on start-up (useful if black player made a move
        // before red player began)
        answer.board = gameBoard;
        // assign the user a color
        if (answer.id == 0) {
            answer.color = "black";
            // the array of user information at index answer.id
            userInfo[answer.id] = {id: 0, color: answer.color, jailed: "0", updates: []}; 
            utils.sendJSONObj(res, 200, answer);
            currentTurn = "black";
            latestId++;

        }
        else if (answer.id == 1) {
            answer.color = "red";
            // the array of user information at index answer.id
            userInfo[answer.id] = {id: 1, color: answer.color, jailed: "0", updates: []};
            utils.sendJSONObj(res, 200, answer);
            latestId++;
        }
        else {
            utils.sendJSONObj(res, 400, "Error Connecting");
        }
    }

/* return the current player turn to the client */
function processTurn(res) { 
    var answer = {};
    //assign the user an id
    answer.turn = currentTurn;
    utils.sendJSONObj(res, 200, answer);
    }


/* ends the game by turning currentPlayer to "none" */
function endGame(query, res) {
    // reset the id and client data so that a new game can begin
    latestId = 0;
    // reset the gameBoard with correct starting locations
    gameBoard = [];
    var answer = {};
    // sets turn to none
    currentTurn = query.turn;
    utils.sendJSONObj(res, 200, answer);
}

/* end the current users turn and store their updates in the server for the next client*/ 
function endTurn(query, res) {
    // switch turn
    if (query.turn == "black") {
     currentTurn = "red";
    } else {
     currentTurn = "black";
    }
    // changed cells in object
    changedCellsObj = JSON.parse(query.cellChanges);


    for (user of userInfo) {
            // update the other player's jail count
            if (user.id != query.myID || userInfo.length <= 1) {
                user.jailed = query.jailTotal;
            
            // update cells that were sent (maximum of three cells can be changed)
            for (i = 0; i<3; i++) {
                // access the cell in the object by attribute name (_1, _2, _3)
                cell = changedCellsObj["_"+i];
              
                // add the changed cells to user.updates so next user can see changes  
                if (cell) {
                   user.updates.push(cell);
                    // add the new cell to the gameBoard data strcutre, replacing the old values
                    var originalCell = gameBoard.find(element => element.id === cell.id);
                    var index = gameBoard.indexOf(originalCell);
                    gameBoard[index] = cell;
                }
            }
        }
    }
    utils.sendJSONObj(res, 200, {});
 }

 /* send cell changes and jail count changes to the client*/
 function updateBoard(query, res) {
     var answer = {};
     /* check for updates left in my users update attribute left by other client */
     if (userInfo[query.myID]) {
        var user = userInfo[query.myID];

        //send list of change cells and new jailTotal 
        answer["list"] = user.updates;
        answer["jailTotal"] = user.jailed;
        // empty the content of the updates so we don't reupdate later
        userInfo[query.myID].updates = [];
        utils.sendJSONObj(res, 200, answer);
     }
 }
 
 /* returns the cell specified by id */
function pieceInfo(query, res) {
    var cellID = query.id;
    var gamePiece = gameBoard.find(function(cell){
        return cell.id == cellID;
    });
    // sends the entire gamePiece object
    utils.sendJSONObj(res, 200, gamePiece);
} 


/* function to send back all pieces on board of requested color*/
function allPiecesOneColor(query, res){
    answer = {};
    var color = query.color;
    var singleClrArray = [];
    if(color == "red"){
        singleClrArray = gameBoard.filter(cell => cell.color == "red");
    } else if (color == "black"){
        singleClrArray = gameBoard.filter(cell => cell.color == "black");
    }
    answer.array = singleClrArray;
    utils.sendJSONObj(res, 200, answer);
}
