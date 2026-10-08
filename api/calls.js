module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { to, message } = req.body || {};

        if (!to || !message) {
            return res.status(400).json({
                error: "Phone number and message are required"
            });
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromNumber) {
            return res.status(500).json({
                error: "Twilio environment variables are missing"
            });
        }

        // Escape XML characters in the spoken message
        const safeMessage = message
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");

        const twiml =
            `<Response><Say>${safeMessage}</Say></Response>`;

        const credentials = Buffer
            .from(`${accountSid}:${authToken}`)
            .toString("base64");

        const form = new URLSearchParams();

        form.append("To", to);
        form.append("From", fromNumber);
        form.append("Twiml", twiml);

        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${credentials}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: form.toString()
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.message || "Twilio call request failed"
            });
        }

        return res.status(200).json({
            success: true,
            sid: data.sid
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message || "Server error"
        });
    }
};
