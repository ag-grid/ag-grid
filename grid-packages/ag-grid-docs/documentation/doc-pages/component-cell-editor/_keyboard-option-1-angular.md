[[only-angular]]
|
|```js
|const KEY_LEFT = 37;
|const KEY_UP = 38;
|const KEY_RIGHT = 39;
|const KEY_DOWN = 40;
|const KEY_PAGE_UP = 33;
|const KEY_PAGE_DOWN = 34;
|const KEY_PAGE_HOME = 36;
|const KEY_PAGE_END = 35;
|
|@Component({
|    selector: 'my-editor',
|    template: `<input (keydown)="onKeyDown($event)" ...rest of input/>`
|})
|export class MyCellEditor {
|    /* Component Editor Lifecycle method */
|    agInit(params) {
|        this.params = params;
|    }
|
|    onKeyDown(event) {
|       const keyCode = event.keyCode;
|
|        const isNavigationKey = keyCode === KEY_LEFT ||
|           keyCode === KEY_RIGHT ||
|           keyCode === KEY_UP ||
|           keyCode === KEY_DOWN ||
|           keyCode === KEY_PAGE_DOWN ||
|           keyCode === KEY_PAGE_UP ||
|           keyCode === KEY_PAGE_HOME ||
|           keyCode === KEY_PAGE_END;
|
|           if (isNavigationKey) {
|               // this stops the grid from receiving the event and executing keyboard navigation
|               event.stopPropagation();
|           }
|    }
|   
|    ..rest of the component
|})
|
|```
