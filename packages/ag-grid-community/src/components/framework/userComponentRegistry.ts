import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection, UserComponentName } from '../../context/context';
import { ModuleNames } from '../../modules/moduleNames';
import { TooltipComponent } from '../../rendering/tooltipComponent';
import { _iterateObject } from '../../utils/object';
import type { ValidationService } from '../../validation/validationService';

export class UserComponentRegistry extends BeanStub implements NamedBean {
    beanName = 'userComponentRegistry' as const;

    private validationService?: ValidationService;

    private agGridDefaults: { [key in UserComponentName]?: any } = {
        // tooltips
        agTooltipComponent: TooltipComponent,
    };

    private agGridDefaultParams: { [key in UserComponentName]?: any } = {};

    /** Used to provide useful error messages if a user is trying to use an enterprise component without loading the module. */
    private enterpriseAgDefaultCompsModule: Record<string, ModuleNames> = {
        agSetColumnFilter: ModuleNames.SetFilterModule,
        agSetColumnFloatingFilter: ModuleNames.SetFilterModule,
        agMultiColumnFilter: ModuleNames.MultiFilterModule,
        agMultiColumnFloatingFilter: ModuleNames.MultiFilterModule,
        agGroupColumnFilter: ModuleNames.RowGroupingModule,
        agGroupColumnFloatingFilter: ModuleNames.RowGroupingModule,
        agGroupCellRenderer: ModuleNames.RowGroupingModule, // Actually in enterprise core as used by MasterDetail too but best guess is they are grouping
        agGroupRowRenderer: ModuleNames.RowGroupingModule, // Actually in enterprise core as used by MasterDetail but best guess is they are grouping
        agRichSelect: ModuleNames.RichSelectModule,
        agRichSelectCellEditor: ModuleNames.RichSelectModule,
        agDetailCellRenderer: ModuleNames.MasterDetailModule,
        agSparklineCellRenderer: ModuleNames.SparklinesModule,
    };

    private jsComps: { [key: string]: any } = {};

    public wireBeans(beans: BeanCollection): void {
        this.validationService = beans.validationService;
    }

    public postConstruct(): void {
        const comps = this.gos.get('components');
        if (comps != null) {
            _iterateObject(comps, (key, component) => this.registerJsComponent(key, component));
        }
    }

    public registerDefaultComponent(name: UserComponentName, component: any, params?: any) {
        this.agGridDefaults[name] = component;
        if (params) {
            this.agGridDefaultParams[name] = params;
        }
    }

    private registerJsComponent(name: string, component: any) {
        this.jsComps[name] = component;
    }

    public retrieve(
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
            this.validationService?.warnAboutMissingComponent(propertyName, name, this.agGridDefaults, this.jsComps);
        }

        return null;
    }
}
