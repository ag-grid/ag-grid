// @vitest-environment jsdom
import { vi } from 'vitest';

import { watchRecaptchaLoad } from './watchRecaptchaLoad';

const TIMEOUT_MILLIS = 10_000;

function deferred() {
    let resolve!: () => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

describe('watchRecaptchaLoad', () => {
    const onLoad = vi.fn();
    const onFailure = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers();
        onLoad.mockClear();
        onFailure.mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('calls onLoad when the script loads in time', async () => {
        const load = deferred();
        watchRecaptchaLoad(load.promise, TIMEOUT_MILLIS, { onLoad, onFailure });

        load.resolve();
        await vi.advanceTimersByTimeAsync(TIMEOUT_MILLIS);

        expect(onLoad).toHaveBeenCalledTimes(1);
        expect(onFailure).not.toHaveBeenCalled();
    });

    test('fails with "error" when the script fails to load', async () => {
        const load = deferred();
        watchRecaptchaLoad(load.promise, TIMEOUT_MILLIS, { onLoad, onFailure });

        load.reject(new Error('blocked'));
        await vi.advanceTimersByTimeAsync(TIMEOUT_MILLIS);

        expect(onFailure).toHaveBeenCalledTimes(1);
        expect(onFailure).toHaveBeenCalledWith('error');
        expect(onLoad).not.toHaveBeenCalled();
    });

    test('fails with "timeout" when the script request hangs', async () => {
        watchRecaptchaLoad(new Promise(() => {}), TIMEOUT_MILLIS, { onLoad, onFailure });

        await vi.advanceTimersByTimeAsync(TIMEOUT_MILLIS - 1);
        expect(onFailure).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1);

        expect(onFailure).toHaveBeenCalledWith('timeout');
    });

    test('still calls onLoad when the script loads after the timeout', async () => {
        const load = deferred();
        watchRecaptchaLoad(load.promise, TIMEOUT_MILLIS, { onLoad, onFailure });

        await vi.advanceTimersByTimeAsync(TIMEOUT_MILLIS);
        load.resolve();
        await vi.advanceTimersByTimeAsync(0);

        expect(onFailure).toHaveBeenCalledWith('timeout');
        expect(onLoad).toHaveBeenCalledTimes(1);
    });

    test('reports a failure only once when the script errors after the timeout', async () => {
        const load = deferred();
        watchRecaptchaLoad(load.promise, TIMEOUT_MILLIS, { onLoad, onFailure });

        await vi.advanceTimersByTimeAsync(TIMEOUT_MILLIS);
        load.reject(new Error('blocked'));
        await vi.advanceTimersByTimeAsync(0);

        expect(onFailure).toHaveBeenCalledTimes(1);
        expect(onFailure).toHaveBeenCalledWith('timeout');
    });

    test('calls nothing once stopped', async () => {
        const hung = deferred();
        const stopHung = watchRecaptchaLoad(hung.promise, TIMEOUT_MILLIS, { onLoad, onFailure });
        const loaded = deferred();
        const stopLoaded = watchRecaptchaLoad(loaded.promise, TIMEOUT_MILLIS, { onLoad, onFailure });

        stopHung();
        stopLoaded();
        loaded.resolve();
        await vi.advanceTimersByTimeAsync(TIMEOUT_MILLIS);

        expect(onLoad).not.toHaveBeenCalled();
        expect(onFailure).not.toHaveBeenCalled();
    });
});
