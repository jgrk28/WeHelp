
function openForm() {
	document.getElementById('signinFormPopup').style.display = 'block';
	document.getElementById("blur").style.display = "block";
}

function closeForm() {
  document.getElementById("signinFormPopup").style.display = "none";
  document.getElementById("blur").style.display = "none";
}

const signinForm = document.getElementById("signinForm");

signinForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (validateSigninInput()) signIn();
});

function validateSigninInput() {
  let email = document.getElementById("email").value;
  let psw = document.getElementById("psw").value;
  if (!email || !psw) {
    document.getElementById("formMessage").innerHTML =
      "Please enter email and password.";
    return false;
  }
  return true;
}

async function signIn() {
  const body = {
    email: document.getElementById("email").value,
    psw: document.getElementById("psw").value,
  };
  try {
    let response = await axios({
      method: "POST",
      url: "/signin",
      data: body,
    });
    if (response.status == 200) {
      window.location.href = "/member";
    }
  } catch (error) {
    console.log(error.response);
    if (error.response.data) {
      document.getElementById("formMessage").innerHTML = error.response.data;
    }
  }
}