import { BaseRegistry } from '../../agStack/core/baseRegistry';
import type { AgBaseComponent } from '../../agStack/interfaces/agComponent';
import type { NamedBean } from '../../context/bean';
import { isComponentMetaFunc } from '../../context/context';
import type { BeanCollection, DynamicBeanName, ProcessParamsFunc, UserComponentName } from '../../context/context';
import type { AgEventTypeParams } from '../../events';
import type { GridOptionsWithDefaults } from '../../gridOptionsDefault';
import type { GridOptionsService } from '../../gridOptionsService';
import type { AgGridCommon } from '../../interfaces/iCommon';
import type { Module } from '../../interfaces/iModule';
import type { IconName, IconValue } from '../../utils/icon';
import { _errMsg } from '../../validation/logging';
import type { AgComponentSelectorType, ComponentSelector } from '../../widgets/component';

export class Registry
    extends BaseRegistry<
        BeanCollection,
        GridOptionsWithDefaults,
        AgEventTypeParams,
        AgGridCommon<any, any>,
        GridOptionsService,
        DynamicBeanName
    >
    implements NamedBean
{
    private agGridDefaults: { [key in UserComponentName]?: any } = {};

    private agGridDefaultOverrides: {
        [key in UserComponentName]?: { params?: any; processParams?: ProcessParamsFunc };
    } = {};

    private jsComps: { [key: string]: any } = {};

    private selectors: { [name in AgComponentSelectorType]?: ComponentSelector<any> } = {};

    private icons: { [K in IconName]?: IconValue } = {};

    public postConstruct(): void {
        const comps = this.gos.get('components');
        if (comps != null) {
            for (const key of Object.keys(comps)) {
                this.jsComps[key] = comps[key];
            }
        }
    }

    public registerModule(module: Module): void {
        const { icons, userComponents, dynamicBeans, selectors } = module;

        if (userComponents) {
            const registerUserComponent = (
                name: UserComponentName,
                component: any,
                params?: any,
                processParams?: ProcessParamsFunc
            ) => {
                this.agGridDefaults[name] = component;
                if (params || processParams) {
                    this.agGridDefaultOverrides[name] = { params, processParams };
                }
            };
            for (const name of Object.keys(userComponents) as UserComponentName[]) {
                let comp = userComponents[name]!;
                if (isComponentMetaFunc(comp)) {
                    comp = comp.getComp(this.beans);
                }
                if (typeof comp === 'object') {
                    const { classImp, params, processParams } = comp;
                    registerUserComponent(name, classImp, params, processParams);
                } else {
                    registerUserComponent(name, comp);
                }
            }
        }

        this.registerDynamicBeans(dynamicBeans);

        for (const selector of selectors ?? []) {
            this.selectors[selector.selector] = selector;
        }

        if (icons) {
            for (const name of Object.keys(icons) as IconName[]) {
                this.icons[name] = icons[name];
            }
        }
    }

    public getUserComponent(
        propertyName: string,
        name: string
    ): { componentFromFramework: boolean; component: any; params?: any; processParams?: ProcessParamsFunc } | null {
        const createResult = (
            component: any,
            componentFromFramework: boolean,
            params?: any,
            processParams?: ProcessParamsFunc
        ) => ({
            componentFromFramework,
            component,
            params,
            processParams,
        });

        const { frameworkOverrides } = this.beans;

        // FrameworkOverrides.frameworkComponent() is used in two locations:
        // 1) for Vue, user provided components get registered via a framework specific way.
        // 2) for React, it's how the React UI provides alternative default components (eg GroupCellRenderer and DetailCellRenderer)
        const registeredViaFrameworkComp = frameworkOverrides.frameworkComponent(name, this.gos.get('components'));
        if (registeredViaFrameworkComp != null) {
            return createResult(registeredViaFrameworkComp, true);
        }

        const jsComponent = this.jsComps[name];
        if (jsComponent) {
            const isFwkComp = frameworkOverrides.isFrameworkComponent(jsComponent);
            return createResult(jsComponent, isFwkComp);
        }

        const defaultComponent = this.agGridDefaults[name as UserComponentName];
        if (defaultComponent) {
            const overrides = this.agGridDefaultOverrides[name as UserComponentName];
            return createResult(defaultComponent, false, overrides?.params, overrides?.processParams);
        }

        this.beans.validation?.missingUserComponent(propertyName, name, this.agGridDefaults, this.jsComps);

        return null;
    }

    public getSelector<TComponent extends AgBaseComponent<BeanCollection>>(
        name: AgComponentSelectorType
    ): ComponentSelector<TComponent> | undefined {
        return this.selectors[name];
    }

    public getIcon(name: IconName): IconValue | undefined {
        return this.icons[name];
    }

    protected override getDynamicError(name: DynamicBeanName, init: boolean): string {
        if (init) {
            return _errMsg(279, { name });
        }
        return this.beans.validation?.missingDynamicBean(name) ?? _errMsg(256);
    }
}
