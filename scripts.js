// 1- Create deck
// 2- Shuffle cards
// 3 - Deal cards
// 4- Remove them from deck
// 5- Implement players options
// 6- Create dealers logic
// 7- Determine the winner
// 8- Play again


//Create deck
//Return order list obj
let createDeck = () =>{
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
let Shuffle = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}




//Function to calculate value of the card
//Return int 
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

//Calculate score of a hand
//return total score
let calculateScore = (hand) => {
  let aces = 0;
  let score = 0;
  for(card in hand){
    score += valueCard(hand[card]);   
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
let drawCard = (hand, deck) => {
  let card = deck.shift();
  hand.push(card);
}

//Function to check if the hand is blackJack
//return boolean
let isBlackjack = (hand) =>{
  return calculateScore(hand) == 21 && hand.length == 2;
}
//function to check if the hand is bust
//return boolean
let isBust = (hand) =>{
  return calculateScore(hand) > 21;
}


//Function to deal first 3 cards
let dealCards = (deck) => {
  let playersHand = [];
  let dealersHand = [];
  
  for (let i = 0; i < 3; i++){
    if(i % 2 == 0){
      playersHand.push(deck.shift());
    }else{
      dealersHand.push(deck.shift());
    }

  }
  return {playersHand, dealersHand};

}

//Function takes card on 16 and stay on 17
//No return value
let dealersPlay = (dealersHand, deck) => {
  while(calculateScore(dealersHand) < 17 && !isBust(dealersHand)){
    drawCard(dealersHand, deck);
  } 
}

let resetButtons = () => {
  hitButton.disabled = true;
  standButton.disabled = true;
  dealButton.disabled = true;
  newGameButton.disabled = false;
}

//Function to determine the winner of the game
//return string
let determineWinner = (playersHand, dealersHand) => {
  if (isBust(playersHand)) return "Player Busts! Dealer Wins!";
  if (isBust(dealersHand)) return "Dealer Busts! Player Wins!";

  let playerScore = calculateScore(playersHand);
  let dealerScore = calculateScore(dealersHand);
  if (playerScore > dealerScore) return "Player Wins!";
  if (playerScore < dealerScore) return "Dealer Wins!";
  
  return "It's a Tie!";
}


let deck = [];

let playersHand = [];
let dealersHand = [];

let dealersHandDiv = document.getElementById("dealer-cards");
let playersHandDiv = document.getElementById("player-cards");
let messageDiv = document.getElementById("message");
let resultDiv = document.getElementById("result");
    
let newGameButton = document.getElementById("new-game-button");
let dealButton = document.getElementById("deal-button");
let hitButton = document.getElementById("hit-button");
let standButton = document.getElementById("stand-button");

resetButtons();
//Disable buttons at start


//NEW GAME
newGameButton.addEventListener("click", () => {
  //Empty both deal and players hands
  playersHand = [];
  dealersHand = [];
  //Shuffle deck
  deck = Shuffle(createDeck(deck));
  
  resultDiv.innerHTML = "";
  //Empty HTML
  playersHandDiv.innerHTML = "";
  dealersHandDiv.innerHTML = ""; 
  dealButton.disabled = false;
})

//DEAL CARDS
dealButton.addEventListener("click", () => {
  
  ({ playersHand, dealersHand } = dealCards(deck));
  let playerScore = calculateScore(playersHand);
  let dealerScore = calculateScore(dealersHand);
  //Display dealer's hand
  dealersHandDiv.innerHTML = JSON.stringify(dealersHand) + "Score: " + dealerScore;

  //Display player's hand
  playersHandDiv.innerHTML = JSON.stringify(playersHand) + "Score: " + playerScore;

  //If players has BJ
  if(isBlackjack(playersHand)){
    if (dealerScore == 10 || dealerScore == 11){
      drawCard(dealersHand, deck);
      dealersHandDiv.innerHTML = JSON.stringify(dealersHand) + "Score: " + dealerScore;
      dealerScore = calculateScore(dealersHand);
      if(dealerScore == 21){
        resultDiv.innerHTML = "Both Dealer and Player have Blackjack! Tie!";
      }else{
        resultDiv.innerHTML = "No Blackjack for the Dealer! Player Wins!";
      }
    }else{
      resultDiv.innerHTML = "Blackjack! Player Wins!";
    } 
    resetButtons();
  }else{
    dealButton.disabled = true;
    newGameButton.disabled =true;

    hitButton.disabled = false;
    standButton.disabled = false;
  }
  
  
})

//STAND
standButton.addEventListener("click", () => {

  //Dealer's turn
  dealersPlay(dealersHand,deck);
  dealersHandDiv.innerHTML = JSON.stringify(dealersHand) + "Score: " + calculateScore(dealersHand);
  let result = determineWinner(playersHand, dealersHand);
  document.getElementById("result").innerHTML = result;
  resetButtons();
});


//HIT
hitButton.addEventListener("click", () => {
  drawCard(playersHand, deck);
  let playersScore = calculateScore(playersHand);

  playersHandDiv.innerHTML = JSON.stringify(playersHand) + "Score: " + playersScore;

  if(isBust(playersHand)){
    resultDiv.innerHTML = "Player Busts! Dealer Wins!";
    resetButtons();

  }else if(playersScore == 21){
    dealersPlay(dealersHand,deck);
    dealersHandDiv.innerHTML = JSON.stringify(dealersHand) + "Score: " + playersScore;
    let result = determineWinner(playersHand, dealersHand);
    resultDiv.innerHTML = result;
    resetButtons();
  }
  
});

