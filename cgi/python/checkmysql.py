#!/usr/bin/python

module_name = 'MySQLdb'
head = '''Content-Type: text/html

%s is ''' % module_name

try:
    __import__(module_name)
    print head + 'installed'
except ImportError:
    print head + 'not installed'