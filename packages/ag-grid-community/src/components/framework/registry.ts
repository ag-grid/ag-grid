import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import { isComponentMetaFunc } from '../../context/context';
import type { DynamicBeanName, ProcessParamsFunc, UserComponentName } from '../../context/context';
import type { Module } from '../../interfaces/iModule';
import type { IconName, IconValue } from '../../utils/icon';
import { _errMsg } from '../../validation/logging';
import type { AgComponentSelector, ComponentSelector } from '../../widgets/component';

export class Registry extends BeanStub implements NamedBean {
    beanName = 'registry' as const;

    private agGridDefaults: { [key in UserComponentName]?: any } = {};

    private agGridDefaultOverrides: {
        [key in UserComponentName]?: { params?: any; processParams?: ProcessParamsFunc };
    } = {};

    private jsComps: { [key: string]: any } = {};

    private dynamicBeans: { [K in DynamicBeanName]?: new (args?: any[]) => object } = {};

    private selectors: { [name in AgComponentSelector]?: ComponentSelector } = {};

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

        if (dynamicBeans) {
            for (const name of Object.keys(dynamicBeans) as DynamicBeanName[]) {
                this.dynamicBeans[name] = dynamicBeans[name];
            }
        }

        selectors?.forEach((selector) => {
            this.selectors[selector.selector] = selector;
        });

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

    public createDynamicBean<T>(name: DynamicBeanName, mandatory: boolean, ...args: any[]): T | undefined {
        const BeanClass = this.dynamicBeans[name];

        if (BeanClass == null) {
            if (mandatory) {
                throw new Error(this.beans.validation?.missingDynamicBean(name) ?? _errMsg(256));
            }
            return undefined;
        }

        return new BeanClass(...args) as any;
    }

    public getSelector(name: AgComponentSelector): ComponentSelector | undefined {
        return this.selectors[name];
    }

    public getIcon(name: IconName): IconValue | undefined {
        return this.icons[name];
    }
}
