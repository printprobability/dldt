<template>
  <List v-model="page" :empty="characters.length === 0">
    <template #intro>
      <h1 style="display: none">Character list</h1>
      <!-- <p>{{ $siteConfig.browsecopy.characters }}</p> -->
      <div class="header-font" style="font-size: 18px; font-weight: bold">{{ title }}</div>
      <p class="mt-2">{{ intro }}</p>
    </template>

    <template #left>
      <v-btn-toggle
        v-model="mode"
        color="red-darken-3"
        mandatory
        variant="outlined"
      >
        <v-btn icon="mdi-view-grid" value="grid" aria-label="Change to grid view"/>
        <v-btn icon="mdi-table" value="table" aria-label="Change to table view"/>
      </v-btn-toggle>
    </template>

    <template #filter>
      <PrinterSelect v-model="printer" class="mt-3" @end="filter"/>
      <YearSlider
        v-model="yearRange"
        :min-year="MIN_YEAR"
        :max-year="MAX_YEAR"
        class="mt-3"
        @end="filter"
      />
      <CharacterClassSelect v-model="characterClass" class="mt-5" @end="filter"/>
    </template>

    <template #results>
      <div :aria-label="`${modeLabel} of characters`">
        <CharacterGrid v-if="mode === 'grid'" :characters/>
        <CharacterTable v-else-if="mode === 'table'" :characters/>

        <div class="mt-3" v-if="pageNums > 0">
          <v-pagination
            :length="pageNums"
            v-model="page"
            @update:model-value="onChangePage"
          />
          <div class="text-center">
            {{ minItemText }}-{{ maxItemText }} of {{ count }}
          </div>
        </div>
      </div>
    </template>
  </List>
</template>

<script setup>
import List from "~/components/Interface/List.vue";
import CharacterGrid from "~/components/CharacterGrid.vue";
import CharacterTable from "~/components/CharacterTable.vue";
import PrinterSelect from "~/components/Menus/PrinterSelect.vue";
import YearSlider from "~/components/YearSlider.vue";
import CharacterClassSelect from "~/components/Menus/CharacterClassSelect.vue";

import {useAsyncData} from "nuxt/app";
import {ref, watch, computed, nextTick} from "vue";
import _ from "lodash";

// Resources
const {$axios, $loader} = useNuxtApp();
// Get route
const route = useRoute();
// Get router
const router = useRouter();

// ********************************
// Config
// ********************************
const MIN_YEAR = 1644;
const MAX_YEAR = 1715;// Title
const title = ref(
  `CATALOG of DISTINCTIVE TYPE (CDT), Restoration England (1660-1700)`
);
// Intro
const intro = ref(
  "The CDT is a visual catalog of distinctive and damaged printing type originating in books published in England from 1660 to 1700. These type impressions — 20,000 individual letters or “sorts” —  form a new source of typographic evidence for more than 240 printers working in London during the English Restoration. Users can search by character class (letterform), printer, and date."
);

// Head
useHead({titleTemplate: title.value});

// ********************************
// View mode
// ********************************
// Mode
const mode = useState('charsListMode', () => "grid");
// Model label
const modeLabel = computed(() => _.capitalize(mode.value))
// Change itemsPerPage when changing mode
watch(mode, () => {
  // Clear data
  characters.value = [];
  // Fetch at nextTick
  nextTick(filter);
});

// ********************************
// Pagination
// ********************************
// Page
const page = useState('charsPage', () => 1);
// Number of pages
const pageNums = computed(() => Math.ceil(count.value / itemsPerPage.value));
// Page offset
const pageOffset = computed(() => (page.value - 1) * itemsPerPage.value);

// Items per page
const itemsPerPage = computed(() => mode.value === "grid" ? 100 : 50);
// Min item text
const minItemText = computed(() => pageOffset.value + 1);
// Max item text
const maxItemText = computed(() => Math.min(pageOffset.value + itemsPerPage.value, count.value));

// Mark that user change page
const isPageChanged = ref(false);
// On change page handler
const onChangePage = () => {
  // Change flag
  isPageChanged.value = true;
};
// Reset page
const resetPage = () => {
  // If this fetching process is not caused by changing page, reset page to 1
  if (!isPageChanged.value) page.value = 1;
  // Reset flag
  isPageChanged.value = false;
};

// ********************************
// Route query
// ********************************

// Update filter based on route's query changes
watch(() => route.query, (query) => {
  printer.value = query.printer_like
  yearRange.value = {
    yearEarly: route.query.pq_year_early ?? MIN_YEAR,
    yearLate: route.query.pq_year_late ?? MAX_YEAR
  }
  characterClass.value = query.character_class
  book.value = query.book
  sortBy.value = query.sort_by ?? null
})

// ********************************
// Filter
// ********************************

/// Sort by
const sortBy = useState('charsSortBy', () => route.query.sort_by ? (route.query.sort_by === 'date_desc' ? 'date_desc' : 'date_asc') : null);
// Filter when sortBy is changed
watch(sortBy, () => nextTick(filter))

// Printer
const printer = useState('charsFilterByPrinter', () => route.query.printer_like ?? null);
// Year range
const yearRange = useState('charsFilterByYearRange', () => ({
  yearEarly: route.query.pq_year_early ?? MIN_YEAR,
  yearLate: route.query.pq_year_late ?? MAX_YEAR
}));
// Character class
const characterClass = useState('charsFilterByCharacterClass', () => route.query.character_class ?? null);
// Book
const book = useState('charsFilterByBook', () => route.query.book ?? null)

// Extract filter from filterQuery
const filterOnlyQuery = computed(() => {
  // Query
  const query = {
    pq_year_early: yearRange.value.yearEarly,
    pq_year_late: yearRange.value.yearLate,
  };

  if (printer.value) query["printer_like"] = printer.value;
  if (characterClass.value) query["character_class"] = characterClass.value;
  if (book.value) query["book"] = book.value;
  if (sortBy.value) query["sort_by"] = sortBy.value

  return query;
});
// Filter query
const filterQuery = computed(() => ({
  sort: true,
  limit: itemsPerPage.value,
  offset: itemsPerPage.value * (page.value - 1),
  ...filterOnlyQuery.value
}));

// Watch filter to replace route
watch(filterQuery, () => router.replace({query: filterOnlyQuery.value}), {immediate: true});

// Filter API
const filterAPI = () =>
  $axios.get("/characters/", {params: filterQuery.value});
// Filter
const filter = () => {
  // Open loading overlay
  $loader.load();
  // Call API
  filterAPI()
    .then((res) => {
      // Get fetched data
      characters.value = res.data.results;
      // Save count
      count.value = res.data.count;
      // Reset page
      resetPage();
    })
    .finally($loader.finish);
};

// Fetch data on page changes
watch(page, filter);

// ********************************
// Characters
// ********************************
// Fetch characters
const {data} = await useAsyncData(
  "fetchCharacters",
  async () => (await filterAPI()).data
);
// Characters
const characters = ref(data.value?.results ?? []);
// Total count
const count = ref(data.value?.count ?? 0);

onMounted(() => window.scrollTo({ top: 0 }))
</script>
