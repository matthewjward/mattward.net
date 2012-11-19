//currentNav - statsNavLeagueFantasy or statsNavLeagueReal (maybe NBA??)
//currentTeamId - selected fantasy or nba team 
//currentPlayerId - selected player

function pastelColour() {
		this.red = Math.floor(Math.random()*64) + 192;
		this.green = Math.floor(Math.random()*64) + 192;
		this.blue = Math.floor(Math.random()*64) + 192;
}
	
var mouseDownItem = "none";
function doSomething() {			
	if (!mouseDownItem) { return; }     
			
	switch (mouseDownItem)
	{
		
		case ('statsNavLeague'):			
			if (currentNav == 'statsNavLeagueFantasy') 
			{
				var scrollTop = $('#fantasyContent').scrollTop();		
				$('#fantasyContent').scrollTop(scrollTop-10);
			} else {
				var scrollTop = $('#nbaContent').scrollTop();		
				$('#nbaContent').scrollTop(scrollTop-10);			
			}
			break;
		case ('statsFooterLeague'):							
			if (currentNav == 'statsNavLeagueFantasy') 
			{		
				var scrollTop = $('#fantasyContent').scrollTop();					
				$('#fantasyContent').scrollTop(scrollTop+10);					
			} else {
				var scrollTop = $('#nbaContent').scrollTop();					
				$('#nbaContent').scrollTop(scrollTop+10);								
			}
			break;		
		case ('statsNavPlayers'):			
			if (currentNav == 'statsNavLeagueFantasy') 
			{
				var scrollTop = $('#fantasyTeamDetail').scrollTop();		
				$('#fantasyTeamDetail').scrollTop(scrollTop-10);				
			} else	{
				var scrollTop = $('#nbaTeamDetail').scrollTop();		
				$('#nbaTeamDetail').scrollTop(scrollTop-10);				
			}
			break;
		case ('statsFooterPlayers'):							
			if (currentNav == 'statsNavLeagueFantasy') 
			{
				var scrollTop = $('#fantasyTeamDetail').scrollTop();		
				$('#fantasyTeamDetail').scrollTop(scrollTop+10);				
			} else	{
				var scrollTop = $('#nbaTeamDetail').scrollTop();		
				$('#nbaTeamDetail').scrollTop(scrollTop+10);				
			}
			break;
		case ('statsNavCharts'):			
			var scrollTop = $('#fantasyTeamStats').scrollTop();		
			$('#fantasyTeamStats').scrollTop(scrollTop-10);				
			break;			
		case ('statsFooterCharts'):							
			var scrollTop = $('#fantasyTeamStats').scrollTop();		
			$('#fantasyTeamStats').scrollTop(scrollTop+10);				
			break;
		}
									
		if (mouseDownItem != "none") { 	
			setTimeout("doSomething()", 100); 
		}
	}			
	
function stats(parent) {
	this.title = "";
	this.$parent = parent;
	
	graphData = new Object();
	currentLast10only = true;
	haveData = false;
	last_line = 0;
	last_bar = 0;	
	
	setGraph = function(data, type)
	{
		graphType = type;				
		if (!data) {
			if (haveData) {
				data = graphData[type];	
				switch(graphType)
				{
					case('line'):						
						lineSelect(data[last_line-1]);
					break;
					case('bar'):								
						if (last_bar > 0)
							barSelect(last_bar);
					break;
				}				
			}		
		}		
		else {
			haveData = true;						
			graphData[type] = data;										
			switch(graphType){
				case('line'):
					last_line = 0;				
					for (i=1;i<=82;i++){				
						if (data[i-1] != "")
							last_line = i;
					}
					lineSelect(data[last_line-1]);
				break;
				case('bar'):								
					barColours = [];		
					last_bar = 0;								
					for (i=0;i<82;i++){							
						barColours.push("rgb(255, 192, 192)");
						barColours.push("rgb(192, 192, 255)");
						if (data[i][0] > 0)
						{
							last_bar = i+1; 
						}
					}	
					if (last_bar > 0)
						barSelect(last_bar);
				break;
			}						
		}
	}	
	
	drawGraph = function(last10only)
	{						
		if (last10only==undefined)
			last10only = currentLast10only;
		else
			currentLast10only = last10only;
		
		if (haveData!=true) return;

		var graph; 
		var data = [];
		var labels = [];
		var colours = [];						
		
		RGraph.ObjectRegistry.Clear();
		$shinyNewCanvas = $('#shinyNewCanvas');
		RGraph.Reset($shinyNewCanvas[0]);				
		$shinyNewCanvas.attr('width', $('#fantasyTeamStats').css('width'));				
		
		switch(graphType){
			case('line'):							
				for(i=0;i<(last10only ? 10 : 82);i++){
					data.push(graphData['line'][i]['score']);					
				}
				graph = new RGraph.Line("shinyNewCanvas", data);	
				graph.Set('chart.ymin', 125);
				graph.Set('chart.ymax', 250);
				graph.Set('chart.gutter.top', 5);
				graph.Set('chart.gutter.bottom', 5);
				graph.Set('chart.gutter.right', 5);
				graph.Set('chart.numyticks', 0.0000000000001);							
				graph.Set('chart.background.grid.autofit.numvlines', 9);
				graph.Set('chart.tickmarks', lineTick);
				graph.Set('chart.events.click', lineClick); 	
				graph.Set('chart.colors', ["rgb(192, 192, 192)"])				
				break;
			case('bar'):				
				for(i=(last10only ? Math.max(last_bar,10)-10 : 0);i<(last10only ? Math.max(last_bar,10) : 82);i++){
					data.push(graphData['bar'][i]);
					labels.push(i+1);
					colours.push(barColours[2*i]);
					colours.push(barColours[2*i+1]);
				}		
				graph = new RGraph.Bar('shinyNewCanvas', data);
				graph.Set('chart.ymin', 0);
				graph.Set('chart.ymax', 60);
				graph.Set('chart.gutter.top', 5);
				graph.Set('chart.gutter.bottom', 15);
				graph.Set('chart.gutter.right', 5);
				graph.Set('chart.hmargin.grouped', 0.5);
				graph.Set('chart.hmargin', 1);							
				graph.Set('chart.events.click', barClick); 				
				graph.Set('chart.background.grid.autofit.numvlines', 10);			
				graph.Set('chart.colors.sequential', true)
				graph.Set('chart.colors', colours)
				graph.Set('chart.labels', labels)					
				graph.Set('chart.text.size', last10only ? 8 : 6)											
				//graph.Set('chart.xlabels.offset', 2)					
				break;
		};		
		graph.Draw();							
		checkArrows();
	}

	function lineTick (obj, data, value, index, x, y, color, prevX, prevY)
    {                		
		if (graphData['line'][index]['score'] > graphData['line'][index]['opponent_score'])
		{			
			obj.context.beginPath();
			obj.context.arc(x, y, 5, 0 , 2 * Math.PI, false);
			
			if (index == (last_line-1))			
				obj.context.fillStyle = "rgb(255, 128, 128)";
			else
				obj.context.fillStyle = "rgb(255, 192, 192)";
			obj.context.fill();
			obj.context.lineWidth = 1;
			obj.context.strokeStyle = "rgb(255, 128, 128)";
			obj.context.stroke();
		}
		else
		{			
			obj.context.beginPath();
			obj.context.arc(x, y, 5, 0 , 2 * Math.PI, false);
			if (index == (last_line-1))			
				obj.context.fillStyle = "rgb(128, 128, 128)";
			else
				obj.context.fillStyle = "rgb(192, 192, 192)";
			obj.context.fill();
			obj.context.lineWidth = 1;
			obj.context.strokeStyle = "rgb(128, 128, 128)";
			obj.context.stroke();

		}		
    }

	function barSelect(game)
	{

		barColours[2*(game-1)] = "rgb(255, 128, 128)";
		barColours[2*(game-1)+1] = "rgb(128, 128, 255)";			
				
		//need to get the current players team, without hitting the database
		if (currentNav == 'statsNavLeagueReal')
			team = currentTeamId;
		else
			team = $('#'+currentPlayerId).children('#fantasyTeamPlayerTeam').html();
				
		$toolTipBox = $('#toolTipBox');	
		$toolTipBox.empty();				
		$toolTipBox.hide();				
					
		$playerTip = $('<div id="playerTip"><span style="color:rgb(255, 128, 128)"> &#9632</span> Minutes Played: '+graphData['bar'][game-1][0] + ' <span style="color:rgb(128, 128, 255)">&#9632</span> Fantasy Points: '+graphData['bar'][game-1][1]+'</div>')
		$playerTip.appendTo($toolTipBox);
		$.get('cgi/python/hoopsstats.py?task=nbaResult&id='+team+'&game='+last_bar, 
		function(data) {										
			var JSON = eval(data)[0];						
			$toolTipBox = $('#toolTipBox');	
			$resultTip = $('<div id="resultTip">'+JSON['location']+' '+JSON['name']+' '+ (JSON['result'] == null ? "" : JSON['result']+' '+JSON['score'])+'</div>');				
			$resultTip.appendTo($toolTipBox);	
			
			$('#fantasyTeamStats').show();		
			drawGraph();												
			$toolTipBox.show();	//need a check arrows here								
			checkArrows();						
		});			
	}
	
	lineSelect = function(game)
	{
		$toolTipBox = $('#toolTipBox');
		$toolTipBox.empty();		
		if (game['score'] > game['opponent_score'])
			thingo = '<span style="color:rgb(255, 128, 128)">W </span>';
		else
			thingo = '<span style="color:rgb(128, 128, 128)">L </span>';

		$resultTip = $('<div id="resultTip">'+thingo+game['score']+' vs '+game['name']+' '+game['moniker']+' '+game['opponent_score']+'</div>');				
		$resultTip.appendTo($toolTipBox);			
		$('#fantasyTeamStats').show();		
		drawGraph();				
		checkArrows();						
	}	
	
	function barClick (e, bar)
    {        		
        var idx = bar['index'];
		game = Math.round((idx+1)/2);
		if (game == last_bar)
			return;

		barColours[2*(last_bar-1)] = "rgb(255, 192, 192)";
		barColours[2*(last_bar-1)+1] = "rgb(192, 192, 255)";					

		last_bar = game;		
		barSelect(game);
	}	
	
	function lineClick (e, line)
    {        
        game = line['index'] + 1;		
		
		if (game == last_line)
			return;
		
		last_line = game;
		data = graphData['line'];		
		lineSelect(data[game-1]);			
    }
						
	setTeamContent = function(content) 
	{		
		$('#statsNavPlayers').hide();
		$('#statsNavCharts').hide();		
		$statsContent = $('#statsContent');
		$statsContent.empty();			//do we have to?
		currentTeamId = -1;
		
		if (content == 'fantasy')
		{		
			currentNav = 'statsNavLeagueFantasy';
			fantasyColour = new pastelColour();
			$('#statsNavLeagueFantasy').css('background-color','rgb('+fantasyColour.red+','+fantasyColour.green+','+fantasyColour.blue+')');	
			$('#statsNavLeagueReal').css('background-color','white');	
			
			$fantasyContent = $('<div id="fantasyContent" class="scrollable"></div>');
			$fantasyContent.appendTo($statsContent);
		
			$fantasyTeamDetail = $('<div id="fantasyTeamDetail" class="scrollable"></div>');
			$fantasyTeamDetail.appendTo($statsContent);			
			
			$.get('cgi/python/hoopsstats.py?task=fantasyTeams', function(data) {						
				$fantasyContent = $('#fantasyContent');
				var JSON = eval(data);												
				for (var i=0;i<JSON.length;i++){							
					$teamDiv = $('<div id="fantasyTeam'+JSON[i]['id']+'" class="fantasyTeam">'+
									'<div class="fantasyTeamName">'+JSON[i]['name']+' '+JSON[i]['moniker']+'</div>'+
									'<div class="fantasyTeamStat">'+JSON[i]['ave']+'</div>'+
									'<div class="fantasyTeamStat">'+JSON[i]['wins']+' - '+JSON[i]['losses']+'</div>'+									
								'</div>');				
					$teamDiv.appendTo($fantasyContent);
				}			
				checkArrows();
			});

		}
		else
		{
			currentNav = 'statsNavLeagueReal'
			nbaColour = new pastelColour();
			$('#statsNavLeagueReal').css('background-color','rgb('+nbaColour.red+','+nbaColour.green+','+nbaColour.blue+')');	
			$('#statsNavLeagueFantasy').css('background-color','white');	
			
			$nbaContent = $('<div id="nbaContent" class="scrollable"></div>');
			$nbaContent.appendTo($statsContent);
			$nbaContentLeft = $('<div id="nbaContentLeft"></div>');
			$nbaContentLeft.appendTo($nbaContent);
			$nbaContentRight = $('<div id="nbaContentRight"></div>');
			$nbaContentRight.appendTo($nbaContent);
		
			$nbaTeamDetail = $('<div id="nbaTeamDetail" class="scrollable"></div>');
			$nbaTeamDetail.appendTo(statsContent);			
			
			
			
			$.get('cgi/python/hoopsstats.py?task=nbaTeams', function(data) {						
				$nbaContentLeft = $('#nbaContentLeft');
				$nbaContentRight = $('#nbaContentRight');

				var JSON = eval(data);
				
				for (var i=0;i<JSON.length;i++){							
					$newDiv = $('<div id="'+JSON[i]['code']+'" class="nbaTeam">'+JSON[i]['name']+'</div>');						
					JSON[i]['conference'] == 'East' ? $newDiv.appendTo($nbaContentLeft) : $newDiv.appendTo($nbaContentRight);
				}						
				checkArrows();
			});
		}
		
		$fantasyTeamStats = $('<div id="fantasyTeamStats" class="scrollable"></div>');
		$fantasyTeamStats.appendTo($statsContent);				
		$shinyNewCanvas = $('<canvas id="shinyNewCanvas" width="'+$fantasyTeamStats.css('width')+'" height="300"></canvas>');		
		$shinyNewCanvas.appendTo($fantasyTeamStats);				
		$toolTipBox = $('<div id="toolTipBox"></div>');	
		$toolTipBox.appendTo($fantasyTeamStats);	
		$('#fantasyTeamStats').hide();		
	}
		

	this.run = function()
	{				
		//create stats bar
		$statsNav = $('<div id="statsNav"> ' +
						'<div id="statsNavLeague" class="statsNavItem">' +
							'<img class="arrow" width=20px height=20px src=data/images/up-arrow.png>'+
							'<div id="statsNavLeagueFantasy" class="statsNavLeagueInset">fantasy</div>' +
							'<div id="statsNavLeagueReal" class="statsNavLeagueInset">nba</div>' +
						'</div>' +
						'<div id="statsNavPlayers" class="statsNavItem">'+
							'<img class="arrow" width=20px height=20px src=data/images/up-arrow.png>'+
							'<div class="fantasyColumnHeader" id="fantasyColumnHeaderfpG">Pts/G</div>' +
							'<div class="fantasyColumnHeader" id="fantasyColumnHeaderminG">Min/G</div>' +
							'<div class="fantasyColumnHeader" id="fantasyColumnHeaderG">G</div>' +														
						'</div>' +								
						'<div id="statsNavCharts" class="statsNavItem">'+
							'<img class="arrow" width=20px height=20px src=data/images/up-arrow.png>'+
							'<div id="expand">\<\<</div>' +
						'</div>' +
					'</div>');
					
		$statsNav.appendTo(this.$parent);
	
		//create footer
		$statsFooter = $('<div id="statsFooter"> ' +		
							'<div id="statsFooterLeague" class="statsFooterItem">' +
								'<img class="arrow" width=20px height=20px src=data/images/down-arrow.png>'+
							'</div>' +
							'<div id="statsFooterPlayers" class="statsFooterItem">'+
								'<img class="arrow" width=20px height=20px src=data/images/down-arrow.png>'+
							'</div>' +								
							'<div id="statsFooterCharts" class="statsFooterItem">'+
								'<img class="arrow" width=20px height=20px src=data/images/down-arrow.png>'+
							'</div>' +
						'</div>');
		$statsFooter.appendTo(this.$parent);
		
		//hide all the arrows to begin
		$('.arrow').hide();
		
		//create content
		$statsContent = $('<div id="statsContent"></div>');
		$statsContent.appendTo(this.$parent);
		//set content
		setTeamContent('fantasy');		
			
		$('#statsContent').on('mousewheel', '.scrollable',
			function(ev, delta) {					
				var scrollTop = $(this).scrollTop();		
				$(this).scrollTop(scrollTop-10*Math.round(delta));
		});
					
		$('#stats').on('mousedown', '.arrow',
			function() {	
				mouseDownItem = $(this).parent().attr('id');
				doSomething() ;
		});			
				
		$('#stats').on('mouseup mouseleave', '.arrow',
			function() {	
				mouseDownItem = "none";
		});		
		
			
		$('#statsNav').on('click', '.statsNavLeagueInset',
			function() {
				clickId = $(this).attr('id');
				if (clickId == currentNav)
					return;
					
				switch(clickId){
					case('statsNavLeagueFantasy'):
						setTeamContent('fantasy');						
						break;
					case('statsNavLeagueReal'):
						setTeamContent('real');						
						break;					
				}
			}
		);
			
		$('#statsNav').on('click', '#expand',		
			function() {	
				switch($(this).html())
				{
					case('&lt;&lt;'):
						$('#statsNavLeague').hide();
						$('#statsFooterLeague').hide();
						$('#statsNavPlayers').hide();
						$('#statsFooterPlayers').hide();
						
						$('#fantasyContent').hide();
						$('#nbaContent').hide();
						$('#fantasyTeamDetail').hide();
						$('#nbaTeamDetail').hide();
						
						$('#fantasyTeamStats').css('width', '100%');		
						$('#statsNavCharts').css('width', '100%');		
						$('#statsFooterCharts').css('width', '100%');		
						$(this).addClass('expanded');
						$(this).html('>>');
						
						drawGraph(false);	
						
						break;
					case('&gt;&gt;'):
						$('#fantasyTeamStats').css('width', '33.3333333333%');		
						$('#statsNavCharts').css('width', '33.3333333333%');		
						$('#statsFooterCharts').css('width', '33.3333333333%');		
						$(this).removeClass('expanded');
						$(this).html('<<');						
						
						$('#fantasyContent').show();
						$('#nbaContent').show();
						$('#fantasyTeamDetail').show();		
						$('#nbaTeamDetail').show();		
						
						$('#statsNavLeague').show();
						$('#statsFooterLeague').show();
						$('#statsNavPlayers').show();
						$('#statsFooterPlayers').show();
						drawGraph(true);	
						
						break;
				}						
			}
		);			
			
		$('#statsContent').on('mouseover', '.fantasyTeam, .nbaTeam',				
			function() {
				id = $(this).attr('id')
				if (id != currentTeamId) {									
					$('.fantasyTeam').not('#'+currentTeamId).css('background-color','white');					
					$('.nbaTeam').not('#'+currentTeamId).css('background-color','white');										
					highlightTeamColour = new pastelColour();
					$(this).css('background-color','rgb('+highlightTeamColour.red+','+highlightTeamColour.green+','+highlightTeamColour.blue+')');		
				}
			}
		);		
		
		$('#statsContent').on('mouseout', '.fantasyTeam, .nbaTeam',				
			function() {
				id = $(this).attr('id')
				if (id != currentTeamId) {									
					$(this).css('background-color','white');					
				}
			}
		);
		
		$('#statsContent').on('mouseover', '.nbaTeamPlayer, .fantasyTeamPlayer',				
			function() {
				id = $(this).attr('id');
				if (id != currentPlayerId) {									
					$('.fantasyTeamPlayer').not('#'+currentPlayerId).css('background-color','rgb('+currentTeamColour.red+','+currentTeamColour.green+','+currentTeamColour.blue+')');				
					$('.nbaTeamPlayer').not('#'+currentPlayerId).css('background-color','rgb('+currentTeamColour.red+','+currentTeamColour.green+','+currentTeamColour.blue+')');									
					highlightPlayerColour = new pastelColour();
					$(this).css('background-color','rgb('+highlightPlayerColour.red+','+highlightPlayerColour.green+','+highlightPlayerColour.blue+')');		
				}
			}
		);		
		
		$('#statsContent').on('mouseout', '.nbaTeamPlayer, .fantasyTeamPlayer',				
			function() {
				id = $(this).attr('id')
				if (id != currentPlayerId) {									
					$(this).css('background-color','rgb('+currentTeamColour.red+','+currentTeamColour.green+','+currentTeamColour.blue+')');				
				}
			}
		);
			
		$('#statsContent').on('click', '.fantasyTeam',			
			function() {		
				id = $(this).attr('id');						
				if (id != currentTeamId) {				
					$('.fantasyTeam').css('background-color','white');
					currentTeamColour = highlightTeamColour;
					$(this).css('background-color','rgb('+currentTeamColour.red+','+currentTeamColour.green+','+currentTeamColour.blue+')');					
		
					$('#statsNavPlayers').hide();
					$('#statsFooterPlayers').hide();
					$('#statsNavCharts').hide();					
					$('#statsFooterCharts').hide();					
					$('#fantasyTeamStats').hide();
					
					$fantasyTeamDetail = $('#fantasyTeamDetail');
					$fantasyTeamDetail.empty();
		
					currentTeamId = id;		
					currentPlayerId = -1;			
					checkId = id.split('fantasyTeam')[1]
					$.get('cgi/python/hoopsstats.py?task=fantasyTeamDetails&id='+checkId, function(data) {									
						var JSON = eval(data);	
						players = JSON['players']
						results = JSON['results']
						if ((JSON['id'] == checkId) && ($('.fantasyTeamPlayer').length == 0))
						{																																	
							for (var i=0;i<players.length;i++){	
								$playerDiv = $('<div id="'+players[i]['name']+'" class="fantasyTeamPlayer">'+
													'<div class="fantasyTeamPlayerName">'+players[i]['cleanname']+'</div>'+		//name
													'<div id="fantasyTeamPlayerTeam" class="fantasyTeamPlayerStat">'+players[i]['team']+'</div>'+				//team	
													'<div id="fantasyTeamPlayerPos" class="fantasyTeamPlayerStat">'+players[i]['position']+'</div>'+				//pos														
													'<div id="fantasyTeamPlayerG" class="fantasyTeamPlayerStat">'+players[i]['games']+'</div>'+				//games													
													'<div id="fantasyTeamPlayerminG" class="fantasyTeamPlayerStat">'+players[i]['minG']+'</div>'+				//min / g
													'<div id="fantasyTeamPlayerfpG" class="fantasyTeamPlayerStat">'+players[i]['fpG']+'</div>'+				//pts / g																																																																																			
												'</div>');				
								$playerDiv.css('background-color','rgb('+currentTeamColour.red+','+currentTeamColour.green+','+currentTeamColour.blue+')');	
								$playerDiv.appendTo($fantasyTeamDetail);								
							}							
							//create results														
							var lineData = [];
							for (var i=0;i<82;i++){	
								i < results.length ? lineData[i] = results[i] : lineData[i] = "";
							}
							setGraph(lineData, 'line');	
							$('#statsNavPlayers').show();
							$('#statsFooterPlayers').show();
							$('#statsNavCharts').show();	
							$('#statsFooterCharts').show();																										
						}
					});
				}
				else
				{
					setGraph(undefined, 'line');					
				}
			}										
		);

		$('#statsContent').on('click', '.nbaTeam',			
			function() {		
				id = $(this).attr('id');		

				if (id != currentTeamId) {
					$('.nbaTeam').css('background-color','white');
					currentTeamColour = highlightTeamColour;
					$(this).css('background-color','rgb('+currentTeamColour.red+','+currentTeamColour.green+','+currentTeamColour.blue+')');		
				
					$('#statsNavPlayers').hide();
					$('#statsNavCharts').hide();
					$('#fantasyTeamStats').hide();
					
					$nbaTeamDetail = $('#nbaTeamDetail');
					$nbaTeamDetail.empty();			
			
					currentTeamId = id;
					currentPlayerId = -1;
					$.get('cgi/python/hoopsstats.py?task=nbaTeamDetails&id='+id, function(data) {						
						var JSON = eval(data);
						if ((JSON[0]['team'] == currentTeamId) && ($('.nbaTeamPlayer').length == 0))
						{
							$('#statsNavPlayers').show();																	
							for (var i=0;i<JSON.length;i++){							
								$playerDiv = $('<div id="'+JSON[i]['name']+'" class="nbaTeamPlayer">'+
													'<div class="nbaTeamPlayerName">'+JSON[i]['cleanname']+'</div>'+		//name
													'<div id="nbaTeamPlayerOwner" class="nbaTeamPlayerStat">'+JSON[i]['code']+'</div>'+				//owner
													'<div id="nbaTeamPlayerPos" class="nbaTeamPlayerStat">'+JSON[i]['position']+'</div>'+				//pos														
													'<div id="nbaTeamPlayerG" class="nbaTeamPlayerStat">'+JSON[i]['games']+'</div>'+				//games													
													'<div id="nbaTeamPlayerminG" class="nbaTeamPlayerStat">'+JSON[i]['minG']+'</div>'+				//min / g
													'<div id="nbaTeamPlayerfpG" class="nbaTeamPlayerStat">'+JSON[i]['fpG']+'</div>'+				//pts / g																																																																																			
												'</div>');
								$playerDiv.css('background-color','rgb('+currentTeamColour.red+','+currentTeamColour.green+','+currentTeamColour.blue+')');	
								$playerDiv.appendTo($nbaTeamDetail);
							}							
							checkArrows();
						}
					});
				}
			}										
		);	

		$('#statsContent').on('click', '.nbaTeamPlayer, .fantasyTeamPlayer',			
			function() {		
				id = $(this).attr('id');		
										
				if (id != currentPlayerId) {
					$('.fantasyTeamPlayer').css('background-color','rgb('+currentTeamColour.red+','+currentTeamColour.green+','+currentTeamColour.blue+')');		
					$('.nbaTeamPlayer').css('background-color','rgb('+currentTeamColour.red+','+currentTeamColour.green+','+currentTeamColour.blue+')');						
					currentPlayerColour = highlightPlayerColour;
					$(this).css('background-color','rgb('+highlightPlayerColour.red+','+highlightPlayerColour.green+','+highlightPlayerColour.blue+')');		
				
					$('#fantasyTeamStats').hide();	
				
					currentPlayerId = id;					
					$.get('cgi/python/hoopsstats.py?task=playerDetails&id='+id, function(data) {																												
						var JSON = eval(data);	
						var playerData = [];
						for (var i=1;i<=82;i++){	
							playerData.push([0,0]);
						}						
						if (JSON.length > 0)
						{
							if (JSON[0]['name'] == currentPlayerId) //hack - may need to change what is returned
							{							
								for (var i=0;i<JSON.length;i++){	
									playerData[JSON[i]['game']-1] = [JSON[i]['min'], JSON[i]['fp']];
								}							
							}
						}
						$('#statsNavCharts').show();			
						setGraph(playerData, 'bar');						
					});
				}
				else {
					setGraph(undefined, 'bar');					
				}
			}										
		);	
		
												
	}
	
	checkArrows = function()
	{
		if (currentNav == 'statsNavLeagueFantasy') 
		{
			
			if ($('#fantasyContent')[0].scrollHeight-1 > $('#fantasyContent').height())		
				$('#statsFooterLeague, #statsNavLeague').children('.arrow').show();
			else
				$('#statsFooterLeague, #statsNavLeague').children('.arrow').hide();
			
			if ($('#fantasyTeamDetail')[0].scrollHeight-1 > $('#fantasyTeamDetail').height())
				$('#statsNavPlayers, #statsFooterPlayers').children('.arrow').show();
			else
				$('#statsNavPlayers, #statsFooterPlayers').children('.arrow').hide();								
		}			
		else
		{
			if ($('#nbaContent')[0].scrollHeight-1 > $('#nbaContent').height())
				$('#statsFooterLeague, #statsNavLeague').children('.arrow').show();
			else
				$('#statsFooterLeague, #statsNavLeague').children('.arrow').hide();

			if ($('#nbaTeamDetail')[0].scrollHeight-1 > $('#nbaTeamDetail').height())			
				$('#statsNavPlayers, #statsFooterPlayers').children('.arrow').show();
			else
				$('#statsNavPlayers, #statsFooterPlayers').children('.arrow').hide();						
		}
		

		if ($('#fantasyTeamStats')[0].scrollHeight-1 > $('#fantasyTeamStats').height())		
			$('#statsNavCharts, #statsFooterCharts').children('.arrow').show();			
		else
			$('#statsNavCharts, #statsFooterCharts').children('.arrow').hide();				
		
	}
	
	this.resize = function()
	{		
		//most things resize themselves, but i think we need to resize charts		
		drawGraph();
		checkArrows();
	};
}