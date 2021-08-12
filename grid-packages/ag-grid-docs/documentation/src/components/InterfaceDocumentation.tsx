import { escapeGenericCode, getJsonFromFile } from 'components/documentation-helpers';
import React from 'react';
import Code from './Code';
import { extractInterfaces, writeAllInterfaces } from './documentation-helpers';
import { useJsonFileNodes } from './use-json-file-nodes';

/**
 * This component generates the code of the given interfaces that can be inserted into doc pages.
 */
export const InterfaceDocumentation = ({ framework, interfaces = undefined }): any => {
    const nodes = useJsonFileNodes();

    if (interfaces && interfaces.length) {
        const interfaceLookup = getJsonFromFile(nodes, undefined, 'grid-api/interfaces.AUTO.json');

        const matches = extractInterfaces(interfaces, interfaceLookup);
        const lines = writeAllInterfaces(matches, framework)
        const escapedLines = escapeGenericCode(lines);
        return <Code code={escapedLines} keepMarkup={true} />;
    } else {
        return null;
    }
};
