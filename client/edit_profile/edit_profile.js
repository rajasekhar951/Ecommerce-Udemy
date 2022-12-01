if (!window.localStorage.getItem("accessToken")) {
  window.location.href = "/client/login/login.html";
}

const edit_profile = document.getElementById("editForm");

edit_profile.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(edit_profile);

  const body = {
    user_name: data.get("username"),
    email: data.get("email"),
  };
  const token = window.localStorage.getItem("accessToken");
  let register;
  let response_data;
  try {
    register = await fetch("http://localhost:3000/edit_profile", {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    response_data = await register.json();
  } catch (error) {
    const msg = document.getElementById("msg");
    msg.innerText = error.message;
  }
  if (register.ok) {
    window.localStorage.removeItem("accessToken");
    window.location.href = "/client/login/login.html";
  } else {
    if (response_data["error"]) {
      if (response_data["status"] == "unauthorized") {
        window.location.href = "/client/login/login.html";
      }
    }
    const msg = document.getElementById("msg");
    msg.innerText = response_data["error"];
  }
});
