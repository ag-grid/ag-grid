import _ from './utils';

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

    public createMenuSvg(): Element {
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

    public createSmallArrowRightSvg() {
        return createPolygonSvg("0,0 6,3 0,6", 6);
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

    //public createFolderOpen(size: number): HTMLElement {
    //    var svg = `<svg width="${size}" height="${size}" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1717 931q0-35-53-35h-1088q-40 0-85.5 21.5t-71.5 52.5l-294 363q-18 24-18 40 0 35 53 35h1088q40 0 86-22t71-53l294-363q18-22 18-39zm-1141-163h768v-160q0-40-28-68t-68-28h-576q-40 0-68-28t-28-68v-64q0-40-28-68t-68-28h-320q-40 0-68 28t-28 68v853l256-315q44-53 116-87.5t140-34.5zm1269 163q0 62-46 120l-295 363q-43 53-116 87.5t-140 34.5h-1088q-92 0-158-66t-66-158v-960q0-92 66-158t158-66h320q92 0 158 66t66 158v32h544q92 0 158 66t66 158v160h192q54 0 99 24.5t67 70.5q15 32 15 68z"/></svg>`;
    //    return _.loadTemplate(svg);
    //}
    //
    //public createFolderClosed(size: number): HTMLElement {
    //    var svg = `<svg width="${size}" height="${size}" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1600 1312v-704q0-40-28-68t-68-28h-704q-40 0-68-28t-28-68v-64q0-40-28-68t-68-28h-320q-40 0-68 28t-28 68v960q0 40 28 68t68 28h1216q40 0 68-28t28-68zm128-704v704q0 92-66 158t-158 66h-1216q-92 0-158-66t-66-158v-960q0-92 66-158t158-66h320q92 0 158 66t66 158v32h672q92 0 158 66t66 158z"/></svg>`;
    //    return _.loadTemplate(svg);
    //}

    public createFolderOpen() {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAZpJREFUeNqkU0tLQkEUPjN3ShAzF66CaNGiaNEviFpLgbSpXf2ACIqgFkELaVFhtAratQ8qokU/oFVbMQtJvWpWGvYwtet9TWfu1QorvOGBb84M5/WdOTOEcw7tCKHBlT8sMIhr4BfLGXC4BrALM8QUoveHG9oPQ/NhwVCQbOjp0C5F6zDiwE7Aed/p5tKWruufTlY8bkqliqVN8wvH6wvhydWd5UYdkYCqqgaKotQTCEewnJuDBSqVmshOrWhKgCJVqeHcKtiGKdqTgGIOQmwGum7AxVUKinXKzX1/1y5Xp6g8gpe8iBxuGZhcKjyXQZIkmBkfczS62YnRQCKX75/b3t8QDNhD8QX83V5Ipe7Bybug2Pt5NJ7A4nEqGOQKT+Bzu0HTDNB1syUYYxCJy0kwzIRogb0rKjAiQVXXHLVQrqqvsZtsFu8hbyXwe73WeMQtO5GonJGxuiyeC+Oa4fF5PEirw9nbx9FdxtN5eMwkzcgRnoeCa9DVM/CvH/R2l+axkz3clQguOFjw1f+FUzEQCqJG2v3OHwIMAOW1JPnAAAJxAAAAAElFTkSuQmCC';
        return eImg;
    }

    public createFolderClosed() {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAARlJREFUeNqsUz1PwzAUPDtOUASpYKkQVWcQA/+DhbLA32CoKAMSTAwgFsQfQWLoX4GRDFXGIiqiyk4e7wUWmg8phJPOtvzunc6WrYgIXaD06KKhij0eD2uqUxBeDC9OmcNKCYd7ujm7ryodXz5ong6UPpqcP9+O76y1vwS+7yOOY1jr0OttlQyiaB0n148TAyK9XFqkaboiSTEYDNnkDUkyKxkkiSQkzQbwsiyHcBXz+Tv6/W1m+QiSEDT1igTO5RBWYbH4rNwPw/AnQU5ek0EdCj33SgLjHEHYzoAkgfmHBDmZuktsQqHPvxN0MyCbbWjtIQjWWhlIj/QqtT+6QrSz+6ef9DF7VTwFzE2madnu5K2prt/5S4ABADcIlSf6Ag8YAAAAAElFTkSuQmCC';
        return eImg;
    }

    public createColumnIcon() {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAOCAYAAAAMn20lAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTcwQ0JFMzlENjZEMTFFNUFEQ0U5RDRCNjFFRENGMUMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTcwQ0JFM0FENjZEMTFFNUFEQ0U5RDRCNjFFRENGMUMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFNzBDQkUzN0Q2NkQxMUU1QURDRTlENEI2MUVEQ0YxQyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFNzBDQkUzOEQ2NkQxMUU1QURDRTlENEI2MUVEQ0YxQyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqDOrJYAAABxSURBVHjalJBBDsAgCAQXxXvj2/o/X9Cvmd4lUpV4MXroJMTAuihQSklVMSCysxSBW4uWKzjG6zZLDxrlWis5EVEThoWmi3N+nxAYs2WnXQY34L3HisMWPQlHB+2FPtNW6D/8+ziBRcroOXc0B/wEGABY6TPS1FU0bwAAAABJRU5ErkJggg==';
        return eImg;
    }

    public createColumnsIcon() {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,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';
        return eImg;
    }

    public createPinIcon() {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAedJREFUeNqkUktLG1EYPTN31CIN0oWbIAWhKJR0FXcG6gOqkKGKVvEXCKULC91YSBcK7jXgQoIbFxn3ErFgFlIfCxUsQsCoIJYEm9LWNsGmJjPTM+Oo44Aa6IUzd+bec77H+UYyTRP/s5SsLFfCCxEjOhD9CXw64ccXJj7nLleYaMSvaa/+Au9Y73P3RUUBDIuXyaAxGu35A7xnkM57A7icCZXIO8/nkVleRn1/f9cv0xzjfVclFdi9N8ZivfnDQxQKBTwoFvFicLCVQSesJIpHMEY8dSqQWa54Eov1fF9ZQVHXsZNMblhnNE/wPmJPIX1zjOG2+fkgslnozHR2eopLcSIe3yoD48y45FbIxoVJNjimyMehoW3T58PvdBq53V18zeWwFo+vUfyBlCVvj0Li4/M1DnaAUtXCQkNDR4f/294eaoTAwdHRCROMWlzJZfC+1cKcJF07b5o+btWvV1eDyVBouyUcDj5UFDg924tVYtERpz0mCkmSulOp1GQgEIj0yvKPYiKBlwMDQXfPU47walEEmb8z0a5p2qaiKMPEoz6ezQLdM8DWNDDzltym24YthHimquoshSoDicvzZkK9S+h48pjCN4ZhrBPHTptlD0qevezwdCtAHVHrMti4A7rr3eb+E2AAoGnGkgkzpg8AAAAASUVORK5CYII=';
        return eImg;
    }

    public createPlusIcon() {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAatJREFUeNqkU71KA0EQ/vaiib+lWCiordidpSg+QHwDBSt7n8DGhwhYCPoEgqCCINomARuLVIqgYKFG5f6z68xOzrvzYuXA3P7MzLffN7unjDH4jw3xx91bQXuxU4woNDjUX7VgsFOIH3/BnHgC0J65AzwFjDpZgoG7vb7lMsPDq6MiuK+B+kjGwFpCUjwK1DIQ3/dl0ssVh5TTM0UJP8aBgBKGleSGIWyP0oKYRm3KPSgYJ0Q0EpEgCASA2WmWZQY3kazBmjP9UhBFEbTWAgA0f9W2yHeG+vrd+tqGy5r5xNTT9erSqpvfdxwHN7fXOQZ0QhzH1oWArLsfXXieJ/KTGEZLcbVaTVn9ALTOLk9L+mYX5lxd0Xh6eGyVgspK6APwI8n3x9hmNpORJOuBo5ah8GcTc7dAHmkhNpYQlpHr47Hq2NspA1yEwHkoO/MVYLMmWJNarjEUQBzQw7rPvardFC8tZuOEwwB4p9PHqXgCdm738sUDJPB8mnwKj7qCTtJ527+XyAs6tOf2Bb6SP0OeGxRTVMp2h9nweWMoKS20l3+QT/vwqfZbgAEAUCrnlLQ+w4QAAAAASUVORK5CYII=';
        return eImg;
    }

    public createMinusIcon() {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKVJREFUeNpi/P//PwMlgImBQjBqAAMDy3JGRgZGBoaZQGxMikZg3J0F4nSWHxC+cUBamvHXr18Zfv36Bca/f/8G43///oExKLphmImJieHagQMQF7QDiSwg/vnzJ8P3799RDPj79y+KRhhmBLr6I1DPNJABtxkYZM4xMFx7uXAhSX5/CtQD0gv0OgMfyCAgZgViZiL1/wXi30D8h3E0KVNuAECAAQDr51qtGxzf1wAAAABJRU5ErkJggg==';
        return eImg;
    }

    public createMoveIcon() {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAoZJREFUeNpsU81rE0EUf7uzu2lNVJL6Eb0IBWusepqcKm3wEFkvxqDgQbwUtYeeg5cccwj4F7QKChEPipRcdMGDiaAoJAexLYViwYsfbU1JYkx3Zz98b8220Wbg7ez7vXm/mffmN9Kh1G2QGQOmMDiRyYEkSaCoKjDGdAAooOUdxzFsIcDzPPhSvgeO7YDrOLBRmQdlJHULVE0DNRSCvqFjUuHqhWP8+etvhR5m0CeengVhmiAsywdl2Dt03K1wZSrO220XaCaf8AFrQel32s0mrDcaWfovrq3Vc9OTvHj/Tb0Xzh6JxQwNyxtIgPXpqqJk94fDM+1Oh6CaEF4QTiIOGJ/DdQtBObsEmGxbll/rkCyDPDwMzW4XhHD88EH0NcRxDUeX4/qdnsi0s8Aas+kEp8Zg82pMkmpDigKbjSbQTD7hFL94/jin9ZRHBNLo3Wrt+uUkbzQsiEZVMPGKfv76DaawodnahkhY86+PNnXxs77ZgVOjMahWVuufi1NJRZhWvvT0beHGtQn++Nm7en+DzqXO8vfVxX+wsYnT/JWxWEe95P0eILsvkkdPKn4PUEBJmunILab5992PLVU++skoNmOniT7JX2Fkt5GM1EjqbMohXzQmqo7KwCQ6zYKiabu30PpQAnZ0HKSRMcMRwnBddw4ZOO4GLRYKFFdDhrrteTMMdWB9/QTdH8sIp0EKmNT4GWDjGZAPJ3TcrbBv+ibfwtwDqBvzYck/truxYjjLZRDflwLt7JUmEoAymdPV7INa5IXn0Uw+4f8PIqATMLQIWpQ0E/RFTmQ4nLx0B1Zfzrsr5eAmbLQW2hYpHwkcqfegNBJhzwY9sGC4aCZaF81CAvePAAMAcwtApJX/Wo0AAAAASUVORK5CYII=';
        return eImg;
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