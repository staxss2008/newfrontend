<template>
  <div class="dispatch-record">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>派车记录填写</span>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出车日期" prop="recordDate">
              <el-date-picker
                v-model="form.recordDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="选择出车日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="用车单位" prop="useUnit">
              <el-input v-model="form.useUnit" placeholder="请输入用车单位" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="乘车人" prop="passengers">
              <el-input v-model="form.passengers" placeholder="请输入乘车人" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="批准人" prop="approver">
              <el-input v-model="form.approver" placeholder="请输入批准人" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="用车事由" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入用车事由"
          />
        </el-form-item>

        <el-form-item label="出车地点" prop="departurePlace">
          <el-input v-model="form.departurePlace" placeholder="请输入出车地点" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="驾驶人" prop="driverId">
              <el-select
                v-model="form.driverId"
                placeholder="请选择驾驶人"
                style="width: 100%"
                :disabled="isDriver"
              >
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
            <el-form-item label="车牌号" prop="vehicleId">
              <el-select
                v-model="form.vehicleId"
                placeholder="请选择车牌号"
                style="width: 100%"
              >
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
            <el-form-item label="出车时间" prop="departureTime">
              <el-time-picker
                v-model="form.departureTime"
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                placeholder="选择出车时间"
                style="width: 100%"
                @change="validateTime"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="收车时间" prop="returnTime">
              <el-time-picker
                v-model="form.returnTime"
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                placeholder="选择收车时间"
                style="width: 100%"
                @change="validateTime"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出车公里数" prop="startMileage">
              <el-input-number
                v-model="form.startMileage"
                :min="0"
                :precision="2"
                placeholder="请输入出车公里数"
                style="width: 100%"
                @change="validateMileage"
              />
              <div v-if="lastEndMileage !== null" class="mileage-tip">
                上次收车公里数：{{ lastEndMileage }} 公里
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="收车公里数" prop="endMileage">
              <el-input-number
                v-model="form.endMileage"
                :min="0"
                :precision="2"
                placeholder="请输入收车公里数"
                style="width: 100%"
                @change="validateMileage"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="行驶里程">
          <el-input v-model="totalMileage" disabled>
            <template #append>公里</template>
          </el-input>
        </el-form-item>

        <el-form-item label="是否值班" prop="isDuty">
          <el-switch
            v-model="form.isDuty"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getAvailableVehicles } from '@/api/vehicle'
import { addDispatchRecord, getLastEndMileage } from '@/api/dispatch'
import { getActiveDrivers } from '@/api/driver'

export default {
  name: 'DispatchRecord',
  data() {
    return {
      form: {
        recordDate: new Date().toISOString().split('T')[0],
        driverId: null,
        vehicleId: null,
        useUnit: '',
        passengers: '',
        reason: '',
        departurePlace: '',
        leader: '',
        approver: '',
        departureTime: this.getCurrentTime(),
        returnTime: this.getCurrentTime(),
        startMileage: null,
        endMileage: null,
        isDuty: false,
        remark: ''
      },
      rules: {
        useUnit: [{ required: true, message: '请输入用车单位', trigger: 'blur' }],
        leader: [{ required: true, message: '请输入领车人', trigger: 'blur' }],
        reason: [{ required: true, message: '请输入用车事由', trigger: 'blur' }],
        departurePlace: [{ required: true, message: '请输入出车地点', trigger: 'blur' }],
        vehicleId: [{ required: true, message: '请选择车牌号', trigger: 'change' }],
        departureTime: [{ required: true, message: '请选择出车时间', trigger: 'change' }],
        returnTime: [{ required: true, message: '请选择收车时间', trigger: 'change' }]
      },
      vehicles: [],
      drivers: [],
      totalMileage: 0,
      lastEndMileage: null
    }
  },
  computed: {
    ...mapGetters('user', ['realName', 'driverId', 'userRole']),

    isDriver() {
      return this.userRole === 'DRIVER'
    }
  },
  watch: {
    'form.vehicleId': {
      handler(newVal) {
        if (newVal) {
          this.loadLastEndMileage()
        } else {
          this.lastEndMileage = null
        }
      }
    }
  },
  mounted() {
    this.loadVehicles()
    this.loadDrivers()
    if (this.isDriver) {
      this.form.driverId = this.driverId
    }
  },
  methods: {
    getCurrentDateTime() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },

    getCurrentTime() {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      return `${hours}:${minutes}:${seconds}`
    },

    async loadVehicles() {
      try {
        const res = await getAvailableVehicles()
        if (res.code === 200) {
          this.vehicles = res.data
        }
      } catch (error) {
        console.error('加载车辆列表失败:', error)
      }
    },

    async loadDrivers() {
      try {
        const res = await getActiveDrivers()
        if (res.code === 200) {
          this.drivers = res.data
        }
      } catch (error) {
        console.error('加载驾驶员列表失败:', error)
      }
    },

    async loadLastEndMileage() {
      if (this.form.vehicleId) {
        try {
          const res = await getLastEndMileage(this.form.vehicleId)
          if (res.code === 200 && res.data !== null) {
            this.lastEndMileage = res.data.toFixed(2)
          } else {
            this.lastEndMileage = null
          }
        } catch (error) {
          console.error('获取上次收车公里数失败:', error)
          this.lastEndMileage = null
        }
      } else {
        this.lastEndMileage = null
      }
    },

    validateTime() {
      // 验证收车时间不能早于出车时间
      if (this.form.departureTime && this.form.returnTime) {
        const departureTime = this.form.departureTime
        const returnTime = this.form.returnTime

        if (returnTime < departureTime) {
          this.$message.warning('收车时间不能早于出车时间')
          this.form.returnTime = ''
        }
      }
    },

    validateMileage() {
      // 计算总里程
      if (this.form.startMileage !== null && this.form.endMileage !== null) {
        this.totalMileage = (this.form.endMileage - this.form.startMileage).toFixed(2)
      } else {
        this.totalMileage = 0
      }

      // 验证出车公里数
      if (this.form.startMileage !== null && this.lastEndMileage !== null) {
        if (this.form.startMileage < parseFloat(this.lastEndMileage)) {
          this.$message.warning(`出车公里数不能小于上次收车公里数 ${this.lastEndMileage}`)
        }
      }

      // 验证收车公里数
      if (this.form.startMileage !== null && this.form.endMileage !== null) {
        if (this.form.endMileage < this.form.startMileage) {
          this.$message.warning('收车公里数不能小于出车公里数')
        }
      }
    },

    calculateTotalMileage() {
      if (this.form.startMileage !== null && this.form.endMileage !== null) {
        this.totalMileage = (this.form.endMileage - this.form.startMileage).toFixed(2)
      } else {
        this.totalMileage = 0
      }
    },

    handleSubmit() {
      this.$refs.formRef.validate(async valid => {
        if (valid) {
          // 验证收车时间不能早于出车时间
          if (this.form.departureTime && this.form.returnTime) {
            const departureTime = this.form.departureTime
            const returnTime = this.form.returnTime

            if (returnTime < departureTime) {
              this.$message.error('收车时间不能早于出车时间')
              return
            }
          }

          // 最终验证
          if (this.form.startMileage !== null && this.lastEndMileage !== null) {
            if (this.form.startMileage < parseFloat(this.lastEndMileage)) {
              this.$message.error(`出车公里数不能小于上次收车公里数 ${this.lastEndMileage}`)
              return
            }
          }
          if (this.form.endMileage !== null && this.form.startMileage !== null) {
            if (this.form.endMileage < this.form.startMileage) {
              this.$message.error('收车公里数不能小于出车公里数')
              return
            }
          }

          try {
            // 将isDuty转换为整数类型（0或1）
            const formData = {
              ...this.form,
              isDuty: this.form.isDuty ? 1 : 0
            }
            const res = await addDispatchRecord(formData)
            if (res.code === 200) {
              this.$message.success('保存成功')
              this.handleReset()
            }
          } catch (error) {
            console.error('保存失败:', error)
          }
        }
      })
    },

    handleReset() {
      this.$refs.formRef.resetFields()
      this.totalMileage = 0
      this.lastEndMileage = null
      this.form.recordDate = new Date().toISOString().split('T')[0]
      this.form.departureTime = this.getCurrentTime()
      this.form.returnTime = this.getCurrentTime()
      if (this.isDriver) {
        this.form.driverId = this.driverId
      }
    }
  }
}
</script>

<style scoped lang="scss">
.dispatch-record {
  .card-header {
    font-weight: bold;
  }

  .mileage-tip {
    margin-top: 5px;
    font-size: 12px;
    color: #909399;
    line-height: 1.5;
  }
}
</style>
