import requests
import time
#from datetime import date
#from datetime import datetime
#from datetime import timedelta as td

from datetime import date, timedelta as td, datetime as datetime

import numpy as np

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
client = MongoClient(config.get("data","host"), int(config.get("data","port")))
db = client[config.get("data","db")]
data = db[config.get("data","collection")]


'''
client = MongoClient('localhost', 27017)
db = client['weather']
data = db['darksky']
'''

#post_id = posts.insert_one(post).inserted_id

key = config.get("darksky","key")
baseURL =config.get("darksky","baseURL")
excludeString = config.get("darksky","excludeString")
lat = "42.3601"
lon = "-71.0589"
unixtime = "1420498800"

#build string

def getDataFrom(lat, lon, time):

    getURL = baseURL+key+"/"+str(lat)+","+str(lon)+","+str(time)+"?"+excludeString
    print getURL

    r = requests.get(getURL)
    print r.json()
    # write to db
    post_id = data.insert_one(r.json()).inserted_id
    print("written to db")
#r =

#getDataFrom(42.3601,-71.0589,1420498800)

# data range = 6669


# convert date to unix timestamp, ignoring timezone (CDT/CST implicit)

'''
day = "2016-01-02"

date = datetime.strptime(day, '%Y-%m-%d')
unixtime = time.mktime(date.timetuple())

print day+' is '+str(int(unixtime))
'''

#getWeatherDataWithin -l NWLatLong -r SELatLong -s StartDate - e EndDate

# first 5x5

#l = (42.430426, -90.450439) # galena, IL
#sr = (40.144108, -87.583008) # westville, IL

#  overall state
l = (42.774739, -91.406250) # near cedar rapids
r = (36.892252, -87.604980) # near clarksville KY

# metro zoom
#l = (42.774739, -91.406250) # nw of rockford
#r = (40.669962, -87.429199) # se of peoria


# next, walk lat/long range by freqency and date.

# a better way to do this may be to make an interval for the time range as well, so space and time sample resolution both have a scale factor.
# but for now, let's just do each day of the year.

#increment day day += timedelta(days=1)

width = l[0]-r[0]
height = l[1]-r[1]

interval = 15.0

print width

wfactor = width/interval
hfactor = height/interval


#print range(l[0],r[0],factor)

longs = np.arange(r[0],l[0],wfactor)
lats = np.arange(r[1],l[1],hfactor)

print longs
print lats


def getWeatherFromAllLocationsForADay(unixtime):
    for i,l in enumerate(longs):
        for j,la in enumerate(lats):
            print("getting weather for "+str(l)+" "+str(la))+" on "+str(unixtime)
            getDataFrom(l, la, unixtime)

#getWeatherFromAllLocationsForADay(1293775200)

#getWeatherForInterval("2016-01-01","2016-12-31")

#daySkip = 1 #daily
daySkip = 7 #weekly

def getDaysForInterval():
    d1 = date(2010, 1, 1)   #1970, 1980, 1990, 2000, 2010
    d2 = date(2010, 12, 31)
    delta = d2 - d1
    for i in range(delta.days/daySkip):
        day = d1 + td(days=i*daySkip)
        print day
        dayt = datetime.strptime(str(day), '%Y-%m-%d')
        unixtime = int(time.mktime(dayt.timetuple()))
        #print unixtime
        getWeatherFromAllLocationsForADay(unixtime)

getDaysForInterval()
