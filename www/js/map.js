//Shares your position every fifth second
var shareInterval;
var isInterval = 0;
var infowindow;
var markers = [[], [], [], [], [], [], [], [], []];
var markers1 = [];
var markers2 = [];
var markers3 = [];
var markers4 = [];
var markers5 = [];
var markers6 = [];
var markers7 = [];
initMap = function() {
    infowindow = new google.maps.InfoWindow();
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
showMarkers = function(groupNumber){
  var gnumber = groupNumber.charAt(groupNumber.length -1)
  console.log("Show groups: ", gnumber);
  console.log("ma: ", markers[gnumber]);
  markers[gnumber].forEach(function(entry) {
    console.log("Entry: ", entry);
    if(!entry.marker.getVisible()){
      entry.marker.setVisible(true);
    }   
  });
}
hideMarkers = function(groupNumber){
  var gnumber = groupNumber.charAt(groupNumber.length -1)
  console.log("Show groups: ", gnumber);
  console.log("ma: ", markers[gnumber]);
  markers[gnumber].forEach(function(entry) {
    console.log("Entry: ", entry);
    if(entry.marker.getVisible()){
      entry.marker.setVisible(false);
    } 
  });
}

newMarker = function(lat, lng, username, groups) {
  var firstLetter = username.charAt(0).toUpperCase();
  for (var group in groups){
    var groupNumber = group.charAt(group.length - 1);
    if(groupNumber == null) return;
    var newMarker = new google.maps.Marker({
        position: {lat: parseFloat(lat), lng: parseFloat(lng)},
        map: map,
        animation: google.maps.Animation.DROP,
        title: JSON.stringify(username)
    });
    if(username == localStorage.loggedInUser){
      newMarker.setIcon('http://maps.google.com/mapfiles/kml/paddle/grn-blank.png');
    }
    else newMarker.setIcon('http://maps.google.com/mapfiles/kml/paddle/' + firstLetter + '.png');
    google.maps.event.addListener(newMarker, 'click', function() {
      getUserImage(username).then((result)=>{
        var infoString = ["<b>User: </b>", JSON.stringify(username), 
        '<br><img src="', result, '" height="100" width="100" alt="Image">'].join("");
        infowindow.setContent(infoString);
        infowindow.open(map, newMarker);
      })
    });
    newMarker.setVisible(false);
    markers[groupNumber].push({"marker" : newMarker, "username" : username});
  }
}

//DOESN'T WOOOORK. IT CAN'T FIND THE MARKER IN MARKERS
deleteMarker = function(lat, lng, username){
  var result = $.grep(markers, function(e){ return e.username === username; });
  if(result.length == 1){
    console.log("delete")
    var toBeDeleted = result[0].marker;
    toBeDeleted.setMap(null);
    markers.delete(result[0]);
  }
}
updateMarker = function(lat, lng, username){
  var result = $.grep(markers, function(e){ return e.username === username; });
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
checkMarkers = function(){
  /*for(var i = 0; i < markers.length; i++){
    if(markers[i].username == localStorage.loggedInUser){
      console.log("this is me");
      markers[i].marker.setIcon('http://maps.google.com/mapfiles/kml/paddle/grn-blank.png');
    }
    else {
      var letter = markers[i][].username.charAt(0).toUpperCase();
      markers[i].marker.setIcon('http://maps.google.com/mapfiles/kml/paddle/' + letter + '.png');
    }
  }*/
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