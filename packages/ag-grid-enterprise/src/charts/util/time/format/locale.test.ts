import { formatRe, pad, requote } from "./locale";

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

test('pad', () => {
    expect(pad(235, '0', 5)).toBe('00235');
    expect(pad(-235, '0', 5)).toBe('-0235');
});
