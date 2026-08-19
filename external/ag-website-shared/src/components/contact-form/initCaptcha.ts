/**
 * Starts Salesforce's captcha timestamp ticker.
 *
 * `onTimestamp` receives every value written, so the caller can render it back into the
 * hidden input: React resets a controlled input on re-render, and `form.submit()` only
 * schedules a navigation — the body is serialised in a later task, after any pending
 * re-render has flushed. Rendering the live timestamp means a re-render at any point
 * writes the correct value rather than blanking it.
 *
 * The ticker stops once the captcha is solved, freezing `ts` at solve time, which is the
 * elapsed-time signal Salesforce validates.
 */
export function initCaptcha(onTimestamp?: (ts: string) => void): () => void {
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
            onTimestamp?.(latest);
        }
    }
    setInterval(timestamp, 500);

    return () => write(latest);
}
