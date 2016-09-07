import {Utils as _} from '../utils';

export class BorderLayout {

    private static TEMPLATE_FULL_HEIGHT =
        '<div class="ag-bl ag-bl-full-height">' +
        '  <div class="ag-bl-west ag-bl-full-height-west" id="west"></div>' +
        '  <div class="ag-bl-east ag-bl-full-height-east" id="east"></div>' +
        '  <div class="ag-bl-center ag-bl-full-height-center" id="center"></div>' +
        '  <div class="ag-bl-overlay" id="overlay"></div>' +
        '</div>';

    private static TEMPLATE_NORMAL =
        '<div class="ag-bl ag-bl-normal">' +
        '  <div id="north"></div>' +
        '  <div class="ag-bl-center-row ag-bl-normal-center-row" id="centerRow">' +
        '    <div class="ag-bl-west ag-bl-normal-west" id="west"></div>' +
        '    <div class="ag-bl-east ag-bl-normal-east" id="east"></div>' +
        '    <div class="ag-bl-center ag-bl-normal-center" id="center"></div>' +
        '  </div>' +
        '  <div id="south"></div>' +
        '  <div class="ag-bl-overlay" id="overlay"></div>' +
        '</div>';

    private static TEMPLATE_DONT_FILL =
        '<div class="ag-bl ag-bl-dont-fill">' +
        '  <div id="north"></div>' +
        '  <div id="centerRow">' +
        '    <div id="west"></div>' +
        '    <div id="east"></div>' +
        '    <div id="center"></div>' +
        '  </div>' +
        '  <div id="south"></div>' +
        '  <div class="ag-bl-overlay" id="overlay"></div>' +
        '</div>';

    private eNorthWrapper: any;
    private eSouthWrapper: any;
    private eEastWrapper: any;
    private eWestWrapper: any;
    private eCenterWrapper: any;
    private eOverlayWrapper: any;
    private eCenterRow: any;

    private eNorthChildLayout: any;
    private eSouthChildLayout: any;
    private eEastChildLayout: any;
    private eWestChildLayout: any;
    private eCenterChildLayout: any;

    private isLayoutPanel: any;
    private fullHeight: any;
    private layoutActive: any;

    private eGui: HTMLElement;
    private id: string;
    private childPanels: any;
    private centerHeightLastTime = -1;
    private centerWidthLastTime = -1;
    private centerLeftMarginLastTime = -1;
    private visibleLastTime = false;

    private sizeChangeListeners = <any>[];
    private overlays: any;

    constructor(params: any) {

        this.isLayoutPanel = true;

        this.fullHeight = !params.north && !params.south;

        var template: any;
        if (!params.dontFill) {
            if (this.fullHeight) {
                template = BorderLayout.TEMPLATE_FULL_HEIGHT;
            } else {
                template = BorderLayout.TEMPLATE_NORMAL;
            }
            this.layoutActive = true;
        } else {
            template = BorderLayout.TEMPLATE_DONT_FILL;
            this.layoutActive = false;
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

        this.overlays = params.overlays;
        this.setupOverlays();
    }

    public addSizeChangeListener(listener: Function): void {
        this.sizeChangeListeners.push(listener);
    }

    public fireSizeChanged(): void {
        this.sizeChangeListeners.forEach( function(listener: Function) {
            listener();
        });
    }

    private setupPanels(params: any) {
        this.eNorthWrapper = this.eGui.querySelector('#north');
        this.eSouthWrapper = this.eGui.querySelector('#south');
        this.eEastWrapper = this.eGui.querySelector('#east');
        this.eWestWrapper = this.eGui.querySelector('#west');
        this.eCenterWrapper = this.eGui.querySelector('#center');
        this.eOverlayWrapper = this.eGui.querySelector('#overlay');
        this.eCenterRow = this.eGui.querySelector('#centerRow');

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

        var isVisible = _.isVisible(this.eGui);
        if (!isVisible) {
            this.visibleLastTime = false;
            return false;
        }

        var atLeastOneChanged = false;

        if (this.visibleLastTime !== isVisible) {
            atLeastOneChanged = true;
        }

        this.visibleLastTime = true;

        var childLayouts = [this.eNorthChildLayout, this.eSouthChildLayout, this.eEastChildLayout, this.eWestChildLayout];
        childLayouts.forEach(childLayout => {
            var childChangedSize = this.layoutChild(childLayout);
            if (childChangedSize) {
                atLeastOneChanged = true;
            }
        });

        if (this.layoutActive) {
            var ourHeightChanged = this.layoutHeight();
            var ourWidthChanged = this.layoutWidth();
            if (ourHeightChanged || ourWidthChanged) {
                atLeastOneChanged = true;
            }
        }

        var centerChanged = this.layoutChild(this.eCenterChildLayout);
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
        var centerHeight = _.offsetHeight(this.eGui);
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

        var totalHeight = _.offsetHeight(this.eGui);
        var northHeight = _.offsetHeight(this.eNorthWrapper);
        var southHeight = _.offsetHeight(this.eSouthWrapper);

        var centerHeight = totalHeight - northHeight - southHeight;
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
        var totalWidth = _.offsetWidth(this.eGui);
        var eastWidth = _.offsetWidth(this.eEastWrapper);
        var westWidth = _.offsetWidth(this.eWestWrapper);

        var centerWidth = totalWidth - eastWidth - westWidth;
        if (centerWidth < 0) {
            centerWidth = 0;
        }

        var atLeastOneChanged = false;

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

    private setupOverlays(): void {
        // if no overlays, just remove the panel
        if (!this.overlays) {
            this.eOverlayWrapper.parentNode.removeChild(this.eOverlayWrapper);
            return;
        }

        this.hideOverlay();
    }

    public hideOverlay() {
        _.removeAllChildren(this.eOverlayWrapper);
        this.eOverlayWrapper.style.display = 'none';
    }

    public showOverlay(key: string) {
        var overlay = this.overlays ? this.overlays[key] : null;
        if (overlay) {
            _.removeAllChildren(this.eOverlayWrapper);
            this.eOverlayWrapper.style.display = '';
            this.eOverlayWrapper.appendChild(overlay);
        } else {
            console.log('ag-Grid: unknown overlay');
            this.hideOverlay();
        }
    }

}
