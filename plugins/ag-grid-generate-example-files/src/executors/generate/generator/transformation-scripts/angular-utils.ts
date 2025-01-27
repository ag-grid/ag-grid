import type { EventHandler, Property } from '../types';
import { recognizedDomEvents } from './parser-utils';
import { toTitleCase } from './string-utils';

export const toInput = (property: Property) => `[${property.name}]="${property.name}"`;
export const toConst = (property: Property) => `[${property.name}]="${property.value}"`;
export const toOutput = (event: EventHandler) => `(${event.name})="${event.handlerName}($event)"`;
export const toMember = (property: Property) => `${property.name};`;
export const toMemberWithValue = (property: Property) => {
    if (property.typings) {
        const typing = property.typings.typeName;
        // Don't include obvious types
        if (!['number', 'string', 'boolean'].includes(typing)) {
            let typeName = property.typings.typeName;
            if (property.name === 'columnDefs') {
                // Special logic for columnDefs as its a popular property
                typeName = property.value.includes('children') ? '(ColDef | ColGroupDef)[]' : 'ColDef[]';
            }
            return `${property.name}: ${typeName} = ${property.value}`;
        }
    }
    return `${property.name} = ${property.value}`;
};
export const toAssignment = (property: Property) => `this.${property.name} = ${property.value}`;

export function convertTemplate(template: string) {
    recognizedDomEvents.forEach((event) => {
        template = template.replace(new RegExp(`on${event}=`, 'g'), `(${event})=`);
    });

    return template.replace(/\(event\)/g, '($event)').replace(/\(event\./g, '($event.');
}

export function getImport(filename: string) {
    const componentName = filename.split('.')[0];
    return `import { ${toTitleCase(componentName)} } from './${componentName}.component';`;
}
