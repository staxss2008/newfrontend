<template>
  <div class="not-found">
    <div class="content">
      <div class="error-code">404</div>
      <div class="error-message">页面不存在</div>
      <div class="error-description">抱歉,您访问的页面不存在或已被删除</div>
      <el-button type="primary" @click="goHome" style="margin-top: 20px;">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  methods: {
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped lang="scss">
.not-found {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;

  .content {
    text-align: center;

    .error-code {
      font-size: 120px;
      font-weight: bold;
      color: #409eff;
      line-height: 1;
      margin-bottom: 20px;
    }

    .error-message {
      font-size: 24px;
      color: #303133;
      margin-bottom: 10px;
    }

    .error-description {
      font-size: 14px;
      color: #909399;
    }
  }
}
</style>
