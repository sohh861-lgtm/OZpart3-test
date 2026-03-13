document.addEventListener('DOMContentLoaded', () => {
  // Store default state
  const state = {
    onboarded: false,
    activeTab: 'splash',
    petProfile: {
      photo: '',
      name: '몽이',
      type: '강아지',
      gender: '남아',
      breed: '말티즈',
      age: 5,
      weight: 4.2
    },
    checklists: {
      joint: true,
      food: false,
      heart: false
    },
    settings: {
      checkup: true,
      reminder: true,
      notice: false
    },
    recommendTab: 'supplement',
    budget: 60,
    calendarActiveDate: 11
  };

  // DOM Elements
  const pages = document.querySelectorAll('.page');
  const navItems = document.querySelectorAll('.nav__item');
  const navBar = document.getElementById('js-nav');

  // Intro Logic Elements
  const btnObSkip = document.getElementById('js-btn-skip');
  const btnObNext = document.getElementById('js-btn-next');
  const obSlides = document.querySelectorAll('.ob-slide');
  const obDots = document.querySelectorAll('.ob-dot');
  let currentSlide = 0;

  // Wizard Logic Elements
  const wizSteps = [
    document.getElementById('wiz-step-1'),
    document.getElementById('wiz-step-2'),
    document.getElementById('wiz-step-3'),
    document.getElementById('wiz-step-4')
  ];
  const wizBar = document.getElementById('js-wiz-bar');
  const btnWizBack = document.getElementById('js-wiz-back');
  const btnWizNext = document.getElementById('js-wiz-next');
  const wizBottom = document.getElementById('js-wiz-bottom');
  let currentWizStep = 0;

  // Home
  const careItems = document.querySelectorAll('.care-item');

  // Recommend
  const recTabs = document.querySelectorAll('.tabs__item[data-rectab]');
  const budgetSliderTrack = document.getElementById('js-budget-slider');
  const budgetSliderFill = document.getElementById('js-budget-fill');
  const budgetSliderVal = document.getElementById('js-budget-val');
  const recList = document.getElementById('js-rec-list');

  // Health
  const calendarCells = document.querySelectorAll('.calendar__cell:not(.calendar__cell--dim)');

  // Settings
  const toggleRows = document.querySelectorAll('.toggle-row');

  // Multi-Screen Profile Reflecting Elements
  const avatarElements = [
    document.getElementById('js-home-avatar'),
    document.getElementById('js-rec-avatar'),
    document.getElementById('js-mypet-avatar'),
    document.getElementById('js-wiz-photo-preview')
  ];
  const nameElements = {
    home: document.getElementById('js-home-name'),
    rec: document.getElementById('js-rec-name'),
    health: document.getElementById('js-health-name'),
    mypet: document.getElementById('js-mypet-name'),
    mypetTab: document.getElementById('js-mypet-tab-name')
  };
  const profileDetails = {
    homeBreed: document.getElementById('js-home-breed'),
    homeAge: document.getElementById('js-home-age'),
    homeGender: document.getElementById('js-home-gender'),
    homeWeight: document.getElementById('js-home-weight'),
    recBreed: document.getElementById('js-rec-breed'),
    recAge: document.getElementById('js-rec-age'),
    recWeight: document.getElementById('js-rec-weight'),
    mypetBreed: document.getElementById('js-mypet-breed'),
    mypetAge: document.getElementById('js-mypet-age'),
    mypetGender: document.getElementById('js-mypet-gender'),
    mypetWeight: document.getElementById('js-mypet-weight')
  };

  // Photo & Crop Logic Elements
  const photoTrigger = document.getElementById('js-wiz-photo-trigger');
  const photoInput = document.getElementById('js-pet-photo-input');
  const cropModal = document.getElementById('js-crop-modal');
  const cropImage = document.getElementById('js-crop-image');
  const btnCropSave = document.getElementById('js-crop-save');
  const btnCropCancel = document.getElementById('js-crop-cancel');
  let cropper = null;

  // ════ STATE MANAGEMENT ════
  const loadState = () => {
    const saved = localStorage.getItem('pawcare_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(state, parsed);
      } catch(e) { }
    }
  };

  const saveState = () => {
    localStorage.setItem('pawcare_state', JSON.stringify(state));
  };

  // ════ PROFILE REFLECTION ════
  const renderPetProfile = () => {
    const p = state.petProfile;
    
    // Update Photos
    avatarElements.forEach(el => {
      if(!el) return;
      if(p.photo) {
        el.style.backgroundImage = `url(${p.photo})`;
        el.textContent = '';
      } else {
        el.style.backgroundImage = 'none';
        el.textContent = p.type === '강아지' ? '🐶' : '🐱';
      }
    });

    // Update Names
    if(nameElements.home) nameElements.home.textContent = p.name;
    if(nameElements.rec) nameElements.rec.textContent = p.name;
    if(nameElements.health) nameElements.health.textContent = p.name;
    if(nameElements.mypet) nameElements.mypet.textContent = p.name;
    if(nameElements.mypetTab) nameElements.mypetTab.textContent = (p.type === '강아지' ? '🐶 ' : '🐱 ') + p.name;

    // Update Details
    if(profileDetails.homeBreed) profileDetails.homeBreed.textContent = p.breed;
    if(profileDetails.homeAge) profileDetails.homeAge.textContent = p.age;
    if(profileDetails.homeGender) profileDetails.homeGender.textContent = (p.gender === '남아' ? '수컷' : '암컷');
    if(profileDetails.homeWeight) profileDetails.homeWeight.textContent = p.weight;

    if(profileDetails.recBreed) profileDetails.recBreed.textContent = p.breed;
    if(profileDetails.recAge) profileDetails.recAge.textContent = p.age;
    if(profileDetails.recWeight) profileDetails.recWeight.textContent = p.weight;

    if(profileDetails.mypetBreed) profileDetails.mypetBreed.textContent = p.breed;
    if(profileDetails.mypetAge) profileDetails.mypetAge.textContent = p.age;
    if(profileDetails.mypetGender) profileDetails.mypetGender.textContent = (p.gender === '남아' ? '수컷' : '암컷');
    if(profileDetails.mypetWeight) profileDetails.mypetWeight.textContent = p.weight;
  };

  // ════ PHOTO UPLOAD & CROP ════
  if(photoTrigger) {
    photoTrigger.addEventListener('click', () => photoInput.click());
  }

  if(photoInput) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        cropImage.src = event.target.result;
        cropModal.classList.remove('modal--hidden');
        
        if (cropper) cropper.destroy();
        cropper = new Cropper(cropImage, {
          aspectRatio: 1,
          viewMode: 1,
          dragMode: 'move',
          autoCropArea: 1,
          restore: false,
          guides: false,
          center: false,
          highlight: false,
          cropBoxMovable: true,
          cropBoxResizable: true,
          toggleDragModeOnDblclick: false,
        });
      };
      reader.readAsDataURL(file);
    });
  }

  if(btnCropCancel) {
    btnCropCancel.addEventListener('click', () => {
      cropModal.classList.add('modal--hidden');
      if(cropper) cropper.destroy();
      photoInput.value = '';
    });
  }

  if(btnCropSave) {
    btnCropSave.addEventListener('click', () => {
      const canvas = cropper.getCroppedCanvas({ width: 200, height: 200 });
      state.petProfile.photo = canvas.toDataURL('image/jpeg', 0.8);
      
      const preview = document.getElementById('js-wiz-photo-preview');
      if(preview) {
        preview.style.backgroundImage = `url(${state.petProfile.photo})`;
        preview.textContent = '';
      }
      
      cropModal.classList.add('modal--hidden');
      cropper.destroy();
      photoInput.value = '';
      saveState();
    });
  }


  // ════ NAVIGATION ════
  const navigateTo = (tabId) => {
    pages.forEach(page => page.classList.remove('page--active'));
    navItems.forEach(item => item.classList.remove('nav__item--active'));

    const introIds = ['splash', 'onboarding', 'login', 'wizard'];
    if (introIds.includes(tabId)) {
      if(navBar) navBar.classList.add('nav--hidden');
    } else {
      if(navBar) navBar.classList.remove('nav--hidden');
    }

    const targetPage = document.getElementById(`page-${tabId}`);
    if (targetPage) targetPage.classList.add('page--active');

    const targetNav = document.querySelector(`.nav__item[data-tab="${tabId}"]`);
    if (targetNav) targetNav.classList.add('nav__item--active');

    state.activeTab = tabId;
    saveState();
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.dataset.tab;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navigateTo(tabId);
    });
  });

  // Expose global method for inline click handlers (Login buttons)
  window.app = {
    goToWizard: () => {
      currentWizStep = 0;
      updateWizardUI();
      navigateTo('wizard');
    }
  };

  // ════ INTRO / ONBOARDING LOGIC ════
  const updateObSlide = () => {
    obSlides.forEach((slide, idx) => {
      if(idx === currentSlide) slide.classList.add('ob-slide--active');
      else slide.classList.remove('ob-slide--active');
    });
    obDots.forEach((dot, idx) => {
      if(idx === currentSlide) dot.classList.add('ob-dot--active');
      else dot.classList.remove('ob-dot--active');
    });
    if(currentSlide === obSlides.length - 1) {
      btnObNext.textContent = '시작하기';
    } else {
      btnObNext.textContent = '다음';
    }
  };

  if(btnObNext) {
    btnObNext.addEventListener('click', () => {
      if(currentSlide < obSlides.length - 1) {
        currentSlide++;
        updateObSlide();
      } else {
        navigateTo('login');
      }
    });
  }

  if(btnObSkip) {
    btnObSkip.addEventListener('click', () => {
      navigateTo('login');
    });
  }

  // ════ WIZARD LOGIC ════
  const updateWizardUI = () => {
    // 0~3 index = 25% ~ 100%
    wizBar.style.width = `${(currentWizStep + 1) * 25}%`;

    wizSteps.forEach((step, idx) => {
      if (!step) return;
      if (idx === currentWizStep) step.classList.remove('hidden');
      else step.classList.add('hidden');
    });

    if (currentWizStep === wizSteps.length - 1) {
      // Step 4 Loading
      wizBottom.style.display = 'none';
      if(btnWizBack) btnWizBack.style.display = 'none';

      // Capture all wizard data
      state.petProfile.name = document.getElementById('wiz-pet-name').value || '몽이';
      state.petProfile.breed = document.getElementById('wiz-pet-breed').value || '말티즈';
      state.petProfile.age = document.getElementById('wiz-pet-age').value || 5;
      state.petProfile.weight = document.getElementById('wiz-pet-weight').value || 4.2;
      
      const activeType = document.querySelector('#wiz-pet-type .wiz-tab--active');
      if(activeType) state.petProfile.type = activeType.dataset.value;
      
      const activeGender = document.querySelector('#wiz-pet-gender .wiz-tab--active');
      if(activeGender) state.petProfile.gender = activeGender.dataset.value;

      // Fake completion
      setTimeout(() => {
        state.onboarded = true;
        renderPetProfile();
        navigateTo('home');
      }, 2500);
    } else {
      wizBottom.style.display = 'block';
      if(btnWizBack) btnWizBack.style.display = 'block';
      if (currentWizStep === wizSteps.length - 2) {
        btnWizNext.textContent = '완료';
      } else {
        btnWizNext.textContent = '다음';
      }
    }
  };

  if(btnWizNext) {
    btnWizNext.addEventListener('click', () => {
      if (currentWizStep < wizSteps.length - 1) {
        currentWizStep++;
        updateWizardUI();
      }
    });
  }

  if(btnWizBack) {
    btnWizBack.addEventListener('click', () => {
      if (currentWizStep > 0) {
        currentWizStep--;
        updateWizardUI();
      } else {
        navigateTo('login'); // go back to login step
      }
    });
  }

  // Simple tabs inside wizard (toggle logic)
  document.querySelectorAll('.wiz-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const group = e.target.parentElement;
      group.querySelectorAll('.wiz-tab').forEach(t => t.classList.remove('wiz-tab--active'));
      e.target.classList.add('wiz-tab--active');
    });
  });

  // Multiple Chip toggle logic
  document.querySelectorAll('.wiz-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.classList.toggle('wiz-chip--active');
    });
  });

  // Selection toggle logic
  document.querySelectorAll('.wiz-sel-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const group = e.currentTarget.parentElement;
      group.querySelectorAll('.wiz-sel-btn').forEach(t => t.classList.remove('wiz-sel-btn--active'));
      e.currentTarget.classList.add('wiz-sel-btn--active');
    });
  });


  // ════ HOME LOGIC ════
  const renderChecklist = () => {
    careItems.forEach(item => {
      const id = item.dataset.id;
      if (state.checklists[id]) {
        item.classList.add('care-item--done');
      } else {
        item.classList.remove('care-item--done');
      }
    });
  };

  careItems.forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      state.checklists[id] = !state.checklists[id];
      renderChecklist();
      saveState();
    });
  });


  // ════ RECOMMEND LOGIC ════
  const supplementData = [
    { cat: '관절 · 연골', title: '관절 프로 플러스', brand: 'PetLab', match: '98%', desc: '5세 소형견에게 권장되는 글루코사민·콘드로이틴 함유. 몽이의 관절 관리 우선순위 #1에 최적화된 제품입니다.', icon: '🦴' },
    { cat: '심장 · 순환', title: '오메가3 하트케어', brand: 'NutriPet', match: '91%', desc: '말티즈 품종 특성상 심장 관리가 중요합니다. DHA·EPA 성분이 심혈관 건강을 지원합니다.', icon: '🫀' },
    { cat: '구강 · 치아', title: '덴탈케어 츄잉', brand: 'DogHealth', match: '85%', desc: '치석 예방 및 구강 항균 성분 포함. 관리 우선순위 #2 치아 위생에 대응합니다.', warn: '⚠️ 닭고기 성분 포함 — 알레르기 주의', icon: '🦷' }
  ];

  const foodData = [
    { cat: '저지방 · 체중 관리', title: '라이트 핏 사료', brand: 'DietPet', match: '95%', desc: '현재 활동량이 낮으므로 체중 유지를 위해 저칼로리 사료를 추천합니다.', icon: '🍚' },
    { cat: '소화 · 장 건강', title: '센서티브 위장케어', brand: 'GutHealth', match: '88%', desc: '소화가 잘되는 가수분해 연어 단백질을 사용하여 알러지 걱정이 없습니다.', icon: '🐟' }
  ];

  const renderRecList = () => {
    const data = state.recommendTab === 'supplement' ? supplementData : foodData;
    if(!recList) return;
    recList.innerHTML = data.map(item => `
      <article class="item-card">
        <div class="item-card__top">
          <div class="item-card__img">${item.icon}</div>
          <div class="item-card__info">
            <span class="item-card__tag">${item.cat}</span>
            <h3 class="item-card__title">${item.title}</h3>
            <p class="item-card__sub">${item.brand}</p>
          </div>
          <span class="item-card__match">${item.match} 적합</span>
        </div>
        <p class="item-card__desc"><strong>추천 이유:</strong> ${item.desc}</p>
        ${item.warn ? `<div class="item-card__warn">${item.warn}</div>` : ''}
      </article>
    `).join('');
  };

  const renderRecTabs = () => {
    recTabs.forEach(tab => {
      if (tab.dataset.rectab === state.recommendTab) {
        tab.classList.add('tabs__item--active');
      } else {
        tab.classList.remove('tabs__item--active');
      }
    });
  };

  recTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      state.recommendTab = tab.dataset.rectab;
      renderRecTabs();
      renderRecList();
      saveState();
    });
  });

  if (budgetSliderTrack) {
    const updateBudget = (e) => {
      const rect = budgetSliderTrack.getBoundingClientRect();
      let pos = (e.clientX - rect.left) / rect.width;
      pos = Math.max(0, Math.min(1, pos));
      state.budget = pos * 100;
      
      const price = Math.round(pos * 10 + 2); // 2만원 ~ 12만원 scale
      budgetSliderFill.style.width = `${state.budget}%`;
      budgetSliderVal.textContent = `~${price}만원`;
      saveState();
    };

    let isDragging = false;
    budgetSliderTrack.addEventListener('mousedown', (e) => {
      isDragging = true; updateBudget(e);
    });
    window.addEventListener('mousemove', (e) => {
      if (isDragging) updateBudget(e);
    });
    window.addEventListener('mouseup', () => isDragging = false);
    
    // touch support
    budgetSliderTrack.addEventListener('touchstart', (e) => {
      isDragging = true; updateBudget(e.touches[0]);
    });
    window.addEventListener('touchmove', (e) => {
      if (isDragging) updateBudget(e.touches[0]);
    });
    window.addEventListener('touchend', () => isDragging = false);
  }

  // ════ HEALTH CALENDAR LOGIC ════
  const renderCalendar = () => {
    calendarCells.forEach(cell => {
      const day = parseInt(cell.textContent, 10);
      cell.classList.remove('calendar__cell--today');
      if (day === state.calendarActiveDate) {
        cell.classList.add('calendar__cell--today');
      }
    });
  };

  calendarCells.forEach(cell => {
    cell.addEventListener('click', () => {
      state.calendarActiveDate = parseInt(cell.textContent, 10);
      renderCalendar();
      saveState();
    });
  });


  // ════ SETTINGS LOGIC ════
  const renderSettings = () => {
    toggleRows.forEach(row => {
      const key = row.dataset.key;
      const toggle = row.querySelector('.toggle');
      if (state.settings[key]) {
        toggle.classList.add('toggle--on');
        toggle.classList.remove('toggle--off');
      } else {
        toggle.classList.add('toggle--off');
        toggle.classList.remove('toggle--on');
      }
    });
  };

  toggleRows.forEach(row => {
    row.addEventListener('click', () => {
      const key = row.dataset.key;
      state.settings[key] = !state.settings[key];
      renderSettings();
      saveState();
    });
  });


  // ════ INITIALIZATION ════
  const init = () => {
    loadState();
    
    if (!state.onboarded) {
      // First boot flow
      navigateTo('splash');
      setTimeout(() => {
        if(state.activeTab === 'splash') navigateTo('onboarding');
      }, 2500);
    } else {
      // Returning user flow
      const validTabs = ['home', 'recommend', 'health', 'mypet', 'settings'];
      const initialTab = validTabs.includes(state.activeTab) ? state.activeTab : 'home';
      navigateTo(initialTab);
    }
    
    // Initial renders
    renderPetProfile();
    updateObSlide();
    renderChecklist();
    renderRecTabs();
    renderRecList();
    renderCalendar();
    renderSettings();
    if(budgetSliderFill) budgetSliderFill.style.width = `${state.budget}%`;
  };

  init();
});
