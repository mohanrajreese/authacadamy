// Learning Progress Tracker - Shared Component
// Tracks which tools users have visited and their progress

class ProgressTracker {
    constructor() {
        this.storageKey = 'authAcademyProgress';
        this.progress = this.load();
        this.tools = {
            'jwt-explainer': { name: 'JWT Explainer', icon: '🎫', path: '/jwt-explainer/' },
            'oauth-visualizer': { name: 'OAuth 2.0 Visualizer', icon: '🔐', path: '/oauth-visualizer/' },
            'session-vs-token': { name: 'Session vs Token', icon: '⚖️', path: '/auth-academy/session-vs-token/' },
            'api-key-security': { name: 'API Key Security', icon: '🔑', path: '/auth-academy/api-key-security/' },
            'auth-decision-tree': { name: 'Auth Decision Tree', icon: '🌲', path: '/auth-academy/auth-decision-tree/' },
            'playground': { name: 'Auth Playground', icon: '🎮', path: '/auth-academy/playground/' },
            'comparison-matrix': { name: 'Comparison Matrix', icon: '📊', path: '/auth-academy/comparison-matrix/' },
            'quiz': { name: 'Knowledge Quiz', icon: '🎓', path: '/auth-academy/quiz/' }
        };

        this.trackCurrentPage();
        this.renderProgressWidget();
    }

    load() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {
            visited: [],
            completedQuizzes: 0,
            totalTimeSpent: 0,
            firstVisit: Date.now(),
            lastVisit: Date.now()
        };
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    }

    trackCurrentPage() {
        const path = window.location.pathname;
        let currentTool = null;

        for (const [id, tool] of Object.entries(this.tools)) {
            if (path.includes(id.replace('-', '-')) || path.includes(tool.path)) {
                currentTool = id;
                break;
            }
        }

        // Also check by folder name
        if (!currentTool) {
            if (path.includes('jwt-explainer')) currentTool = 'jwt-explainer';
            else if (path.includes('oauth-visualizer')) currentTool = 'oauth-visualizer';
            else if (path.includes('session-vs-token')) currentTool = 'session-vs-token';
            else if (path.includes('api-key-security')) currentTool = 'api-key-security';
            else if (path.includes('auth-decision-tree')) currentTool = 'auth-decision-tree';
            else if (path.includes('playground')) currentTool = 'playground';
            else if (path.includes('comparison-matrix')) currentTool = 'comparison-matrix';
            else if (path.includes('quiz')) currentTool = 'quiz';
        }

        if (currentTool && !this.progress.visited.includes(currentTool)) {
            this.progress.visited.push(currentTool);
            this.save();
        }

        this.progress.lastVisit = Date.now();
        this.save();
    }

    getCompletionPercentage() {
        const total = Object.keys(this.tools).length;
        const visited = this.progress.visited.length;
        return Math.round((visited / total) * 100);
    }

    renderProgressWidget() {
        // Only show on hub page or if user has started learning
        if (this.progress.visited.length === 0) return;

        const percentage = this.getCompletionPercentage();
        const visited = this.progress.visited.length;
        const total = Object.keys(this.tools).length;

        const widget = document.createElement('div');
        widget.className = 'progress-widget';
        widget.innerHTML = `
            <button class="progress-toggle" id="progressToggle">
                <div class="progress-ring">
                    <svg viewBox="0 0 36 36">
                        <path class="progress-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                        <path class="progress-ring-fill" stroke-dasharray="${percentage}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    </svg>
                    <span class="progress-text">${percentage}%</span>
                </div>
            </button>
            <div class="progress-dropdown hidden" id="progressDropdown">
                <div class="progress-header">
                    <h4>📚 Learning Progress</h4>
                    <span>${visited}/${total} tools explored</span>
                </div>
                <div class="progress-list">
                    ${Object.entries(this.tools).map(([id, tool]) => `
                        <div class="progress-item ${this.progress.visited.includes(id) ? 'completed' : ''}">
                            <span class="progress-icon">${tool.icon}</span>
                            <span class="progress-name">${tool.name}</span>
                            <span class="progress-check">${this.progress.visited.includes(id) ? '✓' : ''}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="progress-footer">
                    ${percentage === 100
                ? '<span class="trophy">🏆 All tools explored!</span>'
                : `<span>Keep going! ${total - visited} more to explore</span>`}
                </div>
            </div>
        `;

        document.body.appendChild(widget);

        // Toggle dropdown
        document.getElementById('progressToggle').addEventListener('click', () => {
            document.getElementById('progressDropdown').classList.toggle('hidden');
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!widget.contains(e.target)) {
                document.getElementById('progressDropdown').classList.add('hidden');
            }
        });
    }

    markQuizCompleted() {
        this.progress.completedQuizzes++;
        this.save();
    }
}

// Auto-initialize
const progressTracker = new ProgressTracker();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressTracker;
}
