let map;
let marker = null;

// --- Google Map Setup ---
function initAddMap() {
  const initialCenter = { lat: 14.0724, lng: 100.6021 };

  map = new google.maps.Map(document.getElementById("map-add-page"), {
    zoom: 15,
    center: initialCenter,
    disableDefaultUI: true,
  });

  map.addListener("click", (event) => {
    const coords = event.latLng;
    document.getElementById("latitude").value = coords.lat().toFixed(6);
    document.getElementById("longitude").value = coords.lng().toFixed(6);

    if (!marker) {
      marker = new google.maps.Marker({ position: coords, map: map });
    } else {
      marker.setPosition(coords);
    }
  });

  document.dispatchEvent(new Event("mapReady"));
}

document.addEventListener("DOMContentLoaded", async function () {
  const API_URL = "/api/locations";
  const CATEGORY_URL = "/api/categories";

  const form = document.getElementById("locationForm");
  const nameInput = document.getElementById("location-name");
  const descInput = document.getElementById("description");
  const categorySelect = document.getElementById("category");
  const openInput = document.getElementById("open-time");
  const closeInput = document.getElementById("close-time");
  const latInput = document.getElementById("latitude");
  const lngInput = document.getElementById("longitude");
  const pageTitle = document.getElementById("page-title");
  const formTitle = document.getElementById("form-title");

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("edit");

  // --- ตั้งเวลาเปิด/ปิด ---
  flatpickr(".time-picker", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
  });

  // --- โหลดหมวดหมู่จาก backend ---
  async function loadCategories() {
    try {
      const res = await fetch(CATEGORY_URL);
      if (!res.ok) throw new Error("โหลดหมวดหมู่ไม่สำเร็จ");
      const data = await res.json();

      data.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name || cat.category;
        categorySelect.appendChild(option);
      });
    } catch (err) {
      console.error("Error loading categories:", err);
      alert("ไม่สามารถโหลดหมวดหมู่ได้");
    }
  }

  // --- โหลดข้อมูลสถานที่ถ้ามี ?edit= ---
  async function loadLocationForEdit() {
    if (!editId) return;
    pageTitle.textContent = "Edit Location";
    formTitle.textContent = "แก้ไขสถานที่";
    document.querySelector(".btn-save").textContent = "อัปเดต";

    try {
      const res = await fetch(`${API_URL}?search=`);
      const data = await res.json();
      const place = data.find((p) => p.id == editId);
      if (!place) return;

      nameInput.value = place.name;
      descInput.value = place.description;
      openInput.value = place.opentime;
      closeInput.value = place.closetime;
      latInput.value = place.latitude;
      lngInput.value = place.longitude;

      if (place.category && place.category.id) {
        categorySelect.value = place.category.id;
      }

      // ตั้ง marker ในแผนที่
      const coords = { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) };
      if (map) {
        map.setCenter(coords);
        marker = new google.maps.Marker({ position: coords, map: map });
      }
    } catch (err) {
      console.error("Error loading location:", err);
    }
  }

  // --- เมื่อกดปุ่มบันทึก ---
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const payload = {
      name: nameInput.value.trim(),
      description: descInput.value.trim(),
      opentime: openInput.value,
      closetime: closeInput.value,
      latitude: latInput.value,
      longitude: lngInput.value,
      category: { id: parseInt(categorySelect.value) },
    };

    try {
      const res = await fetch(editId ? `${API_URL}/${editId}` : API_URL, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("บันทึกข้อมูลไม่สำเร็จ");

      alert(editId ? "อัปเดตข้อมูลเรียบร้อยแล้ว ✅" : "เพิ่มสถานที่สำเร็จ ✅");
      window.location.href = "dashboard.html";
    } catch (err) {
      console.error("Error saving location:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  });

  // --- โหลดข้อมูลเริ่มต้นทั้งหมด ---
  await loadCategories();

  if (typeof google !== "undefined" && google.maps) {
    await loadLocationForEdit();
  } else {
    document.addEventListener("mapReady", loadLocationForEdit);
  }
});
