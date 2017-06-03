<template lang="jade">
    div.header 我是头部
</template>
<script>
    import Vue from 'vue'
    export default{
        name: 'header',
        data(){
            return{

            }
        },
        mounted(){

        },
        methods:{

        },
        watch:{

        },
        components: {

        }
    }
</script>
<style lang="sass">
    @import "../public/scss/_variables.scss";
    .header{
        width: 100%;
        min-width: $container-width;
        height: 100px;
        line-height: 100px;
        text-align: center;
        background-color: $gray-lighter;
    }
</style>