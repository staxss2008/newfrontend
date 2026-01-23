<template>
  <div class="repair-record">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>维修记录管理</span>
          <el-button type="primary" @click="handleAdd">添加记录</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline>
        <el-form-item label="车牌号">
          <el-input v-model="searchForm.plateNumber" placeholder="请输入车牌号" clearable />
        </el-form-item>
        <el-form-item label="维修类型">
          <el-select v-model="searchForm.repairType" placeholder="请选择维修类型" clearable>
            <el-option label="日常保养" value="日常保养" />
            <el-option label="故障维修" value="故障维修" />
            <el-option label="事故维修" value="事故维修" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="recordDate" label="维修日期" width="120" />
        <el-table-column prop="plateNumber" label="车牌号" width="120" />
        <el-table-column prop="driverName" label="驾驶员" width="100" />
        <el-table-column prop="repairType" label="维修类型" width="100" />
        <el-table-column prop="repairCost" label="维修费用" width="120">
          <template #default="{ row }">
            ¥{{ row.repairCost }}
          </template>
        </el-table-column>
        <el-table-column prop="repairShop" label="维修厂" width="150" />
        <el-table-column prop="repairMileage" label="维修时里程" width="120">
          <template #default="{ row }">
            {{ row.repairMileage }}公里
          </template>
        </el-table-column>
        <el-table-column prop="nextMaintenanceMileage" label="下次保养里程" width="130">
          <template #default="{ row }">
            {{ row.nextMaintenanceMileage }}公里
          </template>
        </el-table-column>
        <el-table-column prop="nextMaintenanceDate" label="下次保养日期" width="120" />
        <el-table-column prop="repairContent" label="维修内容" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
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
      width="700px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="维修日期" prop="recordDate">
              <el-date-picker
                v-model="form.recordDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车辆" prop="vehicleId">
              <el-select v-model="form.vehicleId" placeholder="请选择车辆" style="width: 100%">
                <el-option
                  v-for="vehicle in vehicles"
                  :key="vehicle.id"
                  :label="vehicle.plateNumber"
                  :value="vehicle.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="驾驶员" prop="driverId">
              <el-select v-model="form.driverId" placeholder="请选择驾驶员" style="width: 100%">
                <el-option
                  v-for="driver in drivers"
                  :key="driver.id"
                  :label="driver.name"
                  :value="driver.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="维修类型" prop="repairType">
              <el-select v-model="form.repairType" placeholder="请选择维修类型" style="width: 100%">
                <el-option label="日常保养" value="日常保养" />
                <el-option label="故障维修" value="故障维修" />
                <el-option label="事故维修" value="事故维修" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="维修费用" prop="repairCost">
              <el-input-number
                v-model="form.repairCost"
                :min="0"
                :precision="2"
                placeholder="请输入维修费用"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="维修厂" prop="repairShop">
              <el-input v-model="form.repairShop" placeholder="请输入维修厂" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="维修时里程" prop="repairMileage">
              <el-input-number
                v-model="form.repairMileage"
                :min="0"
                :precision="2"
                placeholder="请输入维修时里程"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下次保养里程" prop="nextMaintenanceMileage">
              <el-input-number
                v-model="form.nextMaintenanceMileage"
                :min="0"
                :precision="2"
                placeholder="请输入下次保养里程"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="下次保养日期" prop="nextMaintenanceDate">
          <el-date-picker
            v-model="form.nextMaintenanceDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="维修内容" prop="repairContent">
          <el-input
            v-model="form.repairContent"
            type="textarea"
            :rows="4"
            placeholder="请输入维修内容"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
          />
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
import { getRepairRecordList, addRepairRecord, updateRepairRecord, deleteRepairRecord } from '@/api/record'
import { getAvailableVehicles } from '@/api/vehicle'
import { getActiveDrivers } from '@/api/driver'

export default {
  name: 'RepairRecord',
  data() {
    return {
      searchForm: {
        plateNumber: '',
        repairType: ''
      },
      dateRange: [],
      tableData: [],
      loading: false,
      pagination: {
        current: 1,
        size: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '添加维修记录',
      form: {
        id: null,
        recordDate: '',
        vehicleId: null,
        driverId: null,
        repairType: '',
        repairCost: null,
        repairShop: '',
        repairMileage: null,
        nextMaintenanceMileage: null,
        nextMaintenanceDate: '',
        repairContent: '',
        remark: ''
      },
      rules: {
        recordDate: [{ required: true, message: '请选择维修日期', trigger: 'change' }],
        vehicleId: [{ required: true, message: '请选择车辆', trigger: 'change' }],
        driverId: [{ required: true, message: '请选择驾驶员', trigger: 'change' }],
        repairType: [{ required: true, message: '请选择维修类型', trigger: 'change' }],
        repairCost: [{ required: true, message: '请输入维修费用', trigger: 'blur' }],
        repairContent: [{ required: true, message: '请输入维修内容', trigger: 'blur' }]
      },
      vehicles: [],
      drivers: []
    }
  },
  mounted() {
    this.loadData()
    this.loadVehicles()
    this.loadDrivers()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const params = {
          current: this.pagination.current,
          size: this.pagination.size,
          plateNumber: this.searchForm.plateNumber || undefined,
          repairType: this.searchForm.repairType || undefined
        }

        if (this.dateRange && this.dateRange.length === 2) {
          params.startDate = this.dateRange[0]
          params.endDate = this.dateRange[1]
        }

        const res = await getRepairRecordList(params)

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

    async loadVehicles() {
      try {
        const res = await getAvailableVehicles()
        if (res.code === 200) {
          this.vehicles = res.data || []
        }
      } catch (error) {
        console.error('加载车辆列表失败:', error)
      }
    },

    async loadDrivers() {
      try {
        const res = await getActiveDrivers()
        if (res.code === 200) {
          this.drivers = res.data || []
        }
      } catch (error) {
        console.error('加载驾驶员列表失败:', error)
      }
    },

    handleReset() {
      this.searchForm = {
        plateNumber: '',
        repairType: ''
      }
      this.dateRange = []
      this.pagination.current = 1
      this.loadData()
    },

    handleAdd() {
      this.dialogTitle = '添加维修记录'
      this.form = {
        id: null,
        recordDate: new Date().toISOString().split('T')[0],
        vehicleId: null,
        driverId: null,
        repairType: '',
        repairCost: null,
        repairShop: '',
        repairMileage: null,
        nextMaintenanceMileage: null,
        nextMaintenanceDate: '',
        repairContent: '',
        remark: ''
      }
      this.dialogVisible = true
    },

    handleEdit(row) {
      this.dialogTitle = '编辑维修记录'
      this.form = {
        id: row.id,
        recordDate: row.recordDate,
        vehicleId: row.vehicleId,
        driverId: row.driverId,
        repairType: row.repairType,
        repairCost: row.repairCost,
        repairShop: row.repairShop,
        repairMileage: row.repairMileage,
        nextMaintenanceMileage: row.nextMaintenanceMileage,
        nextMaintenanceDate: row.nextMaintenanceDate,
        repairContent: row.repairContent,
        remark: row.remark
      }
      this.dialogVisible = true
    },

    handleDelete(row) {
      this.$confirm('确定要删除该维修记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteRepairRecord(row.id)
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
              res = await updateRepairRecord(this.form.id, this.form)
            } else {
              res = await addRepairRecord(this.form)
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
    }
  }
}
</script>

<style scoped lang="scss">
.repair-record {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
