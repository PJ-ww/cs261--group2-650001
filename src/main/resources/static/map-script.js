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
            window.location.href = '/login.html';
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
        
        // alert(isCurrentlyBookmarked ? 'ลบออกจากรายการโปรดแล้ว' : 'บันทึกในรายการโปรดแล้ว');

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
