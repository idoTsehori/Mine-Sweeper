'use strict';
// Game Elemets:
const EMPTY_CELL = '';
const gMine_logo = '💣';
const LIVE_LOGO = '&#10084;&#65039;';
const gFlag_logo = '🚩';

// The BOARD MODEL:
var gBoard;
// Game Details:
var gGame;
// Level Details:
var gLevel;

var gMinesLeftOnBoard;
var gShownHintPos = [];
var gElMarkedHint = null;

function onInitGame(levelName, boardSize, minesNum, livesCount) {
  gLevel = {
    SIZE: boardSize,
    MINES: minesNum,
    levelName: levelName,
  };
  gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: livesCount,
    didntClickedYet: true,
  };

  gBoard = builtBoard(gLevel.SIZE);
  renderBoard(gBoard);
  renderLivesCount(gGame.lives);
  setMinesLeftOnBoard(levelName);
  updateMinesLeft(0);
  changeEmoji('😀');
  showHintsOnInit();
  clearTimer();
  console.log(time);
}

function restartGame(elSmileBtn) {
  if (gLevel.levelName === 'easy') var livesCount = 2;
  else var livesCount = 3;
  onInitGame(gLevel.levelName, gLevel.SIZE, gLevel.MINES, livesCount);
}

function renderLivesCount(livesCount) {
  var elLives = document.querySelector('.lives');
  elLives.innerHTML = LIVE_LOGO.repeat(livesCount);
}

function builtBoard(boardSize) {
  var board = [];
  for (var i = 0; i < boardSize; i++) {
    board[i] = [];
    for (var j = 0; j < boardSize; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
    }
  }
  return board;
}

function renderBoard(board) {
  var strHTML = '';
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>\n';
    for (var j = 0; j < board.length; j++) {
      strHTML += `<td class="cell cell-${gLevel.levelName} cell-${i}-${j}" onclick="onCellClick(this,${i},${j})" ; oncontextmenu="onRightClickOnCell(this,${i},${j})">${EMPTY_CELL}</td>\n`;
    }
    strHTML += '</tr>\n';
  }
  var elBoard = document.querySelector('.board');
  elBoard.innerHTML = strHTML;
}

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      var minesNegsCount = countMinesAround(board, i, j);
      //   If there's mines around => set it
      if (minesNegsCount) gBoard[i][j].minesAroundCount = minesNegsCount;
    }
  }
}

function countMinesAround(board, cellI, cellJ) {
  var count = 0;
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue;
      if (j < 0 || j >= board.length) continue;
      var currCell = board[i][j];
      if (currCell.isMine) count++;
    }
  }
  return count;
}

function onCellClick(elCell, i, j) {
  if (gGame.didntClickedYet) {
    handleFirstCellClick(i, j);
    showCell(elCell, i, j);
    return;
  }
  if (!gGame.isOn) return;
  var currCell = gBoard[i][j];
  if (currCell.isMarked || currCell.isShown) return;
  if (gElMarkedHint) showHints(i, j);
  else if (currCell.isMine) onMineCellClick(elCell, i, j);
  else if (currCell.minesAroundCount === 0) expandShown(gBoard, i, j);
  else showCell(elCell, i, j);

  // After any click check if the game is over:
  checkGameOver();
}

function showCell(elCell, i, j) {
  changeEmoji('😀');
  //   Model
  var currCell = gBoard[i][j];
  currCell.isShown = true;
  gGame.shownCount++;
  //   Dom
  elCell.innerText = currCell.minesAroundCount ? currCell.minesAroundCount : EMPTY_CELL;
  // number color
  switch (currCell.minesAroundCount) {
    case 1:
      elCell.style.color = 'blue';
      break;
    case 2:
      elCell.style.color = 'green';
      break;
    case 3:
      elCell.style.color = 'purple';
      break;
    default:
      elCell.style.color = 'black';
  }
  elCell.classList.add('regular-cell');
}

function putMinesinRandomPos(board, minesNum, cellI, cellJ) {
  var minesCount = 0;
  while (minesCount < minesNum) {
    var randomI = getRandomInt(0, board.length);
    var randomJ = getRandomInt(0, board.length);
    if (board[randomI][randomJ].isMine) continue;
    // first click position cant be a mine:
    if (randomI === cellI && randomJ === cellJ) continue;
    board[randomI][randomJ].isMine = true;
    minesCount++;
  }
}

function handleFirstCellClick(cellI, cellJ) {
  gGame.didntClickedYet = false;
  gGame.isOn = true;
  putMinesinRandomPos(gBoard, gLevel.MINES, cellI, cellJ);
  setMinesNegsCount(gBoard);
  startTimer();
}

function onMineCellClick(elCell, i, j) {
  changeEmoji('🤯');
  // Model
  var currCell = gBoard[i][j];
  currCell.isShown = true;
  // gGame.shownCount++;
  gGame.markedCount++;
  gGame.lives--;
  // Dom
  elCell.innerText = gMine_logo;
  elCell.classList.add('mine-cell');
  var elLives = document.querySelector('.lives');
  elLives.innerHTML = LIVE_LOGO.repeat(gGame.lives);
  //

  updateMinesLeft(1);
  if (!gGame.lives) lostGame(elLives);
  // else checkGameOver();
}

function lostGame(elLives) {
  gGame.isOn = false;
  elLives.innerHTML = '☠ ☠ ☠';
  // Show all the Mines:
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      var currCell = gBoard[i][j];
      if (currCell.isMine) {
        // Dom
        var elCell = document.querySelector(`.cell-${i}-${j}`);
        elCell.innerText = gMine_logo;
        elCell.classList.add('mine-cell');
      }
    }
  }
  clearInterval(gTimer);
  changeEmoji('😱');
}

function expandShown(board, cellI, cellJ) {
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= board[0].length) continue;
      var currCell = board[i][j];
      var elCell = document.querySelector(`.cell-${i}-${j}`);
      if (currCell.isShown) continue;
      if (!currCell.minesAroundCount) {
        showCell(elCell, i, j);
        // Recursive Expand:
        expandShown(board, i, j);
      } else {
        showCell(elCell, i, j);
      }
    }
  }
}

function onRightClickOnCell(elCell, cellI, cellJ) {
  // If game over, cant mark or unmark the board:
  if (!gGame.isOn) return;

  var currCell = gBoard[cellI][cellJ];
  // Marking:
  if (elCell.innerHTML === EMPTY_CELL) flagCell(elCell, currCell);
  // Unmarking:
  else if (elCell.innerHTML === gFlag_logo) unFlagCell(elCell, currCell);
}

function flagCell(elCell, currCell) {
  // Model
  currCell.isMarked = true;
  if (currCell.isMine) gGame.markedCount++;

  // Dom
  elCell.innerHTML = gFlag_logo;
  checkGameOver();
  console.log('gGame.shownCount', gGame.shownCount);
  console.log('gGame.markedCount', gGame.markedCount);
}

function unFlagCell(elCell, currCell) {
  // Model
  currCell.isMarked = false;
  if (currCell.isMine) gGame.markedCount--;
  // Dom
  elCell.innerHTML = EMPTY_CELL;
  console.log('gGame.shownCount', gGame.shownCount);
  console.log('gGame.markedCount', gGame.markedCount);
}

function checkGameOver() {
  var gameCellCount = gLevel.SIZE ** 2;
  if (gGame.markedCount === gLevel.MINES && gGame.shownCount === gameCellCount - gLevel.MINES) {
    victory();
  }
}

function victory() {
  gGame.isOn = false;
  changeEmoji('😎');
}

function setMinesLeftOnBoard(levelName) {
  if (levelName === 'easy') gGame.minesLeftOnBoard = 2;
  else if (levelName === 'medium') gGame.minesLeftOnBoard = 14;
  else if (levelName === 'expert') gGame.minesLeftOnBoard = 32;
}

function updateMinesLeft(diff) {
  gGame.minesLeftOnBoard -= diff;
  document.querySelector('.mines-left').innerHTML = gGame.minesLeftOnBoard;
}

function changeEmoji(emoji) {
  document.querySelector('.restart-emoji').innerHTML = emoji;
}

function onHintClick(elHint) {
  if (gGame.didntClickedYet) {
    alert(`You can't use hints before the first click on the game!`);
    return;
  }
  // mark hint:
  if (!gElMarkedHint && !elHint.classList.contains('marked-hint')) {
    elHint.classList.add('marked-hint');
    gElMarkedHint = elHint;
    // unmark hint:
  } else if (gElMarkedHint && !elHint.classList.contains('marked-hint')) {
    return;
  } else {
    gElMarkedHint = null;
    elHint.classList.remove('marked-hint');
  }
}

function showHints(rowIdx, colIdx) {
  gGame.isOn = false;
  gGame.hints--;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= gBoard.length) continue;
      var currCell = gBoard[i][j];
      if (currCell.isShown) continue;
      gShownHintPos.push({ i, j });
      // Dom
      if (currCell.isMine) renderCell({ i, j }, gMine_logo);
      else renderCell({ i, j }, currCell.minesAroundCount);
    }
  }
  setTimeout(hideHints, 1000);
}

function hideHints() {
  gGame.isOn = true;
  gElMarkedHint.hidden = true;
  gElMarkedHint = null;
  for (var i = 0; i < gShownHintPos.length; i++) {
    var currPos = gShownHintPos[i];

    // Model
    gBoard[currPos.i][currPos.j].isShown = false;
    // DOM
    renderCell(currPos, EMPTY_CELL);
  }
  gGame.isOn = true;
  gShownHintPos = [];
  // if there's no hints any more
  if (!gGame.hints) console.log('No hints anymore!');
}

function showHintsOnInit() {
  gElMarkedHint = null;
  var elHints = document.querySelectorAll('.hints');
  for (var i = 0; i < elHints.length; i++) {
    var hint = elHints[i];
    hint.classList.remove('marked-hint');
    hint.hidden = false;
  }
}

function clearTimer() {
  clearInterval(gTimer);
  document.querySelector('.timer span').innerHTML = '00: 00: 00';
}
