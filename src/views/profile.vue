<template>
  <div class="profile-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="displayUserInfo" label-width="120px" class="profile-form">
            <el-form-item label="用户名">
              <el-input v-model="displayUserInfo.username" disabled />
            </el-form-item>
            <el-form-item label="角色">
              <el-tag :type="displayUserInfo.role === 2 ? 'danger' : 'success'">
                {{ displayUserInfo.role === 2 ? '管理员' : '驾驶员' }}
              </el-tag>
            </el-form-item>
            <el-form-item label="真实姓名">
              <el-input v-model="displayUserInfo.realName" disabled />
            </el-form-item>
            <el-form-item label="电话">
              <el-input v-model="displayUserInfo.phone" disabled />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="displayUserInfo.email" disabled />
            </el-form-item>
            <el-form-item label="最后登录时间">
              <el-input v-model="displayUserInfo.lastLoginTime" disabled />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 驾驶员信息（仅驾驶员可见） -->
        <el-tab-pane label="驾驶员信息" name="driver" v-if="userRole === 'DRIVER'">
          <el-form :model="driverInfo" label-width="120px" class="profile-form">
            <el-form-item label="姓名">
              <el-input v-model="driverInfo.name" disabled />
            </el-form-item>
            <el-form-item label="电话">
              <el-input v-model="driverInfo.phone" disabled />
            </el-form-item>
            <el-form-item label="身份证号">
              <el-input v-model="driverInfo.idCard" disabled />
            </el-form-item>
            <el-form-item label="驾驶证号">
              <el-input v-model="driverInfo.driverLicense" disabled />
            </el-form-item>
            <el-form-item label="底薪">
              <el-input v-model="driverInfo.baseSalary" disabled />
            </el-form-item>
            <el-form-item label="每日工资">
              <el-input v-model="driverInfo.dailyWage" disabled />
            </el-form-item>
            <el-form-item label="状态">
              <el-tag :type="driverInfo.status === 1 ? 'success' : 'info'">
                {{ driverInfo.status === 1 ? '在职' : '离职' }}
              </el-tag>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 用户管理（仅管理员可见） -->
        <el-tab-pane label="用户管理" name="userManagement" v-if="userRole === 'ADMIN'">
          <div class="user-management">
            <!-- 搜索表单 -->
            <el-form :model="searchForm" inline>
              <el-form-item label="用户名">
                <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
              </el-form-item>
              <el-form-item label="角色">
                <el-select v-model="searchForm.role" placeholder="请选择角色" clearable>
                  <el-option label="管理员" :value="2" />
                  <el-option label="驾驶员" :value="1" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="loadUserList">查询</el-button>
                <el-button @click="handleSearchReset">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- 数据表格 -->
            <el-table :data="userList" border stripe v-loading="userListLoading">
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="username" label="用户名" width="120" />
              <el-table-column prop="realName" label="真实姓名" width="120" />
              <el-table-column prop="phone" label="电话" width="130" />
              <el-table-column prop="email" label="邮箱" width="180" />
              <el-table-column label="角色" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.role === 2 ? 'danger' : 'success'">
                    {{ row.role === 2 ? '管理员' : '驾驶员' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'info'">
                    {{ row.status === 1 ? '正常' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="lastLoginTime" label="最后登录时间" width="180" />
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button type="text" @click="handleEditUser(row)">编辑</el-button>
                  <el-button type="text" @click="handleResetUserPassword(row)">重置密码</el-button>
                  <el-button type="text" @click="handleDeleteUser(row)" v-if="row.role !== 2">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.size"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadUserList"
              @current-change="loadUserList"
              style="margin-top: 20px; text-align: right;"
            />
          </div>
        </el-tab-pane>

        <!-- 修改密码 -->
        <el-tab-pane label="修改密码" name="password">
          <el-form ref="passwordForm" :model="passwordForm" :rules="passwordRules" label-width="120px" class="profile-form">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleChangePassword" :loading="passwordLoading">修改密码</el-button>
              <el-button @click="handleResetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="userDialogTitle"
      width="600px"
    >
      <el-form ref="userFormRef" :model="userForm" :rules="userFormRules" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" disabled />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-radio-group v-model="userForm.role">
            <el-radio :label="1">驾驶员</el-radio>
            <el-radio :label="2">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveUser">保存</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPasswordDialogVisible"
      title="重置密码"
      width="500px"
    >
      <el-form ref="resetPasswordFormRef" :model="resetPasswordForm" :rules="resetPasswordRules" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="resetPasswordForm.username" disabled />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input v-model="resetPasswordForm.password" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPasswordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmResetPassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getDriverById } from '@/api/driver'
import { getUserList, updateUser, deleteUser, resetUserPassword } from '@/api/user'

export default {
  name: 'Profile',
  data() {
    // 验证确认密码
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    return {
      activeTab: 'basic',
      displayUserInfo: {
        id: '',
        username: '',
        realName: '',
        phone: '',
        email: '',
        role: 1,
        lastLoginTime: ''
      },
      driverInfo: {
        name: '',
        phone: '',
        idCard: '',
        driverLicense: '',
        baseSalary: 0,
        dailyWage: 0,
        status: 1
      },
      // 用户管理相关
      userList: [],
      userListLoading: false,
      searchForm: {
        username: '',
        role: null
      },
      pagination: {
        current: 1,
        size: 10,
        total: 0
      },
      // 用户编辑对话框
      userDialogVisible: false,
      userDialogTitle: '',
      userForm: {
        id: null,
        username: '',
        realName: '',
        phone: '',
        email: '',
        role: 1,
        status: 1
      },
      userFormRules: {
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入电话', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      },
      // 重置密码对话框
      resetPasswordDialogVisible: false,
      resetPasswordForm: {
        id: null,
        username: '',
        password: ''
      },
      resetPasswordRules: {
        password: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ]
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      },
      passwordLoading: false
    }
  },
  computed: {
    ...mapGetters('user', ['userInfo', 'userRole', 'driverId'])
  },
  mounted() {
    this.loadUserInfo()
    if (this.userRole === 'DRIVER' && this.driverId) {
      this.loadDriverInfo()
    }
    if (this.userRole === 'ADMIN') {
      this.loadUserList()
    }
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      const userInfo = this.userInfo || {}
      this.displayUserInfo = {
        id: userInfo.id || '',
        username: userInfo.username || '',
        realName: userInfo.realName || '',
        phone: userInfo.phone || '',
        email: userInfo.email || '',
        role: userInfo.role || 1,
        lastLoginTime: userInfo.lastLoginTime || ''
      }
    },
    // 加载驾驶员信息
    async loadDriverInfo() {
      try {
        const res = await getDriverById(this.driverId)
        if (res.code === 200 && res.data) {
          this.driverInfo = {
            name: res.data.name || '',
            phone: res.data.phone || '',
            idCard: res.data.idCard || '',
            driverLicense: res.data.driverLicense || '',
            baseSalary: res.data.baseSalary || 0,
            dailyWage: res.data.dailyWage || 0,
            status: res.data.status || 1
          }
        }
      } catch (error) {
        console.error('加载驾驶员信息失败:', error)
        this.$message.error('加载驾驶员信息失败')
      }
    },
    // 修改密码
    handleChangePassword() {
      this.$refs.passwordForm.validate(async valid => {
        if (valid) {
          this.passwordLoading = true
          try {
            const res = await updateUser(this.displayUserInfo.id, {
              oldPassword: this.passwordForm.oldPassword,
              newPassword: this.passwordForm.newPassword
            })
            if (res.code === 200) {
              this.$message.success('密码修改成功，请重新登录')
              this.handleResetPasswordForm()
              // 延迟跳转到登录页面
              setTimeout(() => {
                this.$store.dispatch('user/logout')
                this.$router.push('/login')
              }, 1500)
            } else {
              this.$message.error(res.message || '密码修改失败')
            }
          } catch (error) {
            console.error('修改密码失败:', error)
            this.$message.error('密码修改失败')
          } finally {
            this.passwordLoading = false
          }
        }
      })
    },
    // 重置密码表单
    handleResetPasswordForm() {
      this.$refs.passwordForm.resetFields()
    },
    // 加载用户列表
    async loadUserList() {
      this.userListLoading = true
      try {
        const params = {
          page: this.pagination.current,
          size: this.pagination.size
        }
        // 只在有值时才添加参数
        if (this.searchForm.username) {
          params.username = this.searchForm.username
        }
        if (this.searchForm.role !== null && this.searchForm.role !== undefined) {
          params.role = this.searchForm.role
        }
        const res = await getUserList(params)
        if (res.code === 200) {
          this.userList = res.data.records || []
          this.pagination.total = res.data.total || 0
        } else {
          this.$message.error(res.message || '加载用户列表失败')
        }
      } catch (error) {
        console.error('加载用户列表失败:', error)
        this.$message.error('加载用户列表失败')
      } finally {
        this.userListLoading = false
      }
    },
    // 重置搜索表单
    handleSearchReset() {
      this.searchForm = {
        username: '',
        role: null
      }
      this.pagination.current = 1
      this.loadUserList()
    },
    // 编辑用户
    handleEditUser(row) {
      this.userDialogTitle = '编辑用户'
      this.userForm = {
        id: row.id,
        username: row.username,
        realName: row.realName,
        phone: row.phone,
        email: row.email,
        role: row.role,
        status: row.status
      }
      this.userDialogVisible = true
    },
    // 保存用户
    handleSaveUser() {
      this.$refs.userFormRef.validate(async valid => {
        if (valid) {
          try {
            const res = await updateUser(this.userForm.id, {
              realName: this.userForm.realName,
              phone: this.userForm.phone,
              email: this.userForm.email,
              role: this.userForm.role,
              status: this.userForm.status
            })
            if (res.code === 200) {
              this.$message.success('保存成功')
              this.userDialogVisible = false
              this.loadUserList()
            } else {
              this.$message.error(res.message || '保存失败')
            }
          } catch (error) {
            console.error('保存用户失败:', error)
            this.$message.error('保存失败')
          }
        }
      })
    },
    // 重置用户密码
    handleResetUserPassword(row) {
      this.resetPasswordForm = {
        id: row.id,
        username: row.username,
        password: ''
      }
      this.resetPasswordDialogVisible = true
    },
    // 确认重置密码
    handleConfirmResetPassword() {
      this.$refs.resetPasswordFormRef.validate(async valid => {
        if (valid) {
          try {
            const res = await resetUserPassword(this.resetPasswordForm.id, this.resetPasswordForm.password)
            if (res.code === 200) {
              this.$message.success('密码重置成功')
              this.resetPasswordDialogVisible = false
            } else {
              this.$message.error(res.message || '密码重置失败')
            }
          } catch (error) {
            console.error('重置密码失败:', error)
            this.$message.error('重置密码失败')
          }
        }
      })
    },
    // 删除用户
    handleDeleteUser(row) {
      this.$confirm(`确定要删除用户"${row.realName}"吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteUser(row.id)
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.loadUserList()
          } else {
            this.$message.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除用户失败:', error)
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-form {
  max-width: 600px;
  margin-top: 20px;
}
</style>
