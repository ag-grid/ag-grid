import { Promise } from './promise';

function delayExecute(done: (error?: Error) => void, ...expressions: (() => void)[]) {
    setTimeout(() => {
        try {
            expressions.forEach(a => a());
            done();
        } catch (error) {
            done(error);
        }
    }, 0);
}

describe('Promise', () => {
    it('executes initial function by default', () => {
        const initial = jest.fn();
        const promise = new Promise(resolve => initial());

        expect(initial).toBeCalledTimes(1);
    });
});

describe('then', () => {
    it('waits for initial function to finish before executing', done => {
        let canResolve = false;

        const initial = (resolve: (x: boolean) => void) => {
            if (canResolve) {
                resolve(true);
            } else {
                setTimeout(() => initial(resolve), 0);
            }
        };

        const promise = new Promise(initial);
        const then = jest.fn();

        promise.then(then);

        expect(then).toBeCalledTimes(0);

        canResolve = true;

        delayExecute(done, () => expect(then).toBeCalledTimes(1));
    });

    it('executes immediately if the promise has already resolved', () => {
        const initial = (resolve: (x: boolean) => void) => resolve(true);
        const promise = new Promise(initial);
        const then = jest.fn();

        promise.then(then);

        expect(then).toBeCalledTimes(1);
    });

    it('receives the result from the initial function', () => {
        const value = 123;
        const initial = (resolve: (x: number) => void) => resolve(value);

        let receivedValue = 0;

        const then = (value: number) => receivedValue = value;

        const promise = new Promise(initial);
        promise.then(then);

        expect(receivedValue).toBe(value);
    });
});

describe('all', () => {
    it('waits for all promises to resolve', done => {
        let promise1canResolve = false;
        let promise2canResolve = false;

        const createPromise = (test: () => boolean) => {
            const func = (resolve: (x: boolean) => void) => {
                if (test()) {
                    resolve(true);
                } else {
                    setTimeout(() => func(resolve), 0);
                }
            };

            return new Promise(func);
        };

        const promise = Promise.all([
            createPromise(() => promise1canResolve),
            createPromise(() => promise2canResolve),
        ]);

        const then = jest.fn();

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
                        done();
                    } catch (error) {
                        done(error);
                    }
                }, 0);
            } catch (error) {
                done(error);
            }
        }, 0);
    });
});

describe('resolveNow', () => {
    it('returns default if promise has not yet resolved', () => {
        const promise = new Promise<number>(resolve => { });
        const value = 123;

        expect(promise.resolveNow(value, x => x)).toBe(value);
    });

    it('returns value from promise if promise has resolved', () => {
        const value = 456;
        const promise = new Promise<number>(resolve => resolve(value));

        expect(promise.resolveNow(123, x => x)).toBe(value);
    });
});
