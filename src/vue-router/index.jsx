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
	}
	if (parent) {
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
	addRoutes(routes)
	// console.log(matchers)
	return {
		matchers,
		addRoutes,
		addRoute, // vue的动态路由添加，就是调用这个方法
	}
}

export function createRouter(options) {
	let { routes, history } = options

	// 根据routes，生成对应的匹配器 [{path: '/', component: Home}, {path: '/about', component: About}]
	const { addRoute, addRoutes, matchers } = createRouterMatcher(routes)

	const router = {
		install(app) {
			app.component('RouterLink', {
				setup(props, { slots }) {
					return () => {
						slots.default()
					}
				},
			})
			app.component('RouterView', {
				setup(props, { slots }) {
					return () => <div>1</div>
				},
			})
			// console.log('router install')
		},
	}
	return router
}
