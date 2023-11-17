chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "searchTabs") {
        let results = [];
        let tabsProcessed = 0;

        chrome.tabs.query({}, function (tabs) {
            if (tabs.length === 0) {
                sendResponse([]);
                return;
            }

            tabs.forEach(tab => {
                chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    function: searchTextOnPage,
                    args: [request.query, tabs]
                }, (injectionResults) => {
                    tabsProcessed++;
                    console.log("injectionResults: ")
                    console.dir(injectionResults[0])
                    if (injectionResults && injectionResults[0].result) {
                        let result = injectionResults[0].result;
                        results.push({
                            tabId: tab.id,
                            tabTitle: tab.title,
                            count: result.count,
                            highlights: result.highlights
                        });
                    }
                    if (tabsProcessed === tabs.length) {
                        sendResponse(results);
                    }
                });
            });
        });

        return true;
    }
});

function searchTextOnPage(query, tabs) {
    console.log("backgroundjs: ");
    let count = (document.body.innerText.match(new RegExp(query, "gi")) || []).length;
    let highlights = highlightText(document.body, query);
    console.log("counts n highlights: ")
    console.dir(count)
    console.dir(highlights)

    return { count, highlights };

    function highlightText(node, query) {
        let highlightIds = [];

        if (node.nodeType === Node.TEXT_NODE) {
            const match = node.nodeValue.match(new RegExp(query, 'i'));
            if (match) {
                console.log("matching: " + match)
                const highlight = document.createElement('span');
                highlight.style.backgroundColor = '#FCFB36';
                highlight.style.color = '#000000';
                highlight.textContent = match[0];

                const highlightId = `highlight-${new Date().getTime()}`;
                highlight.id = highlightId;
                highlightIds.push(highlightId);

                const afterText = node.splitText(match.index);
                afterText.nodeValue = afterText.nodeValue.substring(match[0].length);
                node.parentNode.insertBefore(highlight, afterText);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
            // Recurse into child nodes if it's an element but not a script or style tag.
            Array.from(node.childNodes).forEach(child => {
                highlightIds.push(...highlightText(child, query));
            });
        }
        return highlightIds;

    }
}

// to implement:
// when highlighting text, also add an id to the span so it can be referenced later
// from the highlighttext function, along with tabtitles also return the ids that were created for the spans & the text that was highlighted
// in popup.js, add a function that will scroll to the next highlighted text when the user clicks the next button