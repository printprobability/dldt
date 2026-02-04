import { readFileSync, existsSync } from "fs"
import { resolve, parse } from "path"
import type { Model } from "sequelize"
import _ from "lodash"
import { parse as parseCsv } from "csv-parse/sync"

import { _syncPromise, sequelize, Book, Character, Printer } from "~/models"
import { removeDuplicateByKey } from "~/scripts/utils"

// Await previous sync
await _syncPromise

// Printers need to be deleted
const deletePrinters = [
  "Astwood, John",
  "Dover, Simon",
  "Harper, Thomas",
  "Leybourne, Robert",
  "Thompson, Mary",
  "Coe, Jane",
  "Hearne, Richard",
  "Mathewes, Augustine",
  "Okes, John",
  "Oulton, Richard",
  "Raworth, John",
  "Raworth, Ruth",
]

// *********************************************
// Utility
// *********************************************

/**
 * Read data from JSON file
 *
 * @param path
 */
const readData = (path: string): any[] => JSON.parse(readFileSync(path, "utf8"))

/**
 * Read data from CSV file
 *
 * @param path
 */
const readCSV = (path: string): any[] =>
  parseCsv(readFileSync(path, "utf8"), { skipEmptyLines: true, columns: true })

/**
 * Read newline-delimited IDs from a text file (ignores blanks and # comments)
 */
const readIdList = (path: string): Set<string> => {
  if (!existsSync(path)) return new Set()
  const raw = readFileSync(path, "utf8")
  return new Set(
    raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("#"))
  )
}

/**
 * Bulk insert
 *
 * @param model
 * @param data
 * @param idKey
 * @param dataKey
 */
const bulkInsert = async (
  model: Model,
  data: any[],
  idKey: string,
  dataKey: string | null = null
): Promise<void> => {
  // Remove duplicate
  const uniqueList = removeDuplicateByKey(data, (dataKey === null ? "" : `${dataKey}.`) + idKey)
  // Batch
  const batch: any[] = []

  // Iterate through each piece of data
  for (let i = 0; i < uniqueList.length; i++) {
    // Insert a batch of 2000
    if (i && i % 2000 === 0) {
      // Bulk insert
      await model.bulkCreate(batch)
      // Clear batch
      batch.length = 0
    }

    // Add item to batch
    batch.push(dataKey === null ? uniqueList[i] : uniqueList[i][dataKey])
  }

  // Bulk insert the last batch
  await model.bulkCreate(batch)
}

/**
 * Get lastname from name
 *
 * @param name
 */
const getLastname = (name: string): string => {
  // Get part that contains lastname
  const part = name.split(/\s*\(/)[0].split(/\s*,\s*/)[0]
  // Split by space
  const segments = part.split(/\s/)
  // Get last index
  const last = segments.length - 1

  return segments[last].startsWith("(") ? segments[last - 1] : segments[last]
}

// *********************************************
// Preprocessor
// *********************************************

/**
 * Process character web-url
 *
 * @param character
 */
const processWebUrl = (character: any): void => {
  // Split slash (/) and only get the last 5 elements
  const segments = character["web_url"].split("/").slice(-5)
  // First element will be file name, parse it, get name only, attach the .jpg extension and replace
  segments[0] = parse(segments[0]).name + ".jpg"
  // Add IIIF host (if in development, using routeRules to avoid CORS)
  segments.unshift(
    _.trimEnd(process.env.APP_ENV === "development" ? process.env.API_BASE_URL : process.env.IIIF_HOST, "/"),
    "iiif//page_images"
  )

  // Replace old link with new link
  character["web_url"] = segments.join("/")
}

/**
 * Process character character_class
 *
 * @param character
 */
const processCharacterClass = (character: any): void => {
  // Split original character_class by _ (underscore)
  const segments = character["character_class"].split("_")

  // Assign first segment as new character_class
  character["character_class"] = segments[0]
  // Assign second segment as character_group
  character["character_group"] = segments[1]
}

/**
 * Process character group_label
 *
 * @param character
 */
const processCharacterGroupLabel = (character: any, printerMap: Record<string, any>): void => {
  const gid = character["group_id"] ?? character["group_ID"]
  const printer = gid ? printerMap[gid] : undefined

  if (!gid) {
    console.warn(`[migrate] Character missing group id (char_id=${character["char_id"] ?? "UNKNOWN"})`)
    character["group_label"] = "Unknown printer"
    return
  }

  if (!printer) {
    console.warn(`[migrate] Missing printer for group id=${gid} (char_id=${character["char_id"] ?? "UNKNOWN"})`)
    character["group_label"] = "Unknown printer"
    return
  }

  character["group_label"] = printer["printer_string"]
}

/**
 * Process character unique_id
 *
 * @param character
 */
const processUniqueID = (
  character: any,
  bookMap: Record<string, any>,
  citeOccurrence: Record<string, number>
): void => {
  // Get corresponding book
  const book = bookMap[character["book_id"]]["book_data"]

  // Get printer lastname
  const printerLastname = _.capitalize(getLastname(character["group_label"]).toLowerCase())
  // Get character class
  const characterClass = character["character_class"]
  // Get date
  const date = book["pq_year_early"]

  // Create cite
  const cite = `${printerLastname}_${characterClass}${date}`
  // Init cite occurrence
  if (!Object.hasOwn(citeOccurrence, cite)) citeOccurrence[cite] = 1
  // Get cite index
  const citeIndex = `${citeOccurrence[cite]++}`.padStart(3, "0")

  // Create unique_id
  character["unique_id"] = `${cite}.${citeIndex}`
}

/**
 * Process character sequence
 *
 * @param character
 */
const processSequence = (character: any): void => {
  character.sequence = _.random(1, 500000)
}

/**
 * Process printer years
 * @param character
 */
const processPrinterYears = (
  character: any,
  bookMap: Record<string, any>,
  printerMap: Record<string, any>
): void => {
  // Get book
  const book = bookMap[character["book_id"]]["book_data"]
  // Get printer
  const gid = character["group_id"] ?? character["group_ID"]
  const printer = gid ? printerMap[gid] : undefined

  if (!printer) return

  // Set printer years
  printer.pq_year_early = Math.min(printer.pq_year_early ?? 2000, book.pq_year_early)
  printer.pq_year_late = Math.max(printer.pq_year_late ?? 0, book.pq_year_late)
}

// *********************************************
// Main
// *********************************************

// Book IDs to permanently exclude from the site (one UUID per line)
const excludedBookIds = readIdList(resolve("dldt_data/flagged_for_deletion.txt"))
console.warn(`Excluding ${excludedBookIds.size} book_id(s) from migration`)

// Import cdt_printers.csv
const printers = readCSV(resolve("dldt_data/cdt_printers.csv"))

// Normalize CSV header mismatch: group_ID -> group_id
printers.forEach((p: any) => {
  if (!p.group_id && p.group_ID) p.group_id = p.group_ID
})

// Construct printer map
const printerMap: Record<string, any> = {}
// Iterate through each printer and map id to entry
printers.forEach((printer: any) => {
  const gid = printer["group_id"]
  if (!gid) {
    console.warn("[migrate] Printer row missing group_id:", printer)
    return
  }
  printerMap[gid] = printer
})

// Import books.json (filter excluded books BEFORE inserting + mapping)
const booksAll = readData(resolve("dldt_data/books.json"))
const books = booksAll.filter((b: any) => !excludedBookIds.has(b.book_id))
console.warn(`Books: ${booksAll.length} -> ${books.length} after exclusions`)

// Import books.json to database
await bulkInsert(Book, books, "id", "book_data")

// Mapping book entry for fast access
const bookMap: Record<string, any> = {}
// Iterate through each book and map id to entry
books.forEach((book: any) => {
  bookMap[book.book_id] = book
})

// Cite occurrence
const citeOccurrence: Record<string, number> = {}

// Import extracted_character_data.json (filter excluded books BEFORE processing)
const charactersAll = readData(resolve("dldt_data/extracted_character_data.json"))
const characters = charactersAll.filter((c: any) => !excludedBookIds.has(c.book_id))
console.warn(`Characters: ${charactersAll.length} -> ${characters.length} after exclusions`)

// Normalize character key mismatch too (just in case)
characters.forEach((c: any) => {
  if (!c.group_id && c.group_ID) c.group_id = c.group_ID
})

// Loop and process IIIF link
for (const character of characters) {
  // If a character references a book we removed, skip it defensively
  if (!bookMap[character["book_id"]]) continue

  // Process IIIF image link
  processWebUrl(character)
  // Process character class
  processCharacterClass(character)
  // Process group label
  processCharacterGroupLabel(character, printerMap)
  // Process unique ID
  processUniqueID(character, bookMap, citeOccurrence)
  // Process sequence
  processSequence(character)
  // Process printer years
  processPrinterYears(character, bookMap, printerMap)
}

// Import extracted_character_data.json
await bulkInsert(
  Character,
  characters.filter((character: any) => deletePrinters.indexOf(character.group_label) === -1),
  "char_id"
)

// Import cdt_printers.csv to database
await bulkInsert(
  Printer,
  printers.filter((printer: any) => deletePrinters.indexOf(printer.printer_string) === -1),
  "group_id"
)

// Log
console.warn("Database has been initialized.")
