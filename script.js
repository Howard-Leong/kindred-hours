(() => {
  'use strict';

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const blocks = [];
  let framePending = false;

  function wrapText(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const fragment = document.createDocumentFragment();
      for (const token of node.textContent.split(/(\s+)/)) {
        if (!token) continue;
        if (/^\s+$/.test(token)) {
          fragment.append(document.createTextNode(token));
          continue;
        }
        const word = document.createElement('span');
        word.className = 'reveal-word';
        for (const character of token) {
          const letter = document.createElement('span');
          letter.className = 'reveal-char';
          letter.textContent = character;
          word.append(letter);
        }
        fragment.append(word);
      }
      node.replaceWith(fragment);
      return;
    }
    for (const child of [...node.childNodes]) wrapText(child);
  }

  for (const element of document.querySelectorAll('[data-reveal]')) {
    // Keep an unbroken copy for assistive technology, without reading each letter.
    const accessibleText = document.createElement('span');
    accessibleText.className = 'sr-only';
    const visualText = document.createElement('span');
    visualText.setAttribute('aria-hidden', 'true');
    for (const child of [...element.childNodes]) {
      accessibleText.append(child.cloneNode(true));
      visualText.append(child);
    }
    // Only the original, accessible telephone link belongs in the tab order.
    for (const link of visualText.querySelectorAll('a')) link.tabIndex = -1;
    for (const phrase of accessibleText.querySelectorAll('.kindred-phrase')) {
      phrase.classList.remove('kindred-phrase');
    }
    wrapText(visualText);
    element.append(accessibleText, visualText);
    blocks.push({
      element,
      letters: [...visualText.querySelectorAll('.reveal-char')],
      phrases: [...visualText.querySelectorAll('.kindred-phrase')],
      count: 0,
    });
  }

  function update() {
    framePending = false;
    const height = window.innerHeight;
    const atBottom = window.scrollY + height >= document.documentElement.scrollHeight - 2;
    // Read layout before writing styles to avoid repeated layout calculation.
    const bounds = blocks.map(({ element }) => element.getBoundingClientRect());

    blocks.forEach((block, index) => {
      const rect = bounds[index];
      const progress = motionPreference.matches || atBottom ? 1 :
        Math.max(0, Math.min(1, (height * 0.88 - rect.top) / (rect.height + height * 0.3)));
      // Keep already-read text illuminated when scrolling back up.
      const count = Math.max(block.count, Math.ceil(progress * block.letters.length));
      for (let i = block.count; i < count; i++) block.letters[i].classList.add('is-visible');
      block.count = count;
      for (const phrase of block.phrases) {
        const lastLetter = phrase.querySelector('.reveal-word:last-child .reveal-char:last-child');
        if (lastLetter?.classList.contains('is-visible')) phrase.classList.add('is-awake');
      }
    });
  }

  function scheduleUpdate() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  motionPreference.addEventListener('change', scheduleUpdate);
  update();
})();