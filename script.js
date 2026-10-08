let stopped = false;

let smsSent = 0;
let callsStarted = 0;
let failed = 0;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function addLog(message) {
    const logs = document.getElementById("logs");

    const entry = document.createElement("div");
    entry.className = "log-entry";

    const time = new Date().toLocaleTimeString();

    entry.textContent = `[${time}] ${message}`;

    logs.appendChild(entry);
    logs.scrollTop = logs.scrollHeight;
}

function updateStats() {
    document.getElementById("smsSent").textContent = smsSent;
    document.getElementById("callsStarted").textContent = callsStarted;
    document.getElementById("failed").textContent = failed;
}

function setStatus(message) {
    document.getElementById("status").textContent = message;
}


// =========================
// SMS
// =========================

async function startSMS() {

    stopped = false;

    const number = document.getElementById("smsNumber").value.trim();
    const message = document.getElementById("smsMessage").value.trim();
    const count = Number(document.getElementById("smsCount").value);

    if (!number) {
        setStatus("Enter a phone number.");
        addLog("SMS stopped: phone number missing.");
        return;
    }

    if (!message) {
        setStatus("Enter an SMS message.");
        addLog("SMS stopped: message missing.");
        return;
    }

    if (!Number.isInteger(count) || count < 1 || count > 10) {
        setStatus("SMS count must be between 1 and 10.");
        addLog("SMS stopped: invalid count.");
        return;
    }

    setStatus("Sending SMS...");
    addLog(`Starting authorized SMS test: ${count} message(s).`);

    for (let i = 1; i <= count; i++) {

        if (stopped) {
            setStatus("SMS stopped.");
            addLog("SMS test stopped by user.");
            return;
        }

        try {

            const response = await fetch("/api/sms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    to: number,
                    message: message
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "SMS request failed.");
            }

            smsSent++;
            updateStats();

            addLog(`SMS ${i}/${count} sent successfully.`);

        } catch (error) {

            failed++;
            updateStats();

            addLog(`SMS ${i}/${count} failed: ${error.message}`);
        }

        if (i < count) {
            await sleep(1000);
        }
    }

    if (!stopped) {
        setStatus("SMS test completed.");
        addLog("SMS test completed.");
    }
}


// =========================
// VOICE CALL
// =========================

async function startCall() {

    stopped = false;

    const number = document.getElementById("callNumber").value.trim();
    const message = document.getElementById("callMessage").value.trim();
    const count = Number(document.getElementById("callCount").value);

    if (!number) {
        setStatus("Enter a phone number.");
        addLog("Call stopped: phone number missing.");
        return;
    }

    if (!message) {
        setStatus("Enter a call message.");
        addLog("Call stopped: message missing.");
        return;
    }

    if (!Number.isInteger(count) || count < 1 || count > 3) {
        setStatus("Call count must be between 1 and 3.");
        addLog("Call stopped: invalid count.");
        return;
    }

    setStatus("Starting voice calls...");
    addLog(`Starting authorized voice test: ${count} call(s).`);

    for (let i = 1; i <= count; i++) {

        if (stopped) {
            setStatus("Calls stopped.");
            addLog("Voice test stopped by user.");
            return;
        }

        try {

            const response = await fetch("/api/call", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    to: number,
                    message: message
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Call request failed.");
            }

            callsStarted++;
            updateStats();

            addLog(`Call ${i}/${count} started successfully.`);

        } catch (error) {

            failed++;
            updateStats();

            addLog(`Call ${i}/${count} failed: ${error.message}`);
        }

        if (i < count) {
            await sleep(1000);
        }
    }

    if (!stopped) {
        setStatus("Voice test completed.");
        addLog("Voice test completed.");
    }
}


// =========================
// STOP
// =========================

function stopAll() {

    stopped = true;

    setStatus("Stopping...");
    addLog("Stop requested.");

}