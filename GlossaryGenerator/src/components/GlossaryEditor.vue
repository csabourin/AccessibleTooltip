<template>
    <div class="glossary-generator">
      <h1>Glossary Editor</h1>
      <details>
        <summary>Instructions</summary>
        <h2>Glossary Generator Instructions</h2>
        <ol>
          <li>
            <p>Upload a file:</p>
            <p>
              Click the "Choose File" button and select a .csv, .json, or .txt
              file containing your glossary data. Uploading a new file will
              overwrite the current glossary if there are any terms present.
            </p>
          </li>
          <li>
            <p>Select a language:</p>
            <p>
              Use the "Language" dropdown menu to choose either English (en) or
              French (fr) as the language for your glossary.
            </p>
          </li>
          <li>
            <p>Edit glossary terms and definitions:</p>
            <p>
              Once your file is uploaded, you can edit the terms and their
              definitions by clicking on the input fields. The terms will be
              sorted alphabetically.
            </p>
          </li>
          <li>
            <p>Add or remove terms:</p>
            <p>
              To add a new term, click the "Add Term" button. To remove a term,
              click the "x" button next to the term you want to remove.
            </p>
          </li>
          <li>
            <p>Save your glossary:</p>
            <p>
              When you're done editing your glossary, click the "Save Glossary"
              button to download a .txt file with your glossary data. The file
              will be named glossary_en.txt or glossary_fr.txt, depending on the
              selected language.
            </p>
          </li>
        </ol>
      </details>
      <header>
        <div class="file-input-container">
          <input
            type="file"
            ref="fileInput"
            @change="loadFile"
            accept=".csv,.json,.txt"
            hidden
          />
          <button class="load-file-btn" @click="triggerFileInput">
            Load File
          </button>
        </div>
        <div class="language-switch">
          <label for="language">Language:</label>
          <select v-model="language" name="language" id="language">
            <option value="en">English</option>
            <option value="fr">French</option>
          </select>
        </div>
      </header>
      <dl>
        <div class="entry" v-for="(entry, index) in glossary" :key="index">
          <div class="input-group">
            <dt>
              <label for="term">Term</label>
              <input id="term" v-model="entry.term" />
            </dt>
            <dd>
              <label for="definition">Definition</label>
              <textarea
                id="definition"
                v-model="entry.definition"
                rows="5"
              ></textarea>
            </dd>
          </div>
          <button
            title="Remove term"
            class="remove-btn"
            @click="removeTerm(index)"
          >
            <span class="remove-icon">&times;</span>
          </button>
        </div>
      </dl>
      <button class="add-btn" @click="addTerm">Add Term</button>
      <button class="save-btn" @click="saveGlossary">Save Glossary</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        glossary: [],
        language: "en",
      };
    },
    methods: {
      async loadFile(event) {
        const file = event.target.files[0];
        if (!file) return;
  
        // Check if file name contains "_fr" and set the language to French
        if (file.name.includes("_fr")) {
          this.language = "fr";
        } else {
          this.language = "en";
        }
  
        // Check if the glossary is not empty and prompt the user for confirmation
        if (this.glossary.length > 0) {
          const confirmation = confirm(
            "Loading a new file will overwrite the current glossary. Are you sure you want to continue?"
          );
          if (!confirmation) return;
        }
  
        const extension = file.name.split(".").pop();
  
        if (extension === "json" || extension === "txt") {
          const data = await this.loadJsonFile(file);
          this.glossary = this.sortGlossary(data);
        } else if (extension === "csv") {
          const data = await this.loadCsvFile(file);
          this.glossary = this.sortGlossary(data);
        }
      },
      triggerFileInput() {
        this.$refs.fileInput.click();
      },
      async loadJsonFile(file) {
        const reader = new FileReader();
        reader.readAsText(file);
  
        return new Promise((resolve) => {
          reader.onload = () => {
            const data = JSON.parse(reader.result);
            resolve(data);
          };
        });
      },
      async loadCsvFile(file) {
        const reader = new FileReader();
        reader.readAsText(file);
  
        return new Promise((resolve) => {
          reader.onload = () => {
            const data = this.parseCsv(reader.result);
            resolve(data);
          };
        });
      },
      parseCsv(csv) {
        const [headerLine, ...lines] = csv.split("\n");
        const headers = headerLine.split(",");
        return lines.map((line) => {
          const values = line.split(",");
          return headers.reduce((acc, header, index) => {
            acc[header] = values[index];
            return acc;
          }, {});
        });
      },
      saveGlossary() {
        const fileName = `glossary_${this.language}.txt`;
        const sortedGlossary = this.sortGlossary(this.glossary);
        const fileContent = JSON.stringify(sortedGlossary);
        const blob = new Blob([fileContent], {
          type: "application/json;charset=utf-8",
        });
        const downloadUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = downloadUrl;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadUrl);
      },
      sortGlossary(glossary) {
        return glossary.sort((a, b) => a.term.localeCompare(b.term));
      },
      addTerm() {
        this.glossary.push({ term: "", definition: "" });
      },
      removeTerm(index) {
        this.glossary.splice(index, 1);
      },
    },
  };
  </script>
  
  <style scoped>
  .glossary-generator {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 80%;
    margin: 0 auto;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .glossary-generator h1 {
    font-size: 2rem;
    text-align: center;
  }
  
  .glossary-generator details {
    width: 100%;
  }
  
  .glossary-generator .file-input-container {
    display: flex;
    align-items: center;
  }
  
  .glossary-generator .load-file-btn {
    background-color: #2c3e50;
    border: none;
    color: #ffffff;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  
  .glossary-generator header {
    display: flex;
    width: 100%;
    margin-bottom: 1rem;
    align-items: center;
    justify-content: space-between;
  }
  
  .glossary-generator dl {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 1rem;
  }
  
  .glossary-generator .entry {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    flex-wrap: nowrap;
    align-items: center;
    width: 100%;
  }
  
  .glossary-generator .input-group {
    display: flex;
    gap: 1rem;
    flex-grow: 1;
  }
  
  .glossary-generator dt,
  .glossary-generator dd {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  
  .glossary-generator input,
  .glossary-generator textarea {
    width: 100%;
    padding: 0.5rem;
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2);
    border: 1px solid #ccc;
  }
  
  .glossary-generator textarea {
    resize: none;
  }
  
  .glossary-generator .remove-btn {
    align-self: flex-start;
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    color: #c0392b;
    padding: 0;
    margin: 0;
  }
  
  .glossary-generator .remove-icon {
    display: inline-block;
    border-radius: 50%;
    background-color: #c0392b;
    color: #ffffff;
    padding: 2px 5px;
    font-weight: 500;
    font-size: 1rem;
    line-height: 1;
  }
  
  .glossary-generator .add-btn,
  .glossary-generator .save-btn {
    align-self: center;
    background-color: #2c3e50;
    border: none;
    color: #ffffff;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  
  .glossary-generator .add-btn {
    margin-bottom: 1rem;
  }
  
  .glossary-generator details {
    margin-bottom: 1rem;
  }
  
  .glossary-generator summary {
    font-weight: bold;
    cursor: pointer;
  }
  
  .glossary-generator ol {
    padding-left: 1.5rem;
  }
  
  .glossary-generator li p {
    margin: 0;
  }
  </style>
  