#!/bin/env python
import requests
import time
from datetime import date
from datetime import datetime, timedelta
import json, ast
from multiprocessing import Pool

import csv

# config
import os
import sys
import commands
import ConfigParser
config = ConfigParser.RawConfigParser()
configFile = os.path.dirname(os.path.abspath(__file__))+'/config'
config.readfp(open(configFile))


# DB
from pymongo import MongoClient
from pymongo import MongoClient
client = MongoClient(config.get("data","host"), int(config.get("data","port")))
db = client[config.get("data","db")]
data = db[config.get("data","collection")]

# defaults

lat = "42.3601"
lon = "-71.0589"

# get from db
#post_id = data.insert_one(r.json()).inserted_id

print data.find_one()['daily']['data'][0].keys()

# let's get a whole bunch... 10x10 grid.

# we're going to assume the only content of the database is a single run of 'getData'

#that is, we're not doing any time selection or lat/long filtering or anything.
#we're just loading the entire collection into memory
#you've been warned :)

print 'finding all'

# open file

def writeCSVfromDB():
    with open(config.get("data","collection")+'.csv', 'wb') as outfile:
        #write header
        fieldNames = data.find_one()['daily']['data'][0].keys()
        fieldNames.insert(0,"elevation")
        fieldNames.insert(0,"latitude")
        fieldNames.insert(0,"longitude")
        fieldNames.insert(0,"date")
        outFileWriter = csv.DictWriter(outfile, extrasaction='ignore', fieldnames=fieldNames)
        outFileWriter.writeheader()
        # loop through
        for i,d in enumerate(data.find()):
            print i
            # de-serialize json to CSV row
            if 'daily' in d:
                row = ast.literal_eval(json.dumps(d['daily']['data'][0]))
                #row = d['daily']['data'][0].encode('utf-8').strip()
                row.update(d)
                date = datetime.fromtimestamp(row['time']).strftime('%m/%d/%Y')
                row.update({'date':date})
                outFileWriter.writerow(row)
            #outFileWriter.flush()
            else:
                print " no daily ? "



def writeElevationToMongo():
    for i,d in enumerate(data.find()):
        print i
        print d['elevation']
        print d['latitude']
        print d['_id']
        #if d['elevation'] is None:
        if 1:
            h = getElevation(d['latitude'],d['longitude'])
            print "setting elevation "+str(h)
            d['elevation'] = str(h)
            data.save(d)
            print "updated record"
        print "didn't need to update"
        print d['elevation']
        if i == 15:
            break

# mycollection.update({'_id':mongo_id}, {"$set": post}, upsert=False)

# get elevation

    # let's get elevation from lat lon
    # then use it to update items in the existing collection
    # perhpas multiprocess

def mapElevation():
    #allFiles = glob.glob(path+'rapidblue.action.*.sql')
    allData = data.find()
    numProc = 4
    p = Pool(numProc)
    print "mapping..."
    p.map(getElevationWorker,allData)

def getElevationWorker(data):
    for i,d in enumerate(data):
        print i
        print d['latitude']
        print d['_id']
        h = getElevation(d['latitude'],d['longitude'])
        d.update_one({'elevation':h})
        data.save(d)
        print "updated record"


def getElevation(lat, lon):
    key = "97529b523e71d8d51576ce9bbb89a0ce"
    baseURL = "https://maps.googleapis.com/maps/api/elevation/json?locations="
    excludeString = "exclude=currently,minutely,hourly,flags"
    #lat = "42.3601"
    #lon = "-71.0589"
    gkey = "AIzaSyCF3UR0T6os4LWIZLsYbH2LNv2yQpzZqEk"
    unixtime = "1420498800"
    #getURL = baseURL+key+"/"+str(lat)+","+str(lat)+","+str(time)+"?"+excludeString

    getURL = "https://maps.googleapis.com/maps/api/elevation/json?locations=%s,%s&key=%s" % (lat, lon, gkey)

    print getURL


    r = requests.get(getURL)


    elevation = r.json()['results'][0]['elevation']
    #print "elevation is "+ str(elevation)
    return elevation
    # write to db
    #post_id = data.insert_one(r.json()).inserted_id
    #print("written to db")

#getElevation(lat, lon)

### comment in to run main export
#
writeCSVfromDB()


### data modification
#
#writeElevationToMongo()
#mapElevation()
