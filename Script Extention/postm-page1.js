async function paste(inputElement, text) {
  try {
    inputElement.focus();
    inputElement.select();
    try {
      await navigator.clipboard.writeText(text);
      document.execCommand("paste");
    } catch (clipboardError) {
      const start = inputElement.selectionStart;
      const end = inputElement.selectionEnd;
      const value = inputElement.value;
      inputElement.value = value.substring(0, start) + text + value.substring(end);
      inputElement.selectionStart = inputElement.selectionEnd = start + text.length;
      inputElement.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
      composed: true
    });
    inputElement.dispatchEvent(enterEvent);
    return true;
  } catch (error) {
    console.error("Paste failed:", error);
    return false;
  }
}
function safeQuerySelector(root, selector) {
  try {
    return (root || document).querySelector(selector) || null;
  } catch {
    return null;
  }
}

function safeQuerySelectorAll(root, selector) {
  try {
    return Array.from((root || document).querySelectorAll(selector) || []);
  } catch {
    return [];
  }
}

function getSpanByContent(prefix = 'u/', rootSelector = 'rpl-dropdown', tag = 'span') {
  const root = safeQuerySelector(document, rootSelector);
  if (!root) return null;

  const elements = safeQuerySelectorAll(root, tag);
  const match = elements.find(el =>
    el.textContent?.trim().startsWith(prefix)
  );

  return match ? match.textContent.trim() : null;
}
async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
async function simulateTyping(el, text, opts = {}) {
  const { pressEnter = false, base = 70, jitter = 40 } = opts;

  const humanDelay = () =>
    Math.max(0, Math.round(base + (Math.random() * 2 - 1) * jitter));

  const isEditable = el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el.isContentEditable;

  if (!isEditable) throw new Error('Element is not editable');

  // Focus and clear
  el.focus();
  if (el.isContentEditable) el.textContent = '';
  else el.value = '';

  // One initial "beforeinput" to hint intent (optional but cheap)
  el.dispatchEvent(new InputEvent('beforeinput', {
    inputType: 'insertText',
    data: text,
    bubbles: true,
    cancelable: true
  }));

  for (const ch of text) {
    // Key down
    el.dispatchEvent(new KeyboardEvent('keydown', {
      key: ch,
      code: ch.length === 1 ? `Key${ch.toUpperCase()}` : undefined,
      bubbles: true,
      cancelable: true,
      composed: true
    }));

    // Mutate value/content
    if (el.isContentEditable) {
      el.textContent += ch;
    } else {
      el.value += ch;
    }

    // Fire input
    el.dispatchEvent(new InputEvent('input', {
      inputType: 'insertText',
      data: ch,
      bubbles: true
    }));

    // Key up
    el.dispatchEvent(new KeyboardEvent('keyup', {
      key: ch,
      code: ch.length === 1 ? `Key${ch.toUpperCase()}` : undefined,
      bubbles: true,
      cancelable: true,
      composed: true
    }));

    await sleep(humanDelay());
  }

  // Ensure final value is set & notify listeners
  if (el.isContentEditable) {
    if (el.textContent !== text) el.textContent = text;
  } else {
    if (el.value !== text) el.value = text;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  //if (pressEnter)
  //{
  // Press Enter (keydown + keyup) at the end
  ['keydown', 'keyup'].forEach(type =>
    el.dispatchEvent(new KeyboardEvent(type, {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  );
  //}

  return true;
}

function deepQuerySelector(selector, root = document) {
  const el = root.querySelector(selector);
  if (el) return el;

  // Search inside any open shadow roots
  const elems = root.querySelectorAll('*');
  for (const elem of elems) {
    if (elem.shadowRoot) {
      const found = deepQuerySelector(selector, elem.shadowRoot);
      if (found) return found;
    }
  }
  return null;
}
window.dqs = deepQuerySelector

function getUsername() {
  const userSpan = Array.from(
    document.querySelector('rpl-dropdown ').querySelectorAll('span')
  ).find(el => el.textContent.trim().startsWith('u/'));
  const username = userSpan.textContent.trim();
  return username;
}

function clickOnAva(){
  document.querySelector('rpl-dropdown div').click()
}

function search(name){
  const searchInput = deepQuerySelector('faceplate-search-input').shadowRoot.querySelector('input');
  (async () => {
    //await simulateTyping(searchInput, name, { pressEnter: true });
    await paste(searchInput, name);
    await sleep(3000);
    const foundEl = getSpanByContent('reddit-search-large',name,"span")
    //foundEl.click();
    console.log("Done", foundEl);

  })();
  console.log(searchInput);
}


document.onreadystatechange = function () {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    //clickOnAva();
    search('r/newyorkNine');

    setTimeout(() => {
      // const username = getUsername();
      // console.log('username', username);
    }, 1000);
  }
};
