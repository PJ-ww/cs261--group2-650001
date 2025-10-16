document.addEventListener('DOMContentLoaded', function () {
  const tableBody = document.getElementById('location-table-body');
  const searchInput = document.getElementById('searchInput');
  const paginationWrapper = document.getElementById('pagination-wrapper');

  const API_URL = '/api/locations'; // ✅ ใช้ path แบบ relative

  let locations = [];
  let currentData = [];
  let currentPage = 1;
  const rowsPerPage = 5;
  let rowToDelete = null;

  // --- โหลดข้อมูลจาก backend ---
  async function loadLocations(searchTerm = '') {
    try {
      const url = searchTerm ? `${API_URL}?search=${encodeURIComponent(searchTerm)}` : API_URL;
      const response = await fetch(url);
      if (!response.ok) throw new Error('โหลดข้อมูลไม่สำเร็จ');
      const data = await response.json();

      locations = data;
      currentData = locations;

      renderTable(currentData, 1);
      setupPagination(currentData);
    } catch (error) {
      console.error('Error fetching data:', error);
      tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;">โหลดข้อมูลไม่สำเร็จ</td></tr>`;
    }
  }

  // --- Render ตาราง ---
  function renderTable(dataToRender, page = 1) {
    tableBody.innerHTML = '';
    currentPage = page;

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = dataToRender.slice(start, end);

    if (paginatedData.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;">ไม่พบข้อมูล</td></tr>`;
      return;
    }

    paginatedData.forEach((location, index) => {
      const row = document.createElement('tr');
      row.setAttribute('data-id', location.id);
      row.innerHTML = `
        <td>${start + index + 1}</td>
        <td>${location.name || '-'}</td>
        <td>${location.category?.name || location.category || '-'}</td>
        <td>${location.description || '-'}</td>
        <td>${location.opentime || '-'}</td>
        <td>${location.closetime || '-'}</td>
        <td>${location.latitude || '-'}</td>
        <td>${location.longitude || '-'}</td>
        <td class="actions-cell">
          <i class="fas fa-ellipsis-v menu-icon"></i>
          <div class="dropdown-menu">
            <a href="add-location.html?edit=${location.id}" class="edit-btn"><i class="fas fa-pencil-alt"></i> Edit</a>
            <a href="#" class="delete-btn"><i class="fas fa-trash-alt"></i> Delete</a>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  // --- Pagination ---
  function setupPagination(dataToRender) {
    paginationWrapper.innerHTML = '';
    const pageCount = Math.ceil(dataToRender.length / rowsPerPage);

    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&laquo;';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
      renderTable(currentData, currentPage - 1);
      setupPagination(currentData);
    };
    paginationWrapper.appendChild(prevButton);

    for (let i = 1; i <= pageCount; i++) {
      const btn = document.createElement('button');
      btn.innerText = i;
      if (i === currentPage) btn.classList.add('active');
      btn.onclick = () => {
        renderTable(currentData, i);
        setupPagination(currentData);
      };
      paginationWrapper.appendChild(btn);
    }

    const nextButton = document.createElement('button');
    nextButton.innerHTML = '&raquo;';
    nextButton.disabled = currentPage === pageCount;
    nextButton.onclick = () => {
      renderTable(currentData, currentPage + 1);
      setupPagination(currentData);
    };
    paginationWrapper.appendChild(nextButton);
  }

  // --- ค้นหา ---
  searchInput.addEventListener('keyup', async function () {
    const searchTerm = searchInput.value.trim();
    await loadLocations(searchTerm);
  });

  // --- เมนูจุดสามจุด ---
  tableBody.addEventListener('click', function (event) {
    const target = event.target;

    // ถ้าคลิกที่จุดสามจุด
    if (target.classList.contains('menu-icon')) {
      event.stopPropagation(); // ✅ ป้องกันเมนูปิดเอง
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        if (menu !== target.nextElementSibling) menu.classList.remove('show');
      });
      target.nextElementSibling.classList.toggle('show');
      return;
    }
  });

  // ปิด dropdown ถ้าคลิกนอก cell
  window.addEventListener('click', function (event) {
    if (!event.target.closest('.actions-cell')) {
      document.querySelectorAll('.dropdown-menu.show')
        .forEach(menu => menu.classList.remove('show'));
    }
  });

  // --- ลบข้อมูล ---
  tableBody.addEventListener('click', async function (e) {
    const deleteBtn = e.target.closest('.delete-btn');
    if (!deleteBtn) return;
    e.preventDefault();

    const row = deleteBtn.closest('tr');
    const id = row.getAttribute('data-id');

    if (deleteBtn.classList.contains('confirm-btn')) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('ลบข้อมูลไม่สำเร็จ');
        await loadLocations();
        rowToDelete = null;
      } catch (err) {
        console.error('Error deleting:', err);
        alert('ไม่สามารถลบข้อมูลได้');
      }
    } else {
      // กดครั้งแรก = แสดง Confirm?
      if (rowToDelete) {
        rowToDelete.classList.remove('row-pending-deletion');
        const oldBtn = rowToDelete.querySelector('.delete-btn');
        if (oldBtn) {
          oldBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
          oldBtn.classList.remove('confirm-btn');
        }
      }
      row.classList.add('row-pending-deletion');
      deleteBtn.innerHTML = 'Confirm?';
      deleteBtn.classList.add('confirm-btn');
      rowToDelete = row;
    }
  });

  // --- โหลดข้อมูลตอนเปิดหน้า ---
  loadLocations();
});
