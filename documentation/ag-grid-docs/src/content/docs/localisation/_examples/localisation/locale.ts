export const zzzLocale = (locale: Record<string, string>) => {
    const modifiedLocale: Record<string, string> = {};
    Object.keys(locale).forEach(function (key) {
        if (key === 'thousandSeparator' || key === 'decimalSeparator') {
            return;
        }
        modifiedLocale[key] = 'zzz-' + locale[key];
    });

    return modifiedLocale;
};
