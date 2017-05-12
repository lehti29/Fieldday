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
var groupsRef = firebase.database().ref("groups");
var coordsRef = firebase.database().ref("coords");

//Add a user to the database
this.addUser = function(userId, username, password, groups, image) {
  usersRef.push({
    userId: userId,
    username: username,
    password: password,
    groups: groups,
    image: image
  });
};

//Checks whether or not the user is in the database and if the password is correct
this.checkUser = function(username, password) {
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;

  var promise = new Promise(function(resolve, reject) {
    usersRef.on("value", function(snapshot) {
      var userExist = false;
      var users = snapshot.val();

      for (var i = 0; i < Object.keys(users).length; i++) {
        if(Object.values(users)[i].username == username && Object.values(users)[i].password == password){
          userExist = true;
          document.getElementById('login').style.display='none'
        }
      }

      if (userExist != null) {
        resolve(userExist);
      }
      else {
        reject(Error("It broke"));
      }
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    }); 
  });

  promise.then(function(result) {
    if(result){
      console.log("Logged in");
      localStorage.loggedInUser = username;
    }
    else
      console.log("Wrong username or password, try again");
  }, function(err) {
    console.log(err);
  });
}

//Add a group
addGroup = function(groupId, groupUsers, admin) {
  groupsRef.push({
    groupId: groupId,
    groupUsers: groupUsers,
    admin: admin
  });
};

//Add a users position
addUsersCoords = function(userId, lat, lng) {
  coordsRef.push({
    userId: userId,
    lat: lat,
    lng: lng
  });
};

//Add a user to a group
addUserToGroup = function(groupId, userId) {
  var groupRef = firebase.database().ref("groups/"+groupId+"/groupUsers");
  groupsRef.push({
    userId: userId
  });

  var userGroupRef = firebase.database().ref("users/"+userId+"/groups");
  groupsRef.push({
    groupId: groupId
  });
};

// this.addUser(1, "rasmuf", "hej", {group1: 1, group2: 2}, ".png");
// this.addUser(2, "Emil", "meh",{},"")
// checkUser("rasmuf","hej");
// checkUser("Emil", "mh")



// coordsRef.on("value", function(snapshot) {
//   var users = snapshot.val();
//   console.log(users);
//   for (var i = 4; i <= 4; i++) {
//     firebase.database().ref('coords/' + i).set({
//       userid: i,
//       lat: "59.337479",
//       lng: "18.072797"
//     });
//   }
// }, function (errorObject) {
//   console.log("The read failed: " + errorObject.code);
// }); 
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