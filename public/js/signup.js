/* eslint-disable */

const signUpBtn = document.getElementById("sign-up");

signUpBtn.addEventListener("click", () => {
  console.log("Hello from SingUp");
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

    console.log(res.data.data);
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
      console.log(err.response.data);
    }
  });
}
