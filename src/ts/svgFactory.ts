import {Utils as _} from './utils';

let SVG_NS = "http://www.w3.org/2000/svg";

export class SvgFactory {

    static theInstance: SvgFactory;

    static getInstance() {
        if (!this.theInstance) {
            this.theInstance = new SvgFactory();
        }
        return this.theInstance;
    }

    public createFilterSvg(): HTMLElement  {
        let eSvg = createIconSvg();

        let eFunnel = document.createElementNS(SVG_NS, "polygon");
        eFunnel.setAttribute("points", "0,0 4,4 4,10 6,10 6,4 10,0");
        eFunnel.setAttribute("class", "ag-header-icon");
        eSvg.appendChild(eFunnel);

        return eSvg;
    }

    public createFilterSvg12(): HTMLElement  {
        let eSvg = createIconSvg(12);

        let eFunnel = document.createElementNS(SVG_NS, "polygon");
        eFunnel.setAttribute("points", "0,0 5,5 5,12 7,12 7,5 12,0");
        eFunnel.setAttribute("class", "ag-header-icon");
        eSvg.appendChild(eFunnel);

        return eSvg;
    }

    public createMenuSvg(): HTMLElement {
        let eSvg = <HTMLElement> document.createElementNS(SVG_NS, "svg");
        let size = "12";
        eSvg.setAttribute("width", size);
        eSvg.setAttribute("height", size);

        ["0", "5", "10"].forEach(function (y) {
            let eLine = document.createElementNS(SVG_NS, "rect");
            eLine.setAttribute("y", y);
            eLine.setAttribute("width", size);
            eLine.setAttribute("height", "2");
            eLine.setAttribute("class", "ag-header-icon");
            eSvg.appendChild(eLine);
        });

        return eSvg;
    }

    public createColumnsSvg12(): HTMLElement {
        let eSvg = createIconSvg(12);

        [0,4,8].forEach( (y)=> {
            [0,7].forEach( (x)=> {

                let eBar = document.createElementNS(SVG_NS, "rect");
                eBar.setAttribute("y", y.toString());
                eBar.setAttribute("x", x.toString());
                eBar.setAttribute("width", "5");
                eBar.setAttribute("height", "3");
                eBar.setAttribute("class", "ag-header-icon");
                eSvg.appendChild(eBar);
            });
        });

        return eSvg;
    }

    public createArrowUpSvg(): HTMLElement {
        return createPolygonSvg("0,10 5,0 10,10");
    }

    public createArrowLeftSvg() {
        return createPolygonSvg("10,0 0,5 10,10");
    }

    public createArrowDownSvg() {
        return createPolygonSvg("0,0 5,10 10,0");
    }

    public createArrowRightSvg() {
        return createPolygonSvg("0,0 10,5 0,10");
    }

    public createSmallArrowRightSvg() {
        return createPolygonSvg("0,0 6,3 0,6", 6);
    }

    public createSmallArrowLeftSvg() {
        return createPolygonSvg("6,0 0,3 6,6", 6);
    }

    public createSmallArrowDownSvg() {
        return createPolygonSvg("0,0 3,6 6,0", 6);
    }

    public createArrowUpDownSvg() {
        let svg = createIconSvg();

        let eAscIcon = document.createElementNS(SVG_NS, "polygon");
        eAscIcon.setAttribute("points", '0,4 5,0 10,4');
        svg.appendChild(eAscIcon);

        let eDescIcon = document.createElementNS(SVG_NS, "polygon");
        eDescIcon.setAttribute("points", '0,6 5,10 10,6');
        svg.appendChild(eDescIcon);

        return svg;
    }
}

function createPolygonSvg(points: any, width?: any): HTMLElement {
    let eSvg = createIconSvg(width);

    let eDescIcon = document.createElementNS(SVG_NS, "polygon");
    eDescIcon.setAttribute("points", points);
    eSvg.appendChild(eDescIcon);

    return eSvg;
}

// util function for the above
function createIconSvg(width?: any): HTMLElement {
    let eSvg = <HTMLElement> document.createElementNS(SVG_NS, "svg");
    if (width > 0) {
        eSvg.setAttribute("width", width);
        eSvg.setAttribute("height", width);
    } else {
        eSvg.setAttribute("width", "10");
        eSvg.setAttribute("height", "10");
    }
    return eSvg;
}
