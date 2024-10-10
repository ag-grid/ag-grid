const pRandom = (() => {
    // From https://stackoverflow.com/a/3062783
    let seed = 123_456_789;
    const m = 2 ** 32;
    const a = 1_103_515_245;
    const c = 12_345;

    return () => {
        seed = (a * seed + c) % m;
        return seed / m;
    };
})();

export function randomNumber(maxNumber: number = 10): number {
    return pRandom() * maxNumber;
}

export function randomNumberList({ length = 10, maxNumber = 10 }: { length: number; maxNumber: number }): number[] {
    const list: number[] = [];
    for (let i = 0; i < length; i++) {
        list.push(randomNumber(maxNumber));
    }

    return list;
}

type GeneratorState = 'started' | 'stopped';
export function createGenerator({ interval = 1000, callback }: { interval: number; callback: () => void }) {
    let currentInterval = interval;
    let state: GeneratorState = 'stopped';
    let timeout;

    const createTimeout = () => {
        return setTimeout(() => {
            callback && callback();

            if (state !== 'stopped') {
                timeout = createTimeout();
            }
        }, currentInterval);
    };

    const start = () => {
        state = 'started';
        timeout = createTimeout();
    };

    const stop = () => {
        state = 'stopped';
        clearTimeout(timeout);
    };

    const updateInterval = (newInterval: number) => {
        clearTimeout(timeout);
        currentInterval = newInterval;

        if (state !== 'stopped') {
            timeout = createTimeout();
        }
    };

    return {
        start,
        stop,
        updateInterval,
    };
}
