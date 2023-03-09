import { OPT_FUNCTION, Validate } from '../../util/validation';
import { BBox } from '../../scene/bbox';

export class Overlay {
    constructor(className: string, parent: HTMLElement) {
        this.className = className;
        this.parentElement = parent;
    }

    @Validate(OPT_FUNCTION)
    renderer: (() => string) | undefined = undefined;

    private className: string;
    private parentElement: HTMLElement;
    private element?: HTMLElement;

    show(rect: BBox) {
        if (typeof this.renderer !== 'function') {
            this.hide();
            return;
        }

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

        element.innerHTML = this.renderer();

        this.parentElement?.append(element);
    }

    hide() {
        this.element?.remove();
        this.element = undefined;
    }
}
