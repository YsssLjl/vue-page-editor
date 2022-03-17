import deepcopy from "deepcopy";
import { onUnmounted } from "vue";
import { events } from "./events";

export function useCommand(data) {
    const state = { // 前进后退需要指针
        current: -1, // 前进后退的索引值
        queue: [], // 存放所有的命令
        commands: {}, // 制作命令和执行功能的映射表。 undo =>    redo =>
        commandArray:[],
        destroyArray:[]
    }

    const registry = (command) => {
        
        state.commandArray.push(command);
        state.commands[command.name] = () => { // 命令名字对应执行函数
            const { redo, undo } = command.execute();
            redo();
            if(!command.pushQueue) {
                return ; // 不需要放到队列
            }
            let { queue, current } = state;

            if(queue.length > 0) {
                queue = queue.slice(0, current + 1); // 可能在放置的过程中，有撤销操作，所以根据当前最新的 current 值，来计算新的队列
                state.queue = queue;
            }

            queue.push({redo, undo}); // 保存指令的前进和后退
            state.current = current + 1;
        }
    }

    registry({
        name: "redo",
        keyboard: 'ctrl+y',
        execute() {
            return {
                redo() {
                    let item = state.queue[state.current +1];
                    if(item) {
                        item.redo && item.redo();
                        state.current++;
                    }
                }
            }
        }
    });

    registry({
        name: 'undo',
        keyboard: 'ctrl+z',
        execute() {
            return {
                redo() {
                    console.log("uuundo")
                    if(state.current === -1) return;
                    let item = state.queue[state.current];
                    if(item) {
                        item.undo && item.undo();
                        state.current--;
                    }
                }
            }
        }
    })
    registry({ // 弄一个选项，如果希望将操作放到队列中，可以增加一个属性，标识等会儿操作要放到队列中
        name: 'drag',
        pushQueue: true,
        init() {
            this.before = null;
            // 初始化操作。默认执行
            // 监控拖拽开始事件，保存状态
            const start = () => {
                this.before = deepcopy(data.value.blocks)
            };
            // 拖拽之后，触发对应的值
            const end = () => {
                state.commands.drag()
            };
            events.on('start', start);
            events.on('end', end);

            return () => {
                events.off('start', start);
                events.off('end', end);
            }
        },
        execute() {
            let before = this.before;
            let after = data.value.blocks // 之后的状态
            return {
                redo() {
                    // 默认一松手，就把之前的事情做了
                    data.value = {...data.value, blocks: after}
                },
                undo() {
                    data.value = {...data.value, blocks: before}
                }
            }
        }

    });

    const keyboardEvent = (() => {
        const keyCodes = {
            90:'z',
            89:'y'
        }
        const onKeydown = (e) => {
            const { ctrlKey, metaKey, keyCode } = e; // ctrl+z ctrl+y
            let keyString = [];
            if(ctrlKey) keyString.push('ctrl');
            keyString.push(keyCodes[keyCode]);
            keyString = keyString.join('+');

            state.commandArray.forEach(({keyboard, name}) => {
                if(!keyboard) return;
                if(keyboard === keyString) {
                    state.commands[name]();
                    e.preventDefault();
                }
            })
        }
        const init = () => { // 初始化事件
            window.addEventListener('keydown', onKeydown)
            return () => { // 销毁事件
                window.removeEventListener('keydown', onKeydown)
            }
        }
        return init;
    })();
    ;(() => {

        // 绑定键盘事件
        state.destroyArray.push(keyboardEvent())

        state.commandArray.forEach(command => command.init && state.destroyArray.push(command.init()))
    })();

    onUnmounted(() => { // 清理绑定的事件。
        state.destroyArray.forEach(fn => fn && fn());
    })
    return state;
}