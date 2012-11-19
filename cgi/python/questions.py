#!/usr/local/bin/python2.7
# -*- coding: utf-8 -*-

import MySQLdb as mdb
import sys
import os
import urlparse
import config

html = '''

<div id="question" class="question">%s</div>
<div id="answer1" class="question answer">%s</div>
<div id="answer2" class="question answer">%s</div>
<div id="answer3" class="question answer">%s</div>
<div id="answer4" class="question answer">%s</div>

'''

query = urlparse.parse_qs(os.environ['QUERY_STRING'])
id = query['id'][0]
	
con = mdb.connect('mattwarddb.db.9795362.hostedresource.com', 'mattwarddb', config.password, 'mattwarddb')
cur = con.cursor(mdb.cursors.DictCursor)
cur.execute("SELECT * FROM questions WHERE Id = %s", (id))	
data = cur.fetchone()	
	
if (data == None):
	response_body = '''
	<div id="ta">Thank you!</div>
	'''
else:	
	question = data["question"]
	answers = data["answers"].split(';')
	response_body = html % (question, answers[0], answers[1], answers[2], answers[3])
    
print '''Content-Type: text/html

'''

print response_body

con.close()