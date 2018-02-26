//---------------------------------------------------------------------------------------
// Polyomino Solver
// 
// Program applies a simple "recursive backtracking algorithm" to solve problem.
//
// (1) Gererate all different polyomino style (using flip & rotate).
// (2) Tries the polyomino in all possible orders. 
// (3) Trying to fill the available spaces from left to right and from top to bottom. 
// (4) It keeps placing pieces as long as it finds one that fits in the next available spot.
// (5) When it can't find a piece that fits in the next available spot,
//     it backs up and tries a different piece on the previous level.
//
// Reference from: http://godel.hws.edu/java/pent1.html
//
// by Simon Hung 9/27/2012
//---------------------------------------------------------------------------------------

//global variable
var gMaxBoardDump = 50; //maximum board dump of solution

var textareaElemet;
var isFirefox;

function initPolyomino()
{
	textareaElemet = document.getElementById('text_output');
	isFirefox =('MozBoxSizing' in document.documentElement.style); // FF 0.8+
	
	clearText();
	
	//create all block style
	createBlockStyle(polyomino4.blockGroup); //external function	
	createBlockStyle(polyomino5.blockGroup);	
	createBlockStyle(polyomino8.blockGroup);	
}

//=============================================================================
// BEGIN for button function
//=============================================================================

function buttonDisable()
{
	document.getElementById('block4').disabled = true; 
	document.getElementById('block5').disabled = true; 
	document.getElementById('block8').disabled = true; 
}

function buttonEnable()
{
	document.getElementById('block4').disabled = false; 
	document.getElementById('block5').disabled = false; 
	document.getElementById('block8').disabled = false; 
}

//=============================================================================
// BEGIN for text message function
//=============================================================================

//---------------------
// clear text message
//---------------------
function clearText()
{
	if(isFirefox) {
		//After add text data several times, 
		//firefox will slow down the textarea insert speed ?
		//so delete the old textarea and create a new one
		reNewTextarea(); 
	} else {
		textareaElemet.value = "";
	}
}

//-------------------------
// re-create the textarea
//-------------------------
function reNewTextarea()
{
	var divElement = document.getElementById("outputDiv");
	var oldTextElement = document.getElementById('text_output');
	var newTextElement;
	var row = "20", col = "60";
	
	if(oldTextElement) {
		row = oldTextElement.getAttribute("rows");
		col = oldTextElement.getAttribute("cols");
		divElement.removeChild(oldTextElement);
	}
	newTextElement = divElement.appendChild(document.createElement("textarea"));
	
	newTextElement.setAttribute("id", "text_output");
	newTextElement.setAttribute("rows", row);
	newTextElement.setAttribute("cols", col);
	newTextElement.setAttribute("readonly", "readonly");
	
	textareaElemet = document.getElementById('text_output');
}

function displayText(textValue)
{
	textareaElemet.value += textValue;
}

//=============================================================================
// BEGIN for display board
//=============================================================================

//------------------------
// display board state
//------------------------
function printBoard(board, boardX, boardY)
{
	if(boardX >= boardY) {
		printBoardXY(board, boardX, boardY); //X >= Y
	} else {
		printBoardYX(board, boardX, boardY); //X < Y 
	}
}

//        ╔════╦════╗
//        ║    1    ║
//        ╠═2══╬═8══╣
//        ║    4    ║
//        ╚════╩════╝
//
//      (3)        (5)      (6)       (7)         (9)        (10)
//          ║         ║       ═══╗           ║         ║	        
//        ══╝         ║          ║        ═══╣         ╚═══      ═══════
//                    ║                      ║
//
//     (11)        (12)      (13)     (14)          (15)
//          ║                    ║                           ║
//       ═══╩════     ╔════      ╠═══     ════╦═══       ════╬════
//                    ║          ║            ║              ║
//
//
//                     0    1    2    3	   4    5    6    7
//  var asciiFlag = [ ' ', 'X', 'X', '┘', 'X', '│', '┐', '┤',
//                     8    9   10   11   12   13   14   15
//                    'X', '└', '─', '┴', '┌', '├', '┬', '┼'  ];
//
//-----------------------------------------------------------------------------
// unicode table
// http://www.tamasoft.co.jp/en/general-info/unicode.html
//-----------------------------------------------------------------------------
//                   0         1         2         3	      4         5         6         7
var unicodeFlag = [ '\u0020', '\u0000', '\u0000', '\u2518', '\u0000', '\u2502', '\u2510', '\u2524',
//                   8         9         10        11        12        13        14        15
                    '\u0000', '\u2514', '\u2500', '\u2534', '\u250c', '\u251c', '\u252c', '\u253c' ];
					
function printBoardXY(board, boardX, boardY)
{
	var x, y;
	var value, stop = 0;

	for(y = 0; y <= boardY && !stop ; y++) {
		stop=1
		for(x = 0; x <= boardX; x++) {
			value = 0;
			if(board[x][y] != board[x+1][y]) value += 1;
			if(board[x][y] != board[x][y+1]) value += 2;
			if(board[x][y+1] != board[x+1][y+1]) value += 4;
			if(board[x+1][y] != board[x+1][y+1]) value += 8;
			displayText(unicodeFlag[value]);
			if(value >= 9) displayText('\u2500');
			else displayText(' ');
			
			if(value) stop = 0;
		}
		displayText("\n");
	}
}

//-------------------------------------------------------------------
// rotate Y = X, X= Y	(upside down then 90 degree clockwise)
//-------------------------------------------------------------------
//        ╔════╦════╗
//        ║    2    ║
//        ╠═1══╬═4══╣
//        ║    8    ║
//        ╚════╩════╝

//      (3)      (5)        (6)       (7)       (9)  	   (10) 
//          ║                   ║          ║                    ║
//        ══╝      ═══════      ╚═══    ═══╩═══    ═════╗       ║ 
//                                                      ║       ║ 
//
//     (11)      (12)       (13)         (14)          (15)
//           ║                                   ║             ║
//       ════╣       ╔════     ════╦═══          ╠═══      ════╬════
//           ║       ║             ║             ║             ║
//

// asciiFlag : 
//
//   1 -> 2, 2 -> 1, 4 -> 8, 8 -> 4
//-------------------------------------------
// (03) -> (03) : 1 + 2   => 2 + 1   '┘'
// (05) -> (10) : 1 + 4   => 2 + 8   '─'
// (06) -> (09) : 2 + 4   => 1 + 8   '└'
// (07) -> (11) : 1+2+4   => 2+1+8   '┴'
// (09) -> (06) : 1 + 8   => 2 + 4   '└'
// (10) -> (05) : 2 + 8   => 1 + 4   '│'
// (11) -> (07) : 1+2+8   => 2+1+4   '┤'
// (12) -> (12) : 4 + 8   => 8 + 4   '┌'
// (13) -> (14) : 1+4+8   => 2+8+4   '┬'
// (14) -> (13) : 2+4+8   => 1+8+4   '├'
// (15) -> (15) : 1+2+4+8 => 2+1+8+4 '┼'  
//-------------------------------------------

function printBoardYX(board, boardX, boardY)
{
	var x, y;
	var value, stop = 0;

	//column major 
	for(x = 0; x <= boardX && !stop ; x++) {
		stop=1
		for(y = 0; y <= boardY; y++) {
			value = 0;
			if(board[x][y] != board[x+1][y]) value += 2;     // 1 --> 2
			if(board[x][y] != board[x][y+1]) value += 1;     // 2 --> 1
			if(board[x][y+1] != board[x+1][y+1]) value += 8; // 4 --> 8
			if(board[x+1][y] != board[x+1][y+1]) value += 4; // 8 --> 4
			displayText(unicodeFlag[value]);
			if(value >= 9) displayText('\u2500');
			else displayText(' ');
			
			if(value) stop = 0;
		}
		displayText("\n");
	}
}

//=============================================================================
// BEGIN for dump block (for test only)
//=============================================================================

//----------------
// Display block
//----------------
function showBlock(board, block, boardX, boardY)
{
	var curPos = {};
	var i;

	for(i = 1 ; i <= boardX; i++) {
		curPos = { x:i, y:1 };
		if(insertBlockToBoard(board, boardX, boardY, block, curPos, 1)) {
			printBoard(board, boardX, boardY);
			removeBlockFromBoard(board, block, curPos); //external function
			return;
		}
	}
	displayText("This Block can not put into Board !");
}

//-------------------------
// Display all block style
//-------------------------
function dumpBlock(board, blockGroup, boardX, boardY)
{
	for(var g = 0 ; g < blockGroup.length; g++) {
		displayText("\nBlock " + (g+1) + ":\n");
		
		for(var i = 0 ; i < blockGroup[g].blockStyle.length; i++) {
			showBlock(board, blockGroup[g].blockStyle[i], boardX, boardY);
		}
	}
}

//----------------
// display answer
//----------------
function printSolution(board, polyomino, result)
{
	var max = result.totalAnswer > gMaxBoardDump ? gMaxBoardDump:result.totalAnswer;

	clearText();

	//dumpBlock(board, polyomino.blockGroup, polyomino.boardX, polyomino.boardY); //for test
	displayText(polyomino.info + "\n");

	for(var i = 0; i < max; i++) {
		displayText("(" + (i+1) + ")\n");
		printBoard(result.slovedBoard[i], polyomino.boardX, polyomino.boardY );
	}
	
	if(result.totalAnswer < polyomino.maxSolution) {
		displayText("\nTotal answers = " + result.totalAnswer + ", Elapsed Time : " + result.elapsedTime + "s\n");
	} else {
		displayText("\nOnly find answers = " + result.totalAnswer + ", Elapsed Time : " + result.elapsedTime + "s\n");
		displayText("(max find:" + polyomino.maxSolution + ", max board dump:" + gMaxBoardDump + ")\n");
	}	
}

function clearBlockInUsed(polyomino)
{
	for(var g = 0; g < polyomino.blockGroup.length; g++) {
		polyomino.blockGroup[g].blockUsed = 0;
	}	
} 

//---------------
// main function
//---------------
function main(polyomino)
{
	var board = createBoard(polyomino.boardX, polyomino.boardY);
	var findAnswer = new polySolution();
	var result;
	
	clearBlockInUsed(polyomino);
	buttonDisable();
	
	findAnswer.init(board, polyomino.boardX, polyomino.boardY, polyomino.maxSolution, polyomino.blockGroup, 1); 
	result = findAnswer.find();

	printSolution(board, polyomino, result);

	buttonEnable();
}
