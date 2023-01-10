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

const uploadForm = document.getElementById("uploadForm");

uploadForm.addEventListener("submit", (e) => {
  let file = document.getElementById("image-upload").files[0];
  let caption = document.getElementById("image-upload-caption").value;
  let messageElement = document.getElementById("uploadFormMessage");
  e.preventDefault();
  uploadImage(file, caption, messageElement);
});

async function uploadImage(file, caption, messageElement) {
  let fileBlob = await readFileToBlobAsync(file);

  const form = new FormData();
  form.append("image", fileBlob);
  form.append("caption", caption);

  try {
    messageElement.innerHTML = "Image uploading...";
    document.getElementById("image-upload").disabled = true;
    document.getElementById("image-upload-caption").disabled = true;
    document.getElementById("image-upload-btn").style.display = "none";

    let response = await axios({
      method: "POST",
      url: "/posts",
      data: form,
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.status == 200) {
      location.reload();
    }
  } catch (error) {
    console.log(error.response);
    if (error.response.data) {
      messageElement.classList.add("form-warning-msg");
      messageElement.innerHTML = error.response.data;
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

function likesText(likesNum) {
  let likesText = likesNum
  if (likesNum == 1) {
    likesText += " like"
  } else {
    likesText += " likes"
  }
  return likesText
}

async function toggleLike(likeButton) {
  let isLiked = likeButton.classList.contains("fa-solid") ? true : false;

  let likeDiv = likeButton.parentElement;
  let likesElement = likeDiv.querySelector(".likes-number");
  let likesNum = Number(likesElement.innerText.split(" ")[0]);

  let postDiv = likeDiv.parentElement;
  let imageElement = postDiv.querySelector(".post-image");
  let postId = imageElement.dataset.postid;

  if (isLiked) {
    // Unlike
    let url = "/posts/" + postId + "/like";
    try {
      let response = await axios({
        method: "DELETE",
        url: url,
      });
      if (response.status == 200) {
        likesNum -= 1;
        likeButton.classList.remove("fa-solid");
        likeButton.classList.add("fa-regular");
        likesElement.innerHTML = likesText(likesNum);
      }
    } catch(error) {
      console.log(error.response);
    }
    
  } else {
    // Like
    try {
      let url = "/posts/" + postId + "/like";
      let response = await axios({
        method: "POST",
        url: url,
      });
      if (response.status == 201) {
        likesNum += 1;
        likeButton.classList.remove("fa-regular");
        likeButton.classList.add("fa-solid");
        likesElement.innerHTML = likesText(likesNum);
      }
    } catch(error) {
      console.log(error.response);
    }
    
    
  }
}

async function displayImages() {
  try {
    let pageSize = 2;
    let response = await axios({
      method: "GET",
      url: imageAPI,
      params: {
        pageNum: currentPage,
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
      username.classList.add("post-username");
      let nameText = document.createTextNode(imageData.username);
      username.appendChild(nameText);
      username.onclick = function() {
        member(imageData.username);
      }
      newPost.appendChild(username);

      let image = document.createElement("img");
      image.classList.add("post-image");
      let postId = imageData.postid;
      image.setAttribute("data-postid", postId);

      let downloadingImage = new Image();
      downloadingImage.onload = (event) => {
        image.src = event.target.src;
      }
      downloadingImage.src = imageData.image;

      newPost.appendChild(image);

      let likesDiv = document.createElement("div");

      likesDiv.classList.add("post-likes");
      if (currentUser) {
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
      }
      let likes = document.createElement("p");
      likes.classList.add("likes-number");
      let likesNum = document.createTextNode(likesText(imageData.likes));
      likes.appendChild(likesNum);
      likesDiv.appendChild(likes);

      newPost.appendChild(likesDiv);

      if (imageData.caption != null) {
        let captionDiv = document.createElement("div");
        let caption = document.createElement("p");
        let captionText = document.createTextNode(imageData.caption);
        caption.appendChild(captionText);
        captionDiv.appendChild(username.cloneNode(true));
        captionDiv.appendChild(caption);
        captionDiv.classList.add("post-caption");
        newPost.appendChild(captionDiv);
      }

      mainFeed.appendChild(newPost);
    });
  } catch (error) {
    console.log(error.response);
  }
}

let currentPage = 1;
let isLastPage = false;
let currentUser = document.currentScript.getAttribute("username")
let imageAPI = "/posts"
displayImages();

function removeImages() {
  let mainFeed = document.getElementById("feed");
  while (mainFeed.firstChild) {
    mainFeed.removeChild(mainFeed.lastChild);
  }
}

function member() {
  if (arguments.length == 0) {
    username = currentUser
  } else {
    username = arguments[0]
  }
  removeImages();
  currentPage = 1;
  isLastPage = false;
  imageAPI = "/users/" + username + "/posts";
  displayImages();
}

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
