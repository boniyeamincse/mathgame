document.addEventListener('DOMContentLoaded', () => {
    // Set copyright year
    document.getElementById('copyright-year').textContent = new Date().getFullYear();
    // Game state variables
    let playerName = '';
    let difficulty = 'easy';
    let score = 0;
    let questionNumber = 1;
    let timeLeft = 120;
    let timer = null;
    let currentAnswer = null;

    // Load high scores from localStorage
    let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

    // DOM Elements
    const sections = {
        registration: document.getElementById('registration'),
        game: document.getElementById('game'),
        results: document.getElementById('results')
    };

    // Event Listeners
    document.getElementById('startGame').addEventListener('click', startGame);
    document.getElementById('submit').addEventListener('click', checkAnswer);
    document.getElementById('playAgain').addEventListener('click', resetGame);

    // Game Functions
    function startGame() {
        playerName = document.getElementById('playerName').value.trim();
        if (!playerName) {
            alert('Please enter your name!');
            return;
        }
        difficulty = document.querySelector('input[name="difficulty"]:checked').value;
        document.getElementById('playerNameDisplay').textContent = `Player: ${playerName}`;
        showSection('game');
        generateQuestion();
        startTimer();
    }

    function generateQuestion() {
        let num1, num2, operation;
        const operations = ['+', '-', '*', '/'];

        switch(difficulty) {
            case 'easy':
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                operation = operations[Math.floor(Math.random() * 2)]; // Only + and -
                break;
            case 'medium':
                num1 = Math.floor(Math.random() * 90) + 10;
                num2 = Math.floor(Math.random() * 90) + 10;
                operation = operations[Math.floor(Math.random() * 3)]; // +, -, and *
                break;
            case 'hard':
                num1 = Math.floor(Math.random() * 900) + 100;
                num2 = Math.floor(Math.random() * 90) + 10;
                operation = operations[Math.floor(Math.random() * 4)]; // All operations
                break;
        }

        // Ensure division results in whole numbers
        if (operation === '/') {
            currentAnswer = num2;
            num1 = num1 * num2;
        } else {
            currentAnswer = eval(`${num1} ${operation} ${num2}`);
        }

        document.getElementById('problem').textContent = `${num1} ${operation} ${num2} = ?`;
        document.getElementById('answer').value = '';
        document.getElementById('questionNumber').textContent = questionNumber;
    }

    function showPopup(message, isCorrect) {
        const popup = document.createElement('div');
        popup.className = `popup-notification ${isCorrect ? 'popup-correct' : 'popup-incorrect'}`;
        popup.textContent = message;
        document.body.appendChild(popup);

        setTimeout(() => {
            document.body.removeChild(popup);
        }, 2000);
    }

    function checkAnswer() {
        const userAnswer = parseFloat(document.getElementById('answer').value);
        if (isNaN(userAnswer)) {
            showPopup('Please enter a valid number!', false);
            return;
        }

        if (userAnswer === currentAnswer) {
            score += 5;
            showPopup('Correct! +5 points', true);
        } else {
            score = Math.max(0, score - 1);
            showPopup(`Incorrect! The answer was ${currentAnswer}. -1 point`, false);
        }

        document.getElementById('score').textContent = `Score: ${score}`;

        if (questionNumber === 10) {
            endGame();
        } else {
            questionNumber++;
            timeLeft = 120;
            generateQuestion();
        }
    }

    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            document.getElementById('timeLeft').textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
                alert('Time\'s up!');
                checkAnswer();
            }
        }, 1000);
    }

    function endGame() {
        clearInterval(timer);
        document.getElementById('finalScore').textContent = score;

        // Add current score to high scores
        highScores.push({
            name: playerName,
            score: score,
            difficulty: difficulty
        });

        // Sort high scores in descending order
        highScores.sort((a, b) => b.score - a.score);

        // Keep only top 10 scores
        highScores = highScores.slice(0, 10);

        // Save to localStorage
        localStorage.setItem('highScores', JSON.stringify(highScores));

        // Update leaderboard display
        updateLeaderboard();

        showSection('results');
    }

    function updateLeaderboard() {
        const leaderboardBody = document.getElementById('leaderboardBody');
        leaderboardBody.innerHTML = '';

        highScores.forEach((score, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${score.name}</td>
                <td>${score.score}</td>
                <td>${score.difficulty}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    }

    function resetGame() {
        score = 0;
        questionNumber = 1;
        timeLeft = 120;
        document.getElementById('score').textContent = 'Score: 0';
        document.getElementById('playerName').value = '';
        showSection('registration');
    }

    function showSection(sectionId) {
        Object.values(sections).forEach(section => {
            section.style.display = 'none';
        });
        sections[sectionId].style.display = 'block';
        sections[sectionId].classList.add('active');
    }
});