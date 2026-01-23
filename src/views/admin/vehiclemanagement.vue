<template>
  <div class="vehicle-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>车辆管理</span>
          <el-button type="primary" @click="handleAdd">添加车辆</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline>
        <el-form-item label="车牌号">
          <el-input v-model="searchForm.plateNumber" placeholder="请输入车牌号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="可用" :value="1" />
            <el-option label="维修中" :value="2" />
            <el-option label="报废" :value="3" />
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
        <el-table-column prop="plateNumber" label="车牌号" width="120" />
        <el-table-column prop="vehicleType" label="车辆类型" width="120" />
        <el-table-column prop="brand" label="品牌" width="100" />
        <el-table-column prop="model" label="型号" width="100" />
        <el-table-column prop="currentMileage" label="当前里程" width="120">
          <template #default="{ row }">
            {{ row.currentMileage }}公里
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
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
        <el-form-item label="车牌号" prop="plateNumber">
          <el-input v-model="form.plateNumber" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="车辆类型" prop="vehicleType">
          <el-input v-model="form.vehicleType" placeholder="请输入车辆类型" />
        </el-form-item>
        <el-form-item label="品牌" prop="brand">
          <el-input v-model="form.brand" placeholder="请输入品牌" />
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="form.model" placeholder="请输入型号" />
        </el-form-item>
        <el-form-item label="当前里程" prop="currentMileage">
          <el-input-number
            v-model="form.currentMileage"
            :min="0"
            :precision="2"
            placeholder="请输入当前里程"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">可用</el-radio>
            <el-radio :label="2">维修中</el-radio>
            <el-radio :label="3">报废</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getVehicleList, addVehicle, updateVehicle, deleteVehicle } from '@/api/vehicle'

export default {
  name: 'VehicleManagement',
  data() {
    return {
      searchForm: {
        plateNumber: '',
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
      dialogTitle: '添加车辆',
      form: {
        id: null,
        plateNumber: '',
        vehicleType: '',
        brand: '',
        model: '',
        currentMileage: null,
        status: 1
      },
      rules: {
        plateNumber: [{ required: true, message: '请输入车牌号', trigger: 'blur' }],
        vehicleType: [{ required: true, message: '请输入车辆类型', trigger: 'blur' }],
        brand: [{ required: true, message: '请输入品牌', trigger: 'blur' }],
        model: [{ required: true, message: '请输入型号', trigger: 'blur' }],
        currentMileage: [{ required: true, message: '请输入当前里程', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const res = await getVehicleList({
          current: this.pagination.current,
          size: this.pagination.size,
          plateNumber: this.searchForm.plateNumber || undefined,
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
        plateNumber: '',
        status: null
      }
      this.pagination.current = 1
      this.loadData()
    },

    handleAdd() {
      this.dialogTitle = '添加车辆'
      this.form = {
        id: null,
        plateNumber: '',
        vehicleType: '',
        brand: '',
        model: '',
        currentMileage: null,
        status: 1
      }
      this.dialogVisible = true
    },

    handleView(row) {
      this.$message.info('查看详情功能待实现')
    },

    handleEdit(row) {
      this.dialogTitle = '编辑车辆'
      this.form = {
        id: row.id,
        plateNumber: row.plateNumber,
        vehicleType: row.vehicleType,
        brand: row.brand,
        model: row.model,
        currentMileage: row.currentMileage,
        status: row.status
      }
      this.dialogVisible = true
    },

    handleDelete(row) {
      this.$confirm('确定要删除该车辆吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteVehicle(row.id)
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
              res = await updateVehicle(this.form.id, this.form)
            } else {
              res = await addVehicle(this.form)
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

    getStatusType(status) {
      const statusMap = {
        1: 'success',
        2: 'warning',
        3: 'info'
      }
      return statusMap[status] || 'info'
    },

    getStatusText(status) {
      const statusMap = {
        1: '可用',
        2: '维修中',
        3: '报废'
      }
      return statusMap[status] || '未知'
    }
  }
}
</script>

<style scoped lang="scss">
.vehicle-management {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
