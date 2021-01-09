const shuffledSongList = shuffle(dataSet);

const player = new Plyr('#player');

const myAudio = document.getElementById("player");

const playPauseButton = document.getElementById("playPauseButton");

const overlayHelper = document.querySelector(".overlayHelper");
const background = document.querySelector("#background");

const answerNodes = document.querySelectorAll(".answerOption");

const pointsNode = document.querySelector("#points");
var points = 0;

var songCounter = 0;

var audio = document.getElementById("player");

var rightAnswer;

function getSongList() {
  let songList = [];
  shuffledSongList.forEach((item, i) => {
    songList.push(item.song)
  });
  return songList;
}

function loadCoverImg(data) {
  document.querySelector(".albumImg").src = `${window.location.href}/assets/images/${data.img}`
}

function loadSong(data) {
  document.querySelector("#player source").src = data.song;
  myAudio.load();
  // myAudio.play();
}

function togglePlay() {
  startPointsCounter();
  if (myAudio.paused) {
    playPauseButton.classList.replace("fa-play", "fa-pause");
    return myAudio.play();
  } else {
    playPauseButton.classList.replace("fa-pause", "fa-play");
    return myAudio.pause()
  }
};

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

function generateAnswers(data){
  let answerNodesText = document.querySelectorAll(".answerOption p");
  let answers = [];
  let shuffledSongListHelper = shuffle(shuffledSongList);
  answers.push(data.name)
  answers.push(shuffle(dataSet)[0].name);
  answers.push(shuffle(dataSet)[1].name);
  answers.push(shuffle(dataSet)[2].name);
  answers = shuffle(answers);
  answerNodesText.forEach((item, i) => {
    item.innerText = answers.pop();
  });

}

function nextSong() {
  let singleSongData = shuffledSongList.pop();
  rightAnswer = singleSongData;
  addEventListenerToAnswers();
  loadCoverImg(singleSongData);
  triggerOverlayHelper();
  changeBGColor();
  loadSong(singleSongData);
  generateAnswers(singleSongData);
  toggleKillClick();
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

function validateAnswer(){
  toggleKillClick();
  if (this.innerText == rightAnswer.name) {
    let currentPoints = pointsNode.innerText;
    points += 100;
    animateValue("points", currentPoints, points, 300);
  }
  // setTimeout(toggleRightAnswer, 1000)
  toggleRightAnswer();
  document.getElementById("nextButton").classList.remove("kill-click");
}

function toggleKillClick() {
  answerNodes.forEach((item, i) => {
    item.classList.add("kill-click");
    item.classList.add("fadeOutAnswer");
  });
}

function toggleRightAnswer() {
  answerNodes.forEach((item, i) => {
    if (item.innerText == rightAnswer.name)  {
      item.classList.remove("fadeOutAnswer")
    }
  });
}


function startPointsCounter(){

}

audio.addEventListener("playing", function() {
  answerNodes.forEach((item, i) => {
    item.classList.remove("kill-click");
    item.classList.remove("fadeOutAnswer");
  });
  console.log("playing")
  startPointsCounter()
})






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
  return Math.floor(Math.random() * (max - min +1)) + min;
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
  } else {
    img.addEventListener('load', function() {
      arr = colorThief.getPalette(img, 3)
      background.style.background = `linear-gradient(to bottom, rgba(${arr[0].toString()}),rgba(${arr[1].toString()}))`;
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


// dirty cheat to make the img and main part always same height
document.querySelector(".main").style.maxHeight = document.getElementsByClassName("albumImg")[0].height;
//----------------- END THINGS TO DO ONCE DONE LOADING -----------------------
