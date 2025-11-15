let map;
let userLocation = null;
let userMarker = null;
let accuracyCircle = null;
let infoWindow = null;
let directionsService;
let directionsRenderer;

// --- 1. เพิ่มตัวแปรสำหรับเก็บ Markers ---
let allMarkers = []; // เก็บหมุดทั้งหมดที่โหลดมา
let searchTempMarker = null; // เก็บหมุดชั่วคราวที่เกิดจากการค้นหา

// *** 📌 ตัวแปรใหม่สำหรับ Autocomplete ***
let searchTimeout;
const DEBOUNCE_DELAY = 300; // หน่วงเวลา 300ms
const API_SEARCH_SUGGESTION_URL = 'http://localhost:8080/api/locations?search='; // สมมติว่า Backend มี Endpoint นี้

document.addEventListener('DOMContentLoaded', function() {
    // ต้องเรียก setupMapControls() ก่อนเพื่อให้ปุ่มต่างๆ ทำงานได้เมื่อ DOM โหลดเสร็จ
    setupMapControls(); 
    // *** 📌 เรียกตั้งค่า Autocomplete Listener ใหม่ (แทนที่ Google Places) ***
    setupSearchAutocomplete(); 
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

     // เริ่มต้น Directions Service และ Renderer
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map); // บอก Renderer ว่าจะวาดเส้นทางบนแผนที่ 'map'

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

    // *** ❌ ลบส่วน Autocomplete ของ Google Places ออกไป ***
    // (เพราะเราจะใช้ Logic จาก Backend แทน)
    
     // ดึงข้อมูลสถานที่ และ Render Markers 
    try {

            // =========================================================
            // การเรียก Fetch API
            // =========================================================

 
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

                // =========================================================
                // U3. Task 3.4: แสดงข้อมูลเบื้องต้นเมื่อคลิกที่หมุด
                // =========================================================
				// --- 2. เก็บ Marker ที่สร้างไว้ ---
				allMarkers.push(marker);
                marker.addListener('click', () => {
    
                // 1. สร้างเนื้อหา HTML สำหรับ Popup
                const content = `
                <div class="place-popup">
                    <h4>${location.name} (${location.description})</h4>
                    <p>
                        เวลาทำการ: 
                        ${(location.openTime?.trim() && location.closeTime?.trim()) 
                        ? `${location.openTime} - ${location.closeTime}` 
                        : 'N/A'}
                    </p>
                    <p>สถานะความหนาแน่น: <b>${location.densityStatus || 'N/A'}</b></p>
            
                    <div class="popup-actions"> 
                        <button class="bookmark-btn" data-name="${location.name}">
                            📌 บุ๊กมาร์ก
                        </button>
                        <a href="detail.html?shortName=${encodeURIComponent(location.name)}" class="details-btn">
                            ดูรายละเอียด
                        </a>
                    </div>
                    <button class="directions-btn" 
                            data-lat="${location.latitude}" 
                            data-lng="${location.longitude}">
                            <i class="fa-solid fa-person-walking"></i> นำทาง (เดิน)
                    </button>
                </div>
                `;
    
                // 2. ตั้งค่าเนื้อหาและเปิด Popup ที่ Marker ที่ถูกคลิก
                infoWindow.setContent(content);

                google.maps.event.addListener(infoWindow, 'domready', () => {
                    const directionsBtn = document.querySelector('.directions-btn');
                    if (directionsBtn) {
                      directionsBtn.onclick = () => {
                          const lat = parseFloat(directionsBtn.getAttribute('data-lat'));
                          const lng = parseFloat(directionsBtn.getAttribute('data-lng'));
                          
						  // 1. ปิด InfoWindow *ก่อน* เริ่มนำทาง
						  if (infoWindow) {
						  	infoWindow.close();
						  }
						                            
						  // 2. ซ่อน Marker
						  hideAllMarkers(); 
						  marker.setMap(null);
						  
						  calculateAndDisplayRoute({ lat: lat, lng: lng });
                      };
                    }
                    });

                infoWindow.open(map, marker);
    
                // 3. (เพิ่มเติม) ต้องเพิ่ม Listener สำหรับปุ่ม Bookmark
                // เนื่องจากปุ่มถูกสร้างขึ้นมาใหม่เมื่อคลิก Marker
                // คุณจะต้องดึงปุ่มและเพิ่ม Event Listener ที่นี่:
                google.maps.event.addListener(infoWindow, 'domready', () => {
                    const bookmarkBtn = infoWindow.getContent().querySelector('.bookmark-btn');
                    if (bookmarkBtn) {
                        bookmarkBtn.addEventListener('click', () => {
                            const placeName = bookmarkBtn.getAttribute('data-name');
                            
                            alert(`กำลังบันทึก "${placeName}"...`);

                            // *** ในการใช้งานจริง ควรเรียก API บันทึกบุ๊กมาร์กจริง ๆ ที่นี่ ***
                            // และนำทางเมื่อ API ตอบกลับว่าสำเร็จแล้วเท่านั้น

                            // **ตัวอย่างจำลองการบันทึกสำเร็จ:**
                            setTimeout(() => {
                                alert(`✅ บันทึก "${placeName}" เป็นรายการโปรดสำเร็จแล้ว! ระบบจะนำคุณไปที่หน้ารายการโปรด`);
                                
                                // เปลี่ยนข้อความปุ่ม
                                bookmarkBtn.textContent = '✅ บุ๊กมาร์กแล้ว';

                                // *** 📌 โค้ดนำทางไปยังหน้า Favorites ***
                                window.location.href = 'favorites.html';
                                
                            }, 500); // หน่วงเวลา 0.5 วินาที จำลองการเรียก API

                        });
                    }
                });
            });   
        });       
    }
    catch (error) {
        console.error('Error fetching locations:', error);
    }
        
}


// ... (ฟังก์ชัน updateUserLocationMarker ยังคงเหมือนเดิม) ...

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
                    // ปิด Suggestions หลังจากกด Enter
                    const resultsContainer = document.getElementById('autocomplete-results');
                    if (resultsContainer) resultsContainer.style.display = 'none';
                }
            }
        });
    }
    // ---------------------------------------------------------

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            
            if (searchTerm) {
                // 1. เรียกฟังก์ชันค้นหาสถานที่ของเราจาก Backend
                fetchAndDisplayDetails(searchTerm); 
            } else {
                alert("กรุณาป้อนชื่อสถานที่ย่อ (เช่น SC3) หรือเลือกจากคำแนะนำการค้นหา");
            }
        });
    }
} 

// --- 📌 ฟังก์ชันใหม่สำหรับ Autocomplete ---
function setupSearchAutocomplete() {
    const searchInput = document.getElementById('search-input');
    // ต้องมี div ใน HTML ที่ id="autocomplete-results"
    const resultsContainer = document.getElementById('autocomplete-results'); 

    if (!searchInput || !resultsContainer) {
        console.warn("ไม่พบองค์ประกอบค้นหาหรือผลลัพธ์ Autocomplete ใน DOM");
        return;
    }
    
    searchInput.addEventListener('input', (event) => {
        const query = event.target.value.trim();
        
        clearTimeout(searchTimeout); 

        if (query.length < 2) { // เริ่มค้นหาเมื่อพิมพ์อย่างน้อย 2 ตัวอักษร
            resultsContainer.style.display = 'none';
            return;
        }

        // ตั้ง Timeout ใหม่ (Debounce)
        searchTimeout = setTimeout(() => {
            fetchSuggestions(query, resultsContainer);
        }, DEBOUNCE_DELAY);
    });

    // ซ่อนผลลัพธ์เมื่อคลิกนอกช่องค้นหา
    document.addEventListener('click', (event) => {
        if (!searchInput.contains(event.target) && !resultsContainer.contains(event.target)) {
            resultsContainer.style.display = 'none';
        }
    });
}

/**
 * ดึงข้อมูลคำแนะนำจาก Backend (Search Suggestion)
 * @param {string} queryText - ข้อความที่ผู้ใช้กำลังพิมพ์
 * @param {HTMLElement} resultsContainer - DOM element สำหรับแสดงผลลัพธ์
 */
async function fetchSuggestions(queryText, resultsContainer) {
    try {
        const response = await fetch(`${API_SEARCH_SUGGESTION_URL}?query=${encodeURIComponent(queryText)}`);
        
        if (!response.ok) {
            // ไม่ต้องแสดง error, แค่ไม่แสดง suggestions
            resultsContainer.style.display = 'none';
            return;
        }

        // สมมติว่า Backend คืนค่าเป็น List (Array) ของสถานที่
        const suggestions = await response.json();
        
        displaySuggestions(suggestions, resultsContainer);

    } catch (error) {
        console.error("Search suggestion error:", error);
        resultsContainer.style.display = 'none';
    }
}

/**
 * แสดงรายการคำแนะนำใน UI
 * @param {Array<Object>} suggestions - รายการสถานที่ที่ได้จาก API
 * @param {HTMLElement} resultsContainer - DOM element สำหรับแสดงผลลัพธ์
 */
function displaySuggestions(suggestions, resultsContainer) {
    resultsContainer.innerHTML = '';

    if (suggestions.length === 0) {
        resultsContainer.style.display = 'none';
        return;
    }

    suggestions.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.className = 'autocomplete-item';
        
        // item ต้องมี name, latitude, longitude
        resultItem.textContent = item.name; 
        
        // เก็บข้อมูล ID/พิกัดไว้ใน Element เพื่อใช้เมื่อผู้ใช้คลิกเลือก
        resultItem.setAttribute('data-name', item.name);
        resultItem.setAttribute('data-lat', item.latitude);
        resultItem.setAttribute('data-lng', item.longitude);

        // เพิ่ม Event Listener เมื่อผู้ใช้คลิกเลือกรายการ
        resultItem.addEventListener('click', () => {
            const selectedName = resultItem.getAttribute('data-name');
            const selectedLat = parseFloat(resultItem.getAttribute('data-lat'));
            const selectedLng = parseFloat(resultItem.getAttribute('data-lng'));

            // 1. ใส่ชื่อสถานที่ลงในช่องค้นหา
            document.getElementById('search-input').value = selectedName; 
            
            // 2. ซ่อนรายการ
            resultsContainer.style.display = 'none'; 
            
            // 3. เรียกฟังก์ชันแสดงรายละเอียด/นำทาง
            // เนื่องจากเรามีพิกัดแล้ว จึงสามารถเรียก calculateAndDisplayRoute ได้ทันที
            // แต่ควรใช้ fetchAndDisplayDetails เพื่อให้แสดง Popup ข้อมูลด้วย
            
            // **ตัวเลือกที่ดีกว่า:** เรียก fetchAndDisplayDetails(selectedName)
            // เพื่อดึงข้อมูลรายละเอียดทั้งหมดมาแสดงใน Popup
            fetchAndDisplayDetails(selectedName);
        });

        resultsContainer.appendChild(resultItem);
    });

    resultsContainer.style.display = 'block';
}
// --- จบฟังก์ชันใหม่สำหรับ Autocomplete ---


// ... (ฟังก์ชัน hideAllMarkers, showAllMarkers, fetchAndDisplayDetails, calculateAndDisplayRoute, clearDirections ยังคงเหมือนเดิม) ...

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

function hideAllMarkers() {
    allMarkers.forEach(marker => {
        marker.setMap(null);
    });
}

function showAllMarkers() {
    allMarkers.forEach(marker => {
        marker.setMap(map);
    });
}

// เชิ่อมกับbackend
async function fetchAndDisplayDetails(searchTerm) {
    console.log("Detail request initiated for:", searchTerm);
    
    try {
        // 1. Fetch Data: เปลี่ยนไปเรียก Endpoint ที่มีอยู่: /api/locations
        //    และเนื่องจาก Backend ส่ง List กลับมา (แม้จะค้นหาแค่ 1 รายการ)
        // *** 📌 ใช้ query parameter 'search' เพื่อให้ backend ค้นหาด้วยชื่อเต็ม (ตรงกับที่ผู้ใช้เลือกจาก suggestion)
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
		
		// --- 5. เรียกใช้การนำทางทันที ---
		// *** ❌ ลบการเรียก calculateAndDisplayRoute(position) ที่นี่
		// เพราะถ้าค้นหาแบบ Autocomplete ผู้ใช้อาจแค่ต้องการดูข้อมูล ไม่ใช่นำทางทันที
		// calculateAndDisplayRoute(position);

        // 2. Move Map: ขยับแผนที่และซูมไปยังตำแหน่งที่ค้นพบ (เหมือนเดิม)
        map.setCenter(position);
        map.setZoom(17); 
        
        // 3. Display Popup: สร้าง Content ใหม่โดยใช้ Field ที่แก้ไขแล้ว
		
        
        const content = `
        <div class="place-popup">
            <h4>${locationDetails.name} (${shortName})</h4> 
            <p>เวลาทำการ: ${workingHours}</p> 
            
            <div class="popup-actions"> 
                <button class="bookmark-btn" data-name="${locationDetails.name}">
                    📌 บุ๊กมาร์ก
                </button>
                <a href="detail.html?shortName=${encodeURIComponent(shortName)}" class="details-btn">
                    ดูรายละเอียด 
                </a>
            </div>

            <button class="directions-btn" 
            data-lat="${locationDetails.latitude}" 
            data-lng="${locationDetails.longitude}">
            <i class="fa-solid fa-person-walking"></i> นำทาง (เดิน)
            </button>
        </div> 
        `;
		
		// *** 📌 ลบ Marker ชั่วคราวเดิมออกก่อน ***
		if (searchTempMarker) {
		    searchTempMarker.setMap(null);
		}

        // <p>สถานะความหนาแน่น: <b>${locationDetails.densityStatus || 'N/A'}</b></p>
        
        const tempMarker = new google.maps.Marker({
            position: position,
            map: map,
            title: locationDetails.name
        });
        
        // *** 📌 เก็บ Marker ใหม่เป็น Marker ชั่วคราว ***
        searchTempMarker = tempMarker;

        // เปิด Popup ที่ตำแหน่ง Marker ชั่วคราว
        infoWindow.setContent(content);
		
		

         google.maps.event.addListener(infoWindow, 'domready', () => {
            const directionsBtn = document.querySelector('.directions-btn');
            if (directionsBtn) {
            directionsBtn.onclick = () => {
            const lat = parseFloat(directionsBtn.getAttribute('data-lat'));
            const lng = parseFloat(directionsBtn.getAttribute('data-lng'));
            
            // 1. ปิด InfoWindow *ก่อน* เริ่มนำทาง
            if (infoWindow) {
                infoWindow.close();
            }
            
            // 2. ซ่อน Marker
            hideAllMarkers(); 
            tempMarker.setMap(null); // ซ่อนหมุดที่ค้นหาด้วย
            
            calculateAndDisplayRoute({ lat: lat, lng: lng });
            };
            }
            // =========================================================
            // *** 📌 NEW: เพิ่ม Listener สำหรับปุ่ม Bookmark ที่ถูกค้นหา ***
            // =========================================================
            const bookmarkBtn = infoWindow.getContent().querySelector('.bookmark-btn');
            if (bookmarkBtn) {
                bookmarkBtn.addEventListener('click', () => {
                    const placeName = bookmarkBtn.getAttribute('data-name');
                    
                    alert(`กำลังบันทึก "${placeName}"...`);

                    // **ตัวอย่างจำลองการบันทึกสำเร็จ:**
                    setTimeout(() => {
                        alert(`✅ บันทึก "${placeName}" เป็นรายการโปรดสำเร็จแล้ว! ระบบจะนำคุณไปที่หน้ารายการโปรด`);
                        
                        // เปลี่ยนข้อความปุ่ม
                        bookmarkBtn.textContent = '✅ บุ๊กมาร์กแล้ว';

                        // *** 📌 โค้ดนำทางไปยังหน้า Favorites ***
                        window.location.href = 'favorites.html';
                        
                    }, 500);
                });
            }
        });
		
		
        infoWindow.open(map, tempMarker);

        // (***สำคัญ: อาจต้องลบ Marker ชั่วคราวออกเมื่อ Popup ปิด หากคุณไม่ต้องการให้มี Marker ซ้ำซ้อน***)
        google.maps.event.addListener(infoWindow, 'closeclick', function() {
			clearDirections();
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


/**
 * คำนวณและแสดงเส้นทางจากตำแหน่งผู้ใช้ไปยังปลายทาง
 * @param {object} destination - { lat: number, lng: number }
 */
function calculateAndDisplayRoute(destination) {
    // 1. ตรวจสอบว่ามีตำแหน่งผู้ใช้หรือไม่
    if (!userLocation) {
        alert("กรุณากดปุ่ม 'ตำแหน่งของฉัน' (มุมขวา) และอนุญาตให้เข้าถึงตำแหน่งก่อน");
		showAllMarkers();
        return;
    }
	
	if (directionsRenderer) {
	        directionsRenderer.setDirections(null);
	}
	    
	// --- ซ่อน Marker ทั้งหมด (ย้ายมาไว้ที่นี่เพื่อให้แน่ใจว่าซ่อนก่อนวาด) ---
	hideAllMarkers();
	
	 // *** 📌 ซ่อน Marker ชั่วคราวที่เกิดจากการค้นหา (ถ้ามี) ***
	 if (searchTempMarker) {
	     searchTempMarker.setMap(null);
	 }


    // 3. สร้าง Request สำหรับ Directions Service
    const request = {
        origin: userLocation,        // ตำแหน่งปัจจุบันของผู้ใช้
        destination: destination,    // ตำแหน่งของสถานที่ปลายทาง
        travelMode: 'WALKING'        // เหมาะสำหรับภายในมหาวิทยาลัย
    };

    // 4. เรียกใช้งาน Directions Service
    directionsService.route(request, (result, status) => {
        if (status == 'OK') {
            // วาดเส้น Polyline ลงบนแผนที่
            directionsRenderer.setDirections(result);
            
            // ปิด InfoWindow เพื่อให้เห็นเส้นทางชัดเจน
            if (infoWindow) {
                infoWindow.close();
            }

            // แสดงข้อมูลระยะทางและเวลา
            const route = result.routes[0].legs[0];
            const infoPanel = document.getElementById('directions-panel');
            
            infoPanel.innerHTML = `
                <div>
                    <strong>ระยะทาง:</strong> ${route.distance.text}<br>
                    <strong>เวลาเดิน:</strong> ${route.duration.text}
                </div>
                <button id="clear-directions-btn" title="ลบเส้นทาง">&times;</button>
            `;
            infoPanel.style.display = 'block';

            // เพิ่ม Listener ให้ปุ่ม X (ลบเส้นทาง) ที่เพิ่งสร้าง
            document.getElementById('clear-directions-btn').addEventListener('click', clearDirections);

        } else {
            alert('ไม่สามารถค้นหาเส้นทางได้: ' + status);
			// ถ้าหาเส้นทางไม่เจอ ให้คืน Marker กลับมา
			showAllMarkers();
			// *** 📌 แสดง Marker ชั่วคราวกลับมา ***
			if (searchTempMarker) {
			    searchTempMarker.setMap(map);
			}
        }
    });
}


function clearDirections() {
    if (directionsRenderer) {
        directionsRenderer.setDirections(null); // ลบเส้นออกจากแผนที่
    }

    const infoPanel = document.getElementById('directions-panel');
    if (infoPanel) {
        infoPanel.style.display = 'none'; // ซ่อนกล่องข้อมูล
        infoPanel.innerHTML = '';
    }
	
	// ปิด InfoWindow ที่อาจจะเปิดอยู่
	if (infoWindow) {
	    infoWindow.close();
	 }

	 // ลบ Marker ชั่วคราวที่เกิดจากการค้นหา (ถ้ามี)
	 if (searchTempMarker) {
	     searchTempMarker.setMap(null);
	     searchTempMarker = null;
	  }

	   // แสดง Marker ทั้งหมดกลับคืนมา
	   showAllMarkers();
}