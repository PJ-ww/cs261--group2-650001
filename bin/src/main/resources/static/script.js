/*LOADING.HTML*/ 

// รอให้ DOM (โครงสร้าง HTML) โหลดเสร็จก่อน
document.addEventListener('DOMContentLoaded', function() {
    
    const loader = document.getElementById('loader');
    const errorModal = document.getElementById('error-modal');
    const okButton = document.getElementById('ok-button');

    function checkNetworkStatus() {
        if (navigator.onLine) {
            
            console.log('Online, starting 3-second timer...');
            loader.style.display = 'block'; 
            errorModal.classList.remove('show');

            // ตั้งเวลา 3 วินาที 
            setTimeout(function() {
                // เมื่อครบ 3 วิ ให้เปลี่ยนไปหน้าถัดไป
                window.location.href = 'map.html'; 
            }, 3000);
         

        } else {
            // ถ้าออฟไลน์ 
            console.log('Offline');
            loader.style.display = 'none'; // ซ่อนตัวโหลด
            errorModal.classList.add('show'); // แสดงกล่อง Error
        }
    }

    okButton.addEventListener('click', function() {
        errorModal.classList.remove('show');
    });

    checkNetworkStatus();

    window.addEventListener('online', checkNetworkStatus);
    window.addEventListener('offline', checkNetworkStatus);
});



