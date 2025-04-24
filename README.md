# dldt


## How to delete characters from database

1. Prepare a list of character ids such as the following:


unique_id_flagged_for_deletion_2024-12-02.txt:
```
everingham_A1679.002
everingham_A1679.004
maxwell_F1667.001
maxwell_F1667.003
```

2. Run the query_db.py script with a wildcard for `--unique_id_list_file` that matches ALL ids to be deleted (including ones in the past!):
```bash
python3 query_db.py --remove_chars_from_json_path --unique_id_list_files dldt_data/unique_id_flagged_for_deletion_202*

```

3. Update and relaunch the site using the instructions below.


## How to update and relaunch the website

1. Stop any running container.

```bash
sudo docker compose stop client
```

2. (Optional) Remove node_modules and do a fresh install.

```bash
sudo rm -r -f .nuxt .output/ node_modules/
npm install
```

3. Migrate data

```bash
npm run migrate
```

4. Start container

```bash
sudo docker compose start client
```

## How to modify data

There are 2 main data file
* `dldt_data/cdt_printers.csv`: This file holds data of `Printer`
* `dldt_data/books.json`: This file holds data of `Book`
* `dldt_data/extracted_character_data.json`: This file holds data of `Character`

For example, if you need to add more `Books`, go to `dldt_data/books.json` and add more object in it. Same for modification and removal. Then, relaunch the website.

For more information about migration process, view `scripts/init-db.ts`.


## How to dump the character database filepaths to a text file

```bash
python3 query_db.py --dump_cached_char_paths dldt_data/cached_char_paths.txt --remove_chars_from_json_path --unique_id_list_files dldt_data/unique_id_flagged_for_deletion_202*
tar -cf dldt_data/cached_char_paths.tar -T dldt_data/cached_char_paths.txt
```
## About file structure

Some notable files
* `pages/index.vue`: Main page AKA list (or grid) of characters.
* `pages/printers.vue`: Printer page. This is page where showing all printers as list with multiple columns.
* `pages/about.vue`: About page.
* `pages/characters/[id].vue`: Character detail page.
* `server/api/characters/[id].ts`: API endpoint for fetching character detail and return to client.
* `server/api/character_class.ts`: API endpoint for fetching all character classes.
* `server/api/characters.ts`: API endpoint for fetching all characters (including filters).
* `server/api/printers.ts`: API endpoint for fetching printers.
* `layouts/*.ts`: Layout files.
* `plugins/*.ts`: These are install plugin scripts (like Axios, Vuetify, ...)