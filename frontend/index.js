
function openForm(formId) {
  document.getElementById(formId).style.display = "block";
  document.getElementById("blur").style.display = "block";
}

function closeForm(formId, messageId) {
  document.getElementById(formId).style.display = "none";
  document.getElementById("blur").style.display = "none";
  document.getElementById(messageId).innerHTML = "";
}

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (validateLoginInput()) login();
});

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (validateSignupInput()) signup();
});

function validateLoginInput() {
  let email = document.getElementById("login-email").value;
  let psw = document.getElementById("login-psw").value;
  if (!email || !psw) {
    document.getElementById("loginFormMessage").innerHTML =
      "Please fill in all fields.";
    return false;
  }
  return true;
}

function validateSignupInput() {
	let email = document.getElementById("signup-email").value;
	let psw = document.getElementById("signup-psw").value;
	let pswConfirm = document.getElementById("confirm-psw").value;

	if (!email || !psw || !pswConfirm) {
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

async function login() {
  const body = {
    email: document.getElementById("login-email").value,
    psw: document.getElementById("login-psw").value,
  };
  try {
    let response = await axios({
      method: "POST",
      url: "/login",
      data: body,
    });
    if (response.status == 200) {
      setCookie("sessionId", response.sessionId, 5);
      window.location.href = "/member";
    }
  } catch (error) {
    console.log(error.response);
    if (error.response.data) {
      document.getElementById("loginFormMessage").innerHTML = error.response.data;
    }
  }
}

async function signup() {
  const body = {
    email: document.getElementById("signup-email").value,
    psw: document.getElementById("signup-psw").value,
  };
  try {
    let response = await axios({
      method: "POST",
      url: "/signup",
      data: body,
    });
    if (response.status == 200) {
      setCookie("sessionId", response.sessionId, 5);
      window.location.href = "/member";
    }
  } catch (error) {
    console.log(error.response);
    if (error.response.data) {
      document.getElementById("signupFormMessage").innerHTML = error.response.data;
    }
  }
}

function setCookie(name, value, expDays) {
  const d = new Date();
  d.setTime(d.getTime() + (expDays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
  name += "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let cookies = decodedCookie.split(';');
  for(let i = 0; i <cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) == ' ') {
	    cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) == 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return "";
}