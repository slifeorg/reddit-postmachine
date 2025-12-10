var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
if (!window.abilities) {
  class RCElements {
    constructor() {
      __publicField(this, "app", () => {
        const direct = document.querySelector("body > shreddit-app");
        if (direct) return direct.shadowRoot ?? direct;
        const nested = document.querySelector("body > faceplate-app > rs-app");
        if (nested) return nested.shadowRoot ?? nested;
        return null;
      });
      __publicField(this, "roomsNav", () => {
        var _a, _b;
        return ((_b = (_a = this.app()) == null ? void 0 : _a.querySelector("rs-rooms-nav")) == null ? void 0 : _b.shadowRoot) || null;
      });
      __publicField(this, "virtualScroll", () => {
        var _a;
        return ((_a = this.roomsNav()) == null ? void 0 : _a.querySelector("rs-virtual-scroll")) || null;
      });
      __publicField(this, "virtualScrollScroller", () => {
        var _a;
        return ((_a = this.virtualScroll()) == null ? void 0 : _a.shadowRoot) || null;
      });
      __publicField(this, "roomOverlay", () => {
        const app = this.app();
        if (!app) return null;
        const selectors = [
          "rs-room",
          "div.container > rs-page-overlay-manager > rs-room",
          "rs-page-overlay-manager > rs-room",
          "rs-room-invite",
          'div[role="dialog"]',
          'div[data-testid="room-overlay"]'
        ];
        for (const selector of selectors) {
          const element = app.querySelector(selector);
          if (element) {
            return element.shadowRoot || element;
          }
        }
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            return element.shadowRoot || element;
          }
        }
        return null;
      });
      __publicField(this, "requestsViewScroller", () => {
        var _a, _b;
        const requestsView = (_a = this.app()) == null ? void 0 : _a.querySelector("rs-requests-view");
        return ((_b = requestsView == null ? void 0 : requestsView.shadowRoot) == null ? void 0 : _b.querySelector("rs-virtual-scroll")) || null;
      });
      __publicField(this, "composer", () => {
        var _a, _b;
        return ((_b = (_a = this.roomOverlay()) == null ? void 0 : _a.querySelector("rs-message-composer-old, rs-message-composer")) == null ? void 0 : _b.shadowRoot) || null;
      });
      __publicField(this, "messageInput", () => {
        const root = this.composer();
        if (!root) return null;
        return root.querySelector('textarea[name="message"]') || root.querySelector("form input, form textarea") || null;
      });
      __publicField(this, "requestsButton", () => {
        var _a, _b;
        return ((_a = this.roomsNav()) == null ? void 0 : _a.querySelector('li[data-testid="requests-button"], li[aria-label="Requests"]')) || ((_b = this.virtualScrollScroller()) == null ? void 0 : _b.querySelector('li[data-testid="requests-button"], li[aria-label="Requests"]')) || null;
      });
      __publicField(this, "submitButton", () => {
        var _a;
        return ((_a = this.composer()) == null ? void 0 : _a.querySelector("form > button.button-send")) || null;
      });
      __publicField(this, "fileButton", () => {
        var _a;
        return ((_a = this.composer()) == null ? void 0 : _a.querySelector("form > button:nth-child(1)")) || null;
      });
      __publicField(this, "roomList", () => {
        var _a;
        return ((_a = this.app()) == null ? void 0 : _a.querySelector("rs-rooms-nav rs-virtual-scroll")) || null;
      });
      __publicField(this, "backToMain", () => {
        var _a;
        return ((_a = this.roomsNav()) == null ? void 0 : _a.querySelector("div:nth-of-type(2) button")) || null;
      });
      __publicField(this, "rooms", () => {
        var _a;
        return ((_a = this.app()) == null ? void 0 : _a.querySelectorAll("rs-rooms-nav rs-virtual-scroll rs-rooms-nav-room")) || null;
      });
    }
    getRequestView(roomId) {
      var _a, _b, _c, _d;
      const overlay = (_a = this.app()) == null ? void 0 : _a.querySelector("div.container > rs-page-overlay-manager, rs-page-overlay-manager");
      const vs = (_d = (_c = (_b = overlay == null ? void 0 : overlay.querySelector("rs-requests-view")) == null ? void 0 : _b.shadowRoot) == null ? void 0 : _c.querySelector("rs-virtual-scroll")) == null ? void 0 : _d.shadowRoot;
      if (!vs) return null;
      if (!roomId) {
        const allRequests = vs.querySelectorAll("rs-roving-focus-wrapper > rs-requests-view-request, rs-requests-view-request");
        if (allRequests.length === 0) return null;
        const firstRequest = allRequests[0];
        roomId = firstRequest.getAttribute("room");
        if (!roomId) return null;
      }
      return vs.querySelector(`rs-roving-focus-wrapper > rs-requests-view-request[room="${roomId}"]`) || vs.querySelector(`rs-requests-view-request[room="${roomId}"]`);
    }
    viewRequestButton(roomId) {
      const request = this.getRequestView(roomId);
      if (!request) return null;
      const root = request.shadowRoot ?? request;
      return root.querySelector('button[data-testid="accept"]') || root.querySelectorAll("div .button")[2] || null;
    }
  }
  const elements = new RCElements();
  const abilities = {
    scrollUntilFound: async (scrollableElement, getTarget, pageIncrement = 80, maxAttempts = 100, sleepTime = 1e3) => {
      let attempts = 0;
      const totalHeight = scrollableElement.scrollHeight;
      const getRandomized = (base, variation = 0.3) => {
        const delta = base * variation;
        return base + (Math.random() * 2 - 1) * delta;
      };
      while (scrollableElement.scrollTop < totalHeight && attempts < maxAttempts) {
        const target = getTarget();
        if (target) return target;
        const prev = scrollableElement.scrollTop;
        const randomizedIncrement = getRandomized(pageIncrement);
        scrollableElement.scrollTop += randomizedIncrement;
        const randomizedSleep = getRandomized(sleepTime);
        await abilities.sleep(randomizedSleep);
        if (Math.random() < 0.2) {
          const smallJitter = Math.random() * 10 - 5;
          scrollableElement.scrollTop += smallJitter;
        }
        if (prev === scrollableElement.scrollTop) break;
        attempts++;
      }
      return getTarget();
    },
    sleep: (ms) => {
      var _a, _b;
      return ((_b = (_a = window.clockModule) == null ? void 0 : _a.instance) == null ? void 0 : _b.sleep(ms)) || new Promise((resolve) => setTimeout(resolve, ms));
    },
    rndm: (max) => Math.floor(Math.random() * max),
    elements,
    scroll: {
      toTop: () => {
        const vs = elements.virtualScroll();
        if (vs) vs.scrollTop = 0;
      }
    },
    read: {
      getDisplayName: () => {
        var _a;
        const currentUser = (_a = elements.app()) == null ? void 0 : _a.querySelector("rs-current-user");
        return (currentUser == null ? void 0 : currentUser.getAttribute("display-name")) || null;
      }
    },
    navigate: {},
    type: {
      async paste(inputElement, text) {
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
      },
      simulateTyping: async (inputElement, text) => {
        inputElement.focus();
        inputElement.dispatchEvent(new InputEvent("beforeinput", {
          inputType: "insertText",
          data: text,
          bubbles: true
        }));
        inputElement.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
        const humanDelay = (base = 80, variance = 40) => {
          const v = Math.max(0, (Math.random() * 2 - 1) * variance + base);
          return Math.round(v);
        };
        inputElement.value = "";
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (i > 0 && i % 5 === 0) {
            inputElement.dispatchEvent(new CompositionEvent("compositionupdate", {
              data: text.slice(0, i),
              bubbles: true
            }));
          }
          const keyCode = char.charCodeAt(0);
          const events = [
            new KeyboardEvent("keydown", {
              key: char,
              code: `Key${char.toUpperCase()}`,
              keyCode,
              which: keyCode,
              bubbles: true,
              cancelable: true,
              composed: true
            }),
            new KeyboardEvent("keypress", {
              key: char,
              code: `Key${char.toUpperCase()}`,
              keyCode,
              which: keyCode,
              bubbles: true,
              cancelable: true,
              composed: true
            }),
            new KeyboardEvent("keyup", {
              key: char,
              code: `Key${char.toUpperCase()}`,
              keyCode,
              which: keyCode,
              bubbles: true,
              cancelable: true,
              composed: true
            })
          ];
          inputElement.dispatchEvent(events[0]);
          inputElement.value += char;
          inputElement.dispatchEvent(new InputEvent("input", { bubbles: true }));
          inputElement.dispatchEvent(events[1]);
          await abilities.sleep(humanDelay());
          inputElement.dispatchEvent(events[2]);
          await abilities.sleep(humanDelay());
        }
        inputElement.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
        if (inputElement.value !== text) {
          inputElement.value = text;
          inputElement.dispatchEvent(new Event("input", { bubbles: true }));
          inputElement.dispatchEvent(new Event("change", { bubbles: true }));
        }
        let attempts = 0;
        while (inputElement.value !== text && attempts < 2) {
          inputElement.value = text;
          inputElement.dispatchEvent(new Event("input", { bubbles: true }));
          inputElement.dispatchEvent(new Event("change", { bubbles: true }));
          await abilities.sleep(50);
          attempts++;
        }
        if (inputElement.value !== text) {
          console.warn("simulateTyping: final value mismatch", inputElement.value, text);
          return false;
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
      }
    },
    media: {
      base64ToFile: (base64Data) => {
        const [header, data] = base64Data.split(",");
        const mimeType = header.split(":")[1].split(";")[0];
        const byteCharacters = atob(data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: mimeType });
        const extension = mimeType.split("/")[1] || "file";
        return new File([blob], `file.${extension}`, { type: mimeType });
      }
    },
    attachments: {
      /**
       * Attach a file via a hidden <input type="file"> or selector.
       * @param {HTMLElement|string} inputElementOrSelector - File input element or CSS selector.
       * @param {File|string} file - File object or base64-encoded string.
       */
      attachFile: async (inputElementOrSelector, file) => {
        const fileObj = typeof file === "string" ? abilities.media.base64ToFile(file) : file;
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(fileObj);
        const input = typeof inputElementOrSelector === "string" ? document.querySelector(inputElementOrSelector) : inputElementOrSelector;
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event("input", { cancelable: true, bubbles: true, composed: true }));
        return true;
      }
    }
  };
  window.abilities = abilities;
}
//# sourceMappingURL=abilities.js.map
