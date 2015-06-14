
ag-Grid
==============

#### Install with Bower
```sh
$ bower install ag-grid
```

#### Install with Npm
```sh
$ npm install angular-grid
```

See the [www.angulargrid.com](http://www.angulargrid.com) for overview and documentation.


Building
==============

To build:
- `npm install`
- `npm install gulp -g`
- `bower install`
- `gulp` or `gulp guild` or `gulp watch`

If you are doing a Pull Request:
- Make your code changes in `src/` files only, don't update dist files
- Make your doc changes in `docs/`, a feature is not complete unless it's documented
- Do manual end to end testing off all examples in documentation
- Discard all changes to `dist/`
- Create Pull Request

Asking Questions
==============

Please do not use GitHub issues to ask questions. Ask questions on the
[website forum](http://www.angulargrid.com/forum).


Contributing
==============

I am not looking for contributors for this project. If you have ideas, feel free to
get in touch and let me know. Or if you want to suggest something, feel free to
create a pull request with your ideas.

My reason for not looking for contributors is that this grid is my hobby,
something I work on in my spare time and enjoy. The design is something of a passion,
and I'm bringing the grid into a particular direction. To take on contributors
would require overhead of organisation, as well as agreeing direction (both
technical implementation and functional requirements).

If you would like to help, then where I actually do need help is in answering questions
on the forum and spreading the word to grow the user community.

Automated Testing
==============

ag-Grid has no automated tests. This is the choice of the author, not because he
can't write tests, but because he has chosen not to for this particular project.
Reasons include a) only one developer and b) the one developer knows the design, he
knows what changes are breaking changes. The grid is also in an evolving state,
with the core design been refactored regularly - this reduces the overall benefit
of tests.

If you are worried about ag-Grid not having tests, then take assurance in the fact
that there are pretty much no bugs in ag-Grid (all the issues reported are feature
requests, not bugs). The quality of the product is far beyond that of other projects
who do focus heavily on testing. The grid is being used by a very large community
now and has a reputation for been solid (again unlike other grids / projects).
