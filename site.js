/* Lista Pronta — landing page behaviour.
   Progressive enhancement: the page is complete and readable in PT without JS.
   No frameworks, no external calls. */
(function () {
  'use strict';

  var LANGS = ['pt', 'en', 'es'];
  var STORE_KEY = 'lp-lang';

  var DICT = {
    pt: {
      lang: 'pt-BR',
      title: 'Lista Pronta — a lista de compras que a casa inteira usa junto',
      skip: 'Ir para o conteúdo',
      nav_label: 'Principal', lang_label: 'Idioma',
      nav_how: 'Como funciona', nav_share: 'Compartilhar',
      cta: 'Baixar no Google Play', cta_short: 'Baixar', see_how: 'Ver como funciona',
      badge_alt: 'Disponível no Google Play', badge_img: 'google-play-badge-pt-br.svg',
      hero_tag: 'A família toda na mesma lista',
      hero_h: 'A lista de compras que a casa inteira usa junto.',
      hero_p: 'Compartilhe sua lista com família e amigos. Anotem e marquem os itens juntos, de um jeito fácil e conectado.',
      hero_note: 'Grátis · Android',
      card_title: 'Mercado da semana', of: 'de',
      items: ['Leite integral', 'Pão de forma', 'Ovos', 'Banana', 'Café', 'Detergente'],
      add_item: 'Adicionar item',
      how_k: 'Como funciona', how_h: 'Três passos. É só isso.',
      how_p: 'Crie sua lista. Adicione itens. Marque o que comprou.',
      how_1: 'Suas listas', how_2: 'Seus itens', how_3: 'Itens comprados',
      share_k: 'Compartilhe', share_h: 'Uma lista só, sempre atualizada para todos.',
      share_p: 'Convide pelo link e todo mundo passa a ver a mesma lista, ao vivo. Alguém adicionou ou marcou um item? Aparece na hora no celular de cada um, sem precisar avisar ninguém.',
      who: 'Quem está na lista · 4', you: 'Você',
      roles: ['Criou a lista', 'Entrou ontem', 'Entrou hoje', 'Entrou hoje'],
      invite: 'Convidar pelo link',
      invite_hint: 'Quem abrir o link entra na lista e vê tudo na hora.',
      add_k: 'Adicione itens', add_h: 'Cole uma receita e a IA monta a lista.',
      add_p: 'Cole o texto de uma receita, fale os itens ou tire uma foto da lista de papel: a IA entende, separa os itens e você só confere. Prefere digitar? Duas letras e a sugestão aparece.',
      add_placeholder: 'O que vamos comprar?', ai_title: 'Adicionar com IA',
      ai_text: 'Colar texto', ai_voice: 'Falar', ai_photo: 'Foto', suggested: 'Sugeridos',
      chips: ['Leite', 'Pão de forma', 'Ovos', 'Café', 'Arroz', 'Banana', 'Feijão', 'Açúcar', 'Papel toalha'],
      det_k: 'Detalhes', det_h: 'Quer mais detalhes? A lista acompanha.',
      det_p: 'Adicione quantidade, unidade e preço a cada item. Com os preços ligados, a lista mostra quanto falta, quanto já foi e o total da compra. Toque nos itens para ver.',
      missing: 'Faltam', done: 'Prontos', total: 'Total',
      edit_title: 'Editar item', qty: 'Qtd.', unit: 'Unidade', price: 'Preço',
      save: 'Salvar', cancel: 'Cancelar', 'delete': 'Apagar item',
      category: 'Categoria', edit_name_label: 'Nome do item',
      det_names: ['Leite integral', 'Pão de forma', 'Tomate', 'Café', 'Arroz'],
      det_units: [['litros', 'L'], ['', ''], ['kg', 'kg'], ['', ''], ['kg', 'kg']],
      final_h: 'Pronto para a próxima compra?', final_p: 'Grátis para Android.',
      privacy: 'Privacidade', terms: 'Termos de uso'
    },
    en: {
      lang: 'en',
      title: 'Lista Pronta — the shopping list your whole home uses together',
      skip: 'Skip to content',
      nav_label: 'Main', lang_label: 'Language',
      nav_how: 'How it works', nav_share: 'Share',
      cta: 'Get it on Google Play', cta_short: 'Get the app', see_how: 'See how it works',
      badge_alt: 'Get it on Google Play', badge_img: 'google-play-badge-en.png',
      hero_tag: 'The whole family on one list',
      hero_h: 'The shopping list your whole home uses together.',
      hero_p: 'Share your list with family and friends. Add and check off items together, the easy, connected way.',
      hero_note: 'Free · Android',
      card_title: 'Weekly groceries', of: 'of',
      items: ['Whole milk', 'Sliced bread', 'Eggs', 'Bananas', 'Coffee', 'Dish soap'],
      add_item: 'Add item',
      how_k: 'How it works', how_h: 'Three steps. That’s it.',
      how_p: 'Create your list. Add items. Check off what you bought.',
      how_1: 'Your lists', how_2: 'Your items', how_3: 'Bought items',
      share_k: 'Share', share_h: 'One list, always up to date for everyone.',
      share_p: 'Invite with a link and everyone sees the same list, live. Someone added or checked an item? It shows up right away on every phone, no need to tell anyone.',
      who: 'Who’s on the list · 4', you: 'You',
      roles: ['Created the list', 'Joined yesterday', 'Joined today', 'Joined today'],
      invite: 'Invite with a link',
      invite_hint: 'Anyone who opens the link joins the list and sees everything right away.',
      add_k: 'Add items', add_h: 'Paste a recipe and AI builds the list.',
      add_p: 'Paste the text of a recipe, say the items out loud or take a photo of a paper list: AI works out the items and you just review them. Prefer typing? Two letters and the suggestion appears.',
      add_placeholder: 'What are we buying?', ai_title: 'Add with AI',
      ai_text: 'Paste text', ai_voice: 'Speak', ai_photo: 'Photo', suggested: 'Suggested',
      chips: ['Milk', 'Sliced bread', 'Eggs', 'Coffee', 'Rice', 'Bananas', 'Beans', 'Sugar', 'Paper towels'],
      det_k: 'Details', det_h: 'Want more detail? The list keeps up.',
      det_p: 'Add a quantity, a unit and a price to any item. With prices on, the list shows what’s left, what’s done and the total for the shop. Tap the items to see it.',
      missing: 'To buy', done: 'Done', total: 'Total',
      edit_title: 'Edit item', qty: 'Qty.', unit: 'Unit', price: 'Price',
      save: 'Save', cancel: 'Cancel', 'delete': 'Delete item',
      category: 'Category', edit_name_label: 'Item name',
      det_names: ['Whole milk', 'Sliced bread', 'Tomatoes', 'Coffee', 'Rice'],
      det_units: [['liters', 'L'], ['', ''], ['kg', 'kg'], ['', ''], ['kg', 'kg']],
      final_h: 'Ready for the next shop?', final_p: 'Free for Android.',
      privacy: 'Privacy', terms: 'Terms of use'
    },
    es: {
      lang: 'es',
      title: 'Lista Pronta — la lista de compras que toda la casa usa junta',
      skip: 'Ir al contenido',
      nav_label: 'Principal', lang_label: 'Idioma',
      nav_how: 'Cómo funciona', nav_share: 'Compartir',
      cta: 'Descargar en Google Play', cta_short: 'Descargar', see_how: 'Ver cómo funciona',
      badge_alt: 'Disponible en Google Play', badge_img: 'google-play-badge-es.svg',
      hero_tag: 'Toda la familia en la misma lista',
      hero_h: 'La lista de compras que toda la casa usa junta.',
      hero_p: 'Comparte tu lista con familia y amigos. Anoten y marquen los productos juntos, de forma fácil y conectada.',
      hero_note: 'Gratis · Android',
      card_title: 'Compra de la semana', of: 'de',
      items: ['Leche entera', 'Pan de molde', 'Huevos', 'Plátanos', 'Café', 'Lavavajillas'],
      add_item: 'Agregar producto',
      how_k: 'Cómo funciona', how_h: 'Tres pasos. Nada más.',
      how_p: 'Crea tu lista. Agrega productos. Marca lo que compraste.',
      how_1: 'Tus listas', how_2: 'Tus productos', how_3: 'Productos comprados',
      share_k: 'Comparte', share_h: 'Una sola lista, siempre al día para todos.',
      share_p: 'Invita por enlace y todos ven la misma lista, en vivo. ¿Alguien agregó o marcó un producto? Aparece al instante en el celular de cada uno, sin avisar a nadie.',
      who: 'Quién está en la lista · 4', you: 'Tú',
      roles: ['Creó la lista', 'Entró ayer', 'Entró hoy', 'Entró hoy'],
      invite: 'Invitar por enlace',
      invite_hint: 'Quien abra el enlace entra en la lista y ve todo al instante.',
      add_k: 'Agrega productos', add_h: 'Pega una receta y la IA arma la lista.',
      add_p: 'Pega el texto de una receta, di los productos en voz alta o toma una foto de la lista en papel: la IA reconoce los productos y tú solo los revisas. ¿Prefieres escribir? Dos letras y aparece la sugerencia.',
      add_placeholder: '¿Qué vamos a comprar?', ai_title: 'Agregar con IA',
      ai_text: 'Pegar texto', ai_voice: 'Hablar', ai_photo: 'Foto', suggested: 'Sugeridos',
      chips: ['Leche', 'Pan de molde', 'Huevos', 'Café', 'Arroz', 'Plátanos', 'Frijoles', 'Azúcar', 'Papel de cocina'],
      det_k: 'Detalles', det_h: '¿Quieres más detalle? La lista te sigue.',
      det_p: 'Agrega cantidad, unidad y precio a cada producto. Con los precios activados, la lista muestra cuánto falta, cuánto ya está y el total de la compra. Toca los productos para verlo.',
      missing: 'Faltan', done: 'Listos', total: 'Total',
      edit_title: 'Editar producto', qty: 'Cant.', unit: 'Unidad', price: 'Precio',
      save: 'Guardar', cancel: 'Cancelar', 'delete': 'Eliminar producto',
      category: 'Categoría', edit_name_label: 'Nombre del producto',
      det_names: ['Leche entera', 'Pan de molde', 'Tomates', 'Café', 'Arroz'],
      det_units: [['litros', 'L'], ['', ''], ['kg', 'kg'], ['', ''], ['kg', 'kg']],
      final_h: '¿Listo para la próxima compra?', final_p: 'Gratis para Android.',
      privacy: 'Privacidad', terms: 'Términos de uso'
    }
  };

  var DET_STICKERS = ['dairy', 'bakery_breakfast', 'vegetables', 'beverages', 'grains_legumes'];

  /* ------------------------------------------------------------ helpers */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function lookup(dict, path) {
    var parts = path.split('.');
    var cur = dict;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return null;
      cur = cur[parts[i]];
    }
    return typeof cur === 'string' ? cur : null;
  }

  function money(cents) {
    return 'R$ ' + (Math.round(cents) / 100).toFixed(2).replace('.', ',');
  }

  function parseNumber(text) {
    var cleaned = String(text).replace(/[^0-9.,]/g, '');
    if (!cleaned) return NaN;
    var lastComma = cleaned.lastIndexOf(',');
    var lastDot = cleaned.lastIndexOf('.');
    var cut = Math.max(lastComma, lastDot);
    var intPart, fracPart;
    if (cut === -1) { intPart = cleaned; fracPart = ''; }
    else { intPart = cleaned.slice(0, cut); fracPart = cleaned.slice(cut + 1); }
    intPart = intPart.replace(/[.,]/g, '');
    fracPart = fracPart.replace(/[.,]/g, '');
    var n = parseFloat((intPart || '0') + (fracPart ? '.' + fracPart : ''));
    return isNaN(n) ? NaN : n;
  }

  function numberText(n) {
    return (Math.round(n * 1000) / 1000).toString().replace('.', ',');
  }

  function pop(scope) {
    var mark = scope.querySelector('.pop');
    if (!mark) return;
    mark.classList.remove('pop');
    void mark.offsetWidth;
    mark.classList.add('pop');
  }

  function safeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }

  /* -------------------------------------------------------------- state */
  var hero = [true, true, true, false, false, false];

  var det = {
    checked: [false, false, false, true, true],
    qty: [2, 1, 1, 1, 5],
    unitPrice: [649, 990, 890, 1890, 498],   // cents, per unit
    names: DICT.pt.det_names.slice(),
    unitsLong: ['litros', '', 'kg', '', 'kg'],
    unitsShort: ['L', '', 'kg', '', 'kg'],
    dirty: { name: [], qty: [], price: [], unit: [] },
    selected: 0
  };

  var lang = 'pt';

  /* ----------------------------------------------------------- language */
  function readLang() {
    var q = null;
    try {
      var params = new URLSearchParams(window.location.search);
      q = params.get('lang');
    } catch (e) { /* older browser */ }
    if (!q && window.location.hash) q = window.location.hash.replace('#', '');
    if (q) q = q.toLowerCase().slice(0, 2);
    if (LANGS.indexOf(q) !== -1) return q;
    var stored = safeGet(STORE_KEY);
    if (LANGS.indexOf(stored) !== -1) return stored;
    return 'pt';
  }

  function buildPills() {
    $$('[data-langs]').forEach(function (box) {
      box.textContent = '';
      LANGS.forEach(function (code) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'lang';
        b.textContent = code.toUpperCase();
        b.setAttribute('data-lang', code);
        b.setAttribute('lang', DICT[code].lang);
        b.addEventListener('click', function () { setLang(code, true); });
        box.appendChild(b);
      });
    });
  }

  function applyDictionary() {
    var d = DICT[lang];
    $$('[data-i18n]').forEach(function (el) {
      var value = lookup(d, el.getAttribute('data-i18n'));
      if (value !== null) el.textContent = value;
    });
    $$('[data-i18n-aria-label]').forEach(function (el) {
      var value = lookup(d, el.getAttribute('data-i18n-aria-label'));
      if (value !== null) el.setAttribute('aria-label', value);
    });
    $$('[data-i18n-alt]').forEach(function (el) {
      var value = lookup(d, el.getAttribute('data-i18n-alt'));
      if (value !== null) el.setAttribute('alt', value);
    });
    $$('[data-play-badge]').forEach(function (el) {
      if (d.badge_img) el.setAttribute('src', (el.getAttribute('data-badge-base') || '') + d.badge_img);
    });
    document.documentElement.setAttribute('lang', d.lang);
    if (d.title) document.title = d.title;
    $$('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
  }

  function setLang(code, persist) {
    if (LANGS.indexOf(code) === -1) return;
    lang = code;
    if (persist) safeSet(STORE_KEY, code);
    applyDictionary();
    adoptLanguageIntoDetails();
    renderHero();
    renderDetails();
    loadEditor();
  }

  function adoptLanguageIntoDetails() {
    var d = DICT[lang];
    for (var i = 0; i < 5; i++) {
      if (!det.dirty.name[i]) det.names[i] = d.det_names[i];
      if (!det.dirty.unit[i]) {
        det.unitsLong[i] = d.det_units[i][0];
        det.unitsShort[i] = d.det_units[i][1];
      }
    }
  }

  /* --------------------------------------------------------------- hero */
  var heroRows = $$('[data-hero]');
  var heroProgress = $('#hero-progress');
  var heroCount = $('#hero-count');

  function renderHero() {
    var done = 0;
    heroRows.forEach(function (row, i) {
      var on = hero[i];
      row.setAttribute('aria-checked', on ? 'true' : 'false');
      row.setAttribute('data-checked', on ? 'true' : 'false');
      if (on) done++;
    });
    if (heroProgress) heroProgress.style.width = Math.round(done / hero.length * 100) + '%';
    if (heroCount) heroCount.textContent = done + ' ' + DICT[lang].of + ' ' + hero.length;
  }

  heroRows.forEach(function (row, i) {
    row.addEventListener('click', function () {
      hero[i] = !hero[i];
      renderHero();
      if (hero[i]) pop(row);
    });
  });

  /* ------------------------------------------------------------ details */
  var detRows = {};
  $$('[data-det]').forEach(function (row) { detRows[row.getAttribute('data-det')] = row; });
  var missingBox = $('#det-rows-missing');
  var doneBox = $('#det-rows-done');
  var editor = {
    name: $('#editor-name'),
    qty: $('#editor-qty'),
    unit: $('#editor-unit'),
    price: $('#editor-price'),
    badge: $('#editor-badge'),
    save: $('#editor-save')
  };

  function rowTotal(i) { return Math.round(det.unitPrice[i] * det.qty[i]); }

  function qtyLabel(i) {
    var short = det.unitsShort[i];
    if (!short && det.qty[i] === 1) return '';
    return (numberText(det.qty[i]) + ' ' + short).trim();
  }

  function place(container, rows) {
    if (!container) return;
    var current = Array.prototype.slice.call(container.children);
    var same = current.length === rows.length && rows.every(function (r, k) { return current[k] === r; });
    if (same) return;
    rows.forEach(function (r) { container.appendChild(r); });
  }

  function renderDetails() {
    var missing = 0, done = 0, nMissing = 0, nDone = 0;
    var toMissing = [], toDone = [];
    for (var i = 0; i < 5; i++) {
      var row = detRows[i];
      if (!row) continue;
      var on = det.checked[i];
      row.setAttribute('data-checked', on ? 'true' : 'false');
      var check = row.querySelector('.row__check');
      if (check) check.setAttribute('aria-checked', on ? 'true' : 'false');
      var nameEl = row.querySelector('.row__name');
      if (nameEl) nameEl.textContent = det.names[i];
      var qtyEl = row.querySelector('.row__qty');
      if (qtyEl) qtyEl.textContent = qtyLabel(i);
      var priceEl = row.querySelector('.row__price');
      if (priceEl) priceEl.textContent = money(rowTotal(i));
      row.classList.toggle('row--selected', i === det.selected);

      if (on) { toDone.push(row); done += rowTotal(i); nDone++; }
      else { toMissing.push(row); missing += rowTotal(i); nMissing++; }
    }
    place(missingBox, toMissing);
    place(doneBox, toDone);
    $('#det-n-missing').textContent = String(nMissing);
    $('#det-n-done').textContent = String(nDone);
    $('#det-sum-missing').textContent = money(missing);
    $('#det-sum-done').textContent = money(done);
    $('#det-sum-total').textContent = money(missing + done);
  }

  function loadEditor() {
    var i = det.selected;
    if (!editor.name) return;
    editor.name.value = det.names[i];
    editor.qty.value = numberText(det.qty[i]);
    editor.unit.value = det.unitsLong[i];
    editor.price.value = money(det.unitPrice[i]);
    var img = editor.badge && editor.badge.querySelector('img');
    if (img) img.setAttribute('src', 'assets/cat_' + DET_STICKERS[i] + '.webp');
  }

  $$('[data-det] .row__check').forEach(function (btn) {
    var i = parseInt(btn.parentNode.getAttribute('data-det'), 10);
    btn.addEventListener('click', function () {
      det.checked[i] = !det.checked[i];
      renderDetails();
      if (det.checked[i]) pop(btn);
    });
  });

  $$('[data-select]').forEach(function (btn) {
    var i = parseInt(btn.getAttribute('data-select'), 10);
    btn.addEventListener('click', function () {
      det.selected = i;
      loadEditor();
      renderDetails();
    });
  });

  if (editor.name) {
    editor.name.addEventListener('input', function () {
      var i = det.selected;
      det.names[i] = editor.name.value;
      det.dirty.name[i] = true;
      renderDetails();
    });
    editor.qty.addEventListener('input', function () {
      var i = det.selected;
      var n = parseNumber(editor.qty.value);
      if (isNaN(n) || n < 0) return;
      det.qty[i] = n;
      det.dirty.qty[i] = true;
      renderDetails();
    });
    editor.unit.addEventListener('input', function () {
      var i = det.selected;
      det.unitsLong[i] = editor.unit.value;
      det.unitsShort[i] = editor.unit.value;
      det.dirty.unit[i] = true;
      renderDetails();
    });
    editor.price.addEventListener('input', function () {
      var i = det.selected;
      var n = parseNumber(editor.price.value);
      if (isNaN(n) || n < 0) return;
      det.unitPrice[i] = Math.round(n * 100);
      det.dirty.price[i] = true;
      renderDetails();
    });
    editor.price.addEventListener('blur', function () {
      editor.price.value = money(det.unitPrice[det.selected]);
    });
    if (editor.save) {
      editor.save.addEventListener('click', function () {
        // The values are already live; "Salvar" simply keeps them.
        loadEditor();
        renderDetails();
      });
    }
  }

  /* -------------------------------------------------------------- start */
  buildPills();
  lang = readLang();
  setLang(lang, false);
  loadEditor();

  window.addEventListener('hashchange', function () {
    var code = window.location.hash.replace('#', '').toLowerCase().slice(0, 2);
    if (LANGS.indexOf(code) !== -1) setLang(code, true);
  });
}());
