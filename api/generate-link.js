const crypto = require('crypto');

export default async function handler(req, res) {
    const { workerId, ipAddress, action } = req.query;

    // 🛡️ Get Keys from Vercel (Ensure you added these in Dashboard!)
    const theoremApiKey = process.env.THEOREM_API_KEY;
    const theoremSecret = process.env.THEOREM_SECRET;
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

    // --- 1. Check Survey Availability ---
    if (action === 'checkAvailability') {
        try {
            const response = await fetch(`https://api.theoremreach.com/api/publishers/v1/user_details?api_key=${theoremApiKey}&user_id=${workerId}&ip=${ipAddress}`);
            const data = await response.json();
            return res.status(200).json(data);
        } catch (e) {
            return res.status(500).json({ error: 'Availability check failed' });
        }
    }

    // --- 2. Fetch User Stats (History) ---
    if (action === 'checkStats') {
        try {
            // First check authorization
            const authRes = await fetch(`${scriptUrl}?action=checkAuth&workerId=${workerId}`);
            const authStatus = (await authRes.text()).trim().toUpperCase();

            if (authStatus !== "AUTHORIZED") {
                return res.status(403).json({ error: 'UNAUTHORIZED' });
            }

            // Fetch actual stats
            const statsRes = await fetch(`${scriptUrl}?workerId=${workerId}`);
            const statsData = await statsRes.json();
            return res.status(200).json(statsData);
        } catch (e) {
            return res.status(500).json({ error: 'Stats fetch failed' });
        }
    }

    // --- 3. Fetch Live Payouts ---
    if (action === 'getPayouts') {
        try {
            const resPayouts = await fetch(`${scriptUrl}?action=getLivePayouts`);
            const data = await resPayouts.json();
            return res.status(200).json(data);
        } catch (e) {
            return res.status(500).json({ error: 'Payouts fetch failed' });
        }
    }

    // --- 4. Launch Survey ---
    if (action === 'launch') {
        try {
            // Log Launch to Google Sheets
            const logId = workerId.startsWith("GUEST_") ? "GUEST" : workerId;
            const logAction = workerId.startsWith("GUEST_") ? `Test Launch: ${workerId}` : "Survey Launched (Secure API)";
            
            fetch(scriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workerId: logId,
                    ipAddress: ipAddress,
                    timestamp: new Date().toISOString(),
                    action: logAction
                })
            }).catch(e => {});

            // Generate TheoremReach Link with Signature
            const baseUrl = `https://theoremreach.com/respondent_entry/direct?api_key=${theoremApiKey}&user_id=${workerId}`;
            const signatureString = workerId + theoremSecret;
            const finalSig = crypto.createHash('sha1').update(signatureString).digest('hex');
            
            return res.status(200).json({ url: `${baseUrl}&sig=${finalSig}` });
        } catch (error) {
            return res.status(500).json({ error: 'Launch failed' });
        }
    }

    res.status(400).json({ error: 'Invalid action' });
}
