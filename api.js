// ⚠️ PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE (ends in /exec)
// This single URL is shared by index.html (login/register/search) and
// dashboard.html (Owls Dynasty book orders) — update it in one place.
const API_URL = "https://script.google.com/macros/s/AKfycbzsUldk0GPw5ZoywlMMLzwgq54_ihVxF4D8R4JRUeowD3TEpV1-ieFy28ZBU1DzMI4M/exec";

async function callApi(payload) {
  const response = await fetch(API_URL, {
    method: 'POST',
    // Plain text body avoids a CORS preflight against Apps Script.
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Network error (' + response.status + ')');
  }
  return response.json();
}

function apiConnected() {
  return Boolean(API_URL) && !API_URL.startsWith('PASTE_');
}
