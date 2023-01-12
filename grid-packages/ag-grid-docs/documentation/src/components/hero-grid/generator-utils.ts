export function randomNumber(maxNumber: number = 100): number {
    return Math.floor(Math.random() * maxNumber);
}

export function randomNumberList({ length = 10, maxNumber = 100 }: { length: number; maxNumber: number }): number[] {
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
