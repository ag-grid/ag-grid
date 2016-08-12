/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.1.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var VerticalStack = (function () {
    function VerticalStack() {
        this.isLayoutPanel = true;
        this.childPanels = [];
        this.eGui = document.createElement('div');
        this.eGui.style.height = '100%';
    }
    VerticalStack.prototype.addPanel = function (panel, height) {
        var component;
        if (panel.isLayoutPanel) {
            this.childPanels.push(panel);
            component = panel.getGui();
        }
        else {
            component = panel;
        }
        if (height) {
            component.style.height = height;
        }
        this.eGui.appendChild(component);
    };
    VerticalStack.prototype.getGui = function () {
        return this.eGui;
    };
    VerticalStack.prototype.doLayout = function () {
        for (var i = 0; i < this.childPanels.length; i++) {
            this.childPanels[i].doLayout();
        }
    };
    return VerticalStack;
})();
exports.VerticalStack = VerticalStack;
