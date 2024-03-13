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
				outline: 1px solid white;
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
					if (docLang && docLang.toLowerCase() === "fr") {
						glossaryElement.innerHTML = glossaryElement.innerHTML + `<span class="sr-only"> (comprend une définition, sélectionner l'élément avec la touche TAB puis utiliser la touche de la flèche vers le bas pour accéder à la définition)</span>`;
					} else {
						glossaryElement.innerHTML = glossaryElement.innerHTML + `<span class="sr-only"> (has definition, select element with TAB key then use down arrow key to access definition)</span>`;
					}
					glossaryElement.setAttribute("aria-describedby", "definition_" + index);
					// const wrapper = document.createElement("span");
					// wrapper.className = "glossary-wrapper";
					// wrapper.style.position = "relative";
					// wrapper.style.display = "inline-block";
					
					// glossaryElement.parentNode.replaceChild(wrapper, glossaryElement);
					// wrapper.appendChild(glossaryElement);

					const popup = document.createElement("div");
					popup.id = "definition_" + index; // Add index to make the ID unique
					popup.className = "glossary-popup";
					popup.setAttribute("role", "tooltip");
					popup.setAttribute("aria-hidden", "true");

					if (docLang && docLang.toLowerCase() === "fr") {
						popup.innerHTML = `<p style="color:#fff;" class="popupText">Définition<span class="sr-only"> de ${definition.term}</span> : ${definition.definition}</p>`;
					} else {
						popup.innerHTML = `<p style="color:#fff;" class="popupText">Definition<span class="sr-only"> of ${definition.term}</span>: ${definition.definition}</p>`;
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

			var flipCardDefinitions = document.querySelectorAll(".flip-card .flip-card-front[aria-hidden='true'] .glossary, .flip-card .flip-card-back[aria-hidden='true'] .glossary");

			flipCardDefinitions.forEach((element) => {
				element.setAttribute("tabindex", -1)
			})

			const flipCards = document.querySelectorAll(".flip-card")
			flipCards.forEach((element) => {
				element.onclick = () => {
					document.querySelectorAll(".flip-card .flip-card-front:not([aria-hidden='true']) .glossary, .flip-card .flip-card-back:not([aria-hidden='true']) .glossary").forEach((element) => {
						element.setAttribute("tabindex", 0)
					})

					document.querySelectorAll(".flip-card .flip-card-front[aria-hidden='true'] .glossary, .flip-card .flip-card-back[aria-hidden='true'] .glossary").forEach((element) => {
						element.setAttribute("tabindex", -1)
					})
				};
			})
		});

	
	function bindTooltipEvents(tooltip, popup) {
		let timeout;

		tooltip.addEventListener("mouseenter", function (event) {
			clearTimeout(timeout);
			activateESC(popup);
			timeout = setTimeout(function () {				
				popup.setAttribute("aria-hidden", "false");
				updatePosition(tooltip, popup);
			}, 50); // Dont't wait half a second before displaying the tooltip
		});

		tooltip.addEventListener("mouseleave", function () {
			clearTimeout(timeout);
			deactivateESC();
			timeout = setTimeout(function () {
				popup.setAttribute("aria-hidden", "true");
			}, 350);
		});

		popup.addEventListener("mouseenter", function () {
			clearTimeout(timeout);
		});

		popup.addEventListener("mouseleave", function () {
			clearTimeout(timeout);
			deactivateESC();
			timeout = setTimeout(function () {
				popup.setAttribute("aria-hidden", "true");
			}, 350);
		});

		tooltip.addEventListener("focus", function (event) {
			clearTimeout(timeout);
			activateESC(popup);
			timeout = setTimeout(function () {
				popup.setAttribute("aria-hidden", "false");
				updatePosition(tooltip, popup);
			}, 50); // Dont't wait half a second before displaying the tooltip
		});

		tooltip.addEventListener("blur", function () {
			clearTimeout(timeout);
			deactivateESC();
			timeout = setTimeout(function () {
				popup.setAttribute("aria-hidden", "true");
			}, 350);
		});

		tooltip.addEventListener("touchstart", function (event) {
			clearTimeout(timeout);
			if (popup.getAttribute("aria-hidden") === "true") {
				popup.setAttribute("aria-hidden", "false");
				activateESC(popup);
			} else {
				popup.setAttribute("aria-hidden", "true");
				deactivateESC();
			}
		});

	}
	document.head.appendChild(styleElement);
});

var popupRef;
function activateESC(popup){
	popupRef = popup;

	if(document.querySelector(".modal.show .modal-dialog")){
		document.querySelector(".modal.show .modal-dialog").addEventListener("keydown", modalHandler);
	}
	else{
		document.addEventListener("keydown", ESCHandler);
	}
}

function ESCHandler(evt){
	if(evt.key == "Escape"){
		popupRef.setAttribute("aria-hidden", "true");
		deactivateESC();
	}
}

function modalHandler(evt){
	if(evt.key == "Escape"){
		evt.preventDefault();
		evt.stopPropagation();

		ESCHandler(evt);
	}
}

function deactivateESC(){
	document.removeEventListener("keydown", ESCHandler);

	if(document.querySelector(".modal.show .modal-dialog")){
		document.querySelector(".modal.show .modal-dialog").removeEventListener("keydown", modalHandler);
	}
}