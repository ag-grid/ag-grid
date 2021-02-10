agCharts.AgChart.create({
    type: 'hierarchy',
    container: document.getElementById('myChart'),
    data,
    series: [{
        type: 'treemap',
        labelKey: 'name',
        tooltip: {
            // renderer: tooltipRenderer
            renderer: params => {
                debugger;
                return {
                    content: 22
                };
            }
        }
    }],
    title: {
        text: 'S&P 500 index stocks categorized by sectors and industries.'
    },
    subtitle: {
        text: 'Area represents market cap.'
    }
});

function tooltipRenderer(params) {
    const { datum } = params;
    const customRootText = 'Custom Root Text';
    const title = datum.parent ?
        datum.parent.depth ? datum.parent.data[params.labelKey] : customRootText
        : customRootText;
    let content = '<div>';
    let ellipsis = false;

    if (datum.parent) {
        const maxCount = 5;
        ellipsis = datum.parent.children.length > maxCount;
        datum.parent.children.slice(0, maxCount).forEach(child => {
            content += `<div style="font-weight: bold; color: white; background-color: ${child.fill}; padding: 5px;"><strong>${child.data.name || child.label}</strong>: ${String(isFinite(child.$value) ? child.$value.toFixed(2) : '')}%</div>`;
        });
    }
    if (ellipsis) {
        content += `<div style="text-align: center;">...</div>`;
    }
    content += '</div>';
    return {
        title,
        content,
        backgroundColor: 'gray'
    };
}
