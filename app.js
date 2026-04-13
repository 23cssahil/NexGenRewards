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

// 3. Dynamic Payouts Animation
const names = ["Amit", "Rahul", "Neha", "Sahil", "Priya", "Vikram", "Sonia", "Deepak", "Rohan", "Anjali"];
const amounts = ["$0.50", "$1.20", "$0.85", "$2.10", "$1.50", "$0.75", "$3.00"];

function addRandomPayout() {
    const list = document.getElementById('payout-list-container');
    const name = names[Math.floor(Math.random() * names.length)];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    
    const item = document.createElement('div');
    item.className = 'payout-item';
    item.innerHTML = `<span>User ${name}***</span> just earned <b>${amount}</b>`;
    
    list.prepend(item);
    if(list.children.length > 5) list.removeChild(list.lastChild);
}

setInterval(addRandomPayout, 4000);
addRandomPayout(); // Initial

const scriptUrl = "https://script.google.com/macros/s/AKfycby5XJMPvdaqUUEU_PNSnHdn5coR6Nt-_Tb3seV56BY2MYtU8n8_DjuapbU2bS4vLg/exec";

// 4. Check User Stats from Google Sheet
async function checkUserStats() {
    const workerId = document.getElementById('workerId').value.trim();
    if (!workerId) {
        alert("Please enter your ID first.");
        return;
    }

    const btn = document.querySelector('.btn-secondary');
    btn.innerText = "Checking...";
    
    try {
        const response = await fetch(`${scriptUrl}?workerId=${workerId}`);
        const stats = await response.json();
        
        document.getElementById('display-name').innerText = workerId;
        document.getElementById('total-tasks').innerText = stats.totalTasks;
        document.getElementById('today-tasks').innerText = stats.todayTasks;
        document.getElementById('user-status').innerText = stats.status;
        
        document.getElementById('user-stats-container').style.display = 'block';
    } catch (e) {
        alert("Could not fetch stats. Make sure you have done at least 1 task.");
    } finally {
        btn.innerText = "Check Stats";
    }
}

// 5. Launch Survey Logic with Sheet Logging
async function launchSurvey() {
    const workerId = document.getElementById('workerId').value.trim();
    
    if (!workerId || workerId.length < 3) {
        alert("Enter a valid Worker ID (at least 3 characters).");
        return;
    }

    const btn = document.querySelector('.btn-go');
    btn.innerHTML = "Logging Task...";
    btn.disabled = true;

    const logData = {
        workerId: workerId,
        ipAddress: userIP,
        timestamp: new Date().toISOString(),
        action: "Survey Started"
    };

    try {
        fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
        });
    } catch (e) { console.log("Logging failed"); }

    const appId = "22501"; 
    const surveyUrl = `https://offers.cpx-research.com/index.php?app_id=${appId}&ext_user_id=${workerId}`;

    setTimeout(() => {
        window.location.href = surveyUrl;
    }, 1200);
}

function scrollToSurvey() {
    document.getElementById('survey-portal').scrollIntoView({ behavior: 'smooth' });
}
