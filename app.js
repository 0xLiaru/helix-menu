// Helix Bar & Drink - Kategori Odaklı Mobil QR Menü

const CATEGORY_CARDS = [
  {
    id: "cocktails",
    name: "Kokteyller & İmzalar",
    nameEn: "Cocktails & Signatures",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=85",
    subtitle: "Özel imza kokteyller, klasikler, sour & ferahlatıcı lezzetler",
    subtitleEn: "Signature craft cocktails, classics & sour drinks"
  },
  {
    id: "beers",
    name: "Biralar (Fıçı & Şişe)",
    nameEn: "Draft & Bottled Beers",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=900&q=85",
    subtitle: "Soğuk fıçı biralar, Frederik kraft serisi, yerli ve ithal şişeler",
    subtitleEn: "Cold draft beers, craft selections & premium bottles"
  },
  {
    id: "spirits",
    name: "Viski, Votka, Cin & Rom",
    nameEn: "Whiskey, Vodka, Gin & Rum",
    image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=900&q=85",
    subtitle: "Single malt & harman viskiler, premium cinler, votka ve romlar",
    subtitleEn: "Single malt & blended whiskeys, premium gins, vodkas & rums"
  },
  {
    id: "wines",
    name: "Şaraplar & Vermutlar",
    nameEn: "Wines & Vermouths",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=85",
    subtitle: "Bozcaada yöresi kadeh & şişe şaraplar, İtalyan ve Fransız vermutları",
    subtitleEn: "Local Bozcaada wines by glass & bottle, premium vermouths"
  },
  {
    id: "shots",
    name: "Shotlar & Likörler",
    nameEn: "Shots & Liqueurs",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=85",
    subtitle: "Tekila shotlar, Jägermeister, B-52, Valhalla ve parti serileri",
    subtitleEn: "Tequila shots, Jägermeister, B-52, Valhalla & party specials"
  },
  {
    id: "food",
    name: "Mutfak & Atıştırmalık",
    nameEn: "Kitchen & Bar Bites",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85",
    subtitle: "Çıtır tavuk sepetleri, kalamar tava, kaşık patates ve soslar",
    subtitleEn: "Crispy chicken platters, calamari, seasoned fries & dips"
  },
  {
    id: "non-alcoholic",
    name: "Alkolsüz İçecekler",
    nameEn: "Non-Alcoholic Drinks",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=85",
    subtitle: "Tazeleyici mocktailler, espresso kahveler, Red Bull ve meşrubatlar",
    subtitleEn: "Craft mocktails, espresso coffee, Red Bull & soft drinks"
  }
];

let state = {
  lang: 'tr', // 'tr' | 'en'
  view: 'categories', // 'categories' | 'products'
  currentCategory: null,
  subTypeFilter: 'all',
  products: MENU_DATA.products
};

const I18N = {
  tr: {
    backToCategories: "Kategoriler",
    emptySearch: "Bu kategoride ürün bulunamadı.",
    close: "Kapat",
    currency: "₺",
    itemCount: "çeşit",
    all: "Tümü"
  },
  en: {
    backToCategories: "Categories",
    emptySearch: "No items found in this category.",
    close: "Close",
    currency: "₺",
    itemCount: "items",
    all: "All"
  }
};

document.addEventListener('DOMContentLoaded', () => {
  renderCategoryCards();
  setupEventListeners();
});

// Resim İşleyici: Beyaz arka planları transparan yaparken içeceği parlak ve net tutar
window.processDrinkImage = function(img) {
  if (!img) return;
  if (img.dataset.processed === 'true') return;

  const run = () => {
    try {
      if (!img.naturalWidth || !img.naturalHeight) return;
      img.dataset.processed = 'true';

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Köşeleri kontrol et: 4 köşeden en az 3'ü beyaz veya çok açıksa şişe dekupe görselidir
      const w = canvas.width;
      const h = canvas.height;
      const cornerIndices = [
        0,
        (w - 1) * 4,
        ((h - 1) * w) * 4,
        (((h - 1) * w) + (w - 1)) * 4
      ];

      let lightCount = 0;
      for (const idx of cornerIndices) {
        if (data[idx] > 218 && data[idx + 1] > 218 && data[idx + 2] > 218) {
          lightCount++;
        }
      }

      if (lightCount >= 3) {
        // Beyaz arka planı transparan yap (yumuşak kenar geçişi ile)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const minVal = Math.min(r, g, b);

          if (r > 215 && g > 215 && b > 215) {
            if (minVal > 238) {
              data[i + 3] = 0;
            } else {
              data[i + 3] = Math.round(((238 - minVal) / 23) * 255);
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
        img.src = canvas.toDataURL('image/png');
        img.classList.add('bottle-fit');
      }
    } catch (err) {
      // CORS veya canvas okuma durumunda resim parlak kalmaya devam eder
      img.classList.add('bottle-fit');
    }
  };

  if (img.complete) {
    run();
  } else {
    img.onload = run;
  }
};

// 1. Ana Ekran: Kategori Kartlarını Render Et
function renderCategoryCards() {
  const container = document.getElementById('category-cards-container');
  if (!container) return;
  const isTr = state.lang === 'tr';

  container.innerHTML = CATEGORY_CARDS.map(cat => {
    const count = state.products.filter(p => p.categoryId === cat.id).length;
    const title = isTr ? cat.name : cat.nameEn;
    const subtitle = isTr ? cat.subtitle : cat.subtitleEn;

    return `
      <div 
        onclick="openCategory('${cat.id}')"
        class="category-card h-44 flex flex-col justify-end p-4 group"
      >
        <!-- Arka Plan Kapak Resmi -->
        <img 
          src="${cat.image}" 
          alt="${title}"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=85'"
          class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        <!-- Karartma Gradyanı -->
        <div class="cover-overlay"></div>

        <!-- Üst Sağ: Çeşit Sayısı -->
        <div class="absolute top-3 right-3.5 z-10">
          <span class="bg-black/60 backdrop-blur-md border border-white/10 text-stone-300 text-[10px] px-2.5 py-1 rounded-lg font-mono">
            ${count} ${I18N[state.lang].itemCount}
          </span>
        </div>

        <!-- Alt Bilgi: Kategori Başlığı ve Açıklama -->
        <div class="relative z-10">
          <div class="flex items-center justify-between">
            <h3 class="font-display font-extrabold text-white text-lg group-hover:text-amber-400 transition-colors">
              ${title}
            </h3>
            <span class="w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-xs group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </div>
          <p class="text-stone-300/80 text-xs mt-0.5 line-clamp-1">
            ${subtitle}
          </p>
        </div>
      </div>
    `;
  }).join('');
}

// Bir Kategori Seçildiğinde Ürün Görünümüne Geç
window.openCategory = function(catId) {
  state.currentCategory = catId;
  state.subTypeFilter = 'all';
  state.view = 'products';

  document.getElementById('home-categories-view').classList.add('hidden');
  document.getElementById('products-view').classList.remove('hidden');

  const catObj = CATEGORY_CARDS.find(c => c.id === catId);
  const isTr = state.lang === 'tr';
  if (catObj) {
    document.getElementById('current-category-title').textContent = isTr ? catObj.name : catObj.nameEn;
  }

  renderSubFilters();
  renderProducts();

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Kategoriler Ana Sayfasına Geri Dön
window.showHomeCategories = function() {
  state.view = 'categories';
  state.currentCategory = null;

  document.getElementById('products-view').classList.add('hidden');
  document.getElementById('home-categories-view').classList.remove('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Alt Filtreler (Her kategori için akıllı ve ilgili filtreler)
function renderSubFilters() {
  const container = document.getElementById('sub-filters-container');
  if (!container) return;

  let options = [];

  if (state.currentCategory === 'spirits') {
    options = [
      { id: 'all', label: 'Tümü' },
      { id: 'Viski', label: 'Viski' },
      { id: 'Cin', label: 'Cin' },
      { id: 'Votka', label: 'Votka' },
      { id: 'Rom', label: 'Rom' },
      { id: 'Konyak', label: 'Konyak' },
      { id: 'Mezcal', label: 'Mezcal' }
    ];
  } else if (state.currentCategory === 'beers') {
    options = [
      { id: 'all', label: 'Tümü' },
      { id: 'Fıçı Bira', label: 'Fıçı Biralar' },
      { id: 'Şişe Bira', label: 'Şişe Biralar' }
    ];
  } else if (state.currentCategory === 'wines') {
    options = [
      { id: 'all', label: 'Tümü' },
      { id: 'Şarap', label: 'Şaraplar' },
      { id: 'Vermut', label: 'Vermut & Aperitif' }
    ];
  } else if (state.currentCategory === 'shots') {
    options = [
      { id: 'all', label: 'Tümü' },
      { id: 'Shot', label: 'Shotlar' },
      { id: 'Likör', label: 'Likörler' },
      { id: 'Mezcal', label: 'Mezcaller' }
    ];
  } else if (state.currentCategory === 'food') {
    options = [
      { id: 'all', label: 'Tümü' },
      { id: 'Başlangıç', label: 'Sıcaklar & Sepetler' },
      { id: 'Çerez', label: 'Çerez & Turşu' }
    ];
  } else if (state.currentCategory === 'non-alcoholic') {
    options = [
      { id: 'all', label: 'Tümü' },
      { id: 'Mocktail', label: 'Mocktailler' },
      { id: 'Kahve', label: 'Kahveler' },
      { id: 'Meşrubat', label: 'Meşrubat & Enerji' }
    ];
  }

  if (options.length > 0) {
    container.classList.remove('hidden');
    container.innerHTML = options.map(opt => `
      <button 
        onclick="selectSubType('${opt.id}')"
        class="flex-shrink-0 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
          state.subTypeFilter === opt.id 
            ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20' 
            : 'bg-stone-900 border border-stone-800 text-stone-300 hover:text-white'
        }"
      >
        ${opt.label}
      </button>
    `).join('');
  } else {
    container.classList.add('hidden');
    state.subTypeFilter = 'all';
  }
}

window.selectSubType = function(subType) {
  state.subTypeFilter = subType;
  renderSubFilters();
  renderProducts();
};

// Ürün Kartlarını Render Et
function renderProducts() {
  const container = document.getElementById('products-grid');
  const isTr = state.lang === 'tr';
  const t = I18N[state.lang];

  let filtered = state.products.filter(item => {
    if (state.currentCategory && item.categoryId !== state.currentCategory) {
      return false;
    }
    if (state.subTypeFilter !== 'all' && item.subType !== state.subTypeFilter) {
      return false;
    }
    return true;
  });

  const countEl = document.getElementById('category-count-text');
  if (countEl) {
    countEl.textContent = `${filtered.length} ${t.itemCount}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 px-4">
        <p class="text-stone-400 text-xs">${t.emptySearch}</p>
        <button onclick="showHomeCategories()" class="mt-3 text-xs text-amber-400 hover:underline">
          ${t.backToCategories}
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const title = isTr ? item.name : item.nameEn;
    const desc = isTr ? item.description : item.descriptionEn;
    const hasImage = !!item.image && item.image.trim() !== '';

    return `
      <div 
        onclick="openProductDetail('${item.id}')"
        class="glass-card rounded-2xl p-3 flex gap-3.5 items-center cursor-pointer ${
          !item.inStock ? 'out-of-stock' : ''
        }"
      >
        ${hasImage ? `
          <div class="bottle-thumb">
            <img 
              src="${item.image}" 
              alt="${title}" 
              loading="lazy"
              crossorigin="anonymous"
              onload="processDrinkImage(this)"
              onerror="this.parentElement.style.display='none'"
            />
          </div>
        ` : ''}

        <!-- Bilgiler -->
        <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <div class="flex items-baseline justify-between gap-2">
              <h3 class="font-bold text-white text-[13.5px] leading-snug">
                ${title}
              </h3>
              <span class="text-amber-400 font-extrabold text-sm whitespace-nowrap ml-2 font-mono">
                ${item.price} ${t.currency}
              </span>
            </div>
            ${desc ? `
              <p class="text-stone-400 text-xs line-clamp-2 mt-1 leading-snug font-normal">
                ${desc}
              </p>
            ` : ''}
          </div>

          <div class="flex items-center gap-2 mt-1.5">
            ${item.volume ? `
              <span class="text-[10px] text-stone-500 font-mono">${item.volume}</span>
            ` : ''}
            ${item.subType ? `
              <span class="badge-sub text-[9px] font-semibold px-2 py-0.5 rounded-md">
                ${item.subType}
              </span>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Dil Değiştirme
window.toggleLanguage = function() {
  state.lang = state.lang === 'tr' ? 'en' : 'tr';
  document.getElementById('lang-toggle-btn').textContent = state.lang === 'tr' ? 'EN' : 'TR';
  document.getElementById('back-to-categories-text').textContent = I18N[state.lang].backToCategories;

  renderCategoryCards();
  if (state.view === 'products' && state.currentCategory) {
    const catObj = CATEGORY_CARDS.find(c => c.id === state.currentCategory);
    if (catObj) {
      document.getElementById('current-category-title').textContent = state.lang === 'tr' ? catObj.name : catObj.nameEn;
    }
    renderSubFilters();
    renderProducts();
  }
};

// Ürün Detay Modalı
window.openProductDetail = function(productId) {
  const item = state.products.find(p => p.id === productId);
  if (!item) return;

  const isTr = state.lang === 'tr';
  const t = I18N[state.lang];
  const title = isTr ? item.name : item.nameEn;
  const desc = isTr ? item.description : item.descriptionEn;
  const hasImage = !!item.image && item.image.trim() !== '';

  const modalHtml = `
    <div class="relative max-w-lg w-full bottom-sheet p-6 text-left max-h-[85vh] overflow-y-auto">
      <button onclick="closeModal()" class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-stone-900/90 border border-stone-700 text-stone-300 hover:text-white flex items-center justify-center">
        ✕
      </button>

      ${hasImage ? `
        <div class="modal-bottle-img relative -mx-6 -mt-6 mb-4">
          <img 
            src="${item.image}" 
            alt="${title}" 
            crossorigin="anonymous"
            onload="processDrinkImage(this)"
            onerror="this.parentElement.style.display='none'" 
          />
        </div>
      ` : ''}

      <div class="flex items-baseline justify-between gap-3 mb-2 pt-2">
        <h2 class="text-xl font-bold text-white font-display">${title}</h2>
        <span class="text-2xl font-black text-amber-400 whitespace-nowrap font-mono">${item.price} ${t.currency}</span>
      </div>

      <div class="flex items-center gap-2 mb-3 text-xs text-stone-400">
        ${item.subType ? `<span class="badge-sub px-2.5 py-0.5 rounded text-[11px] font-medium">${item.subType}</span>` : ''}
        ${item.volume ? `<span class="bg-stone-800 px-2 py-0.5 rounded text-stone-300 font-mono">${item.volume}</span>` : ''}
      </div>

      ${desc ? `
        <p class="text-stone-300 text-xs leading-relaxed my-3 font-normal">
          ${desc}
        </p>
      ` : ''}
    </div>
  `;

  showModal(modalHtml);
};

function showModal(contentHtml) {
  const container = document.getElementById('modal-container');
  const body = document.getElementById('modal-body');
  body.innerHTML = contentHtml;
  container.classList.remove('hidden');
  container.classList.add('flex');
}

window.closeModal = function() {
  const container = document.getElementById('modal-container');
  container.classList.add('hidden');
  container.classList.remove('flex');
};

function setupEventListeners() {
  const backdrop = document.getElementById('modal-container');
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
}
