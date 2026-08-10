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

    const originalQrSection =
        document.getElementById('originalQrSection');

    const qrImg = document.getElementById('qr-img');
    const wifiDetails = document.getElementById('wifi-details');
    const connectBtn = document.getElementById('connectBtn');
    const copyBtn = document.getElementById('copyBtn');


    // --------------------------------
    // INITIAL STATE
    // --------------------------------

    // QR hidden when page opens
    if (originalQrSection) {
        originalQrSection.style.display = 'none';
    }


    // --------------------------------
    // FORM VALIDATION
    // --------------------------------

    function validateForm() {

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();

        if (name === '') {
            msg.textContent = 'Please enter your name.';
            return false;
        }

        if (email === '') {
            msg.textContent = 'Please enter your email.';
            return false;
        }

        if (phone === '') {
            msg.textContent = 'Please enter your phone number.';
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


        msg.textContent =
            'Saving your information...';


        const submitButton =
            form.querySelector('button[type="submit"]');


        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent =
                'PLEASE WAIT...';
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
                    'Content-Type':
                        'text/plain;charset=utf-8'
                },

                body: JSON.stringify(data)

            });


            /*
             * Save submitted status
             */

            localStorage.setItem(
                STORAGE_KEY_SUBMITTED,
                'true'
            );


            /*
             * Show success message
             */

            msg.textContent =
                '✓ Information saved successfully!';


            /*
             * Show ONLY ONE Wi-Fi QR
             */

            if (originalQrSection) {

                originalQrSection.style.display =
                    'block';

            }


            /*
             * Display Wi-Fi details
             */

            const parsed = parseWifiString(WIFI_STRING);

            if (wifiDetails) {

                wifiDetails.textContent =
                    `🔐 SSID: ${parsed.ssid || 'JAFFNA CITY HOTEL'} • Password: ${parsed.password || 'cityhotel'}`;

            }


            /*
             * Clear form
             */

            form.reset();


        } catch (error) {

            console.error(
                'Submission error:',
                error
            );

            msg.textContent =
                'Unable to save information. Please try again.';

        } finally {

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.textContent =
                    'GET WI-FI ACCESS';

            }

        }

    });


    // --------------------------------
    // CONNECT BUTTON
    // --------------------------------

    if (connectBtn) {

        connectBtn.addEventListener('click', () => {

            alert(
                'To connect:\n\n' +
                '1. Open your phone Settings\n' +
                '2. Go to Wi-Fi\n' +
                '3. Select "JAFFNA CITY HOTEL"\n' +
                '4. Enter password: cityhotel'
            );

        });

    }


    // --------------------------------
    // QR BUTTON
    // --------------------------------

    const qrBtn = document.getElementById('qrBtn');

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

                await navigator.clipboard
                    .writeText(WIFI_STRING);

                alert('Wi-Fi string copied to clipboard!');

            } catch (error) {

                alert('Could not copy. Error: ' + error.message);

            }

        });

    }

});