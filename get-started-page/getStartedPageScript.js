const nameElements = document.getElementsByClassName(`name-text`);
const startButton = document.getElementById(`start-button`);
const leftSideContainer = document.getElementById(`left-side-container`);
const rightSideContainer = document.getElementById(`right-side-container`);
const imageContainer = document.getElementById(`image-container`);

const imageDiv = document.getElementById(`image-div`);
const imageInput = document.getElementById(`image-input`);
const imageElement = document.getElementById(`image`);
const confirmButton = document.getElementById(`image-confirm`);
const skipButton = document.getElementById(`image-skip`);

let imageUrl;
// check if logged in
if (localStorage.getItem(`logged`) !== `true`) {
  window.location.href = `../login/index.html`;
}

const user = JSON.parse(localStorage.getItem(`user`));

[...nameElements].forEach((element) => {
  element.textContent = user[`name`];
});

startButton.onclick = () => {
  window.location.href = "../exam-page/examPage.html";
};

function updateDOM() {
  if (user[`image`] == null) {
    leftSideContainer.classList.add(`display-none`);
    rightSideContainer.classList.add(`display-none`);
    imageContainer.classList.remove(`display-none`);
  } else {
    leftSideContainer.classList.remove(`display-none`);
    rightSideContainer.classList.remove(`display-none`);
    imageContainer.classList.add(`display-none`);
  }
}

updateDOM();

imageDiv.addEventListener(`click`, () => {
  imageInput.click();
});

imageInput.addEventListener(`change`, () => {
  let imageFile = imageInput.files[0];

  const reader = new FileReader();

  reader.onload = function (event) {
    imageUrl = event.target.result;
    imageElement.src = imageUrl;
  };
  reader.readAsDataURL(imageFile);

  imageElement.classList.remove(`display-none`);
  confirmButton.classList.remove(`disabled`);
  confirmButton.disabled = false;
  imageDiv.classList.remove(`no-image`);
});

confirmButton.addEventListener(`click`, () => {
  localStorage.setItem(
    `user`,
    JSON.stringify({
      ...user,
      image: imageUrl,
    }),
  );
  window.location.href = `getStartedPage.html`;
});

skipButton.addEventListener(`click`, () => {
  console.log("test");
  localStorage.setItem(
    `user`,
    JSON.stringify({
      ...user,
      image: `0`,
    }),
  );
  window.location.href = `getStartedPage.html`;
});
