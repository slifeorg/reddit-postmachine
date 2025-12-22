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
          messages.forEach((message2) => this._emit(message2));
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
    _emit(message2) {
      if (typeof message2 === "string") {
        this.emit(message2);
      } else {
        this.emit(message2.event, message2.payload);
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

  // src-bex/my-content-script.js
  contentLogger.log("Reddit Post Machine content script loaded");
  function injectDomScript() {
    if (window.RedditDOMHelper) {
      contentLogger.log("DOM script already loaded");
      return;
    }
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("dom.js");
    script.onload = () => {
      contentLogger.log("DOM script injected successfully");
    };
    script.onerror = () => {
      contentLogger.error("Failed to inject DOM script");
    };
    document.documentElement.appendChild(script);
  }
  injectDomScript();
  window.addEventListener("error", (e) => {
    if (e.message && e.message.includes("Connection has been terminated")) {
      e.stopPropagation && e.stopPropagation();
      contentLogger.warn("[Content Script] Ignored benign error:", e.message);
    }
  });
  window.addEventListener("unhandledrejection", (e) => {
    if (e.reason && e.reason.message && e.reason.message.includes("Connection has been terminated")) {
      contentLogger.warn("[Content Script] Ignored unhandled rejection:", e.reason.message);
      e.preventDefault && e.preventDefault();
    }
  });
  var isRedditPage = window.location.hostname.includes("reddit.com");
  if (isRedditPage) {
    initializeRedditIntegration();
    initializeUsernameCache();
  }
  function removeBeforeUnloadListeners() {
    contentLogger.log(`Removing Reddit's beforeunload event listeners to prevent "Leave site?" dialog`);
    window.onbeforeunload = null;
    window.addEventListener("beforeunload", (e) => {
      e.preventDefault();
      e.returnValue = null;
      return null;
    }, true);
    contentLogger.log("Beforeunload listeners disabled successfully");
  }
  function initializeRedditIntegration() {
    contentLogger.log("Initializing Reddit integration");
    removeBeforeUnloadListeners();
    chrome.runtime.sendMessage({
      type: "CONTENT_SCRIPT_READY",
      url: window.location.href
    });
    let lastUrl = window.location.href;
    setInterval(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        contentLogger.log("URL Changed (Poller):", currentUrl);
        chrome.runtime.sendMessage({
          type: "URL_CHANGED",
          url: currentUrl
        }).catch((err) => {
          if (!err.message.includes("Extension context invalidated")) {
            contentLogger.warn("URL Poller error:", err);
          }
        });
      }
    }, 1e3);
    addExtensionButton();
    const recentMessages = /* @__PURE__ */ new Set();
    chrome.runtime.onMessage.addListener((message2, sender, sendResponse) => {
      contentLogger.log("Content script received message:", message2);
      if (message2.type === "PING") {
        sendResponse({ pong: true, url: window.location.href });
        return true;
      }
      if (message2.type === "START_POST_CREATION") {
        const msgKey = `${message2.type}-${message2.userName}-${JSON.stringify(message2.postData)}`;
        if (recentMessages.has(msgKey)) {
          contentLogger.log("Ignoring duplicate START_POST_CREATION message");
          sendResponse({ received: true, deduplicated: true });
          return true;
        }
        recentMessages.add(msgKey);
        setTimeout(() => recentMessages.delete(msgKey), 5e3);
      } else {
        const msgKey = `${message2.type}-recent`;
        if (recentMessages.has(msgKey)) {
          sendResponse({ received: true, deduplicated: true });
          return true;
        }
        recentMessages.add(msgKey);
        setTimeout(() => recentMessages.delete(msgKey), 500);
      }
      switch (message2.type) {
        case "REDDIT_PAGE_LOADED":
          handlePageLoaded(message2.url);
          break;
        case "FILL_POST_FORM":
          fillPostForm(message2.data);
          break;
        case "GET_PAGE_INFO":
          sendResponse(getPageInfo());
          break;
        case "START_POST_CREATION":
          handleStartPostCreation(message2.userName, message2.postData);
          break;
        case "EXTRACT_USERNAME_AND_CREATE_POST":
          handleExtractUsernameAndCreatePost();
          break;
        case "CHECK_USER_STATUS":
          handleCheckUserStatus(message2.userName);
          break;
        case "DELETE_LAST_POST":
          handleDeleteLastPost(message2.userName);
          sendResponse({ started: true });
          break;
        case "BG_LOG":
          contentLogger.log(`%c[BACKGROUND] ${message2.message}`, "color: #ff00ff; font-weight: bold;");
          break;
        case "REDDIT_POST_MACHINE_NAVIGATE_POSTS":
          contentLogger.log("[Content Script] Received command: NAVIGATE_POSTS", message2);
          sendResponse({ started: true });
          window.postMessage({
            type: "REDDIT_POST_MACHINE_NAVIGATE_POSTS",
            payload: message2.payload
          }, "*");
          break;
        case "REDDIT_POST_MACHINE_GET_POSTS":
          contentLogger.log("[Content Script] Received command: GET_POSTS", message2);
          sendResponse({ started: true });
          window.postMessage({
            type: "REDDIT_POST_MACHINE_GET_POSTS",
            payload: message2.payload
          }, "*");
          break;
        case "REDDIT_POST_MACHINE_NAVIGATE_PROFILE":
          contentLogger.log("[Content Script] Received command: NAVIGATE_PROFILE", message2);
          sendResponse({ started: true });
          handleCheckUserStatus(message2.payload.userName);
          break;
        case "REDDIT_POST_MACHINE_DELETE_POST":
          contentLogger.log("[Content Script] Received command: DELETE_POST", message2);
          sendResponse({ started: true });
          window.postMessage({
            type: "REDDIT_POST_MACHINE_DELETE_POST",
            payload: message2.payload
          }, "*");
          break;
        case "MANUAL_TRIGGER_SCRIPT":
          contentLogger.log("[Content Script] Received manual trigger:", message2);
          handleManualScriptTrigger(message2.scriptType, message2.mode);
          sendResponse({ started: true });
          break;
        case "GET_FRESH_POSTS_FOR_DECISION":
          contentLogger.log("[Content Script] Received GET_FRESH_POSTS_FOR_DECISION:", message2);
          handleGetFreshPostsForDecision(message2.userName);
          sendResponse({ started: true });
          break;
        case "REMOVE_BEFOREUNLOAD_LISTENERS":
          contentLogger.log("[Content Script] Received REMOVE_BEFOREUNLOAD_LISTENERS command");
          removeBeforeUnloadListeners();
          sendResponse({ success: true });
          break;
        default:
          contentLogger.warn("Unknown message type:", message2.type);
      }
      return true;
    });
  }
  function addExtensionButton() {
    const submitArea = document.querySelector('[data-testid="submit-page"]') || document.querySelector(".submit-page") || document.querySelector("#newlink");
    if (submitArea && !document.querySelector(".reddit-post-machine-btn")) {
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
    `;
      button.addEventListener("click", (e) => {
        e.preventDefault();
        openExtensionPopup();
      });
      submitArea.insertBefore(button, submitArea.firstChild);
      contentLogger.log("Reddit Post Machine button added");
    }
  }
  function openExtensionPopup() {
    chrome.runtime.sendMessage({
      type: "OPEN_EXTENSION",
      source: "content-script"
    });
  }
  function handlePageLoaded(url) {
    contentLogger.log("Reddit page loaded:", url);
    setTimeout(() => {
      addExtensionButton();
    }, 1e3);
    if (url.includes("reddit.com/submit")) {
      contentLogger.log("On submit page, checking for post data");
      const storedPostData = sessionStorage.getItem("reddit-post-machine-postdata");
      if (storedPostData) {
        const postData = JSON.parse(storedPostData);
        contentLogger.log("Found stored post data, continuing post creation:", postData);
        const userName = postData.userName || "User";
        showWelcomeMessage(userName);
        setTimeout(() => fillPostForm(postData), 1e3);
      } else {
        contentLogger.log("No stored post data found");
      }
    }
  }
  function fillPostForm(data) {
    contentLogger.log("Starting post creation with working logic:", data);
    createPostWithWorkingCode(data);
  }
  async function createPostWithWorkingCode(postData) {
    contentLogger.log("Creating post with working logic...");
    removeBeforeUnloadListeners();
    if (!window.location.href.includes("/submit")) {
      contentLogger.log("Redirecting to submission page...");
      window.location.href = "https://www.reddit.com/submit";
      await sleep(5e3);
    }
    contentLogger.log("Waiting for post creation page to load...");
    await sleep(2e3);
    removeBeforeUnloadListeners();
    contentLogger.log("=== STEP 1: TEXT TAB - Filling title ===");
    if (await clickTab("TEXT")) {
      await fillTitle(postData.title);
    } else {
      contentLogger.log("Cannot proceed without TEXT tab");
      return false;
    }
    contentLogger.log("=== STEP 2: LINK TAB - Filling URL ===");
    if (await clickTab("LINK")) {
      await fillUrl(postData.url);
    } else {
      contentLogger.log("Cannot proceed without LINK tab");
      return false;
    }
    contentLogger.log("=== STEP 3: Activating Post button by clicking body field ===");
    await clickBodyField();
    await sleep(1e3);
    contentLogger.log("=== STEP 4: Filling body text ===");
    await fillBodyText(postData.body || postData.description);
    contentLogger.log("=== STEP 5: Final activation click on body field ===");
    await clickBodyField();
    await sleep(1e3);
    contentLogger.log("=== STEP 6: Clicking Post button ===");
    const postClicked = await clickPostButton();
    if (postClicked) {
      contentLogger.log("Post button clicked, waiting for response...");
      const startTime = Date.now();
      const timeout = 3e4;
      while (Date.now() - startTime < timeout) {
        await sleep(1e3);
        if (!window.location.href.includes("/submit")) {
          contentLogger.log("SUCCESS: Redirected from submission page - post submitted!");
          chrome.runtime.sendMessage({
            type: "ACTION_COMPLETED",
            action: "POST_CREATION_COMPLETED",
            success: true
          }).catch((err) => {
            contentLogger.warn("Failed to notify background of completion:", err);
          });
          return true;
        }
        const errorMessages = qsAll('[role="alert"], .error-message, [class*="error"], [class*="moderator"]');
        for (const error of errorMessages) {
          const text = error.textContent?.toLowerCase() || "";
          if (text.includes("rule") || text.includes("violation") || text.includes("remove")) {
            contentLogger.log("Post rejected due to rule violations:", text.substring(0, 100));
            chrome.runtime.sendMessage({
              type: "ACTION_COMPLETED",
              action: "POST_CREATION_COMPLETED",
              success: false,
              error: "Post rejected due to rule violations"
            }).catch((err) => {
              contentLogger.warn("Failed to notify background of failure:", err);
            });
            return false;
          }
        }
        const loadingElements = qsAll('[data-testid*="loading"], .loading, [class*="loading"], [aria-busy="true"]');
        if (loadingElements.length > 0) {
          contentLogger.log("Post still being processed...");
          continue;
        }
      }
      contentLogger.log("Post submission timeout - status unclear");
      chrome.runtime.sendMessage({
        type: "ACTION_COMPLETED",
        action: "POST_CREATION_COMPLETED",
        success: false,
        error: "Post submission timeout"
      }).catch((err) => {
        contentLogger.warn("Failed to notify background of timeout:", err);
      });
      return false;
    } else {
      contentLogger.log("FAILED: Could not click Post button");
      chrome.runtime.sendMessage({
        type: "ACTION_COMPLETED",
        action: "POST_CREATION_COMPLETED",
        success: false,
        error: "Could not click Post button"
      }).catch((err) => {
        contentLogger.warn("Failed to notify background of button failure:", err);
      });
      return false;
    }
  }
  async function clickTab(tabValue) {
    contentLogger.log(`Clicking tab with data-select-value="${tabValue}"`);
    const tab = deepQuery(`[data-select-value="${tabValue}"]`);
    if (tab) {
      tab.click();
      await sleep(1e3);
      return true;
    }
    contentLogger.log(`Tab with data-select-value="${tabValue}" not found`);
    return false;
  }
  async function fillTitle(title) {
    contentLogger.log("Filling title...");
    const titleInputElement = deepQuery('faceplate-textarea-input[name="title"]');
    if (titleInputElement) {
      const shadowRoot = titleInputElement.shadowRoot;
      if (shadowRoot) {
        const titleInput = shadowRoot.querySelector("#innerTextArea");
        if (titleInput) {
          titleInput.focus();
          await sleep(200);
          titleInput.value = title || "Cute sphynx babies capture your heart";
          titleInput.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
          titleInput.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
          contentLogger.log("Title set");
          await sleep(500);
          return true;
        }
      }
    }
    contentLogger.log("Failed to fill title");
    return false;
  }
  async function fillUrl(url) {
    contentLogger.log("Filling URL...");
    const urlInputElement = deepQuery('faceplate-textarea-input[name="link"]');
    if (urlInputElement) {
      const shadowRoot = urlInputElement.shadowRoot;
      if (shadowRoot) {
        const urlInput = shadowRoot.querySelector("#innerTextArea");
        if (urlInput) {
          const targetUrl = url || "https://youtube.com/shorts/0xmhrS_VNNY?si=awYc8i5YljycesXq";
          urlInput.focus();
          await sleep(200);
          urlInput.value = targetUrl;
          urlInput.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
          urlInput.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
          contentLogger.log("URL set");
          await sleep(500);
          return true;
        }
      }
    }
    contentLogger.log("Failed to fill URL");
    return false;
  }
  async function clickBodyField() {
    contentLogger.log("Clicking body text field to activate Post button...");
    const bodyComposer = deepQuery('shreddit-composer[name="optionalBody"]');
    if (bodyComposer) {
      const bodyEditable = bodyComposer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]');
      if (bodyEditable) {
        contentLogger.log("Found Lexical editor, clicking to activate Post button...");
        bodyEditable.click();
        await sleep(100);
        bodyEditable.focus();
        await sleep(100);
        bodyEditable.click();
        bodyEditable.dispatchEvent(new Event("focus", { bubbles: true, cancelable: true }));
        bodyEditable.dispatchEvent(new Event("click", { bubbles: true, cancelable: true }));
        await sleep(1e3);
        return true;
      }
    }
    contentLogger.log("Body text field not found");
    return false;
  }
  async function fillBodyText(bodyText) {
    contentLogger.log("Filling body text...");
    const bodyComposer = deepQuery('shreddit-composer[name="optionalBody"]');
    if (bodyComposer) {
      const bodyEditable = bodyComposer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]');
      if (bodyEditable) {
        contentLogger.log("Found Lexical editor, setting text...");
        bodyEditable.focus();
        await sleep(200);
        bodyEditable.innerHTML = "<p><br></p>";
        const text = bodyText || "#shorts  #sphynx #missmermaid #kitten #cat";
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          bodyEditable.dispatchEvent(new KeyboardEvent("keydown", {
            key: char,
            code: char === " " ? "Space" : `Key${char.toUpperCase()}`,
            keyCode: char.charCodeAt(0),
            which: char.charCodeAt(0),
            bubbles: true,
            cancelable: true
          }));
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
          bodyEditable.dispatchEvent(new KeyboardEvent("keyup", {
            key: char,
            code: char === " " ? "Space" : `Key${char.toUpperCase()}`,
            keyCode: char.charCodeAt(0),
            which: char.charCodeAt(0),
            bubbles: true,
            cancelable: true
          }));
          await sleep(5);
        }
        bodyEditable.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
        contentLogger.log("Body text set successfully");
        await sleep(500);
        return true;
      }
    }
    contentLogger.log("Failed to find body editor");
    return false;
  }
  async function clickPostButton() {
    contentLogger.log("Clicking Post button...");
    removeBeforeUnloadListeners();
    const checkButtonActive = () => {
      const innerButton = deepQuery("#inner-post-submit-button");
      if (innerButton) {
        const isDisabled = innerButton.disabled || innerButton.getAttribute("aria-disabled") === "true";
        contentLogger.log("Inner post button active:", !isDisabled);
        return !isDisabled;
      }
      const postContainer2 = deepQuery("r-post-form-submit-button#submit-post-button");
      if (postContainer2 && postContainer2.shadowRoot) {
        const shadowButton = postContainer2.shadowRoot.querySelector("button");
        if (shadowButton) {
          const isShadowDisabled = shadowButton.disabled || shadowButton.getAttribute("aria-disabled") === "true";
          contentLogger.log("Shadow post button active:", !isShadowDisabled);
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
      contentLogger.log("Found active inner post button, clicking...");
      innerPostButton.click();
      return true;
    }
    const postContainer = deepQuery("r-post-form-submit-button#submit-post-button");
    if (postContainer) {
      contentLogger.log("Found post container");
      if (postContainer.shadowRoot) {
        const shadowButton = postContainer.shadowRoot.querySelector("button");
        if (shadowButton && !shadowButton.disabled) {
          contentLogger.log("Found active button in shadow DOM, clicking...");
          shadowButton.click();
          return true;
        }
      }
      contentLogger.log("Clicking post container directly");
      postContainer.click();
      return true;
    }
    const alternativeSelectors = [
      'button[type="submit"]',
      '[data-testid="submit-post"]',
      'button:contains("Post")',
      ".post-button"
    ];
    for (const selector of alternativeSelectors) {
      const button = deepQuery(selector);
      if (button && (button.textContent?.toLowerCase().includes("post") || button.textContent?.toLowerCase().includes("submit"))) {
        contentLogger.log(`Found post button with selector: ${selector}, clicking...`);
        button.click();
        return true;
      }
    }
    contentLogger.log("Post button not found with any selector");
    return false;
  }
  function getPageInfo() {
    const url = window.location.href;
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    let pageType = "unknown";
    if (pathname.includes("/submit")) {
      pageType = "submit";
    } else if (pathname.includes("/r/")) {
      pageType = "subreddit";
    } else if (pathname === "/" || pathname === "/hot" || pathname === "/new") {
      pageType = "home";
    }
    let currentSubreddit = null;
    const subredditMatch = pathname.match(/\/r\/([^\/]+)/);
    if (subredditMatch) {
      currentSubreddit = subredditMatch[1];
    }
    return {
      url,
      hostname,
      pathname,
      pageType,
      currentSubreddit,
      isLoggedIn: checkIfLoggedIn()
    };
  }
  function qs(s, r = document) {
    try {
      return (r || document).querySelector(s);
    } catch {
      return null;
    }
  }
  function qsAll(s, r = document) {
    try {
      return Array.from((r || document).querySelectorAll(s));
    } catch {
      return [];
    }
  }
  async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
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
  async function waitForElements(selector, timeout = 5e3) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0)
        return Array.from(elements);
      await sleep(100);
    }
    return [];
  }
  async function openUserDropdown() {
    contentLogger.log("Opening user dropdown...");
    const selectors = [
      "rpl-dropdown div",
      '[data-testid="user-avatar"]',
      'button[aria-label*="user"]',
      "#expand-user-drawer-button",
      'button[data-testid="user-menu-trigger"]',
      '[data-click-id="profile"]',
      'button[id*="user-dropdown"]',
      'button[aria-haspopup="true"]',
      ".header-user-dropdown",
      'button[aria-label*="User"]',
      'button[title*="profile"]'
    ];
    for (const selector of selectors) {
      const avatarButton = qs(selector);
      if (avatarButton) {
        contentLogger.log(`Found avatar button with selector: ${selector}`);
        contentLogger.log("Avatar button element:", avatarButton);
        avatarButton.click();
        await sleep(2e3);
        return true;
      }
    }
    contentLogger.log("Avatar button not found with any selector");
    const allButtons = document.querySelectorAll("button");
    contentLogger.log("All buttons on page:", allButtons.length);
    allButtons.forEach((btn, i) => {
      if (i < 10) {
        contentLogger.log(`Button ${i}:`, btn.outerHTML.substring(0, 200));
      }
    });
    return false;
  }
  var cachedUsername = null;
  var cacheTimestamp = 0;
  var CACHE_DURATION = 5 * 60 * 1e3;
  async function initializeUsernameCache() {
    try {
      const storedUser = await getStoredUsername();
      if (storedUser && storedUser.seren_name) {
        cachedUsername = storedUser.seren_name;
        cacheTimestamp = storedUser.timestamp || Date.now();
        contentLogger.log(`Initialized cache from storage: ${cachedUsername}`);
      }
    } catch (error) {
      contentLogger.warn("Failed to initialize username cache:", error);
    }
  }
  async function getAuthenticatedUsername() {
    if (cachedUsername && Date.now() - cacheTimestamp < CACHE_DURATION) {
      contentLogger.log(`Using cached authenticated username: ${cachedUsername}`);
      return cachedUsername;
    }
    const authSelectors = [
      'button[id*="user-dropdown"] [class*="text-12"]',
      '[data-testid="user-menu-trigger"] span[class*="text-12"]',
      '.header-user-dropdown [class*="text-12"]',
      'button[aria-label*="User"] span[class*="text-12"]'
    ];
    for (const selector of authSelectors) {
      const element = qs(selector);
      if (element) {
        const text = element.textContent?.trim();
        if (text && text.startsWith("u/")) {
          cachedUsername = text;
          cacheTimestamp = Date.now();
          return text;
        }
      }
    }
    if (await openUserDropdown()) {
      await sleep(2e3);
      const dropdownSelectors = [
        "span.text-12.text-secondary-weak",
        '[id*="user-drawer"] span[class*="text-12"]',
        ".text-12"
      ];
      for (const selector of dropdownSelectors) {
        const elements = await waitForElements(selector, 3e3);
        for (const element of elements) {
          const text = element.textContent?.trim();
          if (text && text.startsWith("u/")) {
            document.body.click();
            await sleep(500);
            cachedUsername = text;
            cacheTimestamp = Date.now();
            return text;
          }
        }
      }
    }
    return null;
  }
  async function isOwnProfilePage(username) {
    const ownProfileIndicators = [
      'button[data-testid="edit-profile-button"]',
      'a[href*="/settings/profile"]',
      'a[href*="/r/ModTool"]',
      '[data-click-id="user_profile"]'
    ];
    for (const selector of ownProfileIndicators) {
      const element = qs(selector);
      if (element) {
        contentLogger.log("Found own profile indicator, this is our profile");
        return true;
      }
    }
    const buttons = document.querySelectorAll("button");
    for (const button of buttons) {
      const text = button.textContent?.trim().toLowerCase();
      if (text && (text.includes("edit profile") || text.includes("edit flair"))) {
        contentLogger.log("Found edit profile button by text content, this is our profile");
        return true;
      }
    }
    if (cachedUsername && Date.now() - cacheTimestamp < CACHE_DURATION) {
      const cleanAuthUsername = cachedUsername.replace("u/", "");
      return cleanAuthUsername === username;
    }
    return false;
  }
  var isExtractingUsername = false;
  async function extractUsernameFromPage() {
    contentLogger.log("Extracting username from Reddit page using multiple methods...");
    if (isExtractingUsername) {
      contentLogger.log("Username extraction already in progress, skipping...");
      return null;
    }
    isExtractingUsername = true;
    try {
      const authUsername = await getAuthenticatedUsername();
      if (authUsername) {
        contentLogger.log(`Found authenticated username: ${authUsername}`);
        await storeUsernameInStorage(authUsername);
        return authUsername;
      }
      const urlMatch = window.location.pathname.match(/\/u\/([^\/]+)/);
      if (urlMatch && await isOwnProfilePage(urlMatch[1])) {
        const username = `u/${urlMatch[1]}`;
        contentLogger.log(`Found username from own profile URL: ${username}`);
        await storeUsernameInStorage(username);
        return username;
      }
      const usernameSelectors = [
        'span[id*="user-"]',
        '[data-testid*="user"]',
        'a[href*="/u/"]',
        ".header-user-dropdown .text-12",
        '[aria-label*="u/"]'
      ];
      for (const selector of usernameSelectors) {
        const elements = qsAll(selector);
        for (const element of elements) {
          const text = element.textContent?.trim() || element.getAttribute("aria-label") || element.href;
          if (text && text.includes("u/")) {
            const match = text.match(/u\/([a-zA-Z0-9_-]+)/);
            if (match) {
              const username = `u/${match[1]}`;
              contentLogger.log(`Found username from page element fallback: ${username}`);
              if (!cachedUsername) {
                await storeUsernameInStorage(username);
              }
              return username;
            }
          }
        }
      }
      contentLogger.log("All methods failed, trying profile page navigation fallback...");
      return await tryProfilePageFallback();
    } finally {
      isExtractingUsername = false;
    }
  }
  async function tryProfilePageFallback() {
    contentLogger.log("Attempting profile page navigation fallback...");
    const profileLinks = document.querySelectorAll('a[href*="/user/"], a[href*="/u/"]');
    if (profileLinks.length > 0) {
      const profileUrl = profileLinks[0].href;
      contentLogger.log(`Found profile link: ${profileUrl}`);
      const urlMatch = profileUrl.match(/\/(user|u)\/([^\/]+)/);
      if (urlMatch) {
        const username = `u/${urlMatch[2]}`;
        contentLogger.log(`Extracted username from profile link: ${username}`);
        await storeUsernameInStorage(username);
        return username;
      }
    }
    contentLogger.log("No profile link found, trying dropdown with extended wait...");
    if (await openUserDropdown()) {
      await sleep(3e3);
      const dropdownSelectors = [
        "span.text-12.text-secondary-weak",
        '[id*="user-drawer"] span[class*="text-12"]',
        ".text-12"
      ];
      for (const selector of dropdownSelectors) {
        const elements = await waitForElements(selector, 5e3);
        for (const element of elements) {
          const text = element.textContent?.trim();
          if (text && text.startsWith("u/")) {
            document.body.click();
            await sleep(500);
            cachedUsername = text;
            cacheTimestamp = Date.now();
            await storeUsernameInStorage(text);
            contentLogger.log(`Found username with extended wait: ${text}`);
            return text;
          }
        }
      }
    }
    contentLogger.log("Could not extract username using any method");
    return null;
  }
  async function storeUsernameInStorage(username) {
    try {
      const data = {
        seren_name: username,
        timestamp: Date.now(),
        pageUrl: window.location.href
      };
      await chrome.storage.sync.set({ redditUser: data });
      contentLogger.log(`Stored seren_name in Chrome storage: ${username}`);
      await chrome.storage.local.set({ redditUser: data });
      await chrome.runtime.sendMessage({
        type: "USERNAME_STORED",
        username,
        timestamp: Date.now()
      });
    } catch (error) {
      contentLogger.error("Failed to store username in Chrome storage:", error);
    }
  }
  async function getStoredUsername() {
    try {
      const syncResult = await chrome.storage.sync.get(["redditUser"]);
      if (syncResult.redditUser && syncResult.redditUser.seren_name) {
        contentLogger.log(`Retrieved seren_name from sync storage: ${syncResult.redditUser.seren_name}`);
        return syncResult.redditUser;
      }
      const localResult = await chrome.storage.local.get(["redditUser"]);
      if (localResult.redditUser && localResult.redditUser.seren_name) {
        contentLogger.log(`Retrieved seren_name from local storage: ${localResult.redditUser.seren_name}`);
        return localResult.redditUser;
      }
      contentLogger.log("No stored username found");
      return null;
    } catch (error) {
      contentLogger.error("Failed to retrieve username from Chrome storage:", error);
      return null;
    }
  }
  function checkIfLoggedIn() {
    contentLogger.log("Checking if user is logged in using proven method...");
    const avatarButton = qs('rpl-dropdown div, [data-testid="user-avatar"], button[aria-label*="user"], #expand-user-drawer-button');
    if (avatarButton) {
      contentLogger.log("Found user avatar button - user is logged in");
      return true;
    }
    const loginButtons = qsAll('a[href*="login"], button[title*="Log In"], a[href*="register"]');
    if (loginButtons.length > 0) {
      contentLogger.log("Found login buttons - user is not logged in");
      return false;
    }
    contentLogger.log("Could not determine login status");
    return false;
  }
  async function handleExtractUsernameAndCreatePost() {
    contentLogger.log("Extracting username and creating post...");
    if (!checkIfLoggedIn()) {
      contentLogger.log("User is not logged in to Reddit");
      showLoginMessage();
      return;
    }
    const username = await extractUsernameFromPage();
    if (username) {
      contentLogger.log(`Extracted username: ${username}`);
      sessionStorage.setItem("reddit-post-machine-username", username);
    } else {
      contentLogger.log("Could not extract username from page");
      showUsernameNotFoundMessage();
      return;
    }
  }
  function showLoginMessage() {
    const messageDiv = createMessageDiv("\u26A0\uFE0F", "Please Log In", "You need to be logged in to Reddit to create posts.", "#f57c00");
    showTemporaryMessage(messageDiv);
  }
  function showUsernameNotFoundMessage() {
    const messageDiv = createMessageDiv("\u2753", "Username Not Found", "Could not detect your Reddit username. Please make sure you are logged in.", "#d32f2f");
    showTemporaryMessage(messageDiv);
  }
  function createMessageDiv(icon, title, message2, color) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "reddit-post-machine-message";
    messageDiv.innerHTML = `
    <div style="
      background: ${color};
      color: white;
      padding: 16px;
      margin: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 10000;
      min-width: 300px;
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 24px;">${icon}</div>
        <div>
          <div style="font-weight: bold; font-size: 16px;">${title}</div>
          <div style="font-size: 14px; opacity: 0.9;">${message2}</div>
        </div>
      </div>
    </div>
  `;
    return messageDiv;
  }
  function showTemporaryMessage(messageDiv) {
    document.body.appendChild(messageDiv);
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
        messageDiv.style.opacity = "0";
        messageDiv.style.transform = "translateX(-100%)";
        setTimeout(() => messageDiv.remove(), 500);
      }
    }, 4e3);
  }
  async function runProfileDetectionScript() {
    contentLogger.log("=== PROFILE DETECTION SCRIPT STARTED ===");
    try {
      await waitForCondition(() => {
        return document.querySelector('button[data-testid="user-menu-trigger"]') || document.querySelector('[data-testid="user-avatar"]') || document.querySelector(".header-user-dropdown") || qs('a[href*="/u/"]');
      }, 5e3, 500);
      const username = await extractUsernameFromPage();
      if (!username) {
        contentLogger.log("Profile script: Could not detect username - will retry after navigation");
        sessionStorage.removeItem("reddit-post-machine-script-stage");
        return;
      }
      contentLogger.log(`Profile script: Detected username ${username}`);
      if (!window.location.href.includes(username.replace("u/", ""))) {
        contentLogger.log(`Profile script: Navigating to ${username} profile`);
        sessionStorage.setItem("reddit-post-machine-script-stage", "profile-navigating");
        window.location.href = `https://www.reddit.com/${username}`;
        return;
      }
      await switchToPostsTab();
      const postsData = await capturePostsData(username);
      await storeProfileData(username, postsData);
      sessionStorage.removeItem("reddit-post-machine-script-stage");
      contentLogger.log("=== PROFILE DETECTION SCRIPT COMPLETED ===");
    } catch (error) {
      contentLogger.error("Profile detection script error:", error);
      sessionStorage.removeItem("reddit-post-machine-script-stage");
    }
  }
  async function switchToPostsTab() {
    contentLogger.log("Switching to posts tab...");
    const postsTabSelectors = [
      'a[href*="/submitted"]',
      'button[data-tab="posts"]',
      'a:contains("Posts")',
      'span:contains("Posts")',
      '[data-testid="posts-tab"]'
    ];
    for (const selector of postsTabSelectors) {
      const element = qs(selector);
      if (element) {
        contentLogger.log(`Found posts tab with selector: ${selector}`);
        element.click();
        await sleep(2e3);
        return true;
      }
    }
    const currentUrl = window.location.href;
    const usernameMatch = currentUrl.match(/\/u\/([^\/]+)/);
    if (usernameMatch) {
      const postsUrl = `https://www.reddit.com/u/${usernameMatch[1]}/submitted`;
      contentLogger.log(`Navigating directly to posts URL: ${postsUrl}`);
      sessionStorage.setItem("reddit-post-machine-script-stage", "profile-switching-to-posts");
      window.location.href = postsUrl;
      return true;
    }
    contentLogger.log("Could not find posts tab");
    return false;
  }
  async function capturePostsData(username) {
    contentLogger.log("Capturing posts data...");
    const posts = [];
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts && posts.length === 0) {
      const postElements = document.querySelectorAll('[data-testid="post-container"], article, div[data-click-id="text"]');
      for (const element of postElements.slice(0, 10)) {
        try {
          const titleElement = element.querySelector('h3, [data-testid="post-title"], a[href*="/comments/"]');
          const scoreElement = element.querySelector('[data-testid="post-vote-score"], div:contains("vote")');
          const commentsElement = element.querySelector('a[href*="/comments/"] span');
          const linkElement = element.querySelector('a[href*="/comments/"]');
          if (titleElement) {
            const post = {
              elementId: element.getAttribute("id") || "",
              element: {
                id: element.getAttribute("id") || "",
                tagName: element.tagName || "DIV"
              },
              id: element.getAttribute("id") || "",
              title: titleElement.textContent?.trim() || "",
              url: linkElement?.href || "",
              timestamp: Date.now(),
              author: username,
              subreddit: element.getAttribute("subreddit-prefixed-name") || "",
              score: parseInt(scoreElement?.textContent?.trim()) || 0,
              commentCount: parseInt(commentsElement?.textContent?.trim()) || 0,
              comments: commentsElement?.textContent?.trim() || "0",
              postType: element.getAttribute("post-type") || "",
              domain: element.getAttribute("domain") || "",
              contentHref: element.getAttribute("content-href") || "",
              itemState: element.getAttribute("item-state") || "",
              viewContext: element.getAttribute("view-context") || "",
              voteType: element.getAttribute("vote-type") || "",
              moderationStatus: {
                isRemoved: element.textContent?.includes("removed by the moderators") || element.querySelector('[icon-name="remove"]') !== null || element.getAttribute("item-state") === "moderator_removed" || false,
                isLocked: element.querySelector('[icon-name="lock-fill"]') !== null || element.getAttribute("item-state") === "locked" || false,
                isDeleted: element.textContent?.includes("deleted by the user") || element.querySelector('[icon-name="delete"]') !== null || element.getAttribute("item-state") === "deleted" || false,
                isSpam: element.getAttribute("item-state") === "spam" || false,
                itemState: element.getAttribute("item-state") || "",
                viewContext: element.getAttribute("view-context") || "",
                voteType: element.getAttribute("vote-type") || ""
              },
              userId: element.getAttribute("user-id") || "",
              permalink: element.getAttribute("permalink") || "",
              createdTimestamp: element.getAttribute("created-timestamp") || Date.now(),
              username
            };
            posts.push(post);
          }
        } catch (error) {
          contentLogger.warn("Error parsing post element:", error);
        }
      }
      if (posts.length === 0) {
        contentLogger.log(`No posts found, attempt ${attempts + 1}/${maxAttempts}`);
        await sleep(1e3);
        attempts++;
      }
    }
    contentLogger.log(`Captured ${posts.length} posts`);
    return posts;
  }
  async function storeProfileData(username, postsData) {
    try {
      const profileData = {
        username,
        posts: postsData,
        lastUpdated: Date.now(),
        pageUrl: window.location.href
      };
      await chrome.storage.local.set({ redditProfileData: profileData });
      await chrome.storage.sync.set({ redditProfileData: profileData });
      contentLogger.log(`Stored profile data for ${username} with ${postsData.length} posts`);
      chrome.runtime.sendMessage({
        type: "PROFILE_DATA_STORED",
        username,
        postsCount: postsData.length
      }).catch(() => {
      });
    } catch (error) {
      contentLogger.error("Failed to store profile data:", error);
    }
  }
  async function runPostSubmissionScript() {
    contentLogger.log("=== POST SUBMISSION SCRIPT STARTED ===");
    try {
      const tabStateResponse = await chrome.runtime.sendMessage({
        type: "GET_TAB_STATE"
      });
      if (tabStateResponse.success && tabStateResponse.isBackgroundPostTab) {
        contentLogger.log("Skipping auto-run post submission - this tab was created by background script");
        return;
      }
      await ensureSubmitPageReady();
      const postData = await fetchPostDataForSubmission();
      if (!postData) {
        contentLogger.log("Post submission script: No post data available");
        return;
      }
      contentLogger.log("Post submission script: Got post data:", postData.title);
      await fillPostFieldsSequentially(postData);
      const submitSuccess = await submitPost();
      if (submitSuccess) {
        contentLogger.log("Post submitted successfully, waiting 10 seconds...");
        await sleep(1e4);
        sessionStorage.removeItem("reddit-post-machine-postdata");
        contentLogger.log("Closing tab after successful submission");
        chrome.runtime.sendMessage({
          type: "CLOSE_CURRENT_TAB"
        }).catch(() => {
          window.close();
        });
      } else {
        contentLogger.log("Post submission failed");
        sessionStorage.removeItem("reddit-post-machine-postdata");
      }
      contentLogger.log("=== POST SUBMISSION SCRIPT COMPLETED ===");
    } catch (error) {
      contentLogger.error("Post submission script error:", error);
    }
  }
  async function ensureSubmitPageReady() {
    contentLogger.log("Ensuring submit page is ready...");
    const maxWaitTime = 1e4;
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitTime) {
      const titleInput = deepQuery('faceplate-textarea-input[name="title"]');
      const postButton = deepQuery("#inner-post-submit-button, r-post-form-submit-button");
      if (titleInput && postButton) {
        contentLogger.log("Submit page is ready");
        removeBeforeUnloadListeners();
        return true;
      }
      await sleep(500);
    }
    throw new Error("Submit page did not become ready in time");
  }
  async function fetchPostDataForSubmission() {
    const storedData = sessionStorage.getItem("reddit-post-machine-postdata");
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (error) {
        contentLogger.warn("Failed to parse stored post data");
      }
    }
    throw new Error("No post data found - script may be running incorrectly");
  }
  async function fillPostFieldsSequentially(postData) {
    contentLogger.log("Filling post fields sequentially...");
    contentLogger.log("Step 1: Filling title");
    await clickTab("TEXT");
    await fillTitle(postData.title);
    contentLogger.log("Step 2: Filling URL");
    await clickTab("LINK");
    await fillUrl(postData.url);
    contentLogger.log("Step 3: Activating post button");
    await clickBodyField();
    contentLogger.log("Step 4: Filling body text");
    await fillBodyText(postData.body);
    contentLogger.log("Step 5: Final activation");
    await clickBodyField();
    contentLogger.log("All fields filled sequentially");
  }
  async function submitPost() {
    contentLogger.log("Submitting post...");
    const postClicked = await clickPostButton();
    if (postClicked) {
      const startTime = Date.now();
      const timeout = 15e3;
      while (Date.now() - startTime < timeout) {
        await sleep(1e3);
        if (!window.location.href.includes("/submit")) {
          contentLogger.log("Post submitted successfully");
          return true;
        }
        const errorElements = qsAll('[role="alert"], .error-message, [class*="error"]');
        for (const error of errorElements) {
          const text = error.textContent?.toLowerCase() || "";
          if (text.includes("error") || text.includes("rule") || text.includes("violation")) {
            contentLogger.log("Post submission failed:", text);
            return false;
          }
        }
      }
      contentLogger.log("Post submission timed out");
      return false;
    }
    contentLogger.log("Could not click post button");
    return false;
  }
  async function handleManualScriptTrigger(scriptType, mode) {
    contentLogger.log(`=== MANUAL TRIGGER: ${scriptType} (mode: ${mode}) ===`);
    try {
      if (scriptType === "profile") {
        sessionStorage.removeItem("reddit-post-machine-script-stage");
        contentLogger.log("Manually triggering profile detection script");
        await runProfileDetectionScript();
      } else if (scriptType === "post") {
        contentLogger.log("Manually triggering post submission script");
        await runPostSubmissionScript();
      } else {
        contentLogger.warn("Unknown script type for manual trigger:", scriptType);
      }
      contentLogger.log(`=== MANUAL TRIGGER COMPLETED: ${scriptType} ===`);
    } catch (error) {
      contentLogger.error(`Manual trigger error for ${scriptType}:`, error);
    }
  }
  function handleStartPostCreation(userName, postData) {
    if (postData) {
      sessionStorage.setItem("reddit-post-machine-postdata", JSON.stringify(postData));
    }
    const avatarButton = qs('rpl-dropdown div, [data-testid="user-avatar"], button[aria-label*="user"], #expand-user-drawer-button');
    if (avatarButton) {
    } else {
      return;
    }
    contentLogger.log("Requesting background script to create new post tab");
    chrome.runtime.sendMessage({
      type: "CREATE_POST_TAB",
      postData
    }).then((response) => {
      if (response.success) {
        contentLogger.log("Background script created post tab successfully:", response.tabId);
      } else {
        contentLogger.error("Failed to create post tab:", response.error);
      }
    }).catch((error) => {
      contentLogger.error("Error requesting post tab creation:", error);
    });
  }
  function showWelcomeMessage(userName) {
    const existingMessage = document.querySelector(".reddit-post-machine-welcome");
    if (existingMessage) {
      existingMessage.remove();
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initializeRedditIntegration();
      checkForStoredUsername();
      checkForStoredPostData();
      setTimeout(() => {
        tryAutoDetectUsername();
      }, 3e3);
    });
  } else {
    initializeRedditIntegration();
    checkForStoredUsername();
    checkForStoredPostData();
    setTimeout(() => {
      tryAutoDetectUsername();
    }, 3e3);
  }
  async function tryAutoDetectUsername() {
    contentLogger.log("Auto-detecting username on page load...");
    const storedUser = await getStoredUsername();
    if (storedUser && storedUser.seren_name) {
      contentLogger.log("Already have stored username:", storedUser.seren_name);
      return;
    }
    const username = await extractUsernameFromPage();
    if (username) {
      contentLogger.log("Successfully auto-detected username:", username);
      const messageDiv = createMessageDiv("\u2705", "Username Detected", `Successfully detected: ${username}`, "#4caf50");
      showTemporaryMessage(messageDiv);
    } else {
      contentLogger.log("Could not auto-detect username");
    }
  }
  function checkForStoredUsername() {
    setTimeout(() => {
      const storedUsername = sessionStorage.getItem("reddit-post-machine-username");
      if (storedUsername && window.location.pathname.includes("/submit")) {
        contentLogger.log(`Using stored username: ${storedUsername}`);
        showWelcomeMessage(storedUsername);
        sessionStorage.removeItem("reddit-post-machine-username");
      }
    }, 1e3);
  }
  window.addEventListener("message", async (event) => {
    if (event.data.type === "REDDIT_POST_MACHINE_ACTION_RESULT") {
      const { action, success, data } = event.data;
      contentLogger.log(`Action Result: ${action} Success: ${success}`, data);
      try {
        chrome.runtime.sendMessage({
          type: "ACTION_COMPLETED",
          action,
          success,
          data
        }).catch((err) => {
          if (!err.message.includes("Extension context invalidated")) {
            contentLogger.warn("[Content Script] Failed to send ACTION_COMPLETED:", err);
          }
        });
      } catch (e) {
        contentLogger.warn("[Content Script] Error sending message:", e);
      }
      if (!success) {
        const messageDiv = createMessageDiv("\u274C", "Action Failed", `Step ${action} failed.`, "#d32f2f");
        showTemporaryMessage(messageDiv);
      } else if (action === "GET_POSTS") {
        const storageData = {
          userName: message.payload.userName,
          postsInfo: data,
          lastUpdated: Date.now()
        };
        chrome.storage.local.set({ "latestPostsData": storageData }, () => {
          contentLogger.log("Posts data saved to local storage", storageData);
          chrome.runtime.sendMessage({
            type: "POSTS_UPDATED",
            data: storageData
          }).catch(() => {
          });
        });
        saveUserStatusToStorage(data.userName || "User", data);
      }
    }
  });
  function checkForStoredPostData() {
    setTimeout(() => {
      const storedData = sessionStorage.getItem("reddit-post-machine-postdata");
      if (storedData && window.location.pathname.includes("/submit")) {
        contentLogger.log("Found stored post data, attempting to fill form...");
        try {
          const postData = JSON.parse(storedData);
          fillPostForm(postData);
          sessionStorage.removeItem("reddit-post-machine-postdata");
        } catch (e) {
          contentLogger.error("Error parsing stored post data", e);
        }
      }
    }, 2e3);
  }
  async function handleCheckUserStatus(userName) {
    contentLogger.log(`Checking user status for: ${userName}`);
    const statusDiv = createMessageDiv("\u{1F50D}", "Checking Status", `Checking status for ${userName}...`, "#2196f3");
    showTemporaryMessage(statusDiv);
    window.postMessage({
      type: "REDDIT_POST_MACHINE_NAVIGATE_PROFILE",
      payload: { userName }
    }, "*");
  }
  function checkAccountLocked() {
    const phrases = ["we've locked your account", "locked your account", "account suspended"];
    const pageText = document.body.textContent.toLowerCase();
    const hasLockedPhrase = phrases.some((phrase) => pageText.includes(phrase));
    const errorBanners = qsAll('faceplate-banner[appearance="error"]');
    const hasLockedBanner = errorBanners.some((el) => el.textContent?.toLowerCase().includes("locked") || el.textContent?.toLowerCase().includes("suspended"));
    return hasLockedPhrase || hasLockedBanner;
  }
  async function waitForCondition(conditionFn, timeout = 1e4, interval = 500) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await conditionFn())
        return true;
      await sleep(interval);
    }
    return false;
  }
  async function checkUserPosts() {
    contentLogger.log("Checking user posts...");
    let posts = [];
    await waitForCondition(() => {
      posts = qsAll('shreddit-post, [data-testid="post-container"], .Post, [data-testid*="post"]');
      return posts.length > 0;
    }, 5e3, 500);
    contentLogger.log(`Found ${posts.length} posts`);
    if (posts.length > 0) {
      const postsWithDates = posts.map((post) => {
        const timestamp = post.getAttribute("created-timestamp") || post.querySelector('time, [data-testid="post_timestamp"]')?.getAttribute("datetime") || post.querySelector('span[data-testid="post_timestamp"]')?.textContent || post.querySelector("time")?.getAttribute("datetime");
        const enhancedPost = {
          elementId: post.getAttribute("id") || "",
          element: {
            id: post.getAttribute("id") || "",
            tagName: post.tagName || "shreddit-post"
          },
          id: post.getAttribute("id") || "",
          title: post.getAttribute("post-title") || post.querySelector('h3, [data-testid="post-title"]')?.textContent?.trim() || "",
          url: post.getAttribute("permalink") || post.querySelector('a[href*="/comments/"]')?.href || "",
          timestamp,
          author: post.getAttribute("author") || "",
          subreddit: post.getAttribute("subreddit-prefixed-name") || "",
          authorId: post.getAttribute("author-id") || "",
          subredditId: post.getAttribute("subreddit-id") || "",
          score: parseInt(post.getAttribute("score")) || 0,
          commentCount: parseInt(post.getAttribute("comment-count")) || 0,
          awardCount: parseInt(post.getAttribute("award-count")) || 0,
          postType: post.getAttribute("post-type") || "",
          domain: post.getAttribute("domain") || "",
          contentHref: post.getAttribute("content-href") || "",
          itemState: post.getAttribute("item-state") || "",
          viewContext: post.getAttribute("view-context") || "",
          voteType: post.getAttribute("vote-type") || "",
          moderationStatus: {
            isRemoved: post.textContent?.includes("removed by the moderators") || post.querySelector('[icon-name="remove"]') !== null || post.getAttribute("item-state") === "moderator_removed" || false,
            isLocked: post.querySelector('[icon-name="lock-fill"]') !== null || post.getAttribute("item-state") === "locked" || false,
            isDeleted: post.textContent?.includes("deleted by the user") || post.querySelector('[icon-name="delete"]') !== null || post.getAttribute("item-state") === "deleted" || false,
            isSpam: post.getAttribute("item-state") === "spam" || false,
            itemState: post.getAttribute("item-state") || "",
            viewContext: post.getAttribute("view-context") || "",
            voteType: post.getAttribute("vote-type") || ""
          },
          userId: post.getAttribute("user-id") || "",
          permalink: post.getAttribute("permalink") || "",
          createdTimestamp: post.getAttribute("created-timestamp") || timestamp,
          _domElement: post
        };
        return enhancedPost;
      }).filter((post) => post.timestamp);
      postsWithDates.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      contentLogger.log("=== POSTS SUMMARY ===");
      contentLogger.log(`Total posts: ${posts.length}`);
      postsWithDates.forEach((post, index) => {
        contentLogger.log(`Post ${index + 1}: ${post.timestamp}`);
      });
      if (postsWithDates.length > 0) {
        contentLogger.log(`Last post date: ${postsWithDates[0].timestamp}`);
        return {
          total: postsWithDates.length,
          lastPostDate: postsWithDates[0].timestamp,
          posts: postsWithDates.map((post) => ({
            ...post,
            element: {
              id: post.element.id,
              tagName: post.element.tagName
            },
            _domElement: post._domElement
          }))
        };
      }
    } else {
      contentLogger.log("No posts found");
    }
    return {
      total: 0,
      lastPostDate: null,
      posts: []
    };
  }
  async function saveUserStatusToStorage(userName, postsInfo) {
    contentLogger.log("=== USER STATUS RESULTS ===");
    contentLogger.log(`User: ${userName}`);
    contentLogger.log(`Total posts: ${postsInfo.total}`);
    contentLogger.log(`Last post date: ${postsInfo.lastPostDate || "Not available"}`);
    let lastPostText = "No posts found";
    if (postsInfo.lastPostDate) {
      try {
        const lastPostDate = new Date(postsInfo.lastPostDate);
        const now = new Date();
        const diffTime = Math.abs(now - lastPostDate);
        const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
        if (diffDays === 1) {
          lastPostText = "Yesterday";
        } else if (diffDays < 7) {
          lastPostText = `${diffDays} days ago`;
        } else if (diffDays < 30) {
          const weeks = Math.ceil(diffDays / 7);
          lastPostText = `${weeks} week${weeks > 1 ? "s" : ""} ago`;
        } else {
          lastPostText = lastPostDate.toLocaleDateString();
        }
      } catch (error) {
        lastPostText = postsInfo.lastPostDate;
      }
    }
    const userStatusData = {
      userName,
      currentUser: userName,
      storedUser: userName,
      isMatch: true,
      postsCount: postsInfo.total,
      lastPostDate: postsInfo.lastPostDate,
      lastPostText,
      timestamp: Date.now(),
      checkUrl: window.location.href,
      lastCheck: Date.now(),
      statusMessage: "Posts data collected successfully"
    };
    try {
      await chrome.storage.sync.set({ userStatus: userStatusData });
      await chrome.storage.local.set({ userStatus: userStatusData });
      contentLogger.log("User status saved to Chrome storage:", userStatusData);
      const messageDiv = createMessageDiv("\u2705", "Saved", "User status data saved successfully", "#4caf50");
      showTemporaryMessage(messageDiv);
      await chrome.runtime.sendMessage({
        type: "USER_STATUS_SAVED",
        data: userStatusData
      });
    } catch (error) {
      contentLogger.error("Failed to save user status to Chrome storage:", error);
      const messageDiv = createMessageDiv("\u274C", "Save Failed", "Failed to save user status data", "#d32f2f");
      showTemporaryMessage(messageDiv);
    }
  }
  async function handleDeleteLastPost(userName) {
    contentLogger.log(`Deleting last post for: ${userName}`);
    const statusDiv = createMessageDiv("\u{1F5D1}\uFE0F", "Deleting Post", `Finding and deleting last post for ${userName}...`, "#ff5722");
    showTemporaryMessage(statusDiv);
    try {
      if (checkAccountLocked()) {
        contentLogger.log("Account locked");
        const messageDiv = createMessageDiv("\u{1F512}", "Account Locked", "Your Reddit account appears to be locked or suspended.", "#d32f2f");
        showTemporaryMessage(messageDiv);
        return;
      }
      const postsInfo = await checkUserPosts();
      if (postsInfo.total === 0) {
        const messageDiv = createMessageDiv("\u2139\uFE0F", "No Posts Found", "No posts found to delete.", "#2196f3");
        showTemporaryMessage(messageDiv);
        return;
      }
      const mostRecentPost = postsInfo.posts[0];
      if (!mostRecentPost || !mostRecentPost._domElement && !mostRecentPost.element) {
        const messageDiv = createMessageDiv("\u274C", "Post Not Found", "Could not find the most recent post.", "#ff5722");
        showTemporaryMessage(messageDiv);
        return;
      }
      const deleteSuccess = await deletePost(mostRecentPost._domElement || mostRecentPost.element);
      if (deleteSuccess) {
        const messageDiv = createMessageDiv("\u2705", "Post Deleted", "Last post has been successfully deleted!", "#4caf50");
        showTemporaryMessage(messageDiv);
        chrome.runtime.sendMessage({
          type: "ACTION_COMPLETED",
          action: "DELETE_POST_COMPLETED",
          success: true,
          postId: mostRecentPost.id || null,
          redditUrl: mostRecentPost.url || null,
          title: mostRecentPost.title || null
        }).catch(() => {
        });
      } else {
        const messageDiv = createMessageDiv("\u274C", "Delete Failed", "Could not delete the post. Please try manually.", "#ff5722");
        showTemporaryMessage(messageDiv);
        chrome.runtime.sendMessage({
          type: "ACTION_COMPLETED",
          action: "DELETE_POST_COMPLETED",
          success: false,
          error: "Could not delete the post"
        }).catch(() => {
        });
      }
    } catch (error) {
      contentLogger.error("Error deleting last post:", error);
      const messageDiv = createMessageDiv("\u274C", "Error", "Failed to delete last post.", "#d32f2f");
      showTemporaryMessage(messageDiv);
    }
  }
  async function deletePost(postElement) {
    contentLogger.log("Attempting to delete post element:", postElement);
    try {
      const moreOptionsSelectors = [
        'button[aria-label="Open user actions"]',
        'button[id="overflow-trigger"]',
        'button[aria-label*="user actions"]',
        "shreddit-overflow-menu button",
        "shreddit-overflow-menu",
        'button[aria-label*="more options"]',
        'button[aria-label*="More options"]',
        'button[data-testid="post-menu-trigger"]',
        '[data-testid*="overflow-menu"]',
        'button[aria-haspopup="true"]',
        '[data-click-id="overflow"]',
        'button[title*="more"]',
        "faceplate-dropdown-menu button",
        'button[aria-label*="More post actions"]',
        'button svg[fill="currentColor"]',
        '[slot="post-stats-entry-point"] button',
        "button:has(svg)"
      ];
      const findOverflowButton = (element) => {
        contentLogger.log("Searching for overflow button in element:", element.tagName);
        for (const selector of moreOptionsSelectors) {
          const button = element.querySelector(selector);
          if (button) {
            contentLogger.log(`Found overflow button with selector: ${selector}`);
            return button;
          }
        }
        const allElements = element.querySelectorAll("*");
        contentLogger.log(`Checking ${allElements.length} elements for shadow roots`);
        for (const el of allElements) {
          if (el.shadowRoot) {
            contentLogger.log(`Found shadow root in element: ${el.tagName}`);
            for (const selector of moreOptionsSelectors) {
              const button = el.shadowRoot.querySelector(selector);
              if (button) {
                contentLogger.log(`Found overflow button in shadow DOM with selector: ${selector}`);
                return button;
              }
            }
          }
        }
        contentLogger.log("No overflow button found in normal DOM or shadow roots");
        return null;
      };
      let moreButton = findOverflowButton(postElement);
      if (moreButton) {
        contentLogger.log("Found overflow button using Shadow DOM search");
      }
      if (!moreButton) {
        contentLogger.log("More options button not found in post, trying alternative approach...");
        const allButtons = postElement.querySelectorAll("button");
        contentLogger.log(`Found ${allButtons.length} buttons in post:`);
        allButtons.forEach((btn, i) => {
          contentLogger.log(`Button ${i}:`, {
            ariaLabel: btn.getAttribute("aria-label"),
            className: btn.className,
            innerHTML: btn.innerHTML?.substring(0, 100),
            outerHTML: btn.outerHTML?.substring(0, 200)
          });
        });
        for (const btn of allButtons) {
          const ariaLabel = btn.getAttribute("aria-label")?.toLowerCase() || "";
          const className = btn.className?.toLowerCase() || "";
          const innerHTML = btn.innerHTML?.toLowerCase() || "";
          if (ariaLabel.includes("more") || ariaLabel.includes("menu") || ariaLabel.includes("options") || className.includes("overflow") || className.includes("menu") || innerHTML.includes("svg") || innerHTML.includes("\u22EF") || innerHTML.includes("...")) {
            contentLogger.log("Found potential overflow menu button:", btn);
            moreButton = btn;
            break;
          }
        }
        if (!moreButton) {
          contentLogger.log("No overflow menu button found in post element");
          return false;
        }
      }
      moreButton.click();
      await sleep(1500);
      const findDeleteOption = (root = document) => {
        const allElements = Array.from(root.querySelectorAll("*")).reverse();
        for (const el of allElements) {
          if (["SCRIPT", "STYLE", "HTML", "BODY", "HEAD"].includes(el.tagName))
            continue;
          const text = el.textContent?.toLowerCase().trim() || "";
          const ariaLabel = el.getAttribute("aria-label")?.toLowerCase() || "";
          const testId = el.getAttribute("data-testid")?.toLowerCase() || "";
          const isDeleteMatch = text === "delete" || text.includes("delete") && text.length < 20 || ariaLabel.includes("delete") || testId.includes("delete");
          if (isDeleteMatch) {
            if (el.offsetParent === null && window.getComputedStyle(el).display === "none") {
              continue;
            }
            contentLogger.log("Found potential delete element:", el);
            const clickable = el.closest('button, a, div[role="menuitem"], faceplate-dropdown-menu-item') || el;
            return clickable;
          }
        }
        const all = Array.from(root.querySelectorAll("*"));
        for (const el of all) {
          if (el.shadowRoot) {
            const found = findDeleteOption(el.shadowRoot);
            if (found)
              return found;
          }
        }
        return null;
      };
      let deleteOption = null;
      for (let attempts = 0; attempts < 3; attempts++) {
        deleteOption = findDeleteOption();
        if (deleteOption)
          break;
        const portals = document.querySelectorAll('faceplate-portal, .portal, [id*="portal"]');
        for (const portal of portals) {
          if (portal.shadowRoot) {
            const found = findDeleteOption(portal.shadowRoot);
            if (found) {
              deleteOption = found;
              break;
            }
          } else {
            const found = findDeleteOption(portal);
            if (found) {
              deleteOption = found;
              break;
            }
          }
        }
        if (deleteOption)
          break;
        contentLogger.log(`Delete option not found, retrying... (${attempts + 1}/3)`);
        await sleep(1e3);
      }
      if (!deleteOption) {
        contentLogger.log("Standard delete text search failed, looking for danger elements...");
        const dangerElements = document.querySelectorAll('[appearance="danger"], .icon-delete, [icon-name="delete"]');
        if (dangerElements.length > 0) {
          deleteOption = dangerElements[0].closest('button, a, div[role="menuitem"]') || dangerElements[0];
        }
      }
      if (!deleteOption) {
        contentLogger.log("Delete option not found in dropdown menu");
        return false;
      }
      deleteOption.click();
      await sleep(1500);
      const findConfirmButton = (root = document) => {
        const allElements = Array.from(root.querySelectorAll("*")).reverse();
        for (const el of allElements) {
          if (["SCRIPT", "STYLE", "HTML", "BODY", "HEAD"].includes(el.tagName))
            continue;
          const isClickableElement = el.tagName === "BUTTON" || el.tagName === "A" || el.tagName === "DIV" && el.getAttribute("role") === "button" || el.tagName === "FACEPLATE-BUTTON" || el.tagName.toLowerCase() === "faceplate-button";
          if (el.textContent?.toLowerCase().includes("delete")) {
            contentLogger.log("Debug - Element with delete text:", el.tagName, el, "Is clickable:", isClickableElement);
          }
          if (!isClickableElement) {
            continue;
          }
          const text = el.textContent?.toLowerCase().trim() || "";
          const ariaLabel = el.getAttribute("aria-label")?.toLowerCase() || "";
          const testId = el.getAttribute("data-testid")?.toLowerCase() || "";
          const isConfirmMatch = text === "yes, delete" || text.includes("yes, delete") || text.includes("delete") && text.includes("yes") || ariaLabel.includes("delete") && ariaLabel.includes("yes") || testId.includes("delete") && testId.includes("confirm");
          if (isConfirmMatch) {
            if (el.offsetParent === null && window.getComputedStyle(el).display === "none") {
              continue;
            }
            contentLogger.log("Found potential confirmation element:", el, "Text:", text);
            const clickable = el.closest('button, a, div[role="button"], faceplate-button') || el;
            return clickable;
          }
        }
        const all = Array.from(root.querySelectorAll("*"));
        for (const el of all) {
          if (el.shadowRoot) {
            const found = findConfirmButton(el.shadowRoot);
            if (found)
              return found;
          }
        }
        return null;
      };
      let confirmButton = null;
      for (let attempts = 0; attempts < 3; attempts++) {
        confirmButton = findConfirmButton();
        if (confirmButton)
          break;
        const portals = document.querySelectorAll('faceplate-portal, .portal, [id*="portal"], .modal, .overlay');
        for (const portal of portals) {
          if (portal.shadowRoot) {
            const found = findConfirmButton(portal.shadowRoot);
            if (found) {
              confirmButton = found;
              break;
            }
          } else {
            const found = findConfirmButton(portal);
            if (found) {
              confirmButton = found;
              break;
            }
          }
        }
        if (confirmButton)
          break;
        contentLogger.log(`Confirmation button not found, retrying... (${attempts + 1}/3)`);
        await sleep(1e3);
      }
      if (confirmButton) {
        contentLogger.log("Clicking confirmation button to delete post");
        confirmButton.click();
        let deletionConfirmed = false;
        for (let check = 0; check < 5; check++) {
          await sleep(1e3);
          const postStillExists = document.contains(postElement);
          if (!postStillExists) {
            contentLogger.log("Post successfully deleted - element no longer in DOM");
            deletionConfirmed = true;
            break;
          }
          const successMessages = document.querySelectorAll('[data-testid*="success"], .success-message, [class*="success"], [role="alert"]');
          for (const msg of successMessages) {
            if (msg.textContent?.toLowerCase().includes("delete") || msg.textContent?.toLowerCase().includes("removed")) {
              contentLogger.log("Post deletion success message found:", msg.textContent);
              deletionConfirmed = true;
              break;
            }
          }
          if (!window.location.href.includes("/comments/") && !window.location.href.includes("/r/")) {
            contentLogger.log("Redirected from post page - deletion likely successful");
            deletionConfirmed = true;
            break;
          }
          if (deletionConfirmed)
            break;
        }
        if (deletionConfirmed) {
          return true;
        } else {
          contentLogger.log("Post deletion status unclear after multiple checks");
          return true;
        }
      } else {
        contentLogger.log("Confirmation button not found");
        return false;
      }
    } catch (error) {
      contentLogger.error("Error in deletePost function:", error);
      return false;
    }
  }
  async function quickGetPostStatus(username) {
    contentLogger.log("\u26A1 Quick post status check for autoflow...");
    const posts = qsAll('shreddit-post[id^="t3_"], [data-testid="post-container"], .Post, [data-testid*="post"]');
    if (posts.length === 0) {
      return {
        hasPost: false,
        decision: "create",
        reason: "no_posts",
        userName: username
      };
    }
    const firstPost = posts[0];
    const isRemoved = firstPost.textContent?.includes("removed by the moderators") || firstPost.querySelector('[icon-name="remove"]') !== null;
    const scoreEl = firstPost.querySelector('[data-testid="post-vote-score"], faceplate-number');
    const score = parseInt(scoreEl?.textContent?.trim() || "0");
    const timeEl = firstPost.querySelector("time");
    const timestamp = timeEl?.getAttribute("datetime") || timeEl?.textContent;
    let ageHours = 0;
    if (timestamp) {
      try {
        const postDate = new Date(timestamp);
        ageHours = (Date.now() - postDate.getTime()) / (1e3 * 60 * 60);
      } catch (e) {
        contentLogger.warn("Could not parse timestamp:", timestamp);
      }
    }
    contentLogger.log(`\u26A1 Quick check: removed=${isRemoved}, score=${score}, age=${ageHours.toFixed(1)}h`);
    if (isRemoved) {
      return {
        hasPost: true,
        decision: "create_with_delete",
        reason: "post_removed",
        lastPost: { isRemoved, score, ageHours },
        userName: username
      };
    }
    if (score < 0) {
      return {
        hasPost: true,
        decision: "create_with_delete",
        reason: "post_downvoted",
        lastPost: { isRemoved, score, ageHours },
        userName: username
      };
    }
    if (ageHours < 1) {
      return {
        hasPost: true,
        decision: "wait",
        reason: "recent_post",
        lastPost: { isRemoved, score, ageHours },
        userName: username
      };
    }
    return {
      hasPost: true,
      decision: "no_create",
      reason: "post_active",
      lastPost: { isRemoved, score, ageHours },
      userName: username
    };
  }
  async function handleGetFreshPostsForDecision(userName) {
    contentLogger.log("[Content Script] Handling GET_FRESH_POSTS_FOR_DECISION for:", userName);
    try {
      const postsInfo = await checkUserPosts();
      const serializablePostsInfo = {
        total: postsInfo.total,
        lastPostDate: postsInfo.lastPostDate,
        posts: postsInfo.posts.map((post) => {
          const { _domElement, ...serializablePost } = post;
          return serializablePost;
        })
      };
      const freshData = {
        userName,
        postsInfo: serializablePostsInfo,
        lastUpdated: Date.now(),
        dataFresh: true
      };
      contentLogger.log("[Content Script] Sending fresh posts data to background:", freshData);
      const storageData = {
        userName,
        postsInfo: serializablePostsInfo,
        lastUpdated: Date.now()
      };
      contentLogger.log("[Content Script] About to save storageData:", storageData);
      contentLogger.log("[Content Script] postsInfo structure:", postsInfo);
      contentLogger.log("[Content Script] postsInfo.posts length:", postsInfo?.posts?.length);
      chrome.storage.local.set({ "latestPostsData": storageData }, () => {
        contentLogger.log("Fresh posts data saved to local storage during decision-making", storageData);
      });
      chrome.runtime.sendMessage({
        type: "FRESH_POSTS_COLLECTED",
        data: freshData
      }).catch((err) => {
        contentLogger.warn("[Content Script] Failed to send fresh posts data:", err);
      });
    } catch (error) {
      contentLogger.error("[Content Script] Error getting fresh posts for decision:", error);
      chrome.runtime.sendMessage({
        type: "FRESH_POSTS_COLLECTED",
        data: {
          userName,
          error: error.message,
          dataFresh: false
        }
      }).catch(() => {
      });
    }
  }
  window.quickGetPostStatus = quickGetPostStatus;
  contentLogger.log("\u26A1 Quick status function available: quickGetPostStatus(username)");
  function my_content_script_default(bridge2) {
    contentLogger.log("Content script bridge initialized", bridge2);
  }

  // .quasar/bex/entry-content-script-my-content-script.js
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
  my_content_script_default(bridge);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCAiLi4vLi4vLnF1YXNhci9iZXgvYnJpZGdlLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xdWFzYXIvc3JjL3V0aWxzL3VpZC91aWQuanMiLCAiLi4vLi4vLnF1YXNhci9iZXgvd2luZG93LWV2ZW50LWxpc3RlbmVyLmpzIiwgIi4uLy4uL3NyYy1iZXgvbG9nZ2VyLmpzIiwgIi4uLy4uL3NyYy1iZXgvbXktY29udGVudC1zY3JpcHQuanMiLCAiLi4vLi4vLnF1YXNhci9iZXgvZW50cnktY29udGVudC1zY3JpcHQtbXktY29udGVudC1zY3JpcHQuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSID0gdHlwZW9mIFJlZmxlY3QgPT09ICdvYmplY3QnID8gUmVmbGVjdCA6IG51bGxcbnZhciBSZWZsZWN0QXBwbHkgPSBSICYmIHR5cGVvZiBSLmFwcGx5ID09PSAnZnVuY3Rpb24nXG4gID8gUi5hcHBseVxuICA6IGZ1bmN0aW9uIFJlZmxlY3RBcHBseSh0YXJnZXQsIHJlY2VpdmVyLCBhcmdzKSB7XG4gICAgcmV0dXJuIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKHRhcmdldCwgcmVjZWl2ZXIsIGFyZ3MpO1xuICB9XG5cbnZhciBSZWZsZWN0T3duS2V5c1xuaWYgKFIgJiYgdHlwZW9mIFIub3duS2V5cyA9PT0gJ2Z1bmN0aW9uJykge1xuICBSZWZsZWN0T3duS2V5cyA9IFIub3duS2V5c1xufSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG4gIFJlZmxlY3RPd25LZXlzID0gZnVuY3Rpb24gUmVmbGVjdE93bktleXModGFyZ2V0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRhcmdldClcbiAgICAgIC5jb25jYXQoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyh0YXJnZXQpKTtcbiAgfTtcbn0gZWxzZSB7XG4gIFJlZmxlY3RPd25LZXlzID0gZnVuY3Rpb24gUmVmbGVjdE93bktleXModGFyZ2V0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRhcmdldCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIFByb2Nlc3NFbWl0V2FybmluZyh3YXJuaW5nKSB7XG4gIGlmIChjb25zb2xlICYmIGNvbnNvbGUud2FybikgY29uc29sZS53YXJuKHdhcm5pbmcpO1xufVxuXG52YXIgTnVtYmVySXNOYU4gPSBOdW1iZXIuaXNOYU4gfHwgZnVuY3Rpb24gTnVtYmVySXNOYU4odmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9PSB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICBFdmVudEVtaXR0ZXIuaW5pdC5jYWxsKHRoaXMpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5tb2R1bGUuZXhwb3J0cy5vbmNlID0gb25jZTtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHNDb3VudCA9IDA7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbnZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbmZ1bmN0aW9uIGNoZWNrTGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIEZ1bmN0aW9uLiBSZWNlaXZlZCB0eXBlICcgKyB0eXBlb2YgbGlzdGVuZXIpO1xuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShFdmVudEVtaXR0ZXIsICdkZWZhdWx0TWF4TGlzdGVuZXJzJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkZWZhdWx0TWF4TGlzdGVuZXJzO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uKGFyZykge1xuICAgIGlmICh0eXBlb2YgYXJnICE9PSAnbnVtYmVyJyB8fCBhcmcgPCAwIHx8IE51bWJlcklzTmFOKGFyZykpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgb2YgXCJkZWZhdWx0TWF4TGlzdGVuZXJzXCIgaXMgb3V0IG9mIHJhbmdlLiBJdCBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIG51bWJlci4gUmVjZWl2ZWQgJyArIGFyZyArICcuJyk7XG4gICAgfVxuICAgIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSBhcmc7XG4gIH1cbn0pO1xuXG5FdmVudEVtaXR0ZXIuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gIGlmICh0aGlzLl9ldmVudHMgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgdGhpcy5fZXZlbnRzID09PSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykuX2V2ZW50cykge1xuICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICB9XG5cbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn07XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycyhuKSB7XG4gIGlmICh0eXBlb2YgbiAhPT0gJ251bWJlcicgfHwgbiA8IDAgfHwgTnVtYmVySXNOYU4obikpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVGhlIHZhbHVlIG9mIFwiblwiIGlzIG91dCBvZiByYW5nZS4gSXQgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBudW1iZXIuIFJlY2VpdmVkICcgKyBuICsgJy4nKTtcbiAgfVxuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIF9nZXRNYXhMaXN0ZW5lcnModGhhdCkge1xuICBpZiAodGhhdC5fbWF4TGlzdGVuZXJzID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICByZXR1cm4gdGhhdC5fbWF4TGlzdGVuZXJzO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmdldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIGdldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIF9nZXRNYXhMaXN0ZW5lcnModGhpcyk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUpIHtcbiAgdmFyIGFyZ3MgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICB2YXIgZG9FcnJvciA9ICh0eXBlID09PSAnZXJyb3InKTtcblxuICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICBpZiAoZXZlbnRzICE9PSB1bmRlZmluZWQpXG4gICAgZG9FcnJvciA9IChkb0Vycm9yICYmIGV2ZW50cy5lcnJvciA9PT0gdW5kZWZpbmVkKTtcbiAgZWxzZSBpZiAoIWRvRXJyb3IpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKGRvRXJyb3IpIHtcbiAgICB2YXIgZXI7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID4gMClcbiAgICAgIGVyID0gYXJnc1swXTtcbiAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgLy8gTm90ZTogVGhlIGNvbW1lbnRzIG9uIHRoZSBgdGhyb3dgIGxpbmVzIGFyZSBpbnRlbnRpb25hbCwgdGhleSBzaG93XG4gICAgICAvLyB1cCBpbiBOb2RlJ3Mgb3V0cHV0IGlmIHRoaXMgcmVzdWx0cyBpbiBhbiB1bmhhbmRsZWQgZXhjZXB0aW9uLlxuICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgfVxuICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmhhbmRsZWQgZXJyb3IuJyArIChlciA/ICcgKCcgKyBlci5tZXNzYWdlICsgJyknIDogJycpKTtcbiAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgIHRocm93IGVycjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgfVxuXG4gIHZhciBoYW5kbGVyID0gZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChoYW5kbGVyID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIFJlZmxlY3RBcHBseShoYW5kbGVyLCB0aGlzLCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgUmVmbGVjdEFwcGx5KGxpc3RlbmVyc1tpXSwgdGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmZ1bmN0aW9uIF9hZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBwcmVwZW5kKSB7XG4gIHZhciBtO1xuICB2YXIgZXZlbnRzO1xuICB2YXIgZXhpc3Rpbmc7XG5cbiAgY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG5cbiAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gIGlmIChldmVudHMgPT09IHVuZGVmaW5lZCkge1xuICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB0YXJnZXQuX2V2ZW50c0NvdW50ID0gMDtcbiAgfSBlbHNlIHtcbiAgICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAgIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgICBpZiAoZXZlbnRzLm5ld0xpc3RlbmVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRhcmdldC5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA/IGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gICAgICAvLyBSZS1hc3NpZ24gYGV2ZW50c2AgYmVjYXVzZSBhIG5ld0xpc3RlbmVyIGhhbmRsZXIgY291bGQgaGF2ZSBjYXVzZWQgdGhlXG4gICAgICAvLyB0aGlzLl9ldmVudHMgdG8gYmUgYXNzaWduZWQgdG8gYSBuZXcgb2JqZWN0XG4gICAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgICB9XG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV07XG4gIH1cblxuICBpZiAoZXhpc3RpbmcgPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gICAgKyt0YXJnZXQuX2V2ZW50c0NvdW50O1xuICB9IGVsc2Uge1xuICAgIGlmICh0eXBlb2YgZXhpc3RpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPVxuICAgICAgICBwcmVwZW5kID8gW2xpc3RlbmVyLCBleGlzdGluZ10gOiBbZXhpc3RpbmcsIGxpc3RlbmVyXTtcbiAgICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB9IGVsc2UgaWYgKHByZXBlbmQpIHtcbiAgICAgIGV4aXN0aW5nLnVuc2hpZnQobGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleGlzdGluZy5wdXNoKGxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICAgIG0gPSBfZ2V0TWF4TGlzdGVuZXJzKHRhcmdldCk7XG4gICAgaWYgKG0gPiAwICYmIGV4aXN0aW5nLmxlbmd0aCA+IG0gJiYgIWV4aXN0aW5nLndhcm5lZCkge1xuICAgICAgZXhpc3Rpbmcud2FybmVkID0gdHJ1ZTtcbiAgICAgIC8vIE5vIGVycm9yIGNvZGUgZm9yIHRoaXMgc2luY2UgaXQgaXMgYSBXYXJuaW5nXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVzdHJpY3RlZC1zeW50YXhcbiAgICAgIHZhciB3ID0gbmV3IEVycm9yKCdQb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5IGxlYWsgZGV0ZWN0ZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZy5sZW5ndGggKyAnICcgKyBTdHJpbmcodHlwZSkgKyAnIGxpc3RlbmVycyAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FkZGVkLiBVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ2luY3JlYXNlIGxpbWl0Jyk7XG4gICAgICB3Lm5hbWUgPSAnTWF4TGlzdGVuZXJzRXhjZWVkZWRXYXJuaW5nJztcbiAgICAgIHcuZW1pdHRlciA9IHRhcmdldDtcbiAgICAgIHcudHlwZSA9IHR5cGU7XG4gICAgICB3LmNvdW50ID0gZXhpc3RpbmcubGVuZ3RoO1xuICAgICAgUHJvY2Vzc0VtaXRXYXJuaW5nKHcpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfTtcblxuZnVuY3Rpb24gb25jZVdyYXBwZXIoKSB7XG4gIGlmICghdGhpcy5maXJlZCkge1xuICAgIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy53cmFwRm4pO1xuICAgIHRoaXMuZmlyZWQgPSB0cnVlO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCk7XG4gICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuYXBwbHkodGhpcy50YXJnZXQsIGFyZ3VtZW50cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX29uY2VXcmFwKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIHN0YXRlID0geyBmaXJlZDogZmFsc2UsIHdyYXBGbjogdW5kZWZpbmVkLCB0YXJnZXQ6IHRhcmdldCwgdHlwZTogdHlwZSwgbGlzdGVuZXI6IGxpc3RlbmVyIH07XG4gIHZhciB3cmFwcGVkID0gb25jZVdyYXBwZXIuYmluZChzdGF0ZSk7XG4gIHdyYXBwZWQubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgc3RhdGUud3JhcEZuID0gd3JhcHBlZDtcbiAgcmV0dXJuIHdyYXBwZWQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UodHlwZSwgbGlzdGVuZXIpIHtcbiAgY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG4gIHRoaXMub24odHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kT25jZUxpc3RlbmVyID1cbiAgICBmdW5jdGlvbiBwcmVwZW5kT25jZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgIHRoaXMucHJlcGVuZExpc3RlbmVyKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuLy8gRW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmIGFuZCBvbmx5IGlmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgbGlzdCwgZXZlbnRzLCBwb3NpdGlvbiwgaSwgb3JpZ2luYWxMaXN0ZW5lcjtcblxuICAgICAgY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmIChldmVudHMgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGxpc3QgPSBldmVudHNbdHlwZV07XG4gICAgICBpZiAobGlzdCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8IGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0Lmxpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbGlzdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwb3NpdGlvbiA9IC0xO1xuXG4gICAgICAgIGZvciAoaSA9IGxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHwgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsTGlzdGVuZXIgPSBsaXN0W2ldLmxpc3RlbmVyO1xuICAgICAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgICBpZiAocG9zaXRpb24gPT09IDApXG4gICAgICAgICAgbGlzdC5zaGlmdCgpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBzcGxpY2VPbmUobGlzdCwgcG9zaXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKVxuICAgICAgICAgIGV2ZW50c1t0eXBlXSA9IGxpc3RbMF07XG5cbiAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lciAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBvcmlnaW5hbExpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKHR5cGUpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMsIGV2ZW50cywgaTtcblxuICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICAgICAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnRzW3R5cGVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGV2ZW50cyk7XG4gICAgICAgIHZhciBrZXk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBsaXN0ZW5lcnMgPSBldmVudHNbdHlwZV07XG5cbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gTElGTyBvcmRlclxuICAgICAgICBmb3IgKGkgPSBsaXN0ZW5lcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuZnVuY3Rpb24gX2xpc3RlbmVycyh0YXJnZXQsIHR5cGUsIHVud3JhcCkge1xuICB2YXIgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG5cbiAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBbXTtcblxuICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcbiAgaWYgKGV2bGlzdGVuZXIgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gW107XG5cbiAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKVxuICAgIHJldHVybiB1bndyYXAgPyBbZXZsaXN0ZW5lci5saXN0ZW5lciB8fCBldmxpc3RlbmVyXSA6IFtldmxpc3RlbmVyXTtcblxuICByZXR1cm4gdW53cmFwID9cbiAgICB1bndyYXBMaXN0ZW5lcnMoZXZsaXN0ZW5lcikgOiBhcnJheUNsb25lKGV2bGlzdGVuZXIsIGV2bGlzdGVuZXIubGVuZ3RoKTtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCB0cnVlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmF3TGlzdGVuZXJzID0gZnVuY3Rpb24gcmF3TGlzdGVuZXJzKHR5cGUpIHtcbiAgcmV0dXJuIF9saXN0ZW5lcnModGhpcywgdHlwZSwgZmFsc2UpO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5saXN0ZW5lckNvdW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbGlzdGVuZXJDb3VudC5jYWxsKGVtaXR0ZXIsIHR5cGUpO1xuICB9XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBsaXN0ZW5lckNvdW50O1xuZnVuY3Rpb24gbGlzdGVuZXJDb3VudCh0eXBlKSB7XG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XG5cbiAgaWYgKGV2ZW50cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG5cbiAgICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSBpZiAoZXZsaXN0ZW5lciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIDA7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXZlbnROYW1lcyA9IGZ1bmN0aW9uIGV2ZW50TmFtZXMoKSB7XG4gIHJldHVybiB0aGlzLl9ldmVudHNDb3VudCA+IDAgPyBSZWZsZWN0T3duS2V5cyh0aGlzLl9ldmVudHMpIDogW107XG59O1xuXG5mdW5jdGlvbiBhcnJheUNsb25lKGFyciwgbikge1xuICB2YXIgY29weSA9IG5ldyBBcnJheShuKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpXG4gICAgY29weVtpXSA9IGFycltpXTtcbiAgcmV0dXJuIGNvcHk7XG59XG5cbmZ1bmN0aW9uIHNwbGljZU9uZShsaXN0LCBpbmRleCkge1xuICBmb3IgKDsgaW5kZXggKyAxIDwgbGlzdC5sZW5ndGg7IGluZGV4KyspXG4gICAgbGlzdFtpbmRleF0gPSBsaXN0W2luZGV4ICsgMV07XG4gIGxpc3QucG9wKCk7XG59XG5cbmZ1bmN0aW9uIHVud3JhcExpc3RlbmVycyhhcnIpIHtcbiAgdmFyIHJldCA9IG5ldyBBcnJheShhcnIubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXQubGVuZ3RoOyArK2kpIHtcbiAgICByZXRbaV0gPSBhcnJbaV0ubGlzdGVuZXIgfHwgYXJyW2ldO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIG9uY2UoZW1pdHRlciwgbmFtZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGZ1bmN0aW9uIGVycm9yTGlzdGVuZXIoZXJyKSB7XG4gICAgICBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKG5hbWUsIHJlc29sdmVyKTtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc29sdmVyKCkge1xuICAgICAgaWYgKHR5cGVvZiBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgZXJyb3JMaXN0ZW5lcik7XG4gICAgICB9XG4gICAgICByZXNvbHZlKFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgfTtcblxuICAgIGV2ZW50VGFyZ2V0QWdub3N0aWNBZGRMaXN0ZW5lcihlbWl0dGVyLCBuYW1lLCByZXNvbHZlciwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIGlmIChuYW1lICE9PSAnZXJyb3InKSB7XG4gICAgICBhZGRFcnJvckhhbmRsZXJJZkV2ZW50RW1pdHRlcihlbWl0dGVyLCBlcnJvckxpc3RlbmVyLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkRXJyb3JIYW5kbGVySWZFdmVudEVtaXR0ZXIoZW1pdHRlciwgaGFuZGxlciwgZmxhZ3MpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZXZlbnRUYXJnZXRBZ25vc3RpY0FkZExpc3RlbmVyKGVtaXR0ZXIsICdlcnJvcicsIGhhbmRsZXIsIGZsYWdzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBldmVudFRhcmdldEFnbm9zdGljQWRkTGlzdGVuZXIoZW1pdHRlciwgbmFtZSwgbGlzdGVuZXIsIGZsYWdzKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmIChmbGFncy5vbmNlKSB7XG4gICAgICBlbWl0dGVyLm9uY2UobmFtZSwgbGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbWl0dGVyLm9uKG5hbWUsIGxpc3RlbmVyKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIEV2ZW50VGFyZ2V0IGRvZXMgbm90IGhhdmUgYGVycm9yYCBldmVudCBzZW1hbnRpY3MgbGlrZSBOb2RlXG4gICAgLy8gRXZlbnRFbWl0dGVycywgd2UgZG8gbm90IGxpc3RlbiBmb3IgYGVycm9yYCBldmVudHMgaGVyZS5cbiAgICBlbWl0dGVyLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZnVuY3Rpb24gd3JhcExpc3RlbmVyKGFyZykge1xuICAgICAgLy8gSUUgZG9lcyBub3QgaGF2ZSBidWlsdGluIGB7IG9uY2U6IHRydWUgfWAgc3VwcG9ydCBzbyB3ZVxuICAgICAgLy8gaGF2ZSB0byBkbyBpdCBtYW51YWxseS5cbiAgICAgIGlmIChmbGFncy5vbmNlKSB7XG4gICAgICAgIGVtaXR0ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCB3cmFwTGlzdGVuZXIpO1xuICAgICAgfVxuICAgICAgbGlzdGVuZXIoYXJnKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgXCJlbWl0dGVyXCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIEV2ZW50RW1pdHRlci4gUmVjZWl2ZWQgdHlwZSAnICsgdHlwZW9mIGVtaXR0ZXIpO1xuICB9XG59XG4iLCAiLyogZXNsaW50LWRpc2FibGUgKi9cbi8qKlxuICogVEhJUyBGSUxFIElTIEdFTkVSQVRFRCBBVVRPTUFUSUNBTExZLlxuICogRE8gTk9UIEVESVQuXG4gKiovXG5cbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cydcbmltcG9ydCB1aWQgZnJvbSAncXVhc2FyL3NyYy91dGlscy91aWQvdWlkLmpzJ1xuXG5jb25zdFxuICB0eXBlU2l6ZXMgPSB7XG4gICAgJ3VuZGVmaW5lZCc6ICgpID0+IDAsXG4gICAgJ2Jvb2xlYW4nOiAoKSA9PiA0LFxuICAgICdudW1iZXInOiAoKSA9PiA4LFxuICAgICdzdHJpbmcnOiBpdGVtID0+IDIgKiBpdGVtLmxlbmd0aCxcbiAgICAnb2JqZWN0JzogaXRlbSA9PiAhaXRlbSA/IDAgOiBPYmplY3RcbiAgICAgIC5rZXlzKGl0ZW0pXG4gICAgICAucmVkdWNlKCh0b3RhbCwga2V5KSA9PiBzaXplT2Yoa2V5KSArIHNpemVPZihpdGVtW2tleV0pICsgdG90YWwsIDApXG4gIH0sXG4gIHNpemVPZiA9IHZhbHVlID0+IHR5cGVTaXplc1t0eXBlb2YgdmFsdWVdKHZhbHVlKVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcmlkZ2UgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvciAod2FsbCkge1xuICAgIHN1cGVyKClcblxuICAgIHRoaXMuc2V0TWF4TGlzdGVuZXJzKEluZmluaXR5KVxuICAgIHRoaXMud2FsbCA9IHdhbGxcblxuICAgIHdhbGwubGlzdGVuKG1lc3NhZ2VzID0+IHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KG1lc3NhZ2VzKSkge1xuICAgICAgICBtZXNzYWdlcy5mb3JFYWNoKG1lc3NhZ2UgPT4gdGhpcy5fZW1pdChtZXNzYWdlKSlcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl9lbWl0KG1lc3NhZ2VzKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLl9zZW5kaW5nUXVldWUgPSBbXVxuICAgIHRoaXMuX3NlbmRpbmcgPSBmYWxzZVxuICAgIHRoaXMuX21heE1lc3NhZ2VTaXplID0gMzIgKiAxMDI0ICogMTAyNCAvLyAzMm1iXG4gIH1cblxuICAvKipcbiAgICogU2VuZCBhbiBldmVudC5cbiAgICpcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqIEBwYXJhbSBwYXlsb2FkXG4gICAqIEByZXR1cm5zIFByb21pc2U8PlxuICAgKi9cbiAgc2VuZCAoZXZlbnQsIHBheWxvYWQpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VuZChbeyBldmVudCwgcGF5bG9hZCB9XSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYWxsIHJlZ2lzdGVyZWQgZXZlbnRzXG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cbiAgZ2V0RXZlbnRzICgpIHtcbiAgICByZXR1cm4gdGhpcy5fZXZlbnRzXG4gIH1cblxuICBvbihldmVudE5hbWUsIGxpc3RlbmVyKSB7XG4gICAgcmV0dXJuIHN1cGVyLm9uKGV2ZW50TmFtZSwgKG9yaWdpbmFsUGF5bG9hZCkgPT4ge1xuICAgICAgbGlzdGVuZXIoe1xuICAgICAgICAuLi5vcmlnaW5hbFBheWxvYWQsXG4gICAgICAgIC8vIENvbnZlbmllbnQgYWx0ZXJuYXRpdmUgdG8gdGhlIG1hbnVhbCB1c2FnZSBvZiBgZXZlbnRSZXNwb25zZUtleWBcbiAgICAgICAgLy8gV2UgY2FuJ3Qgc2VuZCB0aGlzIGluIGBfbmV4dFNlbmRgIHdoaWNoIHdpbGwgdGhlbiBiZSBzZW50IHVzaW5nIGBwb3J0LnBvc3RNZXNzYWdlKClgLCB3aGljaCBjYW4ndCBzZXJpYWxpemUgZnVuY3Rpb25zLlxuICAgICAgICAvLyBTbywgd2UgaG9vayBpbnRvIHRoZSB1bmRlcmx5aW5nIGxpc3RlbmVyIGFuZCBpbmNsdWRlIHRoZSBmdW5jdGlvbiB0aGVyZSwgd2hpY2ggaGFwcGVucyBhZnRlciB0aGUgc2VuZCBvcGVyYXRpb24uXG4gICAgICAgIHJlc3BvbmQ6IChwYXlsb2FkIC8qIG9wdGlvbmFsICovKSA9PiB0aGlzLnNlbmQob3JpZ2luYWxQYXlsb2FkLmV2ZW50UmVzcG9uc2VLZXksIHBheWxvYWQpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBfZW1pdCAobWVzc2FnZSkge1xuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuZW1pdChtZXNzYWdlKVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuZW1pdChtZXNzYWdlLmV2ZW50LCBtZXNzYWdlLnBheWxvYWQpXG4gICAgfVxuICB9XG5cbiAgX3NlbmQgKG1lc3NhZ2VzKSB7XG4gICAgdGhpcy5fc2VuZGluZ1F1ZXVlLnB1c2gobWVzc2FnZXMpXG4gICAgcmV0dXJuIHRoaXMuX25leHRTZW5kKClcbiAgfVxuXG4gIF9uZXh0U2VuZCAoKSB7XG4gICAgaWYgKCF0aGlzLl9zZW5kaW5nUXVldWUubGVuZ3RoIHx8IHRoaXMuX3NlbmRpbmcpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgIHRoaXMuX3NlbmRpbmcgPSB0cnVlXG5cbiAgICBjb25zdFxuICAgICAgbWVzc2FnZXMgPSB0aGlzLl9zZW5kaW5nUXVldWUuc2hpZnQoKSxcbiAgICAgIGN1cnJlbnRNZXNzYWdlID0gbWVzc2FnZXNbMF0sXG4gICAgICBldmVudExpc3RlbmVyS2V5ID0gYCR7Y3VycmVudE1lc3NhZ2UuZXZlbnR9LiR7dWlkKCl9YCxcbiAgICAgIGV2ZW50UmVzcG9uc2VLZXkgPSBldmVudExpc3RlbmVyS2V5ICsgJy5yZXN1bHQnXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbGV0IGFsbENodW5rcyA9IFtdXG5cbiAgICAgIGNvbnN0IGZuID0gKHIpID0+IHtcbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhIHNwbGl0IG1lc3NhZ2UgdGhlbiBrZWVwIGxpc3RlbmluZyBmb3IgdGhlIGNodW5rcyBhbmQgYnVpbGQgYSBsaXN0IHRvIHJlc29sdmVcbiAgICAgICAgaWYgKHIgIT09IHZvaWQgMCAmJiByLl9jaHVua1NwbGl0KSB7XG4gICAgICAgICAgY29uc3QgY2h1bmtEYXRhID0gci5fY2h1bmtTcGxpdFxuICAgICAgICAgIGFsbENodW5rcyA9IFsuLi5hbGxDaHVua3MsIC4uLnIuZGF0YV1cblxuICAgICAgICAgIC8vIExhc3QgY2h1bmsgcmVjZWl2ZWQgc28gcmVzb2x2ZSB0aGUgcHJvbWlzZS5cbiAgICAgICAgICBpZiAoY2h1bmtEYXRhLmxhc3RDaHVuaykge1xuICAgICAgICAgICAgdGhpcy5vZmYoZXZlbnRSZXNwb25zZUtleSwgZm4pXG4gICAgICAgICAgICByZXNvbHZlKGFsbENodW5rcylcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpcy5vZmYoZXZlbnRSZXNwb25zZUtleSwgZm4pXG4gICAgICAgICAgcmVzb2x2ZShyKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMub24oZXZlbnRSZXNwb25zZUtleSwgZm4pXG5cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEFkZCBhbiBldmVudCByZXNwb25zZSBrZXkgdG8gdGhlIHBheWxvYWQgd2UncmUgc2VuZGluZyBzbyB0aGUgbWVzc2FnZSBrbm93cyB3aGljaCBjaGFubmVsIHRvIHJlc3BvbmQgb24uXG4gICAgICAgIGNvbnN0IG1lc3NhZ2VzVG9TZW5kID0gbWVzc2FnZXMubWFwKG0gPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5tLFxuICAgICAgICAgICAgLi4ue1xuICAgICAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICAgICAgZGF0YTogbS5wYXlsb2FkLFxuICAgICAgICAgICAgICAgIGV2ZW50UmVzcG9uc2VLZXlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLndhbGwuc2VuZChtZXNzYWdlc1RvU2VuZClcbiAgICAgIH1cbiAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gJ01lc3NhZ2UgbGVuZ3RoIGV4Y2VlZGVkIG1heGltdW0gYWxsb3dlZCBsZW5ndGguJ1xuXG4gICAgICAgIGlmIChlcnIubWVzc2FnZSA9PT0gZXJyb3JNZXNzYWdlKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIHBheWxvYWQgaXMgYW4gYXJyYXkgYW5kIHRvbyBiaWcgdGhlbiBzcGxpdCBpdCBpbnRvIGNodW5rcyBhbmQgc2VuZCB0byB0aGUgY2xpZW50cyBicmlkZ2VcbiAgICAgICAgICAvLyB0aGUgY2xpZW50IGJyaWRnZSB3aWxsIHRoZW4gcmVzb2x2ZSB0aGUgcHJvbWlzZS5cbiAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoY3VycmVudE1lc3NhZ2UucGF5bG9hZCkpIHtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3JNZXNzYWdlICsgJyBOb3RlOiBUaGUgYnJpZGdlIGNhbiBkZWFsIHdpdGggdGhpcyBpcyBpZiB0aGUgcGF5bG9hZCBpcyBhbiBBcnJheS4nKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG9iamVjdFNpemUgPSBzaXplT2YoY3VycmVudE1lc3NhZ2UpXG5cbiAgICAgICAgICAgIGlmIChvYmplY3RTaXplID4gdGhpcy5fbWF4TWVzc2FnZVNpemUpIHtcbiAgICAgICAgICAgICAgY29uc3RcbiAgICAgICAgICAgICAgICBjaHVua3NSZXF1aXJlZCA9IE1hdGguY2VpbChvYmplY3RTaXplIC8gdGhpcy5fbWF4TWVzc2FnZVNpemUpLFxuICAgICAgICAgICAgICAgIGFycmF5SXRlbUNvdW50ID0gTWF0aC5jZWlsKGN1cnJlbnRNZXNzYWdlLnBheWxvYWQubGVuZ3RoIC8gY2h1bmtzUmVxdWlyZWQpXG5cbiAgICAgICAgICAgICAgbGV0IGRhdGEgPSBjdXJyZW50TWVzc2FnZS5wYXlsb2FkXG4gICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzUmVxdWlyZWQ7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCB0YWtlID0gTWF0aC5taW4oZGF0YS5sZW5ndGgsIGFycmF5SXRlbUNvdW50KVxuXG4gICAgICAgICAgICAgICAgdGhpcy53YWxsLnNlbmQoW3tcbiAgICAgICAgICAgICAgICAgIGV2ZW50OiBjdXJyZW50TWVzc2FnZS5ldmVudCxcbiAgICAgICAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgX2NodW5rU3BsaXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICBjb3VudDogY2h1bmtzUmVxdWlyZWQsXG4gICAgICAgICAgICAgICAgICAgICAgbGFzdENodW5rOiBpID09PSBjaHVua3NSZXF1aXJlZCAtIDFcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YS5zcGxpY2UoMCwgdGFrZSlcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9zZW5kaW5nID0gZmFsc2VcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4geyByZXR1cm4gdGhpcy5fbmV4dFNlbmQoKSB9LCAxNilcbiAgICB9KVxuICB9XG59XG4iLCAiLyoqXG4gKiBCYXNlZCBvbiB0aGUgd29yayBvZiBodHRwczovL2dpdGh1Yi5jb20vamNob29rL3V1aWQtcmFuZG9tXG4gKi9cblxubGV0XG4gIGJ1ZixcbiAgYnVmSWR4ID0gMFxuY29uc3QgaGV4Qnl0ZXMgPSBuZXcgQXJyYXkoMjU2KVxuXG4vLyBQcmUtY2FsY3VsYXRlIHRvU3RyaW5nKDE2KSBmb3Igc3BlZWRcbmZvciAobGV0IGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgaGV4Qnl0ZXNbIGkgXSA9IChpICsgMHgxMDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSlcbn1cblxuLy8gVXNlIGJlc3QgYXZhaWxhYmxlIFBSTkdcbmNvbnN0IHJhbmRvbUJ5dGVzID0gKCgpID0+IHtcbiAgLy8gTm9kZSAmIEJyb3dzZXIgc3VwcG9ydFxuICBjb25zdCBsaWIgPSB0eXBlb2YgY3J5cHRvICE9PSAndW5kZWZpbmVkJ1xuICAgID8gY3J5cHRvXG4gICAgOiAoXG4gICAgICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgICAgICAgPyB3aW5kb3cuY3J5cHRvIHx8IHdpbmRvdy5tc0NyeXB0b1xuICAgICAgICAgIDogdm9pZCAwXG4gICAgICApXG5cbiAgaWYgKGxpYiAhPT0gdm9pZCAwKSB7XG4gICAgaWYgKGxpYi5yYW5kb21CeXRlcyAhPT0gdm9pZCAwKSB7XG4gICAgICByZXR1cm4gbGliLnJhbmRvbUJ5dGVzXG4gICAgfVxuICAgIGlmIChsaWIuZ2V0UmFuZG9tVmFsdWVzICE9PSB2b2lkIDApIHtcbiAgICAgIHJldHVybiBuID0+IHtcbiAgICAgICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShuKVxuICAgICAgICBsaWIuZ2V0UmFuZG9tVmFsdWVzKGJ5dGVzKVxuICAgICAgICByZXR1cm4gYnl0ZXNcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbiA9PiB7XG4gICAgY29uc3QgciA9IFtdXG4gICAgZm9yIChsZXQgaSA9IG47IGkgPiAwOyBpLS0pIHtcbiAgICAgIHIucHVzaChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTYpKVxuICAgIH1cbiAgICByZXR1cm4gclxuICB9XG59KSgpXG5cbi8vIEJ1ZmZlciByYW5kb20gbnVtYmVycyBmb3Igc3BlZWRcbi8vIFJlZHVjZSBtZW1vcnkgdXNhZ2UgYnkgZGVjcmVhc2luZyB0aGlzIG51bWJlciAobWluIDE2KVxuLy8gb3IgaW1wcm92ZSBzcGVlZCBieSBpbmNyZWFzaW5nIHRoaXMgbnVtYmVyICh0cnkgMTYzODQpXG5jb25zdCBCVUZGRVJfU0laRSA9IDQwOTZcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xuICAvLyBCdWZmZXIgc29tZSByYW5kb20gYnl0ZXMgZm9yIHNwZWVkXG4gIGlmIChidWYgPT09IHZvaWQgMCB8fCAoYnVmSWR4ICsgMTYgPiBCVUZGRVJfU0laRSkpIHtcbiAgICBidWZJZHggPSAwXG4gICAgYnVmID0gcmFuZG9tQnl0ZXMoQlVGRkVSX1NJWkUpXG4gIH1cblxuICBjb25zdCBiID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYnVmLCBidWZJZHgsIChidWZJZHggKz0gMTYpKVxuICBiWyA2IF0gPSAoYlsgNiBdICYgMHgwZikgfCAweDQwXG4gIGJbIDggXSA9IChiWyA4IF0gJiAweDNmKSB8IDB4ODBcblxuICByZXR1cm4gaGV4Qnl0ZXNbIGJbIDAgXSBdICsgaGV4Qnl0ZXNbIGJbIDEgXSBdXG4gICAgKyBoZXhCeXRlc1sgYlsgMiBdIF0gKyBoZXhCeXRlc1sgYlsgMyBdIF0gKyAnLSdcbiAgICArIGhleEJ5dGVzWyBiWyA0IF0gXSArIGhleEJ5dGVzWyBiWyA1IF0gXSArICctJ1xuICAgICsgaGV4Qnl0ZXNbIGJbIDYgXSBdICsgaGV4Qnl0ZXNbIGJbIDcgXSBdICsgJy0nXG4gICAgKyBoZXhCeXRlc1sgYlsgOCBdIF0gKyBoZXhCeXRlc1sgYlsgOSBdIF0gKyAnLSdcbiAgICArIGhleEJ5dGVzWyBiWyAxMCBdIF0gKyBoZXhCeXRlc1sgYlsgMTEgXSBdXG4gICAgKyBoZXhCeXRlc1sgYlsgMTIgXSBdICsgaGV4Qnl0ZXNbIGJbIDEzIF0gXVxuICAgICsgaGV4Qnl0ZXNbIGJbIDE0IF0gXSArIGhleEJ5dGVzWyBiWyAxNSBdIF1cbn1cbiIsICIvKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyoqXG4gKiBUSElTIEZJTEUgSVMgR0VORVJBVEVEIEFVVE9NQVRJQ0FMTFkuXG4gKiBETyBOT1QgRURJVC5cbiAqKi9cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gYWRkIGEgZ2VuZXJpYyB3aW5kb3dzIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBwYWdlXG4gKiB3aGljaCBhY3RzIGFzIGEgYnJpZGdlIGJldHdlZW4gdGhlIHdlYiBwYWdlIGFuZCB0aGUgY29udGVudCBzY3JpcHQgYnJpZGdlLlxuICogQHBhcmFtIGJyaWRnZVxuICogQHBhcmFtIHR5cGVcbiAqL1xuZXhwb3J0IGNvbnN0IGxpc3RlbkZvcldpbmRvd0V2ZW50cyA9IChicmlkZ2UsIHR5cGUpID0+IHtcbiAgLy8gTGlzdGVuIGZvciBhbnkgZXZlbnRzIGZyb20gdGhlIHdlYiBwYWdlIGFuZCB0cmFuc21pdCB0byB0aGUgQkVYIGJyaWRnZS5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBwYXlsb2FkID0+IHtcbiAgICAvLyBXZSBvbmx5IGFjY2VwdCBtZXNzYWdlcyBmcm9tIHRoaXMgd2luZG93IHRvIGl0c2VsZiBbaS5lLiBub3QgZnJvbSBhbnkgaWZyYW1lc11cbiAgICBpZiAocGF5bG9hZC5zb3VyY2UgIT09IHdpbmRvdykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKHBheWxvYWQuZGF0YS5mcm9tICE9PSB2b2lkIDAgJiYgcGF5bG9hZC5kYXRhLmZyb20gPT09IHR5cGUpIHtcbiAgICAgIGNvbnN0XG4gICAgICAgIGV2ZW50RGF0YSA9IHBheWxvYWQuZGF0YVswXSxcbiAgICAgICAgYnJpZGdlRXZlbnRzID0gYnJpZGdlLmdldEV2ZW50cygpXG5cbiAgICAgIGZvciAobGV0IGV2ZW50IGluIGJyaWRnZUV2ZW50cykge1xuICAgICAgICBpZiAoZXZlbnQgPT09IGV2ZW50RGF0YS5ldmVudCkge1xuICAgICAgICAgIGJyaWRnZUV2ZW50c1tldmVudF0oZXZlbnREYXRhLnBheWxvYWQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIGZhbHNlKVxufVxuIiwgIi8vIFNpbXBsZSBsb2dnZXIgZm9yIGJyb3dzZXIgZXh0ZW5zaW9uIGNvbnRleHQgc2NyaXB0c1xuY2xhc3MgRXh0ZW5zaW9uTG9nZ2VyIHtcbiAgY29uc3RydWN0b3IocHJlZml4ID0gJycpIHtcbiAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgICB0aGlzLmRlYnVnRW5hYmxlZCA9IHRydWU7IC8vIFNldCB0byB0cnVlIGZvciBkZWJ1Z2dpbmdcbiAgfVxuXG4gIGFzeW5jIGNoZWNrRGVidWdTZXR0aW5nKCkge1xuICAgIHRyeSB7XG4gICAgICAvLyBDaGVjayBpZiBkZWJ1ZyBtb2RlIGlzIGVuYWJsZWQgaW4gc3RvcmFnZVxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsnZGVidWdNb2RlJ10pO1xuICAgICAgLy8gRm9yIGJhY2tncm91bmQgc2NyaXB0cywgYWx3YXlzIGVuYWJsZSBsb2dnaW5nIHJlZ2FyZGxlc3Mgb2Ygc3RvcmFnZSBzZXR0aW5nXG4gICAgICB0aGlzLmRlYnVnRW5hYmxlZCA9IHRydWU7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIElmIHN0b3JhZ2UgaXMgbm90IGF2YWlsYWJsZSwga2VlcCBjdXJyZW50IHNldHRpbmdcbiAgICB9XG4gIH1cblxuICBsb2coLi4uYXJncykge1xuICAgIGlmICh0aGlzLmRlYnVnRW5hYmxlZCkge1xuICAgICAgY29uc29sZS5sb2codGhpcy5wcmVmaXgsIC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGluZm8oLi4uYXJncykge1xuICAgIGlmICh0aGlzLmRlYnVnRW5hYmxlZCkge1xuICAgICAgY29uc29sZS5pbmZvKHRoaXMucHJlZml4LCAuLi5hcmdzKTtcbiAgICB9XG4gIH1cblxuICB3YXJuKC4uLmFyZ3MpIHtcbiAgICAvLyBBbHdheXMgc2hvdyB3YXJuaW5nc1xuICAgIGNvbnNvbGUud2Fybih0aGlzLnByZWZpeCwgLi4uYXJncyk7XG4gIH1cblxuICBlcnJvciguLi5hcmdzKSB7XG4gICAgLy8gQWx3YXlzIHNob3cgZXJyb3JzXG4gICAgY29uc29sZS5lcnJvcih0aGlzLnByZWZpeCwgLi4uYXJncyk7XG4gIH1cblxuICBkZWJ1ZyguLi5hcmdzKSB7XG4gICAgaWYgKHRoaXMuZGVidWdFbmFibGVkKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKHRoaXMucHJlZml4LCAuLi5hcmdzKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gQ3JlYXRlIGxvZ2dlciBpbnN0YW5jZXMgZm9yIGRpZmZlcmVudCBjb250ZXh0c1xuZXhwb3J0IGNvbnN0IGRvbUxvZ2dlciA9IG5ldyBFeHRlbnNpb25Mb2dnZXIoJ1tET00gU2NyaXB0XScpO1xuZXhwb3J0IGNvbnN0IGJnTG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW0JHXScpO1xuZXhwb3J0IGNvbnN0IHN0YXRzTG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW1N0YXRzXScpO1xuZXhwb3J0IGNvbnN0IG1zZ0xvZ2dlciA9IG5ldyBFeHRlbnNpb25Mb2dnZXIoJ1tNZXNzYWdlXScpO1xuZXhwb3J0IGNvbnN0IHBvc3RTZXJ2aWNlTG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW1Bvc3REYXRhU2VydmljZV0nKTtcbmV4cG9ydCBjb25zdCBzdGF0ZUxvZ2dlciA9IG5ldyBFeHRlbnNpb25Mb2dnZXIoJ1tBdXRvRmxvd1N0YXRlTWFuYWdlcl0nKTtcbmV4cG9ydCBjb25zdCBjb250ZW50TG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW0NvbnRlbnQgU2NyaXB0XScpO1xuZXhwb3J0IGNvbnN0IHN1Ym1pdExvZ2dlciA9IG5ldyBFeHRlbnNpb25Mb2dnZXIoJ1tTdWJtaXQgU2NyaXB0XScpO1xuXG4vLyBJbml0aWFsaXplIGRlYnVnIHNldHRpbmcgZm9yIGFsbCBsb2dnZXJzXG5jb25zdCBpbml0RGVidWdNb2RlID0gYXN5bmMgKCkgPT4ge1xuICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgZG9tTG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKCksXG4gICAgYmdMb2dnZXIuY2hlY2tEZWJ1Z1NldHRpbmcoKSxcbiAgICBzdGF0c0xvZ2dlci5jaGVja0RlYnVnU2V0dGluZygpLFxuICAgIG1zZ0xvZ2dlci5jaGVja0RlYnVnU2V0dGluZygpLFxuICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKCksXG4gICAgc3RhdGVMb2dnZXIuY2hlY2tEZWJ1Z1NldHRpbmcoKSxcbiAgICBjb250ZW50TG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKCksXG4gICAgc3VibWl0TG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKClcbiAgXSk7XG59O1xuXG4vLyBBdXRvLWluaXRpYWxpemVcbmluaXREZWJ1Z01vZGUoKTtcbiIsICJpbXBvcnQgeyBjb250ZW50TG9nZ2VyIH0gZnJvbSBcIi4vbG9nZ2VyLmpzXCI7LyoqXG4gKiBDb250ZW50IHNjcmlwdCBmb3IgUmVkZGl0IFBvc3QgTWFjaGluZVxuICogSGFuZGxlcyBET00gbWFuaXB1bGF0aW9uIGFuZCBwYWdlIGludGVyYWN0aW9uIG9uIFJlZGRpdFxuICovXG5cbi8vIEluaXRpYWxpemUgY29udGVudCBzY3JpcHRcbmNvbnRlbnRMb2dnZXIubG9nKCdSZWRkaXQgUG9zdCBNYWNoaW5lIGNvbnRlbnQgc2NyaXB0IGxvYWRlZCcpXG5cbi8vIEluamVjdCBkb20uanMgaW50byBwYWdlIGNvbnRleHRcbmZ1bmN0aW9uIGluamVjdERvbVNjcmlwdCgpIHtcbiAgLy8gQ2hlY2sgaWYgZG9tLmpzIGlzIGFscmVhZHkgaW5qZWN0ZWRcbiAgaWYgKHdpbmRvdy5SZWRkaXRET01IZWxwZXIpIHtcbiAgICBjb250ZW50TG9nZ2VyLmxvZygnRE9NIHNjcmlwdCBhbHJlYWR5IGxvYWRlZCcpXG4gICAgcmV0dXJuXG4gIH1cblxuICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuICBzY3JpcHQuc3JjID0gY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdkb20uanMnKVxuICBzY3JpcHQub25sb2FkID0gKCkgPT4ge1xuICAgIGNvbnRlbnRMb2dnZXIubG9nKCdET00gc2NyaXB0IGluamVjdGVkIHN1Y2Nlc3NmdWxseScpXG4gIH1cbiAgc2NyaXB0Lm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgY29udGVudExvZ2dlci5lcnJvcignRmFpbGVkIHRvIGluamVjdCBET00gc2NyaXB0JylcbiAgfVxuICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoc2NyaXB0KVxufVxuXG4vLyBJbmplY3QgRE9NIHNjcmlwdCBpbW1lZGlhdGVseVxuaW5qZWN0RG9tU2NyaXB0KClcblxuLy8gR2xvYmFsIGVycm9yIHN1cHByZXNzaW9uIGZvciBrbm93biBoYXJtbGVzcyBlcnJvcnNcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIChlKSA9PiB7XG4gIGlmIChlLm1lc3NhZ2UgJiYgZS5tZXNzYWdlLmluY2x1ZGVzKCdDb25uZWN0aW9uIGhhcyBiZWVuIHRlcm1pbmF0ZWQnKSkge1xuICAgIC8vIFNpbGVudGx5IGlnbm9yZSB0aGlzIGVycm9yIFx1MjAxMyBpdCBvY2N1cnMgZHVyaW5nIHNvbWUgdGhpcmRcdTIwMTFwYXJ0eSBzY3JpcHQgbG9hZHMgKGUuZy4sIFN0cmlwZSkgYW5kIGRvZXMgbm90IGFmZmVjdCBvdXIgZmxvd1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uICYmIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgY29udGVudExvZ2dlci53YXJuKCdbQ29udGVudCBTY3JpcHRdIElnbm9yZWQgYmVuaWduIGVycm9yOicsIGUubWVzc2FnZSk7XG4gIH1cbn0pO1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3VuaGFuZGxlZHJlamVjdGlvbicsIChlKSA9PiB7XG4gIGlmIChlLnJlYXNvbiAmJiBlLnJlYXNvbi5tZXNzYWdlICYmIGUucmVhc29uLm1lc3NhZ2UuaW5jbHVkZXMoJ0Nvbm5lY3Rpb24gaGFzIGJlZW4gdGVybWluYXRlZCcpKSB7XG4gICAgY29udGVudExvZ2dlci53YXJuKCdbQ29udGVudCBTY3JpcHRdIElnbm9yZWQgdW5oYW5kbGVkIHJlamVjdGlvbjonLCBlLnJlYXNvbi5tZXNzYWdlKTtcbiAgICAvLyBQcmV2ZW50IG5vaXN5IGNvbnNvbGUgb3V0cHV0XG4gICAgZS5wcmV2ZW50RGVmYXVsdCAmJiBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH1cbn0pO1xuXG4vLyBDaGVjayBpZiB3ZSdyZSBvbiBSZWRkaXRcbmNvbnN0IGlzUmVkZGl0UGFnZSA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5pbmNsdWRlcygncmVkZGl0LmNvbScpXG5cbi8vIEF1dG8tcnVuIHNjcmlwdCByb3V0aW5nXG5hc3luYyBmdW5jdGlvbiByb3V0ZUF1dG9SdW5TY3JpcHQoKSB7XG4gIGNvbnN0IHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG4gIGNvbnN0IGhvc3RuYW1lID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lXG5cbiAgLy8gRXhjbHVkZSBjaGF0LnJlZGRpdC5jb21cbiAgaWYgKGhvc3RuYW1lID09PSAnY2hhdC5yZWRkaXQuY29tJykge1xuICAgIGNvbnRlbnRMb2dnZXIubG9nKCdTa2lwcGluZyBhdXRvLXJ1biBzY3JpcHRzIG9uIGNoYXQucmVkZGl0LmNvbScpXG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBDaGVjayBhdXRvLXJ1biBzZXR0aW5nc1xuICBsZXQgYXV0b1J1blNldHRpbmdzXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoWydhdXRvUnVuU2V0dGluZ3MnXSlcbiAgICBhdXRvUnVuU2V0dGluZ3MgPSByZXN1bHQuYXV0b1J1blNldHRpbmdzIHx8IHsgcHJvZmlsZURldGVjdGlvbjogdHJ1ZSwgcG9zdFN1Ym1pc3Npb246IHRydWUgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnRlbnRMb2dnZXIud2FybignRmFpbGVkIHRvIGdldCBhdXRvLXJ1biBzZXR0aW5ncywgdXNpbmcgZGVmYXVsdHM6JywgZXJyb3IpXG4gICAgYXV0b1J1blNldHRpbmdzID0geyBwcm9maWxlRGV0ZWN0aW9uOiB0cnVlLCBwb3N0U3VibWlzc2lvbjogdHJ1ZSB9XG4gIH1cblxuICAvLyBDaGVjayBpZiB3ZSdyZSBhbHJlYWR5IHJ1bm5pbmcgYSBzY3JpcHQgdG8gcHJldmVudCBkdXBsaWNhdGVzXG4gIGNvbnN0IHNjcmlwdFN0YWdlID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgncmVkZGl0LXBvc3QtbWFjaGluZS1zY3JpcHQtc3RhZ2UnKVxuXG4gIC8vIFNjcmlwdCAxOiBQcm9maWxlIGRldGVjdGlvbiBhbmQgZGF0YSBjb2xsZWN0aW9uIChvbmx5IG9uIGhvbWUgcGFnZSBhbmQgc3BlY2lmaWMgcGFnZXMpXG4gIGNvbnN0IHBhdGhuYW1lID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lXG4gIGlmIChhdXRvUnVuU2V0dGluZ3MucHJvZmlsZURldGVjdGlvbiAmJlxuICAgICAgKHVybC5pbmNsdWRlcygncmVkZGl0LmNvbScpICYmIChwYXRobmFtZSA9PT0gJy8nIHx8IHBhdGhuYW1lID09PSAnL2hvdCcgfHwgcGF0aG5hbWUgPT09ICcvbmV3JyB8fCBwYXRobmFtZSA9PT0gJy9wb3B1bGFyJykgJiYgIXNjcmlwdFN0YWdlKSkge1xuICAgIGNvbnRlbnRMb2dnZXIubG9nKCdBdXRvLXJ1bm5pbmcgcHJvZmlsZSBkZXRlY3Rpb24gc2NyaXB0JylcbiAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdyZWRkaXQtcG9zdC1tYWNoaW5lLXNjcmlwdC1zdGFnZScsICdwcm9maWxlLXN0YXJ0ZWQnKVxuICAgIHNldFRpbWVvdXQoKCkgPT4gcnVuUHJvZmlsZURldGVjdGlvblNjcmlwdCgpLCAyMDAwKVxuICB9XG5cbiAgLy8gQ29udGludWUgcHJvZmlsZSBzY3JpcHQgYWZ0ZXIgbmF2aWdhdGlvblxuICBpZiAoc2NyaXB0U3RhZ2UgPT09ICdwcm9maWxlLW5hdmlnYXRpbmcnICYmIHVybC5pbmNsdWRlcygnL3UvJykpIHtcbiAgICBjb250ZW50TG9nZ2VyLmxvZygnQ29udGludWluZyBwcm9maWxlIGRldGVjdGlvbiBzY3JpcHQgYWZ0ZXIgbmF2aWdhdGlvbicpXG4gICAgc2V0VGltZW91dCgoKSA9PiBjb250aW51ZVByb2ZpbGVEZXRlY3Rpb25TY3JpcHQoKSwgMjAwMClcbiAgfVxuXG4gIC8vIENvbnRpbnVlIHByb2ZpbGUgc2NyaXB0IGFmdGVyIHN3aXRjaGluZyB0byBwb3N0c1xuICBpZiAoc2NyaXB0U3RhZ2UgPT09ICdwcm9maWxlLXN3aXRjaGluZy10by1wb3N0cycgJiYgdXJsLmluY2x1ZGVzKCcvc3VibWl0dGVkJykpIHtcbiAgICBjb250ZW50TG9nZ2VyLmxvZygnQ29udGludWluZyBwcm9maWxlIGRldGVjdGlvbiBzY3JpcHQgb24gcG9zdHMgcGFnZScpXG4gICAgc2V0VGltZW91dCgoKSA9PiBjb250aW51ZVByb2ZpbGVEYXRhQ29sbGVjdGlvbigpLCAyMDAwKVxuICB9XG5cbiAgLy8gU2NyaXB0IDI6IFBvc3Qgc3VibWlzc2lvbiBzY3JpcHRcbiAgaWYgKGF1dG9SdW5TZXR0aW5ncy5wb3N0U3VibWlzc2lvbiAmJiB1cmwuaW5jbHVkZXMoJ3JlZGRpdC5jb20vc3VibWl0JykpIHtcbiAgICBjb250ZW50TG9nZ2VyLmxvZygnQXV0by1ydW5uaW5nIHBvc3Qgc3VibWlzc2lvbiBzY3JpcHQnKVxuICAgIHNldFRpbWVvdXQoKCkgPT4gcnVuUG9zdFN1Ym1pc3Npb25TY3JpcHQoKSwgMjAwMClcbiAgfVxufVxuXG5pZiAoaXNSZWRkaXRQYWdlKSB7XG4gIGluaXRpYWxpemVSZWRkaXRJbnRlZ3JhdGlvbigpXG4gIC8vIEF1dG8tcnVuIHNjcmlwdHMgZGlzYWJsZWQgdG8gcHJldmVudCB0YWIgY3JlYXRpb24gaXNzdWVzXG4gIC8vIHJvdXRlQXV0b1J1blNjcmlwdCgpXG5cbiAgLy8gSW5pdGlhbGl6ZSB1c2VybmFtZSBjYWNoZSBmcm9tIHN0b3JhZ2VcbiAgaW5pdGlhbGl6ZVVzZXJuYW1lQ2FjaGUoKVxufVxuXG5mdW5jdGlvbiByZW1vdmVCZWZvcmVVbmxvYWRMaXN0ZW5lcnMoKSB7XG4gIGNvbnRlbnRMb2dnZXIubG9nKCdSZW1vdmluZyBSZWRkaXRcXCdzIGJlZm9yZXVubG9hZCBldmVudCBsaXN0ZW5lcnMgdG8gcHJldmVudCBcIkxlYXZlIHNpdGU/XCIgZGlhbG9nJylcblxuICAvLyBSZW1vdmUgd2luZG93IG9uYmVmb3JldW5sb2FkIGhhbmRsZXJcbiAgd2luZG93Lm9uYmVmb3JldW5sb2FkID0gbnVsbFxuXG4gIC8vIEFkZCBvdXIgb3duIHBhc3NpdmUgYmVmb3JldW5sb2FkIGxpc3RlbmVyIHRoYXQgcHJldmVudHMgdGhlIGRpYWxvZ1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgKGUpID0+IHtcbiAgICAvLyBQcmV2ZW50IHRoZSBkZWZhdWx0IGJlaGF2aW9yIGFuZCBkb24ndCBzaG93IGFueSBkaWFsb2dcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBlLnJldHVyblZhbHVlID0gbnVsbFxuICAgIHJldHVybiBudWxsXG4gIH0sIHRydWUpXG5cbiAgY29udGVudExvZ2dlci5sb2coJ0JlZm9yZXVubG9hZCBsaXN0ZW5lcnMgZGlzYWJsZWQgc3VjY2Vzc2Z1bGx5Jylcbn1cblxuZnVuY3Rpb24gaW5pdGlhbGl6ZVJlZGRpdEludGVncmF0aW9uKCkge1xuICBjb250ZW50TG9nZ2VyLmxvZygnSW5pdGlhbGl6aW5nIFJlZGRpdCBpbnRlZ3JhdGlvbicpXG5cbiAgLy8gUmVtb3ZlIFJlZGRpdCdzIGJlZm9yZXVubG9hZCBldmVudCBsaXN0ZW5lcnMgdG8gcHJldmVudCBcIkxlYXZlIHNpdGU/XCIgZGlhbG9nXG4gIHJlbW92ZUJlZm9yZVVubG9hZExpc3RlbmVycygpXG5cbiAgLy8gTm90aWZ5IGJhY2tncm91bmQgdGhhdCB3ZSBhcmUgcmVhZHkgaW1tZWRpYXRlbHlcbiAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgdHlwZTogJ0NPTlRFTlRfU0NSSVBUX1JFQURZJyxcbiAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWZcbiAgfSk7XG5cbiAgLy8gVVJMIFBvbGxlciBmb3IgU1BBIG5hdmlnYXRpb24gZGV0ZWN0aW9uXG4gIGxldCBsYXN0VXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRVcmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICAgIGlmIChjdXJyZW50VXJsICE9PSBsYXN0VXJsKSB7XG4gICAgICAgICAgbGFzdFVybCA9IGN1cnJlbnRVcmw7XG4gICAgICAgICAgY29udGVudExvZ2dlci5sb2coJ1VSTCBDaGFuZ2VkIChQb2xsZXIpOicsIGN1cnJlbnRVcmwpO1xuICAgICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgdHlwZTogJ1VSTF9DSEFOR0VEJyxcbiAgICAgICAgICAgICAgdXJsOiBjdXJyZW50VXJsXG4gICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAvLyBJZ25vcmUgY29udGV4dCBpbnZhbGlkYXRpb24gZHVyaW5nIGRldmVsb3BtZW50XG4gICAgICAgICAgICAgaWYgKCFlcnIubWVzc2FnZS5pbmNsdWRlcygnRXh0ZW5zaW9uIGNvbnRleHQgaW52YWxpZGF0ZWQnKSkge1xuICAgICAgICAgICAgICAgICBjb250ZW50TG9nZ2VyLndhcm4oJ1VSTCBQb2xsZXIgZXJyb3I6JywgZXJyKTtcbiAgICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gIH0sIDEwMDApO1xuXG4gIC8vIEFkZCBleHRlbnNpb24gYnV0dG9uIHRvIFJlZGRpdCBpbnRlcmZhY2VcbiAgYWRkRXh0ZW5zaW9uQnV0dG9uKClcblxuICAvLyBUcmFjayByZWNlbnRseSBwcm9jZXNzZWQgbWVzc2FnZXMgdG8gcHJldmVudCBkdXBsaWNhdGVzXG4gIGNvbnN0IHJlY2VudE1lc3NhZ2VzID0gbmV3IFNldCgpO1xuXG4gIC8vIExpc3RlbiBmb3IgbWVzc2FnZXMgZnJvbSBiYWNrZ3JvdW5kIHNjcmlwdFxuICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gICAgY29udGVudExvZ2dlci5sb2coJ0NvbnRlbnQgc2NyaXB0IHJlY2VpdmVkIG1lc3NhZ2U6JywgbWVzc2FnZSlcblxuICAgIGlmIChtZXNzYWdlLnR5cGUgPT09ICdQSU5HJykge1xuICAgICAgc2VuZFJlc3BvbnNlKHsgcG9uZzogdHJ1ZSwgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZiB9KVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICAvLyBGb3IgU1RBUlRfUE9TVF9DUkVBVElPTiwgdXNlIG1vcmUgc3BlY2lmaWMgZGVkdXBsaWNhdGlvbiB0byBhdm9pZCBibG9ja2luZyB2YWxpZCByZXRyaWVzXG4gICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ1NUQVJUX1BPU1RfQ1JFQVRJT04nKSB7XG4gICAgICBjb25zdCBtc2dLZXkgPSBgJHttZXNzYWdlLnR5cGV9LSR7bWVzc2FnZS51c2VyTmFtZX0tJHtKU09OLnN0cmluZ2lmeShtZXNzYWdlLnBvc3REYXRhKX1gO1xuICAgICAgaWYgKHJlY2VudE1lc3NhZ2VzLmhhcyhtc2dLZXkpKSB7XG4gICAgICAgIGNvbnRlbnRMb2dnZXIubG9nKCdJZ25vcmluZyBkdXBsaWNhdGUgU1RBUlRfUE9TVF9DUkVBVElPTiBtZXNzYWdlJyk7XG4gICAgICAgIHNlbmRSZXNwb25zZSh7IHJlY2VpdmVkOiB0cnVlLCBkZWR1cGxpY2F0ZWQ6IHRydWUgfSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmVjZW50TWVzc2FnZXMuYWRkKG1zZ0tleSk7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHJlY2VudE1lc3NhZ2VzLmRlbGV0ZShtc2dLZXkpLCA1MDAwKTsgLy8gTG9uZ2VyIHRpbWVvdXQgZm9yIHBvc3QgY3JlYXRpb25cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gR2VuZXJhbCBkZWJvdW5jZSBmb3Igb3RoZXIgbWVzc2FnZSB0eXBlc1xuICAgICAgY29uc3QgbXNnS2V5ID0gYCR7bWVzc2FnZS50eXBlfS1yZWNlbnRgO1xuICAgICAgaWYgKHJlY2VudE1lc3NhZ2VzLmhhcyhtc2dLZXkpKSB7XG4gICAgICAgIHNlbmRSZXNwb25zZSh7IHJlY2VpdmVkOiB0cnVlLCBkZWR1cGxpY2F0ZWQ6IHRydWUgfSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmVjZW50TWVzc2FnZXMuYWRkKG1zZ0tleSk7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHJlY2VudE1lc3NhZ2VzLmRlbGV0ZShtc2dLZXkpLCA1MDApO1xuICAgIH1cblxuICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICBjYXNlICdSRURESVRfUEFHRV9MT0FERUQnOlxuICAgICAgICBoYW5kbGVQYWdlTG9hZGVkKG1lc3NhZ2UudXJsKVxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdGSUxMX1BPU1RfRk9STSc6XG4gICAgICAgIGZpbGxQb3N0Rm9ybShtZXNzYWdlLmRhdGEpXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ0dFVF9QQUdFX0lORk8nOlxuICAgICAgICBzZW5kUmVzcG9uc2UoZ2V0UGFnZUluZm8oKSlcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnU1RBUlRfUE9TVF9DUkVBVElPTic6XG4gICAgICAgIGhhbmRsZVN0YXJ0UG9zdENyZWF0aW9uKG1lc3NhZ2UudXNlck5hbWUsIG1lc3NhZ2UucG9zdERhdGEpXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ0VYVFJBQ1RfVVNFUk5BTUVfQU5EX0NSRUFURV9QT1NUJzpcbiAgICAgICAgaGFuZGxlRXh0cmFjdFVzZXJuYW1lQW5kQ3JlYXRlUG9zdCgpXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ0NIRUNLX1VTRVJfU1RBVFVTJzpcbiAgICAgICAgaGFuZGxlQ2hlY2tVc2VyU3RhdHVzKG1lc3NhZ2UudXNlck5hbWUpXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ0RFTEVURV9MQVNUX1BPU1QnOlxuXHQgICAgICAgIC8vIFN0YXJ0IGRlbGV0ZSBmbG93IGFuZCBpbW1lZGlhdGVseSBhY2tub3dsZWRnZSByZWNlaXB0IHRvIGF2b2lkXG5cdCAgICAgICAgLy8gXCJhc3luY2hyb25vdXMgcmVzcG9uc2VcIiBlcnJvcnMgaW4gdGhlIHNlbmRlci4gVGhlIGFjdHVhbFxuXHQgICAgICAgIC8vIGNvbXBsZXRpb24gcmVzdWx0IGlzIHJlcG9ydGVkIHNlcGFyYXRlbHkgdmlhIEFDVElPTl9DT01QTEVURUQuXG5cdCAgICAgICAgaGFuZGxlRGVsZXRlTGFzdFBvc3QobWVzc2FnZS51c2VyTmFtZSlcblx0ICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdGFydGVkOiB0cnVlIH0pXG5cdCAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnQkdfTE9HJzpcbiAgICAgICAgLy8gVmlzdWFsIGxvZ2dpbmcgZm9yIGRlYnVnZ2luZyBmcm9tIGJhY2tncm91bmQgc2NyaXB0XG4gICAgICAgIGNvbnRlbnRMb2dnZXIubG9nKGAlY1tCQUNLR1JPVU5EXSAke21lc3NhZ2UubWVzc2FnZX1gLCAnY29sb3I6ICNmZjAwZmY7IGZvbnQtd2VpZ2h0OiBib2xkOycpXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ1JFRERJVF9QT1NUX01BQ0hJTkVfTkFWSUdBVEVfUE9TVFMnOlxuICAgICAgICBjb250ZW50TG9nZ2VyLmxvZygnW0NvbnRlbnQgU2NyaXB0XSBSZWNlaXZlZCBjb21tYW5kOiBOQVZJR0FURV9QT1NUUycsIG1lc3NhZ2UpXG4gICAgICAgIHNlbmRSZXNwb25zZSh7IHN0YXJ0ZWQ6IHRydWUgfSlcbiAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICB0eXBlOiAnUkVERElUX1BPU1RfTUFDSElORV9OQVZJR0FURV9QT1NUUycsXG4gICAgICAgICAgcGF5bG9hZDogbWVzc2FnZS5wYXlsb2FkXG4gICAgICAgIH0sICcqJylcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnUkVERElUX1BPU1RfTUFDSElORV9HRVRfUE9TVFMnOlxuICAgICAgICBjb250ZW50TG9nZ2VyLmxvZygnW0NvbnRlbnQgU2NyaXB0XSBSZWNlaXZlZCBjb21tYW5kOiBHRVRfUE9TVFMnLCBtZXNzYWdlKVxuICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdGFydGVkOiB0cnVlIH0pXG4gICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgdHlwZTogJ1JFRERJVF9QT1NUX01BQ0hJTkVfR0VUX1BPU1RTJyxcbiAgICAgICAgICBwYXlsb2FkOiBtZXNzYWdlLnBheWxvYWRcbiAgICAgICAgfSwgJyonKVxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdSRURESVRfUE9TVF9NQUNISU5FX05BVklHQVRFX1BST0ZJTEUnOlxuICAgICAgICBjb250ZW50TG9nZ2VyLmxvZygnW0NvbnRlbnQgU2NyaXB0XSBSZWNlaXZlZCBjb21tYW5kOiBOQVZJR0FURV9QUk9GSUxFJywgbWVzc2FnZSlcbiAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3RhcnRlZDogdHJ1ZSB9KVxuICAgICAgICBoYW5kbGVDaGVja1VzZXJTdGF0dXMobWVzc2FnZS5wYXlsb2FkLnVzZXJOYW1lKVxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdSRURESVRfUE9TVF9NQUNISU5FX0RFTEVURV9QT1NUJzpcbiAgICAgICAgY29udGVudExvZ2dlci5sb2coJ1tDb250ZW50IFNjcmlwdF0gUmVjZWl2ZWQgY29tbWFuZDogREVMRVRFX1BPU1QnLCBtZXNzYWdlKVxuICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdGFydGVkOiB0cnVlIH0pXG4gICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgdHlwZTogJ1JFRERJVF9QT1NUX01BQ0hJTkVfREVMRVRFX1BPU1QnLFxuICAgICAgICAgIHBheWxvYWQ6IG1lc3NhZ2UucGF5bG9hZFxuICAgICAgICB9LCAnKicpXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ01BTlVBTF9UUklHR0VSX1NDUklQVCc6XG4gICAgICAgIGNvbnRlbnRMb2dnZXIubG9nKCdbQ29udGVudCBTY3JpcHRdIFJlY2VpdmVkIG1hbnVhbCB0cmlnZ2VyOicsIG1lc3NhZ2UpXG4gICAgICAgIGhhbmRsZU1hbnVhbFNjcmlwdFRyaWdnZXIobWVzc2FnZS5zY3JpcHRUeXBlLCBtZXNzYWdlLm1vZGUpXG4gICAgICAgIHNlbmRSZXNwb25zZSh7IHN0YXJ0ZWQ6IHRydWUgfSlcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnR0VUX0ZSRVNIX1BPU1RTX0ZPUl9ERUNJU0lPTic6XG4gICAgICAgIGNvbnRlbnRMb2dnZXIubG9nKCdbQ29udGVudCBTY3JpcHRdIFJlY2VpdmVkIEdFVF9GUkVTSF9QT1NUU19GT1JfREVDSVNJT046JywgbWVzc2FnZSlcbiAgICAgICAgaGFuZGxlR2V0RnJlc2hQb3N0c0ZvckRlY2lzaW9uKG1lc3NhZ2UudXNlck5hbWUpXG4gICAgICAgIHNlbmRSZXNwb25zZSh7IHN0YXJ0ZWQ6IHRydWUgfSlcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnUkVNT1ZFX0JFRk9SRVVOTE9BRF9MSVNURU5FUlMnOlxuICAgICAgICBjb250ZW50TG9nZ2VyLmxvZygnW0NvbnRlbnQgU2NyaXB0XSBSZWNlaXZlZCBSRU1PVkVfQkVGT1JFVU5MT0FEX0xJU1RFTkVSUyBjb21tYW5kJylcbiAgICAgICAgcmVtb3ZlQmVmb3JlVW5sb2FkTGlzdGVuZXJzKClcbiAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KVxuICAgICAgICBicmVha1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb250ZW50TG9nZ2VyLndhcm4oJ1Vua25vd24gbWVzc2FnZSB0eXBlOicsIG1lc3NhZ2UudHlwZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9KVxufVxuXG5mdW5jdGlvbiBhZGRFeHRlbnNpb25CdXR0b24oKSB7XG4gIC8vIExvb2sgZm9yIHRoZSBzdWJtaXQgcG9zdCBidXR0b24gb3IgY3JlYXRlIHBvc3QgYXJlYVxuICBjb25zdCBzdWJtaXRBcmVhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtdGVzdGlkPVwic3VibWl0LXBhZ2VcIl0nKSB8fFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc3VibWl0LXBhZ2UnKSB8fFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbmV3bGluaycpXG5cbiAgaWYgKHN1Ym1pdEFyZWEgJiYgIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZWRkaXQtcG9zdC1tYWNoaW5lLWJ0bicpKSB7XG4gICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJylcbiAgICBidXR0b24uY2xhc3NOYW1lID0gJ3JlZGRpdC1wb3N0LW1hY2hpbmUtYnRuJ1xuICAgIGJ1dHRvbi5pbm5lckhUTUwgPSAnXHVEODNEXHVERTgwIFBvc3QgTWFjaGluZSdcbiAgICBidXR0b24uc3R5bGUuY3NzVGV4dCA9IGBcbiAgICAgIGJhY2tncm91bmQ6ICMxOTc2ZDI7XG4gICAgICBjb2xvcjogd2hpdGU7XG4gICAgICBib3JkZXI6IG5vbmU7XG4gICAgICBwYWRkaW5nOiA4cHggMTZweDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICAgIG1hcmdpbjogOHB4O1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgYFxuXG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgb3BlbkV4dGVuc2lvblBvcHVwKClcbiAgICB9KVxuXG4gICAgLy8gSW5zZXJ0IHRoZSBidXR0b25cbiAgICBzdWJtaXRBcmVhLmluc2VydEJlZm9yZShidXR0b24sIHN1Ym1pdEFyZWEuZmlyc3RDaGlsZClcbiAgICBjb250ZW50TG9nZ2VyLmxvZygnUmVkZGl0IFBvc3QgTWFjaGluZSBidXR0b24gYWRkZWQnKVxuICB9XG59XG5cbmZ1bmN0aW9uIG9wZW5FeHRlbnNpb25Qb3B1cCgpIHtcbiAgLy8gU2VuZCBtZXNzYWdlIHRvIGJhY2tncm91bmQgc2NyaXB0IHRvIG9wZW4gZXh0ZW5zaW9uXG4gIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICB0eXBlOiAnT1BFTl9FWFRFTlNJT04nLFxuICAgIHNvdXJjZTogJ2NvbnRlbnQtc2NyaXB0J1xuICB9KVxufVxuXG5mdW5jdGlvbiBoYW5kbGVQYWdlTG9hZGVkKHVybCkge1xuICBjb250ZW50TG9nZ2VyLmxvZygnUmVkZGl0IHBhZ2UgbG9hZGVkOicsIHVybClcblxuICAvLyBSZS1hZGQgYnV0dG9uIGlmIG5lZWRlZCAoaW4gY2FzZSBwYWdlIHdhcyBkeW5hbWljYWxseSBsb2FkZWQpXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGFkZEV4dGVuc2lvbkJ1dHRvbigpXG4gIH0sIDEwMDApXG5cbiAgLy8gQ2hlY2sgaWYgd2UncmUgb24gdGhlIHN1Ym1pdCBwYWdlIGFuZCBoYXZlIHBvc3QgZGF0YSB0byBjb250aW51ZVxuICBpZiAodXJsLmluY2x1ZGVzKCdyZWRkaXQuY29tL3N1Ym1pdCcpKSB7XG4gICAgY29udGVudExvZ2dlci5sb2coJ09uIHN1Ym1pdCBwYWdlLCBjaGVja2luZyBmb3IgcG9zdCBkYXRhJylcblxuICAgIGNvbnN0IHN0b3JlZFBvc3REYXRhID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgncmVkZGl0LXBvc3QtbWFjaGluZS1wb3N0ZGF0YScpXG4gICAgaWYgKHN0b3JlZFBvc3REYXRhKSB7XG4gICAgICBjb25zdCBwb3N0RGF0YSA9IEpTT04ucGFyc2Uoc3RvcmVkUG9zdERhdGEpXG4gICAgICBjb250ZW50TG9nZ2VyLmxvZygnRm91bmQgc3RvcmVkIHBvc3QgZGF0YSwgY29udGludWluZyBwb3N0IGNyZWF0aW9uOicsIHBvc3REYXRhKVxuXG4gICAgICAvLyBFeHRyYWN0IHVzZXJuYW1lIGZyb20gcG9zdCBkYXRhIG9yIHVzZSBhIGRlZmF1bHRcbiAgICAgIGNvbnN0IHVzZXJOYW1lID0gcG9zdERhdGEudXNlck5hbWUgfHwgJ1VzZXInXG5cbiAgICAgIC8vIFNob3cgd2VsY29tZSBtZXNzYWdlIGFuZCBmaWxsIGZvcm1cbiAgICAgIHNob3dXZWxjb21lTWVzc2FnZSh1c2VyTmFtZSlcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gZmlsbFBvc3RGb3JtKHBvc3REYXRhKSwgMTAwMClcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGVudExvZ2dlci5sb2coJ05vIHN0b3JlZCBwb3N0IGRhdGEgZm91bmQnKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBmaWxsUG9zdEZvcm0oZGF0YSkge1xuICBjb250ZW50TG9nZ2VyLmxvZygnU3RhcnRpbmcgcG9zdCBjcmVhdGlvbiB3aXRoIHdvcmtpbmcgbG9naWM6JywgZGF0YSlcblxuICAvLyBVc2UgdGhlIHdvcmtpbmcgcG9zdCBjcmVhdGlvbiBsb2dpY1xuICBjcmVhdGVQb3N0V2l0aFdvcmtpbmdDb2RlKGRhdGEpXG59XG5cbi8vIFdvcmtpbmcgcG9zdCBjcmVhdGlvbiBsb2dpYyBmcm9tIHBvc3RtLXBhZ2UuanNcbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVBvc3RXaXRoV29ya2luZ0NvZGUocG9zdERhdGEpIHtcbiAgY29udGVudExvZ2dlci5sb2coJ0NyZWF0aW5nIHBvc3Qgd2l0aCB3b3JraW5nIGxvZ2ljLi4uJylcblxuICAvLyBSZW1vdmUgYmVmb3JldW5sb2FkIGxpc3RlbmVycyB0byBwcmV2ZW50IFwiTGVhdmUgc2l0ZT9cIiBkaWFsb2dcbiAgcmVtb3ZlQmVmb3JlVW5sb2FkTGlzdGVuZXJzKClcblxuICBpZiAoIXdpbmRvdy5sb2NhdGlvbi5ocmVmLmluY2x1ZGVzKCcvc3VibWl0JykpIHtcbiAgICBjb250ZW50TG9nZ2VyLmxvZygnUmVkaXJlY3RpbmcgdG8gc3VibWlzc2lvbiBwYWdlLi4uJylcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICdodHRwczovL3d3dy5yZWRkaXQuY29tL3N1Ym1pdCdcbiAgICBhd2FpdCBzbGVlcCg1MDAwKVxuICB9XG5cbiAgY29udGVudExvZ2dlci5sb2coJ1dhaXRpbmcgZm9yIHBvc3QgY3JlYXRpb24gcGFnZSB0byBsb2FkLi4uJylcbiAgYXdhaXQgc2xlZXAoMjAwMClcblxuICAvLyBSZW1vdmUgYmVmb3JldW5sb2FkIGxpc3RlbmVycyBhZ2FpbiBhZnRlciBwYWdlIGxvYWRcbiAgcmVtb3ZlQmVmb3JlVW5sb2FkTGlzdGVuZXJzKClcblxuICBjb250ZW50TG9nZ2VyLmxvZygnPT09IFNURVAgMTogVEVYVCBUQUIgLSBGaWxsaW5nIHRpdGxlID09PScpXG4gIGlmIChhd2FpdCBjbGlja1RhYignVEVYVCcpKSB7XG4gICAgYXdhaXQgZmlsbFRpdGxlKHBvc3REYXRhLnRpdGxlKVxuICB9IGVsc2Uge1xuICAgIGNvbnRlbnRMb2dnZXIubG9nKCdDYW5ub3QgcHJvY2VlZCB3aXRob3V0IFRFWFQgdGFiJylcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGNvbnRlbnRMb2dnZXIubG9nKCc9PT0gU1RFUCAyOiBMSU5LIFRBQiAtIEZpbGxpbmcgVVJMID09PScpXG4gIGlmIChhd2FpdCBjbGlja1RhYignTElOSycpKSB7XG4gICAgYXdhaXQgZmlsbFVybChwb3N0RGF0YS51cmwpXG4gIH0gZWxzZSB7XG4gICAgY29udGVudExvZ2dlci5sb2coJ0Nhbm5vdCBwcm9jZWVkIHdpdGhvdXQgTElOSyB0YWInKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgY29udGVudExvZ2dlci5sb2coJz09PSBTVEVQIDM6IEFjdGl2YXRpbmcgUG9zdCBidXR0b24gYnkgY2xpY2tpbmcgYm9keSBmaWVsZCA9PT0nKVxuICBhd2FpdCBjbGlja0JvZHlGaWVsZCgpXG4gIGF3YWl0IHNsZWVwKDEwMDApXG5cbiAgY29udGVudExvZ2dlci5sb2coJz09PSBTVEVQIDQ6IEZpbGxpbmcgYm9keSB0ZXh0ID09PScpXG4gIGF3YWl0IGZpbGxCb2R5VGV4dChwb3N0RGF0YS5ib2R5IHx8IHBvc3REYXRhLmRlc2NyaXB0aW9uKVxuXG4gIGNvbnRlbnRMb2dnZXIubG9nKCc9PT0gU1RFUCA1OiBGaW5hbCBhY3RpdmF0aW9uIGNsaWNrIG9uIGJvZHkgZmllbGQgPT09JylcbiAgYXdhaXQgY2xpY2tCb2R5RmllbGQoKVxuICBhd2FpdCBzbGVlcCgxMDAwKVxuXG4gIGNvbnRlbnRMb2dnZXIubG9nKCc9PT0gU1RFUCA2OiBDbGlja2luZyBQb3N0IGJ1dHRvbiA9PT0nKVxuICBjb25zdCBwb3N0Q2xpY2tlZCA9IGF3YWl0IGNsaWNrUG9zdEJ1dHRvbigpXG5cbiAgaWYgKHBvc3RDbGlja2VkKSB7XG4gICAgY29udGVudExvZ2dlci5sb2coJ1Bvc3QgYnV0dG9uIGNsaWNrZWQsIHdhaXRpbmcgZm9yIHJlc3BvbnNlLi4uJylcblxuICAgIC8vIE1vbml0b3IgZm9yIHN1Ym1pc3Npb24gY29tcGxldGlvbiBmb3IgdXAgdG8gMzAgc2Vjb25kc1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KClcbiAgICBjb25zdCB0aW1lb3V0ID0gMzAwMDAgLy8gMzAgc2Vjb25kc1xuXG4gICAgd2hpbGUgKERhdGUubm93KCkgLSBzdGFydFRpbWUgPCB0aW1lb3V0KSB7XG4gICAgICBhd2FpdCBzbGVlcCgxMDAwKVxuXG4gICAgICAvLyBDaGVjayBpZiB3ZSd2ZSBiZWVuIHJlZGlyZWN0ZWQgYXdheSBmcm9tIHN1Ym1pdCBwYWdlIChzdWNjZXNzKVxuICAgICAgaWYgKCF3aW5kb3cubG9jYXRpb24uaHJlZi5pbmNsdWRlcygnL3N1Ym1pdCcpKSB7XG4gICAgICAgIGNvbnRlbnRMb2dnZXIubG9nKCdTVUNDRVNTOiBSZWRpcmVjdGVkIGZyb20gc3VibWlzc2lvbiBwYWdlIC0gcG9zdCBzdWJtaXR0ZWQhJylcblxuICAgICAgICAvLyBOb3RpZnkgYmFja2dyb3VuZCB0aGF0IHBvc3QgY3JlYXRpb24gaXMgY29tcGxldGVcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgIHR5cGU6ICdBQ1RJT05fQ09NUExFVEVEJyxcbiAgICAgICAgICBhY3Rpb246ICdQT1NUX0NSRUFUSU9OX0NPTVBMRVRFRCcsXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgIGNvbnRlbnRMb2dnZXIud2FybignRmFpbGVkIHRvIG5vdGlmeSBiYWNrZ3JvdW5kIG9mIGNvbXBsZXRpb246JywgZXJyKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGZvciBlcnJvciBtZXNzYWdlcyAocG9zdCByZWplY3RlZClcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZXMgPSBxc0FsbCgnW3JvbGU9XCJhbGVydFwiXSwgLmVycm9yLW1lc3NhZ2UsIFtjbGFzcyo9XCJlcnJvclwiXSwgW2NsYXNzKj1cIm1vZGVyYXRvclwiXScpXG4gICAgICBmb3IgKGNvbnN0IGVycm9yIG9mIGVycm9yTWVzc2FnZXMpIHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGVycm9yLnRleHRDb250ZW50Py50b0xvd2VyQ2FzZSgpIHx8ICcnXG4gICAgICAgIGlmICh0ZXh0LmluY2x1ZGVzKCdydWxlJykgfHwgdGV4dC5pbmNsdWRlcygndmlvbGF0aW9uJykgfHwgdGV4dC5pbmNsdWRlcygncmVtb3ZlJykpIHtcbiAgICAgICAgICBjb250ZW50TG9nZ2VyLmxvZygnUG9zdCByZWplY3RlZCBkdWUgdG8gcnVsZSB2aW9sYXRpb25zOicsIHRleHQuc3Vic3RyaW5nKDAsIDEwMCkpXG5cbiAgICAgICAgICAvLyBOb3RpZnkgYmFja2dyb3VuZCB0aGF0IHBvc3QgY3JlYXRpb24gZmFpbGVkXG4gICAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgdHlwZTogJ0FDVElPTl9DT01QTEVURUQnLFxuICAgICAgICAgICAgYWN0aW9uOiAnUE9TVF9DUkVBVElPTl9DT01QTEVURUQnLFxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogJ1Bvc3QgcmVqZWN0ZWQgZHVlIHRvIHJ1bGUgdmlvbGF0aW9ucydcbiAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgY29udGVudExvZ2dlci53YXJuKCdGYWlsZWQgdG8gbm90aWZ5IGJhY2tncm91bmQgb2YgZmFpbHVyZTonLCBlcnIpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGlmIHBvc3QgaXMgc3RpbGwgYmVpbmcgcHJvY2Vzc2VkIChsb2FkaW5nIHN0YXRlcylcbiAgICAgIGNvbnN0IGxvYWRpbmdFbGVtZW50cyA9IHFzQWxsKCdbZGF0YS10ZXN0aWQqPVwibG9hZGluZ1wiXSwgLmxvYWRpbmcsIFtjbGFzcyo9XCJsb2FkaW5nXCJdLCBbYXJpYS1idXN5PVwidHJ1ZVwiXScpXG4gICAgICBpZiAobG9hZGluZ0VsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29udGVudExvZ2dlci5sb2coJ1Bvc3Qgc3RpbGwgYmVpbmcgcHJvY2Vzc2VkLi4uJylcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaW1lb3V0IHJlYWNoZWQgLSB1bmNsZWFyIHdoYXQgaGFwcGVuZWRcbiAgICBjb250ZW50TG9nZ2VyLmxvZygnUG9zdCBzdWJtaXNzaW9uIHRpbWVvdXQgLSBzdGF0dXMgdW5jbGVhcicpXG5cbiAgICAvLyBOb3RpZnkgYmFja2dyb3VuZCBvZiB0aW1lb3V0XG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgdHlwZTogJ0FDVElPTl9DT01QTEVURUQnLFxuICAgICAgYWN0aW9uOiAnUE9TVF9DUkVBVElPTl9DT01QTEVURUQnLFxuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBlcnJvcjogJ1Bvc3Qgc3VibWlzc2lvbiB0aW1lb3V0J1xuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICBjb250ZW50TG9nZ2VyLndhcm4oJ0ZhaWxlZCB0byBub3RpZnkgYmFja2dyb3VuZCBvZiB0aW1lb3V0OicsIGVycilcbiAgICB9KVxuXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgfSBlbHNlIHtcbiAgICBjb250ZW50TG9nZ2VyLmxvZygnRkFJTEVEOiBDb3VsZCBub3QgY2xpY2sgUG9zdCBidXR0b24nKVxuXG4gICAgLy8gTm90aWZ5IGJhY2tncm91bmQgdGhhdCBwb3N0IGNyZWF0aW9uIGZhaWxlZFxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgIHR5cGU6ICdBQ1RJT05fQ09NUExFVEVEJyxcbiAgICAgIGFjdGlvbjogJ1BPU1RfQ1JFQVRJT05fQ09NUExFVEVEJyxcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdDb3VsZCBub3QgY2xpY2sgUG9zdCBidXR0b24nXG4gICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIGNvbnRlbnRMb2dnZXIud2FybignRmFpbGVkIHRvIG5vdGlmeSBiYWNrZ3JvdW5kIG9mIGJ1dHRvbiBmYWlsdXJlOicsIGVycilcbiAgICB9KVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuLy8gQ2xpY2sgdGFiIGZ1bmN0aW9uIGZyb20gd29ya2luZyBjb2RlXG5hc3luYyBmdW5jdGlvbiBjbGlja1RhYih0YWJWYWx1ZSkge1xuICBjb250ZW50TG9nZ2VyLmxvZyhgQ2xpY2tpbmcgdGFiIHdpdGggZGF0YS1zZWxlY3QtdmFsdWU9XCIke3RhYlZhbHVlfVwiYClcbiAgY29uc3QgdGFiID0gZGVlcFF1ZXJ5KGBbZGF0YS1zZWxlY3QtdmFsdWU9XCIke3RhYlZhbHVlfVwiXWApXG4gIGlmICh0YWIpIHtcbiAgICB0YWIuY2xpY2soKVxuICAgIGF3YWl0IHNsZWVwKDEwMDApXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBjb250ZW50TG9nZ2VyLmxvZyhgVGFiIHdpdGggZGF0YS1zZWxlY3QtdmFsdWU9XCIke3RhYlZhbHVlfVwiIG5vdCBmb3VuZGApXG4gIHJldHVybiBmYWxzZVxufVxuXG4vLyBGaWxsIHRpdGxlIGZ1bmN0aW9uIGZyb20gd29ya2luZyBjb2RlXG5hc3luYyBmdW5jdGlvbiBmaWxsVGl0bGUodGl0bGUpIHtcbiAgY29udGVudExvZ2dlci5sb2coJ0ZpbGxpbmcgdGl0bGUuLi4nKVxuICBjb25zdCB0aXRsZUlucHV0RWxlbWVudCA9IGRlZXBRdWVyeSgnZmFjZXBsYXRlLXRleHRhcmVhLWlucHV0W25hbWU9XCJ0aXRsZVwiXScpXG4gIGlmICh0aXRsZUlucHV0RWxlbWVudCkge1xuICAgIGNvbnN0IHNoYWRvd1Jvb3QgPSB0aXRsZUlucHV0RWxlbWVudC5zaGFkb3dSb290XG4gICAgaWYgKHNoYWRvd1Jvb3QpIHtcbiAgICAgIGNvbnN0IHRpdGxlSW5wdXQgPSBzaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNpbm5lclRleHRBcmVhJylcbiAgICAgIGlmICh0aXRsZUlucHV0KSB7XG4gICAgICAgIHRpdGxlSW5wdXQuZm9jdXMoKVxuICAgICAgICBhd2FpdCBzbGVlcCgyMDApXG4gICAgICAgIHRpdGxlSW5wdXQudmFsdWUgPSB0aXRsZSB8fCBcIkN1dGUgc3BoeW54IGJhYmllcyBjYXB0dXJlIHlvdXIgaGVhcnRcIlxuICAgICAgICB0aXRsZUlucHV0LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSwgY2FuY2VsYWJsZTogdHJ1ZSB9KSlcbiAgICAgICAgdGl0bGVJbnB1dC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJywgeyBidWJibGVzOiB0cnVlLCBjYW5jZWxhYmxlOiB0cnVlIH0pKVxuICAgICAgICBjb250ZW50TG9nZ2VyLmxvZygnVGl0bGUgc2V0JylcbiAgICAgICAgYXdhaXQgc2xlZXAoNTAwKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBjb250ZW50TG9nZ2VyLmxvZygnRmFpbGVkIHRvIGZpbGwgdGl0bGUnKVxuICByZXR1cm4gZmFsc2Vcbn1cblxuLy8gRmlsbCBVUkwgZnVuY3Rpb24gZnJvbSB3b3JraW5nIGNvZGVcbmFzeW5jIGZ1bmN0aW9uIGZpbGxVcmwodXJsKSB7XG4gIGNvbnRlbnRMb2dnZXIubG9nKCdGaWxsaW5nIFVSTC4uLicpXG4gIGNvbnN0IHVybElucHV0RWxlbWVudCA9IGRlZXBRdWVyeSgnZmFjZXBsYXRlLXRleHRhcmVhLWlucHV0W25hbWU9XCJsaW5rXCJdJylcbiAgaWYgKHVybElucHV0RWxlbWVudCkge1xuICAgIGNvbnN0IHNoYWRvd1Jvb3QgPSB1cmxJbnB1dEVsZW1lbnQuc2hhZG93Um9vdFxuICAgIGlmIChzaGFkb3dSb290KSB7XG4gICAgICBjb25zdCB1cmxJbnB1dCA9IHNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2lubmVyVGV4dEFyZWEnKVxuICAgICAgaWYgKHVybElucHV0KSB7XG4gICAgICAgIGNvbnN0IHRhcmdldFVybCA9IHVybCB8fCAnaHR0cHM6Ly95b3V0dWJlLmNvbS9zaG9ydHMvMHhtaHJTX1ZOTlk/c2k9YXdZYzhpNVlsanljZXNYcSdcbiAgICAgICAgdXJsSW5wdXQuZm9jdXMoKVxuICAgICAgICBhd2FpdCBzbGVlcCgyMDApXG4gICAgICAgIHVybElucHV0LnZhbHVlID0gdGFyZ2V0VXJsXG4gICAgICAgIHVybElucHV0LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSwgY2FuY2VsYWJsZTogdHJ1ZSB9KSlcbiAgICAgICAgdXJsSW5wdXQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScsIHsgYnViYmxlczogdHJ1ZSwgY2FuY2VsYWJsZTogdHJ1ZSB9KSlcbiAgICAgICAgY29udGVudExvZ2dlci5sb2coJ1VSTCBzZXQnKVxuICAgICAgICBhd2FpdCBzbGVlcCg1MDApXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNvbnRlbnRMb2dnZXIubG9nKCdGYWlsZWQgdG8gZmlsbCBVUkwnKVxuICByZXR1cm4gZmFsc2Vcbn1cblxuLy8gQ2xpY2sgYm9keSBmaWVsZCBmdW5jdGlvbiBmcm9tIHdvcmtpbmcgY29kZVxuYXN5bmMgZnVuY3Rpb24gY2xpY2tCb2R5RmllbGQoKSB7XG4gIGNvbnRlbnRMb2dnZXIubG9nKCdDbGlja2luZyBib2R5IHRleHQgZmllbGQgdG8gYWN0aXZhdGUgUG9zdCBidXR0b24uLi4nKVxuXG4gIGNvbnN0IGJvZHlDb21wb3NlciA9IGRlZXBRdWVyeSgnc2hyZWRkaXQtY29tcG9zZXJbbmFtZT1cIm9wdGlvbmFsQm9keVwiXScpXG4gIGlmIChib2R5Q29tcG9zZXIpIHtcbiAgICBjb25zdCBib2R5RWRpdGFibGUgPSBib2R5Q29tcG9zZXIucXVlcnlTZWxlY3RvcignZGl2W2NvbnRlbnRlZGl0YWJsZT1cInRydWVcIl1bZGF0YS1sZXhpY2FsLWVkaXRvcj1cInRydWVcIl0nKVxuICAgIGlmIChib2R5RWRpdGFibGUpIHtcbiAgICAgIGNvbnRlbnRMb2dnZXIubG9nKCdGb3VuZCBMZXhpY2FsIGVkaXRvciwgY2xpY2tpbmcgdG8gYWN0aXZhdGUgUG9zdCBidXR0b24uLi4nKVxuXG4gICAgICBib2R5RWRpdGFibGUuY2xpY2soKVxuICAgICAgYXdhaXQgc2xlZXAoMTAwKVxuICAgICAgYm9keUVkaXRhYmxlLmZvY3VzKClcbiAgICAgIGF3YWl0IHNsZWVwKDEwMClcbiAgICAgIGJvZHlFZGl0YWJsZS5jbGljaygpXG5cbiAgICAgIGJvZHlFZGl0YWJsZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnZm9jdXMnLCB7IGJ1YmJsZXM6IHRydWUsIGNhbmNlbGFibGU6IHRydWUgfSkpXG4gICAgICBib2R5RWRpdGFibGUuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NsaWNrJywgeyBidWJibGVzOiB0cnVlLCBjYW5jZWxhYmxlOiB0cnVlIH0pKVxuXG4gICAgICBhd2FpdCBzbGVlcCgxMDAwKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cblxuICBjb250ZW50TG9nZ2VyLmxvZygnQm9keSB0ZXh0IGZpZWxkIG5vdCBmb3VuZCcpXG4gIHJldHVybiBmYWxzZVxufVxuXG4vLyBGaWxsIGJvZHkgdGV4dCBmdW5jdGlvbiBmcm9tIHdvcmtpbmcgY29kZVxuYXN5bmMgZnVuY3Rpb24gZmlsbEJvZHlUZXh0KGJvZHlUZXh0KSB7XG4gIGNvbnRlbnRMb2dnZXIubG9nKCdGaWxsaW5nIGJvZHkgdGV4dC4uLicpXG5cbiAgY29uc3QgYm9keUNvbXBvc2VyID0gZGVlcFF1ZXJ5KCdzaHJlZGRpdC1jb21wb3NlcltuYW1lPVwib3B0aW9uYWxCb2R5XCJdJylcbiAgaWYgKGJvZHlDb21wb3Nlcikge1xuICAgIGNvbnN0IGJvZHlFZGl0YWJsZSA9IGJvZHlDb21wb3Nlci5xdWVyeVNlbGVjdG9yKCdkaXZbY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXVtkYXRhLWxleGljYWwtZWRpdG9yPVwidHJ1ZVwiXScpXG4gICAgaWYgKGJvZHlFZGl0YWJsZSkge1xuICAgICAgY29udGVudExvZ2dlci5sb2coJ0ZvdW5kIExleGljYWwgZWRpdG9yLCBzZXR0aW5nIHRleHQuLi4nKVxuXG4gICAgICBib2R5RWRpdGFibGUuZm9jdXMoKVxuICAgICAgYXdhaXQgc2xlZXAoMjAwKVxuXG4gICAgICBib2R5RWRpdGFibGUuaW5uZXJIVE1MID0gJzxwPjxicj48L3A+J1xuXG4gICAgICBjb25zdCB0ZXh0ID0gYm9keVRleHQgfHwgXCIjc2hvcnRzICAjc3BoeW54ICNtaXNzbWVybWFpZCAja2l0dGVuICNjYXRcIlxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRleHQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY2hhciA9IHRleHRbaV1cblxuICAgICAgICBib2R5RWRpdGFibGUuZGlzcGF0Y2hFdmVudChuZXcgS2V5Ym9hcmRFdmVudCgna2V5ZG93bicsIHtcbiAgICAgICAgICBrZXk6IGNoYXIsXG4gICAgICAgICAgY29kZTogY2hhciA9PT0gJyAnID8gJ1NwYWNlJyA6IGBLZXkke2NoYXIudG9VcHBlckNhc2UoKX1gLFxuICAgICAgICAgIGtleUNvZGU6IGNoYXIuY2hhckNvZGVBdCgwKSxcbiAgICAgICAgICB3aGljaDogY2hhci5jaGFyQ29kZUF0KDApLFxuICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgICB9KSlcblxuICAgICAgICBpZiAoZG9jdW1lbnQuZXhlY0NvbW1hbmQgJiYgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2luc2VydFRleHQnLCBmYWxzZSwgY2hhcikpIHtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKClcbiAgICAgICAgICBpZiAoc2VsZWN0aW9uLnJhbmdlQ291bnQgPiAwKSB7XG4gICAgICAgICAgICBjb25zdCByYW5nZSA9IHNlbGVjdGlvbi5nZXRSYW5nZUF0KDApXG4gICAgICAgICAgICByYW5nZS5kZWxldGVDb250ZW50cygpXG4gICAgICAgICAgICBjb25zdCB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNoYXIpXG4gICAgICAgICAgICByYW5nZS5pbnNlcnROb2RlKHRleHROb2RlKVxuICAgICAgICAgICAgcmFuZ2Uuc2V0U3RhcnRBZnRlcih0ZXh0Tm9kZSlcbiAgICAgICAgICAgIHJhbmdlLnNldEVuZEFmdGVyKHRleHROb2RlKVxuICAgICAgICAgICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpXG4gICAgICAgICAgICBzZWxlY3Rpb24uYWRkUmFuZ2UocmFuZ2UpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYm9keUVkaXRhYmxlLmRpc3BhdGNoRXZlbnQobmV3IElucHV0RXZlbnQoJ2lucHV0Jywge1xuICAgICAgICAgIGlucHV0VHlwZTogJ2luc2VydFRleHQnLFxuICAgICAgICAgIGRhdGE6IGNoYXIsXG4gICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlXG4gICAgICAgIH0pKVxuXG4gICAgICAgIGJvZHlFZGl0YWJsZS5kaXNwYXRjaEV2ZW50KG5ldyBLZXlib2FyZEV2ZW50KCdrZXl1cCcsIHtcbiAgICAgICAgICBrZXk6IGNoYXIsXG4gICAgICAgICAgY29kZTogY2hhciA9PT0gJyAnID8gJ1NwYWNlJyA6IGBLZXkke2NoYXIudG9VcHBlckNhc2UoKX1gLFxuICAgICAgICAgIGtleUNvZGU6IGNoYXIuY2hhckNvZGVBdCgwKSxcbiAgICAgICAgICB3aGljaDogY2hhci5jaGFyQ29kZUF0KDApLFxuICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgICB9KSlcblxuICAgICAgICBhd2FpdCBzbGVlcCg1KVxuICAgICAgfVxuXG4gICAgICBib2R5RWRpdGFibGUuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScsIHsgYnViYmxlczogdHJ1ZSwgY2FuY2VsYWJsZTogdHJ1ZSB9KSlcblxuICAgICAgY29udGVudExvZ2dlci5sb2coJ0JvZHkgdGV4dCBzZXQgc3VjY2Vzc2Z1bGx5JylcbiAgICAgIGF3YWl0IHNsZWVwKDUwMClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG5cbiAgY29udGVudExvZ2dlci5sb2coJ0ZhaWxlZCB0byBmaW5kIGJvZHkgZWRpdG9yJylcbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8vIENsaWNrIHBvc3QgYnV0dG9uIGZ1bmN0aW9uIGZyb20gd29ya2luZyBjb2RlXG5hc3luYyBmdW5jdGlvbiBjbGlja1Bvc3RCdXR0b24oKSB7XG4gIGNvbnRlbnRMb2dnZXIubG9nKCdDbGlja2luZyBQb3N0IGJ1dHRvbi4uLicpXG5cbiAgLy8gUmVtb3ZlIGJlZm9yZXVubG9hZCBsaXN0ZW5lcnMgcmlnaHQgYmVmb3JlIHBvc3RpbmcgdG8gcHJldmVudCBkaWFsb2dcbiAgcmVtb3ZlQmVmb3JlVW5sb2FkTGlzdGVuZXJzKClcblxuICBjb25zdCBjaGVja0J1dHRvbkFjdGl2ZSA9ICgpID0+IHtcbiAgICBjb25zdCBpbm5lckJ1dHRvbiA9IGRlZXBRdWVyeSgnI2lubmVyLXBvc3Qtc3VibWl0LWJ1dHRvbicpXG4gICAgaWYgKGlubmVyQnV0dG9uKSB7XG4gICAgICBjb25zdCBpc0Rpc2FibGVkID0gaW5uZXJCdXR0b24uZGlzYWJsZWQgfHwgaW5uZXJCdXR0b24uZ2V0QXR0cmlidXRlKCdhcmlhLWRpc2FibGVkJykgPT09ICd0cnVlJ1xuICAgICAgY29udGVudExvZ2dlci5sb2coJ0lubmVyIHBvc3QgYnV0dG9uIGFjdGl2ZTonLCAhaXNEaXNhYmxlZClcbiAgICAgIHJldHVybiAhaXNEaXNhYmxlZFxuICAgIH1cblxuICAgIGNvbnN0IHBvc3RDb250YWluZXIgPSBkZWVwUXVlcnkoJ3ItcG9zdC1mb3JtLXN1Ym1pdC1idXR0b24jc3VibWl0LXBvc3QtYnV0dG9uJylcbiAgICBpZiAocG9zdENvbnRhaW5lciAmJiBwb3N0Q29udGFpbmVyLnNoYWRvd1Jvb3QpIHtcbiAgICAgIGNvbnN0IHNoYWRvd0J1dHRvbiA9IHBvc3RDb250YWluZXIuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdidXR0b24nKVxuICAgICAgaWYgKHNoYWRvd0J1dHRvbikge1xuICAgICAgICBjb25zdCBpc1NoYWRvd0Rpc2FibGVkID0gc2hhZG93QnV0dG9uLmRpc2FibGVkIHx8IHNoYWRvd0J1dHRvbi5nZXRBdHRyaWJ1dGUoJ2FyaWEtZGlzYWJsZWQnKSA9PT0gJ3RydWUnXG4gICAgICAgIGNvbnRlbnRMb2dnZXIubG9nKCdTaGFkb3cgcG9zdCBidXR0b24gYWN0aXZlOicsICFpc1NoYWRvd0Rpc2FibGVkKVxuICAgICAgICByZXR1cm4gIWlzU2hhZG93RGlzYWJsZWRcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KClcbiAgd2hpbGUgKERhdGUubm93KCkgLSBzdGFydFRpbWUgPCAxMDAwMCkge1xuICAgIGlmIChjaGVja0J1dHRvbkFjdGl2ZSgpKSB7XG4gICAgICBicmVha1xuICAgIH1cbiAgICBhd2FpdCBzbGVlcCg1MDApXG4gIH1cblxuICBjb25zdCBpbm5lclBvc3RCdXR0b24gPSBkZWVwUXVlcnkoJyNpbm5lci1wb3N0LXN1Ym1pdC1idXR0b24nKVxuICBpZiAoaW5uZXJQb3N0QnV0dG9uICYmICFpbm5lclBvc3RCdXR0b24uZGlzYWJsZWQpIHtcbiAgICBjb250ZW50TG9nZ2VyLmxvZygnRm91bmQgYWN0aXZlIGlubmVyIHBvc3QgYnV0dG9uLCBjbGlja2luZy4uLicpXG4gICAgaW5uZXJQb3N0QnV0dG9uLmNsaWNrKClcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgY29uc3QgcG9zdENvbnRhaW5lciA9IGRlZXBRdWVyeSgnci1wb3N0LWZvcm0tc3VibWl0LWJ1dHRvbiNzdWJtaXQtcG9zdC1idXR0b24nKVxuICBpZiAocG9zdENvbnRhaW5lcikge1xuICAgIGNvbnRlbnRMb2dnZXIubG9nKCdGb3VuZCBwb3N0IGNvbnRhaW5lcicpXG5cbiAgICBpZiAocG9zdENvbnRhaW5lci5zaGFkb3dSb290KSB7XG4gICAgICBjb25zdCBzaGFkb3dCdXR0b24gPSBwb3N0Q29udGFpbmVyLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignYnV0dG9uJylcbiAgICAgIGlmIChzaGFkb3dCdXR0b24gJiYgIXNoYWRvd0J1dHRvbi5kaXNhYmxlZCkge1xuICAgICAgICBjb250ZW50TG9nZ2VyLmxvZygnRm91bmQgYWN0aXZlIGJ1dHRvbiBpbiBzaGFkb3cgRE9NLCBjbGlja2luZy4uLicpXG4gICAgICAgIHNoYWRvd0J1dHRvbi5jbGljaygpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29udGVudExvZ2dlci5sb2coJ0NsaWNraW5nIHBvc3QgY29udGFpbmVyIGRpcmVjdGx5JylcbiAgICBwb3N0Q29udGFpbmVyLmNsaWNrKClcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgY29uc3QgYWx0ZXJuYXRpdmVTZWxlY3RvcnMgPSBbXG4gICAgJ2J1dHRvblt0eXBlPVwic3VibWl0XCJdJyxcbiAgICAnW2RhdGEtdGVzdGlkPVwic3VibWl0LXBvc3RcIl0nLFxuICAgICdidXR0b246Y29udGFpbnMoXCJQb3N0XCIpJyxcbiAgICAnLnBvc3QtYnV0dG9uJ1xuICBdXG5cbiAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBhbHRlcm5hdGl2ZVNlbGVjdG9ycykge1xuICAgIGNvbnN0IGJ1dHRvbiA9IGRlZXBRdWVyeShzZWxlY3RvcilcbiAgICBpZiAoYnV0dG9uICYmIChidXR0b24udGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ3Bvc3QnKSB8fCBidXR0b24udGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ3N1Ym1pdCcpKSkge1xuICAgICAgY29udGVudExvZ2dlci5sb2coYEZvdW5kIHBvc3QgYnV0dG9uIHdpdGggc2VsZWN0b3I6ICR7c2VsZWN0b3J9LCBjbGlja2luZy4uLmApXG4gICAgICBidXR0b24uY2xpY2soKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cblxuICBjb250ZW50TG9nZ2VyLmxvZygnUG9zdCBidXR0b24gbm90IGZvdW5kIHdpdGggYW55IHNlbGVjdG9yJylcbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIHNlbGVjdFN1YnJlZGRpdChzdWJyZWRkaXQpIHtcbiAgLy8gVHJ5IHRvIGZpbmQgYW5kIHNlbGVjdCB0aGUgc3VicmVkZGl0XG4gIGNvbnN0IHN1YnJlZGRpdFNlbGVjdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXRlc3RpZD1cInN1YnJlZGRpdC1zZWxlY3RvclwiXScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnN1YnJlZGRpdC1pbnB1dCcpXG5cbiAgaWYgKHN1YnJlZGRpdFNlbGVjdCkge1xuICAgIC8vIEhhbmRsZSBkaWZmZXJlbnQgdHlwZXMgb2Ygc3VicmVkZGl0IHNlbGVjdG9yc1xuICAgIGlmIChzdWJyZWRkaXRTZWxlY3QudGFnTmFtZSA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgIC8vIERyb3Bkb3duIHNlbGVjdFxuICAgICAgY29uc3Qgb3B0aW9uID0gQXJyYXkuZnJvbShzdWJyZWRkaXRTZWxlY3Qub3B0aW9ucykuZmluZChvcHQgPT5cbiAgICAgICAgb3B0LnRleHQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzdWJyZWRkaXQudG9Mb3dlckNhc2UoKSlcbiAgICAgIClcbiAgICAgIGlmIChvcHRpb24pIHtcbiAgICAgICAgc3VicmVkZGl0U2VsZWN0LnZhbHVlID0gb3B0aW9uLnZhbHVlXG4gICAgICAgIHN1YnJlZGRpdFNlbGVjdC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJywgeyBidWJibGVzOiB0cnVlIH0pKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoc3VicmVkZGl0U2VsZWN0LnRhZ05hbWUgPT09ICdJTlBVVCcpIHtcbiAgICAgIC8vIElucHV0IGZpZWxkXG4gICAgICBzdWJyZWRkaXRTZWxlY3QudmFsdWUgPSBzdWJyZWRkaXRcbiAgICAgIHN1YnJlZGRpdFNlbGVjdC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldFBhZ2VJbmZvKCkge1xuICBjb25zdCB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZlxuICBjb25zdCBob3N0bmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZVxuICBjb25zdCBwYXRobmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZVxuXG4gIC8vIERldGVjdCBwYWdlIHR5cGVcbiAgbGV0IHBhZ2VUeXBlID0gJ3Vua25vd24nXG4gIGlmIChwYXRobmFtZS5pbmNsdWRlcygnL3N1Ym1pdCcpKSB7XG4gICAgcGFnZVR5cGUgPSAnc3VibWl0J1xuICB9IGVsc2UgaWYgKHBhdGhuYW1lLmluY2x1ZGVzKCcvci8nKSkge1xuICAgIHBhZ2VUeXBlID0gJ3N1YnJlZGRpdCdcbiAgfSBlbHNlIGlmIChwYXRobmFtZSA9PT0gJy8nIHx8IHBhdGhuYW1lID09PSAnL2hvdCcgfHwgcGF0aG5hbWUgPT09ICcvbmV3Jykge1xuICAgIHBhZ2VUeXBlID0gJ2hvbWUnXG4gIH1cblxuICAvLyBHZXQgY3VycmVudCBzdWJyZWRkaXQgaWYgb24gc3VicmVkZGl0IHBhZ2VcbiAgbGV0IGN1cnJlbnRTdWJyZWRkaXQgPSBudWxsXG4gIGNvbnN0IHN1YnJlZGRpdE1hdGNoID0gcGF0aG5hbWUubWF0Y2goL1xcL3JcXC8oW15cXC9dKykvKVxuICBpZiAoc3VicmVkZGl0TWF0Y2gpIHtcbiAgICBjdXJyZW50U3VicmVkZGl0ID0gc3VicmVkZGl0TWF0Y2hbMV1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdXJsLFxuICAgIGhvc3RuYW1lLFxuICAgIHBhdGhuYW1lLFxuICAgIHBhZ2VUeXBlLFxuICAgIGN1cnJlbnRTdWJyZWRkaXQsXG4gICAgaXNMb2dnZWRJbjogY2hlY2tJZkxvZ2dlZEluKClcbiAgfVxufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb25zIGZyb20gd29ya2luZyBjb2RlXG5mdW5jdGlvbiBxcyhzLCByID0gZG9jdW1lbnQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gKHIgfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3IocylcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxufVxuXG5mdW5jdGlvbiBxc0FsbChzLCByID0gZG9jdW1lbnQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSgociB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzKSlcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIFtdXG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gc2xlZXAobXMpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCBtcykpXG59XG5cbi8vIERlZXAgcXVlcnkgZnVuY3Rpb24gZm9yIHNoYWRvdyBET00gc3VwcG9ydCAoZnJvbSB3b3JraW5nIGNvZGUpXG5mdW5jdGlvbiBkZWVwUXVlcnkoc2VsZWN0b3IsIHJvb3QgPSBkb2N1bWVudCkge1xuICBjb25zdCBlbCA9IHJvb3QucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gIGlmIChlbCkgcmV0dXJuIGVsO1xuICBmb3IgKGNvbnN0IGVsZW0gb2Ygcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcqJykpIHtcbiAgICBpZiAoZWxlbS5zaGFkb3dSb290KSB7XG4gICAgICBjb25zdCBmb3VuZCA9IGRlZXBRdWVyeShzZWxlY3RvciwgZWxlbS5zaGFkb3dSb290KTtcbiAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGZvdW5kO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLy8gV2FpdCBmb3IgZWxlbWVudCB3aXRoIHRpbWVvdXRcbmFzeW5jIGZ1bmN0aW9uIHdhaXRGb3JFbGVtZW50KHNlbGVjdG9yLCB0aW1lb3V0ID0gMTAwMDApIHtcbiAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpO1xuICB3aGlsZSAoRGF0ZS5ub3coKSAtIHN0YXJ0IDwgdGltZW91dCkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkZWVwUXVlcnkoc2VsZWN0b3IpO1xuICAgIGlmIChlbGVtZW50KSByZXR1cm4gZWxlbWVudDtcbiAgICBhd2FpdCBzbGVlcCgxMDApO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5hc3luYyBmdW5jdGlvbiB3YWl0Rm9yRWxlbWVudHMoc2VsZWN0b3IsIHRpbWVvdXQgPSA1MDAwKSB7XG4gIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgd2hpbGUgKERhdGUubm93KCkgLSBzdGFydCA8IHRpbWVvdXQpIHtcbiAgICBjb25zdCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgIGlmIChlbGVtZW50cy5sZW5ndGggPiAwKSByZXR1cm4gQXJyYXkuZnJvbShlbGVtZW50cyk7XG4gICAgYXdhaXQgc2xlZXAoMTAwKTtcbiAgfVxuICByZXR1cm4gW107XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG9wZW5Vc2VyRHJvcGRvd24oKSB7XG4gIGNvbnRlbnRMb2dnZXIubG9nKCdPcGVuaW5nIHVzZXIgZHJvcGRvd24uLi4nKVxuXG4gIC8vIFRyeSBtdWx0aXBsZSBzZWxlY3RvcnMgZm9yIHRoZSB1c2VyIGF2YXRhci9kcm9wZG93biBidXR0b25cbiAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICdycGwtZHJvcGRvd24gZGl2JyxcbiAgICAnW2RhdGEtdGVzdGlkPVwidXNlci1hdmF0YXJcIl0nLFxuICAgICdidXR0b25bYXJpYS1sYWJlbCo9XCJ1c2VyXCJdJyxcbiAgICAnI2V4cGFuZC11c2VyLWRyYXdlci1idXR0b24nLFxuICAgICdidXR0b25bZGF0YS10ZXN0aWQ9XCJ1c2VyLW1lbnUtdHJpZ2dlclwiXScsXG4gICAgJ1tkYXRhLWNsaWNrLWlkPVwicHJvZmlsZVwiXScsXG4gICAgJ2J1dHRvbltpZCo9XCJ1c2VyLWRyb3Bkb3duXCJdJyxcbiAgICAnYnV0dG9uW2FyaWEtaGFzcG9wdXA9XCJ0cnVlXCJdJyxcbiAgICAnLmhlYWRlci11c2VyLWRyb3Bkb3duJyxcbiAgICAnYnV0dG9uW2FyaWEtbGFiZWwqPVwiVXNlclwiXScsXG4gICAgJ2J1dHRvblt0aXRsZSo9XCJwcm9maWxlXCJdJ1xuICBdXG5cbiAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICBjb25zdCBhdmF0YXJCdXR0b24gPSBxcyhzZWxlY3RvcilcbiAgICBpZiAoYXZhdGFyQnV0dG9uKSB7XG4gICAgICBjb250ZW50TG9nZ2VyLmxvZyhgRm91bmQgYXZhdGFyIGJ1dHRvbiB3aXRoIHNlbGVjdG9yOiAke3NlbGVjdG9yfWApXG4gICAgICBjb250ZW50TG9nZ2VyLmxvZygnQXZhdGFyIGJ1dHRvbiBlbGVtZW50OicsIGF2YXRhckJ1dHRvbilcbiAgICAgIGF2YXRhckJ1dHRvbi5jbGljaygpXG4gICAgICBhd2FpdCBzbGVlcCgyMDAwKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cblxuICBjb250ZW50TG9nZ2VyLmxvZygnQXZhdGFyIGJ1dHRvbiBub3QgZm91bmQgd2l0aCBhbnkgc2VsZWN0b3InKVxuXG4gIC8vIExvZyBhbGwgYnV0dG9ucyB0byBoZWxwIGRlYnVnXG4gIGNvbnN0IGFsbEJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKVxuICBjb250ZW50TG9nZ2VyLmxvZygnQWxsIGJ1dHRvbnMgb24gcGFnZTonLCBhbGxCdXR0b25zLmxlbmd0aClcbiAgYWxsQnV0dG9ucy5mb3JFYWNoKChidG4sIGkpID0+IHtcbiAgICBpZiAoaSA8IDEwKSB7IC8vIExvZyBmaXJzdCAxMCBidXR0b25zXG4gICAgICBjb250ZW50TG9nZ2VyLmxvZyhgQnV0dG9uICR7aX06YCwgYnRuLm91dGVySFRNTC5zdWJzdHJpbmcoMCwgMjAwKSlcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8vIENhY2hlIHZhcmlhYmxlcyB0byBwcmV2ZW50IHVubmVjZXNzYXJ5IHJlLWV4dHJhY3Rpb25zXG5sZXQgY2FjaGVkVXNlcm5hbWUgPSBudWxsXG5sZXQgY2FjaGVUaW1lc3RhbXAgPSAwXG5jb25zdCBDQUNIRV9EVVJBVElPTiA9IDUgKiA2MCAqIDEwMDAgLy8gNSBtaW51dGVzXG5cbi8vIEluaXRpYWxpemUgY2FjaGUgZnJvbSBzdG9yYWdlIG9uIHNjcmlwdCBsb2FkXG5hc3luYyBmdW5jdGlvbiBpbml0aWFsaXplVXNlcm5hbWVDYWNoZSgpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzdG9yZWRVc2VyID0gYXdhaXQgZ2V0U3RvcmVkVXNlcm5hbWUoKVxuICAgIGlmIChzdG9yZWRVc2VyICYmIHN0b3JlZFVzZXIuc2VyZW5fbmFtZSkge1xuICAgICAgY2FjaGVkVXNlcm5hbWUgPSBzdG9yZWRVc2VyLnNlcmVuX25hbWVcbiAgICAgIGNhY2hlVGltZXN0YW1wID0gc3RvcmVkVXNlci50aW1lc3RhbXAgfHwgRGF0ZS5ub3coKVxuICAgICAgY29udGVudExvZ2dlci5sb2coYEluaXRpYWxpemVkIGNhY2hlIGZyb20gc3RvcmFnZTogJHtjYWNoZWRVc2VybmFtZX1gKVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb250ZW50TG9nZ2VyLndhcm4oJ0ZhaWxlZCB0byBpbml0aWFsaXplIHVzZXJuYW1lIGNhY2hlOicsIGVycm9yKVxuICB9XG59XG5cbi8vIEdldCBhdXRoZW50aWNhdGVkIHVzZXJuYW1lIGZyb20gdXNlciBkcm9wZG93bi9hdmF0YXIgKHNob3dzIFlPVVIgdXNlcm5hbWUpXG5hc3luYyBmdW5jdGlvbiBnZXRBdXRoZW50aWNhdGVkVXNlcm5hbWUoKSB7XG4gIC8vIENoZWNrIGNhY2hlIGZpcnN0XG4gIGlmIChjYWNoZWRVc2VybmFtZSAmJiBEYXRlLm5vdygpIC0gY2FjaGVUaW1lc3RhbXAgPCBDQUNIRV9EVVJBVElPTikge1xuICAgIGNvbnRlbnRMb2dnZXIubG9nKGBVc2luZyBjYWNoZWQgYXV0aGVudGljYXRlZCB1c2VybmFtZTogJHtjYWNoZWRVc2VybmFtZX1gKVxuICAgIHJldHVybiBjYWNoZWRVc2VybmFtZVxuICB9XG5cbiAgLy8gVHJ5IHRvIGdldCB1c2VybmFtZSBmcm9tIHVzZXIgZHJvcGRvd24gd2l0aG91dCBvcGVuaW5nIGl0XG4gIGNvbnN0IGF1dGhTZWxlY3RvcnMgPSBbXG4gICAgJ2J1dHRvbltpZCo9XCJ1c2VyLWRyb3Bkb3duXCJdIFtjbGFzcyo9XCJ0ZXh0LTEyXCJdJyxcbiAgICAnW2RhdGEtdGVzdGlkPVwidXNlci1tZW51LXRyaWdnZXJcIl0gc3BhbltjbGFzcyo9XCJ0ZXh0LTEyXCJdJyxcbiAgICAnLmhlYWRlci11c2VyLWRyb3Bkb3duIFtjbGFzcyo9XCJ0ZXh0LTEyXCJdJyxcbiAgICAnYnV0dG9uW2FyaWEtbGFiZWwqPVwiVXNlclwiXSBzcGFuW2NsYXNzKj1cInRleHQtMTJcIl0nXG4gIF1cblxuICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIGF1dGhTZWxlY3RvcnMpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gcXMoc2VsZWN0b3IpXG4gICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IHRleHQgPSBlbGVtZW50LnRleHRDb250ZW50Py50cmltKClcbiAgICAgIGlmICh0ZXh0ICYmIHRleHQuc3RhcnRzV2l0aCgndS8nKSkge1xuICAgICAgICAvLyBVcGRhdGUgY2FjaGVcbiAgICAgICAgY2FjaGVkVXNlcm5hbWUgPSB0ZXh0XG4gICAgICAgIGNhY2hlVGltZXN0YW1wID0gRGF0ZS5ub3coKVxuICAgICAgICByZXR1cm4gdGV4dFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIElmIG5vdCBmb3VuZCwgdHJ5IG9wZW5pbmcgZHJvcGRvd24gYW5kIGdldHRpbmcgdXNlcm5hbWVcbiAgaWYgKGF3YWl0IG9wZW5Vc2VyRHJvcGRvd24oKSkge1xuICAgIC8vIFdhaXQgbG9uZ2VyIGZvciBkcm9wZG93biB0byBmdWxseSBsb2FkIGFuZCB1c2Ugd2FpdEZvckVsZW1lbnRcbiAgICBhd2FpdCBzbGVlcCgyMDAwKVxuXG4gICAgY29uc3QgZHJvcGRvd25TZWxlY3RvcnMgPSBbXG4gICAgICAnc3Bhbi50ZXh0LTEyLnRleHQtc2Vjb25kYXJ5LXdlYWsnLFxuICAgICAgJ1tpZCo9XCJ1c2VyLWRyYXdlclwiXSBzcGFuW2NsYXNzKj1cInRleHQtMTJcIl0nLFxuICAgICAgJy50ZXh0LTEyJ1xuICAgIF1cblxuICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2YgZHJvcGRvd25TZWxlY3RvcnMpIHtcbiAgICAgIC8vIFdhaXQgZm9yIGVsZW1lbnRzIHRvIGFwcGVhclxuICAgICAgY29uc3QgZWxlbWVudHMgPSBhd2FpdCB3YWl0Rm9yRWxlbWVudHMoc2VsZWN0b3IsIDMwMDApXG4gICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGVsZW1lbnQudGV4dENvbnRlbnQ/LnRyaW0oKVxuICAgICAgICBpZiAodGV4dCAmJiB0ZXh0LnN0YXJ0c1dpdGgoJ3UvJykpIHtcbiAgICAgICAgICAvLyBDbG9zZSBkcm9wZG93biBieSBjbGlja2luZyBvdXRzaWRlXG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGljaygpXG4gICAgICAgICAgYXdhaXQgc2xlZXAoNTAwKVxuXG4gICAgICAgICAgLy8gVXBkYXRlIGNhY2hlXG4gICAgICAgICAgY2FjaGVkVXNlcm5hbWUgPSB0ZXh0XG4gICAgICAgICAgY2FjaGVUaW1lc3RhbXAgPSBEYXRlLm5vdygpXG4gICAgICAgICAgcmV0dXJuIHRleHRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsXG59XG5cbi8vIENoZWNrIGlmIHdlJ3JlIG9uIG91ciBvd24gcHJvZmlsZSBwYWdlIHZzIHNvbWVvbmUgZWxzZSdzXG5hc3luYyBmdW5jdGlvbiBpc093blByb2ZpbGVQYWdlKHVzZXJuYW1lKSB7XG4gIC8vIFRyeSB0byBmaW5kIGVkaXQgcHJvZmlsZSBidXR0b24gb3Igb3RoZXIgaW5kaWNhdG9ycyB0aGlzIGlzIG91ciBwcm9maWxlXG4gIGNvbnN0IG93blByb2ZpbGVJbmRpY2F0b3JzID0gW1xuICAgICdidXR0b25bZGF0YS10ZXN0aWQ9XCJlZGl0LXByb2ZpbGUtYnV0dG9uXCJdJyxcbiAgICAnYVtocmVmKj1cIi9zZXR0aW5ncy9wcm9maWxlXCJdJyxcbiAgICAnYVtocmVmKj1cIi9yL01vZFRvb2xcIl0nLFxuICAgICdbZGF0YS1jbGljay1pZD1cInVzZXJfcHJvZmlsZVwiXSdcbiAgXVxuXG4gIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygb3duUHJvZmlsZUluZGljYXRvcnMpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gcXMoc2VsZWN0b3IpXG4gICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgIGNvbnRlbnRMb2dnZXIubG9nKCdGb3VuZCBvd24gcHJvZmlsZSBpbmRpY2F0b3IsIHRoaXMgaXMgb3VyIHByb2ZpbGUnKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cblxuICAvLyBDaGVjayBidXR0b24gdGV4dCBjb250ZW50IGZvciBcIkVkaXRcIiBpbmRpY2F0b3JzXG4gIGNvbnN0IGJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24nKVxuICBmb3IgKGNvbnN0IGJ1dHRvbiBvZiBidXR0b25zKSB7XG4gICAgY29uc3QgdGV4dCA9IGJ1dHRvbi50ZXh0Q29udGVudD8udHJpbSgpLnRvTG93ZXJDYXNlKClcbiAgICBpZiAodGV4dCAmJiAodGV4dC5pbmNsdWRlcygnZWRpdCBwcm9maWxlJykgfHwgdGV4dC5pbmNsdWRlcygnZWRpdCBmbGFpcicpKSkge1xuICAgICAgY29udGVudExvZ2dlci5sb2coJ0ZvdW5kIGVkaXQgcHJvZmlsZSBidXR0b24gYnkgdGV4dCBjb250ZW50LCB0aGlzIGlzIG91ciBwcm9maWxlJylcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2sgaWYgY2FjaGVkIGF1dGhlbnRpY2F0ZWQgdXNlcm5hbWUgbWF0Y2hlcyBVUkwgdXNlcm5hbWUgKGF2b2lkIHJlY3Vyc2l2ZSBjYWxsKVxuICBpZiAoY2FjaGVkVXNlcm5hbWUgJiYgRGF0ZS5ub3coKSAtIGNhY2hlVGltZXN0YW1wIDwgQ0FDSEVfRFVSQVRJT04pIHtcbiAgICBjb25zdCBjbGVhbkF1dGhVc2VybmFtZSA9IGNhY2hlZFVzZXJuYW1lLnJlcGxhY2UoJ3UvJywgJycpXG4gICAgcmV0dXJuIGNsZWFuQXV0aFVzZXJuYW1lID09PSB1c2VybmFtZVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8vIEdsb2JhbCBkZXRlY3Rpb24gbG9jayB0byBwcmV2ZW50IGNvbmN1cnJlbnQgZXh0cmFjdGlvbnNcbmxldCBpc0V4dHJhY3RpbmdVc2VybmFtZSA9IGZhbHNlXG5cbmFzeW5jIGZ1bmN0aW9uIGV4dHJhY3RVc2VybmFtZUZyb21QYWdlKCkge1xuICBjb250ZW50TG9nZ2VyLmxvZygnRXh0cmFjdGluZyB1c2VybmFtZSBmcm9tIFJlZGRpdCBwYWdlIHVzaW5nIG11bHRpcGxlIG1ldGhvZHMuLi4nKVxuXG4gIC8vIFByZXZlbnQgY29uY3VycmVudCBleHRyYWN0aW9uc1xuICBpZiAoaXNFeHRyYWN0aW5nVXNlcm5hbWUpIHtcbiAgICBjb250ZW50TG9nZ2VyLmxvZygnVXNlcm5hbWUgZXh0cmFjdGlvbiBhbHJlYWR5IGluIHByb2dyZXNzLCBza2lwcGluZy4uLicpXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGlzRXh0cmFjdGluZ1VzZXJuYW1lID0gdHJ1ZVxuXG4gIHRyeSB7XG4gIC8vIE1ldGhvZCAxOiBQcmlvcml0aXplIGF1dGhlbnRpY2F0ZWQgdXNlciBpbmRpY2F0b3JzIChkcm9wZG93bi9hdmF0YXIpXG4gIC8vIFRoZXNlIHNob3cgWU9VUiB1c2VybmFtZSwgbm90IGp1c3QgYW55IHVzZXJuYW1lIG9uIHRoZSBwYWdlXG4gIGNvbnN0IGF1dGhVc2VybmFtZSA9IGF3YWl0IGdldEF1dGhlbnRpY2F0ZWRVc2VybmFtZSgpXG4gIGlmIChhdXRoVXNlcm5hbWUpIHtcbiAgICBjb250ZW50TG9nZ2VyLmxvZyhgRm91bmQgYXV0aGVudGljYXRlZCB1c2VybmFtZTogJHthdXRoVXNlcm5hbWV9YClcbiAgICBhd2FpdCBzdG9yZVVzZXJuYW1lSW5TdG9yYWdlKGF1dGhVc2VybmFtZSlcbiAgICByZXR1cm4gYXV0aFVzZXJuYW1lXG4gIH1cblxuICAvLyBNZXRob2QgMjogT25seSBjaGVjayBVUkwgaWYgd2UncmUgb24gb3VyIG93biBwcm9maWxlIHBhZ2VcbiAgLy8gKFRoaXMgcmVxdWlyZXMgYWRkaXRpb25hbCB2YWxpZGF0aW9uIHRvIGVuc3VyZSBpdCdzIG91ciBwcm9maWxlKVxuICBjb25zdCB1cmxNYXRjaCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5tYXRjaCgvXFwvdVxcLyhbXlxcL10rKS8pXG4gIGlmICh1cmxNYXRjaCAmJiBhd2FpdCBpc093blByb2ZpbGVQYWdlKHVybE1hdGNoWzFdKSkge1xuICAgIGNvbnN0IHVzZXJuYW1lID0gYHUvJHt1cmxNYXRjaFsxXX1gXG4gICAgY29udGVudExvZ2dlci5sb2coYEZvdW5kIHVzZXJuYW1lIGZyb20gb3duIHByb2ZpbGUgVVJMOiAke3VzZXJuYW1lfWApXG4gICAgYXdhaXQgc3RvcmVVc2VybmFtZUluU3RvcmFnZSh1c2VybmFtZSlcbiAgICByZXR1cm4gdXNlcm5hbWVcbiAgfVxuXG4gIC8vIE1ldGhvZCAzOiBHZW5lcmljIHBhZ2UgZWxlbWVudCBzY2FubmluZyBhcyBmaW5hbCBmYWxsYmFja1xuICAvLyAoT25seSB1c2VkIGlmIGF1dGhlbnRpY2F0ZWQgZGV0ZWN0aW9uIGZhaWxzKVxuICBjb25zdCB1c2VybmFtZVNlbGVjdG9ycyA9IFtcbiAgICAnc3BhbltpZCo9XCJ1c2VyLVwiXScsXG4gICAgJ1tkYXRhLXRlc3RpZCo9XCJ1c2VyXCJdJyxcbiAgICAnYVtocmVmKj1cIi91L1wiXScsXG4gICAgJy5oZWFkZXItdXNlci1kcm9wZG93biAudGV4dC0xMicsXG4gICAgJ1thcmlhLWxhYmVsKj1cInUvXCJdJ1xuICBdXG5cbiAgZm9yIChjb25zdCBzZWxlY3RvciBvZiB1c2VybmFtZVNlbGVjdG9ycykge1xuICAgIGNvbnN0IGVsZW1lbnRzID0gcXNBbGwoc2VsZWN0b3IpXG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgICBjb25zdCB0ZXh0ID0gZWxlbWVudC50ZXh0Q29udGVudD8udHJpbSgpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJykgfHwgZWxlbWVudC5ocmVmXG4gICAgICBpZiAodGV4dCAmJiB0ZXh0LmluY2x1ZGVzKCd1LycpKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gdGV4dC5tYXRjaCgvdVxcLyhbYS16QS1aMC05Xy1dKykvKVxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICBjb25zdCB1c2VybmFtZSA9IGB1LyR7bWF0Y2hbMV19YFxuICAgICAgICAgIGNvbnRlbnRMb2dnZXIubG9nKGBGb3VuZCB1c2VybmFtZSBmcm9tIHBhZ2UgZWxlbWVudCBmYWxsYmFjazogJHt1c2VybmFtZX1gKVxuICAgICAgICAgIC8vIE9ubHkgc3RvcmUgaWYgbm90IGFscmVhZHkgY2FjaGVkIHRvIHByZXZlbnQgb3ZlcndyaXRpbmcgd2l0aCB3cm9uZyB1c2VyXG4gICAgICAgICAgaWYgKCFjYWNoZWRVc2VybmFtZSkge1xuICAgICAgICAgICAgYXdhaXQgc3RvcmVVc2VybmFtZUluU3RvcmFnZSh1c2VybmFtZSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHVzZXJuYW1lXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBNZXRob2QgMzogRmFsbGJhY2sgLSBuYXZpZ2F0ZSB0byBwcm9maWxlIHBhZ2UgdG8gZXh0cmFjdCB1c2VybmFtZVxuICBjb250ZW50TG9nZ2VyLmxvZygnQWxsIG1ldGhvZHMgZmFpbGVkLCB0cnlpbmcgcHJvZmlsZSBwYWdlIG5hdmlnYXRpb24gZmFsbGJhY2suLi4nKVxuICByZXR1cm4gYXdhaXQgdHJ5UHJvZmlsZVBhZ2VGYWxsYmFjaygpXG5cbiAgfSBmaW5hbGx5IHtcbiAgICBpc0V4dHJhY3RpbmdVc2VybmFtZSA9IGZhbHNlXG4gIH1cbn1cblxuLy8gRmFsbGJhY2sgbWV0aG9kIC0gbmF2aWdhdGUgdG8gcHJvZmlsZSBwYWdlIHRvIGV4dHJhY3QgdXNlcm5hbWVcbmFzeW5jIGZ1bmN0aW9uIHRyeVByb2ZpbGVQYWdlRmFsbGJhY2soKSB7XG4gIGNvbnRlbnRMb2dnZXIubG9nKCdBdHRlbXB0aW5nIHByb2ZpbGUgcGFnZSBuYXZpZ2F0aW9uIGZhbGxiYWNrLi4uJylcblxuICAvLyBGaXJzdCwgdHJ5IHRvIGZpbmQgYW55IGxpbmsgdG8gdXNlciBwcm9maWxlIGluIHRoZSBjdXJyZW50IHBhZ2VcbiAgY29uc3QgcHJvZmlsZUxpbmtzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYVtocmVmKj1cIi91c2VyL1wiXSwgYVtocmVmKj1cIi91L1wiXScpXG4gIGlmIChwcm9maWxlTGlua3MubGVuZ3RoID4gMCkge1xuICAgIC8vIEdldCB0aGUgZmlyc3QgcHJvZmlsZSBsaW5rIChsaWtlbHkgb3VyIG93bilcbiAgICBjb25zdCBwcm9maWxlVXJsID0gcHJvZmlsZUxpbmtzWzBdLmhyZWZcbiAgICBjb250ZW50TG9nZ2VyLmxvZyhgRm91bmQgcHJvZmlsZSBsaW5rOiAke3Byb2ZpbGVVcmx9YClcblxuICAgIC8vIEV4dHJhY3QgdXNlcm5hbWUgZnJvbSBVUkxcbiAgICBjb25zdCB1cmxNYXRjaCA9IHByb2ZpbGVVcmwubWF0Y2goL1xcLyh1c2VyfHUpXFwvKFteXFwvXSspLylcbiAgICBpZiAodXJsTWF0Y2gpIHtcbiAgICAgIGNvbnN0IHVzZXJuYW1lID0gYHUvJHt1cmxNYXRjaFsyXX1gXG4gICAgICBjb250ZW50TG9nZ2VyLmxvZyhgRXh0cmFjdGVkIHVzZXJuYW1lIGZyb20gcHJvZmlsZSBsaW5rOiAke3VzZXJuYW1lfWApXG4gICAgICBhd2FpdCBzdG9yZVVzZXJuYW1lSW5TdG9yYWdlKHVzZXJuYW1lKVxuICAgICAgcmV0dXJuIHVzZXJuYW1lXG4gICAgfVxuICB9XG5cbiAgLy8gSWYgbm8gcHJvZmlsZSBsaW5rIGZvdW5kLCB0cnkgb3BlbmluZyBkcm9wZG93biBhZ2FpbiB3aXRoIGxvbmdlciB3YWl0XG4gIGNvbnRlbnRMb2dnZXIubG9nKCdObyBwcm9maWxlIGxpbmsgZm91bmQsIHRyeWluZyBkcm9wZG93biB3aXRoIGV4dGVuZGVkIHdhaXQuLi4nKVxuICBpZiAoYXdhaXQgb3BlblVzZXJEcm9wZG93bigpKSB7XG4gICAgYXdhaXQgc2xlZXAoMzAwMCkgLy8gV2FpdCAzIHNlY29uZHMgZm9yIGRyb3Bkb3duIHRvIGZ1bGx5IGxvYWRcblxuICAgIGNvbnN0IGRyb3Bkb3duU2VsZWN0b3JzID0gW1xuICAgICAgJ3NwYW4udGV4dC0xMi50ZXh0LXNlY29uZGFyeS13ZWFrJyxcbiAgICAgICdbaWQqPVwidXNlci1kcmF3ZXJcIl0gc3BhbltjbGFzcyo9XCJ0ZXh0LTEyXCJdJyxcbiAgICAgICcudGV4dC0xMidcbiAgICBdXG5cbiAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIGRyb3Bkb3duU2VsZWN0b3JzKSB7XG4gICAgICBjb25zdCBlbGVtZW50cyA9IGF3YWl0IHdhaXRGb3JFbGVtZW50cyhzZWxlY3RvciwgNTAwMClcbiAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICBjb25zdCB0ZXh0ID0gZWxlbWVudC50ZXh0Q29udGVudD8udHJpbSgpXG4gICAgICAgIGlmICh0ZXh0ICYmIHRleHQuc3RhcnRzV2l0aCgndS8nKSkge1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xpY2soKSAvLyBDbG9zZSBkcm9wZG93blxuICAgICAgICAgIGF3YWl0IHNsZWVwKDUwMClcblxuICAgICAgICAgIGNhY2hlZFVzZXJuYW1lID0gdGV4dFxuICAgICAgICAgIGNhY2hlVGltZXN0YW1wID0gRGF0ZS5ub3coKVxuICAgICAgICAgIGF3YWl0IHN0b3JlVXNlcm5hbWVJblN0b3JhZ2UodGV4dClcbiAgICAgICAgICBjb250ZW50TG9nZ2VyLmxvZyhgRm91bmQgdXNlcm5hbWUgd2l0aCBleHRlbmRlZCB3YWl0OiAke3RleHR9YClcbiAgICAgICAgICByZXR1cm4gdGV4dFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29udGVudExvZ2dlci5sb2coJ0NvdWxkIG5vdCBleHRyYWN0IHVzZXJuYW1lIHVzaW5nIGFueSBtZXRob2QnKVxuICByZXR1cm4gbnVsbFxufVxuXG4vLyBTdG9yZSBzZXJlbl9uYW1lICh1c2VybmFtZSkgaW4gQ2hyb21lIHN0b3JhZ2VcbmFzeW5jIGZ1bmN0aW9uIHN0b3JlVXNlcm5hbWVJblN0b3JhZ2UodXNlcm5hbWUpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBkYXRhID0ge1xuICAgICAgc2VyZW5fbmFtZTogdXNlcm5hbWUsXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICBwYWdlVXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZlxuICAgIH1cblxuICAgIC8vIFN0b3JlIGluIGNocm9tZS5zdG9yYWdlLnN5bmMgZm9yIGNyb3NzLWRldmljZSBzeW5jXG4gICAgYXdhaXQgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoeyByZWRkaXRVc2VyOiBkYXRhIH0pXG4gICAgY29udGVudExvZ2dlci5sb2coYFN0b3JlZCBzZXJlbl9uYW1lIGluIENocm9tZSBzdG9yYWdlOiAke3VzZXJuYW1lfWApXG5cbiAgICAvLyBBbHNvIHN0b3JlIGluIGxvY2FsIHN0b3JhZ2UgYXMgYmFja3VwXG4gICAgYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgcmVkZGl0VXNlcjogZGF0YSB9KVxuXG4gICAgLy8gTm90aWZ5IGJhY2tncm91bmQgc2NyaXB0IGFib3V0IHRoZSB1c2VybmFtZSB1cGRhdGVcbiAgICBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICB0eXBlOiAnVVNFUk5BTUVfU1RPUkVEJyxcbiAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgIH0pXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29udGVudExvZ2dlci5lcnJvcignRmFpbGVkIHRvIHN0b3JlIHVzZXJuYW1lIGluIENocm9tZSBzdG9yYWdlOicsIGVycm9yKVxuICB9XG59XG5cbi8vIFJldHJpZXZlIHNlcmVuX25hbWUgZnJvbSBDaHJvbWUgc3RvcmFnZVxuYXN5bmMgZnVuY3Rpb24gZ2V0U3RvcmVkVXNlcm5hbWUoKSB7XG4gIHRyeSB7XG4gICAgLy8gVHJ5IHN5bmMgc3RvcmFnZSBmaXJzdCwgZmFsbGJhY2sgdG8gbG9jYWwgc3RvcmFnZVxuICAgIGNvbnN0IHN5bmNSZXN1bHQgPSBhd2FpdCBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldChbJ3JlZGRpdFVzZXInXSlcbiAgICBpZiAoc3luY1Jlc3VsdC5yZWRkaXRVc2VyICYmIHN5bmNSZXN1bHQucmVkZGl0VXNlci5zZXJlbl9uYW1lKSB7XG4gICAgICBjb250ZW50TG9nZ2VyLmxvZyhgUmV0cmlldmVkIHNlcmVuX25hbWUgZnJvbSBzeW5jIHN0b3JhZ2U6ICR7c3luY1Jlc3VsdC5yZWRkaXRVc2VyLnNlcmVuX25hbWV9YClcbiAgICAgIHJldHVybiBzeW5jUmVzdWx0LnJlZGRpdFVzZXJcbiAgICB9XG5cbiAgICBjb25zdCBsb2NhbFJlc3VsdCA9IGF3YWl0IGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ3JlZGRpdFVzZXInXSlcbiAgICBpZiAobG9jYWxSZXN1bHQucmVkZGl0VXNlciAmJiBsb2NhbFJlc3VsdC5yZWRkaXRVc2VyLnNlcmVuX25hbWUpIHtcbiAgICAgIGNvbnRlbnRMb2dnZXIubG9nKGBSZXRyaWV2ZWQgc2VyZW5fbmFtZSBmcm9tIGxvY2FsIHN0b3JhZ2U6ICR7bG9jYWxSZXN1bHQucmVkZGl0VXNlci5zZXJlbl9uYW1lfWApXG4gICAgICByZXR1cm4gbG9jYWxSZXN1bHQucmVkZGl0VXNlclxuICAgIH1cblxuICAgIGNvbnRlbnRMb2dnZXIubG9nKCdObyBzdG9yZWQgdXNlcm5hbWUgZm91bmQnKVxuICAgIHJldHVybiBudWxsXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29udGVudExvZ2dlci5lcnJvcignRmFpbGVkIHRvIHJldHJpZXZlIHVzZXJuYW1lIGZyb20gQ2hyb21lIHN0b3JhZ2U6JywgZXJyb3IpXG4gICAgcmV0dXJuIG51bGxcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0lmTG9nZ2VkSW4oKSB7XG4gIGNvbnRlbnRMb2dnZXIubG9nKCdDaGVja2luZyBpZiB1c2VyIGlzIGxvZ2dlZCBpbiB1c2luZyBwcm92ZW4gbWV0aG9kLi4uJylcblxuICAvLyBMb29rIGZvciB0aGUgYXZhdGFyIGJ1dHRvbiB0aGF0IHdvdWxkIGluZGljYXRlIGxvZ2dlZCBpbiBzdGF0ZVxuICBjb25zdCBhdmF0YXJCdXR0b24gPSBxcygncnBsLWRyb3Bkb3duIGRpdiwgW2RhdGEtdGVzdGlkPVwidXNlci1hdmF0YXJcIl0sIGJ1dHRvblthcmlhLWxhYmVsKj1cInVzZXJcIl0sICNleHBhbmQtdXNlci1kcmF3ZXItYnV0dG9uJylcblxuICBpZiAoYXZhdGFyQnV0dG9uKSB7XG4gICAgY29udGVudExvZ2dlci5sb2coJ0ZvdW5kIHVzZXIgYXZhdGFyIGJ1dHRvbiAtIHVzZXIgaXMgbG9nZ2VkIGluJylcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLy8gQWxzbyBjaGVjayBmb3IgbG9naW4vc2lnbnVwIGJ1dHRvbnMgd2hpY2ggd291bGQgaW5kaWNhdGUgTk9UIGxvZ2dlZCBpblxuICBjb25zdCBsb2dpbkJ1dHRvbnMgPSBxc0FsbCgnYVtocmVmKj1cImxvZ2luXCJdLCBidXR0b25bdGl0bGUqPVwiTG9nIEluXCJdLCBhW2hyZWYqPVwicmVnaXN0ZXJcIl0nKVxuICBpZiAobG9naW5CdXR0b25zLmxlbmd0aCA+IDApIHtcbiAgICBjb250ZW50TG9nZ2VyLmxvZygnRm91bmQgbG9naW4gYnV0dG9ucyAtIHVzZXIgaXMgbm90IGxvZ2dlZCBpbicpXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBjb250ZW50TG9nZ2VyLmxvZygnQ291bGQgbm90IGRldGVybWluZSBsb2dpbiBzdGF0dXMnKVxuICByZXR1cm4gZmFsc2Vcbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlRXh0cmFjdFVzZXJuYW1lQW5kQ3JlYXRlUG9zdCgpIHtcbiAgY29udGVudExvZ2dlci5sb2coJ0V4dHJhY3RpbmcgdXNlcm5hbWUgYW5kIGNyZWF0aW5nIHBvc3QuLi4nKVxuXG4gIC8vIENoZWNrIGlmIHVzZXIgaXMgbG9nZ2VkIGluXG4gIGlmICghY2hlY2tJZkxvZ2dlZEluKCkpIHtcbiAgICBjb250ZW50TG9nZ2VyLmxvZygnVXNlciBpcyBub3QgbG9nZ2VkIGluIHRvIFJlZGRpdCcpXG4gICAgc2hvd0xvZ2luTWVzc2FnZSgpXG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBFeHRyYWN0IHVzZXJuYW1lICh0aGlzIGlzIG5vdyBhc3luYylcbiAgY29uc3QgdXNlcm5hbWUgPSBhd2FpdCBleHRyYWN0VXNlcm5hbWVGcm9tUGFnZSgpXG5cbiAgaWYgKHVzZXJuYW1lKSB7XG4gICAgY29udGVudExvZ2dlci5sb2coYEV4dHJhY3RlZCB1c2VybmFtZTogJHt1c2VybmFtZX1gKVxuICAgIC8vIFN0b3JlIHRoZSB1c2VybmFtZSBmb3IgbGF0ZXIgdXNlXG4gICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgncmVkZGl0LXBvc3QtbWFjaGluZS11c2VybmFtZScsIHVzZXJuYW1lKVxuICB9IGVsc2Uge1xuICAgIGNvbnRlbnRMb2dnZXIubG9nKCdDb3VsZCBub3QgZXh0cmFjdCB1c2VybmFtZSBmcm9tIHBhZ2UnKVxuICAgIHNob3dVc2VybmFtZU5vdEZvdW5kTWVzc2FnZSgpXG4gICAgcmV0dXJuXG4gIH1cbn1cblxuZnVuY3Rpb24gc2hvd0xvZ2luTWVzc2FnZSgpIHtcbiAgY29uc3QgbWVzc2FnZURpdiA9IGNyZWF0ZU1lc3NhZ2VEaXYoJ1x1MjZBMFx1RkUwRicsICdQbGVhc2UgTG9nIEluJywgJ1lvdSBuZWVkIHRvIGJlIGxvZ2dlZCBpbiB0byBSZWRkaXQgdG8gY3JlYXRlIHBvc3RzLicsICcjZjU3YzAwJylcbiAgc2hvd1RlbXBvcmFyeU1lc3NhZ2UobWVzc2FnZURpdilcbn1cblxuZnVuY3Rpb24gc2hvd1VzZXJuYW1lTm90Rm91bmRNZXNzYWdlKCkge1xuICBjb25zdCBtZXNzYWdlRGl2ID0gY3JlYXRlTWVzc2FnZURpdignXHUyNzUzJywgJ1VzZXJuYW1lIE5vdCBGb3VuZCcsICdDb3VsZCBub3QgZGV0ZWN0IHlvdXIgUmVkZGl0IHVzZXJuYW1lLiBQbGVhc2UgbWFrZSBzdXJlIHlvdSBhcmUgbG9nZ2VkIGluLicsICcjZDMyZjJmJylcbiAgc2hvd1RlbXBvcmFyeU1lc3NhZ2UobWVzc2FnZURpdilcbn1cblxuZnVuY3Rpb24gY3JlYXRlTWVzc2FnZURpdihpY29uLCB0aXRsZSwgbWVzc2FnZSwgY29sb3IpIHtcbiAgY29uc3QgbWVzc2FnZURpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIG1lc3NhZ2VEaXYuY2xhc3NOYW1lID0gJ3JlZGRpdC1wb3N0LW1hY2hpbmUtbWVzc2FnZSdcbiAgbWVzc2FnZURpdi5pbm5lckhUTUwgPSBgXG4gICAgPGRpdiBzdHlsZT1cIlxuICAgICAgYmFja2dyb3VuZDogJHtjb2xvcn07XG4gICAgICBjb2xvcjogd2hpdGU7XG4gICAgICBwYWRkaW5nOiAxNnB4O1xuICAgICAgbWFyZ2luOiAxNnB4O1xuICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgICAgYm94LXNoYWRvdzogMCA0cHggMTJweCByZ2JhKDAsMCwwLDAuMyk7XG4gICAgICBmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIHNhbnMtc2VyaWY7XG4gICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICB0b3A6IDIwcHg7XG4gICAgICBsZWZ0OiAyMHB4O1xuICAgICAgei1pbmRleDogMTAwMDA7XG4gICAgICBtaW4td2lkdGg6IDMwMHB4O1xuICAgIFwiPlxuICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogMTJweDtcIj5cbiAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTogMjRweDtcIj4ke2ljb259PC9kaXY+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGRpdiBzdHlsZT1cImZvbnQtd2VpZ2h0OiBib2xkOyBmb250LXNpemU6IDE2cHg7XCI+JHt0aXRsZX08L2Rpdj5cbiAgICAgICAgICA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOiAxNHB4OyBvcGFjaXR5OiAwLjk7XCI+JHttZXNzYWdlfTwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICBgXG4gIHJldHVybiBtZXNzYWdlRGl2XG59XG5cbmZ1bmN0aW9uIHNob3dUZW1wb3JhcnlNZXNzYWdlKG1lc3NhZ2VEaXYpIHtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtZXNzYWdlRGl2KVxuXG4gIC8vIEF1dG8tcmVtb3ZlIGFmdGVyIDQgc2Vjb25kc1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBpZiAobWVzc2FnZURpdi5wYXJlbnROb2RlKSB7XG4gICAgICBtZXNzYWdlRGl2LnN0eWxlLnRyYW5zaXRpb24gPSAnb3BhY2l0eSAwLjVzIGVhc2Utb3V0LCB0cmFuc2Zvcm0gMC41cyBlYXNlLW91dCdcbiAgICAgIG1lc3NhZ2VEaXYuc3R5bGUub3BhY2l0eSA9ICcwJ1xuICAgICAgbWVzc2FnZURpdi5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgtMTAwJSknXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IG1lc3NhZ2VEaXYucmVtb3ZlKCksIDUwMClcbiAgICB9XG4gIH0sIDQwMDApXG59XG5cbi8vIEF1dG8tcnVuIFNjcmlwdCAxOiBQcm9maWxlIERldGVjdGlvbiBhbmQgRGF0YSBDb2xsZWN0aW9uXG5hc3luYyBmdW5jdGlvbiBydW5Qcm9maWxlRGV0ZWN0aW9uU2NyaXB0KCkge1xuICBjb250ZW50TG9nZ2VyLmxvZygnPT09IFBST0ZJTEUgREVURUNUSU9OIFNDUklQVCBTVEFSVEVEID09PScpXG5cbiAgdHJ5IHtcbiAgICAvLyBXYWl0IGZvciBwYWdlIHRvIGJlIHJlYWR5IGJlZm9yZSBhdHRlbXB0aW5nIHVzZXJuYW1lIGRldGVjdGlvblxuICAgIGF3YWl0IHdhaXRGb3JDb25kaXRpb24oKCkgPT4ge1xuICAgICAgLy8gQ2hlY2sgaWYgdXNlciBkcm9wZG93biBvciBvdGhlciBhdXRoIGluZGljYXRvcnMgYXJlIHByZXNlbnRcbiAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b25bZGF0YS10ZXN0aWQ9XCJ1c2VyLW1lbnUtdHJpZ2dlclwiXScpIHx8XG4gICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtdGVzdGlkPVwidXNlci1hdmF0YXJcIl0nKSB8fFxuICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5oZWFkZXItdXNlci1kcm9wZG93bicpIHx8XG4gICAgICAgICAgICAgcXMoJ2FbaHJlZio9XCIvdS9cIl0nKVxuICAgIH0sIDUwMDAsIDUwMClcblxuICAgIC8vIERldGVjdCB1c2VybmFtZVxuICAgIGNvbnN0IHVzZXJuYW1lID0gYXdhaXQgZXh0cmFjdFVzZXJuYW1lRnJvbVBhZ2UoKVxuICAgIGlmICghdXNlcm5hbWUpIHtcbiAgICAgIGNvbnRlbnRMb2dnZXIubG9nKCdQcm9maWxlIHNjcmlwdDogQ291bGQgbm90IGRldGVjdCB1c2VybmFtZSAtIHdpbGwgcmV0cnkgYWZ0ZXIgbmF2aWdhdGlvbicpXG4gICAgICAvLyBEb24ndCBzaG93IGVycm9yIG1lc3NhZ2UgaGVyZSwganVzdCBjb250aW51ZSB3aXRoIG5hdmlnYXRpb24gd2hpY2ggbWlnaHQgaGVscCBkZXRlY3Rpb25cbiAgICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtc2NyaXB0LXN0YWdlJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnRlbnRMb2dnZXIubG9nKGBQcm9maWxlIHNjcmlwdDogRGV0ZWN0ZWQgdXNlcm5hbWUgJHt1c2VybmFtZX1gKVxuXG4gICAgLy8gTmF2aWdhdGUgdG8gcHJvZmlsZSBwYWdlIGlmIG5vdCBhbHJlYWR5IHRoZXJlXG4gICAgaWYgKCF3aW5kb3cubG9jYXRpb24uaHJlZi5pbmNsdWRlcyh1c2VybmFtZS5yZXBsYWNlKCd1LycsICcnKSkpIHtcbiAgICAgIGNvbnRlbnRMb2dnZXIubG9nKGBQcm9maWxlIHNjcmlwdDogTmF2aWdhdGluZyB0byAke3VzZXJuYW1lfSBwcm9maWxlYClcbiAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtc2NyaXB0LXN0YWdlJywgJ3Byb2ZpbGUtbmF2aWdhdGluZycpXG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGBodHRwczovL3d3dy5yZWRkaXQuY29tLyR7dXNlcm5hbWV9YFxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gU3dpdGNoIHRvIHBvc3RzIHRhYlxuICAgIGF3YWl0IHN3aXRjaFRvUG9zdHNUYWIoKVxuXG4gICAgLy8gQ2FwdHVyZSBkYXRhIGZyb20gcG9zdHMgcGFnZVxuICAgIGNvbnN0IHBvc3RzRGF0YSA9IGF3YWl0IGNhcHR1cmVQb3N0c0RhdGEodXNlcm5hbWUpXG5cbiAgICAvLyBTdG9yZSBpbiBDaHJvbWUgc3RvcmFnZVxuICAgIGF3YWl0IHN0b3JlUHJvZmlsZURhdGEodXNlcm5hbWUsIHBvc3RzRGF0YSlcblxuICAgIC8vIENsZWFyIHNjcmlwdCBzdGFnZVxuICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtc2NyaXB0LXN0YWdlJylcblxuICAgIGNvbnRlbnRMb2dnZXIubG9nKCc9PT0gUFJPRklMRSBERVRFQ1RJT04gU0NSSVBUIENPTVBMRVRFRCA9PT0nKVxuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29udGVudExvZ2dlci5lcnJvcignUHJvZmlsZSBkZXRlY3Rpb24gc2NyaXB0IGVycm9yOicsIGVycm9yKVxuICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtc2NyaXB0LXN0YWdlJylcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBzd2l0Y2hUb1Bvc3RzVGFiKCkge1xuICBjb250ZW50TG9nZ2VyLmxvZygnU3dpdGNoaW5nIHRvIHBvc3RzIHRhYi4uLicpXG5cbiAgY29uc3QgcG9zdHNUYWJTZWxlY3RvcnMgPSBbXG4gICAgJ2FbaHJlZio9XCIvc3VibWl0dGVkXCJdJyxcbiAgICAnYnV0dG9uW2RhdGEtdGFiPVwicG9zdHNcIl0nLFxuICAgICdhOmNvbnRhaW5zKFwiUG9zdHNcIiknLFxuICAgICdzcGFuOmNvbnRhaW5zKFwiUG9zdHNcIiknLFxuICAgICdbZGF0YS10ZXN0aWQ9XCJwb3N0cy10YWJcIl0nXG4gIF1cblxuICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHBvc3RzVGFiU2VsZWN0b3JzKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IHFzKHNlbGVjdG9yKVxuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICBjb250ZW50TG9nZ2VyLmxvZyhgRm91bmQgcG9zdHMgdGFiIHdpdGggc2VsZWN0b3I6ICR7c2VsZWN0b3J9YClcbiAgICAgIGVsZW1lbnQuY2xpY2soKVxuICAgICAgYXdhaXQgc2xlZXAoMjAwMClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG5cbiAgLy8gVHJ5IHRvIG5hdmlnYXRlIGRpcmVjdGx5IHRvIHBvc3RzIFVSTFxuICBjb25zdCBjdXJyZW50VXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWZcbiAgY29uc3QgdXNlcm5hbWVNYXRjaCA9IGN1cnJlbnRVcmwubWF0Y2goL1xcL3VcXC8oW15cXC9dKykvKVxuICBpZiAodXNlcm5hbWVNYXRjaCkge1xuICAgIGNvbnN0IHBvc3RzVXJsID0gYGh0dHBzOi8vd3d3LnJlZGRpdC5jb20vdS8ke3VzZXJuYW1lTWF0Y2hbMV19L3N1Ym1pdHRlZGBcbiAgICBjb250ZW50TG9nZ2VyLmxvZyhgTmF2aWdhdGluZyBkaXJlY3RseSB0byBwb3N0cyBVUkw6ICR7cG9zdHNVcmx9YClcbiAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdyZWRkaXQtcG9zdC1tYWNoaW5lLXNjcmlwdC1zdGFnZScsICdwcm9maWxlLXN3aXRjaGluZy10by1wb3N0cycpXG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBwb3N0c1VybFxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBjb250ZW50TG9nZ2VyLmxvZygnQ291bGQgbm90IGZpbmQgcG9zdHMgdGFiJylcbiAgcmV0dXJuIGZhbHNlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNhcHR1cmVQb3N0c0RhdGEodXNlcm5hbWUpIHtcbiAgY29udGVudExvZ2dlci5sb2coJ0NhcHR1cmluZyBwb3N0cyBkYXRhLi4uJylcblxuICBjb25zdCBwb3N0cyA9IFtdXG4gIGxldCBhdHRlbXB0cyA9IDBcbiAgY29uc3QgbWF4QXR0ZW1wdHMgPSAxMFxuXG4gIC8vIFdhaXQgZm9yIHBvc3RzIHRvIGxvYWQgd2l0aCB0aW1lb3V0IG1lY2hhbmlzbVxuICB3aGlsZSAoYXR0ZW1wdHMgPCBtYXhBdHRlbXB0cyAmJiBwb3N0cy5sZW5ndGggPT09IDApIHtcbiAgICBjb25zdCBwb3N0RWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS10ZXN0aWQ9XCJwb3N0LWNvbnRhaW5lclwiXSwgYXJ0aWNsZSwgZGl2W2RhdGEtY2xpY2staWQ9XCJ0ZXh0XCJdJylcblxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBwb3N0RWxlbWVudHMuc2xpY2UoMCwgMTApKSB7IC8vIExpbWl0IHRvIGZpcnN0IDEwIHBvc3RzXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB0aXRsZUVsZW1lbnQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2gzLCBbZGF0YS10ZXN0aWQ9XCJwb3N0LXRpdGxlXCJdLCBhW2hyZWYqPVwiL2NvbW1lbnRzL1wiXScpXG4gICAgICAgIGNvbnN0IHNjb3JlRWxlbWVudCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtdGVzdGlkPVwicG9zdC12b3RlLXNjb3JlXCJdLCBkaXY6Y29udGFpbnMoXCJ2b3RlXCIpJylcbiAgICAgICAgY29uc3QgY29tbWVudHNFbGVtZW50ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdhW2hyZWYqPVwiL2NvbW1lbnRzL1wiXSBzcGFuJylcbiAgICAgICAgY29uc3QgbGlua0VsZW1lbnQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FbaHJlZio9XCIvY29tbWVudHMvXCJdJylcblxuICAgICAgICBpZiAodGl0bGVFbGVtZW50KSB7XG4gICAgICAgICAgLy8gRW5oYW5jZWQgcG9zdCBzdHJ1Y3R1cmUgd2l0aCBmdWxsIGluZm9ybWF0aW9uXG4gICAgICAgICAgY29uc3QgcG9zdCA9IHtcbiAgICAgICAgICAgIC8vIENvcmUgaWRlbnRpZmllcnMgKGF1dG9mbG93IGNvbXBhdGlibGUpXG4gICAgICAgICAgICBlbGVtZW50SWQ6IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpZCcpIHx8ICcnLCAgLy8gU3RvcmUgSUQgaW5zdGVhZCBvZiBET00gZWxlbWVudFxuICAgICAgICAgICAgZWxlbWVudDogeyAgLy8gS2VlcCBzZXJpYWxpemFibGUgb2JqZWN0IGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuICAgICAgICAgICAgICBpZDogZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2lkJykgfHwgJycsXG4gICAgICAgICAgICAgIHRhZ05hbWU6IGVsZW1lbnQudGFnTmFtZSB8fCAnRElWJ1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gQ29yZSBpZGVudGlmaWVyc1xuICAgICAgICAgICAgaWQ6IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpZCcpIHx8ICcnLFxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlRWxlbWVudC50ZXh0Q29udGVudD8udHJpbSgpIHx8ICcnLFxuICAgICAgICAgICAgdXJsOiBsaW5rRWxlbWVudD8uaHJlZiB8fCAnJyxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcblxuICAgICAgICAgICAgLy8gQXV0aG9yIGFuZCBzdWJyZWRkaXRcbiAgICAgICAgICAgIGF1dGhvcjogdXNlcm5hbWUsXG4gICAgICAgICAgICBzdWJyZWRkaXQ6IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzdWJyZWRkaXQtcHJlZml4ZWQtbmFtZScpIHx8ICcnLFxuXG4gICAgICAgICAgICAvLyBFbmdhZ2VtZW50IG1ldHJpY3NcbiAgICAgICAgICAgIHNjb3JlOiBwYXJzZUludChzY29yZUVsZW1lbnQ/LnRleHRDb250ZW50Py50cmltKCkpIHx8IDAsXG4gICAgICAgICAgICBjb21tZW50Q291bnQ6IHBhcnNlSW50KGNvbW1lbnRzRWxlbWVudD8udGV4dENvbnRlbnQ/LnRyaW0oKSkgfHwgMCxcbiAgICAgICAgICAgIGNvbW1lbnRzOiBjb21tZW50c0VsZW1lbnQ/LnRleHRDb250ZW50Py50cmltKCkgfHwgJzAnLCAvLyBLZWVwIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuXG4gICAgICAgICAgICAvLyBQb3N0IGNvbnRlbnRcbiAgICAgICAgICAgIHBvc3RUeXBlOiBlbGVtZW50LmdldEF0dHJpYnV0ZSgncG9zdC10eXBlJykgfHwgJycsXG4gICAgICAgICAgICBkb21haW46IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkb21haW4nKSB8fCAnJyxcbiAgICAgICAgICAgIGNvbnRlbnRIcmVmOiBlbGVtZW50LmdldEF0dHJpYnV0ZSgnY29udGVudC1ocmVmJykgfHwgJycsXG5cbiAgICAgICAgICAgIC8vIFN0YXR1cyBhbmQgbW9kZXJhdGlvblxuICAgICAgICAgICAgaXRlbVN0YXRlOiBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaXRlbS1zdGF0ZScpIHx8ICcnLFxuICAgICAgICAgICAgdmlld0NvbnRleHQ6IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd2aWV3LWNvbnRleHQnKSB8fCAnJyxcbiAgICAgICAgICAgIHZvdGVUeXBlOiBlbGVtZW50LmdldEF0dHJpYnV0ZSgndm90ZS10eXBlJykgfHwgJycsXG5cbiAgICAgICAgICAgIC8vIEVuaGFuY2VkIG1vZGVyYXRpb24gc3RhdHVzIChhdXRvZmxvdyBjb21wYXRpYmxlKVxuICAgICAgICAgICAgbW9kZXJhdGlvblN0YXR1czoge1xuICAgICAgICAgICAgICBpc1JlbW92ZWQ6IGVsZW1lbnQudGV4dENvbnRlbnQ/LmluY2x1ZGVzKCdyZW1vdmVkIGJ5IHRoZSBtb2RlcmF0b3JzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucXVlcnlTZWxlY3RvcignW2ljb24tbmFtZT1cInJlbW92ZVwiXScpICE9PSBudWxsIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaXRlbS1zdGF0ZScpID09PSAnbW9kZXJhdG9yX3JlbW92ZWQnIHx8IGZhbHNlLFxuICAgICAgICAgICAgICBpc0xvY2tlZDogZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdbaWNvbi1uYW1lPVwibG9jay1maWxsXCJdJykgIT09IG51bGwgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2l0ZW0tc3RhdGUnKSA9PT0gJ2xvY2tlZCcgfHwgZmFsc2UsXG4gICAgICAgICAgICAgIGlzRGVsZXRlZDogZWxlbWVudC50ZXh0Q29udGVudD8uaW5jbHVkZXMoJ2RlbGV0ZWQgYnkgdGhlIHVzZXInKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdbaWNvbi1uYW1lPVwiZGVsZXRlXCJdJykgIT09IG51bGwgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpdGVtLXN0YXRlJykgPT09ICdkZWxldGVkJyB8fCBmYWxzZSxcbiAgICAgICAgICAgICAgaXNTcGFtOiBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaXRlbS1zdGF0ZScpID09PSAnc3BhbScgfHwgZmFsc2UsXG4gICAgICAgICAgICAgIGl0ZW1TdGF0ZTogZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2l0ZW0tc3RhdGUnKSB8fCAnJyxcbiAgICAgICAgICAgICAgdmlld0NvbnRleHQ6IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd2aWV3LWNvbnRleHQnKSB8fCAnJyxcbiAgICAgICAgICAgICAgdm90ZVR5cGU6IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd2b3RlLXR5cGUnKSB8fCAnJ1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gQWRkaXRpb25hbCBtZXRhZGF0YVxuICAgICAgICAgICAgdXNlcklkOiBlbGVtZW50LmdldEF0dHJpYnV0ZSgndXNlci1pZCcpIHx8ICcnLFxuICAgICAgICAgICAgcGVybWFsaW5rOiBlbGVtZW50LmdldEF0dHJpYnV0ZSgncGVybWFsaW5rJykgfHwgJycsXG4gICAgICAgICAgICBjcmVhdGVkVGltZXN0YW1wOiBlbGVtZW50LmdldEF0dHJpYnV0ZSgnY3JlYXRlZC10aW1lc3RhbXAnKSB8fCBEYXRlLm5vdygpLFxuXG4gICAgICAgICAgICAvLyBMZWdhY3kgZmllbGRzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuICAgICAgICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lXG4gICAgICAgICAgfVxuICAgICAgICAgIHBvc3RzLnB1c2gocG9zdClcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29udGVudExvZ2dlci53YXJuKCdFcnJvciBwYXJzaW5nIHBvc3QgZWxlbWVudDonLCBlcnJvcilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb250ZW50TG9nZ2VyLmxvZyhgTm8gcG9zdHMgZm91bmQsIGF0dGVtcHQgJHthdHRlbXB0cyArIDF9LyR7bWF4QXR0ZW1wdHN9YClcbiAgICAgIGF3YWl0IHNsZWVwKDEwMDApXG4gICAgICBhdHRlbXB0cysrXG4gICAgfVxuICB9XG5cbiAgY29udGVudExvZ2dlci5sb2coYENhcHR1cmVkICR7cG9zdHMubGVuZ3RofSBwb3N0c2ApXG4gIHJldHVybiBwb3N0c1xufVxuXG5hc3luYyBmdW5jdGlvbiBzdG9yZVByb2ZpbGVEYXRhKHVzZXJuYW1lLCBwb3N0c0RhdGEpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwcm9maWxlRGF0YSA9IHtcbiAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgIHBvc3RzOiBwb3N0c0RhdGEsXG4gICAgICBsYXN0VXBkYXRlZDogRGF0ZS5ub3coKSxcbiAgICAgIHBhZ2VVcmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG4gICAgfVxuXG4gICAgLy8gU3RvcmUgaW4gQ2hyb21lIHN0b3JhZ2VcbiAgICBhd2FpdCBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyByZWRkaXRQcm9maWxlRGF0YTogcHJvZmlsZURhdGEgfSlcbiAgICBhd2FpdCBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7IHJlZGRpdFByb2ZpbGVEYXRhOiBwcm9maWxlRGF0YSB9KVxuXG4gICAgY29udGVudExvZ2dlci5sb2coYFN0b3JlZCBwcm9maWxlIGRhdGEgZm9yICR7dXNlcm5hbWV9IHdpdGggJHtwb3N0c0RhdGEubGVuZ3RofSBwb3N0c2ApXG5cbiAgICAvLyBOb3RpZnkgYmFja2dyb3VuZCBzY3JpcHRcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICB0eXBlOiAnUFJPRklMRV9EQVRBX1NUT1JFRCcsXG4gICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICBwb3N0c0NvdW50OiBwb3N0c0RhdGEubGVuZ3RoXG4gICAgfSkuY2F0Y2goKCkgPT4ge30pXG5cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb250ZW50TG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gc3RvcmUgcHJvZmlsZSBkYXRhOicsIGVycm9yKVxuICB9XG59XG5cbi8vIEF1dG8tcnVuIFNjcmlwdCAyOiBQb3N0IFN1Ym1pc3Npb24gU2NyaXB0XG5hc3luYyBmdW5jdGlvbiBydW5Qb3N0U3VibWlzc2lvblNjcmlwdCgpIHtcbiAgY29udGVudExvZ2dlci5sb2coJz09PSBQT1NUIFNVQk1JU1NJT04gU0NSSVBUIFNUQVJURUQgPT09JylcblxuICB0cnkge1xuICAgIC8vIENoZWNrIGlmIHRoaXMgdGFiIHdhcyBjcmVhdGVkIGJ5IGJhY2tncm91bmQgc2NyaXB0IHRvIHByZXZlbnQgZHVwbGljYXRlIGV4ZWN1dGlvblxuICAgIGNvbnN0IHRhYlN0YXRlUmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICB0eXBlOiAnR0VUX1RBQl9TVEFURSdcbiAgICB9KVxuXG4gICAgaWYgKHRhYlN0YXRlUmVzcG9uc2Uuc3VjY2VzcyAmJiB0YWJTdGF0ZVJlc3BvbnNlLmlzQmFja2dyb3VuZFBvc3RUYWIpIHtcbiAgICAgIGNvbnRlbnRMb2dnZXIubG9nKCdTa2lwcGluZyBhdXRvLXJ1biBwb3N0IHN1Ym1pc3Npb24gLSB0aGlzIHRhYiB3YXMgY3JlYXRlZCBieSBiYWNrZ3JvdW5kIHNjcmlwdCcpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBFbnN1cmUgcGFnZSBpcyBmdWxseSBsb2FkZWQgYW5kIG9wZXJhYmxlXG4gICAgYXdhaXQgZW5zdXJlU3VibWl0UGFnZVJlYWR5KClcblxuICAgIC8vIEZldGNoIHBvc3QgZGF0YSAodXNpbmcgZXhpc3Rpbmcgc3R1YnMpXG4gICAgY29uc3QgcG9zdERhdGEgPSBhd2FpdCBmZXRjaFBvc3REYXRhRm9yU3VibWlzc2lvbigpXG4gICAgaWYgKCFwb3N0RGF0YSkge1xuICAgICAgY29udGVudExvZ2dlci5sb2coJ1Bvc3Qgc3VibWlzc2lvbiBzY3JpcHQ6IE5vIHBvc3QgZGF0YSBhdmFpbGFibGUnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29udGVudExvZ2dlci5sb2coJ1Bvc3Qgc3VibWlzc2lvbiBzY3JpcHQ6IEdvdCBwb3N0IGRhdGE6JywgcG9zdERhdGEudGl0bGUpXG5cbiAgICAvLyBGaWxsIGZpZWxkcyBvbmUgYnkgb25lXG4gICAgYXdhaXQgZmlsbFBvc3RGaWVsZHNTZXF1ZW50aWFsbHkocG9zdERhdGEpXG5cbiAgICAvLyBQcmVzcyBzdWJtaXRcbiAgICBjb25zdCBzdWJtaXRTdWNjZXNzID0gYXdhaXQgc3VibWl0UG9zdCgpXG5cbiAgICBpZiAoc3VibWl0U3VjY2Vzcykge1xuICAgICAgY29udGVudExvZ2dlci5sb2coJ1Bvc3Qgc3VibWl0dGVkIHN1Y2Nlc3NmdWxseSwgd2FpdGluZyAxMCBzZWNvbmRzLi4uJylcbiAgICAgIGF3YWl0IHNsZWVwKDEwMDAwKVxuXG4gICAgICAvLyBDbGVhciBwb3N0IGRhdGEgdG8gcHJldmVudCByZXVzZVxuICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgncmVkZGl0LXBvc3QtbWFjaGluZS1wb3N0ZGF0YScpXG5cbiAgICAgIC8vIENsb3NlIHRhYlxuICAgICAgY29udGVudExvZ2dlci5sb2coJ0Nsb3NpbmcgdGFiIGFmdGVyIHN1Y2Nlc3NmdWwgc3VibWlzc2lvbicpXG4gICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIHR5cGU6ICdDTE9TRV9DVVJSRU5UX1RBQidcbiAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgLy8gRmFsbGJhY2s6IHRyeSB0byBjbG9zZSB3aW5kb3dcbiAgICAgICAgd2luZG93LmNsb3NlKClcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRlbnRMb2dnZXIubG9nKCdQb3N0IHN1Ym1pc3Npb24gZmFpbGVkJylcbiAgICAgIC8vIENsZWFyIHBvc3QgZGF0YSBldmVuIG9uIGZhaWx1cmUgdG8gcHJldmVudCByZXRyeSBsb29wc1xuICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgncmVkZGl0LXBvc3QtbWFjaGluZS1wb3N0ZGF0YScpXG4gICAgfVxuXG4gICAgY29udGVudExvZ2dlci5sb2coJz09PSBQT1NUIFNVQk1JU1NJT04gU0NSSVBUIENPTVBMRVRFRCA9PT0nKVxuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29udGVudExvZ2dlci5lcnJvcignUG9zdCBzdWJtaXNzaW9uIHNjcmlwdCBlcnJvcjonLCBlcnJvcilcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBlbnN1cmVTdWJtaXRQYWdlUmVhZHkoKSB7XG4gIGNvbnRlbnRMb2dnZXIubG9nKCdFbnN1cmluZyBzdWJtaXQgcGFnZSBpcyByZWFkeS4uLicpXG5cbiAgLy8gV2FpdCBmb3Iga2V5IGVsZW1lbnRzIHRvIGJlIGF2YWlsYWJsZVxuICBjb25zdCBtYXhXYWl0VGltZSA9IDEwMDAwXG4gIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KClcblxuICB3aGlsZSAoRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSA8IG1heFdhaXRUaW1lKSB7XG4gICAgY29uc3QgdGl0bGVJbnB1dCA9IGRlZXBRdWVyeSgnZmFjZXBsYXRlLXRleHRhcmVhLWlucHV0W25hbWU9XCJ0aXRsZVwiXScpXG4gICAgY29uc3QgcG9zdEJ1dHRvbiA9IGRlZXBRdWVyeSgnI2lubmVyLXBvc3Qtc3VibWl0LWJ1dHRvbiwgci1wb3N0LWZvcm0tc3VibWl0LWJ1dHRvbicpXG5cbiAgICBpZiAodGl0bGVJbnB1dCAmJiBwb3N0QnV0dG9uKSB7XG4gICAgICBjb250ZW50TG9nZ2VyLmxvZygnU3VibWl0IHBhZ2UgaXMgcmVhZHknKVxuICAgICAgLy8gUmVtb3ZlIGJlZm9yZXVubG9hZCBsaXN0ZW5lcnNcbiAgICAgIHJlbW92ZUJlZm9yZVVubG9hZExpc3RlbmVycygpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGF3YWl0IHNsZWVwKDUwMClcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignU3VibWl0IHBhZ2UgZGlkIG5vdCBiZWNvbWUgcmVhZHkgaW4gdGltZScpXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZldGNoUG9zdERhdGFGb3JTdWJtaXNzaW9uKCkge1xuICAvLyBDaGVjayBpZiB3ZSBoYXZlIHN0b3JlZCBwb3N0IGRhdGFcbiAgY29uc3Qgc3RvcmVkRGF0YSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtcG9zdGRhdGEnKVxuICBpZiAoc3RvcmVkRGF0YSkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShzdG9yZWREYXRhKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb250ZW50TG9nZ2VyLndhcm4oJ0ZhaWxlZCB0byBwYXJzZSBzdG9yZWQgcG9zdCBkYXRhJylcbiAgICB9XG4gIH1cblxuICAvLyBJZiBubyBzdG9yZWQgZGF0YSwgdGhpcyBtZWFucyB0aGUgc2NyaXB0IGlzIHJ1bm5pbmcgd2l0aG91dCBwcm9wZXIgaW5pdGlhbGl6YXRpb25cbiAgLy8gVGhpcyBzaG91bGQgbm90IGhhcHBlbiBpbiBub3JtYWwgZmxvdyBzaW5jZSBiYWNrZ3JvdW5kIHNjcmlwdCBwcm92aWRlcyB0aGUgZGF0YVxuICB0aHJvdyBuZXcgRXJyb3IoJ05vIHBvc3QgZGF0YSBmb3VuZCAtIHNjcmlwdCBtYXkgYmUgcnVubmluZyBpbmNvcnJlY3RseScpXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZpbGxQb3N0RmllbGRzU2VxdWVudGlhbGx5KHBvc3REYXRhKSB7XG4gIGNvbnRlbnRMb2dnZXIubG9nKCdGaWxsaW5nIHBvc3QgZmllbGRzIHNlcXVlbnRpYWxseS4uLicpXG5cbiAgLy8gU3RlcCAxOiBGaWxsIHRpdGxlXG4gIGNvbnRlbnRMb2dnZXIubG9nKCdTdGVwIDE6IEZpbGxpbmcgdGl0bGUnKVxuICBhd2FpdCBjbGlja1RhYignVEVYVCcpXG4gIGF3YWl0IGZpbGxUaXRsZShwb3N0RGF0YS50aXRsZSlcblxuICAvLyBTdGVwIDI6IEZpbGwgVVJMXG4gIGNvbnRlbnRMb2dnZXIubG9nKCdTdGVwIDI6IEZpbGxpbmcgVVJMJylcbiAgYXdhaXQgY2xpY2tUYWIoJ0xJTksnKVxuICBhd2FpdCBmaWxsVXJsKHBvc3REYXRhLnVybClcblxuICAvLyBTdGVwIDM6IEFjdGl2YXRlIHBvc3QgYnV0dG9uXG4gIGNvbnRlbnRMb2dnZXIubG9nKCdTdGVwIDM6IEFjdGl2YXRpbmcgcG9zdCBidXR0b24nKVxuICBhd2FpdCBjbGlja0JvZHlGaWVsZCgpXG5cbiAgLy8gU3RlcCA0OiBGaWxsIGJvZHkgdGV4dFxuICBjb250ZW50TG9nZ2VyLmxvZygnU3RlcCA0OiBGaWxsaW5nIGJvZHkgdGV4dCcpXG4gIGF3YWl0IGZpbGxCb2R5VGV4dChwb3N0RGF0YS5ib2R5KVxuXG4gIC8vIFN0ZXAgNTogRmluYWwgYWN0aXZhdGlvblxuICBjb250ZW50TG9nZ2VyLmxvZygnU3RlcCA1OiBGaW5hbCBhY3RpdmF0aW9uJylcbiAgYXdhaXQgY2xpY2tCb2R5RmllbGQoKVxuXG4gIGNvbnRlbnRMb2dnZXIubG9nKCdBbGwgZmllbGRzIGZpbGxlZCBzZXF1ZW50aWFsbHknKVxufVxuXG5hc3luYyBmdW5jdGlvbiBzdWJtaXRQb3N0KCkge1xuICBjb250ZW50TG9nZ2VyLmxvZygnU3VibWl0dGluZyBwb3N0Li4uJylcblxuICBjb25zdCBwb3N0Q2xpY2tlZCA9IGF3YWl0IGNsaWNrUG9zdEJ1dHRvbigpXG5cbiAgaWYgKHBvc3RDbGlja2VkKSB7XG4gICAgLy8gTW9uaXRvciBmb3Igc3VibWlzc2lvbiBjb21wbGV0aW9uXG4gICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKVxuICAgIGNvbnN0IHRpbWVvdXQgPSAxNTAwMCAvLyAxNSBzZWNvbmRzXG5cbiAgICB3aGlsZSAoRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSA8IHRpbWVvdXQpIHtcbiAgICAgIGF3YWl0IHNsZWVwKDEwMDApXG5cbiAgICAgIC8vIENoZWNrIGlmIHJlZGlyZWN0ZWQgYXdheSBmcm9tIHN1Ym1pdCBwYWdlXG4gICAgICBpZiAoIXdpbmRvdy5sb2NhdGlvbi5ocmVmLmluY2x1ZGVzKCcvc3VibWl0JykpIHtcbiAgICAgICAgY29udGVudExvZ2dlci5sb2coJ1Bvc3Qgc3VibWl0dGVkIHN1Y2Nlc3NmdWxseScpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGZvciBlcnJvcnNcbiAgICAgIGNvbnN0IGVycm9yRWxlbWVudHMgPSBxc0FsbCgnW3JvbGU9XCJhbGVydFwiXSwgLmVycm9yLW1lc3NhZ2UsIFtjbGFzcyo9XCJlcnJvclwiXScpXG4gICAgICBmb3IgKGNvbnN0IGVycm9yIG9mIGVycm9yRWxlbWVudHMpIHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGVycm9yLnRleHRDb250ZW50Py50b0xvd2VyQ2FzZSgpIHx8ICcnXG4gICAgICAgIGlmICh0ZXh0LmluY2x1ZGVzKCdlcnJvcicpIHx8IHRleHQuaW5jbHVkZXMoJ3J1bGUnKSB8fCB0ZXh0LmluY2x1ZGVzKCd2aW9sYXRpb24nKSkge1xuICAgICAgICAgIGNvbnRlbnRMb2dnZXIubG9nKCdQb3N0IHN1Ym1pc3Npb24gZmFpbGVkOicsIHRleHQpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb250ZW50TG9nZ2VyLmxvZygnUG9zdCBzdWJtaXNzaW9uIHRpbWVkIG91dCcpXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBjb250ZW50TG9nZ2VyLmxvZygnQ291bGQgbm90IGNsaWNrIHBvc3QgYnV0dG9uJylcbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8vIENvbnRpbnVlIHByb2ZpbGUgZGV0ZWN0aW9uIGFmdGVyIG5hdmlnYXRpb25cbmFzeW5jIGZ1bmN0aW9uIGNvbnRpbnVlUHJvZmlsZURldGVjdGlvblNjcmlwdCgpIHtcbiAgY29udGVudExvZ2dlci5sb2coJz09PSBDT05USU5VSU5HIFBST0ZJTEUgREVURUNUSU9OIEFGVEVSIE5BVklHQVRJT04gPT09JylcblxuICB0cnkge1xuICAgIC8vIFN3aXRjaCB0byBwb3N0cyB0YWJcbiAgICBhd2FpdCBzd2l0Y2hUb1Bvc3RzVGFiKClcblxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnRlbnRMb2dnZXIuZXJyb3IoJ0NvbnRpbnVlIHByb2ZpbGUgZGV0ZWN0aW9uIGVycm9yOicsIGVycm9yKVxuICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtc2NyaXB0LXN0YWdlJylcbiAgfVxufVxuXG4vLyBDb250aW51ZSBwcm9maWxlIGRhdGEgY29sbGVjdGlvbiBvbiBwb3N0cyBwYWdlXG5hc3luYyBmdW5jdGlvbiBjb250aW51ZVByb2ZpbGVEYXRhQ29sbGVjdGlvbigpIHtcbiAgY29udGVudExvZ2dlci5sb2coJz09PSBDT05USU5VSU5HIFBST0ZJTEUgREFUQSBDT0xMRUNUSU9OID09PScpXG5cbiAgdHJ5IHtcbiAgICAvLyBFeHRyYWN0IHVzZXJuYW1lIGZyb20gVVJMXG4gICAgY29uc3QgdXNlcm5hbWVNYXRjaCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5tYXRjaCgvXFwvdVxcLyhbXlxcL10rKS8pXG4gICAgaWYgKCF1c2VybmFtZU1hdGNoKSB7XG4gICAgICBjb250ZW50TG9nZ2VyLmxvZygnQ291bGQgbm90IGV4dHJhY3QgdXNlcm5hbWUgZnJvbSBwb3N0cyBwYWdlIFVSTCcpXG4gICAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKCdyZWRkaXQtcG9zdC1tYWNoaW5lLXNjcmlwdC1zdGFnZScpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCB1c2VybmFtZSA9IGB1LyR7dXNlcm5hbWVNYXRjaFsxXX1gXG4gICAgY29udGVudExvZ2dlci5sb2coYEV4dHJhY3RlZCB1c2VybmFtZSBmcm9tIHBvc3RzIHBhZ2U6ICR7dXNlcm5hbWV9YClcblxuICAgIC8vIENhcHR1cmUgZGF0YSBmcm9tIHBvc3RzIHBhZ2VcbiAgICBjb25zdCBwb3N0c0RhdGEgPSBhd2FpdCBjYXB0dXJlUG9zdHNEYXRhKHVzZXJuYW1lKVxuXG4gICAgLy8gU3RvcmUgaW4gQ2hyb21lIHN0b3JhZ2VcbiAgICBhd2FpdCBzdG9yZVByb2ZpbGVEYXRhKHVzZXJuYW1lLCBwb3N0c0RhdGEpXG5cbiAgICAvLyBDbGVhciBzY3JpcHQgc3RhZ2VcbiAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKCdyZWRkaXQtcG9zdC1tYWNoaW5lLXNjcmlwdC1zdGFnZScpXG5cbiAgICBjb250ZW50TG9nZ2VyLmxvZygnPT09IFBST0ZJTEUgREVURUNUSU9OIFNDUklQVCBDT01QTEVURUQgPT09JylcblxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnRlbnRMb2dnZXIuZXJyb3IoJ0NvbnRpbnVlIHByb2ZpbGUgZGF0YSBjb2xsZWN0aW9uIGVycm9yOicsIGVycm9yKVxuICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtc2NyaXB0LXN0YWdlJylcbiAgfVxufVxuXG4vLyBOb3RlOiBQb3N0IGdlbmVyYXRpb24gaXMgbm93IGhhbmRsZWQgZXhjbHVzaXZlbHkgYnkgYmFja2dyb3VuZC5qcyB2aWEgQVBJXG5cbi8vIEhhbmRsZSBtYW51YWwgc2NyaXB0IHRyaWdnZXIgZnJvbSBiYWNrZ3JvdW5kL3BvcHVwXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVNYW51YWxTY3JpcHRUcmlnZ2VyKHNjcmlwdFR5cGUsIG1vZGUpIHtcbiAgY29udGVudExvZ2dlci5sb2coYD09PSBNQU5VQUwgVFJJR0dFUjogJHtzY3JpcHRUeXBlfSAobW9kZTogJHttb2RlfSkgPT09YClcblxuICB0cnkge1xuICAgIGlmIChzY3JpcHRUeXBlID09PSAncHJvZmlsZScpIHtcbiAgICAgIC8vIENsZWFyIGFueSBleGlzdGluZyBzY3JpcHQgc3RhZ2UgZm9yIG1hbnVhbCBleGVjdXRpb25cbiAgICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtc2NyaXB0LXN0YWdlJylcbiAgICAgIGNvbnRlbnRMb2dnZXIubG9nKCdNYW51YWxseSB0cmlnZ2VyaW5nIHByb2ZpbGUgZGV0ZWN0aW9uIHNjcmlwdCcpXG4gICAgICBhd2FpdCBydW5Qcm9maWxlRGV0ZWN0aW9uU2NyaXB0KClcbiAgICB9IGVsc2UgaWYgKHNjcmlwdFR5cGUgPT09ICdwb3N0Jykge1xuICAgICAgY29udGVudExvZ2dlci5sb2coJ01hbnVhbGx5IHRyaWdnZXJpbmcgcG9zdCBzdWJtaXNzaW9uIHNjcmlwdCcpXG4gICAgICBhd2FpdCBydW5Qb3N0U3VibWlzc2lvblNjcmlwdCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRlbnRMb2dnZXIud2FybignVW5rbm93biBzY3JpcHQgdHlwZSBmb3IgbWFudWFsIHRyaWdnZXI6Jywgc2NyaXB0VHlwZSlcbiAgICB9XG5cbiAgICBjb250ZW50TG9nZ2VyLmxvZyhgPT09IE1BTlVBTCBUUklHR0VSIENPTVBMRVRFRDogJHtzY3JpcHRUeXBlfSA9PT1gKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnRlbnRMb2dnZXIuZXJyb3IoYE1hbnVhbCB0cmlnZ2VyIGVycm9yIGZvciAke3NjcmlwdFR5cGV9OmAsIGVycm9yKVxuICB9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVN0YXJ0UG9zdENyZWF0aW9uKHVzZXJOYW1lLCBwb3N0RGF0YSkge1xuICAvL2NvbnRlbnRMb2dnZXIubG9nKGBTdGFydGluZyBwb3N0IGNyZWF0aW9uIGZvciB1c2VyOiAke3VzZXJOYW1lfWAsIHBvc3REYXRhKVxuXG4gIGlmIChwb3N0RGF0YSkge1xuICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgncmVkZGl0LXBvc3QtbWFjaGluZS1wb3N0ZGF0YScsIEpTT04uc3RyaW5naWZ5KHBvc3REYXRhKSk7XG4gIH1cblxuICAvLyBDaGVjayBpZiB1c2VyIGlzIGxvZ2dlZCBpbiBmaXJzdFxuICAvL2NvbnRlbnRMb2dnZXIubG9nKCdDaGVja2luZyBpZiB1c2VyIGlzIGxvZ2dlZCBpbiB1c2luZyBwcm92ZW4gbWV0aG9kLi4uJylcblxuICAvLyBMb29rIGZvciB0aGUgYXZhdGFyIGJ1dHRvbiB0aGF0IHdvdWxkIGluZGljYXRlIGxvZ2dlZCBpbiBzdGF0ZVxuICBjb25zdCBhdmF0YXJCdXR0b24gPSBxcygncnBsLWRyb3Bkb3duIGRpdiwgW2RhdGEtdGVzdGlkPVwidXNlci1hdmF0YXJcIl0sIGJ1dHRvblthcmlhLWxhYmVsKj1cInVzZXJcIl0sICNleHBhbmQtdXNlci1kcmF3ZXItYnV0dG9uJylcblxuICBpZiAoYXZhdGFyQnV0dG9uKSB7XG4gICAgLy9jb250ZW50TG9nZ2VyLmxvZygnRm91bmQgdXNlciBhdmF0YXIgYnV0dG9uIC0gdXNlciBpcyBsb2dnZWQgaW4nKVxuICB9IGVsc2Uge1xuICAgIC8vY29udGVudExvZ2dlci5sb2coJ1VzZXIgYXZhdGFyIGJ1dHRvbiBub3QgZm91bmQgLSB1c2VyIG1heSBub3QgYmUgbG9nZ2VkIGluJylcbiAgICByZXR1cm5cbiAgfVxuXG4gIC8vIFJlcXVlc3QgYmFja2dyb3VuZCBzY3JpcHQgdG8gY3JlYXRlIG5ldyB0YWIgaW5zdGVhZCBvZiBuYXZpZ2F0aW5nXG4gIGNvbnRlbnRMb2dnZXIubG9nKCdSZXF1ZXN0aW5nIGJhY2tncm91bmQgc2NyaXB0IHRvIGNyZWF0ZSBuZXcgcG9zdCB0YWInKVxuICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgdHlwZTogJ0NSRUFURV9QT1NUX1RBQicsXG4gICAgcG9zdERhdGE6IHBvc3REYXRhIC8vIE9ubHkgdXNlIGRhdGEgcHJvdmlkZWQgYnkgYmFja2dyb3VuZCBzY3JpcHRcbiAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcbiAgICAgIGNvbnRlbnRMb2dnZXIubG9nKCdCYWNrZ3JvdW5kIHNjcmlwdCBjcmVhdGVkIHBvc3QgdGFiIHN1Y2Nlc3NmdWxseTonLCByZXNwb25zZS50YWJJZClcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGVudExvZ2dlci5lcnJvcignRmFpbGVkIHRvIGNyZWF0ZSBwb3N0IHRhYjonLCByZXNwb25zZS5lcnJvcilcbiAgICB9XG4gIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICBjb250ZW50TG9nZ2VyLmVycm9yKCdFcnJvciByZXF1ZXN0aW5nIHBvc3QgdGFiIGNyZWF0aW9uOicsIGVycm9yKVxuICB9KVxufVxuXG5mdW5jdGlvbiBmaW5kQ3JlYXRlUG9zdEVsZW1lbnQoKSB7XG4gIC8vIFRyeSBkaXJlY3QgRE9NIHNlYXJjaCBmaXJzdFxuICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NwYW4uZmxleC5pdGVtcy1jZW50ZXIuZ2FwLXhzJylcbiAgaWYgKGVsZW1lbnQgJiYgZWxlbWVudC50ZXh0Q29udGVudC5pbmNsdWRlcygnQ3JlYXRlIFBvc3QnKSkge1xuICAgIHJldHVybiBlbGVtZW50XG4gIH1cblxuICAvLyBTZWFyY2ggZm9yIHNwYW5zIGNvbnRhaW5pbmcgXCJDcmVhdGUgUG9zdFwiXG4gIGNvbnN0IHNwYW5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc3BhbicpXG4gIGZvciAobGV0IHNwYW4gb2Ygc3BhbnMpIHtcbiAgICBpZiAoc3Bhbi50ZXh0Q29udGVudC50cmltKCkgPT09ICdDcmVhdGUgUG9zdCcpIHtcbiAgICAgIHJldHVybiBzcGFuXG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2sgc2hhZG93IHJvb3RzIChjb21tb24gaW4gbW9kZXJuIHdlYiBhcHBzKVxuICBjb25zdCBhbGxFbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKVxuICBmb3IgKGxldCBlbCBvZiBhbGxFbGVtZW50cykge1xuICAgIGlmIChlbC5zaGFkb3dSb290KSB7XG4gICAgICBjb25zdCBzaGFkb3dTcGFucyA9IGVsLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvckFsbCgnc3BhbicpXG4gICAgICBmb3IgKGxldCBzcGFuIG9mIHNoYWRvd1NwYW5zKSB7XG4gICAgICAgIGlmIChzcGFuLnRleHRDb250ZW50LnRyaW0oKSA9PT0gJ0NyZWF0ZSBQb3N0Jykge1xuICAgICAgICAgIHJldHVybiBzcGFuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbFxufVxuXG5mdW5jdGlvbiBzaG93V2VsY29tZU1lc3NhZ2UodXNlck5hbWUpIHtcbiAgLy8gUmVtb3ZlIGFueSBleGlzdGluZyB3ZWxjb21lIG1lc3NhZ2VcbiAgY29uc3QgZXhpc3RpbmdNZXNzYWdlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJlZGRpdC1wb3N0LW1hY2hpbmUtd2VsY29tZScpXG4gIGlmIChleGlzdGluZ01lc3NhZ2UpIHtcbiAgICBleGlzdGluZ01lc3NhZ2UucmVtb3ZlKClcbiAgfVxufVxuXG4vLyBBdXRvLWluaXRpYWxpemUgd2hlbiBET00gaXMgcmVhZHlcbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycpIHtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgICBpbml0aWFsaXplUmVkZGl0SW50ZWdyYXRpb24oKVxuICAgIGNoZWNrRm9yU3RvcmVkVXNlcm5hbWUoKVxuICAgIGNoZWNrRm9yU3RvcmVkUG9zdERhdGEoKVxuICAgIC8vIERJU0FCTEVEOiBBdXRvLWRldGVjdCB1c2VybmFtZSBvbiBwYWdlIGxvYWQgdG8gcHJldmVudCBhdXRvbWF0aWMgdGFiIGNyZWF0aW9uXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0cnlBdXRvRGV0ZWN0VXNlcm5hbWUoKVxuICAgIH0sIDMwMDApXG4gIH0pXG59IGVsc2Uge1xuICBpbml0aWFsaXplUmVkZGl0SW50ZWdyYXRpb24oKVxuICBjaGVja0ZvclN0b3JlZFVzZXJuYW1lKClcbiAgY2hlY2tGb3JTdG9yZWRQb3N0RGF0YSgpXG4gIC8vIERJU0FCTEVEOiBBdXRvLWRldGVjdCB1c2VybmFtZSBvbiBwYWdlIGxvYWQgdG8gcHJldmVudCBhdXRvbWF0aWMgdGFiIGNyZWF0aW9uXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIHRyeUF1dG9EZXRlY3RVc2VybmFtZSgpXG4gIH0sIDMwMDApXG59XG5cbi8vIEZ1bmN0aW9uIHRvIGF1dG8tZGV0ZWN0IHVzZXJuYW1lIG9uIHBhZ2UgbG9hZCBmb3IgdGVzdGluZ1xuYXN5bmMgZnVuY3Rpb24gdHJ5QXV0b0RldGVjdFVzZXJuYW1lKCkge1xuICBjb250ZW50TG9nZ2VyLmxvZygnQXV0by1kZXRlY3RpbmcgdXNlcm5hbWUgb24gcGFnZSBsb2FkLi4uJylcblxuICAvLyBPbmx5IHRyeSBpZiB3ZSBkb24ndCBhbHJlYWR5IGhhdmUgYSBzdG9yZWQgdXNlcm5hbWVcbiAgY29uc3Qgc3RvcmVkVXNlciA9IGF3YWl0IGdldFN0b3JlZFVzZXJuYW1lKClcbiAgaWYgKHN0b3JlZFVzZXIgJiYgc3RvcmVkVXNlci5zZXJlbl9uYW1lKSB7XG4gICAgY29udGVudExvZ2dlci5sb2coJ0FscmVhZHkgaGF2ZSBzdG9yZWQgdXNlcm5hbWU6Jywgc3RvcmVkVXNlci5zZXJlbl9uYW1lKVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gVHJ5IHRvIGV4dHJhY3QgdXNlcm5hbWUgZnJvbSB0aGUgcGFnZVxuICBjb25zdCB1c2VybmFtZSA9IGF3YWl0IGV4dHJhY3RVc2VybmFtZUZyb21QYWdlKClcbiAgaWYgKHVzZXJuYW1lKSB7XG4gICAgY29udGVudExvZ2dlci5sb2coJ1N1Y2Nlc3NmdWxseSBhdXRvLWRldGVjdGVkIHVzZXJuYW1lOicsIHVzZXJuYW1lKVxuICAgIC8vIFNob3cgYSBicmllZiBzdWNjZXNzIG1lc3NhZ2VcbiAgICBjb25zdCBtZXNzYWdlRGl2ID0gY3JlYXRlTWVzc2FnZURpdignXHUyNzA1JywgJ1VzZXJuYW1lIERldGVjdGVkJywgYFN1Y2Nlc3NmdWxseSBkZXRlY3RlZDogJHt1c2VybmFtZX1gLCAnIzRjYWY1MCcpXG4gICAgc2hvd1RlbXBvcmFyeU1lc3NhZ2UobWVzc2FnZURpdilcbiAgfSBlbHNlIHtcbiAgICBjb250ZW50TG9nZ2VyLmxvZygnQ291bGQgbm90IGF1dG8tZGV0ZWN0IHVzZXJuYW1lJylcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0ZvclN0b3JlZFVzZXJuYW1lKCkge1xuICAvLyBDaGVjayBpZiB3ZSdyZSBvbiBzdWJtaXQgcGFnZSBhbmQgaGF2ZSBhIHN0b3JlZCB1c2VybmFtZVxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBjb25zdCBzdG9yZWRVc2VybmFtZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtdXNlcm5hbWUnKVxuICAgIGlmIChzdG9yZWRVc2VybmFtZSAmJiB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5jbHVkZXMoJy9zdWJtaXQnKSkge1xuICAgICAgY29udGVudExvZ2dlci5sb2coYFVzaW5nIHN0b3JlZCB1c2VybmFtZTogJHtzdG9yZWRVc2VybmFtZX1gKVxuICAgICAgc2hvd1dlbGNvbWVNZXNzYWdlKHN0b3JlZFVzZXJuYW1lKVxuICAgICAgLy8gQ2xlYXIgdGhlIHN0b3JlZCB1c2VybmFtZVxuICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgncmVkZGl0LXBvc3QtbWFjaGluZS11c2VybmFtZScpXG4gICAgfVxuICB9LCAxMDAwKSAvLyBXYWl0IGZvciBwYWdlIHRvIGZ1bGx5IGxvYWRcbn1cblxuLy8gW1JlbW92ZWQgbG9jYWwgc3RhdGUgbWFjaGluZSBsb2dpY11cblxuLy8gSGFuZGxlIGFjdGlvbiByZXN1bHRzIGZyb20gRE9NIHNjcmlwdFxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBhc3luYyAoZXZlbnQpID0+IHtcbiAgICAvLyBDaGVjayBmb3IgYm90aCBhY3Rpb24gcmVzdWx0IE9SIGRpcmVjdCByZXF1ZXN0IGZyb20gYmFja2dyb3VuZCAodmlhIHdpbmRvdy5wb3N0TWVzc2FnZSBmcm9tIGNvbnRlbnQgc2NyaXB0IGl0c2VsZj8/IE5vLilcbiAgICAvLyBXZSBvbmx5IGNhcmUgYWJvdXQgcmVzdWx0cyBmcm9tIERPTSBzY3JpcHQgaGVyZVxuXG4gICAgaWYgKGV2ZW50LmRhdGEudHlwZSA9PT0gJ1JFRERJVF9QT1NUX01BQ0hJTkVfQUNUSU9OX1JFU1VMVCcpIHtcbiAgICAgICAgY29uc3QgeyBhY3Rpb24sIHN1Y2Nlc3MsIGRhdGEgfSA9IGV2ZW50LmRhdGE7XG4gICAgICAgIGNvbnRlbnRMb2dnZXIubG9nKGBBY3Rpb24gUmVzdWx0OiAke2FjdGlvbn0gU3VjY2VzczogJHtzdWNjZXNzfWAsIGRhdGEpO1xuXG4gICAgICAgIC8vIEZvcndhcmQgcmVzdWx0IHRvIGJhY2tncm91bmQgc2NyaXB0XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0FDVElPTl9DT01QTEVURUQnLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmUgXCJFeHRlbnNpb24gY29udGV4dCBpbnZhbGlkYXRlZFwiIGVycm9ycyB0aGF0IGhhcHBlbiBkdXJpbmcgcmVsb2Fkc1xuICAgICAgICAgICAgICAgIGlmICghZXJyLm1lc3NhZ2UuaW5jbHVkZXMoJ0V4dGVuc2lvbiBjb250ZXh0IGludmFsaWRhdGVkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudExvZ2dlci53YXJuKCdbQ29udGVudCBTY3JpcHRdIEZhaWxlZCB0byBzZW5kIEFDVElPTl9DT01QTEVURUQ6JywgZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29udGVudExvZ2dlci53YXJuKCdbQ29udGVudCBTY3JpcHRdIEVycm9yIHNlbmRpbmcgbWVzc2FnZTonLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNob3cgdmlzdWFsIGZlZWRiYWNrIHRvIHVzZXJcbiAgICAgICAgaWYgKCFzdWNjZXNzKSB7XG4gICAgICAgICAgICAgY29uc3QgbWVzc2FnZURpdiA9IGNyZWF0ZU1lc3NhZ2VEaXYoJ1x1Mjc0QycsICdBY3Rpb24gRmFpbGVkJywgYFN0ZXAgJHthY3Rpb259IGZhaWxlZC5gLCAnI2QzMmYyZicpO1xuICAgICAgICAgICAgIHNob3dUZW1wb3JhcnlNZXNzYWdlKG1lc3NhZ2VEaXYpO1xuICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ0dFVF9QT1NUUycpIHtcbiAgICAgICAgICAgICAvLyBTYXZlIHBvc3RzIGRhdGEgdG8gQ2hyb21lIHN0b3JhZ2UgZm9yIHBvcHVwIGNvbnN1bXB0aW9uXG4gICAgICAgICAgICAgLy8gJ2RhdGEnIGhlcmUgY29tZXMgZnJvbSBkb20uanMgY2hlY2tVc2VyUG9zdHMoKSBhbmQgaGFzIHsgdG90YWwsIGxhc3RQb3N0RGF0ZSwgcG9zdHMgfVxuXG4gICAgICAgICAgICAgLy8gV2Ugd2FudCB0byBzdG9yZSBpdCBzbyB0aGUgUG9wdXAgY2FuIHJlYWQgaXQgaW1tZWRpYXRlbHlcbiAgICAgICAgICAgICBjb25zdCBzdG9yYWdlRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgdXNlck5hbWU6IG1lc3NhZ2UucGF5bG9hZC51c2VyTmFtZSxcbiAgICAgICAgICAgICAgICAgcG9zdHNJbmZvOiBkYXRhLFxuICAgICAgICAgICAgICAgICBsYXN0VXBkYXRlZDogRGF0ZS5ub3coKVxuICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyAnbGF0ZXN0UG9zdHNEYXRhJzogc3RvcmFnZURhdGEgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICBjb250ZW50TG9nZ2VyLmxvZygnUG9zdHMgZGF0YSBzYXZlZCB0byBsb2NhbCBzdG9yYWdlJywgc3RvcmFnZURhdGEpO1xuXG4gICAgICAgICAgICAgICAgIC8vIE5vdGlmeSBwb3B1cCAoaWYgb3BlbikgdG8gcmVmcmVzaCBpdHMgdmlld1xuICAgICAgICAgICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUE9TVFNfVVBEQVRFRCcsXG4gICAgICAgICAgICAgICAgICAgICBkYXRhOiBzdG9yYWdlRGF0YVxuICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAvLyBQb3B1cCBtaWdodCBiZSBjbG9zZWQsIGlnbm9yZSBlcnJvclxuICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgIC8vIEFsc28gcmVzdG9yZSB0aGUgbGVnYWN5IHN0YXR1cyB1cGRhdGUgbG9naWMgdG8gZW5zdXJlIHRoZSBNYWluIFN0YXR1cyBDYXJkIGluIHRoZSBwb3B1cCB1cGRhdGVzXG4gICAgICAgICAgICAgc2F2ZVVzZXJTdGF0dXNUb1N0b3JhZ2UoZGF0YS51c2VyTmFtZSB8fCAnVXNlcicsIGRhdGEpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbmZ1bmN0aW9uIGNoZWNrRm9yU3RvcmVkUG9zdERhdGEoKSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0b3JlZERhdGEgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdyZWRkaXQtcG9zdC1tYWNoaW5lLXBvc3RkYXRhJyk7XG4gICAgICAgIGlmIChzdG9yZWREYXRhICYmIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmNsdWRlcygnL3N1Ym1pdCcpKSB7XG4gICAgICAgICAgICBjb250ZW50TG9nZ2VyLmxvZygnRm91bmQgc3RvcmVkIHBvc3QgZGF0YSwgYXR0ZW1wdGluZyB0byBmaWxsIGZvcm0uLi4nKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcG9zdERhdGEgPSBKU09OLnBhcnNlKHN0b3JlZERhdGEpO1xuICAgICAgICAgICAgICAgIGZpbGxQb3N0Rm9ybShwb3N0RGF0YSk7XG5cbiAgICAgICAgICAgICAgICAvLyBDbGVhciBhZnRlciB1c2VcbiAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKCdyZWRkaXQtcG9zdC1tYWNoaW5lLXBvc3RkYXRhJyk7XG5cbiAgICAgICAgICAgICAgICAvLyBEb24ndCBub3RpZnkgY29tcGxldGlvbiB5ZXQgLSB3YWl0IGZvciBhY3R1YWwgcG9zdCBzdWJtaXNzaW9uXG4gICAgICAgICAgICAgICAgLy8gV2UnbGwgbW9uaXRvciBmb3Igc3VjY2Vzc2Z1bCBzdWJtaXNzaW9uIHNlcGFyYXRlbHlcblxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnRMb2dnZXIuZXJyb3IoJ0Vycm9yIHBhcnNpbmcgc3RvcmVkIHBvc3QgZGF0YScsIGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwgMjAwMCk7XG59XG5cbi8vIFN0YXJ0IHRoZSBwcm9jZXNzIC0gdHJpZ2dlcmVkIGJ5IGJhY2tncm91bmQgbm93XG4vLyBXZSBzdGlsbCBrZWVwIHRoaXMgZnVuY3Rpb24gYnV0IGl0J3Mgc2ltcGxlclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2hlY2tVc2VyU3RhdHVzKHVzZXJOYW1lKSB7XG4gIGNvbnRlbnRMb2dnZXIubG9nKGBDaGVja2luZyB1c2VyIHN0YXR1cyBmb3I6ICR7dXNlck5hbWV9YClcbiAgY29uc3Qgc3RhdHVzRGl2ID0gY3JlYXRlTWVzc2FnZURpdignXHVEODNEXHVERDBEJywgJ0NoZWNraW5nIFN0YXR1cycsIGBDaGVja2luZyBzdGF0dXMgZm9yICR7dXNlck5hbWV9Li4uYCwgJyMyMTk2ZjMnKVxuICBzaG93VGVtcG9yYXJ5TWVzc2FnZShzdGF0dXNEaXYpXG5cbiAgLy8gVHJpZ2dlciBET00gYWN0aW9uXG4gIHdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgdHlwZTogJ1JFRERJVF9QT1NUX01BQ0hJTkVfTkFWSUdBVEVfUFJPRklMRScsXG4gICAgcGF5bG9hZDogeyB1c2VyTmFtZSB9XG4gIH0sICcqJyk7XG59XG5cbi8vIENoZWNrIGlmIGFjY291bnQgaXMgbG9ja2VkIChmcm9tIHBvc3RtLXBhZ2UuanMpXG5mdW5jdGlvbiBjaGVja0FjY291bnRMb2NrZWQoKSB7XG4gIGNvbnN0IHBocmFzZXMgPSBbXCJ3ZSd2ZSBsb2NrZWQgeW91ciBhY2NvdW50XCIsIFwibG9ja2VkIHlvdXIgYWNjb3VudFwiLCBcImFjY291bnQgc3VzcGVuZGVkXCJdXG4gIGNvbnN0IHBhZ2VUZXh0ID0gZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudC50b0xvd2VyQ2FzZSgpXG5cbiAgY29uc3QgaGFzTG9ja2VkUGhyYXNlID0gcGhyYXNlcy5zb21lKHBocmFzZSA9PiBwYWdlVGV4dC5pbmNsdWRlcyhwaHJhc2UpKVxuXG4gIGNvbnN0IGVycm9yQmFubmVycyA9IHFzQWxsKCdmYWNlcGxhdGUtYmFubmVyW2FwcGVhcmFuY2U9XCJlcnJvclwiXScpXG4gIGNvbnN0IGhhc0xvY2tlZEJhbm5lciA9IGVycm9yQmFubmVycy5zb21lKGVsID0+XG4gICAgZWwudGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2xvY2tlZCcpIHx8IGVsLnRleHRDb250ZW50Py50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdzdXNwZW5kZWQnKSlcblxuICByZXR1cm4gaGFzTG9ja2VkUGhyYXNlIHx8IGhhc0xvY2tlZEJhbm5lclxufVxuXG4vLyBIZWxwZXIgZm9yIHJvYnVzdCB3YWl0aW5nXG5hc3luYyBmdW5jdGlvbiB3YWl0Rm9yQ29uZGl0aW9uKGNvbmRpdGlvbkZuLCB0aW1lb3V0ID0gMTAwMDAsIGludGVydmFsID0gNTAwKSB7XG4gIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICB3aGlsZSAoRGF0ZS5ub3coKSAtIHN0YXJ0IDwgdGltZW91dCkge1xuICAgIGlmIChhd2FpdCBjb25kaXRpb25GbigpKSByZXR1cm4gdHJ1ZVxuICAgIGF3YWl0IHNsZWVwKGludGVydmFsKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbi8vIENoZWNrIHVzZXIgcG9zdHMgKGZyb20gcG9zdG0tcGFnZS5qcylcbmFzeW5jIGZ1bmN0aW9uIGNoZWNrVXNlclBvc3RzKCkge1xuICBjb250ZW50TG9nZ2VyLmxvZygnQ2hlY2tpbmcgdXNlciBwb3N0cy4uLicpXG5cbiAgLy8gV2FpdCBmb3IgcG9zdHMgdG8gYXBwZWFyXG4gIGxldCBwb3N0cyA9IFtdXG4gIGF3YWl0IHdhaXRGb3JDb25kaXRpb24oKCkgPT4ge1xuICAgIHBvc3RzID0gcXNBbGwoJ3NocmVkZGl0LXBvc3QsIFtkYXRhLXRlc3RpZD1cInBvc3QtY29udGFpbmVyXCJdLCAuUG9zdCwgW2RhdGEtdGVzdGlkKj1cInBvc3RcIl0nKVxuICAgIHJldHVybiBwb3N0cy5sZW5ndGggPiAwXG4gIH0sIDUwMDAsIDUwMClcblxuICBjb250ZW50TG9nZ2VyLmxvZyhgRm91bmQgJHtwb3N0cy5sZW5ndGh9IHBvc3RzYClcblxuICBpZiAocG9zdHMubGVuZ3RoID4gMCkge1xuICAgIC8vIFNvcnQgcG9zdHMgYnkgZGF0ZSAobmV3ZXN0IGZpcnN0KSB3aXRoIGVuaGFuY2VkIGRhdGFcbiAgICBjb25zdCBwb3N0c1dpdGhEYXRlcyA9IHBvc3RzLm1hcChwb3N0ID0+IHtcbiAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IHBvc3QuZ2V0QXR0cmlidXRlKCdjcmVhdGVkLXRpbWVzdGFtcCcpIHx8XG4gICAgICAgIHBvc3QucXVlcnlTZWxlY3RvcigndGltZSwgW2RhdGEtdGVzdGlkPVwicG9zdF90aW1lc3RhbXBcIl0nKT8uZ2V0QXR0cmlidXRlKCdkYXRldGltZScpIHx8XG4gICAgICAgIHBvc3QucXVlcnlTZWxlY3Rvcignc3BhbltkYXRhLXRlc3RpZD1cInBvc3RfdGltZXN0YW1wXCJdJyk/LnRleHRDb250ZW50IHx8XG4gICAgICAgIHBvc3QucXVlcnlTZWxlY3RvcigndGltZScpPy5nZXRBdHRyaWJ1dGUoJ2RhdGV0aW1lJylcblxuICAgICAgLy8gRW5oYW5jZWQgcG9zdCBzdHJ1Y3R1cmUgd2l0aCBmdWxsIGluZm9ybWF0aW9uXG4gICAgICBjb25zdCBlbmhhbmNlZFBvc3QgPSB7XG4gICAgICAgIC8vIENvcmUgaWRlbnRpZmllcnMgKGF1dG9mbG93IGNvbXBhdGlibGUpXG4gICAgICAgIGVsZW1lbnRJZDogcG9zdC5nZXRBdHRyaWJ1dGUoJ2lkJykgfHwgJycsICAvLyBTdG9yZSBJRCBpbnN0ZWFkIG9mIERPTSBlbGVtZW50XG4gICAgICAgIGVsZW1lbnQ6IHsgIC8vIEtlZXAgc2VyaWFsaXphYmxlIG9iamVjdCBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcbiAgICAgICAgICBpZDogcG9zdC5nZXRBdHRyaWJ1dGUoJ2lkJykgfHwgJycsXG4gICAgICAgICAgdGFnTmFtZTogcG9zdC50YWdOYW1lIHx8ICdzaHJlZGRpdC1wb3N0J1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIENvcmUgaWRlbnRpZmllcnNcbiAgICAgICAgaWQ6IHBvc3QuZ2V0QXR0cmlidXRlKCdpZCcpIHx8ICcnLFxuICAgICAgICB0aXRsZTogcG9zdC5nZXRBdHRyaWJ1dGUoJ3Bvc3QtdGl0bGUnKSB8fCBwb3N0LnF1ZXJ5U2VsZWN0b3IoJ2gzLCBbZGF0YS10ZXN0aWQ9XCJwb3N0LXRpdGxlXCJdJyk/LnRleHRDb250ZW50Py50cmltKCkgfHwgJycsXG4gICAgICAgIHVybDogcG9zdC5nZXRBdHRyaWJ1dGUoJ3Blcm1hbGluaycpIHx8IHBvc3QucXVlcnlTZWxlY3RvcignYVtocmVmKj1cIi9jb21tZW50cy9cIl0nKT8uaHJlZiB8fCAnJyxcbiAgICAgICAgdGltZXN0YW1wOiB0aW1lc3RhbXAsXG5cbiAgICAgICAgLy8gQXV0aG9yIGFuZCBzdWJyZWRkaXRcbiAgICAgICAgYXV0aG9yOiBwb3N0LmdldEF0dHJpYnV0ZSgnYXV0aG9yJykgfHwgJycsXG4gICAgICAgIHN1YnJlZGRpdDogcG9zdC5nZXRBdHRyaWJ1dGUoJ3N1YnJlZGRpdC1wcmVmaXhlZC1uYW1lJykgfHwgJycsXG4gICAgICAgIGF1dGhvcklkOiBwb3N0LmdldEF0dHJpYnV0ZSgnYXV0aG9yLWlkJykgfHwgJycsXG4gICAgICAgIHN1YnJlZGRpdElkOiBwb3N0LmdldEF0dHJpYnV0ZSgnc3VicmVkZGl0LWlkJykgfHwgJycsXG5cbiAgICAgICAgLy8gRW5nYWdlbWVudCBtZXRyaWNzXG4gICAgICAgIHNjb3JlOiBwYXJzZUludChwb3N0LmdldEF0dHJpYnV0ZSgnc2NvcmUnKSkgfHwgMCxcbiAgICAgICAgY29tbWVudENvdW50OiBwYXJzZUludChwb3N0LmdldEF0dHJpYnV0ZSgnY29tbWVudC1jb3VudCcpKSB8fCAwLFxuICAgICAgICBhd2FyZENvdW50OiBwYXJzZUludChwb3N0LmdldEF0dHJpYnV0ZSgnYXdhcmQtY291bnQnKSkgfHwgMCxcblxuICAgICAgICAvLyBQb3N0IGNvbnRlbnRcbiAgICAgICAgcG9zdFR5cGU6IHBvc3QuZ2V0QXR0cmlidXRlKCdwb3N0LXR5cGUnKSB8fCAnJyxcbiAgICAgICAgZG9tYWluOiBwb3N0LmdldEF0dHJpYnV0ZSgnZG9tYWluJykgfHwgJycsXG4gICAgICAgIGNvbnRlbnRIcmVmOiBwb3N0LmdldEF0dHJpYnV0ZSgnY29udGVudC1ocmVmJykgfHwgJycsXG5cbiAgICAgICAgLy8gU3RhdHVzIGFuZCBtb2RlcmF0aW9uXG4gICAgICAgIGl0ZW1TdGF0ZTogcG9zdC5nZXRBdHRyaWJ1dGUoJ2l0ZW0tc3RhdGUnKSB8fCAnJyxcbiAgICAgICAgdmlld0NvbnRleHQ6IHBvc3QuZ2V0QXR0cmlidXRlKCd2aWV3LWNvbnRleHQnKSB8fCAnJyxcbiAgICAgICAgdm90ZVR5cGU6IHBvc3QuZ2V0QXR0cmlidXRlKCd2b3RlLXR5cGUnKSB8fCAnJyxcblxuICAgICAgICAvLyBFbmhhbmNlZCBtb2RlcmF0aW9uIHN0YXR1cyAoYXV0b2Zsb3cgY29tcGF0aWJsZSlcbiAgICAgICAgbW9kZXJhdGlvblN0YXR1czoge1xuICAgICAgICAgIGlzUmVtb3ZlZDogcG9zdC50ZXh0Q29udGVudD8uaW5jbHVkZXMoJ3JlbW92ZWQgYnkgdGhlIG1vZGVyYXRvcnMnKSB8fFxuICAgICAgICAgICAgICAgICAgICBwb3N0LnF1ZXJ5U2VsZWN0b3IoJ1tpY29uLW5hbWU9XCJyZW1vdmVcIl0nKSAhPT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgICAgICBwb3N0LmdldEF0dHJpYnV0ZSgnaXRlbS1zdGF0ZScpID09PSAnbW9kZXJhdG9yX3JlbW92ZWQnIHx8IGZhbHNlLFxuICAgICAgICAgIGlzTG9ja2VkOiBwb3N0LnF1ZXJ5U2VsZWN0b3IoJ1tpY29uLW5hbWU9XCJsb2NrLWZpbGxcIl0nKSAhPT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgICAgIHBvc3QuZ2V0QXR0cmlidXRlKCdpdGVtLXN0YXRlJykgPT09ICdsb2NrZWQnIHx8IGZhbHNlLFxuICAgICAgICAgIGlzRGVsZXRlZDogcG9zdC50ZXh0Q29udGVudD8uaW5jbHVkZXMoJ2RlbGV0ZWQgYnkgdGhlIHVzZXInKSB8fFxuICAgICAgICAgICAgICAgICAgICBwb3N0LnF1ZXJ5U2VsZWN0b3IoJ1tpY29uLW5hbWU9XCJkZWxldGVcIl0nKSAhPT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgICAgICBwb3N0LmdldEF0dHJpYnV0ZSgnaXRlbS1zdGF0ZScpID09PSAnZGVsZXRlZCcgfHwgZmFsc2UsXG4gICAgICAgICAgaXNTcGFtOiBwb3N0LmdldEF0dHJpYnV0ZSgnaXRlbS1zdGF0ZScpID09PSAnc3BhbScgfHwgZmFsc2UsXG4gICAgICAgICAgaXRlbVN0YXRlOiBwb3N0LmdldEF0dHJpYnV0ZSgnaXRlbS1zdGF0ZScpIHx8ICcnLFxuICAgICAgICAgIHZpZXdDb250ZXh0OiBwb3N0LmdldEF0dHJpYnV0ZSgndmlldy1jb250ZXh0JykgfHwgJycsXG4gICAgICAgICAgdm90ZVR5cGU6IHBvc3QuZ2V0QXR0cmlidXRlKCd2b3RlLXR5cGUnKSB8fCAnJ1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIEFkZGl0aW9uYWwgbWV0YWRhdGFcbiAgICAgICAgdXNlcklkOiBwb3N0LmdldEF0dHJpYnV0ZSgndXNlci1pZCcpIHx8ICcnLFxuICAgICAgICBwZXJtYWxpbms6IHBvc3QuZ2V0QXR0cmlidXRlKCdwZXJtYWxpbmsnKSB8fCAnJyxcbiAgICAgICAgY3JlYXRlZFRpbWVzdGFtcDogcG9zdC5nZXRBdHRyaWJ1dGUoJ2NyZWF0ZWQtdGltZXN0YW1wJykgfHwgdGltZXN0YW1wLFxuXG4gICAgICAgIC8vIEtlZXAgb3JpZ2luYWwgRE9NIGVsZW1lbnQgZm9yIGRlbGV0aW9uIG9wZXJhdGlvbnMgKGJ1dCB3b24ndCBiZSBzZXJpYWxpemVkKVxuICAgICAgICBfZG9tRWxlbWVudDogcG9zdFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZW5oYW5jZWRQb3N0XG4gICAgfSkuZmlsdGVyKHBvc3QgPT4gcG9zdC50aW1lc3RhbXApXG5cbiAgICAvLyBTb3J0IGJ5IGRhdGUgKG5ld2VzdCBmaXJzdClcbiAgICBwb3N0c1dpdGhEYXRlcy5zb3J0KChhLCBiKSA9PiBuZXcgRGF0ZShiLnRpbWVzdGFtcCkgLSBuZXcgRGF0ZShhLnRpbWVzdGFtcCkpXG5cbiAgICBjb250ZW50TG9nZ2VyLmxvZygnPT09IFBPU1RTIFNVTU1BUlkgPT09JylcbiAgICBjb250ZW50TG9nZ2VyLmxvZyhgVG90YWwgcG9zdHM6ICR7cG9zdHMubGVuZ3RofWApXG5cbiAgICBwb3N0c1dpdGhEYXRlcy5mb3JFYWNoKChwb3N0LCBpbmRleCkgPT4ge1xuICAgICAgY29udGVudExvZ2dlci5sb2coYFBvc3QgJHtpbmRleCArIDF9OiAke3Bvc3QudGltZXN0YW1wfWApXG4gICAgfSlcblxuICAgIGlmIChwb3N0c1dpdGhEYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb250ZW50TG9nZ2VyLmxvZyhgTGFzdCBwb3N0IGRhdGU6ICR7cG9zdHNXaXRoRGF0ZXNbMF0udGltZXN0YW1wfWApXG5cbiAgICAgIC8vIFJldHVybiBwb3N0cyB3aXRoIGVuaGFuY2VkIHN0cnVjdHVyZVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG90YWw6IHBvc3RzV2l0aERhdGVzLmxlbmd0aCxcbiAgICAgICAgbGFzdFBvc3REYXRlOiBwb3N0c1dpdGhEYXRlc1swXS50aW1lc3RhbXAsXG4gICAgICAgIHBvc3RzOiBwb3N0c1dpdGhEYXRlcy5tYXAocG9zdCA9PiAoe1xuICAgICAgICAgIC4uLnBvc3QsXG4gICAgICAgICAgLy8gS2VlcCB0aGUgc2VyaWFsaXphYmxlIGVsZW1lbnQgb2JqZWN0IGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuICAgICAgICAgIGVsZW1lbnQ6IHtcbiAgICAgICAgICAgIGlkOiBwb3N0LmVsZW1lbnQuaWQsXG4gICAgICAgICAgICB0YWdOYW1lOiBwb3N0LmVsZW1lbnQudGFnTmFtZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgLy8gSW5jbHVkZSBET00gZWxlbWVudCBmb3IgZGVsZXRpb24gb3BlcmF0aW9ucyAoc2VwYXJhdGUgZmllbGQpXG4gICAgICAgICAgX2RvbUVsZW1lbnQ6IHBvc3QuX2RvbUVsZW1lbnRcbiAgICAgICAgfSkpXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnRlbnRMb2dnZXIubG9nKCdObyBwb3N0cyBmb3VuZCcpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIHRvdGFsOiAwLFxuICAgIGxhc3RQb3N0RGF0ZTogbnVsbCxcbiAgICBwb3N0czogW11cbiAgfVxufVxuXG4vLyBTYXZlIHVzZXIgc3RhdHVzIHJlc3VsdHMgdG8gQ2hyb21lIHN0b3JhZ2VcbmFzeW5jIGZ1bmN0aW9uIHNhdmVVc2VyU3RhdHVzVG9TdG9yYWdlKHVzZXJOYW1lLCBwb3N0c0luZm8pIHtcbiAgY29udGVudExvZ2dlci5sb2coJz09PSBVU0VSIFNUQVRVUyBSRVNVTFRTID09PScpXG4gIGNvbnRlbnRMb2dnZXIubG9nKGBVc2VyOiAke3VzZXJOYW1lfWApXG4gIGNvbnRlbnRMb2dnZXIubG9nKGBUb3RhbCBwb3N0czogJHtwb3N0c0luZm8udG90YWx9YClcbiAgY29udGVudExvZ2dlci5sb2coYExhc3QgcG9zdCBkYXRlOiAke3Bvc3RzSW5mby5sYXN0UG9zdERhdGUgfHwgJ05vdCBhdmFpbGFibGUnfWApXG5cbiAgLy8gRm9ybWF0IHRoZSBsYXN0IHBvc3QgZGF0ZVxuICBsZXQgbGFzdFBvc3RUZXh0ID0gJ05vIHBvc3RzIGZvdW5kJ1xuICBpZiAocG9zdHNJbmZvLmxhc3RQb3N0RGF0ZSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBsYXN0UG9zdERhdGUgPSBuZXcgRGF0ZShwb3N0c0luZm8ubGFzdFBvc3REYXRlKVxuICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKVxuICAgICAgY29uc3QgZGlmZlRpbWUgPSBNYXRoLmFicyhub3cgLSBsYXN0UG9zdERhdGUpXG4gICAgICBjb25zdCBkaWZmRGF5cyA9IE1hdGguY2VpbChkaWZmVGltZSAvICgxMDAwICogNjAgKiA2MCAqIDI0KSlcblxuICAgICAgaWYgKGRpZmZEYXlzID09PSAxKSB7XG4gICAgICAgIGxhc3RQb3N0VGV4dCA9ICdZZXN0ZXJkYXknXG4gICAgICB9IGVsc2UgaWYgKGRpZmZEYXlzIDwgNykge1xuICAgICAgICBsYXN0UG9zdFRleHQgPSBgJHtkaWZmRGF5c30gZGF5cyBhZ29gXG4gICAgICB9IGVsc2UgaWYgKGRpZmZEYXlzIDwgMzApIHtcbiAgICAgICAgY29uc3Qgd2Vla3MgPSBNYXRoLmNlaWwoZGlmZkRheXMgLyA3KVxuICAgICAgICBsYXN0UG9zdFRleHQgPSBgJHt3ZWVrc30gd2VlayR7d2Vla3MgPiAxID8gJ3MnIDogJyd9IGFnb2BcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxhc3RQb3N0VGV4dCA9IGxhc3RQb3N0RGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoKVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsYXN0UG9zdFRleHQgPSBwb3N0c0luZm8ubGFzdFBvc3REYXRlXG4gICAgfVxuICB9XG5cbiAgLy8gQ3JlYXRlIHVzZXIgc3RhdHVzIGRhdGEgb2JqZWN0XG4gIGNvbnN0IHVzZXJTdGF0dXNEYXRhID0ge1xuICAgIHVzZXJOYW1lOiB1c2VyTmFtZSxcbiAgICBjdXJyZW50VXNlcjogdXNlck5hbWUsXG4gICAgc3RvcmVkVXNlcjogdXNlck5hbWUsXG4gICAgaXNNYXRjaDogdHJ1ZSxcbiAgICBwb3N0c0NvdW50OiBwb3N0c0luZm8udG90YWwsIC8vIENoYW5nZWQgZnJvbSB0b3RhbFBvc3RzIHRvIHBvc3RzQ291bnRcbiAgICBsYXN0UG9zdERhdGU6IHBvc3RzSW5mby5sYXN0UG9zdERhdGUsXG4gICAgbGFzdFBvc3RUZXh0OiBsYXN0UG9zdFRleHQsXG4gICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgIGNoZWNrVXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICBsYXN0Q2hlY2s6IERhdGUubm93KCksXG4gICAgc3RhdHVzTWVzc2FnZTogJ1Bvc3RzIGRhdGEgY29sbGVjdGVkIHN1Y2Nlc3NmdWxseSdcbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gU2F2ZSB0byBib3RoIHN5bmMgYW5kIGxvY2FsIHN0b3JhZ2VcbiAgICBhd2FpdCBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7IHVzZXJTdGF0dXM6IHVzZXJTdGF0dXNEYXRhIH0pXG4gICAgYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgdXNlclN0YXR1czogdXNlclN0YXR1c0RhdGEgfSlcblxuICAgIGNvbnRlbnRMb2dnZXIubG9nKCdVc2VyIHN0YXR1cyBzYXZlZCB0byBDaHJvbWUgc3RvcmFnZTonLCB1c2VyU3RhdHVzRGF0YSlcblxuICAgIC8vIFNob3cgYnJpZWYgc3VjY2VzcyBtZXNzYWdlXG4gICAgY29uc3QgbWVzc2FnZURpdiA9IGNyZWF0ZU1lc3NhZ2VEaXYoJ1x1MjcwNScsICdTYXZlZCcsICdVc2VyIHN0YXR1cyBkYXRhIHNhdmVkIHN1Y2Nlc3NmdWxseScsICcjNGNhZjUwJylcbiAgICBzaG93VGVtcG9yYXJ5TWVzc2FnZShtZXNzYWdlRGl2KVxuXG4gICAgLy8gTm90aWZ5IGJhY2tncm91bmQgc2NyaXB0XG4gICAgYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgdHlwZTogJ1VTRVJfU1RBVFVTX1NBVkVEJyxcbiAgICAgIGRhdGE6IHVzZXJTdGF0dXNEYXRhXG4gICAgfSlcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb250ZW50TG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gc2F2ZSB1c2VyIHN0YXR1cyB0byBDaHJvbWUgc3RvcmFnZTonLCBlcnJvcilcbiAgICBjb25zdCBtZXNzYWdlRGl2ID0gY3JlYXRlTWVzc2FnZURpdignXHUyNzRDJywgJ1NhdmUgRmFpbGVkJywgJ0ZhaWxlZCB0byBzYXZlIHVzZXIgc3RhdHVzIGRhdGEnLCAnI2QzMmYyZicpXG4gICAgc2hvd1RlbXBvcmFyeU1lc3NhZ2UobWVzc2FnZURpdilcbiAgfVxufVxuXG4vLyBIYW5kbGUgZGVsZXRlIGxhc3QgcG9zdCByZXF1ZXN0IGZyb20gcG9wdXBcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZURlbGV0ZUxhc3RQb3N0KHVzZXJOYW1lKSB7XG4gIGNvbnRlbnRMb2dnZXIubG9nKGBEZWxldGluZyBsYXN0IHBvc3QgZm9yOiAke3VzZXJOYW1lfWApXG5cbiAgLy8gU2hvdyBpbml0aWFsIGRlbGV0ZSBtZXNzYWdlXG4gIGNvbnN0IHN0YXR1c0RpdiA9IGNyZWF0ZU1lc3NhZ2VEaXYoJ1x1RDgzRFx1REREMVx1RkUwRicsICdEZWxldGluZyBQb3N0JywgYEZpbmRpbmcgYW5kIGRlbGV0aW5nIGxhc3QgcG9zdCBmb3IgJHt1c2VyTmFtZX0uLi5gLCAnI2ZmNTcyMicpXG4gIHNob3dUZW1wb3JhcnlNZXNzYWdlKHN0YXR1c0RpdilcblxuICB0cnkge1xuICAgIC8vIEZpcnN0IGNoZWNrIGlmIGFjY291bnQgaXMgbG9ja2VkXG4gICAgaWYgKGNoZWNrQWNjb3VudExvY2tlZCgpKSB7XG4gICAgICBjb250ZW50TG9nZ2VyLmxvZygnQWNjb3VudCBsb2NrZWQnKVxuICAgICAgY29uc3QgbWVzc2FnZURpdiA9IGNyZWF0ZU1lc3NhZ2VEaXYoJ1x1RDgzRFx1REQxMicsICdBY2NvdW50IExvY2tlZCcsICdZb3VyIFJlZGRpdCBhY2NvdW50IGFwcGVhcnMgdG8gYmUgbG9ja2VkIG9yIHN1c3BlbmRlZC4nLCAnI2QzMmYyZicpXG4gICAgICBzaG93VGVtcG9yYXJ5TWVzc2FnZShtZXNzYWdlRGl2KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdXNlciBwb3N0cyBkaXJlY3RseSAobm8gbmF2aWdhdGlvbiBuZWVkZWQgc2luY2Ugd2UncmUgYWxyZWFkeSBvbiBwb3N0cyBwYWdlKVxuICAgIGNvbnN0IHBvc3RzSW5mbyA9IGF3YWl0IGNoZWNrVXNlclBvc3RzKClcblxuICAgIGlmIChwb3N0c0luZm8udG90YWwgPT09IDApIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2VEaXYgPSBjcmVhdGVNZXNzYWdlRGl2KCdcdTIxMzlcdUZFMEYnLCAnTm8gUG9zdHMgRm91bmQnLCAnTm8gcG9zdHMgZm91bmQgdG8gZGVsZXRlLicsICcjMjE5NmYzJylcbiAgICAgIHNob3dUZW1wb3JhcnlNZXNzYWdlKG1lc3NhZ2VEaXYpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIG1vc3QgcmVjZW50IHBvc3RcbiAgICBjb25zdCBtb3N0UmVjZW50UG9zdCA9IHBvc3RzSW5mby5wb3N0c1swXVxuICAgIGlmICghbW9zdFJlY2VudFBvc3QgfHwgKCFtb3N0UmVjZW50UG9zdC5fZG9tRWxlbWVudCAmJiAhbW9zdFJlY2VudFBvc3QuZWxlbWVudCkpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2VEaXYgPSBjcmVhdGVNZXNzYWdlRGl2KCdcdTI3NEMnLCAnUG9zdCBOb3QgRm91bmQnLCAnQ291bGQgbm90IGZpbmQgdGhlIG1vc3QgcmVjZW50IHBvc3QuJywgJyNmZjU3MjInKVxuICAgICAgc2hvd1RlbXBvcmFyeU1lc3NhZ2UobWVzc2FnZURpdilcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIEF0dGVtcHQgdG8gZGVsZXRlIHRoZSBwb3N0XG4gICAgY29uc3QgZGVsZXRlU3VjY2VzcyA9IGF3YWl0IGRlbGV0ZVBvc3QobW9zdFJlY2VudFBvc3QuX2RvbUVsZW1lbnQgfHwgbW9zdFJlY2VudFBvc3QuZWxlbWVudClcbiAgICBpZiAoZGVsZXRlU3VjY2Vzcykge1xuICAgICAgY29uc3QgbWVzc2FnZURpdiA9IGNyZWF0ZU1lc3NhZ2VEaXYoJ1x1MjcwNScsICdQb3N0IERlbGV0ZWQnLCAnTGFzdCBwb3N0IGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBkZWxldGVkIScsICcjNGNhZjUwJylcbiAgICAgIHNob3dUZW1wb3JhcnlNZXNzYWdlKG1lc3NhZ2VEaXYpXG5cbiAgICAgIC8vIE5vdGlmeSBiYWNrZ3JvdW5kIHNjcmlwdCBvZiBzdWNjZXNzZnVsIGRlbGV0aW9uXG4gICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIHR5cGU6ICdBQ1RJT05fQ09NUExFVEVEJyxcbiAgICAgICAgYWN0aW9uOiAnREVMRVRFX1BPU1RfQ09NUExFVEVEJyxcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgcG9zdElkOiBtb3N0UmVjZW50UG9zdC5pZCB8fCBudWxsLFxuICAgICAgICByZWRkaXRVcmw6IG1vc3RSZWNlbnRQb3N0LnVybCB8fCBudWxsLFxuICAgICAgICB0aXRsZTogbW9zdFJlY2VudFBvc3QudGl0bGUgfHwgbnVsbFxuICAgICAgfSkuY2F0Y2goKCkgPT4ge30pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2VEaXYgPSBjcmVhdGVNZXNzYWdlRGl2KCdcdTI3NEMnLCAnRGVsZXRlIEZhaWxlZCcsICdDb3VsZCBub3QgZGVsZXRlIHRoZSBwb3N0LiBQbGVhc2UgdHJ5IG1hbnVhbGx5LicsICcjZmY1NzIyJylcbiAgICAgIHNob3dUZW1wb3JhcnlNZXNzYWdlKG1lc3NhZ2VEaXYpXG5cbiAgICAgIC8vIE5vdGlmeSBiYWNrZ3JvdW5kIHNjcmlwdCBvZiBmYWlsZWQgZGVsZXRpb25cbiAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgdHlwZTogJ0FDVElPTl9DT01QTEVURUQnLFxuICAgICAgICBhY3Rpb246ICdERUxFVEVfUE9TVF9DT01QTEVURUQnLFxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6ICdDb3VsZCBub3QgZGVsZXRlIHRoZSBwb3N0J1xuICAgICAgfSkuY2F0Y2goKCkgPT4ge30pXG4gICAgfVxuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29udGVudExvZ2dlci5lcnJvcignRXJyb3IgZGVsZXRpbmcgbGFzdCBwb3N0OicsIGVycm9yKVxuICAgIGNvbnN0IG1lc3NhZ2VEaXYgPSBjcmVhdGVNZXNzYWdlRGl2KCdcdTI3NEMnLCAnRXJyb3InLCAnRmFpbGVkIHRvIGRlbGV0ZSBsYXN0IHBvc3QuJywgJyNkMzJmMmYnKVxuICAgIHNob3dUZW1wb3JhcnlNZXNzYWdlKG1lc3NhZ2VEaXYpXG4gIH1cbn1cblxuLy8gRnVuY3Rpb24gdG8gZGVsZXRlIGEgc3BlY2lmaWMgcG9zdCBlbGVtZW50XG5hc3luYyBmdW5jdGlvbiBkZWxldGVQb3N0KHBvc3RFbGVtZW50KSB7XG4gIGNvbnRlbnRMb2dnZXIubG9nKCdBdHRlbXB0aW5nIHRvIGRlbGV0ZSBwb3N0IGVsZW1lbnQ6JywgcG9zdEVsZW1lbnQpXG5cbiAgdHJ5IHtcbiAgICAvLyBMb29rIGZvciBkZWxldGUvbW9yZSBvcHRpb25zIGJ1dHRvbiBvbiB0aGUgcG9zdFxuICAgIGNvbnN0IG1vcmVPcHRpb25zU2VsZWN0b3JzID0gW1xuICAgICAgJ2J1dHRvblthcmlhLWxhYmVsPVwiT3BlbiB1c2VyIGFjdGlvbnNcIl0nLFxuICAgICAgJ2J1dHRvbltpZD1cIm92ZXJmbG93LXRyaWdnZXJcIl0nLFxuICAgICAgJ2J1dHRvblthcmlhLWxhYmVsKj1cInVzZXIgYWN0aW9uc1wiXScsXG4gICAgICAnc2hyZWRkaXQtb3ZlcmZsb3ctbWVudSBidXR0b24nLFxuICAgICAgJ3NocmVkZGl0LW92ZXJmbG93LW1lbnUnLFxuICAgICAgJ2J1dHRvblthcmlhLWxhYmVsKj1cIm1vcmUgb3B0aW9uc1wiXScsXG4gICAgICAnYnV0dG9uW2FyaWEtbGFiZWwqPVwiTW9yZSBvcHRpb25zXCJdJyxcbiAgICAgICdidXR0b25bZGF0YS10ZXN0aWQ9XCJwb3N0LW1lbnUtdHJpZ2dlclwiXScsXG4gICAgICAnW2RhdGEtdGVzdGlkKj1cIm92ZXJmbG93LW1lbnVcIl0nLFxuICAgICAgJ2J1dHRvblthcmlhLWhhc3BvcHVwPVwidHJ1ZVwiXScsXG4gICAgICAnW2RhdGEtY2xpY2staWQ9XCJvdmVyZmxvd1wiXScsXG4gICAgICAnYnV0dG9uW3RpdGxlKj1cIm1vcmVcIl0nLFxuICAgICAgJ2ZhY2VwbGF0ZS1kcm9wZG93bi1tZW51IGJ1dHRvbicsXG4gICAgICAnYnV0dG9uW2FyaWEtbGFiZWwqPVwiTW9yZSBwb3N0IGFjdGlvbnNcIl0nLFxuICAgICAgJ2J1dHRvbiBzdmdbZmlsbD1cImN1cnJlbnRDb2xvclwiXScsXG4gICAgICAnW3Nsb3Q9XCJwb3N0LXN0YXRzLWVudHJ5LXBvaW50XCJdIGJ1dHRvbicsXG4gICAgICAnYnV0dG9uOmhhcyhzdmcpJ1xuICAgIF1cblxuICAgIC8vIExvb2sgZm9yIGRlbGV0ZS9tb3JlIG9wdGlvbnMgYnV0dG9uIG9uIHRoZSBwb3N0IC0gY2hlY2sgU2hhZG93IERPTSB0b29cbiAgICBjb25zdCBmaW5kT3ZlcmZsb3dCdXR0b24gPSAoZWxlbWVudCkgPT4ge1xuICAgICAgY29udGVudExvZ2dlci5sb2coJ1NlYXJjaGluZyBmb3Igb3ZlcmZsb3cgYnV0dG9uIGluIGVsZW1lbnQ6JywgZWxlbWVudC50YWdOYW1lKVxuXG4gICAgICAvLyBGaXJzdCB0cnkgbm9ybWFsIHF1ZXJ5U2VsZWN0b3JcbiAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2YgbW9yZU9wdGlvbnNTZWxlY3RvcnMpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuICAgICAgICBpZiAoYnV0dG9uKSB7XG4gICAgICAgICAgY29udGVudExvZ2dlci5sb2coYEZvdW5kIG92ZXJmbG93IGJ1dHRvbiB3aXRoIHNlbGVjdG9yOiAke3NlbGVjdG9yfWApXG4gICAgICAgICAgcmV0dXJuIGJ1dHRvblxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZW4gY2hlY2sgc2hhZG93IHJvb3RzXG4gICAgICBjb25zdCBhbGxFbGVtZW50cyA9IGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnKicpXG4gICAgICBjb250ZW50TG9nZ2VyLmxvZyhgQ2hlY2tpbmcgJHthbGxFbGVtZW50cy5sZW5ndGh9IGVsZW1lbnRzIGZvciBzaGFkb3cgcm9vdHNgKVxuXG4gICAgICBmb3IgKGNvbnN0IGVsIG9mIGFsbEVsZW1lbnRzKSB7XG4gICAgICAgIGlmIChlbC5zaGFkb3dSb290KSB7XG4gICAgICAgICAgY29udGVudExvZ2dlci5sb2coYEZvdW5kIHNoYWRvdyByb290IGluIGVsZW1lbnQ6ICR7ZWwudGFnTmFtZX1gKVxuICAgICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2YgbW9yZU9wdGlvbnNTZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IGVsLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihzZWxlY3RvcilcbiAgICAgICAgICAgIGlmIChidXR0b24pIHtcbiAgICAgICAgICAgICAgY29udGVudExvZ2dlci5sb2coYEZvdW5kIG92ZXJmbG93IGJ1dHRvbiBpbiBzaGFkb3cgRE9NIHdpdGggc2VsZWN0b3I6ICR7c2VsZWN0b3J9YClcbiAgICAgICAgICAgICAgcmV0dXJuIGJ1dHRvblxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb250ZW50TG9nZ2VyLmxvZygnTm8gb3ZlcmZsb3cgYnV0dG9uIGZvdW5kIGluIG5vcm1hbCBET00gb3Igc2hhZG93IHJvb3RzJylcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgbGV0IG1vcmVCdXR0b24gPSBmaW5kT3ZlcmZsb3dCdXR0b24ocG9zdEVsZW1lbnQpXG5cbiAgICBpZiAobW9yZUJ1dHRvbikge1xuICAgICAgY29udGVudExvZ2dlci5sb2coJ0ZvdW5kIG92ZXJmbG93IGJ1dHRvbiB1c2luZyBTaGFkb3cgRE9NIHNlYXJjaCcpXG4gICAgfVxuXG4gICAgaWYgKCFtb3JlQnV0dG9uKSB7XG4gICAgICBjb250ZW50TG9nZ2VyLmxvZygnTW9yZSBvcHRpb25zIGJ1dHRvbiBub3QgZm91bmQgaW4gcG9zdCwgdHJ5aW5nIGFsdGVybmF0aXZlIGFwcHJvYWNoLi4uJylcblxuICAgICAgLy8gRGVidWc6IExvZyBhbGwgYnV0dG9ucyBpbiB0aGUgcG9zdCBlbGVtZW50XG4gICAgICBjb25zdCBhbGxCdXR0b25zID0gcG9zdEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJylcbiAgICAgIGNvbnRlbnRMb2dnZXIubG9nKGBGb3VuZCAke2FsbEJ1dHRvbnMubGVuZ3RofSBidXR0b25zIGluIHBvc3Q6YClcbiAgICAgIGFsbEJ1dHRvbnMuZm9yRWFjaCgoYnRuLCBpKSA9PiB7XG4gICAgICAgIGNvbnRlbnRMb2dnZXIubG9nKGBCdXR0b24gJHtpfTpgLCB7XG4gICAgICAgICAgYXJpYUxhYmVsOiBidG4uZ2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJyksXG4gICAgICAgICAgY2xhc3NOYW1lOiBidG4uY2xhc3NOYW1lLFxuICAgICAgICAgIGlubmVySFRNTDogYnRuLmlubmVySFRNTD8uc3Vic3RyaW5nKDAsIDEwMCksXG4gICAgICAgICAgb3V0ZXJIVE1MOiBidG4ub3V0ZXJIVE1MPy5zdWJzdHJpbmcoMCwgMjAwKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgLy8gVHJ5IHRvIGZpbmQgYW55IGJ1dHRvbiB0aGF0IG1pZ2h0IGJlIHRoZSBvdmVyZmxvdyBtZW51XG4gICAgICBmb3IgKGNvbnN0IGJ0biBvZiBhbGxCdXR0b25zKSB7XG4gICAgICAgIGNvbnN0IGFyaWFMYWJlbCA9IGJ0bi5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnKT8udG9Mb3dlckNhc2UoKSB8fCAnJ1xuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSBidG4uY2xhc3NOYW1lPy50b0xvd2VyQ2FzZSgpIHx8ICcnXG4gICAgICAgIGNvbnN0IGlubmVySFRNTCA9IGJ0bi5pbm5lckhUTUw/LnRvTG93ZXJDYXNlKCkgfHwgJydcblxuICAgICAgICBpZiAoYXJpYUxhYmVsLmluY2x1ZGVzKCdtb3JlJykgfHwgYXJpYUxhYmVsLmluY2x1ZGVzKCdtZW51JykgfHwgYXJpYUxhYmVsLmluY2x1ZGVzKCdvcHRpb25zJykgfHxcbiAgICAgICAgICAgIGNsYXNzTmFtZS5pbmNsdWRlcygnb3ZlcmZsb3cnKSB8fCBjbGFzc05hbWUuaW5jbHVkZXMoJ21lbnUnKSB8fFxuICAgICAgICAgICAgaW5uZXJIVE1MLmluY2x1ZGVzKCdzdmcnKSB8fCBpbm5lckhUTUwuaW5jbHVkZXMoJ1x1MjJFRicpIHx8IGlubmVySFRNTC5pbmNsdWRlcygnLi4uJykpIHtcbiAgICAgICAgICBjb250ZW50TG9nZ2VyLmxvZygnRm91bmQgcG90ZW50aWFsIG92ZXJmbG93IG1lbnUgYnV0dG9uOicsIGJ0bilcbiAgICAgICAgICBtb3JlQnV0dG9uID0gYnRuXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIW1vcmVCdXR0b24pIHtcbiAgICAgICAgY29udGVudExvZ2dlci5sb2coJ05vIG92ZXJmbG93IG1lbnUgYnV0dG9uIGZvdW5kIGluIHBvc3QgZWxlbWVudCcpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENsaWNrIHRoZSBtb3JlIG9wdGlvbnMgYnV0dG9uXG4gICAgbW9yZUJ1dHRvbi5jbGljaygpXG4gICAgYXdhaXQgc2xlZXAoMTUwMClcblxuICAgIC8vIEVuaGFuY2VkIHNlYXJjaCBmb3IgZGVsZXRlIG9wdGlvbiB3aXRoIHJldHJ5IGxvZ2ljIGFuZCBzaGFkb3cgRE9NIHN1cHBvcnRcbiAgICBjb25zdCBmaW5kRGVsZXRlT3B0aW9uID0gKHJvb3QgPSBkb2N1bWVudCkgPT4ge1xuICAgICAgLy8gQ2hlY2sgQUxMIGVsZW1lbnRzIGluIGN1cnJlbnQgcm9vdCBmb3IgdGV4dCBtYXRjaFxuICAgICAgY29uc3QgYWxsRWxlbWVudHMgPSBBcnJheS5mcm9tKHJvb3QucXVlcnlTZWxlY3RvckFsbCgnKicpKS5yZXZlcnNlKClcblxuICAgICAgZm9yIChjb25zdCBlbCBvZiBhbGxFbGVtZW50cykge1xuICAgICAgICAvLyBTa2lwIGNvbW1vbiBub24taW50ZXJhY3RpdmUgc3RydWN0dXJhbCB0YWdzXG4gICAgICAgIGlmIChbJ1NDUklQVCcsICdTVFlMRScsICdIVE1MJywgJ0JPRFknLCAnSEVBRCddLmluY2x1ZGVzKGVsLnRhZ05hbWUpKSBjb250aW51ZVxuXG4gICAgICAgIGNvbnN0IHRleHQgPSBlbC50ZXh0Q29udGVudD8udG9Mb3dlckNhc2UoKS50cmltKCkgfHwgJydcbiAgICAgICAgY29uc3QgYXJpYUxhYmVsID0gZWwuZ2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJyk/LnRvTG93ZXJDYXNlKCkgfHwgJydcbiAgICAgICAgY29uc3QgdGVzdElkID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXRlc3RpZCcpPy50b0xvd2VyQ2FzZSgpIHx8ICcnXG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yICdkZWxldGUnIGtleXdvcmRcbiAgICAgICAgY29uc3QgaXNEZWxldGVNYXRjaCA9XG4gICAgICAgICAgdGV4dCA9PT0gJ2RlbGV0ZScgfHxcbiAgICAgICAgICAodGV4dC5pbmNsdWRlcygnZGVsZXRlJykgJiYgdGV4dC5sZW5ndGggPCAyMCkgfHxcbiAgICAgICAgICBhcmlhTGFiZWwuaW5jbHVkZXMoJ2RlbGV0ZScpIHx8XG4gICAgICAgICAgdGVzdElkLmluY2x1ZGVzKCdkZWxldGUnKVxuXG4gICAgICAgIGlmIChpc0RlbGV0ZU1hdGNoKSB7XG4gICAgICAgICAgLy8gQ2hlY2sgdmlzaWJpbGl0eVxuICAgICAgICAgIGlmIChlbC5vZmZzZXRQYXJlbnQgPT09IG51bGwgJiYgd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpLmRpc3BsYXkgPT09ICdub25lJykge1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250ZW50TG9nZ2VyLmxvZygnRm91bmQgcG90ZW50aWFsIGRlbGV0ZSBlbGVtZW50OicsIGVsKVxuXG4gICAgICAgICAgLy8gRmluZCBjbG9zZXN0IGNsaWNrYWJsZSBhbmNlc3RvclxuICAgICAgICAgIGNvbnN0IGNsaWNrYWJsZSA9IGVsLmNsb3Nlc3QoJ2J1dHRvbiwgYSwgZGl2W3JvbGU9XCJtZW51aXRlbVwiXSwgZmFjZXBsYXRlLWRyb3Bkb3duLW1lbnUtaXRlbScpIHx8IGVsXG4gICAgICAgICAgcmV0dXJuIGNsaWNrYWJsZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFJlY3Vyc2l2ZWx5IHNlYXJjaCBzaGFkb3cgcm9vdHNcbiAgICAgIGNvbnN0IGFsbCA9IEFycmF5LmZyb20ocm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcqJykpXG4gICAgICBmb3IgKGNvbnN0IGVsIG9mIGFsbCkge1xuICAgICAgICBpZiAoZWwuc2hhZG93Um9vdCkge1xuICAgICAgICAgIGNvbnN0IGZvdW5kID0gZmluZERlbGV0ZU9wdGlvbihlbC5zaGFkb3dSb290KVxuICAgICAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGZvdW5kXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgLy8gUmV0cnkgbG9vcCBmb3IgZmluZGluZyBkZWxldGUgb3B0aW9uXG4gICAgbGV0IGRlbGV0ZU9wdGlvbiA9IG51bGxcbiAgICBmb3IgKGxldCBhdHRlbXB0cyA9IDA7IGF0dGVtcHRzIDwgMzsgYXR0ZW1wdHMrKykge1xuICAgICAgZGVsZXRlT3B0aW9uID0gZmluZERlbGV0ZU9wdGlvbigpXG4gICAgICBpZiAoZGVsZXRlT3B0aW9uKSBicmVha1xuXG4gICAgICAvLyBBbHNvIGNoZWNrIGV4cGxpY2l0bHkgZm9yIHBvcnRhbHMgd2hpY2ggbWlnaHQgYmUgb3V0c2lkZSBzdGFuZGFyZCBmbG93XG4gICAgICBjb25zdCBwb3J0YWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZmFjZXBsYXRlLXBvcnRhbCwgLnBvcnRhbCwgW2lkKj1cInBvcnRhbFwiXScpXG4gICAgICBmb3IgKGNvbnN0IHBvcnRhbCBvZiBwb3J0YWxzKSB7XG4gICAgICAgIGlmIChwb3J0YWwuc2hhZG93Um9vdCkge1xuICAgICAgICAgIGNvbnN0IGZvdW5kID0gZmluZERlbGV0ZU9wdGlvbihwb3J0YWwuc2hhZG93Um9vdClcbiAgICAgICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgICAgIGRlbGV0ZU9wdGlvbiA9IGZvdW5kXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBmb3VuZCA9IGZpbmREZWxldGVPcHRpb24ocG9ydGFsKVxuICAgICAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICAgICAgZGVsZXRlT3B0aW9uID0gZm91bmRcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZGVsZXRlT3B0aW9uKSBicmVha1xuXG4gICAgICBjb250ZW50TG9nZ2VyLmxvZyhgRGVsZXRlIG9wdGlvbiBub3QgZm91bmQsIHJldHJ5aW5nLi4uICgke2F0dGVtcHRzICsgMX0vMylgKVxuICAgICAgYXdhaXQgc2xlZXAoMTAwMClcbiAgICB9XG5cbiAgICAvLyBGYWxsYmFjazogTG9vayBmb3IgZGFuZ2VyIGVsZW1lbnRzXG4gICAgaWYgKCFkZWxldGVPcHRpb24pIHtcbiAgICAgIGNvbnRlbnRMb2dnZXIubG9nKCdTdGFuZGFyZCBkZWxldGUgdGV4dCBzZWFyY2ggZmFpbGVkLCBsb29raW5nIGZvciBkYW5nZXIgZWxlbWVudHMuLi4nKVxuICAgICAgY29uc3QgZGFuZ2VyRWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbYXBwZWFyYW5jZT1cImRhbmdlclwiXSwgLmljb24tZGVsZXRlLCBbaWNvbi1uYW1lPVwiZGVsZXRlXCJdJylcbiAgICAgIGlmIChkYW5nZXJFbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGRlbGV0ZU9wdGlvbiA9IGRhbmdlckVsZW1lbnRzWzBdLmNsb3Nlc3QoJ2J1dHRvbiwgYSwgZGl2W3JvbGU9XCJtZW51aXRlbVwiXScpIHx8IGRhbmdlckVsZW1lbnRzWzBdXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFkZWxldGVPcHRpb24pIHtcbiAgICAgIGNvbnRlbnRMb2dnZXIubG9nKCdEZWxldGUgb3B0aW9uIG5vdCBmb3VuZCBpbiBkcm9wZG93biBtZW51JylcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIC8vIENsaWNrIHRoZSBkZWxldGUgb3B0aW9uXG4gICAgZGVsZXRlT3B0aW9uLmNsaWNrKClcbiAgICBhd2FpdCBzbGVlcCgxNTAwKVxuXG4gICAgLy8gRW5oYW5jZWQgc2VhcmNoIGZvciBjb25maXJtYXRpb24gYnV0dG9uIHdpdGggc2hhZG93IERPTSBhbmQgcG9ydGFsIHN1cHBvcnRcbiAgICBjb25zdCBmaW5kQ29uZmlybUJ1dHRvbiA9IChyb290ID0gZG9jdW1lbnQpID0+IHtcbiAgICAgIC8vIENoZWNrIEFMTCBlbGVtZW50cyBpbiBjdXJyZW50IHJvb3QgZm9yIGNvbmZpcm1hdGlvbiB0ZXh0IG1hdGNoXG4gICAgICBjb25zdCBhbGxFbGVtZW50cyA9IEFycmF5LmZyb20ocm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcqJykpLnJldmVyc2UoKVxuXG4gICAgICBmb3IgKGNvbnN0IGVsIG9mIGFsbEVsZW1lbnRzKSB7XG4gICAgICAgIC8vIFNraXAgY29tbW9uIG5vbi1pbnRlcmFjdGl2ZSBzdHJ1Y3R1cmFsIHRhZ3NcbiAgICAgICAgaWYgKFsnU0NSSVBUJywgJ1NUWUxFJywgJ0hUTUwnLCAnQk9EWScsICdIRUFEJ10uaW5jbHVkZXMoZWwudGFnTmFtZSkpIGNvbnRpbnVlXG5cbiAgICAgICAgLy8gT25seSBjaGVjayBidXR0b24gZWxlbWVudHMgZm9yIGNvbmZpcm1hdGlvbiB0byBhdm9pZCBtYXRjaGluZyBpbmRpdmlkdWFsIHNwYW5zXG4gICAgICAgIGNvbnN0IGlzQ2xpY2thYmxlRWxlbWVudCA9XG4gICAgICAgICAgZWwudGFnTmFtZSA9PT0gJ0JVVFRPTicgfHxcbiAgICAgICAgICBlbC50YWdOYW1lID09PSAnQScgfHxcbiAgICAgICAgICAoZWwudGFnTmFtZSA9PT0gJ0RJVicgJiYgZWwuZ2V0QXR0cmlidXRlKCdyb2xlJykgPT09ICdidXR0b24nKSB8fFxuICAgICAgICAgIGVsLnRhZ05hbWUgPT09ICdGQUNFUExBVEUtQlVUVE9OJyB8fFxuICAgICAgICAgIGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2ZhY2VwbGF0ZS1idXR0b24nXG5cbiAgICAgICAgLy8gRGVidWcgbG9nZ2luZyB0byBzZWUgd2hhdCdzIGJlaW5nIHByb2Nlc3NlZFxuICAgICAgICBpZiAoZWwudGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2RlbGV0ZScpKSB7XG4gICAgICAgICAgY29udGVudExvZ2dlci5sb2coJ0RlYnVnIC0gRWxlbWVudCB3aXRoIGRlbGV0ZSB0ZXh0OicsIGVsLnRhZ05hbWUsIGVsLCAnSXMgY2xpY2thYmxlOicsIGlzQ2xpY2thYmxlRWxlbWVudClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXNDbGlja2FibGVFbGVtZW50KSB7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRleHQgPSBlbC50ZXh0Q29udGVudD8udG9Mb3dlckNhc2UoKS50cmltKCkgfHwgJydcbiAgICAgICAgY29uc3QgYXJpYUxhYmVsID0gZWwuZ2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJyk/LnRvTG93ZXJDYXNlKCkgfHwgJydcbiAgICAgICAgY29uc3QgdGVzdElkID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXRlc3RpZCcpPy50b0xvd2VyQ2FzZSgpIHx8ICcnXG5cbiAgICAgICAgLy8gTWF0Y2ggY29uZmlybWF0aW9uIHRleHQgcGF0dGVybnMgLSBiZSBtb3JlIHN0cmljdCB0byBmaW5kIGFjdHVhbCBcIlllcywgRGVsZXRlXCIgYnV0dG9uXG4gICAgICAgIGNvbnN0IGlzQ29uZmlybU1hdGNoID1cbiAgICAgICAgICB0ZXh0ID09PSAneWVzLCBkZWxldGUnIHx8XG4gICAgICAgICAgdGV4dC5pbmNsdWRlcygneWVzLCBkZWxldGUnKSB8fFxuICAgICAgICAgICh0ZXh0LmluY2x1ZGVzKCdkZWxldGUnKSAmJiB0ZXh0LmluY2x1ZGVzKCd5ZXMnKSkgfHxcbiAgICAgICAgICAoYXJpYUxhYmVsLmluY2x1ZGVzKCdkZWxldGUnKSAmJiBhcmlhTGFiZWwuaW5jbHVkZXMoJ3llcycpKSB8fFxuICAgICAgICAgICh0ZXN0SWQuaW5jbHVkZXMoJ2RlbGV0ZScpICYmIHRlc3RJZC5pbmNsdWRlcygnY29uZmlybScpKVxuXG4gICAgICAgIGlmIChpc0NvbmZpcm1NYXRjaCkge1xuICAgICAgICAgIC8vIENoZWNrIHZpc2liaWxpdHlcbiAgICAgICAgICBpZiAoZWwub2Zmc2V0UGFyZW50ID09PSBudWxsICYmIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKS5kaXNwbGF5ID09PSAnbm9uZScpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGVudExvZ2dlci5sb2coJ0ZvdW5kIHBvdGVudGlhbCBjb25maXJtYXRpb24gZWxlbWVudDonLCBlbCwgJ1RleHQ6JywgdGV4dClcblxuICAgICAgICAgIC8vIEZpbmQgY2xvc2VzdCBjbGlja2FibGUgYW5jZXN0b3JcbiAgICAgICAgICBjb25zdCBjbGlja2FibGUgPSBlbC5jbG9zZXN0KCdidXR0b24sIGEsIGRpdltyb2xlPVwiYnV0dG9uXCJdLCBmYWNlcGxhdGUtYnV0dG9uJykgfHwgZWxcbiAgICAgICAgICByZXR1cm4gY2xpY2thYmxlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUmVjdXJzaXZlbHkgc2VhcmNoIHNoYWRvdyByb290c1xuICAgICAgY29uc3QgYWxsID0gQXJyYXkuZnJvbShyb290LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKSlcbiAgICAgIGZvciAoY29uc3QgZWwgb2YgYWxsKSB7XG4gICAgICAgIGlmIChlbC5zaGFkb3dSb290KSB7XG4gICAgICAgICAgY29uc3QgZm91bmQgPSBmaW5kQ29uZmlybUJ1dHRvbihlbC5zaGFkb3dSb290KVxuICAgICAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGZvdW5kXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgLy8gUmV0cnkgbG9vcCBmb3IgZmluZGluZyBjb25maXJtYXRpb24gYnV0dG9uXG4gICAgbGV0IGNvbmZpcm1CdXR0b24gPSBudWxsXG4gICAgZm9yIChsZXQgYXR0ZW1wdHMgPSAwOyBhdHRlbXB0cyA8IDM7IGF0dGVtcHRzKyspIHtcbiAgICAgIGNvbmZpcm1CdXR0b24gPSBmaW5kQ29uZmlybUJ1dHRvbigpXG4gICAgICBpZiAoY29uZmlybUJ1dHRvbikgYnJlYWtcblxuICAgICAgLy8gQWxzbyBjaGVjayBleHBsaWNpdGx5IGZvciBwb3J0YWxzIHdoaWNoIG1pZ2h0IGNvbnRhaW4gdGhlIGNvbmZpcm1hdGlvbiBkaWFsb2dcbiAgICAgIGNvbnN0IHBvcnRhbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdmYWNlcGxhdGUtcG9ydGFsLCAucG9ydGFsLCBbaWQqPVwicG9ydGFsXCJdLCAubW9kYWwsIC5vdmVybGF5JylcbiAgICAgIGZvciAoY29uc3QgcG9ydGFsIG9mIHBvcnRhbHMpIHtcbiAgICAgICAgaWYgKHBvcnRhbC5zaGFkb3dSb290KSB7XG4gICAgICAgICAgY29uc3QgZm91bmQgPSBmaW5kQ29uZmlybUJ1dHRvbihwb3J0YWwuc2hhZG93Um9vdClcbiAgICAgICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgICAgIGNvbmZpcm1CdXR0b24gPSBmb3VuZFxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZm91bmQgPSBmaW5kQ29uZmlybUJ1dHRvbihwb3J0YWwpXG4gICAgICAgICAgaWYgKGZvdW5kKSB7XG4gICAgICAgICAgICBjb25maXJtQnV0dG9uID0gZm91bmRcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoY29uZmlybUJ1dHRvbikgYnJlYWtcblxuICAgICAgY29udGVudExvZ2dlci5sb2coYENvbmZpcm1hdGlvbiBidXR0b24gbm90IGZvdW5kLCByZXRyeWluZy4uLiAoJHthdHRlbXB0cyArIDF9LzMpYClcbiAgICAgIGF3YWl0IHNsZWVwKDEwMDApXG4gICAgfVxuXG4gICAgaWYgKGNvbmZpcm1CdXR0b24pIHtcbiAgICAgIGNvbnRlbnRMb2dnZXIubG9nKCdDbGlja2luZyBjb25maXJtYXRpb24gYnV0dG9uIHRvIGRlbGV0ZSBwb3N0JylcbiAgICAgIGNvbmZpcm1CdXR0b24uY2xpY2soKVxuXG4gICAgICAvLyBXYWl0IGxvbmdlciBmb3IgZGVsZXRpb24gdG8gcHJvY2VzcyBhbmQgY2hlY2sgbXVsdGlwbGUgdGltZXNcbiAgICAgIGxldCBkZWxldGlvbkNvbmZpcm1lZCA9IGZhbHNlXG4gICAgICBmb3IgKGxldCBjaGVjayA9IDA7IGNoZWNrIDwgNTsgY2hlY2srKykge1xuICAgICAgICBhd2FpdCBzbGVlcCgxMDAwKVxuXG4gICAgICAgIC8vIENoZWNrIGlmIHBvc3Qgd2FzIHN1Y2Nlc3NmdWxseSBkZWxldGVkIGJ5IHNlZWluZyBpZiBpdCdzIHN0aWxsIGluIHRoZSBET01cbiAgICAgICAgY29uc3QgcG9zdFN0aWxsRXhpc3RzID0gZG9jdW1lbnQuY29udGFpbnMocG9zdEVsZW1lbnQpXG4gICAgICAgIGlmICghcG9zdFN0aWxsRXhpc3RzKSB7XG4gICAgICAgICAgY29udGVudExvZ2dlci5sb2coJ1Bvc3Qgc3VjY2Vzc2Z1bGx5IGRlbGV0ZWQgLSBlbGVtZW50IG5vIGxvbmdlciBpbiBET00nKVxuICAgICAgICAgIGRlbGV0aW9uQ29uZmlybWVkID0gdHJ1ZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cblxuICAgICAgICAvLyBBbHRlcm5hdGl2ZSBjaGVjayAtIGxvb2sgZm9yIHN1Y2Nlc3MgbWVzc2FnZSBvciBwYWdlIGNoYW5nZVxuICAgICAgICBjb25zdCBzdWNjZXNzTWVzc2FnZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS10ZXN0aWQqPVwic3VjY2Vzc1wiXSwgLnN1Y2Nlc3MtbWVzc2FnZSwgW2NsYXNzKj1cInN1Y2Nlc3NcIl0sIFtyb2xlPVwiYWxlcnRcIl0nKVxuICAgICAgICBmb3IgKGNvbnN0IG1zZyBvZiBzdWNjZXNzTWVzc2FnZXMpIHtcbiAgICAgICAgICBpZiAobXNnLnRleHRDb250ZW50Py50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdkZWxldGUnKSB8fCBtc2cudGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ3JlbW92ZWQnKSkge1xuICAgICAgICAgICAgY29udGVudExvZ2dlci5sb2coJ1Bvc3QgZGVsZXRpb24gc3VjY2VzcyBtZXNzYWdlIGZvdW5kOicsIG1zZy50ZXh0Q29udGVudClcbiAgICAgICAgICAgIGRlbGV0aW9uQ29uZmlybWVkID0gdHJ1ZVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBpZiB3ZSdyZSByZWRpcmVjdGVkIGF3YXkgZnJvbSBwb3N0IHBhZ2VcbiAgICAgICAgaWYgKCF3aW5kb3cubG9jYXRpb24uaHJlZi5pbmNsdWRlcygnL2NvbW1lbnRzLycpICYmICF3aW5kb3cubG9jYXRpb24uaHJlZi5pbmNsdWRlcygnL3IvJykpIHtcbiAgICAgICAgICBjb250ZW50TG9nZ2VyLmxvZygnUmVkaXJlY3RlZCBmcm9tIHBvc3QgcGFnZSAtIGRlbGV0aW9uIGxpa2VseSBzdWNjZXNzZnVsJylcbiAgICAgICAgICBkZWxldGlvbkNvbmZpcm1lZCA9IHRydWVcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRlbGV0aW9uQ29uZmlybWVkKSBicmVha1xuICAgICAgfVxuXG4gICAgICBpZiAoZGVsZXRpb25Db25maXJtZWQpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRlbnRMb2dnZXIubG9nKCdQb3N0IGRlbGV0aW9uIHN0YXR1cyB1bmNsZWFyIGFmdGVyIG11bHRpcGxlIGNoZWNrcycpXG4gICAgICAgIHJldHVybiB0cnVlIC8vIEFzc3VtZSBzdWNjZXNzIGlmIHdlIGNsaWNrZWQgdGhlIGJ1dHRvblxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZW50TG9nZ2VyLmxvZygnQ29uZmlybWF0aW9uIGJ1dHRvbiBub3QgZm91bmQnKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29udGVudExvZ2dlci5lcnJvcignRXJyb3IgaW4gZGVsZXRlUG9zdCBmdW5jdGlvbjonLCBlcnJvcilcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG4vLyBcdTI2QTEgQVVUT0ZMT1cgSEVMUEVSOiBRdWljayBwb3N0IHN0YXR1cyBjaGVjayBmb3IgaW1tZWRpYXRlIGRlY2lzaW9uc1xuYXN5bmMgZnVuY3Rpb24gcXVpY2tHZXRQb3N0U3RhdHVzKHVzZXJuYW1lKSB7XG4gIGNvbnRlbnRMb2dnZXIubG9nKCdcdTI2QTEgUXVpY2sgcG9zdCBzdGF0dXMgY2hlY2sgZm9yIGF1dG9mbG93Li4uJylcblxuICAvLyBMb29rIGZvciBwb3N0cyBkaXJlY3RseSBvbiBjdXJyZW50IHBhZ2VcbiAgY29uc3QgcG9zdHMgPSBxc0FsbCgnc2hyZWRkaXQtcG9zdFtpZF49XCJ0M19cIl0sIFtkYXRhLXRlc3RpZD1cInBvc3QtY29udGFpbmVyXCJdLCAuUG9zdCwgW2RhdGEtdGVzdGlkKj1cInBvc3RcIl0nKVxuXG4gIGlmIChwb3N0cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgaGFzUG9zdDogZmFsc2UsXG4gICAgICBkZWNpc2lvbjogJ2NyZWF0ZScsXG4gICAgICByZWFzb246ICdub19wb3N0cycsXG4gICAgICB1c2VyTmFtZTogdXNlcm5hbWVcbiAgICB9XG4gIH1cblxuICAvLyBHZXQgdGhlIGZpcnN0IChtb3N0IHJlY2VudCkgcG9zdFxuICBjb25zdCBmaXJzdFBvc3QgPSBwb3N0c1swXVxuXG4gIC8vIFF1aWNrIG1vZGVyYXRpb24gY2hlY2tcbiAgY29uc3QgaXNSZW1vdmVkID0gZmlyc3RQb3N0LnRleHRDb250ZW50Py5pbmNsdWRlcygncmVtb3ZlZCBieSB0aGUgbW9kZXJhdG9ycycpIHx8XG4gICAgICAgICAgICAgICAgICAgZmlyc3RQb3N0LnF1ZXJ5U2VsZWN0b3IoJ1tpY29uLW5hbWU9XCJyZW1vdmVcIl0nKSAhPT0gbnVsbFxuXG4gIC8vIFF1aWNrIGVuZ2FnZW1lbnQgY2hlY2tcbiAgY29uc3Qgc2NvcmVFbCA9IGZpcnN0UG9zdC5xdWVyeVNlbGVjdG9yKCdbZGF0YS10ZXN0aWQ9XCJwb3N0LXZvdGUtc2NvcmVcIl0sIGZhY2VwbGF0ZS1udW1iZXInKVxuICBjb25zdCBzY29yZSA9IHBhcnNlSW50KHNjb3JlRWw/LnRleHRDb250ZW50Py50cmltKCkgfHwgJzAnKVxuXG4gIC8vIEdldCBwb3N0IHRpbWVzdGFtcCBmb3IgYWdlIGNoZWNrXG4gIGNvbnN0IHRpbWVFbCA9IGZpcnN0UG9zdC5xdWVyeVNlbGVjdG9yKCd0aW1lJylcbiAgY29uc3QgdGltZXN0YW1wID0gdGltZUVsPy5nZXRBdHRyaWJ1dGUoJ2RhdGV0aW1lJykgfHwgdGltZUVsPy50ZXh0Q29udGVudFxuICBsZXQgYWdlSG91cnMgPSAwXG5cbiAgaWYgKHRpbWVzdGFtcCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwb3N0RGF0ZSA9IG5ldyBEYXRlKHRpbWVzdGFtcClcbiAgICAgIGFnZUhvdXJzID0gKERhdGUubm93KCkgLSBwb3N0RGF0ZS5nZXRUaW1lKCkpIC8gKDEwMDAgKiA2MCAqIDYwKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnRlbnRMb2dnZXIud2FybignQ291bGQgbm90IHBhcnNlIHRpbWVzdGFtcDonLCB0aW1lc3RhbXApXG4gICAgfVxuICB9XG5cbiAgY29udGVudExvZ2dlci5sb2coYFx1MjZBMSBRdWljayBjaGVjazogcmVtb3ZlZD0ke2lzUmVtb3ZlZH0sIHNjb3JlPSR7c2NvcmV9LCBhZ2U9JHthZ2VIb3Vycy50b0ZpeGVkKDEpfWhgKVxuXG4gIC8vIFF1aWNrIGRlY2lzaW9uIGxvZ2ljXG4gIGlmIChpc1JlbW92ZWQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaGFzUG9zdDogdHJ1ZSxcbiAgICAgIGRlY2lzaW9uOiAnY3JlYXRlX3dpdGhfZGVsZXRlJyxcbiAgICAgIHJlYXNvbjogJ3Bvc3RfcmVtb3ZlZCcsXG4gICAgICBsYXN0UG9zdDogeyBpc1JlbW92ZWQsIHNjb3JlLCBhZ2VIb3VycyB9LFxuICAgICAgdXNlck5hbWU6IHVzZXJuYW1lXG4gICAgfVxuICB9XG5cbiAgaWYgKHNjb3JlIDwgMCkge1xuICAgIHJldHVybiB7XG4gICAgICBoYXNQb3N0OiB0cnVlLFxuICAgICAgZGVjaXNpb246ICdjcmVhdGVfd2l0aF9kZWxldGUnLFxuICAgICAgcmVhc29uOiAncG9zdF9kb3dudm90ZWQnLFxuICAgICAgbGFzdFBvc3Q6IHsgaXNSZW1vdmVkLCBzY29yZSwgYWdlSG91cnMgfSxcbiAgICAgIHVzZXJOYW1lOiB1c2VybmFtZVxuICAgIH1cbiAgfVxuXG4gIGlmIChhZ2VIb3VycyA8IDEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaGFzUG9zdDogdHJ1ZSxcbiAgICAgIGRlY2lzaW9uOiAnd2FpdCcsXG4gICAgICByZWFzb246ICdyZWNlbnRfcG9zdCcsXG4gICAgICBsYXN0UG9zdDogeyBpc1JlbW92ZWQsIHNjb3JlLCBhZ2VIb3VycyB9LFxuICAgICAgdXNlck5hbWU6IHVzZXJuYW1lXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBoYXNQb3N0OiB0cnVlLFxuICAgIGRlY2lzaW9uOiAnbm9fY3JlYXRlJyxcbiAgICByZWFzb246ICdwb3N0X2FjdGl2ZScsXG4gICAgbGFzdFBvc3Q6IHsgaXNSZW1vdmVkLCBzY29yZSwgYWdlSG91cnMgfSxcbiAgICB1c2VyTmFtZTogdXNlcm5hbWVcbiAgfVxufVxuXG4vLyBIYW5kbGUgZnJlc2ggcG9zdHMgcmVxdWVzdCBmb3IgYmFja2dyb3VuZCBkZWNpc2lvbiBtYWtpbmdcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldEZyZXNoUG9zdHNGb3JEZWNpc2lvbih1c2VyTmFtZSkge1xuICBjb250ZW50TG9nZ2VyLmxvZygnW0NvbnRlbnQgU2NyaXB0XSBIYW5kbGluZyBHRVRfRlJFU0hfUE9TVFNfRk9SX0RFQ0lTSU9OIGZvcjonLCB1c2VyTmFtZSlcblxuICB0cnkge1xuICAgIC8vIEdldCBmcmVzaCBwb3N0cyBkYXRhIGZyb20gdGhlIGN1cnJlbnQgcGFnZVxuICAgIGNvbnN0IHBvc3RzSW5mbyA9IGF3YWl0IGNoZWNrVXNlclBvc3RzKClcblxuICAgIC8vIENyZWF0ZSBzZXJpYWxpemFibGUgdmVyc2lvbiBvZiBwb3N0c0luZm8gd2l0aG91dCBET00gZWxlbWVudHNcbiAgICBjb25zdCBzZXJpYWxpemFibGVQb3N0c0luZm8gPSB7XG4gICAgICB0b3RhbDogcG9zdHNJbmZvLnRvdGFsLFxuICAgICAgbGFzdFBvc3REYXRlOiBwb3N0c0luZm8ubGFzdFBvc3REYXRlLFxuICAgICAgcG9zdHM6IHBvc3RzSW5mby5wb3N0cy5tYXAocG9zdCA9PiB7XG4gICAgICAgIC8vIENyZWF0ZSBhIGNsZWFuIHNlcmlhbGl6YWJsZSBwb3N0IG9iamVjdCB3aXRob3V0IERPTSBlbGVtZW50c1xuICAgICAgICBjb25zdCB7IF9kb21FbGVtZW50LCAuLi5zZXJpYWxpemFibGVQb3N0IH0gPSBwb3N0XG4gICAgICAgIHJldHVybiBzZXJpYWxpemFibGVQb3N0IC8vIGVsZW1lbnQgaXMgYWxyZWFkeSBzZXJpYWxpemFibGUge2lkLCB0YWdOYW1lfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBOb3JtYWxpemUgdGhlIGRhdGEgd2l0aCB1c2VyTmFtZSBmb3IgdGhlIGJhY2tncm91bmQgc2NyaXB0XG4gICAgY29uc3QgZnJlc2hEYXRhID0ge1xuICAgICAgdXNlck5hbWU6IHVzZXJOYW1lLFxuICAgICAgcG9zdHNJbmZvOiBzZXJpYWxpemFibGVQb3N0c0luZm8sXG4gICAgICBsYXN0VXBkYXRlZDogRGF0ZS5ub3coKSxcbiAgICAgIGRhdGFGcmVzaDogdHJ1ZSAvLyBGbGFnIHRvIGluZGljYXRlIHRoaXMgaXMgZnJlc2ggZGF0YVxuICAgIH1cblxuICAgIGNvbnRlbnRMb2dnZXIubG9nKCdbQ29udGVudCBTY3JpcHRdIFNlbmRpbmcgZnJlc2ggcG9zdHMgZGF0YSB0byBiYWNrZ3JvdW5kOicsIGZyZXNoRGF0YSlcblxuICAgIC8vIEFsc28gc2F2ZSB0aGlzIGZyZXNoIGRhdGEgdG8gbGF0ZXN0UG9zdHNEYXRhIGZvciBjb25zaXN0ZW5jeVxuICAgIGNvbnN0IHN0b3JhZ2VEYXRhID0ge1xuICAgICAgdXNlck5hbWU6IHVzZXJOYW1lLFxuICAgICAgcG9zdHNJbmZvOiBzZXJpYWxpemFibGVQb3N0c0luZm8sXG4gICAgICBsYXN0VXBkYXRlZDogRGF0ZS5ub3coKVxuICAgIH1cblxuICAgIGNvbnRlbnRMb2dnZXIubG9nKCdbQ29udGVudCBTY3JpcHRdIEFib3V0IHRvIHNhdmUgc3RvcmFnZURhdGE6Jywgc3RvcmFnZURhdGEpXG4gICAgY29udGVudExvZ2dlci5sb2coJ1tDb250ZW50IFNjcmlwdF0gcG9zdHNJbmZvIHN0cnVjdHVyZTonLCBwb3N0c0luZm8pXG4gICAgY29udGVudExvZ2dlci5sb2coJ1tDb250ZW50IFNjcmlwdF0gcG9zdHNJbmZvLnBvc3RzIGxlbmd0aDonLCBwb3N0c0luZm8/LnBvc3RzPy5sZW5ndGgpXG5cbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyAnbGF0ZXN0UG9zdHNEYXRhJzogc3RvcmFnZURhdGEgfSwgKCkgPT4ge1xuICAgICAgY29udGVudExvZ2dlci5sb2coJ0ZyZXNoIHBvc3RzIGRhdGEgc2F2ZWQgdG8gbG9jYWwgc3RvcmFnZSBkdXJpbmcgZGVjaXNpb24tbWFraW5nJywgc3RvcmFnZURhdGEpXG4gICAgfSlcblxuICAgIC8vIFNlbmQgdGhlIGZyZXNoIGRhdGEgYmFjayB0byBiYWNrZ3JvdW5kIHNjcmlwdFxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgIHR5cGU6ICdGUkVTSF9QT1NUU19DT0xMRUNURUQnLFxuICAgICAgZGF0YTogZnJlc2hEYXRhXG4gICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIGNvbnRlbnRMb2dnZXIud2FybignW0NvbnRlbnQgU2NyaXB0XSBGYWlsZWQgdG8gc2VuZCBmcmVzaCBwb3N0cyBkYXRhOicsIGVycilcbiAgICB9KVxuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29udGVudExvZ2dlci5lcnJvcignW0NvbnRlbnQgU2NyaXB0XSBFcnJvciBnZXR0aW5nIGZyZXNoIHBvc3RzIGZvciBkZWNpc2lvbjonLCBlcnJvcilcblxuICAgIC8vIFNlbmQgZXJyb3IgcmVzcG9uc2VcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICB0eXBlOiAnRlJFU0hfUE9TVFNfQ09MTEVDVEVEJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdXNlck5hbWU6IHVzZXJOYW1lLFxuICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgZGF0YUZyZXNoOiBmYWxzZVxuICAgICAgfVxuICAgIH0pLmNhdGNoKCgpID0+IHt9KVxuICB9XG59XG5cbi8vIEV4cG9ydCBmb3IgZ2xvYmFsIGFjY2Vzc1xud2luZG93LnF1aWNrR2V0UG9zdFN0YXR1cyA9IHF1aWNrR2V0UG9zdFN0YXR1c1xuY29udGVudExvZ2dlci5sb2coJ1x1MjZBMSBRdWljayBzdGF0dXMgZnVuY3Rpb24gYXZhaWxhYmxlOiBxdWlja0dldFBvc3RTdGF0dXModXNlcm5hbWUpJylcblxuLy8gRXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZm9yIFF1YXNhciBicmlkZ2UgY29tcGF0aWJpbGl0eVxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKGJyaWRnZSkge1xuICAvLyBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBieSBRdWFzYXIncyBCRVggYnJpZGdlIHN5c3RlbVxuICBjb250ZW50TG9nZ2VyLmxvZygnQ29udGVudCBzY3JpcHQgYnJpZGdlIGluaXRpYWxpemVkJywgYnJpZGdlKVxufVxuIiwgIi8qIGVzbGludC1kaXNhYmxlICovXG4vKipcbiAqIFRISVMgRklMRSBJUyBHRU5FUkFURUQgQVVUT01BVElDQUxMWS5cbiAqIERPIE5PVCBFRElULlxuICpcbiAqIFlvdSBhcmUgcHJvYmFibHkgbG9va2luZyBpbnRvIGFkZGluZyBob29rcyBpbiB5b3VyIGNvZGUuIFRoaXMgc2hvdWxkIGJlIGRvbmUgYnkgbWVhbnMgb2ZcbiAqIHNyYy1iZXgvanMvY29udGVudC1ob29rcy5qcyB3aGljaCBoYXMgYWNjZXNzIHRvIHRoZSBicm93c2VyIGluc3RhbmNlIGFuZCBjb21tdW5pY2F0aW9uIGJyaWRnZVxuICoqL1xuXG4vKiBnbG9iYWwgY2hyb21lICovXG5cbmltcG9ydCBCcmlkZ2UgZnJvbSAnLi9icmlkZ2UnXG5pbXBvcnQgeyBsaXN0ZW5Gb3JXaW5kb3dFdmVudHMgfSBmcm9tICcuL3dpbmRvdy1ldmVudC1saXN0ZW5lcidcbmltcG9ydCBydW5EZXZsYW5kQ29udGVudFNjcmlwdCBmcm9tICcuLi8uLi9zcmMtYmV4L215LWNvbnRlbnQtc2NyaXB0J1xuXG5jb25zdCBwb3J0ID0gY2hyb21lLnJ1bnRpbWUuY29ubmVjdCh7XG4gIG5hbWU6ICdjb250ZW50U2NyaXB0J1xufSlcblxubGV0IGRpc2Nvbm5lY3RlZCA9IGZhbHNlXG5wb3J0Lm9uRGlzY29ubmVjdC5hZGRMaXN0ZW5lcigoKSA9PiB7XG4gIGRpc2Nvbm5lY3RlZCA9IHRydWVcbn0pXG5cbmxldCBicmlkZ2UgPSBuZXcgQnJpZGdlKHtcbiAgbGlzdGVuIChmbikge1xuICAgIHBvcnQub25NZXNzYWdlLmFkZExpc3RlbmVyKGZuKVxuICB9LFxuICBzZW5kIChkYXRhKSB7XG4gICAgaWYgKCFkaXNjb25uZWN0ZWQpIHtcbiAgICAgIHBvcnQucG9zdE1lc3NhZ2UoZGF0YSlcbiAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgIC4uLmRhdGEsXG4gICAgICAgIGZyb206ICdiZXgtY29udGVudC1zY3JpcHQnXG4gICAgICB9LCAnKicpXG4gICAgfVxuICB9XG59KVxuXG4vLyBJbmplY3Qgb3VyIGRvbSBzY3JpcHQgZm9yIGNvbW11bmljYXRpb25zLlxuZnVuY3Rpb24gaW5qZWN0U2NyaXB0ICh1cmwpIHtcbiAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcbiAgc2NyaXB0LnNyYyA9IHVybFxuICBzY3JpcHQub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucmVtb3ZlKClcbiAgfVxuICA7KGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KS5hcHBlbmRDaGlsZChzY3JpcHQpXG59XG5cbmlmIChkb2N1bWVudCBpbnN0YW5jZW9mIEhUTUxEb2N1bWVudCkge1xuICBpbmplY3RTY3JpcHQoY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdkb20uanMnKSlcbn1cblxuLy8gTGlzdGVuIGZvciBldmVudCBmcm9tIHRoZSB3ZWIgcGFnZVxubGlzdGVuRm9yV2luZG93RXZlbnRzKGJyaWRnZSwgJ2JleC1kb20nKVxuXG5ydW5EZXZsYW5kQ29udGVudFNjcmlwdChicmlkZ2UpXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUF1QkEsVUFBSSxJQUFJLE9B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QUNSLEdBQUcsR0FBRztBQUFBLE1BQ1I7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDO0FBR0QsV0FBUyxhQUFjLEtBQUs7QUFDMUIsVUFBTSxTQUFTLFNBQVMsY0FBYyxRQUFRO0FBQzlDLFdBQU8sTUFBTTtBQUNiLFdBQU8sU0FBUyxXQUFZO0FBQzFCLFdBQUssT0FBTztBQUFBLElBQ2Q7QUFDQyxLQUFDLFNBQVMsUUFBUSxTQUFTLGlCQUFpQixZQUFZLE1BQU07QUFBQSxFQUNqRTtBQUVBLE1BQUksb0JBQW9CLGNBQWM7QUFDcEMsaUJBQWEsT0FBTyxRQUFRLE9BQU8sUUFBUSxDQUFDO0FBQUEsRUFDOUM7QUFHQSx3QkFBc0IsUUFBUSxTQUFTO0FBRXZDLDRCQUF3QixNQUFNOyIsCiAgIm5hbWVzIjogWyJSZWZsZWN0QXBwbHkiLCAiUmVmbGVjdE93bktleXMiLCAiTnVtYmVySXNOYU4iLCAiRXZlbnRFbWl0dGVyIiwgIm9uY2UiLCAibWVzc2FnZSIsICJicmlkZ2UiLCAibWVzc2FnZSIsICJwb3N0Q29udGFpbmVyIiwgIm1lc3NhZ2UiLCAiYnJpZGdlIl0KfQo=
