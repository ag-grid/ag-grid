import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

const COUNTRY_CODES: Record<string, string> = {
    Ireland: 'ie',
    Luxembourg: 'lu',
    Belgium: 'be',
    Spain: 'es',
    'United Kingdom': 'gb',
    France: 'fr',
    Germany: 'de',
    Sweden: 'se',
    Italy: 'it',
    Greece: 'gr',
    Iceland: 'is',
    Portugal: 'pt',
    Malta: 'mt',
    Norway: 'no',
    Brazil: 'br',
    Argentina: 'ar',
    Colombia: 'co',
    Peru: 'pe',
    Venezuela: 've',
    Uruguay: 'uy',
};

export class CountryCellRenderer implements ICellRendererComp {
    eGui!: HTMLSpanElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('span');
        this.eGui.style.cursor = 'default';
        this.eGui.style.overflow = 'hidden';
        this.eGui.style.textOverflow = 'ellipsis';

        //get flags from here: http://www.freeflagicons.com/
        if (params.value == null || params.value === '' || params.value === '(Select All)') {
            this.eGui.innerHTML = params.value;
        } else {
            const flag =
                '<img border="0" width="15" height="10" src="https://flags.fmcdn.net/data/flags/mini/' +
                COUNTRY_CODES[params.value] +
                '.png">';
            this.eGui.innerHTML = flag + ' ' + params.value;
        }
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams) {
        return false;
    }
}
