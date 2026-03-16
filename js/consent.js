(function () {
  if (localStorage.getItem('gravant_consent')) return;

  var banner = document.getElementById('consent-banner');
  if (!banner) return;

  banner.style.display = 'flex';

  var acceptBtn = document.getElementById('consent-accept');
  var declineBtn = document.getElementById('consent-decline');

  if (acceptBtn) {
    acceptBtn.addEventListener('click', function () {
      localStorage.setItem('gravant_consent', 'accepted');
      banner.classList.add('consent-hide');
      setTimeout(function () { banner.style.display = 'none'; }, 400);
    });
  }

  if (declineBtn) {
    declineBtn.addEventListener('click', function () {
      localStorage.setItem('gravant_consent', 'declined');
      banner.classList.add('consent-hide');
      setTimeout(function () { banner.style.display = 'none'; }, 400);
    });
  }
})();
