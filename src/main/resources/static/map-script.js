let map;
let userLocation = null;
let userMarker = null;
let accuracyCircle = null;
let infoWindow = null;


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
    infoWindow = new google.maps.InfoWindow();

     // สร้าง InfoWindow Object ไว้ใช้ซ้ำ
    infoWindow = new google.maps.InfoWindow();

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

            // =========================================================
            // ปรับปรุง: ใช้ MOCK DATA แทนการเรียก Fetch API
            // =========================================================

            /*
            const response = await fetch('http://localhost:8080/api/locations');
            if (!response.ok) {
                throw new Error(`HTTP error! สถานะ: ${response.status}`);
            }
            const locations = await response.json();
            */

            const locations = MOCK_LOCATIONS_DATA; // <<< ใช้ข้อมูลจำลอง
        
            locations.forEach(location => {
            
                // ใช้ location.latitude และ location.longitude 
                const marker = new google.maps.Marker({
                    position: { lat: location.latitude, lng: location.longitude }, 
                    map: map,
                    title: location.name 
                });

                // =========================================================
                // U3. Task 3.4: แสดงข้อมูลเบื้องต้นเมื่อคลิกที่หมุด
                // =========================================================

                marker.addListener('click', () => {
            
                    // 1. สร้างเนื้อหา HTML สำหรับ Popup (ใช้ข้อมูลจาก Mock Data)
                    const content = `
                        <div class="place-popup">
                            <h4>${location.name} (${location.shortName})</h4>
                            <p>เวลาทำการ: ${location.workingHours || 'N/A'}</p> 
                            <p>สถานะความหนาแน่น: <b>${location.densityStatus || 'N/A'}</b></p>
                    
                            <button class="details-btn" 
                                    data-shortname="${location.shortName}"
                                    onclick="infoWindow.close(); fetchAndDisplayDetails(this.getAttribute('data-shortname'));">
                                ดูรายละเอียด 
                            </button>
                        </div>
                        `;
            
                    // 2. ตั้งค่าเนื้อหาและเปิด Popup ที่ Marker ที่ถูกคลิก
                    infoWindow.setContent(content);
                    infoWindow.open(map, marker);
                });

                /*
                marker.addListener('click', () => {
            
                    // 1. สร้างเนื้อหา HTML สำหรับ Popup (ใช้ข้อมูลที่มีอยู่แล้ว)
                    const content = `
                        <div class="place-popup">
                            <h4>${location.name}</h4>
                            <p>รหัสย่อ: <b>${location.shortName}</b></p>
                            <p>สถานะความหนาแน่น: ${location.densityStatus || 'N/A'}</p>
                            <button class="details-btn" 
                                    data-shortname="${location.shortName}"
                                    onclick="fetchAndDisplayDetails(this.getAttribute('data-shortname')); infoWindow.close();">
                                ดูรายละเอียด (Task 3.5)
                            </button>
                        </div>
                    `;
            
                    // 2. ตั้งค่าเนื้อหาและเปิด Popup ที่ Marker ที่ถูกคลิก
                    infoWindow.setContent(content);
                    infoWindow.open(map, marker);
                });
                */
        
            });

            // ผูก Event Click สำหรับ Task ถัดไป
            /*
            marker.addListener('click', () => {
                // เรียกฟังก์ชันแสดงรายละเอียด (ใช้ shortName ในการค้นหาใน Backend)
                fetchAndDisplayDetails(location.shortName); 
            });
            
            // (Optional: แสดงชื่อย่อ/ความหนาแน่นใน Infowindow เมื่อวางเม้าส์)
            const infoWindow = new google.maps.InfoWindow({
                content: `<b>${location.shortName}</b><br>ความหนาแน่น: ${location.densityStatus || 'N/A'}`
            });
            //marker.addListener('mouseover', () => infoWindow.open(map, marker));
            //marker.addListener('mouseout', () => infoWindow.close());
            */

         
    }
    catch (error) {
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

    // =========================================================
    //  เพิ่มการค้นหาเมื่อกดปุ่ม Enter
    // =========================================================
    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            // ตรวจสอบว่าคีย์ที่กดคือ Enter (key 13)
            if (event.key === 'Enter') {
                event.preventDefault(); // ป้องกันการ Submit form มาตรฐาน
                const searchTerm = searchInput.value.trim();
                
                if (searchTerm) {
                    // เรียกฟังก์ชันค้นหาสถานที่
                    fetchAndDisplayDetails(searchTerm); 
                }
            }
        });
    }
    // ---------------------------------------------------------

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            
            // ใช้ค่าจาก Autocomplete แทน ถ้ามีค่า
            // *หมายเหตุ: ถ้าผู้ใช้เลือกจาก Autocomplete, searchInput.value จะถูกตั้งค่าโดย Autocomplete Listener แล้ว*
            
            if (searchTerm) {
                // 1. เรียกฟังก์ชันค้นหาสถานที่ของเราจาก Backend
                fetchAndDisplayDetails(searchTerm); 
            } else {
                alert("กรุณาป้อนชื่อสถานที่ย่อ (เช่น SC3) หรือเลือกจากคำแนะนำการค้นหา");
            }
        });
    }
} 


/**
 * ค้นหารายละเอียดสถานที่จาก Mock Data และแสดงผลบนแผนที่ (Task 3.5 และ U4)
 * @param {string} searchTerm - ชื่อสถานที่ย่อ (shortName) ที่ใช้ค้นหา
 */
async function fetchAndDisplayDetails(searchTerm) {
    console.log("Detail request initiated for:", searchTerm);
    
    // ค้นหาสถานที่จาก Mock Data
    const locationDetails = MOCK_LOCATIONS_DATA.find(loc => 
        loc.shortName.toLowerCase() === searchTerm.toLowerCase()
    );
    
    if (!locationDetails) {
        alert(`ไม่พบสถานที่ '${searchTerm}' ในข้อมูลจำลอง`);
        return;
    }

    const position = { 
        lat: locationDetails.latitude, 
        lng: locationDetails.longitude 
    };

    // 1. Move Map: ขยับแผนที่และซูมไปยังตำแหน่งที่ค้นพบ
    map.setCenter(position);
    map.setZoom(17); 
    
    // 2. Display Popup: สร้าง Marker ชั่วคราวและเปิด Popup
    
    const content = `
        <div class="place-popup">
            <h4>${locationDetails.name} (${locationDetails.shortName})</h4>
            <p>เวลาทำการ: ${locationDetails.workingHours || 'N/A'}</p> 
            <p>สถานะความหนาแน่น: <b>${locationDetails.densityStatus || 'N/A'}</b></p>
            
            <button class="details-btn" 
                    onclick="alert('แสดงรายละเอียดเต็มของ ${locationDetails.name} (Task 3.5)'); infoWindow.close();">
                ดูรายละเอียดเติม
            </button>
        </div>               
    `;
    
    const tempMarker = new google.maps.Marker({
        position: position,
        map: map,
        title: locationDetails.name
    });

    infoWindow.setContent(content);
    infoWindow.open(map, tempMarker);

    // ลบ Marker ชั่วคราวเมื่อ Popup ปิด
    google.maps.event.addListener(infoWindow, 'closeclick', function() {
        tempMarker.setMap(null); 
    });
}


// เชิ่อมกับbackend
/*
async function fetchAndDisplayDetails(searchTerm) {
    console.log("Detail request initiated for:", searchTerm);
    
    try {
        // 1. Fetch Data: ดึงข้อมูลสถานที่จาก Backend (สมมติว่า API ตอบกลับด้วย Object สถานที่เดียว)
        const response = await fetch(`http://localhost:8080/api/details?search=${searchTerm}`);
        if (!response.ok) {
            alert(`ไม่พบสถานที่ '${searchTerm}' ในระบบของเรา`);
            return;
        }
        
        const locationDetails = await response.json();
        
        // ตรวจสอบว่ามีข้อมูล Lat/Lng ครบถ้วน
        if (!locationDetails.latitude || !locationDetails.longitude) {
            console.error("ข้อมูลสถานที่ไม่มีพิกัด Lat/Lng ที่ถูกต้อง");
            return;
        }

        const position = { 
            lat: locationDetails.latitude, 
            lng: locationDetails.longitude 
        };

        // 2. Move Map: ขยับแผนที่และซูมไปยังตำแหน่งที่ค้นพบ
        map.setCenter(position);
        map.setZoom(17); 
        
        // *หมายเหตุ: ถ้าต้องการให้มี Marker ชั่วคราวปรากฏที่ตำแหน่งที่ค้นหา ให้สร้าง Marker ใหม่ที่นี่*
        
        // 3. Display Popup: แสดงข้อมูลเบื้องต้นใน Infowindow (Popup) ทันที
        
        const content = `
            <div class="place-popup">
                <h4>${locationDetails.name} (${locationDetails.shortName})</h4>
                <p>สถานะความหนาแน่น: <b>${locationDetails.densityStatus || 'N/A'}</b></p>
                <button class="details-btn" 
                        data-shortname="${locationDetails.shortName}"
                        onclick="infoWindow.close(); fetchAndDisplayDetails(this.getAttribute('data-shortname'));">
                    ดูรายละเอียดเต็ม (Task 3.5)
                </button>
            </div>
        `;
        
        // สร้าง Marker ชั่วคราวเพื่อใช้เป็น Anchor ของ Popup
        const tempMarker = new google.maps.Marker({
            position: position,
            map: map,
            title: locationDetails.name
        });

        // เปิด Popup ที่ตำแหน่ง Marker ชั่วคราว
        infoWindow.setContent(content);
        infoWindow.open(map, tempMarker);

        // (***สำคัญ: อาจต้องลบ Marker ชั่วคราวออกเมื่อ Popup ปิด หากคุณไม่ต้องการให้มี Marker ซ้ำซ้อน***)
        google.maps.event.addListener(infoWindow, 'closeclick', function() {
            tempMarker.setMap(null); // ลบ Marker ชั่วคราว
        });
        
    } catch (error) {
        console.error('Error in fetching and displaying details:', error);
        alert("เกิดข้อผิดพลาดในการดึงข้อมูลสถานที่ กรุณาลองใหม่อีกครั้ง");
    }
}*/

/**
 * Mock Data: ข้อมูลสถานที่จำลอง (ใช้แทนข้อมูลที่ดึงจาก Backend)
 */
const MOCK_LOCATIONS_DATA = [
    {
        name: "อาคารเรียนรวม 3 ",
        shortName: "SC3",
        latitude: 14.0754,
        longitude: 100.6052,
        densityStatus: "ปานกลาง",
        // ข้อมูลเพิ่มเติมสำหรับ Popup
        workingHours: "จ.-ศ. 8:00-20:00",
        detailDescription: "อาคารเรียนหลักสำหรับคณะวิทยาศาสตร์และเทคโนโลยี"
    },
    {
        name: "สำนักงานอธิการบดี",
        shortName: "โดม",
        latitude: 14.0718,
        longitude: 100.6030,
        densityStatus: "ว่าง",
        workingHours: "จ.-ศ. 8:30-16:30",
        detailDescription: "อาคารศูนย์กลางการบริหารมหาวิทยาลัย"
    },
    {
        name: "ศูนย์หนังสือมหาวิทยาลัยธรรมศาสตร์",
        shortName: "Bookstore",
        latitude: 14.0730,
        longitude: 100.6015,
        densityStatus: "หนาแน่น",
        workingHours: "ทุกวัน 9:00-18:00",
        detailDescription: "แหล่งรวมตำราเรียนและอุปกรณ์การศึกษา"
    }
];