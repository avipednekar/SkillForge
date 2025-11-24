const testRegistration = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "test_script_user_" + Date.now(),
        email: "test_script_" + Date.now() + "@example.com",
        password: "password123",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Registration Success:", data);
    } else {
      console.error("Registration Failed:", data);
    }
  } catch (err) {
    console.error("Network Error:", err.message);
  }
};

testRegistration();
