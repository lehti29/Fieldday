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
this.addUser = function() {
  var username = document.getElementById('newusername').value;
  var password = document.getElementById('newpassword').value;
  var email = document.getElementById('newemail').value;
  // var image = document.getElementById('newimage').value;
  if(checkUser(username, password)) {
    $('#createUserMessage').show();
  } else { //if no user, we can create
    usersRef.child(username).set({
      userId: 1,
      username: username,
      password: password,
      email: email,
      groups: {group1: 1, group2: 2},
      image: "placeholder"
    });
    addUsersCoords(username, 0, 0);
    $('#createnewuser').hide();
    $('#login').show();
    $("#createusersuccess").show();
  }
};

//Checks whether or not the user is in the database and if the password is correct
this.checkUser = function(username, password) {
  var promise = new Promise(function(resolve, reject) {
    usersRef.child(username).on("value", function(snapshot) { //get only user if exist
      var users = snapshot.val();
      if(users && users.password == password) {
        $('#login').hide();
        resolve(users);
      } else {
        console.log("no user with that username and password");
        resolve(0);
      }
    },
    function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    }); 
  });

  promise.then(function(result) {
    if(result){
      console.log("Logged in: ", result.username);
      localStorage.loggedInUser = result.username;
      if(result.image == null || result.image === "placeholder"){
        localStorage.loggedInUserImg = "./img/avatar-default.jpg";
      }
      else localStorage.loggedInUserImg = result.image;
      localStorage.loggedInUserMail = result.email;
      document.getElementById("displayUsername").innerHTML = localStorage.loggedInUser;
      document.getElementById("displayMail").innerHTML = localStorage.loggedInUserMail;
      document.getElementById("displayImg").src = localStorage.loggedInUserImg;
      checkMarkers();
      return 1;
    }
    else{
      console.log("Fel losenord")
      $("#wrongpassword").show();
      return 0;
    }
  }, function(err) {
    console.log(err);
    return 0;
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
addUsersCoords = function(username, lat, lng) {
  coordsRef.push({
    username: username,
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


coordsRef.on("child_added", function(snapshot) {
  var lat = snapshot.val().lat;
  var lng = snapshot.val().lng;
  var username = snapshot.val().username;
  console.log("added ", snapshot.val());

  var prom = new Promise(function(resolve, reject) {
    usersRef.on("value", function(snapshot) {
      var user = snapshot.val();
      for (var i = 0; i < Object.keys(user).length; i++) {
        if(Object.values(user)[i].username == username){
          var usr = Object.values(user)[i].username;
          console.log("user: ", usr);
        }
      }
      if (usr != null) {
        resolve(usr);
      }
      else {
        reject(Error("It broke"));
      }
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    }); 
  });
  prom.then(function(result) {
    console.log("after");
    if(result){
      console.log("result", result);
      newMarker(lat, lng, result);
    }
    else
      console.log("Wrong");
  });

});
coordsRef.on("child_changed", function(snapshot) {
  var lat = snapshot.val().lat;
  var lng = snapshot.val().lng;
  var username = snapshot.val().username
  console.log("changed ", snapshot.val());
  updateMarker(lat, lng, username);
});
coordsRef.on("child_removed", function(snapshot) {
  var lat = snapshot.val().lat;
  var lng = snapshot.val().lng;
  var userid = snapshot.val().userid
  console.log("removed ", snapshot.val());
  deleteMarker(lat, lng, userid);
});

function updatePosition(lat, lng, username){
  console.log("Updating in firebase: ", lat, lng, username);
  firebase.database().ref('coords/' + username).set({
    username: username,
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
  this.messagesRef.limitToLast(20).on('child_added', setMessage);
  this.messagesRef.limitToLast(20).on('child_changed', setMessage);
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