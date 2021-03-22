import { Component, elementGettingCreated } from "../../widgets/component";
import { RefSelector } from "../../widgets/componentAnnotations";
import { PostConstruct } from "../../context/context";
import { RowContainerController, RowContainerView } from "./rowContainerController";

export enum RowContainerNames {
    LEFT = 'left',
    RIGHT = 'right',
    CENTER = 'center',
    FULL_WIDTH = 'fullWidth',

    TOP_LEFT = 'topLeft',
    TOP_RIGHT = 'topRight',
    TOP_CENTER = 'topCenter',
    TOP_FULL_WITH = 'topFullWidth',

    BOTTOM_LEFT = 'bottomLeft',
    BOTTOM_RIGHT = 'bottomRight',
    BOTTOM_CENTER = 'bottomCenter',
    BOTTOM_FULL_WITH = 'bottomFullWidth'
}

const ContainerCssClasses: Map<RowContainerNames, string> = new Map([
    [RowContainerNames.CENTER, 'ag-center-cols-container'],
    [RowContainerNames.LEFT, 'ag-pinned-left-cols-container'],
    [RowContainerNames.RIGHT, 'ag-pinned-right-cols-container'],
    [RowContainerNames.FULL_WIDTH, 'ag-full-width-container'],

    [RowContainerNames.TOP_CENTER, 'ag-floating-top-container'],
    [RowContainerNames.TOP_LEFT, 'ag-pinned-left-floating-top'],
    [RowContainerNames.TOP_RIGHT, 'ag-pinned-right-floating-top'],
    [RowContainerNames.TOP_FULL_WITH, 'ag-floating-top-full-width-container'],

    [RowContainerNames.BOTTOM_CENTER, 'ag-floating-bottom-container'],
    [RowContainerNames.BOTTOM_LEFT, 'ag-pinned-left-floating-bottom'],
    [RowContainerNames.BOTTOM_RIGHT, 'ag-pinned-right-floating-bottom'],
    [RowContainerNames.BOTTOM_FULL_WITH, 'ag-floating-bottom-full-width-container'],
]);

const ViewportCssClasses: Map<RowContainerNames, string> = new Map([
    [RowContainerNames.CENTER, 'ag-center-cols-viewport'],
    [RowContainerNames.TOP_CENTER, 'ag-floating-top-viewport'],
    [RowContainerNames.BOTTOM_CENTER, 'ag-floating-bottom-viewport'],
]);

const ClipperCssClasses: Map<RowContainerNames, string> = new Map([
    [RowContainerNames.CENTER, 'ag-center-cols-clipper'],
]);

function templateFactory(): string {
    const name = elementGettingCreated.getAttribute('name') as RowContainerNames;

    const containerClass = ContainerCssClasses.get(name);
    const viewportClass = ViewportCssClasses.get(name);
    const clipperClass = ClipperCssClasses.get(name);

    let res: string;

    switch (name) {

        case RowContainerNames.LEFT :
        case RowContainerNames.RIGHT :
        case RowContainerNames.FULL_WIDTH :
        case RowContainerNames.TOP_LEFT :
        case RowContainerNames.TOP_RIGHT :
        case RowContainerNames.TOP_FULL_WITH :
        case RowContainerNames.BOTTOM_LEFT :
        case RowContainerNames.BOTTOM_RIGHT :
        case RowContainerNames.BOTTOM_FULL_WITH :
            res = /* html */
            `<div class="${containerClass}" role="presentation" unselectable="on"></div>`
            break;

        case RowContainerNames.CENTER :
            res =  /* html */
            `<div class="${clipperClass}" role="presentation" unselectable="on">
                <div class="${viewportClass}" ref="eViewport" role="presentation">
                    <div class="${containerClass}" ref="eContainer" role="rowgroup" unselectable="on"></div>
                </div>
            </div>`;
            break;

        case RowContainerNames.TOP_CENTER :
        case RowContainerNames.BOTTOM_CENTER :
            res = /* html */
            `<div class="${viewportClass}" role="presentation" unselectable="on">
                <div class="${containerClass}" ref="eContainer" role="presentation" unselectable="on"></div>
            </div>`
            break;

        default: return '';
    }

    return res;
}

export class RowContainerComp extends Component {

    @RefSelector('eViewport') private eViewport: HTMLElement;
    @RefSelector('eContainer') private eContainer: HTMLElement;
    private eColsClipper: HTMLElement;

    private name: string;

    constructor() {
        super(templateFactory());
        this.name = elementGettingCreated.getAttribute('name')!;
    }

    @PostConstruct
    private postConstruct(): void {
        this.setTopLevelElement();

        const view: RowContainerView = {
            setViewportHeight: height => this.eViewport.style.height = height,
        };

        this.createManagedBean(new RowContainerController(view, this.name));
    }

    // because AG Stack doesn't allow putting ref= on the top most element
    private setTopLevelElement(): void {
        switch (this.name) {
            case RowContainerNames.LEFT :
            case RowContainerNames.RIGHT :
            case RowContainerNames.FULL_WIDTH :
            case RowContainerNames.TOP_LEFT :
            case RowContainerNames.TOP_RIGHT :
            case RowContainerNames.TOP_FULL_WITH :
            case RowContainerNames.BOTTOM_LEFT :
            case RowContainerNames.BOTTOM_RIGHT :
            case RowContainerNames.BOTTOM_FULL_WITH :
                this.eContainer = this.getGui();
                break;

            case RowContainerNames.TOP_CENTER :
            case RowContainerNames.BOTTOM_CENTER :
                this.eViewport = this.getGui();
                break;

            case RowContainerNames.CENTER :
                this.eColsClipper = this.getGui();
                break;
        }
    }

    public getColsClipper(): HTMLElement {
        return this.eColsClipper;
    }

    public getViewport(): HTMLElement {
        return this.eViewport;
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }

}