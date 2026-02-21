let currentPack = [];
let currentCardIndex = 0;
let isFlipped = false;
let masteryStore = null;
let currentPackKey = '';
let isFilteredView = false;

// Helper function to get the cards to display
function getCardsToShow() {
  if (isFilteredView) {
    const hardIds = masteryStore.getHardCardIds();
    return JSON.parse(JSON.stringify(flashcardPacks[currentPackKey])).filter(card => 
      hardIds.includes(card.id)
    );
  }
  return currentPack;
}

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
  isFilteredView = false;

  masteryStore = new MasteryStore(packSelect);
  masteryStore.initializeCards(currentPack.map(card => card.id));

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

  updateFilterButton();
  displayCard();
}

function displayCard() {
  const cardsToShow = getCardsToShow();

  if (currentCardIndex >= cardsToShow.length) {
    showEndScreen();
    return;
  }

  const card = cardsToShow[currentCardIndex];
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

  // Apply starred indicator
  cardElement.classList.remove('starred');
  if (masteryState.starred) {
    cardElement.classList.add('starred');
  }

  // Show rating UI if card is not yet rated
  const ratingUI = document.getElementById('rating-ui');
  if (masteryState.rating === null) {
    ratingUI.style.display = 'block';
    document.getElementById('current-rating').textContent = '';
  } else {
    ratingUI.style.display = 'none';
    document.getElementById('current-rating').textContent = `Rated: ${masteryState.rating}`;
  }

  // Disable/enable arrow buttons
  const leftArrow = document.querySelector('.left-arrow');
  const rightArrow = document.querySelector('.right-arrow');
  
  leftArrow.disabled = currentCardIndex === 0;
  rightArrow.disabled = currentCardIndex === cardsToShow.length - 1;

  updateProgress(cardsToShow.length);
}

function flipCard() {
  isFlipped = !isFlipped;
  document.getElementById('card-front').style.display = isFlipped ? 'none' : 'block';
  document.getElementById('card-back').style.display = isFlipped ? 'block' : 'none';
}

function nextCard() {
  const cardsToShow = getCardsToShow();
  if (currentCardIndex < cardsToShow.length - 1) {
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

function toggleStar(event) {
  event.stopPropagation();
  
  const cardsToShow = getCardsToShow();
  const card = cardsToShow[currentCardIndex];
  const isStarred = masteryStore.toggleStar(card.id);
  const cardElement = document.getElementById('current-card');

  if (isStarred) {
    cardElement.classList.add('starred');
  } else {
    cardElement.classList.remove('starred');
  }

  updateStarCount();
}

function updateStarCount() {
  const starredCount = masteryStore.getStarredCardIds().length;
  document.getElementById('star-count-number').textContent = starredCount;
}

function setCardRating(rating) {
  const cardsToShow = getCardsToShow();
  const card = cardsToShow[currentCardIndex];
  masteryStore.setRating(card.id, rating);
  
  const ratingUI = document.getElementById('rating-ui');
  ratingUI.style.display = 'none';
  
  const currentRating = document.getElementById('current-rating');
  currentRating.textContent = `Rated: ${rating}`;
  
  displayCard();
}

function shuffleCards() {
  const cardsToShow = getCardsToShow();
  for (let i = cardsToShow.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardsToShow[i], cardsToShow[j]] = [cardsToShow[j], cardsToShow[i]];
  }
  currentCardIndex = 0;
  displayCard();
}

function reviewHard() {
  const hardIds = masteryStore.getHardCardIds();
  
  if (isFilteredView) {
    isFilteredView = false;
  } else {
    if (hardIds.length === 0) {
      alert('No hard cards yet!');
      return;
    }
    isFilteredView = true;
  }

  currentCardIndex = 0;
  isFlipped = false;

  document.getElementById('end-screen').style.display = 'none';
  document.getElementById('flashcard-section').style.display = 'block';
  document.getElementById('sidebar').style.display = 'block';

  updateFilterButton();
  displayCard();
}

function updateFilterButton() {
  const filterButton = document.getElementById('filter-button');
  if (isFilteredView) {
    filterButton.textContent = '↻ Review All Cards';
  } else {
    filterButton.textContent = '✗ Review Hard Cards';
  }
}

function updateProgress(totalCards) {
  const progress = ((currentCardIndex + 1) / totalCards) * 100;
  document.getElementById('progress').value = progress;
  document.getElementById('card-counter').textContent = `Card ${currentCardIndex + 1} of ${totalCards}`;
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

function backToSelector() {
  document.getElementById('pack-selector').style.display = 'block';
  document.getElementById('study-area').style.display = 'none';
  document.getElementById('end-screen').style.display = 'none';
  document.getElementById('pack-select').value = '';
  document.getElementById('back-link').style.display = 'none';
  
  isFilteredView = false;
  masteryStore = null;
}

