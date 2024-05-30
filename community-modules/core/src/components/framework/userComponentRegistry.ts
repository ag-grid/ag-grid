import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import { HeaderComp } from '../../headerRendering/cells/column/headerComp';
import { SortIndicatorComp } from '../../headerRendering/cells/column/sortIndicatorComp';
import { HeaderGroupComp } from '../../headerRendering/cells/columnGroup/headerGroupComp';
import { ModuleNames } from '../../modules/moduleNames';
import { ModuleRegistry } from '../../modules/moduleRegistry';
import { CheckboxCellEditor } from '../../rendering/cellEditors/checkboxCellEditor';
import { DateCellEditor } from '../../rendering/cellEditors/dateCellEditor';
import { DateStringCellEditor } from '../../rendering/cellEditors/dateStringCellEditor';
import { LargeTextCellEditor } from '../../rendering/cellEditors/largeTextCellEditor';
import { NumberCellEditor } from '../../rendering/cellEditors/numberCellEditor';
import { SelectCellEditor } from '../../rendering/cellEditors/selectCellEditor';
import { TextCellEditor } from '../../rendering/cellEditors/textCellEditor';
import { AnimateShowChangeCellRenderer } from '../../rendering/cellRenderers/animateShowChangeCellRenderer';
import { AnimateSlideCellRenderer } from '../../rendering/cellRenderers/animateSlideCellRenderer';
import { CheckboxCellRenderer } from '../../rendering/cellRenderers/checkboxCellRenderer';
import { GroupCellRenderer } from '../../rendering/cellRenderers/groupCellRenderer';
import { LoadingCellRenderer } from '../../rendering/cellRenderers/loadingCellRenderer';
import { SkeletonCellRenderer } from '../../rendering/cellRenderers/skeletonCellRenderer';
import { LoadingOverlayComponent } from '../../rendering/overlays/loadingOverlayComponent';
import { NoRowsOverlayComponent } from '../../rendering/overlays/noRowsOverlayComponent';
import { TooltipComponent } from '../../rendering/tooltipComponent';
import { _doOnce } from '../../utils/function';
import { _fuzzySuggestions } from '../../utils/fuzzyMatch';
import { _iterateObject } from '../../utils/object';
import { AgMenuItemRenderer } from '../../widgets/agMenuItemRenderer';

export class UserComponentRegistry extends BeanStub implements NamedBean {
    beanName = 'userComponentRegistry' as const;

    private agGridDefaults: { [key: string]: any } = {
        //header
        agColumnHeader: HeaderComp,
        agColumnGroupHeader: HeaderGroupComp,
        agSortIndicator: SortIndicatorComp,

        // renderers
        agAnimateShowChangeCellRenderer: AnimateShowChangeCellRenderer,
        agAnimateSlideCellRenderer: AnimateSlideCellRenderer,
        agGroupCellRenderer: GroupCellRenderer,
        agGroupRowRenderer: GroupCellRenderer,
        agLoadingCellRenderer: LoadingCellRenderer,
        agSkeletonCellRenderer: SkeletonCellRenderer,
        agCheckboxCellRenderer: CheckboxCellRenderer,

        //editors
        agCellEditor: TextCellEditor,
        agTextCellEditor: TextCellEditor,
        agNumberCellEditor: NumberCellEditor,
        agDateCellEditor: DateCellEditor,
        agDateStringCellEditor: DateStringCellEditor,
        agSelectCellEditor: SelectCellEditor,
        agLargeTextCellEditor: LargeTextCellEditor,
        agCheckboxCellEditor: CheckboxCellEditor,

        //overlays
        agLoadingOverlay: LoadingOverlayComponent,
        agNoRowsOverlay: NoRowsOverlayComponent,

        // tooltips
        agTooltipComponent: TooltipComponent,

        // menu item
        agMenuItem: AgMenuItemRenderer,
    };

    /** Used to provide useful error messages if a user is trying to use an enterprise component without loading the module. */
    private enterpriseAgDefaultCompsModule: Record<string, ModuleNames> = {
        agSetColumnFilter: ModuleNames.SetFilterModule,
        agSetColumnFloatingFilter: ModuleNames.SetFilterModule,
        agMultiColumnFilter: ModuleNames.MultiFilterModule,
        agMultiColumnFloatingFilter: ModuleNames.MultiFilterModule,
        agGroupColumnFilter: ModuleNames.RowGroupingModule,
        agGroupColumnFloatingFilter: ModuleNames.RowGroupingModule,
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

    public registerDefaultComponent(name: string, component: any) {
        if (this.agGridDefaults[name]) {
            console.error(`Trying to overwrite a default component. You should call registerComponent`);
            return;
        }

        this.agGridDefaults[name] = component;
    }

    private registerJsComponent(name: string, component: any) {
        this.jsComps[name] = component;
    }

    public retrieve(propertyName: string, name: string): { componentFromFramework: boolean; component: any } | null {
        const createResult = (component: any, componentFromFramework: boolean) => ({
            componentFromFramework,
            component,
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

        const defaultComponent = this.agGridDefaults[name];
        if (defaultComponent) {
            return createResult(defaultComponent, false);
        }

        const moduleForComponent = this.enterpriseAgDefaultCompsModule[name];
        if (moduleForComponent) {
            ModuleRegistry.__assertRegistered(
                moduleForComponent,
                `AG Grid '${propertyName}' component: ${name}`,
                this.gridId
            );
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
        const suggestions = _fuzzySuggestions(componentName, validComponents, true, 0.8).values;

        console.warn(
            `AG Grid: Could not find '${componentName}' component. It was configured as "${propertyName}: '${componentName}'" but it wasn't found in the list of registered components.`
        );
        if (suggestions.length > 0) {
            console.warn(`         Did you mean: [${suggestions.slice(0, 3)}]?`);
        }
        console.warn(
            `If using a custom component check it has been registered as described in: ${this.getFrameworkOverrides().getDocLink('components/')}`
        );
    }
}
