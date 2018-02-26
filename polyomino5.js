// ----------------------------------------------------------------------------
// About pentominos:
//
// Take five identical squares. Arrange the squares so that each square 
// shares at least one edge with at least one of the other four squares. 
//
// Find all such arrangements, then remove any arrangement that is the same 
// as any another arrangement turned or flipped in any way. 
//
// In the end there are only 12 distinct arrangements, or pieces.
//
// from : http://isomerdesign.com/Pentomino
//        http://en.wikipedia.org/wiki/Pentomino
// ----------------------------------------------------------------------------
//
// +----+-------------------+----+--> X
// |    |                   |    |
// |    +---------+----+    |    |
// |              |    |    |    |
// |    +---------+    +----+    |
// |    |         |         |    |
// +----+    +----+    +----+    |
// |         |    |    |    |    |
// |    +----+    |    |    |    |
// |    |         |    |    |    |
// +----+----+    +----+    +----+
// |         |         |         |
// |         +---------+----+    |
// |         |         |    |    |
// +----+    |    +----+    +----+
// |    |    |    |              |
// |    +----+    +----+    +----+
// |    |         |    |    |    |
// |    +---------+    +----+    |
// |              |              |
// +--------------+--------------+ 
// |
// Y

var polyomino5 = {
//boardX: 3, boardY: 20,
//boardX: 4, boardY: 15,
//boardX: 5, boardY: 12,
boardX: 6, boardY: 10,

maxSolution: 100, //how many answers want to find 

info: "Pentomino\n\n" +
      "A pentomino is a polyomino composed of 5 squares,\n" +
	  "There are 12 different free pentominoes.\n\n" + 
	  "http://en.wikipedia.org/wiki/Pentomino\n" + 
	  "http://isomerdesign.com/Pentomino\n",
	  

//blockGroup -> blockStyle -> block -> blockCell
blockGroup:[ 	
	{ //[0]
		//Block 1:
		// +-----+
		// | 0 0 |
		// |     +---------+
		// | 0 1, 1 1, 2 1 |
		// |     +---------+
		// | 0 2 |
		// +-----+
		//
		blockStyle: [ 
			[{x:0, y:0}, {x:0, y:1}, {x:1, y:1}, {x:2, y:1}, {x:0, y:2}]
		],
		blockUsed: 0
	},
	{ //[1]
		//Block 2:
		// +---------------------+
		// | 0 0, 1 0, 2 0,  3 0 |
		// +---------------+     |
		//                 | 3 1 |
		//                 +-----+
		//
		blockStyle: [ 
			[{x:0, y:0}, {x:1, y:0}, {x:2, y:0}, {x:3, y:0}, {x:3, y:1}]
		],
		blockUsed: 0
	},
	{ //[2]
		//Block 3:
		// +-----+
		// | 0 0 |
		// |     |
		// | 0 1 |
		// |     |
		// | 0 2 |
		// |     |
		// | 0 3 |
		// |     |
		// | 0 4 |
		// |     |
		// | 0 5 |
		// +-----+
		//
		blockStyle: [ 
			[{x:0, y:0}, {x:0, y:1}, {x:0, y:2}, {x:0, y:3}, {x:0, y:4}]
		],
		blockUsed: 0
	},
	{ //[3]
		//Block 4:
		// +-----+
		// | 0 0 |
		// |     +-----+
		// | 0 1,  1 1 |
		// |     +-----+
		// | 0 2 |
		// |     |
		// | 0 3 |
		// +-----+
		//
		blockStyle: [ 
			[{x:0, y:0}, {x:0, y:1}, {x:1, y:1}, {x:0, y:2}, {x:0, y:3}]
		],
		blockUsed: 0
	},
	{ //[4]
		//Block 5:
		//       +-----------+
		//       | 0 0,  1 0 |
		// +-----+     +-----+
		// |-1 1,  0 1 |
		// |     +-----+
		// |-1 2 |
		// +-----+
		//
		blockStyle: [ 
			[{x:0, y:0}, {x:1, y:0}, {x:-1, y:1}, {x:0, y:1}, {x:-1, y:2}]
		],
		blockUsed: 0
	},
	{ //[5]	
		//Block 6:
		//      +-----+
		//      | 0 0 |
		// +----+     |
		// |-1 1, 0 1 |
		// +----+     +-----+
		//      | 0 2,  1 2 |
		//      +-----------+
		//
		blockStyle: [ 
			[{x:0, y:0}, {x:-1, y:1}, {x:0, y:1}, {x:0, y:2}, {x:1, y:2}]
		],
		blockUsed: 0
	},
	{ //[6]
		//Block 7:
		// +-----+
		// | 0 0 |
		// |     |
		// | 0 1 |
		// |     +-----+
		// | 0 2,  1 2 |
		// +-----+     |
		//       | 1 3 |
		//       +-----+
		//
		blockStyle: [
			[{x:0, y:0}, {x:0, y:1}, {x:0, y:2}, {x:1, y:2}, {x:1, y:3}]
		],
		blockUsed: 0
	},
	{ //[7]
		//Block 8:
		// +-----------+
		// | 0 0,  1 0 |
		// |           |
		// | 0 1,  1 1 |
		// +-----+     |
		//       | 1 2 |
		//       +-----+
		//
		blockStyle: [ 
			[{x:0, y:0}, {x:1, y:0}, {x:0, y:1}, {x:1, y:1}, {x:1, y:2}]
		],
		blockUsed: 0
	},
	{ //[8]
		//Block 9:
		//      +-----------+ 
		//      | 0 0,  1 0 |
		//      |     +-----+
		//      | 0 1 |
		// +----+     |
		// |-1 2, 0 2 |
		// +----------+
		//
		blockStyle: [ 
			[{x:0, y:0}, {x:1, y:0}, {x:0, y:1}, {x:-1, y:2}, {x:0, y:2}]
		],
		blockUsed: 0
	},
	{ //[9]
		//Block 10:
		//      +-----+
		//      | 0 0 |
		// +----+     +----+
		// |-1 1, 0 1, 1 1 |
		// +----+     +----+
		//      | 0 2 |
		//      +-----+
		//
		blockStyle: [ 
			[{x:0, y:0}, {x:-1, y:1}, {x:0, y:1}, {x:1, y:1}, {x:0, y:2}]
		],
		blockUsed: 0
	},
	{ //[10]
		//Block 11:
		// +-----+
		// | 0 0 |
		// |     |
		// | 0 1 |
		// |     +---------+
		// | 0 2, 1 2, 2 2 |
		// +---------------+
		//
		blockStyle: [ 
			[{x:0, y:0}, {x:0, y:1}, {x:0, y:2}, {x:1, y:2}, {x:2, y:2}]
		],
		blockUsed: 0
	},
	{ //[11]
		//Block 12:
		// +-----+    +-----+
		// | 0 0 |    | 2 0 |
		// |     +----+     |
		// | 0 1, 1 1,  2 1 |
		// +----------------+
		//
		blockStyle: [ 
			[{x:0, y:0}, {x:2, y:0}, {x:0, y:1}, {x:1, y:1}, {x:2, y:1}]
		],
		blockUsed: 0
	}
	] //blockGroup[]
};
