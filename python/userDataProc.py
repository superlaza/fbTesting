import sys, nltk
import datetime
from pprint import pprint
from pyquery import PyQuery as pq
from json import dump
from pyquery import PyQuery as pq
from json import dump
from datetime import datetime

import argparse

parser = argparse.ArgumentParser()
parser.add_argument("filepath")
args = parser.parse_args()

filepath = args.filepath
if not (filepath.endswith('.html') or filepath.endswith('.htm')):
    print "Error: incorrect file type. Received "+args.filepath.split('.')[-1]+', need .htm or html'
    exit(1)

#global vars
#===========

months = {'January': 1,
    'February':2,
    'March':3,
    'April':4,
    'May':5,
    'June':6,
    'July':7,
    'August':8,
    'September':9,
    'October':10,
    'November':11,
    'December':12};
    
#see timeLine
dateDict = []
#see hourHistogram
hourDict = {}

d = pq(filename = filepath)
#d = pq(filename = "messages.htm")

fb = {}
fb['user'] = "David"
fb['chats'] = {}

for thread in d('.thread').eq(0).items():

    tempChat = {'messages' : []}
    userIDs = set()
    
    for msg in thread('.message').items():
        user = msg('.user').html()
        date = msg('.meta').html()
        text = msg.next().html()

        if text == None:
            continue

        userIDs.add(user)

        tempMsg = {}
        tempMsg['user'] = user

        #TODO issue #4
        #parse date and make datetime object
        #ex: Thursday, January 16, 2014 at 9:15pm EST
        dateSplit = date.split(' ')
        year = int(dateSplit[3])
        day = int(dateSplit[2][:-1])
        month = int(months[dateSplit[1]])

        time = dateSplit[5].split(":")
        #facebook gives 1-24, need 0-23
        hour = int(time[0])-1
        minute = int(time[1][:-2])
        meridian = time[1][-2:]

        tz = dateSplit[6]

        if meridian == 'pm':
            hour += 12
        
        tempMsg['date'] = str(datetime(year, month, day, hour, minute))

        tempMsg['text'] = text

        tempChat['messages'].append(tempMsg)


    fb['chats'][str(list(userIDs))] = tempChat

#store this structure for later access    
with open('messages.json', 'w') as f:
    dump(fb, f)

print "finished creating JSON chat structure"


def wordCount(messages):
    userList = {}
    f = open('wordDump.txt','w')
    for m in messages:
        #add the raw string of the message to the wordDump for wordl
        try:
            f.write(m['text']+'\n')
        except UnicodeEncodeError:
            #print 'unable to encode '+m['text']
            pass
        except TypeError:
            print m
            print 'incorrect type: '+m['text']
            pass
        
        #tokenize the message content
        numWords = len(m['text'].split(" "))

        #if user isn't already there, add and initialize. otherwise, add to his sum
        if m['user'] not in userList.keys():
            userList[m['user']]={'words':numWords, 'messages':1}
        else:
            userList[m['user']]['words'] += numWords
            userList[m['user']]['messages'] += 1
    return userList

def timeLine(messages):
    print "Starting analysis for time line plot..."
    msgs = iter(messages)
    try:
        m = msgs.next()
        while True:
            wordCount = 0
            datefull = m['date']
            date = mkdate(m['date'])
            temp = date
            while temp == date:
                wordCount += len(m['text'].split(" "))
                m = msgs.next()
                temp = mkdate(m['date'])

            dateDict.append({"date": date, "wordcount": wordCount})
    except StopIteration:
        print("All messages have been analyzed.")

    with open('wordcount.json', 'w+') as fl2:
        dump(dateDict, fp=fl2)

    print "timeLine"

def mkdate(text):
    #TODO issue #4
    #return str(datetime.strptime(text, '%Y-%m-%dT%H:%M:%S.%fZ'))
    return str(datetime.strptime(text, '%Y-%m-%d %H:%M:%S'))

def timeLinePlot():
    fl = open('timeLine.csv')
    data = np.genfromtxt(fl, delimiter=',', names='date, amt', dtype=[('date', 'datetime64'), (amt, '<i8')])
    data

#need to -5hrs from GMT
def hourHistogram(messages):
    for m in messages:
        date = datetime.datetime.strptime(m['date'], '%Y-%m-%dT%H:%M:%S.%fZ')
        if date.hour not in hourDict.keys():
            hourDict[date.hour] = 1
        else:
            hourDict[date.hour] += 1
        
def wordHistogram():
    #see wordHistogram
    histoString = ''
    f2 = open('wordDump.txt', 'rU')
    txt = f2.read()
    f2.close()

    tokens = nltk.word_tokenize(txt) # tokenize text
    clean_tokens = []

    for word in tokens:
        word = word.lower()
        if word.isalpha(): # drop all non-words
            clean_tokens.append(word)

    # make frequency distribution of words
    fd = nltk.FreqDist(clean_tokens)
    for token in fd:
        histoString += token + ':' + fd[token] + '\n'
        #print token, ':', fd[token]

timeLine(fb['chats'][fb['chats'].keys()[0]]['messages'])

exit(0)

    
    
