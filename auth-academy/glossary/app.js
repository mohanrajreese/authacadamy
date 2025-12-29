// Glossary App Logic

let filteredTerms = [...glossaryTerms];

function init() {
    renderLetterNav();
    renderTerms();
    updateStats();

    document.getElementById('glossarySearch').addEventListener('input', (e) => {
        filterTerms(e.target.value);
    });

    console.log('📖 Glossary loaded with', glossaryTerms.length, 'terms');
}

function renderLetterNav() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const usedLetters = new Set(glossaryTerms.map(t => t.term[0].toUpperCase()));

    const nav = document.getElementById('letterNav');
    nav.innerHTML = letters.map(letter => `
        <button class="letter-btn ${usedLetters.has(letter) ? '' : 'disabled'}" 
                data-letter="${letter}" 
                ${usedLetters.has(letter) ? '' : 'disabled'}>
            ${letter}
        </button>
    `).join('');

    nav.querySelectorAll('.letter-btn:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', () => scrollToLetter(btn.dataset.letter));
    });
}

function renderTerms(terms = filteredTerms) {
    const container = document.getElementById('termsList');
    const noResults = document.getElementById('noResults');

    if (terms.length === 0) {
        container.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');

    // Group by first letter
    const grouped = {};
    terms.forEach(term => {
        const letter = term.term[0].toUpperCase();
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push(term);
    });

    // Sort letters
    const sortedLetters = Object.keys(grouped).sort();

    container.innerHTML = sortedLetters.map(letter => `
        <div class="letter-group" id="letter-${letter}">
            <h2 class="letter-heading">${letter}</h2>
            ${grouped[letter].map(term => `
                <div class="term-card">
                    <div class="term-header">
                        <span class="term-name">${term.term}</span>
                        <span class="term-category">${term.category}</span>
                    </div>
                    <p class="term-definition">${term.definition}</p>
                    ${term.related && term.related.length > 0 ? `
                        <div class="term-related">
                            ${term.related.map(r => `
                                <span class="related-tag" data-term="${r}">${r}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `).join('');

    // Add click handlers for related tags
    container.querySelectorAll('.related-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            document.getElementById('glossarySearch').value = tag.dataset.term;
            filterTerms(tag.dataset.term);
        });
    });
}

function filterTerms(query) {
    if (!query.trim()) {
        filteredTerms = [...glossaryTerms];
    } else {
        const q = query.toLowerCase();
        filteredTerms = glossaryTerms.filter(term =>
            term.term.toLowerCase().includes(q) ||
            term.definition.toLowerCase().includes(q) ||
            term.category.toLowerCase().includes(q) ||
            (term.related && term.related.some(r => r.toLowerCase().includes(q)))
        );
    }

    renderTerms();
}

function scrollToLetter(letter) {
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function updateStats() {
    document.getElementById('totalTerms').textContent = glossaryTerms.length;

    const categories = new Set(glossaryTerms.map(t => t.category));
    document.getElementById('categoryCount').textContent = categories.size;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
