const playerCardsContainer = document.querySelector(".js-player-cards-container");
const computerCardsContainer = document.querySelector(".js-computer-cards-container");
const messagesContainer = document.querySelector(".js-messages-container");
const playerChipsContainer = document.querySelector(".js-playerChips-container");
const potContainer = document.querySelector(".js-pot");

const coin1Button = document.querySelector(".js-coin-1");
const coin10Button = document.querySelector(".js-coin-10");
const coin100Button = document.querySelector(".js-coin-100");
const coin500Button = document.querySelector(".js-coin-500");

const newGameButton = document.querySelector(".js-new-game");
const dealButton = document.querySelector(".js-deal");
const hitButton = document.querySelector(".js-hit");
const standButton = document.querySelector(".js-stand");


newGameButton.addEventListener("click", newGame);
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

//program állapot
let deckId = null;
let playerCards = [];
let playerChips = 2500;
let computerCards = [];
let pot = 0;
let message;
let firstDrawState;

function initialize(){
    deckId = null;
    playerCards = [];
    playerChips = 2500;
    computerCards = [];
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
    computerCards = await drawCards(deckId, 2);
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
    renderComputerCards();
    renderPot();
    renderButtons();
}


function renderMessages() {
    messagesContainer.innerHTML = `${message}`;
   
}

function renderButtons() {
    if (pot > 0 && computerCards.length === 0) dealButton.classList.remove("hidden");
        else dealButton.classList.add("hidden")
    if (pot > 0 && computerCards.length != 0) {
        hitButton.classList.remove("hidden");
        standButton.classList.remove("hidden");
    }   else {
        hitButton.classList.add("hidden");
        standButton.classList.add("hidden");
    }
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
    playerChipsContainer.innerHTML = `<p>${playerChips}$</p>`;
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
    } else potContainer.innerHTML = "";
}

function renderPlayerCards() {
    let html = '';
    if (playerCards.length != 0) {
        for (let card of playerCards.cards) {
            html += `<img src="${card.image}" alt="${card.code}" />`;
            }
        html += `<p>${sumCardsValues(playerCards.cards)}</p>`
        playerCardsContainer.innerHTML = html;
    } else playerCardsContainer.innerHTML = "";
}

function renderComputerCards() {
    let html = '';
    if (computerCards.length != 0) {
        for (let cardIndex in computerCards.cards) {
            let cardImage = computerCards.cards[cardIndex].image;
            let cardAlt = computerCards.cards[cardIndex].code;
            if (firstDrawState) {
                cardImage = 'https://www.deckofcardsapi.com/static/img/back.png';
                cardAlt = 'Back of Card'
                firstDrawState = false;
            }
            html += `<img src="${cardImage}" alt="${cardAlt}" />`;
        }
        html += `<p>${sumCardsValues(computerCards.cards)}</p>`
        computerCardsContainer.innerHTML = html;
    }  else computerCardsContainer.innerHTML = "";
}

function sumCardsValues(cards) {
    let cardsSum = 0;
    for (let card of cards) {
        if (card.code[0] === "A") {
            cardsSum += 11;
        } else {
        cardsSum += 
            card.code[0] === "0" | 
            card.code[0] === "J" | 
            card.code[0] === "Q" | 
            card.code[0] === "K" |
            card.code[0] === "A" ? 10 : Number(card.code[0]);
        }
    }
    return cardsSum
}

function newGame() {
    initialize();
}