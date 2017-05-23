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
var messagesRef = firebase.database().ref('messages');

var storage = firebase.storage().ref(); //the image storage
var imageStorageRef = storage.child('images');

var defaultImg = "../img/avatar-default.jpg";

this.getUserImage = function(username) {
  return checkUser(username).then((result)=>{
    if(!result.image || result.image == 'placeholder') {
      return defaultImg;
    } else {
      return result.image;
    }
  });
}

//these are event handlers that will hide an error message when user starts typing in create user
$('#newusername').on('input', function(){
  $('#invalidUsername').hide();
  $('#createUserMessage').hide();//in case we tried to create an user with same uname
});

$('#newpassword').on('input', function(){
  $('#invalidPassword').hide();
});

$('#newemail').on('input', function(){
  $('#invalidEmail').hide();
});

$('#newuserimage').on('input', function(){
  $('#invalidImage').hide();
});

//when starts typing in login
$('#username').on('input', function(){
  $('#wrongpassword').hide();
})

$('#password').on('input', function(){
  $('#wrongpassword').hide();
})


//Add a user to the database, with data validation
this.addUser = function() {
  var username = document.getElementById('newusername').value;
  var password = document.getElementById('newpassword').value;
  var email = document.getElementById('newemail').value;
  var file = document.getElementById('newuserimage').files[0];
  if(!username || /[\.#\$\[\]]/.test(username)) $('#invalidUsername').show();
  else if(!password) $('#invalidPassword').show();
  else if(!email) $('#invalidEmail').show()
  else if(!file) $('#invalidImage').show()
  else {
    checkUser(username).then((result) => {
      if(result) {
        $('#createUserMessage').show();
      } else { //if no user, we can create
        imageStorageRef.child(username + "/" + file.name).put(file).then((snapshot)=> {
          usersRef.child(username).set({
            username: username,
            password: password,
            email: email,
            groups: {},
            image: snapshot.downloadURL
          });
          finishLogin({
            "username":username, 
            "email": email,
            "image": snapshot.downloadURL
          });
          addUsersCoords(username, 0, 0);
        });
        $('#createnewuser').hide();
        $("#createusersuccess").show();
      }
    })
    //return true;
  }
};

this.finishLogin = function(result) {
  console.log("Logged in: ", result.username);
  localStorage.loggedInUser = result.username;
  localStorage.loggedInUserMail = result.email;
  if(result.image == null || result.image == "placeholder"){
    localStorage.loggedInUserImg = defaultImg;
  } else localStorage.loggedInUserImg = result.image;
  if(result.groups) { //sidenote, since it is object map, there will be undefined nulls
    localStorage.loggedInUserGroups = JSON.stringify(result.groups);
  } else if (localStorage.loggedInUserGroups) {
    localStorage.removeItem("loggedInUserGroups"); //there's a bug that makes the var = "undefined", not undefined
  }
  localStorage.displayedGroups = [];
  fillUserView();
  initCheckboxes();
  $('#login').modal('hide');
  location.reload();
}

this.login = function(username, password) {
  if(!password) {
    $("#wrongpassword").show();
  } else {
    checkUser(username, password).then((result) => {
      if(result) {
        finishLogin(result);
      } else{
        $("#wrongpassword").show();
      }
    })
  }
}

//Checks whether or not the user is in the database and if the password is correct
this.checkUser = function(username, password) {
  var promise = new Promise(function(resolve, reject) {
    usersRef.child(username).on("value", function(snapshot) { //get only user if exist
      var users = snapshot.val();
      if(users && (users.password == password || !password)) {
        resolve(users);
      } else {
        resolve(0);
      }
    },
    function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    }); 
  });

  return promise.then(function(result) {
    if(result){
      return result;
    } else{
      return 0;
    }
  }, function(err) {
    console.log(err);
    return 0;
  });
}

checkGroup = function(groupId){
  var promise = new Promise(function(resolve, reject) {
    groupsRef.child(groupId).on("value", function(snapshot) { //get only group if exist
      var group = snapshot.val();
      if(group) {
        resolve(group);
      } else {
        resolve(0);
      }
    },
    function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    }); 
  });

  return promise.then(function(result) {
    if(result){
      return result;
    } else{
      return 0;
    }
  }, function(err) {
    console.log(err);
    return 0;
  });
}

//Add a group
addGroup = function(groupId, members) {
  groupsRef.child(groupId)({
    groupId: groupId,
    members: members
  });
  createList(groupId);
};

//Add a users position
addUsersCoords = function(username, lat, lng) {
  coordsRef.child(username).set({
    username: username,
    lat: lat,
    lng: lng
  });
};

//Add a user to a group
addUserToGroup = function(groupId, username) {
  var username = localStorage.loggedInUser;
  var groupId = prompt("Please enter a groupId:",1);
  if (checkGroup) {
    groupsRef.child(groupId+"/members/"+username).set({
      username: username
    });

    usersRef.child(username+"/groups/"+groupId).set({
      groupId: groupId
    });
  }
  else {
    addGroup(groupId,username);
  }
  if(localStorage.loggedInUserGroups){
    var groupJSON = JSON.parse(localStorage.loggedInUserGroups);
    groupJSON[groupId] = {groupId: groupId};
    localStorage.loggedInUserGroups = JSON.stringify(groupJSON);
  }
  else {
    localStorage.loggedInUserGroups = JSON.stringify([{groupId: groupId}]);
  }
  initCheckboxes();

};

//Gets the groups that a user is in
getGroups = function(username){
  var promise = new Promise(function(resolve, reject) {
    usersRef.child(username).on("value", function(snapshot) { //get only group if exist
      var groups = snapshot.val().groups;
      if(groups) {
        resolve(groups);
      } else {
        resolve(0);
      }
    },
    function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    }); 
  });

  return promise.then(function(result) {
    if(result){
      return result;
    } else{
      return 0;
    }
  }, function(err) {
    console.log(err);
    return 0;
  });
};

coordsRef.on("child_added", function(snapshot) {
 if(!(/chat/.test(location))){
  var lat = snapshot.val().lat;
  var lng = snapshot.val().lng;
  var username = snapshot.val().username;

  var prom = checkUser(username);
  prom.then(function(result) {
    if(result){
      newMarker(lat, lng, result.username, result.groups);
    }
    else
      console.log("Wrong");
  });
}
});
coordsRef.on("child_changed", function(snapshot) {
  if(!(/chat/.test(location))){
    var lat = snapshot.val().lat;
    var lng = snapshot.val().lng;
    var username = snapshot.val().username;
    var groups = getGroups(username);
    groups.then((result) => {
    if(result) {
      updateMarker(lat, lng, username, result);
    } else { //if no group
      updateMarker(lat, lng, username, result);
    }
  })
  }
});
coordsRef.on("child_removed", function(snapshot) {
  if(!(/chat/.test(location))){
    var lat = snapshot.val().lat;
    var lng = snapshot.val().lng;
    var userid = snapshot.val().username;
    console.log("removed ", snapshot.val());
    //deleteMarker(lat, lng, username);
  }
});

function updatePosition(lat, lng, username){
  console.log("Updating in firebase: ", lat, lng, username);
  firebase.database().ref('coords/' + username).set({
    username: username,
    lat: JSON.stringify(lat),
    lng: JSON.stringify(lng)
  });
}

function Chat() {
  if(localStorage.loggedInUser) {
    this.theMessages = document.getElementById('messages');
    this.messageForm = document.getElementById('message-form');
    this.messageInput = document.getElementById('message');
    this.submitButton = document.getElementById('submitChat');
    this.userName = document.getElementById('user-name');
    this.groupName = document.getElementById('groupName');
    this.loadMessages();
  } else { //not logged in
    window.location= "index.html"
  }
}

loadMessages = function() {
  //this.messagesRef.off(); //?
  this.messagesRef.limitToLast(20).on('child_changed', setMessage); //makes it double called sending message
  this.messagesRef.limitToLast(20).on('child_added', setMessage);
};


setMessage = function(data){
  var val = data.val();
  this.displayMessage(data.key, val.name, val.text); 
}

saveMessage = function() {
  if (this.messageInput.value) {
    var currentUser = localStorage.loggedInUser;
    this.messagesRef.push({
      name: currentUser,
      text: this.messageInput.value,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    }).then(function() {
      this.messageInput.value = '';
    }.bind(this)).catch(function(error) {
      console.error("Error when writing new messages to database", error);
    });
  }
};

MESSAGE_USER =
['<div class="oneRowMsg" id="', '' ,'"><div class="message-container ui message ownMessage" id="message-container">', '' , ' </div></div>'];

MESSAGE_NOT_USER =
['<div class="oneRowMsg" id="', '' ,'"><div class="name">', '', '</div><div class="message-container ui grey message" id="message-container">', '' , ' </div></div>'];

displayMessage = function(key, name, text) {
  if(!document.getElementById(key)) {
    if(name == localStorage.loggedInUser){
      var htmlContent = MESSAGE_USER;
      htmlContent[3] = text;
    }else{
      var htmlContent = MESSAGE_NOT_USER;
      htmlContent[3] = name;
      htmlContent[5] = text;
    }
    htmlContent[1] = key;
    var container = document.createElement('div');
    container.innerHTML = htmlContent.join("");
    this.theMessages.appendChild(container.firstChild);
    this.theMessages.scrollTop = this.theMessages.scrollHeight;
  }
};