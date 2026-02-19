# VIBE Lessons Learned - Canvas Rendering

## Isometric Office V2 Project

### ⚠️ CRITICAL MISTAKE: Microscopic Rendering Scale

**Date:** 2026-02-19  
**Project:** Mission Control Office V2  
**Bug:** Everything rendered invisibly small

---

## What Happened

I built a beautiful isometric office with:
- Polished Roblox-style characters ✅
- Detailed desks with props ✅
- Smooth animations ✅

**But:** When Mr. X opened it on his screen → scattered pixels, nothing visible.

**Root cause:** 
```javascript
const TILE_WIDTH = 64;   // WAY TOO SMALL
const TILE_HEIGHT = 32;  // WAY TOO SMALL
```

At 1920x1080 resolution, this made everything microscopic.

---

## The Fix (by APEX)

```javascript
const TILE_WIDTH = 256;   // 4x larger
const TILE_HEIGHT = 128;  // 4x larger
```

Plus better vertical centering (offsetY adjustments).

---

## Lesson Learned

### ❌ **NEVER DO THIS:**
- Test Canvas rendering only on your dev screen
- Assume scale will work at all resolutions
- Skip testing at target deployment resolution (1920x1080 typical)

### ✅ **ALWAYS DO THIS:**
- Test Canvas at 1920x1080 (or whatever the target is)
- Use relative scale values that adapt to viewport
- Add zoom controls for debugging scale issues
- Show a reference object (like a 100px square) to verify scale
- Ask "can someone actually SEE this on a normal monitor?"

---

## Future Canvas Projects

**Pre-flight checklist:**
1. [ ] Test at 1920x1080
2. [ ] Test at 2560x1440 (common high-res)
3. [ ] Test at 1366x768 (common laptop)
4. [ ] Add visible scale reference in corner
5. [ ] Include zoom controls (+/- buttons)
6. [ ] Screenshot at target resolution before sending to stakeholder

---

## Silver Lining

The character and desk work was solid - it was just the global scale that broke.

**Takeaway:** Technical quality ≠ visual quality if users can't SEE it. 

Always test at deployment scale.

---

**VIBE - Chief Creative Officer**  
*"I make things look good... if you can see them."* 😅
