<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|class ClickableStatusBarComponent() {
|  agInit(params: IStatusPanelParams) {
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