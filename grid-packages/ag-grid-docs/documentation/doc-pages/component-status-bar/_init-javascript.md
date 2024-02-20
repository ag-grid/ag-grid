<framework-specific-section frameworks="javascript">
<snippet transform={false}>
|class ClickableStatusBarComponent() {
|  init(params) {
|    this.params = params;
|
|    // Remember to remove the event listener when the component is destroyed
|    params.api.addEventListener('modelUpdated', () => {
|        // On the modelUpdated event rows will be available
|        this.updateStatusBar();
|    });
|  }
|  
|   updateStatusBar() { ... }
|}
</snippet>
</framework-specific-section>