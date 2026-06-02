<template>
  <v-container max-width="1000px">
    <div class="mt-5">
      <h3>ABOUT</h3>
      <br/>
      <h5>Why damaged & distinctive types?</h5>
      <br/>
      <p>Recent estimates suggest that the printers of more than half of all books, pamphlets, and broadsides printed in
        Restoration London remain unknown. The CDT is a resource to help identify unknown printers. “Type,” Harry Carter
        once remarked, “is something you can pick up and hold in your hand.” Made of a pliant lead alloy, letterpress
        letters were often damaged during presswork, broken or bent by the heavy action of the press or spoiled by
        debris. Printers kept these disfigured letters in use while damages and idiosyncrasies accrued, providing a
        useful signal for contemporary scholars. Since no two pieces of type will degrade in precisely the same way,
        damaged and distinctive type offers a kind of typographical fingerprint that can reveal the identities of the
        individuals(s) responsible for a book’s making.</p>
      <br/>

      <h5>(Known) Limitations in CDT Data</h5>
      <br/>
      <p>While the CDT is a first-of-its-kind resource for the analysis of distinctive and damaged types at scale, it is
        not comprehensive for its period of coverage (1660-1700). Damaged type data for many printers remains limited
        for a variety of reasons. In many cases, a printer’s output survives only through a handful of editions, some of
        which may survive in only a few copies, few or none of which have been digitized. Moreover, many printers
        undoubtedly owned more fonts than appear here. What’s included in CDT in most cases simply reflects what’s been
        digitized and is publicly available. The CDT is also limited to uppercase, non-ligature characters. Extending
        beyond that set would impair our intention to create a tractable and searchable body of evidence.</p>
      <br/>
      <p>Still, the CDT represents a carefully curated set of more than 15,000 characters extracted from digital copies
        of more than 1900 editions printed between 1660 and 1700.</p>
      <br/>

      <h5>A Note on Printers</h5>
      <br/>
      <p>Some Restoration printers worked exclusively in collaboration with a second printer. The respective types of
        these printers — if they had separate type cases at all — are impossible to reliably assign or differentiate. In
        these cases, the names of both collaborators are given as a single entry in the CDT. An index of printers
        included in the CDT is linked
        <NuxtLink target="_blank" :to="{ src: person, name: 'printers' }" aria-label="To printers">here</NuxtLink>
        .
      </p>
      <br/>

      <h5>Print &amp; Probability</h5>
      <br/>
      <p>The type impressions gathered on the CDT were identified using machine learning and computer vision tools
        developed by the <a target="_blank" aria-label="Print & Probability project"
                            href="https://printprobability.org/">Print & Probability</a> project — an interdisciplinary
        of literary historians, bibliographers, librarians, and computer scientists at Carnegie Mellon University and
        the University of California, San Diego.</p>
      <br/>
      <p>To learn more about the Print & Probability project and our methods — what we call “computational
        bibliography” — see our <a target="_blank" aria-label="2021 lecture at the Grolier Club"
                                   href="https://vimeo.com/792949634">2021 lecture at the Grolier Club</a> or the list
        of publications available at <a target="_blank" aria-label="Print & Probability project"
                                        href="https://printprobability.org/">https://printprobability.org/</a>.</p>
      <br/>

      <h5 class="text-center" style="font-size: 25px">The CDT Team</h5>
      <br/>
      <div v-for="[role, group] of Object.entries(groups)" class="group-of-role">
        <div class="flex flex-grow-1 align-center">
          <v-divider class="mx-auto mt-5"/>
        </div>
        <v-row class="group-of-role-container mt-3">
          <v-col class="person-role-section" md="3" cols="12">
            <template v-if="$vuetify.display.mdAndUp && role.indexOf('&') > -1">
              <h3 style="font-size: 20px">{{role.split(' & ')[0]}}</h3>
              <h3 style="font-size: 20px">&</h3>
              <h3 style="font-size: 20px">{{role.split(' & ')[1]}}</h3>
            </template>
            <h3 v-else style="font-size: 20px">{{ role }}</h3>
          </v-col>
          <v-col class="person-card-section" md="9" cols="12">
            <PersonCard
              v-for="member in group"
              :src="member.src"
              :name="member.name"
              :degree="member.degree"
              :roles="member.roles"
              :social="member.social"
            />
          </v-col>
        </v-row>
      </div>
      <br/>
    </div>
  </v-container>
</template>

<script setup>
import {ref, computed} from "vue";

import image from '~/public/img/pnp_logo.png'
import person from '~/public/img/person.png';

// const members = ref([
//   {
//     src: person,
//     name: 'Christopher N. Warren',
//     degree: 'Carnegie Mellon University, Department of English',
//     roles: ['Editor']
//   },
//   {
//     src: person,
//     name: 'Taylor Berg-Kirkpatrick',
//     degree: 'UC San Diego, Computer Science & Engineering',
//     roles: ['Editorial & Technical Team']
//   },
//   {
//     src: person,
//     name: 'Laura DeLuca',
//     degree: 'Carnegie Mellon University, Department of English',
//     roles: ['Editorial & Technical Team']
//   },
//   {
//     src: person,
//     name: 'Baron Glanvill',
//     degree: 'Carnegie Mellon University, Department of English',
//     roles: ['Editorial & Technical Team']
//   },
//   {
//     src: person,
//     name: 'Kartik Goyal',
//     degree: 'Georgia Tech, College of Computing',
//     roles: ['Editorial & Technical Team']
//   },
//   {
//     src: person,
//     name: 'John Ladd',
//     degree: 'Washington & Jefferson College',
//     roles: ['Editorial & Technical Team']
//   },
//   {
//     src: 'img/lemley.jpg',
//     name: 'Sam Lemley',
//     degree: 'Carnegie Mellon University Libraries',
//     roles: ['Editorial & Technical Team', 'Frontend design']
//   },
//   {
//     src: person,
//     name: 'DJ Schuldt',
//     degree: 'Burke Library, Hamilton College',
//     roles: ['Editorial & Technical Team']
//   },
//   {
//     src: person,
//     name: 'Kari Thomas',
//     degree: 'Carnegie Mellon University, Department of History',
//     roles: ['Editorial & Technical Team']
//   },
//   {
//     src: person,
//     name: 'Nikolai Vogler',
//     degree: 'UC San Diego, Computer Science & Engineering',
//     roles: ['Editorial & Technical Team', 'Deployment & Publishing', 'Frontend design']
//   },
//   {
//     src: 'img/henry.jpg',
//     name: 'Henry Pham',
//     degree: 'Bachelor of Science in Information Technology, Software Development',
//     roles: ['Frontend design'],
//     social: {linkedin: 'https://www.linkedin.com/in/hungphamlk/'}
//   },
//   {
//     src: person,
//     name: 'Jonathan Armoza',
//     degree: null,
//     roles: ['Frontend design']
//   },
//   {
//     src: person,
//     name: 'Jonathan Kiritharan',
//     degree: 'Carnegie Mellon University Libraries',
//     roles: ['Deployment & Publishing']
//   },
//   {
//     src: person,
//     name: 'Talia Perry',
//     degree: 'Carnegie Mellon University Libraries',
//     roles: ['Deployment & Publishing']
//   },
// ]);
//
// const groups = computed(() => {
//   // Output
//   const groups = {'Editor': [], 'Editorial & Technical Team': [], 'Deployment & Publishing': [], 'Frontend design': []};
//
//   // Iterate through each member
//   for (const member of members.value) {
//     // Iterate through each role
//     for (const [role, group] of Object.entries(groups)) {
//       if (member.roles.indexOf(role) > -1) group.push(member)
//     }
//   }
//
//   return groups
// });

const groups = {
  "Editors": [
    {
      "src": 'img/warren.jpg',
      "name": "Christopher N. Warren",
      "degree": "Carnegie Mellon University, Department of English",
    },
    {
      "src": "img/lemley.jpg",
      "name": "Sam Lemley",
      "degree": "Carnegie Mellon University Libraries",
    },
  ],
  "Editorial & Technical Team": [
    {
  "src": 'img/tbk_portrait.jpg',
  "name": "Taylor Berg-Kirkpatrick",
  "degree": "UC San Diego, Computer Science & Engineering",
      },
    {
      "src": 'img/deluca.jpg',
      "name": "Laura DeLuca",
      "degree": "Carnegie Mellon University, Department of English",
    },
    {
      "src": person,
      "name": "Baron Glanvill",
      "degree": "Carnegie Mellon University, Department of English",
    },
    {
      "src": person,
      "name": "Kartik Goyal",
      "degree": "Georgia Tech, College of Computing",
    },
    {
      "src": 'img/ladd.jpg',
      "name": "John Ladd",
      "degree": "Washington & Jefferson College",
    },
    {
      "src": person,
      "name": "DJ Schuldt",
      "degree": "Burke Library, Hamilton College",
    },
    {
      "src": 'img/thomas.jpg',
      "name": "Kari Thomas",
      "degree": "Carnegie Mellon University, Department of History",
    },
    {
      "src": 'img/vogler.jpg',
      "name": "Nikolai Vogler",
      "degree": "UC San Diego, Computer Science & Engineering",
    }
  ],
  "Deployment & Publishing": [
    {
      "src": person,
      "name": "Jonathan Kiritharan",
      "degree": "Carnegie Mellon University Libraries",
    },
    {
      "src": person,
      "name": "Talia Perry",
      "degree": "Carnegie Mellon University Libraries",
    },
    {
      "src": 'img/vogler.jpg',
      "name": "Nikolai Vogler",
      "degree": "UC San Diego, Computer Science & Engineering",
    }
  ],
  "Frontend design": [
    {
      "src": "img/henry.jpg",
      "name": "Henry Pham",
      "degree": "Bachelor of Science in Information Technology, Software Development",
      "social": {"linkedin": "https://www.linkedin.com/in/hungphamlk/"}
    },
    {
      "src": "img/lemley.jpg",
      "name": "Sam Lemley",
      "degree": "Carnegie Mellon University Libraries",
    },
    {
      "src": person,
      "name": "Jonathan Armoza",
      "degree": null,
    },
  ]
}
</script>

<style scoped lang="scss">
.group-of-role {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 960px;
}

.group-of-role-container {
  display: flex;
  flex-grow: 1;
  align-items: flex-start;
}

.person-role-section {
  top: calc(64px + 32px);
  padding: 0 32px 0 0;
  width: 100px;
  position: sticky;
  text-align: center;

  @media(max-width: 960px) {
    direction: ltr;
    padding-left: 16px;
    position: static;
  }
}

.person-card-section {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  justify-content: flex-start;
  grid-row-gap: 12px;
}

h3 {
  font-size: 21px;
  font-weight: bold;
}

h5 {
  font-size: 17px;
}
</style>
