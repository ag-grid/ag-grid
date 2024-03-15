export function toTitle(str: string) {
    if (!str) {
        return '';
    }
    const replacedDashes = str.replaceAll('-', ' ');
    const strSplit = replacedDashes.split(' ');
    const capitalised = strSplit
        .map((s) => {
            if (!s[0]) {
                return '';
            }
            return s[0].toLocaleUpperCase() + s.slice(1);
        })
        .filter(Boolean);
    return capitalised.join(' ');
}
