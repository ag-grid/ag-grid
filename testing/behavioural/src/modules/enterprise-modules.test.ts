import type { Module } from 'ag-grid-community';
import { AllCommunityModule, _findEnterpriseCoreModule } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

function collectAllModuleNames(modules: Module[] | undefined): Set<string> {
    return new Set<string>([...(modules?.map((m) => m.moduleName) ?? [])]);
}

/**
 * Finds a module by name from a module's dependency tree.
 * @param moduleName - The name of the module to find
 * @param module - The root module to search from
 * @param visited - Set of visited module names to avoid infinite loops
 * @returns The found module or undefined
 */
function findModuleByName(moduleName: string, module: Module, visited: Set<string> = new Set()): Module | undefined {
    if (visited.has(module.moduleName)) {
        return undefined;
    }
    visited.add(module.moduleName);

    if (module.moduleName === moduleName) {
        return module;
    }

    if (module.dependsOn) {
        for (const dep of module.dependsOn) {
            const found = findModuleByName(moduleName, dep, visited);
            if (found) {
                return found;
            }
        }
    }

    return undefined;
}

describe('Enterprise Modules', () => {
    describe('All Enterprise Modules depend on EnterpriseCoreModule', () => {
        // Collect all module names from both Community and Enterprise
        const communityModuleNames = collectAllModuleNames(AllCommunityModule.dependsOn);
        const enterpriseModuleNames = collectAllModuleNames(AllEnterpriseModule.dependsOn);

        // Enterprise-only modules are those in AllEnterpriseModule but not in AllCommunityModule
        const enterpriseOnlyModuleNames = [...enterpriseModuleNames].filter((name) => !communityModuleNames.has(name));

        // Filter out meta-modules and the core module itself
        const modulesToCheck = enterpriseOnlyModuleNames.filter((name) => {
            return name !== 'AllEnterprise' && name !== 'EnterpriseCore' && name !== 'AllCommunity';
        });

        test('enterprise-only modules exist', () => {
            // Sanity check that we found some enterprise-only modules
            expect(modulesToCheck.length).toBeGreaterThan(0);
        });

        test.each(modulesToCheck)('%s depends on EnterpriseCoreModule', (moduleName) => {
            const module = findModuleByName(moduleName, AllEnterpriseModule);

            expect(module).toBeDefined();
            const entCore = _findEnterpriseCoreModule([module!]);
            expect(entCore).toBeDefined();
            expect(entCore?.setLicenseKey).toBeDefined();
        });

        test('EnterpriseCoreModule exists in AllEnterpriseModule dependency tree', () => {
            const entCore = _findEnterpriseCoreModule([AllEnterpriseModule]);
            expect(entCore).toBeDefined();
            expect(entCore?.setLicenseKey).toBeDefined();
        });

        test('Find EnterpriseCoreModule when lots of modules provided', () => {
            const entCore = _findEnterpriseCoreModule([
                ...AllCommunityModule.dependsOn!,
                ...AllEnterpriseModule.dependsOn!,
            ]);
            expect(entCore).toBeDefined();
            expect(entCore?.setLicenseKey).toBeDefined();
        });

        test('Find EnterpriseCoreModule when duplicate modules', () => {
            const entCore = _findEnterpriseCoreModule([
                ...AllCommunityModule.dependsOn!,
                ...AllCommunityModule.dependsOn!,
                ...AllEnterpriseModule.dependsOn!,
                ...AllEnterpriseModule.dependsOn!,
            ]);
            expect(entCore).toBeDefined();
            expect(entCore?.setLicenseKey).toBeDefined();
        });
    });
});
