import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { vi } from 'vitest';

vi.stubGlobal('appLocation', {});
vi.stubGlobal('startFile', {});
vi.stubGlobal('boilerplatePath', {});
vi.stubGlobal('systemJsMap', {});
vi.stubGlobal('systemJsPaths', {});
vi.stubGlobal('window', {
    location: {
        search: '',
    },
    addEventListener: () => {},
});

const systemjsFiles = [];
const entries = readdirSync(__dirname, { withFileTypes: true });
entries.forEach((entry) => {
    if (entry.isDirectory()) {
        const dir = join(__dirname, entry.name);

        const entries = readdirSync(dir, { withFileTypes: true });
        const files = entries
            .filter((file) => file.isFile())
            .filter((file) => file.name.includes('systemjs.config.'))
            .map((file) => join(dir, file.name));
        systemjsFiles.push(...files);
    }
});

describe('Test cases for SystemJs Mappings', () => {
    systemjsFiles.forEach((file, i) => {
        test(`file is ${file}`, async () => {
            // capture the config supplied to System.config
            let config = {};
            vi.stubGlobal('System', {
                config: (conf) => {
                    config = conf;
                },
                import: () => ({
                    catch: () => {},
                }),
            });

            const load = () => import(file);
            await load();

            Object.keys(config.packages)
                .filter((key) => key.startsWith('ag-') || key.startsWith('@ag-'))
                .forEach((key) => {
                    // we dont specify main in prod files as they're often not necessary - use default
                    let mainFile = config.packages[key].main || './dist/package/main.cjs.js';

                    // angular packages are in dist/angular - that is what will be published
                    if (key.includes('angular')) {
                        mainFile = `./dist/${key}/${mainFile}`;
                    }
                    expect(
                        existsSync(join(__dirname, `../../../../node_modules/${key}/${mainFile}`)),
                        key
                    ).toBeTruthy();
                });
        });
    });
});
