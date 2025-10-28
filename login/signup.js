
function signUp() {

  console.log("SIgned....................")
  const params = new URLSearchParams(window.location.search);
  let role = params.get('role');
  const name = document.getElementById('name').value.trim(); 
  const rollNumber = document.getElementById('roll').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
  const course = document.getElementById('course')?.value.trim();
  const department = document.getElementById('department')?.value.trim();

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, name, rollNumber, password, course, department })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert(`${role} registered successfully! Your ID: ${data.studentID || data.guideID}`);
      window.location.href = "/login.html";
    } else {
      alert(data.message);
    }
  })
  .catch(err => console.error("Error:", err));
}




const container = document.getElementById("diamond");

  for (let i = 0; i < 20; i++) {
    const diamond = document.createElement("div");
    diamond.className =
      "absolute bg-white/15 rotate-45 z-0 animate-floatDiamond";
    diamond.style.width = `${Math.random() * 30 + 10}px`;
    diamond.style.height = diamond.style.width;
    diamond.style.top = `${Math.random() * 100}vh`;
    diamond.style.left = `${Math.random() * 100}vw`;
    diamond.style.animationDuration = `${8 + Math.random() * 5}s`;
    diamond.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(diamond);
  }
  function signIn() {
  window.location.href = "login.html";
}