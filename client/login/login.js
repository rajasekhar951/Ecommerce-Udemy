const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = new FormData(loginForm);

  const body = {
    email: data.get("email"),
    password: data.get("password"),
  };
  let login;
  let token;
  try {
    login = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    token = await login.json();
  } catch (error) {
    const msg = document.getElementById("loginMsg");
    msg.innerText = error;
  }
  if (token["accessToken"]) {
    window.localStorage.setItem("accessToken", token["accessToken"]);
    window.location.href = "/client/home/home.html";
  } else {
    console.log(token);
    const msg = document.getElementById("loginMsg");
    msg.innerText = token["error"];
  }
});
