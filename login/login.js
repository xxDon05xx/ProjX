function signIn() {
  const userID = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const msg = document.getElementById('message');

  if (!userID || !password) {
    msg.style.color = "yellow";
    msg.textContent = "Please enter both fields.";
    return;
  }

  // Send POST request to Node server
  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userID, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      msg.style.color = "green";
      msg.textContent = "Login successful! Redirecting...";

      // Redirect based on ID type
      if (userID.startsWith("S")) {
        window.location.href = "/student-dashboard.html";
      } else if (userID.startsWith("G")) {
        window.location.href = "/guide-dashboard.html";
      }
    } else {
      msg.style.color = "yellow";
      msg.textContent = data.message;
    }
  })
  .catch(err => {
    msg.style.color = "yellow";
    msg.textContent = "Server error, try again later.";
    console.error(err);
  });
}
function signUp() {
  const role = prompt("Enter role: 'student' or 'guide'").toLowerCase();

  if (role === "student") {
    
    window.location.href = `signup.html?role=student`;
  } else if (role === "guide") {
    
    window.location.href = `signup.html?role=guide`;
  } else {
    alert("Invalid choice. Please enter 'student' or 'guide'.");
  }
}

