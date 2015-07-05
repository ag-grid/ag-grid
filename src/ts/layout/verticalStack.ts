module awk.grid {

    export class VerticalStack {

        isLayoutPanel: any;
        childPanels: any;
        eGui: any;

        constructor() {
            this.isLayoutPanel = true;
            this.childPanels = [];
            this.eGui = document.createElement('div');
            this.eGui.style.height = '100%';
        }

        addPanel(panel: any, height: any) {
            var component: any;
            if (panel.isLayoutPanel) {
                this.childPanels.push(panel);
                component = panel.getGui();
            } else {
                component = panel;
            }

            if (height) {
                component.style.height = height;
            }
            this.eGui.appendChild(component);
        }

        getGui() {
            return this.eGui;
        }

        doLayout() {
            for (var i = 0; i < this.childPanels.length; i++) {
                this.childPanels[i].doLayout();
            }
        }
    }
}

