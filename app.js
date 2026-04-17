// 🔐 NEXGEN REWARDS - PREMIUM STABLE LOGIC (1-HOUR AGO VERSION)
const theoremApiKey = "3b7be1c302eb1d4be1fc37048968";
const scriptUrl = "https://script.google.com/macros/s/AKfycbzDNay7ML_NVEkGltGceUoSLBZA3SAx0jPm83cRBHZ-AtcJvIlmdh2GsJsjXjNyxxg0/exec";

let currentUser = "";
let userIP = "Unknown";

// 🌐 Get User IP for Logs
fetch('https://api.ipify.org?format=json')
    .then(r => r.json())
    .then(d => userIP = d.ip)
    .catch(() => console.log("IP Tracking Offline"));

// 🔐 LOGIN HANDLER
function login() {
    const workerId = document.getElementById('workerId').value.trim().toUpperCase();

    if (!workerId) {
        alert("Please enter your Authorized ID.");
        return;
    }

    showLoading("Verifying Session...");

    // 🕵️ Authorized ID List
    const ALLOWED_USERS = ["SAHIL01", "AMIT03", "NEX01", "NEX02", "NEX03", "NEX04", "NEX05", "NEX06", "NEX07", "NEX08", "NEX09", "NEX10", "TEST_USER"];
    
    setTimeout(() => {
        if (ALLOWED_USERS.includes(workerId)) {
            currentUser = workerId;
            document.getElementById('login-view').style.display = 'none';
            document.getElementById('dashboard-view').style.display = 'block';
            document.getElementById('display-id').innerText = workerId;
            hideLoading();
            // Auto check stats on login
            checkUserStats();
        } else {
            hideLoading();
            alert("ACCESS DENIED: Unauthorized ID.");
        }
    }, 1000);
}

// 🚀 THEOREMREACH SIGNED LAUNCH
function launchSurvey() {
    const theoremSecret = "bb1603570b9a6682301d9a406731ba5efedde4ee"; 
    showLoading("Syncing Secure Session...");

    // Log Launch to Sheet
    try {
        fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                workerId: currentUser,
                ipAddress: userIP,
                action: "Survey Launched (Web Direct Protocol)"
            })
        });
    } catch (e) {}
    
    // 🛡️ SHA1 SIGNATURE LOGIC
    const signatureString = currentUser + theoremSecret;
    const finalSig = CryptoJS.SHA1(signatureString).toString();
    const surveyUrl = `https://theoremreach.com/respondent_entry/direct?api_key=${theoremApiKey}&user_id=${currentUser}&sig=${finalSig}`;

    setTimeout(() => {
        window.location.href = surveyUrl;
    }, 1000);
}

// 📈 FETCH EARNINGS
function checkUserStats() {
    document.getElementById('history-panel').style.display = 'block';
    document.getElementById('history-text').innerText = "Syncing with Google Ledger...";
    
    fetch(`${scriptUrl}?user_id=${currentUser}&action=getStats`)
        .then(r => r.json())
        .then(data => {
            if (data.status === "success") {
                document.getElementById('pending-amt').innerText = `$${data.earnings || '0.00'}`;
                document.getElementById('tasks-count').innerText = data.tasks || '0';
                document.getElementById('history-text').innerText = "Data Synced Successfully.";
            } else {
                document.getElementById('history-text').innerText = "No history found for this ID.";
            }
        })
        .catch(() => {
            document.getElementById('history-text').innerText = "History temporarily unavailable.";
        });
}

function showLoading(text) {
    document.getElementById('loading-overlay').style.display = 'flex';
    document.getElementById('loading-text').innerText = text;
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}
