let currentStep = 1;
 
// ── Helpers ──────────────────────────────────────────────
 
function showBanner(msg, type) {
  const b = document.getElementById('banner');
  b.textContent = msg;
  b.className = 'banner ' + type;
  setTimeout(() => { b.className = 'banner'; }, 4000);
}
 
function clearErrors() {
  document.querySelectorAll('.field-error').forEach(e => e.classList.remove('visible'));
  document.querySelectorAll('input').forEach(i => i.classList.remove('error'));
}
 
function showError(inputId, errId) {
  document.getElementById(inputId).classList.add('error');
  document.getElementById(errId).classList.add('visible');
}
 
// ── Password strength ─────────────────────────────────────
 
function checkStrength() {
  const pw = document.getElementById('password').value;
  const fill = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) score++;
  if (pw.length >= 12) score++;
 
  const levels = [
    { w: '0%',   bg: '#e0d9f5', lbl: '' },
    { w: '33%',  bg: '#e05c5c', lbl: 'Weak' },
    { w: '55%',  bg: '#f5a623', lbl: 'Fair' },
    { w: '78%',  bg: '#4caf7d', lbl: 'Good' },
    { w: '100%', bg: '#2e9c5a', lbl: 'Strong' },
  ];
  const l = levels[score] || levels[0];
  fill.style.width = l.w;
  fill.style.background = l.bg;
  label.textContent = l.lbl;
  label.style.color = l.bg;
}
 
// ── Step navigation ───────────────────────────────────────
 
function setStep(n) {
  currentStep = n;
  [1, 2, 3].forEach(function(i) {
    document.getElementById('step' + i).classList.toggle('active', i === n);
    var el = document.getElementById('s' + i);
    el.className = 'step ' + (i < n ? 'done' : i === n ? 'active' : 'upcoming');
  });
  var titles = ['Sign Up', 'Choose Username', 'Review & Confirm'];
  document.getElementById('formTitle').textContent = titles[n - 1];
  document.getElementById('backBtn').style.visibility = n === 1 ? 'hidden' : 'visible';
}
 
function goStep2() {
  clearErrors();
  var ok = true;
 
  var fn = document.getElementById('firstName').value.trim();
  var ln = document.getElementById('lastName').value.trim();
  var pw = document.getElementById('password').value;
  var vp = document.getElementById('verifyPassword').value;
 
  if (!fn) { showError('firstName', 'firstNameErr'); ok = false; }
  if (!ln) { showError('lastName',  'lastNameErr');  ok = false; }
 
  var pwOk = pw.length >= 8
    && /[0-9]/.test(pw)
    && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw);
  if (!pwOk) { showError('password', 'passwordErr'); ok = false; }
  if (pw !== vp) { showError('verifyPassword', 'verifyErr'); ok = false; }
 
  if (!ok) return;
  setStep(2);
}
 
function goStep3() {
  clearErrors();
  var un = document.getElementById('username').value.trim();
  if (un.length < 3 || un.length > 30) {
    showError('username', 'usernameErr'); return;
  }
  var fn = document.getElementById('firstName').value.trim();
  var ln = document.getElementById('lastName').value.trim();
  document.getElementById('reviewBox').innerHTML =
    '<strong>Name:</strong> ' + fn + ' ' + ln + '<br>' +
    '<strong>Username:</strong> ' + un + '<br>' +
    '<strong>Password:</strong> ' + '•'.repeat(8);
  setStep(3);
}
 
function goBack() {
  if (currentStep > 1) setStep(currentStep - 1);
}
 
// ── Submit ────────────────────────────────────────────────
 
async function submitForm() {
  var btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Creating account…';
 
  var username = document.getElementById('username').value.trim();
  var password = document.getElementById('password').value;
 
  try {
    var csrfRes   = await fetch('/get-csrf-token', { credentials: 'include' });
    var csrfData  = await csrfRes.json();
    var csrfToken = csrfData.csrfToken;
 
    var res = await fetch('/register', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken,
      },
      body: JSON.stringify({ username: username, password: password }),
    });
 
    var data = await res.json();
 
    if (!res.ok) {
      showBanner(data.error || 'Registration failed.', 'error');
      btn.disabled = false;
      btn.textContent = 'Create Account';
      return;
    }
 
    showBanner('Account created! Redirecting to login…', 'success');
    setTimeout(function() { window.location.href = 'login.html'; }, 1500);
 
  } catch (err) {
    showBanner('Network error. Please try again.', 'error');
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}
 
// ── Wire up all events on DOM ready ──────────────────────
 
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('backBtn').style.visibility = 'hidden';
  document.getElementById('password').addEventListener('input', checkStrength);
  document.getElementById('btnStep1').addEventListener('click', goStep2);
  document.getElementById('btnStep2').addEventListener('click', goStep3);
  document.getElementById('submitBtn').addEventListener('click', submitForm);
  document.getElementById('backBtn').addEventListener('click', goBack);
});
 