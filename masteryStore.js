/**
 * MasteryStore: Handles all mastery state persistence and retrieval
 * Single source of truth for card ratings, stars, and review history
 */

class MasteryStore {
  constructor(packKey) {
    this.packKey = packKey;
    this.storageKey = `masteryData_${packKey}`;
    this.data = this.loadFromStorage();
  }

  /**
   * Load mastery data from localStorage, or return empty object
   */
  loadFromStorage() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return {};
    }

    try {
      const parsed = JSON.parse(stored);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      console.warn(`Invalid mastery data for ${this.storageKey}; resetting store.`, error);
      localStorage.removeItem(this.storageKey);
      return {};
    }
  }

  createDefaultCardState() {
    return {
      starred: false,
      rating: null,
      reviewHistory: [],
      lastReviewDate: null
    };
  }

  normalizeCardState(state) {
    if (!state || typeof state !== 'object') {
      return this.createDefaultCardState();
    }

    const rating = ['easy', 'medium', 'hard'].includes(state.rating) ? state.rating : null;
    const reviewHistory = Array.isArray(state.reviewHistory)
      ? state.reviewHistory.filter((entry) => entry && ['easy', 'medium', 'hard'].includes(entry.rating))
      : [];

    return {
      starred: Boolean(state.starred),
      rating,
      reviewHistory,
      lastReviewDate: typeof state.lastReviewDate === 'string' ? state.lastReviewDate : null
    };
  }

  /**
   * Save mastery data to localStorage
   */
  saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  /**
   * Initialize card mastery state if it doesn't exist
   */
  initializeCard(cardId) {
    if (!this.data[cardId]) {
      this.data[cardId] = this.createDefaultCardState();
      this.saveToStorage();
    }
  }

  /**
   * Batch initialize multiple cards
   */
  initializeCards(cardIds) {
    const validCardIds = new Set(cardIds);
    let hasChanges = false;

    Object.keys(this.data).forEach((existingCardId) => {
      if (!validCardIds.has(existingCardId)) {
        delete this.data[existingCardId];
        hasChanges = true;
      }
    });

    cardIds.forEach(cardId => {
      if (!this.data[cardId]) {
        this.data[cardId] = this.createDefaultCardState();
        hasChanges = true;
      } else {
        const normalizedState = this.normalizeCardState(this.data[cardId]);
        if (JSON.stringify(normalizedState) !== JSON.stringify(this.data[cardId])) {
          this.data[cardId] = normalizedState;
          hasChanges = true;
        }
      }
    });
    if (hasChanges) {
      this.saveToStorage();
    }
  }

  /**
   * Toggle star for a card
   */
  toggleStar(cardId) {
    this.initializeCard(cardId);
    this.data[cardId].starred = !this.data[cardId].starred;
    this.saveToStorage();
    return this.data[cardId].starred;
  }

  /**
   * Set mastery rating for a card
   */
  setRating(cardId, rating) {
    if (!['easy', 'medium', 'hard'].includes(rating)) {
      throw new Error(`Invalid rating: ${rating}`);
    }

    this.initializeCard(cardId);
    const now = new Date().toISOString();

    this.data[cardId].reviewHistory.push({
      rating: rating,
      timestamp: now
    });

    this.data[cardId].rating = rating;
    this.data[cardId].lastReviewDate = now;
    this.saveToStorage();
  }

  /**
   * Get mastery state for a specific card
   */
  getCard(cardId) {
    this.initializeCard(cardId);
    return this.data[cardId];
  }

  /**
   * Get all starred card IDs
   */
  getStarredCardIds() {
    return Object.entries(this.data)
      .filter(([_, state]) => state.starred)
      .map(([id, _]) => id);
  }

  /**
   * Get all hard card IDs
   */
  getHardCardIds() {
    return Object.entries(this.data)
      .filter(([_, state]) => state.rating === 'hard')
      .map(([id, _]) => id);
  }

  /**
   * Get mastery breakdown: { easy: count, medium: count, hard: count, unrated: count }
   */
  getMasteryBreakdown() {
    const breakdown = {
      easy: 0,
      medium: 0,
      hard: 0,
      unrated: 0
    };

    Object.values(this.data).forEach(state => {
      if (state.rating === null) breakdown.unrated++;
      else breakdown[state.rating]++;
    });

    return breakdown;
  }

  /**
   * Get mastery progression from last review session
   * Returns { previous: breakdown, current: breakdown, changed: boolean }
   */
  getMasteryProgression() {
    const current = this.getMasteryBreakdown();

    // If no review history, no previous state
    if (!Object.values(this.data).some(state => state.reviewHistory.length > 0)) {
      return { previous: null, current, changed: false };
    }

    // Reconstruct previous state by removing last review for each card
    const previous = {
      easy: 0,
      medium: 0,
      hard: 0,
      unrated: 0
    };

    Object.values(this.data).forEach(state => {
      if (state.reviewHistory.length <= 1) {
        // Card only has current review, was unrated before
        previous.unrated++;
      } else {
        // Card has history; get second-to-last rating
        const previousRating = state.reviewHistory[state.reviewHistory.length - 2].rating;
        previous[previousRating]++;
      }
    });

    const changed = JSON.stringify(previous) !== JSON.stringify(current);
    return { previous, current, changed };
  }

  /**
   * Clear all mastery data for this pack
   */
  clear() {
    localStorage.removeItem(this.storageKey);
    this.data = {};
  }
}
