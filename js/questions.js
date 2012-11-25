function questions(parent) {
	this.$num = 1;
	this.title = "";
	this.$parent = parent;
	this.$questionContent = $('<div id="questionContent"></div>');;
	
	this.loadQuestion = function()
	{
		this.$questionContent.load('cgi/python/questions.py?id='+this.$num);
		this.$num++;
		
	};
	
	this.run = function()
	{			
		console.log(this.$parent);
		this.loadQuestion();
		this.$questionContent.load('cgi/python/questions.py?id=1');
		this.$questionContent.appendTo(this.$parent);
				
		$('#questionContent').on('mouseenter', '.answer',			
			function() {	
				red = Math.floor(Math.random()*64) + 192;
				green = Math.floor(Math.random()*64) + 192;
				blue = Math.floor(Math.random()*64) + 192;
				$(this).css('background-color','rgb('+red+','+green+','+blue+')');								
			}		
		);
		
		$('#questionContent').on('mouseleave', '.answer',			
			function() {				
				$(this).css('background-color','white');								
			}		
		);

		$('#questionContent').on('click', '.answer', {umm: this}, 
			function(event) {
				event.data.umm.loadQuestion();
		});		
	};
}