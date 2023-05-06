# Glossary Editor

A Vue.js application that allows users to create and edit a glossary of terms and their definitions. Users can upload a JSON, CSV, or TXT file with glossary data, add or remove terms, edit term definitions, and save the glossary as a JSON file in English or French.

## Features

- Customizable glossary with terms and definitions
- Ability to upload JSON, CSV, or TXT files
- Add, remove, and edit terms and definitions
- Save glossary as a JSON file in English or French
- Responsive design

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```


## Usage

1. **Upload a file:** Click the "Load File" button and select a .csv, .json, or .txt file containing your glossary data. Uploading a new file will overwrite the current glossary if there are any terms present.

2. **Select a language:** Use the "Language" dropdown menu to choose either English (en) or French (fr) as the language for your glossary.

3. **Edit glossary terms and definitions:** Once your file is uploaded, you can edit the terms and their definitions by clicking on the input fields. The terms will be sorted alphabetically.

4. **Add or remove terms:** To add a new term, click the "Add Term" button. To remove a term, click the "x" button next to the term you want to remove.

5. **Save your glossary:** When you're done editing your glossary, click the "Save Glossary" button to download a .txt file with your glossary data. The file will be named glossary_en.txt or glossary_fr.txt, depending on the selected language.