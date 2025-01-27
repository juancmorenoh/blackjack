// 1- Create deck
// 2- Shuffle cards
// 3 - Deal cards
// 4- Remove them from deck
// 5- Implement players options
// 6- Create dealers logic
// 7- Determine the winner
// 8- Play again

const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
const ranks = [ "Ace","2", "3", "4", "5", "6", "7", "8", "9", "10","Jack", "Queen", "King"];


const deck = [];

// Generate the deck
suits.forEach(suit => {
  ranks.forEach(rank => {
    deck.push({ rank, suit });
  });
});


//Fisher-Yates Shuffle Function to Shuffle the deck
let Shuffle = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

//Second option to shuffle deck
//deck.sort(() => Math.random() - 0.5);

//Shuffle the deck
Shuffle(deck);

//Function to deal first 3 cards
let dealCards = (cards, numCards) => {
  let playersHand = [];
  let dealersHand = [];
  
  for (let i = 0; i < numCards; i++){
    if(i % 2 == 0){
      playersHand.push(cards.shift());
    }else{
      dealersHand.push(cards.shift());
    }
    
  }
  return {playersHand, dealersHand};
}

//Deal first 3 cards of the game
let { playersHand, dealersHand } = dealCards(deck, 3)



//Function to calculate value of the card
//Return int or array of ints
let valueCard = (card) => {
  let value = 0;
  if (card.rank == "Ace"){
    value  = 11;
  }else if (card.rank == "Jack" || card.rank == "Queen" || card.rank == "King"){
    value = 10;
  }else{
    value = parseInt(card.rank);
  }
  return value;
}

/*
let calculateScore = (hand) => {
  let score = 0;
  for(card in hand){
    score += valueCard(hand[card]);      
  }
  return score;
}
*/

//Function to get card from deck
let drawCard = (hand, deck) => {
  let card = deck.shift();
  hand.push(card);
  return card;
}

