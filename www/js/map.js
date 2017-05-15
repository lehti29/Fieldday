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

newMarker = function(lat, lng, userid) {
  console.log("lat: " + lat + " lng: " + lng);
  var newMarker = new google.maps.Marker({
      position: {lat: parseFloat(lat), lng: parseFloat(lng)},
      map: map,
      animation: google.maps.Animation.DROP,
      title: JSON.stringify(userid)
  });
  console.log("userid: ", userid);
  google.maps.event.addListener(newMarker, 'click', function() {
    infowindow.setContent("User: ", userid);
    infowindow.open(map, newMarker);
  });
  markers.push({"userid" : userid, "marker" : newMarker});
}
deleteMarker = function(lat, lng, userid){
  //newMarker.setMap(null);
  //markers.delete(newMarker);
}
updateMarker = function(lat, lng, userid){
  //console.log("inside updateMarker");
  var result = $.grep(markers, function(e){ return e.userid === userid; });
  if(result.length == 1){
    //console.log("result.length ", result.length);
    //console.log("prevmarker: ", result[0].marker, " user: ", result[0].userid);
    var previousMarker = result[0].marker;
    var updated = new google.maps.LatLng(lat, lng);
    previousMarker.setPosition(updated);
  }
  else if(result.length == 0){
    console.log("No Marker from that user was found");
  }
  else console.log("More than one marker from that user was found");
}

toggleInterval = function() {
  if(isInterval) {
    console.log("stop sharing");
    isInterval = 0;
    clearInterval(shareInterval);
    $("#sharePosIcon").show();
  } else {
    console.log("start sharing");
    isInterval = 1;
    $("#sharePosIcon").hide();
    shareInterval = setInterval(sharePos, 5*1000);
  }
}

function sharePos(){
    var geoSuccess = function(position) {
    startPos = position;
    //FIX HARDCODED USER WITH SESSION VARIABLE OR SOME SHIT AND POSITION WITH REAL POS
    //updatePosition(startPos.coords.latitude, startPos.coords.longitude, 3);
    updatePosition(startPos.coords.latitude, startPos.coords.longitude, 1);
  };
  navigator.geolocation.getCurrentPosition(geoSuccess);
}

toggleInterval();