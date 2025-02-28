const score = Number(localStorage.getItem(`score`));
const questionsArray = JSON.parse(localStorage.getItem(`questions`));
const scoreSpan = document.getElementById(`score-span`);
const totalScoreSpan = document.getElementById(`total-score-span`);
const checkResultButton = document.getElementById(`check-results-button`);
const retakeTestButton = document.getElementsByClassName(`retake-test-button`);
const userNameElement = document.getElementById(`user-name`);
const logoutButton = document.getElementById(`logout-button`);

userNameElement.textContent = JSON.parse(localStorage.getItem(`user`)).name;

const image = JSON.parse(localStorage.getItem(`user`))[`image`];
if (image !== `0`) {
  const userImageContainer = document.getElementById(`user-image-container`);
  userImageContainer.classList.remove(`no-image`);
  userImageContainer.innerHTML = `
      <img src="${image}">
      `;
}

if (localStorage.getItem(`finished`) === `true`) {
  console.log("test");
  scoreSpan.textContent = String(score);
  totalScoreSpan.textContent = String(questionsArray.length);

  scoreSpan.classList.remove(`green-text`);
  scoreSpan.classList.remove(`red-text`);
  score > questionsArray.length / 2
    ? scoreSpan.classList.add(`green-text`)
    : scoreSpan.classList.add(`red-text`);

  checkResultButton.onclick = () => {
    window.location.href = "../exam-page/examPage.html";
  };
} else if (localStorage.getItem(`finished`) === `time`) {
  // Time out
  document.getElementById(`finished-wrapper`).classList.add(`display-none`);
  document.getElementById(`time-wrapper`).classList.remove(`display-none`);
} else {
  window.location.href = "../get-started-page/getStartedPage.html";
}

[...retakeTestButton].forEach((button) => {
  button.onclick = () => {
    localStorage.removeItem(`finished`);
    window.location.href = "../exam-page/examPage.html";
  };
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem(`logged`);
  window.location.href = "../login/index.html";
});
