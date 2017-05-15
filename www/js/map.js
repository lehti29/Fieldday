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

newMarker = function(lat, lng, userid, usrname) {
  console.log("lat: " + lat + " lng: " + lng);
  var firstLetter = usrname.charAt(0).toUpperCase();

  var newMarker = new google.maps.Marker({
      position: {lat: parseFloat(lat), lng: parseFloat(lng)},
      map: map,
      animation: google.maps.Animation.DROP,
      title: JSON.stringify(userid)
  });
  if(usrname == localStorage.loggedInUser){
    newMarker.setIcon('http://maps.google.com/mapfiles/kml/paddle/grn-blank.png');
  }
  else newMarker.setIcon('http://maps.google.com/mapfiles/kml/paddle/' + firstLetter + '.png');

  var imgSrc = "http://barnmissionen.se/shop/wp-content/uploads/2012/10/B_Webshop_Footbol.jpg";
  google.maps.event.addListener(newMarker, 'click', function() {
    var infoString = "Username:" + JSON.stringify(usrname) + "<br> + <img src='" + localStorage.loggedInUserImg +"' height='42' width='42'>";
    infowindow.setContent(infoString);
    infowindow.open(map, newMarker);

  });
  markers.push({"userid" : userid, "marker" : newMarker, "username" : usrname});
}
deleteMarker = function(lat, lng, userid){
  var result = $.grep(markers, function(e){ return e.userid === userid; });
  if(result.length == 1){
    var toBeDeleted = result[0].marker;
    toBeDeleted.setMap(null);
    markers.delete(result[0]);
  }
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
    updatePosition(startPos.coords.latitude, startPos.coords.longitude, localStorage.loggedInUserId);

  };
  navigator.geolocation.getCurrentPosition(geoSuccess);
}

toggleInterval();