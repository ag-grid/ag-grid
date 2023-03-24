import { _ModuleSupport, _Scene } from 'ag-charts-community';

import { DEFAULT_CONTEXT_MENU_CLASS, defaultContextMenuCss } from './contextMenuStyles';

type ContextMenuGroups = {
    default: Array<ContextMenuItem>;
    node: Array<ContextMenuItem>;
    extra: Array<ContextMenuItem>;
};
type ContextMenuItem = 'download' | 'focus-node' | 'zoom-node' | CustomContextMenuItem;
type CustomContextMenuItem = { label: string; action: () => void };

export class ContextMenu extends _ModuleSupport.BaseModuleInstance implements _ModuleSupport.ModuleInstance {
    public menuRenderer: () => void;
    public itemRenderer: () => void;

    /**
     * Extra menu items with a label and action callback.
     */
    public extraMenuItems: Array<CustomContextMenuItem> = [];

    // Module context
    private tooltipManager: _ModuleSupport.TooltipManager;
    private scene: _Scene.Scene;

    // State
    private groups: ContextMenuGroups;

    // HTML elements
    private canvasElement: HTMLElement;
    private container: HTMLElement;
    private coverElement: HTMLElement;
    private element: HTMLDivElement;
    private menuElement?: HTMLDivElement;
    private observer?: IntersectionObserver;

    // Global shared state
    private static contextMenuDocuments: Document[] = [];

    constructor(readonly ctx: _ModuleSupport.ModuleContext) {
        super();

        // Module context
        this.tooltipManager = ctx.tooltipManager;
        this.scene = ctx.scene;

        const contextMenuHandle = ctx.interactionManager.addListener('contextmenu', (event) =>
            this.onContextMenu(event)
        );
        this.destroyFns.push(() => ctx.interactionManager.removeListener(contextMenuHandle));

        // State
        this.groups = { default: ['download'], node: [], extra: [] };

        // HTML elements
        this.canvasElement = ctx.scene.canvas.element;
        this.container = document.body;

        this.element = this.container.appendChild(document.createElement('div'));
        this.element.classList.add(DEFAULT_CONTEXT_MENU_CLASS);

        this.coverElement = this.container.appendChild(document.createElement('div'));
        this.coverElement.classList.add(`${DEFAULT_CONTEXT_MENU_CLASS}__cover`);
        this.coverElement.onclick = () => this.hide();

        // TODO: hmmm...
        this.coverElement.oncontextmenu = (event) => {
            this.hide();
            event.preventDefault();

            this.show(event.pageX, event.pageY);
        };

        if (window.IntersectionObserver) {
            // Detect when the chart becomes invisible and hide the context menu as well.
            const observer = new IntersectionObserver(
                (entries) => {
                    for (const entry of entries) {
                        if (entry.target === this.canvasElement && entry.intersectionRatio === 0) {
                            this.hide();
                        }
                    }
                },
                { root: this.container }
            );

            observer.observe(this.canvasElement);
            this.observer = observer;
        }

        // Global shared state
        if (ContextMenu.contextMenuDocuments.indexOf(document) < 0) {
            const styleElement = document.createElement('style');
            styleElement.innerHTML = defaultContextMenuCss;
            // Make sure the default context menu style goes before other styles so it can be overridden.
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            ContextMenu.contextMenuDocuments.push(document);
        }

        // User-defined options
        this.menuRenderer = () => {};
        this.itemRenderer = () => {};
    }

    onContextMenu(event: _ModuleSupport.InteractionEvent<'contextmenu'>) {
        const x = event.pageX;
        const y = event.pageY;

        // TODO: detect clicked on marker
        const hasClickedOnMarker = true;
        if (hasClickedOnMarker) {
            this.groups.node = ['focus-node', 'zoom-node'];
        }

        if (this.groups.default.length === 0 && this.groups.node.length === 0 && this.groups.extra.length === 0) return;

        event.consume();
        event.sourceEvent.preventDefault();

        this.show(x, y);
    }

    show(x: number, y: number) {
        const newMenuElement = this.renderMenu();

        if (this.menuElement) {
            this.element.replaceChild(newMenuElement, this.menuElement);
        } else {
            this.element.appendChild(newMenuElement);
        }

        this.element.style.left = `${x + 1}px`;
        this.element.style.top = `calc(${y}px - 0.5em)`;

        this.menuElement = newMenuElement;

        this.tooltipManager.clearAllTooltips();

        this.coverElement.style.display = 'block';
        this.coverElement.style.left = `${this.canvasElement.parentElement?.offsetLeft}px`;
        this.coverElement.style.top = `${this.canvasElement.parentElement?.offsetTop}px`;
        this.coverElement.style.width = `${this.canvasElement.clientWidth}px`;
        this.coverElement.style.height = `${this.canvasElement.clientHeight}px`;
    }

    hide() {
        if (this.menuElement) {
            this.element.removeChild(this.menuElement);
            this.menuElement = undefined;
        }

        this.coverElement.style.display = 'none';
    }

    renderMenu() {
        const menuElement = document.createElement('div');
        menuElement.classList.add(`${DEFAULT_CONTEXT_MENU_CLASS}__menu`);

        this.groups.default.forEach((i) => {
            const item = this.renderItem(i);
            if (item) menuElement.appendChild(item);
        });

        (['node', 'extra'] as Array<keyof ContextMenuGroups>).forEach((group) => {
            if (this.groups[group].length === 0) return;
            menuElement.appendChild(this.createDividerElement());
            this.groups[group].forEach((i) => {
                const item = this.renderItem(i);
                if (item) menuElement.appendChild(item);
            });
        });

        return menuElement;
    }

    renderItem(item: ContextMenuItem): HTMLElement | void {
        switch (item) {
            case 'download':
                return this.createDownloadElement();
            case 'focus-node':
                return this.createFocusNodeElement();
            case 'zoom-node':
                return this.createZoomNodeElement();
        }

        if (item && typeof item === 'object' && item.constructor === Object && item.action && item.label) {
            return this.createCallbackElement(item);
        }
    }

    private createDividerElement(): HTMLElement {
        const el = document.createElement('div');
        el.classList.add(`${DEFAULT_CONTEXT_MENU_CLASS}__divider`);
        return el;
    }

    private createDownloadElement(): HTMLElement {
        return this.createButtonElement('Download', () => {
            // TODO: chart name
            this.scene.download('chart');
        });
    }

    private createFocusNodeElement(): HTMLElement {
        return this.createButtonElement('Focus Node', () => {
            // TODO: call out to zoom module, without the expectation that it has been registered
        });
    }

    private createZoomNodeElement(): HTMLElement {
        return this.createButtonElement('Zoom Node', () => {
            // TODO: call out to zoom module, without the expectation that it has been registered
        });
    }

    private createCallbackElement({ label, action }: CustomContextMenuItem): HTMLElement {
        return this.createButtonElement(label, action);
    }

    private createButtonElement(label: string, callback: () => void): HTMLElement {
        const el = document.createElement('button');
        el.classList.add(`${DEFAULT_CONTEXT_MENU_CLASS}__item`);
        el.innerHTML = label;
        el.onclick = callback;
        return el;
    }

    update() {
        //
    }

    destroy() {
        super.destroy();

        const { parentNode } = this.element;
        if (parentNode) {
            parentNode.removeChild(this.element);
        }

        if (this.observer) {
            this.observer.unobserve(this.canvasElement);
        }
    }
}
