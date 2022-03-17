import { events } from "./events";

export function useMenuDragger(containerRef, data) {
  let currentComponent = null;

  const dragenter = (e) => {
    e.dataTransfer.dropEffect = "move"; // h5 拖动的图标
  };

  const dragover = (e) => {
    e.preventDefault();
  };

  const dragleave = (e) => {
    e.dataTransfer.dropEffect = "none";
  };

  const drop = (e) => {
    let blocks = data.value.blocks;
    data.value = {
      ...data.value,
      blocks: [
        ...blocks,
        {
          top: e.offsetY,
          left: e.offsetX,
          zIndex: 1,
          key: currentComponent.key,
          alignCenter: true,
        },
      ],
    };
    currentComponent = null;
  };

  const dragStart = (e, component) => {
    // dragEnter
    // dragOver 在目标元素中，必须要阻止默认行为，不然不能触发 drop
    // dragLeave 离开元素时，需要增加一个禁用标识
    // drop 松手的时候，
    containerRef.value.addEventListener("dragenter", dragenter);
    containerRef.value.addEventListener("dragover", dragover);
    containerRef.value.addEventListener("dragleave", dragleave);
    containerRef.value.addEventListener("drop", drop);
    currentComponent = component;
    events.emit("start"); // 发布 start
  };

  const dragEnd = (e) => {
    containerRef.value.removeEventListener("dragenter", dragenter);
    containerRef.value.removeEventListener("dragover", dragover);
    containerRef.value.removeEventListener("dragleave", dragleave);
    containerRef.value.removeEventListener("drop", drop);
    events.emit("end");
  };

  return {
    dragStart,
    dragEnd,
  };
}
