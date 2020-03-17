import minute from "./minute";
test('minute.every', function () {
    var interval = minute.every(5);
    expect(interval).toBeDefined();
    if (interval) {
        var date = new Date(Date.UTC(2019, 7, 23, 15, 17, 5, 100));
        var floored = interval.floor(date);
        expect(floored.getTime()).toBe(Date.UTC(2019, 7, 23, 15, 15, 0, 0));
    }
});
