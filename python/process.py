import json
import sys, nltk
import datetime
import numpy as np
from pprint import pprint
import matplotlib.pyplot as plt
from matplotlib.dates import YearLocator, DayLocator, HourLocator, DateFormatter, drange
from numpy import arange

#see timeLine
dateDict = []
#see hourHistogram
hourDict = {}

with open('C:\Users\Bird\Documents\FB Data\html\download') as jsonData:
    d = json.load(jsonData)
    print 'Finished'
    print '---------------------'

def wordCount(messages):
    #userList stucture:
    # {
    #   u1 : {
    #           words : [[num]],
    #           messages : [[num]]
    #       }
    #
    userList = {}
    f = open('wordDump.txt','w')
    for m in messages:
        #add the raw string of the message to the wordDump for wordl
        try:
            f.write(m['text']+'\n')
        except UnicodeEncodeError:
            #print 'unable to encode '+m['text']
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
    fl = open('timeLine.csv','w')
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
            fl.write(str(date)+','+str(wordCount)+'\n')
    except StopIteration:
        print("No more messages.")
        fl.close()

    with open('wordcount.json', 'w+') as fl2:
        json.dump(dateDict, fp=fl2)

    ############ this is old shit
    # a = np.array(dateDict.items(), dtype=[('date', '<f64'), ('amt', '<f64')])

    # fig, ax = plt.subplots()
    # ax.plot_date(a['date'], a['amt'])

    # # The hour locator takes the hour or sequence of hours you want to
    # # tick, not the base multiple

    # ax.xaxis.set_major_locator( YearLocator() )
    # ax.xaxis.set_minor_locator( DayLocator(1) )
    # ax.xaxis.set_major_formatter( DateFormatter('%Y-%m-%d') )

    # ax.fmt_xdata = DateFormatter('%Y-%m-%d %H:%M:%S')
    # fig.autofmt_xdate()

    # plt.show()

def mkdate(text):
    return str(datetime.datetime.strptime(text, '%Y-%m-%dT%H:%M:%S.%fZ'))

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
