(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

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

  // node_modules/quasar/wrappers/index.js
  function bexBackground(callback) {
    return callback;
  }

  // src-bex/state-manager.js
  var SM_STEPS = {
    IDLE: "IDLE",
    NAVIGATING_PROFILE: "NAVIGATING_PROFILE",
    NAVIGATING_POSTS: "NAVIGATING_POSTS",
    COLLECTING_POSTS: "COLLECTING_POSTS",
    DELETING_POST: "DELETING_POST",
    POSTING: "POSTING"
  };
  var tabStates = {};
  var processedTabs = /* @__PURE__ */ new Set();
  var CHECK_INTERVAL = 121e3;
  var checkIntervalId = null;
  var STALL_TIMEOUT_MS = 5 * 60 * 1e3;
  var stallWatchdogIntervalId = null;
  function getCheckIntervalId() {
    return checkIntervalId;
  }
  function setCheckIntervalId(id) {
    checkIntervalId = id;
  }
  function setStallWatchdogIntervalId(id) {
    stallWatchdogIntervalId = id;
  }
  function touchTabState(state) {
    if (state)
      state.lastFeedbackTimestamp = Date.now();
  }
  var AutoFlowStateManager = class {
    static getStateKey(userName) {
      return `autoFlowState_${userName}`;
    }
    static async saveState(step, data = {}) {
      const userName = data.userName;
      if (!userName)
        return;
      const stateKey = this.getStateKey(userName);
      const currentState = await this.getState(userName);
      let attemptCount = 1;
      if (currentState && currentState.currentStep === step) {
        attemptCount = (currentState.attemptCount || 1) + 1;
        if (attemptCount > 5) {
          stateLogger.log(
            `[AutoFlowStateManager] \u26A0\uFE0F Too many retry attempts (${attemptCount}) for step ${step}, clearing state for user ${data.userName}`
          );
          await this.clearState(data.userName);
          return;
        }
      } else if (currentState) {
        stateLogger.log(
          `[AutoFlowStateManager] \u{1F504} Progressing from ${currentState.currentStep} to ${step}, resetting attempt count`
        );
      }
      const state = {
        status: "in_progress",
        currentStep: step,
        attemptCount,
        lastAttemptTimestamp: Date.now(),
        targetAction: data.targetAction || "create",
        userName: data.userName || null,
        lastPostToDelete: data.lastPostToDelete || null,
        postData: data.postData || null,
        decisionReport: data.decisionReport || null,
        tabId: data.tabId || null,
        ...data
      };
      try {
        await chrome.storage.local.set({ [stateKey]: state });
        stateLogger.log(
          `[AutoFlowStateManager] \u{1F4BE} State saved: ${step} for user ${data.userName} (attempt ${attemptCount})`,
          state
        );
      } catch (error) {
        stateLogger.error("[AutoFlowStateManager] Failed to save state:", error);
      }
    }
    static async getState(userName) {
      try {
        if (!userName)
          return null;
        const stateKey = this.getStateKey(userName);
        const result = await chrome.storage.local.get([stateKey]);
        return result[stateKey] || null;
      } catch (error) {
        stateLogger.error("[AutoFlowStateManager] Failed to get state:", error);
        return null;
      }
    }
    static async clearState(userName) {
      try {
        if (!userName)
          return;
        const stateKey = this.getStateKey(userName);
        await chrome.storage.local.remove([stateKey]);
        stateLogger.log(`[AutoFlowStateManager] \u{1F5D1}\uFE0F State cleared for user ${userName}`);
      } catch (error) {
        stateLogger.error("[AutoFlowStateManager] Failed to clear state:", error);
      }
    }
    static async isStateStale(state) {
      if (!state || !state.lastAttemptTimestamp)
        return true;
      return Date.now() - state.lastAttemptTimestamp > this.STATE_EXPIRY_MS;
    }
    static async recoverState(userName) {
      const state = await this.getState(userName);
      if (!state) {
        stateLogger.log(`[AutoFlowStateManager] No previous state found for user ${userName}`);
        return null;
      }
      if (await this.isStateStale(state)) {
        stateLogger.log(`[AutoFlowStateManager] Previous state is stale for user ${userName}, clearing it`);
        await this.clearState(userName);
        return null;
      }
      stateLogger.log(`[AutoFlowStateManager] \u{1F504} Recovering previous state for user ${userName}:`, state);
      return state;
    }
    static async validateTab(tabId) {
      try {
        const tab = await chrome.tabs.get(tabId);
        return tab && !tab.discarded;
      } catch (error) {
        stateLogger.log(`[AutoFlowStateManager] Tab ${tabId} is no longer valid:`, error.message);
        return false;
      }
    }
  };
  __publicField(AutoFlowStateManager, "STATE_EXPIRY_MS", 24 * 60 * 60 * 1e3);

  // src-bex/post-service.js
  var PostDataService = class {
    static async generatePost(agentName) {
      const maxRetries = 3;
      const retryDelay = 1e3;
      const cleanAgentName = agentName.replace(/^u\//, "");
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          postServiceLogger.log(
            `[PostDataService] Generating post for agent: ${cleanAgentName} (attempt ${attempt}/${maxRetries})`
          );
          const storageResult = await chrome.storage.sync.get(["apiConfig"]);
          const apiConfig = storageResult.apiConfig || {
            endpoint: "https://32016-51127.bacloud.info/api/method/reddit_postmachine.reddit_postmachine.doctype.subreddit_template.subreddit_template.generate_post_for_agent",
            token: "8fbbf0a7c626e18:2c3693fb52ac66f"
          };
          const requestBody = {
            agent_name: cleanAgentName
          };
          postServiceLogger.log("[PostDataService] API Request Details:", {
            endpoint: apiConfig.endpoint,
            agentName: cleanAgentName,
            body: requestBody
          });
          const response = await fetch(apiConfig.endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `token ${apiConfig.token}`
            },
            body: JSON.stringify(requestBody)
          });
          let data;
          try {
            data = await response.json();
          } catch (e) {
            postServiceLogger.error("[PostDataService] Failed to parse response as JSON:", e);
            throw new Error(`API request failed: ${response.status} ${response.statusText} - Invalid JSON response`);
          }
          if (!response.ok) {
            let errorDetails = `${response.status} ${response.statusText}`;
            postServiceLogger.error("[PostDataService] API Error Response:", data);
            errorDetails += ` - ${JSON.stringify(data)}`;
            throw new Error(`API request failed: ${errorDetails}`);
          }
          postServiceLogger.log("[PostDataService] Generated post from API:", data);
          if (data && data.message && data.message.status === "success" && data.message.post_name) {
            postServiceLogger.log("[PostDataService] Received post_name, fetching full post data:", data.message.post_name);
            const postName = data.message.post_name;
            const frappeEndpoint = `https://32016-51127.bacloud.info/api/resource/Reddit%20Post/${postName}`;
            const frappeResponse = await fetch(frappeEndpoint, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `token ${apiConfig.token}`
              }
            });
            if (!frappeResponse.ok) {
              throw new Error(`Frappe API request failed: ${frappeResponse.status} ${frappeResponse.statusText}`);
            }
            const frappeData = await frappeResponse.json();
            postServiceLogger.log("[PostDataService] Fetched full post data from Frappe:", frappeData);
            if (frappeData && frappeData.data) {
              const postData = frappeData.data;
              return {
                title: postData.title || "Generated Post",
                body: postData.body_text || postData.content || postData.body || "",
                url: postData.url_to_share || postData.url || "",
                subreddit: postData.subreddit_name || postData.subreddit || "sphynx",
                post_type: postData.post_type || "link",
                post_name: postData.name,
                account: postData.account,
                template_used: postData.template_used
              };
            }
          }
          if (data && data.message && data.message.docs && Array.isArray(data.message.docs) && data.message.docs.length > 0) {
            const apiPost = data.message.docs[0];
            return {
              title: apiPost.title || "Generated Post",
              body: apiPost.content || apiPost.body || "",
              url: apiPost.url || "",
              subreddit: apiPost.subreddit || "sphynx",
              post_type: apiPost.post_type || "link"
            };
          }
          throw new Error("Invalid API response structure or no post data returned");
        } catch (error) {
          postServiceLogger.error(`[PostDataService] API call failed (attempt ${attempt}/${maxRetries}):`, error);
          if (attempt === maxRetries) {
            const errorMessage = `Failed to generate post after ${maxRetries} attempts: ${error.message}`;
            postServiceLogger.error("[PostDataService] " + errorMessage);
            throw new Error(errorMessage);
          }
          await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1)));
        }
      }
    }
    static normalizeLatestPostsData(latestPostsData, userName) {
      if (!latestPostsData)
        return null;
      const posts = latestPostsData?.postsInfo?.posts || latestPostsData?.posts;
      if (!Array.isArray(posts))
        return null;
      const ts = latestPostsData?.lastUpdated || latestPostsData?.timestamp || latestPostsData?.lastUpdate || null;
      return {
        userName,
        postsInfo: { posts },
        lastUpdated: ts
      };
    }
    static async shouldCreatePost(postsData) {
      await AutoFlowStateManager.saveState("analyzing_posts", { postsData, userName: postsData?.userName });
      const userName = postsData?.userName;
      let deletedPostId = null;
      if (userName) {
        const deletedPostKey = `deletedPost_${userName}`;
        const deletedPostData = await chrome.storage.local.get([deletedPostKey]);
        if (deletedPostData[deletedPostKey]) {
          const deletedInfo = deletedPostData[deletedPostKey];
          if (Date.now() - deletedInfo.timestamp < 10 * 60 * 1e3) {
            deletedPostId = deletedInfo.postId;
            postServiceLogger.log(`[PostDataService] \u{1F5D1}\uFE0F Filtering out recently deleted post: ${deletedPostId}`);
          } else {
            await chrome.storage.local.remove([deletedPostKey]);
          }
        }
      }
      const decisionReport = {
        timestamp: new Date().toISOString(),
        totalPosts: postsData?.postsInfo?.posts?.length || 0,
        lastPostAge: null,
        lastPostStatus: "unknown",
        decision: "no_create",
        reason: "no_posts",
        lastPost: postsData?.lastPost || null
      };
      postServiceLogger.log("=== AUTO-FLOW DECISION ANALYSIS ===");
      postServiceLogger.log(`[PostDataService] Analyzing ${decisionReport.totalPosts} posts for auto-flow decision`);
      let postsToAnalyze = postsData?.postsInfo?.posts || [];
      if (deletedPostId && postsToAnalyze.length > 0) {
        const originalLength = postsToAnalyze.length;
        postsToAnalyze = postsToAnalyze.filter((post) => post.id !== deletedPostId);
        if (postsToAnalyze.length !== originalLength) {
          postServiceLogger.log(`[PostDataService] \u{1F5D1}\uFE0F Filtered out deleted post. Posts before: ${originalLength}, after: ${postsToAnalyze.length}`);
        }
      }
      if (!postsData || !postsData.postsInfo || postsToAnalyze.length === 0) {
        postServiceLogger.log("[PostDataService] \u274C DECISION: No posts found (after filtering deleted post), should create new post");
        decisionReport.decision = "create";
        decisionReport.reason = "no_posts";
        this.saveDecisionReport(decisionReport);
        return { shouldCreate: true, reason: "no_posts", decisionReport };
      }
      const lastPost = postsToAnalyze[0];
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
      const postDate = new Date(lastPost.timestamp);
      const ageInHours = (now - postDate) / (1e3 * 60 * 60);
      decisionReport.lastPostAge = Math.round(ageInHours * 10) / 10;
      postServiceLogger.log(`[PostDataService] \u{1F4CA} Enhanced last post details:`);
      postServiceLogger.log(`   - Title: "${lastPost.title || "No title"}"`);
      postServiceLogger.log(`   - Age: ${decisionReport.lastPostAge} hours ago`);
      postServiceLogger.log(`   - URL: ${lastPost.url || "No URL"}`);
      postServiceLogger.log(`   - Author: ${lastPost.author || "Unknown"}`);
      postServiceLogger.log(`   - Subreddit: ${lastPost.subreddit || "Unknown"}`);
      postServiceLogger.log(
        `   - Score: ${lastPost.score || 0} | Comments: ${lastPost.commentCount || 0} | Awards: ${lastPost.awardCount || 0}`
      );
      postServiceLogger.log(
        `   - Post Type: ${lastPost.postType || "Unknown"} | Domain: ${lastPost.domain || "N/A"}`
      );
      postServiceLogger.log(
        `   - Status: Removed=${lastPost.moderationStatus.isRemoved}, Blocked=${lastPost.moderationStatus.isBlocked}, Deleted=${lastPost.deleted}`
      );
      postServiceLogger.log(
        `   - Item State: ${lastPost.itemState || "Unknown"} | View Context: ${lastPost.viewContext || "Unknown"}`
      );
      if (lastPost.moderationStatus.isRemoved || lastPost.moderationStatus.isBlocked || lastPost.hasModeratorAction) {
        if (lastPost.moderationStatus.isRemoved) {
          postServiceLogger.log("[PostDataService] \u{1F5D1}\uFE0F DECISION: Last post was removed by moderators, should delete it first then create new post");
          decisionReport.decision = "create_with_delete";
          decisionReport.reason = "post_removed_by_moderator";
          decisionReport.lastPostStatus = "removed";
          this.saveDecisionReport(decisionReport);
          return { shouldCreate: true, reason: "post_removed_by_moderator", lastPost, decisionReport };
        } else {
          postServiceLogger.log("[PostDataService] \u{1F5D1}\uFE0F DECISION: Last post was blocked/moderated, should delete it first then create new post");
          decisionReport.decision = "create_with_delete";
          decisionReport.reason = "post_blocked";
          decisionReport.lastPostStatus = lastPost.isBlocked ? "blocked" : "moderated";
          this.saveDecisionReport(decisionReport);
          return { shouldCreate: true, reason: "post_blocked", lastPost, decisionReport };
        }
      }
      if (lastPost.itemState === "UNMODERATED") {
        if (ageInHours <= 1) {
          postServiceLogger.log("[PostDataService] \u23F3 DECISION: Last post is under moderation review, should wait");
          decisionReport.decision = "wait";
          decisionReport.reason = "under_moderation";
          decisionReport.lastPostStatus = "unmoderated";
          this.saveDecisionReport(decisionReport);
          return { shouldCreate: false, reason: "under_moderation", lastPost, decisionReport };
        }
        postServiceLogger.log(
          "[PostDataService] \u23F0 DECISION: Last post is still unmoderated but older than 1 hour, should create new post"
        );
        decisionReport.decision = "create";
        decisionReport.reason = "stale_unmoderated";
        decisionReport.lastPostStatus = "unmoderated";
        this.saveDecisionReport(decisionReport);
        return { shouldCreate: true, reason: "stale_unmoderated", lastPost, decisionReport };
      }
      if (lastPost.score < 0) {
        postServiceLogger.log("[PostDataService] \u{1F44E} DECISION: Last post has negative score, should create new post and delete downvoted post");
        decisionReport.decision = "create_with_delete";
        decisionReport.reason = "post_downvoted";
        decisionReport.lastPostStatus = lastPost.isRemoved ? "removed" : lastPost.isBlocked ? "blocked" : "downvoted";
        this.saveDecisionReport(decisionReport);
        return { shouldCreate: true, reason: "post_downvoted", lastPost, decisionReport };
      }
      if (ageInHours < 24) {
        postServiceLogger.log("[PostDataService] \u2705 DECISION: Last post is recent (< 24h), skipping engagement-based creation");
        decisionReport.decision = "no_create";
        decisionReport.reason = "recent_post";
        decisionReport.lastPostStatus = "active";
        this.saveDecisionReport(decisionReport);
        return { shouldCreate: false, reason: "recent_post", decisionReport };
      }
      const totalEngagement = (lastPost.score || 0) + (lastPost.commentCount || 0);
      if (totalEngagement < 2) {
        postServiceLogger.log(
          "[PostDataService] \u{1F4C9} DECISION: Last post has very low engagement (< 2), should create new post and delete low-performing post"
        );
        decisionReport.decision = "create_with_delete";
        decisionReport.reason = "low_engagement";
        decisionReport.lastPostStatus = "low_engagement";
        this.saveDecisionReport(decisionReport);
        return { shouldCreate: true, reason: "low_engagement", lastPost, decisionReport };
      }
      if (postDate < oneWeekAgo) {
        postServiceLogger.log("[PostDataService] \u23F0 DECISION: Last post is older than one week, should create new post without deletion");
        decisionReport.decision = "create";
        decisionReport.reason = "old_post";
        decisionReport.lastPostStatus = lastPost.isRemoved ? "removed" : lastPost.isBlocked ? "blocked" : "active";
        this.saveDecisionReport(decisionReport);
        return { shouldCreate: true, reason: "old_post", lastPost, decisionReport };
      }
      postServiceLogger.log("[PostDataService] \u2705 DECISION: Last post is recent and active, no new post needed");
      decisionReport.decision = "no_create";
      decisionReport.reason = "recent_post";
      decisionReport.lastPostStatus = "active";
      this.saveDecisionReport(decisionReport);
      return { shouldCreate: false, reason: "recent_post", decisionReport };
    }
    static async saveDecisionReport(decisionReport) {
      try {
        await chrome.storage.local.set({
          lastDecisionReport: decisionReport,
          lastDecisionTimestamp: decisionReport.timestamp
        });
        postServiceLogger.log("[PostDataService] \u{1F4BE} Decision report saved to storage:", decisionReport.decision);
      } catch (error) {
        postServiceLogger.error("[PostDataService] Failed to save decision report:", error);
      }
    }
    static async saveExecutionResult(executionResult) {
      try {
        await chrome.storage.local.set({
          lastExecutionResult: executionResult,
          lastExecutionTimestamp: executionResult.timestamp
        });
        postServiceLogger.log("[PostDataService] \u{1F4BE} Execution result saved to storage:", executionResult.status, "-", executionResult.postResult);
      } catch (error) {
        postServiceLogger.error("[PostDataService] Failed to save execution result:", error);
      }
    }
    static async updatePostStatusByRedditUrl(redditUrl, status = "Deleted", reason = null) {
      try {
        postServiceLogger.log(
          `[PostDataService] Updating post status for Reddit URL: ${redditUrl} to: ${status}`
        );
        const storageResult = await chrome.storage.sync.get(["apiConfig"]);
        const apiConfig = storageResult.apiConfig || {
          token: "8fbbf0a7c626e18:2c3693fb52ac66f"
        };
        const filterEndpoint = `https://32016-51127.bacloud.info/api/resource/Reddit%20Post?filters=[["reddit_post_url","=","${encodeURIComponent(redditUrl)}"]]`;
        const response = await fetch(filterEndpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${apiConfig.token}`
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to find post by URL: ${response.status}`);
        }
        const data = await response.json();
        if (!data.data || data.data.length === 0) {
          postServiceLogger.warn(`[PostDataService] No post found with Reddit URL: ${redditUrl}`);
          return null;
        }
        const postName = data.data[0].name;
        postServiceLogger.log(`[PostDataService] Found post: ${postName}, updating status`);
        const updateData = {
          status
        };
        if (reason) {
          updateData.deletion_reason = reason;
        }
        const updateEndpoint = `https://32016-51127.bacloud.info/api/resource/Reddit%20Post/${postName}`;
        const updateResponse = await fetch(updateEndpoint, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${apiConfig.token}`
          },
          body: JSON.stringify(updateData)
        });
        if (!updateResponse.ok) {
          throw new Error(`Failed to update post status: ${updateResponse.status}`);
        }
        const result = await updateResponse.json();
        postServiceLogger.log(`[PostDataService] \u2705 Post status updated successfully:`, result);
        return result;
      } catch (error) {
        postServiceLogger.error("[PostDataService] Failed to update post status by URL:", error);
        throw error;
      }
    }
    static async updatePostStatus(postName, status = "Posted", extraFields = null) {
      try {
        postServiceLogger.log(
          `[PostDataService] Updating post ${postName} status to: ${status}`,
          extraFields ? { extraFields } : {}
        );
        const storageResult = await chrome.storage.sync.get(["apiConfig"]);
        const apiConfig = storageResult.apiConfig || {
          token: "8fbbf0a7c626e18:2c3693fb52ac66f"
        };
        const updateEndpoint = `https://32016-51127.bacloud.info/api/resource/Reddit%20Post/${postName}`;
        const updateData = {
          status
        };
        if (extraFields && typeof extraFields === "object") {
          Object.assign(updateData, extraFields);
        }
        const response = await fetch(updateEndpoint, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${apiConfig.token}`
          },
          body: JSON.stringify(updateData)
        });
        if (!response.ok) {
          throw new Error(`Failed to update post status: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        postServiceLogger.log(`[PostDataService] \u2705 Post status/metadata updated successfully:`, result);
        return result;
      } catch (error) {
        postServiceLogger.error("[PostDataService] Failed to update post status/metadata:", error);
        throw error;
      }
    }
  };
  async function fetchNextPost() {
    postServiceLogger.log("[BG] Checking for new posts to create (API service)...");
    try {
      const syncResult = await chrome.storage.sync.get(["redditUser"]);
      const localResult = await chrome.storage.local.get(["redditUser"]);
      const redditUser = syncResult.redditUser || localResult.redditUser;
      if (!redditUser || !redditUser.seren_name) {
        postServiceLogger.log("[BG] No username found, skipping API call");
        return null;
      }
      const agentName = redditUser.seren_name;
      const cleanAgentName = agentName.replace(/^u\//, "");
      postServiceLogger.log(`[BG] Using agent name: ${agentName} (cleaned: ${cleanAgentName})`);
      if (await PostDataService.shouldCreatePost({ userName: agentName })) {
        const postData = await PostDataService.generatePost(cleanAgentName);
        postServiceLogger.log("[BG] API service says: CREATE POST");
        return postData;
      }
      postServiceLogger.log("[BG] API service says: NO POST NEEDED");
      return null;
    } catch (error) {
      postServiceLogger.error("[BG] Error in fetchNextPost:", error);
      return null;
    }
  }

  // src-bex/unified-tab-manager.js
  var UNIFIED_TAB_ID_KEY = "unifiedTabId";
  var tabListeners = {};
  var currentControlledTabId = null;
  var currentOperationType = null;
  var OPERATIONS = {
    EXTENSION: "extension",
    REDDIT: "reddit",
    POST_CREATION: "post_creation",
    POST_COLLECTION: "post_collection",
    POST_DELETION: "post_deletion"
  };
  async function getStoredUnifiedTabId() {
    try {
      const result = await chrome.storage.local.get([UNIFIED_TAB_ID_KEY]);
      return result[UNIFIED_TAB_ID_KEY] || null;
    } catch (error) {
      bgLogger.error("[UnifiedTabMgr] Failed to get stored unified tab ID:", error);
      return null;
    }
  }
  async function saveUnifiedTabId(tabId) {
    try {
      await chrome.storage.local.set({ [UNIFIED_TAB_ID_KEY]: tabId });
      bgLogger.log(`[UnifiedTabMgr] Saved unified tab ID: ${tabId}`);
    } catch (error) {
      bgLogger.error("[UnifiedTabMgr] Failed to save unified tab ID:", error);
    }
  }
  async function clearUnifiedTabId() {
    try {
      await chrome.storage.local.remove([UNIFIED_TAB_ID_KEY]);
      bgLogger.log("[UnifiedTabMgr] Cleared unified tab ID");
    } catch (error) {
      bgLogger.error("[UnifiedTabMgr] Failed to clear unified tab ID:", error);
    }
  }
  async function isTabValid(tabId) {
    if (!tabId)
      return false;
    try {
      const tab = await chrome.tabs.get(tabId);
      return tab && !tab.discarded;
    } catch (error) {
      bgLogger.log(`[UnifiedTabMgr] Tab ${tabId} is no longer valid:`, error.message);
      return false;
    }
  }
  async function getUnifiedTab(targetUrl, operationType = null) {
    try {
      const storedTabId = await getStoredUnifiedTabId();
      if (storedTabId && await isTabValid(storedTabId)) {
        bgLogger.log(`[UnifiedTabMgr] Reusing unified tab ${storedTabId} for ${operationType || "operation"}`);
        cleanupTabListeners(storedTabId);
        await chrome.tabs.update(storedTabId, { url: targetUrl, active: true });
        setCurrentControlledTabId(storedTabId, operationType);
        return storedTabId;
      }
      if (storedTabId) {
        bgLogger.log(`[UnifiedTabMgr] Stored tab ${storedTabId} is no longer valid, clearing`);
        cleanupTabListeners(storedTabId);
        await clearUnifiedTabId();
      }
      bgLogger.log(`[UnifiedTabMgr] Creating new unified tab with URL: ${targetUrl} for ${operationType || "operation"}`);
      const newTab = await chrome.tabs.create({
        url: targetUrl,
        active: true
      });
      await saveUnifiedTabId(newTab.id);
      setCurrentControlledTabId(newTab.id, operationType);
      bgLogger.log(`[UnifiedTabMgr] Created new unified tab ${newTab.id}`);
      return newTab.id;
    } catch (error) {
      bgLogger.error("[UnifiedTabMgr] Failed to get unified tab:", error);
      throw error;
    }
  }
  async function getExtensionTab() {
    const extensionUrl = `chrome-extension://${chrome.runtime.id}/www/index.html#/popup`;
    return getUnifiedTab(extensionUrl, OPERATIONS.EXTENSION);
  }
  async function getPostCreationTab(postData) {
    const cleanSubreddit = (postData.subreddit || "sphynx").replace(/^r\//i, "");
    const submitUrl = `https://www.reddit.com/r/${cleanSubreddit}/submit`;
    return getUnifiedTab(submitUrl, OPERATIONS.POST_CREATION);
  }
  function cleanupTabListeners(tabId) {
    if (tabListeners[tabId]) {
      bgLogger.log(`[UnifiedTabMgr] Cleaning up ${tabListeners[tabId].length} old listeners for tab ${tabId}`);
      tabListeners[tabId].forEach((listener) => {
        chrome.tabs.onUpdated.removeListener(listener);
      });
      delete tabListeners[tabId];
    }
  }
  function registerTabListener(tabId, listener) {
    if (!tabListeners[tabId]) {
      tabListeners[tabId] = [];
    }
    tabListeners[tabId].push(listener);
    chrome.tabs.onUpdated.addListener(listener);
  }
  async function handleTabClosed(tabId) {
    try {
      cleanupTabListeners(tabId);
      const storedTabId = await getStoredUnifiedTabId();
      if (storedTabId === tabId) {
        bgLogger.log(`[UnifiedTabMgr] Unified tab ${tabId} was closed, clearing stored ID`);
        await clearUnifiedTabId();
      }
      if (currentControlledTabId === tabId) {
        bgLogger.log(`[UnifiedTabMgr] Controlled tab ${tabId} was closed, clearing control`);
        currentControlledTabId = null;
        currentOperationType = null;
      }
    } catch (error) {
      bgLogger.error("[UnifiedTabMgr] Failed to handle tab closure:", error);
    }
  }
  function getCurrentControlledTab() {
    return {
      tabId: currentControlledTabId,
      operationType: currentOperationType
    };
  }
  function setCurrentControlledTabId(tabId, operationType = null) {
    if (currentControlledTabId !== null && currentControlledTabId !== tabId) {
      bgLogger.log(`[UnifiedTabMgr] Replacing controlled tab ${currentControlledTabId} with ${tabId}`);
    }
    currentControlledTabId = tabId;
    currentOperationType = operationType;
    bgLogger.log(`[UnifiedTabMgr] Set controlled tab to ${tabId} for operation: ${operationType}`);
  }
  function clearCurrentControlledTabId() {
    if (currentControlledTabId !== null) {
      bgLogger.log(`[UnifiedTabMgr] Clearing controlled tab ${currentControlledTabId}`);
    }
    currentControlledTabId = null;
    currentOperationType = null;
  }
  async function reloadUnifiedTab(newUrl, operationType = null) {
    const current = getCurrentControlledTab();
    if (!current.tabId) {
      return getUnifiedTab(newUrl, operationType);
    }
    try {
      if (await isTabValid(current.tabId)) {
        bgLogger.log(`[UnifiedTabMgr] Reloading tab ${current.tabId} with new URL: ${newUrl}`);
        await chrome.tabs.update(current.tabId, { url: newUrl, active: true });
        setCurrentControlledTabId(current.tabId, operationType);
        return current.tabId;
      } else {
        bgLogger.log(`[UnifiedTabMgr] Current tab ${current.tabId} is invalid, getting new tab`);
        await clearUnifiedTabId();
        clearCurrentControlledTabId();
        return getUnifiedTab(newUrl, operationType);
      }
    } catch (error) {
      bgLogger.error("[UnifiedTabMgr] Failed to reload unified tab:", error);
      throw error;
    }
  }
  async function closeAllRedditTabsAndOpenFresh(userName) {
    try {
      bgLogger.log("[UnifiedTabMgr] Initializing unified Reddit tab for autoflow (reuse active, close others)");
      let targetUrl = "https://www.reddit.com/";
      if (userName) {
        const cleanUsername = userName.replace("u/", "");
        targetUrl = `https://www.reddit.com/user/${cleanUsername}/submitted/`;
        bgLogger.log(`[UnifiedTabMgr] \u{1F680} Using direct navigation to user's submitted page: ${targetUrl}`);
      }
      const redditTabs = await chrome.tabs.query({ url: "*://*.reddit.com/*" });
      const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
      let preferredTab = null;
      if (activeTabs.length > 0) {
        const activeTab = activeTabs[0];
        if (activeTab.url && activeTab.url.includes("reddit.com")) {
          preferredTab = activeTab;
        }
      }
      if (!preferredTab && redditTabs.length > 0) {
        preferredTab = redditTabs[0];
      }
      const tabsToClose = redditTabs.filter((tab) => !preferredTab || tab.id !== preferredTab.id);
      if (tabsToClose.length > 0) {
        bgLogger.log(`[UnifiedTabMgr] Closing ${tabsToClose.length} other Reddit tabs, keeping tab ${preferredTab ? preferredTab.id : "none yet"}`);
        const removePromises = tabsToClose.map(
          (tab) => chrome.tabs.sendMessage(tab.id, { type: "REMOVE_BEFOREUNLOAD_LISTENERS" }).catch(() => {
            bgLogger.log(`[UnifiedTabMgr] Could not send remove beforeunload message to tab ${tab.id}`);
          })
        );
        await Promise.race([
          Promise.all(removePromises),
          new Promise((resolve) => setTimeout(resolve, 500))
        ]);
        await chrome.tabs.remove(tabsToClose.map((tab) => tab.id));
        tabsToClose.forEach((tab) => cleanupTabListeners(tab.id));
      }
      let targetTab;
      if (preferredTab) {
        bgLogger.log(`[UnifiedTabMgr] Reusing existing Reddit tab ${preferredTab.id} for autoflow`);
        cleanupTabListeners(preferredTab.id);
        try {
          await chrome.tabs.sendMessage(preferredTab.id, {
            type: "REMOVE_BEFOREUNLOAD_LISTENERS"
          }).catch(() => {
            bgLogger.log(`[UnifiedTabMgr] Could not send remove beforeunload message to tab ${preferredTab.id}`);
          });
        } catch (e) {
        }
        targetTab = await chrome.tabs.update(preferredTab.id, { url: targetUrl, active: true });
      } else {
        bgLogger.log("[UnifiedTabMgr] No existing Reddit tab found; creating new one for autoflow");
        targetTab = await chrome.tabs.create({
          url: targetUrl,
          active: true
        });
      }
      await saveUnifiedTabId(targetTab.id);
      setCurrentControlledTabId(targetTab.id, OPERATIONS.REDDIT);
      bgLogger.log(`[UnifiedTabMgr] Unified Reddit tab for autoflow is ${targetTab.id}`);
      return targetTab.id;
    } catch (error) {
      bgLogger.error("[UnifiedTabMgr] Failed to initialize unified Reddit tab for autoflow:", error);
      throw error;
    }
  }

  // src-bex/message-handlers.js
  var finalizeReloadListeners = {};
  var finalizeReloadTimeouts = {};
  var inFlightGetPosts = /* @__PURE__ */ new Set();
  function logToTab(tabId, message) {
    bgLogger.log(`[BG Log -> Tab ${tabId}] ${message}`);
    if (tabId) {
      chrome.tabs.sendMessage(
        tabId,
        {
          type: "BG_LOG",
          message
        }
      ).catch(() => {
      });
    }
  }
  async function waitForContentScript(tabId, { retries = 12, initialDelayMs = 250 } = {}) {
    let delayMs = initialDelayMs;
    for (let i = 0; i < retries; i++) {
      try {
        const tab = await chrome.tabs.get(tabId);
        if (!tab || tab.discarded) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          delayMs = Math.min(2e3, Math.floor(delayMs * 1.6));
          continue;
        }
        if (tab.status !== "complete") {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          delayMs = Math.min(2e3, Math.floor(delayMs * 1.6));
          continue;
        }
        const res = await chrome.tabs.sendMessage(tabId, { type: "PING" });
        if (res && res.pong)
          return true;
      } catch (e) {
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs = Math.min(2e3, Math.floor(delayMs * 1.6));
    }
    return false;
  }
  async function sendGetPosts(tabId, userName, source) {
    const ready = await waitForContentScript(tabId);
    if (!ready) {
      bgLogger.error(`[BG] Content script not reachable in tab ${tabId}, cannot send GET_POSTS (${source})`);
      logToTab(tabId, `Content script not reachable; skipping post collection (${source}).`);
      delete tabStates[tabId];
      return false;
    }
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: "REDDIT_POST_MACHINE_GET_POSTS",
        payload: { userName }
      });
      return true;
    } catch (err) {
      bgLogger.error(`[BG] Failed to send GET_POSTS (${source}):`, err);
      delete tabStates[tabId];
      return false;
    }
  }
  async function createCleanPostTab(userName, postData) {
    try {
      bgLogger.log("[BG] Creating clean post tab using unified tab manager");
      const newTabId = await getPostCreationTab(postData);
      tabStates[newTabId] = {
        status: SM_STEPS.POSTING,
        userName,
        postData,
        stepStartTime: Date.now(),
        lastFeedbackTimestamp: Date.now(),
        isPostTab: true,
        isCleanTab: true
      };
      const tabLoadListener = (tabId, changeInfo, tab) => {
        if (tabId === newTabId && changeInfo.status === "complete") {
          chrome.tabs.onUpdated.removeListener(tabLoadListener);
          bgLogger.log(`[BG] Clean post tab ${newTabId} loaded, URL: ${tab.url}`);
          if (!tab.url || !tab.url.includes("/submit")) {
            bgLogger.error(`[BG] Tab ${newTabId} is not on submit page: ${tab.url}`);
            delete tabStates[newTabId];
            return;
          }
          setTimeout(() => {
            bgLogger.log(`[BG] Sending START_POST_CREATION to tab ${newTabId}`);
            chrome.tabs.sendMessage(newTabId, {
              type: "START_POST_CREATION",
              userName,
              postData
            }).catch((err) => {
              bgLogger.error(`[BG] Failed to send post data to clean tab ${newTabId}:`, err);
              delete tabStates[newTabId];
            });
          }, 2e3);
        }
      };
      registerTabListener(newTabId, tabLoadListener);
      return newTabId;
    } catch (error) {
      bgLogger.error("[BG] Failed to create clean post tab:", error);
      throw error;
    }
  }
  async function finalizeAutoFlowToSubmitted(tabId, userName) {
    if (!tabId || !userName)
      return;
    const cleanUsername = userName.replace("u/", "");
    const submittedUrl = `https://www.reddit.com/user/${cleanUsername}/submitted/`;
    if (finalizeReloadListeners[tabId]) {
      chrome.tabs.onUpdated.removeListener(finalizeReloadListeners[tabId]);
      delete finalizeReloadListeners[tabId];
    }
    if (finalizeReloadTimeouts[tabId]) {
      clearTimeout(finalizeReloadTimeouts[tabId]);
      delete finalizeReloadTimeouts[tabId];
    }
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab?.url && tab.url.includes(`/user/${cleanUsername}/`) && tab.url.includes("/submitted")) {
        chrome.tabs.reload(tabId).catch(() => {
        });
        return;
      }
    } catch (e) {
    }
    const listener = (updatedTabId, changeInfo, tab) => {
      if (updatedTabId !== tabId)
        return;
      if (changeInfo.status !== "complete")
        return;
      if (!tab?.url || !tab.url.includes(`/user/${cleanUsername}/`) || !tab.url.includes("/submitted"))
        return;
      chrome.tabs.onUpdated.removeListener(listener);
      delete finalizeReloadListeners[tabId];
      if (finalizeReloadTimeouts[tabId]) {
        clearTimeout(finalizeReloadTimeouts[tabId]);
        delete finalizeReloadTimeouts[tabId];
      }
      chrome.tabs.reload(tabId).catch(() => {
      });
    };
    finalizeReloadListeners[tabId] = listener;
    chrome.tabs.onUpdated.addListener(listener);
    finalizeReloadTimeouts[tabId] = setTimeout(() => {
      if (finalizeReloadListeners[tabId] === listener) {
        chrome.tabs.onUpdated.removeListener(listener);
        delete finalizeReloadListeners[tabId];
      }
      delete finalizeReloadTimeouts[tabId];
    }, 3e4);
    try {
      await reloadUnifiedTab(submittedUrl, OPERATIONS.POST_COLLECTION);
    } catch (error) {
      bgLogger.error("[BG] Failed to reload unified tab for submitted posts:", error);
    }
  }
  async function proceedWithPostCreation(userName, monitoringTabId) {
    bgLogger.log("[BG] Proceeding with post creation");
    await AutoFlowStateManager.saveState("creating_post", { userName, targetAction: "create" });
    const state = tabStates[monitoringTabId];
    if (state && state.postCreationInProgress) {
      bgLogger.log("[BG] Post creation already in progress, skipping duplicate call");
      return;
    }
    if (state) {
      state.postCreationInProgress = true;
    }
    try {
      const newPostData = await fetchNextPost();
      if (newPostData) {
        bgLogger.log("[BG] Creating new post tab for fresh post");
        createCleanPostTab(userName, newPostData).then((newTabId) => {
          bgLogger.log(`[BG] Created new post tab ${newTabId} for ${userName}`);
          delete tabStates[monitoringTabId];
        }).catch((err) => {
          bgLogger.error("[BG] Failed to create post tab:", err);
          delete tabStates[monitoringTabId];
        });
      } else {
        bgLogger.log("[BG] Failed to generate new post data");
        delete tabStates[monitoringTabId];
      }
    } catch (error) {
      bgLogger.error("[BG] Error in proceedWithPostCreation:", error);
      delete tabStates[monitoringTabId];
    }
  }
  function startAutomationForTab(tabId, userName) {
    bgLogger.log(`[BG] Starting automation for tab ${tabId} with user ${userName}`);
    const currentIntervalId = getCheckIntervalId();
    if (currentIntervalId)
      clearInterval(currentIntervalId);
    setCheckIntervalId(setInterval(() => {
      triggerPeriodicCheck(tabId, userName);
    }, CHECK_INTERVAL));
    triggerPeriodicCheck(tabId, userName);
  }
  async function triggerPeriodicCheck(tabId, userName) {
    const currentState = tabStates[tabId];
    if (currentState && currentState.status === SM_STEPS.POSTING) {
      bgLogger.log("[BG] Skipping periodic check - Posting in progress (Locked)");
      return;
    }
    if (currentState) {
      bgLogger.log(`[BG] Skipping periodic check - Busy in state: ${currentState.status}`);
      return;
    }
    bgLogger.log(`[BG] Triggering periodic post check for ${userName}`);
    try {
      const { latestPostsData } = await chrome.storage.local.get(["latestPostsData"]);
      const cachedUser = latestPostsData?.username || latestPostsData?.userName || null;
      if (latestPostsData && (!cachedUser || cachedUser.replace("u/", "") === userName.replace("u/", ""))) {
        const normalized = PostDataService.normalizeLatestPostsData(latestPostsData, userName);
        const lastUpdated = normalized?.lastUpdated;
        if (normalized && lastUpdated && Date.now() - lastUpdated < 5 * 60 * 1e3) {
          const result = await PostDataService.shouldCreatePost(normalized);
          if (!result?.shouldCreate) {
            await AutoFlowStateManager.clearState(userName);
            PostDataService.saveExecutionResult({
              status: "skipped",
              postResult: "none",
              postId: null,
              errorMessage: null,
              timestamp: Date.now()
            });
            finalizeAutoFlowToSubmitted(tabId, userName);
            return;
          }
        }
      }
    } catch (e) {
    }
    const cleanUsername = userName.replace("u/", "");
    const directPostsUrl = `https://www.reddit.com/user/${cleanUsername}/submitted/`;
    bgLogger.log(`[BG] \u{1F680} Using direct URL navigation optimization: ${directPostsUrl}`);
    tabStates[tabId] = {
      status: SM_STEPS.COLLECTING_POSTS,
      userName,
      stepStartTime: Date.now(),
      lastFeedbackTimestamp: Date.now(),
      advancedToNavigatingPosts: true,
      advancedToCollecting: false,
      usedDirectNavigation: true
    };
    try {
      await reloadUnifiedTab(directPostsUrl, OPERATIONS.POST_COLLECTION);
    } catch (error) {
      bgLogger.error("[BG] Failed to reload unified tab for posts collection:", error);
      logToTab(tabId, `Error navigating to posts URL: ${error.message}`);
      delete tabStates[tabId];
    }
    const tabLoadBackupListener = (updatedTabId, changeInfo, tab) => {
      if (updatedTabId === tabId && changeInfo.status === "complete" && tab.url.includes("/submitted")) {
        const state = tabStates[tabId];
        if (state && state.usedDirectNavigation && !state.advancedToCollecting) {
          bgLogger.log("[BG] Backup trigger: Tab loaded, sending GET_POSTS command");
          state.advancedToCollecting = true;
          logToTab(tabId, "Backup trigger: Tab fully loaded, starting post collection.");
          setTimeout(() => {
            sendGetPosts(tabId, state.userName, "backup_trigger");
          }, 1e3);
          chrome.tabs.onUpdated.removeListener(tabLoadBackupListener);
        }
      }
    };
    chrome.tabs.onUpdated.addListener(tabLoadBackupListener);
    setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(tabLoadBackupListener);
    }, 3e4);
  }
  function checkAndAdvanceState(tabId, state, url) {
    bgLogger.log(`[Auto Check] Checking state for tab ${tabId}. Status: ${state.status}, URL: ${url}`);
    touchTabState(state);
    if (state.status === SM_STEPS.NAVIGATING_PROFILE) {
      if (url.includes(state.userName.replace("u/", ""))) {
        if (!state.advancedToNavigatingPosts) {
          state.advancedToNavigatingPosts = true;
          logToTab(tabId, "Fast-track: Landed on profile page. Advancing to NAVIGATING_POSTS.");
          state.status = SM_STEPS.NAVIGATING_POSTS;
          chrome.tabs.sendMessage(tabId, {
            type: "REDDIT_POST_MACHINE_NAVIGATE_POSTS",
            payload: { userName: state.userName }
          }).catch((err) => {
            bgLogger.error("[Auto Check] Failed to send NAVIGATE_POSTS:", err);
            logToTab(tabId, `Error sending NAVIGATE_POSTS: ${err.message}`);
          });
        }
      }
    } else if (state.status === SM_STEPS.NAVIGATING_POSTS) {
      if (url.includes("/submitted")) {
        if (!state.advancedToCollecting) {
          state.advancedToCollecting = true;
          logToTab(tabId, "Fast-track: Landed on posts page. Advancing to COLLECTING_POSTS.");
          state.status = SM_STEPS.COLLECTING_POSTS;
          sendGetPosts(tabId, state.userName, "fast_track_navigating_posts");
        }
      }
    } else if (state.status === SM_STEPS.COLLECTING_POSTS && state.usedDirectNavigation) {
      if (url.includes("/submitted") && !state.advancedToCollecting) {
        state.advancedToCollecting = true;
        logToTab(tabId, "Direct navigation: Landed on posts page. Starting post collection.");
        setTimeout(() => {
          sendGetPosts(tabId, state.userName, "direct_navigation");
        }, 2e3);
      }
    }
  }
  function handleContentScriptReady(tabId, url) {
    const state = tabStates[tabId];
    if (state) {
      bgLogger.log(`Content script ready in tab ${tabId} (State: ${state.status}). URL: ${url}`);
      checkAndAdvanceState(tabId, state, url);
    }
  }
  async function handleActionCompleted(tabId, action, success, data) {
    bgLogger.log(`[BG] handleActionCompleted called for tab ${tabId}, action ${action}`);
    const state = tabStates[tabId];
    if (!state) {
      bgLogger.log(`[BG] State already cleared for tab ${tabId}. Action ${action} was likely the final step.`);
      return;
    }
    logToTab(tabId, `Action completed in tab ${tabId}: ${action} (Success: ${success})`);
    touchTabState(state);
    if (!success) {
      bgLogger.warn(`Action ${action} failed. Aborting automation.`);
      delete tabStates[tabId];
      return;
    }
    if (action === "NAVIGATE_PROFILE" && state.status === SM_STEPS.NAVIGATING_PROFILE) {
      if (!state.advancedToNavigatingPosts) {
        state.advancedToNavigatingPosts = true;
        logToTab(tabId, "Advancing from NAVIGATING_PROFILE to NAVIGATING_POSTS");
        state.status = SM_STEPS.NAVIGATING_POSTS;
        state.stepStartTime = Date.now();
        touchTabState(state);
        setTimeout(() => {
          logToTab(tabId, "Sending NAVIGATE_POSTS command");
          chrome.tabs.sendMessage(tabId, {
            type: "REDDIT_POST_MACHINE_NAVIGATE_POSTS",
            payload: { userName: state.userName }
          }).catch((err) => bgLogger.error(`[State Machine] Error sending NAVIGATE_POSTS:`, err));
        }, 1500);
      } else {
        bgLogger.log("[BG] Already advanced to NAVIGATING_POSTS via fast-track. Skipping.");
      }
    } else if (action === "NAVIGATE_POSTS" && state.status === SM_STEPS.NAVIGATING_POSTS) {
      if (!state.advancedToCollecting) {
        state.advancedToCollecting = true;
        logToTab(tabId, "Advancing from NAVIGATING_POSTS to COLLECTING_POSTS");
        state.status = SM_STEPS.COLLECTING_POSTS;
        state.stepStartTime = Date.now();
        touchTabState(state);
        setTimeout(() => {
          logToTab(tabId, "Sending GET_POSTS command");
          sendGetPosts(tabId, state.userName, "state_machine_navigate_posts");
        }, 1500);
      } else {
        bgLogger.log("[BG] Already advanced to COLLECTING_POSTS via fast-track. Skipping.");
      }
    } else if (action === "NAVIGATE_POSTS" && state.status === SM_STEPS.DELETING_POST) {
      bgLogger.log("[BG] NAVIGATE_POSTS completed for deletion, now sending DELETE_POST command");
      setTimeout(() => {
        logToTab(tabId, "Sending DELETE_POST command");
        chrome.tabs.sendMessage(tabId, {
          type: "REDDIT_POST_MACHINE_DELETE_POST",
          payload: { post: state.lastPostToDelete }
        }).catch((err) => {
          bgLogger.error("[BG] \u274C Failed to send delete command:", err);
          bgLogger.log("[BG] \u26A0\uFE0F FALLBACK: Proceeding with post creation anyway");
          proceedWithPostCreation(state.userName, tabId);
        });
      }, 2e3);
    } else if (action === "GET_POSTS") {
      await handleGetPostsAction(tabId, state, data);
    } else if (action === "POST_CREATION_COMPLETED") {
      await handlePostCreationCompleted(tabId, state, success, data);
    } else if (action === "DELETE_POST_COMPLETED") {
      await handleDeletePostCompleted(tabId, state, success, data);
    }
  }
  async function handleGetPostsAction(tabId, state, data) {
    bgLogger.log("[BG] \u{1F4CA} GET_POSTS action received, collecting fresh data for decision...");
    const actionKey = `${tabId}_${state.userName}`;
    if (inFlightGetPosts.has(actionKey)) {
      bgLogger.log(`[BG] \u26A0\uFE0F GET_POSTS action already in progress for tab ${tabId}, skipping duplicate`);
      return;
    }
    inFlightGetPosts.add(actionKey);
    setTimeout(() => {
      inFlightGetPosts.delete(actionKey);
    }, 3e4);
    if (state && state.status === SM_STEPS.COLLECTING_POSTS) {
      bgLogger.log("[BG] State machine flow: Collection complete");
    } else {
      bgLogger.log("[BG] Direct status check flow: Running decision analysis");
    }
    bgLogger.log("[BG] Requesting fresh posts data for autoflow decision...");
    try {
      const tab = await chrome.tabs.get(tabId);
      bgLogger.log("[BG] Target tab for fresh data collection:", tab.url);
      const sendMessagePromise = new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(
          tabId,
          {
            type: "GET_FRESH_POSTS_FOR_DECISION",
            userName: state.userName
          },
          (response) => {
            if (chrome.runtime.lastError) {
              bgLogger.log("[BG] Content script not available, using cached data");
              reject(new Error("Content script not available: " + chrome.runtime.lastError.message));
            } else {
              bgLogger.log("[BG] Message sent successfully to content script");
              resolve(true);
            }
          }
        );
      });
      await sendMessagePromise;
      const freshDataPromise = new Promise((resolve, reject) => {
        const messageListener = (message, sender, sendResponse) => {
          if (message.type === "FRESH_POSTS_COLLECTED" && sender.tab?.id === tabId) {
            chrome.runtime.onMessage.removeListener(messageListener);
            bgLogger.log("[BG] Received FRESH_POSTS_COLLECTED response:", message.data);
            resolve(message.data);
          }
        };
        chrome.runtime.onMessage.addListener(messageListener);
        setTimeout(() => {
          chrome.runtime.onMessage.removeListener(messageListener);
          reject(new Error("Timeout waiting for fresh posts data after 15 seconds"));
        }, 15e3);
      });
      const freshPostsData = await freshDataPromise;
      bgLogger.log("[BG] Successfully received fresh posts data:", freshPostsData);
      if (freshPostsData && freshPostsData.dataFresh) {
        var dataForAnalysis = freshPostsData;
        bgLogger.log("[BG] Using fresh data for analysis:", dataForAnalysis);
      } else {
        bgLogger.log("[BG] Fresh data invalid, falling back to normalized cached data");
        var dataForAnalysis = {
          userName: state.userName,
          postsInfo: {
            posts: data?.posts || [],
            total: data?.total || 0,
            lastPostDate: data?.lastPostDate || null
          },
          lastPost: data?.lastPost || null
        };
      }
    } catch (error) {
      bgLogger.warn("[BG] Failed to get fresh posts data, using cached data. Error:", error.message);
      var dataForAnalysis = {
        userName: state.userName,
        postsInfo: {
          posts: data?.posts || [],
          total: data?.total || 0,
          lastPostDate: data?.lastPostDate || null
        },
        lastPost: data?.lastPost || null
      };
      bgLogger.log("[BG] Normalized cached data structure for analysis:", dataForAnalysis);
    }
    PostDataService.shouldCreatePost(dataForAnalysis).then(async (result) => {
      bgLogger.log("[BG] \u{1F3AF} FINAL DECISION RESULT:", {
        shouldCreate: result.shouldCreate,
        reason: result.reason,
        decisionReport: result.decisionReport
      });
      if (result.shouldCreate) {
        bgLogger.log(`[BG] \u{1F680} EXECUTING: New post required. Reason: ${result.reason}`);
        if (result.lastPost && (result.reason === "post_blocked" || result.reason === "post_downvoted" || result.reason === "low_engagement" || result.reason === "post_removed_by_moderator")) {
          bgLogger.log("[BG] \u{1F5D1}\uFE0F STEP 1: Attempting to delete last post before creating new one");
          state.deletingBeforeCreating = true;
          await AutoFlowStateManager.saveState("deleting_post", {
            userName: state.userName,
            lastPostToDelete: result.lastPost,
            targetAction: "delete_and_create",
            tabId
          });
          chrome.tabs.sendMessage(tabId, {
            type: "DELETE_LAST_POST",
            userName: state.userName
          }).then((response) => {
            bgLogger.log("[BG] Delete command sent successfully:", response);
          }).catch(async (err) => {
            bgLogger.error("[BG] \u274C Failed to send delete command:", err);
            bgLogger.log("[BG] \u26A0\uFE0F FALLBACK: Restarting autoflow instead of creating post");
            state.deletingBeforeCreating = false;
            await AutoFlowStateManager.clearState(state.userName);
            await handleCheckUserStatus(state.userName, (response) => {
              bgLogger.log("[BG] Restarted autoflow after failed delete:", response);
            });
          });
        } else {
          bgLogger.log("[BG] \u{1F4DD} STEP 1: No deletion needed, proceeding directly to post creation");
          proceedWithPostCreation(state.userName, tabId);
        }
      } else {
        bgLogger.log("[BG] \u2705 COMPLETE: No new post needed. Clearing state and waiting for next interval.");
        await AutoFlowStateManager.clearState(state.userName);
        const executionResult = {
          status: "skipped",
          postResult: "none",
          postId: null,
          errorMessage: null,
          timestamp: Date.now()
        };
        await PostDataService.saveExecutionResult(executionResult);
        const userName = state.userName;
        delete tabStates[tabId];
        finalizeAutoFlowToSubmitted(tabId, userName);
      }
    }).catch((err) => {
      bgLogger.error("[BG] \u274C ERROR: Error analyzing posts:", err);
      delete tabStates[tabId];
    }).finally(() => {
      inFlightGetPosts.delete(actionKey);
    });
  }
  async function handlePostCreationCompleted(tabId, state, success, data) {
    bgLogger.log("[BG] Posting process completed. Closing submit tab and opening reddit.com for status check.");
    const wasDeletingBeforeCreating = state && state.deletingBeforeCreating;
    let userName = state?.userName;
    let postName = state?.postData?.post_name;
    if (state) {
      delete tabStates[tabId];
    }
    let postResult = success ? "created" : "error";
    if (success && wasDeletingBeforeCreating) {
      postResult = "deleted_and_created";
    }
    const executionResult = {
      status: success ? "completed" : "failed",
      postResult,
      postId: data?.postId || null,
      errorMessage: data?.error || null,
      timestamp: Date.now()
    };
    if (success) {
      await AutoFlowStateManager.clearState(userName);
      await chrome.storage.local.remove(["latestPostsData"]);
      bgLogger.log(`[BG] \u2705 Auto-flow completed successfully, state cleared for user ${userName}`);
      if (postName) {
        try {
          const redditUrl = data?.redditUrl || null;
          const redditPostId = data?.redditPostId || null;
          const extraFields = {};
          if (redditUrl)
            extraFields.reddit_post_url = redditUrl;
          if (redditPostId)
            extraFields.reddit_post_id = redditPostId;
          if (redditUrl || redditPostId) {
            const now = new Date();
            const mysqlDateTime = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0") + " " + String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0") + ":" + String(now.getSeconds()).padStart(2, "0");
            extraFields.posted_at = mysqlDateTime;
          }
          bgLogger.log('[BG] \u{1F504} Updating post status to "Posted" for post:', postName, {
            extraFields
          });
          bgLogger.log("[BG] Post data available for status update:", state?.postData);
          await PostDataService.updatePostStatus(postName, "Posted", extraFields);
          bgLogger.log("[BG] \u2705 Post status/metadata updated successfully");
          executionResult.statusUpdated = true;
          executionResult.postName = postName;
          if (redditUrl)
            executionResult.redditUrl = redditUrl;
          if (redditPostId)
            executionResult.redditPostId = redditPostId;
        } catch (error) {
          bgLogger.error("[BG] Failed to update post status:", error);
          executionResult.statusUpdated = false;
          executionResult.statusUpdateError = error.message;
        }
      } else {
        bgLogger.log("[BG] \u26A0\uFE0F No post_name available for status update");
        bgLogger.log("[BG] Available post data:", state?.postData);
      }
    }
    await PostDataService.saveExecutionResult(executionResult);
    if (success && !userName) {
      try {
        const syncResult = await chrome.storage.sync.get(["redditUser"]);
        const localResult = await chrome.storage.local.get(["redditUser"]);
        userName = syncResult.redditUser?.seren_name || localResult.redditUser?.seren_name;
      } catch (e) {
      }
    }
    if (success && userName) {
      setTimeout(async () => {
        try {
          const cleanUsername = userName.replace("u/", "");
          const submittedUrl = `https://www.reddit.com/user/${cleanUsername}/submitted/`;
          bgLogger.log("[BG] Navigating unified tab to submitted posts after post creation:", submittedUrl);
          const unifiedTabId = await reloadUnifiedTab(submittedUrl, OPERATIONS.POST_COLLECTION);
          finalizeAutoFlowToSubmitted(unifiedTabId, userName);
        } catch (error) {
          bgLogger.error("[BG] Failed to navigate unified tab to submitted posts page after post creation:", error);
        }
      }, 1e3);
    }
  }
  async function handleDeletePostCompleted(tabId, state, success, data) {
    bgLogger.log("[BG] Delete post operation completed.");
    bgLogger.log("[BG] Delete data received:", data);
    bgLogger.log("[BG] Success value:", success);
    const userName = state?.userName || data?.userName;
    bgLogger.log("[BG] Tab state:", state);
    bgLogger.log("[BG] Username extracted:", userName);
    if (tabStates[tabId]) {
      bgLogger.log(`[BG] Clearing tab state for tab ${tabId} after delete completion`);
      delete tabStates[tabId];
    }
    await AutoFlowStateManager.saveState("deletion_completed", {
      userName,
      success,
      targetAction: "delete_and_create"
    });
    if (!state || !state.deletingBeforeCreating) {
      const executionResult = {
        status: success ? "completed" : "failed",
        postResult: success ? "deleted" : "error",
        postId: data?.postId || null,
        errorMessage: data?.error || null,
        timestamp: Date.now()
      };
      await PostDataService.saveExecutionResult(executionResult);
    } else {
      bgLogger.log("[BG] Skipping execution result save for auto-flow deletion - will save after post creation");
    }
    if (success && data?.redditUrl) {
      try {
        bgLogger.log("[BG] \u{1F504} Updating backend status for deleted post:", data.redditUrl);
        await PostDataService.updatePostStatusByRedditUrl(
          data.redditUrl,
          "Deleted",
          "Deleted by user via extension"
        );
        bgLogger.log("[BG] \u2705 Backend status updated for deleted post");
      } catch (error) {
        bgLogger.error("[BG] Failed to update backend status for deleted post:", error);
      }
    }
    if (success) {
      bgLogger.log("[BG] \u2705 Delete was successful, clearing cache and restarting autoflow from beginning");
      await chrome.storage.local.remove(["latestPostsData"]);
      if (userName) {
        bgLogger.log("[BG] \u{1F504} Restarting autoflow analysis after deletion");
        const deletedPostId = data?.postId || null;
        if (deletedPostId) {
          await chrome.storage.local.set({
            [`deletedPost_${userName}`]: {
              postId: deletedPostId,
              timestamp: Date.now()
            }
          });
          bgLogger.log(`[BG] \u{1F4BE} Stored deleted post ID: ${deletedPostId}`);
        }
        await AutoFlowStateManager.clearState(userName);
        await new Promise((resolve) => setTimeout(resolve, 3e3));
        bgLogger.log(`[BG] \u{1F680} Triggering fresh autoflow check for ${userName}`);
        await handleCheckUserStatus(userName, (response) => {
          bgLogger.log("[BG] Fresh autoflow check initiated after deletion:", response);
        });
      }
    }
  }
  function handleGetRedditInfo(sendResponse) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab && tab.url && tab.url.includes("reddit.com")) {
        sendResponse({
          success: true,
          data: {
            url: tab.url,
            isRedditPage: true
          }
        });
      } else {
        sendResponse({
          success: false,
          error: "Not on a Reddit page"
        });
      }
    });
  }
  async function handleCreatePost(postData, sendResponse) {
    bgLogger.log("Creating post:", postData);
    try {
      let postToSubmit;
      let redditUser;
      const syncResult = await chrome.storage.sync.get(["redditUser"]);
      const localResult = await chrome.storage.local.get(["redditUser"]);
      redditUser = syncResult.redditUser || localResult.redditUser;
      if (postData) {
        postToSubmit = postData;
      } else {
        if (redditUser && redditUser.seren_name) {
          bgLogger.log(`[BG] Generating post for user: ${redditUser.seren_name}`);
          postToSubmit = await PostDataService.generatePost(redditUser.seren_name);
        } else {
          const errorMessage = "No username found - cannot generate post without user context";
          bgLogger.error("[BG] " + errorMessage);
          throw new Error(errorMessage);
        }
      }
      bgLogger.log("[BG] Post data to submit:", postToSubmit);
      const targetTabId = await getPostCreationTab(postToSubmit);
      bgLogger.log("[BG] Using unified tab for post creation:", targetTabId);
      await new Promise((resolve) => {
        const tabLoadListener = (tabId, changeInfo) => {
          if (tabId === targetTabId && changeInfo.status === "complete") {
            chrome.tabs.onUpdated.removeListener(tabLoadListener);
            setTimeout(resolve, 2e3);
          }
        };
        registerTabListener(targetTabId, tabLoadListener);
      });
      setTimeout(() => {
        const userName = redditUser?.seren_name || "AutoUser";
        chrome.tabs.sendMessage(targetTabId, {
          type: "START_POST_CREATION",
          userName,
          postData: postToSubmit
        }).catch((err) => {
          bgLogger.error(`[BG] Failed to send post data to tab ${targetTabId}:`, err);
        });
      }, 3e3);
      sendResponse({
        success: true,
        message: "Post data sent to submit tab",
        tabId: targetTabId
      });
    } catch (error) {
      bgLogger.error("[BG] Failed to create post:", error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }
  function handleSaveSettings(settings, sendResponse) {
    chrome.storage.sync.set({ settings }, () => {
      if (chrome.runtime.lastError) {
        sendResponse({
          success: false,
          error: chrome.runtime.lastError.message
        });
      } else {
        sendResponse({
          success: true,
          message: "Settings saved successfully"
        });
      }
    });
  }
  function handleUsernameStored(username, timestamp, sendResponse) {
    bgLogger.log(`Background: Received username storage notification - ${username}`);
    chrome.action.setBadgeText({ text: "\u2713" });
    chrome.action.setBadgeBackgroundColor({ color: "#4caf50" });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: "" });
    }, 3e3);
    sendResponse({ success: true });
  }
  async function handleGetStoredUsername(sendResponse) {
    try {
      const syncResult = await chrome.storage.sync.get(["redditUser"]);
      if (syncResult.redditUser && syncResult.redditUser.seren_name) {
        sendResponse({ success: true, data: syncResult.redditUser });
        return;
      }
      const localResult = await chrome.storage.local.get(["redditUser"]);
      if (localResult.redditUser && localResult.redditUser.seren_name) {
        sendResponse({ success: true, data: localResult.redditUser });
        return;
      }
      sendResponse({ success: false, error: "No stored username found" });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  function handleUserStatusSaved(statusData, sendResponse) {
    bgLogger.log(`Background: User status saved - ${statusData.userName}`);
    chrome.action.setBadgeText({ text: "\u{1F4CA}" });
    chrome.action.setBadgeBackgroundColor({ color: "#2196f3" });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: "" });
    }, 4e3);
    sendResponse({ success: true });
  }
  async function handleGetUserStatus(sendResponse) {
    try {
      const localResult = await chrome.storage.local.get(["userStatus"]);
      if (localResult.userStatus) {
        sendResponse({ success: true, data: localResult.userStatus });
        return;
      }
      const syncResult = await chrome.storage.sync.get(["userStatus"]);
      if (syncResult.userStatus) {
        sendResponse({ success: true, data: syncResult.userStatus });
        return;
      }
      sendResponse({ success: false, error: "No user status found" });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  async function handleCreatePostFromPopup(userName, sendResponse) {
    bgLogger.log(`[BG] Manual post creation requested for ${userName}`);
    try {
      const postData = await PostDataService.generatePost(userName);
      bgLogger.log("[BG] Generated post data for manual creation:", postData);
      const newTabId = await createCleanPostTab(userName, postData);
      sendResponse({
        success: true,
        message: "Post creation tab opened",
        tabId: newTabId
      });
    } catch (error) {
      bgLogger.error("[BG] Failed to create post from popup:", error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }
  async function resumeAutoFlow(state, sendResponse) {
    bgLogger.log(`[BG] \u{1F504} Resuming auto-flow from step: ${state.currentStep}`);
    try {
      switch (state.currentStep) {
        case "starting":
        case "analyzing_posts":
          await AutoFlowStateManager.clearState(state.userName);
          await handleCheckUserStatus(state.userName, sendResponse);
          break;
        case "deleting_post":
          bgLogger.log("[BG] \u{1F504} Resuming from deleting_post: clearing state and restarting full auto-flow");
          await AutoFlowStateManager.clearState(state.userName);
          await handleCheckUserStatus(state.userName, sendResponse);
          break;
        case "creating_post":
          bgLogger.log("[BG] \u{1F504} Resuming post creation");
          if (state.tabId) {
            const tabValid = await AutoFlowStateManager.validateTab(state.tabId);
            if (tabValid) {
              proceedWithPostCreation(state.userName, state.tabId);
            } else {
              bgLogger.log("[BG] Tab is no longer valid, starting fresh");
              await AutoFlowStateManager.clearState(state.userName);
              await handleCheckUserStatus(state.userName, sendResponse);
            }
          } else {
            bgLogger.log("[BG] Cannot resume post creation - missing tab info, starting fresh");
            await AutoFlowStateManager.clearState(state.userName);
            await handleCheckUserStatus(state.userName, sendResponse);
          }
          break;
        default:
          bgLogger.log(`[BG] Unknown step ${state.currentStep}, starting fresh`);
          await AutoFlowStateManager.clearState(state.userName);
          await handleCheckUserStatus(state.userName, sendResponse);
          break;
      }
    } catch (error) {
      bgLogger.error("[BG] Failed to resume auto-flow:", error);
      await AutoFlowStateManager.clearState(state?.userName);
      sendResponse({
        success: false,
        error: `Failed to resume auto-flow: ${error.message}`
      });
    }
  }
  async function handleCheckUserStatus(userName, sendResponse) {
    bgLogger.log(`[BG] User status check requested for ${userName} - starting auto flow`);
    try {
      const existingState = await AutoFlowStateManager.recoverState(userName);
      if (existingState) {
        bgLogger.log(`[BG] \u{1F504} Resuming interrupted auto-flow for ${userName} at step: ${existingState.currentStep}`);
        await resumeAutoFlow(existingState, sendResponse);
        return;
      }
      await AutoFlowStateManager.saveState("starting", { userName, targetAction: "auto_flow" });
      let optimizedUserName = userName;
      try {
        const syncResult = await chrome.storage.sync.get(["redditUser"]);
        const localResult = await chrome.storage.local.get(["redditUser"]);
        const redditUser = syncResult.redditUser || localResult.redditUser;
        if (redditUser && redditUser.seren_name) {
          optimizedUserName = redditUser.seren_name;
          bgLogger.log(`[BG] \u{1F3AF} Found redditUser in storage, will use direct navigation to submitted page for: ${optimizedUserName}`);
        }
      } catch (e) {
        bgLogger.log("[BG] Could not retrieve redditUser from storage, using provided userName");
      }
      bgLogger.log("[BG] \u{1F6A6} Initializing unified Reddit tab for autoflow (reusing current Reddit tab when available)");
      const freshTabId = await closeAllRedditTabsAndOpenFresh(optimizedUserName);
      const tabLoadListener = (tabId, changeInfo, tab) => {
        if (tabId === freshTabId && changeInfo.status === "complete") {
          chrome.tabs.onUpdated.removeListener(tabLoadListener);
          bgLogger.log(`[BG] Unified Reddit tab ${freshTabId} loaded, starting automation`);
          startAutomationForTab(freshTabId, userName);
        }
      };
      chrome.tabs.onUpdated.addListener(tabLoadListener);
      sendResponse({
        success: true,
        message: optimizedUserName !== userName ? `Initialized unified Reddit tab with direct navigation to ${optimizedUserName}/submitted/` : "Initialized unified Reddit tab for automation",
        tabId: freshTabId,
        userName
      });
      return;
    } catch (error) {
      bgLogger.error("[BG] Failed to start user status check automation:", error);
      sendResponse({
        success: false,
        error: error.message,
        userName
      });
    }
  }
  async function handleCloseCurrentTab(tabId, sendResponse) {
    bgLogger.log(`[BG] Request to close tab ${tabId}`);
    try {
      if (tabId) {
        await chrome.tabs.remove(tabId);
        bgLogger.log(`[BG] Successfully closed tab ${tabId}`);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: "No tabId provided for CLOSE_CURRENT_TAB" });
      }
    } catch (error) {
      bgLogger.error("[BG] Failed to close tab:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
  function handleProfileDataStored(username, postsCount, sendResponse) {
    bgLogger.log(`[BG] Profile data stored for ${username} with ${postsCount} posts`);
    chrome.action.setBadgeText({ text: "\u{1F464}" });
    chrome.action.setBadgeBackgroundColor({ color: "#4caf50" });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: "" });
    }, 3e3);
    sendResponse({ success: true });
  }
  async function handleToggleAutoRun(scriptType, enabled, sendResponse) {
    bgLogger.log(`[BG] Toggling auto-run for ${scriptType}: ${enabled}`);
    try {
      const result = await chrome.storage.sync.get(["autoRunSettings"]);
      const settings = result.autoRunSettings || { profileDetection: true, postSubmission: true };
      if (scriptType === "profile") {
        settings.profileDetection = enabled;
      } else if (scriptType === "post") {
        settings.postSubmission = enabled;
      } else if (scriptType === "all") {
        settings.profileDetection = enabled;
        settings.postSubmission = enabled;
      }
      await chrome.storage.sync.set({ autoRunSettings: settings });
      bgLogger.log("[BG] Auto-run settings updated:", settings);
      sendResponse({ success: true, settings });
    } catch (error) {
      bgLogger.error("[BG] Failed to toggle auto-run:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
  async function handleTriggerScriptManual(scriptType, tabId, sendResponse) {
    bgLogger.log(`[BG] Manual trigger for ${scriptType} on tab ${tabId}`);
    try {
      if (scriptType === "profile") {
        if (!tabId) {
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tabs.length === 0) {
            sendResponse({ success: false, error: "No active tab found" });
            return;
          }
          tabId = tabs[0].id;
        }
        await chrome.tabs.sendMessage(tabId, {
          type: "MANUAL_TRIGGER_SCRIPT",
          scriptType,
          mode: "manual"
        });
        sendResponse({ success: true, message: `Manual ${scriptType} script triggered` });
      } else if (scriptType === "post") {
        bgLogger.log("[BG] Creating new post tab for manual trigger");
        const userResult = await chrome.storage.sync.get(["redditUser"]);
        const userName = userResult.redditUser?.seren_name || "User";
        const postData = {
          title: "Manual post: " + Date.now(),
          body: "#manual #reddit #post " + Date.now(),
          url: "https://youtube.com/shorts/0xmhrS_VNNY?si=awYc8i5YljycesXq",
          subreddit: "sphynx"
        };
        const newTabId = await createCleanPostTab(userName, postData);
        sendResponse({
          success: true,
          message: "Manual post creation tab opened",
          tabId: newTabId
        });
      } else {
        sendResponse({ success: false, error: "Unknown script type" });
      }
    } catch (error) {
      bgLogger.error("[BG] Failed to trigger manual script:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
  async function handleCreatePostTab(postData, sendResponse) {
    bgLogger.log("[BG] Creating new post tab from content script request");
    try {
      const syncResult = await chrome.storage.sync.get(["redditUser"]);
      const localResult = await chrome.storage.local.get(["redditUser"]);
      const redditUser = syncResult.redditUser || localResult.redditUser;
      const userName = redditUser?.seren_name || "User";
      let freshPostData;
      if (redditUser && redditUser.seren_name) {
        bgLogger.log(`[BG] Generating fresh post data for user: ${redditUser.seren_name}`);
        freshPostData = await PostDataService.generatePost(redditUser.seren_name);
      } else {
        const errorMessage = "No username found - cannot generate post without user context";
        bgLogger.error("[BG] " + errorMessage);
        throw new Error(errorMessage);
      }
      bgLogger.log("[BG] Using fresh API-generated post data:", freshPostData);
      const newTabId = await createCleanPostTab(userName, freshPostData);
      sendResponse({
        success: true,
        message: "Post creation tab opened",
        tabId: newTabId
      });
    } catch (error) {
      bgLogger.error("[BG] Failed to create post tab from content script:", error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }
  async function handleGetTabState(tabId, sendResponse) {
    bgLogger.log(`[BG] Getting tab state for tab ${tabId}`);
    try {
      const state = tabStates[tabId];
      const isBackgroundPostTab = state && state.isPostTab;
      sendResponse({
        success: true,
        isBackgroundPostTab,
        state
      });
    } catch (error) {
      bgLogger.error("[BG] Failed to get tab state:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
  async function handleReuseRedditTab(targetUrl, action, sendResponse) {
    bgLogger.log(`[BG] Reusing reddit tab for action:`, action);
    bgLogger.log(`[BG] Target URL: ${targetUrl}`);
    try {
      const existingTabs = await chrome.tabs.query({ url: "*://*.reddit.com/*" });
      let targetTab;
      if (existingTabs.length > 0) {
        const inactiveTab = existingTabs.find((tab) => !tab.active);
        targetTab = inactiveTab || existingTabs[0];
        bgLogger.log(`[BG] Reusing existing tab ${targetTab.id} for action, navigating to ${targetUrl}`);
        await chrome.tabs.update(targetTab.id, {
          url: targetUrl,
          active: true
        });
      } else {
        bgLogger.log(`[BG] No existing reddit.com tabs found, creating new tab with URL: ${targetUrl}`);
        targetTab = await chrome.tabs.create({
          url: targetUrl,
          active: true
        });
      }
      const tabLoadListener = (tabId, changeInfo, tab) => {
        if (tabId === targetTab.id && changeInfo.status === "complete") {
          chrome.tabs.onUpdated.removeListener(tabLoadListener);
          bgLogger.log(`[BG] Tab ${targetTab.id} loaded, waiting for content script to be ready...`);
          waitForContentScript(targetTab.id, { retries: 15, initialDelayMs: 500 }).then((ready) => {
            if (!ready) {
              bgLogger.error(`[BG] \u274C Content script not ready in tab ${targetTab.id} after retries`);
              return;
            }
            bgLogger.log(`[BG] \u2705 Content script ready in tab ${targetTab.id}, sending action: ${action.type}`);
            try {
              chrome.tabs.sendMessage(targetTab.id, action).then(() => {
                bgLogger.log(`[BG] \u2705 Action ${action.type} sent successfully to tab ${targetTab.id}`);
              }).catch((err) => {
                bgLogger.error(`[BG] \u274C Failed to send action to tab ${targetTab.id}:`, err);
              });
            } catch (err) {
              bgLogger.error(`[BG] \u274C Error sending action to tab ${targetTab.id}:`, err);
            }
          }).catch((err) => {
            bgLogger.error(`[BG] \u274C Error waiting for content script:`, err);
          });
        }
      };
      chrome.tabs.onUpdated.addListener(tabLoadListener);
      sendResponse({
        success: true,
        message: `Reddit tab reused/created for ${action}`,
        tabId: targetTab.id
      });
    } catch (error) {
      bgLogger.error("[BG] Failed to reuse reddit tab:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
  async function handleOpenExtension(sendResponse) {
    bgLogger.log("[BG] Opening/focusing extension UI tab using unified tab manager");
    try {
      const tabId = await getExtensionTab();
      sendResponse({
        success: true,
        message: "Extension tab opened/focused",
        tabId
      });
    } catch (error) {
      bgLogger.error("[BG] Failed to open extension tab:", error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }

  // src-bex/background.js
  async function restartAutoFlowFromBeginning(userName) {
    if (!userName)
      return;
    await AutoFlowStateManager.clearState(userName);
    handleCheckUserStatus(userName, () => {
    });
  }
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const senderTabId = sender.tab ? sender.tab.id : null;
    bgLogger.log("Background received message:", message.type, senderTabId ? `from tab ${senderTabId}` : "from popup");
    switch (message.type) {
      case "GET_REDDIT_INFO":
        handleGetRedditInfo(sendResponse);
        break;
      case "CREATE_POST":
        handleCreatePost(message.data, sendResponse);
        return true;
      case "SAVE_SETTINGS":
        handleSaveSettings(message.data, sendResponse);
        break;
      case "USERNAME_STORED":
        handleUsernameStored(message.username, message.timestamp, sendResponse);
        break;
      case "GET_STORED_USERNAME":
        handleGetStoredUsername(sendResponse);
        return true;
      case "GET_USER_STATUS":
        handleGetUserStatus(sendResponse);
        return true;
      case "CHECK_USER_STATUS":
        handleCheckUserStatus(message.userName, sendResponse);
        return true;
      case "CREATE_POST_FROM_POPUP":
        handleCreatePostFromPopup(message.userName, sendResponse);
        return true;
      case "CONTENT_SCRIPT_READY":
        handleContentScriptReady(senderTabId, message.url);
        sendResponse({ received: true });
        break;
      case "URL_CHANGED":
        if (senderTabId) {
          bgLogger.log(`URL Changed in tab ${senderTabId}: ${message.url}`);
          const state = tabStates[senderTabId];
          if (state) {
            checkAndAdvanceState(senderTabId, state, message.url);
          }
        }
        sendResponse({ received: true });
        break;
      case "ACTION_COMPLETED":
        handleActionCompleted(senderTabId, message.action, message.success, message.data);
        sendResponse({ received: true });
        return true;
      case "USER_STATUS_SAVED":
        handleUserStatusSaved(message.data, sendResponse);
        break;
      case "CLOSE_CURRENT_TAB":
        handleCloseCurrentTab(senderTabId, sendResponse);
        return true;
      case "PROFILE_DATA_STORED":
        handleProfileDataStored(message.username, message.postsCount, sendResponse);
        break;
      case "TOGGLE_AUTO_RUN":
        handleToggleAutoRun(message.scriptType, message.enabled, sendResponse);
        return true;
      case "TRIGGER_SCRIPT_MANUAL":
        handleTriggerScriptManual(message.scriptType, senderTabId, sendResponse);
        return true;
      case "CREATE_POST_TAB":
        handleCreatePostTab(message.postData, sendResponse);
        return true;
      case "GET_TAB_STATE":
        handleGetTabState(senderTabId, sendResponse);
        return true;
      case "REUSE_REDDIT_TAB":
        handleReuseRedditTab(message.url, message.action, sendResponse);
        return true;
      case "RESUME_AUTO_FLOW":
        resumeAutoFlow(message.state, sendResponse);
        return true;
      case "OPEN_EXTENSION":
        handleOpenExtension(sendResponse);
        return true;
      default:
        bgLogger.log("Unknown message type:", message.type);
        sendResponse({ error: "Unknown message type" });
    }
  });
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const state = tabStates[tabId];
    if ((changeInfo.url || changeInfo.status === "complete") && tab.url && tab.url.includes("reddit.com")) {
      if (state) {
        checkAndAdvanceState(tabId, state, tab.url);
      }
    }
  });
  chrome.tabs.onRemoved.addListener((tabId) => {
    delete tabStates[tabId];
    processedTabs.delete(tabId);
    handleTabClosed(tabId).catch(() => {
    });
  });
  var background_default = bexBackground((bridge) => {
    bgLogger.log("Background script bridge initialized", bridge);
    chrome.storage.local.remove(["autoFlowState_unknown"]).catch(() => {
    });
    const STALL_TIMEOUT_MS2 = 5 * 60 * 1e3;
    setStallWatchdogIntervalId(setInterval(() => {
      const now = Date.now();
      for (const [tabIdStr, state] of Object.entries(tabStates)) {
        if (!state)
          continue;
        if (state.status === SM_STEPS.POSTING)
          continue;
        const lastTs = state.lastFeedbackTimestamp || state.stepStartTime;
        if (!lastTs)
          continue;
        if (now - lastTs <= STALL_TIMEOUT_MS2)
          continue;
        const userName = state.userName;
        delete tabStates[tabIdStr];
        restartAutoFlowFromBeginning(userName).catch(() => {
        });
      }
    }, 3e4));
  });

  // .quasar/bex/entry-background.js
  var connections = {};
  var addConnection = (port) => {
    const tab = port.sender.tab;
    let connectionId;
    if (port.name.indexOf(":") > -1) {
      const split = port.name.split(":");
      connectionId = split[1];
      port.name = split[0];
    }
    if (tab !== void 0) {
      connectionId = tab.id;
    }
    let currentConnection = connections[connectionId];
    if (!currentConnection) {
      currentConnection = connections[connectionId] = {};
    }
    currentConnection[port.name] = {
      port,
      connected: true,
      listening: false
    };
    return currentConnection[port.name];
  };
  chrome.runtime.onConnect.addListener((port) => {
    const thisConnection = addConnection(port);
    thisConnection.port.onDisconnect.addListener(() => {
      thisConnection.connected = false;
    });
    const bridge = new Bridge({
      listen(fn) {
        for (let connectionId in connections) {
          const connection = connections[connectionId];
          if (connection.app && !connection.app.listening) {
            connection.app.listening = true;
            connection.app.port.onMessage.addListener(fn);
          }
          if (connection.contentScript && !connection.contentScript.listening) {
            connection.contentScript.port.onMessage.addListener(fn);
            connection.contentScript.listening = true;
          }
        }
      },
      send(data) {
        for (let connectionId in connections) {
          const connection = connections[connectionId];
          connection.app && connection.app.connected && connection.app.port.postMessage(data);
          connection.contentScript && connection.contentScript.connected && connection.contentScript.port.postMessage(data);
        }
      }
    });
    background_default(bridge, connections);
    for (let connectionId in connections) {
      const connection = connections[connectionId];
      if (connection.app && connection.contentScript) {
        mapConnections(connection.app, connection.contentScript);
      }
    }
  });
  function mapConnections(app, contentScript) {
    app.port.onMessage.addListener((message) => {
      if (contentScript.connected) {
        contentScript.port.postMessage(message);
      }
    });
    contentScript.port.onMessage.addListener((message) => {
      if (app.connected) {
        app.port.postMessage(message);
      }
    });
  }
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCAiLi4vLi4vLnF1YXNhci9iZXgvYnJpZGdlLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xdWFzYXIvc3JjL3V0aWxzL3VpZC91aWQuanMiLCAiLi4vLi4vc3JjLWJleC9sb2dnZXIuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3F1YXNhci93cmFwcGVycy9pbmRleC5qcyIsICIuLi8uLi9zcmMtYmV4L3N0YXRlLW1hbmFnZXIuanMiLCAiLi4vLi4vc3JjLWJleC9wb3N0LXNlcnZpY2UuanMiLCAiLi4vLi4vc3JjLWJleC91bmlmaWVkLXRhYi1tYW5hZ2VyLmpzIiwgIi4uLy4uL3NyYy1iZXgvbWVzc2FnZS1oYW5kbGVycy5qcyIsICIuLi8uLi9zcmMtYmV4L2JhY2tncm91bmQuanMiLCAiLi4vLi4vLnF1YXNhci9iZXgvZW50cnktYmFja2dyb3VuZC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFIgPSB0eXBlb2YgUmVmbGVjdCA9PT0gJ29iamVjdCcgPyBSZWZsZWN0IDogbnVsbFxudmFyIFJlZmxlY3RBcHBseSA9IFIgJiYgdHlwZW9mIFIuYXBwbHkgPT09ICdmdW5jdGlvbidcbiAgPyBSLmFwcGx5XG4gIDogZnVuY3Rpb24gUmVmbGVjdEFwcGx5KHRhcmdldCwgcmVjZWl2ZXIsIGFyZ3MpIHtcbiAgICByZXR1cm4gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwodGFyZ2V0LCByZWNlaXZlciwgYXJncyk7XG4gIH1cblxudmFyIFJlZmxlY3RPd25LZXlzXG5pZiAoUiAmJiB0eXBlb2YgUi5vd25LZXlzID09PSAnZnVuY3Rpb24nKSB7XG4gIFJlZmxlY3RPd25LZXlzID0gUi5vd25LZXlzXG59IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcbiAgUmVmbGVjdE93bktleXMgPSBmdW5jdGlvbiBSZWZsZWN0T3duS2V5cyh0YXJnZXQpIHtcbiAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGFyZ2V0KVxuICAgICAgLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHRhcmdldCkpO1xuICB9O1xufSBlbHNlIHtcbiAgUmVmbGVjdE93bktleXMgPSBmdW5jdGlvbiBSZWZsZWN0T3duS2V5cyh0YXJnZXQpIHtcbiAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGFyZ2V0KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gUHJvY2Vzc0VtaXRXYXJuaW5nKHdhcm5pbmcpIHtcbiAgaWYgKGNvbnNvbGUgJiYgY29uc29sZS53YXJuKSBjb25zb2xlLndhcm4od2FybmluZyk7XG59XG5cbnZhciBOdW1iZXJJc05hTiA9IE51bWJlci5pc05hTiB8fCBmdW5jdGlvbiBOdW1iZXJJc05hTih2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT09IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIEV2ZW50RW1pdHRlci5pbml0LmNhbGwodGhpcyk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbm1vZHVsZS5leHBvcnRzLm9uY2UgPSBvbmNlO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50c0NvdW50ID0gMDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxudmFyIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuZnVuY3Rpb24gY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcikge1xuICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIFwibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgRnVuY3Rpb24uIFJlY2VpdmVkIHR5cGUgJyArIHR5cGVvZiBsaXN0ZW5lcik7XG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50RW1pdHRlciwgJ2RlZmF1bHRNYXhMaXN0ZW5lcnMnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gIH0sXG4gIHNldDogZnVuY3Rpb24oYXJnKSB7XG4gICAgaWYgKHR5cGVvZiBhcmcgIT09ICdudW1iZXInIHx8IGFyZyA8IDAgfHwgTnVtYmVySXNOYU4oYXJnKSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RoZSB2YWx1ZSBvZiBcImRlZmF1bHRNYXhMaXN0ZW5lcnNcIiBpcyBvdXQgb2YgcmFuZ2UuIEl0IG11c3QgYmUgYSBub24tbmVnYXRpdmUgbnVtYmVyLiBSZWNlaXZlZCAnICsgYXJnICsgJy4nKTtcbiAgICB9XG4gICAgZGVmYXVsdE1heExpc3RlbmVycyA9IGFyZztcbiAgfVxufSk7XG5cbkV2ZW50RW1pdHRlci5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgaWYgKHRoaXMuX2V2ZW50cyA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICB0aGlzLl9ldmVudHMgPT09IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKS5fZXZlbnRzKSB7XG4gICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gIH1cblxuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufTtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKG4pIHtcbiAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJyB8fCBuIDwgMCB8fCBOdW1iZXJJc05hTihuKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgb2YgXCJuXCIgaXMgb3V0IG9mIHJhbmdlLiBJdCBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIG51bWJlci4gUmVjZWl2ZWQgJyArIG4gKyAnLicpO1xuICB9XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gX2dldE1heExpc3RlbmVycyh0aGF0KSB7XG4gIGlmICh0aGF0Ll9tYXhMaXN0ZW5lcnMgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gIHJldHVybiB0aGF0Ll9tYXhMaXN0ZW5lcnM7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZ2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gZ2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gX2dldE1heExpc3RlbmVycyh0aGlzKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQodHlwZSkge1xuICB2YXIgYXJncyA9IFtdO1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgYXJncy5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gIHZhciBkb0Vycm9yID0gKHR5cGUgPT09ICdlcnJvcicpO1xuXG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gIGlmIChldmVudHMgIT09IHVuZGVmaW5lZClcbiAgICBkb0Vycm9yID0gKGRvRXJyb3IgJiYgZXZlbnRzLmVycm9yID09PSB1bmRlZmluZWQpO1xuICBlbHNlIGlmICghZG9FcnJvcilcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAoZG9FcnJvcikge1xuICAgIHZhciBlcjtcbiAgICBpZiAoYXJncy5sZW5ndGggPiAwKVxuICAgICAgZXIgPSBhcmdzWzBdO1xuICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAvLyBOb3RlOiBUaGUgY29tbWVudHMgb24gdGhlIGB0aHJvd2AgbGluZXMgYXJlIGludGVudGlvbmFsLCB0aGV5IHNob3dcbiAgICAgIC8vIHVwIGluIE5vZGUncyBvdXRwdXQgaWYgdGhpcyByZXN1bHRzIGluIGFuIHVuaGFuZGxlZCBleGNlcHRpb24uXG4gICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICB9XG4gICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuaGFuZGxlZCBlcnJvci4nICsgKGVyID8gJyAoJyArIGVyLm1lc3NhZ2UgKyAnKScgOiAnJykpO1xuICAgIGVyci5jb250ZXh0ID0gZXI7XG4gICAgdGhyb3cgZXJyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICB9XG5cbiAgdmFyIGhhbmRsZXIgPSBldmVudHNbdHlwZV07XG5cbiAgaWYgKGhhbmRsZXIgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgUmVmbGVjdEFwcGx5KGhhbmRsZXIsIHRoaXMsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBSZWZsZWN0QXBwbHkobGlzdGVuZXJzW2ldLCB0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuZnVuY3Rpb24gX2FkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIHByZXBlbmQpIHtcbiAgdmFyIG07XG4gIHZhciBldmVudHM7XG4gIHZhciBleGlzdGluZztcblxuICBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKTtcblxuICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHRhcmdldC5fZXZlbnRzQ291bnQgPSAwO1xuICB9IGVsc2Uge1xuICAgIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gICAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICAgIGlmIChldmVudHMubmV3TGlzdGVuZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGFyZ2V0LmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyID8gbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgICAgIC8vIFJlLWFzc2lnbiBgZXZlbnRzYCBiZWNhdXNlIGEgbmV3TGlzdGVuZXIgaGFuZGxlciBjb3VsZCBoYXZlIGNhdXNlZCB0aGVcbiAgICAgIC8vIHRoaXMuX2V2ZW50cyB0byBiZSBhc3NpZ25lZCB0byBhIG5ldyBvYmplY3RcbiAgICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuICAgIH1cbiAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXTtcbiAgfVxuXG4gIGlmIChleGlzdGluZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgICArK3RhcmdldC5fZXZlbnRzQ291bnQ7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBleGlzdGluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9XG4gICAgICAgIHByZXBlbmQgPyBbbGlzdGVuZXIsIGV4aXN0aW5nXSA6IFtleGlzdGluZywgbGlzdGVuZXJdO1xuICAgICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIH0gZWxzZSBpZiAocHJlcGVuZCkge1xuICAgICAgZXhpc3RpbmcudW5zaGlmdChsaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4aXN0aW5nLnB1c2gobGlzdGVuZXIpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gICAgbSA9IF9nZXRNYXhMaXN0ZW5lcnModGFyZ2V0KTtcbiAgICBpZiAobSA+IDAgJiYgZXhpc3RpbmcubGVuZ3RoID4gbSAmJiAhZXhpc3Rpbmcud2FybmVkKSB7XG4gICAgICBleGlzdGluZy53YXJuZWQgPSB0cnVlO1xuICAgICAgLy8gTm8gZXJyb3IgY29kZSBmb3IgdGhpcyBzaW5jZSBpdCBpcyBhIFdhcm5pbmdcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1yZXN0cmljdGVkLXN5bnRheFxuICAgICAgdmFyIHcgPSBuZXcgRXJyb3IoJ1Bvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgbGVhayBkZXRlY3RlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLmxlbmd0aCArICcgJyArIFN0cmluZyh0eXBlKSArICcgbGlzdGVuZXJzICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnYWRkZWQuIFVzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5jcmVhc2UgbGltaXQnKTtcbiAgICAgIHcubmFtZSA9ICdNYXhMaXN0ZW5lcnNFeGNlZWRlZFdhcm5pbmcnO1xuICAgICAgdy5lbWl0dGVyID0gdGFyZ2V0O1xuICAgICAgdy50eXBlID0gdHlwZTtcbiAgICAgIHcuY291bnQgPSBleGlzdGluZy5sZW5ndGg7XG4gICAgICBQcm9jZXNzRW1pdFdhcm5pbmcodyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgdHlwZSwgbGlzdGVuZXIsIGZhbHNlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCB0cnVlKTtcbiAgICB9O1xuXG5mdW5jdGlvbiBvbmNlV3JhcHBlcigpIHtcbiAgaWYgKCF0aGlzLmZpcmVkKSB7XG4gICAgdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy50eXBlLCB0aGlzLndyYXBGbik7XG4gICAgdGhpcy5maXJlZCA9IHRydWU7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0KTtcbiAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5hcHBseSh0aGlzLnRhcmdldCwgYXJndW1lbnRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfb25jZVdyYXAodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgc3RhdGUgPSB7IGZpcmVkOiBmYWxzZSwgd3JhcEZuOiB1bmRlZmluZWQsIHRhcmdldDogdGFyZ2V0LCB0eXBlOiB0eXBlLCBsaXN0ZW5lcjogbGlzdGVuZXIgfTtcbiAgdmFyIHdyYXBwZWQgPSBvbmNlV3JhcHBlci5iaW5kKHN0YXRlKTtcbiAgd3JhcHBlZC5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICBzdGF0ZS53cmFwRm4gPSB3cmFwcGVkO1xuICByZXR1cm4gd3JhcHBlZDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZSh0eXBlLCBsaXN0ZW5lcikge1xuICBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKTtcbiAgdGhpcy5vbih0eXBlLCBfb25jZVdyYXAodGhpcywgdHlwZSwgbGlzdGVuZXIpKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRPbmNlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRPbmNlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIGNoZWNrTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgdGhpcy5wcmVwZW5kTGlzdGVuZXIodHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4vLyBFbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWYgYW5kIG9ubHkgaWYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBsaXN0LCBldmVudHMsIHBvc2l0aW9uLCBpLCBvcmlnaW5hbExpc3RlbmVyO1xuXG4gICAgICBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKTtcblxuICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICAgICAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgbGlzdCA9IGV2ZW50c1t0eXBlXTtcbiAgICAgIGlmIChsaXN0ID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHwgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApXG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3QubGlzdGVuZXIgfHwgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBsaXN0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHBvc2l0aW9uID0gLTE7XG5cbiAgICAgICAgZm9yIChpID0gbGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fCBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICAgICAgb3JpZ2luYWxMaXN0ZW5lciA9IGxpc3RbaV0ubGlzdGVuZXI7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICAgIGlmIChwb3NpdGlvbiA9PT0gMClcbiAgICAgICAgICBsaXN0LnNoaWZ0KCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHNwbGljZU9uZShsaXN0LCBwb3NpdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpXG4gICAgICAgICAgZXZlbnRzW3R5cGVdID0gbGlzdFswXTtcblxuICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIG9yaWdpbmFsTGlzdGVuZXIgfHwgbGlzdGVuZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbiAgICBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnModHlwZSkge1xuICAgICAgdmFyIGxpc3RlbmVycywgZXZlbnRzLCBpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoZXZlbnRzID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudHNbdHlwZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZXZlbnRzKTtcbiAgICAgICAgdmFyIGtleTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGxpc3RlbmVycyA9IGV2ZW50c1t0eXBlXTtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICAgICAgfSBlbHNlIGlmIChsaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBMSUZPIG9yZGVyXG4gICAgICAgIGZvciAoaSA9IGxpc3RlbmVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5mdW5jdGlvbiBfbGlzdGVuZXJzKHRhcmdldCwgdHlwZSwgdW53cmFwKSB7XG4gIHZhciBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcblxuICBpZiAoZXZlbnRzID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIFtdO1xuXG4gIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuICBpZiAoZXZsaXN0ZW5lciA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBbXTtcblxuICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpXG4gICAgcmV0dXJuIHVud3JhcCA/IFtldmxpc3RlbmVyLmxpc3RlbmVyIHx8IGV2bGlzdGVuZXJdIDogW2V2bGlzdGVuZXJdO1xuXG4gIHJldHVybiB1bndyYXAgP1xuICAgIHVud3JhcExpc3RlbmVycyhldmxpc3RlbmVyKSA6IGFycmF5Q2xvbmUoZXZsaXN0ZW5lciwgZXZsaXN0ZW5lci5sZW5ndGgpO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyh0eXBlKSB7XG4gIHJldHVybiBfbGlzdGVuZXJzKHRoaXMsIHR5cGUsIHRydWUpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yYXdMaXN0ZW5lcnMgPSBmdW5jdGlvbiByYXdMaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLmxpc3RlbmVyQ291bnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBsaXN0ZW5lckNvdW50LmNhbGwoZW1pdHRlciwgdHlwZSk7XG4gIH1cbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGxpc3RlbmVyQ291bnQ7XG5mdW5jdGlvbiBsaXN0ZW5lckNvdW50KHR5cGUpIHtcbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcblxuICBpZiAoZXZlbnRzICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcblxuICAgIGlmICh0eXBlb2YgZXZsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIGlmIChldmxpc3RlbmVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gMDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5ldmVudE5hbWVzID0gZnVuY3Rpb24gZXZlbnROYW1lcygpIHtcbiAgcmV0dXJuIHRoaXMuX2V2ZW50c0NvdW50ID4gMCA/IFJlZmxlY3RPd25LZXlzKHRoaXMuX2V2ZW50cykgOiBbXTtcbn07XG5cbmZ1bmN0aW9uIGFycmF5Q2xvbmUoYXJyLCBuKSB7XG4gIHZhciBjb3B5ID0gbmV3IEFycmF5KG4pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSlcbiAgICBjb3B5W2ldID0gYXJyW2ldO1xuICByZXR1cm4gY29weTtcbn1cblxuZnVuY3Rpb24gc3BsaWNlT25lKGxpc3QsIGluZGV4KSB7XG4gIGZvciAoOyBpbmRleCArIDEgPCBsaXN0Lmxlbmd0aDsgaW5kZXgrKylcbiAgICBsaXN0W2luZGV4XSA9IGxpc3RbaW5kZXggKyAxXTtcbiAgbGlzdC5wb3AoKTtcbn1cblxuZnVuY3Rpb24gdW53cmFwTGlzdGVuZXJzKGFycikge1xuICB2YXIgcmV0ID0gbmV3IEFycmF5KGFyci5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJldC5sZW5ndGg7ICsraSkge1xuICAgIHJldFtpXSA9IGFycltpXS5saXN0ZW5lciB8fCBhcnJbaV07XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gb25jZShlbWl0dGVyLCBuYW1lKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgZnVuY3Rpb24gZXJyb3JMaXN0ZW5lcihlcnIpIHtcbiAgICAgIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIobmFtZSwgcmVzb2x2ZXIpO1xuICAgICAgcmVqZWN0KGVycik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzb2x2ZXIoKSB7XG4gICAgICBpZiAodHlwZW9mIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZW1pdHRlci5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBlcnJvckxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICAgIHJlc29sdmUoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICB9O1xuXG4gICAgZXZlbnRUYXJnZXRBZ25vc3RpY0FkZExpc3RlbmVyKGVtaXR0ZXIsIG5hbWUsIHJlc29sdmVyLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgaWYgKG5hbWUgIT09ICdlcnJvcicpIHtcbiAgICAgIGFkZEVycm9ySGFuZGxlcklmRXZlbnRFbWl0dGVyKGVtaXR0ZXIsIGVycm9yTGlzdGVuZXIsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhZGRFcnJvckhhbmRsZXJJZkV2ZW50RW1pdHRlcihlbWl0dGVyLCBoYW5kbGVyLCBmbGFncykge1xuICBpZiAodHlwZW9mIGVtaXR0ZXIub24gPT09ICdmdW5jdGlvbicpIHtcbiAgICBldmVudFRhcmdldEFnbm9zdGljQWRkTGlzdGVuZXIoZW1pdHRlciwgJ2Vycm9yJywgaGFuZGxlciwgZmxhZ3MpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGV2ZW50VGFyZ2V0QWdub3N0aWNBZGRMaXN0ZW5lcihlbWl0dGVyLCBuYW1lLCBsaXN0ZW5lciwgZmxhZ3MpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaWYgKGZsYWdzLm9uY2UpIHtcbiAgICAgIGVtaXR0ZXIub25jZShuYW1lLCBsaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVtaXR0ZXIub24obmFtZSwgbGlzdGVuZXIpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgZW1pdHRlci5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gRXZlbnRUYXJnZXQgZG9lcyBub3QgaGF2ZSBgZXJyb3JgIGV2ZW50IHNlbWFudGljcyBsaWtlIE5vZGVcbiAgICAvLyBFdmVudEVtaXR0ZXJzLCB3ZSBkbyBub3QgbGlzdGVuIGZvciBgZXJyb3JgIGV2ZW50cyBoZXJlLlxuICAgIGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBmdW5jdGlvbiB3cmFwTGlzdGVuZXIoYXJnKSB7XG4gICAgICAvLyBJRSBkb2VzIG5vdCBoYXZlIGJ1aWx0aW4gYHsgb25jZTogdHJ1ZSB9YCBzdXBwb3J0IHNvIHdlXG4gICAgICAvLyBoYXZlIHRvIGRvIGl0IG1hbnVhbGx5LlxuICAgICAgaWYgKGZsYWdzLm9uY2UpIHtcbiAgICAgICAgZW1pdHRlci5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIHdyYXBMaXN0ZW5lcik7XG4gICAgICB9XG4gICAgICBsaXN0ZW5lcihhcmcpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBcImVtaXR0ZXJcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgRXZlbnRFbWl0dGVyLiBSZWNlaXZlZCB0eXBlICcgKyB0eXBlb2YgZW1pdHRlcik7XG4gIH1cbn1cbiIsICIvKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyoqXG4gKiBUSElTIEZJTEUgSVMgR0VORVJBVEVEIEFVVE9NQVRJQ0FMTFkuXG4gKiBETyBOT1QgRURJVC5cbiAqKi9cblxuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJ1xuaW1wb3J0IHVpZCBmcm9tICdxdWFzYXIvc3JjL3V0aWxzL3VpZC91aWQuanMnXG5cbmNvbnN0XG4gIHR5cGVTaXplcyA9IHtcbiAgICAndW5kZWZpbmVkJzogKCkgPT4gMCxcbiAgICAnYm9vbGVhbic6ICgpID0+IDQsXG4gICAgJ251bWJlcic6ICgpID0+IDgsXG4gICAgJ3N0cmluZyc6IGl0ZW0gPT4gMiAqIGl0ZW0ubGVuZ3RoLFxuICAgICdvYmplY3QnOiBpdGVtID0+ICFpdGVtID8gMCA6IE9iamVjdFxuICAgICAgLmtleXMoaXRlbSlcbiAgICAgIC5yZWR1Y2UoKHRvdGFsLCBrZXkpID0+IHNpemVPZihrZXkpICsgc2l6ZU9mKGl0ZW1ba2V5XSkgKyB0b3RhbCwgMClcbiAgfSxcbiAgc2l6ZU9mID0gdmFsdWUgPT4gdHlwZVNpemVzW3R5cGVvZiB2YWx1ZV0odmFsdWUpXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJyaWRnZSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yICh3YWxsKSB7XG4gICAgc3VwZXIoKVxuXG4gICAgdGhpcy5zZXRNYXhMaXN0ZW5lcnMoSW5maW5pdHkpXG4gICAgdGhpcy53YWxsID0gd2FsbFxuXG4gICAgd2FsbC5saXN0ZW4obWVzc2FnZXMgPT4ge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkobWVzc2FnZXMpKSB7XG4gICAgICAgIG1lc3NhZ2VzLmZvckVhY2gobWVzc2FnZSA9PiB0aGlzLl9lbWl0KG1lc3NhZ2UpKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX2VtaXQobWVzc2FnZXMpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuX3NlbmRpbmdRdWV1ZSA9IFtdXG4gICAgdGhpcy5fc2VuZGluZyA9IGZhbHNlXG4gICAgdGhpcy5fbWF4TWVzc2FnZVNpemUgPSAzMiAqIDEwMjQgKiAxMDI0IC8vIDMybWJcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIGFuIGV2ZW50LlxuICAgKlxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICogQHBhcmFtIHBheWxvYWRcbiAgICogQHJldHVybnMgUHJvbWlzZTw+XG4gICAqL1xuICBzZW5kIChldmVudCwgcGF5bG9hZCkge1xuICAgIHJldHVybiB0aGlzLl9zZW5kKFt7IGV2ZW50LCBwYXlsb2FkIH1dKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhbGwgcmVnaXN0ZXJlZCBldmVudHNcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBnZXRFdmVudHMgKCkge1xuICAgIHJldHVybiB0aGlzLl9ldmVudHNcbiAgfVxuXG4gIG9uKGV2ZW50TmFtZSwgbGlzdGVuZXIpIHtcbiAgICByZXR1cm4gc3VwZXIub24oZXZlbnROYW1lLCAob3JpZ2luYWxQYXlsb2FkKSA9PiB7XG4gICAgICBsaXN0ZW5lcih7XG4gICAgICAgIC4uLm9yaWdpbmFsUGF5bG9hZCxcbiAgICAgICAgLy8gQ29udmVuaWVudCBhbHRlcm5hdGl2ZSB0byB0aGUgbWFudWFsIHVzYWdlIG9mIGBldmVudFJlc3BvbnNlS2V5YFxuICAgICAgICAvLyBXZSBjYW4ndCBzZW5kIHRoaXMgaW4gYF9uZXh0U2VuZGAgd2hpY2ggd2lsbCB0aGVuIGJlIHNlbnQgdXNpbmcgYHBvcnQucG9zdE1lc3NhZ2UoKWAsIHdoaWNoIGNhbid0IHNlcmlhbGl6ZSBmdW5jdGlvbnMuXG4gICAgICAgIC8vIFNvLCB3ZSBob29rIGludG8gdGhlIHVuZGVybHlpbmcgbGlzdGVuZXIgYW5kIGluY2x1ZGUgdGhlIGZ1bmN0aW9uIHRoZXJlLCB3aGljaCBoYXBwZW5zIGFmdGVyIHRoZSBzZW5kIG9wZXJhdGlvbi5cbiAgICAgICAgcmVzcG9uZDogKHBheWxvYWQgLyogb3B0aW9uYWwgKi8pID0+IHRoaXMuc2VuZChvcmlnaW5hbFBheWxvYWQuZXZlbnRSZXNwb25zZUtleSwgcGF5bG9hZClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIF9lbWl0IChtZXNzYWdlKSB7XG4gICAgaWYgKHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5lbWl0KG1lc3NhZ2UpXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5lbWl0KG1lc3NhZ2UuZXZlbnQsIG1lc3NhZ2UucGF5bG9hZClcbiAgICB9XG4gIH1cblxuICBfc2VuZCAobWVzc2FnZXMpIHtcbiAgICB0aGlzLl9zZW5kaW5nUXVldWUucHVzaChtZXNzYWdlcylcbiAgICByZXR1cm4gdGhpcy5fbmV4dFNlbmQoKVxuICB9XG5cbiAgX25leHRTZW5kICgpIHtcbiAgICBpZiAoIXRoaXMuX3NlbmRpbmdRdWV1ZS5sZW5ndGggfHwgdGhpcy5fc2VuZGluZykgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgdGhpcy5fc2VuZGluZyA9IHRydWVcblxuICAgIGNvbnN0XG4gICAgICBtZXNzYWdlcyA9IHRoaXMuX3NlbmRpbmdRdWV1ZS5zaGlmdCgpLFxuICAgICAgY3VycmVudE1lc3NhZ2UgPSBtZXNzYWdlc1swXSxcbiAgICAgIGV2ZW50TGlzdGVuZXJLZXkgPSBgJHtjdXJyZW50TWVzc2FnZS5ldmVudH0uJHt1aWQoKX1gLFxuICAgICAgZXZlbnRSZXNwb25zZUtleSA9IGV2ZW50TGlzdGVuZXJLZXkgKyAnLnJlc3VsdCdcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgYWxsQ2h1bmtzID0gW11cblxuICAgICAgY29uc3QgZm4gPSAocikgPT4ge1xuICAgICAgICAvLyBJZiB0aGlzIGlzIGEgc3BsaXQgbWVzc2FnZSB0aGVuIGtlZXAgbGlzdGVuaW5nIGZvciB0aGUgY2h1bmtzIGFuZCBidWlsZCBhIGxpc3QgdG8gcmVzb2x2ZVxuICAgICAgICBpZiAociAhPT0gdm9pZCAwICYmIHIuX2NodW5rU3BsaXQpIHtcbiAgICAgICAgICBjb25zdCBjaHVua0RhdGEgPSByLl9jaHVua1NwbGl0XG4gICAgICAgICAgYWxsQ2h1bmtzID0gWy4uLmFsbENodW5rcywgLi4uci5kYXRhXVxuXG4gICAgICAgICAgLy8gTGFzdCBjaHVuayByZWNlaXZlZCBzbyByZXNvbHZlIHRoZSBwcm9taXNlLlxuICAgICAgICAgIGlmIChjaHVua0RhdGEubGFzdENodW5rKSB7XG4gICAgICAgICAgICB0aGlzLm9mZihldmVudFJlc3BvbnNlS2V5LCBmbilcbiAgICAgICAgICAgIHJlc29sdmUoYWxsQ2h1bmtzKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aGlzLm9mZihldmVudFJlc3BvbnNlS2V5LCBmbilcbiAgICAgICAgICByZXNvbHZlKHIpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5vbihldmVudFJlc3BvbnNlS2V5LCBmbilcblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQWRkIGFuIGV2ZW50IHJlc3BvbnNlIGtleSB0byB0aGUgcGF5bG9hZCB3ZSdyZSBzZW5kaW5nIHNvIHRoZSBtZXNzYWdlIGtub3dzIHdoaWNoIGNoYW5uZWwgdG8gcmVzcG9uZCBvbi5cbiAgICAgICAgY29uc3QgbWVzc2FnZXNUb1NlbmQgPSBtZXNzYWdlcy5tYXAobSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLm0sXG4gICAgICAgICAgICAuLi57XG4gICAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgICBkYXRhOiBtLnBheWxvYWQsXG4gICAgICAgICAgICAgICAgZXZlbnRSZXNwb25zZUtleVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMud2FsbC5zZW5kKG1lc3NhZ2VzVG9TZW5kKVxuICAgICAgfVxuICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSAnTWVzc2FnZSBsZW5ndGggZXhjZWVkZWQgbWF4aW11bSBhbGxvd2VkIGxlbmd0aC4nXG5cbiAgICAgICAgaWYgKGVyci5tZXNzYWdlID09PSBlcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgcGF5bG9hZCBpcyBhbiBhcnJheSBhbmQgdG9vIGJpZyB0aGVuIHNwbGl0IGl0IGludG8gY2h1bmtzIGFuZCBzZW5kIHRvIHRoZSBjbGllbnRzIGJyaWRnZVxuICAgICAgICAgIC8vIHRoZSBjbGllbnQgYnJpZGdlIHdpbGwgdGhlbiByZXNvbHZlIHRoZSBwcm9taXNlLlxuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShjdXJyZW50TWVzc2FnZS5wYXlsb2FkKSkge1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvck1lc3NhZ2UgKyAnIE5vdGU6IFRoZSBicmlkZ2UgY2FuIGRlYWwgd2l0aCB0aGlzIGlzIGlmIHRoZSBwYXlsb2FkIGlzIGFuIEFycmF5LicpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgb2JqZWN0U2l6ZSA9IHNpemVPZihjdXJyZW50TWVzc2FnZSlcblxuICAgICAgICAgICAgaWYgKG9iamVjdFNpemUgPiB0aGlzLl9tYXhNZXNzYWdlU2l6ZSkge1xuICAgICAgICAgICAgICBjb25zdFxuICAgICAgICAgICAgICAgIGNodW5rc1JlcXVpcmVkID0gTWF0aC5jZWlsKG9iamVjdFNpemUgLyB0aGlzLl9tYXhNZXNzYWdlU2l6ZSksXG4gICAgICAgICAgICAgICAgYXJyYXlJdGVtQ291bnQgPSBNYXRoLmNlaWwoY3VycmVudE1lc3NhZ2UucGF5bG9hZC5sZW5ndGggLyBjaHVua3NSZXF1aXJlZClcblxuICAgICAgICAgICAgICBsZXQgZGF0YSA9IGN1cnJlbnRNZXNzYWdlLnBheWxvYWRcbiAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaHVua3NSZXF1aXJlZDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IHRha2UgPSBNYXRoLm1pbihkYXRhLmxlbmd0aCwgYXJyYXlJdGVtQ291bnQpXG5cbiAgICAgICAgICAgICAgICB0aGlzLndhbGwuc2VuZChbe1xuICAgICAgICAgICAgICAgICAgZXZlbnQ6IGN1cnJlbnRNZXNzYWdlLmV2ZW50LFxuICAgICAgICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICAgICAgICBfY2h1bmtTcGxpdDoge1xuICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiBjaHVua3NSZXF1aXJlZCxcbiAgICAgICAgICAgICAgICAgICAgICBsYXN0Q2h1bms6IGkgPT09IGNodW5rc1JlcXVpcmVkIC0gMVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLnNwbGljZSgwLCB0YWtlKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1dKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3NlbmRpbmcgPSBmYWxzZVxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7IHJldHVybiB0aGlzLl9uZXh0U2VuZCgpIH0sIDE2KVxuICAgIH0pXG4gIH1cbn1cbiIsICIvKipcbiAqIEJhc2VkIG9uIHRoZSB3b3JrIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9qY2hvb2svdXVpZC1yYW5kb21cbiAqL1xuXG5sZXRcbiAgYnVmLFxuICBidWZJZHggPSAwXG5jb25zdCBoZXhCeXRlcyA9IG5ldyBBcnJheSgyNTYpXG5cbi8vIFByZS1jYWxjdWxhdGUgdG9TdHJpbmcoMTYpIGZvciBzcGVlZFxuZm9yIChsZXQgaSA9IDA7IGkgPCAyNTY7IGkrKykge1xuICBoZXhCeXRlc1sgaSBdID0gKGkgKyAweDEwMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKVxufVxuXG4vLyBVc2UgYmVzdCBhdmFpbGFibGUgUFJOR1xuY29uc3QgcmFuZG9tQnl0ZXMgPSAoKCkgPT4ge1xuICAvLyBOb2RlICYgQnJvd3NlciBzdXBwb3J0XG4gIGNvbnN0IGxpYiA9IHR5cGVvZiBjcnlwdG8gIT09ICd1bmRlZmluZWQnXG4gICAgPyBjcnlwdG9cbiAgICA6IChcbiAgICAgICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICA/IHdpbmRvdy5jcnlwdG8gfHwgd2luZG93Lm1zQ3J5cHRvXG4gICAgICAgICAgOiB2b2lkIDBcbiAgICAgIClcblxuICBpZiAobGliICE9PSB2b2lkIDApIHtcbiAgICBpZiAobGliLnJhbmRvbUJ5dGVzICE9PSB2b2lkIDApIHtcbiAgICAgIHJldHVybiBsaWIucmFuZG9tQnl0ZXNcbiAgICB9XG4gICAgaWYgKGxpYi5nZXRSYW5kb21WYWx1ZXMgIT09IHZvaWQgMCkge1xuICAgICAgcmV0dXJuIG4gPT4ge1xuICAgICAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KG4pXG4gICAgICAgIGxpYi5nZXRSYW5kb21WYWx1ZXMoYnl0ZXMpXG4gICAgICAgIHJldHVybiBieXRlc1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuID0+IHtcbiAgICBjb25zdCByID0gW11cbiAgICBmb3IgKGxldCBpID0gbjsgaSA+IDA7IGktLSkge1xuICAgICAgci5wdXNoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1NikpXG4gICAgfVxuICAgIHJldHVybiByXG4gIH1cbn0pKClcblxuLy8gQnVmZmVyIHJhbmRvbSBudW1iZXJzIGZvciBzcGVlZFxuLy8gUmVkdWNlIG1lbW9yeSB1c2FnZSBieSBkZWNyZWFzaW5nIHRoaXMgbnVtYmVyIChtaW4gMTYpXG4vLyBvciBpbXByb3ZlIHNwZWVkIGJ5IGluY3JlYXNpbmcgdGhpcyBudW1iZXIgKHRyeSAxNjM4NClcbmNvbnN0IEJVRkZFUl9TSVpFID0gNDA5NlxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7XG4gIC8vIEJ1ZmZlciBzb21lIHJhbmRvbSBieXRlcyBmb3Igc3BlZWRcbiAgaWYgKGJ1ZiA9PT0gdm9pZCAwIHx8IChidWZJZHggKyAxNiA+IEJVRkZFUl9TSVpFKSkge1xuICAgIGJ1ZklkeCA9IDBcbiAgICBidWYgPSByYW5kb21CeXRlcyhCVUZGRVJfU0laRSlcbiAgfVxuXG4gIGNvbnN0IGIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChidWYsIGJ1ZklkeCwgKGJ1ZklkeCArPSAxNikpXG4gIGJbIDYgXSA9IChiWyA2IF0gJiAweDBmKSB8IDB4NDBcbiAgYlsgOCBdID0gKGJbIDggXSAmIDB4M2YpIHwgMHg4MFxuXG4gIHJldHVybiBoZXhCeXRlc1sgYlsgMCBdIF0gKyBoZXhCeXRlc1sgYlsgMSBdIF1cbiAgICArIGhleEJ5dGVzWyBiWyAyIF0gXSArIGhleEJ5dGVzWyBiWyAzIF0gXSArICctJ1xuICAgICsgaGV4Qnl0ZXNbIGJbIDQgXSBdICsgaGV4Qnl0ZXNbIGJbIDUgXSBdICsgJy0nXG4gICAgKyBoZXhCeXRlc1sgYlsgNiBdIF0gKyBoZXhCeXRlc1sgYlsgNyBdIF0gKyAnLSdcbiAgICArIGhleEJ5dGVzWyBiWyA4IF0gXSArIGhleEJ5dGVzWyBiWyA5IF0gXSArICctJ1xuICAgICsgaGV4Qnl0ZXNbIGJbIDEwIF0gXSArIGhleEJ5dGVzWyBiWyAxMSBdIF1cbiAgICArIGhleEJ5dGVzWyBiWyAxMiBdIF0gKyBoZXhCeXRlc1sgYlsgMTMgXSBdXG4gICAgKyBoZXhCeXRlc1sgYlsgMTQgXSBdICsgaGV4Qnl0ZXNbIGJbIDE1IF0gXVxufVxuIiwgIi8vIFNpbXBsZSBsb2dnZXIgZm9yIGJyb3dzZXIgZXh0ZW5zaW9uIGNvbnRleHQgc2NyaXB0c1xuY2xhc3MgRXh0ZW5zaW9uTG9nZ2VyIHtcbiAgY29uc3RydWN0b3IocHJlZml4ID0gJycpIHtcbiAgICB0aGlzLnByZWZpeCA9IHByZWZpeDtcbiAgICB0aGlzLmRlYnVnRW5hYmxlZCA9IHRydWU7IC8vIFNldCB0byB0cnVlIGZvciBkZWJ1Z2dpbmdcbiAgfVxuXG4gIGFzeW5jIGNoZWNrRGVidWdTZXR0aW5nKCkge1xuICAgIHRyeSB7XG4gICAgICAvLyBDaGVjayBpZiBkZWJ1ZyBtb2RlIGlzIGVuYWJsZWQgaW4gc3RvcmFnZVxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsnZGVidWdNb2RlJ10pO1xuICAgICAgLy8gRm9yIGJhY2tncm91bmQgc2NyaXB0cywgYWx3YXlzIGVuYWJsZSBsb2dnaW5nIHJlZ2FyZGxlc3Mgb2Ygc3RvcmFnZSBzZXR0aW5nXG4gICAgICB0aGlzLmRlYnVnRW5hYmxlZCA9IHRydWU7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIElmIHN0b3JhZ2UgaXMgbm90IGF2YWlsYWJsZSwga2VlcCBjdXJyZW50IHNldHRpbmdcbiAgICB9XG4gIH1cblxuICBsb2coLi4uYXJncykge1xuICAgIGlmICh0aGlzLmRlYnVnRW5hYmxlZCkge1xuICAgICAgY29uc29sZS5sb2codGhpcy5wcmVmaXgsIC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGluZm8oLi4uYXJncykge1xuICAgIGlmICh0aGlzLmRlYnVnRW5hYmxlZCkge1xuICAgICAgY29uc29sZS5pbmZvKHRoaXMucHJlZml4LCAuLi5hcmdzKTtcbiAgICB9XG4gIH1cblxuICB3YXJuKC4uLmFyZ3MpIHtcbiAgICAvLyBBbHdheXMgc2hvdyB3YXJuaW5nc1xuICAgIGNvbnNvbGUud2Fybih0aGlzLnByZWZpeCwgLi4uYXJncyk7XG4gIH1cblxuICBlcnJvciguLi5hcmdzKSB7XG4gICAgLy8gQWx3YXlzIHNob3cgZXJyb3JzXG4gICAgY29uc29sZS5lcnJvcih0aGlzLnByZWZpeCwgLi4uYXJncyk7XG4gIH1cblxuICBkZWJ1ZyguLi5hcmdzKSB7XG4gICAgaWYgKHRoaXMuZGVidWdFbmFibGVkKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKHRoaXMucHJlZml4LCAuLi5hcmdzKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gQ3JlYXRlIGxvZ2dlciBpbnN0YW5jZXMgZm9yIGRpZmZlcmVudCBjb250ZXh0c1xuZXhwb3J0IGNvbnN0IGRvbUxvZ2dlciA9IG5ldyBFeHRlbnNpb25Mb2dnZXIoJ1tET00gU2NyaXB0XScpO1xuZXhwb3J0IGNvbnN0IGJnTG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW0JHXScpO1xuZXhwb3J0IGNvbnN0IHN0YXRzTG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW1N0YXRzXScpO1xuZXhwb3J0IGNvbnN0IG1zZ0xvZ2dlciA9IG5ldyBFeHRlbnNpb25Mb2dnZXIoJ1tNZXNzYWdlXScpO1xuZXhwb3J0IGNvbnN0IHBvc3RTZXJ2aWNlTG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW1Bvc3REYXRhU2VydmljZV0nKTtcbmV4cG9ydCBjb25zdCBzdGF0ZUxvZ2dlciA9IG5ldyBFeHRlbnNpb25Mb2dnZXIoJ1tBdXRvRmxvd1N0YXRlTWFuYWdlcl0nKTtcbmV4cG9ydCBjb25zdCBjb250ZW50TG9nZ2VyID0gbmV3IEV4dGVuc2lvbkxvZ2dlcignW0NvbnRlbnQgU2NyaXB0XScpO1xuZXhwb3J0IGNvbnN0IHN1Ym1pdExvZ2dlciA9IG5ldyBFeHRlbnNpb25Mb2dnZXIoJ1tTdWJtaXQgU2NyaXB0XScpO1xuXG4vLyBJbml0aWFsaXplIGRlYnVnIHNldHRpbmcgZm9yIGFsbCBsb2dnZXJzXG5jb25zdCBpbml0RGVidWdNb2RlID0gYXN5bmMgKCkgPT4ge1xuICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgZG9tTG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKCksXG4gICAgYmdMb2dnZXIuY2hlY2tEZWJ1Z1NldHRpbmcoKSxcbiAgICBzdGF0c0xvZ2dlci5jaGVja0RlYnVnU2V0dGluZygpLFxuICAgIG1zZ0xvZ2dlci5jaGVja0RlYnVnU2V0dGluZygpLFxuICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKCksXG4gICAgc3RhdGVMb2dnZXIuY2hlY2tEZWJ1Z1NldHRpbmcoKSxcbiAgICBjb250ZW50TG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKCksXG4gICAgc3VibWl0TG9nZ2VyLmNoZWNrRGVidWdTZXR0aW5nKClcbiAgXSk7XG59O1xuXG4vLyBBdXRvLWluaXRpYWxpemVcbmluaXREZWJ1Z01vZGUoKTtcbiIsICIvLyBGdW5jdGlvbnMgaW4gdGhpcyBmaWxlIGFyZSBuby1vcCxcbi8vICB0aGV5IGp1c3QgdGFrZSBhIGNhbGxiYWNrIGZ1bmN0aW9uIGFuZCByZXR1cm4gaXRcbi8vIFRoZXkncmUgdXNlZCB0byBhcHBseSB0eXBpbmdzIHRvIHRoZSBjYWxsYmFja1xuLy8gIHBhcmFtZXRlcnMgYW5kIHJldHVybiB2YWx1ZSB3aGVuIHVzaW5nIFF1YXNhciB3aXRoIFR5cGVTY3JpcHRcbi8vIFdlIG5lZWQgdGhlc2UgaW4gYHVpYCBmb2xkZXIgdG8gbWFrZSBgcXVhc2FyL3dyYXBwZXJgIGltcG9ydCB3b3JrLFxuLy8gIGJ1dCB0aGV5IGFyZSB1c2VmdWwgb25seSBmb3IgUXVhc2FyIENMSSBwcm9qZWN0c1xuLy8gVGhleSBhcmUgdHlwZWQgdmlhIG1vZHVsZSBhdWdtZW50YXRpb24gYnkgYEBxdWFzYXIvYXBwLXdlYnBhY2tgIC8gYEBxdWFzYXIvYXBwLXZpdGVgXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBXYXJuaW5nIVxuICogQWxsIHRoZXNlIGFyZSBkZXByZWNhdGVkIHN0YXJ0aW5nIHdpdGhcbiAqICAgIEBxdWFzYXIvYXBwLXZpdGUgdjJcbiAqICAgIEBxdWFzYXIvYXBwLXdlYnBhY2sgdjRcbiAqXG4gKiBVc2UgdGhlIG5ldyB3cmFwcGVycyBmcm9tICNxLWFwcC93cmFwcGVyc1xuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmV4cG9ydCBmdW5jdGlvbiBib290IChjYWxsYmFjaykge1xuICByZXR1cm4gY2FsbGJhY2tcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZSAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVGZXRjaCAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb3V0ZSAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9yZSAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzc3JNaWRkbGV3YXJlIChjYWxsYmFjaykge1xuICByZXR1cm4gY2FsbGJhY2tcbn1cblxuLyoqXG4gKiBCZWxvdyBvbmx5IGZvciBAcXVhc2FyL2FwcC13ZWJwYWNrIHYzXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNzclByb2R1Y3Rpb25FeHBvcnQgKGNhbGxiYWNrKSB7XG4gIHJldHVybiBjYWxsYmFja1xufVxuXG4vKipcbiAqIEJlbG93IG9ubHkgZm9yIEBxdWFzYXIvYXBwLXZpdGUgdjFcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3NyQ3JlYXRlIChjYWxsYmFjaykge1xuICByZXR1cm4gY2FsbGJhY2tcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNzckxpc3RlbiAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzc3JDbG9zZSAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzc3JTZXJ2ZVN0YXRpY0NvbnRlbnQgKGNhbGxiYWNrKSB7XG4gIHJldHVybiBjYWxsYmFja1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3NyUmVuZGVyUHJlbG9hZFRhZyAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbi8qKlxuICogQmVsb3cgb25seSBmb3IgbGVnYWN5IEBxdWFzYXIvYXBwLXZpdGUgdjEgJiBAcXVhc2FyL2FwcC13ZWJwYWNrIHYzXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGJleEJhY2tncm91bmQgKGNhbGxiYWNrKSB7XG4gIHJldHVybiBjYWxsYmFja1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV4Q29udGVudCAoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXhEb20gKGNhbGxiYWNrKSB7XG4gIHJldHVybiBjYWxsYmFja1xufVxuIiwgImltcG9ydCB7IHN0YXRlTG9nZ2VyIH0gZnJvbSBcIi4vbG9nZ2VyLmpzXCI7LyoqXG4gKiBTdGF0ZSBNYW5hZ2VyIE1vZHVsZVxuICogSGFuZGxlcyBhdXRvbWF0aW9uIHN0YXRlIHBlcnNpc3RlbmNlLCByZWNvdmVyeSwgYW5kIHRhYiBzdGF0ZSB0cmFja2luZ1xuICovXG5cbi8vIFN0YXRlIG1hY2hpbmUgc3RlcCBkZWZpbml0aW9uc1xuZXhwb3J0IGNvbnN0IFNNX1NURVBTID0ge1xuICBJRExFOiAnSURMRScsXG4gIE5BVklHQVRJTkdfUFJPRklMRTogJ05BVklHQVRJTkdfUFJPRklMRScsXG4gIE5BVklHQVRJTkdfUE9TVFM6ICdOQVZJR0FUSU5HX1BPU1RTJyxcbiAgQ09MTEVDVElOR19QT1NUUzogJ0NPTExFQ1RJTkdfUE9TVFMnLFxuICBERUxFVElOR19QT1NUOiAnREVMRVRJTkdfUE9TVCcsXG4gIFBPU1RJTkc6ICdQT1NUSU5HJ1xufVxuXG4vLyBUcmFjayBhY3RpdmUgdGFiIHN0YXRlcyBmb3IgYXV0b21hdGlvblxuZXhwb3J0IGNvbnN0IHRhYlN0YXRlcyA9IHt9XG5cbi8vIFRyYWNrIHRhYnMgdGhhdCBoYXZlIGJlZW4gcHJvY2Vzc2VkIGZvciBhdXRvLXN0YXJ0IGF1dG9tYXRpb25cbmV4cG9ydCBjb25zdCBwcm9jZXNzZWRUYWJzID0gbmV3IFNldCgpXG5cbi8vIFBlcmlvZGljIGNoZWNrIGNvbmZpZ3VyYXRpb25cbmV4cG9ydCBjb25zdCBDSEVDS19JTlRFUlZBTCA9IDEyMTAwMFxubGV0IGNoZWNrSW50ZXJ2YWxJZCA9IG51bGxcblxuLy8gU3RhbGwgd2F0Y2hkb2cgY29uZmlndXJhdGlvblxuZXhwb3J0IGNvbnN0IFNUQUxMX1RJTUVPVVRfTVMgPSA1ICogNjAgKiAxMDAwXG5sZXQgc3RhbGxXYXRjaGRvZ0ludGVydmFsSWQgPSBudWxsXG5cbi8vIEdldHRlciBhbmQgc2V0dGVyIGZ1bmN0aW9ucyBmb3IgbXV0YWJsZSBzdGF0ZVxuZXhwb3J0IGZ1bmN0aW9uIGdldENoZWNrSW50ZXJ2YWxJZCgpIHtcbiAgcmV0dXJuIGNoZWNrSW50ZXJ2YWxJZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q2hlY2tJbnRlcnZhbElkKGlkKSB7XG4gIGNoZWNrSW50ZXJ2YWxJZCA9IGlkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdGFsbFdhdGNoZG9nSW50ZXJ2YWxJZCgpIHtcbiAgcmV0dXJuIHN0YWxsV2F0Y2hkb2dJbnRlcnZhbElkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTdGFsbFdhdGNoZG9nSW50ZXJ2YWxJZChpZCkge1xuICBzdGFsbFdhdGNoZG9nSW50ZXJ2YWxJZCA9IGlkXG59XG5cbi8qKlxuICogVXBkYXRlIHRoZSBsYXN0IGZlZWRiYWNrIHRpbWVzdGFtcCBmb3IgYSB0YWIgc3RhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZSAtIFRoZSB0YWIgc3RhdGUgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b3VjaFRhYlN0YXRlKHN0YXRlKSB7XG4gIGlmIChzdGF0ZSkgc3RhdGUubGFzdEZlZWRiYWNrVGltZXN0YW1wID0gRGF0ZS5ub3coKVxufVxuXG4vKipcbiAqIFJlc3RhcnQgYXV0b21hdGlvbiBmbG93IGZyb20gdGhlIGJlZ2lubmluZyBmb3IgYSB1c2VyXG4gKiBAcGFyYW0ge3N0cmluZ30gdXNlck5hbWUgLSBUaGUgUmVkZGl0IHVzZXJuYW1lXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXN0YXJ0QXV0b0Zsb3dGcm9tQmVnaW5uaW5nKHVzZXJOYW1lKSB7XG4gIGlmICghdXNlck5hbWUpIHJldHVyblxuICBhd2FpdCBBdXRvRmxvd1N0YXRlTWFuYWdlci5jbGVhclN0YXRlKHVzZXJOYW1lKVxuICAvLyBOb3RlOiBoYW5kbGVDaGVja1VzZXJTdGF0dXMgaXMgaW1wb3J0ZWQgZnJvbSBtZXNzYWdlLWhhbmRsZXJzXG4gIC8vIFRoaXMgd2lsbCBiZSBjYWxsZWQgZnJvbSBtZXNzYWdlLWhhbmRsZXJzLmpzXG59XG5cbi8qKlxuICogQXV0by1GbG93IFN0YXRlIE1hbmFnZXIgZm9yIHBlcnNpc3RlbmNlIGFjcm9zcyBzZXNzaW9uc1xuICogSGFuZGxlcyBzYXZpbmcsIGxvYWRpbmcsIGFuZCByZWNvdmVyaW5nIGF1dG9tYXRpb24gc3RhdGVcbiAqL1xuZXhwb3J0IGNsYXNzIEF1dG9GbG93U3RhdGVNYW5hZ2VyIHtcbiAgc3RhdGljIFNUQVRFX0VYUElSWV9NUyA9IDI0ICogNjAgKiA2MCAqIDEwMDAgLy8gMjQgaG91cnNcblxuICBzdGF0aWMgZ2V0U3RhdGVLZXkodXNlck5hbWUpIHtcbiAgICByZXR1cm4gYGF1dG9GbG93U3RhdGVfJHt1c2VyTmFtZX1gXG4gIH1cblxuICBzdGF0aWMgYXN5bmMgc2F2ZVN0YXRlKHN0ZXAsIGRhdGEgPSB7fSkge1xuICAgIGNvbnN0IHVzZXJOYW1lID0gZGF0YS51c2VyTmFtZVxuICAgIGlmICghdXNlck5hbWUpIHJldHVyblxuXG4gICAgY29uc3Qgc3RhdGVLZXkgPSB0aGlzLmdldFN0YXRlS2V5KHVzZXJOYW1lKVxuICAgIGNvbnN0IGN1cnJlbnRTdGF0ZSA9IGF3YWl0IHRoaXMuZ2V0U3RhdGUodXNlck5hbWUpXG5cbiAgICAvLyBEZXRlcm1pbmUgaWYgdGhpcyBpcyBhIHJldHJ5IG9mIHRoZSBzYW1lIHN0ZXAgb3IgcHJvZ3Jlc3Npb24gdG8gYSBuZXcgc3RlcFxuICAgIGxldCBhdHRlbXB0Q291bnQgPSAxXG4gICAgaWYgKGN1cnJlbnRTdGF0ZSAmJiBjdXJyZW50U3RhdGUuY3VycmVudFN0ZXAgPT09IHN0ZXApIHtcbiAgICAgIC8vIFNhbWUgc3RlcCAtIGluY3JlbWVudCBhdHRlbXB0IGNvdW50IChyZXRyeSlcbiAgICAgIGF0dGVtcHRDb3VudCA9IChjdXJyZW50U3RhdGUuYXR0ZW1wdENvdW50IHx8IDEpICsgMVxuXG4gICAgICAvLyBQcmV2ZW50IGluZmluaXRlIGxvb3BzIGJ5IGxpbWl0aW5nIHJldHJ5IGF0dGVtcHRzXG4gICAgICBpZiAoYXR0ZW1wdENvdW50ID4gNSkge1xuICAgICAgICBzdGF0ZUxvZ2dlci5sb2coXG4gICAgICAgICAgYFtBdXRvRmxvd1N0YXRlTWFuYWdlcl0gXHUyNkEwXHVGRTBGIFRvbyBtYW55IHJldHJ5IGF0dGVtcHRzICgke2F0dGVtcHRDb3VudH0pIGZvciBzdGVwICR7c3RlcH0sIGNsZWFyaW5nIHN0YXRlIGZvciB1c2VyICR7ZGF0YS51c2VyTmFtZX1gXG4gICAgICAgIClcbiAgICAgICAgYXdhaXQgdGhpcy5jbGVhclN0YXRlKGRhdGEudXNlck5hbWUpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY3VycmVudFN0YXRlKSB7XG4gICAgICAvLyBOZXcgc3RlcCAtIHJlc2V0IGF0dGVtcHQgY291bnQgdG8gMVxuICAgICAgc3RhdGVMb2dnZXIubG9nKFxuICAgICAgICBgW0F1dG9GbG93U3RhdGVNYW5hZ2VyXSBcdUQ4M0RcdUREMDQgUHJvZ3Jlc3NpbmcgZnJvbSAke2N1cnJlbnRTdGF0ZS5jdXJyZW50U3RlcH0gdG8gJHtzdGVwfSwgcmVzZXR0aW5nIGF0dGVtcHQgY291bnRgXG4gICAgICApXG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdGUgPSB7XG4gICAgICBzdGF0dXM6ICdpbl9wcm9ncmVzcycsXG4gICAgICBjdXJyZW50U3RlcDogc3RlcCxcbiAgICAgIGF0dGVtcHRDb3VudDogYXR0ZW1wdENvdW50LFxuICAgICAgbGFzdEF0dGVtcHRUaW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICB0YXJnZXRBY3Rpb246IGRhdGEudGFyZ2V0QWN0aW9uIHx8ICdjcmVhdGUnLFxuICAgICAgdXNlck5hbWU6IGRhdGEudXNlck5hbWUgfHwgbnVsbCxcbiAgICAgIGxhc3RQb3N0VG9EZWxldGU6IGRhdGEubGFzdFBvc3RUb0RlbGV0ZSB8fCBudWxsLFxuICAgICAgcG9zdERhdGE6IGRhdGEucG9zdERhdGEgfHwgbnVsbCxcbiAgICAgIGRlY2lzaW9uUmVwb3J0OiBkYXRhLmRlY2lzaW9uUmVwb3J0IHx8IG51bGwsXG4gICAgICB0YWJJZDogZGF0YS50YWJJZCB8fCBudWxsLFxuICAgICAgLi4uZGF0YVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBbc3RhdGVLZXldOiBzdGF0ZSB9KVxuICAgICAgc3RhdGVMb2dnZXIubG9nKFxuICAgICAgICBgW0F1dG9GbG93U3RhdGVNYW5hZ2VyXSBcdUQ4M0RcdURDQkUgU3RhdGUgc2F2ZWQ6ICR7c3RlcH0gZm9yIHVzZXIgJHtkYXRhLnVzZXJOYW1lfSAoYXR0ZW1wdCAke2F0dGVtcHRDb3VudH0pYCxcbiAgICAgICAgc3RhdGVcbiAgICAgIClcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgc3RhdGVMb2dnZXIuZXJyb3IoJ1tBdXRvRmxvd1N0YXRlTWFuYWdlcl0gRmFpbGVkIHRvIHNhdmUgc3RhdGU6JywgZXJyb3IpXG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGFzeW5jIGdldFN0YXRlKHVzZXJOYW1lKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghdXNlck5hbWUpIHJldHVybiBudWxsXG4gICAgICBjb25zdCBzdGF0ZUtleSA9IHRoaXMuZ2V0U3RhdGVLZXkodXNlck5hbWUpXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoW3N0YXRlS2V5XSlcbiAgICAgIHJldHVybiByZXN1bHRbc3RhdGVLZXldIHx8IG51bGxcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgc3RhdGVMb2dnZXIuZXJyb3IoJ1tBdXRvRmxvd1N0YXRlTWFuYWdlcl0gRmFpbGVkIHRvIGdldCBzdGF0ZTonLCBlcnJvcilcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGFzeW5jIGNsZWFyU3RhdGUodXNlck5hbWUpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCF1c2VyTmFtZSkgcmV0dXJuXG4gICAgICBjb25zdCBzdGF0ZUtleSA9IHRoaXMuZ2V0U3RhdGVLZXkodXNlck5hbWUpXG4gICAgICBhd2FpdCBjaHJvbWUuc3RvcmFnZS5sb2NhbC5yZW1vdmUoW3N0YXRlS2V5XSlcbiAgICAgIHN0YXRlTG9nZ2VyLmxvZyhgW0F1dG9GbG93U3RhdGVNYW5hZ2VyXSBcdUQ4M0RcdURERDFcdUZFMEYgU3RhdGUgY2xlYXJlZCBmb3IgdXNlciAke3VzZXJOYW1lfWApXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHN0YXRlTG9nZ2VyLmVycm9yKCdbQXV0b0Zsb3dTdGF0ZU1hbmFnZXJdIEZhaWxlZCB0byBjbGVhciBzdGF0ZTonLCBlcnJvcilcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgaXNTdGF0ZVN0YWxlKHN0YXRlKSB7XG4gICAgaWYgKCFzdGF0ZSB8fCAhc3RhdGUubGFzdEF0dGVtcHRUaW1lc3RhbXApIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIERhdGUubm93KCkgLSBzdGF0ZS5sYXN0QXR0ZW1wdFRpbWVzdGFtcCA+IHRoaXMuU1RBVEVfRVhQSVJZX01TXG4gIH1cblxuICBzdGF0aWMgYXN5bmMgcmVjb3ZlclN0YXRlKHVzZXJOYW1lKSB7XG4gICAgY29uc3Qgc3RhdGUgPSBhd2FpdCB0aGlzLmdldFN0YXRlKHVzZXJOYW1lKVxuICAgIGlmICghc3RhdGUpIHtcbiAgICAgIHN0YXRlTG9nZ2VyLmxvZyhgW0F1dG9GbG93U3RhdGVNYW5hZ2VyXSBObyBwcmV2aW91cyBzdGF0ZSBmb3VuZCBmb3IgdXNlciAke3VzZXJOYW1lfWApXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIGlmIChhd2FpdCB0aGlzLmlzU3RhdGVTdGFsZShzdGF0ZSkpIHtcbiAgICAgIHN0YXRlTG9nZ2VyLmxvZyhgW0F1dG9GbG93U3RhdGVNYW5hZ2VyXSBQcmV2aW91cyBzdGF0ZSBpcyBzdGFsZSBmb3IgdXNlciAke3VzZXJOYW1lfSwgY2xlYXJpbmcgaXRgKVxuICAgICAgYXdhaXQgdGhpcy5jbGVhclN0YXRlKHVzZXJOYW1lKVxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICBzdGF0ZUxvZ2dlci5sb2coYFtBdXRvRmxvd1N0YXRlTWFuYWdlcl0gXHVEODNEXHVERDA0IFJlY292ZXJpbmcgcHJldmlvdXMgc3RhdGUgZm9yIHVzZXIgJHt1c2VyTmFtZX06YCwgc3RhdGUpXG4gICAgcmV0dXJuIHN0YXRlXG4gIH1cblxuICBzdGF0aWMgYXN5bmMgdmFsaWRhdGVUYWIodGFiSWQpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdGFiID0gYXdhaXQgY2hyb21lLnRhYnMuZ2V0KHRhYklkKVxuICAgICAgcmV0dXJuIHRhYiAmJiAhdGFiLmRpc2NhcmRlZFxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBzdGF0ZUxvZ2dlci5sb2coYFtBdXRvRmxvd1N0YXRlTWFuYWdlcl0gVGFiICR7dGFiSWR9IGlzIG5vIGxvbmdlciB2YWxpZDpgLCBlcnJvci5tZXNzYWdlKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG59XG5cbiIsICJpbXBvcnQgeyBwb3N0U2VydmljZUxvZ2dlciB9IGZyb20gXCIuL2xvZ2dlci5qc1wiOy8qKlxuICogUG9zdCBTZXJ2aWNlIE1vZHVsZVxuICogSGFuZGxlcyBwb3N0IGdlbmVyYXRpb24sIEFQSSBpbnRlZ3JhdGlvbiwgYW5kIHBvc3QgY3JlYXRpb24gZGVjaXNpb24gbG9naWNcbiAqL1xuXG5pbXBvcnQgeyBBdXRvRmxvd1N0YXRlTWFuYWdlciB9IGZyb20gJy4vc3RhdGUtbWFuYWdlci5qcydcblxuLyoqXG4gKiBQb3N0IERhdGEgU2VydmljZSB3aXRoIHJlYWwgQVBJIGludGVncmF0aW9uXG4gKiBIYW5kbGVzIHBvc3QgZ2VuZXJhdGlvbiwgZGVjaXNpb24gYW5hbHlzaXMsIGFuZCByZXN1bHQgc3RvcmFnZVxuICovXG5leHBvcnQgY2xhc3MgUG9zdERhdGFTZXJ2aWNlIHtcbiAgc3RhdGljIGFzeW5jIGdlbmVyYXRlUG9zdChhZ2VudE5hbWUpIHtcbiAgICBjb25zdCBtYXhSZXRyaWVzID0gM1xuICAgIGNvbnN0IHJldHJ5RGVsYXkgPSAxMDAwIC8vIDEgc2Vjb25kIGJhc2UgZGVsYXlcblxuICAgIC8vIFJlbW92ZSB1LyBwcmVmaXggaWYgcHJlc2VudFxuICAgIGNvbnN0IGNsZWFuQWdlbnROYW1lID0gYWdlbnROYW1lLnJlcGxhY2UoL151XFwvLywgJycpXG5cbiAgICBmb3IgKGxldCBhdHRlbXB0ID0gMTsgYXR0ZW1wdCA8PSBtYXhSZXRyaWVzOyBhdHRlbXB0KyspIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmxvZyhcbiAgICAgICAgICBgW1Bvc3REYXRhU2VydmljZV0gR2VuZXJhdGluZyBwb3N0IGZvciBhZ2VudDogJHtjbGVhbkFnZW50TmFtZX0gKGF0dGVtcHQgJHthdHRlbXB0fS8ke21heFJldHJpZXN9KWBcbiAgICAgICAgKVxuXG4gICAgICAgIC8vIEdldCBBUEkgY29uZmlndXJhdGlvbiBmcm9tIHN0b3JhZ2VcbiAgICAgICAgY29uc3Qgc3RvcmFnZVJlc3VsdCA9IGF3YWl0IGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KFsnYXBpQ29uZmlnJ10pXG4gICAgICAgIGNvbnN0IGFwaUNvbmZpZyA9IHN0b3JhZ2VSZXN1bHQuYXBpQ29uZmlnIHx8IHtcbiAgICAgICAgICBlbmRwb2ludDpcbiAgICAgICAgICAgICdodHRwczovLzMyMDE2LTUxMTI3LmJhY2xvdWQuaW5mby9hcGkvbWV0aG9kL3JlZGRpdF9wb3N0bWFjaGluZS5yZWRkaXRfcG9zdG1hY2hpbmUuZG9jdHlwZS5zdWJyZWRkaXRfdGVtcGxhdGUuc3VicmVkZGl0X3RlbXBsYXRlLmdlbmVyYXRlX3Bvc3RfZm9yX2FnZW50JyxcbiAgICAgICAgIFx0IHRva2VuOiAnOGZiYmYwYTdjNjI2ZTE4OjJjMzY5M2ZiNTJhYzY2ZidcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlcXVlc3RCb2R5ID0ge1xuICAgICAgICAgIGFnZW50X25hbWU6IGNsZWFuQWdlbnROYW1lXG4gICAgICAgIH1cblxuICAgICAgICBwb3N0U2VydmljZUxvZ2dlci5sb2coJ1tQb3N0RGF0YVNlcnZpY2VdIEFQSSBSZXF1ZXN0IERldGFpbHM6Jywge1xuICAgICAgICAgIGVuZHBvaW50OiBhcGlDb25maWcuZW5kcG9pbnQsXG4gICAgICAgICAgYWdlbnROYW1lOiBjbGVhbkFnZW50TmFtZSxcbiAgICAgICAgICBib2R5OiByZXF1ZXN0Qm9keVxuICAgICAgICB9KVxuXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYXBpQ29uZmlnLmVuZHBvaW50LCB7XG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgIEF1dGhvcml6YXRpb246IGB0b2tlbiAke2FwaUNvbmZpZy50b2tlbn1gXG4gICAgICAgICAgfSxcbiAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShyZXF1ZXN0Qm9keSlcbiAgICAgICAgfSlcblxuICAgICAgICBsZXQgZGF0YVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmVycm9yKCdbUG9zdERhdGFTZXJ2aWNlXSBGYWlsZWQgdG8gcGFyc2UgcmVzcG9uc2UgYXMgSlNPTjonLCBlKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQVBJIHJlcXVlc3QgZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c30gJHtyZXNwb25zZS5zdGF0dXNUZXh0fSAtIEludmFsaWQgSlNPTiByZXNwb25zZWApXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgbGV0IGVycm9yRGV0YWlscyA9IGAke3Jlc3BvbnNlLnN0YXR1c30gJHtyZXNwb25zZS5zdGF0dXNUZXh0fWBcbiAgICAgICAgICBwb3N0U2VydmljZUxvZ2dlci5lcnJvcignW1Bvc3REYXRhU2VydmljZV0gQVBJIEVycm9yIFJlc3BvbnNlOicsIGRhdGEpXG4gICAgICAgICAgZXJyb3JEZXRhaWxzICs9IGAgLSAke0pTT04uc3RyaW5naWZ5KGRhdGEpfWBcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFQSSByZXF1ZXN0IGZhaWxlZDogJHtlcnJvckRldGFpbHN9YClcbiAgICAgICAgfVxuXG4gICAgICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmxvZygnW1Bvc3REYXRhU2VydmljZV0gR2VuZXJhdGVkIHBvc3QgZnJvbSBBUEk6JywgZGF0YSlcblxuICAgICAgICAvLyBIYW5kbGUgbmV3IEFQSSByZXNwb25zZSBmb3JtYXQgd2l0aCBwb3N0X25hbWVcbiAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5tZXNzYWdlICYmIGRhdGEubWVzc2FnZS5zdGF0dXMgPT09ICdzdWNjZXNzJyAmJiBkYXRhLm1lc3NhZ2UucG9zdF9uYW1lKSB7XG4gICAgICAgICAgcG9zdFNlcnZpY2VMb2dnZXIubG9nKCdbUG9zdERhdGFTZXJ2aWNlXSBSZWNlaXZlZCBwb3N0X25hbWUsIGZldGNoaW5nIGZ1bGwgcG9zdCBkYXRhOicsIGRhdGEubWVzc2FnZS5wb3N0X25hbWUpXG5cbiAgICAgICAgICAvLyBTZWNvbmQgQVBJIGNhbGwgdG8gZ2V0IGZ1bGwgcG9zdCBkYXRhIHVzaW5nIEZyYXBwZSBSRVNUIEFQSVxuICAgICAgICAgIGNvbnN0IHBvc3ROYW1lID0gZGF0YS5tZXNzYWdlLnBvc3RfbmFtZVxuICAgICAgICAgIGNvbnN0IGZyYXBwZUVuZHBvaW50ID0gYGh0dHBzOi8vMzIwMTYtNTExMjcuYmFjbG91ZC5pbmZvL2FwaS9yZXNvdXJjZS9SZWRkaXQlMjBQb3N0LyR7cG9zdE5hbWV9YFxuXG4gICAgICAgICAgY29uc3QgZnJhcHBlUmVzcG9uc2UgPSBhd2FpdCBmZXRjaChmcmFwcGVFbmRwb2ludCwge1xuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYHRva2VuICR7YXBpQ29uZmlnLnRva2VufWBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaWYgKCFmcmFwcGVSZXNwb25zZS5vaykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGcmFwcGUgQVBJIHJlcXVlc3QgZmFpbGVkOiAke2ZyYXBwZVJlc3BvbnNlLnN0YXR1c30gJHtmcmFwcGVSZXNwb25zZS5zdGF0dXNUZXh0fWApXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgZnJhcHBlRGF0YSA9IGF3YWl0IGZyYXBwZVJlc3BvbnNlLmpzb24oKVxuICAgICAgICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmxvZygnW1Bvc3REYXRhU2VydmljZV0gRmV0Y2hlZCBmdWxsIHBvc3QgZGF0YSBmcm9tIEZyYXBwZTonLCBmcmFwcGVEYXRhKVxuXG4gICAgICAgICAgLy8gRXh0cmFjdCBwb3N0IGRhdGEgZnJvbSBGcmFwcGUgcmVzcG9uc2VcbiAgICAgICAgICBpZiAoZnJhcHBlRGF0YSAmJiBmcmFwcGVEYXRhLmRhdGEpIHtcbiAgICAgICAgICAgIGNvbnN0IHBvc3REYXRhID0gZnJhcHBlRGF0YS5kYXRhXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICB0aXRsZTogcG9zdERhdGEudGl0bGUgfHwgJ0dlbmVyYXRlZCBQb3N0JyxcbiAgICAgICAgICAgICAgYm9keTogcG9zdERhdGEuYm9keV90ZXh0IHx8IHBvc3REYXRhLmNvbnRlbnQgfHwgcG9zdERhdGEuYm9keSB8fCAnJyxcbiAgICAgICAgICAgICAgdXJsOiBwb3N0RGF0YS51cmxfdG9fc2hhcmUgfHwgcG9zdERhdGEudXJsIHx8ICcnLFxuICAgICAgICAgICAgICBzdWJyZWRkaXQ6IHBvc3REYXRhLnN1YnJlZGRpdF9uYW1lIHx8IHBvc3REYXRhLnN1YnJlZGRpdCB8fCAnc3BoeW54JyxcbiAgICAgICAgICAgICAgcG9zdF90eXBlOiBwb3N0RGF0YS5wb3N0X3R5cGUgfHwgJ2xpbmsnLFxuICAgICAgICAgICAgICBwb3N0X25hbWU6IHBvc3REYXRhLm5hbWUsXG4gICAgICAgICAgICAgIGFjY291bnQ6IHBvc3REYXRhLmFjY291bnQsXG4gICAgICAgICAgICAgIHRlbXBsYXRlX3VzZWQ6IHBvc3REYXRhLnRlbXBsYXRlX3VzZWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGYWxsYmFjayB0byBsZWdhY3kgcmVzcG9uc2UgZm9ybWF0IGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG4gICAgICAgIGlmIChcbiAgICAgICAgICBkYXRhICYmXG4gICAgICAgICAgZGF0YS5tZXNzYWdlICYmXG4gICAgICAgICAgZGF0YS5tZXNzYWdlLmRvY3MgJiZcbiAgICAgICAgICBBcnJheS5pc0FycmF5KGRhdGEubWVzc2FnZS5kb2NzKSAmJlxuICAgICAgICAgIGRhdGEubWVzc2FnZS5kb2NzLmxlbmd0aCA+IDBcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgYXBpUG9zdCA9IGRhdGEubWVzc2FnZS5kb2NzWzBdXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlOiBhcGlQb3N0LnRpdGxlIHx8ICdHZW5lcmF0ZWQgUG9zdCcsXG4gICAgICAgICAgICBib2R5OiBhcGlQb3N0LmNvbnRlbnQgfHwgYXBpUG9zdC5ib2R5IHx8ICcnLFxuICAgICAgICAgICAgdXJsOiBhcGlQb3N0LnVybCB8fCAnJyxcbiAgICAgICAgICAgIHN1YnJlZGRpdDogYXBpUG9zdC5zdWJyZWRkaXQgfHwgJ3NwaHlueCcsXG4gICAgICAgICAgICBwb3N0X3R5cGU6IGFwaVBvc3QucG9zdF90eXBlIHx8ICdsaW5rJ1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBBUEkgcmVzcG9uc2Ugc3RydWN0dXJlIG9yIG5vIHBvc3QgZGF0YSByZXR1cm5lZCcpXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBwb3N0U2VydmljZUxvZ2dlci5lcnJvcihgW1Bvc3REYXRhU2VydmljZV0gQVBJIGNhbGwgZmFpbGVkIChhdHRlbXB0ICR7YXR0ZW1wdH0vJHttYXhSZXRyaWVzfSk6YCwgZXJyb3IpXG5cbiAgICAgICAgaWYgKGF0dGVtcHQgPT09IG1heFJldHJpZXMpIHtcbiAgICAgICAgICAvLyBGaW5hbCBhdHRlbXB0IGZhaWxlZCwgdGhyb3cgZXJyb3IgaW5zdGVhZCBvZiB1c2luZyBmYWxsYmFja1xuICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBGYWlsZWQgdG8gZ2VuZXJhdGUgcG9zdCBhZnRlciAke21heFJldHJpZXN9IGF0dGVtcHRzOiAke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmVycm9yKCdbUG9zdERhdGFTZXJ2aWNlXSAnICsgZXJyb3JNZXNzYWdlKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBXYWl0IGJlZm9yZSByZXRyeSB3aXRoIGV4cG9uZW50aWFsIGJhY2tvZmZcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgcmV0cnlEZWxheSAqIE1hdGgucG93KDIsIGF0dGVtcHQgLSAxKSkpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG5vcm1hbGl6ZUxhdGVzdFBvc3RzRGF0YShsYXRlc3RQb3N0c0RhdGEsIHVzZXJOYW1lKSB7XG4gICAgaWYgKCFsYXRlc3RQb3N0c0RhdGEpIHJldHVybiBudWxsXG4gICAgY29uc3QgcG9zdHMgPSBsYXRlc3RQb3N0c0RhdGE/LnBvc3RzSW5mbz8ucG9zdHMgfHwgbGF0ZXN0UG9zdHNEYXRhPy5wb3N0c1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwb3N0cykpIHJldHVybiBudWxsXG5cbiAgICBjb25zdCB0cyA9IGxhdGVzdFBvc3RzRGF0YT8ubGFzdFVwZGF0ZWQgfHwgbGF0ZXN0UG9zdHNEYXRhPy50aW1lc3RhbXAgfHwgbGF0ZXN0UG9zdHNEYXRhPy5sYXN0VXBkYXRlIHx8IG51bGxcblxuICAgIHJldHVybiB7XG4gICAgICB1c2VyTmFtZSxcbiAgICAgIHBvc3RzSW5mbzogeyBwb3N0cyB9LFxuICAgICAgbGFzdFVwZGF0ZWQ6IHRzXG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGFzeW5jIHNob3VsZENyZWF0ZVBvc3QocG9zdHNEYXRhKSB7XG4gICAgLy8gU2F2ZSBzdGF0ZSBiZWZvcmUgZGVjaXNpb24gYW5hbHlzaXNcbiAgICBhd2FpdCBBdXRvRmxvd1N0YXRlTWFuYWdlci5zYXZlU3RhdGUoJ2FuYWx5emluZ19wb3N0cycsIHsgcG9zdHNEYXRhLCB1c2VyTmFtZTogcG9zdHNEYXRhPy51c2VyTmFtZSB9KVxuXG4gICAgLy8gQ2hlY2sgaWYgdGhlcmUncyBhIHJlY2VudGx5IGRlbGV0ZWQgcG9zdCB0byBmaWx0ZXIgb3V0XG4gICAgY29uc3QgdXNlck5hbWUgPSBwb3N0c0RhdGE/LnVzZXJOYW1lXG4gICAgbGV0IGRlbGV0ZWRQb3N0SWQgPSBudWxsXG4gICAgaWYgKHVzZXJOYW1lKSB7XG4gICAgICBjb25zdCBkZWxldGVkUG9zdEtleSA9IGBkZWxldGVkUG9zdF8ke3VzZXJOYW1lfWBcbiAgICAgIGNvbnN0IGRlbGV0ZWRQb3N0RGF0YSA9IGF3YWl0IGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbZGVsZXRlZFBvc3RLZXldKVxuICAgICAgaWYgKGRlbGV0ZWRQb3N0RGF0YVtkZWxldGVkUG9zdEtleV0pIHtcbiAgICAgICAgY29uc3QgZGVsZXRlZEluZm8gPSBkZWxldGVkUG9zdERhdGFbZGVsZXRlZFBvc3RLZXldXG4gICAgICAgIC8vIE9ubHkgY29uc2lkZXIgaXQgaWYgZGVsZXRlZCB3aXRoaW4gbGFzdCAxMCBtaW51dGVzXG4gICAgICAgIGlmIChEYXRlLm5vdygpIC0gZGVsZXRlZEluZm8udGltZXN0YW1wIDwgMTAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICBkZWxldGVkUG9zdElkID0gZGVsZXRlZEluZm8ucG9zdElkXG4gICAgICAgICAgcG9zdFNlcnZpY2VMb2dnZXIubG9nKGBbUG9zdERhdGFTZXJ2aWNlXSBcdUQ4M0RcdURERDFcdUZFMEYgRmlsdGVyaW5nIG91dCByZWNlbnRseSBkZWxldGVkIHBvc3Q6ICR7ZGVsZXRlZFBvc3RJZH1gKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENsZWFuIHVwIG9sZCBkZWxldGVkIHBvc3QgcmVjb3JkXG4gICAgICAgICAgYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwucmVtb3ZlKFtkZWxldGVkUG9zdEtleV0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgZGVjaXNpb24gcmVwb3J0IGZvciBsb2dnaW5nIGFuZCBzdG9yYWdlXG4gICAgY29uc3QgZGVjaXNpb25SZXBvcnQgPSB7XG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHRvdGFsUG9zdHM6IHBvc3RzRGF0YT8ucG9zdHNJbmZvPy5wb3N0cz8ubGVuZ3RoIHx8IDAsXG4gICAgICBsYXN0UG9zdEFnZTogbnVsbCxcbiAgICAgIGxhc3RQb3N0U3RhdHVzOiAndW5rbm93bicsXG4gICAgICBkZWNpc2lvbjogJ25vX2NyZWF0ZScsXG4gICAgICByZWFzb246ICdub19wb3N0cycsXG4gICAgICBsYXN0UG9zdDogcG9zdHNEYXRhPy5sYXN0UG9zdCB8fCBudWxsXG4gICAgfVxuXG4gICAgcG9zdFNlcnZpY2VMb2dnZXIubG9nKCc9PT0gQVVUTy1GTE9XIERFQ0lTSU9OIEFOQUxZU0lTID09PScpXG4gICAgcG9zdFNlcnZpY2VMb2dnZXIubG9nKGBbUG9zdERhdGFTZXJ2aWNlXSBBbmFseXppbmcgJHtkZWNpc2lvblJlcG9ydC50b3RhbFBvc3RzfSBwb3N0cyBmb3IgYXV0by1mbG93IGRlY2lzaW9uYClcblxuICAgIC8vIEZpbHRlciBvdXQgdGhlIGRlbGV0ZWQgcG9zdCBpZiBwcmVzZW50XG4gICAgbGV0IHBvc3RzVG9BbmFseXplID0gcG9zdHNEYXRhPy5wb3N0c0luZm8/LnBvc3RzIHx8IFtdXG4gICAgaWYgKGRlbGV0ZWRQb3N0SWQgJiYgcG9zdHNUb0FuYWx5emUubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgb3JpZ2luYWxMZW5ndGggPSBwb3N0c1RvQW5hbHl6ZS5sZW5ndGhcbiAgICAgIHBvc3RzVG9BbmFseXplID0gcG9zdHNUb0FuYWx5emUuZmlsdGVyKHBvc3QgPT4gcG9zdC5pZCAhPT0gZGVsZXRlZFBvc3RJZClcbiAgICAgIGlmIChwb3N0c1RvQW5hbHl6ZS5sZW5ndGggIT09IG9yaWdpbmFsTGVuZ3RoKSB7XG4gICAgICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmxvZyhgW1Bvc3REYXRhU2VydmljZV0gXHVEODNEXHVEREQxXHVGRTBGIEZpbHRlcmVkIG91dCBkZWxldGVkIHBvc3QuIFBvc3RzIGJlZm9yZTogJHtvcmlnaW5hbExlbmd0aH0sIGFmdGVyOiAke3Bvc3RzVG9BbmFseXplLmxlbmd0aH1gKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFuYWx5emUgcG9zdHMgdG8gZGV0ZXJtaW5lIGlmIG5ldyBwb3N0IGlzIG5lZWRlZFxuICAgIGlmICghcG9zdHNEYXRhIHx8ICFwb3N0c0RhdGEucG9zdHNJbmZvIHx8IHBvc3RzVG9BbmFseXplLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcG9zdFNlcnZpY2VMb2dnZXIubG9nKCdbUG9zdERhdGFTZXJ2aWNlXSBcdTI3NEMgREVDSVNJT046IE5vIHBvc3RzIGZvdW5kIChhZnRlciBmaWx0ZXJpbmcgZGVsZXRlZCBwb3N0KSwgc2hvdWxkIGNyZWF0ZSBuZXcgcG9zdCcpXG4gICAgICBkZWNpc2lvblJlcG9ydC5kZWNpc2lvbiA9ICdjcmVhdGUnXG4gICAgICBkZWNpc2lvblJlcG9ydC5yZWFzb24gPSAnbm9fcG9zdHMnXG4gICAgICB0aGlzLnNhdmVEZWNpc2lvblJlcG9ydChkZWNpc2lvblJlcG9ydClcbiAgICAgIHJldHVybiB7IHNob3VsZENyZWF0ZTogdHJ1ZSwgcmVhc29uOiAnbm9fcG9zdHMnLCBkZWNpc2lvblJlcG9ydCB9XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdFBvc3QgPSBwb3N0c1RvQW5hbHl6ZVswXSAvLyBNb3N0IHJlY2VudCBwb3N0IGFmdGVyIGZpbHRlcmluZ1xuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKClcbiAgICBjb25zdCBvbmVXZWVrQWdvID0gbmV3IERhdGUobm93LmdldFRpbWUoKSAtIDcgKiAyNCAqIDYwICogNjAgKiAxMDAwKVxuXG4gICAgLy8gQ2FsY3VsYXRlIHBvc3QgYWdlIGZvciByZXBvcnRpbmdcbiAgICBjb25zdCBwb3N0RGF0ZSA9IG5ldyBEYXRlKGxhc3RQb3N0LnRpbWVzdGFtcClcbiAgICBjb25zdCBhZ2VJbkhvdXJzID0gKG5vdyAtIHBvc3REYXRlKSAvICgxMDAwICogNjAgKiA2MClcbiAgICBkZWNpc2lvblJlcG9ydC5sYXN0UG9zdEFnZSA9IE1hdGgucm91bmQoYWdlSW5Ib3VycyAqIDEwKSAvIDEwIC8vIFJvdW5kIHRvIDEgZGVjaW1hbFxuXG4gICAgcG9zdFNlcnZpY2VMb2dnZXIubG9nKGBbUG9zdERhdGFTZXJ2aWNlXSBcdUQ4M0RcdURDQ0EgRW5oYW5jZWQgbGFzdCBwb3N0IGRldGFpbHM6YClcbiAgICBwb3N0U2VydmljZUxvZ2dlci5sb2coYCAgIC0gVGl0bGU6IFwiJHtsYXN0UG9zdC50aXRsZSB8fCAnTm8gdGl0bGUnfVwiYClcbiAgICBwb3N0U2VydmljZUxvZ2dlci5sb2coYCAgIC0gQWdlOiAke2RlY2lzaW9uUmVwb3J0Lmxhc3RQb3N0QWdlfSBob3VycyBhZ29gKVxuICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmxvZyhgICAgLSBVUkw6ICR7bGFzdFBvc3QudXJsIHx8ICdObyBVUkwnfWApXG4gICAgcG9zdFNlcnZpY2VMb2dnZXIubG9nKGAgICAtIEF1dGhvcjogJHtsYXN0UG9zdC5hdXRob3IgfHwgJ1Vua25vd24nfWApXG4gICAgcG9zdFNlcnZpY2VMb2dnZXIubG9nKGAgICAtIFN1YnJlZGRpdDogJHtsYXN0UG9zdC5zdWJyZWRkaXQgfHwgJ1Vua25vd24nfWApXG4gICAgcG9zdFNlcnZpY2VMb2dnZXIubG9nKFxuICAgICAgYCAgIC0gU2NvcmU6ICR7bGFzdFBvc3Quc2NvcmUgfHwgMH0gfCBDb21tZW50czogJHtsYXN0UG9zdC5jb21tZW50Q291bnQgfHwgMH0gfCBBd2FyZHM6ICR7bGFzdFBvc3QuYXdhcmRDb3VudCB8fCAwfWBcbiAgICApXG4gICAgcG9zdFNlcnZpY2VMb2dnZXIubG9nKFxuICAgICAgYCAgIC0gUG9zdCBUeXBlOiAke2xhc3RQb3N0LnBvc3RUeXBlIHx8ICdVbmtub3duJ30gfCBEb21haW46ICR7bGFzdFBvc3QuZG9tYWluIHx8ICdOL0EnfWBcbiAgICApXG4gICAgcG9zdFNlcnZpY2VMb2dnZXIubG9nKFxuICAgICAgYCAgIC0gU3RhdHVzOiBSZW1vdmVkPSR7bGFzdFBvc3QubW9kZXJhdGlvblN0YXR1cy5pc1JlbW92ZWR9LCBCbG9ja2VkPSR7bGFzdFBvc3QubW9kZXJhdGlvblN0YXR1cy5pc0Jsb2NrZWR9LCBEZWxldGVkPSR7bGFzdFBvc3QuZGVsZXRlZH1gXG4gICAgKVxuICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmxvZyhcbiAgICAgIGAgICAtIEl0ZW0gU3RhdGU6ICR7bGFzdFBvc3QuaXRlbVN0YXRlIHx8ICdVbmtub3duJ30gfCBWaWV3IENvbnRleHQ6ICR7bGFzdFBvc3Qudmlld0NvbnRleHQgfHwgJ1Vua25vd24nfWBcbiAgICApXG5cbiAgICAvLyBFbmhhbmNlZCBkZWNpc2lvbiBsb2dpYyB1c2luZyBuZXcgbWV0YWRhdGFcblxuICAgIC8vIFByaW9yaXR5IDE6IENoZWNrIGlmIGxhc3QgcG9zdCBpcyByZW1vdmVkIG9yIGJsb2NrZWQgYnkgbW9kZXJhdG9yc1xuICAgIC8vIElmIHJlbW92ZWQgYnkgbW9kZXJhdG9ycywgd2Ugc2hvdWxkIGRlbGV0ZSBpdCBmaXJzdCBiZWZvcmUgY3JlYXRpbmcgYSBuZXcgcG9zdFxuICAgIGlmIChsYXN0UG9zdC5tb2RlcmF0aW9uU3RhdHVzLmlzUmVtb3ZlZCB8fCBsYXN0UG9zdC5tb2RlcmF0aW9uU3RhdHVzLmlzQmxvY2tlZCB8fCBsYXN0UG9zdC5oYXNNb2RlcmF0b3JBY3Rpb24pIHtcbiAgICAgIGlmIChsYXN0UG9zdC5tb2RlcmF0aW9uU3RhdHVzLmlzUmVtb3ZlZCkge1xuICAgICAgICAvLyBQb3N0IGlzIHJlbW92ZWQgYnkgbW9kZXJhdG9ycywgZGVsZXRlIGl0IGZpcnN0IGJlZm9yZSBjcmVhdGluZyBuZXcgcG9zdFxuICAgICAgICBwb3N0U2VydmljZUxvZ2dlci5sb2coJ1tQb3N0RGF0YVNlcnZpY2VdIFx1RDgzRFx1REREMVx1RkUwRiBERUNJU0lPTjogTGFzdCBwb3N0IHdhcyByZW1vdmVkIGJ5IG1vZGVyYXRvcnMsIHNob3VsZCBkZWxldGUgaXQgZmlyc3QgdGhlbiBjcmVhdGUgbmV3IHBvc3QnKVxuICAgICAgICBkZWNpc2lvblJlcG9ydC5kZWNpc2lvbiA9ICdjcmVhdGVfd2l0aF9kZWxldGUnXG4gICAgICAgIGRlY2lzaW9uUmVwb3J0LnJlYXNvbiA9ICdwb3N0X3JlbW92ZWRfYnlfbW9kZXJhdG9yJ1xuICAgICAgICBkZWNpc2lvblJlcG9ydC5sYXN0UG9zdFN0YXR1cyA9ICdyZW1vdmVkJ1xuICAgICAgICB0aGlzLnNhdmVEZWNpc2lvblJlcG9ydChkZWNpc2lvblJlcG9ydClcbiAgICAgICAgcmV0dXJuIHsgc2hvdWxkQ3JlYXRlOiB0cnVlLCByZWFzb246ICdwb3N0X3JlbW92ZWRfYnlfbW9kZXJhdG9yJywgbGFzdFBvc3Q6IGxhc3RQb3N0LCBkZWNpc2lvblJlcG9ydCB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBQb3N0IGlzIGJsb2NrZWQgb3IgaGFzIG90aGVyIG1vZGVyYXRvciBhY3Rpb24sIHRyeSB0byBkZWxldGUgaXRcbiAgICAgICAgcG9zdFNlcnZpY2VMb2dnZXIubG9nKCdbUG9zdERhdGFTZXJ2aWNlXSBcdUQ4M0RcdURERDFcdUZFMEYgREVDSVNJT046IExhc3QgcG9zdCB3YXMgYmxvY2tlZC9tb2RlcmF0ZWQsIHNob3VsZCBkZWxldGUgaXQgZmlyc3QgdGhlbiBjcmVhdGUgbmV3IHBvc3QnKVxuICAgICAgICBkZWNpc2lvblJlcG9ydC5kZWNpc2lvbiA9ICdjcmVhdGVfd2l0aF9kZWxldGUnXG4gICAgICAgIGRlY2lzaW9uUmVwb3J0LnJlYXNvbiA9ICdwb3N0X2Jsb2NrZWQnXG4gICAgICAgIGRlY2lzaW9uUmVwb3J0Lmxhc3RQb3N0U3RhdHVzID0gbGFzdFBvc3QuaXNCbG9ja2VkID8gJ2Jsb2NrZWQnIDogJ21vZGVyYXRlZCdcbiAgICAgICAgdGhpcy5zYXZlRGVjaXNpb25SZXBvcnQoZGVjaXNpb25SZXBvcnQpXG4gICAgICAgIHJldHVybiB7IHNob3VsZENyZWF0ZTogdHJ1ZSwgcmVhc29uOiAncG9zdF9ibG9ja2VkJywgbGFzdFBvc3Q6IGxhc3RQb3N0LCBkZWNpc2lvblJlcG9ydCB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUHJpb3JpdHkgMjogQ2hlY2sgaWYgcG9zdCBpcyBpbiBVTk1PREVSQVRFRCBzdGF0ZSAtIHdhaXQgZm9yIG1vZGVyYXRpb24gKG9ubHkgaWYgbm90IHJlbW92ZWQvYmxvY2tlZClcbiAgICBpZiAobGFzdFBvc3QuaXRlbVN0YXRlID09PSAnVU5NT0RFUkFURUQnKSB7XG4gICAgICBpZiAoYWdlSW5Ib3VycyA8PSAxKSB7XG4gICAgICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmxvZygnW1Bvc3REYXRhU2VydmljZV0gXHUyM0YzIERFQ0lTSU9OOiBMYXN0IHBvc3QgaXMgdW5kZXIgbW9kZXJhdGlvbiByZXZpZXcsIHNob3VsZCB3YWl0JylcbiAgICAgICAgZGVjaXNpb25SZXBvcnQuZGVjaXNpb24gPSAnd2FpdCdcbiAgICAgICAgZGVjaXNpb25SZXBvcnQucmVhc29uID0gJ3VuZGVyX21vZGVyYXRpb24nXG4gICAgICAgIGRlY2lzaW9uUmVwb3J0Lmxhc3RQb3N0U3RhdHVzID0gJ3VubW9kZXJhdGVkJ1xuICAgICAgICB0aGlzLnNhdmVEZWNpc2lvblJlcG9ydChkZWNpc2lvblJlcG9ydClcbiAgICAgICAgcmV0dXJuIHsgc2hvdWxkQ3JlYXRlOiBmYWxzZSwgcmVhc29uOiAndW5kZXJfbW9kZXJhdGlvbicsIGxhc3RQb3N0OiBsYXN0UG9zdCwgZGVjaXNpb25SZXBvcnQgfVxuICAgICAgfVxuXG4gICAgICBwb3N0U2VydmljZUxvZ2dlci5sb2coXG4gICAgICAgICdbUG9zdERhdGFTZXJ2aWNlXSBcdTIzRjAgREVDSVNJT046IExhc3QgcG9zdCBpcyBzdGlsbCB1bm1vZGVyYXRlZCBidXQgb2xkZXIgdGhhbiAxIGhvdXIsIHNob3VsZCBjcmVhdGUgbmV3IHBvc3QnXG4gICAgICApXG4gICAgICBkZWNpc2lvblJlcG9ydC5kZWNpc2lvbiA9ICdjcmVhdGUnXG4gICAgICBkZWNpc2lvblJlcG9ydC5yZWFzb24gPSAnc3RhbGVfdW5tb2RlcmF0ZWQnXG4gICAgICBkZWNpc2lvblJlcG9ydC5sYXN0UG9zdFN0YXR1cyA9ICd1bm1vZGVyYXRlZCdcbiAgICAgIHRoaXMuc2F2ZURlY2lzaW9uUmVwb3J0KGRlY2lzaW9uUmVwb3J0KVxuICAgICAgcmV0dXJuIHsgc2hvdWxkQ3JlYXRlOiB0cnVlLCByZWFzb246ICdzdGFsZV91bm1vZGVyYXRlZCcsIGxhc3RQb3N0OiBsYXN0UG9zdCwgZGVjaXNpb25SZXBvcnQgfVxuICAgIH1cblxuICAgIC8vIFByaW9yaXR5IDM6IENoZWNrIGlmIGxhc3QgcG9zdCBoYXMgbmVnYXRpdmUgc2NvcmUgKGRvd252b3RlcylcbiAgICBpZiAobGFzdFBvc3Quc2NvcmUgPCAwKSB7XG4gICAgICBwb3N0U2VydmljZUxvZ2dlci5sb2coJ1tQb3N0RGF0YVNlcnZpY2VdIFx1RDgzRFx1REM0RSBERUNJU0lPTjogTGFzdCBwb3N0IGhhcyBuZWdhdGl2ZSBzY29yZSwgc2hvdWxkIGNyZWF0ZSBuZXcgcG9zdCBhbmQgZGVsZXRlIGRvd252b3RlZCBwb3N0JylcbiAgICAgIGRlY2lzaW9uUmVwb3J0LmRlY2lzaW9uID0gJ2NyZWF0ZV93aXRoX2RlbGV0ZSdcbiAgICAgIGRlY2lzaW9uUmVwb3J0LnJlYXNvbiA9ICdwb3N0X2Rvd252b3RlZCdcbiAgICAgIGRlY2lzaW9uUmVwb3J0Lmxhc3RQb3N0U3RhdHVzID0gbGFzdFBvc3QuaXNSZW1vdmVkID8gJ3JlbW92ZWQnIDogbGFzdFBvc3QuaXNCbG9ja2VkID8gJ2Jsb2NrZWQnIDogJ2Rvd252b3RlZCdcbiAgICAgIHRoaXMuc2F2ZURlY2lzaW9uUmVwb3J0KGRlY2lzaW9uUmVwb3J0KVxuICAgICAgcmV0dXJuIHsgc2hvdWxkQ3JlYXRlOiB0cnVlLCByZWFzb246ICdwb3N0X2Rvd252b3RlZCcsIGxhc3RQb3N0OiBsYXN0UG9zdCwgZGVjaXNpb25SZXBvcnQgfVxuICAgIH1cblxuICAgIGlmIChhZ2VJbkhvdXJzIDwgMjQpIHtcbiAgICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmxvZygnW1Bvc3REYXRhU2VydmljZV0gXHUyNzA1IERFQ0lTSU9OOiBMYXN0IHBvc3QgaXMgcmVjZW50ICg8IDI0aCksIHNraXBwaW5nIGVuZ2FnZW1lbnQtYmFzZWQgY3JlYXRpb24nKVxuICAgICAgZGVjaXNpb25SZXBvcnQuZGVjaXNpb24gPSAnbm9fY3JlYXRlJ1xuICAgICAgZGVjaXNpb25SZXBvcnQucmVhc29uID0gJ3JlY2VudF9wb3N0J1xuICAgICAgZGVjaXNpb25SZXBvcnQubGFzdFBvc3RTdGF0dXMgPSAnYWN0aXZlJ1xuICAgICAgdGhpcy5zYXZlRGVjaXNpb25SZXBvcnQoZGVjaXNpb25SZXBvcnQpXG4gICAgICByZXR1cm4geyBzaG91bGRDcmVhdGU6IGZhbHNlLCByZWFzb246ICdyZWNlbnRfcG9zdCcsIGRlY2lzaW9uUmVwb3J0IH1cbiAgICB9XG5cbiAgICAvLyBQcmlvcml0eSA1OiBDaGVjayBpZiBsYXN0IHBvc3QgaGFzIHZlcnkgbG93IGVuZ2FnZW1lbnQgKHNjb3JlICsgY29tbWVudHMpXG4gICAgY29uc3QgdG90YWxFbmdhZ2VtZW50ID0gKGxhc3RQb3N0LnNjb3JlIHx8IDApICsgKGxhc3RQb3N0LmNvbW1lbnRDb3VudCB8fCAwKVxuICAgIGlmICh0b3RhbEVuZ2FnZW1lbnQgPCAyKSB7XG4gICAgICBwb3N0U2VydmljZUxvZ2dlci5sb2coXG4gICAgICAgICdbUG9zdERhdGFTZXJ2aWNlXSBcdUQ4M0RcdURDQzkgREVDSVNJT046IExhc3QgcG9zdCBoYXMgdmVyeSBsb3cgZW5nYWdlbWVudCAoPCAyKSwgc2hvdWxkIGNyZWF0ZSBuZXcgcG9zdCBhbmQgZGVsZXRlIGxvdy1wZXJmb3JtaW5nIHBvc3QnXG4gICAgICApXG4gICAgICBkZWNpc2lvblJlcG9ydC5kZWNpc2lvbiA9ICdjcmVhdGVfd2l0aF9kZWxldGUnXG4gICAgICBkZWNpc2lvblJlcG9ydC5yZWFzb24gPSAnbG93X2VuZ2FnZW1lbnQnXG4gICAgICBkZWNpc2lvblJlcG9ydC5sYXN0UG9zdFN0YXR1cyA9ICdsb3dfZW5nYWdlbWVudCdcbiAgICAgIHRoaXMuc2F2ZURlY2lzaW9uUmVwb3J0KGRlY2lzaW9uUmVwb3J0KVxuICAgICAgcmV0dXJuIHsgc2hvdWxkQ3JlYXRlOiB0cnVlLCByZWFzb246ICdsb3dfZW5nYWdlbWVudCcsIGxhc3RQb3N0OiBsYXN0UG9zdCwgZGVjaXNpb25SZXBvcnQgfVxuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIGxhc3QgcG9zdCBpcyBvbGRlciB0aGFuIG9uZSB3ZWVrIC0gaWYgc28sIERPIE5PVCBkZWxldGUgaXQsIGp1c3QgY3JlYXRlIG5ldyBwb3N0XG4gICAgaWYgKHBvc3REYXRlIDwgb25lV2Vla0Fnbykge1xuICAgICAgcG9zdFNlcnZpY2VMb2dnZXIubG9nKCdbUG9zdERhdGFTZXJ2aWNlXSBcdTIzRjAgREVDSVNJT046IExhc3QgcG9zdCBpcyBvbGRlciB0aGFuIG9uZSB3ZWVrLCBzaG91bGQgY3JlYXRlIG5ldyBwb3N0IHdpdGhvdXQgZGVsZXRpb24nKVxuICAgICAgZGVjaXNpb25SZXBvcnQuZGVjaXNpb24gPSAnY3JlYXRlJ1xuICAgICAgZGVjaXNpb25SZXBvcnQucmVhc29uID0gJ29sZF9wb3N0J1xuICAgICAgZGVjaXNpb25SZXBvcnQubGFzdFBvc3RTdGF0dXMgPSBsYXN0UG9zdC5pc1JlbW92ZWQgPyAncmVtb3ZlZCcgOiBsYXN0UG9zdC5pc0Jsb2NrZWQgPyAnYmxvY2tlZCcgOiAnYWN0aXZlJ1xuICAgICAgdGhpcy5zYXZlRGVjaXNpb25SZXBvcnQoZGVjaXNpb25SZXBvcnQpXG4gICAgICByZXR1cm4geyBzaG91bGRDcmVhdGU6IHRydWUsIHJlYXNvbjogJ29sZF9wb3N0JywgbGFzdFBvc3Q6IGxhc3RQb3N0LCBkZWNpc2lvblJlcG9ydCB9XG4gICAgfVxuXG4gICAgcG9zdFNlcnZpY2VMb2dnZXIubG9nKCdbUG9zdERhdGFTZXJ2aWNlXSBcdTI3MDUgREVDSVNJT046IExhc3QgcG9zdCBpcyByZWNlbnQgYW5kIGFjdGl2ZSwgbm8gbmV3IHBvc3QgbmVlZGVkJylcbiAgICBkZWNpc2lvblJlcG9ydC5kZWNpc2lvbiA9ICdub19jcmVhdGUnXG4gICAgZGVjaXNpb25SZXBvcnQucmVhc29uID0gJ3JlY2VudF9wb3N0J1xuICAgIGRlY2lzaW9uUmVwb3J0Lmxhc3RQb3N0U3RhdHVzID0gJ2FjdGl2ZSdcbiAgICB0aGlzLnNhdmVEZWNpc2lvblJlcG9ydChkZWNpc2lvblJlcG9ydClcbiAgICByZXR1cm4geyBzaG91bGRDcmVhdGU6IGZhbHNlLCByZWFzb246ICdyZWNlbnRfcG9zdCcsIGRlY2lzaW9uUmVwb3J0IH1cbiAgfVxuXG4gIC8vIFNhdmUgZGVjaXNpb24gcmVwb3J0IHRvIHN0b3JhZ2UgZm9yIHBvcHVwIHZpc2liaWxpdHlcbiAgc3RhdGljIGFzeW5jIHNhdmVEZWNpc2lvblJlcG9ydChkZWNpc2lvblJlcG9ydCkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoe1xuICAgICAgICBsYXN0RGVjaXNpb25SZXBvcnQ6IGRlY2lzaW9uUmVwb3J0LFxuICAgICAgICBsYXN0RGVjaXNpb25UaW1lc3RhbXA6IGRlY2lzaW9uUmVwb3J0LnRpbWVzdGFtcFxuICAgICAgfSlcbiAgICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmxvZygnW1Bvc3REYXRhU2VydmljZV0gXHVEODNEXHVEQ0JFIERlY2lzaW9uIHJlcG9ydCBzYXZlZCB0byBzdG9yYWdlOicsIGRlY2lzaW9uUmVwb3J0LmRlY2lzaW9uKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBwb3N0U2VydmljZUxvZ2dlci5lcnJvcignW1Bvc3REYXRhU2VydmljZV0gRmFpbGVkIHRvIHNhdmUgZGVjaXNpb24gcmVwb3J0OicsIGVycm9yKVxuICAgIH1cbiAgfVxuXG4gIC8vIFNhdmUgZXhlY3V0aW9uIHJlc3VsdCB0byBzdG9yYWdlIGZvciBwb3B1cCB2aXNpYmlsaXR5XG4gIHN0YXRpYyBhc3luYyBzYXZlRXhlY3V0aW9uUmVzdWx0KGV4ZWN1dGlvblJlc3VsdCkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoe1xuICAgICAgICBsYXN0RXhlY3V0aW9uUmVzdWx0OiBleGVjdXRpb25SZXN1bHQsXG4gICAgICAgIGxhc3RFeGVjdXRpb25UaW1lc3RhbXA6IGV4ZWN1dGlvblJlc3VsdC50aW1lc3RhbXBcbiAgICAgIH0pXG4gICAgICBwb3N0U2VydmljZUxvZ2dlci5sb2coJ1tQb3N0RGF0YVNlcnZpY2VdIFx1RDgzRFx1RENCRSBFeGVjdXRpb24gcmVzdWx0IHNhdmVkIHRvIHN0b3JhZ2U6JywgZXhlY3V0aW9uUmVzdWx0LnN0YXR1cywgJy0nLCBleGVjdXRpb25SZXN1bHQucG9zdFJlc3VsdClcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcG9zdFNlcnZpY2VMb2dnZXIuZXJyb3IoJ1tQb3N0RGF0YVNlcnZpY2VdIEZhaWxlZCB0byBzYXZlIGV4ZWN1dGlvbiByZXN1bHQ6JywgZXJyb3IpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBwb3N0IHN0YXR1cyBieSBSZWRkaXQgVVJMIChmb3IgZGVsZXRpb24pXG4gICAqL1xuICBzdGF0aWMgYXN5bmMgdXBkYXRlUG9zdFN0YXR1c0J5UmVkZGl0VXJsKHJlZGRpdFVybCwgc3RhdHVzID0gJ0RlbGV0ZWQnLCByZWFzb24gPSBudWxsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmxvZyhcbiAgICAgICAgYFtQb3N0RGF0YVNlcnZpY2VdIFVwZGF0aW5nIHBvc3Qgc3RhdHVzIGZvciBSZWRkaXQgVVJMOiAke3JlZGRpdFVybH0gdG86ICR7c3RhdHVzfWBcbiAgICAgIClcblxuICAgICAgLy8gR2V0IEFQSSBjb25maWd1cmF0aW9uIGZyb20gc3RvcmFnZVxuICAgICAgY29uc3Qgc3RvcmFnZVJlc3VsdCA9IGF3YWl0IGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KFsnYXBpQ29uZmlnJ10pXG4gICAgICBjb25zdCBhcGlDb25maWcgPSBzdG9yYWdlUmVzdWx0LmFwaUNvbmZpZyB8fCB7XG4gICAgICAgIHRva2VuOiAnOGZiYmYwYTdjNjI2ZTE4OjJjMzY5M2ZiNTJhYzY2ZidcbiAgICAgIH1cblxuICAgICAgLy8gVXNlIEZyYXBwZSBBUEkgdG8gZmluZCBwb3N0IGJ5IFJlZGRpdCBVUkxcbiAgICAgIGNvbnN0IGZpbHRlckVuZHBvaW50ID0gYGh0dHBzOi8vMzIwMTYtNTExMjcuYmFjbG91ZC5pbmZvL2FwaS9yZXNvdXJjZS9SZWRkaXQlMjBQb3N0P2ZpbHRlcnM9W1tcInJlZGRpdF9wb3N0X3VybFwiLFwiPVwiLFwiJHtlbmNvZGVVUklDb21wb25lbnQocmVkZGl0VXJsKX1cIl1dYFxuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGZpbHRlckVuZHBvaW50LCB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIEF1dGhvcml6YXRpb246IGB0b2tlbiAke2FwaUNvbmZpZy50b2tlbn1gXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gZmluZCBwb3N0IGJ5IFVSTDogJHtyZXNwb25zZS5zdGF0dXN9YClcbiAgICAgIH1cblxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgICAgXG4gICAgICBpZiAoIWRhdGEuZGF0YSB8fCBkYXRhLmRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLndhcm4oYFtQb3N0RGF0YVNlcnZpY2VdIE5vIHBvc3QgZm91bmQgd2l0aCBSZWRkaXQgVVJMOiAke3JlZGRpdFVybH1gKVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgfVxuXG4gICAgICBjb25zdCBwb3N0TmFtZSA9IGRhdGEuZGF0YVswXS5uYW1lXG4gICAgICBwb3N0U2VydmljZUxvZ2dlci5sb2coYFtQb3N0RGF0YVNlcnZpY2VdIEZvdW5kIHBvc3Q6ICR7cG9zdE5hbWV9LCB1cGRhdGluZyBzdGF0dXNgKVxuXG4gICAgICAvLyBVcGRhdGUgdGhlIHBvc3Qgc3RhdHVzXG4gICAgICBjb25zdCB1cGRhdGVEYXRhID0ge1xuICAgICAgICBzdGF0dXM6IHN0YXR1c1xuICAgICAgfVxuXG4gICAgICBpZiAocmVhc29uKSB7XG4gICAgICAgIHVwZGF0ZURhdGEuZGVsZXRpb25fcmVhc29uID0gcmVhc29uXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVwZGF0ZUVuZHBvaW50ID0gYGh0dHBzOi8vMzIwMTYtNTExMjcuYmFjbG91ZC5pbmZvL2FwaS9yZXNvdXJjZS9SZWRkaXQlMjBQb3N0LyR7cG9zdE5hbWV9YFxuXG4gICAgICBjb25zdCB1cGRhdGVSZXNwb25zZSA9IGF3YWl0IGZldGNoKHVwZGF0ZUVuZHBvaW50LCB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIEF1dGhvcml6YXRpb246IGB0b2tlbiAke2FwaUNvbmZpZy50b2tlbn1gXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHVwZGF0ZURhdGEpXG4gICAgICB9KVxuXG4gICAgICBpZiAoIXVwZGF0ZVJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHVwZGF0ZSBwb3N0IHN0YXR1czogJHt1cGRhdGVSZXNwb25zZS5zdGF0dXN9YClcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdXBkYXRlUmVzcG9uc2UuanNvbigpXG4gICAgICBwb3N0U2VydmljZUxvZ2dlci5sb2coYFtQb3N0RGF0YVNlcnZpY2VdIFx1MjcwNSBQb3N0IHN0YXR1cyB1cGRhdGVkIHN1Y2Nlc3NmdWxseTpgLCByZXN1bHQpXG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmVycm9yKCdbUG9zdERhdGFTZXJ2aWNlXSBGYWlsZWQgdG8gdXBkYXRlIHBvc3Qgc3RhdHVzIGJ5IFVSTDonLCBlcnJvcilcbiAgICAgIHRocm93IGVycm9yXG4gICAgfVxuICB9XG5cbiAgLy8gVXBkYXRlIHBvc3Qgc3RhdHVzIChhbmQgb3B0aW9uYWxseSBSZWRkaXQgbWV0YWRhdGEpIHVzaW5nIEZyYXBwZSBSRVNUIEFQSVxuICAvLyBleHRyYUZpZWxkcyBpcyBhbiBvcHRpb25hbCBvYmplY3QsIGUuZy4geyByZWRkaXRfcG9zdF91cmwsIHJlZGRpdF9wb3N0X2lkLCBwb3N0ZWRfYXQgfVxuICBzdGF0aWMgYXN5bmMgdXBkYXRlUG9zdFN0YXR1cyhwb3N0TmFtZSwgc3RhdHVzID0gJ1Bvc3RlZCcsIGV4dHJhRmllbGRzID0gbnVsbCkge1xuICAgIHRyeSB7XG4gICAgICBwb3N0U2VydmljZUxvZ2dlci5sb2coXG4gICAgICAgIGBbUG9zdERhdGFTZXJ2aWNlXSBVcGRhdGluZyBwb3N0ICR7cG9zdE5hbWV9IHN0YXR1cyB0bzogJHtzdGF0dXN9YCxcbiAgICAgICAgZXh0cmFGaWVsZHMgPyB7IGV4dHJhRmllbGRzIH0gOiB7fVxuICAgICAgKVxuXG4gICAgICAvLyBHZXQgQVBJIGNvbmZpZ3VyYXRpb24gZnJvbSBzdG9yYWdlXG4gICAgICBjb25zdCBzdG9yYWdlUmVzdWx0ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoWydhcGlDb25maWcnXSlcbiAgICAgIGNvbnN0IGFwaUNvbmZpZyA9IHN0b3JhZ2VSZXN1bHQuYXBpQ29uZmlnIHx8IHtcbiAgICAgICAgdG9rZW46ICc4ZmJiZjBhN2M2MjZlMTg6MmMzNjkzZmI1MmFjNjZmJ1xuICAgICAgfVxuXG4gICAgICAvLyBVc2UgRnJhcHBlIFJFU1QgQVBJIHRvIHVwZGF0ZSB0aGUgZG9jdW1lbnRcbiAgICAgIGNvbnN0IHVwZGF0ZUVuZHBvaW50ID0gYGh0dHBzOi8vMzIwMTYtNTExMjcuYmFjbG91ZC5pbmZvL2FwaS9yZXNvdXJjZS9SZWRkaXQlMjBQb3N0LyR7cG9zdE5hbWV9YFxuXG4gICAgICBjb25zdCB1cGRhdGVEYXRhID0ge1xuICAgICAgICBzdGF0dXM6IHN0YXR1c1xuICAgICAgfVxuXG4gICAgICAvLyBTaGFsbG93LW1lcmdlIGFueSBleHRyYSBmaWVsZHMgc28gZXh0ZW5zaW9uIGNhbiBhbHNvIHB1c2ggcmVkZGl0X3Bvc3RfdXJsL2lkXG4gICAgICBpZiAoZXh0cmFGaWVsZHMgJiYgdHlwZW9mIGV4dHJhRmllbGRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBPYmplY3QuYXNzaWduKHVwZGF0ZURhdGEsIGV4dHJhRmllbGRzKVxuICAgICAgfVxuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVwZGF0ZUVuZHBvaW50LCB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIEF1dGhvcml6YXRpb246IGB0b2tlbiAke2FwaUNvbmZpZy50b2tlbn1gXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHVwZGF0ZURhdGEpXG4gICAgICB9KVxuXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHVwZGF0ZSBwb3N0IHN0YXR1czogJHtyZXNwb25zZS5zdGF0dXN9ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKVxuICAgICAgfVxuXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmxvZyhgW1Bvc3REYXRhU2VydmljZV0gXHUyNzA1IFBvc3Qgc3RhdHVzL21ldGFkYXRhIHVwZGF0ZWQgc3VjY2Vzc2Z1bGx5OmAsIHJlc3VsdClcbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcG9zdFNlcnZpY2VMb2dnZXIuZXJyb3IoJ1tQb3N0RGF0YVNlcnZpY2VdIEZhaWxlZCB0byB1cGRhdGUgcG9zdCBzdGF0dXMvbWV0YWRhdGE6JywgZXJyb3IpXG4gICAgICB0aHJvdyBlcnJvclxuICAgIH1cbiAgfVxuXG5cbn1cblxuLyoqXG4gKiBGZXRjaCBuZXh0IHBvc3QgdG8gY3JlYXRlXG4gKiBPcmNoZXN0cmF0ZXMgcG9zdCBmZXRjaGluZyBhbmQgZGVjaXNpb24gbWFraW5nXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaE5leHRQb3N0KCkge1xuICBwb3N0U2VydmljZUxvZ2dlci5sb2coJ1tCR10gQ2hlY2tpbmcgZm9yIG5ldyBwb3N0cyB0byBjcmVhdGUgKEFQSSBzZXJ2aWNlKS4uLicpXG5cbiAgdHJ5IHtcbiAgICAvLyBHZXQgc3RvcmVkIHVzZXJuYW1lIHRvIHVzZSBhcyBhZ2VudCBuYW1lXG4gICAgY29uc3Qgc3luY1Jlc3VsdCA9IGF3YWl0IGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KFsncmVkZGl0VXNlciddKVxuICAgIGNvbnN0IGxvY2FsUmVzdWx0ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsncmVkZGl0VXNlciddKVxuICAgIGNvbnN0IHJlZGRpdFVzZXIgPSBzeW5jUmVzdWx0LnJlZGRpdFVzZXIgfHwgbG9jYWxSZXN1bHQucmVkZGl0VXNlclxuXG4gICAgaWYgKCFyZWRkaXRVc2VyIHx8ICFyZWRkaXRVc2VyLnNlcmVuX25hbWUpIHtcbiAgICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmxvZygnW0JHXSBObyB1c2VybmFtZSBmb3VuZCwgc2tpcHBpbmcgQVBJIGNhbGwnKVxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICBjb25zdCBhZ2VudE5hbWUgPSByZWRkaXRVc2VyLnNlcmVuX25hbWVcbiAgICBjb25zdCBjbGVhbkFnZW50TmFtZSA9IGFnZW50TmFtZS5yZXBsYWNlKC9edVxcLy8sICcnKVxuICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmxvZyhgW0JHXSBVc2luZyBhZ2VudCBuYW1lOiAke2FnZW50TmFtZX0gKGNsZWFuZWQ6ICR7Y2xlYW5BZ2VudE5hbWV9KWApXG5cbiAgICAvLyBDaGVjayBpZiB3ZSBzaG91bGQgY3JlYXRlIGEgcG9zdFxuICAgIGlmIChhd2FpdCBQb3N0RGF0YVNlcnZpY2Uuc2hvdWxkQ3JlYXRlUG9zdCh7IHVzZXJOYW1lOiBhZ2VudE5hbWUgfSkpIHtcbiAgICAgIGNvbnN0IHBvc3REYXRhID0gYXdhaXQgUG9zdERhdGFTZXJ2aWNlLmdlbmVyYXRlUG9zdChjbGVhbkFnZW50TmFtZSlcbiAgICAgIHBvc3RTZXJ2aWNlTG9nZ2VyLmxvZygnW0JHXSBBUEkgc2VydmljZSBzYXlzOiBDUkVBVEUgUE9TVCcpXG4gICAgICByZXR1cm4gcG9zdERhdGFcbiAgICB9XG5cbiAgICBwb3N0U2VydmljZUxvZ2dlci5sb2coJ1tCR10gQVBJIHNlcnZpY2Ugc2F5czogTk8gUE9TVCBORUVERUQnKVxuICAgIHJldHVybiBudWxsXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcG9zdFNlcnZpY2VMb2dnZXIuZXJyb3IoJ1tCR10gRXJyb3IgaW4gZmV0Y2hOZXh0UG9zdDonLCBlcnJvcilcbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG5cbiIsICJpbXBvcnQgeyBiZ0xvZ2dlciB9IGZyb20gXCIuL2xvZ2dlci5qc1wiXG5cbi8qKlxuICogVW5pZmllZCBUYWIgTWFuYWdlclxuICogTWFuYWdlcyBhIHNpbmdsZSBkZWRpY2F0ZWQgdGFiIGZvciBBTEwgZXh0ZW5zaW9uIG9wZXJhdGlvbnNcbiAqIEltcGxlbWVudHMgc2luZ2xlLXRhYiBwYXR0ZXJuIHdoZXJlIG9uZSB0YWIgaXMgcmV1c2VkIGZvciBhbGwgb3BlcmF0aW9uc1xuICogYnkgcmVsb2FkaW5nIHdpdGggbmV3IFVSTHMgYXMgbmVlZGVkXG4gKi9cblxuY29uc3QgVU5JRklFRF9UQUJfSURfS0VZID0gJ3VuaWZpZWRUYWJJZCdcblxuLy8gVHJhY2sgbGlzdGVuZXJzIHBlciB0YWIgdG8gcHJldmVudCBkdXBsaWNhdGVzXG5jb25zdCB0YWJMaXN0ZW5lcnMgPSB7fVxuXG4vLyBUcmFjayB0aGUgY3VycmVudCBjb250cm9sbGVkIHRhYiBJRCB0byBlbmZvcmNlIHNpbmdsZS10YWIgY29udHJvbFxubGV0IGN1cnJlbnRDb250cm9sbGVkVGFiSWQgPSBudWxsXG5cbi8vIFRyYWNrIHRoZSBjdXJyZW50IG9wZXJhdGlvbiB0eXBlIGZvciB0aGUgdGFiXG5sZXQgY3VycmVudE9wZXJhdGlvblR5cGUgPSBudWxsXG5cbi8vIE9wZXJhdGlvbiB0eXBlc1xuY29uc3QgT1BFUkFUSU9OUyA9IHtcbiAgRVhURU5TSU9OOiAnZXh0ZW5zaW9uJyxcbiAgUkVERElUOiAncmVkZGl0JyxcbiAgUE9TVF9DUkVBVElPTjogJ3Bvc3RfY3JlYXRpb24nLFxuICBQT1NUX0NPTExFQ1RJT046ICdwb3N0X2NvbGxlY3Rpb24nLFxuICBQT1NUX0RFTEVUSU9OOiAncG9zdF9kZWxldGlvbidcbn1cblxuLyoqXG4gKiBHZXQgdGhlIHN0b3JlZCB1bmlmaWVkIHRhYiBJRCBmcm9tIHN0b3JhZ2VcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFN0b3JlZFVuaWZpZWRUYWJJZCgpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoW1VOSUZJRURfVEFCX0lEX0tFWV0pXG4gICAgcmV0dXJuIHJlc3VsdFtVTklGSUVEX1RBQl9JRF9LRVldIHx8IG51bGxcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBiZ0xvZ2dlci5lcnJvcignW1VuaWZpZWRUYWJNZ3JdIEZhaWxlZCB0byBnZXQgc3RvcmVkIHVuaWZpZWQgdGFiIElEOicsIGVycm9yKVxuICAgIHJldHVybiBudWxsXG4gIH1cbn1cblxuLyoqXG4gKiBTYXZlIHRoZSB1bmlmaWVkIHRhYiBJRCB0byBzdG9yYWdlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlVW5pZmllZFRhYklkKHRhYklkKSB7XG4gIHRyeSB7XG4gICAgYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgW1VOSUZJRURfVEFCX0lEX0tFWV06IHRhYklkIH0pXG4gICAgYmdMb2dnZXIubG9nKGBbVW5pZmllZFRhYk1ncl0gU2F2ZWQgdW5pZmllZCB0YWIgSUQ6ICR7dGFiSWR9YClcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBiZ0xvZ2dlci5lcnJvcignW1VuaWZpZWRUYWJNZ3JdIEZhaWxlZCB0byBzYXZlIHVuaWZpZWQgdGFiIElEOicsIGVycm9yKVxuICB9XG59XG5cbi8qKlxuICogQ2xlYXIgdGhlIHN0b3JlZCB1bmlmaWVkIHRhYiBJRFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJVbmlmaWVkVGFiSWQoKSB7XG4gIHRyeSB7XG4gICAgYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwucmVtb3ZlKFtVTklGSUVEX1RBQl9JRF9LRVldKVxuICAgIGJnTG9nZ2VyLmxvZygnW1VuaWZpZWRUYWJNZ3JdIENsZWFyZWQgdW5pZmllZCB0YWIgSUQnKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGJnTG9nZ2VyLmVycm9yKCdbVW5pZmllZFRhYk1ncl0gRmFpbGVkIHRvIGNsZWFyIHVuaWZpZWQgdGFiIElEOicsIGVycm9yKVxuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGUgaWYgYSB0YWIgSUQgaXMgc3RpbGwgdmFsaWQgYW5kIGFjY2Vzc2libGVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzVGFiVmFsaWQodGFiSWQpIHtcbiAgaWYgKCF0YWJJZCkgcmV0dXJuIGZhbHNlXG4gIHRyeSB7XG4gICAgY29uc3QgdGFiID0gYXdhaXQgY2hyb21lLnRhYnMuZ2V0KHRhYklkKVxuICAgIHJldHVybiB0YWIgJiYgIXRhYi5kaXNjYXJkZWRcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBiZ0xvZ2dlci5sb2coYFtVbmlmaWVkVGFiTWdyXSBUYWIgJHt0YWJJZH0gaXMgbm8gbG9uZ2VyIHZhbGlkOmAsIGVycm9yLm1lc3NhZ2UpXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgdGhlIHVuaWZpZWQgdGFiIGZvciBvcGVyYXRpb25zXG4gKiBJbXBsZW1lbnRzIHNpbmdsZS10YWIgcGF0dGVybjpcbiAqIC0gSWYgYSB2YWxpZCB0YWIgZXhpc3RzLCBuYXZpZ2F0ZSBpdCB0byB0aGUgdGFyZ2V0IFVSTFxuICogLSBJZiB0aGUgc3RvcmVkIHRhYiBJRCBpcyBpbnZhbGlkLCBjcmVhdGUgYSBuZXcgb25lXG4gKiAtIE90aGVyd2lzZSBjcmVhdGUgYSBuZXcgdGFiXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldFVybCAtIFRoZSBVUkwgdG8gbmF2aWdhdGUgdG9cbiAqIEBwYXJhbSB7c3RyaW5nfSBvcGVyYXRpb25UeXBlIC0gVGhlIHR5cGUgb2Ygb3BlcmF0aW9uIChvcHRpb25hbClcbiAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj59IFRhYiBJRFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VW5pZmllZFRhYih0YXJnZXRVcmwsIG9wZXJhdGlvblR5cGUgPSBudWxsKSB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc3RvcmVkVGFiSWQgPSBhd2FpdCBnZXRTdG9yZWRVbmlmaWVkVGFiSWQoKVxuXG4gICAgLy8gQ2hlY2sgaWYgc3RvcmVkIHRhYiBpcyBzdGlsbCB2YWxpZFxuICAgIGlmIChzdG9yZWRUYWJJZCAmJiBhd2FpdCBpc1RhYlZhbGlkKHN0b3JlZFRhYklkKSkge1xuICAgICAgYmdMb2dnZXIubG9nKGBbVW5pZmllZFRhYk1ncl0gUmV1c2luZyB1bmlmaWVkIHRhYiAke3N0b3JlZFRhYklkfSBmb3IgJHtvcGVyYXRpb25UeXBlIHx8ICdvcGVyYXRpb24nfWApXG5cbiAgICAgIC8vIENsZWFuIHVwIG9sZCBsaXN0ZW5lcnMgYmVmb3JlIHJldXNpbmcgdGhlIHRhYlxuICAgICAgY2xlYW51cFRhYkxpc3RlbmVycyhzdG9yZWRUYWJJZClcblxuICAgICAgLy8gTmF2aWdhdGUgdG8gdGhlIG5ldyBVUkxcbiAgICAgIGF3YWl0IGNocm9tZS50YWJzLnVwZGF0ZShzdG9yZWRUYWJJZCwgeyB1cmw6IHRhcmdldFVybCwgYWN0aXZlOiB0cnVlIH0pXG5cbiAgICAgIC8vIFNldCB0aGlzIGFzIHRoZSBjb250cm9sbGVkIHRhYlxuICAgICAgc2V0Q3VycmVudENvbnRyb2xsZWRUYWJJZChzdG9yZWRUYWJJZCwgb3BlcmF0aW9uVHlwZSlcbiAgICAgIHJldHVybiBzdG9yZWRUYWJJZFxuICAgIH1cblxuICAgIC8vIFN0b3JlZCB0YWIgaXMgaW52YWxpZCwgY2xlYXIgaXRcbiAgICBpZiAoc3RvcmVkVGFiSWQpIHtcbiAgICAgIGJnTG9nZ2VyLmxvZyhgW1VuaWZpZWRUYWJNZ3JdIFN0b3JlZCB0YWIgJHtzdG9yZWRUYWJJZH0gaXMgbm8gbG9uZ2VyIHZhbGlkLCBjbGVhcmluZ2ApXG4gICAgICBjbGVhbnVwVGFiTGlzdGVuZXJzKHN0b3JlZFRhYklkKVxuICAgICAgYXdhaXQgY2xlYXJVbmlmaWVkVGFiSWQoKVxuICAgIH1cblxuICAgIC8vIENyZWF0ZSBuZXcgdW5pZmllZCB0YWJcbiAgICBiZ0xvZ2dlci5sb2coYFtVbmlmaWVkVGFiTWdyXSBDcmVhdGluZyBuZXcgdW5pZmllZCB0YWIgd2l0aCBVUkw6ICR7dGFyZ2V0VXJsfSBmb3IgJHtvcGVyYXRpb25UeXBlIHx8ICdvcGVyYXRpb24nfWApXG4gICAgY29uc3QgbmV3VGFiID0gYXdhaXQgY2hyb21lLnRhYnMuY3JlYXRlKHtcbiAgICAgIHVybDogdGFyZ2V0VXJsLFxuICAgICAgYWN0aXZlOiB0cnVlXG4gICAgfSlcblxuICAgIGF3YWl0IHNhdmVVbmlmaWVkVGFiSWQobmV3VGFiLmlkKVxuICAgIC8vIFNldCB0aGlzIGFzIHRoZSBjb250cm9sbGVkIHRhYlxuICAgIHNldEN1cnJlbnRDb250cm9sbGVkVGFiSWQobmV3VGFiLmlkLCBvcGVyYXRpb25UeXBlKVxuICAgIGJnTG9nZ2VyLmxvZyhgW1VuaWZpZWRUYWJNZ3JdIENyZWF0ZWQgbmV3IHVuaWZpZWQgdGFiICR7bmV3VGFiLmlkfWApXG4gICAgcmV0dXJuIG5ld1RhYi5pZFxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGJnTG9nZ2VyLmVycm9yKCdbVW5pZmllZFRhYk1ncl0gRmFpbGVkIHRvIGdldCB1bmlmaWVkIHRhYjonLCBlcnJvcilcbiAgICB0aHJvdyBlcnJvclxuICB9XG59XG5cbi8qKlxuICogQ29udmVuaWVuY2UgbWV0aG9kIHRvIGdldCB0aGUgZXh0ZW5zaW9uIFVJIHRhYlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RXh0ZW5zaW9uVGFiKCkge1xuICBjb25zdCBleHRlbnNpb25VcmwgPSBgY2hyb21lLWV4dGVuc2lvbjovLyR7Y2hyb21lLnJ1bnRpbWUuaWR9L3d3dy9pbmRleC5odG1sIy9wb3B1cGBcbiAgcmV0dXJuIGdldFVuaWZpZWRUYWIoZXh0ZW5zaW9uVXJsLCBPUEVSQVRJT05TLkVYVEVOU0lPTilcbn1cblxuLyoqXG4gKiBDb252ZW5pZW5jZSBtZXRob2QgdG8gZ2V0IGEgUmVkZGl0IHRhYlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UmVkZGl0VGFiKHRhcmdldFVybCA9ICdodHRwczovL3d3dy5yZWRkaXQuY29tL3N1Ym1pdCcpIHtcbiAgcmV0dXJuIGdldFVuaWZpZWRUYWIodGFyZ2V0VXJsLCBPUEVSQVRJT05TLlJFRERJVClcbn1cblxuLyoqXG4gKiBDb252ZW5pZW5jZSBtZXRob2QgdG8gZ2V0IGEgcG9zdCBjcmVhdGlvbiB0YWJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBvc3RDcmVhdGlvblRhYihwb3N0RGF0YSkge1xuICBjb25zdCBjbGVhblN1YnJlZGRpdCA9IChwb3N0RGF0YS5zdWJyZWRkaXQgfHwgJ3NwaHlueCcpLnJlcGxhY2UoL15yXFwvL2ksICcnKVxuICBjb25zdCBzdWJtaXRVcmwgPSBgaHR0cHM6Ly93d3cucmVkZGl0LmNvbS9yLyR7Y2xlYW5TdWJyZWRkaXR9L3N1Ym1pdGBcbiAgcmV0dXJuIGdldFVuaWZpZWRUYWIoc3VibWl0VXJsLCBPUEVSQVRJT05TLlBPU1RfQ1JFQVRJT04pXG59XG5cbi8qKlxuICogQ29udmVuaWVuY2UgbWV0aG9kIHRvIGdldCBhIHBvc3QgY29sbGVjdGlvbiB0YWJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBvc3RDb2xsZWN0aW9uVGFiKHVzZXJOYW1lKSB7XG4gIGNvbnN0IGNsZWFuVXNlcm5hbWUgPSB1c2VyTmFtZS5yZXBsYWNlKC9edVxcLy8sICcnKVxuICBjb25zdCBwb3N0c1VybCA9IGBodHRwczovL3d3dy5yZWRkaXQuY29tL3VzZXIvJHtjbGVhblVzZXJuYW1lfS9zdWJtaXR0ZWQvYFxuICByZXR1cm4gZ2V0VW5pZmllZFRhYihwb3N0c1VybCwgT1BFUkFUSU9OUy5QT1NUX0NPTExFQ1RJT04pXG59XG5cbi8qKlxuICogQ2xlYW4gdXAgb2xkIGxpc3RlbmVycyBmb3IgYSB0YWJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFudXBUYWJMaXN0ZW5lcnModGFiSWQpIHtcbiAgaWYgKHRhYkxpc3RlbmVyc1t0YWJJZF0pIHtcbiAgICBiZ0xvZ2dlci5sb2coYFtVbmlmaWVkVGFiTWdyXSBDbGVhbmluZyB1cCAke3RhYkxpc3RlbmVyc1t0YWJJZF0ubGVuZ3RofSBvbGQgbGlzdGVuZXJzIGZvciB0YWIgJHt0YWJJZH1gKVxuICAgIHRhYkxpc3RlbmVyc1t0YWJJZF0uZm9yRWFjaChsaXN0ZW5lciA9PiB7XG4gICAgICBjaHJvbWUudGFicy5vblVwZGF0ZWQucmVtb3ZlTGlzdGVuZXIobGlzdGVuZXIpXG4gICAgfSlcbiAgICBkZWxldGUgdGFiTGlzdGVuZXJzW3RhYklkXVxuICB9XG59XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBsaXN0ZW5lciBmb3IgYSB0YWJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyVGFiTGlzdGVuZXIodGFiSWQsIGxpc3RlbmVyKSB7XG4gIGlmICghdGFiTGlzdGVuZXJzW3RhYklkXSkge1xuICAgIHRhYkxpc3RlbmVyc1t0YWJJZF0gPSBbXVxuICB9XG4gIHRhYkxpc3RlbmVyc1t0YWJJZF0ucHVzaChsaXN0ZW5lcilcbiAgY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKGxpc3RlbmVyKVxufVxuXG4vKipcbiAqIEhhbmRsZSB0YWIgY2xvc3VyZSBjbGVhbnVwXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVUYWJDbG9zZWQodGFiSWQpIHtcbiAgdHJ5IHtcbiAgICAvLyBDbGVhbiB1cCBhbnkgbGlzdGVuZXJzIGZvciB0aGlzIHRhYlxuICAgIGNsZWFudXBUYWJMaXN0ZW5lcnModGFiSWQpXG5cbiAgICBjb25zdCBzdG9yZWRUYWJJZCA9IGF3YWl0IGdldFN0b3JlZFVuaWZpZWRUYWJJZCgpXG4gICAgaWYgKHN0b3JlZFRhYklkID09PSB0YWJJZCkge1xuICAgICAgYmdMb2dnZXIubG9nKGBbVW5pZmllZFRhYk1ncl0gVW5pZmllZCB0YWIgJHt0YWJJZH0gd2FzIGNsb3NlZCwgY2xlYXJpbmcgc3RvcmVkIElEYClcbiAgICAgIGF3YWl0IGNsZWFyVW5pZmllZFRhYklkKClcbiAgICB9XG5cbiAgICAvLyBDbGVhciBjb250cm9sbGVkIHRhYiB0cmFja2luZyBpZiB0aGlzIHdhcyB0aGUgY29udHJvbGxlZCB0YWJcbiAgICBpZiAoY3VycmVudENvbnRyb2xsZWRUYWJJZCA9PT0gdGFiSWQpIHtcbiAgICAgIGJnTG9nZ2VyLmxvZyhgW1VuaWZpZWRUYWJNZ3JdIENvbnRyb2xsZWQgdGFiICR7dGFiSWR9IHdhcyBjbG9zZWQsIGNsZWFyaW5nIGNvbnRyb2xgKVxuICAgICAgY3VycmVudENvbnRyb2xsZWRUYWJJZCA9IG51bGxcbiAgICAgIGN1cnJlbnRPcGVyYXRpb25UeXBlID0gbnVsbFxuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBiZ0xvZ2dlci5lcnJvcignW1VuaWZpZWRUYWJNZ3JdIEZhaWxlZCB0byBoYW5kbGUgdGFiIGNsb3N1cmU6JywgZXJyb3IpXG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgdGhlIGN1cnJlbnQgY29udHJvbGxlZCB0YWIgSUQgYW5kIG9wZXJhdGlvbiB0eXBlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50Q29udHJvbGxlZFRhYigpIHtcbiAgcmV0dXJuIHtcbiAgICB0YWJJZDogY3VycmVudENvbnRyb2xsZWRUYWJJZCxcbiAgICBvcGVyYXRpb25UeXBlOiBjdXJyZW50T3BlcmF0aW9uVHlwZVxuICB9XG59XG5cbi8qKlxuICogU2V0IHRoZSBjdXJyZW50IGNvbnRyb2xsZWQgdGFiIElEIGFuZCBvcGVyYXRpb24gdHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0Q3VycmVudENvbnRyb2xsZWRUYWJJZCh0YWJJZCwgb3BlcmF0aW9uVHlwZSA9IG51bGwpIHtcbiAgaWYgKGN1cnJlbnRDb250cm9sbGVkVGFiSWQgIT09IG51bGwgJiYgY3VycmVudENvbnRyb2xsZWRUYWJJZCAhPT0gdGFiSWQpIHtcbiAgICBiZ0xvZ2dlci5sb2coYFtVbmlmaWVkVGFiTWdyXSBSZXBsYWNpbmcgY29udHJvbGxlZCB0YWIgJHtjdXJyZW50Q29udHJvbGxlZFRhYklkfSB3aXRoICR7dGFiSWR9YClcbiAgfVxuICBjdXJyZW50Q29udHJvbGxlZFRhYklkID0gdGFiSWRcbiAgY3VycmVudE9wZXJhdGlvblR5cGUgPSBvcGVyYXRpb25UeXBlXG4gIGJnTG9nZ2VyLmxvZyhgW1VuaWZpZWRUYWJNZ3JdIFNldCBjb250cm9sbGVkIHRhYiB0byAke3RhYklkfSBmb3Igb3BlcmF0aW9uOiAke29wZXJhdGlvblR5cGV9YClcbn1cblxuLyoqXG4gKiBDbGVhciB0aGUgY3VycmVudCBjb250cm9sbGVkIHRhYiBJRFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJDdXJyZW50Q29udHJvbGxlZFRhYklkKCkge1xuICBpZiAoY3VycmVudENvbnRyb2xsZWRUYWJJZCAhPT0gbnVsbCkge1xuICAgIGJnTG9nZ2VyLmxvZyhgW1VuaWZpZWRUYWJNZ3JdIENsZWFyaW5nIGNvbnRyb2xsZWQgdGFiICR7Y3VycmVudENvbnRyb2xsZWRUYWJJZH1gKVxuICB9XG4gIGN1cnJlbnRDb250cm9sbGVkVGFiSWQgPSBudWxsXG4gIGN1cnJlbnRPcGVyYXRpb25UeXBlID0gbnVsbFxufVxuXG4vKipcbiAqIFJlbG9hZCB0aGUgdW5pZmllZCB0YWIgd2l0aCBhIG5ldyBVUkxcbiAqIFRoaXMgaXMgdGhlIHByaW1hcnkgbWV0aG9kIGZvciBzd2l0Y2hpbmcgYmV0d2VlbiBvcGVyYXRpb25zXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWxvYWRVbmlmaWVkVGFiKG5ld1VybCwgb3BlcmF0aW9uVHlwZSA9IG51bGwpIHtcbiAgY29uc3QgY3VycmVudCA9IGdldEN1cnJlbnRDb250cm9sbGVkVGFiKClcblxuICBpZiAoIWN1cnJlbnQudGFiSWQpIHtcbiAgICAvLyBObyB0YWIgY3VycmVudGx5IGNvbnRyb2xsZWQsIGdldCBhIG5ldyBvbmVcbiAgICByZXR1cm4gZ2V0VW5pZmllZFRhYihuZXdVcmwsIG9wZXJhdGlvblR5cGUpXG4gIH1cblxuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIHRoZSB0YWIgc3RpbGwgZXhpc3RzXG4gICAgaWYgKGF3YWl0IGlzVGFiVmFsaWQoY3VycmVudC50YWJJZCkpIHtcbiAgICAgIGJnTG9nZ2VyLmxvZyhgW1VuaWZpZWRUYWJNZ3JdIFJlbG9hZGluZyB0YWIgJHtjdXJyZW50LnRhYklkfSB3aXRoIG5ldyBVUkw6ICR7bmV3VXJsfWApXG4gICAgICBhd2FpdCBjaHJvbWUudGFicy51cGRhdGUoY3VycmVudC50YWJJZCwgeyB1cmw6IG5ld1VybCwgYWN0aXZlOiB0cnVlIH0pXG4gICAgICBzZXRDdXJyZW50Q29udHJvbGxlZFRhYklkKGN1cnJlbnQudGFiSWQsIG9wZXJhdGlvblR5cGUpXG4gICAgICByZXR1cm4gY3VycmVudC50YWJJZFxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUYWIgaXMgaW52YWxpZCwgY2xlYXIgYW5kIGdldCBuZXdcbiAgICAgIGJnTG9nZ2VyLmxvZyhgW1VuaWZpZWRUYWJNZ3JdIEN1cnJlbnQgdGFiICR7Y3VycmVudC50YWJJZH0gaXMgaW52YWxpZCwgZ2V0dGluZyBuZXcgdGFiYClcbiAgICAgIGF3YWl0IGNsZWFyVW5pZmllZFRhYklkKClcbiAgICAgIGNsZWFyQ3VycmVudENvbnRyb2xsZWRUYWJJZCgpXG4gICAgICByZXR1cm4gZ2V0VW5pZmllZFRhYihuZXdVcmwsIG9wZXJhdGlvblR5cGUpXG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGJnTG9nZ2VyLmVycm9yKCdbVW5pZmllZFRhYk1ncl0gRmFpbGVkIHRvIHJlbG9hZCB1bmlmaWVkIHRhYjonLCBlcnJvcilcbiAgICB0aHJvdyBlcnJvclxuICB9XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgdW5pZmllZCBSZWRkaXQgdGFiIGZvciBhdXRvZmxvdyB3aXRob3V0IGNsb3NpbmcgZXhpc3RpbmcgdGFicy5cbiAqXG4gKiBCZWhhdmlvcjpcbiAqIC0gSWYgYSBSZWRkaXQgdGFiIGlzIGN1cnJlbnRseSBhY3RpdmUsIHJldXNlIGl0XG4gKiAtIE90aGVyd2lzZSwgcmV1c2UgdGhlIGZpcnN0IGV4aXN0aW5nIFJlZGRpdCB0YWJcbiAqIC0gT25seSBjcmVhdGUgYSBuZXcgUmVkZGl0IHRhYiBpZiBubyBSZWRkaXQgdGFiIGV4aXN0cyBhdCBhbGxcbiAqIC0gQWx3YXlzIG5hdmlnYXRlIHRoZSBjaG9zZW4gdGFiIHRvIHRoZSB0YXJnZXQgVVJMIGFuZCBtYXJrIGl0IGFzIHRoZSB1bmlmaWVkIHRhYlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1c2VyTmFtZSAtIE9wdGlvbmFsIHVzZXJuYW1lIHRvIG5hdmlnYXRlIGRpcmVjdGx5IHRvIHN1Ym1pdHRlZCBwYWdlXG4gICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VBbGxSZWRkaXRUYWJzQW5kT3BlbkZyZXNoKHVzZXJOYW1lKSB7XG4gIHRyeSB7XG4gICAgYmdMb2dnZXIubG9nKCdbVW5pZmllZFRhYk1ncl0gSW5pdGlhbGl6aW5nIHVuaWZpZWQgUmVkZGl0IHRhYiBmb3IgYXV0b2Zsb3cgKHJldXNlIGFjdGl2ZSwgY2xvc2Ugb3RoZXJzKScpXG5cbiAgICAvLyBEZXRlcm1pbmUgdGhlIFVSTCB0byBuYXZpZ2F0ZSB0b1xuICAgIGxldCB0YXJnZXRVcmwgPSAnaHR0cHM6Ly93d3cucmVkZGl0LmNvbS8nXG4gICAgaWYgKHVzZXJOYW1lKSB7XG4gICAgICBjb25zdCBjbGVhblVzZXJuYW1lID0gdXNlck5hbWUucmVwbGFjZSgndS8nLCAnJylcbiAgICAgIHRhcmdldFVybCA9IGBodHRwczovL3d3dy5yZWRkaXQuY29tL3VzZXIvJHtjbGVhblVzZXJuYW1lfS9zdWJtaXR0ZWQvYFxuICAgICAgYmdMb2dnZXIubG9nKGBbVW5pZmllZFRhYk1ncl0gXHVEODNEXHVERTgwIFVzaW5nIGRpcmVjdCBuYXZpZ2F0aW9uIHRvIHVzZXIncyBzdWJtaXR0ZWQgcGFnZTogJHt0YXJnZXRVcmx9YClcbiAgICB9XG5cbiAgICAvLyBGaW5kIGV4aXN0aW5nIFJlZGRpdCB0YWJzXG4gICAgY29uc3QgcmVkZGl0VGFicyA9IGF3YWl0IGNocm9tZS50YWJzLnF1ZXJ5KHsgdXJsOiAnKjovLyoucmVkZGl0LmNvbS8qJyB9KVxuXG4gICAgLy8gVHJ5IHRvIGZpbmQgdGhlIGN1cnJlbnRseSBhY3RpdmUgUmVkZGl0IHRhYiBpbiB0aGUgY3VycmVudCB3aW5kb3dcbiAgICBjb25zdCBhY3RpdmVUYWJzID0gYXdhaXQgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSlcbiAgICBsZXQgcHJlZmVycmVkVGFiID0gbnVsbFxuICAgIGlmIChhY3RpdmVUYWJzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGFjdGl2ZVRhYiA9IGFjdGl2ZVRhYnNbMF1cbiAgICAgIGlmIChhY3RpdmVUYWIudXJsICYmIGFjdGl2ZVRhYi51cmwuaW5jbHVkZXMoJ3JlZGRpdC5jb20nKSkge1xuICAgICAgICBwcmVmZXJyZWRUYWIgPSBhY3RpdmVUYWJcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiBubyBhY3RpdmUgUmVkZGl0IHRhYiBpbiBjdXJyZW50IHdpbmRvdywgZmFsbCBiYWNrIHRvIGFueSBleGlzdGluZyBSZWRkaXQgdGFiXG4gICAgaWYgKCFwcmVmZXJyZWRUYWIgJiYgcmVkZGl0VGFicy5sZW5ndGggPiAwKSB7XG4gICAgICBwcmVmZXJyZWRUYWIgPSByZWRkaXRUYWJzWzBdXG4gICAgfVxuXG4gICAgLy8gQ2xvc2UgYWxsIG90aGVyIFJlZGRpdCB0YWJzIGV4Y2VwdCB0aGUgcHJlZmVycmVkIG9uZSAoaWYgYW55KVxuICAgIGNvbnN0IHRhYnNUb0Nsb3NlID0gcmVkZGl0VGFicy5maWx0ZXIodGFiID0+ICFwcmVmZXJyZWRUYWIgfHwgdGFiLmlkICE9PSBwcmVmZXJyZWRUYWIuaWQpXG4gICAgaWYgKHRhYnNUb0Nsb3NlLmxlbmd0aCA+IDApIHtcbiAgICAgIGJnTG9nZ2VyLmxvZyhgW1VuaWZpZWRUYWJNZ3JdIENsb3NpbmcgJHt0YWJzVG9DbG9zZS5sZW5ndGh9IG90aGVyIFJlZGRpdCB0YWJzLCBrZWVwaW5nIHRhYiAke3ByZWZlcnJlZFRhYiA/IHByZWZlcnJlZFRhYi5pZCA6ICdub25lIHlldCd9YClcblxuICAgICAgLy8gQmVzdC1lZmZvcnQ6IGFzayB0aG9zZSB0YWJzIHRvIHJlbW92ZSBiZWZvcmV1bmxvYWQgbGlzdGVuZXJzIGJlZm9yZSBjbG9zaW5nXG4gICAgICBjb25zdCByZW1vdmVQcm9taXNlcyA9IHRhYnNUb0Nsb3NlLm1hcCh0YWIgPT5cbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCB7IHR5cGU6ICdSRU1PVkVfQkVGT1JFVU5MT0FEX0xJU1RFTkVSUycgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIGJnTG9nZ2VyLmxvZyhgW1VuaWZpZWRUYWJNZ3JdIENvdWxkIG5vdCBzZW5kIHJlbW92ZSBiZWZvcmV1bmxvYWQgbWVzc2FnZSB0byB0YWIgJHt0YWIuaWR9YClcbiAgICAgICAgfSlcbiAgICAgIClcblxuICAgICAgYXdhaXQgUHJvbWlzZS5yYWNlKFtcbiAgICAgICAgUHJvbWlzZS5hbGwocmVtb3ZlUHJvbWlzZXMpLFxuICAgICAgICBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTAwKSlcbiAgICAgIF0pXG5cbiAgICAgIC8vIEFjdHVhbGx5IGNsb3NlIHRoZSBleHRyYSB0YWJzXG4gICAgICBhd2FpdCBjaHJvbWUudGFicy5yZW1vdmUodGFic1RvQ2xvc2UubWFwKHRhYiA9PiB0YWIuaWQpKVxuXG4gICAgICAvLyBDbGVhbiB1cCBsaXN0ZW5lcnMgZm9yIGNsb3NlZCB0YWJzXG4gICAgICB0YWJzVG9DbG9zZS5mb3JFYWNoKHRhYiA9PiBjbGVhbnVwVGFiTGlzdGVuZXJzKHRhYi5pZCkpXG4gICAgfVxuXG4gICAgbGV0IHRhcmdldFRhYlxuICAgIGlmIChwcmVmZXJyZWRUYWIpIHtcbiAgICAgIGJnTG9nZ2VyLmxvZyhgW1VuaWZpZWRUYWJNZ3JdIFJldXNpbmcgZXhpc3RpbmcgUmVkZGl0IHRhYiAke3ByZWZlcnJlZFRhYi5pZH0gZm9yIGF1dG9mbG93YClcblxuICAgICAgLy8gQ2xlYW4gdXAgYW55IG9sZCBsaXN0ZW5lcnMgZm9yIHRoaXMgdGFiIGJlZm9yZSB3ZSBzdGFydCBjb250cm9sbGluZyBpdFxuICAgICAgY2xlYW51cFRhYkxpc3RlbmVycyhwcmVmZXJyZWRUYWIuaWQpXG5cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEJlc3QtZWZmb3J0OiByZW1vdmUgYmVmb3JldW5sb2FkIGxpc3RlbmVycyBmcm9tIHRoZSB0YWIgd2UncmUgYWJvdXQgdG8gY29udHJvbFxuICAgICAgICBhd2FpdCBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShwcmVmZXJyZWRUYWIuaWQsIHtcbiAgICAgICAgICB0eXBlOiAnUkVNT1ZFX0JFRk9SRVVOTE9BRF9MSVNURU5FUlMnXG4gICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAvLyBJZ25vcmUgZXJyb3JzIGZyb20gdGFicyB0aGF0IGRvbid0IGhhdmUgdGhlIGNvbnRlbnQgc2NyaXB0XG4gICAgICAgICAgYmdMb2dnZXIubG9nKGBbVW5pZmllZFRhYk1ncl0gQ291bGQgbm90IHNlbmQgcmVtb3ZlIGJlZm9yZXVubG9hZCBtZXNzYWdlIHRvIHRhYiAke3ByZWZlcnJlZFRhYi5pZH1gKVxuICAgICAgICB9KVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBJZ25vcmUgZXJyb3JzIGhlcmU7IHRoZXkgc2hvdWxkbid0IGJsb2NrIGF1dG9mbG93XG4gICAgICB9XG5cbiAgICAgIHRhcmdldFRhYiA9IGF3YWl0IGNocm9tZS50YWJzLnVwZGF0ZShwcmVmZXJyZWRUYWIuaWQsIHsgdXJsOiB0YXJnZXRVcmwsIGFjdGl2ZTogdHJ1ZSB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBiZ0xvZ2dlci5sb2coJ1tVbmlmaWVkVGFiTWdyXSBObyBleGlzdGluZyBSZWRkaXQgdGFiIGZvdW5kOyBjcmVhdGluZyBuZXcgb25lIGZvciBhdXRvZmxvdycpXG5cbiAgICAgIHRhcmdldFRhYiA9IGF3YWl0IGNocm9tZS50YWJzLmNyZWF0ZSh7XG4gICAgICAgIHVybDogdGFyZ2V0VXJsLFxuICAgICAgICBhY3RpdmU6IHRydWVcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gVHJhY2sgdGhpcyB0YWIgYXMgdGhlIHVuaWZpZWQgUmVkZGl0IHRhYlxuICAgIGF3YWl0IHNhdmVVbmlmaWVkVGFiSWQodGFyZ2V0VGFiLmlkKVxuICAgIHNldEN1cnJlbnRDb250cm9sbGVkVGFiSWQodGFyZ2V0VGFiLmlkLCBPUEVSQVRJT05TLlJFRERJVClcblxuICAgIGJnTG9nZ2VyLmxvZyhgW1VuaWZpZWRUYWJNZ3JdIFVuaWZpZWQgUmVkZGl0IHRhYiBmb3IgYXV0b2Zsb3cgaXMgJHt0YXJnZXRUYWIuaWR9YClcbiAgICByZXR1cm4gdGFyZ2V0VGFiLmlkXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgYmdMb2dnZXIuZXJyb3IoJ1tVbmlmaWVkVGFiTWdyXSBGYWlsZWQgdG8gaW5pdGlhbGl6ZSB1bmlmaWVkIFJlZGRpdCB0YWIgZm9yIGF1dG9mbG93OicsIGVycm9yKVxuICAgIHRocm93IGVycm9yXG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvcnQgb3BlcmF0aW9uIHR5cGVzIGZvciBleHRlcm5hbCB1c2VcbiAqL1xuZXhwb3J0IHsgT1BFUkFUSU9OUyB9XG4iLCAiaW1wb3J0IHsgYmdMb2dnZXIgfSBmcm9tIFwiLi9sb2dnZXIuanNcIjsvKipcbiAqIE1lc3NhZ2UgSGFuZGxlcnMgTW9kdWxlXG4gKiBIYW5kbGVzIGFsbCBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UgZXZlbnRzIGFuZCB0YWIgbWFuYWdlbWVudCBvcGVyYXRpb25zXG4gKi9cblxuaW1wb3J0IHtcbiAgQXV0b0Zsb3dTdGF0ZU1hbmFnZXIsXG4gIFNNX1NURVBTLFxuICB0YWJTdGF0ZXMsXG4gIHByb2Nlc3NlZFRhYnMsXG4gIENIRUNLX0lOVEVSVkFMLFxuICBnZXRDaGVja0ludGVydmFsSWQsXG4gIHNldENoZWNrSW50ZXJ2YWxJZCxcbiAgdG91Y2hUYWJTdGF0ZVxufSBmcm9tICcuL3N0YXRlLW1hbmFnZXIuanMnXG5pbXBvcnQgeyBQb3N0RGF0YVNlcnZpY2UsIGZldGNoTmV4dFBvc3QgfSBmcm9tICcuL3Bvc3Qtc2VydmljZS5qcydcbmltcG9ydCB7XG4gIGdldFVuaWZpZWRUYWIsXG4gIGdldEV4dGVuc2lvblRhYixcbiAgZ2V0UmVkZGl0VGFiLFxuICBnZXRQb3N0Q3JlYXRpb25UYWIsXG4gIGdldFBvc3RDb2xsZWN0aW9uVGFiLFxuICByZWxvYWRVbmlmaWVkVGFiLFxuICBoYW5kbGVUYWJDbG9zZWQsXG4gIHJlZ2lzdGVyVGFiTGlzdGVuZXIsXG4gIGNsZWFudXBUYWJMaXN0ZW5lcnMsXG4gIGdldEN1cnJlbnRDb250cm9sbGVkVGFiLFxuICBPUEVSQVRJT05TLFxuICBjbG9zZUFsbFJlZGRpdFRhYnNBbmRPcGVuRnJlc2hcbn0gZnJvbSAnLi91bmlmaWVkLXRhYi1tYW5hZ2VyLmpzJ1xuXG4vLyBGaW5hbGl6ZSByZWxvYWQgbGlzdGVuZXJzIGFuZCB0aW1lb3V0c1xuY29uc3QgZmluYWxpemVSZWxvYWRMaXN0ZW5lcnMgPSB7fVxuY29uc3QgZmluYWxpemVSZWxvYWRUaW1lb3V0cyA9IHt9XG5cbi8vIFRyYWNrIGluLWZsaWdodCBHRVRfUE9TVFMgYWN0aW9ucyB0byBwcmV2ZW50IGR1cGxpY2F0ZXNcbmNvbnN0IGluRmxpZ2h0R2V0UG9zdHMgPSBuZXcgU2V0KClcblxuLyoqXG4gKiBMb2cgbWVzc2FnZSB0byBhIHNwZWNpZmljIHRhYlxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9nVG9UYWIodGFiSWQsIG1lc3NhZ2UpIHtcbiAgYmdMb2dnZXIubG9nKGBbQkcgTG9nIC0+IFRhYiAke3RhYklkfV0gJHttZXNzYWdlfWApXG4gIGlmICh0YWJJZCkge1xuICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKFxuICAgICAgdGFiSWQsXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdCR19MT0cnLFxuICAgICAgICBtZXNzYWdlOiBtZXNzYWdlXG4gICAgICB9XG4gICAgKS5jYXRjaCgoKSA9PiB7fSlcbiAgfVxufVxuXG4vKipcbiAqIFdhaXQgZm9yIGNvbnRlbnQgc2NyaXB0IHRvIGJlIHJlYWR5XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3YWl0Rm9yQ29udGVudFNjcmlwdCh0YWJJZCwgeyByZXRyaWVzID0gMTIsIGluaXRpYWxEZWxheU1zID0gMjUwIH0gPSB7fSkge1xuICBsZXQgZGVsYXlNcyA9IGluaXRpYWxEZWxheU1zXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmV0cmllczsgaSsrKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRhYiA9IGF3YWl0IGNocm9tZS50YWJzLmdldCh0YWJJZClcbiAgICAgIGlmICghdGFiIHx8IHRhYi5kaXNjYXJkZWQpIHtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZGVsYXlNcykpXG4gICAgICAgIGRlbGF5TXMgPSBNYXRoLm1pbigyMDAwLCBNYXRoLmZsb29yKGRlbGF5TXMgKiAxLjYpKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgaWYgKHRhYi5zdGF0dXMgIT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZGVsYXlNcykpXG4gICAgICAgIGRlbGF5TXMgPSBNYXRoLm1pbigyMDAwLCBNYXRoLmZsb29yKGRlbGF5TXMgKiAxLjYpKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwgeyB0eXBlOiAnUElORycgfSlcbiAgICAgIGlmIChyZXMgJiYgcmVzLnBvbmcpIHJldHVybiB0cnVlXG4gICAgfSBjYXRjaCAoZSkge1xuICAgIH1cbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBkZWxheU1zKSlcbiAgICBkZWxheU1zID0gTWF0aC5taW4oMjAwMCwgTWF0aC5mbG9vcihkZWxheU1zICogMS42KSlcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuLyoqXG4gKiBTZW5kIEdFVF9QT1NUUyBjb21tYW5kIHRvIGNvbnRlbnQgc2NyaXB0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kR2V0UG9zdHModGFiSWQsIHVzZXJOYW1lLCBzb3VyY2UpIHtcbiAgY29uc3QgcmVhZHkgPSBhd2FpdCB3YWl0Rm9yQ29udGVudFNjcmlwdCh0YWJJZClcbiAgaWYgKCFyZWFkeSkge1xuICAgIGJnTG9nZ2VyLmVycm9yKGBbQkddIENvbnRlbnQgc2NyaXB0IG5vdCByZWFjaGFibGUgaW4gdGFiICR7dGFiSWR9LCBjYW5ub3Qgc2VuZCBHRVRfUE9TVFMgKCR7c291cmNlfSlgKVxuICAgIGxvZ1RvVGFiKHRhYklkLCBgQ29udGVudCBzY3JpcHQgbm90IHJlYWNoYWJsZTsgc2tpcHBpbmcgcG9zdCBjb2xsZWN0aW9uICgke3NvdXJjZX0pLmApXG4gICAgZGVsZXRlIHRhYlN0YXRlc1t0YWJJZF1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHRyeSB7XG4gICAgYXdhaXQgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiSWQsIHtcbiAgICAgIHR5cGU6ICdSRURESVRfUE9TVF9NQUNISU5FX0dFVF9QT1NUUycsXG4gICAgICBwYXlsb2FkOiB7IHVzZXJOYW1lIH1cbiAgICB9KVxuICAgIHJldHVybiB0cnVlXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGJnTG9nZ2VyLmVycm9yKGBbQkddIEZhaWxlZCB0byBzZW5kIEdFVF9QT1NUUyAoJHtzb3VyY2V9KTpgLCBlcnIpXG4gICAgZGVsZXRlIHRhYlN0YXRlc1t0YWJJZF1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIGNsZWFuIHBvc3QgdGFiIGZvciBzdWJtaXNzaW9uIHVzaW5nIHVuaWZpZWQgdGFiIG1hbmFnZXJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUNsZWFuUG9zdFRhYih1c2VyTmFtZSwgcG9zdERhdGEpIHtcbiAgdHJ5IHtcbiAgICBiZ0xvZ2dlci5sb2coJ1tCR10gQ3JlYXRpbmcgY2xlYW4gcG9zdCB0YWIgdXNpbmcgdW5pZmllZCB0YWIgbWFuYWdlcicpXG5cbiAgICBjb25zdCBuZXdUYWJJZCA9IGF3YWl0IGdldFBvc3RDcmVhdGlvblRhYihwb3N0RGF0YSlcblxuICAgIHRhYlN0YXRlc1tuZXdUYWJJZF0gPSB7XG4gICAgICBzdGF0dXM6IFNNX1NURVBTLlBPU1RJTkcsXG4gICAgICB1c2VyTmFtZTogdXNlck5hbWUsXG4gICAgICBwb3N0RGF0YTogcG9zdERhdGEsXG4gICAgICBzdGVwU3RhcnRUaW1lOiBEYXRlLm5vdygpLFxuICAgICAgbGFzdEZlZWRiYWNrVGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgaXNQb3N0VGFiOiB0cnVlLFxuICAgICAgaXNDbGVhblRhYjogdHJ1ZVxuICAgIH1cblxuICAgIGNvbnN0IHRhYkxvYWRMaXN0ZW5lciA9ICh0YWJJZCwgY2hhbmdlSW5mbywgdGFiKSA9PiB7XG4gICAgICBpZiAodGFiSWQgPT09IG5ld1RhYklkICYmIGNoYW5nZUluZm8uc3RhdHVzID09PSAnY29tcGxldGUnKSB7XG4gICAgICAgIGNocm9tZS50YWJzLm9uVXBkYXRlZC5yZW1vdmVMaXN0ZW5lcih0YWJMb2FkTGlzdGVuZXIpXG5cbiAgICAgICAgYmdMb2dnZXIubG9nKGBbQkddIENsZWFuIHBvc3QgdGFiICR7bmV3VGFiSWR9IGxvYWRlZCwgVVJMOiAke3RhYi51cmx9YClcblxuICAgICAgICBpZiAoIXRhYi51cmwgfHwgIXRhYi51cmwuaW5jbHVkZXMoJy9zdWJtaXQnKSkge1xuICAgICAgICAgIGJnTG9nZ2VyLmVycm9yKGBbQkddIFRhYiAke25ld1RhYklkfSBpcyBub3Qgb24gc3VibWl0IHBhZ2U6ICR7dGFiLnVybH1gKVxuICAgICAgICAgIGRlbGV0ZSB0YWJTdGF0ZXNbbmV3VGFiSWRdXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBiZ0xvZ2dlci5sb2coYFtCR10gU2VuZGluZyBTVEFSVF9QT1NUX0NSRUFUSU9OIHRvIHRhYiAke25ld1RhYklkfWApXG4gICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UobmV3VGFiSWQsIHtcbiAgICAgICAgICAgIHR5cGU6ICdTVEFSVF9QT1NUX0NSRUFUSU9OJyxcbiAgICAgICAgICAgIHVzZXJOYW1lOiB1c2VyTmFtZSxcbiAgICAgICAgICAgIHBvc3REYXRhOiBwb3N0RGF0YVxuICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGJnTG9nZ2VyLmVycm9yKGBbQkddIEZhaWxlZCB0byBzZW5kIHBvc3QgZGF0YSB0byBjbGVhbiB0YWIgJHtuZXdUYWJJZH06YCwgZXJyKVxuICAgICAgICAgICAgZGVsZXRlIHRhYlN0YXRlc1tuZXdUYWJJZF1cbiAgICAgICAgICB9KVxuICAgICAgICB9LCAyMDAwKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJlZ2lzdGVyVGFiTGlzdGVuZXIobmV3VGFiSWQsIHRhYkxvYWRMaXN0ZW5lcilcbiAgICByZXR1cm4gbmV3VGFiSWRcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBiZ0xvZ2dlci5lcnJvcignW0JHXSBGYWlsZWQgdG8gY3JlYXRlIGNsZWFuIHBvc3QgdGFiOicsIGVycm9yKVxuICAgIHRocm93IGVycm9yXG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGUgb3IgcmV1c2UgYSBwb3N0IHRhYiBmb3Igc3VibWlzc2lvbiB1c2luZyB1bmlmaWVkIHRhYiBtYW5hZ2VyXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVPclJldXNlUG9zdFRhYih1c2VyTmFtZSwgcG9zdERhdGEpIHtcbiAgYmdMb2dnZXIubG9nKGBbQkddIENyZWF0aW5nL3JldXNpbmcgcG9zdCB0YWIgZm9yICR7dXNlck5hbWV9IHVzaW5nIHVuaWZpZWQgdGFiIG1hbmFnZXJgKVxuXG4gIHRyeSB7XG4gICAgLy8gVXNlIHVuaWZpZWQgdGFiIG1hbmFnZXIgdG8gZ2V0L3JldXNlIHRoZSBwb3N0IGNyZWF0aW9uIHRhYlxuICAgIGNvbnN0IHRhcmdldFRhYklkID0gYXdhaXQgZ2V0UG9zdENyZWF0aW9uVGFiKHBvc3REYXRhKVxuXG4gICAgYmdMb2dnZXIubG9nKGBbQkddIFVzaW5nIHVuaWZpZWQgdGFiICR7dGFyZ2V0VGFiSWR9IGZvciBwb3N0IHN1Ym1pc3Npb25gKVxuXG4gICAgdGFiU3RhdGVzW3RhcmdldFRhYklkXSA9IHtcbiAgICAgIHN0YXR1czogU01fU1RFUFMuUE9TVElORyxcbiAgICAgIHVzZXJOYW1lOiB1c2VyTmFtZSxcbiAgICAgIHBvc3REYXRhOiBwb3N0RGF0YSxcbiAgICAgIHN0ZXBTdGFydFRpbWU6IERhdGUubm93KCksXG4gICAgICBpc1Bvc3RUYWI6IHRydWVcbiAgICB9XG5cbiAgICBjb25zdCB0YWJMb2FkTGlzdGVuZXIgPSAodGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT4ge1xuICAgICAgaWYgKHRhYklkID09PSB0YXJnZXRUYWJJZCAmJiBjaGFuZ2VJbmZvLnN0YXR1cyA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgICBjaHJvbWUudGFicy5vblVwZGF0ZWQucmVtb3ZlTGlzdGVuZXIodGFiTG9hZExpc3RlbmVyKVxuXG4gICAgICAgIGJnTG9nZ2VyLmxvZyhgW0JHXSBQb3N0IHRhYiAke3RhcmdldFRhYklkfSBsb2FkZWQsIFVSTDogJHt0YWIudXJsfWApXG5cbiAgICAgICAgaWYgKCF0YWIudXJsIHx8ICF0YWIudXJsLmluY2x1ZGVzKCcvc3VibWl0JykpIHtcbiAgICAgICAgICBiZ0xvZ2dlci5lcnJvcihgW0JHXSBUYWIgJHt0YXJnZXRUYWJJZH0gaXMgbm90IG9uIHN1Ym1pdCBwYWdlOiAke3RhYi51cmx9YClcbiAgICAgICAgICBkZWxldGUgdGFiU3RhdGVzW3RhcmdldFRhYklkXVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgYmdMb2dnZXIubG9nKGBbQkddIFNlbmRpbmcgU1RBUlRfUE9TVF9DUkVBVElPTiB0byB0YWIgJHt0YXJnZXRUYWJJZH1gKVxuICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhcmdldFRhYklkLCB7XG4gICAgICAgICAgICB0eXBlOiAnU1RBUlRfUE9TVF9DUkVBVElPTicsXG4gICAgICAgICAgICB1c2VyTmFtZTogdXNlck5hbWUsXG4gICAgICAgICAgICBwb3N0RGF0YTogcG9zdERhdGFcbiAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBiZ0xvZ2dlci5lcnJvcihgW0JHXSBGYWlsZWQgdG8gc2VuZCBwb3N0IGRhdGEgdG8gdGFiICR7dGFyZ2V0VGFiSWR9OmAsIGVycilcbiAgICAgICAgICAgIGRlbGV0ZSB0YWJTdGF0ZXNbdGFyZ2V0VGFiSWRdXG4gICAgICAgICAgfSlcbiAgICAgICAgfSwgMjAwMClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZWdpc3RlclRhYkxpc3RlbmVyKHRhcmdldFRhYklkLCB0YWJMb2FkTGlzdGVuZXIpXG5cbiAgICByZXR1cm4gdGFyZ2V0VGFiSWRcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBiZ0xvZ2dlci5lcnJvcignW0JHXSBGYWlsZWQgdG8gY3JlYXRlL3JldXNlIHBvc3QgdGFiOicsIGVycm9yKVxuICAgIHRocm93IGVycm9yXG4gIH1cbn1cblxuLyoqXG4gKiBGaW5hbGl6ZSBhdXRvLWZsb3cgYnkgbmF2aWdhdGluZyB0byBzdWJtaXR0ZWQgcG9zdHNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbmFsaXplQXV0b0Zsb3dUb1N1Ym1pdHRlZCh0YWJJZCwgdXNlck5hbWUpIHtcbiAgaWYgKCF0YWJJZCB8fCAhdXNlck5hbWUpIHJldHVyblxuICBjb25zdCBjbGVhblVzZXJuYW1lID0gdXNlck5hbWUucmVwbGFjZSgndS8nLCAnJylcbiAgY29uc3Qgc3VibWl0dGVkVXJsID0gYGh0dHBzOi8vd3d3LnJlZGRpdC5jb20vdXNlci8ke2NsZWFuVXNlcm5hbWV9L3N1Ym1pdHRlZC9gXG5cbiAgaWYgKGZpbmFsaXplUmVsb2FkTGlzdGVuZXJzW3RhYklkXSkge1xuICAgIGNocm9tZS50YWJzLm9uVXBkYXRlZC5yZW1vdmVMaXN0ZW5lcihmaW5hbGl6ZVJlbG9hZExpc3RlbmVyc1t0YWJJZF0pXG4gICAgZGVsZXRlIGZpbmFsaXplUmVsb2FkTGlzdGVuZXJzW3RhYklkXVxuICB9XG5cbiAgaWYgKGZpbmFsaXplUmVsb2FkVGltZW91dHNbdGFiSWRdKSB7XG4gICAgY2xlYXJUaW1lb3V0KGZpbmFsaXplUmVsb2FkVGltZW91dHNbdGFiSWRdKVxuICAgIGRlbGV0ZSBmaW5hbGl6ZVJlbG9hZFRpbWVvdXRzW3RhYklkXVxuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCB0YWIgPSBhd2FpdCBjaHJvbWUudGFicy5nZXQodGFiSWQpXG4gICAgaWYgKHRhYj8udXJsICYmIHRhYi51cmwuaW5jbHVkZXMoYC91c2VyLyR7Y2xlYW5Vc2VybmFtZX0vYCkgJiYgdGFiLnVybC5pbmNsdWRlcygnL3N1Ym1pdHRlZCcpKSB7XG4gICAgICBjaHJvbWUudGFicy5yZWxvYWQodGFiSWQpLmNhdGNoKCgpID0+IHt9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gIH1cblxuICBjb25zdCBsaXN0ZW5lciA9ICh1cGRhdGVkVGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT4ge1xuICAgIGlmICh1cGRhdGVkVGFiSWQgIT09IHRhYklkKSByZXR1cm5cbiAgICBpZiAoY2hhbmdlSW5mby5zdGF0dXMgIT09ICdjb21wbGV0ZScpIHJldHVyblxuICAgIGlmICghdGFiPy51cmwgfHwgIXRhYi51cmwuaW5jbHVkZXMoYC91c2VyLyR7Y2xlYW5Vc2VybmFtZX0vYCkgfHwgIXRhYi51cmwuaW5jbHVkZXMoJy9zdWJtaXR0ZWQnKSkgcmV0dXJuXG5cbiAgICBjaHJvbWUudGFicy5vblVwZGF0ZWQucmVtb3ZlTGlzdGVuZXIobGlzdGVuZXIpXG4gICAgZGVsZXRlIGZpbmFsaXplUmVsb2FkTGlzdGVuZXJzW3RhYklkXVxuXG4gICAgaWYgKGZpbmFsaXplUmVsb2FkVGltZW91dHNbdGFiSWRdKSB7XG4gICAgICBjbGVhclRpbWVvdXQoZmluYWxpemVSZWxvYWRUaW1lb3V0c1t0YWJJZF0pXG4gICAgICBkZWxldGUgZmluYWxpemVSZWxvYWRUaW1lb3V0c1t0YWJJZF1cbiAgICB9XG5cbiAgICBjaHJvbWUudGFicy5yZWxvYWQodGFiSWQpLmNhdGNoKCgpID0+IHt9KVxuICB9XG5cbiAgZmluYWxpemVSZWxvYWRMaXN0ZW5lcnNbdGFiSWRdID0gbGlzdGVuZXJcbiAgY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKGxpc3RlbmVyKVxuXG4gIGZpbmFsaXplUmVsb2FkVGltZW91dHNbdGFiSWRdID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgaWYgKGZpbmFsaXplUmVsb2FkTGlzdGVuZXJzW3RhYklkXSA9PT0gbGlzdGVuZXIpIHtcbiAgICAgIGNocm9tZS50YWJzLm9uVXBkYXRlZC5yZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcilcbiAgICAgIGRlbGV0ZSBmaW5hbGl6ZVJlbG9hZExpc3RlbmVyc1t0YWJJZF1cbiAgICB9XG4gICAgZGVsZXRlIGZpbmFsaXplUmVsb2FkVGltZW91dHNbdGFiSWRdXG4gIH0sIDMwMDAwKVxuXG4gIC8vIFVzZSB1bmlmaWVkIHRhYiBtYW5hZ2VyIHRvIHJlbG9hZCB0aGUgdGFiIHdpdGggdGhlIG5ldyBVUkxcbiAgdHJ5IHtcbiAgICBhd2FpdCByZWxvYWRVbmlmaWVkVGFiKHN1Ym1pdHRlZFVybCwgT1BFUkFUSU9OUy5QT1NUX0NPTExFQ1RJT04pXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgYmdMb2dnZXIuZXJyb3IoJ1tCR10gRmFpbGVkIHRvIHJlbG9hZCB1bmlmaWVkIHRhYiBmb3Igc3VibWl0dGVkIHBvc3RzOicsIGVycm9yKVxuICB9XG59XG5cbi8qKlxuICogUHJvY2VlZCB3aXRoIHBvc3QgY3JlYXRpb25cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb2NlZWRXaXRoUG9zdENyZWF0aW9uKHVzZXJOYW1lLCBtb25pdG9yaW5nVGFiSWQpIHtcbiAgYmdMb2dnZXIubG9nKCdbQkddIFByb2NlZWRpbmcgd2l0aCBwb3N0IGNyZWF0aW9uJylcblxuICBhd2FpdCBBdXRvRmxvd1N0YXRlTWFuYWdlci5zYXZlU3RhdGUoJ2NyZWF0aW5nX3Bvc3QnLCB7IHVzZXJOYW1lLCB0YXJnZXRBY3Rpb246ICdjcmVhdGUnIH0pXG5cbiAgY29uc3Qgc3RhdGUgPSB0YWJTdGF0ZXNbbW9uaXRvcmluZ1RhYklkXVxuICBpZiAoc3RhdGUgJiYgc3RhdGUucG9zdENyZWF0aW9uSW5Qcm9ncmVzcykge1xuICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBQb3N0IGNyZWF0aW9uIGFscmVhZHkgaW4gcHJvZ3Jlc3MsIHNraXBwaW5nIGR1cGxpY2F0ZSBjYWxsJylcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmIChzdGF0ZSkge1xuICAgIHN0YXRlLnBvc3RDcmVhdGlvbkluUHJvZ3Jlc3MgPSB0cnVlXG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IG5ld1Bvc3REYXRhID0gYXdhaXQgZmV0Y2hOZXh0UG9zdCgpXG5cbiAgICBpZiAobmV3UG9zdERhdGEpIHtcbiAgICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBDcmVhdGluZyBuZXcgcG9zdCB0YWIgZm9yIGZyZXNoIHBvc3QnKVxuXG4gICAgICBjcmVhdGVDbGVhblBvc3RUYWIodXNlck5hbWUsIG5ld1Bvc3REYXRhKVxuICAgICAgICAudGhlbigobmV3VGFiSWQpID0+IHtcbiAgICAgICAgICBiZ0xvZ2dlci5sb2coYFtCR10gQ3JlYXRlZCBuZXcgcG9zdCB0YWIgJHtuZXdUYWJJZH0gZm9yICR7dXNlck5hbWV9YClcbiAgICAgICAgICBkZWxldGUgdGFiU3RhdGVzW21vbml0b3JpbmdUYWJJZF1cbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBiZ0xvZ2dlci5lcnJvcignW0JHXSBGYWlsZWQgdG8gY3JlYXRlIHBvc3QgdGFiOicsIGVycilcbiAgICAgICAgICBkZWxldGUgdGFiU3RhdGVzW21vbml0b3JpbmdUYWJJZF1cbiAgICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgYmdMb2dnZXIubG9nKCdbQkddIEZhaWxlZCB0byBnZW5lcmF0ZSBuZXcgcG9zdCBkYXRhJylcbiAgICAgIGRlbGV0ZSB0YWJTdGF0ZXNbbW9uaXRvcmluZ1RhYklkXVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBiZ0xvZ2dlci5lcnJvcignW0JHXSBFcnJvciBpbiBwcm9jZWVkV2l0aFBvc3RDcmVhdGlvbjonLCBlcnJvcilcbiAgICBkZWxldGUgdGFiU3RhdGVzW21vbml0b3JpbmdUYWJJZF1cbiAgfVxufVxuXG4vKipcbiAqIFN0YXJ0IGF1dG9tYXRpb24gZm9yIGEgdGFiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFydEF1dG9tYXRpb25Gb3JUYWIodGFiSWQsIHVzZXJOYW1lKSB7XG4gIGJnTG9nZ2VyLmxvZyhgW0JHXSBTdGFydGluZyBhdXRvbWF0aW9uIGZvciB0YWIgJHt0YWJJZH0gd2l0aCB1c2VyICR7dXNlck5hbWV9YClcblxuICBjb25zdCBjdXJyZW50SW50ZXJ2YWxJZCA9IGdldENoZWNrSW50ZXJ2YWxJZCgpXG4gIGlmIChjdXJyZW50SW50ZXJ2YWxJZCkgY2xlYXJJbnRlcnZhbChjdXJyZW50SW50ZXJ2YWxJZClcblxuICBzZXRDaGVja0ludGVydmFsSWQoc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgIHRyaWdnZXJQZXJpb2RpY0NoZWNrKHRhYklkLCB1c2VyTmFtZSlcbiAgfSwgQ0hFQ0tfSU5URVJWQUwpKVxuXG4gIHRyaWdnZXJQZXJpb2RpY0NoZWNrKHRhYklkLCB1c2VyTmFtZSlcbn1cblxuLyoqXG4gKiBUcmlnZ2VyIHBlcmlvZGljIGNoZWNrIGZvciBwb3N0IGNyZWF0aW9uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0cmlnZ2VyUGVyaW9kaWNDaGVjayh0YWJJZCwgdXNlck5hbWUpIHtcbiAgY29uc3QgY3VycmVudFN0YXRlID0gdGFiU3RhdGVzW3RhYklkXVxuXG4gIGlmIChjdXJyZW50U3RhdGUgJiYgY3VycmVudFN0YXRlLnN0YXR1cyA9PT0gU01fU1RFUFMuUE9TVElORykge1xuICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBTa2lwcGluZyBwZXJpb2RpYyBjaGVjayAtIFBvc3RpbmcgaW4gcHJvZ3Jlc3MgKExvY2tlZCknKVxuICAgIHJldHVyblxuICB9XG5cbiAgaWYgKGN1cnJlbnRTdGF0ZSkge1xuICAgIGJnTG9nZ2VyLmxvZyhgW0JHXSBTa2lwcGluZyBwZXJpb2RpYyBjaGVjayAtIEJ1c3kgaW4gc3RhdGU6ICR7Y3VycmVudFN0YXRlLnN0YXR1c31gKVxuICAgIHJldHVyblxuICB9XG5cbiAgYmdMb2dnZXIubG9nKGBbQkddIFRyaWdnZXJpbmcgcGVyaW9kaWMgcG9zdCBjaGVjayBmb3IgJHt1c2VyTmFtZX1gKVxuXG4gIHRyeSB7XG4gICAgY29uc3QgeyBsYXRlc3RQb3N0c0RhdGEgfSA9IGF3YWl0IGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ2xhdGVzdFBvc3RzRGF0YSddKVxuICAgIGNvbnN0IGNhY2hlZFVzZXIgPSBsYXRlc3RQb3N0c0RhdGE/LnVzZXJuYW1lIHx8IGxhdGVzdFBvc3RzRGF0YT8udXNlck5hbWUgfHwgbnVsbFxuICAgIGlmIChsYXRlc3RQb3N0c0RhdGEgJiYgKCFjYWNoZWRVc2VyIHx8IGNhY2hlZFVzZXIucmVwbGFjZSgndS8nLCAnJykgPT09IHVzZXJOYW1lLnJlcGxhY2UoJ3UvJywgJycpKSkge1xuICAgICAgY29uc3Qgbm9ybWFsaXplZCA9IFBvc3REYXRhU2VydmljZS5ub3JtYWxpemVMYXRlc3RQb3N0c0RhdGEobGF0ZXN0UG9zdHNEYXRhLCB1c2VyTmFtZSlcbiAgICAgIGNvbnN0IGxhc3RVcGRhdGVkID0gbm9ybWFsaXplZD8ubGFzdFVwZGF0ZWRcbiAgICAgIGlmIChub3JtYWxpemVkICYmIGxhc3RVcGRhdGVkICYmIERhdGUubm93KCkgLSBsYXN0VXBkYXRlZCA8IDUgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgUG9zdERhdGFTZXJ2aWNlLnNob3VsZENyZWF0ZVBvc3Qobm9ybWFsaXplZClcbiAgICAgICAgaWYgKCFyZXN1bHQ/LnNob3VsZENyZWF0ZSkge1xuICAgICAgICAgIGF3YWl0IEF1dG9GbG93U3RhdGVNYW5hZ2VyLmNsZWFyU3RhdGUodXNlck5hbWUpXG4gICAgICAgICAgUG9zdERhdGFTZXJ2aWNlLnNhdmVFeGVjdXRpb25SZXN1bHQoe1xuICAgICAgICAgICAgc3RhdHVzOiAnc2tpcHBlZCcsXG4gICAgICAgICAgICBwb3N0UmVzdWx0OiAnbm9uZScsXG4gICAgICAgICAgICBwb3N0SWQ6IG51bGwsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IG51bGwsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAgICAgICB9KVxuICAgICAgICAgIGZpbmFsaXplQXV0b0Zsb3dUb1N1Ym1pdHRlZCh0YWJJZCwgdXNlck5hbWUpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgfVxuXG4gIGNvbnN0IGNsZWFuVXNlcm5hbWUgPSB1c2VyTmFtZS5yZXBsYWNlKCd1LycsICcnKVxuICBjb25zdCBkaXJlY3RQb3N0c1VybCA9IGBodHRwczovL3d3dy5yZWRkaXQuY29tL3VzZXIvJHtjbGVhblVzZXJuYW1lfS9zdWJtaXR0ZWQvYFxuXG4gIGJnTG9nZ2VyLmxvZyhgW0JHXSBcdUQ4M0RcdURFODAgVXNpbmcgZGlyZWN0IFVSTCBuYXZpZ2F0aW9uIG9wdGltaXphdGlvbjogJHtkaXJlY3RQb3N0c1VybH1gKVxuXG4gIHRhYlN0YXRlc1t0YWJJZF0gPSB7XG4gICAgc3RhdHVzOiBTTV9TVEVQUy5DT0xMRUNUSU5HX1BPU1RTLFxuICAgIHVzZXJOYW1lOiB1c2VyTmFtZSxcbiAgICBzdGVwU3RhcnRUaW1lOiBEYXRlLm5vdygpLFxuICAgIGxhc3RGZWVkYmFja1RpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICBhZHZhbmNlZFRvTmF2aWdhdGluZ1Bvc3RzOiB0cnVlLFxuICAgIGFkdmFuY2VkVG9Db2xsZWN0aW5nOiBmYWxzZSxcbiAgICB1c2VkRGlyZWN0TmF2aWdhdGlvbjogdHJ1ZVxuICB9XG5cbiAgLy8gVXNlIHVuaWZpZWQgdGFiIG1hbmFnZXIgdG8gcmVsb2FkIHRoZSB0YWIgd2l0aCB0aGUgbmV3IFVSTFxuICB0cnkge1xuICAgIGF3YWl0IHJlbG9hZFVuaWZpZWRUYWIoZGlyZWN0UG9zdHNVcmwsIE9QRVJBVElPTlMuUE9TVF9DT0xMRUNUSU9OKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGJnTG9nZ2VyLmVycm9yKCdbQkddIEZhaWxlZCB0byByZWxvYWQgdW5pZmllZCB0YWIgZm9yIHBvc3RzIGNvbGxlY3Rpb246JywgZXJyb3IpXG4gICAgbG9nVG9UYWIodGFiSWQsIGBFcnJvciBuYXZpZ2F0aW5nIHRvIHBvc3RzIFVSTDogJHtlcnJvci5tZXNzYWdlfWApXG4gICAgZGVsZXRlIHRhYlN0YXRlc1t0YWJJZF1cbiAgfVxuXG4gIGNvbnN0IHRhYkxvYWRCYWNrdXBMaXN0ZW5lciA9ICh1cGRhdGVkVGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT4ge1xuICAgIGlmICh1cGRhdGVkVGFiSWQgPT09IHRhYklkICYmIGNoYW5nZUluZm8uc3RhdHVzID09PSAnY29tcGxldGUnICYmIHRhYi51cmwuaW5jbHVkZXMoJy9zdWJtaXR0ZWQnKSkge1xuICAgICAgY29uc3Qgc3RhdGUgPSB0YWJTdGF0ZXNbdGFiSWRdXG4gICAgICBpZiAoc3RhdGUgJiYgc3RhdGUudXNlZERpcmVjdE5hdmlnYXRpb24gJiYgIXN0YXRlLmFkdmFuY2VkVG9Db2xsZWN0aW5nKSB7XG4gICAgICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBCYWNrdXAgdHJpZ2dlcjogVGFiIGxvYWRlZCwgc2VuZGluZyBHRVRfUE9TVFMgY29tbWFuZCcpXG4gICAgICAgIHN0YXRlLmFkdmFuY2VkVG9Db2xsZWN0aW5nID0gdHJ1ZVxuICAgICAgICBsb2dUb1RhYih0YWJJZCwgJ0JhY2t1cCB0cmlnZ2VyOiBUYWIgZnVsbHkgbG9hZGVkLCBzdGFydGluZyBwb3N0IGNvbGxlY3Rpb24uJylcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBzZW5kR2V0UG9zdHModGFiSWQsIHN0YXRlLnVzZXJOYW1lLCAnYmFja3VwX3RyaWdnZXInKVxuICAgICAgICB9LCAxMDAwKVxuXG4gICAgICAgIGNocm9tZS50YWJzLm9uVXBkYXRlZC5yZW1vdmVMaXN0ZW5lcih0YWJMb2FkQmFja3VwTGlzdGVuZXIpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKHRhYkxvYWRCYWNrdXBMaXN0ZW5lcilcblxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBjaHJvbWUudGFicy5vblVwZGF0ZWQucmVtb3ZlTGlzdGVuZXIodGFiTG9hZEJhY2t1cExpc3RlbmVyKVxuICB9LCAzMDAwMClcbn1cblxuLyoqXG4gKiBDaGVjayBhbmQgYWR2YW5jZSBzdGF0ZSBiYXNlZCBvbiBVUkwgY2hhbmdlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tBbmRBZHZhbmNlU3RhdGUodGFiSWQsIHN0YXRlLCB1cmwpIHtcbiAgYmdMb2dnZXIubG9nKGBbQXV0byBDaGVja10gQ2hlY2tpbmcgc3RhdGUgZm9yIHRhYiAke3RhYklkfS4gU3RhdHVzOiAke3N0YXRlLnN0YXR1c30sIFVSTDogJHt1cmx9YClcblxuICB0b3VjaFRhYlN0YXRlKHN0YXRlKVxuXG4gIGlmIChzdGF0ZS5zdGF0dXMgPT09IFNNX1NURVBTLk5BVklHQVRJTkdfUFJPRklMRSkge1xuICAgIGlmICh1cmwuaW5jbHVkZXMoc3RhdGUudXNlck5hbWUucmVwbGFjZSgndS8nLCAnJykpKSB7XG4gICAgICBpZiAoIXN0YXRlLmFkdmFuY2VkVG9OYXZpZ2F0aW5nUG9zdHMpIHtcbiAgICAgICAgc3RhdGUuYWR2YW5jZWRUb05hdmlnYXRpbmdQb3N0cyA9IHRydWVcbiAgICAgICAgbG9nVG9UYWIodGFiSWQsICdGYXN0LXRyYWNrOiBMYW5kZWQgb24gcHJvZmlsZSBwYWdlLiBBZHZhbmNpbmcgdG8gTkFWSUdBVElOR19QT1NUUy4nKVxuICAgICAgICBzdGF0ZS5zdGF0dXMgPSBTTV9TVEVQUy5OQVZJR0FUSU5HX1BPU1RTXG5cbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiSWQsIHtcbiAgICAgICAgICB0eXBlOiAnUkVERElUX1BPU1RfTUFDSElORV9OQVZJR0FURV9QT1NUUycsXG4gICAgICAgICAgcGF5bG9hZDogeyB1c2VyTmFtZTogc3RhdGUudXNlck5hbWUgfVxuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgYmdMb2dnZXIuZXJyb3IoJ1tBdXRvIENoZWNrXSBGYWlsZWQgdG8gc2VuZCBOQVZJR0FURV9QT1NUUzonLCBlcnIpXG4gICAgICAgICAgbG9nVG9UYWIodGFiSWQsIGBFcnJvciBzZW5kaW5nIE5BVklHQVRFX1BPU1RTOiAke2Vyci5tZXNzYWdlfWApXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKHN0YXRlLnN0YXR1cyA9PT0gU01fU1RFUFMuTkFWSUdBVElOR19QT1NUUykge1xuICAgIGlmICh1cmwuaW5jbHVkZXMoJy9zdWJtaXR0ZWQnKSkge1xuICAgICAgaWYgKCFzdGF0ZS5hZHZhbmNlZFRvQ29sbGVjdGluZykge1xuICAgICAgICBzdGF0ZS5hZHZhbmNlZFRvQ29sbGVjdGluZyA9IHRydWVcbiAgICAgICAgbG9nVG9UYWIodGFiSWQsICdGYXN0LXRyYWNrOiBMYW5kZWQgb24gcG9zdHMgcGFnZS4gQWR2YW5jaW5nIHRvIENPTExFQ1RJTkdfUE9TVFMuJylcbiAgICAgICAgc3RhdGUuc3RhdHVzID0gU01fU1RFUFMuQ09MTEVDVElOR19QT1NUU1xuXG4gICAgICAgIHNlbmRHZXRQb3N0cyh0YWJJZCwgc3RhdGUudXNlck5hbWUsICdmYXN0X3RyYWNrX25hdmlnYXRpbmdfcG9zdHMnKVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChzdGF0ZS5zdGF0dXMgPT09IFNNX1NURVBTLkNPTExFQ1RJTkdfUE9TVFMgJiYgc3RhdGUudXNlZERpcmVjdE5hdmlnYXRpb24pIHtcbiAgICBpZiAodXJsLmluY2x1ZGVzKCcvc3VibWl0dGVkJykgJiYgIXN0YXRlLmFkdmFuY2VkVG9Db2xsZWN0aW5nKSB7XG4gICAgICBzdGF0ZS5hZHZhbmNlZFRvQ29sbGVjdGluZyA9IHRydWVcbiAgICAgIGxvZ1RvVGFiKHRhYklkLCAnRGlyZWN0IG5hdmlnYXRpb246IExhbmRlZCBvbiBwb3N0cyBwYWdlLiBTdGFydGluZyBwb3N0IGNvbGxlY3Rpb24uJylcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHNlbmRHZXRQb3N0cyh0YWJJZCwgc3RhdGUudXNlck5hbWUsICdkaXJlY3RfbmF2aWdhdGlvbicpXG4gICAgICB9LCAyMDAwKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEhhbmRsZSBDT05URU5UX1NDUklQVF9SRUFEWSBtZXNzYWdlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVDb250ZW50U2NyaXB0UmVhZHkodGFiSWQsIHVybCkge1xuICBjb25zdCBzdGF0ZSA9IHRhYlN0YXRlc1t0YWJJZF1cbiAgaWYgKHN0YXRlKSB7XG4gICAgYmdMb2dnZXIubG9nKGBDb250ZW50IHNjcmlwdCByZWFkeSBpbiB0YWIgJHt0YWJJZH0gKFN0YXRlOiAke3N0YXRlLnN0YXR1c30pLiBVUkw6ICR7dXJsfWApXG4gICAgY2hlY2tBbmRBZHZhbmNlU3RhdGUodGFiSWQsIHN0YXRlLCB1cmwpXG4gIH1cbn1cblxuLyoqXG4gKiBIYW5kbGUgQUNUSU9OX0NPTVBMRVRFRCBtZXNzYWdlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVBY3Rpb25Db21wbGV0ZWQodGFiSWQsIGFjdGlvbiwgc3VjY2VzcywgZGF0YSkge1xuICBiZ0xvZ2dlci5sb2coYFtCR10gaGFuZGxlQWN0aW9uQ29tcGxldGVkIGNhbGxlZCBmb3IgdGFiICR7dGFiSWR9LCBhY3Rpb24gJHthY3Rpb259YClcblxuICBjb25zdCBzdGF0ZSA9IHRhYlN0YXRlc1t0YWJJZF1cbiAgaWYgKCFzdGF0ZSkge1xuICAgIGJnTG9nZ2VyLmxvZyhgW0JHXSBTdGF0ZSBhbHJlYWR5IGNsZWFyZWQgZm9yIHRhYiAke3RhYklkfS4gQWN0aW9uICR7YWN0aW9ufSB3YXMgbGlrZWx5IHRoZSBmaW5hbCBzdGVwLmApXG4gICAgcmV0dXJuXG4gIH1cblxuICBsb2dUb1RhYih0YWJJZCwgYEFjdGlvbiBjb21wbGV0ZWQgaW4gdGFiICR7dGFiSWR9OiAke2FjdGlvbn0gKFN1Y2Nlc3M6ICR7c3VjY2Vzc30pYClcblxuICB0b3VjaFRhYlN0YXRlKHN0YXRlKVxuXG4gIGlmICghc3VjY2Vzcykge1xuICAgIGJnTG9nZ2VyLndhcm4oYEFjdGlvbiAke2FjdGlvbn0gZmFpbGVkLiBBYm9ydGluZyBhdXRvbWF0aW9uLmApXG4gICAgZGVsZXRlIHRhYlN0YXRlc1t0YWJJZF1cbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmIChhY3Rpb24gPT09ICdOQVZJR0FURV9QUk9GSUxFJyAmJiBzdGF0ZS5zdGF0dXMgPT09IFNNX1NURVBTLk5BVklHQVRJTkdfUFJPRklMRSkge1xuICAgIGlmICghc3RhdGUuYWR2YW5jZWRUb05hdmlnYXRpbmdQb3N0cykge1xuICAgICAgc3RhdGUuYWR2YW5jZWRUb05hdmlnYXRpbmdQb3N0cyA9IHRydWVcbiAgICAgIGxvZ1RvVGFiKHRhYklkLCAnQWR2YW5jaW5nIGZyb20gTkFWSUdBVElOR19QUk9GSUxFIHRvIE5BVklHQVRJTkdfUE9TVFMnKVxuXG4gICAgICBzdGF0ZS5zdGF0dXMgPSBTTV9TVEVQUy5OQVZJR0FUSU5HX1BPU1RTXG4gICAgICBzdGF0ZS5zdGVwU3RhcnRUaW1lID0gRGF0ZS5ub3coKVxuICAgICAgdG91Y2hUYWJTdGF0ZShzdGF0ZSlcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGxvZ1RvVGFiKHRhYklkLCAnU2VuZGluZyBOQVZJR0FURV9QT1NUUyBjb21tYW5kJylcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiSWQsIHtcbiAgICAgICAgICB0eXBlOiAnUkVERElUX1BPU1RfTUFDSElORV9OQVZJR0FURV9QT1NUUycsXG4gICAgICAgICAgcGF5bG9hZDogeyB1c2VyTmFtZTogc3RhdGUudXNlck5hbWUgfVxuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiBiZ0xvZ2dlci5lcnJvcihgW1N0YXRlIE1hY2hpbmVdIEVycm9yIHNlbmRpbmcgTkFWSUdBVEVfUE9TVFM6YCwgZXJyKSlcbiAgICAgIH0sIDE1MDApXG4gICAgfSBlbHNlIHtcbiAgICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBBbHJlYWR5IGFkdmFuY2VkIHRvIE5BVklHQVRJTkdfUE9TVFMgdmlhIGZhc3QtdHJhY2suIFNraXBwaW5nLicpXG4gICAgfVxuICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ05BVklHQVRFX1BPU1RTJyAmJiBzdGF0ZS5zdGF0dXMgPT09IFNNX1NURVBTLk5BVklHQVRJTkdfUE9TVFMpIHtcbiAgICBpZiAoIXN0YXRlLmFkdmFuY2VkVG9Db2xsZWN0aW5nKSB7XG4gICAgICBzdGF0ZS5hZHZhbmNlZFRvQ29sbGVjdGluZyA9IHRydWVcbiAgICAgIGxvZ1RvVGFiKHRhYklkLCAnQWR2YW5jaW5nIGZyb20gTkFWSUdBVElOR19QT1NUUyB0byBDT0xMRUNUSU5HX1BPU1RTJylcblxuICAgICAgc3RhdGUuc3RhdHVzID0gU01fU1RFUFMuQ09MTEVDVElOR19QT1NUU1xuICAgICAgc3RhdGUuc3RlcFN0YXJ0VGltZSA9IERhdGUubm93KClcbiAgICAgIHRvdWNoVGFiU3RhdGUoc3RhdGUpXG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBsb2dUb1RhYih0YWJJZCwgJ1NlbmRpbmcgR0VUX1BPU1RTIGNvbW1hbmQnKVxuICAgICAgICBzZW5kR2V0UG9zdHModGFiSWQsIHN0YXRlLnVzZXJOYW1lLCAnc3RhdGVfbWFjaGluZV9uYXZpZ2F0ZV9wb3N0cycpXG4gICAgICB9LCAxNTAwKVxuICAgIH0gZWxzZSB7XG4gICAgICBiZ0xvZ2dlci5sb2coJ1tCR10gQWxyZWFkeSBhZHZhbmNlZCB0byBDT0xMRUNUSU5HX1BPU1RTIHZpYSBmYXN0LXRyYWNrLiBTa2lwcGluZy4nKVxuICAgIH1cbiAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICdOQVZJR0FURV9QT1NUUycgJiYgc3RhdGUuc3RhdHVzID09PSBTTV9TVEVQUy5ERUxFVElOR19QT1NUKSB7XG4gICAgYmdMb2dnZXIubG9nKCdbQkddIE5BVklHQVRFX1BPU1RTIGNvbXBsZXRlZCBmb3IgZGVsZXRpb24sIG5vdyBzZW5kaW5nIERFTEVURV9QT1NUIGNvbW1hbmQnKVxuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBsb2dUb1RhYih0YWJJZCwgJ1NlbmRpbmcgREVMRVRFX1BPU1QgY29tbWFuZCcpXG4gICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwge1xuICAgICAgICB0eXBlOiAnUkVERElUX1BPU1RfTUFDSElORV9ERUxFVEVfUE9TVCcsXG4gICAgICAgIHBheWxvYWQ6IHsgcG9zdDogc3RhdGUubGFzdFBvc3RUb0RlbGV0ZSB9XG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGJnTG9nZ2VyLmVycm9yKCdbQkddIFx1Mjc0QyBGYWlsZWQgdG8gc2VuZCBkZWxldGUgY29tbWFuZDonLCBlcnIpXG4gICAgICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBcdTI2QTBcdUZFMEYgRkFMTEJBQ0s6IFByb2NlZWRpbmcgd2l0aCBwb3N0IGNyZWF0aW9uIGFueXdheScpXG4gICAgICAgIC8vIERvbid0IHNhdmUgZXhlY3V0aW9uIHJlc3VsdCBmb3IgdGhpcyBzcGVjaWZpYyBlcnJvciB0byBhdm9pZCBVSSBlcnJvciBtZXNzYWdlc1xuICAgICAgICBwcm9jZWVkV2l0aFBvc3RDcmVhdGlvbihzdGF0ZS51c2VyTmFtZSwgdGFiSWQpXG4gICAgICB9KVxuICAgIH0sIDIwMDApXG4gIH0gZWxzZSBpZiAoYWN0aW9uID09PSAnR0VUX1BPU1RTJykge1xuICAgIGF3YWl0IGhhbmRsZUdldFBvc3RzQWN0aW9uKHRhYklkLCBzdGF0ZSwgZGF0YSlcbiAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICdQT1NUX0NSRUFUSU9OX0NPTVBMRVRFRCcpIHtcbiAgICBhd2FpdCBoYW5kbGVQb3N0Q3JlYXRpb25Db21wbGV0ZWQodGFiSWQsIHN0YXRlLCBzdWNjZXNzLCBkYXRhKVxuICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ0RFTEVURV9QT1NUX0NPTVBMRVRFRCcpIHtcbiAgICBhd2FpdCBoYW5kbGVEZWxldGVQb3N0Q29tcGxldGVkKHRhYklkLCBzdGF0ZSwgc3VjY2VzcywgZGF0YSlcbiAgfVxufVxuXG4vKipcbiAqIEhhbmRsZSBHRVRfUE9TVFMgYWN0aW9uIGNvbXBsZXRpb25cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0UG9zdHNBY3Rpb24odGFiSWQsIHN0YXRlLCBkYXRhKSB7XG4gIGJnTG9nZ2VyLmxvZygnW0JHXSBcdUQ4M0RcdURDQ0EgR0VUX1BPU1RTIGFjdGlvbiByZWNlaXZlZCwgY29sbGVjdGluZyBmcmVzaCBkYXRhIGZvciBkZWNpc2lvbi4uLicpXG5cbiAgLy8gQ2hlY2sgaWYgdGhpcyBhY3Rpb24gaXMgYWxyZWFkeSBpbiBwcm9ncmVzcyB0byBwcmV2ZW50IGR1cGxpY2F0ZXNcbiAgY29uc3QgYWN0aW9uS2V5ID0gYCR7dGFiSWR9XyR7c3RhdGUudXNlck5hbWV9YFxuICBpZiAoaW5GbGlnaHRHZXRQb3N0cy5oYXMoYWN0aW9uS2V5KSkge1xuICAgIGJnTG9nZ2VyLmxvZyhgW0JHXSBcdTI2QTBcdUZFMEYgR0VUX1BPU1RTIGFjdGlvbiBhbHJlYWR5IGluIHByb2dyZXNzIGZvciB0YWIgJHt0YWJJZH0sIHNraXBwaW5nIGR1cGxpY2F0ZWApXG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBNYXJrIHRoaXMgYWN0aW9uIGFzIGluLWZsaWdodFxuICBpbkZsaWdodEdldFBvc3RzLmFkZChhY3Rpb25LZXkpXG5cbiAgLy8gQ2xlYXIgdGhlIGluLWZsaWdodCBmbGFnIGFmdGVyIGEgZGVsYXkgdG8gcHJldmVudCBwZXJtYW5lbnQgYmxvY2tpbmdcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgaW5GbGlnaHRHZXRQb3N0cy5kZWxldGUoYWN0aW9uS2V5KVxuICB9LCAzMDAwMClcblxuICBpZiAoc3RhdGUgJiYgc3RhdGUuc3RhdHVzID09PSBTTV9TVEVQUy5DT0xMRUNUSU5HX1BPU1RTKSB7XG4gICAgYmdMb2dnZXIubG9nKCdbQkddIFN0YXRlIG1hY2hpbmUgZmxvdzogQ29sbGVjdGlvbiBjb21wbGV0ZScpXG4gIH0gZWxzZSB7XG4gICAgYmdMb2dnZXIubG9nKCdbQkddIERpcmVjdCBzdGF0dXMgY2hlY2sgZmxvdzogUnVubmluZyBkZWNpc2lvbiBhbmFseXNpcycpXG4gIH1cblxuICBiZ0xvZ2dlci5sb2coJ1tCR10gUmVxdWVzdGluZyBmcmVzaCBwb3N0cyBkYXRhIGZvciBhdXRvZmxvdyBkZWNpc2lvbi4uLicpXG5cbiAgdHJ5IHtcbiAgICBjb25zdCB0YWIgPSBhd2FpdCBjaHJvbWUudGFicy5nZXQodGFiSWQpXG4gICAgYmdMb2dnZXIubG9nKCdbQkddIFRhcmdldCB0YWIgZm9yIGZyZXNoIGRhdGEgY29sbGVjdGlvbjonLCB0YWIudXJsKVxuXG4gICAgY29uc3Qgc2VuZE1lc3NhZ2VQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoXG4gICAgICAgIHRhYklkLFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ0dFVF9GUkVTSF9QT1NUU19GT1JfREVDSVNJT04nLFxuICAgICAgICAgIHVzZXJOYW1lOiBzdGF0ZS51c2VyTmFtZVxuICAgICAgICB9LFxuICAgICAgICAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICBiZ0xvZ2dlci5sb2coJ1tCR10gQ29udGVudCBzY3JpcHQgbm90IGF2YWlsYWJsZSwgdXNpbmcgY2FjaGVkIGRhdGEnKVxuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ29udGVudCBzY3JpcHQgbm90IGF2YWlsYWJsZTogJyArIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmdMb2dnZXIubG9nKCdbQkddIE1lc3NhZ2Ugc2VudCBzdWNjZXNzZnVsbHkgdG8gY29udGVudCBzY3JpcHQnKVxuICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG5cbiAgICBhd2FpdCBzZW5kTWVzc2FnZVByb21pc2VcblxuICAgIGNvbnN0IGZyZXNoRGF0YVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBtZXNzYWdlTGlzdGVuZXIgPSAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ0ZSRVNIX1BPU1RTX0NPTExFQ1RFRCcgJiYgc2VuZGVyLnRhYj8uaWQgPT09IHRhYklkKSB7XG4gICAgICAgICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLnJlbW92ZUxpc3RlbmVyKG1lc3NhZ2VMaXN0ZW5lcilcbiAgICAgICAgICBiZ0xvZ2dlci5sb2coJ1tCR10gUmVjZWl2ZWQgRlJFU0hfUE9TVFNfQ09MTEVDVEVEIHJlc3BvbnNlOicsIG1lc3NhZ2UuZGF0YSlcbiAgICAgICAgICByZXNvbHZlKG1lc3NhZ2UuZGF0YSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKG1lc3NhZ2VMaXN0ZW5lcilcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5yZW1vdmVMaXN0ZW5lcihtZXNzYWdlTGlzdGVuZXIpXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1RpbWVvdXQgd2FpdGluZyBmb3IgZnJlc2ggcG9zdHMgZGF0YSBhZnRlciAxNSBzZWNvbmRzJykpXG4gICAgICB9LCAxNTAwMClcbiAgICB9KVxuXG4gICAgY29uc3QgZnJlc2hQb3N0c0RhdGEgPSBhd2FpdCBmcmVzaERhdGFQcm9taXNlXG4gICAgYmdMb2dnZXIubG9nKCdbQkddIFN1Y2Nlc3NmdWxseSByZWNlaXZlZCBmcmVzaCBwb3N0cyBkYXRhOicsIGZyZXNoUG9zdHNEYXRhKVxuXG4gICAgaWYgKGZyZXNoUG9zdHNEYXRhICYmIGZyZXNoUG9zdHNEYXRhLmRhdGFGcmVzaCkge1xuICAgICAgdmFyIGRhdGFGb3JBbmFseXNpcyA9IGZyZXNoUG9zdHNEYXRhXG4gICAgICBiZ0xvZ2dlci5sb2coJ1tCR10gVXNpbmcgZnJlc2ggZGF0YSBmb3IgYW5hbHlzaXM6JywgZGF0YUZvckFuYWx5c2lzKVxuICAgIH0gZWxzZSB7XG4gICAgICBiZ0xvZ2dlci5sb2coJ1tCR10gRnJlc2ggZGF0YSBpbnZhbGlkLCBmYWxsaW5nIGJhY2sgdG8gbm9ybWFsaXplZCBjYWNoZWQgZGF0YScpXG4gICAgICB2YXIgZGF0YUZvckFuYWx5c2lzID0ge1xuICAgICAgICB1c2VyTmFtZTogc3RhdGUudXNlck5hbWUsXG4gICAgICAgIHBvc3RzSW5mbzoge1xuICAgICAgICAgIHBvc3RzOiBkYXRhPy5wb3N0cyB8fCBbXSxcbiAgICAgICAgICB0b3RhbDogZGF0YT8udG90YWwgfHwgMCxcbiAgICAgICAgICBsYXN0UG9zdERhdGU6IGRhdGE/Lmxhc3RQb3N0RGF0ZSB8fCBudWxsXG4gICAgICAgIH0sXG4gICAgICAgIGxhc3RQb3N0OiBkYXRhPy5sYXN0UG9zdCB8fCBudWxsXG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGJnTG9nZ2VyLndhcm4oJ1tCR10gRmFpbGVkIHRvIGdldCBmcmVzaCBwb3N0cyBkYXRhLCB1c2luZyBjYWNoZWQgZGF0YS4gRXJyb3I6JywgZXJyb3IubWVzc2FnZSlcbiAgICB2YXIgZGF0YUZvckFuYWx5c2lzID0ge1xuICAgICAgdXNlck5hbWU6IHN0YXRlLnVzZXJOYW1lLFxuICAgICAgcG9zdHNJbmZvOiB7XG4gICAgICAgIHBvc3RzOiBkYXRhPy5wb3N0cyB8fCBbXSxcbiAgICAgICAgdG90YWw6IGRhdGE/LnRvdGFsIHx8IDAsXG4gICAgICAgIGxhc3RQb3N0RGF0ZTogZGF0YT8ubGFzdFBvc3REYXRlIHx8IG51bGxcbiAgICAgIH0sXG4gICAgICBsYXN0UG9zdDogZGF0YT8ubGFzdFBvc3QgfHwgbnVsbFxuICAgIH1cbiAgICBiZ0xvZ2dlci5sb2coJ1tCR10gTm9ybWFsaXplZCBjYWNoZWQgZGF0YSBzdHJ1Y3R1cmUgZm9yIGFuYWx5c2lzOicsIGRhdGFGb3JBbmFseXNpcylcbiAgfVxuXG4gIFBvc3REYXRhU2VydmljZS5zaG91bGRDcmVhdGVQb3N0KGRhdGFGb3JBbmFseXNpcylcbiAgICAudGhlbihhc3luYyAocmVzdWx0KSA9PiB7XG4gICAgICBiZ0xvZ2dlci5sb2coJ1tCR10gXHVEODNDXHVERkFGIEZJTkFMIERFQ0lTSU9OIFJFU1VMVDonLCB7XG4gICAgICAgIHNob3VsZENyZWF0ZTogcmVzdWx0LnNob3VsZENyZWF0ZSxcbiAgICAgICAgcmVhc29uOiByZXN1bHQucmVhc29uLFxuICAgICAgICBkZWNpc2lvblJlcG9ydDogcmVzdWx0LmRlY2lzaW9uUmVwb3J0XG4gICAgICB9KVxuXG4gICAgICBpZiAocmVzdWx0LnNob3VsZENyZWF0ZSkge1xuICAgICAgICBiZ0xvZ2dlci5sb2coYFtCR10gXHVEODNEXHVERTgwIEVYRUNVVElORzogTmV3IHBvc3QgcmVxdWlyZWQuIFJlYXNvbjogJHtyZXN1bHQucmVhc29ufWApXG5cbiAgICAgICAgaWYgKHJlc3VsdC5sYXN0UG9zdCAmJiAocmVzdWx0LnJlYXNvbiA9PT0gJ3Bvc3RfYmxvY2tlZCcgfHwgcmVzdWx0LnJlYXNvbiA9PT0gJ3Bvc3RfZG93bnZvdGVkJyB8fCByZXN1bHQucmVhc29uID09PSAnbG93X2VuZ2FnZW1lbnQnIHx8IHJlc3VsdC5yZWFzb24gPT09ICdwb3N0X3JlbW92ZWRfYnlfbW9kZXJhdG9yJykpIHtcbiAgICAgICAgICBiZ0xvZ2dlci5sb2coJ1tCR10gXHVEODNEXHVEREQxXHVGRTBGIFNURVAgMTogQXR0ZW1wdGluZyB0byBkZWxldGUgbGFzdCBwb3N0IGJlZm9yZSBjcmVhdGluZyBuZXcgb25lJylcblxuICAgICAgICAgIHN0YXRlLmRlbGV0aW5nQmVmb3JlQ3JlYXRpbmcgPSB0cnVlXG5cbiAgICAgICAgICBhd2FpdCBBdXRvRmxvd1N0YXRlTWFuYWdlci5zYXZlU3RhdGUoJ2RlbGV0aW5nX3Bvc3QnLCB7XG4gICAgICAgICAgICB1c2VyTmFtZTogc3RhdGUudXNlck5hbWUsXG4gICAgICAgICAgICBsYXN0UG9zdFRvRGVsZXRlOiByZXN1bHQubGFzdFBvc3QsXG4gICAgICAgICAgICB0YXJnZXRBY3Rpb246ICdkZWxldGVfYW5kX2NyZWF0ZScsXG4gICAgICAgICAgICB0YWJJZFxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBjaHJvbWUudGFic1xuICAgICAgICAgICAgLnNlbmRNZXNzYWdlKHRhYklkLCB7XG4gICAgICAgICAgICAgIHR5cGU6ICdERUxFVEVfTEFTVF9QT1NUJyxcbiAgICAgICAgICAgICAgdXNlck5hbWU6IHN0YXRlLnVzZXJOYW1lXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBEZWxldGUgY29tbWFuZCBzZW50IHN1Y2Nlc3NmdWxseTonLCByZXNwb25zZSlcbiAgICAgICAgICAgICAgLy8gQWZ0ZXIgZGVsZXRpb24sIHdhaXQgZm9yIGhhbmRsZURlbGV0ZVBvc3RDb21wbGV0ZWQgdG8gcmVzdGFydCBhdXRvZmxvd1xuICAgICAgICAgICAgICAvLyBEbyBOT1QgcHJvY2VlZCBkaXJlY3RseSB0byBwb3N0IGNyZWF0aW9uXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGFzeW5jIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgYmdMb2dnZXIuZXJyb3IoJ1tCR10gXHUyNzRDIEZhaWxlZCB0byBzZW5kIGRlbGV0ZSBjb21tYW5kOicsIGVycilcbiAgICAgICAgICAgICAgYmdMb2dnZXIubG9nKCdbQkddIFx1MjZBMFx1RkUwRiBGQUxMQkFDSzogUmVzdGFydGluZyBhdXRvZmxvdyBpbnN0ZWFkIG9mIGNyZWF0aW5nIHBvc3QnKVxuXG4gICAgICAgICAgICAgIC8vIERvbid0IHNhdmUgZXhlY3V0aW9uIHJlc3VsdCBmb3IgdGhpcyBzcGVjaWZpYyBlcnJvciB0byBhdm9pZCBVSSBlcnJvciBtZXNzYWdlc1xuICAgICAgICAgICAgICAvLyBUaGlzIGVycm9yIGhhcHBlbnMgd2hlbiB0aGUgbWVzc2FnZSBjaGFubmVsIGNsb3Nlcywgd2hpY2ggaXMgYSBub3JtYWwgYnJvd3NlciBiZWhhdmlvclxuICAgICAgICAgICAgICBzdGF0ZS5kZWxldGluZ0JlZm9yZUNyZWF0aW5nID0gZmFsc2VcblxuICAgICAgICAgICAgICAvLyBSZXN0YXJ0IGF1dG9mbG93IGZyb20gYmVnaW5uaW5nIGluc3RlYWQgb2YgcHJvY2VlZGluZyB0byBwb3N0IGNyZWF0aW9uXG4gICAgICAgICAgICAgIGF3YWl0IEF1dG9GbG93U3RhdGVNYW5hZ2VyLmNsZWFyU3RhdGUoc3RhdGUudXNlck5hbWUpXG4gICAgICAgICAgICAgIGF3YWl0IGhhbmRsZUNoZWNrVXNlclN0YXR1cyhzdGF0ZS51c2VyTmFtZSwgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgYmdMb2dnZXIubG9nKCdbQkddIFJlc3RhcnRlZCBhdXRvZmxvdyBhZnRlciBmYWlsZWQgZGVsZXRlOicsIHJlc3BvbnNlKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiZ0xvZ2dlci5sb2coJ1tCR10gXHVEODNEXHVEQ0REIFNURVAgMTogTm8gZGVsZXRpb24gbmVlZGVkLCBwcm9jZWVkaW5nIGRpcmVjdGx5IHRvIHBvc3QgY3JlYXRpb24nKVxuICAgICAgICAgIHByb2NlZWRXaXRoUG9zdENyZWF0aW9uKHN0YXRlLnVzZXJOYW1lLCB0YWJJZClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYmdMb2dnZXIubG9nKCdbQkddIFx1MjcwNSBDT01QTEVURTogTm8gbmV3IHBvc3QgbmVlZGVkLiBDbGVhcmluZyBzdGF0ZSBhbmQgd2FpdGluZyBmb3IgbmV4dCBpbnRlcnZhbC4nKVxuXG4gICAgICAgIGF3YWl0IEF1dG9GbG93U3RhdGVNYW5hZ2VyLmNsZWFyU3RhdGUoc3RhdGUudXNlck5hbWUpXG5cbiAgICAgICAgY29uc3QgZXhlY3V0aW9uUmVzdWx0ID0ge1xuICAgICAgICAgIHN0YXR1czogJ3NraXBwZWQnLFxuICAgICAgICAgIHBvc3RSZXN1bHQ6ICdub25lJyxcbiAgICAgICAgICBwb3N0SWQ6IG51bGwsXG4gICAgICAgICAgZXJyb3JNZXNzYWdlOiBudWxsLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgUG9zdERhdGFTZXJ2aWNlLnNhdmVFeGVjdXRpb25SZXN1bHQoZXhlY3V0aW9uUmVzdWx0KVxuICAgICAgICBjb25zdCB1c2VyTmFtZSA9IHN0YXRlLnVzZXJOYW1lXG4gICAgICAgIGRlbGV0ZSB0YWJTdGF0ZXNbdGFiSWRdXG4gICAgICAgIGZpbmFsaXplQXV0b0Zsb3dUb1N1Ym1pdHRlZCh0YWJJZCwgdXNlck5hbWUpXG4gICAgICB9XG4gICAgfSlcbiAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgYmdMb2dnZXIuZXJyb3IoJ1tCR10gXHUyNzRDIEVSUk9SOiBFcnJvciBhbmFseXppbmcgcG9zdHM6JywgZXJyKVxuICAgICAgZGVsZXRlIHRhYlN0YXRlc1t0YWJJZF1cbiAgICB9KVxuICAgIC5maW5hbGx5KCgpID0+IHtcbiAgICAgIC8vIENsZWFyIHRoZSBpbi1mbGlnaHQgZmxhZyB3aGVuIGRvbmVcbiAgICAgIGluRmxpZ2h0R2V0UG9zdHMuZGVsZXRlKGFjdGlvbktleSlcbiAgICB9KVxufVxuXG4vKipcbiAqIEhhbmRsZSBQT1NUX0NSRUFUSU9OX0NPTVBMRVRFRCBhY3Rpb25cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlUG9zdENyZWF0aW9uQ29tcGxldGVkKHRhYklkLCBzdGF0ZSwgc3VjY2VzcywgZGF0YSkge1xuICBiZ0xvZ2dlci5sb2coJ1tCR10gUG9zdGluZyBwcm9jZXNzIGNvbXBsZXRlZC4gQ2xvc2luZyBzdWJtaXQgdGFiIGFuZCBvcGVuaW5nIHJlZGRpdC5jb20gZm9yIHN0YXR1cyBjaGVjay4nKVxuXG4gIGNvbnN0IHdhc0RlbGV0aW5nQmVmb3JlQ3JlYXRpbmcgPSBzdGF0ZSAmJiBzdGF0ZS5kZWxldGluZ0JlZm9yZUNyZWF0aW5nXG4gIGxldCB1c2VyTmFtZSA9IHN0YXRlPy51c2VyTmFtZVxuICBsZXQgcG9zdE5hbWUgPSBzdGF0ZT8ucG9zdERhdGE/LnBvc3RfbmFtZVxuXG4gIGlmIChzdGF0ZSkge1xuICAgIGRlbGV0ZSB0YWJTdGF0ZXNbdGFiSWRdXG4gIH1cblxuICBsZXQgcG9zdFJlc3VsdCA9IHN1Y2Nlc3MgPyAnY3JlYXRlZCcgOiAnZXJyb3InXG4gIGlmIChzdWNjZXNzICYmIHdhc0RlbGV0aW5nQmVmb3JlQ3JlYXRpbmcpIHtcbiAgICBwb3N0UmVzdWx0ID0gJ2RlbGV0ZWRfYW5kX2NyZWF0ZWQnXG4gIH1cblxuICAvLyBEZWZhdWx0IGV4ZWN1dGlvbiByZXN1bHQ7IHdpbGwgYmUgZW5yaWNoZWQgYmVsb3cgKGluY2x1ZGluZyBzdGF0dXNVcGRhdGVkLCBwb3N0TmFtZSwgZXRjLilcbiAgY29uc3QgZXhlY3V0aW9uUmVzdWx0ID0ge1xuICAgIHN0YXR1czogc3VjY2VzcyA/ICdjb21wbGV0ZWQnIDogJ2ZhaWxlZCcsXG4gICAgcG9zdFJlc3VsdDogcG9zdFJlc3VsdCxcbiAgICBwb3N0SWQ6IGRhdGE/LnBvc3RJZCB8fCBudWxsLFxuICAgIGVycm9yTWVzc2FnZTogZGF0YT8uZXJyb3IgfHwgbnVsbCxcbiAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgfVxuXG4gIGlmIChzdWNjZXNzKSB7XG4gICAgYXdhaXQgQXV0b0Zsb3dTdGF0ZU1hbmFnZXIuY2xlYXJTdGF0ZSh1c2VyTmFtZSlcbiAgICBhd2FpdCBjaHJvbWUuc3RvcmFnZS5sb2NhbC5yZW1vdmUoWydsYXRlc3RQb3N0c0RhdGEnXSlcbiAgICBiZ0xvZ2dlci5sb2coYFtCR10gXHUyNzA1IEF1dG8tZmxvdyBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5LCBzdGF0ZSBjbGVhcmVkIGZvciB1c2VyICR7dXNlck5hbWV9YClcblxuICAgIC8vIFVwZGF0ZSBwb3N0IHN0YXR1cyB0byBcIlBvc3RlZFwiIGlmIHdlIGhhdmUgdGhlIHBvc3QgbmFtZVxuICAgIGlmIChwb3N0TmFtZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQnVpbGQgZXh0cmEgZmllbGRzIGZyb20gZGF0YSBwYXNzZWQgYnkgc3VibWl0LWNvbnRlbnQtc2NyaXB0IChpZiBhdmFpbGFibGUpXG4gICAgICAgIGNvbnN0IHJlZGRpdFVybCA9IGRhdGE/LnJlZGRpdFVybCB8fCBudWxsXG4gICAgICAgIGNvbnN0IHJlZGRpdFBvc3RJZCA9IGRhdGE/LnJlZGRpdFBvc3RJZCB8fCBudWxsXG5cbiAgICAgICAgY29uc3QgZXh0cmFGaWVsZHMgPSB7fVxuICAgICAgICBpZiAocmVkZGl0VXJsKSBleHRyYUZpZWxkcy5yZWRkaXRfcG9zdF91cmwgPSByZWRkaXRVcmxcbiAgICAgICAgaWYgKHJlZGRpdFBvc3RJZCkgZXh0cmFGaWVsZHMucmVkZGl0X3Bvc3RfaWQgPSByZWRkaXRQb3N0SWRcblxuICAgICAgICAvLyBVc2UgY2xpZW50IHRpbWVzdGFtcCBhcyBwb3N0ZWRfYXQgaWYgYmFja2VuZCBoYXNuJ3Qgc3RvcmVkIGl0IHlldFxuICAgICAgICBpZiAocmVkZGl0VXJsIHx8IHJlZGRpdFBvc3RJZCkge1xuICAgICAgICAgIC8vIENvbnZlcnQgdG8gTXlTUUwtY29tcGF0aWJsZSBkYXRldGltZSBmb3JtYXQgKFlZWVktTU0tREQgSEg6TU06U1MpXG4gICAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKVxuICAgICAgICAgIGNvbnN0IG15c3FsRGF0ZVRpbWUgPSBub3cuZ2V0RnVsbFllYXIoKSArICctJyArXG4gICAgICAgICAgICBTdHJpbmcobm93LmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCAnMCcpICsgJy0nICtcbiAgICAgICAgICAgIFN0cmluZyhub3cuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCAnMCcpICsgJyAnICtcbiAgICAgICAgICAgIFN0cmluZyhub3cuZ2V0SG91cnMoKSkucGFkU3RhcnQoMiwgJzAnKSArICc6JyArXG4gICAgICAgICAgICBTdHJpbmcobm93LmdldE1pbnV0ZXMoKSkucGFkU3RhcnQoMiwgJzAnKSArICc6JyArXG4gICAgICAgICAgICBTdHJpbmcobm93LmdldFNlY29uZHMoKSkucGFkU3RhcnQoMiwgJzAnKVxuICAgICAgICAgIGV4dHJhRmllbGRzLnBvc3RlZF9hdCA9IG15c3FsRGF0ZVRpbWVcbiAgICAgICAgfVxuXG4gICAgICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBcdUQ4M0RcdUREMDQgVXBkYXRpbmcgcG9zdCBzdGF0dXMgdG8gXCJQb3N0ZWRcIiBmb3IgcG9zdDonLCBwb3N0TmFtZSwge1xuICAgICAgICAgIGV4dHJhRmllbGRzXG4gICAgICAgIH0pXG4gICAgICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBQb3N0IGRhdGEgYXZhaWxhYmxlIGZvciBzdGF0dXMgdXBkYXRlOicsIHN0YXRlPy5wb3N0RGF0YSlcblxuICAgICAgICBhd2FpdCBQb3N0RGF0YVNlcnZpY2UudXBkYXRlUG9zdFN0YXR1cyhwb3N0TmFtZSwgJ1Bvc3RlZCcsIGV4dHJhRmllbGRzKVxuICAgICAgICBiZ0xvZ2dlci5sb2coJ1tCR10gXHUyNzA1IFBvc3Qgc3RhdHVzL21ldGFkYXRhIHVwZGF0ZWQgc3VjY2Vzc2Z1bGx5JylcblxuICAgICAgICAvLyBVcGRhdGUgZXhlY3V0aW9uIHJlc3VsdCB0byBpbmNsdWRlIHRoZSBwb3N0IHN0YXR1cyB1cGRhdGVcbiAgICAgICAgZXhlY3V0aW9uUmVzdWx0LnN0YXR1c1VwZGF0ZWQgPSB0cnVlXG4gICAgICAgIGV4ZWN1dGlvblJlc3VsdC5wb3N0TmFtZSA9IHBvc3ROYW1lXG4gICAgICAgIGlmIChyZWRkaXRVcmwpIGV4ZWN1dGlvblJlc3VsdC5yZWRkaXRVcmwgPSByZWRkaXRVcmxcbiAgICAgICAgaWYgKHJlZGRpdFBvc3RJZCkgZXhlY3V0aW9uUmVzdWx0LnJlZGRpdFBvc3RJZCA9IHJlZGRpdFBvc3RJZFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgYmdMb2dnZXIuZXJyb3IoJ1tCR10gRmFpbGVkIHRvIHVwZGF0ZSBwb3N0IHN0YXR1czonLCBlcnJvcilcbiAgICAgICAgLy8gRG9uJ3QgZmFpbCB0aGUgZW50aXJlIHByb2Nlc3MgaWYgc3RhdHVzIHVwZGF0ZSBmYWlsc1xuICAgICAgICBleGVjdXRpb25SZXN1bHQuc3RhdHVzVXBkYXRlZCA9IGZhbHNlXG4gICAgICAgIGV4ZWN1dGlvblJlc3VsdC5zdGF0dXNVcGRhdGVFcnJvciA9IGVycm9yLm1lc3NhZ2VcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYmdMb2dnZXIubG9nKCdbQkddIFx1MjZBMFx1RkUwRiBObyBwb3N0X25hbWUgYXZhaWxhYmxlIGZvciBzdGF0dXMgdXBkYXRlJylcbiAgICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBBdmFpbGFibGUgcG9zdCBkYXRhOicsIHN0YXRlPy5wb3N0RGF0YSlcbiAgICB9XG4gIH1cblxuICBhd2FpdCBQb3N0RGF0YVNlcnZpY2Uuc2F2ZUV4ZWN1dGlvblJlc3VsdChleGVjdXRpb25SZXN1bHQpXG5cbiAgaWYgKHN1Y2Nlc3MgJiYgIXVzZXJOYW1lKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHN5bmNSZXN1bHQgPSBhd2FpdCBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldChbJ3JlZGRpdFVzZXInXSlcbiAgICAgIGNvbnN0IGxvY2FsUmVzdWx0ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsncmVkZGl0VXNlciddKVxuICAgICAgdXNlck5hbWUgPSBzeW5jUmVzdWx0LnJlZGRpdFVzZXI/LnNlcmVuX25hbWUgfHwgbG9jYWxSZXN1bHQucmVkZGl0VXNlcj8uc2VyZW5fbmFtZVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICB9XG4gIH1cblxuICBpZiAoc3VjY2VzcyAmJiB1c2VyTmFtZSkge1xuICAgIC8vIFJldXNlIHRoZSB1bmlmaWVkIHRhYiBmb3Igc3VibWl0dGVkIHBhZ2UgaW5zdGVhZCBvZiBvcGVuaW5nIGFuIGV4dHJhIHRhYlxuICAgIHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2xlYW5Vc2VybmFtZSA9IHVzZXJOYW1lLnJlcGxhY2UoJ3UvJywgJycpXG4gICAgICAgIGNvbnN0IHN1Ym1pdHRlZFVybCA9IGBodHRwczovL3d3dy5yZWRkaXQuY29tL3VzZXIvJHtjbGVhblVzZXJuYW1lfS9zdWJtaXR0ZWQvYFxuXG4gICAgICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBOYXZpZ2F0aW5nIHVuaWZpZWQgdGFiIHRvIHN1Ym1pdHRlZCBwb3N0cyBhZnRlciBwb3N0IGNyZWF0aW9uOicsIHN1Ym1pdHRlZFVybClcbiAgICAgICAgY29uc3QgdW5pZmllZFRhYklkID0gYXdhaXQgcmVsb2FkVW5pZmllZFRhYihzdWJtaXR0ZWRVcmwsIE9QRVJBVElPTlMuUE9TVF9DT0xMRUNUSU9OKVxuICAgICAgICBmaW5hbGl6ZUF1dG9GbG93VG9TdWJtaXR0ZWQodW5pZmllZFRhYklkLCB1c2VyTmFtZSlcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGJnTG9nZ2VyLmVycm9yKCdbQkddIEZhaWxlZCB0byBuYXZpZ2F0ZSB1bmlmaWVkIHRhYiB0byBzdWJtaXR0ZWQgcG9zdHMgcGFnZSBhZnRlciBwb3N0IGNyZWF0aW9uOicsIGVycm9yKVxuICAgICAgfVxuICAgIH0sIDEwMDApXG4gIH1cbn1cblxuLyoqXG4gKiBIYW5kbGUgREVMRVRFX1BPU1RfQ09NUExFVEVEIGFjdGlvblxuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVEZWxldGVQb3N0Q29tcGxldGVkKHRhYklkLCBzdGF0ZSwgc3VjY2VzcywgZGF0YSkge1xuICBiZ0xvZ2dlci5sb2coJ1tCR10gRGVsZXRlIHBvc3Qgb3BlcmF0aW9uIGNvbXBsZXRlZC4nKVxuICBiZ0xvZ2dlci5sb2coJ1tCR10gRGVsZXRlIGRhdGEgcmVjZWl2ZWQ6JywgZGF0YSlcbiAgYmdMb2dnZXIubG9nKCdbQkddIFN1Y2Nlc3MgdmFsdWU6Jywgc3VjY2VzcylcblxuICBjb25zdCB1c2VyTmFtZSA9IHN0YXRlPy51c2VyTmFtZSB8fCBkYXRhPy51c2VyTmFtZVxuICBiZ0xvZ2dlci5sb2coJ1tCR10gVGFiIHN0YXRlOicsIHN0YXRlKVxuICBiZ0xvZ2dlci5sb2coJ1tCR10gVXNlcm5hbWUgZXh0cmFjdGVkOicsIHVzZXJOYW1lKVxuXG4gIC8vIENsZWFyIHRoZSB0YWIgc3RhdGUgc28gYSBmcmVzaCBhdXRvLWZsb3cgY2FuIHN0YXJ0IHdpdGhvdXQgdGhpbmtpbmcgdGhpcyB0YWJcbiAgLy8gaXMgc3RpbGwgYnVzeSBpbiBDT0xMRUNUSU5HX1BPU1RTL0RFTEVUSU5HX1BPU1QuIFdlIGtlZXAgdXNpbmcgdGhlIGxvY2FsXG4gIC8vIGBzdGF0ZWAgc25hcHNob3QgYmVsb3csIGJ1dCByZW1vdmUgdGhlIHNoYXJlZCByZWZlcmVuY2UgZnJvbSBgdGFiU3RhdGVzYC5cbiAgaWYgKHRhYlN0YXRlc1t0YWJJZF0pIHtcbiAgICBiZ0xvZ2dlci5sb2coYFtCR10gQ2xlYXJpbmcgdGFiIHN0YXRlIGZvciB0YWIgJHt0YWJJZH0gYWZ0ZXIgZGVsZXRlIGNvbXBsZXRpb25gKVxuICAgIGRlbGV0ZSB0YWJTdGF0ZXNbdGFiSWRdXG4gIH1cblxuICBhd2FpdCBBdXRvRmxvd1N0YXRlTWFuYWdlci5zYXZlU3RhdGUoJ2RlbGV0aW9uX2NvbXBsZXRlZCcsIHtcbiAgICB1c2VyTmFtZSxcbiAgICBzdWNjZXNzOiBzdWNjZXNzLFxuICAgIHRhcmdldEFjdGlvbjogJ2RlbGV0ZV9hbmRfY3JlYXRlJ1xuICB9KVxuXG4gIC8vIERvbid0IHNhdmUgZXhlY3V0aW9uIHJlc3VsdCBmb3IgZGVsZXRpb24gd2hlbiBpdCdzIHBhcnQgb2YgYXV0by1mbG93XG4gIC8vIFRoZSBmaW5hbCByZXN1bHQgc2hvdWxkIGJlIGZyb20gcG9zdCBjcmVhdGlvbiwgbm90IGRlbGV0aW9uXG4gIC8vIE9ubHkgc2F2ZSBleGVjdXRpb24gcmVzdWx0IGlmIHRoaXMgaXMgYSBzdGFuZGFsb25lIGRlbGV0aW9uIChub3QgYXV0by1mbG93KVxuICBpZiAoIXN0YXRlIHx8ICFzdGF0ZS5kZWxldGluZ0JlZm9yZUNyZWF0aW5nKSB7XG4gICAgY29uc3QgZXhlY3V0aW9uUmVzdWx0ID0ge1xuICAgICAgc3RhdHVzOiBzdWNjZXNzID8gJ2NvbXBsZXRlZCcgOiAnZmFpbGVkJyxcbiAgICAgIHBvc3RSZXN1bHQ6IHN1Y2Nlc3MgPyAnZGVsZXRlZCcgOiAnZXJyb3InLFxuICAgICAgcG9zdElkOiBkYXRhPy5wb3N0SWQgfHwgbnVsbCxcbiAgICAgIGVycm9yTWVzc2FnZTogZGF0YT8uZXJyb3IgfHwgbnVsbCxcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgIH1cbiAgICBhd2FpdCBQb3N0RGF0YVNlcnZpY2Uuc2F2ZUV4ZWN1dGlvblJlc3VsdChleGVjdXRpb25SZXN1bHQpXG4gIH0gZWxzZSB7XG4gICAgYmdMb2dnZXIubG9nKCdbQkddIFNraXBwaW5nIGV4ZWN1dGlvbiByZXN1bHQgc2F2ZSBmb3IgYXV0by1mbG93IGRlbGV0aW9uIC0gd2lsbCBzYXZlIGFmdGVyIHBvc3QgY3JlYXRpb24nKVxuICB9XG5cbiAgLy8gVXBkYXRlIGJhY2tlbmQgc3RhdHVzIHdoZW4gcG9zdCBpcyBkZWxldGVkXG4gIGlmIChzdWNjZXNzICYmIGRhdGE/LnJlZGRpdFVybCkge1xuICAgIHRyeSB7XG4gICAgICBiZ0xvZ2dlci5sb2coJ1tCR10gXHVEODNEXHVERDA0IFVwZGF0aW5nIGJhY2tlbmQgc3RhdHVzIGZvciBkZWxldGVkIHBvc3Q6JywgZGF0YS5yZWRkaXRVcmwpXG4gICAgICBhd2FpdCBQb3N0RGF0YVNlcnZpY2UudXBkYXRlUG9zdFN0YXR1c0J5UmVkZGl0VXJsKFxuICAgICAgICBkYXRhLnJlZGRpdFVybCxcbiAgICAgICAgJ0RlbGV0ZWQnLFxuICAgICAgICAnRGVsZXRlZCBieSB1c2VyIHZpYSBleHRlbnNpb24nXG4gICAgICApXG4gICAgICBiZ0xvZ2dlci5sb2coJ1tCR10gXHUyNzA1IEJhY2tlbmQgc3RhdHVzIHVwZGF0ZWQgZm9yIGRlbGV0ZWQgcG9zdCcpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGJnTG9nZ2VyLmVycm9yKCdbQkddIEZhaWxlZCB0byB1cGRhdGUgYmFja2VuZCBzdGF0dXMgZm9yIGRlbGV0ZWQgcG9zdDonLCBlcnJvcilcbiAgICAgIC8vIERvbid0IGZhaWwgdGhlIGRlbGV0aW9uIHByb2Nlc3MgaWYgYmFja2VuZCB1cGRhdGUgZmFpbHNcbiAgICB9XG4gIH1cblxuICBpZiAoc3VjY2Vzcykge1xuICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBcdTI3MDUgRGVsZXRlIHdhcyBzdWNjZXNzZnVsLCBjbGVhcmluZyBjYWNoZSBhbmQgcmVzdGFydGluZyBhdXRvZmxvdyBmcm9tIGJlZ2lubmluZycpXG4gICAgYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwucmVtb3ZlKFsnbGF0ZXN0UG9zdHNEYXRhJ10pXG5cbiAgICBpZiAodXNlck5hbWUpIHtcbiAgICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBcdUQ4M0RcdUREMDQgUmVzdGFydGluZyBhdXRvZmxvdyBhbmFseXNpcyBhZnRlciBkZWxldGlvbicpXG5cbiAgICAgIC8vIFN0b3JlIHRoZSBkZWxldGVkIHBvc3QgSUQgdG8gZmlsdGVyIGl0IG91dCBpbiBzdWJzZXF1ZW50IGFuYWx5c2lzXG4gICAgICBjb25zdCBkZWxldGVkUG9zdElkID0gZGF0YT8ucG9zdElkIHx8IG51bGxcbiAgICAgIGlmIChkZWxldGVkUG9zdElkKSB7XG4gICAgICAgIGF3YWl0IGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICAgICAgW2BkZWxldGVkUG9zdF8ke3VzZXJOYW1lfWBdOiB7XG4gICAgICAgICAgICBwb3N0SWQ6IGRlbGV0ZWRQb3N0SWQsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIGJnTG9nZ2VyLmxvZyhgW0JHXSBcdUQ4M0RcdURDQkUgU3RvcmVkIGRlbGV0ZWQgcG9zdCBJRDogJHtkZWxldGVkUG9zdElkfWApXG4gICAgICB9XG5cbiAgICAgIC8vIENsZWFyIHRoZSBjdXJyZW50IHN0YXRlIHRvIHN0YXJ0IGZyZXNoXG4gICAgICBhd2FpdCBBdXRvRmxvd1N0YXRlTWFuYWdlci5jbGVhclN0YXRlKHVzZXJOYW1lKVxuXG4gICAgICAvLyBBZGQgYSBzbWFsbCBkZWxheSB0byBhbGxvdyBSZWRkaXQgdG8gcHJvY2VzcyBkZWxldGlvblxuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDMwMDApKVxuXG4gICAgICAvLyBUcmlnZ2VyIGZyZXNoIGF1dG9mbG93IGNoZWNrIGZyb20gdGhlIGJlZ2lubmluZ1xuICAgICAgYmdMb2dnZXIubG9nKGBbQkddIFx1RDgzRFx1REU4MCBUcmlnZ2VyaW5nIGZyZXNoIGF1dG9mbG93IGNoZWNrIGZvciAke3VzZXJOYW1lfWApXG4gICAgICBhd2FpdCBoYW5kbGVDaGVja1VzZXJTdGF0dXModXNlck5hbWUsIChyZXNwb25zZSkgPT4ge1xuICAgICAgICBiZ0xvZ2dlci5sb2coJ1tCR10gRnJlc2ggYXV0b2Zsb3cgY2hlY2sgaW5pdGlhdGVkIGFmdGVyIGRlbGV0aW9uOicsIHJlc3BvbnNlKVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxuLy8gPT09PT0gU1RBTkRBUkQgTUVTU0FHRSBIQU5ETEVSUyA9PT09PVxuXG4vKipcbiAqIEdldCBSZWRkaXQgcGFnZSBpbmZvcm1hdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlR2V0UmVkZGl0SW5mbyhzZW5kUmVzcG9uc2UpIHtcbiAgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSwgKHRhYnMpID0+IHtcbiAgICBjb25zdCB0YWIgPSB0YWJzWzBdXG4gICAgaWYgKHRhYiAmJiB0YWIudXJsICYmIHRhYi51cmwuaW5jbHVkZXMoJ3JlZGRpdC5jb20nKSkge1xuICAgICAgc2VuZFJlc3BvbnNlKHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHVybDogdGFiLnVybCxcbiAgICAgICAgICBpc1JlZGRpdFBhZ2U6IHRydWVcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgc2VuZFJlc3BvbnNlKHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiAnTm90IG9uIGEgUmVkZGl0IHBhZ2UnXG4gICAgICB9KVxuICAgIH1cbiAgfSlcbn1cblxuLyoqXG4gKiBIYW5kbGUgcG9zdCBjcmVhdGlvblxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ3JlYXRlUG9zdChwb3N0RGF0YSwgc2VuZFJlc3BvbnNlKSB7XG4gIGJnTG9nZ2VyLmxvZygnQ3JlYXRpbmcgcG9zdDonLCBwb3N0RGF0YSlcblxuICB0cnkge1xuICAgIGxldCBwb3N0VG9TdWJtaXRcbiAgICBsZXQgcmVkZGl0VXNlclxuXG4gICAgY29uc3Qgc3luY1Jlc3VsdCA9IGF3YWl0IGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KFsncmVkZGl0VXNlciddKVxuICAgIGNvbnN0IGxvY2FsUmVzdWx0ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsncmVkZGl0VXNlciddKVxuICAgIHJlZGRpdFVzZXIgPSBzeW5jUmVzdWx0LnJlZGRpdFVzZXIgfHwgbG9jYWxSZXN1bHQucmVkZGl0VXNlclxuXG4gICAgaWYgKHBvc3REYXRhKSB7XG4gICAgICBwb3N0VG9TdWJtaXQgPSBwb3N0RGF0YVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocmVkZGl0VXNlciAmJiByZWRkaXRVc2VyLnNlcmVuX25hbWUpIHtcbiAgICAgICAgYmdMb2dnZXIubG9nKGBbQkddIEdlbmVyYXRpbmcgcG9zdCBmb3IgdXNlcjogJHtyZWRkaXRVc2VyLnNlcmVuX25hbWV9YClcbiAgICAgICAgcG9zdFRvU3VibWl0ID0gYXdhaXQgUG9zdERhdGFTZXJ2aWNlLmdlbmVyYXRlUG9zdChyZWRkaXRVc2VyLnNlcmVuX25hbWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSAnTm8gdXNlcm5hbWUgZm91bmQgLSBjYW5ub3QgZ2VuZXJhdGUgcG9zdCB3aXRob3V0IHVzZXIgY29udGV4dCdcbiAgICAgICAgYmdMb2dnZXIuZXJyb3IoJ1tCR10gJyArIGVycm9yTWVzc2FnZSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBiZ0xvZ2dlci5sb2coJ1tCR10gUG9zdCBkYXRhIHRvIHN1Ym1pdDonLCBwb3N0VG9TdWJtaXQpXG5cbiAgICAvLyBVc2UgdW5pZmllZCB0YWIgbWFuYWdlciB0byBnZXQvcmV1c2UgdGhlIHBvc3QgY3JlYXRpb24gdGFiXG4gICAgY29uc3QgdGFyZ2V0VGFiSWQgPSBhd2FpdCBnZXRQb3N0Q3JlYXRpb25UYWIocG9zdFRvU3VibWl0KVxuICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBVc2luZyB1bmlmaWVkIHRhYiBmb3IgcG9zdCBjcmVhdGlvbjonLCB0YXJnZXRUYWJJZClcblxuICAgIC8vIFdhaXQgZm9yIHRhYiB0byBsb2FkXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IHRhYkxvYWRMaXN0ZW5lciA9ICh0YWJJZCwgY2hhbmdlSW5mbykgPT4ge1xuICAgICAgICBpZiAodGFiSWQgPT09IHRhcmdldFRhYklkICYmIGNoYW5nZUluZm8uc3RhdHVzID09PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgY2hyb21lLnRhYnMub25VcGRhdGVkLnJlbW92ZUxpc3RlbmVyKHRhYkxvYWRMaXN0ZW5lcilcbiAgICAgICAgICBzZXRUaW1lb3V0KHJlc29sdmUsIDIwMDApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlZ2lzdGVyVGFiTGlzdGVuZXIodGFyZ2V0VGFiSWQsIHRhYkxvYWRMaXN0ZW5lcilcbiAgICB9KVxuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zdCB1c2VyTmFtZSA9IHJlZGRpdFVzZXI/LnNlcmVuX25hbWUgfHwgJ0F1dG9Vc2VyJ1xuXG4gICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YXJnZXRUYWJJZCwge1xuICAgICAgICB0eXBlOiAnU1RBUlRfUE9TVF9DUkVBVElPTicsXG4gICAgICAgIHVzZXJOYW1lOiB1c2VyTmFtZSxcbiAgICAgICAgcG9zdERhdGE6IHBvc3RUb1N1Ym1pdFxuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBiZ0xvZ2dlci5lcnJvcihgW0JHXSBGYWlsZWQgdG8gc2VuZCBwb3N0IGRhdGEgdG8gdGFiICR7dGFyZ2V0VGFiSWR9OmAsIGVycilcbiAgICAgIH0pXG4gICAgfSwgMzAwMClcblxuICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgbWVzc2FnZTogJ1Bvc3QgZGF0YSBzZW50IHRvIHN1Ym1pdCB0YWInLFxuICAgICAgdGFiSWQ6IHRhcmdldFRhYklkXG4gICAgfSlcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBiZ0xvZ2dlci5lcnJvcignW0JHXSBGYWlsZWQgdG8gY3JlYXRlIHBvc3Q6JywgZXJyb3IpXG4gICAgc2VuZFJlc3BvbnNlKHtcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2VcbiAgICB9KVxuICB9XG59XG5cbi8qKlxuICogSGFuZGxlIHNldHRpbmdzIHNhdmVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZVNhdmVTZXR0aW5ncyhzZXR0aW5ncywgc2VuZFJlc3BvbnNlKSB7XG4gIGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0KHsgc2V0dGluZ3MgfSwgKCkgPT4ge1xuICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2VcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIG1lc3NhZ2U6ICdTZXR0aW5ncyBzYXZlZCBzdWNjZXNzZnVsbHknXG4gICAgICB9KVxuICAgIH1cbiAgfSlcbn1cblxuLyoqXG4gKiBIYW5kbGUgdXNlcm5hbWUgc3RvcmFnZSBub3RpZmljYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZVVzZXJuYW1lU3RvcmVkKHVzZXJuYW1lLCB0aW1lc3RhbXAsIHNlbmRSZXNwb25zZSkge1xuICBiZ0xvZ2dlci5sb2coYEJhY2tncm91bmQ6IFJlY2VpdmVkIHVzZXJuYW1lIHN0b3JhZ2Ugbm90aWZpY2F0aW9uIC0gJHt1c2VybmFtZX1gKVxuICBjaHJvbWUuYWN0aW9uLnNldEJhZGdlVGV4dCh7IHRleHQ6ICdcdTI3MTMnIH0pXG4gIGNocm9tZS5hY3Rpb24uc2V0QmFkZ2VCYWNrZ3JvdW5kQ29sb3IoeyBjb2xvcjogJyM0Y2FmNTAnIH0pXG4gIHNldFRpbWVvdXQoKCkgPT4geyBjaHJvbWUuYWN0aW9uLnNldEJhZGdlVGV4dCh7IHRleHQ6ICcnIH0pIH0sIDMwMDApXG4gIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSlcbn1cblxuLyoqXG4gKiBIYW5kbGUgZ2V0IHN0b3JlZCB1c2VybmFtZSByZXF1ZXN0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRTdG9yZWRVc2VybmFtZShzZW5kUmVzcG9uc2UpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzeW5jUmVzdWx0ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoWydyZWRkaXRVc2VyJ10pXG4gICAgaWYgKHN5bmNSZXN1bHQucmVkZGl0VXNlciAmJiBzeW5jUmVzdWx0LnJlZGRpdFVzZXIuc2VyZW5fbmFtZSkge1xuICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogc3luY1Jlc3VsdC5yZWRkaXRVc2VyIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgbG9jYWxSZXN1bHQgPSBhd2FpdCBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoWydyZWRkaXRVc2VyJ10pXG4gICAgaWYgKGxvY2FsUmVzdWx0LnJlZGRpdFVzZXIgJiYgbG9jYWxSZXN1bHQucmVkZGl0VXNlci5zZXJlbl9uYW1lKSB7XG4gICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBsb2NhbFJlc3VsdC5yZWRkaXRVc2VyIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTm8gc3RvcmVkIHVzZXJuYW1lIGZvdW5kJyB9KVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KVxuICB9XG59XG5cbi8qKlxuICogSGFuZGxlIHVzZXIgc3RhdHVzIHNhdmVkIG5vdGlmaWNhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlVXNlclN0YXR1c1NhdmVkKHN0YXR1c0RhdGEsIHNlbmRSZXNwb25zZSkge1xuICBiZ0xvZ2dlci5sb2coYEJhY2tncm91bmQ6IFVzZXIgc3RhdHVzIHNhdmVkIC0gJHtzdGF0dXNEYXRhLnVzZXJOYW1lfWApXG4gIGNocm9tZS5hY3Rpb24uc2V0QmFkZ2VUZXh0KHsgdGV4dDogJ1x1RDgzRFx1RENDQScgfSlcbiAgY2hyb21lLmFjdGlvbi5zZXRCYWRnZUJhY2tncm91bmRDb2xvcih7IGNvbG9yOiAnIzIxOTZmMycgfSlcbiAgc2V0VGltZW91dCgoKSA9PiB7IGNocm9tZS5hY3Rpb24uc2V0QmFkZ2VUZXh0KHsgdGV4dDogJycgfSkgfSwgNDAwMClcbiAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KVxufVxuXG4vKipcbiAqIEhhbmRsZSBnZXQgdXNlciBzdGF0dXMgcmVxdWVzdFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0VXNlclN0YXR1cyhzZW5kUmVzcG9uc2UpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBsb2NhbFJlc3VsdCA9IGF3YWl0IGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ3VzZXJTdGF0dXMnXSlcbiAgICBpZiAobG9jYWxSZXN1bHQudXNlclN0YXR1cykge1xuICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogbG9jYWxSZXN1bHQudXNlclN0YXR1cyB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3Qgc3luY1Jlc3VsdCA9IGF3YWl0IGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KFsndXNlclN0YXR1cyddKVxuICAgIGlmIChzeW5jUmVzdWx0LnVzZXJTdGF0dXMpIHtcbiAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHN5bmNSZXN1bHQudXNlclN0YXR1cyB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ05vIHVzZXIgc3RhdHVzIGZvdW5kJyB9KVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KVxuICB9XG59XG5cbi8qKlxuICogSGFuZGxlIG1hbnVhbCBwb3N0IGNyZWF0aW9uIGZyb20gcG9wdXBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNyZWF0ZVBvc3RGcm9tUG9wdXAodXNlck5hbWUsIHNlbmRSZXNwb25zZSkge1xuICBiZ0xvZ2dlci5sb2coYFtCR10gTWFudWFsIHBvc3QgY3JlYXRpb24gcmVxdWVzdGVkIGZvciAke3VzZXJOYW1lfWApXG5cbiAgdHJ5IHtcbiAgICBjb25zdCBwb3N0RGF0YSA9IGF3YWl0IFBvc3REYXRhU2VydmljZS5nZW5lcmF0ZVBvc3QodXNlck5hbWUpXG4gICAgYmdMb2dnZXIubG9nKCdbQkddIEdlbmVyYXRlZCBwb3N0IGRhdGEgZm9yIG1hbnVhbCBjcmVhdGlvbjonLCBwb3N0RGF0YSlcblxuICAgIGNvbnN0IG5ld1RhYklkID0gYXdhaXQgY3JlYXRlQ2xlYW5Qb3N0VGFiKHVzZXJOYW1lLCBwb3N0RGF0YSlcblxuICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgbWVzc2FnZTogJ1Bvc3QgY3JlYXRpb24gdGFiIG9wZW5lZCcsXG4gICAgICB0YWJJZDogbmV3VGFiSWRcbiAgICB9KVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGJnTG9nZ2VyLmVycm9yKCdbQkddIEZhaWxlZCB0byBjcmVhdGUgcG9zdCBmcm9tIHBvcHVwOicsIGVycm9yKVxuICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlXG4gICAgfSlcbiAgfVxufVxuXG4vKipcbiAqIFJlc3VtZSBpbnRlcnJ1cHRlZCBhdXRvLWZsb3cgZnJvbSBzYXZlZCBzdGF0ZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdW1lQXV0b0Zsb3coc3RhdGUsIHNlbmRSZXNwb25zZSkge1xuICBiZ0xvZ2dlci5sb2coYFtCR10gXHVEODNEXHVERDA0IFJlc3VtaW5nIGF1dG8tZmxvdyBmcm9tIHN0ZXA6ICR7c3RhdGUuY3VycmVudFN0ZXB9YClcblxuICB0cnkge1xuICAgIHN3aXRjaCAoc3RhdGUuY3VycmVudFN0ZXApIHtcbiAgICAgIGNhc2UgJ3N0YXJ0aW5nJzpcbiAgICAgIGNhc2UgJ2FuYWx5emluZ19wb3N0cyc6XG4gICAgICAgIGF3YWl0IEF1dG9GbG93U3RhdGVNYW5hZ2VyLmNsZWFyU3RhdGUoc3RhdGUudXNlck5hbWUpXG4gICAgICAgIGF3YWl0IGhhbmRsZUNoZWNrVXNlclN0YXR1cyhzdGF0ZS51c2VyTmFtZSwgc2VuZFJlc3BvbnNlKVxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdkZWxldGluZ19wb3N0JzpcbiAgICAgICAgLy8gRm9yIGRlbGV0ZS1hbmQtY3JlYXRlIGZsb3dzIHdlIGFsd2F5cyB3YW50IHRvIGJlaGF2ZSBsaWtlIHRoZVxuICAgICAgICAvLyBub24tcmVzdW1lIHBhdGg6IGNvbXBsZXRlIHRoZSBkZWxldGlvbiwgdGhlbiByZXN0YXJ0IHRoZSBmdWxsXG4gICAgICAgIC8vIGF1dG8tZmxvdyBhbmFseXNpcyBmcm9tIHRoZSBiZWdpbm5pbmcgKGNyZWF0ZV93aXRoX2RlbGV0ZSkuXG4gICAgICAgIC8vIFRyeWluZyB0byBcInJlc3VtZVwiIGJ5IGp1bXBpbmcgZGlyZWN0bHkgaW50byBwb3N0IGNyZWF0aW9uIGNhblxuICAgICAgICAvLyBsZWFkIHRvIHBvc3Rpbmcgd2l0aG91dCBmcmVzaCBhbmFseXNpcyBhbmQgaXMgYWdhaW5zdCB0aGVcbiAgICAgICAgLy8gaW50ZW5kZWQgc2VtYW50aWNzLCBzbyB3ZSBqdXN0IGNsZWFyIHN0YXRlIGFuZCByZXN0YXJ0LlxuICAgICAgICBiZ0xvZ2dlci5sb2coJ1tCR10gXHVEODNEXHVERDA0IFJlc3VtaW5nIGZyb20gZGVsZXRpbmdfcG9zdDogY2xlYXJpbmcgc3RhdGUgYW5kIHJlc3RhcnRpbmcgZnVsbCBhdXRvLWZsb3cnKVxuICAgICAgICBhd2FpdCBBdXRvRmxvd1N0YXRlTWFuYWdlci5jbGVhclN0YXRlKHN0YXRlLnVzZXJOYW1lKVxuICAgICAgICBhd2FpdCBoYW5kbGVDaGVja1VzZXJTdGF0dXMoc3RhdGUudXNlck5hbWUsIHNlbmRSZXNwb25zZSlcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnY3JlYXRpbmdfcG9zdCc6XG4gICAgICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBcdUQ4M0RcdUREMDQgUmVzdW1pbmcgcG9zdCBjcmVhdGlvbicpXG4gICAgICAgIGlmIChzdGF0ZS50YWJJZCkge1xuICAgICAgICAgIGNvbnN0IHRhYlZhbGlkID0gYXdhaXQgQXV0b0Zsb3dTdGF0ZU1hbmFnZXIudmFsaWRhdGVUYWIoc3RhdGUudGFiSWQpXG4gICAgICAgICAgaWYgKHRhYlZhbGlkKSB7XG4gICAgICAgICAgICBwcm9jZWVkV2l0aFBvc3RDcmVhdGlvbihzdGF0ZS51c2VyTmFtZSwgc3RhdGUudGFiSWQpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBUYWIgaXMgbm8gbG9uZ2VyIHZhbGlkLCBzdGFydGluZyBmcmVzaCcpXG4gICAgICAgICAgICBhd2FpdCBBdXRvRmxvd1N0YXRlTWFuYWdlci5jbGVhclN0YXRlKHN0YXRlLnVzZXJOYW1lKVxuICAgICAgICAgICAgYXdhaXQgaGFuZGxlQ2hlY2tVc2VyU3RhdHVzKHN0YXRlLnVzZXJOYW1lLCBzZW5kUmVzcG9uc2UpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBDYW5ub3QgcmVzdW1lIHBvc3QgY3JlYXRpb24gLSBtaXNzaW5nIHRhYiBpbmZvLCBzdGFydGluZyBmcmVzaCcpXG4gICAgICAgICAgYXdhaXQgQXV0b0Zsb3dTdGF0ZU1hbmFnZXIuY2xlYXJTdGF0ZShzdGF0ZS51c2VyTmFtZSlcbiAgICAgICAgICBhd2FpdCBoYW5kbGVDaGVja1VzZXJTdGF0dXMoc3RhdGUudXNlck5hbWUsIHNlbmRSZXNwb25zZSlcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBiZ0xvZ2dlci5sb2coYFtCR10gVW5rbm93biBzdGVwICR7c3RhdGUuY3VycmVudFN0ZXB9LCBzdGFydGluZyBmcmVzaGApXG4gICAgICAgIGF3YWl0IEF1dG9GbG93U3RhdGVNYW5hZ2VyLmNsZWFyU3RhdGUoc3RhdGUudXNlck5hbWUpXG4gICAgICAgIGF3YWl0IGhhbmRsZUNoZWNrVXNlclN0YXR1cyhzdGF0ZS51c2VyTmFtZSwgc2VuZFJlc3BvbnNlKVxuICAgICAgICBicmVha1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBiZ0xvZ2dlci5lcnJvcignW0JHXSBGYWlsZWQgdG8gcmVzdW1lIGF1dG8tZmxvdzonLCBlcnJvcilcbiAgICBhd2FpdCBBdXRvRmxvd1N0YXRlTWFuYWdlci5jbGVhclN0YXRlKHN0YXRlPy51c2VyTmFtZSlcbiAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBlcnJvcjogYEZhaWxlZCB0byByZXN1bWUgYXV0by1mbG93OiAke2Vycm9yLm1lc3NhZ2V9YFxuICAgIH0pXG4gIH1cbn1cblxuLyoqXG4gKiBIYW5kbGUgY2hlY2sgdXNlciBzdGF0dXMgZnJvbSBwb3B1cCAtIHRyaWdnZXJzIGF1dG8gZmxvd1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2hlY2tVc2VyU3RhdHVzKHVzZXJOYW1lLCBzZW5kUmVzcG9uc2UpIHtcbiAgYmdMb2dnZXIubG9nKGBbQkddIFVzZXIgc3RhdHVzIGNoZWNrIHJlcXVlc3RlZCBmb3IgJHt1c2VyTmFtZX0gLSBzdGFydGluZyBhdXRvIGZsb3dgKVxuXG4gIHRyeSB7XG4gICAgY29uc3QgZXhpc3RpbmdTdGF0ZSA9IGF3YWl0IEF1dG9GbG93U3RhdGVNYW5hZ2VyLnJlY292ZXJTdGF0ZSh1c2VyTmFtZSlcbiAgICBpZiAoZXhpc3RpbmdTdGF0ZSkge1xuICAgICAgYmdMb2dnZXIubG9nKGBbQkddIFx1RDgzRFx1REQwNCBSZXN1bWluZyBpbnRlcnJ1cHRlZCBhdXRvLWZsb3cgZm9yICR7dXNlck5hbWV9IGF0IHN0ZXA6ICR7ZXhpc3RpbmdTdGF0ZS5jdXJyZW50U3RlcH1gKVxuICAgICAgYXdhaXQgcmVzdW1lQXV0b0Zsb3coZXhpc3RpbmdTdGF0ZSwgc2VuZFJlc3BvbnNlKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgYXdhaXQgQXV0b0Zsb3dTdGF0ZU1hbmFnZXIuc2F2ZVN0YXRlKCdzdGFydGluZycsIHsgdXNlck5hbWUsIHRhcmdldEFjdGlvbjogJ2F1dG9fZmxvdycgfSlcblxuICAgIC8vIFRyeSB0byBnZXQgcmVkZGl0VXNlciBmcm9tIHN0b3JhZ2UgZm9yIGRpcmVjdCBuYXZpZ2F0aW9uIG9wdGltaXphdGlvblxuICAgIGxldCBvcHRpbWl6ZWRVc2VyTmFtZSA9IHVzZXJOYW1lXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHN5bmNSZXN1bHQgPSBhd2FpdCBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldChbJ3JlZGRpdFVzZXInXSlcbiAgICAgIGNvbnN0IGxvY2FsUmVzdWx0ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsncmVkZGl0VXNlciddKVxuICAgICAgY29uc3QgcmVkZGl0VXNlciA9IHN5bmNSZXN1bHQucmVkZGl0VXNlciB8fCBsb2NhbFJlc3VsdC5yZWRkaXRVc2VyXG5cbiAgICAgIGlmIChyZWRkaXRVc2VyICYmIHJlZGRpdFVzZXIuc2VyZW5fbmFtZSkge1xuICAgICAgICBvcHRpbWl6ZWRVc2VyTmFtZSA9IHJlZGRpdFVzZXIuc2VyZW5fbmFtZVxuICAgICAgICBiZ0xvZ2dlci5sb2coYFtCR10gXHVEODNDXHVERkFGIEZvdW5kIHJlZGRpdFVzZXIgaW4gc3RvcmFnZSwgd2lsbCB1c2UgZGlyZWN0IG5hdmlnYXRpb24gdG8gc3VibWl0dGVkIHBhZ2UgZm9yOiAke29wdGltaXplZFVzZXJOYW1lfWApXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgYmdMb2dnZXIubG9nKCdbQkddIENvdWxkIG5vdCByZXRyaWV2ZSByZWRkaXRVc2VyIGZyb20gc3RvcmFnZSwgdXNpbmcgcHJvdmlkZWQgdXNlck5hbWUnKVxuICAgIH1cblxuICAgIC8vIEluaXRpYWxpemUgb3IgYWRvcHQgYSB1bmlmaWVkIFJlZGRpdCB0YWIgZm9yIGF1dG9mbG93LCBwcmVzZXJ2aW5nIGV4aXN0aW5nIHRhYnMgd2hlbiBwb3NzaWJsZVxuICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBcdUQ4M0RcdURFQTYgSW5pdGlhbGl6aW5nIHVuaWZpZWQgUmVkZGl0IHRhYiBmb3IgYXV0b2Zsb3cgKHJldXNpbmcgY3VycmVudCBSZWRkaXQgdGFiIHdoZW4gYXZhaWxhYmxlKScpXG4gICAgY29uc3QgZnJlc2hUYWJJZCA9IGF3YWl0IGNsb3NlQWxsUmVkZGl0VGFic0FuZE9wZW5GcmVzaChvcHRpbWl6ZWRVc2VyTmFtZSlcblxuICAgIC8vIFdhaXQgZm9yIHRoZSBjaG9zZW4gdGFiIHRvIGxvYWQgYmVmb3JlIHN0YXJ0aW5nIGF1dG9tYXRpb25cbiAgICBjb25zdCB0YWJMb2FkTGlzdGVuZXIgPSAodGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT4ge1xuICAgICAgaWYgKHRhYklkID09PSBmcmVzaFRhYklkICYmIGNoYW5nZUluZm8uc3RhdHVzID09PSAnY29tcGxldGUnKSB7XG4gICAgICAgIGNocm9tZS50YWJzLm9uVXBkYXRlZC5yZW1vdmVMaXN0ZW5lcih0YWJMb2FkTGlzdGVuZXIpXG4gICAgICAgIGJnTG9nZ2VyLmxvZyhgW0JHXSBVbmlmaWVkIFJlZGRpdCB0YWIgJHtmcmVzaFRhYklkfSBsb2FkZWQsIHN0YXJ0aW5nIGF1dG9tYXRpb25gKVxuICAgICAgICBzdGFydEF1dG9tYXRpb25Gb3JUYWIoZnJlc2hUYWJJZCwgdXNlck5hbWUpXG4gICAgICB9XG4gICAgfVxuICAgIGNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcih0YWJMb2FkTGlzdGVuZXIpXG5cbiAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIG1lc3NhZ2U6IG9wdGltaXplZFVzZXJOYW1lICE9PSB1c2VyTmFtZVxuICAgICAgICA/IGBJbml0aWFsaXplZCB1bmlmaWVkIFJlZGRpdCB0YWIgd2l0aCBkaXJlY3QgbmF2aWdhdGlvbiB0byAke29wdGltaXplZFVzZXJOYW1lfS9zdWJtaXR0ZWQvYFxuICAgICAgICA6ICdJbml0aWFsaXplZCB1bmlmaWVkIFJlZGRpdCB0YWIgZm9yIGF1dG9tYXRpb24nLFxuICAgICAgdGFiSWQ6IGZyZXNoVGFiSWQsXG4gICAgICB1c2VyTmFtZTogdXNlck5hbWVcbiAgICB9KVxuICAgIHJldHVyblxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGJnTG9nZ2VyLmVycm9yKCdbQkddIEZhaWxlZCB0byBzdGFydCB1c2VyIHN0YXR1cyBjaGVjayBhdXRvbWF0aW9uOicsIGVycm9yKVxuICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlLFxuICAgICAgdXNlck5hbWU6IHVzZXJOYW1lXG4gICAgfSlcbiAgfVxufVxuXG4vKipcbiAqIEhhbmRsZSBjbG9zZSBjdXJyZW50IHRhYiByZXF1ZXN0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVDbG9zZUN1cnJlbnRUYWIodGFiSWQsIHNlbmRSZXNwb25zZSkge1xuICBiZ0xvZ2dlci5sb2coYFtCR10gUmVxdWVzdCB0byBjbG9zZSB0YWIgJHt0YWJJZH1gKVxuXG4gIHRyeSB7XG4gICAgaWYgKHRhYklkKSB7XG4gICAgICBhd2FpdCBjaHJvbWUudGFicy5yZW1vdmUodGFiSWQpXG4gICAgICBiZ0xvZ2dlci5sb2coYFtCR10gU3VjY2Vzc2Z1bGx5IGNsb3NlZCB0YWIgJHt0YWJJZH1gKVxuICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdObyB0YWJJZCBwcm92aWRlZCBmb3IgQ0xPU0VfQ1VSUkVOVF9UQUInIH0pXG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGJnTG9nZ2VyLmVycm9yKCdbQkddIEZhaWxlZCB0byBjbG9zZSB0YWI6JywgZXJyb3IpXG4gICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pXG4gIH1cbn1cblxuLyoqXG4gKiBIYW5kbGUgcHJvZmlsZSBkYXRhIHN0b3JlZCBub3RpZmljYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZVByb2ZpbGVEYXRhU3RvcmVkKHVzZXJuYW1lLCBwb3N0c0NvdW50LCBzZW5kUmVzcG9uc2UpIHtcbiAgYmdMb2dnZXIubG9nKGBbQkddIFByb2ZpbGUgZGF0YSBzdG9yZWQgZm9yICR7dXNlcm5hbWV9IHdpdGggJHtwb3N0c0NvdW50fSBwb3N0c2ApXG4gIGNocm9tZS5hY3Rpb24uc2V0QmFkZ2VUZXh0KHsgdGV4dDogJ1x1RDgzRFx1REM2NCcgfSlcbiAgY2hyb21lLmFjdGlvbi5zZXRCYWRnZUJhY2tncm91bmRDb2xvcih7IGNvbG9yOiAnIzRjYWY1MCcgfSlcbiAgc2V0VGltZW91dCgoKSA9PiB7IGNocm9tZS5hY3Rpb24uc2V0QmFkZ2VUZXh0KHsgdGV4dDogJycgfSkgfSwgMzAwMClcbiAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KVxufVxuXG4vKipcbiAqIEhhbmRsZSB0b2dnbGUgYXV0by1ydW4gc2V0dGluZ3NcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRvZ2dsZUF1dG9SdW4oc2NyaXB0VHlwZSwgZW5hYmxlZCwgc2VuZFJlc3BvbnNlKSB7XG4gIGJnTG9nZ2VyLmxvZyhgW0JHXSBUb2dnbGluZyBhdXRvLXJ1biBmb3IgJHtzY3JpcHRUeXBlfTogJHtlbmFibGVkfWApXG5cbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldChbJ2F1dG9SdW5TZXR0aW5ncyddKVxuICAgIGNvbnN0IHNldHRpbmdzID0gcmVzdWx0LmF1dG9SdW5TZXR0aW5ncyB8fCB7IHByb2ZpbGVEZXRlY3Rpb246IHRydWUsIHBvc3RTdWJtaXNzaW9uOiB0cnVlIH1cblxuICAgIGlmIChzY3JpcHRUeXBlID09PSAncHJvZmlsZScpIHtcbiAgICAgIHNldHRpbmdzLnByb2ZpbGVEZXRlY3Rpb24gPSBlbmFibGVkXG4gICAgfSBlbHNlIGlmIChzY3JpcHRUeXBlID09PSAncG9zdCcpIHtcbiAgICAgIHNldHRpbmdzLnBvc3RTdWJtaXNzaW9uID0gZW5hYmxlZFxuICAgIH0gZWxzZSBpZiAoc2NyaXB0VHlwZSA9PT0gJ2FsbCcpIHtcbiAgICAgIHNldHRpbmdzLnByb2ZpbGVEZXRlY3Rpb24gPSBlbmFibGVkXG4gICAgICBzZXR0aW5ncy5wb3N0U3VibWlzc2lvbiA9IGVuYWJsZWRcbiAgICB9XG5cbiAgICBhd2FpdCBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7IGF1dG9SdW5TZXR0aW5nczogc2V0dGluZ3MgfSlcbiAgICBiZ0xvZ2dlci5sb2coJ1tCR10gQXV0by1ydW4gc2V0dGluZ3MgdXBkYXRlZDonLCBzZXR0aW5ncylcblxuICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIHNldHRpbmdzIH0pXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgYmdMb2dnZXIuZXJyb3IoJ1tCR10gRmFpbGVkIHRvIHRvZ2dsZSBhdXRvLXJ1bjonLCBlcnJvcilcbiAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSlcbiAgfVxufVxuXG4vKipcbiAqIEhhbmRsZSBtYW51YWwgc2NyaXB0IHRyaWdnZXIgZnJvbSBwb3B1cFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlVHJpZ2dlclNjcmlwdE1hbnVhbChzY3JpcHRUeXBlLCB0YWJJZCwgc2VuZFJlc3BvbnNlKSB7XG4gIGJnTG9nZ2VyLmxvZyhgW0JHXSBNYW51YWwgdHJpZ2dlciBmb3IgJHtzY3JpcHRUeXBlfSBvbiB0YWIgJHt0YWJJZH1gKVxuXG4gIHRyeSB7XG4gICAgaWYgKHNjcmlwdFR5cGUgPT09ICdwcm9maWxlJykge1xuICAgICAgaWYgKCF0YWJJZCkge1xuICAgICAgICBjb25zdCB0YWJzID0gYXdhaXQgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSlcbiAgICAgICAgaWYgKHRhYnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTm8gYWN0aXZlIHRhYiBmb3VuZCcgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0YWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIH1cblxuICAgICAgYXdhaXQgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiSWQsIHtcbiAgICAgICAgdHlwZTogJ01BTlVBTF9UUklHR0VSX1NDUklQVCcsXG4gICAgICAgIHNjcmlwdFR5cGU6IHNjcmlwdFR5cGUsXG4gICAgICAgIG1vZGU6ICdtYW51YWwnXG4gICAgICB9KVxuXG4gICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlOiBgTWFudWFsICR7c2NyaXB0VHlwZX0gc2NyaXB0IHRyaWdnZXJlZGAgfSlcbiAgICB9IGVsc2UgaWYgKHNjcmlwdFR5cGUgPT09ICdwb3N0Jykge1xuICAgICAgYmdMb2dnZXIubG9nKCdbQkddIENyZWF0aW5nIG5ldyBwb3N0IHRhYiBmb3IgbWFudWFsIHRyaWdnZXInKVxuXG4gICAgICBjb25zdCB1c2VyUmVzdWx0ID0gYXdhaXQgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoWydyZWRkaXRVc2VyJ10pXG4gICAgICBjb25zdCB1c2VyTmFtZSA9IHVzZXJSZXN1bHQucmVkZGl0VXNlcj8uc2VyZW5fbmFtZSB8fCAnVXNlcidcblxuICAgICAgY29uc3QgcG9zdERhdGEgPSB7XG4gICAgICAgIHRpdGxlOiBcIk1hbnVhbCBwb3N0OiBcIiArIERhdGUubm93KCksXG4gICAgICAgIGJvZHk6IFwiI21hbnVhbCAjcmVkZGl0ICNwb3N0IFwiICsgRGF0ZS5ub3coKSxcbiAgICAgICAgdXJsOiBcImh0dHBzOi8veW91dHViZS5jb20vc2hvcnRzLzB4bWhyU19WTk5ZP3NpPWF3WWM4aTVZbGp5Y2VzWHFcIixcbiAgICAgICAgc3VicmVkZGl0OiBcInNwaHlueFwiXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5ld1RhYklkID0gYXdhaXQgY3JlYXRlQ2xlYW5Qb3N0VGFiKHVzZXJOYW1lLCBwb3N0RGF0YSlcblxuICAgICAgc2VuZFJlc3BvbnNlKHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgbWVzc2FnZTogJ01hbnVhbCBwb3N0IGNyZWF0aW9uIHRhYiBvcGVuZWQnLFxuICAgICAgICB0YWJJZDogbmV3VGFiSWRcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1Vua25vd24gc2NyaXB0IHR5cGUnIH0pXG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGJnTG9nZ2VyLmVycm9yKCdbQkddIEZhaWxlZCB0byB0cmlnZ2VyIG1hbnVhbCBzY3JpcHQ6JywgZXJyb3IpXG4gICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pXG4gIH1cbn1cblxuLyoqXG4gKiBIYW5kbGUgY3JlYXRlIHBvc3QgdGFiIHJlcXVlc3QgZnJvbSBjb250ZW50IHNjcmlwdFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ3JlYXRlUG9zdFRhYihwb3N0RGF0YSwgc2VuZFJlc3BvbnNlKSB7XG4gIGJnTG9nZ2VyLmxvZygnW0JHXSBDcmVhdGluZyBuZXcgcG9zdCB0YWIgZnJvbSBjb250ZW50IHNjcmlwdCByZXF1ZXN0JylcblxuICB0cnkge1xuICAgIGNvbnN0IHN5bmNSZXN1bHQgPSBhd2FpdCBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldChbJ3JlZGRpdFVzZXInXSlcbiAgICBjb25zdCBsb2NhbFJlc3VsdCA9IGF3YWl0IGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ3JlZGRpdFVzZXInXSlcbiAgICBjb25zdCByZWRkaXRVc2VyID0gc3luY1Jlc3VsdC5yZWRkaXRVc2VyIHx8IGxvY2FsUmVzdWx0LnJlZGRpdFVzZXJcbiAgICBjb25zdCB1c2VyTmFtZSA9IHJlZGRpdFVzZXI/LnNlcmVuX25hbWUgfHwgJ1VzZXInXG5cbiAgICBsZXQgZnJlc2hQb3N0RGF0YVxuICAgIGlmIChyZWRkaXRVc2VyICYmIHJlZGRpdFVzZXIuc2VyZW5fbmFtZSkge1xuICAgICAgYmdMb2dnZXIubG9nKGBbQkddIEdlbmVyYXRpbmcgZnJlc2ggcG9zdCBkYXRhIGZvciB1c2VyOiAke3JlZGRpdFVzZXIuc2VyZW5fbmFtZX1gKVxuICAgICAgZnJlc2hQb3N0RGF0YSA9IGF3YWl0IFBvc3REYXRhU2VydmljZS5nZW5lcmF0ZVBvc3QocmVkZGl0VXNlci5zZXJlbl9uYW1lKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSAnTm8gdXNlcm5hbWUgZm91bmQgLSBjYW5ub3QgZ2VuZXJhdGUgcG9zdCB3aXRob3V0IHVzZXIgY29udGV4dCdcbiAgICAgIGJnTG9nZ2VyLmVycm9yKCdbQkddICcgKyBlcnJvck1lc3NhZ2UpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKVxuICAgIH1cblxuICAgIGJnTG9nZ2VyLmxvZygnW0JHXSBVc2luZyBmcmVzaCBBUEktZ2VuZXJhdGVkIHBvc3QgZGF0YTonLCBmcmVzaFBvc3REYXRhKVxuXG4gICAgY29uc3QgbmV3VGFiSWQgPSBhd2FpdCBjcmVhdGVDbGVhblBvc3RUYWIodXNlck5hbWUsIGZyZXNoUG9zdERhdGEpXG5cbiAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIG1lc3NhZ2U6ICdQb3N0IGNyZWF0aW9uIHRhYiBvcGVuZWQnLFxuICAgICAgdGFiSWQ6IG5ld1RhYklkXG4gICAgfSlcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBiZ0xvZ2dlci5lcnJvcignW0JHXSBGYWlsZWQgdG8gY3JlYXRlIHBvc3QgdGFiIGZyb20gY29udGVudCBzY3JpcHQ6JywgZXJyb3IpXG4gICAgc2VuZFJlc3BvbnNlKHtcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2VcbiAgICB9KVxuICB9XG59XG5cbi8qKlxuICogSGFuZGxlIGdldCB0YWIgc3RhdGUgcmVxdWVzdCBmcm9tIGNvbnRlbnQgc2NyaXB0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRUYWJTdGF0ZSh0YWJJZCwgc2VuZFJlc3BvbnNlKSB7XG4gIGJnTG9nZ2VyLmxvZyhgW0JHXSBHZXR0aW5nIHRhYiBzdGF0ZSBmb3IgdGFiICR7dGFiSWR9YClcblxuICB0cnkge1xuICAgIGNvbnN0IHN0YXRlID0gdGFiU3RhdGVzW3RhYklkXVxuICAgIGNvbnN0IGlzQmFja2dyb3VuZFBvc3RUYWIgPSBzdGF0ZSAmJiBzdGF0ZS5pc1Bvc3RUYWJcblxuICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgaXNCYWNrZ3JvdW5kUG9zdFRhYjogaXNCYWNrZ3JvdW5kUG9zdFRhYixcbiAgICAgIHN0YXRlOiBzdGF0ZVxuICAgIH0pXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgYmdMb2dnZXIuZXJyb3IoJ1tCR10gRmFpbGVkIHRvIGdldCB0YWIgc3RhdGU6JywgZXJyb3IpXG4gICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pXG4gIH1cbn1cblxuLyoqXG4gKiBIYW5kbGUgcmV1c2UgcmVkZGl0IHRhYiByZXF1ZXN0IGZyb20gcG9wdXBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJldXNlUmVkZGl0VGFiKHRhcmdldFVybCwgYWN0aW9uLCBzZW5kUmVzcG9uc2UpIHtcbiAgYmdMb2dnZXIubG9nKGBbQkddIFJldXNpbmcgcmVkZGl0IHRhYiBmb3IgYWN0aW9uOmAsIGFjdGlvbilcbiAgYmdMb2dnZXIubG9nKGBbQkddIFRhcmdldCBVUkw6ICR7dGFyZ2V0VXJsfWApXG5cbiAgdHJ5IHtcbiAgICBjb25zdCBleGlzdGluZ1RhYnMgPSBhd2FpdCBjaHJvbWUudGFicy5xdWVyeSh7IHVybDogJyo6Ly8qLnJlZGRpdC5jb20vKicgfSlcblxuICAgIGxldCB0YXJnZXRUYWJcblxuICAgIGlmIChleGlzdGluZ1RhYnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgaW5hY3RpdmVUYWIgPSBleGlzdGluZ1RhYnMuZmluZCgodGFiKSA9PiAhdGFiLmFjdGl2ZSlcbiAgICAgIHRhcmdldFRhYiA9IGluYWN0aXZlVGFiIHx8IGV4aXN0aW5nVGFic1swXVxuXG4gICAgICBiZ0xvZ2dlci5sb2coYFtCR10gUmV1c2luZyBleGlzdGluZyB0YWIgJHt0YXJnZXRUYWIuaWR9IGZvciBhY3Rpb24sIG5hdmlnYXRpbmcgdG8gJHt0YXJnZXRVcmx9YClcblxuICAgICAgYXdhaXQgY2hyb21lLnRhYnMudXBkYXRlKHRhcmdldFRhYi5pZCwge1xuICAgICAgICB1cmw6IHRhcmdldFVybCxcbiAgICAgICAgYWN0aXZlOiB0cnVlXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBiZ0xvZ2dlci5sb2coYFtCR10gTm8gZXhpc3RpbmcgcmVkZGl0LmNvbSB0YWJzIGZvdW5kLCBjcmVhdGluZyBuZXcgdGFiIHdpdGggVVJMOiAke3RhcmdldFVybH1gKVxuICAgICAgdGFyZ2V0VGFiID0gYXdhaXQgY2hyb21lLnRhYnMuY3JlYXRlKHtcbiAgICAgICAgdXJsOiB0YXJnZXRVcmwsXG4gICAgICAgIGFjdGl2ZTogdHJ1ZVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCB0YWJMb2FkTGlzdGVuZXIgPSAodGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT4ge1xuICAgICAgaWYgKHRhYklkID09PSB0YXJnZXRUYWIuaWQgJiYgY2hhbmdlSW5mby5zdGF0dXMgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgY2hyb21lLnRhYnMub25VcGRhdGVkLnJlbW92ZUxpc3RlbmVyKHRhYkxvYWRMaXN0ZW5lcilcblxuICAgICAgICBiZ0xvZ2dlci5sb2coYFtCR10gVGFiICR7dGFyZ2V0VGFiLmlkfSBsb2FkZWQsIHdhaXRpbmcgZm9yIGNvbnRlbnQgc2NyaXB0IHRvIGJlIHJlYWR5Li4uYClcblxuICAgICAgICAvLyBXYWl0IGZvciBjb250ZW50IHNjcmlwdCB0byBiZSByZWFkeSBiZWZvcmUgc2VuZGluZyB0aGUgYWN0aW9uXG4gICAgICAgIHdhaXRGb3JDb250ZW50U2NyaXB0KHRhcmdldFRhYi5pZCwgeyByZXRyaWVzOiAxNSwgaW5pdGlhbERlbGF5TXM6IDUwMCB9KVxuICAgICAgICAgIC50aGVuKChyZWFkeSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFyZWFkeSkge1xuICAgICAgICAgICAgICBiZ0xvZ2dlci5lcnJvcihgW0JHXSBcdTI3NEMgQ29udGVudCBzY3JpcHQgbm90IHJlYWR5IGluIHRhYiAke3RhcmdldFRhYi5pZH0gYWZ0ZXIgcmV0cmllc2ApXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBiZ0xvZ2dlci5sb2coYFtCR10gXHUyNzA1IENvbnRlbnQgc2NyaXB0IHJlYWR5IGluIHRhYiAke3RhcmdldFRhYi5pZH0sIHNlbmRpbmcgYWN0aW9uOiAke2FjdGlvbi50eXBlfWApXG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhcmdldFRhYi5pZCwgYWN0aW9uKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGJnTG9nZ2VyLmxvZyhgW0JHXSBcdTI3MDUgQWN0aW9uICR7YWN0aW9uLnR5cGV9IHNlbnQgc3VjY2Vzc2Z1bGx5IHRvIHRhYiAke3RhcmdldFRhYi5pZH1gKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgIGJnTG9nZ2VyLmVycm9yKGBbQkddIFx1Mjc0QyBGYWlsZWQgdG8gc2VuZCBhY3Rpb24gdG8gdGFiICR7dGFyZ2V0VGFiLmlkfTpgLCBlcnIpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICBiZ0xvZ2dlci5lcnJvcihgW0JHXSBcdTI3NEMgRXJyb3Igc2VuZGluZyBhY3Rpb24gdG8gdGFiICR7dGFyZ2V0VGFiLmlkfTpgLCBlcnIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgYmdMb2dnZXIuZXJyb3IoYFtCR10gXHUyNzRDIEVycm9yIHdhaXRpbmcgZm9yIGNvbnRlbnQgc2NyaXB0OmAsIGVycilcbiAgICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIGNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcih0YWJMb2FkTGlzdGVuZXIpXG5cbiAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIG1lc3NhZ2U6IGBSZWRkaXQgdGFiIHJldXNlZC9jcmVhdGVkIGZvciAke2FjdGlvbn1gLFxuICAgICAgdGFiSWQ6IHRhcmdldFRhYi5pZFxuICAgIH0pXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgYmdMb2dnZXIuZXJyb3IoJ1tCR10gRmFpbGVkIHRvIHJldXNlIHJlZGRpdCB0YWI6JywgZXJyb3IpXG4gICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pXG4gIH1cbn1cblxuLyoqXG4gKiBIYW5kbGUgb3BlbiBleHRlbnNpb24gcmVxdWVzdCBmcm9tIGNvbnRlbnQgc2NyaXB0c1xuICogT3BlbnMgb3IgZm9jdXNlcyB0aGUgZXh0ZW5zaW9uJ3Mgc2luZ2xlIFVJIHRhYiB1c2luZyB1bmlmaWVkIHRhYiBtYW5hZ2VyXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVPcGVuRXh0ZW5zaW9uKHNlbmRSZXNwb25zZSkge1xuICBiZ0xvZ2dlci5sb2coJ1tCR10gT3BlbmluZy9mb2N1c2luZyBleHRlbnNpb24gVUkgdGFiIHVzaW5nIHVuaWZpZWQgdGFiIG1hbmFnZXInKVxuXG4gIHRyeSB7XG4gICAgY29uc3QgdGFiSWQgPSBhd2FpdCBnZXRFeHRlbnNpb25UYWIoKVxuICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgbWVzc2FnZTogJ0V4dGVuc2lvbiB0YWIgb3BlbmVkL2ZvY3VzZWQnLFxuICAgICAgdGFiSWQ6IHRhYklkXG4gICAgfSlcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBiZ0xvZ2dlci5lcnJvcignW0JHXSBGYWlsZWQgdG8gb3BlbiBleHRlbnNpb24gdGFiOicsIGVycm9yKVxuICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlXG4gICAgfSlcbiAgfVxufVxuIiwgImltcG9ydCB7IGJnTG9nZ2VyIH0gZnJvbSBcIi4vbG9nZ2VyLmpzXCI7LyoqXG4gKiBCYWNrZ3JvdW5kIHNjcmlwdCBmb3IgUmVkZGl0IFBvc3QgTWFjaGluZVxuICogRW50cnkgcG9pbnQgdGhhdCBpbXBvcnRzIG1vZHVsYXIgY29tcG9uZW50c1xuICovXG5cbmltcG9ydCB7IGJleEJhY2tncm91bmQgfSBmcm9tICdxdWFzYXIvd3JhcHBlcnMnXG5pbXBvcnQge1xuICBsb2dUb1RhYixcbiAgd2FpdEZvckNvbnRlbnRTY3JpcHQsXG4gIHNlbmRHZXRQb3N0cyxcbiAgY3JlYXRlQ2xlYW5Qb3N0VGFiLFxuICBjcmVhdGVPclJldXNlUG9zdFRhYixcbiAgZmluYWxpemVBdXRvRmxvd1RvU3VibWl0dGVkLFxuICBwcm9jZWVkV2l0aFBvc3RDcmVhdGlvbixcbiAgc3RhcnRBdXRvbWF0aW9uRm9yVGFiLFxuICB0cmlnZ2VyUGVyaW9kaWNDaGVjayxcbiAgY2hlY2tBbmRBZHZhbmNlU3RhdGUsXG4gIGhhbmRsZUNvbnRlbnRTY3JpcHRSZWFkeSxcbiAgaGFuZGxlQWN0aW9uQ29tcGxldGVkLFxuICBoYW5kbGVHZXRSZWRkaXRJbmZvLFxuICBoYW5kbGVDcmVhdGVQb3N0LFxuICBoYW5kbGVTYXZlU2V0dGluZ3MsXG4gIGhhbmRsZVVzZXJuYW1lU3RvcmVkLFxuICBoYW5kbGVHZXRTdG9yZWRVc2VybmFtZSxcbiAgaGFuZGxlVXNlclN0YXR1c1NhdmVkLFxuICBoYW5kbGVHZXRVc2VyU3RhdHVzLFxuICBoYW5kbGVDcmVhdGVQb3N0RnJvbVBvcHVwLFxuICBoYW5kbGVDbG9zZUN1cnJlbnRUYWIsXG4gIGhhbmRsZVByb2ZpbGVEYXRhU3RvcmVkLFxuICBoYW5kbGVUb2dnbGVBdXRvUnVuLFxuICBoYW5kbGVUcmlnZ2VyU2NyaXB0TWFudWFsLFxuICBoYW5kbGVDcmVhdGVQb3N0VGFiLFxuICBoYW5kbGVHZXRUYWJTdGF0ZSxcbiAgaGFuZGxlUmV1c2VSZWRkaXRUYWIsXG4gIHJlc3VtZUF1dG9GbG93LFxuICBoYW5kbGVDaGVja1VzZXJTdGF0dXMsXG4gIGhhbmRsZU9wZW5FeHRlbnNpb25cbn0gZnJvbSAnLi9tZXNzYWdlLWhhbmRsZXJzLmpzJ1xuXG5pbXBvcnQge1xuICBnZXRFeHRlbnNpb25UYWIsXG4gIGhhbmRsZVRhYkNsb3NlZFxufSBmcm9tICcuL3VuaWZpZWQtdGFiLW1hbmFnZXIuanMnXG5cbmltcG9ydCB7XG4gIEF1dG9GbG93U3RhdGVNYW5hZ2VyLFxuICBTTV9TVEVQUyxcbiAgdGFiU3RhdGVzLFxuICBwcm9jZXNzZWRUYWJzLFxuICBDSEVDS19JTlRFUlZBTCxcbiAgZ2V0U3RhbGxXYXRjaGRvZ0ludGVydmFsSWQsXG4gIHNldFN0YWxsV2F0Y2hkb2dJbnRlcnZhbElkLFxuICB0b3VjaFRhYlN0YXRlXG59IGZyb20gJy4vc3RhdGUtbWFuYWdlci5qcydcblxuLy8gPT09PT0gRU5UUlkgUE9JTlQgPT09PT1cblxuLy8gSGVscGVyIGZ1bmN0aW9uIHRvIHJlc3RhcnQgYXV0by1mbG93IGZyb20gdGhlIGJlZ2lubmluZ1xuYXN5bmMgZnVuY3Rpb24gcmVzdGFydEF1dG9GbG93RnJvbUJlZ2lubmluZyh1c2VyTmFtZSkge1xuICBpZiAoIXVzZXJOYW1lKSByZXR1cm5cbiAgYXdhaXQgQXV0b0Zsb3dTdGF0ZU1hbmFnZXIuY2xlYXJTdGF0ZSh1c2VyTmFtZSlcbiAgaGFuZGxlQ2hlY2tVc2VyU3RhdHVzKHVzZXJOYW1lLCAoKSA9PiB7fSlcbn1cblxuLy8gSGFuZGxlIG1lc3NhZ2VzIGZyb20gY29udGVudCBzY3JpcHRzIGFuZCBwb3B1cFxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICBjb25zdCBzZW5kZXJUYWJJZCA9IHNlbmRlci50YWIgPyBzZW5kZXIudGFiLmlkIDogbnVsbFxuICBiZ0xvZ2dlci5sb2coJ0JhY2tncm91bmQgcmVjZWl2ZWQgbWVzc2FnZTonLCBtZXNzYWdlLnR5cGUsIHNlbmRlclRhYklkID8gYGZyb20gdGFiICR7c2VuZGVyVGFiSWR9YCA6ICdmcm9tIHBvcHVwJylcblxuICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgIGNhc2UgJ0dFVF9SRURESVRfSU5GTyc6XG4gICAgICBoYW5kbGVHZXRSZWRkaXRJbmZvKHNlbmRSZXNwb25zZSlcbiAgICAgIGJyZWFrXG5cbiAgICBjYXNlICdDUkVBVEVfUE9TVCc6XG4gICAgICBoYW5kbGVDcmVhdGVQb3N0KG1lc3NhZ2UuZGF0YSwgc2VuZFJlc3BvbnNlKVxuICAgICAgcmV0dXJuIHRydWVcblxuICAgIGNhc2UgJ1NBVkVfU0VUVElOR1MnOlxuICAgICAgaGFuZGxlU2F2ZVNldHRpbmdzKG1lc3NhZ2UuZGF0YSwgc2VuZFJlc3BvbnNlKVxuICAgICAgYnJlYWtcblxuICAgIGNhc2UgJ1VTRVJOQU1FX1NUT1JFRCc6XG4gICAgICBoYW5kbGVVc2VybmFtZVN0b3JlZChtZXNzYWdlLnVzZXJuYW1lLCBtZXNzYWdlLnRpbWVzdGFtcCwgc2VuZFJlc3BvbnNlKVxuICAgICAgYnJlYWtcblxuICAgIGNhc2UgJ0dFVF9TVE9SRURfVVNFUk5BTUUnOlxuICAgICAgaGFuZGxlR2V0U3RvcmVkVXNlcm5hbWUoc2VuZFJlc3BvbnNlKVxuICAgICAgcmV0dXJuIHRydWVcblxuICAgIGNhc2UgJ0dFVF9VU0VSX1NUQVRVUyc6XG4gICAgICBoYW5kbGVHZXRVc2VyU3RhdHVzKHNlbmRSZXNwb25zZSlcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICBjYXNlICdDSEVDS19VU0VSX1NUQVRVUyc6XG4gICAgICBoYW5kbGVDaGVja1VzZXJTdGF0dXMobWVzc2FnZS51c2VyTmFtZSwgc2VuZFJlc3BvbnNlKVxuICAgICAgcmV0dXJuIHRydWVcblxuICAgIGNhc2UgJ0NSRUFURV9QT1NUX0ZST01fUE9QVVAnOlxuICAgICAgaGFuZGxlQ3JlYXRlUG9zdEZyb21Qb3B1cChtZXNzYWdlLnVzZXJOYW1lLCBzZW5kUmVzcG9uc2UpXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgY2FzZSAnQ09OVEVOVF9TQ1JJUFRfUkVBRFknOlxuICAgICAgaGFuZGxlQ29udGVudFNjcmlwdFJlYWR5KHNlbmRlclRhYklkLCBtZXNzYWdlLnVybClcbiAgICAgIHNlbmRSZXNwb25zZSh7IHJlY2VpdmVkOiB0cnVlIH0pXG4gICAgICBicmVha1xuXG4gICAgY2FzZSAnVVJMX0NIQU5HRUQnOlxuICAgICAgaWYgKHNlbmRlclRhYklkKSB7XG4gICAgICAgIGJnTG9nZ2VyLmxvZyhgVVJMIENoYW5nZWQgaW4gdGFiICR7c2VuZGVyVGFiSWR9OiAke21lc3NhZ2UudXJsfWApXG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGFiU3RhdGVzW3NlbmRlclRhYklkXVxuICAgICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgICBjaGVja0FuZEFkdmFuY2VTdGF0ZShzZW5kZXJUYWJJZCwgc3RhdGUsIG1lc3NhZ2UudXJsKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZW5kUmVzcG9uc2UoeyByZWNlaXZlZDogdHJ1ZSB9KVxuICAgICAgYnJlYWtcblxuICAgIGNhc2UgJ0FDVElPTl9DT01QTEVURUQnOlxuICAgICAgaGFuZGxlQWN0aW9uQ29tcGxldGVkKHNlbmRlclRhYklkLCBtZXNzYWdlLmFjdGlvbiwgbWVzc2FnZS5zdWNjZXNzLCBtZXNzYWdlLmRhdGEpXG4gICAgICBzZW5kUmVzcG9uc2UoeyByZWNlaXZlZDogdHJ1ZSB9KVxuICAgICAgcmV0dXJuIHRydWVcblxuICAgIGNhc2UgJ1VTRVJfU1RBVFVTX1NBVkVEJzpcbiAgICAgIGhhbmRsZVVzZXJTdGF0dXNTYXZlZChtZXNzYWdlLmRhdGEsIHNlbmRSZXNwb25zZSlcbiAgICAgIGJyZWFrXG5cbiAgICBjYXNlICdDTE9TRV9DVVJSRU5UX1RBQic6XG4gICAgICBoYW5kbGVDbG9zZUN1cnJlbnRUYWIoc2VuZGVyVGFiSWQsIHNlbmRSZXNwb25zZSlcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICBjYXNlICdQUk9GSUxFX0RBVEFfU1RPUkVEJzpcbiAgICAgIGhhbmRsZVByb2ZpbGVEYXRhU3RvcmVkKG1lc3NhZ2UudXNlcm5hbWUsIG1lc3NhZ2UucG9zdHNDb3VudCwgc2VuZFJlc3BvbnNlKVxuICAgICAgYnJlYWtcblxuICAgIGNhc2UgJ1RPR0dMRV9BVVRPX1JVTic6XG4gICAgICBoYW5kbGVUb2dnbGVBdXRvUnVuKG1lc3NhZ2Uuc2NyaXB0VHlwZSwgbWVzc2FnZS5lbmFibGVkLCBzZW5kUmVzcG9uc2UpXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgY2FzZSAnVFJJR0dFUl9TQ1JJUFRfTUFOVUFMJzpcbiAgICAgIGhhbmRsZVRyaWdnZXJTY3JpcHRNYW51YWwobWVzc2FnZS5zY3JpcHRUeXBlLCBzZW5kZXJUYWJJZCwgc2VuZFJlc3BvbnNlKVxuICAgICAgcmV0dXJuIHRydWVcblxuICAgIGNhc2UgJ0NSRUFURV9QT1NUX1RBQic6XG4gICAgICBoYW5kbGVDcmVhdGVQb3N0VGFiKG1lc3NhZ2UucG9zdERhdGEsIHNlbmRSZXNwb25zZSlcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICBjYXNlICdHRVRfVEFCX1NUQVRFJzpcbiAgICAgIGhhbmRsZUdldFRhYlN0YXRlKHNlbmRlclRhYklkLCBzZW5kUmVzcG9uc2UpXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgY2FzZSAnUkVVU0VfUkVERElUX1RBQic6XG4gICAgICBoYW5kbGVSZXVzZVJlZGRpdFRhYihtZXNzYWdlLnVybCwgbWVzc2FnZS5hY3Rpb24sIHNlbmRSZXNwb25zZSlcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICBjYXNlICdSRVNVTUVfQVVUT19GTE9XJzpcbiAgICAgIHJlc3VtZUF1dG9GbG93KG1lc3NhZ2Uuc3RhdGUsIHNlbmRSZXNwb25zZSlcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICBjYXNlICdPUEVOX0VYVEVOU0lPTic6XG4gICAgICBoYW5kbGVPcGVuRXh0ZW5zaW9uKHNlbmRSZXNwb25zZSlcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICBkZWZhdWx0OlxuICAgICAgYmdMb2dnZXIubG9nKCdVbmtub3duIG1lc3NhZ2UgdHlwZTonLCBtZXNzYWdlLnR5cGUpXG4gICAgICBzZW5kUmVzcG9uc2UoeyBlcnJvcjogJ1Vua25vd24gbWVzc2FnZSB0eXBlJyB9KVxuICB9XG59KVxuXG4vLyBNb25pdG9yIHRhYiB1cGRhdGVzXG5jaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoYXN5bmMgKHRhYklkLCBjaGFuZ2VJbmZvLCB0YWIpID0+IHtcbiAgY29uc3Qgc3RhdGUgPSB0YWJTdGF0ZXNbdGFiSWRdXG5cbiAgaWYgKChjaGFuZ2VJbmZvLnVybCB8fCBjaGFuZ2VJbmZvLnN0YXR1cyA9PT0gJ2NvbXBsZXRlJykgJiYgdGFiLnVybCAmJiB0YWIudXJsLmluY2x1ZGVzKCdyZWRkaXQuY29tJykpIHtcbiAgICBpZiAoc3RhdGUpIHtcbiAgICAgIGNoZWNrQW5kQWR2YW5jZVN0YXRlKHRhYklkLCBzdGF0ZSwgdGFiLnVybClcbiAgICB9XG4gIH1cbn0pXG5cbi8vIENsZWFudXAgY2xvc2VkIHRhYnNcbmNocm9tZS50YWJzLm9uUmVtb3ZlZC5hZGRMaXN0ZW5lcigodGFiSWQpID0+IHtcbiAgZGVsZXRlIHRhYlN0YXRlc1t0YWJJZF1cbiAgcHJvY2Vzc2VkVGFicy5kZWxldGUodGFiSWQpXG4gIC8vIEhhbmRsZSBleHRlbnNpb24gdGFiIGNsb3N1cmVcbiAgaGFuZGxlVGFiQ2xvc2VkKHRhYklkKS5jYXRjaCgoKSA9PiB7fSlcbn0pXG5cbi8vIEV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZvciBRdWFzYXIgYnJpZGdlIGNvbXBhdGliaWxpdHlcbmV4cG9ydCBkZWZhdWx0IGJleEJhY2tncm91bmQoKGJyaWRnZSkgPT4ge1xuICBiZ0xvZ2dlci5sb2coJ0JhY2tncm91bmQgc2NyaXB0IGJyaWRnZSBpbml0aWFsaXplZCcsIGJyaWRnZSlcblxuICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5yZW1vdmUoWydhdXRvRmxvd1N0YXRlX3Vua25vd24nXSkuY2F0Y2goKCkgPT4ge30pXG5cbiAgLy8gU2V0dXAgc3RhbGwgd2F0Y2hkb2cgdG8gZGV0ZWN0IGFuZCByZWNvdmVyIGZyb20gc3R1Y2sgYXV0b21hdGlvbiBzdGF0ZXNcbiAgY29uc3QgU1RBTExfVElNRU9VVF9NUyA9IDUgKiA2MCAqIDEwMDBcbiAgc2V0U3RhbGxXYXRjaGRvZ0ludGVydmFsSWQoc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KClcbiAgICBmb3IgKGNvbnN0IFt0YWJJZFN0ciwgc3RhdGVdIG9mIE9iamVjdC5lbnRyaWVzKHRhYlN0YXRlcykpIHtcbiAgICAgIGlmICghc3RhdGUpIGNvbnRpbnVlXG4gICAgICBpZiAoc3RhdGUuc3RhdHVzID09PSBTTV9TVEVQUy5QT1NUSU5HKSBjb250aW51ZVxuICAgICAgY29uc3QgbGFzdFRzID0gc3RhdGUubGFzdEZlZWRiYWNrVGltZXN0YW1wIHx8IHN0YXRlLnN0ZXBTdGFydFRpbWVcbiAgICAgIGlmICghbGFzdFRzKSBjb250aW51ZVxuICAgICAgaWYgKG5vdyAtIGxhc3RUcyA8PSBTVEFMTF9USU1FT1VUX01TKSBjb250aW51ZVxuXG4gICAgICBjb25zdCB1c2VyTmFtZSA9IHN0YXRlLnVzZXJOYW1lXG4gICAgICBkZWxldGUgdGFiU3RhdGVzW3RhYklkU3RyXVxuICAgICAgcmVzdGFydEF1dG9GbG93RnJvbUJlZ2lubmluZyh1c2VyTmFtZSkuY2F0Y2goKCkgPT4ge30pXG4gICAgfVxuICB9LCAzMDAwMCkpXG59KVxuXG4iLCAiLyogZXNsaW50LWRpc2FibGUgKi9cbi8qKlxuICogVEhJUyBGSUxFIElTIEdFTkVSQVRFRCBBVVRPTUFUSUNBTExZLlxuICogRE8gTk9UIEVESVQuXG4gKlxuICogWW91IGFyZSBwcm9iYWJseSBsb29raW5nIGludG8gYWRkaW5nIGhvb2tzIGluIHlvdXIgY29kZS4gVGhpcyBzaG91bGQgYmUgZG9uZSBieSBtZWFucyBvZlxuICogc3JjLWJleC9qcy9iYWNrZ3JvdW5kLWhvb2tzLmpzIHdoaWNoIGhhdmUgYWNjZXNzIHRvIHRoZSBicm93c2VyIGluc3RhbmNlIGFuZCBjb21tdW5pY2F0aW9uIGJyaWRnZVxuICogYW5kIGFsbCB0aGUgYWN0aXZlIGNsaWVudCBjb25uZWN0aW9ucy5cbiAqKi9cblxuLyogZ2xvYmFsIGNocm9tZSAqL1xuXG5pbXBvcnQgQnJpZGdlIGZyb20gJy4vYnJpZGdlJ1xuaW1wb3J0IHJ1bkRldmxhbmRCYWNrZ3JvdW5kU2NyaXB0IGZyb20gJy4uLy4uL3NyYy1iZXgvYmFja2dyb3VuZCdcblxuY29uc3QgY29ubmVjdGlvbnMgPSB7fVxuXG4vKipcbiAqIENyZWF0ZSBhIGxpbmsgYmV0d2VlbiBBcHAgYW5kIENvbnRlbnRTY3JpcHQgY29ubmVjdGlvbnNcbiAqIFRoZSBsaW5rIHdpbGwgYmUgbWFwcGVkIG9uIGEgbWVzc2FnaW5nIGxldmVsXG4gKiBAcGFyYW0gcG9ydFxuICovXG5jb25zdCBhZGRDb25uZWN0aW9uID0gKHBvcnQpID0+IHtcbiAgY29uc3QgdGFiID0gcG9ydC5zZW5kZXIudGFiXG5cbiAgbGV0IGNvbm5lY3Rpb25JZFxuICAvLyBHZXQgdGhlIHBvcnQgbmFtZSwgY29ubmVjdGlvbiBJRFxuICBpZiAocG9ydC5uYW1lLmluZGV4T2YoJzonKSA+IC0xKSB7XG4gICAgY29uc3Qgc3BsaXQgPSBwb3J0Lm5hbWUuc3BsaXQoJzonKVxuICAgIGNvbm5lY3Rpb25JZCA9IHNwbGl0WzFdXG4gICAgcG9ydC5uYW1lID0gc3BsaXRbMF1cbiAgfVxuXG4gIC8vIElmIHdlIGhhdmUgdGFiIGluZm9ybWF0aW9uLCB1c2UgdGhhdCBmb3IgdGhlIGNvbm5lY3Rpb24gSUQgYXMgRkYgZG9lc24ndCBzdXBwb3J0XG4gIC8vIGNocm9tZS50YWJzIG9uIHRoZSBhcHAgc2lkZSAod2hpY2ggd2Ugd291bGQgbm9ybWFsbHkgdXNlIHRvIGdldCB0aGUgaWQpLlxuICBpZiAodGFiICE9PSB2b2lkIDApIHtcbiAgICBjb25uZWN0aW9uSWQgPSB0YWIuaWRcbiAgfVxuXG4gIGxldCBjdXJyZW50Q29ubmVjdGlvbiA9IGNvbm5lY3Rpb25zW2Nvbm5lY3Rpb25JZF1cbiAgaWYgKCFjdXJyZW50Q29ubmVjdGlvbikge1xuICAgIGN1cnJlbnRDb25uZWN0aW9uID0gY29ubmVjdGlvbnNbY29ubmVjdGlvbklkXSA9IHt9XG4gIH1cblxuICBjdXJyZW50Q29ubmVjdGlvbltwb3J0Lm5hbWVdID0ge1xuICAgIHBvcnQsXG4gICAgY29ubmVjdGVkOiB0cnVlLFxuICAgIGxpc3RlbmluZzogZmFsc2VcbiAgfVxuXG4gIHJldHVybiBjdXJyZW50Q29ubmVjdGlvbltwb3J0Lm5hbWVdXG59XG5cbmNocm9tZS5ydW50aW1lLm9uQ29ubmVjdC5hZGRMaXN0ZW5lcihwb3J0ID0+IHtcbiAgLy8gQWRkIHRoaXMgcG9ydCB0byBvdXIgcG9vbCBvZiBjb25uZWN0aW9uc1xuICBjb25zdCB0aGlzQ29ubmVjdGlvbiA9IGFkZENvbm5lY3Rpb24ocG9ydClcbiAgdGhpc0Nvbm5lY3Rpb24ucG9ydC5vbkRpc2Nvbm5lY3QuYWRkTGlzdGVuZXIoKCkgPT4ge1xuICAgIHRoaXNDb25uZWN0aW9uLmNvbm5lY3RlZCA9IGZhbHNlXG4gIH0pXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGNvbW1zIGxheWVyIGJldHdlZW4gdGhlIGJhY2tncm91bmQgc2NyaXB0IGFuZCB0aGUgQXBwIC8gQ29udGVudFNjcmlwdFxuICAgKiBOb3RlOiBUaGlzIGhvb2tzIGludG8gYWxsIGNvbm5lY3Rpb25zIGFzIHRoZSBiYWNrZ3JvdW5kIHNjcmlwdCBzaG91bGQgYmUgYWJsZSB0byBzZW5kXG4gICAqIG1lc3NhZ2VzIHRvIGFsbCBhcHBzIC8gY29udGVudCBzY3JpcHRzIHdpdGhpbiBpdHMgcmVhbG0gKHRoZSBCRVgpXG4gICAqIEB0eXBlIHtCcmlkZ2V9XG4gICAqL1xuICBjb25zdCBicmlkZ2UgPSBuZXcgQnJpZGdlKHtcbiAgICBsaXN0ZW4gKGZuKSB7XG4gICAgICBmb3IgKGxldCBjb25uZWN0aW9uSWQgaW4gY29ubmVjdGlvbnMpIHtcbiAgICAgICAgY29uc3QgY29ubmVjdGlvbiA9IGNvbm5lY3Rpb25zW2Nvbm5lY3Rpb25JZF1cbiAgICAgICAgaWYgKGNvbm5lY3Rpb24uYXBwICYmICFjb25uZWN0aW9uLmFwcC5saXN0ZW5pbmcpIHtcbiAgICAgICAgICBjb25uZWN0aW9uLmFwcC5saXN0ZW5pbmcgPSB0cnVlXG4gICAgICAgICAgY29ubmVjdGlvbi5hcHAucG9ydC5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZm4pXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29ubmVjdGlvbi5jb250ZW50U2NyaXB0ICYmICFjb25uZWN0aW9uLmNvbnRlbnRTY3JpcHQubGlzdGVuaW5nKSB7XG4gICAgICAgICAgY29ubmVjdGlvbi5jb250ZW50U2NyaXB0LnBvcnQub25NZXNzYWdlLmFkZExpc3RlbmVyKGZuKVxuICAgICAgICAgIGNvbm5lY3Rpb24uY29udGVudFNjcmlwdC5saXN0ZW5pbmcgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNlbmQgKGRhdGEpIHtcbiAgICAgIGZvciAobGV0IGNvbm5lY3Rpb25JZCBpbiBjb25uZWN0aW9ucykge1xuICAgICAgICBjb25zdCBjb25uZWN0aW9uID0gY29ubmVjdGlvbnNbY29ubmVjdGlvbklkXVxuICAgICAgICBjb25uZWN0aW9uLmFwcCAmJiBjb25uZWN0aW9uLmFwcC5jb25uZWN0ZWQgJiYgY29ubmVjdGlvbi5hcHAucG9ydC5wb3N0TWVzc2FnZShkYXRhKVxuICAgICAgICBjb25uZWN0aW9uLmNvbnRlbnRTY3JpcHQgJiYgY29ubmVjdGlvbi5jb250ZW50U2NyaXB0LmNvbm5lY3RlZCAmJiBjb25uZWN0aW9uLmNvbnRlbnRTY3JpcHQucG9ydC5wb3N0TWVzc2FnZShkYXRhKVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICBydW5EZXZsYW5kQmFja2dyb3VuZFNjcmlwdChicmlkZ2UsIGNvbm5lY3Rpb25zKVxuXG4gIC8vIE1hcCBhIG1lc3NhZ2luZyBsYXllciBiZXR3ZWVuIHRoZSBBcHAgYW5kIENvbnRlbnRTY3JpcHRcbiAgZm9yIChsZXQgY29ubmVjdGlvbklkIGluIGNvbm5lY3Rpb25zKSB7XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IGNvbm5lY3Rpb25zW2Nvbm5lY3Rpb25JZF1cbiAgICBpZiAoY29ubmVjdGlvbi5hcHAgJiYgY29ubmVjdGlvbi5jb250ZW50U2NyaXB0KSB7XG4gICAgICBtYXBDb25uZWN0aW9ucyhjb25uZWN0aW9uLmFwcCwgY29ubmVjdGlvbi5jb250ZW50U2NyaXB0KVxuICAgIH1cbiAgfVxufSlcblxuZnVuY3Rpb24gbWFwQ29ubmVjdGlvbnMgKGFwcCwgY29udGVudFNjcmlwdCkge1xuICAvLyBTZW5kIG1lc3NhZ2UgZnJvbSBjb250ZW50IHNjcmlwdCB0byBhcHBcbiAgYXBwLnBvcnQub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlKSA9PiB7XG4gICAgaWYgKGNvbnRlbnRTY3JpcHQuY29ubmVjdGVkKSB7XG4gICAgICBjb250ZW50U2NyaXB0LnBvcnQucG9zdE1lc3NhZ2UobWVzc2FnZSlcbiAgICB9XG4gIH0pXG5cbiAgLy8gU2VuZCBtZXNzYWdlIGZyb20gYXBwIHRvIGNvbnRlbnQgc2NyaXB0XG4gIGNvbnRlbnRTY3JpcHQucG9ydC5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UpID0+IHtcbiAgICBpZiAoYXBwLmNvbm5lY3RlZCkge1xuICAgICAgYXBwLnBvcnQucG9zdE1lc3NhZ2UobWVzc2FnZSlcbiAgICB9XG4gIH0pXG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQXVCQSxVQUFJLElBQUksT0FBTyxZQUFZLFdBQVcsVUFBVTtBQUNoRCxVQUFJLGVBQWUsS0FBSyxPQUFPLEVBQUUsVUFBVSxhQUN2QyxFQUFFLFFBQ0YsU0FBU0EsY0FBYSxRQUFRLFVBQVUsTUFBTTtBQUM5QyxlQUFPLFNBQVMsVUFBVSxNQUFNLEtBQUssUUFBUSxVQUFVLElBQUk7QUFBQSxNQUM3RDtBQUVGLFVBQUk7QUFDSixVQUFJLEtBQUssT0FBTyxFQUFFLFlBQVksWUFBWTtBQUN4Qyx5QkFBaUIsRUFBRTtBQUFBLE1BQ3JCLFdBQVcsT0FBTyx1QkFBdUI7QUFDdkMseUJBQWlCLFNBQVNDLGdCQUFlLFFBQVE7QUFDL0MsaUJBQU8sT0FBTyxvQkFBb0IsTUFBTSxFQUNyQyxPQUFPLE9BQU8sc0JBQXNCLE1BQU0sQ0FBQztBQUFBLFFBQ2hEO0FBQUEsTUFDRixPQUFPO0FBQ0wseUJBQWlCLFNBQVNBLGdCQUFlLFFBQVE7QUFDL0MsaUJBQU8sT0FBTyxvQkFBb0IsTUFBTTtBQUFBLFFBQzFDO0FBQUEsTUFDRjtBQUVBLGVBQVMsbUJBQW1CLFNBQVM7QUFDbkMsWUFBSSxXQUFXLFFBQVE7QUFBTSxrQkFBUSxLQUFLLE9BQU87QUFBQSxNQUNuRDtBQUVBLFVBQUksY0FBYyxPQUFPLFNBQVMsU0FBU0MsYUFBWSxPQUFPO0FBQzVELGVBQU8sVUFBVTtBQUFBLE1BQ25CO0FBRUEsZUFBU0MsZ0JBQWU7QUFDdEIsUUFBQUEsY0FBYSxLQUFLLEtBQUssSUFBSTtBQUFBLE1BQzdCO0FBQ0EsYUFBTyxVQUFVQTtBQUNqQixhQUFPLFFBQVEsT0FBTztBQUd0QixNQUFBQSxjQUFhLGVBQWVBO0FBRTVCLE1BQUFBLGNBQWEsVUFBVSxVQUFVO0FBQ2pDLE1BQUFBLGNBQWEsVUFBVSxlQUFlO0FBQ3RDLE1BQUFBLGNBQWEsVUFBVSxnQkFBZ0I7QUFJdkMsVUFBSSxzQkFBc0I7QUFFMUIsZUFBUyxjQUFjLFVBQVU7QUFDL0IsWUFBSSxPQUFPLGFBQWEsWUFBWTtBQUNsQyxnQkFBTSxJQUFJLFVBQVUscUVBQXFFLE9BQU8sUUFBUTtBQUFBLFFBQzFHO0FBQUEsTUFDRjtBQUVBLGFBQU8sZUFBZUEsZUFBYyx1QkFBdUI7QUFBQSxRQUN6RCxZQUFZO0FBQUEsUUFDWixLQUFLLFdBQVc7QUFDZCxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxRQUNBLEtBQUssU0FBUyxLQUFLO0FBQ2pCLGNBQUksT0FBTyxRQUFRLFlBQVksTUFBTSxLQUFLLFlBQVksR0FBRyxHQUFHO0FBQzFELGtCQUFNLElBQUksV0FBVyxvR0FBb0csTUFBTSxHQUFHO0FBQUEsVUFDcEk7QUFDQSxnQ0FBc0I7QUFBQSxRQUN4QjtBQUFBLE1BQ0YsQ0FBQztBQUVELE1BQUFBLGNBQWEsT0FBTyxXQUFXO0FBRTdCLFlBQUksS0FBSyxZQUFZLFVBQ2pCLEtBQUssWUFBWSxPQUFPLGVBQWUsSUFBSSxFQUFFLFNBQVM7QUFDeEQsZUFBSyxVQUFVLHVCQUFPLE9BQU8sSUFBSTtBQUNqQyxlQUFLLGVBQWU7QUFBQSxRQUN0QjtBQUVBLGFBQUssZ0JBQWdCLEtBQUssaUJBQWlCO0FBQUEsTUFDN0M7QUFJQSxNQUFBQSxjQUFhLFVBQVUsa0JBQWtCLFNBQVMsZ0JBQWdCLEdBQUc7QUFDbkUsWUFBSSxPQUFPLE1BQU0sWUFBWSxJQUFJLEtBQUssWUFBWSxDQUFDLEdBQUc7QUFDcEQsZ0JBQU0sSUFBSSxXQUFXLGtGQUFrRixJQUFJLEdBQUc7QUFBQSxRQUNoSDtBQUNBLGFBQUssZ0JBQWdCO0FBQ3JCLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxpQkFBaUIsTUFBTTtBQUM5QixZQUFJLEtBQUssa0JBQWtCO0FBQ3pCLGlCQUFPQSxjQUFhO0FBQ3RCLGVBQU8sS0FBSztBQUFBLE1BQ2Q7QUFFQSxNQUFBQSxjQUFhLFVBQVUsa0JBQWtCLFNBQVMsa0JBQWtCO0FBQ2xFLGVBQU8saUJBQWlCLElBQUk7QUFBQSxNQUM5QjtBQUVBLE1BQUFBLGNBQWEsVUFBVSxPQUFPLFNBQVMsS0FBSyxNQUFNO0FBQ2hELFlBQUksT0FBTyxDQUFDO0FBQ1osaUJBQVMsSUFBSSxHQUFHLElBQUksVUFBVSxRQUFRO0FBQUssZUFBSyxLQUFLLFVBQVUsRUFBRTtBQUNqRSxZQUFJLFVBQVcsU0FBUztBQUV4QixZQUFJLFNBQVMsS0FBSztBQUNsQixZQUFJLFdBQVc7QUFDYixvQkFBVyxXQUFXLE9BQU8sVUFBVTtBQUFBLGlCQUNoQyxDQUFDO0FBQ1IsaUJBQU87QUFHVCxZQUFJLFNBQVM7QUFDWCxjQUFJO0FBQ0osY0FBSSxLQUFLLFNBQVM7QUFDaEIsaUJBQUssS0FBSztBQUNaLGNBQUksY0FBYyxPQUFPO0FBR3ZCLGtCQUFNO0FBQUEsVUFDUjtBQUVBLGNBQUksTUFBTSxJQUFJLE1BQU0sc0JBQXNCLEtBQUssT0FBTyxHQUFHLFVBQVUsTUFBTSxHQUFHO0FBQzVFLGNBQUksVUFBVTtBQUNkLGdCQUFNO0FBQUEsUUFDUjtBQUVBLFlBQUksVUFBVSxPQUFPO0FBRXJCLFlBQUksWUFBWTtBQUNkLGlCQUFPO0FBRVQsWUFBSSxPQUFPLFlBQVksWUFBWTtBQUNqQyx1QkFBYSxTQUFTLE1BQU0sSUFBSTtBQUFBLFFBQ2xDLE9BQU87QUFDTCxjQUFJLE1BQU0sUUFBUTtBQUNsQixjQUFJLFlBQVksV0FBVyxTQUFTLEdBQUc7QUFDdkMsbUJBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxFQUFFO0FBQ3pCLHlCQUFhLFVBQVUsSUFBSSxNQUFNLElBQUk7QUFBQSxRQUN6QztBQUVBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxhQUFhLFFBQVEsTUFBTSxVQUFVLFNBQVM7QUFDckQsWUFBSTtBQUNKLFlBQUk7QUFDSixZQUFJO0FBRUosc0JBQWMsUUFBUTtBQUV0QixpQkFBUyxPQUFPO0FBQ2hCLFlBQUksV0FBVyxRQUFXO0FBQ3hCLG1CQUFTLE9BQU8sVUFBVSx1QkFBTyxPQUFPLElBQUk7QUFDNUMsaUJBQU8sZUFBZTtBQUFBLFFBQ3hCLE9BQU87QUFHTCxjQUFJLE9BQU8sZ0JBQWdCLFFBQVc7QUFDcEMsbUJBQU87QUFBQSxjQUFLO0FBQUEsY0FBZTtBQUFBLGNBQ2YsU0FBUyxXQUFXLFNBQVMsV0FBVztBQUFBLFlBQVE7QUFJNUQscUJBQVMsT0FBTztBQUFBLFVBQ2xCO0FBQ0EscUJBQVcsT0FBTztBQUFBLFFBQ3BCO0FBRUEsWUFBSSxhQUFhLFFBQVc7QUFFMUIscUJBQVcsT0FBTyxRQUFRO0FBQzFCLFlBQUUsT0FBTztBQUFBLFFBQ1gsT0FBTztBQUNMLGNBQUksT0FBTyxhQUFhLFlBQVk7QUFFbEMsdUJBQVcsT0FBTyxRQUNoQixVQUFVLENBQUMsVUFBVSxRQUFRLElBQUksQ0FBQyxVQUFVLFFBQVE7QUFBQSxVQUV4RCxXQUFXLFNBQVM7QUFDbEIscUJBQVMsUUFBUSxRQUFRO0FBQUEsVUFDM0IsT0FBTztBQUNMLHFCQUFTLEtBQUssUUFBUTtBQUFBLFVBQ3hCO0FBR0EsY0FBSSxpQkFBaUIsTUFBTTtBQUMzQixjQUFJLElBQUksS0FBSyxTQUFTLFNBQVMsS0FBSyxDQUFDLFNBQVMsUUFBUTtBQUNwRCxxQkFBUyxTQUFTO0FBR2xCLGdCQUFJLElBQUksSUFBSSxNQUFNLGlEQUNFLFNBQVMsU0FBUyxNQUFNLE9BQU8sSUFBSSxJQUFJLG1FQUV2QjtBQUNwQyxjQUFFLE9BQU87QUFDVCxjQUFFLFVBQVU7QUFDWixjQUFFLE9BQU87QUFDVCxjQUFFLFFBQVEsU0FBUztBQUNuQiwrQkFBbUIsQ0FBQztBQUFBLFVBQ3RCO0FBQUEsUUFDRjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBRUEsTUFBQUEsY0FBYSxVQUFVLGNBQWMsU0FBUyxZQUFZLE1BQU0sVUFBVTtBQUN4RSxlQUFPLGFBQWEsTUFBTSxNQUFNLFVBQVUsS0FBSztBQUFBLE1BQ2pEO0FBRUEsTUFBQUEsY0FBYSxVQUFVLEtBQUtBLGNBQWEsVUFBVTtBQUVuRCxNQUFBQSxjQUFhLFVBQVUsa0JBQ25CLFNBQVMsZ0JBQWdCLE1BQU0sVUFBVTtBQUN2QyxlQUFPLGFBQWEsTUFBTSxNQUFNLFVBQVUsSUFBSTtBQUFBLE1BQ2hEO0FBRUosZUFBUyxjQUFjO0FBQ3JCLFlBQUksQ0FBQyxLQUFLLE9BQU87QUFDZixlQUFLLE9BQU8sZUFBZSxLQUFLLE1BQU0sS0FBSyxNQUFNO0FBQ2pELGVBQUssUUFBUTtBQUNiLGNBQUksVUFBVSxXQUFXO0FBQ3ZCLG1CQUFPLEtBQUssU0FBUyxLQUFLLEtBQUssTUFBTTtBQUN2QyxpQkFBTyxLQUFLLFNBQVMsTUFBTSxLQUFLLFFBQVEsU0FBUztBQUFBLFFBQ25EO0FBQUEsTUFDRjtBQUVBLGVBQVMsVUFBVSxRQUFRLE1BQU0sVUFBVTtBQUN6QyxZQUFJLFFBQVEsRUFBRSxPQUFPLE9BQU8sUUFBUSxRQUFXLFFBQWdCLE1BQVksU0FBbUI7QUFDOUYsWUFBSSxVQUFVLFlBQVksS0FBSyxLQUFLO0FBQ3BDLGdCQUFRLFdBQVc7QUFDbkIsY0FBTSxTQUFTO0FBQ2YsZUFBTztBQUFBLE1BQ1Q7QUFFQSxNQUFBQSxjQUFhLFVBQVUsT0FBTyxTQUFTQyxNQUFLLE1BQU0sVUFBVTtBQUMxRCxzQkFBYyxRQUFRO0FBQ3RCLGFBQUssR0FBRyxNQUFNLFVBQVUsTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUM3QyxlQUFPO0FBQUEsTUFDVDtBQUVBLE1BQUFELGNBQWEsVUFBVSxzQkFDbkIsU0FBUyxvQkFBb0IsTUFBTSxVQUFVO0FBQzNDLHNCQUFjLFFBQVE7QUFDdEIsYUFBSyxnQkFBZ0IsTUFBTSxVQUFVLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDMUQsZUFBTztBQUFBLE1BQ1Q7QUFHSixNQUFBQSxjQUFhLFVBQVUsaUJBQ25CLFNBQVMsZUFBZSxNQUFNLFVBQVU7QUFDdEMsWUFBSSxNQUFNLFFBQVEsVUFBVSxHQUFHO0FBRS9CLHNCQUFjLFFBQVE7QUFFdEIsaUJBQVMsS0FBSztBQUNkLFlBQUksV0FBVztBQUNiLGlCQUFPO0FBRVQsZUFBTyxPQUFPO0FBQ2QsWUFBSSxTQUFTO0FBQ1gsaUJBQU87QUFFVCxZQUFJLFNBQVMsWUFBWSxLQUFLLGFBQWEsVUFBVTtBQUNuRCxjQUFJLEVBQUUsS0FBSyxpQkFBaUI7QUFDMUIsaUJBQUssVUFBVSx1QkFBTyxPQUFPLElBQUk7QUFBQSxlQUM5QjtBQUNILG1CQUFPLE9BQU87QUFDZCxnQkFBSSxPQUFPO0FBQ1QsbUJBQUssS0FBSyxrQkFBa0IsTUFBTSxLQUFLLFlBQVksUUFBUTtBQUFBLFVBQy9EO0FBQUEsUUFDRixXQUFXLE9BQU8sU0FBUyxZQUFZO0FBQ3JDLHFCQUFXO0FBRVgsZUFBSyxJQUFJLEtBQUssU0FBUyxHQUFHLEtBQUssR0FBRyxLQUFLO0FBQ3JDLGdCQUFJLEtBQUssT0FBTyxZQUFZLEtBQUssR0FBRyxhQUFhLFVBQVU7QUFDekQsaUNBQW1CLEtBQUssR0FBRztBQUMzQix5QkFBVztBQUNYO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFFQSxjQUFJLFdBQVc7QUFDYixtQkFBTztBQUVULGNBQUksYUFBYTtBQUNmLGlCQUFLLE1BQU07QUFBQSxlQUNSO0FBQ0gsc0JBQVUsTUFBTSxRQUFRO0FBQUEsVUFDMUI7QUFFQSxjQUFJLEtBQUssV0FBVztBQUNsQixtQkFBTyxRQUFRLEtBQUs7QUFFdEIsY0FBSSxPQUFPLG1CQUFtQjtBQUM1QixpQkFBSyxLQUFLLGtCQUFrQixNQUFNLG9CQUFvQixRQUFRO0FBQUEsUUFDbEU7QUFFQSxlQUFPO0FBQUEsTUFDVDtBQUVKLE1BQUFBLGNBQWEsVUFBVSxNQUFNQSxjQUFhLFVBQVU7QUFFcEQsTUFBQUEsY0FBYSxVQUFVLHFCQUNuQixTQUFTLG1CQUFtQixNQUFNO0FBQ2hDLFlBQUksV0FBVyxRQUFRO0FBRXZCLGlCQUFTLEtBQUs7QUFDZCxZQUFJLFdBQVc7QUFDYixpQkFBTztBQUdULFlBQUksT0FBTyxtQkFBbUIsUUFBVztBQUN2QyxjQUFJLFVBQVUsV0FBVyxHQUFHO0FBQzFCLGlCQUFLLFVBQVUsdUJBQU8sT0FBTyxJQUFJO0FBQ2pDLGlCQUFLLGVBQWU7QUFBQSxVQUN0QixXQUFXLE9BQU8sVUFBVSxRQUFXO0FBQ3JDLGdCQUFJLEVBQUUsS0FBSyxpQkFBaUI7QUFDMUIsbUJBQUssVUFBVSx1QkFBTyxPQUFPLElBQUk7QUFBQTtBQUVqQyxxQkFBTyxPQUFPO0FBQUEsVUFDbEI7QUFDQSxpQkFBTztBQUFBLFFBQ1Q7QUFHQSxZQUFJLFVBQVUsV0FBVyxHQUFHO0FBQzFCLGNBQUksT0FBTyxPQUFPLEtBQUssTUFBTTtBQUM3QixjQUFJO0FBQ0osZUFBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLFFBQVEsRUFBRSxHQUFHO0FBQ2hDLGtCQUFNLEtBQUs7QUFDWCxnQkFBSSxRQUFRO0FBQWtCO0FBQzlCLGlCQUFLLG1CQUFtQixHQUFHO0FBQUEsVUFDN0I7QUFDQSxlQUFLLG1CQUFtQixnQkFBZ0I7QUFDeEMsZUFBSyxVQUFVLHVCQUFPLE9BQU8sSUFBSTtBQUNqQyxlQUFLLGVBQWU7QUFDcEIsaUJBQU87QUFBQSxRQUNUO0FBRUEsb0JBQVksT0FBTztBQUVuQixZQUFJLE9BQU8sY0FBYyxZQUFZO0FBQ25DLGVBQUssZUFBZSxNQUFNLFNBQVM7QUFBQSxRQUNyQyxXQUFXLGNBQWMsUUFBVztBQUVsQyxlQUFLLElBQUksVUFBVSxTQUFTLEdBQUcsS0FBSyxHQUFHLEtBQUs7QUFDMUMsaUJBQUssZUFBZSxNQUFNLFVBQVUsRUFBRTtBQUFBLFVBQ3hDO0FBQUEsUUFDRjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBRUosZUFBUyxXQUFXLFFBQVEsTUFBTSxRQUFRO0FBQ3hDLFlBQUksU0FBUyxPQUFPO0FBRXBCLFlBQUksV0FBVztBQUNiLGlCQUFPLENBQUM7QUFFVixZQUFJLGFBQWEsT0FBTztBQUN4QixZQUFJLGVBQWU7QUFDakIsaUJBQU8sQ0FBQztBQUVWLFlBQUksT0FBTyxlQUFlO0FBQ3hCLGlCQUFPLFNBQVMsQ0FBQyxXQUFXLFlBQVksVUFBVSxJQUFJLENBQUMsVUFBVTtBQUVuRSxlQUFPLFNBQ0wsZ0JBQWdCLFVBQVUsSUFBSSxXQUFXLFlBQVksV0FBVyxNQUFNO0FBQUEsTUFDMUU7QUFFQSxNQUFBQSxjQUFhLFVBQVUsWUFBWSxTQUFTLFVBQVUsTUFBTTtBQUMxRCxlQUFPLFdBQVcsTUFBTSxNQUFNLElBQUk7QUFBQSxNQUNwQztBQUVBLE1BQUFBLGNBQWEsVUFBVSxlQUFlLFNBQVMsYUFBYSxNQUFNO0FBQ2hFLGVBQU8sV0FBVyxNQUFNLE1BQU0sS0FBSztBQUFBLE1BQ3JDO0FBRUEsTUFBQUEsY0FBYSxnQkFBZ0IsU0FBUyxTQUFTLE1BQU07QUFDbkQsWUFBSSxPQUFPLFFBQVEsa0JBQWtCLFlBQVk7QUFDL0MsaUJBQU8sUUFBUSxjQUFjLElBQUk7QUFBQSxRQUNuQyxPQUFPO0FBQ0wsaUJBQU8sY0FBYyxLQUFLLFNBQVMsSUFBSTtBQUFBLFFBQ3pDO0FBQUEsTUFDRjtBQUVBLE1BQUFBLGNBQWEsVUFBVSxnQkFBZ0I7QUFDdkMsZUFBUyxjQUFjLE1BQU07QUFDM0IsWUFBSSxTQUFTLEtBQUs7QUFFbEIsWUFBSSxXQUFXLFFBQVc7QUFDeEIsY0FBSSxhQUFhLE9BQU87QUFFeEIsY0FBSSxPQUFPLGVBQWUsWUFBWTtBQUNwQyxtQkFBTztBQUFBLFVBQ1QsV0FBVyxlQUFlLFFBQVc7QUFDbkMsbUJBQU8sV0FBVztBQUFBLFVBQ3BCO0FBQUEsUUFDRjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBRUEsTUFBQUEsY0FBYSxVQUFVLGFBQWEsU0FBUyxhQUFhO0FBQ3hELGVBQU8sS0FBSyxlQUFlLElBQUksZUFBZSxLQUFLLE9BQU8sSUFBSSxDQUFDO0FBQUEsTUFDakU7QUFFQSxlQUFTLFdBQVcsS0FBSyxHQUFHO0FBQzFCLFlBQUksT0FBTyxJQUFJLE1BQU0sQ0FBQztBQUN0QixpQkFBUyxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUU7QUFDdkIsZUFBSyxLQUFLLElBQUk7QUFDaEIsZUFBTztBQUFBLE1BQ1Q7QUFFQSxlQUFTLFVBQVUsTUFBTSxPQUFPO0FBQzlCLGVBQU8sUUFBUSxJQUFJLEtBQUssUUFBUTtBQUM5QixlQUFLLFNBQVMsS0FBSyxRQUFRO0FBQzdCLGFBQUssSUFBSTtBQUFBLE1BQ1g7QUFFQSxlQUFTLGdCQUFnQixLQUFLO0FBQzVCLFlBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNO0FBQzlCLGlCQUFTLElBQUksR0FBRyxJQUFJLElBQUksUUFBUSxFQUFFLEdBQUc7QUFDbkMsY0FBSSxLQUFLLElBQUksR0FBRyxZQUFZLElBQUk7QUFBQSxRQUNsQztBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxLQUFLLFNBQVMsTUFBTTtBQUMzQixlQUFPLElBQUksUUFBUSxTQUFVLFNBQVMsUUFBUTtBQUM1QyxtQkFBUyxjQUFjLEtBQUs7QUFDMUIsb0JBQVEsZUFBZSxNQUFNLFFBQVE7QUFDckMsbUJBQU8sR0FBRztBQUFBLFVBQ1o7QUFFQSxtQkFBUyxXQUFXO0FBQ2xCLGdCQUFJLE9BQU8sUUFBUSxtQkFBbUIsWUFBWTtBQUNoRCxzQkFBUSxlQUFlLFNBQVMsYUFBYTtBQUFBLFlBQy9DO0FBQ0Esb0JBQVEsQ0FBQyxFQUFFLE1BQU0sS0FBSyxTQUFTLENBQUM7QUFBQSxVQUNsQztBQUFDO0FBRUQseUNBQStCLFNBQVMsTUFBTSxVQUFVLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFDdEUsY0FBSSxTQUFTLFNBQVM7QUFDcEIsMENBQThCLFNBQVMsZUFBZSxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQUEsVUFDdEU7QUFBQSxRQUNGLENBQUM7QUFBQSxNQUNIO0FBRUEsZUFBUyw4QkFBOEIsU0FBUyxTQUFTLE9BQU87QUFDOUQsWUFBSSxPQUFPLFFBQVEsT0FBTyxZQUFZO0FBQ3BDLHlDQUErQixTQUFTLFNBQVMsU0FBUyxLQUFLO0FBQUEsUUFDakU7QUFBQSxNQUNGO0FBRUEsZUFBUywrQkFBK0IsU0FBUyxNQUFNLFVBQVUsT0FBTztBQUN0RSxZQUFJLE9BQU8sUUFBUSxPQUFPLFlBQVk7QUFDcEMsY0FBSSxNQUFNLE1BQU07QUFDZCxvQkFBUSxLQUFLLE1BQU0sUUFBUTtBQUFBLFVBQzdCLE9BQU87QUFDTCxvQkFBUSxHQUFHLE1BQU0sUUFBUTtBQUFBLFVBQzNCO0FBQUEsUUFDRixXQUFXLE9BQU8sUUFBUSxxQkFBcUIsWUFBWTtBQUd6RCxrQkFBUSxpQkFBaUIsTUFBTSxTQUFTLGFBQWEsS0FBSztBQUd4RCxnQkFBSSxNQUFNLE1BQU07QUFDZCxzQkFBUSxvQkFBb0IsTUFBTSxZQUFZO0FBQUEsWUFDaEQ7QUFDQSxxQkFBUyxHQUFHO0FBQUEsVUFDZCxDQUFDO0FBQUEsUUFDSCxPQUFPO0FBQ0wsZ0JBQU0sSUFBSSxVQUFVLHdFQUF3RSxPQUFPLE9BQU87QUFBQSxRQUM1RztBQUFBLE1BQ0Y7QUFBQTtBQUFBOzs7QUMxZUEsc0JBQTZCOzs7QUNGN0IsTUFDRTtBQURGLE1BRUUsU0FBUztBQUNYLE1BQU0sV0FBVyxJQUFJLE1BQU0sR0FBRztBQUc5QixXQUFTLElBQUksR0FBRyxJQUFJLEtBQUssS0FBSztBQUM1QixhQUFVLE1BQU8sSUFBSSxLQUFPLFNBQVMsRUFBRSxFQUFFLFVBQVUsQ0FBQztBQUFBLEVBQ3REO0FBR0EsTUFBTSxlQUFlLE1BQU07QUFFekIsVUFBTSxNQUFNLE9BQU8sV0FBVyxjQUMxQixTQUVFLE9BQU8sV0FBVyxjQUNkLE9BQU8sVUFBVSxPQUFPLFdBQ3hCO0FBR1YsUUFBSSxRQUFRLFFBQVE7QUFDbEIsVUFBSSxJQUFJLGdCQUFnQixRQUFRO0FBQzlCLGVBQU8sSUFBSTtBQUFBLE1BQ2I7QUFDQSxVQUFJLElBQUksb0JBQW9CLFFBQVE7QUFDbEMsZUFBTyxPQUFLO0FBQ1YsZ0JBQU0sUUFBUSxJQUFJLFdBQVcsQ0FBQztBQUM5QixjQUFJLGdCQUFnQixLQUFLO0FBQ3pCLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRUEsV0FBTyxPQUFLO0FBQ1YsWUFBTSxJQUFJLENBQUM7QUFDWCxlQUFTLElBQUksR0FBRyxJQUFJLEdBQUcsS0FBSztBQUMxQixVQUFFLEtBQUssS0FBSyxNQUFNLEtBQUssT0FBTyxJQUFJLEdBQUcsQ0FBQztBQUFBLE1BQ3hDO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGLEdBQUc7QUFLSCxNQUFNLGNBQWM7QUFFTCxXQUFSLGNBQW9CO0FBRXpCLFFBQUksUUFBUSxVQUFXLFNBQVMsS0FBSyxhQUFjO0FBQ2pELGVBQVM7QUFDVCxZQUFNLFlBQVksV0FBVztBQUFBLElBQy9CO0FBRUEsVUFBTSxJQUFJLE1BQU0sVUFBVSxNQUFNLEtBQUssS0FBSyxRQUFTLFVBQVUsRUFBRztBQUNoRSxNQUFHLEtBQU8sRUFBRyxLQUFNLEtBQVE7QUFDM0IsTUFBRyxLQUFPLEVBQUcsS0FBTSxLQUFRO0FBRTNCLFdBQU8sU0FBVSxFQUFHLE1BQVEsU0FBVSxFQUFHLE1BQ3JDLFNBQVUsRUFBRyxNQUFRLFNBQVUsRUFBRyxNQUFRLE1BQzFDLFNBQVUsRUFBRyxNQUFRLFNBQVUsRUFBRyxNQUFRLE1BQzFDLFNBQVUsRUFBRyxNQUFRLFNBQVUsRUFBRyxNQUFRLE1BQzFDLFNBQVUsRUFBRyxNQUFRLFNBQVUsRUFBRyxNQUFRLE1BQzFDLFNBQVUsRUFBRyxPQUFTLFNBQVUsRUFBRyxPQUNuQyxTQUFVLEVBQUcsT0FBUyxTQUFVLEVBQUcsT0FDbkMsU0FBVSxFQUFHLE9BQVMsU0FBVSxFQUFHO0FBQUEsRUFDekM7OztBRDlEQSxNQUNFLFlBQVk7QUFBQSxJQUNWLGFBQWEsTUFBTTtBQUFBLElBQ25CLFdBQVcsTUFBTTtBQUFBLElBQ2pCLFVBQVUsTUFBTTtBQUFBLElBQ2hCLFVBQVUsVUFBUSxJQUFJLEtBQUs7QUFBQSxJQUMzQixVQUFVLFVBQVEsQ0FBQyxPQUFPLElBQUksT0FDM0IsS0FBSyxJQUFJLEVBQ1QsT0FBTyxDQUFDLE9BQU8sUUFBUSxPQUFPLEdBQUcsSUFBSSxPQUFPLEtBQUssSUFBSSxJQUFJLE9BQU8sQ0FBQztBQUFBLEVBQ3RFO0FBVEYsTUFVRSxTQUFTLFdBQVMsVUFBVSxPQUFPLE9BQU8sS0FBSztBQUVqRCxNQUFxQixTQUFyQixjQUFvQywyQkFBYTtBQUFBLElBQy9DLFlBQWEsTUFBTTtBQUNqQixZQUFNO0FBRU4sV0FBSyxnQkFBZ0IsUUFBUTtBQUM3QixXQUFLLE9BQU87QUFFWixXQUFLLE9BQU8sY0FBWTtBQUN0QixZQUFJLE1BQU0sUUFBUSxRQUFRLEdBQUc7QUFDM0IsbUJBQVMsUUFBUSxhQUFXLEtBQUssTUFBTSxPQUFPLENBQUM7QUFBQSxRQUNqRCxPQUNLO0FBQ0gsZUFBSyxNQUFNLFFBQVE7QUFBQSxRQUNyQjtBQUFBLE1BQ0YsQ0FBQztBQUVELFdBQUssZ0JBQWdCLENBQUM7QUFDdEIsV0FBSyxXQUFXO0FBQ2hCLFdBQUssa0JBQWtCLEtBQUssT0FBTztBQUFBLElBQ3JDO0FBQUEsSUFTQSxLQUFNLE9BQU8sU0FBUztBQUNwQixhQUFPLEtBQUssTUFBTSxDQUFDLEVBQUUsT0FBTyxRQUFRLENBQUMsQ0FBQztBQUFBLElBQ3hDO0FBQUEsSUFNQSxZQUFhO0FBQ1gsYUFBTyxLQUFLO0FBQUEsSUFDZDtBQUFBLElBRUEsR0FBRyxXQUFXLFVBQVU7QUFDdEIsYUFBTyxNQUFNLEdBQUcsV0FBVyxDQUFDLG9CQUFvQjtBQUM5QyxpQkFBUztBQUFBLFVBQ1AsR0FBRztBQUFBLFVBSUgsU0FBUyxDQUFDLFlBQTJCLEtBQUssS0FBSyxnQkFBZ0Isa0JBQWtCLE9BQU87QUFBQSxRQUMxRixDQUFDO0FBQUEsTUFDSCxDQUFDO0FBQUEsSUFDSDtBQUFBLElBRUEsTUFBTyxTQUFTO0FBQ2QsVUFBSSxPQUFPLFlBQVksVUFBVTtBQUMvQixhQUFLLEtBQUssT0FBTztBQUFBLE1BQ25CLE9BQ0s7QUFDSCxhQUFLLEtBQUssUUFBUSxPQUFPLFFBQVEsT0FBTztBQUFBLE1BQzFDO0FBQUEsSUFDRjtBQUFBLElBRUEsTUFBTyxVQUFVO0FBQ2YsV0FBSyxjQUFjLEtBQUssUUFBUTtBQUNoQyxhQUFPLEtBQUssVUFBVTtBQUFBLElBQ3hCO0FBQUEsSUFFQSxZQUFhO0FBQ1gsVUFBSSxDQUFDLEtBQUssY0FBYyxVQUFVLEtBQUs7QUFBVSxlQUFPLFFBQVEsUUFBUTtBQUN4RSxXQUFLLFdBQVc7QUFFaEIsWUFDRSxXQUFXLEtBQUssY0FBYyxNQUFNLEdBQ3BDLGlCQUFpQixTQUFTLElBQzFCLG1CQUFtQixHQUFHLGVBQWUsU0FBUyxZQUFJLEtBQ2xELG1CQUFtQixtQkFBbUI7QUFFeEMsYUFBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFDdEMsWUFBSSxZQUFZLENBQUM7QUFFakIsY0FBTSxLQUFLLENBQUMsTUFBTTtBQUVoQixjQUFJLE1BQU0sVUFBVSxFQUFFLGFBQWE7QUFDakMsa0JBQU0sWUFBWSxFQUFFO0FBQ3BCLHdCQUFZLENBQUMsR0FBRyxXQUFXLEdBQUcsRUFBRSxJQUFJO0FBR3BDLGdCQUFJLFVBQVUsV0FBVztBQUN2QixtQkFBSyxJQUFJLGtCQUFrQixFQUFFO0FBQzdCLHNCQUFRLFNBQVM7QUFBQSxZQUNuQjtBQUFBLFVBQ0YsT0FDSztBQUNILGlCQUFLLElBQUksa0JBQWtCLEVBQUU7QUFDN0Isb0JBQVEsQ0FBQztBQUFBLFVBQ1g7QUFBQSxRQUNGO0FBRUEsYUFBSyxHQUFHLGtCQUFrQixFQUFFO0FBRTVCLFlBQUk7QUFFRixnQkFBTSxpQkFBaUIsU0FBUyxJQUFJLE9BQUs7QUFDdkMsbUJBQU87QUFBQSxjQUNMLEdBQUc7QUFBQSxjQUNILEdBQUc7QUFBQSxnQkFDRCxTQUFTO0FBQUEsa0JBQ1AsTUFBTSxFQUFFO0FBQUEsa0JBQ1I7QUFBQSxnQkFDRjtBQUFBLGNBQ0Y7QUFBQSxZQUNGO0FBQUEsVUFDRixDQUFDO0FBRUQsZUFBSyxLQUFLLEtBQUssY0FBYztBQUFBLFFBQy9CLFNBQ08sS0FBUDtBQUNFLGdCQUFNLGVBQWU7QUFFckIsY0FBSSxJQUFJLFlBQVksY0FBYztBQUdoQyxnQkFBSSxDQUFDLE1BQU0sUUFBUSxlQUFlLE9BQU8sR0FBRztBQUMxQyxrQkFBSSxNQUF1QztBQUN6Qyx3QkFBUSxNQUFNLGVBQWUscUVBQXFFO0FBQUEsY0FDcEc7QUFBQSxZQUNGLE9BQ0s7QUFDSCxvQkFBTSxhQUFhLE9BQU8sY0FBYztBQUV4QyxrQkFBSSxhQUFhLEtBQUssaUJBQWlCO0FBQ3JDLHNCQUNFLGlCQUFpQixLQUFLLEtBQUssYUFBYSxLQUFLLGVBQWUsR0FDNUQsaUJBQWlCLEtBQUssS0FBSyxlQUFlLFFBQVEsU0FBUyxjQUFjO0FBRTNFLG9CQUFJLE9BQU8sZUFBZTtBQUMxQix5QkFBUyxJQUFJLEdBQUcsSUFBSSxnQkFBZ0IsS0FBSztBQUN2QyxzQkFBSSxPQUFPLEtBQUssSUFBSSxLQUFLLFFBQVEsY0FBYztBQUUvQyx1QkFBSyxLQUFLLEtBQUssQ0FBQztBQUFBLG9CQUNkLE9BQU8sZUFBZTtBQUFBLG9CQUN0QixTQUFTO0FBQUEsc0JBQ1AsYUFBYTtBQUFBLHdCQUNYLE9BQU87QUFBQSx3QkFDUCxXQUFXLE1BQU0saUJBQWlCO0FBQUEsc0JBQ3BDO0FBQUEsc0JBQ0EsTUFBTSxLQUFLLE9BQU8sR0FBRyxJQUFJO0FBQUEsb0JBQzNCO0FBQUEsa0JBQ0YsQ0FBQyxDQUFDO0FBQUEsZ0JBQ0o7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBRUEsYUFBSyxXQUFXO0FBQ2hCLG1CQUFXLE1BQU07QUFBRSxpQkFBTyxLQUFLLFVBQVU7QUFBQSxRQUFFLEdBQUcsRUFBRTtBQUFBLE1BQ2xELENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjs7O0FFbExBLE1BQU0sa0JBQU4sTUFBc0I7QUFBQSxJQUNwQixZQUFZLFNBQVMsSUFBSTtBQUN2QixXQUFLLFNBQVM7QUFDZCxXQUFLLGVBQWU7QUFBQSxJQUN0QjtBQUFBLElBRUEsTUFBTSxvQkFBb0I7QUFDeEIsVUFBSTtBQUVGLGNBQU0sU0FBUyxNQUFNLE9BQU8sUUFBUSxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUM7QUFFM0QsYUFBSyxlQUFlO0FBQUEsTUFDdEIsU0FBUyxPQUFQO0FBQUEsTUFFRjtBQUFBLElBQ0Y7QUFBQSxJQUVBLE9BQU8sTUFBTTtBQUNYLFVBQUksS0FBSyxjQUFjO0FBQ3JCLGdCQUFRLElBQUksS0FBSyxRQUFRLEdBQUcsSUFBSTtBQUFBLE1BQ2xDO0FBQUEsSUFDRjtBQUFBLElBRUEsUUFBUSxNQUFNO0FBQ1osVUFBSSxLQUFLLGNBQWM7QUFDckIsZ0JBQVEsS0FBSyxLQUFLLFFBQVEsR0FBRyxJQUFJO0FBQUEsTUFDbkM7QUFBQSxJQUNGO0FBQUEsSUFFQSxRQUFRLE1BQU07QUFFWixjQUFRLEtBQUssS0FBSyxRQUFRLEdBQUcsSUFBSTtBQUFBLElBQ25DO0FBQUEsSUFFQSxTQUFTLE1BQU07QUFFYixjQUFRLE1BQU0sS0FBSyxRQUFRLEdBQUcsSUFBSTtBQUFBLElBQ3BDO0FBQUEsSUFFQSxTQUFTLE1BQU07QUFDYixVQUFJLEtBQUssY0FBYztBQUNyQixnQkFBUSxNQUFNLEtBQUssUUFBUSxHQUFHLElBQUk7QUFBQSxNQUNwQztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBR08sTUFBTSxZQUFZLElBQUksZ0JBQWdCLGNBQWM7QUFDcEQsTUFBTSxXQUFXLElBQUksZ0JBQWdCLE1BQU07QUFDM0MsTUFBTSxjQUFjLElBQUksZ0JBQWdCLFNBQVM7QUFDakQsTUFBTSxZQUFZLElBQUksZ0JBQWdCLFdBQVc7QUFDakQsTUFBTSxvQkFBb0IsSUFBSSxnQkFBZ0IsbUJBQW1CO0FBQ2pFLE1BQU0sY0FBYyxJQUFJLGdCQUFnQix3QkFBd0I7QUFDaEUsTUFBTSxnQkFBZ0IsSUFBSSxnQkFBZ0Isa0JBQWtCO0FBQzVELE1BQU0sZUFBZSxJQUFJLGdCQUFnQixpQkFBaUI7QUFHakUsTUFBTSxnQkFBZ0IsWUFBWTtBQUNoQyxVQUFNLFFBQVEsSUFBSTtBQUFBLE1BQ2hCLFVBQVUsa0JBQWtCO0FBQUEsTUFDNUIsU0FBUyxrQkFBa0I7QUFBQSxNQUMzQixZQUFZLGtCQUFrQjtBQUFBLE1BQzlCLFVBQVUsa0JBQWtCO0FBQUEsTUFDNUIsa0JBQWtCLGtCQUFrQjtBQUFBLE1BQ3BDLFlBQVksa0JBQWtCO0FBQUEsTUFDOUIsY0FBYyxrQkFBa0I7QUFBQSxNQUNoQyxhQUFhLGtCQUFrQjtBQUFBLElBQ2pDLENBQUM7QUFBQSxFQUNIO0FBR0EsZ0JBQWM7OztBQ0tQLFdBQVMsY0FBZSxVQUFVO0FBQ3ZDLFdBQU87QUFBQSxFQUNUOzs7QUN6RU8sTUFBTSxXQUFXO0FBQUEsSUFDdEIsTUFBTTtBQUFBLElBQ04sb0JBQW9CO0FBQUEsSUFDcEIsa0JBQWtCO0FBQUEsSUFDbEIsa0JBQWtCO0FBQUEsSUFDbEIsZUFBZTtBQUFBLElBQ2YsU0FBUztBQUFBLEVBQ1g7QUFHTyxNQUFNLFlBQVksQ0FBQztBQUduQixNQUFNLGdCQUFnQixvQkFBSSxJQUFJO0FBRzlCLE1BQU0saUJBQWlCO0FBQzlCLE1BQUksa0JBQWtCO0FBR2YsTUFBTSxtQkFBbUIsSUFBSSxLQUFLO0FBQ3pDLE1BQUksMEJBQTBCO0FBR3ZCLFdBQVMscUJBQXFCO0FBQ25DLFdBQU87QUFBQSxFQUNUO0FBRU8sV0FBUyxtQkFBbUIsSUFBSTtBQUNyQyxzQkFBa0I7QUFBQSxFQUNwQjtBQU1PLFdBQVMsMkJBQTJCLElBQUk7QUFDN0MsOEJBQTBCO0FBQUEsRUFDNUI7QUFNTyxXQUFTLGNBQWMsT0FBTztBQUNuQyxRQUFJO0FBQU8sWUFBTSx3QkFBd0IsS0FBSyxJQUFJO0FBQUEsRUFDcEQ7QUFpQk8sTUFBTSx1QkFBTixNQUEyQjtBQUFBLElBR2hDLE9BQU8sWUFBWSxVQUFVO0FBQzNCLGFBQU8saUJBQWlCO0FBQUEsSUFDMUI7QUFBQSxJQUVBLGFBQWEsVUFBVSxNQUFNLE9BQU8sQ0FBQyxHQUFHO0FBQ3RDLFlBQU0sV0FBVyxLQUFLO0FBQ3RCLFVBQUksQ0FBQztBQUFVO0FBRWYsWUFBTSxXQUFXLEtBQUssWUFBWSxRQUFRO0FBQzFDLFlBQU0sZUFBZSxNQUFNLEtBQUssU0FBUyxRQUFRO0FBR2pELFVBQUksZUFBZTtBQUNuQixVQUFJLGdCQUFnQixhQUFhLGdCQUFnQixNQUFNO0FBRXJELHdCQUFnQixhQUFhLGdCQUFnQixLQUFLO0FBR2xELFlBQUksZUFBZSxHQUFHO0FBQ3BCLHNCQUFZO0FBQUEsWUFDVixnRUFBc0QsMEJBQTBCLGlDQUFpQyxLQUFLO0FBQUEsVUFDeEg7QUFDQSxnQkFBTSxLQUFLLFdBQVcsS0FBSyxRQUFRO0FBQ25DO0FBQUEsUUFDRjtBQUFBLE1BQ0YsV0FBVyxjQUFjO0FBRXZCLG9CQUFZO0FBQUEsVUFDVixxREFBOEMsYUFBYSxrQkFBa0I7QUFBQSxRQUMvRTtBQUFBLE1BQ0Y7QUFFQSxZQUFNLFFBQVE7QUFBQSxRQUNaLFFBQVE7QUFBQSxRQUNSLGFBQWE7QUFBQSxRQUNiO0FBQUEsUUFDQSxzQkFBc0IsS0FBSyxJQUFJO0FBQUEsUUFDL0IsY0FBYyxLQUFLLGdCQUFnQjtBQUFBLFFBQ25DLFVBQVUsS0FBSyxZQUFZO0FBQUEsUUFDM0Isa0JBQWtCLEtBQUssb0JBQW9CO0FBQUEsUUFDM0MsVUFBVSxLQUFLLFlBQVk7QUFBQSxRQUMzQixnQkFBZ0IsS0FBSyxrQkFBa0I7QUFBQSxRQUN2QyxPQUFPLEtBQUssU0FBUztBQUFBLFFBQ3JCLEdBQUc7QUFBQSxNQUNMO0FBRUEsVUFBSTtBQUNGLGNBQU0sT0FBTyxRQUFRLE1BQU0sSUFBSSxFQUFFLENBQUMsV0FBVyxNQUFNLENBQUM7QUFDcEQsb0JBQVk7QUFBQSxVQUNWLGlEQUEwQyxpQkFBaUIsS0FBSyxxQkFBcUI7QUFBQSxVQUNyRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLFNBQVMsT0FBUDtBQUNBLG9CQUFZLE1BQU0sZ0RBQWdELEtBQUs7QUFBQSxNQUN6RTtBQUFBLElBQ0Y7QUFBQSxJQUVBLGFBQWEsU0FBUyxVQUFVO0FBQzlCLFVBQUk7QUFDRixZQUFJLENBQUM7QUFBVSxpQkFBTztBQUN0QixjQUFNLFdBQVcsS0FBSyxZQUFZLFFBQVE7QUFDMUMsY0FBTSxTQUFTLE1BQU0sT0FBTyxRQUFRLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUN4RCxlQUFPLE9BQU8sYUFBYTtBQUFBLE1BQzdCLFNBQVMsT0FBUDtBQUNBLG9CQUFZLE1BQU0sK0NBQStDLEtBQUs7QUFDdEUsZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFFQSxhQUFhLFdBQVcsVUFBVTtBQUNoQyxVQUFJO0FBQ0YsWUFBSSxDQUFDO0FBQVU7QUFDZixjQUFNLFdBQVcsS0FBSyxZQUFZLFFBQVE7QUFDMUMsY0FBTSxPQUFPLFFBQVEsTUFBTSxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQzVDLG9CQUFZLElBQUksaUVBQXFELFVBQVU7QUFBQSxNQUNqRixTQUFTLE9BQVA7QUFDQSxvQkFBWSxNQUFNLGlEQUFpRCxLQUFLO0FBQUEsTUFDMUU7QUFBQSxJQUNGO0FBQUEsSUFFQSxhQUFhLGFBQWEsT0FBTztBQUMvQixVQUFJLENBQUMsU0FBUyxDQUFDLE1BQU07QUFBc0IsZUFBTztBQUNsRCxhQUFPLEtBQUssSUFBSSxJQUFJLE1BQU0sdUJBQXVCLEtBQUs7QUFBQSxJQUN4RDtBQUFBLElBRUEsYUFBYSxhQUFhLFVBQVU7QUFDbEMsWUFBTSxRQUFRLE1BQU0sS0FBSyxTQUFTLFFBQVE7QUFDMUMsVUFBSSxDQUFDLE9BQU87QUFDVixvQkFBWSxJQUFJLDJEQUEyRCxVQUFVO0FBQ3JGLGVBQU87QUFBQSxNQUNUO0FBRUEsVUFBSSxNQUFNLEtBQUssYUFBYSxLQUFLLEdBQUc7QUFDbEMsb0JBQVksSUFBSSwyREFBMkQsdUJBQXVCO0FBQ2xHLGNBQU0sS0FBSyxXQUFXLFFBQVE7QUFDOUIsZUFBTztBQUFBLE1BQ1Q7QUFFQSxrQkFBWSxJQUFJLHVFQUFnRSxhQUFhLEtBQUs7QUFDbEcsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUVBLGFBQWEsWUFBWSxPQUFPO0FBQzlCLFVBQUk7QUFDRixjQUFNLE1BQU0sTUFBTSxPQUFPLEtBQUssSUFBSSxLQUFLO0FBQ3ZDLGVBQU8sT0FBTyxDQUFDLElBQUk7QUFBQSxNQUNyQixTQUFTLE9BQVA7QUFDQSxvQkFBWSxJQUFJLDhCQUE4Qiw2QkFBNkIsTUFBTSxPQUFPO0FBQ3hGLGVBQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFqSEUsZ0JBRFcsc0JBQ0osbUJBQWtCLEtBQUssS0FBSyxLQUFLOzs7QUMzRG5DLE1BQU0sa0JBQU4sTUFBc0I7QUFBQSxJQUMzQixhQUFhLGFBQWEsV0FBVztBQUNuQyxZQUFNLGFBQWE7QUFDbkIsWUFBTSxhQUFhO0FBR25CLFlBQU0saUJBQWlCLFVBQVUsUUFBUSxRQUFRLEVBQUU7QUFFbkQsZUFBUyxVQUFVLEdBQUcsV0FBVyxZQUFZLFdBQVc7QUFDdEQsWUFBSTtBQUNGLDRCQUFrQjtBQUFBLFlBQ2hCLGdEQUFnRCwyQkFBMkIsV0FBVztBQUFBLFVBQ3hGO0FBR0EsZ0JBQU0sZ0JBQWdCLE1BQU0sT0FBTyxRQUFRLEtBQUssSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNqRSxnQkFBTSxZQUFZLGNBQWMsYUFBYTtBQUFBLFlBQzNDLFVBQ0U7QUFBQSxZQUNELE9BQU87QUFBQSxVQUNWO0FBRUEsZ0JBQU0sY0FBYztBQUFBLFlBQ2xCLFlBQVk7QUFBQSxVQUNkO0FBRUEsNEJBQWtCLElBQUksMENBQTBDO0FBQUEsWUFDOUQsVUFBVSxVQUFVO0FBQUEsWUFDcEIsV0FBVztBQUFBLFlBQ1gsTUFBTTtBQUFBLFVBQ1IsQ0FBQztBQUVELGdCQUFNLFdBQVcsTUFBTSxNQUFNLFVBQVUsVUFBVTtBQUFBLFlBQy9DLFFBQVE7QUFBQSxZQUNSLFNBQVM7QUFBQSxjQUNQLGdCQUFnQjtBQUFBLGNBQ2hCLGVBQWUsU0FBUyxVQUFVO0FBQUEsWUFDcEM7QUFBQSxZQUNBLE1BQU0sS0FBSyxVQUFVLFdBQVc7QUFBQSxVQUNsQyxDQUFDO0FBRUQsY0FBSTtBQUNKLGNBQUk7QUFDRixtQkFBTyxNQUFNLFNBQVMsS0FBSztBQUFBLFVBQzdCLFNBQVMsR0FBUDtBQUNBLDhCQUFrQixNQUFNLHVEQUF1RCxDQUFDO0FBQ2hGLGtCQUFNLElBQUksTUFBTSx1QkFBdUIsU0FBUyxVQUFVLFNBQVMsb0NBQW9DO0FBQUEsVUFDekc7QUFFQSxjQUFJLENBQUMsU0FBUyxJQUFJO0FBQ2hCLGdCQUFJLGVBQWUsR0FBRyxTQUFTLFVBQVUsU0FBUztBQUNsRCw4QkFBa0IsTUFBTSx5Q0FBeUMsSUFBSTtBQUNyRSw0QkFBZ0IsTUFBTSxLQUFLLFVBQVUsSUFBSTtBQUN6QyxrQkFBTSxJQUFJLE1BQU0sdUJBQXVCLGNBQWM7QUFBQSxVQUN2RDtBQUVBLDRCQUFrQixJQUFJLDhDQUE4QyxJQUFJO0FBR3hFLGNBQUksUUFBUSxLQUFLLFdBQVcsS0FBSyxRQUFRLFdBQVcsYUFBYSxLQUFLLFFBQVEsV0FBVztBQUN2Riw4QkFBa0IsSUFBSSxrRUFBa0UsS0FBSyxRQUFRLFNBQVM7QUFHOUcsa0JBQU0sV0FBVyxLQUFLLFFBQVE7QUFDOUIsa0JBQU0saUJBQWlCLCtEQUErRDtBQUV0RixrQkFBTSxpQkFBaUIsTUFBTSxNQUFNLGdCQUFnQjtBQUFBLGNBQ2pELFFBQVE7QUFBQSxjQUNSLFNBQVM7QUFBQSxnQkFDUCxnQkFBZ0I7QUFBQSxnQkFDaEIsZUFBZSxTQUFTLFVBQVU7QUFBQSxjQUNwQztBQUFBLFlBQ0YsQ0FBQztBQUVELGdCQUFJLENBQUMsZUFBZSxJQUFJO0FBQ3RCLG9CQUFNLElBQUksTUFBTSw4QkFBOEIsZUFBZSxVQUFVLGVBQWUsWUFBWTtBQUFBLFlBQ3BHO0FBRUEsa0JBQU0sYUFBYSxNQUFNLGVBQWUsS0FBSztBQUM3Qyw4QkFBa0IsSUFBSSx5REFBeUQsVUFBVTtBQUd6RixnQkFBSSxjQUFjLFdBQVcsTUFBTTtBQUNqQyxvQkFBTSxXQUFXLFdBQVc7QUFDNUIscUJBQU87QUFBQSxnQkFDTCxPQUFPLFNBQVMsU0FBUztBQUFBLGdCQUN6QixNQUFNLFNBQVMsYUFBYSxTQUFTLFdBQVcsU0FBUyxRQUFRO0FBQUEsZ0JBQ2pFLEtBQUssU0FBUyxnQkFBZ0IsU0FBUyxPQUFPO0FBQUEsZ0JBQzlDLFdBQVcsU0FBUyxrQkFBa0IsU0FBUyxhQUFhO0FBQUEsZ0JBQzVELFdBQVcsU0FBUyxhQUFhO0FBQUEsZ0JBQ2pDLFdBQVcsU0FBUztBQUFBLGdCQUNwQixTQUFTLFNBQVM7QUFBQSxnQkFDbEIsZUFBZSxTQUFTO0FBQUEsY0FDMUI7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUdBLGNBQ0UsUUFDQSxLQUFLLFdBQ0wsS0FBSyxRQUFRLFFBQ2IsTUFBTSxRQUFRLEtBQUssUUFBUSxJQUFJLEtBQy9CLEtBQUssUUFBUSxLQUFLLFNBQVMsR0FDM0I7QUFDQSxrQkFBTSxVQUFVLEtBQUssUUFBUSxLQUFLO0FBQ2xDLG1CQUFPO0FBQUEsY0FDTCxPQUFPLFFBQVEsU0FBUztBQUFBLGNBQ3hCLE1BQU0sUUFBUSxXQUFXLFFBQVEsUUFBUTtBQUFBLGNBQ3pDLEtBQUssUUFBUSxPQUFPO0FBQUEsY0FDcEIsV0FBVyxRQUFRLGFBQWE7QUFBQSxjQUNoQyxXQUFXLFFBQVEsYUFBYTtBQUFBLFlBQ2xDO0FBQUEsVUFDRjtBQUVBLGdCQUFNLElBQUksTUFBTSx5REFBeUQ7QUFBQSxRQUMzRSxTQUFTLE9BQVA7QUFDQSw0QkFBa0IsTUFBTSw4Q0FBOEMsV0FBVyxnQkFBZ0IsS0FBSztBQUV0RyxjQUFJLFlBQVksWUFBWTtBQUUxQixrQkFBTSxlQUFlLGlDQUFpQyx3QkFBd0IsTUFBTTtBQUNwRiw4QkFBa0IsTUFBTSx1QkFBdUIsWUFBWTtBQUMzRCxrQkFBTSxJQUFJLE1BQU0sWUFBWTtBQUFBLFVBQzlCO0FBR0EsZ0JBQU0sSUFBSSxRQUFRLENBQUMsWUFBWSxXQUFXLFNBQVMsYUFBYSxLQUFLLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBQUEsUUFDM0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBRUEsT0FBTyx5QkFBeUIsaUJBQWlCLFVBQVU7QUFDekQsVUFBSSxDQUFDO0FBQWlCLGVBQU87QUFDN0IsWUFBTSxRQUFRLGlCQUFpQixXQUFXLFNBQVMsaUJBQWlCO0FBQ3BFLFVBQUksQ0FBQyxNQUFNLFFBQVEsS0FBSztBQUFHLGVBQU87QUFFbEMsWUFBTSxLQUFLLGlCQUFpQixlQUFlLGlCQUFpQixhQUFhLGlCQUFpQixjQUFjO0FBRXhHLGFBQU87QUFBQSxRQUNMO0FBQUEsUUFDQSxXQUFXLEVBQUUsTUFBTTtBQUFBLFFBQ25CLGFBQWE7QUFBQSxNQUNmO0FBQUEsSUFDRjtBQUFBLElBRUEsYUFBYSxpQkFBaUIsV0FBVztBQUV2QyxZQUFNLHFCQUFxQixVQUFVLG1CQUFtQixFQUFFLFdBQVcsVUFBVSxXQUFXLFNBQVMsQ0FBQztBQUdwRyxZQUFNLFdBQVcsV0FBVztBQUM1QixVQUFJLGdCQUFnQjtBQUNwQixVQUFJLFVBQVU7QUFDWixjQUFNLGlCQUFpQixlQUFlO0FBQ3RDLGNBQU0sa0JBQWtCLE1BQU0sT0FBTyxRQUFRLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQztBQUN2RSxZQUFJLGdCQUFnQixpQkFBaUI7QUFDbkMsZ0JBQU0sY0FBYyxnQkFBZ0I7QUFFcEMsY0FBSSxLQUFLLElBQUksSUFBSSxZQUFZLFlBQVksS0FBSyxLQUFLLEtBQU07QUFDdkQsNEJBQWdCLFlBQVk7QUFDNUIsOEJBQWtCLElBQUksMEVBQThELGVBQWU7QUFBQSxVQUNyRyxPQUFPO0FBRUwsa0JBQU0sT0FBTyxRQUFRLE1BQU0sT0FBTyxDQUFDLGNBQWMsQ0FBQztBQUFBLFVBQ3BEO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFHQSxZQUFNLGlCQUFpQjtBQUFBLFFBQ3JCLFdBQVcsSUFBSSxLQUFLLEVBQUUsWUFBWTtBQUFBLFFBQ2xDLFlBQVksV0FBVyxXQUFXLE9BQU8sVUFBVTtBQUFBLFFBQ25ELGFBQWE7QUFBQSxRQUNiLGdCQUFnQjtBQUFBLFFBQ2hCLFVBQVU7QUFBQSxRQUNWLFFBQVE7QUFBQSxRQUNSLFVBQVUsV0FBVyxZQUFZO0FBQUEsTUFDbkM7QUFFQSx3QkFBa0IsSUFBSSxxQ0FBcUM7QUFDM0Qsd0JBQWtCLElBQUksK0JBQStCLGVBQWUseUNBQXlDO0FBRzdHLFVBQUksaUJBQWlCLFdBQVcsV0FBVyxTQUFTLENBQUM7QUFDckQsVUFBSSxpQkFBaUIsZUFBZSxTQUFTLEdBQUc7QUFDOUMsY0FBTSxpQkFBaUIsZUFBZTtBQUN0Qyx5QkFBaUIsZUFBZSxPQUFPLFVBQVEsS0FBSyxPQUFPLGFBQWE7QUFDeEUsWUFBSSxlQUFlLFdBQVcsZ0JBQWdCO0FBQzVDLDRCQUFrQixJQUFJLDhFQUFrRSwwQkFBMEIsZUFBZSxRQUFRO0FBQUEsUUFDM0k7QUFBQSxNQUNGO0FBR0EsVUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLGFBQWEsZUFBZSxXQUFXLEdBQUc7QUFDckUsMEJBQWtCLElBQUksMEdBQXFHO0FBQzNILHVCQUFlLFdBQVc7QUFDMUIsdUJBQWUsU0FBUztBQUN4QixhQUFLLG1CQUFtQixjQUFjO0FBQ3RDLGVBQU8sRUFBRSxjQUFjLE1BQU0sUUFBUSxZQUFZLGVBQWU7QUFBQSxNQUNsRTtBQUVBLFlBQU0sV0FBVyxlQUFlO0FBQ2hDLFlBQU0sTUFBTSxJQUFJLEtBQUs7QUFDckIsWUFBTSxhQUFhLElBQUksS0FBSyxJQUFJLFFBQVEsSUFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEdBQUk7QUFHbkUsWUFBTSxXQUFXLElBQUksS0FBSyxTQUFTLFNBQVM7QUFDNUMsWUFBTSxjQUFjLE1BQU0sYUFBYSxNQUFPLEtBQUs7QUFDbkQscUJBQWUsY0FBYyxLQUFLLE1BQU0sYUFBYSxFQUFFLElBQUk7QUFFM0Qsd0JBQWtCLElBQUkseURBQWtEO0FBQ3hFLHdCQUFrQixJQUFJLGdCQUFnQixTQUFTLFNBQVMsYUFBYTtBQUNyRSx3QkFBa0IsSUFBSSxhQUFhLGVBQWUsdUJBQXVCO0FBQ3pFLHdCQUFrQixJQUFJLGFBQWEsU0FBUyxPQUFPLFVBQVU7QUFDN0Qsd0JBQWtCLElBQUksZ0JBQWdCLFNBQVMsVUFBVSxXQUFXO0FBQ3BFLHdCQUFrQixJQUFJLG1CQUFtQixTQUFTLGFBQWEsV0FBVztBQUMxRSx3QkFBa0I7QUFBQSxRQUNoQixlQUFlLFNBQVMsU0FBUyxpQkFBaUIsU0FBUyxnQkFBZ0IsZUFBZSxTQUFTLGNBQWM7QUFBQSxNQUNuSDtBQUNBLHdCQUFrQjtBQUFBLFFBQ2hCLG1CQUFtQixTQUFTLFlBQVksdUJBQXVCLFNBQVMsVUFBVTtBQUFBLE1BQ3BGO0FBQ0Esd0JBQWtCO0FBQUEsUUFDaEIsd0JBQXdCLFNBQVMsaUJBQWlCLHNCQUFzQixTQUFTLGlCQUFpQixzQkFBc0IsU0FBUztBQUFBLE1BQ25JO0FBQ0Esd0JBQWtCO0FBQUEsUUFDaEIsb0JBQW9CLFNBQVMsYUFBYSw2QkFBNkIsU0FBUyxlQUFlO0FBQUEsTUFDakc7QUFNQSxVQUFJLFNBQVMsaUJBQWlCLGFBQWEsU0FBUyxpQkFBaUIsYUFBYSxTQUFTLG9CQUFvQjtBQUM3RyxZQUFJLFNBQVMsaUJBQWlCLFdBQVc7QUFFdkMsNEJBQWtCLElBQUksOEhBQWtIO0FBQ3hJLHlCQUFlLFdBQVc7QUFDMUIseUJBQWUsU0FBUztBQUN4Qix5QkFBZSxpQkFBaUI7QUFDaEMsZUFBSyxtQkFBbUIsY0FBYztBQUN0QyxpQkFBTyxFQUFFLGNBQWMsTUFBTSxRQUFRLDZCQUE2QixVQUFvQixlQUFlO0FBQUEsUUFDdkcsT0FBTztBQUVMLDRCQUFrQixJQUFJLDBIQUE4RztBQUNwSSx5QkFBZSxXQUFXO0FBQzFCLHlCQUFlLFNBQVM7QUFDeEIseUJBQWUsaUJBQWlCLFNBQVMsWUFBWSxZQUFZO0FBQ2pFLGVBQUssbUJBQW1CLGNBQWM7QUFDdEMsaUJBQU8sRUFBRSxjQUFjLE1BQU0sUUFBUSxnQkFBZ0IsVUFBb0IsZUFBZTtBQUFBLFFBQzFGO0FBQUEsTUFDRjtBQUdBLFVBQUksU0FBUyxjQUFjLGVBQWU7QUFDeEMsWUFBSSxjQUFjLEdBQUc7QUFDbkIsNEJBQWtCLElBQUksc0ZBQWlGO0FBQ3ZHLHlCQUFlLFdBQVc7QUFDMUIseUJBQWUsU0FBUztBQUN4Qix5QkFBZSxpQkFBaUI7QUFDaEMsZUFBSyxtQkFBbUIsY0FBYztBQUN0QyxpQkFBTyxFQUFFLGNBQWMsT0FBTyxRQUFRLG9CQUFvQixVQUFvQixlQUFlO0FBQUEsUUFDL0Y7QUFFQSwwQkFBa0I7QUFBQSxVQUNoQjtBQUFBLFFBQ0Y7QUFDQSx1QkFBZSxXQUFXO0FBQzFCLHVCQUFlLFNBQVM7QUFDeEIsdUJBQWUsaUJBQWlCO0FBQ2hDLGFBQUssbUJBQW1CLGNBQWM7QUFDdEMsZUFBTyxFQUFFLGNBQWMsTUFBTSxRQUFRLHFCQUFxQixVQUFvQixlQUFlO0FBQUEsTUFDL0Y7QUFHQSxVQUFJLFNBQVMsUUFBUSxHQUFHO0FBQ3RCLDBCQUFrQixJQUFJLHNIQUErRztBQUNySSx1QkFBZSxXQUFXO0FBQzFCLHVCQUFlLFNBQVM7QUFDeEIsdUJBQWUsaUJBQWlCLFNBQVMsWUFBWSxZQUFZLFNBQVMsWUFBWSxZQUFZO0FBQ2xHLGFBQUssbUJBQW1CLGNBQWM7QUFDdEMsZUFBTyxFQUFFLGNBQWMsTUFBTSxRQUFRLGtCQUFrQixVQUFvQixlQUFlO0FBQUEsTUFDNUY7QUFFQSxVQUFJLGFBQWEsSUFBSTtBQUNuQiwwQkFBa0IsSUFBSSxvR0FBK0Y7QUFDckgsdUJBQWUsV0FBVztBQUMxQix1QkFBZSxTQUFTO0FBQ3hCLHVCQUFlLGlCQUFpQjtBQUNoQyxhQUFLLG1CQUFtQixjQUFjO0FBQ3RDLGVBQU8sRUFBRSxjQUFjLE9BQU8sUUFBUSxlQUFlLGVBQWU7QUFBQSxNQUN0RTtBQUdBLFlBQU0sbUJBQW1CLFNBQVMsU0FBUyxNQUFNLFNBQVMsZ0JBQWdCO0FBQzFFLFVBQUksa0JBQWtCLEdBQUc7QUFDdkIsMEJBQWtCO0FBQUEsVUFDaEI7QUFBQSxRQUNGO0FBQ0EsdUJBQWUsV0FBVztBQUMxQix1QkFBZSxTQUFTO0FBQ3hCLHVCQUFlLGlCQUFpQjtBQUNoQyxhQUFLLG1CQUFtQixjQUFjO0FBQ3RDLGVBQU8sRUFBRSxjQUFjLE1BQU0sUUFBUSxrQkFBa0IsVUFBb0IsZUFBZTtBQUFBLE1BQzVGO0FBR0EsVUFBSSxXQUFXLFlBQVk7QUFDekIsMEJBQWtCLElBQUksOEdBQXlHO0FBQy9ILHVCQUFlLFdBQVc7QUFDMUIsdUJBQWUsU0FBUztBQUN4Qix1QkFBZSxpQkFBaUIsU0FBUyxZQUFZLFlBQVksU0FBUyxZQUFZLFlBQVk7QUFDbEcsYUFBSyxtQkFBbUIsY0FBYztBQUN0QyxlQUFPLEVBQUUsY0FBYyxNQUFNLFFBQVEsWUFBWSxVQUFvQixlQUFlO0FBQUEsTUFDdEY7QUFFQSx3QkFBa0IsSUFBSSx1RkFBa0Y7QUFDeEcscUJBQWUsV0FBVztBQUMxQixxQkFBZSxTQUFTO0FBQ3hCLHFCQUFlLGlCQUFpQjtBQUNoQyxXQUFLLG1CQUFtQixjQUFjO0FBQ3RDLGFBQU8sRUFBRSxjQUFjLE9BQU8sUUFBUSxlQUFlLGVBQWU7QUFBQSxJQUN0RTtBQUFBLElBR0EsYUFBYSxtQkFBbUIsZ0JBQWdCO0FBQzlDLFVBQUk7QUFDRixjQUFNLE9BQU8sUUFBUSxNQUFNLElBQUk7QUFBQSxVQUM3QixvQkFBb0I7QUFBQSxVQUNwQix1QkFBdUIsZUFBZTtBQUFBLFFBQ3hDLENBQUM7QUFDRCwwQkFBa0IsSUFBSSxpRUFBMEQsZUFBZSxRQUFRO0FBQUEsTUFDekcsU0FBUyxPQUFQO0FBQ0EsMEJBQWtCLE1BQU0scURBQXFELEtBQUs7QUFBQSxNQUNwRjtBQUFBLElBQ0Y7QUFBQSxJQUdBLGFBQWEsb0JBQW9CLGlCQUFpQjtBQUNoRCxVQUFJO0FBQ0YsY0FBTSxPQUFPLFFBQVEsTUFBTSxJQUFJO0FBQUEsVUFDN0IscUJBQXFCO0FBQUEsVUFDckIsd0JBQXdCLGdCQUFnQjtBQUFBLFFBQzFDLENBQUM7QUFDRCwwQkFBa0IsSUFBSSxrRUFBMkQsZ0JBQWdCLFFBQVEsS0FBSyxnQkFBZ0IsVUFBVTtBQUFBLE1BQzFJLFNBQVMsT0FBUDtBQUNBLDBCQUFrQixNQUFNLHNEQUFzRCxLQUFLO0FBQUEsTUFDckY7QUFBQSxJQUNGO0FBQUEsSUFLQSxhQUFhLDRCQUE0QixXQUFXLFNBQVMsV0FBVyxTQUFTLE1BQU07QUFDckYsVUFBSTtBQUNGLDBCQUFrQjtBQUFBLFVBQ2hCLDBEQUEwRCxpQkFBaUI7QUFBQSxRQUM3RTtBQUdBLGNBQU0sZ0JBQWdCLE1BQU0sT0FBTyxRQUFRLEtBQUssSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNqRSxjQUFNLFlBQVksY0FBYyxhQUFhO0FBQUEsVUFDM0MsT0FBTztBQUFBLFFBQ1Q7QUFHQSxjQUFNLGlCQUFpQixnR0FBZ0csbUJBQW1CLFNBQVM7QUFFbkosY0FBTSxXQUFXLE1BQU0sTUFBTSxnQkFBZ0I7QUFBQSxVQUMzQyxRQUFRO0FBQUEsVUFDUixTQUFTO0FBQUEsWUFDUCxnQkFBZ0I7QUFBQSxZQUNoQixlQUFlLFNBQVMsVUFBVTtBQUFBLFVBQ3BDO0FBQUEsUUFDRixDQUFDO0FBRUQsWUFBSSxDQUFDLFNBQVMsSUFBSTtBQUNoQixnQkFBTSxJQUFJLE1BQU0sK0JBQStCLFNBQVMsUUFBUTtBQUFBLFFBQ2xFO0FBRUEsY0FBTSxPQUFPLE1BQU0sU0FBUyxLQUFLO0FBRWpDLFlBQUksQ0FBQyxLQUFLLFFBQVEsS0FBSyxLQUFLLFdBQVcsR0FBRztBQUN4Qyw0QkFBa0IsS0FBSyxvREFBb0QsV0FBVztBQUN0RixpQkFBTztBQUFBLFFBQ1Q7QUFFQSxjQUFNLFdBQVcsS0FBSyxLQUFLLEdBQUc7QUFDOUIsMEJBQWtCLElBQUksaUNBQWlDLDJCQUEyQjtBQUdsRixjQUFNLGFBQWE7QUFBQSxVQUNqQjtBQUFBLFFBQ0Y7QUFFQSxZQUFJLFFBQVE7QUFDVixxQkFBVyxrQkFBa0I7QUFBQSxRQUMvQjtBQUVBLGNBQU0saUJBQWlCLCtEQUErRDtBQUV0RixjQUFNLGlCQUFpQixNQUFNLE1BQU0sZ0JBQWdCO0FBQUEsVUFDakQsUUFBUTtBQUFBLFVBQ1IsU0FBUztBQUFBLFlBQ1AsZ0JBQWdCO0FBQUEsWUFDaEIsZUFBZSxTQUFTLFVBQVU7QUFBQSxVQUNwQztBQUFBLFVBQ0EsTUFBTSxLQUFLLFVBQVUsVUFBVTtBQUFBLFFBQ2pDLENBQUM7QUFFRCxZQUFJLENBQUMsZUFBZSxJQUFJO0FBQ3RCLGdCQUFNLElBQUksTUFBTSxpQ0FBaUMsZUFBZSxRQUFRO0FBQUEsUUFDMUU7QUFFQSxjQUFNLFNBQVMsTUFBTSxlQUFlLEtBQUs7QUFDekMsMEJBQWtCLElBQUksOERBQXlELE1BQU07QUFDckYsZUFBTztBQUFBLE1BQ1QsU0FBUyxPQUFQO0FBQ0EsMEJBQWtCLE1BQU0sMERBQTBELEtBQUs7QUFDdkYsY0FBTTtBQUFBLE1BQ1I7QUFBQSxJQUNGO0FBQUEsSUFJQSxhQUFhLGlCQUFpQixVQUFVLFNBQVMsVUFBVSxjQUFjLE1BQU07QUFDN0UsVUFBSTtBQUNGLDBCQUFrQjtBQUFBLFVBQ2hCLG1DQUFtQyx1QkFBdUI7QUFBQSxVQUMxRCxjQUFjLEVBQUUsWUFBWSxJQUFJLENBQUM7QUFBQSxRQUNuQztBQUdBLGNBQU0sZ0JBQWdCLE1BQU0sT0FBTyxRQUFRLEtBQUssSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNqRSxjQUFNLFlBQVksY0FBYyxhQUFhO0FBQUEsVUFDM0MsT0FBTztBQUFBLFFBQ1Q7QUFHQSxjQUFNLGlCQUFpQiwrREFBK0Q7QUFFdEYsY0FBTSxhQUFhO0FBQUEsVUFDakI7QUFBQSxRQUNGO0FBR0EsWUFBSSxlQUFlLE9BQU8sZ0JBQWdCLFVBQVU7QUFDbEQsaUJBQU8sT0FBTyxZQUFZLFdBQVc7QUFBQSxRQUN2QztBQUVBLGNBQU0sV0FBVyxNQUFNLE1BQU0sZ0JBQWdCO0FBQUEsVUFDM0MsUUFBUTtBQUFBLFVBQ1IsU0FBUztBQUFBLFlBQ1AsZ0JBQWdCO0FBQUEsWUFDaEIsZUFBZSxTQUFTLFVBQVU7QUFBQSxVQUNwQztBQUFBLFVBQ0EsTUFBTSxLQUFLLFVBQVUsVUFBVTtBQUFBLFFBQ2pDLENBQUM7QUFFRCxZQUFJLENBQUMsU0FBUyxJQUFJO0FBQ2hCLGdCQUFNLElBQUksTUFBTSxpQ0FBaUMsU0FBUyxVQUFVLFNBQVMsWUFBWTtBQUFBLFFBQzNGO0FBRUEsY0FBTSxTQUFTLE1BQU0sU0FBUyxLQUFLO0FBQ25DLDBCQUFrQixJQUFJLHVFQUFrRSxNQUFNO0FBQzlGLGVBQU87QUFBQSxNQUNULFNBQVMsT0FBUDtBQUNBLDBCQUFrQixNQUFNLDREQUE0RCxLQUFLO0FBQ3pGLGNBQU07QUFBQSxNQUNSO0FBQUEsSUFDRjtBQUFBLEVBR0Y7QUFNQSxpQkFBc0IsZ0JBQWdCO0FBQ3BDLHNCQUFrQixJQUFJLHdEQUF3RDtBQUU5RSxRQUFJO0FBRUYsWUFBTSxhQUFhLE1BQU0sT0FBTyxRQUFRLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQztBQUMvRCxZQUFNLGNBQWMsTUFBTSxPQUFPLFFBQVEsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ2pFLFlBQU0sYUFBYSxXQUFXLGNBQWMsWUFBWTtBQUV4RCxVQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsWUFBWTtBQUN6QywwQkFBa0IsSUFBSSwyQ0FBMkM7QUFDakUsZUFBTztBQUFBLE1BQ1Q7QUFFQSxZQUFNLFlBQVksV0FBVztBQUM3QixZQUFNLGlCQUFpQixVQUFVLFFBQVEsUUFBUSxFQUFFO0FBQ25ELHdCQUFrQixJQUFJLDBCQUEwQix1QkFBdUIsaUJBQWlCO0FBR3hGLFVBQUksTUFBTSxnQkFBZ0IsaUJBQWlCLEVBQUUsVUFBVSxVQUFVLENBQUMsR0FBRztBQUNuRSxjQUFNLFdBQVcsTUFBTSxnQkFBZ0IsYUFBYSxjQUFjO0FBQ2xFLDBCQUFrQixJQUFJLG9DQUFvQztBQUMxRCxlQUFPO0FBQUEsTUFDVDtBQUVBLHdCQUFrQixJQUFJLHVDQUF1QztBQUM3RCxhQUFPO0FBQUEsSUFDVCxTQUFTLE9BQVA7QUFDQSx3QkFBa0IsTUFBTSxnQ0FBZ0MsS0FBSztBQUM3RCxhQUFPO0FBQUEsSUFDVDtBQUFBLEVBQ0Y7OztBQ2pnQkEsTUFBTSxxQkFBcUI7QUFHM0IsTUFBTSxlQUFlLENBQUM7QUFHdEIsTUFBSSx5QkFBeUI7QUFHN0IsTUFBSSx1QkFBdUI7QUFHM0IsTUFBTSxhQUFhO0FBQUEsSUFDakIsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsaUJBQWlCO0FBQUEsSUFDakIsZUFBZTtBQUFBLEVBQ2pCO0FBS0EsaUJBQXNCLHdCQUF3QjtBQUM1QyxRQUFJO0FBQ0YsWUFBTSxTQUFTLE1BQU0sT0FBTyxRQUFRLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDO0FBQ2xFLGFBQU8sT0FBTyx1QkFBdUI7QUFBQSxJQUN2QyxTQUFTLE9BQVA7QUFDQSxlQUFTLE1BQU0sd0RBQXdELEtBQUs7QUFDNUUsYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBS0EsaUJBQXNCLGlCQUFpQixPQUFPO0FBQzVDLFFBQUk7QUFDRixZQUFNLE9BQU8sUUFBUSxNQUFNLElBQUksRUFBRSxDQUFDLHFCQUFxQixNQUFNLENBQUM7QUFDOUQsZUFBUyxJQUFJLHlDQUF5QyxPQUFPO0FBQUEsSUFDL0QsU0FBUyxPQUFQO0FBQ0EsZUFBUyxNQUFNLGtEQUFrRCxLQUFLO0FBQUEsSUFDeEU7QUFBQSxFQUNGO0FBS0EsaUJBQXNCLG9CQUFvQjtBQUN4QyxRQUFJO0FBQ0YsWUFBTSxPQUFPLFFBQVEsTUFBTSxPQUFPLENBQUMsa0JBQWtCLENBQUM7QUFDdEQsZUFBUyxJQUFJLHdDQUF3QztBQUFBLElBQ3ZELFNBQVMsT0FBUDtBQUNBLGVBQVMsTUFBTSxtREFBbUQsS0FBSztBQUFBLElBQ3pFO0FBQUEsRUFDRjtBQUtBLGlCQUFzQixXQUFXLE9BQU87QUFDdEMsUUFBSSxDQUFDO0FBQU8sYUFBTztBQUNuQixRQUFJO0FBQ0YsWUFBTSxNQUFNLE1BQU0sT0FBTyxLQUFLLElBQUksS0FBSztBQUN2QyxhQUFPLE9BQU8sQ0FBQyxJQUFJO0FBQUEsSUFDckIsU0FBUyxPQUFQO0FBQ0EsZUFBUyxJQUFJLHVCQUF1Qiw2QkFBNkIsTUFBTSxPQUFPO0FBQzlFLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQWFBLGlCQUFzQixjQUFjLFdBQVcsZ0JBQWdCLE1BQU07QUFDbkUsUUFBSTtBQUNGLFlBQU0sY0FBYyxNQUFNLHNCQUFzQjtBQUdoRCxVQUFJLGVBQWUsTUFBTSxXQUFXLFdBQVcsR0FBRztBQUNoRCxpQkFBUyxJQUFJLHVDQUF1QyxtQkFBbUIsaUJBQWlCLGFBQWE7QUFHckcsNEJBQW9CLFdBQVc7QUFHL0IsY0FBTSxPQUFPLEtBQUssT0FBTyxhQUFhLEVBQUUsS0FBSyxXQUFXLFFBQVEsS0FBSyxDQUFDO0FBR3RFLGtDQUEwQixhQUFhLGFBQWE7QUFDcEQsZUFBTztBQUFBLE1BQ1Q7QUFHQSxVQUFJLGFBQWE7QUFDZixpQkFBUyxJQUFJLDhCQUE4QiwwQ0FBMEM7QUFDckYsNEJBQW9CLFdBQVc7QUFDL0IsY0FBTSxrQkFBa0I7QUFBQSxNQUMxQjtBQUdBLGVBQVMsSUFBSSxzREFBc0QsaUJBQWlCLGlCQUFpQixhQUFhO0FBQ2xILFlBQU0sU0FBUyxNQUFNLE9BQU8sS0FBSyxPQUFPO0FBQUEsUUFDdEMsS0FBSztBQUFBLFFBQ0wsUUFBUTtBQUFBLE1BQ1YsQ0FBQztBQUVELFlBQU0saUJBQWlCLE9BQU8sRUFBRTtBQUVoQyxnQ0FBMEIsT0FBTyxJQUFJLGFBQWE7QUFDbEQsZUFBUyxJQUFJLDJDQUEyQyxPQUFPLElBQUk7QUFDbkUsYUFBTyxPQUFPO0FBQUEsSUFDaEIsU0FBUyxPQUFQO0FBQ0EsZUFBUyxNQUFNLDhDQUE4QyxLQUFLO0FBQ2xFLFlBQU07QUFBQSxJQUNSO0FBQUEsRUFDRjtBQUtBLGlCQUFzQixrQkFBa0I7QUFDdEMsVUFBTSxlQUFlLHNCQUFzQixPQUFPLFFBQVE7QUFDMUQsV0FBTyxjQUFjLGNBQWMsV0FBVyxTQUFTO0FBQUEsRUFDekQ7QUFZQSxpQkFBc0IsbUJBQW1CLFVBQVU7QUFDakQsVUFBTSxrQkFBa0IsU0FBUyxhQUFhLFVBQVUsUUFBUSxTQUFTLEVBQUU7QUFDM0UsVUFBTSxZQUFZLDRCQUE0QjtBQUM5QyxXQUFPLGNBQWMsV0FBVyxXQUFXLGFBQWE7QUFBQSxFQUMxRDtBQWNPLFdBQVMsb0JBQW9CLE9BQU87QUFDekMsUUFBSSxhQUFhLFFBQVE7QUFDdkIsZUFBUyxJQUFJLCtCQUErQixhQUFhLE9BQU8sZ0NBQWdDLE9BQU87QUFDdkcsbUJBQWEsT0FBTyxRQUFRLGNBQVk7QUFDdEMsZUFBTyxLQUFLLFVBQVUsZUFBZSxRQUFRO0FBQUEsTUFDL0MsQ0FBQztBQUNELGFBQU8sYUFBYTtBQUFBLElBQ3RCO0FBQUEsRUFDRjtBQUtPLFdBQVMsb0JBQW9CLE9BQU8sVUFBVTtBQUNuRCxRQUFJLENBQUMsYUFBYSxRQUFRO0FBQ3hCLG1CQUFhLFNBQVMsQ0FBQztBQUFBLElBQ3pCO0FBQ0EsaUJBQWEsT0FBTyxLQUFLLFFBQVE7QUFDakMsV0FBTyxLQUFLLFVBQVUsWUFBWSxRQUFRO0FBQUEsRUFDNUM7QUFLQSxpQkFBc0IsZ0JBQWdCLE9BQU87QUFDM0MsUUFBSTtBQUVGLDBCQUFvQixLQUFLO0FBRXpCLFlBQU0sY0FBYyxNQUFNLHNCQUFzQjtBQUNoRCxVQUFJLGdCQUFnQixPQUFPO0FBQ3pCLGlCQUFTLElBQUksK0JBQStCLHNDQUFzQztBQUNsRixjQUFNLGtCQUFrQjtBQUFBLE1BQzFCO0FBR0EsVUFBSSwyQkFBMkIsT0FBTztBQUNwQyxpQkFBUyxJQUFJLGtDQUFrQyxvQ0FBb0M7QUFDbkYsaUNBQXlCO0FBQ3pCLCtCQUF1QjtBQUFBLE1BQ3pCO0FBQUEsSUFDRixTQUFTLE9BQVA7QUFDQSxlQUFTLE1BQU0saURBQWlELEtBQUs7QUFBQSxJQUN2RTtBQUFBLEVBQ0Y7QUFLTyxXQUFTLDBCQUEwQjtBQUN4QyxXQUFPO0FBQUEsTUFDTCxPQUFPO0FBQUEsTUFDUCxlQUFlO0FBQUEsSUFDakI7QUFBQSxFQUNGO0FBS08sV0FBUywwQkFBMEIsT0FBTyxnQkFBZ0IsTUFBTTtBQUNyRSxRQUFJLDJCQUEyQixRQUFRLDJCQUEyQixPQUFPO0FBQ3ZFLGVBQVMsSUFBSSw0Q0FBNEMsK0JBQStCLE9BQU87QUFBQSxJQUNqRztBQUNBLDZCQUF5QjtBQUN6QiwyQkFBdUI7QUFDdkIsYUFBUyxJQUFJLHlDQUF5Qyx3QkFBd0IsZUFBZTtBQUFBLEVBQy9GO0FBS08sV0FBUyw4QkFBOEI7QUFDNUMsUUFBSSwyQkFBMkIsTUFBTTtBQUNuQyxlQUFTLElBQUksMkNBQTJDLHdCQUF3QjtBQUFBLElBQ2xGO0FBQ0EsNkJBQXlCO0FBQ3pCLDJCQUF1QjtBQUFBLEVBQ3pCO0FBTUEsaUJBQXNCLGlCQUFpQixRQUFRLGdCQUFnQixNQUFNO0FBQ25FLFVBQU0sVUFBVSx3QkFBd0I7QUFFeEMsUUFBSSxDQUFDLFFBQVEsT0FBTztBQUVsQixhQUFPLGNBQWMsUUFBUSxhQUFhO0FBQUEsSUFDNUM7QUFFQSxRQUFJO0FBRUYsVUFBSSxNQUFNLFdBQVcsUUFBUSxLQUFLLEdBQUc7QUFDbkMsaUJBQVMsSUFBSSxpQ0FBaUMsUUFBUSx1QkFBdUIsUUFBUTtBQUNyRixjQUFNLE9BQU8sS0FBSyxPQUFPLFFBQVEsT0FBTyxFQUFFLEtBQUssUUFBUSxRQUFRLEtBQUssQ0FBQztBQUNyRSxrQ0FBMEIsUUFBUSxPQUFPLGFBQWE7QUFDdEQsZUFBTyxRQUFRO0FBQUEsTUFDakIsT0FBTztBQUVMLGlCQUFTLElBQUksK0JBQStCLFFBQVEsbUNBQW1DO0FBQ3ZGLGNBQU0sa0JBQWtCO0FBQ3hCLG9DQUE0QjtBQUM1QixlQUFPLGNBQWMsUUFBUSxhQUFhO0FBQUEsTUFDNUM7QUFBQSxJQUNGLFNBQVMsT0FBUDtBQUNBLGVBQVMsTUFBTSxpREFBaUQsS0FBSztBQUNyRSxZQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7QUFhQSxpQkFBc0IsK0JBQStCLFVBQVU7QUFDN0QsUUFBSTtBQUNGLGVBQVMsSUFBSSwyRkFBMkY7QUFHeEcsVUFBSSxZQUFZO0FBQ2hCLFVBQUksVUFBVTtBQUNaLGNBQU0sZ0JBQWdCLFNBQVMsUUFBUSxNQUFNLEVBQUU7QUFDL0Msb0JBQVksK0JBQStCO0FBQzNDLGlCQUFTLElBQUksK0VBQXdFLFdBQVc7QUFBQSxNQUNsRztBQUdBLFlBQU0sYUFBYSxNQUFNLE9BQU8sS0FBSyxNQUFNLEVBQUUsS0FBSyxxQkFBcUIsQ0FBQztBQUd4RSxZQUFNLGFBQWEsTUFBTSxPQUFPLEtBQUssTUFBTSxFQUFFLFFBQVEsTUFBTSxlQUFlLEtBQUssQ0FBQztBQUNoRixVQUFJLGVBQWU7QUFDbkIsVUFBSSxXQUFXLFNBQVMsR0FBRztBQUN6QixjQUFNLFlBQVksV0FBVztBQUM3QixZQUFJLFVBQVUsT0FBTyxVQUFVLElBQUksU0FBUyxZQUFZLEdBQUc7QUFDekQseUJBQWU7QUFBQSxRQUNqQjtBQUFBLE1BQ0Y7QUFHQSxVQUFJLENBQUMsZ0JBQWdCLFdBQVcsU0FBUyxHQUFHO0FBQzFDLHVCQUFlLFdBQVc7QUFBQSxNQUM1QjtBQUdBLFlBQU0sY0FBYyxXQUFXLE9BQU8sU0FBTyxDQUFDLGdCQUFnQixJQUFJLE9BQU8sYUFBYSxFQUFFO0FBQ3hGLFVBQUksWUFBWSxTQUFTLEdBQUc7QUFDMUIsaUJBQVMsSUFBSSwyQkFBMkIsWUFBWSx5Q0FBeUMsZUFBZSxhQUFhLEtBQUssWUFBWTtBQUcxSSxjQUFNLGlCQUFpQixZQUFZO0FBQUEsVUFBSSxTQUNyQyxPQUFPLEtBQUssWUFBWSxJQUFJLElBQUksRUFBRSxNQUFNLGdDQUFnQyxDQUFDLEVBQUUsTUFBTSxNQUFNO0FBQ3JGLHFCQUFTLElBQUkscUVBQXFFLElBQUksSUFBSTtBQUFBLFVBQzVGLENBQUM7QUFBQSxRQUNIO0FBRUEsY0FBTSxRQUFRLEtBQUs7QUFBQSxVQUNqQixRQUFRLElBQUksY0FBYztBQUFBLFVBQzFCLElBQUksUUFBUSxhQUFXLFdBQVcsU0FBUyxHQUFHLENBQUM7QUFBQSxRQUNqRCxDQUFDO0FBR0QsY0FBTSxPQUFPLEtBQUssT0FBTyxZQUFZLElBQUksU0FBTyxJQUFJLEVBQUUsQ0FBQztBQUd2RCxvQkFBWSxRQUFRLFNBQU8sb0JBQW9CLElBQUksRUFBRSxDQUFDO0FBQUEsTUFDeEQ7QUFFQSxVQUFJO0FBQ0osVUFBSSxjQUFjO0FBQ2hCLGlCQUFTLElBQUksK0NBQStDLGFBQWEsaUJBQWlCO0FBRzFGLDRCQUFvQixhQUFhLEVBQUU7QUFFbkMsWUFBSTtBQUVGLGdCQUFNLE9BQU8sS0FBSyxZQUFZLGFBQWEsSUFBSTtBQUFBLFlBQzdDLE1BQU07QUFBQSxVQUNSLENBQUMsRUFBRSxNQUFNLE1BQU07QUFFYixxQkFBUyxJQUFJLHFFQUFxRSxhQUFhLElBQUk7QUFBQSxVQUNyRyxDQUFDO0FBQUEsUUFDSCxTQUFTLEdBQVA7QUFBQSxRQUVGO0FBRUEsb0JBQVksTUFBTSxPQUFPLEtBQUssT0FBTyxhQUFhLElBQUksRUFBRSxLQUFLLFdBQVcsUUFBUSxLQUFLLENBQUM7QUFBQSxNQUN4RixPQUFPO0FBQ0wsaUJBQVMsSUFBSSw2RUFBNkU7QUFFMUYsb0JBQVksTUFBTSxPQUFPLEtBQUssT0FBTztBQUFBLFVBQ25DLEtBQUs7QUFBQSxVQUNMLFFBQVE7QUFBQSxRQUNWLENBQUM7QUFBQSxNQUNIO0FBR0EsWUFBTSxpQkFBaUIsVUFBVSxFQUFFO0FBQ25DLGdDQUEwQixVQUFVLElBQUksV0FBVyxNQUFNO0FBRXpELGVBQVMsSUFBSSxzREFBc0QsVUFBVSxJQUFJO0FBQ2pGLGFBQU8sVUFBVTtBQUFBLElBQ25CLFNBQVMsT0FBUDtBQUNBLGVBQVMsTUFBTSx5RUFBeUUsS0FBSztBQUM3RixZQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7OztBQ2xXQSxNQUFNLDBCQUEwQixDQUFDO0FBQ2pDLE1BQU0seUJBQXlCLENBQUM7QUFHaEMsTUFBTSxtQkFBbUIsb0JBQUksSUFBSTtBQUsxQixXQUFTLFNBQVMsT0FBTyxTQUFTO0FBQ3ZDLGFBQVMsSUFBSSxrQkFBa0IsVUFBVSxTQUFTO0FBQ2xELFFBQUksT0FBTztBQUNULGFBQU8sS0FBSztBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLEVBQUUsTUFBTSxNQUFNO0FBQUEsTUFBQyxDQUFDO0FBQUEsSUFDbEI7QUFBQSxFQUNGO0FBS0EsaUJBQXNCLHFCQUFxQixPQUFPLEVBQUUsVUFBVSxJQUFJLGlCQUFpQixJQUFJLElBQUksQ0FBQyxHQUFHO0FBQzdGLFFBQUksVUFBVTtBQUNkLGFBQVMsSUFBSSxHQUFHLElBQUksU0FBUyxLQUFLO0FBQ2hDLFVBQUk7QUFDRixjQUFNLE1BQU0sTUFBTSxPQUFPLEtBQUssSUFBSSxLQUFLO0FBQ3ZDLFlBQUksQ0FBQyxPQUFPLElBQUksV0FBVztBQUN6QixnQkFBTSxJQUFJLFFBQVEsQ0FBQyxZQUFZLFdBQVcsU0FBUyxPQUFPLENBQUM7QUFDM0Qsb0JBQVUsS0FBSyxJQUFJLEtBQU0sS0FBSyxNQUFNLFVBQVUsR0FBRyxDQUFDO0FBQ2xEO0FBQUEsUUFDRjtBQUNBLFlBQUksSUFBSSxXQUFXLFlBQVk7QUFDN0IsZ0JBQU0sSUFBSSxRQUFRLENBQUMsWUFBWSxXQUFXLFNBQVMsT0FBTyxDQUFDO0FBQzNELG9CQUFVLEtBQUssSUFBSSxLQUFNLEtBQUssTUFBTSxVQUFVLEdBQUcsQ0FBQztBQUNsRDtBQUFBLFFBQ0Y7QUFFQSxjQUFNLE1BQU0sTUFBTSxPQUFPLEtBQUssWUFBWSxPQUFPLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDakUsWUFBSSxPQUFPLElBQUk7QUFBTSxpQkFBTztBQUFBLE1BQzlCLFNBQVMsR0FBUDtBQUFBLE1BQ0Y7QUFDQSxZQUFNLElBQUksUUFBUSxDQUFDLFlBQVksV0FBVyxTQUFTLE9BQU8sQ0FBQztBQUMzRCxnQkFBVSxLQUFLLElBQUksS0FBTSxLQUFLLE1BQU0sVUFBVSxHQUFHLENBQUM7QUFBQSxJQUNwRDtBQUNBLFdBQU87QUFBQSxFQUNUO0FBS0EsaUJBQXNCLGFBQWEsT0FBTyxVQUFVLFFBQVE7QUFDMUQsVUFBTSxRQUFRLE1BQU0scUJBQXFCLEtBQUs7QUFDOUMsUUFBSSxDQUFDLE9BQU87QUFDVixlQUFTLE1BQU0sNENBQTRDLGlDQUFpQyxTQUFTO0FBQ3JHLGVBQVMsT0FBTywyREFBMkQsVUFBVTtBQUNyRixhQUFPLFVBQVU7QUFDakIsYUFBTztBQUFBLElBQ1Q7QUFFQSxRQUFJO0FBQ0YsWUFBTSxPQUFPLEtBQUssWUFBWSxPQUFPO0FBQUEsUUFDbkMsTUFBTTtBQUFBLFFBQ04sU0FBUyxFQUFFLFNBQVM7QUFBQSxNQUN0QixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1QsU0FBUyxLQUFQO0FBQ0EsZUFBUyxNQUFNLGtDQUFrQyxZQUFZLEdBQUc7QUFDaEUsYUFBTyxVQUFVO0FBQ2pCLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUtBLGlCQUFzQixtQkFBbUIsVUFBVSxVQUFVO0FBQzNELFFBQUk7QUFDRixlQUFTLElBQUksd0RBQXdEO0FBRXJFLFlBQU0sV0FBVyxNQUFNLG1CQUFtQixRQUFRO0FBRWxELGdCQUFVLFlBQVk7QUFBQSxRQUNwQixRQUFRLFNBQVM7QUFBQSxRQUNqQjtBQUFBLFFBQ0E7QUFBQSxRQUNBLGVBQWUsS0FBSyxJQUFJO0FBQUEsUUFDeEIsdUJBQXVCLEtBQUssSUFBSTtBQUFBLFFBQ2hDLFdBQVc7QUFBQSxRQUNYLFlBQVk7QUFBQSxNQUNkO0FBRUEsWUFBTSxrQkFBa0IsQ0FBQyxPQUFPLFlBQVksUUFBUTtBQUNsRCxZQUFJLFVBQVUsWUFBWSxXQUFXLFdBQVcsWUFBWTtBQUMxRCxpQkFBTyxLQUFLLFVBQVUsZUFBZSxlQUFlO0FBRXBELG1CQUFTLElBQUksdUJBQXVCLHlCQUF5QixJQUFJLEtBQUs7QUFFdEUsY0FBSSxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxTQUFTLFNBQVMsR0FBRztBQUM1QyxxQkFBUyxNQUFNLFlBQVksbUNBQW1DLElBQUksS0FBSztBQUN2RSxtQkFBTyxVQUFVO0FBQ2pCO0FBQUEsVUFDRjtBQUVBLHFCQUFXLE1BQU07QUFDZixxQkFBUyxJQUFJLDJDQUEyQyxVQUFVO0FBQ2xFLG1CQUFPLEtBQUssWUFBWSxVQUFVO0FBQUEsY0FDaEMsTUFBTTtBQUFBLGNBQ047QUFBQSxjQUNBO0FBQUEsWUFDRixDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVE7QUFDaEIsdUJBQVMsTUFBTSw4Q0FBOEMsYUFBYSxHQUFHO0FBQzdFLHFCQUFPLFVBQVU7QUFBQSxZQUNuQixDQUFDO0FBQUEsVUFDSCxHQUFHLEdBQUk7QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUVBLDBCQUFvQixVQUFVLGVBQWU7QUFDN0MsYUFBTztBQUFBLElBQ1QsU0FBUyxPQUFQO0FBQ0EsZUFBUyxNQUFNLHlDQUF5QyxLQUFLO0FBQzdELFlBQU07QUFBQSxJQUNSO0FBQUEsRUFDRjtBQTREQSxpQkFBc0IsNEJBQTRCLE9BQU8sVUFBVTtBQUNqRSxRQUFJLENBQUMsU0FBUyxDQUFDO0FBQVU7QUFDekIsVUFBTSxnQkFBZ0IsU0FBUyxRQUFRLE1BQU0sRUFBRTtBQUMvQyxVQUFNLGVBQWUsK0JBQStCO0FBRXBELFFBQUksd0JBQXdCLFFBQVE7QUFDbEMsYUFBTyxLQUFLLFVBQVUsZUFBZSx3QkFBd0IsTUFBTTtBQUNuRSxhQUFPLHdCQUF3QjtBQUFBLElBQ2pDO0FBRUEsUUFBSSx1QkFBdUIsUUFBUTtBQUNqQyxtQkFBYSx1QkFBdUIsTUFBTTtBQUMxQyxhQUFPLHVCQUF1QjtBQUFBLElBQ2hDO0FBRUEsUUFBSTtBQUNGLFlBQU0sTUFBTSxNQUFNLE9BQU8sS0FBSyxJQUFJLEtBQUs7QUFDdkMsVUFBSSxLQUFLLE9BQU8sSUFBSSxJQUFJLFNBQVMsU0FBUyxnQkFBZ0IsS0FBSyxJQUFJLElBQUksU0FBUyxZQUFZLEdBQUc7QUFDN0YsZUFBTyxLQUFLLE9BQU8sS0FBSyxFQUFFLE1BQU0sTUFBTTtBQUFBLFFBQUMsQ0FBQztBQUN4QztBQUFBLE1BQ0Y7QUFBQSxJQUNGLFNBQVMsR0FBUDtBQUFBLElBQ0Y7QUFFQSxVQUFNLFdBQVcsQ0FBQyxjQUFjLFlBQVksUUFBUTtBQUNsRCxVQUFJLGlCQUFpQjtBQUFPO0FBQzVCLFVBQUksV0FBVyxXQUFXO0FBQVk7QUFDdEMsVUFBSSxDQUFDLEtBQUssT0FBTyxDQUFDLElBQUksSUFBSSxTQUFTLFNBQVMsZ0JBQWdCLEtBQUssQ0FBQyxJQUFJLElBQUksU0FBUyxZQUFZO0FBQUc7QUFFbEcsYUFBTyxLQUFLLFVBQVUsZUFBZSxRQUFRO0FBQzdDLGFBQU8sd0JBQXdCO0FBRS9CLFVBQUksdUJBQXVCLFFBQVE7QUFDakMscUJBQWEsdUJBQXVCLE1BQU07QUFDMUMsZUFBTyx1QkFBdUI7QUFBQSxNQUNoQztBQUVBLGFBQU8sS0FBSyxPQUFPLEtBQUssRUFBRSxNQUFNLE1BQU07QUFBQSxNQUFDLENBQUM7QUFBQSxJQUMxQztBQUVBLDRCQUF3QixTQUFTO0FBQ2pDLFdBQU8sS0FBSyxVQUFVLFlBQVksUUFBUTtBQUUxQywyQkFBdUIsU0FBUyxXQUFXLE1BQU07QUFDL0MsVUFBSSx3QkFBd0IsV0FBVyxVQUFVO0FBQy9DLGVBQU8sS0FBSyxVQUFVLGVBQWUsUUFBUTtBQUM3QyxlQUFPLHdCQUF3QjtBQUFBLE1BQ2pDO0FBQ0EsYUFBTyx1QkFBdUI7QUFBQSxJQUNoQyxHQUFHLEdBQUs7QUFHUixRQUFJO0FBQ0YsWUFBTSxpQkFBaUIsY0FBYyxXQUFXLGVBQWU7QUFBQSxJQUNqRSxTQUFTLE9BQVA7QUFDQSxlQUFTLE1BQU0sMERBQTBELEtBQUs7QUFBQSxJQUNoRjtBQUFBLEVBQ0Y7QUFLQSxpQkFBc0Isd0JBQXdCLFVBQVUsaUJBQWlCO0FBQ3ZFLGFBQVMsSUFBSSxvQ0FBb0M7QUFFakQsVUFBTSxxQkFBcUIsVUFBVSxpQkFBaUIsRUFBRSxVQUFVLGNBQWMsU0FBUyxDQUFDO0FBRTFGLFVBQU0sUUFBUSxVQUFVO0FBQ3hCLFFBQUksU0FBUyxNQUFNLHdCQUF3QjtBQUN6QyxlQUFTLElBQUksaUVBQWlFO0FBQzlFO0FBQUEsSUFDRjtBQUVBLFFBQUksT0FBTztBQUNULFlBQU0seUJBQXlCO0FBQUEsSUFDakM7QUFFQSxRQUFJO0FBQ0YsWUFBTSxjQUFjLE1BQU0sY0FBYztBQUV4QyxVQUFJLGFBQWE7QUFDZixpQkFBUyxJQUFJLDJDQUEyQztBQUV4RCwyQkFBbUIsVUFBVSxXQUFXLEVBQ3JDLEtBQUssQ0FBQyxhQUFhO0FBQ2xCLG1CQUFTLElBQUksNkJBQTZCLGdCQUFnQixVQUFVO0FBQ3BFLGlCQUFPLFVBQVU7QUFBQSxRQUNuQixDQUFDLEVBQ0EsTUFBTSxDQUFDLFFBQVE7QUFDZCxtQkFBUyxNQUFNLG1DQUFtQyxHQUFHO0FBQ3JELGlCQUFPLFVBQVU7QUFBQSxRQUNuQixDQUFDO0FBQUEsTUFDTCxPQUFPO0FBQ0wsaUJBQVMsSUFBSSx1Q0FBdUM7QUFDcEQsZUFBTyxVQUFVO0FBQUEsTUFDbkI7QUFBQSxJQUNGLFNBQVMsT0FBUDtBQUNBLGVBQVMsTUFBTSwwQ0FBMEMsS0FBSztBQUM5RCxhQUFPLFVBQVU7QUFBQSxJQUNuQjtBQUFBLEVBQ0Y7QUFLTyxXQUFTLHNCQUFzQixPQUFPLFVBQVU7QUFDckQsYUFBUyxJQUFJLG9DQUFvQyxtQkFBbUIsVUFBVTtBQUU5RSxVQUFNLG9CQUFvQixtQkFBbUI7QUFDN0MsUUFBSTtBQUFtQixvQkFBYyxpQkFBaUI7QUFFdEQsdUJBQW1CLFlBQVksTUFBTTtBQUNuQywyQkFBcUIsT0FBTyxRQUFRO0FBQUEsSUFDdEMsR0FBRyxjQUFjLENBQUM7QUFFbEIseUJBQXFCLE9BQU8sUUFBUTtBQUFBLEVBQ3RDO0FBS0EsaUJBQXNCLHFCQUFxQixPQUFPLFVBQVU7QUFDMUQsVUFBTSxlQUFlLFVBQVU7QUFFL0IsUUFBSSxnQkFBZ0IsYUFBYSxXQUFXLFNBQVMsU0FBUztBQUM1RCxlQUFTLElBQUksNkRBQTZEO0FBQzFFO0FBQUEsSUFDRjtBQUVBLFFBQUksY0FBYztBQUNoQixlQUFTLElBQUksaURBQWlELGFBQWEsUUFBUTtBQUNuRjtBQUFBLElBQ0Y7QUFFQSxhQUFTLElBQUksMkNBQTJDLFVBQVU7QUFFbEUsUUFBSTtBQUNGLFlBQU0sRUFBRSxnQkFBZ0IsSUFBSSxNQUFNLE9BQU8sUUFBUSxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztBQUM5RSxZQUFNLGFBQWEsaUJBQWlCLFlBQVksaUJBQWlCLFlBQVk7QUFDN0UsVUFBSSxvQkFBb0IsQ0FBQyxjQUFjLFdBQVcsUUFBUSxNQUFNLEVBQUUsTUFBTSxTQUFTLFFBQVEsTUFBTSxFQUFFLElBQUk7QUFDbkcsY0FBTSxhQUFhLGdCQUFnQix5QkFBeUIsaUJBQWlCLFFBQVE7QUFDckYsY0FBTSxjQUFjLFlBQVk7QUFDaEMsWUFBSSxjQUFjLGVBQWUsS0FBSyxJQUFJLElBQUksY0FBYyxJQUFJLEtBQUssS0FBTTtBQUN6RSxnQkFBTSxTQUFTLE1BQU0sZ0JBQWdCLGlCQUFpQixVQUFVO0FBQ2hFLGNBQUksQ0FBQyxRQUFRLGNBQWM7QUFDekIsa0JBQU0scUJBQXFCLFdBQVcsUUFBUTtBQUM5Qyw0QkFBZ0Isb0JBQW9CO0FBQUEsY0FDbEMsUUFBUTtBQUFBLGNBQ1IsWUFBWTtBQUFBLGNBQ1osUUFBUTtBQUFBLGNBQ1IsY0FBYztBQUFBLGNBQ2QsV0FBVyxLQUFLLElBQUk7QUFBQSxZQUN0QixDQUFDO0FBQ0Qsd0NBQTRCLE9BQU8sUUFBUTtBQUMzQztBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsU0FBUyxHQUFQO0FBQUEsSUFDRjtBQUVBLFVBQU0sZ0JBQWdCLFNBQVMsUUFBUSxNQUFNLEVBQUU7QUFDL0MsVUFBTSxpQkFBaUIsK0JBQStCO0FBRXRELGFBQVMsSUFBSSw0REFBcUQsZ0JBQWdCO0FBRWxGLGNBQVUsU0FBUztBQUFBLE1BQ2pCLFFBQVEsU0FBUztBQUFBLE1BQ2pCO0FBQUEsTUFDQSxlQUFlLEtBQUssSUFBSTtBQUFBLE1BQ3hCLHVCQUF1QixLQUFLLElBQUk7QUFBQSxNQUNoQywyQkFBMkI7QUFBQSxNQUMzQixzQkFBc0I7QUFBQSxNQUN0QixzQkFBc0I7QUFBQSxJQUN4QjtBQUdBLFFBQUk7QUFDRixZQUFNLGlCQUFpQixnQkFBZ0IsV0FBVyxlQUFlO0FBQUEsSUFDbkUsU0FBUyxPQUFQO0FBQ0EsZUFBUyxNQUFNLDJEQUEyRCxLQUFLO0FBQy9FLGVBQVMsT0FBTyxrQ0FBa0MsTUFBTSxTQUFTO0FBQ2pFLGFBQU8sVUFBVTtBQUFBLElBQ25CO0FBRUEsVUFBTSx3QkFBd0IsQ0FBQyxjQUFjLFlBQVksUUFBUTtBQUMvRCxVQUFJLGlCQUFpQixTQUFTLFdBQVcsV0FBVyxjQUFjLElBQUksSUFBSSxTQUFTLFlBQVksR0FBRztBQUNoRyxjQUFNLFFBQVEsVUFBVTtBQUN4QixZQUFJLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQyxNQUFNLHNCQUFzQjtBQUN0RSxtQkFBUyxJQUFJLDREQUE0RDtBQUN6RSxnQkFBTSx1QkFBdUI7QUFDN0IsbUJBQVMsT0FBTyw2REFBNkQ7QUFFN0UscUJBQVcsTUFBTTtBQUNmLHlCQUFhLE9BQU8sTUFBTSxVQUFVLGdCQUFnQjtBQUFBLFVBQ3RELEdBQUcsR0FBSTtBQUVQLGlCQUFPLEtBQUssVUFBVSxlQUFlLHFCQUFxQjtBQUFBLFFBQzVEO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFFQSxXQUFPLEtBQUssVUFBVSxZQUFZLHFCQUFxQjtBQUV2RCxlQUFXLE1BQU07QUFDZixhQUFPLEtBQUssVUFBVSxlQUFlLHFCQUFxQjtBQUFBLElBQzVELEdBQUcsR0FBSztBQUFBLEVBQ1Y7QUFLTyxXQUFTLHFCQUFxQixPQUFPLE9BQU8sS0FBSztBQUN0RCxhQUFTLElBQUksdUNBQXVDLGtCQUFrQixNQUFNLGdCQUFnQixLQUFLO0FBRWpHLGtCQUFjLEtBQUs7QUFFbkIsUUFBSSxNQUFNLFdBQVcsU0FBUyxvQkFBb0I7QUFDaEQsVUFBSSxJQUFJLFNBQVMsTUFBTSxTQUFTLFFBQVEsTUFBTSxFQUFFLENBQUMsR0FBRztBQUNsRCxZQUFJLENBQUMsTUFBTSwyQkFBMkI7QUFDcEMsZ0JBQU0sNEJBQTRCO0FBQ2xDLG1CQUFTLE9BQU8sb0VBQW9FO0FBQ3BGLGdCQUFNLFNBQVMsU0FBUztBQUV4QixpQkFBTyxLQUFLLFlBQVksT0FBTztBQUFBLFlBQzdCLE1BQU07QUFBQSxZQUNOLFNBQVMsRUFBRSxVQUFVLE1BQU0sU0FBUztBQUFBLFVBQ3RDLENBQUMsRUFBRSxNQUFNLENBQUMsUUFBUTtBQUNoQixxQkFBUyxNQUFNLCtDQUErQyxHQUFHO0FBQ2pFLHFCQUFTLE9BQU8saUNBQWlDLElBQUksU0FBUztBQUFBLFVBQ2hFLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0YsV0FBVyxNQUFNLFdBQVcsU0FBUyxrQkFBa0I7QUFDckQsVUFBSSxJQUFJLFNBQVMsWUFBWSxHQUFHO0FBQzlCLFlBQUksQ0FBQyxNQUFNLHNCQUFzQjtBQUMvQixnQkFBTSx1QkFBdUI7QUFDN0IsbUJBQVMsT0FBTyxrRUFBa0U7QUFDbEYsZ0JBQU0sU0FBUyxTQUFTO0FBRXhCLHVCQUFhLE9BQU8sTUFBTSxVQUFVLDZCQUE2QjtBQUFBLFFBQ25FO0FBQUEsTUFDRjtBQUFBLElBQ0YsV0FBVyxNQUFNLFdBQVcsU0FBUyxvQkFBb0IsTUFBTSxzQkFBc0I7QUFDbkYsVUFBSSxJQUFJLFNBQVMsWUFBWSxLQUFLLENBQUMsTUFBTSxzQkFBc0I7QUFDN0QsY0FBTSx1QkFBdUI7QUFDN0IsaUJBQVMsT0FBTyxvRUFBb0U7QUFFcEYsbUJBQVcsTUFBTTtBQUNmLHVCQUFhLE9BQU8sTUFBTSxVQUFVLG1CQUFtQjtBQUFBLFFBQ3pELEdBQUcsR0FBSTtBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUtPLFdBQVMseUJBQXlCLE9BQU8sS0FBSztBQUNuRCxVQUFNLFFBQVEsVUFBVTtBQUN4QixRQUFJLE9BQU87QUFDVCxlQUFTLElBQUksK0JBQStCLGlCQUFpQixNQUFNLGlCQUFpQixLQUFLO0FBQ3pGLDJCQUFxQixPQUFPLE9BQU8sR0FBRztBQUFBLElBQ3hDO0FBQUEsRUFDRjtBQUtBLGlCQUFzQixzQkFBc0IsT0FBTyxRQUFRLFNBQVMsTUFBTTtBQUN4RSxhQUFTLElBQUksNkNBQTZDLGlCQUFpQixRQUFRO0FBRW5GLFVBQU0sUUFBUSxVQUFVO0FBQ3hCLFFBQUksQ0FBQyxPQUFPO0FBQ1YsZUFBUyxJQUFJLHNDQUFzQyxpQkFBaUIsbUNBQW1DO0FBQ3ZHO0FBQUEsSUFDRjtBQUVBLGFBQVMsT0FBTywyQkFBMkIsVUFBVSxvQkFBb0IsVUFBVTtBQUVuRixrQkFBYyxLQUFLO0FBRW5CLFFBQUksQ0FBQyxTQUFTO0FBQ1osZUFBUyxLQUFLLFVBQVUscUNBQXFDO0FBQzdELGFBQU8sVUFBVTtBQUNqQjtBQUFBLElBQ0Y7QUFFQSxRQUFJLFdBQVcsc0JBQXNCLE1BQU0sV0FBVyxTQUFTLG9CQUFvQjtBQUNqRixVQUFJLENBQUMsTUFBTSwyQkFBMkI7QUFDcEMsY0FBTSw0QkFBNEI7QUFDbEMsaUJBQVMsT0FBTyx1REFBdUQ7QUFFdkUsY0FBTSxTQUFTLFNBQVM7QUFDeEIsY0FBTSxnQkFBZ0IsS0FBSyxJQUFJO0FBQy9CLHNCQUFjLEtBQUs7QUFFbkIsbUJBQVcsTUFBTTtBQUNmLG1CQUFTLE9BQU8sZ0NBQWdDO0FBQ2hELGlCQUFPLEtBQUssWUFBWSxPQUFPO0FBQUEsWUFDN0IsTUFBTTtBQUFBLFlBQ04sU0FBUyxFQUFFLFVBQVUsTUFBTSxTQUFTO0FBQUEsVUFDdEMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLFNBQVMsTUFBTSxpREFBaUQsR0FBRyxDQUFDO0FBQUEsUUFDeEYsR0FBRyxJQUFJO0FBQUEsTUFDVCxPQUFPO0FBQ0wsaUJBQVMsSUFBSSxxRUFBcUU7QUFBQSxNQUNwRjtBQUFBLElBQ0YsV0FBVyxXQUFXLG9CQUFvQixNQUFNLFdBQVcsU0FBUyxrQkFBa0I7QUFDcEYsVUFBSSxDQUFDLE1BQU0sc0JBQXNCO0FBQy9CLGNBQU0sdUJBQXVCO0FBQzdCLGlCQUFTLE9BQU8scURBQXFEO0FBRXJFLGNBQU0sU0FBUyxTQUFTO0FBQ3hCLGNBQU0sZ0JBQWdCLEtBQUssSUFBSTtBQUMvQixzQkFBYyxLQUFLO0FBRW5CLG1CQUFXLE1BQU07QUFDZixtQkFBUyxPQUFPLDJCQUEyQjtBQUMzQyx1QkFBYSxPQUFPLE1BQU0sVUFBVSw4QkFBOEI7QUFBQSxRQUNwRSxHQUFHLElBQUk7QUFBQSxNQUNULE9BQU87QUFDTCxpQkFBUyxJQUFJLHFFQUFxRTtBQUFBLE1BQ3BGO0FBQUEsSUFDRixXQUFXLFdBQVcsb0JBQW9CLE1BQU0sV0FBVyxTQUFTLGVBQWU7QUFDakYsZUFBUyxJQUFJLDZFQUE2RTtBQUUxRixpQkFBVyxNQUFNO0FBQ2YsaUJBQVMsT0FBTyw2QkFBNkI7QUFDN0MsZUFBTyxLQUFLLFlBQVksT0FBTztBQUFBLFVBQzdCLE1BQU07QUFBQSxVQUNOLFNBQVMsRUFBRSxNQUFNLE1BQU0saUJBQWlCO0FBQUEsUUFDMUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRO0FBQ2hCLG1CQUFTLE1BQU0sOENBQXlDLEdBQUc7QUFDM0QsbUJBQVMsSUFBSSxrRUFBd0Q7QUFFckUsa0NBQXdCLE1BQU0sVUFBVSxLQUFLO0FBQUEsUUFDL0MsQ0FBQztBQUFBLE1BQ0gsR0FBRyxHQUFJO0FBQUEsSUFDVCxXQUFXLFdBQVcsYUFBYTtBQUNqQyxZQUFNLHFCQUFxQixPQUFPLE9BQU8sSUFBSTtBQUFBLElBQy9DLFdBQVcsV0FBVywyQkFBMkI7QUFDL0MsWUFBTSw0QkFBNEIsT0FBTyxPQUFPLFNBQVMsSUFBSTtBQUFBLElBQy9ELFdBQVcsV0FBVyx5QkFBeUI7QUFDN0MsWUFBTSwwQkFBMEIsT0FBTyxPQUFPLFNBQVMsSUFBSTtBQUFBLElBQzdEO0FBQUEsRUFDRjtBQUtBLGlCQUFlLHFCQUFxQixPQUFPLE9BQU8sTUFBTTtBQUN0RCxhQUFTLElBQUksaUZBQTBFO0FBR3ZGLFVBQU0sWUFBWSxHQUFHLFNBQVMsTUFBTTtBQUNwQyxRQUFJLGlCQUFpQixJQUFJLFNBQVMsR0FBRztBQUNuQyxlQUFTLElBQUksa0VBQXdELDJCQUEyQjtBQUNoRztBQUFBLElBQ0Y7QUFHQSxxQkFBaUIsSUFBSSxTQUFTO0FBRzlCLGVBQVcsTUFBTTtBQUNmLHVCQUFpQixPQUFPLFNBQVM7QUFBQSxJQUNuQyxHQUFHLEdBQUs7QUFFUixRQUFJLFNBQVMsTUFBTSxXQUFXLFNBQVMsa0JBQWtCO0FBQ3ZELGVBQVMsSUFBSSw4Q0FBOEM7QUFBQSxJQUM3RCxPQUFPO0FBQ0wsZUFBUyxJQUFJLDBEQUEwRDtBQUFBLElBQ3pFO0FBRUEsYUFBUyxJQUFJLDJEQUEyRDtBQUV4RSxRQUFJO0FBQ0YsWUFBTSxNQUFNLE1BQU0sT0FBTyxLQUFLLElBQUksS0FBSztBQUN2QyxlQUFTLElBQUksOENBQThDLElBQUksR0FBRztBQUVsRSxZQUFNLHFCQUFxQixJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFDMUQsZUFBTyxLQUFLO0FBQUEsVUFDVjtBQUFBLFVBQ0E7QUFBQSxZQUNFLE1BQU07QUFBQSxZQUNOLFVBQVUsTUFBTTtBQUFBLFVBQ2xCO0FBQUEsVUFDQSxDQUFDLGFBQWE7QUFDWixnQkFBSSxPQUFPLFFBQVEsV0FBVztBQUM1Qix1QkFBUyxJQUFJLHNEQUFzRDtBQUNuRSxxQkFBTyxJQUFJLE1BQU0sbUNBQW1DLE9BQU8sUUFBUSxVQUFVLE9BQU8sQ0FBQztBQUFBLFlBQ3ZGLE9BQU87QUFDTCx1QkFBUyxJQUFJLGtEQUFrRDtBQUMvRCxzQkFBUSxJQUFJO0FBQUEsWUFDZDtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRixDQUFDO0FBRUQsWUFBTTtBQUVOLFlBQU0sbUJBQW1CLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUN4RCxjQUFNLGtCQUFrQixDQUFDLFNBQVMsUUFBUSxpQkFBaUI7QUFDekQsY0FBSSxRQUFRLFNBQVMsMkJBQTJCLE9BQU8sS0FBSyxPQUFPLE9BQU87QUFDeEUsbUJBQU8sUUFBUSxVQUFVLGVBQWUsZUFBZTtBQUN2RCxxQkFBUyxJQUFJLGlEQUFpRCxRQUFRLElBQUk7QUFDMUUsb0JBQVEsUUFBUSxJQUFJO0FBQUEsVUFDdEI7QUFBQSxRQUNGO0FBQ0EsZUFBTyxRQUFRLFVBQVUsWUFBWSxlQUFlO0FBRXBELG1CQUFXLE1BQU07QUFDZixpQkFBTyxRQUFRLFVBQVUsZUFBZSxlQUFlO0FBQ3ZELGlCQUFPLElBQUksTUFBTSx1REFBdUQsQ0FBQztBQUFBLFFBQzNFLEdBQUcsSUFBSztBQUFBLE1BQ1YsQ0FBQztBQUVELFlBQU0saUJBQWlCLE1BQU07QUFDN0IsZUFBUyxJQUFJLGdEQUFnRCxjQUFjO0FBRTNFLFVBQUksa0JBQWtCLGVBQWUsV0FBVztBQUM5QyxZQUFJLGtCQUFrQjtBQUN0QixpQkFBUyxJQUFJLHVDQUF1QyxlQUFlO0FBQUEsTUFDckUsT0FBTztBQUNMLGlCQUFTLElBQUksaUVBQWlFO0FBQzlFLFlBQUksa0JBQWtCO0FBQUEsVUFDcEIsVUFBVSxNQUFNO0FBQUEsVUFDaEIsV0FBVztBQUFBLFlBQ1QsT0FBTyxNQUFNLFNBQVMsQ0FBQztBQUFBLFlBQ3ZCLE9BQU8sTUFBTSxTQUFTO0FBQUEsWUFDdEIsY0FBYyxNQUFNLGdCQUFnQjtBQUFBLFVBQ3RDO0FBQUEsVUFDQSxVQUFVLE1BQU0sWUFBWTtBQUFBLFFBQzlCO0FBQUEsTUFDRjtBQUFBLElBQ0YsU0FBUyxPQUFQO0FBQ0EsZUFBUyxLQUFLLGtFQUFrRSxNQUFNLE9BQU87QUFDN0YsVUFBSSxrQkFBa0I7QUFBQSxRQUNwQixVQUFVLE1BQU07QUFBQSxRQUNoQixXQUFXO0FBQUEsVUFDVCxPQUFPLE1BQU0sU0FBUyxDQUFDO0FBQUEsVUFDdkIsT0FBTyxNQUFNLFNBQVM7QUFBQSxVQUN0QixjQUFjLE1BQU0sZ0JBQWdCO0FBQUEsUUFDdEM7QUFBQSxRQUNBLFVBQVUsTUFBTSxZQUFZO0FBQUEsTUFDOUI7QUFDQSxlQUFTLElBQUksdURBQXVELGVBQWU7QUFBQSxJQUNyRjtBQUVBLG9CQUFnQixpQkFBaUIsZUFBZSxFQUM3QyxLQUFLLE9BQU8sV0FBVztBQUN0QixlQUFTLElBQUkseUNBQWtDO0FBQUEsUUFDN0MsY0FBYyxPQUFPO0FBQUEsUUFDckIsUUFBUSxPQUFPO0FBQUEsUUFDZixnQkFBZ0IsT0FBTztBQUFBLE1BQ3pCLENBQUM7QUFFRCxVQUFJLE9BQU8sY0FBYztBQUN2QixpQkFBUyxJQUFJLHdEQUFpRCxPQUFPLFFBQVE7QUFFN0UsWUFBSSxPQUFPLGFBQWEsT0FBTyxXQUFXLGtCQUFrQixPQUFPLFdBQVcsb0JBQW9CLE9BQU8sV0FBVyxvQkFBb0IsT0FBTyxXQUFXLDhCQUE4QjtBQUN0TCxtQkFBUyxJQUFJLHFGQUF5RTtBQUV0RixnQkFBTSx5QkFBeUI7QUFFL0IsZ0JBQU0scUJBQXFCLFVBQVUsaUJBQWlCO0FBQUEsWUFDcEQsVUFBVSxNQUFNO0FBQUEsWUFDaEIsa0JBQWtCLE9BQU87QUFBQSxZQUN6QixjQUFjO0FBQUEsWUFDZDtBQUFBLFVBQ0YsQ0FBQztBQUVELGlCQUFPLEtBQ0osWUFBWSxPQUFPO0FBQUEsWUFDbEIsTUFBTTtBQUFBLFlBQ04sVUFBVSxNQUFNO0FBQUEsVUFDbEIsQ0FBQyxFQUNBLEtBQUssQ0FBQyxhQUFhO0FBQ2xCLHFCQUFTLElBQUksMENBQTBDLFFBQVE7QUFBQSxVQUdqRSxDQUFDLEVBQ0EsTUFBTSxPQUFPLFFBQVE7QUFDcEIscUJBQVMsTUFBTSw4Q0FBeUMsR0FBRztBQUMzRCxxQkFBUyxJQUFJLDBFQUFnRTtBQUk3RSxrQkFBTSx5QkFBeUI7QUFHL0Isa0JBQU0scUJBQXFCLFdBQVcsTUFBTSxRQUFRO0FBQ3BELGtCQUFNLHNCQUFzQixNQUFNLFVBQVUsQ0FBQyxhQUFhO0FBQ3hELHVCQUFTLElBQUksZ0RBQWdELFFBQVE7QUFBQSxZQUN2RSxDQUFDO0FBQUEsVUFDSCxDQUFDO0FBQUEsUUFDTCxPQUFPO0FBQ0wsbUJBQVMsSUFBSSxpRkFBMEU7QUFDdkYsa0NBQXdCLE1BQU0sVUFBVSxLQUFLO0FBQUEsUUFDL0M7QUFBQSxNQUNGLE9BQU87QUFDTCxpQkFBUyxJQUFJLHlGQUFvRjtBQUVqRyxjQUFNLHFCQUFxQixXQUFXLE1BQU0sUUFBUTtBQUVwRCxjQUFNLGtCQUFrQjtBQUFBLFVBQ3RCLFFBQVE7QUFBQSxVQUNSLFlBQVk7QUFBQSxVQUNaLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFdBQVcsS0FBSyxJQUFJO0FBQUEsUUFDdEI7QUFFQSxjQUFNLGdCQUFnQixvQkFBb0IsZUFBZTtBQUN6RCxjQUFNLFdBQVcsTUFBTTtBQUN2QixlQUFPLFVBQVU7QUFDakIsb0NBQTRCLE9BQU8sUUFBUTtBQUFBLE1BQzdDO0FBQUEsSUFDRixDQUFDLEVBQ0EsTUFBTSxDQUFDLFFBQVE7QUFDZCxlQUFTLE1BQU0sNkNBQXdDLEdBQUc7QUFDMUQsYUFBTyxVQUFVO0FBQUEsSUFDbkIsQ0FBQyxFQUNBLFFBQVEsTUFBTTtBQUViLHVCQUFpQixPQUFPLFNBQVM7QUFBQSxJQUNuQyxDQUFDO0FBQUEsRUFDTDtBQUtBLGlCQUFlLDRCQUE0QixPQUFPLE9BQU8sU0FBUyxNQUFNO0FBQ3RFLGFBQVMsSUFBSSw2RkFBNkY7QUFFMUcsVUFBTSw0QkFBNEIsU0FBUyxNQUFNO0FBQ2pELFFBQUksV0FBVyxPQUFPO0FBQ3RCLFFBQUksV0FBVyxPQUFPLFVBQVU7QUFFaEMsUUFBSSxPQUFPO0FBQ1QsYUFBTyxVQUFVO0FBQUEsSUFDbkI7QUFFQSxRQUFJLGFBQWEsVUFBVSxZQUFZO0FBQ3ZDLFFBQUksV0FBVywyQkFBMkI7QUFDeEMsbUJBQWE7QUFBQSxJQUNmO0FBR0EsVUFBTSxrQkFBa0I7QUFBQSxNQUN0QixRQUFRLFVBQVUsY0FBYztBQUFBLE1BQ2hDO0FBQUEsTUFDQSxRQUFRLE1BQU0sVUFBVTtBQUFBLE1BQ3hCLGNBQWMsTUFBTSxTQUFTO0FBQUEsTUFDN0IsV0FBVyxLQUFLLElBQUk7QUFBQSxJQUN0QjtBQUVBLFFBQUksU0FBUztBQUNYLFlBQU0scUJBQXFCLFdBQVcsUUFBUTtBQUM5QyxZQUFNLE9BQU8sUUFBUSxNQUFNLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztBQUNyRCxlQUFTLElBQUksd0VBQW1FLFVBQVU7QUFHMUYsVUFBSSxVQUFVO0FBQ1osWUFBSTtBQUVGLGdCQUFNLFlBQVksTUFBTSxhQUFhO0FBQ3JDLGdCQUFNLGVBQWUsTUFBTSxnQkFBZ0I7QUFFM0MsZ0JBQU0sY0FBYyxDQUFDO0FBQ3JCLGNBQUk7QUFBVyx3QkFBWSxrQkFBa0I7QUFDN0MsY0FBSTtBQUFjLHdCQUFZLGlCQUFpQjtBQUcvQyxjQUFJLGFBQWEsY0FBYztBQUU3QixrQkFBTSxNQUFNLElBQUksS0FBSztBQUNyQixrQkFBTSxnQkFBZ0IsSUFBSSxZQUFZLElBQUksTUFDeEMsT0FBTyxJQUFJLFNBQVMsSUFBSSxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUcsSUFBSSxNQUM5QyxPQUFPLElBQUksUUFBUSxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUcsSUFBSSxNQUN6QyxPQUFPLElBQUksU0FBUyxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUcsSUFBSSxNQUMxQyxPQUFPLElBQUksV0FBVyxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUcsSUFBSSxNQUM1QyxPQUFPLElBQUksV0FBVyxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUc7QUFDMUMsd0JBQVksWUFBWTtBQUFBLFVBQzFCO0FBRUEsbUJBQVMsSUFBSSw2REFBc0QsVUFBVTtBQUFBLFlBQzNFO0FBQUEsVUFDRixDQUFDO0FBQ0QsbUJBQVMsSUFBSSwrQ0FBK0MsT0FBTyxRQUFRO0FBRTNFLGdCQUFNLGdCQUFnQixpQkFBaUIsVUFBVSxVQUFVLFdBQVc7QUFDdEUsbUJBQVMsSUFBSSx1REFBa0Q7QUFHL0QsMEJBQWdCLGdCQUFnQjtBQUNoQywwQkFBZ0IsV0FBVztBQUMzQixjQUFJO0FBQVcsNEJBQWdCLFlBQVk7QUFDM0MsY0FBSTtBQUFjLDRCQUFnQixlQUFlO0FBQUEsUUFDbkQsU0FBUyxPQUFQO0FBQ0EsbUJBQVMsTUFBTSxzQ0FBc0MsS0FBSztBQUUxRCwwQkFBZ0IsZ0JBQWdCO0FBQ2hDLDBCQUFnQixvQkFBb0IsTUFBTTtBQUFBLFFBQzVDO0FBQUEsTUFDRixPQUFPO0FBQ0wsaUJBQVMsSUFBSSw0REFBa0Q7QUFDL0QsaUJBQVMsSUFBSSw2QkFBNkIsT0FBTyxRQUFRO0FBQUEsTUFDM0Q7QUFBQSxJQUNGO0FBRUEsVUFBTSxnQkFBZ0Isb0JBQW9CLGVBQWU7QUFFekQsUUFBSSxXQUFXLENBQUMsVUFBVTtBQUN4QixVQUFJO0FBQ0YsY0FBTSxhQUFhLE1BQU0sT0FBTyxRQUFRLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQztBQUMvRCxjQUFNLGNBQWMsTUFBTSxPQUFPLFFBQVEsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ2pFLG1CQUFXLFdBQVcsWUFBWSxjQUFjLFlBQVksWUFBWTtBQUFBLE1BQzFFLFNBQVMsR0FBUDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRUEsUUFBSSxXQUFXLFVBQVU7QUFFdkIsaUJBQVcsWUFBWTtBQUNyQixZQUFJO0FBQ0YsZ0JBQU0sZ0JBQWdCLFNBQVMsUUFBUSxNQUFNLEVBQUU7QUFDL0MsZ0JBQU0sZUFBZSwrQkFBK0I7QUFFcEQsbUJBQVMsSUFBSSx1RUFBdUUsWUFBWTtBQUNoRyxnQkFBTSxlQUFlLE1BQU0saUJBQWlCLGNBQWMsV0FBVyxlQUFlO0FBQ3BGLHNDQUE0QixjQUFjLFFBQVE7QUFBQSxRQUNwRCxTQUFTLE9BQVA7QUFDQSxtQkFBUyxNQUFNLG9GQUFvRixLQUFLO0FBQUEsUUFDMUc7QUFBQSxNQUNGLEdBQUcsR0FBSTtBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBS0EsaUJBQWUsMEJBQTBCLE9BQU8sT0FBTyxTQUFTLE1BQU07QUFDcEUsYUFBUyxJQUFJLHVDQUF1QztBQUNwRCxhQUFTLElBQUksOEJBQThCLElBQUk7QUFDL0MsYUFBUyxJQUFJLHVCQUF1QixPQUFPO0FBRTNDLFVBQU0sV0FBVyxPQUFPLFlBQVksTUFBTTtBQUMxQyxhQUFTLElBQUksbUJBQW1CLEtBQUs7QUFDckMsYUFBUyxJQUFJLDRCQUE0QixRQUFRO0FBS2pELFFBQUksVUFBVSxRQUFRO0FBQ3BCLGVBQVMsSUFBSSxtQ0FBbUMsK0JBQStCO0FBQy9FLGFBQU8sVUFBVTtBQUFBLElBQ25CO0FBRUEsVUFBTSxxQkFBcUIsVUFBVSxzQkFBc0I7QUFBQSxNQUN6RDtBQUFBLE1BQ0E7QUFBQSxNQUNBLGNBQWM7QUFBQSxJQUNoQixDQUFDO0FBS0QsUUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLHdCQUF3QjtBQUMzQyxZQUFNLGtCQUFrQjtBQUFBLFFBQ3RCLFFBQVEsVUFBVSxjQUFjO0FBQUEsUUFDaEMsWUFBWSxVQUFVLFlBQVk7QUFBQSxRQUNsQyxRQUFRLE1BQU0sVUFBVTtBQUFBLFFBQ3hCLGNBQWMsTUFBTSxTQUFTO0FBQUEsUUFDN0IsV0FBVyxLQUFLLElBQUk7QUFBQSxNQUN0QjtBQUNBLFlBQU0sZ0JBQWdCLG9CQUFvQixlQUFlO0FBQUEsSUFDM0QsT0FBTztBQUNMLGVBQVMsSUFBSSw0RkFBNEY7QUFBQSxJQUMzRztBQUdBLFFBQUksV0FBVyxNQUFNLFdBQVc7QUFDOUIsVUFBSTtBQUNGLGlCQUFTLElBQUksNERBQXFELEtBQUssU0FBUztBQUNoRixjQUFNLGdCQUFnQjtBQUFBLFVBQ3BCLEtBQUs7QUFBQSxVQUNMO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFDQSxpQkFBUyxJQUFJLHFEQUFnRDtBQUFBLE1BQy9ELFNBQVMsT0FBUDtBQUNBLGlCQUFTLE1BQU0sMERBQTBELEtBQUs7QUFBQSxNQUVoRjtBQUFBLElBQ0Y7QUFFQSxRQUFJLFNBQVM7QUFDWCxlQUFTLElBQUksMEZBQXFGO0FBQ2xHLFlBQU0sT0FBTyxRQUFRLE1BQU0sT0FBTyxDQUFDLGlCQUFpQixDQUFDO0FBRXJELFVBQUksVUFBVTtBQUNaLGlCQUFTLElBQUksNERBQXFEO0FBR2xFLGNBQU0sZ0JBQWdCLE1BQU0sVUFBVTtBQUN0QyxZQUFJLGVBQWU7QUFDakIsZ0JBQU0sT0FBTyxRQUFRLE1BQU0sSUFBSTtBQUFBLFlBQzdCLENBQUMsZUFBZSxhQUFhO0FBQUEsY0FDM0IsUUFBUTtBQUFBLGNBQ1IsV0FBVyxLQUFLLElBQUk7QUFBQSxZQUN0QjtBQUFBLFVBQ0YsQ0FBQztBQUNELG1CQUFTLElBQUksMENBQW1DLGVBQWU7QUFBQSxRQUNqRTtBQUdBLGNBQU0scUJBQXFCLFdBQVcsUUFBUTtBQUc5QyxjQUFNLElBQUksUUFBUSxhQUFXLFdBQVcsU0FBUyxHQUFJLENBQUM7QUFHdEQsaUJBQVMsSUFBSSxzREFBK0MsVUFBVTtBQUN0RSxjQUFNLHNCQUFzQixVQUFVLENBQUMsYUFBYTtBQUNsRCxtQkFBUyxJQUFJLHVEQUF1RCxRQUFRO0FBQUEsUUFDOUUsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQU9PLFdBQVMsb0JBQW9CLGNBQWM7QUFDaEQsV0FBTyxLQUFLLE1BQU0sRUFBRSxRQUFRLE1BQU0sZUFBZSxLQUFLLEdBQUcsQ0FBQyxTQUFTO0FBQ2pFLFlBQU0sTUFBTSxLQUFLO0FBQ2pCLFVBQUksT0FBTyxJQUFJLE9BQU8sSUFBSSxJQUFJLFNBQVMsWUFBWSxHQUFHO0FBQ3BELHFCQUFhO0FBQUEsVUFDWCxTQUFTO0FBQUEsVUFDVCxNQUFNO0FBQUEsWUFDSixLQUFLLElBQUk7QUFBQSxZQUNULGNBQWM7QUFBQSxVQUNoQjtBQUFBLFFBQ0YsQ0FBQztBQUFBLE1BQ0gsT0FBTztBQUNMLHFCQUFhO0FBQUEsVUFDWCxTQUFTO0FBQUEsVUFDVCxPQUFPO0FBQUEsUUFDVCxDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFLQSxpQkFBc0IsaUJBQWlCLFVBQVUsY0FBYztBQUM3RCxhQUFTLElBQUksa0JBQWtCLFFBQVE7QUFFdkMsUUFBSTtBQUNGLFVBQUk7QUFDSixVQUFJO0FBRUosWUFBTSxhQUFhLE1BQU0sT0FBTyxRQUFRLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQztBQUMvRCxZQUFNLGNBQWMsTUFBTSxPQUFPLFFBQVEsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ2pFLG1CQUFhLFdBQVcsY0FBYyxZQUFZO0FBRWxELFVBQUksVUFBVTtBQUNaLHVCQUFlO0FBQUEsTUFDakIsT0FBTztBQUNMLFlBQUksY0FBYyxXQUFXLFlBQVk7QUFDdkMsbUJBQVMsSUFBSSxrQ0FBa0MsV0FBVyxZQUFZO0FBQ3RFLHlCQUFlLE1BQU0sZ0JBQWdCLGFBQWEsV0FBVyxVQUFVO0FBQUEsUUFDekUsT0FBTztBQUNMLGdCQUFNLGVBQWU7QUFDckIsbUJBQVMsTUFBTSxVQUFVLFlBQVk7QUFDckMsZ0JBQU0sSUFBSSxNQUFNLFlBQVk7QUFBQSxRQUM5QjtBQUFBLE1BQ0Y7QUFFQSxlQUFTLElBQUksNkJBQTZCLFlBQVk7QUFHdEQsWUFBTSxjQUFjLE1BQU0sbUJBQW1CLFlBQVk7QUFDekQsZUFBUyxJQUFJLDZDQUE2QyxXQUFXO0FBR3JFLFlBQU0sSUFBSSxRQUFRLENBQUMsWUFBWTtBQUM3QixjQUFNLGtCQUFrQixDQUFDLE9BQU8sZUFBZTtBQUM3QyxjQUFJLFVBQVUsZUFBZSxXQUFXLFdBQVcsWUFBWTtBQUM3RCxtQkFBTyxLQUFLLFVBQVUsZUFBZSxlQUFlO0FBQ3BELHVCQUFXLFNBQVMsR0FBSTtBQUFBLFVBQzFCO0FBQUEsUUFDRjtBQUNBLDRCQUFvQixhQUFhLGVBQWU7QUFBQSxNQUNsRCxDQUFDO0FBRUQsaUJBQVcsTUFBTTtBQUNmLGNBQU0sV0FBVyxZQUFZLGNBQWM7QUFFM0MsZUFBTyxLQUFLLFlBQVksYUFBYTtBQUFBLFVBQ25DLE1BQU07QUFBQSxVQUNOO0FBQUEsVUFDQSxVQUFVO0FBQUEsUUFDWixDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVE7QUFDaEIsbUJBQVMsTUFBTSx3Q0FBd0MsZ0JBQWdCLEdBQUc7QUFBQSxRQUM1RSxDQUFDO0FBQUEsTUFDSCxHQUFHLEdBQUk7QUFFUCxtQkFBYTtBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsT0FBTztBQUFBLE1BQ1QsQ0FBQztBQUFBLElBQ0gsU0FBUyxPQUFQO0FBQ0EsZUFBUyxNQUFNLCtCQUErQixLQUFLO0FBQ25ELG1CQUFhO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxPQUFPLE1BQU07QUFBQSxNQUNmLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUtPLFdBQVMsbUJBQW1CLFVBQVUsY0FBYztBQUN6RCxXQUFPLFFBQVEsS0FBSyxJQUFJLEVBQUUsU0FBUyxHQUFHLE1BQU07QUFDMUMsVUFBSSxPQUFPLFFBQVEsV0FBVztBQUM1QixxQkFBYTtBQUFBLFVBQ1gsU0FBUztBQUFBLFVBQ1QsT0FBTyxPQUFPLFFBQVEsVUFBVTtBQUFBLFFBQ2xDLENBQUM7QUFBQSxNQUNILE9BQU87QUFDTCxxQkFBYTtBQUFBLFVBQ1gsU0FBUztBQUFBLFVBQ1QsU0FBUztBQUFBLFFBQ1gsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBS08sV0FBUyxxQkFBcUIsVUFBVSxXQUFXLGNBQWM7QUFDdEUsYUFBUyxJQUFJLHdEQUF3RCxVQUFVO0FBQy9FLFdBQU8sT0FBTyxhQUFhLEVBQUUsTUFBTSxTQUFJLENBQUM7QUFDeEMsV0FBTyxPQUFPLHdCQUF3QixFQUFFLE9BQU8sVUFBVSxDQUFDO0FBQzFELGVBQVcsTUFBTTtBQUFFLGFBQU8sT0FBTyxhQUFhLEVBQUUsTUFBTSxHQUFHLENBQUM7QUFBQSxJQUFFLEdBQUcsR0FBSTtBQUNuRSxpQkFBYSxFQUFFLFNBQVMsS0FBSyxDQUFDO0FBQUEsRUFDaEM7QUFLQSxpQkFBc0Isd0JBQXdCLGNBQWM7QUFDMUQsUUFBSTtBQUNGLFlBQU0sYUFBYSxNQUFNLE9BQU8sUUFBUSxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDL0QsVUFBSSxXQUFXLGNBQWMsV0FBVyxXQUFXLFlBQVk7QUFDN0QscUJBQWEsRUFBRSxTQUFTLE1BQU0sTUFBTSxXQUFXLFdBQVcsQ0FBQztBQUMzRDtBQUFBLE1BQ0Y7QUFDQSxZQUFNLGNBQWMsTUFBTSxPQUFPLFFBQVEsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ2pFLFVBQUksWUFBWSxjQUFjLFlBQVksV0FBVyxZQUFZO0FBQy9ELHFCQUFhLEVBQUUsU0FBUyxNQUFNLE1BQU0sWUFBWSxXQUFXLENBQUM7QUFDNUQ7QUFBQSxNQUNGO0FBQ0EsbUJBQWEsRUFBRSxTQUFTLE9BQU8sT0FBTywyQkFBMkIsQ0FBQztBQUFBLElBQ3BFLFNBQVMsT0FBUDtBQUNBLG1CQUFhLEVBQUUsU0FBUyxPQUFPLE9BQU8sTUFBTSxRQUFRLENBQUM7QUFBQSxJQUN2RDtBQUFBLEVBQ0Y7QUFLTyxXQUFTLHNCQUFzQixZQUFZLGNBQWM7QUFDOUQsYUFBUyxJQUFJLG1DQUFtQyxXQUFXLFVBQVU7QUFDckUsV0FBTyxPQUFPLGFBQWEsRUFBRSxNQUFNLFlBQUssQ0FBQztBQUN6QyxXQUFPLE9BQU8sd0JBQXdCLEVBQUUsT0FBTyxVQUFVLENBQUM7QUFDMUQsZUFBVyxNQUFNO0FBQUUsYUFBTyxPQUFPLGFBQWEsRUFBRSxNQUFNLEdBQUcsQ0FBQztBQUFBLElBQUUsR0FBRyxHQUFJO0FBQ25FLGlCQUFhLEVBQUUsU0FBUyxLQUFLLENBQUM7QUFBQSxFQUNoQztBQUtBLGlCQUFzQixvQkFBb0IsY0FBYztBQUN0RCxRQUFJO0FBQ0YsWUFBTSxjQUFjLE1BQU0sT0FBTyxRQUFRLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQztBQUNqRSxVQUFJLFlBQVksWUFBWTtBQUMxQixxQkFBYSxFQUFFLFNBQVMsTUFBTSxNQUFNLFlBQVksV0FBVyxDQUFDO0FBQzVEO0FBQUEsTUFDRjtBQUVBLFlBQU0sYUFBYSxNQUFNLE9BQU8sUUFBUSxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDL0QsVUFBSSxXQUFXLFlBQVk7QUFDekIscUJBQWEsRUFBRSxTQUFTLE1BQU0sTUFBTSxXQUFXLFdBQVcsQ0FBQztBQUMzRDtBQUFBLE1BQ0Y7QUFDQSxtQkFBYSxFQUFFLFNBQVMsT0FBTyxPQUFPLHVCQUF1QixDQUFDO0FBQUEsSUFDaEUsU0FBUyxPQUFQO0FBQ0EsbUJBQWEsRUFBRSxTQUFTLE9BQU8sT0FBTyxNQUFNLFFBQVEsQ0FBQztBQUFBLElBQ3ZEO0FBQUEsRUFDRjtBQUtBLGlCQUFzQiwwQkFBMEIsVUFBVSxjQUFjO0FBQ3RFLGFBQVMsSUFBSSwyQ0FBMkMsVUFBVTtBQUVsRSxRQUFJO0FBQ0YsWUFBTSxXQUFXLE1BQU0sZ0JBQWdCLGFBQWEsUUFBUTtBQUM1RCxlQUFTLElBQUksaURBQWlELFFBQVE7QUFFdEUsWUFBTSxXQUFXLE1BQU0sbUJBQW1CLFVBQVUsUUFBUTtBQUU1RCxtQkFBYTtBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsT0FBTztBQUFBLE1BQ1QsQ0FBQztBQUFBLElBQ0gsU0FBUyxPQUFQO0FBQ0EsZUFBUyxNQUFNLDBDQUEwQyxLQUFLO0FBQzlELG1CQUFhO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxPQUFPLE1BQU07QUFBQSxNQUNmLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUtBLGlCQUFzQixlQUFlLE9BQU8sY0FBYztBQUN4RCxhQUFTLElBQUksZ0RBQXlDLE1BQU0sYUFBYTtBQUV6RSxRQUFJO0FBQ0YsY0FBUSxNQUFNO0FBQUEsYUFDUDtBQUFBLGFBQ0E7QUFDSCxnQkFBTSxxQkFBcUIsV0FBVyxNQUFNLFFBQVE7QUFDcEQsZ0JBQU0sc0JBQXNCLE1BQU0sVUFBVSxZQUFZO0FBQ3hEO0FBQUEsYUFFRztBQU9ILG1CQUFTLElBQUksMEZBQW1GO0FBQ2hHLGdCQUFNLHFCQUFxQixXQUFXLE1BQU0sUUFBUTtBQUNwRCxnQkFBTSxzQkFBc0IsTUFBTSxVQUFVLFlBQVk7QUFDeEQ7QUFBQSxhQUVHO0FBQ0gsbUJBQVMsSUFBSSx1Q0FBZ0M7QUFDN0MsY0FBSSxNQUFNLE9BQU87QUFDZixrQkFBTSxXQUFXLE1BQU0scUJBQXFCLFlBQVksTUFBTSxLQUFLO0FBQ25FLGdCQUFJLFVBQVU7QUFDWixzQ0FBd0IsTUFBTSxVQUFVLE1BQU0sS0FBSztBQUFBLFlBQ3JELE9BQU87QUFDTCx1QkFBUyxJQUFJLDZDQUE2QztBQUMxRCxvQkFBTSxxQkFBcUIsV0FBVyxNQUFNLFFBQVE7QUFDcEQsb0JBQU0sc0JBQXNCLE1BQU0sVUFBVSxZQUFZO0FBQUEsWUFDMUQ7QUFBQSxVQUNGLE9BQU87QUFDTCxxQkFBUyxJQUFJLHFFQUFxRTtBQUNsRixrQkFBTSxxQkFBcUIsV0FBVyxNQUFNLFFBQVE7QUFDcEQsa0JBQU0sc0JBQXNCLE1BQU0sVUFBVSxZQUFZO0FBQUEsVUFDMUQ7QUFDQTtBQUFBO0FBR0EsbUJBQVMsSUFBSSxxQkFBcUIsTUFBTSw2QkFBNkI7QUFDckUsZ0JBQU0scUJBQXFCLFdBQVcsTUFBTSxRQUFRO0FBQ3BELGdCQUFNLHNCQUFzQixNQUFNLFVBQVUsWUFBWTtBQUN4RDtBQUFBO0FBQUEsSUFFTixTQUFTLE9BQVA7QUFDQSxlQUFTLE1BQU0sb0NBQW9DLEtBQUs7QUFDeEQsWUFBTSxxQkFBcUIsV0FBVyxPQUFPLFFBQVE7QUFDckQsbUJBQWE7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULE9BQU8sK0JBQStCLE1BQU07QUFBQSxNQUM5QyxDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFLQSxpQkFBc0Isc0JBQXNCLFVBQVUsY0FBYztBQUNsRSxhQUFTLElBQUksd0NBQXdDLCtCQUErQjtBQUVwRixRQUFJO0FBQ0YsWUFBTSxnQkFBZ0IsTUFBTSxxQkFBcUIsYUFBYSxRQUFRO0FBQ3RFLFVBQUksZUFBZTtBQUNqQixpQkFBUyxJQUFJLHFEQUE4QyxxQkFBcUIsY0FBYyxhQUFhO0FBQzNHLGNBQU0sZUFBZSxlQUFlLFlBQVk7QUFDaEQ7QUFBQSxNQUNGO0FBRUEsWUFBTSxxQkFBcUIsVUFBVSxZQUFZLEVBQUUsVUFBVSxjQUFjLFlBQVksQ0FBQztBQUd4RixVQUFJLG9CQUFvQjtBQUN4QixVQUFJO0FBQ0YsY0FBTSxhQUFhLE1BQU0sT0FBTyxRQUFRLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQztBQUMvRCxjQUFNLGNBQWMsTUFBTSxPQUFPLFFBQVEsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ2pFLGNBQU0sYUFBYSxXQUFXLGNBQWMsWUFBWTtBQUV4RCxZQUFJLGNBQWMsV0FBVyxZQUFZO0FBQ3ZDLDhCQUFvQixXQUFXO0FBQy9CLG1CQUFTLElBQUksaUdBQTBGLG1CQUFtQjtBQUFBLFFBQzVIO0FBQUEsTUFDRixTQUFTLEdBQVA7QUFDQSxpQkFBUyxJQUFJLDBFQUEwRTtBQUFBLE1BQ3pGO0FBR0EsZUFBUyxJQUFJLHlHQUFrRztBQUMvRyxZQUFNLGFBQWEsTUFBTSwrQkFBK0IsaUJBQWlCO0FBR3pFLFlBQU0sa0JBQWtCLENBQUMsT0FBTyxZQUFZLFFBQVE7QUFDbEQsWUFBSSxVQUFVLGNBQWMsV0FBVyxXQUFXLFlBQVk7QUFDNUQsaUJBQU8sS0FBSyxVQUFVLGVBQWUsZUFBZTtBQUNwRCxtQkFBUyxJQUFJLDJCQUEyQix3Q0FBd0M7QUFDaEYsZ0NBQXNCLFlBQVksUUFBUTtBQUFBLFFBQzVDO0FBQUEsTUFDRjtBQUNBLGFBQU8sS0FBSyxVQUFVLFlBQVksZUFBZTtBQUVqRCxtQkFBYTtBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsU0FBUyxzQkFBc0IsV0FDM0IsNERBQTRELGlDQUM1RDtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1A7QUFBQSxNQUNGLENBQUM7QUFDRDtBQUFBLElBQ0YsU0FBUyxPQUFQO0FBQ0EsZUFBUyxNQUFNLHNEQUFzRCxLQUFLO0FBQzFFLG1CQUFhO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxPQUFPLE1BQU07QUFBQSxRQUNiO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFLQSxpQkFBc0Isc0JBQXNCLE9BQU8sY0FBYztBQUMvRCxhQUFTLElBQUksNkJBQTZCLE9BQU87QUFFakQsUUFBSTtBQUNGLFVBQUksT0FBTztBQUNULGNBQU0sT0FBTyxLQUFLLE9BQU8sS0FBSztBQUM5QixpQkFBUyxJQUFJLGdDQUFnQyxPQUFPO0FBQ3BELHFCQUFhLEVBQUUsU0FBUyxLQUFLLENBQUM7QUFBQSxNQUNoQyxPQUFPO0FBQ0wscUJBQWEsRUFBRSxTQUFTLE9BQU8sT0FBTywwQ0FBMEMsQ0FBQztBQUFBLE1BQ25GO0FBQUEsSUFDRixTQUFTLE9BQVA7QUFDQSxlQUFTLE1BQU0sNkJBQTZCLEtBQUs7QUFDakQsbUJBQWEsRUFBRSxTQUFTLE9BQU8sT0FBTyxNQUFNLFFBQVEsQ0FBQztBQUFBLElBQ3ZEO0FBQUEsRUFDRjtBQUtPLFdBQVMsd0JBQXdCLFVBQVUsWUFBWSxjQUFjO0FBQzFFLGFBQVMsSUFBSSxnQ0FBZ0MsaUJBQWlCLGtCQUFrQjtBQUNoRixXQUFPLE9BQU8sYUFBYSxFQUFFLE1BQU0sWUFBSyxDQUFDO0FBQ3pDLFdBQU8sT0FBTyx3QkFBd0IsRUFBRSxPQUFPLFVBQVUsQ0FBQztBQUMxRCxlQUFXLE1BQU07QUFBRSxhQUFPLE9BQU8sYUFBYSxFQUFFLE1BQU0sR0FBRyxDQUFDO0FBQUEsSUFBRSxHQUFHLEdBQUk7QUFDbkUsaUJBQWEsRUFBRSxTQUFTLEtBQUssQ0FBQztBQUFBLEVBQ2hDO0FBS0EsaUJBQXNCLG9CQUFvQixZQUFZLFNBQVMsY0FBYztBQUMzRSxhQUFTLElBQUksOEJBQThCLGVBQWUsU0FBUztBQUVuRSxRQUFJO0FBQ0YsWUFBTSxTQUFTLE1BQU0sT0FBTyxRQUFRLEtBQUssSUFBSSxDQUFDLGlCQUFpQixDQUFDO0FBQ2hFLFlBQU0sV0FBVyxPQUFPLG1CQUFtQixFQUFFLGtCQUFrQixNQUFNLGdCQUFnQixLQUFLO0FBRTFGLFVBQUksZUFBZSxXQUFXO0FBQzVCLGlCQUFTLG1CQUFtQjtBQUFBLE1BQzlCLFdBQVcsZUFBZSxRQUFRO0FBQ2hDLGlCQUFTLGlCQUFpQjtBQUFBLE1BQzVCLFdBQVcsZUFBZSxPQUFPO0FBQy9CLGlCQUFTLG1CQUFtQjtBQUM1QixpQkFBUyxpQkFBaUI7QUFBQSxNQUM1QjtBQUVBLFlBQU0sT0FBTyxRQUFRLEtBQUssSUFBSSxFQUFFLGlCQUFpQixTQUFTLENBQUM7QUFDM0QsZUFBUyxJQUFJLG1DQUFtQyxRQUFRO0FBRXhELG1CQUFhLEVBQUUsU0FBUyxNQUFNLFNBQVMsQ0FBQztBQUFBLElBQzFDLFNBQVMsT0FBUDtBQUNBLGVBQVMsTUFBTSxtQ0FBbUMsS0FBSztBQUN2RCxtQkFBYSxFQUFFLFNBQVMsT0FBTyxPQUFPLE1BQU0sUUFBUSxDQUFDO0FBQUEsSUFDdkQ7QUFBQSxFQUNGO0FBS0EsaUJBQXNCLDBCQUEwQixZQUFZLE9BQU8sY0FBYztBQUMvRSxhQUFTLElBQUksMkJBQTJCLHFCQUFxQixPQUFPO0FBRXBFLFFBQUk7QUFDRixVQUFJLGVBQWUsV0FBVztBQUM1QixZQUFJLENBQUMsT0FBTztBQUNWLGdCQUFNLE9BQU8sTUFBTSxPQUFPLEtBQUssTUFBTSxFQUFFLFFBQVEsTUFBTSxlQUFlLEtBQUssQ0FBQztBQUMxRSxjQUFJLEtBQUssV0FBVyxHQUFHO0FBQ3JCLHlCQUFhLEVBQUUsU0FBUyxPQUFPLE9BQU8sc0JBQXNCLENBQUM7QUFDN0Q7QUFBQSxVQUNGO0FBQ0Esa0JBQVEsS0FBSyxHQUFHO0FBQUEsUUFDbEI7QUFFQSxjQUFNLE9BQU8sS0FBSyxZQUFZLE9BQU87QUFBQSxVQUNuQyxNQUFNO0FBQUEsVUFDTjtBQUFBLFVBQ0EsTUFBTTtBQUFBLFFBQ1IsQ0FBQztBQUVELHFCQUFhLEVBQUUsU0FBUyxNQUFNLFNBQVMsVUFBVSw4QkFBOEIsQ0FBQztBQUFBLE1BQ2xGLFdBQVcsZUFBZSxRQUFRO0FBQ2hDLGlCQUFTLElBQUksK0NBQStDO0FBRTVELGNBQU0sYUFBYSxNQUFNLE9BQU8sUUFBUSxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDL0QsY0FBTSxXQUFXLFdBQVcsWUFBWSxjQUFjO0FBRXRELGNBQU0sV0FBVztBQUFBLFVBQ2YsT0FBTyxrQkFBa0IsS0FBSyxJQUFJO0FBQUEsVUFDbEMsTUFBTSwyQkFBMkIsS0FBSyxJQUFJO0FBQUEsVUFDMUMsS0FBSztBQUFBLFVBQ0wsV0FBVztBQUFBLFFBQ2I7QUFFQSxjQUFNLFdBQVcsTUFBTSxtQkFBbUIsVUFBVSxRQUFRO0FBRTVELHFCQUFhO0FBQUEsVUFDWCxTQUFTO0FBQUEsVUFDVCxTQUFTO0FBQUEsVUFDVCxPQUFPO0FBQUEsUUFDVCxDQUFDO0FBQUEsTUFDSCxPQUFPO0FBQ0wscUJBQWEsRUFBRSxTQUFTLE9BQU8sT0FBTyxzQkFBc0IsQ0FBQztBQUFBLE1BQy9EO0FBQUEsSUFDRixTQUFTLE9BQVA7QUFDQSxlQUFTLE1BQU0seUNBQXlDLEtBQUs7QUFDN0QsbUJBQWEsRUFBRSxTQUFTLE9BQU8sT0FBTyxNQUFNLFFBQVEsQ0FBQztBQUFBLElBQ3ZEO0FBQUEsRUFDRjtBQUtBLGlCQUFzQixvQkFBb0IsVUFBVSxjQUFjO0FBQ2hFLGFBQVMsSUFBSSx3REFBd0Q7QUFFckUsUUFBSTtBQUNGLFlBQU0sYUFBYSxNQUFNLE9BQU8sUUFBUSxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDL0QsWUFBTSxjQUFjLE1BQU0sT0FBTyxRQUFRLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQztBQUNqRSxZQUFNLGFBQWEsV0FBVyxjQUFjLFlBQVk7QUFDeEQsWUFBTSxXQUFXLFlBQVksY0FBYztBQUUzQyxVQUFJO0FBQ0osVUFBSSxjQUFjLFdBQVcsWUFBWTtBQUN2QyxpQkFBUyxJQUFJLDZDQUE2QyxXQUFXLFlBQVk7QUFDakYsd0JBQWdCLE1BQU0sZ0JBQWdCLGFBQWEsV0FBVyxVQUFVO0FBQUEsTUFDMUUsT0FBTztBQUNMLGNBQU0sZUFBZTtBQUNyQixpQkFBUyxNQUFNLFVBQVUsWUFBWTtBQUNyQyxjQUFNLElBQUksTUFBTSxZQUFZO0FBQUEsTUFDOUI7QUFFQSxlQUFTLElBQUksNkNBQTZDLGFBQWE7QUFFdkUsWUFBTSxXQUFXLE1BQU0sbUJBQW1CLFVBQVUsYUFBYTtBQUVqRSxtQkFBYTtBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsT0FBTztBQUFBLE1BQ1QsQ0FBQztBQUFBLElBQ0gsU0FBUyxPQUFQO0FBQ0EsZUFBUyxNQUFNLHVEQUF1RCxLQUFLO0FBQzNFLG1CQUFhO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxPQUFPLE1BQU07QUFBQSxNQUNmLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUtBLGlCQUFzQixrQkFBa0IsT0FBTyxjQUFjO0FBQzNELGFBQVMsSUFBSSxrQ0FBa0MsT0FBTztBQUV0RCxRQUFJO0FBQ0YsWUFBTSxRQUFRLFVBQVU7QUFDeEIsWUFBTSxzQkFBc0IsU0FBUyxNQUFNO0FBRTNDLG1CQUFhO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVDtBQUFBLFFBQ0E7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNILFNBQVMsT0FBUDtBQUNBLGVBQVMsTUFBTSxpQ0FBaUMsS0FBSztBQUNyRCxtQkFBYSxFQUFFLFNBQVMsT0FBTyxPQUFPLE1BQU0sUUFBUSxDQUFDO0FBQUEsSUFDdkQ7QUFBQSxFQUNGO0FBS0EsaUJBQXNCLHFCQUFxQixXQUFXLFFBQVEsY0FBYztBQUMxRSxhQUFTLElBQUksdUNBQXVDLE1BQU07QUFDMUQsYUFBUyxJQUFJLG9CQUFvQixXQUFXO0FBRTVDLFFBQUk7QUFDRixZQUFNLGVBQWUsTUFBTSxPQUFPLEtBQUssTUFBTSxFQUFFLEtBQUsscUJBQXFCLENBQUM7QUFFMUUsVUFBSTtBQUVKLFVBQUksYUFBYSxTQUFTLEdBQUc7QUFDM0IsY0FBTSxjQUFjLGFBQWEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLE1BQU07QUFDMUQsb0JBQVksZUFBZSxhQUFhO0FBRXhDLGlCQUFTLElBQUksNkJBQTZCLFVBQVUsZ0NBQWdDLFdBQVc7QUFFL0YsY0FBTSxPQUFPLEtBQUssT0FBTyxVQUFVLElBQUk7QUFBQSxVQUNyQyxLQUFLO0FBQUEsVUFDTCxRQUFRO0FBQUEsUUFDVixDQUFDO0FBQUEsTUFDSCxPQUFPO0FBQ0wsaUJBQVMsSUFBSSxzRUFBc0UsV0FBVztBQUM5RixvQkFBWSxNQUFNLE9BQU8sS0FBSyxPQUFPO0FBQUEsVUFDbkMsS0FBSztBQUFBLFVBQ0wsUUFBUTtBQUFBLFFBQ1YsQ0FBQztBQUFBLE1BQ0g7QUFFQSxZQUFNLGtCQUFrQixDQUFDLE9BQU8sWUFBWSxRQUFRO0FBQ2xELFlBQUksVUFBVSxVQUFVLE1BQU0sV0FBVyxXQUFXLFlBQVk7QUFDOUQsaUJBQU8sS0FBSyxVQUFVLGVBQWUsZUFBZTtBQUVwRCxtQkFBUyxJQUFJLFlBQVksVUFBVSxzREFBc0Q7QUFHekYsK0JBQXFCLFVBQVUsSUFBSSxFQUFFLFNBQVMsSUFBSSxnQkFBZ0IsSUFBSSxDQUFDLEVBQ3BFLEtBQUssQ0FBQyxVQUFVO0FBQ2YsZ0JBQUksQ0FBQyxPQUFPO0FBQ1YsdUJBQVMsTUFBTSwrQ0FBMEMsVUFBVSxrQkFBa0I7QUFDckY7QUFBQSxZQUNGO0FBRUEscUJBQVMsSUFBSSwyQ0FBc0MsVUFBVSx1QkFBdUIsT0FBTyxNQUFNO0FBRWpHLGdCQUFJO0FBQ0YscUJBQU8sS0FBSyxZQUFZLFVBQVUsSUFBSSxNQUFNLEVBQ3pDLEtBQUssTUFBTTtBQUNWLHlCQUFTLElBQUksc0JBQWlCLE9BQU8saUNBQWlDLFVBQVUsSUFBSTtBQUFBLGNBQ3RGLENBQUMsRUFDQSxNQUFNLENBQUMsUUFBUTtBQUNkLHlCQUFTLE1BQU0sNENBQXVDLFVBQVUsT0FBTyxHQUFHO0FBQUEsY0FDNUUsQ0FBQztBQUFBLFlBQ0wsU0FBUyxLQUFQO0FBQ0EsdUJBQVMsTUFBTSwyQ0FBc0MsVUFBVSxPQUFPLEdBQUc7QUFBQSxZQUMzRTtBQUFBLFVBQ0YsQ0FBQyxFQUNBLE1BQU0sQ0FBQyxRQUFRO0FBQ2QscUJBQVMsTUFBTSxpREFBNEMsR0FBRztBQUFBLFVBQ2hFLENBQUM7QUFBQSxRQUNMO0FBQUEsTUFDRjtBQUVBLGFBQU8sS0FBSyxVQUFVLFlBQVksZUFBZTtBQUVqRCxtQkFBYTtBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsU0FBUyxpQ0FBaUM7QUFBQSxRQUMxQyxPQUFPLFVBQVU7QUFBQSxNQUNuQixDQUFDO0FBQUEsSUFDSCxTQUFTLE9BQVA7QUFDQSxlQUFTLE1BQU0sb0NBQW9DLEtBQUs7QUFDeEQsbUJBQWEsRUFBRSxTQUFTLE9BQU8sT0FBTyxNQUFNLFFBQVEsQ0FBQztBQUFBLElBQ3ZEO0FBQUEsRUFDRjtBQU1BLGlCQUFzQixvQkFBb0IsY0FBYztBQUN0RCxhQUFTLElBQUksa0VBQWtFO0FBRS9FLFFBQUk7QUFDRixZQUFNLFFBQVEsTUFBTSxnQkFBZ0I7QUFDcEMsbUJBQWE7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxRQUNUO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSCxTQUFTLE9BQVA7QUFDQSxlQUFTLE1BQU0sc0NBQXNDLEtBQUs7QUFDMUQsbUJBQWE7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULE9BQU8sTUFBTTtBQUFBLE1BQ2YsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGOzs7QUNyOUNBLGlCQUFlLDZCQUE2QixVQUFVO0FBQ3BELFFBQUksQ0FBQztBQUFVO0FBQ2YsVUFBTSxxQkFBcUIsV0FBVyxRQUFRO0FBQzlDLDBCQUFzQixVQUFVLE1BQU07QUFBQSxJQUFDLENBQUM7QUFBQSxFQUMxQztBQUdBLFNBQU8sUUFBUSxVQUFVLFlBQVksQ0FBQyxTQUFTLFFBQVEsaUJBQWlCO0FBQ3RFLFVBQU0sY0FBYyxPQUFPLE1BQU0sT0FBTyxJQUFJLEtBQUs7QUFDakQsYUFBUyxJQUFJLGdDQUFnQyxRQUFRLE1BQU0sY0FBYyxZQUFZLGdCQUFnQixZQUFZO0FBRWpILFlBQVEsUUFBUTtBQUFBLFdBQ1Q7QUFDSCw0QkFBb0IsWUFBWTtBQUNoQztBQUFBLFdBRUc7QUFDSCx5QkFBaUIsUUFBUSxNQUFNLFlBQVk7QUFDM0MsZUFBTztBQUFBLFdBRUo7QUFDSCwyQkFBbUIsUUFBUSxNQUFNLFlBQVk7QUFDN0M7QUFBQSxXQUVHO0FBQ0gsNkJBQXFCLFFBQVEsVUFBVSxRQUFRLFdBQVcsWUFBWTtBQUN0RTtBQUFBLFdBRUc7QUFDSCxnQ0FBd0IsWUFBWTtBQUNwQyxlQUFPO0FBQUEsV0FFSjtBQUNILDRCQUFvQixZQUFZO0FBQ2hDLGVBQU87QUFBQSxXQUVKO0FBQ0gsOEJBQXNCLFFBQVEsVUFBVSxZQUFZO0FBQ3BELGVBQU87QUFBQSxXQUVKO0FBQ0gsa0NBQTBCLFFBQVEsVUFBVSxZQUFZO0FBQ3hELGVBQU87QUFBQSxXQUVKO0FBQ0gsaUNBQXlCLGFBQWEsUUFBUSxHQUFHO0FBQ2pELHFCQUFhLEVBQUUsVUFBVSxLQUFLLENBQUM7QUFDL0I7QUFBQSxXQUVHO0FBQ0gsWUFBSSxhQUFhO0FBQ2YsbUJBQVMsSUFBSSxzQkFBc0IsZ0JBQWdCLFFBQVEsS0FBSztBQUNoRSxnQkFBTSxRQUFRLFVBQVU7QUFDeEIsY0FBSSxPQUFPO0FBQ1QsaUNBQXFCLGFBQWEsT0FBTyxRQUFRLEdBQUc7QUFBQSxVQUN0RDtBQUFBLFFBQ0Y7QUFDQSxxQkFBYSxFQUFFLFVBQVUsS0FBSyxDQUFDO0FBQy9CO0FBQUEsV0FFRztBQUNILDhCQUFzQixhQUFhLFFBQVEsUUFBUSxRQUFRLFNBQVMsUUFBUSxJQUFJO0FBQ2hGLHFCQUFhLEVBQUUsVUFBVSxLQUFLLENBQUM7QUFDL0IsZUFBTztBQUFBLFdBRUo7QUFDSCw4QkFBc0IsUUFBUSxNQUFNLFlBQVk7QUFDaEQ7QUFBQSxXQUVHO0FBQ0gsOEJBQXNCLGFBQWEsWUFBWTtBQUMvQyxlQUFPO0FBQUEsV0FFSjtBQUNILGdDQUF3QixRQUFRLFVBQVUsUUFBUSxZQUFZLFlBQVk7QUFDMUU7QUFBQSxXQUVHO0FBQ0gsNEJBQW9CLFFBQVEsWUFBWSxRQUFRLFNBQVMsWUFBWTtBQUNyRSxlQUFPO0FBQUEsV0FFSjtBQUNILGtDQUEwQixRQUFRLFlBQVksYUFBYSxZQUFZO0FBQ3ZFLGVBQU87QUFBQSxXQUVKO0FBQ0gsNEJBQW9CLFFBQVEsVUFBVSxZQUFZO0FBQ2xELGVBQU87QUFBQSxXQUVKO0FBQ0gsMEJBQWtCLGFBQWEsWUFBWTtBQUMzQyxlQUFPO0FBQUEsV0FFSjtBQUNILDZCQUFxQixRQUFRLEtBQUssUUFBUSxRQUFRLFlBQVk7QUFDOUQsZUFBTztBQUFBLFdBRUo7QUFDSCx1QkFBZSxRQUFRLE9BQU8sWUFBWTtBQUMxQyxlQUFPO0FBQUEsV0FFSjtBQUNILDRCQUFvQixZQUFZO0FBQ2hDLGVBQU87QUFBQTtBQUdQLGlCQUFTLElBQUkseUJBQXlCLFFBQVEsSUFBSTtBQUNsRCxxQkFBYSxFQUFFLE9BQU8sdUJBQXVCLENBQUM7QUFBQTtBQUFBLEVBRXBELENBQUM7QUFHRCxTQUFPLEtBQUssVUFBVSxZQUFZLE9BQU8sT0FBTyxZQUFZLFFBQVE7QUFDbEUsVUFBTSxRQUFRLFVBQVU7QUFFeEIsU0FBSyxXQUFXLE9BQU8sV0FBVyxXQUFXLGVBQWUsSUFBSSxPQUFPLElBQUksSUFBSSxTQUFTLFlBQVksR0FBRztBQUNyRyxVQUFJLE9BQU87QUFDVCw2QkFBcUIsT0FBTyxPQUFPLElBQUksR0FBRztBQUFBLE1BQzVDO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUdELFNBQU8sS0FBSyxVQUFVLFlBQVksQ0FBQyxVQUFVO0FBQzNDLFdBQU8sVUFBVTtBQUNqQixrQkFBYyxPQUFPLEtBQUs7QUFFMUIsb0JBQWdCLEtBQUssRUFBRSxNQUFNLE1BQU07QUFBQSxJQUFDLENBQUM7QUFBQSxFQUN2QyxDQUFDO0FBR0QsTUFBTyxxQkFBUSxjQUFjLENBQUMsV0FBVztBQUN2QyxhQUFTLElBQUksd0NBQXdDLE1BQU07QUFFM0QsV0FBTyxRQUFRLE1BQU0sT0FBTyxDQUFDLHVCQUF1QixDQUFDLEVBQUUsTUFBTSxNQUFNO0FBQUEsSUFBQyxDQUFDO0FBR3JFLFVBQU1FLG9CQUFtQixJQUFJLEtBQUs7QUFDbEMsK0JBQTJCLFlBQVksTUFBTTtBQUMzQyxZQUFNLE1BQU0sS0FBSyxJQUFJO0FBQ3JCLGlCQUFXLENBQUMsVUFBVSxLQUFLLEtBQUssT0FBTyxRQUFRLFNBQVMsR0FBRztBQUN6RCxZQUFJLENBQUM7QUFBTztBQUNaLFlBQUksTUFBTSxXQUFXLFNBQVM7QUFBUztBQUN2QyxjQUFNLFNBQVMsTUFBTSx5QkFBeUIsTUFBTTtBQUNwRCxZQUFJLENBQUM7QUFBUTtBQUNiLFlBQUksTUFBTSxVQUFVQTtBQUFrQjtBQUV0QyxjQUFNLFdBQVcsTUFBTTtBQUN2QixlQUFPLFVBQVU7QUFDakIscUNBQTZCLFFBQVEsRUFBRSxNQUFNLE1BQU07QUFBQSxRQUFDLENBQUM7QUFBQSxNQUN2RDtBQUFBLElBQ0YsR0FBRyxHQUFLLENBQUM7QUFBQSxFQUNYLENBQUM7OztBQ25NRCxNQUFNLGNBQWMsQ0FBQztBQU9yQixNQUFNLGdCQUFnQixDQUFDLFNBQVM7QUFDOUIsVUFBTSxNQUFNLEtBQUssT0FBTztBQUV4QixRQUFJO0FBRUosUUFBSSxLQUFLLEtBQUssUUFBUSxHQUFHLElBQUksSUFBSTtBQUMvQixZQUFNLFFBQVEsS0FBSyxLQUFLLE1BQU0sR0FBRztBQUNqQyxxQkFBZSxNQUFNO0FBQ3JCLFdBQUssT0FBTyxNQUFNO0FBQUEsSUFDcEI7QUFJQSxRQUFJLFFBQVEsUUFBUTtBQUNsQixxQkFBZSxJQUFJO0FBQUEsSUFDckI7QUFFQSxRQUFJLG9CQUFvQixZQUFZO0FBQ3BDLFFBQUksQ0FBQyxtQkFBbUI7QUFDdEIsMEJBQW9CLFlBQVksZ0JBQWdCLENBQUM7QUFBQSxJQUNuRDtBQUVBLHNCQUFrQixLQUFLLFFBQVE7QUFBQSxNQUM3QjtBQUFBLE1BQ0EsV0FBVztBQUFBLE1BQ1gsV0FBVztBQUFBLElBQ2I7QUFFQSxXQUFPLGtCQUFrQixLQUFLO0FBQUEsRUFDaEM7QUFFQSxTQUFPLFFBQVEsVUFBVSxZQUFZLFVBQVE7QUFFM0MsVUFBTSxpQkFBaUIsY0FBYyxJQUFJO0FBQ3pDLG1CQUFlLEtBQUssYUFBYSxZQUFZLE1BQU07QUFDakQscUJBQWUsWUFBWTtBQUFBLElBQzdCLENBQUM7QUFRRCxVQUFNLFNBQVMsSUFBSSxPQUFPO0FBQUEsTUFDeEIsT0FBUSxJQUFJO0FBQ1YsaUJBQVMsZ0JBQWdCLGFBQWE7QUFDcEMsZ0JBQU0sYUFBYSxZQUFZO0FBQy9CLGNBQUksV0FBVyxPQUFPLENBQUMsV0FBVyxJQUFJLFdBQVc7QUFDL0MsdUJBQVcsSUFBSSxZQUFZO0FBQzNCLHVCQUFXLElBQUksS0FBSyxVQUFVLFlBQVksRUFBRTtBQUFBLFVBQzlDO0FBRUEsY0FBSSxXQUFXLGlCQUFpQixDQUFDLFdBQVcsY0FBYyxXQUFXO0FBQ25FLHVCQUFXLGNBQWMsS0FBSyxVQUFVLFlBQVksRUFBRTtBQUN0RCx1QkFBVyxjQUFjLFlBQVk7QUFBQSxVQUN2QztBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxLQUFNLE1BQU07QUFDVixpQkFBUyxnQkFBZ0IsYUFBYTtBQUNwQyxnQkFBTSxhQUFhLFlBQVk7QUFDL0IscUJBQVcsT0FBTyxXQUFXLElBQUksYUFBYSxXQUFXLElBQUksS0FBSyxZQUFZLElBQUk7QUFDbEYscUJBQVcsaUJBQWlCLFdBQVcsY0FBYyxhQUFhLFdBQVcsY0FBYyxLQUFLLFlBQVksSUFBSTtBQUFBLFFBQ2xIO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUVELHVCQUEyQixRQUFRLFdBQVc7QUFHOUMsYUFBUyxnQkFBZ0IsYUFBYTtBQUNwQyxZQUFNLGFBQWEsWUFBWTtBQUMvQixVQUFJLFdBQVcsT0FBTyxXQUFXLGVBQWU7QUFDOUMsdUJBQWUsV0FBVyxLQUFLLFdBQVcsYUFBYTtBQUFBLE1BQ3pEO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUVELFdBQVMsZUFBZ0IsS0FBSyxlQUFlO0FBRTNDLFFBQUksS0FBSyxVQUFVLFlBQVksQ0FBQyxZQUFZO0FBQzFDLFVBQUksY0FBYyxXQUFXO0FBQzNCLHNCQUFjLEtBQUssWUFBWSxPQUFPO0FBQUEsTUFDeEM7QUFBQSxJQUNGLENBQUM7QUFHRCxrQkFBYyxLQUFLLFVBQVUsWUFBWSxDQUFDLFlBQVk7QUFDcEQsVUFBSSxJQUFJLFdBQVc7QUFDakIsWUFBSSxLQUFLLFlBQVksT0FBTztBQUFBLE1BQzlCO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDsiLAogICJuYW1lcyI6IFsiUmVmbGVjdEFwcGx5IiwgIlJlZmxlY3RPd25LZXlzIiwgIk51bWJlcklzTmFOIiwgIkV2ZW50RW1pdHRlciIsICJvbmNlIiwgIlNUQUxMX1RJTUVPVVRfTVMiXQp9Cg==
