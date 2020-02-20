import { recognizedDomEvents } from './parser-utils';

export const toKebabCase = (value: string) => value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

const toTitleCase = value => {
    const camelCased = value.replace(/-([a-z])/g, g => g[1].toUpperCase());
    return camelCased[0].toUpperCase() + camelCased.slice(1);
};

export const toInput = property => `:${property.name}="${property.name}"`;
export const toConst = property => `:${property.name}="${property.value}"`;
export const toOutput = event => `@${toKebabCase(event.name)}="${event.handlerName}"`;
export const toMember = property => `${property.name}: null`;

export function toAssignment(property: any): string {
    // convert to arrow functions
    const value = property.value.replace(/function\s*\(([^\)]+)\)/, '($1) =>');

    return `this.${property.name} = ${value}`;
};

export function getImport(filename: string) {
    const componentName = filename.split('.')[0];
    return `import ${toTitleCase(componentName)} from './${filename}';`;
}

export function convertTemplate(template: string) {
    recognizedDomEvents.forEach(event => {
        template = template.replace(new RegExp(`on${event}=`, 'g'), `v-on:${event}=`);
    });

    // re-indent
    return template.split("\n").filter(line => line.length > 0).join('\n            ');
}