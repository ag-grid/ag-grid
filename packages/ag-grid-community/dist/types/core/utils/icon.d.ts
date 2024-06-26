import type { AgColumn } from '../entities/agColumn';
import type { GridOptionsService } from '../gridOptionsService';
export declare const iconNameClassMap: {
    [key: string]: string;
};
/**
 * If icon provided, use this (either a string, or a function callback).
 * if not, then use the default icon from the theme
 * @param {string} iconName
 * @param {GridOptionsService} gos
 * @param {Column | null} [column]
 * @returns {Element}
 */
export declare function _createIcon(iconName: string, gos: GridOptionsService, column: AgColumn | null): Element;
export declare function _createIconNoSpan(iconName: string, gos: GridOptionsService, column?: AgColumn | null, forceCreate?: boolean): Element | undefined;
