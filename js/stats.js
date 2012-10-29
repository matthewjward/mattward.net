currentTeamId = -1;
currentNav = "";

function pastelColour() {
		this.red = Math.floor(Math.random()*64) + 192;
		this.green = Math.floor(Math.random()*64) + 192;
		this.blue = Math.floor(Math.random()*64) + 192;
}

function stats(parent) {
	//this.title = "Golden Shower Keeper League 12/13";
	this.title = "";
	this.$parent = parent;
		
	setTeamContent = function(content) 
	{
		$statsContent = $('#statsContent');
		$statsContent.empty();
		if (content == 'fantasy')
		{		
			currentNav = 'statsNavLeagueFantasy';
			fantasyColour = new pastelColour();
			$('#statsNavLeagueFantasy').css('background-color','rgb('+fantasyColour.red+','+fantasyColour.green+','+fantasyColour.blue+')');	
			$('#statsNavLeagueReal').css('background-color','white');	
			
			$fantasyContent = $('<div id="fantasyContent" class="scrollable"></div>');
			$fantasyContent.appendTo($statsContent);
		
			$fantasyTeamDetail = $('<div id="fantasyTeamDetail" class="scrollable"></div>');
			$fantasyTeamDetail.appendTo(statsContent);			

			$.get('cgi/python/hoopsstats.py?task=fantasyTeams', function(data) {						
				$fantasyContent = $('#fantasyContent');
				//$fantasyHeader = $('<div id="fantasyHeader"><div class="fantasyColumnHeader">L</div><div class="fantasyColumnHeader">W</div></div>')
				//$fantasyHeader.appendTo($fantasyContent);
				var JSON = eval(data);
				//console.log(JSON);
								
				for (var i=0;i<JSON.length;i++){							
					$teamDiv = $('<div id="fantasyTeam'+JSON[i]['id']+'" class="fantasyTeam">'+
									'<div class="fantasyTeamName">'+JSON[i]['name']+'</div>'+
									'<div class="fantasyTeamRecord">12 - 23</div>'+
								'</div>');				
					$teamDiv.appendTo($fantasyContent);
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
			});
		}	
	}
		
	this.run = function()
	{				
		//create stats bar
		$statsNav = $('<div id="statsNav"> ' +
						'<div id="statsNavLeague" class="statsNavItem">' +
							'<div id="statsNavLeagueFantasy" class="statsNavItemInset">fantasy</div>' +
							'<div id="statsNavLeagueReal" class="statsNavItemInset">nba</div>' +
						'</div>' +
						//'<div id="statsNavCompare" class="statsNavItem">Player Compare</div>' +
						//'<div id="statsNavRecent" class="statsNavItem">Recent Results</div>' +
						'</div>'
						);
		$statsNav.appendTo(this.$parent);
		fantasyColour = new pastelColour();
		$('#statsNavLeague').css('background-color','rgb('+fantasyColour.red+','+fantasyColour.green+','+fantasyColour.blue+')');	
		
		//create content
		$statsContent = $('<div id="statsContent"></div>');
		$statsContent.appendTo(this.$parent);

		//set content
		setTeamContent('fantasy');		
			
		$('#statsContent').on('mousewheel', '.scrollable',
			function(ev, delta) {	
				console.log($(this)[0].scrollHeight);
				var scrollTop = $(this).scrollTop();		
				$(this).scrollTop(scrollTop-10*Math.round(delta));
		});
		
		$('#statsNav').on('click', '.statsNavItemInset',
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
			
		$('#statsContent').on('mouseenter', '.fantasyTeam',			
			function() {		
				id = $(this).attr('id').split('fantasyTeam')[1];		

				if (id != currentTeamId) {
					$('.fantasyTeam').css('background-color','white');
					currentTeamColour = new pastelColour();
					$(this).css('background-color','rgb('+currentTeamColour.red+','+currentTeamColour.green+','+currentTeamColour.blue+')');					
		
					$fantasyTeamDetail = $('#fantasyTeamDetail');
					$fantasyTeamDetail.empty();
		
					currentTeamId = id;
					$.get('cgi/python/hoopsstats.py?task=fantasyTeamDetails&id='+id, function(data) {			
						var JSON = eval(data);
						if ((JSON[0]['id'] == currentTeamId) && ($('.fantasyTeamPlayer').length == 0))
							for (var i=0;i<JSON.length;i++){							
								$playerDiv = $('<div id="'+JSON[i]['name']+'" class="fantasyTeamPlayer">'+JSON[i]['cleanname']+'</div>');				
								$playerDiv.css('background-color','rgb('+currentTeamColour.red+','+currentTeamColour.green+','+currentTeamColour.blue+')');	
								$playerDiv.appendTo($fantasyTeamDetail);
							}
					});
				}
			}										
		);
			
		$('#statsContent').on('mouseenter', '.nbaTeam',			
			function() {		
				id = $(this).attr('id');		

				if (id != currentTeamId) {
					$('.nbaTeam').css('background-color','white');
					currentTeamColour = new pastelColour();
					$(this).css('background-color','rgb('+currentTeamColour.red+','+currentTeamColour.green+','+currentTeamColour.blue+')');		
				
					$nbaTeamDetail = $('#nbaTeamDetail');
					$nbaTeamDetail.empty();
			
					currentTeamId = id;
					$.get('cgi/python/hoopsstats.py?task=nbaTeamDetails&id='+id, function(data) {						
						var JSON = eval(data);
						if ((JSON[0]['team'] == currentTeamId) && ($('.nbaTeamPlayer').length == 0))
							for (var i=0;i<JSON.length;i++){							
								$playerDiv = $('<div id="'+JSON[i]['name']+'" class="nbaTeamPlayer">'+JSON[i]['cleanname']+'</div>');						
								$playerDiv.css('background-color','rgb('+currentTeamColour.red+','+currentTeamColour.green+','+currentTeamColour.blue+')');	
								$playerDiv.appendTo($nbaTeamDetail);
							}
					});
				}
			}										
		);		
						
	}
}