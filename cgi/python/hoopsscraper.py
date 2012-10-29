#!/usr/bin/python
# -*- coding: utf-8 -*-

from bs4 import BeautifulSoup, NavigableString, Tag
from datetime import datetime, timedelta
import MySQLdb as mdb
import urllib
import codecs
import re
import config

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

def get_player_details(name):
	#print name
	soup = BeautifulSoup(get_page("http://hoops.sports.ws/player/%s?lastcount=82" % (name)))
			
	status = soup.find(text=re.compile("Status")) #for now only good for certain statuses, doesn't get the fonty ones
	status = status.next_element
	while (type(status) == Tag or status.strip() == ""):		
		status = status.next_element		
	
	db_status = status.strip()
	if (db_status != "Active"):
		#get injury
		db_injury = status.next_element.contents[1].strip()
	else:
		db_injury = ""
	
	section = status.parent.parent.parent						
	detail = section.b.contents[0].replace('(', ' ').split('-',1)
	db_pos = detail[0].strip()
	db_cleanname = detail[1].strip()					
	owned = soup.find(text=re.compile("Percent owned"))					
	db_owned = owned.next_sibling.contents[0].strip('%')

	games = []
	#fill games with 2011-12 stats.... for now anyway
	#start = soup.find(text=re.compile("Date"))
	#node = start.parent.parent.parent
	#
	#for i in range(1,67):
	#	while (type(node.next_sibling) is NavigableString):			#infinite loop?	
	#		node = node.next_sibling	
	#	node = node.next_sibling			
		
		#only games that were played?
	#	if (type(node.contents[2]) is not NavigableString):
	#		continue
	#	else:		
	#		game = int(node.contents[0].contents[0]) - 16			
	#		date = node.contents[1].contents[0]		
	#		month = date.split('/')[0].strip().rjust(2,'0')
	#		day = date.split('/')[1].strip().rjust(2,'0')
	#		date = '2012-'+month+'-'+day if month < 5 else '2011-'+month+'-'+day			
	#		min = int(node.contents[3].contents[0])			
	#		fp = int(node.contents[5].contents[0].strip())
	#		games.append({'game': game, 'date': date, 'min': min, 'fp': fp})
			
	return {'status': db_status, 'injury': db_injury, 'pos': db_pos, 'cleanname': db_cleanname, 'owned': db_owned, 'games':games}
	
def add_player(name, team):
	details = get_player_details(name)				
	#needs to become and update or insert
	if (details['status'] == 'Inactive'):
		print 'Inactive player' 
		return

	print 'Adding: ' + details['pos'] + ' ' + details['cleanname'] + ' ' + team
	check_connection()
	cur = con.cursor()        
	cur.execute("INSERT INTO nbaPlayers(team, name, cleanname, position, owned, active, activereason, injury) VALUES(%s,%s,%s,%s,%s,%s,%s,%s)", (team, name, details['cleanname'], details['pos'], details['owned'], int(details['status'] == 'Active'), details['status'], details['injury']))    		
	
	#will probably need to turn this off once season begins?
	#add_20112012stats(name, details)
	
def add_20112012stats(name, details):	
	for game in details['games']:
		#print name + ' ' + str(game['game']) + ' ' + game['date'] + ' ' + str(game['min']) + ' ' + str(game['fp'])
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
		print '%s has new players' % team
		for dude in active_players:
			if check_player_exists(dude):
				print dude + ' already exists - moving teams'
				check_connection()
				cur = con.cursor()        
				cur.execute("UPDATE nbaPlayers SET team = %s WHERE name = %s", (team, dude))    	
			else:
				add_player(dude, team)

	if (len(db_players) > 0):
		print '%s has lost players' % team
		for dude in db_players:
			print dude #mark, not delete - may have moved team?
			check_connection()
			cur = con.cursor()        
			cur.execute("UPDATE nbaPlayers SET team = NULL WHERE name = %s", (dude))    	


			
#get active players for team - update team db if changed
def get_active_player_list(team):
	#soup me up	
	code = team['code']
	name = team['name']
	db_active = team['active']
	print code + ' ' + str(db_active)
		
	players = []
	tries = 0
	while(len(players) < db_active or db_active == 0):
		tries+=1
		#print tries
		#load the page - max loaded in 31 so may need to do more than one load
		soup = BeautifulSoup(get_page("http://hoops.sports.ws/team.x?team=%s" % (code)))
		#get number of active players
		active = int(soup.find(text=re.compile("Active Players")).replace(')','*').replace('(','*').split('*')[1])
		####hack - there are two henry sims in the knicks####
		if (code == 'NYK'):
			active -= 1		
		#update number of active players	
		if (active != db_active): #this will need an alert on change!
			print 'Active has changed for %s from %s to %s' % (name, db_active, active)
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
				#print str(len(players)) + ' ' + db_name
			
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
		print '%s has new players' % team
		for dude in fantasy_players:
			print dude
			check_connection()
			cur = con.cursor()        
			cur.execute("UPDATE nbaPlayers SET owner = %s WHERE name = %s", (team, dude))    	

	if (len(db_players) > 0):
		print '%s has lost players' % team
		for dude in db_players:
			print dude
			check_connection()
			cur = con.cursor()        
			cur.execute("UPDATE nbaPlayers SET owner = NULL WHERE name = %s", (dude))    	
		
		
def get_fantasy_player_list(team):		
	soup = BeautifulSoup(get_page("http://hoops.sports.ws/league/team_details.x?l=130476&t=%s" % (team)))
	
	#Games Played by Position seems to be a sensible starting point - possibly top list in the future once season starts
	start = soup.find(text=re.compile("Games Played by Position"))		
		
	players = []
	for player in start.parent.parent.parent.contents:
		if (type(player) is NavigableString):				
			continue			
		elif (player.find(text=re.compile("Ex-Player")) != None):
			break
		else:			
			if (player.a != None):
				db_name = player.a['href'].rsplit('/')[2] 
				#check player exists - also fixes name issues
				correct = check_player_exists(db_name)
								
				if correct:									
					players.append(correct)
				else:
					print db_name + " doesn't exist???"		#this probably can't happen?
	
	return players
	
def update_teams():	
	check_connection()
	cur = con.cursor(mdb.cursors.DictCursor)
	cur.execute("SELECT * FROM nbaTeams")

	rows = cur.fetchall()

	for row in rows:	
		active_players = get_active_player_list(row)
		check_active_player_list(str(row['code']), active_players)
		#break	
	
def update_fantasy_teams():		
	for i in range(1,13):	
		players = get_fantasy_player_list(i)
		check_fantasy_player_list(i, players)

def update_players():	
	check_connection()
	cur = con.cursor(mdb.cursors.DictCursor)	
	cur.execute("SELECT * FROM nbaPlayers WHERE team IS NOT NULL order by team, name")
	
	rows = cur.fetchall()
	
	for row in rows:	
		#print row['name']
		details = get_player_details(row['name'])		
		
		#update active
		if ((details['status'] == 'Active') != bool(row['active'])):
			print '%s active status changed to %s' % (row['cleanname'], details['status'])				
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
			print  '%s has gone from %s to %s' % (row['cleanname'], row['owned'], details['owned'])				
			check_connection()
			cur = con.cursor()   
			cur.execute("UPDATE nbaPlayers SET owned=%s WHERE name=%s", (details['owned'], row['name'])) 

			
def check_connection():	
		global con		
		global start_time	
		if (datetime.now() - start_time) > timedelta(seconds=55):
			print 'reconnecting', datetime.now() - start_time
			con.close()
			con = mdb.connect('mattwarddb.db.9795362.hostedresource.com', 'mattwarddb', config.password, 'mattwarddb')
		start_time = datetime.now()		

#connect	
con = mdb.connect(host='mattwarddb.db.9795362.hostedresource.com', user='mattwarddb', passwd=config.password, db='mattwarddb')
start_time = datetime.now()		

update_teams()
#update_fantasy_teams()
#update_players()

con.close()


	#file = codecs.open("blah.html", "w", "utf-8")
	#file.write(soup.prettify())
	#file.close()
	
