import {Column} from "../entities/column";

export interface IRenderedHeaderElement {
    destroy(): void;
    getGui(): HTMLElement;
}
