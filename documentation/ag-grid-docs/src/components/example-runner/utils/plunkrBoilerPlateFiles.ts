import type { InternalFramework } from '@ag-grid-types';
import type { FileContents } from '@components/example-generator/types';

// Plunker hands `compilerOptions` to TypeScript unparsed, so only boolean options are safe here. Without
// `strict` (for its `strictFunctionTypes`) its type checker overflows the editor worker's stack on `AgGridReact` props.
const TS_CONFIG = JSON.stringify({ compilerOptions: { strict: true } }, null, 2);

export const getPlunkrBoilerPlateFiles = (internalFramework: InternalFramework): FileContents | undefined => {
    const isJavascript = internalFramework === 'vanilla' || internalFramework === 'reactFunctional';
    return isJavascript ? undefined : { 'tsconfig.json': TS_CONFIG };
};
