/* eslint-disable */

const signUpBtn = document.getElementById("sign-up");

if (signUpBtn)
  signUpBtn.addEventListener("click", () => {
    location.assign("/signup");
  });

const signUpForm = document.querySelector(".signup-form");

const signUp = async (name, email, password, confirmPassword) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/signup",
      data: {
        email,
        name,
        password,
        passwordConfirm: confirmPassword,
      },
    });

    console.log(res);
    if (res.data.status === "success") {
      alert("Signed up sucessfully");
      setTimeout(() => {
        location.replace("/login");
      }, 1500);
    }
  } catch (err) {
    throw err;
  }
};

if (signUpForm) {
  signUpForm.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    const confrimPassword = formData.get("password-confirm");
    const name = formData.get("name");

    try {
      await signUp(name, email, password, confrimPassword);
    } catch (err) {
      alert(JSON.stringify(err.response.data));
      console.log(err.response.data);
    }
  });
}
