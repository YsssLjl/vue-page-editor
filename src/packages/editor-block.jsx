import { computed, defineComponent, inject, onMounted, ref } from "vue";
import { DeleteFilled, CopyDocument } from "@element-plus/icons-vue";
export default defineComponent({
  props: {
    block: { type: Object },
  },
  components: { DeleteFilled, CopyDocument },
  setup(props, ctx) {
    const blockStyles = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: `${props.block.zIndex}`,
      position: "absolute",
    }));
    const config = inject("config");
    // console.log(config)

    const blockRef = ref(null);
    onMounted(() => {
      // console.log(blockRef.value)
      let { offsetWidth, offsetHeight } = blockRef.value;
      if (props.block.alignCenter) {
        // 说明是拖拽是才渲染的，其他的情况不用
        props.block.left = props.block.left - offsetWidth / 2;
        props.block.top = props.block.top - offsetHeight / 2; // 原则上重新派发事件
        props.block.alignCenter = false; // 让渲染后的结果，才能去居中。
      }
      props.block.width = offsetWidth;
      props.block.height = offsetHeight;
    });
    return () => {
      const component = config.componentMap[props.block.key];
      const RenderComponent = component.render();
      return (
        <div class="editor-block" style={blockStyles.value} ref={blockRef}>
          <div class="operation-icon">
            <el-icon
              onClick={() => {
                ctx.emit("delete");
              }}
              v-show={props.block?.focus}
              size={16}
            >
              <delete-filled />
            </el-icon>
            <el-icon
              onClick={() => {
                ctx.emit("copy");
              }}
              v-show={props.block?.focus}
              size={16}
            >
              <copy-document />
            </el-icon>
          </div>
          {RenderComponent}
        </div>
      );
    };
  },
});
