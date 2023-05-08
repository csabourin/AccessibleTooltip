# Glossary Vue.js Component

This is a simple and accessible Vue.js component that displays a glossary of terms in alphabetical order with a navigation bar for filtering the terms based on their initial letters. The glossary content can be fetched from a text file containing terms and definitions, either in English or French.

## Features

- Responsive navigation bar with alphabet letters for filtering terms.
- Alphabet letters are disabled if no terms start with that letter.
- Fetches glossary content from a text file based on the current language (English or French).
- Supports a custom glossary file path via a `data-glossary-path` attribute.
- Accessible keyboard navigation support for selecting letters.

## Usage

1. Include the `Glossary.vue` component in your Vue.js project.
2. Import the component and add it to your Vue.js instance or component.
3. Add the `<Glossary />` component in your template where you want the glossary to appear.
4. Add a `data-glossary-file` attribute to an HTML element if you want to use a custom glossary file path.
5. Provide a glossary text file (either `glossary_en.txt` for English or `glossary_fr.txt` for French) either in the same path as the html file or you can specify a custom relative or absolute path in `data-glossary-file`.
## Example

```html
<div id="app" data-glossary-path="..\assets\glossary_en.txt">
</div>
```

## Glossary JSON File Format

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

## Accessibility

This component supports keyboard navigation for selecting letters in the navigation bar. Users can use the `Enter` or `Space` key to select a letter. Disabled letters are not focusable.

## Styles

The component comes with default styles that can be overridden by using the appropriate CSS selectors in your project's stylesheet. The styles are scoped to the component to avoid conflicts with other components in your project.