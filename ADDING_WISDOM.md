# ✍️ Adding More Wisdom

> **Will new wisdom get the Read-Aloud (🎧) option?**
> **Yes — automatically.** The "Listen to this wisdom" bar is part of the wisdom page
> template (`src/app/wisdom/[slug]/page.tsx`). *Every* published entry renders it and
> narrates **Wisdom → Perspective Shift → Practical Action**. You never wire it up per entry.
>
> The **Daily Reflection** page also has its own Listen button, which reads
> **Thought → Reflection Question → Daily Challenge**.

There are four ways to add wisdom. Pick whichever fits.

---

## 1) Admin Panel — easiest, no code ⭐

1. Sign in as admin → `admin@wisdommode.app` / `WisdomAdmin#2026`
2. Go to **Admin → Wisdom → ＋ New Entry**
3. Fill in the fields (see **Field reference** below)
4. Set **Status = Published** → **Save**

It appears instantly in the Library, search, and its category — with Read-Aloud.

> Tip: Save as **Draft** to write privately; it stays hidden from the public until you Publish.

---

## 2) Bulk import from JSON — best for adding many at once

1. Open **`content/wisdom-to-import.json`**
2. Add objects to the `"wisdom": [ ... ]` array (copy the example entry)
3. Run:

```bash
npm run import:wisdom
# or a custom file:
npm run import:wisdom -- content/my-batch.json
```

- Safe to re-run: entries are **upserted by `slug`** (updated, not duplicated).
- The script **validates** every entry before writing (missing fields, bad slug,
  unknown category, duplicate slugs) and tells you exactly what to fix.
- You can also create categories in the same file via a `"categories": [ ... ]` array.
- Everything imported is **published** → shows in the library **with Read-Aloud**.

---

## 3) CSV import — write wisdom in a spreadsheet

Prefer Excel / Google Sheets / Numbers? Use the CSV importer.

1. Open **`content/wisdom-to-import.csv`** (or export your own from a spreadsheet)
2. Keep the header row; add one row per entry
3. Run:

```bash
npm run import:wisdom:csv
# or a custom file:
npm run import:wisdom:csv -- content/my-batch.csv
```

**CSV columns** (header required, any order):
`slug, category, title, problem, wisdom, shift, action, questions, tags, related, popular, featured`

**CSV tips**
- Wrap any cell containing commas or line breaks in `"double quotes"`. To put a
  literal quote inside, double it: `""`.
- **Wisdom paragraphs:** put a real blank line inside the cell (Alt/⌥+Enter in a
  spreadsheet), **or** type the literal characters `\n\n` — both become paragraph breaks.
- **Multiple questions:** separate with ` | ` (pipe) or line breaks.
- **popular / featured:** `true`/`false`, `yes`/`no`, or `1`/`0` (blank = false).

Same guarantees as JSON: upsert by `slug` (no duplicates), validated before writing,
published on success, and **Read-Aloud included automatically**.

---

## 4) Seed file — for permanent, version-controlled content

Add entries to the `WISDOM` array in **`prisma/seed-data.mjs`**, then:

```bash
npm run db:seed
```

This is also upsert-based, so it won't create duplicates.

---

## 📋 Field reference

| Field        | Required | Notes |
|--------------|----------|-------|
| `slug`       | ✅ | Unique, `lowercase-with-dashes`. This is the URL: `/wisdom/<slug>`. |
| `category`   | ✅ | Must match a category slug: `studies-work`, `self-growth`, `relationships`, `life-challenges` (or one you add). |
| `title`      | ✅ | The entry's name. |
| `problem`    | ✅ | First-person problem statement, e.g. *"I know what I should do, but I keep delaying it."* |
| `wisdom`     | ✅ | Long-form message. **Separate paragraphs with a blank line** (`\n\n` in JSON). This is the main narrated text. |
| `shift`      | ✅ | The Perspective Shift (one key reframing sentence or two). |
| `action`     | ✅ | One concrete Practical Action. |
| `questions`  | ➖ | List of reflection questions. JSON: `["...","..."]`. In the seed file: a JS array. |
| `tags`       | ➖ | Comma-separated keywords — these power **search**. |
| `related`    | ➖ | Comma-separated **slugs** of related entries (shown at the bottom). |
| `popular`    | ➖ | `true` to show the ★ Popular badge / appear under the Popular filter. |
| `featured`   | ➖ | `true` to feature it on the landing page. |

### The Read-Aloud order
The narrator reads: **title + problem → each wisdom paragraph → Perspective Shift → Practical Action.**
So writing clear paragraph breaks in `wisdom` makes the audio flow naturally.

---

## ✅ Example (one entry)

```json
{
  "slug": "comparison",
  "category": "self-growth",
  "title": "The Thief at the Window",
  "problem": "I keep measuring my life against everyone else's and always come up short.",
  "tags": "comparison,envy,social media,self-worth,enough",
  "wisdom": "First paragraph...\n\nSecond paragraph...\n\nThird paragraph...",
  "shift": "You are comparing your whole inside to someone's edited outside.",
  "action": "Today, write one specific way you have grown in the last year.",
  "questions": ["Whose outside am I comparing my inside to?", "How am I better than a year ago?"],
  "related": "jealousy,self-doubt,confidence",
  "popular": false,
  "featured": false
}
```

After adding it, run `npm run import:wisdom`, open `/wisdom/comparison`, and the
🎧 **Listen** bar will already be there.
```
