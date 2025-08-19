import type { Theme } from '../agStack/theming/theme';
import { createSharedTheme } from '../agStack/theming/themeImpl';
import type { ThemeLogger } from '../agStack/theming/themeLogger';
import { _error, _logPreInitErr, _warn } from '../validation/logging';
import type { CoreParams } from './core/core-css';
import { coreDefaults } from './core/core-css';
import type { BatchEditStyleParams } from './parts/batch-edit/batch-edit-styles';
import { batchEditStyleBase } from './parts/batch-edit/batch-edit-styles';
import { buttonStyleQuartz } from './parts/button-style/button-styles';
import type { ButtonStyleParams } from './parts/button-style/button-styles';
import { columnDropStyleBordered } from './parts/column-drop-style/column-drop-styles';

export const gridThemeLogger: ThemeLogger = {
    warn: (...args) => {
        // temp typing needed here to link theme error type and grid error type
        _warn(args[0] as any as 104, args[1] as any);
    },
    error: (...args) => {
        _error(args[0] as any as 104, args[1] as any);
    },
    preInitErr: (...args) => {
        _logPreInitErr(args[0], args[2] as any, args[1]);
    },
};

/**
 * Create a custom theme containing core grid styles but no parts.
 */
// TODO button and column drop styles were split out into a part in 33.1 and
// must be bundled by default to avoid a breaking change for people using
// createTheme(). In v34 the withPart calls can be removed.

export const createTheme = (): Theme<CoreParams & ButtonStyleParams & BatchEditStyleParams> =>
    createSharedTheme<CoreParams>(gridThemeLogger)
        .withParams(coreDefaults)
        .withPart(buttonStyleQuartz)
        .withPart(columnDropStyleBordered)
        .withPart(batchEditStyleBase);
