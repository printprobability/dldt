# DLDT Project README

This README provides instructions for managing the DLDT website, including deleting characters from the database, updating and relaunching the site, modifying data, dumping character database filepaths, and managing site files (HTML, CSS, etc.) within the Vue.js framework.

## How to Delete Characters from Database

1. Prepare a list of character IDs in a text file, e.g.:

   **unique_id_flagged_for_deletion_2024-12-02.txt**:
   ```
   everingham_A1679.002
   everingham_A1679.004
   maxwell_F1667.001
   maxwell_F1667.003
   ```

2. Run the `query_db.py` script with a wildcard for `--unique_id_list_file` to match ALL IDs to be deleted (including past files):

   ```bash
   python3 query_db.py --remove_chars_from_json_path --unique_id_list_files dldt_data/unique_id_flagged_for_deletion_202*
   ```

3. Update and relaunch the site (see instructions below).

## How to Update and Relaunch the Website

1. Stop any running container:

   ```bash
   sudo docker compose stop client
   ```

2. (Optional) Remove `node_modules` and perform a fresh install:

   ```bash
   sudo rm -r -f .nuxt .output/ node_modules/
   npm install
   ```

3. Migrate data:

   ```bash
   npm run migrate
   ```

4. Start the container:

   ```bash
   sudo docker compose start client
   ```

## How to Modify Data

The main data files are:
- `dldt_data/cdt_printers.csv`: Contains `Printer` data.
- `dldt_data/books.json`: Contains `Book` data.
- `dldt_data/extracted_character_data.json`: Contains `Character` data.

To add, modify, or remove data (e.g., adding a new `Book`), edit the relevant file (e.g., `dldt_data/books.json`) and update the JSON objects. Then, relaunch the website as described above.

For details on the migration process, see `scripts/init-db.ts`.

## How to Dump the Character Database Filepaths to a Text File

Run the following command to dump filepaths and create a tar archive:

```bash
python3 query_db.py --dump_cached_char_paths dldt_data/cached_char_paths.txt --remove_chars_from_json_path --unique_id_list_files dldt_data/unique_id_flagged_for_deletion_202*
tar -cf dldt_data/cached_char_paths.tar -T dldt_data/cached_char_paths.txt
```

## About File Structure

### Notable Files
- `pages/index.vue`: Main page displaying a list or grid of characters.
- `pages/printers.vue`: Printers page, showing a list of printers with multiple columns.
- `pages/about.vue`: About page.
- `pages/characters/[id].vue`: Character detail page.
- `server/api/characters/[id].ts`: API endpoint for fetching character details.
- `server/api/character_class.ts`: API endpoint for fetching all character classes.
- `server/api/characters.ts`: API endpoint for fetching all characters (with filters).
- `server/api/printers.ts`: API endpoint for fetching printers.
- `layouts/*.ts`: Layout files.
- `plugins/*.ts`: Plugin scripts (e.g., Axios, Vuetify).

### Site Files (HTML, CSS, JavaScript)
The DLDT project uses **Vue.js**, a JavaScript framework, which organizes site files differently from traditional static HTML/CSS projects. Instead of separate `.html` and `.css` files, the site is built using **Vue components** (`.vue` files), which combine HTML, CSS, and JavaScript into a single file.

#### Where Are the Site Files?
- **Location**: Most site files are in the `pages/`, `components/`, and `assets/` directories:
  - **`pages/*.vue`**: These files define the main pages of the site (e.g., `index.vue` for the homepage, `printers.vue` for the printers page). Each `.vue` file contains:
    - **HTML**: In a `<template>` section, defining the structure of the page.
    - **CSS**: In a `<style>` section, often scoped to the component (e.g., `<style scoped>`).
    - **JavaScript/TypeScript**: In a `<script>` section, handling logic and data.
  - **`components/*.vue`**: Reusable UI components (e.g., buttons, cards) used across pages.
  - **`assets/`**: Static files like images, fonts, or global CSS (e.g., `assets/css/style.css`).
  - **`public/`**: Static files served directly (e.g., favicon, static images).
  - **`layouts/*.ts`**: Layout templates that define the overall structure (e.g., headers, footers) for pages.

#### How to Edit Site Files
To modify the site's appearance or behavior, edit the `.vue` files in `pages/` or `components/`. Here's a basic guide to the **Vue > HTML > Vue process**:

1. **Understand Vue Components**:
   - A `.vue` file looks like this:
     ```vue
     <template>
       <div class="container">
         <h1>Welcome to DLDT</h1>
       </div>
     </template>

     <script>
     export default {
       name: 'HomePage',
       data() {
         return {
           message: 'Hello, Vue!'
         }
       }
     }
     </script>

     <style scoped>
     .container {
       background-color: #f0f0f0;
     }
     </style>
     ```
   - **`<template>`**: Contains HTML-like markup. Use Vue directives (e.g., `v-for`, `v-if`) for dynamic rendering.
   - **`<script>`**: Contains JavaScript/TypeScript for logic, data, and methods.
   - **`<style>`**: Contains CSS, scoped to the component if `scoped` is used.

2. **Editing Steps**:
   - **Locate the File**: Identify the `.vue` file for the page or component you want to edit (e.g., `pages/index.vue` for the homepage).
   - **Edit HTML**: Modify the `<template>` section to change the structure or content.
   - **Edit CSS**: Update the `<style>` section to adjust styling. Use `scoped` to limit styles to the component, or remove `scoped` for global styles.
   - **Edit JavaScript**: Update the `<script>` section to change logic, data, or interactions.
   - **Global CSS**: For site-wide styles, edit files in `assets/css/` or add a global stylesheet in `assets/`.
   - **Static Assets**: Add images or other files to `public/` or `assets/`.

3. **Best Practices**:
   - **Use a Code Editor**: Use Visual Studio Code or WebStorm with Vue.js plugins for syntax highlighting and autocompletion.
   - **Preview Changes**: Run the site locally with `npm run dev` to see changes in real-time.
   - **Version Control**: Commit changes to Git (e.g., `git add .`, `git commit -m "Updated homepage"`, `git push`) to track modifications.
   - **Avoid Direct HTML Files**: Vue.js compiles `.vue` files into HTML at build time, so you won't edit raw `.html` files.
   - **Learn Vue Basics**: If unfamiliar with Vue, review the [Vue.js documentation](https://vuejs.org/guide/introduction.html) for concepts like components, directives, and reactivity.

4. **Testing and Deployment**:
   - After editing, test locally with `npm run dev`.
   - Rebuild and relaunch the site using the "Update and Relaunch" steps above.

#### Example: Modifying the Homepage
To change the homepage's title and background color:
1. Open `pages/index.vue`.
2. Update the `<template>` section:
   ```vue
   <template>
     <div class="home">
       <h1>My New DLDT Title</h1>
     </div>
   </template>
   ```
3. Update the `<style>` section:
   ```vue
   <style scoped>
   .home {
     background-color: lightblue;
   }
   </style>
   ```
4. Save, run `npm run dev`, and check the changes locally.
5. Follow the "Update and Relaunch" steps to deploy.

For more details on Vue.js, refer to the [official Vue.js guide](https://vuejs.org/guide/introduction.html).

## Additional Notes
- The project uses **Docker** for containerized deployment and **npm** for managing dependencies.
- For API-related changes, review the `server/api/` directory.
- For database migrations, refer to `scripts/init-db.ts`.
- The GitHub repository is available at [https://github.com/printprobability/dldt](https://github.com/printprobability/dldt).
