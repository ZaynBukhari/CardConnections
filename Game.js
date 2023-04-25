let card1;
let card2;
let clickedSets = [];
let usedSets = [];
let timerInterval;
let startTime;


const startGameButton = document.getElementById('startGame');
const timerDisplay = document.getElementById('timer');
const overlay = document.getElementById('overlay');
const closeOverlayButton = document.getElementById('closeOverlay');
const usedSetsList = document.getElementById('usedSets');

document.addEventListener('DOMContentLoaded', () => {
  startGameButton.addEventListener('click', startGame);
});


document.addEventListener('DOMContentLoaded', () => {
  newGameButton.addEventListener('click', startGame);
});

document.addEventListener('DOMContentLoaded', () => {

  if (!localStorage.getItem('playedBefore')) {

    overlay.style.display = 'flex';


    localStorage.setItem('playedBefore', 'true');
  }
});

closeOverlayButton.addEventListener('click', () => {

  overlay.style.display = 'none';
  startGame();
});


function startGame() {

  resetGame();

  generateRandomCards().then(([cardA, cardB]) => {
    card1 = cardA;
    card2 = cardB;
    const card1Sets = card1.card_sets?.map(set => set.set_name) ?? [];
    const card2Sets = card2.card_sets?.map(set => set.set_name) ?? [];
    usedSets = [...card1Sets, ...card2Sets];

    displayCurrentCard(card1);
    displayCurrentCard(card2, true);
    displayCard2Sets(card2);

    console.log(card1, card2);

    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);

    startGameButton.disabled = true;

  });
}



async function generateRandomCards() {
  let card1, card2, card1Sets, card2Sets;

  do {
    card1 = await getRandomCard();
    card2 = await getRandomCard();

    card1Sets = card1.card_sets?.map(set => set.set_name) ?? [];
    card2Sets = card2.card_sets?.map(set => set.set_name) ?? [];
    card1Sets = [...new Set(card1Sets)];
    card2Sets = [...new Set(card2Sets)];
  } while (hasIntersection(card1Sets, card2Sets));

  return [card1, card2];
}

async function getRandomCard() {
  let cardData;
  do {
    const response = await fetch('https://db.ygoprodeck.com/api/v7/randomcard.php');
    cardData = await response.json();
  } while (!await isTcgLegal(cardData.id));
  return cardData;
}


async function isTcgLegal(cardId) {
  const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${cardId}&format=tcg`);
  const cardData = await response.json();

  if (cardData.error) {
    return false;
  }

  const setCodes = new Set();
if (Array.isArray(cardData.card_sets)) {
  for (const set of cardData.card_sets) {
    setCodes.add(set.set_code);
  }
}
  if (setCodes.size === 1) {
    const setCode = [...setCodes][0];
    const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?set=${setCode}&type=Monster`);
    const cardList = await response.json();
    if (cardList.data.length === 1) {
      return false;
    }
  }

  return true;
}

function hasIntersection(array1, array2) {
  return array1.some(item => array2.includes(item));
}


function displayCurrentCard(card, isSecondCard = false) {
  const currentCardContainer = document.getElementById('currentCard');
  const targetCardContainer = document.getElementById('targetCard');
  const currentCardSets = document.getElementById('currentCardSets');
  const currentCardName = document.getElementById('currentCardName');
  const targetCardName = document.getElementById('targetCardName');
  const targetCardSets = document.getElementById('targetCardSets');

  if (isSecondCard) {
    targetCardContainer.innerHTML = '';
    targetCardSets.innerHTML = '';
    displayCard(targetCardContainer, card);
    targetCardName.textContent = card.name;

    const setNames = new Set();
    if (card.card_sets) {
      card.card_sets.forEach(set => {
        if (!setNames.has(set.set_name)) {
          const listItem = document.createElement('li');
          listItem.textContent = `${set.set_name} (${set.set_code})`;
          listItem.addEventListener('click', () => {
            displaySetCards(set.set_name);
          });
          targetCardSets.appendChild(listItem);
          setNames.add(set.set_name);
        }
      });
    }
  } else {
    currentCardContainer.innerHTML = '';
    currentCardSets.innerHTML = '';

    const cardImage = document.createElement('img');
    const cardName = document.createElement('h3');
    cardImage.src = card.card_images[0].image_url;
    cardName.textContent = card.name;
    currentCardContainer.appendChild(cardImage);
    currentCardContainer.appendChild(cardName);
    currentCardName.textContent = card.name;

    const setNames = new Set();
    if (card.card_sets) {
      card.card_sets.forEach(set => {
        if (!setNames.has(set.set_name)) {
          const listItem = document.createElement('li');
          listItem.textContent = `${set.set_name} (${set.set_code})`;
          listItem.addEventListener('click', () => {
            displaySetCards(set.set_name);
          });
          currentCardSets.appendChild(listItem);
          setNames.add(set.set_name);
        }
      });
    }

    window.scrollTo(0, 0);
  }
}





function displayCard(cardContainer, card, currentSet, onClick) {
  const cardImage = document.createElement('img');
  const cardName = document.createElement('h3');
  const cardWrapper = document.createElement('div');

  cardImage.src = card.card_images[0].image_url;
  cardName.textContent = card.name;

  cardWrapper.appendChild(cardImage);
  cardWrapper.appendChild(cardName);
  cardContainer.appendChild(cardWrapper);

  if (onClick) {
    cardWrapper.addEventListener('click', () => {
      if (!clickedSets.includes(currentSet)) {
        clickedSets.push(currentSet);
        console.log(`Added set: ${currentSet}`); 
        console.log(`Current clickedSets: [${clickedSets.join(', ')}]`); 
      }

      onClick(card);
    });
  }
}



function updateTimer() {
  const elapsedTime = new Date() - startTime;
  const elapsedSeconds = Math.floor(elapsedTime / 1000);
  timerDisplay.textContent = `${elapsedSeconds} seconds`;
}

function resetGame() {

  clearInterval(timerInterval);
  card1 = null;
  card2 = null;
  document.getElementById('currentCard').innerHTML = '';
  document.getElementById('currentCardSets').innerHTML = '';
  document.getElementById('setCounter').innerHTML = '';
  document.getElementById('usedSets').innerHTML = '';
  usedSets = [];
  usedSetsList.innerHTML = '';
  


  const completionScreen = document.getElementById('completionScreen');
  console.log('Before adding hidden class:', completionScreen.classList);
  completionScreen.classList.add('hidden');
  console.log('After adding hidden class:', completionScreen.classList);

  const setCardsContainer = document.getElementById('setCards');
  setCardsContainer.innerHTML = '';
  
  startGameButton.disabled = false;
}

function displaySetCards(setName) {
  console.log('displaySetCards function called');

  const setCardsContainer = document.getElementById('setCards');
  if (!setCardsContainer) {
    console.error('setCardsContainer not found!');
    return;
  }

  setCardsContainer.innerHTML = '';

  return new Promise((resolve, reject) => {
    fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?cardset=${encodeURIComponent(setName)}`)
      .then(response => response.json())
      .then(cardsData => {
        cardsData.data.forEach(card => {
          const cardContainer = document.createElement('div');
          cardContainer.classList.add('card');
          displayCard(cardContainer, card, setName, (clickedCard) => { 
            console.log('Card clicked');
        
            if (clickedCard.id === card2.id) { 
              console.log('Completion condition fulfilled!'); 
              clearInterval(timerInterval);
              showCompletionScreen(usedSets, clickedSets);
            } else {
              displayCurrentCard(clickedCard);
            }
        
          }, true);
        
          setCardsContainer.appendChild(cardContainer);
        });
        resolve();
      })
      .catch(error => {
        reject(error);
      });
  });
}




function displayCurrentCard(card, isSecondCard = false) {
  return new Promise((resolve) => {
    const currentCardContainer = document.getElementById('currentCard');
    const targetCardContainer = document.getElementById('targetCard');
    const currentCardSets = document.getElementById('currentCardSets');
    const currentCardName = document.getElementById('currentCardName');
    const targetCardName = document.getElementById('targetCardName');
    

    if (isSecondCard) {
      targetCardContainer.innerHTML = '';
      displayCard(targetCardContainer, card);
      targetCardName.textContent = card.name;
      resolve();
    } else {
      currentCardContainer.innerHTML = '';
      currentCardSets.innerHTML = '';

      const cardImage = document.createElement('img');
      const cardName = document.createElement('h3');
      cardImage.src = card.card_images[0].image_url;
      cardName.textContent = card.name;
      currentCardContainer.appendChild(cardImage);
      currentCardContainer.appendChild(cardName);
      currentCardName.textContent = card.name;


      if (card.card_sets) {
        const seenSetNames = new Set();
        card.card_sets.forEach(set => {
          if (!seenSetNames.has(set.set_name)) {
            seenSetNames.add(set.set_name);
            const listItem = document.createElement('li');
            listItem.textContent = `${set.set_name} (${set.set_code})`;
            listItem.addEventListener('click', () => {
              displaySetCards(set.set_name);
            });
            currentCardSets.appendChild(listItem);
          }
        });
      }


      window.scrollTo(0, 0);
      

      resolve();
    }
  });
}

function displayCard2Sets(card) {
  const targetCardSets = document.getElementById('targetCardSets');
  targetCardSets.innerHTML = '';

  const setNames = new Set();
  
  if (card.card_sets) {
    card.card_sets.forEach(set => {
      if (!setNames.has(set.set_name)) {
        const setItem = document.createElement('div');
        setItem.classList.add('set-item');
        setItem.textContent = `${set.set_name} (${set.set_code})`;
        targetCardSets.appendChild(setItem);
        setNames.add(set.set_name);
      }
    });
  }
}

function showCompletionScreen(usedSets, clickedSets) {
  const completionScreen = document.getElementById('completionScreen');
  const setCounter = document.getElementById('setCounter');
  const newGameButton = document.getElementById('newGameButton');


  usedSetsList.innerHTML = '';


  clickedSets.forEach(set => {
    const listItem = document.createElement('li');
    listItem.textContent = set;
    usedSetsList.appendChild(listItem);
  });


  setCounter.textContent = clickedSets.length;

  console.log('Before removing hidden class:', completionScreen.classList);

  completionScreen.classList.remove('hidden');
  console.log('After removing hidden class:', completionScreen.classList);
}

