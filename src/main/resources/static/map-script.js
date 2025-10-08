let map;
let userLocation = null;
let userMarker = null;
let accuracyCircle = null;


document.addEventListener('DOMContentLoaded', function() {
    setupMapControls();
});

async function initMap() {
    const mapOptions = {
        center: { lat: 14.072, lng: 100.603 }, // มธ. รังสิต
        zoom: 15,
        disableDefaultUI: true // ปิดปุ่มควบคุมของ Google ทั้งหมด    
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    // --- ส่วนติดตามตำแหน่งผู้ใช้ ---
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                userLocation = { // อัปเดตตำแหน่งล่าสุด
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                const accuracy = position.coords.accuracy;

                // สร้างหรืออัปเดต Marker และ Circle ของผู้ใช้
                updateUserLocationMarker(userLocation, accuracy);
            }
        );
    }

    // Autocomplete Search
    const searchInput = document.getElementById('search-input');
    const autocomplete = new google.maps.places.Autocomplete(searchInput);
    autocomplete.bindTo('bounds', map);

    const searchMarker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });

    autocomplete.addListener('place_changed', () => {
        searchMarker.setVisible(false);
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
            window.alert("ไม่พบสถานที่: '" + place.name + "'");
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
        
        searchMarker.setPosition(place.geometry.location);
        searchMarker.setVisible(true);
    });

    
    // ดึงข้อมูลสถานที่จาก API 
    try {
        const response = await fetch('http://localhost:8080/api/locations');
        const locations = await response.json();
        locations.forEach(location => {
            new google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: map,
                title: location.name
            });
        });
    } catch (error) {
        console.error('Error fetching locations:', error);
    }
}

function updateUserLocationMarker(location, accuracy) {
    if (!userMarker) {
        
        userMarker = new google.maps.Marker({
            position: location,
            map: map,
            title: "ตำแหน่งของคุณ",
        });

        accuracyCircle = new google.maps.Circle({
            map: map,
            radius: accuracy,
            center: location,
            fillColor: '#FF0000',
            fillOpacity: 0.2,
            strokeColor: '#FF0000',
            strokeOpacity: 0.5,
            strokeWeight: 1
        });
        
        map.setCenter(location);
        map.setZoom(17);
    } else {
        // ถ้ามีอยู่แล้ว ให้อัปเดตตำแหน่ง
        userMarker.setPosition(location);
        accuracyCircle.setCenter(location);
        accuracyCircle.setRadius(accuracy);
    }
}

function setupMapControls() {

    //  Logic ปุ่ม My Location
    const myLocationBtn = document.getElementById('my-location-btn');
    myLocationBtn.addEventListener('click', () => {
        if (userLocation) {
            map.setCenter(userLocation);
            map.setZoom(17);
        } else {
            alert("ยังไม่สามารถหาตำแหน่งของคุณได้, กรุณาอนุญาตให้เข้าถึงตำแหน่ง");
        }
    });

}