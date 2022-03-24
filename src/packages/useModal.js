import { defineComponent, createApp, ref } from "vue";
export const useModal = (data) => {
  const dialogStatus = ref(false);

  const show = () => {
    dialogStatus.value = true;
  };
  const close = () => {
    dialogStatus.value = false;
  };
  const modal = defineComponent({
    setup() {
      return () => (
        <el-dialog v-model={dialogStatus.value} title="Shipping address">
          {JSON.stringify(data.value)}
        </el-dialog>
      );
    },
  });

  return {
    modal,
    show,
    close,
  };
};
