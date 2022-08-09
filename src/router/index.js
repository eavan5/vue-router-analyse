import Home from '../views/home.vue'
import About from '../views/About.vue'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

const routes = [
	{
		path: '/',
		component: Home,
	},
	{
		path: '/about',
		component: About,
	},
]

// 路由的分类：
// hash路由: 就是前端的锚点，监听锚点变化，改变路由，hash变化，不会刷新页面 不会向后端发送请求 createWebHashHistory
//  window.location.hash  onhashchange // 老的做法 新的方法都是用history.pushState去实现了

// history路由：当刷新的时候，向服务端请求支援，会把path带上 ，vite是一个静态服务器，如果页面不存在，会返回指定到首页，根据vue-router渲染出制定的页面，nginx有一个try_files 去配置 createWebHistory ， 因为他能真正去发送path，所以只有他能做ssr
//  window.history.pushState(null, null, path)  onpopstate

// vue-router 是通过注入的方式来实现的（底层封装一个公共的history）

// memory路由 // 非前端路由

// history.pushState 这个会被浏览器历史记录栈给记录 replace不会

const router = createRouter({
	routes,
	history: createWebHistory(),
})

export default router
