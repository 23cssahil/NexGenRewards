// 🔐 NEXGEN REWARDS - STABLE SECURE LOGIC
const theoremApiKey = "3b7be1c302eb1d4be1fc37048968";
const scriptUrl = "https://script.google.com/macros/s/AKfycbzDNay7ML_NVEkGltGceUoSLBZA3SAx0jPm83cRBHZ-AtcJvIlmdh2GsJsjXjNyxxg0/exec";

let currentUser = "";
let userIP = "Unknown";

// 🌐 Get User IP
fetch('https://api.ipify.org?format=json')
    .then(r => r.json())
    .then(d => userIP = d.ip)
    .catch(() => console.log("IP Tracking Offline"));

// 🔐 LOGIN HANDLER
function login() {
    const workerId = document.getElementById('workerId').value.trim().toUpperCase();
    const consent = document.getElementById('termsConsent').checked;
    const captcha = document.getElementById('captchaValue').value;

    if (!workerId) { alert("Please enter your ID."); return; }
    if (!consent) { alert("Please agree to terms."); return; }
    if (captcha != "9") { alert("Security Check Failed (7+2=9)"); return; }

    showLoading("Verifying ID...");

    const ALLOWED_USERS = ["SAHIL01", "AMIT03", "NEX01", "NEX02", "NEX03", "NEX04", "NEX05", "NEX06", "NEX07", "NEX08", "NEX09", "NEX10", "TEST_USER"];
    
    setTimeout(() => {
        if (ALLOWED_USERS.includes(workerId)) {
            currentUser = workerId;
            document.getElementById('login-view').style.display = 'none';
            document.getElementById('dashboard-view').style.display = 'block';
            document.getElementById('display-id').innerText = workerId;
            hideLoading();
        } else {
            hideLoading();
            alert("ID NOT AUTHORIZED");
        }
    }, 1000);
}

// 🚀 LAUNCH SURVEY
function launchSurvey() {
    const theoremSecret = "bb1603570b9a6682301d9a406731ba5efedde4ee"; 
    showLoading("Syncing Session...");

    // Log to Google Sheet
    try {
        fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ workerId: currentUser, ip: userIP, action: "Launch" })
        });
    } catch (e) {}
    
    const signatureString = currentUser + theoremSecret;
    const finalSig = CryptoJS.SHA1(signatureString).toString();
    const surveyUrl = `https://theoremreach.com/respondent_entry/direct?api_key=${theoremApiKey}&user_id=${currentUser}&sig=${finalSig}`;

    setTimeout(() => { window.location.href = surveyUrl; }, 800);
}

// 📈 CHECK STATS
function checkUserStats() {
    document.getElementById('history-panel').style.display = 'block';
    document.getElementById('history-text').innerText = "Fetching Earnings...";
    
    fetch(`${scriptUrl}?user_id=${currentUser}&action=getStats`)
        .then(r => r.json())
        .then(data => {
            if (data.status === "success") {
                document.getElementById('pending-amt').innerText = `$${data.earnings || '0.00'}`;
                document.getElementById('tasks-count').innerText = data.tasks || '0';
                document.getElementById('history-text').innerText = "History Synced.";
            }
        })
        .catch(() => { document.getElementById('history-text').innerText = "Error loading stats."; });
}

function showLoading(text) {
    document.getElementById('loading-overlay').style.display = 'flex';
    document.getElementById('loading-text').innerText = text;
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}
