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

  // src-bex/stats-content-script.js
  function qs(selector) {
    return document.querySelector(selector);
  }
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function getStoredUsername() {
    try {
      const result = await chrome.storage.sync.get(["redditUser"]);
      return result.redditUser || null;
    } catch (error) {
      statsLogger.warn("Failed to get stored username:", error);
      return null;
    }
  }
  async function storeRedditProfileData(username, postsData) {
    try {
      statsLogger.log(` Storing profile data for ${username} with ${postsData.length} posts`);
      if (postsData.length > 0) {
        statsLogger.log(" Sample post data being stored:", {
          title: postsData[0].title,
          author: postsData[0].author,
          subreddit: postsData[0].subreddit,
          score: postsData[0].score,
          commentCount: postsData[0].commentCount,
          itemState: postsData[0].itemState
        });
      }
      const storageData = {
        username,
        posts: postsData,
        timestamp: Date.now(),
        totalPosts: postsData.length
      };
      await chrome.storage.local.set({
        latestPostsData: storageData
      });
      const derivedUserStatus = {
        userName: username,
        currentUser: username,
        storedUser: username,
        isMatch: true,
        lastCheck: Date.now(),
        totalPosts: postsData.length,
        postsCount: postsData.length,
        lastPostText: postsData.length > 0 ? postsData[0].title || "Recent post" : "No posts",
        lastPostDate: postsData.length > 0 ? postsData[0].timestamp || Date.now() : null,
        currentUrl: window.location.href,
        timestamp: Date.now(),
        collectingPostsData: false,
        dataFresh: true,
        lastPostScore: postsData.length > 0 ? postsData[0].score || 0 : 0,
        lastPostComments: postsData.length > 0 ? postsData[0].commentCount || 0 : 0,
        lastPostSubreddit: postsData.length > 0 ? postsData[0].subreddit || "unknown" : "unknown",
        lastPostAuthor: postsData.length > 0 ? postsData[0].author || "unknown" : "unknown"
      };
      await chrome.storage.local.set({ userStatus: derivedUserStatus });
      await chrome.storage.sync.set({ userStatus: derivedUserStatus });
      statsLogger.log(` Stored profile data for ${username}: ${postsData.length} posts`);
      statsLogger.log(` Updated derived userStatus with enhanced metadata`);
      statsLogger.log(" latestPostsData structure:", storageData);
      statsLogger.log(" derived userStatus structure:", derivedUserStatus);
      chrome.runtime.sendMessage({
        type: "POSTS_DATA_UPDATED",
        data: {
          username,
          postsCount: postsData.length,
          lastPost: postsData.length > 0 ? postsData[0] : null
        }
      });
    } catch (error) {
      statsLogger.error(" Failed to store profile data:", error);
    }
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
        statsLogger.log(`Stats: Initialized cache from storage: ${cachedUsername}`);
      }
    } catch (error) {
      statsLogger.warn("Stats: Failed to initialize username cache:", error);
    }
  }
  function getAuthenticatedUsername() {
    if (cachedUsername && Date.now() - cacheTimestamp < CACHE_DURATION) {
      statsLogger.log(`Stats: Using cached authenticated username: ${cachedUsername}`);
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
    const dropdownButton = qs('button[aria-label*="user"], [data-testid="user-avatar"], #expand-user-drawer-button') || qs('button[aria-label*="u/"]') || qs('[data-testid="user-dropdown-button"]');
    if (dropdownButton) {
      const ariaLabel = dropdownButton.getAttribute("aria-label");
      if (ariaLabel) {
        const labelMatch = ariaLabel.match(/u\/([^\s]+)/);
        if (labelMatch) {
          const username = `u/${labelMatch[1]}`;
          cachedUsername = username;
          cacheTimestamp = Date.now();
          return username;
        }
      }
      const buttonText = dropdownButton.textContent?.trim();
      if (buttonText && buttonText.startsWith("u/")) {
        cachedUsername = buttonText;
        cacheTimestamp = Date.now();
        return buttonText;
      }
    }
    return null;
  }
  function extractUsernameFromPage() {
    statsLogger.log("Stats: Extracting username from current page with authenticated priority...");
    const authUsername = getAuthenticatedUsername();
    if (authUsername) {
      statsLogger.log(`Stats: Found authenticated username: ${authUsername}`);
      return authUsername.replace("u/", "");
    }
    const urlMatch = window.location.href.match(/reddit\.com\/u\/([^\/]+)/) || window.location.href.match(/reddit\.com\/user\/([^\/]+)/);
    if (urlMatch && urlMatch[1] !== "adobe") {
      statsLogger.log("Stats: Found username in URL:", urlMatch[1]);
      return urlMatch[1];
    }
    const usernameElement = qs('[data-testid="username"], .username, [href*="/u/"]');
    if (usernameElement) {
      const username = usernameElement.textContent?.trim() || usernameElement.href?.match(/\/u\/([^\/]+)/)?.[1];
      if (username && username.startsWith("u/")) {
        const cleanUsername = username.replace("u/", "");
        if (cleanUsername !== "adobe" && cleanUsername.length > 2 && !cleanUsername.match(/^[a-z]+$/)) {
          statsLogger.log("Stats: Found username in element fallback:", cleanUsername);
          return cleanUsername;
        }
      }
    }
    statsLogger.log("Stats: No authenticated username found, returning null to avoid wrong user detection");
    return null;
  }
  async function navigateToUserPosts(username) {
    statsLogger.log("Navigating to user posts page for:", username);
    const postsUrl = `https://www.reddit.com/u/${username}/submitted/`;
    sessionStorage.setItem("reddit-post-machine-script-stage", "profile-switching-to-posts");
    sessionStorage.setItem("reddit-post-machine-script-stage-timestamp", Date.now().toString());
    window.location.href = postsUrl;
    await waitForCondition(() => window.location.href === postsUrl, 5e3);
  }
  async function waitForCondition(condition, timeout = 5e3) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (condition()) {
        return true;
      }
      await sleep(100);
    }
    return false;
  }
  function extractPostDataFromShredditPosts(shredditPosts) {
    statsLogger.log(`\u{1F50D} Extracting enhanced data from ${shredditPosts.length} shreddit-post elements...`);
    const posts = [];
    shredditPosts.forEach((post, index) => {
      try {
        statsLogger.log(`
--- Processing post ${index + 1}: ${post.id} ---`);
        let searchRoot = post;
        if (post.shadowRoot) {
          statsLogger.log(`\u{1F311} Post ${post.id} has shadow root`);
          searchRoot = post.shadowRoot;
        } else {
          statsLogger.log(`\u{1F4C4} Post ${post.id} uses normal DOM`);
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
        let titleElement = searchRoot.querySelector('a[slot="title"]') || searchRoot.querySelector('a[id*="post-title"]') || searchRoot.querySelector('[data-testid="post-title"]') || searchRoot.querySelector("h3") || searchRoot.querySelector('a[href*="/comments/"]:not([name="comments-action-button"])');
        if (!titleElement) {
          titleElement = post.querySelector('a[slot="title"]') || post.querySelector('a[id*="post-title"]') || post.querySelector('[data-testid="post-title"]') || post.querySelector("h3") || post.querySelector('a[href*="/comments/"]:not([name="comments-action-button"])');
        }
        if (!titleElement && post.id) {
          titleElement = document.querySelector(`a[id="post-title-${post.id}"]`) || document.querySelector(`#${post.id} a[slot="title"]`) || document.querySelector(`#${post.id} [data-testid="post-title"]`);
        }
        if (!titleElement && post.id) {
          titleElement = searchRoot.querySelector(`a[id*="post-title-${post.id}"]`) || post.querySelector(`a[id*="post-title-${post.id}"]`);
        }
        statsLogger.log(`\u{1F50D} Title element for ${post.id}:`, titleElement);
        if (titleElement) {
          statsLogger.log(`\u{1F50D} Title element tag:`, titleElement.tagName);
          statsLogger.log(`\u{1F50D} Title element classes:`, titleElement.className);
          statsLogger.log(`\u{1F50D} Title element ID:`, titleElement.id);
        }
        if (!titleElement) {
          const allLinks = post.querySelectorAll("a");
          for (const link of allLinks) {
            if (link.textContent?.trim().length > 5) {
              titleElement = link;
              statsLogger.log(`\u{1F517} Found title in fallback link: ${link.textContent?.trim().substring(0, 30)}...`);
              break;
            }
          }
        }
        let score = postAttributes.score || "0";
        if (!postAttributes.score) {
          const scoreElement = searchRoot.querySelector("faceplate-number") || searchRoot.querySelector('[data-testid="post-vote-score"]') || searchRoot.querySelector(".score") || searchRoot.querySelector('[slot="vote-score"]') || post.querySelector("faceplate-number") || post.querySelector('[data-testid="post-vote-score"]') || post.querySelector(".score");
          score = scoreElement?.textContent?.trim() || "0";
        }
        let comments = postAttributes.commentCount || "0";
        if (!postAttributes.commentCount) {
          const commentsElement = searchRoot.querySelector('a[href*="/comments/"] span') || searchRoot.querySelector('[data-testid="comment-count"]') || searchRoot.querySelector('[slot="comment-count"]') || post.querySelector('a[href*="/comments/"] span') || post.querySelector('[data-testid="comment-count"]');
          comments = commentsElement?.textContent?.trim() || "0";
        }
        const postUrl = postAttributes.permalink || (searchRoot.querySelector('a[href*="/comments/"]') || searchRoot.querySelector('a[slot="full-post-link"]') || post.querySelector('a[href*="/comments/"]') || post.querySelector('a[slot="full-post-link"]'))?.href || "";
        const title = postAttributes.postTitle || titleElement?.textContent?.trim() || "No title";
        const timestamp = postAttributes.createdTimestamp || (searchRoot.querySelector("time")?.getAttribute("datetime") || post.querySelector("time")?.getAttribute("datetime") || new Date().toISOString());
        const postData = {
          elementId: post.id || postAttributes.postId || "",
          element: {
            id: post.id || postAttributes.postId || "",
            tagName: post.tagName || "shreddit-post"
          },
          id: post.id || postAttributes.postId || "",
          title,
          url: postUrl,
          timestamp,
          author: postAttributes.author || "",
          subreddit: postAttributes.subredditPrefixedName || "",
          authorId: postAttributes.authorId || "",
          subredditId: postAttributes.subredditId || "",
          score: parseInt(score) || 0,
          commentCount: parseInt(comments) || 0,
          awardCount: parseInt(postAttributes.awardCount) || 0,
          postType: postAttributes.postType || "",
          domain: postAttributes.domain || "",
          contentHref: postAttributes.contentHref || "",
          itemState: postAttributes.itemState || "",
          viewContext: postAttributes.viewContext || "",
          voteType: postAttributes.voteType || "",
          moderationStatus: {
            isRemoved: post.textContent?.includes("removed by the moderators") || post.querySelector('[icon-name="remove"]') !== null || postAttributes.itemState === "moderator_removed" || false,
            isLocked: post.querySelector('[icon-name="lock-fill"]') !== null || postAttributes.itemState === "locked" || false,
            isDeleted: post.textContent?.includes("deleted by the user") || post.querySelector('[icon-name="delete"]') !== null || postAttributes.itemState === "deleted" || false,
            isSpam: postAttributes.itemState === "spam" || false,
            itemState: postAttributes.itemState || "",
            viewContext: postAttributes.viewContext || "",
            voteType: postAttributes.voteType || ""
          },
          userId: postAttributes.userId || "",
          permalink: postAttributes.permalink || "",
          createdTimestamp: postAttributes.createdTimestamp || timestamp
        };
        statsLogger.log(`\u{1F4CA} Enhanced post data extracted:`, {
          id: postData.id,
          title: postData.title,
          author: postData.author,
          subreddit: postData.subreddit,
          score: postData.score,
          commentCount: postData.commentCount,
          postType: postData.postType,
          itemState: postData.itemState,
          moderationStatus: postData.moderationStatus,
          element: postData.element ? "DOM element present" : "No element"
        });
        posts.push(postData);
      } catch (error) {
        statsLogger.error(`\u274C Error processing post ${index + 1}:`, error);
      }
    });
    statsLogger.log(`
\u2705 Successfully extracted enhanced data from ${posts.length} posts`);
    return posts;
  }
  async function navigateToUserProfile(userName) {
    statsLogger.log("Navigating to user profile...");
    const cleanUsername = userName.replace("u/", "");
    const targetUrl = `https://www.reddit.com/user/${cleanUsername}`;
    if (window.location.href.split("?")[0] === targetUrl || window.location.href.split("?")[0] === targetUrl + "/") {
      statsLogger.log("Already on user profile page");
      return true;
    }
    window.location.href = targetUrl;
    await new Promise((resolve) => setTimeout(resolve, 3e3));
    return true;
  }
  async function navigateToPostsTab() {
    statsLogger.log("Navigating to Posts tab...");
    if (window.location.pathname.endsWith("/submitted") || window.location.pathname.endsWith("/submitted/")) {
      statsLogger.log("Already on submitted/posts page");
      return true;
    }
    const postsTabSelectors = [
      'a[href*="/submitted/"]',
      "#profile-tab-posts_tab",
      'faceplate-tracker[noun="posts_tab"] a',
      '[data-testid*="posts"]'
    ];
    for (const selector of postsTabSelectors) {
      const postsTab = document.querySelector(selector);
      if (postsTab && postsTab.textContent?.toLowerCase().includes("posts")) {
        statsLogger.log("Found Posts tab, clicking...");
        postsTab.click();
        await new Promise((resolve) => setTimeout(resolve, 2e3));
        return true;
      }
    }
    return false;
  }
  window.triggerProfileDataCollection = async function() {
    statsLogger.log("\u{1F527} MANUAL TRIGGER: Starting profile data collection...");
    try {
      const username = extractUsernameFromPage();
      if (!username) {
        statsLogger.log("\u274C No username found on current page");
        return { success: false, error: "No username found" };
      }
      statsLogger.log(`\u{1F527} MANUAL TRIGGER: Found username: ${username}`);
      const postsData = await capturePostsData();
      statsLogger.log(`\u{1F527} MANUAL TRIGGER: Captured ${postsData.length} posts`);
      if (postsData.length > 0) {
        await storeRedditProfileData(username, postsData);
        statsLogger.log("\u{1F527} MANUAL TRIGGER: Data stored successfully");
        return {
          success: true,
          username,
          postsCount: postsData.length,
          samplePost: postsData[0]
        };
      } else {
        statsLogger.log("\u274C MANUAL TRIGGER: No posts found");
        return { success: false, error: "No posts found" };
      }
    } catch (error) {
      statsLogger.error("\u274C MANUAL TRIGGER: Error:", error);
      return { success: false, error: error.message };
    }
  };
  statsLogger.log("\u{1F527} Manual trigger available: window.triggerProfileDataCollection()");
  async function quickCollectPostData(options = {}) {
    const {
      maxPosts = 3,
      timeout = 5e3,
      includeModeration = true,
      includeEngagement = true
    } = options;
    statsLogger.log(`\u26A1 Quick collecting ${maxPosts} posts with ${timeout}ms timeout`);
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const shredditApp = document.querySelector("shreddit-app");
      if (!shredditApp) {
        await sleep(200);
        continue;
      }
      const shredditPosts = Array.from(shredditApp.querySelectorAll('shreddit-post[id^="t3_"]')).slice(0, maxPosts);
      if (shredditPosts.length > 0) {
        statsLogger.log(`\u26A1 Found ${shredditPosts.length} posts, extracting...`);
        const posts = shredditPosts.map((post) => {
          const attrs = {
            id: post.id || "",
            title: post.getAttribute("post-title") || "",
            author: post.getAttribute("author") || "",
            subreddit: post.getAttribute("subreddit-prefixed-name") || "",
            score: parseInt(post.getAttribute("score") || "0"),
            commentCount: parseInt(post.getAttribute("comment-count") || "0"),
            timestamp: post.getAttribute("created-timestamp") || new Date().toISOString(),
            itemState: post.getAttribute("item-state") || "",
            postType: post.getAttribute("post-type") || "",
            permalink: post.getAttribute("permalink") || "",
            url: post.getAttribute("content-href") || post.getAttribute("permalink") || ""
          };
          if (includeModeration) {
            attrs.moderationStatus = {
              isRemoved: post.textContent?.includes("removed by the moderators") || post.querySelector('[icon-name="remove"]') !== null,
              isLocked: post.querySelector('[icon-name="lock-fill"]') !== null,
              itemState: attrs.itemState
            };
            attrs.isRemoved = attrs.moderationStatus.isRemoved;
            attrs.isBlocked = attrs.moderationStatus.isRemoved;
          }
          return attrs;
        });
        statsLogger.log(`\u26A1 Quick collection complete: ${posts.length} posts`);
        return posts;
      }
      await sleep(200);
    }
    statsLogger.log("\u26A1 Quick collection timeout - no posts found");
    return [];
  }
  async function getPostsDataForAutoflowDecision(username) {
    statsLogger.log("\u{1F3AF} Collecting fresh posts data for autoflow decision...");
    try {
      if (!window.location.href.includes("/submitted")) {
        statsLogger.log("\u26A0\uFE0F Not on submitted page, navigating...");
        await navigateToUserProfile(username);
        await navigateToPostsTab();
        await new Promise((resolve) => setTimeout(resolve, 2e3));
      }
      statsLogger.log("\u{1F3AF} Using full DOM analysis method for reliable data collection...");
      const posts = await capturePostsData();
      statsLogger.log(`\u{1F3AF} Full DOM analysis collected ${posts.length} fresh posts for autoflow decision`);
      if (posts.length === 0) {
        return {
          postsInfo: { posts: [], total: 0, lastPost: null },
          lastPost: null,
          totalPosts: 0,
          userName: username,
          timestamp: new Date().toISOString(),
          dataFresh: true
        };
      }
      const lastPost = posts[0];
      return {
        postsInfo: {
          posts,
          total: posts.length,
          lastPost
        },
        lastPost,
        totalPosts: posts.length,
        userName: username,
        timestamp: new Date().toISOString(),
        dataFresh: true
      };
    } catch (error) {
      statsLogger.error("\u274C Error collecting fresh posts data for autoflow:", error);
      statsLogger.log("\u{1F527} Fallback: Attempting quick collection as last resort...");
      const posts = await quickCollectPostData({
        maxPosts: 5,
        timeout: 3e3,
        includeModeration: true,
        includeEngagement: true
      });
      statsLogger.log(`\u{1F527} Fallback collected ${posts.length} posts`);
      return {
        postsInfo: { posts, total: posts.length, lastPost: posts[0] || null },
        lastPost: posts[0] || null,
        totalPosts: posts.length,
        userName: username,
        timestamp: new Date().toISOString(),
        dataFresh: false,
        error: error.message
      };
    }
  }
  window.quickCollectPostData = quickCollectPostData;
  window.getPostsDataForAutoflowDecision = getPostsDataForAutoflowDecision;
  statsLogger.log("\u26A1 Autoflow function available: getPostsDataForAutoflowDecision(username)");
  async function capturePostsData() {
    statsLogger.log("Capturing posts data from current page...");
    const posts = [];
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
      statsLogger.log("=== SEARCHING SHREDDIT-APP FOR POSTS ===");
      const shredditApp = document.querySelector("shreddit-app");
      if (!shredditApp) {
        statsLogger.log("\u274C shreddit-app not found");
      } else {
        statsLogger.log("\u2705 Found shreddit-app");
        const shredditPosts = Array.from(shredditApp.querySelectorAll('shreddit-post[id^="t3_"]'));
        statsLogger.log(`\u{1F3AF} Found ${shredditPosts.length} shreddit-post elements with IDs`);
        if (shredditPosts.length > 0) {
          statsLogger.log("\u{1F50D} Using enhanced post data extraction...");
          const extractedPosts = extractPostDataFromShredditPosts(shredditPosts);
          statsLogger.log(`\u2705 Enhanced extraction captured ${extractedPosts.length} posts with metadata`);
          if (extractedPosts.length > 0) {
            statsLogger.log("\u{1F4CA} Sample enhanced post data:", {
              id: extractedPosts[0].id,
              title: extractedPosts[0].title,
              author: extractedPosts[0].author,
              subreddit: extractedPosts[0].subreddit,
              score: extractedPosts[0].score,
              commentCount: extractedPosts[0].commentCount,
              itemState: extractedPosts[0].itemState
            });
          }
          posts.push(...extractedPosts);
          statsLogger.log(`\u2705 Successfully captured ${posts.length} posts with enhanced metadata`);
          return posts;
        }
      }
      statsLogger.log(`No posts found, attempt ${attempts + 1}/${maxAttempts}`);
      await sleep(1e3);
      attempts++;
    }
    statsLogger.log("Failed to find posts after maximum attempts");
    return [];
  }
  async function runProfileDetectionScript() {
    statsLogger.log("=== PROFILE DETECTION SCRIPT STARTED ===");
    try {
      const username = extractUsernameFromPage();
      if (!username) {
        statsLogger.log("No username found, cannot proceed with profile detection");
        return;
      }
      statsLogger.log("Detected username:", username);
      const storedUser = await getStoredUsername();
      if (!storedUser || !storedUser.seren_name) {
        await chrome.storage.sync.set({
          redditUser: {
            seren_name: username,
            lastCheck: Date.now()
          }
        });
      }
      await navigateToUserPosts(username);
    } catch (error) {
      statsLogger.error("Profile detection script error:", error);
      sessionStorage.removeItem("reddit-post-machine-script-stage");
    }
  }
  async function continueProfileDataCollection() {
    statsLogger.log("=== CONTINUING PROFILE DATA COLLECTION ===");
    try {
      const username = extractUsernameFromPage();
      if (!username) {
        statsLogger.log("No username found on posts page");
        sessionStorage.removeItem("reddit-post-machine-script-stage");
        return;
      }
      statsLogger.log("Collecting posts data for:", username);
      const postsData = await capturePostsData();
      if (postsData.length > 0) {
        await storeRedditProfileData(username, postsData);
        statsLogger.log("Profile data collection completed successfully");
        const freshStatus = {
          userName: username,
          currentUser: username,
          storedUser: username,
          isMatch: true,
          lastCheck: Date.now(),
          totalPosts: postsData.length,
          postsCount: postsData.length,
          lastPostText: postsData.length > 0 ? postsData[0].title || "Recent post" : "No posts",
          lastPostDate: postsData.length > 0 ? postsData[0].timestamp || Date.now() : null,
          currentUrl: window.location.href,
          timestamp: Date.now(),
          collectingPostsData: false,
          dataFresh: true
        };
        chrome.storage.local.set({
          userStatus: freshStatus
        }).then(() => {
          statsLogger.log("User status updated with fresh posts data");
          chrome.runtime.sendMessage({
            type: "ACTION_COMPLETED",
            action: "GET_POSTS",
            success: true,
            data: {
              total: postsData.length,
              lastPostDate: postsData.length > 0 ? postsData[0].timestamp || Date.now() : null,
              posts: postsData,
              lastPost: postsData.length > 0 ? postsData[0] : null
            }
          }).catch((err) => {
            statsLogger.warn("Failed to trigger auto-flow decision analysis:", err);
          });
        }).catch((error) => {
          statsLogger.error("Failed to update user status:", error);
        });
      } else {
        statsLogger.log("No posts data found to store");
        const noDataStatus = {
          currentUser: username,
          storedUser: username,
          isMatch: true,
          lastCheck: Date.now(),
          postsCount: 0,
          currentUrl: window.location.href,
          timestamp: Date.now(),
          collectingPostsData: false,
          dataFresh: true,
          postsDataError: "No posts found on user page"
        };
        chrome.storage.local.set({
          userStatus: noDataStatus
        }).catch(() => {
        });
      }
      sessionStorage.removeItem("reddit-post-machine-script-stage");
      statsLogger.log("=== PROFILE DETECTION SCRIPT COMPLETED ===");
    } catch (error) {
      statsLogger.error("Continue profile data collection error:", error);
      sessionStorage.removeItem("reddit-post-machine-script-stage");
      chrome.storage.local.set({
        userStatus: {
          error: error.message,
          timestamp: Date.now(),
          collectingPostsData: false,
          dataFresh: false
        }
      }).catch(() => {
      });
    }
  }
  async function handleManualScriptTrigger(scriptType, mode) {
    statsLogger.log(`=== MANUAL TRIGGER: ${scriptType} (mode: ${mode}) ===`);
    try {
      if (scriptType === "profile") {
        sessionStorage.removeItem("reddit-post-machine-script-stage");
        statsLogger.log("Manually triggering profile detection script");
        await runProfileDetectionScript();
      } else {
        statsLogger.log(`Manual trigger for ${scriptType} not handled by stats script`);
      }
    } catch (error) {
      statsLogger.error("Manual script trigger error:", error);
    }
  }
  async function handleUserNotFoundNavigation() {
    statsLogger.log("Username not found, attempting automatic navigation to user profile...");
    try {
      const dropdownButton = qs('button[aria-label*="user"], [data-testid="user-avatar"], #expand-user-drawer-button') || qs('button[aria-label*="u/"]') || qs('[data-testid="user-dropdown-button"]');
      if (!dropdownButton) {
        statsLogger.log("User dropdown button not found");
        return false;
      }
      statsLogger.log("Found user dropdown button, clicking to open menu");
      dropdownButton.click();
      await sleep(1e3);
      const viewProfileLink = qs('a[href*="/u/"], a[href*="/user/"]') || qs('[role="menuitem"] a') || qs('.dropdown-menu a[href*="/"]');
      if (!viewProfileLink) {
        statsLogger.log("View Profile link not found in dropdown");
        document.body.click();
        return false;
      }
      statsLogger.log("Found View Profile link, navigating to user profile");
      const profileUrl = viewProfileLink.href;
      sessionStorage.setItem("reddit-post-machine-script-stage", "profile-navigating");
      sessionStorage.setItem("reddit-post-machine-script-stage-timestamp", Date.now().toString());
      window.location.href = profileUrl;
      await waitForCondition(() => window.location.href.includes("/u/") || window.location.href.includes("/user/"), 5e3);
      statsLogger.log("Successfully navigated to user profile page");
      return true;
    } catch (error) {
      statsLogger.error("Error during automatic user profile navigation:", error);
      return false;
    }
  }
  function queryShadowDOM(selector, root = document) {
    const element = root.querySelector(selector);
    if (element)
      return element;
    const allElements = root.querySelectorAll("*");
    for (const el of allElements) {
      if (el.shadowRoot) {
        const shadowElement = queryShadowDOM(selector, el.shadowRoot);
        if (shadowElement)
          return shadowElement;
      }
    }
    return null;
  }
  function findElementByText(text, root = document) {
    const elements = root.querySelectorAll("*");
    for (const el of elements) {
      if (el.textContent?.trim().toLowerCase() === text.toLowerCase()) {
        return el;
      }
    }
    for (const el of elements) {
      if (el.shadowRoot) {
        const shadowElement = findElementByText(text, el.shadowRoot);
        if (shadowElement)
          return shadowElement;
      }
    }
    return null;
  }
  async function navigateToPostsFromProfile() {
    statsLogger.log("Navigating to Posts tab from profile page...");
    try {
      let postsTab = queryShadowDOM('faceplate-tracker[noun="posts_tab"]') || queryShadowDOM('a[href*="/submitted"]') || queryShadowDOM('button[data-testid="posts-tab"]') || queryShadowDOM('[data-click-id="user_posts"]') || queryShadowDOM('[role="tab"]') || qs('a[href*="/submitted/"]');
      if (!postsTab) {
        statsLogger.log("Using text-based search for Posts tab");
        postsTab = findElementByText("Posts") || findElementByText("Submitted");
      }
      if (postsTab && !postsTab.getAttribute("noun")?.includes("posts_tab")) {
        const allTabs = queryShadowDOMAll('[role="tab"], faceplate-tracker, a[href*="/submitted"], button[data-testid*="tab"]');
        for (const tab of allTabs) {
          const text = tab.textContent?.trim().toLowerCase();
          if (text === "posts" || text === "submitted") {
            postsTab = tab;
            break;
          }
        }
      }
      if (!postsTab) {
        statsLogger.log("\u{1F50D} Searching for Posts tab - trying alternative detection methods...");
        const allElements = document.querySelectorAll("*");
        for (const el of allElements) {
          const attributes = el.getAttributeNames();
          for (const attr of attributes) {
            if (el.getAttribute(attr)?.toLowerCase().includes("posts")) {
              postsTab = el;
              statsLogger.log("Found posts element as fallback:", el.tagName, attr);
              break;
            }
          }
          if (postsTab)
            break;
        }
      }
      if (!postsTab) {
        statsLogger.log("Posts tab not found after all attempts");
        return false;
      }
      statsLogger.log("Found Posts tab, navigating to submitted posts:", postsTab.tagName, postsTab.textContent?.trim());
      sessionStorage.setItem("reddit-post-machine-script-stage", "profile-switching-to-posts");
      sessionStorage.setItem("reddit-post-machine-script-stage-timestamp", Date.now().toString());
      try {
        postsTab.click();
        statsLogger.log("Clicked Posts tab, waiting for content to load...");
        await sleep(3e3);
        if (window.location.href.includes("/submitted")) {
          statsLogger.log("Successfully navigated to submitted posts via click");
          return true;
        }
      } catch (clickError) {
        statsLogger.log("Click failed, trying direct navigation");
      }
      const username = extractUsernameFromPage();
      if (username) {
        const postsUrl = `https://www.reddit.com/u/${username}/submitted/`;
        statsLogger.log("Navigating directly to submitted URL:", postsUrl);
        window.location.href = postsUrl;
        await waitForCondition(() => window.location.href.includes("/submitted"), 5e3);
        statsLogger.log("Successfully navigated to submitted posts page");
        return true;
      }
      return false;
    } catch (error) {
      statsLogger.error("Error navigating to Posts tab:", error);
      return false;
    }
  }
  function queryShadowDOMAll(selector, root = document) {
    const elements = Array.from(root.querySelectorAll(selector));
    const allElements = root.querySelectorAll("*");
    for (const el of allElements) {
      if (el.shadowRoot) {
        const shadowElements = queryShadowDOMAll(selector, el.shadowRoot);
        elements.push(...shadowElements);
      }
    }
    return elements;
  }
  async function handleCheckUserStatus(userName) {
    statsLogger.log("Check user status request for:", userName);
    try {
      let currentUser = extractUsernameFromPage();
      let storedUser = await getStoredUsername();
      if (!currentUser) {
        statsLogger.log("No username found on current page, attempting automatic navigation");
        const navigationStatus = {
          currentUser: null,
          storedUser: storedUser?.seren_name || null,
          isMatch: false,
          lastCheck: storedUser?.lastCheck || null,
          postsCount: 0,
          currentUrl: window.location.href,
          timestamp: Date.now(),
          collectingPostsData: true,
          dataFresh: false,
          statusMessage: "Attempting automatic navigation to user profile..."
        };
        const navigationSuccess = await handleUserNotFoundNavigation();
        if (navigationSuccess) {
          statsLogger.log("Automatic navigation to profile successful");
          const postsNavigationSuccess = await navigateToPostsFromProfile();
          if (postsNavigationSuccess) {
            statsLogger.log("Automatic navigation to posts successful");
            return;
          } else {
            const postsFailedStatus = {
              ...profileStatus,
              collectingPostsData: false,
              postsDataError: "Failed to navigate to Posts tab from profile page"
            };
            chrome.storage.local.set({
              userStatus: postsFailedStatus
            }).catch(() => {
            });
            return;
          }
        } else {
          const profileFailedStatus = {
            ...navigationStatus,
            collectingPostsData: false,
            postsDataError: "Failed to navigate to user profile"
          };
          chrome.storage.local.set({
            userStatus: profileFailedStatus
          }).catch(() => {
          });
          return;
        }
      }
      const profileData = await chrome.storage.local.get(["redditProfileData", "latestPostsData"]);
      const cachedData = profileData.redditProfileData;
      const latestPosts = profileData.latestPostsData;
      const isDataStale = !latestPosts || Date.now() - latestPosts.lastUpdated > 36e5;
      const postsCount = latestPosts?.postsInfo?.total || latestPosts?.postsInfo?.posts?.length || 0;
      const status = {
        currentUser,
        storedUser: storedUser?.seren_name || null,
        isMatch: currentUser === storedUser?.seren_name,
        lastCheck: storedUser?.lastCheck || null,
        postsCount,
        currentUrl: window.location.href,
        timestamp: Date.now(),
        collectingPostsData: false,
        dataFresh: !isDataStale && latestPosts?.userName === currentUser,
        statusMessage: isDataStale ? "Data is stale, collecting fresh posts..." : "Using cached data"
      };
      statsLogger.log("User status check result:", status);
      chrome.storage.local.set({
        userStatus: status
      }).then(() => {
        statsLogger.log("User status stored in local storage");
      }).catch((error) => {
        statsLogger.error("Failed to store user status:", error);
      });
      if (currentUser && isDataStale) {
        statsLogger.log("Collecting fresh posts data for user:", currentUser);
        const collectingStatus = {
          ...status,
          collectingPostsData: true,
          dataFresh: false,
          statusMessage: "Collecting fresh posts data..."
        };
        chrome.storage.local.set({
          userStatus: collectingStatus
        }).catch(() => {
        });
        await chrome.storage.sync.set({
          redditUser: {
            seren_name: currentUser,
            lastCheck: Date.now()
          }
        });
        await runProfileDetectionScript();
      } else if (currentUser && !isDataStale) {
        statsLogger.log("Using cached posts data for user:", currentUser);
      } else {
        statsLogger.log("No current user found, cannot collect posts data");
      }
    } catch (error) {
      statsLogger.error("Error checking user status:", error);
      chrome.storage.local.set({
        userStatus: {
          error: error.message,
          timestamp: Date.now(),
          collectingPostsData: false,
          statusMessage: "Error occurred during status check"
        }
      }).catch(() => {
      });
    }
  }
  statsLogger.log("Stats content script loaded on URL:", window.location.href);
  if (window.location.href.includes("/submit")) {
    statsLogger.warn("Stats script loaded on submit page - this should not happen. Exiting early.");
  } else {
    initializeUsernameCache();
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      statsLogger.log("Stats script received message:", message);
      switch (message.type) {
        case "DELETE_LAST_POST":
          break;
        case "CHECK_USER_STATUS":
          handleCheckUserStatus(message.userName);
          break;
        case "MANUAL_TRIGGER_SCRIPT":
          handleManualScriptTrigger(message.scriptType, message.mode);
          break;
        case "GET_FRESH_POSTS_FOR_DECISION":
          statsLogger.log("\u{1F4CA} Stats script received GET_FRESH_POSTS_FOR_DECISION for user:", message.userName);
          getPostsDataForAutoflowDecision(message.userName).then((freshData) => {
            statsLogger.log("\u{1F4CA} Stats script collected fresh data, sending response:", freshData);
            chrome.runtime.sendMessage({
              type: "FRESH_POSTS_COLLECTED",
              data: freshData
            }).catch((error) => {
              statsLogger.error("\u{1F4CA} Failed to send FRESH_POSTS_COLLECTED message:", error);
            });
          }).catch((error) => {
            statsLogger.error("\u{1F4CA} Error in getPostsDataForAutoflowDecision:", error);
            chrome.runtime.sendMessage({
              type: "FRESH_POSTS_COLLECTED",
              data: { error: error.message, dataFresh: false }
            }).catch((sendError) => {
              statsLogger.error("\u{1F4CA} Failed to send error response:", sendError);
            });
          });
          break;
        case "REDDIT_PAGE_LOADED":
          const currentScriptStage = sessionStorage.getItem("reddit-post-machine-script-stage");
          if (currentScriptStage === "profile-switching-to-posts" && window.location.href.includes("/submitted")) {
            statsLogger.log("Reddit page loaded after navigation, continuing profile data collection");
            setTimeout(() => continueProfileDataCollection(), 2e3);
          }
          break;
        default:
          statsLogger.log("Stats script: Unknown message type:", message.type);
      }
    });
    const scriptStage = sessionStorage.getItem("reddit-post-machine-script-stage");
    if (scriptStage) {
      const stageTimestamp = sessionStorage.getItem("reddit-post-machine-script-stage-timestamp");
      if (stageTimestamp && Date.now() - parseInt(stageTimestamp) > 3e5) {
        statsLogger.log("Clearing stale script stage flag:", scriptStage);
        sessionStorage.removeItem("reddit-post-machine-script-stage");
        sessionStorage.removeItem("reddit-post-machine-script-stage-timestamp");
      }
    }
    if (scriptStage === "profile-switching-to-posts" && window.location.href.includes("/submitted")) {
      statsLogger.log("Continuing profile data collection from previous navigation");
      setTimeout(() => continueProfileDataCollection(), 2e3);
    } else if (scriptStage === "profile-navigating" && (window.location.href.includes("/u/") || window.location.href.includes("/user/"))) {
      statsLogger.log("On profile page after automatic navigation, proceeding to posts");
      setTimeout(() => navigateToPostsFromProfile(), 2e3);
    }
  }
  function stats_content_script_default(bridge2) {
    statsLogger.log("Stats script bridge initialized", bridge2);
  }

  // .quasar/bex/entry-content-script-stats-content-script.js
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
  stats_content_script_default(bridge);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCAiLi4vLi4vLnF1YXNhci9iZXgvYnJpZGdlLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xdWFzYXIvc3JjL3V0aWxzL3VpZC91aWQuanMiLCAiLi4vLi4vLnF1YXNhci9iZXgvd2luZG93LWV2ZW50LWxpc3RlbmVyLmpzIiwgIi4uLy4uL3NyYy1iZXgvbG9nZ2VyLmpzIiwgIi4uLy4uL3NyYy1iZXgvc3RhdHMtY29udGVudC1zY3JpcHQuanMiLCAiLi4vLi4vLnF1YXNhci9iZXgvZW50cnktY29udGVudC1zY3JpcHQtc3RhdHMtY29udGVudC1zY3JpcHQuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSID0gdHlwZW9mIFJlZmxlY3QgPT09ICdvYmplY3QnID8gUmVmbGVjdCA6IG51bGxcbnZhciBSZWZsZWN0QXBwbHkgPSBSICYmIHR5cGVvZiBSLmFwcGx5ID09PSAnZnVuY3Rpb24nXG4gID8gUi5hcHBseVxuICA6IGZ1bmN0aW9uIFJlZmxlY3RBcHBseSh0YXJnZXQsIHJlY2VpdmVyLCBhcmdzKSB7XG4gICAgcmV0dXJuIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKHRhcmdldCwgcmVjZWl2ZXIsIGFyZ3MpO1xuICB9XG5cbnZhciBSZWZsZWN0T3duS2V5c1xuaWYgKFIgJiYgdHlwZW9mIFIub3duS2V5cyA9PT0gJ2Z1bmN0aW9uJykge1xuICBSZWZsZWN0T3duS2V5cyA9IFIub3duS2V5c1xufSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG4gIFJlZmxlY3RPd25LZXlzID0gZnVuY3Rpb24gUmVmbGVjdE93bktleXModGFyZ2V0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRhcmdldClcbiAgICAgIC5jb25jYXQoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyh0YXJnZXQpKTtcbiAgfTtcbn0gZWxzZSB7XG4gIFJlZmxlY3RPd25LZXlzID0gZnVuY3Rpb24gUmVmbGVjdE93bktleXModGFyZ2V0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRhcmdldCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIFByb2Nlc3NFbWl0V2FybmluZyh3YXJuaW5nKSB7XG4gIGlmIChjb25zb2xlICYmIGNvbnNvbGUud2FybikgY29uc29sZS53YXJuKHdhcm5pbmcpO1xufVxuXG52YXIgTnVtYmVySXNOYU4gPSBOdW1iZXIuaXNOYU4gfHwgZnVuY3Rpb24gTnVtYmVySXNOYU4odmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9PSB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICBFdmVudEVtaXR0ZXIuaW5pdC5jYWxsKHRoaXMpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5tb2R1bGUuZXhwb3J0cy5vbmNlID0gb25jZTtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHNDb3VudCA9IDA7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbnZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbmZ1bmN0aW9uIGNoZWNrTGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIEZ1bmN0aW9uLiBSZWNlaXZlZCB0eXBlICcgKyB0eXBlb2YgbGlzdGVuZXIpO1xuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShFdmVudEVtaXR0ZXIsICdkZWZhdWx0TWF4TGlzdGVuZXJzJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkZWZhdWx0TWF4TGlzdGVuZXJzO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uKGFyZykge1xuICAgIGlmICh0eXBlb2YgYXJnICE9PSAnbnVtYmVyJyB8fCBhcmcgPCAwIHx8IE51bWJlcklzTmFOKGFyZykpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgb2YgXCJkZWZhdWx0TWF4TGlzdGVuZXJzXCIgaXMgb3V0IG9mIHJhbmdlLiBJdCBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIG51bWJlci4gUmVjZWl2ZWQgJyArIGFyZyArICcuJyk7XG4gICAgfVxuICAgIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSBhcmc7XG4gIH1cbn0pO1xuXG5FdmVudEVtaXR0ZXIuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gIGlmICh0aGlzLl9ldmVudHMgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgdGhpcy5fZXZlbnRzID09PSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykuX2V2ZW50cykge1xuICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICB9XG5cbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn07XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycyhuKSB7XG4gIGlmICh0eXBlb2YgbiAhPT0gJ251bWJlcicgfHwgbiA8IDAgfHwgTnVtYmVySXNOYU4obikpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVGhlIHZhbHVlIG9mIFwiblwiIGlzIG91dCBvZiByYW5nZS4gSXQgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBudW1iZXIuIFJlY2VpdmVkICcgKyBuICsgJy4nKTtcbiAgfVxuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIF9nZXRNYXhMaXN0ZW5lcnModGhhdCkge1xuICBpZiAodGhhdC5fbWF4TGlzdGVuZXJzID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICByZXR1cm4gdGhhdC5fbWF4TGlzdGVuZXJzO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmdldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIGdldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIF9nZXRNYXhMaXN0ZW5lcnModGhpcyk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUpIHtcbiAgdmFyIGFyZ3MgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICB2YXIgZG9FcnJvciA9ICh0eXBlID09PSAnZXJyb3InKTtcblxuICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICBpZiAoZXZlbnRzICE9PSB1bmRlZmluZWQpXG4gICAgZG9FcnJvciA9IChkb0Vycm9yICYmIGV2ZW50cy5lcnJvciA9PT0gdW5kZWZpbmVkKTtcbiAgZWxzZSBpZiAoIWRvRXJyb3IpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKGRvRXJyb3IpIHtcbiAgICB2YXIgZXI7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID4gMClcbiAgICAgIGVyID0gYXJnc1swXTtcbiAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgLy8gTm90ZTogVGhlIGNvbW1lbnRzIG9uIHRoZSBgdGhyb3dgIGxpbmVzIGFyZSBpbnRlbnRpb25hbCwgdGhleSBzaG93XG4gICAgICAvLyB1cCBpbiBOb2RlJ3Mgb3V0cHV0IGlmIHRoaXMgcmVzdWx0cyBpbiBhbiB1bmhhbmRsZWQgZXhjZXB0aW9uLlxuICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgfVxuICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmhhbmRsZWQgZXJyb3IuJyArIChlciA/ICcgKCcgKyBlci5tZXNzYWdlICsgJyknIDogJycpKTtcbiAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgIHRocm93IGVycjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgfVxuXG4gIHZhciBoYW5kbGVyID0gZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChoYW5kbGVyID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIFJlZmxlY3RBcHBseShoYW5kbGVyLCB0aGlzLCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgUmVmbGVjdEFwcGx5KGxpc3RlbmVyc1tpXSwgdGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmZ1bmN0aW9uIF9hZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBwcmVwZW5kKSB7XG4gIHZhciBtO1xuICB2YXIgZXZlbnRzO1xuICB2YXIgZXhpc3Rpbmc7XG5cbiAgY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG5cbiAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gIGlmIChldmVudHMgPT09IHVuZGVmaW5lZCkge1xuICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB0YXJnZXQuX2V2ZW50c0NvdW50ID0gMDtcbiAgfSBlbHNlIHtcbiAgICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAgIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgICBpZiAoZXZlbnRzLm5ld0xpc3RlbmVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRhcmdldC5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA/IGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gICAgICAvLyBSZS1hc3NpZ24gYGV2ZW50c2AgYmVjYXVzZSBhIG5ld0xpc3RlbmVyIGhhbmRsZXIgY291bGQgaGF2ZSBjYXVzZWQgdGhlXG4gICAgICAvLyB0aGlzLl9ldmVudHMgdG8gYmUgYXNzaWduZWQgdG8gYSBuZXcgb2JqZWN0XG4gICAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgICB9XG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV07XG4gIH1cblxuICBpZiAoZXhpc3RpbmcgPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gICAgKyt0YXJnZXQuX2V2ZW50c0NvdW50O1xuICB9IGVsc2Uge1xuICAgIGlmICh0eXBlb2YgZXhpc3RpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPVxuICAgICAgICBwcmVwZW5kID8gW2xpc3RlbmVyLCBleGlzdGluZ10gOiBbZXhpc3RpbmcsIGxpc3RlbmVyXTtcbiAgICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB9IGVsc2UgaWYgKHByZXBlbmQpIHtcbiAgICAgIGV4aXN0aW5nLnVuc2hpZnQobGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleGlzdGluZy5wdXNoKGxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICAgIG0gPSBfZ2V0TWF4TGlzdGVuZXJzKHRhcmdldCk7XG4gICAgaWYgKG0gPiAwICYmIGV4aXN0aW5nLmxlbmd0aCA+IG0gJiYgIWV4aXN0aW5nLndhcm5lZCkge1xuICAgICAgZXhpc3Rpbmcud2FybmVkID0gdHJ1ZTtcbiAgICAgIC8vIE5vIGVycm9yIGNvZGUgZm9yIHRoaXMgc2luY2UgaXQgaXMgYSBXYXJuaW5nXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVzdHJpY3RlZC1zeW50YXhcbiAgICAgIHZhciB3ID0gbmV3IEVycm9yKCdQb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5IGxlYWsgZGV0ZWN0ZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZy5sZW5ndGggKyAnICcgKyBTdHJpbmcodHlwZSkgKyAnIGxpc3RlbmVycyAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FkZGVkLiBVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ2luY3JlYXNlIGxpbWl0Jyk7XG4gICAgICB3Lm5hbWUgPSAnTWF4TGlzdGVuZXJzRXhjZWVkZWRXYXJuaW5nJztcbiAgICAgIHcuZW1pdHRlciA9IHRhcmdldDtcbiAgICAgIHcudHlwZSA9IHR5cGU7XG4gICAgICB3LmNvdW50ID0gZXhpc3RpbmcubGVuZ3RoO1xuICAgICAgUHJvY2Vzc0VtaXRXYXJuaW5nKHcpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfTtcblxuZnVuY3Rpb24gb25jZVdyYXBwZXIoKSB7XG4gIGlmICghdGhpcy5maXJlZCkge1xuICAgIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy53cmFwRm4pO1xuICAgIHRoaXMuZmlyZWQgPSB0cnVlO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCk7XG4gICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuYXBwbHkodGhpcy50YXJnZXQsIGFyZ3VtZW50cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX29uY2VXcmFwKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIHN0YXRlID0geyBmaXJlZDogZmFsc2UsIHdyYXBGbjogdW5kZWZpbmVkLCB0YXJnZXQ6IHRhcmdldCwgdHlwZTogdHlwZSwgbGlzdGVuZXI6IGxpc3RlbmVyIH07XG4gIHZhciB3cmFwcGVkID0gb25jZVdyYXBwZXIuYmluZChzdGF0ZSk7XG4gIHdyYXBwZWQubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgc3RhdGUud3JhcEZuID0gd3JhcHBlZDtcbiAgcmV0dXJuIHdyYXBwZWQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UodHlwZSwgbGlzdGVuZXIpIHtcbiAgY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG4gIHRoaXMub24odHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kT25jZUxpc3RlbmVyID1cbiAgICBmdW5jdGlvbiBwcmVwZW5kT25jZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgIHRoaXMucHJlcGVuZExpc3RlbmVyKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuLy8gRW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmIGFuZCBvbmx5IGlmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgbGlzdCwgZXZlbnRzLCBwb3NpdGlvbiwgaSwgb3JpZ2luYWxMaXN0ZW5lcjtcblxuICAgICAgY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmIChldmVudHMgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGxpc3QgPSBldmVudHNbdHlwZV07XG4gICAgICBpZiAobGlzdCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8IGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0Lmxpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbGlzdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwb3NpdGlvbiA9IC0xO1xuXG4gICAgICAgIGZvciAoaSA9IGxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHwgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsTGlzdGVuZXIgPSBsaXN0W2ldLmxpc3RlbmVyO1xuICAgICAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgICBpZiAocG9zaXRpb24gPT09IDApXG4gICAgICAgICAgbGlzdC5zaGlmdCgpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBzcGxpY2VPbmUobGlzdCwgcG9zaXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKVxuICAgICAgICAgIGV2ZW50c1t0eXBlXSA9IGxpc3RbMF07XG5cbiAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lciAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBvcmlnaW5hbExpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKHR5cGUpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMsIGV2ZW50cywgaTtcblxuICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICAgICAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnRzW3R5cGVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGV2ZW50cyk7XG4gICAgICAgIHZhciBrZXk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBsaXN0ZW5lcnMgPSBldmVudHNbdHlwZV07XG5cbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gTElGTyBvcmRlclxuICAgICAgICBmb3IgKGkgPSBsaXN0ZW5lcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuZnVuY3Rpb24gX2xpc3RlbmVycyh0YXJnZXQsIHR5cGUsIHVud3JhcCkge1xuICB2YXIgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG5cbiAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBbXTtcblxuICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcbiAgaWYgKGV2bGlzdGVuZXIgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gW107XG5cbiAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKVxuICAgIHJldHVybiB1bndyYXAgPyBbZXZsaXN0ZW5lci5saXN0ZW5lciB8fCBldmxpc3RlbmVyXSA6IFtldmxpc3RlbmVyXTtcblxuICByZXR1cm4gdW53cmFwID9cbiAgICB1bndyYXBMaXN0ZW5lcnMoZXZsaXN0ZW5lcikgOiBhcnJheUNsb25lKGV2bGlzdGVuZXIsIGV2bGlzdGVuZXIubGVuZ3RoKTtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCB0cnVlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmF3TGlzdGVuZXJzID0gZnVuY3Rpb24gcmF3TGlzdGVuZXJzKHR5cGUpIHtcbiAgcmV0dXJuIF9saXN0ZW5lcnModGhpcywgdHlwZSwgZmFsc2UpO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5saXN0ZW5lckNvdW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbGlzdGVuZXJDb3VudC5jYWxsKGVtaXR0ZXIsIHR5cGUpO1xuICB9XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBsaXN0ZW5lckNvdW50O1xuZnVuY3Rpb24gbGlzdGVuZXJDb3VudCh0eXBlKSB7XG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XG5cbiAgaWYgKGV2ZW50cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG5cbiAgICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSBpZiAoZXZsaXN0ZW5lciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIDA7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXZlbnROYW1lcyA9IGZ1bmN0aW9uIGV2ZW50TmFtZXMoKSB7XG4gIHJldHVybiB0aGlzLl9ldmVudHNDb3VudCA+IDAgPyBSZWZsZWN0T3duS2V5cyh0aGlzLl9ldmVudHMpIDogW107XG59O1xuXG5mdW5jdGlvbiBhcnJheUNsb25lKGFyciwgbikge1xuICB2YXIgY29weSA9IG5ldyBBcnJheShuKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpXG4gICAgY29weVtpXSA9IGFycltpXTtcbiAgcmV0dXJuIGNvcHk7XG59XG5cbmZ1bmN0aW9uIHNwbGljZU9uZShsaXN0LCBpbmRleCkge1xuICBmb3IgKDsgaW5kZXggKyAxIDwgbGlzdC5sZW5ndGg7IGluZGV4KyspXG4gICAgbGlzdFtpbmRleF0gPSBsaXN0W2luZGV4ICsgMV07XG4gIGxpc3QucG9wKCk7XG59XG5cbmZ1bmN0aW9uIHVud3JhcExpc3RlbmVycyhhcnIpIHtcbiAgdmFyIHJldCA9IG5ldyBBcnJheShhcnIubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXQubGVuZ3RoOyArK2kpIHtcbiAgICByZXRbaV0gPSBhcnJbaV0ubGlzdGVuZXIgfHwgYXJyW2ldO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIG9uY2UoZW1pdHRlciwgbmFtZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGZ1bmN0aW9uIGVycm9yTGlzdGVuZXIoZXJyKSB7XG4gICAgICBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKG5hbWUsIHJlc29sdmVyKTtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc29sdmVyKCkge1xuICAgICAgaWYgKHR5cGVvZiBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgZXJyb3JMaXN0ZW5lcik7XG4gICAgICB9XG4gICAgICByZXNvbHZlKFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgfTtcblxuICAgIGV2ZW50VGFyZ2V0QWdub3N0aWNBZGRMaXN0ZW5lcihlbWl0dGVyLCBuYW1lLCByZXNvbHZlciwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIGlmIChuYW1lICE9PSAnZXJyb3InKSB7XG4gICAgICBhZGRFcnJvckhhbmRsZXJJZkV2ZW50RW1pdHRlcihlbWl0dGVyLCBlcnJvckxpc3RlbmVyLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkRXJyb3JIYW5kbGVySWZFdmVudEVtaXR0ZXIoZW1pdHRlciwgaGFuZGxlciwgZmxhZ3MpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZXZlbnRUYXJnZXRBZ25vc3RpY0FkZExpc3RlbmVyKGVtaXR0ZXIsICdlcnJvcicsIGhhbmRsZXIsIGZsYWdzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBldmVudFRhcmdldEFnbm9zdGljQWRkTGlzdGVuZXIoZW1pdHRlciwgbmFtZSwgbGlzdGVuZXIsIGZsYWdzKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmIChmbGFncy5vbmNlKSB7XG4gICAgICBlbWl0dGVyLm9uY2UobmFtZSwgbGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbWl0dGVyLm9uKG5hbWUsIGxpc3RlbmVyKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIEV2ZW50VGFyZ2V0IGRvZXMgbm90IGhhdmUgYGVycm9yYCBldmVudCBzZW1hbnRpY3MgbGlrZSBOb2RlXG4gICAgLy8gRXZlbnRFbWl0dGVycywgd2UgZG8gbm90IGxpc3RlbiBmb3IgYGVycm9yYCBldmVudHMgaGVyZS5cbiAgICBlbWl0dGVyLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZnVuY3Rpb24gd3JhcExpc3RlbmVyKGFyZykge1xuICAgICAgLy8gSUUgZG9lcyBub3QgaGF2ZSBidWlsdGluIGB7IG9uY2U6IHRydWUgfWAgc3VwcG9ydCBzbyB3ZVxuICAgICAgLy8gaGF2ZSB0byBkbyBpdCBtYW51YWxseS5cbiAgICAgIGlmIChmbGFncy5vbmNlKSB7XG4gICAgICAgIGVtaXR0ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCB3cmFwTGlzdGVuZXIpO1xuICAgICAgfVxuICAgICAgbGlzdGVuZXIoYXJnKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgXCJlbWl0dGVyXCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIEV2ZW50RW1pdHRlci4gUmVjZWl2ZWQgdHlwZSAnICsgdHlwZW9mIGVtaXR0ZXIpO1xuICB9XG59XG4iLCAiLyogZXNsaW50LWRpc2FibGUgKi9cbi8qKlxuICogVEhJUyBGSUxFIElTIEdFTkVSQVRFRCBBVVRPTUFUSUNBTExZLlxuICogRE8gTk9UIEVESVQuXG4gKiovXG5cbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cydcbmltcG9ydCB1aWQgZnJvbSAncXVhc2FyL3NyYy91dGlscy91aWQvdWlkLmpzJ1xuXG5jb25zdFxuICB0eXBlU2l6ZXMgPSB7XG4gICAgJ3VuZGVmaW5lZCc6ICgpID0+IDAsXG4gICAgJ2Jvb2xlYW4nOiAoKSA9PiA0LFxuICAgICdudW1iZXInOiAoKSA9PiA4LFxuICAgICdzdHJpbmcnOiBpdGVtID0+IDIgKiBpdGVtLmxlbmd0aCxcbiAgICAnb2JqZWN0JzogaXRlbSA9PiAhaXRlbSA/IDAgOiBPYmplY3RcbiAgICAgIC5rZXlzKGl0ZW0pXG4gICAgICAucmVkdWNlKCh0b3RhbCwga2V5KSA9PiBzaXplT2Yoa2V5KSArIHNpemVPZihpdGVtW2tleV0pICsgdG90YWwsIDApXG4gIH0sXG4gIHNpemVPZiA9IHZhbHVlID0+IHR5cGVTaXplc1t0eXBlb2YgdmFsdWVdKHZhbHVlKVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcmlkZ2UgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvciAod2FsbCkge1xuICAgIHN1cGVyKClcblxuICAgIHRoaXMuc2V0TWF4TGlzdGVuZXJzKEluZmluaXR5KVxuICAgIHRoaXMud2FsbCA9IHdhbGxcblxuICAgIHdhbGwubGlzdGVuKG1lc3NhZ2VzID0+IHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KG1lc3NhZ2VzKSkge1xuICAgICAgICBtZXNzYWdlcy5mb3JFYWNoKG1lc3NhZ2UgPT4gdGhpcy5fZW1pdChtZXNzYWdlKSlcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl9lbWl0KG1lc3NhZ2VzKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLl9zZW5kaW5nUXVldWUgPSBbXVxuICAgIHRoaXMuX3NlbmRpbmcgPSBmYWxzZVxuICAgIHRoaXMuX21heE1lc3NhZ2VTaXplID0gMzIgKiAxMDI0ICogMTAyNCAvLyAzMm1iXG4gIH1cblxuICAvKipcbiAgICogU2VuZCBhbiBldmVudC5cbiAgICpcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqIEBwYXJhbSBwYXlsb2FkXG4gICAqIEByZXR1cm5zIFByb21pc2U8PlxuICAgKi9cbiAgc2VuZCAoZXZlbnQsIHBheWxvYWQpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VuZChbeyBldmVudCwgcGF5bG9hZCB9XSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYWxsIHJlZ2lzdGVyZWQgZXZlbnRzXG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cbiAgZ2V0RXZlbnRzICgpIHtcbiAgICByZXR1cm4gdGhpcy5fZXZlbnRzXG4gIH1cblxuICBvbihldmVudE5hbWUsIGxpc3RlbmVyKSB7XG4gICAgcmV0dXJuIHN1cGVyLm9uKGV2ZW50TmFtZSwgKG9yaWdpbmFsUGF5bG9hZCkgPT4ge1xuICAgICAgbGlzdGVuZXIoe1xuICAgICAgICAuLi5vcmlnaW5hbFBheWxvYWQsXG4gICAgICAgIC8vIENvbnZlbmllbnQgYWx0ZXJuYXRpdmUgdG8gdGhlIG1hbnVhbCB1c2FnZSBvZiBgZXZlbnRSZXNwb25zZUtleWBcbiAgICAgICAgLy8gV2UgY2FuJ3Qgc2VuZCB0aGlzIGluIGBfbmV4dFNlbmRgIHdoaWNoIHdpbGwgdGhlbiBiZSBzZW50IHVzaW5nIGBwb3J0LnBvc3RNZXNzYWdlKClgLCB3aGljaCBjYW4ndCBzZXJpYWxpemUgZnVuY3Rpb25zLlxuICAgICAgICAvLyBTbywgd2UgaG9vayBpbnRvIHRoZSB1bmRlcmx5aW5nIGxpc3RlbmVyIGFuZCBpbmNsdWRlIHRoZSBmdW5jdGlvbiB0aGVyZSwgd2hpY2ggaGFwcGVucyBhZnRlciB0aGUgc2VuZCBvcGVyYXRpb24uXG4gICAgICAgIHJlc3BvbmQ6IChwYXlsb2FkIC8qIG9wdGlvbmFsICovKSA9PiB0aGlzLnNlbmQob3JpZ2luYWxQYXlsb2FkLmV2ZW50UmVzcG9uc2VLZXksIHBheWxvYWQpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBfZW1pdCAobWVzc2FnZSkge1xuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuZW1pdChtZXNzYWdlKVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuZW1pdChtZXNzYWdlLmV2ZW50LCBtZXNzYWdlLnBheWxvYWQpXG4gICAgfVxuICB9XG5cbiAgX3NlbmQgKG1lc3NhZ2VzKSB7XG4gICAgdGhpcy5fc2VuZGluZ1F1ZXVlLnB1c2gobWVzc2FnZXMpXG4gICAgcmV0dXJuIHRoaXMuX25leHRTZW5kKClcbiAgfVxuXG4gIF9uZXh0U2VuZCAoKSB7XG4gICAgaWYgKCF0aGlzLl9zZW5kaW5nUXVldWUubGVuZ3RoIHx8IHRoaXMuX3NlbmRpbmcpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgIHRoaXMuX3NlbmRpbmcgPSB0cnVlXG5cbiAgICBjb25zdFxuICAgICAgbWVzc2FnZXMgPSB0aGlzLl9zZW5kaW5nUXVldWUuc2hpZnQoKSxcbiAgICAgIGN1cnJlbnRNZXNzYWdlID0gbWVzc2FnZXNbMF0sXG4gICAgICBldmVudExpc3RlbmVyS2V5ID0gYCR7Y3VycmVudE1lc3NhZ2UuZXZlbnR9LiR7dWlkKCl9YCxcbiAgICAgIGV2ZW50UmVzcG9uc2VLZXkgPSBldmVudExpc3RlbmVyS2V5ICsgJy5yZXN1bHQnXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbGV0IGFsbENodW5rcyA9IFtdXG5cbiAgICAgIGNvbnN0IGZuID0gKHIpID0+IHtcbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhIHNwbGl0IG1lc3NhZ2UgdGhlbiBrZWVwIGxpc3RlbmluZyBmb3IgdGhlIGNodW5rcyBhbmQgYnVpbGQgYSBsaXN0IHRvIHJlc29sdmVcbiAgICAgICAgaWYgKHIgIT09IHZvaWQgMCAmJiByLl9jaHVua1NwbGl0KSB7XG4gICAgICAgICAgY29uc3QgY2h1bmtEYXRhID0gci5fY2h1bmtTcGxpdFxuICAgICAgICAgIGFsbENodW5rcyA9IFsuLi5hbGxDaHVua3MsIC4uLnIuZGF0YV1cblxuICAgICAgICAgIC8vIExhc3QgY2h1bmsgcmVjZWl2ZWQgc28gcmVzb2x2ZSB0aGUgcHJvbWlzZS5cbiAgICAgICAgICBpZiAoY2h1bmtEYXRhLmxhc3RDaHVuaykge1xuICAgICAgICAgICAgdGhpcy5vZmYoZXZlbnRSZXNwb25zZUtleSwgZm4pXG4gICAgICAgICAgICByZXNvbHZlKGFsbENodW5rcylcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpcy5vZmYoZXZlbnRSZXNwb25zZUtleSwgZm4pXG4gICAgICAgICAgcmVzb2x2ZShyKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMub24oZXZlbnRSZXNwb25zZUtleSwgZm4pXG5cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEFkZCBhbiBldmVudCByZXNwb25zZSBrZXkgdG8gdGhlIHBheWxvYWQgd2UncmUgc2VuZGluZyBzbyB0aGUgbWVzc2FnZSBrbm93cyB3aGljaCBjaGFubmVsIHRvIHJlc3BvbmQgb24uXG4gICAgICAgIGNvbnN0IG1lc3NhZ2VzVG9TZW5kID0gbWVzc2FnZXMubWFwKG0gPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5tLFxuICAgICAgICAgICAgLi4ue1xuICAgICAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICAgICAgZGF0YTogbS5wYXlsb2FkLFxuICAgICAgICAgICAgICAgIGV2ZW50UmVzcG9uc2VLZXlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLndhbGwuc2VuZChtZXNzYWdlc1RvU2VuZClcbiAgICAgIH1cbiAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gJ01lc3NhZ2UgbGVuZ3RoIGV4Y2VlZGVkIG1heGltdW0gYWxsb3dlZCBsZW5ndGguJ1xuXG4gICAgICAgIGlmIChlcnIubWVzc2FnZSA9PT0gZXJyb3JNZXNzYWdlKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIHBheWxvYWQgaXMgYW4gYXJyYXkgYW5kIHRvbyBiaWcgdGhlbiBzcGxpdCBpdCBpbnRvIGNodW5rcyBhbmQgc2VuZCB0byB0aGUgY2xpZW50cyBicmlkZ2VcbiAgICAgICAgICAvLyB0aGUgY2xpZW50IGJyaWRnZSB3aWxsIHRoZW4gcmVzb2x2ZSB0aGUgcHJvbWlzZS5cbiAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoY3VycmVudE1lc3NhZ2UucGF5bG9hZCkpIHtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3JNZXNzYWdlICsgJyBOb3RlOiBUaGUgYnJpZGdlIGNhbiBkZWFsIHdpdGggdGhpcyBpcyBpZiB0aGUgcGF5bG9hZCBpcyBhbiBBcnJheS4nKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG9iamVjdFNpemUgPSBzaXplT2YoY3VycmVudE1lc3NhZ2UpXG5cbiAgICAgICAgICAgIGlmIChvYmplY3RTaXplID4gdGhpcy5fbWF4TWVzc2FnZVNpemUpIHtcbiAgICAgICAgICAgICAgY29uc3RcbiAgICAgICAgICAgICAgICBjaHVua3NSZXF1aXJlZCA9IE1hdGguY2VpbChvYmplY3RTaXplIC8gdGhpcy5fbWF4TWVzc2FnZVNpemUpLFxuICAgICAgICAgICAgICAgIGFycmF5SXRlbUNvdW50ID0gTWF0aC5jZWlsKGN1cnJlbnRNZXNzYWdlLnBheWxvYWQubGVuZ3RoIC8gY2h1bmtzUmVxdWlyZWQpXG5cbiAgICAgICAgICAgICAgbGV0IGRhdGEgPSBjdXJyZW50TWVzc2FnZS5wYXlsb2FkXG4gICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzUmVxdWlyZWQ7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCB0YWtlID0gTWF0aC5taW4oZGF0YS5sZW5ndGgsIGFycmF5SXRlbUNvdW50KVxuXG4gICAgICAgICAgICAgICAgdGhpcy53YWxsLnNlbmQoW3tcbiAgICAgICAgICAgICAgICAgIGV2ZW50OiBjdXJyZW50TWVzc2FnZS5ldmVudCxcbiAgICAgICAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgX2NodW5rU3BsaXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICBjb3VudDogY2h1bmtzUmVxdWlyZWQsXG4gICAgICAgICAgICAgICAgICAgICAgbGFzdENodW5rOiBpID09PSBjaHVua3NSZXF1aXJlZCAtIDFcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YS5zcGxpY2UoMCwgdGFrZSlcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9zZW5kaW5nID0gZmFsc2VcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4geyByZXR1cm4gdGhpcy5fbmV4dFNlbmQoKSB9LCAxNilcbiAgICB9KVxuICB9XG59XG4iLCAiLyoqXG4gKiBCYXNlZCBvbiB0aGUgd29yayBvZiBodHRwczovL2dpdGh1Yi5jb20vamNob29rL3V1aWQtcmFuZG9tXG4gKi9cblxubGV0XG4gIGJ1ZixcbiAgYnVmSWR4ID0gMFxuY29uc3QgaGV4Qnl0ZXMgPSBuZXcgQXJyYXkoMjU2KVxuXG4vLyBQcmUtY2FsY3VsYXRlIHRvU3RyaW5nKDE2KSBmb3Igc3BlZWRcbmZvciAobGV0IGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgaGV4Qnl0ZXNbIGkgXSA9IChpICsgMHgxMDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSlcbn1cblxuLy8gVXNlIGJlc3QgYXZhaWxhYmxlIFBSTkdcbmNvbnN0IHJhbmRvbUJ5dGVzID0gKCgpID0+IHtcbiAgLy8gTm9kZSAmIEJyb3dzZXIgc3VwcG9ydFxuICBjb25zdCBsaWIgPSB0eXBlb2YgY3J5cHRvICE9PSAndW5kZWZpbmVkJ1xuICAgID8gY3J5cHRvXG4gICAgOiAoXG4gICAgICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgICAgICAgPyB3aW5kb3cuY3J5cHRvIHx8IHdpbmRvdy5tc0NyeXB0b1xuICAgICAgICAgIDogdm9pZCAwXG4gICAgICApXG5cbiAgaWYgKGxpYiAhPT0gdm9pZCAwKSB7XG4gICAgaWYgKGxpYi5yYW5kb21CeXRlcyAhPT0gdm9pZCAwKSB7XG4gICAgICByZXR1cm4gbGliLnJhbmRvbUJ5dGVzXG4gICAgfVxuICAgIGlmIChsaWIuZ2V0UmFuZG9tVmFsdWVzICE9PSB2b2lkIDApIHtcbiAgICAgIHJldHVybiBuID0+IHtcbiAgICAgICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShuKVxuICAgICAgICBsaWIuZ2V0UmFuZG9tVmFsdWVzKGJ5dGVzKVxuICAgICAgICByZXR1cm4gYnl0ZXNcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbiA9PiB7XG4gICAgY29uc3QgciA9IFtdXG4gICAgZm9yIChsZXQgaSA9IG47IGkgPiAwOyBpLS0pIHtcbiAgICAgIHIucHVzaChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTYpKVxuICAgIH1cbiAgICByZXR1cm4gclxuICB9XG59KSgpXG5cbi8vIEJ1ZmZlciByYW5kb20gbnVtYmVycyBmb3Igc3BlZWRcbi8vIFJlZHVjZSBtZW1vcnkgdXNhZ2UgYnkgZGVjcmVhc2luZyB0aGlzIG51bWJlciAobWluIDE2KVxuLy8gb3IgaW1wcm92ZSBzcGVlZCBieSBpbmNyZWFzaW5nIHRoaXMgbnVtYmVyICh0cnkgMTYzODQpXG5jb25zdCBCVUZGRVJfU0laRSA9IDQwOTZcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xuICAvLyBCdWZmZXIgc29tZSByYW5kb20gYnl0ZXMgZm9yIHNwZWVkXG4gIGlmIChidWYgPT09IHZvaWQgMCB8fCAoYnVmSWR4ICsgMTYgPiBCVUZGRVJfU0laRSkpIHtcbiAgICBidWZJZHggPSAwXG4gICAgYnVmID0gcmFuZG9tQnl0ZXMoQlVGRkVSX1NJWkUpXG4gIH1cblxuICBjb25zdCBiID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYnVmLCBidWZJZHgsIChidWZJZHggKz0gMTYpKVxuICBiWyA2IF0gPSAoYlsgNiBdICYgMHgwZikgfCAweDQwXG4gIGJbIDggXSA9IChiWyA4IF0gJiAweDNmKSB8IDB4ODBcblxuICByZXR1cm4gaGV4Qnl0ZXNbIGJbIDAgXSBdICsgaGV4Qnl0ZXNbIGJbIDEgXSBdXG4gICAgKyBoZXhCeXRlc1sgYlsgMiBdIF0gKyBoZXhCeXRlc1sgYlsgMyBdIF0gKyAnLSdcbiAgICArIGhleEJ5dGVzWyBiWyA0IF0gXSArIGhleEJ5dGVzWyBiWyA1IF0gXSArICctJ1xuICAgICsgaGV4Qnl0ZXNbIGJbIDYgXSBdICsgaGV4Qnl0ZXNbIGJbIDcgXSBdICsgJy0nXG4gICAgKyBoZXhCeXRlc1sgYlsgOCBdIF0gKyBoZXhCeXRlc1sgYlsgOSBdIF0gKyAnLSdcbiAgICArIGhleEJ5dGVzWyBiWyAxMCBdIF0gKyBoZXhCeXRlc1sgYlsgMTEgXSBdXG4gICAgKyBoZXhCeXRlc1sgYlsgMTIgXSBdICsgaGV4Qnl0ZXNbIGJbIDEzIF0gXVxuICAgICsgaGV4Qnl0ZXNbIGJbIDE0IF0gXSArIGhleEJ5dGVzWyBiWyAxNSBdIF1cbn1cbiIsICIvKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyoqXG4gKiBUSElTIEZJTEUgSVMgR0VORVJBVEVEIEFVVE9NQVRJQ0FMTFkuXG4gKiBETyBOT1QgRURJVC5cbiAqKi9cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gYWRkIGEgZ2VuZXJpYyB3aW5kb3dzIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBwYWdlXG4gKiB3aGljaCBhY3RzIGFzIGEgYnJpZGdlIGJldHdlZW4gdGhlIHdlYiBwYWdlIGFuZCB0aGUgY29udGVudCBzY3JpcHQgYnJpZGdlLlxuICogQHBhcmFtIGJyaWRnZVxuICogQHBhcmFtIHR5cGVcbiAqL1xuZXhwb3J0IGNvbnN0IGxpc3RlbkZvcldpbmRvd0V2ZW50cyA9IChicmlkZ2UsIHR5cGUpID0+IHtcbiAgLy8gTGlzdGVuIGZvciBhbnkgZXZlbnRzIGZyb20gdGhlIHdlYiBwYWdlIGFuZCB0cmFuc21pdCB0byB0aGUgQkVYIGJyaWRnZS5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBwYXlsb2FkID0+IHtcbiAgICAvLyBXZSBvbmx5IGFjY2VwdCBtZXNzYWdlcyBmcm9tIHRoaXMgd2luZG93IHRvIGl0c2VsZiBbaS5lLiBub3QgZnJvbSBhbnkgaWZyYW1lc11cbiAgICBpZiAocGF5bG9hZC5zb3VyY2UgIT09IHdpbmRvdykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKHBheWxvYWQuZGF0YS5mcm9tICE9PSB2b2lkIDAgJiYgcGF5bG9hZC5kYXRhLmZyb20gPT09IHR5cGUpIHtcbiAgICAgIGNvbnN0XG4gICAgICAgIGV2ZW50RGF0YSA9IHBheWxvYWQuZGF0YVswXSxcbiAgICAgICAgYnJpZGdlRXZlbnRzID0gYnJpZGdlLmdldEV2ZW50cygpXG5cbiAgICAgIGZvciAobGV0IGV2ZW50IGluIGJyaWRnZUV2ZW50cykge1xuICAgICAgICBpZiAoZXZlbnQgPT09IGV2ZW50RGF0YS5ldmVudCkge1xuICAgICAgICAgIGJyaWRnZUV2ZW50c1tldmVudF0oZXZlbnREYXRhLnBheWxvYWQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIGZhbHNlKVxufVxuIiwgIi8vIFNpbXBsZSBsb2dnZXIgZm9yIGJyb3dzZXIgZXh0ZW5zaW9uIGNvbnRleHQgc2NyaXB0c1xuY2xhc3MgRXh0ZW5zaW9uTG9nZ2VyIHtcbiAgY29uc3RydWN0b3IocHJlZml4ID0gJycpIHtcbiAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgICB0aGlzLmRlYnVnRW5hYmxlZCA9IHRydWU7IC8vIFNldCB0byB0cnVlIGZvciBkZWJ1Z2dpbmdcbiAgfVxuXG4gIGFzeW5jIGNoZWNrRGVidWdTZXR0aW5nKCkge1xuICAgIHRyeSB7XG4gICAgICAvLyBDaGVjayBpZiBkZWJ1ZyBtb2RlIGlzIGVuYWJsZWQgaW4gc3RvcmFnZVxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsnZGVidWdNb2RlJ10pO1xuICAgICAgLy8gRm9yIGJhY2tncm91bmQgc2NyaXB0cywgYWx3YXlzIGVuYWJsZSBsb2dnaW5nIHJlZ2FyZGxlc3Mgb2Ygc3RvcmFnZSBzZXR0aW5nXG4gICAgICB0aGlzLmRlYnVnRW5hYmxlZCA9IHRydWU7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIElmIHN0b3JhZ2UgaXMgbm90IGF2YWlsYWJsZSwga2VlcCBjdXJyZW50IHNldHRpbmdcbiAgICB9XG4gIH1cblxuICBsb2coLi4uYXJncykge1xuICAgIGlmICh0aGlzLmRlYnVnRW5hYmxlZCkge1xuICAgICAgY29uc29sZS5sb2codGhpcy5wcmVmaXgsIC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGluZm8oLi4uYXJncykge1xuICAgIGlmICh0aGlzLmRlYnVnRW5hYmxlZCkge1xuICAgICAgY29uc29sZS5pbmZvKHRoaXMucHJlZml4LCAuLi5hcmdzKTtcbiAgICB9XG4gIH1cblxuICB3YXJuKC4uLmFyZ3MpIHtcbiAgICAvLyBBbHdheXMgc2hvdyB3YXJuaW5nc1xuICAgIGNvbnNvbGUud2Fybih0aGlzLnByZWZpeCwgLi4uYXJncyk7XG4gIH1cblxuICBlcnJvciguLi5hcmdzKSB7XG4gICAgLy8gQWx3YXlzIHNob3cgZXJyb3JzXG4gICAgY29uc29sZS5lcnJvcih0aGlzLnByZWZpeCwgLi4uYXJncyk7XG4gIH1cblxuICBkZWJ1ZyguLi5hcmdzKSB7XG4gICAgaWYgKHRoaXMuZGVidWdFbmFibGVkKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKHRoaXMucHJlZml4LCAuLi5hcmdzKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gQ3JlYXRlIGxvZ2dlciBpbnN0YW5jZXMgZm9yIGRpZmZlcmVudCBjb250ZXh0c1xuZXhwb3J0IGNvbnN0IGRvbUxvZ2dlciA9IG5ldyBFeHRlbnNpb25Mb2dnZXIoJ1tET00gU2NyaXB0XScpO1xuZXhwb3J0IGNvbnN0IGJnTG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW0JHXScpO1xuZXhwb3J0IGNvbnN0IHN0YXRzTG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW1N0YXRzXScpO1xuZXhwb3J0IGNvbnN0IG1zZ0xvZ2dlciA9IG5ldyBFeHRlbnNpb25Mb2dnZXIoJ1tNZXNzYWdlXScpO1xuZXhwb3J0IGNvbnN0IHBvc3RTZXJ2aWNlTG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW1Bvc3REYXRhU2VydmljZV0nKTtcbmV4cG9ydCBjb25zdCBzdGF0ZUxvZ2dlciA9IG5ldyBFeHRlbnNpb25Mb2dnZXIoJ1tBdXRvRmxvd1N0YXRlTWFuYWdlcl0nKTtcbmV4cG9ydCBjb25zdCBjb250ZW50TG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW0NvbnRlbnQgU2NyaXB0XScpO1xuZXhwb3J0IGNvbnN0IHN1Ym1pdExvZ2dlciA9IG5ldyBFeHRlbnNpb25Mb2dnZXIoJ1tTdWJtaXQgU2NyaXB0XScpO1xuXG4vLyBJbml0aWFsaXplIGRlYnVnIHNldHRpbmcgZm9yIGFsbCBsb2dnZXJzXG5jb25zdCBpbml0RGVidWdNb2RlID0gYXN5bmMgKCkgPT4ge1xuICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgZG9tTG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKCksXG4gICAgYmdMb2dnZXIuY2hlY2tEZWJ1Z1NldHRpbmcoKSxcbiAgICBzdGF0c0xvZ2dlci5jaGVja0RlYnVnU2V0dGluZygpLFxuICAgIG1zZ0xvZ2dlci5jaGVja0RlYnVnU2V0dGluZygpLFxuICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKCksXG4gICAgc3RhdGVMb2dnZXIuY2hlY2tEZWJ1Z1NldHRpbmcoKSxcbiAgICBjb250ZW50TG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKCksXG4gICAgc3VibWl0TG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKClcbiAgXSk7XG59O1xuXG4vLyBBdXRvLWluaXRpYWxpemVcbmluaXREZWJ1Z01vZGUoKTtcbiIsICJpbXBvcnQgeyBzdGF0c0xvZ2dlciB9IGZyb20gXCIuL2xvZ2dlci5qc1wiOy8vIFN0YXRzIENvbnRlbnQgU2NyaXB0IC0gSGFuZGxlcyBwcm9maWxlIGRldGVjdGlvbiBhbmQgZGF0YSBjb2xsZWN0aW9uXG4vLyBPbmx5IHJ1bnMgb24gcmVkZGl0LmNvbSBwYWdlcyAoZXhjbHVkaW5nIHN1Ym1pdCBwYWdlcylcblxuLy8gU2hhcmVkIHV0aWxpdHkgZnVuY3Rpb25zXG5mdW5jdGlvbiBxcyhzZWxlY3Rvcikge1xuICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcilcbn1cblxuZnVuY3Rpb24gcXNhKHNlbGVjdG9yKSB7XG4gIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxufVxuXG5mdW5jdGlvbiBzbGVlcChtcykge1xuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSlcbn1cblxuZnVuY3Rpb24gZGVlcFF1ZXJ5KHNlbGVjdG9yLCByb290ID0gZG9jdW1lbnQpIHtcbiAgcmV0dXJuIHJvb3QucXVlcnlTZWxlY3RvcihzZWxlY3Rvcilcbn1cblxuLy8gU3RvcmFnZSBmdW5jdGlvbnNcbmFzeW5jIGZ1bmN0aW9uIGdldFN0b3JlZFVzZXJuYW1lKCkge1xuICB0cnkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KFsncmVkZGl0VXNlciddKVxuICAgIHJldHVybiByZXN1bHQucmVkZGl0VXNlciB8fCBudWxsXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgc3RhdHNMb2dnZXIud2FybignRmFpbGVkIHRvIGdldCBzdG9yZWQgdXNlcm5hbWU6JywgZXJyb3IpXG4gICAgcmV0dXJuIG51bGxcbiAgfVxufVxuXG5cbmFzeW5jIGZ1bmN0aW9uIHN0b3JlUmVkZGl0UHJvZmlsZURhdGEodXNlcm5hbWUsIHBvc3RzRGF0YSkge1xuICB0cnkge1xuICAgIHN0YXRzTG9nZ2VyLmxvZyhgIFN0b3JpbmcgcHJvZmlsZSBkYXRhIGZvciAke3VzZXJuYW1lfSB3aXRoICR7cG9zdHNEYXRhLmxlbmd0aH0gcG9zdHNgKVxuXG4gICAgLy8gTG9nIHNhbXBsZSBvZiBwb3N0cyBkYXRhIGJlaW5nIHN0b3JlZFxuICAgIGlmIChwb3N0c0RhdGEubGVuZ3RoID4gMCkge1xuICAgICAgc3RhdHNMb2dnZXIubG9nKCcgU2FtcGxlIHBvc3QgZGF0YSBiZWluZyBzdG9yZWQ6Jywge1xuICAgICAgICB0aXRsZTogcG9zdHNEYXRhWzBdLnRpdGxlLFxuICAgICAgICBhdXRob3I6IHBvc3RzRGF0YVswXS5hdXRob3IsXG4gICAgICAgIHN1YnJlZGRpdDogcG9zdHNEYXRhWzBdLnN1YnJlZGRpdCxcbiAgICAgICAgc2NvcmU6IHBvc3RzRGF0YVswXS5zY29yZSxcbiAgICAgICAgY29tbWVudENvdW50OiBwb3N0c0RhdGFbMF0uY29tbWVudENvdW50LFxuICAgICAgICBpdGVtU3RhdGU6IHBvc3RzRGF0YVswXS5pdGVtU3RhdGVcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gU3RvcmUgcG9zdHMgZGF0YSBpbiB0aGUgZm9ybWF0IGV4cGVjdGVkIGJ5IHBvcHVwIGZvciBTdGF0dXMgcmVwb3J0XG4gICAgY29uc3Qgc3RvcmFnZURhdGEgPSB7XG4gICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICBwb3N0czogcG9zdHNEYXRhLFxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgdG90YWxQb3N0czogcG9zdHNEYXRhLmxlbmd0aFxuICAgIH1cblxuICAgIGF3YWl0IGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICBsYXRlc3RQb3N0c0RhdGE6IHN0b3JhZ2VEYXRhXG4gICAgfSlcblxuICAgIC8vIENyZWF0ZSBkZXJpdmVkIHVzZXJTdGF0dXMgZnJvbSBsYXRlc3RQb3N0c0RhdGEgZm9yIHBvcHVwIGNvbXBhdGliaWxpdHlcbiAgICBjb25zdCBkZXJpdmVkVXNlclN0YXR1cyA9IHtcbiAgICAgIHVzZXJOYW1lOiB1c2VybmFtZSxcbiAgICAgIGN1cnJlbnRVc2VyOiB1c2VybmFtZSxcbiAgICAgIHN0b3JlZFVzZXI6IHVzZXJuYW1lLFxuICAgICAgaXNNYXRjaDogdHJ1ZSxcbiAgICAgIGxhc3RDaGVjazogRGF0ZS5ub3coKSxcbiAgICAgIHRvdGFsUG9zdHM6IHBvc3RzRGF0YS5sZW5ndGgsXG4gICAgICBwb3N0c0NvdW50OiBwb3N0c0RhdGEubGVuZ3RoLFxuICAgICAgbGFzdFBvc3RUZXh0OiBwb3N0c0RhdGEubGVuZ3RoID4gMCA/IHBvc3RzRGF0YVswXS50aXRsZSB8fCAnUmVjZW50IHBvc3QnIDogJ05vIHBvc3RzJyxcbiAgICAgIGxhc3RQb3N0RGF0ZTogcG9zdHNEYXRhLmxlbmd0aCA+IDAgPyBwb3N0c0RhdGFbMF0udGltZXN0YW1wIHx8IERhdGUubm93KCkgOiBudWxsLFxuICAgICAgY3VycmVudFVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICBjb2xsZWN0aW5nUG9zdHNEYXRhOiBmYWxzZSxcbiAgICAgIGRhdGFGcmVzaDogdHJ1ZSxcbiAgICAgIC8vIEVuaGFuY2VkIG1ldGFkYXRhXG4gICAgICBsYXN0UG9zdFNjb3JlOiBwb3N0c0RhdGEubGVuZ3RoID4gMCA/IHBvc3RzRGF0YVswXS5zY29yZSB8fCAwIDogMCxcbiAgICAgIGxhc3RQb3N0Q29tbWVudHM6IHBvc3RzRGF0YS5sZW5ndGggPiAwID8gcG9zdHNEYXRhWzBdLmNvbW1lbnRDb3VudCB8fCAwIDogMCxcbiAgICAgIGxhc3RQb3N0U3VicmVkZGl0OiBwb3N0c0RhdGEubGVuZ3RoID4gMCA/IHBvc3RzRGF0YVswXS5zdWJyZWRkaXQgfHwgJ3Vua25vd24nIDogJ3Vua25vd24nLFxuICAgICAgbGFzdFBvc3RBdXRob3I6IHBvc3RzRGF0YS5sZW5ndGggPiAwID8gcG9zdHNEYXRhWzBdLmF1dGhvciB8fCAndW5rbm93bicgOiAndW5rbm93bidcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgYm90aCB1c2VyU3RhdHVzIGxvY2F0aW9ucyB0byBtYWludGFpbiBjb21wYXRpYmlsaXR5XG4gICAgYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgdXNlclN0YXR1czogZGVyaXZlZFVzZXJTdGF0dXMgfSlcbiAgICBhd2FpdCBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7IHVzZXJTdGF0dXM6IGRlcml2ZWRVc2VyU3RhdHVzIH0pXG5cbiAgICBzdGF0c0xvZ2dlci5sb2coYCBTdG9yZWQgcHJvZmlsZSBkYXRhIGZvciAke3VzZXJuYW1lfTogJHtwb3N0c0RhdGEubGVuZ3RofSBwb3N0c2ApXG4gICAgc3RhdHNMb2dnZXIubG9nKGAgVXBkYXRlZCBkZXJpdmVkIHVzZXJTdGF0dXMgd2l0aCBlbmhhbmNlZCBtZXRhZGF0YWApXG4gICAgc3RhdHNMb2dnZXIubG9nKCcgbGF0ZXN0UG9zdHNEYXRhIHN0cnVjdHVyZTonLCBzdG9yYWdlRGF0YSlcbiAgICBzdGF0c0xvZ2dlci5sb2coJyBkZXJpdmVkIHVzZXJTdGF0dXMgc3RydWN0dXJlOicsIGRlcml2ZWRVc2VyU3RhdHVzKVxuXG4gICAgLy8gTm90aWZ5IGJhY2tncm91bmQgc2NyaXB0XG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgdHlwZTogJ1BPU1RTX0RBVEFfVVBEQVRFRCcsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgICAgcG9zdHNDb3VudDogcG9zdHNEYXRhLmxlbmd0aCxcbiAgICAgICAgbGFzdFBvc3Q6IHBvc3RzRGF0YS5sZW5ndGggPiAwID8gcG9zdHNEYXRhWzBdIDogbnVsbFxuICAgICAgfVxuICAgIH0pXG5cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBzdGF0c0xvZ2dlci5lcnJvcignIEZhaWxlZCB0byBzdG9yZSBwcm9maWxlIGRhdGE6JywgZXJyb3IpXG4gIH1cbn1cblxuLy8gUHJvZmlsZSBkZXRlY3Rpb24gZnVuY3Rpb25zXG4vLyBDYWNoZSB2YXJpYWJsZXMgdG8gcHJldmVudCB1bm5lY2Vzc2FyeSByZS1leHRyYWN0aW9uc1xubGV0IGNhY2hlZFVzZXJuYW1lID0gbnVsbFxubGV0IGNhY2hlVGltZXN0YW1wID0gMFxuY29uc3QgQ0FDSEVfRFVSQVRJT04gPSA1ICogNjAgKiAxMDAwIC8vIDUgbWludXRlc1xuXG4vLyBJbml0aWFsaXplIGNhY2hlIGZyb20gc3RvcmFnZSBvbiBzY3JpcHQgbG9hZFxuYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZVVzZXJuYW1lQ2FjaGUoKSB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc3RvcmVkVXNlciA9IGF3YWl0IGdldFN0b3JlZFVzZXJuYW1lKClcbiAgICBpZiAoc3RvcmVkVXNlciAmJiBzdG9yZWRVc2VyLnNlcmVuX25hbWUpIHtcbiAgICAgIGNhY2hlZFVzZXJuYW1lID0gc3RvcmVkVXNlci5zZXJlbl9uYW1lXG4gICAgICBjYWNoZVRpbWVzdGFtcCA9IHN0b3JlZFVzZXIudGltZXN0YW1wIHx8IERhdGUubm93KClcbiAgICAgIHN0YXRzTG9nZ2VyLmxvZyhgU3RhdHM6IEluaXRpYWxpemVkIGNhY2hlIGZyb20gc3RvcmFnZTogJHtjYWNoZWRVc2VybmFtZX1gKVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBzdGF0c0xvZ2dlci53YXJuKCdTdGF0czogRmFpbGVkIHRvIGluaXRpYWxpemUgdXNlcm5hbWUgY2FjaGU6JywgZXJyb3IpXG4gIH1cbn1cblxuLy8gR2V0IGF1dGhlbnRpY2F0ZWQgdXNlcm5hbWUgZnJvbSB1c2VyIGRyb3Bkb3duL2F2YXRhciAoc2hvd3MgWU9VUiB1c2VybmFtZSlcbmZ1bmN0aW9uIGdldEF1dGhlbnRpY2F0ZWRVc2VybmFtZSgpIHtcbiAgLy8gQ2hlY2sgY2FjaGUgZmlyc3RcbiAgaWYgKGNhY2hlZFVzZXJuYW1lICYmIERhdGUubm93KCkgLSBjYWNoZVRpbWVzdGFtcCA8IENBQ0hFX0RVUkFUSU9OKSB7XG4gICAgc3RhdHNMb2dnZXIubG9nKGBTdGF0czogVXNpbmcgY2FjaGVkIGF1dGhlbnRpY2F0ZWQgdXNlcm5hbWU6ICR7Y2FjaGVkVXNlcm5hbWV9YClcbiAgICByZXR1cm4gY2FjaGVkVXNlcm5hbWVcbiAgfVxuXG4gIC8vIFRyeSB0byBnZXQgdXNlcm5hbWUgZnJvbSB1c2VyIGRyb3Bkb3duIHdpdGhvdXQgb3BlbmluZyBpdFxuICBjb25zdCBhdXRoU2VsZWN0b3JzID0gW1xuICAgICdidXR0b25baWQqPVwidXNlci1kcm9wZG93blwiXSBbY2xhc3MqPVwidGV4dC0xMlwiXScsXG4gICAgJ1tkYXRhLXRlc3RpZD1cInVzZXItbWVudS10cmlnZ2VyXCJdIHNwYW5bY2xhc3MqPVwidGV4dC0xMlwiXScsXG4gICAgJy5oZWFkZXItdXNlci1kcm9wZG93biBbY2xhc3MqPVwidGV4dC0xMlwiXScsXG4gICAgJ2J1dHRvblthcmlhLWxhYmVsKj1cIlVzZXJcIl0gc3BhbltjbGFzcyo9XCJ0ZXh0LTEyXCJdJ1xuICBdXG5cbiAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBhdXRoU2VsZWN0b3JzKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IHFzKHNlbGVjdG9yKVxuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICBjb25zdCB0ZXh0ID0gZWxlbWVudC50ZXh0Q29udGVudD8udHJpbSgpXG4gICAgICBpZiAodGV4dCAmJiB0ZXh0LnN0YXJ0c1dpdGgoJ3UvJykpIHtcbiAgICAgICAgLy8gVXBkYXRlIGNhY2hlXG4gICAgICAgIGNhY2hlZFVzZXJuYW1lID0gdGV4dFxuICAgICAgICBjYWNoZVRpbWVzdGFtcCA9IERhdGUubm93KClcbiAgICAgICAgcmV0dXJuIHRleHRcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBJZiBub3QgZm91bmQsIHRyeSBleGlzdGluZyBkcm9wZG93biBkZXRlY3Rpb24gYXMgZmFsbGJhY2tcbiAgY29uc3QgZHJvcGRvd25CdXR0b24gPSBxcygnYnV0dG9uW2FyaWEtbGFiZWwqPVwidXNlclwiXSwgW2RhdGEtdGVzdGlkPVwidXNlci1hdmF0YXJcIl0sICNleHBhbmQtdXNlci1kcmF3ZXItYnV0dG9uJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICBxcygnYnV0dG9uW2FyaWEtbGFiZWwqPVwidS9cIl0nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgIHFzKCdbZGF0YS10ZXN0aWQ9XCJ1c2VyLWRyb3Bkb3duLWJ1dHRvblwiXScpXG5cbiAgaWYgKGRyb3Bkb3duQnV0dG9uKSB7XG4gICAgY29uc3QgYXJpYUxhYmVsID0gZHJvcGRvd25CdXR0b24uZ2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJylcbiAgICBpZiAoYXJpYUxhYmVsKSB7XG4gICAgICBjb25zdCBsYWJlbE1hdGNoID0gYXJpYUxhYmVsLm1hdGNoKC91XFwvKFteXFxzXSspLylcbiAgICAgIGlmIChsYWJlbE1hdGNoKSB7XG4gICAgICAgIGNvbnN0IHVzZXJuYW1lID0gYHUvJHtsYWJlbE1hdGNoWzFdfWBcbiAgICAgICAgY2FjaGVkVXNlcm5hbWUgPSB1c2VybmFtZVxuICAgICAgICBjYWNoZVRpbWVzdGFtcCA9IERhdGUubm93KClcbiAgICAgICAgcmV0dXJuIHVzZXJuYW1lXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgYnV0dG9uVGV4dCA9IGRyb3Bkb3duQnV0dG9uLnRleHRDb250ZW50Py50cmltKClcbiAgICBpZiAoYnV0dG9uVGV4dCAmJiBidXR0b25UZXh0LnN0YXJ0c1dpdGgoJ3UvJykpIHtcbiAgICAgIGNhY2hlZFVzZXJuYW1lID0gYnV0dG9uVGV4dFxuICAgICAgY2FjaGVUaW1lc3RhbXAgPSBEYXRlLm5vdygpXG4gICAgICByZXR1cm4gYnV0dG9uVGV4dFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsXG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RVc2VybmFtZUZyb21QYWdlKCkge1xuICBzdGF0c0xvZ2dlci5sb2coJ1N0YXRzOiBFeHRyYWN0aW5nIHVzZXJuYW1lIGZyb20gY3VycmVudCBwYWdlIHdpdGggYXV0aGVudGljYXRlZCBwcmlvcml0eS4uLicpXG5cbiAgLy8gTWV0aG9kIDE6IFByaW9yaXRpemUgYXV0aGVudGljYXRlZCB1c2VyIGRldGVjdGlvbiAobWFrZSBpdCBzeW5jIGZvciBjb21wYXRpYmlsaXR5KVxuICBjb25zdCBhdXRoVXNlcm5hbWUgPSBnZXRBdXRoZW50aWNhdGVkVXNlcm5hbWUoKVxuICBpZiAoYXV0aFVzZXJuYW1lKSB7XG4gICAgc3RhdHNMb2dnZXIubG9nKGBTdGF0czogRm91bmQgYXV0aGVudGljYXRlZCB1c2VybmFtZTogJHthdXRoVXNlcm5hbWV9YClcbiAgICByZXR1cm4gYXV0aFVzZXJuYW1lLnJlcGxhY2UoJ3UvJywgJycpXG4gIH1cblxuICAvLyBNZXRob2QgMjogT25seSBjaGVjayBVUkwgaWYgd2UncmUgb24gb3VyIG93biBwcm9maWxlIHBhZ2VcbiAgY29uc3QgdXJsTWF0Y2ggPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCgvcmVkZGl0XFwuY29tXFwvdVxcLyhbXlxcL10rKS8pIHx8XG4gICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2goL3JlZGRpdFxcLmNvbVxcL3VzZXJcXC8oW15cXC9dKykvKVxuICBpZiAodXJsTWF0Y2ggJiYgdXJsTWF0Y2hbMV0gIT09ICdhZG9iZScpIHsgLy8gRmlsdGVyIG91dCBvYnZpb3VzIHdyb25nIHVzZXJuYW1lc1xuICAgIHN0YXRzTG9nZ2VyLmxvZygnU3RhdHM6IEZvdW5kIHVzZXJuYW1lIGluIFVSTDonLCB1cmxNYXRjaFsxXSlcbiAgICByZXR1cm4gdXJsTWF0Y2hbMV1cbiAgfVxuXG4gIC8vIE1ldGhvZCAzOiBHZW5lcmljIHBhZ2UgZWxlbWVudCBzY2FubmluZyBhcyBmaW5hbCBmYWxsYmFjayAod2l0aCBmaWx0ZXJpbmcpXG4gIGNvbnN0IHVzZXJuYW1lRWxlbWVudCA9IHFzKCdbZGF0YS10ZXN0aWQ9XCJ1c2VybmFtZVwiXSwgLnVzZXJuYW1lLCBbaHJlZio9XCIvdS9cIl0nKVxuICBpZiAodXNlcm5hbWVFbGVtZW50KSB7XG4gICAgY29uc3QgdXNlcm5hbWUgPSB1c2VybmFtZUVsZW1lbnQudGV4dENvbnRlbnQ/LnRyaW0oKSB8fFxuICAgICAgICAgICAgICAgICAgICB1c2VybmFtZUVsZW1lbnQuaHJlZj8ubWF0Y2goL1xcL3VcXC8oW15cXC9dKykvKT8uWzFdXG4gICAgaWYgKHVzZXJuYW1lICYmIHVzZXJuYW1lLnN0YXJ0c1dpdGgoJ3UvJykpIHtcbiAgICAgIGNvbnN0IGNsZWFuVXNlcm5hbWUgPSB1c2VybmFtZS5yZXBsYWNlKCd1LycsICcnKVxuICAgICAgLy8gRmlsdGVyIG91dCBvYnZpb3VzIGNvcnBvcmF0ZS9icmFuZCB1c2VybmFtZXMgdGhhdCBhcmVuJ3QgcmVhbCB1c2Vyc1xuICAgICAgaWYgKGNsZWFuVXNlcm5hbWUgIT09ICdhZG9iZScgJiYgY2xlYW5Vc2VybmFtZS5sZW5ndGggPiAyICYmICFjbGVhblVzZXJuYW1lLm1hdGNoKC9eW2Etel0rJC8pKSB7XG4gICAgICAgIHN0YXRzTG9nZ2VyLmxvZygnU3RhdHM6IEZvdW5kIHVzZXJuYW1lIGluIGVsZW1lbnQgZmFsbGJhY2s6JywgY2xlYW5Vc2VybmFtZSlcbiAgICAgICAgcmV0dXJuIGNsZWFuVXNlcm5hbWVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdGF0c0xvZ2dlci5sb2coJ1N0YXRzOiBObyBhdXRoZW50aWNhdGVkIHVzZXJuYW1lIGZvdW5kLCByZXR1cm5pbmcgbnVsbCB0byBhdm9pZCB3cm9uZyB1c2VyIGRldGVjdGlvbicpXG4gIHJldHVybiBudWxsXG59XG5cbmFzeW5jIGZ1bmN0aW9uIG5hdmlnYXRlVG9Vc2VyUG9zdHModXNlcm5hbWUpIHtcbiAgc3RhdHNMb2dnZXIubG9nKCdOYXZpZ2F0aW5nIHRvIHVzZXIgcG9zdHMgcGFnZSBmb3I6JywgdXNlcm5hbWUpXG5cbiAgY29uc3QgcG9zdHNVcmwgPSBgaHR0cHM6Ly93d3cucmVkZGl0LmNvbS91LyR7dXNlcm5hbWV9L3N1Ym1pdHRlZC9gXG5cbiAgLy8gU2V0IHNlc3Npb25TdG9yYWdlIGZsYWcgdG8gdHJhY2sgbmF2aWdhdGlvbiBzdGF0ZSB3aXRoIHRpbWVzdGFtcFxuICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdyZWRkaXQtcG9zdC1tYWNoaW5lLXNjcmlwdC1zdGFnZScsICdwcm9maWxlLXN3aXRjaGluZy10by1wb3N0cycpXG4gIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtc2NyaXB0LXN0YWdlLXRpbWVzdGFtcCcsIERhdGUubm93KCkudG9TdHJpbmcoKSlcblxuICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHBvc3RzVXJsXG4gIGF3YWl0IHdhaXRGb3JDb25kaXRpb24oKCkgPT4gd2luZG93LmxvY2F0aW9uLmhyZWYgPT09IHBvc3RzVXJsLCA1MDAwKVxufVxuXG5hc3luYyBmdW5jdGlvbiB3YWl0Rm9yQ29uZGl0aW9uKGNvbmRpdGlvbiwgdGltZW91dCA9IDUwMDApIHtcbiAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKVxuXG4gIHdoaWxlIChEYXRlLm5vdygpIC0gc3RhcnRUaW1lIDwgdGltZW91dCkge1xuICAgIGlmIChjb25kaXRpb24oKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgYXdhaXQgc2xlZXAoMTAwKVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuLy8gRm9jdXNlZCBmdW5jdGlvbiB0byBleHRyYWN0IGRhdGEgZnJvbSBmb3VuZCBzaHJlZGRpdC1wb3N0IGVsZW1lbnRzXG5mdW5jdGlvbiBleHRyYWN0UG9zdERhdGFGcm9tU2hyZWRkaXRQb3N0cyhzaHJlZGRpdFBvc3RzKSB7XG4gIHN0YXRzTG9nZ2VyLmxvZyhgXHVEODNEXHVERDBEIEV4dHJhY3RpbmcgZW5oYW5jZWQgZGF0YSBmcm9tICR7c2hyZWRkaXRQb3N0cy5sZW5ndGh9IHNocmVkZGl0LXBvc3QgZWxlbWVudHMuLi5gKVxuXG4gIGNvbnN0IHBvc3RzID0gW11cblxuICBzaHJlZGRpdFBvc3RzLmZvckVhY2goKHBvc3QsIGluZGV4KSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIHN0YXRzTG9nZ2VyLmxvZyhgXFxuLS0tIFByb2Nlc3NpbmcgcG9zdCAke2luZGV4ICsgMX06ICR7cG9zdC5pZH0gLS0tYClcblxuICAgICAgbGV0IHNlYXJjaFJvb3QgPSBwb3N0XG5cbiAgICAgIC8vIENoZWNrIGlmIHBvc3QgaGFzIHNoYWRvdyByb290XG4gICAgICBpZiAocG9zdC5zaGFkb3dSb290KSB7XG4gICAgICAgIHN0YXRzTG9nZ2VyLmxvZyhgXHVEODNDXHVERjExIFBvc3QgJHtwb3N0LmlkfSBoYXMgc2hhZG93IHJvb3RgKVxuICAgICAgICBzZWFyY2hSb290ID0gcG9zdC5zaGFkb3dSb290XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0c0xvZ2dlci5sb2coYFx1RDgzRFx1RENDNCBQb3N0ICR7cG9zdC5pZH0gdXNlcyBub3JtYWwgRE9NYClcbiAgICAgIH1cblxuICAgICAgLy8gRXh0cmFjdCBkYXRhIGF0dHJpYnV0ZXMgZnJvbSBzaHJlZGRpdC1wb3N0IGVsZW1lbnQgKHByaW1hcnkgc291cmNlKVxuICAgICAgY29uc3QgcG9zdEF0dHJpYnV0ZXMgPSB7XG4gICAgICAgIHBvc3RUaXRsZTogcG9zdC5nZXRBdHRyaWJ1dGUoJ3Bvc3QtdGl0bGUnKSxcbiAgICAgICAgYXV0aG9yOiBwb3N0LmdldEF0dHJpYnV0ZSgnYXV0aG9yJyksXG4gICAgICAgIHN1YnJlZGRpdFByZWZpeGVkTmFtZTogcG9zdC5nZXRBdHRyaWJ1dGUoJ3N1YnJlZGRpdC1wcmVmaXhlZC1uYW1lJyksXG4gICAgICAgIHNjb3JlOiBwb3N0LmdldEF0dHJpYnV0ZSgnc2NvcmUnKSxcbiAgICAgICAgY29tbWVudENvdW50OiBwb3N0LmdldEF0dHJpYnV0ZSgnY29tbWVudC1jb3VudCcpLFxuICAgICAgICBjcmVhdGVkVGltZXN0YW1wOiBwb3N0LmdldEF0dHJpYnV0ZSgnY3JlYXRlZC10aW1lc3RhbXAnKSxcbiAgICAgICAgcG9zdFR5cGU6IHBvc3QuZ2V0QXR0cmlidXRlKCdwb3N0LXR5cGUnKSxcbiAgICAgICAgY29udGVudEhyZWY6IHBvc3QuZ2V0QXR0cmlidXRlKCdjb250ZW50LWhyZWYnKSxcbiAgICAgICAgcGVybWFsaW5rOiBwb3N0LmdldEF0dHJpYnV0ZSgncGVybWFsaW5rJyksXG4gICAgICAgIHBvc3RJZDogcG9zdC5nZXRBdHRyaWJ1dGUoJ2lkJyksXG4gICAgICAgIGRvbWFpbjogcG9zdC5nZXRBdHRyaWJ1dGUoJ2RvbWFpbicpLFxuICAgICAgICBpdGVtU3RhdGU6IHBvc3QuZ2V0QXR0cmlidXRlKCdpdGVtLXN0YXRlJyksXG4gICAgICAgIHZpZXdDb250ZXh0OiBwb3N0LmdldEF0dHJpYnV0ZSgndmlldy1jb250ZXh0JyksXG4gICAgICAgIHZvdGVUeXBlOiBwb3N0LmdldEF0dHJpYnV0ZSgndm90ZS10eXBlJyksXG4gICAgICAgIGF3YXJkQ291bnQ6IHBvc3QuZ2V0QXR0cmlidXRlKCdhd2FyZC1jb3VudCcpLFxuICAgICAgICB1c2VySWQ6IHBvc3QuZ2V0QXR0cmlidXRlKCd1c2VyLWlkJyksXG4gICAgICAgIGF1dGhvcklkOiBwb3N0LmdldEF0dHJpYnV0ZSgnYXV0aG9yLWlkJyksXG4gICAgICAgIHN1YnJlZGRpdElkOiBwb3N0LmdldEF0dHJpYnV0ZSgnc3VicmVkZGl0LWlkJylcbiAgICAgIH1cblxuICAgICAgLy8gTWV0aG9kIDE6IExvb2sgZm9yIHRpdGxlIGluIHNoYWRvdyByb290IGZpcnN0IC0gcHJpb3JpdGl6ZSBzcGVjaWZpYyB0aXRsZSBzZWxlY3RvcnNcbiAgICAgIGxldCB0aXRsZUVsZW1lbnQgPSBzZWFyY2hSb290LnF1ZXJ5U2VsZWN0b3IoJ2Fbc2xvdD1cInRpdGxlXCJdJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaFJvb3QucXVlcnlTZWxlY3RvcignYVtpZCo9XCJwb3N0LXRpdGxlXCJdJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaFJvb3QucXVlcnlTZWxlY3RvcignW2RhdGEtdGVzdGlkPVwicG9zdC10aXRsZVwiXScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hSb290LnF1ZXJ5U2VsZWN0b3IoJ2gzJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaFJvb3QucXVlcnlTZWxlY3RvcignYVtocmVmKj1cIi9jb21tZW50cy9cIl06bm90KFtuYW1lPVwiY29tbWVudHMtYWN0aW9uLWJ1dHRvblwiXSknKVxuXG4gICAgICAvLyBNZXRob2QgMjogSWYgbm90IGZvdW5kIGluIHNoYWRvdyByb290LCBjaGVjayB0aGUgbWFpbiBwb3N0IGVsZW1lbnRcbiAgICAgIGlmICghdGl0bGVFbGVtZW50KSB7XG4gICAgICAgIHRpdGxlRWxlbWVudCA9IHBvc3QucXVlcnlTZWxlY3RvcignYVtzbG90PVwidGl0bGVcIl0nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgIHBvc3QucXVlcnlTZWxlY3RvcignYVtpZCo9XCJwb3N0LXRpdGxlXCJdJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICBwb3N0LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXRlc3RpZD1cInBvc3QtdGl0bGVcIl0nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgIHBvc3QucXVlcnlTZWxlY3RvcignaDMnKSB8fFxuICAgICAgICAgICAgICAgICAgICAgIHBvc3QucXVlcnlTZWxlY3RvcignYVtocmVmKj1cIi9jb21tZW50cy9cIl06bm90KFtuYW1lPVwiY29tbWVudHMtYWN0aW9uLWJ1dHRvblwiXSknKVxuICAgICAgfVxuXG4gICAgICAvLyBNZXRob2QgMzogVXNlIHRoZSBzcGVjaWZpYyBJRCBwYXR0ZXJuIGZvciB0aGUgZXhhY3QgdGl0bGUgZWxlbWVudFxuICAgICAgaWYgKCF0aXRsZUVsZW1lbnQgJiYgcG9zdC5pZCkge1xuICAgICAgICB0aXRsZUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBhW2lkPVwicG9zdC10aXRsZS0ke3Bvc3QuaWR9XCJdYCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtwb3N0LmlkfSBhW3Nsb3Q9XCJ0aXRsZVwiXWApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7cG9zdC5pZH0gW2RhdGEtdGVzdGlkPVwicG9zdC10aXRsZVwiXWApXG4gICAgICB9XG5cbiAgICAgIC8vIE1ldGhvZCA0OiBUcnkgbW9yZSBzcGVjaWZpYyBzZWxlY3RvcnMgZm9yIFJlZGRpdCdzIG5ldyBzdHJ1Y3R1cmVcbiAgICAgIGlmICghdGl0bGVFbGVtZW50ICYmIHBvc3QuaWQpIHtcbiAgICAgICAgdGl0bGVFbGVtZW50ID0gc2VhcmNoUm9vdC5xdWVyeVNlbGVjdG9yKGBhW2lkKj1cInBvc3QtdGl0bGUtJHtwb3N0LmlkfVwiXWApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgcG9zdC5xdWVyeVNlbGVjdG9yKGBhW2lkKj1cInBvc3QtdGl0bGUtJHtwb3N0LmlkfVwiXWApXG4gICAgICB9XG5cbiAgICAgIHN0YXRzTG9nZ2VyLmxvZyhgXHVEODNEXHVERDBEIFRpdGxlIGVsZW1lbnQgZm9yICR7cG9zdC5pZH06YCwgdGl0bGVFbGVtZW50KVxuICAgICAgaWYgKHRpdGxlRWxlbWVudCkge1xuICAgICAgICBzdGF0c0xvZ2dlci5sb2coYFx1RDgzRFx1REQwRCBUaXRsZSBlbGVtZW50IHRhZzpgLCB0aXRsZUVsZW1lbnQudGFnTmFtZSlcbiAgICAgICAgc3RhdHNMb2dnZXIubG9nKGBcdUQ4M0RcdUREMEQgVGl0bGUgZWxlbWVudCBjbGFzc2VzOmAsIHRpdGxlRWxlbWVudC5jbGFzc05hbWUpXG4gICAgICAgIHN0YXRzTG9nZ2VyLmxvZyhgXHVEODNEXHVERDBEIFRpdGxlIGVsZW1lbnQgSUQ6YCwgdGl0bGVFbGVtZW50LmlkKVxuICAgICAgfVxuXG4gICAgICAvLyBNZXRob2QgNTogTG9vayBmb3IgYW55IGxpbmsgd2l0aCBjb250ZW50XG4gICAgICBpZiAoIXRpdGxlRWxlbWVudCkge1xuICAgICAgICBjb25zdCBhbGxMaW5rcyA9IHBvc3QucXVlcnlTZWxlY3RvckFsbCgnYScpXG4gICAgICAgIGZvciAoY29uc3QgbGluayBvZiBhbGxMaW5rcykge1xuICAgICAgICAgIGlmIChsaW5rLnRleHRDb250ZW50Py50cmltKCkubGVuZ3RoID4gNSkge1xuICAgICAgICAgICAgdGl0bGVFbGVtZW50ID0gbGlua1xuICAgICAgICAgICAgc3RhdHNMb2dnZXIubG9nKGBcdUQ4M0RcdUREMTcgRm91bmQgdGl0bGUgaW4gZmFsbGJhY2sgbGluazogJHtsaW5rLnRleHRDb250ZW50Py50cmltKCkuc3Vic3RyaW5nKDAsIDMwKX0uLi5gKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gRXh0cmFjdCBzY29yZSB3aXRoIG11bHRpcGxlIG1ldGhvZHMsIHByaW9yaXRpemUgSFRNTCBhdHRyaWJ1dGVzXG4gICAgICBsZXQgc2NvcmUgPSBwb3N0QXR0cmlidXRlcy5zY29yZSB8fCAnMCdcbiAgICAgIGlmICghcG9zdEF0dHJpYnV0ZXMuc2NvcmUpIHtcbiAgICAgICAgY29uc3Qgc2NvcmVFbGVtZW50ID0gc2VhcmNoUm9vdC5xdWVyeVNlbGVjdG9yKCdmYWNlcGxhdGUtbnVtYmVyJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoUm9vdC5xdWVyeVNlbGVjdG9yKCdbZGF0YS10ZXN0aWQ9XCJwb3N0LXZvdGUtc2NvcmVcIl0nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hSb290LnF1ZXJ5U2VsZWN0b3IoJy5zY29yZScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaFJvb3QucXVlcnlTZWxlY3RvcignW3Nsb3Q9XCJ2b3RlLXNjb3JlXCJdJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdC5xdWVyeVNlbGVjdG9yKCdmYWNlcGxhdGUtbnVtYmVyJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdC5xdWVyeVNlbGVjdG9yKCdbZGF0YS10ZXN0aWQ9XCJwb3N0LXZvdGUtc2NvcmVcIl0nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0LnF1ZXJ5U2VsZWN0b3IoJy5zY29yZScpXG4gICAgICAgIHNjb3JlID0gc2NvcmVFbGVtZW50Py50ZXh0Q29udGVudD8udHJpbSgpIHx8ICcwJ1xuICAgICAgfVxuXG4gICAgICAvLyBFeHRyYWN0IGNvbW1lbnRzIHdpdGggbXVsdGlwbGUgbWV0aG9kcywgcHJpb3JpdGl6ZSBIVE1MIGF0dHJpYnV0ZXNcbiAgICAgIGxldCBjb21tZW50cyA9IHBvc3RBdHRyaWJ1dGVzLmNvbW1lbnRDb3VudCB8fCAnMCdcbiAgICAgIGlmICghcG9zdEF0dHJpYnV0ZXMuY29tbWVudENvdW50KSB7XG4gICAgICAgIGNvbnN0IGNvbW1lbnRzRWxlbWVudCA9IHNlYXJjaFJvb3QucXVlcnlTZWxlY3RvcignYVtocmVmKj1cIi9jb21tZW50cy9cIl0gc3BhbicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaFJvb3QucXVlcnlTZWxlY3RvcignW2RhdGEtdGVzdGlkPVwiY29tbWVudC1jb3VudFwiXScpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaFJvb3QucXVlcnlTZWxlY3RvcignW3Nsb3Q9XCJjb21tZW50LWNvdW50XCJdJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdC5xdWVyeVNlbGVjdG9yKCdhW2hyZWYqPVwiL2NvbW1lbnRzL1wiXSBzcGFuJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdC5xdWVyeVNlbGVjdG9yKCdbZGF0YS10ZXN0aWQ9XCJjb21tZW50LWNvdW50XCJdJylcbiAgICAgICAgY29tbWVudHMgPSBjb21tZW50c0VsZW1lbnQ/LnRleHRDb250ZW50Py50cmltKCkgfHwgJzAnXG4gICAgICB9XG5cbiAgICAgIC8vIEV4dHJhY3QgVVJMLCBwcmlvcml0aXplIEhUTUwgYXR0cmlidXRlc1xuICAgICAgY29uc3QgcG9zdFVybCA9IHBvc3RBdHRyaWJ1dGVzLnBlcm1hbGluayB8fFxuICAgICAgICAgICAgICAgICAgICAgKHNlYXJjaFJvb3QucXVlcnlTZWxlY3RvcignYVtocmVmKj1cIi9jb21tZW50cy9cIl0nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaFJvb3QucXVlcnlTZWxlY3RvcignYVtzbG90PVwiZnVsbC1wb3N0LWxpbmtcIl0nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgIHBvc3QucXVlcnlTZWxlY3RvcignYVtocmVmKj1cIi9jb21tZW50cy9cIl0nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgIHBvc3QucXVlcnlTZWxlY3RvcignYVtzbG90PVwiZnVsbC1wb3N0LWxpbmtcIl0nKSk/LmhyZWYgfHwgJydcblxuICAgICAgY29uc3QgdGl0bGUgPSBwb3N0QXR0cmlidXRlcy5wb3N0VGl0bGUgfHwgdGl0bGVFbGVtZW50Py50ZXh0Q29udGVudD8udHJpbSgpIHx8ICdObyB0aXRsZSdcbiAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IHBvc3RBdHRyaWJ1dGVzLmNyZWF0ZWRUaW1lc3RhbXAgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgKHNlYXJjaFJvb3QucXVlcnlTZWxlY3RvcigndGltZScpPy5nZXRBdHRyaWJ1dGUoJ2RhdGV0aW1lJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3QucXVlcnlTZWxlY3RvcigndGltZScpPy5nZXRBdHRyaWJ1dGUoJ2RhdGV0aW1lJykgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpKVxuXG4gICAgICAvLyBFbmhhbmNlZCBwb3N0IGRhdGEgb2JqZWN0IHdpdGggYWxsIG1ldGFkYXRhXG4gICAgICBjb25zdCBwb3N0RGF0YSA9IHtcbiAgICAgICAgLy8gQ29yZSBpZGVudGlmaWVycyAoYXV0b2Zsb3cgY29tcGF0aWJsZSlcbiAgICAgICAgZWxlbWVudElkOiBwb3N0LmlkIHx8IHBvc3RBdHRyaWJ1dGVzLnBvc3RJZCB8fCAnJywgIC8vIFN0b3JlIElEIGluc3RlYWQgb2YgRE9NIGVsZW1lbnRcbiAgICAgICAgZWxlbWVudDogeyAgLy8gS2VlcCBlbXB0eSBvYmplY3QgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG4gICAgICAgICAgaWQ6IHBvc3QuaWQgfHwgcG9zdEF0dHJpYnV0ZXMucG9zdElkIHx8ICcnLFxuICAgICAgICAgIHRhZ05hbWU6IHBvc3QudGFnTmFtZSB8fCAnc2hyZWRkaXQtcG9zdCdcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8vIENvcmUgaWRlbnRpZmllcnNcbiAgICAgICAgaWQ6IHBvc3QuaWQgfHwgcG9zdEF0dHJpYnV0ZXMucG9zdElkIHx8ICcnLFxuICAgICAgICB0aXRsZTogdGl0bGUsXG4gICAgICAgIHVybDogcG9zdFVybCxcbiAgICAgICAgdGltZXN0YW1wOiB0aW1lc3RhbXAsXG5cbiAgICAgICAgLy8gQXV0aG9yIGFuZCBzdWJyZWRkaXQgaW5mb3JtYXRpb25cbiAgICAgICAgYXV0aG9yOiBwb3N0QXR0cmlidXRlcy5hdXRob3IgfHwgJycsXG4gICAgICAgIHN1YnJlZGRpdDogcG9zdEF0dHJpYnV0ZXMuc3VicmVkZGl0UHJlZml4ZWROYW1lIHx8ICcnLFxuICAgICAgICBhdXRob3JJZDogcG9zdEF0dHJpYnV0ZXMuYXV0aG9ySWQgfHwgJycsXG4gICAgICAgIHN1YnJlZGRpdElkOiBwb3N0QXR0cmlidXRlcy5zdWJyZWRkaXRJZCB8fCAnJyxcblxuICAgICAgICAvLyBFbmdhZ2VtZW50IG1ldHJpY3NcbiAgICAgICAgc2NvcmU6IHBhcnNlSW50KHNjb3JlKSB8fCAwLFxuICAgICAgICBjb21tZW50Q291bnQ6IHBhcnNlSW50KGNvbW1lbnRzKSB8fCAwLFxuICAgICAgICBhd2FyZENvdW50OiBwYXJzZUludChwb3N0QXR0cmlidXRlcy5hd2FyZENvdW50KSB8fCAwLFxuXG4gICAgICAgIC8vIFBvc3QgY29udGVudCBpbmZvcm1hdGlvblxuICAgICAgICBwb3N0VHlwZTogcG9zdEF0dHJpYnV0ZXMucG9zdFR5cGUgfHwgJycsXG4gICAgICAgIGRvbWFpbjogcG9zdEF0dHJpYnV0ZXMuZG9tYWluIHx8ICcnLFxuICAgICAgICBjb250ZW50SHJlZjogcG9zdEF0dHJpYnV0ZXMuY29udGVudEhyZWYgfHwgJycsXG5cbiAgICAgICAgLy8gU3RhdHVzIGFuZCBtb2RlcmF0aW9uXG4gICAgICAgIGl0ZW1TdGF0ZTogcG9zdEF0dHJpYnV0ZXMuaXRlbVN0YXRlIHx8ICcnLFxuICAgICAgICB2aWV3Q29udGV4dDogcG9zdEF0dHJpYnV0ZXMudmlld0NvbnRleHQgfHwgJycsXG4gICAgICAgIHZvdGVUeXBlOiBwb3N0QXR0cmlidXRlcy52b3RlVHlwZSB8fCAnJyxcblxuICAgICAgICAvLyBFbmhhbmNlZCBtb2RlcmF0aW9uIGRldGVjdGlvbiAoYXV0b2Zsb3cgY29tcGF0aWJsZSlcbiAgICAgICAgbW9kZXJhdGlvblN0YXR1czoge1xuICAgICAgICAgIGlzUmVtb3ZlZDogcG9zdC50ZXh0Q29udGVudD8uaW5jbHVkZXMoJ3JlbW92ZWQgYnkgdGhlIG1vZGVyYXRvcnMnKSB8fFxuICAgICAgICAgICAgICAgICAgICBwb3N0LnF1ZXJ5U2VsZWN0b3IoJ1tpY29uLW5hbWU9XCJyZW1vdmVcIl0nKSAhPT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgICAgICBwb3N0QXR0cmlidXRlcy5pdGVtU3RhdGUgPT09ICdtb2RlcmF0b3JfcmVtb3ZlZCcgfHwgZmFsc2UsXG4gICAgICAgICAgaXNMb2NrZWQ6IHBvc3QucXVlcnlTZWxlY3RvcignW2ljb24tbmFtZT1cImxvY2stZmlsbFwiXScpICE9PSBudWxsIHx8XG4gICAgICAgICAgICAgICAgICAgcG9zdEF0dHJpYnV0ZXMuaXRlbVN0YXRlID09PSAnbG9ja2VkJyB8fCBmYWxzZSxcbiAgICAgICAgICBpc0RlbGV0ZWQ6IHBvc3QudGV4dENvbnRlbnQ/LmluY2x1ZGVzKCdkZWxldGVkIGJ5IHRoZSB1c2VyJykgfHxcbiAgICAgICAgICAgICAgICAgICAgcG9zdC5xdWVyeVNlbGVjdG9yKCdbaWNvbi1uYW1lPVwiZGVsZXRlXCJdJykgIT09IG51bGwgfHxcbiAgICAgICAgICAgICAgICAgICAgcG9zdEF0dHJpYnV0ZXMuaXRlbVN0YXRlID09PSAnZGVsZXRlZCcgfHwgZmFsc2UsXG4gICAgICAgICAgaXNTcGFtOiBwb3N0QXR0cmlidXRlcy5pdGVtU3RhdGUgPT09ICdzcGFtJyB8fCBmYWxzZSxcbiAgICAgICAgICBpdGVtU3RhdGU6IHBvc3RBdHRyaWJ1dGVzLml0ZW1TdGF0ZSB8fCAnJyxcbiAgICAgICAgICB2aWV3Q29udGV4dDogcG9zdEF0dHJpYnV0ZXMudmlld0NvbnRleHQgfHwgJycsXG4gICAgICAgICAgdm90ZVR5cGU6IHBvc3RBdHRyaWJ1dGVzLnZvdGVUeXBlIHx8ICcnXG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gQWRkaXRpb25hbCBtZXRhZGF0YVxuICAgICAgICB1c2VySWQ6IHBvc3RBdHRyaWJ1dGVzLnVzZXJJZCB8fCAnJyxcbiAgICAgICAgcGVybWFsaW5rOiBwb3N0QXR0cmlidXRlcy5wZXJtYWxpbmsgfHwgJycsXG4gICAgICAgIGNyZWF0ZWRUaW1lc3RhbXA6IHBvc3RBdHRyaWJ1dGVzLmNyZWF0ZWRUaW1lc3RhbXAgfHwgdGltZXN0YW1wXG4gICAgICB9XG5cbiAgICAgIHN0YXRzTG9nZ2VyLmxvZyhgXHVEODNEXHVEQ0NBIEVuaGFuY2VkIHBvc3QgZGF0YSBleHRyYWN0ZWQ6YCwge1xuICAgICAgICBpZDogcG9zdERhdGEuaWQsXG4gICAgICAgIHRpdGxlOiBwb3N0RGF0YS50aXRsZSxcbiAgICAgICAgYXV0aG9yOiBwb3N0RGF0YS5hdXRob3IsXG4gICAgICAgIHN1YnJlZGRpdDogcG9zdERhdGEuc3VicmVkZGl0LFxuICAgICAgICBzY29yZTogcG9zdERhdGEuc2NvcmUsXG4gICAgICAgIGNvbW1lbnRDb3VudDogcG9zdERhdGEuY29tbWVudENvdW50LFxuICAgICAgICBwb3N0VHlwZTogcG9zdERhdGEucG9zdFR5cGUsXG4gICAgICAgIGl0ZW1TdGF0ZTogcG9zdERhdGEuaXRlbVN0YXRlLFxuICAgICAgICBtb2RlcmF0aW9uU3RhdHVzOiBwb3N0RGF0YS5tb2RlcmF0aW9uU3RhdHVzLFxuICAgICAgICBlbGVtZW50OiBwb3N0RGF0YS5lbGVtZW50ID8gJ0RPTSBlbGVtZW50IHByZXNlbnQnIDogJ05vIGVsZW1lbnQnXG4gICAgICB9KVxuXG4gICAgICBwb3N0cy5wdXNoKHBvc3REYXRhKVxuXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHN0YXRzTG9nZ2VyLmVycm9yKGBcdTI3NEMgRXJyb3IgcHJvY2Vzc2luZyBwb3N0ICR7aW5kZXggKyAxfTpgLCBlcnJvcilcbiAgICB9XG4gIH0pXG5cbiAgc3RhdHNMb2dnZXIubG9nKGBcXG5cdTI3MDUgU3VjY2Vzc2Z1bGx5IGV4dHJhY3RlZCBlbmhhbmNlZCBkYXRhIGZyb20gJHtwb3N0cy5sZW5ndGh9IHBvc3RzYClcbiAgcmV0dXJuIHBvc3RzXG59XG5cbi8vIEhlbHBlciBtZXRob2QgdG8gY2hlY2sgcG9zdCBzdGF0dXMgKHNhbWUgYXMgZG9tLmpzKVxuZnVuY3Rpb24gY2hlY2tQb3N0U3RhdHVzKHBvc3RFbGVtZW50LCBzdGF0dXNUeXBlKSB7XG4gIGNvbnN0IHN0YXR1c0NsYXNzZXMgPSBbXG4gICAgYFtjbGFzcyo9XCIke3N0YXR1c1R5cGV9XCJdYCxcbiAgICBgW2NsYXNzKj1cIm1vZGVyYXRvclwiXWAsXG4gICAgYFtkYXRhLXRlc3RpZCo9XCIke3N0YXR1c1R5cGV9XCJdYCxcbiAgICAnLnJlbW92ZWQnLFxuICAgICcuZGVsZXRlZCcsXG4gICAgJy5ibG9ja2VkJ1xuICBdXG5cbiAgLy8gQ2hlY2sgcG9zdCBlbGVtZW50IGFuZCBpdHMgY2hpbGRyZW4gZm9yIHN0YXR1cyBpbmRpY2F0b3JzXG4gIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc3RhdHVzQ2xhc3Nlcykge1xuICAgIGNvbnN0IGVsZW1lbnRzID0gcG9zdEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcbiAgICBpZiAoZWxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gVmVyaWZ5IGl0J3Mgbm90IGp1c3QgYSBjbGFzcyBuYW1lIGNvaW5jaWRlbmNlXG4gICAgICBjb25zdCB0ZXh0ID0gZWxlbWVudHNbMF0udGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkgfHwgJydcbiAgICAgIGlmICh0ZXh0LmluY2x1ZGVzKHN0YXR1c1R5cGUpIHx8IHRleHQuaW5jbHVkZXMoJ21vZGVyYXRvcicpIHx8IHRleHQuaW5jbHVkZXMoJ3JlbW92ZWQnKSB8fCB0ZXh0LmluY2x1ZGVzKCdkZWxldGVkJykpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBDaGVjayBmb3IgaWNvbi1iYXNlZCBtb2RlcmF0aW9uIGluZGljYXRvcnNcbiAgY29uc3QgbW9kZXJhdGlvbkljb25zID0gcG9zdEVsZW1lbnQucXVlcnlTZWxlY3RvcignW2ljb24tbmFtZT1cInJlbW92ZVwiXScpXG4gIGlmIChtb2RlcmF0aW9uSWNvbnMpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIHNwZWNpZmljIHN0YXR1cyB0ZXh0IHBhdHRlcm5zXG4gIGNvbnN0IHN0YXR1c1RleHRzID0gW1xuICAgICdyZW1vdmVkIGJ5IG1vZGVyYXRvcicsXG4gICAgJ2RlbGV0ZWQgYnkgbW9kZXJhdG9yJyxcbiAgICAndGhpcyBwb3N0IGhhcyBiZWVuIHJlbW92ZWQnLFxuICAgICdwb3N0IGJsb2NrZWQnLFxuICAgICdtb2RlcmF0b3IgYWN0aW9uJ1xuICBdXG5cbiAgY29uc3QgcG9zdFRleHQgPSBwb3N0RWxlbWVudC50ZXh0Q29udGVudD8udG9Mb3dlckNhc2UoKSB8fCAnJ1xuICByZXR1cm4gc3RhdHVzVGV4dHMuc29tZShzdGF0dXNUZXh0ID0+IHBvc3RUZXh0LmluY2x1ZGVzKHN0YXR1c1RleHQpKVxufVxuXG5cbi8vIE5hdmlnYXRlIHRvIHVzZXIgcHJvZmlsZSAoaGVscGVyIGZ1bmN0aW9uKVxuYXN5bmMgZnVuY3Rpb24gbmF2aWdhdGVUb1VzZXJQcm9maWxlKHVzZXJOYW1lKSB7XG4gIHN0YXRzTG9nZ2VyLmxvZygnTmF2aWdhdGluZyB0byB1c2VyIHByb2ZpbGUuLi4nKVxuXG4gIC8vIEV4dHJhY3QgdXNlcm5hbWUgd2l0aG91dCB1LyBwcmVmaXggaWYgcHJlc2VudFxuICBjb25zdCBjbGVhblVzZXJuYW1lID0gdXNlck5hbWUucmVwbGFjZSgndS8nLCAnJylcbiAgY29uc3QgdGFyZ2V0VXJsID0gYGh0dHBzOi8vd3d3LnJlZGRpdC5jb20vdXNlci8ke2NsZWFuVXNlcm5hbWV9YFxuXG4gIC8vIENoZWNrIGlmIHdlIGFyZSBhbHJlYWR5IG9uIHRoZSBjb3JyZWN0IHBhZ2VcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCc/JylbMF0gPT09IHRhcmdldFVybCB8fFxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJz8nKVswXSA9PT0gdGFyZ2V0VXJsICsgJy8nKSB7XG4gICAgc3RhdHNMb2dnZXIubG9nKCdBbHJlYWR5IG9uIHVzZXIgcHJvZmlsZSBwYWdlJylcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB0YXJnZXRVcmxcbiAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDMwMDApKVxuICByZXR1cm4gdHJ1ZVxufVxuXG4vLyBOYXZpZ2F0ZSB0byBwb3N0cyB0YWIgKGhlbHBlciBmdW5jdGlvbilcbmFzeW5jIGZ1bmN0aW9uIG5hdmlnYXRlVG9Qb3N0c1RhYigpIHtcbiAgc3RhdHNMb2dnZXIubG9nKCdOYXZpZ2F0aW5nIHRvIFBvc3RzIHRhYi4uLicpXG5cbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5lbmRzV2l0aCgnL3N1Ym1pdHRlZCcpIHx8XG4gICAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuZW5kc1dpdGgoJy9zdWJtaXR0ZWQvJykpIHtcbiAgICBzdGF0c0xvZ2dlci5sb2coJ0FscmVhZHkgb24gc3VibWl0dGVkL3Bvc3RzIHBhZ2UnKVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBjb25zdCBwb3N0c1RhYlNlbGVjdG9ycyA9IFtcbiAgICAnYVtocmVmKj1cIi9zdWJtaXR0ZWQvXCJdJyxcbiAgICAnI3Byb2ZpbGUtdGFiLXBvc3RzX3RhYicsXG4gICAgJ2ZhY2VwbGF0ZS10cmFja2VyW25vdW49XCJwb3N0c190YWJcIl0gYScsXG4gICAgJ1tkYXRhLXRlc3RpZCo9XCJwb3N0c1wiXSdcbiAgXVxuXG4gIGZvciAoY29uc3Qgc2VsZWN0b3Igb2YgcG9zdHNUYWJTZWxlY3RvcnMpIHtcbiAgICBjb25zdCBwb3N0c1RhYiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgaWYgKHBvc3RzVGFiICYmIHBvc3RzVGFiLnRleHRDb250ZW50Py50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdwb3N0cycpKSB7XG4gICAgICBzdGF0c0xvZ2dlci5sb2coJ0ZvdW5kIFBvc3RzIHRhYiwgY2xpY2tpbmcuLi4nKVxuICAgICAgcG9zdHNUYWIuY2xpY2soKVxuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDIwMDApKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuLy8gTWFudWFsIHRyaWdnZXIgZnVuY3Rpb24gZm9yIGRlYnVnZ2luZ1xud2luZG93LnRyaWdnZXJQcm9maWxlRGF0YUNvbGxlY3Rpb24gPSBhc3luYyBmdW5jdGlvbigpIHtcbiAgc3RhdHNMb2dnZXIubG9nKCdcdUQ4M0RcdUREMjcgTUFOVUFMIFRSSUdHRVI6IFN0YXJ0aW5nIHByb2ZpbGUgZGF0YSBjb2xsZWN0aW9uLi4uJylcblxuICB0cnkge1xuICAgIGNvbnN0IHVzZXJuYW1lID0gZXh0cmFjdFVzZXJuYW1lRnJvbVBhZ2UoKVxuICAgIGlmICghdXNlcm5hbWUpIHtcbiAgICAgIHN0YXRzTG9nZ2VyLmxvZygnXHUyNzRDIE5vIHVzZXJuYW1lIGZvdW5kIG9uIGN1cnJlbnQgcGFnZScpXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdObyB1c2VybmFtZSBmb3VuZCcgfVxuICAgIH1cblxuICAgIHN0YXRzTG9nZ2VyLmxvZyhgXHVEODNEXHVERDI3IE1BTlVBTCBUUklHR0VSOiBGb3VuZCB1c2VybmFtZTogJHt1c2VybmFtZX1gKVxuXG4gICAgLy8gQ2FwdHVyZSBwb3N0cyBkYXRhIGRpcmVjdGx5XG4gICAgY29uc3QgcG9zdHNEYXRhID0gYXdhaXQgY2FwdHVyZVBvc3RzRGF0YSgpXG4gICAgc3RhdHNMb2dnZXIubG9nKGBcdUQ4M0RcdUREMjcgTUFOVUFMIFRSSUdHRVI6IENhcHR1cmVkICR7cG9zdHNEYXRhLmxlbmd0aH0gcG9zdHNgKVxuXG4gICAgaWYgKHBvc3RzRGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBTdG9yZSB0aGUgZGF0YVxuICAgICAgYXdhaXQgc3RvcmVSZWRkaXRQcm9maWxlRGF0YSh1c2VybmFtZSwgcG9zdHNEYXRhKVxuICAgICAgc3RhdHNMb2dnZXIubG9nKCdcdUQ4M0RcdUREMjcgTUFOVUFMIFRSSUdHRVI6IERhdGEgc3RvcmVkIHN1Y2Nlc3NmdWxseScpXG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgICAgcG9zdHNDb3VudDogcG9zdHNEYXRhLmxlbmd0aCxcbiAgICAgICAgc2FtcGxlUG9zdDogcG9zdHNEYXRhWzBdXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXRzTG9nZ2VyLmxvZygnXHUyNzRDIE1BTlVBTCBUUklHR0VSOiBObyBwb3N0cyBmb3VuZCcpXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdObyBwb3N0cyBmb3VuZCcgfVxuICAgIH1cblxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHN0YXRzTG9nZ2VyLmVycm9yKCdcdTI3NEMgTUFOVUFMIFRSSUdHRVI6IEVycm9yOicsIGVycm9yKVxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9XG4gIH1cbn1cblxuc3RhdHNMb2dnZXIubG9nKCdcdUQ4M0RcdUREMjcgTWFudWFsIHRyaWdnZXIgYXZhaWxhYmxlOiB3aW5kb3cudHJpZ2dlclByb2ZpbGVEYXRhQ29sbGVjdGlvbigpJylcblxuLy8gXHUyNkExIFRJTlkgUkVVU0FCTEUgRlVOQ1RJT046IFF1aWNrIHBvc3QgZGF0YSBjb2xsZWN0aW9uIGZvciBhdXRvZmxvd1xuYXN5bmMgZnVuY3Rpb24gcXVpY2tDb2xsZWN0UG9zdERhdGEob3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IHtcbiAgICBtYXhQb3N0cyA9IDMsXG4gICAgdGltZW91dCA9IDUwMDAsXG4gICAgaW5jbHVkZU1vZGVyYXRpb24gPSB0cnVlLFxuICAgIGluY2x1ZGVFbmdhZ2VtZW50ID0gdHJ1ZVxuICB9ID0gb3B0aW9uc1xuXG4gIHN0YXRzTG9nZ2VyLmxvZyhgXHUyNkExIFF1aWNrIGNvbGxlY3RpbmcgJHttYXhQb3N0c30gcG9zdHMgd2l0aCAke3RpbWVvdXR9bXMgdGltZW91dGApXG5cbiAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKVxuXG4gIHdoaWxlIChEYXRlLm5vdygpIC0gc3RhcnRUaW1lIDwgdGltZW91dCkge1xuICAgIGNvbnN0IHNocmVkZGl0QXBwID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2hyZWRkaXQtYXBwJylcbiAgICBpZiAoIXNocmVkZGl0QXBwKSB7XG4gICAgICBhd2FpdCBzbGVlcCgyMDApXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIGNvbnN0IHNocmVkZGl0UG9zdHMgPSBBcnJheS5mcm9tKHNocmVkZGl0QXBwLnF1ZXJ5U2VsZWN0b3JBbGwoJ3NocmVkZGl0LXBvc3RbaWRePVwidDNfXCJdJykpLnNsaWNlKDAsIG1heFBvc3RzKVxuXG4gICAgaWYgKHNocmVkZGl0UG9zdHMubGVuZ3RoID4gMCkge1xuICAgICAgc3RhdHNMb2dnZXIubG9nKGBcdTI2QTEgRm91bmQgJHtzaHJlZGRpdFBvc3RzLmxlbmd0aH0gcG9zdHMsIGV4dHJhY3RpbmcuLi5gKVxuXG4gICAgICBjb25zdCBwb3N0cyA9IHNocmVkZGl0UG9zdHMubWFwKHBvc3QgPT4ge1xuICAgICAgICBjb25zdCBhdHRycyA9IHtcbiAgICAgICAgICBpZDogcG9zdC5pZCB8fCAnJyxcbiAgICAgICAgICB0aXRsZTogcG9zdC5nZXRBdHRyaWJ1dGUoJ3Bvc3QtdGl0bGUnKSB8fCAnJyxcbiAgICAgICAgICBhdXRob3I6IHBvc3QuZ2V0QXR0cmlidXRlKCdhdXRob3InKSB8fCAnJyxcbiAgICAgICAgICBzdWJyZWRkaXQ6IHBvc3QuZ2V0QXR0cmlidXRlKCdzdWJyZWRkaXQtcHJlZml4ZWQtbmFtZScpIHx8ICcnLFxuICAgICAgICAgIHNjb3JlOiBwYXJzZUludChwb3N0LmdldEF0dHJpYnV0ZSgnc2NvcmUnKSB8fCAnMCcpLFxuICAgICAgICAgIGNvbW1lbnRDb3VudDogcGFyc2VJbnQocG9zdC5nZXRBdHRyaWJ1dGUoJ2NvbW1lbnQtY291bnQnKSB8fCAnMCcpLFxuICAgICAgICAgIHRpbWVzdGFtcDogcG9zdC5nZXRBdHRyaWJ1dGUoJ2NyZWF0ZWQtdGltZXN0YW1wJykgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgIGl0ZW1TdGF0ZTogcG9zdC5nZXRBdHRyaWJ1dGUoJ2l0ZW0tc3RhdGUnKSB8fCAnJyxcbiAgICAgICAgICBwb3N0VHlwZTogcG9zdC5nZXRBdHRyaWJ1dGUoJ3Bvc3QtdHlwZScpIHx8ICcnLFxuICAgICAgICAgIHBlcm1hbGluazogcG9zdC5nZXRBdHRyaWJ1dGUoJ3Blcm1hbGluaycpIHx8ICcnLFxuICAgICAgICAgIHVybDogcG9zdC5nZXRBdHRyaWJ1dGUoJ2NvbnRlbnQtaHJlZicpIHx8IHBvc3QuZ2V0QXR0cmlidXRlKCdwZXJtYWxpbmsnKSB8fCAnJ1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIG1vZGVyYXRpb24gZGV0ZWN0aW9uIGlmIHJlcXVlc3RlZFxuICAgICAgICBpZiAoaW5jbHVkZU1vZGVyYXRpb24pIHtcbiAgICAgICAgICBhdHRycy5tb2RlcmF0aW9uU3RhdHVzID0ge1xuICAgICAgICAgICAgaXNSZW1vdmVkOiBwb3N0LnRleHRDb250ZW50Py5pbmNsdWRlcygncmVtb3ZlZCBieSB0aGUgbW9kZXJhdG9ycycpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgcG9zdC5xdWVyeVNlbGVjdG9yKCdbaWNvbi1uYW1lPVwicmVtb3ZlXCJdJykgIT09IG51bGwsXG4gICAgICAgICAgICBpc0xvY2tlZDogcG9zdC5xdWVyeVNlbGVjdG9yKCdbaWNvbi1uYW1lPVwibG9jay1maWxsXCJdJykgIT09IG51bGwsXG4gICAgICAgICAgICBpdGVtU3RhdGU6IGF0dHJzLml0ZW1TdGF0ZVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBMZWdhY3kgY29tcGF0aWJpbGl0eVxuICAgICAgICAgIGF0dHJzLmlzUmVtb3ZlZCA9IGF0dHJzLm1vZGVyYXRpb25TdGF0dXMuaXNSZW1vdmVkXG4gICAgICAgICAgYXR0cnMuaXNCbG9ja2VkID0gYXR0cnMubW9kZXJhdGlvblN0YXR1cy5pc1JlbW92ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhdHRyc1xuICAgICAgfSlcblxuICAgICAgc3RhdHNMb2dnZXIubG9nKGBcdTI2QTEgUXVpY2sgY29sbGVjdGlvbiBjb21wbGV0ZTogJHtwb3N0cy5sZW5ndGh9IHBvc3RzYClcbiAgICAgIHJldHVybiBwb3N0c1xuICAgIH1cblxuICAgIGF3YWl0IHNsZWVwKDIwMClcbiAgfVxuXG4gIHN0YXRzTG9nZ2VyLmxvZygnXHUyNkExIFF1aWNrIGNvbGxlY3Rpb24gdGltZW91dCAtIG5vIHBvc3RzIGZvdW5kJylcbiAgcmV0dXJuIFtdXG59XG5cbi8vIFx1RDgzQ1x1REZBRiBTSU5HTEUgQVVUT0ZMT1cgRlVOQ1RJT046IEZyZXNoIHBvc3QgZGF0YSBjb2xsZWN0aW9uIGZvciBkZWNpc2lvbiBtYWtpbmdcbmFzeW5jIGZ1bmN0aW9uIGdldFBvc3RzRGF0YUZvckF1dG9mbG93RGVjaXNpb24odXNlcm5hbWUpIHtcbiAgc3RhdHNMb2dnZXIubG9nKCdcdUQ4M0NcdURGQUYgQ29sbGVjdGluZyBmcmVzaCBwb3N0cyBkYXRhIGZvciBhdXRvZmxvdyBkZWNpc2lvbi4uLicpXG5cbiAgdHJ5IHtcbiAgICAvLyBFbnN1cmUgd2UncmUgb24gdGhlIHN1Ym1pdHRlZCBwYWdlIGZvciBmcmVzaCBkYXRhXG4gICAgaWYgKCF3aW5kb3cubG9jYXRpb24uaHJlZi5pbmNsdWRlcygnL3N1Ym1pdHRlZCcpKSB7XG4gICAgICBzdGF0c0xvZ2dlci5sb2coJ1x1MjZBMFx1RkUwRiBOb3Qgb24gc3VibWl0dGVkIHBhZ2UsIG5hdmlnYXRpbmcuLi4nKVxuICAgICAgYXdhaXQgbmF2aWdhdGVUb1VzZXJQcm9maWxlKHVzZXJuYW1lKVxuICAgICAgYXdhaXQgbmF2aWdhdGVUb1Bvc3RzVGFiKClcbiAgICAgIC8vIFNtYWxsIGRlbGF5IHRvIGVuc3VyZSBwYWdlIGxvYWRzXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMjAwMCkpXG4gICAgfVxuXG4gICAgLy8gXHVEODNEXHVERDI3IFVzZSB0aGUgU0FNRSByb2J1c3QgRE9NIGFuYWx5c2lzIG1ldGhvZCBhcyB0aGUgZnVsbCBzdGF0cyBzY3JpcHRcbiAgICBzdGF0c0xvZ2dlci5sb2coJ1x1RDgzQ1x1REZBRiBVc2luZyBmdWxsIERPTSBhbmFseXNpcyBtZXRob2QgZm9yIHJlbGlhYmxlIGRhdGEgY29sbGVjdGlvbi4uLicpXG4gICAgY29uc3QgcG9zdHMgPSBhd2FpdCBjYXB0dXJlUG9zdHNEYXRhKClcblxuICAgIHN0YXRzTG9nZ2VyLmxvZyhgXHVEODNDXHVERkFGIEZ1bGwgRE9NIGFuYWx5c2lzIGNvbGxlY3RlZCAke3Bvc3RzLmxlbmd0aH0gZnJlc2ggcG9zdHMgZm9yIGF1dG9mbG93IGRlY2lzaW9uYClcblxuICAgIGlmIChwb3N0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHBvc3RzSW5mbzogeyBwb3N0czogW10sIHRvdGFsOiAwLCBsYXN0UG9zdDogbnVsbCB9LFxuICAgICAgICBsYXN0UG9zdDogbnVsbCxcbiAgICAgICAgdG90YWxQb3N0czogMCxcbiAgICAgICAgdXNlck5hbWU6IHVzZXJuYW1lLFxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgZGF0YUZyZXNoOiB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdFBvc3QgPSBwb3N0c1swXSAvLyBNb3N0IHJlY2VudCBwb3N0XG5cbiAgICByZXR1cm4ge1xuICAgICAgcG9zdHNJbmZvOiB7XG4gICAgICAgIHBvc3RzOiBwb3N0cyxcbiAgICAgICAgdG90YWw6IHBvc3RzLmxlbmd0aCxcbiAgICAgICAgbGFzdFBvc3Q6IGxhc3RQb3N0XG4gICAgICB9LFxuICAgICAgbGFzdFBvc3Q6IGxhc3RQb3N0LFxuICAgICAgdG90YWxQb3N0czogcG9zdHMubGVuZ3RoLFxuICAgICAgdXNlck5hbWU6IHVzZXJuYW1lLFxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICBkYXRhRnJlc2g6IHRydWVcbiAgICB9XG5cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBzdGF0c0xvZ2dlci5lcnJvcignXHUyNzRDIEVycm9yIGNvbGxlY3RpbmcgZnJlc2ggcG9zdHMgZGF0YSBmb3IgYXV0b2Zsb3c6JywgZXJyb3IpXG5cbiAgICAvLyBGYWxsYmFjayB0byBxdWljayBjb2xsZWN0aW9uIGlmIG5hdmlnYXRpb24gZmFpbHNcbiAgICBzdGF0c0xvZ2dlci5sb2coJ1x1RDgzRFx1REQyNyBGYWxsYmFjazogQXR0ZW1wdGluZyBxdWljayBjb2xsZWN0aW9uIGFzIGxhc3QgcmVzb3J0Li4uJylcbiAgICBjb25zdCBwb3N0cyA9IGF3YWl0IHF1aWNrQ29sbGVjdFBvc3REYXRhKHtcbiAgICAgIG1heFBvc3RzOiA1LFxuICAgICAgdGltZW91dDogMzAwMCxcbiAgICAgIGluY2x1ZGVNb2RlcmF0aW9uOiB0cnVlLFxuICAgICAgaW5jbHVkZUVuZ2FnZW1lbnQ6IHRydWVcbiAgICB9KVxuXG4gICAgc3RhdHNMb2dnZXIubG9nKGBcdUQ4M0RcdUREMjcgRmFsbGJhY2sgY29sbGVjdGVkICR7cG9zdHMubGVuZ3RofSBwb3N0c2ApXG5cbiAgICByZXR1cm4ge1xuICAgICAgcG9zdHNJbmZvOiB7IHBvc3RzOiBwb3N0cywgdG90YWw6IHBvc3RzLmxlbmd0aCwgbGFzdFBvc3Q6IHBvc3RzWzBdIHx8IG51bGwgfSxcbiAgICAgIGxhc3RQb3N0OiBwb3N0c1swXSB8fCBudWxsLFxuICAgICAgdG90YWxQb3N0czogcG9zdHMubGVuZ3RoLFxuICAgICAgdXNlck5hbWU6IHVzZXJuYW1lLFxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICBkYXRhRnJlc2g6IGZhbHNlLFxuICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2VcbiAgICB9XG4gIH1cbn1cblxuLy8gRXhwb3J0IGZvciBnbG9iYWwgYWNjZXNzXG53aW5kb3cucXVpY2tDb2xsZWN0UG9zdERhdGEgPSBxdWlja0NvbGxlY3RQb3N0RGF0YVxud2luZG93LmdldFBvc3RzRGF0YUZvckF1dG9mbG93RGVjaXNpb24gPSBnZXRQb3N0c0RhdGFGb3JBdXRvZmxvd0RlY2lzaW9uXG5cbnN0YXRzTG9nZ2VyLmxvZygnXHUyNkExIEF1dG9mbG93IGZ1bmN0aW9uIGF2YWlsYWJsZTogZ2V0UG9zdHNEYXRhRm9yQXV0b2Zsb3dEZWNpc2lvbih1c2VybmFtZSknKVxuXG5hc3luYyBmdW5jdGlvbiBjYXB0dXJlUG9zdHNEYXRhKCkge1xuICBzdGF0c0xvZ2dlci5sb2coJ0NhcHR1cmluZyBwb3N0cyBkYXRhIGZyb20gY3VycmVudCBwYWdlLi4uJylcblxuICBjb25zdCBwb3N0cyA9IFtdXG4gIGxldCBhdHRlbXB0cyA9IDBcbiAgY29uc3QgbWF4QXR0ZW1wdHMgPSAxMFxuXG4gIHdoaWxlIChhdHRlbXB0cyA8IG1heEF0dGVtcHRzKSB7XG4gICAgLy8gVXNlIG9ubHkgdGhlIGNvcnJlY3QgcGF0aDogc2hyZWRkaXQtYXBwIC0+IHNocmVkZGl0LXBvc3QgZWxlbWVudHMgd2l0aCBJRHNcbiAgICBzdGF0c0xvZ2dlci5sb2coJz09PSBTRUFSQ0hJTkcgU0hSRURESVQtQVBQIEZPUiBQT1NUUyA9PT0nKVxuXG4gICAgY29uc3Qgc2hyZWRkaXRBcHAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzaHJlZGRpdC1hcHAnKVxuICAgIGlmICghc2hyZWRkaXRBcHApIHtcbiAgICAgIHN0YXRzTG9nZ2VyLmxvZygnXHUyNzRDIHNocmVkZGl0LWFwcCBub3QgZm91bmQnKVxuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0c0xvZ2dlci5sb2coJ1x1MjcwNSBGb3VuZCBzaHJlZGRpdC1hcHAnKVxuXG4gICAgICAvLyBGaW5kIGFsbCBzaHJlZGRpdC1wb3N0IGVsZW1lbnRzIHdpdGggSURzXG4gICAgICBjb25zdCBzaHJlZGRpdFBvc3RzID0gQXJyYXkuZnJvbShzaHJlZGRpdEFwcC5xdWVyeVNlbGVjdG9yQWxsKCdzaHJlZGRpdC1wb3N0W2lkXj1cInQzX1wiXScpKVxuICAgICAgc3RhdHNMb2dnZXIubG9nKGBcdUQ4M0NcdURGQUYgRm91bmQgJHtzaHJlZGRpdFBvc3RzLmxlbmd0aH0gc2hyZWRkaXQtcG9zdCBlbGVtZW50cyB3aXRoIElEc2ApXG5cbiAgICAgIGlmIChzaHJlZGRpdFBvc3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc3RhdHNMb2dnZXIubG9nKCdcdUQ4M0RcdUREMEQgVXNpbmcgZW5oYW5jZWQgcG9zdCBkYXRhIGV4dHJhY3Rpb24uLi4nKVxuICAgICAgICBjb25zdCBleHRyYWN0ZWRQb3N0cyA9IGV4dHJhY3RQb3N0RGF0YUZyb21TaHJlZGRpdFBvc3RzKHNocmVkZGl0UG9zdHMpXG4gICAgICAgIHN0YXRzTG9nZ2VyLmxvZyhgXHUyNzA1IEVuaGFuY2VkIGV4dHJhY3Rpb24gY2FwdHVyZWQgJHtleHRyYWN0ZWRQb3N0cy5sZW5ndGh9IHBvc3RzIHdpdGggbWV0YWRhdGFgKVxuXG4gICAgICAgIC8vIExvZyBmaXJzdCBwb3N0IHRvIHZlcmlmeSBlbmhhbmNlZCBkYXRhXG4gICAgICAgIGlmIChleHRyYWN0ZWRQb3N0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgc3RhdHNMb2dnZXIubG9nKCdcdUQ4M0RcdURDQ0EgU2FtcGxlIGVuaGFuY2VkIHBvc3QgZGF0YTonLCB7XG4gICAgICAgICAgICBpZDogZXh0cmFjdGVkUG9zdHNbMF0uaWQsXG4gICAgICAgICAgICB0aXRsZTogZXh0cmFjdGVkUG9zdHNbMF0udGl0bGUsXG4gICAgICAgICAgICBhdXRob3I6IGV4dHJhY3RlZFBvc3RzWzBdLmF1dGhvcixcbiAgICAgICAgICAgIHN1YnJlZGRpdDogZXh0cmFjdGVkUG9zdHNbMF0uc3VicmVkZGl0LFxuICAgICAgICAgICAgc2NvcmU6IGV4dHJhY3RlZFBvc3RzWzBdLnNjb3JlLFxuICAgICAgICAgICAgY29tbWVudENvdW50OiBleHRyYWN0ZWRQb3N0c1swXS5jb21tZW50Q291bnQsXG4gICAgICAgICAgICBpdGVtU3RhdGU6IGV4dHJhY3RlZFBvc3RzWzBdLml0ZW1TdGF0ZVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICBwb3N0cy5wdXNoKC4uLmV4dHJhY3RlZFBvc3RzKVxuXG4gICAgICAgIHN0YXRzTG9nZ2VyLmxvZyhgXHUyNzA1IFN1Y2Nlc3NmdWxseSBjYXB0dXJlZCAke3Bvc3RzLmxlbmd0aH0gcG9zdHMgd2l0aCBlbmhhbmNlZCBtZXRhZGF0YWApXG4gICAgICAgIHJldHVybiBwb3N0c1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRzTG9nZ2VyLmxvZyhgTm8gcG9zdHMgZm91bmQsIGF0dGVtcHQgJHthdHRlbXB0cyArIDF9LyR7bWF4QXR0ZW1wdHN9YClcbiAgICBhd2FpdCBzbGVlcCgxMDAwKVxuICAgIGF0dGVtcHRzKytcbiAgfVxuXG4gIHN0YXRzTG9nZ2VyLmxvZygnRmFpbGVkIHRvIGZpbmQgcG9zdHMgYWZ0ZXIgbWF4aW11bSBhdHRlbXB0cycpXG4gIHJldHVybiBbXVxufVxuXG4vLyBNYWluIHByb2ZpbGUgZGV0ZWN0aW9uIHNjcmlwdFxuYXN5bmMgZnVuY3Rpb24gcnVuUHJvZmlsZURldGVjdGlvblNjcmlwdCgpIHtcbiAgc3RhdHNMb2dnZXIubG9nKCc9PT0gUFJPRklMRSBERVRFQ1RJT04gU0NSSVBUIFNUQVJURUQgPT09JylcblxuICB0cnkge1xuICAgIC8vIEV4dHJhY3QgdXNlcm5hbWUgZnJvbSBjdXJyZW50IHBhZ2VcbiAgICBjb25zdCB1c2VybmFtZSA9IGV4dHJhY3RVc2VybmFtZUZyb21QYWdlKClcbiAgICBpZiAoIXVzZXJuYW1lKSB7XG4gICAgICBzdGF0c0xvZ2dlci5sb2coJ05vIHVzZXJuYW1lIGZvdW5kLCBjYW5ub3QgcHJvY2VlZCB3aXRoIHByb2ZpbGUgZGV0ZWN0aW9uJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHN0YXRzTG9nZ2VyLmxvZygnRGV0ZWN0ZWQgdXNlcm5hbWU6JywgdXNlcm5hbWUpXG5cbiAgICAvLyBTdG9yZSB1c2VybmFtZSBpZiBub3QgYWxyZWFkeSBzdG9yZWRcbiAgICBjb25zdCBzdG9yZWRVc2VyID0gYXdhaXQgZ2V0U3RvcmVkVXNlcm5hbWUoKVxuICAgIGlmICghc3RvcmVkVXNlciB8fCAhc3RvcmVkVXNlci5zZXJlbl9uYW1lKSB7XG4gICAgICBhd2FpdCBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7XG4gICAgICAgIHJlZGRpdFVzZXI6IHtcbiAgICAgICAgICBzZXJlbl9uYW1lOiB1c2VybmFtZSxcbiAgICAgICAgICBsYXN0Q2hlY2s6IERhdGUubm93KClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBOYXZpZ2F0ZSB0byB1c2VyJ3MgcG9zdHMgcGFnZVxuICAgIGF3YWl0IG5hdmlnYXRlVG9Vc2VyUG9zdHModXNlcm5hbWUpXG5cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBzdGF0c0xvZ2dlci5lcnJvcignUHJvZmlsZSBkZXRlY3Rpb24gc2NyaXB0IGVycm9yOicsIGVycm9yKVxuICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtc2NyaXB0LXN0YWdlJylcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBjb250aW51ZVByb2ZpbGVEYXRhQ29sbGVjdGlvbigpIHtcbiAgc3RhdHNMb2dnZXIubG9nKCc9PT0gQ09OVElOVUlORyBQUk9GSUxFIERBVEEgQ09MTEVDVElPTiA9PT0nKVxuXG4gIHRyeSB7XG4gICAgY29uc3QgdXNlcm5hbWUgPSBleHRyYWN0VXNlcm5hbWVGcm9tUGFnZSgpXG4gICAgaWYgKCF1c2VybmFtZSkge1xuICAgICAgc3RhdHNMb2dnZXIubG9nKCdObyB1c2VybmFtZSBmb3VuZCBvbiBwb3N0cyBwYWdlJylcbiAgICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtc2NyaXB0LXN0YWdlJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHN0YXRzTG9nZ2VyLmxvZygnQ29sbGVjdGluZyBwb3N0cyBkYXRhIGZvcjonLCB1c2VybmFtZSlcblxuICAgIC8vIENhcHR1cmUgcG9zdHMgZGF0YVxuICAgIGNvbnN0IHBvc3RzRGF0YSA9IGF3YWl0IGNhcHR1cmVQb3N0c0RhdGEoKVxuXG4gICAgaWYgKHBvc3RzRGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBTdG9yZSB0aGUgcHJvZmlsZSBkYXRhXG4gICAgICBhd2FpdCBzdG9yZVJlZGRpdFByb2ZpbGVEYXRhKHVzZXJuYW1lLCBwb3N0c0RhdGEpXG4gICAgICBzdGF0c0xvZ2dlci5sb2coJ1Byb2ZpbGUgZGF0YSBjb2xsZWN0aW9uIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHknKVxuXG4gICAgICAvLyBVcGRhdGUgdXNlciBzdGF0dXMgd2l0aCBmcmVzaCBkYXRhXG4gICAgICBjb25zdCBmcmVzaFN0YXR1cyA9IHtcbiAgICAgICAgdXNlck5hbWU6IHVzZXJuYW1lLFxuICAgICAgICBjdXJyZW50VXNlcjogdXNlcm5hbWUsXG4gICAgICAgIHN0b3JlZFVzZXI6IHVzZXJuYW1lLFxuICAgICAgICBpc01hdGNoOiB0cnVlLFxuICAgICAgICBsYXN0Q2hlY2s6IERhdGUubm93KCksXG4gICAgICAgIHRvdGFsUG9zdHM6IHBvc3RzRGF0YS5sZW5ndGgsXG4gICAgICAgIHBvc3RzQ291bnQ6IHBvc3RzRGF0YS5sZW5ndGgsXG4gICAgICAgIGxhc3RQb3N0VGV4dDogcG9zdHNEYXRhLmxlbmd0aCA+IDAgPyBwb3N0c0RhdGFbMF0udGl0bGUgfHwgJ1JlY2VudCBwb3N0JyA6ICdObyBwb3N0cycsXG4gICAgICAgIGxhc3RQb3N0RGF0ZTogcG9zdHNEYXRhLmxlbmd0aCA+IDAgPyBwb3N0c0RhdGFbMF0udGltZXN0YW1wIHx8IERhdGUubm93KCkgOiBudWxsLFxuICAgICAgICBjdXJyZW50VXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICBjb2xsZWN0aW5nUG9zdHNEYXRhOiBmYWxzZSxcbiAgICAgICAgZGF0YUZyZXNoOiB0cnVlXG4gICAgICB9XG5cbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICAgIHVzZXJTdGF0dXM6IGZyZXNoU3RhdHVzXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgc3RhdHNMb2dnZXIubG9nKCdVc2VyIHN0YXR1cyB1cGRhdGVkIHdpdGggZnJlc2ggcG9zdHMgZGF0YScpXG5cbiAgICAgICAgLy8gVHJpZ2dlciBhdXRvLWZsb3cgZGVjaXNpb24gYW5hbHlzaXMgYnkgc2VuZGluZyBBQ1RJT05fQ09NUExFVEVEIHRvIGJhY2tncm91bmRcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgIHR5cGU6ICdBQ1RJT05fQ09NUExFVEVEJyxcbiAgICAgICAgICBhY3Rpb246ICdHRVRfUE9TVFMnLFxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgdG90YWw6IHBvc3RzRGF0YS5sZW5ndGgsXG4gICAgICAgICAgICBsYXN0UG9zdERhdGU6IHBvc3RzRGF0YS5sZW5ndGggPiAwID8gcG9zdHNEYXRhWzBdLnRpbWVzdGFtcCB8fCBEYXRlLm5vdygpIDogbnVsbCxcbiAgICAgICAgICAgIHBvc3RzOiBwb3N0c0RhdGEsXG4gICAgICAgICAgICBsYXN0UG9zdDogcG9zdHNEYXRhLmxlbmd0aCA+IDAgPyBwb3N0c0RhdGFbMF0gOiBudWxsXG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgIHN0YXRzTG9nZ2VyLndhcm4oJ0ZhaWxlZCB0byB0cmlnZ2VyIGF1dG8tZmxvdyBkZWNpc2lvbiBhbmFseXNpczonLCBlcnIpXG4gICAgICAgIH0pXG4gICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgIHN0YXRzTG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gdXBkYXRlIHVzZXIgc3RhdHVzOicsIGVycm9yKVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdHNMb2dnZXIubG9nKCdObyBwb3N0cyBkYXRhIGZvdW5kIHRvIHN0b3JlJylcblxuICAgICAgLy8gVXBkYXRlIHN0YXR1cyB0byBpbmRpY2F0ZSBjb2xsZWN0aW9uIGNvbXBsZXRlZCBidXQgbm8gZGF0YSBmb3VuZFxuICAgICAgY29uc3Qgbm9EYXRhU3RhdHVzID0ge1xuICAgICAgICBjdXJyZW50VXNlcjogdXNlcm5hbWUsXG4gICAgICAgIHN0b3JlZFVzZXI6IHVzZXJuYW1lLFxuICAgICAgICBpc01hdGNoOiB0cnVlLFxuICAgICAgICBsYXN0Q2hlY2s6IERhdGUubm93KCksXG4gICAgICAgIHBvc3RzQ291bnQ6IDAsXG4gICAgICAgIGN1cnJlbnRVcmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmLFxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgIGNvbGxlY3RpbmdQb3N0c0RhdGE6IGZhbHNlLFxuICAgICAgICBkYXRhRnJlc2g6IHRydWUsXG4gICAgICAgIHBvc3RzRGF0YUVycm9yOiAnTm8gcG9zdHMgZm91bmQgb24gdXNlciBwYWdlJ1xuICAgICAgfVxuXG4gICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoe1xuICAgICAgICB1c2VyU3RhdHVzOiBub0RhdGFTdGF0dXNcbiAgICAgIH0pLmNhdGNoKCgpID0+IHt9KVxuICAgIH1cblxuICAgIC8vIENsZWFyIHNjcmlwdCBzdGFnZVxuICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtc2NyaXB0LXN0YWdlJylcblxuICAgIHN0YXRzTG9nZ2VyLmxvZygnPT09IFBST0ZJTEUgREVURUNUSU9OIFNDUklQVCBDT01QTEVURUQgPT09JylcblxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHN0YXRzTG9nZ2VyLmVycm9yKCdDb250aW51ZSBwcm9maWxlIGRhdGEgY29sbGVjdGlvbiBlcnJvcjonLCBlcnJvcilcbiAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKCdyZWRkaXQtcG9zdC1tYWNoaW5lLXNjcmlwdC1zdGFnZScpXG5cbiAgICAvLyBVcGRhdGUgc3RhdHVzIHdpdGggZXJyb3JcbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoe1xuICAgICAgdXNlclN0YXR1czoge1xuICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICBjb2xsZWN0aW5nUG9zdHNEYXRhOiBmYWxzZSxcbiAgICAgICAgZGF0YUZyZXNoOiBmYWxzZVxuICAgICAgfVxuICAgIH0pLmNhdGNoKCgpID0+IHt9KVxuICB9XG59XG5cbi8vIEhhbmRsZSBtYW51YWwgc2NyaXB0IHRyaWdnZXIgZnJvbSBiYWNrZ3JvdW5kL3BvcHVwXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVNYW51YWxTY3JpcHRUcmlnZ2VyKHNjcmlwdFR5cGUsIG1vZGUpIHtcbiAgc3RhdHNMb2dnZXIubG9nKGA9PT0gTUFOVUFMIFRSSUdHRVI6ICR7c2NyaXB0VHlwZX0gKG1vZGU6ICR7bW9kZX0pID09PWApXG5cbiAgdHJ5IHtcbiAgICBpZiAoc2NyaXB0VHlwZSA9PT0gJ3Byb2ZpbGUnKSB7XG4gICAgICAvLyBDbGVhciBhbnkgZXhpc3Rpbmcgc2NyaXB0IHN0YWdlIGZvciBtYW51YWwgZXhlY3V0aW9uXG4gICAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKCdyZWRkaXQtcG9zdC1tYWNoaW5lLXNjcmlwdC1zdGFnZScpXG4gICAgICBzdGF0c0xvZ2dlci5sb2coJ01hbnVhbGx5IHRyaWdnZXJpbmcgcHJvZmlsZSBkZXRlY3Rpb24gc2NyaXB0JylcbiAgICAgIGF3YWl0IHJ1blByb2ZpbGVEZXRlY3Rpb25TY3JpcHQoKVxuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0c0xvZ2dlci5sb2coYE1hbnVhbCB0cmlnZ2VyIGZvciAke3NjcmlwdFR5cGV9IG5vdCBoYW5kbGVkIGJ5IHN0YXRzIHNjcmlwdGApXG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHN0YXRzTG9nZ2VyLmVycm9yKCdNYW51YWwgc2NyaXB0IHRyaWdnZXIgZXJyb3I6JywgZXJyb3IpXG4gIH1cbn1cblxuLy8gSGFuZGxlIGV4dHJhY3QgdXNlcm5hbWUgYW5kIGNyZWF0ZSBwb3N0IChsZWdhY3kgc3VwcG9ydClcbmZ1bmN0aW9uIGhhbmRsZUV4dHJhY3RVc2VybmFtZUFuZENyZWF0ZVBvc3QoKSB7XG4gIHN0YXRzTG9nZ2VyLmxvZygnSGFuZGxpbmcgZXh0cmFjdCB1c2VybmFtZSBhbmQgY3JlYXRlIHBvc3QgcmVxdWVzdCcpXG5cbiAgY29uc3QgdXNlcm5hbWUgPSBleHRyYWN0VXNlcm5hbWVGcm9tUGFnZSgpXG4gIGlmICh1c2VybmFtZSkge1xuICAgIHN0YXRzTG9nZ2VyLmxvZygnRXh0cmFjdGVkIHVzZXJuYW1lOicsIHVzZXJuYW1lKVxuXG4gICAgLy8gU3RvcmUgdXNlcm5hbWVcbiAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7XG4gICAgICByZWRkaXRVc2VyOiB7XG4gICAgICAgIHNlcmVuX25hbWU6IHVzZXJuYW1lLFxuICAgICAgICBsYXN0Q2hlY2s6IERhdGUubm93KClcbiAgICAgIH1cbiAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgIHN0YXRzTG9nZ2VyLmxvZygnVXNlcm5hbWUgc3RvcmVkIHN1Y2Nlc3NmdWxseScpXG4gICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgc3RhdHNMb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byBzdG9yZSB1c2VybmFtZTonLCBlcnJvcilcbiAgICB9KVxuICB9XG59XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBmaW5kIGFuZCBjbGljayBWaWV3IFByb2ZpbGUgd2hlbiB1c2VybmFtZSBub3QgZm91bmRcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVVzZXJOb3RGb3VuZE5hdmlnYXRpb24oKSB7XG4gIHN0YXRzTG9nZ2VyLmxvZygnVXNlcm5hbWUgbm90IGZvdW5kLCBhdHRlbXB0aW5nIGF1dG9tYXRpYyBuYXZpZ2F0aW9uIHRvIHVzZXIgcHJvZmlsZS4uLicpXG5cbiAgdHJ5IHtcbiAgICAvLyBTdGVwIDE6IEZpbmQgYW5kIGNsaWNrIHVzZXIgZHJvcGRvd24vYXZhdGFyIGJ1dHRvblxuICAgIGNvbnN0IGRyb3Bkb3duQnV0dG9uID0gcXMoJ2J1dHRvblthcmlhLWxhYmVsKj1cInVzZXJcIl0sIFtkYXRhLXRlc3RpZD1cInVzZXItYXZhdGFyXCJdLCAjZXhwYW5kLXVzZXItZHJhd2VyLWJ1dHRvbicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBxcygnYnV0dG9uW2FyaWEtbGFiZWwqPVwidS9cIl0nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcXMoJ1tkYXRhLXRlc3RpZD1cInVzZXItZHJvcGRvd24tYnV0dG9uXCJdJylcblxuICAgIGlmICghZHJvcGRvd25CdXR0b24pIHtcbiAgICAgIHN0YXRzTG9nZ2VyLmxvZygnVXNlciBkcm9wZG93biBidXR0b24gbm90IGZvdW5kJylcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHN0YXRzTG9nZ2VyLmxvZygnRm91bmQgdXNlciBkcm9wZG93biBidXR0b24sIGNsaWNraW5nIHRvIG9wZW4gbWVudScpXG4gICAgZHJvcGRvd25CdXR0b24uY2xpY2soKVxuICAgIGF3YWl0IHNsZWVwKDEwMDApIC8vIFdhaXQgZm9yIG1lbnUgdG8gYXBwZWFyXG5cbiAgICAvLyBTdGVwIDI6IEZpbmQgYW5kIGNsaWNrIFwiVmlldyBQcm9maWxlXCIgbGluayBpbiB0aGUgZHJvcGRvd24gbWVudVxuICAgIGNvbnN0IHZpZXdQcm9maWxlTGluayA9IHFzKCdhW2hyZWYqPVwiL3UvXCJdLCBhW2hyZWYqPVwiL3VzZXIvXCJdJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxcygnW3JvbGU9XCJtZW51aXRlbVwiXSBhJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxcygnLmRyb3Bkb3duLW1lbnUgYVtocmVmKj1cIi9cIl0nKVxuXG4gICAgaWYgKCF2aWV3UHJvZmlsZUxpbmspIHtcbiAgICAgIHN0YXRzTG9nZ2VyLmxvZygnVmlldyBQcm9maWxlIGxpbmsgbm90IGZvdW5kIGluIGRyb3Bkb3duJylcbiAgICAgIC8vIFRyeSB0byBjbG9zZSBkcm9wZG93biBhbmQgcmV0dXJuIGZhbHNlXG4gICAgICBkb2N1bWVudC5ib2R5LmNsaWNrKClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHN0YXRzTG9nZ2VyLmxvZygnRm91bmQgVmlldyBQcm9maWxlIGxpbmssIG5hdmlnYXRpbmcgdG8gdXNlciBwcm9maWxlJylcbiAgICBjb25zdCBwcm9maWxlVXJsID0gdmlld1Byb2ZpbGVMaW5rLmhyZWZcblxuICAgIC8vIFNldCBzZXNzaW9uU3RvcmFnZSBmbGFnIHRvIHRyYWNrIG5hdmlnYXRpb24gc3RhdGVcbiAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdyZWRkaXQtcG9zdC1tYWNoaW5lLXNjcmlwdC1zdGFnZScsICdwcm9maWxlLW5hdmlnYXRpbmcnKVxuICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtc2NyaXB0LXN0YWdlLXRpbWVzdGFtcCcsIERhdGUubm93KCkudG9TdHJpbmcoKSlcblxuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcHJvZmlsZVVybFxuXG4gICAgLy8gV2FpdCBmb3IgbmF2aWdhdGlvbiB0byBjb21wbGV0ZVxuICAgIGF3YWl0IHdhaXRGb3JDb25kaXRpb24oKCkgPT4gd2luZG93LmxvY2F0aW9uLmhyZWYuaW5jbHVkZXMoJy91LycpIHx8IHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluY2x1ZGVzKCcvdXNlci8nKSwgNTAwMClcblxuICAgIHN0YXRzTG9nZ2VyLmxvZygnU3VjY2Vzc2Z1bGx5IG5hdmlnYXRlZCB0byB1c2VyIHByb2ZpbGUgcGFnZScpXG4gICAgcmV0dXJuIHRydWVcblxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHN0YXRzTG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgYXV0b21hdGljIHVzZXIgcHJvZmlsZSBuYXZpZ2F0aW9uOicsIGVycm9yKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBzZWFyY2ggc2hhZG93IERPTSBmb3IgZWxlbWVudHNcbmZ1bmN0aW9uIHF1ZXJ5U2hhZG93RE9NKHNlbGVjdG9yLCByb290ID0gZG9jdW1lbnQpIHtcbiAgLy8gRmlyc3QgdHJ5IG5vcm1hbCBxdWVyeVNlbGVjdG9yXG4gIGNvbnN0IGVsZW1lbnQgPSByb290LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gIGlmIChlbGVtZW50KSByZXR1cm4gZWxlbWVudFxuXG4gIC8vIFJlY3Vyc2l2ZWx5IHNlYXJjaCBzaGFkb3cgcm9vdHNcbiAgY29uc3QgYWxsRWxlbWVudHMgPSByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKVxuICBmb3IgKGNvbnN0IGVsIG9mIGFsbEVsZW1lbnRzKSB7XG4gICAgaWYgKGVsLnNoYWRvd1Jvb3QpIHtcbiAgICAgIGNvbnN0IHNoYWRvd0VsZW1lbnQgPSBxdWVyeVNoYWRvd0RPTShzZWxlY3RvciwgZWwuc2hhZG93Um9vdClcbiAgICAgIGlmIChzaGFkb3dFbGVtZW50KSByZXR1cm4gc2hhZG93RWxlbWVudFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsXG59XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBmaW5kIGVsZW1lbnQgYnkgdGV4dCBjb250ZW50IGluY2x1ZGluZyBzaGFkb3cgRE9NXG5mdW5jdGlvbiBmaW5kRWxlbWVudEJ5VGV4dCh0ZXh0LCByb290ID0gZG9jdW1lbnQpIHtcbiAgLy8gU2VhcmNoIGluIG1haW4gZG9jdW1lbnRcbiAgY29uc3QgZWxlbWVudHMgPSByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKVxuICBmb3IgKGNvbnN0IGVsIG9mIGVsZW1lbnRzKSB7XG4gICAgaWYgKGVsLnRleHRDb250ZW50Py50cmltKCkudG9Mb3dlckNhc2UoKSA9PT0gdGV4dC50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICByZXR1cm4gZWxcbiAgICB9XG4gIH1cblxuICAvLyBTZWFyY2ggaW4gc2hhZG93IHJvb3RzXG4gIGZvciAoY29uc3QgZWwgb2YgZWxlbWVudHMpIHtcbiAgICBpZiAoZWwuc2hhZG93Um9vdCkge1xuICAgICAgY29uc3Qgc2hhZG93RWxlbWVudCA9IGZpbmRFbGVtZW50QnlUZXh0KHRleHQsIGVsLnNoYWRvd1Jvb3QpXG4gICAgICBpZiAoc2hhZG93RWxlbWVudCkgcmV0dXJuIHNoYWRvd0VsZW1lbnRcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbFxufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gbmF2aWdhdGUgdG8gcG9zdHMgdGFiIGZyb20gcHJvZmlsZSBwYWdlXG5hc3luYyBmdW5jdGlvbiBuYXZpZ2F0ZVRvUG9zdHNGcm9tUHJvZmlsZSgpIHtcbiAgc3RhdHNMb2dnZXIubG9nKCdOYXZpZ2F0aW5nIHRvIFBvc3RzIHRhYiBmcm9tIHByb2ZpbGUgcGFnZS4uLicpXG5cbiAgdHJ5IHtcbiAgICAvLyBMb29rIGZvciBQb3N0cyB0YWIvYnV0dG9uIG9uIHByb2ZpbGUgcGFnZSB3aXRoIHNoYWRvdyBET00gc3VwcG9ydFxuICAgIGxldCBwb3N0c1RhYiA9IHF1ZXJ5U2hhZG93RE9NKCdmYWNlcGxhdGUtdHJhY2tlcltub3VuPVwicG9zdHNfdGFiXCJdJykgfHxcbiAgICAgICAgICAgICAgICAgICBxdWVyeVNoYWRvd0RPTSgnYVtocmVmKj1cIi9zdWJtaXR0ZWRcIl0nKSB8fFxuICAgICAgICAgICAgICAgICAgIHF1ZXJ5U2hhZG93RE9NKCdidXR0b25bZGF0YS10ZXN0aWQ9XCJwb3N0cy10YWJcIl0nKSB8fFxuICAgICAgICAgICAgICAgICAgIHF1ZXJ5U2hhZG93RE9NKCdbZGF0YS1jbGljay1pZD1cInVzZXJfcG9zdHNcIl0nKSB8fFxuICAgICAgICAgICAgICAgICAgIHF1ZXJ5U2hhZG93RE9NKCdbcm9sZT1cInRhYlwiXScpIHx8XG4gICAgICAgICAgICAgICAgICAgcXMoJ2FbaHJlZio9XCIvc3VibWl0dGVkL1wiXScpIC8vIGZhbGxiYWNrIHRvIG5vcm1hbCBET01cblxuICAgIC8vIElmIHN0aWxsIG5vdCBmb3VuZCwgdHJ5IHRleHQtYmFzZWQgc2VhcmNoXG4gICAgaWYgKCFwb3N0c1RhYikge1xuICAgICAgc3RhdHNMb2dnZXIubG9nKCdVc2luZyB0ZXh0LWJhc2VkIHNlYXJjaCBmb3IgUG9zdHMgdGFiJylcbiAgICAgIHBvc3RzVGFiID0gZmluZEVsZW1lbnRCeVRleHQoJ1Bvc3RzJykgfHwgZmluZEVsZW1lbnRCeVRleHQoJ1N1Ym1pdHRlZCcpXG4gICAgfVxuXG4gICAgLy8gSWYgd2UgZm91bmQgZ2VuZXJpYyB0YWJzLCBmaWx0ZXIgZm9yIFBvc3RzIHRleHRcbiAgICBpZiAocG9zdHNUYWIgJiYgIXBvc3RzVGFiLmdldEF0dHJpYnV0ZSgnbm91bicpPy5pbmNsdWRlcygncG9zdHNfdGFiJykpIHtcbiAgICAgIGNvbnN0IGFsbFRhYnMgPSBxdWVyeVNoYWRvd0RPTUFsbCgnW3JvbGU9XCJ0YWJcIl0sIGZhY2VwbGF0ZS10cmFja2VyLCBhW2hyZWYqPVwiL3N1Ym1pdHRlZFwiXSwgYnV0dG9uW2RhdGEtdGVzdGlkKj1cInRhYlwiXScpXG4gICAgICBmb3IgKGNvbnN0IHRhYiBvZiBhbGxUYWJzKSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSB0YWIudGV4dENvbnRlbnQ/LnRyaW0oKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGlmICh0ZXh0ID09PSAncG9zdHMnIHx8IHRleHQgPT09ICdzdWJtaXR0ZWQnKSB7XG4gICAgICAgICAgcG9zdHNUYWIgPSB0YWJcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFwb3N0c1RhYikge1xuICAgICAgc3RhdHNMb2dnZXIubG9nKCdcdUQ4M0RcdUREMEQgU2VhcmNoaW5nIGZvciBQb3N0cyB0YWIgLSB0cnlpbmcgYWx0ZXJuYXRpdmUgZGV0ZWN0aW9uIG1ldGhvZHMuLi4nKVxuICAgICAgLy8gVHJ5IHRvIGZpbmQgYW55IGNsaWNrYWJsZSBlbGVtZW50IHRoYXQgY29udGFpbnMgJ3Bvc3RzJyBpbiBhdHRyaWJ1dGVzXG4gICAgICBjb25zdCBhbGxFbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKVxuICAgICAgZm9yIChjb25zdCBlbCBvZiBhbGxFbGVtZW50cykge1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0gZWwuZ2V0QXR0cmlidXRlTmFtZXMoKVxuICAgICAgICBmb3IgKGNvbnN0IGF0dHIgb2YgYXR0cmlidXRlcykge1xuICAgICAgICAgIGlmIChlbC5nZXRBdHRyaWJ1dGUoYXR0cik/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ3Bvc3RzJykpIHtcbiAgICAgICAgICAgIHBvc3RzVGFiID0gZWxcbiAgICAgICAgICAgIHN0YXRzTG9nZ2VyLmxvZygnRm91bmQgcG9zdHMgZWxlbWVudCBhcyBmYWxsYmFjazonLCBlbC50YWdOYW1lLCBhdHRyKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBvc3RzVGFiKSBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghcG9zdHNUYWIpIHtcbiAgICAgIHN0YXRzTG9nZ2VyLmxvZygnUG9zdHMgdGFiIG5vdCBmb3VuZCBhZnRlciBhbGwgYXR0ZW1wdHMnKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgc3RhdHNMb2dnZXIubG9nKCdGb3VuZCBQb3N0cyB0YWIsIG5hdmlnYXRpbmcgdG8gc3VibWl0dGVkIHBvc3RzOicsIHBvc3RzVGFiLnRhZ05hbWUsIHBvc3RzVGFiLnRleHRDb250ZW50Py50cmltKCkpXG5cbiAgICAvLyBVcGRhdGUgc2Vzc2lvblN0b3JhZ2UgZmxhZyBmb3IgcG9zdHMgbmF2aWdhdGlvblxuICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtc2NyaXB0LXN0YWdlJywgJ3Byb2ZpbGUtc3dpdGNoaW5nLXRvLXBvc3RzJylcbiAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdyZWRkaXQtcG9zdC1tYWNoaW5lLXNjcmlwdC1zdGFnZS10aW1lc3RhbXAnLCBEYXRlLm5vdygpLnRvU3RyaW5nKCkpXG5cbiAgICAvLyBUcnkgdG8gY2xpY2sgdGhlIHRhYiBmaXJzdCwgaWYgdGhhdCBkb2Vzbid0IHdvcmssIGNvbnN0cnVjdCBVUkxcbiAgICB0cnkge1xuICAgICAgcG9zdHNUYWIuY2xpY2soKVxuICAgICAgc3RhdHNMb2dnZXIubG9nKCdDbGlja2VkIFBvc3RzIHRhYiwgd2FpdGluZyBmb3IgY29udGVudCB0byBsb2FkLi4uJylcblxuICAgICAgLy8gV2FpdCBsb25nZXIgZm9yIHBvc3RzIGNvbnRlbnQgdG8gbG9hZCBhZnRlciBjbGlja2luZyBQb3N0cyB0YWJcbiAgICAgIGF3YWl0IHNsZWVwKDMwMDApXG5cbiAgICAgIC8vIENoZWNrIGlmIG5hdmlnYXRpb24gaGFwcGVuZWRcbiAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmNsdWRlcygnL3N1Ym1pdHRlZCcpKSB7XG4gICAgICAgIHN0YXRzTG9nZ2VyLmxvZygnU3VjY2Vzc2Z1bGx5IG5hdmlnYXRlZCB0byBzdWJtaXR0ZWQgcG9zdHMgdmlhIGNsaWNrJylcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9IGNhdGNoIChjbGlja0Vycm9yKSB7XG4gICAgICBzdGF0c0xvZ2dlci5sb2coJ0NsaWNrIGZhaWxlZCwgdHJ5aW5nIGRpcmVjdCBuYXZpZ2F0aW9uJylcbiAgICB9XG5cbiAgICAvLyBGYWxsYmFjazogY29uc3RydWN0IHN1Ym1pdHRlZCBVUkwgZnJvbSBjdXJyZW50IHVzZXJuYW1lXG4gICAgY29uc3QgdXNlcm5hbWUgPSBleHRyYWN0VXNlcm5hbWVGcm9tUGFnZSgpXG4gICAgaWYgKHVzZXJuYW1lKSB7XG4gICAgICBjb25zdCBwb3N0c1VybCA9IGBodHRwczovL3d3dy5yZWRkaXQuY29tL3UvJHt1c2VybmFtZX0vc3VibWl0dGVkL2BcbiAgICAgIHN0YXRzTG9nZ2VyLmxvZygnTmF2aWdhdGluZyBkaXJlY3RseSB0byBzdWJtaXR0ZWQgVVJMOicsIHBvc3RzVXJsKVxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBwb3N0c1VybFxuXG4gICAgICAvLyBXYWl0IGZvciBuYXZpZ2F0aW9uIHRvIGNvbXBsZXRlXG4gICAgICBhd2FpdCB3YWl0Rm9yQ29uZGl0aW9uKCgpID0+IHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluY2x1ZGVzKCcvc3VibWl0dGVkJyksIDUwMDApXG5cbiAgICAgIHN0YXRzTG9nZ2VyLmxvZygnU3VjY2Vzc2Z1bGx5IG5hdmlnYXRlZCB0byBzdWJtaXR0ZWQgcG9zdHMgcGFnZScpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgc3RhdHNMb2dnZXIuZXJyb3IoJ0Vycm9yIG5hdmlnYXRpbmcgdG8gUG9zdHMgdGFiOicsIGVycm9yKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBxdWVyeSBhbGwgZWxlbWVudHMgaW5jbHVkaW5nIHNoYWRvdyBET01cbmZ1bmN0aW9uIHF1ZXJ5U2hhZG93RE9NQWxsKHNlbGVjdG9yLCByb290ID0gZG9jdW1lbnQpIHtcbiAgY29uc3QgZWxlbWVudHMgPSBBcnJheS5mcm9tKHJvb3QucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpXG5cbiAgLy8gUmVjdXJzaXZlbHkgc2VhcmNoIHNoYWRvdyByb290c1xuICBjb25zdCBhbGxFbGVtZW50cyA9IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnKicpXG4gIGZvciAoY29uc3QgZWwgb2YgYWxsRWxlbWVudHMpIHtcbiAgICBpZiAoZWwuc2hhZG93Um9vdCkge1xuICAgICAgY29uc3Qgc2hhZG93RWxlbWVudHMgPSBxdWVyeVNoYWRvd0RPTUFsbChzZWxlY3RvciwgZWwuc2hhZG93Um9vdClcbiAgICAgIGVsZW1lbnRzLnB1c2goLi4uc2hhZG93RWxlbWVudHMpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnRzXG59XG4vLyBIYW5kbGUgY2hlY2sgdXNlciBzdGF0dXMgcmVxdWVzdFxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2hlY2tVc2VyU3RhdHVzKHVzZXJOYW1lKSB7XG4gIHN0YXRzTG9nZ2VyLmxvZygnQ2hlY2sgdXNlciBzdGF0dXMgcmVxdWVzdCBmb3I6JywgdXNlck5hbWUpXG5cbiAgdHJ5IHtcbiAgICAvLyBDaGVjayBpZiBjdXJyZW50IHVzZXIgbWF0Y2hlcyB0aGUgc3RvcmVkIHVzZXJcbiAgICBsZXQgY3VycmVudFVzZXIgPSBleHRyYWN0VXNlcm5hbWVGcm9tUGFnZSgpXG4gICAgbGV0IHN0b3JlZFVzZXIgPSBhd2FpdCBnZXRTdG9yZWRVc2VybmFtZSgpXG5cbiAgICAvLyBJZiBubyBjdXJyZW50IHVzZXIgZm91bmQsIGF0dGVtcHQgYXV0b21hdGljIG5hdmlnYXRpb25cbiAgICBpZiAoIWN1cnJlbnRVc2VyKSB7XG4gICAgICBzdGF0c0xvZ2dlci5sb2coJ05vIHVzZXJuYW1lIGZvdW5kIG9uIGN1cnJlbnQgcGFnZSwgYXR0ZW1wdGluZyBhdXRvbWF0aWMgbmF2aWdhdGlvbicpXG5cbiAgICAgIC8vIFVwZGF0ZSBzdGF0dXMgdG8gc2hvdyBuYXZpZ2F0aW9uIGF0dGVtcHRcbiAgICAgIGNvbnN0IG5hdmlnYXRpb25TdGF0dXMgPSB7XG4gICAgICAgIGN1cnJlbnRVc2VyOiBudWxsLFxuICAgICAgICBzdG9yZWRVc2VyOiBzdG9yZWRVc2VyPy5zZXJlbl9uYW1lIHx8IG51bGwsXG4gICAgICAgIGlzTWF0Y2g6IGZhbHNlLFxuICAgICAgICBsYXN0Q2hlY2s6IHN0b3JlZFVzZXI/Lmxhc3RDaGVjayB8fCBudWxsLFxuICAgICAgICBwb3N0c0NvdW50OiAwLFxuICAgICAgICBjdXJyZW50VXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICBjb2xsZWN0aW5nUG9zdHNEYXRhOiB0cnVlLFxuICAgICAgICBkYXRhRnJlc2g6IGZhbHNlLFxuICAgICAgICBzdGF0dXNNZXNzYWdlOiAnQXR0ZW1wdGluZyBhdXRvbWF0aWMgbmF2aWdhdGlvbiB0byB1c2VyIHByb2ZpbGUuLi4nXG4gICAgICB9XG5cbiAgICAgIC8vIERvbid0IHNhdmUgaW5jb21wbGV0ZSBzdGF0dXMgLSBsZXQgdGhlIGNvbXBsZXRlIGRhdGEgb3ZlcndyaXRlIGl0XG4gICAgICAvLyBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoe1xuICAgICAgLy8gICB1c2VyU3RhdHVzOiBuYXZpZ2F0aW9uU3RhdHVzXG4gICAgICAvLyB9KS5jYXRjaCgoKSA9PiB7fSlcblxuICAgICAgY29uc3QgbmF2aWdhdGlvblN1Y2Nlc3MgPSBhd2FpdCBoYW5kbGVVc2VyTm90Rm91bmROYXZpZ2F0aW9uKClcbiAgICAgIGlmIChuYXZpZ2F0aW9uU3VjY2Vzcykge1xuICAgICAgICBzdGF0c0xvZ2dlci5sb2coJ0F1dG9tYXRpYyBuYXZpZ2F0aW9uIHRvIHByb2ZpbGUgc3VjY2Vzc2Z1bCcpXG4gICAgICAgIC8vIERvbid0IHNhdmUgaW50ZXJtZWRpYXRlIHN0YXR1cyAtIGxldCBjb21wbGV0ZSBkYXRhIG92ZXJ3cml0ZSBpdFxuICAgICAgICAvLyBjb25zdCBwcm9maWxlU3RhdHVzID0ge1xuICAgICAgICAvLyAgIC4uLm5hdmlnYXRpb25TdGF0dXMsXG4gICAgICAgIC8vICAgc3RhdHVzTWVzc2FnZTogJ1N1Y2Nlc3NmdWxseSBuYXZpZ2F0ZWQgdG8gdXNlciBwcm9maWxlLCBwcm9jZWVkaW5nIHRvIHBvc3RzLi4uJ1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgLy8gY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcbiAgICAgICAgLy8gICB1c2VyU3RhdHVzOiBwcm9maWxlU3RhdHVzXG4gICAgICAgIC8vIH0pLmNhdGNoKCgpID0+IHt9KVxuXG4gICAgICAgIC8vIEFmdGVyIHByb2ZpbGUgbmF2aWdhdGlvbiwgdHJ5IHRvIG5hdmlnYXRlIHRvIHBvc3RzXG4gICAgICAgIGNvbnN0IHBvc3RzTmF2aWdhdGlvblN1Y2Nlc3MgPSBhd2FpdCBuYXZpZ2F0ZVRvUG9zdHNGcm9tUHJvZmlsZSgpXG4gICAgICAgIGlmIChwb3N0c05hdmlnYXRpb25TdWNjZXNzKSB7XG4gICAgICAgICAgc3RhdHNMb2dnZXIubG9nKCdBdXRvbWF0aWMgbmF2aWdhdGlvbiB0byBwb3N0cyBzdWNjZXNzZnVsJylcbiAgICAgICAgICAvLyBBdCB0aGlzIHBvaW50LCBjb250aW51ZVByb2ZpbGVEYXRhQ29sbGVjdGlvbiB3aWxsIGhhbmRsZSB0aGUgcmVzdFxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFBvc3RzIG5hdmlnYXRpb24gZmFpbGVkXG4gICAgICAgICAgY29uc3QgcG9zdHNGYWlsZWRTdGF0dXMgPSB7XG4gICAgICAgICAgICAuLi5wcm9maWxlU3RhdHVzLFxuICAgICAgICAgICAgY29sbGVjdGluZ1Bvc3RzRGF0YTogZmFsc2UsXG4gICAgICAgICAgICBwb3N0c0RhdGFFcnJvcjogJ0ZhaWxlZCB0byBuYXZpZ2F0ZSB0byBQb3N0cyB0YWIgZnJvbSBwcm9maWxlIHBhZ2UnXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcbiAgICAgICAgICAgIHVzZXJTdGF0dXM6IHBvc3RzRmFpbGVkU3RhdHVzXG4gICAgICAgICAgfSkuY2F0Y2goKCkgPT4ge30pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFByb2ZpbGUgbmF2aWdhdGlvbiBmYWlsZWRcbiAgICAgICAgY29uc3QgcHJvZmlsZUZhaWxlZFN0YXR1cyA9IHtcbiAgICAgICAgICAuLi5uYXZpZ2F0aW9uU3RhdHVzLFxuICAgICAgICAgIGNvbGxlY3RpbmdQb3N0c0RhdGE6IGZhbHNlLFxuICAgICAgICAgIHBvc3RzRGF0YUVycm9yOiAnRmFpbGVkIHRvIG5hdmlnYXRlIHRvIHVzZXIgcHJvZmlsZSdcbiAgICAgICAgfVxuXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICAgICAgdXNlclN0YXR1czogcHJvZmlsZUZhaWxlZFN0YXR1c1xuICAgICAgICB9KS5jYXRjaCgoKSA9PiB7fSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gR2V0IGNhY2hlZCBwcm9maWxlIGRhdGEgdG8gc2VlIGlmIHdlIG5lZWQgZnJlc2ggY29sbGVjdGlvblxuICAgIGNvbnN0IHByb2ZpbGVEYXRhID0gYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsncmVkZGl0UHJvZmlsZURhdGEnLCAnbGF0ZXN0UG9zdHNEYXRhJ10pXG4gICAgY29uc3QgY2FjaGVkRGF0YSA9IHByb2ZpbGVEYXRhLnJlZGRpdFByb2ZpbGVEYXRhXG4gICAgY29uc3QgbGF0ZXN0UG9zdHMgPSBwcm9maWxlRGF0YS5sYXRlc3RQb3N0c0RhdGFcbiAgICBjb25zdCBpc0RhdGFTdGFsZSA9ICFsYXRlc3RQb3N0cyB8fCAoRGF0ZS5ub3coKSAtIGxhdGVzdFBvc3RzLmxhc3RVcGRhdGVkID4gMzYwMDAwMCkgLy8gMSBob3VyXG5cbiAgICAvLyBVc2UgbGF0ZXN0UG9zdHNEYXRhIGZvciBwb3N0cyBjb3VudCwgbm90IHRoZSBvbGQgcmVkZGl0UHJvZmlsZURhdGFcbiAgICBjb25zdCBwb3N0c0NvdW50ID0gbGF0ZXN0UG9zdHM/LnBvc3RzSW5mbz8udG90YWwgfHwgbGF0ZXN0UG9zdHM/LnBvc3RzSW5mbz8ucG9zdHM/Lmxlbmd0aCB8fCAwXG5cbiAgICBjb25zdCBzdGF0dXMgPSB7XG4gICAgICBjdXJyZW50VXNlcjogY3VycmVudFVzZXIsXG4gICAgICBzdG9yZWRVc2VyOiBzdG9yZWRVc2VyPy5zZXJlbl9uYW1lIHx8IG51bGwsXG4gICAgICBpc01hdGNoOiBjdXJyZW50VXNlciA9PT0gc3RvcmVkVXNlcj8uc2VyZW5fbmFtZSxcbiAgICAgIGxhc3RDaGVjazogc3RvcmVkVXNlcj8ubGFzdENoZWNrIHx8IG51bGwsXG4gICAgICBwb3N0c0NvdW50OiBwb3N0c0NvdW50LFxuICAgICAgY3VycmVudFVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICBjb2xsZWN0aW5nUG9zdHNEYXRhOiBmYWxzZSxcbiAgICAgIGRhdGFGcmVzaDogIWlzRGF0YVN0YWxlICYmIGxhdGVzdFBvc3RzPy51c2VyTmFtZSA9PT0gY3VycmVudFVzZXIsXG4gICAgICBzdGF0dXNNZXNzYWdlOiBpc0RhdGFTdGFsZSA/ICdEYXRhIGlzIHN0YWxlLCBjb2xsZWN0aW5nIGZyZXNoIHBvc3RzLi4uJyA6ICdVc2luZyBjYWNoZWQgZGF0YSdcbiAgICB9XG5cbiAgICBzdGF0c0xvZ2dlci5sb2coJ1VzZXIgc3RhdHVzIGNoZWNrIHJlc3VsdDonLCBzdGF0dXMpXG5cbiAgICAvLyBTdG9yZSBpbml0aWFsIHN0YXR1cyBpbiBjaHJvbWUuc3RvcmFnZVxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICB1c2VyU3RhdHVzOiBzdGF0dXNcbiAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgIHN0YXRzTG9nZ2VyLmxvZygnVXNlciBzdGF0dXMgc3RvcmVkIGluIGxvY2FsIHN0b3JhZ2UnKVxuICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgIHN0YXRzTG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gc3RvcmUgdXNlciBzdGF0dXM6JywgZXJyb3IpXG4gICAgfSlcblxuICAgIC8vIE9ubHkgY29sbGVjdCBmcmVzaCBwb3N0cyBkYXRhIGlmIHdlIGhhdmUgYSBjdXJyZW50IHVzZXIgYW5kIGRhdGEgaXMgc3RhbGVcbiAgICBpZiAoY3VycmVudFVzZXIgJiYgaXNEYXRhU3RhbGUpIHtcbiAgICAgIHN0YXRzTG9nZ2VyLmxvZygnQ29sbGVjdGluZyBmcmVzaCBwb3N0cyBkYXRhIGZvciB1c2VyOicsIGN1cnJlbnRVc2VyKVxuXG4gICAgICAvLyBVcGRhdGUgc3RhdHVzIHRvIHNob3cgY29sbGVjdGlvbiBpcyBzdGFydGluZywgYnV0IHByZXNlcnZlIHBvc3RzIGNvdW50XG4gICAgICBjb25zdCBjb2xsZWN0aW5nU3RhdHVzID0ge1xuICAgICAgICAuLi5zdGF0dXMsXG4gICAgICAgIGNvbGxlY3RpbmdQb3N0c0RhdGE6IHRydWUsXG4gICAgICAgIGRhdGFGcmVzaDogZmFsc2UsXG4gICAgICAgIHN0YXR1c01lc3NhZ2U6ICdDb2xsZWN0aW5nIGZyZXNoIHBvc3RzIGRhdGEuLi4nXG4gICAgICB9XG5cbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICAgIHVzZXJTdGF0dXM6IGNvbGxlY3RpbmdTdGF0dXNcbiAgICAgIH0pLmNhdGNoKCgpID0+IHt9KVxuXG4gICAgICAvLyBTdG9yZSB1c2VybmFtZSBmb3IgdGhlIHByb2ZpbGUgZGV0ZWN0aW9uIGZsb3dcbiAgICAgIGF3YWl0IGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0KHtcbiAgICAgICAgcmVkZGl0VXNlcjoge1xuICAgICAgICAgIHNlcmVuX25hbWU6IGN1cnJlbnRVc2VyLFxuICAgICAgICAgIGxhc3RDaGVjazogRGF0ZS5ub3coKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAvLyBUcmlnZ2VyIHRoZSBmdWxsIHByb2ZpbGUgZGV0ZWN0aW9uIGZsb3cgdG8gY29sbGVjdCBwb3N0cyBkYXRhXG4gICAgICBhd2FpdCBydW5Qcm9maWxlRGV0ZWN0aW9uU2NyaXB0KClcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnRVc2VyICYmICFpc0RhdGFTdGFsZSkge1xuICAgICAgc3RhdHNMb2dnZXIubG9nKCdVc2luZyBjYWNoZWQgcG9zdHMgZGF0YSBmb3IgdXNlcjonLCBjdXJyZW50VXNlcilcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdHNMb2dnZXIubG9nKCdObyBjdXJyZW50IHVzZXIgZm91bmQsIGNhbm5vdCBjb2xsZWN0IHBvc3RzIGRhdGEnKVxuICAgIH1cblxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHN0YXRzTG9nZ2VyLmVycm9yKCdFcnJvciBjaGVja2luZyB1c2VyIHN0YXR1czonLCBlcnJvcilcblxuICAgIC8vIFN0b3JlIGVycm9yIHN0YXR1cyBpbiBzdG9yYWdlXG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcbiAgICAgIHVzZXJTdGF0dXM6IHtcbiAgICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgY29sbGVjdGluZ1Bvc3RzRGF0YTogZmFsc2UsXG4gICAgICAgIHN0YXR1c01lc3NhZ2U6ICdFcnJvciBvY2N1cnJlZCBkdXJpbmcgc3RhdHVzIGNoZWNrJ1xuICAgICAgfVxuICAgIH0pLmNhdGNoKCgpID0+IHt9KVxuICB9XG59XG5cbi8vIE1lc3NhZ2UgbGlzdGVuZXJcbi8vIEluaXRpYWxpemUgc3RhdHMgc2NyaXB0XG5zdGF0c0xvZ2dlci5sb2coJ1N0YXRzIGNvbnRlbnQgc2NyaXB0IGxvYWRlZCBvbiBVUkw6Jywgd2luZG93LmxvY2F0aW9uLmhyZWYpXG5cbi8vIEV4aXQgZWFybHkgaWYgd2UncmUgb24gYSBzdWJtaXQgcGFnZSAodGhpcyBzaG91bGRuJ3QgaGFwcGVuIGJ1dCBwcmV2ZW50cyBtZXNzYWdlIGNvbmZsaWN0cylcbmlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmNsdWRlcygnL3N1Ym1pdCcpKSB7XG4gIHN0YXRzTG9nZ2VyLndhcm4oJ1N0YXRzIHNjcmlwdCBsb2FkZWQgb24gc3VibWl0IHBhZ2UgLSB0aGlzIHNob3VsZCBub3QgaGFwcGVuLiBFeGl0aW5nIGVhcmx5LicpXG4gIC8vIERvbid0IHNldCB1cCBtZXNzYWdlIGxpc3RlbmVyIHRvIGF2b2lkIGNvbmZsaWN0c1xufSBlbHNlIHtcbiAgLy8gSW5pdGlhbGl6ZSB1c2VybmFtZSBjYWNoZSBmcm9tIHN0b3JhZ2VcbiAgaW5pdGlhbGl6ZVVzZXJuYW1lQ2FjaGUoKVxuXG4gIC8vIE9ubHkgc2V0IHVwIG1lc3NhZ2UgbGlzdGVuZXIgaWYgbm90IG9uIHN1Ym1pdCBwYWdlXG4gIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgICBzdGF0c0xvZ2dlci5sb2coJ1N0YXRzIHNjcmlwdCByZWNlaXZlZCBtZXNzYWdlOicsIG1lc3NhZ2UpXG5cbiAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgY2FzZSAnREVMRVRFX0xBU1RfUE9TVCc6XG4gICAgICAgIC8vIERlbGV0ZSBwb3N0IGlzIGhhbmRsZWQgYnkgdGhlIG1haW4gY29udGVudCBzY3JpcHQsIGlnbm9yZSBoZXJlXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ0NIRUNLX1VTRVJfU1RBVFVTJzpcbiAgICAgICAgaGFuZGxlQ2hlY2tVc2VyU3RhdHVzKG1lc3NhZ2UudXNlck5hbWUpXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ01BTlVBTF9UUklHR0VSX1NDUklQVCc6XG4gICAgICAgIGhhbmRsZU1hbnVhbFNjcmlwdFRyaWdnZXIobWVzc2FnZS5zY3JpcHRUeXBlLCBtZXNzYWdlLm1vZGUpXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ0dFVF9GUkVTSF9QT1NUU19GT1JfREVDSVNJT04nOlxuICAgICAgICAvLyBcdUQ4M0NcdURGQUYgTkVXOiBIYW5kbGUgZnJlc2ggcG9zdHMgZGF0YSBjb2xsZWN0aW9uIGZvciBhdXRvZmxvdyBkZWNpc2lvblxuICAgICAgICBzdGF0c0xvZ2dlci5sb2coJ1x1RDgzRFx1RENDQSBTdGF0cyBzY3JpcHQgcmVjZWl2ZWQgR0VUX0ZSRVNIX1BPU1RTX0ZPUl9ERUNJU0lPTiBmb3IgdXNlcjonLCBtZXNzYWdlLnVzZXJOYW1lKVxuICAgICAgICBnZXRQb3N0c0RhdGFGb3JBdXRvZmxvd0RlY2lzaW9uKG1lc3NhZ2UudXNlck5hbWUpLnRoZW4oZnJlc2hEYXRhID0+IHtcbiAgICAgICAgICBzdGF0c0xvZ2dlci5sb2coJ1x1RDgzRFx1RENDQSBTdGF0cyBzY3JpcHQgY29sbGVjdGVkIGZyZXNoIGRhdGEsIHNlbmRpbmcgcmVzcG9uc2U6JywgZnJlc2hEYXRhKVxuICAgICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6ICdGUkVTSF9QT1NUU19DT0xMRUNURUQnLFxuICAgICAgICAgICAgZGF0YTogZnJlc2hEYXRhXG4gICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgc3RhdHNMb2dnZXIuZXJyb3IoJ1x1RDgzRFx1RENDQSBGYWlsZWQgdG8gc2VuZCBGUkVTSF9QT1NUU19DT0xMRUNURUQgbWVzc2FnZTonLCBlcnJvcilcbiAgICAgICAgICB9KVxuICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgc3RhdHNMb2dnZXIuZXJyb3IoJ1x1RDgzRFx1RENDQSBFcnJvciBpbiBnZXRQb3N0c0RhdGFGb3JBdXRvZmxvd0RlY2lzaW9uOicsIGVycm9yKVxuICAgICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6ICdGUkVTSF9QT1NUU19DT0xMRUNURUQnLFxuICAgICAgICAgICAgZGF0YTogeyBlcnJvcjogZXJyb3IubWVzc2FnZSwgZGF0YUZyZXNoOiBmYWxzZSB9XG4gICAgICAgICAgfSkuY2F0Y2goc2VuZEVycm9yID0+IHtcbiAgICAgICAgICAgIHN0YXRzTG9nZ2VyLmVycm9yKCdcdUQ4M0RcdURDQ0EgRmFpbGVkIHRvIHNlbmQgZXJyb3IgcmVzcG9uc2U6Jywgc2VuZEVycm9yKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ1JFRERJVF9QQUdFX0xPQURFRCc6XG4gICAgICAgIGNvbnN0IGN1cnJlbnRTY3JpcHRTdGFnZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtc2NyaXB0LXN0YWdlJylcbiAgICAgICAgaWYgKGN1cnJlbnRTY3JpcHRTdGFnZSA9PT0gJ3Byb2ZpbGUtc3dpdGNoaW5nLXRvLXBvc3RzJyAmJiB3aW5kb3cubG9jYXRpb24uaHJlZi5pbmNsdWRlcygnL3N1Ym1pdHRlZCcpKSB7XG4gICAgICAgICAgc3RhdHNMb2dnZXIubG9nKCdSZWRkaXQgcGFnZSBsb2FkZWQgYWZ0ZXIgbmF2aWdhdGlvbiwgY29udGludWluZyBwcm9maWxlIGRhdGEgY29sbGVjdGlvbicpXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBjb250aW51ZVByb2ZpbGVEYXRhQ29sbGVjdGlvbigpLCAyMDAwKVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHN0YXRzTG9nZ2VyLmxvZygnU3RhdHMgc2NyaXB0OiBVbmtub3duIG1lc3NhZ2UgdHlwZTonLCBtZXNzYWdlLnR5cGUpXG4gICAgfVxuICB9KVxuXG4gIC8vIENoZWNrIGZvciBhbmQgY2xlYXIgc3RhbGUgc2Vzc2lvblN0b3JhZ2UgZmxhZ3MgKHByZXZlbnQgXCJzdGVwIGlzIHN0aWxsIHJ1bm5pbmdcIiBsb2NrdXBzKVxuICBjb25zdCBzY3JpcHRTdGFnZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3JlZGRpdC1wb3N0LW1hY2hpbmUtc2NyaXB0LXN0YWdlJylcbiAgaWYgKHNjcmlwdFN0YWdlKSB7XG4gICAgY29uc3Qgc3RhZ2VUaW1lc3RhbXAgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdyZWRkaXQtcG9zdC1tYWNoaW5lLXNjcmlwdC1zdGFnZS10aW1lc3RhbXAnKVxuICAgIGlmIChzdGFnZVRpbWVzdGFtcCAmJiAoRGF0ZS5ub3coKSAtIHBhcnNlSW50KHN0YWdlVGltZXN0YW1wKSA+IDMwMDAwMCkpIHsgLy8gNSBtaW51dGVzXG4gICAgICBzdGF0c0xvZ2dlci5sb2coJ0NsZWFyaW5nIHN0YWxlIHNjcmlwdCBzdGFnZSBmbGFnOicsIHNjcmlwdFN0YWdlKVxuICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgncmVkZGl0LXBvc3QtbWFjaGluZS1zY3JpcHQtc3RhZ2UnKVxuICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgncmVkZGl0LXBvc3QtbWFjaGluZS1zY3JpcHQtc3RhZ2UtdGltZXN0YW1wJylcbiAgICB9XG4gIH1cblxuICAvLyBDaGVjayBpZiB3ZSBuZWVkIHRvIGNvbnRpbnVlIHByb2ZpbGUgZGF0YSBjb2xsZWN0aW9uIGZyb20gcHJldmlvdXMgbmF2aWdhdGlvblxuICBpZiAoc2NyaXB0U3RhZ2UgPT09ICdwcm9maWxlLXN3aXRjaGluZy10by1wb3N0cycgJiYgd2luZG93LmxvY2F0aW9uLmhyZWYuaW5jbHVkZXMoJy9zdWJtaXR0ZWQnKSkge1xuICAgIHN0YXRzTG9nZ2VyLmxvZygnQ29udGludWluZyBwcm9maWxlIGRhdGEgY29sbGVjdGlvbiBmcm9tIHByZXZpb3VzIG5hdmlnYXRpb24nKVxuICAgIHNldFRpbWVvdXQoKCkgPT4gY29udGludWVQcm9maWxlRGF0YUNvbGxlY3Rpb24oKSwgMjAwMClcbiAgfSBlbHNlIGlmIChzY3JpcHRTdGFnZSA9PT0gJ3Byb2ZpbGUtbmF2aWdhdGluZycgJiYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluY2x1ZGVzKCcvdS8nKSB8fCB3aW5kb3cubG9jYXRpb24uaHJlZi5pbmNsdWRlcygnL3VzZXIvJykpKSB7XG4gICAgc3RhdHNMb2dnZXIubG9nKCdPbiBwcm9maWxlIHBhZ2UgYWZ0ZXIgYXV0b21hdGljIG5hdmlnYXRpb24sIHByb2NlZWRpbmcgdG8gcG9zdHMnKVxuICAgIHNldFRpbWVvdXQoKCkgPT4gbmF2aWdhdGVUb1Bvc3RzRnJvbVByb2ZpbGUoKSwgMjAwMClcbiAgfVxufVxuXG4vLyBOb3RlOiBBdXRvLXJ1biBkaXNhYmxlZCB0byBwcmV2ZW50IGF1dG9tYXRpYyB0YWIgY3JlYXRpb25cbi8vIEF1dG8tcnVuIHdvdWxkIGJlIHRyaWdnZXJlZCBoZXJlIGlmIG5lZWRlZFxuXG4vLyBFeHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmb3IgUXVhc2FyIGJyaWRnZSBjb21wYXRpYmlsaXR5XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoYnJpZGdlKSB7XG4gIC8vIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGJ5IFF1YXNhcidzIEJFWCBicmlkZ2Ugc3lzdGVtXG4gIHN0YXRzTG9nZ2VyLmxvZygnU3RhdHMgc2NyaXB0IGJyaWRnZSBpbml0aWFsaXplZCcsIGJyaWRnZSlcbn1cbiIsICIvKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyoqXG4gKiBUSElTIEZJTEUgSVMgR0VORVJBVEVEIEFVVE9NQVRJQ0FMTFkuXG4gKiBETyBOT1QgRURJVC5cbiAqXG4gKiBZb3UgYXJlIHByb2JhYmx5IGxvb2tpbmcgaW50byBhZGRpbmcgaG9va3MgaW4geW91ciBjb2RlLiBUaGlzIHNob3VsZCBiZSBkb25lIGJ5IG1lYW5zIG9mXG4gKiBzcmMtYmV4L2pzL2NvbnRlbnQtaG9va3MuanMgd2hpY2ggaGFzIGFjY2VzcyB0byB0aGUgYnJvd3NlciBpbnN0YW5jZSBhbmQgY29tbXVuaWNhdGlvbiBicmlkZ2VcbiAqKi9cblxuLyogZ2xvYmFsIGNocm9tZSAqL1xuXG5pbXBvcnQgQnJpZGdlIGZyb20gJy4vYnJpZGdlJ1xuaW1wb3J0IHsgbGlzdGVuRm9yV2luZG93RXZlbnRzIH0gZnJvbSAnLi93aW5kb3ctZXZlbnQtbGlzdGVuZXInXG5pbXBvcnQgcnVuRGV2bGFuZENvbnRlbnRTY3JpcHQgZnJvbSAnLi4vLi4vc3JjLWJleC9zdGF0cy1jb250ZW50LXNjcmlwdCdcblxuY29uc3QgcG9ydCA9IGNocm9tZS5ydW50aW1lLmNvbm5lY3Qoe1xuICBuYW1lOiAnY29udGVudFNjcmlwdCdcbn0pXG5cbmxldCBkaXNjb25uZWN0ZWQgPSBmYWxzZVxucG9ydC5vbkRpc2Nvbm5lY3QuYWRkTGlzdGVuZXIoKCkgPT4ge1xuICBkaXNjb25uZWN0ZWQgPSB0cnVlXG59KVxuXG5sZXQgYnJpZGdlID0gbmV3IEJyaWRnZSh7XG4gIGxpc3RlbiAoZm4pIHtcbiAgICBwb3J0Lm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihmbilcbiAgfSxcbiAgc2VuZCAoZGF0YSkge1xuICAgIGlmICghZGlzY29ubmVjdGVkKSB7XG4gICAgICBwb3J0LnBvc3RNZXNzYWdlKGRhdGEpXG4gICAgICB3aW5kb3cucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAuLi5kYXRhLFxuICAgICAgICBmcm9tOiAnYmV4LWNvbnRlbnQtc2NyaXB0J1xuICAgICAgfSwgJyonKVxuICAgIH1cbiAgfVxufSlcblxuLy8gSW5qZWN0IG91ciBkb20gc2NyaXB0IGZvciBjb21tdW5pY2F0aW9ucy5cbmZ1bmN0aW9uIGluamVjdFNjcmlwdCAodXJsKSB7XG4gIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG4gIHNjcmlwdC5zcmMgPSB1cmxcbiAgc2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnJlbW92ZSgpXG4gIH1cbiAgOyhkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkuYXBwZW5kQ2hpbGQoc2NyaXB0KVxufVxuXG5pZiAoZG9jdW1lbnQgaW5zdGFuY2VvZiBIVE1MRG9jdW1lbnQpIHtcbiAgaW5qZWN0U2NyaXB0KGNocm9tZS5ydW50aW1lLmdldFVSTCgnZG9tLmpzJykpXG59XG5cbi8vIExpc3RlbiBmb3IgZXZlbnQgZnJvbSB0aGUgd2ViIHBhZ2Vcbmxpc3RlbkZvcldpbmRvd0V2ZW50cyhicmlkZ2UsICdiZXgtZG9tJylcblxucnVuRGV2bGFuZENvbnRlbnRTY3JpcHQoYnJpZGdlKVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBdUJBLFVBQUksSUFBSSxPQUFPLFlBQVksV0FBVyxVQUFVO0FBQ2hELFVBQUksZUFBZSxLQUFLLE9BQU8sRUFBRSxVQUFVLGFBQ3ZDLEVBQUUsUUFDRixTQUFTQSxjQUFhLFFBQVEsVUFBVSxNQUFNO0FBQzlDLGVBQU8sU0FB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QkFBWSxJQUFJLGlFQUFpRTtBQUNqRixpQkFBVyxNQUFNLDJCQUEyQixHQUFHLEdBQUk7QUFBQSxJQUNyRDtBQUFBLEVBQ0Y7QUFNZSxXQUFSLDZCQUFrQkMsU0FBUTtBQUUvQixnQkFBWSxJQUFJLG1DQUFtQ0EsT0FBTTtBQUFBLEVBQzNEOzs7QUM5M0NBLE1BQU0sT0FBTyxPQUFPLFFBQVEsUUFBUTtBQUFBLElBQ2xDLE1BQU07QUFBQSxFQUNSLENBQUM7QUFFRCxNQUFJLGVBQWU7QUFDbkIsT0FBSyxhQUFhLFlBQVksTUFBTTtBQUNsQyxtQkFBZTtBQUFBLEVBQ2pCLENBQUM7QUFFRCxNQUFJLFNBQVMsSUFBSSxPQUFPO0FBQUEsSUFDdEIsT0FBUSxJQUFJO0FBQ1YsV0FBSyxVQUFVLFlBQVksRUFBRTtBQUFBLElBQy9CO0FBQUEsSUFDQSxLQUFNLE1BQU07QUFDVixVQUFJLENBQUMsY0FBYztBQUNqQixhQUFLLFlBQVksSUFBSTtBQUNyQixlQUFPLFlBQVk7QUFBQSxVQUNqQixHQUFHO0FBQUEsVUFDSCxNQUFNO0FBQUEsUUFDUixHQUFHLEdBQUc7QUFBQSxNQUNSO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUdELFdBQVMsYUFBYyxLQUFLO0FBQzFCLFVBQU0sU0FBUyxTQUFTLGNBQWMsUUFBUTtBQUM5QyxXQUFPLE1BQU07QUFDYixXQUFPLFNBQVMsV0FBWTtBQUMxQixXQUFLLE9BQU87QUFBQSxJQUNkO0FBQ0MsS0FBQyxTQUFTLFFBQVEsU0FBUyxpQkFBaUIsWUFBWSxNQUFNO0FBQUEsRUFDakU7QUFFQSxNQUFJLG9CQUFvQixjQUFjO0FBQ3BDLGlCQUFhLE9BQU8sUUFBUSxPQUFPLFFBQVEsQ0FBQztBQUFBLEVBQzlDO0FBR0Esd0JBQXNCLFFBQVEsU0FBUztBQUV2QywrQkFBd0IsTUFBTTsiLAogICJuYW1lcyI6IFsiUmVmbGVjdEFwcGx5IiwgIlJlZmxlY3RPd25LZXlzIiwgIk51bWJlcklzTmFOIiwgIkV2ZW50RW1pdHRlciIsICJvbmNlIiwgImJyaWRnZSIsICJicmlkZ2UiXQp9Cg==
