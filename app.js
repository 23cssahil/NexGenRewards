// 🔗 Global Configuration
const scriptUrl = "https://script.google.com/macros/s/AKfycbzDNay7ML_NVEkGltGceUoSLBZA3SAx0jPm83cRBHZ-AtcJvIlmdh2GsJsjXjNyxxg0/exec";
const theoremApiKey = "3b7be1c302eb1d4be1fc37048968"; 
const placementId = "cf38fc1e-49db-4ec7-9164-f90a87b1e44d";

let userIP = "Detecting...";

// 1. Fetch User IP for Security
fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        userIP = data.ip;
        document.getElementById('user-ip').innerText = `Your Secure IP: ${userIP}`;
    })
    .catch(() => {
        document.getElementById('user-ip').innerText = "Security Check Failed. Refresh Page.";
    });

// 2. Cursor Glow Effect
const glow = document.querySelector('.cursor-glow');
document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

// 3. Real-Time Payouts Logic (Fetching from Google Sheets)
async function fetchRealPayouts() {
    const container = document.getElementById('payout-list-container');
    try {
        const response = await fetch(`${scriptUrl}?action=getLivePayouts`);
        const payouts = await response.json();
        
        if (payouts.length === 0) {
            container.innerHTML = '<p style="opacity:0.5; font-size:0.8rem;">Waiting for new completions...</p>';
            return;
        }

        container.innerHTML = '';
        payouts.forEach(p => {
            const div = document.createElement('div');
            div.className = 'payout-item';
            div.innerHTML = `
                <span><strong>${p.workerId.substring(0,3)}***</strong> just earned <strong>${p.amount}</strong></span>
                <span style="font-size: 0.7rem; color: var(--accent);">${p.time}</span>
            `;
            container.appendChild(div);
        });
    } catch (e) {
        console.log("Stats update failed");
    }
}

// Initial fetch and set interval
fetchRealPayouts();
setInterval(fetchRealPayouts, 30000); // 🔗 Sync with Google Sheets

// 4. Check User Stats from Google Sheet
async function checkUserStats() {
    const workerId = document.getElementById('workerId').value.trim();
    if (!workerId) {
        alert("Please enter your ID first.");
        return;
    }

    const btn = document.querySelector('.btn-secondary');
    btn.innerText = "Checking...";
    
    // 🛡️ SECURITY SHIELD: Check auth
    try {
        const authResponse = await fetch(`${scriptUrl}?action=checkAuth&workerId=${workerId}`);
        const authStatus = await authResponse.text();

        if (authStatus !== "AUTHORIZED") {
            alert("⚠️ UNAUTHORIZED ID: Access Denied.");
            btn.innerText = "Check History";
            return;
        }
    } catch (e) {
        alert("Security Server Offline.");
        btn.innerText = "Check History";
        return;
    }

    try {
        const response = await fetch(`${scriptUrl}?workerId=${workerId}`);
        const stats = await response.json();
        
        document.getElementById('display-name').innerText = workerId;
        document.getElementById('total-tasks').innerText = stats.totalTasks;
        document.getElementById('today-tasks').innerText = stats.todayTasks;
        document.getElementById('user-status').innerText = stats.status;
        
        document.getElementById('user-stats-container').style.display = 'block';
        
        // 🕒 AUTO-HIDE
        setTimeout(() => {
            document.getElementById('user-stats-container').style.display = 'none';
        }, 10000);

    } catch (e) {
        alert("Could not fetch stats. Make sure you have done at least 1 task.");
    } finally {
        btn.innerText = "Check History";
    }
}

// 5. Launch Survey Logic (Always Fresh Surveys)
async function launchSurvey() {
    const workerId = document.getElementById('workerId').value.trim();
    
    if (!workerId || workerId.length < 3) {
        alert("Enter a valid Worker ID.");
        return;
    }

    const btn = document.querySelector('.btn-go');
    btn.disabled = true;
    btn.innerHTML = "Authenticating ID...";

    // 🛡️ SECURITY SHIELD
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
    
    // Visual Security Check
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

// 🚀 THEOREMREACH UNIVERSAL LINK (SECURE SIGNED)
function proceedToSurvey(workerId) {
    const theoremSecret = "4e37d06a6b4a2cd0a525433ef159e9845c47e401"; // 🔑 The Master Key
    
    // 1. Base URL (Ultra Simple for Web)
    const baseUrl = `https://theoremreach.com/campaigns?api_key=${theoremApiKey}&user_id=${workerId}`;

    // 2. Generate HMAC-SHA1 Hash
    const hashData = CryptoJS.HmacSHA1(baseUrl, theoremSecret);
    let base64Hash = CryptoJS.enc.Base64.stringify(hashData);
    
    // 3. TheoremReach URL-Safe replacements
    const finalHash = base64Hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    // 4. Final Signed URL
    const surveyUrl = `${baseUrl}&hash=${finalHash}`;

    console.log("Launching Signed URL:", surveyUrl); // 🛠️ Debugging Link
    window.location.href = surveyUrl;
}

function scrollToSurvey() {
    document.getElementById('survey-portal').scrollIntoView({ behavior: 'smooth' });
}

// --- NEW FEATURES LOGIC ---

// Modal Logic
const modal = document.getElementById("rules-modal");
const rulesBtn = document.getElementById("rules-btn");
const liveBtn = document.getElementById("live-btn");
const closeX = document.querySelector(".close-modal");
const closeBtn = document.getElementById("close-rules");

if (rulesBtn) rulesBtn.onclick = () => modal.style.display = "block";
if (closeX) closeX.onclick = () => modal.style.display = "none";
if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; };

// Live Button Scroll
if (liveBtn) {
    liveBtn.onclick = () => {
        document.querySelector('.payouts').scrollIntoView({ behavior: 'smooth' });
    };
}
