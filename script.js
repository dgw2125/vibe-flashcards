let currentPack = [];
let currentCardIndex = 0;
let isFlipped = false;
let masteryStore = null;
let currentPackKey = '';

function loadPack() {
  const packSelect = document.getElementById('pack-select').value;
  
  if (!packSelect || !flashcardPacks[packSelect]) {
    alert('Please select a valid pack');
    return;
  }

  currentPackKey = packSelect;
  currentPack = JSON.parse(JSON.stringify(flashcardPacks[packSelect]));
  currentCardIndex = 0;
  isFlipped = false;

  // Initialize mastery store
  masteryStore = new MasteryStore(packSelect);

  // Initialize all cards in mastery store
  currentPack.forEach(card => {
    masteryStore.initializeCard(card.id);
  });

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
  const masteryState = masteryStore.getCard(card.id);
  const chineseText = document.getElementById('chinese-text');
  const cardElement = document.getElementById('current-card');
  
  // Clear previous content
  chineseText.innerHTML = '';
  
  const charsDiv = document.createElement('div');
  charsDiv.style.fontSize = '2.5em';
  charsDiv.style.fontWeight = '500';
  charsDiv.textContent = card.chinese;
  
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

  // Apply starred indicator from store
  cardElement.classList.remove('starred');
  if (masteryState.starred) {
    cardElement.classList.add('starred');
  }

  // Update star button text
  const starButton = document.querySelector('#controls button:nth-child(2)');
  starButton.textContent = masteryState.starred ? '✕ Remove Star' : '⭐ Star';

  // Show rating UI if card is not yet rated
  const ratingUI = document.getElementById('rating-ui');
  if (masteryState.rating === null) {
    ratingUI.style.display = 'block';
    document.getElementById('current-rating').textContent = '';
  } else {
    ratingUI.style.display = 'none';
    document.getElementById('current-rating').textContent = `Rated: ${masteryState.rating}`;
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
  const card = currentPack[currentCardIndex];
  const isStarred = masteryStore.toggleStar(card.id);
  const cardElement = document.getElementById('current-card');
  const starButton = document.querySelector('#controls button:nth-child(2)');

  if (isStarred) {
    cardElement.classList.add('starred');
    starButton.textContent = '✕ Remove Star';
  } else {
    cardElement.classList.remove('starred');
    starButton.textContent = '⭐ Star';
  }

  updateStarCount();
}

function setCardRating(rating) {
  const card = currentPack[currentCardIndex];
  masteryStore.setRating(card.id, rating);
  
  const ratingUI = document.getElementById('rating-ui');
  ratingUI.style.display = 'none';
  
  const currentRating = document.getElementById('current-rating');
  currentRating.textContent = `Rated: ${rating}`;
  
  updateProgress();
}

function shuffleCards() {
  for (let i = currentPack.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentPack[i], currentPack[j]] = [currentPack[j], currentPack[i]];
  }
  currentCardIndex = 0;
  displayCard();
}

function showEndScreen() {
  const progression = masteryStore.getMasteryProgression();
  
  let progressionText = '';
  if (progression.previous) {
    progressionText = `
      <p><strong>Mastery Progress:</strong></p>
      <ul>
        <li>Easy: ${progression.previous.easy} → ${progression.current.easy}</li>
        <li>Medium: ${progression.previous.medium} → ${progression.current.medium}</li>
        <li>Hard: ${progression.previous.hard} → ${progression.current.hard}</li>
        ${progression.previous.unrated > 0 ? `<li>Unrated: ${progression.previous.unrated} → ${progression.current.unrated}</li>` : ''}
      </ul>
    `;
  } else {
    const breakdown = progression.current;
    progressionText = `
      <p><strong>Mastery Breakdown:</strong></p>
      <ul>
        <li>Easy: ${breakdown.easy}</li>
        <li>Medium: ${breakdown.medium}</li>
        <li>Hard: ${breakdown.hard}</li>
        ${breakdown.unrated > 0 ? `<li>Unrated: ${breakdown.unrated}</li>` : ''}
      </ul>
    `;
  }

  document.getElementById('end-screen-content').innerHTML = progressionText;
  document.getElementById('flashcard-section').style.display = 'none';
  document.getElementById('sidebar').style.display = 'none';
  document.getElementById('end-screen').style.display = 'block';
}

function reviewAgain() {
  currentCardIndex = 0;
  isFlipped = false;
  
  document.getElementById('end-screen').style.display = 'none';
  document.getElementById('flashcard-section').style.display = 'block';
  document.getElementById('sidebar').style.display = 'block';
  
  displayCard();
}

function reviewStarred() {
  const starredIds = masteryStore.getStarredCardIds();
  if (starredIds.length === 0) {
    alert('No starred cards yet!');
    return;
  }

  currentPack = currentPack.filter(card => starredIds.includes(card.id));
  currentCardIndex = 0;
  isFlipped = false;

  document.getElementById('end-screen').style.display = 'none';
  document.getElementById('flashcard-section').style.display = 'block';
  document.getElementById('sidebar').style.display = 'block';

  displayCard();
}

function reviewHard() {
  const hardIds = masteryStore.getHardCardIds();
  if (hardIds.length === 0) {
    alert('No hard cards yet!');
    return;
  }

  currentPack = currentPack.filter(card => hardIds.includes(card.id));
  currentCardIndex = 0;
  isFlipped = false;

  document.getElementById('end-screen').style.display = 'none';
  document.getElementById('flashcard-section').style.display = 'block';
  document.getElementById('sidebar').style.display = 'block';

  displayCard();
}

function backToSelector() {
  document.getElementById('pack-selector').style.display = 'block';
  document.getElementById('study-area').style.display = 'none';
  document.getElementById('end-screen').style.display = 'none';
  document.getElementById('pack-select').value = '';
  document.getElementById('back-link').style.display = 'none';
  
  masteryStore = null;
}

function updateProgress() {
  const progress = ((currentCardIndex + 1) / currentPack.length) * 100;
  document.getElementById('progress').value = progress;
  document.getElementById('card-counter').textContent = `Card ${currentCardIndex + 1} of ${currentPack.length}`;
}

function updateStarCount() {
  const starredCount = masteryStore.getStarredCardIds().length;
  const starCountEl = document.getElementById('star-count');
  if (starCountEl) {
    starCountEl.textContent = starredCount;
  }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
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
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      toggleStar();
      break;
    case 'KeyR':
      if (e.ctrlKey || e.metaKey) return;
      shuffleCards();
      break;
  }
});

