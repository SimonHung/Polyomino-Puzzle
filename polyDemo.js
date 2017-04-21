//=============================================================================
// Pentomino Puzzle (Demo function)
//
// 11/05/2012 by Simon Hung
//=============================================================================

//=======================
// BEGIN for idle demo
//=======================
var MAX_IDLE_TIME = 3 * 60;  //3 min
var CORNER_IDLE_TIME = 5; //5 secs

var lastIdleTime, lastMouseX, lastMouseY;
var mouseMove = 0;
var demoRunning = 0; //0:wait idle demo, 1: demo running
var idleTimer = null;

function initIdleDemo()
{
	if(window.Event && document.captureEvents) document.captureEvents(Event.MOUSEMOVE);;
	document.onmousemove = getMouseXY;
}

function getMouseXY(e)
{
	if (!e) var e = window.event||window.Event;

	lastMouseX = e.clientX;
	lastMouseY = e.clientY;
	lastIdleTime = new Date();
	mouseMove++;
	
	//writeMessage("X:" + lastMouseX + " Y:" + lastMouseY + " count:" +mouseMove);
}

function checkIdleTime()
{
	var curTime = new Date();
	
	if(demoRunning) { 
		//In demo mode, wait mouse move then back to play mode
		if(mouseMove>2) {
			restorePlayInfo();
			startButton(0); //don't create new puzzle, need restore from saved info
		}
	} else { 
		//In play mode,
		// (1) wait idle time  > MAX_IDLE_TIME
		// (2) cursor at up-left corner , wait idle time > 	CORNER_IDLE_TIME
		// ==> into demo mode
		var idleTime = (curTime - lastIdleTime) /1000;
		
		if((idleTime > MAX_IDLE_TIME) || (lastMouseX < 10 && lastMouseY < 10 && idleTime > CORNER_IDLE_TIME)) {
			demoButton(0); //idle timeout, auto demo
		}
	}
}

function beginIdleDemo()
{
	demoRunning = 1;
	mouseMove=0; //clear mouse move
	savePlayInfo(); //save play mode info for demo back
	if(idleTimer) clearInterval(idleTimer);
	idleTimer = setInterval(function() {checkIdleTime();}, 200); //set interval = 200ms
}

function waitIdleDemo()
{
	demoRunning = 0;
	if(idleTimer) clearInterval(idleTimer);
	idleTimer = setInterval(function() {checkIdleTime();}, 1000); //set interval = 1000ms
}

function disableIdleDemo()
{
	if(idleTimer) {
		clearInterval(idleTimer);
		idleTimer = null;
	}
}

//====================================
// BEGIN for block operator function 
//====================================

//-------------------------------------
// block compare
// block equal return 1 else return 0
//-------------------------------------
function compareBlock(srcBlock, dstBlock)
{
	for(var i = 0 ; i < srcBlock.length; i++) {
		if(srcBlock[i].x != dstBlock[i].x || srcBlock[i].y != dstBlock[i].y) 
			return 0;
	}
	return 1;
}

//------------------------------------------------
//rotate 90 degree clockwise, (X, Y) ==> (Y, -X)  
//------------------------------------------------
function rotateBlock(block)
{
	var newBlock = [];
	
	for(var i = 0 ; i < block.length; i++) {
		newBlock[i] = {};
		newBlock[i].x = -block[i].y;
		newBlock[i].y = block[i].x;
	}
	blockNormalization(newBlock);
	
	return newBlock;
}

//---------------------------------------
//left right flip, (X , Y) ==> (-X , Y)
//---------------------------------------
function flipBlock(block)
{
	var newBlock = [];
	
	for(var i = 0 ; i < block.length; i++) {
		newBlock[i] = {};
		newBlock[i].x = -block[i].x
		newBlock[i].y = block[i].y
	}
	blockNormalization(newBlock);
	
	return newBlock;
}

//=========================================
// BEGIN for save|restore play mode info
//=========================================

//--------------------------------------------------------------------------------
// clone a object
// URL:http://stackoverflow.com/questions/728360/copying-an-object-in-javascript
//--------------------------------------------------------------------------------
function clone(obj) 
{
	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) return obj;
 
	// Handle Date
	if (obj instanceof Date) {
		var copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}
 
    // Handle Array
	if (obj instanceof Array) {
		var copy = []; 
		for (var i = 0, len = obj.length; i < len; ++i) {
			copy[i] = clone(obj[i]);
		}
		return copy;
	}

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

//-----------------------
// save play mode info
//-----------------------
var saveInfo;
function savePlayInfo()
{
	saveInfo = {};

	//save board state
	saveInfo.gBoardState = gBoardState;
	
	//save group info (clone this array object)
	saveInfo.gBlockGroup = clone(gBlockGroup);
	
	//console.log(gBlockGroup);
	//console.log(saveInfo.gBlockGroup);
	
	saveInfo.gFixedPolyGroup = gFixedPolyGroup;
	saveInfo.gPolyGroup = gPolyGroup;
	
	//save poly order for hints
	saveInfo.polyIdOrder = polyIdOrder;
	
	//save poly initial position
	saveInfo.polyInitPos = polyInitPos;
	
	//save board size info 
	saveInfo.gBoardSizeId=gBoardSizeId;
	saveInfo.gLevelId = gLevelId;
}

//-------------------------
// restore play mode info
//-------------------------
function restorePlayInfo()
{
	//restore board state
	gBoardState = saveInfo.gBoardState;
	
	//restore group info
	gBlockGroup = saveInfo.gBlockGroup;
	gFixedPolyGroup = saveInfo.gFixedPolyGroup;
	gPolyGroup = saveInfo.gPolyGroup;
	
	//restore poly order for hints
	polyIdOrder = saveInfo.polyIdOrder;
	
	//restore poly initial position
	polyInitPos = saveInfo.polyInitPos;
	
	//restore board size info
	gBoardSizeId= saveInfo.gBoardSizeId;
	gLevelId = saveInfo.gLevelId;

}

//===========================
// BEGIN for move a polygon 
//===========================

//-------------------------
// move a polygon to (x,y)
//-------------------------
var animate2XYObject = new animateMove2XY();
function move2XY(poly, x, y, time)
{
	if(animate2XYObject.isRunning()) return;
	
	if(typeof time == "undefined") time = 150;
	animate2XYObject.init(poly, x, y, time);
	animate2XYObject.start();	
}

//-----------------------
// check poly is moving
//-----------------------
function move2XYRunning()
{
	return animate2XYObject.isRunning();
}

//==========================================
// BEGIN for set|get demo block information
//==========================================

//-----------------------------------
// random the insert order
// for demo to move block to board
//-----------------------------------
var demoBlockInfo;
function randomAvailableBlock(slovedBoard)
{
	var boardX = slovedBoard.length-1;
	var boardY = slovedBoard[0].length-1;

	demoBlockInfo = [];
	for(var id=0; id < gBlockGroup.length; id++) {
		if(gBlockGroup[id].blockUsed) {
			var polyId = gBlockGroup[id].polyId;
			if (polyId >= 0 && gPolyGroup[polyId].poly.pos.x < 0) {
				//(1) polyId >= 0 :means the block is not fixed 
				//(2) gPolyGroup[polyId].poly.pos.x <0 : means poly does not insert to board yet
				//found it !
				
				//get poly position, X than Y
				outloop:
				for(var y= 1; y < boardY; y++) {
					for(var x= 1; x < boardX; x++) {
						if (slovedBoard[x][y]-1 == id) {
							break outloop;
						}
					}	
				}
				demoBlockInfo.push({x:x-1, y:y-1, id:id});
			}
		} 
	}
	
	//random insert order
	var numOfBlock = demoBlockInfo.length;
	for(var id=0; id < numOfBlock; id++) {
		var swapId =  Math.floor(Math.random()*(numOfBlock));
		var tmpId = demoBlockInfo[id];

		demoBlockInfo[id] = demoBlockInfo[swapId];	
		demoBlockInfo[swapId] = tmpId;
	}	
}

//-------------------------------------------------------------------
// get block info:{x:, y:, id:} , create by randomAvailableBlock() 
//-------------------------------------------------------------------
function getAvailableBlock()
{
	var result = demoBlockInfo.pop();
	if(typeof result == "undefined") result = null; //finish
	
	return result;
}

//==================================================================================

//----------------------------------------------------------------------------------
// get command for move the block to corret position of board
// return : array of command
// ex: moveCmd[] = { 'R', 'R', 'M' } : rotate 2 times then move to board
//     moveCmd[] = { 'F', 'R', 'M' } : flip, rotate then move to board  
//----------------------------------------------------------------------------------
function getCmd2Board(dstBlock, polyId, targetX, targetY)
{
	var orgBlock, srcBlock;
	var opFound=0;
	var rotate;
	var moveCmd=[];
	
	if(polyId >= 0) {
		orgBlock = gPolyGroup[polyId].block;
	} else {
		orgBlock = gFixedPolyGroup[1-polyId].block; //fixed block
	}
	
	//try rotate 3 times, and compare with target block
	//if not found, flip it and try rotate 3 time again
	srcBlock = orgBlock;
	while(1) {
		//rotate
		rotate=0;
		while(!(opFound = compareBlock(srcBlock, dstBlock)) && rotate < 3) {
			rotate++;
			srcBlock = rotateBlock(srcBlock);
		}
		if(opFound) break;
		
		//flip
		moveCmd.push({ cmd:'F'});
		srcBlock = flipBlock(orgBlock);	
	}
	
	if((moveCmd.length > 0) && moveCmd[0].cmd == 'F' && rotate == 3) {
		//reduce command: F R R R === R F
		moveCmd[0] = { cmd:'R'}
		moveCmd[1] = { cmd:'F'};
	} else {
		for(var i =0; i < rotate; i++) moveCmd.push({ cmd:'R'});
	}
	
	//'M': move, from current position to (x,y) 
	var leftUpPos = getLeftUpPos(dstBlock);
	var centerPos = getCenterPos(dstBlock);
	var offsetX = centerPos.x+leftUpPos.x;
	var offsetY = centerPos.y+leftUpPos.y;
	var endX = boardStartX + (targetX + offsetX) * BLOCK_CELL_SIZE;	
	var endY = boardStartY + (targetY + offsetY) * BLOCK_CELL_SIZE;

	moveCmd.push({cmd:'M', x:endX, y:endY});		

	return (moveCmd);
}

//---------------------------------------------------------
// check the block action is running or not 
//
// if not complete just check demo stop command and wait 
// else (action complete)
// (1) do next action if more action need to be executed
// (2) do action for other block 
//---------------------------------------------------------
function checkIsRunning(poly, moveCmd, index, boardOp)
{
	if(checkDemoStop()) return;

	var isRunning;
	
	switch(moveCmd[index].cmd) {
	case 'R':
		isRunning = rotate90Running();
		break;
	case 'F':
		isRunning = leftRightFlipRunning();
		break;
	case 'M':
		isRunning = move2XYRunning();
		break;	
	}
	if(isRunning) { 
		//just wait and check stop command
		setTimeout(function() {checkIsRunning(poly, moveCmd, index, boardOp);}, 100);
	} else {
		if(++index <  moveCmd.length) { //more command need to execute
			movePoly2Board(poly, moveCmd, index, boardOp);
		} else {
			//move finished, move other block to board
			animateBlock2Board(10, boardOp);
		}	
	}
}

//------------------------------------------
// move one block to board by move command 
//------------------------------------------
function movePoly2Board(poly, moveCmd, index, boardOp)
{
	if(checkDemoStop()) return; //if move move, stop demo

	var time;
	switch(moveCmd[index].cmd) {
	case 'R':
		time=500; //rotate time 
		rotate90(poly, time);
		break;
	case 'F':
		time=500; //flip time
		leftRightFlip(poly, time);
		break;
	case 'M':
		time=800; //move time
		move2XY(poly,moveCmd[index].x, moveCmd[index].y, time); 
		break;	
	}
	//set timeout for check current command finish
	setTimeout(function() {checkIsRunning(poly, moveCmd, index, boardOp);}, 100);
}

//----------------------
// set all poly shadow
//----------------------
function enableAllShadow()
{
	for(var id=0; id < gBlockGroup.length; id++) {
		var polyId = gBlockGroup[id].polyId;
		if(gBlockGroup[id].blockUsed && polyId >= 0 && gPolyGroup[polyId].poly.pos.x < 0) {
			setShadow(gPolyGroup[polyId].poly);
			setColor(gPolyGroup[polyId].poly, 0.8); //softer color
		}
	}
	gPolyGroup[0].poly.getLayer().draw();
}

//------------------------
// clear all poly shadow
//------------------------
function clearAllShadow()
{
	for(var id=0; id < gBlockGroup.length; id++) {
		var polyId = gBlockGroup[id].polyId;
		if(gBlockGroup[id].blockUsed && polyId >= 0 && gPolyGroup[polyId].poly.pos.x < 0) {
			clearShadow(gPolyGroup[polyId].poly);
			setColor(gPolyGroup[polyId].poly, 1); //normal color 
		}
	}
	gPolyGroup[0].poly.getLayer().draw();
}

//----------------------------------------------------------------------------------
// current demo complete, want to do next demo
// (1) if maxDemoCount <= 0 then create a new demo board size 
// (2) else demo the same board size
//
// notes: while current demo complete will wait a few seconds to do next demo, 
//        at this time use setTimeout to check mouse move for stop demo 
//----------------------------------------------------------------------------------
var maxDemoCount;
function nextDemo(count)
{
	var time = 100; //100 ms
	
	if(checkDemoStop()) return; //if move move, stop demo
	
	if(count < 3000/time) { //delay for new board 
		if(count == 5) clearAllShadow(); //about 500 ms
		setTimeout(function() {nextDemo(count+1);}, time);
	} else {
		enableAllShadow();
		if(--maxDemoCount <= 0) {
			demoPuzzle(); //create new puzzle + new board size for demo
		} else {
			doDemo(0); //demo same board size
		}
	}
}

//----------------------------------------------
// auto play puzzle
// Move one block to the board automatically
//----------------------------------------------
function animateBlock2Board(time, boardOp)
{
	if(checkDemoStop()) return;
	
	var result = getAvailableBlock();
	if(result != null) {
		var id = result.id; //block id
		var dstBlock = dupOpBlock(gBlockGroup[id].blockStyle[gBlockGroup[id].usedStyle], boardOp, 1);
		var moveCmd = getCmd2Board(dstBlock, gBlockGroup[id].polyId, result.x, result.y);
		var polyId, poly;
	
		if((polyId=gBlockGroup[id].polyId) >= 0) {
			poly = gPolyGroup[polyId].poly;
		} else {
			poly = gFixedPolyGroup[1-polyId].poly; //fixed poly 
		}
		
		poly.moveToTop();
		setTimeout(function() { movePoly2Board(poly, moveCmd, 0, boardOp);}, time);
	} else {
		nextDemo(0);
	}
}

//------------------------
// initial demo variable
//------------------------
var stopDemo = 0;
var finishDemo = 0;
function initDemoVariable()
{
	stopDemo = 0;
	finishDemo = 0;
}

//----------------------------
// check stop the demo or not
//----------------------------
function checkDemoStop()
{
	if(stopDemo) {
		finishDemo = 1;
		return true;
	}
	return false;
}

//----------------
// demo finished
//----------------
function demoFinish()
{
	return finishDemo;
}

//------------
// stop demo
//------------
function demoStop()
{
	stopDemo = 1;
}

//-----------------------------------------------------------
// poly puzzle demo
// demoCount: how many times to demo the current board size
//-----------------------------------------------------------
function doDemo(demoCount)
{
	var result;
	var moveTime = 800;
	var flashObject;
	var poly, polyId;

	if(demoCount > 0) maxDemoCount = demoCount;
	
	result = findAnswer(gBoardState, 1);
	while(result.totalAnswer <= 0) {
		//-------------------------------------------------------------
		// Current board state has no solution,
		// try remove one block (base on block order) step by step
		// until find the answer
		//-------------------------------------------------------------
		//get the last inserted block
		polyId = getPolyIdFromInsertOrder;
			//remove it from demo board
		poly = gPolyGroup[polyId].poly;
		removeBlock(gBoardState, poly)
		
		//try find answer
		result = findAnswer(gBoardState, 1);
	}
	randomAvailableBlock(result.slovedBoard);

	if(!animateBlockBack(moveTime)) moveTime = 0;
	//dumpBoard(result.slovedBoard);
	
	initDemoVariable();
	animateBlock2Board(moveTime, result.op);
}