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
    this.status = "inactive";
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

  //Display dealer hand on HTML
  displayHand(){
    document.getElementById("dealer-cards").innerHTML = this.hand;
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

  constructor(player, numSlots){
    this.deck = new Deck(6);  
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
          console.log(`Dealt to Slot ${index}: ${slot.hand}`);
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
      slot.hand = new Hand();
    });

    this.playingSlotsIndexes = this.getPlayingSlotIndexes();
    this.currentSlotIndex = this.playingSlotsIndexes[0];

    //Create new hand for dealer
    this.dealer.hand = new Hand();
    //RESET Hands HTML player-dealer
    document.querySelectorAll(".hand-display").forEach((elment)=>{
      elment.innerHTML = "";
    });
    document.getElementById("dealer-cards").innerHTML = "";
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
    document.querySelectorAll(".slot").forEach((slotDiv,index) =>{
      const slot = this.allSlots[index];
      if(slot != null){
        slotDiv.querySelector(".hand-display").innerHTML = `${slot.hand}`
      }
    })
    //display dealer hand in html
    this.dealer.displayHand();
    
    setUpCurrentSlot(this.currentSlotIndex);

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
      createInsuranceButton(game.playingSlotsIndexes);
      updateDisplayBalance();
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
    
    
  } 

  endRound(){
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
    console.log("END OF THE GAME");
  }

  payoutSlots(){
    this.allSlots.forEach((slot, index) => {
      if (slot == null || slot.status == "inactive") return;
      const dealerScore = this.dealer.hand.score;
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

//ONLY WHEN DEALER SHOW ACE
function handleInsurance(){
  document.querySelectorAll(".actions button").forEach(button =>{
    button.disabled = false;
  })
  
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

const player1 = new Player("Luca");
player1.addBalance(100);
const game = new Game(player1,3);
updateDisplayBalance();
toggleActionBtn(true);


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
    game.allSlots[slotIndex].bet = valueBet;
    
    const betAmountElement = selectedSlot.parentElement.querySelector('.bet-amount');
    betAmountElement.textContent = `Bet: ${valueBet}`;
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
  
  if(event.target.id == "hit-button") {
    handlesHit(game.currentSlotIndex);
  }
  if(event.target.id == "stand-button") {
    console.log(`slot ${game.currentSlotIndex} STAND`)
    nextSlot();
  }
  //If double, nextTurn and handles the bet and updating the HTML
  if(event.target.id == `double-btn-${game.currentSlotIndex}`) {
    const currentSlot = game.allSlots[game.currentSlotIndex];
    if(currentSlot.player.balance >= currentSlot.bet){
      currentSlot.player.balance -= currentSlot.bet;
      currentSlot.bet *= 2;
      console.log(`Player balance: ${currentSlot.player.balance}`)
      console.log(`total bet: ${currentSlot.bet}`)
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
  if(currentSlot.hand.canDouble()){
    createDoubleButton(index);
  }     
}


function handlesHit(currentSlotIndex){
  const currentSlot = game.allSlots[currentSlotIndex];
  currentSlot.hit(game.deck);
  updateHandDisplay(currentSlotIndex);
  if (currentSlot.hand.score > 21) {  
    console.log(`Slot ${currentSlotIndex} BUST!`);    
    nextSlot();
  } else if (currentSlot.hand.score === 21) {  
    console.log(`Slot ${currentSlotIndex} AUTOMATICALLY STAND`);      
    nextSlot();
  }
}

//Function to display player's hand in each slot
function updateHandDisplay(slotIndex) {
  const slotDiv = document.querySelector(`.slot[data-slot="${slotIndex}"]`);
  const playerSlot = game.allSlots[slotIndex];

  if (slotDiv && playerSlot) {
    slotDiv.querySelector(".hand-display").innerHTML = `${playerSlot.hand}`;
  }
}

function updateBetDisplay(slotIndex, newBet) {
  const betDiv = document.querySelector(`.slot[data-slot="${slotIndex}"]`);
  betDiv.querySelector(".bet-amount").innerHTML = `Bet: ${newBet}`;
}

//Function to move to next slot
function nextSlot(){
  //If double btn was crerating, remove before moving to next slot
  const doubleButton = document.getElementById(`double-btn-${game.currentSlotIndex}`);
  if(doubleButton) doubleButton.remove();


  //remove first element of the array of playing indexes
  const removedIndex = game.playingSlotsIndexes.shift();
  console.log(`NextSlot() was just called and it just removed slot at index ${removedIndex}`);
  console.log(`Remaining slots : ${game.playingSlotsIndexes.length}`)
  if(game.playingSlotsIndexes.length > 0) {
    game.currentSlotIndex = game.playingSlotsIndexes[0];
    setUpCurrentSlot(game.currentSlotIndex);
  }else{
    const activePlayersExist = game.allSlots.some(slot => slot && slot.status === "active" && slot.hand.score <= 21);
    if(activePlayersExist){//some players are still playing
      console.log("All players have finished. Dealer's turn!");
      game.dealer.play(game.deck);
      game.dealer.displayHand();
    }else{
      console.log("No active players, dealer does not draw cards!");
    }
    endRound();
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
    if (slot.hand.isBlackJack()) {
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

  //insert in new Buttons div
  document.querySelector(".actions").appendChild(doubleButton);
}

function createInsuranceButton(arrayOfIndexes){
  arrayOfIndexes.forEach(index =>{
    //If the playing index also has BJ ignore
    //Might later implement with function that pays players wth BJ
    const currentSlot = game.allSlots[index];
    if(currentSlot.hand.score == 21) return;
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
        currentSlot.insurance = insuranceAmount;
        const insuranceDiv = document.createElement("p");
        insuranceDiv.classList.add("insurance-message");
        insuranceDiv.innerHTML = `Insured for $${insuranceAmount}`;
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
