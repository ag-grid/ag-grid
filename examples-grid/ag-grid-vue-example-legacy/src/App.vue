<template>
    <div class="position-absolute d-flex flex-column h-100 w-100 p-2">
        <ul v-if="!forDocs" class="nav nav-pills" style="margin-bottom: 20px">
            <template v-for="route in routes">
                <li role="presentation" v-bind:key="route.path" class="nav-item">
                    <router-link :to="route.path" v-bind:class="{active: $route.path === route.path, 'nav-link': true }">{{route.name}}</router-link>
                </li>
            </template>
        </ul>
        <router-view></router-view>
    </div>
</template>
<script>
    import routes from './routes';

    export default {
        computed: {
            forDocs() {
                return this.$route.query.forDocs || false;
            },
            routes() {
                return routes
            }
        }
    }
</script>
