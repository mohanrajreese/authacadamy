// Auth Quiz - Interactive Quiz Logic

let currentQuiz = null;
let currentQuestionIndex = 0;
let answers = [];
let stats = JSON.parse(localStorage.getItem('quizStats') || '{"total": 0, "scores": [], "badges": []}');

function init() {
    // Quiz selection
    document.querySelectorAll('.quiz-card').forEach(card => {
        card.addEventListener('click', () => startQuiz(card.dataset.quiz));
    });

    // Quiz controls
    document.getElementById('skipBtn').addEventListener('click', skipQuestion);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('retryBtn').addEventListener('click', retryQuiz);
    document.getElementById('newQuizBtn').addEventListener('click', showSelection);

    updateStatsDisplay();
    console.log('🎓 Auth Quiz loaded');
}

function startQuiz(quizType) {
    if (quizType === 'mixed') {
        currentQuiz = generateMixedQuiz();
    } else {
        currentQuiz = { ...quizData[quizType] };
        // Shuffle questions
        currentQuiz.questions = [...currentQuiz.questions].sort(() => Math.random() - 0.5);
    }

    currentQuestionIndex = 0;
    answers = [];

    document.getElementById('quizSelection').classList.add('hidden');
    document.getElementById('activeQuiz').classList.remove('hidden');
    document.getElementById('quizResults').classList.add('hidden');

    document.getElementById('quizTitle').textContent = currentQuiz.title;
    document.getElementById('totalQ').textContent = currentQuiz.questions.length;

    showQuestion();
}

function showQuestion() {
    const question = currentQuiz.questions[currentQuestionIndex];
    const total = currentQuiz.questions.length;

    document.getElementById('currentQ').textContent = currentQuestionIndex + 1;
    document.getElementById('quizProgress').style.width = `${((currentQuestionIndex) / total) * 100}%`;

    document.getElementById('questionText').textContent = question.question;

    const optionsList = document.getElementById('optionsList');
    const letters = ['A', 'B', 'C', 'D'];

    optionsList.innerHTML = question.options.map((option, index) => `
        <button class="option-btn" data-index="${index}">
            <span class="option-letter">${letters[index]}</span>
            <span class="option-text">${option}</span>
        </button>
    `).join('');

    optionsList.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => selectAnswer(parseInt(btn.dataset.index)));
    });

    document.getElementById('skipBtn').classList.remove('hidden');
    document.getElementById('nextBtn').classList.add('hidden');
    document.getElementById('explanation').classList.add('hidden');
}

function selectAnswer(index) {
    const question = currentQuiz.questions[currentQuestionIndex];
    const isCorrect = index === question.correct;

    answers.push({
        questionIndex: currentQuestionIndex,
        selected: index,
        correct: question.correct,
        isCorrect
    });

    // Highlight correct/wrong
    const options = document.querySelectorAll('.option-btn');
    options.forEach((btn, i) => {
        btn.disabled = true;
        if (i === question.correct) {
            btn.classList.add('correct');
        } else if (i === index && !isCorrect) {
            btn.classList.add('wrong');
        }
    });

    // Show explanation
    document.getElementById('explanationText').textContent = question.explanation;
    document.getElementById('explanation').classList.remove('hidden');

    // Show next button
    document.getElementById('skipBtn').classList.add('hidden');
    document.getElementById('nextBtn').classList.remove('hidden');

    if (isCorrect) {
        showToast('✅ Correct!');
    } else {
        showToast('❌ Wrong answer');
    }
}

function skipQuestion() {
    answers.push({
        questionIndex: currentQuestionIndex,
        selected: null,
        correct: currentQuiz.questions[currentQuestionIndex].correct,
        isCorrect: false,
        skipped: true
    });

    nextQuestion();
}

function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex >= currentQuiz.questions.length) {
        showResults();
    } else {
        showQuestion();
    }
}

function showResults() {
    const correct = answers.filter(a => a.isCorrect).length;
    const wrong = answers.filter(a => !a.isCorrect && !a.skipped).length;
    const skipped = answers.filter(a => a.skipped).length;
    const total = currentQuiz.questions.length;
    const percentage = Math.round((correct / total) * 100);

    document.getElementById('activeQuiz').classList.add('hidden');
    document.getElementById('quizResults').classList.remove('hidden');

    // Icon and title based on score
    let icon, title;
    if (percentage >= 90) {
        icon = '🏆'; title = 'Outstanding!';
    } else if (percentage >= 70) {
        icon = '🎉'; title = 'Great Job!';
    } else if (percentage >= 50) {
        icon = '👍'; title = 'Good Effort!';
    } else {
        icon = '📚'; title = 'Keep Learning!';
    }

    document.getElementById('resultsIcon').textContent = icon;
    document.getElementById('resultsTitle').textContent = title;
    document.getElementById('scoreValue').textContent = correct;
    document.getElementById('scorePercentage').textContent = `${percentage}% Correct`;
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('wrongCount').textContent = wrong;
    document.getElementById('skippedCount').textContent = skipped;

    // Update progress bar
    document.getElementById('quizProgress').style.width = '100%';

    // Badge logic
    const badgeEarned = document.getElementById('badgeEarned');
    if (percentage >= 80) {
        badgeEarned.classList.remove('hidden');
        const badgeName = `${currentQuiz.title} Expert`;
        document.getElementById('badgeIcon').textContent = percentage === 100 ? '🥇' : '🥈';
        document.getElementById('badgeName').textContent = badgeName;

        if (!stats.badges.includes(badgeName)) {
            stats.badges.push(badgeName);
        }
    } else {
        badgeEarned.classList.add('hidden');
    }

    // Save stats
    stats.total++;
    stats.scores.push(percentage);
    localStorage.setItem('quizStats', JSON.stringify(stats));
    updateStatsDisplay();
}

function retryQuiz() {
    currentQuestionIndex = 0;
    answers = [];
    currentQuiz.questions = [...currentQuiz.questions].sort(() => Math.random() - 0.5);

    document.getElementById('quizResults').classList.add('hidden');
    document.getElementById('activeQuiz').classList.remove('hidden');

    showQuestion();
}

function showSelection() {
    document.getElementById('quizResults').classList.add('hidden');
    document.getElementById('activeQuiz').classList.add('hidden');
    document.getElementById('quizSelection').classList.remove('hidden');
}

function updateStatsDisplay() {
    document.getElementById('totalQuizzes').textContent = stats.total;

    if (stats.scores.length > 0) {
        const avg = Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length);
        const best = Math.max(...stats.scores);
        document.getElementById('avgScore').textContent = `${avg}%`;
        document.getElementById('bestScore').textContent = `${best}%`;
    }

    document.getElementById('totalBadges').textContent = stats.badges.length;
}

function showToast(message, duration = 1500) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
