/// <reference path="../utils.ts" />
/// <reference path="./agList.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../widgets/agPopupService.ts" />

module awk.grid {

    var utils = Utils;
    var svgFactory = SvgFactory.getInstance();

    export class AgDropdownList {

        private itemSelectedListeners: any;
        private eValue: any;
        private agList: any;
        private eGui: any;
        private hidePopupCallback: any;
        private selectedItem: any;
        private cellRenderer: any;
        private popupService: PopupService;

        constructor(popupService: PopupService) {
            this.popupService = popupService;
            this.setupComponents();
            this.itemSelectedListeners = [];
        }

        setWidth(width: any) {
            this.eValue.style.width = width + 'px';
            this.agList.addStyles({width: width + 'px'});
        }

        addItemSelectedListener(listener: any) {
            this.itemSelectedListeners.push(listener);
        }

        fireItemSelected(item: any) {
            for (var i = 0; i < this.itemSelectedListeners.length; i++) {
                this.itemSelectedListeners[i](item);
            }
        }

        setupComponents() {
            this.eGui = document.createElement('span');
            this.eValue = document.createElement('span');
            this.eGui.appendChild(this.eValue);
            this.agList = new AgList();

            this.eValue.addEventListener('click', this.onClick.bind(this));
            this.agList.addItemSelectedListener(this.itemSelected.bind(this));
            this.agList.addCssClass('ag-popup-list');

            utils.addStylesToElement(this.eValue, {
                border: '1px solid darkgrey',
                display: 'inline-block',
                paddingLeft: 2
            });
            utils.addStylesToElement(this.eGui, {position: 'relative'});

            this.agList.addStyles({
                display: 'inline-block',
                position: 'absolute',
                top: 0,
                left: 0,
                backgroudColor: 'white'
            });
        }

        itemSelected(item: any) {
            this.setSelected(item);
            if (this.hidePopupCallback) {
                this.hidePopupCallback();
            }
            this.fireItemSelected(item);
        }

        onClick() {
            var agListGui = this.agList.getGui();
            this.popupService.positionPopup(this.eGui, agListGui, -1);
            this.hidePopupCallback = this.popupService.addAsModalPopup(agListGui, true);
        }

        getGui() {
            return this.eGui;
        }

        setSelected(item: any) {
            this.selectedItem = item;
            this.refreshView();
        }

        setCellRenderer(cellRenderer: any) {
            this.agList.setCellRenderer(cellRenderer);
            this.cellRenderer = cellRenderer;
        }

        refreshView() {
            utils.removeAllChildren(this.eValue);

            if (this.selectedItem) {
                if (this.cellRenderer) {
                    var params = {value: this.selectedItem};
                    utils.useRenderer(this.eValue, this.cellRenderer, params);
                } else {
                    this.eValue.appendChild(document.createTextNode(this.selectedItem));
                }
            }

            var eDownIcon: any = svgFactory.createSmallArrowDownSvg();
            eDownIcon.style.float = 'right';
            eDownIcon.style.marginTop = '6';
            eDownIcon.style.marginRight = '2';

            this.eValue.appendChild(eDownIcon);
        }

        setModel(model: any) {
            this.agList.setModel(model);
        }
    }
}

