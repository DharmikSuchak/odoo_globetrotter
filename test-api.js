const http = require('http');

async function testApi() {
  console.log("--- Testing Login ---");
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@example.com", password: "password123" })
  });
  const loginData = await loginRes.json();
  console.log("Login Status:", loginRes.status);
  console.log("Login Response:", loginData);

  if (loginData.token) {
    console.log("\n--- Testing Protected Route (/api/me) ---");
    const meRes = await fetch("http://localhost:5000/api/me", {
      headers: { "Authorization": "Bearer " + loginData.token }
    });
    const meData = await meRes.json();
    console.log("Me Status:", meRes.status);
    console.log("Me Response:", meData);
  }

  console.log("\n--- Testing Rate Limiter (5 fast logins) ---");
  for (let i = 1; i <= 6; i++) {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "wrongpassword" })
    });
    const data = await res.json();
    console.log(`Attempt ${i} Status:`, res.status, data.message || "");
  }
}

testApi().catch(console.error);
