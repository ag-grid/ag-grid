import type { _ModuleWithoutApi } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { FileInputOverlayComponent } from './fileInputOverlayComponent';
import { OverlayModule } from './overlayModule';

/**
 * @feature Accessories -> File Input Overlay
 * @gridOption processFileInput
 */
export const FileInputOverlayModule: _ModuleWithoutApi = {
    moduleName: 'FileInputOverlay',
    version: VERSION,
    userComponents: {
        agFileInputOverlay: FileInputOverlayComponent,
    },
    icons: {
        document: 'document',
    },
    dependsOn: [OverlayModule],
};
