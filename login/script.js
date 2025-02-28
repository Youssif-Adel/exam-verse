import { isValidEmail, isValidName, isValidPassword } from "./dataCheck.js";

const loginWrapper = document.getElementById("login-wrapper");
const cover = document.getElementById("cover");

const transitionButton = document.getElementById("transition-button");
const transitionHead = document.getElementById("transition-head");
const transitionBody = document.getElementById("transition-body");

const loginEmailInput = document.getElementById(`login-email-input`);
const loginPasswordInput = document.getElementById(`login-password-input`);
const loginButton = document.getElementById("login-button");

const signNameInput = document.getElementById(`sign-name-input`);
const signEmailInput = document.getElementById(`sign-email-input`);
const signPasswordInput = document.getElementById(`sign-password-input`);
const signButton = document.getElementById(`sign-button`);

let state = 0;
// check if logged in
if (localStorage.getItem(`logged`) === `true`) {
  window.location.href = `../get-started-page/getStartedPage.html`;
}

// Login
loginButton.onclick = () => {
  let passwordCheck = isValidPassword(loginPasswordInput.value);
  loginPasswordInput.parentElement.querySelector("p").textContent =
    passwordCheck ? `` : `Password must be at least 8 characters long.`;

  let emailCheck = isValidEmail(loginEmailInput.value);
  loginEmailInput.parentElement.querySelector("p").textContent = emailCheck
    ? ``
    : `Please enter a real email.`;

  if (emailCheck && passwordCheck) {
    const user = JSON.parse(localStorage.getItem(`user`));
    if (
      user !== null &&
      loginEmailInput.value === user.email &&
      loginPasswordInput.value === user.password
    ) {
      localStorage.setItem(`logged`, true);
      loginButton.parentElement.querySelector(`.error`).textContent = ``;
      window.location.href = `../get-started-page/getStartedPage.html`;
    } else {
      loginButton.parentElement.querySelector(
        `#login-error`
      ).textContent = `Wrong email or password.`;
      localStorage.setItem(`logged`, false);
    }
  }
};

// Sign Up
signButton.onclick = () => {
  const nameCheck = isValidName(signNameInput.value);
  signNameInput.parentElement.querySelector("p").textContent = nameCheck
    ? ``
    : `Enter a valid name.`;

  const passwordCheck = isValidPassword(signPasswordInput.value);
  signPasswordInput.parentElement.querySelector("p").textContent = passwordCheck
    ? ``
    : `Password must be at least 8 characters long.`;

  const emailCheck = isValidEmail(signEmailInput.value);
  signEmailInput.parentElement.querySelector("p").textContent = emailCheck
    ? ``
    : `Please enter a real email.`;

  if (nameCheck && emailCheck && passwordCheck) {
    localStorage.setItem(
      `user`,
      JSON.stringify({
        name: signNameInput.value,
        email: signEmailInput.value,
        password: signPasswordInput.value,
      })
    );
    transition();
    if (window.innerWidth <= 1200) {
      changeToLogin();
    }
  }
};

// Handling the transition between sign in and sign up
transitionButton.onclick = transition;

function transition() {
  if (state === 0) {
    state = 1;
    cover.classList.remove("right");
    cover.classList.add("left");
    transitionHead.textContent = "Welcome back!";
    transitionBody.textContent = "Already a member?";
    transitionButton.textContent = "Sign In";

    loginEmailInput.value = ``;
    loginPasswordInput.value = ``;
  } else if (state === 1) {
    state = 0;
    cover.classList.remove("left");
    cover.classList.add("right");
    transitionHead.textContent = "Hello!";
    transitionBody.textContent = "Don't have an account?";
    transitionButton.textContent = "Sign Up";

    signNameInput.value = ``;
    signEmailInput.value = ``;
    signPasswordInput.value = ``;
  }
}

// Responsive code

const responsiveDiv = document.getElementById(`responsive-div`);
const signupWrapper = document.getElementById(`signIn-Wrapper`);
const responsiveLogin = document.getElementById(`responsive-login`);
const responsiveSignUp = document.getElementById(`responsive-sign`);

window.addEventListener(`resize`, () => {
  responsive();
});

function changeToLogin() {
  state = 0;
  responsiveLogin.classList.add(`active`);
  responsiveSignUp.classList.remove(`active`);
  signupWrapper.classList.add(`display-none`);
  loginWrapper.classList.remove(`display-none`);
}

responsiveLogin.addEventListener(`click`, changeToLogin);

responsiveSignUp.addEventListener(`click`, (e) => {
  state = 1;
  responsiveLogin.classList.remove(`active`);
  responsiveSignUp.classList.add(`active`);
  signupWrapper.classList.remove(`display-none`);
  loginWrapper.classList.add(`display-none`);
});

let res = false;
function responsive() {
  if (window.innerWidth <= 1200) {
    responsiveDiv.classList.remove(`display-none`);
    if (!res) {
      signupWrapper.classList.add(`display-none`);
      res = true;
    }
  } else {
    signupWrapper.classList.remove(`display-none`);
    loginWrapper.classList.remove(`display-none`);
    res = false;
  }
}

responsive();
