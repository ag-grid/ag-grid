export function initCaptcha() {
    function timestamp() {
        const response = document.getElementById('g-recaptcha-response');
        if (response == null || response.value.trim() == '') {
            const elems = JSON.parse(document.getElementsByName('captcha_settings')[0].value);
            elems['ts'] = JSON.stringify(new Date().getTime());
            document.getElementsByName('captcha_settings')[0].value = JSON.stringify(elems);
        }
    }
    setInterval(timestamp, 500);
}
