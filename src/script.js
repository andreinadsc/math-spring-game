const questionsButtons = document.querySelectorAll('.game_container-questions');
const roundButton = document.querySelector('.game_container-round--button');

const questionMenuPage = document.querySelector('.game_menu');
const roundPage = document.querySelector('.game_round');
const countdownPage = document.querySelector('.game_countdown');
const scoresPage = document.querySelector('.game_scores');

const gameQuestionsButton = document.querySelector('.game_questions-button');
const scoresEl = document.querySelectorAll('#score');

const firstNumberEl = document.getElementById('number1');
const secondNumberEl = document.getElementById('number2');
const operatorEl = document.getElementById('operator');
const resultEl = document.getElementById('result');
const numberQuestionsEl = document.querySelector('.game_questions-info');

const finalTimeEl = document.querySelector('.game_scores-total');
const baseTimeEl = document.querySelector('.game_scores-base');
const penaltyTimeEl = document.querySelector('.game_scores-penalty');
const scoresWin = document.querySelector('.game_scores-win');
const playAgainBtn = document.querySelector('.game_scores-button');


let selectedRoundInfo = {
    numberQuestions: 0,
    currentIndex: 0,
    correctValue: 0,
    timePlayed: 0,
    penaltyTime: 0,
    finalTime: 0
};

let operationObject = [];
let timer;

const operationsMap = ['+', '-', '*', '/', '<', '>'];
const questionsMap = [10, 25, 50, 99];


const formatValue = (value) => {
    const formatValue = value.replace(',', '.').toLowerCase();

    return !isNaN(formatValue) ? Number(formatValue).toFixed(2) : formatValue;
};

const showHideScreens = (showScreen, hideScreen) => {
    showScreen.classList.remove('hide');
    hideScreen.classList.add('hide');
}

const getCurrentScores = (questionsNum) => {
    const scores = JSON.parse(localStorage.getItem('scores'));
    return scores ? scores[questionsNum] : 0.0;
}

const setNewScores = (questionsNum, newScore) => {
    let scores = JSON.parse(localStorage.getItem('scores'));

    if (!scores) {
        scores = {
            10: 0.0,
            25: 0.0,
            50: 0.0,
            99: 0.0,
        }
    }

    scores[questionsNum] = newScore;
    localStorage.setItem('scores', JSON.stringify(scores));
    return;
}

const executeOperation = (number1, number2, operator) => {
    switch (operator) {
        case 0:
            return number1 + number2;
        case 1:
            return number1 - number2;
        case 2:
            return number1 * number2;
        case 3:
            return (number1 / number2).toFixed(2);
        case 4:
            return (number1 < number2).toString();
        case 5:
            return (number1 > number2).toString();
    }
}

const addTime = () => {
    selectedRoundInfo.timePlayed += 0.1;
    checkTime();
}

const checkTime = () => {
    const { timePlayed, penaltyTime, currentIndex, numberQuestions } = selectedRoundInfo;
    if (currentIndex > numberQuestions) {
        clearInterval(timer);
        selectedRoundInfo.finalTime = timePlayed + penaltyTime;
        setScoresElements();
    }
}

const setScoresElements = () => {
    const { finalTime, penaltyTime, timePlayed, numberQuestions } = selectedRoundInfo;
    
    baseTimeEl.textContent = `Base Time: ${timePlayed.toFixed(1)}s`;
    penaltyTimeEl.textContent = `Penalty: +${penaltyTime.toFixed(1)}s`;
    finalTimeEl.textContent = `Final Time: ${finalTime.toFixed(1)}s`;

    showHideScreens(scoresPage, roundPage);

    if (getCurrentScores(numberQuestions) > finalTime || getCurrentScores(numberQuestions) === 0) {
        setNewScores(numberQuestions, finalTime);
        startConfetti();
        scoresWin.textContent = `Excellent! You set a new time record for the ${numberQuestions} questions round: ${finalTime.toFixed(1)}s`;
    } else {
        scoresWin.textContent = `Nice try!`;
    }
}

const removePreviousSelection = () => questionsButtons.forEach(button => button.classList.remove('selected'));

const getOperation = (current) => {
    const firstNumber = Math.floor(Math.random() * 100) + 1;
    const secondNumber = Math.floor(Math.random() * 100) + 1;
    const operationChoice = Math.floor(Math.random() * 6);
    const missingPosition = operationChoice < 4 ? Math.floor(Math.random() * 3) + 1 : 3;
    const result = executeOperation(firstNumber, secondNumber, operationChoice);

    operationObject = [firstNumber, operationsMap[operationChoice], secondNumber, result];
    selectedRoundInfo.correctValue = operationObject[missingPosition];
    operationObject[missingPosition] = '';

    numberQuestionsEl.textContent = `Question ${current + 1} of ${selectedRoundInfo.numberQuestions}`;
    
    [firstNumberEl, operatorEl, secondNumberEl, resultEl].forEach((elem, i) => {
        elem.value = `${operationObject[i]}`;

        if (i === missingPosition) elem.disabled = false;
        else elem.disabled = true;
    });
}

const countdownStart = () => {
    countdownPage.textContent = '3';
    setTimeout(() => {
        countdownPage.textContent = '2';
    }, 1000);
    setTimeout(() => {
        countdownPage.textContent = '1';
    }, 2000);
    setTimeout(() => {
        countdownPage.textContent = 'GO!';
    }, 3000);
}

const selectedRound = (index) => {
    removePreviousSelection();
    questionsButtons[index].classList.add('selected');

    countdownPage.classList.add('hide');

    selectedRoundInfo.numberQuestions = questionsMap[index];
}

const startRound = () => {
    if (!selectedRoundInfo.numberQuestions) return;

    removePreviousSelection();
    showHideScreens(countdownPage, questionMenuPage);
    countdownStart();

    setTimeout(() => {
        showHideScreens(roundPage, countdownPage);
        getOperation(0);
        selectedRoundInfo.currentIndex++;
        timer = setInterval(addTime, 100);
    }, 4000);
}

const nextQuestion = async () => {
    const answerEl = document.querySelector('input:enabled');
    
    if (!answerEl.value) {
        answerEl.classList.add('error');
        selectedRoundInfo.penaltyTime += 0.5;
        return;
    }
    
    const yourAnswer = formatValue(answerEl.value);
    const { correctValue, currentIndex, numberQuestions } = selectedRoundInfo;

    answerEl.classList.remove('error');
    selectedRoundInfo.currentIndex++;

    if (yourAnswer === correctValue) {
        startConfetti();
        await setTimeout(() => stopConfetti(), 1000);
    } else { selectedRoundInfo.penaltyTime += 0.5 };

    if (currentIndex < numberQuestions) getOperation(currentIndex);
    return;
}


const playAgain = () => {
    questionsMap.forEach((question, index) => {
        scoresEl[index].textContent = `${getCurrentScores(question).toFixed(1)}s`;
    });
    stopConfetti();

    selectedRoundInfo = {
        numberQuestions: 0,
        currentIndex: 0,
        correctValue: 0,
        timePlayed: 0,
        penaltyTime: 0,
        finalTime: 0
    };

    showHideScreens(questionMenuPage, scoresPage);
}

const init = () => {
    questionsMap.forEach((question, index) => {
        scoresEl[index].textContent = `${getCurrentScores(question).toFixed(1)}s`;
    });
    questionsButtons.forEach((button, i) => button.addEventListener('click', selectedRound.bind(this, i)));
    roundButton.addEventListener('click', startRound);
    gameQuestionsButton.addEventListener('click', nextQuestion);
    playAgainBtn.addEventListener('click', playAgain);
}

init();