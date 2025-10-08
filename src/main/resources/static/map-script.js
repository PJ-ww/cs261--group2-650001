let map;
let userLocation = null;
let userMarker = null;
let accuracyCircle = null;


document.addEventListener('DOMContentLoaded', function() {
    // ต้องเรียก setupMapControls() ก่อนเพื่อให้ปุ่มต่างๆ ทำงานได้เมื่อ DOM โหลดเสร็จ
    setupMapControls(); 
});

// ฟังก์ชันหลักที่ถูกเรียกโดย Google Maps API Key
async function initMap() {
    const mapOptions = {
        center: { lat: 14.072, lng: 100.603 }, // มธ. รังสิต
        zoom: 15,
        disableDefaultUI: true 
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    // ส่วนติดตามตำแหน่งผู้ใช้ (Real-time Geolocation) 
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                userLocation = { 
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                const accuracy = position.coords.accuracy;
                updateUserLocationMarker(userLocation, accuracy);
            }
        );
    }

    // Autocomplete Search (ใช้ Google Places API) ---
    const searchInput = document.getElementById('search-input');
    const autocomplete = new google.maps.places.Autocomplete(searchInput);
    autocomplete.bindTo('bounds', map);

    
    const searchMarker = new google.maps.Marker({ map: map, anchorPoint: new google.maps.Point(0, -29) });

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

    
     // ดึงข้อมูลสถานที่ และ Render Markers 
    try {
        const response = await fetch('http://localhost:8080/api/locations');
        if (!response.ok) {
             throw new Error(`HTTP error! สถานะ: ${response.status}`);
        }
        const locations = await response.json();
        
        locations.forEach(location => {
            
            // ใช้ location.latitude และ location.longitude 
            const marker = new google.maps.Marker({
                position: { lat: location.latitude, lng: location.longitude }, 
                map: map,
                title: location.name 
            });

            // ผูก Event Click สำหรับ Task ถัดไป
            marker.addListener('click', () => {
                // เรียกฟังก์ชันแสดงรายละเอียด (ใช้ shortName ในการค้นหาใน Backend)
                fetchAndDisplayDetails(location.shortName); 
            });
            
            // (Optional: แสดงชื่อย่อ/ความหนาแน่นใน Infowindow เมื่อวางเม้าส์)
            const infoWindow = new google.maps.InfoWindow({
                content: `<b>${location.shortName}</b><br>ความหนาแน่น: ${location.densityStatus || 'N/A'}`
            });
            marker.addListener('mouseover', () => infoWindow.open(map, marker));
            marker.addListener('mouseout', () => infoWindow.close());
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
            icon: { // เพิ่มไอคอนที่แตกต่างสำหรับตำแหน่งผู้ใช้
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#e62d2dff',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                scale: 6
            }
        });

        accuracyCircle = new google.maps.Circle({
            map: map,
            radius: accuracy,
            center: location,
            fillColor: '#e62d2dff',
            fillOpacity: 0.15,
            strokeColor: '#e62d2dff',
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

    // Logic ปุ่ม My Location เดิม
    const myLocationBtn = document.getElementById('my-location-btn');
    myLocationBtn.addEventListener('click', () => {
        if (userLocation) {
            map.setCenter(userLocation);
            map.setZoom(17);
        } else {
            alert("ยังไม่สามารถหาตำแหน่งของคุณได้, กรุณาอนุญาตให้เข้าถึงตำแหน่ง");
        }
    });
    
    // Logic ปุ่ม Search สำหรับค้นหาสถานที่ 
    const searchBtn = document.querySelector('.search-btn'); 
    const searchInput = document.getElementById('search-input');

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            // เมื่อกดปุ่มค้นหา ให้เรียก API รายละเอียดของเรา
            if (searchTerm) {
                fetchAndDisplayDetails(searchTerm); 
            } else {
                alert("กรุณาป้อนชื่อสถานที่ย่อ (เช่น SC3)");
            }
        });
    }
} 

function fetchAndDisplayDetails(searchTerm) {
    console.log("Detail request initiated for:", searchTerm);
    // Logic: 1. Fetch /api/details?search={searchTerm} 
    //        2. Display Details Modal
}