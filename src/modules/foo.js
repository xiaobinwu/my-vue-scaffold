import Vue from 'vue'
import index from './foo.vue'
import store from '~/store/index'
import router from '~/router/foo'

setTimeout(() => {
    const app = new Vue({
        store,
        router,
        ...index
    })
    app.$mount('#wrap')
}, 0)