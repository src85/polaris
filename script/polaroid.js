/* 
Settings and forms for Polaris -- conversion of TetrisSP (C) to Javascript/Canvas 
for WDP Project WS17/18 FH Hagenberg BB SE 
from Sebastian Spanner S1610307038 
created 2018-01-02 17:30 

-- thanks to --
Peter Coles
Dionysis "dionyziz" Zindros
Sergey Alexandrovich Kryukov
-- for useful howtos when my head crushed against the wall --
*/

/* jshint esversion: 6 */

/*********************************************************************************
 *             COVERTEXT: MAY BE CHANGED BY USER AT OWN RISK                     *
 * *******************************************************************************/

 (function(){
   "use strict";
 }());

function randomize (low, high) { return Math.floor(Math.random() * (high - low)) + low; } // get a random int

const gameSettings = {

    width: 10, // simple horizontal size
    height: 20, // double vertical size

    brickCount: 4, // classic polaroids consist of 4 bricks
    maxLevel: 10, // tetris classic variant b: 10 levels to clear till rocket

    keys: {
        left: 37, // key for left arrow
        right: 39, // key for right arrow
        rotate: 38, // key for up arrow
        down: 40, // key for down arrow
        drop: 32, // key for spacebar
        pause: 13 // key for enter
    }

};

function createPolaroid () {
    // choose random polaroid
    let shape = randomize(0, polaroidShapes.length);

    this.type = shape + 1;
    this.color = polaroidColors[shape+1]; // 0 = black (!)
    this.orientation = 0;
    this.shape = polaroidShapes[shape][this.orientation];

    // initial horizontal position of new polaroid
    let calcX = randomize(0, (gameSettings.width - this.shape[0].length + 1));
    this.x = calcX;
    this.y = -1;
}

function copyPolaroid(polaroidP, orientP) {
    this.type = polaroidP.type;
    this.color = polaroidP.color;
    this.orientation = orientP || 0;
    this.shape = polaroidShapes[polaroidP.type-1][this.orientation];
    this.x = polaroidP.x;
    this.y = polaroidP.y;
}


/*********************************************************************
 * Attributes of polaroids which belong together are at same position *
 * of each of the following arrays - they will be chosen/assigned to *
 * a newly created instance of a polaroid in 'createPolaroid()'        *
 *********************************************************************/

const polaroidColors = [
    '#000000', // classic - for stroke - , then some weird colors
    '#ff48c4',
    '#2bd1fc',
    '#f3ea5f',
    '#c04df9',
    '#ff3f3f',
    '#d8689a',
    '#3597be',
    '#ffffff' // should stay the last color of the array to catch with .length-1
];

const polaroidShapes = [ // do not let this array get modified, compiler -- ES6 [ES 2015]
    [[[1, 1],
      [1, 1]]], // SQUARE


    [[[1, 1, 1, 1]],

     [[1],
      [1],
      [1],
      [1]]], // BAR
   

    [[[1, 1, 1],
      [1, 0, 0]],
     
    [[1, 0],
     [1, 0],
     [1, 1]],
   
    [[0, 0, 1],
     [1, 1, 1]],
   
    [[1, 1],
     [0, 1],
     [0, 1]]], // L


    [[[1, 1, 1],
      [0, 0, 1]],
     
     [[1, 1],
      [1, 0],
      [1, 0]],
      
     [[1, 0, 0],
      [1, 1, 1]],
      
     [[0, 1],
      [0, 1],
      [1, 1]]], // J


    [[[0, 1, 1],
      [1, 1, 0]],
      
     [[1, 0],
      [1, 1],
      [0, 1]]], // S


    [[[1, 1, 0],
      [0, 1, 1]],
     
     [[0, 1],
      [1, 1],
      [1, 0]]], // Z

    [[[1, 1, 1],
      [0, 1, 0]],
    
     [[1, 0],
      [1, 1],
      [1, 0]],
      
     [[0, 1, 0],
      [1, 1, 1]],
      
     [[0, 1],
      [1, 1],
      [0, 1]]] // T
 ];