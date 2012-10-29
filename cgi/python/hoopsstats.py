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
		cur.execute("SELECT id, name FROM fantasyTeams")

		data = cur.fetchall()
	
		response_body = json.dumps(data)
		
		print 'Content-Type: application/json'
		print
		print response_body
	elif task == 'nbaTeamDetails':
		id = query['id'][0]
		cur = con.cursor(mdb.cursors.DictCursor)
		cur.execute("SELECT name, cleanname, position, team, owned, active, owner FROM nbaPlayers WHERE team = %s", (id))

		data = cur.fetchall()
	
		response_body = json.dumps(data)

		print 'Content-Type: application/json'
		print
		print response_body	
	elif task == 'fantasyTeamDetails':
		id = query['id'][0]
		cur = con.cursor(mdb.cursors.DictCursor)
		cur.execute("SELECT nbaPlayers.name, nbaPlayers.cleanname, nbaPlayers.owned, nbaPlayers.active, fantasyTeams.id FROM nbaPlayers, fantasyTeams WHERE nbaPlayers.owner = fantasyTeams.id AND fantasyTeams.id = %s", (id))

		data = cur.fetchall()
	
		response_body = json.dumps(data)

		print 'Content-Type: application/json'
		print
		print response_body	
except mdb.Error, e:
  
  
    print "Error %d: %s" % (e.args[0],e.args[1])
    sys.exit(1)
    
finally:    
        
    if con:    
        con.close()