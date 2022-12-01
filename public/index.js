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

async function toggleLike(likeButton) {
  let isLiked = likeButton.classList.contains("fa-solid") ? true : false;

  let likeDiv = likeButton.parentElement;
  let likesElement = likeDiv.querySelector(".likes-number");
  let likes = Number(likesElement.innerText);

  let postDiv = likeDiv.parentElement;
  let imageElement = postDiv.querySelector(".display-image");
  let s3Key = imageElement.dataset.s3
  
  if (isLiked) {
    // Unlike
    let url = "/images/" + s3Key + "/like"
    try {
      let response = await axios({
        method: "DELETE",
        url: url,
      });
      if (response.status == 200) {
        likes -= 1;
        likeButton.classList.remove("fa-solid");
        likeButton.classList.add("fa-regular");
        likesElement.innerHTML = likes;
      }
    } catch(error) {
      console.log(error.response);
    }
    
  } else {
    // Like
    try {
      let url = "/images/" + s3Key + "/like"
      let response = await axios({
        method: "POST",
        url: url,
      });
      if (response.status == 201) {
        likes += 1;
        likeButton.classList.remove("fa-regular");
        likeButton.classList.add("fa-solid");
        likesElement.innerHTML = likes;
      }
    } catch(error) {
      console.log(error.response);
    }
    
    
  }
}

async function displayImages() {
  try {
    let pageSize = 10;
    let response = await axios({
      method: "GET",
      url: "/images",
      params: {
        page: currentPage,
        pageSize: pageSize,
      },
    });
    if (response.data.length < pageSize) {
      isLastPage = true;
    }
    response.data.forEach((imageData) => {
      let mainFeed = document.getElementById("feed");
      let newPost = document.createElement("div");
      newPost.classList.add("post-container");

      let username = document.createElement("p");
      let nameText = document.createTextNode(imageData.username);
      username.appendChild(nameText);
      newPost.appendChild(username);

      let image = document.createElement("img");
      image.classList.add("display-image");
      let s3Url = imageData.image.split("?")[0];
      let s3Key = s3Url.split("/").pop();
      image.setAttribute("data-s3", s3Key);

      let downloadingImage = new Image();
      downloadingImage.onload = (event) => {
        image.src = event.target.src;
      }
      downloadingImage.src = imageData.image;

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
      heart.onclick = function() {
        toggleLike(this);
      }
      likesDiv.appendChild(heart);

      let likes = document.createElement("p");
      likes.classList.add("likes-number");
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

let currentPage = 1;
let isLastPage = false;
displayImages();

window.addEventListener('scroll', () => {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight && !isLastPage) {
    currentPage++;
    displayImages();
  }
})
