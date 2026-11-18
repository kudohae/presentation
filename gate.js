// Simple password screen for the whole site. Not real security: the PIN is right here in the source,
// and files can still be opened by their direct address. It only keeps casual visitors out.
// Include in <head> of every page:  <script src="gate.js"></script>  (from a presentation: ../gate.js)
(function () {
  var KEY = 'pres-pass', PIN = '0916';
  function passed() { try { return localStorage.getItem(KEY) === PIN; } catch (e) { return false; } }
  if (passed()) return;

  var hide = document.createElement('style');
  hide.textContent =
    'body>*:not(#gate){visibility:hidden!important}' +
    '#gate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;' +
    'background:#fff;color:#1b1b1f;font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI","Apple SD Gothic Neo","Malgun Gothic",Roboto,sans-serif;cursor:auto;user-select:auto}' +
    '#gate form{display:flex;flex-direction:column;align-items:center;gap:14px}' +
    '#gate label{font-size:15px;color:#6b6b73}' +
    '#gate input{width:200px;font-size:34px;letter-spacing:.5em;text-indent:.5em;text-align:center;padding:6px 0;border:0;border-bottom:2px solid #1b1b1f;background:transparent;color:inherit;outline:none}' +
    '#gate .err{min-height:1.5em;margin:0;font-size:14px;color:#c62828}' +
    '@media (prefers-color-scheme:dark){#gate{background:#121214;color:#ececf0}#gate label{color:#9a9aa3}#gate input{border-color:#ececf0}}';
  document.head.appendChild(hide);

  function show() {
    var g = document.createElement('div');
    g.id = 'gate';
    g.innerHTML = '<form autocomplete="off"><label for="gate-pin">비밀번호</label>' +
      '<input id="gate-pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autofocus>' +
      '<p class="err"></p></form>';
    document.body.appendChild(g);
    var input = g.querySelector('input'), err = g.querySelector('.err');
    // keep keys and clicks away from the page underneath (a presentation would change slides)
    ['keydown', 'keyup', 'click', 'contextmenu', 'mousedown'].forEach(function (t) {
      g.addEventListener(t, function (e) { e.stopPropagation(); });
    });
    function check() {
      if (input.value === PIN) {
        try { localStorage.setItem(KEY, PIN); } catch (e) {}
        g.remove(); hide.remove();
      } else if (input.value.length >= 4) {
        err.textContent = '비밀번호가 달라요';
        if (g.animate) input.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }], { duration: 260 });
        input.value = '';
      }
    }
    input.addEventListener('input', function () { err.textContent = ''; if (input.value.length >= 4) check(); });
    g.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    input.focus();
  }
  if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
})();
