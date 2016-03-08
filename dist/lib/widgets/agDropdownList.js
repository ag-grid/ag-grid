/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var svgFactory_1 = require("../svgFactory");
var agList_1 = require("./agList");
var svgFactory = svgFactory_1.SvgFactory.getInstance();
var AgDropdownList = (function () {
    function AgDropdownList(popupService, dragAndDropService) {
        this.popupService = popupService;
        this.setupComponents(dragAndDropService);
        this.itemSelectedListeners = [];
    }
    AgDropdownList.prototype.setWidth = function (width) {
        this.eValue.style.width = width + 'px';
        this.agList.addStyles({ width: width + 'px' });
    };
    AgDropdownList.prototype.addItemSelectedListener = function (listener) {
        this.itemSelectedListeners.push(listener);
    };
    AgDropdownList.prototype.fireItemSelected = function (item) {
        for (var i = 0; i < this.itemSelectedListeners.length; i++) {
            this.itemSelectedListeners[i](item);
        }
    };
    AgDropdownList.prototype.setupComponents = function (dragAndDropService) {
        this.eGui = document.createElement('span');
        this.eValue = document.createElement('span');
        this.eGui.appendChild(this.eValue);
        this.agList = new agList_1.AgList(dragAndDropService);
        this.eValue.addEventListener('click', this.onClick.bind(this));
        this.agList.addItemSelectedListener(this.itemSelected.bind(this));
        this.agList.addCssClass('ag-popup-list');
        utils_1.Utils.addStylesToElement(this.eValue, {
            border: '1px solid darkgrey',
            display: 'inline-block',
            paddingLeft: 2
        });
        utils_1.Utils.addStylesToElement(this.eGui, { position: 'relative' });
        this.agList.addStyles({
            display: 'inline-block',
            position: 'absolute',
            top: 0,
            left: 0,
            backgroudColor: 'white'
        });
    };
    AgDropdownList.prototype.itemSelected = function (item) {
        this.setSelected(item);
        if (this.hidePopupCallback) {
            this.hidePopupCallback();
        }
        this.fireItemSelected(item);
    };
    AgDropdownList.prototype.onClick = function () {
        var agListGui = this.agList.getGui();
        this.popupService.positionPopupUnderComponent({ eventSource: this.eGui, ePopup: agListGui });
        this.hidePopupCallback = this.popupService.addAsModalPopup(agListGui, true);
    };
    AgDropdownList.prototype.getGui = function () {
        return this.eGui;
    };
    AgDropdownList.prototype.setSelected = function (item) {
        this.selectedItem = item;
        this.refreshView();
    };
    AgDropdownList.prototype.setCellRenderer = function (cellRenderer) {
        this.agList.setCellRenderer(cellRenderer);
        this.cellRenderer = cellRenderer;
    };
    AgDropdownList.prototype.refreshView = function () {
        utils_1.Utils.removeAllChildren(this.eValue);
        if (this.selectedItem) {
            if (this.cellRenderer) {
                var params = { value: this.selectedItem };
                utils_1.Utils.useRenderer(this.eValue, this.cellRenderer, params);
            }
            else {
                this.eValue.appendChild(document.createTextNode(this.selectedItem));
            }
        }
        var eDownIcon = svgFactory.createSmallArrowDownSvg();
        eDownIcon.style.float = 'right';
        eDownIcon.style.marginTop = '6';
        eDownIcon.style.marginRight = '2';
        this.eValue.appendChild(eDownIcon);
    };
    AgDropdownList.prototype.setModel = function (model) {
        this.agList.setModel(model);
    };
    return AgDropdownList;
})();
exports.AgDropdownList = AgDropdownList;
