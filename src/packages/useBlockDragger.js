import { reactive } from "vue";
import { events } from "./events";

export function useBlockDragger(focusData, lastSelectBlock, data) {
  let dragState = {
    startX: 0,
    startY: 0,
    dragging: false, // 默认不是正在拖拽
  };

  let markline = reactive({
    x: null,
    y: null,
  });

  const mousedown = (e) => {
    const { width: Bwidth, height: Bheight } = lastSelectBlock.value;
    // 记录按下的状态
    dragState = {
      startX: e.clientX,
      startY: e.clientY, // 记录每一个选中的位置
      // 记录我拖拽的位置
      startLeft: lastSelectBlock.value.left,
      startTop: lastSelectBlock.value.top,
      startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
      dragging: false,
      lines: (() => {
        const { unfocused } = focusData.value; // 获取其他没有选中的，以他们的位置做辅助线
        let _lines = { x: [], y: [] }; // 计算横线的位置，用y来存放；x存放纵向的值

        // 这里是需要考虑到容器本身
        [
          ...unfocused,
          {
            top: 0,
            left: 0,
            width: data.value.container.width,
            height: data.value.container.height,
          },
        ].forEach((block) => {
          const {
            top: Atop,
            left: Aleft,
            width: Awidth,
            height: Aheight,
          } = block;
          // 档次元素拖拽到和 A元素top 一致时，要显示这根辅助线，辅助线的位置就是 Atop
          _lines.y.push({ showTop: Atop, top: Atop }); // 顶对顶部
          _lines.y.push({ showTop: Atop, top: Atop - Bheight }); // 顶对底部
          _lines.y.push({
            showTop: Atop + Aheight / 2,
            top: Atop + Aheight / 2 - Bheight / 2,
          }); // 中间对中间
          _lines.y.push({ showTop: Atop + Aheight, top: Atop + Aheight }); // 底对顶
          _lines.y.push({
            showTop: Atop + Aheight,
            top: Atop + Aheight - Bheight,
          }); // 底对底

          _lines.x.push({ showLeft: Aleft, left: Aleft }); // 左对左
          _lines.x.push({ showLeft: Aleft + Awidth, left: Aleft + Awidth }); // 右对左
          _lines.x.push({
            showLeft: Aleft + Awidth / 2,
            left: Aleft + Awidth / 2 - Bwidth / 2,
          }); // 中对中
          _lines.x.push({
            showLeft: Aleft + Awidth,
            left: Aleft + Awidth - Bwidth,
          }); // 右对右
          _lines.x.push({ showLeft: Aleft, left: Aleft - Bwidth }); // 左对右
        });
        return _lines;
      })(),
    };
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  };

  const mousemove = (e) => {
    let { clientX, clientY } = e;
    if (!dragState.dragging) {
      dragState.dragging = true;
      events.emit("start"); // 触发拖拽之前的位置
    }
    // 计算当前最新的值，去线里面找，然后再显示
    // 鼠标移动后 - 鼠标移动前 + left 就好了
    let left = clientX - dragState.startX + dragState.startLeft;
    let top = clientY - dragState.startY + dragState.startTop;

    let y = null;
    let x = null;
    // 先计算横线，距离参照物元素还有 5 像素时，就显示这根线
    for (let i = 0; i < dragState.lines.y.length; i++) {
      const { top: _top, showTop: _showTop } = dragState.lines.y[i]; // 取每一根线
      if (Math.abs(_top - top) < 5) {
        // 说明接近了位置，
        y = _showTop; // 线要显示的位置；
        clientY = dragState.startY - dragState.startTop + _top; // 容器距离顶部的距离 + 目标的高度，就是最新的 clientY

        break; // 找到一根线就可以跳出了
      }
    }

    for (let i = 0; i < dragState.lines.x.length; i++) {
      const { left: _left, showLeft: _showLeft } = dragState.lines.x[i]; // 取每一根线
      if (Math.abs(_left - left) < 5) {
        // 说明接近了位置，
        x = _showLeft; // 线要显示的位置；
        clientX = dragState.startX - dragState.startLeft + _left; // 容器距离左边的距离 + 目标的宽度，就是最新的 clientX
        break; // 找到一根线就可以跳出了
      }
    }

    markline.x = x; // markLine 是一个响应式数据 x, y 更新了，会导致视图更新
    markline.y = y;

    let durX = clientX - dragState.startX;
    let durY = clientY - dragState.startY;

    focusData.value.focus.forEach((block, idx) => {
      block.top = dragState.startPos[idx].top + durY;
      block.left = dragState.startPos[idx].left + durX;
    });
  };

  const mouseup = () => {
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseup);
    markline.x = null;
    markline.y = null;
    if (dragState.dragging) {
      dragState.dragging = false;
      events.emit("end");
    }
  };

  return {
    mousedown,
    markline,
  };
}
