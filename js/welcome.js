var job;
var optionLeft;
var optionTop;
var optionText;
var optionHeight = "120px";
var optionWidth = "200px";
var optionJob;

$(document).ready(function() {
	//fullscreen and keep it there
	var canvas = document.getElementById("background-canvas");
	canvas.width = window.innerWidth;	
	canvas.height = window.innerHeight;
				
	optionClickAnimateComplete = function() {            			
		$(this).html('<div id="optionHeader"><div id="optionTitle">'+optionJob.title+'</div><div id="close">X</div></div>');	
		optionJob.run();				
	};
	
	closeClickAnimateComplete = function() {            			
		$(this).css('z-Index',0);	
		$(this).css('backgroundColor','transparent');
		$(this).click(optionClick);		
		$(this).html(optionText);	
		
		$('.options').each(function(){
			$(this).fadeIn();
		});		
	};
				
	optionClick = function() {     		
		optionLeft = $(this).css('left');
		optionTop = $(this).css('top');
		optionText = $(this).html();		

		optionJob = new window[$(this).attr('id')]($(this));
		
		$('.options').not(this).each(function(){
			$(this).fadeOut();
		});
		
		$(this).html("");
		$(this).off('click');		
		$(this).css('backgroundColor','white');
		$(this).css('z-Index',1);						

		$(this).animate({
						left:"0",
						top:"0",					
						height:"100%",
						width:"100%",
						},1000,optionClickAnimateComplete);    								
	};				
		
	//is there a better way to do this, where i can use this inside?
	$("body").on("click", "#close", function(e){			
			
			$(this).parent().parent().animate({
							left:optionLeft,
							top:optionTop,					
							height:optionHeight,
							width:optionWidth,							
							},500, closeClickAnimateComplete);    
			$(this).parent().parent().html("");				


		
		});

	
	$( ".options" ).click(optionClick); 		
	
	window.onresize = function() {		
		var canvas = document.getElementById("background-canvas");
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;		
		if (gl) {
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
			}
		if(optionJob) {
			optionJob.resize();	
		}
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
