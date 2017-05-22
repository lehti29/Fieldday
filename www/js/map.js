//Shares your position every fifth second
var shareInterval;
var isInterval = 0;
var infowindow;
var markers = [];

//Adds a list to the list
createList = function(groupNumber){
  if(markers.length === groupNumber){
    markers[groupNumber] = [];
  }
}
initMap = function() {
    infowindow = new google.maps.InfoWindow();
    var sthlm = {lat: 59.337479, lng: 18.072797};
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 16,
      center: sthlm,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: true, //moves the type buttons to the right
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT
      }
    });
}
showMarkers = function(groupNumber){
  console.log("groupnumber: ", groupNumber);
  var gnumber = groupNumber;
  markers[gnumber].forEach(function(entry) {
    if(!entry.marker.getVisible()){
      entry.marker.setVisible(true);
    }   
  });
}
hideMarkers = function(groupNumber){
  console.log("groupnumber: ", groupNumber);
  var gnumber = groupNumber;
  markers[gnumber].forEach(function(entry) {
    if(entry.marker.getVisible() && entry.username != localStorage.loggedInUser){
      entry.marker.setVisible(false);
    } 
  });
}

newMarker = function(lat, lng, username, groups) {
  var firstLetter = username.charAt(0).toUpperCase();
  for (var group in groups){
    if(group == null && username != localStorage.loggedInUser) {
      console.log("groups?");
      return;
    }
    var newMarker = new google.maps.Marker({
        position: {lat: parseFloat(lat), lng: parseFloat(lng)},
        map: map,
        animation: google.maps.Animation.DROP,
        title: JSON.stringify(username)
    });
    if(username == localStorage.loggedInUser ){
        newMarker.setIcon('http://maps.google.com/mapfiles/kml/paddle/grn-blank.png');
        map.setCenter({lat:parseFloat(lat), lng:parseFloat(lng)});
    }
    else if (localStorage.displayedGroups && localStorage.displayedGroups.includes(parseInt(group))) {
      newMarker.setIcon('http://maps.google.com/mapfiles/kml/paddle/' + firstLetter + '.png');
    }
    else {
      newMarker.setIcon('http://maps.google.com/mapfiles/kml/paddle/' + firstLetter + '.png');
      newMarker.setVisible(false);
    }
    google.maps.event.addListener(newMarker, 'click', function() {
      getUserImage(username).then((result)=>{
        var infoString = ["<b>User: </b>", JSON.stringify(username), 
        '<br><img src="', result, '" height="100" width="100" alt="Image">'].join("");
        infowindow.setContent(infoString);
        infowindow.open(map, newMarker);
      })
    });
    if(markers[group] == null){
      markers[group] = [];
    }
    markers[group].push({"marker" : newMarker, "username" : username});
  }
}

deleteMarkers = function(){
  for(var i = 0; i < markers.length; i++){
    if(markers[i] != null){
      var list = markers[i];
      list.forEach(function(entry) {
      console.log("Entry: ", entry);
      entry.marker.setMap(null);  
    });
    }
  }
  deleteMarkers = [];
}
updateMarker = function(lat, lng, username, groups){
  for (var group in groups){
    if(group == null) continue;
    var result = $.grep(markers[group], function(e){ return e.username === username; });
    if(result.length == 1){
      var previousMarker = result[0].marker;
      var updated = new google.maps.LatLng(lat, lng);
      previousMarker.setPosition(updated);
    }
    else if(result.length == 0){
      console.log("No Marker from that user was found, creating a marker");
      newMarker(lat, lng, username);
    }
    else console.log("More than one marker from that user was found");
  }
}

toggleInterval = function() {
  if(isInterval) {
    console.log("stop sharing");
    isInterval = 0;
    clearInterval(shareInterval);
    $("#sharePosIcon").show();
  } else if (localStorage.loggedInUser) {
    console.log("start sharing ");//, localStorage);
    isInterval = 1;
    $("#sharePosIcon").hide();
    shareInterval = setInterval(sharePos, 5*1000);
  } else {
    console.log("please log in");
  }
}

function sharePos(){
  var geoSuccess = function(position) {
    startPos = position;
    updatePosition(startPos.coords.latitude, startPos.coords.longitude, localStorage.loggedInUser);
  };

  var geoFail = function(err) {
    console.log("something went wrong with the geosharing: ", err);
  }

  var options = {
    timeout: 5000,
    maximumAge: 0
  };
  navigator.geolocation.getCurrentPosition(geoSuccess, geoFail, options);
}