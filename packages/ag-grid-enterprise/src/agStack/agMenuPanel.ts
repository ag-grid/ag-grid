import type { AgCoreBeanCollection, BaseEvents, BaseProperties, IPropertiesService } from 'ag-stack';
import { AgTabGuardComp } from 'ag-stack';

import type { IComponent } from 'ag-grid-community';
import { KeyCode } from 'ag-grid-community';

import type { AgMenuItemComponent } from './agMenuItemComponent';

export class AgMenuPanel<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
> extends AgTabGuardComp<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType
> {
    constructor(wrappedComponent: IComponent<any>) {
        super();

        this.setTemplateFromElement(wrappedComponent.getGui(), undefined, undefined, true);
    }

    public postConstruct() {
        this.initialiseTabGuard({
            onTabKeyDown: (e) => this.onTabKeyDown(e),
            handleKeyDown: (e) => this.handleKeyDown(e),
        });
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (e.key === KeyCode.ESCAPE) {
            this.closePanel();
        }
    }

    private onTabKeyDown(e: KeyboardEvent): void {
        if (e.defaultPrevented) {
            return;
        }

        this.closePanel();
        e.preventDefault();
    }

    private closePanel(): void {
        const menuItem = this.parentComponent as unknown as AgMenuItemComponent<
            TBeanCollection,
            TProperties,
            TGlobalEvents,
            TCommon,
            TPropertiesService,
            TComponentSelectorType,
            any
        >;
        menuItem.closeSubMenu();
        setTimeout(() => menuItem.getGui().focus(), 0);
    }
}
