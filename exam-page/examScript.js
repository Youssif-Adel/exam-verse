// Some DOM elements that we will use in the program.
const nextButton = document.getElementById(`next-button`);
const previousButton = document.getElementById(`previous-button`);
const flagButton = document.getElementById(`flag-button`);
const logoutButton = document.getElementById(`logout-button`);
const submitButton = document.getElementById(`submit-button`);
const examTimerContainer = document.querySelector(`#exam-timer-container`);
const menuButton = document.getElementById(`menu-button`);
const menuButtonLabel = document.getElementById(`menu-button-label`);
const questionsContainer = document.getElementById(`questions-container`);

// Check if the user is logged in, If he isn't logged in then re-rout him to the login screen.
if (localStorage.getItem(`logged`) !== `true`) {
  window.location.href = `../login/index.html`;
}

class Exam {
  constructor() {
    this.maxQuestions = 30; // Used to set the max amount of questions the user is going to get.
    this.questionsArray = []; // The array for keeping the questions.
    this.maxTime = 10 * 60; // The max time the user is going to get to solve the questions (In seconds)
    this.showResult = this.checkIfFinished(); // Controls the current state of the page (Exam or show result)
    this.responsive = this.checkResponsive(); // Check if the user is in responsive mode

    this.currentQuestion = 1; // The current question the user is on.
    this.currentTime = this.maxTime; // The current time the user is on.
    this.score = 0; // the score of the user
    this.getScore(); // get the score of the user.
    this.menuOpened = false; // Check if the menu is opened or not ( Only in responsive )

    this.updateName(); // Updates the name of the user on the Page.
    this.updateImage();
    this.addEvents(); // Adds event listeners to most elements

    if (!this.showResult) {
      // Exam mode
      this.getQuestions(); // Retrieve the questions from the API
      this.updateTimer(); // Initial update of the timer
      this.timer = setInterval(() => this.updateTimer(), 1000); // Update the timer every 1000 ms
    } else {
      // Result mode
      this.displayScore();
      this.updateDom();
    }
  }

  updateName() {
    // Updates the name of the user in the top left of the page, Happens in both Result mode and Exam mode
    const nameElement = document.getElementById(`user-name`);
    nameElement.textContent = JSON.parse(localStorage.getItem(`user`))[`name`];
  }

  updateImage() {
    const image = JSON.parse(localStorage.getItem(`user`))[`image`];
    if (image !== `0`) {
      const userImageContainer =
        document.getElementById(`user-image-container`);
      userImageContainer.classList.remove(`no-image`);
      userImageContainer.innerHTML = `
      <img src="${image}">
      `;
    }
  }

  checkResponsive() {
    // Used to check if the user is in responsive mode or not, By checking if the innerWidth of the window is lower or equals `RESPONSIVE_WIDTH`
    const RESPONSIVE_WIDTH = 1300;

    if (innerWidth <= RESPONSIVE_WIDTH) {
      // If the user is in responsive mode, It will make the menu hidden and it'll return true.
      // The menu is hidden so it doesn't appear the second the user opens the page in responsive mode
      questionsContainer.classList.add(`menu-hidden`);
      return true;
    }
  }

  checkIfFinished() {
    // This method is used to check if the user has finished the exam and submitted it.
    // to check which mode the user is in ( Exam , Result )
    if (localStorage.getItem(`finished`) === `true`) {
      this.questionsArray = JSON.parse(localStorage.getItem(`questions`)); // get the questions from the local storage which contain the answer
      this.updateElements(); // Used to update the elements to Result mode
      return true;
    }
  }

  updateElements() {
    // Used to remove the unused elements like buttons when showing the results to the user, Also to add some new elements

    flagButton.classList.add(`display-none`); // Remove the flag button

    // Remove the timer
    examTimerContainer.querySelector(`h1`).classList.add(`display-none`);
    examTimerContainer
      .querySelector(`#exam-timer-contents`)
      .classList.add(`display-none`);

    submitButton.textContent = `Finish`; // Change the submit button to say Finish
    submitButton.classList.remove("disabled"); // Remove the class disabled from the submit button which lets us finish without needing to solve all the questions

    // Change the contents of the score container, and make it visible and centered
    examTimerContainer
      .querySelector(`#score-container`)
      .classList.remove(`display-none`);
    examTimerContainer.classList.add(`centered`);
  }

  getScore() {
    // This method is user to POST the score to the local storage or GET the score.
    if (!this.showResult) {
      //check the correct answers and calculate the score
      let score = this.questionsArray.reduce((previousValue, currentValue) => {
        let correct = currentValue[`userChoice`] === currentValue[`correct`];
        return previousValue + (correct ? 1 : 0);
      }, 0);

      localStorage.setItem(`score`, score);
    } else {
      // Get the score from the local storage
      this.score = Number(localStorage.getItem(`score`));
    }
  }

  displayScore() {
    // Only gets called in Result mode
    // Simply it displays the score which it gets from the local storage in the method "getScore", and displays it in the correct span
    const scoreSpan = document.getElementById(`score-span`);
    const totalScoreSpan = document.getElementById(`total-score-span`);

    totalScoreSpan.textContent = String(this.maxQuestions); // Update the total score
    scoreSpan.textContent = String(this.score); // Update the score

    // Color the score with green if it's bigger than totalScore / 2 and with red if it's lower
    if (this.score > this.questionsArray.length / 2) {
      scoreSpan.classList.add(`green-text`);
    } else {
      scoreSpan.classList.add(`red-text`);
    }
  }

  getQuestions() {
    // Fetch ALL the questions from the API
    fetch("./Questions.json")
      .then((request) => {
        return request.json();
      })
      .then((data) => {
        let allQuestions = data[`questions`];

        // Put only 'max questions' random questions in the question array
        for (let i = 0; i < this.maxQuestions; i++) {
          let rand = Math.floor(Math.random() * allQuestions.length);
          this.questionsArray.push({
            ...allQuestions[rand],
            userChoice: 0, // Add a new key to the question object called userChoice which contains the choice that the user chose
            flagged: false, // Add a new key to the question object called flagged which contains whether the question is flagged or not
          });
          allQuestions.splice(rand, 1); // remove the question from the list if it was placed in the questions array so it doesn't get repeated
        }
        this.updateDom(); // Update the dom with the questions we just retrieved
      });
  }

  updateDom() {
    // Update the DOM elements like the question, choices and the question numbers
    this.updateQuestionsNumber();
    this.updateQuestion();
  }

  updateQuestionsNumber() {
    // First we are getting the questions Container element and deleting everything that's inside it
    const questionsContainer = document.getElementById(
      `questions-number-container`,
    );
    questionsContainer.innerHTML = ``;

    // This for loop is used to make question-number divs inside the container.
    for (let i = 0; i < this.maxQuestions; i++) {
      let element = document.createElement(`div`); // Creating each div
      element.classList.add(`question-number`);

      // This if is used to give the class "active" to the div with the current question number
      if (i + 1 === this.currentQuestion) {
        // Check if the div it's creating right now has the same number as the question we are on
        element.classList.add(`active`); // If it does add the class active to it
        // This timeout function here is used to handle the scroll effect on the question number container
        // If the question number we are on right now == the current element in the loop it scrolls towards that element
        // We use a setTimeout so it waits for the elements to be added first to the DOM since we are adding the elements to the DOM at the end of this method
        // SO what happens is even if the delay we specify is 0 it always waits for the elements to be added THEN it scrolls towards the element.
        // Without the setTimeout function it won't work since it'll try to scroll to the element before it is created.
        setTimeout(function () {
          element.scrollIntoView({
            behavior: "smooth", // This makes the scrolling seem a little smooth by slowly scrolling towards the element
            block: "center", // Specify the position we want the element to be at when scrolling.
          });
        }, 0);
      }

      // Creating a p element and appending it to the div we just created.
      let paragraph = document.createElement(`p`);
      paragraph.textContent = String(i + 1);
      element.append(paragraph);

      // Creating another div that we append to the div we created, This div is used to handle the flagging process of the question number
      let flagDiv = document.createElement(`div`);
      flagDiv.classList.add(`not-flagged`); // Giving it an initial class of not-flagged
      flagDiv.innerHTML = `<i class="fa-solid fa-flag"></i>`; // adding the flag icon inside the div
      element.append(flagDiv);

      // If the user already chose an answer on that question, We add the class "solved" to the question number element
      if (this.questionsArray[i][`userChoice`]) {
        element.classList.add(`solved`);
      }

      // This block here is used to handle the flagging process of the question number.
      // First we check if we are in the Result mode or Exam mode since we don't want the flags to appear in the Result mode
      if (!this.showResult) {
        // Exam mode
        // We check if the question the loop on right now is flagged or not, That's done by checking the "flagged" property inside the questions array.
        if (this.questionsArray[i][`flagged`]) {
          // Question is flagged
          flagDiv.classList.remove(`not-flagged`); // We remove the "not-flagged" class
          if (i + 1 === this.currentQuestion) {
            // Also if the question the loop is on is the same question the user is on it gives the flag div a class called "flagged-active"
            // We do that to change the color of the flag if the question is active.
            flagDiv.classList.add(`flagged-active`);
            flagButton.classList.add(`active`); // We make the flag button active since the question is flagged
          }
          flagDiv.classList.add(`flagged`); // Giving the flag div a class called "flagged"
        } else {
          // Question isn't flagged
          // We remove the class "active" from the flag button to reset the button.
          if (i + 1 === this.currentQuestion) {
            flagButton.classList.remove(`active`);
          }
        }
      }

      // Handling the questions number in Result mode
      if (this.showResult) {
        // Result mode
        // This if is used to check if the question the loop is on ( i ) is answered correctly or no, By checking if the property "userChoice" inside the question object is..
        // .. equal to the correct answer
        if (
          this.questionsArray[i][`userChoice`] ===
          this.questionsArray[i][`correct`]
        ) {
          // Correct
          element.classList.add(`correct`);
        } else {
          // Wrong
          element.classList.add(`wrong`);
        }
      }

      // Adding an event listener to each question number element so when we click the number the question changes to that number
      element.addEventListener(`click`, () => {
        if (this.responsive) {
          // Responsive mode
          // this is so it closes the menu after we click on a question number then it changes the question to that number
          menuButton.checked = false;
          this.toggleMenu();
        }
        this.moveQuestion(i + 1); // Moves the question to the question number clicked.
      });

      // appending the question number element to the container.
      questionsContainer.append(element);
    }
  }

  addEvents() {
    // This method is used to add events to most of the elements

    // Adding a click event to the next button, so it goes to the next question when it is clicked.
    nextButton.addEventListener(`click`, () => {
      if (this.currentQuestion < this.maxQuestions) {
        // checking if there's more question we can move to before actually moving the question
        this.moveQuestion(this.currentQuestion + 1); // moving the question to the next question.
      }

      // We give the next button a class that's called clicked, so a small animation happens.
      // After the animation is complete the class is removed.
      nextButton.classList.add("clicked");
      setTimeout(() => {
        nextButton.classList.remove("clicked");
      }, 300);
    });

    // Adding a click event to the previous button, so it goes to the previous question when it is clicked.
    previousButton.addEventListener(`click`, () => {
      if (this.currentQuestion > 1) {
        // checking if there are questions we can move to
        this.moveQuestion(this.currentQuestion - 1); // moving the question to the previous question
      }

      // Same as the next button, we add a class called clicked to the button it a small animation happens.
      // We then remove the class after the animation is done.
      previousButton.classList.add("clicked");
      setTimeout(() => {
        previousButton.classList.remove("clicked");
      }, 300);
    });

    // Adding the ability to click "next" and "previous" using arrow keys
    window.addEventListener(`keyup`, (e) => {
      const key = e.key;
      if (key === `ArrowRight`) {
        if (this.currentQuestion < this.maxQuestions) {
          this.moveQuestion(this.currentQuestion + 1);
        }
      }

      if (key === `ArrowLeft`) {
        if (this.currentQuestion > 1) {
          this.moveQuestion(this.currentQuestion - 1);
        }
      }
    });

    // Checking if we are in Exam mode or Result mode
    if (!this.showResult) {
      // Exam mode

      // Adding event listens to each of the 4 choices
      const choicesElements = document.querySelectorAll(`.choice`); // This returns an HTML collection.
      choicesElements.forEach((currentElement) => {
        // Using forEach to loop over the 4 choice elements.
        currentElement.addEventListener(`click`, () => {
          // adding a click event.
          // When the user clicks on one of the choice elements, It adds the choice that element contains to the "userChoice" property inside the question object.
          this.questionsArray[this.currentQuestion - 1][`userChoice`] =
            currentElement.querySelector(`p`).textContent;

          // Check if all questions are answered, If they are, remove the disabled class from the submit button.
          // This happens each time the user clicks on one of the choices so the submit button activates automatically when the user answers all questions.
          const isAllQuestionsAnswered = this.questionsArray.reduce(
            (previousValue, currentValue) => {
              return previousValue && Boolean(currentValue[`userChoice`]);
            },
            true,
          );

          if (isAllQuestionsAnswered) {
            submitButton.classList.remove(`disabled`);
          }
          this.updateQuestion(); // Update the question and the choices
        });
      });

      // Adding the ability to choose using a, b, c and d on keyboard
      window.addEventListener(`keyup`, (e) => {
        const key = e.key;
        switch (key) {
          case `a`:
            choicesElements[0].click();
            break;
          case `b`:
            choicesElements[1].click();
            break;
          case `c`:
            choicesElements[2].click();
            break;
          case `d`:
            choicesElements[3].click();
            break;
        }
      });

      // Adding a click event to the flag button so when it is clicked we mark that question as "flagged".
      flagButton.addEventListener(`click`, () => {
        this.questionsArray[this.currentQuestion - 1][`flagged`] =
          !this.questionsArray[this.currentQuestion - 1][`flagged`];
        this.updateDom(); // We need to update the DOM after clicking the flag button so it adds the "active" class on the button in the flagged questions.
      });

      // Adding the ability to press the flag button using f on keyboard
      window.addEventListener(`keyup`, (e) => {
        const key = e.key;
        key === `f` ? flagButton.click() : null;
      });

      // Adding a click even to the submit button.
      submitButton.onclick = () => {
        this.submitTest();
      };
    }

    if (this.showResult) {
      // Result mode
      // Adding a click even to Finish (Submit) button.
      submitButton.onclick = () => {
        // When the finish button is clicked, we remove the finished property from local storage which lets us reset the program
        localStorage.removeItem(`finished`);
        // Then we re-rout the user to the get started page.
        window.location.href = `../get-started-page/getStartedPage.html`;
      };
    }

    // Adding a click event to the logout button.
    logoutButton.addEventListener("click", () => {
      // When the logout button is clicked it removes the logged property from local storage.
      localStorage.removeItem(`logged`);
      // then it re-routs the user to the login page.
      window.location.href = "../login/index.html";
    });

    // Adding a click event on the menu button (responsive)
    menuButton.onclick = () => {
      // Took us 3 hours to solve this bug (Functions are weird)
      this.toggleMenu();
    };

    // Adding a resize event listener to the window, so each time the window is resized the program can know if we are in responsive mode or not.
    window.addEventListener(`resize`, () => {
      this.responsive = this.checkResponsive(); // Making sure if we are in responsive mode or not
      if (this.responsive) {
        // Responsive mode.
        this.menuOpened = false;
        questionsContainer.classList.add(`menu-hidden`);
        questionsContainer.classList.remove(`menu-active`);
        questionsContainer.querySelector(`#submit-button`).style.visibility =
          `hidden`;
      } else {
        // Normal mode.
        questionsContainer.classList.remove(`menu-hidden`);
        questionsContainer.classList.remove(`menu-active`);
        questionsContainer.querySelector(`#submit-button`).style.visibility =
          `visible`;
      }
    });
  }

  toggleMenu() {
    // This method is used to toggle the menu in responsive mode
    // It changes between opened and closed.
    if (this.menuOpened) {
      this.menuOpened = false;
      questionsContainer.classList.add(`menu-hidden`);
      questionsContainer.classList.remove(`menu-active`);
      questionsContainer.querySelector(`#submit-button`).style.visibility =
        `hidden`;
    } else {
      this.menuOpened = true;
      questionsContainer.classList.add(`menu-active`);
      questionsContainer.classList.remove(`menu-hidden`);
      questionsContainer.querySelector(`#submit-button`).style.visibility =
        `visible`;
    }
  }

  moveQuestion(value) {
    // This method is used to move the question the user is on right now when the next or previous buttons are clicked or a question number is clicked.
    // It accepts one argument which is the value (Which question we are on right now)

    this.currentQuestion = value; // change the current question to be on that new value

    // Check if we are on the last question, If we are we disable the next button.
    if (this.currentQuestion === this.maxQuestions) {
      nextButton.classList.add(`disabled`);
    } else {
      // resetting the next button.
      nextButton.classList.remove(`disabled`);
    }

    // Check if we are on the first question, If we are we disable the previous button.
    if (this.currentQuestion === 1) {
      previousButton.classList.add(`disabled`);
    } else {
      // resetting the previous button.
      previousButton.classList.remove(`disabled`);
    }

    // We then update the DOM with the new question.
    this.updateDom();
  }

  updateQuestion() {
    // This method is used to update the question, and the choices

    const questionNumberElement = document // This is the h2 element the question number is written in
      .getElementById(`question-container`)
      .querySelector(`h2`);
    const questionElement = document // This is the p element the question is written in.
      .getElementById(`question-container`)
      .querySelector(`p`);
    const choicesElements = document.getElementsByClassName(`choice`); // This returns an HTMLCollection.

    // Changing the question number to be the question the user is on right now.
    questionNumberElement.textContent = `Question (${this.currentQuestion})`;
    // changing the text content of the question number element to be the question the user is on right now.
    questionElement.textContent =
      this.questionsArray[this.currentQuestion - 1]["question"];

    // Updating the choices inside each choice element.
    // We use destructuring to change the HTMLCollection into a normal array so we can use forEach to loop on each element.
    [...choicesElements].forEach((element, index) => {
      const choices = this.questionsArray[this.currentQuestion - 1][`choices`]; // Getting the choices array from the object ( THIS is an array )
      element.querySelector(`p`).textContent = choices[index]; // Updating the text content of the choice element to the choice in the array

      // this variable is true if the user chose this choice before.
      let choosed =
        element.querySelector(`p`).textContent ===
        this.questionsArray[this.currentQuestion - 1][`userChoice`];

      if (choosed) {
        // If the user chose that choice.
        if (!this.showResult) {
          // and we aren't in Result mode
          // we add a class called choosed to the choice element.
          element.classList.add(`choosed`);
        }
      } else {
        // resetting the element.
        element.classList.remove(`choosed`);
      }

      // Resetting the choices icons classes
      element
        .getElementsByClassName(`choices-icons`)[0]
        .classList.add(`display-none`);
      element
        .getElementsByClassName(`choices-icons`)[1]
        .classList.add(`display-none`);

      // Add the classes for the wrong and right choices
      if (this.showResult) {
        // Reset the elements' classes
        element.classList.remove(`correct`);
        element.classList.remove(`wrong`);
        if (
          element.querySelector(`p`).textContent ===
          this.questionsArray[this.currentQuestion - 1][`correct`]
        ) {
          element.classList.add(`correct`);
          element
            .getElementsByClassName(`choices-icons`)[0]
            .classList.remove(`display-none`);
        } else {
          if (choosed) {
            element.classList.add(`wrong`);
            element
              .getElementsByClassName(`choices-icons`)[1]
              .classList.remove(`display-none`);
          }
        }
      }
    });
  }

  updateTimer() {
    // This method is used to handle the formatting and displaying of the timer

    const timerElement = document.getElementById(`exam-time`);
    this.currentTime -= 1; // remove 1 second (since this gets called every second) from the timer
    const hours = Math.floor(this.currentTime / 3600); // get the hours
    const minutes = Math.floor((this.currentTime % 3600) / 60); // get the minutes
    const remainingSeconds = this.currentTime % 60; // get the seconds

    // format the time.
    // We have to check if each of the time elements is bigger than 10 so if it isn't we have to add 0 before it.
    let formattedTime = `${hours < 10 ? `0${hours}` : hours}:${
      minutes < 10 ? `0${minutes}` : minutes
    }:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
    timerElement.textContent = String(formattedTime);

    // check if the timer reached 0
    if (this.currentTime <= 0) {
      // set the "finished" property in the local storage to "time"
      localStorage.setItem(`finished`, `time`);
      // Re-rout the user to the finish page
      window.location.href = `../finish-page/finishPage.html`;
    }
  }

  submitTest() {
    // This method is used to handle the actions when the user clicks the submit button.

    // check if the user answered all the questions.
    const isAllQuestionsAnswered = this.questionsArray.reduce(
      (previousValue, currentValue) => {
        return previousValue && Boolean(currentValue[`userChoice`]);
      },
      true,
    );

    // store the questions in the local storage
    if (isAllQuestionsAnswered) {
      localStorage.setItem(`finished`, `true`);
      localStorage.setItem(`questions`, JSON.stringify(this.questionsArray));
      this.getScore();
      window.location.href = `../finish-page/finishPage.html`;
    }
  }
}

const exam = new Exam();
