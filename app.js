const flipButton = document.querySelector('#flip-button');
const optionsContainer = document.querySelector('.options-container');
const gameBoardElement = document.querySelector('#game-board-container');
const startButton = document.querySelector('#start-button');

const info = document.querySelector('#info');
const turnDisplay = document.querySelector('#turn-display');

// start click
startButton.addEventListener('click', startGame);


// flip event - разворачивает корабли
flipButton.addEventListener('click', clickFlipButton);
let angle = 0;
function clickFlipButton() {
  angle = (angle === 0) ? 90: 0;
  for(let ship of optionsContainer.children) {
    ship.style.transform = `rotate(${angle}deg)`;
  }
}

// Create GameBoard
const width = 10;

function createBoard(color, id) {
  const gameBoardContainer = document.createElement('div');
  gameBoardContainer.classList.add('game-board');
  gameBoardContainer.style.background = color;
  gameBoardContainer.id = id;

  for(let index = 0; index < width * width; index++ ) {
    const block = document.createElement('div');
    block.classList.add('block');
    block.id = index.toString();
    gameBoardContainer.append(block);
  }

  gameBoardElement.append(gameBoardContainer);
}

createBoard('#cccccc', 'player');
createBoard('#eeeeee', 'computer');


class Ship {
  constructor(name, length) {
    this.name = name;
    this.length = length;
  }
}

const oneLevelShip = new Ship('oneLevelShip', 1);
const twoLevelShip = new Ship('twoLevelShip', 2);
const threeLevelShip = new Ship('threeLevelShip', 3);
const fourLevelShip = new Ship('fourLevelShip', 4);
const fiveLevelShip = new Ship('fiveLevelShip', 5);


const ships = [oneLevelShip, twoLevelShip, threeLevelShip, fourLevelShip, fiveLevelShip];

let notDropped;


function handleValidity(allBoardBlocks, isHorizontal, startIndex, ship) {
  let validStart = isHorizontal ?
    startIndex <= width * width - ship.length ? startIndex : startIndex - ship.length:
    startIndex <= width * width - width * ship.length ? startIndex: startIndex - width * ship.length + width;

  const shipBlocks = [];

  for (let index = 0; index < ship.length; index++) {
    if(isHorizontal) {
      shipBlocks.push(allBoardBlocks[Number(validStart) + index]);
    } else {
      shipBlocks.push(allBoardBlocks[Number(validStart) + index * width]);
    }
  }
  let valid;

  if(isHorizontal) {
    shipBlocks.every((_shipBlock, index) => {
      valid = shipBlocks[0].id % width !== width - (shipBlocks.length - (index + 1));
    })
  } else {
    shipBlocks.every((_shipBlock, index) => {
      valid = shipBlocks[0].id < 90 + (width * index + 1);
    })
  }

  let unTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'));

  return {shipBlocks, valid, unTaken};
}

function addShipPiece(user, ship, startId) {
  const allBoardBlocks = document.querySelectorAll(`#${user} div`);
  let isHorizontal = user === 'player' ? angle === 0: Math.random() < 0.5;
  let randomStartIndex = Math.floor(Math.random() * width * width);

  let startIndex = startId? startId : randomStartIndex;

  let {shipBlocks, valid, unTaken} = handleValidity(allBoardBlocks, isHorizontal, startIndex, ship)

  if(valid && unTaken) {
    shipBlocks.forEach(shipBlock => {
      shipBlock.classList.add(ship.name);
      shipBlock.classList.add('taken');
    });
  } else {
    if(user === 'computer') addShipPiece('computer', ship, startId);
    if(user === 'player') notDropped = true;
  }
}

ships.forEach(ship => {
  addShipPiece('computer', ship)
})

// drag & drop ships

const optionShips = Array.from(optionsContainer.children)
optionShips.forEach(optionShip => optionShip.addEventListener('dragstart', dragstart))

let allPlayerBlocks = document.querySelectorAll('#player div');

allPlayerBlocks.forEach(playerBlock => {

  playerBlock.addEventListener('dragover', dragover);
  playerBlock.addEventListener('drop', dropShip);
})

let draggedShip;

function dragstart(e) {
  notDropped = false;
  draggedShip = e.target;
}

function dragover(e) {

  e.preventDefault();
  const ship = ships[draggedShip.id];

  highLight(e.target.id, ship);
}

function dropShip(e) {
  const startId = e.target.id;
  const ship = ships[draggedShip.id];
  addShipPiece('player', ship, startId);

  if(!notDropped) {
    draggedShip.remove();
  }
}

function highLight(index, ship) {
  let allBoard = document.querySelectorAll('#player div');
  let isHorizontal = angle === 0;

  let {shipBlocks, valid, unTaken} = handleValidity(allBoard, isHorizontal, index, ship);

  if(valid && unTaken) {
    shipBlocks.forEach(shipBlock => {
      shipBlock.classList.add('hover');
      setTimeout(() => shipBlock.classList.remove('hover'), 500)
    })
  }
}


// игровая логика

let gameOver = false;
let playerTurn;

// start

function startGame () {
  playerTurn = true;
  if(optionsContainer.children.length !== 0) {
    info.textContent = 'Расставьте все корабли на поле';
  } else {
    const allBoardsBlocks = document.querySelectorAll('#computer div');
    allBoardsBlocks.forEach(block => {
      block.addEventListener('click', gameBlockClick);
    })

  }
}

let playerHits = [];
let computerHits = [];


function gameBlockClick(e) {
  turnDisplay.textContent = 'Ход игрока!';
  if (!gameOver) {
    if(e.target.classList.contains('taken')) {
      e.target.classList.add('boom');
      info.textContent = 'Попадание!';

      let classes = Array.from(e.target.classList);
      classes = classes.filter(className => className !== 'block');
      classes = classes.filter(className => className !== 'boom');
      classes = classes.filter(className => className !== 'taken');

      playerHits.push(...classes);
    }

    if(!e.target.classList.contains('taken')) {
      info.textContent = 'Мимо!';
      e.target.classList.add('empty');
    }
  }
  playerTurn = false;
  const allBoardsBlocks = document.querySelectorAll('#computer div');
  allBoardsBlocks.forEach(block => block.replaceWith(block.cloneNode(true)));

  setTimeout(computerGo, 3000);
}

function computerGo() {
  if (!gameOver) {
    info.textContent = 'Ход компьютера!';
    turnDisplay.textContent = 'Ход компьютера!';

      setTimeout(() => {
        let random = Math.floor(Math.random() * 100);
        const allBoardsBlocks = document.querySelectorAll('#player div');

        if(allBoardsBlocks[random].classList.contains('taken') && allBoardsBlocks[random].classList.contains('boom') ) {
          computerGo();
        } else if (allBoardsBlocks[random].classList.contains('taken') && !allBoardsBlocks[random].classList.contains('boom')) {
          allBoardsBlocks[random].classList.add('boom');
          info.textContent = 'Попадание компьютера!';

          let classes = Array.from(allBoardsBlocks[random].classList);
          classes = classes.filter(className => className !== 'block');
          classes = classes.filter(className => className !== 'boom');
          classes = classes.filter(className => className !== 'taken');
          computerHits.push(...classes);
        } else {
          info.textContent = 'Компьютер стрелет мимо!';
          allBoardsBlocks[random].classList.add('empty');
        }
      }, 1500);
    setTimeout(() => {
      info.textContent = 'Ход игрока!';
      turnDisplay.textContent = 'Ход игрока!';
      playerTurn = true;

      const allBoardsBlocks = document.querySelectorAll('#computer div');
      allBoardsBlocks.forEach(block => {
        block.addEventListener('click', gameBlockClick);
      })
    }, 3000);
  }
}
