import { RefPlaceholder, _initDetachedStyledRoot, _setDisplayed } from 'ag-stack';

import type {
    ComponentType,
    ElementParams,
    IToolPanelComp,
    IToolPanelParams,
    ToolPanelDef,
    UserCompDetails,
    UserComponentFactory,
} from 'ag-grid-community';
import { Component } from 'ag-grid-community';

import { AgHorizontalResize } from './agHorizontalResize';

function getToolPanelCompDetails(
    userCompFactory: UserComponentFactory,
    toolPanelDef: ToolPanelDef,
    params: IToolPanelParams
): UserCompDetails<IToolPanelComp> | undefined {
    return userCompFactory.getCompDetails(toolPanelDef, ToolPanelComponent, undefined, params, true);
}

const ToolPanelComponent: ComponentType = {
    name: 'toolPanel',
    optionalMethods: ['refresh', 'getState'],
};

const ToolPanelElement: ElementParams = {
    tag: 'div',
    cls: 'ag-tool-panel-wrapper',
    role: 'tabpanel',
    children: [
        {
            tag: 'div',
            cls: 'ag-tool-panel-content',
            ref: 'eContent',
        },
    ],
};

export class ToolPanelWrapper extends Component {
    private readonly eContent: HTMLElement = RefPlaceholder;
    private toolPanelCompInstance: IToolPanelComp | undefined;
    private toolPanelId: string;
    private resizeBar: AgHorizontalResize;
    private params: IToolPanelParams;
    private animationId: number = 0;
    private defParent: HTMLElement | null = null;
    private hasStyledRoot = false;

    constructor() {
        super(ToolPanelElement);
    }

    public postConstruct(): void {
        const eGui = this.getGui();
        const resizeBar = (this.resizeBar = this.createManagedBean(new AgHorizontalResize()));

        eGui.setAttribute('id', `ag-${this.getCompId()}`);

        resizeBar.elementToResize = eGui;
        this.appendChild(resizeBar);
    }

    public ensureStyledRoot(): void {
        if (this.hasStyledRoot) {
            return;
        }
        this.hasStyledRoot = true;
        const innerGui = this.getGui();
        const [styledRootOuter, styledRootDestroy] = _initDetachedStyledRoot(this.beans.environment, innerGui);
        this.addDestroyFunc(styledRootDestroy);
        // transfer displayed state the new root
        const displayed = this.isDisplayed();
        _setDisplayed(innerGui, true);
        this.setGui(styledRootOuter);
        this.setDisplayed(displayed);
    }

    public getToolPanelId(): string {
        return this.toolPanelId;
    }

    public getDefParent(): HTMLElement | null {
        return this.defParent;
    }

    public setDefParent(parent: HTMLElement | null): void {
        this.defParent = parent;
    }

    public setToolPanelDef(toolPanelDef: ToolPanelDef, params: IToolPanelParams): boolean {
        const { id, minWidth, maxWidth, width, parent } = toolPanelDef;

        this.toolPanelId = id;
        this.defParent = parent ?? null;

        if (width) {
            this.getGui().style.setProperty('--ag-side-bar-panel-width', `${width}px`);
        }

        const compDetails = getToolPanelCompDetails(this.beans.userCompFactory, toolPanelDef, params);
        if (compDetails == null) {
            return false;
        }

        const componentPromise = compDetails.newAgStackInstance();
        this.params = compDetails.params;

        componentPromise.then(this.setToolPanelComponent.bind(this));

        const resizeBar = this.resizeBar;
        if (minWidth != null) {
            resizeBar.minWidth = minWidth;
        }

        if (maxWidth != null) {
            resizeBar.maxWidth = maxWidth;
        }

        return true;
    }

    private setToolPanelComponent(compInstance: IToolPanelComp): void {
        this.toolPanelCompInstance = compInstance;

        const { eContent } = this;
        eContent.appendChild(compInstance.getGui());
        this.addDestroyFunc(() => {
            this.destroyBean(compInstance);
        });
    }

    public getToolPanelInstance(): IToolPanelComp | undefined {
        return this.toolPanelCompInstance;
    }

    public setResizerSizerSide(side: 'right' | 'left') {
        const isRtl = this.gos.get('enableRtl');
        const isLeft = side === 'left';
        const inverted = isRtl ? isLeft : !isLeft;

        this.resizeBar.inverted = inverted;
    }

    public refresh(): void {
        this.toolPanelCompInstance?.refresh(this.params);
    }

    public animateDisplayed(displayed: boolean): void {
        if (this.isDisplayed() === displayed) {
            return;
        }
        const id = ++this.animationId;
        const { eContent } = this;

        const cleanup = () => {
            if (this.animationId === id) {
                eGui.classList.remove('ag-tool-panel-animating');
                eContent.style.width = '';
                eGui.style.width = '';
            }
        };

        const eGui = this.getGui();
        const currentWrapperWidth = eGui.offsetWidth;

        this.setDisplayed(displayed);
        eGui.classList.add('ag-tool-panel-animating');

        const durationStr = getComputedStyle(eGui).transitionDuration;
        if (!parseFloat(durationStr)) {
            cleanup();
            return;
        }

        // Cancel any existing transition and start a new one
        eGui.style.transition = 'none';
        eGui.style.width = '';
        eContent.style.width = `${eContent.offsetWidth}px`;
        eGui.style.width = `${currentWrapperWidth}px`;
        const _ = eGui.offsetWidth; // force a layout to set transition start
        eGui.style.transition = '';
        eGui.style.width = displayed ? '' : '0'; // animate to intended width

        // Don't rely on the transition end event alone for cleanup because
        // transitions might have been disabled by application or user CSS
        // Note: the timeout needs to be long enough to fire after the transitionstart event
        const fallbackTimeout = setTimeout(cleanup, 100);
        eGui.addEventListener('transitionstart', () => clearTimeout(fallbackTimeout), { once: true });
        eGui.addEventListener('transitionend', cleanup, { once: true });
    }
}
