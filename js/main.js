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
  
  // --- MASTERY TRACKING ---
  const masteryToggle = document.querySelector('.mastery-toggle');
  if (masteryToggle) {
    const sheetId = masteryToggle.getAttribute('data-sheet');
    const isMastered = localStorage.getItem(`dgh_mastered_${sheetId}`) === 'true';

    function runMasteryVisuals(mastered) {
      if (mastered) {
        masteryToggle.classList.add('mastered');
        masteryToggle.innerHTML = `Mastered <span class="material-icons">check_circle</span>`;
      } else {
        masteryToggle.classList.remove('mastered');
        masteryToggle.innerHTML = `Mark as Mastered <span class="material-icons">check_circle_outline</span>`;
      }
    }
    
    runMasteryVisuals(isMastered);

    masteryToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const currentlyMastered = localStorage.getItem(`dgh_mastered_${sheetId}`) === 'true';
      if (currentlyMastered) {
        localStorage.removeItem(`dgh_mastered_${sheetId}`);
        runMasteryVisuals(false);
      } else {
        localStorage.setItem(`dgh_mastered_${sheetId}`, 'true');
        runMasteryVisuals(true);
      }
    });
  }

  // --- HOME PAGE LOGIC (Index) ---
  const indexCards = document.querySelectorAll('.sheet-card');
  if (indexCards.length > 0) {
    let masteredCount = 0;
    
    indexCards.forEach(card => {
      const href = card.getAttribute('href');
      const sheetId = href.split('/').pop().replace('.html', '');
      
      if (localStorage.getItem(`dgh_mastered_${sheetId}`) === 'true') {
        card.classList.add('mastered-card');
        masteredCount++;
      }
    });

    const progBarFill = document.querySelector('.progress-fill');
    const progText = document.querySelector('.progress-text');
    if (progBarFill && progText) {
      const pct = (masteredCount / indexCards.length) * 100;
      progBarFill.style.width = `${pct}%`;
      progText.innerHTML = `<strong>${masteredCount}/${indexCards.length}</strong> Modules Mastered`;
      if (masteredCount === indexCards.length) {
          progBarFill.style.background = 'var(--gold)';
      }
    }

    // --- SEARCH/FILTER LOGIC ---
    const searchInput = document.getElementById('search-hub');
    const toggleMasteredBtn = document.getElementById('toggle-mastered');
    let hideMastered = localStorage.getItem('dgh_hide_mastered') === 'true';

    function runFilters() {
      const query = searchInput ? searchInput.value.toLowerCase() : '';
      
      indexCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const isMastered = card.classList.contains('mastered-card');
        
        const matchesSearch = text.includes(query);
        const matchesMasterState = !hideMastered || !isMastered;
        
        if (matchesSearch && matchesMasterState) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });

      if (toggleMasteredBtn) {
        const icon = toggleMasteredBtn.querySelector('.material-icons');
        if (hideMastered) {
          icon.textContent = 'visibility_off';
          icon.style.color = 'var(--orange)';
        } else {
          icon.textContent = 'visibility';
          icon.style.color = '';
        }
      }
    }

    if (toggleMasteredBtn) {
      toggleMasteredBtn.addEventListener('click', () => {
        hideMastered = !hideMastered;
        localStorage.setItem('dgh_hide_mastered', hideMastered.toString());
        runFilters();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', runFilters);
    }
    
    // Initial run
    runFilters();
  }
});
