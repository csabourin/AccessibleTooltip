document.addEventListener("DOMContentLoaded", function () {
	const docLang = document.documentElement.getAttribute("lang");
	const dataFile = document
		.querySelector("[data-glossary-file]")
		?.getAttribute("data-glossary-file");
	// Create a new style element and set its innerHTML to the provided CSS
	const styleElement = document.createElement("style");
	styleElement.innerHTML = `
            .glossary-wrapper .glossary-popup {
                position: absolute;
                z-index: 1;
                background-color: #333;
                color: #fff;
                padding: 12px;
                border-radius: 4px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                max-width: 300px;
                width: max-content;
                display: none;
				cursor: text;
            }
    
            .glossary-popup[aria-hidden="false"] {
                display: block;
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
					const wrapper = document.createElement("span");
					wrapper.className = "glossary-wrapper";
					wrapper.style.position = "relative";
					wrapper.style.display = "inline-block";

					glossaryElement.parentNode.replaceChild(wrapper, glossaryElement);
					wrapper.appendChild(glossaryElement);

					const popup = document.createElement("div");
					popup.id = `popup_${definition.term}_${index}`; // Add index to make the ID unique
					popup.className = "glossary-popup speech-bubble";
					popup.setAttribute("speech-bubble", "true");
					popup.setAttribute("role", "tooltip");
					popup.setAttribute("aria-hidden", "true");

					if (docLang && docLang.toLowerCase() === "fr") {
						popup.innerHTML = `<p class="popupText">Définition: ${definition.definition}</p>`;
					} else {
						popup.innerHTML = `<p class="popupText">Definition: ${definition.definition}</p>`;
					}

					wrapper.appendChild(popup); // Append the popup element to the wrapper
					bindTooltipEvents(wrapper, popup );
				}
			});
		});

	// The tooltip events code you provided
	function bindTooltipEvents(tooltip, popup) {
		let timeout;

		tooltip.addEventListener("mouseenter", function (event) {
			clearTimeout(timeout);
			timeout = setTimeout(function () {
				positionPopup(event || window.event, tooltip, popup);
				popup.setAttribute("aria-hidden", "false");
			}, 500); // Wait half a second before displaying the tooltip
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
				positionPopup(event || window.event, tooltip, popup);
				popup.setAttribute("aria-hidden", "false");
			}, 500); // Wait half a second before displaying the tooltip
		});

		tooltip.addEventListener("blur", function () {
			clearTimeout(timeout);
			timeout = setTimeout(function () {
				popup.setAttribute("aria-hidden", "true");
			}, 350);
		});

		tooltip.addEventListener("touchstart", function (event) {
			clearTimeout(timeout);
			positionPopup(event || window.event, tooltip, popup);
			if (popup.getAttribute("aria-hidden") === "true") {
				popup.setAttribute("aria-hidden", "false");
			} else {
				popup.setAttribute("aria-hidden", "true");
			}
		});

		function positionPopup(event, tooltip, popup) {
			// Temporarily make the popup visible to calculate its dimensions
			const originalDisplay = popup.style.display;
			popup.style.visibility = "hidden";
			popup.style.display = "block";
		
			// Get the tooltip element's and its parent's bounding rectangles
			const tooltipRect = tooltip.getBoundingClientRect();
			const parentRect = tooltip.parentElement.getBoundingClientRect();
		
			// Limit the width of the popup to the width of its parent
			popup.style.maxWidth = `${parentRect.width<300?parentRect.width:300}px`;
		
			// Determine if there's enough space for the popup above the tooltip
			const enoughSpaceAbove = window.innerHeight - tooltipRect.bottom > popup.offsetHeight + 8; // 16px equals 1rem
		
			// Set the popup position based on the available space
			popup.style.position = "absolute";
		
			// Center the popup horizontally relative to the tooltip
			const leftPos = parentRect.left + parentRect.width / 2 - popup.offsetWidth;
			// Make sure the popup does not overflow the viewport
			const safeLeftPos = Math.max(20, Math.min(leftPos, window.innerWidth - popup.offsetWidth - 20));
			popup.style.left = `${safeLeftPos}px`;
		
			if (enoughSpaceAbove) {
				popup.style.top = `${tooltipRect.height + 8}px`; // 16px equals 1rem
				popup.setAttribute("pbottom", "true");
				popup.setAttribute("aleft", "true");
			} else {
				popup.style.top = `-${popup.offsetHeight + 8}px`; // 16px equals 1rem
				popup.setAttribute("ptop", "true");
				popup.setAttribute("aleft", "true");
			}
		
			// Restore the popup's original display value
			popup.style.visibility = "visible";
			popup.style.display = originalDisplay;
		}

	}
	document.head.appendChild(styleElement);
});
