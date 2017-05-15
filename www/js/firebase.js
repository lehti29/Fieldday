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
  usersRef.push({
    userId: 1,
    username: username,
    password: password,
    email: email,
    groups: {},
    image: null
  });
  $('#createnewuser').hide();
  $('#login').show();
  $("#createusersuccess").show();
};

//Checks whether or not the user is in the database and if the password is correct
this.checkUser = function() {
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  var uid;
  var imgPath;
  console.log(username + " " + password)

  var promise = new Promise(function(resolve, reject) {
    usersRef.on("value", function(snapshot) {
      var userExist = false;
      var users = snapshot.val();

      for (var i = 0; i < Object.keys(users).length; i++) {
        if(Object.values(users)[i].username == username && Object.values(users)[i].password == password){
          userExist = true;
          uid = Object.values(users)[i].userId;
          imgPath = Object.values(users)[i].image;
          $('#login').hide();
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
      localStorage.loggedInUserId = uid;
      localStorage.loggedInUserImg = imgPath;
      document.getElementById("displayUsername").innerHTML = localStorage.loggedInUser;
      checkMarkers();
    }
    else{
      console.log("Fel lösenord")
      $("#wrongpassword").show();
    }
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


coordsRef.on("child_added", function(snapshot) {
  var lat = snapshot.val().lat;
  var lng = snapshot.val().lng;
  var userid = snapshot.val().userid;
  console.log("added ", snapshot.val());

  var prom = new Promise(function(resolve, reject) {
    usersRef.on("value", function(snapshot) {
      var user = snapshot.val();
      for (var i = 0; i < Object.keys(user).length; i++) {
        if(Object.values(user)[i].userId == userid){
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
      newMarker(lat, lng, userid, result);
    }
    else
      console.log("Wrong");
  });

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