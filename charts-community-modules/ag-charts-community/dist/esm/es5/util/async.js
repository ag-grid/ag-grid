export function sleep(sleepTimeoutMs) {
    return new Promise(function (resolve) {
        setTimeout(function () { return resolve(undefined); }, sleepTimeoutMs);
    });
}
