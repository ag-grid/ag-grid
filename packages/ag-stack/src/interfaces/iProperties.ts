import type { BaseProperties } from './baseProperties';
import type { IDomFreePropertiesService } from './iDomFreeProperties';

/**
 * Adds the members that tell this instance's elements apart from another instance's on the same page.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface IPropertiesService<TProperties extends BaseProperties> extends IDomFreePropertiesService<TProperties> {
    setInstanceDomData(element: HTMLElement): void;

    isElementInThisInstance(element: Element): boolean;
}
