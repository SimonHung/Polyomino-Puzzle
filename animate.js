//===========================================================================================================
//
// Reference: HTML5 Canvas KineticJS Animate Position Tutorial
//
// Reference: HTML5 Canvas Linear Transition Tutorial with KineticJS
//
// Reference: HTML5 Canvas Transition Callback with KineticJS
// 
// 04/04/2013 - work with kinetic-v4.4.0
//===========================================================================================================

function animateFlash() 
{
	var	object, layer;
	var	startFlashTime;
	var flashTimes;

	this.init = function(myObject, myLayer, startTime, times) 
	{
		object = myObject;
		layer = myLayer;
		startFlashTime = startTime;
		flashTimes = times;
	};

	this.start = function() 
	{
		var flashOnTime = 150, flashOffTime = 100;
		var lastToggleTime = 0;
		var flashOn = 1;
		
		var anim = new Kinetic.Animation(
			function(frame) {
				var time = frame.time;
				
				if(time > startFlashTime) {
					if(flashOn) {
						if(time - lastToggleTime > flashOffTime) {
							layer.add(object);
							layer.draw();
							flashOn = 0;
							lastToggleTime = time;
						}
					} else {
						if(time - lastToggleTime > flashOnTime) {
							object.destroy(); //kineticJS 4.4.0
							layer.draw();
							flashOn = 1;
							lastToggleTime = time;
							if(--flashTimes == 0) {
								anim.stop();
								running = 0;
							}
						}
					}
				}				
			},
			layer
		);
		running = 1;
		anim.start();
	};

	this.isRunning = function() 
	{
		return flashTimes;
	};
}

function animateRotate90() 
{
	var object;
	var duration;
	var running = 0;

	this.init = function(myObject, time) 
	{
		object = myObject;
		duration = time;
	};
	
	this.start = function() 
	{
		var degree = object.getRotation()+ Math.PI /2; //add 90 degree

		running = 1;
		object.transitionTo({
			rotation: degree,
			duration: duration/1000,
			callback: function() {
				//no change why ? - kineticJS 4.4.0
				if(degree >= 2*Math.PI) {
					object.setRotation(0);
				}
				running = 0;
			}
		});		
	};
	
	this.isRunning = function() 
	{
		return running;
	};
}	

function animateLeftRightFlip() 
{
	var object;
	var duration;
	var running = 0;

	this.init = function(myObject, time) 
	{
		object = myObject;
		duration = time;
	};

	this.start = function() 
	{
		var upDownFlip = (object.getRotationDeg()/90)&1;  //0, 90, 180, 270 ==> 0,1,0,1
		var xScale = object.getScale().x;
		var yScale = object.getScale().y;

		running = 1;
		if(upDownFlip) { //up-down flip
			yScale = -yScale;
		} else { //left-right flip
			xScale = -xScale;
		}
		
		object.transitionTo({
			scale: {x:xScale, y:yScale},
			duration: duration/1000,
			callback: function() {
				running = 0;
			}
		});		
	};
	
	this.isRunning = function() 
	{
		return running;
	};
}

function animateMove2XY() 
{
	var object;
	var duration;
	var running = 0;

	this.init = function(myObject, x, y, time) 
	{
		object = myObject;
		duration = time;
		endX = x;
		endY = y;
		
	};

	this.start = function() 
	{
		running = 1;
		object.transitionTo({
			x: endX,
			y: endY,
			duration: duration/1000,
			callback: function() {
				running = 0;
			}
		});		
	};
	
	this.isRunning = function() 
	{
		return running;
	};
}
