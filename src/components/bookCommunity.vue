<template>
  <div class="book-community">
    <!-- 导航栏 -->
    <Navbar />

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="content-container">
        <h1>书籍社区</h1>
        
        <!-- 使用CommunityBase组件展示帖子 -->
        <CommunityBase 
          :title="'帖子列表'" 
          :communityType="'book'"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import CommunityBase from './CommunityBase.vue';
import Navbar from './Navbar.vue';
</script>

<style scoped>
.book-community {
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