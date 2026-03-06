let currentPack = [];
let currentCardIndex = 0;
let isFlipped = false;
let masteryStore = null;
let activeFilter = 'none';
let filteredPack = null;

// Helper function to get the cards to display
function getCardsToShow() {
  return filteredPack || currentPack;
}

function refreshActiveFilter() {
  if (activeFilter === 'none') {
    filteredPack = null;
    return true;
  }

  const matchingIds = activeFilter === 'hard'
    ? masteryStore.getHardCardIds()
    : masteryStore.getStarredCardIds();

  filteredPack = currentPack.filter((card) => matchingIds.includes(card.id));
  if (filteredPack.length === 0) {
    activeFilter = 'none';
    filteredPack = null;
    currentCardIndex = 0;
    updateFilterButton();
    return false;
  }

  if (currentCardIndex >= filteredPack.length) {
    currentCardIndex = filteredPack.length - 1;
  }

  updateFilterButton();
  return true;
}

function loadPack() {
  const packSelect = document.getElementById('pack-select').value;
  
  if (!packSelect || !flashcardPacks[packSelect]) {
    alert('Please select a valid pack');
    return;
  }

  currentPack = JSON.parse(JSON.stringify(flashcardPacks[packSelect]));
  currentCardIndex = 0;
  isFlipped = false;
  activeFilter = 'none';
  filteredPack = null;

  masteryStore = new MasteryStore(packSelect);
  masteryStore.initializeCards(currentPack.map(card => card.id));

  const packNames = {
    'metro': 'Shanghai Metro',
    'shopping': 'Shopping',
    'greetings': 'Greetings'
  };
  document.getElementById('pack-name').textContent = packNames[packSelect];

  document.getElementById('pack-selector').hidden = true;
  document.getElementById('study-area').hidden = false;
  document.getElementById('end-screen').hidden = true;
  document.getElementById('back-link').hidden = false;

  updateStarCount();
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
  document.getElementById('card-front').hidden = false;
  document.getElementById('card-back').hidden = true;
  isFlipped = false;

  // Apply starred indicator
  cardElement.classList.remove('starred');
  if (masteryState.starred) {
    cardElement.classList.add('starred');
  }

  updateRatingDisplay(masteryState);
  updateRatingBadgeVisibility();

  // Disable/enable arrow buttons
  const leftArrow = document.querySelector('.left-arrow');
  const rightArrow = document.querySelector('.right-arrow');
  
  leftArrow.disabled = currentCardIndex === 0;
  rightArrow.disabled = currentCardIndex === cardsToShow.length - 1;

  updateProgress(cardsToShow.length);
}

function flipCard() {
  isFlipped = !isFlipped;
  document.getElementById('card-front').hidden = isFlipped;
  document.getElementById('card-back').hidden = !isFlipped;
  updateRatingBadgeVisibility();
}

function updateRatingBadgeVisibility() {
  const ratingBadge = document.getElementById('rating-badge');
  const ratingControls = document.getElementById('card-back-controls');
  if (!ratingBadge || !ratingControls) return;

  const shouldShow = advancedMasteryEnabled && isFlipped;
  ratingBadge.hidden = !shouldShow;
  ratingControls.hidden = !shouldShow;
}

function updateRatingDisplay(masteryState) {
  const ratingBadge = document.getElementById('rating-badge');
  if (!ratingBadge) return;

  ratingBadge.className = 'rating-badge';
  if (masteryState && masteryState.rating) {
    ratingBadge.textContent = `rating: ${masteryState.rating}`;
    ratingBadge.classList.add(masteryState.rating);
  } else {
    ratingBadge.textContent = 'unrated';
    ratingBadge.classList.add('unrated');
  }

  updateRatingButtonSelection(masteryState?.rating || null);
}

function updateRatingButtonSelection(currentRating) {
  const ratingButtons = document.querySelectorAll('#rating-buttons-back .rating-btn');
  ratingButtons.forEach((button) => {
    const isSelected = button.dataset.rating === currentRating;
    button.classList.toggle('selected', isSelected);
  });
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
  if (event) {
    event.stopPropagation();
  }
  
  const cardsToShow = getCardsToShow();
  const card = cardsToShow[currentCardIndex];
  const isStarred = masteryStore.toggleStar(card.id);
  const cardElement = document.getElementById('current-card');

  if (isStarred) {
    cardElement.classList.add('starred');
  } else {
    cardElement.classList.remove('starred');
  }

  if (activeFilter === 'starred') {
    if (!refreshActiveFilter()) {
      alert('No starred cards left. Returning to all cards.');
    }
    displayCard();
    updateStarCount();
    return;
  }

  updateStarCount();
}

function updateStarCount() {
  const starredCount = masteryStore.getStarredCardIds().length;
  document.getElementById('star-count-number').textContent = starredCount;
}

function setCardRating(rating, event) {
  if (event) {
    event.stopPropagation();
  }
  const cardsToShow = getCardsToShow();
  const card = cardsToShow[currentCardIndex];
  masteryStore.setRating(card.id, rating);

  if (activeFilter === 'hard') {
    if (!refreshActiveFilter()) {
      alert('No hard cards left. Returning to all cards.');
    }
    displayCard();
    return;
  }

  updateRatingDisplay(masteryStore.getCard(card.id));
  updateRatingBadgeVisibility();
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
  if (activeFilter === 'hard') {
    activeFilter = 'none';
    filteredPack = null;
  } else {
    activeFilter = 'hard';
    if (!refreshActiveFilter()) {
      alert('No hard cards yet!');
      activeFilter = 'none';
      return;
    }
  }

  currentCardIndex = 0;
  isFlipped = false;

  document.getElementById('end-screen').hidden = true;
  document.getElementById('flashcard-section').hidden = false;
  document.getElementById('sidebar').hidden = false;

  updateFilterButton();
  displayCard();
}

function updateFilterButton() {
  const filterButton = document.getElementById('filter-button');
  if (activeFilter === 'hard') {
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
  document.getElementById('flashcard-section').hidden = true;
  document.getElementById('sidebar').hidden = true;
  document.getElementById('end-screen').hidden = false;
}

function reviewAgain() {
  currentCardIndex = 0;
  isFlipped = false;
  
  document.getElementById('end-screen').hidden = true;
  document.getElementById('flashcard-section').hidden = false;
  document.getElementById('sidebar').hidden = false;
  
  displayCard();
}

function reviewStarred() {
  activeFilter = 'starred';
  if (!refreshActiveFilter()) {
    activeFilter = 'none';
    alert('No starred cards yet!');
    return;
  }

  currentCardIndex = 0;
  isFlipped = false;

  document.getElementById('end-screen').hidden = true;
  document.getElementById('flashcard-section').hidden = false;
  document.getElementById('sidebar').hidden = false;

  displayCard();
}

function backToSelector() {
  document.getElementById('pack-selector').hidden = false;
  document.getElementById('study-area').hidden = true;
  document.getElementById('end-screen').hidden = true;
  document.getElementById('pack-select').value = '';
  document.getElementById('back-link').hidden = true;
  
  activeFilter = 'none';
  filteredPack = null;
  masteryStore = null;
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (document.getElementById('study-area').hidden) {
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
      toggleStar(e);
      break;
    case 'KeyR':
      if (e.ctrlKey || e.metaKey) return;
      shuffleCards();
      break;
  }
});

// Global flag for advanced mastery
let advancedMasteryEnabled = localStorage.getItem('advancedMasteryEnabled') === 'true';

function toggleAdvancedMastery() {
  advancedMasteryEnabled = !advancedMasteryEnabled;
  localStorage.setItem('advancedMasteryEnabled', advancedMasteryEnabled);
  applyAdvancedMasteryState();
}

function applyAdvancedMasteryState() {
  const toggleBtn = document.getElementById('advanced-mastery-toggle');
  toggleBtn.classList.toggle('active', advancedMasteryEnabled);

  // Update UI visibility
  document.getElementById('filter-button').hidden = !advancedMasteryEnabled;
  document.getElementById('review-starred-btn').hidden = !advancedMasteryEnabled;
  document.getElementById('review-hard-btn').hidden = !advancedMasteryEnabled;
  updateRatingBadgeVisibility();
}

function initializeAdvancedMastery() {
  applyAdvancedMasteryState();
}

function bindEventListeners() {
  document.getElementById('back-link').addEventListener('click', (event) => {
    event.preventDefault();
    backToSelector();
  });

  document.getElementById('load-pack-btn').addEventListener('click', loadPack);
  document.getElementById('prev-card-btn').addEventListener('click', previousCard);
  document.getElementById('next-card-btn').addEventListener('click', nextCard);
  document.getElementById('current-card').addEventListener('click', flipCard);
  document.getElementById('star-btn').addEventListener('click', toggleStar);
  document.getElementById('card-back-controls').addEventListener('click', (event) => event.stopPropagation());

  document.querySelectorAll('#rating-buttons-back .rating-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      setCardRating(button.dataset.rating, event);
    });
  });

  document.getElementById('advanced-mastery-toggle').addEventListener('click', toggleAdvancedMastery);
  document.getElementById('shuffle-btn').addEventListener('click', shuffleCards);
  document.getElementById('filter-button').addEventListener('click', reviewHard);
  document.getElementById('review-again-btn').addEventListener('click', reviewAgain);
  document.getElementById('review-starred-btn').addEventListener('click', reviewStarred);
  document.getElementById('review-hard-btn').addEventListener('click', reviewHard);
  document.getElementById('back-selector-btn').addEventListener('click', backToSelector);
}

bindEventListeners();
initializeAdvancedMastery();
