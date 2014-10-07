#!/usr/bin/python
# -*- coding: utf-8 -*-

import MySQLdb as mdb
import sys
import os
import urlparse
import json
import config

con = None

try:
	#print os.environ['QUERY_STRING']
	#print os.environ['REQUEST_METHOD']
	query = urlparse.parse_qs(os.environ['QUERY_STRING'])
	task = query['task'][0]
	
	con = mdb.connect('mattwarddb.db.9795362.hostedresource.com', 'mattwarddb', config.password, 'mattwarddb')
	
	if task == 'nbaTeams':	
		#cur = con.cursor()
		cur = con.cursor(mdb.cursors.DictCursor)
		cur.execute("SELECT code, name, conference FROM nbaTeams")

		data = cur.fetchall()
	
		response_body = json.dumps(data)

		print 'Content-Type: application/json'
		print
		print response_body	
	elif task == 'fantasyTeams':
		cur = con.cursor(mdb.cursors.DictCursor)
		cur.execute("SELECT t1.id, t1.name, t1.moniker, sum(t2.score > t2.opponent_score) as wins, sum(t2.score < t2.opponent_score) as losses, sum(t2.score)/count(t2.game) as ave FROM fantasyTeams as t1 LEFT JOIN fantasyResults as t2 ON (t1.id = t2.team) WHERE t2.game < 70 GROUP BY t1.id ORDER BY wins desc, ave desc")

		data = cur.fetchall()
	
		for stuff in data:
			stuff['wins'] = "%d" % stuff['wins']
			stuff['losses'] = "%d" % stuff['losses']
			stuff['ave'] = "%.2f" % stuff['ave']
	
		response_body = json.dumps(data)
		
		print 'Content-Type: application/json'
		print
		print response_body
	elif task == 'nbaTeamDetails':
		print 'Content-Type: application/json'
		print	
		
		id = query['id'][0]
		cur = con.cursor(mdb.cursors.DictCursor)		
		cur.execute("SELECT t3.code, t1.name, t1.team, t1.cleanname, t1.owned, t1.position, t1.active, count(t2.game) as games, sum(t2.min)/count(t2.game) as minG, sum(t2.fp)/count(t2.game) as fpG, sum(t2.fp)/sum(t2.min) as fpM FROM nbaPlayers as t1 LEFT JOIN nbaStats20122013 as t2 ON (t1.name = t2.name) LEFT JOIN fantasyTeams as t3 ON (t1.owner = t3.id) WHERE t1.team = %s GROUP BY t1.name ORDER BY fpG desc", (id))
		data = cur.fetchall()
	
		for stuff in data:
			if stuff['code'] == None:
				stuff['code'] = "-"
			if stuff['games'] > 0:
				stuff['minG'] = "%.2f" % stuff['minG']
				stuff['fpG'] = "%.2f" % stuff['fpG']
				stuff['fpM'] = "%.2f" % stuff['fpM']
			else:
				stuff['minG'] = ""
				stuff['fpG'] = ""
				stuff['fpM'] = ""
	
		response_body = json.dumps(data)
		print response_body	
	elif task == 'fantasyTeamDetails':
		print 'Content-Type: application/json'
		print
	
		id = query['id'][0]
		cur = con.cursor(mdb.cursors.DictCursor)		
		cur.execute("SELECT t1.owner, t1.name, t1.team, t1.cleanname, t1.owned, t1.position, t1.active, count(t2.game) as games, sum(t2.min)/count(t2.game) as minG, sum(t2.fp)/count(t2.game) as fpG, sum(t2.fp)/sum(t2.min) as fpM FROM nbaPlayers as t1 LEFT JOIN nbaStats20122013 as t2 ON (t1.name = t2.name) WHERE t1.owner = %s GROUP BY t1.name ORDER BY fpG desc", (id))
		players = cur.fetchall()
	
		for stuff in players:
			if stuff['games'] > 0:
				stuff['minG'] = "%.2f" % stuff['minG']
				stuff['fpG'] = "%.2f" % stuff['fpG']
				stuff['fpM'] = "%.2f" % stuff['fpM']
			else:
				stuff['minG'] = ""
				stuff['fpG'] = ""
				stuff['fpM'] = ""

		cur = con.cursor(mdb.cursors.DictCursor)		
		cur.execute("SELECT t1.*, t2.name, t2.moniker FROM fantasyResults as t1 left join fantasyTeams as t2 on t1.opponent = t2.id WHERE t1.team = %s", (id))
		#cur.execute("SELECT * FROM fantasyResults WHERE team = %s ORDER BY game asc", (id))
		results = cur.fetchall()
				
		response_body = json.dumps({'id':id, 'players':players, 'results':results})
		print response_body	
	elif task == 'playerDetails':
		print 'Content-Type: application/json'
		print
	
		id = query['id'][0]
		cur = con.cursor(mdb.cursors.DictCursor)		
		cur.execute("SELECT * FROM nbaStats20122013 WHERE name = %s ORDER BY game asc", (id))
		data = cur.fetchall()
				
		for stuff in data:
			stuff['date'] = str(stuff['date'])
				
		response_body = json.dumps(data)
		print response_body			
	elif task == 'nbaResult':
		print 'Content-Type: application/json'
		print
	
		id = query['id'][0]
		game = query['game'][0]
		cur = con.cursor(mdb.cursors.DictCursor)		
		cur.execute("SELECT t1.*, t2.name FROM nbaFixtures as t1 left join nbaTeams as t2 on t1.opponent = t2.code WHERE t1.team = %s AND t1.game = %s", (id, game))
		data = cur.fetchall()
								
		response_body = json.dumps(data)
		print response_body			
	elif task == 'fantasyResult':
		print 'Content-Type: application/json'
		print
	
		id = query['id'][0]
		game = query['game'][0]
		cur = con.cursor(mdb.cursors.DictCursor)		
		cur.execute("SELECT t1.*, t2.name, t2.moniker FROM fantasyResults as t1 left join fantasyTeams as t2 on t1.opponent = t2.id WHERE t1.team = %s AND t1.game = %s", (id, game))
		data = cur.fetchall()
								
		response_body = json.dumps(data)
		print response_body			
except mdb.Error, e:
  
  
    print "Error %d: %s" % (e.args[0],e.args[1])
    sys.exit(1)
    
finally:    
        
    if con:    
        con.close()