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
        /*
            var parentElement = document.getElementById(id);
            var listeningElement = parentElement.querySelector('.listening');
            var receivedElement = parentElement.querySelector('.received');

            listeningElement.setAttribute('style', 'display:none;');
            receivedElement.setAttribute('style', 'display:block;');
        }*/


        if (id == 'deviceready'){
            initMap();
        }
    }
};

initMap = function() {
    var uluru = {lat: -25.363, lng: 131.044};
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 4,
      center: uluru,
      mapTypeControl: true, //moves the type buttons to the center
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_CENTER
      }
    });
    var marker = new google.maps.Marker({
      position: uluru,
      map: map
  });
}

$('.ui.sidebar').first()
  .sidebar('setting', 'transition', 'overlay')
  .sidebar('setting', 'mobileTransition', 'overlay')
  .sidebar('attach events', '#sidebarToggle');

$("#sidebarToggle")
  .removeClass('disabled');

var displaygroup = [];

$('.checkbox').checkbox().checkbox({
    onChecked: function() {
      displaygroup.push(this.id)
    },
    onUnchecked: function() {
      var pos = displaygroup.indexOf(this.id);
      displaygroup.splice(pos, 1); //removes 1 item on index pos
    },
    onChange: function() {
      var childCheckbox  = this.id;
      console.log("Change called on child: ", childCheckbox, ' with displaygroup: ', displaygroup);
    }
  })
;

app.initialize();