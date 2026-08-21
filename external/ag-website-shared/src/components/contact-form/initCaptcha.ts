export interface CaptchaTicker {
    /** Writes the frozen timestamp back into the hidden input, just before submitting. */
    reapply: () => void;
    /** Stops the ticker. Call on unmount, or it keeps running for the life of the page. */
    stop: () => void;
}

/**
 * Starts Salesforce's captcha timestamp ticker for one rendered reCAPTCHA widget.
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
export function initCaptcha(container: HTMLElement, onTimestamp?: (ts: string) => void): CaptchaTicker {
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
        // Scoped to this widget's own container: reCAPTCHA only names the first widget's field
        // `g-recaptcha-response`, and suffixes every later one (`g-recaptcha-response-1` and so
        // on), so a lookup by bare id silently misses any widget rendered after the first.
        const response = container.querySelector<HTMLTextAreaElement>('textarea[name="g-recaptcha-response"]');
        if (response == null || response.value.trim() === '') {
            latest = JSON.stringify(new Date().getTime());
            write(latest);
            onTimestamp?.(latest);
        }
    }

    const ticker = setInterval(timestamp, 500);

    return {
        reapply: () => write(latest),
        stop: () => clearInterval(ticker),
    };
}
