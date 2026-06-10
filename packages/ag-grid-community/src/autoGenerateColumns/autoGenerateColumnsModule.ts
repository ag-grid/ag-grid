import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { FileInputOverlayModule } from '../rendering/overlays/fileInputOverlayModule';
import { VERSION } from '../version';
import { AutoGenerateColumnsService } from './autoGenerateColumnsService';

/**
 * @feature Columns -> Auto-Generate Columns
 * @gridOption autoGenerateColumnDefs
 */
export const AutoGenerateColumnsModule: _ModuleWithoutApi = {
    moduleName: 'AutoGenerateColumns',
    version: VERSION,
    beans: [AutoGenerateColumnsService],
    dependsOn: [FileInputOverlayModule],
};
