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
    var sthlm = {lat: 59.337479, lng: 18.072797};
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 14,
      center: sthlm,
      mapTypeControl: true, //moves the type buttons to the center
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_CENTER
      }
    });
}
newMarker = function(lat, lng, userid) {
  console.log("lat: " + lat + " lng: " + lng);
  var newMarker = new google.maps.Marker({
      position: {lat: parseFloat(lat), lng: parseFloat(lng)},
      map: map,
      animation: google.maps.Animation.DROP,
      title: JSON.stringify(userid)
  });
  markers.push({"userid" : userid, "marker" : newMarker});
}
deleteMarker = function(lat, lng, userid){
  //newMarker.setMap(null);
  //markers.delete(newMarker);
}
updateMarker = function(lat, lng, userid){
  console.log("inside updateMarker");
  var result = $.grep(markers, function(e){ return e.userid === userid; });
  if(result.length == 1){
    console.log("result.length ", result.length);
    console.log("prevmarker: ", result[0].marker, " user: ", result[0].userid);
    var previousMarker = result[0].marker;
    var updated = new google.maps.LatLng(lat, lng);
    previousMarker.setPosition(updated);
  }
  else if(result.length == 0){
    console.log("No Marker from that user was found");
  }
  else console.log("More than one marker from that user was found");
}
sharePos = function(){
    var geoSuccess = function(position) {
    startPos = position;
    console.log("lat: ", startPos.coords.latitude, " lng: ", startPos.coords.longitude);
    //FIX HARDCODED USER WITH SESSION VARIABLE OR SOME SHIT AND POSITION WITH REAL POS
    //updatePosition(startPos.coords.latitude, startPos.coords.longitude, 3);
    updatePosition(59.347715, 18.075412, 3);
  };
  navigator.geolocation.getCurrentPosition(geoSuccess);
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