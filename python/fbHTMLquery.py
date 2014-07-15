from pyquery import PyQuery as pq
from json import dump
from pyquery import PyQuery as pq
from json import dump

import argparse

parser = argparse.ArgumentParser()
parser.add_argument("filepath")
args = parser.parse_args()

filepath = args.filepath
if not (filepath.endswith('.html') or filepath.endswith('.htm')):
    print "Error: incorrect file type. Received "+args.filepath.split('.')[-1]+', need .htm or html'
    exit(1)


d = pq(filename = filepath)

fb = {}
fb['user'] = "David"
fb['chats'] = {}

for thread in d('.thread').items():

    tempChat = {'messages' : []}
    userIDs = set()
    
    for msg in thread('.message').items():
        temp = {}
        user = msg('.user').html()
        date = msg('.meta').html()
        text = msg.next().html()

        userIDs.add(user)
        
        temp['user'] = user
        temp['date'] = date
        temp['text'] = text

        tempChat['messages'].append(temp)


fb['chats'][str(list(userIDs))] = tempChat

    
with open('messages.json', 'w') as f:
    dump(fb, f)

print "done"
exit(0)

    
    
