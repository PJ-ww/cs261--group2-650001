async function login() {
  const studentId = document.getElementById("studentId").value.trim();
  const citizenId = document.getElementById("citizenId").value.trim();

  if (!studentId || !citizenId) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  try {
    // 🔹 1. ล็อกอินผ่าน TU Verify API ผ่าน backend ของเรา
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Username: studentId,
        Password: citizenId
      })
    });

    const data = await response.json();

    if (data.status === true) {
      // ✅ 2. เรียก TU Profile API v2 เพื่อดึงข้อมูลโปรไฟล์เต็ม
      const profileResponse = await fetch(
        `https://restapi.tu.ac.th/api/v2/profile/std/info?id=${studentId}`,
        {
          headers: {
            "Application-Key":
              "TU7ba945dfd7eab36cb292085fe2193cf101b2cb94388c2721d105e34eb6df0a7378f327eddfbee7820e251535fbb12593"
          }
        }
      );

      const profileData = await profileResponse.json();

      // ✅ 3. เก็บข้อมูลทั้งหมดใน localStorage
      localStorage.setItem("tu_token", data.token || data.message);
      localStorage.setItem("student_info", JSON.stringify(profileData));

      // ✅ 4. แสดง modal สำเร็จ
      document.getElementById("successModal").style.display = "flex";
    } else {
      document.getElementById("failedModal").style.display = "flex";
    }
  } catch (error) {
    console.error("Error:", error);
    alert("ไม่สามารถเชื่อมต่อกับระบบได้");
  }
}

// ✅ กด Continue หลัง Login สำเร็จ → ไปหน้าโปรไฟล์
function handleSuccessContinue() {
  document.getElementById("successModal").style.display = "none";
  window.location.href = "profile_logged_in.html";
}

// ❌ ปุ่มปิด modal ถ้า login fail
function handleFailedContinue() {
  document.getElementById("failedModal").style.display = "none";
}
