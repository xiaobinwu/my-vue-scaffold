<template lang="jade">
    div.foo-container
        h3 {{title}}
        div.foo-content
            p(v-text="'这是来自公用store的state（count）：' + count")
            p(v-text="'这是来自公用store的state（amount）：' + amount")
            button(@click="increment") 递增count的值(延迟1秒)
</template>
<script>
    import Vue from 'vue'
    import { mapState, mapActions } from 'vuex'
    export default{
        name: 'fooDetail',
        data() {
            return {
                title: '亲情，属于你的心灵港湾'
            }
        },
        created() {

        },
        mounted() {
            console.log(this.count)
            console.log(this.amount)
        },
        computed: {
            ...mapState({
                count: state => state.count,
                amount: state => state.amount
            })
        },
        filters: {

        },
        methods: {
            ...mapActions([
                'increment' // 映射 this.increment() 为 this.$store.dispatch('increment')
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
        border: 1px #000 solid;
        button{
            font-size: 14px;
        }
    }
    a{
        text-decoration: none;
    }
</style>