//Developer: Mae Wegbreit, Audrey Dawson, Emmely Rogers
//Date: April 28th, 2019
//Description: Javascript file for functions on the client side realted to setting up and ending the game. 

// initial client id before it is assigned by the server
var id = -1;
// the user's assigned color
var userColor = "";
// the interval for checking whose turn it is that we will set up and ended as various times throughout game
var intervalID;
// how many pieces in my opponents jail (how many I have lost)
var jailCount = 0;
// keep track of how many pieces are in my jail (how many opponent pieces I captured)
var captureCount = 0;

/* the images used within the game */
var red = {regular: "red_piece.png", king: "red_king.png"}; 
var black = {regular: "black_piece.png", king: "black_king.png"};

/* function for setting up the game board in its inital set up to match how the server will store locations of checkers */
function setUpGameBoard(initBoard) {
    for (cell of initBoard) {
        if (cell.id != undefined) {
        // updating cell image
            var color = cell.color;
            var type = cell.type;

            var imageName = findImageName(color,type);
            if (imageName) {
                document.getElementById(cell.id).innerHTML = "<img src='/images/checkerPieces/" + imageName + "'></img>";
            }
            else {
                document.getElementById(cell.id).innerHTML = "";
            }
        }
    }
}

/* MouseOver event handler for buttons */
function buttonOver(){
    this.style.backgroundColor = "forestgreen";
}

function buttonOut(){
    this.style.backgroundColor = "";
}

// initial click event listener for the start button
document.getElementById("start").addEventListener("click", initialize);
document.getElementById("start").addEventListener("mouseover", buttonOver);
document.getElementById("start").addEventListener("mouseout", buttonOut);

/* event handler for button press of start
 * send initial communication to the server and request user id, color, and gameBoard status
 * triggered by start button */
function initialize() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = assignId; // events of interest
    xmlhttp.onerror = function() {alert("Error assigning user id")};
    var request = {request:"init"}
    // initialize connection to the server
    xmlhttp.open("GET", "http://localhost:8080/?"+queryObjectToString(request));
    xmlhttp.send(); // send the HTTP request
}

/* store the client id that I was assigned, set up game board based on server
 * start periodic polling to detect when it is this client's turn
 * disables the listener for the start button, and detected if there are already two 
 *  client playing and alerts the third client that the server is busy */
function assignId() {
    if (this.status == 200) {
        var answer = JSON.parse(this.responseText);
        id = answer.id;
        userColor = answer.color;
        board = answer.board;
        setUpGameBoard(board);
        // update the client's page for player
        document.getElementById("playerId").innerHTML = "You are player: " + userColor;
       
        // start checking for whose turn it is, this is exported so it can be modified in gamePlay
       intervalID = setInterval(turnUpdate, 1000);
       
        // removes event listener for start button until the end of the game
        document.getElementById("start").removeEventListener("click", initialize);
        document.getElementById("start").removeEventListener("mouseover", buttonOver);
    }
    else {
        alert("Game already in progress!");
    }
}

// updates the turn (gets called by forfeit) or if the player determine that all their pieces are in jail
function gameEnd() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = processEnd; // events of interest
    xmlhttp.onerror = function() {alert("Error connecting for turnUpdate")};
    var query = {request:"endGame", turn: "none"}
    // initialize connection to the server
    xmlhttp.open("GET", "http://localhost:8080/?"+queryObjectToString(query));
    xmlhttp.send(); // send the HTTP request
}

/* on load function for gameEnd() that stops the polling for turn data and reestablished start button listeners*/
function processEnd() {
    if (this.status == 200) {
        // cancel my user idea of the loser, who is the one who signals the end of the game
        id = -1;
        // stop checking for turn data
        clearInterval(intervalID);
        if (userColor == "red") {
            endGame("black");
        }
        else {
            endGame("red");
        }
        // click event listener for the start button
        document.getElementById("start").addEventListener("click", initialize);
        document.getElementById("start").addEventListener("mouseover", buttonOver);
        document.getElementById("start").addEventListener("mouseout", buttonOut);
    }
}

/* finished disabling all the pieces and displays to the loser who the winner is*/
function endGame(color) {
    document.getElementById("info").innerHTML = "The winner is: " + color;
    disablePieces(posMoveArr, "click", completeMove);
    disablePieces(myPieces, "click", possibleMovements);
    disablePieces(myPieces, "mouseenter", enter);
    disablePieces(myPieces, "mouseleave", exit);

    /* clear jails */
    clearJails();
}

/* converts the query object into a string */
function queryObjectToString(query) {
    var properties = Object.keys(query);
    var arrOfQueryStrings = properties.map(prop => prop+"="+query[prop]);
    // join strings using whatever string you choose (here as &)
    return(arrOfQueryStrings.join('&'));
}


function clearJails() {
    document.getElementById("redJail").innerHTML = "<p>JAIL</p>";
    document.getElementById("blackJail").innerHTML = "<p>JAIL</p>";
}