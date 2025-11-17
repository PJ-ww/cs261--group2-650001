async function login() {
  const studentId = document.getElementById("studentId").value.trim();
  const citizenId = document.getElementById("citizenId").value.trim();

  if (!studentId || !citizenId) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  try {
    // 🔹 1. Call your backend /api/login
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Username: studentId,
        Password: citizenId
      }),
      credentials: "include" // Make sure this is here!
    });

    const data = await response.json();

    if (data.status === true) {
      
      // ✅ --- START OF FIX ---
      // Create a default user object as a fallback
      let userProfile = {
        data: {
          userName: studentId, // Use studentId as fallback username
          displayname_en: studentId // Use studentId as fallback display name
        }
      };

      try {
        // 🔹 2. Try to fetch the detailed profile from TU API
        const profileResponse = await fetch(
          `https://restapi.tu.ac.th/api/v2/profile/std/info?id=${studentId}`,
          {
            headers: {
              "Application-Key":
                "TU7ba945dfd7eab36cb292085fe2193cf101b2cb94388c2721d105e34eb6df0a7378f327eddfbee7820e251535fbb12593"
            }
          }
        );
        
        // 🔹 3. ONLY if the fetch is successful, use its data
        if (profileResponse.ok) {
          userProfile = await profileResponse.json();
          console.log("Successfully fetched TU profile.");
        } else {
          console.warn("Failed to fetch TU profile. Using fallback data.");
        }
      } catch (profileError) {
        console.error("Error fetching TU profile:", profileError);
      }
      // ✅ --- END OF FIX ---

      // 🔹 4. Save the data (either real data or fallback)
      localStorage.setItem("tu_token", data.message);
      localStorage.setItem("student_info", JSON.stringify(userProfile)); // This is now safe
      localStorage.setItem("role", data.role);
	  localStorage.setItem("userId", String(parseInt(userId, 10)));
	  
      // 🔹 5. Redirect based on role
      if (data.role === "ROLE_ADMIN") {
        window.location.href = "/admin/dashboard.html";
      } else {
        // Redirect to your new user profile page
        window.location.href = "/user/profile_logged_in.html"; 
      }
    } else {
      alert("รหัสนักศึกษาหรือรหัสประชาชนไม่ถูกต้อง");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("ไม่สามารถเชื่อมต่อกับระบบได้");
  }
}