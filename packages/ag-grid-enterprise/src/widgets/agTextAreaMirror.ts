import { RefPlaceholder, _getWindow, _observeResize, _requestAnimationFrame } from 'ag-stack';

import type { GridInputTextArea } from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import agTextAreaMirrorCSS from './agTextAreaMirror.css';

const TEXT_STYLE_PROPERTIES = [
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'font-variant',
    'font-stretch',
    'font-kerning',
    'font-feature-settings',
    'font-variation-settings',
    'line-height',
    'letter-spacing',
    'word-spacing',
    'tab-size',
    'text-align',
    'text-indent',
    'text-transform',
    'direction',
    'white-space',
    'overflow-wrap',
    'word-break',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
] as const;

export class AgTextAreaMirror extends Component {
    protected readonly eText: HTMLElement = RefPlaceholder;
    private layoutPending = false;

    constructor(private readonly field: Pick<GridInputTextArea, 'getInputElement' | 'getWrapperElement'>) {
        super({
            tag: 'div',
            cls: 'ag-text-area-mirror',
            attrs: { 'aria-hidden': 'true' },
            children: [{ tag: 'div', ref: 'eText', cls: 'ag-text-area-mirror-text' }],
        });
        this.registerCSS(agTextAreaMirrorCSS);
    }

    public postConstruct(): void {
        const input = this.field.getInputElement();
        const wrapper = this.field.getWrapperElement();
        wrapper.classList.add('ag-text-area-mirror-wrapper');
        input.classList.add('ag-text-area-mirror-input');
        wrapper.appendChild(this.getGui());
        this.addManagedElementListeners(input, {
            scroll: () => this.syncScroll(),
            focus: () => this.scheduleLayout(),
            blur: () => this.scheduleLayout(),
            compositionstart: () => wrapper.classList.add('ag-text-area-mirror-composing'),
            compositionend: () => wrapper.classList.remove('ag-text-area-mirror-composing'),
        });
        this.addManagedEventListeners({ stylesChanged: () => this.scheduleLayout() });
        this.addDestroyFunc(_observeResize(this.beans, input, () => this.refreshLayout()));
        this.addDestroyFunc(() => {
            input.classList.remove('ag-text-area-mirror-input');
            wrapper.classList.remove('ag-text-area-mirror-wrapper', 'ag-text-area-mirror-composing');
            this.getGui().remove();
        });
        this.scheduleLayout();
    }

    public setContent(content: DocumentFragment): void {
        this.eText.replaceChildren(content);
        this.scheduleLayout();
    }

    private scheduleLayout(): void {
        if (this.layoutPending) {
            return;
        }
        this.layoutPending = true;
        _requestAnimationFrame(this.beans, () => {
            this.layoutPending = false;
            if (this.isAlive()) {
                this.refreshLayout();
            }
        });
    }

    private refreshLayout(): void {
        const input = this.field.getInputElement();
        const style = _getWindow(this.beans).getComputedStyle(input);
        const mirror = this.getGui();
        for (const property of TEXT_STYLE_PROPERTIES) {
            this.eText.style.setProperty(property, style.getPropertyValue(property));
        }
        this.eText.style.color = style.color;
        mirror.style.left = `${input.offsetLeft + input.clientLeft}px`;
        mirror.style.top = `${input.offsetTop + input.clientTop}px`;
        mirror.style.width = `${input.clientWidth}px`;
        mirror.style.height = `${input.clientHeight}px`;
        this.syncScroll();
    }

    private syncScroll(): void {
        const input = this.field.getInputElement();
        const mirror = this.getGui();
        mirror.scrollTop = input.scrollTop;
        mirror.scrollLeft = input.scrollLeft;
    }
}
