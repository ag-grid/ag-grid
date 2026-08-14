export function initCaptcha() {
    function timestamp() {
        const response = document.getElementById('g-recaptcha-response') as HTMLInputElement;
        if (response == null || response.value.trim() == '') {
            const captchaSettings = document.getElementsByName('captcha_settings')[0] as HTMLInputElement;
            const elems = JSON.parse(captchaSettings.value);
            elems['ts'] = JSON.stringify(new Date().getTime());
            captchaSettings.value = JSON.stringify(elems);
        }
    }
    setInterval(timestamp, 500);
}
