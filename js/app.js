var shuffledSongList = shuffle(dataSet);

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


function loadCoverImg(data) {
  // if (hideCover) {
  //   document.querySelector(".albumImg").classList.add("blurImage")
  // }
  document.querySelector(".albumImg").src = `${window.location.href}/assets/images/${data.img}`
}

function loadSong(data) {
  document.querySelector("#player source").src = data.song;
  myAudio.load();
  // myAudio.play();
}

function togglePlay() {
  //make the first playButton press to start the game
  if (!gameStarted) {
    getGameSettings();
    if (hideCover) {
      document.querySelector(".albumImg").classList.add("blurImage")
    }
    if (customAmount) {
      var numbersToRemove = document.getElementById("customAmountInput").value;
      shuffledSongList = shuffledSongList.splice(0, numbersToRemove);
      songAmount = shuffledSongList.length;
      document.getElementById("totalSongs").innerText = numbersToRemove;
    } else {
      document.getElementById("totalSongs").innerText = shuffledSongList.length;
    }
    nextButton.click();
    gameStarted = true;

  } else {
    startPointsCounter();
    if (myAudio.paused) {
      playPauseButton.classList.replace("fa-play", "fa-pause");
      myAudio.addEventListener("loadedmetadata", function() {
        if (randomStart) {
          let randomDuration = shuffle([...Array(Math.round(myAudio.duration) - 30).keys()]).pop()
          myAudio.currentTime = randomDuration;
        }
      })
      return myAudio.play();
    } else {
      playPauseButton.classList.replace("fa-pause", "fa-play");
      return myAudio.pause()
    }

  }
};

function getGameSettings() {
  let chosenGameSettings = [];
  Array.from(getCheckedCheckboxes()).forEach((item, i) => {
    chosenGameSettings.push(item.id)
  });

  customAmount = chosenGameSettings.includes("customAmount");
  expert = chosenGameSettings.includes("expert");
  hideCover = chosenGameSettings.includes("hideCover");
  randomStart = chosenGameSettings.includes("randomStart");
  endless = chosenGameSettings.includes("endless");
  autoplayNext = chosenGameSettings.includes("autoplayNext");
  displayKanji = chosenGameSettings.includes("displayKanji");

  for (var value in gameSettings) {
    if (chosenGameSettings.includes(value)) {
      gameSettings[value] = 1;
    }
  }

  checkCustomAmountInputVisibility();
}

function checkCustomAmountInputVisibility() {
  let customAmountInput = document.getElementById("customAmountInput")
  if (document.getElementById("customAmount").checked) {
    customAmountInput.classList.remove("hide")
  } else {
    customAmountInput.classList.add("hide")
  }
}

// NO IDEA HOW THIS WORKS; IT JUST DOES
whichTransitionEvent = () => {
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

transitionEndCallback = (e) => {
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

function toggleFadeClass() {
  // fadeOut the overlayHelper background to show the new background
  overlayHelper.classList.add("fadeOut");
  overlayHelper.addEventListener(transitionEvent, transitionEndCallback)
}

transitionEndCallback = (e) => {
  overlayHelper.removeEventListener(transitionEvent, transitionEndCallback);
  overlayHelper.style.background = document.body.style.background;
  overlayHelper.classList.remove("fadeOut");
  togglePlay();
}

function triggerOverlayHelper() {
  // add old background to overlayHelper
  overlayHelper.style.background = background.style.background;
  toggleFadeClass();
}

function generateAnswers(data) {
  let answerNodesText = document.querySelectorAll(".answerOption p");
  let answers = [];
  let shuffledSongListHelper = shuffle(shuffledSongList);
  if (displayKanji) {
    answers.push(data.nameKanji)
    answers.push(shuffle(dataSet)[0].nameKanji);
    answers.push(shuffle(dataSet)[1].nameKanji);
    answers.push(shuffle(dataSet)[2].nameKanji);
  } else {
    answers.push(data.name)
    answers.push(shuffle(dataSet)[0].name);
    answers.push(shuffle(dataSet)[1].name);
    answers.push(shuffle(dataSet)[2].name);
  }

  answers = shuffle(answers);
  answerNodesText.forEach((item, i) => {
    item.innerText = answers.pop();
  });

}

function toggleSettings() {
  document.querySelector(".settings").classList.toggle("close");
}

function loadSettings() {
  customAmount = gameSettings.customAmount;
  expert = gameSettings.expert;
  hideCover = gameSettings.hideCover;
  randomStart = gameSettings.randomStart;
  endless = gameSettings.endless;
  autoplayNext = gameSettings.autoplayNext;
  displayKanji = gameSettings.displayKanji;
  document.querySelectorAll(".setting input[type=checkbox]").forEach((item, i) => {
    if (gameSettings[item.id]) {
      item.checked = true
    }
  });

  if (localStorage.getItem("customAmount") != "") {
    document.getElementById("customAmountInput").value = localStorage.getItem("customAmount")
  }

}

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

function nextSong() {
  autoplayTimeoutFunctionClear();
  if (hideCover) {
    document.querySelector(".albumImg").classList.add("blurImage")
  }
  document.querySelector('#earnedPoints').classList.add("fadeOutFast");
  singleSongData = shuffledSongList.shift();
  rightAnswer = singleSongData;
  addEventListenerToAnswers();
  loadCoverImg(singleSongData);
  triggerOverlayHelper();
  changeBGColor();
  loadSong(singleSongData);
  generateAnswers(singleSongData);
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

  let rightAnswerHelper = displayKanji ? rightAnswer.nameKanji.trim() : rightAnswer.name.trim()

  if (this.innerText.trim() == rightAnswerHelper) {
    let currentPoints = pointsNode.innerText;
    let calculateDurationPercentage = (1 - ((audio.duration - (endTime - startTime) / 1000) / audio.duration)) * 100;

    let score = Math.round(0.01 * Math.pow(calculateDurationPercentage - 100.5, 2));
    if (score > 100) score = 100;
    let hideCoverScore = hideCover ? 3 : 0;
    let randomStartScore = randomStart ? 5 : 0;
    let expertScore = expert ? score = score * 2 : score;
    // let endlessScore = isRepeatedSong ? Math.round(score * 0.8) : 0;
    let totalPoints = hideCoverScore + randomStartScore + expertScore;
    if (repeatedSongList.includes(rightAnswerHelper)) {
      isRepeatedSong = true
      console.log("repeated")
      console.log(Math.round(totalPoints * Math.pow(0.8, countOccurrences(repeatedSongList, rightAnswerHelper))))
    }

    if (isRepeatedSong) {
      totalPoints = Math.round(totalPoints * Math.pow(0.8, countOccurrences(repeatedSongList, rightAnswerHelper)))
    }

    points += totalPoints;
    displayAdditionalPoints(totalPoints);
    animateValue("points", currentPoints, points, 500);
    guessedSongs++;
    isRepeatedSong = false
  } else if (endless) {
    shuffledSongList.push(singleSongData);
    repeatedSongList.push(rightAnswerHelper);
    songAmount++;
    additionalSongsAmount++;
    document.querySelector('#additionalSongs').innerText = ` (+${additionalSongsAmount})`;
  }
  toggleKillClick();
  toggleRightAnswer();
  if (hideCover) {
    document.querySelector(".albumImg").classList.remove("blurImage")
  }

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

  document.querySelector(".winnerScreen").innerHTML = `<p>Congratulations!</p>
  <p>You guessed <b>${guessedSongs}/${songAmount}</b> songs and</p>
  <p>earned <b>${document.querySelector("#points").innerText}</b> points!</p>
  `

  document.querySelector(".winnerScreen").classList.remove("hide");
  setTimeout(function() {
    document.querySelector(".winnerScreen").classList.add("fadeInFast");
  }, 50)
  // document.querySelector(".winnerScreen").classList.add("fadeIn");

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
    if (item.innerText.trim() == rightAnswerHelper) {
      item.classList.remove("fadeOutAnswer")
    }
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




function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}








//----------------- START COLOR THIEF -----------------------
const colorThief = new ColorThief();
const img = document.querySelector('img');

function changeBGColor() {
  var arr = [];
  // Make sure image is finished loading
  if (img.complete) {
    arr = colorThief.getPalette(img, 3)
    background.style.background = `linear-gradient(to bottom, rgba(${arr[0].toString()}),rgba(${arr[1].toString()}))`;
    settingsBackground.style.background = background.style.background;
  } else {
    img.addEventListener('load', function() {
      arr = colorThief.getPalette(img, 3)
      background.style.background = `linear-gradient(to bottom, rgba(${arr[0].toString()}),rgba(${arr[1].toString()}))`;
      settingsBackground.style.background = background.style.background;
    });
  }
}
//----------------- END COLOR THIEF -----------------------

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
          // document.querySelector('#version').innerHTML= `version ${config.version}`;
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
          // document.querySelector('#version').innerHTML= `version ${installedVersion}`;
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


//----------------- START THINGS TO DO ONCE DONE LOADING -----------------------
changeBGColor();
loadSettings();
checkCustomAmountInputVisibility();


// dirty cheat to make the img and main part always same height
document.querySelector(".main").style.maxHeight = document.getElementsByClassName("albumImg")[0].height;
//----------------- END THINGS TO DO ONCE DONE LOADING -----------------------
