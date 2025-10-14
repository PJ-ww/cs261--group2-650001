function checkAuth() {
  const token = localStorage.getItem("tu_token");

  if (!token) {
    // ถ้ายังไม่ login → redirect กลับไปหน้า login
    alert("กรุณาเข้าสู่ระบบก่อนเข้าถึงหน้านี้");
    window.location.href = "login.html";
  }
}
