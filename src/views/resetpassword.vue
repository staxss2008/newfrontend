<template>
  <div class="reset-password">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>重置驾驶员密码</span>
        </div>
      </template>

      <el-form :model="form" label-width="120px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="form.password" type="password" placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="resetPassword">重置密码</el-button>
        </el-form-item>
      </el-form>

      <div v-if="result" :class="['result', result.success ? 'success' : 'error']">
        {{ result.message }}
      </div>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'ResetPassword',
  data() {
    return {
      form: {
        username: 'driver1',
        password: 'driver123'
      },
      result: null
    }
  },
  methods: {
    async resetPassword() {
      try {
        const res = await request({
          url: '/auth/reset-driver-password',
          method: 'post',
          data: this.form
        })

        this.result = {
          success: res.code === 200,
          message: res.message
        }
      } catch (error) {
        this.result = {
          success: false,
          message: '重置失败: ' + error.message
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.reset-password {
  max-width: 500px;
  margin: 50px auto;

  .card-header {
    font-weight: bold;
  }

  .result {
    margin-top: 20px;
    padding: 10px;
    border-radius: 4px;

    &.success {
      background-color: #f0f9ff;
      color: #67c23a;
    }

    &.error {
      background-color: #fef0f0;
      color: #f56c6c;
    }
  }
}
</style>
