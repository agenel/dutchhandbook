document.addEventListener('DOMContentLoaded', () => {
  const fcToggleBtn = document.getElementById('fc-toggle');
  
  // Check localStorage for preferred mode
  const flashcardActive = localStorage.getItem('dgh_flashcard_mode') === 'true';
  
  if (flashcardActive) {
    document.body.classList.add('flashcard-mode');
    if(fcToggleBtn) fcToggleBtn.classList.add('active');
  }
  
  const darkBtn = document.getElementById('dark-toggle');
  const isDark = localStorage.getItem('dgh_dark_mode') === 'true';
  
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (darkBtn) darkBtn.querySelector('.material-icons').textContent = 'light_mode';
  }

  if (darkBtn) {
    darkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isCurrentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isCurrentlyDark) {
        document.documentElement.removeAttribute('data-theme');
        darkBtn.querySelector('.material-icons').textContent = 'dark_mode';
        localStorage.setItem('dgh_dark_mode', false);
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkBtn.querySelector('.material-icons').textContent = 'light_mode';
        localStorage.setItem('dgh_dark_mode', true);
      }
    });
  }
  if (fcToggleBtn) {
    fcToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.toggle('flashcard-mode');
      fcToggleBtn.classList.toggle('active');
      
      // Save state
      const isActive = document.body.classList.contains('flashcard-mode');
      localStorage.setItem('dgh_flashcard_mode', isActive);
    });
  }
});
