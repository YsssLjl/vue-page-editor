import { defineComponent, computed, inject, ref } from "vue";
import "./editor.scss";

import EditorBlock from "./editor-block";

import deepcopy from "deepcopy";
import { useMenuDragger } from "./useMenuDragger";
import { useFocus } from "./useFocus";
import { useBlockDragger } from "./useBlockDragger";

import { ElButton, ElInput } from "element-plus";
import { useCommand } from "./useCommand";

export default defineComponent({
  props: {
    modelValue: { type: Object },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue;
      },
      set(newValue) {
        ctx.emit("update:modelValue", deepcopy(newValue));
      },
    });

    // console.log(data.value);

    const containerStyles = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px",
    }));

    const config = inject("config");

    const containerRef = ref(null);

    // 实现菜单的拖拽功能
    const { dragStart, dragEnd } = useMenuDragger(containerRef, data);

    // 2. 实现获取焦点，选中后，可以直接拖拽

    const { focusData, blockMousedown, containerMouseDown, lastSelectBlock } =
      useFocus(data, (e) => {
        // console.log(focusData.value.focus)
        mousedown(e);
      });

    const { mousedown, markline } = useBlockDragger(
      focusData,
      lastSelectBlock,
      data
    );

    const { commands } = useCommand(data);

    const buttons = [
      { label: "撤销", icon: "icon-back", handler: () => commands.undo() },
      { label: "重做", icon: "icon-back", handler: () => commands.redo() },
    ];

    return () => (
      <div class="editor">
        <div class="editor-left">
          {/* 根据注册列表，渲染对应的内容，可以实现 h5 的拖拽 */}
          {config.componentList.map((component) => (
            <div
              class="editor-left-item"
              draggable
              onDragstart={(e) => dragStart(e, component)}
              onDragend={(e) => dragEnd(e)}
            >
              <span>{component.label}</span>
              <div>{component.preview()}</div>
            </div>
          ))}
        </div>
        <div class="editor-top">
          {buttons.map((btn, idx) => (
            <ElButton key="idx" onClick={btn.handler}>
              {btn.label}
            </ElButton>
          ))}
        </div>
        <div class="editor-right">右侧配置区</div>
        <div class="editor-container">
          <div class="editor-container-canvas">
            {/* 产生内容区域 */}
            <div
              class="editor-container-canvas__content"
              onMousedown={containerMouseDown}
              style={containerStyles.value}
              ref={containerRef}
            >
              {data.value.blocks.map((block, idx) => (
                <EditorBlock
                  block={block}
                  class={block.focus ? "editor-block-focus" : ""}
                  onMousedown={(e) => blockMousedown(e, block, idx)}
                >
                  这是一段代码
                </EditorBlock>
              ))}
              {markline.x != null && (
                <div class="line-x" style={{ left: markline.x + "px" }}></div>
              )}
              {markline.y != null && (
                <div class="line-y" style={{ top: markline.y + "px" }}></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
