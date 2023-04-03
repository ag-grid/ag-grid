import { _ModuleSupport, _Scene } from 'ag-charts-community';

import { DEFAULT_CONTEXT_MENU_CLASS, defaultContextMenuCss } from './contextMenuStyles';

type ContextMenuGroups = {
    default: Array<ContextMenuItem>;
    node: Array<ContextMenuItem>;
    extra: Array<ContextMenuItem>;
};
type ContextMenuItem = 'download' | ContextMenuAction;
type ContextMenuAction = { id?: string; label: string; action: (params: ContextMenuActionParams) => void };
export type ContextMenuActionParams = { datum?: any; event: MouseEvent };

const TOOLTIP_ID = 'context-menu';

export class ContextMenu extends _ModuleSupport.BaseModuleInstance implements _ModuleSupport.ModuleInstance {
    /**
     * Extra menu actions with a label and callback.
     */
    public extraActions: Array<ContextMenuAction> = [];

    // Module context
    private scene: _Scene.Scene;
    private tooltipManager: _ModuleSupport.TooltipManager;

    // State
    private groups: ContextMenuGroups;
    private showEvent?: MouseEvent;

    // HTML elements
    private canvasElement: HTMLElement;
    private container: HTMLElement;
    private coverElement: HTMLElement;
    private element: HTMLDivElement;
    private menuElement?: HTMLDivElement;
    private observer?: IntersectionObserver;

    // Global shared state
    private static contextMenuDocuments: Document[] = [];
    private static defaultActions: Array<ContextMenuAction> = [];
    private static nodeActions: Array<ContextMenuAction> = [];
    private static disabledActions: Set<string> = new Set();

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
        this.groups = { default: [], node: [], extra: [] };

        // HTML elements
        this.canvasElement = ctx.scene.canvas.element;
        this.container = document.body;

        this.element = this.container.appendChild(document.createElement('div'));
        this.element.classList.add(DEFAULT_CONTEXT_MENU_CLASS);
        this.destroyFns.push(() => this.element.parentNode?.removeChild(this.element));

        this.coverElement = this.container.appendChild(document.createElement('div'));
        this.coverElement.classList.add(`${DEFAULT_CONTEXT_MENU_CLASS}__cover`);

        // TODO: hmmm...
        this.coverElement.onclick = () => this.hide();
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

        ContextMenu.registerDefaultAction({
            id: 'download',
            label: 'Download',
            action: () => {
                // TODO: chart name
                this.scene.download('chart');
            },
        });
    }

    public static registerDefaultAction(action: ContextMenuAction) {
        if (action.id && this.defaultActions.find(({ id }) => id === action.id)) {
            return;
        }
        this.defaultActions.push(action);
    }

    public static registerNodeAction(action: ContextMenuAction) {
        if (action.id && this.defaultActions.find(({ id }) => id === action.id)) {
            return;
        }
        this.nodeActions.push(action);
    }

    public static enableAction(actionId: string) {
        this.disabledActions.delete(actionId);
    }

    public static disableAction(actionId: string) {
        this.disabledActions.add(actionId);
    }

    private onContextMenu(event: _ModuleSupport.InteractionEvent<'contextmenu'>) {
        this.showEvent = event.sourceEvent as MouseEvent;

        const x = event.pageX;
        const y = event.pageY;

        this.groups.default = [...ContextMenu.defaultActions];

        // TODO: detect clicked on marker
        const hasClickedOnMarker = true;
        if (hasClickedOnMarker) {
            this.groups.node = [...ContextMenu.nodeActions];
        }

        if (this.extraActions.length > 0) {
            this.groups.extra = [...this.extraActions];
        }

        const { default: def, extra, node } = this.groups;
        const groupCount = def.length + node.length + extra.length;

        if (groupCount === 0) return;

        event.consume();
        event.sourceEvent.preventDefault();

        this.show(x, y);
    }

    public show(x: number, y: number) {
        if (!this.coverElement) return;

        const newMenuElement = this.renderMenu();

        if (this.menuElement) {
            this.element.replaceChild(newMenuElement, this.menuElement);
        } else {
            this.element.appendChild(newMenuElement);
        }

        // TODO: contain within the window
        const pinned: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'top-left';
        switch (pinned) {
            case 'top-left':
                this.element.style.left = `${x + 1}px`;
                this.element.style.top = `calc(${y}px - 0.5em)`;
                break;

            case 'top-right':
                this.element.style.right = `calc(100% - ${x - 1}px)`;
                this.element.style.top = `calc(${y}px - 0.5em)`;
                break;

            case 'bottom-left':
                this.element.style.left = `${x + 1}px`;
                this.element.style.bottom = `calc(100% - ${y}px - 0.5em)`;
                break;

            case 'bottom-right':
                this.element.style.right = `calc(100% - ${x - 1}px)`;
                this.element.style.bottom = `calc(100% - ${y}px - 0.5em)`;
                break;
        }

        this.menuElement = newMenuElement;

        this.tooltipManager.updateTooltip(TOOLTIP_ID);

        this.coverElement.style.display = 'block';
        this.coverElement.style.left = `${this.canvasElement.parentElement?.offsetLeft}px`;
        this.coverElement.style.top = `${this.canvasElement.parentElement?.offsetTop}px`;
        this.coverElement.style.width = `${this.canvasElement.clientWidth}px`;
        this.coverElement.style.height = `${this.canvasElement.clientHeight}px`;
    }

    public hide() {
        if (this.menuElement) {
            this.element.removeChild(this.menuElement);
            this.menuElement = undefined;
        }

        this.tooltipManager.removeTooltip(TOOLTIP_ID);

        this.coverElement.style.display = 'none';
    }

    public renderMenu() {
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

    public renderItem(item: ContextMenuItem): HTMLElement | void {
        if (item && typeof item === 'object' && item.constructor === Object && item.action && item.label) {
            return this.createActionElement(item);
        }
    }

    private createDividerElement(): HTMLElement {
        const el = document.createElement('div');
        el.classList.add(`${DEFAULT_CONTEXT_MENU_CLASS}__divider`);
        return el;
    }

    private createActionElement({ id, label, action }: ContextMenuAction): HTMLElement {
        if (id && ContextMenu.disabledActions.has(id)) {
            return this.createDisabledElement(label);
        }
        return this.createButtonElement(label, action);
    }

    private createButtonElement(label: string, callback: (params: ContextMenuActionParams) => void): HTMLElement {
        const el = document.createElement('button');
        el.classList.add(`${DEFAULT_CONTEXT_MENU_CLASS}__item`);
        el.innerHTML = label;
        el.onclick = () => {
            const params: ContextMenuActionParams = {
                event: this.showEvent!,
            };
            callback(params);
            this.hide();
        };
        return el;
    }

    private createDisabledElement(label: string): HTMLElement {
        const el = document.createElement('button');
        el.classList.add(`${DEFAULT_CONTEXT_MENU_CLASS}__item`);
        el.disabled = true;
        el.innerHTML = label;
        return el;
    }

    public update() {
        //
    }

    public destroy() {
        super.destroy();

        if (this.observer) {
            this.observer.unobserve(this.canvasElement);
        }
    }
}
