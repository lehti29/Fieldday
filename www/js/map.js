//Shares your position every fifth second
var shareInterval;
var isInterval = 0;
var infowindow;
var markers = [];
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

newMarker = function(lat, lng, usrname) {
  //console.log("lat: " + lat + " lng: " + lng);
  var firstLetter = usrname.charAt(0).toUpperCase();

  var newMarker = new google.maps.Marker({
      position: {lat: parseFloat(lat), lng: parseFloat(lng)},
      map: map,
      animation: google.maps.Animation.DROP,
      title: JSON.stringify(usrname)
  });
  if(usrname == localStorage.loggedInUser){
    newMarker.setIcon('http://maps.google.com/mapfiles/kml/paddle/grn-blank.png');
  }
  else newMarker.setIcon('http://maps.google.com/mapfiles/kml/paddle/' + firstLetter + '.png');
  google.maps.event.addListener(newMarker, 'click', function() {
    var infoString = "<b>User: </b>" + JSON.stringify(usrname) + 
    "<br><img src='http://people.kth.se/~lehti/img/" + usrname + ".jpg' height='100' width='100' alt='Image'>";
    infowindow.setContent(infoString);
    infowindow.open(map, newMarker);
  });
  markers.push({"marker" : newMarker, "username" : usrname});
}
deleteMarker = function(lat, lng, userid){
  var result = $.grep(markers, function(e){ return e.userid === userid; });
  if(result.length == 1){
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
  for(var i = 0; i < markers.length; i++){
    if(markers[i].username == localStorage.loggedInUser){
      console.log("this is me");
      markers[i].marker.setIcon('http://maps.google.com/mapfiles/kml/paddle/grn-blank.png');
    }
    else {
      var letter = markers[i].username.charAt(0).toUpperCase();
      markers[i].marker.setIcon('http://maps.google.com/mapfiles/kml/paddle/' + letter + '.png');
    }
  }
}

toggleInterval = function() {
  if(isInterval) {
    console.log("stop sharing");
    isInterval = 0;
    clearInterval(shareInterval);
    $("#sharePosIcon").show();
  } else if (localStorage.loggedInUser) {
    console.log("start sharing ", localStorage);
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
  navigator.geolocation.getCurrentPosition(geoSuccess);
}