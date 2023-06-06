export function toTooltipHtml(input, defaults) {
    var _a, _b, _c;
    if (typeof input === 'string') {
        return input;
    }
    defaults = defaults !== null && defaults !== void 0 ? defaults : {};
    var _d = input.content, content = _d === void 0 ? (_a = defaults.content) !== null && _a !== void 0 ? _a : '' : _d, _e = input.title, title = _e === void 0 ? (_b = defaults.title) !== null && _b !== void 0 ? _b : undefined : _e, _f = input.color, color = _f === void 0 ? defaults.color : _f, _g = input.backgroundColor, backgroundColor = _g === void 0 ? defaults.backgroundColor : _g, _h = input.opacity, opacity = _h === void 0 ? (_c = defaults.opacity) !== null && _c !== void 0 ? _c : 1 : _h;
    var titleHtml;
    var contentHtml;
    if (color) {
        titleHtml = title
            ? "<span class=\"" + SparklineTooltip.class + "-title\"; style=\"color: " + color + "\">" + title + "</span>"
            : '';
        contentHtml = "<span class=\"" + SparklineTooltip.class + "-content\" style=\"color: " + color + "\">" + content + "</span>";
    }
    else {
        titleHtml = title ? "<span class=\"" + SparklineTooltip.class + "-title\">" + title + "</span>" : '';
        contentHtml = "<span class=\"" + SparklineTooltip.class + "-content\">" + content + "</span>";
    }
    var style = "opacity: " + opacity;
    if (backgroundColor) {
        style += "; background-color: " + backgroundColor.toLowerCase();
    }
    return "<div class=\"" + SparklineTooltip.class + "\" style=\"" + style + "\">\n                " + titleHtml + "\n                " + contentHtml + "\n            </div>";
}
var SparklineTooltip = /** @class */ (function () {
    function SparklineTooltip() {
        this.element = document.createElement('div');
        var tooltipRoot = document.body;
        tooltipRoot.appendChild(this.element);
    }
    SparklineTooltip.prototype.isVisible = function () {
        var element = this.element;
        if (element.classList) {
            return !element.classList.contains(SparklineTooltip.class + "-wrapper-hidden");
        }
        // IE11
        var classes = element.getAttribute('class');
        if (classes) {
            return classes.split(' ').indexOf(SparklineTooltip.class + "-wrapper-hidden") < 0;
        }
        return false;
    };
    SparklineTooltip.prototype.updateClass = function (visible) {
        var classList = [SparklineTooltip.class + "-wrapper"];
        if (visible !== true) {
            classList.push(SparklineTooltip.class + "-wrapper-hidden");
        }
        this.element.setAttribute('class', classList.join(' '));
    };
    SparklineTooltip.prototype.show = function (meta, html) {
        var _a, _b, _c, _d;
        this.toggle(false);
        var element = this.element;
        if (html !== undefined) {
            element.innerHTML = html;
        }
        else if (!element.innerHTML) {
            return;
        }
        var xOffset = (_b = (_a = meta.position) === null || _a === void 0 ? void 0 : _a.xOffset) !== null && _b !== void 0 ? _b : 10;
        var yOffset = (_d = (_c = meta.position) === null || _c === void 0 ? void 0 : _c.yOffset) !== null && _d !== void 0 ? _d : 0;
        var left = meta.pageX + xOffset;
        var top = meta.pageY + yOffset;
        var tooltipRect = element.getBoundingClientRect();
        var maxLeft = window.innerWidth - tooltipRect.width;
        if (meta.container) {
            var containerRect = meta.container.getBoundingClientRect();
            maxLeft = containerRect.left + (containerRect.width - tooltipRect.width);
        }
        if (left > maxLeft) {
            left = meta.pageX - element.clientWidth - xOffset;
        }
        if (typeof scrollX !== 'undefined') {
            left += scrollX;
        }
        if (typeof scrollY !== 'undefined') {
            top += scrollY;
        }
        element.style.left = Math.round(left) + "px";
        element.style.top = Math.round(top) + "px";
        this.toggle(true);
    };
    SparklineTooltip.prototype.toggle = function (visible) {
        this.updateClass(visible);
    };
    SparklineTooltip.prototype.destroy = function () {
        var parentNode = this.element.parentNode;
        if (parentNode) {
            parentNode.removeChild(this.element);
        }
    };
    SparklineTooltip.class = 'ag-sparkline-tooltip';
    return SparklineTooltip;
}());
export { SparklineTooltip };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhcmtsaW5lVG9vbHRpcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zcGFya2xpbmUvdG9vbHRpcC9zcGFya2xpbmVUb29sdGlwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVlBLE1BQU0sVUFBVSxhQUFhLENBQUMsS0FBcUMsRUFBRSxRQUFnQzs7SUFDakcsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDM0IsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFFRCxRQUFRLEdBQUcsUUFBUSxhQUFSLFFBQVEsY0FBUixRQUFRLEdBQUksRUFBRSxDQUFDO0lBR3RCLElBQUEsS0FLQSxLQUFLLFFBTDJCLEVBQWhDLE9BQU8sbUJBQUcsTUFBQSxRQUFRLENBQUMsT0FBTyxtQ0FBSSxFQUFFLEtBQUEsRUFDaEMsS0FJQSxLQUFLLE1BSjhCLEVBQW5DLEtBQUssbUJBQUcsTUFBQSxRQUFRLENBQUMsS0FBSyxtQ0FBSSxTQUFTLEtBQUEsRUFDbkMsS0FHQSxLQUFLLE1BSGlCLEVBQXRCLEtBQUssbUJBQUcsUUFBUSxDQUFDLEtBQUssS0FBQSxFQUN0QixLQUVBLEtBQUssZ0JBRnFDLEVBQTFDLGVBQWUsbUJBQUcsUUFBUSxDQUFDLGVBQWUsS0FBQSxFQUMxQyxLQUNBLEtBQUssUUFEMEIsRUFBL0IsT0FBTyxtQkFBRyxNQUFBLFFBQVEsQ0FBQyxPQUFPLG1DQUFJLENBQUMsS0FBQSxDQUN6QjtJQUVWLElBQUksU0FBUyxDQUFDO0lBQ2QsSUFBSSxXQUFXLENBQUM7SUFFaEIsSUFBSSxLQUFLLEVBQUU7UUFDUCxTQUFTLEdBQUcsS0FBSztZQUNiLENBQUMsQ0FBQyxtQkFBZ0IsZ0JBQWdCLENBQUMsS0FBSyxpQ0FBMEIsS0FBSyxXQUFLLEtBQUssWUFBUztZQUMxRixDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ1QsV0FBVyxHQUFHLG1CQUFnQixnQkFBZ0IsQ0FBQyxLQUFLLGtDQUEyQixLQUFLLFdBQUssT0FBTyxZQUFTLENBQUM7S0FDN0c7U0FBTTtRQUNILFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLG1CQUFnQixnQkFBZ0IsQ0FBQyxLQUFLLGlCQUFXLEtBQUssWUFBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDekYsV0FBVyxHQUFHLG1CQUFnQixnQkFBZ0IsQ0FBQyxLQUFLLG1CQUFhLE9BQU8sWUFBUyxDQUFDO0tBQ3JGO0lBRUQsSUFBSSxLQUFLLEdBQUcsY0FBWSxPQUFTLENBQUM7SUFDbEMsSUFBSSxlQUFlLEVBQUU7UUFDakIsS0FBSyxJQUFJLHlCQUF1QixlQUFlLENBQUMsV0FBVyxFQUFJLENBQUM7S0FDbkU7SUFFRCxPQUFPLGtCQUFlLGdCQUFnQixDQUFDLEtBQUssbUJBQVksS0FBSyw2QkFDL0MsU0FBUywwQkFDVCxXQUFXLHlCQUNWLENBQUM7QUFDcEIsQ0FBQztBQUVEO0lBS0k7UUFKQSxZQUFPLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFLakQsSUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztRQUNsQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsb0NBQVMsR0FBVDtRQUNZLElBQUEsT0FBTyxHQUFLLElBQUksUUFBVCxDQUFVO1FBQ3pCLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUNuQixPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUksZ0JBQWdCLENBQUMsS0FBSyxvQkFBaUIsQ0FBQyxDQUFDO1NBQ2xGO1FBRUQsT0FBTztRQUNQLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUMsSUFBSSxPQUFPLEVBQUU7WUFDVCxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFJLGdCQUFnQixDQUFDLEtBQUssb0JBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDckY7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQsc0NBQVcsR0FBWCxVQUFZLE9BQWlCO1FBQ3pCLElBQU0sU0FBUyxHQUFHLENBQUksZ0JBQWdCLENBQUMsS0FBSyxhQUFVLENBQUMsQ0FBQztRQUV4RCxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7WUFDbEIsU0FBUyxDQUFDLElBQUksQ0FBSSxnQkFBZ0IsQ0FBQyxLQUFLLG9CQUFpQixDQUFDLENBQUM7U0FDOUQ7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCwrQkFBSSxHQUFKLFVBQUssSUFBMEIsRUFBRSxJQUFhOztRQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRVgsSUFBQSxPQUFPLEdBQUssSUFBSSxRQUFULENBQVU7UUFFekIsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQ3BCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1NBQzVCO2FBQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7WUFDM0IsT0FBTztTQUNWO1FBRUQsSUFBTSxPQUFPLEdBQUcsTUFBQSxNQUFBLElBQUksQ0FBQyxRQUFRLDBDQUFFLE9BQU8sbUNBQUksRUFBRSxDQUFDO1FBQzdDLElBQU0sT0FBTyxHQUFHLE1BQUEsTUFBQSxJQUFJLENBQUMsUUFBUSwwQ0FBRSxPQUFPLG1DQUFJLENBQUMsQ0FBQztRQUU1QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztRQUNoQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztRQUUvQixJQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUVwRCxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUM7UUFFcEQsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2hCLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUU3RCxPQUFPLEdBQUcsYUFBYSxDQUFDLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzVFO1FBRUQsSUFBSSxJQUFJLEdBQUcsT0FBTyxFQUFFO1lBQ2hCLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1NBQ3JEO1FBRUQsSUFBSSxPQUFPLE9BQU8sS0FBSyxXQUFXLEVBQUU7WUFDaEMsSUFBSSxJQUFJLE9BQU8sQ0FBQztTQUNuQjtRQUNELElBQUksT0FBTyxPQUFPLEtBQUssV0FBVyxFQUFFO1lBQ2hDLEdBQUcsSUFBSSxPQUFPLENBQUM7U0FDbEI7UUFFRCxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksR0FBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFJLENBQUM7UUFDN0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBSSxDQUFDO1FBRTNDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELGlDQUFNLEdBQU4sVUFBTyxPQUFpQjtRQUNwQixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCxrQ0FBTyxHQUFQO1FBQ1ksSUFBQSxVQUFVLEdBQUssSUFBSSxDQUFDLE9BQU8sV0FBakIsQ0FBa0I7UUFFcEMsSUFBSSxVQUFVLEVBQUU7WUFDWixVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN4QztJQUNMLENBQUM7SUF0Rk0sc0JBQUssR0FBVyxzQkFBc0IsQ0FBQztJQXVGbEQsdUJBQUM7Q0FBQSxBQTFGRCxJQTBGQztTQTFGWSxnQkFBZ0IifQ==