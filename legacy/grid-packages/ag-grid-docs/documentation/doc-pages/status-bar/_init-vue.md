<framework-specific-section frameworks="vue">
<snippet transform={false}>
| export default {
|   methods: {
|     updateStatusBar() { ... },
|   },
|   created() {
|     // Remove event listener when destroyed
|     this.params.api.addEventListener(
|       'modelUpdated',
|       this.updateStatusBar.bind(this)
|     );
|   },
| };
</snippet>
</framework-specific-section>