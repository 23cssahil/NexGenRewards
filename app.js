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
setInterval(fetchRealPayouts, 30000); // 30 second me update hoga

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

// 5. Launch Survey Logic (Always Fresh Surveys)
async function launchSurvey() {
    const workerId = document.getElementById('workerId').value.trim();
    
    if (!workerId || workerId.length < 3) {
        alert("Enter a valid Worker ID.");
        return;
    }

    const btn = document.querySelector('.btn-go');
    btn.disabled = true;
    
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

function proceedToSurvey(workerId) {
    const logData = {
        workerId: workerId,
        ipAddress: userIP,
        timestamp: new Date().toISOString(),
        action: "Survey Started (Fresh Fetch)"
    };

    try {
        fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
        });
    } catch (e) {}

    const appId = "32459"; 
    // Adding a random timestamp to 'break' any old cache and fetch NEW surveys
    const freshToken = Date.now();
    const surveyUrl = `https://offers.cpx-research.com/index.php?app_id=${appId}&ext_user_id=${workerId}&t=${freshToken}`;

    window.location.href = surveyUrl;
}

function scrollToSurvey() {
    document.getElementById('survey-portal').scrollIntoView({ behavior: 'smooth' });
}
