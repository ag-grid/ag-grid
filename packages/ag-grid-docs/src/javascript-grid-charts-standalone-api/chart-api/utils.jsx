export const formatJson = object => {
    // custom formatting for number arrays
    const formattedJson = JSON.stringify(object, (_, v) => Array.isArray(v) && v.every(x => !isNaN(x)) ? `[${v.join(', ')}]` : v, 2);

    return formattedJson.replace('"[', '[').replace(']"', ']');
};

export const deepClone = object => JSON.parse(JSON.stringify(object || {}));
