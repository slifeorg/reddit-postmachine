import { d as defineComponent, _ as _export_sfc, o as openBlock, c as createBlock, w as withCtx, Q as QItemSection_default, a as createVNode, e as QIcon_default, f as createCommentVNode, g as QItemLabel_default, h as createTextVNode, t as toDisplayString, i as QItem_default, r as ref, j as resolveComponent, k as QLayout_default, l as QHeader_default, m as QList_default, n as createElementBlock, p as renderList, F as Fragment, q as QDrawer_default, s as QPageContainer_default, u as mergeProps } from "./index.3b1eadad.js";
const _sfc_main$1 = defineComponent({
  name: "EssentialLink",
  props: {
    title: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ""
    },
    link: {
      type: String,
      default: "#"
    },
    icon: {
      type: String,
      default: ""
    }
  }
});
function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createBlock(QItem_default, {
    clickable: "",
    tag: "a",
    target: "_blank",
    href: _ctx.link
  }, {
    default: withCtx(() => [
      _ctx.icon ? (openBlock(), createBlock(QItemSection_default, {
        key: 0,
        avatar: ""
      }, {
        default: withCtx(() => [
          createVNode(QIcon_default, { name: _ctx.icon }, null, 8, ["name"])
        ]),
        _: 1
      })) : createCommentVNode("v-if", true),
      createVNode(QItemSection_default, null, {
        default: withCtx(() => [
          createVNode(QItemLabel_default, null, {
            default: withCtx(() => [
              createTextVNode(toDisplayString(_ctx.title), 1)
            ]),
            _: 1
          }),
          createVNode(QItemLabel_default, { caption: "" }, {
            default: withCtx(() => [
              createTextVNode(toDisplayString(_ctx.caption), 1)
            ]),
            _: 1
          })
        ]),
        _: 1
      })
    ]),
    _: 1
  }, 8, ["href"]);
}
var EssentialLink = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1], ["__file", "/workspace/development/frappe-bench/apps/reddit_postmachine/lumi/src/components/EssentialLink.vue"]]);
const linksList = [
  {
    title: "Home",
    caption: "Main dashboard",
    icon: "home",
    link: "/"
  }
];
const _sfc_main = defineComponent({
  name: "MainLayout",
  components: {
    EssentialLink
  },
  setup() {
    const leftDrawerOpen = ref(false);
    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      }
    };
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_EssentialLink = resolveComponent("EssentialLink");
  const _component_router_view = resolveComponent("router-view");
  return openBlock(), createBlock(QLayout_default, { view: "lHh Lpr lFf" }, {
    default: withCtx(() => [
      createVNode(QHeader_default, { elevated: "" }, {
        default: withCtx(() => [
          createCommentVNode("      <q-toolbar>"),
          createCommentVNode("        <q-toolbar-title>"),
          createCommentVNode("        </q-toolbar-title>"),
          createCommentVNode("      </q-toolbar>")
        ]),
        _: 1
      }),
      createVNode(QDrawer_default, {
        modelValue: _ctx.leftDrawerOpen,
        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.leftDrawerOpen = $event),
        "show-if-above": "",
        bordered: ""
      }, {
        default: withCtx(() => [
          createVNode(QList_default, null, {
            default: withCtx(() => [
              createVNode(QItemLabel_default, { header: "" }, {
                default: withCtx(() => [..._cache[1] || (_cache[1] = [
                  createTextVNode(" Essential Links ", -1)
                ])]),
                _: 1
              }),
              (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.essentialLinks, (link) => {
                return openBlock(), createBlock(_component_EssentialLink, mergeProps({
                  key: link.title
                }, { ref_for: true }, link), null, 16);
              }), 128))
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["modelValue"]),
      createVNode(QPageContainer_default, null, {
        default: withCtx(() => [
          createVNode(_component_router_view)
        ]),
        _: 1
      })
    ]),
    _: 1
  });
}
var MainLayout = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "/workspace/development/frappe-bench/apps/reddit_postmachine/lumi/src/layouts/MainLayout.vue"]]);
export { MainLayout as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbkxheW91dC5jNzM3Yzg1Zi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvRXNzZW50aWFsTGluay52dWUiLCIuLi8uLi8uLi8uLi9zcmMvbGF5b3V0cy9NYWluTGF5b3V0LnZ1ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8dGVtcGxhdGU+XG4gIDxxLWl0ZW1cbiAgICBjbGlja2FibGVcbiAgICB0YWc9XCJhXCJcbiAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgIDpocmVmPVwibGlua1wiXG4gID5cbiAgICA8cS1pdGVtLXNlY3Rpb25cbiAgICAgIHYtaWY9XCJpY29uXCJcbiAgICAgIGF2YXRhclxuICAgID5cbiAgICAgIDxxLWljb24gOm5hbWU9XCJpY29uXCIgLz5cbiAgICA8L3EtaXRlbS1zZWN0aW9uPlxuXG4gICAgPHEtaXRlbS1zZWN0aW9uPlxuICAgICAgPHEtaXRlbS1sYWJlbD57eyB0aXRsZSB9fTwvcS1pdGVtLWxhYmVsPlxuICAgICAgPHEtaXRlbS1sYWJlbCBjYXB0aW9uPlxuICAgICAgICB7eyBjYXB0aW9uIH19XG4gICAgICA8L3EtaXRlbS1sYWJlbD5cbiAgICA8L3EtaXRlbS1zZWN0aW9uPlxuICA8L3EtaXRlbT5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG5pbXBvcnQgeyBkZWZpbmVDb21wb25lbnQgfSBmcm9tICd2dWUnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbXBvbmVudCh7XG4gIG5hbWU6ICdFc3NlbnRpYWxMaW5rJyxcbiAgcHJvcHM6IHtcbiAgICB0aXRsZToge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgcmVxdWlyZWQ6IHRydWVcbiAgICB9LFxuXG4gICAgY2FwdGlvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJydcbiAgICB9LFxuXG4gICAgbGluazoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyMnXG4gICAgfSxcblxuICAgIGljb246IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgfVxuICB9XG59KVxuPC9zY3JpcHQ+IiwiPHRlbXBsYXRlPlxuICA8cS1sYXlvdXQgdmlldz1cImxIaCBMcHIgbEZmXCI+XG4gICAgPHEtaGVhZGVyIGVsZXZhdGVkPlxuPCEtLSAgICAgIDxxLXRvb2xiYXI+LS0+XG48IS0tICAgICAgICA8cS10b29sYmFyLXRpdGxlPi0tPlxuPCEtLSAgICAgICAgPC9xLXRvb2xiYXItdGl0bGU+LS0+XG48IS0tICAgICAgPC9xLXRvb2xiYXI+LS0+XG4gICAgPC9xLWhlYWRlcj5cblxuICAgIDxxLWRyYXdlclxuICAgICAgdi1tb2RlbD1cImxlZnREcmF3ZXJPcGVuXCJcbiAgICAgIHNob3ctaWYtYWJvdmVcbiAgICAgIGJvcmRlcmVkXG4gICAgPlxuICAgICAgPHEtbGlzdD5cbiAgICAgICAgPHEtaXRlbS1sYWJlbFxuICAgICAgICAgIGhlYWRlclxuICAgICAgICA+XG4gICAgICAgICAgRXNzZW50aWFsIExpbmtzXG4gICAgICAgIDwvcS1pdGVtLWxhYmVsPlxuXG4gICAgICAgIDxFc3NlbnRpYWxMaW5rXG4gICAgICAgICAgdi1mb3I9XCJsaW5rIGluIGVzc2VudGlhbExpbmtzXCJcbiAgICAgICAgICA6a2V5PVwibGluay50aXRsZVwiXG4gICAgICAgICAgdi1iaW5kPVwibGlua1wiXG4gICAgICAgIC8+XG4gICAgICA8L3EtbGlzdD5cbiAgICA8L3EtZHJhd2VyPlxuXG4gICAgPHEtcGFnZS1jb250YWluZXI+XG4gICAgICA8cm91dGVyLXZpZXcgLz5cbiAgICA8L3EtcGFnZS1jb250YWluZXI+XG4gIDwvcS1sYXlvdXQ+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuaW1wb3J0IHsgZGVmaW5lQ29tcG9uZW50LCByZWYgfSBmcm9tICd2dWUnXG5pbXBvcnQgRXNzZW50aWFsTGluayBmcm9tICdjb21wb25lbnRzL0Vzc2VudGlhbExpbmsudnVlJ1xuXG5jb25zdCBsaW5rc0xpc3QgPSBbXG4gIHtcbiAgICB0aXRsZTogJ0hvbWUnLFxuICAgIGNhcHRpb246ICdNYWluIGRhc2hib2FyZCcsXG4gICAgaWNvbjogJ2hvbWUnLFxuICAgIGxpbms6ICcvJ1xuICB9XG5dXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbXBvbmVudCh7XG4gIG5hbWU6ICdNYWluTGF5b3V0JyxcblxuICBjb21wb25lbnRzOiB7XG4gICAgRXNzZW50aWFsTGlua1xuICB9LFxuXG4gIHNldHVwICgpIHtcbiAgICBjb25zdCBsZWZ0RHJhd2VyT3BlbiA9IHJlZihmYWxzZSlcblxuICAgIHJldHVybiB7XG4gICAgICBlc3NlbnRpYWxMaW5rczogbGlua3NMaXN0LFxuICAgICAgbGVmdERyYXdlck9wZW4sXG4gICAgICB0b2dnbGVMZWZ0RHJhd2VyICgpIHtcbiAgICAgICAgbGVmdERyYXdlck9wZW4udmFsdWUgPSAhbGVmdERyYXdlck9wZW4udmFsdWVcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG48L3NjcmlwdD5cbiJdLCJuYW1lcyI6WyJfc2ZjX21haW4iLCJfY3JlYXRlQmxvY2siLCJRSXRlbSIsIlFJdGVtU2VjdGlvbiIsIl9jcmVhdGVWTm9kZSIsIlFJY29uIiwiUUl0ZW1MYWJlbCIsIlFMYXlvdXQiLCJRSGVhZGVyIiwiX2NyZWF0ZUNvbW1lbnRWTm9kZSIsIlFEcmF3ZXIiLCJRTGlzdCIsIl9jcmVhdGVFbGVtZW50QmxvY2siLCJfRnJhZ21lbnQiLCJfcmVuZGVyTGlzdCIsIl9vcGVuQmxvY2siLCJfbWVyZ2VQcm9wcyIsIlFQYWdlQ29udGFpbmVyIl0sIm1hcHBpbmdzIjoiO0FBMEJBLE1BQUtBLGNBQWEsZ0JBQWE7QUFBQSxFQUM3QixNQUFNO0FBQUEsRUFDTixPQUFPO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDTCxNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsSUFDWDtBQUFBLElBRUQsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLElBQ1Y7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
