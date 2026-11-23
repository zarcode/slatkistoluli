// Contact form -> Web3Forms (no PHP needed). Applies to every form.contact-form-js
(function () {
  var ACCESS_KEY = '04440260-606a-4945-b3bd-0cb89a5126e7';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^\+?[\d\s\/().-]{6,}$/;

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
    var phoneField = field('phone');
    var phone = phoneField ? phoneField.value.trim() : '';
    var locationField = field('location');
    var location = locationField ? locationField.value.trim() : '';
    var dateField = field('event_date');
    var eventDate = dateField ? dateField.value.trim() : '';
    var message = field('message').value.trim();
    var errors = [];

    [].forEach.call(form.querySelectorAll('input, textarea'), function (el) {
      el.classList.remove('error_fields_class');
    });
    if (!name) { errors.push('Ime je obavezno'); field('username').classList.add('error_fields_class'); }
    if (!email) { errors.push('E-mail je obavezan'); field('email').classList.add('error_fields_class'); }
    else if (!EMAIL_RE.test(email)) { errors.push('E-mail adresa nije validna'); field('email').classList.add('error_fields_class'); }
    if (phoneField) {
      if (!phone) { errors.push('Broj telefona je obavezan'); phoneField.classList.add('error_fields_class'); }
      else if (!PHONE_RE.test(phone)) { errors.push('Broj telefona nije validan'); phoneField.classList.add('error_fields_class'); }
    }
    if (locationField && !location) { errors.push('Mesto održavanja je obavezno'); locationField.classList.add('error_fields_class'); }
    if (dateField && !eventDate) { errors.push('Datum proslave je obavezan'); dateField.classList.add('error_fields_class'); }
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
        phone: phone,
        mesto_odrzavanja: location,
        datum_proslave: eventDate,
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
