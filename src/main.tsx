// 必须在导入 antd-mobile 之前完成 React 19 的渲染器注入，
// 所以这一句要放在文件最顶部，且早于任何 antd-mobile 相关的组件导入。
import './setup/antd-mobile-react19'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
