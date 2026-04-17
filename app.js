const theoremApiKey = "3b7be1c302eb1d4be1fc37048968";
const scriptUrl = "https://script.google.com/macros/s/AKfycbzDNay7ML_NVEkGltGceUoSLBZA3SAx0jPm83cRBHZ-AtcJvIlmdh2GsJsjXjNyxxg0/exec";

let currentUser = "";
let userIP = "Unknown";

fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => userIP = d.ip);

function login() {
    const workerId = document.getElementById('workerId').value.trim().toUpperCase();
    if (!workerId) { alert("Enter ID"); return; }

    showLoading();
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
    }, 500);
}

function launchSurvey() {
    const theoremSecret = "bb1603570b9a6682301d9a406731ba5efedde4ee"; 
    showLoading();

    const signatureString = currentUser + theoremSecret;
    const finalSig = CryptoJS.SHA1(signatureString).toString();
    const surveyUrl = `https://theoremreach.com/respondent_entry/direct?api_key=${theoremApiKey}&user_id=${currentUser}&sig=${finalSig}`;

    window.location.href = surveyUrl;
}

function checkUserStats() {
    fetch(`${scriptUrl}?user_id=${currentUser}&action=getStats`)
        .then(r => r.json())
        .then(data => {
            if (data.status === "success") {
                document.getElementById('pending-amt').innerText = `$${data.earnings || '0.00'}`;
                document.getElementById('tasks-count').innerText = data.tasks || '0';
            }
        });
}

function showLoading() { document.getElementById('loading-overlay').style.display = 'flex'; }
function hideLoading() { document.getElementById('loading-overlay').style.display = 'none'; }
