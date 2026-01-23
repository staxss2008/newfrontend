<template>
  <div class="driver-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>驾驶员管理</span>
          <div class="header-actions">
            <el-button type="success" @click="handleRecalculateDailyWages">重新计算每日工资</el-button>
            <el-button type="warning" @click="handleBatchUpdateWages">批量更新工资</el-button>
            <el-button type="primary" @click="handleAdd">添加驾驶员</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="在职" :value="1" />
            <el-option label="离职" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="电话" width="120" />
        <el-table-column prop="idCard" label="身份证号" width="180" />
        <el-table-column prop="driverLicense" label="驾驶证号" width="180" />
        <el-table-column prop="baseSalary" label="底薪" width="120">
          <template #default="{ row }">
            ¥{{ row.baseSalary }}
          </template>
        </el-table-column>
        <el-table-column prop="dailyWage" label="每日工资" width="120">
          <template #default="{ row }">
            ¥{{ row.dailyWage }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="text" @click="handleView(row)">查看</el-button>
            <el-button type="text" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" @click="handleDelete(row)">删除</el-button>
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
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="驾驶证号" prop="driverLicense">
          <el-input v-model="form.driverLicense" placeholder="请输入驾驶证号" />
        </el-form-item>
        <el-form-item label="底薪" prop="baseSalary">
          <el-input-number
            v-model="form.baseSalary"
            :min="0"
            :precision="2"
            placeholder="请输入底薪"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">在职</el-radio>
            <el-radio :label="0">离职</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量更新工资标准对话框 -->
    <el-dialog
      v-model="batchWageDialogVisible"
      title="批量更新工资标准"
      width="800px"
    >
      <el-table :data="batchWageForm" border style="width: 100%">
        <el-table-column prop="name" label="姓名" width="150" />
        <el-table-column label="底薪" width="200">
          <template #default="{ row }">
            <el-input-number
              v-model="row.baseSalary"
              :min="0"
              :precision="2"
              placeholder="请输入底薪"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="每日工资" width="200">
          <template #default="{ row }">
            <el-input-number
              v-model="row.dailyWage"
              :min="0"
              :precision="2"
              placeholder="请输入每日工资"
              style="width: 100%"
            />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="batchWageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchWageSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getDriverList, addDriver, updateDriver, deleteDriver, batchUpdateDriverWages, recalculateDailyWages } from '@/api/driver'

export default {
  name: 'DriverManagement',
  data() {
    return {
      searchForm: {
        name: '',
        status: null
      },
      tableData: [],
      loading: false,
      pagination: {
        current: 1,
        size: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '添加驾驶员',
      form: {
        id: null,
        name: '',
        phone: '',
        idCard: '',
        driverLicense: '',
        baseSalary: null,
        status: 1
      },
      rules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
        idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
        driverLicense: [{ required: true, message: '请输入驾驶证号', trigger: 'blur' }],
        baseSalary: [{ required: true, message: '请输入底薪', trigger: 'blur' }]
      },
      batchWageDialogVisible: false,
      batchWageForm: []
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const res = await getDriverList({
          current: this.pagination.current,
          size: this.pagination.size,
          name: this.searchForm.name || undefined,
          status: this.searchForm.status
        })

        if (res.code === 200) {
          this.tableData = res.data.records || []
          this.pagination.total = res.data.total || 0
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        this.loading = false
      }
    },

    handleReset() {
      this.searchForm = {
        name: '',
        status: null
      }
      this.pagination.current = 1
      this.loadData()
    },

    handleAdd() {
      this.dialogTitle = '添加驾驶员'
      this.form = {
        id: null,
        name: '',
        phone: '',
        idCard: '',
        driverLicense: '',
        baseSalary: null,
        status: 1
      }
      this.dialogVisible = true
    },

    handleView(row) {
      this.$message.info('查看详情功能待实现')
    },

    handleEdit(row) {
      this.dialogTitle = '编辑驾驶员'
      this.form = {
        id: row.id,
        name: row.name,
        phone: row.phone,
        idCard: row.idCard,
        driverLicense: row.driverLicense,
        baseSalary: row.baseSalary,
        status: row.status
      }
      this.dialogVisible = true
    },

    handleDelete(row) {
      this.$confirm('确定要删除该驾驶员吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteDriver(row.id)
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.loadData()
          }
        } catch (error) {
          console.error('删除失败:', error)
        }
      }).catch(() => {})
    },

    handleSubmit() {
      this.$refs.formRef.validate(async valid => {
        if (valid) {
          try {
            let res
            if (this.form.id) {
              res = await updateDriver(this.form.id, this.form)
            } else {
              res = await addDriver(this.form)
            }

            if (res.code === 200) {
              this.$message.success(this.form.id ? '更新成功' : '添加成功')
              this.dialogVisible = false
              this.loadData()
            }
          } catch (error) {
            console.error('操作失败:', error)
          }
        }
      })
    },

    async handleBatchUpdateWages() {
      try {
        // 先加载所有驾驶员数据
        const res = await getDriverList({ current: 1, size: 1000 })
        if (res.code === 200 && res.data && res.data.records) {
          // 初始化批量更新表单，包含所有驾驶员
          this.batchWageForm = res.data.records.map(driver => ({
            name: driver.name,
            baseSalary: driver.baseSalary,
            dailyWage: driver.dailyWage
          }))
          this.batchWageDialogVisible = true
        } else {
          this.$message.error('加载驾驶员数据失败')
        }
      } catch (error) {
        console.error('加载驾驶员数据失败:', error)
        this.$message.error('加载驾驶员数据失败')
      }
    },

    async handleBatchWageSubmit() {
      try {
        const res = await batchUpdateDriverWages(this.batchWageForm)
        if (res.code === 200) {
          this.$message.success('批量更新成功')
          this.batchWageDialogVisible = false
          this.loadData()
        } else {
          this.$message.error('批量更新失败')
        }
      } catch (error) {
        console.error('批量更新失败:', error)
        this.$message.error('批量更新失败')
      }
    },

    async handleRecalculateDailyWages() {
      try {
        await this.$confirm('确定要重新计算所有驾驶员的每日工资吗？此操作将根据当前设置的月工作天数更新所有驾驶员的每日工资。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const res = await recalculateDailyWages()
        if (res.code === 200) {
          this.$message.success('重新计算成功')
          this.loadData()
        } else {
          this.$message.error('重新计算失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('重新计算失败:', error)
          this.$message.error('重新计算失败')
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.driver-management {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
