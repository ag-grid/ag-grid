import { Column } from '../entities/column';
import { GridOptionsService } from '../gridOptionsService';
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
export declare function createIcon(iconName: string, gos: GridOptionsService, column: Column | null): Element;
export declare function createIconNoSpan(iconName: string, gos: GridOptionsService, column?: Column | null, forceCreate?: boolean): Element | undefined;
