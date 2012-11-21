#!/usr/local/bin/python2.7
# -*- coding: utf-8 -*-

from bs4 import BeautifulSoup, NavigableString, Tag
from datetime import datetime, timedelta
import MySQLdb as mdb
import urllib
import codecs
import re
import config
import smtplib
import string
import time

def check_connection():	
		global con		
		global start_time	
		if (datetime.now() - start_time) > timedelta(seconds=55):
			con.close()
			con = mdb.connect('mattwarddb.db.9795362.hostedresource.com', 'mattwarddb', config.password, 'mattwarddb')
		start_time = datetime.now()		

def output(out):
	if config.output == "screen":
		print out
	else:
		output_lines.append(out)
		
def get_page(url):
	return urllib.urlopen(url).read()

def	check_player_exists(name):
	check_connection()
	cur = con.cursor()        
	cur.execute("SELECT * FROM nbaPlayers WHERE name = %s", (name))    	
	row = cur.fetchone()
	if (row == None):
		cur = con.cursor(mdb.cursors.DictCursor)      
		cur.execute("SELECT * FROM nbaCorrections WHERE bad = %s", (name))    	
		row = cur.fetchone()
		if (row == None):
			return False
		else:
			return row['good']
	return name

def get_player_details(name, last_game):
	soup = BeautifulSoup(get_page("http://hoops.sports.ws/player/%s?lastcount=82" % (name)))
					
	status = soup.find(text=re.compile("Status"))
	
	details = [text for text in status.parent.parent.stripped_strings] #clever!
	
	if details[1] == 'Next Game:':
		db_status = ""
	if details[1] == 'Injury:':
		db_status = ""
		db_injury = details[2]
	else:
		db_status = details[1]		
		if db_status != 'Active':
			db_injury = details[3]
		else:
			db_injury = ""			
	
	section = status.parent.parent.parent						
	detail = section.b.contents[0].replace('(', ' ').split('-',1)
	db_pos = detail[0].strip()
	db_cleanname = detail[1].strip()					
	owned = soup.find(text=re.compile("Percent owned"))					
	db_owned = owned.next_sibling.contents[0].strip('%')	
	
	games = []
	
	#doesn't seem to be shpwing up in games list.... look in recent site activity for now
	#for activity in soup.find_all(class_="spacedtable"):		
	#	if activity.a['href'] == '/player/' + name and activity.find(text=re.compile("Game")) and activity.find(text=re.compile("Fantasy Points")) and activity.find(text=re.compile("Minutes")) and activity.find(text=re.compile("FPPM")): 
	#		game = activity.find(text=re.compile("Game")).split()[2].strip()
	#		if int(game) <= last_game:
	#			continue
	#		date = None
	#		fp = activity.find(text=re.compile("Fantasy Points")).parent.previous_sibling.text
	#		min = activity.find(text=re.compile("Minutes")).parent.previous_sibling.text
	#		games.append({'game': game, 'date': date, 'min': min, 'fp': fp})
			
	#stats are now where they should be!		
	start = soup.find(text=re.compile("Date"))
	node = start.parent.parent.parent
	
	for i in range(1,82):				
		while (type(node.next_sibling) is NavigableString):			#infinite loop?	
			node = node.next_sibling	
		node = node.next_sibling					
		
		if node == None:
			break			
		
		#only games that were played?
		if (type(node.contents[2]) is not NavigableString):
			continue
		else:		
			game = int(node.contents[0].contents[0]) 
			if int(game) <= last_game:
				break		
			date = node.contents[1].contents[0]		
			month = date.split('/')[0].strip().rjust(2,'0')
			day = date.split('/')[1].strip().rjust(2,'0')
			date = '2012-'+month+'-'+day if month < 5 else '2011-'+month+'-'+day			
			min = int(node.contents[3].contents[0])			
			fp = int(node.contents[5].contents[0].strip())
			if min > 0:
				games.append({'game': game, 'date': date, 'min': min, 'fp': fp})
			
			
	return {'status': db_status, 'injury': db_injury, 'pos': db_pos, 'cleanname': db_cleanname, 'owned': db_owned, 'games':games}
	
def add_player(name, team):
	details = get_player_details(name, 0)				
	#needs to become and update or insert
	if (details['status'] == 'Inactive'): 
		return

	output('Adding: ' + details['pos'] + ' ' + details['cleanname'] + ' ' + team)
	check_connection()
	cur = con.cursor()        
	cur.execute("INSERT INTO nbaPlayers(team, name, cleanname, position, owned, active, activereason, injury) VALUES(%s,%s,%s,%s,%s,%s,%s,%s)", (team, name, details['cleanname'], details['pos'], details['owned'], int(details['status'] == 'Active'), details['status'], details['injury']))    		
	
	#will probably need to turn this off once season begins?
	#add_20112012stats(name, details)
	
def add_20112012stats(name, details):	
	for game in details['games']:
		check_connection()
		cur=con.cursor()
		cur.execute("INSERT INTO nbaStats20112012(name, game, date, min, fp) VALUES(%s,%s,%s,%s,%s)", (name, game['game'], game['date'], game['min'], game['fp']))
		
def check_active_player_list(team, active_players):
	#load db players
	check_connection()
	cur = con.cursor(mdb.cursors.DictCursor)        
	cur.execute("SELECT * FROM nbaPlayers WHERE team = %s", (team))  #and not marked?  	
	rows = cur.fetchall()
	db_players = []
	for row in rows:
		db_players.append(row['name'])

	both_lists = []
	for dude in active_players:
		if (dude in db_players):
			both_lists.append(dude)
	
	for dude in both_lists:
		active_players.remove(dude)
		db_players.remove(dude)
	
	if (len(active_players) > 0):
		output('%s has new players' % team)
		for dude in active_players:
			if check_player_exists(dude):
				output(dude + ' already exists - moving teams')
				check_connection()
				cur = con.cursor()        
				cur.execute("UPDATE nbaPlayers SET team = %s WHERE name = %s", (team, dude))    	
			else:
				add_player(dude, team)

	if (len(db_players) > 0):
		output('%s has lost players' % team)
		for dude in db_players:
			output(dude) #mark, not delete - may have moved team?
			check_connection()
			cur = con.cursor()        
			cur.execute("UPDATE nbaPlayers SET team = NULL WHERE name = %s", (dude))    	


			
#get active players for team - update team db if changed
def get_active_player_list(team):
	#soup me up	
	code = team['code']
	name = team['name']
	db_active = team['active']
	output(code + ' ' + str(db_active))
		
	players = []
	tries = 0
	while(len(players) < db_active or db_active == 0):
		tries+=1
		#load the page - max loaded in 31 so may need to do more than one load
		soup = BeautifulSoup(get_page("http://hoops.sports.ws/team.x?team=%s" % (code)))
		#get number of active players
		active = int(soup.find(text=re.compile("Active Players")).replace(')','*').replace('(','*').split('*')[1])
		####hack - there are two henry sims in the knicks####
		if (code == 'NYK'):
			active -= 1		
		#update number of active players	
		if (active != db_active): #this will need an alert on change!
			output('Active has changed for %s from %s to %s' % (name, db_active, active))
			db_active = active
			check_connection()
			cur = con.cursor()        
			cur.execute("UPDATE nbaTeams SET active = %s WHERE Code = %s", (active, code))    		
				
		#get the active players		
		dudes = soup.find_all("span", class_=re.compile("likebox"), limit=min(31, active))	
		for dude in dudes:					
			db_name = dude.a['href'].rsplit('/')[2] 
				
			if(db_name not in players):					
				players.append(db_name)
			
		if (tries == 20):
			break
	return players
			
def check_fantasy_player_list(team, fantasy_players):
	#load db players
	check_connection()
	cur = con.cursor(mdb.cursors.DictCursor)        
	cur.execute("SELECT * FROM nbaPlayers WHERE owner = %s", (team))  #and not marked?  	
	rows = cur.fetchall()
	db_players = []
	for row in rows:
		db_players.append(row['name'])

	both_lists = []
	for dude in fantasy_players:
		if (dude in db_players):
			both_lists.append(dude)
	
	for dude in both_lists:
		fantasy_players.remove(dude)
		db_players.remove(dude)
	
	if (len(fantasy_players) > 0):
		output('%s has new players' % team)
		for dude in fantasy_players:
			output(dude)
			check_connection()
			cur = con.cursor()        
			cur.execute("UPDATE nbaPlayers SET owner = %s WHERE name = %s", (team, dude))    	

	if (len(db_players) > 0):
		output('%s has lost players' % team)
		for dude in db_players:
			output(dude)
			check_connection()
			cur = con.cursor()        
			cur.execute("UPDATE nbaPlayers SET owner = NULL WHERE name = %s", (dude))    	
		
		
def get_fantasy_team_details(team):		
	soup = BeautifulSoup(get_page("http://hoops.sports.ws/league/team_details.x?l=130476&t=%s" % (team['id'])))
		
	players = []
	start = soup.find(text=re.compile("Player"))		
	for player in start.parent.parent.parent.contents:
		if (type(player) is NavigableString):				
			continue			
		if (player.a != None):
			db_name = player.a['href'].rsplit('/')[2] 
			players.append(db_name)
	
	games = []
	start = soup.find(text=re.compile("Recent Games"))		
	for game in start.parent.parent.parent.find_all(text=re.compile("Game")):
		if (game == 'Recent Games'):				
			continue			
		elif (game == 'Upcoming Games'):
			break
		db_game = game.strip('Game :')	
		if int(db_game) <= team['last_game']:
			continue
		info = game.parent.next_sibling.next_sibling.text
		splits = info.split(",")
		away_team = splits[0].rsplit(None, 1)
		home_team = splits[1].rsplit(None, 2)
		away_name = away_team[0].strip()
		away_score = away_team[1].strip()
		home_name = home_team[0].strip()
		home_score = home_team[1].strip()
		if (away_name == team['name']):
			db_score = away_score
			db_opponent = home_name
			db_opponent_score = home_score
		elif (home_name == team['name']):
			db_score = home_score
			db_opponent = away_name
			db_opponent_score = away_score

		games.append({'game': db_game, 'score': db_score, 'opponent': db_opponent, 'opponent_score': db_opponent_score})
			
			
	return {'players': players, 'games': games}
	
	#Games Played by Position seems to be a sensible starting point - possibly top list in the future once season starts
	#start = soup.find(text=re.compile("Games Played by Position"))		
		
	#players = []
	#for player in start.parent.parent.parent.contents:
	#	if (type(player) is NavigableString):				
	#		continue			
	#	elif (player.find(text=re.compile("Ex-Player")) != None):
	#		break
	#	else:			
	#		if (player.a != None):
	#			db_name = player.a['href'].rsplit('/')[2] 
	#			#check player exists - also fixes name issues
	#			correct = check_player_exists(db_name)
	#							
	#			if correct:									
	#				players.append(correct)
	#			else:
	#				output(db_name + " doesn't exist???")		#this probably can't happen?
	
	#return players
	
def update_teams():	
	output('update teams')
	check_connection()
	cur = con.cursor(mdb.cursors.DictCursor)
	cur.execute("SELECT * FROM nbaTeams ORDER BY code")

	rows = cur.fetchall()

	for row in rows:	
		active_players = get_active_player_list(row)
		check_active_player_list(str(row['code']), active_players)
	
def update_fantasy_teams():		
	output('update fantasy teams')
	check_connection()
	cur = con.cursor(mdb.cursors.DictCursor)
	cur.execute("SELECT t1.*, max(game) last_game FROM fantasyTeams as t1 LEFT JOIN fantasyResults as t2 ON (t1.id = t2.team) GROUP BY t1.id ORDER BY t1.id")
	rows = cur.fetchall()
	
	names = {}
	for row in rows:		
		names[row['name']] = row['id']	
	
	for row in rows:		
		details = get_fantasy_team_details(row)
		check_fantasy_player_list(row['id'], details['players'])
		
		#update games
		for game in details['games']:
			output(row['name'] + ' ' + str(game['game']) + ' ' + str(game['opponent']) + ' ' + str(game['score'])+ ' ' + str(game['opponent_score']))
			check_connection()		
			cur=con.cursor()			
			cur.execute("INSERT IGNORE INTO fantasyResults(team, game, opponent, score, opponent_score) VALUES(%s,%s,%s,%s,%s)", (row['id'], game['game'], names[game['opponent']], game['score'], game['opponent_score']))		

def update_players(division):	
	output('update players:' + division);
	check_connection()
	cur = con.cursor(mdb.cursors.DictCursor)	
	cur.execute("SELECT t1.*, max(game) last_game FROM nbaPlayers as t1 JOIN nbaTeams as t3 ON (t1.team = t3.code) LEFT JOIN nbaStats20122013 as t2 ON (t1.name = t2.name) WHERE t3.division LIKE %s GROUP BY t1.name ORDER BY t1.team, t1.name", division )
	
	rows = cur.fetchall()
	
	for row in rows:				
		#output(row['name'])
		details = get_player_details(row['name'], row['last_game'])								
				
		#update active
		if ((details['status'] == 'Active') != bool(row['active'])):
			output('%s active status changed to %s' % (row['cleanname'], details['status']))			
			if details['status'] == 'Active':										
				check_connection()
				cur = con.cursor()   
				cur.execute("UPDATE nbaPlayers SET active=%s, activereason=NULL, injury=NULL WHERE name=%s", (True, row['name'])) 
			else:
				check_connection()
				cur = con.cursor()   			
				cur.execute("UPDATE nbaPlayers SET active=%s, activereason=%s, injury=%s WHERE name=%s", (False, details['status'],  details['injury'], row['name'])) 
		
		#update owned	
		if (abs(row['owned'] - int(details['owned'])) > 0):
			#output('%s has gone from %s to %s' % (row['cleanname'], row['owned'], details['owned']))
			check_connection()
			cur = con.cursor()   
			cur.execute("UPDATE nbaPlayers SET owned=%s WHERE name=%s", (details['owned'], row['name'])) 

		#update owned table		
		date = str(tod[0])+'-'+str(tod[1])+'-'+str(tod[2])
		check_connection()
		cur = con.cursor()   
		cur.execute("INSERT IGNORE INTO nbaPlayersOwned(name, date, owned) VALUES(%s,%s,%s)", (row['name'], date, details['owned'])) 
		
		#update games
		for game in details['games']:
			output(row['team'] + ' ' + row['name'] + ' ' + str(game['game']) + ' ' + str(game['min']) + ' ' + str(game['fp']))
			check_connection()		
			cur=con.cursor()			
			cur.execute("INSERT IGNORE INTO nbaStats20122013(name, game, team, date, min, fp) VALUES(%s,%s,%s,%s,%s,%s)", (row['name'], game['game'], row['team'], game['date'], game['min'], game['fp']))
				
def update_nba_results():			
	name_check = {'BKN': 'BKL', 'GS': 'GSW', 'NO': 'NOR', 'NY': 'NYK', 'OKC': 'OKL', 'PHX': 'PHO', 'SA': 'SAS', 'UTAH': 'UTA', 'WSH': 'WAS'}
	cur = con.cursor(mdb.cursors.DictCursor)
	cur.execute("SELECT * FROM nbaTeams ORDER BY code")
	rows = cur.fetchall()

	for team in rows:			
		cur = con.cursor(mdb.cursors.DictCursor)
		cur.execute("SELECT max(game) as max FROM nbaFixtures WHERE team = %s AND result is not null", (team['code']))
		max = cur.fetchone()['max']
	
		team_lookup = team['code']
		for k, v in name_check.iteritems():
			if v == team_lookup:
				team_lookup = k

		db_game = 0
		soup = BeautifulSoup(get_page("http://espn.go.com/nba/team/schedule/_/name/" + team_lookup.lower() + '/' + team['name'].lower().replace(' ', '-')))
		for baby in soup.find_all(class_=["oddrow", "evenrow"]):				
			if baby.contents[2].find(text=re.compile("Postponed")):		
				continue
		
			db_game += 1			
			if baby.contents[2].find(class_="game-schedule"):		
				if db_game <= max:
					continue
				db_result = baby.contents[2].find("li", class_="game-status").text
				db_score = baby.contents[2].find("li", class_="score").text
				cur = con.cursor()
				cur.execute("UPDATE nbaFixtures SET result=%s, score=%s WHERE team=%s AND game=%s", (db_result, db_score, team['code'], db_game))		
			else:
				break
	
#2 minute job max, this should give us plenty of time	
#planning 2 runs, one around midnight, one around when the scores go up? 6am? midday?
def time_based_update():
	if tod[3] % 4 == 0: #want midnight to be percentage updates
		if tod[4] < 30:
			update_players('Atlantic')
		else:
			update_players('Southeast')		
	elif tod[3] % 4 == 1:
		if tod[4] < 30:
			update_players('Central')
		else:
			update_players('Southwest')		
	elif tod[3] % 4 == 2:
		if tod[4] < 30:
			update_players('Pacific')
		else:
			update_players('Northwest')		
	elif tod[3] % 4 == 3:
		if tod[4] < 30:
			update_teams()
			update_nba_results()
		else:
			update_fantasy_teams()			
	
	
#actual code starts here - this should be another file?
	
output_lines = []
		
#connect	
con = mdb.connect(host='mattwarddb.db.9795362.hostedresource.com', user='mattwarddb', passwd=config.password, db='mattwarddb')
start_time = datetime.now()		
output(start_time)

tod = time.gmtime() 
time_based_update()
#update_teams()
#update_fantasy_teams()
#update_players('%')
#update_nba_results()
		
con.close()
end_time = datetime.now()		
output(end_time)

if config.output == "email":
	HOST = "relay-hosting.secureserver.net"
	SUBJECT = "Hoops Scraper Update"
	TO = "hoops@mattward.net"
	FROM = "webmaster@mattward.net"
	BODY = string.join((
        "From: %s" % FROM,
        "To: %s" % TO,
        "Subject: %s" % SUBJECT ,
        "",
        '\r\n'.join(str(n) for n in output_lines)
        ), "\r\n")
	server = smtplib.SMTP(HOST)
	server.sendmail(FROM, [TO], BODY)
	server.quit()
elif config.output == "file":
	file = codecs.open("results.txt", "w", "utf-8")
	file.write('\r\n'.join(str(n) for n in output_lines))
	file.close()
	
