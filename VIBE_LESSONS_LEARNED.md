# Lessons Learned - Isometric Office V2 Project

**Project:** Mission Control Isometric Office Visualization  
**Agent:** VIBE 🎨  
**Duration:** 5h 30m development + 11m critical bug fix  
**Date:** 2026-02-19

---

## Technical Lessons

### 1. Coordinate System Math is Mission-Critical

**What happened:**
- Characters positioned at z=25 in isometric grid
- With 256px TILE_HEIGHT, each z unit = 64px vertical offset
- Result: -1600px screen position (way off viewport)

**Lesson:** Always validate screen coordinates, not just grid logic. Console.log screen positions early in testing.

**Prevention:**
```typescript
// DEBUG early and often:
const pos = gridToScreen(x, y, z);
console.log(`Grid(${x},${y},${z}) → Screen(${pos.x}, ${pos.y})`);
```

---

### 2. Scale Magnifies Problems

**What happened:**
- Original tile scale: 64x32 (fine, but small)
- APEX increased to 4x: 256x128 (better visuals)
- Existing z=25 offset became 4x worse (-400px → -1600px)

**Lesson:** When changing fundamental constants (tile size, scale factors), audit ALL dependent calculations. Small errors become catastrophic at scale.

**Prevention:**
- Keep a "scaling audit checklist"
- Test at multiple scales during development
- Use relative positioning where possible (not hardcoded z-values)

---

### 3. Trust the Symptoms

**Symptom:** Render loop running, console logs correct, no errors, but nothing visible.

**Wrong hypothesis:** "Maybe Convex data is broken" ❌  
**Right hypothesis:** "Math is putting things off-screen" ✅

**Lesson:** When code executes without errors but produces no output → coordinate/positioning bug, not logic bug.

**Diagnostic pattern:**
1. Verify function is called (✅ console logs showed it was)
2. Verify inputs are valid (✅ positions/colors were correct)
3. Calculate expected screen coordinates (❌ -1600px is off-screen!)
4. Fix the math

---

### 4. Canvas 2D > CSS 3D Transforms (For This Use Case)

**CSS 3D attempt:** Distortion, perspective issues, hard to control  
**Canvas 2D solution:** Pixel-perfect, full control, smooth animations

**Lesson:** Sometimes the "modern" approach (CSS 3D) isn't the right tool. Canvas 2D isometric math is old-school but reliable.

---

### 5. Debug Logging Strategy

**What worked:**
```typescript
// Broad logging in render loop:
console.log(`Rendering ${agentId}: pos=(${data.x},${data.y})`);

// Detailed logging in suspected function:
const screenPos = gridToScreen(x, y, z);
console.log(`🎨 drawCharacter: grid(${x},${y},${z}) → screen(${screenPos.x}, ${screenPos.y})`);
```

**Lesson:** Layer your logging - start broad (is function called?), then go deep (what are the values?). Remove logs after fix.

---

## Process Lessons

### 6. Communication is Key

**APEX's bug report included:**
- Clear symptoms (floor visible, characters not)
- What was tried (viewport fix deployed)
- Console logs (render loop executing)
- Question: "What do you need to debug?"

**Lesson:** Good bug reports save time. Include:
- What you see vs. what you expect
- What you already tried
- Console errors/logs
- Environment details (browser, URL)

---

### 7. Document As You Go

**Created during project:**
- `ISOMETRIC-OFFICE-V2.md` - Architecture decisions
- `VIBE_PROGRESS.md` - Status updates
- `BUG-FIX-REPORT.md` - Root cause analysis

**Lesson:** Future-you (and your team) will thank you. 20 minutes of writing saves 2 hours of "wait, why did we do it this way?"

---

### 8. Fix Fast, Deploy Faster

**Timeline:**
- 14:25 UTC - Bug reported by APEX
- 14:36 UTC - Fix committed (11 minutes)
- Immediate deploy via git push

**Lesson:** When you know the fix, move fast. Don't over-think. Test locally, commit, push. Iterate if needed.

---

## Design Lessons

### 9. Roblox Aesthetic = Simplicity

**What worked:**
- Blocky characters (no curves)
- Clear facial features (big eyes, simple smile)
- Strong animations (head bob, arm swing)

**What didn't work:**
- Over-detailed faces
- Subtle animations (too small to see)

**Lesson:** Stylized > realistic for this project. Embrace the blockiness.

---

### 10. Props Add Personality

**Desk props:**
- Coffee cup with steam ☕
- Papers with text lines 📄
- Keyboard + mouse ⌨️

**Impact:** Desks went from "generic furniture" to "this is someone's workspace"

**Lesson:** Small details matter. 5 minutes adding a coffee cup adds 50% more character.

---

## Future Improvements

**If we do this again:**
1. **Unit tests for gridToScreen math** - Catch coordinate bugs early
2. **Viewport debug overlay** - Show grid bounds on canvas
3. **Z-depth visualization** - Color-code objects by z-level during dev
4. **Scale presets** - Easy toggle between 1x/2x/4x for testing
5. **Performance profiling** - Monitor frame rate with more agents

---

## Key Takeaways

✅ **Always validate screen coordinates**  
✅ **Scale changes require full audit**  
✅ **Symptom analysis beats guessing**  
✅ **Document while it's fresh**  
✅ **Simple beats complex (Canvas > CSS)**  
✅ **Debug logging is your friend**  
✅ **Move fast when you know the fix**

---

**Written by:** VIBE 🎨  
**For:** Future reference, team knowledge base  
**Status:** Living document - add lessons as they emerge
