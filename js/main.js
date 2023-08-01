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

coin1Button.addEventListener("click", () => handleCoin(1));
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
    render()
}

// pakli lekérdezés + render

async function newDeck() {
    const data = await fetch(`https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6`)
    const response = await data.json();
    deckId = response.deck_id;
    let temp = await drawCards(deckId, 2);
    playerCards = temp.cards;
    temp = await drawCards(deckId, 2);
    dealerCards = temp.cards;
}

// kártya húzás
async function drawCards(deckId, cardsNumber) {
    if (deckId == null) return
    const data = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=${cardsNumber}`)
    const response = await data.json();
    return response
} 

// render függvények


function render() {
    renderPlayerChips();
    renderPlayerCards();
    renderPlayerSplitCards();
    renderDealerCards();
    renderPot();
    renderButtons();
    renderMessages();
}

function renderMessages() {
    /*if (!doubleButton.classList.contains("hidden")) message += ", DOUBLE";
        else message = message.replace(", DOUBLE","");
    if (!insureButton.classList.contains("hidden")) message += ", INSURE";
        else message = message.replace(", INSURE","");*/
    messagesContainer.innerHTML = `${message}`;
}

function renderButtons() {
    //deal button
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
    if ((pot > 0 || splitPot > 0) && playerCards.length === 2 && 
        pot <= playerChips &&
        sumCardsValues(playerCards) != 21) doubleButton.classList.remove("hidden");
        else doubleButton.classList.add("hidden");
    //new hand button
    if (pot === 0 && dealerCards.length != 0 && playerChips > 0) newHandButton.classList.remove("hidden");
        else newHandButton.classList.add("hidden");
    //insure button
    if (dealerCards.length != 0 && 
        dealerCards[0].code[0] ==="A" &&
        playerChips > Math.round(pot / 2) &&
        hideInsureButton) {
            insureButton.classList.remove("hidden");
            hideInsureButton = false;
        }
        else insureButton.classList.add("hidden");
    //split button
    /*if (playerCards.length === 2 && splitRound === 0) { //hogy mindig split legyen csak teszt
        playerCards[1] = playerCards[0];
        renderPlayerCards();
        renderPlayerSplitCards();
    }*/
    if (playerCards.length === 2 && 
        playerCards[1].code[0] === playerCards[0].code[0] && 
        pot <= playerChips && 
        splitRound === 0) splitButton.classList.remove("hidden");
        else splitButton.classList.add("hidden");
}

function renderPlayerChips() {
    if (playerChips > 0) coin1Button.classList.remove("hidden");
        else coin1Button.classList.add("hidden");
    if (playerChips / 10 >= 1) coin10Button.classList.remove("hidden");
        else coin10Button.classList.add("hidden");
    if (playerChips / 100 >= 1) coin100Button.classList.remove("hidden");
        else coin100Button.classList.add("hidden");
    if (playerChips / 500 >= 1) coin500Button.classList.remove("hidden");
        else coin500Button.classList.add("hidden");
    playerChipsContainer.innerHTML = `<p>Your Chips: $${playerChips}</p>`;
    if (playerCards.length != 0) {
        coin1Button.classList.add("disable-pointer-events");
        coin10Button.classList.add("disable-pointer-events");
        coin100Button.classList.add("disable-pointer-events");
        coin500Button.classList.add("disable-pointer-events");
    } else {
        coin1Button.classList.remove("disable-pointer-events");
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

// ****************handle függvények**************************

function handleCoin(coin) {
    pot += coin;
    playerChips -= coin;
    render()
}

async function handleDeal() {
    await newDeck();
    message = "You can HIT, STAND"
    render();
}


async function handleStand() {
    standButton.setAttribute("disabled","");
    if (splitRound === 0 || splitRound === 2) {
            hideDealerCard = false;
            message="";
            while  (sumCardsValues(dealerCards) < 17 ) {
                        let temp = await drawCards(deckId, 1);
                        temp = temp.cards;
                        dealerCards.push(temp[0])
                        render();
                }
            decideWhoWonTheHand(playerCards, pot);
            if (splitRound === 2) decideWhoWonTheHand(playerSplitCards, splitPot);
    } else {
        hideDealerCard = true;
        message = "Right hand";
    }
    splitRound += 1;
    standButton.removeAttribute("disabled");
    render();
}

async function handleDouble() {
    playerChips -= pot;
    pot += pot;
    await handleHit()
    if (sumCardsValues(playerCards) < 22) handleStand();
}

async function handleHit() {
    /*for (let id of timeoutIds) clearTimeout(id);*/
    hitButton.setAttribute("disabled", "");
    doubleButton.setAttribute("disabled", "");
    /*setTimeout( async () => {*/
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
        hitButton.removeAttribute("disabled");
        doubleButton.removeAttribute("disabled");
        render();
     /*}, 500)*/
}

function handleInsure() {
    hideDealerCard = true;
    insurancePot = Math.round(pot / 2);
    playerChips -= insurancePot;
    render()
}

async function handleSplit(){
    splitButton.setAttribute("disabled","")
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
    splitButton.removeAttribute("disabled")
    render();
}

function decideWhoWonTheHand(playerOrSplitCards, potOrSplitPot) {
    let playerCardsSum = sumCardsValues(playerOrSplitCards);
    let dealerCardsSum = sumCardsValues(dealerCards);
    if ((playerCardsSum > 21 && dealerCardsSum < 22)|| 
        (dealerCardsSum > playerCardsSum && dealerCardsSum < 22) ||
        (dealerCards.length === 2 && dealerCardsSum === 21 && playerOrSplitCards.length > 2 && playerCardsSum === 21)) {
            if (splitRound === 2) message += ` You lost $${potOrSplitPot}`;
                else message = `You lost $${potOrSplitPot}`
    } else if (playerOrSplitCards.length === 2 && playerCardsSum === 21 &&
                !(dealerCards.length === 2 && dealerCardsSum === 21)) {
        playerChips += potOrSplitPot + Math.round((potOrSplitPot * 1.5));
        if (splitRound === 2) message += ` You had BlackJack, You Won $${Math.round(potOrSplitPot *1.5)}`;
            else message = `You had BlackJack! You Won $${Math.round(potOrSplitPot *1.5)}`;
    } else if ((dealerCardsSum > 21 && playerCardsSum < 22) || 
               (22 > dealerCardsSum && dealerCardsSum < playerCardsSum)) {
        playerChips += potOrSplitPot * 2;
        if (splitRound === 2) message += ` You won $${potOrSplitPot}`;
            else message = `You won $${potOrSplitPot}`;
    } else {
        if (splitRound === 2) message += " Push";
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

/*function decideWhoWonTheSplit() {
    
}*/

function newHand() {
    initialize(playerChips);
}

function newGame() {
    initialize(2500);
}