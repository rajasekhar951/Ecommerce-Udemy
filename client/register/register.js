const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(registerForm);

  const body = {
    user_role: data.get("role"),
    user_name: data.get("username"),
    email: data.get("email"),
    password: data.get("password"),
  };
  let register;
  let response_data;
  try {
    register = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    response_data = await register.json();
  } catch (error) {
    const msg = document.getElementById("msg");
    msg.innerText = error;
  }
  if (register.ok) {
    window.location.href = "/client/login/login.html";
  } else {
    const msg = document.getElementById("msg");
    msg.innerText = response_data["error"];
  }
});
