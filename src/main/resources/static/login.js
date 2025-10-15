async function login() {
  const studentId = document.getElementById("studentId").value.trim();
  const citizenId = document.getElementById("citizenId").value.trim();

  if (!studentId || !citizenId) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  try {
    // 🔹 เรียก backend login (ซึ่งจะยิงไป TU API)
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
      // ✅ ดึงข้อมูลโปรไฟล์จาก TU API (optional)
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

      // ✅ เก็บข้อมูลใน localStorage
      localStorage.setItem("tu_token", data.message);
      localStorage.setItem("student_info", JSON.stringify(profileData));
      localStorage.setItem("role", data.role);

      // ✅ แสดง modal หรือ redirect ตาม role
      if (data.role === "ROLE_ADMIN") {
        window.location.href = "/admin/dashboard.html";
      } else {
        window.location.href = "/profile_logged_in.html";
      }
    } else {
      alert("รหัสนักศึกษาหรือรหัสประชาชนไม่ถูกต้อง");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("ไม่สามารถเชื่อมต่อกับระบบได้");
  }
}
