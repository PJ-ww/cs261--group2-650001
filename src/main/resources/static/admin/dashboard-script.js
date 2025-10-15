document.addEventListener('DOMContentLoaded', function() {
    // --- 1. GET ELEMENTS AND DATA ---
    const tableBody = document.getElementById('location-table-body');
    const searchInput = document.getElementById('searchInput');
    const paginationWrapper = document.getElementById('pagination-wrapper');
    let locations = JSON.parse(localStorage.getItem('locations')) || [];
    let currentData = locations; // Data currently being displayed (can be filtered)
    let rowToDelete = null; 

    // --- PAGINATION VARIABLES ---
    let currentPage = 1;
    const rowsPerPage = 5; // Show 5 rows per page

    // --- 2. RENDER TABLE FUNCTION ---
    function renderTable(dataToRender, page = 1) {
        tableBody.innerHTML = '';
        currentPage = page;

        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedData = dataToRender.slice(start, end);

        if (paginatedData.length === 0 && dataToRender.length > 0) {
             tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;">ไม่พบข้อมูลในหน้านี้</td></tr>`;
             return;
        }
        if (dataToRender.length === 0){
             tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;">ไม่พบข้อมูล</td></tr>`;
             return;
        }

        paginatedData.forEach(location => {
            const originalIndex = locations.findIndex(loc => loc.id === location.id);
            const row = document.createElement('tr');
            row.setAttribute('data-id', location.id);
            row.innerHTML = `
                <td>${originalIndex + 1}</td><td>${location.name}</td><td>${location.category}</td><td>${location.description}</td>
                <td>${location.opentime}</td><td>${location.closetime}</td><td>${location.latitude}</td><td>${location.longitude}</td>
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

    // --- 3. PAGINATION SETUP FUNCTION ---
    function setupPagination(dataToRender) {
        paginationWrapper.innerHTML = '';
        const pageCount = Math.ceil(dataToRender.length / rowsPerPage);

        let prevButton = document.createElement('button');
        prevButton.innerHTML = '&laquo;';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            renderTable(currentData, currentPage - 1);
            setupPagination(currentData);
        });
        paginationWrapper.appendChild(prevButton);

        for (let i = 1; i <= pageCount; i++) {
            let btn = document.createElement('button');
            btn.innerText = i;
            if (currentPage === i) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', () => {
                renderTable(currentData, i);
                setupPagination(currentData);
            });
            paginationWrapper.appendChild(btn);
        }

        let nextButton = document.createElement('button');
        nextButton.innerHTML = '&raquo;';
        nextButton.disabled = currentPage === pageCount;
        nextButton.addEventListener('click', () => {
            renderTable(currentData, currentPage + 1);
            setupPagination(currentData);
        });
        paginationWrapper.appendChild(nextButton);
    }
    
    // --- 4. SEARCH FUNCTIONALITY ---
    searchInput.addEventListener('keyup', function() {
        const searchTerm = searchInput.value.toLowerCase();
        currentData = locations.filter(location => Object.values(location).join(' ').toLowerCase().includes(searchTerm));
        renderTable(currentData, 1);
        setupPagination(currentData);
    });

    // --- 5. EDIT/DELETE MENU FUNCTIONALITY ---
    tableBody.addEventListener('click', function(event) {
        const target = event.target;
        const deleteButton = target.closest('.delete-btn');

        if (target.classList.contains('menu-icon')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => { if (menu !== target.nextElementSibling) menu.classList.remove('show'); });
            target.nextElementSibling.classList.toggle('show');
            return;
        }

        if (deleteButton) {
            event.preventDefault();
            const row = deleteButton.closest('tr');
            if (deleteButton.classList.contains('confirm-btn')) {
                const locationId = Number(row.getAttribute('data-id'));
                locations = locations.filter(location => location.id !== locationId);
                localStorage.setItem('locations', JSON.stringify(locations));
                currentData = locations;
                renderTable(currentData, currentPage);
                setupPagination(currentData);
                rowToDelete = null;
            } else {
                if (rowToDelete) {
                    rowToDelete.classList.remove('row-pending-deletion');
                    const originalBtn = rowToDelete.querySelector('.delete-btn');
                    if (originalBtn) {
                        originalBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
                        originalBtn.classList.remove('confirm-btn');
                    }
                }
                row.classList.add('row-pending-deletion');
                deleteButton.innerHTML = 'Confirm?';
                deleteButton.classList.add('confirm-btn');
                rowToDelete = row;
            }
        }
    });

    window.addEventListener('click', function(event) {
        if (!event.target.closest('.actions-cell')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => menu.classList.remove('show'));
            if (rowToDelete) {
                rowToDelete.classList.remove('row-pending-deletion');
                const originalBtn = rowToDelete.querySelector('.delete-btn');
                if (originalBtn) {
                   originalBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
                   originalBtn.classList.remove('confirm-btn');
                }
                rowToDelete = null;
            }
        }
    });

    // --- 6. INITIAL RENDER ---
    renderTable(currentData, 1);
    setupPagination(currentData);
});