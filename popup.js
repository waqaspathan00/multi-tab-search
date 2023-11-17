document.getElementById('searchQuery').focus()

chrome.storage.local.get(['searchResults'], function (data) {
    if (data.searchResults) {
        displayResults(data.searchResults);
    }

    function displayResults(results) {
        const resultsElement = document.getElementById('results');
        resultsElement.innerHTML = '';

        // Create a table element
        const table = document.createElement('table');
        table.style.width = '100%';
        table.setAttribute('border', '1');

        // Create a header row
        const headerRow = document.createElement('tr');
        const headerTitle = document.createElement('th');
        headerTitle.textContent = 'Tab Title';
        const headerCount = document.createElement('th');
        headerCount.textContent = 'Count';

        headerRow.appendChild(headerTitle);
        headerRow.appendChild(headerCount);
        table.appendChild(headerRow);

        // Iterate over results and create a row for each
        results.forEach(result => {
            const row = document.createElement('tr');
            const titleCell = document.createElement('td');
            const countCell = document.createElement('td');

            // Create a link for the tab title
            const resultLink = document.createElement('a');
            resultLink.href = '#';
            resultLink.textContent = result.tabTitle;
            resultLink.dataset.tabId = result.tabId;
            resultLink.addEventListener('click', switchToTab);

            titleCell.appendChild(resultLink);
            countCell.textContent = result.count;

            row.appendChild(titleCell);
            row.appendChild(countCell);
            table.appendChild(row);
        });

        // Append the table to the results element
        resultsElement.appendChild(table);
    }


    function switchToTab(event) {
        event.preventDefault();
        const tabId = parseInt(event.target.dataset.tabId, 10);
        chrome.tabs.update(tabId, {active: true});
    }

});

document.getElementById('searchBtn').addEventListener('click', () => {
    let query = document.getElementById('searchQuery').value;
    if (query === '') {
        const resultsElement = document.getElementById('results');
        resultsElement.innerHTML = 'Please enter a search query.';
        return;
    }

    const resultsElement = document.getElementById('results');
    resultsElement.innerHTML = 'Searching...';

    chrome.runtime.sendMessage({action: "searchTabs", query: query}, function (results) {
        chrome.storage.local.set({searchResults: results});

        displayResults(results);
    });

    function displayResults(results) {
        const resultsElement = document.getElementById('results');
        resultsElement.innerHTML = '';

        // Create a table element
        const table = document.createElement('table');
        table.style.width = '100%';
        table.setAttribute('border', '1');

        // Create a header row
        const headerRow = document.createElement('tr');
        const headerTitle = document.createElement('th');
        headerTitle.textContent = 'Tab Title';
        const headerCount = document.createElement('th');
        headerCount.textContent = 'Count';

        headerRow.appendChild(headerTitle);
        headerRow.appendChild(headerCount);
        table.appendChild(headerRow);

        // Iterate over results and create a row for each
        results.forEach(result => {
            const row = document.createElement('tr');
            const titleCell = document.createElement('td');
            const countCell = document.createElement('td');

            // Create a link for the tab title
            const resultLink = document.createElement('a');
            resultLink.href = '#';
            resultLink.textContent = result.tabTitle;
            resultLink.dataset.tabId = result.tabId;
            resultLink.addEventListener('click', switchToTab);

            titleCell.appendChild(resultLink);
            countCell.textContent = result.count;

            row.appendChild(titleCell);
            row.appendChild(countCell);
            table.appendChild(row);
        });

        // Append the table to the results element
        resultsElement.appendChild(table);
    }


    function switchToTab(event) {
        event.preventDefault();
        const tabId = parseInt(event.target.dataset.tabId, 10);
        chrome.tabs.update(tabId, {active: true});
    }
});

document.getElementById('clearBtn').addEventListener('click', () => {
    chrome.storage.local.remove(['searchResults'], function () {
        const resultsElement = document.getElementById('results');
        resultsElement.innerHTML = 'Results cleared.';
    });
});