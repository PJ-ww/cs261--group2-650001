let map;
let userLocation = null;
let userMarker = null;
let accuracyCircle = null;
let infoWindow = null;
let directionsService;
let directionsRenderer;

// --- เก็บหมุดทั้งหมดบนแผนที่ + หมุดจากการค้นหา ---
let allMarkers = [];
let searchTempMarker = null;

// --- ตัวแปรสำหรับ Autocomplete จาก Backend ---
let searchTimeout;
const DEBOUNCE_DELAY = 300; // ms
const API_SEARCH_SUGGESTION_URL = 'http://localhost:8080/api/locations';
const API_BOOKMARK_URL = 'http://localhost:8080/api/bookmarks';

// --- ตัวแปรเก็บสถานะ Bookmark ---
let userBookmarks = new Set();

// เริ่มทำงานเมื่อ DOM โหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    setupMapControls();
    setupSearchAutocomplete();
    fetchUserBookmarks(); // <-- ⭐️ ดึง Bookmark มาเก็บไว้ตอนโหลดหน้า
});

/**
 * ⭐️ [NEW FUNCTION]
 * ดึงรายการ Bookmark ของผู้ใช้มาเก็บไว้ใน 'userBookmarks' Set
 */
async function fetchUserBookmarks() {
    try {
        const response = await fetch(API_BOOKMARK_URL, {
            method: 'GET',
            credentials: 'include' // <-- สำคัญมาก
        });

        if (response.status === 403) {
            console.log("User not logged in. Bookmarks disabled.");
            userBookmarks.clear();
            return;
        }
        if (!response.ok) {
            console.error("Failed to fetch bookmarks");
            return;
        }

        const bookmarks = await response.json();
        userBookmarks.clear();
        bookmarks.forEach(b => {
            // เก็บ ID ของสถานที่ (targetId) ไว้ใน Set
            userBookmarks.add(b.targetId);
        });
        console.log("User bookmarks loaded:", userBookmarks);

    } catch (error) {
        console.error("Error fetching user bookmarks:", error);
    }
}

/**
 * ⭐️ [NEW FUNCTION]
 * ตรวจสอบว่าสถานที่นี้ถูก Bookmark ไว้หรือยัง
 */
function isBookmarked(locationId) {
    return userBookmarks.has(locationId);
}


// ฟังก์ชันหลักที่ถูกเรียกโดย Google Maps API
async function initMap() {
    const mapOptions = {
        center: { lat: 14.072, lng: 100.603 }, // มธ. รังสิต
        zoom: 15,
        disableDefaultUI: true
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    infoWindow = new google.maps.InfoWindow();

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // ติดตามตำแหน่งผู้ใช้แบบ real-time
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

    // ดึงข้อมูลสถานที่และสร้าง markers
    try {
        const response = await fetch('http://localhost:8080/api/locations');
        if (!response.ok) {
            throw new Error(`HTTP error! สถานะ: ${response.status}`);
        }
        const locations = await response.json();

        allMarkers = [];

        // --- สร้างรายการหมวดหมู่ไม่ซ้ำ สำหรับ Filter Modal ---
        const allCategories = locations.map(loc => loc.category?.category);
        const uniqueCategories = [...new Set(allCategories)].filter(cat => cat);
        populateFilterModal(uniqueCategories);

        // สร้าง markers สำหรับทุกสถานที่
        locations.forEach(location => {
            const marker = new google.maps.Marker({
                position: { lat: location.latitude, lng: location.longitude },
                map: map,
                title: location.name
            });

            // เก็บ ID และ Category ของ marker ไว้
            marker.locationId = location.id; // ⭐️
            marker.category = location.category?.category || null;
            allMarkers.push(marker);

            marker.addListener('click', () => {
                
                // ⭐️ ตรวจสอบสถานะ Bookmark
                const isMarked = isBookmarked(location.id);
                const bookmarkButtonHtml = `
                    <button class="bookmark-btn ${isMarked ? 'bookmarked' : ''}" 
                            data-location-id="${location.id}" 
                            data-location-name="${location.name}">
                        <i class="fa-${isMarked ? 'solid' : 'regular'} fa-bookmark"></i> 
                        ${isMarked ? 'บันทึกแล้ว' : 'บันทึก'}
                    </button>
                `;

				const content = `
				  <div class="place-popup">
				      <h4>${location.name}</h4>
				      <p>
				          เวลาทำการ:
				          ${(location.openTime?.trim() && location.closeTime?.trim())
				          ? `${location.openTime} - ${location.closeTime}`
				          : 'N/A'}
				      </p>

				      <div>
				          <span class="density-badge"
				                style="background:${getDensityColor(location.densityLevel)}">
				              ${getDensityLabelTh(location.densityLevel)}
				              • ${location.densityScore ?? 0} คนใกล้เคียง
				          </span>
				      </div>
				      
				      <div class="popup-actions">
				          ${bookmarkButtonHtml}
				          
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
                // <p>สถานะความหนาแน่น: <b>${location.densityStatus || 'N/A'}</b></p>

                infoWindow.setContent(content);

                // IMPORTANT: ใช้ 'domready' และ query จาก DOM จริง (wrapper .gm-style-iw)
                google.maps.event.addListener(infoWindow, 'domready', () => {
                    // หา container ของ InfoWindow ใน DOM (Google Maps ใส่ content ลงใน .gm-style-iw)
                    // ถ้าไม่พบให้ fallback หา .place-popup ตรง ๆ
                    const iwContainer = document.querySelector('.gm-style-iw');
                    const popupEl = iwContainer ? iwContainer.querySelector('.place-popup') : document.querySelector('.place-popup');

                    // ปุ่มนำทางจาก Popup
                    const directionsBtn = popupEl ? popupEl.querySelector('.directions-btn') : document.querySelector('.directions-btn');
                    if (directionsBtn) {
                        directionsBtn.onclick = () => {
                            const lat = parseFloat(directionsBtn.getAttribute('data-lat'));
                            const lng = parseFloat(directionsBtn.getAttribute('data-lng'));

                            // ปิด popup แล้วซ่อน marker ก่อนคำนวณเส้นทาง
                            if (infoWindow) infoWindow.close();
                            hideAllMarkers();
                            marker.setMap(null);

                            calculateAndDisplayRoute({ lat, lng });
                        };
                    }

                    // ⭐️ ปุ่มบุ๊กมาร์กใน popup (หา element จริง)
                    const bookmarkBtn = popupEl ? popupEl.querySelector('.bookmark-btn') : document.querySelector('.bookmark-btn');
                    if (bookmarkBtn) {
                        // ลบ handler เก่าถ้ามี (เราเก็บ reference ใน _boundClick)
                        try {
                            if (bookmarkBtn._boundClick) {
                                bookmarkBtn.removeEventListener('click', bookmarkBtn._boundClick);
                            }
                        } catch(e) { /* ignore */ }

                        const boundHandler = (e) => {
                            const btn = e.currentTarget;
                            const locationId = parseInt(btn.getAttribute('data-location-id'));
                            const locationName = btn.getAttribute('data-location-name');
                            handleBookmarkClick(btn, locationId, locationName);
                        };
                        // เก็บ reference เพื่อให้สามารถลบ event ได้ในอนาคต
                        bookmarkBtn._boundClick = boundHandler;
                        bookmarkBtn.addEventListener('click', boundHandler);
                    }
                });

                infoWindow.open(map, marker);
            });
        });

    } catch (error) {
        console.error('Error fetching locations:', error);
        populateFilterModal([]); // แสดง "ไม่พบหมวดหมู่"
    }

    // ---------------------------------
    // ✅ [โค้ดส่วนที่เพิ่ม]
    // ---------------------------------
    // ตรวจสอบ query parameter 'search' ตอนโหลดหน้า
    const urlParams = new URLSearchParams(window.location.search);
    const searchTermFromUrl = urlParams.get('search');

    if (searchTermFromUrl) {
        const decodedTerm = decodeURIComponent(searchTermFromUrl);
        console.log("พบคำค้นหาจาก URL:", decodedTerm);
        
        // ใส่คำค้นหาลงในช่อง search
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = decodedTerm;
        }
        
        // เรียกฟังก์ชันค้นหาและปักหมุด
        fetchAndDisplayDetails(decodedTerm);
    }
    // ---------------------------------
    // ✅ [จบส่วนที่เพิ่ม]
    // ---------------------------------
}

/**
 * ⭐️ [NEW FUNCTION]
 * จัดการการคลิกปุ่ม Bookmark ใน Popup
 */
async function handleBookmarkClick(buttonElement, locationId, locationName) {
    const isCurrentlyBookmarked = isBookmarked(locationId);
    const method = isCurrentlyBookmarked ? 'DELETE' : 'POST';
    const url = isCurrentlyBookmarked 
        ? `${API_BOOKMARK_URL}?targetId=${locationId}&targetType=LOCATION` 
        : API_BOOKMARK_URL;

    const body = isCurrentlyBookmarked ? null : JSON.stringify({
        targetId: locationId,
        targetType: "LOCATION"
    });

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: body,
            credentials: 'include' // <-- สำคัญมาก
        });

        if (response.status === 403) {
            alert("กรุณาเข้าสู่ระบบก่อนบันทึกรายการโปรด");
            // ⛔️ [แก้ไข] ลบบรรทัด redirect ออก
            return;
        }

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "เกิดข้อผิดพลาด");
        }

        // อัปเดต UI และสถานะใน Set
        if (isCurrentlyBookmarked) {
            userBookmarks.delete(locationId);
            buttonElement.classList.remove('bookmarked');
            buttonElement.innerHTML = `<i class="fa-regular fa-bookmark"></i> บันทึก`;
        } else {
            userBookmarks.add(locationId);
            buttonElement.classList.add('bookmarked');
            buttonElement.innerHTML = `<i class="fa-solid fa-bookmark"></i> บันทึกแล้ว`;
        }
        
        // ✅ เปิดการแจ้งเตือน
        alert(isCurrentlyBookmarked ? 'ลบออกจากรายการโปรดแล้ว' : 'บันทึกในรายการโปรดแล้ว');

    } catch (error) {
        console.error("Bookmark action failed:", error);
        alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
}


/* ---------------------------
   ตำแหน่งผู้ใช้ & Accuracy
---------------------------- */
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

/* ---------------------------
   Map Controls (ปุ่มบนแผนที่)
---------------------------- */
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

    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.getElementById('search-input');

    // ค้นหาเมื่อกด Enter
    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    fetchAndDisplayDetails(searchTerm);
                    const resultsContainer = document.getElementById('autocomplete-results');
                    if (resultsContainer) resultsContainer.style.display = 'none';
                }
            }
        });
    }

    // ค้นหาเมื่อกดปุ่ม search
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                fetchAndDisplayDetails(searchTerm);
            } else {
                alert("กรุณาป้อนชื่อสถานที่ หรือเลือกจากคำแนะนำการค้นหา");
            }
        });
    }

    // -------- Filter Modal controls --------
    const filterBtn = document.querySelector('.filter-btn');
    const filterModal = document.getElementById('filter-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const applyFilterBtn = document.getElementById('apply-filter-btn');

    if (filterBtn && filterModal) {
        filterBtn.addEventListener('click', () => {
            filterModal.classList.add('show');
        });
    }
    if (closeModalBtn && filterModal) {
        closeModalBtn.addEventListener('click', () => {
            filterModal.classList.remove('show');
        });
    }
    if (filterModal) {
        filterModal.addEventListener('click', (event) => {
            if (event.target === filterModal) {
                filterModal.classList.remove('show');
            }
        });
    }
    if (applyFilterBtn && filterModal) {
        applyFilterBtn.addEventListener('click', () => {
            const selectedCheckboxes = document.querySelectorAll('#filter-categories-list input[name="category"]:checked');
            const selectedCategories = [];
            selectedCheckboxes.forEach(checkbox => selectedCategories.push(checkbox.value));
            applyCategoryFilters(selectedCategories);
            filterModal.classList.remove('show');
        });
    }
}

/* ---------------------------
   Autocomplete จาก Backend
---------------------------- */
function setupSearchAutocomplete() {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('autocomplete-results');

    if (!searchInput || !resultsContainer) {
        console.warn("ไม่พบองค์ประกอบค้นหาหรือ Autocomplete results ใน DOM");
        return;
    }

    searchInput.addEventListener('input', (event) => {
        const query = event.target.value.trim();

        clearTimeout(searchTimeout);

        if (query.length < 2) {
            resultsContainer.style.display = 'none';
            return;
        }

        searchTimeout = setTimeout(() => {
            fetchSuggestions(query, resultsContainer);
        }, DEBOUNCE_DELAY);
    });

    document.addEventListener('click', (event) => {
        if (!searchInput.contains(event.target) && !resultsContainer.contains(event.target)) {
            resultsContainer.style.display = 'none';
        }
    });
}

async function fetchSuggestions(queryText, resultsContainer) {
    try {
        const url = `${API_SEARCH_SUGGESTION_URL}?search=${encodeURIComponent(queryText)}`;
        const response = await fetch(url);

        if (!response.ok) {
            resultsContainer.style.display = 'none';
            return;
        }

        const suggestions = await response.json();
        displaySuggestions(suggestions, resultsContainer);

    } catch (error) {
        console.error("Search suggestion error:", error);
        resultsContainer.style.display = 'none';
    }
}

function displaySuggestions(suggestions, resultsContainer) {
    resultsContainer.innerHTML = '';

    if (!suggestions || suggestions.length === 0) {
        resultsContainer.style.display = 'none';
        return;
    }

    suggestions.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.className = 'autocomplete-item';

        resultItem.textContent = item.name;
        resultItem.setAttribute('data-name', item.name);
        resultItem.setAttribute('data-lat', item.latitude);
        resultItem.setAttribute('data-lng', item.longitude);

        resultItem.addEventListener('click', () => {
            const selectedName = resultItem.getAttribute('data-name');
            document.getElementById('search-input').value = selectedName;
            resultsContainer.style.display = 'none';
            fetchAndDisplayDetails(selectedName);
        });

        resultsContainer.appendChild(resultItem);
    });

    resultsContainer.style.display = 'block';
}

/* ---------------------------
   ซ่อน/แสดง markers ทั้งหมด
---------------------------- */
function hideAllMarkers() {
    allMarkers.forEach(marker => marker.setMap(null));
}

function showAllMarkers() {
    allMarkers.forEach(marker => marker.setMap(map));
}

/* ---------------------------
   ดึงรายละเอียดสถานที่ & Popup
---------------------------- */
async function fetchAndDisplayDetails(searchTerm) {
    console.log("Detail request initiated for:", searchTerm);

    try {
        const response = await fetch(`http://localhost:8080/api/locations?search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            alert(`ไม่พบสถานที่ '${searchTerm}' ในระบบของเรา`);
            return;
        }

        const locationList = await response.json();
        if (!locationList || locationList.length === 0) {
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

        const position = {
            lat: locationDetails.latitude,
            lng: locationDetails.longitude
        };

        // ย้าย map ไปที่ตำแหน่งที่ค้นพบ
        map.setCenter(position);
        map.setZoom(17);

        // ⭐️ ตรวจสอบสถานะ Bookmark
        const isMarked = isBookmarked(locationDetails.id);
        const bookmarkButtonHtml = `
            <button class="bookmark-btn ${isMarked ? 'bookmarked' : ''}" 
                    data-location-id="${locationDetails.id}" 
                    data-location-name="${locationDetails.name}">
                <i class="fa-${isMarked ? 'solid' : 'regular'} fa-bookmark"></i> 
                ${isMarked ? 'บันทึกแล้ว' : 'บันทึก'}
            </button>
        `;

		const content = `
		<div class="place-popup">
		    <h4>${locationDetails.name}</h4>
		    <p>เวลาทำการ: ${workingHours}</p>

		    <div>
		        <span class="density-badge"
		              style="background:${getDensityColor(locationDetails.densityLevel)}">
		            ${getDensityLabelTh(locationDetails.densityLevel)}
		            • ${locationDetails.densityScore ?? 0} คนใกล้เคียง
		        </span>
		    </div>

		    <div class="popup-actions">
		        ${bookmarkButtonHtml}
		        
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

        // ลบหมุดค้นหาเก่าถ้ามี
        if (searchTempMarker) {
            searchTempMarker.setMap(null);
        }

        const tempMarker = new google.maps.Marker({
            position: position,
            map: map,
            title: locationDetails.name
        });

        searchTempMarker = tempMarker;

        infoWindow.setContent(content);

        // Note: ใช้ domready และ query จาก DOM จริง (เหมือนใน initMap)
        google.maps.event.addListener(infoWindow, 'domready', () => {
            const iwContainer = document.querySelector('.gm-style-iw');
            const popupEl = iwContainer ? iwContainer.querySelector('.place-popup') : document.querySelector('.place-popup');

            const directionsBtn = popupEl ? popupEl.querySelector('.directions-btn') : document.querySelector('.directions-btn');
            if (directionsBtn) {
                directionsBtn.onclick = () => {
                    const lat = parseFloat(directionsBtn.getAttribute('data-lat'));
                    const lng = parseFloat(directionsBtn.getAttribute('data-lng'));

                    if (infoWindow) infoWindow.close();
                    hideAllMarkers();
                    tempMarker.setMap(null);

                    calculateAndDisplayRoute({ lat, lng });
                };
            }

            // ปุ่มบุ๊กมาร์ก ในกรณีค้นหา (ใช้ popupEl)
            const bookmarkBtn = popupEl ? popupEl.querySelector('.bookmark-btn') : document.querySelector('.bookmark-btn');
            if (bookmarkBtn) {
                try {
                    if (bookmarkBtn._boundClick) {
                        bookmarkBtn.removeEventListener('click', bookmarkBtn._boundClick);
                    }
                } catch(e) { /* ignore */ }

                const boundHandler = (e) => {
                    const btn = e.currentTarget;
                    const locationId = parseInt(btn.getAttribute('data-location-id'));
                    const locationName = btn.getAttribute('data-location-name');
                    handleBookmarkClick(btn, locationId, locationName);
                };
                bookmarkBtn._boundClick = boundHandler;
                bookmarkBtn.addEventListener('click', boundHandler);
            }
        });

        infoWindow.open(map, tempMarker);

        google.maps.event.addListener(infoWindow, 'closeclick', function() {
            clearDirections();
        });

    } catch (error) {
        console.error('Error in fetching and displaying details:', error);
        let errorMessage = "เกิดข้อผิดพลาดในการดึงข้อมูลสถานที่ กรุณาลองใหม่อีกครั้ง";

        if (error instanceof TypeError && error.message.includes('fetch')) {
            errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Backend ได้ (ตรวจสอบว่า Server เปิดอยู่หรือไม่)";
        }
        alert(errorMessage);
    }
}

/* ---------------------------
   เส้นทางเดิน (Directions)
---------------------------- */
function calculateAndDisplayRoute(destination) {
    if (!userLocation) {
        alert("กรุณากดปุ่ม 'ตำแหน่งของฉัน' (มุมขวา) และอนุญาตให้เข้าถึงตำแหน่งก่อน");
        showAllMarkers();
        return;
    }

    if (directionsRenderer) {
        directionsRenderer.setDirections(null);
    }

    hideAllMarkers();
    if (searchTempMarker) {
        searchTempMarker.setMap(null);
    }

    const request = {
        origin: userLocation,
        destination: destination,
        travelMode: 'WALKING'
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            if (infoWindow) infoWindow.close();

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

            document.getElementById('clear-directions-btn').addEventListener('click', clearDirections);
        } else {
            alert('ไม่สามารถค้นหาเส้นทางได้: ' + status);
            showAllMarkers();
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

    if (infoWindow) {
        infoWindow.close();
    }

    if (searchTempMarker) {
        searchTempMarker.setMap(null);
        searchTempMarker = null;
    }

    // ⭐️ โหลด bookmark ใหม่ทุกครั้งที่เคลียร์เส้นทาง
    // เพื่อให้แน่ใจว่าสถานะ popup ถูกต้อง
    fetchUserBookmarks().then(() => {
        showAllMarkers();
    });
}

/* ---------------------------
   Filter Modal / Checkbox
---------------------------- */
function populateFilterModal(categories) {
    const modalBody = document.getElementById('filter-categories-list');
    if (!modalBody) return;

    modalBody.innerHTML = '';

    categories.forEach(category => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" name="category" value="${category}">
            <span>${category}</span>
        `;
        modalBody.appendChild(label);
    });

    if (categories.length === 0) {
        modalBody.innerHTML = '<p>ไม่พบหมวดหมู่ให้เลือก</p>';
    }
}

function applyCategoryFilters(selectedCategories) {
    // ถ้าไม่มีการเลือกอะไรเลย (หรือกด "ทั้งหมด") ให้แสดงทั้งหมด
    if (!selectedCategories || selectedCategories.length === 0 || selectedCategories.includes("All")) {
        allMarkers.forEach(marker => marker.setMap(map));
        return;
    }
    
    // ซ่อน/แสดง ตาม category ที่เลือก
    allMarkers.forEach(marker => {
        if (selectedCategories.includes(marker.category)) {
            marker.setMap(map);
        } else {
            marker.setMap(null);
        }
    });
}

// ===========================
// Config เบื้องต้น
// ===========================

const LOCATION_API_BASE = "/api";
const LOCATION_UPDATE_ENDPOINT = `${LOCATION_API_BASE}/user/location`;

// ปรับค่าพวกนี้ได้ตาม DoD
const MIN_INTERVAL_MS = 15_000;        // ส่งไม่ถี่เกิน 1 ครั้งต่อ 15 วิ
const MIN_DISTANCE_METERS = 30;        // ต้องขยับเกิน 30 เมตรค่อยส่งใหม่
const MAX_RETRY_ATTEMPTS = 3;          // ส่งไม่สำเร็จ retry สูงสุด 3 ครั้ง

// ===========================
// Utils
// ===========================

// Haversine distance (เมตร)
function distanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// ดึง userId จาก localStorage (ปรับให้ตรงกับโปรเจกต์จริง)
function getCurrentUserId() {
  // TODO: ถ้าโปรเจกต์เธอเก็บ key อื่น เช่น "user.id" ให้เปลี่ยนตรงนี้
  const raw = localStorage.getItem("userId");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

// สำหรับ log analytics / debug
function logAnalytics(eventName, payload = {}) {
  console.log("[LocationAnalytics]", eventName, payload);
  // ถ้าทีมมี endpoint สำหรับ analytics ก็เรียก fetch จากตรงนี้ได้
}

// ===========================
// Consent Manager (U8.6)
// ===========================

const LocationConsentManager = (function () {
  const STORAGE_KEY = "locationConsent";  // "granted" | "denied"

  function getStoredConsent() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function setStoredConsent(value) {
    localStorage.setItem(STORAGE_KEY, value);
  }

  async function getBrowserPermissionState() {
    if (!navigator.permissions || !navigator.permissions.query) {
      return null; // browser ไม่รองรับ Permissions API
    }
    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      return result.state; // "granted" | "denied" | "prompt"
    } catch (e) {
      return null;
    }
  }

  function showBanner() {
    const banner = document.getElementById("location-consent-banner");
    if (banner) {
      banner.classList.remove("hidden");
      logAnalytics("consent_shown");
    }
  }

  function hideBanner() {
    const banner = document.getElementById("location-consent-banner");
    if (banner) {
      banner.classList.add("hidden");
    }
  }

  function initBannerHandlers(onGranted, onDenied) {
    const allowBtn = document.getElementById("btn-consent-allow");
    const denyBtn = document.getElementById("btn-consent-deny");

    if (allowBtn) {
      allowBtn.addEventListener("click", async () => {
        hideBanner();
        setStoredConsent("granted");
        logAnalytics("consent_granted", { source: "banner" });
        onGranted && onGranted();
      });
    }

    if (denyBtn) {
      denyBtn.addEventListener("click", () => {
        hideBanner();
        setStoredConsent("denied");
        logAnalytics("consent_denied", { source: "banner" });
        onDenied && onDenied();
      });
    }
  }

  async function init(onGranted, onDenied) {
    initBannerHandlers(onGranted, onDenied);

    const stored = getStoredConsent();
    const browserState = await getBrowserPermissionState();

    // ถ้าผู้ใช้เคยอนุญาตไปแล้ว + browser ก็บอก granted
    if (stored === "granted" || browserState === "granted") {
      logAnalytics("consent_already_granted", { stored, browserState });
      onGranted && onGranted();
      return;
    }

    // ถ้าเคยปฏิเสธไว้
    if (stored === "denied" || browserState === "denied") {
      logAnalytics("consent_already_denied", { stored, browserState });
      onDenied && onDenied();
      return;
    }

    // ยังไม่เคย ตรงตามเคส "prompt"
    showBanner();
  }

  return {
    init,
    showBanner,
    hideBanner,
  };
})();

// ===========================
// Location Tracker (U8.7)
// ===========================

const LocationTracker = (function () {
  let watchId = null;
  let lastSentTime = 0;
  let lastSentLat = null;
  let lastSentLng = null;

  function canSendNow(lat, lng) {
    const now = Date.now();

    // ยังไม่เคยส่งเลย
    if (lastSentLat === null || lastSentLng === null) return true;

    const timeDiff = now - lastSentTime;
    if (timeDiff < MIN_INTERVAL_MS) return false;

    const dist = distanceInMeters(lastSentLat, lastSentLng, lat, lng);
    if (dist < MIN_DISTANCE_METERS) return false;

    return true;
  }

  async function sendLocation(lat, lng, attempt = 1) {
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn("[LocationTracker] ไม่มี userId ใน localStorage, ไม่ส่งตำแหน่ง");
      return;
    }

    try {
      const res = await fetch(LOCATION_UPDATE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          latitude: lat,
          longitude: lng,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      lastSentTime = Date.now();
      lastSentLat = lat;
      lastSentLng = lng;

      logAnalytics("location_sent_success", { lat, lng });
    } catch (err) {
      console.error("[LocationTracker] ส่งตำแหน่งไม่สำเร็จ", err);

      if (attempt < MAX_RETRY_ATTEMPTS) {
        const delay = Math.pow(2, attempt) * 1000; // exponential backoff
        logAnalytics("location_send_retry", { attempt, delay });
        setTimeout(() => sendLocation(lat, lng, attempt + 1), delay);
      } else {
        logAnalytics("location_send_failed", { lat, lng, attempt });
      }
    }
  }

  function startTracking() {
    if (!("geolocation" in navigator)) {
      console.warn("[LocationTracker] Browser ไม่รองรับ geolocation");
      return;
    }

    if (watchId !== null) {
      // tracking อยู่แล้ว
      return;
    }

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        logAnalytics("location_observed", { lat, lng });

        if (canSendNow(lat, lng)) {
          sendLocation(lat, lng);
        }
      },
      (err) => {
        console.error("[LocationTracker] error จาก geolocation", err);
        logAnalytics("geolocation_error", { code: err.code, message: err.message });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    logAnalytics("tracking_started");
  }

  function stopTracking() {
    if (watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      logAnalytics("tracking_stopped");
    }
  }

  return {
    startTracking,
    stopTracking,
  };
})();

// ===========================
// Entry point: เรียกจากหน้า map เมื่อโหลดเสร็จ
// ===========================

document.addEventListener("DOMContentLoaded", async () => {
  // ถ้าไม่ได้อยู่หน้า map ให้ skip ได้ (เช่น เช็ค element บางตัว)
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  await LocationConsentManager.init(
    () => {
      // onGranted
      LocationTracker.startTracking();
    },
    () => {
      // onDenied
      LocationTracker.stopTracking();
    }
  );
});

function getDensityColor(level) {
    switch ((level || "").toUpperCase()) {
        case "HIGH":   return "#c62828"; // แดง
        case "MEDIUM": return "#f9a825"; // เหลือง
        case "LOW":    return "#2e7d32"; // เขียว
        default:       return "#9e9e9e"; // เทา = unknown
    }
}

function getDensityLabelTh(level) {
    switch ((level || "").toUpperCase()) {
        case "HIGH":   return "หนาแน่นมาก";
        case "MEDIUM": return "หนาแน่นปานกลาง";
        case "LOW":    return "คนน้อย";
        default:       return "ไม่ทราบ";
    }
}

