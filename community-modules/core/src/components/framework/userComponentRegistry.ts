import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { UserComponentName } from '../../context/context';
import { DragAndDropImageComponent } from '../../dragAndDrop/dragAndDropImageComponent';
import { HeaderComp } from '../../headerRendering/cells/column/headerComp';
import { SortIndicatorComp } from '../../headerRendering/cells/column/sortIndicatorComp';
import { HeaderGroupComp } from '../../headerRendering/cells/columnGroup/headerGroupComp';
import { ModuleNames } from '../../modules/moduleNames';
import { AnimateShowChangeCellRenderer } from '../../rendering/cellRenderers/animateShowChangeCellRenderer';
import { AnimateSlideCellRenderer } from '../../rendering/cellRenderers/animateSlideCellRenderer';
import { CheckboxCellRenderer } from '../../rendering/cellRenderers/checkboxCellRenderer';
import { LoadingCellRenderer } from '../../rendering/cellRenderers/loadingCellRenderer';
import { SkeletonCellRenderer } from '../../rendering/cellRenderers/skeletonCellRenderer';
import { LoadingOverlayComponent } from '../../rendering/overlays/loadingOverlayComponent';
import { NoRowsOverlayComponent } from '../../rendering/overlays/noRowsOverlayComponent';
import { TooltipComponent } from '../../rendering/tooltipComponent';
import { _doOnce, _warnOnce } from '../../utils/function';
import { _fuzzySuggestions } from '../../utils/fuzzyMatch';
import { _iterateObject } from '../../utils/object';

export class UserComponentRegistry extends BeanStub implements NamedBean {
    beanName = 'userComponentRegistry' as const;

    private agGridDefaults: { [key in UserComponentName]?: any } = {
        // drag and drop
        agDragAndDropImage: DragAndDropImageComponent,

        //header
        agColumnHeader: HeaderComp,
        agColumnGroupHeader: HeaderGroupComp,
        agSortIndicator: SortIndicatorComp,

        // renderers
        agAnimateShowChangeCellRenderer: AnimateShowChangeCellRenderer,
        agAnimateSlideCellRenderer: AnimateSlideCellRenderer,

        agLoadingCellRenderer: LoadingCellRenderer,
        agSkeletonCellRenderer: SkeletonCellRenderer,
        agCheckboxCellRenderer: CheckboxCellRenderer,

        //overlays
        agLoadingOverlay: LoadingOverlayComponent,
        agNoRowsOverlay: NoRowsOverlayComponent,

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
            _doOnce(() => {
                this.warnAboutMissingComponent(propertyName, name);
            }, 'MissingComp' + name);
        }

        return null;
    }

    private warnAboutMissingComponent(propertyName: string, componentName: string) {
        const validComponents = [
            // Don't include the old names / internals in potential suggestions
            ...Object.keys(this.agGridDefaults).filter(
                (k) => !['agCellEditor', 'agGroupRowRenderer', 'agSortIndicator'].includes(k)
            ),
            ...Object.keys(this.jsComps),
        ];
        const suggestions = _fuzzySuggestions({
            inputValue: componentName,
            allSuggestions: validComponents,
            hideIrrelevant: true,
            filterByPercentageOfBestMatch: 0.8,
        }).values;

        _warnOnce(
            `Could not find '${componentName}' component. It was configured as "${propertyName}: '${componentName}'" but it wasn't found in the list of registered components.`
        );
        if (suggestions.length > 0) {
            _warnOnce(`         Did you mean: [${suggestions.slice(0, 3)}]?`);
        }
        _warnOnce(
            `If using a custom component check it has been registered as described in: ${this.getFrameworkOverrides().getDocLink('components/')}`
        );
    }
}
