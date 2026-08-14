/**
 * Starts Salesforce's captcha timestamp ticker and returns a function that re-applies the
 * latest timestamp.
 *
 * `captcha_settings` is a hidden input, so React rewrites its value on every re-render and the
 * ticker stops once the captcha is solved — leaving `ts` empty. Web-to-Lead then discards the
 * lead and still redirects to retURL. Call the returned function immediately before submitting.
 */
export function initCaptcha(): () => void {
    let latest = '';

    function write(ts: string) {
        const captchaSettings = document.getElementsByName('captcha_settings')[0] as HTMLInputElement | undefined;
        if (captchaSettings == null || ts === '') {
            return;
        }
        const elems = JSON.parse(captchaSettings.value);
        elems['ts'] = ts;
        captchaSettings.value = JSON.stringify(elems);
    }

    function timestamp() {
        const response = document.getElementById('g-recaptcha-response') as HTMLInputElement;
        if (response == null || response.value.trim() == '') {
            latest = JSON.stringify(new Date().getTime());
            write(latest);
        }
    }
    setInterval(timestamp, 500);

    return () => write(latest);
}
