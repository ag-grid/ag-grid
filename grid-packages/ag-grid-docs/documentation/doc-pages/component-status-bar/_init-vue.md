[[only-vue]]
|```js
| export default {
|   methods: {
|     updateStatusBar() { ... },
|   },
|   created() {
|     // Remember to remove the event listener when the component is destroyed
|     this.params.api.addEventListener(
|       'modelUpdated',
|       this.updateStatusBar.bind(this)
|     );
|   },
| };
|```
