import { AgPromise } from './promise';

function delayAssert(...assertions: (() => void)[]): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                for (const a of assertions) {
                    a();
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        }, 0);
    });
}

function asyncAssert(...assertions: (() => void)[]): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            for (const a of assertions) {
                a();
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

describe('AgPromise', () => {
    it('executes initial function by default', () => {
        const initial = vi.fn();
        // eslint-disable-next-line sonarjs/constructor-for-side-effects
        new AgPromise(() => initial());

        expect(initial).toBeCalledTimes(1);
    });
});

describe('then', () => {
    it('waits for initial function to finish before executing', () => {
        let canResolve = false;

        const initial = (resolve: (x: boolean) => void) => {
            if (canResolve) {
                resolve(true);
            } else {
                setTimeout(() => initial(resolve), 0);
            }
        };

        const promise = new AgPromise(initial);
        const then = vi.fn();

        promise.then(then);

        expect(then).toBeCalledTimes(0);

        canResolve = true;

        return delayAssert(() => expect(then).toBeCalledTimes(1));
    });

    it('executes immediately if the promise has already resolved', () => {
        const initial = (resolve: (x: boolean) => void) => resolve(true);
        const promise = new AgPromise(initial);
        const then = vi.fn();

        promise.then(then);

        expect(then).toBeCalledTimes(1);
    });

    it('receives the result from the initial function', () => {
        const value = 123;
        const initial = (resolve: (x: number) => void) => resolve(value);

        let receivedValue = 0;

        const then = (value: number) => (receivedValue = value);

        const promise = new AgPromise(initial);
        promise.then(then);

        expect(receivedValue).toBe(value);
    });

    it('returns a promise that can be chained', () => {
        return new Promise<void>((resolve, reject) => {
            new AgPromise<number>((res) => setTimeout(() => res(3), 0))
                .then((value) => value! * 3)
                .then((value) => value! + 20)
                .then((value) => {
                    asyncAssert(() => expect(value).toBe(29))
                        .then(resolve)
                        .catch(reject);
                });
        });
    });
});

describe('all', () => {
    it('waits for all promises to resolve', () => {
        return new Promise<void>((resolve, reject) => {
            let promise1canResolve = false;
            let promise2canResolve = false;

            const createPromise = (test: () => boolean) => {
                const func = (res: (x: boolean) => void) => {
                    if (test()) {
                        res(true);
                    } else {
                        setTimeout(() => func(res), 0);
                    }
                };

                return new AgPromise(func);
            };

            const promise = AgPromise.all([
                createPromise(() => promise1canResolve),
                createPromise(() => promise2canResolve),
            ]);

            const then = vi.fn();

            promise.then(then);

            expect(then).toBeCalledTimes(0);

            promise1canResolve = true;

            setTimeout(() => {
                try {
                    expect(then).toBeCalledTimes(0);

                    promise2canResolve = true;

                    setTimeout(() => {
                        try {
                            expect(then).toBeCalledTimes(1);
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    }, 0);
                } catch (error) {
                    reject(error);
                }
            }, 0);
        });
    });
});
