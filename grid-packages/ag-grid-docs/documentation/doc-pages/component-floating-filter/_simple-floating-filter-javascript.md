[[only-javascript]]
|Below is an example of floating filter component:
|
|```js
|class NumberFloatingFilterComponent {
|    init(params) {
|        this.eGui = document.createElement('div');
|        this.eGui.innerHTML = '&gt; <input style="width: 30px" type="number" min="0" />';
|        this.currentValue = null;
|        this.eFilterInput = this.eGui.querySelector('input');
|        this.eFilterInput.style.color = params.color;
|
|        const onInputBoxChanged = () => {
|            if (this.eFilterInput.value === '') {
|                // clear the filter
|                params.parentFilterInstance(instance => {
|                    instance.onFloatingFilterChanged(null, null);
|                });
|                return;
|            }
|
|            this.currentValue = Number(this.eFilterInput.value);
|            params.parentFilterInstance(instance => {
|                instance.onFloatingFilterChanged('greaterThan', this.currentValue);
|            });
|        }
|
|        this.eFilterInput.addEventListener('input', onInputBoxChanged);
|    }
|
|    onParentModelChanged(parentModel) {
|        // When the filter is empty we will receive a null message her
|        if (!parentModel) {
|            this.eFilterInput.value = '';
|            this.currentValue = null;
|        } else {
|            this.eFilterInput.value = parentModel.filter + '';
|            this.currentValue = parentModel.filter;
|        }
|    }
|
|    getGui() {
|        return this.eGui;
|    }
|}
|```
