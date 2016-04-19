/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.5
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var SVG_NS = "http://www.w3.org/2000/svg";
var SvgFactory = (function () {
    function SvgFactory() {
    }
    SvgFactory.getInstance = function () {
        if (!this.theInstance) {
            this.theInstance = new SvgFactory();
        }
        return this.theInstance;
    };
    SvgFactory.prototype.createFilterSvg = function () {
        var eSvg = createIconSvg();
        var eFunnel = document.createElementNS(SVG_NS, "polygon");
        eFunnel.setAttribute("points", "0,0 4,4 4,10 6,10 6,4 10,0");
        eFunnel.setAttribute("class", "ag-header-icon");
        eSvg.appendChild(eFunnel);
        return eSvg;
    };
    SvgFactory.prototype.createFilterSvg12 = function () {
        var eSvg = createIconSvg(12);
        var eFunnel = document.createElementNS(SVG_NS, "polygon");
        eFunnel.setAttribute("points", "0,0 5,5 5,12 7,12 7,5 12,0");
        eFunnel.setAttribute("class", "ag-header-icon");
        eSvg.appendChild(eFunnel);
        return eSvg;
    };
    SvgFactory.prototype.createMenuSvg = function () {
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
    };
    SvgFactory.prototype.createColumnsSvg12 = function () {
        var eSvg = createIconSvg(12);
        [0, 4, 8].forEach(function (y) {
            [0, 7].forEach(function (x) {
                var eBar = document.createElementNS(SVG_NS, "rect");
                eBar.setAttribute("y", y.toString());
                eBar.setAttribute("x", x.toString());
                eBar.setAttribute("width", "5");
                eBar.setAttribute("height", "3");
                eBar.setAttribute("class", "ag-header-icon");
                eSvg.appendChild(eBar);
            });
        });
        return eSvg;
    };
    SvgFactory.prototype.createArrowUpSvg = function () {
        return createPolygonSvg("0,10 5,0 10,10");
    };
    SvgFactory.prototype.createArrowLeftSvg = function () {
        return createPolygonSvg("10,0 0,5 10,10");
    };
    SvgFactory.prototype.createArrowDownSvg = function () {
        return createPolygonSvg("0,0 5,10 10,0");
    };
    SvgFactory.prototype.createArrowRightSvg = function () {
        return createPolygonSvg("0,0 10,5 0,10");
    };
    SvgFactory.prototype.createSmallArrowRightSvg = function () {
        return createPolygonSvg("0,0 6,3 0,6", 6);
    };
    SvgFactory.prototype.createSmallArrowDownSvg = function () {
        return createPolygonSvg("0,0 3,6 6,0", 6);
    };
    //public createOpenSvg() {
    //    return createPlusMinus(true);
    //}
    //
    //public createCloseSvg() {
    //    return createPlusMinus(false);
    //}
    // UnSort Icon SVG
    SvgFactory.prototype.createArrowUpDownSvg = function () {
        var svg = createIconSvg();
        var eAscIcon = document.createElementNS(SVG_NS, "polygon");
        eAscIcon.setAttribute("points", '0,4 5,0 10,4');
        svg.appendChild(eAscIcon);
        var eDescIcon = document.createElementNS(SVG_NS, "polygon");
        eDescIcon.setAttribute("points", '0,6 5,10 10,6');
        svg.appendChild(eDescIcon);
        return svg;
    };
    //public createFolderOpen(size: number): HTMLElement {
    //    var svg = `<svg width="${size}" height="${size}" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1717 931q0-35-53-35h-1088q-40 0-85.5 21.5t-71.5 52.5l-294 363q-18 24-18 40 0 35 53 35h1088q40 0 86-22t71-53l294-363q18-22 18-39zm-1141-163h768v-160q0-40-28-68t-68-28h-576q-40 0-68-28t-28-68v-64q0-40-28-68t-68-28h-320q-40 0-68 28t-28 68v853l256-315q44-53 116-87.5t140-34.5zm1269 163q0 62-46 120l-295 363q-43 53-116 87.5t-140 34.5h-1088q-92 0-158-66t-66-158v-960q0-92 66-158t158-66h320q92 0 158 66t66 158v32h544q92 0 158 66t66 158v160h192q54 0 99 24.5t67 70.5q15 32 15 68z"/></svg>`;
    //    return _.loadTemplate(svg);
    //}
    //
    //public createFolderClosed(size: number): HTMLElement {
    //    var svg = `<svg width="${size}" height="${size}" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1600 1312v-704q0-40-28-68t-68-28h-704q-40 0-68-28t-28-68v-64q0-40-28-68t-68-28h-320q-40 0-68 28t-28 68v960q0 40 28 68t68 28h1216q40 0 68-28t28-68zm128-704v704q0 92-66 158t-158 66h-1216q-92 0-158-66t-66-158v-960q0-92 66-158t158-66h320q92 0 158 66t66 158v32h672q92 0 158 66t66 158z"/></svg>`;
    //    return _.loadTemplate(svg);
    //}
    SvgFactory.prototype.createFolderOpen = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAZpJREFUeNqkU0tLQkEUPjN3ShAzF66CaNGiaNEviFpLgbSpXf2ACIqgFkELaVFhtAratQ8qokU/oFVbMQtJvWpWGvYwtet9TWfu1QorvOGBb84M5/WdOTOEcw7tCKHBlT8sMIhr4BfLGXC4BrALM8QUoveHG9oPQ/NhwVCQbOjp0C5F6zDiwE7Aed/p5tKWruufTlY8bkqliqVN8wvH6wvhydWd5UYdkYCqqgaKotQTCEewnJuDBSqVmshOrWhKgCJVqeHcKtiGKdqTgGIOQmwGum7AxVUKinXKzX1/1y5Xp6g8gpe8iBxuGZhcKjyXQZIkmBkfczS62YnRQCKX75/b3t8QDNhD8QX83V5Ipe7Bybug2Pt5NJ7A4nEqGOQKT+Bzu0HTDNB1syUYYxCJy0kwzIRogb0rKjAiQVXXHLVQrqqvsZtsFu8hbyXwe73WeMQtO5GonJGxuiyeC+Oa4fF5PEirw9nbx9FdxtN5eMwkzcgRnoeCa9DVM/CvH/R2l+axkz3clQguOFjw1f+FUzEQCqJG2v3OHwIMAOW1JPnAAAJxAAAAAElFTkSuQmCC';
        return eImg;
    };
    SvgFactory.prototype.createFolderClosed = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAARlJREFUeNqsUz1PwzAUPDtOUASpYKkQVWcQA/+DhbLA32CoKAMSTAwgFsQfQWLoX4GRDFXGIiqiyk4e7wUWmg8phJPOtvzunc6WrYgIXaD06KKhij0eD2uqUxBeDC9OmcNKCYd7ujm7ryodXz5ong6UPpqcP9+O76y1vwS+7yOOY1jr0OttlQyiaB0n148TAyK9XFqkaboiSTEYDNnkDUkyKxkkiSQkzQbwsiyHcBXz+Tv6/W1m+QiSEDT1igTO5RBWYbH4rNwPw/AnQU5ek0EdCj33SgLjHEHYzoAkgfmHBDmZuktsQqHPvxN0MyCbbWjtIQjWWhlIj/QqtT+6QrSz+6ef9DF7VTwFzE2madnu5K2prt/5S4ABADcIlSf6Ag8YAAAAAElFTkSuQmCC';
        return eImg;
    };
    SvgFactory.prototype.createColumnIcon = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAOCAYAAAAMn20lAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTcwQ0JFMzlENjZEMTFFNUFEQ0U5RDRCNjFFRENGMUMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTcwQ0JFM0FENjZEMTFFNUFEQ0U5RDRCNjFFRENGMUMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFNzBDQkUzN0Q2NkQxMUU1QURDRTlENEI2MUVEQ0YxQyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFNzBDQkUzOEQ2NkQxMUU1QURDRTlENEI2MUVEQ0YxQyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqDOrJYAAABxSURBVHjalJBBDsAgCAQXxXvj2/o/X9Cvmd4lUpV4MXroJMTAuihQSklVMSCysxSBW4uWKzjG6zZLDxrlWis5EVEThoWmi3N+nxAYs2WnXQY34L3HisMWPQlHB+2FPtNW6D/8+ziBRcroOXc0B/wEGABY6TPS1FU0bwAAAABJRU5ErkJggg==';
        return eImg;
    };
    SvgFactory.prototype.createColumnsIcon = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OENFQkI4NDhENzJDMTFFNUJDNEVFRjgwRDI3MkU1Q0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OENFQkI4NDlENzJDMTFFNUJDNEVFRjgwRDI3MkU1Q0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4Q0VCQjg0NkQ3MkMxMUU1QkM0RUVGODBEMjcyRTVDQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4Q0VCQjg0N0Q3MkMxMUU1QkM0RUVGODBEMjcyRTVDQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pj6ozGQAAAAuSURBVHjaYmRgYPjPgBswQml8anBK/idGDQsxNpCghnTAOBoGo2EwGgZgABBgAHbrH/l4grETAAAAAElFTkSuQmCC';
        return eImg;
    };
    SvgFactory.prototype.createPinIcon = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAedJREFUeNqkUktLG1EYPTN31CIN0oWbIAWhKJR0FXcG6gOqkKGKVvEXCKULC91YSBcK7jXgQoIbFxn3ErFgFlIfCxUsQsCoIJYEm9LWNsGmJjPTM+Oo44Aa6IUzd+bec77H+UYyTRP/s5SsLFfCCxEjOhD9CXw64ccXJj7nLleYaMSvaa/+Au9Y73P3RUUBDIuXyaAxGu35A7xnkM57A7icCZXIO8/nkVleRn1/f9cv0xzjfVclFdi9N8ZivfnDQxQKBTwoFvFicLCVQSesJIpHMEY8dSqQWa54Eov1fF9ZQVHXsZNMblhnNE/wPmJPIX1zjOG2+fkgslnozHR2eopLcSIe3yoD48y45FbIxoVJNjimyMehoW3T58PvdBq53V18zeWwFo+vUfyBlCVvj0Li4/M1DnaAUtXCQkNDR4f/294eaoTAwdHRCROMWlzJZfC+1cKcJF07b5o+btWvV1eDyVBouyUcDj5UFDg924tVYtERpz0mCkmSulOp1GQgEIj0yvKPYiKBlwMDQXfPU47walEEmb8z0a5p2qaiKMPEoz6ezQLdM8DWNDDzltym24YthHimquoshSoDicvzZkK9S+h48pjCN4ZhrBPHTptlD0qevezwdCtAHVHrMti4A7rr3eb+E2AAoGnGkgkzpg8AAAAASUVORK5CYII=';
        return eImg;
    };
    SvgFactory.prototype.createPlusIcon = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAatJREFUeNqkU71KA0EQ/vaiib+lWCiordidpSg+QHwDBSt7n8DGhwhYCPoEgqCCINomARuLVIqgYKFG5f6z68xOzrvzYuXA3P7MzLffN7unjDH4jw3xx91bQXuxU4woNDjUX7VgsFOIH3/BnHgC0J65AzwFjDpZgoG7vb7lMsPDq6MiuK+B+kjGwFpCUjwK1DIQ3/dl0ssVh5TTM0UJP8aBgBKGleSGIWyP0oKYRm3KPSgYJ0Q0EpEgCASA2WmWZQY3kazBmjP9UhBFEbTWAgA0f9W2yHeG+vrd+tqGy5r5xNTT9erSqpvfdxwHN7fXOQZ0QhzH1oWArLsfXXieJ/KTGEZLcbVaTVn9ALTOLk9L+mYX5lxd0Xh6eGyVgspK6APwI8n3x9hmNpORJOuBo5ah8GcTc7dAHmkhNpYQlpHr47Hq2NspA1yEwHkoO/MVYLMmWJNarjEUQBzQw7rPvardFC8tZuOEwwB4p9PHqXgCdm738sUDJPB8mnwKj7qCTtJ527+XyAs6tOf2Bb6SP0OeGxRTVMp2h9nweWMoKS20l3+QT/vwqfZbgAEAUCrnlLQ+w4QAAAAASUVORK5CYII=';
        return eImg;
    };
    SvgFactory.prototype.createMinusIcon = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKVJREFUeNpi/P//PwMlgImBQjBqAAMDy3JGRgZGBoaZQGxMikZg3J0F4nSWHxC+cUBamvHXr18Zfv36Bca/f/8G43///oExKLphmImJieHagQMQF7QDiSwg/vnzJ8P3799RDPj79y+KRhhmBLr6I1DPNJABtxkYZM4xMFx7uXAhSX5/CtQD0gv0OgMfyCAgZgViZiL1/wXi30D8h3E0KVNuAECAAQDr51qtGxzf1wAAAABJRU5ErkJggg==';
        return eImg;
    };
    SvgFactory.prototype.createMoveIcon = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAoZJREFUeNpsU81rE0EUf7uzu2lNVJL6Eb0IBWusepqcKm3wEFkvxqDgQbwUtYeeg5cccwj4F7QKChEPipRcdMGDiaAoJAexLYViwYsfbU1JYkx3Zz98b8220Wbg7ez7vXm/mffmN9Kh1G2QGQOmMDiRyYEkSaCoKjDGdAAooOUdxzFsIcDzPPhSvgeO7YDrOLBRmQdlJHULVE0DNRSCvqFjUuHqhWP8+etvhR5m0CeengVhmiAsywdl2Dt03K1wZSrO220XaCaf8AFrQel32s0mrDcaWfovrq3Vc9OTvHj/Tb0Xzh6JxQwNyxtIgPXpqqJk94fDM+1Oh6CaEF4QTiIOGJ/DdQtBObsEmGxbll/rkCyDPDwMzW4XhHD88EH0NcRxDUeX4/qdnsi0s8Aas+kEp8Zg82pMkmpDigKbjSbQTD7hFL94/jin9ZRHBNLo3Wrt+uUkbzQsiEZVMPGKfv76DaawodnahkhY86+PNnXxs77ZgVOjMahWVuufi1NJRZhWvvT0beHGtQn++Nm7en+DzqXO8vfVxX+wsYnT/JWxWEe95P0eILsvkkdPKn4PUEBJmunILab5992PLVU++skoNmOniT7JX2Fkt5GM1EjqbMohXzQmqo7KwCQ6zYKiabu30PpQAnZ0HKSRMcMRwnBddw4ZOO4GLRYKFFdDhrrteTMMdWB9/QTdH8sIp0EKmNT4GWDjGZAPJ3TcrbBv+ibfwtwDqBvzYck/truxYjjLZRDflwLt7JUmEoAymdPV7INa5IXn0Uw+4f8PIqATMLQIWpQ0E/RFTmQ4nLx0B1Zfzrsr5eAmbLQW2hYpHwkcqfegNBJhzwY9sGC4aCZaF81CAvePAAMAcwtApJX/Wo0AAAAASUVORK5CYII=';
        return eImg;
    };
    SvgFactory.prototype.createLeftIcon = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAe9JREFUeNqkUz1oE2EYfu7uuyRKLCFt6g+4VNQWWod+mQRRR1En0UFOHKoNCMKNju4SEQsOzsFNcRGl4CS42AzaKhKcsqhk0Etj7u+773y/6+USbOLSF5574b33eX+e906L4xh7MaYeC/c/IFcowMznEzDTBGPMoldnqEFtkPy708mIqvHHe0s7BcaYJYSwRwPu9vbYRH1XJI4tEYb2jYtHOHko9LvdxE9cYZQcBoF9+9oJ7jgRQt+HFAJSyv9rkO6UkGvXF3mr9QelkpkUINsYR6T8Jrkay8i+b9+5yfnmppMmSFw6e4yrIynBBsdS3jQ1PH/zeTiBIt+9dZpvbTlZh1+Oh/Z3F33XRUj7R1GUxA3DwMx0EYHnDUUMPe9Rfe1tc26uiL6M8aXno+UH6O7PIShPIapMQx6sQMxW4JbL+MkKCKhwNgGN2FD7Pnz82j63coF/aoc4ekDHtxfrzUniaZrW/FfEBomI9Scv7fnVq7zdBwIqajBWpeTd99d3vgBNCaQSzMOLyJ+6ApSPWxSzD61a/MfThupSjVuvxk2A3sazYYGBGbML0OcvW9rMyeRLFO8eVGXnKyacMiug5ikSplLs05dXzqNQWpbv6/URjpK+m6JH3GhQQI2QI+RTmBO0EwQ/RUBcqe31d/4rwAB0lPTXqN6HzgAAAABJRU5ErkJggg==';
        return eImg;
    };
    SvgFactory.prototype.createRightIcon = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAfBJREFUeNqkUz1s00AU/hwSh1SEhiFCYuhCVSExgHRiYKjEVCEyMMGAsjCxZunesWM7dIgEA8JISPyoUhFDFoZOSE2GgtrSIAYWSEPb1HUS23c+8+7iuE5/JKQ+6fOdz/e+970fG2EY4jyWVo9b819hGEZ8WCgW4z2dV2lZFUJYgnNwz9PwXRebc3cGBMfN6XSQy+eHryyCMuv43dRpBCpSz7b1qlB+cI3RWkEYlv+LQFkgBLxuV8s9OAhQLk0w7vsnSHQKVMhqQuYRSRBouK5AqyXwpHSdvfywUYkKb8UEFIU9fXybOY6A+jbszGAP7O/7RBKg2eR4dH+KvV5ej0k0gaqobXO0214c3acUDnt99Pp9cKqDUqLsx68LuHd3gtU+b1eOCOiSaaZQKJjgMsSOy7EnJcSYCZnLwKbojic1weTVMXz81KhTexeSKdSXqrUzh2X84Qxr9SQmx1P48q6mnTPZrJUs4jMp5QlHlSd1Y203fRGFK8DPV28HzqZpjXShW3+D00bamCrpNU9DuvvcGsjea1rO+nvw39+AxRCGckyO8ciQFG8gPT27ptX8/b4gt1asYGdzRGE6MVCXCJcj5NShbG9B/NnYhttpyMYL5XmTYEdw1KgMFSgJJiEbIXNGPQXBi+CTrzTO+zv/E2AA3Y8Nbp4Kn1sAAAAASUVORK5CYII=';
        return eImg;
    };
    SvgFactory.prototype.createColumnVisibleIcon = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAdhJREFUeNrUk01LAlEUhu845QdRUxZBhIIWtFBso2AwRAVNLqKltHCb63b9A/9AixZCELhyYdAmEyYCBcOlNa1CSQoxog/DMY3x9p5B27Zw1YGH8XrO+55759wROOdsmLCwIWNoAwFh/ugfZQKsAQV4gbNf9woqIAeuQHOgGxgIMNix2Wx7iqIsxmKxWU3TxgqFgpWSsix3fT5fK5VKPedyuftOp5OE7oz60hHsYD8UCh3k83k5k8ksGYYx5XK5rK2WzgiIrPQf5aiGakljakVRjKDrZaPR6Oi6zglVVTlFMnnMZXmdK8o2x674IE+1pCHtCFx2w+GwE9u3drtd81yJRAKdDXZ4eGSuFxb87PHxjg3yVEsaNNolg5NSqTTVbDaX7Agq8Hg8TFWLbGVl0xTY7TY2Our5NfhCQPNAWtFisdSr1WqvWCwawWBwRpKkcZyXadoN83qXmSQ50V1jGxurpnGlUqnH4/FzvItTmoo5ApjQNMIOh2MrEon4o9Gov1arzZXL5XHKBwKBT7fbXU+n07fZbPa23W5f4BVd93o9TgYimATTMHHCbB5PN9ZSf0LmrsEHRDWInvB8w/oFvAv920iFDkBzF/64fHTjvoFOxsL//5h+BBgAwjbgRLl5ImwAAAAASUVORK5CYII=';
        return eImg;
    };
    SvgFactory.prototype.createColumnHiddenIcon = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N0ZGNDRBMkJENkU3MTFFNUIwOTBGRTc0MTA3OTI2OEYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N0ZGNDRBMkNENkU3MTFFNUIwOTBGRTc0MTA3OTI2OEYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3RkY0NEEyOUQ2RTcxMUU1QjA5MEZFNzQxMDc5MjY4RiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3RkY0NEEyQUQ2RTcxMUU1QjA5MEZFNzQxMDc5MjY4RiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PjQ0mkwAAACISURBVHjaYvz//z8DJYCJgUIwDAxgKSwspMwAIOYDYlcgtgNiJSBWBGJhIGaHyoHAJyD+CcRvgfg+EN8D4kNAvBtkwGEg1iNgkSCUlgBibSg7D4gvgwywRXKBChArALEIELMCsQBU8Qcg/g3Eb4D4ARDfBeKDMBeAnLcWikkGjKMpcRAYABBgACqXGpPEq63VAAAAAElFTkSuQmCC';
        return eImg;
    };
    SvgFactory.prototype.createGroupIcon = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NUVCNUI1OUNENkYwMTFFNThGNjJDNUE3ODIwMEZERDciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NUVCNUI1OURENkYwMTFFNThGNjJDNUE3ODIwMEZERDciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1RUI1QjU5QUQ2RjAxMUU1OEY2MkM1QTc4MjAwRkRENyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1RUI1QjU5QkQ2RjAxMUU1OEY2MkM1QTc4MjAwRkRENyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PlkCTGoAAACDSURBVHjaYmRgYPjPgBswQun/+BT8X3x5DoZErG4KCj/3/DcMNZMNuRiYGPADRiRX4HYBJV5AB0QrhAGW//8hehgZES6FiaGLYzUAq7sxNf0nxQCsinHFAguegCPKBYxoYfAfWQxNnPgwINJVYMDEQCEYfLHASGoKRQlxPN7BqQggwAAN+SopPnDCwgAAAABJRU5ErkJggg==';
        return eImg;
    };
    SvgFactory.prototype.createAggregationIcon = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAMZJREFUeNpi/P//PwMlgImBQjDwBrCgmMYENq8RiLVxqL8KxPX//v1DiIACEYYZGRlBmBOIe4B4PRDrQMUYoGyQGIoebAbADJkAxFuAWA9JXJdYA0CYC4inAPFOINZHlkPWgxKIcFMhQA0aFveB+DbOUERxDhQAbTEC4qNAPBfqEmRx3F6AAhOgojNAvBikGckumDiKHhY0B3ECcTVQQhRIg/B1NNeeB1IgQ7/BXYvmdE6oAnYcPv4NxF+BerAbMDTzAkCAAQChYIl8b86M1gAAAABJRU5ErkJggg==';
        return eImg;
    };
    SvgFactory.prototype.createGroupIcon12 = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MTNFQzE0NTdEOTk1MTFFNUI4MjJGMjBFRDk4MkMxNjAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MTNFQzE0NThEOTk1MTFFNUI4MjJGMjBFRDk4MkMxNjAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxM0VDMTQ1NUQ5OTUxMUU1QjgyMkYyMEVEOTgyQzE2MCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxM0VDMTQ1NkQ5OTUxMUU1QjgyMkYyMEVEOTgyQzE2MCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PiInRbAAAAEjSURBVHjaYuTi5XqkpKvI9/fXHwZWDlaGZ/eeM7x59raDAQj4pOQrBBUVGP78+MfAzMbE8PLKhU8Mhnb6/6//P/f/8N/d/x8AWUn1cf+BaleCsFPt5P/T/v//3/zj//8JQFrB1vM/I5IN3EAbfgBt+Au0QRBqw3sMG0DiQMwPxFuB2BzKZmLAAViA+BOU/QOI7wPxRyhfCIhT0NT/ZETi7AZiZiD+DOXL6EdlGdkWFzF8evaDgUuIg2F9eiTYBrhuIJ4NxHegfDsgnobuJGQbNgBxMRDfhfLFgDgB3UnInPVALMxAACDbcBGItwDxAyhfCRismejBiuyHiUBsDMQmUL6cSXIJf0hTDsNboEN42RkYJth58TPisV0eaMNFdBsAAgwANVJzd8zQrUcAAAAASUVORK5CYII=';
        return eImg;
    };
    SvgFactory.prototype.createCutIcon = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAlRJREFUeNqkU09okmEcfj6ThNRhjUEJDhxDZ1t4sI3lDrKDhESHpC6x6yBoh52GfcdBJDvtElEUdKhOSq1JjF0SabSton9OmIeRxVKIrUgdU5xvv8e+hXXYpRcefv+e5/mh7/tpSin8z9Gi0Sg0TTsv+edarfa+Wq2iUqmgXC6DudVqhd1uh81ma+UWi8Uv3G5ZPJ9MJmGq1+twOBynBOek6T9oG+fkkU8djymVSiGTyWBiYuL6QSb7YvLIp679+D0ej57NZpX8JD0QCPj7+vrgcrnAyJp9zskj3zD928Tr9er5fF5FIhFdiH4aMLJmn/N98R+Dq5qGSUFQwKFs1AuFggqFQrrT6bzIyJp9zoMGn7qWQU6ST4JNQeK3kd/n8+nFYlGFw+HFdDqtWLOfMHjk5wwDjckRwGYGeJVnBMdXgaNrbveJKysr/etu91pHtVo8BnyXWUnwsgHM7wAVX7MJ0cEmjWvW4eGzjpGRXnNnZ8cFeRi9pRI+dnXtjMbj/cLp57rG1tbPH0tLwd3l5QHp3RBU8E7Txr4MDb1V8bh60tOzfhN4vTc9rRYkCm4tGDX7nJNHPnWt/+CFpt1rF9emptScxKfA2DNZwThn9NtNWjoxMH1Tqru+va02NzbK47FY4PHMzJtdYPYD8OChGDCyZp9z8sinrnWXt4E7q4ODRbrelw0x2Xjyn1fImn3OySOfutYt+IDRSeCycAZeAYm7wKLkshR87A1+cILDAss4EDkNXJI8Ows8yin1nENn+5MXNA3hnpHzHBKYjWhqe4lffwkwAMRcPMqRQZ4vAAAAAElFTkSuQmCC';
        return eImg;
    };
    SvgFactory.prototype.createCopyIcon = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAgBJREFUeNqMk79rFEEcxd/M7V2QAzVFEOMFGwNiIGCjEdIEhYODmEawsFf8G4QQSCPYyqUWCdhY2qSQECSpInvFJYT8Ki6dZO8Sb2P29pfvu+4sm+UKv/AYZna/b95ndla9WFyEUmoewG0Mr+9hGB5EYYhypZIseO0fCHa3sP/LhxVFkazd+by0tOIFAQac+3w5imPYto1Pa2tv+VxR+8bRuv8EevIRxn5uQoszpWI2RjSIBgMMLi/hui76/T6+Li+v8Pkz9k0Wo409pFHAJooUCiWqYlk46nTQ2ttD+/gY75pNPKjVmmfd7gf2vKbu5U0sMWBpzWatNcAkv7n789lZ1GdmMqQ3cbxApIUikg58H5S0JgkSE/L/L1JmoNJmMZEDzCNdK5cxwtFxHHxcXcXTqalm27Zf7rRaRKBBhkAhxcgjiYlUo16HfKlqtYpv29u95Az81EClCFLyaQ0SCib/dtNJ6qsGfDmJnRqoXIKiyVUDz8sSSGy5VnI3ikh5k1KplBnog/V19BxnRCZmV15dGCSdO1wziphcS3rrT7d71zk5Ob8+Pf3eMN4aH3/8qtGYM0hp7iyJbO0bBOrMPTz8kl6OpGoTEzEncwapaCLrRNfu6Wli0Etl6mbfdb0MiYrlXsjZyAUTE0qwOxsbo9aQ3/dGEWlYRRcX5xxG/wowAC8cIjzfyA4lAAAAAElFTkSuQmCC';
        return eImg;
    };
    SvgFactory.prototype.createPasteIcon = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAadJREFUeNpinGLPAAaMjAxwcJ9Tk+0Bt7YPkCkKFXqt8PXqFsXv13/B1Pz/D6FZENoYZgKxMYgh9OI6i567q5hFUp4kiH9i3qTnT3auqWPgZ/gDVXsWiNPBFk+2hxtwxi0syfjy5csM0vFzGTg42Bj4+XnAEh8/fmH48eMXw9OFyQy6uroMu1bNAxlgAnbB338IJ6hlzWU4uXgJw6FDO4Ga+Rl4eXkZWFlZGb58/crw6eNHBjG7Iga1yAiG7SvmwfWw/P2LMADkraiYaIb79+4xYAOKSkpgNch6UFzwFxgy//79Y5BTUMBqwF+g3H8mJgZkPSgu+Ac04M+/fwz4AAswulBc8Ocfqg1/kGWxAEagAch6WP78RfUCIQOYmJkZ/qC44A+qAb8JeIEZZMkfXC4gwgsQNUgG/CbRC2BXIhvw8AsDgzQnkgEEvACxBMJ++h0YJmufMTA8ABry8xckGkFOxIdBakBqQXpAekGZiXPTSwbeUAEgB5hsObm58acDoJp3nxkYNn1gEANyP4MNAGKxh18ZbsXxsjMQA97/Z7gF0gPEfwACDAB/y9xB1I3/FQAAAABJRU5ErkJggg==';
        return eImg;
    };
    SvgFactory.prototype.createMenuIcon = function () {
        var eImg = document.createElement('img');
        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjM3MUVBMzlERkJEMTFFNUEwMjFFNDJDMDlCMUY3OTciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjM3MUVBM0FERkJEMTFFNUEwMjFFNDJDMDlCMUY3OTciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCMzcxRUEzN0RGQkQxMUU1QTAyMUU0MkMwOUIxRjc5NyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCMzcxRUEzOERGQkQxMUU1QTAyMUU0MkMwOUIxRjc5NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pux7nZcAAAGtSURBVHjalFM9a8JQFL0veYkfYJUQEYuIIF07uToVpGuHOgid3dJN+i+K4C6CXQqFjplcCoKbXZ0EqRUFP/CTxCS9NzTdNOmBx32P3Nx3zj33sXq9/tRqtbRYLCaLomhBANi2La5WK7NSqTRYNpt1LMsCLACO47iLMXY2CoIAm80GZFkGoVQqfWy3WzBNE6gQVveNhmHAbreDYrHYZaPRKKTr+i0ykTDBPnUzgfYEvFkYDAZWoVDQWb/fB9QD6XQajscjBCkQDodhOBzCcrkEVq1WXfoEL9EPlEdSZrMZ8Pl8frVYLO7QgRB+sPx+/GUk4qUGNvOdYSO+JpPJJdHyc8ADnUluIpH45vv9XiFbiFIQC71IjuBe5ZlM5gYlPHLOL7C4AcEgofXbXC7X4PF4vKuqahf+AWJxOBwgEokA6/V67kFRFFcGLU/SqShJkusATSNbr9fQ6XSuU6mUQP3BBIaJZyM6BuPx2Mnn85+sVqu9ttvt+2QyGXgOqInT6RTK5fIbwwl0iFI0Gv2btCA9QPdcOVzTtOdms/mAnnKkaAexES0UcG/hc375EWAA94tOP0vEOEcAAAAASUVORK5CYII=';
        return eImg;
    };
    return SvgFactory;
})();
exports.SvgFactory = SvgFactory;
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
function createPolygonSvg(points, width) {
    var eSvg = createIconSvg(width);
    var eDescIcon = document.createElementNS(SVG_NS, "polygon");
    eDescIcon.setAttribute("points", points);
    eSvg.appendChild(eDescIcon);
    return eSvg;
}
// util function for the above
function createIconSvg(width) {
    var eSvg = document.createElementNS(SVG_NS, "svg");
    if (width > 0) {
        eSvg.setAttribute("width", width);
        eSvg.setAttribute("height", width);
    }
    else {
        eSvg.setAttribute("width", "10");
        eSvg.setAttribute("height", "10");
    }
    return eSvg;
}
function createCircle(fill) {
    var eSvg = createIconSvg();
    var eCircle = document.createElementNS(SVG_NS, "circle");
    eCircle.setAttribute("cx", "5");
    eCircle.setAttribute("cy", "5");
    eCircle.setAttribute("r", "5");
    eCircle.setAttribute("stroke", "black");
    eCircle.setAttribute("stroke-width", "2");
    if (fill) {
        eCircle.setAttribute("fill", "black");
    }
    else {
        eCircle.setAttribute("fill", "none");
    }
    eSvg.appendChild(eCircle);
    return eSvg;
}
