//Developer: Mae Wegbreit, Audrey Dawson, Emmely Rogers
//Date: April 2019
//Description: Client side funcionality for funciton immediately related to taking a turn 
//end ending a turn and server getting updates at the beginning

// asks the server whose turn it is currently
function turnUpdate() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = processTurn; // events of interest
    xmlhttp.onerror = function() {alert("Error connecting for turnUpdate")};
    var query = {request:"turnUpdate", id: id}
    // initialize connection to the server
    xmlhttp.open("GET", "http://localhost:8080/?"+ queryObjectToString(query));
    xmlhttp.send(); // send the HTTP request
}

/* if it is this user turn, they will update the board based on the previous user turn */
function processTurn() {
    if (this.status == 200) {
        var answer = JSON.parse(this.responseText);
        if (answer.turn == userColor) { // if it is my turn, if the color matches my user color
            window.clearInterval(intervalID); // stop polling for turn data while it is my turn
            // display whose turn it is on the UI
            document.getElementById("info").innerHTML = "Current Player: " + answer.turn;

            updateGameBoardXML() // finds the changes made by the other player during their turn and their jail count

            piecesToEnable(userColor); // find location of all my colored pieces and enables them with click listeners

            // click event listener for the forfeit button
            document.getElementById("reset").addEventListener("click", gameEnd);
            document.getElementById("reset").addEventListener("mouseover", buttonOver);
            document.getElementById("reset").addEventListener("mouseout", buttonOut);
        }
        else if (answer.turn == "none") {
            window.clearInterval(intervalID); // stop polling for turn data if the turn is now "none", the game must have ending while it wasn't my turn
            // and so I win
            // enable start button again for new game
            document.getElementById("start").addEventListener("click", initialize);
            document.getElementById("start").addEventListener("mouseover", buttonOver);
            document.getElementById("start").addEventListener("mouseout", buttonOut);

            // show that the game was is over and that this user wins
            document.getElementById("info").innerHTML = "Game over! You win!"; 
        
            /* clear jails */
            clearJails();
        }  
        else {
            // update the UI
            document.getElementById("info").innerHTML = "Current Player: " + answer.turn;
        }
    }
    else alert("Error determining current player");
   
}

/* HTTP request for the updates that occured during the other client's turn*/
function updateGameBoardXML() {
    var xmlhttp = new XMLHttpRequest(); 
    xmlhttp.onload = updateBoard; 
    xmlhttp.onerror = function () {alert("Error loading game board updates")}; 
    var request = {request:"updateBoard", myID:id}; 
    xmlhttp.open("GET", "http://localhost:8080/?"+queryObjectToString(request)); 
    xmlhttp.send();
}

/* onload function for updateBoard that updates the images in the cell that have
* changed according to the server response. If the jailCount has change, the jail will also be updated.*/
function updateBoard() {
    if (this.status == 200) {
        var answer = JSON.parse(this.responseText);
        // for each cell that needs to be updated
        if (answer.list != {}) {
            for (cell of answer.list) {
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
        // possibly update jail
        // we can only jump over one piece at a time
        if (answer.jailTotal > jailCount) {
            //blackJail hold black pieces
            // incriment jailCount
            jailCount++;
            // if all twelve pieces are jailed, end the game
            if(jailCount>=12){
                gameEnd(); // this will be called by the losing player
            }
            var opponentJail = document.getElementById(userColor+"Jail");
            var elem = document.createElement("img");
            
            var imageName = findImageName(userColor,"regular");
            elem.setAttribute("src", "/images/checkerPieces/"+ imageName);
            opponentJail.appendChild(elem);
            }
        }
    }
}

/* takes cells that are changed from completeMove() as object with fields _0, _1, and _2
 * and send these changes to the server to update the other user, will also update the number jailed */
function endTurnXML(objOfCells) {
    var xmlhttp = new XMLHttpRequest(); 
    xmlhttp.onload = endTurn; 
    xmlhttp.onerror = function () {alert("Error ending turn")}; 
    
    var changedCells = JSON.stringify(objOfCells);

    var request = {request:"endTurn", turn: userColor, cellChanges: changedCells, myID:id, jailTotal: captureCount}; 
    xmlhttp.open("GET", "http://localhost:8080/?"+queryObjectToString(request)); 
    xmlhttp.send();
} 

/* onload for endTurnXML, resets cellSelected and cellJumpedOver for future turns 
* and handles errors from ending turn with server, starts interval for checking currentPlayer again */
function endTurn() {
    if (this.status != 200) {
        alert("Error ending turn");
    }
    else {
        color = "";
        if (userColor == "red") {
            color = "black";
        }
        else {
            color = "red";
        }
        // update UI to show that it is the other players turn
        document.getElementById("info").innerHTML = "Current Player: " + color;

        // click event listener for the forfeit button
        document.getElementById("reset").removeEventListener("click", gameEnd);
        document.getElementById("reset").removeEventListener("mouseover", buttonOver);

        // reset the clients data on cellSelected and cellsJumpedOver
        cellSelected = {};
        cellJumpedOver = {};
        // start interval that calls turnXML again after ensuring that it is clear and we are not creating a new interval
        clearInterval(intervalID);
        intervalID = setInterval(turnUpdate, 1000);
    }
}
