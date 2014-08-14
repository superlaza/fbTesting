import nltk
from pyquery import PyQuery as pq
from json import dump
from json import loads
from datetime import datetime
import sys

#for link parsing
import re
from urlparse import urlparse
from collections import OrderedDict

import argparse

userParams = {}
filepath = ""


def extract():
    months = {'January': 1,
        'February': 2,
        'March': 3,
        'April': 4,
        'May': 5,
        'June': 6,
        'July': 7,
        'August': 8,
        'September': 9,
        'October': 10,
        'November': 11,
        'December': 12}

    selector = pq(filename=filepath)
    #selector = pq(filename = "messages.htm")#for debugging

    fb = {'user': userParams['user'], 'chats': {}}

    #make the following a function, localize these vars
    fb_size = len(selector('.thread'))
    fb_count = 0

    for thread in selector('.thread').items():

        tempChat = {'messages': []}
        userIDs = set()

        for msg in thread('.message').items():
            user = msg('.user').html()
            date = msg('.meta').html()
            text = msg.next().html()

            if text is None:
                continue

            userIDs.add(user)

            temp_msg = {'user': user}

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

            temp_msg['date'] = str(datetime(year, month, day, hour, minute))

            temp_msg['text'] = text

            tempChat['messages'].append(temp_msg)

        fb['chats'][str(list(userIDs))] = tempChat

        fb_count += 1
        sys.stdout.write("-extracing data from html...%d%%   \r" % (100*fb_count/fb_size))
        sys.stdout.flush()

    #store this structure for later access
    with open("./users/"+userParams['user']+'/messages.json', 'w') as fl:
        dump(fb, fl)

    sys.stdout.write("finished creating JSON chat structure\n")
    sys.stdout.flush()

    return fb


def find_links(messages):
    link_dict = {}
    link_dict_ordered = OrderedDict({})
    for m in messages:
        links = re.findall('http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', m['text'])
        if links:
            for link in links:
                host = urlparse(link).hostname
                if host in link_dict:
                    link_dict[host].append(link)
                else:
                    link_dict[host] = [link]
    for key in sorted(link_dict):
        link_dict_ordered[key] = link_dict[key]

    with open('links.json', 'w') as f:
        dump(link_dict_ordered, f)


def wordcount(messages):
    user_list = {}
    f = open('wordDump.txt', 'w')
    for m in messages:
        #add the raw string of the message to the wordDump for wordl
        try:
            f.write(m['text']+'\n')
        except UnicodeEncodeError:
            print 'unable to encode '+m['text']
            pass
        except TypeError:
            print m
            print 'incorrect type: '+m['text']
            pass
        
        #tokenize the message content
        num_words = len(m['text'].split(" "))

        #if user isn't already there, add and initialize. otherwise, add to his sum
        if m['user'] not in user_list.keys():
            user_list[m['user']] = {'words': num_words, 'messages': 1}
        else:
            user_list[m['user']]['words'] += num_words
            user_list[m['user']]['messages'] += 1
    return user_list


def timeline(messages):
    count = 0
    size = len(messages)
    sys.stdout.write("Starting analysis for time line plot...")
    sys.stdout.flush()
    date_dict = []
    msgs = iter(messages)
    try:
        m = msgs.next()
        while True:
            word_count = 0
            #TODO issue #4
            _date = datetime.strptime(m['date'], '%Y-%m-%d %H:%M:%S')
            #daily clumping
            temp = _date
            while temp.hour == _date.hour:
                word_count += len(m['text'].split(" "))
                m = msgs.next()
                temp = datetime.strptime(m['date'], '%Y-%m-%d %H:%M:%S')

                count += 1
                sys.stdout.write("-timeline progress: %d%%   \r" % (100*count/size))
                sys.stdout.flush()

            date_dict.append({"date": str(_date), "wordcount": word_count})

    except StopIteration:
        sys.stdout.write("All messages have been analyzed.")
        sys.stdout.flush()

    with open("./users/"+userParams['user']+userParams['dirs']['timeline'], 'w+') as f:
        dump(date_dict, fp=f)

    sys.stdout.write("timeline")
    sys.stdout.flush()


#need to -5hrs from GMT
def hour_histogram(messages):
    count = 1
    size = len(messages)
    hour_dict = {}
    for m in messages:
        _date = datetime.strptime(m['date'], '%Y-%m-%d %H:%M:%S')
        if _date.hour not in hour_dict.keys():
            hour_dict[_date.hour] = 1
        else:
            hour_dict[_date.hour] += 1

        count += 1
        sys.stdout.write("-hour histograms progress: %d%%   \r" % (100*count/size))
        sys.stdout.flush()

    hour_arr = []
    #d3 radar plugin currently prints in reverse
    for _hour in range(23, -1, -1):
        #adjust hour from 0 base
        if _hour in hour_dict:
            hour_arr.append({"axis": (_hour+1), "value": hour_dict[_hour]})
        else:
            hour_arr.append({"axis": (_hour+1), "value": 0})

    with open("./users/"+userParams['user']+userParams['dirs']['hour_histogram'], 'w+') as f:
        dump(hour_arr, fp=f)

    sys.stdout.write("hour_histogram")
    sys.stdout.flush()


def word_histogram():
    #see wordHistogram
    histo_string = ''
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
        histo_string += token + ':' + fd[token] + '\n'
        #print token, ':', fd[token]


def main(*args):
    parser = argparse.ArgumentParser()
    parser.add_argument("filepath")
    parser.add_argument("userParams")
    args = parser.parse_args(args)

    global userParams, filepath
    filepath = args.filepath
    userParams = loads(args.userParams)

    if not (filepath.endswith('.html') or filepath.endswith('.htm')):
        sys.stdout.write("Error: incorrect file type. Received "+args.filepath.split('.')[-1]+', need .htm or html')
        sys.stdout.flush()
        exit(1)

    fb = extract()
    user = 0
    timeline(fb['chats'][fb['chats'].keys()[user]]['messages'])
    hour_histogram(fb['chats'][fb['chats'].keys()[user]]['messages'])

    exit(0)

#if invoked from command line, run normally
if __name__ == "__main__":
    try:
        print 'yes'
        main(*sys.argv[1:])
    except IOError as e:
        print "I/O error({0}): {1}".format(e.errno, e.strerror)
#otherwise, setup debug structure (in case of import, for example)
else:
    userParams = \
        {
            "user": "0000",
            "dirs": {
                "hour_histogram": "/data/hour_histogram.json",
                "timeline": "/data/timeline.json"
            }
        }
    filepath = "C:\\Projects\\fbTesting\\python\\debug\\messages.htm"
