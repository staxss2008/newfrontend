<template>
  <div class="fuel-record">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>加油记录管理</span>
          <el-button type="primary" @click="handleAdd">添加记录</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline>
        <el-form-item label="车牌号">
          <el-input v-model="searchForm.plateNumber" placeholder="请输入车牌号" clearable />
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
        <el-table-column prop="recordDate" label="加油日期" width="120" />
        <el-table-column prop="plateNumber" label="车牌号" width="120" />
        <el-table-column prop="driverName" label="驾驶员" width="100" />
        <el-table-column prop="fuelAmount" label="加油金额" width="120">
          <template #default="{ row }">
            ¥{{ row.fuelAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="fuelVolume" label="加油升数" width="120">
          <template #default="{ row }">
            {{ row.fuelVolume }}升
          </template>
        </el-table-column>
        <el-table-column prop="fuelType" label="油品类型" width="100" />
        <el-table-column prop="currentMileage" label="当前里程" width="120">
          <template #default="{ row }">
            {{ row.currentMileage }}公里
          </template>
        </el-table-column>
        <el-table-column prop="gasStation" label="加油站" width="150" />
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
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
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="加油日期" prop="recordDate">
          <el-date-picker
            v-model="form.recordDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
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
        <el-form-item label="加油金额" prop="fuelAmount">
          <el-input-number
            v-model="form.fuelAmount"
            :min="0"
            :precision="2"
            placeholder="请输入加油金额"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="加油升数" prop="fuelVolume">
          <el-input-number
            v-model="form.fuelVolume"
            :min="0"
            :precision="2"
            placeholder="请输入加油升数"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="油品类型" prop="fuelType">
          <el-select v-model="form.fuelType" placeholder="请选择油品类型" style="width: 100%">
            <el-option label="92号汽油" value="92" />
            <el-option label="95号汽油" value="95" />
            <el-option label="98号汽油" value="98" />
            <el-option label="0号柴油" value="0" />
          </el-select>
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
        <el-form-item label="加油站" prop="gasStation">
          <el-input v-model="form.gasStation" placeholder="请输入加油站" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
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
import { getFuelRecordList, addFuelRecord, updateFuelRecord, deleteFuelRecord } from '@/api/record'
import { getAvailableVehicles } from '@/api/vehicle'
import { getActiveDrivers } from '@/api/driver'

export default {
  name: 'FuelRecord',
  data() {
    return {
      searchForm: {
        plateNumber: ''
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
      dialogTitle: '添加加油记录',
      form: {
        id: null,
        recordDate: '',
        vehicleId: null,
        driverId: null,
        fuelAmount: null,
        fuelVolume: null,
        fuelType: '',
        currentMileage: null,
        gasStation: '',
        remark: ''
      },
      rules: {
        recordDate: [{ required: true, message: '请选择加油日期', trigger: 'change' }],
        vehicleId: [{ required: true, message: '请选择车辆', trigger: 'change' }],
        driverId: [{ required: true, message: '请选择驾驶员', trigger: 'change' }],
        fuelAmount: [{ required: true, message: '请输入加油金额', trigger: 'blur' }]
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
          plateNumber: this.searchForm.plateNumber || undefined
        }

        if (this.dateRange && this.dateRange.length === 2) {
          params.startDate = this.dateRange[0]
          params.endDate = this.dateRange[1]
        }

        const res = await getFuelRecordList(params)

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
        plateNumber: ''
      }
      this.dateRange = []
      this.pagination.current = 1
      this.loadData()
    },

    handleAdd() {
      this.dialogTitle = '添加加油记录'
      this.form = {
        id: null,
        recordDate: new Date().toISOString().split('T')[0],
        vehicleId: null,
        driverId: null,
        fuelAmount: null,
        fuelVolume: null,
        fuelType: '',
        currentMileage: null,
        gasStation: '',
        remark: ''
      }
      this.dialogVisible = true
    },

    handleEdit(row) {
      this.dialogTitle = '编辑加油记录'
      this.form = {
        id: row.id,
        recordDate: row.recordDate,
        vehicleId: row.vehicleId,
        driverId: row.driverId,
        fuelAmount: row.fuelAmount,
        fuelVolume: row.fuelVolume,
        fuelType: row.fuelType,
        currentMileage: row.currentMileage,
        gasStation: row.gasStation,
        remark: row.remark
      }
      this.dialogVisible = true
    },

    handleDelete(row) {
      this.$confirm('确定要删除该加油记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteFuelRecord(row.id)
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
              res = await updateFuelRecord(this.form.id, this.form)
            } else {
              res = await addFuelRecord(this.form)
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
.fuel-record {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
