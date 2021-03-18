import {Autowired, PostConstruct} from "./context/context";
import {GridApi} from "./gridApi";
import {RowRenderer} from "./rendering/rowRenderer";
import {PopupService} from "./widgets/popupService";
import {FocusController} from "./focusController";
import {IToolPanel} from "./interfaces/iToolPanel";
import {SideBarDef} from "./entities/sideBar";
import {BeanStub} from "./context/beanStub";
import {GridCompService} from "./gridCompService";

export interface CompView {
}

export interface GridCompView extends CompView {
    refreshSideBar(): void;
    getToolPanelInstance(key: string): IToolPanel | undefined;
    ensureNodeVisible(comparator: any, position: string | null): void;
    isSideBarVisible(): boolean;
    setSideBarVisible(show: boolean): void;
    setSideBarPosition(position: 'left' | 'right'): void;
    openToolPanel(key: string): void;
    closeToolPanel(): void;
    getOpenedToolPanel(): string | null;
    getSideBar(): SideBarDef;
    setSideBar(def: SideBarDef | string | boolean): void;
    isToolPanelShowing(): boolean;
    destroyGridUi(): void;
    getRootGui(): HTMLElement;
}

export class CompController<V extends CompView> extends BeanStub {

    protected view: V;

    constructor(view: V) {
        super();
        this.view = view;
    }

    @PostConstruct
    protected postConstruct(): void {
    }
}

export class GridCompController extends CompController<GridCompView> {

    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('focusController') protected readonly focusController: FocusController;
    @Autowired('gridCompService') protected readonly gridCompService: GridCompService;

    constructor(view: GridCompView) {
        super(view);
    }

    protected postConstruct(): void {
        super.postConstruct();

        // register with services that need grid core
        [
            this.gridApi,
            this.gridCompService
            // this.popupService,
            // this.focusController
        ].forEach(service => service.registerGridCompController(this));

    }

    public refreshSideBar(): void {
        this.view.refreshSideBar();
    }

    public getToolPanelInstance(key: string): IToolPanel | undefined {
        return this.view.getToolPanelInstance(key);
    }

    public ensureNodeVisible(comparator: any, position: string | null): void {
        this.view.ensureNodeVisible(comparator, position);
    }

    public isSideBarVisible(): boolean {
        return this.view.isSideBarVisible();
    }

    public setSideBarVisible(show: boolean): void {
        this.view.setSideBarVisible(show);
    }

    public setSideBarPosition(position: 'left' | 'right'): void {
        this.view.setSideBarPosition(position);
    }

    public openToolPanel(key: string): void {
        this.view.openToolPanel(key);
    }

    public closeToolPanel(): void {
        this.view.closeToolPanel();
    }

    public getOpenedToolPanel(): string | null {
        return this.view.getOpenedToolPanel();
    }

    public getSideBar(): SideBarDef {
        return this.view.getSideBar();
    }

    public setSideBar(def: SideBarDef | string | boolean): void {
        this.view.setSideBar(def);
    }

    public isToolPanelShowing(): boolean {
        return this.view.isToolPanelShowing();
    }

    public destroyGridUi(): void {
        this.view.destroyGridUi();
    }

    public getRootGui(): HTMLElement {
        return this.view.getRootGui();
    }
}
