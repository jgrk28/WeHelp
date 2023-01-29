const toggle = document.querySelector(".toggle");
const menu = document.querySelector(".menu");

function toggleMenu() {
  if (menu.classList.contains("active")) {
    menu.classList.remove("active");

    // adds the menu (hamburger) icon
    toggle.querySelector("a").innerHTML = '<i class="fa-solid fa-bars"></i>';
  } else {
    menu.classList.add("active");

    // adds the close (x) icon
    toggle.querySelector("a").innerHTML = '<i class="fa-solid fa-xmark"></i>';
  }
}

toggle.addEventListener("click", toggleMenu, false);

function openForm(formId) {
  document.getElementById(formId).style.display = "block";
  document.getElementById("blur").style.display = "block";
}

function closeForm(formId, messageId) {
  document.getElementById(formId).style.display = "none";
  document.getElementById("blur").style.display = "none";
  document.getElementById(messageId).innerHTML = "";
}

function validateLoginInput(username, password, message) {
  if (!username || !password) {
    message.innerHTML = "Please fill in all fields.";
    return false;
  }
  return true;
}

async function login(username, password, message) {
  const body = {
    username: username,
    password: password,
  };
  try {
    let response = await axios({
      method: "POST",
      url: "/login",
      data: body,
    });
    if (response.status == 200) {
      location.reload();
    }
  } catch (error) {
    console.log(error.response);
    if (error.response.data) {
      message.innerHTML = error.response.data;
    }
  }
}

function validateSignupInput(username, password, passwordConfirm, message) {
  if (!username || !password || !passwordConfirm) {
    message.innerHTML = "Please fill in all fields.";
    return false;
  }
  if (password != passwordConfirm) {
    message.innerHTML = "Passwords do not match.";
    return false;
  }
  return true;
}

async function signup(username, password, message) {
  const body = {
    username: username,
    password: password,
  };
  try {
    let response = await axios({
      method: "POST",
      url: "/signup",
      data: body,
    });
    if (response.status == 200) {
      location.reload();
    }
  } catch (error) {
    console.log(error.response);
    if (error.response.data) {
      message.innerHTML = error.response.data;
    }
  }
}

async function logOut() {
  try {
    let response = await axios({
      method: "GET",
      url: "/logout",
    });
    if (response.status == 200) {
      location.href = "/";
    }
  } catch (error) {
    console.log(error.response);
  }
}

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", (e) => {
  let username = document.getElementById("login-username").value;
  let password = document.getElementById("login-psw").value;
  let message = document.getElementById("loginFormMessage");
  message.classList.add("form-warning-msg");
  e.preventDefault();
  if (validateLoginInput(username, password, message)) {
    login(username, password, message);
  }
});

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", (e) => {
  let username = document.getElementById("signup-username").value;
  let password = document.getElementById("signup-psw").value;
  let passwordConfirm = document.getElementById("confirm-psw").value;
  let message = document.getElementById("signupFormMessage");
  message.classList.add("form-warning-msg");
  e.preventDefault();
  if (validateSignupInput(username, password, passwordConfirm, message)) {
    signup(username, password, message);
  }
});
