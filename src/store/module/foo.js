const state = {
    flag: false
}
const mutations = {
    CHANGE_STATUS(status, flag) {
        status.flag = flag
    }
}

const actions = {
    changeStatus({ commit }, flag) {
        commit('CHANGE_STATUS', flag)
    }
}

const getters = {
    statusStr(state) {
        return '我是getters获取的内容，当前切换标志位为' + state.flag
    }
}

export default {
    state,
    actions,
    mutations,
    getters
}