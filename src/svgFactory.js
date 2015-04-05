define(["./constants"], function() {

    var SVG_NS = "http://www.w3.org/2000/svg";

    function SvgFactory() {
    }

    SvgFactory.prototype.createFilterSvg = function() {
        var eSvg = createIconSvg();

        var eFunnel = document.createElementNS(SVG_NS, "polygon");
        eFunnel.setAttribute("points", "0,0 4,4 4,10 6,10 6,4 10,0");
        eFunnel.setAttribute("class", "ag-header-icon");
        eSvg.appendChild(eFunnel);

        return eSvg;
    };

    SvgFactory.prototype.createMenuSvg = function() {
        var eSvg = document.createElementNS(SVG_NS, "svg");
        var size = "12";
        eSvg.setAttribute("width", size);
        eSvg.setAttribute("height", size);

        ["0","5","10"].forEach(function(y) {
            var eLine = document.createElementNS(SVG_NS, "rect");
            eLine.setAttribute("y", y);
            eLine.setAttribute("width", size);
            eLine.setAttribute("height", "2");
            eLine.setAttribute("class", "ag-header-icon");
            eSvg.appendChild(eLine);
        });

        return eSvg;
    };

    SvgFactory.prototype.createSortDescSvg = function() {
        var eSvg = createIconSvg();

        var eDescIcon = document.createElementNS(SVG_NS, "polygon");
        eDescIcon.setAttribute("points", "0,10 5,0 10,10");
        eSvg.appendChild(eDescIcon);

        return eSvg;
    };

    SvgFactory.prototype.createSortAscSvg = function() {
        var eSvg = createIconSvg();

        var eAscIcon = document.createElementNS(SVG_NS, "polygon");
        eAscIcon.setAttribute("points", "0,0 10,0 5,10");
        eSvg.appendChild(eAscIcon);

        return eSvg;
    };

    SvgFactory.prototype.createGroupContractedSvg = function() {
        var eSvg = createIconSvg();

        var eDescIcon = document.createElementNS(SVG_NS, "polygon");
        eDescIcon.setAttribute("points", "0,0 10,5 0,10");
        eSvg.appendChild(eDescIcon);

        return eSvg;
    };

    SvgFactory.prototype.createGroupExpandedSvg = function() {
        var eSvg = createIconSvg();

        var eDescIcon = document.createElementNS(SVG_NS, "polygon");
        eDescIcon.setAttribute("points", "0,0 10,5 0,10");
        eSvg.appendChild(eDescIcon);

        return eSvg;
    };

    // util function for the above
    function createIconSvg() {
        var eSvg = document.createElementNS(SVG_NS, "svg");
        eSvg.setAttribute("width", "10");
        eSvg.setAttribute("height", "10");
        return eSvg;
    }

    return SvgFactory;

});