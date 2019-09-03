import formatLocale, { formatRe, pad, requote, TimeLocaleDefinition } from "./locale";

const defaultLocaleDefinition: TimeLocaleDefinition = {
    dateTime: '%x, %X',
    date: '%-m/%-d/%Y',
    time: '%-I:%M:%S %p',
    periods: ['AM', 'PM'],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};

const defaultLocale = formatLocale(defaultLocaleDefinition);

test('pad', () => {
    expect(pad(235, '0', 5)).toBe('00235');
    expect(pad(-235, '0', 5)).toBe('-00235');
});

test('requote', () => {
    expect(requote('(test)')).toBe('\\(test\\)');
    expect(requote('te\\st')).toBe('te\\\\st');
    expect(requote('te$$st')).toBe('te\\$\\$st');
});

test('formatRe', () => {
    const regExp = formatRe(['$Jan]', '|Feb.', 'Mar']);
    expect(regExp.source).toBe('^(?:\\$Jan\\]|\\|Feb\\.|Mar)');
    expect(regExp.flags).toBe('i');
    expect('March'.match(regExp)![0]).toBe('Mar');
    expect('march'.match(regExp)![0]).toBe('mar');
    expect('|Feb.ruary'.match(regExp)![0]).toBe('|Feb.');
});

test('utcFormat', () => {
    const date = new Date(Date.UTC(2019, 8, 3, 14, 50, 17, 300));

    const format0 = defaultLocale.utcFormat('%A, %d %B, %Y - %H:%M:%S.%L');
    const format1 = defaultLocale.utcFormat('%A, %0d %B, %Y - %H:%M:%S.%L');
    const format2 = defaultLocale.utcFormat('%A, %_d %B, %Y - %H:%M:%S.%L');
    const format3 = defaultLocale.utcFormat('%A, %-d %B, %Y - %H:%M:%S.%L');
    const format4 = defaultLocale.utcFormat('%T%n'); // unrecognized directives

    expect(format0(date)).toBe('Tuesday, 03 September, 2019 - 14:50:17.300');
    expect(format1(date)).toBe('Tuesday, 03 September, 2019 - 14:50:17.300');
    expect(format2(date)).toBe('Tuesday,  3 September, 2019 - 14:50:17.300');
    expect(format3(date)).toBe('Tuesday, 3 September, 2019 - 14:50:17.300');
    expect(format4(date)).toBe('Tn');
});

test('utcParse', () => {
    const utcTimestamp = Date.UTC(2019, 8, 3, 14, 50, 17, 300);

    const parse0 = defaultLocale.utcParse('%A, %d %B, %Y - %H:%M:%S.%L');
    const parse1 = defaultLocale.utcParse('%A, %0d %B, %Y - %H:%M:%S.%L');
    const parse2 = defaultLocale.utcParse('%A, %_d %B, %Y - %H:%M:%S.%L');
    const parse3 = defaultLocale.utcParse('%A, %-d %B, %Y - %H:%M:%S.%L');

    expect(parse0('Tuesday, 03 September, 2019 - 14:50:17.300')!.getTime()).toBe(utcTimestamp);
    expect(parse1('Tuesday, 03 September, 2019 - 14:50:17.300')!.getTime()).toBe(utcTimestamp);
    expect(parse2('Tuesday,  3 September, 2019 - 14:50:17.300')!.getTime()).toBe(utcTimestamp);
    expect(parse3('Tuesday, 3 September, 2019 - 14:50:17.300')!.getTime()).toBe(utcTimestamp);
});
