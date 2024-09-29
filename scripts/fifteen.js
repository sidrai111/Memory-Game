/** effort/time tracking notes (for self ref so i dont forget)
 * base game func - nov 25, 3pm? to 11:30pm mainly - mc
 * 
*/

/** TODO: 
 * game end behavior - homeArr is kept as constant for comparison
 * Animations
 * Game Timer w/ music - could be tied to shuffle handler
 * puzzle size options - funcs made to be flexible, so homeArr *ideally* should be the only part to be modified
 *      - consider multiple css files for each size to map image onto tiles correctly?
 * cheat - some sort w/ adjacency in mind
 * multiple tile shift - extension of neighbor check to check all tiles in row/column for empty cell
*/


/**
 * constant array for game completion comparison
 * can be converted to accomodate other puzzle sizes, but working with 15/16 as base
*/
const homeArr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];
let tileArr = homeArr;  //array to be shuffled
var gameStarted = false;

//setting up timer variables to be used with several functions
var timer;
var seconds = 0;
var minutes = 0;

//setting up music
var music = new Audio('./music/music.mp3');
music.loop = true;
let firstShuffle = false;

//setting up moves counter
var counter = 0;

//set starting background
const allBackgrounds = ["background1", "background2", "background3", "background4"];
let backgrounds = allBackgrounds;
var background;

/**
 * creates table of 16 cells for gameboard
 * each cell (except 16th) contains tile div
 */
function createGameBoard(gArr) {
    console.log("createGameBoard called");

    const board = document.getElementById("board");
    while (board.lastChild) {
        board.removeChild(board.lastChild);
    }

    const gameSize = gArr.length;
    const nRows = Math.floor(Math.sqrt(gameSize));
    const nRowCells = nRows;
    const gTable = document.createElement("table");
    gTable.classList.add("pTable");
    const gBody = gTable.createTBody();
    gBody.classList.add("pBody");

    for (let i = 0; i < nRows; i++) {
        const gRow = gBody.insertRow();
        gRow.classList.add("pRow");

        for (let j = 0; j < nRowCells; j++) {
            const gCell = gRow.insertCell();
            gCell.classList.add("pCell");

            const tileNum = gArr[i * nRowCells + j];
            if (tileNum != 0) {
                gCell.innerHTML = '<div id="t' + tileNum + '" class="tile '+ background + '" style="left:' + (j * 100) + 'px; top:' + (i * 100) + 'px;" title="' + (i * nRowCells + j) + '"> <div class="tileNum">' + tileNum + '</div></div>';
            } else {
                gCell.classList.add("empty");
            }
        }
    }
    board.appendChild(gTable);
    if(gameStarted){
        addGameHandlers();
    }
}

/**
 * changes bg image
 */
function changeBackground() {
    console.log("changeBackground called");
    var select = document.getElementById("backgroundSelect");
    var selectedBackground = select.options[select.selectedIndex].value;
    background = selectedBackground;

    var tiles = document.querySelectorAll(".tile");

    for (var i = 0; i < tiles.length; i++) {
        tiles[i].classList.replace("background1", selectedBackground);
        tiles[i].classList.replace("background2", selectedBackground);
        tiles[i].classList.replace("background3", selectedBackground);
        tiles[i].classList.replace("background4", selectedBackground);
    }
}

/**selects random bg on initialization */
function randomBack(){
    //randomizing index
    let rand = Math.random() * (5 - 1) + 1;
    let index = Math.floor(rand) - 1;
    return backgrounds[index];
}

/**
 * sets up timer
 */
function setTimer(){
    console.log("setTimer called");
    //clear any existing timer on start
    clearInterval(timer);
    seconds = 0;
    timer = setInterval(getSeconds, 1000);
}

/**
 * prints current time to page from inside setTimer function
 */
function getSeconds(){
    //console.log("getSeconds called");
    seconds++;
    document.getElementById("timer").innerText = seconds;
}

/**
 * stops timer
 */
function stopTimer() {
    console.log("stopTimer called");
    clearInterval(timer);
}

/**
 * handles behavior when puzzle is finished
 */
function endGame(){
    console.log("END GAME CALLED")
    stopTimer();
    winNotification();
    
    let bestScores = getBestScores();
    let newBestTime = !bestScores.bestTime || seconds < parseInt(bestScores.bestTime);
    let newBestMoves = !bestScores.bestMoves || counter < parseInt(bestScores.bestMoves);

    if (newBestTime || newBestMoves) {
        saveBestScores(newBestTime ? seconds : bestScores.bestTime, newBestMoves ? counter : bestScores.bestMoves);
        updateBestScoresDisplay();
    }
	winNotification();
}



/**
 * checks if puzzle is solved
 * @returns 
 */
function checkFinish(){
    console.log("checkFinish called");
    var tempTileArr = document.querySelectorAll(".tile"); //gets the number on each card
    for (var i = 0; i <= tempTileArr.length - 1; i++) {

        //manipulating id's and titles to get proper placement comparison
        let tileID = tempTileArr[i].getAttribute("id");
        let titleNum = parseInt(tempTileArr[i].getAttribute("title")) + 1;
        let tileTitle = "t" + titleNum.toString();

        // console.log("CHECKF tileID = " + tileID);
        // console.log("CHECKF tileTitle = " + tileTitle);

        //if number not in order, return false (not solved)
        if (tileID != tileTitle) {
            //console.log("CHECKF inside if false");
          return false;
        }
      }
      //console.log("CHECKF outside loop, return true");
      return true;
}

/**
 * sets up moves counter
 */
function setMoves(){
    //console.log("setMoves called");
    counter++;
    document.getElementById("moves").innerText = counter;
}

/**
 * saves best time & moves to local storage
 * @param {*} time 
 * @param {*} moves 
 */
function saveBestScores(time, moves) {
    console.log("saveBestScores called");
    localStorage.setItem('bestTime', time);
    localStorage.setItem('bestMoves', moves);
}
/**
 * 
 * @returns gets best time & retrieves from local storage
 */
function getBestScores() {
    console.log("getBestScores called");
    return {
        bestTime: localStorage.getItem('bestTime'),
        bestMoves: localStorage.getItem('bestMoves')
    };
}

/**
 * updates score display
 */
function updateBestScoresDisplay() {
    console.log("updateBestScoresDisplay called");
    let bestScores = getBestScores();

    document.getElementById('bestTime').textContent = bestScores.bestTime ? bestScores.bestTime + ' seconds' : '0';
    document.getElementById('bestMoves').textContent = bestScores.bestMoves ? bestScores.bestMoves + ' moves' : '0';
}

/**
 * DEBUG FUNCTION: clears local storage for leaderboard
 */
function clearAllLocalStorage() {
    console.log("cleared local storage");
    localStorage.clear();
}

/**
 * stops timer
 */
function stopTimer() {
    console.log("timer interval cleared");
    clearInterval(timer);
}

/**
 * Injects win message in designated banner
 */
function winNotification(){
    console.log("winNotification called");
    document.querySelector('.winBanner').style.display = 'block'; //changing the banner display to be revealed
    document.getElementById("winMessage").innerHTML = "Congratulations! You solved it!<br>Have a cookie!";
}

/** handles shuffle btn click */
function handleShuffle(){
    console.log("handleShuffle called");
    gameStarted = true;
    tileArr = shuffle(tileArr);
	tileArr = makePuzzleSolvable(tileArr);
    createGameBoard(tileArr);
    setTimer();

    //only play music on first shuffle
    if (!firstShuffle) {
        music.play();
        setTimer();
        firstShuffle = true;
    }

    let tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.classList.add('shaking');
    });

    setTimeout(() => {
        tiles.forEach(tile => {
            tile.classList.remove('shaking');
        });
    }, 800);
}
/** shuffles given array and returns shuffled array */
function shuffle(gArr){
    console.log("shuffle called");
    var currIndex = gArr.length, tmpVal, rndIndex;

    while(currIndex !== 0){
        rndIndex = Math.floor(Math.random() * currIndex);
        currIndex -= 1;
        tmpVal = gArr[currIndex];
        gArr[currIndex] = gArr[rndIndex];
        gArr[rndIndex] = tmpVal;
    }
    return gArr;
}

/**
 * counts the number of inversions in the shuffled array
 * @param {*} gArr 
 * @returns # of inversions detected in array
 */
function countInversions(gArr) {
    var inversions = 0;
    for (var i = 0; i < gArr.length - 1; i++) {
        for (var j = i + 1; j < gArr.length; j++) {
            if (gArr[i] > gArr[j] && gArr[i] !== 0 && gArr[j] !== 0) {
                inversions++;
            }
        }
    }
    return inversions;
}

/**
 * checks if puzzle is solvable
 * @param {*} gArr 
 * @returns 
 */
function isPuzzleSolvable(gArr) {
	//counts inversions
    var inversions = countInversions(gArr);
	//calculates width 3x3, 4x4, etc
    var width = Math.sqrt(gArr.length);
	//finds index of emtpy tile
    var emptyTileIndex = gArr.indexOf(0);
    console.log("emptyTileIndex = " + emptyTileIndex);

    // Determine row number from the bottom
    var rowNumber = Math.floor((gArr.length - emptyTileIndex - 1) / width) + 1;

    //if odd sized puzzle
    if (width % 2 != 0) {
        
        //return solveable if even inversion
        if(inversions % 2 == 0){
            return true;
        } else{
            return false;
        }
    } 
    
    //else even sized puzzle
    else {
        
        //if empty tile in an even row from the bottom
        if (rowNumber % 2 == 0) {
            //if inversions odd, return true
            if(inversions %2 != 0) {
                return true;
            } else{
                return false;
            }
        
        } else { //else empty tile in an odd row from the bottom

            //return true if inversions even
            if (inversions % 2 == 0){
                return true;
            } else {
                false;
            }
        }
    }
}


/**
 * if shuffled puzzle is unsolvable it changes the first two elements non-empty to make it solvable
 * @param {*} gArr 
 * @returns modified solvable array
 */
function makePuzzleSolvable(gArr) {
    console.log("makePuzzleSolvable called");
    let i = 0; 
    while (!isPuzzleSolvable(gArr)) {
        //swap the first pair of elements to change the number of inversions
        var tmpVal = gArr[i];
        gArr[i] = gArr[i+1];
        gArr[i+1] = tmpVal;

        //do same with next pair if that was ineffective
        i+=2;
    }
	return gArr;

    //modified array is now solvable
}


/**identifies movable tile and toggles class for css */
function handleHover(){
    console.log("handleHover called");
    currIndex=parseInt(this.title);
    
    var nRowCells = Math.sqrt(tileArr.length); console.log("cells per row: " + nRowCells);

    /** checks each neighbor
     * TODO: merge with findEmptyNeighbor func if possible
     */
    emptyNeighbor = false; console.log("init val " +emptyNeighbor);
    if((currIndex + 1) % nRowCells != 1){   //if not on left side
        console.log("checking left " + currIndex);
        if(tileArr[currIndex-1] == 0){
            emptyNeighbor = true;
            console.log("left empty");
        }
    }
    if((currIndex + 1) % nRowCells != 0){   //if not on right side
        console.log("checking right " + (currIndex + 1));
        if(tileArr[currIndex + 1] == 0){
            emptyNeighbor = true;
            console.log("right empty");
        }
    }
    if((currIndex + 1) - nRowCells > 0){    //if not on top row
        console.log("checking top");
        if(tileArr[currIndex - nRowCells] == 0){
            emptyNeighbor = true;
            console.log("top empty");
        }
    }
    if((currIndex + 1) + nRowCells <= 16){  //if not on bottom row
        console.log("checking bot");
        if(tileArr[currIndex + nRowCells] == 0){
            emptyNeighbor = true;
            console.log("bottom empty ");
        }
    }
    if(emptyNeighbor == true){this.classList.toggle("movablePiece")};
}

/**moves tile to empty space */
function handleClick(){
    console.log("handleClick called");  //debug
    //this.classList.remove("movablePiece");
    this.classList.add("moveAnimation");
    currIndex=parseInt(this.title);
    emptyNeighborIndex = findEmptyNeighbor(currIndex); console.log(emptyNeighborIndex);
    if(emptyNeighborIndex != -1){
        tileArr[emptyNeighborIndex] = tileArr[currIndex];
        tileArr[currIndex] = 0;
        //console.log(this.parentNode);
        currParentNode = this.parentNode;
        targetParentNode = document.getElementsByClassName("empty")[0];
        targetParentNode.classList.remove("empty");
        currParentNode.classList.add("empty");
        currParentNode.removeChild(this);
        targetParentNode.appendChild(this);
        this.title = emptyNeighborIndex;
        targetParentNode.title = currIndex;
        setMoves();
        if (checkFinish()){
            endGame();
        }
    }
}

/**returns index of empty neighbor if one is found, else returns -1 */
function findEmptyNeighbor(currIndex){
    console.log("findEmptyNeighbor called");
    var nRowCells = Math.sqrt(tileArr.length);

    /** checks each neighbor */
    if((currIndex + 1) % nRowCells != 1){   //if not on left side
        console.log("checking left " + currIndex);
        if(tileArr[currIndex-1] == 0){
            console.log("left empty");
            return currIndex - 1;
        }
    }
    if((currIndex + 1) % nRowCells != 0){   //if not on right side
        console.log("checking right " + (currIndex + 1));
        if(tileArr[currIndex + 1] == 0){
            console.log("right empty");
            return currIndex + 1;
        }
    }
    if((currIndex + 1) - nRowCells > 0){    //if not on top row
        console.log("checking top " + (currIndex - nRowCells));
        if(tileArr[currIndex - nRowCells] == 0){
            console.log("top empty");
            return currIndex - nRowCells;
        }
    }
    if((currIndex + 1) + nRowCells <= 16){  //if not on bottom row
        console.log("checking bot " + (currIndex + nRowCells));
        if(tileArr[currIndex + nRowCells] == 0){
            console.log("bottom empty ");
            return currIndex + nRowCells;
        }
    }
    return -1;  //-1 = no empty neighbor
}

window.onload=function(){
    background = randomBack();
    createGameBoard(tileArr);   //initializes board on load in correct order; TODO: lock board before game start
    updateBestScoresDisplay();

}

/** adds event listeners on tiles for mouseover and mouseout (hover), click */
function addGameHandlers(){
    console.log("addGameHandlers called");
    var tileElemArr = document.querySelectorAll(".tile");
    for(var i = 0; i < tileElemArr.length; i++){
        tileElemArr[i].addEventListener('mouseover', handleHover);
        tileElemArr[i].addEventListener('mouseout', handleHover);
        tileElemArr[i].addEventListener('click', handleClick);
    }
}
