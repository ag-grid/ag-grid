function camelize(string) {
    return string.replace(/(?:-)(\w)/g, function(_, c) {
        return c ? c.toUpperCase() : '';
    });
}

export default function(string) {
    return string.replace(/style="(.+?);?"/g, function(_, styles) {
        const parsed = styles.split(';').reduce((obj, declaration) => {
            const [property, value] = declaration.split(':');
            obj[camelize(property.trim())] = value.trim();
            return obj;
        }, {});

        return 'style={' + JSON.stringify(parsed) + '}';
    });
};
