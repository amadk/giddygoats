var map, heatmap;

//This function will be called once by the google api script in index.html
function initMap() {

  //Create the raw map
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: {lat: 37.775, lng: -122.434},
    mapTypeId: 'roadmap'
  });
  var infoWindow = new google.maps.InfoWindow({map: map});

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      angular.element(document.querySelector('[ng-controller="ViewController"]')).scope().setPos(pos);

      //Update global variables to be query the API for relevant radius
      console.log('set the window user location')
      userLat = position.coords.latitude;
      userLong = position.coords.longitude;

      //Center the map on the location and add marker
      infoWindow.setPosition(pos);
      infoWindow.setContent('<div class="map-panel"><img src="http://res.cloudinary.com/small-change/image/upload/v1477434563/hippi_mg7ts4.png" class="hippo-small-logo"/>YOU ARE HERE</div>');

      map.setCenter(pos);

      fetch('/testDanger' + "?long=" + position.coords.longitude + "&lat=" + position.coords.latitude + "&radius=" + 1000)
      //Get an array of all of the long/lat co-ordinates from crime in current region
      .then(function(rawData) {
        return rawData.json();
      })
      .then(function(crimePoints) {
      //Process these co-ordinates and create an array of the data points that google heat maps API requires
        var mapPoints = [];
        for (let i = 0; i < crimePoints.length; i++) {
              mapPoints.push(new google.maps.LatLng(crimePoints[i][1], crimePoints[i][0]));
        }

        return mapPoints
      })
      .then(function(mapPoints) {
        //Create the heatmap from the array created in the previous step
        heatmap = new google.maps.visualization.HeatmapLayer({
          data: mapPoints,
          map: map
        });
        angular.element(document.querySelector('[ng-controller="ViewController"]')).scope().flipMapLoaded();
      })

    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
}


function renderHeat(long, lat) {
  getPoints(long, lat)
  .then(function(mapPoints) {
    console.log('About to create heatmap')
    heatmap = new google.maps.visualization.HeatmapLayer({
      data: mapPoints,
      map: map
    });
  })
}

/*===============================
Not currently used: but keep them
===============================*/

function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function changeGradient() {
  var gradient = [
  'rgba(0, 255, 255, 0)',
  'rgba(0, 255, 255, 1)',
  'rgba(0, 191, 255, 1)',
  'rgba(0, 127, 255, 1)',
  'rgba(0, 63, 255, 1)',
  'rgba(0, 0, 255, 1)',
  'rgba(0, 0, 223, 1)',
  'rgba(0, 0, 191, 1)',
  'rgba(0, 0, 159, 1)',
  'rgba(0, 0, 127, 1)',
  'rgba(63, 0, 91, 1)',
  'rgba(127, 0, 63, 1)',
  'rgba(191, 0, 31, 1)',
  'rgba(255, 0, 0, 1)'
  ]
  heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
}

function changeOpacity() {
  heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
}