import type {
    ResizableStructure,
    _AgComponent,
    _AgCoreBeanCollection,
    _BaseEvents,
    _BaseProperties,
    _IPopupService,
    _IPropertiesService,
    _StopPropagationCallbacks,
} from 'ag-grid-community';
import { _AgComponentStub, _AgTabGuardFeature, _findNextFocusableElement, _setDisplayed } from 'ag-grid-community';

import type { AgPanelOptions, AgPanelPostProcessPopupParams } from './agPanel';
import { AgPanel } from './agPanel';

export interface AgDialogOptions<
    TBeanCollection,
    TProperties extends _BaseProperties,
    TGlobalEvents extends _BaseEvents,
    TPanelPostProcessPopupParams extends AgPanelPostProcessPopupParams = AgPanelPostProcessPopupParams,
> extends AgPanelOptions<TBeanCollection, TProperties, TGlobalEvents, TPanelPostProcessPopupParams> {
    eWrapper?: HTMLElement;
    modal?: boolean;
    movable?: boolean;
    alwaysOnTop?: boolean;
    maximizable?: boolean;
    afterGuiAttached?: () => void;
    closedCallback?: (event?: MouseEvent | TouchEvent | KeyboardEvent) => void;
}

export interface AgDialogCallbacks<TBeanCollection, TDialog> {
    stopPropagationCallbacks: _StopPropagationCallbacks;

    focusNextContainer(beans: TBeanCollection, backwards: boolean): boolean;

    configureFocusableContainer(beans: TBeanCollection, dialog: TDialog): void;
}

export class AgDialog<
    TBeanCollection extends _AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends _BaseProperties,
    TGlobalEvents extends _BaseEvents,
    TCommon,
    TPropertiesService extends _IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
    TDialogOptions extends AgDialogOptions<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        AgPanelPostProcessPopupParams
    > = AgDialogOptions<TBeanCollection, TProperties, TGlobalEvents, AgPanelPostProcessPopupParams>,
> extends AgPanel<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    TDialogOptions
> {
    private popupSvc?: _IPopupService<any>;

    public wireBeans(beans: TBeanCollection) {
        this.popupSvc = beans.popupSvc;
    }

    private tabGuardFeature: _AgTabGuardFeature<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService
    >;
    private isMaximizable: boolean = false;
    private isMaximized: boolean = false;
    private readonly maximizeListeners: (() => void)[] = [];
    private maximizeButtonComp: _AgComponent<TBeanCollection, TProperties, TGlobalEvents, any> | undefined;
    private maximizeIcon: Element | undefined;
    private minimizeIcon: Element | undefined;
    private resizeListenerDestroy: (() => void) | null | undefined = null;

    private readonly lastPosition = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };

    constructor(
        config: TDialogOptions,
        private readonly callbacks?: AgDialogCallbacks<
            TBeanCollection,
            AgDialog<
                TBeanCollection,
                TProperties,
                TGlobalEvents,
                TCommon,
                TPropertiesService,
                TComponentSelectorType,
                TDialogOptions
            >
        >
    ) {
        super({ ...config, popup: true });
    }

    public override postConstruct() {
        const eGui = this.getGui();
        const { movable, resizable, maximizable, modal } = this.config;

        this.addCss('ag-dialog');

        super.postConstruct();

        this.tabGuardFeature = this.createManagedBean(
            new _AgTabGuardFeature(this, this.callbacks?.stopPropagationCallbacks)
        );
        this.tabGuardFeature.initialiseTabGuard({
            isFocusableContainer: true,
            onFocusIn: () => {
                this.popupSvc?.bringPopupToFront(eGui);
            },
            onTabKeyDown: (e) => {
                if (modal) {
                    return;
                }
                const backwards = e.shiftKey;
                const nextFocusableElement = _findNextFocusableElement(this.beans, eGui, false, backwards);
                if (!nextFocusableElement || this.tabGuardFeature.getTabGuardCtrl().isTabGuard(nextFocusableElement)) {
                    if (this.callbacks?.focusNextContainer(this.beans, backwards)) {
                        e.preventDefault();
                    }
                }
            },
        });

        if (movable) {
            this.setMovable(movable);
        }
        if (maximizable) {
            this.setMaximizable(maximizable);
        }
        if (resizable) {
            this.setResizable(resizable);
        }

        if (!this.config.modal) {
            this.callbacks?.configureFocusableContainer(this.beans, this);
        }
    }

    public setAllowFocus(allowFocus: boolean): void {
        this.tabGuardFeature.getTabGuardCtrl().setAllowFocus(allowFocus);
    }

    protected override renderComponent() {
        const eGui = this.getGui();
        const { alwaysOnTop, modal, title, afterGuiAttached } = this.config;
        const translate = this.getLocaleTextFunc();

        const addPopupRes = this.popupSvc?.addPopup({
            modal,
            eChild: eGui,
            closeOnEsc: true,
            closedCallback: this.onClosed.bind(this),
            alwaysOnTop,
            ariaLabel: title || translate('ariaLabelDialog', 'Dialog'),
            afterGuiAttached,
        });

        if (addPopupRes) {
            this.close = addPopupRes.hideFunc;
        }
    }

    private onClosed(event?: MouseEvent | TouchEvent | KeyboardEvent): void {
        this.destroy();
        this.config.closedCallback?.(event);
    }

    public setMaximized(maximized: boolean): void {
        if (this.isMaximizable && maximized !== this.isMaximized) {
            this.toggleMaximize();
        }
    }

    private toggleMaximize() {
        const position = this.positionableFeature.getPosition();
        if (this.isMaximized) {
            const { x, y, width, height } = this.lastPosition;
            this.setWidth(width);
            this.setHeight(height);
            this.positionableFeature.offsetElement(x, y);
        } else {
            this.lastPosition.width = this.getWidth()!;
            this.lastPosition.height = this.getHeight()!;
            this.lastPosition.x = position.x;
            this.lastPosition.y = position.y;
            this.positionableFeature.offsetElement(0, 0);
            this.setHeight('100%');
            this.setWidth('100%');
        }

        this.isMaximized = !this.isMaximized;
        this.refreshMaximizeIcon();
    }

    private refreshMaximizeIcon() {
        _setDisplayed(this.maximizeIcon!, !this.isMaximized);
        _setDisplayed(this.minimizeIcon!, this.isMaximized);
    }

    private clearMaximizebleListeners() {
        if (this.maximizeListeners.length) {
            for (const destroyListener of this.maximizeListeners) {
                destroyListener();
            }
            this.maximizeListeners.length = 0;
        }

        if (this.resizeListenerDestroy) {
            this.resizeListenerDestroy();
            this.resizeListenerDestroy = null;
        }
    }

    public override destroy(): void {
        this.maximizeButtonComp = this.destroyBean(this.maximizeButtonComp);

        this.clearMaximizebleListeners();
        super.destroy();
    }

    public setResizable(resizable: boolean | ResizableStructure) {
        this.positionableFeature.setResizable(resizable);
    }

    public setMovable(movable: boolean) {
        this.positionableFeature.setMovable(movable, this.eTitleBar);
    }

    public setMaximizable(maximizable: boolean) {
        if (!maximizable) {
            this.clearMaximizebleListeners();

            if (this.maximizeButtonComp) {
                this.destroyBean(this.maximizeButtonComp);
                this.maximizeButtonComp = this.maximizeIcon = this.minimizeIcon = undefined;
            }
            return;
        }

        const eTitleBar = this.eTitleBar;

        if (!eTitleBar || maximizable === this.isMaximizable) {
            return;
        }

        this.isMaximizable = maximizable;

        const maximizeButtonComp = this.buildMaximizeAndMinimizeElements();
        this.refreshMaximizeIcon();

        maximizeButtonComp.addManagedElementListeners(maximizeButtonComp.getGui(), {
            click: this.toggleMaximize.bind(this),
        });

        this.addTitleBarButton(maximizeButtonComp, 0);

        this.maximizeListeners.push(
            ...this.addManagedElementListeners(eTitleBar, {
                dblclick: this.toggleMaximize.bind(this),
            })
        );

        [this.resizeListenerDestroy] = this.addManagedListeners(this.positionableFeature, {
            resize: () => {
                this.isMaximized = false;
                this.refreshMaximizeIcon();
            },
        });
    }

    private buildMaximizeAndMinimizeElements(): _AgComponent<TBeanCollection, TProperties, TGlobalEvents, any> {
        const maximizeButtonComp = (this.maximizeButtonComp = this.createBean<
            _AgComponent<TBeanCollection, TProperties, TGlobalEvents, any>
        >(new _AgComponentStub({ tag: 'div', cls: 'ag-dialog-button' })));

        const eGui = maximizeButtonComp.getGui();

        const iconSvc = this.beans.iconSvc;
        this.maximizeIcon = iconSvc.createIconNoSpan('maximize')!;
        eGui.appendChild(this.maximizeIcon);
        this.maximizeIcon.classList.add('ag-panel-title-bar-button-icon');

        this.minimizeIcon = iconSvc.createIconNoSpan('minimize')!;
        eGui.appendChild(this.minimizeIcon);
        this.minimizeIcon.classList.add('ag-panel-title-bar-button-icon');

        return maximizeButtonComp;
    }
}
