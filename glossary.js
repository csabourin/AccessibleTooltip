import {computePosition, size,offset,autoPlacement} from 'https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.4.5/+esm';
function updatePosition(referenceEl,floatingEl) {
	computePosition(referenceEl, floatingEl,{
			middleware: [autoPlacement({autoAlignment: true}),offset(10),size({
				apply({availableWidth, availableHeight, elements}) {
				  // Do things with the data, e.g.
				  Object.assign(floatingEl.style, {
					maxWidth: `${availableWidth}px`,
					maxHeight: `${availableHeight}px`,
				  });
				},
			  })]
		  }).then(({x, y}) => {
			Object.assign(floatingEl.style, {
			  left: `${x}px`,
			  top: `${y}px`,
			});
		  });
	}
document.addEventListener("DOMContentLoaded", function () {
	const docLang = document.documentElement.getAttribute("lang");
	const dataFile = document
		.querySelector("[data-glossary-file]")
		?.getAttribute("data-glossary-file");
	// Create a new style element and set its innerHTML to the provided CSS
	const styleElement = document.createElement("style");
	styleElement.innerHTML = `
            .glossary-popup {
                position: absolute;
				top: 0;
				left:0;
				max-width: max-content;
                z-index: 1;
                background-color: #333;
                color: #fff;
                padding: 12px;
				box-sizing: border-box;
                border-radius: 4px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
				cursor: text;
				visibility:hidden;
            }
    
            .glossary-popup[aria-hidden="false"] {
                display: block;
				visibility:visible;
            }

			.glossary-wrapper{
				display: inline-block;
			}
    
            .glossary {
                position: relative;
                text-decoration: underline dotted blue;
                cursor: help;
                color: #007bff;
            }
    
            .glossary:hover {
                color: #0056b3;
            }
    
            .glossary:focus {
                color: #0056b3;
            }
    
			.glossary-wrapper p.popupText{
				margin-bottom: 0;
				color: #fff;
			}
        `;

	// Append the style element to the document head
	// Fetch the definitions from the JSON file
	const url = dataFile ? dataFile : `glossary_${docLang}.txt`;
	fetch(url)
		.then((response) => response.json())
		.then((definitions) => {
			// Find all glossary elements
			const glossaryElements = Array.from(
				document.querySelectorAll(".glossary")
			);

			// Loop through the glossary elements
			glossaryElements.forEach((glossaryElement, index) => {
				const term = glossaryElement
					.getAttribute("data-term")
					.trim()
					.toLowerCase();
				// Find a definition that matches the glossary element's term
				const definition = definitions.find(
					(definition) => definition.term.trim().toLowerCase() === term
				);

				if (definition) {
					glossaryElement.setAttribute("tabindex", "0");
					// const wrapper = document.createElement("span");
					// wrapper.className = "glossary-wrapper";
					// wrapper.style.position = "relative";
					// wrapper.style.display = "inline-block";
					
					// glossaryElement.parentNode.replaceChild(wrapper, glossaryElement);
					// wrapper.appendChild(glossaryElement);

					const popup = document.createElement("div");
					popup.id = `popup_${definition.term}_${index}`; // Add index to make the ID unique
					popup.className = "glossary-popup";
					popup.setAttribute("role", "tooltip");
					popup.setAttribute("aria-hidden", "true");

					if (docLang && docLang.toLowerCase() === "fr") {
						popup.innerHTML = `<p style="color:#fff;" class="popupText">Définition: ${definition.definition}</p>`;
					} else {
						popup.innerHTML = `<p style="color:#fff;" class="popupText">Definition: ${definition.definition}</p>`;
					}
					glossaryElement.parentNode.insertBefore(popup, glossaryElement.nextSibling)
					// wrapper.appendChild(popup); // Append the popup element to the wrapper
					bindTooltipEvents(glossaryElement, popup );
					computePosition(glossaryElement,popup,{
						middleware: [autoPlacement({autoAlignment: true}),offset(10),size({
							apply({availableWidth, availableHeight, elements}) {
							  // Do things with the data, e.g.
							  Object.assign(popup.style, {
								maxWidth: `${availableWidth}px`,
								maxHeight: `${availableHeight}px`,
							  });
							},
						  })]
					  }).then(({x, y}) => {
						Object.assign(popup.style, {
						  left: `${x}px`,
						  top: `${y}px`,
						});
					  });
				}
			});
		});

	
	function bindTooltipEvents(tooltip, popup) {
		let timeout;

		tooltip.addEventListener("mouseenter", function (event) {
			clearTimeout(timeout);
			timeout = setTimeout(function () {				
				popup.setAttribute("aria-hidden", "false");
				updatePosition(tooltip, popup);
			}, 50); // Dont't wait half a second before displaying the tooltip
		});

		tooltip.addEventListener("mouseleave", function () {
			clearTimeout(timeout);
			timeout = setTimeout(function () {
				popup.setAttribute("aria-hidden", "true");
			}, 350);
		});

		popup.addEventListener("mouseenter", function () {
			clearTimeout(timeout);
		});

		popup.addEventListener("mouseleave", function () {
			clearTimeout(timeout);
			timeout = setTimeout(function () {
				popup.setAttribute("aria-hidden", "true");
			}, 350);
		});

		tooltip.addEventListener("focus", function (event) {
			clearTimeout(timeout);
			timeout = setTimeout(function () {
				popup.setAttribute("aria-hidden", "false");
				updatePosition(tooltip, popup);
			}, 50); // Dont't wait half a second before displaying the tooltip
		});

		tooltip.addEventListener("blur", function () {
			clearTimeout(timeout);
			timeout = setTimeout(function () {
				popup.setAttribute("aria-hidden", "true");
			}, 350);
		});

		tooltip.addEventListener("touchstart", function (event) {
			clearTimeout(timeout);
			if (popup.getAttribute("aria-hidden") === "true") {
				popup.setAttribute("aria-hidden", "false");
			} else {
				popup.setAttribute("aria-hidden", "true");
			}
		});

	}
	document.head.appendChild(styleElement);
});
