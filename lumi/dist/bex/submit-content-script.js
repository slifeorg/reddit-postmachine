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

  // src-bex/submit-content-script.js
  function injectBeforeUnloadBlocker() {
    try {
      const script = document.createElement("script");
      script.textContent = `(() => {
      try {
        const originalAdd = window.addEventListener
        window.addEventListener = function(type, listener, options) {
          if (type === 'beforeunload') return
          return originalAdd.call(this, type, listener, options)
        }
        window.onbeforeunload = null
      } catch (e) {}
    })();`;
      (document.documentElement || document.head || document.body).appendChild(script);
      script.remove();
    } catch (e) {
    }
  }
  injectBeforeUnloadBlocker();
  function removeBeforeUnloadListeners() {
    submitLogger.log(`Removing Reddit's beforeunload event listeners to prevent "Leave site?" dialog`);
    window.onbeforeunload = null;
    window.addEventListener("beforeunload", (e) => {
      if (typeof e.stopImmediatePropagation === "function")
        e.stopImmediatePropagation();
      if (typeof e.stopPropagation === "function")
        e.stopPropagation();
    }, true);
    submitLogger.log("Beforeunload listeners disabled successfully");
  }
  function qs(selector) {
    return document.querySelector(selector);
  }
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function fetchPostDataForSubmission() {
    try {
      const storedData = sessionStorage.getItem("reddit-post-machine-postdata");
      if (storedData) {
        const postData = JSON.parse(storedData);
        submitLogger.log("Using stored post data for submission:", postData);
        return postData;
      }
      throw new Error("No post data found - script may be running incorrectly");
    } catch (error) {
      submitLogger.error("Failed to fetch post data:", error);
      throw error;
    }
  }
  async function ensureSubmitPageReady() {
    submitLogger.log("Ensuring submit page is ready...");
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
      const submitForm = qs("form") || qs('[data-testid*="post"]') || qs("shreddit-post-composer");
      if (submitForm) {
        submitLogger.log("Submit page is ready");
        return true;
      }
      submitLogger.log(`Waiting for submit page... attempt ${attempts + 1}/${maxAttempts}`);
      await sleep(1e3);
      attempts++;
    }
    submitLogger.log("Submit page failed to load within timeout");
    return false;
  }
  async function fillTitle(postData) {
    submitLogger.log("Filling title field...");
    function deepQuery(selector, root = document) {
      const el = root.querySelector(selector);
      if (el)
        return el;
      for (const elem of root.querySelectorAll("*")) {
        if (elem.shadowRoot) {
          const found = deepQuery(selector, elem.shadowRoot);
          if (found)
            return found;
        }
      }
      return null;
    }
    try {
      const titleInputElement = deepQuery('faceplate-textarea-input[name="title"]');
      if (titleInputElement && postData.title) {
        const shadowRoot = titleInputElement.shadowRoot;
        if (shadowRoot) {
          const titleInput = shadowRoot.querySelector("#innerTextArea");
          if (titleInput) {
            titleInput.focus();
            await sleep(500);
            titleInput.value = postData.title;
            titleInput.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
            titleInput.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
            submitLogger.log("Title field filled:", postData.title);
            await sleep(1500);
            return true;
          }
        }
      }
      submitLogger.log("Failed to fill title");
      return false;
    } catch (error) {
      submitLogger.error("Error filling title:", error);
      return false;
    }
  }
  async function fillUrl(postData) {
    submitLogger.log("Filling URL field...");
    if (typeof removeBeforeUnloadListeners === "function") {
      removeBeforeUnloadListeners();
    }
    function deepQuery(selector, root = document) {
      const el = root.querySelector(selector);
      if (el)
        return el;
      for (const elem of root.querySelectorAll("*")) {
        if (elem.shadowRoot) {
          const found = deepQuery(selector, elem.shadowRoot);
          if (found)
            return found;
        }
      }
      return null;
    }
    try {
      submitLogger.log("URL fill attempt - postData.url:", postData?.url);
      if (postData.url && postData.url.trim()) {
        submitLogger.log("Looking for URL input element...");
        const urlInputElement = deepQuery('faceplate-textarea-input[name="link"]');
        submitLogger.log("URL input element found:", !!urlInputElement);
        if (urlInputElement) {
          const shadowRoot = urlInputElement.shadowRoot;
          submitLogger.log("ShadowRoot accessible:", !!shadowRoot);
          if (shadowRoot) {
            const urlInput = shadowRoot.querySelector("#innerTextArea");
            submitLogger.log("Inner textarea found:", !!urlInput);
            if (urlInput) {
              urlInput.focus();
              await sleep(500);
              urlInput.value = postData.url;
              urlInput.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
              urlInput.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
              submitLogger.log("URL field filled:", postData.url);
              await sleep(1500);
              return true;
            }
          }
        }
      }
      submitLogger.log("Failed to fill URL or no URL provided");
      return false;
    } catch (error) {
      submitLogger.error("Error filling URL:", error);
      return false;
    }
  }
  async function fillBody(postData) {
    submitLogger.log("Filling body text...");
    function deepQuery(selector, root = document) {
      const el = root.querySelector(selector);
      if (el)
        return el;
      for (const elem of root.querySelectorAll("*")) {
        if (elem.shadowRoot) {
          const found = deepQuery(selector, elem.shadowRoot);
          if (found)
            return found;
        }
      }
      return null;
    }
    try {
      if (postData.body) {
        let isTitleField = function(element) {
          if (!element)
            return false;
          const parent = element.closest('faceplate-textarea-input[name="title"]');
          return !!parent;
        };
        submitLogger.log("Looking for body text field with updated selectors...");
        await sleep(1e3);
        let bodyComposer = null;
        let bodyEditable = null;
        bodyComposer = deepQuery('shreddit-composer[name="body"]');
        if (bodyComposer) {
          bodyEditable = bodyComposer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]');
        }
        if (!bodyEditable) {
          const composerSelectors = [
            "shreddit-composer",
            "shreddit-rich-text-editor",
            '[data-testid="composer"]',
            ".public-DraftEditor-content"
          ];
          for (const selector of composerSelectors) {
            const composer = deepQuery(selector);
            if (composer) {
              const candidates = [
                composer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]'),
                composer.querySelector('[contenteditable="true"]'),
                composer.querySelector(".public-DraftEditor-content")
              ];
              for (const candidate of candidates) {
                if (candidate && !isTitleField(candidate)) {
                  bodyEditable = candidate;
                  submitLogger.log(`Found body field with selector: ${selector}`);
                  break;
                }
              }
              if (bodyEditable)
                break;
            }
          }
        }
        if (!bodyEditable) {
          const submitForm = qs("form") || qs('[data-testid*="post"]') || qs("shreddit-post-composer");
          if (submitForm) {
            const candidates = [
              submitForm.querySelector('div[contenteditable="true"]'),
              submitForm.querySelector('[data-lexical-editor="true"]')
            ];
            for (const candidate of candidates) {
              if (candidate && !isTitleField(candidate)) {
                bodyEditable = candidate;
                submitLogger.log("Found body field in submit form");
                break;
              }
            }
          }
        }
        if (!bodyEditable) {
          submitLogger.log("Body field not immediately available, polling for up to 5 seconds...");
          const maxPollAttempts = 10;
          const pollInterval = 500;
          for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
            await sleep(pollInterval);
            const bodyComposer2 = deepQuery('shreddit-composer[name="body"]');
            if (bodyComposer2) {
              bodyEditable = bodyComposer2.querySelector('div[contenteditable="true"][data-lexical-editor="true"]');
            }
            if (!bodyEditable) {
              const submitForm = qs("form") || qs('[data-testid*="post"]') || qs("shreddit-post-composer");
              if (submitForm) {
                const candidates = [
                  submitForm.querySelector('div[contenteditable="true"]'),
                  submitForm.querySelector('[data-lexical-editor="true"]')
                ];
                for (const candidate of candidates) {
                  if (candidate && !isTitleField(candidate)) {
                    bodyEditable = candidate;
                    submitLogger.log(`Found body field after polling (attempt ${attempt + 1})`);
                    break;
                  }
                }
              }
            }
            if (bodyEditable)
              break;
          }
        }
        if (bodyEditable) {
          submitLogger.log("Found body text editor, setting text...");
          bodyEditable.focus();
          await sleep(500);
          bodyEditable.innerHTML = "<p><br></p>";
          const text = postData.body;
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (document.execCommand && document.execCommand("insertText", false, char)) {
            } else {
              const selection = window.getSelection();
              if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                const textNode = document.createTextNode(char);
                range.insertNode(textNode);
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }
            bodyEditable.dispatchEvent(new InputEvent("input", {
              inputType: "insertText",
              data: char,
              bubbles: true,
              cancelable: true
            }));
            await sleep(10);
          }
          bodyEditable.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
          submitLogger.log("Body text set successfully");
          await sleep(1500);
          return true;
        } else {
          submitLogger.log("Body text field not found with any selector");
          submitLogger.log("Available elements in document:");
          submitLogger.log("Forms:", document.querySelectorAll("form").length);
          submitLogger.log("Contenteditable divs:", document.querySelectorAll('[contenteditable="true"]').length);
          submitLogger.log("Shreddit composers:", document.querySelectorAll("shreddit-composer").length);
        }
      }
      submitLogger.log("Failed to fill body or no body text provided");
      return false;
    } catch (error) {
      submitLogger.error("Error filling body:", error);
      return false;
    }
  }
  async function clickBodyField() {
    submitLogger.log("Clicking body text field to activate Post button...");
    function deepQuery(selector, root = document) {
      const el = root.querySelector(selector);
      if (el)
        return el;
      for (const elem of root.querySelectorAll("*")) {
        if (elem.shadowRoot) {
          const found = deepQuery(selector, elem.shadowRoot);
          if (found)
            return found;
        }
      }
      return null;
    }
    try {
      let isTitleField = function(element) {
        if (!element)
          return false;
        const parent = element.closest('faceplate-textarea-input[name="title"]');
        return !!parent;
      };
      await sleep(1e3);
      let bodyEditable = null;
      const bodyComposer = deepQuery('shreddit-composer[name="body"]');
      if (bodyComposer) {
        bodyEditable = bodyComposer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]');
      }
      if (!bodyEditable) {
        const composerSelectors = [
          "shreddit-composer",
          "shreddit-rich-text-editor",
          '[data-testid="composer"]',
          ".public-DraftEditor-content"
        ];
        for (const selector of composerSelectors) {
          const composer = deepQuery(selector);
          if (composer) {
            const candidates = [
              composer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]'),
              composer.querySelector('[contenteditable="true"]'),
              composer.querySelector(".public-DraftEditor-content")
            ];
            for (const candidate of candidates) {
              if (candidate && !isTitleField(candidate)) {
                bodyEditable = candidate;
                submitLogger.log(`Found body field with selector: ${selector}`);
                break;
              }
            }
            if (bodyEditable)
              break;
          }
        }
      }
      if (!bodyEditable) {
        const submitForm = qs("form") || qs('[data-testid*="post"]') || qs("shreddit-post-composer");
        if (submitForm) {
          const candidates = [
            submitForm.querySelector('div[contenteditable="true"]'),
            submitForm.querySelector('[data-lexical-editor="true"]')
          ];
          for (const candidate of candidates) {
            if (candidate && !isTitleField(candidate)) {
              bodyEditable = candidate;
              submitLogger.log("Found body field in submit form");
              break;
            }
          }
        }
      }
      if (!bodyEditable) {
        submitLogger.log("Body field not immediately available, polling for up to 5 seconds...");
        const maxPollAttempts = 10;
        const pollInterval = 500;
        for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
          await sleep(pollInterval);
          const bodyComposer2 = deepQuery('shreddit-composer[name="body"]');
          if (bodyComposer2) {
            bodyEditable = bodyComposer2.querySelector('div[contenteditable="true"][data-lexical-editor="true"]');
          }
          if (!bodyEditable) {
            const submitForm = qs("form") || qs('[data-testid*="post"]') || qs("shreddit-post-composer");
            if (submitForm) {
              const candidates = [
                submitForm.querySelector('div[contenteditable="true"]'),
                submitForm.querySelector('[data-lexical-editor="true"]')
              ];
              for (const candidate of candidates) {
                if (candidate && !isTitleField(candidate)) {
                  bodyEditable = candidate;
                  submitLogger.log(`Found body field after polling (attempt ${attempt + 1})`);
                  break;
                }
              }
            }
          }
          if (bodyEditable)
            break;
        }
      }
      if (bodyEditable) {
        submitLogger.log("Found body text field, clicking to activate Post button...");
        bodyEditable.click();
        await sleep(100);
        bodyEditable.focus();
        await sleep(100);
        bodyEditable.click();
        bodyEditable.dispatchEvent(new Event("focus", { bubbles: true, cancelable: true }));
        bodyEditable.dispatchEvent(new Event("click", { bubbles: true, cancelable: true }));
        await sleep(1e3);
        return true;
      } else {
        submitLogger.log("Body text field not found with any selector");
        submitLogger.log("Available elements in document:");
        submitLogger.log("Forms:", document.querySelectorAll("form").length);
        submitLogger.log("Contenteditable divs:", document.querySelectorAll('[contenteditable="true"]').length);
        submitLogger.log("Shreddit composers:", document.querySelectorAll("shreddit-composer").length);
      }
      submitLogger.log("Body text field not found");
      return false;
    } catch (error) {
      submitLogger.error("Error clicking body field:", error);
      return false;
    }
  }
  async function clickTab(tabValue) {
    submitLogger.log(`Clicking tab with data-select-value="${tabValue}"`);
    function deepQuery(selector, root = document) {
      const el = root.querySelector(selector);
      if (el)
        return el;
      for (const elem of root.querySelectorAll("*")) {
        if (elem.shadowRoot) {
          const found = deepQuery(selector, elem.shadowRoot);
          if (found)
            return found;
        }
      }
      return null;
    }
    const tab = deepQuery(`[data-select-value="${tabValue}"]`);
    if (tab) {
      tab.click();
      await sleep(2e3);
      return true;
    }
    submitLogger.log(`Tab with data-select-value="${tabValue}" not found`);
    return false;
  }
  async function handleRuleViolationDialog() {
    submitLogger.log("Checking for rule violation dialog after submit...");
    function deepQuery(selector, root = document) {
      const el = root.querySelector(selector);
      if (el)
        return el;
      for (const elem of root.querySelectorAll("*")) {
        if (elem.shadowRoot) {
          const found = deepQuery(selector, elem.shadowRoot);
          if (found)
            return found;
        }
      }
      return null;
    }
    try {
      const maxAttempts = 20;
      const pollInterval = 500;
      let dialogFound = false;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await sleep(pollInterval);
        const dialogSelectors = [
          '[role="dialog"]',
          ".modal",
          ".popup",
          '[data-testid="dialog"]',
          "shreddit-modal",
          ".rule-violation-dialog"
        ];
        let dialog = null;
        for (const selector of dialogSelectors) {
          dialog = qs(selector) || deepQuery(selector);
          if (dialog)
            break;
        }
        if (!dialog) {
          continue;
        }
        dialogFound = true;
        const dialogText = dialog.textContent?.toLowerCase() || "";
        const ruleViolationIndicators = [
          "break these rules",
          "rule violation",
          "may break",
          "remember, ai can make mistakes",
          "submit without editing",
          "edit post"
        ];
        const isRuleViolationDialog = ruleViolationIndicators.some(
          (indicator) => dialogText.includes(indicator.toLowerCase())
        );
        if (!isRuleViolationDialog) {
          submitLogger.log("Dialog found but not a rule violation dialog");
          continue;
        }
        submitLogger.log('Rule violation dialog detected, looking for "Submit without editing" button...');
        let submitButton = null;
        const allButtons = dialog.querySelectorAll("button");
        for (const button of allButtons) {
          const buttonText = button.textContent?.trim() || "";
          if (buttonText.toLowerCase().includes("submit without editing")) {
            submitButton = button;
            break;
          }
        }
        if (!submitButton) {
          for (const elem of dialog.querySelectorAll("*")) {
            if (elem.shadowRoot) {
              const shadowButtons = elem.shadowRoot.querySelectorAll("button");
              for (const button of shadowButtons) {
                const buttonText = button.textContent?.trim() || "";
                if (buttonText.toLowerCase().includes("submit without editing")) {
                  submitButton = button;
                  break;
                }
              }
              if (submitButton)
                break;
            }
          }
        }
        if (!submitButton) {
          const submitWithoutEditingSelectors = [
            '[data-click-id="submit-without-editing"]',
            ".submit-without-editing",
            'button[type="submit"]'
          ];
          for (const selector of submitWithoutEditingSelectors) {
            submitButton = dialog.querySelector(selector) || deepQuery(selector, dialog);
            if (submitButton)
              break;
          }
        }
        if (submitButton) {
          submitLogger.log('Found "Submit without editing" button, clicking...');
          submitButton.click();
          await sleep(2e3);
          const dialogStillExists = qs(dialogSelectors[0]) || deepQuery(dialogSelectors[0]);
          const stillOnSubmitPage = window.location.href.includes("/submit");
          if (!dialogStillExists && !stillOnSubmitPage) {
            submitLogger.log("Rule violation dialog handled successfully - submission completed");
            return true;
          } else if (dialogStillExists) {
            submitLogger.log("Dialog still exists after clicking, may need to try again");
            continue;
          } else {
            submitLogger.log("Dialog closed but still on submit page, checking submission status...");
            await sleep(3e3);
            if (!window.location.href.includes("/submit")) {
              submitLogger.log("Rule violation dialog handled successfully - submission completed");
              return true;
            } else {
              submitLogger.log("Still on submit page after dialog handling, may have failed");
              continue;
            }
          }
        } else {
          submitLogger.log('Could not find "Submit without editing" button in dialog, continuing to poll...');
          continue;
        }
      }
      if (dialogFound) {
        submitLogger.log("Rule violation dialog was found but could not be handled within timeout period");
      } else {
        submitLogger.log("No rule violation dialog found within timeout period");
      }
      return false;
    } catch (error) {
      submitLogger.error("Error handling rule violation dialog:", error);
      return false;
    }
  }
  async function submitPost() {
    submitLogger.log("Submitting post...");
    function deepQuery(selector, root = document) {
      const el = root.querySelector(selector);
      if (el)
        return el;
      for (const elem of root.querySelectorAll("*")) {
        if (elem.shadowRoot) {
          const found = deepQuery(selector, elem.shadowRoot);
          if (found)
            return found;
        }
      }
      return null;
    }
    try {
      const checkButtonActive = () => {
        const innerButton = deepQuery("#inner-post-submit-button");
        if (innerButton) {
          const isDisabled = innerButton.disabled || innerButton.getAttribute("aria-disabled") === "true";
          submitLogger.log("Inner post button active:", !isDisabled);
          return !isDisabled;
        }
        const postContainer2 = deepQuery("r-post-form-submit-button#submit-post-button");
        if (postContainer2 && postContainer2.shadowRoot) {
          const shadowButton = postContainer2.shadowRoot.querySelector("button");
          if (shadowButton) {
            const isShadowDisabled = shadowButton.disabled || shadowButton.getAttribute("aria-disabled") === "true";
            submitLogger.log("Shadow post button active:", !isShadowDisabled);
            return !isShadowDisabled;
          }
        }
        return false;
      };
      const startTime = Date.now();
      while (Date.now() - startTime < 1e4) {
        if (checkButtonActive()) {
          break;
        }
        await sleep(500);
      }
      const innerPostButton = deepQuery("#inner-post-submit-button");
      if (innerPostButton && !innerPostButton.disabled) {
        submitLogger.log("Found active inner post button, clicking...");
        innerPostButton.click();
        await handleRuleViolationDialog();
        return true;
      }
      const postContainer = deepQuery("r-post-form-submit-button#submit-post-button");
      if (postContainer) {
        submitLogger.log("Found post container");
        if (postContainer.shadowRoot) {
          const shadowButton = postContainer.shadowRoot.querySelector("button");
          if (shadowButton && !shadowButton.disabled) {
            submitLogger.log("Found active button in shadow DOM, clicking...");
            shadowButton.click();
            await handleRuleViolationDialog();
            return true;
          }
        }
        submitLogger.log("Clicking post container directly");
        postContainer.click();
        await handleRuleViolationDialog();
        return true;
      }
      const submitButton = qs('button[data-click-id="submit"], button[type="submit"], [data-testid="post-submit"]');
      if (submitButton) {
        submitButton.click();
        submitLogger.log("Submit button clicked");
        await handleRuleViolationDialog();
        return true;
      } else {
        submitLogger.log("Submit button not found");
        return false;
      }
    } catch (error) {
      submitLogger.error("Error submitting post:", error);
      return false;
    }
  }
  async function runPostSubmissionScript(skipTabStateCheck = false) {
    submitLogger.log("=== POST SUBMISSION SCRIPT STARTED ===");
    removeBeforeUnloadListeners();
    try {
      if (!skipTabStateCheck) {
        const tabStateResponse = await chrome.runtime.sendMessage({
          type: "GET_TAB_STATE"
        });
        if (tabStateResponse.success && tabStateResponse.isBackgroundPostTab) {
          submitLogger.log("Skipping auto-run post submission - this tab was created by background script");
          return;
        }
      }
      await ensureSubmitPageReady();
      const postData = await fetchPostDataForSubmission();
      if (!postData) {
        submitLogger.log("Post submission script: No post data available");
        return;
      }
      submitLogger.log("Post submission script: Got post data:", postData.title);
      const isLinkPost = postData.url && postData.url.trim();
      const targetTab = isLinkPost ? "LINK" : "TEXT";
      submitLogger.log(`=== Submitting as ${targetTab} post ===`);
      submitLogger.log(`=== STEP 1: ${targetTab} TAB - Filling title ===`);
      if (await clickTab(targetTab)) {
        await fillTitle(postData);
      } else {
        submitLogger.log(`Cannot proceed without ${targetTab} tab`);
        return;
      }
      if (isLinkPost) {
        submitLogger.log("=== STEP 2: Filling URL ===");
        await fillUrl(postData);
      }
      submitLogger.log("=== STEP 3: Activating Post button by clicking body field ===");
      await clickBodyField();
      await sleep(2e3);
      submitLogger.log("=== STEP 4: Fill body text ===");
      await fillBody(postData);
      submitLogger.log("=== STEP 5: Final activation click on body field ===");
      await clickBodyField();
      await sleep(2e3);
      submitLogger.log("=== STEP 6: Clicking Post button ===");
      const submitSuccess = await submitPost();
      if (submitSuccess) {
        submitLogger.log("Post submitted successfully, waiting 10 seconds...");
        await sleep(1e4);
        const redditUrl = window.location.href;
        let redditPostId = null;
        try {
          submitLogger.log("Extracting Reddit post ID from URL:", redditUrl);
          const urlPatterns = [
            /\/comments\/([a-z0-9]{6,7})/i,
            /\/r\/[^\/]+\/comments\/([a-z0-9]{6,7})/i,
            /reddit\.com\/.*\/([a-z0-9]{6,7})\//i,
            /^t3_([a-z0-9]{6,7})$/i
          ];
          for (const pattern of urlPatterns) {
            const match = redditUrl && redditUrl.match(pattern);
            if (match && match[1]) {
              redditPostId = match[1];
              submitLogger.log(`Extracted post ID using URL pattern: ${redditPostId}`);
              break;
            }
          }
          if (!redditPostId) {
            const pageData = window.__r || {};
            const postIdFromData = pageData?.post?.id || document.querySelector("[data-post-id]")?.getAttribute("data-post-id") || document.querySelector("shreddit-post")?.getAttribute("id");
            if (postIdFromData) {
              const idMatch = postIdFromData.match(/t3_([a-z0-9]{6,7})/i) || postIdFromData.match(/([a-z0-9]{6,7})/i);
              if (idMatch && idMatch[1]) {
                redditPostId = idMatch[1];
                submitLogger.log(`Extracted post ID from page data: ${redditPostId}`);
              }
            }
          }
          if (!redditPostId && window.location.pathname.includes("/comments/")) {
            const postElement = document.querySelector("shreddit-post");
            if (postElement && postElement.id) {
              const idMatch = postElement.id.match(/t3_([a-z0-9]{6,7})/i);
              if (idMatch && idMatch[1]) {
                redditPostId = idMatch[1];
                submitLogger.log(`Extracted post ID from post element: ${redditPostId}`);
              }
            }
          }
          if (!redditPostId) {
            submitLogger.warn("Could not extract Reddit post ID. URL:", redditUrl);
          } else {
            submitLogger.log(`Successfully extracted Reddit post ID: ${redditPostId}`);
          }
        } catch (e) {
          submitLogger.warn("Failed to extract Reddit post ID:", e);
        }
        submitLogger.log("Captured Reddit post URL/ID after submission:", { redditUrl, redditPostId });
        sessionStorage.removeItem("reddit-post-machine-postdata");
        chrome.runtime.sendMessage({
          type: "ACTION_COMPLETED",
          action: "POST_CREATION_COMPLETED",
          success: true,
          data: {
            redditUrl,
            redditPostId
          }
        }).catch(() => {
        });
      } else {
        submitLogger.log("Post submission failed");
        chrome.runtime.sendMessage({
          type: "ACTION_COMPLETED",
          action: "POST_CREATION_COMPLETED",
          success: false,
          error: "Post submission failed"
        }).catch(() => {
        });
        sessionStorage.removeItem("reddit-post-machine-postdata");
      }
      submitLogger.log("=== POST SUBMISSION SCRIPT COMPLETED ===");
    } catch (error) {
      submitLogger.error("Post submission script error:", error);
      chrome.runtime.sendMessage({
        type: "ACTION_COMPLETED",
        action: "POST_CREATION_COMPLETED",
        success: false,
        error: error.message
      }).catch(() => {
      });
    }
  }
  async function handleManualScriptTrigger(scriptType, mode) {
    submitLogger.log(`=== MANUAL TRIGGER: ${scriptType} (mode: ${mode}) ===`);
    try {
      if (scriptType === "post") {
        sessionStorage.removeItem("reddit-post-machine-script-stage");
        submitLogger.log("Manually triggering post submission script");
        await runPostSubmissionScript();
      } else {
        submitLogger.log(`Manual trigger for ${scriptType} not handled by submit script`);
      }
    } catch (error) {
      submitLogger.error("Manual script trigger error:", error);
    }
  }
  function handleStartPostCreation(userName, postData) {
    submitLogger.log(`Starting post creation for user: ${userName}`, postData);
    if (window.location.href.includes("/submit")) {
      submitLogger.log("Already on submit page, storing post data and triggering submission");
      if (postData) {
        sessionStorage.setItem("reddit-post-machine-postdata", JSON.stringify(postData));
      }
      runPostSubmissionScript(true);
      return;
    }
    if (postData) {
      sessionStorage.setItem("reddit-post-machine-postdata", JSON.stringify(postData));
    }
    submitLogger.log("Checking if user is logged in using proven method...");
    const avatarButton = qs('rpl-dropdown div, [data-testid="user-avatar"], button[aria-label*="user"], #expand-user-drawer-button');
    if (avatarButton) {
      submitLogger.log("Found user avatar button - user is logged in");
    } else {
      submitLogger.log("User avatar button not found - user may not be logged in");
      return;
    }
    submitLogger.log("Requesting background script to create new post tab");
    chrome.runtime.sendMessage({
      type: "CREATE_POST_TAB",
      postData
    }).then((response) => {
      if (response.success) {
        submitLogger.log("Background script created post tab successfully:", response.tabId);
      } else {
        submitLogger.error("Failed to create post tab:", response.error);
      }
    }).catch((error) => {
      submitLogger.error("Error requesting post tab creation:", error);
    });
  }
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    submitLogger.log("Submit script received message:", message);
    switch (message.type) {
      case "START_POST_CREATION":
        handleStartPostCreation(message.userName, message.postData);
        break;
      case "MANUAL_TRIGGER_SCRIPT":
        handleManualScriptTrigger(message.scriptType, message.mode);
        break;
      case "DELETE_LAST_POST":
        submitLogger.log("Submit script: DELETE_LAST_POST not supported on submit page, delegating...");
        chrome.runtime.sendMessage({
          type: "ACTION_COMPLETED",
          action: "DELETE_LAST_POST",
          success: false,
          error: "Delete operations must be performed on user profile pages"
        }).catch(() => {
        });
        break;
      default:
        return;
    }
  });
  submitLogger.log("\u{1F7E2} SUBMIT content script loaded on URL:", window.location.href);
  submitLogger.log("\u{1F7E2} SUBMIT script: All loaded scripts check:", document.querySelectorAll("script").length);
  function submit_content_script_default(bridge2) {
    submitLogger.log("Submit script bridge initialized", bridge2);
  }

  // .quasar/bex/entry-content-script-submit-content-script.js
  var port = chrome.runtime.connect({
    name: "contentScript"
  });
  var disconnected = false;
  port.onDisconnect.addListener(() => {
    disconnected = true;
  });
  var bridge = new Bridge({
    listen(fn) {
      port.onMessage.addListener(fn);
    },
    send(data) {
      if (!disconnected) {
        port.postMessage(data);
        window.postMessage({
          ...data,
          from: "bex-content-script"
        }, "*");
      }
    }
  });
  function injectScript(url) {
    const script = document.createElement("script");
    script.src = url;
    script.onload = function() {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  }
  if (document instanceof HTMLDocument) {
    injectScript(chrome.runtime.getURL("dom.js"));
  }
  listenForWindowEvents(bridge, "bex-dom");
  submit_content_script_default(bridge);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCAiLi4vLi4vLnF1YXNhci9iZXgvYnJpZGdlLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xdWFzYXIvc3JjL3V0aWxzL3VpZC91aWQuanMiLCAiLi4vLi4vLnF1YXNhci9iZXgvd2luZG93LWV2ZW50LWxpc3RlbmVyLmpzIiwgIi4uLy4uL3NyYy1iZXgvbG9nZ2VyLmpzIiwgIi4uLy4uL3NyYy1iZXgvc3VibWl0LWNvbnRlbnQtc2NyaXB0LmpzIiwgIi4uLy4uLy5xdWFzYXIvYmV4L2VudHJ5LWNvbnRlbnQtc2NyaXB0LXN1Ym1pdC1jb250ZW50LXNjcmlwdC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFIgPSB0eXBlb2YgUmVmbGVjdCA9PT0gJ29iamVjdCcgPyBSZWZsZWN0IDogbnVsbFxudmFyIFJlZmxlY3RBcHBseSA9IFIgJiYgdHlwZW9mIFIuYXBwbHkgPT09ICdmdW5jdGlvbidcbiAgPyBSLmFwcGx5XG4gIDogZnVuY3Rpb24gUmVmbGVjdEFwcGx5KHRhcmdldCwgcmVjZWl2ZXIsIGFyZ3MpIHtcbiAgICByZXR1cm4gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwodGFyZ2V0LCByZWNlaXZlciwgYXJncyk7XG4gIH1cblxudmFyIFJlZmxlY3RPd25LZXlzXG5pZiAoUiAmJiB0eXBlb2YgUi5vd25LZXlzID09PSAnZnVuY3Rpb24nKSB7XG4gIFJlZmxlY3RPd25LZXlzID0gUi5vd25LZXlzXG59IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcbiAgUmVmbGVjdE93bktleXMgPSBmdW5jdGlvbiBSZWZsZWN0T3duS2V5cyh0YXJnZXQpIHtcbiAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGFyZ2V0KVxuICAgICAgLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHRhcmdldCkpO1xuICB9O1xufSBlbHNlIHtcbiAgUmVmbGVjdE93bktleXMgPSBmdW5jdGlvbiBSZWZsZWN0T3duS2V5cyh0YXJnZXQpIHtcbiAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGFyZ2V0KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gUHJvY2Vzc0VtaXRXYXJuaW5nKHdhcm5pbmcpIHtcbiAgaWYgKGNvbnNvbGUgJiYgY29uc29sZS53YXJuKSBjb25zb2xlLndhcm4od2FybmluZyk7XG59XG5cbnZhciBOdW1iZXJJc05hTiA9IE51bWJlci5pc05hTiB8fCBmdW5jdGlvbiBOdW1iZXJJc05hTih2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT09IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIEV2ZW50RW1pdHRlci5pbml0LmNhbGwodGhpcyk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbm1vZHVsZS5leHBvcnRzLm9uY2UgPSBvbmNlO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50c0NvdW50ID0gMDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxudmFyIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuZnVuY3Rpb24gY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcikge1xuICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIFwibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgRnVuY3Rpb24uIFJlY2VpdmVkIHR5cGUgJyArIHR5cGVvZiBsaXN0ZW5lcik7XG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50RW1pdHRlciwgJ2RlZmF1bHRNYXhMaXN0ZW5lcnMnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gIH0sXG4gIHNldDogZnVuY3Rpb24oYXJnKSB7XG4gICAgaWYgKHR5cGVvZiBhcmcgIT09ICdudW1iZXInIHx8IGFyZyA8IDAgfHwgTnVtYmVySXNOYU4oYXJnKSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RoZSB2YWx1ZSBvZiBcImRlZmF1bHRNYXhMaXN0ZW5lcnNcIiBpcyBvdXQgb2YgcmFuZ2UuIEl0IG11c3QgYmUgYSBub24tbmVnYXRpdmUgbnVtYmVyLiBSZWNlaXZlZCAnICsgYXJnICsgJy4nKTtcbiAgICB9XG4gICAgZGVmYXVsdE1heExpc3RlbmVycyA9IGFyZztcbiAgfVxufSk7XG5cbkV2ZW50RW1pdHRlci5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgaWYgKHRoaXMuX2V2ZW50cyA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICB0aGlzLl9ldmVudHMgPT09IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKS5fZXZlbnRzKSB7XG4gICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gIH1cblxuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufTtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKG4pIHtcbiAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJyB8fCBuIDwgMCB8fCBOdW1iZXJJc05hTihuKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgb2YgXCJuXCIgaXMgb3V0IG9mIHJhbmdlLiBJdCBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIG51bWJlci4gUmVjZWl2ZWQgJyArIG4gKyAnLicpO1xuICB9XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gX2dldE1heExpc3RlbmVycyh0aGF0KSB7XG4gIGlmICh0aGF0Ll9tYXhMaXN0ZW5lcnMgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gIHJldHVybiB0aGF0Ll9tYXhMaXN0ZW5lcnM7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZ2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gZ2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gX2dldE1heExpc3RlbmVycyh0aGlzKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQodHlwZSkge1xuICB2YXIgYXJncyA9IFtdO1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgYXJncy5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gIHZhciBkb0Vycm9yID0gKHR5cGUgPT09ICdlcnJvcicpO1xuXG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gIGlmIChldmVudHMgIT09IHVuZGVmaW5lZClcbiAgICBkb0Vycm9yID0gKGRvRXJyb3IgJiYgZXZlbnRzLmVycm9yID09PSB1bmRlZmluZWQpO1xuICBlbHNlIGlmICghZG9FcnJvcilcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAoZG9FcnJvcikge1xuICAgIHZhciBlcjtcbiAgICBpZiAoYXJncy5sZW5ndGggPiAwKVxuICAgICAgZXIgPSBhcmdzWzBdO1xuICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAvLyBOb3RlOiBUaGUgY29tbWVudHMgb24gdGhlIGB0aHJvd2AgbGluZXMgYXJlIGludGVudGlvbmFsLCB0aGV5IHNob3dcbiAgICAgIC8vIHVwIGluIE5vZGUncyBvdXRwdXQgaWYgdGhpcyByZXN1bHRzIGluIGFuIHVuaGFuZGxlZCBleGNlcHRpb24uXG4gICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICB9XG4gICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuaGFuZGxlZCBlcnJvci4nICsgKGVyID8gJyAoJyArIGVyLm1lc3NhZ2UgKyAnKScgOiAnJykpO1xuICAgIGVyci5jb250ZXh0ID0gZXI7XG4gICAgdGhyb3cgZXJyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICB9XG5cbiAgdmFyIGhhbmRsZXIgPSBldmVudHNbdHlwZV07XG5cbiAgaWYgKGhhbmRsZXIgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgUmVmbGVjdEFwcGx5KGhhbmRsZXIsIHRoaXMsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBSZWZsZWN0QXBwbHkobGlzdGVuZXJzW2ldLCB0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuZnVuY3Rpb24gX2FkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIHByZXBlbmQpIHtcbiAgdmFyIG07XG4gIHZhciBldmVudHM7XG4gIHZhciBleGlzdGluZztcblxuICBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKTtcblxuICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHRhcmdldC5fZXZlbnRzQ291bnQgPSAwO1xuICB9IGVsc2Uge1xuICAgIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gICAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICAgIGlmIChldmVudHMubmV3TGlzdGVuZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGFyZ2V0LmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyID8gbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgICAgIC8vIFJlLWFzc2lnbiBgZXZlbnRzYCBiZWNhdXNlIGEgbmV3TGlzdGVuZXIgaGFuZGxlciBjb3VsZCBoYXZlIGNhdXNlZCB0aGVcbiAgICAgIC8vIHRoaXMuX2V2ZW50cyB0byBiZSBhc3NpZ25lZCB0byBhIG5ldyBvYmplY3RcbiAgICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuICAgIH1cbiAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXTtcbiAgfVxuXG4gIGlmIChleGlzdGluZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgICArK3RhcmdldC5fZXZlbnRzQ291bnQ7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBleGlzdGluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9XG4gICAgICAgIHByZXBlbmQgPyBbbGlzdGVuZXIsIGV4aXN0aW5nXSA6IFtleGlzdGluZywgbGlzdGVuZXJdO1xuICAgICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIH0gZWxzZSBpZiAocHJlcGVuZCkge1xuICAgICAgZXhpc3RpbmcudW5zaGlmdChsaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4aXN0aW5nLnB1c2gobGlzdGVuZXIpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gICAgbSA9IF9nZXRNYXhMaXN0ZW5lcnModGFyZ2V0KTtcbiAgICBpZiAobSA+IDAgJiYgZXhpc3RpbmcubGVuZ3RoID4gbSAmJiAhZXhpc3Rpbmcud2FybmVkKSB7XG4gICAgICBleGlzdGluZy53YXJuZWQgPSB0cnVlO1xuICAgICAgLy8gTm8gZXJyb3IgY29kZSBmb3IgdGhpcyBzaW5jZSBpdCBpcyBhIFdhcm5pbmdcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1yZXN0cmljdGVkLXN5bnRheFxuICAgICAgdmFyIHcgPSBuZXcgRXJyb3IoJ1Bvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgbGVhayBkZXRlY3RlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLmxlbmd0aCArICcgJyArIFN0cmluZyh0eXBlKSArICcgbGlzdGVuZXJzICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnYWRkZWQuIFVzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5jcmVhc2UgbGltaXQnKTtcbiAgICAgIHcubmFtZSA9ICdNYXhMaXN0ZW5lcnNFeGNlZWRlZFdhcm5pbmcnO1xuICAgICAgdy5lbWl0dGVyID0gdGFyZ2V0O1xuICAgICAgdy50eXBlID0gdHlwZTtcbiAgICAgIHcuY291bnQgPSBleGlzdGluZy5sZW5ndGg7XG4gICAgICBQcm9jZXNzRW1pdFdhcm5pbmcodyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgdHlwZSwgbGlzdGVuZXIsIGZhbHNlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCB0cnVlKTtcbiAgICB9O1xuXG5mdW5jdGlvbiBvbmNlV3JhcHBlcigpIHtcbiAgaWYgKCF0aGlzLmZpcmVkKSB7XG4gICAgdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy50eXBlLCB0aGlzLndyYXBGbik7XG4gICAgdGhpcy5maXJlZCA9IHRydWU7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0KTtcbiAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5hcHBseSh0aGlzLnRhcmdldCwgYXJndW1lbnRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfb25jZVdyYXAodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgc3RhdGUgPSB7IGZpcmVkOiBmYWxzZSwgd3JhcEZuOiB1bmRlZmluZWQsIHRhcmdldDogdGFyZ2V0LCB0eXBlOiB0eXBlLCBsaXN0ZW5lcjogbGlzdGVuZXIgfTtcbiAgdmFyIHdyYXBwZWQgPSBvbmNlV3JhcHBlci5iaW5kKHN0YXRlKTtcbiAgd3JhcHBlZC5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICBzdGF0ZS53cmFwRm4gPSB3cmFwcGVkO1xuICByZXR1cm4gd3JhcHBlZDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZSh0eXBlLCBsaXN0ZW5lcikge1xuICBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKTtcbiAgdGhpcy5vbih0eXBlLCBfb25jZVdyYXAodGhpcywgdHlwZSwgbGlzdGVuZXIpKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRPbmNlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRPbmNlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIGNoZWNrTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgdGhpcy5wcmVwZW5kTGlzdGVuZXIodHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4vLyBFbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWYgYW5kIG9ubHkgaWYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBsaXN0LCBldmVudHMsIHBvc2l0aW9uLCBpLCBvcmlnaW5hbExpc3RlbmVyO1xuXG4gICAgICBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKTtcblxuICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICAgICAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgbGlzdCA9IGV2ZW50c1t0eXBlXTtcbiAgICAgIGlmIChsaXN0ID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHwgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApXG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3QubGlzdGVuZXIgfHwgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBsaXN0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHBvc2l0aW9uID0gLTE7XG5cbiAgICAgICAgZm9yIChpID0gbGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fCBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICAgICAgb3JpZ2luYWxMaXN0ZW5lciA9IGxpc3RbaV0ubGlzdGVuZXI7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICAgIGlmIChwb3NpdGlvbiA9PT0gMClcbiAgICAgICAgICBsaXN0LnNoaWZ0KCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHNwbGljZU9uZShsaXN0LCBwb3NpdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpXG4gICAgICAgICAgZXZlbnRzW3R5cGVdID0gbGlzdFswXTtcblxuICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIG9yaWdpbmFsTGlzdGVuZXIgfHwgbGlzdGVuZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbiAgICBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnModHlwZSkge1xuICAgICAgdmFyIGxpc3RlbmVycywgZXZlbnRzLCBpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoZXZlbnRzID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudHNbdHlwZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZXZlbnRzKTtcbiAgICAgICAgdmFyIGtleTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGxpc3RlbmVycyA9IGV2ZW50c1t0eXBlXTtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICAgICAgfSBlbHNlIGlmIChsaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBMSUZPIG9yZGVyXG4gICAgICAgIGZvciAoaSA9IGxpc3RlbmVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5mdW5jdGlvbiBfbGlzdGVuZXJzKHRhcmdldCwgdHlwZSwgdW53cmFwKSB7XG4gIHZhciBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcblxuICBpZiAoZXZlbnRzID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIFtdO1xuXG4gIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuICBpZiAoZXZsaXN0ZW5lciA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBbXTtcblxuICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpXG4gICAgcmV0dXJuIHVud3JhcCA/IFtldmxpc3RlbmVyLmxpc3RlbmVyIHx8IGV2bGlzdGVuZXJdIDogW2V2bGlzdGVuZXJdO1xuXG4gIHJldHVybiB1bndyYXAgP1xuICAgIHVud3JhcExpc3RlbmVycyhldmxpc3RlbmVyKSA6IGFycmF5Q2xvbmUoZXZsaXN0ZW5lciwgZXZsaXN0ZW5lci5sZW5ndGgpO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyh0eXBlKSB7XG4gIHJldHVybiBfbGlzdGVuZXJzKHRoaXMsIHR5cGUsIHRydWUpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yYXdMaXN0ZW5lcnMgPSBmdW5jdGlvbiByYXdMaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLmxpc3RlbmVyQ291bnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBsaXN0ZW5lckNvdW50LmNhbGwoZW1pdHRlciwgdHlwZSk7XG4gIH1cbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGxpc3RlbmVyQ291bnQ7XG5mdW5jdGlvbiBsaXN0ZW5lckNvdW50KHR5cGUpIHtcbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcblxuICBpZiAoZXZlbnRzICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcblxuICAgIGlmICh0eXBlb2YgZXZsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIGlmIChldmxpc3RlbmVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gMDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5ldmVudE5hbWVzID0gZnVuY3Rpb24gZXZlbnROYW1lcygpIHtcbiAgcmV0dXJuIHRoaXMuX2V2ZW50c0NvdW50ID4gMCA/IFJlZmxlY3RPd25LZXlzKHRoaXMuX2V2ZW50cykgOiBbXTtcbn07XG5cbmZ1bmN0aW9uIGFycmF5Q2xvbmUoYXJyLCBuKSB7XG4gIHZhciBjb3B5ID0gbmV3IEFycmF5KG4pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSlcbiAgICBjb3B5W2ldID0gYXJyW2ldO1xuICByZXR1cm4gY29weTtcbn1cblxuZnVuY3Rpb24gc3BsaWNlT25lKGxpc3QsIGluZGV4KSB7XG4gIGZvciAoOyBpbmRleCArIDEgPCBsaXN0Lmxlbmd0aDsgaW5kZXgrKylcbiAgICBsaXN0W2luZGV4XSA9IGxpc3RbaW5kZXggKyAxXTtcbiAgbGlzdC5wb3AoKTtcbn1cblxuZnVuY3Rpb24gdW53cmFwTGlzdGVuZXJzKGFycikge1xuICB2YXIgcmV0ID0gbmV3IEFycmF5KGFyci5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJldC5sZW5ndGg7ICsraSkge1xuICAgIHJldFtpXSA9IGFycltpXS5saXN0ZW5lciB8fCBhcnJbaV07XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gb25jZShlbWl0dGVyLCBuYW1lKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgZnVuY3Rpb24gZXJyb3JMaXN0ZW5lcihlcnIpIHtcbiAgICAgIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIobmFtZSwgcmVzb2x2ZXIpO1xuICAgICAgcmVqZWN0KGVycik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzb2x2ZXIoKSB7XG4gICAgICBpZiAodHlwZW9mIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZW1pdHRlci5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBlcnJvckxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICAgIHJlc29sdmUoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICB9O1xuXG4gICAgZXZlbnRUYXJnZXRBZ25vc3RpY0FkZExpc3RlbmVyKGVtaXR0ZXIsIG5hbWUsIHJlc29sdmVyLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgaWYgKG5hbWUgIT09ICdlcnJvcicpIHtcbiAgICAgIGFkZEVycm9ySGFuZGxlcklmRXZlbnRFbWl0dGVyKGVtaXR0ZXIsIGVycm9yTGlzdGVuZXIsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhZGRFcnJvckhhbmRsZXJJZkV2ZW50RW1pdHRlcihlbWl0dGVyLCBoYW5kbGVyLCBmbGFncykge1xuICBpZiAodHlwZW9mIGVtaXR0ZXIub24gPT09ICdmdW5jdGlvbicpIHtcbiAgICBldmVudFRhcmdldEFnbm9zdGljQWRkTGlzdGVuZXIoZW1pdHRlciwgJ2Vycm9yJywgaGFuZGxlciwgZmxhZ3MpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGV2ZW50VGFyZ2V0QWdub3N0aWNBZGRMaXN0ZW5lcihlbWl0dGVyLCBuYW1lLCBsaXN0ZW5lciwgZmxhZ3MpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaWYgKGZsYWdzLm9uY2UpIHtcbiAgICAgIGVtaXR0ZXIub25jZShuYW1lLCBsaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVtaXR0ZXIub24obmFtZSwgbGlzdGVuZXIpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgZW1pdHRlci5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gRXZlbnRUYXJnZXQgZG9lcyBub3QgaGF2ZSBgZXJyb3JgIGV2ZW50IHNlbWFudGljcyBsaWtlIE5vZGVcbiAgICAvLyBFdmVudEVtaXR0ZXJzLCB3ZSBkbyBub3QgbGlzdGVuIGZvciBgZXJyb3JgIGV2ZW50cyBoZXJlLlxuICAgIGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBmdW5jdGlvbiB3cmFwTGlzdGVuZXIoYXJnKSB7XG4gICAgICAvLyBJRSBkb2VzIG5vdCBoYXZlIGJ1aWx0aW4gYHsgb25jZTogdHJ1ZSB9YCBzdXBwb3J0IHNvIHdlXG4gICAgICAvLyBoYXZlIHRvIGRvIGl0IG1hbnVhbGx5LlxuICAgICAgaWYgKGZsYWdzLm9uY2UpIHtcbiAgICAgICAgZW1pdHRlci5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIHdyYXBMaXN0ZW5lcik7XG4gICAgICB9XG4gICAgICBsaXN0ZW5lcihhcmcpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBcImVtaXR0ZXJcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgRXZlbnRFbWl0dGVyLiBSZWNlaXZlZCB0eXBlICcgKyB0eXBlb2YgZW1pdHRlcik7XG4gIH1cbn1cbiIsICIvKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyoqXG4gKiBUSElTIEZJTEUgSVMgR0VORVJBVEVEIEFVVE9NQVRJQ0FMTFkuXG4gKiBETyBOT1QgRURJVC5cbiAqKi9cblxuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJ1xuaW1wb3J0IHVpZCBmcm9tICdxdWFzYXIvc3JjL3V0aWxzL3VpZC91aWQuanMnXG5cbmNvbnN0XG4gIHR5cGVTaXplcyA9IHtcbiAgICAndW5kZWZpbmVkJzogKCkgPT4gMCxcbiAgICAnYm9vbGVhbic6ICgpID0+IDQsXG4gICAgJ251bWJlcic6ICgpID0+IDgsXG4gICAgJ3N0cmluZyc6IGl0ZW0gPT4gMiAqIGl0ZW0ubGVuZ3RoLFxuICAgICdvYmplY3QnOiBpdGVtID0+ICFpdGVtID8gMCA6IE9iamVjdFxuICAgICAgLmtleXMoaXRlbSlcbiAgICAgIC5yZWR1Y2UoKHRvdGFsLCBrZXkpID0+IHNpemVPZihrZXkpICsgc2l6ZU9mKGl0ZW1ba2V5XSkgKyB0b3RhbCwgMClcbiAgfSxcbiAgc2l6ZU9mID0gdmFsdWUgPT4gdHlwZVNpemVzW3R5cGVvZiB2YWx1ZV0odmFsdWUpXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJyaWRnZSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yICh3YWxsKSB7XG4gICAgc3VwZXIoKVxuXG4gICAgdGhpcy5zZXRNYXhMaXN0ZW5lcnMoSW5maW5pdHkpXG4gICAgdGhpcy53YWxsID0gd2FsbFxuXG4gICAgd2FsbC5saXN0ZW4obWVzc2FnZXMgPT4ge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkobWVzc2FnZXMpKSB7XG4gICAgICAgIG1lc3NhZ2VzLmZvckVhY2gobWVzc2FnZSA9PiB0aGlzLl9lbWl0KG1lc3NhZ2UpKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX2VtaXQobWVzc2FnZXMpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuX3NlbmRpbmdRdWV1ZSA9IFtdXG4gICAgdGhpcy5fc2VuZGluZyA9IGZhbHNlXG4gICAgdGhpcy5fbWF4TWVzc2FnZVNpemUgPSAzMiAqIDEwMjQgKiAxMDI0IC8vIDMybWJcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIGFuIGV2ZW50LlxuICAgKlxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICogQHBhcmFtIHBheWxvYWRcbiAgICogQHJldHVybnMgUHJvbWlzZTw+XG4gICAqL1xuICBzZW5kIChldmVudCwgcGF5bG9hZCkge1xuICAgIHJldHVybiB0aGlzLl9zZW5kKFt7IGV2ZW50LCBwYXlsb2FkIH1dKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhbGwgcmVnaXN0ZXJlZCBldmVudHNcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBnZXRFdmVudHMgKCkge1xuICAgIHJldHVybiB0aGlzLl9ldmVudHNcbiAgfVxuXG4gIG9uKGV2ZW50TmFtZSwgbGlzdGVuZXIpIHtcbiAgICByZXR1cm4gc3VwZXIub24oZXZlbnROYW1lLCAob3JpZ2luYWxQYXlsb2FkKSA9PiB7XG4gICAgICBsaXN0ZW5lcih7XG4gICAgICAgIC4uLm9yaWdpbmFsUGF5bG9hZCxcbiAgICAgICAgLy8gQ29udmVuaWVudCBhbHRlcm5hdGl2ZSB0byB0aGUgbWFudWFsIHVzYWdlIG9mIGBldmVudFJlc3BvbnNlS2V5YFxuICAgICAgICAvLyBXZSBjYW4ndCBzZW5kIHRoaXMgaW4gYF9uZXh0U2VuZGAgd2hpY2ggd2lsbCB0aGVuIGJlIHNlbnQgdXNpbmcgYHBvcnQucG9zdE1lc3NhZ2UoKWAsIHdoaWNoIGNhbid0IHNlcmlhbGl6ZSBmdW5jdGlvbnMuXG4gICAgICAgIC8vIFNvLCB3ZSBob29rIGludG8gdGhlIHVuZGVybHlpbmcgbGlzdGVuZXIgYW5kIGluY2x1ZGUgdGhlIGZ1bmN0aW9uIHRoZXJlLCB3aGljaCBoYXBwZW5zIGFmdGVyIHRoZSBzZW5kIG9wZXJhdGlvbi5cbiAgICAgICAgcmVzcG9uZDogKHBheWxvYWQgLyogb3B0aW9uYWwgKi8pID0+IHRoaXMuc2VuZChvcmlnaW5hbFBheWxvYWQuZXZlbnRSZXNwb25zZUtleSwgcGF5bG9hZClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIF9lbWl0IChtZXNzYWdlKSB7XG4gICAgaWYgKHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5lbWl0KG1lc3NhZ2UpXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5lbWl0KG1lc3NhZ2UuZXZlbnQsIG1lc3NhZ2UucGF5bG9hZClcbiAgICB9XG4gIH1cblxuICBfc2VuZCAobWVzc2FnZXMpIHtcbiAgICB0aGlzLl9zZW5kaW5nUXVldWUucHVzaChtZXNzYWdlcylcbiAgICByZXR1cm4gdGhpcy5fbmV4dFNlbmQoKVxuICB9XG5cbiAgX25leHRTZW5kICgpIHtcbiAgICBpZiAoIXRoaXMuX3NlbmRpbmdRdWV1ZS5sZW5ndGggfHwgdGhpcy5fc2VuZGluZykgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgdGhpcy5fc2VuZGluZyA9IHRydWVcblxuICAgIGNvbnN0XG4gICAgICBtZXNzYWdlcyA9IHRoaXMuX3NlbmRpbmdRdWV1ZS5zaGlmdCgpLFxuICAgICAgY3VycmVudE1lc3NhZ2UgPSBtZXNzYWdlc1swXSxcbiAgICAgIGV2ZW50TGlzdGVuZXJLZXkgPSBgJHtjdXJyZW50TWVzc2FnZS5ldmVudH0uJHt1aWQoKX1gLFxuICAgICAgZXZlbnRSZXNwb25zZUtleSA9IGV2ZW50TGlzdGVuZXJLZXkgKyAnLnJlc3VsdCdcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgYWxsQ2h1bmtzID0gW11cblxuICAgICAgY29uc3QgZm4gPSAocikgPT4ge1xuICAgICAgICAvLyBJZiB0aGlzIGlzIGEgc3BsaXQgbWVzc2FnZSB0aGVuIGtlZXAgbGlzdGVuaW5nIGZvciB0aGUgY2h1bmtzIGFuZCBidWlsZCBhIGxpc3QgdG8gcmVzb2x2ZVxuICAgICAgICBpZiAociAhPT0gdm9pZCAwICYmIHIuX2NodW5rU3BsaXQpIHtcbiAgICAgICAgICBjb25zdCBjaHVua0RhdGEgPSByLl9jaHVua1NwbGl0XG4gICAgICAgICAgYWxsQ2h1bmtzID0gWy4uLmFsbENodW5rcywgLi4uci5kYXRhXVxuXG4gICAgICAgICAgLy8gTGFzdCBjaHVuayByZWNlaXZlZCBzbyByZXNvbHZlIHRoZSBwcm9taXNlLlxuICAgICAgICAgIGlmIChjaHVua0RhdGEubGFzdENodW5rKSB7XG4gICAgICAgICAgICB0aGlzLm9mZihldmVudFJlc3BvbnNlS2V5LCBmbilcbiAgICAgICAgICAgIHJlc29sdmUoYWxsQ2h1bmtzKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aGlzLm9mZihldmVudFJlc3BvbnNlS2V5LCBmbilcbiAgICAgICAgICByZXNvbHZlKHIpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5vbihldmVudFJlc3BvbnNlS2V5LCBmbilcblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQWRkIGFuIGV2ZW50IHJlc3BvbnNlIGtleSB0byB0aGUgcGF5bG9hZCB3ZSdyZSBzZW5kaW5nIHNvIHRoZSBtZXNzYWdlIGtub3dzIHdoaWNoIGNoYW5uZWwgdG8gcmVzcG9uZCBvbi5cbiAgICAgICAgY29uc3QgbWVzc2FnZXNUb1NlbmQgPSBtZXNzYWdlcy5tYXAobSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLm0sXG4gICAgICAgICAgICAuLi57XG4gICAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgICBkYXRhOiBtLnBheWxvYWQsXG4gICAgICAgICAgICAgICAgZXZlbnRSZXNwb25zZUtleVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMud2FsbC5zZW5kKG1lc3NhZ2VzVG9TZW5kKVxuICAgICAgfVxuICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSAnTWVzc2FnZSBsZW5ndGggZXhjZWVkZWQgbWF4aW11bSBhbGxvd2VkIGxlbmd0aC4nXG5cbiAgICAgICAgaWYgKGVyci5tZXNzYWdlID09PSBlcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgcGF5bG9hZCBpcyBhbiBhcnJheSBhbmQgdG9vIGJpZyB0aGVuIHNwbGl0IGl0IGludG8gY2h1bmtzIGFuZCBzZW5kIHRvIHRoZSBjbGllbnRzIGJyaWRnZVxuICAgICAgICAgIC8vIHRoZSBjbGllbnQgYnJpZGdlIHdpbGwgdGhlbiByZXNvbHZlIHRoZSBwcm9taXNlLlxuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShjdXJyZW50TWVzc2FnZS5wYXlsb2FkKSkge1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvck1lc3NhZ2UgKyAnIE5vdGU6IFRoZSBicmlkZ2UgY2FuIGRlYWwgd2l0aCB0aGlzIGlzIGlmIHRoZSBwYXlsb2FkIGlzIGFuIEFycmF5LicpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgb2JqZWN0U2l6ZSA9IHNpemVPZihjdXJyZW50TWVzc2FnZSlcblxuICAgICAgICAgICAgaWYgKG9iamVjdFNpemUgPiB0aGlzLl9tYXhNZXNzYWdlU2l6ZSkge1xuICAgICAgICAgICAgICBjb25zdFxuICAgICAgICAgICAgICAgIGNodW5rc1JlcXVpcmVkID0gTWF0aC5jZWlsKG9iamVjdFNpemUgLyB0aGlzLl9tYXhNZXNzYWdlU2l6ZSksXG4gICAgICAgICAgICAgICAgYXJyYXlJdGVtQ291bnQgPSBNYXRoLmNlaWwoY3VycmVudE1lc3NhZ2UucGF5bG9hZC5sZW5ndGggLyBjaHVua3NSZXF1aXJlZClcblxuICAgICAgICAgICAgICBsZXQgZGF0YSA9IGN1cnJlbnRNZXNzYWdlLnBheWxvYWRcbiAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaHVua3NSZXF1aXJlZDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IHRha2UgPSBNYXRoLm1pbihkYXRhLmxlbmd0aCwgYXJyYXlJdGVtQ291bnQpXG5cbiAgICAgICAgICAgICAgICB0aGlzLndhbGwuc2VuZChbe1xuICAgICAgICAgICAgICAgICAgZXZlbnQ6IGN1cnJlbnRNZXNzYWdlLmV2ZW50LFxuICAgICAgICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICAgICAgICBfY2h1bmtTcGxpdDoge1xuICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiBjaHVua3NSZXF1aXJlZCxcbiAgICAgICAgICAgICAgICAgICAgICBsYXN0Q2h1bms6IGkgPT09IGNodW5rc1JlcXVpcmVkIC0gMVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLnNwbGljZSgwLCB0YWtlKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1dKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3NlbmRpbmcgPSBmYWxzZVxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7IHJldHVybiB0aGlzLl9uZXh0U2VuZCgpIH0sIDE2KVxuICAgIH0pXG4gIH1cbn1cbiIsICIvKipcbiAqIEJhc2VkIG9uIHRoZSB3b3JrIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9qY2hvb2svdXVpZC1yYW5kb21cbiAqL1xuXG5sZXRcbiAgYnVmLFxuICBidWZJZHggPSAwXG5jb25zdCBoZXhCeXRlcyA9IG5ldyBBcnJheSgyNTYpXG5cbi8vIFByZS1jYWxjdWxhdGUgdG9TdHJpbmcoMTYpIGZvciBzcGVlZFxuZm9yIChsZXQgaSA9IDA7IGkgPCAyNTY7IGkrKykge1xuICBoZXhCeXRlc1sgaSBdID0gKGkgKyAweDEwMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKVxufVxuXG4vLyBVc2UgYmVzdCBhdmFpbGFibGUgUFJOR1xuY29uc3QgcmFuZG9tQnl0ZXMgPSAoKCkgPT4ge1xuICAvLyBOb2RlICYgQnJvd3NlciBzdXBwb3J0XG4gIGNvbnN0IGxpYiA9IHR5cGVvZiBjcnlwdG8gIT09ICd1bmRlZmluZWQnXG4gICAgPyBjcnlwdG9cbiAgICA6IChcbiAgICAgICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICA/IHdpbmRvdy5jcnlwdG8gfHwgd2luZG93Lm1zQ3J5cHRvXG4gICAgICAgICAgOiB2b2lkIDBcbiAgICAgIClcblxuICBpZiAobGliICE9PSB2b2lkIDApIHtcbiAgICBpZiAobGliLnJhbmRvbUJ5dGVzICE9PSB2b2lkIDApIHtcbiAgICAgIHJldHVybiBsaWIucmFuZG9tQnl0ZXNcbiAgICB9XG4gICAgaWYgKGxpYi5nZXRSYW5kb21WYWx1ZXMgIT09IHZvaWQgMCkge1xuICAgICAgcmV0dXJuIG4gPT4ge1xuICAgICAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KG4pXG4gICAgICAgIGxpYi5nZXRSYW5kb21WYWx1ZXMoYnl0ZXMpXG4gICAgICAgIHJldHVybiBieXRlc1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuID0+IHtcbiAgICBjb25zdCByID0gW11cbiAgICBmb3IgKGxldCBpID0gbjsgaSA+IDA7IGktLSkge1xuICAgICAgci5wdXNoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1NikpXG4gICAgfVxuICAgIHJldHVybiByXG4gIH1cbn0pKClcblxuLy8gQnVmZmVyIHJhbmRvbSBudW1iZXJzIGZvciBzcGVlZFxuLy8gUmVkdWNlIG1lbW9yeSB1c2FnZSBieSBkZWNyZWFzaW5nIHRoaXMgbnVtYmVyIChtaW4gMTYpXG4vLyBvciBpbXByb3ZlIHNwZWVkIGJ5IGluY3JlYXNpbmcgdGhpcyBudW1iZXIgKHRyeSAxNjM4NClcbmNvbnN0IEJVRkZFUl9TSVpFID0gNDA5NlxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7XG4gIC8vIEJ1ZmZlciBzb21lIHJhbmRvbSBieXRlcyBmb3Igc3BlZWRcbiAgaWYgKGJ1ZiA9PT0gdm9pZCAwIHx8IChidWZJZHggKyAxNiA+IEJVRkZFUl9TSVpFKSkge1xuICAgIGJ1ZklkeCA9IDBcbiAgICBidWYgPSByYW5kb21CeXRlcyhCVUZGRVJfU0laRSlcbiAgfVxuXG4gIGNvbnN0IGIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChidWYsIGJ1ZklkeCwgKGJ1ZklkeCArPSAxNikpXG4gIGJbIDYgXSA9IChiWyA2IF0gJiAweDBmKSB8IDB4NDBcbiAgYlsgOCBdID0gKGJbIDggXSAmIDB4M2YpIHwgMHg4MFxuXG4gIHJldHVybiBoZXhCeXRlc1sgYlsgMCBdIF0gKyBoZXhCeXRlc1sgYlsgMSBdIF1cbiAgICArIGhleEJ5dGVzWyBiWyAyIF0gXSArIGhleEJ5dGVzWyBiWyAzIF0gXSArICctJ1xuICAgICsgaGV4Qnl0ZXNbIGJbIDQgXSBdICsgaGV4Qnl0ZXNbIGJbIDUgXSBdICsgJy0nXG4gICAgKyBoZXhCeXRlc1sgYlsgNiBdIF0gKyBoZXhCeXRlc1sgYlsgNyBdIF0gKyAnLSdcbiAgICArIGhleEJ5dGVzWyBiWyA4IF0gXSArIGhleEJ5dGVzWyBiWyA5IF0gXSArICctJ1xuICAgICsgaGV4Qnl0ZXNbIGJbIDEwIF0gXSArIGhleEJ5dGVzWyBiWyAxMSBdIF1cbiAgICArIGhleEJ5dGVzWyBiWyAxMiBdIF0gKyBoZXhCeXRlc1sgYlsgMTMgXSBdXG4gICAgKyBoZXhCeXRlc1sgYlsgMTQgXSBdICsgaGV4Qnl0ZXNbIGJbIDE1IF0gXVxufVxuIiwgIi8qIGVzbGludC1kaXNhYmxlICovXG4vKipcbiAqIFRISVMgRklMRSBJUyBHRU5FUkFURUQgQVVUT01BVElDQUxMWS5cbiAqIERPIE5PVCBFRElULlxuICoqL1xuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBhZGQgYSBnZW5lcmljIHdpbmRvd3MgZXZlbnQgbGlzdGVuZXIgdG8gdGhlIHBhZ2VcbiAqIHdoaWNoIGFjdHMgYXMgYSBicmlkZ2UgYmV0d2VlbiB0aGUgd2ViIHBhZ2UgYW5kIHRoZSBjb250ZW50IHNjcmlwdCBicmlkZ2UuXG4gKiBAcGFyYW0gYnJpZGdlXG4gKiBAcGFyYW0gdHlwZVxuICovXG5leHBvcnQgY29uc3QgbGlzdGVuRm9yV2luZG93RXZlbnRzID0gKGJyaWRnZSwgdHlwZSkgPT4ge1xuICAvLyBMaXN0ZW4gZm9yIGFueSBldmVudHMgZnJvbSB0aGUgd2ViIHBhZ2UgYW5kIHRyYW5zbWl0IHRvIHRoZSBCRVggYnJpZGdlLlxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHBheWxvYWQgPT4ge1xuICAgIC8vIFdlIG9ubHkgYWNjZXB0IG1lc3NhZ2VzIGZyb20gdGhpcyB3aW5kb3cgdG8gaXRzZWxmIFtpLmUuIG5vdCBmcm9tIGFueSBpZnJhbWVzXVxuICAgIGlmIChwYXlsb2FkLnNvdXJjZSAhPT0gd2luZG93KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAocGF5bG9hZC5kYXRhLmZyb20gIT09IHZvaWQgMCAmJiBwYXlsb2FkLmRhdGEuZnJvbSA9PT0gdHlwZSkge1xuICAgICAgY29uc3RcbiAgICAgICAgZXZlbnREYXRhID0gcGF5bG9hZC5kYXRhWzBdLFxuICAgICAgICBicmlkZ2VFdmVudHMgPSBicmlkZ2UuZ2V0RXZlbnRzKClcblxuICAgICAgZm9yIChsZXQgZXZlbnQgaW4gYnJpZGdlRXZlbnRzKSB7XG4gICAgICAgIGlmIChldmVudCA9PT0gZXZlbnREYXRhLmV2ZW50KSB7XG4gICAgICAgICAgYnJpZGdlRXZlbnRzW2V2ZW50XShldmVudERhdGEucGF5bG9hZClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwgZmFsc2UpXG59XG4iLCAiLy8gU2ltcGxlIGxvZ2dlciBmb3IgYnJvd3NlciBleHRlbnNpb24gY29udGV4dCBzY3JpcHRzXG5jbGFzcyBFeHRlbnNpb25Mb2dnZXIge1xuICBjb25zdHJ1Y3RvcihwcmVmaXggPSAnJykge1xuICAgIHRoaXMucHJlZml4ID0gcHJlZml4O1xuICAgIHRoaXMuZGVidWdFbmFibGVkID0gdHJ1ZTsgLy8gU2V0IHRvIHRydWUgZm9yIGRlYnVnZ2luZ1xuICB9XG5cbiAgYXN5bmMgY2hlY2tEZWJ1Z1NldHRpbmcoKSB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIENoZWNrIGlmIGRlYnVnIG1vZGUgaXMgZW5hYmxlZCBpbiBzdG9yYWdlXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoWydkZWJ1Z01vZGUnXSk7XG4gICAgICAvLyBGb3IgYmFja2dyb3VuZCBzY3JpcHRzLCBhbHdheXMgZW5hYmxlIGxvZ2dpbmcgcmVnYXJkbGVzcyBvZiBzdG9yYWdlIHNldHRpbmdcbiAgICAgIHRoaXMuZGVidWdFbmFibGVkID0gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gSWYgc3RvcmFnZSBpcyBub3QgYXZhaWxhYmxlLCBrZWVwIGN1cnJlbnQgc2V0dGluZ1xuICAgIH1cbiAgfVxuXG4gIGxvZyguLi5hcmdzKSB7XG4gICAgaWYgKHRoaXMuZGVidWdFbmFibGVkKSB7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLnByZWZpeCwgLi4uYXJncyk7XG4gICAgfVxuICB9XG5cbiAgaW5mbyguLi5hcmdzKSB7XG4gICAgaWYgKHRoaXMuZGVidWdFbmFibGVkKSB7XG4gICAgICBjb25zb2xlLmluZm8odGhpcy5wcmVmaXgsIC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHdhcm4oLi4uYXJncykge1xuICAgIC8vIEFsd2F5cyBzaG93IHdhcm5pbmdzXG4gICAgY29uc29sZS53YXJuKHRoaXMucHJlZml4LCAuLi5hcmdzKTtcbiAgfVxuXG4gIGVycm9yKC4uLmFyZ3MpIHtcbiAgICAvLyBBbHdheXMgc2hvdyBlcnJvcnNcbiAgICBjb25zb2xlLmVycm9yKHRoaXMucHJlZml4LCAuLi5hcmdzKTtcbiAgfVxuXG4gIGRlYnVnKC4uLmFyZ3MpIHtcbiAgICBpZiAodGhpcy5kZWJ1Z0VuYWJsZWQpIHtcbiAgICAgIGNvbnNvbGUuZGVidWcodGhpcy5wcmVmaXgsIC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBDcmVhdGUgbG9nZ2VyIGluc3RhbmNlcyBmb3IgZGlmZmVyZW50IGNvbnRleHRzXG5leHBvcnQgY29uc3QgZG9tTG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW0RPTSBTY3JpcHRdJyk7XG5leHBvcnQgY29uc3QgYmdMb2dnZXIgPSBuZXcgRXh0ZW5zaW9uTG9nZ2VyKCdbQkddJyk7XG5leHBvcnQgY29uc3Qgc3RhdHNMb2dnZXIgPSBuZXcgRXh0ZW5zaW9uTG9nZ2VyKCdbU3RhdHNdJyk7XG5leHBvcnQgY29uc3QgbXNnTG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW01lc3NhZ2VdJyk7XG5leHBvcnQgY29uc3QgcG9zdFNlcnZpY2VMb2dnZXIgPSBuZXcgRXh0ZW5zaW9uTG9nZ2VyKCdbUG9zdERhdGFTZXJ2aWNlXScpO1xuZXhwb3J0IGNvbnN0IHN0YXRlTG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW0F1dG9GbG93U3RhdGVNYW5hZ2VyXScpO1xuZXhwb3J0IGNvbnN0IGNvbnRlbnRMb2dnZXIgPSBuZXcgRXh0ZW5zaW9uTG9nZ2VyKCdbQ29udGVudCBTY3JpcHRdJyk7XG5leHBvcnQgY29uc3Qgc3VibWl0TG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW1N1Ym1pdCBTY3JpcHRdJyk7XG5cbi8vIEluaXRpYWxpemUgZGVidWcgc2V0dGluZyBmb3IgYWxsIGxvZ2dlcnNcbmNvbnN0IGluaXREZWJ1Z01vZGUgPSBhc3luYyAoKSA9PiB7XG4gIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICBkb21Mb2dnZXIuY2hlY2tEZWJ1Z1NldHRpbmcoKSxcbiAgICBiZ0xvZ2dlci5jaGVja0RlYnVnU2V0dGluZygpLFxuICAgIHN0YXRzTG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKCksXG4gICAgbXNnTG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKCksXG4gICAgcG9zdFNlcnZpY2VMb2dnZXIuY2hlY2tEZWJ1Z1NldHRpbmcoKSxcbiAgICBzdGF0ZUxvZ2dlci5jaGVja0RlYnVnU2V0dGluZygpLFxuICAgIGNvbnRlbnRMb2dnZXIuY2hlY2tEZWJ1Z1NldHRpbmcoKSxcbiAgICBzdWJtaXRMb2dnZXIuY2hlY2tEZWJ1Z1NldHRpbmcoKVxuICBdKTtcbn07XG5cbi8vIEF1dG8taW5pdGlhbGl6ZVxuaW5pdERlYnVnTW9kZSgpO1xuIiwgImltcG9ydCB7IHN1Ym1pdExvZ2dlciB9IGZyb20gXCIuL2xvZ2dlci5qc1wiOy8vIFN1Ym1pdCBDb250ZW50IFNjcmlwdCAtIEhhbmRsZXMgcG9zdCBzdWJtaXNzaW9uIGZ1bmN0aW9uYWxpdHlcbi8vIE9ubHkgcnVucyBvbiBzdWJtaXQgcGFnZXM6ICo6Ly9yZWRkaXQuY29tLyovc3VibWl0KlxuXG5mdW5jdGlvbiBpbmplY3RCZWZvcmVVbmxvYWRCbG9ja2VyKCkge1xuICB0cnkge1xuICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG4gICAgc2NyaXB0LnRleHRDb250ZW50ID0gYCgoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBvcmlnaW5hbEFkZCA9IHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgICBpZiAodHlwZSA9PT0gJ2JlZm9yZXVubG9hZCcpIHJldHVyblxuICAgICAgICAgIHJldHVybiBvcmlnaW5hbEFkZC5jYWxsKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBvcHRpb25zKVxuICAgICAgICB9XG4gICAgICAgIHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IG51bGxcbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgfSkoKTtgXG4gICAgOyhkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5ib2R5KS5hcHBlbmRDaGlsZChzY3JpcHQpXG4gICAgc2NyaXB0LnJlbW92ZSgpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgfVxufVxuXG5pbmplY3RCZWZvcmVVbmxvYWRCbG9ja2VyKClcblxuLy8gUmVtb3ZlIGJlZm9yZXVubG9hZCBsaXN0ZW5lcnMgdG8gcHJldmVudCBcIkxlYXZlIHNpdGU/XCIgZGlhbG9nXG5mdW5jdGlvbiByZW1vdmVCZWZvcmVVbmxvYWRMaXN0ZW5lcnMoKSB7XG4gIHN1Ym1pdExvZ2dlci5sb2coJ1JlbW92aW5nIFJlZGRpdFxcJ3MgYmVmb3JldW5sb2FkIGV2ZW50IGxpc3RlbmVycyB0byBwcmV2ZW50IFwiTGVhdmUgc2l0ZT9cIiBkaWFsb2cnKVxuXG4gIC8vIFJlbW92ZSB3aW5kb3cgb25iZWZvcmV1bmxvYWQgaGFuZGxlclxuICB3aW5kb3cub25iZWZvcmV1bmxvYWQgPSBudWxsXG5cbiAgLy8gSW50ZXJjZXB0IGJlZm9yZXVubG9hZCBpbiBjYXB0dXJlIHBoYXNlIGFuZCBzdG9wIGFueSBoYW5kbGVycyBmcm9tIHJ1bm5pbmcuXG4gIC8vIERvIG5vdCBjYWxsIHByZXZlbnREZWZhdWx0IC8gc2V0IHJldHVyblZhbHVlIGhlcmUsIHNpbmNlIHRoYXQgY2FuIGl0c2VsZiB0cmlnZ2VyIHRoZSBwcm9tcHQuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCAoZSkgPT4ge1xuICAgIGlmICh0eXBlb2YgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24gPT09ICdmdW5jdGlvbicpIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICBpZiAodHlwZW9mIGUuc3RvcFByb3BhZ2F0aW9uID09PSAnZnVuY3Rpb24nKSBlLnN0b3BQcm9wYWdhdGlvbigpXG4gIH0sIHRydWUpXG5cbiAgc3VibWl0TG9nZ2VyLmxvZygnQmVmb3JldW5sb2FkIGxpc3RlbmVycyBkaXNhYmxlZCBzdWNjZXNzZnVsbHknKVxufVxuXG4vLyBTaGFyZWQgdXRpbGl0eSBmdW5jdGlvbnNcbmZ1bmN0aW9uIHFzKHNlbGVjdG9yKSB7XG4gIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxufVxuXG5mdW5jdGlvbiBxc2Eoc2VsZWN0b3IpIHtcbiAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG59XG5cbmZ1bmN0aW9uIHNsZWVwKG1zKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKVxufVxuXG5mdW5jdGlvbiBkZWVwUXVlcnkoc2VsZWN0b3IsIHJvb3QgPSBkb2N1bWVudCkge1xuICByZXR1cm4gcm9vdC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxufVxuXG4vLyBTdG9yYWdlIGZ1bmN0aW9uc1xuYXN5bmMgZnVuY3Rpb24gZ2V0U3RvcmVkVXNlcm5hbWUoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoWydyZWRkaXRVc2VyJ10pXG4gICAgcmV0dXJuIHJlc3VsdC5yZWRkaXRVc2VyIHx8IG51bGxcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBzdWJtaXRMb2dnZXIud2FybignRmFpbGVkIHRvIGdldCBzdG9yZWQgdXNlcm5hbWU6JywgZXJyb3IpXG4gICAgcmV0dXJuIG51bGxcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBmZXRjaFBvc3REYXRhRm9yU3VibWlzc2lvbigpIHtcbiAgdHJ5IHtcbiAgICAvLyBUcnkgdG8gZ2V0IHBvc3QgZGF0YSBmcm9tIHNlc3Npb25TdG9yYWdlXG4gICAgY29uc3Qgc3RvcmVkRGF0YSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtcG9zdGRhdGEnKVxuICAgIGlmIChzdG9yZWREYXRhKSB7XG4gICAgICBjb25zdCBwb3N0RGF0YSA9IEpTT04ucGFyc2Uoc3RvcmVkRGF0YSlcbiAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ1VzaW5nIHN0b3JlZCBwb3N0IGRhdGEgZm9yIHN1Ym1pc3Npb246JywgcG9zdERhdGEpXG4gICAgICByZXR1cm4gcG9zdERhdGFcbiAgICB9XG5cbiAgICAvLyBJZiBubyBzdG9yZWQgZGF0YSwgdGhpcyBtZWFucyB0aGUgc2NyaXB0IGlzIHJ1bm5pbmcgd2l0aG91dCBwcm9wZXIgaW5pdGlhbGl6YXRpb25cbiAgICAvLyBUaGlzIHNob3VsZCBub3QgaGFwcGVuIGluIG5vcm1hbCBmbG93IHNpbmNlIGJhY2tncm91bmQgc2NyaXB0IHByb3ZpZGVzIHRoZSBkYXRhXG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBwb3N0IGRhdGEgZm91bmQgLSBzY3JpcHQgbWF5IGJlIHJ1bm5pbmcgaW5jb3JyZWN0bHknKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHN1Ym1pdExvZ2dlci5lcnJvcignRmFpbGVkIHRvIGZldGNoIHBvc3QgZGF0YTonLCBlcnJvcilcbiAgICB0aHJvdyBlcnJvclxuICB9XG59XG5cbi8vIE5vdGU6IFBvc3QgZ2VuZXJhdGlvbiBpcyBub3cgaGFuZGxlZCBleGNsdXNpdmVseSBieSBiYWNrZ3JvdW5kLmpzIHZpYSBBUElcblxuLy8gU3VibWl0IHBhZ2UgZnVuY3Rpb25zXG5hc3luYyBmdW5jdGlvbiBlbnN1cmVTdWJtaXRQYWdlUmVhZHkoKSB7XG4gIHN1Ym1pdExvZ2dlci5sb2coJ0Vuc3VyaW5nIHN1Ym1pdCBwYWdlIGlzIHJlYWR5Li4uJylcblxuICAvLyBXYWl0IGZvciBrZXkgZWxlbWVudHMgdG8gYmUgYXZhaWxhYmxlXG4gIGxldCBhdHRlbXB0cyA9IDBcbiAgY29uc3QgbWF4QXR0ZW1wdHMgPSAxMFxuXG4gIHdoaWxlIChhdHRlbXB0cyA8IG1heEF0dGVtcHRzKSB7XG4gICAgY29uc3Qgc3VibWl0Rm9ybSA9IHFzKCdmb3JtJykgfHwgcXMoJ1tkYXRhLXRlc3RpZCo9XCJwb3N0XCJdJykgfHwgcXMoJ3NocmVkZGl0LXBvc3QtY29tcG9zZXInKVxuICAgIGlmIChzdWJtaXRGb3JtKSB7XG4gICAgICBzdWJtaXRMb2dnZXIubG9nKCdTdWJtaXQgcGFnZSBpcyByZWFkeScpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIHN1Ym1pdExvZ2dlci5sb2coYFdhaXRpbmcgZm9yIHN1Ym1pdCBwYWdlLi4uIGF0dGVtcHQgJHthdHRlbXB0cyArIDF9LyR7bWF4QXR0ZW1wdHN9YClcbiAgICBhd2FpdCBzbGVlcCgxMDAwKVxuICAgIGF0dGVtcHRzKytcbiAgfVxuXG4gIHN1Ym1pdExvZ2dlci5sb2coJ1N1Ym1pdCBwYWdlIGZhaWxlZCB0byBsb2FkIHdpdGhpbiB0aW1lb3V0JylcbiAgcmV0dXJuIGZhbHNlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZpbGxUaXRsZShwb3N0RGF0YSkge1xuICBzdWJtaXRMb2dnZXIubG9nKCdGaWxsaW5nIHRpdGxlIGZpZWxkLi4uJylcblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gZm9yIHNoYWRvdyBET00gcXVlcmllc1xuICBmdW5jdGlvbiBkZWVwUXVlcnkoc2VsZWN0b3IsIHJvb3QgPSBkb2N1bWVudCkge1xuICAgIGNvbnN0IGVsID0gcm9vdC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuICAgIGlmIChlbCkgcmV0dXJuIGVsXG4gICAgZm9yIChjb25zdCBlbGVtIG9mIHJvb3QucXVlcnlTZWxlY3RvckFsbCgnKicpKSB7XG4gICAgICBpZiAoZWxlbS5zaGFkb3dSb290KSB7XG4gICAgICAgIGNvbnN0IGZvdW5kID0gZGVlcFF1ZXJ5KHNlbGVjdG9yLCBlbGVtLnNoYWRvd1Jvb3QpXG4gICAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGZvdW5kXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICB0cnkge1xuICAgIC8vIEZpbGwgdGl0bGUgZmllbGQgdXNpbmcgc2hhZG93IERPTSAoZnJvbSBwb3N0bS1wYWdlLmpzKVxuICAgIGNvbnN0IHRpdGxlSW5wdXRFbGVtZW50ID0gZGVlcFF1ZXJ5KCdmYWNlcGxhdGUtdGV4dGFyZWEtaW5wdXRbbmFtZT1cInRpdGxlXCJdJylcbiAgICBpZiAodGl0bGVJbnB1dEVsZW1lbnQgJiYgcG9zdERhdGEudGl0bGUpIHtcbiAgICAgIGNvbnN0IHNoYWRvd1Jvb3QgPSB0aXRsZUlucHV0RWxlbWVudC5zaGFkb3dSb290XG4gICAgICBpZiAoc2hhZG93Um9vdCkge1xuICAgICAgICBjb25zdCB0aXRsZUlucHV0ID0gc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjaW5uZXJUZXh0QXJlYScpXG4gICAgICAgIGlmICh0aXRsZUlucHV0KSB7XG4gICAgICAgICAgdGl0bGVJbnB1dC5mb2N1cygpXG4gICAgICAgICAgYXdhaXQgc2xlZXAoNTAwKVxuICAgICAgICAgIHRpdGxlSW5wdXQudmFsdWUgPSBwb3N0RGF0YS50aXRsZVxuICAgICAgICAgIHRpdGxlSW5wdXQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JywgeyBidWJibGVzOiB0cnVlLCBjYW5jZWxhYmxlOiB0cnVlIH0pKVxuICAgICAgICAgIHRpdGxlSW5wdXQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScsIHsgYnViYmxlczogdHJ1ZSwgY2FuY2VsYWJsZTogdHJ1ZSB9KSlcbiAgICAgICAgICBzdWJtaXRMb2dnZXIubG9nKCdUaXRsZSBmaWVsZCBmaWxsZWQ6JywgcG9zdERhdGEudGl0bGUpXG4gICAgICAgICAgYXdhaXQgc2xlZXAoMTUwMClcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHN1Ym1pdExvZ2dlci5sb2coJ0ZhaWxlZCB0byBmaWxsIHRpdGxlJylcbiAgICByZXR1cm4gZmFsc2VcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBzdWJtaXRMb2dnZXIuZXJyb3IoJ0Vycm9yIGZpbGxpbmcgdGl0bGU6JywgZXJyb3IpXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZmlsbFVybChwb3N0RGF0YSkge1xuICBzdWJtaXRMb2dnZXIubG9nKCdGaWxsaW5nIFVSTCBmaWVsZC4uLicpXG5cbiAgLy8gUmVtb3ZlIGJlZm9yZXVubG9hZCBsaXN0ZW5lcnMgYmVmb3JlIG1vZGlmeWluZyBmb3JtXG4gIGlmICh0eXBlb2YgcmVtb3ZlQmVmb3JlVW5sb2FkTGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmVtb3ZlQmVmb3JlVW5sb2FkTGlzdGVuZXJzKClcbiAgfVxuXG4gIC8vIEhlbHBlciBmdW5jdGlvbiBmb3Igc2hhZG93IERPTSBxdWVyaWVzXG4gIGZ1bmN0aW9uIGRlZXBRdWVyeShzZWxlY3Rvciwgcm9vdCA9IGRvY3VtZW50KSB7XG4gICAgY29uc3QgZWwgPSByb290LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgaWYgKGVsKSByZXR1cm4gZWxcbiAgICBmb3IgKGNvbnN0IGVsZW0gb2Ygcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcqJykpIHtcbiAgICAgIGlmIChlbGVtLnNoYWRvd1Jvb3QpIHtcbiAgICAgICAgY29uc3QgZm91bmQgPSBkZWVwUXVlcnkoc2VsZWN0b3IsIGVsZW0uc2hhZG93Um9vdClcbiAgICAgICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmRcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gRmlsbCBVUkwgZmllbGQgdXNpbmcgc2hhZG93IERPTSAoZnJvbSBwb3N0bS1wYWdlLmpzKVxuICAgIHN1Ym1pdExvZ2dlci5sb2coJ1VSTCBmaWxsIGF0dGVtcHQgLSBwb3N0RGF0YS51cmw6JywgcG9zdERhdGE/LnVybClcbiAgICBpZiAocG9zdERhdGEudXJsICYmIHBvc3REYXRhLnVybC50cmltKCkpIHtcbiAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ0xvb2tpbmcgZm9yIFVSTCBpbnB1dCBlbGVtZW50Li4uJylcbiAgICAgIGNvbnN0IHVybElucHV0RWxlbWVudCA9IGRlZXBRdWVyeSgnZmFjZXBsYXRlLXRleHRhcmVhLWlucHV0W25hbWU9XCJsaW5rXCJdJylcbiAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ1VSTCBpbnB1dCBlbGVtZW50IGZvdW5kOicsICEhdXJsSW5wdXRFbGVtZW50KVxuICAgICAgaWYgKHVybElucHV0RWxlbWVudCkge1xuICAgICAgICBjb25zdCBzaGFkb3dSb290ID0gdXJsSW5wdXRFbGVtZW50LnNoYWRvd1Jvb3RcbiAgICAgICAgc3VibWl0TG9nZ2VyLmxvZygnU2hhZG93Um9vdCBhY2Nlc3NpYmxlOicsICEhc2hhZG93Um9vdClcbiAgICAgICAgaWYgKHNoYWRvd1Jvb3QpIHtcbiAgICAgICAgICBjb25zdCB1cmxJbnB1dCA9IHNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2lubmVyVGV4dEFyZWEnKVxuICAgICAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ0lubmVyIHRleHRhcmVhIGZvdW5kOicsICEhdXJsSW5wdXQpXG4gICAgICAgICAgaWYgKHVybElucHV0KSB7XG4gICAgICAgICAgICB1cmxJbnB1dC5mb2N1cygpXG4gICAgICAgICAgICBhd2FpdCBzbGVlcCg1MDApXG4gICAgICAgICAgICB1cmxJbnB1dC52YWx1ZSA9IHBvc3REYXRhLnVybFxuICAgICAgICAgICAgdXJsSW5wdXQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JywgeyBidWJibGVzOiB0cnVlLCBjYW5jZWxhYmxlOiB0cnVlIH0pKVxuICAgICAgICAgICAgdXJsSW5wdXQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScsIHsgYnViYmxlczogdHJ1ZSwgY2FuY2VsYWJsZTogdHJ1ZSB9KSlcbiAgICAgICAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ1VSTCBmaWVsZCBmaWxsZWQ6JywgcG9zdERhdGEudXJsKVxuICAgICAgICAgICAgYXdhaXQgc2xlZXAoMTUwMClcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHN1Ym1pdExvZ2dlci5sb2coJ0ZhaWxlZCB0byBmaWxsIFVSTCBvciBubyBVUkwgcHJvdmlkZWQnKVxuICAgIHJldHVybiBmYWxzZVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHN1Ym1pdExvZ2dlci5lcnJvcignRXJyb3IgZmlsbGluZyBVUkw6JywgZXJyb3IpXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZmlsbEJvZHkocG9zdERhdGEpIHtcbiAgc3VibWl0TG9nZ2VyLmxvZygnRmlsbGluZyBib2R5IHRleHQuLi4nKVxuXG4gIC8vIEhlbHBlciBmdW5jdGlvbiBmb3Igc2hhZG93IERPTSBxdWVyaWVzXG4gIGZ1bmN0aW9uIGRlZXBRdWVyeShzZWxlY3Rvciwgcm9vdCA9IGRvY3VtZW50KSB7XG4gICAgY29uc3QgZWwgPSByb290LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgaWYgKGVsKSByZXR1cm4gZWxcbiAgICBmb3IgKGNvbnN0IGVsZW0gb2Ygcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcqJykpIHtcbiAgICAgIGlmIChlbGVtLnNoYWRvd1Jvb3QpIHtcbiAgICAgICAgY29uc3QgZm91bmQgPSBkZWVwUXVlcnkoc2VsZWN0b3IsIGVsZW0uc2hhZG93Um9vdClcbiAgICAgICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmRcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gRmlsbCBib2R5IGZpZWxkIHVzaW5nIG11bHRpcGxlIHBvc3NpYmxlIHNlbGVjdG9yc1xuICAgIGlmIChwb3N0RGF0YS5ib2R5KSB7XG4gICAgICBzdWJtaXRMb2dnZXIubG9nKCdMb29raW5nIGZvciBib2R5IHRleHQgZmllbGQgd2l0aCB1cGRhdGVkIHNlbGVjdG9ycy4uLicpXG5cbiAgICAgIC8vIEhlbHBlciBmdW5jdGlvbiB0byBmaWx0ZXIgb3V0IHRpdGxlIGZpZWxkXG4gICAgICBmdW5jdGlvbiBpc1RpdGxlRmllbGQoZWxlbWVudCkge1xuICAgICAgICBpZiAoIWVsZW1lbnQpIHJldHVybiBmYWxzZVxuICAgICAgICBjb25zdCBwYXJlbnQgPSBlbGVtZW50LmNsb3Nlc3QoJ2ZhY2VwbGF0ZS10ZXh0YXJlYS1pbnB1dFtuYW1lPVwidGl0bGVcIl0nKVxuICAgICAgICByZXR1cm4gISFwYXJlbnRcbiAgICAgIH1cblxuICAgICAgLy8gV2FpdCBhIGJpdCBmb3IgbGF6eS1sb2FkZWQgYm9keSBmaWVsZCBhZnRlciB0aXRsZSBpcyBmaWxsZWRcbiAgICAgIGF3YWl0IHNsZWVwKDEwMDApXG5cbiAgICAgIC8vIFRyeSBtdWx0aXBsZSBwb3NzaWJsZSBib2R5IGZpZWxkIHNlbGVjdG9yc1xuICAgICAgbGV0IGJvZHlDb21wb3NlciA9IG51bGxcbiAgICAgIGxldCBib2R5RWRpdGFibGUgPSBudWxsXG5cbiAgICAgIC8vIE1ldGhvZCAxOiBPcmlnaW5hbCBzZWxlY3RvciAodXBkYXRlZCB0byBtYXRjaCBhY3R1YWwgRE9NKVxuICAgICAgYm9keUNvbXBvc2VyID0gZGVlcFF1ZXJ5KCdzaHJlZGRpdC1jb21wb3NlcltuYW1lPVwiYm9keVwiXScpXG4gICAgICBpZiAoYm9keUNvbXBvc2VyKSB7XG4gICAgICAgIGJvZHlFZGl0YWJsZSA9IGJvZHlDb21wb3Nlci5xdWVyeVNlbGVjdG9yKCdkaXZbY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXVtkYXRhLWxleGljYWwtZWRpdG9yPVwidHJ1ZVwiXScpXG4gICAgICB9XG5cbiAgICAgIC8vIE1ldGhvZCAyOiBUcnkgZGlmZmVyZW50IGNvbXBvc2VyIHNlbGVjdG9yc1xuICAgICAgaWYgKCFib2R5RWRpdGFibGUpIHtcbiAgICAgICAgY29uc3QgY29tcG9zZXJTZWxlY3RvcnMgPSBbXG4gICAgICAgICAgJ3NocmVkZGl0LWNvbXBvc2VyJyxcbiAgICAgICAgICAnc2hyZWRkaXQtcmljaC10ZXh0LWVkaXRvcicsXG4gICAgICAgICAgJ1tkYXRhLXRlc3RpZD1cImNvbXBvc2VyXCJdJyxcbiAgICAgICAgICAnLnB1YmxpYy1EcmFmdEVkaXRvci1jb250ZW50J1xuICAgICAgICBdXG5cbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBjb21wb3NlclNlbGVjdG9ycykge1xuICAgICAgICAgIGNvbnN0IGNvbXBvc2VyID0gZGVlcFF1ZXJ5KHNlbGVjdG9yKVxuICAgICAgICAgIGlmIChjb21wb3Nlcikge1xuICAgICAgICAgICAgY29uc3QgY2FuZGlkYXRlcyA9IFtcbiAgICAgICAgICAgICAgY29tcG9zZXIucXVlcnlTZWxlY3RvcignZGl2W2NvbnRlbnRlZGl0YWJsZT1cInRydWVcIl1bZGF0YS1sZXhpY2FsLWVkaXRvcj1cInRydWVcIl0nKSxcbiAgICAgICAgICAgICAgY29tcG9zZXIucXVlcnlTZWxlY3RvcignW2NvbnRlbnRlZGl0YWJsZT1cInRydWVcIl0nKSxcbiAgICAgICAgICAgICAgY29tcG9zZXIucXVlcnlTZWxlY3RvcignLnB1YmxpYy1EcmFmdEVkaXRvci1jb250ZW50JylcbiAgICAgICAgICAgIF1cblxuICAgICAgICAgICAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgY2FuZGlkYXRlcykge1xuICAgICAgICAgICAgICBpZiAoY2FuZGlkYXRlICYmICFpc1RpdGxlRmllbGQoY2FuZGlkYXRlKSkge1xuICAgICAgICAgICAgICAgIGJvZHlFZGl0YWJsZSA9IGNhbmRpZGF0ZVxuICAgICAgICAgICAgICAgIHN1Ym1pdExvZ2dlci5sb2coYEZvdW5kIGJvZHkgZmllbGQgd2l0aCBzZWxlY3RvcjogJHtzZWxlY3Rvcn1gKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChib2R5RWRpdGFibGUpIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIE1ldGhvZCAzOiBMb29rIGZvciBhbnkgY29udGVudGVkaXRhYmxlIGRpdiBpbiB0aGUgc3VibWl0IGZvcm1cbiAgICAgIGlmICghYm9keUVkaXRhYmxlKSB7XG4gICAgICAgIGNvbnN0IHN1Ym1pdEZvcm0gPSBxcygnZm9ybScpIHx8IHFzKCdbZGF0YS10ZXN0aWQqPVwicG9zdFwiXScpIHx8IHFzKCdzaHJlZGRpdC1wb3N0LWNvbXBvc2VyJylcbiAgICAgICAgaWYgKHN1Ym1pdEZvcm0pIHtcbiAgICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0gW1xuICAgICAgICAgICAgc3VibWl0Rm9ybS5xdWVyeVNlbGVjdG9yKCdkaXZbY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXScpLFxuICAgICAgICAgICAgc3VibWl0Rm9ybS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1sZXhpY2FsLWVkaXRvcj1cInRydWVcIl0nKVxuICAgICAgICAgIF1cblxuICAgICAgICAgIGZvciAoY29uc3QgY2FuZGlkYXRlIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICAgICAgICAgIGlmIChjYW5kaWRhdGUgJiYgIWlzVGl0bGVGaWVsZChjYW5kaWRhdGUpKSB7XG4gICAgICAgICAgICAgIGJvZHlFZGl0YWJsZSA9IGNhbmRpZGF0ZVxuICAgICAgICAgICAgICBzdWJtaXRMb2dnZXIubG9nKCdGb3VuZCBib2R5IGZpZWxkIGluIHN1Ym1pdCBmb3JtJylcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgc3RpbGwgbm90IGZvdW5kLCB0cnkgcG9sbGluZyBmb3IgYSBmZXcgc2Vjb25kc1xuICAgICAgaWYgKCFib2R5RWRpdGFibGUpIHtcbiAgICAgICAgc3VibWl0TG9nZ2VyLmxvZygnQm9keSBmaWVsZCBub3QgaW1tZWRpYXRlbHkgYXZhaWxhYmxlLCBwb2xsaW5nIGZvciB1cCB0byA1IHNlY29uZHMuLi4nKVxuICAgICAgICBjb25zdCBtYXhQb2xsQXR0ZW1wdHMgPSAxMFxuICAgICAgICBjb25zdCBwb2xsSW50ZXJ2YWwgPSA1MDBcblxuICAgICAgICBmb3IgKGxldCBhdHRlbXB0ID0gMDsgYXR0ZW1wdCA8IG1heFBvbGxBdHRlbXB0czsgYXR0ZW1wdCsrKSB7XG4gICAgICAgICAgYXdhaXQgc2xlZXAocG9sbEludGVydmFsKVxuXG4gICAgICAgICAgLy8gUmV0cnkgYWxsIG1ldGhvZHNcbiAgICAgICAgICBjb25zdCBib2R5Q29tcG9zZXIgPSBkZWVwUXVlcnkoJ3NocmVkZGl0LWNvbXBvc2VyW25hbWU9XCJib2R5XCJdJylcbiAgICAgICAgICBpZiAoYm9keUNvbXBvc2VyKSB7XG4gICAgICAgICAgICBib2R5RWRpdGFibGUgPSBib2R5Q29tcG9zZXIucXVlcnlTZWxlY3RvcignZGl2W2NvbnRlbnRlZGl0YWJsZT1cInRydWVcIl1bZGF0YS1sZXhpY2FsLWVkaXRvcj1cInRydWVcIl0nKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghYm9keUVkaXRhYmxlKSB7XG4gICAgICAgICAgICBjb25zdCBzdWJtaXRGb3JtID0gcXMoJ2Zvcm0nKSB8fCBxcygnW2RhdGEtdGVzdGlkKj1cInBvc3RcIl0nKSB8fCBxcygnc2hyZWRkaXQtcG9zdC1jb21wb3NlcicpXG4gICAgICAgICAgICBpZiAoc3VibWl0Rm9ybSkge1xuICAgICAgICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0gW1xuICAgICAgICAgICAgICAgIHN1Ym1pdEZvcm0ucXVlcnlTZWxlY3RvcignZGl2W2NvbnRlbnRlZGl0YWJsZT1cInRydWVcIl0nKSxcbiAgICAgICAgICAgICAgICBzdWJtaXRGb3JtLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWxleGljYWwtZWRpdG9yPVwidHJ1ZVwiXScpXG4gICAgICAgICAgICAgIF1cblxuICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNhbmRpZGF0ZSBvZiBjYW5kaWRhdGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNhbmRpZGF0ZSAmJiAhaXNUaXRsZUZpZWxkKGNhbmRpZGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgIGJvZHlFZGl0YWJsZSA9IGNhbmRpZGF0ZVxuICAgICAgICAgICAgICAgICAgc3VibWl0TG9nZ2VyLmxvZyhgRm91bmQgYm9keSBmaWVsZCBhZnRlciBwb2xsaW5nIChhdHRlbXB0ICR7YXR0ZW1wdCArIDF9KWApXG4gICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChib2R5RWRpdGFibGUpIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGJvZHlFZGl0YWJsZSkge1xuICAgICAgICBzdWJtaXRMb2dnZXIubG9nKCdGb3VuZCBib2R5IHRleHQgZWRpdG9yLCBzZXR0aW5nIHRleHQuLi4nKVxuICAgICAgICBib2R5RWRpdGFibGUuZm9jdXMoKVxuICAgICAgICBhd2FpdCBzbGVlcCg1MDApXG5cbiAgICAgICAgLy8gQ2xlYXIgYW5kIHNldCBib2R5IHRleHQgY2hhcmFjdGVyIGJ5IGNoYXJhY3RlclxuICAgICAgICBib2R5RWRpdGFibGUuaW5uZXJIVE1MID0gJzxwPjxicj48L3A+J1xuICAgICAgICBjb25zdCB0ZXh0ID0gcG9zdERhdGEuYm9keVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGV4dC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGNoYXIgPSB0ZXh0W2ldXG5cbiAgICAgICAgICBpZiAoZG9jdW1lbnQuZXhlY0NvbW1hbmQgJiYgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2luc2VydFRleHQnLCBmYWxzZSwgY2hhcikpIHtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpXG4gICAgICAgICAgICBpZiAoc2VsZWN0aW9uLnJhbmdlQ291bnQgPiAwKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHJhbmdlID0gc2VsZWN0aW9uLmdldFJhbmdlQXQoMClcbiAgICAgICAgICAgICAgcmFuZ2UuZGVsZXRlQ29udGVudHMoKVxuICAgICAgICAgICAgICBjb25zdCB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNoYXIpXG4gICAgICAgICAgICAgIHJhbmdlLmluc2VydE5vZGUodGV4dE5vZGUpXG4gICAgICAgICAgICAgIHJhbmdlLnNldFN0YXJ0QWZ0ZXIodGV4dE5vZGUpXG4gICAgICAgICAgICAgIHJhbmdlLnNldEVuZEFmdGVyKHRleHROb2RlKVxuICAgICAgICAgICAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKClcbiAgICAgICAgICAgICAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGJvZHlFZGl0YWJsZS5kaXNwYXRjaEV2ZW50KG5ldyBJbnB1dEV2ZW50KCdpbnB1dCcsIHtcbiAgICAgICAgICAgIGlucHV0VHlwZTogJ2luc2VydFRleHQnLFxuICAgICAgICAgICAgZGF0YTogY2hhcixcbiAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlXG4gICAgICAgICAgfSkpXG5cbiAgICAgICAgICBhd2FpdCBzbGVlcCgxMClcbiAgICAgICAgfVxuXG4gICAgICAgIGJvZHlFZGl0YWJsZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJywgeyBidWJibGVzOiB0cnVlLCBjYW5jZWxhYmxlOiB0cnVlIH0pKVxuICAgICAgICBzdWJtaXRMb2dnZXIubG9nKCdCb2R5IHRleHQgc2V0IHN1Y2Nlc3NmdWxseScpXG4gICAgICAgIGF3YWl0IHNsZWVwKDE1MDApXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdWJtaXRMb2dnZXIubG9nKCdCb2R5IHRleHQgZmllbGQgbm90IGZvdW5kIHdpdGggYW55IHNlbGVjdG9yJylcbiAgICAgICAgLy8gRGVidWc6IGxvZyBhdmFpbGFibGUgZWxlbWVudHNcbiAgICAgICAgc3VibWl0TG9nZ2VyLmxvZygnQXZhaWxhYmxlIGVsZW1lbnRzIGluIGRvY3VtZW50OicpXG4gICAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ0Zvcm1zOicsIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Zvcm0nKS5sZW5ndGgpXG4gICAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ0NvbnRlbnRlZGl0YWJsZSBkaXZzOicsIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCJdJykubGVuZ3RoKVxuICAgICAgICBzdWJtaXRMb2dnZXIubG9nKCdTaHJlZGRpdCBjb21wb3NlcnM6JywgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc2hyZWRkaXQtY29tcG9zZXInKS5sZW5ndGgpXG4gICAgICB9XG4gICAgfVxuICAgIHN1Ym1pdExvZ2dlci5sb2coJ0ZhaWxlZCB0byBmaWxsIGJvZHkgb3Igbm8gYm9keSB0ZXh0IHByb3ZpZGVkJylcbiAgICByZXR1cm4gZmFsc2VcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBzdWJtaXRMb2dnZXIuZXJyb3IoJ0Vycm9yIGZpbGxpbmcgYm9keTonLCBlcnJvcilcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBjbGlja0JvZHlGaWVsZCgpIHtcbiAgc3VibWl0TG9nZ2VyLmxvZygnQ2xpY2tpbmcgYm9keSB0ZXh0IGZpZWxkIHRvIGFjdGl2YXRlIFBvc3QgYnV0dG9uLi4uJylcblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gZm9yIHNoYWRvdyBET00gcXVlcmllc1xuICBmdW5jdGlvbiBkZWVwUXVlcnkoc2VsZWN0b3IsIHJvb3QgPSBkb2N1bWVudCkge1xuICAgIGNvbnN0IGVsID0gcm9vdC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuICAgIGlmIChlbCkgcmV0dXJuIGVsXG4gICAgZm9yIChjb25zdCBlbGVtIG9mIHJvb3QucXVlcnlTZWxlY3RvckFsbCgnKicpKSB7XG4gICAgICBpZiAoZWxlbS5zaGFkb3dSb290KSB7XG4gICAgICAgIGNvbnN0IGZvdW5kID0gZGVlcFF1ZXJ5KHNlbGVjdG9yLCBlbGVtLnNoYWRvd1Jvb3QpXG4gICAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGZvdW5kXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICB0cnkge1xuICAgIC8vIEhlbHBlciBmdW5jdGlvbiB0byBmaWx0ZXIgb3V0IHRpdGxlIGZpZWxkXG4gICAgZnVuY3Rpb24gaXNUaXRsZUZpZWxkKGVsZW1lbnQpIHtcbiAgICAgIGlmICghZWxlbWVudCkgcmV0dXJuIGZhbHNlXG4gICAgICBjb25zdCBwYXJlbnQgPSBlbGVtZW50LmNsb3Nlc3QoJ2ZhY2VwbGF0ZS10ZXh0YXJlYS1pbnB1dFtuYW1lPVwidGl0bGVcIl0nKVxuICAgICAgcmV0dXJuICEhcGFyZW50XG4gICAgfVxuXG4gICAgLy8gV2FpdCBhIGJpdCBmb3IgbGF6eS1sb2FkZWQgYm9keSBmaWVsZFxuICAgIGF3YWl0IHNsZWVwKDEwMDApXG5cbiAgICAvLyBUcnkgbXVsdGlwbGUgcG9zc2libGUgYm9keSBmaWVsZCBzZWxlY3RvcnMgKHNhbWUgYXMgZmlsbEJvZHkpXG4gICAgbGV0IGJvZHlFZGl0YWJsZSA9IG51bGxcblxuICAgIC8vIE1ldGhvZCAxOiBPcmlnaW5hbCBzZWxlY3RvciAodXBkYXRlZCB0byBtYXRjaCBhY3R1YWwgRE9NKVxuICAgIGNvbnN0IGJvZHlDb21wb3NlciA9IGRlZXBRdWVyeSgnc2hyZWRkaXQtY29tcG9zZXJbbmFtZT1cImJvZHlcIl0nKVxuICAgIGlmIChib2R5Q29tcG9zZXIpIHtcbiAgICAgIGJvZHlFZGl0YWJsZSA9IGJvZHlDb21wb3Nlci5xdWVyeVNlbGVjdG9yKCdkaXZbY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXVtkYXRhLWxleGljYWwtZWRpdG9yPVwidHJ1ZVwiXScpXG4gICAgfVxuXG4gICAgLy8gTWV0aG9kIDI6IFRyeSBkaWZmZXJlbnQgY29tcG9zZXIgc2VsZWN0b3JzXG4gICAgaWYgKCFib2R5RWRpdGFibGUpIHtcbiAgICAgIGNvbnN0IGNvbXBvc2VyU2VsZWN0b3JzID0gW1xuICAgICAgICAnc2hyZWRkaXQtY29tcG9zZXInLFxuICAgICAgICAnc2hyZWRkaXQtcmljaC10ZXh0LWVkaXRvcicsXG4gICAgICAgICdbZGF0YS10ZXN0aWQ9XCJjb21wb3NlclwiXScsXG4gICAgICAgICcucHVibGljLURyYWZ0RWRpdG9yLWNvbnRlbnQnXG4gICAgICBdXG5cbiAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2YgY29tcG9zZXJTZWxlY3RvcnMpIHtcbiAgICAgICAgY29uc3QgY29tcG9zZXIgPSBkZWVwUXVlcnkoc2VsZWN0b3IpXG4gICAgICAgIGlmIChjb21wb3Nlcikge1xuICAgICAgICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBbXG4gICAgICAgICAgICBjb21wb3Nlci5xdWVyeVNlbGVjdG9yKCdkaXZbY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXVtkYXRhLWxleGljYWwtZWRpdG9yPVwidHJ1ZVwiXScpLFxuICAgICAgICAgICAgY29tcG9zZXIucXVlcnlTZWxlY3RvcignW2NvbnRlbnRlZGl0YWJsZT1cInRydWVcIl0nKSxcbiAgICAgICAgICAgIGNvbXBvc2VyLnF1ZXJ5U2VsZWN0b3IoJy5wdWJsaWMtRHJhZnRFZGl0b3ItY29udGVudCcpXG4gICAgICAgICAgXVxuXG4gICAgICAgICAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgY2FuZGlkYXRlcykge1xuICAgICAgICAgICAgaWYgKGNhbmRpZGF0ZSAmJiAhaXNUaXRsZUZpZWxkKGNhbmRpZGF0ZSkpIHtcbiAgICAgICAgICAgICAgYm9keUVkaXRhYmxlID0gY2FuZGlkYXRlXG4gICAgICAgICAgICAgIHN1Ym1pdExvZ2dlci5sb2coYEZvdW5kIGJvZHkgZmllbGQgd2l0aCBzZWxlY3RvcjogJHtzZWxlY3Rvcn1gKVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYm9keUVkaXRhYmxlKSBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWV0aG9kIDM6IExvb2sgZm9yIGFueSBjb250ZW50ZWRpdGFibGUgZGl2IGluIHRoZSBzdWJtaXQgZm9ybVxuICAgIGlmICghYm9keUVkaXRhYmxlKSB7XG4gICAgICBjb25zdCBzdWJtaXRGb3JtID0gcXMoJ2Zvcm0nKSB8fCBxcygnW2RhdGEtdGVzdGlkKj1cInBvc3RcIl0nKSB8fCBxcygnc2hyZWRkaXQtcG9zdC1jb21wb3NlcicpXG4gICAgICBpZiAoc3VibWl0Rm9ybSkge1xuICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0gW1xuICAgICAgICAgIHN1Ym1pdEZvcm0ucXVlcnlTZWxlY3RvcignZGl2W2NvbnRlbnRlZGl0YWJsZT1cInRydWVcIl0nKSxcbiAgICAgICAgICBzdWJtaXRGb3JtLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWxleGljYWwtZWRpdG9yPVwidHJ1ZVwiXScpXG4gICAgICAgIF1cblxuICAgICAgICBmb3IgKGNvbnN0IGNhbmRpZGF0ZSBvZiBjYW5kaWRhdGVzKSB7XG4gICAgICAgICAgaWYgKGNhbmRpZGF0ZSAmJiAhaXNUaXRsZUZpZWxkKGNhbmRpZGF0ZSkpIHtcbiAgICAgICAgICAgIGJvZHlFZGl0YWJsZSA9IGNhbmRpZGF0ZVxuICAgICAgICAgICAgc3VibWl0TG9nZ2VyLmxvZygnRm91bmQgYm9keSBmaWVsZCBpbiBzdWJtaXQgZm9ybScpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHN0aWxsIG5vdCBmb3VuZCwgdHJ5IHBvbGxpbmcgZm9yIGEgZmV3IHNlY29uZHNcbiAgICBpZiAoIWJvZHlFZGl0YWJsZSkge1xuICAgICAgc3VibWl0TG9nZ2VyLmxvZygnQm9keSBmaWVsZCBub3QgaW1tZWRpYXRlbHkgYXZhaWxhYmxlLCBwb2xsaW5nIGZvciB1cCB0byA1IHNlY29uZHMuLi4nKVxuICAgICAgY29uc3QgbWF4UG9sbEF0dGVtcHRzID0gMTBcbiAgICAgIGNvbnN0IHBvbGxJbnRlcnZhbCA9IDUwMFxuXG4gICAgICBmb3IgKGxldCBhdHRlbXB0ID0gMDsgYXR0ZW1wdCA8IG1heFBvbGxBdHRlbXB0czsgYXR0ZW1wdCsrKSB7XG4gICAgICAgIGF3YWl0IHNsZWVwKHBvbGxJbnRlcnZhbClcblxuICAgICAgICAvLyBSZXRyeSBhbGwgbWV0aG9kc1xuICAgICAgICBjb25zdCBib2R5Q29tcG9zZXIgPSBkZWVwUXVlcnkoJ3NocmVkZGl0LWNvbXBvc2VyW25hbWU9XCJib2R5XCJdJylcbiAgICAgICAgaWYgKGJvZHlDb21wb3Nlcikge1xuICAgICAgICAgIGJvZHlFZGl0YWJsZSA9IGJvZHlDb21wb3Nlci5xdWVyeVNlbGVjdG9yKCdkaXZbY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXVtkYXRhLWxleGljYWwtZWRpdG9yPVwidHJ1ZVwiXScpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWJvZHlFZGl0YWJsZSkge1xuICAgICAgICAgIGNvbnN0IHN1Ym1pdEZvcm0gPSBxcygnZm9ybScpIHx8IHFzKCdbZGF0YS10ZXN0aWQqPVwicG9zdFwiXScpIHx8IHFzKCdzaHJlZGRpdC1wb3N0LWNvbXBvc2VyJylcbiAgICAgICAgICBpZiAoc3VibWl0Rm9ybSkge1xuICAgICAgICAgICAgY29uc3QgY2FuZGlkYXRlcyA9IFtcbiAgICAgICAgICAgICAgc3VibWl0Rm9ybS5xdWVyeVNlbGVjdG9yKCdkaXZbY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXScpLFxuICAgICAgICAgICAgICBzdWJtaXRGb3JtLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWxleGljYWwtZWRpdG9yPVwidHJ1ZVwiXScpXG4gICAgICAgICAgICBdXG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgY2FuZGlkYXRlIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICAgICAgICAgICAgaWYgKGNhbmRpZGF0ZSAmJiAhaXNUaXRsZUZpZWxkKGNhbmRpZGF0ZSkpIHtcbiAgICAgICAgICAgICAgICBib2R5RWRpdGFibGUgPSBjYW5kaWRhdGVcbiAgICAgICAgICAgICAgICBzdWJtaXRMb2dnZXIubG9nKGBGb3VuZCBib2R5IGZpZWxkIGFmdGVyIHBvbGxpbmcgKGF0dGVtcHQgJHthdHRlbXB0ICsgMX0pYClcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJvZHlFZGl0YWJsZSkgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYm9keUVkaXRhYmxlKSB7XG4gICAgICBzdWJtaXRMb2dnZXIubG9nKCdGb3VuZCBib2R5IHRleHQgZmllbGQsIGNsaWNraW5nIHRvIGFjdGl2YXRlIFBvc3QgYnV0dG9uLi4uJylcblxuICAgICAgYm9keUVkaXRhYmxlLmNsaWNrKClcbiAgICAgIGF3YWl0IHNsZWVwKDEwMClcbiAgICAgIGJvZHlFZGl0YWJsZS5mb2N1cygpXG4gICAgICBhd2FpdCBzbGVlcCgxMDApXG4gICAgICBib2R5RWRpdGFibGUuY2xpY2soKVxuXG4gICAgICBib2R5RWRpdGFibGUuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2ZvY3VzJywgeyBidWJibGVzOiB0cnVlLCBjYW5jZWxhYmxlOiB0cnVlIH0pKVxuICAgICAgYm9keUVkaXRhYmxlLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjbGljaycsIHsgYnViYmxlczogdHJ1ZSwgY2FuY2VsYWJsZTogdHJ1ZSB9KSlcblxuICAgICAgYXdhaXQgc2xlZXAoMTAwMClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ0JvZHkgdGV4dCBmaWVsZCBub3QgZm91bmQgd2l0aCBhbnkgc2VsZWN0b3InKVxuICAgICAgLy8gRGVidWc6IGxvZyBhdmFpbGFibGUgZWxlbWVudHNcbiAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ0F2YWlsYWJsZSBlbGVtZW50cyBpbiBkb2N1bWVudDonKVxuICAgICAgc3VibWl0TG9nZ2VyLmxvZygnRm9ybXM6JywgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZm9ybScpLmxlbmd0aClcbiAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ0NvbnRlbnRlZGl0YWJsZSBkaXZzOicsIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCJdJykubGVuZ3RoKVxuICAgICAgc3VibWl0TG9nZ2VyLmxvZygnU2hyZWRkaXQgY29tcG9zZXJzOicsIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NocmVkZGl0LWNvbXBvc2VyJykubGVuZ3RoKVxuICAgIH1cblxuICAgIHN1Ym1pdExvZ2dlci5sb2coJ0JvZHkgdGV4dCBmaWVsZCBub3QgZm91bmQnKVxuICAgIHJldHVybiBmYWxzZVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHN1Ym1pdExvZ2dlci5lcnJvcignRXJyb3IgY2xpY2tpbmcgYm9keSBmaWVsZDonLCBlcnJvcilcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBjbGlja1RhYih0YWJWYWx1ZSkge1xuICBzdWJtaXRMb2dnZXIubG9nKGBDbGlja2luZyB0YWIgd2l0aCBkYXRhLXNlbGVjdC12YWx1ZT1cIiR7dGFiVmFsdWV9XCJgKVxuXG4gIC8vIEhlbHBlciBmdW5jdGlvbiBmb3Igc2hhZG93IERPTSBxdWVyaWVzXG4gIGZ1bmN0aW9uIGRlZXBRdWVyeShzZWxlY3Rvciwgcm9vdCA9IGRvY3VtZW50KSB7XG4gICAgY29uc3QgZWwgPSByb290LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgaWYgKGVsKSByZXR1cm4gZWxcbiAgICBmb3IgKGNvbnN0IGVsZW0gb2Ygcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcqJykpIHtcbiAgICAgIGlmIChlbGVtLnNoYWRvd1Jvb3QpIHtcbiAgICAgICAgY29uc3QgZm91bmQgPSBkZWVwUXVlcnkoc2VsZWN0b3IsIGVsZW0uc2hhZG93Um9vdClcbiAgICAgICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmRcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGNvbnN0IHRhYiA9IGRlZXBRdWVyeShgW2RhdGEtc2VsZWN0LXZhbHVlPVwiJHt0YWJWYWx1ZX1cIl1gKVxuICBpZiAodGFiKSB7XG4gICAgdGFiLmNsaWNrKClcbiAgICBhd2FpdCBzbGVlcCgyMDAwKVxuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgc3VibWl0TG9nZ2VyLmxvZyhgVGFiIHdpdGggZGF0YS1zZWxlY3QtdmFsdWU9XCIke3RhYlZhbHVlfVwiIG5vdCBmb3VuZGApXG4gIHJldHVybiBmYWxzZVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVSdWxlVmlvbGF0aW9uRGlhbG9nKCkge1xuICBzdWJtaXRMb2dnZXIubG9nKCdDaGVja2luZyBmb3IgcnVsZSB2aW9sYXRpb24gZGlhbG9nIGFmdGVyIHN1Ym1pdC4uLicpXG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9uIGZvciBzaGFkb3cgRE9NIHF1ZXJpZXNcbiAgZnVuY3Rpb24gZGVlcFF1ZXJ5KHNlbGVjdG9yLCByb290ID0gZG9jdW1lbnQpIHtcbiAgICBjb25zdCBlbCA9IHJvb3QucXVlcnlTZWxlY3RvcihzZWxlY3RvcilcbiAgICBpZiAoZWwpIHJldHVybiBlbFxuICAgIGZvciAoY29uc3QgZWxlbSBvZiByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKSkge1xuICAgICAgaWYgKGVsZW0uc2hhZG93Um9vdCkge1xuICAgICAgICBjb25zdCBmb3VuZCA9IGRlZXBRdWVyeShzZWxlY3RvciwgZWxlbS5zaGFkb3dSb290KVxuICAgICAgICBpZiAoZm91bmQpIHJldHVybiBmb3VuZFxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyBQb2xsIGZvciBkaWFsb2cgZm9yIHVwIHRvIDEwIHNlY29uZHNcbiAgICBjb25zdCBtYXhBdHRlbXB0cyA9IDIwXG4gICAgY29uc3QgcG9sbEludGVydmFsID0gNTAwXG4gICAgbGV0IGRpYWxvZ0ZvdW5kID0gZmFsc2VcblxuICAgIGZvciAobGV0IGF0dGVtcHQgPSAwOyBhdHRlbXB0IDwgbWF4QXR0ZW1wdHM7IGF0dGVtcHQrKykge1xuICAgICAgYXdhaXQgc2xlZXAocG9sbEludGVydmFsKVxuXG4gICAgICAvLyBMb29rIGZvciBkaWFsb2cgd2l0aCBydWxlIHZpb2xhdGlvbiB0ZXh0XG4gICAgICBjb25zdCBkaWFsb2dTZWxlY3RvcnMgPSBbXG4gICAgICAgICdbcm9sZT1cImRpYWxvZ1wiXScsXG4gICAgICAgICcubW9kYWwnLFxuICAgICAgICAnLnBvcHVwJyxcbiAgICAgICAgJ1tkYXRhLXRlc3RpZD1cImRpYWxvZ1wiXScsXG4gICAgICAgICdzaHJlZGRpdC1tb2RhbCcsXG4gICAgICAgICcucnVsZS12aW9sYXRpb24tZGlhbG9nJ1xuICAgICAgXVxuXG4gICAgICBsZXQgZGlhbG9nID0gbnVsbFxuICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBkaWFsb2dTZWxlY3RvcnMpIHtcbiAgICAgICAgZGlhbG9nID0gcXMoc2VsZWN0b3IpIHx8IGRlZXBRdWVyeShzZWxlY3RvcilcbiAgICAgICAgaWYgKGRpYWxvZykgYnJlYWtcbiAgICAgIH1cblxuICAgICAgaWYgKCFkaWFsb2cpIHtcbiAgICAgICAgY29udGludWUgLy8gVHJ5IG5leHQgYXR0ZW1wdFxuICAgICAgfVxuXG4gICAgICBkaWFsb2dGb3VuZCA9IHRydWVcblxuICAgICAgLy8gQ2hlY2sgaWYgZGlhbG9nIGNvbnRhaW5zIHJ1bGUgdmlvbGF0aW9uIHRleHRcbiAgICAgIGNvbnN0IGRpYWxvZ1RleHQgPSBkaWFsb2cudGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkgfHwgJydcbiAgICAgIGNvbnN0IHJ1bGVWaW9sYXRpb25JbmRpY2F0b3JzID0gW1xuICAgICAgICAnYnJlYWsgdGhlc2UgcnVsZXMnLFxuICAgICAgICAncnVsZSB2aW9sYXRpb24nLFxuICAgICAgICAnbWF5IGJyZWFrJyxcbiAgICAgICAgJ3JlbWVtYmVyLCBhaSBjYW4gbWFrZSBtaXN0YWtlcycsXG4gICAgICAgICdzdWJtaXQgd2l0aG91dCBlZGl0aW5nJyxcbiAgICAgICAgJ2VkaXQgcG9zdCdcbiAgICAgIF1cblxuICAgICAgY29uc3QgaXNSdWxlVmlvbGF0aW9uRGlhbG9nID0gcnVsZVZpb2xhdGlvbkluZGljYXRvcnMuc29tZShpbmRpY2F0b3IgPT5cbiAgICAgICAgZGlhbG9nVGV4dC5pbmNsdWRlcyhpbmRpY2F0b3IudG9Mb3dlckNhc2UoKSlcbiAgICAgIClcblxuICAgICAgaWYgKCFpc1J1bGVWaW9sYXRpb25EaWFsb2cpIHtcbiAgICAgICAgc3VibWl0TG9nZ2VyLmxvZygnRGlhbG9nIGZvdW5kIGJ1dCBub3QgYSBydWxlIHZpb2xhdGlvbiBkaWFsb2cnKVxuICAgICAgICBjb250aW51ZSAvLyBLZWVwIGxvb2tpbmcgZm9yIHRoZSByaWdodCBkaWFsb2dcbiAgICAgIH1cblxuICAgICAgc3VibWl0TG9nZ2VyLmxvZygnUnVsZSB2aW9sYXRpb24gZGlhbG9nIGRldGVjdGVkLCBsb29raW5nIGZvciBcIlN1Ym1pdCB3aXRob3V0IGVkaXRpbmdcIiBidXR0b24uLi4nKVxuXG4gICAgICAvLyBMb29rIGZvciBcIlN1Ym1pdCB3aXRob3V0IGVkaXRpbmdcIiBidXR0b24gd2l0aCBjb21wcmVoZW5zaXZlIHNlYXJjaFxuICAgICAgbGV0IHN1Ym1pdEJ1dHRvbiA9IG51bGxcblxuICAgICAgLy8gVHJ5IHRleHQtYmFzZWQgc2VhcmNoIGZpcnN0IChtb3N0IHJlbGlhYmxlKVxuICAgICAgY29uc3QgYWxsQnV0dG9ucyA9IGRpYWxvZy5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKVxuICAgICAgZm9yIChjb25zdCBidXR0b24gb2YgYWxsQnV0dG9ucykge1xuICAgICAgICBjb25zdCBidXR0b25UZXh0ID0gYnV0dG9uLnRleHRDb250ZW50Py50cmltKCkgfHwgJydcbiAgICAgICAgaWYgKGJ1dHRvblRleHQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnc3VibWl0IHdpdGhvdXQgZWRpdGluZycpKSB7XG4gICAgICAgICAgc3VibWl0QnV0dG9uID0gYnV0dG9uXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBBbHNvIHNlYXJjaCBpbiBzaGFkb3cgRE9NcyB3aXRoaW4gdGhlIGRpYWxvZ1xuICAgICAgaWYgKCFzdWJtaXRCdXR0b24pIHtcbiAgICAgICAgZm9yIChjb25zdCBlbGVtIG9mIGRpYWxvZy5xdWVyeVNlbGVjdG9yQWxsKCcqJykpIHtcbiAgICAgICAgICBpZiAoZWxlbS5zaGFkb3dSb290KSB7XG4gICAgICAgICAgICBjb25zdCBzaGFkb3dCdXR0b25zID0gZWxlbS5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbicpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGJ1dHRvbiBvZiBzaGFkb3dCdXR0b25zKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGJ1dHRvblRleHQgPSBidXR0b24udGV4dENvbnRlbnQ/LnRyaW0oKSB8fCAnJ1xuICAgICAgICAgICAgICBpZiAoYnV0dG9uVGV4dC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdzdWJtaXQgd2l0aG91dCBlZGl0aW5nJykpIHtcbiAgICAgICAgICAgICAgICBzdWJtaXRCdXR0b24gPSBidXR0b25cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3VibWl0QnV0dG9uKSBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiBub3QgZm91bmQgYnkgdGV4dCwgdHJ5IGF0dHJpYnV0ZS1iYXNlZCBzZWxlY3RvcnNcbiAgICAgIGlmICghc3VibWl0QnV0dG9uKSB7XG4gICAgICAgIGNvbnN0IHN1Ym1pdFdpdGhvdXRFZGl0aW5nU2VsZWN0b3JzID0gW1xuICAgICAgICAgICdbZGF0YS1jbGljay1pZD1cInN1Ym1pdC13aXRob3V0LWVkaXRpbmdcIl0nLFxuICAgICAgICAgICcuc3VibWl0LXdpdGhvdXQtZWRpdGluZycsXG4gICAgICAgICAgJ2J1dHRvblt0eXBlPVwic3VibWl0XCJdJ1xuICAgICAgICBdXG5cbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzdWJtaXRXaXRob3V0RWRpdGluZ1NlbGVjdG9ycykge1xuICAgICAgICAgIHN1Ym1pdEJ1dHRvbiA9IGRpYWxvZy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSB8fCBkZWVwUXVlcnkoc2VsZWN0b3IsIGRpYWxvZylcbiAgICAgICAgICBpZiAoc3VibWl0QnV0dG9uKSBicmVha1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzdWJtaXRCdXR0b24pIHtcbiAgICAgICAgc3VibWl0TG9nZ2VyLmxvZygnRm91bmQgXCJTdWJtaXQgd2l0aG91dCBlZGl0aW5nXCIgYnV0dG9uLCBjbGlja2luZy4uLicpXG4gICAgICAgIHN1Ym1pdEJ1dHRvbi5jbGljaygpXG5cbiAgICAgICAgLy8gV2FpdCBmb3IgZGlhbG9nIHRvIGNsb3NlIGFuZCB2ZXJpZnkgc3VibWlzc2lvbiBjb21wbGV0aW9uXG4gICAgICAgIGF3YWl0IHNsZWVwKDIwMDApXG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgZGlhbG9nIGlzIGdvbmUgYW5kIHdlJ3JlIG5vIGxvbmdlciBvbiBzdWJtaXQgcGFnZSAoaW5kaWNhdGVzIHN1Y2Nlc3MpXG4gICAgICAgIGNvbnN0IGRpYWxvZ1N0aWxsRXhpc3RzID0gcXMoZGlhbG9nU2VsZWN0b3JzWzBdKSB8fCBkZWVwUXVlcnkoZGlhbG9nU2VsZWN0b3JzWzBdKVxuICAgICAgICBjb25zdCBzdGlsbE9uU3VibWl0UGFnZSA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluY2x1ZGVzKCcvc3VibWl0JylcblxuICAgICAgICBpZiAoIWRpYWxvZ1N0aWxsRXhpc3RzICYmICFzdGlsbE9uU3VibWl0UGFnZSkge1xuICAgICAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ1J1bGUgdmlvbGF0aW9uIGRpYWxvZyBoYW5kbGVkIHN1Y2Nlc3NmdWxseSAtIHN1Ym1pc3Npb24gY29tcGxldGVkJylcbiAgICAgICAgICByZXR1cm4gdHJ1ZSAvLyBTdWNjZXNzXG4gICAgICAgIH0gZWxzZSBpZiAoZGlhbG9nU3RpbGxFeGlzdHMpIHtcbiAgICAgICAgICBzdWJtaXRMb2dnZXIubG9nKCdEaWFsb2cgc3RpbGwgZXhpc3RzIGFmdGVyIGNsaWNraW5nLCBtYXkgbmVlZCB0byB0cnkgYWdhaW4nKVxuICAgICAgICAgIGNvbnRpbnVlIC8vIENvbnRpbnVlIHBvbGxpbmcgdG8gdHJ5IGFnYWluXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3VibWl0TG9nZ2VyLmxvZygnRGlhbG9nIGNsb3NlZCBidXQgc3RpbGwgb24gc3VibWl0IHBhZ2UsIGNoZWNraW5nIHN1Ym1pc3Npb24gc3RhdHVzLi4uJylcbiAgICAgICAgICAvLyBHaXZlIGl0IGEgYml0IG1vcmUgdGltZSB0byBuYXZpZ2F0ZVxuICAgICAgICAgIGF3YWl0IHNsZWVwKDMwMDApXG4gICAgICAgICAgaWYgKCF3aW5kb3cubG9jYXRpb24uaHJlZi5pbmNsdWRlcygnL3N1Ym1pdCcpKSB7XG4gICAgICAgICAgICBzdWJtaXRMb2dnZXIubG9nKCdSdWxlIHZpb2xhdGlvbiBkaWFsb2cgaGFuZGxlZCBzdWNjZXNzZnVsbHkgLSBzdWJtaXNzaW9uIGNvbXBsZXRlZCcpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdWJtaXRMb2dnZXIubG9nKCdTdGlsbCBvbiBzdWJtaXQgcGFnZSBhZnRlciBkaWFsb2cgaGFuZGxpbmcsIG1heSBoYXZlIGZhaWxlZCcpXG4gICAgICAgICAgICBjb250aW51ZSAvLyBDb250aW51ZSB0byBzZWUgaWYgZGlhbG9nIHJlYXBwZWFyc1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3VibWl0TG9nZ2VyLmxvZygnQ291bGQgbm90IGZpbmQgXCJTdWJtaXQgd2l0aG91dCBlZGl0aW5nXCIgYnV0dG9uIGluIGRpYWxvZywgY29udGludWluZyB0byBwb2xsLi4uJylcbiAgICAgICAgLy8gRG9uJ3QgcmV0dXJuIGZhbHNlIGltbWVkaWF0ZWx5IC0gY29udGludWUgcG9sbGluZyBhcyBidXR0b24gbWlnaHQgYXBwZWFyIGxhdGVyXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRpYWxvZ0ZvdW5kKSB7XG4gICAgICBzdWJtaXRMb2dnZXIubG9nKCdSdWxlIHZpb2xhdGlvbiBkaWFsb2cgd2FzIGZvdW5kIGJ1dCBjb3VsZCBub3QgYmUgaGFuZGxlZCB3aXRoaW4gdGltZW91dCBwZXJpb2QnKVxuICAgIH0gZWxzZSB7XG4gICAgICBzdWJtaXRMb2dnZXIubG9nKCdObyBydWxlIHZpb2xhdGlvbiBkaWFsb2cgZm91bmQgd2l0aGluIHRpbWVvdXQgcGVyaW9kJylcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlIC8vIE5vIGRpYWxvZyBhcHBlYXJlZCBvciBjb3VsZG4ndCBiZSBoYW5kbGVkXG5cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBzdWJtaXRMb2dnZXIuZXJyb3IoJ0Vycm9yIGhhbmRsaW5nIHJ1bGUgdmlvbGF0aW9uIGRpYWxvZzonLCBlcnJvcilcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBzdWJtaXRQb3N0KCkge1xuICBzdWJtaXRMb2dnZXIubG9nKCdTdWJtaXR0aW5nIHBvc3QuLi4nKVxuXG4gIC8vIEhlbHBlciBmdW5jdGlvbiBmb3Igc2hhZG93IERPTSBxdWVyaWVzXG4gIGZ1bmN0aW9uIGRlZXBRdWVyeShzZWxlY3Rvciwgcm9vdCA9IGRvY3VtZW50KSB7XG4gICAgY29uc3QgZWwgPSByb290LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgaWYgKGVsKSByZXR1cm4gZWxcbiAgICBmb3IgKGNvbnN0IGVsZW0gb2Ygcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcqJykpIHtcbiAgICAgIGlmIChlbGVtLnNoYWRvd1Jvb3QpIHtcbiAgICAgICAgY29uc3QgZm91bmQgPSBkZWVwUXVlcnkoc2VsZWN0b3IsIGVsZW0uc2hhZG93Um9vdClcbiAgICAgICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmRcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gQ2hlY2sgaWYgcG9zdCBidXR0b24gaXMgYWN0aXZlIChmcm9tIHBvc3RtLXBhZ2UuanMpXG4gICAgY29uc3QgY2hlY2tCdXR0b25BY3RpdmUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBpbm5lckJ1dHRvbiA9IGRlZXBRdWVyeSgnI2lubmVyLXBvc3Qtc3VibWl0LWJ1dHRvbicpXG4gICAgICBpZiAoaW5uZXJCdXR0b24pIHtcbiAgICAgICAgY29uc3QgaXNEaXNhYmxlZCA9IGlubmVyQnV0dG9uLmRpc2FibGVkIHx8IGlubmVyQnV0dG9uLmdldEF0dHJpYnV0ZSgnYXJpYS1kaXNhYmxlZCcpID09PSAndHJ1ZSdcbiAgICAgICAgc3VibWl0TG9nZ2VyLmxvZygnSW5uZXIgcG9zdCBidXR0b24gYWN0aXZlOicsICFpc0Rpc2FibGVkKVxuICAgICAgICByZXR1cm4gIWlzRGlzYWJsZWRcbiAgICAgIH1cblxuICAgICAgY29uc3QgcG9zdENvbnRhaW5lciA9IGRlZXBRdWVyeSgnci1wb3N0LWZvcm0tc3VibWl0LWJ1dHRvbiNzdWJtaXQtcG9zdC1idXR0b24nKVxuICAgICAgaWYgKHBvc3RDb250YWluZXIgJiYgcG9zdENvbnRhaW5lci5zaGFkb3dSb290KSB7XG4gICAgICAgIGNvbnN0IHNoYWRvd0J1dHRvbiA9IHBvc3RDb250YWluZXIuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdidXR0b24nKVxuICAgICAgICBpZiAoc2hhZG93QnV0dG9uKSB7XG4gICAgICAgICAgY29uc3QgaXNTaGFkb3dEaXNhYmxlZCA9IHNoYWRvd0J1dHRvbi5kaXNhYmxlZCB8fCBzaGFkb3dCdXR0b24uZ2V0QXR0cmlidXRlKCdhcmlhLWRpc2FibGVkJykgPT09ICd0cnVlJ1xuICAgICAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ1NoYWRvdyBwb3N0IGJ1dHRvbiBhY3RpdmU6JywgIWlzU2hhZG93RGlzYWJsZWQpXG4gICAgICAgICAgcmV0dXJuICFpc1NoYWRvd0Rpc2FibGVkXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgLy8gV2FpdCBmb3IgYnV0dG9uIHRvIGJlY29tZSBhY3RpdmVcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpXG4gICAgd2hpbGUgKERhdGUubm93KCkgLSBzdGFydFRpbWUgPCAxMDAwMCkge1xuICAgICAgaWYgKGNoZWNrQnV0dG9uQWN0aXZlKCkpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHNsZWVwKDUwMClcbiAgICB9XG5cbiAgICAvLyBUcnkgaW5uZXIgcG9zdCBidXR0b24gZmlyc3QgKGZyb20gcG9zdG0tcGFnZS5qcylcbiAgICBjb25zdCBpbm5lclBvc3RCdXR0b24gPSBkZWVwUXVlcnkoJyNpbm5lci1wb3N0LXN1Ym1pdC1idXR0b24nKVxuICAgIGlmIChpbm5lclBvc3RCdXR0b24gJiYgIWlubmVyUG9zdEJ1dHRvbi5kaXNhYmxlZCkge1xuICAgICAgc3VibWl0TG9nZ2VyLmxvZygnRm91bmQgYWN0aXZlIGlubmVyIHBvc3QgYnV0dG9uLCBjbGlja2luZy4uLicpXG4gICAgICBpbm5lclBvc3RCdXR0b24uY2xpY2soKVxuICAgICAgLy8gQ2hlY2sgZm9yIHJ1bGUgdmlvbGF0aW9uIGRpYWxvZyBhZnRlciBjbGlja2luZyBzdWJtaXRcbiAgICAgIGF3YWl0IGhhbmRsZVJ1bGVWaW9sYXRpb25EaWFsb2coKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICAvLyBUcnkgc2hhZG93IERPTSBidXR0b24gKGZyb20gcG9zdG0tcGFnZS5qcylcbiAgICBjb25zdCBwb3N0Q29udGFpbmVyID0gZGVlcFF1ZXJ5KCdyLXBvc3QtZm9ybS1zdWJtaXQtYnV0dG9uI3N1Ym1pdC1wb3N0LWJ1dHRvbicpXG4gICAgaWYgKHBvc3RDb250YWluZXIpIHtcbiAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ0ZvdW5kIHBvc3QgY29udGFpbmVyJylcblxuICAgICAgaWYgKHBvc3RDb250YWluZXIuc2hhZG93Um9vdCkge1xuICAgICAgICBjb25zdCBzaGFkb3dCdXR0b24gPSBwb3N0Q29udGFpbmVyLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignYnV0dG9uJylcbiAgICAgICAgaWYgKHNoYWRvd0J1dHRvbiAmJiAhc2hhZG93QnV0dG9uLmRpc2FibGVkKSB7XG4gICAgICAgICAgc3VibWl0TG9nZ2VyLmxvZygnRm91bmQgYWN0aXZlIGJ1dHRvbiBpbiBzaGFkb3cgRE9NLCBjbGlja2luZy4uLicpXG4gICAgICAgICAgc2hhZG93QnV0dG9uLmNsaWNrKClcbiAgICAgICAgICAvLyBDaGVjayBmb3IgcnVsZSB2aW9sYXRpb24gZGlhbG9nIGFmdGVyIGNsaWNraW5nIHN1Ym1pdFxuICAgICAgICAgIGF3YWl0IGhhbmRsZVJ1bGVWaW9sYXRpb25EaWFsb2coKVxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3VibWl0TG9nZ2VyLmxvZygnQ2xpY2tpbmcgcG9zdCBjb250YWluZXIgZGlyZWN0bHknKVxuICAgICAgcG9zdENvbnRhaW5lci5jbGljaygpXG4gICAgICAvLyBDaGVjayBmb3IgcnVsZSB2aW9sYXRpb24gZGlhbG9nIGFmdGVyIGNsaWNraW5nIHN1Ym1pdFxuICAgICAgYXdhaXQgaGFuZGxlUnVsZVZpb2xhdGlvbkRpYWxvZygpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIC8vIEZhbGxiYWNrIHRvIGdlbmVyaWMgc2VsZWN0b3JzXG4gICAgY29uc3Qgc3VibWl0QnV0dG9uID0gcXMoJ2J1dHRvbltkYXRhLWNsaWNrLWlkPVwic3VibWl0XCJdLCBidXR0b25bdHlwZT1cInN1Ym1pdFwiXSwgW2RhdGEtdGVzdGlkPVwicG9zdC1zdWJtaXRcIl0nKVxuICAgIGlmIChzdWJtaXRCdXR0b24pIHtcbiAgICAgIHN1Ym1pdEJ1dHRvbi5jbGljaygpXG4gICAgICBzdWJtaXRMb2dnZXIubG9nKCdTdWJtaXQgYnV0dG9uIGNsaWNrZWQnKVxuICAgICAgLy8gQ2hlY2sgZm9yIHJ1bGUgdmlvbGF0aW9uIGRpYWxvZyBhZnRlciBjbGlja2luZyBzdWJtaXRcbiAgICAgIGF3YWl0IGhhbmRsZVJ1bGVWaW9sYXRpb25EaWFsb2coKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgc3VibWl0TG9nZ2VyLmxvZygnU3VibWl0IGJ1dHRvbiBub3QgZm91bmQnKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHN1Ym1pdExvZ2dlci5lcnJvcignRXJyb3Igc3VibWl0dGluZyBwb3N0OicsIGVycm9yKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbi8vIE1haW4gcG9zdCBzdWJtaXNzaW9uIHNjcmlwdFxuYXN5bmMgZnVuY3Rpb24gcnVuUG9zdFN1Ym1pc3Npb25TY3JpcHQoc2tpcFRhYlN0YXRlQ2hlY2sgPSBmYWxzZSkge1xuICBzdWJtaXRMb2dnZXIubG9nKCc9PT0gUE9TVCBTVUJNSVNTSU9OIFNDUklQVCBTVEFSVEVEID09PScpXG5cbiAgLy8gUmVtb3ZlIGJlZm9yZXVubG9hZCBsaXN0ZW5lcnMgdG8gcHJldmVudCBcIkxlYXZlIHNpdGU/XCIgZGlhbG9nXG4gIHJlbW92ZUJlZm9yZVVubG9hZExpc3RlbmVycygpXG5cbiAgdHJ5IHtcbiAgICAvLyBDaGVjayBpZiB0aGlzIHRhYiB3YXMgY3JlYXRlZCBieSBiYWNrZ3JvdW5kIHNjcmlwdCB0byBwcmV2ZW50IGR1cGxpY2F0ZSBleGVjdXRpb25cbiAgICBpZiAoIXNraXBUYWJTdGF0ZUNoZWNrKSB7XG4gICAgICBjb25zdCB0YWJTdGF0ZVJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICB0eXBlOiAnR0VUX1RBQl9TVEFURSdcbiAgICAgIH0pXG5cbiAgICAgIGlmICh0YWJTdGF0ZVJlc3BvbnNlLnN1Y2Nlc3MgJiYgdGFiU3RhdGVSZXNwb25zZS5pc0JhY2tncm91bmRQb3N0VGFiKSB7XG4gICAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ1NraXBwaW5nIGF1dG8tcnVuIHBvc3Qgc3VibWlzc2lvbiAtIHRoaXMgdGFiIHdhcyBjcmVhdGVkIGJ5IGJhY2tncm91bmQgc2NyaXB0JylcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRW5zdXJlIHBhZ2UgaXMgZnVsbHkgbG9hZGVkIGFuZCBvcGVyYWJsZVxuICAgIGF3YWl0IGVuc3VyZVN1Ym1pdFBhZ2VSZWFkeSgpXG5cbiAgICAvLyBGZXRjaCBwb3N0IGRhdGFcbiAgICBjb25zdCBwb3N0RGF0YSA9IGF3YWl0IGZldGNoUG9zdERhdGFGb3JTdWJtaXNzaW9uKClcbiAgICBpZiAoIXBvc3REYXRhKSB7XG4gICAgICBzdWJtaXRMb2dnZXIubG9nKCdQb3N0IHN1Ym1pc3Npb24gc2NyaXB0OiBObyBwb3N0IGRhdGEgYXZhaWxhYmxlJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHN1Ym1pdExvZ2dlci5sb2coJ1Bvc3Qgc3VibWlzc2lvbiBzY3JpcHQ6IEdvdCBwb3N0IGRhdGE6JywgcG9zdERhdGEudGl0bGUpXG5cbiAgICAvLyBEZXRlcm1pbmUgcG9zdCB0eXBlIGFuZCBzdGF5IG9uIGFwcHJvcHJpYXRlIHRhYlxuICAgIGNvbnN0IGlzTGlua1Bvc3QgPSBwb3N0RGF0YS51cmwgJiYgcG9zdERhdGEudXJsLnRyaW0oKVxuICAgIGNvbnN0IHRhcmdldFRhYiA9IGlzTGlua1Bvc3QgPyAnTElOSycgOiAnVEVYVCdcblxuICAgIHN1Ym1pdExvZ2dlci5sb2coYD09PSBTdWJtaXR0aW5nIGFzICR7dGFyZ2V0VGFifSBwb3N0ID09PWApXG5cbiAgICAvLyA9PT0gU1RFUCAxOiBHbyB0byB0YXJnZXQgdGFiIGFuZCBmaWxsIHRpdGxlID09PVxuICAgIHN1Ym1pdExvZ2dlci5sb2coYD09PSBTVEVQIDE6ICR7dGFyZ2V0VGFifSBUQUIgLSBGaWxsaW5nIHRpdGxlID09PWApXG4gICAgaWYgKGF3YWl0IGNsaWNrVGFiKHRhcmdldFRhYikpIHtcbiAgICAgIGF3YWl0IGZpbGxUaXRsZShwb3N0RGF0YSlcbiAgICB9IGVsc2Uge1xuICAgICAgc3VibWl0TG9nZ2VyLmxvZyhgQ2Fubm90IHByb2NlZWQgd2l0aG91dCAke3RhcmdldFRhYn0gdGFiYClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vID09PSBTVEVQIDI6IEZpbGwgVVJMIGlmIGxpbmsgcG9zdCA9PT1cbiAgICBpZiAoaXNMaW5rUG9zdCkge1xuICAgICAgc3VibWl0TG9nZ2VyLmxvZygnPT09IFNURVAgMjogRmlsbGluZyBVUkwgPT09JylcbiAgICAgIGF3YWl0IGZpbGxVcmwocG9zdERhdGEpXG4gICAgfVxuXG4gICAgLy8gPT09IFNURVAgMzogQWN0aXZhdGluZyBQb3N0IGJ1dHRvbiBieSBjbGlja2luZyBib2R5IGZpZWxkID09PVxuICAgIHN1Ym1pdExvZ2dlci5sb2coJz09PSBTVEVQIDM6IEFjdGl2YXRpbmcgUG9zdCBidXR0b24gYnkgY2xpY2tpbmcgYm9keSBmaWVsZCA9PT0nKVxuICAgIGF3YWl0IGNsaWNrQm9keUZpZWxkKClcbiAgICBhd2FpdCBzbGVlcCgyMDAwKVxuXG4gICAgLy8gPT09IFNURVAgNDogRmlsbCBib2R5IHRleHQgPT09XG4gICAgc3VibWl0TG9nZ2VyLmxvZygnPT09IFNURVAgNDogRmlsbCBib2R5IHRleHQgPT09JylcbiAgICBhd2FpdCBmaWxsQm9keShwb3N0RGF0YSlcblxuICAgIC8vID09PSBTVEVQIDU6IEZpbmFsIGFjdGl2YXRpb24gY2xpY2sgb24gYm9keSBmaWVsZCA9PT1cbiAgICBzdWJtaXRMb2dnZXIubG9nKCc9PT0gU1RFUCA1OiBGaW5hbCBhY3RpdmF0aW9uIGNsaWNrIG9uIGJvZHkgZmllbGQgPT09JylcbiAgICBhd2FpdCBjbGlja0JvZHlGaWVsZCgpXG4gICAgYXdhaXQgc2xlZXAoMjAwMClcblxuICAgIC8vID09PSBTVEVQIDY6IENsaWNraW5nIFBvc3QgYnV0dG9uID09PVxuICAgIHN1Ym1pdExvZ2dlci5sb2coJz09PSBTVEVQIDY6IENsaWNraW5nIFBvc3QgYnV0dG9uID09PScpXG4gICAgY29uc3Qgc3VibWl0U3VjY2VzcyA9IGF3YWl0IHN1Ym1pdFBvc3QoKVxuXG4gICAgaWYgKHN1Ym1pdFN1Y2Nlc3MpIHtcbiAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ1Bvc3Qgc3VibWl0dGVkIHN1Y2Nlc3NmdWxseSwgd2FpdGluZyAxMCBzZWNvbmRzLi4uJylcbiAgICAgIGF3YWl0IHNsZWVwKDEwMDAwKVxuXG4gICAgICAvLyBBZnRlciByZWRpcmVjdCwgY2FwdHVyZSB0aGUgZmluYWwgVVJMIGFzIHRoZSBSZWRkaXQgcG9zdCBVUkxcbiAgICAgIGNvbnN0IHJlZGRpdFVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG4gICAgICBsZXQgcmVkZGl0UG9zdElkID0gbnVsbFxuXG4gICAgICB0cnkge1xuICAgICAgICAvLyBFeHRyYWN0IFJlZGRpdCBwb3N0IElEIGZyb20gdGhlIHN1Ym1pdHRlZCBwb3N0IFVSTFxuICAgICAgICAvLyBSZWRkaXQncyBVUkwgZm9ybWF0cyBjYW4gdmFyeTpcbiAgICAgICAgLy8gLSBodHRwczovL3JlZGRpdC5jb20vci9zdWJyZWRkaXQvY29tbWVudHMvYWJjMTIzL3RpdGxlL1xuICAgICAgICAvLyAtIGh0dHBzOi8vd3d3LnJlZGRpdC5jb20vci9zdWJyZWRkaXQvY29tbWVudHMvYWJjMTIzL3RpdGxlL1xuICAgICAgICAvLyAtIGh0dHBzOi8vb2xkLnJlZGRpdC5jb20vci9zdWJyZWRkaXQvY29tbWVudHMvYWJjMTIzL3RpdGxlL1xuICAgICAgICAvLyAtIFRoZSBwYWdlIG1pZ2h0IGFsc28gaGF2ZSBhIGRhdGEgYXR0cmlidXRlIHdpdGggdGhlIHBvc3QgSURcbiAgICAgICAgXG4gICAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ0V4dHJhY3RpbmcgUmVkZGl0IHBvc3QgSUQgZnJvbSBVUkw6JywgcmVkZGl0VXJsKVxuICAgICAgICBcbiAgICAgICAgLy8gTWV0aG9kIDE6IEV4dHJhY3QgZnJvbSBVUkwgcGF0dGVybnNcbiAgICAgICAgY29uc3QgdXJsUGF0dGVybnMgPSBbXG4gICAgICAgICAgL1xcL2NvbW1lbnRzXFwvKFthLXowLTldezYsN30pL2ksICAvLyBTdGFuZGFyZCBSZWRkaXQgcG9zdCBJRCBmb3JtYXQgKDYtNyBjaGFycylcbiAgICAgICAgICAvXFwvclxcL1teXFwvXStcXC9jb21tZW50c1xcLyhbYS16MC05XXs2LDd9KS9pLFxuICAgICAgICAgIC9yZWRkaXRcXC5jb21cXC8uKlxcLyhbYS16MC05XXs2LDd9KVxcLy9pLFxuICAgICAgICAgIC9edDNfKFthLXowLTldezYsN30pJC9pXG4gICAgICAgIF1cbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiB1cmxQYXR0ZXJucykge1xuICAgICAgICAgIGNvbnN0IG1hdGNoID0gcmVkZGl0VXJsICYmIHJlZGRpdFVybC5tYXRjaChwYXR0ZXJuKVxuICAgICAgICAgIGlmIChtYXRjaCAmJiBtYXRjaFsxXSkge1xuICAgICAgICAgICAgcmVkZGl0UG9zdElkID0gbWF0Y2hbMV1cbiAgICAgICAgICAgIHN1Ym1pdExvZ2dlci5sb2coYEV4dHJhY3RlZCBwb3N0IElEIHVzaW5nIFVSTCBwYXR0ZXJuOiAke3JlZGRpdFBvc3RJZH1gKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIE1ldGhvZCAyOiBUcnkgdG8gZ2V0IGZyb20gcGFnZSBkYXRhIGlmIFVSTCBleHRyYWN0aW9uIGZhaWxlZFxuICAgICAgICBpZiAoIXJlZGRpdFBvc3RJZCkge1xuICAgICAgICAgIC8vIENoZWNrIGZvciBwb3N0IElEIGluIHBhZ2UgZGF0YSBvciBtZXRhIHRhZ3NcbiAgICAgICAgICBjb25zdCBwYWdlRGF0YSA9IHdpbmRvdy5fX3IgfHwge31cbiAgICAgICAgICBjb25zdCBwb3N0SWRGcm9tRGF0YSA9IHBhZ2VEYXRhPy5wb3N0Py5pZCB8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1wb3N0LWlkXScpPy5nZXRBdHRyaWJ1dGUoJ2RhdGEtcG9zdC1pZCcpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2hyZWRkaXQtcG9zdCcpPy5nZXRBdHRyaWJ1dGUoJ2lkJylcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAocG9zdElkRnJvbURhdGEpIHtcbiAgICAgICAgICAgIC8vIEV4dHJhY3QganVzdCB0aGUgSUQgcGFydCBpZiBpdCdzIGluIHQzXyBmb3JtYXRcbiAgICAgICAgICAgIGNvbnN0IGlkTWF0Y2ggPSBwb3N0SWRGcm9tRGF0YS5tYXRjaCgvdDNfKFthLXowLTldezYsN30pL2kpIHx8IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdElkRnJvbURhdGEubWF0Y2goLyhbYS16MC05XXs2LDd9KS9pKVxuICAgICAgICAgICAgaWYgKGlkTWF0Y2ggJiYgaWRNYXRjaFsxXSkge1xuICAgICAgICAgICAgICByZWRkaXRQb3N0SWQgPSBpZE1hdGNoWzFdXG4gICAgICAgICAgICAgIHN1Ym1pdExvZ2dlci5sb2coYEV4dHJhY3RlZCBwb3N0IElEIGZyb20gcGFnZSBkYXRhOiAke3JlZGRpdFBvc3RJZH1gKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gTWV0aG9kIDM6IFRyeSB0byBnZXQgZnJvbSBjdXJyZW50IHBhZ2UncyBwb3N0IGVsZW1lbnRcbiAgICAgICAgaWYgKCFyZWRkaXRQb3N0SWQgJiYgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluY2x1ZGVzKCcvY29tbWVudHMvJykpIHtcbiAgICAgICAgICBjb25zdCBwb3N0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NocmVkZGl0LXBvc3QnKVxuICAgICAgICAgIGlmIChwb3N0RWxlbWVudCAmJiBwb3N0RWxlbWVudC5pZCkge1xuICAgICAgICAgICAgY29uc3QgaWRNYXRjaCA9IHBvc3RFbGVtZW50LmlkLm1hdGNoKC90M18oW2EtejAtOV17Niw3fSkvaSlcbiAgICAgICAgICAgIGlmIChpZE1hdGNoICYmIGlkTWF0Y2hbMV0pIHtcbiAgICAgICAgICAgICAgcmVkZGl0UG9zdElkID0gaWRNYXRjaFsxXVxuICAgICAgICAgICAgICBzdWJtaXRMb2dnZXIubG9nKGBFeHRyYWN0ZWQgcG9zdCBJRCBmcm9tIHBvc3QgZWxlbWVudDogJHtyZWRkaXRQb3N0SWR9YClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICghcmVkZGl0UG9zdElkKSB7XG4gICAgICAgICAgc3VibWl0TG9nZ2VyLndhcm4oJ0NvdWxkIG5vdCBleHRyYWN0IFJlZGRpdCBwb3N0IElELiBVUkw6JywgcmVkZGl0VXJsKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1Ym1pdExvZ2dlci5sb2coYFN1Y2Nlc3NmdWxseSBleHRyYWN0ZWQgUmVkZGl0IHBvc3QgSUQ6ICR7cmVkZGl0UG9zdElkfWApXG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3VibWl0TG9nZ2VyLndhcm4oJ0ZhaWxlZCB0byBleHRyYWN0IFJlZGRpdCBwb3N0IElEOicsIGUpXG4gICAgICB9XG5cbiAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ0NhcHR1cmVkIFJlZGRpdCBwb3N0IFVSTC9JRCBhZnRlciBzdWJtaXNzaW9uOicsIHsgcmVkZGl0VXJsLCByZWRkaXRQb3N0SWQgfSlcblxuICAgICAgLy8gQ2xlYXIgcG9zdCBkYXRhIHRvIHByZXZlbnQgcmV1c2VcbiAgICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtcG9zdGRhdGEnKVxuXG4gICAgICAvLyBOb3RpZnkgYmFja2dyb3VuZCBzY3JpcHQgb2YgY29tcGxldGlvbiBhbmQgcGFzcyBSZWRkaXQgVVJML0lEIGZvciBGcmFwcGUgc3luY1xuICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICB0eXBlOiAnQUNUSU9OX0NPTVBMRVRFRCcsXG4gICAgICAgIGFjdGlvbjogJ1BPU1RfQ1JFQVRJT05fQ09NUExFVEVEJyxcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHJlZGRpdFVybCxcbiAgICAgICAgICByZWRkaXRQb3N0SWRcbiAgICAgICAgfVxuICAgICAgfSkuY2F0Y2goKCkgPT4ge30pXG4gICAgfSBlbHNlIHtcbiAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ1Bvc3Qgc3VibWlzc2lvbiBmYWlsZWQnKVxuICAgICAgLy8gTm90aWZ5IGJhY2tncm91bmQgc2NyaXB0IG9mIGZhaWx1cmVcbiAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgdHlwZTogJ0FDVElPTl9DT01QTEVURUQnLFxuICAgICAgICBhY3Rpb246ICdQT1NUX0NSRUFUSU9OX0NPTVBMRVRFRCcsXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ1Bvc3Qgc3VibWlzc2lvbiBmYWlsZWQnXG4gICAgICB9KS5jYXRjaCgoKSA9PiB7fSlcbiAgICAgIC8vIENsZWFyIHBvc3QgZGF0YSBldmVuIG9uIGZhaWx1cmUgdG8gcHJldmVudCByZXRyeSBsb29wc1xuICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgncmVkZGl0LXBvc3QtbWFjaGluZS1wb3N0ZGF0YScpXG4gICAgfVxuXG4gICAgc3VibWl0TG9nZ2VyLmxvZygnPT09IFBPU1QgU1VCTUlTU0lPTiBTQ1JJUFQgQ09NUExFVEVEID09PScpXG5cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBzdWJtaXRMb2dnZXIuZXJyb3IoJ1Bvc3Qgc3VibWlzc2lvbiBzY3JpcHQgZXJyb3I6JywgZXJyb3IpXG4gICAgLy8gTm90aWZ5IGJhY2tncm91bmQgc2NyaXB0IG9mIGVycm9yXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgdHlwZTogJ0FDVElPTl9DT01QTEVURUQnLFxuICAgICAgYWN0aW9uOiAnUE9TVF9DUkVBVElPTl9DT01QTEVURUQnLFxuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBlcnJvcjogZXJyb3IubWVzc2FnZVxuICAgIH0pLmNhdGNoKCgpID0+IHt9KVxuICB9XG59XG5cbi8vIEhhbmRsZSBtYW51YWwgc2NyaXB0IHRyaWdnZXIgZnJvbSBiYWNrZ3JvdW5kL3BvcHVwXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVNYW51YWxTY3JpcHRUcmlnZ2VyKHNjcmlwdFR5cGUsIG1vZGUpIHtcbiAgc3VibWl0TG9nZ2VyLmxvZyhgPT09IE1BTlVBTCBUUklHR0VSOiAke3NjcmlwdFR5cGV9IChtb2RlOiAke21vZGV9KSA9PT1gKVxuXG4gIHRyeSB7XG4gICAgaWYgKHNjcmlwdFR5cGUgPT09ICdwb3N0Jykge1xuICAgICAgLy8gQ2xlYXIgYW55IGV4aXN0aW5nIHNjcmlwdCBzdGFnZSBmb3IgbWFudWFsIGV4ZWN1dGlvblxuICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgncmVkZGl0LXBvc3QtbWFjaGluZS1zY3JpcHQtc3RhZ2UnKVxuICAgICAgc3VibWl0TG9nZ2VyLmxvZygnTWFudWFsbHkgdHJpZ2dlcmluZyBwb3N0IHN1Ym1pc3Npb24gc2NyaXB0JylcbiAgICAgIGF3YWl0IHJ1blBvc3RTdWJtaXNzaW9uU2NyaXB0KClcbiAgICB9IGVsc2Uge1xuICAgICAgc3VibWl0TG9nZ2VyLmxvZyhgTWFudWFsIHRyaWdnZXIgZm9yICR7c2NyaXB0VHlwZX0gbm90IGhhbmRsZWQgYnkgc3VibWl0IHNjcmlwdGApXG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHN1Ym1pdExvZ2dlci5lcnJvcignTWFudWFsIHNjcmlwdCB0cmlnZ2VyIGVycm9yOicsIGVycm9yKVxuICB9XG59XG5cbi8vIEhhbmRsZSBzdGFydCBwb3N0IGNyZWF0aW9uIGZyb20gYmFja2dyb3VuZCBzY3JpcHRcbmZ1bmN0aW9uIGhhbmRsZVN0YXJ0UG9zdENyZWF0aW9uKHVzZXJOYW1lLCBwb3N0RGF0YSkge1xuICBzdWJtaXRMb2dnZXIubG9nKGBTdGFydGluZyBwb3N0IGNyZWF0aW9uIGZvciB1c2VyOiAke3VzZXJOYW1lfWAsIHBvc3REYXRhKVxuXG4gIC8vIENoZWNrIGlmIGFscmVhZHkgb24gc3VibWl0IHBhZ2UgLSBpZiBzbywgZG9uJ3QgY3JlYXRlIG5ldyB0YWJcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluY2x1ZGVzKCcvc3VibWl0JykpIHtcbiAgICBzdWJtaXRMb2dnZXIubG9nKCdBbHJlYWR5IG9uIHN1Ym1pdCBwYWdlLCBzdG9yaW5nIHBvc3QgZGF0YSBhbmQgdHJpZ2dlcmluZyBzdWJtaXNzaW9uJylcbiAgICBpZiAocG9zdERhdGEpIHtcbiAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtcG9zdGRhdGEnLCBKU09OLnN0cmluZ2lmeShwb3N0RGF0YSkpO1xuICAgIH1cbiAgICAvLyBUcmlnZ2VyIHN1Ym1pc3Npb24gaW1tZWRpYXRlbHlcbiAgICBydW5Qb3N0U3VibWlzc2lvblNjcmlwdCh0cnVlKVxuICAgIHJldHVyblxuICB9XG5cbiAgaWYgKHBvc3REYXRhKSB7XG4gICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdyZWRkaXQtcG9zdC1tYWNoaW5lLXBvc3RkYXRhJywgSlNPTi5zdHJpbmdpZnkocG9zdERhdGEpKTtcbiAgfVxuXG4gIC8vIENoZWNrIGlmIHVzZXIgaXMgbG9nZ2VkIGluIGZpcnN0XG4gIHN1Ym1pdExvZ2dlci5sb2coJ0NoZWNraW5nIGlmIHVzZXIgaXMgbG9nZ2VkIGluIHVzaW5nIHByb3ZlbiBtZXRob2QuLi4nKVxuXG4gIC8vIExvb2sgZm9yIHRoZSBhdmF0YXIgYnV0dG9uIHRoYXQgd291bGQgaW5kaWNhdGUgbG9nZ2VkIGluIHN0YXRlXG4gIGNvbnN0IGF2YXRhckJ1dHRvbiA9IHFzKCdycGwtZHJvcGRvd24gZGl2LCBbZGF0YS10ZXN0aWQ9XCJ1c2VyLWF2YXRhclwiXSwgYnV0dG9uW2FyaWEtbGFiZWwqPVwidXNlclwiXSwgI2V4cGFuZC11c2VyLWRyYXdlci1idXR0b24nKVxuXG4gIGlmIChhdmF0YXJCdXR0b24pIHtcbiAgICBzdWJtaXRMb2dnZXIubG9nKCdGb3VuZCB1c2VyIGF2YXRhciBidXR0b24gLSB1c2VyIGlzIGxvZ2dlZCBpbicpXG4gIH0gZWxzZSB7XG4gICAgc3VibWl0TG9nZ2VyLmxvZygnVXNlciBhdmF0YXIgYnV0dG9uIG5vdCBmb3VuZCAtIHVzZXIgbWF5IG5vdCBiZSBsb2dnZWQgaW4nKVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gUmVxdWVzdCBiYWNrZ3JvdW5kIHNjcmlwdCB0byBjcmVhdGUgbmV3IHRhYiBpbnN0ZWFkIG9mIG5hdmlnYXRpbmdcbiAgc3VibWl0TG9nZ2VyLmxvZygnUmVxdWVzdGluZyBiYWNrZ3JvdW5kIHNjcmlwdCB0byBjcmVhdGUgbmV3IHBvc3QgdGFiJylcbiAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgIHR5cGU6ICdDUkVBVEVfUE9TVF9UQUInLFxuICAgIHBvc3REYXRhOiBwb3N0RGF0YSAvLyBPbmx5IHVzZSBkYXRhIHByb3ZpZGVkIGJ5IGJhY2tncm91bmQgc2NyaXB0XG4gIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICBzdWJtaXRMb2dnZXIubG9nKCdCYWNrZ3JvdW5kIHNjcmlwdCBjcmVhdGVkIHBvc3QgdGFiIHN1Y2Nlc3NmdWxseTonLCByZXNwb25zZS50YWJJZClcbiAgICB9IGVsc2Uge1xuICAgICAgc3VibWl0TG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIHBvc3QgdGFiOicsIHJlc3BvbnNlLmVycm9yKVxuICAgIH1cbiAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgIHN1Ym1pdExvZ2dlci5lcnJvcignRXJyb3IgcmVxdWVzdGluZyBwb3N0IHRhYiBjcmVhdGlvbjonLCBlcnJvcilcbiAgfSlcbn1cblxuLy8gTWVzc2FnZSBsaXN0ZW5lclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICBzdWJtaXRMb2dnZXIubG9nKCdTdWJtaXQgc2NyaXB0IHJlY2VpdmVkIG1lc3NhZ2U6JywgbWVzc2FnZSlcblxuICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgIGNhc2UgJ1NUQVJUX1BPU1RfQ1JFQVRJT04nOlxuICAgICAgaGFuZGxlU3RhcnRQb3N0Q3JlYXRpb24obWVzc2FnZS51c2VyTmFtZSwgbWVzc2FnZS5wb3N0RGF0YSlcbiAgICAgIGJyZWFrXG5cbiAgICBjYXNlICdNQU5VQUxfVFJJR0dFUl9TQ1JJUFQnOlxuICAgICAgaGFuZGxlTWFudWFsU2NyaXB0VHJpZ2dlcihtZXNzYWdlLnNjcmlwdFR5cGUsIG1lc3NhZ2UubW9kZSlcbiAgICAgIGJyZWFrXG5cbiAgICBjYXNlICdERUxFVEVfTEFTVF9QT1NUJzpcbiAgICAgIC8vIFN1Ym1pdCBzY3JpcHQgZGVsZWdhdGVzIGRlbGV0ZSBvcGVyYXRpb25zIHRvIG1haW4gY29udGVudCBzY3JpcHRcbiAgICAgIHN1Ym1pdExvZ2dlci5sb2coJ1N1Ym1pdCBzY3JpcHQ6IERFTEVURV9MQVNUX1BPU1Qgbm90IHN1cHBvcnRlZCBvbiBzdWJtaXQgcGFnZSwgZGVsZWdhdGluZy4uLicpXG4gICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIHR5cGU6ICdBQ1RJT05fQ09NUExFVEVEJyxcbiAgICAgICAgYWN0aW9uOiAnREVMRVRFX0xBU1RfUE9TVCcsXG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ0RlbGV0ZSBvcGVyYXRpb25zIG11c3QgYmUgcGVyZm9ybWVkIG9uIHVzZXIgcHJvZmlsZSBwYWdlcydcbiAgICAgIH0pLmNhdGNoKCgpID0+IHt9KVxuICAgICAgYnJlYWtcblxuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBTaWxlbnRseSBpZ25vcmUgbWVzc2FnZXMgbm90IGludGVuZGVkIGZvciBzdWJtaXQgc2NyaXB0XG4gICAgICByZXR1cm5cbiAgfVxufSlcblxuLy8gSW5pdGlhbGl6ZSBzdWJtaXQgc2NyaXB0XG5zdWJtaXRMb2dnZXIubG9nKCdcdUQ4M0RcdURGRTIgU1VCTUlUIGNvbnRlbnQgc2NyaXB0IGxvYWRlZCBvbiBVUkw6Jywgd2luZG93LmxvY2F0aW9uLmhyZWYpXG5zdWJtaXRMb2dnZXIubG9nKCdcdUQ4M0RcdURGRTIgU1VCTUlUIHNjcmlwdDogQWxsIGxvYWRlZCBzY3JpcHRzIGNoZWNrOicsIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdCcpLmxlbmd0aClcblxuLy8gTm90ZTogQXV0by1ydW4gZGlzYWJsZWQgdG8gcHJldmVudCBhdXRvbWF0aWMgdGFiIGNyZWF0aW9uXG4vLyBBdXRvLXJ1biB3b3VsZCBiZSB0cmlnZ2VyZWQgaGVyZSBpZiBuZWVkZWRcblxuLy8gRXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZm9yIFF1YXNhciBicmlkZ2UgY29tcGF0aWJpbGl0eVxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKGJyaWRnZSkge1xuICAvLyBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBieSBRdWFzYXIncyBCRVggYnJpZGdlIHN5c3RlbVxuICBzdWJtaXRMb2dnZXIubG9nKCdTdWJtaXQgc2NyaXB0IGJyaWRnZSBpbml0aWFsaXplZCcsIGJyaWRnZSlcbn1cbiIsICIvKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyoqXG4gKiBUSElTIEZJTEUgSVMgR0VORVJBVEVEIEFVVE9NQVRJQ0FMTFkuXG4gKiBETyBOT1QgRURJVC5cbiAqXG4gKiBZb3UgYXJlIHByb2JhYmx5IGxvb2tpbmcgaW50byBhZGRpbmcgaG9va3MgaW4geW91ciBjb2RlLiBUaGlzIHNob3VsZCBiZSBkb25lIGJ5IG1lYW5zIG9mXG4gKiBzcmMtYmV4L2pzL2NvbnRlbnQtaG9va3MuanMgd2hpY2ggaGFzIGFjY2VzcyB0byB0aGUgYnJvd3NlciBpbnN0YW5jZSBhbmQgY29tbXVuaWNhdGlvbiBicmlkZ2VcbiAqKi9cblxuLyogZ2xvYmFsIGNocm9tZSAqL1xuXG5pbXBvcnQgQnJpZGdlIGZyb20gJy4vYnJpZGdlJ1xuaW1wb3J0IHsgbGlzdGVuRm9yV2luZG93RXZlbnRzIH0gZnJvbSAnLi93aW5kb3ctZXZlbnQtbGlzdGVuZXInXG5pbXBvcnQgcnVuRGV2bGFuZENvbnRlbnRTY3JpcHQgZnJvbSAnLi4vLi4vc3JjLWJleC9zdWJtaXQtY29udGVudC1zY3JpcHQnXG5cbmNvbnN0IHBvcnQgPSBjaHJvbWUucnVudGltZS5jb25uZWN0KHtcbiAgbmFtZTogJ2NvbnRlbnRTY3JpcHQnXG59KVxuXG5sZXQgZGlzY29ubmVjdGVkID0gZmFsc2VcbnBvcnQub25EaXNjb25uZWN0LmFkZExpc3RlbmVyKCgpID0+IHtcbiAgZGlzY29ubmVjdGVkID0gdHJ1ZVxufSlcblxubGV0IGJyaWRnZSA9IG5ldyBCcmlkZ2Uoe1xuICBsaXN0ZW4gKGZuKSB7XG4gICAgcG9ydC5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZm4pXG4gIH0sXG4gIHNlbmQgKGRhdGEpIHtcbiAgICBpZiAoIWRpc2Nvbm5lY3RlZCkge1xuICAgICAgcG9ydC5wb3N0TWVzc2FnZShkYXRhKVxuICAgICAgd2luZG93LnBvc3RNZXNzYWdlKHtcbiAgICAgICAgLi4uZGF0YSxcbiAgICAgICAgZnJvbTogJ2JleC1jb250ZW50LXNjcmlwdCdcbiAgICAgIH0sICcqJylcbiAgICB9XG4gIH1cbn0pXG5cbi8vIEluamVjdCBvdXIgZG9tIHNjcmlwdCBmb3IgY29tbXVuaWNhdGlvbnMuXG5mdW5jdGlvbiBpbmplY3RTY3JpcHQgKHVybCkge1xuICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuICBzY3JpcHQuc3JjID0gdXJsXG4gIHNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5yZW1vdmUoKVxuICB9XG4gIDsoZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpLmFwcGVuZENoaWxkKHNjcmlwdClcbn1cblxuaWYgKGRvY3VtZW50IGluc3RhbmNlb2YgSFRNTERvY3VtZW50KSB7XG4gIGluamVjdFNjcmlwdChjaHJvbWUucnVudGltZS5nZXRVUkwoJ2RvbS5qcycpKVxufVxuXG4vLyBMaXN0ZW4gZm9yIGV2ZW50IGZyb20gdGhlIHdlYiBwYWdlXG5saXN0ZW5Gb3JXaW5kb3dFdmVudHMoYnJpZGdlLCAnYmV4LWRvbScpXG5cbnJ1bkRldmxhbmRDb250ZW50U2NyaXB0KGJyaWRnZSlcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQXVCQSxVQUFJLElBQUksT0FBTyxZQUFZLFdBQVcsVUFBVTtBQUNoRCxVQUFJLGVBQWUsS0FBSyxPQUFPLEVBQUUsVUFBVSxhQUN2QyxFQUFFLFFBQ0YsU0FBU0EsY0FBYSxRQUFRLFVBQVUsTUFBTTtBQUM5QyxlQUFPLFNBQVMsVUFBVSxNQUFNLEtBQUssUUFBUSxVQUFVLElBQUk7QUFBQSxNQUM3RDtBQUVGLFVBQUk7QUFDSixVQUFJLEtBQUssT0FBTyxFQUFFLFlBQVksWUFBWTtBQUN4Qyx5QkFBaUIsRUFBRTtBQUFBLE1BQ3JCLFdBQVcsT0FBTyx1QkFBdUI7QUFDdkMseUJBQWlCLFNBQVNDLGdCQUFlLFFBQVE7QUFDL0MsaUJBQU8sT0FBTyxvQkFBb0IsTUFBTSxFQUNyQyxPQUFPLE9BQU8sc0JBQXNCLE1BQU0sQ0FBQztBQUFBLFFBQ2hEO0FBQUEsTUFDRixPQUFPO0FBQ0wseUJBQWlCLFNBQVNBLGdCQUFlLFFBQVE7QUFDL0MsaUJBQU8sT0FBTyxvQkFBb0Is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T0FBTyxRQUFRLFFBQVE7QUFBQSxJQUNsQyxNQUFNO0FBQUEsRUFDUixDQUFDO0FBRUQsTUFBSSxlQUFlO0FBQ25CLE9BQUssYUFBYSxZQUFZLE1BQU07QUFDbEMsbUJBQWU7QUFBQSxFQUNqQixDQUFDO0FBRUQsTUFBSSxTQUFTLElBQUksT0FBTztBQUFBLElBQ3RCLE9BQVEsSUFBSTtBQUNWLFdBQUssVUFBVSxZQUFZLEVBQUU7QUFBQSxJQUMvQjtBQUFBLElBQ0EsS0FBTSxNQUFNO0FBQ1YsVUFBSSxDQUFDLGNBQWM7QUFDakIsYUFBSyxZQUFZLElBQUk7QUFDckIsZUFBTyxZQUFZO0FBQUEsVUFDakIsR0FBRztBQUFBLFVBQ0gsTUFBTTtBQUFBLFFBQ1IsR0FBRyxHQUFHO0FBQUEsTUFDUjtBQUFBLElBQ0Y7QUFBQSxFQUNGLENBQUM7QUFHRCxXQUFTLGFBQWMsS0FBSztBQUMxQixVQUFNLFNBQVMsU0FBUyxjQUFjLFFBQVE7QUFDOUMsV0FBTyxNQUFNO0FBQ2IsV0FBTyxTQUFTLFdBQVk7QUFDMUIsV0FBSyxPQUFPO0FBQUEsSUFDZDtBQUNDLEtBQUMsU0FBUyxRQUFRLFNBQVMsaUJBQWlCLFlBQVksTUFBTTtBQUFBLEVBQ2pFO0FBRUEsTUFBSSxvQkFBb0IsY0FBYztBQUNwQyxpQkFBYSxPQUFPLFFBQVEsT0FBTyxRQUFRLENBQUM7QUFBQSxFQUM5QztBQUdBLHdCQUFzQixRQUFRLFNBQVM7QUFFdkMsZ0NBQXdCLE1BQU07IiwKICAibmFtZXMiOiBbIlJlZmxlY3RBcHBseSIsICJSZWZsZWN0T3duS2V5cyIsICJOdW1iZXJJc05hTiIsICJFdmVudEVtaXR0ZXIiLCAib25jZSIsICJicmlkZ2UiLCAiYm9keUNvbXBvc2VyIiwgInBvc3RDb250YWluZXIiLCAiYnJpZGdlIl0KfQo=
