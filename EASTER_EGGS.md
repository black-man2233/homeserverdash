# 🥚 coolserver Easter Eggs

There are **13 secrets** hidden in this dashboard. Can you find them all?

> **Hint:** Open the in-app guide by typing `?` anywhere on the dashboard (or `Shift+/`).

---

## The Eggs

| # | Trigger | What Happens |
|---|---------|-------------|
| 1 | Press ↑↑↓↓←→←→ then `b` then `a` | Rainbow particle explosion — the classic cheat code |
| 2 | Type `matrix` anywhere | Green Matrix rain overlay for 7 seconds |
| 3 | Type `party` anywhere | Confetti explosion + card bounce party |
| 4 | Type `disco` anywhere | All cards cycle rainbow disco lights for 9 seconds |
| 5 | Type `hack` anywhere | Fake hacker terminal slides up from the bottom |
| 6 | Type `coolserver` anywhere | Cards shimmer through the full rainbow spectrum |
| 7 | Type `404` anywhere | Giant glitching 404 overlay appears briefly |
| 8 | Click the glowing purple dot in the header **5 times** quickly | Mega explosion — the dot expands to fill the screen |
| 9 | Shake your mouse rapidly back and forth | All cards do a synchronized dizzy shimmy |
| 10 | Leave the dashboard idle for **60 seconds** | Screensaver mode: cards float away. Move mouse to wake |
| 11 | Double-click anywhere on the star background | Supernova explosion of colored rings + particles at that point |
| 12 | Press `F2` | FPS counter overlay (bottom-right corner) |
| 13 | Type `?` or press `Shift+/` | Opens this egg guide in-app with found/not-found tracking |

---

## Tips

- Word triggers work **anywhere** on the page as long as you're not focused on an input field
- The Konami code must be entered with arrow keys then the letters `b` and `a` (lowercase)
- Your found eggs are tracked across sessions in `localStorage` under the key `ee_found`
- The idle screensaver resets automatically when you move the mouse or press any key
- Mouse shake requires ~9 quick direction changes within 1 second

---

## Ambient Effects (always running)

Beyond easter eggs, the dashboard has many continuous animations:

- **Mouse trail** — purple sparkle particles follow your cursor
- **Cursor glow** — large glow orb + precision dot track your mouse
- **Random card pulse** — one random card briefly glows every 3-6 seconds
- **Scan line** — a horizontal line sweeps the viewport every 18-30 seconds
- **Floating particles** — tiny particles rise from random cards periodically
- **Icon float** — a random card icon bounces gently every 6-14 seconds
- **Canvas aurora** — three slow horizontal aurora bands drift across the background
- **Ember particles** — 35 tiny particles float upward continuously
- **Shooting stars** — appear every 4-7 seconds on the star canvas
- **Brand glitch** — the "coolserver" wordmark occasionally glitches with a skew/offset
- **Network card flip** — all cards flip `rotateY(90°)` when you switch networks

---

*To reset your found-eggs progress: `localStorage.removeItem('ee_found')` in the browser console.*
