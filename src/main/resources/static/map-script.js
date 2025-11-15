let map;
let allMarkers = []; // 1. สร้างที่เก็บหมุดทั้งหมด
let userLocation = null;
let userMarker = null;
let accuracyCircle = null;
let infoWindow = null;
let directionsService;
let directionsRenderer;


document.addEventListener('DOMContentLoaded', function() {
    setupMapControls(); 
});

async function initMap() {
    const mapOptions = {
        center: { lat: 14.072, lng: 100.603 }, 
        zoom: 15,
        disableDefaultUI: true 
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    infoWindow = new google.maps.InfoWindow();
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map); 

    // ติดตามตำแหน่งผู้ใช้
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

    // Autocomplete Search
    const searchInput = document.getElementById('search-input');
    const autocomplete = new google.maps.places.Autocomplete(searchInput);
    autocomplete.bindTo('bounds', map);
    const searchMarker = new google.maps.Marker({ map: map, anchorPoint: new google.maps.Point(0, -29) });

    autocomplete.addListener('place_changed', () => {
        searchMarker.setVisible(false);
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) { return; }
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
            
        allMarkers = []; // 2. ล้างหมุดเก่า

        // 👈 [แก้ไข] 3. ดึงหมวดหมู่ (category) ที่ไม่ซ้ำกันจาก Backend
        // ❗❗❗ [จุดที่ 1: เปลี่ยน .name เป็น .category]
        // (loc.category?.category หมายถึง: 
        //  เข้าไปใน object 'category' แล้วดึง field 'category' ออกมา)
        const allCategories = locations.map(loc => loc.category?.category); 
        const uniqueCategories = [...new Set(allCategories)].filter(cat => cat); 
        
        console.log("หมวดหมู่ที่มีใน Backend:", uniqueCategories);
        
        // 4. เรียกฟังก์ชันเพื่อสร้าง Checkbox ใน Modal
        populateFilterModal(uniqueCategories);


        locations.forEach(location => {
            const marker = new google.maps.Marker({
                position: { lat: location.latitude, lng: location.longitude }, 
                map: map,
                title: location.name 
            });

            // 👈 [แก้ไข] 5. เก็บหมวดหมู่ (Category) และเก็บหมุดไว้ใน Array
            // ❗❗❗ [จุดที่ 2: เปลี่ยน .name เป็น .category]
            marker.category = location.category?.category; 
            allMarkers.push(marker); 

            marker.addListener('click', () => {
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
                        <button class="bookmark-btn" data-name="${location.name}">📌 บุ๊กมาร์ก</button>
                        <a href="detail.html?shortName=${encodeURIComponent(location.name)}" class="details-btn">ดูรายละเอียด</a>
                    </div>
                    <button class="directions-btn" data-lat="${location.latitude}" data-lng="${location.longitude}">
                        <i class="fa-solid fa-person-walking"></i> นำทาง (เดิน)
                    </button>
                </div>`;
    
                infoWindow.setContent(content);

                google.maps.event.addListener(infoWindow, 'domready', () => {
                    const directionsBtn = document.querySelector('.directions-btn');
                    if (directionsBtn) {
                      directionsBtn.onclick = () => {
                          const lat = parseFloat(directionsBtn.getAttribute('data-lat'));
                          const lng = parseFloat(directionsBtn.getAttribute('data-lng'));
                          calculateAndDisplayRoute({ lat: lat, lng: lng });
                      };
                    }
                    
                    const bookmarkBtn = infoWindow.getContent().querySelector('.bookmark-btn');
                    if (bookmarkBtn) {
                        bookmarkBtn.addEventListener('click', () => {
                            const placeName = bookmarkBtn.getAttribute('data-name');
                            alert(`กำลังเพิ่ม "${placeName}" เข้าสู่รายการบุ๊กมาร์ก!`);
                            bookmarkBtn.textContent = '✅ บุ๊กมาร์กแล้ว';
                        });
                    }
                });

                infoWindow.open(map, marker);
            }); // <-- ปีกกาปิดของ marker.addListener 
        }); // <-- ปีกกาปิดของ locations.forEach

            
        // 6. โค้ดสำหรับ Filter Chips (ปุ่มด้านบน)
        const allChips = document.querySelectorAll('.chip');
        allChips.forEach(chip => {
            chip.addEventListener('click', () => {
                if (document.querySelector('.chip.active')) {
                    document.querySelector('.chip.active').classList.remove('active');
                }
                chip.classList.add('active');
                
                const categoryName = chip.textContent.trim().replace(/^[^\w\s]+/, '').trim();
                console.log("Chip กรองหมวดหมู่:", categoryName); 

                applyCategoryFilters([categoryName]);
            });
        });
    
    } catch (error) {
        console.error('Error fetching locations:', error);
        // ถ้าการดึงข้อมูลล้มเหลว ให้บอกผู้ใช้
        populateFilterModal([]); // เรียกฟังก์ชันให้แสดง "ไม่พบหมวดหมู่"
    }
} // <-- ปีกกาปิดของ initMap()


function updateUserLocationMarker(location, accuracy) {
    if (!userMarker) {
        userMarker = new google.maps.Marker({
            position: location,
            map: map,
            title: "ตำแหน่งของคุณ",
            icon: {
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
        userMarker.setPosition(location);
        accuracyCircle.setCenter(location);
        accuracyCircle.setRadius(accuracy);
    }
}

function setupMapControls() {
    const myLocationBtn = document.getElementById('my-location-btn');
    if (myLocationBtn) { 
        myLocationBtn.addEventListener('click', () => {
            if (userLocation) {
                map.setCenter(userLocation);
                map.setZoom(17);
            } else {
                alert("ยังไม่สามารถหาตำแหน่งของคุณได้, กรุณาอนุญาตให้เข้าถึงตำแหน่ง");
            }
        });
    }
    
    const searchBtn = document.querySelector('.search-btn'); // (ปุ่มแว่นขยายอันเก่า)
    const searchInput = document.getElementById('search-input');

    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                const searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    fetchAndDisplayDetails(searchTerm); 
                }
            }
        });
    }
    if (searchBtn) { 
        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                fetchAndDisplayDetails(searchTerm); 
            }
        });
    }

    // 7. โค้ดสำหรับเปิด/ปิด Filter Modal
    const filterBtn = document.querySelector('.filter-btn');
    const filterModal = document.getElementById('filter-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const applyFilterBtn = document.getElementById('apply-filter-btn');

    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            console.log("เปิด Filter Modal");
            filterModal.classList.add('show');
        });
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            filterModal.classList.remove('show');
        });
    }
    if (filterModal) {
        filterModal.addEventListener('click', (event) => {
            if (event.target === filterModal) { // คลิกที่พื้นหลังเทา
                filterModal.classList.remove('show');
            }
        });
    }

    // 8. เพิ่ม Logic ให้ปุ่ม "ตกลง" ใน Modal
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', () => {
            
            // 1. หา Checkbox ที่ถูกติ๊กทั้งหมด
            const selectedCheckboxes = document.querySelectorAll('#filter-categories-list input[name="category"]:checked');
            
            // 2. ดึง "value" (ชื่อหมวดหมู่) ออกมา
            const selectedCategories = [];
            selectedCheckboxes.forEach(checkbox => {
                selectedCategories.push(checkbox.value);
            });

            // 3. เรียกฟังก์ชันฟิลเตอร์ใหม่
            applyCategoryFilters(selectedCategories); 
            
            // 4. ปิด Modal
            filterModal.classList.remove('show');
        });
    }
} // <-- ปีกกาปิดของ setupMapControls


async function fetchAndDisplayDetails(searchTerm) {
    console.log("Detail request initiated for:", searchTerm);
    try {
        const response = await fetch(`http://localhost:8080/api/locations?search=${searchTerm}`); 
        if (!response.ok) {
            alert(`ไม่พบสถานที่ '${searchTerm}' ในระบบของเรา`);
            return;
        }
        const locationList = await response.json(); 
        if (locationList.length === 0) {
            alert(`ไม่พบสถานที่ '${searchTerm}' ในระบบของเรา`);
            return;
        }
        const locationDetails = locationList[0]; 
        const workingHours = (locationDetails.openTime && locationDetails.closeTime)
            ? `${locationDetails.openTime} - ${locationDetails.closeTime}`
            : 'N/A';
        const shortName = locationDetails.name; 
        if (!locationDetails.latitude || !locationDetails.longitude) {
            console.error("ข้อมูลสถานที่ไม่มีพิกัด Lat/Lng ที่ถูกต้อง");
            return;
        }
        const position = { lat: locationDetails.latitude, lng: locationDetails.longitude };
        map.setCenter(position);
        map.setZoom(17); 
        const content = `
        <div class="place-popup">
            <h4>${locationDetails.name} (${shortName})</h4> 
            <p>เวลาทำการ: ${workingHours}</p> 
            <a href="detail.html?shortName=${encodeURIComponent(shortName)}" class="details-btn">ดูรายละเอียด</a>
            <button class="directions-btn" data-lat="${locationDetails.latitude}" data-lng="${locationDetails.longitude}">
                <i class="fa-solid fa-person-walking"></i> นำทาง (เดิน)
            </button>
        </div>`;
        const tempMarker = new google.maps.Marker({
            position: position, map: map, title: locationDetails.name
        });
        infoWindow.setContent(content);
        google.maps.event.addListener(infoWindow, 'domready', () => {
            const directionsBtn = document.querySelector('.directions-btn');
            if (directionsBtn) {
                directionsBtn.onclick = () => {
                    const lat = parseFloat(directionsBtn.getAttribute('data-lat'));
                    const lng = parseFloat(directionsBtn.getAttribute('data-lng'));
                    calculateAndDisplayRoute({ lat: lat, lng: lng });
                };
            }
        });
        infoWindow.open(map, tempMarker);
        google.maps.event.addListener(infoWindow, 'closeclick', function() {
            tempMarker.setMap(null); 
        });
    } catch (error) {
        console.error('Error in fetching and displaying details:', error);
        alert("เกิดข้อผิดพลาดในการดึงข้อมูลสถานที่");
    }
}

function calculateAndDisplayRoute(destination) {
    if (!userLocation) {
        alert("กรุณากดปุ่ม 'ตำแหน่งของฉัน' และอนุญาตให้เข้าถึงตำแหน่งก่อน");
        return;
    }
    clearDirections();
    const request = {
        origin: userLocation,
        destination: destination,
        travelMode: 'WALKING'
    };
    directionsService.route(request, (result, status) => {
        if (status == 'OK') {
            directionsRenderer.setDirections(result);
            if (infoWindow) { infoWindow.close(); }
            const route = result.routes[0].legs[0];
            const infoPanel = document.getElementById('directions-panel');
content:             infoPanel.innerHTML = `
                <div>
                    <strong>ระยะทาง:</strong> ${route.distance.text}<br>
                    <strong>เวลาเดิน:</strong> ${route.duration.text}
                </div>
                <button id="clear-directions-btn" title="ลบเส้นทาง">&times;</button>
            `;
            infoPanel.style.display = 'block';
            document.getElementById('clear-directions-btn').addEventListener('click', clearDirections);
        } else {
            alert('ไม่สามารถค้นหาเส้นทางได้: ' + status);
        }
    });
}

function clearDirections() {
    if (directionsRenderer) {
        directionsRenderer.setDirections(null); 
    }
    const infoPanel = document.getElementById('directions-panel');
    if (infoPanel) {
        infoPanel.style.display = 'none'; 
        infoPanel.innerHTML = '';
    }
}


// 8. ฟังก์ชันสำหรับสร้าง Checkbox ใน Modal
function populateFilterModal(categories) {
    const modalBody = document.getElementById('filter-categories-list');
    
    modalBody.innerHTML = ''; // เคลียร์ "กำลังโหลด..."

    categories.forEach(category => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" name="category" value="${category}">
            <span>${category}</span> 
        `;
        modalBody.appendChild(label);
    });

    // ถ้าไม่มีหมวดหมู่เลย
    if (categories.length === 0) {
        modalBody.innerHTML = '<p>ไม่พบหมวดหมู่ให้เลือก</p>';
    }
}


// 9. ฟังก์ชันฟิลเตอร์ใหม่ (รับเป็น Array)
function applyCategoryFilters(selectedCategories) {
    
    // ถ้าไม่ได้เลือกอะไรเลย (Array ว่าง) = ให้แสดงทั้งหมด
    if (selectedCategories.length === 0) {
        console.log("ไม่ได้เลือกหมวดหมู่, แสดงหมุดทั้งหมด");
        allMarkers.forEach(marker => marker.setMap(map));
        return;
    }

    console.log("กำลังกรองหมุดให้เหลือ:", selectedCategories);

    allMarkers.forEach(marker => {
        // "ถ้าหมวดหมู่ของหมุดนี้ (marker.category) 
        //  มีอยู่ในลิสต์ที่เลือก (selectedCategories)"
        if (selectedCategories.includes(marker.category)) {
            marker.setMap(map); // แสดง
        } else {
            marker.setMap(null); // ซ่อน
        }
    });
}