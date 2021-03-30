[[only-javascript]]
|
|Below is a simple example of a tooltip component:
|
|```js
|class CustomTooltip {
|    init(params) {
|        const eGui = this.eGui = document.createElement('div');
|        const color = params.color || 'white';
|        const data = params.api.getDisplayedRowAtIndex(params.rowIndex).data;
|
|        eGui.classList.add('custom-tooltip');
|        eGui.style['background-color'] = color;
|        eGui.innerHTML = `
|            <p>
|                <span class"name">${data.athlete}</span>
|            </p>
|            <p>
|                <span>Country: </span>
|                ${data.country}
|            </p>
|            <p>
|                <span>Total: </span>
|                ${data.total}
|            </p>
|        `;
|    }
|
|    getGui() {
|        return this.eGui;
|    }
|}
|```
