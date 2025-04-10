import type { GridBodyComp } from '../gridBodyComp/gridBodyComp';
import { GridBodySelector } from '../gridBodyComp/gridBodyComp';
import type { FocusableContainer } from '../interfaces/iFocusableContainer';
import type { ISideBar } from '../interfaces/iSideBar';
import type { UpdateLayoutClassesParams } from '../styling/layoutFeature';
import { LayoutCssClasses } from '../styling/layoutFeature';
import type { ElementParams } from '../utils/dom';
import { _isVisible } from '../utils/dom';
import { _logIfDebug } from '../utils/function';
import type { ComponentSelector } from '../widgets/component';
import { RefPlaceholder } from '../widgets/component';
import type { Component } from '../widgets/component';
import { TabGuardComp } from '../widgets/tabGuardComp';
import type { IGridComp, OptionalGridComponents } from './gridCtrl';
import { GridCtrl } from './gridCtrl';

export class GridComp extends TabGuardComp {
    private readonly gridBody: GridBodyComp = RefPlaceholder;
    private readonly sideBar: ISideBar & Component = RefPlaceholder;
    private readonly pagination: TabGuardComp = RefPlaceholder;
    private readonly rootWrapperBody: HTMLElement = RefPlaceholder;

    private eGridDiv: HTMLElement;

    constructor(eGridDiv: HTMLElement) {
        super();
        this.eGridDiv = eGridDiv;
    }

    public postConstruct(): void {
        const compProxy: IGridComp = {
            destroyGridUi: () => this.destroyBean(this),
            setRtlClass: (cssClass: string) => this.addCss(cssClass),
            forceFocusOutOfContainer: this.forceFocusOutOfContainer.bind(this),
            updateLayoutClasses: this.updateLayoutClasses.bind(this),
            getFocusableContainers: this.getFocusableContainers.bind(this),
            setUserSelect: (value) => {
                this.getGui().style.userSelect = value != null ? value : '';
                this.getGui().style.webkitUserSelect = value != null ? value : '';
            },
            setCursor: (value) => {
                this.getGui().style.cursor = value != null ? value : '';
            },
        };

        const ctrl = this.createManagedBean(new GridCtrl());
        const comps = ctrl.getOptionalSelectors();
        const template = this.createTemplate(comps);
        const requiredComps = [GridBodySelector, ...Object.values(comps).filter((c) => !!c)] as ComponentSelector[];
        this.setTemplate(template, requiredComps);

        ctrl.setComp(compProxy, this.eGridDiv, this.getGui());

        this.insertGridIntoDom();

        this.initialiseTabGuard({
            // we want to override the default behaviour to do nothing for onTabKeyDown
            onTabKeyDown: () => undefined,
            focusInnerElement: (fromBottom) => ctrl.focusInnerElement(fromBottom),
            forceFocusOutWhenTabGuardsAreEmpty: true,
            isEmpty: () => !ctrl.isFocusable(),
        });
    }

    private insertGridIntoDom(): void {
        const eGui = this.getGui();
        this.eGridDiv.appendChild(eGui);
        this.addDestroyFunc(() => {
            this.eGridDiv.removeChild(eGui);
            _logIfDebug(this.gos, 'Grid removed from DOM');
        });
    }

    private updateLayoutClasses(cssClass: string, params: UpdateLayoutClassesParams): void {
        const eRootWrapperBodyClassList = this.rootWrapperBody.classList;
        const { AUTO_HEIGHT, NORMAL, PRINT } = LayoutCssClasses;
        const { autoHeight, normal, print } = params;
        eRootWrapperBodyClassList.toggle(AUTO_HEIGHT, autoHeight);
        eRootWrapperBodyClassList.toggle(NORMAL, normal);
        eRootWrapperBodyClassList.toggle(PRINT, print);

        this.toggleCss(AUTO_HEIGHT, autoHeight);
        this.toggleCss(NORMAL, normal);
        this.toggleCss(PRINT, print);
    }

    private createTemplate(params: OptionalGridComponents): ElementParams {
        const dropZones: ElementParams | null = params.gridHeaderDropZonesSelector
            ? { tag: 'ag-grid-header-drop-zones' }
            : null;
        const sideBar: ElementParams | null = params.sideBarSelector
            ? {
                  tag: 'ag-side-bar',
                  ref: 'sideBar',
              }
            : null;
        const statusBar: ElementParams | null = params.statusBarSelector ? { tag: 'ag-status-bar' } : null;
        const watermark: ElementParams | null = params.watermarkSelector ? { tag: 'ag-watermark' } : null;
        const pagination: ElementParams | null = params.paginationSelector
            ? { tag: 'ag-pagination', ref: 'pagination' }
            : null;

        return {
            tag: 'div',
            cls: 'ag-root-wrapper',
            role: 'presentation',
            children: [
                dropZones,
                {
                    tag: 'div',
                    ref: 'rootWrapperBody',
                    cls: 'ag-root-wrapper-body',
                    role: 'presentation',
                    children: [{ tag: 'ag-grid-body', ref: 'gridBody' }, sideBar],
                },
                statusBar,
                pagination,
                watermark,
            ],
        };
    }

    public override getFocusableElement(): HTMLElement {
        return this.rootWrapperBody;
    }

    public override forceFocusOutOfContainer(up: boolean = false): void {
        if (!up && this.pagination?.isDisplayed()) {
            this.pagination.forceFocusOutOfContainer(up);
            return;
        }
        super.forceFocusOutOfContainer(up);
    }

    protected getFocusableContainers(): FocusableContainer[] {
        const focusableContainers: FocusableContainer[] = [this.gridBody];

        [this.sideBar, this.pagination].forEach((comp) => {
            if (comp) {
                focusableContainers.push(comp);
            }
        });

        return focusableContainers.filter((el) => _isVisible(el.getGui()));
    }
}
