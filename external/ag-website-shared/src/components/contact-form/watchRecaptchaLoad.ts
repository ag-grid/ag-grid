export type RecaptchaLoadFailure = 'error' | 'timeout';

interface Callbacks {
    onLoad: () => void;
    onFailure: (reason: RecaptchaLoadFailure) => void;
}

/**
 * Waits for reCAPTCHA to load, failing it when the load errors or has not finished within
 * `timeoutMillis`.
 *
 * Where Google is blocked, such as mainland China, the script request often hangs rather than
 * erroring, so the timeout is the only signal there. A load that finishes after the timeout still
 * calls `onLoad`, so a slow network gets the widget late rather than never. `onFailure` is called
 * at most once.
 *
 * @returns a function that stops waiting, to call on unmount
 */
export function watchRecaptchaLoad(
    load: Promise<void>,
    timeoutMillis: number,
    { onLoad, onFailure }: Callbacks
): () => void {
    let stopped = false;
    let failed = false;

    const fail = (reason: RecaptchaLoadFailure) => {
        if (stopped || failed) {
            return;
        }
        failed = true;
        onFailure(reason);
    };

    const timeoutId = window.setTimeout(() => fail('timeout'), timeoutMillis);

    load.then(
        () => {
            window.clearTimeout(timeoutId);
            if (!stopped) {
                onLoad();
            }
        },
        () => {
            window.clearTimeout(timeoutId);
            fail('error');
        }
    );

    return () => {
        stopped = true;
        window.clearTimeout(timeoutId);
    };
}
