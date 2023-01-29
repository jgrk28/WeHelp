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
  let likesText = likesNum;
  if (likesNum == 1) {
    likesText += " like";
  } else {
    likesText += " likes";
  }
  return likesText;
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
    } catch (error) {
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
    } catch (error) {
      console.log(error.response);
    }
  }
}
