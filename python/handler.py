import process
import json

#escape the f, a.k.a get the f outta there!
print 'Loading JSON object...'
with open('C:\Users\Bird\Documents\FB Data\html\download') as jsonData:
    d = json.load(jsonData)
    print 'Finished'
    print '---------------------'

s = ''
userList = {}
while s != 'x':
    if s == '1':
        #userList stucture:
        # {
        #   u1 : {
        #           words : [[num]],
        #           messages : [[num]]
        #       }
        #
        userList = process.wordCount(d['messages'])
        print 'Data:'
        for user in userList:
            print '| ' + user
            print '| \tWords: ' + str(userList[user]['words'])
            print '|_\tMessages: ' + str(userList[user]['messages'])
        print ''
        s = ''
    elif s == '2':
        process.timeLine(d['messages'])
        s = ''
    elif s == '3':
        process.hourHistogram(d['messages'])
        s = ''
    elif s == '4':
        process.wordHistogram()
        s = ''
    elif s != 'x':
        print '(1) Word Count'
        print '(2) Time Line'
        print '(3) Hour Histogram'
        print '(4) Word Histogram'
        print '(x) to quit'
        print '---------------------'
        s = raw_input('--> ')
    else:
        print 'see ya bitch'
    
