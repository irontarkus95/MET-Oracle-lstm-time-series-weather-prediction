# Coomunicates with Firebase Rest API. Accepts file dump from lstm_weather.py and uploads to Firebase, where it is parsed and presented to user graphically.
from firebase import firebase

#Authentication
def firebaseCall(file):
    firebase = firebase.FirebaseApplication('https://met-oracle.appspot.com/', authentication=None)
    authentication = firebase.Authentication('kriskringle123', 'testcasething@email.com', extra={'id': aAZxxqEfZqdxduBozhOPkVNdaev1})
    firebase.authentication = authentication
    user = authentication.get_user()
    Get = firebase.get(file, None)
    print(Get)
