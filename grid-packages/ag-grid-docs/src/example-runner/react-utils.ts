import { recognizedDomEvents } from './parser-utils';

export const convertFunctionToProperty = (code: string) =>
    code.replace(/^function\s+([^\(\s]+)\s*\(([^\)]*)\)/, '$1 = ($2) => ');

const toTitleCase = (value: string) => value[0].toUpperCase() + value.slice(1);
const toCamelCase = (value: string) => value.replace(/(?:-)(\w)/g, (_, c: string) => c ? c.toUpperCase() : '');

function convertStyles(code: string) {
    return code.replace(/style=['"](.+?);?['"]/g, (_, styles) => {
        const parsed = styles.split(';').reduce((obj, declaration) => {
            const [property, value] = declaration.split(':');
            obj[toCamelCase(property.trim())] = value.trim();
            return obj;
        }, {});

        return `style={${JSON.stringify(parsed)}}`;
    });
};

export function convertTemplate(template: string) {
    // React events are case sensitive, so need to ensure casing is correct
    const caseSensitiveEvents =
    {
        dragover: 'onDragOver',
        dragstart: 'onDragStart',
    };

    recognizedDomEvents.forEach(event => {
        const jsEvent = caseSensitiveEvents[event] || `on${toTitleCase(event)}`;
        const matcher = new RegExp(`on${event}="(\\w+)\\((.*?)\\)"`, 'g');

        template = template
            .replace(matcher, `${jsEvent}={() => this.$1($2)}`)
            .replace(/, event\)/g, ")")
            .replace(/, event,/g, ", ");
    });

    template = template
        .replace(/\(this\, \)/g, '(this)')
        .replace(/<input type="(radio|checkbox|text|range)" (.+?[^=])>/g, '<input type="$1" $2 />')
        .replace(/<input placeholder(.+?[^=])>/g, '<input placeholder$1 />')
        .replace(/ class=/g, " className=");

    return convertStyles(template);
}

export const getImport = (filename: string) => `import ${toTitleCase(filename.split('.')[0])} from './${filename}';`;