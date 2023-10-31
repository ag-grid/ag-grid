import { ITooltipComp, ITooltipParams } from 'ag-grid-community';

export class CustomTooltip implements ITooltipComp {
  eGui: any;
  init(params: ITooltipParams) {
    const eGui = (this.eGui = document.createElement('div'));
    eGui.classList.add('custom-tooltip');
    
    eGui.innerHTML = `
        <p>
            <span>${params.data.mission} was a <span style='color: ${params.data.successful === true ? 'green' : 'red'}'>${params.data.successful === true ? 'successful' : 'failed'}</span> mission with a total cost of <b>£${params.data.price.toLocaleString()}</b> on ${params.data.date}</span>
        </p>
    `;
  }

  getGui() {
    return this.eGui;
  }
}