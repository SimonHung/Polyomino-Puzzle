//-----------------------------------------------------------------------------
// Tetromino:
// A tetromino is a geometric shape composed of four squares, 
// connected orthogonally. 
//
// This, like dominoes and pentominoes, is a particular type of polyomino. 
//
// The corresponding polycube, called a tetracube, 
// is a geometric shape composed of four cubes connected orthogonally.
//
// http://en.wikipedia.org/wiki/Tetromino
//-----------------------------------------------------------------------------

// 1991's Homework
//
// +----+-------------------+--> X
// |    |                   |
// |    +---------+---------+
// |              |         |
// +--------------+         |
// |              |         |
// +----+    +----+----+----+
// |    |    |         |    |
// |    +----+         |    |
// |         |         |    |
// +----+    +---------+    |
// |    |    |         |    |
// |    +----+    +----+    |
// |    |         |    |    |
// |    +----+----+    +----+
// |         |              |
// +---------+--------------+ 
// |
// Y

var polyomino4 = {
boardX: 5, boardY: 8,

maxSolution: 10000, //how many answers want to find 

info: "Tetromino X 2 (1991's homework)\n\n" +
      "A tetromino is a polyomino composed of 4 squares,\n" +
	  "There are 5 different free tetrominos.\n\n" + 
	  "http://en.wikipedia.org/wiki/Tetromino\n",
	  
//blockGroup -> blockStyle -> block -> blockCell
blockGroup: [
	{ //[0]
		//Block 1:
		// +-----+
		// | 0 0 |
		// |     +----------+
		// | 0 1,  1 1, 2 1 |
		// +----------------+
		blockStyle: [
			[ {x:0, y:0}, {x:0, y:1}, {x:1, y:1}, {x:2, y:1} ]
		],
		blockUsed: 0
	},
	{ //[1]
		//Block 2:
		// +-----------+
		// | 0 0,  1 0 |
		// +-----+     +-----+
		//       | 1 1,  2 1 |
		//       +-----------+
		//  
		blockStyle: [
			[ {x:0, y:0}, {x:1, y:0}, {x:1, y:1}, {x:2, y:1} ]
		],
		blockUsed: 0
	},
	{ //[2]
		//Block 3:
		// +--------------------+
		// | 0 0, 1 0, 2 0, 3 0 |
		// +--------------------+
		//
		blockStyle: [
			[ {x:0, y:0}, {x:1, y:0}, {x:2, y:0}, {x:3, y:0} ]
		],
		blockUsed: 0
	},
	{ //[3]
		//Block 4:
		// +----------+
		// | 0 0, 1 0 |
		// |          |
		// | 0 1, 1 1 |
		// +----------+
		//
		blockStyle: [
			[ {x:0, y:0}, {x:1, y:0}, {x:0, y:1}, {x:1, y:1} ]
		],
		blockUsed: 0
	},
	{ //[4]
		//Block 5:
		//      +-----+
		//      | 0 0 |
		// +----+     +----+
		// |-1 1, 0 1, 1 1 |
		// +---------------+
		//
		blockStyle: [
			[ {x:0, y:0}, {x:-1, y:1}, {x:0, y:1}, {x:1, y:1} ]
		],
		blockUsed: 0
	},
	{ //[5]
		//Block 6:
		// +-----+
		// | 0 0 |
		// |     +----------+
		// | 0 1,  1 1, 2 1 |
		// +----------------+
		blockStyle: [
			[ {x:0, y:0}, {x:0, y:1}, {x:1, y:1}, {x:2, y:1} ]
		],
		blockUsed: 0
	},
	{ //[6]
		//Block 7:
		// +-----------+
		// | 0 0,  1 0 |
		// +-----+     +-----+
		//       | 1 1,  2 1 |
		//       +-----------+
		//  
		blockStyle: [
			[ {x:0, y:0}, {x:1, y:0}, {x:1, y:1}, {x:2, y:1} ]
		],
		blockUsed: 0
	},
	{ //[7]
		//Block 8:
		// +--------------------+
		// | 0 0, 1 0, 2 0, 3 0 |
		// +--------------------+
		//
		blockStyle: [
			[ {x:0, y:0}, {x:1, y:0}, {x:2, y:0}, {x:3, y:0} ]
		],
		blockUsed: 0
	},
	{ //[8]
		//Block 9:
		// +----------+
		// | 0 0, 1 0 |
		// |          |
		// | 0 1, 1 1 |
		// +----------+
		//
		blockStyle: [
			[ {x:0, y:0}, {x:1, y:0}, {x:0, y:1}, {x:1, y:1} ]
		],
		blockUsed: 0
	},
	{ //[9]
		//Block 10:
		//      +-----+
		//      | 0 0 |
		// +----+     +----+
		// |-1 1, 0 1, 1 1 |
		// +---------------+
		//
		blockStyle: [
			[ {x:0, y:0}, {x:-1, y:1}, {x:0, y:1}, {x:1, y:1} ]
		],
		blockUsed: 0
	}
	] //blockGroup[]
};