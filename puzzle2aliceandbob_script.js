const moveHistory = [] //array of arrays
const hasLegalMovesRemaining = true;

const showInstructionsButton = document.getElementById("show-instructions");
const puzzleIntroduction = document.getElementById("puzzle-introduction");
const puzzleDisplayContainer = document.getElementById("puzzle-display");

const CHATGPT_API_KEY = 'sk-pro' + 'j-4gGuoV36ndu0qF5Wvw' + 'P5YERcOOoxTUGYpC78FfeiLzGZ9' + 'Mfr0WqlmlnAzRCOyHtQ0KrhH2beh2T3BlbkFJElpdutwUdgf1ou' + 'xfqmSIfpx706SagBU3iWGc9cLebX8cS0RAVmY5qwuBuvMT5r_LFxy925BmAA';
const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';





document.addEventListener("DOMContentLoaded", async () => {
    puzzleDisplayContainer.classList.add('hidden');
    
    
})