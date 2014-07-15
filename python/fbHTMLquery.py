from pyquery import PyQuery as pq
from json import dump
d = pq(filename = "messages.htm")

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

    
##with open('messages.json', 'w') as f:
##    dump(fb, f)

    
    
