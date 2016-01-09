
module ag.grid {

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
            return createCircle(1);
        }

        createColumnHiddenSvg() {
            return createCircle(0);
        }
        
        createColumnNoHideSvg(){
            return createCircle(-1);
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
        
        createLockIconSvg() {
            return createLock();
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
        if (fill == 1) {
            eCircle.setAttribute("fill", "black");
        } else if (fill == 0) {
            eCircle.setAttribute("fill", "none");
        } else {
            eCircle.setAttribute("fill", "none");
            var eLine = document.createElementNS(SVG_NS, "line");
            eLine.setAttribute("x1", "0");
            eLine.setAttribute("y1", "0");
            eLine.setAttribute("x2", "10");
            eLine.setAttribute("y2", "10");
            eLine.setAttribute("stroke", "black");
            eLine.setAttribute("stroke-width", "2");
            eSvg.appendChild(eLine);
        }
        eSvg.appendChild(eCircle);

        return eSvg;
    }

    function createLock() {
        var eSvg = createIconSvg(15);
        eSvg.setAttribute("viewBox", "0 0 50 80");
        var eRectBody = document.createElementNS(SVG_NS, "rect");
        eRectBody.setAttribute("x", "0");
        eRectBody.setAttribute("y", "30");
        eRectBody.setAttribute("rx", "5");
        eRectBody.setAttribute("ry", "5");
        eRectBody.setAttribute("height", "50");
        eRectBody.setAttribute("width", "50");
        eRectBody.setAttribute("stroke", "black");
        eRectBody.setAttribute("fill", "black");
        eSvg.appendChild(eRectBody);
        var ePath = document.createElementNS(SVG_NS, "path");
        ePath.setAttribute("stroke", "black");
        ePath.setAttribute("fill", "black");
        ePath.setAttribute("d", "M5,25 L15,25 L15,20 A10,8 0 0,1 35,20 L35,25 L45,25 L45,15 A10,8 0 0,0 5,15 L5,27 Z");
        eSvg.appendChild(ePath);
        var eCircleKey = document.createElementNS(SVG_NS, "circle");
        eCircleKey.setAttribute("cx", "25");
        eCircleKey.setAttribute("cy", "50");
        eCircleKey.setAttribute("r", "10");
        eCircleKey.setAttribute("stroke", "white");
        eCircleKey.setAttribute("fill", "white");
        eSvg.appendChild(eCircleKey);
        var eRectKey = document.createElementNS(SVG_NS, "rect");
        eRectKey.setAttribute("x", "20");
        eRectKey.setAttribute("y", "55");
        eRectKey.setAttribute("height", "15");
        eRectKey.setAttribute("width", "10");
        eRectKey.setAttribute("stroke", "white");
        eRectKey.setAttribute("fill", "white");
        eSvg.appendChild(eRectKey);

        return eSvg;
    }
}
