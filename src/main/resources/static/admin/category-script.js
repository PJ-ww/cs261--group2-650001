document.addEventListener('DOMContentLoaded', function() {
  const tableBody = document.getElementById('category-table-body');
  const searchInput = document.getElementById('searchInput');
  const API_URL = '/api/categories'; // ✅ ดึงจาก backend
  let categories = [];
  let filteredData = [];

  // ✅ โหลดข้อมูลจาก backend
  async function loadCategories() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลหมวดหมู่ได้');
      const dto = await response.json();

      // ✅ ถ้า backend คืนเป็น array (ไม่ใช่ dto.categories)
      categories = Array.isArray(dto) ? dto : (dto.categories || []);
      localStorage.setItem('categories', JSON.stringify(categories));
      renderTable(categories);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการโหลดหมวดหมู่:', error);
      const localData = JSON.parse(localStorage.getItem('categories')) || [];
      renderTable(localData);
    }
  }

  // ✅ แสดงตารางหมวดหมู่
  function renderTable(dataToRender) {
    tableBody.innerHTML = '';
    if (dataToRender.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">ไม่พบข้อมูลหมวดหมู่</td></tr>`;
      return;
    }

    dataToRender.forEach((category, index) => {
      const row = document.createElement('tr');
      row.setAttribute('data-id', category.id);
      row.innerHTML = `
        <td>${index + 1}</td>   <!-- ✅ ลำดับเรียงใหม่เสมอ -->
        <td>${category.category || '-'}</td>  <!-- ✅ เปลี่ยนจาก name → category -->
        <td class="actions-cell">
          <i class="fas fa-ellipsis-v menu-icon"></i>
          <div class="dropdown-menu">
            <a href="add-category.html?edit=${category.id}" class="edit-btn">
              <i class="fas fa-pencil-alt"></i> แก้ไข
            </a>
            <a href="#" class="delete-btn">
              <i class="fas fa-trash-alt"></i> ลบ
            </a>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  // 🔍 ระบบค้นหา (ตามชื่อ category)
  searchInput.addEventListener('keyup', function() {
    const searchTerm = searchInput.value.toLowerCase();
    filteredData = categories.filter(cat =>
      cat.category && cat.category.toLowerCase().includes(searchTerm)
    );
    renderTable(filteredData);
  });

  // ⚙️ จัดการ dropdown และปุ่มลบ
  tableBody.addEventListener('click', function(event) {
    const target = event.target;

    // toggle เมนู
    if (target.classList.contains('menu-icon')) {
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        if (menu !== target.nextElementSibling) menu.classList.remove('show');
      });
      target.nextElementSibling.classList.toggle('show');
    }

    // 🔥 ลบหมวดหมู่ (เรียก API)
    if (target.closest('.delete-btn')) {
      event.preventDefault();
      const row = target.closest('tr');
      const categoryId = Number(row.getAttribute('data-id'));
      const categoryName = row.cells[1].textContent;

      if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${categoryName}"?`)) {
        fetch(`${API_URL}/${categoryId}`, { method: 'DELETE' })
          .then(response => {
            if (!response.ok) throw new Error('ลบไม่สำเร็จ');
            alert('ลบหมวดหมู่เรียบร้อยแล้ว!');
            loadCategories(); // โหลดใหม่หลังลบ
          })
          .catch(error => {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาดในการลบหมวดหมู่');
          });
      }
    }
  });

  // ปิดเมนูเมื่อคลิกข้างนอก
  window.addEventListener('click', function(event) {
    if (!event.target.matches('.menu-icon')) {
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => menu.classList.remove('show'));
    }
  });

  // ✅ โหลดข้อมูลเมื่อเริ่มต้น
  loadCategories();
});
