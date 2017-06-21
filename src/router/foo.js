import Vue from 'vue'
import VueRouter from 'vue-router'


Vue.use(VueRouter)

// System.import()来做懒加载，没有使用用require
const Index = resolve => import(/* webpackChunkName: "foo-index-[index]" */ '~/page/foo/index.vue')
const Detail = resolve => import(/* webpackChunkName: "foo-detail-[index]" */ '~/page/foo/detail.vue')

const routes = [
    { path: '/', component: Index, name: 'index' },
    { path: '/detail', component: Detail, name: 'detail' }
]

export default new VueRouter({
    routes
})