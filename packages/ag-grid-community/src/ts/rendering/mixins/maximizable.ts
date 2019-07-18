import { Component } from "../../widgets/component";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { _ } from "../../utils";

export function Maximizable<T extends { new(...args:any[]): any }>(target: T) {
    abstract class MixinClass extends target {

        abstract addDestroyableEventListener(...args: any[]): () => void;

        MAXIMIZE_BTN_TEMPLATE = `<div class="ag-dialog-button"></span>`;

        abstract config: any;
        abstract position: { x: number; y: number; };
        abstract eTitleBar: HTMLElement;
        abstract offsetElement(x: number, y: number): void;
        abstract gridOptionsWrapper: GridOptionsWrapper;

        isMaximizable: boolean = false;
        isMaximized: boolean = false;
        maximizeListeners: (() => void)[] = [];
        maximizeButtonComp: Component;
        maximizeIcon: HTMLElement;
        minimizeIcon: HTMLElement;

        resizeListenerDestroy: () => void | null = null;

        lastPosition = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };

        postConstruct() {
            super.postConstruct();
            const { maximizable } = this.config;

            if (maximizable) { this.setMaximizable(maximizable); }
        }

        public setMaximizable(maximizable: boolean) {

            if (maximizable === false) {
                this.clearMaximizebleListeners();

                if (this.maximizeButtonComp) {
                    this.maximizeButtonComp.destroy();
                    this.maximizeButtonComp = this.maximizeIcon = this.minimizeIcon = undefined;
                }
                return;
            }

            const eTitleBar = this.eTitleBar;
            if (!eTitleBar || maximizable === this.isMaximizable) { return; }

            const maximizeButtonComp = this.maximizeButtonComp = new Component(this.MAXIMIZE_BTN_TEMPLATE);
            this.getContext().wireBean(maximizeButtonComp);

            const eGui = maximizeButtonComp.getGui();
            eGui.appendChild(this.maximizeIcon = _.createIconNoSpan('maximize', this.gridOptionsWrapper));
            eGui.appendChild(this.minimizeIcon = _.createIconNoSpan('minimize', this.gridOptionsWrapper));
            _.addCssClass(this.minimizeIcon, 'ag-hidden');

            maximizeButtonComp.addDestroyableEventListener(eGui, 'click', this.toggleMaximize.bind(this));
            this.addTitleBarButton(maximizeButtonComp, 0);

            this.maximizeListeners.push(
                this.addDestroyableEventListener(eTitleBar, 'dblclick', this.toggleMaximize.bind(this))
            );

            this.resizeListenerDestroy = this.addDestroyableEventListener(this, 'resize', () => {
                this.isMaximized = false;
                this.refreshMaximizeIcon();
            });
        }

        toggleMaximize() {
            if (this.isMaximized) {
                const {x, y, width, height } = this.lastPosition;

                this.setWidth(width);
                this.setHeight(height);
                this.offsetElement(x, y);
            } else {
                this.lastPosition.width = this.getWidth();
                this.lastPosition.height = this.getHeight();
                this.lastPosition.x = this.position.x;
                this.lastPosition.y = this.position.y;
                this.offsetElement(0, 0);
                this.setHeight(Infinity);
                this.setWidth(Infinity);
            }

            this.isMaximized = !this.isMaximized;
            this.refreshMaximizeIcon();
        }

        refreshMaximizeIcon() {
            _.addOrRemoveCssClass(this.maximizeIcon, 'ag-hidden', this.isMaximized);
            _.addOrRemoveCssClass(this.minimizeIcon, 'ag-hidden', !this.isMaximized);
        }

        clearMaximizebleListeners() {
            if (this.maximizeListeners.length) {
                this.maximizeListeners.forEach(destroyListener => destroyListener());
                this.maximizeListeners.length = 0;
            }

            if (this.resizeListenerDestroy) {
                this.resizeListenerDestroy();
                this.resizeListenerDestroy = null;
            }
        }

        destroy() {
            super.destroy();
            if (this.maximizeButtonComp) {
                this.maximizeButtonComp.destroy();
                this.maximizeButtonComp = undefined;
            }

            this.clearMaximizebleListeners();
        }
    }

    return MixinClass;
}