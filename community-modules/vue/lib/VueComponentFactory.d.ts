import Vue, { VueConstructor } from 'vue';
import { AgGridVue } from './AgGridVue';
export declare class VueComponentFactory {
    static getComponentType(parent: AgGridVue, component: VueConstructor): VueConstructor<Vue> | null;
    static createAndMountComponent(params: any, componentType: any, parent: AgGridVue): any;
}
