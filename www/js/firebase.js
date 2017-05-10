var config = {
  apiKey: "AIzaSyDGvzeCn61RbB5sGHTdUvSMa1BjaXHZ7A8",
  authDomain: "fieldday-6dd14.firebaseapp.com",
  databaseURL: "https://fieldday-6dd14.firebaseio.com",
  storageBucket: "fieldday-6dd14.appspot.com"
};
firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();
var usersRef = firebase.database().ref("users");

usersRef.on("value", function(snapshot) {
  var users = snapshot.val();
  for (var i = 1; i <= 10; i++) {
    firebase.database().ref('users/' + i).set({
      userid: i,
      username: "Rasmus",
      email: "rasmuf@kth.se"
    });
  }
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});


