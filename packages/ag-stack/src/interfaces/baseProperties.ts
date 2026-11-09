import type { BaseDomFreeProperties } from './baseDomFreeProperties';

/**
 * Properties required by AG Stack, including those that name a DOM type.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface BaseProperties extends BaseDomFreeProperties {
    popupParent?: HTMLElement | null;
    themeStyleContainer?: HTMLElement | (() => HTMLElement | void);
    getDocument?: () => Document;
}
