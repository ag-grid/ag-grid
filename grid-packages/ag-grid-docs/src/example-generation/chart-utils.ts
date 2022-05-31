export function wrapOptionsUpdateCode(
    code: string,
    before = 'const options = {...this.options};',
    after = 'this.options = options;',
): string {
    if (code.indexOf('options.') < 0) {
        return code;
    }

    return code.replace(/(.*?)\{(.*)\}/s, `$1{\n${before}\n$2\n${after}\n}`);
}
