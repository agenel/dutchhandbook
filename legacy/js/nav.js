(function () {
  // Dropdown toggle
  document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
    var toggle = dropdown.querySelector('.nav-dropdown-toggle');
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
      d.classList.remove('open');
    });
  });

  // Mobile menu
  var hamburger = document.getElementById('hub-hamburger');
  var mobileMenu = document.getElementById('hub-mobile-menu');
  var mobileClose = document.getElementById('hub-mobile-close');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
    if (mobileClose) {
      mobileClose.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    }
    mobileMenu.addEventListener('click', function (e) {
      if (e.target === mobileMenu) {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
})();
