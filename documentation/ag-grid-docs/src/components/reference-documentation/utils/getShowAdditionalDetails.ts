import type { ChildDocEntry, DocEntry, InterfaceEntry } from '../types';
import { extractInterfaces } from './documentation-helpers';
import { applyInterfaceInclusions, isCallSig } from './interface-helpers';

export function getShowAdditionalDetails({
    definition,
    gridOpProp,
    interfaceLookup,
}: {
    definition: DocEntry | ChildDocEntry;
    gridOpProp: InterfaceEntry;
    interfaceLookup: Record<string, InterfaceEntry>;
}) {
    let type: any = definition.type;
    let showAdditionalDetails = typeof type == 'object';
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

            const anyInterfaces = extractInterfaces(
                gridOpProp.type,
                interfaceLookup,
                applyInterfaceInclusions({
                    gridOpProp,
                    interfaceHierarchyOverrides: definition.interfaceHierarchyOverrides,
                })
            );
            showAdditionalDetails = isCallSig(gridOpProp) || type.arguments || anyInterfaces.length > 0;
        }
    }

    return showAdditionalDetails;
}
