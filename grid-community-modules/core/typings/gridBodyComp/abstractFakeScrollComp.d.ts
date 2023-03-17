import { CtrlsService } from "../ctrlsService";
import { Component } from "../widgets/component";
import { ScrollVisibleService } from "./scrollVisibleService";
export declare abstract class AbstractFakeScrollComp extends Component {
    private readonly direction;
    protected readonly eViewport: HTMLElement;
    protected readonly eContainer: HTMLElement;
    protected readonly scrollVisibleService: ScrollVisibleService;
    protected readonly ctrlsService: CtrlsService;
    protected invisibleScrollbar: boolean;
    protected hideTimeout: number | null;
    protected abstract setScrollVisible(): void;
    constructor(template: string, direction: 'horizontal' | 'vertical');
    protected postConstruct(): void;
    protected initialiseInvisibleScrollbar(): void;
    protected addActiveListenerToggles(): void;
    protected onScrollVisibilityChanged(): void;
    protected hideAndShowInvisibleScrollAsNeeded(): void;
    getViewport(): HTMLElement;
    getContainer(): HTMLElement;
}
