export class SizeMonitor {
    static init() {
        const NativeResizeObserver = window.ResizeObserver;
        if (NativeResizeObserver) {
            this.resizeObserver = new NativeResizeObserver((entries) => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    this.checkSize(this.elements.get(entry.target), entry.target, width, height);
                }
            });
        }
        else {
            // polyfill (more reliable even in browsers that support ResizeObserver)
            const step = () => {
                this.elements.forEach((entry, element) => {
                    this.checkClientSize(element, entry);
                });
            };
            window.setInterval(step, 100);
        }
        this.ready = true;
    }
    static checkSize(entry, element, width, height) {
        if (entry) {
            if (!entry.size || width !== entry.size.width || height !== entry.size.height) {
                entry.size = { width, height };
                entry.cb(entry.size, element);
            }
        }
    }
    // Only a single callback is supported.
    static observe(element, cb) {
        if (!this.ready) {
            this.init();
        }
        this.unobserve(element);
        if (this.resizeObserver) {
            this.resizeObserver.observe(element);
        }
        this.elements.set(element, { cb });
        // Ensure first size callback happens synchronously.
        this.checkClientSize(element, { cb });
    }
    static unobserve(element) {
        if (this.resizeObserver) {
            this.resizeObserver.unobserve(element);
        }
        this.elements.delete(element);
    }
    static checkClientSize(element, entry) {
        const width = element.clientWidth ? element.clientWidth : 0;
        const height = element.clientHeight ? element.clientHeight : 0;
        this.checkSize(entry, element, width, height);
    }
}
SizeMonitor.elements = new Map();
SizeMonitor.ready = false;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2l6ZU1vbml0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdXRpbC9zaXplTW9uaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFVQSxNQUFNLE9BQU8sV0FBVztJQUtwQixNQUFNLENBQUMsSUFBSTtRQUNQLE1BQU0sb0JBQW9CLEdBQUksTUFBYyxDQUFDLGNBQWMsQ0FBQztRQUU1RCxJQUFJLG9CQUFvQixFQUFFO1lBQ3RCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxDQUFDLE9BQVksRUFBRSxFQUFFO2dCQUM1RCxLQUFLLE1BQU0sS0FBSyxJQUFJLE9BQU8sRUFBRTtvQkFDekIsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO29CQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztpQkFDaEY7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCx3RUFBd0U7WUFDeEUsTUFBTSxJQUFJLEdBQUcsR0FBRyxFQUFFO2dCQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO29CQUNyQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDekMsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUM7WUFDRixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNqQztRQUVELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUM7SUFFTyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQXdCLEVBQUUsT0FBb0IsRUFBRSxLQUFhLEVBQUUsTUFBYztRQUNsRyxJQUFJLEtBQUssRUFBRTtZQUNQLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxNQUFNLEtBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQzNFLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7Z0JBQy9CLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQzthQUNqQztTQUNKO0lBQ0wsQ0FBQztJQUVELHVDQUF1QztJQUN2QyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQW9CLEVBQUUsRUFBZ0I7UUFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDYixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDZjtRQUNELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEIsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3JCLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVuQyxvREFBb0Q7UUFDcEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQW9CO1FBQ2pDLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNyQixJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMxQztRQUNELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxNQUFNLENBQUMsZUFBZSxDQUFDLE9BQW9CLEVBQUUsS0FBWTtRQUNyRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDbEQsQ0FBQzs7QUE5RGMsb0JBQVEsR0FBRyxJQUFJLEdBQUcsRUFBc0IsQ0FBQztBQUV6QyxpQkFBSyxHQUFHLEtBQUssQ0FBQyJ9