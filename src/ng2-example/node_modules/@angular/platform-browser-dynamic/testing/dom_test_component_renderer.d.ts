import { TestComponentRenderer } from '@angular/core/testing';
/**
 * A DOM based implementation of the TestComponentRenderer.
 */
export declare class DOMTestComponentRenderer extends TestComponentRenderer {
    private _doc;
    constructor(_doc: any);
    insertRootElement(rootElId: string): void;
}
