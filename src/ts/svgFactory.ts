
module awk.grid {

    var SVG_NS = "http://www.w3.org/2000/svg";

    export class SvgFactory {

        static theInstance:SvgFactory;

        static getInstance() {
            if (!this.theInstance) {
                this.theInstance = new SvgFactory();
            }
            return this.theInstance;
        }

        createFilterSvg() {
            var eSvg = createIconSvg();

            var eFunnel = document.createElementNS(SVG_NS, "polygon");
            eFunnel.setAttribute("points", "0,0 4,4 4,10 6,10 6,4 10,0");
            eFunnel.setAttribute("class", "ag-header-icon");
            eSvg.appendChild(eFunnel);

            return eSvg;
        }

        createColumnShowingSvg() {
            return createCircle(true);
        }

        createColumnHiddenSvg() {
            return createCircle(false);
        }

        createMenuSvg() {
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

        createArrowUpSvg() {
            return createPolygonSvg("0,10 5,0 10,10");
        }

        createArrowLeftSvg() {
            return createPolygonSvg("10,0 0,5 10,10");
        }

        createArrowDownSvg() {
            return createPolygonSvg("0,0 5,10 10,0");
        }

        createArrowRightSvg() {
            return createPolygonSvg("0,0 10,5 0,10");
        }

        createSmallArrowDownSvg() {
            return createPolygonSvg("0,0 3,6 6,0", 6);
        }

        // UnSort Icon SVG
        createArrowUpDownSvg() {
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

}
