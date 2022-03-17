import { computed, ref } from "vue";
export function useFocus (data, callback) {

    const selectIndex = ref(-1); // 表示没有任何一个被选中

    // 做辅助线的时候，就用你啦。
    const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value])


    // 获取哪些元素被选中了。
    const focusData = computed(() => {
        let focus = []; 
        let unfocused = [];
        data.value.blocks.forEach(block => (block.focus ? focus : unfocused).push(block));
        return { focus, unfocused }
    })

    const blockMousedown = (e, block, idx) => {
        // block 上我们规划一个属性，focus 获取焦点后，就将 focus 变成 true
        e.preventDefault();
        e.stopPropagation();
        // 一个可以优化的点，根据实际业务的操作，进行一定程度上的修改吧。
        if(e.shiftKey) {
            if(focusData.value.focus.length <= 1) {
                block.focus = true;
                // 当前只有一个节点被选中时，按住也不会切换状态
            }else {
                block.focus = !block.focus;
            }
        } else {
            if(!block.focus) {
                clearBlcokFocus()
                block.focus = true; // 要清空其他人的focus属性
            } 
            // 当自己已经被选中了，应该还是选中状态
        }
        //  
        selectIndex.value = idx;
        callback(e);
    }
    const clearBlcokFocus = () => {
        data.value.blocks.forEach(block => block.focus = false);
    }

    const containerMouseDown = () => {
        clearBlcokFocus();
        selectIndex.value = -1;
    }
    return {
        blockMousedown,
        containerMouseDown,
        focusData,
        lastSelectBlock
    }
}