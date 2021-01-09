const shuffledSongList = shuffle(dataSet);

const player = new Plyr('#player');

const myAudio = document.getElementById("player");

const playPauseButton = document.getElementById("playPauseButton");

const overlayHelper = document.querySelector(".overlayHelper");
const background = document.querySelector("#background");

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

function nextSong() {
  let singleSongData = shuffledSongList.pop();
  loadCoverImg(singleSongData);
  triggerOverlayHelper();
  changeBGColor();
  loadSong(singleSongData);
  //togglePlay();
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
