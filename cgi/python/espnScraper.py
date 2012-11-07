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

name_check = {'BKN': 'BKL', 'GS': 'GSW', 'NO': 'NOR', 'NY': 'NYK', 'OKC': 'OKL', 'PHX': 'PHO', 'SA': 'SAS', 'UTAH': 'UTA', 'WSH': 'WAS'}

def get_page(url):
	return urllib.urlopen(url).read()
		
def get_fixtures(team):		
	team_lookup = team['code']
	for k, v in name_check.iteritems():
		if v == team_lookup:
			team_lookup = k
				
	db_game = 0		
	soup = BeautifulSoup(get_page("http://espn.go.com/nba/team/schedule/_/name/" + team_lookup.lower() + '/' + team['name'].lower().replace(' ', '-')))
	for baby in soup.find_all(class_=["oddrow", "evenrow"]):		
		db_date = baby.contents[0].text
		db_location = baby.contents[1].find("li", class_="game-status").text
		db_opponent = baby.contents[1].find("li", class_="team-name").find('a')['href'].split('/')[7].upper()
		if db_opponent in name_check:
			db_opponent = name_check[db_opponent]
		
		if baby.contents[2].find(text=re.compile("Postponed")):		
			continue
		
		db_game += 1		
		if baby.contents[2].find(class_="game-schedule"):		
			db_result = baby.contents[2].find("li", class_="game-status").text
			db_score = baby.contents[2].find("li", class_="score").text
		else:
			db_result = None
			db_score = None
			
		
		cur = con.cursor()
		cur.execute("INSERT IGNORE INTO nbaFixtures(team, game, date, location, opponent, result, score) VALUES(%s,%s,%s,%s,%s,%s,%s)", (team['code'], db_game, db_date, db_location, db_opponent, db_result, db_score))		

					
con = mdb.connect(host='mattwarddb.db.9795362.hostedresource.com', user='mattwarddb', passwd=config.password, db='mattwarddb')	
cur = con.cursor(mdb.cursors.DictCursor)
cur.execute("SELECT * FROM nbaTeams ORDER BY code")

rows = cur.fetchall()

for row in rows:			
		update_fixtures(row)
	