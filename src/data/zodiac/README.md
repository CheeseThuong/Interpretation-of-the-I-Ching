# Zodiac Dataset — ZodiacViews/zodiac-horoscope-daily

## Purpose

This dataset is **optional**. The app works fully without it.

When present, it provides symbolic personality/horoscope references that the AI
uses as a *lens* — never copied verbatim. All final output is Vietnamese.

## Dataset source

- Repository: https://huggingface.co/datasets/ZodiacViews/zodiac-horoscope-daily
- Format: JSONL (one JSON object per line)
- Fields: `instruction`, `input`, `output`
- Language: English

## How to place the file

1. Download the JSONL file from Hugging Face (may require accepting access terms).
2. Place it here:

```
src/data/zodiac/zodiac_horoscope_daily.jsonl
```

3. Restart the dev server or redeploy.

## If the file is missing

The app will **not crash**. The `prepareZodiacReferenceContext()` helper returns an
empty string, and the AI prompt simply omits the zodiac dataset section.

## Automated download

A convenience script is provided:

```bash
node scripts/download-zodiac-dataset.mjs
```

This script uses the Hugging Face Datasets API. It will fail gracefully if access
is denied, and print instructions for manual download.
