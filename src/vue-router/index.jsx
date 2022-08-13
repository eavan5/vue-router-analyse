import { shallowRef, computed, inject, provide, Comment, h } from 'vue'

export * from './history'

function normalizeRecord(record) {
	return {
		path: record.path,
		components: {
			default: record.component,
			...(record.components || {}),
		},
		children: record.children || [],
		beforeEnter: record.beforeEnter,
		meta: record.meta || {},
		// ...props ,name
	}
}

function createRecord(record, parent) {
	const obj = {
		path: (parent?.path || '') + record.path,
		record,
		parent,
		children: [],
		components: record.components,
	}
	if (parent) {
		//反过来记住儿子
		parent.children.push(obj)
	}
	return obj
}

function createRouterMatcher(routes) {
	// 扁平化，直接能拿到对应路由，不用递归匹配
	const matchers = []
	function addRoute(record, parent) {
		// 需要将用户写的record转换成统一的record再存入 matchers
		let normalRecord = normalizeRecord(record)
		normalRecord.parent = parent
		let newRecord = createRecord(normalRecord, parent)
		for (let i = 0; i < normalRecord.children.length; i++) {
			// 扁平化处理
			const child = normalRecord.children[i]
			addRoute(child, newRecord)
		}
		matchers.push(newRecord)
	}

	function addRoutes(routes) {
		routes.forEach(route => addRoute(route))
	}
	function resolveMatcher(route) {
		let matched = []
		let record = matchers.find(record => record.path === route.path)

		while (record) {
			matched.push(record)
			record = record.parent
		}
		return {
			path: route.path,
			matched,
		}
	}

	addRoutes(routes)
	// console.log(matchers)
	return {
		matchers,
		addRoutes,
		resolveMatcher,
		addRoute, // vue的动态路由添加，就是调用这个方法
	}
}

const START_LOCATION_STATE = {
	// 开始的状态
	path: '/',
	matched: [],
	query: {},
	params: {},
}

export function createRouter(options) {
	let { routes, history } = options

	let ready = false

	// 根据routes，生成对应的匹配器 [{path: '/', component: Home}, {path: '/about', component: About}]
	const { addRoute, addRoutes, resolveMatcher, matchers } = createRouterMatcher(routes)
	// console.log(matchers, history)

	const currentRoute = shallowRef(START_LOCATION_STATE) // 只监听一层 类似vue2的$route
	// console.log(currentRoute)

	if (currentRoute.value === START_LOCATION_STATE) {
		// 用户一加载
		push(history.location) // 根据用户当前的路径做一次匹配操作
	}

	let reactiveRoute = {}
	for (const key in START_LOCATION_STATE) {
		reactiveRoute[key] = computed(() => currentRoute.value[key])
	}

	function useCallbacks() {
		const handlers = []
		return {
			add: cb => handlers.push(cb),
			list: () => handlers,
		}
	}
	const beforeGuards = useCallbacks()
	const beforeResolveGuards = useCallbacks()
	const afterEachGuards = useCallbacks()

	function resolve(to) {
		if (typeof to === 'string') {
			to = { path: to }
		}
		return resolveMatcher(to) // 当前的路径是什么 匹配的结果是什么
	}

	function markReady() {
		if (ready) return
		ready = true
		history.listen(to => {
			// 监听用户的前进后退事件，再次发生跳转逻辑，更新当前的currentRoute
			let targetLocation = resolve(to)
			const from = currentRoute.value
			finalNavigation(targetLocation, from, true)
		})
	}

	function finalNavigation(to, from, replace) {
		if (from === START_LOCATION_STATE || replace) {
			// 第一次是replace模式
			history.replace(to.path)
		} else {
			history.push(to.path) // 后续的是push模式
		}
		currentRoute.value = to
		markReady()
	}

	function navigateBefore(to, from, replaced) {
		return Promise.resolve()
	}

	function push(to) {
		const targetLocation = resolve(to)
		const from = currentRoute.value

		// 更新当前的currentRoute 这个是响应式的
		// 先走钩子函数，再去跳转
		navigateBefore(targetLocation, from)
			.then(() => {
				return finalNavigation(targetLocation, from)
			})
			.then(() => {
				// 跳转完成之后执行afterEach
				for (const guard of afterEachGuards.list()) {
					guard(to, from)
				}
			})
	}

	const router = {
		push,
		replace() {},
		install(app) {
			app.config.globalProperties.$router = router
			Object.defineProperty(app.config.globalProperties, '$route', {
				get: () => currentRoute.value,
			})

			app.provide('router', router) // 兼容hooks写法
			app.provide('route', currentRoute)
			app.component('RouterLink', {
				props: {
					to: {},
				},
				setup(props, { slots }) {
					const router = inject('router')
					const navigate = () => {
						router.push(props.to)
					}
					return () => <a onClick={navigate}>{slots.default()}</a>
				},
			})

			// router-view 会有多层嵌套，所以需要matched来匹配对应的层级
			app.component('RouterView', {
				setup(props, { slots }) {
					const depth = inject('depth', 0) // 层级,默认是0
					provide('depth', depth + 1)
					const currentRoute = inject('route')
					// console.log(currentRoute)
					const computedRecord = computed(() => currentRoute.value.matched[depth]) // 用计算属性包一层，不然会被当成一个死值
					// console.log(currentRoute, depth)
					return () => {
						let record = computedRecord.value
						if (!record) return
						const component = record.components.default
						if (!component) {
							return h(Comment)
						} else {
							return h(component)
						}
					}
				},
			})
			// console.log('router install')
		},
		beforeEach: beforeGuards.add,
		beforeResolve: beforeResolveGuards.add,
		afterEach: afterEachGuards.add,
	}
	return router
}

// 一些钩子顺序
// beforeRouterLeave 组件的
// beforeEach 全局的
// beforeRouterUpdate 组件的

// beforeEnter 全局的
// beforeRouteEnter 组件的

// beforeResolve 全局的
// afterEach 全局的
