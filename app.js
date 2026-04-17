let userIP = "Detecting Security...";
const apiBase = "/api/generate-link"; // 🛡️ Ye ek hi link kaafi hai ab!

document.addEventListener('DOMContentLoaded', () => {
    fetchRealPayouts();
    fetchIP();
});

// 🛡️ BFCache Fix: Reset buttons
window.addEventListener('pageshow', (event) => {
    const launchBtn = document.getElementById('launch-btn');
    if (launchBtn) {
        launchBtn.disabled = false;
        launchBtn.innerHTML = "Launch Task ➜";
    }
    const historyBtn = document.getElementById('history-btn-main');
    if (historyBtn) {
        historyBtn.disabled = false;
        historyBtn.innerText = "Check History";
    }
});

// 🛡️ 1. Fetch User IP
async function fetchIP() {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        userIP = data.ip;
        const ipDisplay = document.getElementById('user-ip');
        if(ipDisplay) ipDisplay.innerText = `IP: ${userIP} (SECURED)`;
    } catch (e) {
        userIP = "Unknown";
    }
}

// 🛡️ 2. Real-Time Payouts (via Master API)
async function fetchRealPayouts() {
    const container = document.getElementById('payout-list-container');
    if (!container) return;
    try {
        const res = await fetch(`${apiBase}?action=getPayouts`);
        const payouts = await res.json();
        
        if (!Array.isArray(payouts) || payouts.length === 0) {
            container.innerHTML = '<p style="opacity:0.5; font-size:0.8rem; padding: 20px;">Waiting for new completions...</p>';
            return;
        }

        container.innerHTML = '';
        payouts.slice(0, 6).forEach(p => {
            const rawId = String(p.workerId || "User");
            const wId = rawId.startsWith("GUEST") ? "GUEST" : rawId;
            const amt = String(p.amount || "0.00");
            const timeStr = p.time ? "Recently" : "Just now";
            
            const div = document.createElement('div');
            div.className = 'payout-item';
            div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 40px; height: 40px; background: rgba(99, 102, 241, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--primary);">
                        <i class="fas fa-user-check"></i>
                    </div>
                    <div>
                        <div style="font-size: 0.95rem; font-weight: 600;">${wId.substring(0,3)}***</div>
                        <div style="font-size: 0.7rem; color: #94a3b8;">${timeStr}</div>
                    </div>
                </div>
                <div class="payout-amount">+$${amt.replace('$', '')}</div>
            `;
            container.appendChild(div);
        });
    } catch (e) {
        container.innerHTML = '<p style="color:#6366f1; font-size:0.8rem;">Syncing Live Data...</p>';
    }
}

setInterval(fetchRealPayouts, 25000);

// 🛡️ 3. Smart Availability Checker (via Master API)
async function checkTheoremAvailability(workerId) {
    const badge = document.getElementById('survey-availability-badge');
    const text = document.getElementById('availability-text');
    if(!badge || !text) return;

    text.innerText = "Checking Surveys...";
    try {
        const res = await fetch(`${apiBase}?action=checkAvailability&workerId=${workerId}&ipAddress=${userIP}`);
        const data = await res.json();
        
        if(data.surveys_available) {
            badge.style.background = "rgba(16, 185, 129, 0.1)";
            badge.style.borderColor = "rgba(16, 185, 129, 0.3)";
            badge.style.color = "#10b981";
            text.innerHTML = "Surveys Found: <b>YES ✅</b>";
        } else {
            text.innerText = "No New Surveys (Check Later)";
            badge.style.color = "#94a3b8";
        }
    } catch (e) {
        text.innerText = "Survey Session: ACTIVE 🛡️";
        badge.style.color = "#6366f1";
    }
}

// 🛡️ 4. Check User Stats (via Master API)
async function checkUserStats() {
    const workerId = document.getElementById('workerId').value.trim();
    if (!workerId) {
        alert("Please enter your ID first.");
        return;
    }

    checkTheoremAvailability(workerId);

    // GUEST Mode
    if (workerId.toUpperCase() === 'GUEST' || workerId.toUpperCase() === 'TESTER') {
        const statsContainer = document.getElementById('user-stats-container');
        if(statsContainer) {
            statsContainer.style.display = 'block';
            document.getElementById('display-name').innerText = "Tester/Auditor";
            document.getElementById('total-tasks').innerText = "Demo";
            document.getElementById('today-tasks').innerText = "Live";
            document.getElementById('user-status').innerText = "Verified Guest";
        }
        return;
    }

    const btn = document.getElementById('history-btn-main');
    if(btn) btn.innerText = "Checking...";
    
    try {
        const res = await fetch(`${apiBase}?action=checkStats&workerId=${workerId}`);
        const data = await res.json();

        if (btn) btn.innerText = "Check History";

        if (data.error === "UNAUTHORIZED") {
            alert(`⚠️ ACCESS DENIED: Worker ID "${workerId}" is not authorized.`);
            return;
        }

        const statsContainer = document.getElementById('user-stats-container');
        if(statsContainer && !data.error) {
            statsContainer.style.display = 'block';
            document.getElementById('display-name').innerText = workerId;
            document.getElementById('total-tasks').innerText = data.totalTasks || 0;
            document.getElementById('today-tasks').innerText = data.todayTasks || 0;
            document.getElementById('user-status').innerText = data.status || "Active";
            statsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } catch (e) {
        if (btn) btn.innerText = "Check History";
        alert("System Busy. Please try again later.");
    }
}

// 🛡️ 5. Launch Survey (via Master API)
async function launchSurvey() {
    const workerId = document.getElementById('workerId').value.trim();
    const turnstileResponse = typeof turnstile !== 'undefined' ? turnstile.getResponse() : "";

    if (!workerId || workerId.length < 3) {
        alert("Enter a valid Worker ID.");
        return;
    }

    if (!turnstileResponse) {
        alert("🤖 SECURITY CHECK: Please complete the Cloudflare checkbox.");
        return;
    }

    const btn = document.getElementById('launch-btn');
    if(btn) {
        btn.disabled = true;
        btn.innerHTML = "Authenticating Session...";
    }

    const isGuest = workerId.toUpperCase() === "GUEST" || workerId.toUpperCase() === "TESTER";
    const finalId = isGuest ? `GUEST_${Math.floor(Math.random() * 9000 + 1000)}` : workerId;

    try {
        const res = await fetch(`${apiBase}?action=launch&workerId=${finalId}&ipAddress=${userIP}`);
        const data = await res.json();
        
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error("Launch failed");
        }
    } catch (e) {
        alert("⚠️ Security Protocol Error. Redoing check...");
        if(btn) {
            btn.disabled = false;
            btn.innerHTML = "Launch Task ➜";
        }
    }
}
