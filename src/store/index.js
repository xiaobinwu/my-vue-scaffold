import Vue from 'vue'
import Vuex from 'vuex'

/* 测试 */
import foo from './module/foo'


Vue.use(Vuex)

// 公用store
const state = {
    count: 1,
    amount: 5
}

const mutations = {
    INCREMENT(state, payload) {
        state.count++
        state.amount = payload.amount
    }
}

const actions = {
    increment({ commit }) {
        setTimeout(() => {
            commit('INCREMENT', { amount: 10 })
        }, 1000)
    }
}

export default new Vuex.Store({
    state,
    actions,
    mutations,
    modules: {
        foo
    }
})