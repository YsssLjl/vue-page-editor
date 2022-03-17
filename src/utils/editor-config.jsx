// 列表区，可以显示所有的物料
// key 对应的组件映射关系

import { ElButton, ElInput } from 'element-plus';

function createEditorConfig() {
    const componentList = [];
    const componentMap = {};

    return {
        register: (component) => {
            componentList.push(component);
            componentMap[component.key] = component;
        },
        componentList,
        componentMap
    }
}

export const registerConfig = createEditorConfig();

registerConfig.register({
    label: '文本',
    preview: () => '预览文本',
    render: () => '渲染文本',
    key: "text"
})

registerConfig.register({
    label: '按钮',
    preview: () => <ElButton>预览按钮</ElButton>,
    render: () => <ElButton>渲染按钮</ElButton>,
    key: "button"
})

registerConfig.register({
    label: '输入框',
    preview: () => <ElInput placeholder="预览输入框">预览按钮</ElInput>,
    render: () => <ElInput placeholder="渲染输入框">渲染按钮</ElInput>,
    key: "input"
})