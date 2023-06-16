<framework-specific-section frameworks="javascript">
|Below is an example of cell renderer class:
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
|class YearFilter {
|    init(params) {
|        this.eGui = document.createElement('div');
|        this.eGui.innerHTML =
|            `&lt;div>
|                &lt;div>Select Year Range&lt;/div>
|                &lt;label >  
|                    &lt;input type="radio" name="yearFilter" checked="true" id="rbAllYears" filter-checkbox="true"/> All
|                &lt;/label>
|                &lt;label >  
|                    &lt;input type="radio" name="yearFilter" id="rbSince2010" filter-checkbox="true"/> Since 2010
|                &lt;/label>
|            &lt;/div>`;
|        this.rbAllYears = this.eGui.querySelector('#rbAllYears');
|        this.rbSince2010 = this.eGui.querySelector('#rbSince2010');
|        this.rbAllYears.addEventListener('change', this.onRbChanged.bind(this));
|        this.rbSince2010.addEventListener('change', this.onRbChanged.bind(this));
|        this.filterActive = false;
|        this.filterChangedCallback = params.filterChangedCallback;
|    }
|
|    onRbChanged() {
|        this.filterActive = this.rbSince2010.checked;
|        this.filterChangedCallback();
|    }
|
|    getGui() {
|        return this.eGui;
|    }
|
|    doesFilterPass(params) {
|        return params.data.year >= 2010;
|    }
|
|    isFilterActive() {
|        return this.filterActive;
|    }
|
|    // this example isn't using getModel() and setModel(),
|    // so safe to just leave these empty. don't do this in your code!!!
|    getModel() {
|    }
|
|    setModel() {
|    }
|}
</snippet>
</framework-specific-section>