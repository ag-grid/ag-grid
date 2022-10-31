import Vue, { VueConstructor } from 'vue';
import { AgGridVue } from './AgGridVue';
export declare class VueComponentFactory {
    static getComponentType(parent: AgGridVue, component: VueConstructor | string): VueConstructor<Vue> | null;
    static createAndMountComponent(params: any, componentType: any, parent: AgGridVue): any;
    static searchForComponentInstance(parent: AgGridVue, component: VueConstructor | string, maxDepth?: number, suppressError?: boolean): VueConstructor<Vue> | import("vue").FunctionalComponentOptions<Record<string, any>, import("vue/types/options").PropsDefinition<Record<string, any>>> | import("vue").ComponentOptions<never, import("vue/types/options").DefaultData<never>, import("vue/types/options").DefaultMethods<never>, import("vue/types/options").DefaultComputed, Record<string, any>, Record<string, any>> | import("vue/types/options").AsyncComponentPromise<import("vue/types/options").DefaultData<never>, import("vue/types/options").DefaultMethods<never>, import("vue/types/options").DefaultComputed, Record<string, any>> | import("vue/types/options").AsyncComponentFactory<import("vue/types/options").DefaultData<never>, import("vue/types/options").DefaultMethods<never>, import("vue/types/options").DefaultComputed, Record<string, any>> | null;
}
