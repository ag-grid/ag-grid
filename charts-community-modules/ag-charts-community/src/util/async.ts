export function sleep(sleepTimeoutMs: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(undefined), sleepTimeoutMs);
    });
}
