/*
Functions and variables for Polaris -- conversion of TetrisSP (C) to Javascript/Canvas
for WDP Project WS17/18 FH Hagenberg BB SE
from Sebastian Spanner S1610307038
created 2018-01-02 17:30
*/

/* jshint esversion: 6 */

/*********************************************************************************
 *               PREFACE: GLOBAL VARS/OBJECTS                                    *
 * *******************************************************************************/

 (function() {
  "use strict"; // get as many errors as possible, use vars more consciously
 }());

// the polaris grid
var grid = [];

// game states
var inGame = false;
var gameOver = false;
var gameWin = false;
var paused = false;
var restartable = false;
var restartGame = false;

// game time
var interval;
var maxTick = 500;
var tickInterval = maxTick; // 500ms at start

// prepare polaroids
var nextPolaroid = null;
var polaroid = null;

// score-relevant variables
var level;
var linesCleared;
var score;

// get DOM elements to edit while playing
var board = getE("board");
var left = getE("left");
var preview = getE("preview");

var boardCtx = board.getContext('2d');
var previewCtx = preview.getContext('2d');

var blockSize = 0; // global var for dimension of 1 block according to window size
var dirty = {board: true, preview: true}; // mark context dirty

// text labels
var levelLabel = getE("level");
var rowLabel = getE("rows");
var scoreLabel = getE("score");



/*********************************************************************************
 *                INTRODUCTION: DEFINE SCREENS / STATE                           *
 * *******************************************************************************/

function startScreen () { // starting screen, simple game-name tag
  if(inGame || paused || gameOver) return;
  drawMsg("Polaris", "#ff3f3f");
}

function pauseScreen () {
  if(!paused) return;
  clearBoard();
  drawMsg("Pause!", "Black");
  clearInterval(interval);
}

function flushBoard (color, msg, bY, bX) {
  boardCtx.fillStyle = color; // color of losing/winning bricks
  let red = true;
  while(bY >= 0 && bX >= 0) {
    if(grid[bY][bX] !== -1) {
      grid[bY][bX] = -1;
      break;
    }
    if(bX-- === 0) {
      bX = gameSettings.width;
      --bY;
    }
    if(red) {
      drawMsg(msg, "White");
      red = false;
    } else {
      drawMsg(msg, "Red");
      red = true;
    }
  }
  drawBlocks(board, null, bX * blockSize, bY * blockSize, 1);
  dirty.board = true;
  if(grid[0][0] === -1) clearInterval(interval);
}

function gameEnd(color, msg){
  if(!gameWin && !gameOver) return; 
  clearInterval(interval);
  clearPreview();
  hide(preview);
  let blockY = gameSettings.height, blockX = gameSettings.width;
  interval = setInterval(function(){ flushBoard(color, msg, blockY, blockX); }, 5);
  restartable = true;
}

function gameOverScreen () {
  if(!gameOver) return;
  gameEnd("Black", "Spielende");
}

function gameWinScreen() {
  if(!gameWin) return; 
  gameEnd("Gold", "Sieg");
}



/*********************************************************************************
 *                1) INITIALIZING GRID / GAME                                    *
 * *******************************************************************************/

function initializeGrid () {
  let h = gameSettings.height, w = gameSettings.width;
  for(let y = 0; y <= h; y++) {
      grid[y] = [];
      for(let x = 0; x <= w; x++) {
          grid[y][x] = 0;
      }
  }
}

function initGame () {
    level = 1;
    linesCleared = 0;
    score = 0;

    setLabel(scoreLabel, score);
    setLabel(rowLabel, linesCleared);
    setLabel(levelLabel, level);

    initializeGrid();
    nextPolaroid = new createPolaroid();
    show(preview);
    dirty.preview = false;
}



/*********************************************************************************
 *                2)  RESIZING, (RE)DRAWING                                      *
 * *******************************************************************************/

function getBlockSize(resizeFactor) {
  blockSize = Math.floor(board.height / gameSettings.height * resizeFactor);
}

function setProportions () {
  let height = window.innerHeight; // of board 
  height = Math.floor(window.innerHeight - 50);
  let blockHeight = Math.floor(height / gameSettings.height); // a 20th of the whole height
  height = blockHeight * gameSettings.height;
  
  let width = blockHeight * gameSettings.width; // of board
  let blockWidth = Math.floor(width / gameSettings.width); // a 10th of the whole width

  board.style.height = height + 'px';
  board.style.width = width + 'px';
  left.style.width = (width + 10) + 'px';

  preview.style.width = (blockWidth * 3) + 'px';
  preview.style.height = (blockWidth * 3) + 'px';

  board.height = board.clientHeight;
  board.width = board.clientWidth;

  preview.height = preview.clientHeight;
  preview.width = preview.clientWidth;

  dirty.board = true;
  drawBoard();
  dirty.preview = true;

  if(!restartGame) { paused = true; }
  else restartGame = false;
}

function clearBoard () {
  boardCtx.clearRect(-1, -1, boardCtx.canvas.width + 1, boardCtx.canvas.height + 1);
  boardCtx.strokeStyle = polaroidColors[0];
  boardCtx.lineWidth = 1;
  boardCtx.strokeRect(0, 0, boardCtx.canvas.width, boardCtx.height);
}

function clearPreview () {
  previewCtx.clearRect(-1, -1, previewCtx.canvas.width + 1, previewCtx.canvas.height + 1);
}

function drawMsg(text, color) {
  let posY = Math.floor(board.height * (1/4)); 
  let posX = Math.floor(board.width / 2); 
  getBlockSize(1);
  boardCtx.save();
  let fontSize = Math.floor(blockSize * 2);
  posX -= (text.length * Math.floor(fontSize/4));
  let font = fontSize.toString() + 'px "Soviet 3d italic"';
  boardCtx.font = font;
  boardCtx.fillStyle = "White";
  boardCtx.fillText(text, posX, posY);
  boardCtx.strokeStyle = color;
  boardCtx.strokeText(text, posX, posY);
  boardCtx.restore();
}

function drawBlocks (area, pol, cx, cy, resizeFactor) {
  if(paused) {
    pauseScreen();
  } else {
    let context = area.getContext('2d');
    let height = area.clientHeight;
    blockSize = Math.floor(height / gameSettings.height) * resizeFactor;

    context.lineWidth = 1;

    if(pol !== null) {
      context.strokeStyle = polaroidColors[polaroidColors.length-1];
      context.fillStyle = pol.color;

      let ySize = pol.shape.length; 
      let xSize = pol.shape[0].length;

      for(let y = 0; y < ySize; y++) {
        for(let x = 0; x < xSize; x++) {
            if(pol.shape[y][x] === 1) {
              if(cx === 0 && cy === 0) {
                context.fillRect((pol.x * blockSize) + blockSize * x,  (pol.y * blockSize) + blockSize * y, blockSize, blockSize);
                context.strokeRect((pol.x * blockSize) +  blockSize * x, (pol.y * blockSize) + blockSize * y, blockSize, blockSize);
              } else {
                context.fillRect(blockSize * x + cx,  blockSize * y + cy, blockSize, blockSize);
                context.strokeRect(blockSize * x + cx, blockSize * y + cy, blockSize, blockSize);
              }
            }
          }
      }
    } else {
      context.fillRect(cx,  cy, blockSize, blockSize);
      context.strokeRect(cx, cy, blockSize, blockSize);
    }
  }
}

function drawPreview () {
  if(!dirty.preview || nextPolaroid ===  null) return;
  let previewFactor = 4, rePad = 0;

  if(nextPolaroid.type === 1) rePad = 2 * previewFactor;
  else if(nextPolaroid.type === 2) rePad = -2 * previewFactor;

  let offsetY = Math.floor((preview.clientWidth - nextPolaroid.shape.length) / previewFactor);
  let offsetX = Math.floor((preview.clientWidth - nextPolaroid.shape[0].length) / previewFactor) + rePad;
  clearPreview();
  drawBlocks(preview, nextPolaroid, offsetX, offsetY, previewFactor);
  dirty.preview = false;
}

function drawBoard () {
  if(!dirty.board || polaroid === null) return;

  clearBoard();
  drawBlocks(board, polaroid, 0, 0, 1); // draw active block

  let h = gameSettings.height, w = gameSettings.width; 
  for(let y = 0; y < h; y++) {
    for(let x = 0; x < w; x++) {
      if(typeof grid[y][x] !== 'undefined' && grid[y][x] !== 0) {
        boardCtx.fillStyle = polaroidColors[grid[y][x]];
        drawBlocks(board, null, x * blockSize, y * blockSize, 1);
      }
    }
  }
  dirty.board = false;
}



/*********************************************************************************
 *                3) DROP TETROID / FASTEN IT / CLEAR ROWS [experimental grav]   *
 * *******************************************************************************/

function fastenPolaroid (pol) {
  if(polaroid === null) return;
  let ySize = polaroid.shape.length; 
  let xSize = polaroid.shape[0].length;

  for(let y = 0; y < ySize; y++) {
    for(let x = 0; x < xSize; x++) {
      if(polaroid.shape[y][x] === 1) {
        if(grid[y + polaroid.y] !== undefined && grid[y + polaroid.y][x + polaroid.x] !== undefined)
          grid[y + polaroid.y][x + polaroid.x] = polaroid.type;
      }
    }
  }
  polaroid = null;
}

function dearGravity () {
  
}

function clearRows () {
  let h = gameSettings.height, w = gameSettings.width;

  for(let y = h - 1; y >= 0; y--) {
    let rowComplete = true;
    for(let x = 0; x < w; x++) {
      if(grid[y][x] === 0) {
        rowComplete = false;
        break;
      }
    }
    if(rowComplete) {
      for(let dy = y; dy > 0; dy--) { // drop whole y
        for(let x = 0; x < w; x++) {
          grid[dy][x] = grid[dy-1][x];
          score += level;
          setLabel(scoreLabel, score);
        }
      }
      linesCleared++;
      setLabel(rowLabel, linesCleared);
      if(linesCleared > level * 10) {
        getFaster(++level); // level up and get faster if so
      }
      y++; // check row again
    }
  }
  dearGravity();
}

function dropPolaroid () {
  if(!inGame) return;

  if(polaroid === null) {
    polaroid = nextPolaroid;
    nextPolaroid = new createPolaroid();
    dirty.preview = true;
  }
  
  drawPreview();
  drawBoard();

  if(!polaroidCrash(polaroid.x, polaroid.y+1, polaroid)) {
    polaroid.y++;
  } else {
    fastenPolaroid();
    clearRows();
    dirty.preview = true;
  }
  if(gameOver) {
    gameOverScreen();
    return false;
  }
  dirty.board = true;
  return true;
}



/*********************************************************************************
 *                4) FASTER / MOVE / CRASH DETECTION                             *
 * *******************************************************************************/

function getFaster (level) { // get faster each level
  if (!inGame) return;
  drawMsg("SCHNELLER!", "Red");
  setLabel(levelLabel, level);
  if(level <= 10 && tickInterval > 100) { // 100ms is impossibly fast already
    clearInterval(interval);
    tickInterval -= 50;
    interval = setInterval(dropPolaroid, tickInterval);
  }
  if(level > 10) {
    gameWin = true;
    gameWinScreen();
  }
}

function resetX(pol) { // function to give player more chances
  let len = pol.shape[0].length;
  let width = gameSettings.width - len + 1;

  for(let x = 0; x <= width; x++) {
    let newX = x, xLen = x + len;
    while(newX <= xLen) {
      if(grid[0][newX] !== 0) break;
      newX++;
    }
    if(newX > xLen) return x;
  }
  return -1;
}

function polaroidCrash (newX, newY, pol) {
  if(pol === null) return false;
  let h = gameSettings.height, w = gameSettings.width;
  let ySize = pol.shape.length; 
  let xSize = pol.shape[0].length;

  if(newX < 0 || (newX + xSize - 1) >= w) return true;

  for(let y = 0; y < ySize; y++) {
    for(let x = 0; x < xSize; x++) {
      if(pol.shape[y][x] === 1) {
        if((x + newX >= w) || (y + newY >= h) || (grid[y + newY][x + newX] !== 0)) {
            if(newY === 0 || newY === 1) {
              nextPolaroid.x = resetX(nextPolaroid);
              if(nextPolaroid.x === -1) {
                gameOver = true;
                inGame = false;
              }
            }
            return true;
          }
      }
    }
  }
  return false;
}



/*********************************************************************************
 *              5) POLAROID / GAME ACTIONS                                       *
 * *******************************************************************************/

function movePolaroid (dir) {
  if(!inGame || paused) return;
  if(polaroid === null) return false;
  let x = polaroid.x, y = polaroid.y;
  if(dir === 0)
    x--;
  else if(dir === 1)
    x++;
  else
    y++;
  if(!polaroidCrash(x, y, polaroid)) {
    polaroid.x = x;
    polaroid.y = y;
    dirty.board = true;
    drawBoard();
    return true;
  }
  return false;
}

function rotatePolaroid (polaroidP) {
  if(!inGame || paused || polaroidP === null) return null;
  if(polaroidP.type === 1) return polaroidP;
  let orient = polaroidP.orientation + 1;
  if(orient === polaroidShapes[polaroidP.type-1].length) orient = 0;
  return new copyPolaroid(polaroidP, orient);
}

function freefallPolaroid () {
  if(!inGame || paused) return;
  while(movePolaroid(-1)) { }
  return true;
}

function pausePolaris () {
  if(!inGame || gameOver) return;
  paused = true;
  pauseScreen();
}

function gameAction (code) {
  switch(code) {
    case (gameSettings.keys.left): { movePolaroid(0); } break;
    case (gameSettings.keys.right): { movePolaroid(1); } break;
    case (gameSettings.keys.down): { movePolaroid(-1); } break;
    case (gameSettings.keys.rotate): {
                                        let temp = rotatePolaroid(polaroid);
                                        if(temp !== null && !polaroidCrash(temp.x, temp.y, temp)) polaroid = temp;
                                      }
                                      break;
    case (gameSettings.keys.drop): { freefallPolaroid(); } break;
    case (gameSettings.keys.pause): { 
                                          if(paused || restartable) resetGame(); 
                                          else pausePolaris(); 
                                    } 
                                    break;
  }
}



/*********************************************************************************
 *                6) (RE)START PROCEDURES                                        *
 * *******************************************************************************/

function setUpGame () {
  inGame = false; // mark false when start screen implemented
  restartable = true;
  restartGame = true;

  initGame();

  hide(preview);
  setProportions(); // set props on finished load
  startScreen(); // paint start screen
}

function resetGame () {
  if(restartable) {
    inGame = true;
    gameOver = false;
    gameWin = false;
    nextPolaroid = null;
    restartable = false;
    restartGame = true;
    polaroid = null;

    initGame();

    clearInterval(interval);
    tickInterval = maxTick;
    interval = setInterval(dropPolaroid, tickInterval);
  } else {
    inGame = true;
    interval = setInterval(dropPolaroid, tickInterval);
    paused = false;
  }
}



/*********************************************************************************
 *                APPENDIX A: HELPERS / MISC                                     *
 * *******************************************************************************/

function getE (id) { return document.getElementById(id); } // shorter = better
function hide (object) { object.style.visibility = "hidden"; } // trigger css styles to hide
function setLabel (object, text) { object.innerHTML = text; } // better than writing it ourselves each time
function show (object) { object.style.visibility = "visible"; } // trigger css styles to show



/*********************************************************************************
 *               APPENDIX B: START GAME!                                         *
 * *******************************************************************************/

setUpGame(); // START POLARIS
window.onresize = setProportions; // resize/set props immediately
document.onkeydown = function(k) { gameAction(k.keyCode); }; // register event function