$(document).ready(function() {
    L.mapbox.accessToken = 'pk.eyJ1IjoiY2hhcmxlc2xhaSIsImEiOiJkNTA0YzU4NzY0YWQ2MzcwYmEwMGU1NmEwZjMwZDllNyJ9.mGudpKLGaugdbRUuNWHc8g';
    var geolocate = document.getElementById('geolocate');
    var map = L.mapbox.map('map', 'mapbox.emerald')
    .setView([27.0, 17.0], 2);


    if (!navigator.geolocation) {
        geolocate.innerHTML = 'Geolocation is not available';
    } else {
        geolocate.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            map.locate();
        };
    }

    map.on('locationfound', function(e) {
        map.fitBounds(e.bounds);

        myLayer.setGeoJSON({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [e.latlng.lng, e.latlng.lat]
            },
            properties: {
                'title': 'Here I am!',
                'marker-color': '#ff8888',
                'marker-symbol': 'star'
            }
        });

    // And hide the geolocation button
        geolocate.parentNode.removeChild(geolocate);
    });

    map.on('locationerror', function() {
        console.log('Position could not be found');
    });

    var markers = new L.MarkerClusterGroup();
    var clusterPoints = []
    $.ajax({
        url: 'http://bitr.me/allactivity',
        type: 'GET'
    })
    // SUCCESS: USE CLUSTERPOINTS
    .done(function(response) {
        // ADD DB POINTS
        console.log(response);
        for (var i = 0; i < response.length; i++) {
            var activity = response[i];
            var vote = activity["vote"];
            var lat = activity["lat"];
            var lng = activity["lng"];
            var title = "Check it out!";
            if (vote === "true"){
                var marker = L.marker(new L.LatLng(lat, lng), {
                    icon: L.mapbox.marker.icon({'marker-symbol': 'circle', 'marker-color': '37B8AF'}),
                    title: title
                });
            }
            else {
                var marker = L.marker(new L.LatLng(lat, lng), {
                    icon: L.mapbox.marker.icon({'marker-symbol': 'cross', 'marker-color': 'F17279'}),
                    title: title
                });
            }
            marker.bindPopup(title);
            markers.addLayer(marker);
        }
    })
    // FAILURE: USE SAMPLE DATA POINTS
    .fail(function(error) {
        console.log(error);
    })
    .always(function() {
        console.log("complete");
        for (var i = 0; i < addressPoints.length; i++) {
            var a = addressPoints[i];
            console.log(a);
            var vote = a[2];
            var title = "Check it out!";
            if (vote){
                var marker = L.marker(new L.LatLng(a[0], a[1]), {
                    icon: L.mapbox.marker.icon({'marker-symbol': 'circle', 'marker-color': '37B8AF'}),
                    title: title
                });
            }
            else {
                var marker = L.marker(new L.LatLng(a[0], a[1]), {
                    icon: L.mapbox.marker.icon({'marker-symbol': 'cross', 'marker-color': 'F17279'}),
                    title: title
                });
            }
            marker.bindPopup(title);
            markers.addLayer(marker);
        }
        map.scrollWheelZoom.disable();
        map.addLayer(markers);
    });
});