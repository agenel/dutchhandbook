#  🇳🇱 Dutch Grammar Hub

Welcome to the **Dutch Grammar Hub**! This project is a modern, modular, and highly interactive learning hub designed to make mastering A1-B1 Dutch grammar as intuitive and visually pleasing as possible.

##  Features

- **12 Comprehensive Cheat Sheets**: Covers all the notoriously difficult topics for English speakers including **The '+e' Rule**, **The Word "Er"**, **Geen vs. Niet**, **Separable Verbs**, and **Word Order (V2/STOMPS)**.
- **Interactive Flashcards ("Test Mode")**: A built-in study tool synced to your browser's local storage. Toggle "Test Mode" to blur out all English answers—mimicking a native "spoiler" blackout—and hover or tap to reveal them for active recall.
- **Dark Mode**: Fully implemented automatic and manual dark mode using CSS variables. 
- **Print Optimization**: Includes strict `@media print` rules. Pressing `Cmd+P` or `Ctrl+P` automatically strips away the dark theming, hides navigation buttons, and reformats the documents so they print cleanly on white A4 paper without wasting printer ink.
- **Guided Navigation**: A natively foldable curriculum roadmap on the homepage, combined with seamless "Next/Previous" linear navigation across all 12 modules.
- **Fully Responsive**: Crafted entirely with CSS Grid and Flexbox to guarantee a flawless experience whether you are on a massive desktop monitor or a small mobile phone.

## Architecture

This application is built with **Vanilla Web Technologies**. There are no heavy frameworks, no build steps, and no `node_modules`.

- `index.html`: The central hub and roadmap.
- `sheets/`: The subdirectory containing the 12 standalone HTML grammar modules.
- `css/style.css`: The singular, unified stylesheet bridging the entire UI design system, Grid layouts, animations, and dark/light mode tokens.
- `js/main.js`: A lightweight vanity script that handles the local storage syncing for the Flashcard Mode and Dark Mode toggles.

##  Running Locally

Because it's a completely static project, you don't need any local web server to run it. 

Simply double-click the `index.html` file to open it in your browser and start learning!

##  Expanding the Hub

If you want to add a 13th sheet:
1. Duplicate a file inside the `sheets/` dictionary (e.g., `time.html`).
2. Add your new table content. Be sure to wrap English translations in the `<span class="en">` class—this automatically grants it the interactive Flashcard blurred behavior!
3. Add a new route card to `index.html`.
4. Update the "Next/Previous" linear buttons on the neighboring sheets.
