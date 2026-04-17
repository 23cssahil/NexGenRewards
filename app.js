// 🔐 NEXGEN REWARDS - SECURE APP LOGIC
const theoremApiKey = "3b7be1c302eb1d4be1fc37048968";
const placementId = "cf38fc1e-49db-4ec7-9164-f90a87b1e44d";
const scriptUrl = "https://script.google.com/macros/s/AKfycbzDNay7ML_NVEkGltGceUoSLBZA3SAx0jPm83cRBHZ-AtcJvIlmdh2GsJsjXjNyxxg0/exec";

let currentUser = "";
let userIP = "Unknown";

// 🌐 Get User IP for Security Logs & Display
fetch('https://api.ipify.org?format=json')
    .then(r => r.json())
    .then(d => {
        userIP = d.ip;
        if(document.getElementById('user-ip-display')) {
            document.getElementById('user-ip-display').innerText = d.ip;
        }
    })
    .catch(() => console.log("IP Tracking Offline"));

// 🛡️ SECURITY GATE VERIFICATION
function verifyHuman() {
    const spinner = document.getElementById('check-spinner');
    if (spinner.classList.contains('verified')) return;

    spinner.classList.add('loading');
    
    // Simulate high-security browser check
    setTimeout(() => {
        spinner.classList.remove('loading');
        spinner.classList.add('verified');
        
        // Show success and unlock content
        setTimeout(() => {
            document.getElementById('security-gate').style.opacity = '0';
            document.getElementById('security-gate').style.transition = '0.5s';
            
            setTimeout(() => {
                document.getElementById('security-gate').style.display = 'none';
                document.getElementById('main-content').style.display = 'block';
            }, 500);
        }, 800);
    }, 1500);
}

// 🔐 LOGIN HANDLER
function login() {
    const workerId = document.getElementById('workerId').value.trim().toUpperCase();
    const consent = document.getElementById('termsConsent').checked;
    const captcha = document.getElementById('captchaValue').value;

    if (!workerId) {
        alert("Please enter your Authorized ID.");
        return;
    }

    if (!consent) {
        alert("Please agree to the Terms and Privacy Policy to continue.");
        return;
    }

    if (captcha != "9") {
        alert("Security Check Failed! Please solve 7 + 2 correctly.");
        return;
    }

    showLoading("Authenticating...");

    // 🕵️ Verify if user is in the allowed list
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
            alert("ACCESS DENIED: Unauthorized ID. Please contact Admin.");
        }
    }, 1200);
}

// 🚀 THEOREMREACH OFFICIAL WEB DIRECT ENTRY PROTOCOL
function launchSurvey() {
    const theoremSecret = "bb1603570b9a6682301d9a406731ba5efedde4ee"; 

    showLoading("Syncing Secure Session...");

    // 🛡️ FRONTEND LOGGING
    try {
        fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                workerId: currentUser,
                ipAddress: userIP,
                timestamp: new Date().toISOString(),
                action: "Survey Launched (Compliance Check)"
            })
        });
    } catch (e) {}
    
    // 🛡️ WEB DIRECT ENTRY URL
    const baseUrl = `https://theoremreach.com/respondent_entry/direct?api_key=${theoremApiKey}&user_id=${currentUser}`;

    // 2. OFFICIAL HASH FORMULA: SHA1(user_id + secret_key)
    const signatureString = currentUser + theoremSecret;
    const finalSig = CryptoJS.SHA1(signatureString).toString();

    // 3. Final Signed URL (sig parameter is KEY)
    const surveyUrl = `${baseUrl}&sig=${finalSig}`;

    setTimeout(() => {
        window.location.href = surveyUrl;
    }, 1000);
}

// 📉 FETCH STATS (From Google Apps Script)
function checkUserStats() {
    document.getElementById('history-panel').style.display = 'block';
    document.getElementById('history-text').innerText = "Connecting to Secure Ledger...";
    
    fetch(`${scriptUrl}?user_id=${currentUser}&action=getStats`)
        .then(r => r.json())
        .then(data => {
            if (data.status === "success") {
                document.getElementById('pending-amt').innerText = `$${data.earnings || '0.00'}`;
                document.getElementById('tasks-count').innerText = data.tasks || '0';
                document.getElementById('history-text').innerText = "Ledger Updated Successfully.";
            } else {
                document.getElementById('history-text').innerText = "No recent activity found.";
            }
        })
        .catch(() => {
            document.getElementById('history-text').innerText = "History temporarily unavailable.";
        });
}

// ⏳ UI HELPERS
function showLoading(text) {
    document.getElementById('loading-overlay').style.display = 'flex';
    document.getElementById('loading-text').innerText = text;
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}
