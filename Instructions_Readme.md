# MET-Oracle: Weather Prediction to Improve Smart City Resilience
---
__*MET-Oracle*__ is a tool to improve the lives of citizens and increase infrastructure's resilience, in Trinidad and Tobago, by helping us predict and prepare for adverse weather conditions brought on by Global Warming, and quantifying the effect it will have on our country's climate. It is a linear regression model built in Python using Tensorflow and our web interface uses the Google Maps API.

---
---

Met-Oracle is a regressor based on recurrent networks, using tensorflow.

Our objective is to predict continuous weather values, based on previous observations using the LSTM architecture.

This build is dependant on tensorflow-1.1.0 and the polyaxon library. (https://github.com/polyaxon/polyaxon)

---
## Install and Run

### Create a Virtual Environment
A virtual env is recommended as this build is very dependant on the package versions listed in requirements.txt

python3

```
$ mkvirtualenv -p python3 ltsm
(ltsm) $
```

python2
```
$ mkvirtualenv ltsm
(ltsm) $
```

### Install Requirements

#### Requirements for tensorflow-1.1.0 and polyaxon

```
(ltsm) $ pip install -r ./requirements.txt
```
