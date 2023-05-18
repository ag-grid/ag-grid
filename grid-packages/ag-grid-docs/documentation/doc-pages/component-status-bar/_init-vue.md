<framework-specific-section frameworks="vue">
<snippet transform={false}>
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
</snippet>
</framework-specific-section>