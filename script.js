const ENDPOINT =
    'https://script.google.com/macros/s/AKfycbwo2q_RuU1Dm-HiV3baPJgTVBkB4CTN8meOwVmAL84t2Ktd3ACz0rBDj0oLim0hY1Xh/exec';

const WIFI_STRING =
    'WIFI:T:WPA;P:cityhotel;S:JAFFNA CITY HOTEL;H:false;';

const STORAGE_KEY_SUBMITTED = 'wifiGuestSubmitted';


function parseWifiString(text) {

    const result = { raw: text };

    if (!text || !text.startsWith('WIFI:')) {
        return result;
    }

    const inner = text.substring(5);
    const parts = inner.split(';');

    parts.forEach(part => {

        if (!part) return;

        const [key, ...rest] = part.split(':');
        const value = rest.join(':');

        if (key === 'S') result.ssid = value;
        if (key === 'P') result.password = value;
        if (key === 'T') result.type = value;

    });

    return result;
}


document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('wifiForm');
    const msg = document.getElementById('message');

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    const registrationDiv = document.getElementById('registration');
    const successDiv = document.getElementById('success');
    const wifiDetails = document.getElementById('wifiDetails');
    const qrImg = document.getElementById('qr-img');
    const qrBtn = document.getElementById('qrBtn');
    const copyBtn = document.getElementById('copyBtn');


    // --------------------------------
    // FORM VALIDATION
    // --------------------------------

    function validateForm() {

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();

        if (name === '') {
            msg.textContent = 'Please enter your name.';
            msg.style.display = 'block';
            msg.style.color = '#d32f2f';
            return false;
        }

        if (email === '') {
            msg.textContent = 'Please enter your email.';
            msg.style.display = 'block';
            msg.style.color = '#d32f2f';
            return false;
        }

        if (phone === '') {
            msg.textContent = 'Please enter your phone number.';
            msg.style.display = 'block';
            msg.style.color = '#d32f2f';
            return false;
        }

        return true;
    }


    // --------------------------------
    // FORM SUBMIT
    // --------------------------------

    form.addEventListener('submit', async (event) => {

        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        msg.textContent = 'Saving your information...';
        msg.style.display = 'block';
        msg.style.color = '#1565c0';

        const submitButton = form.querySelector('button[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'PLEASE WAIT...';
        }

        const data = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim()
        };

        try {

            /*
             * Send information to Google Apps Script
             */

            await fetch(ENDPOINT, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(data)
            });

            /*
             * Save submitted status
             */

            localStorage.setItem(STORAGE_KEY_SUBMITTED, 'true');

            /*
             * Show success message
             */

            msg.textContent = '✓ Information saved successfully!';
            msg.style.color = '#16a34a';

            /*
             * Display Wi-Fi details
             */

            const parsed = parseWifiString(WIFI_STRING);

            if (wifiDetails) {
                wifiDetails.innerHTML =
                    `🔐 Wi-Fi: ${parsed.ssid || 'JAFFNA CITY HOTEL'}<br>• Password: ${parsed.password || 'cityhotel'}`;
            }

            /*
             * Clear form
             */

            form.reset();

            /*
             * Switch to success page
             */

            setTimeout(() => {
                registrationDiv.style.display = 'none';
                successDiv.style.display = 'block';
            }, 500);

        } catch (error) {

            console.error('Submission error:', error);

            msg.textContent = 'Unable to save information. Please try again.';
            msg.style.color = '#d32f2f';

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'CONNECT TO WI-FI';
            }

        }

    });


    // --------------------------------
    // QR BUTTON
    // --------------------------------

    if (qrBtn) {

        qrBtn.addEventListener('click', () => {

            alert(
                'Connecting via QR Code:\n\n' +
                '1. Open your device camera\n' +
                '2. Point at the QR code above\n' +
                '3. Tap the notification that appears\n' +
                '4. Confirm WiFi connection'
            );

        });

    }


    // --------------------------------
    // COPY QR BUTTON
    // --------------------------------

    if (copyBtn) {

        copyBtn.addEventListener('click', async () => {

            try {

                await navigator.clipboard.writeText(WIFI_STRING);

                alert('Wi-Fi string copied to clipboard!');

            } catch (error) {

                alert('Could not copy. Error: ' + error.message);

            }

        });

    }

});