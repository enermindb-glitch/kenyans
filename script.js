// ⚠️ PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE (ends in /exec)
const API_URL = "https://script.google.com/macros/s/AKfycbzaFfB5BZKQeo8SJNh3Lm6fHea26nJuXrR5jtVx1I_cyx41EipjeklGjwRVHV7bdq9Vzw/exec";

const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const formStatus = document.getElementById('formStatus');

const cardName = document.getElementById('cardName');
const cardDots = document.getElementById('cardDots');
const cardId = document.getElementById('cardId');

function setStatus(message, kind) {
  formStatus.textContent = message || '';
  formStatus.className = 'form-status' + (kind === 'success' ? ' success' : '');
}

function switchTab(target) {
  const isLogin = target === 'login';
  tabLogin.setAttribute('aria-selected', String(isLogin));
  tabRegister.setAttribute('aria-selected', String(!isLogin));
  loginForm.hidden = !isLogin;
  registerForm.hidden = isLogin;
  setStatus('');
  updateCardFromActiveForm();
}

tabLogin.addEventListener('click', () => switchTab('login'));
tabRegister.addEventListener('click', () => switchTab('register'));

// ---- Live membership card preview (signature element) ----

function updateCardFromActiveForm() {
  const isRegister = !registerForm.hidden;
  const emailInput = isRegister ? document.getElementById('registerEmail') : document.getElementById('loginEmail');
  const passwordInput = isRegister ? document.getElementById('registerPassword') : document.getElementById('loginPassword');

  const email = emailInput.value.trim();
  const namePart = email.includes('@') ? email.split('@')[0] : email;
  cardName.textContent = namePart ? namePart.replace(/[._]/g, ' ') : '—';

  const dots = passwordInput.value.length
    ? '•'.repeat(Math.min(passwordInput.value.length, 10))
    : '••••••';
  cardDots.textContent = dots;

  cardId.textContent = 'MEM-????';
  cardId.classList.remove('revealed');
}

['registerEmail', 'registerPassword', 'loginEmail', 'loginPassword'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', updateCardFromActiveForm);
});

function revealMemberId(memberId) {
  cardId.textContent = memberId;
  cardId.classList.add('revealed');
}

// ---- API calls ----

async function callApi(action, email, password) {
  const response = await fetch(API_URL, {
    method: 'POST',
    // Plain text body avoids a CORS preflight against Apps Script.
    body: JSON.stringify({ action, email, password }),
  });
  if (!response.ok) {
    throw new Error('Network error (' + response.status + ')');
  }
  return response.json();
}

function guardApiUrl() {
  if (!API_URL || API_URL.startsWith('PASTE_')) {
    setStatus('Backend not connected yet — paste your Apps Script URL into script.js.');
    return false;
  }
  return true;
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!guardApiUrl()) return;

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const submitBtn = document.getElementById('loginSubmit');

  setStatus('Signing in…');
  submitBtn.disabled = true;
  try {
    const result = await callApi('login', email, password);
    if (result.success) {
      revealMemberId(result.memberId);
      setStatus(result.message, 'success');
      localStorage.setItem('clubhouse_session', JSON.stringify({ email, memberId: result.memberId }));
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 600);
    } else {
      setStatus(result.message);
    }
  } catch (err) {
    setStatus('Something went wrong: ' + err.message);
  } finally {
    submitBtn.disabled = false;
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!guardApiUrl()) return;

  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const submitBtn = document.getElementById('registerSubmit');

  setStatus('Creating your account…');
  submitBtn.disabled = true;
  try {
    const result = await callApi('register', email, password);
    if (result.success) {
      revealMemberId(result.memberId);
      setStatus(result.message, 'success');
      localStorage.setItem('clubhouse_session', JSON.stringify({ email, memberId: result.memberId }));
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 900);
    } else {
      setStatus(result.message);
    }
  } catch (err) {
    setStatus('Something went wrong: ' + err.message);
  } finally {
    submitBtn.disabled = false;
  }
});

updateCardFromActiveForm();
