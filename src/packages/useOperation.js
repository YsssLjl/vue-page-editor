export function useOperation(data) {
  const del = (idx) => {
    data.value.blocks.splice(idx, 1);
  };
  const copy = (block) => {
    data.value.blocks = [
      ...data.value.blocks.map((block) => ({ ...block, focus: false })),
      { ...block, top: block.top + 10, left: block.left + 10 },
    ];
  };
  return {
    del,
    copy,
  };
}
