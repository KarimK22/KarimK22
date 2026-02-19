# CRITICAL BUG FIX - Office V2 Missing Agents

**Date:** 2026-02-19 14:08 UTC  
**Reporter:** @hyperk22 via APEX  
**Issue:** Only 1 of 3 agents visible on screen

---

## Problem

User screenshot showed:
- ✅ Isometric floor rendering
- ✅ ONE agent visible (labeled "Master")  
- ✅ ONE desk visible
- ❌ Missing 2 agents (INSIGHT, VIBE)
- Stats correctly show "3 Idle" (data exists in Convex)

---

## Root Cause Analysis

### Bug #1: Microscopic Scale (FIXED by APEX)
- Original TILE_WIDTH=64, TILE_HEIGHT=32
- Made everything invisible at 1920x1080
- **Fix:** APEX scaled 4x → TILE_WIDTH=256, TILE_HEIGHT=128 ✅

### Bug #2: Off-Screen Positioning (FIXED by VIBE)
- 4x scale made grid positions 4x further apart
- Original agent positions pushed 2 agents outside viewport

**Position calculations at 4x scale:**
```
APEX (2,2):    screen X=0,   Y=256  ✅ visible (center)
INSIGHT (6,2): screen X=512, Y=512  ❌ off right edge
VIBE (4,5):    screen X=-128, Y=576 ❌ off bottom/left edge
```

On a 1400px wide canvas:
- Center = 700px
- INSIGHT renders at 700+512 = 1212px (outside 1400px width)
- VIBE renders at 250+576 = 826px (outside 700px height)

---

## Fixes Applied

### 1. Agent Positions (Tighter Clustering)
```javascript
// OLD (spread too far for 4x scale):
main:    { x: 2,   y: 2   }
insight: { x: 6,   y: 2   }
vibe:    { x: 4,   y: 5   }

// NEW (compact for visibility):
main:    { x: 0,   y: 0   }
insight: { x: 3,   y: 0   }
vibe:    { x: 1.5, y: 2.5 }
```

### 2. Floor Grid (Reduced Size)
```javascript
// OLD: -4 to +8 (13x13 grid = huge at 4x scale)
for (let x = -4; x <= 8; x++)
  for (let y = -4; y <= 8; y++)

// NEW: -2 to +4 (7x7 grid)
for (let x = -2; x <= 4; x++)
  for (let y = -2; y <= 4; y++)
```

### 3. Meeting Table (Re-centered)
```javascript
// OLD: (3.5, 3.5)
// NEW: (1, 1)
```

### 4. Decorations (Adjusted)
```javascript
// Plants, door, coffee repositioned for smaller grid
// Emoji size: 24px → 48px (for 4x scale visibility)
```

### 5. Click/Hover Detection (Offset Mismatch Fixed)
```javascript
// OLD: hardcoded offsetY = 150
// NEW: offsetY = rect.height / 2 - 100 (matches rendering)
```

### 6. Fallback Rendering
- Added fallback for missing Convex data
- Use hardcoded names if `agents` query returns null/incomplete
- Default to "idle" status if no Convex data

### 7. Debug Logging
```javascript
console.log(`Rendering ${agentId}: pos=(${data.x},${data.y}) name=${displayName}`);
```

---

## Expected Result

✅ All 3 agents visible within viewport  
✅ All 3 desks rendered  
✅ Proper labels (APEX/INSIGHT/VIBE)  
✅ Floor grid fits canvas  
✅ Click detection works  
✅ Hover states work

---

## Testing Checklist

- [ ] All 3 agents visible at 1920x1080
- [ ] All 3 agents visible at 1366x768
- [ ] All 3 desks with monitors rendered
- [ ] Labels show correct names
- [ ] Click detection selects correct agent
- [ ] Hover highlights work
- [ ] No agents clipped/off-screen

---

## File Modified

`/root/.openclaw/workspace/mission-control/app/office-v2/page.tsx`

**Changes:**
- Lines ~660: Agent positions
- Lines ~730: Floor grid loop
- Lines ~740: Meeting table position
- Lines ~820: Decorations
- Lines ~850: Click offset
- Lines ~870: Hover offset
- Lines ~750: Fallback rendering logic
- Lines ~760: Debug logging

---

## Deploy Status

**Ready for deployment:** YES ✅  
**Needs testing:** Deploy to Vercel → verify all 3 agents visible

**Next:** APEX to deploy + send screenshot to Mr. X

---

**Fixed by:** VIBE  
**Reviewed by:** Awaiting APEX deployment
