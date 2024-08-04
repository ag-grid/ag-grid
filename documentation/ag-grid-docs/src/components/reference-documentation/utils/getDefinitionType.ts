import type { ChildDocEntry, Config, DocEntry, InterfaceEntry } from '../types';
import { inferType } from './documentation-helpers';
import { getPropertyType } from './interface-helpers';

// Use the type definition if manually specified in config
export function getDefinitionType({
    name,
    definition,
    gridOpProp,
    interfaceLookup,
    isEvent,
    config,
}: {
    name: string;
    definition: DocEntry | ChildDocEntry;
    gridOpProp: InterfaceEntry;
    interfaceLookup: Record<string, InterfaceEntry>;
    isEvent: boolean;
    config: Config;
}) {
    let type: any = definition.type;
    if (!type) {
        // No type specified in the doc config file so check the GridOptions property
        if (gridOpProp && gridOpProp.type) {
            type = gridOpProp.type;

            const isDeprecated = gridOpProp.meta?.tags?.some((t) => t.name === 'deprecated');
            if (isDeprecated) {
                // eslint-disable-next-line no-console
                console.warn(
                    `<api-documentation>: Docs include a property: ${name} that has been marked as deprecated.`
                );
                // eslint-disable-next-line no-console
                console.warn('<api-documentation>: ' + gridOpProp.meta?.all);
            }
        } else {
            if (type == null && config.codeSrcProvided?.length > 0) {
                throw new Error(
                    `We could not find a type for "${name}" from the code sources ${config.codeSrcProvided.join()}. Has this property been removed from the source code / or is there a typo?`
                );
            }

            // If a codeSrc is not provided as a last resort try and infer the type
            type = inferType(definition.default);
        }
    }

    const propertyType = getPropertyType({
        type,
        isEvent,
        interfaceLookup,
        gridOpProp,
    });

    return {
        type,
        propertyType,
    };
}
