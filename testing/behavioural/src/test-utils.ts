import util from 'util';

const maxInt = 0x7fffffff;

export function printDataSnapshot(data: any, pretty = false) {
    if (typeof data === 'string') {
        console.log('\nsnapshot:\n' + JSON.stringify(data) + '\n');
    }
    console.log(
        '\nsnapshot:\n' +
            util.inspect(data, {
                colors: false,
                depth: maxInt,
                breakLength: pretty ? 120 : maxInt,
                maxArrayLength: maxInt,
                compact: true,
                getters: false,
                maxStringLength: maxInt,
                showHidden: false,
                showProxy: false,
                sorted: false,
                customInspect: false,
                numericSeparator: false,
            }) +
            '\n'
    );
}
