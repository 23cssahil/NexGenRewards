// 🔗 Global Configuration
const scriptUrl = "https://script.google.com/macros/s/AKfycbzDNay7ML_NVEkGltGceUoSLBZA3SAx0jPm83cRBHZ-AtcJvIlmdh2GsJsjXjNyxxg0/exec";
const theoremApiKey = "3b7be1c302eb1d4be1fc37048968"; 
const placementId = "cf38fc1e-49db-4ec7-9164-f90a87b1e44d";

let userIP = "Detecting Security...";

// 🛡️ 1. Professional IP Detection
async function fetchIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        userIP = data.ip;
        const ipDisplay = document.getElementById('user-ip');
        if(ipDisplay) ipDisplay.innerText = `IP: ${userIP} (SECURED)`;
    } catch (e) {
        if(document.getElementById('user-ip')) 
            document.getElementById('user-ip').innerText = "IP: SECURE CONNECTION";
    }
}

// 🛡️ 2. Cursor Glow Effect
const glow = document.querySelector('.cursor-glow');
if(glow) {
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchRealPayouts();
    fetchIP();
});

// 🛡️ 3. Real-Time Payouts Logic (Fetching from Google Sheets)
async function fetchRealPayouts() {
    const container = document.getElementById('payout-list-container');
    if (!container) return;

    try {
        const response = await fetch(`${scriptUrl}?action=getLivePayouts`);
        const payouts = await response.json();
        
        if (!Array.isArray(payouts) || payouts.length === 0) {
            container.innerHTML = '<p style="opacity:0.5; font-size:0.8rem; padding: 20px;">Waiting for new completions...</p>';
            return;
        }

        container.innerHTML = '';
        payouts.forEach(p => {
            // 🛡️ Data Safety: Convert to String to avoid crashes
            const wId = String(p.workerId || "User");
            const amt = String(p.amount || "0.00");
            const timeStr = p.time ? "Recently" : "Just now"; // ISO dates are messy, simplified for UI
            
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

// 🛡️ 4. Check User Stats from Google Sheet
async function checkUserStats() {
    const workerId = document.getElementById('workerId').value.trim();
    if (!workerId) {
        alert("Please enter your ID first.");
        return;
    }

    const btn = document.querySelector('.btn-secondary');
    btn.innerText = "Checking...";
    
    try {
        const authResponse = await fetch(`${scriptUrl}?action=checkAuth&workerId=${workerId}`);
        const authStatus = await authResponse.text();

        if (authStatus !== "AUTHORIZED") {
            alert("⚠️ UNAUTHORIZED ID: Access Denied.");
            btn.innerText = "Check History";
            return;
        }
        
        const response = await fetch(`${scriptUrl}?workerId=${workerId}`);
        const stats = await response.json();
        
        document.getElementById('display-name').innerText = workerId;
        document.getElementById('total-tasks').innerText = stats.totalTasks;
        document.getElementById('today-tasks').innerText = stats.todayTasks;
        document.getElementById('user-status').innerText = stats.status;
        document.getElementById('user-stats-container').style.display = 'block';
        
        setTimeout(() => {
            document.getElementById('user-stats-container').style.display = 'none';
        }, 10000);

    } catch (e) {
        alert("Could not fetch stats.");
    } finally {
        btn.innerText = "Check History";
    }
}

// 🛡️ 5. Launch Survey Logic
async function launchSurvey() {
    const workerId = document.getElementById('workerId').value.trim();
    const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]').value;

    if (!workerId || workerId.length < 3) {
        alert("Enter a valid Worker ID.");
        return;
    }

    if (!turnstileResponse) {
        alert("🤖 SECURITY CHECK: Please verify you are not a robot (Cloudflare Check).");
        return;
    }

    const btn = document.querySelector('.btn-go');
    btn.disabled = true;
    btn.innerHTML = "Authenticating ID...";

    try {
        const authResponse = await fetch(`${scriptUrl}?action=checkAuth&workerId=${workerId}`);
        const authStatus = await authResponse.text();

        if (authStatus !== "AUTHORIZED") {
            alert("⚠️ UNAUTHORIZED ID: Access Denied.");
            btn.disabled = false;
            btn.innerHTML = "Launch Survey";
            return;
        }
    } catch (e) {
        alert("Security Server Offline.");
        btn.disabled = false;
        btn.innerHTML = "Launch Survey";
        return;
    }
    
    const logs = ["Connecting to Global Servers...", "Fetching New Surveys...", "Verifying ID...", "Securing Session..."];
    let i = 0;
    const interval = setInterval(() => {
        btn.innerHTML = logs[i];
        i++;
        if(i >= logs.length) {
            clearInterval(interval);
            proceedToSurvey(workerId);
        }
    }, 800);
}

// 🚀 THEOREMREACH OFFICIAL WEB DIRECT ENTRY PROTOCOL
function proceedToSurvey(workerId) {
    const theoremSecret = "bb1603570b9a6682301d9a406731ba5efedde4ee"; 
    
    try {
        fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                workerId: workerId,
                ipAddress: userIP,
                timestamp: new Date().toISOString(),
                action: "Survey Launched (Web Direct Protocol)"
            })
        });
    } catch (e) {}
    
    const baseUrl = `https://theoremreach.com/respondent_entry/direct?api_key=${theoremApiKey}&user_id=${workerId}`;
    const signatureString = workerId + theoremSecret;
    const finalSig = CryptoJS.SHA1(signatureString).toString();
    const surveyUrl = `${baseUrl}&sig=${finalSig}`;

    window.location.href = surveyUrl;
}

function scrollToSurvey() {
    const el = document.getElementById('survey-portal');
    if(el) el.scrollIntoView({ behavior: 'smooth' });
}

// --- 🛡️ NEXGEN CORE SYSTEM STABLE ---
