import { Component } from "./component";
import { PositionableFeature, PositionableOptions, ResizableStructure } from "../rendering/features/positionableFeature";
export interface PanelOptions extends PositionableOptions {
    component?: Component;
    hideTitleBar?: boolean | null;
    closable?: boolean | null;
    resizable?: boolean | ResizableStructure;
    title?: string | null;
    cssIdentifier?: string | null;
}
export declare class AgPanel<TConfig extends PanelOptions = PanelOptions> extends Component {
    protected readonly config: TConfig;
    protected static CLOSE_BTN_TEMPLATE: string;
    protected closable: boolean;
    protected closeButtonComp: Component | undefined;
    protected positionableFeature: PositionableFeature;
    close: () => void;
    protected readonly eContentWrapper: HTMLElement;
    protected readonly eTitleBar: HTMLElement;
    protected readonly eTitleBarButtons: HTMLElement;
    protected readonly eTitle: HTMLElement;
    constructor(config: TConfig);
    private static getTemplate;
    protected postConstruct(): void;
    protected renderComponent(): void;
    getHeight(): number | undefined;
    setHeight(height: number | string): void;
    getWidth(): number | undefined;
    setWidth(width: number | string): void;
    setClosable(closable: boolean): void;
    setBodyComponent(bodyComponent: Component): void;
    addTitleBarButton(button: Component, position?: number): void;
    getBodyHeight(): number;
    getBodyWidth(): number;
    setTitle(title: string): void;
    private onBtClose;
    protected destroy(): void;
}
