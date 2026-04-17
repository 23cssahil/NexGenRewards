let userIP = "Detecting...";
const scriptUrl = "/api/generate-link"; // 🛡️ Ab ye hamare secure API ko point karega

document.addEventListener('DOMContentLoaded', () => {
    fetchRealPayouts();
    fetchIP();
});

// 🛡️ BFCache Fix: Reset buttons when user comes back (Back Button)
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
    const rulesBtn = document.getElementById('rules-btn-main');
    if (rulesBtn) {
        rulesBtn.disabled = false;
        rulesBtn.innerHTML = "📋 Strict Rules";
    }
});

// 🛡️ 1. Fetch User IP
async function fetchIP() {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        userIP = data.ip;
        const ipDisplay = document.getElementById('user-ip');
        if(ipDisplay) ipDisplay.innerText = `IP: ${userIP}`;
    } catch (e) {
        userIP = "Unknown";
    }
}

// 🛡️ 2. Real-Time Payouts Logic (Social Proof)
async function fetchRealPayouts() {
    const container = document.getElementById('payout-list-container');
    try {
        const res = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTqI67V_T71O1H6-q9q9-9q9-9q9-9q9-9q9/pub?output=csv');
        const data = await res.text();
        const rows = data.split('\n').slice(1);
        const payouts = rows.map(r => {
            const cols = r.split(',');
            return { workerId: cols[0], amount: cols[3], time: cols[2] };
        }).filter(p => p.workerId && p.amount);

        if(!container) return;
        container.innerHTML = '';
        const latestPayouts = payouts.slice(0, 6);
        
        latestPayouts.forEach(p => {
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
        if(container) container.innerHTML = '<p style="color:#ff4757; font-size:0.8rem;">Live Feed Syncing...</p>';
    }
}

setInterval(fetchRealPayouts, 20000);

// 🛡️ 3. Smart Availability Checker (via Secure API)
async function checkTheoremAvailability(workerId) {
    const badge = document.getElementById('survey-availability-badge');
    const text = document.getElementById('availability-text');
    if(!badge || !text) return;

    text.innerText = "Checking Surveys...";
    
    try {
        const res = await fetch(`/api/generate-link?action=checkAvailability&workerId=${workerId}&ipAddress=${userIP}`);
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

// 🛡️ 4. Check User Stats (History)
async function checkUserStats() {
    const workerId = document.getElementById('workerId').value.trim();
    if (!workerId) {
        alert("Please enter your ID first.");
        return;
    }

    checkTheoremAvailability(workerId);

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
        // Note: Replace with your actual history sheet URL if needed
        const res = await fetch(`https://docs.google.com/spreadsheets/d/e/2PACX-1vTqI67V_T71O1H6-q9q9-9q9-9q9-9q9-9q9/pub?output=csv`);
        const data = await res.text();
        const rows = data.split('\n');
        const userRow = rows.find(r => r.includes(workerId));

        if (btn) btn.innerText = "Check History";

        if (!userRow) {
            alert("⚠️ Worker ID not found in database.");
            return;
        }

        const statsContainer = document.getElementById('user-stats-container');
        if(statsContainer) {
            statsContainer.style.display = 'block';
            const cols = userRow.split(',');
            document.getElementById('display-name').innerText = workerId;
            document.getElementById('total-tasks').innerText = cols[1] || "0";
            document.getElementById('today-tasks').innerText = cols[2] || "0";
            document.getElementById('user-status').innerText = "Verified";
        }
    } catch (e) {
        if (btn) btn.innerText = "Check History";
    }
}

// 🛡️ 5. Launch Survey (via Secure API)
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
    const isGuest = workerId.toUpperCase() === 'GUEST' || workerId.toUpperCase() === 'TESTER';
    const finalId = isGuest ? `GUEST_${Math.floor(Math.random() * 9000 + 1000)}` : workerId;

    if(btn) {
        btn.disabled = true;
        btn.innerHTML = "Securing Session...";
    }

    try {
        const res = await fetch(`/api/generate-link?action=launch&workerId=${finalId}&ipAddress=${userIP}`);
        const data = await res.json();
        
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error("Link error");
        }
    } catch (e) {
        alert("⚠️ Security Engine Error. Please try again.");
        if(btn) {
            btn.disabled = false;
            btn.innerHTML = "Launch Task ➜";
        }
    }
}
