import { ICellRendererParams } from "@ag-grid-community/core";

export function PriceRenderer(params: ICellRendererParams) {
    let priceMultiplier: number = 1
    if (params.value > 5000000) {
      priceMultiplier = 2
    }
    if (params.value > 10000000) {
      priceMultiplier = 3
    }
    if (params.value > 25000000) {
      priceMultiplier = 4
    }
    if (params.value > 20000000) {
      priceMultiplier = 5
    }
  
    const priceSpan = document.createElement("span")
    priceSpan.setAttribute(
      "class",
      "imgSpan"
    )
    for (let i = 0; i < priceMultiplier; i++) {
      const priceElement = document.createElement("img")
      priceElement.src = `https://www.ag-grid.com/example-assets/pound.png`
      priceElement.setAttribute(
        "class",
        "priceIcon"
      )
      priceSpan.appendChild(priceElement)
    }
    return priceSpan
  }