// authGuard.js

export function protectPage(requireAdmin = false) {
  const token = localStorage.getItem("tu_token");
  const role = localStorage.getItem("role");

  // ❌ ถ้าไม่มี token → กลับหน้า login
  if (!token) {
    alert("กรุณาเข้าสู่ระบบก่อนเข้าถึงหน้านี้");
    window.location.href = "/login.html";
    return;
  }

  // ❌ ถ้าหน้านี้ต้องเป็น admin แต่ role ไม่ใช่ admin
  if (requireAdmin && role !== "ROLE_ADMIN") {
    alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
    window.location.href = "/profile_logged_in.html";
    return;
  }

  // ✅ ผ่านแล้วก็ให้เข้าหน้าได้
  console.log("✅ Access granted:", requireAdmin ? "admin only" : "user");
}
