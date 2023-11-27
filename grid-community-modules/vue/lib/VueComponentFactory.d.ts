import Vue, { AsyncComponent, VueConstructor } from 'vue';
import { AgGridVue } from './AgGridVue';
import { Component } from 'vue/types/options';
export declare class VueComponentFactory {
    static getComponentType(parent: AgGridVue, component: VueConstructor | string): VueConstructor<Vue> | null;
    static createAndMountComponent(params: any, componentType: any, parent: AgGridVue): any;
    static searchForComponentInstance(parent: AgGridVue, component: VueConstructor | string, maxDepth?: number, suppressError?: boolean): Component<import("vue/types/options").DefaultData<never>, import("vue/types/options").DefaultMethods<never>, import("vue/types/options").DefaultComputed, import("vue/types/options").DefaultProps> | AsyncComponent<import("vue/types/options").DefaultData<never>, import("vue/types/options").DefaultMethods<never>, import("vue/types/options").DefaultComputed, import("vue/types/options").DefaultProps> | null;
}
