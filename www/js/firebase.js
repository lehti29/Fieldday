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
// Get a reference to the database service
var database = firebase.database();
var coordsRef = firebase.database().ref("coords");

coordsRef.on("value", function(snapshot) {
  var users = snapshot.val();
  for (var i = 4; i <= 4; i++) {
    firebase.database().ref('coords/' + i).set({
      userid: i,
      lat: "59.337479",
      lng: "18.072797"
    });
  }
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
}); 
coordsRef.on("child_added", function(snapshot) {
  var lat = snapshot.val().lat;
  var lng = snapshot.val().lng;
  var userid = snapshot.val().userid
  console.log("added ", snapshot.val());
  newMarker(lat, lng, userid);
});
coordsRef.on("child_changed", function(snapshot) {
  var lat = snapshot.val().lat;
  var lng = snapshot.val().lng;
  var userid = snapshot.val().userid
  console.log("changed ", snapshot.val());
  updateMarker(lat, lng, userid);
});
coordsRef.on("child_removed", function(snapshot) {
  var lat = snapshot.val().lat;
  var lng = snapshot.val().lng;
  var userid = snapshot.val().userid
  console.log("removed ", snapshot.val());
  deleteMarker(lat, lng, userid);
});

function updatePosition(lat, lng, userid){
  console.log("Updating in firebase: ", lat, lng, userid);
  firebase.database().ref('coords/' + userid).set({
    userid: userid,
    lat: JSON.stringify(lat),
    lng: JSON.stringify(lng)
  });
}