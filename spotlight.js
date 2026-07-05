// API_URL and callApi() live in api.js (included before this file).
// This page is public (no login required), same as the book catalog view —
// it's meant to double as a marketing feed.

const spotlightStatus = document.getElementById('spotlightStatus');
const spotlightFeed = document.getElementById('spotlightFeed');

function setSpotlightStatus(message) {
  spotlightStatus.textContent = message || '';
}

function formatUpdatedAt(value) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatPrice(price) {
  const n = Number(price);
  return 'KES ' + (isNaN(n) ? price : n.toLocaleString());
}

function renderSpotlight(entries) {
  spotlightFeed.innerHTML = '';
  if (!entries.length) {
    spotlightFeed.innerHTML = '<p class="spotlight-empty">No features yet — add rows to the "Spotlight" tab in the sheet.</p>';
    return;
  }

  entries.forEach((entry) => {
    const row = document.createElement('article');
    row.className = 'spotlight-entry';

    const date = document.createElement('span');
    date.className = 'spotlight-entry-date';
    date.textContent = formatUpdatedAt(entry.updatedAt);

    const body = document.createElement('div');
    body.className = 'spotlight-entry-body';

    const name = document.createElement('h3');
    name.className = 'spotlight-name';
    name.textContent = entry.name;

    const headline = document.createElement('p');
    headline.className = 'spotlight-headline';
    headline.textContent = entry.headline;

    body.appendChild(name);
    body.appendChild(headline);

    if (entry.blurb) {
      const blurb = document.createElement('p');
      blurb.className = 'spotlight-blurb';
      blurb.textContent = entry.blurb;
      body.appendChild(blurb);
    }

    const actions = document.createElement('div');
    actions.className = 'spotlight-actions';

    if (entry.youtubeUrl) {
      const watch = document.createElement('a');
      watch.className = 'spotlight-watch';
      watch.href = entry.youtubeUrl;
      watch.target = '_blank';
      watch.rel = 'noopener noreferrer';
      watch.textContent = '▶ Watch interview';
      actions.appendChild(watch);
    }

    if (entry.bookId && entry.bookTitle) {
      const pick = document.createElement('a');
      pick.className = 'spotlight-pick';
      pick.href = 'dashboard.html';
      pick.textContent = 'Dynasty Pick — ' + entry.bookTitle + ' (' + formatPrice(entry.bookPrice) + ')';
      actions.appendChild(pick);
    }
    // Note: bookFormat isn't returned by listSpotlight yet — the badge above
    // shows title + price only.

    if (actions.children.length) {
      body.appendChild(actions);
    }

    row.appendChild(date);
    row.appendChild(body);
    spotlightFeed.appendChild(row);
  });
}

async function loadSpotlight() {
  if (!apiConnected()) {
    spotlightFeed.innerHTML = '<p class="spotlight-empty">Backend not connected yet — paste your Apps Script URL into api.js.</p>';
    return;
  }
  try {
    const result = await callApi({ action: 'listSpotlight' });
    if (result.success) {
      renderSpotlight(result.entries);
    } else {
      setSpotlightStatus(result.message || 'Could not load this week\'s features.');
      spotlightFeed.innerHTML = '';
    }
  } catch (err) {
    setSpotlightStatus('Something went wrong: ' + err.message);
    spotlightFeed.innerHTML = '';
  }
}

loadSpotlight();
