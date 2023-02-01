let currentPage = 1;
let isLastPage = false;
let currentUser = document.currentScript.getAttribute("username");
let imageAPI = "/posts";
displayMemberImages();

async function displayMemberImages() {
  try {
    let pageSize = 12;
    let response = await axios({
      method: "GET",
      url: imageAPI,
      params: {
        username: currentUser,
        pageNum: currentPage,
        pageSize: pageSize,
      },
    });
    if (response.data.length < pageSize) {
      isLastPage = true;
    }

    let personalFeed = document.getElementById("member-feed");

    response.data.forEach((imageData) => {
      let imageContainer = document.createElement("div");
      imageContainer.classList.add("member-image-container");

      let image = document.createElement("img");
      image.classList.add("member-image");
      let postId = imageData.postid;
      image.setAttribute("data-postid", postId);

      let downloadingImage = new Image();
      downloadingImage.onload = (event) => {
        image.src = event.target.src;
      };
      downloadingImage.src = imageData.image;

      imageContainer.appendChild(image);

      personalFeed.appendChild(imageContainer);
    });
    
  } catch (error) {
    console.log(error.response);
  }
}

window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight && !isLastPage) {
    currentPage++;
    displayMemberImages();
  }
});
