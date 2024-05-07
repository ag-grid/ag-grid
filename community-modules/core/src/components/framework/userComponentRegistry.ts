import { BeanStub } from "../../context/beanStub";
import { Bean, PostConstruct } from "../../context/context";
import { HeaderComp } from "../../headerRendering/cells/column/headerComp";
import { LoadingOverlayComponent } from "../../rendering/overlays/loadingOverlayComponent";
import { NoRowsOverlayComponent } from "../../rendering/overlays/noRowsOverlayComponent";
import { iterateObject } from '../../utils/object';

@Bean('userComponentRegistry')
export class UserComponentRegistry extends BeanStub {

    private agGridDefaults: { [key: string]: any } = {
        //date
        //header
        agColumnHeader: HeaderComp,

        //overlays
        agLoadingOverlay: LoadingOverlayComponent,
        agNoRowsOverlay: NoRowsOverlayComponent,

        // tooltips

        // menu item
    };

    private jsComps: { [key: string]: any } = {};

    @PostConstruct
    private init(): void {
        const comps = this.gos.get('components');
        if (comps != null) {
            iterateObject(comps, (key, component) => this.registerJsComponent(key, component));
        }
    }

    public registerDefaultComponent(name: string, component: any) {

        if (this.agGridDefaults[name]) {
            return;
        }

        this.agGridDefaults[name] = component;
    }

    private registerJsComponent(name: string, component: any) {
        this.jsComps[name] = component;
    }

    public retrieve(propertyName: string, name: string): { componentFromFramework: boolean, component: any } | null {

        const createResult = (component: any, componentFromFramework: boolean) => ({componentFromFramework, component});

        // FrameworkOverrides.frameworkComponent() is used in two locations:
        // 1) for Vue, user provided components get registered via a framework specific way.
        // 2) for React, it's how the React UI provides alternative default components (eg GroupCellRenderer and DetailCellRenderer)
        const registeredViaFrameworkComp = this.getFrameworkOverrides().frameworkComponent(name, this.gos.get('components'));
        if (registeredViaFrameworkComp!=null) {
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
        return null;
    }

}
