
function openForm(formId) {
  document.getElementById(formId).style.display = 'block';
  document.getElementById("blur").style.display = "block";
}

function closeForm(formId) {
  document.getElementById(formId).style.display = "none";
  document.getElementById("blur").style.display = "none";
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
      "Please enter email and password.";
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
      window.location.href = "/member";
    }
  } catch (error) {
    console.log(error.response);
    if (error.response.data) {
      document.getElementById("signupFormMessage").innerHTML = error.response.data;
    }
  }
}