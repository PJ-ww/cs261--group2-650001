async function login() {
  const studentId = document.getElementById("studentId").value.trim();
  const citizenId = document.getElementById("citizenId").value.trim();

  if (!studentId || !citizenId) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  try {
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
      localStorage.setItem("tu_token", data.token || data.message);
      localStorage.setItem("student_info", JSON.stringify(data));
      document.getElementById("successModal").style.display = "flex";
    } else {
      document.getElementById("failedModal").style.display = "flex";
    }
  } catch (error) {
    console.error("Error:", error);
    alert("ไม่สามารถเชื่อมต่อกับระบบได้");
  }
}

function handleSuccessContinue() {
  document.getElementById("successModal").style.display = "none";
  window.location.href = "profile_logged_in.html"; // ✅ ชื่อไฟล์ตรงกับของคุณ
}

function handleFailedContinue() {
  document.getElementById("failedModal").style.display = "none";
}
