//Developer: Mae Wegbreit, Audrey Dawson, Emmely Rogers
//Date: April 2019
//Description: key functions for figuring out where to move pieces around during the client's turn
//

// array to hold the possible moves from the selected piece
var posMoveArr = [];

//orignal cell clicked
//cell moved to gets added so server can be updated
var cellSelected = [];

// the cell we jump over, keys are added as possible cells to jump over are found, the keys are the cell that the piece would jump to, the value is the cell jumped ce
var cellJumpedOver = {};

// the cells holding my pieces
var myPieces = [];

/* Function to request array of all pieces 
    belonging to current user so they can be enable with click listeners*/
    function piecesToEnable(userColor) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onload =  enablePieces;
        xmlhttp.onerror =  function() { alert("AJAX Object error - PIECESTOENABLE")};
        var request = {request:"arrSingleColor", color:userColor};
        xmlhttp.open("GET", "http://localhost:8080/?"+queryObjectToString(request));
        xmlhttp.send();
    }

    function XMLError() {
        alert("AJAX Object error - SPECIFIC CELL");
    }

    /* Function to activate all user's pieces */
    function enablePieces() {
        myPieces = [];
        if(this.status == 200){
            // the array of cells returned by the user containing all the users pieces
            answer = JSON.parse(this.responseText);
            // save the locations of my cells in myPieces
            myPieces = answer.array;
            for (cell of myPieces) {
                cellElement = document.getElementById(cell.id);
                // attaches click event listeners to each cell in the array
                cellElement.addEventListener('click', possibleMovements);
                cellElement.addEventListener('mouseenter', enter);
                cellElement.addEventListener('mouseleave', exit);   
            }
        }
    }

     /* mouse enter a piece */
     function enter() {
        this.style.border = "1px solid blue";
    }

    /* mouse leave a piece*/
    function exit() {
        this.style.border = "1px solid #dddddd";
    }


    /* clicker listeners for our enabled pieces
    * Function to highlight current cell and all possible movements*/
    /* since we just procured a list of the cells that hold our peices
    *  from the server, we can use id of the cell that is selected to find the cell object that we click on */
   function possibleMovements() {
       // this is the cells id that was clicked
       var id = this.id;
       
       // if there are already items in posMoveArr
       if(posMoveArr.length > 0){
           for(cell of posMoveArr){
               // unhighlight and remove handler
               unHighlight(cell.id);
               disablePieces(posMoveArr, "click", completeMove);
           }
       }

       if (cellSelected.id) {
            unHighlight(cellSelected.id);
       }

       // finds the starting cell from the locations of my peices and saved this object as global variable cellSelected
       cellSelected = myPieces.filter(cell => cell.id === id);
       cellSelected = cellSelected[0];
    
       highlightCell(id, "original");
    
       // assuming we have the information about the cell
       if(cellSelected.type == "regular"){
           regularMovements(id);
       } else if(cellSelected.type == "king"){
           kingMovements(id);  
       }
   }
   
    /* Function to determine possible movements of selected piece */
    function regularMovements(id) {
            switch(userColor) {
                case "black":
                    poss1 = parseInt(id) + 9; // need to send to int 
                    poss2 = parseInt(id) + 11; // then turn back into a string?
                    // assuming this returns cell info

                    valid1 = isOnBoard(poss1);
                    if (valid1) {
                        specificCellXML(valid1, "regular"); 
                    }
                    valid2 = isOnBoard(poss2);
                    if (valid2) {
                        specificCellXML(valid2, "regular");
                    }
                    break;
                case "red":
                    poss1 = parseInt(id) - 9; // need to send to int 
                    poss2 = parseInt(id) - 11; // then turn back into a string?
                    
                    valid1 = isOnBoard(poss1);
                    if (valid1) {
                        specificCellXML(valid1, "regular"); 
                    }
                    valid2 = isOnBoard(poss2);
                    if (valid2) {
                        specificCellXML(valid2, "regular");
                    }
                    break;
                default: 
                    alert("User Color Undefined");
                    break; 
            }   
    }
    
    /* Function to determine possible movements of selected king piece */
    function kingMovements(id) {
            switch(userColor) {
                case "black":
                    var poss1 = parseInt(id) + 9; // need to send to int 
                    var poss2 = parseInt(id) + 11; // then turn back into a string?
                    var poss3 = parseInt(id) - 9;
                    var poss4 = parseInt(id) - 11;
                    // assuming this returns cell info

                    var valid1 = isOnBoard(poss1);
                    if (valid1) {
                        specificCellXML(valid1, "king"); 
                    }
                    var valid2 = isOnBoard(poss2);
                    if (valid2) {
                        specificCellXML(valid2, "king");
                    }

                    var valid3 = isOnBoard(poss3);
                    if (valid3) {
                        specificCellXML(valid3, "king");
                    }

                    var valid4 = isOnBoard(poss4);
                    if (valid4) {
                        specificCellXML(valid4, "king");
                    }
                    break;
                case "red":
                    var poss1 = parseInt(id) - 9; // need to send to int 
                    var poss2 = parseInt(id) - 11; // then turn back into a string?
                    var poss3 = parseInt(id) + 9;
                    var poss4 = parseInt(id) + 11;
                    
                    var valid1 = isOnBoard(poss1);
                    if (valid1) {
                        specificCellXML(valid1, "king"); 
                    }
                    var valid2 = isOnBoard(poss2);
                    if (valid2) {
                        specificCellXML(valid2, "king");
                    }
                    var valid3 = isOnBoard(poss3);
                    if (valid3) {
                        specificCellXML(valid3, "king");
                    }
                    var valid4 = isOnBoard(poss4);
                    if (valid4) {
                        specificCellXML(valid4, "king");
                    }
                    break;
                default: 
                    alert("User Color Undefined");
                    break; 
            }   
    }

     /* checks whether generated id is on the game board, is sent a integer*/
     function isOnBoard(id) {
        var str_id = "";
        if (id > 0 && id < 10) {
            str_id = "0" + id.toString();
        } else {
            str_id = id.toString();
        }
        if (str_id.charAt(0) == "-" || str_id.charAt(0) > 7 || str_id.charAt(1) < 0 || str_id.charAt(1) > 7) {
            return false;
        } else if (str_id.charAt(0) == "-") {
            return false;
        } else {
            return str_id;
        }
    }

      /* Function to request information about a specific cell object*/
      function specificCellXML(cellID, type){  
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onload =  function() {
            if (type == "regular") {
                regCellProcess(this); 
            }
            else {
                kingProcess(this);
            }
        }
        xmlhttp.onerror = XMLError;
        var request = {request:"pieceInfo", id:cellID};
        xmlhttp.open("GET", "http://localhost:8080/?"+queryObjectToString(request));
        xmlhttp.send(); 
    }


    /* if the original piece is a regular piece, this will determine the validity of the possible moves */
    function regCellProcess(res) { 
        if(res.status == 200){
            // the array of cells returned by the user containing all the users pieces
            cell = JSON.parse(res.responseText);
            if (cell.type == 'none') {
                posMoveArr.push(cell);
                enableMoveHandler(cell); // enable the move handler for the cell
            }
            else if (cell.color != userColor) {
                var change = cell.id - cellSelected.id; // should replicate the direction moved previously
                if (change <= 11 && change >= -11) {
                    var newId = parseInt(cell.id) + change;


                    newId = isOnBoard(newId);
                    if (newId) {
                        specificCellXML(newId, "regular"); 
                         // the cell that we could jump over for future reference when sending info to the server with key as the cell id that we could jump to
                        cellJumpedOver[newId] = cell;
                    }      
                }
            }
        }
    }
    /* if the original piece is a regular piece, this will determine the validity of the possible moves */
    function kingProcess(res) {
        if(res.status == 200){
            // the array of cells returned by the user containing all the users pieces
            cell = JSON.parse(res.responseText);
            if (cell.type == 'none') {
                posMoveArr.push(cell);
                enableMoveHandler(cell); // enable the move handler for the cell
            }
            else if (cell.color != userColor) {
                var change = cell.id - cellSelected.id; // should replicate the direction moved previously
                if (change <= 11 && change >= -11) {
                    var newId = parseInt(cell.id) + change;


                    newId = isOnBoard(newId);
                    if (newId) {
                        specificCellXML(newId, "king"); 
                         // the cell that we could jump over for future reference when sending info to the server with key as the cell id that we could jump to
                        cellJumpedOver[newId] = cell;
                    }      
                }
            }
        }
    }
  
    /* Function to enable movement of selected piece in specified cell*/
    function enableMoveHandler(cell){
        highlightCell(cell.id, "possible");
        document.getElementById(cell.id).addEventListener('click', completeMove);  
    }
    
    
    /* function for finding the correct image name based on the piece information */
    function findImageName(color, type) {
        var imageName = "";
        switch (color) {
            case "black":
            imageName = black[type];
            break;
            case "red":
            imageName = red[type];
            break;
            default:
            imageName = false;
            break;
        }
        return imageName;
    }

    /* function called when the play selects a cell to move to
     * this will generate a list of the updated cells and get sent to endTurnXML()
     * event listeners are removed and the periodic polling for currentTurn is restarted
     * the UI will also update the jail is a piece was captured
     */
    function completeMove() {
        // this is the cell that we are moving to, the cell we click on
        var cellToMoveTo = {};
        cellToMoveTo.id = this.id;
        // update the cell to move toos color and type
        cellToMoveTo.color = userColor;

        var kingSpaces = ["01", "03", "05", "07", "70", "72", "74", "76"];
        // if not -1, then it is a king space
        if (kingSpaces.indexOf(cellToMoveTo.id) != -1) {
            cellToMoveTo.type = "king";
        } else {
            cellToMoveTo.type = cellSelected.type;
        }

        // determine the image to place in the new space
        urlString = findImageName(userColor, cellToMoveTo.type);

         // UPDATE NEW CELL UI and VALUES to send to SERVER
         if (urlString) {
        document.getElementById(cellToMoveTo.id).innerHTML = "<img src='/images/checkerPieces/" + urlString + "'></img>";
         }

        // UPDATE ORIGINAL CELL UI and VALUES to send to SERVER
        unHighlight(cellSelected.id);
        document.getElementById(cellSelected.id).innerHTML = "";
        // update the cell we are moving from
        cellSelected.color = "none";
        cellSelected.type = "none";

         // DETECT IF WE JUMPED OVER A PIECE by using the id of our new cell to detect a cell we jumped over
         var cellCaptured = cellJumpedOver[cellToMoveTo.id]; 
         
         var cellsUpdated = [];
         // edits the cell object, adds it to the jail, removee from board
         if (cellCaptured != undefined) {
            document.getElementById(cellCaptured.id).innerHTML = "";

            // add captured piece to jail
            var color = "";
            if (userColor == "black") {
                color = "red";
            } else {
                color = "black";
            }

            /* add cell to the opponentsJail */
            var opponentJail = document.getElementById(color+"Jail");
            var elem = document.createElement("img");
            var imageName = findImageName(color,"regular");
            elem.setAttribute("src", "/images/checkerPieces/"+ imageName);
            opponentJail.appendChild(elem);

            //update the cell with the capture piece
             cellCaptured.color = "none";
             cellCaptured.type = "none";
 
             // update the number of pieces that we have captures
             captureCount++;

            // list of updated cells for the server to update in endTurnXML
            // includes the cell we moved from, the one we moved to, and cell we jumped over
             var cellsUpdated = { _0: cellSelected, _1: cellToMoveTo, _2: cellCaptured};
         }
         else {
            // list of updated cells for the server to update in endTurnXML
            // includes the cell we moved from, the one we moved to.
            // we did not jump over a cell in this case
             var cellsUpdated = { _0: cellSelected, _1: cellToMoveTo, _2: {}};
         }
         
        for(cell of posMoveArr){
            unHighlight(cell.id);
        }

        disablePieces(posMoveArr, "click", completeMove);
        disablePieces(myPieces, "click", possibleMovements);
        disablePieces(myPieces, "mouseenter", enter);
        disablePieces(myPieces, "mouseleave", exit);
        
        // ends turn
        endTurnXML(cellsUpdated);
    }
    
    
    /* Function to highlight specified cell */
    function highlightCell(id, cellType){
        cell = document.getElementById(id);
        if(cellType == "original"){
            cell.style.backgroundColor = "mediumseagreen";
        } else {
            cell.style.backgroundColor = "darkseagreen";
        }
        
    }
    
    /* Function to unhighlight specified cell */
    function unHighlight(id){
        cell = document.getElementById(id);
        cell.style.backgroundColor =  "forestgreen";
    }
    
    /* Funcrion to disable event handler for many cells */
    function disablePieces(pieceArr, event, func){
        for(cell of pieceArr){
            document.getElementById(cell.id).removeEventListener(event, func);
        }
    }
    