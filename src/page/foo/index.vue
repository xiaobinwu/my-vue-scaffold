<template lang="jade">
    div.foo-container
        div {{content}}
        div.foo-content
            p(v-text="'我是私有store(foo)的state(flag)：' + flag")
            p(v-text="statusStr")
            button(@click="changeStatus(!flag)") 改变flag的值
        h3 链接跳转
        router-link(to="detail") GO TO DETAIL
</template>
<script>
    import Vue from 'vue'
    import { mapState, mapActions, mapGetters } from 'vuex'
    export default{
        name: 'fooIndex',
        data() {
            return {
                content: '我是Foo的首页dasad'
            }
        },
        created() {

        },
        mounted() {
            console.log(this.flag)
        },
        computed: {
            ...mapState({
                flag: state => state.foo.flag
            }),
            ...mapGetters([
                'statusStr'
            ])
        },
        filters: {

        },
        methods: {
            ...mapActions([
                'changeStatus' // 映射 this.changeStatus() 为 this.$store.dispatch('changeStatus')，[action，mutation，getter不受module影响，共享]
            ])
        },
        components: {

        }
    }
</script>
<style lang="sass" scoped>
	@import "../../public/scss/_variables.scss";
    $prefix: 'foo';
    .#{$prefix}-container{
		width: $container-width;
        margin: auto;
        border: 1px #eee solid;
        h3{
            margin-top: 10px;
        }
    }
</style>