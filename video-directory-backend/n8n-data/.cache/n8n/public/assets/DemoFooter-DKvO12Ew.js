import { L as LogsPanel } from "./LogsPanel-dLKjFOi5.js";
import { d as defineComponent, p as useSettingsStore, Q as useWorkflowsStore, q as computed, e as createBlock, f as createCommentVNode, m as unref, g as openBlock } from "./index-BEvy7DZc.js";
import "./useClearExecutionButtonVisible--2zd8JTS.js";
import "./RunData-D3endKo8.js";
import "./FileSaver.min-BuBI9fyd.js";
import "./useExecutionHelpers-DcgY6WXs.js";
import "./dateFormatter-DNA1ez0J.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "DemoFooter",
  setup(__props) {
    const { isNewLogsEnabled } = useSettingsStore();
    const workflowsStore = useWorkflowsStore();
    const hasExecutionData = computed(() => workflowsStore.workflowExecutionData);
    return (_ctx, _cache) => {
      return unref(isNewLogsEnabled) && hasExecutionData.value ? (openBlock(), createBlock(LogsPanel, {
        key: 0,
        "is-read-only": true
      })) : createCommentVNode("", true);
    };
  }
});
export {
  _sfc_main as default
};
