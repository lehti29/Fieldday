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
  console.log(username);
  console.log(password)

  var promise = new Promise(function(resolve, reject) {
    usersRef.on("value", function(snapshot) {
      var userExist = false;
      var users = snapshot.val();

      for (var i = 0; i < Object.keys(users).length; i++) {
        if(Object.values(users)[i].username == username && Object.values(users)[i].password == password)
          userExist = true;
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
    if(result)
      console.log("Logged in");
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

this.addUser(1, "rasmuf", "hej", {group1: 1, group2: 2}, ".png");
this.addUser(2, "Emil", "meh",{},"")
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


//Nytt
function Chat() {
  console.log("Yes");
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
  //Set groupname
  this.groupName.innerHTML="GroupName"; //Här sätts gruppnamnet i topbaren
  console.log("Gruppnamnet ska va satt nu...");
}

loadMessages = function() {
  this.messagesRef.off();
  //Load the last 15 messages and new ones.
  var setMessage = function(data){
    var val = data.val();
    this.displayMessage(data.key, val.name, val.text); 
  }.bind(this);
  this.messagesRef.limitToLast(15).on('child_added', setMessage);
  this.messagesRef.limitToLast(15).on('child_changed', setMessage);
  console.log("loadMessages");
};

saveMessage = function() {
  //Message entered check
  if (this.messageInput.value) {
    var currentUser = anvandaren; //ANVÄNDAREN HÄR
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

//Message Template, user blue: #417cff max-width: 100%; style="color: white;""
Chat.MESSAGE_TEMPLATE_USER =
    '<div>'+

      '<div class="message-container" id="message-container" style="background-color: #ee82ee; float: right; margin-top: 8px;">' +
        '<div class="message"></div>' +
      '</div>'+
    '</div>';

Chat.MESSAGE_TEMPLATE_NOT_USER =
      '<div>'+
        '<div class="name"></div>' +
        '<div class="message-container" id="message-container" style="background-color: #eaeaea">' +
          '<div class="message"></div>' +
      '</div>'+
    '</div>';

displayMessage = function(key, name, text) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet - it is created
  if (!div) {
    var container = document.createElement('div');
    //Color the "bubbles" depending on user or others...
    if(name == anvandaren){
      container.innerHTML = Chat.MESSAGE_TEMPLATE_USER;
    }else{
      container.innerHTML = Chat.MESSAGE_TEMPLATE_NOT_USER;
    }
    div = container.firstChild;
    div.setAttribute('id', key);
    this.theMessages.appendChild(div);
  }
  if(name != anvandaren){
    div.querySelector('.name').textContent = name;
  }
  var messageElement = div.querySelector('.message');  
  if (text) { // If text message
    messageElement.textContent = text;
    //Line breaks replaced by <br>
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');    
  }
  // Always scroll so last message is visible
  document.getElementById(key).style.width = "100%";
  //document.getElementById(key).style.display = "inline-block"; 
  div.classList.add('visible');
  this.theMessages.scrollTop = this.theMessages.scrollHeight;
  console.log("displayMessage");
};

//Set user for now....
var anvandaren;
function popup() {
  var person = prompt("Username:", "Write here");
  if(person == null || person == "") {
    console.log("User cancelled the prompt"); //Nåt slags felmeddelande....behövs nog inte skrivas ut....
  }else{
    anvandaren = person; //Användaren sparas här (namnet)
  }
  console.log(anvandaren);
}

//Test för 1:a meddelandet...
function sendTestMess() {
    this.messagesRef.push({
    name: "Test user",
    text: "Japp, det funkar"
    });
}