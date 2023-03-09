import { BBox } from '../../scene/bbox';

export class Overlay {
    private className: string;
    private parentElement: HTMLElement;
    private element?: HTMLElement;

    constructor(className: string, parent: HTMLElement) {
        this.className = className;
        this.parentElement = parent;
    }

    show(html: string, rect: BBox) {
        let element = this.element!;
        if (!this.element) {
            element = document.createElement('div');
            element.className = this.className;
            this.element = element;
        }
        element.style.position = 'absolute';
        element.style.left = `${rect.x}px`;
        element.style.top = `${rect.y}px`;
        element.style.width = `${rect.width}px`;
        element.style.height = `${rect.height}px`;
        element.innerHTML = html;
        this.parentElement?.append(element);
    }

    hide() {
        this.element?.remove();
        this.element = undefined;
    }
}
