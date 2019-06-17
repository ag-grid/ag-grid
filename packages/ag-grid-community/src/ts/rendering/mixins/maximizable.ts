import { Component } from "../../widgets/component";
import { PostConstruct } from "../../context/context";
import { IPositionable } from "./positionable";
import { _ } from "../../utils";

export interface IMaximizable extends IPositionable {
    addTitleBarButton(button: Component, position?: number): void;
}

export function Maximizable<T extends { new(...args:any[]): IMaximizable }>(target: T) {
    abstract class MixinClass extends target {

        abstract addDestroyableEventListener(...args: any[]): () => void;

        MAXIMIZE_BTN_TEMPLATE =
        `<div class="ag-dialog-button">
            <span class="ag-icon ag-icon-maximize"></span>
            <span class="ag-icon ag-icon-minimize ag-hidden"></span>
        </span>
        `;

        abstract config: any;
        abstract position: { x: number; y: number; };
        abstract eTitleBar: HTMLElement;
        abstract offsetElement(x: number, y: number): void;

        isMaximizable: boolean = false;
        isMaximized: boolean = false;
        maximizeListeners: (() => void)[] = [];
        maximizeButtonComp: Component;
        resizeListenerDestroy: () => void | null = null;

        lastPosition = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };

        @PostConstruct
        addMiximizer() {
            const { maximizable } = this.config;

            if (maximizable) { this.setMaximizable(maximizable); }
        }

        setMaximizable(maximizable: boolean) {
            if (maximizable === false) {
                this.clearMaximizebleListeners();
                if (this.maximizeButtonComp) {
                    this.maximizeButtonComp.destroy();
                    this.maximizeButtonComp = undefined;
                }
                return;
            }

            const eTitleBar = this.eTitleBar;
            if (!eTitleBar || maximizable === this.isMaximizable) { return; }

            const maximizeButtonComp = this.maximizeButtonComp = new Component(this.MAXIMIZE_BTN_TEMPLATE);
            maximizeButtonComp.addDestroyableEventListener(maximizeButtonComp.getGui(), 'click', this.toggleMaximize.bind(this));
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
            const maximizeButton = this.maximizeButtonComp.getGui();
            const maximizeEl = maximizeButton.querySelector('.ag-icon-maximize') as HTMLElement;
            const minimizeEl = maximizeButton.querySelector('.ag-icon-minimize') as HTMLElement;

            _.addOrRemoveCssClass(maximizeEl, 'ag-hidden', this.isMaximized);
            _.addOrRemoveCssClass(minimizeEl, 'ag-hidden', !this.isMaximized);
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