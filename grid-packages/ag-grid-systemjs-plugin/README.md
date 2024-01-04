# ag-grid-systemjs-plugin

> _SystemJS plugin for loading TypeScript/JSX/CSS source files_

## Usage

Embed the script in your HTML entry point, after the SystemJS `s.js` or `system.js` script:

```
<script src="path/to/systemjs/dist/system.js" />
<script src="path/to/ag-grid-systemjs-plugin/dist/index.js"/>
```

This will enforce the following behavior when loading SystemJS modules:

- All TypeScript/JSX source files will be transformed via the Babel plugins specified in the [bundled Babel configuration](./src/babel/plugins.ts)

- All CSS source files loaded by SystemJS will have their contents automatically injected into the HTML document head

Note that this CSS loading behavior diverges from the standard SystemJS CSS Modules behavior implemented by the `module-types` extra (bundled in `system.js`), which loads the CSS file as a module for use in a JavaScript module. For this reason, this plugin disables the underlying `module-types` extra, which will have the side-effect that any JSON or WASM modules that would usually be handled by the `module-types` loader must now be handled separately.

### Custom configuration

By default, the plugin will run the Babel transform on all loaded SystemJS URLs except from JS/CSS/JSON/WASM resources.

This can be undesirable when e.g. depending on a published UMD library, which can be loaded directly via the SystemJS AMD transform without requiring further processing.

To determine which URLs are transformed, declare a global `systemjs.babel.shouldTransform` function before the plugin is loaded.

For example, the following configuration will only transform local non-JSON resources:

```
<script>
    var systemjs = {
        babel: {
            shouldTransform(url, extension, contentType) {
                if (new URL(url).hostname !== 'localhost') return true;
                const contentTypes = contentType ? contentType.split(';') : [];
                if (contentTypes.includes('application/json')) return false;
                if (extension && extension === '.json') return false;
                return true;
            }
        }
    };
</script>
<script src="path/to/systemjs/dist/s.js" />
<script src="path/to/ag-grid-systemjs-plugin/dist/index.js"/>
```

### Developing

This package following npm scripts:

- `build`: Lint and build the package (outputs the compiled package into the `./dist` directory)
- `lint`: Lint the source code
