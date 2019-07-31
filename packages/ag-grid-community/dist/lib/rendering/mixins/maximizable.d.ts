// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../widgets/component";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
export declare function Maximizable<T extends {
    new (...args: any[]): any;
}>(target: T): {
    new (...args: any[]): {
        [x: string]: any;
        addDestroyableEventListener(...args: any[]): () => void;
        MAXIMIZE_BTN_TEMPLATE: string;
        config: any;
        position: {
            x: number;
            y: number;
        };
        eTitleBar: HTMLElement;
        offsetElement(x: number, y: number): void;
        gridOptionsWrapper: GridOptionsWrapper;
        isMaximizable: boolean;
        isMaximized: boolean;
        maximizeListeners: (() => void)[];
        maximizeButtonComp: Component;
        maximizeIcon: HTMLElement;
        minimizeIcon: HTMLElement;
        resizeListenerDestroy: () => void;
        lastPosition: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        postConstruct(): void;
        setMaximizable(maximizable: boolean): void;
        toggleMaximize(): void;
        refreshMaximizeIcon(): void;
        clearMaximizebleListeners(): void;
        destroy(): void;
    };
} & T;
