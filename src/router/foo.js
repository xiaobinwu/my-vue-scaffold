import Vue from 'vue'
import VueRouter from 'vue-router'


Vue.use(VueRouter)


const Index = resolve => require(['~/page/foo/index.vue'], resolve)
const Detail = resolve => require(['~/page/foo/detail.vue'], resolve)


const routes = [
    { path: '/', component: Index, name: 'index' },
    { path: '/detail', component: Detail, name: 'detail' }
]

export default new VueRouter({
    routes
})