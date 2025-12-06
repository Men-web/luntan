<template>
  <div class="app-wrapper">
    <!-- 头部导航栏 -->
    <Navbar />

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="content-container">
        <h1>电影社区</h1>
        
        <!-- 使用CommunityBase组件展示帖子 -->
        <CommunityBase 
          :title="'帖子列表'" 
          :communityType="'movie'"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from './Navbar.vue';
import CommunityBase from './CommunityBase.vue';
</script>

<style scoped>
.app-wrapper {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  background-color: #f0f2f5;
  padding: 20px;
  overflow: auto;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}
</style>