import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router) // install方法注入 router-view router-link 全局组件

app.mount('#app')
