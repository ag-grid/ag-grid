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
      sizeKey: 'size', // default (can be omitted for current dataset)
      colorKey: 'color', // default (can be omitted for current dataset)
      tooltip: {
        renderer: tooltipRenderer,
      },
      formatter: params => ({ stroke: params.depth < 2 ? 'transparent' : 'black' }),
      labels: {
        value: {
          formatter: params => `${params.datum.color.toFixed(2)}%`,
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
  const { color, parent, depth, labelKey, colorKey } = params
  const customRootText = 'All industries'
  const title = depth > 1
    ? parent[labelKey!]
    : customRootText
  let content = '<div>'
  let ellipsis = false

  if (parent) {
    const maxCount = 5
    ellipsis = parent.children!.length > maxCount
    parent.children!.slice(0, maxCount).forEach((child: any) => {
      content += `<div style="font-weight: bold; color: white; background-color: ${color
        }; padding: 5px;"><strong>${child[labelKey!]
        }</strong>: ${String(
          isFinite(child[colorKey!]) ? child[colorKey!].toFixed(2) : ''
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
