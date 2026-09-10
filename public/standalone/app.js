// Fixit Bhera - Pure Vanilla JavaScript Application (Zero Dummy Data)
const WHATSAPP_NUM = '923007864321';
let currentLang = 'en';

const SERVICES = [
  {
    id: 'electrician',
    nameEn: 'Electrician',
    nameUr: 'الیکٹریشن',
    taglineEn: 'Wiring, Ceiling Fan, Geyser, Breakers & Short Circuit',
    taglineUr: 'وائرنگ، پنکھا، گیزر، بریکر، شارٹ سرکٹ فالٹ',
    priceEn: '1,500 - 3,500 PKR',
    priceUr: '1500 سے 3500 روپے',
    icon: '⚡'
  },
  {
    id: 'plumber',
    nameEn: 'Plumber',
    nameUr: 'پلمبر',
    taglineEn: 'Pipe Leakage, Water Tanki, Donkey Pump & Taps',
    taglineUr: 'پائپ لیکیج، پانی کی ٹینکی، ڈونکی پمپ اور ٹونٹی مرمت',
    priceEn: '1,500 - 3,500 PKR',
    priceUr: '1500 سے 3500 روپے',
    icon: '🔧'
  },
  {
    id: 'ac-technician',
    nameEn: 'AC Technician',
    nameUr: 'اے سی ٹیکنیشن',
    taglineEn: 'Master Pressure Wash, Gas Refill & Split AC Installation',
    taglineUr: 'پریشر واش سروس، گیس چارجنگ اور سپلٹ اے سی فٹنگ',
    priceEn: '2,000 - 4,500 PKR',
    priceUr: '2000 سے 4500 روپے',
    icon: '❄️'
  },
  {
    id: 'appliance-repair',
    nameEn: 'Appliance Repair',
    nameUr: 'گھریلو مشینری',
    taglineEn: 'Refrigerator Cooling, Washing Machine & Microwave Repair',
    taglineUr: 'فریج کولنگ، واشنگ مشین موٹر اور مائیکروویو مرمت',
    priceEn: '1,800 - 4,000 PKR',
    priceUr: '1800 سے 4000 روپے',
    icon: '🔌'
  },
  {
    id: 'home-cleaning',
    nameEn: 'Home Cleaning',
    nameUr: 'گھر کی صفائی',
    taglineEn: 'Deep Home Cleaning, Sofa/Carpet Foam Wash & Water Tank',
    taglineUr: 'ڈیپ ہوم کلیننگ، صوفہ/قالین واش اور ٹینکی صفائی',
    priceEn: '2,500 - 5,500 PKR',
    priceUr: '2500 سے 5500 روپے',
    icon: '✨'
  }
];

const AREAS = [
  { id: 'bhera-city', nameEn: 'Bhera City (All 8 Gates)', nameUr: 'بھیرہ شہر (تمام 8 تاریخی دروازے)', etaEn: '30-45 mins', etaUr: '30 سے 45 منٹ' },
  { id: 'miani', nameEn: 'Miani', nameUr: 'میانی موضع', etaEn: '45-60 mins', etaUr: '45 سے 60 منٹ' },
  { id: 'hazurpur', nameEn: 'Hazurpur', nameUr: 'حضور پور', etaEn: '45-60 mins', etaUr: '45 سے 60 منٹ' },
  { id: 'zain-pur', nameEn: 'Zain Pur', nameUr: 'زین پور', etaEn: '50-65 mins', etaUr: '50 سے 65 منٹ' },
  { id: 'ali-pur', nameEn: 'Ali Pur', nameUr: 'علی پور', etaEn: '50-65 mins', etaUr: '50 سے 65 منٹ' },
  { id: 'melowal', nameEn: 'Melowal', nameUr: 'میلووال', etaEn: '55-70 mins', etaUr: '55 سے 70 منٹ' },
  { id: 'rakh-chargah', nameEn: 'Rakh Chargah', nameUr: 'رکھ چراگاہ', etaEn: '55-75 mins', etaUr: '55 سے 75 منٹ' }
];

function renderServices() {
  const container = document.getElementById('services-container');
  if (!container) return;
  const isUr = currentLang === 'ur';

  container.innerHTML = SERVICES.map(s => `
    <div class="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 hover:border-amber-400 hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div class="text-3xl mb-3">${s.icon}</div>
        <h3 class="text-lg font-extrabold text-neutral-900">${isUr ? s.nameUr : s.nameEn}</h3>
        <p class="text-xs text-neutral-600 mt-1 mb-4 leading-relaxed">${isUr ? s.taglineUr : s.taglineEn}</p>
        <div class="text-xs font-mono font-bold text-amber-700 mb-4 bg-amber-50 inline-block px-2.5 py-1 rounded-md">
          ${isUr ? s.priceUr : s.priceEn}
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200/60">
        <button onclick="openBookingModal('${s.id}')" class="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer">
          ${isUr ? 'بک کریں' : 'Book Now'}
        </button>
        <a href="https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent((isUr ? 'السلام علیکم فکس اِٹ بھیرہ! مجھے کاریگر درکار ہے: ' : 'Assalam-o-Alaikum Fixit Bhera! I need technician for: ') + (isUr ? s.nameUr : s.nameEn))}" target="_blank" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs text-center flex items-center justify-center gap-1 transition">
          <span>💬</span>
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  `).join('');
}

function renderAreas() {
  const container = document.getElementById('areas-container');
  if (!container) return;
  const isUr = currentLang === 'ur';

  container.innerHTML = AREAS.map(a => `
    <button onclick="openBookingModal(undefined, '${a.id}')" class="bg-neutral-50 hover:bg-amber-50/70 border border-neutral-200 hover:border-amber-400 rounded-xl p-3.5 text-left transition cursor-pointer group">
      <div class="flex items-center gap-1.5 text-xs font-bold text-neutral-900 group-hover:text-amber-700">
        <span>📍</span>
        <span>${isUr ? a.nameUr : a.nameEn}</span>
      </div>
      <div class="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
        <span>⏱️</span>
        <span>${isUr ? a.etaUr : a.etaEn}</span>
      </div>
    </button>
  `).join('');
}

function renderCustomerReviews() {
  const container = document.getElementById('user-reviews-list');
  if (!container) return;
  const isUr = currentLang === 'ur';

  let reviews = [];
  try {
    const raw = localStorage.getItem('fixit_bhera_user_reviews');
    if (raw) reviews = JSON.parse(raw);
  } catch (e) {}

  if (reviews.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-8 text-center text-xs sm:text-sm text-neutral-500 bg-white rounded-2xl border border-neutral-200 p-6">
        <p class="font-semibold text-neutral-700 mb-1">
          ${isUr ? 'کوئی بناوٹی یا فرضی ریویو نہیں رکھا گیا ہے۔' : 'Zero dummy or fake reviews.'}
        </p>
        <p>${isUr ? 'کام مکمل ہونے کے بعد اوپر "ریویو درج کریں" پر کلک کر کے اپنا سچا تجربہ شیئر کریں۔' : 'Click "Write a Review" above to submit your genuine feedback after service.'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = reviews.map(r => `
    <div class="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2.5">
      <div class="flex items-center justify-between">
        <div class="text-amber-400 text-xs">${'⭐'.repeat(r.rating || 5)}</div>
        <span class="text-[10px] text-neutral-400">${r.date || 'Recent'}</span>
      </div>
      <p class="text-xs text-neutral-700 italic">"${r.comment}"</p>
      <div class="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
        <span class="font-bold text-neutral-900">${r.name}</span>
        <span class="text-neutral-500 text-[11px]">${r.area} • ${r.service}</span>
      </div>
    </div>
  `).join('');
}

function toggleLang() {
  currentLang = currentLang === 'en' ? 'ur' : 'en';
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ur' ? 'rtl' : 'ltr';

  const label = document.getElementById('lang-btn-label');
  if (label) label.textContent = currentLang === 'en' ? 'اردو (Urdu)' : 'English';

  const isUr = currentLang === 'ur';

  // Update text
  const updates = [
    { id: 'txt-live-status', en: 'Active technicians on duty in Bhera City & villages', ur: 'آج بھیرہ شہر اور دیہات میں کاریگر ڈیوٹی پر موجود ہیں' },
    { id: 'txt-arrival-promise', en: '1-Hour Doorstep Arrival Guarantee', ur: '1 گھنٹے میں دہلیز پر آمد کی گارنٹی' },
    { id: 'txt-cash-promise', en: '100% Cash After Work (Zero Advance)', ur: '100% کام کے بعد کیش (کوئی ایڈوانس نہیں)' },
    { id: 'brand-title', en: 'Fixit Bhera', ur: 'فکس اِٹ بھیرہ' },
    { id: 'brand-sub', en: 'Doorstep service within 1 hour', ur: '1 گھنٹے میں کاریگر آپ کے گھر' },
    { id: 'nav-services', en: 'Our Services', ur: 'سروسز' },
    { id: 'nav-how', en: 'How It Works', ur: 'کام کا طریقہ' },
    { id: 'nav-areas', en: 'Villages & Coverage', ur: 'دیہات و علاقے' },
    { id: 'nav-reviews', en: 'Customer Feedback', ur: 'عوامی آراء' },
    { id: 'btn-book-nav', en: 'Book Service', ur: 'کاریگر بلوائیں' },
    { id: 'hero-badge', en: 'Serving Bhera City, Miani, Hazurpur, Zain Pur, Ali Pur, Melowal & all local villages', ur: 'بھیرہ شہر، میانی، حضور پور، زین پور، علی پور، میلووال اور تمام مواضعات' },
    { id: 'hero-desc', en: 'Electrician, Plumber, AC Technician, Fridge & Washing Machine Repair. Standard rates, CNIC-verified local technicians, and cash payment after completion.', ur: 'الیکٹریشن، پلمبر، اے سی ٹیکنیشن، گھریلو مشینری اور گھر کی صفائی۔ مناسب ریٹ، شناختی کارڈ تصدیق شدہ کاریگر اور کام کے بعد کیش ادائیگی۔' },
    { id: 'hero-btn-book', en: '🛠️ Book Service Online', ur: '🛠️ آن لائن سروس بک کریں' },
    { id: 'hero-btn-wa', en: 'Instant WhatsApp', ur: 'فوری واٹس ایپ' },
    { id: 'services-heading', en: 'Most Requested Home Services in Bhera', ur: 'بھیرہ کے لیے 5 بنیادی سروسز' },
    { id: 'services-sub', en: 'Equipped with specialized tools and authentic hardware parts at your doorstep', ur: 'شناختی کارڈ تصدیق شدہ تجربہ کار مقامی کاریگر، واضح ریٹس اور گارنٹی شدہ کام۔' }
  ];

  updates.forEach(u => {
    const el = document.getElementById(u.id);
    if (el) el.textContent = isUr ? u.ur : u.en;
  });

  renderServices();
  renderAreas();
  renderCustomerReviews();
}

function openBookingModal(serviceId, areaId) {
  const modal = document.getElementById('booking-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  if (serviceId) {
    const sel = document.getElementById('modal-service-select');
    if (sel) sel.value = serviceId;
  }
  if (areaId) {
    const selArea = document.getElementById('modal-area-select');
    if (selArea) selArea.value = areaId;
  }
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function handleBookingSubmit(e) {
  e.preventDefault();
  const service = document.getElementById('modal-service-select').value;
  const area = document.getElementById('modal-area-select').value;
  const name = document.getElementById('modal-name').value.trim();
  const phone = document.getElementById('modal-phone').value.trim();
  const address = document.getElementById('modal-address').value.trim();

  const isUr = currentLang === 'ur';

  const msg = isUr
    ? `السلام علیکم فکس اِٹ بھیرہ!\nمجھے کاریگر کی ضرورت ہے: *${service}*\nعلاقہ / گاؤں: *${area}*\nایڈریس: ${address}\nنام: ${name}\nفون: ${phone}\nادائیگی: کیش آن سروس`
    : `Assalam-o-Alaikum Fixit Bhera!\nI need a technician for: *${service}*\nArea/Village: *${area}*\nAddress: ${address}\nCustomer Name: ${name}\nPhone: ${phone}\nPayment: Cash on Service`;

  window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`, '_blank');
  closeBookingModal();
}

function openFeedbackModal() {
  const modal = document.getElementById('feedback-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeFeedbackModal() {
  const modal = document.getElementById('feedback-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleReviewSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('rev-name').value.trim();
  const area = document.getElementById('rev-area').value;
  const service = document.getElementById('rev-service').value;
  const rating = parseInt(document.getElementById('rev-rating').value, 10) || 5;
  const comment = document.getElementById('rev-comment').value.trim();

  const newRev = {
    id: 'rev-' + Date.now(),
    name,
    area,
    service,
    rating,
    comment,
    date: currentLang === 'ur' ? 'آج' : 'Just now'
  };

  let reviews = [];
  try {
    const raw = localStorage.getItem('fixit_bhera_user_reviews');
    if (raw) reviews = JSON.parse(raw);
  } catch (err) {}

  reviews.unshift(newRev);
  localStorage.setItem('fixit_bhera_user_reviews', JSON.stringify(reviews));

  closeFeedbackModal();
  renderCustomerReviews();
  alert(currentLang === 'ur' ? 'آپ کی رائے درج کر لی گئی ہے۔ شکریہ!' : 'Thank you! Your review has been saved.');
}

document.addEventListener('DOMContentLoaded', () => {
  renderServices();
  renderAreas();
  renderCustomerReviews();

  const langBtn = document.getElementById('btn-lang-toggle');
  if (langBtn) langBtn.addEventListener('click', toggleLang);
});
