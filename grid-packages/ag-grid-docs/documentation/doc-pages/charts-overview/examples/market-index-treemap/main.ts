import { AgChartOptions, AgTreemapSeriesTooltipRendererParams } from 'ag-charts-community'
import * as agCharts from 'ag-charts-community'
import { data } from './data'

const options: AgChartOptions = {
  type: 'hierarchy',
  container: document.getElementById('myChart'),
  data,
  series: [
    {
      type: 'treemap',
      labelKey: 'name', // defaults to 'label', but current dataset uses 'name'
      sizeKey: 'valuation', // defaults to 'size', but current dataset uses 'valuation'
      colorKey: 'color', // default (can be omitted for current dataset)
      tooltip: {
        renderer: tooltipRenderer,
      },
      formatter: params => ({ stroke: params.depth < 2 ? 'transparent' : 'black' }),
      labels: {
        value: {
          formatter: params => `${params.datum.change.toFixed(2)}%`,
        },
      },
    },
  ],
  title: {
    text: 'S&P 500 index stocks categorized by sectors and industries.',
  },
  subtitle: {
    text:
      'Area represents market cap. Color represents change from the day before.',
  },
}

function tooltipRenderer(params: AgTreemapSeriesTooltipRendererParams<any>) {
  const { parent, depth, labelKey } = params
  const customRootText = 'All industries'
  const title = depth > 1
    ? parent[labelKey!]
    : customRootText
  let content = '<div>'
  let ellipsis = false

  if (parent) {
    const maxCount = 5
    ellipsis = parent.children!.length > maxCount
    const sorted = parent.children!.slice(0).sort((a: any, b: any) => b.valuation - a.valuation);
    sorted.slice(0, maxCount).forEach((child: any) => {
      const bg = child.color || '#272931';
      content += `<div style="font-weight: bold; color: white; background-color: ${bg
        }; padding: 5px;"><strong>${child[labelKey!]
        }</strong>: ${String(
          isFinite(child.change) ? child.change.toFixed(2) : ''
        )}%</div>`
    })
  }
  if (ellipsis) {
    content += `<div style="text-align: center;">...</div>`
  }
  content += '</div>'
  return {
    title,
    content,
    backgroundColor: 'gray',
  }
}

agCharts.AgChart.create(options)
