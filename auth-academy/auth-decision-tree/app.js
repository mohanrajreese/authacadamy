// Auth Decision Tree - Interactive Logic

let currentQuestionIndex = 0;
let questionHistory = [];
let answers = {};

function init() {
    showQuestion(decisionTree.questions[0]);

    document.getElementById('backBtn').addEventListener('click', goBack);
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('tryAgainBtn')?.addEventListener('click', reset);

    // Code tab switching
    document.querySelectorAll('.code-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateCodeExample(tab.dataset.lang);
        });
    });

    console.log('🌲 Auth Decision Tree loaded');
}

function showQuestion(question) {
    const container = document.getElementById('questionContainer');
    const progressFill = document.getElementById('progressFill');
    const currentQ = document.getElementById('currentQuestion');

    // Update progress
    const progress = ((questionHistory.length + 1) / 5) * 100;
    progressFill.style.width = `${Math.min(progress, 100)}%`;
    currentQ.textContent = questionHistory.length + 1;

    // Build question HTML
    container.innerHTML = `
        <div class="question fade-in">
            <h3>${question.text}</h3>
            <div class="options">
                ${question.options.map((option, index) => `
                    <button class="option-btn" data-index="${index}">
                        <span class="option-text">${option.text}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    // Add event listeners to options
    container.querySelectorAll('.option-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => selectOption(question, index));
    });

    // Update back button
    document.getElementById('backBtn').disabled = questionHistory.length === 0;
}

function selectOption(question, optionIndex) {
    const option = question.options[optionIndex];

    // Store answer
    answers[question.id] = option.text;
    questionHistory.push(question);

    if (option.result) {
        // End of path - show recommendation
        showRecommendation(option.result);
    } else if (option.next) {
        // Navigate to next question
        const nextQuestion = decisionTree.questions.find(q => q.id === option.next);
        if (nextQuestion) {
            showQuestion(nextQuestion);
        }
    }
}

function goBack() {
    if (questionHistory.length === 0) return;

    const previousQuestion = questionHistory.pop();
    delete answers[previousQuestion.id];

    const currentQuestion = questionHistory.length > 0
        ? questionHistory[questionHistory.length - 1]
        : decisionTree.questions[0];

    if (questionHistory.length > 0) {
        questionHistory.pop();
    }

    showQuestion(currentQuestion);
}

function reset() {
    questionHistory = [];
    answers = {};

    document.getElementById('wizardSection').classList.remove('hidden');
    document.getElementById('resultSection').classList.add('hidden');

    showQuestion(decisionTree.questions[0]);
    showToast('🔄 Starting over');
}

function showRecommendation(resultKey) {
    const rec = decisionTree.recommendations[resultKey];

    if (!rec) {
        showToast('⚠️ Recommendation not found');
        return;
    }

    // Hide wizard, show result
    document.getElementById('wizardSection').classList.add('hidden');
    document.getElementById('resultSection').classList.remove('hidden');

    // Update icon and name
    document.getElementById('resultIcon').textContent = rec.icon;
    document.getElementById('recommendedAuth').innerHTML = `
        <h2>${rec.name}</h2>
        <p>${rec.description}</p>
    `;

    // Reasoning
    document.getElementById('reasoning').innerHTML = `
        <ul class="reasoning-list">
            ${rec.reasoning.map(r => `<li>${r}</li>`).join('')}
        </ul>
    `;

    // Pros & Cons
    const prosConsHTML = `
        <div class="pros-cons-grid">
            <div class="pros-section">
                <h4>Advantages</h4>
                <ul>${rec.pros.map(p => `<li>${p}</li>`).join('')}</ul>
            </div>
            <div class="cons-section">
                <h4>Considerations</h4>
                <ul>${rec.cons.map(c => `<li>${c}</li>`).join('')}</ul>
            </div>
        </div>
    `;
    document.getElementById('reasoning').insertAdjacentHTML('beforeend', prosConsHTML);

    // Code example
    currentRecommendation = rec;
    updateCodeExample('nodejs');

    // Next steps
    document.getElementById('nextSteps').innerHTML = `
        <ul class="next-steps-list">
            ${rec.nextSteps.map(step => `<li>📌 ${step}</li>`).join('')}
        </ul>
    `;

    // Update explainer link
    if (rec.tools && rec.tools.length > 0) {
        document.getElementById('explainerLink').href = rec.tools[0];
    } else {
        document.getElementById('explainerLink').style.display = 'none';
    }

    // Scroll to result
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });

    showToast(`🎯 Recommended: ${rec.name}`);
}

let currentRecommendation = null;

function updateCodeExample(lang) {
    if (!currentRecommendation || !currentRecommendation.code) return;

    const code = currentRecommendation.code[lang] || currentRecommendation.code.nodejs;
    document.getElementById('codeExample').textContent = code;
}

function showToast(message, duration = 2000) {
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
