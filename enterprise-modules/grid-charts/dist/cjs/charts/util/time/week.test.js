"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var week_1 = require("./week");
var duration_1 = require("./duration");
test('sunday.get/floor', function () {
    var date = new Date(Date.UTC(2019, 7, 23, 15, 10, 5, 100)); // 7 == August
    var sundayDate = week_1.sunday.floor(date);
    var utcSundayMs = Date.UTC(2019, 7, 18, 0, 0, 0, 0);
    expect(sundayDate.getTime()).toBe(utcSundayMs + sundayDate.getTimezoneOffset() * duration_1.durationMinute);
});
test('sunday.range', function () {
    var d0 = new Date(Date.UTC(2019, 7, 23, 15, 10, 5, 100));
    var d1 = new Date(Date.UTC(2019, 8, 27, 10, 12, 2, 700));
    var utcAug25Ms = Date.UTC(2019, 7, 25, 0, 0, 0, 0);
    var utcSep01Ms = Date.UTC(2019, 8, 1, 0, 0, 0, 0);
    var utcSep08Ms = Date.UTC(2019, 8, 8, 0, 0, 0, 0);
    var utcSep15Ms = Date.UTC(2019, 8, 15, 0, 0, 0, 0);
    var utcSep22Ms = Date.UTC(2019, 8, 22, 0, 0, 0, 0);
    {
        var sundays = week_1.sunday.range(d0, d1);
        expect(sundays.length).toBe(5);
        expect(sundays[0].getTime()).toBe(utcAug25Ms + sundays[0].getTimezoneOffset() * duration_1.durationMinute);
        expect(sundays[1].getTime()).toBe(utcSep01Ms + sundays[1].getTimezoneOffset() * duration_1.durationMinute);
        expect(sundays[2].getTime()).toBe(utcSep08Ms + sundays[2].getTimezoneOffset() * duration_1.durationMinute);
        expect(sundays[3].getTime()).toBe(utcSep15Ms + sundays[3].getTimezoneOffset() * duration_1.durationMinute);
        expect(sundays[4].getTime()).toBe(utcSep22Ms + sundays[4].getTimezoneOffset() * duration_1.durationMinute);
    }
    {
        var sundays = week_1.sunday.range(d0, d1, 2);
        expect(sundays.length).toBe(3);
        expect(sundays[0].getTime()).toBe(utcAug25Ms + sundays[0].getTimezoneOffset() * duration_1.durationMinute);
        expect(sundays[1].getTime()).toBe(utcSep08Ms + sundays[1].getTimezoneOffset() * duration_1.durationMinute);
        expect(sundays[2].getTime()).toBe(utcSep22Ms + sundays[2].getTimezoneOffset() * duration_1.durationMinute);
    }
});
