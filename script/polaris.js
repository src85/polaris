/* 
Context for Polaris -- conversion of TetrisSP (C) to Javascript/Canvas 
for WDP Project WS17/18 FH Hagenberg BB SE 
from Sebastian Spanner S1610307038 
created 2018-01-02 17:30 
-- thanks to --

-- for ideas, clues, references --
*/

// the polaris grid
var grid = [];

// game states 
var inGame;
var paused = false;
var gameOver = false;
var fastLabel = false; // no state, just to find out whether this is put up on boardcontext

// game time
var maxTick = 1200;
var tickInterval = maxTick; // 1,2 sec at start

// prepare tetroids 
var tetroid = null;
var nextTetroid = null;

// score-relevant variables
var linesCleared = 0;
var level = 1;
var score = 0;

// get DOM elements to edit while playing
var main = getE("main");
var left = getE("left");
var right = getE("right");

var board = getE("board"); 
var boardContext = board.getContext("2d"); // for canvas drawing 
var preview = getE("preview");
var previewContext = preview.getContext("2d"); // for canvas drawing 

function resizeBoard () {
  let height = window.innerHeight - 150;
  board.style.height = height + 'px';
  let width = Math.floor(height / 2);
  board.style.width = width + 'px';
  left.style.width = (width + 15) + 'px';
}

function resizeNext () {
  let height = 0;
  let width = 0;
}

window.onresize = resizeBoard; 
// window.onresize = resizeNext;

// text labels 
var levelLabel = getE("level");
var pauseLabel = getE("pause");
var rowLabel = getE("rows"); 
var scoreLabel = getE("score");
var stateLabel = getE("state");

function clearBoard() {
  for (let i = 0; i < gameInfo.width; i++) {
    for (let j = 0; j < gameInfo.height; j++) {
      boardContext.fillStyle = "White";
      boardContext.fillRect(0, 0, i, j);
    }
  }
}

function drawPreview () {
  if(nextTetroid === null || !dirty.preview) return;
  let resizeFactor = 5;
  previewContext.strokeStyle = tetroidColors[0];
  previewContext.fillStyle = nextTetroid.color;

  let prevWidth = preview.clientWidth;
  let prevHeight = preview.clientHeight;
  let blockWidth = Math.floor(prevWidth / gameInfo.width) * resizeFactor;
  let blockHeight = Math.floor(prevHeight / gameInfo.height) * resizeFactor;

  let currX, currY;
  if(nextTetroid.size === 2) {
    currX = 60; currY = 30;
  } else if (nextTetroid.size === 3) {
    currX = 35; currY = 35;
  } else if (nextTetroid.size === 4) {
    currX = 20; currY = 45;
  }

  let j = 1;
  let k = 0;
  for(let i = 0; i < nextTetroid.shape.length; i++) {
      if(nextTetroid.shape[i] === 1) {
        previewContext.fillRect(blockWidth * (k + 1) + currX, nextTetroid.y + blockHeight * j + currY, blockWidth, blockHeight);
        previewContext.strokeRect(blockWidth * (k + 1) + currX, nextTetroid.y + blockHeight * j + currY, blockWidth, blockHeight);
      }
      k++
      if(k % 4 === 0) {
        j++;
        k = 0;
      } 
  }
  dirty.preview = false;
}

function initializeGrid () {
  for(let y = 0; y < gameInfo.height; y++) {
      grid[y] = [];
      for(let x = 0; x < gameInfo.width; x++) {
          grid[y][x] = 0;
      }
  }
}

function initGame () {
    initializeGrid();
    nextTetroid = new createTetroid();
}

function getFaster () { // get faster each level 
  if (paused || !inGame || gameOver) { return; } // gate keeper 
		if(level < 10 && tickInterval >= 200) { // 200 is impossibly fast already 
      tickInterval -= 200; 
      setLabel(state, "SCHNELLER!");
      show(state);
      fastLabel = true;
	} else {
    if(fastLabel) { // remove fastLabel if displayed  
        setLabel(state, "");
        hide(state);
  			fastLabel = false;
	  }
  }
}

function dropTetroid () {  
  
  getFaster(); // check if faster is on 
  
  if (tetroid === null) {
    // create tetroid 
    tetroid = nextTetroid;
    nextTetroid = new createTetroid();
    drawPreview();
  }
  else {
    // created tetroid is falling 
    // when falling has ended, create a new tetroid 
		
    let dropPossible = true;
    for (let i = 0; i < gameInfo.brickCount; i++) {
      let fall = tetroid.y + 1;
      if (fall > gameInfo.height) { dropPossible = false; }
      if (grid[tetroid.x][fall]) { dropPossible = false; }
    }

    if (dropPossible) {
      for (let i = 0; i < gameInfo.brickCount; i++) {
        tetroid.y += 1;
      }
    }
    else {
      for (let i = 0; i < gameInfo.brickCount; i++) {
        grid[tetroid.x][tetroid.y] = true;
      }
      tetroid = null;
	  
      // look if rows have been completed 
      for (let y = 0; y < gameInfo.height; y++) {
        let isRow = true;
        for (let x = 0; x < gameInfo.width; x++) {
          if (!grid[y][x]) { isRow = false; }
        }
        if (isRow) {
          // clear completed row - rows count more each level 
          // maximal level 10 
          linesCleared += (1 * level);
          if (level < 10 && linesCleared >= (10 * level)) {
            level += 1;
            getFaster();
            setLabel(levelLabel, level);
          }
          setLabel(scoreLabel, score);
          for (let x = j; x > 0; x--) {
            for (let y = 0; y < gameInfo.height; y++) {
              grid[y][x] = grid[y][x-1];
            }
          }
          for (let y = 0; y < gameInfo.height; y++) {
            grid[y][0] = false;
          }
        }
      }

      // check if game over 
      for (let i = 0; i < gameInfo.brickCount; i++) {
        if (tetroid !== null && tetroid.y === 0) {
          inGame = false;
          gameOver = true;
          setLabel(stateLabel, "Game Over!");
          return;
        }
      }
    }
  }
  board.markDirty;
}

function gameTimer () {
  if (paused || !inGame || gameOver) { return; }
  dropTetroid();
}

function setupGame () {
    paused = false;
    gameOver = false; 
    level = 1;
    linesCleared = 0;
    score = 0;

    clearInterval(tickInterval);
    tickInterval = maxTick;
    setInterval(dropTetroid, tickInterval);

    setLabel(scoreLabel, score);
    setLabel(rowLabel, linesCleared);
    setLabel(levelLabel, level);
  
    inGame = true;
    initGame();
    dropTetroid();
    board.markDirty;
}

function resetGame () {
  inGame = true;
  gameOver = false;
  clearInterval(tickInterval);
  setInterval(dropTetroid, tickInterval);
  initializeGrid();
  clearBoard();
  tetroid = null;
  nextTetroid = new createTetroid();
}

function registerEvents () {
  window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
  window_long_click_subscribe(BUTTON_ID_SELECT, 400, select_click_handler_long, NULL);
}

dirty = { preview: true, board: true }

// helpers and shorteners 
function getE (id) { return document.getElementById(id); } // shorter = better 
function hide (object) { object.style.visibility = "hidden"; object.style.display = "none"; } // trigger css styles to hide
function randomize (low, high) { return Math.floor(Math.random() * (high - low)) + low; } // get a random int
function now () { return new Date().getTime(); } // we need the object, not a string
function setLabel (object, text) { object.innerHTML = text; } // better than writing it ourselves each time 
function show (object) { object.style.visiblity = "visible"; object.style.display = "inline-block"; } // trigger css styles to show

setupGame(); // START POLARIS