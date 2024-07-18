$(document).ready(function() {
    if ($('#cesiumContainer').length) {
        Cesium.Ion.defaultAccessToken = '{{ cesium_token }}'; // Use the token passed from the backend

        var viewer = new Cesium.Viewer('cesiumContainer', {
            imageryProvider: new Cesium.OpenStreetMapImageryProvider({
                url : 'https://a.tile.openstreetmap.org/'
            }),
            baseLayerPicker: false,
            geocoder: false
        });

        var markers = [];

        const clearMarkers = () => {
            markers.forEach(marker => viewer.entities.remove(marker));
            markers = [];
        };

        const updateMap = (lat, lon, antipodeLat, antipodeLon, address) => {
            clearMarkers();

            var originalMarker = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(lon, lat),
                point: { pixelSize: 10, color: Cesium.Color.RED },
                label: {
                    text: `Original Location: ${address}`,
                    font: '14pt sans-serif',
                    fillColor: Cesium.Color.BLACK,
                    style: Cesium.LabelStyle.fillColorE,
                    // outlineColor: Cesium.Color.BLACK,
                    // outlineWidth: 1, // Reduce outline width for clarity
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -9)
                }
            });

            var antipodeMarker = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(antipodeLon, antipodeLat),
                point: { pixelSize: 10, color: Cesium.Color.BLUE },
                label: {
                    text: 'Antipode Location',
                    font: '14pt sans-serif',
                    fillColor: Cesium.Color.BLACK,
                    style: Cesium.LabelStyle.fillColor,
                    // outlineColor: Cesium.Color.BLACK,
                    // outlineWidth: 1, // Reduce outline width for clarity
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -9)
                }
            });

            markers.push(originalMarker, antipodeMarker);

            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(lon, lat, 10000000), // Fly to original location
                complete: function() {
                    setTimeout(function() {
                        viewer.camera.flyTo({
                            destination: Cesium.Cartesian3.fromDegrees(antipodeLon, antipodeLat, 10000000) // Fly to antipode location
                        });
                    }, 3000); // Delay in milliseconds before flying to antipode location
                }
            });
        };

        $('#addressForm').on('submit', function(event) {
            event.preventDefault();
            const address = $('#address').val();

            $.post('/calculate', { address: address }, function(data) {
                if (data.error) {
                    alert(data.error);
                } else {
                    $('#original-coordinates').text(`Latitude: ${data.original.lat}, Longitude: ${data.original.lon}`);
                    $('#antipode-coordinates').text(`Latitude: ${data.antipode.lat}, Longitude: ${data.antipode.lon}`);
                    updateMap(data.original.lat, data.original.lon, data.antipode.lat, data.antipode.lon, address);
                }
            });
        });
    }
});