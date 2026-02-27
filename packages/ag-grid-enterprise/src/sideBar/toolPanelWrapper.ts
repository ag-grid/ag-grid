import type {
    ComponentType,
    ElementParams,
    IToolPanelComp,
    IToolPanelParams,
    ToolPanelDef,
    UserCompDetails,
    UserComponentFactory,
} from 'ag-grid-community';
import { Component, RefPlaceholder } from 'ag-grid-community';

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
    private width: number | undefined;
    private params: IToolPanelParams;
    private animationId: number = 0;

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

    public getToolPanelId(): string {
        return this.toolPanelId;
    }

    public setToolPanelDef(toolPanelDef: ToolPanelDef, params: IToolPanelParams): boolean {
        const { id, minWidth, maxWidth, width } = toolPanelDef;

        this.toolPanelId = id;
        this.width = width;

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

        const width = this.width;
        if (width) {
            this.getGui().style.width = `${width}px`;
        }
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

        const eGui = this.getGui();

        const savedInlineWidth = eGui.style.width;
        const durationStr = getComputedStyle(eGui).getPropertyValue('--ag-side-bar-panel-animation-duration').trim();
        this.setDisplayed(displayed);

        if (!parseFloat(durationStr)) {
            return;
        }

        const id = ++this.animationId;
        const { eContent } = this;

        eGui.classList.add('ag-tool-panel-animating');
        const fullWidth = eGui.offsetWidth;
        const fromWidth = displayed ? 0 : fullWidth;
        const toWidth = displayed ? fullWidth : 0;

        eContent.style.minWidth = `${fullWidth}px`;

        // disable transition, force reflow, and re-enable to synchronously start an animation
        eGui.style.transition = 'none';
        eGui.style.width = `${fromWidth}px`;
        const _ = eGui.offsetWidth;
        eGui.style.transition = '';

        eGui.style.width = `${toWidth}px`;

        const cleanup = () => {
            if (this.animationId === id) {
                eGui.classList.remove('ag-tool-panel-animating');
                eContent.style.minWidth = '';
                eGui.style.width = savedInlineWidth;
            }
        };

        // Don't rely on the transition end event alone for cleanup because
        // transitions might have been disabled by application or user CSS
        // Note: the timeout needs to be long enough to fire after the transitionstart event
        const fallbackTimeout = setTimeout(cleanup, 100);
        eGui.addEventListener('transitionstart', () => clearTimeout(fallbackTimeout), { once: true });
        eGui.addEventListener('transitionend', cleanup, { once: true });
    }
}
