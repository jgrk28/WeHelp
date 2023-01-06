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