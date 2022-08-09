import { createWebHistory } from 'vue-router'

export function createWebHashHistory() {
	return createWebHistory('#')
}
