var shuffledSongList = shuffle([...dataSet]);

const player = new Plyr('#player');

const myAudio = document.getElementById("player");

const settingsButton = document.getElementById("settingsButton");

const playPauseButton = document.getElementById("playPauseButton");
const nextButton = document.getElementById("nextButton");

const overlayHelper = document.querySelector(".overlayHelper");
const background = document.querySelector("#background");

const settingsBackground = document.querySelector(".settings");

const answerNodes = document.querySelectorAll(".answerOption");

const pointsNode = document.querySelector("#points");
var points = 0;

var songCounter = 0;

var audio = document.getElementById("player");

var currentSongTime = document.querySelector(".currentTime");
var remainingSongDuration = document.querySelector(".remainingDuration");

var rightAnswer;
var singleSongData;

var startTime = 0;
var endTime = 0;
var resetTimer = true;

var isNextSong = true;

var guessedSongs = 0;

var additionalSongsAmount = 0;

var gameSettings = localStorage.getItem("customSettings") != null ? JSON.parse(localStorage.getItem("customSettings")) : settings;

var gameStarted = false;

var checkedCheckboxes = [];

var customAmount = false;
var songAmount = dataSet.length;
var expert = false;
var hideCover = false;
var randomStart = false;
var endless = false;
var autoplayNext = false;
var displayKanji = false;

//#Source https://bit.ly/2neWfJ2
const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
var isRepeatedSong = false;
var repeatedSongList = [];

// function to change out picture; gets called on every new song
function loadCoverImg(data) {
  document.querySelector(".albumImg").src = `${window.location.href}/assets/images/${data.img}`
}

// function to change out song; gets called on every new song
function loadSong(data) {
  document.querySelector("#player source").src = data.song;
  myAudio.load();
}

function togglePlay() {
  // make the first playButton press to start the game
  if (!gameStarted) {
    getGameSettings();
    if (hideCover) document.querySelector(".albumImg").classList.add("blurImage");
    if (expert) {
      // nly create a dropdownlist if we actually need it
      createAwesompleteList();

      // since we dont need the answerOptions in expert mode, we are hiding them
      document.querySelectorAll(".answerOption").forEach((item, i) => {
        item.classList.add("hide")
      });

      // we display he input box needed for expert mode again
      document.querySelector(".awesomplete").style.display = "inline-block";
      document.querySelector("#awesomplete").classList.remove("hide");
    }

    // when the user chooses a custom amount, only take that amound from the avaiable songs
    if (customAmount) {
      var numbersToRemove = document.getElementById("customAmountInput").value;
      shuffledSongList = shuffledSongList.splice(0, numbersToRemove);
      songAmount = shuffledSongList.length;
      document.getElementById("totalSongs").innerText = numbersToRemove;
    } else {
      document.getElementById("totalSongs").innerText = shuffledSongList.length;
    }

    // initiate the game by simulating a button click
    nextButton.click();
    gameStarted = true;
  } else {
    // once the next song is playing, start the timer for the points immendiately
    startPointsCounter();

    // either plays/pauses and changes the icon respectively
    if (myAudio.paused) {
      playPauseButton.classList.replace("fa-play", "fa-pause");
      // in case the user wants to have a random sample point, change the current time randomly
      // we have to wait till the metadata is loaded or else we try to access a null value
      if (randomStart) {
        myAudio.addEventListener("loadedmetadata", function() {
          let randomDuration = shuffle([...Array(Math.round(myAudio.duration) - 30).keys()]).pop()
          myAudio.currentTime = randomDuration;
        })
      }
      return myAudio.play();
    } else {
      playPauseButton.classList.replace("fa-pause", "fa-play");
      return myAudio.pause()
    }
  }
};

function getGameSettings() {
  let chosenGameSettings = [];
  // for each setting that user has checked,
  Array.from(getCheckedCheckboxes()).forEach((item, i) => {
    // we push all checkedCheckboxes into an array so later we can use
    // includes() to set the setting to either true/false
    chosenGameSettings.push(item.id)
    // as sth like gameSettings["displayKanji"] gives you access to the value and
    // the settingsID is the same name as the settings in data.js, we might as well set the boolean here
    gameSettings[item.id] = 1;
  });

  customAmount = chosenGameSettings.includes("customAmount");
  expert = chosenGameSettings.includes("expert");
  hideCover = chosenGameSettings.includes("hideCover");
  randomStart = chosenGameSettings.includes("randomStart");
  endless = chosenGameSettings.includes("endless");
  autoplayNext = chosenGameSettings.includes("autoplayNext");
  displayKanji = chosenGameSettings.includes("displayKanji");

  // for (var value in gameSettings) {
  //   if (chosenGameSettings.includes(value)) {
  //     gameSettings[value] = 1;
  //   }
  // }

  checkCustomAmountInputVisibility();
}

// either hide/show the custom amount input depending if the user checked the setting
function checkCustomAmountInputVisibility() {
  let customAmountInput = document.getElementById("customAmountInput")
  if (document.getElementById("customAmount").checked) {
    customAmountInput.classList.remove("hide")
  } else {
    customAmountInput.classList.add("hide")
  }
}

// NO IDEA HOW THIS WORKS; IT JUST DOES
function whichTransitionEvent() {
  let t,
    el = document.createElement("fakeelement");

  let transitions = {
    "transition": "transitionend",
    "OTransition": "oTransitionEnd",
    "MozTransition": "transitionend",
    "WebkitTransition": "webkitTransitionEnd"
  }

  for (t in transitions) {
    if (el.style[t] !== undefined) {
      return transitions[t];
    }
  }
}

let transitionEvent = whichTransitionEvent();

function transitionEndCallback(e) {
  overlayHelper.removeEventListener(transitionEvent, transitionEndCallback);
  overlayHelper.classList.remove('fadeOut');
}
// END NO IDEA HOW THIS WORKS; IT JUST DOES

function triggerOverlayHelper() {
  // add old background to overlayHelper
  overlayHelper.style.background = background.style.background;
  overlayHelper.classList.add("fadeOut");
  overlayHelper.addEventListener(transitionEvent, transitionEndCallback)
}

function transitionEndCallback(e) {
  overlayHelper.removeEventListener(transitionEvent, transitionEndCallback);
  overlayHelper.style.background = document.body.style.background;
  overlayHelper.classList.remove("fadeOut");
  togglePlay();
}

function generateAnswers(data) {
  let answerNodesText = document.querySelectorAll(".answerOption p");
  let answers = [];
  let shuffledSongListHelper = shuffle([...dataSet]);
  if (displayKanji) {
    answers.push(data.nameKanji)
    answers.push(shuffledSongListHelper[0].nameKanji);
    answers.push(shuffledSongListHelper[1].nameKanji);
    answers.push(shuffledSongListHelper[2].nameKanji);
  } else {
    answers.push(data.name)
    answers.push(shuffledSongListHelper[0].name);
    answers.push(shuffledSongListHelper[1].name);
    answers.push(shuffledSongListHelper[2].name);
  }

  // we need to shuffle the answers again or else the answer is always the first box
  answers = shuffle(answers);
  answerNodesText.forEach((item, i) => {
    item.innerText = answers.pop();
  });
}

function toggleSettings() {
  document.querySelector(".settings").classList.toggle("close");
}

// this is different from getGameSettings in the way that this fires right after site is loaded
// we do this in order to automatically copy the settings from last session
function loadSettings() {
  customAmount = gameSettings.customAmount;
  expert = gameSettings.expert;
  hideCover = gameSettings.hideCover;
  randomStart = gameSettings.randomStart;
  endless = gameSettings.endless;
  autoplayNext = gameSettings.autoplayNext;
  displayKanji = gameSettings.displayKanji;
  document.querySelectorAll(".setting input[type=checkbox]").forEach((item, i) => {
    if (gameSettings[item.id]) item.checked = true;
  });

  if (localStorage.getItem("customAmount") != "") {
    document.getElementById("customAmountInput").value = localStorage.getItem("customAmount");
  }

}

// save the settings into the local storage so settings are persisted in next session too
function saveSettingsToLocalStorage() {
  getGameSettings();
  let newSettings = {
    "customAmount": customAmount,
    "expert": expert,
    "hideCover": hideCover,
    "randomStart": randomStart,
    "endless": endless,
    "autoplayNext": autoplayNext,
    "displayKanji": displayKanji
  }

  localStorage.setItem('customSettings', JSON.stringify(newSettings));
  localStorage.setItem('customAmount', document.getElementById("customAmountInput").value);
}

// this basically loads every function possible, dont want to explain, hopefully function names work enough
function nextSong() {
  autoplayTimeoutFunctionClear();
  document.querySelector('#earnedPoints').classList.add("fadeOutFast");
  singleSongData = shuffledSongList.shift();
  rightAnswer = singleSongData;
  if (hideCover)  document.querySelector(".albumImg").classList.add("blurImage");
  triggerOverlayHelper();
  loadCoverImg(singleSongData);
  changeBGColor();
  addEventListenerToAnswers();
  loadSong(singleSongData);
  if (!expert) {
    generateAnswers(singleSongData);
  } else {
    document.getElementById("awesomplete").value = "";
    if (document.querySelector(".correctAnswer")) document.querySelector(".correctAnswer").remove();
  }
  toggleKillClick();
  resetTimer = true;
  isNextSong = true;
  document.getElementById("songCounter").innerText = ++songCounter;
  document.getElementById("nextButton").classList.add("kill-click");
}

function addEventListenerToAnswers() {
  answerNodes.forEach((item, i) => {
    item.addEventListener("click", validateAnswer);
    item.classList.remove("kill-click");
    item.classList.remove("fadeOutAnswer");
  });
}

var autoplayTimeout;

function validateAnswer() {
  endTime = Date.now();
  isNextSong = false;

  let rightAnswerChoice = "";
  // we need to trim the answers because for some reason JS cant compare strings properly
  let rightAnswerNormal = rightAnswer.name.trim()
  let rightAnswerKanji = rightAnswer.nameKanji.trim()
  if (expert) {
    let awesompleteEl = document.getElementById("awesomplete");
    awesompleteEl.blur()
    rightAnswerChoice = awesompleteEl.value.trim()
    let awesompleteUl = document.getElementById("awesomplete_list_1");
    awesompleteUl.insertAdjacentHTML("afterend",
      `<div class="correctAnswer center" style="flex-direction: column;">
        <p>The correct answer is:</p>
        <p><b>${rightAnswerNormal}</b> or <b>${rightAnswerKanji}</b></p>
       </div>`);
  } else {
    rightAnswerChoice = this.innerText.trim()
  }

  if (rightAnswerChoice == rightAnswerNormal || rightAnswerChoice == rightAnswerKanji) {
    let currentPoints = pointsNode.innerText;
    let calculateDurationPercentage = (1 - ((audio.duration - (endTime - startTime) / 1000) / audio.duration)) * 100;
    let score = Math.round(0.01 * Math.pow(calculateDurationPercentage - 100.5, 2));
    if (score > 100) score = 100;
    let hideCoverScore = hideCover ? 3 : 0;
    let randomStartScore = randomStart ? 5 : 0;
    let expertScore = expert ? score = score * 2 : score;
    let totalPoints = hideCoverScore + randomStartScore + expertScore;
    if (repeatedSongList.includes(rightAnswerNormal) || repeatedSongList.includes(rightAnswerKanji)) isRepeatedSong = true;
    // the more a song gets repeated, the less points you earn on next correct guess of that answer
    if (isRepeatedSong) totalPoints = Math.round(totalPoints * Math.pow(0.8, countOccurrences(repeatedSongList, rightAnswerNormal)));

    points += totalPoints;
    displayAdditionalPoints(totalPoints);
    animateValue("points", currentPoints, points, 500);
    guessedSongs++;
    isRepeatedSong = false
  } else if (endless) {
    shuffledSongList.push(singleSongData);
    repeatedSongList.push(rightAnswerNormal);
    repeatedSongList.push(rightAnswerKanji);
    songAmount++;
    additionalSongsAmount++;
    document.querySelector('#additionalSongs').innerText = ` (+${additionalSongsAmount})`;
  }
  if (hideCover) document.querySelector(".albumImg").classList.remove("blurImage");
  toggleKillClick();
  toggleRightAnswer();

  if (document.getElementById("songCounter").innerText == songAmount) {
    setTimeout(function() {
      displayWinner();
    }, 2000);
  } else {
    document.getElementById("nextButton").classList.remove("kill-click");
    if (autoplayNext) {
      autoplayTimeoutFunction();
    }
  }
}

function displayAdditionalPoints(totalPoints) {
  document.querySelector('#earnedPoints').classList.remove("fadeOutFast")
  document.querySelector('#earnedPoints').innerText = ` (+${totalPoints})`;
}

function autoplayTimeoutFunction() {
  autoplayTimeout = setTimeout(function() {
    nextSong();
  }, 2000);
}

function autoplayTimeoutFunctionClear() {
  clearTimeout(autoplayTimeout);
}

function displayWinner() {
  document.querySelectorAll(".answerOption").forEach((item, i) => {
    item.classList.add("hide");
  });

  if (expert) document.querySelector(".awesomplete").classList.add("hide");

  document.querySelector(".winnerScreen").innerHTML = `<p>Congratulations!</p>
  <p>You guessed <b>${guessedSongs}/${songAmount}</b> songs and</p>
  <p>earned <b>${document.querySelector("#points").innerText}</b> points!</p>
  `

  document.querySelector(".winnerScreen").classList.remove("hide");
  setTimeout(function() {
    document.querySelector(".winnerScreen").classList.add("fadeInFast");
  }, 50)

  document.querySelector('#earnedPoints').classList.add("fadeOutFast");
}

function toggleKillClick() {
  answerNodes.forEach((item, i) => {
    item.classList.add("kill-click");
    item.classList.add("fadeOutAnswer");
  });
}

function toggleRightAnswer() {
  let rightAnswerHelper = displayKanji ? rightAnswer.nameKanji.trim() : rightAnswer.name.trim()
  answerNodes.forEach((item, i) => {
    if (item.innerText.trim() == rightAnswerHelper) item.classList.remove("fadeOutAnswer");
  });
}

function startPointsCounter() {
  if (resetTimer) {
    startTime = Date.now();
    resetTimer = false;
  }
}

audio.addEventListener("playing", function() {
  if (isNextSong) {
    answerNodes.forEach((item, i) => {
      item.classList.remove("kill-click");
      item.classList.remove("fadeOutAnswer");
    });
    startPointsCounter()
  }
})

audio.addEventListener("timeupdate", function() {
  currentSongTime.innerHTML = formatTime(audio.currentTime);
  if (!isNaN(audio.duration)) {
    remainingSongDuration.innerHTML = `-${formatTime(audio.duration - audio.currentTime)}`
  }
})

function getCheckedCheckboxes() {
  return checkedCheckboxes = document.querySelectorAll("input[type=checkbox]:checked");
}

// HELPER FUNCTIONS

var awesompleteList = []
function createAwesompleteList() {
  for (item in dataSet) {
    awesompleteList.push(dataSet[item].name)
    awesompleteList.push(dataSet[item].nameKanji)
  }
}

var input = document.getElementById("awesomplete");
new Awesomplete(input, {
  list: awesompleteList
});

input.addEventListener("awesomplete-selectcomplete", function() {
  validateAnswer();
});

// https://stackoverflow.com/questions/4605342/how-to-format-html5-audios-currenttime-property-with-javascript
function formatTime(seconds) {
  minutes = Math.floor(seconds / 60);
  minutes = (minutes >= 10) ? minutes : "0" + minutes;
  seconds = Math.floor(seconds % 60);
  seconds = (seconds >= 10) ? seconds : "0" + seconds;
  return minutes + ":" + seconds;
}

// https://stackoverflow.com/questions/16994662/count-animation-from-number-a-to-b
function animateValue(id, start, end, duration) {
  // assumes integer values for start and end

  var obj = document.getElementById(id);
  var range = end - start;
  // no timer shorter than 50ms (not really visible any way)
  var minTimer = 50;
  // calc step time to show all interediate values
  var stepTime = Math.abs(Math.floor(duration / range));

  // never go below minTimer
  stepTime = Math.max(stepTime, minTimer);

  // get current time and calculate desired end time
  var startTime = new Date().getTime();
  var endTime = startTime + duration;
  var timer;

  function run() {
    var now = new Date().getTime();
    var remaining = Math.max((endTime - now) / duration, 0);
    var value = Math.round(end - (remaining * range));
    obj.innerHTML = value;
    if (value == end) {
      clearInterval(timer);
    }
  }

  timer = setInterval(run, stepTime);
  run();
}

//----------------- START COLOR THIEF -----------------------
const colorThief = new ColorThief();
const img = document.querySelector('.albumImg');
function changeBGColor() {
  var arr = [];
  // Make sure image is finished loading
  if (img.complete) {
    arr = colorThief.getPalette(img, 3)
    background.style.background = `linear-gradient(to bottom, rgba(${arr[0].toString()}),rgba(${arr[2].toString()}))`;
    settingsBackground.style.background = background.style.background;
  } else {
    img.addEventListener('load', function() {
      arr = colorThief.getPalette(img, 3)
      background.style.background = `linear-gradient(to bottom, rgba(${arr[0].toString()}),rgba(${arr[2].toString()}))`;
      settingsBackground.style.background = background.style.background;
    });
  }
}
//----------------- END COLOR THIEF -----------------------

//----------------- START THINGS TO DO ONCE DONE LOADING -----------------------
loadSettings();
checkCustomAmountInputVisibility();
changeBGColor();

let timestamp = Date.now();
document.getElementById("loadingScreenImg").src = `assets/icons/logoAnimated.svg?${timestamp}`;
// ** FADE OUT FUNCTION **
function fadeOut(el) {
  el.style.opacity = 1;
  (function fade() {
    if ((el.style.opacity -= .1) < 0) {
      el.style.display = "none";
    } else {
      requestAnimationFrame(fade);
    }
  })();
};
setTimeout(function() {
  fadeOut(document.getElementById("loadingScreen"))
  document.getElementById("loadingScreenImg").classList.add("hide")
}, 2500);
//----------------- END THINGS TO DO ONCE DONE LOADING -----------------------

//----------------- SERVICE WORKER STUFF -----------------------
window.addEventListener('load', main)

function main() {
  vaildateCacheIfOnline()
    .then(_ => {})
}

// if settings in the config.json have changed, then update the cache
function vaildateCacheIfOnline() {
  return new Promise((resolve, reject) => {
    fetch(`config.json?cacheBust=${new Date().getTime()}`)
      .then(response => {
        return response.json()
      })
      .then(config => {

        let installedVersion = Settings.getVersion()
        if (installedVersion == 0) {
          Settings.setVersion(config.version)
          return resolve();
        } else if (installedVersion != config.version) {
          console.log('Cache Version mismatch')
          fetch(`config.json?clean-cache=true&cacheBust=${new Date().getTime()}`).then(_ => {
            //actually cleans the cache
            Settings.setVersion(config.version);
            // localStorage.removeItem('dataCardSet');
            console.log("Old dataset removed. Reloading for new version.")
            window.location.reload();
            return resolve(); // unnecessary
          });

        } else {
          // already updated
          console.log('Cache Updated')
          return resolve();
        }
      }).catch(err => {
        console.log(err);
        return resolve();
        //handle offline here
      })
  })
}
//----------------- END SERVICE WORKER STUFF -----------------------
