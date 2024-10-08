import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { DynamicBeanMeta, DynamicBeanName, UserComponentName } from '../../context/context';
import type { Module, ModuleName } from '../../interfaces/iModule';
import { TooltipComponent } from '../../rendering/tooltipComponent';
import { _iterateObject } from '../../utils/object';
import { _logWarn } from '../../validation/logging';
import type { AgComponentSelector, ComponentSelector } from '../../widgets/component';

export class Registry extends BeanStub implements NamedBean {
    beanName = 'registry' as const;

    private agGridDefaults: { [key in UserComponentName]?: any } = {
        // tooltips
        agTooltipComponent: TooltipComponent,
    };

    private agGridDefaultParams: { [key in UserComponentName]?: any } = {};

    /** Used to provide useful error messages if a user is trying to use an enterprise component without loading the module. */
    private enterpriseAgDefaultCompsModule: Record<string, ModuleName> = {
        agSetColumnFilter: 'SetFilterModule',
        agSetColumnFloatingFilter: 'SetFilterModule',
        agMultiColumnFilter: 'MultiFilterModule',
        agMultiColumnFloatingFilter: 'MultiFilterModule',
        agGroupColumnFilter: 'RowGroupingModule',
        agGroupColumnFloatingFilter: 'RowGroupingModule',
        agGroupCellRenderer: 'RowGroupingModule', // Actually in enterprise core as used by MasterDetail too but best guess is they are grouping
        agGroupRowRenderer: 'RowGroupingModule', // Actually in enterprise core as used by MasterDetail but best guess is they are grouping
        agRichSelect: 'RichSelectModule',
        agRichSelectCellEditor: 'RichSelectModule',
        agDetailCellRenderer: 'MasterDetailModule',
        agSparklineCellRenderer: 'SparklinesModule',
    };

    private jsComps: { [key: string]: any } = {};

    private dynamicBeans: { [K in DynamicBeanName]?: new (args?: any[]) => object } = {};

    private selectors: { [name in AgComponentSelector]?: ComponentSelector } = {};

    public postConstruct(): void {
        const comps = this.gos.get('components');
        if (comps != null) {
            _iterateObject(comps, (key, component) => this.registerJsComponent(key, component));
        }
    }

    public registerModule(module: Module): void {
        module.userComponents?.forEach(({ name, classImp, params }) =>
            this.registerUserComponent(name, classImp, params)
        );

        module.dynamicBeans?.forEach((meta) => this.registerDynamicBean(meta));

        module.selectors?.forEach((selector) => this.registerSelector(selector));
    }

    private registerUserComponent(name: UserComponentName, component: any, params?: any) {
        this.agGridDefaults[name] = component;
        if (params) {
            this.agGridDefaultParams[name] = params;
        }
    }

    private registerJsComponent(name: string, component: any) {
        this.jsComps[name] = component;
    }

    public getUserComponent(
        propertyName: string,
        name: string
    ): { componentFromFramework: boolean; component: any; params?: any } | null {
        const createResult = (component: any, componentFromFramework: boolean, params?: any) => ({
            componentFromFramework,
            component,
            params,
        });

        // FrameworkOverrides.frameworkComponent() is used in two locations:
        // 1) for Vue, user provided components get registered via a framework specific way.
        // 2) for React, it's how the React UI provides alternative default components (eg GroupCellRenderer and DetailCellRenderer)
        const registeredViaFrameworkComp = this.getFrameworkOverrides().frameworkComponent(
            name,
            this.gos.get('components')
        );
        if (registeredViaFrameworkComp != null) {
            return createResult(registeredViaFrameworkComp, true);
        }

        const jsComponent = this.jsComps[name];
        if (jsComponent) {
            const isFwkComp = this.getFrameworkOverrides().isFrameworkComponent(jsComponent);
            return createResult(jsComponent, isFwkComp);
        }

        const defaultComponent = this.agGridDefaults[name as UserComponentName];
        if (defaultComponent) {
            return createResult(defaultComponent, false, this.agGridDefaultParams[name as UserComponentName]);
        }

        const moduleForComponent = this.enterpriseAgDefaultCompsModule[name];
        if (moduleForComponent) {
            this.gos.assertModuleRegistered(moduleForComponent, `AG Grid '${propertyName}' component: ${name}`);
        } else {
            _logWarn(101, {
                propertyName,
                componentName: name,
                agGridDefaults: this.agGridDefaults,
                jsComps: this.jsComps,
            });
        }

        return null;
    }

    private registerDynamicBean(meta: DynamicBeanMeta): void {
        this.dynamicBeans[meta.name] = meta.classImp;
    }

    public createDynamicBean<T>(name: DynamicBeanName, ...args: any[]): T | undefined {
        const BeanClass = this.dynamicBeans[name];

        if (BeanClass == null) {
            return undefined;
        }

        return new BeanClass(...args) as any;
    }

    private registerSelector(selector: ComponentSelector): void {
        this.selectors[selector.selector] = selector;
    }

    public getSelector(name: AgComponentSelector): ComponentSelector | undefined {
        return this.selectors[name];
    }
}
