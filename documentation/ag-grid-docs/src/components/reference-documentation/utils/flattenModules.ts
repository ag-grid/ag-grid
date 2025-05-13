import { type CollectionEntry } from 'astro:content';

import type { GridModule } from '../types';

export function flattenModules(modules: CollectionEntry<'moduleMappings'>['data'] | any): GridModule[] {
    if (modules.groups) {
        return modules.groups.map((module: any) => flattenModules(module)).flat();
    }

    if (modules.children) {
        return modules.children.map((child: any) => flattenModules(child)).flat();
    }

    return modules;
}
