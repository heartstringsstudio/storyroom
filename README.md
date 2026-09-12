# The Story Room

A guided story-intake experience for **Heartstrings Studio** — a warm, one-question-at-a-time
memory interview that replaces a plain intake form. Pure static site: no build step, no
frameworks, no backend.

## Files

| File | What it is |
|---|---|
| `index.html` | Page shell, fonts, and the commented-out GA4 placeholder |
| `styles.css` | All styling (walnut → amber palette, mobile-first) |
| `app.js` | Question config, flow logic, and Formspree submission |
| `logo.png` | The studio mark (512px), used as the header mark, favicon and apple-touch icon |

## Keeping the look in step with the main site

The Story Room borrows the main site's design system rather than defining its own:
walnut `#774826`, amber `#f0b86f`, cream ground `#f4e8d2`, Libre Caslon Display over
DM Sans, 3px corners and hard offset shadows.

It deliberately uses the *quiet* half of that system — no photo hero, no dark
full-bleed sections, no display type above 2.4rem. People arrive here mid-grief as
often as mid-celebration, and the page has to stay calm.

All the colour lives in the `:root` block at the top of `styles.css`. If the main site
is restyled again, this page needs the same pass.

`logo.png` is the same studio mark the main site ships. The master is
`heartstrings-mark-MASTER-1254.png` in the studio's Drive (Misc Graphics) — a 1254×1254
transparent PNG. Cut new sizes from the master, not from this file: trim to the alpha ≥ 12
bounding box, then scale so the mark fills ~54% of the canvas width, centred. The main
site frames it identically, so a looser or tighter crop here would visibly mismatch it.
When the file is swapped, bump the `?v=` on all three `logo.png` URLs in `index.html` in
the same commit — returning visitors cache those exact URLs.

## Deploying to GitHub Pages

1. Push these four files (plus this README) to the repository's default branch.
2. In the repo: **Settings → Pages → Source**, choose **Deploy from a branch**,
   pick the default branch and the `/ (root)` folder, and save.
3. The site goes live at `https://<account>.github.io/<repo>/` within a minute or two.
   All paths are relative, so no configuration is needed.

## Where the Formspree ID lives

At the very top of `app.js`:

```js
var FORM_ENDPOINT = 'https://formspree.io/f/xykbvdrb';
```

Change that one line to point at a different form.

## Editing question wording (no logic required)

Every occasion's questions live in the clearly-marked `OCCASIONS` config object at the top of
`app.js` — one entry per occasion (`memorial`, `celebration`, `wedding`, `milestone`,
`tribute`, `holiday`). Each question is a small object: `q` is the on-screen wording, `sub`
is the gentle sub-prompt, `label` is the heading used in the compiled intake email. Edit the
strings, save, refresh. Adding or removing a question object on a path updates the flow,
progress dots, review screen, and compiled email automatically. Confirmation and pre-send
copy live on the same occasion entries (`presend`, `doneTitle`, `doneBody`).

## Manual test checklist

1. **Memorial end-to-end:** pick Memorial, answer every question, review, send — confirm the email arrives with the full `STORY ROOM INTAKE — Memorial` block, and that no price or turnaround-time promise appears anywhere on the page.
2. **Refresh mid-interview:** answer three questions, reload the page — you should land back on the same question with every answer intact.
3. **Skip behavior:** skip two non-essential questions — review shows them as *(skipped)* and the email lists them under `SKIPPED QUESTIONS`.
4. **Failed-submit recovery:** go offline (or block formspree.io), press *Send my story* — answers stay intact, the retry message appears, and *Copy my story* puts the full compiled text on the clipboard.
5. **Mobile viewport:** run the flow at 375 px wide — no horizontal scroll, touch targets comfortable, textarea focuses on each question.
6. **Occasion deep links:** open `?occasion=Wedding`, `?occasion=Memorial%20%2F%20Tribute`, and `?occasion=Birthday` — each should begin on the matching question path.
