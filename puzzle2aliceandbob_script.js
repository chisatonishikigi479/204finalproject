let moveHistory = []; //array of arrays
let hasLegalMovesRemaining = true;
let usersTurn = false; //true if it is the user's turn, false if it's the AI's turn
let userGoesFirst = false;
let n = 4;
let k = 3;
let currentString = []; //array of length n, each element from 0 to k-1 inclusive

const showInstructionsButton = document.getElementById("show-instructions");
const puzzleIntroduction = document.getElementById("puzzle-introduction");
const puzzleDisplayContainer = document.getElementById("puzzle-display");


const numDimensionsInput = document.getElementById("num-dimensions-input");
const hypercubeLengthInput = document.getElementById("hypercube-length-input");
const moveHistoryList = document.getElementById("move-history-list");
const stringDisplay = document.getElementById("string-display");
const noLegalMovesMessage = document.getElementById("no-legal-moves-message");
const winnerMessage = document.getElementById("winner-message");
const illegalWarning = document.getElementById("illegal-warning");
const resetGameButton = document.getElementById("reset-game-button");
const clearFormButton = document.getElementById("reset-button");
const numberMoves = document.getElementById("number-moves");

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

    updateStringDisplay();
    generateKnobs();
    updateTurnDisplay();
    
    // If AI goes first, make AI move
    if (!userGoesFirst) {
        setTimeout(() => {
            makeAIMove();
        }, 500);
    }
    



}

function updateStringDisplay() {
    stringDisplay.innerHTML = `<h3>${currentString.join(' ')}</h3>`;
}

function updateTurnDisplay() {
    if (usersTurn) {
        aiOrHumanMoveLabel.textContent = "Your Turn!";
        aiMoveStringDisplay.textContent = "Make your move using the controls above!";
        enableAllKnobs();
    } else {
        aiOrHumanMoveLabel.textContent = "AI's Turn!";
        aiMoveStringDisplay.textContent = "AI is thinking...";
        disableAllKnobs();
    }
    numberMoves.textContent = `${moveHistory.length}`;


}


function generateKnobs() {

    const indicesArr = [];
    for (let i = 1; i <= n; i++) {
        indicesArr.push(i);
    }

    knobs.innerHTML = indicesArr.map((index) => {
        let finalStructure = `<div class="knob-set">
            <button class="knob" class="decrement" id="knob-${index}-decrement" ${currentString[index-1] <= 0 ? 'disabled' : ''}>
                -1 to digit ${index}
            </button>
            <button class="knob" class="increment" id="knob-${index}-increment" ${currentString[index-1] >= k - 1 ? 'disabled' : ''}>
                +1 to digit ${index}
            </button>
        </div>
        `;
        return finalStructure;
    }).join("");

    indicesArr.forEach((index) => {
        const decButton = document.getElementById(`knob-${index}-decrement`);
        const incButton = document.getElementById(`knob-${index}-increment`);
        decButton.addEventListener("click", () => {
            applyKnob(index, false);
        });
        incButton.addEventListener("click", () => {
            applyKnob(index, true);
        });
    });

    if (!usersTurn) {
        disableAllKnobs();
    }
    

}

function isLegalMove(index, increment) {
    const newString = structuredClone(currentString);
     if (increment) {
        if (newString[index-1] >= k - 1) {
            return false;
        }
        newString[index-1]++;
    } else {
        if (newString[index-1] <= 0) {
            return false;
        }
        newString[index-1]--;
    }
    return !hasStateBeenSeen(newString);
}

function applyKnob(index, increment) {
    if (!usersTurn) {
        return;
    }
    
    if (!isLegalMove(index, increment)) {
        illegalWarning.hidden = false;
        setTimeout(() => {
            illegalWarning.hidden = true;
        }, 2000);
        return;
    }
    
    if (increment) {
        currentString[index-1]++;
    } 
    else {
        currentString[index-1]--;
    }
    
    moveHistory.push(structuredClone(currentString));
    
    updateStringDisplay();
    updateMoveHistoryDisplay();
    generateKnobs();
    
    if (!hasLegalMoves()) {
        endGame('human');
        return;
    }
    
    usersTurn = false;
    updateTurnDisplay();
    
    setTimeout(() => {
        makeAIMove();
    }, 1000);
}

function updateMoveHistoryDisplay() {
    moveHistoryList.innerHTML = moveHistory.map((state, i) => {
        const player = (i % 2 === 0) 
            ? (userGoesFirst ? 'Human' : 'AI')
            : (userGoesFirst ? 'AI' : 'Human');
        return `<div class="move-entry">
            Move ${i + 1} (${player}): [${state.join(', ')}]
        </div>`;
    }).join('');
}

function hasLegalMoves() {
    for (let i = 1; i <= n; i++) {
        if (isLegalMove(i, true) || isLegalMove(i, false)) {
            return true;
        }
    }
    return false;
}

function disableAllKnobs() {
    document.querySelectorAll('.decrement, .increment').forEach(btn => {
        btn.disabled = true;
    });
}

function enableAllKnobs() {

    const indicesArr = [];
    for (let i = 1; i <= n; i++) {
        indicesArr.push(i);
    }
    indicesArr.forEach((index) => {
        const decButton = document.getElementById(`knob-${index}-decrement`);
        const incButton = document.getElementById(`knob-${index}-increment`);
        decButton.disabled = currentString[index-1] <= 0;
        incButton.disabled = currentString[index-1] >= k-1; 
    });
    
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false; 
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) {
      return false; 
    }
  }
  return true; 
}


function hasStateBeenSeen(state) //pass in state as an array
{
    if (arraysEqual(state, Array(n).fill(0))) {
        return true;
    }
    //check if it's in move history
    let inMoveHistory = false;
    for (let i = 0; i < moveHistory.length; i++) {
        if (arraysEqual(state, moveHistory[i])) {
            inMoveHistory = true;
        }
    }
    return inMoveHistory;
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

async function makeAIMove() {
    aiMoveStringDisplay.textContent = "AI is thinking...";
    disableAllKnobs();
    try {
        const prompt = getAIPrompt();
        const response = await fetchGPT(prompt);
        const aiMove = JSON.parse(response);
        const index = aiMove.index; 
        const increment = aiMove.increment;
        
        if (!isLegalMove(index, increment)) {
            console.error("AI made illegal move");
            makeRandomLegalMove();
            return;
        }
        
        if (increment) {
            currentString[index-1]++;
        } else {
            currentString[index-1]--;
        }
        
        moveHistory.push(structuredClone(currentString));
        updateStringDisplay();
        updateMoveHistoryDisplay();
        generateKnobs();
        const action = increment ? '+1' : '-1';
        aiMoveStringDisplay.textContent = `AI chose: ${action} to digit ${index} => [${currentString.join(', ')}]`;
        
        console.log(aiMove);
        if (!hasLegalMoves()) {
            endGame('AI');
            return;
        }
        usersTurn = true;
        updateTurnDisplay();
        
    } catch (error) {
        console.error("AI error:", error);
        makeRandomLegalMove();
    }
}

function makeRandomLegalMove() {
    disableAllKnobs();
    const legalMoves = [];
    for (let i = 1; i <= n; i++) {
        if (isLegalMove(i, true)) {
            legalMoves.push({index: i, increment: true});
        }
        if (isLegalMove(i, false)) {
            legalMoves.push({index: i, increment: false});
        }
    }
    
    if (legalMoves.length === 0) {
        endGame('human');
        return;
    }
    
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    if (randomMove.increment) {
        currentString[randomMove.index - 1]++;
    } 
    else {
        currentString[randomMove.index - 1]--;
    }
    
    moveHistory.push(structuredClone(currentString));
    updateStringDisplay();
    updateMoveHistoryDisplay();
    generateKnobs();
    const action = randomMove.increment ? '+1' : '-1';
    aiMoveStringDisplay.textContent = `AI chose: ${action} to digit ${randomMove.index} => [${currentString.join(', ')}]`;
    
    if (!hasLegalMoves()) {
        endGame('AI');
        return;
    }
    usersTurn = true;
    updateTurnDisplay();
}

function endGame(winner) {
    hasLegalMovesRemaining = false;
    noLegalMovesMessage.hidden = false;
    winnerMessage.hidden = false;
    winnerMessage.innerHTML = `<h2>${winner} wins!</h2>`;
    disableAllKnobs();
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
        n = parseInt(numDimensionsInput.value);
        k = parseInt(hypercubeLengthInput.value);
        const checkedRadio = document.querySelector('input[name="turn-order"]:checked');
        userGoesFirst = checkedRadio.value === 'first';
        const submitButton = document.getElementById("submit-button");
        submitButton.textContent = "Update Preferences (NOTE: this will start a new game!)"
        puzzleDisplayContainer.classList.remove('hidden');
        puzzleDisplayContainer.hidden = false;
        puzzleIntroduction.classList.add('hidden');
        showInstructionsButton.textContent = "Show Instructions";
        renderPuzzle();
        
    });

    resetGameButton.addEventListener("click", () => {
    renderPuzzle();
});

    showInstructionsButton.addEventListener("click", async() => {
        showInstructions();

    })
    
})