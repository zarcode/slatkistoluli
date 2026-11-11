// Contact form -> Web3Forms (no PHP needed). Applies to every form.contact-form-js
(function () {
  var ACCESS_KEY = '4d153229-7b9a-450d-9bfa-3fb3294c723f';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function show(result, type, html) {
    result.className = 'result sc_infobox sc_infobox_style_' + type;
    result.innerHTML = html;
    result.style.display = 'block';
  }

  // Capture phase: stops the theme's own (PHP based) submit handler from running too
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.classList || !form.classList.contains('contact-form-js')) return;
    e.preventDefault();
    e.stopPropagation();

    var result = form.querySelector('.result');
    var field = function (n) { return form.querySelector('[name="' + n + '"]'); };
    var name = field('username').value.trim();
    var email = field('email').value.trim();
    var message = field('message').value.trim();
    var errors = [];

    [].forEach.call(form.querySelectorAll('input, textarea'), function (el) {
      el.classList.remove('error_fields_class');
    });
    if (!name) { errors.push('Ime je obavezno'); field('username').classList.add('error_fields_class'); }
    if (!email) { errors.push('E-mail je obavezan'); field('email').classList.add('error_fields_class'); }
    else if (!EMAIL_RE.test(email)) { errors.push('E-mail adresa nije validna'); field('email').classList.add('error_fields_class'); }
    if (!message) { errors.push('Poruka je obavezna'); field('message').classList.add('error_fields_class'); }
    if (errors.length) { show(result, 'error', errors.join('<br>')); return; }

    var button = form.querySelector('button');
    if (button) button.disabled = true;
    show(result, 'success', 'Šalje se...');

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: form.getAttribute('data-subject') || 'Poruka sa sajta',
        from_name: name,
        name: name,
        email: email,
        message: message
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.success) throw new Error(data.message || 'Greška pri slanju');
        show(result, 'success', 'Hvala! Vaša poruka je uspešno poslata. Kontaktiraćemo vas uskoro.');
        form.reset();
      })
      .catch(function (err) {
        show(result, 'error', 'Greška pri slanju poruke. Molimo pokušajte ponovo ili nas kontaktirajte direktno.');
        console.error('Form submission error:', err);
      })
      .then(function () { if (button) button.disabled = false; });
  }, true);
})();
