import minute from "./minute";

const date = new Date(Date.UTC(2019, 7, 23, 15, 10, 5, 100));

test('minute.every', () => {
    // console.log(minute.every(5));
    const interval = minute.every(5);
    // if (interval) {
    //     const d0 = new Date;
    //     const d1 = new Date(d0.getTime() + 1000 * 60 * 60);
    //     debugger;
    //     if (interval.count) {
    //         console.log(interval.count(d0, d1));
    //     }
    // }
    expect(interval).toBeDefined();
    if (interval) {
    }
});
