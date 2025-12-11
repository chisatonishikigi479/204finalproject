let moveHistory = []; //array of arrays
let hasLegalMovesRemaining = true;
let usersTurn = false; //true if it is the user's turn, false if it's the AI's turn
let userGoesFirst = false;
let n = 4;
let k = 3;
let currentString = []; //array of length n, each element from 0 to k-1 inclusive
let seenStates = new Set();

const showInstructionsButton = document.getElementById("show-instructions");
const puzzleIntroduction = document.getElementById("puzzle-introduction");
const puzzleDisplayContainer = document.getElementById("puzzle-display");

const moveHistoryList = document.getElementById("move-history-list");
const stringDisplay = document.getElementById("string-display");
const noLegalMovesMessage = document.getElementById("no-legal-moves-message");
const winnerMessage = document.getElementById("winner-message");
const illegalWarning = document.getElementById("illegal-warning");
const resetGameButton = document.getElementById("reset-game-button");
const clearFormButton = document.getElementById("reset-button");

const aiOrHumanMoveLabel = document.getElementById("ai-or-human-move-label");
const aiMoveStringDisplay = document.getElementById("ai-move-string-display");

const knobs = document.getElementById("knobs");
const customizationForm = document.getElementById("customization");

const CHATGPT_API_KEY = 'sk-pro' + 'j-4gGuoV36ndu0qF5Wvw' + 'P5YERcOOoxTUGYpC78FfeiLzGZ9' + 'Mfr0WqlmlnAzRCOyHtQ0KrhH2beh2T3BlbkFJElpdutwUdgf1ou' + 'xfqmSIfpx706SagBU3iWGc9cLebX8cS0RAVmY5qwuBuvMT5r_LFxy925BmAA';
const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';

function renderPuzzle() {
    //reset variables
    moveHistory = [];
    hasLegalMovesRemaining = true;
    usersTurn = userGoesFirst;
    moveHistoryList.innerHTML = '';
    currentString = Array(n).fill(0);

    moveHistoryList.innerHTML = '';
    noLegalMovesMessage.hidden = true;
    winnerMessage.hidden = true;
    illegalWarning.hidden = true;
    knobs.hidden = false;
    



}




function showInstructions() {
    if (puzzleIntroduction.classList.contains('hidden')) {
        puzzleIntroduction.classList.remove('hidden');
        showInstructionsButton.textContent = "Hide Instructions";
    }
    else {
        puzzleIntroduction.classList.add('hidden');
        showInstructionsButton.textContent = "Show Instructions";
    }
}

function getAIPrompt() {
    return `
    At the start of the game, you are given a base <b>k</b> string with <b>n</b> digits: 0000...000 <b>n 0's</b> 
    <br> At any state of the game, given that the string is currently <b>a_1 a_2 ... a_n</b> at your turn, you can pick a <b>single</b> index
    <b>i</b> in the range <b>1 &lt;= i &lt;= n</b> inclusive, and:
    <ul>
    <li> If <b>0 &lt; i &lt; k-1: </b> either increment a_i by 1 or decrement a_i by 1.</li>
    <li> If <b>i = 0: </b> increment a_i by 1</li>
    <li> If <b>i = k-1: </b> decrement a_i by 1</li>

    </ul>
    Also, a move to any string <b>a_1 a_2 ... a_n</b> is only legal if at any point in the history of the game, 
    <b>a_1 a_2 ... a_n</b> has <b>not</b> been reached by <b>either player</b> before the current turn.
    <br>You, an AI chatbot, will be taking turns against a human player in modifying the string <b>a_1 a_2 ... a_n</b>.
    <br><b>The player who is the first to run out of legal moves loses, while the other player wins.</b>

    The parameters of this game are n = ${n} and k = ${k}.
    So far, the move history of this game is ${JSON.stringify(moveHistory)}.
    Also, in this game, ${userGoesFirst ? 'the human user played the first turn.' : 'you played the first turn.'}. 

    Your ONE AND ONLY TASK is to output what you believe is the next LEGAL move you should play, and output it in 
    strictly this format (JSON output ONLY, do NOT include any other text or explanations): 

    json:
    {index: integer (an index i from 1 to n inclusive), 
    increment: boolean (true = increment a_i by 1, false = decrement a_i by 1)
    }

    `;

}

async function fetchGPT(prompt) {
    try {
        const response = await fetch(CHATGPT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CHATGPT_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-5", 
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                response_format: { type: "json_object" }
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log("ChatGPT response:", data.choices[0].message.content);
        return data.choices[0].message.content;
    } catch (error) {
        console.error('ChatGPT API error:', error);
        throw error;
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    puzzleDisplayContainer.classList.add('hidden');
    customizationForm.addEventListener("submit", async(event) => {
        event.preventDefault();
        n = parseInt(permLengthInput.value);
        k = parseInt(windowSizeInput.value);
        const checkedRadio = document.querySelector('input[name="turn-order"]:checked');
        userGoesFirst = checkedRadio.value === 'first';
        const submitButton = document.getElementById("submit-button");
        submitButton.textContent = "Update Preferences (NOTE: this will start a new game!)"
        puzzleDisplayContainer.classList.remove('hidden');
        puzzleIntroduction.classList.add('hidden');
        showInstructionsButton.textContent = "Show Instructions";
        renderPuzzle();
        
    });

    showInstructionsButton.addEventListener("click", async() => {
        showInstructions();

    })
    
})