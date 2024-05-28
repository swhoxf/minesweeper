// minesweeper.js
let map = [];
let playerViewMap = [];
let numFlagsLeft = 10;
let gameInSession = false;
let isGameOver = false;
let isGameWon = false;
let timeElapsed = 0; // in seconds
let isTimerStarted = false;
let timer = setInterval(updateTimer, 1000); // update time every second (even if the timer doesn't display it)

// functionalities to add
// - right click toggles flag and question

// start timer
function startTimer() {
  isTimerStarted = true;
  timeElapsed = 0;
}

// stop timer
function stopTimer() {
  isTimerStarted = false;
}

// timer updates every second 
function updateTimer() {
  // timer keeps ticking every second after player clicks first cell
  if (isTimerStarted && !isGameOver && !isGameWon) {
    timeElapsed += 1;
    let minutes = Math.floor(timeElapsed / 60);
    let minuteString = minutes.toLocaleString("en-US", {minimumIntegerDigits: 2, useGrouping: false});
    let secondString = (timeElapsed - (minutes * 60)).toLocaleString("en-US", {minimumIntegerDigits: 2, useGrouping: false});
    document.getElementById('timer').innerHTML = `${minuteString}\:${secondString}`;
  }
}

// returns 2D array containing false for a bomb cell and true for a safe cell
function createBombs() {
  let bombIndexes = [];
  let boolMap = new Array(100).fill(false);
  let finalMap = new Array(10);
  for (let i = 0; i < 10; i++) {
    finalMap[i] = [false, false, false, false, false, false, false, false, false, false];
  }
  let bombIndex = 0;
  // find 10 discrete random integers
  while (bombIndex < 10) {
    // find random integer from 0 to 99 inclusive
    let num = Math.floor(Math.random() * 100) + 0;
    if (bombIndexes.includes(num)) {
      continue;
    } else {
      bombIndexes.push(num);
      bombIndex += 1;
    }
  }
  // for each of 10 discrete random integers, 
  // change boolean at each index of flat map to true to indicate bomb
  for (i = 0; i < 10; i++) {
    let index = bombIndexes[i];
    boolMap[index] = true;
  }
  // make new 2D array
  // return 2D array
  for (i = 0; i < 100; i++) {
    let row = Math.floor(i / 10);
    let col = i % 10;
    if (boolMap[i]) {
      finalMap[row][col] = true;
    } 
  }
  return finalMap;
}

// returns number of bombs surrounding a cell
function getNumSurBombs(boolMap, surIndexes) {
  let numBombs = 0;
  let validSurIndexes = getValidIndexes(surIndexes);

  // check each surrounding cell for bomb
  for (let i = 0; i < validSurIndexes.length; i++) {
    let cell = validSurIndexes[i]
    let row = cell[0];
    let col = cell[1];

    // if the surrounding cell is a bomb increase bomb count
    if (boolMap[row][col]) {
      numBombs++;
    }
  }
  return numBombs;
}

function getValidIndexes(surIndexes) {
  let validSurIndexes = [];
  for (let i = 0; i < 8; i++) {
    let cell = surIndexes[i]
    let row = cell[0];
    let col = cell[1];
    // if not out of bounds
    if (row > -1 && row < 10) {
      // if not out of bounds
      if (col > -1 && col < 10) {
        validSurIndexes.push([row, col]);
      }
    }
  }
  return validSurIndexes;
}

// returns array with bombs marked as -1, safe cells marked with num of bombs surrounding it
function createIntCells(boolMap) {
  let intMap = new Array(10)
  for (let i = 0; i < 10; i++) {
    intMap[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  // iterate through all cells in boolMap
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      // indexes of cells surrounding current cell
      let tl = [i-1, j-1];
      let tc = [i-1, j];
      let tr = [i-1, j+1];
      let ml = [i, j-1];
      let mr = [i, j+1];
      let bl = [i+1, j-1];
      let bc = [i+1, j];
      let br = [i+1, j+1];
      let surIndexes = [tl, tc, tr, ml, mr, bl, bc, br];
      // mark bomb cell with -1
      if (boolMap[i][j]) {
        intMap[i][j] = -1;
      } else { // mark safe cell with num bombs surrounding it
        // change int in current cell to number of bombs surrounding it
        intMap[i][j] = getNumSurBombs(boolMap, surIndexes);
      }
    }
  }
  return intMap;
}

function createBtnCells(intMap) {
  let cellMap = [];
  for (let i = 0; i < 10; i++) {
    cellMap.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      // check if there already are buttons
      const cell = document.createElement("BUTTON");
      // cell.innerHTML = intMap[i][j].toString();
      cell.addEventListener("click", function() {
        clickCell(cell);
      });
      cell.addEventListener("contextmenu", function(ev) {
        ev.preventDefault();
        rightClickCell(cell);
        return false;
      }, false);
      cell.setAttribute("row", i.toString());
      cell.setAttribute("col", j.toString());

      console.log("possibly did this...");
      console.log(typeof(i));
      //console.log(intToString(intMap[i][j]));
      cell.classList.add(intToString(intMap[i][j]));
      document.getElementById("game-frame").appendChild(cell);
      cellMap[i][j] = cell;
    }
  }
  return cellMap;
}

// returns array describing location of bomb cells and safe cells as ints
function createNewMap() {
  // create array with locations of bombs (true = bomb, false = safe)
  let boolMap = createBombs();
  // create array with number of bombs near by (1 if cell is surrounded by 1 bomb, 2 if by 2, etc.)
  let intMap = createIntCells(boolMap);
  // create array with cells 
  let cellMap = createBtnCells(intMap);
  return cellMap;
}

// prints 2D array to console 
function printArray2D(arr, rows) {
  for (let i = 0; i < rows; i++) {
    console.log("row " + i + ": ");
    console.log(arr[i]);
  }
}

// returns string representation of integer array representing game board state
function intToString(i) {
  switch (i) {
    case (-1): 
      return "bomb";
      break;
    case (0):
      return "zero";
      break;
    case (1): 
      return "one";
      break;
    case (2):
      return "two";
      break;
    case (3):
      return "three";
      break;
    case (4):
      return "four";
      break;
    case (5):
      return "five";
      break;
    case (6):
      return "six";
      break;
    case (7):
      return "seven";
      break;
    case (8):
      return "eight";
      break;
    default:
      break;
  }
}

function stringToInt(str) {
  switch (str) {
    case ('one'): 
      return 1;
      break;
    case ('two'):
      return 2;
      break;
    case ('three'):
      return 3;
      break;
    case ('four'):
      return 4;
      break;
    case ('five'):
      return 5;
      break;
    case ('six'):
      return 6;
      break;
    case ('seven'):
      return 7;
      break;
    case ('eight'):
      return 8;
      break;
    default: 
      break;
  }
}

// reveals safe cells surrounding current cell 
function revealNearbySafeCells(cell) {
  // if the cell clicked is empty, reveal it
  // if its nearby cells are empty, reveal them
  // stop once you reveal the first layer of int cells
  if (cell.classList.contains("bomb")) {
    return;
  } else if (cell.classList.contains("flagged")) {
    return;
  } else if (cell.classList.contains("zero")) {
    cell.classList.add("revealedEmpty");
    let r = Number(cell.getAttribute("row"));
    let c = Number(cell.getAttribute("col"));
    let tl = [r-1, c-1];
    let tc = [r-1, c];
    let tr = [r-1, c+1];
    let ml = [r, c-1];
    let mr = [r, c+1];
    let bl = [r+1, c-1];
    let bc = [r+1, c];
    let br = [r+1, c+1];
    let surIndexes = [tl, tc, tr, ml, mr, bl, bc, br];
    let validSurIndexes = getValidIndexes(surIndexes);
    printArray2D(surIndexes, 10);
    for (let i = 0; i < validSurIndexes.length; i++) {
      let row = validSurIndexes[i][0];
      let col = validSurIndexes[i][1];
      if (map[row][col].classList.contains("revealedEmpty")) {
        continue;
      } else {
        revealNearbySafeCells(map[row][col]);
      }
    }
  } else {
    cell.classList.add("revealedInt");
    cell.innerHTML = stringToInt(cell.classList[0]);
    return;
  }
  return;
}

function checkGameWon() {
  if (numFlagsLeft == 0) { // check if all flags have been used
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (map[i][j].classList.contains("bomb")) { // check each bomb tile
          if (!map[i][j].classList.contains("flagged")) { // if any bomb tile is not flagged, return false
            return false;
          }
        } 
      }
    }
  } else { // if not all flags have been used, then check if all safe tiles have been clicked
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (Number(map[i][j].innerHTML) > -1) { // check each safe tile
          if (!(map[i][j].classList.contains("revealedEmpty") || map[i][j].classList.contains("revealedEmpty"))) { // if any safe tile is not revealed, return false
            return false;
          }
        } 
      }
    }
  } // all flags have been used and all bomb tiles have been flagged
  return true;
}

function createBombElement() {
  let bombElem = document.createElement('img');
  bombElem.src = './assets/bomb-solid.svg';
  bombElem.classList.add('small-icon');
  return bombElem;
}

function clickCell(cell) {
  if (!isGameOver && !isGameWon) {
    if (!isTimerStarted) {
      startTimer();
    }

    if (!cell.classList.contains("flagged")) {
      if (cell.classList.contains("bomb")) {
        cell.classList.add("revealedBomb");
        cell.appendChild(createBombElement());
        gameLostAction();
      } else if (cell.classList.contains('zero')) {
        revealNearbySafeCells(cell);
      } else {
        cell.classList.add("revealedInt");
        cell.innerHTML = stringToInt(cell.classList[0]);
        if (checkGameWon()) {
          gameWonAction();
        }
      }
    }
  }
}

function gameWonAction() {
  gameWonMsg = "You Won!";
  let messageElement = document.getElementById('game-msg');
  messageElement.classList.add('game-won-msg');
  messageElement.innerHTML = gameWonMsg;
  isGameWon = true;
  stopTimer();
}

function gameLostAction() {
  isGameOver = true;
  gameOverMsg = "Game Over!";
  let messageElement = document.getElementById('game-msg');
  messageElement.classList.add('game-over-msg');
  messageElement.innerHTML = gameOverMsg;
  stopTimer();
}

// adds flag to cell
function createFlagElement() {
  let flagImg = document.createElement('img');
  flagImg.src = './assets/flag-solid.svg';
  flagImg.classList.add('small-icon');
  return flagImg;
}

// removes flag from cell
function removeFlagElement(cell) {
  cell.removeChild(cell.firstChild);
}

// toggle flag appearing when you right click an unrevealed cell
function rightClickCell(cell) {
  if (!isGameOver && !isGameWon) {
    if (numFlagsLeft > 0 && !cell.classList.contains("revealedInt") 
    && !cell.classList.contains("revealedEmpty")
    && !cell.classList.contains("revealedBomb")
    && !cell.classList.contains("flagged")) {
    cell.classList.add("flagged");
    cell.appendChild(createFlagElement())
    numFlagsLeft--;
    if (checkGameWon()) {
      gameWonAction();
      }
    } else if (cell.classList.contains("flagged")) {
      numFlagsLeft++;
      cell.classList.remove("flagged");
      removeFlagElement(cell);
    }
    document.getElementById("flags-left").innerHTML = numFlagsLeft.toString() + " flags left";
  }
}

// initializes state of map
function init() {
  map = createNewMap();
  printArray2D(map, 10);
  numFlagsLeft = 10;
  gameInSession = true;
  isGameOver = false;
  document.getElementById("flags-left").innerHTML = "10 flags left";
  document.getElementById('game-msg').innerHTML = '';
  timeElapsed = 0;
  document.getElementById('timer').innerHTML = '00:00';
  isTimerStarted = false;
}

function main() {
  if (gameInSession) {
    board = document.getElementById("game-frame");
    while (board.lastChild) {
      board.removeChild(board.lastChild);
    }
    if (isGameOver) {
      isGameOver = false;
    }
    if (isGameWon) {
      isGameWon = false;
    }
  } 
  gameInSession = true;
  init();
}