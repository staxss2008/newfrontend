<template>
  <el-container class="main-layout">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h2>派车管理</h2>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        router
      >
        <!-- 驾驶员端菜单 -->
        <template v-if="isDriver">
          <el-menu-item index="/dispatch">
            <el-icon><Document /></el-icon>
            <span>派车记录</span>
          </el-menu-item>
          <el-menu-item index="/driver/monthly-detail">
            <el-icon><Calendar /></el-icon>
            <span>月度详细</span>
          </el-menu-item>
          <el-menu-item index="/driver/statistics">
            <el-icon><DataAnalysis /></el-icon>
            <span>个人统计</span>
          </el-menu-item>
        </template>

        <!-- 管理端菜单 -->
        <template v-if="isAdmin">
          <el-menu-item index="/dispatch">
            <el-icon><Document /></el-icon>
            <span>派车记录</span>
          </el-menu-item>
          <el-menu-item index="/driver/monthly-detail">
            <el-icon><Calendar /></el-icon>
            <span>月度详细</span>
          </el-menu-item>
          <el-menu-item index="/driver/statistics">
            <el-icon><DataAnalysis /></el-icon>
            <span>个人统计</span>
          </el-menu-item>
          <el-menu-item index="/admin/monthly-statistics">
            <el-icon><DataBoard /></el-icon>
            <span>月度统计</span>
          </el-menu-item>
          <el-menu-item index="/admin/fee-standard">
            <el-icon><Setting /></el-icon>
            <span>费用标准</span>
          </el-menu-item>
          <el-menu-item index="/admin/driver-management">
            <el-icon><User /></el-icon>
            <span>驾驶员管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/vehicle-management">
            <el-icon><Van /></el-icon>
            <span>车辆管理</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta.title">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              {{ realName }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'MainLayout',
  data() {
    return {
      isCollapse: false
    }
  },
  computed: {
    ...mapGetters('user', ['realName', 'userRole']),

    isDriver() {
      return this.userRole === 'DRIVER'
    },

    isAdmin() {
      return this.userRole === 'ADMIN'
    },

    activeMenu() {
      return this.$route.path
    },

    currentRoute() {
      return this.$route
    }
  },
  methods: {
    ...mapActions('user', ['logout']),

    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },

    handleCommand(command) {
      switch (command) {
        case 'profile':
          this.$router.push('/profile')
          break
        case 'logout':
          this.$confirm('确定要退出登录吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.logout()
            this.$router.push('/login')
          }).catch(() => {})
          break
      }
    }
  }
}
</script>

<style scoped lang="scss">
.main-layout {
  height: 100%;
}

.sidebar {
  background-color: #304156;
  overflow-x: hidden;

  .logo {
    height: 50px;
    line-height: 50px;
    text-align: center;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid #1f2d3d;

    h2 {
      margin: 0;
    }
  }

  .sidebar-menu {
    border-right: none;
    height: calc(100% - 50px);
    overflow-y: auto;
  }
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;

  .header-left {
    display: flex;
    align-items: center;

    .collapse-icon {
      font-size: 20px;
      margin-right: 20px;
      cursor: pointer;
    }
  }

  .header-right {
    .user-info {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
