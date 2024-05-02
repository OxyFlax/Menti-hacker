// Example DevTools script
chrome.devtools.panels.create(
    "Menti hacker", // Title of the panel
    "", // Icon (leave empty for default)
    "panel.html", // HTML page to load in the panel
    () => {}
);