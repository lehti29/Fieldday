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

var markers = [];
initMap = function() {
    var uluru = {lat: -25.363, lng: 131.044};
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 4,
      center: uluru
  });
    var marker = new google.maps.Marker({
      position: uluru,
      map: map
  });
}
newMarker = function(lat, lng, userid) {
  console.log("lat: " + lat + " lng: " + lng);
  var newMarker = new google.maps.Marker({
      position: {lat: parseFloat(lat), lng: parseFloat(lng)},
      map: map,
      title: JSON.stringify(userid)
  });
  //markers.add(newMarker);
}
deleteMarker = function(lat, lng, userid){
  //newMarker.setMap(null);
  //markers.delete(newMarker);
}
updateMarker = function(lat, lng, userid){
  //newMarker.setMap(null);
  //markers.delete(newMarker);
  newMarker(lat, lng, userid);
}
sharePos = function(){
    var geoSuccess = function(position) {
    startPos = position;
    console.log("lat: ", startPos.coords.latitude, " lng: ", startPos.coords.longitude);
    //FIX HARDCODED USER
    updatePosition(startPos.coords.latitude, startPos.coords.longitude, 3);
  };
  navigator.geolocation.getCurrentPosition(geoSuccess);
}

$('.ui.sidebar').first()
  .sidebar('setting', 'transition', 'overlay')
  .sidebar('setting', 'mobileTransition', 'overlay')
  .sidebar('attach events', '#sidebarToggle');

$("#sidebarToggle")
  .removeClass('disabled');

app.initialize();