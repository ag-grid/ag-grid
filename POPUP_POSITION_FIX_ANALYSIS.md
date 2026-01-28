# AG Grid Popup Position Fix - Analysis & Solution

## Issue Summary

When selecting/deselecting options in `agSetColumnFilter`, the popup position keeps shifting in server-side rendering environments. The CSS class `ag-popup-positioned-under` is repeatedly added/removed, causing visual jumping.

## Root Cause Analysis

### Call Stack During Filter Selection

1. **User Action**: Select/deselect a filter option
2. **SetFilter.onItemSelected()** → `setFilter.ts:798`
3. **SetFilter.refreshAfterSelection()** → `setFilter.ts:836`
4. **SetFilter.checkAndRefreshVirtualList()** → `setFilter.ts:882`
5. **VirtualList.refresh()** → `agVirtualList.ts:382`
6. **Container Height Update** → `agVirtualList.ts:389`:
   ```typescript
   this.eContainer.style.height = `${rowCount * this.rowHeight}px`;
   ```
7. **ResizeObserver Triggers** → `basePopupService.ts:345`
8. **updatePopupPosition(true) Called** → `basePopupService.ts:306`
9. **Position Recalculated** → `basePopupService.ts:123-145`
10. **shouldRenderUnderOrAbove()** → `basePopupService.ts:233-250`
11. **setAlignedStyles() Updates CSS Classes** → `basePopupService.ts:254-282`

### The Problem

The `positionPopupByComponent` method's `updatePosition` function is called every time the resize observer fires. This happens even when:
- The popup doesn't actually need to move
- Only internal content (virtual list) is updating
- The calculated X/Y position remains the same

**Critical Issue**: Even when `x` and `y` don't change, the code still:
1. Sets `ePopup.style.left` and `ePopup.style.top` (lines 335-336)
2. Calls `postProcessCallback()` (line 338-340)
3. Calls `setAlignedStyles()` which adds/removes CSS classes (line 254-282)

### Why CSS Classes Keep Changing

In `positionPopupByComponent`:
```typescript
const updatePosition = () => {
    // ... calculate x, y ...
    
    if (position === 'over') {
        this.setAlignedStyles(ePopup, 'over');
    } else {
        this.setAlignedStyles(ePopup, 'under');  // Called every time!
        const alignSide = this.shouldRenderUnderOrAbove(...);
        // ... position calculation ...
    }
    return { x, y };
};
```

Every resize triggers `updatePosition()`, which:
1. Recalculates position (even if unchanged)
2. Calls `setAlignedStyles()` unconditionally
3. Removes then re-adds CSS classes
4. Causes layout thrashing in SSR environments

## The Fix

### What Changed

Modified `basePopupService.ts:positionPopup()` to track last calculated position:

```typescript
const lastPosition = { x: 0, y: 0 };

const updatePopupPosition = (fromResizeObserver: boolean = false) => {
    let { x, y } = updatePosition!();
    
    // ... size check, nudge calculations ...
    
    // NEW: Skip updates if position hasn't changed
    if (fromResizeObserver && x === lastPosition.x && y === lastPosition.y) {
        return;
    }
    
    lastPosition.x = x;
    lastPosition.y = y;
    
    ePopup.style.left = `${x}px`;
    ePopup.style.top = `${y}px`;
    
    if (params.postProcessCallback) {
        params.postProcessCallback();  // Only called if position changed
    }
};
```

### Why This Works

1. **Prevents Redundant Updates**: When virtual list content changes but popup position stays the same, no DOM updates occur
2. **Stops CSS Class Thrashing**: `setAlignedStyles()` (called via `postProcessCallback`) only runs when position actually changes
3. **Maintains Functionality**: Still responds to genuine position changes (scroll, window resize, etc.)
4. **Performance**: Reduces layout recalculations in SSR environments

## Impact Areas

### Files Modified
- `packages/ag-grid-community/src/agStack/popup/basePopupService.ts`

### Affected Components
- Set Filter (`agSetColumnFilter`)
- All popup menus (column menu, context menu, etc.)
- Any component using popup positioning system

### CSS Classes Managed
- `ag-popup-positioned-under`
- `ag-popup-positioned-above`
- `ag-popup-positioned-over`
- `ag-popup-positioned-left`
- `ag-popup-positioned-right`
- `ag-has-popup-positioned-{position}` (on source element)

## Testing Recommendations

### Manual Testing
1. Open Set Filter in SSR environment
2. Select/deselect multiple options rapidly
3. Verify popup doesn't jump or shift
4. Check CSS classes in DevTools (should be stable)

### Automated Testing
1. Unit test for position tracking
2. Integration test for filter selection
3. SSR-specific rendering tests

### Regression Testing
- Column menu positioning
- Context menu positioning
- Floating filter positioning
- Cell editor popup positioning
- Date picker positioning

## Alternative Solutions Considered

### 1. Disable Resize Observer for Set Filter
**Rejected**: Would break legitimate use cases like async data loading

### 2. Debounce Resize Observer
**Rejected**: Would add lag and complexity

### 3. Skip setAlignedStyles() When Position Unchanged
**Rejected**: More invasive change, requires modifying updatePosition callback contract

### 4. Current Solution: Track Last Position
**Selected**: Minimal change, handles root cause, maintains all functionality

## Migration Notes

No breaking changes. This is an internal optimization that should be transparent to users. The existing workaround using MutationObserver can be safely removed after upgrade.

## Related Issues

- Popup position recalculation on content changes
- CSS class thrashing in SSR environments
- Performance degradation with virtual scrolling in popups
