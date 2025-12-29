// Session vs Token - Interactive Logic

let serverCount = 1;

function init() {
    document.getElementById('addServer').addEventListener('click', addServer);
    document.getElementById('removeServer').addEventListener('click', removeServer);
    console.log('✅ Session vs Token loaded');
}

function addServer() {
    if (serverCount >= 5) {
        showToast('⚠ Maximum 5 servers');
        return;
    }

    serverCount++;
    updateServers();
    showToast(`✅ Server ${serverCount} added`);
}

function removeServer() {
    if (serverCount <= 1) {
        showToast('⚠ Need at least 1 server');
        return;
    }

    serverCount--;
    updateServers();
    showToast(`➖ Server removed`);
}

function updateServers() {
    document.getElementById('serverCount').textContent = serverCount;

    // Update session servers
    const sessionServers = document.getElementById('sessionServers');
    sessionServers.innerHTML = '';
    for (let i = 1; i <= serverCount; i++) {
        sessionServers.innerHTML += `
            <div class="server">
                <div class="server-icon">🖥️</div>
                <div class="server-label">Server ${i}</div>
                <div class="session-storage">
                    <div class="session-icon">📦</div>
                    <span>Sessions</span>
                </div>
            </div>
        `;
    }

    // Update token servers
    const tokenServers = document.getElementById('tokenServers');
    tokenServers.innerHTML = '';
    for (let i = 1; i <= serverCount; i++) {
        tokenServers.innerHTML += `
            <div class="server">
                <div class="server-icon">🖥️</div>
                <div class="server-label">Server ${i}</div>
                <div class="session-storage stateless-marker">
                    <div class="session-icon">✨</div>
                    <span>Stateless</span>
                </div>
            </div>
        `;
    }

    // Show/hide session issue
    const sessionIssue = document.getElementById('sessionIssue');
    if (serverCount > 1) {
        sessionIssue.classList.remove('hidden');
    } else {
        sessionIssue.classList.add('hidden');
    }
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
