//


const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
const ranks = [ "Ace","2", "3", "4", "5", "6", "7", "8", "9", "10","Jack", "Queen", "King"];


const deck = [];

// Generate the deck
suits.forEach(suit => {
  ranks.forEach(rank => {
    deck.push({ rank, suit });
  });
});

console.log(deck);