import { createRoot, type Root } from 'react-dom/client';
import { unstableSetRender } from 'antd-mobile';

/**
 * antd-mobile v5 官方只支持 React 16~18，
 * React 19 已经移除了 `react-dom` 的 `render` 和 `unmountComponentAtNode` 遗留 API，
 * 所以直接使用 antd-mobile 的命令式组件（Toast、Modal、Popup 等）
 * 会抛出 `TypeError: unmountComponentAtNode is not a function`。
 *
 * 官方兼容方案：https://mobile.ant.design/guide/v5-for-19
 * 通过 antd-mobile 暴露的 `unstableSetRender`，把 React 19 的 createRoot 注入进去，
 * 让 antd-mobile 内部改用 React 18/19 的并发模式挂载与卸载节点。
 *
 * 这个模块只需要在应用入口 import 一次，导入时的副作用会完成注册。
 */

// 每个 container 只创建一次 Root，卸载时统一 unmount，避免每次挂载都新建 root。
const rootMap = new WeakMap<Element | DocumentFragment, Root>();

unstableSetRender((node, container) => {
  let root = rootMap.get(container);
  if (!root) {
    root = createRoot(container);
    rootMap.set(container, root);
  }
  root.render(node);

  // antd-mobile 需要一个 unmount 函数返回值，用于关闭 Toast/Modal 后回收 DOM。
  return async () => {
    // 微任务里 unmount，避免和 React 19 的并发渲染警告冲突。
    await Promise.resolve();
    root?.unmount();
    rootMap.delete(container);
  };
});
