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
      username.onclick = function () {
        member(imageData.username);
      };
      newPost.appendChild(username);

      let image = document.createElement("img");
      image.classList.add("post-image");
      let postId = imageData.postid;
      image.setAttribute("data-postid", postId);

      let downloadingImage = new Image();
      downloadingImage.onload = (event) => {
        image.src = event.target.src;
      };
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
        heart.onclick = function () {
          toggleLike(this);
        };
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
let currentUser = document.currentScript.getAttribute("username");
let imageAPI = "/posts";
displayImages();

const handleInfiniteScroll = () => {
  const endOfPage =
    window.innerHeight + window.pageYOffset >= document.body.offsetHeight;

  if (endOfPage && !isLastPage) {
    console.log("call displayImages ---");
    currentPage++;
    displayImages();
  }
};

window.addEventListener("scroll", handleInfiniteScroll);
