// ── State ─────────────────────────────────────────────────────
let allItems = [];
let currentFilter = 'all';
let currentCat    = null;
let currentSearch = '';
let currentSort   = 'expiry';

// ── Image map (mirrors backend) ───────────────────────────────
const ITEM_IMAGES = {
  milk:'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80',
  bread:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80',
  egg:'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&q=80',
  eggs:'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&q=80',
  butter:'https://images.unsplash.com/photo-1589985270958-a6784cc0be23?w=200&q=80',
  cheese:'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&q=80',
  yogurt:'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&q=80',
  chicken:'https://images.unsplash.com/photo-1604503468506-a8da13d11bbc?w=200&q=80',
  beef:'https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?w=200&q=80',
  fish:'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80',
  apple:'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&q=80',
  banana:'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&q=80',
  tomato:'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=200&q=80',
  onion:'https://images.unsplash.com/photo-1508747703725-719777637510?w=200&q=80',
  potato:'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&q=80',
  spinach:'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&q=80',
  rice:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&q=80',
  pasta:'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=200&q=80',
  orange:'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=200&q=80',
  carrot:'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&q=80',
  coffee:'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&q=80',
  juice:'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200&q=80',
  water:'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200&q=80',
  sugar:'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200&q=80',
  salt:'https://images.unsplash.com/photo-1574482620881-3a8ee9b48879?w=200&q=80',
  oil:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&q=80',
  flour:'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&q=80',
  lemon:'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=200&q=80',
  garlic:'https://images.unsplash.com/photo-1615478503562-ec2d8aa0e24e?w=200&q=80',
  mushroom:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80',
  mango:'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&q=80',
  strawberry:'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&q=80',
};

const CAT_IMAGES = {
  Dairy:'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&q=80',
  Produce:'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&q=80',
  Meat:'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&q=80',
  Bakery:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80',
  Frozen:'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=200&q=80',
  Pantry:'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=200&q=80',
  Beverages:'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&q=80',
  Fruits:'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&q=80',
  Vegetables:'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=200&q=80',
  Snacks:'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200&q=80',
  Other:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80',
};

const CAT_EMOJI = {
  Dairy:'🥛', Produce:'🥦', Meat:'🥩', Bakery:'🍞', Frozen:'🧊',
  Pantry:'🫙', Beverages:'🧃', Fruits:'🍎', Vegetables:'🥕', Snacks:'🍿', Other:'📦'
};

function getItemImage(name, category) {
  const lower = name.toLowerCase();
  for (const [kw, url] of Object.entries(ITEM_IMAGES)) {
    if (lower.includes(kw)) return url;
  }
  return CAT_IMAGES[category] || CAT_IMAGES.Other;
}

// ── Expiry Logic ──────────────────────────────────────────────
function getExpiryStatus(dateStr) {
  if (!dateStr) return { label: 'No Date', tier: 'none', badge: 'badge-none', days: null };
  const today = new Date(); today.setHours(0,0,0,0);
  const exp   = new Date(dateStr); exp.setHours(0,0,0,0);
  const diff  = Math.round((exp - today) / 86400000);
  if (diff < 0)  return { label: `Expired ${Math.abs(diff)}d ago`, tier:'expired',  badge:'badge-expired',  days:diff };
  if (diff === 0) return { label: 'Expires Today',                  tier:'today',    badge:'badge-today',    days:0 };
  if (diff <= 3)  return { label: `${diff}d left`,                  tier:'critical', badge:'badge-critical', days:diff };
  if (diff <= 7)  return { label: `${diff}d left`,                  tier:'soon',     badge:'badge-soon',     days:diff };
  return           { label: `${diff}d left`,                         tier:'good',     badge:'badge-good',     days:diff };
}

// ── Render ────────────────────────────────────────────────────
function renderGrid(items) {
  const grid = document.getElementById('itemGrid');
  const empty = document.getElementById('emptyState');

  // Remove existing cards
  grid.querySelectorAll('.item-card').forEach(c => c.remove());

  if (!items.length) {
    empty.style.display = 'block';
    document.getElementById('gridCount').textContent = '0 items';
    return;
  }
  empty.style.display = 'none';
  document.getElementById('gridCount').textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

  items.forEach((item, idx) => {
    const st  = getExpiryStatus(item.expiry_date);
    const img = getItemImage(item.name, item.category);
    const emoji = CAT_EMOJI[item.category] || '📦';
    const card = document.createElement('div');
    card.className = `item-card ${st.tier}`;
    card.dataset.id  = item.id;
    card.dataset.tier = st.tier;
    card.dataset.cat  = item.category;
    card.dataset.name = item.name.toLowerCase();
    card.style.animationDelay = `${idx * 0.04}s`;
    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${img}" alt="${item.name}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80'"/>
        <span class="card-emoji">${emoji}</span>
        <span class="card-badge ${st.badge}">${st.label}</span>
      </div>
      <div class="card-body">
        <div class="card-name">${item.name}</div>
        <div class="card-meta">
          <span class="card-cat">${emoji} ${item.category}</span>
          <span class="card-qty">${item.quantity} ${item.unit}</span>
        </div>
        <div class="card-expiry">📅 ${item.expiry_date || 'No date set'}</div>
        <div class="card-actions">
          <button class="btn-edit" onclick="openEdit(${item.id})">✎ Edit</button>
          <button class="btn-del"  onclick="deleteItem(${item.id}, '${item.name.replace(/'/g,"\\'")}')">✕</button>
        </div>
      </div>`;
    grid.insertBefore(card, empty);
  });
}

function applyFilters() {
  let items = [...allItems];

  // Filter by tier
  if (currentFilter !== 'all') {
    items = items.filter(i => getExpiryStatus(i.expiry_date).tier === currentFilter);
  }
  // Filter by category
  if (currentCat) {
    items = items.filter(i => i.category === currentCat);
  }
  // Search
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }
  // Sort
  const tierOrder = { expired:0, today:1, critical:2, soon:3, good:4, none:5 };
  if (currentSort === 'expiry') {
    items.sort((a,b) => {
      const ta = tierOrder[getExpiryStatus(a.expiry_date).tier] ?? 9;
      const tb = tierOrder[getExpiryStatus(b.expiry_date).tier] ?? 9;
      return ta !== tb ? ta - tb : (a.expiry_date||'').localeCompare(b.expiry_date||'');
    });
  } else if (currentSort === 'name') {
    items.sort((a,b) => a.name.localeCompare(b.name));
  } else if (currentSort === 'category') {
    items.sort((a,b) => a.category.localeCompare(b.category));
  }

  renderGrid(items);
}

// ── Stats ─────────────────────────────────────────────────────
function updateStats() {
  const stats = {
    total:    allItems.length,
    expired:  allItems.filter(i => getExpiryStatus(i.expiry_date).tier === 'expired').length,
    today:    allItems.filter(i => getExpiryStatus(i.expiry_date).tier === 'today').length,
    critical: allItems.filter(i => getExpiryStatus(i.expiry_date).tier === 'critical').length,
    good:     allItems.filter(i => ['good','none'].includes(getExpiryStatus(i.expiry_date).tier)).length,
  };
  document.getElementById('s-total').textContent    = stats.total;
  document.getElementById('s-expired').textContent  = stats.expired;
  document.getElementById('s-today').textContent    = stats.today;
  document.getElementById('s-critical').textContent = stats.critical;
  document.getElementById('s-good').textContent     = stats.good;
  document.getElementById('nav-total').textContent    = stats.total;
  document.getElementById('nav-expired').textContent  = stats.expired;
  document.getElementById('nav-today').textContent    = stats.today;
  document.getElementById('nav-critical').textContent = stats.critical;
  document.getElementById('nav-good').textContent     = stats.good;
}

// ── API ───────────────────────────────────────────────────────
async function loadItems() {
  const res = await fetch('/api/items');
  allItems = await res.json();
  updateStats();
  applyFilters();
}

async function saveItem() {
  const id   = document.getElementById('editId').value;
  const body = {
    name:        document.getElementById('fName').value.trim(),
    category:    document.getElementById('fCat').value,
    quantity:    parseFloat(document.getElementById('fQty').value) || 1,
    unit:        document.getElementById('fUnit').value.trim() || 'units',
    expiry_date: document.getElementById('fExpiry').value || null,
  };
  if (!body.name) return showToast('Name is required', 'error');

  const url    = id ? `/api/items/${id}` : '/api/items';
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if (!res.ok) return showToast('Something went wrong', 'error');

  closeModal();
  showToast(id ? `"${body.name}" updated ✓` : `"${body.name}" added ✓`, 'success');
  loadItems();
}

async function deleteItem(id, name) {
  if (!confirm(`Delete "${name}"?`)) return;
  await fetch(`/api/items/${id}`, { method: 'DELETE' });
  showToast(`"${name}" removed`, 'error');
  loadItems();
}

async function clearExpired() {
  const expired = allItems.filter(i => getExpiryStatus(i.expiry_date).tier === 'expired');
  if (!expired.length) return showToast('No expired items!', 'error');
  if (!confirm(`Remove ${expired.length} expired item(s)?`)) return;
  const res  = await fetch('/api/items/clear-expired', { method: 'DELETE' });
  const data = await res.json();
  showToast(`${data.deleted} expired item(s) cleared`, 'success');
  loadItems();
}

// ── Modal ─────────────────────────────────────────────────────
function openEdit(id) {
  const item = allItems.find(i => i.id === id);
  if (!item) return;
  document.getElementById('editId').value  = id;
  document.getElementById('fName').value   = item.name;
  document.getElementById('fCat').value    = item.category;
  document.getElementById('fQty').value    = item.quantity;
  document.getElementById('fUnit').value   = item.unit;
  document.getElementById('fExpiry').value = item.expiry_date || '';
  document.getElementById('modalTitle').textContent = 'Edit Item';
  document.getElementById('saveBtn').textContent    = 'Update Item';
  updatePreview();
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('editId').value  = '';
  document.getElementById('fName').value   = '';
  document.getElementById('fCat').value    = 'Dairy';
  document.getElementById('fQty').value    = '';
  document.getElementById('fUnit').value   = '';
  document.getElementById('fExpiry').value = '';
  document.getElementById('modalTitle').textContent = 'Add New Item';
  document.getElementById('saveBtn').textContent    = 'Add Item';
  updatePreview();
}

function updatePreview() {
  const name = document.getElementById('fName').value || 'Item Name';
  const cat  = document.getElementById('fCat').value  || 'Category';
  document.getElementById('previewName').textContent = name;
  document.getElementById('previewCat').textContent  = `${CAT_EMOJI[cat]||'📦'} ${cat}`;
  document.getElementById('previewImg').src = getItemImage(name, cat);
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, type='success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = `toast show ${type}`;
  setTimeout(() => t.className = 'toast', 3000);
}

// ── Event Listeners ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadItems();

  // Nav filters
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      el.classList.add('active');
      currentFilter = el.dataset.filter;
      currentCat    = null;
      document.querySelectorAll('.cat-item').forEach(c => c.classList.remove('active'));
      const labels = { all:'All Items', expired:'Expired', today:'Expires Today', critical:'Within 3 Days', good:'Good Items' };
      document.getElementById('gridTitle').textContent = labels[currentFilter] || 'Items';
      applyFilters();
    });
  });

  // Category filters
  document.querySelectorAll('.cat-item').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.cat-item').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      currentCat    = el.dataset.cat;
      currentFilter = 'all';
      document.getElementById('gridTitle').textContent = el.dataset.cat;
      applyFilters();
    });
  });

  // Search
  document.getElementById('searchInput').addEventListener('input', e => {
    currentSearch = e.target.value;
    applyFilters();
  });

  // Sort
  document.getElementById('sortSelect').addEventListener('change', e => {
    currentSort = e.target.value;
    applyFilters();
  });

  // Add modal
  document.getElementById('openAddModal').addEventListener('click', () => {
    closeModal();
    document.getElementById('modalOverlay').classList.add('open');
  });

  // Clear expired
  document.getElementById('clearExpiredBtn').addEventListener('click', clearExpired);

  // Close modal on overlay click
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});