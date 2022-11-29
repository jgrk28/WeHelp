import * as menu from "./menu.js";

window.openForm = menu.openForm;
window.closeForm = menu.closeForm;
window.signOut = menu.signOut;
window.toggleLike = toggleLike;

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", (e) => {
  let username = document.getElementById("login-username").value;
  let password = document.getElementById("login-psw").value;
  let message = document.getElementById("loginFormMessage");
  message.classList.add("form-warning-msg");
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
  message.classList.add("form-warning-msg");
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
  let fileBlob = await readFileToBlobAsync(file);

  const form = new FormData();
  form.append("image", fileBlob);

  try {
    message.innerHTML = "Image uploading...";
    document.getElementById("image-upload").disabled = true;
    document.getElementById("image-upload-btn").style.display = "none";

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
      message.classList.add("form-warning-msg");
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
  });
}

function toggleLike(likeButton) {
  let isLiked = likeButton.classList.contains("fa-solid") ? true : false;

  let likeDiv = likeButton.parentElement;
  let likesElement = likeDiv.querySelector(".likes-number");
  let likes = Number(likesElement.innerText);

  if (isLiked) {
    // Unlike
    // todo: call api
    likes -= 1;
    likeButton.classList.remove("fa-solid");
    likeButton.classList.add("fa-regular");
    likesElement.innerHTML = likes;
  } else {
    // Like
    // todo: call api
    likes += 1;
    likeButton.classList.remove("fa-regular");
    likeButton.classList.add("fa-solid");
    likesElement.innerHTML = likes;
  }
}

async function displayImages(page) {
  try {
    let response = await axios({
      method: "GET",
      url: "/images",
      params: {
        page: page,
      },
    });
    response.data.forEach((imageData) => {
      let mainFeed = document.getElementById("feed");
      let newPost = document.createElement("div");
      newPost.classList.add("post-container");

      let username = document.createElement("p");
      let nameText = document.createTextNode(imageData.username);
      username.appendChild(nameText);
      newPost.appendChild(username);

      let image = document.createElement("img");
      image.src = imageData.image;
      image.classList.add("display-image");
      newPost.appendChild(image);

      let likesDiv = document.createElement("div");

      likesDiv.classList.add("likes");
      let heart = document.createElement("i");
      if (imageData.liked) {
        heart.classList.add("fa-solid");
        heart.classList.add("fa-heart");
      } else {
        heart.classList.add("fa-regular");
        heart.classList.add("fa-heart");
      }
      likesDiv.appendChild(heart);

      let likes = document.createElement("p");
      let likeNum = document.createTextNode(imageData.likes);
      likes.appendChild(likeNum);
      likesDiv.appendChild(likes);

      newPost.appendChild(likesDiv);

      mainFeed.appendChild(newPost);
    });
  } catch (error) {
    console.log(error.response);
  }
}

displayImages(1);
