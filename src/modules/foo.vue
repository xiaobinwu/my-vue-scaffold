<template lang="jade">
    div.main
        Header
        div.content
            transition(appear, name="slide", mode="out-in")
                router-view
        Footer
</template>

<script>
import '~/public/scss/_reset'
import '~/public/scss/_transition'
import Header from '~/components/header'
import Footer from '~/components/footer'
export default {
    name: 'foo',
    data() {
        return {
        }
    },
    components: {
        Header,
        Footer
    },
    methods: {
    },
    watch: {
        '$route'(to, from) {
            document.title = '测试1'
        }
    }
}
</script>
<style lang="sass">
.main{
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    .content{
        flex: 1;
        height: auto;
        width: 100%;
    }
}
</style>