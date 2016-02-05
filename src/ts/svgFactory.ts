var SVG_NS = "http://www.w3.org/2000/svg";

export default class SvgFactory {

    static theInstance: SvgFactory;

    static getInstance() {
        if (!this.theInstance) {
            this.theInstance = new SvgFactory();
        }
        return this.theInstance;
    }

    public createFilterSvg() {
        var eSvg = createIconSvg();

        var eFunnel = document.createElementNS(SVG_NS, "polygon");
        eFunnel.setAttribute("points", "0,0 4,4 4,10 6,10 6,4 10,0");
        eFunnel.setAttribute("class", "ag-header-icon");
        eSvg.appendChild(eFunnel);

        return eSvg;
    }

    public createColumnShowingSvg() {
        return createCircle(true);
    }

    public createColumnHiddenSvg() {
        return createCircle(false);
    }

    public createMenuSvg() {
        var eSvg = document.createElementNS(SVG_NS, "svg");
        var size = "12";
        eSvg.setAttribute("width", size);
        eSvg.setAttribute("height", size);

        ["0", "5", "10"].forEach(function (y) {
            var eLine = document.createElementNS(SVG_NS, "rect");
            eLine.setAttribute("y", y);
            eLine.setAttribute("width", size);
            eLine.setAttribute("height", "2");
            eLine.setAttribute("class", "ag-header-icon");
            eSvg.appendChild(eLine);
        });

        return eSvg;
    }

    public createArrowUpSvg() {
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

    public createSmallArrowDownSvg() {
        return createPolygonSvg("0,0 3,6 6,0", 6);
    }

    //public createOpenSvg() {
    //    return createPlusMinus(true);
    //}
    //
    //public createCloseSvg() {
    //    return createPlusMinus(false);
    //}

    // UnSort Icon SVG
    public createArrowUpDownSvg() {
        var svg = createIconSvg();

        var eAscIcon = document.createElementNS(SVG_NS, "polygon");
        eAscIcon.setAttribute("points", '0,4 5,0 10,4');
        svg.appendChild(eAscIcon);

        var eDescIcon = document.createElementNS(SVG_NS, "polygon");
        eDescIcon.setAttribute("points", '0,6 5,10 10,6');
        svg.appendChild(eDescIcon);

        return svg;
    }
}

// i couldn't figure out how to not make these blurry

/*function createPlusMinus(plus: boolean) {
    var eSvg = document.createElementNS(SVG_NS, "svg");
    var size = "14";
    eSvg.setAttribute("width", size);
    eSvg.setAttribute("height", size);

    var eRect = document.createElementNS(SVG_NS, "rect");
    eRect.setAttribute('x', '1');
    eRect.setAttribute('y', '1');
    eRect.setAttribute('width', '12');
    eRect.setAttribute('height', '12');
    eRect.setAttribute('rx', '2');
    eRect.setAttribute('ry', '2');
    eRect.setAttribute('fill', 'none');
    eRect.setAttribute('stroke', 'black');
    eRect.setAttribute('stroke-width', '1');
    eRect.setAttribute('stroke-linecap', 'butt');
    eSvg.appendChild(eRect);

    var eLineAcross = document.createElementNS(SVG_NS, "line");
    eLineAcross.setAttribute('x1','2');
    eLineAcross.setAttribute('x2','12');
    eLineAcross.setAttribute('y1','7');
    eLineAcross.setAttribute('y2','7');
    eLineAcross.setAttribute('stroke','black');
    eLineAcross.setAttribute('stroke-width', '1');
    eLineAcross.setAttribute('stroke-linecap', 'butt');
    eSvg.appendChild(eLineAcross);

    if (plus) {
        var eLineDown = document.createElementNS(SVG_NS, "line");
        eLineDown.setAttribute('x1','7');
        eLineDown.setAttribute('x2','7');
        eLineDown.setAttribute('y1','2');
        eLineDown.setAttribute('y2','12');
        eLineDown.setAttribute('stroke','black');
        eLineDown.setAttribute('stroke-width', '1');
        eLineDown.setAttribute('stroke-linecap', 'butt');
        eSvg.appendChild(eLineDown);
    }

    return eSvg;
}*/

function createPolygonSvg(points: any, width?: any) {
    var eSvg = createIconSvg(width);

    var eDescIcon = document.createElementNS(SVG_NS, "polygon");
    eDescIcon.setAttribute("points", points);
    eSvg.appendChild(eDescIcon);

    return eSvg;
}

// util function for the above
function createIconSvg(width?: any) {
    var eSvg = document.createElementNS(SVG_NS, "svg");
    if (width > 0) {
        eSvg.setAttribute("width", width);
        eSvg.setAttribute("height", width);
    } else {
        eSvg.setAttribute("width", "10");
        eSvg.setAttribute("height", "10");
    }
    return eSvg;
}

function createCircle(fill: any) {
    var eSvg = createIconSvg();

    var eCircle = document.createElementNS(SVG_NS, "circle");
    eCircle.setAttribute("cx", "5");
    eCircle.setAttribute("cy", "5");
    eCircle.setAttribute("r", "5");
    eCircle.setAttribute("stroke", "black");
    eCircle.setAttribute("stroke-width", "2");
    if (fill) {
        eCircle.setAttribute("fill", "black");
    } else {
        eCircle.setAttribute("fill", "none");
    }
    eSvg.appendChild(eCircle);

    return eSvg;
}