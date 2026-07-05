// API_URL and callApi() live in api.js (included before this file).

const session = JSON.parse(localStorage.getItem('nightowls_session') || 'null');

if (!session) {
  window.location.href = 'index.html';
}

const cardName = document.getElementById('cardName');
const cardId = document.getElementById('cardId');
const welcomeText = document.getElementById('welcomeText');
const dynastyStatus = document.getElementById('dynastyStatus');
const bookGrid = document.getElementById('bookGrid');
const categoryTabs = document.getElementById('categoryTabs');

let allBooks = [];
let activeCategory = 'All';

function initHeader() {
  const namePart = session.email.includes('@') ? session.email.split('@')[0] : session.email;
  cardName.textContent = namePart.replace(/[._]/g, ' ');
  cardId.textContent = session.memberId || 'MEM-????';
  welcomeText.textContent = session.email + ' — membership ' + (session.memberId || '');
}

document.getElementById('signOutBtn').addEventListener('click', () => {
  localStorage.removeItem('nightowls_session');
  window.location.href = 'index.html';
});

function setDynastyStatus(message, kind) {
  dynastyStatus.textContent = message || '';
  dynastyStatus.className = 'dynasty-status' + (kind === 'success' ? ' success' : '');
}

function formatPrice(price) {
  const n = Number(price);
  return 'KES ' + (isNaN(n) ? price : n.toLocaleString());
}

function formatIcon(format) {
  return String(format || '').toLowerCase() === 'audio' ? '🎧' : '📖';
}

function renderCategoryTabs(books) {
  const categories = ['All', ...new Set(books.map((b) => b.category).filter(Boolean))];
  categoryTabs.innerHTML = '';
  categories.forEach((category) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'category-tab';
    btn.textContent = category;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(category === activeCategory));
    btn.addEventListener('click', () => {
      activeCategory = category;
      renderCategoryTabs(books);
      renderBooks(filterBooks(books));
    });
    categoryTabs.appendChild(btn);
  });
}

function filterBooks(books) {
  if (activeCategory === 'All') return books;
  return books.filter((b) => b.category === activeCategory);
}

function renderBooks(books) {
  bookGrid.innerHTML = '';
  if (!books.length) {
    bookGrid.innerHTML = '<p class="book-empty">No titles in this category yet — add some to the "Owls Dynasty" sheet.</p>';
    return;
  }
  books.forEach((book) => {
    const card = document.createElement('article');
    card.className = 'book-card';

    const topRow = document.createElement('div');
    topRow.className = 'book-top-row';

    const formatBadge = document.createElement('span');
    formatBadge.className = 'format-badge';
    formatBadge.textContent = formatIcon(book.format) + ' ' + (book.format || 'Book');

    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'category-badge';
    categoryBadge.textContent = book.category || '';

    topRow.appendChild(formatBadge);
    if (book.category) topRow.appendChild(categoryBadge);

    const title = document.createElement('h3');
    title.className = 'book-title';
    title.textContent = book.title;

    const author = document.createElement('p');
    author.className = 'book-author';
    author.textContent = book.author;

    const desc = document.createElement('p');
    desc.className = 'book-desc';
    desc.textContent = book.description || '';

    const footer = document.createElement('div');
    footer.className = 'book-footer';

    const price = document.createElement('span');
    price.className = 'book-price';
    price.textContent = formatPrice(book.price);

    const button = document.createElement('button');
    button.className = 'btn-order';
    button.textContent = 'Order this ' + (String(book.format).toLowerCase() === 'audio' ? 'audio' : 'book');
    button.addEventListener('click', () => orderBook(book.id, button));

    footer.appendChild(price);
    footer.appendChild(button);

    card.appendChild(topRow);
    card.appendChild(title);
    card.appendChild(author);
    if (book.description) card.appendChild(desc);
    card.appendChild(footer);

    bookGrid.appendChild(card);
  });
}

async function loadBooks() {
  if (!apiConnected()) {
    bookGrid.innerHTML = '<p class="book-empty">Backend not connected yet — paste your Apps Script URL into api.js.</p>';
    return;
  }
  try {
    const result = await callApi({ action: 'listBooks' });
    if (result.success) {
      allBooks = result.books;
      renderCategoryTabs(allBooks);
      renderBooks(filterBooks(allBooks));
    } else {
      bookGrid.innerHTML = '<p class="book-empty">' + (result.message || 'Could not load the catalog.') + '</p>';
    }
  } catch (err) {
    bookGrid.innerHTML = '<p class="book-empty">Something went wrong: ' + err.message + '</p>';
  }
}

async function orderBook(bookId, button) {
  button.disabled = true;
  const originalLabel = button.textContent;
  button.textContent = 'Placing order…';
  setDynastyStatus('');
  try {
    const result = await callApi({
      action: 'placeOrder',
      memberId: session.memberId,
      email: session.email,
      bookId: bookId,
    });
    if (result.success) {
      setDynastyStatus(result.message + ' (Order ' + result.orderId + ')', 'success');
      button.textContent = 'Order placed';
    } else {
      setDynastyStatus(result.message);
      button.textContent = originalLabel;
      button.disabled = false;
    }
  } catch (err) {
    setDynastyStatus('Something went wrong: ' + err.message);
    button.textContent = originalLabel;
    button.disabled = false;
  }
}

if (session) {
  initHeader();
  loadBooks();
}
