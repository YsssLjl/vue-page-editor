<template>
  <div class="app">
    <!-- 相当于 :modelValue="state" @update:modelValue -->
    <Editor v-model="state"></Editor>
  </div>
</template>

<script>
import data from "./data.json";
import { ref, provide } from "vue";
import Editor from "./packages/editor.jsx";
import { registerConfig as config } from "./utils/editor-config.jsx";

export default {
  components: {
    Editor,
  },

  setup() {
    const state = ref(data);

    // 直接提供出去
    provide("config", config);

    return {
      state,
    };
  },
};
</script>

<style lang="scss">
.app {
  position: fixed;
  left: 20px;
  top: 20px;
  right: 20px;
  bottom: 20px;
}
</style>
