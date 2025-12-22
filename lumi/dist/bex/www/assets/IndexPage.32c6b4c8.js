import { _ as _export_sfc, d as defineComponent, r as ref, o as openBlock, c as createBlock, w as withCtx, v as QPage_default, x as createBaseVNode, a as createVNode, y as QAvatar_default, z as QBtn_default, A as QCardSection_default, t as toDisplayString, B as QCard_default } from "./index.3b1eadad.js";
var _imports_0 = "assets/quasar-logo-vertical.a1d41e28.svg";
const _sfc_main = defineComponent({
  name: "IndexPage",
  setup() {
    const stats = ref({
      postsCreated: 0,
      successRate: 0
    });
    const startPosting = () => {
      console.log("Starting posting process...");
    };
    return {
      stats,
      startPosting
    };
  }
});
const _hoisted_1 = { class: "text-center q-pa-md" };
const _hoisted_2 = { class: "q-gutter-md" };
const _hoisted_3 = { class: "q-mt-lg" };
const _hoisted_4 = { class: "row q-gutter-md" };
const _hoisted_5 = { class: "col text-center" };
const _hoisted_6 = { class: "text-h3 text-positive" };
const _hoisted_7 = { class: "col text-center" };
const _hoisted_8 = { class: "text-h3 text-info" };
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createBlock(QPage_default, { class: "flex flex-center" }, {
    default: withCtx(() => [
      createBaseVNode("div", _hoisted_1, [
        createVNode(QAvatar_default, {
          size: "200px",
          class: "q-mb-md"
        }, {
          default: withCtx(() => [..._cache[0] || (_cache[0] = [
            createBaseVNode("img", {
              src: _imports_0,
              alt: "Quasar logo"
            }, null, -1)
          ])]),
          _: 1
        }),
        _cache[4] || (_cache[4] = createBaseVNode("div", { class: "text-h2 q-mb-md" }, "Reddit Post Machine", -1)),
        _cache[5] || (_cache[5] = createBaseVNode("div", { class: "text-subtitle1 q-mb-xl" }, " Powered by Quasar Framework ", -1)),
        createBaseVNode("div", _hoisted_2, [
          createVNode(QBtn_default, {
            push: "",
            color: "primary",
            label: "Start Posting",
            icon: "send",
            onClick: _ctx.startPosting
          }, null, 8, ["onClick"]),
          createVNode(QBtn_default, {
            push: "",
            color: "secondary",
            label: "View Settings",
            icon: "settings",
            to: "/options"
          })
        ]),
        createBaseVNode("div", _hoisted_3, [
          createVNode(QCard_default, {
            flat: "",
            bordered: "",
            class: "q-ma-md"
          }, {
            default: withCtx(() => [
              createVNode(QCardSection_default, null, {
                default: withCtx(() => [..._cache[1] || (_cache[1] = [
                  createBaseVNode("div", { class: "text-h6" }, "Quick Stats", -1)
                ])]),
                _: 1
              }),
              createVNode(QCardSection_default, null, {
                default: withCtx(() => [
                  createBaseVNode("div", _hoisted_4, [
                    createBaseVNode("div", _hoisted_5, [
                      createBaseVNode("div", _hoisted_6, toDisplayString(_ctx.stats.postsCreated), 1),
                      _cache[2] || (_cache[2] = createBaseVNode("div", { class: "text-caption" }, "Posts Created", -1))
                    ]),
                    createBaseVNode("div", _hoisted_7, [
                      createBaseVNode("div", _hoisted_8, toDisplayString(_ctx.stats.successRate) + "%", 1),
                      _cache[3] || (_cache[3] = createBaseVNode("div", { class: "text-caption" }, "Success Rate", -1))
                    ])
                  ])
                ]),
                _: 1
              })
            ]),
            _: 1
          })
        ])
      ])
    ]),
    _: 1
  });
}
var IndexPage = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "/workspace/development/frappe-bench/apps/reddit_postmachine/lumi/src/pages/IndexPage.vue"]]);
export { IndexPage as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5kZXhQYWdlLjMyYzZiNGM4LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXNzZXRzL3F1YXNhci1sb2dvLXZlcnRpY2FsLnN2ZyIsIi4uLy4uLy4uLy4uL3NyYy9wYWdlcy9JbmRleFBhZ2UudnVlIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IFwiX19WSVRFX0FTU0VUX19hMWQ0MWUyOF9fXCIiLCI8dGVtcGxhdGU+XG4gIDxxLXBhZ2UgY2xhc3M9XCJmbGV4IGZsZXgtY2VudGVyXCI+XG4gICAgPGRpdiBjbGFzcz1cInRleHQtY2VudGVyIHEtcGEtbWRcIj5cbiAgICAgIDxxLWF2YXRhciBzaXplPVwiMjAwcHhcIiBjbGFzcz1cInEtbWItbWRcIj5cbiAgICAgICAgPGltZyBzcmM9XCJ+YXNzZXRzL3F1YXNhci1sb2dvLXZlcnRpY2FsLnN2Z1wiIGFsdD1cIlF1YXNhciBsb2dvXCI+XG4gICAgICA8L3EtYXZhdGFyPlxuXG4gICAgICA8ZGl2IGNsYXNzPVwidGV4dC1oMiBxLW1iLW1kXCI+UmVkZGl0IFBvc3QgTWFjaGluZTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInRleHQtc3VidGl0bGUxIHEtbWIteGxcIj5cbiAgICAgICAgUG93ZXJlZCBieSBRdWFzYXIgRnJhbWV3b3JrXG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cInEtZ3V0dGVyLW1kXCI+XG4gICAgICAgIDxxLWJ0blxuICAgICAgICAgIHB1c2hcbiAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgIGxhYmVsPVwiU3RhcnQgUG9zdGluZ1wiXG4gICAgICAgICAgaWNvbj1cInNlbmRcIlxuICAgICAgICAgIEBjbGljaz1cInN0YXJ0UG9zdGluZ1wiXG4gICAgICAgIC8+XG4gICAgICAgIFxuICAgICAgICA8cS1idG5cbiAgICAgICAgICBwdXNoXG4gICAgICAgICAgY29sb3I9XCJzZWNvbmRhcnlcIlxuICAgICAgICAgIGxhYmVsPVwiVmlldyBTZXR0aW5nc1wiXG4gICAgICAgICAgaWNvbj1cInNldHRpbmdzXCJcbiAgICAgICAgICB0bz1cIi9vcHRpb25zXCJcbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPVwicS1tdC1sZ1wiPlxuICAgICAgICA8cS1jYXJkIGZsYXQgYm9yZGVyZWQgY2xhc3M9XCJxLW1hLW1kXCI+XG4gICAgICAgICAgPHEtY2FyZC1zZWN0aW9uPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtaDZcIj5RdWljayBTdGF0czwvZGl2PlxuICAgICAgICAgIDwvcS1jYXJkLXNlY3Rpb24+XG4gICAgICAgICAgXG4gICAgICAgICAgPHEtY2FyZC1zZWN0aW9uPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJvdyBxLWd1dHRlci1tZFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sIHRleHQtY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtaDMgdGV4dC1wb3NpdGl2ZVwiPnt7IHN0YXRzLnBvc3RzQ3JlYXRlZCB9fTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWNhcHRpb25cIj5Qb3N0cyBDcmVhdGVkPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sIHRleHQtY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtaDMgdGV4dC1pbmZvXCI+e3sgc3RhdHMuc3VjY2Vzc1JhdGUgfX0lPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtY2FwdGlvblwiPlN1Y2Nlc3MgUmF0ZTwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvcS1jYXJkLXNlY3Rpb24+XG4gICAgICAgIDwvcS1jYXJkPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIDwvcS1wYWdlPlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbmltcG9ydCB7IGRlZmluZUNvbXBvbmVudCwgcmVmIH0gZnJvbSAndnVlJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb21wb25lbnQoe1xuICBuYW1lOiAnSW5kZXhQYWdlJyxcbiAgc2V0dXAoKSB7XG4gICAgY29uc3Qgc3RhdHMgPSByZWYoe1xuICAgICAgcG9zdHNDcmVhdGVkOiAwLFxuICAgICAgc3VjY2Vzc1JhdGU6IDBcbiAgICB9KVxuXG4gICAgY29uc3Qgc3RhcnRQb3N0aW5nID0gKCkgPT4ge1xuICAgICAgLy8gVE9ETzogSW1wbGVtZW50IHBvc3RpbmcgbG9naWNcbiAgICAgIGNvbnNvbGUubG9nKCdTdGFydGluZyBwb3N0aW5nIHByb2Nlc3MuLi4nKVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBzdGF0cyxcbiAgICAgIHN0YXJ0UG9zdGluZ1xuICAgIH1cbiAgfVxufSlcbjwvc2NyaXB0PiJdLCJuYW1lcyI6WyJfY3JlYXRlQmxvY2siLCJRUGFnZSIsIl9jcmVhdGVFbGVtZW50Vk5vZGUiLCJfY3JlYXRlVk5vZGUiLCJRQXZhdGFyIiwiUUJ0biIsIlFDYXJkIiwiUUNhcmRTZWN0aW9uIiwiX3RvRGlzcGxheVN0cmluZyJdLCJtYXBwaW5ncyI6IjtBQUFBLElBQWUsYUFBQTtBQ3lEZixNQUFLLFlBQWEsZ0JBQWE7QUFBQSxFQUM3QixNQUFNO0FBQUEsRUFDTixRQUFRO0FBQ04sVUFBTSxRQUFRLElBQUk7QUFBQSxNQUNoQixjQUFjO0FBQUEsTUFDZCxhQUFhO0FBQUEsS0FDZDtBQUVELFVBQU0sZUFBZSxNQUFNO0FBRXpCLGNBQVEsSUFBSSw2QkFBNkI7QUFBQSxJQUMzQztBQUVBLFdBQU87QUFBQSxNQUNMO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQztBQXpFUSxNQUFBLGFBQUEsRUFBQSxPQUFNLHNCQUFxQjtBQVV6QixNQUFBLGFBQUEsRUFBQSxPQUFNLGNB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
