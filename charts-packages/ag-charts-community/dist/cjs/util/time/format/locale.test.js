"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var locale_1 = require("./locale");
var defaultLocaleDefinition = {
    dateTime: '%x, %X',
    date: '%-m/%-d/%Y',
    time: '%-I:%M:%S %p',
    periods: ['AM', 'PM'],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};
var russianLocaleDefinition = {
    dateTime: '%x %X',
    date: '%d.%m.%Y',
    time: '%-H:%M:%S',
    periods: ['', ''],
    days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    shortDays: ['Вск', 'Пнд', 'Втр', 'Срд', 'Чтв', 'Птн', 'Сбт'],
    months: ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
    shortMonths: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
};
var defaultLocale = locale_1.default(defaultLocaleDefinition);
var russianLocale = locale_1.default(russianLocaleDefinition);
test('pad', function () {
    expect(locale_1.pad(235, '0', 5)).toBe('00235');
    expect(locale_1.pad(-235, '0', 5)).toBe('-00235');
});
test('requote', function () {
    expect(locale_1.requote('(test)')).toBe('\\(test\\)');
    expect(locale_1.requote('te\\st')).toBe('te\\\\st');
    expect(locale_1.requote('te$$st')).toBe('te\\$\\$st');
});
test('formatRe', function () {
    var regExp = locale_1.formatRe(['$Jan]', '|Feb.', 'Mar']);
    expect(regExp.source).toBe('^(?:\\$Jan\\]|\\|Feb\\.|Mar)');
    expect(regExp.flags).toBe('i');
    expect('March'.match(regExp)[0]).toBe('Mar');
    expect('march'.match(regExp)[0]).toBe('mar');
    expect('|Feb.ruary'.match(regExp)[0]).toBe('|Feb.');
});
test('utcFormat', function () {
    var date = new Date(Date.UTC(2019, 8, 3, 14, 50, 17, 300));
    {
        var format0 = defaultLocale.utcFormat('%A, %d %B, %Y - %H:%M:%S.%L');
        var format1 = defaultLocale.utcFormat('%A, %0d %B, %Y - %H:%M:%S.%L');
        var format2 = defaultLocale.utcFormat('%A, %_d %B, %Y - %H:%M:%S.%L');
        var format3 = defaultLocale.utcFormat('%A, %-d %B, %Y - %H:%M:%S.%L');
        var format4 = defaultLocale.utcFormat('%T%n'); // unrecognized directives
        expect(format0(date)).toBe('Tuesday, 03 September, 2019 - 14:50:17.300');
        expect(format1(date)).toBe('Tuesday, 03 September, 2019 - 14:50:17.300');
        expect(format2(date)).toBe('Tuesday,  3 September, 2019 - 14:50:17.300');
        expect(format3(date)).toBe('Tuesday, 3 September, 2019 - 14:50:17.300');
        expect(format4(date)).toBe('Tn');
    }
    {
        var format0 = russianLocale.utcFormat('%A, %d %B, %Y - %H:%M:%S.%L');
        var format1 = russianLocale.utcFormat('%A, %0d %B, %Y - %H:%M:%S.%L');
        var format2 = russianLocale.utcFormat('%A, %_d %B, %Y - %H:%M:%S.%L');
        var format3 = russianLocale.utcFormat('%A, %-d %B, %Y - %H:%M:%S.%L');
        var format4 = russianLocale.utcFormat('%T%n'); // unrecognized directives
        var format5 = russianLocale.utcFormat('%c');
        expect(format0(date)).toBe('Вторник, 03 Сентября, 2019 - 14:50:17.300');
        expect(format1(date)).toBe('Вторник, 03 Сентября, 2019 - 14:50:17.300');
        expect(format2(date)).toBe('Вторник,  3 Сентября, 2019 - 14:50:17.300');
        expect(format3(date)).toBe('Вторник, 3 Сентября, 2019 - 14:50:17.300');
        expect(format4(date)).toBe('Tn');
        expect(format5(date)).toBe('03.09.2019 14:50:17');
    }
});
test('utcParse', function () {
    var utcTimestamp = Date.UTC(2019, 8, 3, 14, 50, 17, 300); // 1567522217300
    {
        var parse0 = defaultLocale.utcParse('%A, %d %B, %Y - %H:%M:%S.%L');
        var parse1 = defaultLocale.utcParse('%A, %0d %B, %Y - %H:%M:%S.%L');
        var parse2 = defaultLocale.utcParse('%A, %_d %B, %Y - %H:%M:%S.%L');
        var parse3 = defaultLocale.utcParse('%A, %-d %B, %Y - %H:%M:%S.%L');
        expect(parse0('Tuesday, 03 September, 2019 - 14:50:17.300').getTime()).toBe(utcTimestamp);
        expect(parse1('Tuesday, 03 September, 2019 - 14:50:17.300').getTime()).toBe(utcTimestamp);
        expect(parse2('Tuesday,  3 September, 2019 - 14:50:17.300').getTime()).toBe(utcTimestamp);
        expect(parse3('Tuesday, 3 September, 2019 - 14:50:17.300').getTime()).toBe(utcTimestamp);
    }
    {
        var parse0 = russianLocale.utcParse('%A, %d %B, %Y - %H:%M:%S.%L');
        var parse1 = russianLocale.utcParse('%A, %0d %B, %Y - %H:%M:%S.%L');
        var parse2 = russianLocale.utcParse('%A, %_d %B, %Y - %H:%M:%S.%L');
        var parse3 = russianLocale.utcParse('%A, %-d %B, %Y - %H:%M:%S.%L');
        var parse4 = russianLocale.utcParse('%c');
        expect(parse0('Вторник, 03 Сентября, 2019 - 14:50:17.300').getTime()).toBe(utcTimestamp);
        expect(parse1('Вторник, 03 Сентября, 2019 - 14:50:17.300').getTime()).toBe(utcTimestamp);
        expect(parse2('Вторник,  3 Сентября, 2019 - 14:50:17.300').getTime()).toBe(utcTimestamp);
        expect(parse3('Вторник, 3 Сентября, 2019 - 14:50:17.300').getTime()).toBe(utcTimestamp);
        expect(parse4('03.09.2019 14:50:17').getTime()).toBe(1567522217000);
    }
});
//# sourceMappingURL=locale.test.js.map