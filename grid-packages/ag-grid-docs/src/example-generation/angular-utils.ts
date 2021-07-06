import { recognizedDomEvents } from "./parser-utils";

export const toInput = (property: any) => `[${property.name}]="${property.name}"`;
export const toConst = (property: any) => `[${property.name}]="${property.value}"`;
export const toOutput = (event: any) => `(${event.name})="${event.handlerName}($event)"`;
export const toMember = (property: any) => `private ${property.name};`;
export const toAssignment = (property: any) => `this.${property.name} = ${property.value}`;

export function convertTemplate(template: string) {
    recognizedDomEvents.forEach(event => {
        template = template.replace(new RegExp(`on${event}=`, 'g'), `(${event})=`);
    });

    return template.replace(/\(event\)/g, '($event)');
}

export function toTitleCase(value) {
    const camelCased = value.replace(/-([a-z])/g, g => g[1].toUpperCase());
    return camelCased[0].toUpperCase() + camelCased.slice(1);
};

export function getImport(filename: string) {
    const componentName = filename.split('.')[0];
    return `import { ${toTitleCase(componentName)} } from './${componentName}.component';`;
}
