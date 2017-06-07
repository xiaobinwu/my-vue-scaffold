import Vue from 'vue'
import VueRouter from 'vue-router'


Vue.use(VueRouter)

// System.import()来做懒加载，没有使用用require
const Index = resolve => System.import('~/page/foo/index.vue')
const Detail = resolve => System.import('~/page/foo/detail.vue')


const routes = [
    { path: '/', component: Index, name: 'index' },
    { path: '/detail', component: Detail, name: 'detail' }
]

export default new VueRouter({
    routes
})