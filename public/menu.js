const toggle = document.querySelector(".toggle");
const menu = document.querySelector(".menu");

function toggleMenu() {
  if (menu.classList.contains("active")) {
    menu.classList.remove("active");

    // adds the menu (hamburger) icon
    toggle.querySelector("a").innerHTML = '<i class="fas fa-bars"></i>';
  } else {
    menu.classList.add("active");

    // adds the close (x) icon
    toggle.querySelector("a").innerHTML = '<i class="fas fa-times"></i>';
  }
}

toggle.addEventListener("click", toggleMenu, false);

export function openForm(formId) {
  document.getElementById(formId).style.display = "block";
  document.getElementById("blur").style.display = "block";
}

export function closeForm(formId, messageId) {
  document.getElementById(formId).style.display = "none";
  document.getElementById("blur").style.display = "none";
  document.getElementById(messageId).innerHTML = "";
}

export function validateLoginInput() {
  let username = document.getElementById("login-username").value;
  let psw = document.getElementById("login-psw").value;
  if (!username || !psw) {
    document.getElementById("loginFormMessage").innerHTML =
      "Please fill in all fields.";
    return false;
  }
  return true;
}

export function validateSignupInput() {
  let username = document.getElementById("signup-username").value;
  let psw = document.getElementById("signup-psw").value;
  let pswConfirm = document.getElementById("confirm-psw").value;

  if (!username || !psw || !pswConfirm) {
    document.getElementById("signupFormMessage").innerHTML =
      "Please fill in all fields.";
    return false;
  }
  if (psw != pswConfirm) {
    document.getElementById("signupFormMessage").innerHTML =
      "Passwords do not match.";
    return false;
  }
  return true;
}

export async function login() {
  const body = {
    username: document.getElementById("login-username").value,
    password: document.getElementById("login-psw").value,
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
      document.getElementById("loginFormMessage").innerHTML =
        error.response.data;
    }
  }
}

export async function signup() {
  const body = {
    username: document.getElementById("signup-username").value,
    password: document.getElementById("signup-psw").value,
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
      document.getElementById("signupFormMessage").innerHTML =
        error.response.data;
    }
  }
}

export async function signOut() {
  try {
    let response = await axios({
      method: "GET",
      url: "/signout",
    });
    if (response.status == 200) {
      location.href = "/";
    }
  } catch (error) {
    console.log(error.response);
  }
}