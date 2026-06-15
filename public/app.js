// ================= DOM Elements =================
// Views
const viewWelcome = document.getElementById('view-welcome');
const viewMain = document.getElementById('view-main');
const viewDashboard = document.getElementById('view-dashboard');
const viewQuiz = document.getElementById('view-quiz');

// Inputs & Buttons View A
const usernameInput = document.getElementById('username-input');
const btnStart = document.getElementById('btn-start');

// Theme Elements
const appBody = document.getElementById('app-body');
const ambientLayer = document.getElementById('ambient-layer');
const blob1 = document.getElementById('blob-1');
const blob2 = document.getElementById('blob-2');
const blob3 = document.getElementById('blob-3');

// Inputs & Buttons View B
const displayName = document.getElementById('display-name');
const editNameBtn = document.getElementById('edit-name-btn');
const liveDate = document.getElementById('live-date');
const liveTime = document.getElementById('live-time');
const mealBtns = document.querySelectorAll('.meal-btn');
const moodBtns = document.querySelectorAll('.mood-btn');
const energySlider = document.getElementById('energy-slider');
const energyVal = document.getElementById('energy-val');
const latestPickName = document.getElementById('latest-pick-name');
const latestPickTime = document.getElementById('latest-pick-time');

// Filters
const filterPrice = document.getElementById('filter-price');
const filterCategory = document.getElementById('filter-category');

// Map Button
const btnOpenMap = document.getElementById('btn-open-map');

// Wheel & Spin
const btnSpin = document.getElementById('btn-spin');
const rouletteWheel = document.getElementById('roulette-wheel');
const spinResult = document.getElementById('spin-result');
const spinResultNum = document.getElementById('spin-result-num');
const spinResultName = document.getElementById('spin-result-name');

// Modes
const modeSpin = document.getElementById('mode-spin');
const modeManual = document.getElementById('mode-manual');
const sectionSpin = document.getElementById('section-spin');
const sectionManual = document.getElementById('section-manual');
const manualGrid = document.getElementById('manual-grid');

// Global Buttons
const btnGoDashboard = document.getElementById('btn-go-dashboard');
const btnAddRestaurant = document.getElementById('btn-add-restaurant');
const btnAddRestaurantManual = document.getElementById('btn-add-restaurant-manual');

// Dashboard Elements
const btnBackMain = document.getElementById('btn-back-main');
const datePicker = document.getElementById('date-picker');
const btnRefresh = document.getElementById('btn-refresh');
const btnSimulate = document.getElementById('btn-simulate');
const btnClearData = document.getElementById('btn-clear-data');

// Quiz Elements
const btnOpenQuiz = document.getElementById('btn-open-quiz');
const btnCloseQuiz = document.getElementById('btn-close-quiz');
const quizThemeSelector = document.getElementById('quiz-theme-selector');
const quizThemeBtns = document.querySelectorAll('.quiz-theme-btn');
const quizQuestionsContainer = document.getElementById('quiz-questions-container');
const quizSlidesWrapper = document.getElementById('quiz-slides-wrapper');
const quizProgressBar = document.getElementById('quiz-progress-bar');
const quizResultContainer = document.getElementById('quiz-result-container');
const quizResultCode = document.getElementById('quiz-result-code');
const quizResultTitle = document.getElementById('quiz-result-title');
const quizResultDesc = document.getElementById('quiz-result-desc');
const quizResultIcon = document.getElementById('quiz-result-icon');
const btnApplyQuiz = document.getElementById('btn-apply-quiz');

// Modals
const modalAdd = document.getElementById('modal-add');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnSubmitRestaurant = document.getElementById('btn-submit-restaurant');

const modalEdit = document.getElementById('modal-edit');
const btnCloseModalEdit = document.getElementById('btn-close-modal-edit');
const btnSubmitEditRestaurant = document.getElementById('btn-submit-edit-restaurant');

const modalEditName = document.getElementById('modal-edit-name');
const btnCloseEditName = document.getElementById('btn-close-edit-name');
const btnSubmitEditName = document.getElementById('btn-submit-edit-name');
const editNameInput = document.getElementById('edit-name-input');

const modalManualConfirm = document.getElementById('modal-manual-confirm');
const btnCancelManual = document.getElementById('btn-cancel-manual');
const btnSubmitManual = document.getElementById('btn-submit-manual');
const manualConfirmName = document.getElementById('manual-confirm-name');

const modalDeleteConfirm = document.getElementById('modal-delete-confirm');
const btnCancelDelete = document.getElementById('btn-cancel-delete');
const btnSubmitDelete = document.getElementById('btn-submit-delete');
const deleteConfirmName = document.getElementById('delete-confirm-name');

const btnViewOptions = document.getElementById('btn-view-options');
const modalOptionsList = document.getElementById('modal-options-list');
const btnCloseOptionsList = document.getElementById('btn-close-options-list');
const optionsListModalUl = document.getElementById('options-list-modal-ul');

// ================= State =================
let currentUser = localStorage.getItem('lunch_username') || '';
let currentMeal = 'lunch';
let currentMood = 'Relaxed'; 
let currentDegree = 0;
let restaurantsData = [];
let filteredRestaurants = [];
let isSpinning = false;
let currentMode = 'spin'; 
let pendingManualRest = null; 
let pendingDeleteRestId = null;
let pendingEditRestId = null;

// Quiz State
let currentQuizTheme = null;
let currentQuizStep = 0;
let quizAnswers = [];
let activeQuizCategory = null; // e.g. "quiz_heavy_spicy"

// Chart instances
let topRestaurantsChartInstance = null;
let moodChartInstance = null;

const pastelColors = ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e8baff'];

// ================= Theme & Init =================
const applyTheme = () => {
    let bodyBg = '';
    let b1 = ''; let b2 = ''; let b3 = '';
    
    if (currentMood === 'Relaxed') {
        bodyBg = 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50';
        b1 = 'bg-emerald-200/40'; b2 = 'bg-teal-200/40'; b3 = 'bg-cyan-200/30';
    } else if (currentMood === 'Drained') {
        bodyBg = 'bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50';
        b1 = 'bg-sky-200/40'; b2 = 'bg-indigo-200/40'; b3 = 'bg-purple-200/30';
    } else if (currentMood === 'Stressed') {
        bodyBg = 'bg-gradient-to-br from-rose-50 via-orange-50 to-red-50';
        b1 = 'bg-rose-200/40'; b2 = 'bg-orange-200/40'; b3 = 'bg-red-200/30';
    }
    
    appBody.className = `${bodyBg} min-h-screen text-slate-800 font-sans overflow-x-hidden relative selection:bg-sky-200 selection:text-sky-900 transition-colors duration-1000`;
    blob1.className = `absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full blur-[100px] transition-colors duration-1000 animate-blob ${b1}`;
    blob2.className = `absolute top-[40%] -right-[10%] w-[40vw] h-[40vw] rounded-full blur-[100px] transition-colors duration-1000 animate-blob ${b2}`;
    blob3.className = `absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[120px] transition-colors duration-1000 animate-blob ${b3}`;

    if (currentMeal === 'breakfast') {
        ambientLayer.className = 'fixed inset-0 z-[-1] pointer-events-none transition-colors duration-1000 bg-amber-200/10 mix-blend-multiply';
    } else if (currentMeal === 'lunch') {
        ambientLayer.className = 'fixed inset-0 z-[-1] pointer-events-none transition-colors duration-1000 bg-transparent';
    } else if (currentMeal === 'dinner') {
        ambientLayer.className = 'fixed inset-0 z-[-1] pointer-events-none transition-colors duration-1000 bg-indigo-900/10 mix-blend-multiply shadow-[inset_0_0_150px_rgba(0,0,0,0.2)]';
    }

    const energyLevel = parseInt(energySlider.value);
    const sat = 0.4 + ((energyLevel - 10) / 90) * 0.9;
    const bright = 0.9 + ((energyLevel - 10) / 90) * 0.15;
    document.getElementById('screen-filter').style.backdropFilter = `saturate(${sat}) brightness(${bright})`;

    const duration = 20 - ((energyLevel - 10) / 90) * 15;
    const durStr = `${duration}s`;
    blob1.style.animationDuration = durStr;
    blob2.style.animationDuration = durStr;
    blob3.style.animationDuration = durStr;
};

const updateLiveClock = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    liveDate.textContent = dateStr;
    liveTime.textContent = timeStr;
};

// ================= View Navigation =================
const showView = (viewEl) => {
    viewWelcome.classList.add('hidden');
    viewMain.classList.add('hidden');
    viewDashboard.classList.add('hidden');
    viewQuiz.classList.add('hidden');
    
    viewEl.classList.remove('hidden');
    viewEl.style.opacity = '0';
    setTimeout(() => {
        viewEl.style.opacity = '1';
    }, 50);

    if (viewEl === viewDashboard) {
        updateDashboard();
    }
};

// ================= API Calls =================
const api = {
    getDb: async () => {
        const res = await fetch('/api/data');
        return res.json();
    },
    getHistory: async (date) => {
        const res = await fetch(`/api/history?date=${date}`);
        return res.json();
    },
    spin: async (payload) => {
        await fetch('/api/spin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    },
    addRestaurant: async (payload) => {
        await fetch('/api/restaurants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    },
    deleteRestaurant: async (id) => {
        await fetch(`/api/restaurants/${id}`, { method: 'DELETE' });
    },
    editRestaurant: async (id, payload) => {
        await fetch(`/api/restaurants/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    },
    simulate: async () => {
        await fetch('/api/simulate', { method: 'POST' });
    },
    clearData: async () => {
        await fetch('/api/clear', { method: 'POST' });
    }
};

const loadRestaurants = async () => {
    const data = await api.getDb();
    restaurantsData = data.restaurants;
    
    // Dynamic Filter Category
    const categories = [...new Set(restaurantsData.map(r => r.food_category))].filter(Boolean);
    const existingVal = filterCategory.value;
    
    filterCategory.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        filterCategory.appendChild(opt);
    });
    
    // Inject Quiz result filters if they exist
    if (activeQuizCategory) {
        const opt = document.createElement('option');
        opt.value = activeQuizCategory;
        opt.textContent = '✨ ' + quizResultsMap[activeQuizCategory.replace('quiz_', '')].title;
        filterCategory.appendChild(opt);
        filterCategory.value = activeQuizCategory;
    } else {
        if([...filterCategory.options].some(o => o.value === existingVal)) {
            filterCategory.value = existingVal;
        }
    }
};

const refreshCurrentPick = async () => {
    const today = new Date().toISOString().split('T')[0];
    const history = await api.getHistory(today);
    
    // Find latest for current user and current meal
    const myHistory = history.filter(h => h.username === currentUser && h.meal_type === currentMeal);
    myHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (myHistory.length > 0) {
        const latest = myHistory[0];
        const rest = restaurantsData.find(r => r.id === latest.selected_restaurant_id);
        if (rest) {
            latestPickName.textContent = rest.name;
            latestPickName.className = 'text-2xl font-black text-rose-500 ml-11';
            
            const timeObj = new Date(latest.timestamp);
            latestPickTime.textContent = 'Selected at ' + timeObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            document.getElementById('latest-pick-meta').classList.remove('hidden');
            document.getElementById('latest-pick-mood').innerHTML = `<i class="fas fa-heart mr-1"></i> ${latest.mood}`;
            document.getElementById('latest-pick-energy').innerHTML = `<i class="fas fa-bolt mr-1"></i> ${latest.energy_level}% Energy`;
        }
    } else {
        latestPickName.textContent = '---';
        latestPickName.className = 'text-2xl font-black text-slate-800 ml-11';
        latestPickTime.textContent = 'Not selected yet';
        document.getElementById('latest-pick-meta').classList.add('hidden');
    }
};

const init = async () => {
    const today = new Date().toISOString().split('T')[0];
    datePicker.value = today;

    setInterval(updateLiveClock, 1000);
    updateLiveClock();

    if (currentUser) {
        showView(viewMain);
        displayName.textContent = currentUser;
        await loadRestaurants();
        updateWheel();
        renderManualGrid();
        refreshCurrentPick();
    } else {
        showView(viewWelcome);
    }
    
    document.querySelector('.meal-btn[data-val="lunch"]').classList.add('active');
    document.querySelector('.mood-btn[data-val="Relaxed"]').classList.add('active');
    applyTheme();
    
    Chart.defaults.color = '#64748b'; 
    Chart.defaults.borderColor = '#f1f5f9'; 
};

// ================= Modals =================
const openModal = (modalEl) => {
    modalEl.classList.remove('hidden');
    setTimeout(() => modalEl.classList.remove('opacity-0'), 10);
};

const closeModal = (modalEl) => {
    modalEl.classList.add('opacity-0');
    setTimeout(() => modalEl.classList.add('hidden'), 300);
};

// ================= Events =================
btnStart.addEventListener('click', async () => {
    const name = usernameInput.value.trim();
    if (name) {
        currentUser = name;
        localStorage.setItem('lunch_username', name);
        displayName.textContent = name;
        await loadRestaurants();
        updateWheel();
        renderManualGrid();
        refreshCurrentPick();
        showView(viewMain);
    } else {
        alert('Please enter your nickname.');
    }
});

// Edit Name
editNameBtn.addEventListener('click', () => {
    editNameInput.value = currentUser;
    openModal(modalEditName);
});
btnCloseEditName.addEventListener('click', () => closeModal(modalEditName));
btnSubmitEditName.addEventListener('click', () => {
    const newName = editNameInput.value.trim();
    if (newName) {
        currentUser = newName;
        localStorage.setItem('lunch_username', currentUser);
        displayName.textContent = currentUser;
        refreshCurrentPick();
        closeModal(modalEditName);
    }
});

// Form Toggles
mealBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        mealBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMeal = btn.dataset.val;
        applyTheme();
        updateWheel();
        renderManualGrid();
        refreshCurrentPick();
    });
});

moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        moodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMood = btn.dataset.val;
        applyTheme(); 
    });
});

energySlider.addEventListener('input', (e) => {
    energyVal.textContent = e.target.value + '%';
    applyTheme(); 
});

const applyFilters = () => {
    updateWheel();
    renderManualGrid();
};
filterPrice.addEventListener('change', applyFilters);
filterCategory.addEventListener('change', applyFilters);

// Global Nav
btnGoDashboard.addEventListener('click', () => showView(viewDashboard));
btnBackMain.addEventListener('click', () => showView(viewMain));
btnRefresh.addEventListener('click', () => {
    updateDashboard();
    showToast('Dashboard Updated!');
});

// Map Link Logic
btnOpenMap.addEventListener('click', () => {
    const originalText = btnOpenMap.innerHTML;
    btnOpenMap.innerHTML = '<i class="fas fa-spinner fa-spin text-lg"></i> Locating...';
    btnOpenMap.disabled = true;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const url = `https://www.google.com/maps/search/Restaurants/@${lat},${lng},15z`;
                window.open(url, '_blank');
                btnOpenMap.innerHTML = originalText;
                btnOpenMap.disabled = false;
            },
            (error) => {
                alert('Could not get your location. Opening default map.');
                const url = `https://www.google.com/maps/search/Restaurants/`;
                window.open(url, '_blank');
                btnOpenMap.innerHTML = originalText;
                btnOpenMap.disabled = false;
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
        btnOpenMap.innerHTML = originalText;
        btnOpenMap.disabled = false;
    }
});

// Mode Toggle (Spin vs Manual)
modeSpin.addEventListener('click', () => {
    if (currentMode === 'spin') return;
    currentMode = 'spin';
    modeSpin.classList.add('active', 'text-rose-600', 'bg-white', 'shadow-sm');
    modeSpin.classList.remove('text-slate-500');
    modeManual.classList.remove('active', 'text-sky-600', 'bg-white', 'shadow-sm');
    modeManual.classList.add('text-slate-500');
    
    sectionManual.classList.add('hidden', 'opacity-0');
    sectionSpin.classList.remove('hidden');
    setTimeout(() => sectionSpin.classList.remove('opacity-0'), 50);
});

modeManual.addEventListener('click', () => {
    if (currentMode === 'manual') return;
    currentMode = 'manual';
    modeManual.classList.add('active', 'text-sky-600', 'bg-white', 'shadow-sm');
    modeManual.classList.remove('text-slate-500');
    modeSpin.classList.remove('active', 'text-rose-600', 'bg-white', 'shadow-sm');
    modeSpin.classList.add('text-slate-500');
    
    sectionSpin.classList.add('hidden', 'opacity-0');
    sectionManual.classList.remove('hidden');
    setTimeout(() => sectionManual.classList.remove('opacity-0'), 50);
});

// ================= Roulette & Spin Logic =================
const isQuizMatch = (rest, quizKey) => {
    if(!quizKey) return false;
    const conf = quizResultsMap[quizKey];
    if(!conf) return false;
    
    const cat = rest.food_category.toLowerCase();
    const name = rest.name.toLowerCase();
    return conf.keywords.some(kw => cat.includes(kw) || name.includes(kw));
};

const updateWheel = () => {
    const priceVal = filterPrice.value;
    const catVal = filterCategory.value;
    
    filteredRestaurants = restaurantsData.filter(r => {
        const matchMeal = r.meal_types.includes(currentMeal);
        const matchPrice = priceVal === 'all' || r.price_range === priceVal;
        
        let matchCat = true;
        if (catVal.startsWith('quiz_')) {
            const qKey = catVal.replace('quiz_', '');
            matchCat = isQuizMatch(r, qKey);
        } else {
            matchCat = catVal === 'all' || r.food_category === catVal;
        }
        
        return matchMeal && matchPrice && matchCat;
    });
    
    // Fallback if quiz filtering yielded nothing: Just show all for that meal
    if (filteredRestaurants.length === 0 && catVal.startsWith('quiz_')) {
        filteredRestaurants = restaurantsData.filter(r => r.meal_types.includes(currentMeal) && (priceVal === 'all' || r.price_range === priceVal));
    }
    
    rouletteWheel.innerHTML = '';
    if(optionsListModalUl) optionsListModalUl.innerHTML = '';
    
    if (filteredRestaurants.length === 0) {
        rouletteWheel.innerHTML = '<div class="absolute inset-0 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-sm">No options</div>';
        rouletteWheel.style.background = 'transparent';
        return;
    }

    const numSegments = filteredRestaurants.length;
    const anglePerSegment = 360 / numSegments;
    
    let gradientParts = [];
    for (let i = 0; i < numSegments; i++) {
        const startAngle = i * anglePerSegment;
        const endAngle = (i + 1) * anglePerSegment;
        const color = pastelColors[i % pastelColors.length];
        
        gradientParts.push(`${color} ${startAngle}deg ${endAngle}deg`);
        
        const number = i + 1;
        const labelEl = document.createElement('div');
        labelEl.className = 'absolute inset-0 flex justify-center text-xl font-black text-slate-700/80 pt-6';
        labelEl.style.transform = `rotate(${startAngle + anglePerSegment / 2}deg)`;
        labelEl.style.transformOrigin = '50% 50%';
        labelEl.innerHTML = `<span style="transform: rotate(0deg); drop-shadow: 0 1px 2px white;">${number}</span>`;
        rouletteWheel.appendChild(labelEl);
        
        if(optionsListModalUl) {
            const li = document.createElement('li');
            li.className = 'flex items-center gap-3 p-2 bg-white/50 border border-white rounded-xl shadow-sm';
            li.innerHTML = `
                <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-inner flex-shrink-0" style="background-color:${color}; color: rgba(0,0,0,0.6)">${number}</span>
                <span class="font-bold text-slate-700 truncate" title="${filteredRestaurants[i].name}">${filteredRestaurants[i].name}</span>
            `;
            optionsListModalUl.appendChild(li);
        }
    }
    
    rouletteWheel.style.background = `conic-gradient(${gradientParts.join(', ')})`;
};

btnSpin.addEventListener('click', async () => {
    if (isSpinning || filteredRestaurants.length === 0) return;
    isSpinning = true;
    spinResult.classList.remove('opacity-100', 'translate-y-0');
    spinResult.classList.add('opacity-0', '-translate-y-4');

    const spinTurns = Math.floor(Math.random() * 5) + 5; 
    const targetIndex = Math.floor(Math.random() * filteredRestaurants.length);
    const anglePerSegment = 360 / filteredRestaurants.length;
    
    const safePadding = anglePerSegment * 0.2;
    const randomOffsetInSegment = (Math.random() * (anglePerSegment - 2*safePadding)) + safePadding;
    const targetAngleOnWheel = (targetIndex * anglePerSegment) + randomOffsetInSegment;
    const targetRotation = 360 - targetAngleOnWheel;
    
    currentDegree += (spinTurns * 360) + targetRotation - (currentDegree % 360);
    rouletteWheel.style.transform = `rotate(${currentDegree}deg)`;
    
    setTimeout(async () => {
        isSpinning = false;
        const selected = filteredRestaurants[targetIndex];
        
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: pastelColors });
        
        spinResultNum.textContent = targetIndex + 1;
        spinResultName.textContent = selected.name;
        spinResult.classList.remove('opacity-0', '-translate-y-4');
        spinResult.classList.add('opacity-100', 'translate-y-0');
        
        setTimeout(() => {
            spinResult.classList.remove('opacity-100', 'translate-y-0');
            spinResult.classList.add('opacity-0', '-translate-y-4');
        }, 5000);
        
        await api.spin({
            username: currentUser,
            date: new Date().toISOString().split('T')[0],
            meal_type: currentMeal,
            mood: currentMood,
            energy_level: energySlider.value,
            selected_restaurant_id: selected.id,
            selection_method: activeQuizCategory ? 'quiz' : 'spin'
        });
        
        refreshCurrentPick();
        activeQuizCategory = null;
        
    }, 4000); 
});

// ================= Manual Grid Logic =================
const renderManualGrid = () => {
    manualGrid.innerHTML = '';
    if (filteredRestaurants.length === 0) {
        manualGrid.innerHTML = '<div class="col-span-full text-center text-slate-400 py-10 font-bold uppercase">No options</div>';
        return;
    }
    
    filteredRestaurants.forEach(rest => {
        const card = document.createElement('div');
        card.className = 'rest-card bg-white/70 border border-white p-4 rounded-2xl shadow-sm flex items-center justify-between group';
        
        card.innerHTML = `
            <div class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" id="manual-rest-${rest.id}">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center text-sky-500 font-black shadow-inner flex-shrink-0">
                    <i class="fas fa-utensils text-sm"></i>
                </div>
                <div class="min-w-0 flex-1 pr-2">
                    <h4 class="font-bold text-slate-700 group-hover:text-sky-600 transition-colors truncate">${rest.name}</h4>
                    <p class="text-xs text-slate-400 font-medium truncate">${rest.food_category}</p>
                </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0 ml-2">
                <button class="w-8 h-8 rounded-full bg-amber-50 text-amber-500 hover:text-white hover:bg-amber-500 transition-colors flex items-center justify-center btn-edit-rest flex-shrink-0" data-id="${rest.id}" title="Edit">
                    <i class="fas fa-pen text-xs"></i>
                </button>
                <button class="w-8 h-8 rounded-full bg-rose-50 text-rose-400 hover:text-white hover:bg-rose-500 transition-colors flex items-center justify-center btn-delete-rest flex-shrink-0" data-id="${rest.id}" title="Delete">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            </div>
        `;
        
        // Select
        card.querySelector(`#manual-rest-${rest.id}`).addEventListener('click', () => {
            card.style.transform = 'scale(0.95)';
            setTimeout(() => card.style.transform = '', 150);
            
            pendingManualRest = rest;
            manualConfirmName.textContent = rest.name;
            openModal(modalManualConfirm);
        });
        
        // Edit
        card.querySelector('.btn-edit-rest').addEventListener('click', (e) => {
            e.stopPropagation();
            pendingEditRestId = rest.id;
            document.getElementById('edit-name').value = rest.name;
            document.getElementById('edit-price').value = rest.price_range;
            document.getElementById('edit-category').value = rest.food_category;
            
            document.querySelectorAll('.edit-meal').forEach(cb => {
                cb.checked = rest.meal_types.includes(cb.value);
                cb.dispatchEvent(new Event('change'));
            });
            openModal(modalEdit);
        });

        // Delete
        card.querySelector('.btn-delete-rest').addEventListener('click', (e) => {
            e.stopPropagation();
            pendingDeleteRestId = rest.id;
            deleteConfirmName.textContent = rest.name;
            openModal(modalDeleteConfirm);
        });
        
        manualGrid.appendChild(card);
    });
};

btnCancelManual.addEventListener('click', () => {
    pendingManualRest = null;
    closeModal(modalManualConfirm);
});
btnSubmitManual.addEventListener('click', async () => {
    if (pendingManualRest) {
        closeModal(modalManualConfirm);
        
        await api.spin({
            username: currentUser,
            date: new Date().toISOString().split('T')[0],
            meal_type: currentMeal,
            mood: currentMood,
            energy_level: energySlider.value,
            selected_restaurant_id: pendingManualRest.id,
            selection_method: activeQuizCategory ? 'quiz' : 'manual'
        });
        
        activeQuizCategory = null;
        
        const notif = document.createElement('div');
        notif.className = 'fixed inset-0 z-50 flex items-center justify-center pointer-events-none';
        notif.innerHTML = `
            <div class="bg-white/90 backdrop-blur-md px-8 py-4 rounded-2xl shadow-2xl border border-white transform scale-0 transition-transform duration-300 flex items-center gap-4">
                <div class="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-xl"><i class="fas fa-check"></i></div>
                <div>
                    <p class="text-sm text-slate-500 font-bold">Saved successfully!</p>
                    <p class="text-xl font-black text-slate-800">${pendingManualRest.name}</p>
                </div>
            </div>
        `;
        document.body.appendChild(notif);
        setTimeout(() => notif.querySelector('div').classList.remove('scale-0'), 10);
        
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: pastelColors });
        refreshCurrentPick();
        
        setTimeout(() => {
            notif.querySelector('div').classList.add('scale-0');
            setTimeout(() => notif.remove(), 300);
        }, 2000);
        
        pendingManualRest = null;
    }
});

btnCancelDelete.addEventListener('click', () => {
    pendingDeleteRestId = null;
    closeModal(modalDeleteConfirm);
});
btnSubmitDelete.addEventListener('click', async () => {
    if (pendingDeleteRestId) {
        await api.deleteRestaurant(pendingDeleteRestId);
        await loadRestaurants(); 
        updateWheel();
        renderManualGrid();
        closeModal(modalDeleteConfirm);
        pendingDeleteRestId = null;
    }
});


// View Options Modal
if (btnViewOptions) btnViewOptions.addEventListener('click', () => openModal(modalOptionsList));
if (btnCloseOptionsList) btnCloseOptionsList.addEventListener('click', () => closeModal(modalOptionsList));

// Add Restaurant Modal
btnAddRestaurant.addEventListener('click', () => openModal(modalAdd));
if (btnAddRestaurantManual) btnAddRestaurantManual.addEventListener('click', () => openModal(modalAdd));

btnCloseModal.addEventListener('click', () => closeModal(modalAdd));

document.querySelectorAll('.add-meal').forEach(cb => {
    cb.addEventListener('change', (e) => {
        const parent = e.target.parentElement;
        if(e.target.checked) {
            parent.classList.remove('bg-white/50', 'border-white');
            parent.classList.add('bg-sky-100', 'border-sky-300');
            parent.querySelector('.check-label').classList.remove('text-slate-500', 'font-bold');
            parent.querySelector('.check-label').classList.add('text-sky-600', 'font-extrabold');
        } else {
            parent.classList.add('bg-white/50', 'border-white');
            parent.classList.remove('bg-sky-100', 'border-sky-300');
            parent.querySelector('.check-label').classList.add('text-slate-500', 'font-bold');
            parent.querySelector('.check-label').classList.remove('text-sky-600', 'font-extrabold');
        }
    });
});

btnSubmitRestaurant.addEventListener('click', async () => {
    const name = document.getElementById('add-name').value.trim();
    const price = document.getElementById('add-price').value;
    const category = document.getElementById('add-category').value.trim();
    const mealCbs = document.querySelectorAll('.add-meal:checked');
    const meal_types = Array.from(mealCbs).map(cb => cb.value);

    if (!name || meal_types.length === 0) {
        alert('Name and at least one meal period are required.');
        return;
    }

    await api.addRestaurant({ name, price_range: price, meal_types, food_category: category || 'General' });
    await loadRestaurants(); 
    updateWheel();
    renderManualGrid();
    
    document.getElementById('add-name').value = '';
    document.getElementById('add-category').value = '';
    closeModal(modalAdd);
});

// Edit Restaurant Modal
btnCloseModalEdit.addEventListener('click', () => closeModal(modalEdit));

document.querySelectorAll('.edit-meal').forEach(cb => {
    cb.addEventListener('change', (e) => {
        const parent = e.target.parentElement;
        if(e.target.checked) {
            parent.classList.remove('bg-white/50', 'border-white');
            parent.classList.add('bg-amber-100', 'border-amber-300');
            parent.querySelector('.check-label').classList.remove('text-slate-500', 'font-bold');
            parent.querySelector('.check-label').classList.add('text-amber-600', 'font-extrabold');
        } else {
            parent.classList.add('bg-white/50', 'border-white');
            parent.classList.remove('bg-amber-100', 'border-amber-300');
            parent.querySelector('.check-label').classList.add('text-slate-500', 'font-bold');
            parent.querySelector('.check-label').classList.remove('text-amber-600', 'font-extrabold');
        }
    });
});

btnSubmitEditRestaurant.addEventListener('click', async () => {
    const name = document.getElementById('edit-name').value.trim();
    const price = document.getElementById('edit-price').value;
    const category = document.getElementById('edit-category').value.trim();
    const mealCbs = document.querySelectorAll('.edit-meal:checked');
    const meal_types = Array.from(mealCbs).map(cb => cb.value);

    if (!name || meal_types.length === 0) {
        alert('Name and at least one meal period are required.');
        return;
    }

    if (pendingEditRestId) {
        await api.editRestaurant(pendingEditRestId, { name, price_range: price, meal_types, food_category: category || 'General' });
        await loadRestaurants(); 
        updateWheel();
        renderManualGrid();
        refreshCurrentPick();
        closeModal(modalEdit);
        pendingEditRestId = null;
    }
});


// ================= Dashboard Logic =================
let isGlobalStats = false;
let globalFilterMood = null;
let globalFilterMeal = null;

let categoryRadarChartInstance = null;
let pricePolarChartInstance = null;
let methodDoughnutChartInstance = null;
let fullHistoryData = [];
let currentDashboardHistory = [];
let fullAllData = null;

// ================= Toast =================
let toastTimeout;
const showToast = (message) => {
    const toast = document.getElementById('toast-container');
    const msgEl = document.getElementById('toast-message');
    msgEl.textContent = message;
    toast.classList.remove('opacity-0', '-translate-y-20', 'pointer-events-none');
    toast.classList.add('opacity-100', 'translate-y-0');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', '-translate-y-20', 'pointer-events-none');
    }, 5000);
};

const updateDashboard = async () => {
    // Fetch all history to enable robust AI and Wow Chart analysis across all dates
    const history = await api.getHistory('');
    const allData = await api.getDb();
    
    fullHistoryData = history;
    fullAllData = allData;
    
    renderDashboardWithCurrentState();
};

const renderDashboardWithCurrentState = () => {
    const selectedDate = datePicker.value;
    const dateModeSelect = document.getElementById('date-mode-select');
    const mode = dateModeSelect ? dateModeSelect.value : 'all';
    
    let historyToUse = fullHistoryData;
    if (!isGlobalStats) {
        historyToUse = historyToUse.filter(h => h.username === currentUser);
    }
    
    // Header logic
    const latestHeader = document.getElementById('dash-latest-header');
    
    if (mode === 'today') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (latestHeader) latestHeader.textContent = '🍽️ Latest Meals Today';
        historyToUse = historyToUse.filter(h => h.date === todayStr);
    } else if (mode === 'specific') {
        if (latestHeader) latestHeader.textContent = `🍽️ Meals on ${selectedDate}`;
        historyToUse = historyToUse.filter(h => h.date === selectedDate);
    } else {
        if (latestHeader) latestHeader.textContent = '🍽️ Latest Meals (All Time)';
    }
    
    let historyForDate = historyToUse;
    currentDashboardHistory = historyForDate;
    
    const pill = document.getElementById('active-filter-pill');
    const pillText = document.getElementById('active-filter-text');
    
    if (globalFilterMood || globalFilterMeal) {
        if (globalFilterMood) {
            historyForDate = historyForDate.filter(h => h.mood === globalFilterMood);
            historyToUse = historyToUse.filter(h => h.mood === globalFilterMood);
        }
        if (globalFilterMeal) {
            historyForDate = historyForDate.filter(h => h.meal_type === globalFilterMeal);
            historyToUse = historyToUse.filter(h => h.meal_type === globalFilterMeal);
        }
        pill.classList.remove('hidden');
        pill.classList.add('flex');
        const activeFilters = [];
        if (globalFilterMood) activeFilters.push(globalFilterMood);
        if (globalFilterMeal) activeFilters.push(globalFilterMeal.toUpperCase());
        pillText.textContent = activeFilters.join(' + ');
    } else {
        pill.classList.add('hidden');
        pill.classList.remove('flex');
    }
    
    renderLatestSpins(historyForDate, fullAllData.restaurants);
    renderTopRestaurantsChart(historyForDate, fullAllData.restaurants);
    renderForecast(historyToUse);
    calculateAIAccuracy(fullHistoryData);
    renderMoodChart(historyForDate);
    renderCategoryRadarChart(historyToUse, fullAllData.restaurants);
    renderPricePolarChart(historyToUse, fullAllData.restaurants);
    renderMethodDoughnutChart(historyToUse);
};

document.getElementById('btn-clear-filter').addEventListener('click', () => {
    globalFilterMood = null;
    globalFilterMeal = null;
    renderDashboardWithCurrentState();
});

const btnScopePersonal = document.getElementById('btn-scope-personal');
const btnScopeGlobal = document.getElementById('btn-scope-global');

btnScopePersonal.addEventListener('click', () => {
    if(!isGlobalStats) return;
    isGlobalStats = false;
    btnScopePersonal.classList.replace('text-slate-500', 'text-slate-700');
    btnScopePersonal.classList.add('bg-white', 'shadow-sm');
    btnScopeGlobal.classList.replace('text-slate-700', 'text-slate-500');
    btnScopeGlobal.classList.remove('bg-white', 'shadow-sm');
    renderDashboardWithCurrentState();
});

btnScopeGlobal.addEventListener('click', () => {
    if(isGlobalStats) return;
    isGlobalStats = true;
    btnScopeGlobal.classList.replace('text-slate-500', 'text-slate-700');
    btnScopeGlobal.classList.add('bg-white', 'shadow-sm');
    btnScopePersonal.classList.replace('text-slate-700', 'text-slate-500');
    btnScopePersonal.classList.remove('bg-white', 'shadow-sm');
    renderDashboardWithCurrentState();
});

datePicker.addEventListener('change', renderDashboardWithCurrentState);

const dateModeSelect = document.getElementById('date-mode-select');
const datePickerContainer = document.getElementById('date-picker-container');
if (dateModeSelect) {
    dateModeSelect.addEventListener('change', () => {
        if (dateModeSelect.value === 'specific') {
            datePickerContainer.classList.remove('hidden');
        } else {
            datePickerContainer.classList.add('hidden');
        }
        renderDashboardWithCurrentState();
    });
}

// Modals Setup
const modalSimulateConfirm = document.getElementById('modal-simulate-confirm');
const btnSubmitSimulate = document.getElementById('btn-submit-simulate');
const btnCancelSimulate = document.getElementById('btn-cancel-simulate');

const modalClearConfirm = document.getElementById('modal-clear-confirm');
const btnSubmitClear = document.getElementById('btn-submit-clear');
const btnCancelClear = document.getElementById('btn-cancel-clear');

const modalFullRanking = document.getElementById('modal-full-ranking');
const btnFullRanking = document.getElementById('btn-full-ranking');
const btnCloseFullRanking = document.getElementById('btn-close-full-ranking');
const fullRankingList = document.getElementById('full-ranking-list');

btnSimulate.addEventListener('click', () => openModal(modalSimulateConfirm));
btnCancelSimulate.addEventListener('click', () => closeModal(modalSimulateConfirm));
btnSubmitSimulate.addEventListener('click', async () => {
    btnSubmitSimulate.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    await api.simulate();
    btnSubmitSimulate.innerHTML = 'Generate';
    closeModal(modalSimulateConfirm);
    datePicker.value = new Date().toISOString().split('T')[0];
    updateDashboard();
    refreshCurrentPick();
});

btnClearData.addEventListener('click', () => openModal(modalClearConfirm));
btnCancelClear.addEventListener('click', () => closeModal(modalClearConfirm));
btnSubmitClear.addEventListener('click', async () => {
    btnSubmitClear.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Clearing...';
    await api.clearData();
    btnSubmitClear.innerHTML = 'Yes, Clear';
    closeModal(modalClearConfirm);
    updateDashboard();
    refreshCurrentPick();
});

if(btnFullRanking) btnFullRanking.addEventListener('click', () => {
    fullRankingList.innerHTML = '';
    
    let filteredHistory = currentDashboardHistory;
    
    let counts = {};
    filteredHistory.forEach(h => { counts[h.selected_restaurant_id] = (counts[h.selected_restaurant_id] || 0) + 1; });
    
    const sortedIds = Object.keys(counts).sort((a,b) => counts[b] - counts[a]);
    const maxCount = sortedIds.length > 0 ? counts[sortedIds[0]] : 1;

    if(sortedIds.length === 0) {
        fullRankingList.innerHTML = '<div class="text-center text-slate-400 py-4">No data available</div>';
    } else {
        sortedIds.forEach((id, index) => {
            const rest = fullAllData.restaurants.find(r => r.id === parseInt(id));
            const count = counts[id];
            const pct = (count / maxCount) * 100;
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="flex items-center justify-between mb-1">
                    <span class="font-bold text-slate-700">${index + 1}. ${rest ? rest.name : 'Unknown'}</span>
                    <span class="text-xs font-bold text-sky-500">${count} picks</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2">
                    <div class="bg-gradient-to-r from-sky-400 to-indigo-400 h-2 rounded-full" style="width: ${pct}%"></div>
                </div>
            `;
            fullRankingList.appendChild(li);
        });
    }
    openModal(modalFullRanking);
});
if(btnCloseFullRanking) btnCloseFullRanking.addEventListener('click', () => closeModal(modalFullRanking));

const renderLatestSpins = (history, allRestaurants) => {
    const dateModeSelect = document.getElementById('date-mode-select');
    const mode = dateModeSelect ? dateModeSelect.value : 'all';
    
    let resultB, resultL, resultD;
    
    if (mode === 'all') {
        const getTop = (mealType) => {
            const meals = history.filter(h => h.meal_type === mealType);
            if (meals.length === 0) return null;
            const counts = {};
            meals.forEach(m => { counts[m.selected_restaurant_id] = (counts[m.selected_restaurant_id] || 0) + 1; });
            const topId = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
            return { selected_restaurant_id: parseInt(topId), count: counts[topId] };
        };
        resultB = getTop('breakfast');
        resultL = getTop('lunch');
        resultD = getTop('dinner');
    } else {
        const sorted = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        resultB = sorted.find(h => h.meal_type === 'breakfast');
        resultL = sorted.find(h => h.meal_type === 'lunch');
        resultD = sorted.find(h => h.meal_type === 'dinner');
    }
    
    const getName = (entry) => {
        if(!entry) return '<span class="text-slate-400 italic font-medium">No record</span>';
        const rest = allRestaurants.find(r => r.id === entry.selected_restaurant_id);
        if (mode === 'all') {
            return rest ? `<span class="font-bold text-amber-500">🏆</span> ${rest.name} <span class="text-amber-600 text-xs ml-2 bg-amber-50 px-2 py-0.5 rounded font-bold border border-amber-100">${entry.count} picks</span>` : 'Unknown';
        } else {
            return rest ? `${rest.name} <span class="text-sky-500 text-xs ml-2 bg-sky-50 px-2 py-0.5 rounded">by ${entry.username}</span>` : 'Unknown';
        }
    };
    
    document.getElementById('dash-latest-breakfast').innerHTML = getName(resultB);
    document.getElementById('dash-latest-lunch').innerHTML = getName(resultL);
    document.getElementById('dash-latest-dinner').innerHTML = getName(resultD);
};

const renderTopRestaurantsChart = (history, allRestaurants) => {
    const ctx = document.getElementById('topRestaurantsChart').getContext('2d');
    
    const counts = {};
    history.forEach(h => {
        counts[h.selected_restaurant_id] = (counts[h.selected_restaurant_id] || 0) + 1;
    });
    
    const top5Ids = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 5);
        
    const labels = top5Ids.map(id => {
        const r = allRestaurants.find(rest => rest.id === parseInt(id));
        return r ? r.name : `ID: ${id}`;
    });
    const dataVals = top5Ids.map(id => counts[id]);
    
    const data = {
        labels: labels.length > 0 ? labels : ['No Data'],
        datasets: [{
            label: 'Visits',
            data: dataVals.length > 0 ? dataVals : [0],
            backgroundColor: 'rgba(56, 189, 248, 0.6)',
            borderColor: '#38bdf8',
            borderWidth: 2,
            borderRadius: 6,
            hoverBackgroundColor: 'rgba(56, 189, 248, 0.8)'
        }]
    };
    
    if (topRestaurantsChartInstance) {
        topRestaurantsChartInstance.data = data;
        topRestaurantsChartInstance.update();
    } else {
        topRestaurantsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true, maintainAspectRatio: false,
                animation: { duration: 1000, easing: 'easeOutQuart' },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 }, grid: { color: 'rgba(241, 245, 249, 1)' } },
                    x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
};

const calculatePrediction = (pastHistory, targetMeal, targetMood, allRestaurants, lastEatenCategory = null) => {
    // 1. Filter by meal type and mood
    const relevantHistory = pastHistory.filter(h => h.meal_type === targetMeal && h.mood === targetMood);
    
    // If no data for this specific mood+meal, fallback to just meal
    let dataToUse = relevantHistory.length > 0 ? relevantHistory : pastHistory.filter(h => h.meal_type === targetMeal);
    
    if (dataToUse.length === 0) return null;
    
    const catCount = {};
    dataToUse.forEach(h => {
        const rest = allRestaurants.find(r => r.id === h.selected_restaurant_id);
        const cat = rest ? rest.food_category : 'Unknown';
        catCount[cat] = (catCount[cat] || 0) + 1;
    });
    
    // Apply fatigue penalty
    if (lastEatenCategory && catCount[lastEatenCategory]) {
        catCount[lastEatenCategory] = catCount[lastEatenCategory] * 0.5; // Reduce score by 50%
    }
    
    const maxCat = Object.keys(catCount).reduce((a, b) => catCount[a] > catCount[b] ? a : b);
    
    // Calculate raw probability
    let rawTotal = 0;
    Object.values(catCount).forEach(v => rawTotal += v);
    const prob = Math.min(99, Math.round((catCount[maxCat] / rawTotal) * 100));
    
    return { category: maxCat, probability: prob, usedMood: relevantHistory.length > 0 };
};

const renderForecast = (historyAllTime) => {
    const txt = document.getElementById('forecast-text');
    const bar = document.getElementById('forecast-bar');
    const pct = document.getElementById('forecast-percent');
    
    if (historyAllTime.length === 0) {
        txt.innerHTML = "รวบรวมข้อมูลเพิ่มเติมเพื่อเริ่มต้น AI Prediction...";
        bar.style.width = '0%';
        pct.textContent = '0';
        return;
    }
    
    const currentHour = new Date().getHours();
    let predictedMeal = 'lunch';
    if (currentHour < 11) predictedMeal = 'breakfast';
    else if (currentHour >= 16) predictedMeal = 'dinner';
    
    // Get latest mood and latest eaten category
    const sortedHistory = [...historyAllTime].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const latestRecord = sortedHistory[0];
    const targetMood = latestRecord ? latestRecord.mood : 'Relaxed';
    
    let lastEatenCategory = null;
    if (latestRecord) {
        const rest = fullAllData.restaurants.find(r => r.id === latestRecord.selected_restaurant_id);
        if (rest) lastEatenCategory = rest.food_category;
    }
    
    const prediction = calculatePrediction(historyAllTime, predictedMeal, targetMood, fullAllData.restaurants, lastEatenCategory);
    
    if(!prediction) {
        txt.innerHTML = `ยังไม่มีข้อมูลเพียงพอสำหรับมื้อ ${predictedMeal}`;
        bar.style.width = '0%';
        pct.textContent = '0';
        return;
    }
    
    let explanation = ``;
    if (lastEatenCategory) {
        explanation += `วิเคราะห์จากมื้อที่แล้วคุณทาน <span class="text-white border-b border-dashed border-white/50">${lastEatenCategory}</span> ไป `;
    }
    if (prediction.usedMood) {
        explanation += `และอารมณ์ <span class="bg-white/20 px-2 rounded backdrop-blur-sm text-white inline-block shadow-sm">${targetMood}</span> ของคุณ AI มั่นใจว่ามื้อ ${predictedMeal} นี้คุณจะเลือกทาน:`;
    } else {
        explanation += `AI มั่นใจว่ามื้อ ${predictedMeal} นี้คุณจะเลือกทาน:`;
    }
    
    txt.innerHTML = `${explanation}<br><span class="text-yellow-300 font-black text-4xl mt-3 block drop-shadow-md tracking-wide">${prediction.category}</span>`;
    bar.style.width = `${prediction.probability}%`;
    pct.textContent = prediction.probability;
};

const calculateAIAccuracy = (historyAllTime) => {
    const accuracySpan = document.getElementById('ai-accuracy-score');
    if (!accuracySpan) return;
    
    if (historyAllTime.length < 10) {
        accuracySpan.textContent = "กำลังเรียนรู้...";
        return;
    }
    
    // Sort chronological (oldest first)
    const sorted = [...historyAllTime].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    let hits = 0;
    let totalPredictions = 0;
    
    for (let i = 5; i < sorted.length; i++) {
        const currentRecord = sorted[i];
        const pastHistory = sorted.slice(0, i);
        
        const lastRecord = sorted[i-1];
        let lastEatenCategory = null;
        if (lastRecord) {
            const r = fullAllData.restaurants.find(x => x.id === lastRecord.selected_restaurant_id);
            if(r) lastEatenCategory = r.food_category;
        }
        
        const prediction = calculatePrediction(pastHistory, currentRecord.meal_type, currentRecord.mood, fullAllData.restaurants, lastEatenCategory);
        
        if (prediction) {
            totalPredictions++;
            const actualRest = fullAllData.restaurants.find(r => r.id === currentRecord.selected_restaurant_id);
            if (actualRest && actualRest.food_category === prediction.category) {
                hits++;
            }
        }
    }
    
    if (totalPredictions === 0) {
        accuracySpan.textContent = "N/A";
    } else {
        const acc = Math.round((hits / totalPredictions) * 100);
        accuracySpan.textContent = `${acc}% (${hits}/${totalPredictions})`;
    }
};

const renderMoodChart = (history) => {
    const ctx = document.getElementById('moodChart').getContext('2d');
    
    const counts = { 'Stressed': 0, 'Drained': 0, 'Relaxed': 0 };
    history.forEach(h => {
        if(counts[h.mood] !== undefined) counts[h.mood]++;
    });
    
    const total = Object.values(counts).reduce((a,b)=>a+b, 0);
    const dataVals = total === 0 ? [1] : Object.values(counts);
    const bgColors = total === 0 ? ['#e2e8f0'] : ['#ffb3ba', '#bae1ff', '#baffc9'];
    const labels = total === 0 ? ['No Data'] : ['Stressed', 'Drained', 'Relaxed'];
    
    const data = {
        labels: labels,
        datasets: [{
            data: dataVals,
            backgroundColor: bgColors,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4
        }]
    };
    
    if (moodChartInstance) {
        moodChartInstance.data = data;
        moodChartInstance.update();
    } else {
        moodChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '65%',
                animation: { animateScale: true, animateRotate: true, duration: 1500 },
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { family: 'Outfit', weight: 'bold' } } }
                },
                onClick: (e, activeEls) => {
                    if (activeEls.length > 0 && total > 0) {
                        const index = activeEls[0].index;
                        const moodLabels = ['Stressed', 'Drained', 'Relaxed'];
                        globalFilterMood = moodLabels[index];
                        renderDashboardWithCurrentState();
                    }
                }
            }
        });
    }
};

const renderCategoryRadarChart = (history, allRestaurants) => {
    const ctx = document.getElementById('categoryRadarChart').getContext('2d');
    const counts = {};
    history.forEach(h => {
        const rest = allRestaurants.find(r => r.id === h.selected_restaurant_id);
        const cat = rest ? rest.food_category : 'Unknown';
        counts[cat] = (counts[cat] || 0) + 1;
    });
    
    const sortedCats = Object.keys(counts).sort((a,b) => counts[b] - counts[a]).slice(0, 6);
    if(sortedCats.length === 0) sortedCats.push('No Data');
    
    const dataVals = sortedCats.map(c => counts[c] || 0);
    
    const data = {
        labels: sortedCats,
        datasets: [{
            label: 'Frequency',
            data: dataVals,
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: '#10b981',
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#fff',
            borderWidth: 2
        }]
    };
    
    if(categoryRadarChartInstance) {
        categoryRadarChartInstance.data = data;
        categoryRadarChartInstance.update();
    } else {
        categoryRadarChartInstance = new Chart(ctx, {
            type: 'radar',
            data: data,
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { r: { angleLines: { color: 'rgba(0,0,0,0.05)' }, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { display: false } } },
                plugins: { legend: { display: false } }
            }
        });
    }
};

const renderPricePolarChart = (history, allRestaurants) => {
    const ctx = document.getElementById('pricePolarChart').getContext('2d');
    const counts = { 'under_100': 0, '100_200': 0, 'over_200': 0 };
    history.forEach(h => {
        const rest = allRestaurants.find(r => r.id === h.selected_restaurant_id);
        if(rest && counts[rest.price_range] !== undefined) counts[rest.price_range]++;
    });
    
    const total = Object.values(counts).reduce((a,b)=>a+b, 0);
    const dataVals = total === 0 ? [1] : Object.values(counts);
    const bgColors = total === 0 ? ['#e2e8f0'] : ['#fcd34d', '#fbbf24', '#f59e0b'];
    const labels = total === 0 ? ['No Data'] : ['Budget (<100)', 'Medium (100-200)', 'Premium (>200)'];

    const data = {
        labels: labels,
        datasets: [{
            data: dataVals,
            backgroundColor: bgColors,
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    if(pricePolarChartInstance) {
        pricePolarChartInstance.data = data;
        pricePolarChartInstance.update();
    } else {
        pricePolarChartInstance = new Chart(ctx, {
            type: 'polarArea',
            data: data,
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { r: { ticks: { display: false }, grid: { color: 'rgba(0,0,0,0.05)' } } },
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: {family: 'Outfit', weight: 'bold'} } } }
            }
        });
    }
};

const renderMethodDoughnutChart = (history) => {
    const ctx = document.getElementById('methodDoughnutChart').getContext('2d');
    const counts = { 'spin': 0, 'manual': 0, 'quiz': 0 };
    history.forEach(h => {
        if(counts[h.selection_method] !== undefined) counts[h.selection_method]++;
    });
    
    const total = Object.values(counts).reduce((a,b)=>a+b, 0);
    const dataVals = total === 0 ? [1] : Object.values(counts);
    const bgColors = total === 0 ? ['#e2e8f0'] : ['#818cf8', '#c084fc', '#f472b6'];
    const labels = total === 0 ? ['No Data'] : ['AI Spin', 'Manual Selection', 'Psychology Quiz'];
    
    const data = {
        labels: labels,
        datasets: [{
            data: dataVals,
            backgroundColor: bgColors,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4
        }]
    };
    
    if(methodDoughnutChartInstance) {
        methodDoughnutChartInstance.data = data;
        methodDoughnutChartInstance.update();
    } else {
        methodDoughnutChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '70%',
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: {family: 'Outfit', weight: 'bold'} } } }
            }
        });
    }
    
    const textEl = document.getElementById('method-text');
    if(total > 0) {
        const p = Math.round((counts['spin'] / total) * 100) || 0;
        textEl.innerHTML = `<span class="text-sm font-bold text-slate-500">You trust AI <span class="text-indigo-500 font-black">${p}%</span> of the time.</span>`;
    } else {
        textEl.innerHTML = '';
    }
};

// ================= Quiz Logic =================

const quizIntroContainer = document.getElementById('quiz-intro-container');

btnOpenQuiz.addEventListener('click', () => {
    showView(viewQuiz);
    if(quizIntroContainer) quizIntroContainer.classList.remove('hidden');
    quizQuestionsContainer.classList.add('hidden');
    quizResultContainer.classList.add('hidden');
});

btnCloseQuiz.addEventListener('click', () => {
    showView(viewMain);
});

quizThemeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentQuizTheme = btn.dataset.theme;
        quizIntroContainer.classList.add('hidden');
        quizQuestionsContainer.classList.remove('hidden');
        startQuiz();
    });
});

const startQuiz = () => {
    currentQuizStep = 0;
    quizAnswers = [];
    quizProgressBar.style.width = '0%';
    renderQuizStep();
};

const renderQuizStep = () => {
    const questions = quizQuestions[currentQuizTheme];
    
    // Check if finished
    if (currentQuizStep >= questions.length) {
        showQuizResult();
        return;
    }
    
    const qData = questions[currentQuizStep];
    
    const slide = document.createElement('div');
    slide.className = 'quiz-slide slide-in-right glass-card p-10 rounded-[3rem] border border-white text-center w-full shadow-lg';
    
    // Generate options HTML
    let optionsHtml = '';
    qData.options.forEach(opt => {
        optionsHtml += `
            <button class="quiz-opt-btn bg-white/70 hover:bg-white text-slate-700 font-bold p-4 md:p-6 rounded-2xl border-2 border-transparent hover:border-purple-300 transition-all flex items-center gap-4 text-left shadow-sm group" data-val="${opt.value}">
                <div class="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform"><i class="${opt.icon}"></i></div>
                <span class="text-base md:text-lg">${opt.text}</span>
            </button>
        `;
    });

    slide.innerHTML = `
        <h3 class="text-purple-500 font-extrabold uppercase tracking-widest text-xs mb-3">คำถามที่ ${currentQuizStep + 1} จาก ${questions.length}</h3>
        <h2 class="text-2xl md:text-3xl font-black text-slate-800 mb-8">${qData.question}</h2>
        <div class="flex flex-col gap-3">
            ${optionsHtml}
        </div>
    `;

    quizSlidesWrapper.appendChild(slide);
    
    // Animate in
    requestAnimationFrame(() => {
        slide.classList.remove('slide-in-right');
        slide.classList.add('slide-active');
    });

    // Handle Clicks
    const btns = slide.querySelectorAll('.quiz-opt-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Lock buttons
            btns.forEach(b => b.disabled = true);
            btn.classList.add('border-purple-500', 'bg-purple-50');
            
            quizAnswers.push(btn.dataset.val);
            
            // Update Progress
            const pct = ((currentQuizStep + 1) / questions.length) * 100;
            quizProgressBar.style.width = `${pct}%`;

            setTimeout(() => {
                // Animate out
                slide.classList.remove('slide-active');
                slide.classList.add('slide-out-left');
                
                setTimeout(() => {
                    slide.remove();
                    currentQuizStep++;
                    renderQuizStep();
                }, 400); // Wait for transition
            }, 500); // Wait for user to see selection
        });
    });
};

let finalQuizPickedRestaurant = null;
let finalQuizResultMeta = {};

const showQuizResult = () => {
    quizQuestionsContainer.classList.add('hidden');
    quizResultContainer.classList.remove('hidden');
    
    // quizAnswers maps to: [meal, mood, energy, price, category]
    const [qMeal, qMood, qEnergy, qPrice, qCategoryKey] = quizAnswers;
    
    // Convert Category Key to clean string for matching
    const cleanCategoryKey = qCategoryKey ? qCategoryKey.replace('quiz_', '') : 'light_clean';
    const targetCatString = cleanCategoryKey.replace('_', ' ').toLowerCase();

    // We start with restaurantsData
    let pool = restaurantsData;
    
    // Fallback Engine Logic
    // Level 1: Strict Match (Meal + Price + Category)
    let filtered = pool.filter(r => {
        const matchMeal = r.meal_types.includes(qMeal);
        const matchPrice = r.price_range === qPrice;
        const matchCat = r.food_category.toLowerCase() === targetCatString;
        return matchMeal && matchPrice && matchCat;
    });

    let fallbackLevel = 1;
    
    // Level 2: Relax Price
    if (filtered.length === 0) {
        fallbackLevel = 2;
        filtered = pool.filter(r => {
            const matchMeal = r.meal_types.includes(qMeal);
            const matchCat = r.food_category.toLowerCase() === targetCatString;
            return matchMeal && matchCat;
        });
    }

    // Level 3: Relax Category (Keep Meal only)
    if (filtered.length === 0) {
        fallbackLevel = 3;
        filtered = pool.filter(r => r.meal_types.includes(qMeal));
    }
    
    // Randomize from the matched pool
    if (filtered.length > 0) {
        const randomIndex = Math.floor(Math.random() * filtered.length);
        finalQuizPickedRestaurant = filtered[randomIndex];
    } else {
        // Level 4: The Universe Wildcard (Absolutely 0 match)
        fallbackLevel = 4;
        const wildcards = [
            { name: "7-11 (จักรวาลเลือกให้)", desc: "เดินเข้า 7-11 ไปซะ! (ง่ายสุดแล้ว)", category: "Convenience Store" },
            { name: "อดข้าว (จักรวาลลงโทษ)", desc: "เรื่องเยอะนัก... อดเอาไม่ต้องกิน!", category: "Air & Water" },
            { name: "มาม่าคัพ (จักรวาลเลือกให้)", desc: "ความต้องการซับซ้อนเกินไป ต้มมาม่ากินซะ!", category: "Instant Noodles" }
        ];
        const randomWc = wildcards[Math.floor(Math.random() * wildcards.length)];
        
        // Find if this wildcard exists in DB
        let existing = pool.find(r => r.name === randomWc.name);
        if (!existing) {
            finalQuizPickedRestaurant = {
                isNewWildcard: true,
                name: randomWc.name,
                food_category: randomWc.category,
                price_range: qPrice,
                meal_types: ["breakfast", "lunch", "dinner"] // Apply to all meals so it shows up in future spins!
            };
        } else {
            finalQuizPickedRestaurant = existing;
        }
    }

    finalQuizResultMeta = { meal: qMeal, mood: qMood, energy: qEnergy, wildcardLevel: fallbackLevel };

    if (fallbackLevel < 4 && finalQuizPickedRestaurant) {
        quizResultTitle.textContent = finalQuizPickedRestaurant.name;
        
        if (fallbackLevel === 1) {
            quizResultDesc.innerHTML = `<span class="text-emerald-600"><i class="fas fa-check-circle"></i> Perfect Match! ตรงสเปค 100%</span>`;
        } else if (fallbackLevel === 2) {
            quizResultDesc.innerHTML = `<span class="text-amber-600"><i class="fas fa-exclamation-circle"></i> หาราคาที่ต้องการไม่เจอ แต่รสชาตินี้ใช่เลย!</span>`;
        } else if (fallbackLevel === 3) {
            quizResultDesc.innerHTML = `<span class="text-rose-500"><i class="fas fa-random"></i> รสชาติที่คุณต้องการไม่มีเลย แต่เราหาร้านมื้อ ${qMeal} มาให้แทน!</span>`;
        }
    } else if (fallbackLevel === 4 && finalQuizPickedRestaurant) {
        // Level 4 UI: Wildcard Strings
        quizResultTitle.innerHTML = `<span class="text-rose-500 text-3xl md:text-4xl">จักรวาลขอสละสิทธิ์! 🌌</span><br><span class="text-slate-800 text-2xl mt-4 block">${finalQuizPickedRestaurant.name}</span>`;
        
        const wcObj = [
            { name: "7-11 (จักรวาลเลือกให้)", desc: "เดินเข้า 7-11 ไปซะ! (ง่ายสุดแล้ว)" },
            { name: "อดข้าว (จักรวาลลงโทษ)", desc: "เรื่องเยอะนัก... อดเอาไม่ต้องกิน!" },
            { name: "มาม่าคัพ (จักรวาลเลือกให้)", desc: "ความต้องการซับซ้อนเกินไป ต้มมาม่ากินซะ!" }
        ].find(w => w.name === finalQuizPickedRestaurant.name);
        
        quizResultDesc.textContent = wcObj ? wcObj.desc : "ทำตามที่จักรวาลบอกเถอะ!";
    }
    
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
};

btnApplyQuiz.addEventListener('click', async () => {
    btnApplyQuiz.disabled = true;
    btnApplyQuiz.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังบันทึกชะตากรรม...';
    
    // Navigate back to main view
    showView(viewMain);
    
    if (finalQuizPickedRestaurant) {
        if (finalQuizPickedRestaurant.isNewWildcard) {
            // First time seeing this wildcard, save it as a real restaurant!
            await api.addRestaurant({
                name: finalQuizPickedRestaurant.name,
                food_category: finalQuizPickedRestaurant.food_category,
                price_range: finalQuizPickedRestaurant.price_range,
                meal_types: finalQuizPickedRestaurant.meal_types
            });
            // Reload DB to get its generated ID
            const allData = await api.getDb();
            fullAllData = allData;
            finalQuizPickedRestaurant = allData.restaurants.find(r => r.name === finalQuizPickedRestaurant.name);
        }

        // Record History as "quiz"
        await api.spin({
            username: currentUser,
            date: new Date().toISOString().split('T')[0],
            selected_restaurant_id: finalQuizPickedRestaurant.id,
            mood: finalQuizResultMeta.mood,
            energy_level: parseInt(finalQuizResultMeta.energy),
            selection_method: 'quiz',
            meal_type: finalQuizResultMeta.meal
        });
        showToast(`บันทึกผลลัพธ์ ${finalQuizPickedRestaurant.name} ลงประวัติแล้ว!`);
        refreshCurrentPick();
        await updateDashboard();
        
        // Also update Manual Grid and Wheel with the new wildcards if any
        await loadRestaurants();
        updateWheel();
        renderManualGrid();
    }
    
    // Reset quiz for next time
    setTimeout(() => {
        quizResultContainer.classList.add('hidden');
        if(quizIntroContainer) quizIntroContainer.classList.remove('hidden');
        btnApplyQuiz.disabled = false;
        btnApplyQuiz.innerHTML = 'ยอมรับชะตากรรม 🙏';
    }, 500);
});

// Start app
init();

// ================= Meal Filter Logic =================
document.querySelectorAll('.filter-meal-card').forEach(card => {
    card.addEventListener('click', () => {
        const meal = card.dataset.meal;
        if (globalFilterMeal === meal) {
            globalFilterMeal = null;
            card.classList.remove('ring-4', 'ring-sky-400');
        } else {
            globalFilterMeal = meal;
            document.querySelectorAll('.filter-meal-card').forEach(c => c.classList.remove('ring-4', 'ring-sky-400'));
            card.classList.add('ring-4', 'ring-sky-400');
        }
        renderDashboardWithCurrentState();
    });
});
