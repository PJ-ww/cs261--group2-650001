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
                    
                            <a href="detail.html?shortName=${location.shortName}" class="details-btn">
                                ดูรายละเอียด 
                            </a>
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
/*
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
            
            <a href="detail.html?shortName=${locationDetails.shortName}" class="details-btn">
                ดูรายละเอียด 
            </a>
        </div>               
    `;

   // 3. เปิด Popup ที่ตำแหน่งนั้น
    infoWindow.setContent(content);
    // สร้าง Marker ชั่วคราวเพื่อใช้เปิด infoWindow (หากไม่มี Marker ของสถานที่นั้นอยู่แล้ว)
    const tempMarker = new google.maps.Marker({
        position: position,
        map: map,
        title: locationDetails.name
    });

    infoWindow.open(map, tempMarker);
    
    // ลบ Marker ชั่วคราวเมื่อ Pop-up ถูกปิด เพื่อไม่ให้มี Marker ซ้ำซ้อน
    google.maps.event.addListener(infoWindow, 'closeclick', function() {
        tempMarker.setMap(null); 
    });
}*/


// เชิ่อมกับbackend
async function fetchAndDisplayDetails(searchTerm) {
    console.log("Detail request initiated for:", searchTerm);
    
    try {
        // 1. Fetch Data: เปลี่ยนไปเรียก Endpoint ที่มีอยู่: /api/locations
        //    และเนื่องจาก Backend ส่ง List กลับมา (แม้จะค้นหาแค่ 1 รายการ)
        const response = await fetch(`http://localhost:8080/api/locations?search=${searchTerm}`); 
        
        if (!response.ok) {
            // ยังคงจัดการ Error เหมือนเดิม
            alert(`ไม่พบสถานที่ '${searchTerm}' ในระบบของเรา`);
            return;
        }
        
        // รับค่ากลับมาเป็น List (Array) ของสถานที่
        const locationList = await response.json(); 
        
        // **[จุดที่ 1]** ตรวจสอบว่ามีสถานที่อยู่ใน List หรือไม่
        if (locationList.length === 0) {
            alert(`ไม่พบสถานที่ '${searchTerm}' ในระบบของเรา`);
            return;
        }

        // **[จุดที่ 2]** เลือกรายการแรกมาใช้งาน
        const locationDetails = locationList[0]; 
        
        // **[จุดที่ 3]** ต้องแก้ไขการเข้าถึง Field ที่ไม่มีใน Model Backend
        
        // 1. สร้าง workingHours จาก openTime และ closeTime ที่มีใน Model
        const workingHours = (locationDetails.openTime && locationDetails.closeTime)
            ? `${locationDetails.openTime} - ${locationDetails.closeTime}`
            : 'N/A';
            
        // 2. shortName: Model เดิมของคุณไม่มี shortName
        //    *ถ้า Backend ค้นหาด้วย name, เราจะใช้ name เป็น shortName ชั่วคราว*
        const shortName = locationDetails.name; // <--- *อาจต้องปรับตามการทำงานจริงของ Backend*

        // ตรวจสอบว่ามีข้อมูล Lat/Lng ครบถ้วน (เหมือนเดิม)
        if (!locationDetails.latitude || !locationDetails.longitude) {
            console.error("ข้อมูลสถานที่ไม่มีพิกัด Lat/Lng ที่ถูกต้อง");
            return;
        }

        const position = { 
            lat: locationDetails.latitude, 
            lng: locationDetails.longitude 
        };

        // 2. Move Map: ขยับแผนที่และซูมไปยังตำแหน่งที่ค้นพบ (เหมือนเดิม)
        map.setCenter(position);
        map.setZoom(17); 
        
        // 3. Display Popup: สร้าง Content ใหม่โดยใช้ Field ที่แก้ไขแล้ว
        
        const content = `
        <div class="place-popup">
            <h4>${locationDetails.name} (${shortName})</h4> 
            <p>เวลาทำการ: ${workingHours}</p> 
            
            <a href="detail.html?shortName=${encodeURIComponent(shortName)}" class="details-btn">
                ดูรายละเอียด 
            </a>
        </div> 
        `;
        // <p>สถานะความหนาแน่น: <b>${locationDetails.densityStatus || 'N/A'}</b></p>
        
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
        // Log ข้อผิดพลาดทั้งหมดไปที่ Console สำหรับนักพัฒนา (Developer)
        console.error('Error in fetching and displaying details:', error);
    
        // แจ้งเตือนผู้ใช้ถึงข้อผิดพลาดที่เกิดขึ้น
    
        let errorMessage = "เกิดข้อผิดพลาดในการดึงข้อมูลสถานที่ กรุณาลองใหม่อีกครั้ง";
    
        // ถ้า error เป็น instance ของ Error (เช่น Network Error, JSON parsing error)
        if (error instanceof TypeError && error.message.includes('fetch')) {
            // อาจเป็นปัญหาเรื่อง CORS, Server ปิดอยู่, หรือ Network หลุด
            errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Backend ได้ (ตรวจสอบว่า Server เปิดอยู่หรือไม่)";
        }
    
        // แสดงข้อความเตือนไปยังผู้ใช้
        alert(errorMessage);
    }
}

// Mock Data: ข้อมูลสถานที่จำลอง (ใช้แทนข้อมูลที่ดึงจาก Backend)
/*const MOCK_LOCATIONS_DATA = [
    {
        name: "อาคารเรียนรวมสังคมศาสตร์ 3",
        shortName: "SC3",
        latitude: 14.0754,
        longitude: 100.6052,
        densityStatus: "มาก",
        workingHoursWeekday: "8.00-16.30", 
        workingHoursWeekend: "ปิดทำการ",
        detailDescription: "อาคารเรียนหลักสำหรับคณะวิทยาศาสตร์และเทคโนโลยีและสังคมศาสตร์...",
        imagePath: "/image/sc3.jpg"
    },
    {
        name: "สำนักงานอธิการบดี",
        shortName: "โดม",
        latitude: 14.0718,
        longitude: 100.6030,
        densityStatus: "ว่าง",
        workingHoursWeekday: "8:30-16:30",
        workingHoursWeekend: "ปิดทำการ",
        detailDescription: "อาคารศูนย์กลางการบริหารมหาวิทยาลัย",
        imagePath: "" 
    },
    {
        name: "ศูนย์หนังสือมหาวิทยาลัยธรรมศาสตร์",
        shortName: "Bookstore",
        latitude: 14.0730,
        longitude: 100.6015,
        densityStatus: "ปานกลาง",
        workingHoursWeekday: "9:00-18:00",
        workingHoursWeekend: "9:00-18:00",
        detailDescription: "แหล่งรวมตำราเรียนและอุปกรณ์การศึกษา",
        imagePath: "/image/โดม.jpg" 
    }
];*/