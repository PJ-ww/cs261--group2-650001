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
        "Application-Key": "TU7ba945dfd7eab36cb292085fe2193cf101b2cb94388c2721d105e34eb6df0a7378f327eddfbee7820e251535fbb12593"
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
