<template>
    
    <v-card class="book-card">

        <v-row style="margin: 0;">

            <v-col cols="5" >
                <v-avatar class="ma-3" size="250" rounded="0">
                    <PageImage :page="props.book.coverPage" />
                </v-avatar>
            </v-col>

            <v-col cols="7" style="padding-right: 1em;">
                <p class="book-card-info">
                    <NuxtLink :to="bookLink">
                        <i>{{ props.book.pqTitle }}</i>
                    </NuxtLink>
                    <!-- <i>{{ props.book.pqTitle }}</i> -->
                </p>

                <p class="book-card-info">Published: {{ edtf }}</p>

                <p class="book-card-info" v-if="props.book.ppPublisher">Printed by: {{ props.book.ppPublisher }}</p>

                <p class="book-card-info">
                    <NuxtLink :to="bookLink">
                        <i>{{ n_chars }}</i>
                    </NuxtLink>
                    <!-- <i>{{ n_chars }}</i> -->
                </p>
            </v-col>
        </v-row>
    </v-card>

</template>

<script setup>

    import { reactive } from "vue";

    // Props
    const props = defineProps({ 
        
        book: Object,
        characters: Array
    });

    // Computed
    const bookLink = computed(() => {

        return {

            name: "books-id",
            params: { id: props.book.id }
        };    
    });
    const edtf = computed(() => {

        if ( props.book.pqYearEarly == props.book.pqYearLate ) {
            
            return props.book.pqYearEarly;
        } else {
            
            return `${props.book.pqYearEarly}/${props.book.pqYearLate}`;
        }
    });
    const n_chars = computed(() => {

        return ( props.characters.length > 1 ) ? `${props.characters.length} characters` : "1 character";
    });

</script>

<style>

    .book-card {

        border: 1px solid rgba(0, 0, 0, 0.125) !important;
    }

    .book-card-column {

        margin-top: 1em;
    }

    .book-card-info {

        margin-top: 1em;
    }

</style>
