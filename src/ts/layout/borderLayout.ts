import {Utils as _} from '../utils';
import {IOverlayWrapperComp} from '../rendering/overlays/overlayWrapperComponent';


// This should be a component
export class BorderLayout {

    // this is used if there user has not specified any north or south parts
    private static TEMPLATE_FULL_HEIGHT =
        '<div class="ag-bl ag-bl-full-height">' +
        '  <div class="ag-bl-west ag-bl-full-height-west" ref="west"></div>' +
        '  <div class="ag-bl-east ag-bl-full-height-east" ref="east"></div>' +
        '  <div class="ag-bl-center ag-bl-full-height-center" ref="center"></div>' +
        '  <div class="ag-bl-overlay" ref="overlay"></div>' +
        '</div>';

    private static TEMPLATE_NORMAL =
        '<div class="ag-bl ag-bl-normal">' +
        '  <div ref="north"></div>' +
        '  <div class="ag-bl-center-row ag-bl-normal-center-row" ref="centerRow">' +
        '    <div class="ag-bl-west ag-bl-normal-west" ref="west"></div>' +
        '    <div class="ag-bl-east ag-bl-normal-east" ref="east"></div>' +
        '    <div class="ag-bl-center ag-bl-normal-center" ref="center"></div>' +
        '  </div>' +
        '  <div ref="south"></div>' +
        '  <div class="ag-bl-overlay" ref="overlay"></div>' +
        '</div>';

    private static TEMPLATE_DONT_FILL =
        '<div class="ag-bl ag-bl-dont-fill">' +
        '  <div ref="north"></div>' +
        '  <div ref="centerRow" class="ag-bl-center-row ag-bl-dont-fill-center-row">' +
        '    <div ref="west" class="ag-bl-west ag-bl-dont-fill-west"></div>' +
        '    <div ref="east" class="ag-bl-east ag-bl-dont-fill-east"></div>' +
        '    <div ref="center" class="ag-bl-center ag-bl-dont-fill-center"></div>' +
        '  </div>' +
        '  <div ref="south"></div>' +
        '  <div class="ag-bl-overlay" ref="overlay"></div>' +
        '</div>';

    private eNorthWrapper: HTMLElement;
    private eSouthWrapper: HTMLElement;
    private eEastWrapper: HTMLElement;
    private eWestWrapper: HTMLElement;
    private eCenterWrapper: HTMLElement;
    private eOverlayWrapper: HTMLElement;
    private eCenterRow: HTMLElement;

    private eNorthChildLayout: any;
    private eSouthChildLayout: any;
    private eEastChildLayout: any;
    private eWestChildLayout: any;
    private eCenterChildLayout: any;

    private isLayoutPanel: any;
    private fullHeight: any;
    private horizontalLayoutActive: boolean;
    private verticalLayoutActive: boolean;

    private eGui: HTMLElement;
    private id: string;
    private childPanels: any;
    private centerHeightLastTime = -1;
    private centerWidthLastTime = -1;
    private centerLeftMarginLastTime = -1;
    private visibleLastTime = false;

    private sizeChangeListeners = <any>[];

    private overlayWrapper: IOverlayWrapperComp;

    constructor(params: any) {

        this.isLayoutPanel = true;

        this.fullHeight = !params.north && !params.south;

        let template: any;
        if (params.dontFill) {
            template = BorderLayout.TEMPLATE_DONT_FILL;
            this.horizontalLayoutActive = false;
            this.verticalLayoutActive = false;
        } else if (params.fillHorizontalOnly) {
            template = BorderLayout.TEMPLATE_DONT_FILL;
            this.horizontalLayoutActive = true;
            this.verticalLayoutActive = false;
        } else {
            if (this.fullHeight) {
                template = BorderLayout.TEMPLATE_FULL_HEIGHT;
            } else {
                template = BorderLayout.TEMPLATE_NORMAL;
            }
            this.horizontalLayoutActive = true;
            this.verticalLayoutActive = true;
        }

        this.eGui = _.loadTemplate(template);

        this.id = 'borderLayout';
        if (params.name) {
            this.id += '_' + params.name;
        }
        this.eGui.setAttribute('id', this.id);
        this.childPanels = [];

        if (params) {
            this.setupPanels(params);
        }

        if (params.componentRecipes) {
            this.overlayWrapper = params.componentRecipes.newOverlayWrapperComponent();
        }
    }

    public addSizeChangeListener(listener: Function): void {
        this.sizeChangeListeners.push(listener);
    }

    public fireSizeChanged(): void {
        this.sizeChangeListeners.forEach( function(listener: Function) {
            listener();
        });
    }

    // this logic is also in Component.ts - the plan is sometime in the future,
    // this layout panel may (or may not) extend the Component class, and somehow
    // act as a component.
    private getRefElement(refName: string): HTMLElement {
        return <HTMLElement> this.eGui.querySelector('[ref="' + refName + '"]');
    }

    private setupPanels(params: any) {
        this.eNorthWrapper = this.getRefElement('north');
        this.eSouthWrapper = this.getRefElement('south');
        this.eEastWrapper = this.getRefElement('east');
        this.eWestWrapper = this.getRefElement('west');
        this.eCenterWrapper = this.getRefElement('center');
        this.eOverlayWrapper = this.getRefElement('overlay');
        this.eCenterRow = this.getRefElement('centerRow');

        // initially hide the overlay. this is needed for IE10, if we don't hide the overlay,
        // then it grabs mouse events, and it blocks clicking on the grid (as the overlay consumes
        // the mouse events).
        this.eOverlayWrapper.style.display = 'none';

        this.eNorthChildLayout = this.setupPanel(params.north, this.eNorthWrapper);
        this.eSouthChildLayout = this.setupPanel(params.south, this.eSouthWrapper);
        this.eEastChildLayout = this.setupPanel(params.east, this.eEastWrapper);
        this.eWestChildLayout = this.setupPanel(params.west, this.eWestWrapper);
        this.eCenterChildLayout = this.setupPanel(params.center, this.eCenterWrapper);
    }

    private setupPanel(content: any, ePanel: any) {
        if (!ePanel) {
            return;
        }
        if (content) {
            if (content.isLayoutPanel) {
                this.childPanels.push(content);
                ePanel.appendChild(content.getGui());
                return content;
            } else {
                ePanel.appendChild(content);
                return null;
            }
        } else {
            ePanel.parentNode.removeChild(ePanel);
            return null;
        }
    }

    public getGui() {
        return this.eGui;
    }

    // returns true if any item changed size, otherwise returns false
    public doLayout() {

        let isVisible = _.isVisible(this.eGui);
        if (!isVisible) {
            this.visibleLastTime = false;
            return false;
        }

        let atLeastOneChanged = false;

        if (this.visibleLastTime !== isVisible) {
            atLeastOneChanged = true;
        }

        this.visibleLastTime = true;

        let childLayouts = [this.eNorthChildLayout, this.eSouthChildLayout, this.eEastChildLayout, this.eWestChildLayout];
        childLayouts.forEach(childLayout => {
            let childChangedSize = this.layoutChild(childLayout);
            if (childChangedSize) {
                atLeastOneChanged = true;
            }
        });

        if (this.horizontalLayoutActive) {
            let ourWidthChanged = this.layoutWidth();
            if (ourWidthChanged) {
                atLeastOneChanged = true;
            }
        }

        if (this.verticalLayoutActive) {
            let ourHeightChanged = this.layoutHeight();
            if (ourHeightChanged) {
                atLeastOneChanged = true;
            }
        }

        let centerChanged = this.layoutChild(this.eCenterChildLayout);
        if (centerChanged) {
            atLeastOneChanged = true;
        }

        if (atLeastOneChanged) {
            this.fireSizeChanged();
        }

        return atLeastOneChanged;
    }

    private layoutChild(childPanel: any) {
        if (childPanel) {
            return childPanel.doLayout();
        } else {
            return false;
        }
    }

    private layoutHeight() {
        if (this.fullHeight) {
            return this.layoutHeightFullHeight();
        } else {
            return this.layoutHeightNormal();
        }
    }

    // full height never changes the height, because the center is always 100%,
    // however we do check for change, to inform the listeners
    private layoutHeightFullHeight(): boolean {
        let centerHeight = _.offsetHeight(this.eGui);
        if (centerHeight < 0) {
            centerHeight = 0;
        }
        if (this.centerHeightLastTime !== centerHeight) {
            this.centerHeightLastTime = centerHeight;
            return true;
        } else {
            return false;
        }
    }

    private layoutHeightNormal(): boolean {

        let totalHeight = _.offsetHeight(this.eGui);
        let northHeight = _.offsetHeight(this.eNorthWrapper);
        let southHeight = _.offsetHeight(this.eSouthWrapper);

        let centerHeight = totalHeight - northHeight - southHeight;
        if (centerHeight < 0) {
            centerHeight = 0;
        }

        if (this.centerHeightLastTime !== centerHeight) {
            this.eCenterRow.style.height = centerHeight + 'px';
            this.centerHeightLastTime = centerHeight;
            return true; // return true because there was a change
        } else {
            return false;
        }
    }

    public getCentreHeight(): number {
        return this.centerHeightLastTime;
    }

    private layoutWidth(): boolean {
        let totalWidth = _.offsetWidth(this.eGui);
        let eastWidth = _.offsetWidth(this.eEastWrapper);
        let westWidth = _.offsetWidth(this.eWestWrapper);

        let centerWidth = totalWidth - eastWidth - westWidth;
        if (centerWidth < 0) {
            centerWidth = 0;
        }

        let atLeastOneChanged = false;

        if (this.centerLeftMarginLastTime !== westWidth) {
            this.centerLeftMarginLastTime = westWidth;
            this.eCenterWrapper.style.marginLeft = westWidth + 'px';
            atLeastOneChanged = true;
        }

        if (this.centerWidthLastTime !== centerWidth) {
            this.centerWidthLastTime = centerWidth;
            this.eCenterWrapper.style.width = centerWidth + 'px';
            atLeastOneChanged = true;
        }

        return atLeastOneChanged;
    }

    public setEastVisible(visible: any) {
        if (this.eEastWrapper) {
            this.eEastWrapper.style.display = visible ? '' : 'none';
        }
        this.doLayout();
    }

    public showLoadingOverlay() {
        this.overlayWrapper.showLoadingOverlay(this.eOverlayWrapper);
    }

    public showNoRowsOverlay() {
        this.overlayWrapper.showNoRowsOverlay(this.eOverlayWrapper);
    }

    public hideOverlay() {
        this.overlayWrapper.hideOverlay(this.eOverlayWrapper);
    }
}