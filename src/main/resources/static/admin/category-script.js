document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('category-table-body');
    const searchInput = document.getElementById('searchInput');
    let categories = JSON.parse(localStorage.getItem('categories')) || [];

    function renderTable(dataToRender) {
        tableBody.innerHTML = '';
        if (dataToRender.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">ไม่พบข้อมูลหมวดหมู่</td></tr>`;
            return;
        }
        dataToRender.forEach((category, index) => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', category.id);
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${category.name}</td>
                <td>${category.description}</td>
                <td class="actions-cell">
                    <i class="fas fa-ellipsis-v menu-icon"></i>
                    <div class="dropdown-menu">
                        <a href="add-category.html?edit=${category.id}" class="edit-btn"><i class="fas fa-pencil-alt"></i> Edit</a>
                        <a href="#" class="delete-btn"><i class="fas fa-trash-alt"></i> Delete</a>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    searchInput.addEventListener('keyup', function() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredData = categories.filter(cat => 
            (cat.name && cat.name.toLowerCase().includes(searchTerm)) || 
            (cat.description && cat.description.toLowerCase().includes(searchTerm))
        );
        renderTable(filteredData);
    });

    // ===== START: CORRECTED EVENT LOGIC =====
    tableBody.addEventListener('click', function(event) {
        const target = event.target;

        // Logic for showing/hiding the dropdown menu
        if (target.classList.contains('menu-icon')) {
            // Close any other open menus first
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                if (menu !== target.nextElementSibling) {
                    menu.classList.remove('show');
                }
            });
            // Toggle the clicked menu
            const menu = target.nextElementSibling;
            menu.classList.toggle('show');
        }

        // Logic for the Delete button
        if (target.closest('.delete-btn')) {
            event.preventDefault();
            const row = target.closest('tr');
            const categoryId = Number(row.getAttribute('data-id'));
            const categoryName = row.cells[1].textContent;

            if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${categoryName}"?`)) {
                categories = categories.filter(cat => cat.id !== categoryId);
                localStorage.setItem('categories', JSON.stringify(categories));
                renderTable(categories);
            }
        }
    });
    
    // This listener now ONLY closes menus when clicking outside
    window.addEventListener('click', function(event) {
        if (!event.target.matches('.menu-icon')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
    // ===== END: CORRECTED EVENT LOGIC =====

    renderTable(categories);
});