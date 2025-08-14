import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import SerialCommunication from './components/SerialCommunication.vue'
import DataDisplay from './components/DataDisplay.vue'
import ParameterConfig from './components/ParameterConfig.vue'

// 路由配置
const routes = [
  { path: '/', redirect: '/serial' },
  { path: '/serial', component: SerialCommunication, name: 'SerialCommunication' },
  { path: '/data', component: DataDisplay, name: 'DataDisplay' },
  { path: '/config', component: ParameterConfig, name: 'ParameterConfig' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(router)
app.mount('#app')