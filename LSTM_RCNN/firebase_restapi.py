from firebase import firebase

#Authentication
def firebaseCall(file):
    firebase = firebase.FirebaseApplication('https://met-oracle.appspot.com/', authentication=None)

    authentication = firebase.Authentication('kriskringle123', 'testcasething@email.com', extra={'id': aAZxxqEfZqdxduBozhOPkVNdaev1})
    firebase.authentication = authentication
    print(authentication.extra)

    user = authentication.get_user()
    print(user.firebase_auth_tokem)

    Get = firebase.get(file, None)
    print(Get)
