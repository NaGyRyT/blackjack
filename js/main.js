const playerCardsContainer = document.querySelector(".js-player-cards-container");
const dealerCardsContainer = document.querySelector(".js-dealer-cards-container");
const messagesContainer = document.querySelector(".js-messages-container");
const playerChipsContainer = document.querySelector(".js-player-chips-container");
const potContainer = document.querySelector(".js-pot");
const playerCardsSum = document.querySelector(".js-player-cards-sum");
const dealerCardsSum = document.querySelector(".js-dealer-cards-sum");

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


newGameButton.addEventListener("click", newGame);
newHandButton.addEventListener("click", newHand);
coin1Button.addEventListener("click", (e) => {
    pot += 1;
    playerChips -= 1;
    render()
})
coin10Button.addEventListener("click", (e) => {
    pot += 10;
    playerChips -= 10;
    render()
})
coin100Button.addEventListener("click", (e) => {
    pot += 100;
    playerChips -= 100;
    render()
})
coin500Button.addEventListener("click", (e) => {
    pot += 500;
    playerChips -= 500;
    render()
})
dealButton.addEventListener("click", () => {
    newDeck();
    message = "You can HIT or STAND."
});

hitButton.addEventListener("click", handleHit)
standButton.addEventListener("click", handleStand)
doubleButton.addEventListener("click", handleDouble)

//program állapot
let deckId = null;
let playerCards;
let playerChips = 2500;
let dealerCards;
let pot = 0;
let message;
let firstDrawState;

function initialize(playerChipsSum){
    deckId = null;
    playerCards = [];
    playerChips = playerChipsSum;
    dealerCards = [];
    pot = 0;
    message ="Place Your Bets and push DEAL button!"
    firstDrawState = true;
    render()
}

// pakli lekérdezés + render
async function newDeck() {
    const data = await fetch(`https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6`)
    const response = await data.json();
    deckId = response.deck_id;
    playerCards = await drawCards(deckId, 2);
    playerCards = playerCards.cards;
    dealerCards = await drawCards(deckId, 2);
    dealerCards = dealerCards.cards;
    render();
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
    renderMessages();
    renderPlayerChips();
    renderPlayerCards();
    renderDealerCards();
    renderPot();
    renderButtons();
}

function renderMessages() {
    messagesContainer.innerHTML = `${message}`;  
}

function renderButtons() {
    if (pot > 0 && dealerCards.length === 0) dealButton.classList.remove("hidden");
        else dealButton.classList.add("hidden")
    if (pot > 0 && dealerCards.length != 0) {
        hitButton.classList.remove("hidden");
        standButton.classList.remove("hidden");
    }   else {
        hitButton.classList.add("hidden");
        standButton.classList.add("hidden");
    }
    if (pot > 0 && playerCards.length === 2 && pot <= playerChips) doubleButton.classList.remove("hidden");
        else doubleButton.classList.add("hidden");
    if (pot === 0 && dealerCards.length != 0 && playerChips > 0) newHandButton.classList.remove("hidden");
        else newHandButton.classList.add("hidden")
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
    playerChipsContainer.innerHTML = `<p>You have: ${playerChips}$</p>`;
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
    if (pot > 0) {
        potContainer.innerHTML = `<p>${pot}$</p>`;
    } else potContainer.innerHTML = "0$";
}

function renderPlayerCards() {
    let html = "";
    if (playerCards.length != 0) {
        for (let card of playerCards) {
            html += `<img src="${card.image}" alt="${card.code}" />`;
            }
        playerCardsSum.innerHTML = `Your cards: ${sumCardsValues(playerCards)}`
        playerCardsContainer.innerHTML = html;
    } else playerCardsContainer.innerHTML = "";
}

function renderDealerCards() {
    let html = '';
    if (dealerCards.length != 0) {
        for (let cardIndex in dealerCards) {
            let cardImage = dealerCards[cardIndex].image;
            let cardAlt = dealerCards[cardIndex].code;
            if (firstDrawState) {
                cardImage = 'https://www.deckofcardsapi.com/static/img/back.png';
                cardAlt = 'Back of Card'
                firstDrawState = false;
            }
            html += `<img src="${cardImage}" alt="${cardAlt}" />`;
        }
        dealerCardsSum.innerHTML = `Dealer cards: ${sumCardsValues(dealerCards)}`
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

// handle függvények

async function handleStand() {
    firstDrawState = false;
    while ( (sumCardsValues(dealerCards) < 17 && 
            sumCardsValues(playerCards) > sumCardsValues(dealerCards)) ||
            (sumCardsValues(playerCards) === sumCardsValues(dealerCards) &&
            sumCardsValues(dealerCards) < 17) ){
        let temp = await drawCards(deckId, 1);
        temp = temp.cards;
        dealerCards.push(temp[0])
        render();
    }
    decideWhoIsTheWin();
}

async function handleDouble() {
    playerChips -= pot;
    pot += pot;
    await handleHit();
    if (sumCardsValues(playerCards) < 22) handleStand(); // ez itt nem jó előbb lefut mielőtt megjönne a kártya?
}

async function handleHit(){
    firstDrawState = true;
    let temp = await drawCards(deckId, 1);
    temp = temp.cards;
    playerCards.push(temp[0]);
    render();
    if (sumCardsValues(playerCards) > 21) decideWhoIsTheWin();
}

function decideWhoIsTheWin() {
    if (sumCardsValues(playerCards) > 21 || 
        (sumCardsValues(dealerCards) > sumCardsValues(playerCards) && 
        sumCardsValues(dealerCards) < 22)) {
            message = "Dealer Wins";
            pot = 0;
    } else if (sumCardsValues(dealerCards) > 21 || 
               sumCardsValues(dealerCards) < sumCardsValues(playerCards)) {
            message = `You Win ${pot}$`;
            if (playerCards.length === 2) playerChips += pot + (pot * 1.5);
                else playerChips += pot * 2;
            pot = 0;

    } else {
        message = "Push";
        playerChips += pot;
        pot = 0;
    }
    if (pot = 0) newHandButton.classList.remove("hidden");
    render()
}

function newHand(){
    initialize(playerChips);
}
function newGame() {
    initialize(2500);
}