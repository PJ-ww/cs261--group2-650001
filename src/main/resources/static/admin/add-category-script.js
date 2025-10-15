document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('categoryForm');
    const pageTitle = document.getElementById('page-title');
    const formTitle = document.getElementById('form-title');
    const categoryNameInput = document.getElementById('category-name');
    const categoryDescInput = document.getElementById('category-description');
    const saveButton = document.querySelector('.btn-save');

    const urlParams = new URLSearchParams(window.location.search);
    const categoryIdToEdit = urlParams.get('edit');
    let isEditMode = false;
    let categories = JSON.parse(localStorage.getItem('categories')) || [];

    if (categoryIdToEdit) {
        isEditMode = true;
        const categoryToEdit = categories.find(cat => cat.id == categoryIdToEdit);
        if (categoryToEdit) {
            pageTitle.textContent = 'Edit Category';
            formTitle.textContent = 'แก้ไขหมวดหมู่';
            saveButton.textContent = 'อัปเดต';
            categoryNameInput.value = categoryToEdit.name;
            categoryDescInput.value = categoryToEdit.description;
        }
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (isEditMode) {
            const catIndex = categories.findIndex(cat => cat.id == categoryIdToEdit);
            if (catIndex > -1) {
                categories[catIndex].name = categoryNameInput.value;
                categories[catIndex].description = categoryDescInput.value;
                alert('อัปเดตหมวดหมู่เรียบร้อยแล้ว!');
            }
        } else {
            const newCategory = {
                id: Date.now(),
                name: categoryNameInput.value,
                description: categoryDescInput.value || ''
            };
            categories.push(newCategory);
            alert('เพิ่มหมวดหมู่ใหม่เรียบร้อยแล้ว!');
        }

        localStorage.setItem('categories', JSON.stringify(categories));
        window.location.href = 'category.html';
    });
});