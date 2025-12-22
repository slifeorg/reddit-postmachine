import { _ as _export_sfc, d as defineComponent, r as ref, o as openBlock, c as createBlock, w as withCtx, v as QPage_default, x as createBaseVNode, a as createVNode, I as QTabs_default, J as QTab_default, G as QSeparator_default, K as QTabPanels_default, L as QTabPanel_default, M as QToggle_default, N as QSelect_default, O as QInput_default, m as QList_default, n as createElementBlock, p as renderList, F as Fragment, z as QBtn_default, B as QCard_default, P as withDirectives, i as QItem_default, Q as QItemSection_default, g as QItemLabel_default, h as createTextVNode, t as toDisplayString, R as Ripple_default } from "./index.3b1eadad.js";
const _sfc_main = defineComponent({
  name: "OptionsPage",
  setup() {
    const tab = ref("general");
    const settings = ref({
      enableNotifications: true,
      autoSave: true,
      theme: "auto",
      reddit: {
        username: "",
        defaultSubreddits: "",
        enableAnalytics: true
      },
      advanced: {
        apiEndpoint: "https://api.reddit.com",
        timeout: 3e4,
        debugMode: false
      }
    });
    const themeOptions = ["auto", "light", "dark"];
    const templates = ref([
      {
        id: 1,
        name: "Product Launch",
        description: "Template for product announcements"
      },
      {
        id: 2,
        name: "Community Update",
        description: "Regular community updates"
      }
    ]);
    const addTemplate = () => {
      console.log("Adding new template...");
    };
    const saveSettings = () => {
      console.log("Saving settings:", settings.value);
    };
    return {
      tab,
      settings,
      themeOptions,
      templates,
      addTemplate,
      saveSettings
    };
  }
});
const _hoisted_1 = { class: "text-grey-8 q-gutter-xs" };
const _hoisted_2 = { class: "q-mt-md text-right" };
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createBlock(QPage_default, { class: "q-pa-md" }, {
    default: withCtx(() => [
      _cache[15] || (_cache[15] = createBaseVNode("div", { class: "text-h4 q-mb-md" }, "Extension Settings", -1)),
      createVNode(QCard_default, {
        flat: "",
        bordered: ""
      }, {
        default: withCtx(() => [
          createVNode(QTabs_default, {
            modelValue: _ctx.tab,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.tab = $event),
            dense: "",
            class: "text-grey",
            "active-color": "primary",
            "indicator-color": "primary",
            align: "justify",
            "narrow-indicator": ""
          }, {
            default: withCtx(() => [
              createVNode(QTab_default, {
                name: "general",
                label: "General"
              }),
              createVNode(QTab_default, {
                name: "reddit",
                label: "Reddit"
              }),
              createVNode(QTab_default, {
                name: "templates",
                label: "Templates"
              }),
              createVNode(QTab_default, {
                name: "advanced",
                label: "Advanced"
              })
            ]),
            _: 1
          }, 8, ["modelValue"]),
          createVNode(QSeparator_default),
          createVNode(QTabPanels_default, {
            modelValue: _ctx.tab,
            "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => _ctx.tab = $event),
            animated: ""
          }, {
            default: withCtx(() => [
              createVNode(QTabPanel_default, { name: "general" }, {
                default: withCtx(() => [
                  _cache[11] || (_cache[11] = createBaseVNode("div", { class: "text-h6 q-mb-md" }, "General Settings", -1)),
                  createVNode(QToggle_default, {
                    modelValue: _ctx.settings.enableNotifications,
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => _ctx.settings.enableNotifications = $event),
                    label: "Enable notifications",
                    color: "primary"
                  }, null, 8, ["modelValue"]),
                  createVNode(QToggle_default, {
                    modelValue: _ctx.settings.autoSave,
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => _ctx.settings.autoSave = $event),
                    label: "Auto-save drafts",
                    color: "primary"
                  }, null, 8, ["modelValue"]),
                  createVNode(QSelect_default, {
                    modelValue: _ctx.settings.theme,
                    "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => _ctx.settings.theme = $event),
                    options: _ctx.themeOptions,
                    label: "Theme",
                    class: "q-mt-md"
                  }, null, 8, ["modelValue", "options"])
                ]),
                _: 1
              }),
              createVNode(QTabPanel_default, { name: "reddit" }, {
                default: withCtx(() => [
                  _cache[12] || (_cache[12] = createBaseVNode("div", { class: "text-h6 q-mb-md" }, "Reddit Integration", -1)),
                  createVNode(QInput_default, {
                    modelValue: _ctx.settings.reddit.username,
                    "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => _ctx.settings.reddit.username = $event),
                    label: "Reddit Username",
                    class: "q-mb-md"
                  }, null, 8, ["modelValue"]),
                  createVNode(QInput_default, {
                    modelValue: _ctx.settings.reddit.defaultSubreddits,
                    "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => _ctx.settings.reddit.defaultSubreddits = $event),
                    label: "Default Subreddits (comma separated)",
                    type: "textarea",
                    class: "q-mb-md"
                  }, null, 8, ["modelValue"]),
                  createVNode(QToggle_default, {
                    modelValue: _ctx.settings.reddit.enableAnalytics,
                    "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => _ctx.settings.reddit.enableAnalytics = $event),
                    label: "Enable post analytics",
                    color: "primary"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              createVNode(QTabPanel_default, { name: "templates" }, {
                default: withCtx(() => [
                  _cache[13] || (_cache[13] = createBaseVNode("div", { class: "text-h6 q-mb-md" }, "Post Templates", -1)),
                  createVNode(QList_default, {
                    bordered: "",
                    separator: ""
                  }, {
                    default: withCtx(() => [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.templates, (template) => {
                        return withDirectives((openBlock(), createBlock(QItem_default, {
                          key: template.id,
                          clickable: ""
                        }, {
                          default: withCtx(() => [
                            createVNode(QItemSection_default, null, {
                              default: withCtx(() => [
                                createVNode(QItemLabel_default, null, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(template.name), 1)
                                  ]),
                                  _: 2
                                }, 1024),
                                createVNode(QItemLabel_default, { caption: "" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(template.description), 1)
                                  ]),
                                  _: 2
                                }, 1024)
                              ]),
                              _: 2
                            }, 1024),
                            createVNode(QItemSection_default, { side: "" }, {
                              default: withCtx(() => [
                                createBaseVNode("div", _hoisted_1, [
                                  createVNode(QBtn_default, {
                                    size: "12px",
                                    flat: "",
                                    dense: "",
                                    round: "",
                                    icon: "edit"
                                  }),
                                  createVNode(QBtn_default, {
                                    size: "12px",
                                    flat: "",
                                    dense: "",
                                    round: "",
                                    icon: "delete"
                                  })
                                ])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 2
                        }, 1024)), [
                          [Ripple_default]
                        ]);
                      }), 128))
                    ]),
                    _: 1
                  }),
                  createVNode(QBtn_default, {
                    color: "primary",
                    icon: "add",
                    label: "Add Template",
                    class: "q-mt-md",
                    onClick: _ctx.addTemplate
                  }, null, 8, ["onClick"])
                ]),
                _: 1
              }),
              createVNode(QTabPanel_default, { name: "advanced" }, {
                default: withCtx(() => [
                  _cache[14] || (_cache[14] = createBaseVNode("div", { class: "text-h6 q-mb-md" }, "Advanced Settings", -1)),
                  createVNode(QInput_default, {
                    modelValue: _ctx.settings.advanced.apiEndpoint,
                    "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => _ctx.settings.advanced.apiEndpoint = $event),
                    label: "API Endpoint",
                    class: "q-mb-md"
                  }, null, 8, ["modelValue"]),
                  createVNode(QInput_default, {
                    modelValue: _ctx.settings.advanced.timeout,
                    "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => _ctx.settings.advanced.timeout = $event),
                    label: "Request Timeout (ms)",
                    type: "number",
                    class: "q-mb-md"
                  }, null, 8, ["modelValue"]),
                  createVNode(QToggle_default, {
                    modelValue: _ctx.settings.advanced.debugMode,
                    "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => _ctx.settings.advanced.debugMode = $event),
                    label: "Debug mode",
                    color: "primary"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["modelValue"])
        ]),
        _: 1
      }),
      createBaseVNode("div", _hoisted_2, [
        createVNode(QBtn_default, {
          color: "primary",
          label: "Save Settings",
          onClick: _ctx.saveSettings
        }, null, 8, ["onClick"])
      ])
    ]),
    _: 1
  });
}
var OptionsPage = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "/workspace/development/frappe-bench/apps/reddit_postmachine/lumi/src/pages/OptionsPage.vue"]]);
export { OptionsPage as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3B0aW9uc1BhZ2UuZjg4ZWQ5YzYuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9wYWdlcy9PcHRpb25zUGFnZS52dWUiXSwic291cmNlc0NvbnRlbnQiOlsiPHRlbXBsYXRlPlxuICA8cS1wYWdlIGNsYXNzPVwicS1wYS1tZFwiPlxuICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWg0IHEtbWItbWRcIj5FeHRlbnNpb24gU2V0dGluZ3M8L2Rpdj5cbiAgICBcbiAgICA8cS1jYXJkIGZsYXQgYm9yZGVyZWQ+XG4gICAgICA8cS10YWJzXG4gICAgICAgIHYtbW9kZWw9XCJ0YWJcIlxuICAgICAgICBkZW5zZVxuICAgICAgICBjbGFzcz1cInRleHQtZ3JleVwiXG4gICAgICAgIGFjdGl2ZS1jb2xvcj1cInByaW1hcnlcIlxuICAgICAgICBpbmRpY2F0b3ItY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgYWxpZ249XCJqdXN0aWZ5XCJcbiAgICAgICAgbmFycm93LWluZGljYXRvclxuICAgICAgPlxuICAgICAgICA8cS10YWIgbmFtZT1cImdlbmVyYWxcIiBsYWJlbD1cIkdlbmVyYWxcIiAvPlxuICAgICAgICA8cS10YWIgbmFtZT1cInJlZGRpdFwiIGxhYmVsPVwiUmVkZGl0XCIgLz5cbiAgICAgICAgPHEtdGFiIG5hbWU9XCJ0ZW1wbGF0ZXNcIiBsYWJlbD1cIlRlbXBsYXRlc1wiIC8+XG4gICAgICAgIDxxLXRhYiBuYW1lPVwiYWR2YW5jZWRcIiBsYWJlbD1cIkFkdmFuY2VkXCIgLz5cbiAgICAgIDwvcS10YWJzPlxuXG4gICAgICA8cS1zZXBhcmF0b3IgLz5cblxuICAgICAgPHEtdGFiLXBhbmVscyB2LW1vZGVsPVwidGFiXCIgYW5pbWF0ZWQ+XG4gICAgICAgIDxxLXRhYi1wYW5lbCBuYW1lPVwiZ2VuZXJhbFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWg2IHEtbWItbWRcIj5HZW5lcmFsIFNldHRpbmdzPC9kaXY+XG4gICAgICAgICAgXG4gICAgICAgICAgPHEtdG9nZ2xlXG4gICAgICAgICAgICB2LW1vZGVsPVwic2V0dGluZ3MuZW5hYmxlTm90aWZpY2F0aW9uc1wiXG4gICAgICAgICAgICBsYWJlbD1cIkVuYWJsZSBub3RpZmljYXRpb25zXCJcbiAgICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICBcbiAgICAgICAgICA8cS10b2dnbGVcbiAgICAgICAgICAgIHYtbW9kZWw9XCJzZXR0aW5ncy5hdXRvU2F2ZVwiXG4gICAgICAgICAgICBsYWJlbD1cIkF1dG8tc2F2ZSBkcmFmdHNcIlxuICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIFxuICAgICAgICAgIDxxLXNlbGVjdFxuICAgICAgICAgICAgdi1tb2RlbD1cInNldHRpbmdzLnRoZW1lXCJcbiAgICAgICAgICAgIDpvcHRpb25zPVwidGhlbWVPcHRpb25zXCJcbiAgICAgICAgICAgIGxhYmVsPVwiVGhlbWVcIlxuICAgICAgICAgICAgY2xhc3M9XCJxLW10LW1kXCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L3EtdGFiLXBhbmVsPlxuXG4gICAgICAgIDxxLXRhYi1wYW5lbCBuYW1lPVwicmVkZGl0XCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtaDYgcS1tYi1tZFwiPlJlZGRpdCBJbnRlZ3JhdGlvbjwvZGl2PlxuICAgICAgICAgIFxuICAgICAgICAgIDxxLWlucHV0XG4gICAgICAgICAgICB2LW1vZGVsPVwic2V0dGluZ3MucmVkZGl0LnVzZXJuYW1lXCJcbiAgICAgICAgICAgIGxhYmVsPVwiUmVkZGl0IFVzZXJuYW1lXCJcbiAgICAgICAgICAgIGNsYXNzPVwicS1tYi1tZFwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICBcbiAgICAgICAgICA8cS1pbnB1dFxuICAgICAgICAgICAgdi1tb2RlbD1cInNldHRpbmdzLnJlZGRpdC5kZWZhdWx0U3VicmVkZGl0c1wiXG4gICAgICAgICAgICBsYWJlbD1cIkRlZmF1bHQgU3VicmVkZGl0cyAoY29tbWEgc2VwYXJhdGVkKVwiXG4gICAgICAgICAgICB0eXBlPVwidGV4dGFyZWFcIlxuICAgICAgICAgICAgY2xhc3M9XCJxLW1iLW1kXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIFxuICAgICAgICAgIDxxLXRvZ2dsZVxuICAgICAgICAgICAgdi1tb2RlbD1cInNldHRpbmdzLnJlZGRpdC5lbmFibGVBbmFseXRpY3NcIlxuICAgICAgICAgICAgbGFiZWw9XCJFbmFibGUgcG9zdCBhbmFseXRpY3NcIlxuICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L3EtdGFiLXBhbmVsPlxuXG4gICAgICAgIDxxLXRhYi1wYW5lbCBuYW1lPVwidGVtcGxhdGVzXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtaDYgcS1tYi1tZFwiPlBvc3QgVGVtcGxhdGVzPC9kaXY+XG4gICAgICAgICAgXG4gICAgICAgICAgPHEtbGlzdCBib3JkZXJlZCBzZXBhcmF0b3I+XG4gICAgICAgICAgICA8cS1pdGVtXG4gICAgICAgICAgICAgIHYtZm9yPVwidGVtcGxhdGUgaW4gdGVtcGxhdGVzXCJcbiAgICAgICAgICAgICAgOmtleT1cInRlbXBsYXRlLmlkXCJcbiAgICAgICAgICAgICAgY2xpY2thYmxlXG4gICAgICAgICAgICAgIHYtcmlwcGxlXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxxLWl0ZW0tc2VjdGlvbj5cbiAgICAgICAgICAgICAgICA8cS1pdGVtLWxhYmVsPnt7IHRlbXBsYXRlLm5hbWUgfX08L3EtaXRlbS1sYWJlbD5cbiAgICAgICAgICAgICAgICA8cS1pdGVtLWxhYmVsIGNhcHRpb24+e3sgdGVtcGxhdGUuZGVzY3JpcHRpb24gfX08L3EtaXRlbS1sYWJlbD5cbiAgICAgICAgICAgICAgPC9xLWl0ZW0tc2VjdGlvbj5cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIDxxLWl0ZW0tc2VjdGlvbiBzaWRlPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWdyZXktOCBxLWd1dHRlci14c1wiPlxuICAgICAgICAgICAgICAgICAgPHEtYnRuIHNpemU9XCIxMnB4XCIgZmxhdCBkZW5zZSByb3VuZCBpY29uPVwiZWRpdFwiIC8+XG4gICAgICAgICAgICAgICAgICA8cS1idG4gc2l6ZT1cIjEycHhcIiBmbGF0IGRlbnNlIHJvdW5kIGljb249XCJkZWxldGVcIiAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L3EtaXRlbS1zZWN0aW9uPlxuICAgICAgICAgICAgPC9xLWl0ZW0+XG4gICAgICAgICAgPC9xLWxpc3Q+XG4gICAgICAgICAgXG4gICAgICAgICAgPHEtYnRuXG4gICAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgICAgaWNvbj1cImFkZFwiXG4gICAgICAgICAgICBsYWJlbD1cIkFkZCBUZW1wbGF0ZVwiXG4gICAgICAgICAgICBjbGFzcz1cInEtbXQtbWRcIlxuICAgICAgICAgICAgQGNsaWNrPVwiYWRkVGVtcGxhdGVcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvcS10YWItcGFuZWw+XG5cbiAgICAgICAgPHEtdGFiLXBhbmVsIG5hbWU9XCJhZHZhbmNlZFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWg2IHEtbWItbWRcIj5BZHZhbmNlZCBTZXR0aW5nczwvZGl2PlxuICAgICAgICAgIFxuICAgICAgICAgIDxxLWlucHV0XG4gICAgICAgICAgICB2LW1vZGVsPVwic2V0dGluZ3MuYWR2YW5jZWQuYXBpRW5kcG9pbnRcIlxuICAgICAgICAgICAgbGFiZWw9XCJBUEkgRW5kcG9pbnRcIlxuICAgICAgICAgICAgY2xhc3M9XCJxLW1iLW1kXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIFxuICAgICAgICAgIDxxLWlucHV0XG4gICAgICAgICAgICB2LW1vZGVsPVwic2V0dGluZ3MuYWR2YW5jZWQudGltZW91dFwiXG4gICAgICAgICAgICBsYWJlbD1cIlJlcXVlc3QgVGltZW91dCAobXMpXCJcbiAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgY2xhc3M9XCJxLW1iLW1kXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIFxuICAgICAgICAgIDxxLXRvZ2dsZVxuICAgICAgICAgICAgdi1tb2RlbD1cInNldHRpbmdzLmFkdmFuY2VkLmRlYnVnTW9kZVwiXG4gICAgICAgICAgICBsYWJlbD1cIkRlYnVnIG1vZGVcIlxuICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L3EtdGFiLXBhbmVsPlxuICAgICAgPC9xLXRhYi1wYW5lbHM+XG4gICAgPC9xLWNhcmQ+XG5cbiAgICA8ZGl2IGNsYXNzPVwicS1tdC1tZCB0ZXh0LXJpZ2h0XCI+XG4gICAgICA8cS1idG5cbiAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgbGFiZWw9XCJTYXZlIFNldHRpbmdzXCJcbiAgICAgICAgQGNsaWNrPVwic2F2ZVNldHRpbmdzXCJcbiAgICAgIC8+XG4gICAgPC9kaXY+XG4gIDwvcS1wYWdlPlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbmltcG9ydCB7IGRlZmluZUNvbXBvbmVudCwgcmVmIH0gZnJvbSAndnVlJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb21wb25lbnQoe1xuICBuYW1lOiAnT3B0aW9uc1BhZ2UnLFxuICBzZXR1cCgpIHtcbiAgICBjb25zdCB0YWIgPSByZWYoJ2dlbmVyYWwnKVxuICAgIFxuICAgIGNvbnN0IHNldHRpbmdzID0gcmVmKHtcbiAgICAgIGVuYWJsZU5vdGlmaWNhdGlvbnM6IHRydWUsXG4gICAgICBhdXRvU2F2ZTogdHJ1ZSxcbiAgICAgIHRoZW1lOiAnYXV0bycsXG4gICAgICByZWRkaXQ6IHtcbiAgICAgICAgdXNlcm5hbWU6ICcnLFxuICAgICAgICBkZWZhdWx0U3VicmVkZGl0czogJycsXG4gICAgICAgIGVuYWJsZUFuYWx5dGljczogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGFkdmFuY2VkOiB7XG4gICAgICAgIGFwaUVuZHBvaW50OiAnaHR0cHM6Ly9hcGkucmVkZGl0LmNvbScsXG4gICAgICAgIHRpbWVvdXQ6IDMwMDAwLFxuICAgICAgICBkZWJ1Z01vZGU6IGZhbHNlXG4gICAgICB9XG4gICAgfSlcblxuICAgIGNvbnN0IHRoZW1lT3B0aW9ucyA9IFsnYXV0bycsICdsaWdodCcsICdkYXJrJ11cblxuICAgIGNvbnN0IHRlbXBsYXRlcyA9IHJlZihbXG4gICAgICB7XG4gICAgICAgIGlkOiAxLFxuICAgICAgICBuYW1lOiAnUHJvZHVjdCBMYXVuY2gnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RlbXBsYXRlIGZvciBwcm9kdWN0IGFubm91bmNlbWVudHMnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogMixcbiAgICAgICAgbmFtZTogJ0NvbW11bml0eSBVcGRhdGUnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JlZ3VsYXIgY29tbXVuaXR5IHVwZGF0ZXMnXG4gICAgICB9XG4gICAgXSlcblxuICAgIGNvbnN0IGFkZFRlbXBsYXRlID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ0FkZGluZyBuZXcgdGVtcGxhdGUuLi4nKVxuICAgICAgLy8gVE9ETzogSW1wbGVtZW50IHRlbXBsYXRlIGNyZWF0aW9uXG4gICAgfVxuXG4gICAgY29uc3Qgc2F2ZVNldHRpbmdzID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ1NhdmluZyBzZXR0aW5nczonLCBzZXR0aW5ncy52YWx1ZSlcbiAgICAgIC8vIFRPRE86IEltcGxlbWVudCBzZXR0aW5ncyBzYXZlXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRhYixcbiAgICAgIHNldHRpbmdzLFxuICAgICAgdGhlbWVPcHRpb25zLFxuICAgICAgdGVtcGxhdGVzLFxuICAgICAgYWRkVGVtcGxhdGUsXG4gICAgICBzYXZlU2V0dGluZ3NcbiAgICB9XG4gIH1cbn0pXG48L3NjcmlwdD4iXSwibmFtZXMiOlsiX2NyZWF0ZUJsb2NrIiwiUVBhZ2UiLCJfY3JlYXRlRWxlbWVudFZOb2RlIiwiX2NyZWF0ZVZOb2RlIiwiUUNhcmQiLCJRVGFicyIsIlFUYWIiLCJRU2VwYXJhdG9yIiwiUVRhYlBhbmVscyIsIlFUYWJQYW5lbCIsIlFUb2dnbGUiLCJRU2VsZWN0IiwiUUlucHV0IiwiUUxpc3QiLCJfY3JlYXRlRWxlbWVudEJsb2NrIiwiX0ZyYWdtZW50IiwiX3JlbmRlckxpc3QiLCJRSXRlbSIsIlFJdGVtU2VjdGlvbiIsIlFJdGVtTGFiZWwiLCJfY3JlYXRlVGV4dFZOb2RlIiwiX3RvRGlzcGxheVN0cmluZyIsIlFCdG4iXSwibWFwcGluZ3MiOiI7QUE0SUEsTUFBSyxZQUFhLGdCQUFhO0FBQUEsRUFDN0IsTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUNOLFVBQU0sTUFBTSxJQUFJLFNBQVM7QUFFekIsVUFBTSxXQUFXLElBQUk7QUFBQSxNQUNuQixxQkFBcUI7QUFBQSxNQUNyQixVQUFVO0FBQUEsTUFDVixPQUFPO0FBQUEsTUFDUCxRQUFRO0FBQUEsUUFDTixVQUFVO0FBQUEsUUFDVixtQkFBbUI7QUFBQSxRQUNuQixpQkFBaUI7QUFBQSxNQUNsQjtBQUFBLE1BQ0QsVUFBVTtBQUFBLFFBQ1IsYUFBYTtBQUFBLFFBQ2IsU0FBUztBQUFBLFFBQ1QsV0FBVztBQUFBLE1BQ2I7QUFBQSxLQUNEO0FBRUQsVUFBTSxlQUFlLENBQUMsUUFBUSxTQUFTLE1BQU07QUFFN0MsVUFBTSxZQUFZLElBQUk7QUFBQSxNQUNwQjtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osTUFBTTtBQUFBLFFBQ04sYUFBYTtBQUFBLE1BQ2Q7QUFBQSxNQUNEO0FBQUEsUUFDRSxJQUFJO0FBQUEsUUFDSixNQUFNO0FBQUEsUUFDTixhQUFhO0FBQUEsTUFDZjtBQUFBLEtBQ0Q7QUFFRCxVQUFNLGNBQWMsTUFBTTtBQUN4QixjQUFRLElBQUksd0JB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
