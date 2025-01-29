// 1- Create deck
// 2- Shuffle cards
// 3 - Deal cards
// 4- Remove them from deck
// 5- Implement players options
// 6- Create dealers logic
// 7- Determine the winner
// 8- Play again


//FUNCTIONS
//Create deck
//Return order list obj
const createDeck = () =>{
  const deck = [];
  const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
  const ranks = [ "Ace","2", "3", "4", "5", "6", "7", "8", "9", "10","Jack", "Queen", "King"];
  
  // Generate the deck
  suits.forEach(suit => {
    ranks.forEach(rank => {
      deck.push({ rank, suit });
    });
  });
  return deck;
}

//Fisher-Yates Shuffle Function to Shuffle the deck
//return deck list obj
const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}


//Function to calculate value of the card
//Return int 
const getCardValue = (card) => {
  let value = 0;
  if (card.rank == "Ace") value  = 11;
  else if (card.rank == "Jack" || card.rank == "Queen" || card.rank == "King") value = 10;
  else value = parseInt(card.rank);
  
  return value;
}

//Calculate score of a hand
//return total score
const calculateScore = (hand) => {
  let aces = 0;
  let score = 0;
  for(card in hand){
    score += getCardValue(hand[card]);   
    if(hand[card].rank == "Ace"){
      aces++;
    }   
  }
  while(score > 21 && aces > 0){
    score -= 10;
    aces--;
  }
  return score;
}


//Function to get card from deck
//updates deck and hand
//Return the updated hand
const drawCard = (hand, deck) => {
  const card = deck.shift();
  hand.push(card);
  return hand
}

//Function to check if the hand is blackJack
//return boolean
const isBlackjack = (hand) =>{
  return calculateScore(hand) == 21 && hand.length == 2;
}

//function to check if the hand is bust
//return boolean
const isBust = (hand) =>{
  return calculateScore(hand) > 21;
}


//Function to deal first 3 cards
const dealCards = (deck) => {
  const playersHand = [];
  const dealersHand = [];
  
  for (let i = 0; i < 3; i++){
    if(i % 2 == 0){
      playersHand.push(deck.shift());
    }else{
      dealersHand.push(deck.shift());
    }
  }
  return {playersHand, dealersHand};

}
const disableBetButtons = (boolean) => {
  betButtons.forEach( button =>{
    button.disabled = boolean;
  })
}
//Function takes card on 16 and stay on 17
//No return value
const dealersTurn = (dealersHand, deck) => {
  while(calculateScore(dealersHand) < 17 && !isBust(dealersHand)){
    dealersHand = drawCard(dealersHand, deck);
  }
  let dealerScore = calculateScore(dealersHand)
  displayHand(dealersHand, dealersHandDiv);
  displayScore(dealerScore, dealerScoreDiv);
}

//Reset buttons when end game
const resetButtons = () => {
  hitButton.disabled = true;
  standButton.disabled = true;
  dealButton.disabled = true;
  newGameButton.disabled = false;
  disableBetButtons(true);
}


//Function to determine the winner of the game
//return string
const determineWinner = (playersHand, dealersHand) => {
  const playerScore = calculateScore(playersHand);
  const dealerScore = calculateScore(dealersHand);
  //BlackJack cases
  if (isBlackjack(playersHand) && dealerScore === 11) return GAME_RESULTS.PAY_BLACKJACK_1_TO_1;
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



//Balance and bets functions
const placeBet = (bet) => {
  balance -= bet;
  return balance;
}

//Return amount won (bet + winnings)
const calculatePayout = (bet, odds) => {
  return bet * odds;
}


//PLACE THE BET
const betButtons = document.querySelectorAll('.bet-container button');
betButtons.forEach(button =>{
  button.addEventListener("click", () => {
    bet = parseInt(button.innerHTML);
    betDiv.innerHTML = `Bet:  ${bet}`;
  })
})


//Empty HTML and reset buttons
const resetGame = () =>{
  resultDiv.innerHTML = "";
  playersHandDiv.innerHTML = "";
  dealersHandDiv.innerHTML = ""; 
  messageDiv.innerHTML = "";
  
  playerScoreDiv.innerHTML = "";
  dealerScoreDiv.innerHTML = "";

  playersHand = [];
  dealersHand = [];
  playerScore = 0;
  dealerScore = 0;

  dealButton.disabled = false;
  disableBetButtons(false);
  
}
// General function to create a button in the DOM
const createActionButton = (id, label) => {
  const button = document.createElement("button");
  const actionsContainer = document.querySelector(".actions");
  button.setAttribute("id", id);
  button.innerHTML = label; 
  actionsContainer.insertBefore(button, actionsContainer.children[1]);
  return button; 
};

//Return total balance of players
const payWinnings = (result, bet, balance) => {
  const multiplier = PAYOUT_MULTIPLIERS[result] || 0;
  const payout = calculatePayout(bet,multiplier);
  return balance + payout;
}

//Logic to handle the end of the game
const endTurn = (playersHand,dealersHand) => {

  let result = determineWinner(playersHand,dealersHand);
  resultDiv.innerHTML = result;

  resetButtons();

  balance = payWinnings(result);
  balanceDiv.innerHTML = `${balance}`;
}

//CURRENTLY DISPLAYING AN OBJECT
//NEED FIXING TO SHOW MORE READABLE DATA
const displayHand = (hand,div) => {
  div.innerHTML = JSON.stringify(hand);
}

//Display the score in the given div
const displayScore = (score,div) => {
  div.innerHTML = "Score : " + JSON.stringify(score);
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

let doubleDownButton = null;
let insuranceButton = null;
let OnetoOneBlackjackButton = null;

balanceDiv.innerHTML = `${balance}`;
resetButtons();
if(doubleDownButton){
  doubleDownButton.remove();
}
if(insuranceButton){
  insuranceButton.remove();
}


//EVENTLISTENERS
//NEW GAME
newGameButton.addEventListener("click", () => {
  //Empty both deal and players hands
  //Create and Shuffle deck
  deck = shuffleDeck(createDeck(deck));
  
  //Empty HTML and reset buttons
  resetGame();
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
  disableBetButtons(true);
  messageDiv.innerHTML = "";
  //remove bet from total balance
  betDiv.innerHTML = `Bet: ${bet}`;
  balance = placeBet(bet);
  
  ({ playersHand, dealersHand } = dealCards(deck));
  //TOO MUCH REPEATED CODE WHEN DRAWCARD AND DISPLAYING HAND/SCORE

  //Display dealer's hand
  dealerScore = calculateScore(dealersHand);
  displayHand(dealersHand, dealersHandDiv);
  displayScore(dealerScore, dealerScoreDiv);
  //Display player's hand
  playerScore = calculateScore(playersHand);
  displayHand(playersHand, playersHandDiv);
  displayScore(playerScore, playerScoreDiv);


  //IMPROVE THE LOGIC OF INSURANCE + BLACKJACKS BOTH PLAYER AND DEALER
  

  //

  //HANDLES INSURANCE WHEN DEALER SHOWING ACE
  if(dealerScore == 11){
    insuranceButton = createActionButton("insurance-button", "Insurance");
    insuranceButton.addEventListener("click", () =>{
      //insurance cost is half the original bet
      let insurance = bet * 0.5;
      if(balance >= insurance){
        balance = placeBet(insurance);
        messageDiv.innerHTML = "Player places insurance!";
        insuranceDiv.innerHTML = `Insurance: ${insurance}`;
        isInsurance = true;
      }
    })
  }
  //HANDLES BLACKJACK SCENARIO

  //add logic in case dealers shows BJ (get paid 1 to 1)
  //PLAYER HAS BLACKJACK
  if(isBlackjack(playersHand)){
    
    if (dealerScore == 10 || dealerScore == 11){
      dealersHand = drawCard(dealersHand, deck);
      dealerScore = calculateScore(dealersHand);
      displayHand(dealersHand, dealersHandDiv); 
      displayScore(dealerScore, dealerScoreDiv);
    }
    result = determineWinner(playersHand, dealersHand);  
    balance = payWinnings(result);
    resultDiv.innerHTML = result;
    resetButtons();
  //REGULAR GAMEPLAY SCENARIO
  }else{
    dealButton.disabled = true;
    newGameButton.disabled =true;

    hitButton.disabled = false;
    standButton.disabled = false;
  }
  balanceDiv.innerHTML = `${balance}`;

  //Hanldes double down 
  if(playerScore >= 9 && playerScore <= 11){
    doubleDownButton = createActionButton("double-down-button", "Double");
    doubleDownButton.addEventListener("click", () => {
      if(balance >= bet){
        balance = placeBet(bet);
        balanceDiv.innerHTML = `${balance}`;
        bet += bet;
        betDiv.innerHTML = `Bet:  ${bet}`;
        messageDiv.innerHTML = "Player doubles down! One card only."
        
        playersHand = drawCard(playersHand, deck);
        playerScore = calculateScore(playersHand);
        displayHand(playersHand, playersHandDiv);
        displayScore(playerScore, playerScoreDiv);

        dealersTurn(dealersHand,deck);
        endTurn(playersHand,dealersHand);
      }else{
        messageDiv.innerHTML = "Not enough balance to double down!Just take a card brokie";
      }
    
      doubleDownButton.remove();
    });
  }
})

//STAND
standButton.addEventListener("click", () => {
  //Dealer's turn
  dealersTurn(dealersHand,deck);
  endTurn(playersHand,dealersHand);
});


//HIT
hitButton.addEventListener("click", () => {
  playersHand = drawCard(playersHand, deck);
  
  playerScore = calculateScore(playersHand);
  displayHand(playersHand, playersHandDiv);
  displayScore(playerScore, playerScoreDiv);

  if(isBust(playersHand)){
    resultDiv.innerHTML = "Player Busts! Dealer Wins!";
    resetButtons();

  }else if(playerScore == 21){
    dealersTurn(dealersHand,deck);
    endTurn(playersHand,dealersHand);
  }
  
});



