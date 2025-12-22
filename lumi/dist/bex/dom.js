(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/events/events.js
  var require_events = __commonJS({
    "node_modules/events/events.js"(exports, module) {
      "use strict";
      var R = typeof Reflect === "object" ? Reflect : null;
      var ReflectApply = R && typeof R.apply === "function" ? R.apply : function ReflectApply2(target, receiver, args) {
        return Function.prototype.apply.call(target, receiver, args);
      };
      var ReflectOwnKeys;
      if (R && typeof R.ownKeys === "function") {
        ReflectOwnKeys = R.ownKeys;
      } else if (Object.getOwnPropertySymbols) {
        ReflectOwnKeys = function ReflectOwnKeys2(target) {
          return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
        };
      } else {
        ReflectOwnKeys = function ReflectOwnKeys2(target) {
          return Object.getOwnPropertyNames(target);
        };
      }
      function ProcessEmitWarning(warning) {
        if (console && console.warn)
          console.warn(warning);
      }
      var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
        return value !== value;
      };
      function EventEmitter2() {
        EventEmitter2.init.call(this);
      }
      module.exports = EventEmitter2;
      module.exports.once = once;
      EventEmitter2.EventEmitter = EventEmitter2;
      EventEmitter2.prototype._events = void 0;
      EventEmitter2.prototype._eventsCount = 0;
      EventEmitter2.prototype._maxListeners = void 0;
      var defaultMaxListeners = 10;
      function checkListener(listener) {
        if (typeof listener !== "function") {
          throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
        }
      }
      Object.defineProperty(EventEmitter2, "defaultMaxListeners", {
        enumerable: true,
        get: function() {
          return defaultMaxListeners;
        },
        set: function(arg) {
          if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
            throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
          }
          defaultMaxListeners = arg;
        }
      });
      EventEmitter2.init = function() {
        if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
          this._events = /* @__PURE__ */ Object.create(null);
          this._eventsCount = 0;
        }
        this._maxListeners = this._maxListeners || void 0;
      };
      EventEmitter2.prototype.setMaxListeners = function setMaxListeners(n) {
        if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
          throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + ".");
        }
        this._maxListeners = n;
        return this;
      };
      function _getMaxListeners(that) {
        if (that._maxListeners === void 0)
          return EventEmitter2.defaultMaxListeners;
        return that._maxListeners;
      }
      EventEmitter2.prototype.getMaxListeners = function getMaxListeners() {
        return _getMaxListeners(this);
      };
      EventEmitter2.prototype.emit = function emit(type) {
        var args = [];
        for (var i = 1; i < arguments.length; i++)
          args.push(arguments[i]);
        var doError = type === "error";
        var events = this._events;
        if (events !== void 0)
          doError = doError && events.error === void 0;
        else if (!doError)
          return false;
        if (doError) {
          var er;
          if (args.length > 0)
            er = args[0];
          if (er instanceof Error) {
            throw er;
          }
          var err = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
          err.context = er;
          throw err;
        }
        var handler = events[type];
        if (handler === void 0)
          return false;
        if (typeof handler === "function") {
          ReflectApply(handler, this, args);
        } else {
          var len = handler.length;
          var listeners = arrayClone(handler, len);
          for (var i = 0; i < len; ++i)
            ReflectApply(listeners[i], this, args);
        }
        return true;
      };
      function _addListener(target, type, listener, prepend) {
        var m;
        var events;
        var existing;
        checkListener(listener);
        events = target._events;
        if (events === void 0) {
          events = target._events = /* @__PURE__ */ Object.create(null);
          target._eventsCount = 0;
        } else {
          if (events.newListener !== void 0) {
            target.emit(
              "newListener",
              type,
              listener.listener ? listener.listener : listener
            );
            events = target._events;
          }
          existing = events[type];
        }
        if (existing === void 0) {
          existing = events[type] = listener;
          ++target._eventsCount;
        } else {
          if (typeof existing === "function") {
            existing = events[type] = prepend ? [listener, existing] : [existing, listener];
          } else if (prepend) {
            existing.unshift(listener);
          } else {
            existing.push(listener);
          }
          m = _getMaxListeners(target);
          if (m > 0 && existing.length > m && !existing.warned) {
            existing.warned = true;
            var w = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
            w.name = "MaxListenersExceededWarning";
            w.emitter = target;
            w.type = type;
            w.count = existing.length;
            ProcessEmitWarning(w);
          }
        }
        return target;
      }
      EventEmitter2.prototype.addListener = function addListener(type, listener) {
        return _addListener(this, type, listener, false);
      };
      EventEmitter2.prototype.on = EventEmitter2.prototype.addListener;
      EventEmitter2.prototype.prependListener = function prependListener(type, listener) {
        return _addListener(this, type, listener, true);
      };
      function onceWrapper() {
        if (!this.fired) {
          this.target.removeListener(this.type, this.wrapFn);
          this.fired = true;
          if (arguments.length === 0)
            return this.listener.call(this.target);
          return this.listener.apply(this.target, arguments);
        }
      }
      function _onceWrap(target, type, listener) {
        var state = { fired: false, wrapFn: void 0, target, type, listener };
        var wrapped = onceWrapper.bind(state);
        wrapped.listener = listener;
        state.wrapFn = wrapped;
        return wrapped;
      }
      EventEmitter2.prototype.once = function once2(type, listener) {
        checkListener(listener);
        this.on(type, _onceWrap(this, type, listener));
        return this;
      };
      EventEmitter2.prototype.prependOnceListener = function prependOnceListener(type, listener) {
        checkListener(listener);
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
      };
      EventEmitter2.prototype.removeListener = function removeListener(type, listener) {
        var list, events, position, i, originalListener;
        checkListener(listener);
        events = this._events;
        if (events === void 0)
          return this;
        list = events[type];
        if (list === void 0)
          return this;
        if (list === listener || list.listener === listener) {
          if (--this._eventsCount === 0)
            this._events = /* @__PURE__ */ Object.create(null);
          else {
            delete events[type];
            if (events.removeListener)
              this.emit("removeListener", type, list.listener || listener);
          }
        } else if (typeof list !== "function") {
          position = -1;
          for (i = list.length - 1; i >= 0; i--) {
            if (list[i] === listener || list[i].listener === listener) {
              originalListener = list[i].listener;
              position = i;
              break;
            }
          }
          if (position < 0)
            return this;
          if (position === 0)
            list.shift();
          else {
            spliceOne(list, position);
          }
          if (list.length === 1)
            events[type] = list[0];
          if (events.removeListener !== void 0)
            this.emit("removeListener", type, originalListener || listener);
        }
        return this;
      };
      EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
      EventEmitter2.prototype.removeAllListeners = function removeAllListeners(type) {
        var listeners, events, i;
        events = this._events;
        if (events === void 0)
          return this;
        if (events.removeListener === void 0) {
          if (arguments.length === 0) {
            this._events = /* @__PURE__ */ Object.create(null);
            this._eventsCount = 0;
          } else if (events[type] !== void 0) {
            if (--this._eventsCount === 0)
              this._events = /* @__PURE__ */ Object.create(null);
            else
              delete events[type];
          }
          return this;
        }
        if (arguments.length === 0) {
          var keys = Object.keys(events);
          var key;
          for (i = 0; i < keys.length; ++i) {
            key = keys[i];
            if (key === "removeListener")
              continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners("removeListener");
          this._events = /* @__PURE__ */ Object.create(null);
          this._eventsCount = 0;
          return this;
        }
        listeners = events[type];
        if (typeof listeners === "function") {
          this.removeListener(type, listeners);
        } else if (listeners !== void 0) {
          for (i = listeners.length - 1; i >= 0; i--) {
            this.removeListener(type, listeners[i]);
          }
        }
        return this;
      };
      function _listeners(target, type, unwrap) {
        var events = target._events;
        if (events === void 0)
          return [];
        var evlistener = events[type];
        if (evlistener === void 0)
          return [];
        if (typeof evlistener === "function")
          return unwrap ? [evlistener.listener || evlistener] : [evlistener];
        return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
      }
      EventEmitter2.prototype.listeners = function listeners(type) {
        return _listeners(this, type, true);
      };
      EventEmitter2.prototype.rawListeners = function rawListeners(type) {
        return _listeners(this, type, false);
      };
      EventEmitter2.listenerCount = function(emitter, type) {
        if (typeof emitter.listenerCount === "function") {
          return emitter.listenerCount(type);
        } else {
          return listenerCount.call(emitter, type);
        }
      };
      EventEmitter2.prototype.listenerCount = listenerCount;
      function listenerCount(type) {
        var events = this._events;
        if (events !== void 0) {
          var evlistener = events[type];
          if (typeof evlistener === "function") {
            return 1;
          } else if (evlistener !== void 0) {
            return evlistener.length;
          }
        }
        return 0;
      }
      EventEmitter2.prototype.eventNames = function eventNames() {
        return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
      };
      function arrayClone(arr, n) {
        var copy = new Array(n);
        for (var i = 0; i < n; ++i)
          copy[i] = arr[i];
        return copy;
      }
      function spliceOne(list, index) {
        for (; index + 1 < list.length; index++)
          list[index] = list[index + 1];
        list.pop();
      }
      function unwrapListeners(arr) {
        var ret = new Array(arr.length);
        for (var i = 0; i < ret.length; ++i) {
          ret[i] = arr[i].listener || arr[i];
        }
        return ret;
      }
      function once(emitter, name) {
        return new Promise(function(resolve, reject) {
          function errorListener(err) {
            emitter.removeListener(name, resolver);
            reject(err);
          }
          function resolver() {
            if (typeof emitter.removeListener === "function") {
              emitter.removeListener("error", errorListener);
            }
            resolve([].slice.call(arguments));
          }
          ;
          eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
          if (name !== "error") {
            addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
          }
        });
      }
      function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
        if (typeof emitter.on === "function") {
          eventTargetAgnosticAddListener(emitter, "error", handler, flags);
        }
      }
      function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
        if (typeof emitter.on === "function") {
          if (flags.once) {
            emitter.once(name, listener);
          } else {
            emitter.on(name, listener);
          }
        } else if (typeof emitter.addEventListener === "function") {
          emitter.addEventListener(name, function wrapListener(arg) {
            if (flags.once) {
              emitter.removeEventListener(name, wrapListener);
            }
            listener(arg);
          });
        } else {
          throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
        }
      }
    }
  });

  // .quasar/bex/bridge.js
  var import_events = __toESM(require_events());

  // node_modules/quasar/src/utils/uid/uid.js
  var buf;
  var bufIdx = 0;
  var hexBytes = new Array(256);
  for (let i = 0; i < 256; i++) {
    hexBytes[i] = (i + 256).toString(16).substring(1);
  }
  var randomBytes = (() => {
    const lib = typeof crypto !== "undefined" ? crypto : typeof window !== "undefined" ? window.crypto || window.msCrypto : void 0;
    if (lib !== void 0) {
      if (lib.randomBytes !== void 0) {
        return lib.randomBytes;
      }
      if (lib.getRandomValues !== void 0) {
        return (n) => {
          const bytes = new Uint8Array(n);
          lib.getRandomValues(bytes);
          return bytes;
        };
      }
    }
    return (n) => {
      const r = [];
      for (let i = n; i > 0; i--) {
        r.push(Math.floor(Math.random() * 256));
      }
      return r;
    };
  })();
  var BUFFER_SIZE = 4096;
  function uid_default() {
    if (buf === void 0 || bufIdx + 16 > BUFFER_SIZE) {
      bufIdx = 0;
      buf = randomBytes(BUFFER_SIZE);
    }
    const b = Array.prototype.slice.call(buf, bufIdx, bufIdx += 16);
    b[6] = b[6] & 15 | 64;
    b[8] = b[8] & 63 | 128;
    return hexBytes[b[0]] + hexBytes[b[1]] + hexBytes[b[2]] + hexBytes[b[3]] + "-" + hexBytes[b[4]] + hexBytes[b[5]] + "-" + hexBytes[b[6]] + hexBytes[b[7]] + "-" + hexBytes[b[8]] + hexBytes[b[9]] + "-" + hexBytes[b[10]] + hexBytes[b[11]] + hexBytes[b[12]] + hexBytes[b[13]] + hexBytes[b[14]] + hexBytes[b[15]];
  }

  // .quasar/bex/bridge.js
  var typeSizes = {
    "undefined": () => 0,
    "boolean": () => 4,
    "number": () => 8,
    "string": (item) => 2 * item.length,
    "object": (item) => !item ? 0 : Object.keys(item).reduce((total, key) => sizeOf(key) + sizeOf(item[key]) + total, 0)
  };
  var sizeOf = (value) => typeSizes[typeof value](value);
  var Bridge = class extends import_events.EventEmitter {
    constructor(wall) {
      super();
      this.setMaxListeners(Infinity);
      this.wall = wall;
      wall.listen((messages) => {
        if (Array.isArray(messages)) {
          messages.forEach((message) => this._emit(message));
        } else {
          this._emit(messages);
        }
      });
      this._sendingQueue = [];
      this._sending = false;
      this._maxMessageSize = 32 * 1024 * 1024;
    }
    send(event, payload) {
      return this._send([{ event, payload }]);
    }
    getEvents() {
      return this._events;
    }
    on(eventName, listener) {
      return super.on(eventName, (originalPayload) => {
        listener({
          ...originalPayload,
          respond: (payload) => this.send(originalPayload.eventResponseKey, payload)
        });
      });
    }
    _emit(message) {
      if (typeof message === "string") {
        this.emit(message);
      } else {
        this.emit(message.event, message.payload);
      }
    }
    _send(messages) {
      this._sendingQueue.push(messages);
      return this._nextSend();
    }
    _nextSend() {
      if (!this._sendingQueue.length || this._sending)
        return Promise.resolve();
      this._sending = true;
      const messages = this._sendingQueue.shift(), currentMessage = messages[0], eventListenerKey = `${currentMessage.event}.${uid_default()}`, eventResponseKey = eventListenerKey + ".result";
      return new Promise((resolve, reject) => {
        let allChunks = [];
        const fn = (r) => {
          if (r !== void 0 && r._chunkSplit) {
            const chunkData = r._chunkSplit;
            allChunks = [...allChunks, ...r.data];
            if (chunkData.lastChunk) {
              this.off(eventResponseKey, fn);
              resolve(allChunks);
            }
          } else {
            this.off(eventResponseKey, fn);
            resolve(r);
          }
        };
        this.on(eventResponseKey, fn);
        try {
          const messagesToSend = messages.map((m) => {
            return {
              ...m,
              ...{
                payload: {
                  data: m.payload,
                  eventResponseKey
                }
              }
            };
          });
          this.wall.send(messagesToSend);
        } catch (err) {
          const errorMessage = "Message length exceeded maximum allowed length.";
          if (err.message === errorMessage) {
            if (!Array.isArray(currentMessage.payload)) {
              if (true) {
                console.error(errorMessage + " Note: The bridge can deal with this is if the payload is an Array.");
              }
            } else {
              const objectSize = sizeOf(currentMessage);
              if (objectSize > this._maxMessageSize) {
                const chunksRequired = Math.ceil(objectSize / this._maxMessageSize), arrayItemCount = Math.ceil(currentMessage.payload.length / chunksRequired);
                let data = currentMessage.payload;
                for (let i = 0; i < chunksRequired; i++) {
                  let take = Math.min(data.length, arrayItemCount);
                  this.wall.send([{
                    event: currentMessage.event,
                    payload: {
                      _chunkSplit: {
                        count: chunksRequired,
                        lastChunk: i === chunksRequired - 1
                      },
                      data: data.splice(0, take)
                    }
                  }]);
                }
              }
            }
          }
        }
        this._sending = false;
        setTimeout(() => {
          return this._nextSend();
        }, 16);
      });
    }
  };

  // .quasar/bex/window-event-listener.js
  var listenForWindowEvents = (bridge2, type) => {
    window.addEventListener("message", (payload) => {
      if (payload.source !== window) {
        return;
      }
      if (payload.data.from !== void 0 && payload.data.from === type) {
        const eventData = payload.data[0], bridgeEvents = bridge2.getEvents();
        for (let event in bridgeEvents) {
          if (event === eventData.event) {
            bridgeEvents[event](eventData.payload);
          }
        }
      }
    }, false);
  };

  // node_modules/quasar/wrappers/index.js
  function bexDom(callback) {
    return callback;
  }

  // src-bex/logger.js
  var ExtensionLogger = class {
    constructor(prefix = "") {
      this.prefix = prefix;
      this.debugEnabled = true;
    }
    async checkDebugSetting() {
      try {
        const result = await chrome.storage.local.get(["debugMode"]);
        this.debugEnabled = true;
      } catch (error) {
      }
    }
    log(...args) {
      if (this.debugEnabled) {
        console.log(this.prefix, ...args);
      }
    }
    info(...args) {
      if (this.debugEnabled) {
        console.info(this.prefix, ...args);
      }
    }
    warn(...args) {
      console.warn(this.prefix, ...args);
    }
    error(...args) {
      console.error(this.prefix, ...args);
    }
    debug(...args) {
      if (this.debugEnabled) {
        console.debug(this.prefix, ...args);
      }
    }
  };
  var domLogger = new ExtensionLogger("[DOM Script]");
  var bgLogger = new ExtensionLogger("[BG]");
  var statsLogger = new ExtensionLogger("[Stats]");
  var msgLogger = new ExtensionLogger("[Message]");
  var postServiceLogger = new ExtensionLogger("[PostDataService]");
  var stateLogger = new ExtensionLogger("[AutoFlowStateManager]");
  var contentLogger = new ExtensionLogger("[Content Script]");
  var submitLogger = new ExtensionLogger("[Submit Script]");
  var initDebugMode = async () => {
    await Promise.all([
      domLogger.checkDebugSetting(),
      bgLogger.checkDebugSetting(),
      statsLogger.checkDebugSetting(),
      msgLogger.checkDebugSetting(),
      postServiceLogger.checkDebugSetting(),
      stateLogger.checkDebugSetting(),
      contentLogger.checkDebugSetting(),
      submitLogger.checkDebugSetting()
    ]);
  };
  initDebugMode();

  // src-bex/dom.js
  domLogger.log("Reddit Post Machine DOM script loaded");
  var RedditDOMHelper = {
    deepQuery(selector, root = document) {
      const el = root.querySelector(selector);
      if (el)
        return el;
      for (const elem of root.querySelectorAll("*")) {
        if (elem.shadowRoot) {
          const found = this.deepQuery(selector, elem.shadowRoot);
          if (found)
            return found;
        }
      }
      return null;
    },
    async sleep(ms) {
      return new Promise((r) => setTimeout(r, ms));
    },
    async waitForElement(selector, timeout = 1e4) {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        const element = this.deepQuery(selector);
        if (element)
          return element;
        await this.sleep(100);
      }
      return null;
    },
    getPageInfo() {
      const url = window.location.href;
      const pathname = window.location.pathname;
      let pageType = "unknown";
      let subreddit = null;
      if (pathname.includes("/submit")) {
        pageType = "submit";
      } else if (pathname.includes("/r/")) {
        pageType = "subreddit";
        const match = pathname.match(/\/r\/([^\/]+)/);
        if (match)
          subreddit = match[1];
      } else if (pathname === "/" || pathname.includes("/hot") || pathname.includes("/new")) {
        pageType = "home";
      }
      return {
        url,
        pathname,
        pageType,
        subreddit,
        isOldReddit: url.includes("old.reddit.com"),
        isNewReddit: url.includes("www.reddit.com") && !url.includes("old.reddit.com")
      };
    },
    async clickTab(tabValue) {
      domLogger.log(`Clicking tab with data-select-value="${tabValue}"`);
      const tab = this.deepQuery(`[data-select-value="${tabValue}"]`);
      if (tab) {
        tab.click();
        await this.sleep(2e3);
        return true;
      }
      domLogger.log(`Tab with data-select-value="${tabValue}" not found`);
      return false;
    },
    async fillTitle(titleText) {
      domLogger.log("Filling title...");
      const titleInputElement = this.deepQuery('faceplate-textarea-input[name="title"]');
      if (titleInputElement) {
        const shadowRoot = titleInputElement.shadowRoot;
        if (shadowRoot) {
          const titleInput = shadowRoot.querySelector("#innerTextArea");
          if (titleInput) {
            titleInput.focus();
            await this.sleep(500);
            titleInput.value = titleText;
            titleInput.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
            titleInput.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
            domLogger.log("Title set");
            await this.sleep(1500);
            return true;
          }
        }
      }
      domLogger.log("Failed to fill title");
      return false;
    },
    async fillUrl(urlText) {
      domLogger.log("Filling URL...");
      const urlInputElement = this.deepQuery('faceplate-textarea-input[name="link"]');
      if (urlInputElement) {
        const shadowRoot = urlInputElement.shadowRoot;
        if (shadowRoot) {
          const urlInput = shadowRoot.querySelector("#innerTextArea");
          if (urlInput) {
            urlInput.focus();
            await this.sleep(500);
            urlInput.value = urlText;
            urlInput.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
            urlInput.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
            domLogger.log("URL set");
            await this.sleep(1500);
            return true;
          }
        }
      }
      domLogger.log("Failed to fill URL");
      return false;
    },
    async clickBodyField() {
      domLogger.log("Clicking body text field to activate Post button...");
      const bodyComposer = this.deepQuery('shreddit-composer[name="optionalBody"]');
      if (bodyComposer) {
        const bodyEditable = bodyComposer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]');
        if (bodyEditable) {
          domLogger.log("Found Lexical editor, clicking...");
          bodyEditable.click();
          await this.sleep(100);
          bodyEditable.focus();
          await this.sleep(100);
          bodyEditable.click();
          bodyEditable.dispatchEvent(new Event("focus", { bubbles: true, cancelable: true }));
          bodyEditable.dispatchEvent(new Event("click", { bubbles: true, cancelable: true }));
          await this.sleep(1e3);
          return true;
        }
      }
      domLogger.log("Body text field not found");
      return false;
    },
    async fillBodyText(bodyText) {
      domLogger.log("Filling body text...");
      const bodyComposer = this.deepQuery('shreddit-composer[name="optionalBody"]');
      if (bodyComposer) {
        const bodyEditable = bodyComposer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]');
        if (bodyEditable) {
          domLogger.log("Found Lexical editor, setting text...");
          bodyEditable.focus();
          await this.sleep(500);
          bodyEditable.innerHTML = "<p><br></p>";
          for (let i = 0; i < bodyText.length; i++) {
            const char = bodyText[i];
            bodyEditable.dispatchEvent(new KeyboardEvent("keydown", {
              key: char,
              code: char === " " ? "Space" : `Key${char.toUpperCase()}`,
              keyCode: char.charCodeAt(0),
              bubbles: true,
              cancelable: true
            }));
            const inserted = document.execCommand("insertText", false, char);
            if (!inserted) {
              const selection = window.getSelection();
              if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(char));
                range.collapse(false);
              }
            }
            bodyEditable.dispatchEvent(new InputEvent("input", {
              inputType: "insertText",
              data: char,
              bubbles: true,
              cancelable: true
            }));
            await this.sleep(5);
          }
          bodyEditable.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
          domLogger.log("Body text set successfully");
          await this.sleep(1500);
          return true;
        }
      }
      domLogger.log("Failed to find body editor");
      return false;
    },
    async fillPostForm(data) {
      domLogger.log("Starting robust form fill with Frappe model...", data);
      const {
        title,
        subreddit_name,
        post_type,
        url_to_share,
        body_text
      } = data;
      if (subreddit_name) {
        if (await this.selectSubreddit(subreddit_name)) {
          domLogger.log(`Subreddit ${subreddit_name} selected`);
          await this.sleep(1e3);
        } else {
          domLogger.warn(`Failed to select subreddit ${subreddit_name}`);
        }
      }
      const isLinkPost = post_type === "Link";
      const targetTab = isLinkPost ? "LINK" : "TEXT";
      domLogger.log(`Targeting ${targetTab} tab`);
      if (await this.clickTab(targetTab)) {
        if (title) {
          await this.fillTitle(title);
        }
        if (isLinkPost && url_to_share) {
          await this.fillUrl(url_to_share);
        } else if (body_text) {
          await this.clickBodyField();
          await this.fillBodyText(body_text);
          await this.clickBodyField();
        }
        domLogger.log("Form fill sequence completed");
      } else {
        domLogger.error("Could not switch to target tab");
      }
    },
    async selectSubreddit(subredditName) {
      domLogger.log(`Selecting subreddit: ${subredditName}...`);
      const searchInput = this.deepQuery('input[placeholder="Choose a community"], input[placeholder="Search for a community"]');
      if (searchInput) {
        searchInput.click();
        searchInput.focus();
        await this.sleep(500);
        searchInput.value = subredditName;
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        await this.sleep(1e3);
        const findOption = () => {
          const options = Array.from(document.querySelectorAll('[role="option"], li[id*="community-"]'));
          return options.find((opt) => {
            const text = opt.textContent?.toLowerCase().trim();
            return text === `r/${subredditName.toLowerCase()}` || text === subredditName.toLowerCase();
          });
        };
        let option = findOption();
        if (option) {
          option.click();
          return true;
        }
        await this.sleep(1e3);
        option = findOption();
        if (option) {
          option.click();
          return true;
        }
      } else {
        const selectBox = this.deepQuery('select[name="subreddit"], select#subreddit');
        if (selectBox) {
          selectBox.value = subredditName;
          selectBox.dispatchEvent(new Event("change", { bubbles: true }));
          return true;
        }
      }
      return false;
    },
    addExtensionButton() {
      const pageInfo = this.getPageInfo();
      if (pageInfo.pageType !== "submit" && pageInfo.pageType !== "subreddit" && pageInfo.pageType !== "home") {
        return;
      }
      if (document.querySelector(".reddit-post-machine-btn")) {
        return;
      }
      const button = document.createElement("button");
      button.className = "reddit-post-machine-btn";
      button.innerHTML = "\u{1F680} Post Machine";
      button.style.cssText = `
      background: #1976d2;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      margin: 8px;
      cursor: pointer;
      font-weight: bold;
      z-index: 9999;
      position: fixed;
      top: 10px;
      right: 10px;
    `;
      button.addEventListener("click", (e) => {
        e.preventDefault();
        window.postMessage({
          type: "REDDIT_POST_MACHINE_OPEN",
          source: "reddit-dom"
        }, "*");
      });
      document.body.appendChild(button);
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
    });
  } else {
  }
  window.addEventListener("message", (event) => {
    if (event.data.type === "REDDIT_POST_MACHINE_FILL_FORM") {
      RedditDOMHelper.fillPostForm(event.data.payload);
    }
  });
  window.RedditDOMHelper = RedditDOMHelper;
  var dom_default = bexDom((bridge2) => {
    domLogger.log("Reddit Post Machine DOM script initialized");
    window.bridge = bridge2;
  });
  Object.assign(RedditDOMHelper, {
    qsAll(s, r = document) {
      try {
        return Array.from((r || document).querySelectorAll(s));
      } catch {
        return [];
      }
    },
    checkAccountLocked() {
      const phrases = ["we've locked your account", "locked your account", "account suspended"];
      const pageText = document.body.textContent.toLowerCase();
      return phrases.some((phrase) => pageText.includes(phrase)) || this.qsAll('faceplate-banner[appearance="error"]').some((el) => el.textContent?.toLowerCase().includes("locked") || el.textContent?.toLowerCase().includes("suspended"));
    },
    async openUserDropdown() {
      domLogger.log("Attempting to open user dropdown (robust)...");
      const openMenu = this.qsAll('[role="menu"], [role="dialog"], faceplate-dropdown-menu').find(
        (el) => this.isVisible(el) && el.textContent.toLowerCase().includes("profile")
      );
      if (openMenu) {
        domLogger.log("User menu appears to be already open");
        return true;
      }
      const selectors = [
        "#expand-user-drawer-button",
        '[data-testid="user-avatar"]',
        'button[aria-label="Open user menu"]',
        'button[aria-label="User Drawer"]',
        'button[aria-label*="user"]',
        "rpl-dropdown div",
        "#user-dropdown-trigger"
      ];
      let button = null;
      for (const sel of selectors) {
        const candidates = this.qsAll(sel).concat(Array.from(document.querySelectorAll(sel)));
        for (const el of candidates) {
          if (this.isVisible(el)) {
            button = el;
            domLogger.log(`Found user menu button with selector: ${sel}`);
            break;
          }
        }
        if (button)
          break;
      }
      if (!button) {
        button = this.deepQuery('button[aria-label*="user"], [data-testid="user-avatar"]');
      }
      if (button) {
        if (button.getAttribute("aria-expanded") === "true") {
          domLogger.log("Button says menu is already expanded");
          return true;
        }
        const isMenuOpen = () => {
          return this.qsAll('[role="menu"], [role="dialog"], faceplate-dropdown-menu').some(
            (el) => this.isVisible(el) && el.textContent.toLowerCase().includes("profile")
          ) || button.getAttribute("aria-expanded") === "true";
        };
        for (let i = 0; i < 2; i++) {
          domLogger.log(`Clicking user menu button (Attempt ${i + 1}/2)...`);
          button.click();
          await this.sleep(2e3);
          if (isMenuOpen()) {
            domLogger.log("User menu confirmed open.");
            return true;
          }
          domLogger.log("\u{1F504} Navigation fallback: User menu not detected open, retrying...");
        }
        domLogger.log("\u{1F504} Navigation fallback: Using direct URL navigation since menu approach failed");
        return false;
      }
      domLogger.log("User dropdown button not found");
      return false;
    },
    async getUsername() {
      const urlMatch = window.location.pathname.match(/\/user\/([^\/]+)/);
      if (urlMatch)
        return "u/" + urlMatch[1];
      if (!await this.openUserDropdown())
        return null;
      await this.sleep(1500);
      const userElement = this.qsAll('span.text-12.text-secondary-weak, [id*="user-drawer"] span, .text-12').find((el) => el.textContent?.trim().startsWith("u/"));
      if (userElement) {
        const username = userElement.textContent.trim();
        userElement.click();
        await this.sleep(500);
        return username;
      }
      return null;
    },
    isVisible(el) {
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    },
    deepFindByText(text, tag = "*", root = document) {
      const elements = Array.from(root.querySelectorAll(tag)).reverse();
      const ignoredTags = ["HTML", "BODY", "HEAD", "SCRIPT", "STYLE", "NOSCRIPT"];
      for (const el of elements) {
        if (ignoredTags.includes(el.tagName))
          continue;
        const content = el.textContent?.trim();
        if ((content === text || content?.includes(text) && content.length < text.length + 50) && this.isVisible(el)) {
          return el;
        }
      }
      const allElements = Array.from(root.querySelectorAll("*"));
      for (const el of allElements) {
        if (el.shadowRoot) {
          const found = this.deepFindByText(text, tag, el.shadowRoot);
          if (found)
            return found;
        }
      }
      return null;
    },
    async navigateToUserProfile(username) {
      domLogger.log(`Navigating to user profile... Target: ${username}`);
      const cleanUsername = username ? username.replace("u/", "") : null;
      try {
        domLogger.log("Attempting User Dropdown -> View Profile flow");
        if (await this.openUserDropdown()) {
          await this.sleep(2e3);
          const findViewProfile = (root = document) => {
            const allElements = Array.from(root.querySelectorAll("*")).reverse();
            for (const el of allElements) {
              if (["SCRIPT", "STYLE", "HTML", "BODY", "HEAD"].includes(el.tagName))
                continue;
              const text = el.textContent?.toLowerCase().trim() || "";
              const ariaLabel = el.getAttribute("aria-label")?.toLowerCase() || "";
              const isProfileMatch = (text.includes("profile") || ariaLabel.includes("profile")) && (text.includes("view") || text.includes("my") || text === "profile");
              if (isProfileMatch) {
                if (el.offsetParent === null && window.getComputedStyle(el).display === "none")
                  continue;
                domLogger.log("Found potential View Profile element:", el);
                return el.closest('a, button, div[role="menuitem"]') || el;
              }
            }
            const all = Array.from(root.querySelectorAll("*"));
            for (const el of all) {
              if (el.shadowRoot) {
                const found = findViewProfile(el.shadowRoot);
                if (found)
                  return found;
              }
            }
            return null;
          };
          let viewProfileEl = findViewProfile();
          if (!viewProfileEl) {
            const portals = document.querySelectorAll('faceplate-portal, .portal, [id*="portal"]');
            for (const portal of portals) {
              const root = portal.shadowRoot || portal;
              const found = findViewProfile(root);
              if (found) {
                viewProfileEl = found;
                break;
              }
            }
          }
          if (viewProfileEl) {
            domLogger.log('Found "View Profile" element, clicking...', viewProfileEl);
            viewProfileEl.click();
            domLogger.log('Waiting for "Overview" element to confirm profile load...');
            const overviewEl = await this.waitForElement('[data-testid="profile-overview-tab"], a[href$="/overview/"], a[href$="/overview"]', 1e4) || await this.deepFindByText("Overview", "a");
            if (overviewEl) {
              domLogger.log("Profile loaded (Overview detected). Waiting 2s for stability...");
              await this.sleep(2e3);
            } else {
              domLogger.warn("Overview element not found after click. Proceeding with caution...");
              await this.sleep(4e3);
            }
            return true;
          }
          domLogger.log('"View Profile" link not found in dropdown.');
        }
      } catch (e) {
        domLogger.warn("Click navigation interrupted (likely success):", e);
        return true;
      }
      try {
        const profileLink = this.deepQuery('faceplate-tracker[source="user_drawer"] a') || this.deepQuery('a[href^="/user/"][class*="avatar"]');
        if (profileLink) {
          domLogger.log("Found alternative profile link, clicking...");
          profileLink.click();
          await this.sleep(4e3);
          return true;
        }
      } catch (e) {
        domLogger.warn("Alternative link click interrupted:", e);
        return true;
      }
      if (cleanUsername) {
        try {
          domLogger.log("\u{1F504} Navigation fallback: Using direct URL navigation since menu approach failed");
          window.location.href = `https://www.reddit.com/user/${cleanUsername}`;
          await this.sleep(5e3);
        } catch (e) {
          domLogger.log("\u{1F504} Navigation fallback: URL navigation interrupted (this is normal):", e.message);
        }
        return true;
      }
      return false;
    },
    async navigateToPostsTab(username) {
      domLogger.log("Navigating to Posts tab...");
      domLogger.log("Waiting for profile page to stabilize...");
      await this.sleep(2e3);
      const postsTabSelectors = [
        'a[href*="/submitted"]',
        'a[href*="/submitted/"]',
        '[data-testid="profile-posts-tab"]',
        'faceplate-tracker[noun="posts_tab"] a',
        "#profile-tab-posts_tab a",
        "#profile-tab-posts_tab"
      ];
      for (const selector of postsTabSelectors) {
        const tab = this.deepQuery(selector);
        if (tab && this.isVisible(tab)) {
          domLogger.log(`Found Posts tab with selector: ${selector}, clicking...`);
          try {
            tab.click();
          } catch (e) {
            if (e.message && e.message.includes("AbortError")) {
              domLogger.warn("Ignoring AbortError during Posts tab click (navigation interrupted):", e.message);
            } else {
              throw e;
            }
          }
          await this.sleep(3e3);
          if (window.location.pathname.includes("/submitted")) {
            domLogger.log("Successfully navigated to Posts tab via click!");
            return true;
          }
        }
      }
      domLogger.log("Trying to find Posts tab by text content...");
      const postsTabByText = this.deepFindByText("Posts", "a");
      if (postsTabByText && this.isVisible(postsTabByText)) {
        domLogger.log('Found "Posts" tab by text, clicking...');
        try {
          postsTabByText.click();
        } catch (e) {
          if (e.message && e.message.includes("AbortError")) {
            domLogger.warn("Ignoring AbortError during Posts tab text click (navigation interrupted):", e.message);
          } else {
            throw e;
          }
        }
        await this.sleep(3e3);
        if (window.location.pathname.includes("/submitted")) {
          domLogger.log("Successfully navigated to Posts tab via text click!");
          return true;
        }
      }
      domLogger.log("Trying to find Posts in tab buttons...");
      const allTabs = this.qsAll('a, button, [role="tab"]');
      for (const tab of allTabs) {
        const text = tab.textContent?.trim().toLowerCase() || "";
        if (text === "posts" && this.isVisible(tab)) {
          domLogger.log("Found Posts tab button, clicking...", tab);
          try {
            tab.click();
          } catch (e) {
            if (e.message && e.message.includes("AbortError")) {
              domLogger.warn("Ignoring AbortError during Posts tab button click (navigation interrupted):", e.message);
            } else {
              throw e;
            }
          }
          await this.sleep(3e3);
          if (window.location.pathname.includes("/submitted")) {
            domLogger.log("Successfully navigated to Posts tab!");
            return true;
          }
        }
      }
      domLogger.log("Could not click Posts tab, falling back to URL navigation...");
      const inferredUser = username || window.location.pathname.match(/\/user\/([^\/]+)/)?.[1];
      if (inferredUser) {
        const cleanUser = inferredUser.replace("u/", "");
        domLogger.log(`Navigating directly to /user/${cleanUser}/submitted/`);
        window.location.href = `https://www.reddit.com/user/${cleanUser}/submitted/`;
        await this.sleep(4e3);
        return true;
      }
      domLogger.log("Posts tab not found and no username for fallback");
      return false;
    },
    async checkUserPosts() {
      domLogger.log("Checking user posts with enhanced metadata extraction...");
      await this.sleep(3e3);
      const posts = this.qsAll('shreddit-post, [data-testid="post-container"], .Post');
      domLogger.log(`Found ${posts.length} posts`);
      if (posts.length > 0) {
        domLogger.log("Raw posts found:", posts.length);
        posts.slice(0, 3).forEach((post, index) => {
          domLogger.log(`Post ${index} HTML structure:`, post.outerHTML.substring(0, 500));
        });
        const postsWithMetadata = posts.map((post) => {
          if (post?.getAttribute && post.getAttribute("data-testid") === "create-post") {
            return null;
          }
          const postAttributes = {
            postTitle: post.getAttribute("post-title"),
            author: post.getAttribute("author"),
            subredditPrefixedName: post.getAttribute("subreddit-prefixed-name"),
            score: post.getAttribute("score"),
            commentCount: post.getAttribute("comment-count"),
            createdTimestamp: post.getAttribute("created-timestamp"),
            postType: post.getAttribute("post-type"),
            contentHref: post.getAttribute("content-href"),
            permalink: post.getAttribute("permalink"),
            postId: post.getAttribute("id"),
            domain: post.getAttribute("domain"),
            itemState: post.getAttribute("item-state"),
            viewContext: post.getAttribute("view-context"),
            voteType: post.getAttribute("vote-type"),
            awardCount: post.getAttribute("award-count"),
            userId: post.getAttribute("user-id"),
            authorId: post.getAttribute("author-id"),
            subredditId: post.getAttribute("subreddit-id")
          };
          const timestampElement = post.querySelector('time, [data-testid="post_timestamp"], faceplate-time');
          const timestamp = postAttributes.createdTimestamp || timestampElement?.getAttribute("datetime") || timestampElement?.getAttribute("created-timestamp") || post.getAttribute("created-timestamp") || timestampElement?.textContent;
          const postLink = post.querySelector('a[data-testid="post-content"], a[href*="/comments/"]');
          const postUrl = postAttributes.permalink || postLink?.href || post.getAttribute("permalink");
          const postId = this.extractPostId(postAttributes.postId || postUrl);
          const titleElement = post.querySelector('h3, [data-testid="post-content"], .title, [slot="title"], div[data-click-id="text"], [data-adclicklocation="title"], a[data-click-id="text"], .PostTitle, h1, h2');
          const title = postAttributes.postTitle || titleElement?.textContent?.trim() || post.getAttribute("post-title") || post.querySelector("[data-post-title]")?.textContent?.trim() || post.querySelector('a[href*="/comments/"]')?.textContent?.trim() || "Untitled Post";
          const score = postAttributes.score || "0";
          const commentCount = postAttributes.commentCount || "0";
          const awardCount = postAttributes.awardCount || "0";
          const isRemoved = this.checkPostStatus(post, "removed");
          const isBlocked = this.checkPostStatus(post, "blocked");
          const isDeleted = this.checkPostStatus(post, "deleted");
          const moderatorFlags = this.qsAll('[class*="moderator"], [class*="removed"], [class*="deleted"]', post);
          const hasModeratorAction = moderatorFlags.length > 0;
          return {
            timestamp: timestamp || new Date().toISOString(),
            postUrl: postUrl || "",
            postId: postId || "",
            title,
            author: postAttributes.author || "",
            subreddit: postAttributes.subredditPrefixedName || "",
            score: parseInt(score) || 0,
            commentCount: parseInt(commentCount) || 0,
            awardCount: parseInt(awardCount) || 0,
            postType: postAttributes.postType || "",
            domain: postAttributes.domain || "",
            contentHref: postAttributes.contentHref || "",
            isRemoved: isRemoved || hasModeratorAction,
            isBlocked,
            deleted: isDeleted,
            hasModeratorAction,
            itemState: postAttributes.itemState || "",
            viewContext: postAttributes.viewContext || "",
            voteType: postAttributes.voteType || "",
            userId: postAttributes.userId || "",
            authorId: postAttributes.authorId || "",
            subredditId: postAttributes.subredditId || ""
          };
        }).filter((post) => {
          if (!post)
            return false;
          domLogger.log("Post extraction debug:", {
            timestamp: post.timestamp,
            postId: post.postId,
            postUrl: post.postUrl,
            title: post.title,
            author: post.author,
            subreddit: post.subreddit,
            score: post.score
          });
          return post.timestamp && post.postUrl && post.title;
        });
        postsWithMetadata.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        domLogger.log("=== ENHANCED POSTS SUMMARY ===");
        domLogger.log(`Total posts: ${posts.length}`);
        domLogger.log(`Posts with valid metadata: ${postsWithMetadata.length}`);
        postsWithMetadata.forEach((post, index) => {
          domLogger.log(`Post ${index + 1}: ${post.timestamp} | Status: ${post.isRemoved ? "Removed" : post.isBlocked ? "Blocked" : "Active"} | URL: ${post.postUrl}`);
        });
        if (postsWithMetadata.length > 0) {
          const lastPost = postsWithMetadata[0];
          domLogger.log(`Last post details:`, lastPost);
          return {
            total: posts.length,
            lastPostDate: lastPost.timestamp,
            posts: postsWithMetadata,
            lastPost
          };
        }
      } else {
        domLogger.log("No posts found");
      }
      return {
        total: 0,
        lastPostDate: null,
        posts: [],
        lastPost: null
      };
    },
    extractPostId(postUrl) {
      if (!postUrl)
        return null;
      const patterns = [
        /^t3_([a-z0-9]+)$/i,
        /\/comments\/([a-z0-9]+)/i,
        /\/r\/[^\/]+\/comments\/([a-z0-9]+)/i,
        /id=([a-z0-9]+)/i
      ];
      for (const pattern of patterns) {
        const match = postUrl.match(pattern);
        if (match)
          return match[1];
      }
      return null;
    },
    checkPostStatus(postElement, statusType) {
      const statusClasses = [
        `[class*="${statusType}"]`,
        `[class*="moderator"]`,
        `[data-testid*="${statusType}"]`,
        ".removed",
        ".deleted",
        ".blocked"
      ];
      for (const selector of statusClasses) {
        const elements = this.qsAll(selector, postElement);
        if (elements.length > 0) {
          const text = elements[0].textContent?.toLowerCase() || "";
          if (text.includes(statusType) || text.includes("moderator") || text.includes("removed") || text.includes("deleted")) {
            return true;
          }
        }
      }
      const statusTexts = [
        "removed by moderator",
        "deleted by moderator",
        "this post has been removed",
        "post blocked",
        "moderator action"
      ];
      const postText = postElement.textContent?.toLowerCase() || "";
      return statusTexts.some((statusText) => postText.includes(statusText));
    },
    async deleteLastPost(postData) {
      domLogger.log("[DOM Script] Attempting to delete specific post:", postData);
      try {
        let targetPost = null;
        if (postData && postData.postId) {
          targetPost = document.querySelector(`shreddit-post[id="t3_${postData.postId}"]`) || document.querySelector(`[data-ks-id="t3_${postData.postId}"]`);
          domLogger.log("[DOM Script] Looking for post by ID t3_" + postData.postId + ":", targetPost);
        }
        if (!targetPost && postData && postData.postUrl) {
          const postLinks = document.querySelectorAll(`a[href="${postData.postUrl}"]`);
          if (postLinks.length > 0) {
            targetPost = postLinks[0].closest("shreddit-post") || postLinks[0].closest('[data-testid="post-container"]');
            domLogger.log("[DOM Script] Looking for post by URL " + postData.postUrl + ":", targetPost);
          }
        }
        if (!targetPost && postData && postData.title) {
          const allPosts = document.querySelectorAll('shreddit-post[id^="t3_"], [data-testid="post-container"]');
          for (const post of allPosts) {
            const titleElement = post.querySelector('a[slot="title"]') || post.querySelector('[data-testid="post-title"]') || post.querySelector("h3");
            if (titleElement && titleElement.textContent?.trim() === postData.title) {
              targetPost = post;
              domLogger.log("[DOM Script] Found post by title matching:", postData.title);
              break;
            }
          }
        }
        if (!targetPost) {
          domLogger.log("[DOM Script] Target post not found, falling back to first post in DOM");
          targetPost = document.querySelector('[data-testid="post-container"]');
        }
        if (!targetPost) {
          domLogger.log("[DOM Script] No posts found on page");
          return false;
        }
        let optionsButton = null;
        const optionsSelectors = [
          'button[aria-label*="Options"]',
          'button[aria-label*="More options"]',
          'button[aria-label*="more options"]',
          'button[aria-label*="Post options"]',
          'button[aria-label*="Open post options menu"]',
          'button[data-testid="post-dropdown"]',
          'button[data-click-id="postDropdown"]',
          'button[id*="post-options"]',
          'button[class*="more"]',
          "shreddit-post button:last-child",
          '[data-testid="post-container"] button:last-child'
        ];
        for (const selector of optionsSelectors) {
          optionsButton = targetPost.querySelector(selector);
          if (optionsButton) {
            domLogger.log("[DOM Script] Found options button with selector:", selector);
            break;
          }
        }
        if (!optionsButton) {
          const allButtons = targetPost.querySelectorAll("button");
          for (const btn of allButtons) {
            const ariaLabel = btn.getAttribute("aria-label")?.toLowerCase() || "";
            if (ariaLabel.includes("option") || ariaLabel.includes("more") || btn.querySelector("svg") || btn.innerHTML.includes("icon")) {
              optionsButton = btn;
              domLogger.log("[DOM Script] Found options button by attributes");
              break;
            }
          }
        }
        if (!optionsButton) {
          domLogger.log("[DOM Script] Options button not found for target post");
          return false;
        }
        optionsButton.click();
        await new Promise((resolve) => setTimeout(resolve, 500));
        let deleteButton = null;
        const deleteSelectors = [
          'button[aria-label*="Delete"]',
          'button[aria-label*="delete"]',
          '[role="menuitem"][aria-label*="Delete"]',
          '[role="menuitem"][aria-label*="delete"]',
          'li[role="menuitem"] button',
          'div[role="menuitem"] button',
          'button[data-click-id="delete"]',
          'button[data-testid="delete-post-button"]'
        ];
        for (const selector of deleteSelectors) {
          deleteButton = document.querySelector(selector);
          if (deleteButton && (deleteButton.textContent?.toLowerCase().includes("delete") || deleteButton.getAttribute("aria-label")?.toLowerCase().includes("delete"))) {
            domLogger.log("[DOM Script] Found delete button with selector:", selector);
            break;
          }
          deleteButton = null;
        }
        if (!deleteButton) {
          const allButtons = document.querySelectorAll('button, [role="menuitem"]');
          for (const btn of allButtons) {
            if (btn.textContent?.toLowerCase().includes("delete") || btn.getAttribute("aria-label")?.toLowerCase().includes("delete")) {
              deleteButton = btn;
              domLogger.log("[DOM Script] Found delete button by text content");
              break;
            }
          }
        }
        if (!deleteButton) {
          domLogger.log("[DOM Script] Delete option not found in dropdown");
          document.body.click();
          return false;
        }
        deleteButton.click();
        await new Promise((resolve) => setTimeout(resolve, 500));
        let confirmButton = null;
        const confirmSelectors = [
          'button[aria-label*="Delete post"]',
          'button[aria-label*="Confirm delete"]',
          'button[data-click-id="deletePost"]',
          'button[data-testid="delete-post-confirm-button"]',
          'button[class*="delete"]',
          'button[class*="confirm"]'
        ];
        for (const selector of confirmSelectors) {
          const buttons = document.querySelectorAll(selector);
          for (const btn of buttons) {
            if (btn.textContent?.toLowerCase().includes("delete") || btn.textContent?.toLowerCase().includes("confirm") || btn.getAttribute("aria-label")?.toLowerCase().includes("delete") || btn.getAttribute("aria-label")?.toLowerCase().includes("confirm")) {
              confirmButton = btn;
              domLogger.log("[DOM Script] Found confirm button with selector:", selector);
              break;
            }
          }
          if (confirmButton)
            break;
        }
        if (!confirmButton) {
          const allButtons = document.querySelectorAll("button");
          for (const btn of allButtons) {
            if (btn.textContent?.toLowerCase().includes("delete post") || btn.textContent?.toLowerCase().includes("confirm delete")) {
              confirmButton = btn;
              domLogger.log("[DOM Script] Found confirm button by text content");
              break;
            }
          }
        }
        if (confirmButton) {
          confirmButton.click();
          domLogger.log("[DOM Script] Delete confirmation clicked");
          await new Promise((resolve) => setTimeout(resolve, 1e3));
          return true;
        } else {
          domLogger.log("[DOM Script] Delete confirmation button not found");
          return false;
        }
      } catch (error) {
        domLogger.error("[DOM Script] Error during post deletion:", error);
        return false;
      }
    }
  });
  var processedMessages = /* @__PURE__ */ new Set();
  window.addEventListener("message", async (event) => {
    const { type, payload } = event.data;
    if (!type || !type.startsWith("REDDIT_POST_MACHINE_")) {
      return;
    }
    const messageId = `${type}-${Date.now()}`;
    const recentKey = `${type}-recent`;
    if (processedMessages.has(recentKey)) {
      return;
    }
    processedMessages.add(recentKey);
    setTimeout(() => processedMessages.delete(recentKey), 500);
    if (type === "REDDIT_POST_MACHINE_FILL_FORM") {
      RedditDOMHelper.fillPostForm(payload);
    } else if (type === "REDDIT_POST_MACHINE_NAVIGATE_PROFILE") {
      const success = await RedditDOMHelper.navigateToUserProfile(payload?.userName);
      window.postMessage({
        type: "REDDIT_POST_MACHINE_ACTION_RESULT",
        action: "NAVIGATE_PROFILE",
        success
      }, "*");
    } else if (type === "REDDIT_POST_MACHINE_NAVIGATE_POSTS") {
      const success = await RedditDOMHelper.navigateToPostsTab(payload?.userName);
      window.postMessage({
        type: "REDDIT_POST_MACHINE_ACTION_RESULT",
        action: "NAVIGATE_POSTS",
        success
      }, "*");
    } else if (type === "REDDIT_POST_MACHINE_DELETE_POST") {
      domLogger.log("[DOM Script] Handling DELETE_POST request:", payload);
      const success = await RedditDOMHelper.deleteLastPost(payload?.post);
      window.postMessage({
        type: "REDDIT_POST_MACHINE_ACTION_RESULT",
        action: "DELETE_POST",
        success,
        data: payload?.post
      }, "*");
    } else if (type === "REDDIT_POST_MACHINE_GET_POSTS") {
      domLogger.log("[DOM Script] Handling GET_POSTS request:", payload);
      const postsData = await RedditDOMHelper.checkUserPosts();
      window.postMessage({
        type: "REDDIT_POST_MACHINE_ACTION_RESULT",
        action: "GET_POSTS",
        success: true,
        data: postsData
      }, "*");
    }
  });

  // .quasar/bex/entry-dom.js
  var bridge = new Bridge({
    listen(_fn) {
    },
    send(data) {
      const payload = {
        ...data,
        from: "bex-dom"
      };
      window.postMessage(payload, "*");
    }
  });
  listenForWindowEvents(bridge, "bex-content-script");
  dom_default(bridge);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCAiLi4vLi4vLnF1YXNhci9iZXgvYnJpZGdlLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xdWFzYXIvc3JjL3V0aWxzL3VpZC91aWQuanMiLCAiLi4vLi4vLnF1YXNhci9iZXgvd2luZG93LWV2ZW50LWxpc3RlbmVyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xdWFzYXIvd3JhcHBlcnMvaW5kZXguanMiLCAiLi4vLi4vc3JjLWJleC9sb2dnZXIuanMiLCAiLi4vLi4vc3JjLWJleC9kb20uanMiLCAiLi4vLi4vLnF1YXNhci9iZXgvZW50cnktZG9tLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUiA9IHR5cGVvZiBSZWZsZWN0ID09PSAnb2JqZWN0JyA/IFJlZmxlY3QgOiBudWxsXG52YXIgUmVmbGVjdEFwcGx5ID0gUiAmJiB0eXBlb2YgUi5hcHBseSA9PT0gJ2Z1bmN0aW9uJ1xuICA/IFIuYXBwbHlcbiAgOiBmdW5jdGlvbiBSZWZsZWN0QXBwbHkodGFyZ2V0LCByZWNlaXZlciwgYXJncykge1xuICAgIHJldHVybiBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbCh0YXJnZXQsIHJlY2VpdmVyLCBhcmdzKTtcbiAgfVxuXG52YXIgUmVmbGVjdE93bktleXNcbmlmIChSICYmIHR5cGVvZiBSLm93bktleXMgPT09ICdmdW5jdGlvbicpIHtcbiAgUmVmbGVjdE93bktleXMgPSBSLm93bktleXNcbn0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykge1xuICBSZWZsZWN0T3duS2V5cyA9IGZ1bmN0aW9uIFJlZmxlY3RPd25LZXlzKHRhcmdldCkge1xuICAgIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0YXJnZXQpXG4gICAgICAuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHModGFyZ2V0KSk7XG4gIH07XG59IGVsc2Uge1xuICBSZWZsZWN0T3duS2V5cyA9IGZ1bmN0aW9uIFJlZmxlY3RPd25LZXlzKHRhcmdldCkge1xuICAgIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0YXJnZXQpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBQcm9jZXNzRW1pdFdhcm5pbmcod2FybmluZykge1xuICBpZiAoY29uc29sZSAmJiBjb25zb2xlLndhcm4pIGNvbnNvbGUud2Fybih3YXJuaW5nKTtcbn1cblxudmFyIE51bWJlcklzTmFOID0gTnVtYmVyLmlzTmFOIHx8IGZ1bmN0aW9uIE51bWJlcklzTmFOKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgRXZlbnRFbWl0dGVyLmluaXQuY2FsbCh0aGlzKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xubW9kdWxlLmV4cG9ydHMub25jZSA9IG9uY2U7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzQ291bnQgPSAwO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG52YXIgZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG5mdW5jdGlvbiBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKSB7XG4gIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBGdW5jdGlvbi4gUmVjZWl2ZWQgdHlwZSAnICsgdHlwZW9mIGxpc3RlbmVyKTtcbiAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnRFbWl0dGVyLCAnZGVmYXVsdE1heExpc3RlbmVycycsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZGVmYXVsdE1heExpc3RlbmVycztcbiAgfSxcbiAgc2V0OiBmdW5jdGlvbihhcmcpIHtcbiAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ251bWJlcicgfHwgYXJnIDwgMCB8fCBOdW1iZXJJc05hTihhcmcpKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVGhlIHZhbHVlIG9mIFwiZGVmYXVsdE1heExpc3RlbmVyc1wiIGlzIG91dCBvZiByYW5nZS4gSXQgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBudW1iZXIuIFJlY2VpdmVkICcgKyBhcmcgKyAnLicpO1xuICAgIH1cbiAgICBkZWZhdWx0TWF4TGlzdGVuZXJzID0gYXJnO1xuICB9XG59KTtcblxuRXZlbnRFbWl0dGVyLmluaXQgPSBmdW5jdGlvbigpIHtcblxuICBpZiAodGhpcy5fZXZlbnRzID09PSB1bmRlZmluZWQgfHxcbiAgICAgIHRoaXMuX2V2ZW50cyA9PT0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLl9ldmVudHMpIHtcbiAgICB0aGlzLl9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgfVxuXG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59O1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMobikge1xuICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInIHx8IG4gPCAwIHx8IE51bWJlcklzTmFOKG4pKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RoZSB2YWx1ZSBvZiBcIm5cIiBpcyBvdXQgb2YgcmFuZ2UuIEl0IG11c3QgYmUgYSBub24tbmVnYXRpdmUgbnVtYmVyLiBSZWNlaXZlZCAnICsgbiArICcuJyk7XG4gIH1cbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiBfZ2V0TWF4TGlzdGVuZXJzKHRoYXQpIHtcbiAgaWYgKHRoYXQuX21heExpc3RlbmVycyA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgcmV0dXJuIHRoYXQuX21heExpc3RlbmVycztcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5nZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBnZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiBfZ2V0TWF4TGlzdGVuZXJzKHRoaXMpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdCh0eXBlKSB7XG4gIHZhciBhcmdzID0gW107XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSBhcmdzLnB1c2goYXJndW1lbnRzW2ldKTtcbiAgdmFyIGRvRXJyb3IgPSAodHlwZSA9PT0gJ2Vycm9yJyk7XG5cbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgaWYgKGV2ZW50cyAhPT0gdW5kZWZpbmVkKVxuICAgIGRvRXJyb3IgPSAoZG9FcnJvciAmJiBldmVudHMuZXJyb3IgPT09IHVuZGVmaW5lZCk7XG4gIGVsc2UgaWYgKCFkb0Vycm9yKVxuICAgIHJldHVybiBmYWxzZTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmIChkb0Vycm9yKSB7XG4gICAgdmFyIGVyO1xuICAgIGlmIChhcmdzLmxlbmd0aCA+IDApXG4gICAgICBlciA9IGFyZ3NbMF07XG4gICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIC8vIE5vdGU6IFRoZSBjb21tZW50cyBvbiB0aGUgYHRocm93YCBsaW5lcyBhcmUgaW50ZW50aW9uYWwsIHRoZXkgc2hvd1xuICAgICAgLy8gdXAgaW4gTm9kZSdzIG91dHB1dCBpZiB0aGlzIHJlc3VsdHMgaW4gYW4gdW5oYW5kbGVkIGV4Y2VwdGlvbi5cbiAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgIH1cbiAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcignVW5oYW5kbGVkIGVycm9yLicgKyAoZXIgPyAnICgnICsgZXIubWVzc2FnZSArICcpJyA6ICcnKSk7XG4gICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICB0aHJvdyBlcnI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gIH1cblxuICB2YXIgaGFuZGxlciA9IGV2ZW50c1t0eXBlXTtcblxuICBpZiAoaGFuZGxlciA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICBSZWZsZWN0QXBwbHkoaGFuZGxlciwgdGhpcywgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIFJlZmxlY3RBcHBseShsaXN0ZW5lcnNbaV0sIHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5mdW5jdGlvbiBfYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgcHJlcGVuZCkge1xuICB2YXIgbTtcbiAgdmFyIGV2ZW50cztcbiAgdmFyIGV4aXN0aW5nO1xuXG4gIGNoZWNrTGlzdGVuZXIobGlzdGVuZXIpO1xuXG4gIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuICBpZiAoZXZlbnRzID09PSB1bmRlZmluZWQpIHtcbiAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgdGFyZ2V0Ll9ldmVudHNDb3VudCA9IDA7XG4gIH0gZWxzZSB7XG4gICAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gICAgaWYgKGV2ZW50cy5uZXdMaXN0ZW5lciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0YXJnZXQuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgPyBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICAgICAgLy8gUmUtYXNzaWduIGBldmVudHNgIGJlY2F1c2UgYSBuZXdMaXN0ZW5lciBoYW5kbGVyIGNvdWxkIGhhdmUgY2F1c2VkIHRoZVxuICAgICAgLy8gdGhpcy5fZXZlbnRzIHRvIGJlIGFzc2lnbmVkIHRvIGEgbmV3IG9iamVjdFxuICAgICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gICAgfVxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdO1xuICB9XG5cbiAgaWYgKGV4aXN0aW5nID09PSB1bmRlZmluZWQpIHtcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICAgICsrdGFyZ2V0Ll9ldmVudHNDb3VudDtcbiAgfSBlbHNlIHtcbiAgICBpZiAodHlwZW9mIGV4aXN0aW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID1cbiAgICAgICAgcHJlcGVuZCA/IFtsaXN0ZW5lciwgZXhpc3RpbmddIDogW2V4aXN0aW5nLCBsaXN0ZW5lcl07XG4gICAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgfSBlbHNlIGlmIChwcmVwZW5kKSB7XG4gICAgICBleGlzdGluZy51bnNoaWZ0KGxpc3RlbmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhpc3RpbmcucHVzaChsaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgICBtID0gX2dldE1heExpc3RlbmVycyh0YXJnZXQpO1xuICAgIGlmIChtID4gMCAmJiBleGlzdGluZy5sZW5ndGggPiBtICYmICFleGlzdGluZy53YXJuZWQpIHtcbiAgICAgIGV4aXN0aW5nLndhcm5lZCA9IHRydWU7XG4gICAgICAvLyBObyBlcnJvciBjb2RlIGZvciB0aGlzIHNpbmNlIGl0IGlzIGEgV2FybmluZ1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXJlc3RyaWN0ZWQtc3ludGF4XG4gICAgICB2YXIgdyA9IG5ldyBFcnJvcignUG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSBsZWFrIGRldGVjdGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmcubGVuZ3RoICsgJyAnICsgU3RyaW5nKHR5cGUpICsgJyBsaXN0ZW5lcnMgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdhZGRlZC4gVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdpbmNyZWFzZSBsaW1pdCcpO1xuICAgICAgdy5uYW1lID0gJ01heExpc3RlbmVyc0V4Y2VlZGVkV2FybmluZyc7XG4gICAgICB3LmVtaXR0ZXIgPSB0YXJnZXQ7XG4gICAgICB3LnR5cGUgPSB0eXBlO1xuICAgICAgdy5jb3VudCA9IGV4aXN0aW5nLmxlbmd0aDtcbiAgICAgIFByb2Nlc3NFbWl0V2FybmluZyh3KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24gYWRkTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgZmFsc2UpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucHJlcGVuZExpc3RlbmVyID1cbiAgICBmdW5jdGlvbiBwcmVwZW5kTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgdHlwZSwgbGlzdGVuZXIsIHRydWUpO1xuICAgIH07XG5cbmZ1bmN0aW9uIG9uY2VXcmFwcGVyKCkge1xuICBpZiAoIXRoaXMuZmlyZWQpIHtcbiAgICB0aGlzLnRhcmdldC5yZW1vdmVMaXN0ZW5lcih0aGlzLnR5cGUsIHRoaXMud3JhcEZuKTtcbiAgICB0aGlzLmZpcmVkID0gdHJ1ZTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQpO1xuICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmFwcGx5KHRoaXMudGFyZ2V0LCBhcmd1bWVudHMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9vbmNlV3JhcCh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBzdGF0ZSA9IHsgZmlyZWQ6IGZhbHNlLCB3cmFwRm46IHVuZGVmaW5lZCwgdGFyZ2V0OiB0YXJnZXQsIHR5cGU6IHR5cGUsIGxpc3RlbmVyOiBsaXN0ZW5lciB9O1xuICB2YXIgd3JhcHBlZCA9IG9uY2VXcmFwcGVyLmJpbmQoc3RhdGUpO1xuICB3cmFwcGVkLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHN0YXRlLndyYXBGbiA9IHdyYXBwZWQ7XG4gIHJldHVybiB3cmFwcGVkO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGNoZWNrTGlzdGVuZXIobGlzdGVuZXIpO1xuICB0aGlzLm9uKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucHJlcGVuZE9uY2VMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZE9uY2VMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICB0aGlzLnByZXBlbmRMaXN0ZW5lcih0eXBlLCBfb25jZVdyYXAodGhpcywgdHlwZSwgbGlzdGVuZXIpKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbi8vIEVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZiBhbmQgb25seSBpZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbiAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgdmFyIGxpc3QsIGV2ZW50cywgcG9zaXRpb24sIGksIG9yaWdpbmFsTGlzdGVuZXI7XG5cbiAgICAgIGNoZWNrTGlzdGVuZXIobGlzdGVuZXIpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoZXZlbnRzID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICBsaXN0ID0gZXZlbnRzW3R5cGVdO1xuICAgICAgaWYgKGxpc3QgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fCBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICAgIGlmIChldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdC5saXN0ZW5lciB8fCBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGxpc3QgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcG9zaXRpb24gPSAtMTtcblxuICAgICAgICBmb3IgKGkgPSBsaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8IGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBvcmlnaW5hbExpc3RlbmVyID0gbGlzdFtpXS5saXN0ZW5lcjtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uID09PSAwKVxuICAgICAgICAgIGxpc3Quc2hpZnQoKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgc3BsaWNlT25lKGxpc3QsIHBvc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSlcbiAgICAgICAgICBldmVudHNbdHlwZV0gPSBsaXN0WzBdO1xuXG4gICAgICAgIGlmIChldmVudHMucmVtb3ZlTGlzdGVuZXIgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgb3JpZ2luYWxMaXN0ZW5lciB8fCBsaXN0ZW5lcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyh0eXBlKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzLCBldmVudHMsIGk7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmIChldmVudHMgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgICAgIGlmIChldmVudHMucmVtb3ZlTGlzdGVuZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50c1t0eXBlXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApXG4gICAgICAgICAgICB0aGlzLl9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhldmVudHMpO1xuICAgICAgICB2YXIga2V5O1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICAgICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgbGlzdGVuZXJzID0gZXZlbnRzW3R5cGVdO1xuXG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gICAgICB9IGVsc2UgaWYgKGxpc3RlbmVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIExJRk8gb3JkZXJcbiAgICAgICAgZm9yIChpID0gbGlzdGVuZXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbmZ1bmN0aW9uIF9saXN0ZW5lcnModGFyZ2V0LCB0eXBlLCB1bndyYXApIHtcbiAgdmFyIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuXG4gIGlmIChldmVudHMgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gW107XG5cbiAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG4gIGlmIChldmxpc3RlbmVyID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIFtdO1xuXG4gIGlmICh0eXBlb2YgZXZsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJylcbiAgICByZXR1cm4gdW53cmFwID8gW2V2bGlzdGVuZXIubGlzdGVuZXIgfHwgZXZsaXN0ZW5lcl0gOiBbZXZsaXN0ZW5lcl07XG5cbiAgcmV0dXJuIHVud3JhcCA/XG4gICAgdW53cmFwTGlzdGVuZXJzKGV2bGlzdGVuZXIpIDogYXJyYXlDbG9uZShldmxpc3RlbmVyLCBldmxpc3RlbmVyLmxlbmd0aCk7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKHR5cGUpIHtcbiAgcmV0dXJuIF9saXN0ZW5lcnModGhpcywgdHlwZSwgdHJ1ZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJhd0xpc3RlbmVycyA9IGZ1bmN0aW9uIHJhd0xpc3RlbmVycyh0eXBlKSB7XG4gIHJldHVybiBfbGlzdGVuZXJzKHRoaXMsIHR5cGUsIGZhbHNlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICBpZiAodHlwZW9mIGVtaXR0ZXIubGlzdGVuZXJDb3VudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGxpc3RlbmVyQ291bnQuY2FsbChlbWl0dGVyLCB0eXBlKTtcbiAgfVxufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gbGlzdGVuZXJDb3VudDtcbmZ1bmN0aW9uIGxpc3RlbmVyQ291bnQodHlwZSkge1xuICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuXG4gIGlmIChldmVudHMgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9IGVsc2UgaWYgKGV2bGlzdGVuZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAwO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmV2ZW50TmFtZXMgPSBmdW5jdGlvbiBldmVudE5hbWVzKCkge1xuICByZXR1cm4gdGhpcy5fZXZlbnRzQ291bnQgPiAwID8gUmVmbGVjdE93bktleXModGhpcy5fZXZlbnRzKSA6IFtdO1xufTtcblxuZnVuY3Rpb24gYXJyYXlDbG9uZShhcnIsIG4pIHtcbiAgdmFyIGNvcHkgPSBuZXcgQXJyYXkobik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKVxuICAgIGNvcHlbaV0gPSBhcnJbaV07XG4gIHJldHVybiBjb3B5O1xufVxuXG5mdW5jdGlvbiBzcGxpY2VPbmUobGlzdCwgaW5kZXgpIHtcbiAgZm9yICg7IGluZGV4ICsgMSA8IGxpc3QubGVuZ3RoOyBpbmRleCsrKVxuICAgIGxpc3RbaW5kZXhdID0gbGlzdFtpbmRleCArIDFdO1xuICBsaXN0LnBvcCgpO1xufVxuXG5mdW5jdGlvbiB1bndyYXBMaXN0ZW5lcnMoYXJyKSB7XG4gIHZhciByZXQgPSBuZXcgQXJyYXkoYXJyLmxlbmd0aCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmV0Lmxlbmd0aDsgKytpKSB7XG4gICAgcmV0W2ldID0gYXJyW2ldLmxpc3RlbmVyIHx8IGFycltpXTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBvbmNlKGVtaXR0ZXIsIG5hbWUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICBmdW5jdGlvbiBlcnJvckxpc3RlbmVyKGVycikge1xuICAgICAgZW1pdHRlci5yZW1vdmVMaXN0ZW5lcihuYW1lLCByZXNvbHZlcik7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNvbHZlcigpIHtcbiAgICAgIGlmICh0eXBlb2YgZW1pdHRlci5yZW1vdmVMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIGVycm9yTGlzdGVuZXIpO1xuICAgICAgfVxuICAgICAgcmVzb2x2ZShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgIH07XG5cbiAgICBldmVudFRhcmdldEFnbm9zdGljQWRkTGlzdGVuZXIoZW1pdHRlciwgbmFtZSwgcmVzb2x2ZXIsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICBpZiAobmFtZSAhPT0gJ2Vycm9yJykge1xuICAgICAgYWRkRXJyb3JIYW5kbGVySWZFdmVudEVtaXR0ZXIoZW1pdHRlciwgZXJyb3JMaXN0ZW5lciwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGFkZEVycm9ySGFuZGxlcklmRXZlbnRFbWl0dGVyKGVtaXR0ZXIsIGhhbmRsZXIsIGZsYWdzKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGV2ZW50VGFyZ2V0QWdub3N0aWNBZGRMaXN0ZW5lcihlbWl0dGVyLCAnZXJyb3InLCBoYW5kbGVyLCBmbGFncyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXZlbnRUYXJnZXRBZ25vc3RpY0FkZExpc3RlbmVyKGVtaXR0ZXIsIG5hbWUsIGxpc3RlbmVyLCBmbGFncykge1xuICBpZiAodHlwZW9mIGVtaXR0ZXIub24gPT09ICdmdW5jdGlvbicpIHtcbiAgICBpZiAoZmxhZ3Mub25jZSkge1xuICAgICAgZW1pdHRlci5vbmNlKG5hbWUsIGxpc3RlbmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW1pdHRlci5vbihuYW1lLCBsaXN0ZW5lcik7XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiBlbWl0dGVyLmFkZEV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBFdmVudFRhcmdldCBkb2VzIG5vdCBoYXZlIGBlcnJvcmAgZXZlbnQgc2VtYW50aWNzIGxpa2UgTm9kZVxuICAgIC8vIEV2ZW50RW1pdHRlcnMsIHdlIGRvIG5vdCBsaXN0ZW4gZm9yIGBlcnJvcmAgZXZlbnRzIGhlcmUuXG4gICAgZW1pdHRlci5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGZ1bmN0aW9uIHdyYXBMaXN0ZW5lcihhcmcpIHtcbiAgICAgIC8vIElFIGRvZXMgbm90IGhhdmUgYnVpbHRpbiBgeyBvbmNlOiB0cnVlIH1gIHN1cHBvcnQgc28gd2VcbiAgICAgIC8vIGhhdmUgdG8gZG8gaXQgbWFudWFsbHkuXG4gICAgICBpZiAoZmxhZ3Mub25jZSkge1xuICAgICAgICBlbWl0dGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgd3JhcExpc3RlbmVyKTtcbiAgICAgIH1cbiAgICAgIGxpc3RlbmVyKGFyZyk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIFwiZW1pdHRlclwiIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBFdmVudEVtaXR0ZXIuIFJlY2VpdmVkIHR5cGUgJyArIHR5cGVvZiBlbWl0dGVyKTtcbiAgfVxufVxuIiwgIi8qIGVzbGludC1kaXNhYmxlICovXG4vKipcbiAqIFRISVMgRklMRSBJUyBHRU5FUkFURUQgQVVUT01BVElDQUxMWS5cbiAqIERPIE5PVCBFRElULlxuICoqL1xuXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnXG5pbXBvcnQgdWlkIGZyb20gJ3F1YXNhci9zcmMvdXRpbHMvdWlkL3VpZC5qcydcblxuY29uc3RcbiAgdHlwZVNpemVzID0ge1xuICAgICd1bmRlZmluZWQnOiAoKSA9PiAwLFxuICAgICdib29sZWFuJzogKCkgPT4gNCxcbiAgICAnbnVtYmVyJzogKCkgPT4gOCxcbiAgICAnc3RyaW5nJzogaXRlbSA9PiAyICogaXRlbS5sZW5ndGgsXG4gICAgJ29iamVjdCc6IGl0ZW0gPT4gIWl0ZW0gPyAwIDogT2JqZWN0XG4gICAgICAua2V5cyhpdGVtKVxuICAgICAgLnJlZHVjZSgodG90YWwsIGtleSkgPT4gc2l6ZU9mKGtleSkgKyBzaXplT2YoaXRlbVtrZXldKSArIHRvdGFsLCAwKVxuICB9LFxuICBzaXplT2YgPSB2YWx1ZSA9PiB0eXBlU2l6ZXNbdHlwZW9mIHZhbHVlXSh2YWx1ZSlcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnJpZGdlIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IgKHdhbGwpIHtcbiAgICBzdXBlcigpXG5cbiAgICB0aGlzLnNldE1heExpc3RlbmVycyhJbmZpbml0eSlcbiAgICB0aGlzLndhbGwgPSB3YWxsXG5cbiAgICB3YWxsLmxpc3RlbihtZXNzYWdlcyA9PiB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShtZXNzYWdlcykpIHtcbiAgICAgICAgbWVzc2FnZXMuZm9yRWFjaChtZXNzYWdlID0+IHRoaXMuX2VtaXQobWVzc2FnZSkpXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5fZW1pdChtZXNzYWdlcylcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5fc2VuZGluZ1F1ZXVlID0gW11cbiAgICB0aGlzLl9zZW5kaW5nID0gZmFsc2VcbiAgICB0aGlzLl9tYXhNZXNzYWdlU2l6ZSA9IDMyICogMTAyNCAqIDEwMjQgLy8gMzJtYlxuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgYW4gZXZlbnQuXG4gICAqXG4gICAqIEBwYXJhbSBldmVudFxuICAgKiBAcGFyYW0gcGF5bG9hZFxuICAgKiBAcmV0dXJucyBQcm9taXNlPD5cbiAgICovXG4gIHNlbmQgKGV2ZW50LCBwYXlsb2FkKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbmQoW3sgZXZlbnQsIHBheWxvYWQgfV0pXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGFsbCByZWdpc3RlcmVkIGV2ZW50c1xuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIGdldEV2ZW50cyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2V2ZW50c1xuICB9XG5cbiAgb24oZXZlbnROYW1lLCBsaXN0ZW5lcikge1xuICAgIHJldHVybiBzdXBlci5vbihldmVudE5hbWUsIChvcmlnaW5hbFBheWxvYWQpID0+IHtcbiAgICAgIGxpc3RlbmVyKHtcbiAgICAgICAgLi4ub3JpZ2luYWxQYXlsb2FkLFxuICAgICAgICAvLyBDb252ZW5pZW50IGFsdGVybmF0aXZlIHRvIHRoZSBtYW51YWwgdXNhZ2Ugb2YgYGV2ZW50UmVzcG9uc2VLZXlgXG4gICAgICAgIC8vIFdlIGNhbid0IHNlbmQgdGhpcyBpbiBgX25leHRTZW5kYCB3aGljaCB3aWxsIHRoZW4gYmUgc2VudCB1c2luZyBgcG9ydC5wb3N0TWVzc2FnZSgpYCwgd2hpY2ggY2FuJ3Qgc2VyaWFsaXplIGZ1bmN0aW9ucy5cbiAgICAgICAgLy8gU28sIHdlIGhvb2sgaW50byB0aGUgdW5kZXJseWluZyBsaXN0ZW5lciBhbmQgaW5jbHVkZSB0aGUgZnVuY3Rpb24gdGhlcmUsIHdoaWNoIGhhcHBlbnMgYWZ0ZXIgdGhlIHNlbmQgb3BlcmF0aW9uLlxuICAgICAgICByZXNwb25kOiAocGF5bG9hZCAvKiBvcHRpb25hbCAqLykgPT4gdGhpcy5zZW5kKG9yaWdpbmFsUGF5bG9hZC5ldmVudFJlc3BvbnNlS2V5LCBwYXlsb2FkKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgX2VtaXQgKG1lc3NhZ2UpIHtcbiAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLmVtaXQobWVzc2FnZSlcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmVtaXQobWVzc2FnZS5ldmVudCwgbWVzc2FnZS5wYXlsb2FkKVxuICAgIH1cbiAgfVxuXG4gIF9zZW5kIChtZXNzYWdlcykge1xuICAgIHRoaXMuX3NlbmRpbmdRdWV1ZS5wdXNoKG1lc3NhZ2VzKVxuICAgIHJldHVybiB0aGlzLl9uZXh0U2VuZCgpXG4gIH1cblxuICBfbmV4dFNlbmQgKCkge1xuICAgIGlmICghdGhpcy5fc2VuZGluZ1F1ZXVlLmxlbmd0aCB8fCB0aGlzLl9zZW5kaW5nKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICB0aGlzLl9zZW5kaW5nID0gdHJ1ZVxuXG4gICAgY29uc3RcbiAgICAgIG1lc3NhZ2VzID0gdGhpcy5fc2VuZGluZ1F1ZXVlLnNoaWZ0KCksXG4gICAgICBjdXJyZW50TWVzc2FnZSA9IG1lc3NhZ2VzWzBdLFxuICAgICAgZXZlbnRMaXN0ZW5lcktleSA9IGAke2N1cnJlbnRNZXNzYWdlLmV2ZW50fS4ke3VpZCgpfWAsXG4gICAgICBldmVudFJlc3BvbnNlS2V5ID0gZXZlbnRMaXN0ZW5lcktleSArICcucmVzdWx0J1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBhbGxDaHVua3MgPSBbXVxuXG4gICAgICBjb25zdCBmbiA9IChyKSA9PiB7XG4gICAgICAgIC8vIElmIHRoaXMgaXMgYSBzcGxpdCBtZXNzYWdlIHRoZW4ga2VlcCBsaXN0ZW5pbmcgZm9yIHRoZSBjaHVua3MgYW5kIGJ1aWxkIGEgbGlzdCB0byByZXNvbHZlXG4gICAgICAgIGlmIChyICE9PSB2b2lkIDAgJiYgci5fY2h1bmtTcGxpdCkge1xuICAgICAgICAgIGNvbnN0IGNodW5rRGF0YSA9IHIuX2NodW5rU3BsaXRcbiAgICAgICAgICBhbGxDaHVua3MgPSBbLi4uYWxsQ2h1bmtzLCAuLi5yLmRhdGFdXG5cbiAgICAgICAgICAvLyBMYXN0IGNodW5rIHJlY2VpdmVkIHNvIHJlc29sdmUgdGhlIHByb21pc2UuXG4gICAgICAgICAgaWYgKGNodW5rRGF0YS5sYXN0Q2h1bmspIHtcbiAgICAgICAgICAgIHRoaXMub2ZmKGV2ZW50UmVzcG9uc2VLZXksIGZuKVxuICAgICAgICAgICAgcmVzb2x2ZShhbGxDaHVua3MpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMub2ZmKGV2ZW50UmVzcG9uc2VLZXksIGZuKVxuICAgICAgICAgIHJlc29sdmUocilcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLm9uKGV2ZW50UmVzcG9uc2VLZXksIGZuKVxuXG4gICAgICB0cnkge1xuICAgICAgICAvLyBBZGQgYW4gZXZlbnQgcmVzcG9uc2Uga2V5IHRvIHRoZSBwYXlsb2FkIHdlJ3JlIHNlbmRpbmcgc28gdGhlIG1lc3NhZ2Uga25vd3Mgd2hpY2ggY2hhbm5lbCB0byByZXNwb25kIG9uLlxuICAgICAgICBjb25zdCBtZXNzYWdlc1RvU2VuZCA9IG1lc3NhZ2VzLm1hcChtID0+IHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4ubSxcbiAgICAgICAgICAgIC4uLntcbiAgICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICAgIGRhdGE6IG0ucGF5bG9hZCxcbiAgICAgICAgICAgICAgICBldmVudFJlc3BvbnNlS2V5XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy53YWxsLnNlbmQobWVzc2FnZXNUb1NlbmQpXG4gICAgICB9XG4gICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9ICdNZXNzYWdlIGxlbmd0aCBleGNlZWRlZCBtYXhpbXVtIGFsbG93ZWQgbGVuZ3RoLidcblxuICAgICAgICBpZiAoZXJyLm1lc3NhZ2UgPT09IGVycm9yTWVzc2FnZSkge1xuICAgICAgICAgIC8vIElmIHRoZSBwYXlsb2FkIGlzIGFuIGFycmF5IGFuZCB0b28gYmlnIHRoZW4gc3BsaXQgaXQgaW50byBjaHVua3MgYW5kIHNlbmQgdG8gdGhlIGNsaWVudHMgYnJpZGdlXG4gICAgICAgICAgLy8gdGhlIGNsaWVudCBicmlkZ2Ugd2lsbCB0aGVuIHJlc29sdmUgdGhlIHByb21pc2UuXG4gICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGN1cnJlbnRNZXNzYWdlLnBheWxvYWQpKSB7XG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yTWVzc2FnZSArICcgTm90ZTogVGhlIGJyaWRnZSBjYW4gZGVhbCB3aXRoIHRoaXMgaXMgaWYgdGhlIHBheWxvYWQgaXMgYW4gQXJyYXkuJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBvYmplY3RTaXplID0gc2l6ZU9mKGN1cnJlbnRNZXNzYWdlKVxuXG4gICAgICAgICAgICBpZiAob2JqZWN0U2l6ZSA+IHRoaXMuX21heE1lc3NhZ2VTaXplKSB7XG4gICAgICAgICAgICAgIGNvbnN0XG4gICAgICAgICAgICAgICAgY2h1bmtzUmVxdWlyZWQgPSBNYXRoLmNlaWwob2JqZWN0U2l6ZSAvIHRoaXMuX21heE1lc3NhZ2VTaXplKSxcbiAgICAgICAgICAgICAgICBhcnJheUl0ZW1Db3VudCA9IE1hdGguY2VpbChjdXJyZW50TWVzc2FnZS5wYXlsb2FkLmxlbmd0aCAvIGNodW5rc1JlcXVpcmVkKVxuXG4gICAgICAgICAgICAgIGxldCBkYXRhID0gY3VycmVudE1lc3NhZ2UucGF5bG9hZFxuICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNodW5rc1JlcXVpcmVkOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgdGFrZSA9IE1hdGgubWluKGRhdGEubGVuZ3RoLCBhcnJheUl0ZW1Db3VudClcblxuICAgICAgICAgICAgICAgIHRoaXMud2FsbC5zZW5kKFt7XG4gICAgICAgICAgICAgICAgICBldmVudDogY3VycmVudE1lc3NhZ2UuZXZlbnQsXG4gICAgICAgICAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICAgICAgICAgIF9jaHVua1NwbGl0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgY291bnQ6IGNodW5rc1JlcXVpcmVkLFxuICAgICAgICAgICAgICAgICAgICAgIGxhc3RDaHVuazogaSA9PT0gY2h1bmtzUmVxdWlyZWQgLSAxXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEuc3BsaWNlKDAsIHRha2UpXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5fc2VuZGluZyA9IGZhbHNlXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHsgcmV0dXJuIHRoaXMuX25leHRTZW5kKCkgfSwgMTYpXG4gICAgfSlcbiAgfVxufVxuIiwgIi8qKlxuICogQmFzZWQgb24gdGhlIHdvcmsgb2YgaHR0cHM6Ly9naXRodWIuY29tL2pjaG9vay91dWlkLXJhbmRvbVxuICovXG5cbmxldFxuICBidWYsXG4gIGJ1ZklkeCA9IDBcbmNvbnN0IGhleEJ5dGVzID0gbmV3IEFycmF5KDI1NilcblxuLy8gUHJlLWNhbGN1bGF0ZSB0b1N0cmluZygxNikgZm9yIHNwZWVkXG5mb3IgKGxldCBpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG4gIGhleEJ5dGVzWyBpIF0gPSAoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG59XG5cbi8vIFVzZSBiZXN0IGF2YWlsYWJsZSBQUk5HXG5jb25zdCByYW5kb21CeXRlcyA9ICgoKSA9PiB7XG4gIC8vIE5vZGUgJiBCcm93c2VyIHN1cHBvcnRcbiAgY29uc3QgbGliID0gdHlwZW9mIGNyeXB0byAhPT0gJ3VuZGVmaW5lZCdcbiAgICA/IGNyeXB0b1xuICAgIDogKFxuICAgICAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgID8gd2luZG93LmNyeXB0byB8fCB3aW5kb3cubXNDcnlwdG9cbiAgICAgICAgICA6IHZvaWQgMFxuICAgICAgKVxuXG4gIGlmIChsaWIgIT09IHZvaWQgMCkge1xuICAgIGlmIChsaWIucmFuZG9tQnl0ZXMgIT09IHZvaWQgMCkge1xuICAgICAgcmV0dXJuIGxpYi5yYW5kb21CeXRlc1xuICAgIH1cbiAgICBpZiAobGliLmdldFJhbmRvbVZhbHVlcyAhPT0gdm9pZCAwKSB7XG4gICAgICByZXR1cm4gbiA9PiB7XG4gICAgICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkobilcbiAgICAgICAgbGliLmdldFJhbmRvbVZhbHVlcyhieXRlcylcbiAgICAgICAgcmV0dXJuIGJ5dGVzXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG4gPT4ge1xuICAgIGNvbnN0IHIgPSBbXVxuICAgIGZvciAobGV0IGkgPSBuOyBpID4gMDsgaS0tKSB7XG4gICAgICByLnB1c2goTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjU2KSlcbiAgICB9XG4gICAgcmV0dXJuIHJcbiAgfVxufSkoKVxuXG4vLyBCdWZmZXIgcmFuZG9tIG51bWJlcnMgZm9yIHNwZWVkXG4vLyBSZWR1Y2UgbWVtb3J5IHVzYWdlIGJ5IGRlY3JlYXNpbmcgdGhpcyBudW1iZXIgKG1pbiAxNilcbi8vIG9yIGltcHJvdmUgc3BlZWQgYnkgaW5jcmVhc2luZyB0aGlzIG51bWJlciAodHJ5IDE2Mzg0KVxuY29uc3QgQlVGRkVSX1NJWkUgPSA0MDk2XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcbiAgLy8gQnVmZmVyIHNvbWUgcmFuZG9tIGJ5dGVzIGZvciBzcGVlZFxuICBpZiAoYnVmID09PSB2b2lkIDAgfHwgKGJ1ZklkeCArIDE2ID4gQlVGRkVSX1NJWkUpKSB7XG4gICAgYnVmSWR4ID0gMFxuICAgIGJ1ZiA9IHJhbmRvbUJ5dGVzKEJVRkZFUl9TSVpFKVxuICB9XG5cbiAgY29uc3QgYiA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGJ1ZiwgYnVmSWR4LCAoYnVmSWR4ICs9IDE2KSlcbiAgYlsgNiBdID0gKGJbIDYgXSAmIDB4MGYpIHwgMHg0MFxuICBiWyA4IF0gPSAoYlsgOCBdICYgMHgzZikgfCAweDgwXG5cbiAgcmV0dXJuIGhleEJ5dGVzWyBiWyAwIF0gXSArIGhleEJ5dGVzWyBiWyAxIF0gXVxuICAgICsgaGV4Qnl0ZXNbIGJbIDIgXSBdICsgaGV4Qnl0ZXNbIGJbIDMgXSBdICsgJy0nXG4gICAgKyBoZXhCeXRlc1sgYlsgNCBdIF0gKyBoZXhCeXRlc1sgYlsgNSBdIF0gKyAnLSdcbiAgICArIGhleEJ5dGVzWyBiWyA2IF0gXSArIGhleEJ5dGVzWyBiWyA3IF0gXSArICctJ1xuICAgICsgaGV4Qnl0ZXNbIGJbIDggXSBdICsgaGV4Qnl0ZXNbIGJbIDkgXSBdICsgJy0nXG4gICAgKyBoZXhCeXRlc1sgYlsgMTAgXSBdICsgaGV4Qnl0ZXNbIGJbIDExIF0gXVxuICAgICsgaGV4Qnl0ZXNbIGJbIDEyIF0gXSArIGhleEJ5dGVzWyBiWyAxMyBdIF1cbiAgICArIGhleEJ5dGVzWyBiWyAxNCBdIF0gKyBoZXhCeXRlc1sgYlsgMTUgXSBdXG59XG4iLCAiLyogZXNsaW50LWRpc2FibGUgKi9cbi8qKlxuICogVEhJUyBGSUxFIElTIEdFTkVSQVRFRCBBVVRPTUFUSUNBTExZLlxuICogRE8gTk9UIEVESVQuXG4gKiovXG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGFkZCBhIGdlbmVyaWMgd2luZG93cyBldmVudCBsaXN0ZW5lciB0byB0aGUgcGFnZVxuICogd2hpY2ggYWN0cyBhcyBhIGJyaWRnZSBiZXR3ZWVuIHRoZSB3ZWIgcGFnZSBhbmQgdGhlIGNvbnRlbnQgc2NyaXB0IGJyaWRnZS5cbiAqIEBwYXJhbSBicmlkZ2VcbiAqIEBwYXJhbSB0eXBlXG4gKi9cbmV4cG9ydCBjb25zdCBsaXN0ZW5Gb3JXaW5kb3dFdmVudHMgPSAoYnJpZGdlLCB0eXBlKSA9PiB7XG4gIC8vIExpc3RlbiBmb3IgYW55IGV2ZW50cyBmcm9tIHRoZSB3ZWIgcGFnZSBhbmQgdHJhbnNtaXQgdG8gdGhlIEJFWCBicmlkZ2UuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgcGF5bG9hZCA9PiB7XG4gICAgLy8gV2Ugb25seSBhY2NlcHQgbWVzc2FnZXMgZnJvbSB0aGlzIHdpbmRvdyB0byBpdHNlbGYgW2kuZS4gbm90IGZyb20gYW55IGlmcmFtZXNdXG4gICAgaWYgKHBheWxvYWQuc291cmNlICE9PSB3aW5kb3cpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChwYXlsb2FkLmRhdGEuZnJvbSAhPT0gdm9pZCAwICYmIHBheWxvYWQuZGF0YS5mcm9tID09PSB0eXBlKSB7XG4gICAgICBjb25zdFxuICAgICAgICBldmVudERhdGEgPSBwYXlsb2FkLmRhdGFbMF0sXG4gICAgICAgIGJyaWRnZUV2ZW50cyA9IGJyaWRnZS5nZXRFdmVudHMoKVxuXG4gICAgICBmb3IgKGxldCBldmVudCBpbiBicmlkZ2VFdmVudHMpIHtcbiAgICAgICAgaWYgKGV2ZW50ID09PSBldmVudERhdGEuZXZlbnQpIHtcbiAgICAgICAgICBicmlkZ2VFdmVudHNbZXZlbnRdKGV2ZW50RGF0YS5wYXlsb2FkKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCBmYWxzZSlcbn1cbiIsICIvLyBGdW5jdGlvbnMgaW4gdGhpcyBmaWxlIGFyZSBuby1vcCxcbi8vICB0aGV5IGp1c3QgdGFrZSBhIGNhbGxiYWNrIGZ1bmN0aW9uIGFuZCByZXR1cm4gaXRcbi8vIFRoZXkncmUgdXNlZCB0byBhcHBseSB0eXBpbmdzIHRvIHRoZSBjYWxsYmFja1xuLy8gIHBhcmFtZXRlcnMgYW5kIHJldHVybiB2YWx1ZSB3aGVuIHVzaW5nIFF1YXNhciB3aXRoIFR5cGVTY3JpcHRcbi8vIFdlIG5lZWQgdGhlc2UgaW4gYHVpYCBmb2xkZXIgdG8gbWFrZSBgcXVhc2FyL3dyYXBwZXJgIGltcG9ydCB3b3JrLFxuLy8gIGJ1dCB0aGV5IGFyZSB1c2VmdWwgb25seSBmb3IgUXVhc2FyIENMSSBwcm9qZWN0c1xuLy8gVGhleSBhcmUgdHlwZWQgdmlhIG1vZHVsZSBhdWdtZW50YXRpb24gYnkgYEBxdWFzYXIvYXBwLXdlYnBhY2tgIC8gYEBxdWFzYXIvYXBwLXZpdGVgXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBXYXJuaW5nIVxuICogQWxsIHRoZXNlIGFyZSBkZXByZWNhdGVkIHN0YXJ0aW5nIHdpdGhcbiAqICAgIEBxdWFzYXIvYXBwLXZpdGUgdjJcbiAqICAgIEBxdWFzYXIvYXBwLXdlYnBhY2sgdjRcbiAqXG4gKiBVc2UgdGhlIG5ldyB3cmFwcGVycyBmcm9tICNxLWFwcC93cmFwcGVyc1xuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmV4cG9ydCBmdW5jdGlvbiBib290IChjYWxsYmFjaykge1xuICByZXR1cm4gY2FsbGJhY2tcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZSAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVGZXRjaCAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb3V0ZSAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9yZSAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzc3JNaWRkbGV3YXJlIChjYWxsYmFjaykge1xuICByZXR1cm4gY2FsbGJhY2tcbn1cblxuLyoqXG4gKiBCZWxvdyBvbmx5IGZvciBAcXVhc2FyL2FwcC13ZWJwYWNrIHYzXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNzclByb2R1Y3Rpb25FeHBvcnQgKGNhbGxiYWNrKSB7XG4gIHJldHVybiBjYWxsYmFja1xufVxuXG4vKipcbiAqIEJlbG93IG9ubHkgZm9yIEBxdWFzYXIvYXBwLXZpdGUgdjFcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3NyQ3JlYXRlIChjYWxsYmFjaykge1xuICByZXR1cm4gY2FsbGJhY2tcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNzckxpc3RlbiAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzc3JDbG9zZSAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzc3JTZXJ2ZVN0YXRpY0NvbnRlbnQgKGNhbGxiYWNrKSB7XG4gIHJldHVybiBjYWxsYmFja1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3NyUmVuZGVyUHJlbG9hZFRhZyAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbi8qKlxuICogQmVsb3cgb25seSBmb3IgbGVnYWN5IEBxdWFzYXIvYXBwLXZpdGUgdjEgJiBAcXVhc2FyL2FwcC13ZWJwYWNrIHYzXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGJleEJhY2tncm91bmQgKGNhbGxiYWNrKSB7XG4gIHJldHVybiBjYWxsYmFja1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV4Q29udGVudCAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXhEb20gKGNhbGxiYWNrKSB7XG4gIHJldHVybiBjYWxsYmFja1xufVxuIiwgIi8vIFNpbXBsZSBsb2dnZXIgZm9yIGJyb3dzZXIgZXh0ZW5zaW9uIGNvbnRleHQgc2NyaXB0c1xuY2xhc3MgRXh0ZW5zaW9uTG9nZ2VyIHtcbiAgY29uc3RydWN0b3IocHJlZml4ID0gJycpIHtcbiAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgICB0aGlzLmRlYnVnRW5hYmxlZCA9IHRydWU7IC8vIFNldCB0byB0cnVlIGZvciBkZWJ1Z2dpbmdcbiAgfVxuXG4gIGFzeW5jIGNoZWNrRGVidWdTZXR0aW5nKCkge1xuICAgIHRyeSB7XG4gICAgICAvLyBDaGVjayBpZiBkZWJ1ZyBtb2RlIGlzIGVuYWJsZWQgaW4gc3RvcmFnZVxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsnZGVidWdNb2RlJ10pO1xuICAgICAgLy8gRm9yIGJhY2tncm91bmQgc2NyaXB0cywgYWx3YXlzIGVuYWJsZSBsb2dnaW5nIHJlZ2FyZGxlc3Mgb2Ygc3RvcmFnZSBzZXR0aW5nXG4gICAgICB0aGlzLmRlYnVnRW5hYmxlZCA9IHRydWU7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIElmIHN0b3JhZ2UgaXMgbm90IGF2YWlsYWJsZSwga2VlcCBjdXJyZW50IHNldHRpbmdcbiAgICB9XG4gIH1cblxuICBsb2coLi4uYXJncykge1xuICAgIGlmICh0aGlzLmRlYnVnRW5hYmxlZCkge1xuICAgICAgY29uc29sZS5sb2codGhpcy5wcmVmaXgsIC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGluZm8oLi4uYXJncykge1xuICAgIGlmICh0aGlzLmRlYnVnRW5hYmxlZCkge1xuICAgICAgY29uc29sZS5pbmZvKHRoaXMucHJlZml4LCAuLi5hcmdzKTtcbiAgICB9XG4gIH1cblxuICB3YXJuKC4uLmFyZ3MpIHtcbiAgICAvLyBBbHdheXMgc2hvdyB3YXJuaW5nc1xuICAgIGNvbnNvbGUud2Fybih0aGlzLnByZWZpeCwgLi4uYXJncyk7XG4gIH1cblxuICBlcnJvciguLi5hcmdzKSB7XG4gICAgLy8gQWx3YXlzIHNob3cgZXJyb3JzXG4gICAgY29uc29sZS5lcnJvcih0aGlzLnByZWZpeCwgLi4uYXJncyk7XG4gIH1cblxuICBkZWJ1ZyguLi5hcmdzKSB7XG4gICAgaWYgKHRoaXMuZGVidWdFbmFibGVkKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKHRoaXMucHJlZml4LCAuLi5hcmdzKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gQ3JlYXRlIGxvZ2dlciBpbnN0YW5jZXMgZm9yIGRpZmZlcmVudCBjb250ZXh0c1xuZXhwb3J0IGNvbnN0IGRvbUxvZ2dlciA9IG5ldyBFeHRlbnNpb25Mb2dnZXIoJ1tET00gU2NyaXB0XScpO1xuZXhwb3J0IGNvbnN0IGJnTG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW0JHXScpO1xuZXhwb3J0IGNvbnN0IHN0YXRzTG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW1N0YXRzXScpO1xuZXhwb3J0IGNvbnN0IG1zZ0xvZ2dlciA9IG5ldyBFeHRlbnNpb25Mb2dnZXIoJ1tNZXNzYWdlXScpO1xuZXhwb3J0IGNvbnN0IHBvc3RTZXJ2aWNlTG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW1Bvc3REYXRhU2VydmljZV0nKTtcbmV4cG9ydCBjb25zdCBzdGF0ZUxvZ2dlciA9IG5ldyBFeHRlbnNpb25Mb2dnZXIoJ1tBdXRvRmxvd1N0YXRlTWFuYWdlcl0nKTtcbmV4cG9ydCBjb25zdCBjb250ZW50TG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW0NvbnRlbnQgU2NyaXB0XScpO1xuZXhwb3J0IGNvbnN0IHN1Ym1pdExvZ2dlciA9IG5ldyBFeHRlbnNpb25Mb2dnZXIoJ1tTdWJtaXQgU2NyaXB0XScpO1xuXG4vLyBJbml0aWFsaXplIGRlYnVnIHNldHRpbmcgZm9yIGFsbCBsb2dnZXJzXG5jb25zdCBpbml0RGVidWdNb2RlID0gYXN5bmMgKCkgPT4ge1xuICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgZG9tTG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKCksXG4gICAgYmdMb2dnZXIuY2hlY2tEZWJ1Z1NldHRpbmcoKSxcbiAgICBzdGF0c0xvZ2dlci5jaGVja0RlYnVnU2V0dGluZygpLFxuICAgIG1zZ0xvZ2dlci5jaGVja0RlYnVnU2V0dGluZygpLFxuICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKCksXG4gICAgc3RhdGVMb2dnZXIuY2hlY2tEZWJ1Z1NldHRpbmcoKSxcbiAgICBjb250ZW50TG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKCksXG4gICAgc3VibWl0TG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKClcbiAgXSk7XG59O1xuXG4vLyBBdXRvLWluaXRpYWxpemVcbmluaXREZWJ1Z01vZGUoKTtcbiIsICIvKipcbiAqIERPTSBzY3JpcHQgZm9yIFJlZGRpdCBQb3N0IE1hY2hpbmUgQkVYXG4gKiBUaGlzIHNjcmlwdCBydW5zIGluIHRoZSBjb250ZXh0IG9mIHdlYiBwYWdlcyB0byBoYW5kbGUgRE9NIG1hbmlwdWxhdGlvblxuICovXG5pbXBvcnQgeyBiZXhEb20gfSBmcm9tICdxdWFzYXIvd3JhcHBlcnMnXG5pbXBvcnQgeyBkb21Mb2dnZXIgfSBmcm9tICcuL2xvZ2dlci5qcydcblxuLy8gSW5pdGlhbGl6ZSBET00gc2NyaXB0XG5kb21Mb2dnZXIubG9nKCdSZWRkaXQgUG9zdCBNYWNoaW5lIERPTSBzY3JpcHQgbG9hZGVkJylcblxuLy8gRE9NIG1hbmlwdWxhdGlvbiB1dGlsaXRpZXMgZm9yIFJlZGRpdCBwYWdlc1xuY29uc3QgUmVkZGl0RE9NSGVscGVyID0ge1xuICAvLyBEZWVwIHF1ZXJ5IGZvciBTaGFkb3cgRE9NIHRyYXZlcnNhbFxuICBkZWVwUXVlcnkoc2VsZWN0b3IsIHJvb3QgPSBkb2N1bWVudCkge1xuICAgIGNvbnN0IGVsID0gcm9vdC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuICAgIGlmIChlbCkgcmV0dXJuIGVsXG4gICAgZm9yIChjb25zdCBlbGVtIG9mIHJvb3QucXVlcnlTZWxlY3RvckFsbCgnKicpKSB7XG4gICAgICBpZiAoZWxlbS5zaGFkb3dSb290KSB7XG4gICAgICAgIGNvbnN0IGZvdW5kID0gdGhpcy5kZWVwUXVlcnkoc2VsZWN0b3IsIGVsZW0uc2hhZG93Um9vdClcbiAgICAgICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmRcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfSxcblxuICAvLyBBc3luYyBzbGVlcCBoZWxwZXJcbiAgYXN5bmMgc2xlZXAobXMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIG1zKSlcbiAgfSxcblxuICAvLyBSb2J1c3Qgd2FpdCBmb3IgZWxlbWVudCB1c2luZyBkZWVwUXVlcnlcbiAgYXN5bmMgd2FpdEZvckVsZW1lbnQoc2VsZWN0b3IsIHRpbWVvdXQgPSAxMDAwMCkge1xuICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgIHdoaWxlIChEYXRlLm5vdygpIC0gc3RhcnQgPCB0aW1lb3V0KSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5kZWVwUXVlcnkoc2VsZWN0b3IpXG4gICAgICBpZiAoZWxlbWVudCkgcmV0dXJuIGVsZW1lbnRcbiAgICAgIGF3YWl0IHRoaXMuc2xlZXAoMTAwKVxuICAgIH1cbiAgICByZXR1cm4gbnVsbFxuICB9LFxuXG4gIC8vIEdldCBjdXJyZW50IFJlZGRpdCBwYWdlIGluZm9cbiAgZ2V0UGFnZUluZm8oKSB7XG4gICAgY29uc3QgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcbiAgICBjb25zdCBwYXRobmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZVxuXG4gICAgbGV0IHBhZ2VUeXBlID0gJ3Vua25vd24nXG4gICAgbGV0IHN1YnJlZGRpdCA9IG51bGxcblxuICAgIGlmIChwYXRobmFtZS5pbmNsdWRlcygnL3N1Ym1pdCcpKSB7XG4gICAgICBwYWdlVHlwZSA9ICdzdWJtaXQnXG4gICAgfSBlbHNlIGlmIChwYXRobmFtZS5pbmNsdWRlcygnL3IvJykpIHtcbiAgICAgIHBhZ2VUeXBlID0gJ3N1YnJlZGRpdCdcbiAgICAgIGNvbnN0IG1hdGNoID0gcGF0aG5hbWUubWF0Y2goL1xcL3JcXC8oW15cXC9dKykvKVxuICAgICAgaWYgKG1hdGNoKSBzdWJyZWRkaXQgPSBtYXRjaFsxXVxuICAgIH0gZWxzZSBpZiAocGF0aG5hbWUgPT09ICcvJyB8fCBwYXRobmFtZS5pbmNsdWRlcygnL2hvdCcpIHx8IHBhdGhuYW1lLmluY2x1ZGVzKCcvbmV3JykpIHtcbiAgICAgIHBhZ2VUeXBlID0gJ2hvbWUnXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHVybCxcbiAgICAgIHBhdGhuYW1lLFxuICAgICAgcGFnZVR5cGUsXG4gICAgICBzdWJyZWRkaXQsXG4gICAgICBpc09sZFJlZGRpdDogdXJsLmluY2x1ZGVzKCdvbGQucmVkZGl0LmNvbScpLFxuICAgICAgaXNOZXdSZWRkaXQ6IHVybC5pbmNsdWRlcygnd3d3LnJlZGRpdC5jb20nKSAmJiAhdXJsLmluY2x1ZGVzKCdvbGQucmVkZGl0LmNvbScpXG4gICAgfVxuICB9LFxuXG4gIGFzeW5jIGNsaWNrVGFiKHRhYlZhbHVlKSB7XG4gICAgZG9tTG9nZ2VyLmxvZyhgQ2xpY2tpbmcgdGFiIHdpdGggZGF0YS1zZWxlY3QtdmFsdWU9XCIke3RhYlZhbHVlfVwiYClcbiAgICBjb25zdCB0YWIgPSB0aGlzLmRlZXBRdWVyeShgW2RhdGEtc2VsZWN0LXZhbHVlPVwiJHt0YWJWYWx1ZX1cIl1gKVxuICAgIGlmICh0YWIpIHtcbiAgICAgIHRhYi5jbGljaygpXG4gICAgICBhd2FpdCB0aGlzLnNsZWVwKDIwMDApXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBkb21Mb2dnZXIubG9nKGBUYWIgd2l0aCBkYXRhLXNlbGVjdC12YWx1ZT1cIiR7dGFiVmFsdWV9XCIgbm90IGZvdW5kYClcbiAgICByZXR1cm4gZmFsc2VcbiAgfSxcblxuICBhc3luYyBmaWxsVGl0bGUodGl0bGVUZXh0KSB7XG4gICAgZG9tTG9nZ2VyLmxvZygnRmlsbGluZyB0aXRsZS4uLicpXG4gICAgY29uc3QgdGl0bGVJbnB1dEVsZW1lbnQgPSB0aGlzLmRlZXBRdWVyeSgnZmFjZXBsYXRlLXRleHRhcmVhLWlucHV0W25hbWU9XCJ0aXRsZVwiXScpXG4gICAgaWYgKHRpdGxlSW5wdXRFbGVtZW50KSB7XG4gICAgICBjb25zdCBzaGFkb3dSb290ID0gdGl0bGVJbnB1dEVsZW1lbnQuc2hhZG93Um9vdFxuICAgICAgaWYgKHNoYWRvd1Jvb3QpIHtcbiAgICAgICAgY29uc3QgdGl0bGVJbnB1dCA9IHNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2lubmVyVGV4dEFyZWEnKVxuICAgICAgICBpZiAodGl0bGVJbnB1dCkge1xuICAgICAgICAgIHRpdGxlSW5wdXQuZm9jdXMoKVxuICAgICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoNTAwKVxuICAgICAgICAgIHRpdGxlSW5wdXQudmFsdWUgPSB0aXRsZVRleHRcbiAgICAgICAgICB0aXRsZUlucHV0LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSwgY2FuY2VsYWJsZTogdHJ1ZSB9KSlcbiAgICAgICAgICB0aXRsZUlucHV0LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnLCB7IGJ1YmJsZXM6IHRydWUsIGNhbmNlbGFibGU6IHRydWUgfSkpXG4gICAgICAgICAgZG9tTG9nZ2VyLmxvZygnVGl0bGUgc2V0JylcbiAgICAgICAgICBhd2FpdCB0aGlzLnNsZWVwKDE1MDApXG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBkb21Mb2dnZXIubG9nKCdGYWlsZWQgdG8gZmlsbCB0aXRsZScpXG4gICAgcmV0dXJuIGZhbHNlXG4gIH0sXG5cbiAgYXN5bmMgZmlsbFVybCh1cmxUZXh0KSB7XG4gICAgZG9tTG9nZ2VyLmxvZygnRmlsbGluZyBVUkwuLi4nKVxuICAgIGNvbnN0IHVybElucHV0RWxlbWVudCA9IHRoaXMuZGVlcFF1ZXJ5KCdmYWNlcGxhdGUtdGV4dGFyZWEtaW5wdXRbbmFtZT1cImxpbmtcIl0nKVxuICAgIGlmICh1cmxJbnB1dEVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IHNoYWRvd1Jvb3QgPSB1cmxJbnB1dEVsZW1lbnQuc2hhZG93Um9vdFxuICAgICAgaWYgKHNoYWRvd1Jvb3QpIHtcbiAgICAgICAgY29uc3QgdXJsSW5wdXQgPSBzaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNpbm5lclRleHRBcmVhJylcbiAgICAgICAgaWYgKHVybElucHV0KSB7XG4gICAgICAgICAgdXJsSW5wdXQuZm9jdXMoKVxuICAgICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoNTAwKVxuICAgICAgICAgIHVybElucHV0LnZhbHVlID0gdXJsVGV4dFxuICAgICAgICAgIHVybElucHV0LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSwgY2FuY2VsYWJsZTogdHJ1ZSB9KSlcbiAgICAgICAgICB1cmxJbnB1dC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJywgeyBidWJibGVzOiB0cnVlLCBjYW5jZWxhYmxlOiB0cnVlIH0pKVxuICAgICAgICAgIGRvbUxvZ2dlci5sb2coJ1VSTCBzZXQnKVxuICAgICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoMTUwMClcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGRvbUxvZ2dlci5sb2coJ0ZhaWxlZCB0byBmaWxsIFVSTCcpXG4gICAgcmV0dXJuIGZhbHNlXG4gIH0sXG5cbiAgYXN5bmMgY2xpY2tCb2R5RmllbGQoKSB7XG4gICAgZG9tTG9nZ2VyLmxvZygnQ2xpY2tpbmcgYm9keSB0ZXh0IGZpZWxkIHRvIGFjdGl2YXRlIFBvc3QgYnV0dG9uLi4uJylcbiAgICBjb25zdCBib2R5Q29tcG9zZXIgPSB0aGlzLmRlZXBRdWVyeSgnc2hyZWRkaXQtY29tcG9zZXJbbmFtZT1cIm9wdGlvbmFsQm9keVwiXScpXG4gICAgaWYgKGJvZHlDb21wb3Nlcikge1xuICAgICAgY29uc3QgYm9keUVkaXRhYmxlID0gYm9keUNvbXBvc2VyLnF1ZXJ5U2VsZWN0b3IoJ2Rpdltjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCJdW2RhdGEtbGV4aWNhbC1lZGl0b3I9XCJ0cnVlXCJdJylcbiAgICAgIGlmIChib2R5RWRpdGFibGUpIHtcbiAgICAgICAgZG9tTG9nZ2VyLmxvZygnRm91bmQgTGV4aWNhbCBlZGl0b3IsIGNsaWNraW5nLi4uJylcbiAgICAgICAgYm9keUVkaXRhYmxlLmNsaWNrKClcbiAgICAgICAgYXdhaXQgdGhpcy5zbGVlcCgxMDApXG4gICAgICAgIGJvZHlFZGl0YWJsZS5mb2N1cygpXG4gICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoMTAwKVxuICAgICAgICBib2R5RWRpdGFibGUuY2xpY2soKVxuICAgICAgICBib2R5RWRpdGFibGUuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2ZvY3VzJywgeyBidWJibGVzOiB0cnVlLCBjYW5jZWxhYmxlOiB0cnVlIH0pKVxuICAgICAgICBib2R5RWRpdGFibGUuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NsaWNrJywgeyBidWJibGVzOiB0cnVlLCBjYW5jZWxhYmxlOiB0cnVlIH0pKVxuICAgICAgICBhd2FpdCB0aGlzLnNsZWVwKDEwMDApXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfVxuICAgIGRvbUxvZ2dlci5sb2coJ0JvZHkgdGV4dCBmaWVsZCBub3QgZm91bmQnKVxuICAgIHJldHVybiBmYWxzZVxuICB9LFxuXG4gIGFzeW5jIGZpbGxCb2R5VGV4dChib2R5VGV4dCkge1xuICAgIGRvbUxvZ2dlci5sb2coJ0ZpbGxpbmcgYm9keSB0ZXh0Li4uJylcbiAgICBjb25zdCBib2R5Q29tcG9zZXIgPSB0aGlzLmRlZXBRdWVyeSgnc2hyZWRkaXQtY29tcG9zZXJbbmFtZT1cIm9wdGlvbmFsQm9keVwiXScpXG4gICAgaWYgKGJvZHlDb21wb3Nlcikge1xuICAgICAgY29uc3QgYm9keUVkaXRhYmxlID0gYm9keUNvbXBvc2VyLnF1ZXJ5U2VsZWN0b3IoJ2Rpdltjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCJdW2RhdGEtbGV4aWNhbC1lZGl0b3I9XCJ0cnVlXCJdJylcbiAgICAgIGlmIChib2R5RWRpdGFibGUpIHtcbiAgICAgICAgZG9tTG9nZ2VyLmxvZygnRm91bmQgTGV4aWNhbCBlZGl0b3IsIHNldHRpbmcgdGV4dC4uLicpXG4gICAgICAgIGJvZHlFZGl0YWJsZS5mb2N1cygpXG4gICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoNTAwKVxuICAgICAgICBcbiAgICAgICAgLy8gQ2xlYXIgbG9naWMgaWYgbmVlZGVkLCBidXQgaGVyZSB3ZSBqdXN0IHNldCBpbm5lckhUTUwgZm9yIHNpbXBsaWNpdHkgYXMgYmFzZVxuICAgICAgICAvLyBPciBzdHJpY3RseSBmb2xsb3cgdGhlIGNoYXJhY3Rlci1ieS1jaGFyYWN0ZXIgaWYgbmVlZGVkLiBcbiAgICAgICAgLy8gRm9yIHNpbXBsaWNpdHkgaW4gdGhpcyBwb3J0LCB3ZSdsbCB0cnkgdGhlIGRpcmVjdCBpbm5lckhUTUwgKyBldmVudCBzaW11bGF0aW9uIGFwcHJvYWNoIGZpcnN0IFxuICAgICAgICAvLyBhcyB0aGUgY2hhcmFjdGVyIGxvb3AgaXMgdmVyeSBzbG93LCBidXQgd2UgY2FuIGluY2x1ZGUgdGhlIGxvb3AgaWYgcm9idXN0IG1hdGNoZXMgcmVxdWlyZSBpdC5cbiAgICAgICAgLy8gTGV0J3MgdXNlIGEgc2xpZ2h0bHkgb3B0aW1pemVkIHZlcnNpb24gb2YgdGhlIGxvb3AgZnJvbSBsZWdhY3kuXG4gICAgICAgIFxuICAgICAgICBib2R5RWRpdGFibGUuaW5uZXJIVE1MID0gJzxwPjxicj48L3A+J1xuICAgICAgICBcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBib2R5VGV4dC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGNoYXIgPSBib2R5VGV4dFtpXVxuICAgICAgICAgIFxuICAgICAgICAgIGJvZHlFZGl0YWJsZS5kaXNwYXRjaEV2ZW50KG5ldyBLZXlib2FyZEV2ZW50KCdrZXlkb3duJywge1xuICAgICAgICAgICAga2V5OiBjaGFyLFxuICAgICAgICAgICAgY29kZTogY2hhciA9PT0gJyAnID8gJ1NwYWNlJyA6IGBLZXkke2NoYXIudG9VcHBlckNhc2UoKX1gLFxuICAgICAgICAgICAga2V5Q29kZTogY2hhci5jaGFyQ29kZUF0KDApLFxuICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWVcbiAgICAgICAgICB9KSlcblxuICAgICAgICAgIC8vIFRyeSBleGVjQ29tbWFuZCBmb3IgdGV4dCBpbnNlcnRpb25cbiAgICAgICAgICBjb25zdCBpbnNlcnRlZCA9IGRvY3VtZW50LmV4ZWNDb21tYW5kKCdpbnNlcnRUZXh0JywgZmFsc2UsIGNoYXIpXG4gICAgICAgICAgaWYgKCFpbnNlcnRlZCkge1xuICAgICAgICAgICAgIC8vIEZhbGxiYWNrIGZvciBuZXdlciBicm93c2VycyB0aGF0IG1pZ2h0IGJsb2NrIGV4ZWNDb21tYW5kIG9yIGlmIGl0IGZhaWxzXG4gICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpXG4gICAgICAgICAgICAgaWYgKHNlbGVjdGlvbi5yYW5nZUNvdW50ID4gMCkge1xuICAgICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0UmFuZ2VBdCgwKVxuICAgICAgICAgICAgICAgcmFuZ2UuZGVsZXRlQ29udGVudHMoKVxuICAgICAgICAgICAgICAgcmFuZ2UuaW5zZXJ0Tm9kZShkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjaGFyKSlcbiAgICAgICAgICAgICAgIHJhbmdlLmNvbGxhcHNlKGZhbHNlKSAvLyBtb3ZlIHRvIGVuZFxuICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBib2R5RWRpdGFibGUuZGlzcGF0Y2hFdmVudChuZXcgSW5wdXRFdmVudCgnaW5wdXQnLCB7XG4gICAgICAgICAgICAgaW5wdXRUeXBlOiAnaW5zZXJ0VGV4dCcsXG4gICAgICAgICAgICAgZGF0YTogY2hhcixcbiAgICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWVcbiAgICAgICAgICB9KSlcbiAgICAgICAgICBcbiAgICAgICAgICBhd2FpdCB0aGlzLnNsZWVwKDUpIC8vIEZhc3RlciB0aGFuIDEwbXNcbiAgICAgICAgfVxuXG4gICAgICAgIGJvZHlFZGl0YWJsZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJywgeyBidWJibGVzOiB0cnVlLCBjYW5jZWxhYmxlOiB0cnVlIH0pKVxuICAgICAgICBkb21Mb2dnZXIubG9nKCdCb2R5IHRleHQgc2V0IHN1Y2Nlc3NmdWxseScpXG4gICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoMTUwMClcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG4gICAgZG9tTG9nZ2VyLmxvZygnRmFpbGVkIHRvIGZpbmQgYm9keSBlZGl0b3InKVxuICAgIHJldHVybiBmYWxzZVxuICB9LFxuXG4gIC8vIE1haW4gb3JjaGVzdHJhdG9yIGZvciBmaWxsaW5nIHRoZSBmb3JtXG4gIGFzeW5jIGZpbGxQb3N0Rm9ybShkYXRhKSB7XG4gICAgZG9tTG9nZ2VyLmxvZygnU3RhcnRpbmcgcm9idXN0IGZvcm0gZmlsbCB3aXRoIEZyYXBwZSBtb2RlbC4uLicsIGRhdGEpXG4gICAgXG4gICAgLy8gTWFwIEZyYXBwZSBmaWVsZHMgdG8gbG9jYWwgdmFyaWFibGVzXG4gICAgY29uc3Qge1xuICAgICAgICB0aXRsZSxcbiAgICAgICAgc3VicmVkZGl0X25hbWUsIC8vIE5ldyBmaWVsZFxuICAgICAgICBwb3N0X3R5cGUsICAgICAgLy8gXCJUZXh0XCIgb3IgXCJMaW5rXCJcbiAgICAgICAgdXJsX3RvX3NoYXJlLCAgIC8vIFVSTCBpZiBMaW5rIHR5cGVcbiAgICAgICAgYm9keV90ZXh0ICAgICAgIC8vIEJvZHkgaWYgVGV4dCB0eXBlXG4gICAgfSA9IGRhdGE7XG5cbiAgICAvLyAwLiBTZWxlY3QgU3VicmVkZGl0IChpZiBwcm92aWRlZClcbiAgICBpZiAoc3VicmVkZGl0X25hbWUpIHtcbiAgICAgICAgaWYgKGF3YWl0IHRoaXMuc2VsZWN0U3VicmVkZGl0KHN1YnJlZGRpdF9uYW1lKSkge1xuICAgICAgICAgICAgZG9tTG9nZ2VyLmxvZyhgU3VicmVkZGl0ICR7c3VicmVkZGl0X25hbWV9IHNlbGVjdGVkYCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNsZWVwKDEwMDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9tTG9nZ2VyLndhcm4oYEZhaWxlZCB0byBzZWxlY3Qgc3VicmVkZGl0ICR7c3VicmVkZGl0X25hbWV9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZXRlcm1pbmUgdHlwZSBiYXNlZCBvbiBkYXRhXG4gICAgY29uc3QgaXNMaW5rUG9zdCA9IHBvc3RfdHlwZSA9PT0gJ0xpbmsnO1xuICAgIGNvbnN0IHRhcmdldFRhYiA9IGlzTGlua1Bvc3QgPyAnTElOSycgOiAnVEVYVCdcblxuICAgIGRvbUxvZ2dlci5sb2coYFRhcmdldGluZyAke3RhcmdldFRhYn0gdGFiYClcbiAgICBcbiAgICAvLyAxLiBTZWxlY3QgdGhlIGNvcnJlY3QgdGFiXG4gICAgaWYgKGF3YWl0IHRoaXMuY2xpY2tUYWIodGFyZ2V0VGFiKSkge1xuICAgICAgIC8vIDIuIEZpbGwgVGl0bGVcbiAgICAgICBpZiAodGl0bGUpIHtcbiAgICAgICAgIGF3YWl0IHRoaXMuZmlsbFRpdGxlKHRpdGxlKVxuICAgICAgIH1cblxuICAgICAgIC8vIDMuIEZpbGwgQ29udGVudFxuICAgICAgIGlmIChpc0xpbmtQb3N0ICYmIHVybF90b19zaGFyZSkge1xuICAgICAgICAgYXdhaXQgdGhpcy5maWxsVXJsKHVybF90b19zaGFyZSlcbiAgICAgICB9IGVsc2UgaWYgKGJvZHlfdGV4dCkge1xuICAgICAgICAgLy8gQWN0aXZhdGUgYm9keSBmaXJzdFxuICAgICAgICAgYXdhaXQgdGhpcy5jbGlja0JvZHlGaWVsZCgpXG4gICAgICAgICBhd2FpdCB0aGlzLmZpbGxCb2R5VGV4dChib2R5X3RleHQpXG4gICAgICAgICAvLyBSZS1hY3RpdmF0ZSB0byBlbnN1cmUgc3RhdGUgaXMgY2FwdHVyZWRcbiAgICAgICAgIGF3YWl0IHRoaXMuY2xpY2tCb2R5RmllbGQoKVxuICAgICAgIH1cblxuICAgICAgIGRvbUxvZ2dlci5sb2coJ0Zvcm0gZmlsbCBzZXF1ZW5jZSBjb21wbGV0ZWQnKVxuICAgIH0gZWxzZSB7XG4gICAgICAgZG9tTG9nZ2VyLmVycm9yKCdDb3VsZCBub3Qgc3dpdGNoIHRvIHRhcmdldCB0YWInKVxuICAgIH1cbiAgfSxcblxuICBhc3luYyBzZWxlY3RTdWJyZWRkaXQoc3VicmVkZGl0TmFtZSkge1xuICAgICAgZG9tTG9nZ2VyLmxvZyhgU2VsZWN0aW5nIHN1YnJlZGRpdDogJHtzdWJyZWRkaXROYW1lfS4uLmApO1xuICAgICAgXG4gICAgICAvLyAxLiBGaW5kIHRoZSBTZWFyY2ggaW5wdXQgZm9yIHN1YnJlZGRpdFxuICAgICAgLy8gQ29tbW9uIHNlbGVjdG9yIG9uIG5ldyByZWRkaXQgc3VibWl0IHBhZ2VcbiAgICAgIGNvbnN0IHNlYXJjaElucHV0ID0gdGhpcy5kZWVwUXVlcnkoJ2lucHV0W3BsYWNlaG9sZGVyPVwiQ2hvb3NlIGEgY29tbXVuaXR5XCJdLCBpbnB1dFtwbGFjZWhvbGRlcj1cIlNlYXJjaCBmb3IgYSBjb21tdW5pdHlcIl0nKTtcbiAgICAgIFxuICAgICAgaWYgKHNlYXJjaElucHV0KSB7XG4gICAgICAgICAgc2VhcmNoSW5wdXQuY2xpY2soKTtcbiAgICAgICAgICBzZWFyY2hJbnB1dC5mb2N1cygpO1xuICAgICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoNTAwKTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBUeXBlIHRoZSBzdWJyZWRkaXQgbmFtZVxuICAgICAgICAgIC8vIFdlIGNhbiB1c2UgdGhlIGV4ZWNDb21tYW5kIG9yIHZhbHVlIHNldHRlciBhcHByb2FjaFxuICAgICAgICAgIHNlYXJjaElucHV0LnZhbHVlID0gc3VicmVkZGl0TmFtZTtcbiAgICAgICAgICBzZWFyY2hJbnB1dC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoMTAwMCk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gMi4gU2VsZWN0IGZyb20gZHJvcGRvd25cbiAgICAgICAgICAvLyBUaGUgZHJvcGRvd24gdXN1YWxseSBhcHBlYXJzIGluIGEgc3BlY2lmaWMgbGlzdCBjb250YWluZXJcbiAgICAgICAgICAvLyBXZSBsb29rIGZvciBhbiBlbGVtZW50IHRoYXQgbWF0Y2hlcyBleGFjdGx5IG9yIHN0YXJ0cyB3aXRoIHRoZSBuYW1lXG4gICAgICAgICAgXG4gICAgICAgICAgLy8gSGVscGVyIHRvIGZpbmQgdGhlIGRyb3Bkb3duIG9wdGlvblxuICAgICAgICAgIGNvbnN0IGZpbmRPcHRpb24gPSAoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tyb2xlPVwib3B0aW9uXCJdLCBsaVtpZCo9XCJjb21tdW5pdHktXCJdJykpO1xuICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5maW5kKG9wdCA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0gb3B0LnRleHRDb250ZW50Py50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0ID09PSBgci8ke3N1YnJlZGRpdE5hbWUudG9Mb3dlckNhc2UoKX1gIHx8IHRleHQgPT09IHN1YnJlZGRpdE5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBcbiAgICAgICAgICBsZXQgb3B0aW9uID0gZmluZE9wdGlvbigpO1xuICAgICAgICAgIGlmIChvcHRpb24pIHtcbiAgICAgICAgICAgICAgb3B0aW9uLmNsaWNrKCk7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICAvLyBJZiBub3QgZm91bmQgaW1tZWRpYXRlbHksIHdhaXQgYSBiaXRcbiAgICAgICAgICBhd2FpdCB0aGlzLnNsZWVwKDEwMDApO1xuICAgICAgICAgIG9wdGlvbiA9IGZpbmRPcHRpb24oKTtcbiAgICAgICAgICBpZiAob3B0aW9uKSB7XG4gICAgICAgICAgICAgIG9wdGlvbi5jbGljaygpO1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEZhbGxiYWNrIGZvciBvbGRlciBpbnRlcmZhY2VzIG9yIGRpZmZlcmVudCBsYXlvdXRzXG4gICAgICAgICAgLy8gQ2hlY2sgZm9yIGEgc3RhbmRhcmQgc2VsZWN0IGJveCAocmFyZSBvbiBtb2Rlcm4gUmVkZGl0IGJ1dCBwb3NzaWJsZSlcbiAgICAgICAgICBjb25zdCBzZWxlY3RCb3ggPSB0aGlzLmRlZXBRdWVyeSgnc2VsZWN0W25hbWU9XCJzdWJyZWRkaXRcIl0sIHNlbGVjdCNzdWJyZWRkaXQnKTtcbiAgICAgICAgICBpZiAoc2VsZWN0Qm94KSB7XG4gICAgICAgICAgICAgIHNlbGVjdEJveC52YWx1ZSA9IHN1YnJlZGRpdE5hbWU7XG4gICAgICAgICAgICAgIHNlbGVjdEJveC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJywgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLy8gQWRkIGV4dGVuc2lvbiBVSSBlbGVtZW50c1xuICBhZGRFeHRlbnNpb25CdXR0b24oKSB7XG4gICAgY29uc3QgcGFnZUluZm8gPSB0aGlzLmdldFBhZ2VJbmZvKClcbiAgICBcbiAgICAvLyBEb24ndCBhZGQgYnV0dG9uIGlmIG5vdCBvbiBhIHJlbGV2YW50IHBhZ2VcbiAgICBpZiAocGFnZUluZm8ucGFnZVR5cGUgIT09ICdzdWJtaXQnICYmIHBhZ2VJbmZvLnBhZ2VUeXBlICE9PSAnc3VicmVkZGl0JyAmJiBwYWdlSW5mby5wYWdlVHlwZSAhPT0gJ2hvbWUnKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBidXR0b24gYWxyZWFkeSBleGlzdHNcbiAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJlZGRpdC1wb3N0LW1hY2hpbmUtYnRuJykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gICAgYnV0dG9uLmNsYXNzTmFtZSA9ICdyZWRkaXQtcG9zdC1tYWNoaW5lLWJ0bidcbiAgICBidXR0b24uaW5uZXJIVE1MID0gJ1x1RDgzRFx1REU4MCBQb3N0IE1hY2hpbmUnXG4gICAgYnV0dG9uLnN0eWxlLmNzc1RleHQgPSBgXG4gICAgICBiYWNrZ3JvdW5kOiAjMTk3NmQyO1xuICAgICAgY29sb3I6IHdoaXRlO1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgcGFkZGluZzogOHB4IDE2cHg7XG4gICAgICBib3JkZXItcmFkaXVzOiA0cHg7XG4gICAgICBtYXJnaW46IDhweDtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgICAgei1pbmRleDogOTk5OTtcbiAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgIHRvcDogMTBweDtcbiAgICAgIHJpZ2h0OiAxMHB4O1xuICAgIGBcblxuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIC8vIFNlbmQgbWVzc2FnZSB0byBleHRlbnNpb24gcG9wdXBcbiAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgIHR5cGU6ICdSRURESVRfUE9TVF9NQUNISU5FX09QRU4nLFxuICAgICAgICBzb3VyY2U6ICdyZWRkaXQtZG9tJ1xuICAgICAgfSwgJyonKVxuICAgIH0pXG5cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGJ1dHRvbilcbiAgfVxufVxuXG4vLyBJbml0aWFsaXplIHdoZW4gRE9NIGlzIHJlYWR5XG5pZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRpbmcnKSB7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG4gICAvLyBSZWRkaXRET01IZWxwZXIuYWRkRXh0ZW5zaW9uQnV0dG9uKClcbiAgfSlcbn0gZWxzZSB7XG4gIC8vIFJlZGRpdERPTUhlbHBlci5hZGRFeHRlbnNpb25CdXR0b24oKVxufVxuXG4vLyBMaXN0ZW4gZm9yIG1lc3NhZ2VzIGZyb20gZXh0ZW5zaW9uXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIChldmVudCkgPT4ge1xuICBpZiAoZXZlbnQuZGF0YS50eXBlID09PSAnUkVERElUX1BPU1RfTUFDSElORV9GSUxMX0ZPUk0nKSB7XG4gICAgUmVkZGl0RE9NSGVscGVyLmZpbGxQb3N0Rm9ybShldmVudC5kYXRhLnBheWxvYWQpXG4gIH1cbn0pXG5cbi8vIEV4cG9ydCBmb3IgdXNlIGJ5IGNvbnRlbnQgc2NyaXB0c1xud2luZG93LlJlZGRpdERPTUhlbHBlciA9IFJlZGRpdERPTUhlbHBlclxuXG4vLyBFeHBvcnQgZGVmYXVsdCBCRVggRE9NIGhvb2tcbmV4cG9ydCBkZWZhdWx0IGJleERvbSgoYnJpZGdlKSA9PiB7XG4gIGRvbUxvZ2dlci5sb2coJ1JlZGRpdCBQb3N0IE1hY2hpbmUgRE9NIHNjcmlwdCBpbml0aWFsaXplZCcpXG4gIFxuICAvLyBCcmlkZ2UgaXMgYXZhaWxhYmxlIGZvciBjb21tdW5pY2F0aW9uIHdpdGggY29udGVudCBzY3JpcHRcbiAgd2luZG93LmJyaWRnZSA9IGJyaWRnZVxufSlcbi8vIEFkZCBsb2dpYyB0byBoYW5kbGUgdXNlciBzdGF0dXMgY2hlY2tzIGFuZCBuYXZpZ2F0aW9uXG5PYmplY3QuYXNzaWduKFJlZGRpdERPTUhlbHBlciwge1xuICBxc0FsbChzLCByID0gZG9jdW1lbnQpIHsgdHJ5IHsgcmV0dXJuIEFycmF5LmZyb20oKHIgfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwocykpIH0gY2F0Y2ggeyByZXR1cm4gW10gfSB9LFxuXG4gIGNoZWNrQWNjb3VudExvY2tlZCgpIHtcbiAgICBjb25zdCBwaHJhc2VzID0gW1wid2UndmUgbG9ja2VkIHlvdXIgYWNjb3VudFwiLCBcImxvY2tlZCB5b3VyIGFjY291bnRcIiwgXCJhY2NvdW50IHN1c3BlbmRlZFwiXVxuICAgIGNvbnN0IHBhZ2VUZXh0ID0gZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudC50b0xvd2VyQ2FzZSgpXG4gICAgcmV0dXJuIHBocmFzZXMuc29tZShwaHJhc2UgPT4gcGFnZVRleHQuaW5jbHVkZXMocGhyYXNlKSkgfHxcbiAgICAgIHRoaXMucXNBbGwoJ2ZhY2VwbGF0ZS1iYW5uZXJbYXBwZWFyYW5jZT1cImVycm9yXCJdJykuc29tZShlbCA9PlxuICAgICAgICBlbC50ZXh0Q29udGVudD8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnbG9ja2VkJykgfHwgZWwudGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ3N1c3BlbmRlZCcpKVxuICB9LFxuXG4gIGFzeW5jIG9wZW5Vc2VyRHJvcGRvd24oKSB7XG4gICAgZG9tTG9nZ2VyLmxvZygnQXR0ZW1wdGluZyB0byBvcGVuIHVzZXIgZHJvcGRvd24gKHJvYnVzdCkuLi4nKTtcbiAgICBcbiAgICAvLyAxLiBDaGVjayBpZiBhbHJlYWR5IG9wZW4gKG9wdGltaXphdGlvbilcbiAgICBjb25zdCBvcGVuTWVudSA9IHRoaXMucXNBbGwoJ1tyb2xlPVwibWVudVwiXSwgW3JvbGU9XCJkaWFsb2dcIl0sIGZhY2VwbGF0ZS1kcm9wZG93bi1tZW51JykuZmluZChlbCA9PiBcbiAgICAgICAgdGhpcy5pc1Zpc2libGUoZWwpICYmIGVsLnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ3Byb2ZpbGUnKVxuICAgICk7XG4gICAgaWYgKG9wZW5NZW51KSB7XG4gICAgICAgIGRvbUxvZ2dlci5sb2coJ1VzZXIgbWVudSBhcHBlYXJzIHRvIGJlIGFscmVhZHkgb3BlbicpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyAyLiBUcnkgdG8gZmluZCB0aGUgYnV0dG9uXG4gICAgLy8gV2UgcHJpb3JpdGl6ZSB0aGUgbGVnYWN5IHNlbGVjdG9ycyBidXQgYWRkIHZpc2liaWxpdHkgY2hlY2tzXG4gICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAnI2V4cGFuZC11c2VyLWRyYXdlci1idXR0b24nLCAvLyBDb21tb24gb24gbmV3IHJlZGRpdFxuICAgICAgICAnW2RhdGEtdGVzdGlkPVwidXNlci1hdmF0YXJcIl0nLCAvLyBOZXcgcmVkZGl0XG4gICAgICAgICdidXR0b25bYXJpYS1sYWJlbD1cIk9wZW4gdXNlciBtZW51XCJdJyxcbiAgICAgICAgJ2J1dHRvblthcmlhLWxhYmVsPVwiVXNlciBEcmF3ZXJcIl0nLFxuICAgICAgICAnYnV0dG9uW2FyaWEtbGFiZWwqPVwidXNlclwiXScsIC8vIExlZ2FjeSBmYWxsYmFja1xuICAgICAgICAncnBsLWRyb3Bkb3duIGRpdicsIC8vIExlZ2FjeSBmYWxsYmFjayAoZ2VuZXJpYylcbiAgICAgICAgJyN1c2VyLWRyb3Bkb3duLXRyaWdnZXInXG4gICAgXTtcblxuICAgIGxldCBidXR0b24gPSBudWxsO1xuICAgIGZvciAoY29uc3Qgc2VsIG9mIHNlbGVjdG9ycykge1xuICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0gdGhpcy5xc0FsbChzZWwpLmNvbmNhdChBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsKSkpOyAvLyBDaGVjayBib3RoIGhlbHBlcnMganVzdCBpbiBjYXNlXG4gICAgICAgIGZvciAoY29uc3QgZWwgb2YgY2FuZGlkYXRlcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNWaXNpYmxlKGVsKSkge1xuICAgICAgICAgICAgICAgIGJ1dHRvbiA9IGVsO1xuICAgICAgICAgICAgICAgIGRvbUxvZ2dlci5sb2coYEZvdW5kIHVzZXIgbWVudSBidXR0b24gd2l0aCBzZWxlY3RvcjogJHtzZWx9YCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJ1dHRvbikgYnJlYWs7XG4gICAgfVxuICAgIFxuICAgIC8vIERlZXAgcXVlcnkgZmFsbGJhY2sgaWYgc3RhbmRhcmQgc2VsZWN0b3JzIGZhaWxlZFxuICAgIGlmICghYnV0dG9uKSB7XG4gICAgICAgIGJ1dHRvbiA9IHRoaXMuZGVlcFF1ZXJ5KCdidXR0b25bYXJpYS1sYWJlbCo9XCJ1c2VyXCJdLCBbZGF0YS10ZXN0aWQ9XCJ1c2VyLWF2YXRhclwiXScpO1xuICAgIH1cblxuICAgIGlmIChidXR0b24pIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQgc2F5cyBpdCdzIGFscmVhZHkgZXhwYW5kZWRcbiAgICAgICAgaWYgKGJ1dHRvbi5nZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnKSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAgZG9tTG9nZ2VyLmxvZygnQnV0dG9uIHNheXMgbWVudSBpcyBhbHJlYWR5IGV4cGFuZGVkJyk7XG4gICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIZWxwZXIgdG8gY2hlY2sgaWYgbWVudSBpcyBvcGVuXG4gICAgICAgIGNvbnN0IGlzTWVudU9wZW4gPSAoKSA9PiB7XG4gICAgICAgICAgICAgcmV0dXJuIHRoaXMucXNBbGwoJ1tyb2xlPVwibWVudVwiXSwgW3JvbGU9XCJkaWFsb2dcIl0sIGZhY2VwbGF0ZS1kcm9wZG93bi1tZW51Jykuc29tZShlbCA9PiBcbiAgICAgICAgICAgICAgICAgdGhpcy5pc1Zpc2libGUoZWwpICYmIGVsLnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ3Byb2ZpbGUnKVxuICAgICAgICAgICAgICkgfHwgYnV0dG9uLmdldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcpID09PSAndHJ1ZSc7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQXR0ZW1wdCBjbGljayB3aXRoIHJldHJ5XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjsgaSsrKSB7XG4gICAgICAgICAgICBkb21Mb2dnZXIubG9nKGBDbGlja2luZyB1c2VyIG1lbnUgYnV0dG9uIChBdHRlbXB0ICR7aSsxfS8yKS4uLmApO1xuICAgICAgICAgICAgYnV0dG9uLmNsaWNrKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNsZWVwKDIwMDApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoaXNNZW51T3BlbigpKSB7XG4gICAgICAgICAgICAgICAgZG9tTG9nZ2VyLmxvZygnVXNlciBtZW51IGNvbmZpcm1lZCBvcGVuLicpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9tTG9nZ2VyLmxvZygnXHVEODNEXHVERDA0IE5hdmlnYXRpb24gZmFsbGJhY2s6IFVzZXIgbWVudSBub3QgZGV0ZWN0ZWQgb3BlbiwgcmV0cnlpbmcuLi4nKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZG9tTG9nZ2VyLmxvZygnXHVEODNEXHVERDA0IE5hdmlnYXRpb24gZmFsbGJhY2s6IFVzaW5nIGRpcmVjdCBVUkwgbmF2aWdhdGlvbiBzaW5jZSBtZW51IGFwcHJvYWNoIGZhaWxlZCcpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIGRvbUxvZ2dlci5sb2coJ1VzZXIgZHJvcGRvd24gYnV0dG9uIG5vdCBmb3VuZCcpO1xuICAgIHJldHVybiBmYWxzZVxuICB9LFxuXG4gIGFzeW5jIGdldFVzZXJuYW1lKCkge1xuICAgIC8vIFRyeSB0byBnZXQgZnJvbSBVUkwgZmlyc3QgaWYgb24gdXNlciBwcm9maWxlXG4gICAgY29uc3QgdXJsTWF0Y2ggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubWF0Y2goL1xcL3VzZXJcXC8oW15cXC9dKykvKVxuICAgIGlmICh1cmxNYXRjaCkgcmV0dXJuICd1LycgKyB1cmxNYXRjaFsxXVxuXG4gICAgaWYgKCFhd2FpdCB0aGlzLm9wZW5Vc2VyRHJvcGRvd24oKSkgcmV0dXJuIG51bGxcbiAgICBhd2FpdCB0aGlzLnNsZWVwKDE1MDApXG4gICAgXG4gICAgLy8gTG9vayBmb3IgdXNlcm5hbWUgaW4gZHJvcGRvd25cbiAgICBjb25zdCB1c2VyRWxlbWVudCA9IHRoaXMucXNBbGwoJ3NwYW4udGV4dC0xMi50ZXh0LXNlY29uZGFyeS13ZWFrLCBbaWQqPVwidXNlci1kcmF3ZXJcIl0gc3BhbiwgLnRleHQtMTInKS5maW5kKGVsID0+XG4gICAgICBlbC50ZXh0Q29udGVudD8udHJpbSgpLnN0YXJ0c1dpdGgoJ3UvJykpXG4gICAgICBcbiAgICBpZiAodXNlckVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IHVzZXJuYW1lID0gdXNlckVsZW1lbnQudGV4dENvbnRlbnQudHJpbSgpXG4gICAgICAvLyBDbG9zZSBkcm9wZG93blxuICAgICAgdXNlckVsZW1lbnQuY2xpY2soKVxuICAgICAgYXdhaXQgdGhpcy5zbGVlcCg1MDApXG4gICAgICByZXR1cm4gdXNlcm5hbWVcbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfSxcblxuICAvLyBDaGVjayBpZiBlbGVtZW50IGlzIHZpc2libGVcbiAgaXNWaXNpYmxlKGVsKSB7XG4gICAgICByZXR1cm4gISEoZWwub2Zmc2V0V2lkdGggfHwgZWwub2Zmc2V0SGVpZ2h0IHx8IGVsLmdldENsaWVudFJlY3RzKCkubGVuZ3RoKTtcbiAgfSxcblxuICAvLyBSb2J1c3RseSBmaW5kIGVsZW1lbnQgYnkgdGV4dCBjb250ZW50IGFjcm9zcyBTaGFkb3cgRE9Nc1xuICBkZWVwRmluZEJ5VGV4dCh0ZXh0LCB0YWcgPSAnKicsIHJvb3QgPSBkb2N1bWVudCkge1xuICAgIC8vIDEuIFNlYXJjaCBpbiBjdXJyZW50IHJvb3QgZm9yIG1hdGNoZXNcbiAgICAvLyBSRVZFUlNFIHRoZSBhcnJheSB0byBmaW5kIGRlZXBlc3QvbGVhZiBlbGVtZW50cyBmaXJzdFxuICAgIGNvbnN0IGVsZW1lbnRzID0gQXJyYXkuZnJvbShyb290LnF1ZXJ5U2VsZWN0b3JBbGwodGFnKSkucmV2ZXJzZSgpO1xuICAgIGNvbnN0IGlnbm9yZWRUYWdzID0gWydIVE1MJywgJ0JPRFknLCAnSEVBRCcsICdTQ1JJUFQnLCAnU1RZTEUnLCAnTk9TQ1JJUFQnXTtcbiAgICBcbiAgICBmb3IgKGNvbnN0IGVsIG9mIGVsZW1lbnRzKSB7XG4gICAgICAgIGlmIChpZ25vcmVkVGFncy5pbmNsdWRlcyhlbC50YWdOYW1lKSkgY29udGludWU7XG5cbiAgICAgICAgLy8gRW5zdXJlIGV4YWN0aXNoIG1hdGNoIGFuZCB2aXNpYmlsaXR5XG4gICAgICAgIC8vIFByaW9yaXRpemUgZXhhY3QgbWF0Y2gsIGJ1dCBhbGxvdyBpbmNsdWRlcyBpZiBpdCdzIHRpZ2h0XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBlbC50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICBpZiAoKGNvbnRlbnQgPT09IHRleHQgfHwgKGNvbnRlbnQ/LmluY2x1ZGVzKHRleHQpICYmIGNvbnRlbnQubGVuZ3RoIDwgdGV4dC5sZW5ndGggKyA1MCkpICYmIHRoaXMuaXNWaXNpYmxlKGVsKSkge1xuICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIDIuIFJlY3Vyc2UgaW50byBtYXRjaGluZyBTaGFkb3cgRE9Nc1xuICAgIC8vIFdlIG11c3QgY2hlY2sgQUxMIGVsZW1lbnRzIGZvciBzaGFkb3cgcm9vdHMsIG5vdCBqdXN0ICd0YWcnIG1hdGNoZXNcbiAgICBjb25zdCBhbGxFbGVtZW50cyA9IEFycmF5LmZyb20ocm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcqJykpO1xuICAgIGZvciAoY29uc3QgZWwgb2YgYWxsRWxlbWVudHMpIHtcbiAgICAgICAgaWYgKGVsLnNoYWRvd1Jvb3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGZvdW5kID0gdGhpcy5kZWVwRmluZEJ5VGV4dCh0ZXh0LCB0YWcsIGVsLnNoYWRvd1Jvb3QpO1xuICAgICAgICAgICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgYXN5bmMgbmF2aWdhdGVUb1VzZXJQcm9maWxlKHVzZXJuYW1lKSB7XG4gICAgZG9tTG9nZ2VyLmxvZyhgTmF2aWdhdGluZyB0byB1c2VyIHByb2ZpbGUuLi4gVGFyZ2V0OiAke3VzZXJuYW1lfWApXG5cbiAgICAvLyAwLiBEaXJlY3QgbmF2aWdhdGlvbiBpZiB1c2VybmFtZSBpcyBwcm92aWRlZCBhbmQgd2Ugd2FudCB0byBiZSBzYWZlXG4gICAgLy8gVGhpcyBtaW1pY3MgbGVnYWN5IGJlaGF2aW9yIHdoaWNoIHdhcyByb2J1c3RcbiAgICBjb25zdCBjbGVhblVzZXJuYW1lID0gdXNlcm5hbWUgPyB1c2VybmFtZS5yZXBsYWNlKCd1LycsICcnKSA6IG51bGw7XG4gICAgXG4gICAgLy8gU3VwcG9ydCBtdWx0aXBsZSBwcm9maWxlIG5hdmlnYXRpb24gZmxvd3NcbiAgICBcbiAgICAvLyAxLiBUcnkgXCJWaWV3IFByb2ZpbGVcIiBmcm9tIFVzZXIgRHJvcGRvd24gKFVzZXIgcmVxdWVzdClcbiAgICAvLyBXZSB3cmFwIGNsaWNrcyBpbiB0cnktY2F0Y2ggdG8gaWdub3JlIEFib3J0RXJyb3IvTmF2aWdhdGlvbiBpbnRlcnJ1cHRpb25cbiAgICB0cnkge1xuICAgICAgICBkb21Mb2dnZXIubG9nKCdBdHRlbXB0aW5nIFVzZXIgRHJvcGRvd24gLT4gVmlldyBQcm9maWxlIGZsb3cnKVxuICAgICAgICBpZiAoYXdhaXQgdGhpcy5vcGVuVXNlckRyb3Bkb3duKCkpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoMjAwMClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUm9idXN0IERlZXAgU2VhcmNoIGZvciBcIlZpZXcgUHJvZmlsZVwiXG4gICAgICAgICAgICBjb25zdCBmaW5kVmlld1Byb2ZpbGUgPSAocm9vdCA9IGRvY3VtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWxsRWxlbWVudHMgPSBBcnJheS5mcm9tKHJvb3QucXVlcnlTZWxlY3RvckFsbCgnKicpKS5yZXZlcnNlKCk7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBlbCBvZiBhbGxFbGVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgaWYgKFsnU0NSSVBUJywgJ1NUWUxFJywgJ0hUTUwnLCAnQk9EWScsICdIRUFEJ10uaW5jbHVkZXMoZWwudGFnTmFtZSkpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0gZWwudGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkudHJpbSgpIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXJpYUxhYmVsID0gZWwuZ2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJyk/LnRvTG93ZXJDYXNlKCkgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgIC8vIE1hdGNoZXM6IFwiVmlldyBQcm9maWxlXCIsIFwiUHJvZmlsZVwiLCBcIk15IFByb2ZpbGVcIlxuICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNQcm9maWxlTWF0Y2ggPSAodGV4dC5pbmNsdWRlcygncHJvZmlsZScpIHx8IGFyaWFMYWJlbC5pbmNsdWRlcygncHJvZmlsZScpKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodGV4dC5pbmNsdWRlcygndmlldycpIHx8IHRleHQuaW5jbHVkZXMoJ215JykgfHwgdGV4dCA9PT0gJ3Byb2ZpbGUnKTtcbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgaWYgKGlzUHJvZmlsZU1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbC5vZmZzZXRQYXJlbnQgPT09IG51bGwgJiYgd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpLmRpc3BsYXkgPT09ICdub25lJykgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRvbUxvZ2dlci5sb2coJ0ZvdW5kIHBvdGVudGlhbCBWaWV3IFByb2ZpbGUgZWxlbWVudDonLCBlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbC5jbG9zZXN0KCdhLCBidXR0b24sIGRpdltyb2xlPVwibWVudWl0ZW1cIl0nKSB8fCBlbDtcbiAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gUmVjdXJzZVxuICAgICAgICAgICAgICAgIGNvbnN0IGFsbCA9IEFycmF5LmZyb20ocm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcqJykpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZWwgb2YgYWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbC5zaGFkb3dSb290KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmb3VuZCA9IGZpbmRWaWV3UHJvZmlsZShlbC5zaGFkb3dSb290KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGZvdW5kO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgdmlld1Byb2ZpbGVFbCA9IGZpbmRWaWV3UHJvZmlsZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDaGVjayBwb3J0YWxzIGlmIG5vdCBmb3VuZCBpbml0aWFsbHlcbiAgICAgICAgICAgIGlmICghdmlld1Byb2ZpbGVFbCkge1xuICAgICAgICAgICAgICAgICBjb25zdCBwb3J0YWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZmFjZXBsYXRlLXBvcnRhbCwgLnBvcnRhbCwgW2lkKj1cInBvcnRhbFwiXScpO1xuICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBvcnRhbCBvZiBwb3J0YWxzKSB7XG4gICAgICAgICAgICAgICAgICAgICBjb25zdCByb290ID0gcG9ydGFsLnNoYWRvd1Jvb3QgfHwgcG9ydGFsO1xuICAgICAgICAgICAgICAgICAgICAgY29uc3QgZm91bmQgPSBmaW5kVmlld1Byb2ZpbGUocm9vdCk7XG4gICAgICAgICAgICAgICAgICAgICBpZiAoZm91bmQpIHsgdmlld1Byb2ZpbGVFbCA9IGZvdW5kOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh2aWV3UHJvZmlsZUVsKSB7XG4gICAgICAgICAgICAgICAgZG9tTG9nZ2VyLmxvZygnRm91bmQgXCJWaWV3IFByb2ZpbGVcIiBlbGVtZW50LCBjbGlja2luZy4uLicsIHZpZXdQcm9maWxlRWwpXG4gICAgICAgICAgICAgICAgdmlld1Byb2ZpbGVFbC5jbGljaygpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gVXNlciBSZXF1ZXN0OiBXYWl0IGZvciBcIk92ZXJ2aWV3XCIgZWxlbWVudCB0byBhcHBlYXJcbiAgICAgICAgICAgICAgICBkb21Mb2dnZXIubG9nKCdXYWl0aW5nIGZvciBcIk92ZXJ2aWV3XCIgZWxlbWVudCB0byBjb25maXJtIHByb2ZpbGUgbG9hZC4uLicpO1xuICAgICAgICAgICAgICAgIC8vIFdlIHVzZSBhIGJyb2FkZXIgc2VhcmNoIHRvIGNhdGNoIGV4cGxpY2l0IFwiT3ZlcnZpZXdcIiB0YWIgb3IgVVJMIGNoYW5nZSBldmlkZW5jZVxuICAgICAgICAgICAgICAgIGNvbnN0IG92ZXJ2aWV3RWwgPSBhd2FpdCB0aGlzLndhaXRGb3JFbGVtZW50KCdbZGF0YS10ZXN0aWQ9XCJwcm9maWxlLW92ZXJ2aWV3LXRhYlwiXSwgYVtocmVmJD1cIi9vdmVydmlldy9cIl0sIGFbaHJlZiQ9XCIvb3ZlcnZpZXdcIl0nLCAxMDAwMCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5kZWVwRmluZEJ5VGV4dCgnT3ZlcnZpZXcnLCAnYScpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChvdmVydmlld0VsKSB7XG4gICAgICAgICAgICAgICAgICAgICBkb21Mb2dnZXIubG9nKCdQcm9maWxlIGxvYWRlZCAoT3ZlcnZpZXcgZGV0ZWN0ZWQpLiBXYWl0aW5nIDJzIGZvciBzdGFiaWxpdHkuLi4nKTtcbiAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoMjAwMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgIGRvbUxvZ2dlci53YXJuKCdPdmVydmlldyBlbGVtZW50IG5vdCBmb3VuZCBhZnRlciBjbGljay4gUHJvY2VlZGluZyB3aXRoIGNhdXRpb24uLi4nKTtcbiAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoNDAwMCk7IC8vIEZhbGxiYWNrIHRvIG9yaWdpbmFsIHNsZWVwIGlmIGRldGVjdGlvbiBmYWlsc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9tTG9nZ2VyLmxvZygnXCJWaWV3IFByb2ZpbGVcIiBsaW5rIG5vdCBmb3VuZCBpbiBkcm9wZG93bi4nKVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBkb21Mb2dnZXIud2FybignQ2xpY2sgbmF2aWdhdGlvbiBpbnRlcnJ1cHRlZCAobGlrZWx5IHN1Y2Nlc3MpOicsIGUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTsgXG4gICAgfVxuXG4gICAgLy8gMi4gRmFsbGJhY2s6IENoZWNrIGlmIHdlIGNhbiBmaW5kIGEgcHJvZmlsZSBsaW5rIGRpcmVjdGx5XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcHJvZmlsZUxpbmsgPSB0aGlzLmRlZXBRdWVyeSgnZmFjZXBsYXRlLXRyYWNrZXJbc291cmNlPVwidXNlcl9kcmF3ZXJcIl0gYScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWVwUXVlcnkoJ2FbaHJlZl49XCIvdXNlci9cIl1bY2xhc3MqPVwiYXZhdGFyXCJdJyk7XG5cbiAgICAgICAgaWYgKHByb2ZpbGVMaW5rKSB7XG4gICAgICAgICAgICBkb21Mb2dnZXIubG9nKCdGb3VuZCBhbHRlcm5hdGl2ZSBwcm9maWxlIGxpbmssIGNsaWNraW5nLi4uJylcbiAgICAgICAgICAgIHByb2ZpbGVMaW5rLmNsaWNrKClcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoNDAwMClcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICBkb21Mb2dnZXIud2FybignQWx0ZXJuYXRpdmUgbGluayBjbGljayBpbnRlcnJ1cHRlZDonLCBlKTtcbiAgICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIDMuIFVsdGltYXRlIEZhbGxiYWNrOiBEaXJlY3QgVVJMIE5hdmlnYXRpb25cbiAgICAvLyAzLiBVbHRpbWF0ZSBGYWxsYmFjazogRGlyZWN0IFVSTCBOYXZpZ2F0aW9uXG4gICAgaWYgKGNsZWFuVXNlcm5hbWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRvbUxvZ2dlci5sb2coJ1x1RDgzRFx1REQwNCBOYXZpZ2F0aW9uIGZhbGxiYWNrOiBVc2luZyBkaXJlY3QgVVJMIG5hdmlnYXRpb24gc2luY2UgbWVudSBhcHByb2FjaCBmYWlsZWQnKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYGh0dHBzOi8vd3d3LnJlZGRpdC5jb20vdXNlci8ke2NsZWFuVXNlcm5hbWV9YDtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoNTAwMCk7IC8vIFdhaXQgZm9yIHJlbG9hZFxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBkb21Mb2dnZXIubG9nKCdcdUQ4M0RcdUREMDQgTmF2aWdhdGlvbiBmYWxsYmFjazogVVJMIG5hdmlnYXRpb24gaW50ZXJydXB0ZWQgKHRoaXMgaXMgbm9ybWFsKTonLCBlLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuICB9LFxuXG4gIGFzeW5jIG5hdmlnYXRlVG9Qb3N0c1RhYih1c2VybmFtZSkge1xuICAgIGRvbUxvZ2dlci5sb2coJ05hdmlnYXRpbmcgdG8gUG9zdHMgdGFiLi4uJylcbiAgICBcbiAgICAvLyBSZW1vdmVkIGVhcmx5XHUyMDExZXhpdCBndWFyZCBcdTIwMTMgYWx3YXlzIGF0dGVtcHQgdG8gY2xpY2sgdGhlIFBvc3RzIHRhYiwgZXZlbiBpZiBhbHJlYWR5IG9uIC9zdWJtaXR0ZWRcbiAgICAvLyBUaGlzIGVuc3VyZXMgYSBjbGljayBldmVudCBpcyBmaXJlZCBmb3IgZGVidWdnaW5nIC8gVUlcdTIwMTFpbnRlcmFjdGlvbiBwdXJwb3Nlcy5cbiAgICAvLyAoSWYgYWxyZWFkeSBvbiB0aGUgcGFnZSwgdGhlIGNsaWNrIHdpbGwgYmUgYSBub1x1MjAxMW9wIGJ1dCBzdGlsbCBsb2dnZWQuKVxuICAgIFxuICAgIC8vIFdhaXQgZm9yIHByb2ZpbGUgcGFnZSB0byBiZSByZWFkeVxuICAgIGRvbUxvZ2dlci5sb2coJ1dhaXRpbmcgZm9yIHByb2ZpbGUgcGFnZSB0byBzdGFiaWxpemUuLi4nKTtcbiAgICBhd2FpdCB0aGlzLnNsZWVwKDIwMDApO1xuICAgIFxuICAgIC8vIFRyeSBtdWx0aXBsZSBtZXRob2RzIHRvIGZpbmQgYW5kIGNsaWNrIHRoZSBQb3N0cyB0YWJcbiAgICBcbiAgICAvLyBNZXRob2QgMTogRGlyZWN0IHNlbGVjdG9yIGZvciBQb3N0cyB0YWIgbGlua1xuICAgIGNvbnN0IHBvc3RzVGFiU2VsZWN0b3JzID0gW1xuICAgICAgJ2FbaHJlZio9XCIvc3VibWl0dGVkXCJdJyxcbiAgICAgICdhW2hyZWYqPVwiL3N1Ym1pdHRlZC9cIl0nLFxuICAgICAgJ1tkYXRhLXRlc3RpZD1cInByb2ZpbGUtcG9zdHMtdGFiXCJdJyxcbiAgICAgICdmYWNlcGxhdGUtdHJhY2tlcltub3VuPVwicG9zdHNfdGFiXCJdIGEnLFxuICAgICAgJyNwcm9maWxlLXRhYi1wb3N0c190YWIgYScsXG4gICAgICAnI3Byb2ZpbGUtdGFiLXBvc3RzX3RhYidcbiAgICBdO1xuICAgIFxuICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2YgcG9zdHNUYWJTZWxlY3RvcnMpIHtcbiAgICAgIGNvbnN0IHRhYiA9IHRoaXMuZGVlcFF1ZXJ5KHNlbGVjdG9yKTtcbiAgICAgIGlmICh0YWIgJiYgdGhpcy5pc1Zpc2libGUodGFiKSkge1xuICAgICAgICBkb21Mb2dnZXIubG9nKGBGb3VuZCBQb3N0cyB0YWIgd2l0aCBzZWxlY3RvcjogJHtzZWxlY3Rvcn0sIGNsaWNraW5nLi4uYCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGFiLmNsaWNrKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBpZiAoZS5tZXNzYWdlICYmIGUubWVzc2FnZS5pbmNsdWRlcygnQWJvcnRFcnJvcicpKSB7XG4gICAgICAgICAgICBkb21Mb2dnZXIud2FybignSWdub3JpbmcgQWJvcnRFcnJvciBkdXJpbmcgUG9zdHMgdGFiIGNsaWNrIChuYXZpZ2F0aW9uIGludGVycnVwdGVkKTonLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB0aGlzLnNsZWVwKDMwMDApO1xuICAgICAgICBcbiAgICAgICAgLy8gVmVyaWZ5IHdlIG5hdmlnYXRlZFxuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluY2x1ZGVzKCcvc3VibWl0dGVkJykpIHtcbiAgICAgICAgICBkb21Mb2dnZXIubG9nKCdTdWNjZXNzZnVsbHkgbmF2aWdhdGVkIHRvIFBvc3RzIHRhYiB2aWEgY2xpY2shJyk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gTWV0aG9kIDI6IEZpbmQgYnkgdGV4dCBjb250ZW50IFwiUG9zdHNcIlxuICAgIGRvbUxvZ2dlci5sb2coJ1RyeWluZyB0byBmaW5kIFBvc3RzIHRhYiBieSB0ZXh0IGNvbnRlbnQuLi4nKTtcbiAgICBjb25zdCBwb3N0c1RhYkJ5VGV4dCA9IHRoaXMuZGVlcEZpbmRCeVRleHQoJ1Bvc3RzJywgJ2EnKTtcbiAgICBpZiAocG9zdHNUYWJCeVRleHQgJiYgdGhpcy5pc1Zpc2libGUocG9zdHNUYWJCeVRleHQpKSB7XG4gICAgICBkb21Mb2dnZXIubG9nKCdGb3VuZCBcIlBvc3RzXCIgdGFiIGJ5IHRleHQsIGNsaWNraW5nLi4uJyk7XG4gICAgICB0cnkge1xuICAgICAgICBwb3N0c1RhYkJ5VGV4dC5jbGljaygpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZS5tZXNzYWdlICYmIGUubWVzc2FnZS5pbmNsdWRlcygnQWJvcnRFcnJvcicpKSB7XG4gICAgICAgICAgZG9tTG9nZ2VyLndhcm4oJ0lnbm9yaW5nIEFib3J0RXJyb3IgZHVyaW5nIFBvc3RzIHRhYiB0ZXh0IGNsaWNrIChuYXZpZ2F0aW9uIGludGVycnVwdGVkKTonLCBlLm1lc3NhZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMuc2xlZXAoMzAwMCk7XG4gICAgICBcbiAgICAgIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5jbHVkZXMoJy9zdWJtaXR0ZWQnKSkge1xuICAgICAgICBkb21Mb2dnZXIubG9nKCdTdWNjZXNzZnVsbHkgbmF2aWdhdGVkIHRvIFBvc3RzIHRhYiB2aWEgdGV4dCBjbGljayEnKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIE1ldGhvZCAzOiBMb29rIGZvciB0YWIgYnV0dG9ucyB0aGF0IG1pZ2h0IGNvbnRhaW4gXCJQb3N0c1wiXG4gICAgZG9tTG9nZ2VyLmxvZygnVHJ5aW5nIHRvIGZpbmQgUG9zdHMgaW4gdGFiIGJ1dHRvbnMuLi4nKTtcbiAgICBjb25zdCBhbGxUYWJzID0gdGhpcy5xc0FsbCgnYSwgYnV0dG9uLCBbcm9sZT1cInRhYlwiXScpO1xuICAgIGZvciAoY29uc3QgdGFiIG9mIGFsbFRhYnMpIHtcbiAgICAgIGNvbnN0IHRleHQgPSB0YWIudGV4dENvbnRlbnQ/LnRyaW0oKS50b0xvd2VyQ2FzZSgpIHx8ICcnO1xuICAgICAgaWYgKHRleHQgPT09ICdwb3N0cycgJiYgdGhpcy5pc1Zpc2libGUodGFiKSkge1xuICAgICAgICBkb21Mb2dnZXIubG9nKCdGb3VuZCBQb3N0cyB0YWIgYnV0dG9uLCBjbGlja2luZy4uLicsIHRhYik7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGFiLmNsaWNrKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBpZiAoZS5tZXNzYWdlICYmIGUubWVzc2FnZS5pbmNsdWRlcygnQWJvcnRFcnJvcicpKSB7XG4gICAgICAgICAgICBkb21Mb2dnZXIud2FybignSWdub3JpbmcgQWJvcnRFcnJvciBkdXJpbmcgUG9zdHMgdGFiIGJ1dHRvbiBjbGljayAobmF2aWdhdGlvbiBpbnRlcnJ1cHRlZCk6JywgZS5tZXNzYWdlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGhpcy5zbGVlcCgzMDAwKTtcbiAgICAgICAgXG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5jbHVkZXMoJy9zdWJtaXR0ZWQnKSkge1xuICAgICAgICAgIGRvbUxvZ2dlci5sb2coJ1N1Y2Nlc3NmdWxseSBuYXZpZ2F0ZWQgdG8gUG9zdHMgdGFiIScpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIE1ldGhvZCA0OiBGYWxsYmFjayB0byBkaXJlY3QgVVJMIG5hdmlnYXRpb25cbiAgICBkb21Mb2dnZXIubG9nKCdDb3VsZCBub3QgY2xpY2sgUG9zdHMgdGFiLCBmYWxsaW5nIGJhY2sgdG8gVVJMIG5hdmlnYXRpb24uLi4nKTtcbiAgICBjb25zdCBpbmZlcnJlZFVzZXIgPSB1c2VybmFtZSB8fCB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubWF0Y2goL1xcL3VzZXJcXC8oW15cXC9dKykvKT8uWzFdO1xuICAgIFxuICAgIGlmIChpbmZlcnJlZFVzZXIpIHtcbiAgICAgIGNvbnN0IGNsZWFuVXNlciA9IGluZmVycmVkVXNlci5yZXBsYWNlKCd1LycsICcnKTtcbiAgICAgIGRvbUxvZ2dlci5sb2coYE5hdmlnYXRpbmcgZGlyZWN0bHkgdG8gL3VzZXIvJHtjbGVhblVzZXJ9L3N1Ym1pdHRlZC9gKTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYGh0dHBzOi8vd3d3LnJlZGRpdC5jb20vdXNlci8ke2NsZWFuVXNlcn0vc3VibWl0dGVkL2A7XG4gICAgICBhd2FpdCB0aGlzLnNsZWVwKDQwMDApO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZG9tTG9nZ2VyLmxvZygnUG9zdHMgdGFiIG5vdCBmb3VuZCBhbmQgbm8gdXNlcm5hbWUgZm9yIGZhbGxiYWNrJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIGFzeW5jIGNoZWNrVXNlclBvc3RzKCkge1xuICAgIGRvbUxvZ2dlci5sb2coJ0NoZWNraW5nIHVzZXIgcG9zdHMgd2l0aCBlbmhhbmNlZCBtZXRhZGF0YSBleHRyYWN0aW9uLi4uJylcbiAgICBhd2FpdCB0aGlzLnNsZWVwKDMwMDApXG5cbiAgICAvLyBHZXQgYWxsIHBvc3RzIHVzaW5nIGNvbXByZWhlbnNpdmUgc2VsZWN0b3JzXG4gICAgY29uc3QgcG9zdHMgPSB0aGlzLnFzQWxsKCdzaHJlZGRpdC1wb3N0LCBbZGF0YS10ZXN0aWQ9XCJwb3N0LWNvbnRhaW5lclwiXSwgLlBvc3QnKVxuICAgIGRvbUxvZ2dlci5sb2coYEZvdW5kICR7cG9zdHMubGVuZ3RofSBwb3N0c2ApXG5cbiAgICBpZiAocG9zdHMubGVuZ3RoID4gMCkge1xuICAgICAgZG9tTG9nZ2VyLmxvZygnUmF3IHBvc3RzIGZvdW5kOicsIHBvc3RzLmxlbmd0aClcbiAgICAgIFxuICAgICAgLy8gRGVidWc6IExvZyB0aGUgZmlyc3QgZmV3IHBvc3QgZWxlbWVudHMgdG8gdW5kZXJzdGFuZCBzdHJ1Y3R1cmVcbiAgICAgIHBvc3RzLnNsaWNlKDAsIDMpLmZvckVhY2goKHBvc3QsIGluZGV4KSA9PiB7XG4gICAgICAgIGRvbUxvZ2dlci5sb2coYFBvc3QgJHtpbmRleH0gSFRNTCBzdHJ1Y3R1cmU6YCwgcG9zdC5vdXRlckhUTUwuc3Vic3RyaW5nKDAsIDUwMCkpXG4gICAgICB9KVxuICAgICAgXG4gICAgICAvLyBFbmhhbmNlZCBwb3N0IGRhdGEgZXh0cmFjdGlvbiB3aXRoIG1ldGFkYXRhXG4gICAgICBjb25zdCBwb3N0c1dpdGhNZXRhZGF0YSA9IHBvc3RzLm1hcChwb3N0ID0+IHtcbiAgICAgICAgaWYgKHBvc3Q/LmdldEF0dHJpYnV0ZSAmJiBwb3N0LmdldEF0dHJpYnV0ZSgnZGF0YS10ZXN0aWQnKSA9PT0gJ2NyZWF0ZS1wb3N0Jykge1xuICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cblxuICAgICAgICAvLyBFeHRyYWN0IGRhdGEgYXR0cmlidXRlcyBmcm9tIHNocmVkZGl0LXBvc3QgZWxlbWVudFxuICAgICAgICBjb25zdCBwb3N0QXR0cmlidXRlcyA9IHtcbiAgICAgICAgICBwb3N0VGl0bGU6IHBvc3QuZ2V0QXR0cmlidXRlKCdwb3N0LXRpdGxlJyksXG4gICAgICAgICAgYXV0aG9yOiBwb3N0LmdldEF0dHJpYnV0ZSgnYXV0aG9yJyksXG4gICAgICAgICAgc3VicmVkZGl0UHJlZml4ZWROYW1lOiBwb3N0LmdldEF0dHJpYnV0ZSgnc3VicmVkZGl0LXByZWZpeGVkLW5hbWUnKSxcbiAgICAgICAgICBzY29yZTogcG9zdC5nZXRBdHRyaWJ1dGUoJ3Njb3JlJyksXG4gICAgICAgICAgY29tbWVudENvdW50OiBwb3N0LmdldEF0dHJpYnV0ZSgnY29tbWVudC1jb3VudCcpLFxuICAgICAgICAgIGNyZWF0ZWRUaW1lc3RhbXA6IHBvc3QuZ2V0QXR0cmlidXRlKCdjcmVhdGVkLXRpbWVzdGFtcCcpLFxuICAgICAgICAgIHBvc3RUeXBlOiBwb3N0LmdldEF0dHJpYnV0ZSgncG9zdC10eXBlJyksXG4gICAgICAgICAgY29udGVudEhyZWY6IHBvc3QuZ2V0QXR0cmlidXRlKCdjb250ZW50LWhyZWYnKSxcbiAgICAgICAgICBwZXJtYWxpbms6IHBvc3QuZ2V0QXR0cmlidXRlKCdwZXJtYWxpbmsnKSxcbiAgICAgICAgICBwb3N0SWQ6IHBvc3QuZ2V0QXR0cmlidXRlKCdpZCcpLFxuICAgICAgICAgIGRvbWFpbjogcG9zdC5nZXRBdHRyaWJ1dGUoJ2RvbWFpbicpLFxuICAgICAgICAgIGl0ZW1TdGF0ZTogcG9zdC5nZXRBdHRyaWJ1dGUoJ2l0ZW0tc3RhdGUnKSxcbiAgICAgICAgICB2aWV3Q29udGV4dDogcG9zdC5nZXRBdHRyaWJ1dGUoJ3ZpZXctY29udGV4dCcpLFxuICAgICAgICAgIHZvdGVUeXBlOiBwb3N0LmdldEF0dHJpYnV0ZSgndm90ZS10eXBlJyksXG4gICAgICAgICAgYXdhcmRDb3VudDogcG9zdC5nZXRBdHRyaWJ1dGUoJ2F3YXJkLWNvdW50JyksXG4gICAgICAgICAgdXNlcklkOiBwb3N0LmdldEF0dHJpYnV0ZSgndXNlci1pZCcpLFxuICAgICAgICAgIGF1dGhvcklkOiBwb3N0LmdldEF0dHJpYnV0ZSgnYXV0aG9yLWlkJyksXG4gICAgICAgICAgc3VicmVkZGl0SWQ6IHBvc3QuZ2V0QXR0cmlidXRlKCdzdWJyZWRkaXQtaWQnKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRXh0cmFjdCB0aW1lc3RhbXAgd2l0aCBtdWx0aXBsZSBmYWxsYmFjayBtZXRob2RzXG4gICAgICAgIGNvbnN0IHRpbWVzdGFtcEVsZW1lbnQgPSBwb3N0LnF1ZXJ5U2VsZWN0b3IoJ3RpbWUsIFtkYXRhLXRlc3RpZD1cInBvc3RfdGltZXN0YW1wXCJdLCBmYWNlcGxhdGUtdGltZScpXG4gICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IHBvc3RBdHRyaWJ1dGVzLmNyZWF0ZWRUaW1lc3RhbXAgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wRWxlbWVudD8uZ2V0QXR0cmlidXRlKCdkYXRldGltZScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcEVsZW1lbnQ/LmdldEF0dHJpYnV0ZSgnY3JlYXRlZC10aW1lc3RhbXAnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0LmdldEF0dHJpYnV0ZSgnY3JlYXRlZC10aW1lc3RhbXAnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXBFbGVtZW50Py50ZXh0Q29udGVudFxuXG4gICAgICAgIC8vIEV4dHJhY3QgcG9zdCBVUkwvSUQgZm9yIGRlbGV0aW9uXG4gICAgICAgIGNvbnN0IHBvc3RMaW5rID0gcG9zdC5xdWVyeVNlbGVjdG9yKCdhW2RhdGEtdGVzdGlkPVwicG9zdC1jb250ZW50XCJdLCBhW2hyZWYqPVwiL2NvbW1lbnRzL1wiXScpXG4gICAgICAgIGNvbnN0IHBvc3RVcmwgPSBwb3N0QXR0cmlidXRlcy5wZXJtYWxpbmsgfHwgcG9zdExpbms/LmhyZWYgfHwgcG9zdC5nZXRBdHRyaWJ1dGUoJ3Blcm1hbGluaycpXG4gICAgICAgIGNvbnN0IHBvc3RJZCA9IHRoaXMuZXh0cmFjdFBvc3RJZChwb3N0QXR0cmlidXRlcy5wb3N0SWQgfHwgcG9zdFVybClcblxuICAgICAgICAvLyBFeHRyYWN0IHBvc3QgdGl0bGUgZm9yIGlkZW50aWZpY2F0aW9uXG4gICAgICAgIGNvbnN0IHRpdGxlRWxlbWVudCA9IHBvc3QucXVlcnlTZWxlY3RvcignaDMsIFtkYXRhLXRlc3RpZD1cInBvc3QtY29udGVudFwiXSwgLnRpdGxlLCBbc2xvdD1cInRpdGxlXCJdLCBkaXZbZGF0YS1jbGljay1pZD1cInRleHRcIl0sIFtkYXRhLWFkY2xpY2tsb2NhdGlvbj1cInRpdGxlXCJdLCBhW2RhdGEtY2xpY2staWQ9XCJ0ZXh0XCJdLCAuUG9zdFRpdGxlLCBoMSwgaDInKVxuICAgICAgICBjb25zdCB0aXRsZSA9IHBvc3RBdHRyaWJ1dGVzLnBvc3RUaXRsZSB8fCBcbiAgICAgICAgICAgICAgICAgICAgIHRpdGxlRWxlbWVudD8udGV4dENvbnRlbnQ/LnRyaW0oKSB8fCBcbiAgICAgICAgICAgICAgICAgICAgIHBvc3QuZ2V0QXR0cmlidXRlKCdwb3N0LXRpdGxlJykgfHxcbiAgICAgICAgICAgICAgICAgICAgIHBvc3QucXVlcnlTZWxlY3RvcignW2RhdGEtcG9zdC10aXRsZV0nKT8udGV4dENvbnRlbnQ/LnRyaW0oKSB8fFxuICAgICAgICAgICAgICAgICAgICAgcG9zdC5xdWVyeVNlbGVjdG9yKCdhW2hyZWYqPVwiL2NvbW1lbnRzL1wiXScpPy50ZXh0Q29udGVudD8udHJpbSgpIHx8XG4gICAgICAgICAgICAgICAgICAgICAnVW50aXRsZWQgUG9zdCcgLy8gRmFsbGJhY2sgdG8gcHJldmVudCBmaWx0ZXJpbmdcblxuICAgICAgICAvLyBFeHRyYWN0IGVuZ2FnZW1lbnQgbWV0cmljc1xuICAgICAgICBjb25zdCBzY29yZSA9IHBvc3RBdHRyaWJ1dGVzLnNjb3JlIHx8ICcwJ1xuICAgICAgICBjb25zdCBjb21tZW50Q291bnQgPSBwb3N0QXR0cmlidXRlcy5jb21tZW50Q291bnQgfHwgJzAnXG4gICAgICAgIGNvbnN0IGF3YXJkQ291bnQgPSBwb3N0QXR0cmlidXRlcy5hd2FyZENvdW50IHx8ICcwJ1xuXG4gICAgICAgIC8vIENoZWNrIHBvc3Qgc3RhdHVzIGZsYWdzXG4gICAgICAgIGNvbnN0IGlzUmVtb3ZlZCA9IHRoaXMuY2hlY2tQb3N0U3RhdHVzKHBvc3QsICdyZW1vdmVkJylcbiAgICAgICAgY29uc3QgaXNCbG9ja2VkID0gdGhpcy5jaGVja1Bvc3RTdGF0dXMocG9zdCwgJ2Jsb2NrZWQnKVxuICAgICAgICBjb25zdCBpc0RlbGV0ZWQgPSB0aGlzLmNoZWNrUG9zdFN0YXR1cyhwb3N0LCAnZGVsZXRlZCcpXG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIG1vZGVyYXRvciByZW1vdmFsIGluZGljYXRvcnNcbiAgICAgICAgY29uc3QgbW9kZXJhdG9yRmxhZ3MgPSB0aGlzLnFzQWxsKCdbY2xhc3MqPVwibW9kZXJhdG9yXCJdLCBbY2xhc3MqPVwicmVtb3ZlZFwiXSwgW2NsYXNzKj1cImRlbGV0ZWRcIl0nLCBwb3N0KVxuICAgICAgICBjb25zdCBoYXNNb2RlcmF0b3JBY3Rpb24gPSBtb2RlcmF0b3JGbGFncy5sZW5ndGggPiAwXG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAvLyBDb3JlIG1ldGFkYXRhXG4gICAgICAgICAgdGltZXN0YW1wOiB0aW1lc3RhbXAgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgIHBvc3RVcmw6IHBvc3RVcmwgfHwgJycsXG4gICAgICAgICAgcG9zdElkOiBwb3N0SWQgfHwgJycsXG4gICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgIFxuICAgICAgICAgIC8vIEVuaGFuY2VkIFJlZGRpdC1zcGVjaWZpYyBtZXRhZGF0YVxuICAgICAgICAgIGF1dGhvcjogcG9zdEF0dHJpYnV0ZXMuYXV0aG9yIHx8ICcnLFxuICAgICAgICAgIHN1YnJlZGRpdDogcG9zdEF0dHJpYnV0ZXMuc3VicmVkZGl0UHJlZml4ZWROYW1lIHx8ICcnLFxuICAgICAgICAgIHNjb3JlOiBwYXJzZUludChzY29yZSkgfHwgMCxcbiAgICAgICAgICBjb21tZW50Q291bnQ6IHBhcnNlSW50KGNvbW1lbnRDb3VudCkgfHwgMCxcbiAgICAgICAgICBhd2FyZENvdW50OiBwYXJzZUludChhd2FyZENvdW50KSB8fCAwLFxuICAgICAgICAgIHBvc3RUeXBlOiBwb3N0QXR0cmlidXRlcy5wb3N0VHlwZSB8fCAnJyxcbiAgICAgICAgICBkb21haW46IHBvc3RBdHRyaWJ1dGVzLmRvbWFpbiB8fCAnJyxcbiAgICAgICAgICBjb250ZW50SHJlZjogcG9zdEF0dHJpYnV0ZXMuY29udGVudEhyZWYgfHwgJycsXG4gICAgICAgICAgXG4gICAgICAgICAgLy8gU3RhdHVzIGFuZCBtb2RlcmF0aW9uXG4gICAgICAgICAgaXNSZW1vdmVkOiBpc1JlbW92ZWQgfHwgaGFzTW9kZXJhdG9yQWN0aW9uLFxuICAgICAgICAgIGlzQmxvY2tlZDogaXNCbG9ja2VkLFxuICAgICAgICAgIGRlbGV0ZWQ6IGlzRGVsZXRlZCxcbiAgICAgICAgICBoYXNNb2RlcmF0b3JBY3Rpb246IGhhc01vZGVyYXRvckFjdGlvbixcbiAgICAgICAgICBpdGVtU3RhdGU6IHBvc3RBdHRyaWJ1dGVzLml0ZW1TdGF0ZSB8fCAnJyxcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBBZGRpdGlvbmFsIG1ldGFkYXRhXG4gICAgICAgICAgdmlld0NvbnRleHQ6IHBvc3RBdHRyaWJ1dGVzLnZpZXdDb250ZXh0IHx8ICcnLFxuICAgICAgICAgIHZvdGVUeXBlOiBwb3N0QXR0cmlidXRlcy52b3RlVHlwZSB8fCAnJyxcbiAgICAgICAgICB1c2VySWQ6IHBvc3RBdHRyaWJ1dGVzLnVzZXJJZCB8fCAnJyxcbiAgICAgICAgICBhdXRob3JJZDogcG9zdEF0dHJpYnV0ZXMuYXV0aG9ySWQgfHwgJycsXG4gICAgICAgICAgc3VicmVkZGl0SWQ6IHBvc3RBdHRyaWJ1dGVzLnN1YnJlZGRpdElkIHx8ICcnXG4gICAgICAgIH1cbiAgICAgIH0pLmZpbHRlcihwb3N0ID0+IHtcbiAgICAgICAgaWYgKCFwb3N0KSByZXR1cm4gZmFsc2VcbiAgICAgICAgLy8gRGVidWc6IExvZyB3aGF0IHdlJ3JlIGV4dHJhY3RpbmcgZm9yIGVhY2ggcG9zdFxuICAgICAgICBkb21Mb2dnZXIubG9nKCdQb3N0IGV4dHJhY3Rpb24gZGVidWc6Jywge1xuICAgICAgICAgIHRpbWVzdGFtcDogcG9zdC50aW1lc3RhbXAsXG4gICAgICAgICAgcG9zdElkOiBwb3N0LnBvc3RJZCwgXG4gICAgICAgICAgcG9zdFVybDogcG9zdC5wb3N0VXJsLFxuICAgICAgICAgIHRpdGxlOiBwb3N0LnRpdGxlLFxuICAgICAgICAgIGF1dGhvcjogcG9zdC5hdXRob3IsXG4gICAgICAgICAgc3VicmVkZGl0OiBwb3N0LnN1YnJlZGRpdCxcbiAgICAgICAgICBzY29yZTogcG9zdC5zY29yZVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgLy8gRmlsdGVyIG91dCBpbnZhbGlkIHBvc3RzIC0gcG9zdFVybCBhbmQgdGl0bGUgYXJlIHJlcXVpcmVkOyBwb3N0SWQgaXMgYmVzdC1lZmZvcnRcbiAgICAgICAgcmV0dXJuIHBvc3QudGltZXN0YW1wICYmIHBvc3QucG9zdFVybCAmJiBwb3N0LnRpdGxlXG4gICAgICB9KVxuXG4gICAgICAvLyBTb3J0IGJ5IHRpbWVzdGFtcCAobmV3ZXN0IGZpcnN0KVxuICAgICAgcG9zdHNXaXRoTWV0YWRhdGEuc29ydCgoYSwgYikgPT4gbmV3IERhdGUoYi50aW1lc3RhbXApIC0gbmV3IERhdGUoYS50aW1lc3RhbXApKVxuXG4gICAgICBkb21Mb2dnZXIubG9nKCc9PT0gRU5IQU5DRUQgUE9TVFMgU1VNTUFSWSA9PT0nKVxuICAgICAgZG9tTG9nZ2VyLmxvZyhgVG90YWwgcG9zdHM6ICR7cG9zdHMubGVuZ3RofWApXG4gICAgICBkb21Mb2dnZXIubG9nKGBQb3N0cyB3aXRoIHZhbGlkIG1ldGFkYXRhOiAke3Bvc3RzV2l0aE1ldGFkYXRhLmxlbmd0aH1gKVxuXG4gICAgICBwb3N0c1dpdGhNZXRhZGF0YS5mb3JFYWNoKChwb3N0LCBpbmRleCkgPT4ge1xuICAgICAgICBkb21Mb2dnZXIubG9nKGBQb3N0ICR7aW5kZXggKyAxfTogJHtwb3N0LnRpbWVzdGFtcH0gfCBTdGF0dXM6ICR7cG9zdC5pc1JlbW92ZWQgPyAnUmVtb3ZlZCcgOiBwb3N0LmlzQmxvY2tlZCA/ICdCbG9ja2VkJyA6ICdBY3RpdmUnfSB8IFVSTDogJHtwb3N0LnBvc3RVcmx9YClcbiAgICAgIH0pXG5cbiAgICAgIGlmIChwb3N0c1dpdGhNZXRhZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGxhc3RQb3N0ID0gcG9zdHNXaXRoTWV0YWRhdGFbMF1cbiAgICAgICAgZG9tTG9nZ2VyLmxvZyhgTGFzdCBwb3N0IGRldGFpbHM6YCwgbGFzdFBvc3QpXG4gICAgICAgIFxuICAgICAgICAvLyBSZXR1cm4gY29tcHJlaGVuc2l2ZSBkYXRhIGZvciBiYWNrZ3JvdW5kIHNjcmlwdCBhbmFseXNpc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRvdGFsOiBwb3N0cy5sZW5ndGgsXG4gICAgICAgICAgbGFzdFBvc3REYXRlOiBsYXN0UG9zdC50aW1lc3RhbXAsXG4gICAgICAgICAgcG9zdHM6IHBvc3RzV2l0aE1ldGFkYXRhLFxuICAgICAgICAgIGxhc3RQb3N0OiBsYXN0UG9zdCAvLyBJbmNsdWRlIG1vc3QgcmVjZW50IHBvc3QgZm9yIGVhc3kgYWNjZXNzXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZG9tTG9nZ2VyLmxvZygnTm8gcG9zdHMgZm91bmQnKVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0b3RhbDogMCxcbiAgICAgIGxhc3RQb3N0RGF0ZTogbnVsbCxcbiAgICAgIHBvc3RzOiBbXSxcbiAgICAgIGxhc3RQb3N0OiBudWxsXG4gICAgfVxuICB9LFxuXG4gIC8vIEhlbHBlciBtZXRob2QgdG8gZXh0cmFjdCBwb3N0IElEIGZyb20gVVJMXG4gIGV4dHJhY3RQb3N0SWQocG9zdFVybCkge1xuICAgIGlmICghcG9zdFVybCkgcmV0dXJuIG51bGxcbiAgICBcbiAgICAvLyBFeHRyYWN0IElEIGZyb20gUmVkZGl0IFVSTCBwYXR0ZXJuc1xuICAgIGNvbnN0IHBhdHRlcm5zID0gW1xuICAgICAgL150M18oW2EtejAtOV0rKSQvaSxcbiAgICAgIC9cXC9jb21tZW50c1xcLyhbYS16MC05XSspL2ksXG4gICAgICAvXFwvclxcL1teXFwvXStcXC9jb21tZW50c1xcLyhbYS16MC05XSspL2ksXG4gICAgICAvaWQ9KFthLXowLTldKykvaVxuICAgIF1cbiAgICBcbiAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgcGF0dGVybnMpIHtcbiAgICAgIGNvbnN0IG1hdGNoID0gcG9zdFVybC5tYXRjaChwYXR0ZXJuKVxuICAgICAgaWYgKG1hdGNoKSByZXR1cm4gbWF0Y2hbMV1cbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG51bGxcbiAgfSxcblxuICAvLyBIZWxwZXIgbWV0aG9kIHRvIGNoZWNrIHBvc3Qgc3RhdHVzXG4gIGNoZWNrUG9zdFN0YXR1cyhwb3N0RWxlbWVudCwgc3RhdHVzVHlwZSkge1xuICAgIGNvbnN0IHN0YXR1c0NsYXNzZXMgPSBbXG4gICAgICBgW2NsYXNzKj1cIiR7c3RhdHVzVHlwZX1cIl1gLFxuICAgICAgYFtjbGFzcyo9XCJtb2RlcmF0b3JcIl1gLFxuICAgICAgYFtkYXRhLXRlc3RpZCo9XCIke3N0YXR1c1R5cGV9XCJdYCxcbiAgICAgICcucmVtb3ZlZCcsXG4gICAgICAnLmRlbGV0ZWQnLFxuICAgICAgJy5ibG9ja2VkJ1xuICAgIF1cbiAgICBcbiAgICAvLyBDaGVjayBwb3N0IGVsZW1lbnQgYW5kIGl0cyBjaGlsZHJlbiBmb3Igc3RhdHVzIGluZGljYXRvcnNcbiAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHN0YXR1c0NsYXNzZXMpIHtcbiAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5xc0FsbChzZWxlY3RvciwgcG9zdEVsZW1lbnQpXG4gICAgICBpZiAoZWxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBWZXJpZnkgaXQncyBub3QganVzdCBhIGNsYXNzIG5hbWUgY29pbmNpZGVuY2VcbiAgICAgICAgY29uc3QgdGV4dCA9IGVsZW1lbnRzWzBdLnRleHRDb250ZW50Py50b0xvd2VyQ2FzZSgpIHx8ICcnXG4gICAgICAgIGlmICh0ZXh0LmluY2x1ZGVzKHN0YXR1c1R5cGUpIHx8IHRleHQuaW5jbHVkZXMoJ21vZGVyYXRvcicpIHx8IHRleHQuaW5jbHVkZXMoJ3JlbW92ZWQnKSB8fCB0ZXh0LmluY2x1ZGVzKCdkZWxldGVkJykpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIENoZWNrIGZvciBzcGVjaWZpYyBzdGF0dXMgdGV4dCBwYXR0ZXJuc1xuICAgIGNvbnN0IHN0YXR1c1RleHRzID0gW1xuICAgICAgJ3JlbW92ZWQgYnkgbW9kZXJhdG9yJyxcbiAgICAgICdkZWxldGVkIGJ5IG1vZGVyYXRvcicsIFxuICAgICAgJ3RoaXMgcG9zdCBoYXMgYmVlbiByZW1vdmVkJyxcbiAgICAgICdwb3N0IGJsb2NrZWQnLFxuICAgICAgJ21vZGVyYXRvciBhY3Rpb24nXG4gICAgXVxuICAgIFxuICAgIGNvbnN0IHBvc3RUZXh0ID0gcG9zdEVsZW1lbnQudGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkgfHwgJydcbiAgICByZXR1cm4gc3RhdHVzVGV4dHMuc29tZShzdGF0dXNUZXh0ID0+IHBvc3RUZXh0LmluY2x1ZGVzKHN0YXR1c1RleHQpKVxuICB9LFxuXG4gIGFzeW5jIGRlbGV0ZUxhc3RQb3N0KHBvc3REYXRhKSB7XG4gICAgZG9tTG9nZ2VyLmxvZygnW0RPTSBTY3JpcHRdIEF0dGVtcHRpbmcgdG8gZGVsZXRlIHNwZWNpZmljIHBvc3Q6JywgcG9zdERhdGEpO1xuICAgIFxuICAgIHRyeSB7XG4gICAgICAvLyBGaW5kIHRoZSBzcGVjaWZpYyBwb3N0IHRvIGRlbGV0ZSB1c2luZyB0aGUgcG9zdCBkYXRhXG4gICAgICBsZXQgdGFyZ2V0UG9zdCA9IG51bGw7XG4gICAgICBcbiAgICAgIGlmIChwb3N0RGF0YSAmJiBwb3N0RGF0YS5wb3N0SWQpIHtcbiAgICAgICAgLy8gVHJ5IHRvIGZpbmQgcG9zdCBieSBJRCBmaXJzdCAobW9zdCByZWxpYWJsZSlcbiAgICAgICAgdGFyZ2V0UG9zdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHNocmVkZGl0LXBvc3RbaWQ9XCJ0M18ke3Bvc3REYXRhLnBvc3RJZH1cIl1gKSB8fFxuICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEta3MtaWQ9XCJ0M18ke3Bvc3REYXRhLnBvc3RJZH1cIl1gKTtcbiAgICAgICAgZG9tTG9nZ2VyLmxvZygnW0RPTSBTY3JpcHRdIExvb2tpbmcgZm9yIHBvc3QgYnkgSUQgdDNfJyArIHBvc3REYXRhLnBvc3RJZCArICc6JywgdGFyZ2V0UG9zdCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICghdGFyZ2V0UG9zdCAmJiBwb3N0RGF0YSAmJiBwb3N0RGF0YS5wb3N0VXJsKSB7XG4gICAgICAgIC8vIFRyeSB0byBmaW5kIHBvc3QgYnkgVVJMIGFzIGZhbGxiYWNrXG4gICAgICAgIGNvbnN0IHBvc3RMaW5rcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYGFbaHJlZj1cIiR7cG9zdERhdGEucG9zdFVybH1cIl1gKTtcbiAgICAgICAgaWYgKHBvc3RMaW5rcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdGFyZ2V0UG9zdCA9IHBvc3RMaW5rc1swXS5jbG9zZXN0KCdzaHJlZGRpdC1wb3N0JykgfHwgXG4gICAgICAgICAgICAgICAgICAgICAgcG9zdExpbmtzWzBdLmNsb3Nlc3QoJ1tkYXRhLXRlc3RpZD1cInBvc3QtY29udGFpbmVyXCJdJyk7XG4gICAgICAgICAgZG9tTG9nZ2VyLmxvZygnW0RPTSBTY3JpcHRdIExvb2tpbmcgZm9yIHBvc3QgYnkgVVJMICcgKyBwb3N0RGF0YS5wb3N0VXJsICsgJzonLCB0YXJnZXRQb3N0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoIXRhcmdldFBvc3QgJiYgcG9zdERhdGEgJiYgcG9zdERhdGEudGl0bGUpIHtcbiAgICAgICAgLy8gRmluYWwgZmFsbGJhY2s6IGZpbmQgYnkgdGl0bGUgbWF0Y2hpbmdcbiAgICAgICAgY29uc3QgYWxsUG9zdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzaHJlZGRpdC1wb3N0W2lkXj1cInQzX1wiXSwgW2RhdGEtdGVzdGlkPVwicG9zdC1jb250YWluZXJcIl0nKTtcbiAgICAgICAgZm9yIChjb25zdCBwb3N0IG9mIGFsbFBvc3RzKSB7XG4gICAgICAgICAgY29uc3QgdGl0bGVFbGVtZW50ID0gcG9zdC5xdWVyeVNlbGVjdG9yKCdhW3Nsb3Q9XCJ0aXRsZVwiXScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXRlc3RpZD1cInBvc3QtdGl0bGVcIl0nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdC5xdWVyeVNlbGVjdG9yKCdoMycpO1xuICAgICAgICAgIGlmICh0aXRsZUVsZW1lbnQgJiYgdGl0bGVFbGVtZW50LnRleHRDb250ZW50Py50cmltKCkgPT09IHBvc3REYXRhLnRpdGxlKSB7XG4gICAgICAgICAgICB0YXJnZXRQb3N0ID0gcG9zdDtcbiAgICAgICAgICAgIGRvbUxvZ2dlci5sb2coJ1tET00gU2NyaXB0XSBGb3VuZCBwb3N0IGJ5IHRpdGxlIG1hdGNoaW5nOicsIHBvc3REYXRhLnRpdGxlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoIXRhcmdldFBvc3QpIHtcbiAgICAgICAgZG9tTG9nZ2VyLmxvZygnW0RPTSBTY3JpcHRdIFRhcmdldCBwb3N0IG5vdCBmb3VuZCwgZmFsbGluZyBiYWNrIHRvIGZpcnN0IHBvc3QgaW4gRE9NJyk7XG4gICAgICAgIHRhcmdldFBvc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS10ZXN0aWQ9XCJwb3N0LWNvbnRhaW5lclwiXScpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoIXRhcmdldFBvc3QpIHtcbiAgICAgICAgZG9tTG9nZ2VyLmxvZygnW0RPTSBTY3JpcHRdIE5vIHBvc3RzIGZvdW5kIG9uIHBhZ2UnKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBMb29rIGZvciB0aGUgcG9zdCBvcHRpb25zIG1lbnUgKHRocmVlIGRvdHMpXG4gICAgICBsZXQgb3B0aW9uc0J1dHRvbiA9IG51bGw7XG4gICAgICBcbiAgICAgIC8vIFRyeSBtdWx0aXBsZSBzZWxlY3RvciBzdHJhdGVnaWVzIGZvciB0aGUgb3B0aW9ucyBidXR0b25cbiAgICAgIGNvbnN0IG9wdGlvbnNTZWxlY3RvcnMgPSBbXG4gICAgICAgICdidXR0b25bYXJpYS1sYWJlbCo9XCJPcHRpb25zXCJdJyxcbiAgICAgICAgJ2J1dHRvblthcmlhLWxhYmVsKj1cIk1vcmUgb3B0aW9uc1wiXScsXG4gICAgICAgICdidXR0b25bYXJpYS1sYWJlbCo9XCJtb3JlIG9wdGlvbnNcIl0nLFxuICAgICAgICAnYnV0dG9uW2FyaWEtbGFiZWwqPVwiUG9zdCBvcHRpb25zXCJdJyxcbiAgICAgICAgJ2J1dHRvblthcmlhLWxhYmVsKj1cIk9wZW4gcG9zdCBvcHRpb25zIG1lbnVcIl0nLFxuICAgICAgICAnYnV0dG9uW2RhdGEtdGVzdGlkPVwicG9zdC1kcm9wZG93blwiXScsXG4gICAgICAgICdidXR0b25bZGF0YS1jbGljay1pZD1cInBvc3REcm9wZG93blwiXScsXG4gICAgICAgICdidXR0b25baWQqPVwicG9zdC1vcHRpb25zXCJdJyxcbiAgICAgICAgJ2J1dHRvbltjbGFzcyo9XCJtb3JlXCJdJyxcbiAgICAgICAgJ3NocmVkZGl0LXBvc3QgYnV0dG9uOmxhc3QtY2hpbGQnLFxuICAgICAgICAnW2RhdGEtdGVzdGlkPVwicG9zdC1jb250YWluZXJcIl0gYnV0dG9uOmxhc3QtY2hpbGQnXG4gICAgICBdO1xuICAgICAgXG4gICAgICAvLyBGaW5kIG9wdGlvbnMgYnV0dG9uIGJ5IHNlbGVjdG9yc1xuICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBvcHRpb25zU2VsZWN0b3JzKSB7XG4gICAgICAgIG9wdGlvbnNCdXR0b24gPSB0YXJnZXRQb3N0LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICBpZiAob3B0aW9uc0J1dHRvbikge1xuICAgICAgICAgIGRvbUxvZ2dlci5sb2coJ1tET00gU2NyaXB0XSBGb3VuZCBvcHRpb25zIGJ1dHRvbiB3aXRoIHNlbGVjdG9yOicsIHNlbGVjdG9yKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBGYWxsYmFjazogbG9vayBmb3IgYW55IGJ1dHRvbiB0aGF0IG1pZ2h0IGJlIHRoZSBvcHRpb25zIG1lbnVcbiAgICAgIGlmICghb3B0aW9uc0J1dHRvbikge1xuICAgICAgICBjb25zdCBhbGxCdXR0b25zID0gdGFyZ2V0UG9zdC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKTtcbiAgICAgICAgZm9yIChjb25zdCBidG4gb2YgYWxsQnV0dG9ucykge1xuICAgICAgICAgIGNvbnN0IGFyaWFMYWJlbCA9IGJ0bi5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnKT8udG9Mb3dlckNhc2UoKSB8fCAnJztcbiAgICAgICAgICBpZiAoYXJpYUxhYmVsLmluY2x1ZGVzKCdvcHRpb24nKSB8fCBcbiAgICAgICAgICAgICAgYXJpYUxhYmVsLmluY2x1ZGVzKCdtb3JlJykgfHxcbiAgICAgICAgICAgICAgYnRuLnF1ZXJ5U2VsZWN0b3IoJ3N2ZycpIHx8XG4gICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwuaW5jbHVkZXMoJ2ljb24nKSkge1xuICAgICAgICAgICAgb3B0aW9uc0J1dHRvbiA9IGJ0bjtcbiAgICAgICAgICAgIGRvbUxvZ2dlci5sb2coJ1tET00gU2NyaXB0XSBGb3VuZCBvcHRpb25zIGJ1dHRvbiBieSBhdHRyaWJ1dGVzJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKCFvcHRpb25zQnV0dG9uKSB7XG4gICAgICAgIGRvbUxvZ2dlci5sb2coJ1tET00gU2NyaXB0XSBPcHRpb25zIGJ1dHRvbiBub3QgZm91bmQgZm9yIHRhcmdldCBwb3N0Jyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gQ2xpY2sgb3B0aW9ucyB0byBvcGVuIGRyb3Bkb3duXG4gICAgICBvcHRpb25zQnV0dG9uLmNsaWNrKCk7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTAwKSk7XG4gICAgICBcbiAgICAgIC8vIExvb2sgZm9yIGRlbGV0ZSBvcHRpb24gaW4gdGhlIGRyb3Bkb3duXG4gICAgICBsZXQgZGVsZXRlQnV0dG9uID0gbnVsbDtcbiAgICAgIFxuICAgICAgLy8gVHJ5IG11bHRpcGxlIHNlbGVjdG9yIHN0cmF0ZWdpZXMgZm9yIHRoZSBkZWxldGUgYnV0dG9uXG4gICAgICBjb25zdCBkZWxldGVTZWxlY3RvcnMgPSBbXG4gICAgICAgICdidXR0b25bYXJpYS1sYWJlbCo9XCJEZWxldGVcIl0nLFxuICAgICAgICAnYnV0dG9uW2FyaWEtbGFiZWwqPVwiZGVsZXRlXCJdJyxcbiAgICAgICAgJ1tyb2xlPVwibWVudWl0ZW1cIl1bYXJpYS1sYWJlbCo9XCJEZWxldGVcIl0nLFxuICAgICAgICAnW3JvbGU9XCJtZW51aXRlbVwiXVthcmlhLWxhYmVsKj1cImRlbGV0ZVwiXScsXG4gICAgICAgICdsaVtyb2xlPVwibWVudWl0ZW1cIl0gYnV0dG9uJyxcbiAgICAgICAgJ2Rpdltyb2xlPVwibWVudWl0ZW1cIl0gYnV0dG9uJyxcbiAgICAgICAgJ2J1dHRvbltkYXRhLWNsaWNrLWlkPVwiZGVsZXRlXCJdJyxcbiAgICAgICAgJ2J1dHRvbltkYXRhLXRlc3RpZD1cImRlbGV0ZS1wb3N0LWJ1dHRvblwiXSdcbiAgICAgIF07XG4gICAgICBcbiAgICAgIC8vIEZpbmQgZGVsZXRlIGJ1dHRvbiBieSBzZWxlY3RvcnNcbiAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2YgZGVsZXRlU2VsZWN0b3JzKSB7XG4gICAgICAgIGRlbGV0ZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICBpZiAoZGVsZXRlQnV0dG9uICYmIChcbiAgICAgICAgICBkZWxldGVCdXR0b24udGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2RlbGV0ZScpIHx8XG4gICAgICAgICAgZGVsZXRlQnV0dG9uLmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcpPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdkZWxldGUnKVxuICAgICAgICApKSB7XG4gICAgICAgICAgZG9tTG9nZ2VyLmxvZygnW0RPTSBTY3JpcHRdIEZvdW5kIGRlbGV0ZSBidXR0b24gd2l0aCBzZWxlY3RvcjonLCBzZWxlY3Rvcik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZGVsZXRlQnV0dG9uID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gRmFsbGJhY2s6IGZpbmQgYnkgdGV4dCBjb250ZW50XG4gICAgICBpZiAoIWRlbGV0ZUJ1dHRvbikge1xuICAgICAgICBjb25zdCBhbGxCdXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uLCBbcm9sZT1cIm1lbnVpdGVtXCJdJyk7XG4gICAgICAgIGZvciAoY29uc3QgYnRuIG9mIGFsbEJ1dHRvbnMpIHtcbiAgICAgICAgICBpZiAoYnRuLnRleHRDb250ZW50Py50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdkZWxldGUnKSB8fCBcbiAgICAgICAgICAgICAgYnRuLmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcpPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdkZWxldGUnKSkge1xuICAgICAgICAgICAgZGVsZXRlQnV0dG9uID0gYnRuO1xuICAgICAgICAgICAgZG9tTG9nZ2VyLmxvZygnW0RPTSBTY3JpcHRdIEZvdW5kIGRlbGV0ZSBidXR0b24gYnkgdGV4dCBjb250ZW50Jyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKCFkZWxldGVCdXR0b24pIHtcbiAgICAgICAgZG9tTG9nZ2VyLmxvZygnW0RPTSBTY3JpcHRdIERlbGV0ZSBvcHRpb24gbm90IGZvdW5kIGluIGRyb3Bkb3duJyk7XG4gICAgICAgIC8vIENsb3NlIGRyb3Bkb3duIGJ5IGNsaWNraW5nIGVsc2V3aGVyZVxuICAgICAgICBkb2N1bWVudC5ib2R5LmNsaWNrKCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gQ2xpY2sgZGVsZXRlIGJ1dHRvblxuICAgICAgZGVsZXRlQnV0dG9uLmNsaWNrKCk7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTAwKSk7XG4gICAgICBcbiAgICAgIC8vIExvb2sgZm9yIGNvbmZpcm1hdGlvbiBkaWFsb2cgYW5kIGNsaWNrIGNvbmZpcm1cbiAgICAgIGxldCBjb25maXJtQnV0dG9uID0gbnVsbDtcbiAgICAgIFxuICAgICAgLy8gVHJ5IG11bHRpcGxlIHNlbGVjdG9yIHN0cmF0ZWdpZXMgZm9yIHRoZSBjb25maXJtYXRpb24gYnV0dG9uXG4gICAgICBjb25zdCBjb25maXJtU2VsZWN0b3JzID0gW1xuICAgICAgICAnYnV0dG9uW2FyaWEtbGFiZWwqPVwiRGVsZXRlIHBvc3RcIl0nLFxuICAgICAgICAnYnV0dG9uW2FyaWEtbGFiZWwqPVwiQ29uZmlybSBkZWxldGVcIl0nLFxuICAgICAgICAnYnV0dG9uW2RhdGEtY2xpY2staWQ9XCJkZWxldGVQb3N0XCJdJyxcbiAgICAgICAgJ2J1dHRvbltkYXRhLXRlc3RpZD1cImRlbGV0ZS1wb3N0LWNvbmZpcm0tYnV0dG9uXCJdJyxcbiAgICAgICAgJ2J1dHRvbltjbGFzcyo9XCJkZWxldGVcIl0nLFxuICAgICAgICAnYnV0dG9uW2NsYXNzKj1cImNvbmZpcm1cIl0nXG4gICAgICBdO1xuICAgICAgXG4gICAgICAvLyBGaW5kIGNvbmZpcm0gYnV0dG9uIGJ5IHNlbGVjdG9ycyBhbmQgdGV4dCBjb250ZW50XG4gICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIGNvbmZpcm1TZWxlY3RvcnMpIHtcbiAgICAgICAgY29uc3QgYnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICBmb3IgKGNvbnN0IGJ0biBvZiBidXR0b25zKSB7XG4gICAgICAgICAgaWYgKGJ0bi50ZXh0Q29udGVudD8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnZGVsZXRlJykgfHwgXG4gICAgICAgICAgICAgIGJ0bi50ZXh0Q29udGVudD8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnY29uZmlybScpIHx8XG4gICAgICAgICAgICAgIGJ0bi5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnKT8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnZGVsZXRlJykgfHxcbiAgICAgICAgICAgICAgYnRuLmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcpPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdjb25maXJtJykpIHtcbiAgICAgICAgICAgIGNvbmZpcm1CdXR0b24gPSBidG47XG4gICAgICAgICAgICBkb21Mb2dnZXIubG9nKCdbRE9NIFNjcmlwdF0gRm91bmQgY29uZmlybSBidXR0b24gd2l0aCBzZWxlY3RvcjonLCBzZWxlY3Rvcik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbmZpcm1CdXR0b24pIGJyZWFrO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBGYWxsYmFjazogZmluZCBieSB0ZXh0IGNvbnRlbnQgaW4gYW55IGJ1dHRvblxuICAgICAgaWYgKCFjb25maXJtQnV0dG9uKSB7XG4gICAgICAgIGNvbnN0IGFsbEJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKTtcbiAgICAgICAgZm9yIChjb25zdCBidG4gb2YgYWxsQnV0dG9ucykge1xuICAgICAgICAgIGlmIChidG4udGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2RlbGV0ZSBwb3N0JykgfHwgXG4gICAgICAgICAgICAgIGJ0bi50ZXh0Q29udGVudD8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnY29uZmlybSBkZWxldGUnKSkge1xuICAgICAgICAgICAgY29uZmlybUJ1dHRvbiA9IGJ0bjtcbiAgICAgICAgICAgIGRvbUxvZ2dlci5sb2coJ1tET00gU2NyaXB0XSBGb3VuZCBjb25maXJtIGJ1dHRvbiBieSB0ZXh0IGNvbnRlbnQnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoY29uZmlybUJ1dHRvbikge1xuICAgICAgICBjb25maXJtQnV0dG9uLmNsaWNrKCk7XG4gICAgICAgIGRvbUxvZ2dlci5sb2coJ1tET00gU2NyaXB0XSBEZWxldGUgY29uZmlybWF0aW9uIGNsaWNrZWQnKTtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDEwMDApKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb21Mb2dnZXIubG9nKCdbRE9NIFNjcmlwdF0gRGVsZXRlIGNvbmZpcm1hdGlvbiBidXR0b24gbm90IGZvdW5kJyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIFxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBkb21Mb2dnZXIuZXJyb3IoJ1tET00gU2NyaXB0XSBFcnJvciBkdXJpbmcgcG9zdCBkZWxldGlvbjonLCBlcnJvcik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59KVxuXG4vLyBUcmFjayBwcm9jZXNzZWQgbWVzc2FnZXMgdG8gcHJldmVudCBkdXBsaWNhdGVzXG5jb25zdCBwcm9jZXNzZWRNZXNzYWdlcyA9IG5ldyBTZXQoKTtcblxuLy8gVXBkYXRlIG1lc3NhZ2UgbGlzdGVuZXJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gIGNvbnN0IHsgdHlwZSwgcGF5bG9hZCB9ID0gZXZlbnQuZGF0YTtcbiAgXG4gIC8vIFNraXAgaWYgbm90IG91ciBtZXNzYWdlIHR5cGVcbiAgaWYgKCF0eXBlIHx8ICF0eXBlLnN0YXJ0c1dpdGgoJ1JFRERJVF9QT1NUX01BQ0hJTkVfJykpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgXG4gIC8vIENyZWF0ZSB1bmlxdWUgbWVzc2FnZSBJRCB0byBwcmV2ZW50IGR1cGxpY2F0ZSBoYW5kbGluZ1xuICBjb25zdCBtZXNzYWdlSWQgPSBgJHt0eXBlfS0ke0RhdGUubm93KCl9YDtcbiAgXG4gIC8vIERlYm91bmNlOiBTa2lwIGlmIHdlJ3ZlIHNlZW4gYSBzaW1pbGFyIG1lc3NhZ2UgdmVyeSByZWNlbnRseSAod2l0aGluIDUwMG1zKVxuICBjb25zdCByZWNlbnRLZXkgPSBgJHt0eXBlfS1yZWNlbnRgO1xuICBpZiAocHJvY2Vzc2VkTWVzc2FnZXMuaGFzKHJlY2VudEtleSkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgcHJvY2Vzc2VkTWVzc2FnZXMuYWRkKHJlY2VudEtleSk7XG4gIHNldFRpbWVvdXQoKCkgPT4gcHJvY2Vzc2VkTWVzc2FnZXMuZGVsZXRlKHJlY2VudEtleSksIDUwMCk7XG5cbiAgaWYgKHR5cGUgPT09ICdSRURESVRfUE9TVF9NQUNISU5FX0ZJTExfRk9STScpIHtcbiAgICBSZWRkaXRET01IZWxwZXIuZmlsbFBvc3RGb3JtKHBheWxvYWQpO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdSRURESVRfUE9TVF9NQUNISU5FX05BVklHQVRFX1BST0ZJTEUnKSB7XG4gICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IFJlZGRpdERPTUhlbHBlci5uYXZpZ2F0ZVRvVXNlclByb2ZpbGUocGF5bG9hZD8udXNlck5hbWUpOyBcbiAgICB3aW5kb3cucG9zdE1lc3NhZ2UoeyBcbiAgICAgICAgdHlwZTogJ1JFRERJVF9QT1NUX01BQ0hJTkVfQUNUSU9OX1JFU1VMVCcsIFxuICAgICAgICBhY3Rpb246ICdOQVZJR0FURV9QUk9GSUxFJyxcbiAgICAgICAgc3VjY2Vzczogc3VjY2VzcyBcbiAgICB9LCAnKicpO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdSRURESVRfUE9TVF9NQUNISU5FX05BVklHQVRFX1BPU1RTJykge1xuICAgIGNvbnN0IHN1Y2Nlc3MgPSBhd2FpdCBSZWRkaXRET01IZWxwZXIubmF2aWdhdGVUb1Bvc3RzVGFiKHBheWxvYWQ/LnVzZXJOYW1lKTtcbiAgICB3aW5kb3cucG9zdE1lc3NhZ2UoeyBcbiAgICAgICAgdHlwZTogJ1JFRERJVF9QT1NUX01BQ0hJTkVfQUNUSU9OX1JFU1VMVCcsIFxuICAgICAgICBhY3Rpb246ICdOQVZJR0FURV9QT1NUUycsXG4gICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3NcbiAgICB9LCAnKicpO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdSRURESVRfUE9TVF9NQUNISU5FX0RFTEVURV9QT1NUJykge1xuICAgIGRvbUxvZ2dlci5sb2coJ1tET00gU2NyaXB0XSBIYW5kbGluZyBERUxFVEVfUE9TVCByZXF1ZXN0OicsIHBheWxvYWQpXG4gICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IFJlZGRpdERPTUhlbHBlci5kZWxldGVMYXN0UG9zdChwYXlsb2FkPy5wb3N0KTtcbiAgICB3aW5kb3cucG9zdE1lc3NhZ2UoeyBcbiAgICAgICAgdHlwZTogJ1JFRERJVF9QT1NUX01BQ0hJTkVfQUNUSU9OX1JFU1VMVCcsIFxuICAgICAgICBhY3Rpb246ICdERUxFVEVfUE9TVCcsXG4gICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3MsXG4gICAgICAgIGRhdGE6IHBheWxvYWQ/LnBvc3RcbiAgICB9LCAnKicpO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdSRURESVRfUE9TVF9NQUNISU5FX0dFVF9QT1NUUycpIHtcbiAgICBkb21Mb2dnZXIubG9nKCdbRE9NIFNjcmlwdF0gSGFuZGxpbmcgR0VUX1BPU1RTIHJlcXVlc3Q6JywgcGF5bG9hZClcbiAgICBjb25zdCBwb3N0c0RhdGEgPSBhd2FpdCBSZWRkaXRET01IZWxwZXIuY2hlY2tVc2VyUG9zdHMoKTtcbiAgICB3aW5kb3cucG9zdE1lc3NhZ2UoeyBcbiAgICAgICAgdHlwZTogJ1JFRERJVF9QT1NUX01BQ0hJTkVfQUNUSU9OX1JFU1VMVCcsIFxuICAgICAgICBhY3Rpb246ICdHRVRfUE9TVFMnLFxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiBwb3N0c0RhdGFcbiAgICB9LCAnKicpO1xuICB9XG59KSIsICIvKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyoqXG4gKiBUSElTIEZJTEUgSVMgR0VORVJBVEVEIEFVVE9NQVRJQ0FMTFkuXG4gKiBETyBOT1QgRURJVC5cbiAqXG4gKiBZb3UgYXJlIHByb2JhYmx5IGxvb2tpbmcgaW50byBhZGRpbmcgaG9va3MgaW4geW91ciBjb2RlLiBUaGlzIHNob3VsZCBiZSBkb25lIGJ5IG1lYW5zIG9mXG4gKiBzcmMtYmV4L2pzL2RvbS1ob29rcy5qcyB3aGljaCBpcyBpbmplY3RlZCBpbnRvIHRoZSB3ZWIgcGFnZSBhbmQgaGFzIGEgY29tbXVuaWNhdGlvbiBicmlkZ2VcbiAqKi9cblxuaW1wb3J0IEJyaWRnZSBmcm9tICcuL2JyaWRnZSdcbmltcG9ydCB7IGxpc3RlbkZvcldpbmRvd0V2ZW50cyB9IGZyb20gJy4vd2luZG93LWV2ZW50LWxpc3RlbmVyJ1xuaW1wb3J0IHJ1bkRldmxhbmREb20gZnJvbSAnLi4vLi4vc3JjLWJleC9kb20nXG5cbmxldCBicmlkZ2UgPSBuZXcgQnJpZGdlKHtcbiAgbGlzdGVuIChfZm4pIHsgfSxcbiAgc2VuZCAoZGF0YSkge1xuICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICAuLi5kYXRhLFxuICAgICAgZnJvbTogJ2JleC1kb20nXG4gICAgfVxuICAgIHdpbmRvdy5wb3N0TWVzc2FnZShwYXlsb2FkLCAnKicpXG4gIH1cbn0pXG5cbi8vIExpc3RlbiBmb3IgZXZlbnRzIGZyb20gdGhlIEJFWCBjb250ZW50IHNjcmlwdFxubGlzdGVuRm9yV2luZG93RXZlbnRzKGJyaWRnZSwgJ2JleC1jb250ZW50LXNjcmlwdCcpXG5cbnJ1bkRldmxhbmREb20oYnJpZGdlKVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBdUJBLFVBQUksSUFBSSxPQUFPLFlBQVksV0FBVyxVQUFVO0FBQ2hELFVBQUksZUFBZSxLQUFLLE9BQU8sRUFBRSxVQUFVLGFBQ3ZDLEVBQUUsUUFDRixTQUFTQSxjQUFhLFFBQVEsVUFBVSxNQUFNO0FBQzlDLGVBQU8sU0FBUyxVQUFVLE1BQU0sS0FBSyxRQUFRLFVBQVUsSUFBSTtBQUFBLE1BQzdEO0FBRUYsVUFBSTtBQUNKLFVBQUksS0FBSyxPQUFPLEVBQUUsWUFBWSxZQUFZO0FBQ3hDLHlCQUFpQixFQUFFO0FBQUEsTUFDckIsV0FBVyxPQUFPLHVCQUF1QjtBQUN2Qyx5QkFBaUIsU0FBU0MsZ0JBQWUsUUFBUTtBQUMvQyxpQkFBTyxPQUFPLG9CQUFvQixNQUFNLEVBQ3JDLE9BQU8sT0FBTyxzQkFBc0IsTUFBTSxDQUFDO0FBQUEsUUFDaEQ7QUFBQSxNQUNGLE9BQU87QUFDTCx5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SUFBSSw0Q0FBNEMsT0FBTztBQUNqRSxZQUFNLFlBQVksTUFBTSxnQkFBZ0IsZUFBZTtBQUN2RCxhQUFPLFlBQVk7QUFBQSxRQUNmLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLFNBQVM7QUFBQSxRQUNULE1BQU07QUFBQSxNQUNWLEdBQUcsR0FBRztBQUFBLElBQ1I7QUFBQSxFQUNGLENBQUM7OztBQzF0Q0QsTUFBSSxTQUFTLElBQUksT0FBTztBQUFBLElBQ3RCLE9BQVEsS0FBSztBQUFBLElBQUU7QUFBQSxJQUNmLEtBQU0sTUFBTTtBQUNWLFlBQU0sVUFBVTtBQUFBLFFBQ2QsR0FBRztBQUFBLFFBQ0gsTUFBTTtBQUFBLE1BQ1I7QUFDQSxhQUFPLFlBQVksU0FBUyxHQUFHO0FBQUEsSUFDakM7QUFBQSxFQUNGLENBQUM7QUFHRCx3QkFBc0IsUUFBUSxvQkFBb0I7QUFFbEQsY0FBYyxNQUFNOyIsCiAgIm5hbWVzIjogWyJSZWZsZWN0QXBwbHkiLCAiUmVmbGVjdE93bktleXMiLCAiTnVtYmVySXNOYU4iLCAiRXZlbnRFbWl0dGVyIiwgIm9uY2UiLCAiYnJpZGdlIiwgImJyaWRnZSJdCn0K
