var navToggle = document.getElementById('nav-toggle');
var navLinks = document.getElementById('nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
    document.body.classList.toggle('menu-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
    });
  });
}

var navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

var fadeElements = document.querySelectorAll('.fade-in');

var observer = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

fadeElements.forEach(function (el) {
  observer.observe(el);
});

var form = document.getElementById('contact-form');
var formMessage = document.getElementById('form-message');
var submitBtn = form ? form.querySelector('button[type="submit"]') : null;

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = form.querySelector('#name').value.trim();
    var email = form.querySelector('#email').value.trim();
    var company = form.querySelector('#company').value.trim();
    var service = form.querySelector('#service').value;
    var budget = form.querySelector('#budget').value;
    var message = form.querySelector('#message').value.trim();

    if (!name || !email || !service || !message) {
      showMessage('Please fill in all required fields.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showMessage('Please enter a valid email address.', 'error');
      return;
    }

    var honeypot = form.querySelector('#botcheck');
    if (honeypot && honeypot.value) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    var data = {
      access_key: '6a45f9d3-5aaf-4790-8f89-8f71f4046d0f',
      name: name,
      email: email,
      company: company,
      service: service,
      budget: budget || 'Not specified',
      message: message,
      subject: 'New inquiry: ' + service + ' — gravantlabs.com',
      from_name: 'Gravant Labs Website',
      botcheck: ''
    };

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(function (res) {
        if (res.ok) return res.json();
        throw new Error('Request failed');
      })
      .then(function () {
        showMessage('Thank you! We\'ll get back to you shortly.', 'success');
        form.reset();
      })
      .catch(function () {
        var subject = encodeURIComponent('Inquiry: ' + service + ' — ' + name);
        var body = encodeURIComponent(
          'Name: ' + name + '\nEmail: ' + email + '\nCompany: ' + company + '\nService: ' + service + '\nBudget: ' + (budget || 'Not specified') + '\n\n' + message
        );
        window.location.href = 'mailto:info@gravantlabs.com?subject=' + subject + '&body=' + body;
        showMessage('Opening your email client as a fallback. You can also email us directly at info@gravantlabs.com.', 'success');
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      });
  });
}

function showMessage(text, type) {
  if (!formMessage) return;
  formMessage.textContent = text;
  formMessage.className = 'form-message ' + type;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
