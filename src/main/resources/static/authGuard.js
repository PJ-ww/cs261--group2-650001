// authGuard.js

export function protectPage(requireAdmin = false) {
  const token = localStorage.getItem("tu_token");
  const role = localStorage.getItem("role");
  const currentUrl = window.location.pathname;

  // 🧭 1️⃣ ถ้าไม่มี token → กลับหน้า login
  if (!token) {
    console.warn("❌ No token found — redirecting to login...");
    alert("กรุณาเข้าสู่ระบบก่อนเข้าถึงหน้านี้");
    window.location.href = "/login.html";
    return;
  }

  // 🧭 2️⃣ ถ้าเป็นหน้า admin แต่ role ไม่ใช่ ROLE_ADMIN → redirect ออก
  if (requireAdmin && role !== "ROLE_ADMIN") {
    console.warn("🚫 Unauthorized — user is not admin");
    alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
    window.location.href = "/profile_logged_in.html";
    return;
  }

  // 🧭 3️⃣ ถ้าออกจากหน้า admin ให้เคลียร์ข้อมูล auth
  if (!currentUrl.includes("/admin/") && !currentUrl.includes("/profile_logged_in.html")) {
    console.log("🧹 Leaving admin area → clearing auth info...");
    localStorage.removeItem("role");
    localStorage.removeItem("tu_token");
    localStorage.removeItem("student_info");
  }

  console.log(`✅ Access granted to: ${currentUrl} (${requireAdmin ? "Admin" : "User"})`);
}
