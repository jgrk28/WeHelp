async function signOut() {
    try {
      let response = await axios({
        method: "GET",
        url: "/signout",
      });
      if (response.status == 200) {
        window.location.href = "/";
      }
    } catch (error) {
      console.log(error.response);
    }
  }