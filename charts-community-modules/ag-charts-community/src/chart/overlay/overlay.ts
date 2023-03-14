import { OPT_FUNCTION, OPT_STRING, Validate } from '../../util/validation';
import { BBox } from '../../scene/bbox';

export class Overlay {
    constructor(className: string, parent: HTMLElement) {
        this.className = className;
        this.parentElement = parent;
    }

    @Validate(OPT_FUNCTION)
    renderer: (() => string) | undefined = undefined;

    @Validate(OPT_STRING)
    text?: string = undefined;

    private className: string;
    private parentElement: HTMLElement;
    private element?: HTMLElement;

    show(rect: BBox) {
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

        if (this.renderer) {
            this.element.innerHTML = this.renderer();
        } else {
            const content = document.createElement('div');
            content.style.alignItems = 'center';
            content.style.boxSizing = 'border-box';
            content.style.display = 'flex';
            content.style.justifyContent = 'center';
            content.style.margin = '8px';
            content.style.height = '100%';
            content.style.font = '12px Verdana, sans-serif';
            content.innerText = this.text ?? 'No data to display';

            element.append(content);
        }

        this.parentElement?.append(element);
    }

    hide() {
        this.element?.remove();
        this.element = undefined;
    }
}
