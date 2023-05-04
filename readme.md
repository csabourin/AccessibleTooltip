# Glossary Tooltip Script

This script creates an accessible tooltip for glossary terms with customizable definitions fetched from a JSON file. The tooltip appears above or below the glossary term based on the available space and includes a delay before displaying. The script also adapts to different document languages.

## How to use

1. Add the `.glossary` class to any element in your HTML that contains a glossary term.
2. Add a `data-term` attribute to the `.glossary` element with the term as its value. This value will be used to fetch the correct definition from the JSON file.
3. If you want to use a custom JSON file, add a `data-file` attribute to the script tag with the JSON file's path as its value.
4. To display the tooltip in a specific language, set the `lang` attribute on the `<html>` element to the desired language code (e.g., "fr" for French).

## Example usage

```html
<html lang="fr">
  <head>
    <!-- Add the script tag -->
    <script src="path/to/tooltip-script.js" data-file="custom_glossary.json"></script>
  </head>
  <body>
    <p>
      This is an example sentence with a
      <span class="glossary" data-term="example">glossary term</span>.
    </p>
  </body>
</html>
```

## JSON file format

The JSON file should contain an array of objects with the following structure:

```json
[
  {
    "term": "example",
    "definition": "This is the definition of the example term."
  },
  {
    "term": "another-term",
    "definition": "This is the definition of another term."
  }
]
```

## Customization

The script includes a CSS block that can be customized to style the tooltip, glossary terms, and tooltip container. To change the appearance, edit the `styleElement.innerHTML` string in the script.

## Accessibility

The script sets a `tabindex` attribute to every `.glossary` element, allowing keyboard navigation. It also includes the appropriate ARIA attributes for better screen reader support.