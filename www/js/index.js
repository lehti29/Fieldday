/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 var app = {
    // Application Constructor
    initialize: function() {
      document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
      this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {

      if (id == 'deviceready'){
        initMap();
        if(window.cordova){
          console.log("cordova available");
        }
      }
    }
  };

  var displaygroup = [];

  function initSidebar() {
    $('.ui.sidebar').first()
    .sidebar('setting', 'transition', 'overlay')
    .sidebar('setting', 'mobileTransition', 'overlay')
    .sidebar('attach events', '#sidebarToggle');

    $("#sidebarToggle")
    .removeClass('disabled');
  }

  function userAddGroup() {
  //TODO!
}

function initCheckboxes() {
  if(!localStorage.loggedInUserGroups) {
    $('#groupBoxes').append('<button class="ui olive button" onclick="addUserToGroup();"><i class="plus icon"></i> Join group</button>');
  } else {
    var groups = JSON.parse(localStorage.loggedInUserGroups);
    var groupboxes = $('#groupBoxes');
    groupboxes.html("");
    Object.keys(groups).forEach((group)=>{
      if(groups[group] != null) {
        var groupnr = groups[group].groupId;
        var div = ['<div class="inline field"><div class="ui checkbox"><input type="checkbox" id="group', 
        groupnr, '"><label for="group', groupnr, '">Group ', groupnr, '</label></div></div>'].join("");
        $('#groupBoxes').append(div);
      }
    });
    $('#groupBoxes').append('<button class="ui olive button" onclick="addUserToGroup();"><i class="plus icon"></i> Join group</button>');
    
    $('.checkbox').checkbox().checkbox({
      onChecked: function() {
        displaygroup.push(this.id)
        showMarkers(this.id);
      },
      onUnchecked: function() {
        var pos = displaygroup.indexOf(this.id);
        displaygroup.splice(pos, 1); //removes 1 item on index pos
        hideMarkers(this.id);
      },
      onChange: function() {
        console.log("Change called on child: ", this.id, ' with displaygroup: ', displaygroup);
      }
    });
  }
}


initLogin = function() {
  if(localStorage.loggedInUser) {
    console.log("logged in: ", localStorage)
    document.getElementById("displayUsername").innerHTML = localStorage.loggedInUser;
    document.getElementById("displayMail").innerHTML = localStorage.loggedInUserMail;
    document.getElementById("displayImg").src = localStorage.loggedInUserImg;
    initCheckboxes();
  } else {

    $('.modal.coupled').modal({
      allowMultiple: true
    })
    $('#login')
      //.modal('attach events', '#openLogin.button', 'show')
      //.modal('setting', 'closable', false)
      .modal('show');
      ;
      $('#createnewuser')
      .modal('attach events', '#createnewuserbutton');
    }
  }

  logout = function() {
    localStorage.clear();
    initLogin();
  }


  initLogin();
  initSidebar();

  app.initialize();