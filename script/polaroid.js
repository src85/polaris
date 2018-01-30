/* 
Settings for Polaris -- conversion of TetrisSP (C) to Javascript/Canvas 
for WDP Project WS17/18 FH Hagenberg BB SE 
from Sebastian Spanner S1610307038 
created 2018-01-02 17:30 
-- thanks to --

-- for ideas, clues, references --
*/

const gameInfo = {

    width: 10, // simple horizontal size
    height: 20, // double vertical size

    brickCount: 4, // classic tetroids consist of 4 bricks
    maxLevel: 10, // tetris classic variant b: 10 levels to clear till rocket

    keys: {
        left: 37, // key for left arrow
        right: 39, // key for right arrow
        rotate: 38, // key for up arrow 
        down: 40, // key for down arrow
        drop: 32, // key for spacebar
    }

};

function createTetroid () {
    // choose random tetroid
    let shape = randomize(0, tetroidShapes.length);
    this.shape = tetroidShapes[shape]; 
    this.color = tetroidColors[shape+1]; // 0 = black (!)

    // calc horizontal size
    this.size = tetroidSizes[shape];

    // initial horizontal position of new tetroid
    let calcX = randomize(0, (gameInfo.width - this.size));
    this.x = calcX;
    this.y = 0;

    // always start tetroid at orientation 0 degrees
    this.orient = 0;
    return this;
}

function rotateTetroid () {
    let nextOrient;
    if(this.orient === 3) 
        nextOrient = 0;
    else 
        nextOrient = this.orient + 1;
    this.orient = nextOrient;
}

function calcDrop (tetroid) {
    let dropPossible = true;
    let dropHeight = 0;
    while (dropPossible) {
      for (let i = 0; i < gameInfo.width; i++) {
        let fall = tetroid[i].y + 1 + dropHeight;
        if (fall > (gameInfo.height - 1)) { dropPossible = false; }
        if (grid[tetroid[i].x][fall]) { dropPossible = false; }
      }
      if (dropPossible) 
        dropHeight += 1;
    }
    return dropHeight;
}


/*********************************************************************
 * Attributes of tetroids which belong together are at same position *
 * of each of the following arrays - they will be chosen/assigned to *
 * a newly created instance of a tetroid in 'createTetroid()'        *
 *********************************************************************/

const tetroidColors = [
    'Black', // classic, then some weird colors
    'Plum', 
    'Chartreuse', 
    'DarkSlateGray', 
    'HotPink', 
    'Gold', 
    'IndianRed', 
    'OliveDrab', 
    'White' // should stay the last color of the array to catch with .length-1
];

const tetroidSizes = [ 2, 4, 3 ,3, 3, 3, 3 ]; // horizontal no of blocks

const tetroidShapes = [ // do not let this array get modified, compiler -- ES6 [ECMA 2015]
    [1, 1, 0, 0, 
     1, 1, 0, 0,
     0, 0, 0, 0, 
     0, 0, 0, 0], // SQUARE

    [1, 1, 1, 1,
     0, 0, 0, 0, 
     0, 0, 0, 0, 
     0, 0, 0, 0], // BAR
   
    [1, 1, 1, 0, 
     1, 0, 0, 0, 
     0, 0, 0, 0,
     0, 0, 0, 0], // L

    [1, 1, 1, 0, 
     0, 0, 1, 0, 
     0, 0, 0, 0, 
     0, 0, 0, 0], // J

    [0, 1, 1, 0, 
     1, 1, 0, 0, 
     0, 0, 0, 0, 
     0, 0, 0, 0], // S 

    [1, 1, 0, 0, 
     0, 1, 1, 0, 
     0, 0, 0, 0, 
     0, 0, 0, 0], // Z

    [1, 1, 1, 0, 
     0, 1, 0, 0, 
     0, 0, 0, 0,
     0, 0, 0, 0]  // T
 ];
