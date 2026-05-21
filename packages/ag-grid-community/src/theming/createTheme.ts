import type { Theme } from '../agStack/theming/theme';
import { createSharedTheme } from '../agStack/theming/themeImpl';
import type { ThemeLogger } from '../agStack/theming/themeLogger';
import { _error, _logPreInitErr, _warn } from '../validation/logging';
import type { CoreParams } from './core/core-css';
import { coreDefaults } from './core/core-css';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
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
export const createTheme = (): Theme<CoreParams> =>
    createSharedTheme<CoreParams>(gridThemeLogger).withParams(coreDefaults);
