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
      console.log("image: ", result.image)
      return result.image;
    }
  });
}

//Add a user to the database
this.addUser = function() {
  var username = document.getElementById('newusername').value;
  var password = document.getElementById('newpassword').value;
  var email = document.getElementById('newemail').value;
  var file = document.getElementById('newuserimage').files[0];
  //document.getElementById("displayImg").src = file;
  // var image = document.getElementById('newimage').value;
  var promise = checkUser(username, password);
  promise.then((result) => {
    if(result) {
      $('#createUserMessage').show();
    } else { //if no user, we can create
      var url = "";
      imageStorageRef.child(username + "/" + file.name).put(file).then((snapshot)=> {
        console.log('Uploaded a file!: ', file.name);
        url = snapshot.downloadURL;
        console.log('Got download URL ', url);
        usersRef.child(username).set({
          username: username,
          password: password,
          email: email,
          groups: {},
          image: url
        });
        finishLogin({
          "username":username, 
          "email": email,
          "image": url
        });
        addUsersCoords(username, 0, 0);
      });
      $('#createnewuser').hide();
      $("#createusersuccess").show();
    }
  })
};

this.finishLogin = function(result) {
  console.log("Logged in: ", result.username);
  localStorage.loggedInUser = result.username;
  if(result.image == null || result.image == "placeholder"){
    localStorage.loggedInUserImg = defaultImg;
  } else localStorage.loggedInUserImg = result.image;
  localStorage.loggedInUserMail = result.email;
  if(result.groups) { //sidenote, since it is object map, there will be undefined nulls
    localStorage.loggedInUserGroups = JSON.stringify(result.groups);
  } else if (localStorage.loggedInUserGroups) {
    localStorage.removeItem("loggedInUserGroups"); //there's a bug that makes the var = "undefined", not undefined
  }
  fillUserView();
  initCheckboxes();
  $('#login').modal('hide');
  //checkMarkers();
}

this.login = function(username, password) {
  checkUser(username, password).then((result) => {
    if(result) {
      finishLogin(result);
    } else{
      $("#wrongpassword").show();
    }
  })
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
    console.log("groupid: ", groupId)
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
    console.log("changed ", snapshot.val());

    var groups = getGroups(username);
    groups.then((result) => {
    if(result) {
      console.log("Got groups!");
      updateMarker(lat, lng, username, result);
    } else { //if no group
      console.log("This user is not part of any group");
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
    deleteMarker(lat, lng, username);
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
  this.theMessages = document.getElementById('messages');
  this.messageForm = document.getElementById('message-form');
  this.messageInput = document.getElementById('message');
  this.submitButton = document.getElementById('submitChat');
  this.userName = document.getElementById('user-name');
  this.groupName = document.getElementById('groupName');
  // Saves message on formsubmit'en.
  this.messageForm.addEventListener('submitChat', this.saveMessage.bind(this));
  this.loadMessages();
  console.log("Chat");
  //Name in topbar
  this.groupName.innerHTML="Group Chat";
}

loadMessages = function() {
  this.messagesRef.off();
  var setMessage = function(data){
    var val = data.val();
    this.displayMessage(data.key, val.name, val.text); 
  }.bind(this);
  this.messagesRef.limitToLast(20).on('child_added', setMessage);
  this.messagesRef.limitToLast(20).on('child_changed', setMessage);
};

saveMessage = function() {
  if (this.messageInput.value) {
    var currentUser = anvandaren;
    //Add message
    this.messagesRef.push({
      name: currentUser,
      text: this.messageInput.value,
    }).then(function() {
      //Clear message text in textfield
      var mess = this.messageInput;
      mess.value = '';
      console.log("saveMessage");
    }.bind(this)).catch(function(error) {
      console.error("Error when writing new messages to database", error);
    });
  }
};

//Display messages (Eventually Margin Bottom 1em)
Chat.MESSAGE_USER =
'<div style="min-height: 4em; width: 100%; clear: both;">'+
'<div class="message-container" id="message-container" style="background-color: #ee82ee; float: right; margin-top: 8px; max-width: 70%;">' +
'<div class="message"></div>' +
'</div>'+
'</div>';

Chat.MESSAGE_NOT_USER =
'<div style="min-height: 4em; width: 100%; margin-bottom: 0.4em; clear: both;">'+
'<div class="name"></div>' +
'<div class="message-container" id="message-container" style="background-color: #eaeaea; max-width: 70%;">' +
'<div class="message"></div>' +
'</div>'+
'</div>';

displayMessage = function(key, name, text) {
  var div = document.getElementById(key);
  // Create message if not existing
  if (!div) {
    var container = document.createElement('div');
    //Color the "bubbles" depending on user or others...
    if(name == anvandaren){
      container.innerHTML = Chat.MESSAGE_USER;
    }else{
      container.innerHTML = Chat.MESSAGE_NOT_USER;
    }
    div = container.firstChild;
    div.setAttribute('id', key);
    this.theMessages.appendChild(div);
  }
  if(name != anvandaren){
    div.querySelector('.name').textContent = name;
  }
  var messageElement = div.querySelector('.message');  
  if (text) { 
    messageElement.textContent = text;
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');    
  }
  // Scroll til last message
  //---document.getElementById(key).style.width = "100%";
  //document.getElementById(key).style.display = "inline-block"; 
  div.classList.add('visible');
  this.theMessages.scrollTop = this.theMessages.scrollHeight;
  console.log("displayMessage");
};

//Set user for now....
var anvandaren;
/*function popup() {
  var person = prompt("Username:", "Write here");
  if(person == null || person == "") {
    console.log("User cancelled the prompt"); //Nåt slags felmeddelande....behövs nog inte skrivas ut....
  }else{
    anvandaren = person; //Användaren sparas här (namnet)
  }
  console.log(anvandaren);
}*/
var anvandaren = localStorage.loggedInUser;

//Test för 1:a meddelandet...
function sendTestMess() {
  this.messagesRef.push({
    name: "Test user",
    text: "Japp, det funkar"
  });
}