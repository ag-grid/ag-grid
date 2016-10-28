
ag-Grid
==============
[![CDNJS](https://img.shields.io/cdnjs/v/ag-grid.svg)](https://cdnjs.com/libraries/ag-grid)
[![npm](https://img.shields.io/npm/dm/ag-grid.svg)](https://www.npmjs.com/package/ag-grid)
[![npm](https://img.shields.io/npm/dt/ag-grid.svg)](https://www.npmjs.com/package/ag-grid)

"ag" stands for AGnostic

#### Install with Bower
```sh
$ bower install ag-grid
```

#### Install with Npm
```sh
$ npm install ag-grid
```

See the [www.ag-grid.com](http://www.ag-grid.com) for overview and documentation.


Building
==============

To build:
- `npm install`
- `npm install gulp -g`
- `bower install`
- `gulp` or `gulp release`

Default gulp task is for development. It includes source maps, does not include minification, and starts a watch.

'release' gulp task does minification and no source maps. This is for releasing.

Folder Structure
==============
The new build has the following structure:
- **\src** -> contains source files (TypeScript and CSS), don't touch these!
- **\dist** -> contains distribution files
- **\dist\ag-grid.js and \dist\ag-grid.min.js** -> use these if not using a package manager and put ag-Grid on
the global scope. The new JavaScript distribution files contain the CSS for the grid, no need to reference
separately.
- **\dist\styles** -> contains CSS files, used if doing your own bundling.
- **\dist\lib** -> contains compiles JavaScript files in CommonJS format.
- **\main.js** -> CommonJS root file, reference this file if importing project via CommonJS.
- **\main.d.ts** -> CommonJS root definition file.


Asking Questions
==============

Please do not use GitHub issues to ask questions. Ask questions on the
[website forum](http://www.ag-grid.com/forum).


Contributing
==============

ag-Grid is not looking for contributors. It is not intended to be developed by an online community.
However suggestion on change and raising bugs are appreciated.

If you are doing a Pull Request:
- Make your code changes in `src/` files only, don't update dist files
- Discard all changes to `dist/`
- Create Pull Request

For large changes:
- Make your doc changes in project [ag-grid-docs](https://github.com/ceolter/ag-grid-docs), a feature is not complete unless it's documented!
- Do manual end to end testing off all examples in documentation

PR's on new features **are not** generally accepted. 

PR's on small bug fixes **are** generally accepted.

If a PR for a large request is submitted, the typical action is the author will take influence from the
code to implement the feature, either in ag-grid or [ag-grid-enterprise](https://github.com/ceolter/ag-grid-enterprise).
