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
		
	console.log(currentNav);		
	switch (mouseDownItem)
	{
		
		case ('statsNavLeague'):			
			if (currentNav == 'statsNavLeagueFantasy') 
			{
				var scrollTop = $('#fantasyContent').scrollTop();		
				$('#fantasyContent').scrollTop(scrollTop-5);
			} else {
				var scrollTop = $('#nbaContent').scrollTop();		
				$('#nbaContent').scrollTop(scrollTop-5);			
			}
			break;
		case ('statsFooterLeague'):							
			if (currentNav == 'statsNavLeagueFantasy') 
			{		
				var scrollTop = $('#fantasyContent').scrollTop();					
				$('#fantasyContent').scrollTop(scrollTop+5);					
			} else {
				var scrollTop = $('#nbaContent').scrollTop();					
				$('#nbaContent').scrollTop(scrollTop+5);								
			}
			break;		
		case ('statsNavPlayers'):			
			if (currentNav == 'statsNavLeagueFantasy') 
			{
				var scrollTop = $('#fantasyTeamDetail').scrollTop();		
				$('#fantasyTeamDetail').scrollTop(scrollTop-5);				
			} else	{
				var scrollTop = $('#nbaTeamDetail').scrollTop();		
				$('#nbaTeamDetail').scrollTop(scrollTop-5);				
			}
			break;
		case ('statsFooterPlayers'):							
			if (currentNav == 'statsNavLeagueFantasy') 
			{
				var scrollTop = $('#fantasyTeamDetail').scrollTop();		
				$('#fantasyTeamDetail').scrollTop(scrollTop+5);				
			} else	{
				var scrollTop = $('#nbaTeamDetail').scrollTop();		
				$('#nbaTeamDetail').scrollTop(scrollTop+5);				
			}
			break;
		case ('statsNavCharts'):			
			var scrollTop = $('#fantasyTeamStats').scrollTop();		
			$('#fantasyTeamStats').scrollTop(scrollTop-5);				
			break;			
		case ('statsFooterCharts'):							
			var scrollTop = $('#fantasyTeamStats').scrollTop();		
			$('#fantasyTeamStats').scrollTop(scrollTop+5);				
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
	
	setGraph = function(data, type)
	{
		graphType = type;		
		
		if (data) {
			haveData = true;
			last_line = 0;
			last_bar = 0;			
			graphData[type] = data;										
			switch(graphType){
				case('line'):		
					for (i=1;i<=82;i++){				
						if (data[i-1] != "")
							last_line = i;
					}
					$toolTipBox = $('#toolTipBox');
					$toolTipBox.empty();		
					$resultTip = $('<div id="resultTip">'+data[last_line-1]['score']+' vs '+data[last_line-1]['name']+' '+data[last_line-1]['moniker']+' '+data[last_line-1]['opponent_score']+'</div>');				
					$resultTip.appendTo($toolTipBox);			
					$toolTipBox.show();
				break;
				case('bar'):								
					barColours = [];					
					for (i=1;i<=82;i++){					
						if (data[i-1].length == 2)
							last_bar = i; 
						barColours.push("rgb(255, 192, 192)");
						barColours.push("rgb(192, 192, 255)");
					}					
					// refactor
					barSelect(last_bar);
				break;
			}
			
			
		}
	}
	
	checkArrows = function()
	{
		if (currentNav == 'statsNavLeagueFantasy') 
		{
			if ($(fantasyContent)[0].scrollHeight > $(fantasyContent).height())		
				$('#statsFooterLeague, #statsNavLeague').children('.arrow').show();
			else
				$('#statsFooterLeague, #statsNavLeague').children('.arrow').hide();
			if ($(fantasyTeamDetail)[0].scrollHeight > $(fantasyTeamDetail).height())
				$('#statsNavPlayers, #statsFooterPlayers').children('.arrow').show();
			else
				$('#statsNavPlayers, #statsFooterPlayers').children('.arrow').hide();								
		}			
		else
		{
			if ($(nbaContent)[0].scrollHeight > $(nbaContent).height())
				$('#statsFooterLeague, #statsNavLeague').children('.arrow').show();
			else
				$('#statsFooterLeague, #statsNavLeague').children('.arrow').hide();
							
			if ($(nbaTeamDetail)[0].scrollHeight > $(nbaTeamDetail).height())			
				$('#statsNavPlayers #statsFooterPlayers').children('.arrow').show();
			else
				$('#statsNavPlayers #statsFooterPlayers').children('.arrow').hide();						
		}
		if ($(fantasyTeamStats)[0].scrollHeight > $(fantasyTeamStats).height())		
			$('#statsNavCharts, #statsFooterCharts').children('.arrow').show();			
		else
			$('#statsNavCharts, #statsFooterCharts').children('.arrow').hide();				
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
									
		$canvasBox = $('#canvasBox');
		$canvasBox.empty();		
		
		$shinyNewCanvas = $('<canvas id="shinyNewCanvas" width="'+$fantasyTeamStats.css('width')+'" height="300"></canvas>');		
		$shinyNewCanvas.appendTo($canvasBox);							
			
		switch(graphType){
			case('line'):
				if (last10only) 
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
				for(i=0;i<(last10only ? 10 : 82);i++){
					data.push(graphData['bar'][i]);
				}			
				graph = new RGraph.Bar('shinyNewCanvas', data);
				graph.Set('chart.ymin', 0);
				graph.Set('chart.ymax', 60);
				graph.Set('chart.gutter.top', 5);
				graph.Set('chart.gutter.bottom', 5);
				graph.Set('chart.gutter.right', 5);
				graph.Set('chart.hmargin.grouped', 0.5);
				graph.Set('chart.hmargin', 1);							
				graph.Set('chart.events.click', barClick); 				
				graph.Set('chart.background.grid.autofit.numvlines', 10);			
				graph.Set('chart.colors.sequential', true)
				graph.Set('chart.colors', barColours)
				
			break;
		};
		graph.Draw();								
		$('#fantasyTeamStats').show();		
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
					
		$playerTip = $('<div id="playerTip">Minutes Played: '+graphData['bar'][game-1][0] + '  Fantasy Points: '+graphData['bar'][game-1][1]+'</div>')
		$playerTip.appendTo($toolTipBox);
		$.get('cgi/python/hoopsstats.py?task=nbaResult&id='+team+'&game='+last_bar, 
		function(data) {										
			var JSON = eval(data)[0];						
			$toolTipBox = $('#toolTipBox');	
			$resultTip = $('<div id="resultTip">'+JSON['location']+' '+JSON['name']+' '+JSON['result']+' '+JSON['score']+'</div>');				
			$resultTip.appendTo($toolTipBox);
			$toolTipBox.show();
			drawGraph();
		});		
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
		team = currentTeamId.split('fantasyTeam')[1];
		
		$toolTipBox = $('#toolTipBox');	
		$toolTipBox.empty();				
		$resultTip = $('<div id="resultTip">'+data[last_line-1]['score']+' vs '+data[last_line-1]['name']+' '+data[last_line-1]['moniker']+' '+data[last_line-1]['opponent_score']+'</div>');				
		$resultTip.appendTo($toolTipBox);			
		drawGraph();
    }
		
	setTeamContent = function(content) 
	{		
		$('#statsNavPlayers').hide();
		$('#statsNavCharts').hide();
		$('.arrow').hide();
		$statsContent = $('#statsContent');
		$statsContent.empty();			
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
								
				if ($(fantasyContent)[0].scrollHeight > $(fantasyContent).height())
				{
					$('#statsFooterLeague').children('.arrow').show();
					$('#statsNavLeague').children('.arrow').show();
				}
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
				if ($(nbaContent)[0].scrollHeight > $(nbaContent).height())
				{
					$('#statsFooterLeague').children('.arrow').show();
					$('#statsNavLeague').children('.arrow').show();				
				}
			});
		}
		
		$fantasyTeamStats = $('<div id="fantasyTeamStats" class="scrollable"></div>');
		$fantasyTeamStats.appendTo($statsContent);		

		$canvasBox = $('<div id="canvasBox"></div>');
		$canvasBox.appendTo($fantasyTeamStats);		
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
		//fantasyColour = new pastelColour();
		//$('#statsNavLeague').css('background-color','rgb('+fantasyColour.red+','+fantasyColour.green+','+fantasyColour.blue+')');	
	
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
				console.log($(this).html());
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
					$('#statsNavCharts').hide();
					$('#fantasyTeamStats').hide();
					$('#toolTipBox').hide();
					
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
							$('#statsNavPlayers').show();
							$('#statsNavCharts').show();
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
							
							if ($(fantasyTeamDetail)[0].scrollHeight > $(fantasyTeamDetail).height())
							{
								$('#statsNavPlayers').children('.arrow').show();
								$('#statsFooterPlayers').children('.arrow').show();
							}
							
							//create results							
							var lineData = [];
							for (var i=1;i<=82;i++){	
								lineData[i-1] = "";
							}
							for (var i=0;i<results.length;i++){	
								lineData[i] = results[i];															
							}
							setGraph(lineData, 'line');
							drawGraph(true);

							if ($(fantasyTeamStats)[0].scrollHeight > $(fantasyTeamStats).height())
							{
								$('#statsNavCharts').children('.arrow').show();
								$('#statsFooterCharts').children('.arrow').show();
							}							
						}
					});
				}
				else
				{
					setGraph(undefined, 'line');
					drawGraph();
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
							
							if ($(nbaTeamDetail)[0].scrollHeight > $(nbaTeamDetail).height())
							{
								$('#statsNavPlayers').children('.arrow').show();
								$('#statsFooterPlayers').children('.arrow').show();
							}
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
					$('#statsNavCharts').hide();
					$('#toolTipBox').hide();

					currentPlayerId = id;
					
					$.get('cgi/python/hoopsstats.py?task=playerDetails&id='+id, function(data) {												
						var JSON = eval(data);						
						if (JSON[0]['name'] == currentPlayerId)
						{
							var playerData = [];
							for (var i=1;i<=82;i++){	
								playerData.push([]);
							}
							for (var i=0;i<JSON.length;i++){	
								newGame = [];
								newGame.push(JSON[i]['min']);
								newGame.push(JSON[i]['fp']);								
								playerData[JSON[i]['game']-1] = newGame;
							}							
							setGraph(playerData, 'bar');
							drawGraph(true);	
							$('#statsNavCharts').show();
							if ($(fantasyTeamStats)[0].scrollHeight > $(fantasyTeamStats).height())
							{
								$('#statsNavCharts').children('.arrow').show();
								$('#statsFooterCharts').children('.arrow').show();
							}	
						}
					});
				}
				else {
					setGraph(undefined, 'bar');
					drawGraph();
				}
			}										
		);	
		
												
	}
	
	this.resize = function()
	{		
		//most things resize themselves, but i think we need to resize charts		
		drawGraph();
		checkArrows();
	};
}