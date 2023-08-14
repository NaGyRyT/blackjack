const playerCardsContainer = document.querySelector(".js-player-cards-container");
const playerCardsSplitContainer = document.querySelector(".js-player-cards-split-container");
const playerCardsFieldset = document.querySelector(".js-player-cards-fieldset");
const playerCardsSplitFieldset = document.querySelector(".js-player-cards-split-fieldset");
const dealerCardsContainer = document.querySelector(".js-dealer-cards-container");
const messagesContainer = document.querySelector(".js-messages-container");
const playerChipsContainer = document.querySelector(".js-player-chips-container");
const potContainer = document.querySelector(".js-pot");
const insurancePotContainer = document.querySelector(".js-insurance-pot-container");
const splitPotContainer = document.querySelector(".js-split-pot-container");
const playerCardsSum = document.querySelector(".js-player-cards-sum");
const dealerCardsSum = document.querySelector(".js-dealer-cards-sum");
const playerCardsSplitSum = document.querySelector(".js-player-cards-split-sum");

const coin1Button = document.querySelector(".js-coin-1");
const coin5Button = document.querySelector(".js-coin-5");
const coin10Button = document.querySelector(".js-coin-10");
const coin100Button = document.querySelector(".js-coin-100");
const coin500Button = document.querySelector(".js-coin-500");

const newGameButton = document.querySelector(".js-new-game");
const newHandButton = document.querySelector(".js-new-hand");
const dealButton = document.querySelector(".js-deal");
const hitButton = document.querySelector(".js-hit");
const standButton = document.querySelector(".js-stand");
const doubleButton = document.querySelector(".js-double");
const insureButton = document.querySelector(".js-insure");
const splitButton = document.querySelector(".js-split");
const settingsButton = document.querySelector(".js-settings-button");
const settingsOkButton = document.querySelector(".js-settings-ok-button")

const deckSlider = document.querySelector(".js-deck-slider");
const deckNumber = document.querySelector(".js-deck-number-value");
const chipsSlider = document.querySelector(".js-chips-slider");
const chipsValue = document.querySelector(".js-chips-value");


deckSlider.addEventListener("input", (e) => {
    deckNumber.innerText = e.target.value;
})

chipsSlider.addEventListener("input", (e) => {
    chipsValue.innerText = e.target.value;
})

/*************************Events**************************/
coin1Button.addEventListener("click", () => handleCoin(1));
coin5Button.addEventListener("click", () => handleCoin(5));
coin10Button.addEventListener("click", () => handleCoin(10));
coin100Button.addEventListener("click", () => handleCoin(100));
coin500Button.addEventListener("click", () => handleCoin(500));

newGameButton.addEventListener("click", newGame);
newHandButton.addEventListener("click", newHand);
dealButton.addEventListener("click", handleDeal);
hitButton.addEventListener("click", handleHit);
standButton.addEventListener("click", handleStand);
doubleButton.addEventListener("click", handleDouble);
insureButton.addEventListener("click", handleInsure);
splitButton.addEventListener("click", handleSplit);
settingsButton.addEventListener("click", handleSettings);
settingsOkButton.addEventListener("click", handleSettingsOkButton);

function handleSettingsOkButton(){
    localStorage.setItem("deckNumber", deckSlider.value);
    localStorage.setItem("chipsValue", chipsSlider.value);
}

function handleSettings(){
    if (localStorage.getItem("deckNumber") > 0) {
        deckNumber.innerText = localStorage.getItem("deckNumber");
        deckSlider.value = localStorage.getItem("deckNumber");
    } else {
        localStorage.setItem("deckNumber", 6);
        deckNumber.innerText = 6;
        deckSlider.value = 6;
    }
    if (localStorage.getItem("chipsValue") > 0) {
        chipsValue.innerText = localStorage.getItem("chipsValue");
        chipsSlider.value = localStorage.getItem("chipsValue");
    } else {
        localStorage.setItem("chipsValue", 2500);
        chipsValue.innerText = 2500;
        chipsSlider.value = 2500;
    }
}

/*********************initialization**********************/
let deckId = null;
let playerCards;
let playerSplitCards;
let playerChips;;
let dealerCards;
let pot = 0;
let splitPot;
let message;
let hideDealerCard;
let hideInsureButton
let insurancePot;
let splitRound;
let firstStand;
let timeoutIds;
handleSettings();

function initialize(playerChipsSum) {
    deckId = null;
    playerCards = [];
    playerSplitCards =[];
    playerChips = playerChipsSum;
    dealerCards = [];
    pot = 0;
    splitPot = 0;
    insurancePot = 0;
    message ="Place Your Bets and push DEAL button"
    hideDealerCard = true;
    hideInsureButton = true;
    splitRound = 0;
    firstStand = true;
    insurancePot = 0;
    playerCardsSum.innerHTML = "Your cards";
    dealerCardsSum.innerHTML = "Dealer cards";
    timeoutIds = [];
    render();
}

/**********************fetch decks************************/
async function newDeck() {
    const data = await fetch(`https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${localStorage.getItem("deckNumber")}`)
    const response = await data.json();
    deckId = response.deck_id;
    let temp = await drawCards(deckId, 2);
    playerCards = temp.cards;
    temp = await drawCards(deckId, 2);
    dealerCards = temp.cards;
}

/**********************fetch card(s)************************/
async function drawCards(deckId, cardsNumber) {
    if (deckId == null) return
    const data = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=${cardsNumber}`)
    const response = await data.json();
    return response
} 

/********************render functions*********************/
function render() {
    setTimeout( () => {
        renderPlayerChips();
        renderPlayerCards();
        renderPlayerSplitCards();
        renderDealerCards(); 
    }, 200)
    renderPot();
    renderButtons();
    setTimeout(() => {renderMessages()}, 600);
}

function renderMessages() {
    messagesContainer.innerHTML = `${message}`;
}

function renderButtons() {
    // deal button
    if (pot > 0 && dealerCards.length === 0) dealButton.classList.remove("hidden");
        else dealButton.classList.add("hidden")
    // hit & stand button
    if ((pot > 0 || splitPot > 0) && dealerCards.length != 0) {
        hitButton.classList.remove("hidden");
        standButton.classList.remove("hidden");
    }   else {
        hitButton.classList.add("hidden");
        standButton.classList.add("hidden");
    }
    // double button
    if ((pot > 0 || splitPot > 0) && (playerCards.length === 2 || playerSplitCards.length === 2)  && 
        pot <= playerChips &&
        (sumCardsValues(playerCards) != 21 || sumCardsValues(playerSplitCards) != 21)) doubleButton.classList.remove("hidden");
        else doubleButton.classList.add("hidden");
    // new hand button
    if (pot === 0 && dealerCards.length != 0 && playerChips > 0) newHandButton.classList.remove("hidden");
        else newHandButton.classList.add("hidden");
    // insure button
    if (dealerCards.length != 0 && 
        dealerCards[0].code[0] ==="A" &&
        playerChips > Math.round(pot / 2) &&
        hideInsureButton) {
            insureButton.classList.remove("hidden");
            hideInsureButton = false;
        }
        else insureButton.classList.add("hidden");
    //********hogy mindig split legyen csak TESZT miatt*******/
        /*    if (playerCards.length === 2 && splitRound === 0) {
                playerCards[1] = playerCards[0];
                renderPlayerCards();
                renderPlayerSplitCards();
    
            }*/
    //split button
    if (playerCards.length === 2 && 
        playerCards[1].code[0] === playerCards[0].code[0] && 
        pot <= playerChips && 
        splitRound === 0) splitButton.classList.remove("hidden");
        else splitButton.classList.add("hidden");
}

function renderPlayerChips() {
    if (playerChips > 0) coin1Button.classList.remove("hidden");
        else coin1Button.classList.add("hidden");
    if (playerChips /5 >= 1) coin5Button.classList.remove("hidden");
        else coin5Button.classList.add("hidden");
    if (playerChips / 10 >= 1) coin10Button.classList.remove("hidden");
        else coin10Button.classList.add("hidden");
    if (playerChips / 100 >= 1) coin100Button.classList.remove("hidden");
        else coin100Button.classList.add("hidden");
    if (playerChips / 500 >= 1) coin500Button.classList.remove("hidden");
        else coin500Button.classList.add("hidden");
    playerChipsContainer.innerHTML = `<p>Your Chips: $${playerChips}</p>`;
    if (playerCards.length != 0) {
        coin1Button.classList.add("disable-pointer-events");
        coin5Button.classList.add("disable-pointer-events");
        coin10Button.classList.add("disable-pointer-events");
        coin100Button.classList.add("disable-pointer-events");
        coin500Button.classList.add("disable-pointer-events");
    } else {
        coin1Button.classList.remove("disable-pointer-events");
        coin5Button.classList.remove("disable-pointer-events");
        coin10Button.classList.remove("disable-pointer-events");
        coin100Button.classList.remove("disable-pointer-events");
        coin500Button.classList.remove("disable-pointer-events");
    }
}

function renderPot() {
    if (pot > 0) potContainer.innerHTML = `<p>$${pot}</p>`;
        else potContainer.innerHTML = "$0";
    if (insurancePot > 0) {
        insurancePotContainer.innerHTML = `<legend>Insurance</legend><div><p>${insurancePot}$</p></div>`;
        insurancePotContainer.classList.remove("display-none");
    } else insurancePotContainer.classList.add("display-none");
    if (splitPot > 0) {
        splitPotContainer.innerHTML = `<legend>Split Bets</legend><div><p>${splitPot}$</p></div>`;
        splitPotContainer.classList.remove("display-none");
    } else splitPotContainer.classList.add("display-none");
}

function renderPlayerCards() {
    let html = "";
    if (playerCards.length != 0) {
        for (let card of playerCards) {
            html += `<img class="card-img" src="${card.image}" alt="${card.code}" />`;
        }       
            playerCardsSum.innerHTML = `Your cards: ${sumCardsValues(playerCards)}`
            playerCardsContainer.innerHTML = html;        
    } else playerCardsContainer.innerHTML = "";
}

function renderPlayerSplitCards() {
    let html = "";
    if (playerSplitCards.length > 0) {
        for (let card of playerSplitCards) {
            html += `<img class="card-img" src="${card.image}" alt="${card.code}" />`;
            }         
            playerCardsSplitSum.innerHTML = `Your split cards: ${sumCardsValues(playerSplitCards)}`
            playerCardsSplitContainer.innerHTML = html;
            playerCardsSplitFieldset.classList.remove("display-none");
    } else {
        playerCardsSplitContainer.innerHTML = "";
        playerCardsSplitFieldset.classList.add("display-none");
    }
}

function renderDealerCards() {
    let html = '';
    if (dealerCards.length != 0) {
        for (let cardIndex in dealerCards) {
            let cardImage = dealerCards[cardIndex].image;
            let cardAlt = dealerCards[cardIndex].code;
            if (hideDealerCard && cardIndex == 1) {
                cardImage = 'https://www.deckofcardsapi.com/static/img/back.png';
                cardAlt = 'Back of Card'
            }
            html += `<img class="card-img" src="${cardImage}" alt="${cardAlt}" />`;
        }           
            if (hideDealerCard) dealerCardsSum.innerHTML = `Dealer cards: ${sumCardsValues([dealerCards[0]])}`;
                else dealerCardsSum.innerHTML = `Dealer cards: ${sumCardsValues(dealerCards)}`;
            dealerCardsContainer.innerHTML = html;
    }  else dealerCardsContainer.innerHTML = "";
}

/****************handle functions*************************/
function handleCoin(coin) {
    pot += coin;
    playerChips -= coin;
    render()
}

async function handleDeal() {
    disableButtons();
    await newDeck();
    message = "You can choose an action with a button"
    render();
    enableButtons();
}

async function handleStand() {
    disableButtons();
    if (splitRound === 1) {
        hideDealerCard = true;
        message = "Right hand";
    } else {
        hideDealerCard = false;
        message="";
        while  (sumCardsValues(dealerCards) < 17 ) {
                    let temp = await drawCards(deckId, 1);
                    temp = temp.cards;
                    dealerCards.push(temp[0])
                    render();
            }
        decideWhoWonTheHand(playerCards, pot);
        if (splitRound === 2 || splitRound === 3) decideWhoWonTheHand(playerSplitCards, splitPot);
    }
    splitRound += 1;
    enableButtons();
    render();
}

async function handleDouble() {
    disableButtons();
    if (splitRound <= 1 ){
        playerChips -= pot;
        pot += pot;
        await handleHit()
        if (sumCardsValues(playerCards) < 22) handleStand();
    } else {
        playerChips -= splitPot;
        splitPot += splitPot;
        await handleHit()
        if (sumCardsValues(playerSplitCards) <22) handleStand();
    }
    enableButtons();
}

async function handleHit() {
    disableButtons();
    hideDealerCard = true;
    let temp = await drawCards(deckId, 1);
    temp = temp.cards;
    if (splitRound <= 1) {
        playerCards.push(temp[0]);
    if (sumCardsValues(playerCards) > 21) await handleStand();
    } else {
        playerSplitCards.push(temp[0]);
        if (sumCardsValues(playerSplitCards) > 21) await handleStand();
    }
    enableButtons();
    render();
}

function handleInsure() {
    disableButtons()
    hideDealerCard = true;
    insurancePot = Math.round(pot / 2);
    playerChips -= insurancePot;
    enableButtons();
    render()
}

async function handleSplit(){
    disableButtons();
    splitRound = 1;
    hideDealerCard = true;
    playerSplitCards = [playerCards[1]];
    playerCards = [playerCards[0]];
    splitPot = pot;
    playerChips -= pot;
    let temp = await drawCards(deckId, 1);
    temp = temp.cards;
    playerCards.push(temp[0]);
    temp = await drawCards(deckId, 1);
    temp = temp.cards;
    playerSplitCards.push(temp[0]);
    message = "Left hand"
    enableButtons();
    render();
}

/******************enable/disable buttons**********************/
function disableButtons(){
    dealButton.setAttribute("disabled","")
    standButton.setAttribute("disabled","");
    hitButton.setAttribute("disabled", "");
    doubleButton.setAttribute("disabled", "");
    splitButton.setAttribute("disabled","");
    insureButton.setAttribute("disabled","");
}

function enableButtons(){
    dealButton.removeAttribute("disabled")
    standButton.removeAttribute("disabled");
    hitButton.removeAttribute("disabled");
    doubleButton.removeAttribute("disabled");
    splitButton.removeAttribute("disabled");
    insureButton.removeAttribute("disabled");
}

/*********************summary of cards*********************/
function sumCardsValues(cards) {
    let cardsSum = 0;
    let numberOfAce = 0;
    for (let card of cards) {
        if (card.code[0] === "A") {
            cardsSum += 11;
            numberOfAce += 1;
        } else {
        cardsSum += 
            card.code[0] === "0" | 
            card.code[0] === "J" | 
            card.code[0] === "Q" | 
            card.code[0] === "K" ? 10 : Number(card.code[0]);
        }
    }
    while (numberOfAce > 0 && cardsSum > 21) {
        cardsSum -= 10;
        numberOfAce -= 1        
    }
    return cardsSum
}

/****************who is the winner/looser*****************/
function decideWhoWonTheHand(playerOrSplitCards, potOrSplitPot) {
    let playerCardsSum = sumCardsValues(playerOrSplitCards);
    let dealerCardsSum = sumCardsValues(dealerCards);
    if ((playerCardsSum > 21 && dealerCardsSum < 22)|| 
        (dealerCardsSum > playerCardsSum && dealerCardsSum < 22) ||
        (dealerCards.length === 2 && dealerCardsSum === 21 && playerOrSplitCards.length > 2 && playerCardsSum === 21)) {
            if (splitRound === 2 || splitRound === 3) message += ` You lost $${potOrSplitPot}`;
                else message = `You lost $${potOrSplitPot}`
    } else if (playerOrSplitCards.length === 2 && playerCardsSum === 21 &&
                !(dealerCards.length === 2 && dealerCardsSum === 21)) {
        playerChips += potOrSplitPot + Math.round((potOrSplitPot * 1.5));
        if (splitRound === 2 || splitRound === 3) message += ` You had BlackJack, You Won $${Math.round(potOrSplitPot *1.5)}`;
            else message = `You had BlackJack! You Won $${Math.round(potOrSplitPot *1.5)}`;
    } else if ((dealerCardsSum > 21 && playerCardsSum < 22) || 
               (22 > dealerCardsSum && dealerCardsSum < playerCardsSum)) {
        playerChips += potOrSplitPot * 2;
        if (splitRound === 2 || splitRound === 3) message += ` You won $${potOrSplitPot}`;
            else message = `You won $${potOrSplitPot}`;
    } else {
        if (splitRound === 2 || splitRound === 3) message += " Push";
            else message = "Push";
        playerChips += potOrSplitPot;
    }
    if (pot > 0) pot = 0;
        else splitPot = 0;
    decideWhoWonTheInsurance();
    render()
}

function decideWhoWonTheInsurance(){
    if (insurancePot > 0 && (sumCardsValues(dealerCards) === 21 && dealerCards.length === 2) ) {
        message += ` You won the insurance $${insurancePot}`; 
        playerChips += insurancePot *2;
        insurancePot = 0;
    } else if (insurancePot > 0) {
        message += ` You lost the insurance $${insurancePot}`;
        insurancePot = 0;
    }
}

/**********************main program***********************/
function newHand() {
    initialize(playerChips);
}

function newGame() {
    initialize(localStorage.getItem("chipsValue"));
}