import { describe, expect, it, vi } from 'vitest';

import type { AgGraphBean } from '../core/agBeanGraph';
import { createBeanList } from '../core/agBeanList';

// Runs without a DOM environment on purpose: the code under test must work headless.

interface TestBeans {
    [beanName: string]: unknown;
}

const beanClass = (beanName: string) =>
    class {
        beanName = beanName;
    } as unknown as new () => AgGraphBean<TestBeans>;

const source = (...names: string[]) => ({ beans: names.map(beanClass) });
const names = (list: readonly AgGraphBean<TestBeans>[]) => list.map((bean) => bean.beanName);

describe('the bean list', () => {
    it("keeps a contributor's beans in the order it declared them", () => {
        expect(names(createBeanList<TestBeans>([source('a', 'b', 'c')]))).toEqual(['a', 'b', 'c']);
    });

    it("takes a later contributor's bean under a name an earlier one used", () => {
        const first = beanClass('registry');
        const second = beanClass('registry');
        const list = createBeanList<TestBeans>([{ beans: [first] }, { beans: [second] }]);

        expect(list).toHaveLength(1);
        expect(list[0]).toBeInstanceOf(second);
    });

    it('reports a bean with no beanName instead of registering it', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        const Nameless = class {} as unknown as new () => AgGraphBean<TestBeans>;

        const list = createBeanList<TestBeans>([{ beans: [Nameless, beanClass('registry')] }]);

        expect(names(list)).toEqual(['registry']);
        expect(error).toHaveBeenCalledWith(expect.stringContaining('is missing beanName'));
        error.mockRestore();
    });

    it('pulls a named bean to the front', () => {
        const list = createBeanList<TestBeans>([source('a', 'licenseManager', 'b')], ['licenseManager']);

        expect(names(list)).toEqual(['licenseManager', 'a', 'b']);
    });

    // Destruction runs in reverse, so a bean torn down first must be built after every contributor.
    it('pushes a named bean behind every contributor, not just its own', () => {
        const core = source('licenseManager', 'widgetSvc', 'instanceMgr', 'apiSvc');
        const instanceModule = source('aiSvc');

        const list = createBeanList<TestBeans>([core, instanceModule], ['licenseManager'], ['instanceMgr', 'apiSvc']);

        expect(names(list)).toEqual(['licenseManager', 'widgetSvc', 'aiSvc', 'instanceMgr', 'apiSvc']);
    });

    it('holds the order given for the ends, not the order registered', () => {
        const list = createBeanList<TestBeans>([source('apiSvc', 'instanceMgr', 'a')], [], ['instanceMgr', 'apiSvc']);

        expect(names(list)).toEqual(['a', 'instanceMgr', 'apiSvc']);
    });

    it('ignores a name nothing registered', () => {
        expect(names(createBeanList<TestBeans>([source('a')], ['nope'], ['alsoNope']))).toEqual(['a']);
    });
});
