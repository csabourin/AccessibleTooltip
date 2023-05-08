document.addEventListener("DOMContentLoaded", function () {
	const docLang = document.documentElement.getAttribute("lang");
    const dataFile = document.querySelector("[data-glossary-file]")?.getAttribute("data-glossary-file");
	// Create a new style element and set its innerHTML to the provided CSS
	const styleElement = document.createElement("style");
	styleElement.innerHTML = `
            .glossary .popup {
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
    
            .popup[aria-hidden="false"] {
                display: block;
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
    
            .tooltip-container {
                display: inline;
            }
			.glossary p{
				margin-bottom: 0;
			}

			[speech-bubble], [speech-bubble] * { box-sizing: border-box }

[speech-bubble]{
  --bbColor: #333;
  --bbArrowSize: 1.5rem;
  --bbBorderRadius: 0.25rem;
  --bbPadding: 1rem;
  background: var(--bbColor);
  border-radius: var(--bbBorderRadius);
  padding: var(--bbPadding);
}

[speech-bubble]::before{
  content: ''; 
  position: absolute;
  background: var(--bbColor);
}

[speech-bubble][pbottom]{ margin-bottom: var(--bbArrowSize) }
[speech-bubble][ptop]   { margin-top: var(--bbArrowSize); }
[speech-bubble][pleft]  { margin-left: var(--bbArrowSize); }
[speech-bubble][pright] { margin-right: var(--bbArrowSize); }


/* bottom and top  */
[speech-bubble][pbottom]::before,
[speech-bubble][ptop]::before{
  --width: calc(var(--bbArrowSize) / 2 * 3);
  height: var(--bbArrowSize);
  width: var(--width);
}

/* bottom */
[speech-bubble][pbottom]::before{
  top: calc(100% - 2px);
}
[speech-bubble][pbottom][aleft]::before{
  left: 1rem;
  clip-path: polygon(25% 0, 100% 0, 0% 100%)
}
[speech-bubble][pbottom][acenter]::before{
  left: calc(50% - var(--width) / 2);
  clip-path: polygon(12.5% 0, 87.5% 0, 50% 100%)
}
[speech-bubble][pbottom][aright]::before{
  right: 1rem;
  clip-path: polygon(0 0, 75% 0, 100% 100%)
}

/* top */
[speech-bubble][ptop]::before{
  bottom: calc(100% - 2px);
}
[speech-bubble][ptop][aleft]::before{
  left: var(--bbPadding);
  clip-path: polygon(0 0, 100% 100%, 25% 100%)
}
[speech-bubble][ptop][acenter]::before{
  left: calc(50% - var(--width) / 2);
  clip-path: polygon(12.5% 100%, 50% 0, 87.5% 100%)
}
[speech-bubble][ptop][aright]::before{
  right: var(--bbPadding);
  clip-path: polygon(0 100%, 100% 0, 75% 100%)
}

/* left and right  */
[speech-bubble][pleft]::before,
[speech-bubble][pright]::before{
  --height: calc(var(--bbArrowSize) / 2 * 3);
  width: var(--bbArrowSize);
  height: var(--height);
}

/* right */
[speech-bubble][pright]::before{
  left: calc(100% - 2px);
}
[speech-bubble][pright][atop]::before{
  top: var(--bbPadding);
  clip-path: polygon(100% 0, 0 100%, 0 25%)
}
[speech-bubble][pright][acenter]::before{
  top: calc(50% - var(--height) / 2);
  clip-path: polygon(0 12.5%, 100% 50%, 0 87.5%)
}
[speech-bubble][pright][abottom]::before{
  bottom: var(--bbPadding);
  clip-path: polygon(0 0, 100% 100%, 0 75%)
}

/* left */
[speech-bubble][pleft]::before{
  right: calc(100% - 2px);
}
[speech-bubble][pleft][atop]::before{
  top: var(--bbPadding);
  clip-path: polygon(0 0, 100% 25%, 100% 100%)
}
[speech-bubble][pleft][acenter]::before{
  top: calc(50% - var(--height) / 2);
  clip-path: polygon(0 50%, 100% 12.5%, 100% 87.5%);
}
[speech-bubble][pleft][abottom]::before{
  bottom: var(--bbPadding);
  clip-path: polygon(0 100%, 100% 0, 100% 75%)
}

/* flip */
[speech-bubble][pbottom][flip]::before,
[speech-bubble][ptop][flip]::before{
  transform: scaleX(-1)
}
[speech-bubble][pleft][flip]::before,
[speech-bubble][pright][flip]::before{
  transform: scaleY(-1)
}

        `;

	// Append the style element to the document head
	document.head.appendChild(styleElement);
	// Fetch the definitions from the JSON file
	const url = dataFile ? dataFile : `glossary_${docLang}.txt`;
	fetch(url)
		.then((response) => response.json())
		.then((definitions) => {
			// Loop through the definitions
			definitions.forEach((definition) => {
				// Find the glossary element with the matching term
				const glossaryElement = Array.from(
					document.querySelectorAll(".glossary")
				).find(
					(element) =>
						element.getAttribute("data-term").trim().toLowerCase() ===
						definition.term.trim().toLowerCase()
				);

				if (glossaryElement) {
					glossaryElement.setAttribute("tabindex", "0");
					// Create a new popup element
					const popup = document.createElement("div");
					popup.id = `popup_${definition.term}`;
					popup.className = "popup speech-bubble";
					popup.setAttribute("speech-bubble", "true")
					popup.setAttribute("role", "tooltip");
					popup.setAttribute("aria-hidden", "true");

					// Check the document language and set the innerHTML accordingly
					if (docLang && docLang.toLowerCase() === "fr") {
						popup.innerHTML = `<p>Définition: ${definition.definition}</p>`;
					} else {
						popup.innerHTML = `<p>Definition: ${definition.definition}</p>`;
					}

					// Append the popup element to the glossary element
					glossaryElement.appendChild(popup);

					// Bind the tooltip events to the glossary element
					bindTooltipEvents(glossaryElement, popup);
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
		  
			// Get the tooltip element's bounding rectangle
			const tooltipRect = tooltip.getBoundingClientRect();
		  
			// Calculate the space above the tooltip element
			const spaceAbove = tooltipRect.top;
		  
			// Calculate the space below the tooltip element
			const spaceBelow = window.innerHeight - tooltipRect.bottom;
		  
			// Determine if there's enough space for the popup above the tooltip
			const enoughSpaceAbove = spaceAbove > popup.offsetHeight + 8; // 16px equals 1rem
		  
			// Set the popup position based on the available space
			popup.style.position = "fixed";
		  
			// Calculate left position while considering the 10 pixels margin
			let leftPos = tooltipRect.left + window.scrollX;
			if (leftPos < 20) {
			  leftPos = 20;
			} else if (leftPos + popup.offsetWidth > window.innerWidth - 20) {
			  leftPos = window.innerWidth - 20 - popup.offsetWidth;
			}
			popup.style.left = `${leftPos}px`;
		  
			if (enoughSpaceAbove) {
			  popup.style.top = `${
				tooltipRect.top - popup.offsetHeight - 8 + window.scrollY
			  }px`; // 16px equals 1rem
			  popup.setAttribute("pbottom", "true");
			  popup.setAttribute("aleft", "true");
			} else {
			  popup.style.top = `${tooltipRect.bottom + 8 + window.scrollY}px`; // 16px equals 1rem
			  popup.setAttribute("ptop", "true");
			  popup.setAttribute("aleft", "true");
			}
		  
			// Restore the popup's original display value
			popup.style.visibility = "visible";
			popup.style.display = originalDisplay;
		  }
		  
	}
});
