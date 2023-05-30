<framework-specific-section frameworks="javascript">
|Below is an example of a tooltip component:
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false} language="ts">
|class CustomTooltip {
|    init(params) {
|        const eGui = this.eGui = document.createElement('div');
|        const color = params.color || 'white';
|        const data = params.api.getDisplayedRowAtIndex(params.rowIndex).data;
|
|        eGui.classList.add('custom-tooltip');
|        eGui.style['background-color'] = color;
|        eGui.innerHTML = `
|            &lt;p>
|                &lt;span class"name">${data.athlete}&lt;/span>
|            &lt;/p>
|            &lt;p>
|                &lt;span>Country: &lt;/span>
|                ${data.country}
|            &lt;/p>
|            &lt;p>
|                &lt;span>Total: &lt;/span>
|                ${data.total}
|            &lt;/p>
|        `;
|    }
|
|    getGui() {
|        return this.eGui;
|    }
|}
</snippet>
</framework-specific-section>