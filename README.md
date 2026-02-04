# DLDT Project

This README provides instructions for managing the DLDT website,
including deleting characters from the database, updating and
relaunching the site, modifying data, dumping character database
filepaths, and managing site files (HTML, CSS, etc.) within the Vue.js
framework.

------------------------------------------------------------------------

## ✅ Data Update Checklist (Quick Reference)

Use this checklist whenever you update printers, books, or characters.

### 1. Update source data

-   [ ] Update `dldt_data/cdt_printers.csv` (canonical printers list)
-   [ ] Update `dldt_data/books.json` (books metadata)
-   [ ] Update `dldt_data/extracted_character_data.json` (characters)
-   [ ] If merging sources, **dedupe and normalize first** (especially
    `group_id` / `group_ID`)

### 2. Check for known bad data

-   [ ] Are any books known to have bad scans / corrupt extractions?
    -   If yes: add their `book_id` to the **book exclusion list** in
        `scripts/init-db.ts`
-   [ ] Are any printers deprecated or invalid?
    -   If yes: confirm they are in the `deletePrinters` list in
        `scripts/init-db.ts`

### 3. Sanity-check coverage

-   [ ] Compare:
    -   Number of printers in CSV vs unique `group_id`s in characters
    -   Character count before vs after update
-   [ ] If you see a big drop:
    -   Check for missing `group_id`s in `cdt_printers.csv`
    -   Check for accidental over-filtering in `scripts/init-db.ts`

### 4. Rebuild the database

``` bash
npm run migrate
```

Watch the output for warnings like: - Missing `group_id` - Missing
printer entries - Skipped or filtered records

### 5. Restart the site

``` bash
sudo docker compose restart client
```

(If IIIF images are affected:)

``` bash
sudo docker compose restart iiif
```

### 6. Verify the site

Local:

``` bash
curl -I http://localhost:3000
```

Production:

``` bash
curl -I https://cdt.library.cmu.edu/
```

Spot-check: - Printers list loads - Character grid loads - Character
detail pages load - IIIF images render

### 7. If something looks wrong

``` bash
sudo docker compose logs client
sudo docker compose logs iiif
```

Re-check: - `cdt_printers.csv` completeness - `books.json` IDs -
`extracted_character_data.json` integrity - Filtering rules in
`scripts/init-db.ts`

------------------------------------------------------------------------

## How to Delete Characters from Database

1.  Prepare a list of character IDs in a text file, e.g.:

**unique_id_flagged_for_deletion_2024-12-02.txt**

    everingham_A1679.002
    everingham_A1679.004
    maxwell_F1667.001
    maxwell_F1667.003

2.  Run the `query_db.py` script with a wildcard for
    `--unique_id_list_file` to match ALL IDs to be deleted (including
    past files):

``` bash
python3 query_db.py --remove_chars_from_json_path --unique_id_list_files dldt_data/unique_id_flagged_for_deletion_202*
```

3.  Update and relaunch the site (see below).

------------------------------------------------------------------------

## How to Update and Relaunch the Website

1.  Stop any running container:

``` bash
sudo docker compose stop client
```

2.  (Optional) Remove build artifacts and perform a fresh install:

``` bash
sudo rm -r -f .nuxt .output/ node_modules/
npm install
```

3.  Migrate data:

``` bash
npm run migrate
```

4.  Start the container:

``` bash
sudo docker compose start client
```

------------------------------------------------------------------------

## How to Modify Data

Main data files:

-   `dldt_data/cdt_printers.csv` --- Printer data
-   `dldt_data/books.json` --- Book data
-   `dldt_data/extracted_character_data.json` --- Character data

To add, modify, or remove data, edit the relevant file and then run:

``` bash
npm run migrate
```

For details on the migration process, see:

    scripts/init-db.ts

------------------------------------------------------------------------

## How to Dump the Character Database Filepaths

``` bash
python3 query_db.py --dump_cached_char_paths dldt_data/cached_char_paths.txt --remove_chars_from_json_path --unique_id_list_files dldt_data/unique_id_flagged_for_deletion_202*
tar -cf dldt_data/cached_char_paths.tar -T dldt_data/cached_char_paths.txt
```

------------------------------------------------------------------------

## About File Structure

### Notable Files

-   `pages/index.vue` --- Main character list/grid
-   `pages/printers.vue` --- Printers page
-   `pages/about.vue` --- About page
-   `pages/characters/[id].vue` --- Character detail page
-   `server/api/characters/[id].ts` --- Character detail API
-   `server/api/character_class.ts` --- Character classes API
-   `server/api/characters.ts` --- Characters API (filters)
-   `server/api/printers.ts` --- Printers API
-   `layouts/*.ts` --- Layout files
-   `plugins/*.ts` --- Plugin scripts (Axios, Vuetify, etc.)

------------------------------------------------------------------------

## Site Files (Vue.js)

The DLDT project uses **Vue.js**. Site pages are built from `.vue`
components that combine:

-   `<template>` --- HTML-like markup
-   `<script>` --- JavaScript/TypeScript logic
-   `<style>` --- CSS (often scoped)

Key directories:

-   `pages/` --- Main pages
-   `components/` --- Reusable components
-   `assets/` --- CSS, fonts, images
-   `public/` --- Static assets
-   `layouts/` --- Layout templates

------------------------------------------------------------------------

## Editing Workflow

1.  Edit `.vue` files in `pages/` or `components/`
2.  Test locally:

``` bash
npm run dev
```

3.  Commit changes:

``` bash
git add .
git commit -m "Describe change"
git push
```

4.  Rebuild & relaunch:

``` bash
npm run migrate
sudo docker compose restart client
```

------------------------------------------------------------------------

## Additional Notes

-   Uses **Docker** for deployment
-   Uses **npm** for dependencies
-   API code lives in `server/api/`
-   Migration logic lives in `scripts/init-db.ts`
-   GitHub: https://github.com/printprobability/dldt
