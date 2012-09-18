var job;

$(document).ready(function() {
	//fullscreen and keep it there
	var canvas = document.getElementById("background-canvas");
	canvas.width = window.innerWidth;	
	canvas.height = window.innerHeight;
		
	window.onresize = function() {		
		var canvas = document.getElementById("background-canvas");
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;		
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	}
	
	//webGLinit	
	initGL(canvas);
	if (gl) {
		job = new Squares();
		job.initShaders();
		job.initBuffers();
		//initTexture();
		job.initWorldObjects();

		//gl.clearColor(0.0, 0.0, 0.0, 1.0); //black
		gl.clearColor(1.0, 1.0, 1.0, 1.0); //white		
		
		tick();	
	}
});

	function tick() {
		requestAnimFrame(tick);
		job.drawScene();
		job.animate();
	}
