'use strict';
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

// Disable Right Click on screen:
window.addEventListener('contextmenu', (ev) => {
  ev.preventDefault();
});

function renderCell(pos, value) {
  var elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`);
  elCell.innerHTML = value;
}

// stop watch:
var timeBegan = null,
  timeStopped = null,
  stoppedDuration = 0,
  gTimer = null;
var time;

function startTimer() {
  if (timeBegan === null) {
    timeBegan = new Date();
  }

  if (timeStopped !== null) {
    stoppedDuration += new Date() - timeStopped;
  }
  // console.log(stoppedDuration);

  gTimer = setInterval(clockRunning, 10);
}

function clockRunning() {
  var currentTime = new Date(),
    timeElapsed = new Date(currentTime - timeBegan - stoppedDuration),
    min = timeElapsed.getUTCMinutes(),
    sec = timeElapsed.getUTCSeconds(),
    ms = timeElapsed.getUTCMilliseconds();
  time =
    (min > 9 ? min : '0' + min) +
    ' : ' +
    (sec > 9 ? sec : '0' + sec) +
    ' . ' +
    (ms > 99 ? ms : ms > 9 ? '0' + ms : '00' + ms);
  document.querySelector('.timer span').innerHTML = time;
}
