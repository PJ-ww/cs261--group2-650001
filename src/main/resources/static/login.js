async function login() {
  const studentId = document.getElementById("studentId").value.trim();
  const citizenId = document.getElementById("citizenId").value.trim();

  if (!studentId || !citizenId) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  try {
    const response = await fetch("https://restapi.tu.ac.th/api/v1/auth/Ad/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Application-Key": "3fd738c9438b232891c501db5791e9d086964324"
      },
      body: JSON.stringify({
        Username: studentId,
        Password: citizenId
      })
    });

    const data = await response.json();

    if (response.ok && data.status === true) {
      localStorage.setItem("tu_token", data.token || data.message);
      localStorage.setItem("student_info", JSON.stringify(data));
      document.getElementById('successModal').style.display = 'flex';
    } else {
      document.getElementById('failedModal').style.display = 'flex';
    }
  } catch (error) {
    console.error("Error:", error);
    alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
  }
}
