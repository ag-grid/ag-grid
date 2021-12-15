import { Component } from "@ag-grid-community/core";

type BeanStub = {
    createBean(bean: any): void;
    destroyBean(bean: any): void;
    addDestroyFunc(fn: () => void): void;
}

export function initialiseAndAttachChildren(parent: BeanStub, childEl: HTMLElement | HTMLElement[],  children: Component[]): void {
    children.forEach((child, index) => {
        parent.createBean(child);
        parent.addDestroyFunc(() => parent.destroyBean(child));
        
        if (childEl instanceof Array) {
            childEl[index].appendChild(child.getGui());
        } else {
            childEl.appendChild(child.getGui());
        }
    });
}
