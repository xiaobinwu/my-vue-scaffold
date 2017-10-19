<template>
    <div class="skeleton-wrapper">
        <header class="skeleton-header">我是头部</header>
        <section class="skeleton-block">
            Skeleton of Foo
        </section>
        <div class="skeleton-footer">我是底部</div>
    </div>
</template>

<script>
export default {
    name: 'skeleton'
}
</script>

<style lang="sass" scoped>
.skeleton-wrapper{
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    .skeleton-header {
        width: 100%;
        min-width: 900px;
        height: 100px;
        line-height: 100px;
        text-align: center;
        background-color: #ececec;
    }
    .skeleton-footer {
        width: 100%;
        min-width: 900px;
        height: 100px;
        line-height: 100px;
        text-align: center;
        background-color: #ececec;
    }
    .skeleton-block {
        flex: 1;
        line-height: 800px;
        text-align: center;
        height: 800px;
        width: 100%;
    }
}
</style>