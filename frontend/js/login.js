function login() {
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const messageDiv = document.getElementById("message");

  if (!email.value || !password.value) {
    showMessage(messageDiv, "Please fill in all fields", "error");
    return;
  }

  fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  })
    .then(res => res.json())
    .then(user => {
      if (user.error || !user.id) {
        showMessage(messageDiv, "Invalid email or password", "error");
        return;
      }
      localStorage.setItem("user", JSON.stringify(user));
      showMessage(messageDiv, "Login successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    })
    .catch(err => {
      showMessage(messageDiv, "Login failed. Please try again.", "error");
      console.error(err);
    });
}

function showMessage(element, message, type) {
  element.textContent = message;
  element.className = `alert ${type}`;
  element.style.display = "block";
}
