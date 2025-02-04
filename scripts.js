class Card {
  suit;
  value;
  
  constructor(suit,value){
    this.suit = suit;
    this.value = value;
  }

  getNumericValue(){
     if(this.value == "A") return 11;
     if(this.value == "J" || this.value == "Q" || this.value == "K") return 10;
     else return parseInt(this.value); 
  }

  toString() {
    return `${this.value} of ${this.suit}`;
  }
}

class Deck {
  cards;
  numberOfDecks;

  constructor(numberOfDekcs = 1){
    this.cards = [];
    this.numberOfDekcs = numberOfDekcs;
    this.createDeck();
    this.shuffleDeck();
  }

  createDeck(){
    const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
    const values = [ "2", "3", "4", "5", "6", "7", "8", "9", "10","J", "Q", "K", "A"];

    for (let i = 0; i < this.numberOfDekcs; i++) {
      suits.forEach( suit => {
        values.forEach( value => {
          this.cards.push(new Card(suit, value));
        });
      });
    };
  };

  shuffleDeck(){
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }


  dealCard(){
    return this.cards.shift();
  }

  reset(){
    this.cards = [];
    this.createDeck();
    this.shuffleDeck();
  }
}

class Hand {
  cards;

  constructor(){
    this.cards = [];
  }

  addCard(card){
    this.cards.push(card);
  }

  calculateScore(){
    let aces = 0;
    let score = 0;
    this.cards.forEach( card => {
      score += card.getNumericValue();   
      if(card.value == "A"){
        aces++;
      };   
    });
  
    while(score > 21 && aces > 0){
      score -= 10;
      aces--;
    }
    return score;
  }

  get score(){
    return this.calculateScore();
  }
  canDouble(){
    return this.score > 8 && this.score < 12 && this.cards.length == 2;
  }

  canSplit(){
    return this.cards[0].getNumericValue() == this.cards[1].getNumericValue() && this.cards.length == 2;
  }

  isBlackJack(){
    return this.score == 21 && this.cards.length == 2;
  }

  isBust(){
    //this.calculateScore();
    return this.score > 21
  }

  toString() {
    return `Hand: [${this.cards.join(", ")}] | Score: ${this.score}`;
  }
}

class Player{
  balance;
  name;
  slots;

  constructor(name){
    this.balance = 0;
    this.name = name;
    this.slots = [];
  }

  addBalance(amount){
    this.balance += amount;
  }

  addSlot(){
    const slot = new Slot(this);
    this.slots.push(slot);
    return slot;
  }
}

class Slot{
  hand;
  player;
  bet;

  constructor(player){
    this.hand = new Hand();
    this.player = player;
    this.bet = 0;
  }

  placeBet(amount){
    if(amount > this.player.balance) return "Not enough money";
    this.bet = amount;
    this.player.balance -= amount;
  }

  //split()
  //double()
  //stand()

  hit(deck){
    this.hand.addCard(deck.dealCard());
  }
}

class Dealer{
  hand;

  constructor(){
    this.hand = new Hand();
  }

  play(){
    while(this.hand.score < 17){
      this.hand.addCard(deck.dealCard());
    }
  }
}


class Game{
  deck;
  selectedSlots;
  dealer;
  player;

  constructor(){
    this.deck = new Deck(6);  
    this.player = new Player("Camilo");
    this.dealer = new Dealer();
    this.selectedSlots = [];
  }

  joinSlot(slotIndex){
    if(!this.selectedSlots[slotIndex]){
      this.selectedSlots[slotIndex] = this.player.addSlot();
      return true;
    }
    return false;
  }

  printSlots(){
    this.selectedSlots.forEach((slot, index) => {
      console.log(`Slot ${index}: ${slot.hand}`);
    });
  }
  dealCards(){
    if(this.selectedSlots.length == 0){
      alert("Please select at least one slot");
      return;
    }

    const totalRounds = 2;
    for (let round = 0 ; round < totalRounds ; round++){
      this.selectedSlots.forEach((slot,index) =>{
        slot.hit(this.deck);
        console.log(`Dealt to Slot ${index}: ${slot.hand}`);
      });
      if(round==0){
        this.dealer.hand.addCard(this.deck.dealCard());
        console.log(`Dealt to Dealer: ${this.dealer.hand}`);
      }    
    }
  }
}

const game = new Game();

//ASSIGN SLOT
document.querySelectorAll(".slot-btn").forEach((btn) => {
  btn.addEventListener("click", function() {
    const slotIndex = this.getAttribute("data-slot");
    if (game.joinSlot(slotIndex)) {
      this.textContent = `Playing by ${game.player.name}`;
      this.disabled = true;
    }
    game.printSlots();
  });

});

//DEAL-BUTTON
document.getElementById("deal-button").addEventListener("click", function() {
    game.dealCards();
});

/*

//Function to deal first n of cards
//modifies Deck object
//return Object rapresenting player and dealer hands
const dealCards = (deck, nCards) => {
  const playersHand = [];
  const dealersHand = [];

  for (let i = 0; i < nCards; i++){
    if(i % 2 == 0){
      drawCard(playersHand, deck);
    }else{
      drawCard(dealersHand, deck);
    }
  }

  return {playersHand, dealersHand};
}

//Function to activate or deactivate Bet Buttons
const disableBetButtons = (boolean) => {
  betButtons.forEach( button =>{
    button.disabled = boolean;
  })
}

//Function takes card on 16 and stay on 17
//modifies Deck object
//modifies dealersHand array
//Return dealer Score
const dealersTurn = (dealersHand, deck) => {
  let dealerScore = getHandScore(dealersHand);
  
  let dealerAces = dealersHand.filter(card => card.rank === "Ace").length;

  while(dealerScore < 17 && !isBust(dealersHand)){
    let card = drawCard(dealersHand, deck);
    let cardValue = getCardValue(card);
    dealerScore += cardValue;
    if(cardValue == GAME_VALUES.ACE_VALUE){
      dealerAces++;
    }
    while(dealerAces > 0 && dealerScore > GAME_VALUES.BLACKJACK_SCORE){
      dealerScore -= GAME_VALUES.FACE_CARD_VALUE;
      dealerAces--;
    }
  }
  updateHandAndScore(dealersHand,dealerScore,dealersHandDiv,dealerScoreDiv);

  return dealerScore;
}

//Function to update hand and score HTML
const updateHandAndScore = (hand,score, handDiv, scoreDiv) =>{
  displayHand(hand, handDiv);
  displayScore(score, scoreDiv);
}

//Function calculates payout
//Bet + winnings
const calculatePayout = (bet, multiplier) => {
  return bet * multiplier;
}

//Reset buttons TO only allow NEWGAME button
const resetButtons = () => {
  hitButton.disabled = true;
  standButton.disabled = true;
  dealButton.disabled = true;
  newGameButton.disabled = false;
}

//Empty HTML and reset buttons
const resetGame = () =>{
  playersHandDiv.innerHTML = "";
  dealersHandDiv.innerHTML = ""; 
  playerScoreDiv.innerHTML = "";
  dealerScoreDiv.innerHTML = "";
  messageDiv.innerHTML = "";
  resultDiv.innerHTML = "";
  
  playersHand = [];
  dealersHand = [];
  playerScore = 0;
  dealerScore = 0;
  dealButton.disabled = false;
}

// General function to create a button in the DOM
//Return button created
const createActionButton = (id, label) => {
  const button = document.createElement("button");
  const actionsContainer = document.querySelector(".actions");
  button.setAttribute("id", id);
  button.innerHTML = label; 
  actionsContainer.insertBefore(button, actionsContainer.children[1]);

  return button; 
};

//Function to determine the winner of the game
//return string
const determineWinner = (playersHand, dealersHand,) => {
  const playerScore = getHandScore(playersHand);
  const dealerScore = getHandScore(dealersHand);
  //BlackJack cases
  if (isBlackjack(playersHand) && dealerScore === GAME_VALUES.ACE_VALUE) return GAME_RESULTS.PAY_BLACKJACK_1_TO_1;
  if (isBlackjack(playersHand) && isBlackjack(dealersHand)) return GAME_RESULTS.BOTH_BLACKJACK;
  if (isBlackjack(playersHand)) return GAME_RESULTS.PLAYER_BLACKJACK;
  if (isBlackjack(dealersHand)) return GAME_RESULTS.DEALER_BLACKJACK;
  
  //Regular cases
  if (isBust(playersHand)) return GAME_RESULTS.PLAYER_BUST;
  if (isBust(dealersHand)) return GAME_RESULTS.DEALER_BUST;
  if (playerScore > dealerScore) return GAME_RESULTS.PLAYER_WINS;
  if (playerScore < dealerScore) return GAME_RESULTS.DEALER_WINS;
  
  return GAME_RESULTS.TIE;
}

//Function to pay the winning based on bet and outcome
//returns the balance updated
const payWinnings = (result, bet, balance) => {
  const multiplier = PAYOUT_MULTIPLIERS[result] || 0;
  const payout = calculatePayout(bet,multiplier);

  return balance += payout;
}

//Logic to handle the end of the game
//Displays outcome
//Pay winnings and update balance
//return balance
const endTurn = (playersHand,dealersHand, bet, balance) => {
  const result = determineWinner(playersHand,dealersHand);
  resultDiv.innerHTML = result;
  balance = payWinnings(result,bet,balance);
  balanceDiv.innerHTML = `${balance}`;
  resetButtons();

  return balance;
}

//Display all cards in hand in a redable format in the given div
const displayHand = (hand,div) => {
  const handString = hand.map(card => `${card.rank} of ${card.suit}`).join(' | ');
  div.innerHTML = handString;
}

//Display the score in the given div
const displayScore = (score,div) => {
  div.innerHTML = "Score : " + score;
}

//COSTANTS RESULTS
const GAME_RESULTS = {
  PLAYER_BLACKJACK: "PLAYER_BLACKJACK",
  DEALER_BLACKJACK: "DEALER_BLACKJACK",
  BOTH_BLACKJACK: "BOTH_BLACKJACK",
  PLAYER_BUST: "PLAYER_BUST",
  DEALER_BUST: "DEALER_BUST",
  PLAYER_WINS: "PLAYER_WINS",
  DEALER_WINS: "DEALER_WINS",
  TIE: "TIE",
  PAY_BLACKJACK_1_TO_1: "PAY_BLACKJACK_1_TO_1",
};

//CONST PAYOUTS
const PAYOUT_MULTIPLIERS = {
  [GAME_RESULTS.PLAYER_BLACKJACK]: 2.5,
  [GAME_RESULTS.PLAYER_WINS]: 2,
  [GAME_RESULTS.DEALER_BUST]: 2,
  [GAME_RESULTS.TIE]: 1,
  [GAME_RESULTS.BOTH_BLACKJACK]: 1,
  [GAME_RESULTS.PAY_BLACKJACK_1_TO_1]: 2,
};

//CONST GAME
const GAME_VALUES = {
  ACE_VALUE: 11,
  BLACKJACK_SCORE: 21,
  FACE_CARD_VALUE : 10,
}

//GAME VARIABLES AND FLOW
let deck = []; 
let playersHand = [];
let dealersHand = [];
let balance = 100;
let bet = 0;
let playerScore = 0;  
let dealerScore = 0;
let isInsurance = false;
let dealersHandDiv = document.getElementById("dealer-cards");
let playersHandDiv = document.getElementById("player-cards");
let messageDiv = document.getElementById("message");
let resultDiv = document.getElementById("result");
let insuranceDiv = document.getElementById("insurance");
let playerScoreDiv = document.getElementById("player-score");
let dealerScoreDiv = document.getElementById("dealer-score");
  
let betDiv = document.getElementById("show-bet");
let balanceDiv = document.getElementById("balance-display");

let newGameButton = document.getElementById("new-game-button");
let dealButton = document.getElementById("deal-button");
let hitButton = document.getElementById("hit-button");
let standButton = document.getElementById("stand-button");

let betButtons = document.querySelectorAll('.bet-button');

let doubleDownButton = null;
let insuranceButton = null;
let OnetoOneBlackjackButton = null;

balanceDiv.innerHTML = `${balance}`;
resetButtons();

/* if(doubleDownButton){
  doubleDownButton.remove();
}
if(insuranceButton){
  insuranceButton.remove();
}
 

//EVENTLISTENERS
//NEW GAME
newGameButton.addEventListener("click", () => {
  //Create and Shuffle deck
  deck = shuffleDeck(createDeck(deck));
  //Empty HTML and reset buttons
  resetGame();
  disableBetButtons(false);
})

//PLACE THE BET
betButtons.forEach(button =>{
  button.addEventListener("click", () => {
    bet = parseInt(button.innerHTML);
    betDiv.innerHTML = `Bet:  ${bet}`;
  })
})

//DEAL CARDS
dealButton.addEventListener("click", () => {
  
  if(bet == 0){
    messageDiv.innerHTML = "Place a bet first!";
    return;
  }
  if(bet > balance){
    messageDiv.innerHTML = "Not enough balance to place bet!";
    return;
  }
  messageDiv.innerHTML = "";
  disableBetButtons(true);

  //Remove after debug
  dealButton.disabled = true;
  newGameButton.disabled =true;
  hitButton.disabled = false;
  standButton.disabled = false;
  //Remove after debug


  //remove bet from total balance
  balance -= bet;
  balanceDiv.innerHTML = `${balance}`;
  
  ({ playersHand, dealersHand } = dealCards(deck,3));

  //TOO MUCH REPEATED CODE WHEN DRAWCARD AND DISPLAYING HAND/SCORE
  //Display dealer's hand
  dealerScore = getHandScore(dealersHand);
  updateHandAndScore(dealersHand,dealerScore,dealersHandDiv,dealerScoreDiv);
  //Display player's hand
  playerScore = getHandScore(playersHand);
  updateHandAndScore(playersHand,playerScore,playersHandDiv,playerScoreDiv);

})

//STAND
standButton.addEventListener("click", () => {
  //Dealer's turn
  dealerScore = dealersTurn(dealersHand,deck);
  balance = endTurn(playersHand,dealersHand,bet,balance);
});


//HIT
hitButton.addEventListener("click", () => {
  const card = drawCard(playersHand, deck);
  const cardValue = getCardValue(card);
  const playerAces = playersHand.filter(card => card.rank === "Ace").length;
  playerScore += cardValue;

  while(playerAces > 0 && playerScore > GAME_VALUES.BLACKJACK_SCORE){
    playerScore -= GAME_VALUES.FACE_CARD_VALUE;
    playerAces--;
  }
  updateHandAndScore(playersHand,playerScore,playersHandDiv,playerScoreDiv);

  if(isBust(playersHand)){
    balance = endTurn(playersHand,dealersHand,bet,balance);
  }else if(playerScore == GAME_VALUES.BLACKJACK_SCORE){
    dealerScore = dealersTurn(dealersHand,deck);
    balance = endTurn(playersHand,dealersHand,bet,balance);
  }
}); */


