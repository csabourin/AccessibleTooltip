<template>
  <keep-alive>
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
            <span class="remove-icon">X</span>
          </button>
        </div>
      </dl>
      <button class="add-btn" @click="addTerm">Add Term</button>
      <button class="save-btn" @click="saveGlossary">Save Glossary</button>
    </div>
  </keep-alive>
</template>

<script>
import Papa from "papaparse";
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
    console.log(GlossaryAccess.enrollments.Access.ClasslistRoleName);
    if (
      GlossaryAccess.enrollments.Access.ClasslistRoleName ===
      "Super Designer - Super concepteur"
    ) {
      this.hasGlossaryAccess = true;
    }
  },
};
export default {
  name: "GlossaryEditor",
  props: {
    dataGlossaryFile: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      glossary: [],
      language: "en",
      hasGlossaryAccess: false,
      fileUrl: "",
      ModuleId: 0,
    };
  },
  computed: {
    orgId() {
      return GlossaryAccess.getOrgId();
    },
    topicId() {
      return GlossaryAccess.getTopicId();
    },
  },
  methods: {
    async fetchGlossary() {
      const response = await axios.get(this.dataGlossaryFile);
      this.glossary = response.data;
      if (this.dataGlossaryPath.includes("_fr")) {
        this.language = "fr";
      } else {
        this.language = "en";
      }
    },
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
      reader.readAsText(file, "UTF-8");

      return new Promise((resolve) => {
        reader.onload = () => {
          const data = this.parseCsv(reader.result);
          resolve(data);
        };
      });
    },
    async loadCsvFile(file) {
      return new Promise((resolve) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data);
          },
        });
      });
    },
    async fetchFileUrl() {
      const csrfToken = localStorage["XSRF.Token"];
      const apiVersion = "1.22";
      const apiUrl = `/d2l/api/le/${apiVersion}/${this.orgId}/content/topics/${this.topicId}`;

      try {
        const response = await axios.get(apiUrl, {
          headers: {
            "X-Csrf-Token": csrfToken,
          },
        });

        this.fileUrl = response.data.Url;
        this.ModuleId = response.data.ParentModuleId;
        console.log("Relative file URL:", response.data);
        console.log("Absolute file URL:", this.fileUrl);
      } catch (error) {
        console.error("Error fetching file URL:", error);
      }
    },
    getRelativePath(fullUrl) {
      const lastIndex = fullUrl.lastIndexOf("/");
      const path = fullUrl.substring(0, lastIndex);
      return path;
    },
    async saveGlossary() {
      const orgUnitId = GlossaryAccess.getOrgId();
      console.log(orgUnitId);
      const moduleId = this.ModuleId;
      const topicData = {
        IsHidden: true,
        IsLocked: false,
        ShortTitle: "Glossary",
        Type: 1,
        DueDate: null,
        Url: `${this.getRelativePath(this.fileUrl)}/glossary_${
          this.language
        }.txt`,
        StartDate: null,
        TopicType: 1,
        EndDate: null,
        Title: "Glossary topic content",
      };
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
      await this.uploadFile(orgUnitId, moduleId, topicData, fileContent);
      if (window.confirm("File Saved. Do you want to also download this file?")) {downloadLink.click();}
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);
    },
    async uploadFile(orgUnitId, moduleId, topicData, file) {
      const boundary = "xxBOUNDARYxx";

      // Prepare the JSON data for the topic
      const jsonPart = `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(
        topicData
      )}\r\n`;

      // Prepare the file part
      const filePart = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="glossary_${this.language}.txt"\r\nContent-Type: text/plain\r\n\r\n${file}\r\n--${boundary}--`;

      // Combine the JSON data and file into a single request body
      const requestBody = jsonPart + filePart;

      // Get the token from local storage
      const csrfToken = localStorage["XSRF.Token"];

      // Make the request using axios
      try {
        const response = await axios.post(
          `/d2l/api/le/1.22/${orgUnitId}/content/modules/${moduleId}/structure/`,
          requestBody,
          {
            headers: {
              "Content-Type": `multipart/mixed;boundary=${boundary}`,
              "X-Csrf-Token": csrfToken,
            },
          }
        );

        console.log("File uploaded successfully", response);
      } catch (error) {
        console.error("Error uploading file", error);
      }
    },

    sortGlossary(glossary) {
      return glossary.sort((a, b) =>
        (a.term || "").localeCompare(b.term || "")
      );
    },

    addTerm() {
      this.glossary.push({ term: "", definition: "" });
    },
    removeTerm(index) {
      this.glossary.splice(index, 1);
    },
  },
  mounted() {
    this.fetchGlossary();
    this.fetchFileUrl();
  },
};
</script>

<style scoped>
.glossary-generator {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 95%;
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
  resize: vertical;
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
  box-shadow: none;
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
