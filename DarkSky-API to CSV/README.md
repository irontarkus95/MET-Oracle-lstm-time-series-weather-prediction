# DarkSky to CSV
---
*Accepts Latitude/Longitude/UnixTime Ranges using Dark Sky API and formats into CSV for ease of use with Tensorflow.*

---

#### Procedure

##### Data compiled using following statement:
---
```
getWeatherDataWithin -l NWLatLong -r SELatLong -s StartDate - e EndDate
```
#### The statement executes the following commands.
---
Set up database using *pymongo*

```
localhost mongo
```
The following command retrieves data from the unix time interval set,and store it in a database using *pymongo*:
```
python getData.py
```
The following command will write the data from the database into *CSV*:
```
python writeData.py
```
