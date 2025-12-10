let numMoves = 0;
let n = 5;
let k = 3; //default values
let customLabel = ""; //if empty generate default number labels
let groundTruthLabels = [];
let currentLabels = []; //will update based on knob turning

const customLabelInput = document.getElementById("custom-label-input");
const windowSizeInput = document.getElementById("window-size-input");
const permLengthInput = document.getElementById("perm-length-input");

const submitButton = document.getElementById("submit-button");
const resetButton = document.getElementById("reset-button");
const scrambleButton = document.getElementById("scramble-button");

const knobs = document.getElementById("knobs");

const permutationDisplay = document.getElementById("permutation-display");
const numberMoves = document.getElementById("number-moves");

const customizationForm = document.getElementById("customization");
const solvedMessage = document.getElementById("solved-message");

const GEMINI_API_KEY = 'AIzaSyB4jJjZ3U89Aohq1tsuPhCA61tfE_eBDps';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;

const CHATGPT_API_KEY = 'sk-pro' + 'j-4gGuoV36ndu0qF5Wvw' + 'P5YERcOOoxTUGYpC78FfeiLzGZ9' + 'Mfr0WqlmlnAzRCOyHtQ0KrhH2beh2T3BlbkFJElpdutwUdgf1ou' + 'xfqmSIfpx706SagBU3iWGc9cLebX8cS0RAVmY5qwuBuvMT5r_LFxy925BmAA';
const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';

const aiSolutionContainer = document.getElementById("ai-solution-container");
let aiSolution = null;
let moveIndex = -1;
let completed = false;
const aiSolutionTextDisplay = document.getElementById("move-sequence-text");
const playPreviousMove = document.getElementById("play-previous-move");
const playNextMove = document.getElementById("play-next-move");
const fullVisualSolutionButton = document.getElementById("full-visual-solution");

function renderPuzzle() {
    solvedMessage.hidden = true;
    completed = false;
    numberMoves.innerHTML = `<h4>0</h4>`
    knobs.hidden = false;
    if (customLabel && customLabel.length === n) {
        groundTruthLabels = customLabel.toUpperCase().split('');
    } else {
        groundTruthLabels = Array.from({length: n}, (_, i) => i + 1);
    }
    
    currentLabels = groundTruthLabels.slice();
    const indicesArr = [];
    for (let i = 1; i <= n-k+1; i++) {
        indicesArr.push(i);
    }

    knobs.innerHTML = indicesArr.map((index) => {
        let finalStructure = `<div class="knob-set">
            <button class="knob" id="knob-${index}-left">
                Shift elements ${index} to ${index+k-1} left
            </button>
            <button class="knob" id="knob-${index}-right">
                Shift elements ${index} to ${index+k-1} right 
            </button>
        </div>
        `;
        return finalStructure;
    }).join("");
    indicesArr.forEach((index) => {
        const leftButton = document.getElementById(`knob-${index}-left`);
        const rightButton = document.getElementById(`knob-${index}-right`);
        leftButton.addEventListener("click", () => {
            applyKnob(index, 'left');
        });
        rightButton.addEventListener("click", () => {
            applyKnob(index, 'right');
        });
    });
    numMoves = 0;

    scramblePuzzle();

    moveIndex = -1;
    aiSolution = null;
    aiSolutionContainer.hidden = true;
    

}

function formatSolution(solutionSequence) {
    const steps = solutionSequence.map((move, index) => {
        const direction = move.charAt(0);
        const knobIndex = parseInt(move.substring(1));
        const directionText = direction === 'L' ? 'left' : 'right';
        return `Step ${index + 1}: Turn Knob ${knobIndex} to the ${directionText} once.`;
    });
    return 'Solution: <br>' + steps.join('<br>');
}

async function solveWithAI() {
    try {
        const prompt = getAIPrompt();
        const response = await fetchGPT(prompt);
        const solution = JSON.parse(response);
        if (solution && solution.full_solution_sequence) {
            aiSolution = solution.full_solution_sequence;
            moveIndex = -1;
        }
        return solution;
    } catch (error) {
        console.error('AI Solver error:', error);
        return null;
    }
}

function getAIPrompt() {

    return `You have a puzzle with initial state sigma_0 (a permutation of {1, 2, ..., n}, or an initial_word of length n letters.). Rules: - There are n-k+1 knobs (positions 1 to n-k+1) - Knob i operates on k consecutive elements starting at position i - Li = left cyclic shift of these k elements - Ri = right cyclic shift of these k elements Goal: Transform sigma_0 into the sorted sequence [1, 2, 3, ..., n] Required output format (output only this JSON object and NOTHING ELSE PLEASE): \\json { "num_moves_in_solution": integer, "full_solution_sequence": [<moves>] } \\ Where each move is a string like "L1", "R2", etc. Return only the JSON object above, nothing else. DO NOT OUTPUT ANY EXPLANATIONS OR ANY OF YOUR THINKING, OUTPUT THE SOLUTION IN THE JSON FORMAT PRESENTED ABOVE ONLY. Given: n=${n}, k=${k}, sigma_0=${JSON.stringify(currentLabels)}, initial_word=${JSON.stringify(groundTruthLabels)}.`;
    
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


function applyKnob (index, orientation) {
    const currIndex = index;
    let shuffleWindow = currentLabels.slice(currIndex-1, currIndex+k-1);
    if (orientation == 'left') {
        shuffleWindow = leftShift(shuffleWindow);
    }
    else if (orientation == 'right') {
        shuffleWindow = rightShift(shuffleWindow);
    }
    for (let j = 0; j < k; j++) {
        currentLabels[currIndex - 1 + j] = shuffleWindow[j];
    }
    numMoves += 1;
    numberMoves.innerHTML = `<h4>${numMoves}</h4>`
    checkCompletion();
    updateLabels();
}

function checkCompletion() {
    const solved = currentLabels.length === groundTruthLabels.length && 
                    currentLabels.every((label, index) => label === groundTruthLabels[index]);
    if (solved) {
        completed = true;
    }
    else {
        completed = false;
    }
}

function scramblePuzzle() {
    const numShuffles = 50;
    for (let i = 1; i <= numShuffles; i++) {
        const currIndex = getRandomInt(1, n-k+1);
        let shuffleWindow = currentLabels.slice(currIndex-1, currIndex+k-1);
        const shift = getRandomInt(0, 1);
        if (shift == 0) {
            shuffleWindow = leftShift(shuffleWindow);
        }
        else {
            shuffleWindow = rightShift(shuffleWindow);
        }
        for (let j = 0; j < k; j++) {
            currentLabels[currIndex - 1 + j] = shuffleWindow[j];
        }
    }

    updateLabels();
}

function updateLabels() {
    const indices = [];
    for (let i = 1; i <= n; i++) {
        indices.push(i);
    }
    
    const labelString = indices.map((index) => {
        return currentLabels[index - 1];
    }).join(" ");
    permutationDisplay.innerHTML = `<h3>${labelString}</h3>`;

    if (completed) {
        solvedMessage.hidden = false;
    }
    else {
        solvedMessage.hidden = true;
    }

}

function getRandomInt (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function leftShift(arr) {
    if (arr.length === 0) {
        return arr;
    }
    else {
        const first = arr.shift();
        arr.push(first);
        return arr;
    }
}

function rightShift(arr) {
    if (arr.length === 0) {
        return arr;
    }
    else {
        const last = arr.pop();
        arr.unshift(last);
        return arr;
    }
}

function displayAiSolution() {
    aiSolutionContainer.hidden = false;
    const solutionText = formatSolution(aiSolution);
    aiSolutionTextDisplay.innerHTML = solutionText;

    UpdateUI();

}

function UpdateUI() {
    playPreviousMove.disabled = moveIndex < 0;
    playNextMove.disabled = moveIndex >= aiSolution.length-1;
}

function showNextMove() {
    moveIndex = moveIndex + 1;
    const steps = aiSolution.map((move, index) => {
        const direction = move.charAt(0);
        const knobIndex = parseInt(move.substring(1));
        const directionText = direction === 'L' ? 'left' : 'right';
        return {knobIndex: knobIndex, orientation: directionText};
    });
    applyKnob(steps[moveIndex].knobIndex, steps[moveIndex].orientation);
    UpdateUI();

}

function undoPreviousMove() {
    const steps = aiSolution.map((move, index) => {
        const direction = move.charAt(0);
        const knobIndex = parseInt(move.substring(1));
        const directionText = direction === 'L' ? 'left' : 'right';
        return {knobIndex: knobIndex, orientation: directionText};
    });

    applyKnob(steps[moveIndex].knobIndex, steps[moveIndex].orientation === 'right' ? 'left' : 'right');
    moveIndex = moveIndex - 1;
    UpdateUI();
}

document.addEventListener("DOMContentLoaded", async () => {
    renderPuzzle();
    //test the GPT AI
    //fetchGPT("Say hello world in a silly JSON format");

    //more testing
    //const solution = await solveWithAI();
    //console.log("AI Solution:", solution);

    const solveButton = document.getElementById("solve-with-ai-button");

    customizationForm.addEventListener("submit", async(event) => {
        event.preventDefault();
        n = parseInt(permLengthInput.value);
        k = parseInt(windowSizeInput.value);
        customLabel = customLabelInput.value;

        renderPuzzle();
        
    });
    solveButton.addEventListener("click", async () => {

        solveButton.disabled = true;
        solveButton.textContent = "Solving...";
        const solution = await solveWithAI();
        console.log(solution.full_solution_sequence);
        displayAiSolution();
        solveButton.disabled = false;
        solveButton.textContent = "Solve with AI";

    });

    playPreviousMove.addEventListener("click", () => {
        undoPreviousMove();
    });

    playNextMove.addEventListener("click", () => {
        showNextMove();
    }); 

    permLengthInput.addEventListener("input", (event) => {
        const inputValue = event.target.value;
        windowSizeInput.max = parseInt(inputValue)-1;
    });
    

    resetButton.addEventListener("click", () => {
        customizationForm.reset();
    });

    scrambleButton.addEventListener("click", async() => {

        renderPuzzle(); 

        
    });
    
})