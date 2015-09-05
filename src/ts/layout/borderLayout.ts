/// <reference path="../utils.ts" />

module awk.grid {

    var _ = Utils;

    export class BorderLayout {

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

        private eGui: any;
        private id: any;
        private childPanels: any;
        private centerHeightLastTime: any;

        private sizeChangeListners = <any>[];

        constructor(params:any) {

            this.isLayoutPanel = true;

            this.fullHeight = !params.north && !params.south;

            var template: any;
            if (!params.dontFill) {
                if (this.fullHeight) {
                    template =
                        '<div style="height: 100%; overflow: auto; position: relative;">' +
                        '<div id="west" style="height: 100%; float: left;"></div>' +
                        '<div id="east" style="height: 100%; float: right;"></div>' +
                        '<div id="center" style="height: 100%;"></div>' +
                        '<div id="overlay" style="position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
                        '</div>';
                } else {
                    template =
                        '<div style="height: 100%; position: relative;">' +
                        '<div id="north"></div>' +
                        '<div id="centerRow" style="height: 100%; overflow: hidden;">' +
                        '<div id="west" style="height: 100%; float: left;"></div>' +
                        '<div id="east" style="height: 100%; float: right;"></div>' +
                        '<div id="center" style="height: 100%;"></div>' +
                        '</div>' +
                        '<div id="south"></div>' +
                        '<div id="overlay" style="position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
                        '</div>';
                }
                this.layoutActive = true;
            } else {
                template =
                    '<div style="position: relative;">' +
                    '<div id="north"></div>' +
                    '<div id="centerRow">' +
                    '<div id="west"></div>' +
                    '<div id="east"></div>' +
                    '<div id="center"></div>' +
                    '</div>' +
                    '<div id="south"></div>' +
                    '<div id="overlay" style="position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
                    '</div>';
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

            this.setOverlayVisible(false);
        }

        public addSizeChangeListener(listener: Function): void {
            this.sizeChangeListners.push(listener);
        }

        public fireSizeChanged(): void {
            this.sizeChangeListners.forEach( function(listener: Function) {
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

            this.setupPanel(params.overlay, this.eOverlayWrapper);
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

            if (!_.isVisible(this.eGui)) {
                return false;
            }

            var atLeastOneChanged = false;

            var childLayouts = [this.eNorthChildLayout, this.eSouthChildLayout, this.eEastChildLayout, this.eWestChildLayout];
            var that = this;
            _.forEach(childLayouts, function (childLayout: any) {
                var childChangedSize = that.layoutChild(childLayout);
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
        private layoutHeightFullHeight() {
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

        private layoutHeightNormal() {

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

        private layoutWidth() {
            var totalWidth = _.offsetWidth(this.eGui);
            var eastWidth = _.offsetWidth(this.eEastWrapper);
            var westWidth = _.offsetWidth(this.eWestWrapper);

            var centerWidth = totalWidth - eastWidth - westWidth;
            if (centerWidth < 0) {
                centerWidth = 0;
            }

            this.eCenterWrapper.style.width = centerWidth + 'px';
        }

        public setEastVisible(visible: any) {
            if (this.eEastWrapper) {
                this.eEastWrapper.style.display = visible ? '' : 'none';
            }
            this.doLayout();
        }

        public setOverlayVisible(visible: any) {
            if (this.eOverlayWrapper) {
                this.eOverlayWrapper.style.display = visible ? '' : 'none';
            }
            this.doLayout();
        }

        public setSouthVisible(visible: any) {
            if (this.eSouthWrapper) {
                this.eSouthWrapper.style.display = visible ? '' : 'none';
            }
            this.doLayout();
        }
    }
}

