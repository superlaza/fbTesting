import userDataProc as process
import json

fb = process.extract()
print 'Loading JSON object...'
with open('./users/0000/messages.json') as jsonData:
    d = json.load(jsonData)
    print 'Finished loading JSON'
    print '---------------------'

s = ''
userList = {}

for users in fb['chats'].keys():
    try:
        users.index("Cory O'Born")
        break
    except:
       1+1

while s != 'x':
    if s == '1':
        userList = process.wordcount(fb['chats'][users]['messages'])
        print 'Data:'
        for user in userList:
            print '| ' + user
            print '| \tWords: ' + str(userList[user]['words'])
            print '|_\tMessages: ' + str(userList[user]['messages'])
        print ''
        s = ''
    elif s == '2':
        process.timeline(fb['chats'][users]['messages'])
        s = ''
    elif s == '3':
        process.hour_histogram(fb['chats'][users]['messages'])
        s = ''
    elif s == '4':
        process.word_histogram()
        s = ''
    elif s != 'x':
        print '\n'
        print '(1) Word Count'
        print '(2) Time Line'
        print '(3) Hour Histogram'
        print '(4) Word Histogram'
        print '(x) to quit'
        print '---------------------'
        s = raw_input('--> ')
    else:
        print 'see ya bitch'
    
