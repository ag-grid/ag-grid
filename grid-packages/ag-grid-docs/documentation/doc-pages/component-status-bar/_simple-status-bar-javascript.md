<framework-specific-section frameworks="javascript">
|
|Below is an example of a status bar component:
|
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
|class ClickableStatusBarComponent {
|    init(params) {
|        this.params = params;
|
|        this.eGui = document.createElement('button');
|
|        this.buttonListener = this.onButtonClicked.bind(this);
|        this.eGui.addEventListener("click", this.buttonListener);
|        this.eGui.innerHTML = 'Click Me For Selected Row Count';
|        this.eGui.style.padding = "5px";
|        this.eGui.style.margin = "5px";
|    }
|
|    getGui() {
|        return this.eGui;
|    }
|
|    destroy() {
|        this.eButton.removeEventListener("click", this.buttonListener);
|    }
|
|    onButtonClicked() {
|        alert('Selected Row Count: ' + this.params.api.getSelectedRows().length)
|    }
|}
</snippet>
</framework-specific-section>