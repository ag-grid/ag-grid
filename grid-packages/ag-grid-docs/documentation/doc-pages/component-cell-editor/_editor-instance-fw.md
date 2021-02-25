|If your editor is a component you can get the underlying cell editor using `getFrameworkComponentInstance()` method on the grid API:
|
|```js
|// example - get cell editor
|const instances = this.api.getCellEditorInstances(params);
|if (instances.length > 0) {
|    // got it, user must be scrolled so that it exists
|    const wrapperInstance = instances[0];
|
|    // non-popup editor instance
|    const frameworkInstance = wrapperInstance.getFrameworkComponentInstance();
|
|    // popup editor instance
|    const frameworkInstance = wrapperInstance.cellEditor.getFrameworkComponentInstance();
|}
|```
