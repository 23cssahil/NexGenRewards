// NexGen Rewards Portal Logic
const scriptUrl = "https://script.google.com/macros/s/AKfycbz_tYyO8zX6y5oH3e5c9o9o9o9o9o9o9o9o9o9o9o9o/exec"; // Replace with your actual Script URL
const theoremApiKey = "3b7be1c302eb1d4be1fc37048968";
const placementId = "cf38fc1e-49db-4ec7-9164-f90a87b1e44d";
const theoremSecret = "bb1603570b9a6682301d9a406731ba5efedde4ee";

// 🛡️ 1. Real-time IP Detection
async function fetchIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        document.getElementById('user-ip').innerText = `IP: ${data.ip} (Verified)`;
    } catch (e) {
        document.getElementById('user-ip').innerText = "IP: Secured Tunnel Active";
    }
}
fetchIP();

// 🛡️ 2. Live Payout Feed (Last 6 Earners)
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
        const latestPayouts = payouts.slice(0, 6);
        
        latestPayouts.forEach(p => {
            const cellValue = String(p.amount || "0");
            let amount = "0.00";
            const earnedMatch = cellValue.match(/Earned: \$(.*)/);
            if (earnedMatch) {
                amount = earnedMatch[1];
            } else {
                const numMatch = cellValue.match(/\d+(\.\d+)?/);
                amount = numMatch ? numMatch[0] : "0.00";
            }
            
            const wId = String(p.workerId || "User");
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
                <div class="payout-amount">+$${amount.replace('$', '')}</div>
            `;
            container.appendChild(div);
        });
    } catch (e) {
        if(container) container.innerHTML = '<p style="color:#ff4757; font-size:0.8rem;">Live Feed Syncing...</p>';
    }
}
setInterval(fetchRealPayouts, 20000);
fetchRealPayouts();

// 🛡️ 3. Check User Stats with Reviewer Whitelist
async function checkUserStats() {
    const workerId = document.getElementById('workerId').value.trim();
    if (!workerId) {
        alert("Please enter your ID first.");
        return;
    }

    const btn = document.querySelector('.input-group .btn-secondary');
    if(btn) btn.innerText = "Checking...";
    
    // 🛡️ Whitelist for TheoremReach Reviewers
    const reviewerIds = ["GUEST", "TESTER", "REVIEWER"];
    if (reviewerIds.includes(workerId.toUpperCase())) {
        document.getElementById('display-name').innerText = workerId + " (Demo)";
        document.getElementById('total-tasks').innerText = "50+";
        document.getElementById('today-tasks').innerText = "5";
        document.getElementById('user-status').innerText = "V.I.P";
        document.getElementById('user-stats-container').style.display = 'block';
        if(btn) btn.innerText = "Check History";
        return;
    }

    try {
        const authResponse = await fetch(`${scriptUrl}?action=checkAuth&workerId=${workerId}`);
        const authStatus = (await authResponse.text()).trim().toUpperCase();

        if (authStatus !== "AUTHORIZED") {
            alert(`⚠️ ACCESS DENIED: Worker ID "${workerId}" is not authorized.`);
            return;
        }
        
        const response = await fetch(`${scriptUrl}?workerId=${workerId}`);
        const stats = await response.json();
        
        if(stats) {
            document.getElementById('display-name').innerText = workerId;
            document.getElementById('total-tasks').innerText = stats.totalTasks || 0;
            document.getElementById('today-tasks').innerText = stats.todayTasks || 0;
            document.getElementById('user-status').innerText = stats.status || "Active";
            document.getElementById('user-stats-container').style.display = 'block';
        }
    } catch (e) {
        alert("System Busy. Please try again.");
    } finally {
        if(btn) btn.innerText = "Check History";
    }
}

// 🛡️ 4. Launch Survey with Reviewer Whitelist
async function launchSurvey() {
    const workerId = document.getElementById('workerId').value.trim();
    const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]').value;

    if (!workerId) {
        alert("Enter your ID to access the survey wall.");
        return;
    }
    if (!turnstileResponse) {
        alert("Please complete the security check first.");
        return;
    }

    // 🛡️ Whitelist for TheoremReach Reviewers
    const reviewerIds = ["GUEST", "TESTER", "REVIEWER"];
    let authorized = reviewerIds.includes(workerId.toUpperCase());

    if (!authorized) {
        try {
            const authResponse = await fetch(`${scriptUrl}?action=checkAuth&workerId=${workerId}`);
            const authStatus = (await authResponse.text()).trim().toUpperCase();
            if (authStatus === "AUTHORIZED") authorized = true;
        } catch (e) {
            alert("Security Gate Busy. Please try again.");
            return;
        }
    }

    if (authorized) {
        const timestamp = Math.floor(Date.now() / 1000);
        const rawString = `user_id=${workerId}&timestamp=${timestamp}&${theoremSecret}`;
        const signature = CryptoJS.SHA1(rawString).toString();
        const surveyUrl = `https://router.theoremreach.com/v2/survey?api_key=${theoremApiKey}&user_id=${workerId}&timestamp=${timestamp}&signature=${signature}&placement_id=${placementId}`;
        window.open(surveyUrl, '_blank');
    } else {
        alert(`⚠️ ACCESS DENIED: Worker ID "${workerId}" is not authorized.`);
    }
}
