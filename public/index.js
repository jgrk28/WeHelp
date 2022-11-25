import * as menu from "./menu.js";

window.openForm = menu.openForm
window.closeForm = menu.closeForm
window.signOut = menu.signOut

const loginForm = document.getElementById("loginForm");
  
loginForm.addEventListener("submit", (e) => {
e.preventDefault();
if (menu.validateLoginInput()) menu.login();
});

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", (e) => {
e.preventDefault();
if (menu.validateSignupInput()) menu.signup();
});