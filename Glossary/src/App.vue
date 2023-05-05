<template>
  <div id="glossary-app">
    <nav id="glossary-nav">
      <span
        v-for="letter in alphabet"
        :key="letter"
        :class="{ 'ln-disabled': isDisabled(letter), 'ln-selected': selectedLetter === letter }"
        @click="selectLetter(letter)"
        @keydown.enter.space="selectLetter(letter)"
        :tabindex="isDisabled(letter) ? -1 : 0"
      >
        {{ letter.toUpperCase() }}
      </span>
    </nav>
    <div class="glossary-list">
      <dl id="glossary">
        <template v-for="(entry, index) in filteredGlossary" :key="index">
          <dt>{{ entry.term }}</dt>
          <dd>{{ entry.definition }}</dd>
        </template>
      </dl>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      glossary: [],
      alphabet: 'abcdefghijklmnopqrstuvwxyz'.split(''),
      selectedLetter: '',
    };
  },
  created() {
    this.fetchGlossary();
  },
  computed: {
    filteredGlossary() {
      if (this.selectedLetter === '') return this.glossary;
      return this.glossary.filter((entry) => this.getClass(entry.term) === 'ln-' + this.selectedLetter);
    },
  },
  methods: {
    async fetchGlossary() {
      const glossaryCustomFile = document.querySelector("[data-glossary-path]")?.getAttribute('data-glossary-path');
      const lang = document.documentElement.getAttribute('lang');
      const glossaryFile = lang === 'fr' ? 'glossary_fr.txt' : 'glossary_en.txt';
      const fetchFile = glossaryCustomFile ? glossaryCustomFile : glossaryFile;
      const response = await axios.get(fetchFile);
      this.glossary = response.data;
      this.selectedLetter = this.alphabet[0];
    },
    selectLetter(letter) {
      this.selectedLetter = letter;
    },
    isDisabled(letter) {
      return !this.glossary.some((entry) => this.getClass(entry.term) === 'ln-' + letter);
    },
    getClass(term) {
      const normalizedTerm = term
        .toLowerCase()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/\s/g, '');
      return 'ln-' + normalizedTerm.charAt(0);
    },
  },
};
</script>

<style scoped>#glossary-app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  margin-top: 10px;
}

.ln-selected {
  background-color: #261933;
  color: #fff;
  text-shadow: 0 0 0.5rem #ffffff;
  font-weight: bold;
  text-decoration: underline;
}

#glossary-nav {
  background-color: #4e5b73;
  font-size: 1.5em;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  max-width: 1024px;
  width: 100%;
  margin-bottom: 20px;
}

#glossary-nav span {
  color: #fff;
  background-color: #4e5b73;
  border-color: #4e5b73;
  font-weight: 700;
  padding: 0.5rem 1rem;
  cursor: pointer;
  width:10%;
  text-align:center;
  transition: background-color 0.2s, color 0.2s;
  -webkit-transition: background-color 0.2s, color 0.2s;
  -moz-transition: background-color 0.2s, color 0.2s;
  -o-transition: background-color 0.2s, color 0.2s;
  -ms-transition: background-color 0.2s, color 0.2s;
}

#glossary-nav span.ln-disabled {
  color: #8f8f8f;
  pointer-events: none;
}

.ln-disabled:hover,
.ln-disabled:focus {
  background-color: #736a7b;
  color: #fff;
}

#glossary-nav span:hover,
#glossary-nav span:focus {
  background-color: #261933;
  color: #fff;
}

.glossary-list {
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
}

#glossary {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  width: 100%;
  max-width: 1024px;
}

#glossary dt {
  font-size: 1.1875rem;
  line-height: 1.75rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

#glossary dd {
  margin-bottom: 1rem;
}

.listNavHide {
  display: none;
}

/* Media Queries for Responsiveness */
@media screen and (max-width: 767px) {
  #glossary-nav {
    font-size: 1.2em;
  }

  #glossary-nav span {
    padding: 0.4rem 0.8rem;
  }
}

@media screen and (max-width: 480px) {
  #glossary-nav {
    font-size: 1em;
  }

  #glossary-nav span {
    padding: 0.3rem 0.6rem;
  }
}

</style>