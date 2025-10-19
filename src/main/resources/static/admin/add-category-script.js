document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('categoryForm');
    const pageTitle = document.getElementById('page-title');
    const formTitle = document.getElementById('form-title');
    const categoryNameInput = document.getElementById('category-name');
    const saveButton = document.querySelector('.btn-save');

    const API_URL = 'http://localhost:8080/api/categories'; // ✅ เปลี่ยนถ้า backend อยู่ port อื่น

    const urlParams = new URLSearchParams(window.location.search);
    const categoryIdToEdit = urlParams.get('edit');
    let isEditMode = false;

    // ✅ โหลดข้อมูลถ้าเป็นโหมดแก้ไข
    if (categoryIdToEdit) {
        isEditMode = true;
        pageTitle.textContent = 'Edit Category';
        formTitle.textContent = 'แก้ไขหมวดหมู่';
        saveButton.textContent = 'อัปเดต';

        fetch(`${API_URL}/${categoryIdToEdit}`)
            .then(response => {
                if (!response.ok) throw new Error('ไม่พบหมวดหมู่');
                return response.json();
            })
            .then(category => {
                categoryNameInput.value = category.category || '';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
            });
    }

    // ✅ เมื่อกด submit ฟอร์ม
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const categoryData = {
            category: categoryNameInput.value
        };

        // POST หรือ PUT ตามโหมด
        const request = isEditMode
            ? fetch(`${API_URL}/${categoryIdToEdit}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(categoryData)
              })
            : fetch(API_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(categoryData)
              });

        request
            .then(response => {
                if (!response.ok) throw new Error('ไม่สำเร็จ');
                return response.json();
            })
            .then(() => {
                alert(isEditMode ? 'อัปเดตหมวดหมู่เรียบร้อยแล้ว!' : 'เพิ่มหมวดหมู่ใหม่เรียบร้อยแล้ว!');
                window.location.href = 'category.html';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('เกิดข้อผิดพลาดในการบันทึกหมวดหมู่');
            });
    });
});
