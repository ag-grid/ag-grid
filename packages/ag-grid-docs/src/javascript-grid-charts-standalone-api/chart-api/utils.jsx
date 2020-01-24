export const formatJson = object => {
    const formatters = {
        'number': x => x,
        'string': x => `'${x}'`,
    };

    const formatArray = array => {
        if (array.length) {
            const type = typeof array[0];
            const format = formatters[type];

            if (format && array.every(x => typeof x === type)) {
                return `[${array.map(x => format(x)).join(', ')}]`;
            }
        }

        return array;
    };

    const formattedJson = JSON.stringify(object, (_, v) => Array.isArray(v) ? formatArray(v) : v, 2);

    console.log(`Formatting ${formattedJson}`);

    return formattedJson
        .replace(/\"([^\"]+)\":/g, '$1:') // format property names
        .replace(/"\[/g, '[').replace(/\]"/g, ']') // finish array formatting
        .replace(/\"([^\"]+)\"/g, '\'$1\''); // force single quotes
};

export const deepClone = object => JSON.parse(JSON.stringify(object || {}));
