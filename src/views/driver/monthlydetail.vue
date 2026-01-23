<template>
  <div class="monthly-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>月度详细记录</span>
          <div class="header-actions">
            <el-select
              v-if="isAdmin"
              v-model="selectedDriverId"
              placeholder="选择驾驶员"
              clearable
              @change="loadData"
              style="width: 200px; margin-right: 10px"
            >
              <el-option
                v-for="driver in driverList"
                :key="driver.id"
                :label="driver.name"
                :value="driver.id"
              />
            </el-select>
            <el-date-picker
              v-model="currentMonth"
              type="month"
              placeholder="选择月份"
              format="YYYY年MM月"
              value-format="YYYY-MM"
              @change="loadData"
            />
            <el-button type="primary" @click="exportExcel">导出Excel</el-button>
          </div>
        </div>
      </template>



      <div class="table-container">
        <el-table :data="tableData" border v-loading="loading" :span-method="tableSpanMethod" :height="tableHeight" :cell-style="{padding: '8px 0'}">
        <el-table-column prop="recordDate" label="日期" min-width="100" show-overflow-tooltip fixed>
          <template #default="{ row }">
            {{ formatDate(row.recordDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="driverName" label="驾驶人" min-width="80" show-overflow-tooltip fixed />
        <el-table-column prop="plateNumber" label="车辆" min-width="100" />
        <el-table-column prop="departureTime" label="出车时间" min-width="100" />
        <el-table-column prop="returnTime" label="收车时间" min-width="100" />
        <el-table-column prop="startMileage" label="出车公里数" min-width="100" />
        <el-table-column prop="endMileage" label="收车公里数" min-width="100" />
        <el-table-column prop="totalMileage" label="合计公里数" min-width="100" />
        <el-table-column label="公里补贴" min-width="80">
          <template #default="{ row }">
            ¥{{ (row.bridgeRepairFee || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="事由" min-width="150" show-overflow-tooltip />
        <el-table-column prop="passengers" label="乘车人" min-width="100" show-overflow-tooltip />
        <el-table-column label="上班前加班" min-width="100">
          <template #default="{ row }">
            {{ row.earlyOvertimeHours || 0 }}小时
          </template>
        </el-table-column>
        <el-table-column label="下班后加班" min-width="100">
          <template #default="{ row }">
            {{ row.lateOvertimeHours || 0 }}小时
          </template>
        </el-table-column>
        <el-table-column label="加班时间" min-width="80">
          <template #default="{ row }">
            {{ row.overtimeHours }}小时
          </template>
        </el-table-column>
        <el-table-column prop="overtimeAmount" label="小时加班金额" min-width="100">
          <template #default="{ row }">
            ¥{{ row.overtimeAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="dutySubsidy" label="值班补贴" min-width="80">
          <template #default="{ row, $index }">
            <div v-if="isFirstRecordOfDay(row, $index)" style="text-align: center;">¥{{ row.dutySubsidy }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="restDayWage" label="公休日工资" min-width="100">
          <template #default="{ row, $index }">
            <div v-if="isFirstRecordOfDay(row, $index)" style="text-align: center;">
              {{ isRestDay(row.recordDate) ? '¥' + (restDayWage || 0).toFixed(2) : '¥0.00' }}
            </div>
            <div v-else></div>
          </template>
        </el-table-column>
        <el-table-column prop="holidayWage" label="节假日工资" min-width="100">
          <template #default="{ row, $index }">
            <div v-if="isFirstRecordOfDay(row, $index)" style="text-align: center;">¥{{ row.holidayWage }}</div>
            <div v-else></div>
          </template>
        </el-table-column>

        <el-table-column label="合计" min-width="100">
          <template #default="{ row, $index }">
            <div v-if="isFirstRecordOfDay(row, $index)">¥{{ calculateTotalSubsidy(row, $index) }}</div>
            <div v-else></div>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120" fixed="right">
          <template #default="{ row, $index }">
            <div v-if="isFirstRecordOfDay(row, $index)">
              <el-button type="text" @click="handleView(row)">查看</el-button>
              <el-button type="text" @click="handleEdit(row)">修改</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <div class="table-footer">
        <el-descriptions :column="4" border>
          <el-descriptions-item label="小时加班总金额">¥{{ calculateTotalOvertimeAmount() }}</el-descriptions-item>
          <el-descriptions-item label="值班总补贴">¥{{ calculateTotalDutySubsidy() }}</el-descriptions-item>
          <el-descriptions-item label="公休日工资">¥{{ calculateTotalRestDayWage() }}</el-descriptions-item>
          <el-descriptions-item label="节假日工资">¥{{ calculateTotalHolidayWage() }}</el-descriptions-item>
          <el-descriptions-item label="每日安全奖">¥{{ dailySafetyBonus ? dailySafetyBonus.toFixed(2) : '0.00' }}</el-descriptions-item>
          <el-descriptions-item label="总安全奖">¥{{ calculateTotalSafetyBonus() }}</el-descriptions-item>
          <el-descriptions-item label="总合计">¥{{ calculateTotalAmount() }}</el-descriptions-item>
        </el-descriptions>
        <el-descriptions :column="4" border style="margin-top: 10px;">
          <el-descriptions-item label="实际出勤天数">{{ calculateActualWorkDays() }}天</el-descriptions-item>
          <el-descriptions-item label="标准工作天数">{{ workDays }}天</el-descriptions-item>
          <el-descriptions-item label="本月出车次数">{{ summary.totalCount || 0 }}次</el-descriptions-item>
          <el-descriptions-item label="本月总里程">{{ summary.totalMileage || 0 }}公里</el-descriptions-item>
        </el-descriptions>
        <el-descriptions :column="4" border style="margin-top: 10px;">
          <el-descriptions-item label="本月公里费用">¥{{ calculateMileageFee() }}</el-descriptions-item>
          <el-descriptions-item label="本月总收入">¥{{ calculateTotalIncome() }}</el-descriptions-item>
        </el-descriptions>
        <div class="calculation-tips" style="margin-top: 15px; padding: 10px; background-color: #f5f7fa; border-radius: 4px; font-size: 13px; color: #606266;">
          <div style="margin-bottom: 5px;"><strong>计算方法说明：</strong></div>
          <div>总合计 = 加班费 + 值班补贴 + 公休日工资 + 节假日工资 + 安全奖（最高200元）+ 公里费用</div>
          <div>本月总收入 = 总合计</div>
          <div style="margin-top: 5px; color: #909399;">公休日工资计算：</div>
          <div style="margin-left: 20px;">• 实际出勤天数 > 标准工作天数：发放公休日工资 = (实际出勤天数 - 标准工作天数) × 公休日工资标准</div>
          <div style="margin-left: 20px;">• 实际出勤天数 < 标准工作天数：扣除请假工资 = (标准工作天数 - 实际出勤天数) × 日工资</div>
          <div style="margin-left: 20px;">• 实际出勤天数 = 标准工作天数：不发放公休日工资，也不扣除工资</div>
        </div>
      </div>
    </el-card>

    <!-- 查看/修改对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出车日期" prop="recordDate">
              <el-date-picker
                v-model="dialogForm.recordDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="选择出车日期"
                style="width: 100%"
                :disabled="dialogMode === 'view'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用车单位" prop="useUnit">
              <el-input v-model="dialogForm.useUnit" placeholder="请输入用车单位" :disabled="dialogMode === 'view'" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="乘车人" prop="passengers">
              <el-input v-model="dialogForm.passengers" placeholder="请输入乘车人" :disabled="dialogMode === 'view'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="批准人" prop="approver">
              <el-input v-model="dialogForm.approver" placeholder="请输入批准人" :disabled="dialogMode === 'view'" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="用车事由" prop="reason">
          <el-input
            v-model="dialogForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入用车事由"
            :disabled="dialogMode === 'view'"
          />
        </el-form-item>
        <el-form-item label="出车地点" prop="departurePlace">
          <el-input v-model="dialogForm.departurePlace" placeholder="请输入出车地点" :disabled="dialogMode === 'view'" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="驾驶人" prop="driverId">
              <el-select
                v-model="dialogForm.driverId"
                placeholder="请选择驾驶人"
                style="width: 100%"
                :disabled="dialogMode === 'view'"
              >
                <el-option
                  v-for="driver in driverList"
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
                v-model="dialogForm.vehicleId"
                placeholder="请选择车牌号"
                style="width: 100%"
                :disabled="dialogMode === 'view'"
              >
                <el-option
                  v-for="vehicle in vehicleList"
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
                v-model="dialogForm.departureTime"
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                placeholder="选择出车时间"
                style="width: 100%"
                :disabled="dialogMode === 'view'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收车时间" prop="returnTime">
              <el-time-picker
                v-model="dialogForm.returnTime"
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                placeholder="选择收车时间"
                style="width: 100%"
                :disabled="dialogMode === 'view'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出车公里数" prop="startMileage">
              <el-input-number
                v-model="dialogForm.startMileage"
                :min="0"
                :precision="2"
                placeholder="请输入出车公里数"
                style="width: 100%"
                :disabled="dialogMode === 'view'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收车公里数" prop="endMileage">
              <el-input-number
                v-model="dialogForm.endMileage"
                :min="0"
                :precision="2"
                placeholder="请输入收车公里数"
                style="width: 100%"
                :disabled="dialogMode === 'view'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="是否值班" prop="isDuty">
          <el-switch
            v-model="dialogForm.isDuty"
            active-text="是"
            inactive-text="否"
            :disabled="dialogMode === 'view'"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="dialogForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
            :disabled="dialogMode === 'view'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button v-if="dialogMode === 'edit'" type="primary" @click="handleDialogSubmit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getMonthlyDetail, getMonthlyStatistics, getDispatchRecordById, updateDispatchRecord } from '@/api/dispatch'
import { getActiveDrivers } from '@/api/driver'
import { getAllFeeStandards } from '@/api/feestandard'
import { getAvailableVehicles } from '@/api/vehicle'

export default {
  name: 'MonthlyDetail',
  data() {
    return {
      currentMonth: new Date().toISOString().slice(0, 7),
      tableData: [],
      summary: {
        totalCount: 0,
        totalMileage: 0,
        totalAmount: 0
      },
      loading: false,
      driverList: [],
      selectedDriverId: null,
      workDays: 22,
      dailySafetyBonus: 0,
      mileageUnitPrice: 0,
      restDays: [], // 公休日期列表
      dailyWage: 0, // 每日工资
      restDayWage: 0, // 公休日工资标准
      tableHeight: 600,
      // 对话框相关
      dialogVisible: false,
      dialogMode: 'view', // view 或 edit
      dialogForm: {
        id: null,
        recordDate: '',
        driverId: null,
        vehicleId: null,
        useUnit: '',
        passengers: '',
        reason: '',
        departurePlace: '',
        leader: '',
        approver: '',
        departureTime: '',
        returnTime: '',
        startMileage: 0,
        endMileage: 0,
        isDuty: false,
        remark: ''
      },
      dialogRules: {
        recordDate: [{ required: true, message: '请选择出车日期', trigger: 'change' }],
        driverId: [{ required: true, message: '请选择驾驶人', trigger: 'change' }],
        vehicleId: [{ required: true, message: '请选择车牌号', trigger: 'change' }],
        departureTime: [{ required: true, message: '请选择出车时间', trigger: 'change' }],
        returnTime: [{ required: true, message: '请选择收车时间', trigger: 'change' }]
      },
      vehicleList: []
    }
  },
  computed: {
    ...mapGetters('user', ['driverId', 'userRole']),

    isAdmin() {
      return this.userRole === 'ADMIN'
    },

    dialogTitle() {
      return this.dialogMode === 'view' ? '查看派车记录' : '修改派车记录'
    }
  },
  watch: {
    selectedDriverId(newVal) {
      console.log('selectedDriverId changed:', newVal)
      if (newVal) {
        // 保存选择的驾驶员ID到Vuex
        this.$store.commit('user/SET_SELECTED_DRIVER_ID', newVal)
        this.loadData()
      }
    }
  },
  async mounted() {
    this.calculateTableHeight()
    window.addEventListener('resize', this.calculateTableHeight)
    if (this.isAdmin) {
      await this.loadDriverList()
    }
    this.loadData()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.calculateTableHeight)
  },
  methods: {
    calculateTableHeight() {
      // 计算表格高度：页面高度减去头部、卡片头部、底部统计等元素的高度
      const headerHeight = 60 // 页面头部高度
      const cardHeaderHeight = 60 // 卡片头部高度
      const footerHeight = 100 // 底部统计高度
      const padding = 40 // 上下边距
      const minHeight = 400 // 最小高度

      this.tableHeight = window.innerHeight - headerHeight - cardHeaderHeight - footerHeight - padding
      if (this.tableHeight < minHeight) {
        this.tableHeight = minHeight
      }
    },
    async loadDriverList() {
      try {
        console.log('开始加载驾驶员列表...')
        const res = await getActiveDrivers()
        console.log('驾驶员列表响应:', res)
        if (res.code === 200) {
          this.driverList = res.data || []
          console.log('驾驶员列表:', this.driverList)

          // 获取当前登录用户的驾驶员ID
          const currentDriverId = this.$store.getters['user/driverId']
          // 获取之前选择的驾驶员ID
          const savedSelectedDriverId = this.$store.getters['user/selectedDriverId']
          console.log('当前登录用户的驾驶员ID:', currentDriverId)
          console.log('之前选择的驾驶员ID:', savedSelectedDriverId)

          if (this.driverList.length > 0) {
            // 如果是驾驶员用户，则只显示自己的数据
            if (this.$store.getters['user/userRole'] === 'DRIVER' && currentDriverId) {
              // 检查驾驶员列表中是否包含当前驾驶员
              const hasCurrentDriver = this.driverList.some(d => d.id === currentDriverId)
              if (hasCurrentDriver) {
                this.selectedDriverId = currentDriverId
                console.log('驾驶员用户，选择自己的驾驶员ID:', this.selectedDriverId)
              } else {
                this.selectedDriverId = this.driverList[0].id
                console.log('驾驶员列表中不包含当前驾驶员，选择第一个驾驶员ID:', this.selectedDriverId)
              }
            } else {
              // 管理员用户，优先使用之前选择的驾驶员ID
              if (savedSelectedDriverId) {
                // 检查之前选择的驾驶员是否还在列表中
                const hasSavedDriver = this.driverList.some(d => d.id === savedSelectedDriverId)
                if (hasSavedDriver) {
                  this.selectedDriverId = savedSelectedDriverId
                  console.log('管理员用户，使用之前选择的驾驶员ID:', this.selectedDriverId)
                } else {
                  this.selectedDriverId = this.driverList[0].id
                  console.log('之前选择的驾驶员不在列表中，选择第一个驾驶员ID:', this.selectedDriverId)
                }
              } else {
                this.selectedDriverId = this.driverList[0].id
                console.log('管理员用户，没有之前选择的驾驶员ID，选择第一个驾驶员ID:', this.selectedDriverId)
              }
            }
          } else {
            console.log('驾驶员列表为空')
          }
        } else {
          console.log('驾驶员列表加载失败，code:', res.code)
        }
      } catch (error) {
        console.error('加载驾驶员列表失败:', error)
      }
    },

    async loadData() {
      if (!this.currentMonth) return

      this.loading = true
      try {
        const [year, month] = this.currentMonth.split('-')
        console.log('loadData - 开始加载数据')
        console.log('loadData - 当前月份:', this.currentMonth)

        // 获取费用标准，从费用标准中读取工作天数
        try {
          const feeRes = await getAllFeeStandards()
          console.log('loadData - 费用标准响应:', feeRes)
          if (feeRes.code === 200 && feeRes.data) {
            console.log('loadData - 费用标准数据:', feeRes.data)
            // 打印每个费用标准的详细信息
            feeRes.data.forEach(item => {
              console.log('loadData - 费用标准项:', item.configKey, item.configValue)
            })
            const workDays = feeRes.data.find(item => item.configKey === 'monthly_working_days')
            const safetyBonusStandard = feeRes.data.find(item => item.configKey === 'safety_bonus_standard')
            const mileageUnitPrice = feeRes.data.find(item => item.configKey === 'mileage_unit_price')
            const currentMonthRestDays = feeRes.data.find(item => item.configKey === 'current_month_rest_days')
            const restDayWageStandard = feeRes.data.find(item => item.configKey === 'rest_day_wage')
            console.log('loadData - workDays:', workDays)
            console.log('loadData - safetyBonusStandard:', safetyBonusStandard)
            console.log('loadData - mileageUnitPrice:', mileageUnitPrice)
            console.log('loadData - currentMonthRestDays:', currentMonthRestDays)
            console.log('loadData - restDayWageStandard:', restDayWageStandard)

            if (workDays) {
              this.workDays = parseInt(workDays.configValue) || 22
              console.log('loadData - 设置workDays:', this.workDays)
            }

            if (safetyBonusStandard) {
              const totalSafetyBonus = parseFloat(safetyBonusStandard.configValue) || 0
              this.dailySafetyBonus = totalSafetyBonus / this.workDays
              console.log('loadData - 设置dailySafetyBonus:', this.dailySafetyBonus)
            }

            if (mileageUnitPrice) {
              this.mileageUnitPrice = parseFloat(mileageUnitPrice.configValue) || 0
              console.log('loadData - 设置mileageUnitPrice:', this.mileageUnitPrice)
            }

            if (restDayWageStandard) {
              this.restDayWage = parseFloat(restDayWageStandard.configValue) || 0
              console.log('loadData - 设置restDayWage:', this.restDayWage)
            } else {
              this.restDayWage = 0
              console.log('loadData - 未设置公休日工资标准')
            }

            if (currentMonthRestDays && currentMonthRestDays.configValue) {
              // 解析当月公休日期，逗号分隔
              const restDaysStr = String(currentMonthRestDays.configValue)
              this.restDays = restDaysStr.split(',').map(date => date.trim())
              console.log('loadData - 设置restDays:', this.restDays)
              console.log('loadData - restDays原始值:', currentMonthRestDays.configValue)
            } else {
              this.restDays = []
              console.log('loadData - 未设置当月公休日期')
            }
          }
        } catch (error) {
          console.error('loadData - 获取费用标准失败:', error)
        }

        // 管理员使用选择的驾驶员ID，驾驶员使用自己的ID
        const driverId = this.isAdmin ? this.selectedDriverId : this.driverId
        console.log('loadData - isAdmin:', this.isAdmin)
        console.log('loadData - selectedDriverId:', this.selectedDriverId)
        console.log('loadData - driverId:', this.driverId)
        console.log('loadData - 最终使用的driverId:', driverId)

        if (!driverId) {
          console.log('loadData - driverId为空，返回')
          this.tableData = []
          this.summary = {
            totalCount: 0,
            totalMileage: 0,
            totalAmount: 0
          }
          return
        }

        // 获取驾驶员信息，包括每日工资
        try {
          const driverRes = await getDriverById(driverId)
          if (driverRes.code === 200 && driverRes.data) {
            // 尝试使用驼峰和下划线两种命名方式
            this.dailyWage = parseFloat(driverRes.data.dailyWage || driverRes.data.daily_wage) || 0
            console.log('loadData - 设置dailyWage:', this.dailyWage)
            console.log('loadData - 驾驶员完整数据:', driverRes.data)
          }
        } catch (error) {
          console.error('loadData - 获取驾驶员信息失败:', error)
        }

        // 加载详细记录
        const params = {
          driverId: driverId,
          year: parseInt(year),
          month: parseInt(month)
        }
        console.log('loadData - 请求参数:', params)
        const detailRes = await getMonthlyDetail(params)
        console.log('loadData - 详细记录响应:', detailRes)

        if (detailRes.code === 200) {
          this.tableData = detailRes.data || []
          console.log('loadData - 排序前表格数据:', this.tableData)
          // 按日期升序排序，确保单元格合并逻辑正确
          this.tableData.sort((a, b) => {
            return new Date(a.recordDate) - new Date(b.recordDate)
          })
          console.log('loadData - 排序后表格数据:', this.tableData)
          console.log('loadData - 第一条记录:', this.tableData[0])
          console.log('loadData - 第一条记录的recordDate:', this.tableData[0].recordDate)
          console.log('loadData - 第一条记录的id:', this.tableData[0].id)
          console.log('loadData - 第二条记录:', this.tableData[1])
          console.log('loadData - 第二条记录的recordDate:', this.tableData[1].recordDate)
          console.log('loadData - 第二条记录的id:', this.tableData[1].id)
          console.log('loadData - 两条记录的recordDate是否相同:', this.tableData[0].recordDate === this.tableData[1].recordDate)
          
          // 手动测试合并方法
          console.log('loadData - 手动测试合并方法')
          const testResult1 = this.dutySubsidySpanMethod({ row: this.tableData[0], rowIndex: 0 })
          const testResult2 = this.dutySubsidySpanMethod({ row: this.tableData[1], rowIndex: 1 })
          console.log('loadData - 第一条记录的合并结果:', testResult1)
          console.log('loadData - 第二条记录的合并结果:', testResult2)
        } else {
          console.log('loadData - 详细记录加载失败，code:', detailRes.code)
        }

        // 加载统计数据
        const statsRes = await getMonthlyStatistics({
          driverId: driverId,
          year: parseInt(year),
          month: parseInt(month)
        })
        console.log('loadData - 统计数据响应:', statsRes)

        if (statsRes.code === 200 && statsRes.data) {
          const stats = statsRes.data
          this.summary.totalCount = stats.total_count || 0
          this.summary.totalMileage = stats.total_mileage || 0
          this.summary.totalAmount = stats.total_amount || 0
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        this.loading = false
      }
    },

    handleViewStatistics() {
      // 获取当前选择的驾驶员ID
      const driverId = this.isAdmin ? this.selectedDriverId : this.driverId
      if (!driverId) {
        this.$message.warning('请先选择驾驶员')
        return
      }

      // 跳转到个人统计页面，并传递driverId
      this.$router.push({
        path: '/driver/statistics',
        query: {
          driverId: driverId
        }
      })
    },

    async handleView(row) {
      try {
        this.dialogMode = 'view'
        this.dialogVisible = true
        await this.loadVehicleList()
        // 加载记录详情
        const res = await getDispatchRecordById(row.id)
        if (res.code === 200 && res.data) {
          this.dialogForm = {
            id: res.data.id,
            recordDate: res.data.recordDate,
            driverId: res.data.driverId,
            vehicleId: res.data.vehicleId,
            useUnit: res.data.useUnit || '',
            passengers: res.data.passengers || '',
            reason: res.data.reason || '',
            departurePlace: res.data.departurePlace || '',
            leader: res.data.leader || '',
            approver: res.data.approver || '',
            departureTime: res.data.departureTime || '',
            returnTime: res.data.returnTime || '',
            startMileage: res.data.startMileage || 0,
            endMileage: res.data.endMileage || 0,
            isDuty: res.data.isDuty === 1,
            remark: res.data.remark || ''
          }
        }
      } catch (error) {
        console.error('加载记录详情失败:', error)
        this.$message.error('加载记录详情失败')
      }
    },

    async handleEdit(row) {
      try {
        this.dialogMode = 'edit'
        this.dialogVisible = true
        await this.loadVehicleList()
        // 加载记录详情
        const res = await getDispatchRecordById(row.id)
        if (res.code === 200 && res.data) {
          this.dialogForm = {
            id: res.data.id,
            recordDate: res.data.recordDate,
            driverId: res.data.driverId,
            vehicleId: res.data.vehicleId,
            useUnit: res.data.useUnit || '',
            passengers: res.data.passengers || '',
            reason: res.data.reason || '',
            departurePlace: res.data.departurePlace || '',
            leader: res.data.leader || '',
            approver: res.data.approver || '',
            departureTime: res.data.departureTime || '',
            returnTime: res.data.returnTime || '',
            startMileage: res.data.startMileage || 0,
            endMileage: res.data.endMileage || 0,
            isDuty: res.data.isDuty === 1,
            remark: res.data.remark || ''
          }
        }
      } catch (error) {
        console.error('加载记录详情失败:', error)
        this.$message.error('加载记录详情失败')
      }
    },

    async loadVehicleList() {
      try {
        const res = await getAvailableVehicles()
        if (res.code === 200) {
          this.vehicleList = res.data || []
        }
      } catch (error) {
        console.error('加载车辆列表失败:', error)
      }
    },

    handleDialogClose() {
      this.$refs.dialogFormRef?.resetFields()
      this.dialogForm = {
        id: null,
        recordDate: '',
        driverId: null,
        vehicleId: null,
        useUnit: '',
        passengers: '',
        reason: '',
        departurePlace: '',
        leader: '',
        approver: '',
        departureTime: '',
        returnTime: '',
        startMileage: 0,
        endMileage: 0,
        isDuty: false,
        remark: ''
      }
    },

    async handleDialogSubmit() {
      try {
        await this.$refs.dialogFormRef.validate()
        const submitData = {
          ...this.dialogForm,
          isDuty: this.dialogForm.isDuty ? 1 : 0
        }
        const res = await updateDispatchRecord(this.dialogForm.id, submitData)
        if (res.code === 200) {
          this.$message.success('修改成功')
          this.dialogVisible = false
          this.loadData()
        } else {
          this.$message.error(res.msg || '修改失败')
        }
      } catch (error) {
        if (error !== false) {
          console.error('修改失败:', error)
          this.$message.error('修改失败')
        }
      }
    },

    exportExcel() {
      // 导入exceljs库
      import('exceljs').then(ExcelJS => {
        // 准备表头
        const headers = [
          '日期', '驾驶人', '车辆', '出车时间', '收车时间',
          '出车公里数', '收车公里数', '合计公里数', '公里补贴',
          '事由', '乘车人', '上班前加班', '下班后加班', '加班时间',
          '小时加班金额', '值班补贴', '公休日工资', '节假日工资', '安全奖', '合计'
        ]

        // 准备数据
        const data = this.tableData.map((row, index) => {
          return [
            this.formatDateForExcel(row.recordDate),
            row.driverName || '',
            row.plateNumber || '',
            row.departureTime || '',
            row.returnTime || '',
            row.startMileage || 0,
            row.endMileage || 0,
            row.totalMileage || 0,
            (row.bridgeRepairFee || 0).toFixed(2),
            row.reason || '',
            row.passengers || '',
            (row.earlyOvertimeHours || 0) + '小时',
            (row.lateOvertimeHours || 0) + '小时',
            (row.overtimeHours || 0) + '小时',
            '¥' + (parseFloat(row.overtimeAmount) || 0).toFixed(2),
            '¥' + (this.isFirstRecordOfDay(row, index) ? (parseFloat(row.dutySubsidy) || 0).toFixed(2) : '0.00'),
            '¥' + ((this.isFirstRecordOfDay(row, index) && this.isRestDay(row.recordDate)) ? (this.restDayWage || 0).toFixed(2) : '0.00'),
            '¥' + (parseFloat(row.holidayWage) || 0).toFixed(2),
            '¥' + (this.isFirstRecordOfDay(row, index) ? (this.dailySafetyBonus || 0).toFixed(2) : '0.00'),
            '¥' + this.calculateTotalSubsidy(row, index)
          ]
        })

        // 添加统计信息
        data.push([]) // 空行
        data.push(['小时加班总金额', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '¥' + this.calculateTotalOvertimeAmount()])
        data.push(['值班总补贴', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '¥' + this.calculateTotalDutySubsidy()])
        data.push(['公休日工资', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '¥' + this.calculateTotalRestDayWage()])
        data.push(['节假日工资', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '¥' + this.calculateTotalHolidayWage()])
        data.push(['总安全奖', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '¥' + this.calculateTotalSafetyBonus()])
        data.push(['总合计', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '¥' + this.calculateTotalAmount()])
        data.push([]) // 空行
        data.push(['本月出车次数', this.summary.totalCount || 0 + '次', '', '', '', '', '', '', '', '', '', '', '', '', '', ''])
        data.push(['本月总里程', '', '', '', '', '', '', (this.summary.totalMileage || 0) + '公里', '', '', '', '', '', '', '', '', '', ''])
        data.push(['本月公里费用', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '¥' + this.calculateMileageFee()])
        data.push(['本月总收入', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '¥' + this.calculateTotalIncome()])

        // 创建工作簿和工作表
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('月度详细记录')
        
        // 定义边框样式
        const borderStyle = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
        
        // 添加表头
        const headerRow = worksheet.addRow(headers)
        headerRow.eachCell((cell) => {
          cell.border = borderStyle
          cell.font = { bold: true }
        })
        
        // 添加数据
        data.forEach(row => {
          const dataRow = worksheet.addRow(row)
          dataRow.eachCell((cell) => {
            cell.border = borderStyle
          })
        })

        // 生成文件名
        const driverName = this.driverList.find(d => d.id === this.selectedDriverId)?.name || '驾驶员'
        const fileName = `${driverName}_${this.currentMonth}_月度详细记录.xlsx`

        // 导出文件
        workbook.xlsx.writeBuffer().then(buffer => {
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = fileName
          link.click()
          window.URL.revokeObjectURL(url)
        })
      })
    },

    // 判断是否是当天的第一条记录
    isFirstRecordOfDay(row, index) {
      if (index === 0) {
        return true // 第一条记录肯定是当天的第一条
      }
      const currentRecordDate = row.recordDate
      const previousRecordDate = this.tableData[index - 1].recordDate
      return currentRecordDate !== previousRecordDate
    },

    // 判断当前行是否被合并单元格隐藏
    isHiddenBySpan(row, index) {
      // 如果不是当天的第一条记录，则被隐藏
      return !this.isFirstRecordOfDay(row, index)
    },

    // 格式化日期显示（表格中只显示月-日）
    formatDate(dateStr) {
      if (!dateStr) return ''
      // 如果已经是日期格式（yyyy-MM-dd），只返回月-日
      if (typeof dateStr === 'string' && dateStr.includes('-')) {
        const parts = dateStr.split('-')
        if (parts.length === 3) {
          return `${parts[1]}-${parts[2]}`
        }
      }
      // 如果是Date对象，格式化为MM-dd
      if (dateStr instanceof Date) {
        const month = String(dateStr.getMonth() + 1).padStart(2, '0')
        const day = String(dateStr.getDate()).padStart(2, '0')
        return `${month}-${day}`
      }
      return dateStr
    },

    // 格式化日期显示（导出Excel时显示完整的年-月-日）
    formatDateForExcel(dateStr) {
      if (!dateStr) return ''
      // 如果已经是日期格式（yyyy-MM-dd），直接返回
      if (typeof dateStr === 'string' && dateStr.includes('-')) {
        const parts = dateStr.split('-')
        if (parts.length === 3) {
          return `${parts[0]}-${parts[1]}-${parts[2]}`
        }
      }
      // 如果是Date对象，格式化为yyyy-MM-dd
      if (dateStr instanceof Date) {
        const year = dateStr.getFullYear()
        const month = String(dateStr.getMonth() + 1).padStart(2, '0')
        const day = String(dateStr.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      return dateStr
    },

    // 计算合计（安全奖和值班补贴只计算当天的第一条记录）
    calculateTotalSubsidy(row, index) {
      const overtimeAmount = parseFloat(row.overtimeAmount) || 0
      const dutySubsidy = this.isFirstRecordOfDay(row, index) ? (parseFloat(row.dutySubsidy) || 0) : 0
      const holidayWage = parseFloat(row.holidayWage) || 0

      // 公休日工资按月汇总计算，不在每日记录中计算
      // 安全奖不在这里计算，而是在calculateTotalSafetyBonus中统一计算
      return (overtimeAmount + dutySubsidy + holidayWage).toFixed(2)
    },

    // 计算本月公里费用
    calculateMileageFee() {
      const totalMileage = this.summary.totalMileage || 0
      const mileageUnitPrice = this.mileageUnitPrice || 0
      
      // 当每月总公里数小于5000公里时，按公里数*公里单价
      if (totalMileage <= 5000) {
        return (totalMileage * mileageUnitPrice).toFixed(2)
      }
      // 当每月公里数大于5000公里后，最大公里补贴为500元
      return '500.00'
    },

    // 计算除安全奖外的其他费用总和
    calculateTotalSubsidySum() {
      let sum = 0
      // 使用Set记录已处理的日期，避免重复计算
      const processedDates = new Set()
      
      this.tableData.forEach((row, index) => {
        const recordDate = row.recordDate
        // 只计算每天第一条记录的合计
        if (this.isFirstRecordOfDay(row, index) && !processedDates.has(recordDate)) {
          processedDates.add(recordDate)
          sum += parseFloat(this.calculateTotalSubsidy(row, index))
        }
      })
      
      // 加上公休日工资（按月汇总计算）
      sum += parseFloat(this.calculateTotalRestDayWage())

      return sum.toFixed(2)
    },

    // 计算本月总收入
    calculateTotalIncome() {
      // 本月总收入 = 总合计（已包含加班费、值班补贴、公休日工资、节假日工资、安全奖）
      // 注意：总合计已经包含了所有费用，不需要再加公里费用
      const totalAmount = parseFloat(this.calculateTotalAmount())
      return totalAmount.toFixed(2)
    },

    // 计算小时加班总金额
    calculateTotalOvertimeAmount() {
      let sum = 0
      this.tableData.forEach(row => {
        sum += parseFloat(row.overtimeAmount) || 0
      })
      return sum.toFixed(2)
    },

    // 计算值班总补贴
    calculateTotalDutySubsidy() {
      let sum = 0
      const processedDates = new Set()
      this.tableData.forEach((row, index) => {
        if (this.isFirstRecordOfDay(row, index) && !processedDates.has(row.recordDate)) {
          processedDates.add(row.recordDate)
          sum += parseFloat(row.dutySubsidy) || 0
        }
      })
      return sum.toFixed(2)
    },

    // 计算公休日工资
    calculateTotalRestDayWage() {
      // 计算实际出勤天数
      const actualWorkDays = this.calculateActualWorkDays()
      console.log('calculateTotalRestDayWage - 实际出勤天数:', actualWorkDays)
      console.log('calculateTotalRestDayWage - 标准工作天数:', this.workDays)

      // 计算公休日工资
      let restDayWage = 0
      if (actualWorkDays > this.workDays) {
        // 实际出勤天数 > 标准工作天数：驾驶员在应休假的日期里也上班了，发放公休日工资
        const overtimeDays = actualWorkDays - this.workDays
        restDayWage = overtimeDays * this.restDayWage
        console.log('calculateTotalRestDayWage - 加班天数:', overtimeDays, '公休日工资:', restDayWage)
      } else if (actualWorkDays < this.workDays) {
        // 实际出勤天数 < 标准工作天数：驾驶员除了正常的每月休假外还请了假，扣除多休天数的工资
        const leaveDays = this.workDays - actualWorkDays
        restDayWage = -(leaveDays * this.dailyWage)
        console.log('calculateTotalRestDayWage - 请假天数:', leaveDays, '扣除工资:', restDayWage)
      } else {
        // 实际出勤天数 = 标准工作天数：正常情况，不发放公休日工资，也不扣除工资
        console.log('calculateTotalRestDayWage - 正常情况，不发放公休日工资，也不扣除工资')
      }

      return restDayWage.toFixed(2)
    },

    // 计算节假日工资
    calculateTotalHolidayWage() {
      let sum = 0
      this.tableData.forEach(row => {
        sum += parseFloat(row.holidayWage) || 0
      })
      return sum.toFixed(2)
    },

    // 判断某天是否是公休日
    isRestDay(date) {
      const dateStr = typeof date === 'string' ? date : date.toISOString().slice(0, 10)
      const isRest = this.restDays.includes(dateStr)
      console.log('isRestDay - date:', dateStr, 'isRest:', isRest, 'restDays:', this.restDays)
      return isRest
    },

    // 计算实际出勤天数（每天只计算一次）
    calculateActualWorkDays() {
      let actualWorkDays = 0
      const processedDates = new Set()
      this.tableData.forEach((row, index) => {
        if (this.isFirstRecordOfDay(row, index) && !processedDates.has(row.recordDate)) {
          processedDates.add(row.recordDate)
          actualWorkDays++
        }
      })
      return actualWorkDays
    },

    // 计算总安全奖
    calculateTotalSafetyBonus() {
      // 统计实际出勤天数（每天只计算一次）
      let actualWorkDays = this.calculateActualWorkDays()

      // 计算实际安全奖（按实际出勤天数计算）
      const actualSafetyBonus = this.dailySafetyBonus * actualWorkDays

      // 确保不超过安全奖标准（dailySafetyBonus * workDays）
      const maxSafetyBonus = this.dailySafetyBonus * this.workDays
      const finalSafetyBonus = Math.min(actualSafetyBonus, maxSafetyBonus)

      return finalSafetyBonus.toFixed(2)
    },

    // 计算总合计
    calculateTotalAmount() {
      // calculateTotalSubsidySum已经不包含安全奖了
      const otherAmount = parseFloat(this.calculateTotalSubsidySum())
      const totalSafetyBonus = parseFloat(this.calculateTotalSafetyBonus())
      const mileageFee = parseFloat(this.calculateMileageFee())
      const baseSalary = parseFloat(this.baseSalary) || 0

      // 总合计 = 其他费用 + 安全奖 + 公里费用 + 底薪
      return (otherAmount + totalSafetyBonus + mileageFee + baseSalary).toFixed(2)
    },

    // 表格单元格合并方法
    tableSpanMethod({ row, column, rowIndex, columnIndex }) {
      console.log('tableSpanMethod - rowIndex:', rowIndex, 'columnIndex:', columnIndex, 'column.property:', column.property, 'recordDate:', row.recordDate)
      
      // 如果返回[0, 0]，则不渲染该单元格
      if (columnIndex === undefined || rowIndex === undefined) {
        return [1, 1]
      }
      
      // 操作列合并
      if (column.label === '操作') {
        if (this.isFirstRecordOfDay(row, rowIndex)) {
          // 计算当天有多少条记录
          let rowCount = 1
          for (let i = rowIndex + 1; i < this.tableData.length; i++) {
            if (this.tableData[i].recordDate === row.recordDate) {
              rowCount++
            } else {
              break
            }
          }
          console.log('tableSpanMethod - 操作列合并', rowCount, '行')
          return [rowCount, 1] // 合并rowCount行，1列
        } else {
          console.log('tableSpanMethod - 操作列不显示')
          return [0, 0] // 不显示
        }
      }
      // 值班补贴列
      if (column.property === 'dutySubsidy') {
        if (this.isFirstRecordOfDay(row, rowIndex)) {
          // 计算当天有多少条记录
          let rowCount = 1
          for (let i = rowIndex + 1; i < this.tableData.length; i++) {
            if (this.tableData[i].recordDate === row.recordDate) {
              rowCount++
            } else {
              break
            }
          }
          console.log('tableSpanMethod - 值班补贴列合并', rowCount, '行')
          return [rowCount, 1] // 合并rowCount行，1列
        } else {
          console.log('tableSpanMethod - 值班补贴列不显示')
          return [0, 0] // 不显示
        }
      }
      // 公休日工资列
      if (column.property === 'restDayWage') {
        // 只在公休日才合并单元格
        if (this.isFirstRecordOfDay(row, rowIndex) && this.isRestDay(row.recordDate)) {
          // 计算当天有多少条记录
          let rowCount = 1
          for (let i = rowIndex + 1; i < this.tableData.length; i++) {
            if (this.tableData[i].recordDate === row.recordDate) {
              rowCount++
            } else {
              break
            }
          }
          console.log('tableSpanMethod - 公休日工资列合并', rowCount, '行')
          return [rowCount, 1] // 合并rowCount行，1列
        } else {
          console.log('tableSpanMethod - 公休日工资列不合并')
          return [1, 1] // 不合并，正常显示
        }
      }
      // 节假日工资列
      if (column.property === 'holidayWage') {
        if (this.isFirstRecordOfDay(row, rowIndex)) {
          // 计算当天有多少条记录
          let rowCount = 1
          for (let i = rowIndex + 1; i < this.tableData.length; i++) {
            if (this.tableData[i].recordDate === row.recordDate) {
              rowCount++
            } else {
              break
            }
          }
          console.log('tableSpanMethod - 节假日工资列合并', rowCount, '行')
          return [rowCount, 1] // 合并rowCount行，1列
        } else {
          console.log('tableSpanMethod - 节假日工资列不显示')
          return [0, 0] // 不显示
        }
      }
      // 安全奖列
      if (column.property === 'safetyBonus') {
        if (this.isFirstRecordOfDay(row, rowIndex)) {
          // 计算当天有多少条记录
          let rowCount = 1
          for (let i = rowIndex + 1; i < this.tableData.length; i++) {
            if (this.tableData[i].recordDate === row.recordDate) {
              rowCount++
            } else {
              break
            }
          }
          console.log('tableSpanMethod - 安全奖列合并', rowCount, '行')
          return [rowCount, 1] // 合并rowCount行，1列
        } else {
          console.log('tableSpanMethod - 安全奖列不显示')
          return [0, 0] // 不显示
        }
      }
      // 合计列
      if (column.label === '合计') {
        if (this.isFirstRecordOfDay(row, rowIndex)) {
          // 计算当天有多少条记录
          let rowCount = 1
          for (let i = rowIndex + 1; i < this.tableData.length; i++) {
            if (this.tableData[i].recordDate === row.recordDate) {
              rowCount++
            } else {
              break
            }
          }
          console.log('tableSpanMethod - 合计列合并', rowCount, '行')
          return [rowCount, 1] // 合并rowCount行，1列
        } else {
          console.log('tableSpanMethod - 合计列不显示')
          return [0, 0] // 不显示
        }
      }
      // 其他列不合并
      return [1, 1]
    },

    // 值班补贴列的单元格合并方法
    dutySubsidySpanMethod({ row, column, rowIndex, columnIndex }) {
      console.log('dutySubsidySpanMethod - rowIndex:', rowIndex, 'recordDate:', row.recordDate)
      if (this.isFirstRecordOfDay(row, rowIndex)) {
        // 计算当天有多少条记录
        let rowCount = 1
        for (let i = rowIndex + 1; i < this.tableData.length; i++) {
          if (this.tableData[i].recordDate === row.recordDate) {
            rowCount++
          } else {
            break
          }
        }
        console.log('dutySubsidySpanMethod - 合并', rowCount, '行')
        return [rowCount, 1] // 合并rowCount行，1列
      } else {
        console.log('dutySubsidySpanMethod - 不显示')
        return [0, 0] // 不显示
      }
    },

    // 安全奖列的单元格合并方法
    safetyBonusSpanMethod({ row, column, rowIndex, columnIndex }) {
      console.log('safetyBonusSpanMethod - rowIndex:', rowIndex, 'recordDate:', row.recordDate)
      if (this.isFirstRecordOfDay(row, rowIndex)) {
        // 计算当天有多少条记录
        let rowCount = 1
        for (let i = rowIndex + 1; i < this.tableData.length; i++) {
          if (this.tableData[i].recordDate === row.recordDate) {
            rowCount++
          } else {
            break
          }
        }
        console.log('safetyBonusSpanMethod - 合并', rowCount, '行')
        return [rowCount, 1] // 合并rowCount行，1列
      } else {
        console.log('safetyBonusSpanMethod - 不显示')
        return [0, 0] // 不显示
      }
    }
  }
}
</script>

<style scoped lang="scss">
.monthly-detail {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .table-container {
    margin-bottom: 20px;
    
    // 确保合并单元格时被隐藏的单元格不显示内容
    :deep(.el-table__cell) {
      &.hidden {
        display: none !important;
      }
    }
  }

  .table-footer {
    margin-top: 20px;
  }
}
</style>
