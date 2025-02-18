class Card {
  suit;
  value;
  image;

  constructor(suit,value){
    this.suit = suit;
    this.value = value;
    this.image = this.getImagePath();
  }

  getNumericValue(){
     if(this.value == "A") return 11;
     if(this.value == "J" || this.value == "Q" || this.value == "K") return 10;
     else return parseInt(this.value); 
  }

  getImagePath(){
    const suitInitial = this.suit.charAt(0);
    return `images/cards/${this.value}${suitInitial}.png`;
  }

  toString() {
    return `${this.value}${this.suit.charAt(0)}`;
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
    return this.cards[0].value == this.cards[1].value && this.cards.length == 2;
  }

  isBlackJack(){
    return this.score == 21 && this.cards.length == 2;
  }

  isBust(){
    return this.score > 21
  }

  toString() {
    return `${this.cards}`;
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
  hands;
  player;
  bet;
  status;
  splitBet;
  activeHandIndex;


  constructor(player){
    this.hands = [new Hand()];
    this.player = player;
    this.bet = 0;
    this.splitBet = 0;
    this.status = "inactive";
    this.activeHandIndex = 0;
  }

  placeBet(amount){
    if(amount > this.player.balance){
      return;
    }
    this.bet = amount;
    this.player.balance -= amount;
  }

  hit(deck,handIndex =0){
    this.hands[handIndex].addCard(deck.dealCard());
  }

  split(deck){
    if(!this.hands[0].canSplit() || this.player.balance < this.bet) return false;
    console.log("inside split function, hand can split")
    const firstHand = this.hands[0]
    const secondHand = new Hand();

    secondHand.addCard(firstHand.cards.pop());
    firstHand.addCard(deck.dealCard());
    secondHand.addCard(deck.dealCard());

    this.hands.push(secondHand);
    this.player.balance -= this.bet;
    //create new splitBet attribute to separate the 2 bets
    this.splitBet = this.bet;

    
    return true;
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

  //Display dealer hand on HTML
  displayHand(revealSecondCard = false){
    const dealerDiv = document.querySelector('.dealer');
    dealerDiv.innerHTML = '';
    const handDiv = document.createElement('div');
    handDiv.classList.add('dealer-hand');

    
    this.hand.cards.forEach((card,index) =>{
      const imgElement = document.createElement('img');

      if(!revealSecondCard && index == 1){
        imgElement.src = "images/cards/back.png";
      }else{
        imgElement.src = card.image;
      }
      
      
      imgElement.classList.add('card');
      handDiv.appendChild(imgElement);
    });

    const scoreSpan = document.createElement('span');
    if(!revealSecondCard){
      scoreSpan.innerHTML = `${this.hand.cards[0].getNumericValue()}`
    }else{
      scoreSpan.innerHTML = `${this.hand.score}`;
    }
    
    scoreSpan.classList.add("score");

    dealerDiv.appendChild(handDiv);
    handDiv.appendChild(scoreSpan);

  }

  showAce(){
    return this.hand.cards[0].value == "A"
  }
}


class Game{
  started;
  deck;
  allSlots;
  dealer;
  player;

  constructor(player, numSlots, numDecks){
    this.deck = new Deck(numDecks);  
    this.player = player;
    this.dealer = new Dealer();
    this.allSlots = new Array(numSlots).fill(null);
    this.started = false;

  }

  joinSlot(slotIndex) {
    if (this.allSlots[slotIndex] == null) {
      console.log("Creating slot")
      // Add slot if null
      this.allSlots[slotIndex] = new Slot(this.player);
      return true;
    } else {
      // Remove slot if it already exists
      //reset bet to 0 before deleting slot
      console.log("Removing slot")
      //this.selectedSlots[slotIndex].bet = 0;
      this.allSlots[slotIndex] = null;
      return false;
    }
  }

  checkBeforeDealingCards(){
    if(this.allSlots.filter(slot => slot != null).length == 0){
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
      this.allSlots.forEach((slot,index) =>{
        if(slot != null){
          slot.hit(this.deck);
          console.log(`Dealt to Slot ${index}: ${slot.hands[0]}`);
        }
      })
      this.dealer.hand.addCard(this.deck.dealCard()); 
      console.log(`Dealt to Dealer: ${this.dealer.hand}`); 
    }
  }

  //function to check if the total bet is less than the balance
  isValidBet(){
    const bet = this.player.getTotalBetAmount(this.allSlots);
    if (bet > this.player.balance){
      return false;
    }
    return true;
  }

  //function to check if all slots have a bet
  allSelectedSlotBet(){
    return this.allSlots.filter(slot => slot !== null).every(slot => slot.bet > 0);
  }

  getPlayingSlotIndexes() {
    let playingSlotsIndex = [];
    this.allSlots.forEach((slot,index) => {
      if (slot != null && slot.status != "inactive"){
        playingSlotsIndex.push(index);
      }
    });
    return playingSlotsIndex;
  }
  
  //function to initialize the game
  startRound(){
    if(!this.checkBeforeDealingCards()) return;
    this.started = true;
    //Activate action buttons hit-stand
    toggleActionBtn(false)

    //For all not NULL slots:
    //Place the bet(update balance) - change slot status to true - create a newHand per slot
    this.allSlots.filter(slot => slot != null ).forEach(slot => {
      slot.placeBet(slot.bet);
      slot.status = "active";
      slot.hands = [new Hand()];
    });

    this.playingSlotsIndexes = this.getPlayingSlotIndexes();
    

    //Create new hand for dealer
    this.dealer.hand = new Hand();
    //RESET Hands HTML player-dealer
    document.querySelectorAll(".hand-display").forEach((element)=>{
      element.innerHTML = "";
    });
    document.querySelector(".dealer").innerHTML = "";
    //Remove insurance message from previous turn if any
    const insuranceP = document.querySelectorAll(".insurance-message");
    insuranceP.forEach(p => {
      p.remove(); 
    });
    //update balance
    updateDisplayBalance();
    //deal first 2 cards to players and dealer
    this.dealFirstCards();                  
    //display player hands in html
    const slots = document.querySelectorAll(".slot");
    for (let index = 0; index < slots.length; index++) {
      updateHandDisplay(index);
    }
    //display dealer hand in html
    this.dealer.displayHand();
    
    

    //check dealer Ace
    if(this.dealer.showAce()){
      console.log("Dealer show ace, insurance open for 10seconds");
      //Disable hit-stand and possible double-split btn
      document.querySelectorAll(".actions button").forEach(button =>{
        button.disabled = true;
      })
      //create button and event listener
      //manages all the logic for placing the insurance bet and related HTML
      //updates the player balance
      createInsuranceButton(this.playingSlotsIndexes);
      
      setTimeout(handleInsurance,10000);
      
    }else if(this.dealer.hand.isBlackJack()){
      
      console.log("Dealer has BJ");
      this.endRound();
    }else{
      //Check for players with BJ to pay immidiatly
      handlePlayersBj();
      updateDisplayBalance();
      //If no more active slots
      if (game.allSlots.every(slot => slot == null || slot.status == "inactive")) {
        this.endRound();
      }
    }

    //the current slot is the first active slot of playingIndexes
    this.currentSlotIndex = this.playingSlotsIndexes.find(index => this.allSlots[index].status == "active");
    console.log(game.allSlots);

    setUpCurrentSlot(this.currentSlotIndex);
    
    
  } 

  endRound(){
    //show second card when dealer only has 2 cards
    this.dealer.displayHand(true);
    //pay all active slots
    this.payoutSlots();
    //update balance
    updateDisplayBalance();
    toggleActionBtn(true);
    game.started = false;
    //remove double-button(if dealer BJ and player could potentially double)
    //might do with split as well
    const doubleBtn = document.querySelector('[id^="double-btn-"]');
    if (doubleBtn) doubleBtn.remove();
    //Remove red border from last slot
    const slotDiv = document.querySelector(`.slot[data-slot="${game.currentSlotIndex}"]`);
    if(slotDiv) slotDiv.classList.remove("active-slot");

    //Reset splitBet to 0
    //Could use to reset parts of the slots here
    this.allSlots.forEach((slot,index) => {
      if (slot) {
        slot.splitBet = 0;
        slot.activeHandIndex = 0;
        slot.status = "inactive";
        slot.doubleBet = 0;

        updateBetDisplay(index, slot.bet)
        /* const slotDiv = document.querySelector(`.slot[data-slot="${index}"]`);
        slotDiv.querySelector(".bet-amount").innerHTML = `Bet: ${slot.bet}`; */
      }
    });
    console.log("END OF THE GAME");
  }

  payoutSlots(){
    this.allSlots.forEach((slot, index) => {
      if (slot == null || slot.status == "inactive") return;

      slot.hands.forEach((hand,handIndex) => {
        const dealerScore = this.dealer.hand.score;
        const playerScore = hand.score;

        let handBet = handIndex === 0 ? slot.bet : slot.splitBet;
        handBet = slot.doubleBet ? handBet*2 : handBet;

        if (playerScore > 21) {
          console.log(`Slot ${index} busted and lost the bet.`);
          
        } else if (dealerScore > 21) {
          console.log(`Dealer busted! Slot ${index} wins.  Hand :${handIndex}`);
          this.player.balance += parseInt(handBet) * 2; 
        } else if (playerScore > dealerScore) {
          console.log(`Slot ${index} wins! Hand :${handIndex}`);
          this.player.balance += parseInt(handBet)  * 2; 
        } else if (playerScore < dealerScore) {
          console.log(`Slot ${index} loses.  Hand :${handIndex}` );
          
        } else {
          console.log(`Slot ${index} pushes (tie). Bet returned.  Hand :${handIndex}`);
          this.player.balance += parseInt(handBet) ;
        }
      })
    });
  }

}

function payInsurance(){
  game.allSlots.forEach(slot => {
    if(slot && slot.insurance){
      slot.player.balance += parseInt(slot.insurance) * 3;
      console.log("paid insurance");
      slot.insurance = null;
    }
  })
}


function unToggleDoubleorSplitBtn(idType){
  const btn = document.querySelector(`[id^='${idType}-btn-']`);
  if(btn) btn.disabled = false;
}

//ONLY WHEN DEALER SHOW ACE
function handleInsurance(){
  toggleActionBtn(false);
  unToggleDoubleorSplitBtn("double");
  unToggleDoubleorSplitBtn("split");
  //Remove insurance btn
  const insuranceButtons = document.querySelectorAll(".insurance-btn");
  insuranceButtons.forEach(button => {
    button.remove(); 
  });
  //If dealer has BJ pay insurance and endRound
  if(game.dealer.hand.isBlackJack()){
    payInsurance();
    game.endRound();
    
  }else{//dealer doesn't have BJ
    //remove insurance message
    const insuranceP = document.querySelectorAll(".insurance-message");
    insuranceP.forEach(p => {
      p.remove(); 
    });
    //remove insurance from the slot
    game.allSlots.forEach(slot =>{
      if(slot && slot.insurance){
        slot.insurance = null;
      }
    });
    console.log("Dealer does not have BJ, insurance bets lost")
    //Pay slots with BJ and set them to inactive
    handlePlayersBj();
    //If no more active slots
    if (game.allSlots.every(slot => slot == null || slot.status == "inactive")) {
      endRound();
    }
  }
}

let game;

//event listener for the initial form
document.getElementById("start-form").addEventListener("submit", function() {
  const playerName = document.getElementById("player-name").value;
  const playerBalance = parseFloat(document.getElementById("player-balance").value);
  const numberDecks = parseFloat(document.getElementById("number-decks").value);

  if (isNaN(playerBalance) || playerBalance <= 0 || playerBalance > 1000) {
    alert("Please enter a valid balance!");
    return;
  } 

  const player = new Player(playerName);
  player.addBalance(playerBalance);
  game = new Game(player, 3, numberDecks);

  updateDisplayBalance();
  toggleActionBtn(true);

  document.querySelector(".overlay").remove(); // Enable interactions
});

function toggleActionBtn(boolean){
  document.getElementById("hit-button").disabled = boolean;
  document.getElementById("stand-button").disabled = boolean;
  document.getElementById("deal-button").disabled = !boolean;
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
    const slotDiv = document.querySelector(`.slot[data-slot="${slotIndex}"]`);
    const radioDiv = slotDiv.querySelector('.radio-container');

    if(game.joinSlot(slotIndex)) {
        console.log(`slot ${slotIndex} created`);
        this.textContent = `-`;
        this.classList.add("remove");

        const radioInput = document.createElement("input");
        radioInput.type = "radio";
        radioInput.id = `slot-${slotIndex}`;
        radioInput.name = "bet-slot";
        radioInput.value = slotIndex;
        
        const radioLabel = document.createElement("label");
        radioLabel.htmlFor = `slot-${slotIndex}`;
        radioLabel.textContent = `Slot ${slotIndex}`;
        radioLabel.classList.add("slot-label");

        radioDiv.appendChild(radioInput);
        radioDiv.appendChild(radioLabel)
        
    }else{
      
      this.classList.remove("remove");
      console.log(`slot ${slotIndex} removed`);
      //remove radio input
      const radio = document.querySelector(`input[id="slot-${slotIndex}"]`);
      if(radio) radio.remove();
      const label = document.querySelector(`label[for="slot-${slotIndex}"]`);
      if (label) label.remove();

      
      //remove bet from HTML
      const betAmountElement = slotDiv.querySelector('.bet-amount');
      if (betAmountElement) betAmountElement.remove();

      const handDiv = slotDiv.querySelector('.hand-display');
      if (handDiv) handDiv.textContent = "";
      this.innerHTML = `+`; // Reset button text
      
    }  
    
  });

});

//ASSIGN BET TO SLOT
document.querySelectorAll(".bet-button").forEach((betBtn) => {
  const chipValue =betBtn.dataset.value;
  betBtn.innerHTML = `<img src="images/chips/chip-${chipValue}.png" class=chip-icon>`;

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
    const valueBet = this.dataset.value;
    
    game.allSlots[slotIndex].bet = valueBet;
    updateBetDisplay(slotIndex, valueBet);
    
  });
});



//DEAL-BUTTON
document.getElementById("deal-button").addEventListener("click", function() {
  console.log(game.allSlots)
  if(game.started){
    alert("End the game before starting a new one!");
    return;
  }
  game.startRound();
});

//HIT-STAND-DOUBLE BUTTONS
document.querySelector(".actions").addEventListener("click", function(event) {
  //if current slot does not exists, return immediately
  const currentSlot = game.allSlots[game.currentSlotIndex];
  if(!currentSlot) return;

  if(event.target.id == "hit-button") {
    handlesHit(game.currentSlotIndex);
  }
  if(event.target.id == "stand-button") {
    console.log(`Hand ${currentSlot.activeHandIndex} in slot ${game.currentSlotIndex} STAND`)
    nextSlot();
  }
  //If double, nextTurn and handles the bet and updating the HTML
  if(event.target.id == `double-btn-${game.currentSlotIndex}`) {
    if(currentSlot.activeHandIndex == 1){
      alert("Cannot double down on split hand");
      return;
    }
    if(currentSlot.player.balance >= currentSlot.bet){
      currentSlot.player.balance -= currentSlot.bet;
      //currentSlot.bet *= 2;
      currentSlot.doubleBet = currentSlot.bet;//
      console.log(`Player balance: ${currentSlot.player.balance}`)
      console.log(`Starting bet : ${currentSlot.bet}, double bet : ${currentSlot.doubleBet}`)
      updateBetDisplay(game.currentSlotIndex, currentSlot.bet);
      updateDisplayBalance();
      console.log("One card only");
      currentSlot.hit(game.deck);
      updateHandDisplay(game.currentSlotIndex);
      nextSlot();
    }else{
      alert("Not enough balance to double down");
    }
  }
});

//FUNCTION TO PROPERLY SET UP The given
//Add buttons, hightlite etc...
//takes the index of the slot as parameter and
function setUpCurrentSlot(index){
  console.log(`Next turn: Player in Slot ${index}`);
  const currentSlot = game.allSlots[index];
  highlightCurrentSlot(index);

  const doubleButton = document.getElementById(`double-btn-${index}`);
  if (doubleButton) doubleButton.remove();
  const splitButton = document.getElementById(`split-btn-${index}`);
  if (splitButton) splitButton.remove();

  if(currentSlot.hands[0].canDouble()){
    createDoubleButton(index);
  }     
  if(currentSlot.hands[0].canSplit()) {
    createSplitButton(index);
  }
}


function handlesHit(currentSlotIndex){
  const currentSlot = game.allSlots[currentSlotIndex];
  const currentHandIndex = currentSlot.activeHandIndex;
  const currentHand = currentSlot.hands[currentHandIndex];
  currentSlot.hit(game.deck,currentHandIndex);
  updateHandDisplay(currentSlotIndex);
  if (currentHand.score > 21) {  
    console.log(`Hand ${currentSlot.activeHandIndex} in Slot ${currentSlotIndex} BUSTED!`);    
    nextSlot();
  } else if (currentHand.score === 21) {  
    console.log(`Hand ${currentSlot.activeHandIndex} in Slot ${currentSlotIndex} AUTOMATICALLY STANDS`);      
    nextSlot();
  }
}

//Function to display player's hand in each slot
function updateHandDisplay(slotIndex) {
  const slotDiv = document.querySelector(`.slot[data-slot="${slotIndex}"]`);
  const playerSlot = game.allSlots[slotIndex];
  
  if (slotDiv && playerSlot) {
    
    const handDisplay = slotDiv.querySelector(".hand-display");
    handDisplay.innerHTML = "";

    playerSlot.hands.forEach((hand,index) => {
      const handDiv = document.createElement("div");
      handDiv.className = `hand-${index}`;
      //still needs visual representation of what of the 2 hands is playing
      if (index == playerSlot.activeHandIndex && playerSlot.hands.length > 1) {
        handDiv.classList.add("active-split-hand");
      }

      const handContent = document.createElement("div");
      handContent.classList.add("hand-content");

      hand.cards.forEach((card) => {
        const cardImg = document.createElement("img");
        cardImg.src = card.image;
        cardImg.classList.add("card-player");
        handContent.appendChild(cardImg);
      });

      const scoreSpan = document.createElement("span");
      scoreSpan.classList.add("score");
      scoreSpan.innerHTML = `${hand.score}`;

      handDiv.appendChild(handContent);
      handDiv.appendChild(scoreSpan);
      handDisplay.appendChild(handDiv);
    });

  }
}



function updateBetDisplay(slotIndex, betAmount) {
  const slot = game.allSlots[slotIndex];
  const slotDiv = document.querySelector(`.slot[data-slot="${slotIndex}"]`);
  const referenceElement = slotDiv.querySelector(".hand-display");
  let betDiv = slotDiv.querySelector('.bet-amount');
  if (!betDiv) {
    betDiv = document.createElement("div");
    betDiv.classList.add("bet-amount");
    referenceElement.insertAdjacentElement("afterend",betDiv);
  }
  betDiv.innerHTML = "";
  appendChipsToBetDiv(betDiv, calculateNumberOfChips(betAmount));

  let doubleBet = 0;
  
  if (slot.doubleBet) {
    appendChipsToBetDiv(betDiv, calculateNumberOfChips(slot.doubleBet), "double-bet-img");
    doubleBet = slot.doubleBet;
  }

  let splitBet = 0;
  
  if (slot.splitBet) {
    appendChipsToBetDiv(betDiv, calculateNumberOfChips(slot.splitBet), "split-bet-img");
    splitBet = slot.splitBet;
  }

  const totalBet = document.createElement("div");
  totalBet.classList.add("total-bet");
  const total = parseInt(betAmount) + parseInt(splitBet) + parseInt(doubleBet);
  totalBet.innerHTML = `${total}`;
  betDiv.appendChild(totalBet);

}

function appendChipsToBetDiv(betDiv, chips, additionalClass = "") {
  Object.entries(chips).forEach(([chipValue, count]) => {
    for (let i = 0; i < count; i++) {
      const chipImg = document.createElement('img');
      chipImg.src = `images/chips/chip-${chipValue}.png`;
      chipImg.classList.add("chip-icon");
      if (additionalClass) {
        chipImg.classList.add(additionalClass);
      }
      betDiv.appendChild(chipImg);
    }
  });
}
function calculateNumberOfChips(betAmount){
  const chipValues= [100,50,25,10,5];
  let remaining = betAmount;
  let chips = {};
  for(let chip of chipValues){
    if(remaining >= chip){
      let count = Math.floor(remaining / chip);
      chips[chip] = count;
      remaining -= chip * count;
    }
  }
  return chips;
}


//Function to move to next slot
function nextSlot(){
  const currentSlot = game.allSlots[game.currentSlotIndex];
  //if slots have multiples hand stay on the same slot move to next hand
  if(currentSlot.hands.length > 1){
    currentSlot.activeHandIndex++;
    if(currentSlot.activeHandIndex < currentSlot.hands.length){
      console.log(`Move to next hand in slot: ${game.currentSlotIndex}`);
      updateHandDisplay(game.currentSlotIndex);
      return;
    }
  }
  //If a hand was split, remove the class from second hand
  const activeSplitHandClass = document.querySelector(".active-split-hand");
  if(activeSplitHandClass) activeSplitHandClass.classList.remove("active-split-hand");
  

  //If double btn was crerating, remove before moving to next slot
  const doubleButton = document.getElementById(`double-btn-${game.currentSlotIndex}`);
  if(doubleButton) doubleButton.remove();

  //If split was created, remove before moving to next slot
  const splitButton = document.getElementById(`split-btn-${game.currentSlotIndex}`);
  if(splitButton) splitButton.remove();

  //remove first element of the array of playing indexes
  const removedIndex = game.playingSlotsIndexes.shift();
  console.log(`NextSlot() was just called and it just removed slot at index ${removedIndex}`);
  console.log(`Remaining slots : ${game.playingSlotsIndexes.length}`)
  //if there are slots left to play
  if(game.playingSlotsIndexes.length > 0) {
    //move to next playing index
    game.currentSlotIndex = game.playingSlotsIndexes[0];
    setUpCurrentSlot(game.currentSlotIndex);
  }else{
    const activePlayersExist = game.allSlots.some(slot => slot && slot.status === "active" && slot.hands[0].score <= 21);
    if(activePlayersExist){//some players are still active and didn't bust
      console.log("All players have finished. Dealer's turn!");
      game.dealer.play(game.deck);
      game.dealer.displayHand(true);
    }else{//all playing indexes busted
      console.log("No active players, dealer does not draw cards!");
    }
    game.endRound();
  }
}

function updateDisplayBalance(){
  document.getElementById("balance-display").innerHTML = game.player.balance;
}

//Logic to be immproved and remove redundant checks
//FUNCTIONS TO HANDLE BLACKJACKS

//Return an Array of Indexes of slots with BJ
function getIndexesBj(slots) {
  let indexWithBj = [];
  slots.forEach((slot, index) => {
    if (slot == null) return;
    if (slot.hands[0].isBlackJack()) {
      indexWithBj.push(index);
    }
  });
  return indexWithBj;
}


//Pays slots with BJ when dealer Doesn't
function handlePlayersBj(){
  let indexesWithBj = getIndexesBj(game.allSlots);
  if (indexesWithBj.length > 0) {
    indexesWithBj.forEach(index => {
      let slot = game.allSlots[index];
      console.log(`Slot ${index} wins with Blackjack! Paying 1.5x the bet.`);
      slot.player.addBalance(slot.bet * 1.5); // 1.5x payout
      game.allSlots[index].status = "inactive"; // Remove slot from play
    });
  }
}

function createDoubleButton(currentSlotIndex){
  //Create button double
  const doubleButton = document.createElement("button");
  doubleButton.innerHTML = "Double";
  doubleButton.id = `double-btn-${currentSlotIndex}`;
  doubleButton.setAttribute("data-type", "double");

  //insert in new Buttons div
  document.querySelector(".actions").appendChild(doubleButton);
}
function createSplitButton(currentSlotIndex){
  //Create button split
  const splitButton = document.createElement("button");
  splitButton.innerHTML = "Split";
  splitButton.id = `split-btn-${currentSlotIndex}`;
  splitButton.setAttribute("data-type", "split");

  //insert in new Buttons div
  document.querySelector(".actions").appendChild(splitButton);

  splitButton.addEventListener("click",() =>{
    const currentSlot = game.allSlots[currentSlotIndex];
  
    if(currentSlot.split(game.deck)){
      console.log(`Slot ${currentSlotIndex} split into two hands!`);
      //split() modifies balance and bet
      //update balance html
      updateDisplayBalance()
      //update bet html
      updateBetDisplay(currentSlotIndex, currentSlot.bet);
      //update hand HTML 
      updateHandDisplay(currentSlotIndex);
      splitButton.remove();
    }else{
      alert("Cannot split this hand");
    }
  });
}
function createInsuranceButton(arrayOfIndexes){
  arrayOfIndexes.forEach(index =>{
    //If the playing index also has BJ ignore
    //Might later implement with function that pays players wth BJ
    const currentSlot = game.allSlots[index];
    if(currentSlot.hands[0].score == 21) return;
    //For everyother create the button and give id of the index.
    const insuranceButton = document.createElement("button");
    insuranceButton.innerHTML = "Click to insure";
    insuranceButton.id = `insurance-btn-${index}`;
    insuranceButton.classList.add("insurance-btn")
    const parentDiv = document.querySelector(`.slot[data-slot="${index}"]`);
    parentDiv.appendChild(insuranceButton);

    insuranceButton.addEventListener('click', () => {
      console.log(`Insurance clicked for Slot ${index}`);
      //If player balance is at least half the bet
      const insuranceAmount = currentSlot.bet / 2;
      const playerBalance = currentSlot.player.balance
      if(playerBalance >= insuranceAmount){
        //update the balance
        //create text for insured slots
        //remove insurance btn
        console.log("Insurance activated");
        currentSlot.player.balance -= insuranceAmount;
        updateDisplayBalance();
        currentSlot.insurance = insuranceAmount;
        const insuranceDiv = document.createElement("p");
        insuranceDiv.classList.add("insurance-message");
        insuranceDiv.innerHTML = `Insured for ${insuranceAmount}`;
        parentDiv.appendChild(insuranceDiv);
        insuranceButton.remove();
      }else{
        alert("Not enough money for insurance");
      }
    });
  });
}

function highlightCurrentSlot(currentSlotIndex) {
    document.querySelectorAll(".slot").forEach(slot => slot.classList.remove("active-slot"));
    const activeSlot = document.querySelector(`.slot[data-slot="${currentSlotIndex}"]`);
    if (activeSlot) activeSlot.classList.add("active-slot"); 
}


