import * as menu from "./menu.js";

window.openForm = menu.openForm
window.closeForm = menu.closeForm
window.signOut = menu.signOut

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", (e) => {
  let username = document.getElementById("login-username").value;
  let password = document.getElementById("login-psw").value;
  let message = document.getElementById("loginFormMessage");
  e.preventDefault();
  if (menu.validateLoginInput(username, password, message)) {
    menu.login(username, password, message);
  }
});

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", (e) => {
  let username = document.getElementById("signup-username").value;
  let password = document.getElementById("signup-psw").value;
  let passwordConfirm = document.getElementById("confirm-psw").value;
  let message = document.getElementById("signupFormMessage");
  e.preventDefault();
  if (menu.validateSignupInput(username, password, passwordConfirm, message)) {
    menu.signup(username, password, message);
  }
});

const uploadForm = document.getElementById("uploadForm");

uploadForm.addEventListener("submit", (e) => {
  let file = document.getElementById("image-upload").files[0];
  let message = document.getElementById("uploadFormMessage");
  e.preventDefault();
  uploadImage(file, message);
});

async function uploadImage(file, message) {
  let fileBlob = await readFileToBlobAsync(file)

  const form = new FormData();
  form.append('file', fileBlob, file.name);

  try {
    let response = await axios({
      method: "POST",
      url: "/image",
      data: form,
      headers: { "Content-Type": "multipart/form-data" },
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

function readFileToBlobAsync(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      resolve(new Blob([reader.result]));
    };

    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  })
}
