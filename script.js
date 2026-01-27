let currentPack = [];
let currentCardIndex = 0;
let isFlipped = false;
let starredCards = new Set();
let originalPack = [];

function loadPack() {
  const packSelect = document.getElementById('pack-select').value;
  
  if (!packSelect || !flashcardPacks[packSelect]) {
    alert('Please select a valid pack');
    return;
  }

  currentPack = JSON.parse(JSON.stringify(flashcardPacks[packSelect]));
  originalPack = JSON.parse(JSON.stringify(flashcardPacks[packSelect]));
  currentCardIndex = 0;
  isFlipped = false;
  starredCards.clear();

  // Set pack name
  const packNames = {
    'metro': 'Shanghai Metro',
    'shopping': 'Shopping',
    'greetings': 'Greetings'
  };
  document.getElementById('pack-name').textContent = packNames[packSelect];

  document.getElementById('pack-selector').style.display = 'none';
  document.getElementById('study-area').style.display = 'block';
  document.getElementById('end-screen').style.display = 'none';
  document.getElementById('back-link').style.display = 'block';

  displayCard();
}

function displayCard() {
  if (currentCardIndex >= currentPack.length) {
    showEndScreen();
    return;
  }

  const card = currentPack[currentCardIndex];
  const chineseText = document.getElementById('chinese-text');
  const cardElement = document.getElementById('current-card');
  
  // Clear previous content
  chineseText.innerHTML = '';
  
  // Create characters element
  const charsDiv = document.createElement('div');
  charsDiv.style.fontSize = '2.5em';
  charsDiv.style.fontWeight = '500';
  charsDiv.textContent = card.chinese;
  
  // Create pinyin element
  const pinyinDiv = document.createElement('div');
  pinyinDiv.style.fontSize = '1.2em';
  pinyinDiv.style.color = '#666';
  pinyinDiv.style.fontStyle = 'italic';
  pinyinDiv.textContent = card.pinyin;
  
  chineseText.appendChild(charsDiv);
  chineseText.appendChild(pinyinDiv);
  
  document.getElementById('english-text').textContent = card.english;
  document.getElementById('card-front').style.display = 'block';
  document.getElementById('card-back').style.display = 'none';
  isFlipped = false;

  // Apply starred indicator and update button text
  cardElement.classList.remove('starred');
  const starButton = document.querySelector('#controls button:nth-child(2)');
  
  if (starredCards.has(currentCardIndex)) {
    cardElement.classList.add('starred');
    starButton.textContent = '✕ Remove Star';
  } else {
    starButton.textContent = '⭐ Star';
  }

  updateProgress();
}

function flipCard() {
  isFlipped = !isFlipped;
  document.getElementById('card-front').style.display = isFlipped ? 'none' : 'block';
  document.getElementById('card-back').style.display = isFlipped ? 'block' : 'none';
}

function nextCard() {
  if (currentCardIndex < currentPack.length - 1) {
    currentCardIndex++;
    displayCard();
  }
}

function previousCard() {
  if (currentCardIndex > 0) {
    currentCardIndex--;
    displayCard();
  }
}

function toggleStar() {
  const cardIndex = currentCardIndex;
  const cardElement = document.getElementById('current-card');
  const starButton = document.querySelector('#controls button:nth-child(2)');
  
  if (starredCards.has(cardIndex)) {
    starredCards.delete(cardIndex);
    cardElement.classList.remove('starred');
    starButton.textContent = '⭐ Star';
  } else {
    starredCards.add(cardIndex);
    cardElement.classList.add('starred');
    starButton.textContent = '✕ Remove Star';
  }
  updateStarCount();
}

function updateProgress() {
  const progress = ((currentCardIndex + 1) / currentPack.length) * 100;
  document.getElementById('progress').value = progress;
  document.getElementById('card-counter').textContent = `Card ${currentCardIndex + 1} of ${currentPack.length}`;
}

function updateStarCount() {
  document.getElementById('star-count').textContent = starredCards.size;
}

function shuffleCards() {
  for (let i = currentPack.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentPack[i], currentPack[j]] = [currentPack[j], currentPack[i]];
  }
  currentCardIndex = 0;
  starredCards.clear();
  displayCard();
  updateStarCount();
}

function showEndScreen() {
  document.getElementById('flashcard').style.display = 'none';
  document.getElementById('end-screen').style.display = 'block';
}

function reviewAgain() {
  currentPack = JSON.parse(JSON.stringify(originalPack));
  currentCardIndex = 0;
  isFlipped = false;
  starredCards.clear();
  document.getElementById('end-screen').style.display = 'none';
  document.getElementById('flashcard').style.display = 'block';
  displayCard();
  updateStarCount();
}

function reviewStarred() {
  const starredCardIndices = Array.from(starredCards);
  if (starredCardIndices.length === 0) {
    alert('No starred cards yet!');
    return;
  }
  currentPack = starredCardIndices.map(i => originalPack[i]);
  currentCardIndex = 0;
  isFlipped = false;
  starredCards.clear();
  document.getElementById('end-screen').style.display = 'none';
  document.getElementById('flashcard').style.display = 'block';
  displayCard();
  updateStarCount();
}

function backToSelector() {
  document.getElementById('pack-selector').style.display = 'block';
  document.getElementById('study-area').style.display = 'none';
  document.getElementById('end-screen').style.display = 'none';
  document.getElementById('pack-select').value = '';
  document.getElementById('back-link').style.display = 'none';
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Only trigger if study area is visible (not in pack selector)
  if (document.getElementById('study-area').style.display === 'none') {
    return;
  }

  switch(e.code) {
    case 'Space':
      e.preventDefault();
      flipCard();
      break;
    case 'ArrowRight':
      nextCard();
      break;
    case 'ArrowLeft':
      previousCard();
      break;
    case 'KeyS':
      if (e.ctrlKey || e.metaKey) return; // Don't interfere with browser save
      e.preventDefault();
      toggleStar();
      break;
    case 'KeyR':
      if (e.ctrlKey || e.metaKey) return; // Don't interfere with browser refresh
      shuffleCards();
      break;
  }
});

