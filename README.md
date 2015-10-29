
ag-Grid
==============

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

If you are doing a Pull Request:
- Make your code changes in `src/` files only, don't update dist files
- Make your doc changes in `docs/`, a feature is not complete unless it's documented
- Do manual end to end testing off all examples in documentation
- Discard all changes to `dist/`
- Create Pull Request

Asking Questions
==============

Please do not use GitHub issues to ask questions. Ask questions on the
[website forum](http://www.ag-grid.com/forum).


Contributing
==============

ag-Grid is not looking for contributors for the project. If you have ideas, feel free to
get in touch and let me know. Or if you want to suggest something, feel free to
create a pull request with your ideas.

If you would like to help, then please provide me with guidance and advice.
I don't claim to know everything, so welcome others opinions on the direction
of the project.
