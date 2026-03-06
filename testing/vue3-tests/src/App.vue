<template>
    <div class="app-layout">
        <nav class="sidebar">
            <h3>Vue 3 Tests</h3>
            <ul>
                <li v-for="route in routes" :key="route.path">
                    <router-link :to="route.path" active-class="active">
                        {{ route.name }}
                    </router-link>
                </li>
            </ul>
        </nav>
        <main class="content">
            <router-view />
        </main>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
const routes = router.getRoutes().filter((r) => r.name);
</script>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.app-layout {
    display: flex;
    height: 100vh;
}

.sidebar {
    width: 260px;
    min-width: 260px;
    background: #f5f5f5;
    border-right: 1px solid #ddd;
    padding: 16px;
    overflow-y: auto;
}

.sidebar h3 {
    margin-bottom: 12px;
    font-size: 16px;
}

.sidebar ul {
    list-style: none;
}

.sidebar li {
    margin-bottom: 4px;
}

.sidebar a {
    display: block;
    padding: 6px 8px;
    text-decoration: none;
    color: #333;
    border-radius: 4px;
    font-size: 13px;
}

.sidebar a:hover {
    background: #e0e0e0;
}

.sidebar a.active {
    background: #1976d2;
    color: white;
}

.content {
    flex: 1;
    padding: 16px;
    overflow: auto;
}
</style>
