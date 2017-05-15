//Shares your position every fifth second
var myVar = setInterval(function(){ sharePos() }, 5*1000);
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

newMarker = function(lat, lng, userid, usrname) {
  console.log("lat: " + lat + " lng: " + lng);
  var newMarker = new google.maps.Marker({
      position: {lat: parseFloat(lat), lng: parseFloat(lng)},
      map: map,
      animation: google.maps.Animation.DROP,
      title: JSON.stringify(userid)
  });
  if(usrname == localStorage.loggedInUser){
    console.log("same user");
    newMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
  }
  else newMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
  var imgSrc = "http://barnmissionen.se/shop/wp-content/uploads/2012/10/B_Webshop_Footbol.jpg";
  google.maps.event.addListener(newMarker, 'click', function() {
    var infoString = "Username:" + JSON.stringify(usrname) + "<br> + <img src='" + imgSrc +"' height='42' width='42'>";
    infowindow.setContent(infoString);
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
checkMarkers = function(){
  for(var i = 0; i < markers.length; i++){
    if(markers[i].userid == localStorage.loggedInUserId){
      console.log("this is me");
      markers[i].marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
    }
    else markers[i].marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
  }
}
sharePos = function(){
    var geoSuccess = function(position) {
    startPos = position;
    //console.log("lat: ", startPos.coords.latitude, " lng: ", startPos.coords.longitude);
    //FIX HARDCODED USER WITH SESSION VARIABLE OR SOME SHIT AND POSITION WITH REAL POS
    //updatePosition(startPos.coords.latitude, startPos.coords.longitude, 3);
    updatePosition(startPos.coords.latitude, startPos.coords.longitude, localStorage.loggedInUserId);
  };
  navigator.geolocation.getCurrentPosition(geoSuccess);
}