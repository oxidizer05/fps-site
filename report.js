(() => {
  const API = 'https://fps-girls-discord-bot-production.up.railway.app/api/report';
  const $ = id => document.getElementById(id);
  const openedAt = Date.now();
  const copy = {
    ru: {
      title: 'Сообщить о проблеме — FPS Girls', support: 'Помощь', heading: 'Что пошло не так?',
      intro: 'Ошибка на сайте, сложности со входом в чаты или верификацией? Расскажи — сообщение получат наши модераторы в Telegram.',
      kind: 'С чем нужна помощь?', bug: 'Ошибка на сайте', access: 'Вступление в чаты / верификация', other: 'Другая трудность',
      description: 'Что случилось?', descriptionHint: 'От 20 до 2000 символов. Опиши шаги, чтобы мы могли повторить проблему.',
      descriptionPlaceholder: 'На каком шаге возникла проблема? Что ожидала увидеть и что произошло?',
      screenshot: 'Скриншот · необязательно', screenshotHint: 'PNG, JPG или WebP до 5 МБ. Перед отправкой скрой личные данные на изображении.',
      screenshotAlt: 'Превью скриншота', removeScreenshot: 'Убрать скриншот', preparing: 'Готовим изображение…',
      page: 'На какой странице?', pageHint: 'Подставили страницу, с которой ты пришла. Можно изменить, например: /join.',
      contact: 'Куда ответить? · необязательно', contactHint: 'Если хочешь получить ответ, оставь контакт. Можно отправить и без него.',
      contactPlaceholder: '@telegram, email или Discord',
      privacy: 'Текст, скриншот, контакт, адрес страницы и данные браузера получат только модераторы FPS Girls. Не отправляй пароли, коды входа, документы и другие секреты.',
      submit: 'Отправить проблему', sending: 'Отправляем…', doneTitle: 'Сообщение у модераторов',
      done: 'Спасибо! Мы посмотрим, что произошло. Если оставила контакт, сможем связаться с тобой. Ответ может занять время.',
      home: 'На главную', back: '← На главную',
      errors: { description: 'Опиши проблему: от 20 до 2000 символов.', contact: 'Контакт должен быть не длиннее 120 символов.', page: 'Укажи путь страницы, например /join, без адреса другого сайта.', slow: 'Подожди пару секунд и отправь ещё раз.', rate: 'Слишком много обращений. Попробуй позже — лимит 3 в час.', network: 'Не удалось подтвердить доставку. Текст и выбранный скриншот остались в форме — попробуй отправить ещё раз.', unavailable: 'Отправка сейчас недоступна. Текст и выбранный скриншот остались в форме — попробуй позже.', screenshot: 'Не удалось прочитать скриншот. Выбери PNG, JPG или WebP до 5 МБ либо убери вложение.', screenshotSize: 'Изображение слишком большое или вытянутое. Обрежь его до проблемной области либо убери вложение.' },
    },
    en: {
      title: 'Report a problem — FPS Girls', support: 'Help', heading: 'What went wrong?',
      intro: 'Something broken on the site, or trouble joining chats or getting verified? Let us know — our moderators will receive your message in Telegram.',
      kind: 'What do you need help with?', bug: 'Website bug', access: 'Joining chats / verification', other: 'Something else',
      description: 'What happened?', descriptionHint: '20–2000 characters. Describe the steps so we can reproduce the problem.',
      descriptionPlaceholder: 'At which step did the problem occur? What did you expect and what actually happened?',
      screenshot: 'Screenshot · optional', screenshotHint: 'PNG, JPG or WebP, up to 5 MB. Hide any personal information in the image before sending.',
      screenshotAlt: 'Screenshot preview', removeScreenshot: 'Remove screenshot', preparing: 'Preparing image…',
      page: 'Which page?', pageHint: 'Filled in the page you came from. You can change it, for example: /join.',
      contact: 'Where can we reply? · optional', contactHint: 'Leave a contact if you would like a reply. You can also send anonymously.',
      contactPlaceholder: '@telegram, email or Discord',
      privacy: 'Only FPS Girls moderators will receive the text, screenshot, contact, page address and browser details. Do not send passwords, login codes, documents or other secrets.',
      submit: 'Send report', sending: 'Sending…', doneTitle: 'Your message reached the moderators',
      done: 'Thank you! We will look into it. If you left a contact, we can get back to you. A reply may take some time.',
      home: 'Back to home', back: '← Back to home',
      errors: { description: 'Describe the problem in 20–2000 characters.', contact: 'Keep your contact under 120 characters.', page: 'Enter a page path such as /join, without another website address.', slow: 'Wait a couple of seconds and try again.', rate: 'Too many reports. Please try later — the limit is 3 per hour.', network: 'Could not confirm delivery. Your text and selected screenshot are still in the form — please try sending again.', unavailable: 'Sending is temporarily unavailable. Your text and selected screenshot are still in the form — please try later.', screenshot: 'Could not read the screenshot. Choose a PNG, JPG or WebP up to 5 MB, or remove the attachment.', screenshotSize: 'The image is too large or too long. Crop it to the problem area, or remove the attachment.' },
    },
  };
  let lang = 'ru';
  let busy = false;
  let errorCode = '';
  let lastData = '';
  let requestId = '';
  let screenshot = null;
  let screenshotError = '';
  let preparing = false;
  let selection = 0;
  let previewUrl = '';

  function updateSubmit() {
    $('submit').disabled = busy || preparing;
    $('submit').textContent = busy ? copy[lang].sending : preparing ? copy[lang].preparing : copy[lang].submit;
    $('screenshot').disabled = busy;
    $('screenshot-remove').disabled = busy;
  }

  function setLang(value) {
    lang = value === 'en' ? 'en' : 'ru';
    const t = copy[lang];
    document.documentElement.lang = lang;
    document.title = t.title;
    document.querySelectorAll('[data-text]').forEach(el => { el.textContent = t[el.dataset.text]; });
    document.querySelectorAll('[data-lang]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.lang === lang)));
    $('description').placeholder = t.descriptionPlaceholder;
    $('contact').placeholder = t.contactPlaceholder;
    $('screenshot-image').alt = t.screenshotAlt;
    updateSubmit();
    $('status').textContent = errorCode ? (t.errors[errorCode] || t.errors.network) : '';
    try { localStorage.setItem('fpsg-lang', lang); } catch { /* Storage can be disabled. */ }
  }
  document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
  let saved;
  try { saved = localStorage.getItem('fpsg-lang'); } catch { /* Storage can be disabled. */ }
  setLang(saved || (/^(ru|be|kk|ky|uz|tg)\b/i.test(navigator.language) ? 'ru' : 'en'));

  try {
    const from = new URLSearchParams(location.search).get('from');
    if (from && from.startsWith('/') && from.length <= 240) {
      const url = new URL(from, location.origin);
      if (url.origin === location.origin) $('page').value = url.pathname;
    }
  } catch { /* Use the home page for malformed source URLs. */ }

  function showError(code) {
    errorCode = code;
    $('status').textContent = copy[lang].errors[code] || copy[lang].errors.network;
    const field = ['description', 'contact', 'page'].includes(code) && $(code);
    (field || $('status')).focus();
  }

  function clearScreenshot(keepInput = false) {
    selection++;
    screenshot = null;
    screenshotError = '';
    preparing = false;
    if (!keepInput) $('screenshot').value = '';
    $('screenshot-preview').hidden = true;
    $('screenshot-image').hidden = true;
    $('screenshot-image').removeAttribute('src');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = '';
    if (errorCode.startsWith('screenshot')) { errorCode = ''; $('status').textContent = ''; }
    updateSubmit();
  }

  async function prepareImage(file) {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('screenshot');
    if (file.size > 5 * 1024 * 1024) throw new Error('screenshotSize');
    const source = URL.createObjectURL(file);
    const image = new Image();
    try {
      image.src = source;
      await image.decode();
      const w = image.naturalWidth, h = image.naturalHeight;
      if (!w || !h || w * h > 40000000 || Math.max(w, h) / Math.min(w, h) > 20) throw new Error('screenshotSize');
      const scale = Math.min(1, 2560 / Math.max(w, h));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('screenshot');
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      let blob;
      for (const quality of [.88, .7, .5]) {
        blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
        if (!blob) throw new Error('screenshot');
        if (blob.size <= 2 * 1024 * 1024) break;
      }
      if (blob.size > 2 * 1024 * 1024) throw new Error('screenshotSize');
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('screenshot'));
        reader.readAsDataURL(blob);
      });
      return { blob, data: { type: 'image/jpeg', data: dataUrl.split(',')[1] } };
    } finally { URL.revokeObjectURL(source); }
  }

  $('screenshot-remove').addEventListener('click', () => { clearScreenshot(); $('screenshot').focus(); });
  $('screenshot').addEventListener('change', async () => {
    const file = $('screenshot').files[0];
    // Clear the previous preview while retaining the new file selection.
    clearScreenshot(true);
    if (!file) return;
    const version = selection;
    preparing = true;
    $('screenshot-preview').hidden = false;
    updateSubmit();
    try {
      const prepared = await prepareImage(file);
      if (version !== selection) return;
      screenshot = prepared.data;
      previewUrl = URL.createObjectURL(prepared.blob);
      $('screenshot-image').src = previewUrl;
      $('screenshot-image').hidden = false;
    } catch (err) {
      if (version !== selection) return;
      screenshotError = err.message === 'screenshotSize' ? 'screenshotSize' : 'screenshot';
      showError(screenshotError);
    } finally {
      if (version === selection) { preparing = false; updateSubmit(); }
    }
  });

  $('report-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || preparing) return;
    if (screenshotError) return showError(screenshotError);
    errorCode = '';
    $('status').textContent = '';
    const data = {
      kind: $('kind').value, description: $('description').value.trim(), contact: $('contact').value.trim(),
      page: $('page').value.trim(), lang, screenshot: screenshot || undefined,
    };
    if (data.description.length < 20) return showError('description');
    try {
      const url = new URL(data.page, location.origin);
      if (!data.page.startsWith('/') || url.origin !== location.origin) return showError('page');
      data.page = url.pathname;
    } catch { return showError('page'); }
    if (Date.now() - openedAt < 3000) return showError('slow');
    busy = true;
    updateSubmit();
    try {
      const serialized = JSON.stringify(data);
      if (serialized !== lastData || !requestId) { requestId = crypto.randomUUID(); lastData = serialized; }
      const response = await fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: requestId, website: $('website').value, elapsed: Date.now() - openedAt }),
        signal: AbortSignal.timeout(35000),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.ok === true) {
        $('report-form').reset();
        clearScreenshot();
        $('report-form').hidden = true;
        $('done').hidden = false;
        $('done-title').tabIndex = -1;
        $('done-title').focus();
      } else { showError(result.error || 'network'); }
    } catch { showError('network'); }
    finally { busy = false; updateSubmit(); }
  });
})();
