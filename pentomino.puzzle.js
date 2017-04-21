//=============================================================================
// Pentomino Puzzle
//
// include files: polyomino5.js, polySolution.js, animate.js, polyDemo.js
//
// v1.3
// 12/16/2014 - (1) Bug fixed for Chrome 38.x
//                  (1.1) remark "context.stroke(context);"
//                  (1.2) change lib version to kinetic-v4.4.3
//
// v1.2
// 07/10/2013 - (1) Bug fixed for Chrome 28.0.1500.71 m
//                  change context.fill(context) to context.fill() 
//
// v1.1
// 04/04/2013 - (1) For work with Chrome 26.0.1410.43m move to kineticJS 4.4.0
//              (2) Support tranditional chinese 
//    
// v1.0
// 11/05/2012 - recover play mode info after demo back and change board color
//
// 11/03/2012 - add demo function
// 10/26/2012 - create by Simon Hung
//=============================================================================

//=========
// define
//=========
var versionString="1.3"

//-------------------------------------
//http://www.tayloredmktg.com/rgb/#GR
//http://www.colorhexa.com/
//-------------------------------------
var BACKGROUND_COLOR = "#FAFAD2"; //Light Goldenrod Yellow
var BACKGROUND_BOARD_COLOR = "white";

var BORDER_COLOR = "#0D8072";  
var BORDER_STROKE_COLOR = "yellow";

var BOARD_COLOR = "#B7F7DE"; //light green
var FIXED_BLOCK_COLOR = "#D0D0D0";  //light gray
var FIXED_BORDER_COLOR = BOARD_COLOR;

var FOCUS_BORDER_COLOR = "red";
var BLOCK_BORDER_COLOR = "yellow";

var OPERATOR_COLOR = "#3344FF";  //blue
var OPERATOR_CIRCLE_COLOR = "white";

var FLASH_BORDER_COLOR = "red";

var TEXT_FINISH_COLOR = "#FF88EE";
var NEXT_BUTTON_TEXT_COLOR = "#FF8800";
var NEXT_BUTTON_FILL_COLOR = "white";
var NEXT_BUTTON_BORDER_COLOR = "green";

//-------------------------------------------------------------------------
// block colors: 
// from : http://en.wikipedia.org/wiki/File:Pentomino_Puzzle_Solutions.svg	  
//-------------------------------------------------------------------------

var BLOCK_COLOR = [ "#EEAAAA", "#DDBB99", "#CCCC88", "#BBDD99", 
					"#AAEEAA", "#99DDBB", "#88CCCC", "#99BBDD",
					"#AAAAEE", "#BB99DD", "#CC88CC", "#DD99BB" ];

/*
var BLOCK_COLOR = [ "#EEEE80", "#FFE080", "#FFBF80", "#FFA080", "#FF8080", "#C08088", 
					"#A680A6", "#8880C0", "#80B9F3", "#80C0B5", "#80CC80", "#A8DF80" ];					
*/

//===========================
// value base on screen size
//===========================
var BLOCK_CELL_SIZE;
var STAGE_X;
var STAGE_Y;
var STAGE_OFFSET_X;
var STAGE_OFFSET_Y;
var SCREEN_X;
var SCREEN_Y;

//==================
// global variable
//==================
var SCREEN_BOARD_X;
var SCREEN_BOARD_Y;
var BOARD_WIDTH;
var BOARD_HIGH;
var boardStartX;
var boardStartY;

var gBoardSizeId = 0; //board size
var gLevelId = 1; //play level 

var gStage;            //kinetic stage
var gBackgroundLayer;  //kinetic layer
var gBoardLayer;       //kinetic layer
var gMessageLayer;     //kinetic layer

var gBlockGroup; //
var gPolyGroup;  //for output on screen

//---------------------------
// For calculate board state 
//---------------------------
var gBoardState; //current board status, ([1..SCREEN_BOARD_X] , [1..SCREEN_BOARD_Y])
var gTotalBlockCell; //total block cells
var gBlockCellUsed = 0; //how many block cell used
var gBlockUsed = 0; //how many block used

//==================
// BEGIN 
//==================
window.onload = function(){
	init();
};

//--------------------
// Initial
//--------------------
function init()
{
	//just for fixed: chrome sets cursor to text while dragging, why?
	//http://stackoverflow.com/questions/2745028/chrome-sets-cursor-to-text-while-dragging-why
	//This will disable any text selection on the page and it seems that browser starts to show custom cursors.
	document.onselectstart = function(){ return false; } ;
	
	initIdleDemo(); //external function for demo puzzle
	
	//initial input 
	document.getElementById('checkButton').checked=false;
	document.getElementById('boardSizeButton').options[gBoardSizeId].selected = true;
	document.getElementById('levelButton').options[gLevelId-1].selected  = true;
	
	initLanguage();
	initScreenVariable();
	initScreenPosColor();	
	
	gBlockGroup = polyomino5.blockGroup;
	createBlockStyle(gBlockGroup); //external function
	bindBlockColor(gBlockGroup);
	
	createStageLayer();
	

	if(getDemoReady()) {
		playPuzzle(1); //new puzzle for play
	} else {
		//start demo puzzle, just do once
		setDemoReady();
		visibleStartButton();
		demoPuzzle(); //new puzzle for demo
	}
	
	//debug 
	//writeMessage("" +BLOCK_CELL_SIZE + " " + STAGE_X + " " + STAGE_Y + "offX:" + STAGE_OFFSET_X + "offY:" + STAGE_OFFSET_Y);
}

//-----------------------------------------------------
// start a play puzzle 
// newPuzzle: 1: create new puzzle, 0: back from demo
//-----------------------------------------------------
function playPuzzle(newPuzzle)
{
	waitIdleDemo();

	hiddenStartButton();
	if(newPuzzle) {
		restoreBoardSize(); //get board size & level from localstorage 
	} else {
		initBoardSize(gBoardSizeId, gLevelId); //back from demo
	}
	createPuzzle(newPuzzle, true);		
	enableAllButton();
	visibleAllButton();
}

//---------------------
// start a demo puzzle
//---------------------
function demoPuzzle()
{
	restoreDemoBoardSize(); //get board size & level from localstorage
	createPuzzle(1, false); //create new puzzle and block can not draggiable for demo only
	hiddenAllButton();
	doDemo(Math.floor(Math.random()*3)+2); //demo count = 2 - 4 times for a same board size
}

function demoButton(pressButton)
{
	beginIdleDemo();
	if(pressButton) clearDemoReady(); //next time begin page will run demo again
	demoPuzzle();
}

function initBoardSize(boardSize, level)
{
	gBoardSizeId=boardSize;
	gLevelId = level;
	
	reNewLevelOption();
	document.getElementById('boardSizeButton').options[gBoardSizeId].selected = true;
	document.getElementById('levelButton').options[gLevelId-1].selected  = true;
}

//-------------------------------------------------------------------
// initial button language to traditional chinese if system support
//-------------------------------------------------------------------
var levelText = "Level";
var noSolutionText = "No solution ";
var nextText = "NEXT";
var finishText = "Congratulation";
var checkSolutionShift = 130;
	
function initLanguage()
{
	var sysLang = getSystemLanguage();

	if(sysLang == "zh-tw" || sysLang == "zh-hk") { //tranditional chinese
		//levelText = "等級";
		noSolutionText = "無解   ";
		nextText = " 下一關 ";
		finishText = " 恭喜完成     ";
		
		document.getElementById('hintsButton').value = "提示";
		document.getElementById('resetButton').value = "重置";
		document.getElementById('startButton').value = "遊戲開始";

		checkSolutionShift = 90;
		document.getElementById('checkboxtext').innerHTML = "即時檢查";
	}	
}

//----------------------------------------------
// initial screen variable base on screen size
//----------------------------------------------
function initScreenVariable() 
{
	var screenWidth = 0, screenHeight = 0;

	var maxStageX = 1000;
	var maxStageY = 800;
	var maxCellSize = 40;

	var midStageX = 800;
	var midStageY = 600;
	var midCellSize = 32;

	var miniStageX = 600;
	var miniStageY = 400;
	var miniCellSize = 24;

	var microStageX = 400;
	var microStageY = 300;
	var microCellSize = 20;	
	
	//----------------------------------------------------------------------
	// Window size and scrolling:
	// URL: http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
	//----------------------------------------------------------------------
	if( typeof( window.innerWidth ) == 'number' ) {
		//Non-IE
		screenWidth = window.innerWidth;
		screenHeight = window.innerHeight;
	} else if((document.documentElement) && 
		      (document.documentElement.clientWidth || document.documentElement.clientHeight ) ) 
	{
		//IE 6+ in 'standards compliant mode'
		screenWidth = document.documentElement.clientWidth;
		screenHeight = document.documentElement.clientHeight;
	} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
		//IE 4 compatible
		screenWidth = document.body.clientWidth;
		screenHeight = document.body.clientHeight;
	}
	
	SCREEN_X = screenWidth;
	SCREEN_Y = screenHeight;
	
	STAGE_X = ((screenWidth%2)? (screenWidth-1):screenWidth) - microCellSize*2;
	if(STAGE_X > maxStageX) STAGE_X = maxStageX;
	if(STAGE_X < microStageX) STAGE_X = microStageX;
	STAGE_OFFSET_X = Math.floor((screenWidth - STAGE_X)/2);
	if(STAGE_OFFSET_X < microCellSize) STAGE_OFFSET_X = microCellSize;

	STAGE_Y = ((screenHeight%2)?(screenHeight-1):screenHeight) - microCellSize*2;
	if(STAGE_Y > maxStageY) STAGE_Y = maxStageY;
	if(STAGE_Y < microStageY) STAGE_Y = microStageY;
	STAGE_OFFSET_Y = Math.floor((screenHeight - STAGE_Y)/2);
	if(STAGE_OFFSET_Y < microCellSize) STAGE_OFFSET_Y = microCellSize;

	BLOCK_CELL_SIZE = maxCellSize;
	switch(true) {	
	case (STAGE_X <= microStageX || STAGE_Y <= microStageY):
		BLOCK_CELL_SIZE = microCellSize;
		break;
	case (STAGE_X <= miniStageX || STAGE_Y <= miniStageY):
		BLOCK_CELL_SIZE = miniCellSize;
		break;
	case (STAGE_X <= midStageX || STAGE_Y <= midStageY):
		BLOCK_CELL_SIZE = midCellSize;
		break;
	}
}

//----------------------------------------------
// initial screen position and background color 
//----------------------------------------------
function initScreenPosColor()
{
	document.getElementById('container').style.cssText = "top:" + (STAGE_OFFSET_Y) + "px; left:" + (STAGE_OFFSET_X) + "px; position: absolute;";

	document.getElementById('boardSize').style.cssText = "top:" + (5) + "px; left:" + (SCREEN_X - 85) + "px; position: absolute;";

	document.getElementById('level').style.cssText = "top:" + (25) + "px; left:" + (SCREEN_X - 85) + "px; position: absolute;";

	document.getElementById('new').style.cssText = "top:" + (Math.floor(SCREEN_Y/2) - 20) + "px; left:" + (SCREEN_X - 55) + "px; position: absolute;";
	
	document.getElementById('reset').style.cssText = "top:" + (50) + "px; left:" + (SCREEN_X - 55) + "px; position: absolute;";
	
	document.getElementById('hints').style.cssText = "top:" + (SCREEN_Y - 80) + "px; left:" + (SCREEN_X - 55) + "px; position: absolute;";
	
	document.getElementById('check').style.cssText = "top:" + (SCREEN_Y - 40) + "px; left:" + (SCREEN_X - checkSolutionShift) + "px; position: absolute;";

	document.getElementById('start').style.cssText = "top:" + (Math.floor(SCREEN_Y/2) - 20) + "px; left:" + (SCREEN_X - 120) + "px; position: absolute;";

	document.getElementById('demo').style.cssText = "top:" + (Math.floor(SCREEN_Y/2) - 20) + "px; left:" + (2) + "px; position: absolute;";
	
	document.body.style.background = BACKGROUND_COLOR; //body background color
}

//------------------------------
// bind block with fixed color 
//------------------------------
function bindBlockColor(blockGroup)
{
	for(var id=0; id < blockGroup.length; id++) {
		blockGroup[id].color = BLOCK_COLOR[id];
	}
}

//----------------------------------
// create stage & layer (KineticJS)
//----------------------------------
function createStageLayer()
{
	//create stage object
	gStage = new Kinetic.Stage({
		container: 'container',
		width: STAGE_X,
		height: STAGE_Y
	});
	
	//create layer object
	gBackgroundLayer  = new Kinetic.Layer();
	gBoardLayer = new Kinetic.Layer();
	gMessageLayer = new Kinetic.Layer();
}

//------------------------------------------------
// Remove child node of stage & layer (KineticJS)
//------------------------------------------------
function clearStageLayer()
{
	gBackgroundLayer.removeChildren();
	gBoardLayer.removeChildren();
	gMessageLayer.removeChildren();
	
	gStage.removeChildren(); 
}

//----------------------------------------------
// create a puzzle
//
// newPuzzle= 0: restore info from demo back
//            1: create new puzzle
// activePoly: active block draggiable or not  
//----------------------------------------------
function createPuzzle(newPuzzle, activePoly)
{
	//var fixedBlock = boardSizeInfo[gBoardSizeId].x * boardSizeInfo[gBoardSizeId].y / 5 - 1; //for debug only
	var fixedBlock = (boardSizeInfo[gBoardSizeId].numOfLevel - gLevelId)* 2; 
	
	initBoardState(boardSizeInfo[gBoardSizeId].x,boardSizeInfo[gBoardSizeId].y, fixedBlock, newPuzzle);
	
	if(activePoly) activePolygon();
	
	//writeFinishMsg(); //for test only
}

//---------------------
// initial board state 
//---------------------
function initBoardState(boardX, boardY, numOfFixedBlocks, newPuzzle)
{
	//initial global variable
	SCREEN_BOARD_X = boardX;
	SCREEN_BOARD_Y = boardY;
	BOARD_WIDTH = (SCREEN_BOARD_X * BLOCK_CELL_SIZE);
	BOARD_HIGH  = (SCREEN_BOARD_Y * BLOCK_CELL_SIZE);
	boardStartX = (STAGE_X-BOARD_WIDTH)/2;
	boardStartY = (STAGE_Y-BOARD_HIGH)/2;
	gTotalBlockCell = (SCREEN_BOARD_X * SCREEN_BOARD_Y);
	gBlockUsed = 0
	gBlockCellUsed = 0;
	
	//clear stage & create layer
	clearStageLayer();
	addBackgroundLayer();	
	addBoard2Layer();
	
	createOperatorObject();
	addOperator2Layer();
	
	if(newPuzzle) { //create new puzzle
		gBoardState = createBoard(SCREEN_BOARD_X, SCREEN_BOARD_Y); //external function
		clearPolyInsertOrder(); //for hints 
		randomBlock(gBlockGroup); //external function
		randomBlockStyle(gBlockGroup); //external function
		randomPolyInitPos(gBlockGroup.length - numOfFixedBlocks);
		
		clearFixedBlock();
		if(numOfFixedBlocks) {
			//random assign fixed block to board from sloved board
			result = findAnswer(gBoardState, 0);
			addFixedBlock2Layer(result.op, numOfFixedBlocks);
		}	
		addBlock2Layer(numOfFixedBlocks); 
	} else { //back from demo, restore save info
		restoreFixedBlock2Layer();
		restoreBlock2Layer(numOfFixedBlocks);
		
		//restore last focus poly
		if(lastFocusPolyId >= 0) {
			setFocusPoly(getLastFocusPoly());
			showOperatorObject(getLastFocusPoly());
		}
	}
	
	gStage.add(gBackgroundLayer);
	gStage.add(gBoardLayer);
	gStage.add(gMessageLayer);	
	
	if(!newPuzzle && checkSolution)checkButton(1); //restore check solution message
}

//-----------------------------------------
// Random the initial position of polygon 
//-----------------------------------------
var polyInitPos;
function randomPolyInitPos(availablePoly)
{
	var midId = (availablePoly > 5)?Math.floor((availablePoly+1)/2): availablePoly;
	var distance =  Math.floor((STAGE_X - BLOCK_CELL_SIZE*2) / midId);
	
	polyInitPos=[];
	for(var id=0; id < availablePoly; id++) {
		polyInitPos[id] = id;	
	}

	//random position of id
	for(var id=0; id < availablePoly; id++) {
		var swapId =  Math.floor(Math.random()*(availablePoly));
		var tmpId = polyInitPos[id];

		polyInitPos[id] = polyInitPos[swapId];	
		polyInitPos[swapId] = tmpId;
	}
	
	//----------------------------------
	// set the position by random index
	//----------------------------------
	for(var id=0; id < availablePoly; id++) {
		var index = polyInitPos[id];
		
		polyInitPos[id] = { 
			x:Math.round(((index<midId)?index:(index-midId)) * distance + BLOCK_CELL_SIZE*2.5),
			y:Math.round((index < midId)?(BLOCK_CELL_SIZE*2.8):(STAGE_Y - BLOCK_CELL_SIZE * 2.8))
		};
	}
}

//-----------------------------------
// get polygon position by index id
//-----------------------------------
function getPolyInitPos(id)
{
	return polyInitPos[id];
}

//-------------------------
// clear fixed block group
//-------------------------
var gFixedPolyGroup= [];
function clearFixedBlock()
{
	gFixedPolyGroup= [];
}

//--------------------------
// Add fixed block to layer
//--------------------------
function addFixedBlock2Layer(op, numOfFixedBlocks)
{
	var fixedPoly;
	var polyId =0;

	for(var id=0; id < gBlockGroup.length; id++) {
		//order: insert order, < 0: without insert it 
		if(gBlockGroup[id].order >= 0 && gBlockGroup[id].order < numOfFixedBlocks) {
			var block = dupOpBlock(gBlockGroup[id].blockStyle[gBlockGroup[id].usedStyle], op, 0);
			var poly = block2Polygon(block); 
			var pos = SlovedPos2BoardPos(op, gBlockGroup[id].pos)

			var leftUpPos = getLeftUpPos(block);
			var centerPos = getCenterPos(block);
			
			var offsetX = centerPos.x+leftUpPos.x;
			var offsetY = centerPos.y+leftUpPos.y;
			
			var startX = boardStartX + (pos.x-1 + offsetX) * BLOCK_CELL_SIZE;	
			var startY = boardStartY + (pos.y-1 + offsetY) * BLOCK_CELL_SIZE;	
			
			gBlockGroup[id].polyId = -polyId - 1; //for link to fixed poly (fixed polyId  = -polyId+1)

			gFixedPolyGroup[polyId] = {};	
			gFixedPolyGroup[polyId].block = block;
	
			fixedPoly = new Kinetic.Polygon({
				x: startX,
				y: startY,
				offset: [ offsetX * BLOCK_CELL_SIZE, offsetY *  BLOCK_CELL_SIZE ],
				points: poly,
				fill: FIXED_BLOCK_COLOR, 
				stroke: FIXED_BORDER_COLOR,
				strokeWidth: 2
			});	
			gFixedPolyGroup[polyId].poly = fixedPoly;
			
			fixedPoly.blockId = id; //index for reference to gBlockGroup
			fixedPoly.polyId = polyId; //index for reference to gFixedPolyGroup
			fixedPoly.centerPos = centerPos;
		
			gBoardLayer.add(fixedPoly);
			if(!insertBlockToBoard(gBoardState, SCREEN_BOARD_X, SCREEN_BOARD_Y, block, pos, id+1)) {
				dumpBoard(gBoardState);
				throw new Error("Design error");
			}
			polyId++;
		}
	}
	//dumpBoard(gBoardState);
}

//--------------------------------------------
// restore fixed block (from demo saved info)
//--------------------------------------------
function restoreFixedBlock2Layer()
{
	for(var id=0; id < gFixedPolyGroup.length; id++) {
		gBoardLayer.add(gFixedPolyGroup[id].poly);
		gBlockCellUsed += gFixedPolyGroup[id].block.length;
		gBlockUsed++;
	}	
}

//--------------------------------------------
// duplicate a block base on operator method
// normalize: block need normalize or not
//--------------------------------------------
function dupOpBlock(srcBlock, op, normalize)
{
	var dstBlock;
	
	//duplicate block	
	dstBlock = [];
	for(var i = 0; i < srcBlock.length; i++) {
		dstBlock[i] = {};
		dstBlock[i].x = srcBlock[i].x;
		dstBlock[i].y = srcBlock[i].y;
	}
	
	if(op.leftRightFlip) {
		//(X, Y) ==> (-X, Y)
		for(var i = 0 ; i < dstBlock.length; i++) {
			dstBlock[i].x = -dstBlock[i].x;
		}
	}
	
	if(op.upDownFlip) {
		//(X, Y) ==> (X, -Y)
		for(var i = 0 ; i < dstBlock.length; i++) {
			dstBlock[i].y = -dstBlock[i].y;
		}
	}

	if(op.rotate) { 
		//(X, Y) ==> (Y, X)  
		for(var i = 0 ; i < dstBlock.length; i++) {
			var tmpX = dstBlock[i].x;
			dstBlock[i].x = dstBlock[i].y;
			dstBlock[i].y = tmpX;
		}
	}
	
	if(normalize) blockNormalization(dstBlock);
	
	return dstBlock
}

//--------------------------------------------------------
// convert sloved board position to board state position
// for (gBoardState)
//--------------------------------------------------------
function SlovedPos2BoardPos(op, pos)
{
	var boardPos = { x:pos.x, y:pos.y };
	
	if(op.leftRightFlip) {
		boardPos.x = SCREEN_BOARD_X - boardPos.x - 1;
	}
	if(op.upDownFlip) {
		boardPos.y = SCREEN_BOARD_Y - boardPos.y - 1;
	}
	if(op.rotate) {
		var tmpX = boardPos.x;
		boardPos.x = boardPos.y;
		boardPos.y = tmpX;
	}
	
	return boardPos;
}

//--------------------------
// add background to layer 
//--------------------------
function addBackgroundLayer()
{
	var borderWidth = Math.round(BLOCK_CELL_SIZE/2);
	var textOffset = Math.round(BLOCK_CELL_SIZE/6);
	var titleFontSize = Math.round(BLOCK_CELL_SIZE*1.35);
	
	var titleText1 = new Kinetic.Text({
		x: textOffset, 
		y: textOffset,
		text: "Pentominos Puzzle",
		fill: BACKGROUND_COLOR,
		fontSize: titleFontSize,
		//fontFamily: "Calibri",
	
		fontStyle:"bold",
		shadowColor: 'black',
		shadowBlur: 10,
		shadowOffset: [2, 2],
		shadowOpacity:0.3
	});	

	var titleText2 = new Kinetic.Text({
		x: textOffset, 
		y: STAGE_Y-titleFontSize - 15,
		text: "智慧拼盤",
		fill: BACKGROUND_COLOR,
		fontSize: titleFontSize,
		//fontFamily: "Calibri",
		fontStyle:"bold",
		shadowColor: 'black',
		shadowBlur: 10,
		shadowOffset: [2, 2],
		shadowOpacity:0.3
	});	

	var versionText = new Kinetic.Text({
		x: 0, 
		y: STAGE_Y-titleFontSize/3.5,
		text: versionString, 
		fill: BACKGROUND_COLOR,
		fontSize: titleFontSize/4,
		fontStyle:"bold",
		shadowColor: 'black',
		shadowBlur: 9,
		shadowOffset: [2, 2],
		shadowOpacity:0.3
	});
	
	var background = new Kinetic.Rect({
		x: 0,
		y: 0,
		width: STAGE_X,
		height: STAGE_Y,
		fill: BACKGROUND_COLOR
	});	
	
	var boardBackground = new Kinetic.Rect({
		x: boardStartX,
		y: boardStartY,
		width: SCREEN_BOARD_X*BLOCK_CELL_SIZE,
		height: SCREEN_BOARD_Y*BLOCK_CELL_SIZE,
		fill: BACKGROUND_BOARD_COLOR
	});		

	var borderUp = new Kinetic.Rect({
		x: boardStartX-borderWidth,
		y: boardStartY-borderWidth,
		width: SCREEN_BOARD_X*BLOCK_CELL_SIZE+borderWidth*2,
		height: borderWidth,
		fill: BORDER_COLOR
	});		
	var borderLeft = new Kinetic.Rect({
		x: boardStartX-borderWidth,
		y: boardStartY,
		width: borderWidth,
		height: SCREEN_BOARD_Y*BLOCK_CELL_SIZE+borderWidth,
		fill:  BORDER_COLOR
	});	
	
	var borderRight = new Kinetic.Rect({
		x: boardStartX+SCREEN_BOARD_X*BLOCK_CELL_SIZE,
		y: boardStartY,
		width: borderWidth,
		height: SCREEN_BOARD_Y*BLOCK_CELL_SIZE+borderWidth,
		fill: BORDER_COLOR
	});	

	var borderDown = new Kinetic.Rect({
		x: boardStartX-borderWidth,
		y: boardStartY+SCREEN_BOARD_Y*BLOCK_CELL_SIZE,
		width: SCREEN_BOARD_X*BLOCK_CELL_SIZE+borderWidth*2,
		height: borderWidth,
		fill: BORDER_COLOR
	});	
	
	var borderborder = new Kinetic.Rect({
		x: boardStartX-borderWidth,
		y: boardStartY-borderWidth,
		width: SCREEN_BOARD_X*BLOCK_CELL_SIZE+borderWidth*2,
		height: SCREEN_BOARD_Y*BLOCK_CELL_SIZE+borderWidth*2,
		stroke: BORDER_STROKE_COLOR,
		strokeWidth: 2
	});	
	
	gBackgroundLayer.add(background);
	gBackgroundLayer.add(titleText1);
	gBackgroundLayer.add(titleText2);
	gBackgroundLayer.add(versionText);
	gBackgroundLayer.add(boardBackground);
	gBackgroundLayer.add(borderUp);
	gBackgroundLayer.add(borderLeft);
	gBackgroundLayer.add(borderRight);
	gBackgroundLayer.add(borderDown);
	gBackgroundLayer.add(borderborder);
}

//--------------------------------
// Draw a board and add to layer
//--------------------------------
function addBoard2Layer()
{
	var board = new Kinetic.Shape({
		x: boardStartX,
		y: boardStartY,

		drawFunc: function(canvas) {
			//draw vertical line
			var context = canvas.getContext();
			for(var x = 0; x <= SCREEN_BOARD_X ; x++) {
				context.beginPath();
				context.moveTo(x*BLOCK_CELL_SIZE, 0);
				context.lineTo(x*BLOCK_CELL_SIZE, BLOCK_CELL_SIZE*SCREEN_BOARD_Y);
				context.closePath();
				canvas.fillStroke(this);
			}
			
			//draw horizontal line
			for(var y = 0; y <= SCREEN_BOARD_Y ; y++) {
				context.beginPath();
				context.moveTo(0, y*BLOCK_CELL_SIZE);
				context.lineTo(BLOCK_CELL_SIZE*SCREEN_BOARD_X,  y*BLOCK_CELL_SIZE);
				context.closePath();
				canvas.fillStroke(this);
			}
		},
		stroke: BOARD_COLOR,
		strokeWidth: 1
	});
	gBoardLayer.add(board);
}

//-----------------------------------------
// create polygon blocks and add to layer
//-----------------------------------------
function addBlock2Layer(fixedBlock)
{
	createPolygon(gBlockGroup, fixedBlock);

	for(var g = 0; g < gPolyGroup.length; g++) {
		gBoardLayer.add(gPolyGroup[g].poly);
	}
}

//----------------------------------
// restore polygon blocks to layer
//----------------------------------
function restoreBlock2Layer(fixedBlock)
{
	//-------------------------------------------------------------------
	// if restore from backup it can not drag again with kineticJS 4.4.0
	// so re-create object and copy attr from backup - 04/04/2013
	//-------------------------------------------------------------------
	clonePolygon(saveInfo.gPolyGroup, fixedBlock);

	for(var g = 0; g < gPolyGroup.length; g++) {
		var poly = gPolyGroup[g].poly;
		gBoardLayer.add(poly);
		
		//restore already inserted poly
		if(poly.pos.x > 0) {
			poly.setZIndex(gBlockUsed+1);//after (board + blockUsed) 
			clearShadow(poly);
			setColor(poly, 1); //set normal color
			gBlockCellUsed += gPolyGroup[g].block.length;
			gBlockUsed++;
		}
		
	}
}

//======================================
// BEGIN for create polygon 
//======================================

//-----------------------------------------------------------------------------
// sort point for draw Polygon: 
// Each point connect to two point, one on horizontal the other on vertical.
// 
// (1) Set begin point as current point
//
// (2) from current point to find next horizontal point: 
//     (2.1) find nearest right point; if not found, find the nearest left point 
//     (2.2) set this point as current point and find next vertical point
//
// (3) from current point to find the next vertical point:
//     (3.1) find nearest down point; if not found, find the nearest up point 
//     (3.2) set this point as current point and find next horizontal point
//
// (4) repeat (2) ~ (3) until all point found
//-----------------------------------------------------------------------------
function polyRegular(poly)
{
	var size = poly.length;
	var tmpIndex;
	var mode= 0; hMode = 0, vMode = 2;
	
	//console.log(poly);
	
	for(var i = 0; i < size-1; i++) {
		tmpIndex = -1;
		do {
			for(var j = i+1; j < size; j++) {
				switch(mode) {
				case 0: //right point (H - right)
					if(poly[i].y == poly[j].y && poly[i].x < poly[j].x) {
						if (tmpIndex < 0 || poly[tmpIndex].x > poly[j].x) {
							tmpIndex = j;
						}		
					}
					break;
				case 1: //left point (H - left)
					if(poly[i].y == poly[j].y && poly[i].x > poly[j].x) {
						if (tmpIndex < 0 || poly[tmpIndex].x < poly[j].x) {
							tmpIndex = j;
						}		
					}
					break;
				case 2: //up point (V - up)
					if(poly[i].x == poly[j].x && poly[i].y > poly[j].y) {
						if (tmpIndex < 0 || poly[tmpIndex].y < poly[j].y) {
							tmpIndex = j;
						}		
					}
					break;	
				case 3: //down point (V - down)
					if(poly[i].x == poly[j].x && poly[i].y < poly[j].y) {
						if (tmpIndex < 0 || poly[tmpIndex].y > poly[j].y) {
							tmpIndex = j;
						}		
					}
					break;
				}		
			}
			if(tmpIndex < 0) { //not found
				switch(mode) {
				case 0:
					hMode = ++mode;
					break;
				case 1:
					hMode = --mode;
					break;
				case 2:
					vMode = ++mode;
					break;
				case 3:	
					vMode = --mode;
					break;
				}
			}
		} while( tmpIndex < 0);
		
		if(tmpIndex != i+1) {
			//swap 
			var tmp = poly[tmpIndex];
			poly[tmpIndex] = poly[i+1];
			poly[i+1] = tmp;
		}	
		//next search mode
		switch(mode) {
		case 0:
		case 1:
			mode=vMode;
			break;
		case 2:
		case 3:
			mode=hMode;
			break;
		}
	}
	//console.log(poly);
}

//-------------------------------------------------------------------
// extend one block cell as a rectangle point,
// and insert to poly-point, if this point already exit, remove it  
//-------------------------------------------------------------------
function insert2Poly(polyPoint, blockCell) 
{
	var pointExtend = [ {x:blockCell.x,   y:blockCell.y}, 
	                    {x:blockCell.x+1, y:blockCell.y}, 
						{x:blockCell.x,   y:blockCell.y+1}, 
						{x:blockCell.x+1, y:blockCell.y+1} 
					  ];
	outerloop:
	for(var i = 0; i < 4; i++) {
		for(var j = 0; j < polyPoint.length; j++) {
			if(pointExtend[i].x == polyPoint[j].x && pointExtend[i].y == polyPoint[j].y) {
				polyPoint.splice(j, 1); //remove it, if exist
				continue outerloop;
			}
		}
		polyPoint.push({x:pointExtend[i].x, y:pointExtend[i].y}); //insert it, if without exist
	}
}

//-----------------------------------------------------------------
// convert block coordinate system to polygon coordinate (kinetic)
//-----------------------------------------------------------------
function block2Polygon(block)
{
	var polyPoint = [];
	var poly = [];
	
	for(var i = 0; i < block.length; i++) {
		insert2Poly(polyPoint, block[i]);
	}
	polyRegular(polyPoint);
	for(var i = 0; i < polyPoint.length; i++) {
		poly.push(polyPoint[i].x * BLOCK_CELL_SIZE);
		poly.push(polyPoint[i].y * BLOCK_CELL_SIZE);
	}
	
	return poly;
}	  

var lastFocusPolyId = -1; //focus polygon block

function getLastFocusPoly()
{
	if(lastFocusPolyId < 0) return; //return "undefined"
	
	return gPolyGroup[lastFocusPolyId].poly;
}

//-------------------------
// Set focus polygon style
//-------------------------
function setFocusPoly(poly)
{
	if(typeof poly == "undefined") return;
	
	poly.setStroke(FOCUS_BORDER_COLOR);
	poly.setStrokeWidth(2);
	poly.moveToTop();
	lastFocusPolyId = poly.polyId;
}

//----------------------------
// Set un-focus polygon style
//----------------------------
function clearFocusPoly(poly)
{
	if(typeof poly == "undefined") return;
	
	poly.setStroke(BLOCK_BORDER_COLOR);
	poly.setStrokeWidth(2);
	lastFocusPolyId = -1;
}

//----------------------------
// Set shadow
//----------------------------
function setShadow(poly)
{ 
	//poly.enableShadow();
	poly.setShadowColor('black');
	poly.setShadowBlur(5);
	poly.setShadowOffset([4, 4]);
	poly.setShadowOpacity(0.8);
}

//----------------------------
// clear shadow
//----------------------------
function clearShadow(poly)
{
	//poly.disableShadow();
	poly.setShadowColor('white');
	poly.setShadowBlur(0);
	poly.setShadowOffset([0, 0]);
	poly.setShadowOpacity(0);
}

//----------------------------------
// convert a block to outline shape
//----------------------------------
function block2OutlineShape(block, x, y, color, lineWidth)
{
	var poly = block2Polygon(block); 

	var outlineShape = new Kinetic.Shape({
		x: x,
		y: y,
		drawFunc: function(canvas) {
			var context = canvas.getContext();
			//draw vertical line
			context.beginPath();
			context.moveTo(poly[0], poly[1]);
			for(var x = 2; x < poly.length; x+=2) {
				context.lineTo(poly[x], poly[x+1]);
			}
			context.lineTo(poly[0], poly[1]);
			context.closePath();
			//context.stroke(context);
			canvas.fillStroke(this);
		},
		stroke: color,
		strokeWidth: lineWidth
	});
	
	return outlineShape;
}

//------------------------------------------------------------
// convert polygon position (left-up cell) to board (X, Y)
//
// input: 
// (polyX, polyY) = polygen (0,0) position on screen
// (offsetX, offsetY) = from (0,0) to center position
//
// output:
// (x, y) = block (0,0) position for try put into gBoardState
// (boardX, boardY) = center position of polygen on screen
//
// x= -1 : position out of board or over precision
// notes: (x,y) range = [1..SCREEN_BOARD_X], [1..SCREEN_BOARD_Y]
//------------------------------------------------------------
function getPositionOfPoly(polyX, polyY, offsetX, offsetY)
{
	var boardX, boardY;
	var precision = 10; //精確度(Precision)
	var rx = ry = -1;
	
	for(var x = 0; x < SCREEN_BOARD_X; x++) {
		boardX = boardStartX + x * BLOCK_CELL_SIZE;
		if(polyX < boardX-precision || polyX > boardX+precision) continue;
		break;
	}	
	if(x >= SCREEN_BOARD_X) return {x:-1, y:-1};
	
	for(var y = 0; y < SCREEN_BOARD_Y; y++) {
		boardY = boardStartY + y * BLOCK_CELL_SIZE;
		if(polyY < boardY-precision || polyY > boardY+precision) continue;
		
		return {x:x+1, y:y+1, boardX:boardX+offsetX, boardY:boardY+offsetY};
	}
	
	return { x:-1, y:-1};
}

//----------------
// Remove Block
//----------------
function removeBlock(board, poly)
{
	//this poly must in the board; 
	//remove block from board
	removeBlockFromBoard(board, gPolyGroup[poly.polyId].block, poly.pos); //external function
	setShadow(poly);
	//clearOutline(poly.outline); //clear the outline from screen
	setColor(poly, 0.8); //set softer color
		
	poly.pos.x = -1; //means not in the board
	gBlockCellUsed -= gPolyGroup[poly.polyId].block.length;
	gBlockUsed--;
}

//--------------------------------
// remove polygon from gBoardState
//--------------------------------
function removeFromBoard(poly)
{
	if(poly.pos.x > 0) {
		removeBlock(gBoardState, poly);
		removePolyIdFromInsertOrder(poly.polyId); //for hints button
		removeCheck(); //check board state has solution or not
		return (1);
	}
	return (0);
}

//-------------------------------
// get block center point 
// return: {x:width/2, y:high/2}
//-------------------------------
function getCenterPos(block)
{
	var leftUpX, leftUpY, rightDnX, rightDnY;
	
	leftUpX = rightDnX = block[0].x; 
	leftUpY = rightDnY = block[0].y;
	
	for(var i =1; i < block.length; i++) {
		if(block[i].x < leftUpX) leftUpX = block[i].x;
		if(block[i].y < leftUpY) leftUpY = block[i].y;

		if(block[i].x > rightDnX) rightDnX = block[i].x;
		if(block[i].y > rightDnY) rightDnY = block[i].y;
	}
	
	return { x:(1+rightDnX-leftUpX)/2, y:(1+rightDnY-leftUpY)/2 };
}

//--------------------------------
// get left-top position of block
//--------------------------------
function getLeftUpPos(block)
{
	var left = block[0].x; up = block[0].y;
	
	for(var i =1; i < block.length; i++) {
		if(left > block[i].x) left = block[i].x;	
		if(up > block[i].y) up = block[i].y;
	}
	return {x:left, y:up };
}

//--------------------------------
// try insert block to gBoardState
//--------------------------------
//
//       (0,0)  (0,1) 
//   (x)   +-----+
// (-1,1)  |     |
//    +----+     |
//    |      (+) |
//    +----+     +-----+ (2,2)
// (-1,2)  |           |
//         +-----------+ (2,3)
//    |<-1.5->|
//
//  leftUpPos (x) = (-1, 0)
//  centerPos (+) = (1.5, 1.5)  <== (width/2, high/2)
// (unit: block cell)
// 
// goal: want to get screen position of (0,0)
// 
// assume:
// (1) block cell size = 40
// (2) rotate degree = 0
// (3) screen center pos = (100, 200)
// 
//  offsetPos = (centerPos + leftUpPos) = (1.5,1.5) + (-1,0) = (0.5, 1.5)
// 
// screen position of (0,0) 
// = screenCenterPos - offsetPos X blockCellSize
// = (100, 200) - (0.5, 1.5) X 40
// = (100, 200) - (20, 40)
// = ( 80, 160)
//
// ----------------------------------------------------------------------------
//
// why center Point of block need swap ?
//
//   0, 180 degree                       90, 270 degree
//   +---+
//   |   |                             +---------+
//   | + |   center point = (0.5, 1)   |    +    |  center point = (1, 0.5)
//   |   |                             +---------+
//   +---+
//

function tryInsert2Board(poly)
{
	var polyX, polyY;
	var offsetX, offsetY; //offset of (0,0) to center point
	
	var centerPointSwap = (poly.getRotationDeg() / 90) & 1; //0, 90, 180, 270  ==> 0, 1, 0, 1
	var curLeftUpPos = getLeftUpPos(gPolyGroup[poly.polyId].block);
	
	var polyPos;

	//offset = from (0,0) to center position
	if(centerPointSwap) { //swap if rotate 90 or 270 degree
		offsetX = (poly.centerPos.y + curLeftUpPos.x) * BLOCK_CELL_SIZE; 
		offsetY = (poly.centerPos.x + curLeftUpPos.y) * BLOCK_CELL_SIZE; 
	} else {
		offsetX = (poly.centerPos.x + curLeftUpPos.x) * BLOCK_CELL_SIZE; 
		offsetY = (poly.centerPos.y + curLeftUpPos.y) * BLOCK_CELL_SIZE; 
	}
	
	//(poly.getPosition().x ,poly.getPosition()y ) = center position of the polygon on screen, 
	//polygon position of (0,0) = centerPos - offset
	polyX = poly.getPosition().x - offsetX; 
	polyY = poly.getPosition().y - offsetY;

	polyPos = getPositionOfPoly(polyX, polyY, offsetX, offsetY);

	if(polyPos.x > 0) { //poly in board
		//try insert to board
		if(insertBlockToBoard(gBoardState, SCREEN_BOARD_X, SCREEN_BOARD_Y, gPolyGroup[poly.polyId].block, polyPos, poly.blockId+1)) {
			//insert success
			poly.pos = polyPos;
			gBlockCellUsed += gPolyGroup[poly.polyId].block.length;
			gBlockUsed++;
			addPolyId2InsertOrder(poly.polyId); //block order for hints button
			return (1);
		}
	}
	return (0);
}

//----------------------------------------
// create polygon group from block group
//----------------------------------------
function createPolygon(blockGroup, fixedBlock)	
{
	var id, i, polyId=0;
	var firstStyle;
	var poly, centerPos, leftUpPos;
	var pos;
	var poly;

	gPolyGroup = [];
	for(id = 0 ; id < blockGroup.length; id++) {
		if(blockGroup[id].order >= 0 && blockGroup[id].order < fixedBlock) { 
			gBlockCellUsed += blockGroup[id].blockStyle[0].length;
			gBlockUsed++;
 
			//remarked, polyId < 0 for fixed block
			////blockGroup[id].polyId = -1; //fixed block without polygen
			continue; //fixed block 
		} else {
			blockGroup[id].polyId = polyId; //blockGroup link to polyGroup
		}
		
		firstBlock = blockGroup[id].blockStyle[0]; //get the first block 
		
		//conver block to polygon
		poly = block2Polygon(firstBlock); 
		
		gPolyGroup[polyId] = {};
		
		//duplicate first block	
		gPolyGroup[polyId].block = [];
		for(i = 0; i < firstBlock.length; i++) {
			gPolyGroup[polyId].block[i] = {};
			gPolyGroup[polyId].block[i].x = firstBlock[i].x;
			gPolyGroup[polyId].block[i].y = firstBlock[i].y;
		}

		leftUpPos = getLeftUpPos(gPolyGroup[polyId].block);
		centerPos = getCenterPos(gPolyGroup[polyId].block);
		
		pos = getPolyInitPos(polyId);
		
		gPolyGroup[polyId].poly = new Kinetic.Polygon({
			x: pos.x,
			y: pos.y,
			points: poly,
			fill: colorSofter(blockGroup[id].color, 0.8),
			stroke: BLOCK_BORDER_COLOR,
			strokeWidth: 2,
			//offset = center position of polygon (relative to left-up position)
			offset: [ (centerPos.x+leftUpPos.x) * BLOCK_CELL_SIZE, (centerPos.y+leftUpPos.y) *  BLOCK_CELL_SIZE ],
			dragBoundFunc: function(pos) {
				return checkPolyBound(this, pos);
			}	
		});	
		
		poly = gPolyGroup[polyId].poly;
		poly.blockId = id; //index for reference to gBlockGroup
		poly.polyId = polyId; //index for reference to gPolyGroup
		poly.pos = { x:-1, y:-1 }; //current polygen position in board
		poly.centerPos = centerPos;
		
		setShadow(poly);

		//hasRotate and hasFlip for display filp & rotate operator	
		poly.hasRotate = (blockGroup[id].blockStyle.length != 1);
		poly.hasFlip   = blockGroup[id].hasFlip;

		polyId++;
	}
}

function checkPolyBound(poly, pos)
{
	var x = pos.x;
	var y = pos.y;
	var degree = poly.getRotationDeg();	
	var centerX = poly.centerPos.x * BLOCK_CELL_SIZE;
	var centerY = poly.centerPos.y * BLOCK_CELL_SIZE;
	
	if(degree%180 == 0) {
		if(pos.x < centerX+1) x = centerX+1;
		if(pos.x > STAGE_X - centerX-5) x = STAGE_X - centerX-5;

		if(pos.y < centerY+1) y = centerY+1;
		if(pos.y > STAGE_Y - centerY-5) y = STAGE_Y - centerY-5;
	} else {
		//X Y swap
		if(pos.x < centerY+1) x = centerY+1;
		if(pos.x > STAGE_X - centerY-5) x = STAGE_X - centerY-5;

		if(pos.y < centerX+1) y = centerX+1;
		if(pos.y > STAGE_Y - centerX-5) y = STAGE_Y - centerX-5;
	}

	return {x:x,y:y};
}

//-------------------------------------------------------------------
// clone polygon group from backup polygon
//
// if restore from backup it can not drag again with kineticJS 4.4.0
// so re-create object and copy attr from backup - 04/04/2013
//-------------------------------------------------------------------
function clonePolygon(savePolyGroup, fixedBlock)	
{
	var id, i;
	var firstStyle;
	var poly;
	var pos;
	var poly;

	gPolyGroup = [];
	for(id = 0 ; id < savePolyGroup.length; id++) {

		gPolyGroup[id] = {};
		gPolyGroup[id].block = [];
		
		for(i = 0; i < savePolyGroup[id].block.length; i++) {
			gPolyGroup[id].block[i] = {};
			gPolyGroup[id].block[i].x = savePolyGroup[id].block[i].x;
			gPolyGroup[id].block[i].y = savePolyGroup[id].block[i].y;
		}
		
		gPolyGroup[id].poly = new Kinetic.Polygon({
			x: savePolyGroup[id].poly.getX(),
			y: savePolyGroup[id].poly.getY(),
			points: savePolyGroup[id].poly.getPoints(),
			fill: savePolyGroup[id].poly.getFill(),
			stroke: savePolyGroup[id].poly.getStroke(),
			strokeWidth: savePolyGroup[id].poly.getStrokeWidth(),
			offset: savePolyGroup[id].poly.getOffset(),
			dragBoundFunc: function(pos) {
				return checkPolyBound(this, pos);
			}	

		});	
		
		poly = gPolyGroup[id].poly;
		poly.blockId = savePolyGroup[id].poly.blockId; //index for reference to gBlockGroup
		poly.polyId = id; //index for reference to gPolyGroup
		poly.pos = savePolyGroup[id].poly.pos; //current polygen position in board
		poly.centerPos = savePolyGroup[id].poly.centerPos;
		
		var scale = savePolyGroup[id].poly.getScale();
		poly.setScale(scale.x, scale.y);
		poly.setRotationDeg(savePolyGroup[id].poly.getRotationDeg());
		
		setShadow(poly);
		//setPolyBound(poly);
		
		//hasRotate and hasFlip for display filp & rotate operator	
		poly.hasRotate = savePolyGroup[id].poly.hasRotate;
		poly.hasFlip   = savePolyGroup[id].poly.hasFlip;

	}
}


function activePolygon()
{
	//inactivePolygon();
	for(var g = 0; g < gPolyGroup.length; g++) {
		var poly = gPolyGroup[g].poly;
		
		poly.setDraggable(true);
		
		// add cursor style
		poly.on('mouseover', function() {
			document.body.style.cursor = 'move';
		});
		
		poly.on('mouseout', function() {
			document.body.style.cursor = 'default';
		});

		poly.on('dragstart', function() {
			removeFromBoard(this);
			clearFocusPoly(getLastFocusPoly());
			hideOperatorObject(); //disable operator before drag
			setFocusPoly(this);
			setShadow(this);
			gBoardLayer.draw();
		});

		poly.on('dragend', function() {
			if(tryInsert2Board(this)) {
				//insert success
				
				//set to precise location
				this.setX(this.pos.boardX);
				this.setY(this.pos.boardY);
				
				//this.moveToBottom(); //move to bottom of board
				this.setZIndex(gBlockUsed+1); //after (board + blockUsed) 
				
				clearFocusPoly(this);
				hideOperatorObject();
				clearShadow(this);
				//drawOutline(this);
				setColor(this, 1); //set normal color
				gBoardLayer.draw();
				insertCheck();
			} else {
				showOperatorObject(this); //enable operator if insert failed
			}
			
			//dumpBoard(gBoardState); //for debug only
		});
		
		poly.on('click', function() {
			clearFocusPoly(getLastFocusPoly());
			hideOperatorObject(); //remove operator from old position 
			removeFromBoard(this);
			setFocusPoly(this);
			setShadow(this);
			showOperatorObject(this); //enable operator at new position

			//dumpBoard(gBoardState); //for debug only
		});	
/*	
		poly.on('dragmove click', function() {
			// for debug only
			//writeMessage("(x,y) = (" + this.getPosition().x + "," + this.getPosition().y + '), offset(x,y)=(' + this.getOffset().x + ", " + this.getOffset().y  + "), scale = (" + this.getScale().x + ", " + this.getScale().y + "), RotationDeg = " + this.getRotationDeg() );
		});
*/		
	}
}

function inactivePolygon()
{
	for(var g = 0; g < gPolyGroup.length; g++) {
		var poly = gPolyGroup[g].poly;
		poly.setDraggable(false);
		poly.off('mouseover mouseout dragstart dragend click');
	}
	document.body.style.cursor = 'default';
}

//===========================================
// BEGIN for rotate & flip polygon block
//===========================================

//-------------------------------------
// 90 degree clockwise a polygon block
//-------------------------------------
var animateRotate90Object = new animateRotate90();
function rotate90(poly, time)
{
	var block = gPolyGroup[poly.polyId].block;

	
	if(animateRotate90Object.isRunning()) return;
	//console.log(poly.getRotationDeg());
	if(typeof time == "undefined") time = 150;
	animateRotate90Object.init(poly, time);
	animateRotate90Object.start();	
	
	//block rotate 90 degree clockwise, (X, Y) ==> (-Y, X)
	for(var i = 0 ; i < block.length; i++) {
		var tmpX = block[i].x;
		block[i].x = -block[i].y;
		block[i].y = tmpX;
	}
	blockNormalization(block); //external function
}

function rotate90Running()
{
	return animateRotate90Object.isRunning();
}

//---------------------------------
// left-right flip a polygon block
//---------------------------------
var animateFlipObject = new animateLeftRightFlip();
function leftRightFlip(poly, time)
{
	var block = gPolyGroup[poly.polyId].block;
	
	if(animateFlipObject.isRunning()) return;
	if(typeof time == "undefined") time = 150;
	animateFlipObject.init(poly, time);
	animateFlipObject.start();	
	
	//block left right flip, (X , Y) ==> (-X , Y)
	for(var i = 0 ; i < block.length; i++) {
		block[i].x = -block[i].x
	}
	blockNormalization(block); //external function
}

function leftRightFlipRunning()
{
	return animateFlipObject.isRunning();
}

//---------------------------------------
// 90 degree clockwise the focus polygon
//---------------------------------------
function rotateFocusPoly()
{
	//----------------------------------------------------------------------------------------
	// For (kineticJS 4.4.0)
	// previous version will reset degree to 0 if degree >= 360 in animateRotate90 function
	// but it can not work for kineticJS 4.4.0, so set here
	//----------------------------------------------------------------------------------------
	if(getLastFocusPoly().getRotationDeg() >= 360) { // >= 360 degree
		getLastFocusPoly().setRotation(0);
	}
	rotate90(getLastFocusPoly());

	//gBoardLayer.draw();
}

//-----------------------------------
// left-right flip the focus polygon
//-----------------------------------
function flipFocusPoly()
{
	leftRightFlip(getLastFocusPoly());
	////gBoardLayer.draw();
}

var rotateObject; //a rotate object, display on the focus polygon
var flipObject;   //a flip object, display on the focus polygon

//--------------------------------
// create flip & rotate operator
//--------------------------------
function createOperatorObject()
{
	var radius = (BLOCK_CELL_SIZE)/4;

	rotateObject = new Kinetic.Shape({
		drawFunc: function(canvas) {
			var context = canvas.getContext();
			//create a circle, opacity = 0.3 
			context.beginPath();
			context.arc(0, 0, radius, 0, 2.0 * Math.PI, false);
			context.fillStyle =OPERATOR_CIRCLE_COLOR;
			context.fill();
			canvas.fill(this); //for mouse selection

	
			//create a rotate arrow, opacity = 1.0 
			context.beginPath();
			context.globalAlpha=1.0	
			context.arc(0, 0, radius, 1.3 * Math.PI, 2.1 * Math.PI, false);
			context.lineTo(2*radius/3,-radius/3);
			context.lineTo(radius+radius/10,-radius/2.5);
			context.arc(0, 0, radius, 2.1 * Math.PI, 2.1 * Math.PI, true);
			context.arc(0, 0, radius, 2.1 * Math.PI, 1.3 * Math.PI, true);
			context.stroke();
			canvas.fillStroke(this);

			//create a rotate arrow, opacity = 1.0 
			context.beginPath();
			context.arc(0, 0, radius, 2.3 * Math.PI, 1.1 * Math.PI, false);
			context.lineTo(-2*radius/3,radius/3);
			context.lineTo(-radius-radius/10,+radius/2.5);
			context.lineTo(-radius,0);
			context.arc(0, 0, radius, 1.1 * Math.PI, 1.1 * Math.PI, true);
			context.arc(0, 0, radius, 1.1 * Math.PI, 2.3 * Math.PI, true);
			context.stroke();
			canvas.fillStroke(this);			
		
		},
		opacity: 0.3,
//		fill: OPERATOR_CIRCLE_COLOR,
		stroke: OPERATOR_COLOR, //blue
		strokeWidth: 2
	});	
		  

	// add cursor style
	rotateObject.on('mouseover', function() {
		document.body.style.cursor = 'pointer';
	});
		
	rotateObject.on('mouseout', function() {
		document.body.style.cursor = 'default';
	});
	
	rotateObject.on('click', function() {
		rotateFocusPoly();
	});

	//---------------------------------------------------------------
	
	flipObject = new Kinetic.Shape({
		drawFunc: function(canvas) {
			var context = canvas.getContext();
			//create a circle, opacity = 0.3 
			context.beginPath();
			context.arc(0, 0, radius, 0, 2.0 * Math.PI, false);
			context.fillStyle =OPERATOR_CIRCLE_COLOR;
			context.fill();
			canvas.fill(this); //for mouse selection

			
			//create a left arrow, opacity = 1.0 
			context.beginPath();
			context.globalAlpha=1.0	
			
			context.lineTo(radius/10,0);
			context.lineTo(4*radius/5,0);
			context.lineTo(4*radius/5,-radius/5);
			context.lineTo(radius+radius/5,0);
			context.lineTo(4*radius/5,radius/5);
			context.lineTo(4*radius/5,0);
			context.lineTo(radius/10,0);
			context.fill();
			canvas.fill(this);
			//context.stroke(context);
			canvas.fillStroke(this);
		
			//create a right arrow, opacity = 1.0 
			context.beginPath();
			context.lineTo(-radius/10,0);
			context.lineTo(-4*radius/5,0);
			context.lineTo(-4*radius/5,-radius/5);
			context.lineTo(-radius-radius/5,0);
			context.lineTo(-4*radius/5,+radius/5);
			context.lineTo(-4*radius/5,0);
			context.lineTo(-radius/10,0);
			context.fill();
			canvas.fill(this);
			//context.stroke(context);
			canvas.fillStroke(this);
		},
		opacity: 0.3,
//		fill: OPERATOR_CIRCLE_COLOR,
		stroke: OPERATOR_COLOR, //blue
		strokeWidth: 2
	});		

	// add cursor style
	flipObject.on('mouseover', function() {
		document.body.style.cursor = 'pointer';
	});
		
	flipObject.on('mouseout', function() {
		document.body.style.cursor = 'default';
	});

	flipObject.on('click', function() {
		flipFocusPoly();
	});
}

var rotateOperatorStatus = 0; //0: remove, 1:add
var flipOperatorStatus = 0; //0: remove, 1:add

//---------------------------------------------
// Add flip & rotate object to layer (kinetic)
//---------------------------------------------
function addOperator2Layer()
{
	gBoardLayer.add(rotateObject);
	gBoardLayer.add(flipObject);
	rotateObject.hide();
	flipObject.hide();
	rotateOperatorStatus = 0;
	flipOperatorStatus = 0;
}

function showOperatorObject(poly)
{
	var cx = poly.getPosition().x;
	var cy = poly.getPosition().y;

	if(poly.hasRotate) {
		rotateObject.show();
		rotateObject.setX(cx);
		rotateObject.setY(cy);
		rotateObject.moveToTop();
		rotateOperatorStatus = 1;
	}
	
	if(poly.hasFlip) {
		flipObject.show();
		flipObject.setX(cx);
		flipObject.setY(cy -(BLOCK_CELL_SIZE)*2/3);
		flipObject.moveToTop();
		flipOperatorStatus = 1;
	}
	gBoardLayer.draw();

}

//--------------------------------------------------
// Remove flip & rotate object from layer (kinetic)
//--------------------------------------------------
function hideOperatorObject()
{
	if(rotateOperatorStatus) {
		//gBoardLayer.remove(rotateObject);
		rotateObject.hide();
	}
	if(flipOperatorStatus) {
		//gBoardLayer.remove(flipObject);
		flipObject.hide();
	}
	rotateOperatorStatus = 0;
	flipOperatorStatus = 0;
}

//==========================
// BEGIN for search answer 
//==========================

//---------------------------------------------
// find board answer
// inUsedFromPoly: need set used block or not 
//---------------------------------------------
function findAnswer(board, inUsedFromPoly)
{
	var op = { rotate:0, leftRightFlip:0, upDownFlip:0 };
	var answerBoard = screenBoard2AnswerBoard(board, op);
	var answer = new polySolution(); //external function
	var result;
	var boardX, boardY;

	if(inUsedFromPoly) setBlockInUsed();
	else clearBlockInUsed();	
	
	if(op.rotate) {
		boardX = SCREEN_BOARD_Y;
		boardY = SCREEN_BOARD_X;
	} else {
		boardX = SCREEN_BOARD_X;
		boardY = SCREEN_BOARD_Y;
	}
	answer.init(answerBoard, boardX, boardY, 1, gBlockGroup, 1); 
	result = answer.find();
	
	if(result.totalAnswer > 0) {
		//notes: copy back to slovedBoard not slovedBoard[0]
		result.slovedBoard = dupAnswerBoard2ScreenBoard(result.slovedBoard[0], op);
		result.op = op;
	}
	return result;
}

//-----------------------------------------------
// duplicate screen board state to answer board
// for speed up search answer,
// (1) let boardX <= boardY 
// (2) let up cell count >= down cell count
// (3) let left cell count >= right cell count 
//-----------------------------------------------
function screenBoard2AnswerBoard(srcBoard, op)
{
	var dstBoard;
	var boardX = srcBoard.length;
	var boardY = srcBoard[0].length;
	var leftCellCount = rightCellCount = upCellCount = downCellCount = 0;

	//(1) let boardX <= boardY 
	if(boardX > boardY) {
		op.rotate = 1;
		dstBoard = rotateBoard(srcBoard);	
		boardX = dstBoard.length;
		boardY = dstBoard[0].length;
	} else {
		dstBoard = dupBoard(srcBoard);	
	}
	//dumpBoard(dstBoard);

	var halfX = boardX/2;
	var halfY = boardY/2;

	//(2) let up cell count >= down cell count
	for(var x=1; x < boardX; x++) {
		for(var y=1; y <= boardY; y++) {
			if(!dstBoard[x][y]) continue;
			
			if(x < halfX) leftCellCount++;
			else rightCellCount++;
			
			if(y < halfY) upCellCount++;
			else downCellCount++;
		}
	}
	
	if(upCellCount < downCellCount) {
		op.upDownFlip = 1;
		dstBoard = upDownFlipBoard(dstBoard);
	}
	//dumpBoard(dstBoard);
	
	//(3) let left cell count >= right cell count
	if(leftCellCount < rightCellCount) {
		op.leftRightFlip = 1;
		dstBoard = leftRightFlipBoard(dstBoard);
	}
	//dumpBoard(dstBoard);
	
	return dstBoard;
}

//---------------------
// create a new board 
//---------------------
function dupBoard(srcBoard)
{
	var boardX = srcBoard.length;
	var boardY = srcBoard[0].length;
	var dstBoard = [];
	
	for(var x = 0; x < boardX ; x++) {
		dstBoard[x] = [];
		for(var y = 0; y < boardY ; y++) {
			dstBoard[x][y] = srcBoard[x][y];
		}
	}
	return dstBoard;
}

//-----------------------------
// create a rotate board
// (x, y) ==> (y, x)
//-----------------------------
function rotateBoard(srcBoard)
{
	var boardX = srcBoard.length;
	var boardY = srcBoard[0].length;
	var dstBoard = [];
	
	for(var y = 0; y < boardY ; y++) {
		dstBoard[y] = [];
		for(var x = 0; x < boardX ; x++) {
			dstBoard[y][x] = srcBoard[x][y];
		}
	}
	return dstBoard;
}

//-----------------------------
// create a up down flip board
//-----------------------------
function upDownFlipBoard(srcBoard)
{
	var boardX = srcBoard.length;
	var boardY = srcBoard[0].length;
	var dstBoard = [];
	
	for(var x=0; x < boardX; x++) {
		dstBoard[x] = [];
		for(var y=0; y < boardY; y++) {
			dstBoard[x][y] = srcBoard[x][boardY-y-1];
		}
	}
	return dstBoard;
}

//--------------------------------
// create a left right flip board
//--------------------------------
function leftRightFlipBoard(srcBoard)
{
	var boardX = srcBoard.length;
	var boardY = srcBoard[0].length;
	var dstBoard = [];
	
	for(var x=0; x < boardX; x++) {
		dstBoard[x] = [];
		for(var y=0; y < boardY; y++) {
			dstBoard[x][y] = srcBoard[boardX-x-1][y];
		}
	}
	return dstBoard;
}

//-----------------------------------------------
// duplicate answer board to screen board
// base on screenBoard2AnswerBoard operator 
// inverse the order to create screen board
// (1) left right flip 
// (2) up down flip
// (3) rotate
//-----------------------------------------------
function dupAnswerBoard2ScreenBoard(srcBoard, op)
{
	if(op.leftRightFlip) srcBoard = leftRightFlipBoard(srcBoard);
	if(op.upDownFlip) srcBoard = upDownFlipBoard(srcBoard);
	if(op.rotate) srcBoard = rotateBoard(srcBoard);	
	//dumpBoard(srcBoard);
	
	return (srcBoard);

}

//----------------------
// clear block in used
//----------------------
function clearBlockInUsed()
{
	for(var g = 0; g < gBlockGroup.length; g++) {
		gBlockGroup[g].blockUsed = 0;
	}	
}

//--------------------
// set block in used
//--------------------
function setBlockInUsed()
{
	//(1) fixed block
	for(var g = 0; g < gBlockGroup.length; g++) {
		if(gBlockGroup[g].polyId <0) { //block without polygon means fixed
			gBlockGroup[g].blockUsed = 1;
		} else {
			gBlockGroup[g].blockUsed = 0;
		}
	}

	//(2) exist poly, insert by user 	
	for(var g = 0; g < gPolyGroup.length; g++) {
		var poly = gPolyGroup[g].poly;
		
		if(poly.pos.x > 0) {
			gBlockGroup[poly.blockId].blockUsed = 1;
		} else {
			gBlockGroup[poly.blockId].blockUsed = 0;
		}
	}	
}

//==========================================
// BEGIN for check solution & checkbox
//==========================================

var checkSolution = false;
//--------------------------------------
// check solution after insert a block
//--------------------------------------
function insertCheck()
{
	if(gBlockCellUsed >= gTotalBlockCell) {
		inactivePolygon();
		disableAllButton();
		setTimeout(function() {writeFinishMsg();}, 500); //wait 500 ms 
		sloveState = 1;
		return;
	}
	
	if(checkSolution) check();
}

//--------------------------------------
// check solution after remove a block
//--------------------------------------
function removeCheck()
{
	writeMessage("");
	if(checkSolution) check();
}

//---------------- 
// check solution  
//---------------- 
function check()
{
	var result = findAnswer(gBoardState, 1);

	if(result.totalAnswer <= 0) {
		writeMessage(noSolutionText);
		//console.log("No solution, " + "(" + result.elapsedTime + ")");
	} else {
		writeMessage("");
		//dumpBoard(result.slovedBoard[0]);
		//console.log("Elapsed Time : " + result.elapsedTime + "s");
	}
	return result.totalAnswer;
}

//--------------------------
// on checkbox changed
//--------------------------
function checkButton(checked) 
{
	checkSolution = checked;

	writeMessage("");
	if(gBlockCellUsed >= gTotalBlockCell) return; //sloved
	if(checkSolution) check();
}

//==========================
// BEGIN for start button
//==========================

//-----------------------------------------
// wait demo finished and into play mode
//-----------------------------------------
function waitDemoFinish(newPuzzle)
{
	if(demoFinish()) {
		playPuzzle(newPuzzle);	
	} else {
		setTimeout(function() { waitDemoFinish(newPuzzle);}, 100);
	}
}

//---------------------------------------------------------------
// stop demo and into play mode
// newPuzzle: 1: create a new puzzle, 0: restore from demo back
//---------------------------------------------------------------
function startButton(newPuzzle)
{
	demoStop(); //request demo stop
	waitDemoFinish(newPuzzle);
}

//===============================================================
// BEGIN for Hints
//===============================================================

var polyIdOrder; 
//----------------------------------
// clear polygon insert-order stack 
//----------------------------------
function clearPolyInsertOrder()
{
	polyIdOrder = [];
}

//---------------------------------------
// add polygon id to insert-order stack
//---------------------------------------
function addPolyId2InsertOrder(id)
{
	polyIdOrder.push(id);
}

//-------------------------------------------------
// remove exist polygon id from insert-order stack
//-------------------------------------------------
function removePolyIdFromInsertOrder(id)
{
	for(var i=0; i< polyIdOrder.length; i++) {
		if(polyIdOrder[i] == id) {
			polyIdOrder.splice(i, 1);
			break;
		}
	}
}

//----------------------------------------
// get polygon id from insert-order stack
//----------------------------------------
function getPolyIdFromInsertOrder()
{
	return polyIdOrder.pop();
}

//---------------------
// Press hints button
//---------------------
function hintsButton()
{
	var result;
	var moveTime = 350;
	var flashObject;
	var poly, polyId;

	if(gBlockCellUsed >= gTotalBlockCell) return; //solved
	
	//dumpBoard(gBoardState);
	result = findAnswer(gBoardState, 1);
	while(result.totalAnswer <= 0) {
		//-------------------------------------------------------------
		// Current board state has no solution,
		// try remove one block (base on block order) step by step
		// until find the answer
		//-------------------------------------------------------------
		//get the last inserted block
		polyId = getPolyIdFromInsertOrder();

		//remove it from gBoardState
		poly = gPolyGroup[polyId].poly;
		removeBlock(gBoardState, poly)
			
		//try find answer
		result = findAnswer(gBoardState, 1);
	}
	writeMessage("");
	
	clearFocusPoly(getLastFocusPoly());
	hideOperatorObject();

	disableAllButton();
	if(!animateBlockBack(moveTime)) moveTime = 0;
	flashObject = animateHintsBlock(result.slovedBoard, result.op, moveTime);
	
	enableButtonAfterStopRunning(flashObject);
}

//---------------------------
// disable all input button
//---------------------------
function disableAllButton()
{
	//select 
	document.getElementById('boardSizeButton').disabled=true;
	document.getElementById('levelButton').disabled=true;

	document.getElementById('hintsButton').disabled=true;
	document.getElementById('newButton').disabled=true;
	document.getElementById('resetButton').disabled=true;

	document.getElementById('demoButton').disabled=true;
	
	//checkbox
	document.getElementById('checkButton').disabled=true;
}

//--------------------------
// enable start input button
//--------------------------
function visibleStartButton()
{
	document.getElementById('startButton').disabled=false;
	document.getElementById('startButton').style.visibility='visible';
}

//--------------------------
// enable start input button
//--------------------------
function hiddenStartButton()
{ 
	document.getElementById('startButton').disabled=true;
	document.getElementById('startButton').style.visibility='hidden';
}

//--------------------------
// enable all input button
//--------------------------
function enableAllButton()
{
	//select 
	document.getElementById('boardSizeButton').disabled=false;
	document.getElementById('levelButton').disabled=false;

	document.getElementById('hintsButton').disabled=false;
	document.getElementById('newButton').disabled=false;
	document.getElementById('resetButton').disabled=false;

	document.getElementById('demoButton').disabled=false;
	
	//checkbox
	document.getElementById('checkButton').disabled=false;
}

//--------------------
// visible all button
//--------------------
function visibleAllButton()
{
	//select 
	document.getElementById('boardSizeButton').style.visibility='visible';
	document.getElementById('levelButton').style.visibility='visible';

	document.getElementById('hintsButton').style.visibility='visible';
	document.getElementById('newButton').style.visibility='visible';
	document.getElementById('resetButton').style.visibility='visible';
	
	document.getElementById('demoButton').style.visibility='visible';

	//checkbox
	document.getElementById('checkButton').style.visibility='visible';
	document.getElementById('checkboxtext').style.visibility='visible';
}

//--------------------
// hidden all button
//--------------------
function hiddenAllButton()
{
	//select 
	document.getElementById('boardSizeButton').style.visibility='hidden';
	document.getElementById('levelButton').style.visibility='hidden';

	document.getElementById('hintsButton').style.visibility='hidden';
	document.getElementById('newButton').style.visibility='hidden';
	document.getElementById('resetButton').style.visibility='hidden';
	
	document.getElementById('demoButton').style.visibility='hidden';

	//checkbox
	document.getElementById('checkButton').style.visibility='hidden';
	document.getElementById('checkboxtext').style.visibility='hidden';
}

//-----------------------------------------------
// Move un-fixed block back to initial position
//-----------------------------------------------
function animateBlockBack(moveTime)
{
	var id;
	var poly;
	var endPos;
	var movedPoly;
	var count=0;

	for(var id = 0; id < gPolyGroup.length; id++) {
		poly = gPolyGroup[id].poly;
		if(poly.pos.x > 0) continue; //already in board (fixed)

		endPos = getPolyInitPos(id);
		
		//don't move the poly if the position same as initial position 
		if(Math.round(poly.getX()) == endPos.x && Math.round(poly.getY()) == endPos.y) continue;
		
		//move poly back to initial position
		poly.moveToTop()
		poly.transitionTo({
			x: endPos.x,
			y: endPos.y,
			duration: moveTime/1000
		});
	
		count++;
	}
	return count;
}

//---------------------------------
// random flash a available block 
//---------------------------------
function animateHintsBlock(slovedBoard, op, startFlashTime)
{
	var	flashOutline;
	var result = findAvailableBlock(slovedBoard);
	
	var startX = boardStartX + result.x * BLOCK_CELL_SIZE;	
	var startY = boardStartY + result.y * BLOCK_CELL_SIZE;	
	var id = result.id;
	
	var hintsBlock = dupOpBlock(gBlockGroup[id].blockStyle[gBlockGroup[id].usedStyle], op, 1);
	var outlineShape = block2OutlineShape(hintsBlock, startX, startY, FLASH_BORDER_COLOR, 4)
	
	flashOutline = new animateFlash();
	
	flashOutline.init(outlineShape, gBoardLayer, startFlashTime, 3);
	flashOutline.start();	
	
	return flashOutline;
}

//-----------------------------------------------
// random find a available block 
// (next to the exist one)
//------------------------------------------------
function findAvailableBlock(slovedBoard) 
{
	var fromVertical = Math.floor(Math.random()*2); //0: search from horizon, 1: search from vertical
	var boardX = slovedBoard.length-1;
	var boardY = slovedBoard[0].length-1;
	var blockId, polyId;

	if(fromVertical) { 
		//search available block from Y than X
		outloopV0:
		for(var x= 1; x < boardX; x++) {
			for(var y= 1; y < boardY; y++) {
				blockId = slovedBoard[x][y]-1;
				polyId = gBlockGroup[blockId].polyId; //convert block id to poly id
				if(polyId >= 0 && gPolyGroup[polyId].poly.pos.x < 0) {
					//block is not in gBoardState, found it !
					break outloopV0;
				}	
			}
		}

		//find the (0,0) position from X than Y
		outloopV1:
		for(var y= 1; y < boardY; y++) {
			for(var x= 1; x < boardX; x++) {
				if (slovedBoard[x][y]-1 == blockId) {
					break outloopV1;
				}	
			}
		}
	} else {
		//from horizon
		//search available block from X than Y
		outloopH:
		for(var y= 1; y < boardY; y++) {
			for(var x= 1; x < boardX; x++) {
				blockId = slovedBoard[x][y]-1;
				polyId = gBlockGroup[blockId].polyId; //convert block id to poly id

				if(polyId >= 0 && gPolyGroup[polyId].poly.pos.x < 0) {
					//ploy is not in gBoardState, found it !
					break outloopH;
				}	
			}
		}
	}
	return {x:x-1, y:y-1, id:blockId};
}

//------------------------------------------
// enable all button after stop flash block
//------------------------------------------
function enableButtonAfterStopRunning(object, button )
{
	if(object.isRunning()) {
		setTimeout(function() {
			enableButtonAfterStopRunning(object, button);
		}, 200)
	} else {
		delete object;
		enableAllButton();
	}
}

//=========================
// BEGIN for reset button
//=========================

//------------------------------------------------
// Press reset button
// ==> move all polygon back to initial position
//------------------------------------------------
function resetButton()
{
	var result;
	var moveTime = 350;
	var flashObject;

	var poly;
	var polyId;
	
	//remove all fixed poly from board	
	while(polyIdOrder.length > 0) {
		//get the last inserted block
		polyId = polyIdOrder.pop();

		//remove it from gBoardState
		poly = gPolyGroup[polyId].poly;
		removeBlock(gBoardState, poly)
	}
	
	//now no one poly in board, so clear "no solution"  message if exist
	writeMessage("");
	
	clearFocusPoly(getLastFocusPoly());
	hideOperatorObject();
	
	if(animateBlockBack(moveTime)) {
		disableAllButton();
		//enable all button after move back
		setTimeout("enableAllButton();", moveTime+10);
	}
}

//============================================
// BEGIN for board size and level selection
//============================================

//---------------------------
// Input Selection info
//---------------------------
var boardSizeInfo = [ 
	{x:6, y:5,  numOfLevel:3 }, 
	{x:8, y:5,  numOfLevel:3 }, 
	{x:10, y:5, numOfLevel:4 }, 
	{x:10, y:6, numOfLevel:4 } 
];

//------------------------
// on board size change
//------------------------
function boardSizeButton(id) 
{
	gBoardSizeId = parseInt(id)-1;
	gLevelId = 1;
	
	reNewLevelOption(); 
	createPuzzle(1, true);
}

//-----------------
// on level change
//-----------------
function levelButton(id)
{
	gLevelId = parseInt(id);
	createPuzzle(1, true);
}

//-----------------------------------------------
// re-assgin the level option to level selection
//-----------------------------------------------
function reNewLevelOption()
{
	var select = document.getElementById('levelButton');
	var option;
  
	//---------------------------------------------
	// clear select options
	// reference: http://www.somacon.com/p542.php
	//---------------------------------------------
	select.innerHTML = "";
	
	//---------------------------------------------------------------
	// insert option to select 
	// reference: http://www.w3schools.com/jsref/met_select_add.asp
	//---------------------------------------------------------------
	for(var i=0; i < boardSizeInfo[gBoardSizeId].numOfLevel; i++) {
		option = document.createElement('option');
		option.text = levelText + " " + (i+1);
		option.value = i+1;
	
		try	{
			select.add(option,null);
		}
		catch (e) {
			// for IE earlier than version 8
			select.add(option,select.options[null]);
		}
	}
}

//=============================
// BEGIN for finished message
//=============================

//-------------------------
// display finish message
//-------------------------
function writeFinishMsg()
{
	var textHigh=26;
	var textWidth = 12;
	var scaleX = Math.floor((STAGE_X -10) / (finishText.length * textWidth));
	var scaleY = Math.floor((STAGE_Y/3)/textHigh) ;
	
	var finishMsg = new Kinetic.Text({
	
		x: STAGE_X/2 - finishText.length * textWidth/2, 
		y: STAGE_Y/2 - textHigh/2,
		text:  finishText,
		fontSize: textHigh,
		fontStyle:"bold",
		fill: TEXT_FINISH_COLOR,

		shadowColor: 'black',
		shadowBlur: 1,
		shadowOffset: [8, 8],
		shadowOpacity:0.5
	});

	gBoardLayer.add(finishMsg);

	finishMsg.transitionTo({
		x: STAGE_X/2 - finishText.length * textWidth*scaleX /2,
		y:  STAGE_Y/2 - textHigh* scaleY /2 ,
		scale: {x:scaleX, y:scaleY},
		duration: 1, // 1 sec 
		easing: "elastic-ease-in-out"
	});
	setTimeout("nextButton();",600); //after 600ms, display next button
}

//----------------------
// display next button 
//----------------------
function nextButton()
{
	var textHigh= 16;
	var textWidth = 16;
	var padSize =8;

	var textAllWidth = nextText.length * textWidth+ padSize*2;
	var textAllHigh  = textHigh+padSize*2;
	var scaleX = Math.floor(STAGE_X/textAllWidth/4);
	var scaleY = Math.floor(STAGE_Y/textHigh/8) ;

	var centerX = STAGE_X * 3/4;
	var centerY = STAGE_Y * 4/5;
	
	var nextMsg = new Kinetic.Text({
		x: centerX - textAllWidth/2, 
		y: centerY - textAllHigh/2,
		text: nextText,
		fill: NEXT_BUTTON_TEXT_COLOR,
		fontSize: textHigh,
		//fontFamily: "sans-serif",
		//fontFamily:"微軟正黑體",
		//fontStyle:"bold",
		  
		align: 'center',
		width: textAllWidth,
		padding: padSize,
		stroke: NEXT_BUTTON_TEXT_COLOR,
		strokeWidth: 1
	});

	var nextRect = new Kinetic.Rect({
		x: centerX - textAllWidth/2,
		y: centerY - textAllHigh/2,
		stroke: NEXT_BUTTON_BORDER_COLOR,
		strokeWidth: 7,
		fill: NEXT_BUTTON_FILL_COLOR,
		width: textAllWidth,
		height: nextMsg.getHeight(),
		shadowColor: 'black',
		shadowBlur: 10,
		shadowOffset: [30, 30],
		shadowOpacity: 0.5,
		cornerRadius: 5
	});		

	var nextGroup = new Kinetic.Group();
	nextGroup.add(nextRect);
	nextGroup.add(nextMsg);
	gBoardLayer.add(nextGroup);
	
	nextRect.transitionTo({
		x: centerX-textAllWidth*scaleX/2,
		y: centerY-textAllHigh*scaleY/2 ,
	 
		scale: {x:scaleX, y:scaleY},
        duration: 1.5,
		easing: "elastic-ease-out"
	});
	
	nextMsg.transitionTo({
		x: centerX-textAllWidth*scaleX/2,
		y: centerY-textAllHigh*scaleY/2 ,
	 
		scale: {x:scaleX, y:scaleY},
        duration: 1.5,
		easing: "elastic-ease-out"
	});
	
	nextGroup.on('mouseover', function() {
		document.body.style.cursor = 'pointer';
	});
		
	nextGroup.on('mouseout', function() {
			document.body.style.cursor = 'default';
	});
	
	disableIdleDemo(); //don't into demo mode, until click "next button"
	nextGroup.on('click', function() {
		setNextLevel();
		waitIdleDemo();
		createPuzzle(1, true);
		enableAllButton();
	});		
}

//-----------------------
// change level to next 
//-----------------------
function setNextLevel()
{
	if(++gLevelId > boardSizeInfo[gBoardSizeId].numOfLevel) {
		//reset level id and change board size
		gLevelId = 1;
		if(++gBoardSizeId >= boardSizeInfo.length) {
			//reset board size 
			gBoardSizeId = 0;
		}
		reNewLevelOption();
		document.getElementById('boardSizeButton').options[gBoardSizeId].selected = true;
	} else {
		document.getElementById('levelButton').options[gLevelId-1].selected  = true;
	}
	saveBoardSize(gBoardSizeId, gLevelId);
}

//=================================
// BEGIN for change polygen color 
//=================================

//----------------------------
// color = "#RRGGBB"
// softerValue = [0.1 .. 2.0]
//----------------------------
function colorSofter(color, softerValue)
{
	var whiteValue = 255 * (1-softerValue);

	var colorR = ("0"+Math.round(parseInt(color.substr(1,2), 16)*softerValue+whiteValue).toString(16)).slice(-2);
	var colorG = ("0"+Math.round(parseInt(color.substr(3,2), 16)*softerValue+whiteValue).toString(16)).slice(-2);
	var colorB = ("0"+Math.round(parseInt(color.substr(5,2), 16)*softerValue+whiteValue).toString(16)).slice(-2);
	
	return ("#" + colorR + colorG + colorB);
}
//-----------------------------
// softerValue = [0.1 .. 2.0]
//-----------------------------
function setColor(poly, softerValue)
{
	var color = colorSofter(gBlockGroup[poly.blockId].color, softerValue);
	poly.setFill(color); 
}

//==========================================================
// BEGIN for Save|Restore boardSize & Level (localstorage)
//==========================================================

//--------------------------------------
// get demo-ready key from localstorage
//--------------------------------------
function getDemoReady()
{
	return getStorage("PolyDemoReady");
}

//--------------------------------------
// save demo-ready key to localstorage
//--------------------------------------
function setDemoReady()
{
	setStorage("PolyDemoReady", "1");
}

//-----------------------------------------
// remove demo-ready key from localstorage
//-----------------------------------------
function clearDemoReady()
{
	clearStorage("PolyDemoReady");
}

//----------------------------------------
// get demo board size from localstorage
//----------------------------------------
function restoreDemoBoardSize()
{
	var boardSize=parseInt(getStorage("polyDemoBoardSize"));
	
	if(isNaN(boardSize) || ++boardSize >= boardSizeInfo.length) boardSize = 0;
	setStorage("polyDemoBoardSize", boardSize); //save to localstorage

	initBoardSize(boardSize, boardSizeInfo[boardSize].numOfLevel);
}

//----------------------------------
// save board size to localstorage
//----------------------------------
function saveBoardSize(boardSize, level)
{
	setStorage("polyBoardSize", boardSize);
	setStorage("polyLevel", level);
}

//-------------------------------------------
// get board size & level from localstorage
//-------------------------------------------
function restoreBoardSize()
{
	var boardSize=parseInt(getStorage("polyBoardSize"));
	var level=parseInt(getStorage("polyLevel"));
	
	if(isNaN(boardSize) || isNaN(level) || 
	   boardSize < 0 || boardSize >= boardSizeInfo.length || 
	   level < 0 || level > boardSizeInfo[boardSize].numOfLevel ) 
	{
		boardSize = 0;
		level = 1;
	}
	
	initBoardSize(boardSize, level); //minimum board
}

//=======================================
// BEGIN for set|get|clear localstorage
//=======================================
function setStorage(key, value) 
{
	if(typeof(window.localStorage) != 'undefined'){ 
		window.localStorage.setItem(key,value); 
	} 
}

function getStorage(key) 
{
	var value = null;
	if(typeof(window.localStorage) != 'undefined'){ 
		value = window.localStorage.getItem(key); 
	} 
	return value;
}

function clearStorage(key) 
{
	if(typeof(window.localStorage) != 'undefined'){ 
		window.localStorage.removeItem(key); 
	} 
}

//======================
// get system language
//======================
function getSystemLanguage()
{
	var lang = window.navigator.userLanguage || window.navigator.language;
	return lang.toLowerCase();
}

//===============================================
// Text message to screen (for debug only)
//===============================================
function writeMessage(message) {
	var context = gMessageLayer.getContext();
	
	gMessageLayer.clear();
	context.font = '32pt arial';
	context.fillStyle = 'red';
	context.fillText(message, STAGE_X/2-message.length*9.5, STAGE_Y/2+BLOCK_CELL_SIZE * (SCREEN_BOARD_Y/2));
	gBoardLayer.draw(); //FOR: firefox first time will not display 10/21/2012
}

//==============================================
// dump board value to console (for debug only)
//==============================================
function dumpBoard(board)
{
	var buf = "";
	var boardX = board.length;
	var boardY = board[0].length;
	
	for(var y = 0; y < boardY; y++) {
		buf = "";
		for(var x = 0; x < boardX; x++) {
			if(board[x][y] > 9) {
				buf += board[x][y] + " ";
			} else {
				buf += "0" + board[x][y] + " ";
			}			
		}
		console.log(buf);
	}
	console.log("");
}