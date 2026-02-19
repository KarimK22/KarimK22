# Isometric Office V2 - Technical Documentation

**Status:** Prototype Complete (Stage 1/3)  
**Next Steps:** Polish + Animations + Mobile Support

---

## Architecture

### Core Components

**1. Isometric Math System**
- `gridToScreen(x, y, z)` → Converts 3D grid coords to 2D screen coords
- `screenToGrid(x, y)` → Reverse conversion for click detection
- True isometric projection (30° angle, diamond grid)

**2. IsometricRenderer Class**
Handles all drawing operations:
- `drawFloorTile()` → Checkered diamond floor
- `drawBox()` → Generic isometric box primitive (powers everything)
- `drawCharacter()` → Roblox-style blocky humanoids
- `drawDesk()` → Desks with monitors
- `drawLabel()` → Text labels with shadows

**3. Rendering Pipeline**
```
requestAnimationFrame loop →
  Clear canvas →
  Draw floor grid →
  Draw furniture (meeting table) →
  Draw agents (desk + character + labels) →
  Draw decorations →
  Repeat
```

---

## What's Working (Stage 1)

✅ **True isometric projection** (no CSS distortion)  
✅ **Checkered diamond floor** (15x15 grid)  
✅ **Roblox-style characters** (head, torso, legs as 3D boxes)  
✅ **Isometric desks** with monitors  
✅ **Monitor glow effect** (blue when working)  
✅ **Animated screen content** (code lines scrolling)  
✅ **Name labels** under each character  
✅ **Status indicators** (green/amber/gray dots with glow)  
✅ **Click detection** (select agents)  
✅ **Detail panel** (slide-in from right)  
✅ **Real-time data** (Convex integration)  
✅ **Smooth animations** (head bob, walking legs, screen flicker)

---

## What's Next (Stage 2 - Polish)

🔲 **Better character proportions** (tweak head/body/leg ratios)  
🔲 **Smoother animations** (easing functions, more natural movement)  
🔲 **More desk details** (mouse, coffee cup, papers)  
🔲 **Props enhancements** (3D plants in pots, door with frame)  
🔲 **Lighting effects** (ambient shadows, desk lamp glow)  
🔲 **Particle effects** (coffee steam, typing sparkles)  
🔲 **Hover states** (highlight on mouseover)  
🔲 **Zoom controls** (mouse wheel zoom in/out)

---

## What's Next (Stage 3 - Production Ready)

🔲 **Mobile responsiveness** (touch controls, smaller canvas)  
🔲 **Performance optimization** (render only visible tiles)  
🔲 **Accessibility** (keyboard navigation, ARIA labels)  
🔲 **Error handling** (graceful degradation if Canvas unsupported)  
🔲 **Loading states** (skeleton while agents load)  
🔲 **Animation toggles** (reduce motion for accessibility)  
🔲 **Export as image** (screenshot feature)

---

## Testing Checklist

**Visual Quality:**
- [ ] Characters look blocky but polished (not crude)
- [ ] Floor tiles are crisp and properly aligned
- [ ] Desks have proper depth/shadows
- [ ] Monitor glow is subtle but visible
- [ ] Labels are readable

**Interactivity:**
- [ ] Click detection works for all agents
- [ ] Detail panel slides in smoothly
- [ ] Animations don't lag or stutter
- [ ] Canvas resizes properly on window resize

**Data Integration:**
- [ ] Agent status updates in real-time
- [ ] Current tasks display correctly
- [ ] Offline agents render differently

---

## Known Issues

**Current:**
- [ ] Character proportions could be more "Roblox-like" (adjust head:body ratio)
- [ ] Walking animation is basic (needs easing)
- [ ] No mobile touch support yet
- [ ] Canvas doesn't resize dynamically (fixed 700px height)

**Future:**
- [ ] Add WebGL fallback for better performance on large grids
- [ ] Implement spatial audio (proximity-based ambient sounds)
- [ ] Add day/night cycle lighting

---

## File Structure

```
/app/office-v2/
  page.tsx           ← Main component (Canvas renderer)
  
Core classes inside page.tsx:
  - IsometricRenderer  ← Drawing primitives
  - gridToScreen()     ← Math helpers
  - screenToGrid()     ← Click detection
```

---

## How to Test

```bash
cd /root/.openclaw/workspace/mission-control
npm run dev
# Navigate to: http://localhost:3000/office-v2
```

---

## Acceptance Criteria (Reference)

✅ Matches reference image aesthetic (simple, clean, isometric)  
✅ All 3 agents visible with desks, monitors, labels  
✅ Checkered floor with proper diamond grid  
✅ Interactive (click agents to see details)  
✅ No CSS transform distortion  
🔲 Production-ready code quality (Stage 3)

---

## Next Session Tasks

**Immediate (2-3 hours):**
1. Refine character proportions (make head slightly larger, body blockier)
2. Add easing to animations (smooth head bob, natural leg walk)
3. Enhance desk details (add coffee cup, mouse, keyboard details)
4. Improve props (3D planters, door frame, coffee steam particles)

**Polish (2-3 hours):**
5. Add hover states (highlight agent on mouseover)
6. Implement zoom controls (mouse wheel or +/- buttons)
7. Add lighting effects (ambient shadows, desk lamp glow)
8. Particle system (steam, typing sparkles)

**Production (2-3 hours):**
9. Mobile support (touch controls, responsive canvas)
10. Performance optimization (only render visible area)
11. Accessibility (keyboard nav, screen reader support)
12. Error handling + loading states

---

**Total estimated time:** 8-10 hours (as planned)

**Current progress:** ~2 hours (Stage 1 foundation)  
**Remaining:** 6-8 hours (Polish + Production)
