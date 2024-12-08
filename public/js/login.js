/* eslint-disable */

const loginBtn = document.getElementById("login");

if (loginBtn)
  loginBtn.addEventListener("click", () => {
    location.assign("/login");
  });

const loginForm = document.querySelector(".login-form");

const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/login",
      data: {
        email,
        password,
      },
    });

    console.log(res.data);
    if (res.data.status === "success") {
      alert("Logged in sucessfully");
      setTimeout(() => {
        location.replace("/");
      }, 1500);
    }
  } catch (err) {
    throw err;
  }
};

if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    try {
      e.preventDefault();
      const formData = new FormData(e.target);
      const email = formData.get("email");
      const password = formData.get("password");

      await login(email, password);
    } catch (err) {
      console.log(err);
      console.log(err.response.data);
      alert(JSON.stringify(err.response.data));
    }
  });
}
