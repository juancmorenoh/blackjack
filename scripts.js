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
    return `[${this.cards.join(", ")}] | Score: ${this.score}`;
  }
}

class Player{
  balance;
  name;

  constructor(name){
    this.balance = 0;
    this.name = name;
  }

  addBalance(amount){
    this.balance += amount;
  }

  getTotalBetAmount(slots){
    let totalAmount = 0;
    slots.filter(slot => slot !== null).forEach(slot => {
      totalAmount += parseInt(slot.bet);
    });
    return totalAmount;
  }
}

class Slot{
  hand;
  player;
  bet;
  status;

  constructor(player){
    this.hand = new Hand();
    this.player = player;
    this.bet = 0;
    this.status = "active";
  }

  placeBet(amount){
    if(amount > this.player.balance){
      return;
    }
    this.bet = amount;
    this.player.balance -= amount;
  }


  hit(deck){
    this.hand.addCard(deck.dealCard());
  }
}

class Dealer{
  hand;

  constructor(){
    this.hand = new Hand();
  }

  play(deck){
    while(this.hand.score < 17){
      this.hand.addCard(deck.dealCard());
    }
  }
}


class Game{
  started;
  deck;
  selectedSlots;
  dealer;
  player;

  constructor(player, numSlots){
    this.deck = new Deck(6);  
    this.player = player;
    this.dealer = new Dealer();
    this.selectedSlots = new Array(numSlots).fill(null);
    this.started = false;
  }

  /*
  joinSlot(slotIndex){
    if(!this.selectedSlots[slotIndex]){
      this.selectedSlots[slotIndex] = this.player.addSlot();
      return true;
    }
    return false;
  }
*/

  joinSlot(slotIndex) {
    if (this.selectedSlots[slotIndex] == null) {
      console.log("Creating slot")
      // Add slot if null
      this.selectedSlots[slotIndex] = new Slot(this.player);
      return true;
    } else {
      // Remove slot if it already exists
      //reset bet to 0 before deleting slot
      console.log("Removing slot")
      //this.selectedSlots[slotIndex].bet = 0;
      this.selectedSlots[slotIndex] = null;
      return false;
    }
  }

  checkBeforeDealingCards(){
    if(this.selectedSlots.filter(slot => slot != null).length == 0){
      alert("Please select at least one slot");
      return false;
    }else if((this.deck.cards.length < 52)){
      alert("Not enough cards in the deck. Please reset the game");
      return false;
    }else if(!this.isValidBet()){
      alert("Not enough money");
      return false;
    }else if(!this.allSelectedSlotBet()){
      alert("Place a bet in all slots");
      return false;
    }
    return true;
  }

  dealFirstCards(){    
    const totalRounds = 2;
    for (let round = 0 ; round < totalRounds ; round++){
      this.selectedSlots.forEach((slot,index) =>{
        if(slot != null){
          slot.hit(this.deck);
          console.log(`Dealt to Slot ${index}: ${slot.hand}`);
        }
      })
      
      this.dealer.hand.addCard(this.deck.dealCard()); 
      console.log(`Dealt to Dealer: ${this.dealer.hand}`); 
    }
  }

  //function to check if the total bet is less than the balance
  isValidBet(){
    const bet = this.player.getTotalBetAmount(this.selectedSlots);
    if (bet > this.player.balance){
      return false;
    }
    return true;
  }

  //function to check if all slots have a bet
  allSelectedSlotBet(){
    return this.selectedSlots.filter(slot => slot !== null).every(slot => slot.bet > 0);
  }
}

const player1 = new Player("Luca");
player1.addBalance(50);
const game = new Game(player1,3);
document.getElementById("balance-display").innerHTML = player1.balance;
toggleActionBtn(true);


function toggleActionBtn(boolean){
  document.getElementById("hit-button").disabled = boolean;
  document.getElementById("stand-button").disabled = boolean;
}

//ASSIGN SLOT
document.querySelectorAll(".slot-btn").forEach((btn) => {
  btn.addEventListener("click", function() {
    console.log("clicked");
    if(game.started){
      alert("Cannot remove or add slots mid game");
      return;
    }
    const slotIndex = this.getAttribute("data-slot");
    const parentDiv = this.parentElement;

    if(game.joinSlot(slotIndex)) {
        console.log(`slot ${slotIndex} created`);
        this.textContent = `Playing by ${game.player.name}`;
        //using innetHTML override the listener when changing is content, insertAjacentHTML instead
        this.insertAdjacentHTML("afterend", `<input type="radio" id="slot-${slotIndex}" name="bet-slot" value=${slotIndex}>`);
      
    }else{
      console.log(`slot ${slotIndex} removed`);
      //remove radio input
      const radio = parentDiv.querySelector(`input[id="slot-${slotIndex}"]`);
      if(radio) radio.remove();

      
      //remove bet from HTML
      const betAmountElement = parentDiv.querySelector('.bet-amount');
      if (betAmountElement) betAmountElement.textContent = "";

      const handDiv = parentDiv.querySelector('.hand-display');
      if (handDiv) handDiv.textContent = "";
      this.innerHTML = `Join Slot ${slotIndex}`; // Reset button text
      
    }  
  });

});

//ASSIGN BET TO SLOT
document.querySelectorAll(".bet-button").forEach((betBtn) => {
  betBtn.addEventListener("click", function () {
    if(game.started){
      alert("Cannot change your bet mid game");
      return;
    }
    const selectedSlot = document.querySelector('input[name="bet-slot"]:checked');

    if (!selectedSlot) {
      alert("Please select a slot first!"); 
      return;  
    }
    const slotIndex = selectedSlot.value;
    const valueBet = this.innerHTML;
    game.selectedSlots[slotIndex].bet = valueBet;
    
    const betAmountElement = selectedSlot.parentElement.querySelector('.bet-amount');
    betAmountElement.textContent = `Bet: ${valueBet}`;
  });
});

//DEAL-BUTTON
document.getElementById("deal-button").addEventListener("click", function() {
  console.log(game.selectedSlots)
  if(game.started){
    alert("End the game before starting a new one!");
    return;
  }
  //if bet and slot are all good, deal cards
  if(game.checkBeforeDealingCards()){

    //place bet of all not null slots
    game.selectedSlots.filter(slot => slot != null).forEach(slot =>{
      slot.placeBet(slot.bet)
    });

    console.log(`Total bet amount is: ${game.player.getTotalBetAmount(game.selectedSlots)}`);
    resetGame();
    game.started = true;
    updateDisplayBalance();
    //deal the first round of cards (2 cards each)
    game.dealFirstCards();

    document.querySelectorAll(".slot").forEach((slotDiv,index) =>{
      const slot = game.selectedSlots[index];
      if(slot != null){
        slotDiv.querySelector(".hand-display").innerHTML = `${slot.hand}`
      }
    })
    
    toggleActionBtn(false)
    displayDealerHand();

    if (game.dealer.hand.score == 21){
      //Push with slots that have BJ
      //End game if no player has it
      dealerHasBlackjack();
    }else{
      //Pay slots with BJ and set them to null
      handlePlayersBj();
      //IF All slots had Bj, end game
      if (game.selectedSlots.every(slot => slot == null || slot.status == "inactive")) {
        console.log("All players got Blackjack! Game ends.");
        game.started = false;
        toggleActionBtn(true);
      }
    } 
  }   
});


function displayDealerHand(){
  const dealerHand = game.dealer.hand;
  document.getElementById("dealer-cards").innerHTML = `${dealerHand}`
    displayDealerHand();
};


function displayDealerHand(){
  const dealerHand = game.dealer.hand;
  document.getElementById("dealer-cards").innerHTML = `${dealerHand}`
}




let currentSlotIndex = 0;



//HIT-STAND BUTTONS
document.querySelector(".actions").addEventListener("click", function(event) {
  const currentSlot = game.selectedSlots[currentSlotIndex];


  //First slot is mostly skipped if not manuallt handled
  //Most logic is in NextTurn() which is only called after
  //remove
  if(currentSlot){
    highlightCurrentSlot();
  }
  //remove


  if((!currentSlot || currentSlot.status == "inactive") && game.started){
    console.log("THIS FIRST HAND IS EMPTY");
    nextSlot();
    return;
  }
  
  if(event.target.id == "hit-button") {
    currentSlot.hit(game.deck);
    updateHandDisplay(currentSlotIndex);
    if (currentSlot.hand.score > 21) {  
      console.log(`Slot ${currentSlotIndex} BUST!`);
      nextSlot();
    } else if (currentSlot.hand.score === 21) {  
      console.log(`Slot ${currentSlotIndex} STAND`);
      nextSlot();
    }
  }
  if(event.target.id == "stand-button") {
    console.log(`slot ${currentSlotIndex} STAND`)
    nextSlot();
  }
});

//function to display the dealer's hand
function displayDealerHand(){
  const dealerHand = game.dealer.hand;
  document.getElementById("dealer-cards").innerHTML = `${dealerHand}`
}

//Function to display player's hand in each slot
function updateHandDisplay(slotIndex) {
  const slotDiv = document.querySelector(`.slot[data-slot="${slotIndex}"]`);
  const playerSlot = game.selectedSlots[slotIndex];

  if (slotDiv && playerSlot) {
    slotDiv.querySelector(".hand-display").innerHTML = `${playerSlot.hand}`;
  }
}

//Function to move to next slot
function nextSlot(){
  currentSlotIndex++;
  while (currentSlotIndex < game.selectedSlots.length && (game.selectedSlots[currentSlotIndex] === null|| game.selectedSlots[currentSlotIndex].status == "inactive")) {
    currentSlotIndex++;
  }
  //remove
  highlightCurrentSlot();
  //remove
  if(currentSlotIndex < game.selectedSlots.length){
    console.log(`Next turn: Player in Slot ${currentSlotIndex}`);
  }else{
    (currentSlotIndex == game.selectedSlots.length)
    console.log("All players have finished. Dealer's turn!");
    game.dealer.play(game.deck);
    displayDealerHand();
    payoutSlots();
    updateDisplayBalance();
    toggleActionBtn(true);
    game.started = false;
    currentSlotIndex = 0;
  }
  
}

function updateDisplayBalance(){
  document.getElementById("balance-display").innerHTML = player1.balance;
}

function payoutSlots() {
  const dealerScore = game.dealer.hand.score;

  game.selectedSlots.forEach((slot, index) => {
    if (slot == null || slot.status == "inactive") return;
    const playerScore = slot.hand.score;

    if (playerScore > 21) {
      console.log(`Slot ${index} busted and lost the bet.`);
      
    } else if (dealerScore > 21) {
      console.log(`Dealer busted! Slot ${index} wins.`);
      player1.balance += parseInt(slot.bet) * 2; 
    } else if (playerScore > dealerScore) {
      console.log(`Slot ${index} wins!`);
      player1.balance += parseInt(slot.bet)  * 2; 
    } else if (playerScore < dealerScore) {
      console.log(`Slot ${index} loses.`);
      
    } else {
      console.log(`Slot ${index} pushes (tie). Bet returned.`);
      player1.balance += parseInt(slot.bet) ;
    }
  });
}

function resetGame(){
  document.querySelectorAll(".hand-display").forEach((elment)=>{
    elment.innerHTML = "";
  });
  document.getElementById("dealer-cards").innerHTML = "";

  game.selectedSlots.filter(slot => slot!= null).forEach((slot) => {
    slot.status = "active";
    slot.hand = new Hand();
  });
  game.dealer.hand = new Hand();
}


//Logic to be immproved and remove redundant checks
//FUNCTIONS TO HANDLE BLACKJACKS

//Return an Array of Indexes of slots with BJ
function getIndexesBj(slots) {
  let indexWithBj = [];
  slots.forEach((slot, index) => {
    if (slot == null) return;
    if (slot.hand.score === 21 && slot.hand.cards.length === 2) {
      indexWithBj.push(index);
    }
  });
  return indexWithBj;
}


//Pays slots with BJ when dealer Doesn't
function handlePlayersBj(){
  let indexesWithBj = getIndexesBj(game.selectedSlots);
  if (indexesWithBj.length > 0) {
    console.log("Some players have Blackjack, but the dealer does not.");

    indexesWithBj.forEach(index => {
      let slot = game.selectedSlots[index];
      console.log(`Slot ${index} wins with Blackjack! Paying 1.5x the bet.`);
      slot.player.addBalance(slot.bet * 1.5); // 1.5x payout
      game.selectedSlots[index].status = "inactive"; // Remove slot from play
    });
  }
}
//Dealer has BJ
//Push with slots that have BJ
//End game if nonone has it
function dealerHasBlackjack() {
    console.log("Dealer has BJ")
    let indexesWithBj = getIndexesBj(game.selectedSlots);
    //If no other player has BJ, end game
    if(indexesWithBj.length == 0){
      console.log("No other player has Blackjack, Dealer wins, end game");
      toggleActionBtn(true);
      game.started = false;
      currentSlotIndex = 0;
    }else{
      bjIndices.forEach(index => {
        let slot = game.selectedSlots[index];
        console.log(`slot ${index} has BJ, and Ties`);
        slot.player.addBalance(slot.bet); // Bet returned
        game.selectedSlots[index].status = "inactive";
      });
    }
}

function createDoubleButton(){
  //Create button double
  const doubleButton = document.createElement("button");
  doubleButton.innerHTML = "Double";
  doubleButton.id = `double-btn-${slotIndex}`;

  //insert in actions Div
  document.querySelector(".actions").appendChild(doubleButton);
}




//REMOVE
function highlightCurrentSlot() {
  document.querySelectorAll(".slot").forEach(slot => slot.classList.remove("active-slot"));
  const activeSlot = document.querySelector(`.slot[data-slot="${currentSlotIndex}"]`);
  if (activeSlot) activeSlot.classList.add("active-slot"); 
}
//REMOVE

//REMEBER TO ACTIVATE ALL PLAYING SLOTS
/*



//Function to activate or deactivate Bet Buttons
const disableBetButtons = (boolean) => {
  betButtons.forEach( button =>{
    button.disabled = boolean;
  })
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


