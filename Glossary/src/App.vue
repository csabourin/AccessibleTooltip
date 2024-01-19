<template>
  <div id="glossary-app">
    <nav id="glossary-nav">
      <button v-for="letter in alphabet" :key="letter" :class="{
        'ln-disabled': isDisabled(letter),
        'ln-selected': selectedLetter === letter,
      }" @click="selectLetter(letter)" @keydown.enter.space="selectLetter(letter)"
        :tabindex="isDisabled(letter) ? -1 : 0" :disabled="isDisabled(letter) ? 'disabled' : false">
        {{ letter.toUpperCase() }} <span class="sr-only" v-if="selectedLetter === letter && lang == 'fr'"> (lettre sélectionnée)</span><span class="sr-only" v-else-if="selectedLetter === letter"> (letter selected)</span>
      </button>
    </nav>
    <div class="glossary-list">
      <dl id="glossary">
        <template v-for="(entry, index) in filteredGlossary" :key="index">
          <dt>{{ entry.term }}</dt>
          <dd>{{ entry.definition }}</dd>
        </template>
      </dl>
    </div>
    <div v-if="hasGlossaryAccess">
      <details>
        <summary>Glossary Editor</summary>
        <GlossaryEditor :data-glossary-file="fetchFile" />
      </details>
    </div>
  </div>
</template>

<script>
import GlossaryEditor from "@/components/GlossaryEditor.vue";
import axios from "axios";
const GlossaryAccess = {
  enrollments: null,
  getOrgId: function () {
    return window.top.location.pathname.split("/")[4];
  },
  getTopicId: function () {
    let topicId,
      href = window.top.location.href;
    if (href.indexOf("enhancedSequenceViewer") !== -1) {
      href = decodeURIComponent(href);
      href = href.split("?url=")[1];
      href = href.split("?")[0];
      topicId = href.split("/")[5];
    } else {
      topicId = href.split("/")[8];
    }
    return topicId;
  },
  init: function (data) {
    GlossaryAccess.enrollments = data;
    console.log("Role : ", GlossaryAccess.enrollments.Access.ClasslistRoleName);
    if (
      GlossaryAccess.enrollments.Access.ClasslistRoleName ===
      "Super Designer - Super concepteur"
      || GlossaryAccess.enrollments.Access.ClasslistRoleName === "Designer - Concepteur"
    ) {
      this.hasGlossaryAccess = true;
    }
  },
};

export default {
  components: {
    GlossaryEditor,
  },
  data() {
    return {
      fetchFile: "",
      glossary: [],
      alphabet: "abcdefghijklmnopqrstuvwxyz".split(""),
      selectedLetter: "",
      hasGlossaryAccess: false,
      lang: "en"
    };
  },
  created() {
    this.fetchGlossary();
  },
  computed: {
    filteredGlossary() {
      if (this.selectedLetter === "") return this.glossary;
      return this.glossary.filter(
        (entry) => this.getClass(entry.term) === "ln-" + this.selectedLetter
      );
    },
  },
  methods: {
    async fetchGlossary() {
      const timestamp = new Date().getTime();
      const glossaryCustomFile = document.querySelector("[data-glossary-file]")?.getAttribute("data-glossary-file");
      const lang = document.documentElement.getAttribute("lang");
      const glossaryFile = lang === "fr" ? "glossary_fr.txt" : "glossary_en.txt";
      this.fetchFile = glossaryCustomFile ? glossaryCustomFile : glossaryFile;
      const response = await axios.get(this.fetchFile + "?timestamp=" + timestamp);

      // Sorting the glossary alphabetically based on the term
      this.glossary = response.data.sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));

      // Selecting the first letter of the first term in the sorted glossary
      this.selectedLetter = this.getClass(this.glossary[0].term).slice(-1);
    },
    selectLetter(letter) {
      if(!this.isDisabled(letter)) this.selectedLetter = letter;
    },
    isDisabled(letter) {
      return !this.glossary.some(
        (entry) => this.getClass(entry.term) === "ln-" + letter
      );
    },
    getClass(term) {
      const normalizedTerm = term
        .toLowerCase()
        .replace(/[àáâãäå]/g, "a")
        .replace(/[èéêë]/g, "e")
        .replace(/\s/g, "");
      return "ln-" + normalizedTerm.charAt(0);
    },
    initializeGlossaryAccess() {
      GlossaryAccess.ouID = GlossaryAccess.getOrgId();
      GlossaryAccess.topicID = GlossaryAccess.getTopicId();
      libVal.get.myEnrollmentsOrg(GlossaryAccess.ouID, (data) =>
        GlossaryAccess.init.call(this, data)
      );
    },
  },
  mounted() {
    if (typeof libVal !== "undefined") {
      this.initializeGlossaryAccess();
    } else {
      console.warn(
        "libVal library is not loaded. Skipping GlossaryAccess initialization."
      );
    }

    if(document.documentElement.getAttribute('lang') == 'fr') this.lang = "fr";
  },
};
</script>

<style scoped>
#glossary-app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  margin-top: 10px;
}

.ln-selected {
  background-color: #261933;
  color: #fff;
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
  margin:auto;
  margin-bottom:1em;
}

#glossary-nav button {
  color: #fff;
  background-color: #4e5b73;
  border-color: #4e5b73;
  font-weight: 700;
  padding: 0.5rem 1rem;
  cursor: pointer;
  width: 10%;
  text-align: center;
  appearance: none;
  border: none;
  font-size: 1.5rem;
  border-radius: 0;
  transition: background-color 0.2s, color 0.2s;
  -webkit-transition: background-color 0.2s, color 0.2s;
  -moz-transition: background-color 0.2s, color 0.2s;
  -o-transition: background-color 0.2s, color 0.2s;
  -ms-transition: background-color 0.2s, color 0.2s;
}

#glossary-nav button.ln-disabled {
  color: #8f8f8f;
  pointer-events: none;
}

.ln-disabled:hover,
.ln-disabled:focus {
  background-color: #736a7b;
  color: #fff;
}

#glossary-nav button:hover,
#glossary-nav button:focus {
  background-color: #3f2a56;
  color: #fff;
}

.glossary-list {
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
}

#glossary {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 1rem;
  max-width: 1024px;
  margin:auto;
}

#glossary dt {
  font-size: 1.1875rem;
  text-align: right;
  line-height: 1.75rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

#glossary dd {
  margin:0;
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

  #glossary-nav button {
    padding: 0.4rem 0.8rem;
  }
}

@media screen and (max-width: 480px) {
  #glossary-nav {
    font-size: 1em;
  }

  #glossary-nav button {
    padding: 0.3rem 0.6rem;
  }
}

.sr-only {
    border: 0;
    clip: rect(0,0,0,0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
}

</style>
