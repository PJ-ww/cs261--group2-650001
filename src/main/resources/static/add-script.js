// Declare map and marker variables in a higher scope
let map;
let marker = null;

// This function will be called by the Google Maps API script
function initAddMap() {
    const initialCenter = { lat: 14.0724, lng: 100.6021 }; 

    map = new google.maps.Map(document.getElementById("map-add-page"), {
        zoom: 15,
        center: initialCenter,
        disableDefaultUI: true,
    });

    map.addListener('click', (event) => {
        const coords = event.latLng;
        document.getElementById('latitude').value = coords.lat().toFixed(6);
        document.getElementById('longitude').value = coords.lng().toFixed(6);
        if (marker === null) {
            marker = new google.maps.Marker({ position: coords, map: map });
        } else {
            marker.setPosition(coords);
        }
    });

    document.dispatchEvent(new Event('mapReady'));
}


document.addEventListener('DOMContentLoaded', function() {
    // --- Initialize Flatpickr ---
    flatpickr(".time-picker", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true
    });

    // ===== START: NEW CODE TO POPULATE CATEGORIES =====
    function populateCategoryDropdown() {
        const categorySelect = document.getElementById('category');
        const categories = JSON.parse(localStorage.getItem('categories')) || [];

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
    populateCategoryDropdown(); // Call the function to fill the dropdown
    // ===== END: NEW CODE =====


    const form = document.getElementById('locationForm');
    const pageTitle = document.getElementById('page-title');
    const formTitle = document.getElementById('form-title');
    
    const urlParams = new URLSearchParams(window.location.search);
    const locationIdToEdit = urlParams.get('edit');
    
    let isEditMode = false;
    let locations = JSON.parse(localStorage.getItem('locations')) || [];

    function checkEditMode() {
        if (locationIdToEdit) {
            isEditMode = true;
            const locationToEdit = locations.find(loc => loc.id == locationIdToEdit);

            if (locationToEdit) {
                // Populate form fields...
                pageTitle.textContent = 'Edit Location';
                formTitle.textContent = 'แก้ไขสถานที่';
                document.querySelector('.btn-save').textContent = 'อัปเดต';
                document.getElementById('location-name').value = locationToEdit.name;
                document.getElementById('category').value = locationToEdit.category; // This will now select the correct dynamic option
                document.getElementById('description').value = locationToEdit.description;
                document.getElementById('open-time')._flatpickr.setDate(locationToEdit.opentime);
                document.getElementById('close-time')._flatpickr.setDate(locationToEdit.closetime);
                document.getElementById('latitude').value = locationToEdit.latitude;
                document.getElementById('longitude').value = locationToEdit.longitude;
                
                const existingLatLng = {
                    lat: parseFloat(locationToEdit.latitude),
                    lng: parseFloat(locationToEdit.longitude)
                };

                if (map) { 
                    map.setCenter(existingLatLng);
                    marker = new google.maps.Marker({
                        position: existingLatLng,
                        map: map
                    });
                }
            }
        }
    }
    
    if (typeof google !== 'undefined' && google.maps) {
        checkEditMode();
    } else {
        document.addEventListener('mapReady', checkEditMode);
    }

    // --- Form Submission Logic ---
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        if (isEditMode) {
            const locationIndex = locations.findIndex(loc => loc.id == locationIdToEdit);
            if (locationIndex !== -1) {
                locations[locationIndex] = {
                    ...locations[locationIndex],
                    name: document.getElementById('location-name').value,
                    category: document.getElementById('category').value,
                    description: document.getElementById('description').value,
                    opentime: document.getElementById('open-time').value,
                    closetime: document.getElementById('close-time').value,
                    latitude: document.getElementById('latitude').value,
                    longitude: document.getElementById('longitude').value,
                };
                alert('อัปเดตข้อมูลเรียบร้อยแล้ว!');
            }
        } else {
             const newLocation = {
                id: Date.now(),
                name: document.getElementById('location-name').value,
                category: document.getElementById('category').value,
                description: document.getElementById('description').value,
                opentime: document.getElementById('open-time').value,
                closetime: document.getElementById('close-time').value,
                latitude: document.getElementById('latitude').value,
                longitude: document.getElementById('longitude').value,
            };
            locations.push(newLocation);
            alert('บันทึกข้อมูลสถานที่เรียบร้อยแล้ว!');
        }
        
        localStorage.setItem('locations', JSON.stringify(locations));
        window.location.href = 'dashboard.html';
    });
});