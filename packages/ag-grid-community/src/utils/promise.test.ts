import { AgPromise } from './promise';

function delayAssert(done: (error?: Error) => void, ...assertions: (() => void)[]) {
    setTimeout(() => asyncAssert(done, ...assertions), 0);
}

function asyncAssert(done: (error?: Error) => void, ...assertions: (() => void)[]) {
    try {
        assertions.forEach((a) => a());
        done();
    } catch (error) {
        done(error);
    }
}

describe('AgPromise', () => {
    it('executes initial function by default', () => {
        const initial = jest.fn();
        new AgPromise(() => initial());

        expect(initial).toBeCalledTimes(1);
    });
});

describe('then', () => {
    it('waits for initial function to finish before executing', (done) => {
        let canResolve = false;

        const initial = (resolve: (x: boolean) => void) => {
            if (canResolve) {
                resolve(true);
            } else {
                setTimeout(() => initial(resolve), 0);
            }
        };

        const promise = new AgPromise(initial);
        const then = jest.fn();

        promise.then(then);

        expect(then).toBeCalledTimes(0);

        canResolve = true;

        delayAssert(done, () => expect(then).toBeCalledTimes(1));
    });

    it('executes immediately if the promise has already resolved', () => {
        const initial = (resolve: (x: boolean) => void) => resolve(true);
        const promise = new AgPromise(initial);
        const then = jest.fn();

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

    it('returns a promise that can be chained', (done) => {
        new AgPromise<number>((resolve) => setTimeout(() => resolve(3), 0))
            .then((value) => value! * 3)
            .then((value) => value! + 20)
            .then((value) => {
                asyncAssert(done, () => expect(value).toBe(29));
            });
    });
});

describe('all', () => {
    it('waits for all promises to resolve', (done) => {
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

            return new AgPromise(func);
        };

        const promise = AgPromise.all([
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
