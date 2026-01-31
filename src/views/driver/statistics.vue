<template>
  <div class="driver-statistics">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff;">
              <el-icon :size="24"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.monthlyCount || 0 }}</div>
              <div class="stat-label">本月出车次数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a;">
              <el-icon :size="24"><Odometer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.monthlyMileage || 0 }}</div>
              <div class="stat-label">本月总里程(公里)</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #91cc75;">
              <el-icon :size="24"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ statistics.totalOvertimeAmount || 0 }}</div>
              <div class="stat-label">小时加班总金额</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #fac858;">
              <el-icon :size="24"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ statistics.totalDutySubsidy || 0 }}</div>
              <div class="stat-label">值班总补贴</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #73c0de;">
              <el-icon :size="24"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ statistics.totalRestDayWage || 0 }}</div>
              <div class="stat-label">公休日工资</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #3ba272;">
              <el-icon :size="24"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ statistics.totalHolidayWage || 0 }}</div>
              <div class="stat-label">节假日工资</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #ee6666;">
              <el-icon :size="24"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ statistics.dailySafetyBonus || 0 }}</div>
              <div class="stat-label">每日安全奖</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #fc8452;">
              <el-icon :size="24"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ statistics.totalSafetyBonus || 0 }}</div>
              <div class="stat-label">总安全奖</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #9a60b4;">
              <el-icon :size="24"><Odometer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ statistics.mileageFee || 0 }}</div>
              <div class="stat-label">本月公里费用</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c;">
              <el-icon :size="24"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ statistics.totalAmount || 0 }}</div>
              <div class="stat-label">总合计</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c;">
              <el-icon :size="24"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ statistics.monthlyIncome || 0 }}</div>
              <div class="stat-label">本月总收入</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>月度收入趋势</span>
            </div>
          </template>
          <div ref="incomeChart" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>收入构成</span>
            </div>
          </template>
          <div ref="compositionChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>历史数据对比</span>
            </div>
          </template>
          <div ref="historyChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { mapGetters } from 'vuex'
import { getMonthlyStatistics, getMonthlyDetail } from '@/api/dispatch'
import { getAllFeeStandards } from '@/api/feestandard'
import { getDriverById } from '@/api/driver'

export default {
  name: 'DriverStatistics',
  data() {
    return {
      statistics: {
        monthlyCount: 0,
        monthlyMileage: 0,
        monthlyIncome: 0,
        totalAmount: 0,
        totalOvertimeAmount: 0,
        totalDutySubsidy: 0,
        totalRestDayWage: 0,
        totalHolidayWage: 0,
        dailySafetyBonus: 0,
        totalSafetyBonus: 0,
        mileageFee: 0
      },
      incomeChart: null,
      compositionChart: null,
      historyChart: null,
      restDays: [], // 公休日期列表
      dailySafetyBonus: 0, // 每日安全奖
      workDays: 22, // 工作天数
      mileageUnitPrice: 0, // 公里单价
      restDayWage: 0, // 公休日工资
      monthlyDetailData: [], // 月度详细记录数据
      dailyWage: 0 // 每日工资
    }
  },
  computed: {
    ...mapGetters('user', ['driverId', 'selectedDriverId', 'selectedMonth']),
    // 优先使用Vuex中的selectedDriverId，其次使用URL传递的driverId，最后使用当前登录用户的driverId
    currentDriverId() {
      return this.selectedDriverId || this.$route.query.driverId || this.driverId
    }
  },
  watch: {
    selectedMonth() {
      console.log('selectedMonth changed, reloading statistics')
      this.loadCurrentMonthStatistics()
    }
  },
  mounted() {
    this.loadFeeStandards()
    this.loadCurrentMonthStatistics()
    this.initCharts()
  },
  beforeUnmount() {
    if (this.incomeChart) {
      this.incomeChart.dispose()
    }
    if (this.compositionChart) {
      this.compositionChart.dispose()
    }
    if (this.historyChart) {
      this.historyChart.dispose()
    }
  },
  methods: {
    async loadFeeStandards() {
      try {
        const res = await getAllFeeStandards()
        if (res.code === 200 && res.data) {
          const feeStandards = res.data

          // 获取工作天数
          const workDaysStandard = feeStandards.find(item => item.configKey === 'monthly_working_days')
          this.workDays = workDaysStandard ? parseInt(workDaysStandard.configValue) || 22 : 22

          // 获取安全奖标准
          const safetyBonusStandard = feeStandards.find(item => item.configKey === 'safety_bonus_standard')
          const totalSafetyBonus = safetyBonusStandard ? parseFloat(safetyBonusStandard.configValue) || 0 : 0
          // 每日安全奖 = 安全奖标准 / 工作天数
          this.dailySafetyBonus = this.workDays > 0 ? totalSafetyBonus / this.workDays : 0

          // 获取公里单价
          const mileageUnitPriceStandard = feeStandards.find(item => item.configKey === 'mileage_unit_price')
          this.mileageUnitPrice = mileageUnitPriceStandard ? parseFloat(mileageUnitPriceStandard.configValue) || 0 : 0

          // 获取公休日工资
          const restDayWageStandard = feeStandards.find(item => item.configKey === 'rest_day_wage')
          this.restDayWage = restDayWageStandard ? parseFloat(restDayWageStandard.configValue) || 0 : 0

          // 获取公休日
          const currentMonthRestDays = feeStandards.find(item => item.configKey === 'current_month_rest_days')
          if (currentMonthRestDays && currentMonthRestDays.configValue) {
            const restDaysStr = String(currentMonthRestDays.configValue)
            this.restDays = restDaysStr.split(',').map(date => date.trim())
          } else {
            this.restDays = []
          }
        }
      } catch (error) {
        console.error('加载费用标准失败:', error)
      }
    },

    async loadCurrentMonthStatistics() {
      console.log('loadCurrentMonthStatistics - currentDriverId:', this.currentDriverId)
      console.log('loadCurrentMonthStatistics - driverId from Vuex:', this.driverId)
      console.log('loadCurrentMonthStatistics - route query:', this.$route.query)
      console.log('loadCurrentMonthStatistics - selectedMonth from Vuex:', this.selectedMonth)

      if (!this.currentDriverId) {
        console.log('loadCurrentMonthStatistics - currentDriverId is null, returning')
        return
      }

      // 使用 selectedMonth 或者当前月份
      const now = this.selectedMonth ? new Date(this.selectedMonth) : new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1

      console.log('loadCurrentMonthStatistics - year:', year, 'month:', month)

      try {
        // 获取月度详细记录
        const detailRes = await getMonthlyDetail({
          driverId: this.currentDriverId,
          year,
          month
        })

        console.log('loadCurrentMonthStatistics - detailRes:', detailRes)

        if (detailRes.code === 200 && detailRes.data) {
          const tableData = detailRes.data || []

          // 保存月度详细记录数据，用于收入构成图
          this.monthlyDetailData = tableData

          // 获取驾驶员信息，包括每日工资
          try {
            const driverRes = await getDriverById(this.currentDriverId)
            if (driverRes.code === 200 && driverRes.data) {
              // 尝试使用驼峰和下划线两种命名方式
              this.dailyWage = parseFloat(driverRes.data.dailyWage || driverRes.data.daily_wage) || 0
              console.log('loadCurrentMonthStatistics - 设置dailyWage:', this.dailyWage)
            }
          } catch (error) {
            console.error('loadCurrentMonthStatistics - 获取驾驶员信息失败:', error)
          }

          // 加载统计数据
          const statsRes = await getMonthlyStatistics({
            driverId: this.currentDriverId,
            year: parseInt(year),
            month: parseInt(month)
          })
          console.log('loadCurrentMonthStatistics - 统计数据响应:', statsRes)

          // 初始化总里程变量
          let totalMileage = 0

          if (statsRes.code === 200 && statsRes.data) {
            const stats = statsRes.data
            // 计算本月出车次数
            this.statistics.monthlyCount = stats.total_count || 0
            // 计算本月总里程
            totalMileage = stats.total_mileage || 0
            this.statistics.monthlyMileage = totalMileage.toFixed(2)
          } else {
            // 如果后端统计数据加载失败，则使用前端计算
            this.statistics.monthlyCount = tableData.length || 0
            totalMileage = tableData.reduce((sum, row) => sum + (parseFloat(row.totalMileage) || 0), 0)
            this.statistics.monthlyMileage = totalMileage.toFixed(2)
          }

          // 计算小时加班总金额
          const totalOvertimeAmount = tableData.reduce((sum, row) => sum + (parseFloat(row.overtimeAmount) || 0), 0)
          this.statistics.totalOvertimeAmount = totalOvertimeAmount.toFixed(2)

          // 计算值班总补贴（只计算每天第一条记录）
          let totalDutySubsidy = 0
          const processedDates = new Set()
          tableData.forEach((row, index) => {
            if (this.isFirstRecordOfDay(row, index, tableData) && !processedDates.has(row.recordDate)) {
              processedDates.add(row.recordDate)
              totalDutySubsidy += parseFloat(row.dutySubsidy) || 0
            }
          })
          this.statistics.totalDutySubsidy = totalDutySubsidy.toFixed(2)

          // 计算公休日工资（基于实际出勤天数和标准工作天数）
          const actualWorkDays = this.calculateActualWorkDays(tableData)
          console.log('计算公休日工资 - 实际出勤天数:', actualWorkDays)
          console.log('计算公休日工资 - 标准工作天数:', this.workDays)

          let totalRestDayWage = 0
          if (actualWorkDays > this.workDays) {
            // 实际出勤天数 > 标准工作天数：驾驶员在应休假的日期里也上班了，发放公休日工资
            const overtimeDays = actualWorkDays - this.workDays
            totalRestDayWage = overtimeDays * this.restDayWage
            console.log('计算公休日工资 - 加班天数:', overtimeDays, '公休日工资:', totalRestDayWage)
          } else if (actualWorkDays < this.workDays) {
            // 实际出勤天数 < 标准工作天数：驾驶员除了正常的每月休假外还请了假，扣除多休天数的工资
            const leaveDays = this.workDays - actualWorkDays
            totalRestDayWage = -(leaveDays * this.dailyWage)
            console.log('计算公休日工资 - 请假天数:', leaveDays, '扣除工资:', totalRestDayWage)
          } else {
            // 实际出勤天数 = 标准工作天数：正常情况，不发放公休日工资，也不扣除工资
            console.log('计算公休日工资 - 正常情况，不发放公休日工资，也不扣除工资')
          }
          this.statistics.totalRestDayWage = totalRestDayWage.toFixed(2)

          // 计算节假日工资
          const totalHolidayWage = tableData.reduce((sum, row) => sum + (parseFloat(row.holidayWage) || 0), 0)
          this.statistics.totalHolidayWage = totalHolidayWage.toFixed(2)

          // 计算总安全奖
          const totalSafetyBonus = this.calculateTotalSafetyBonus(tableData)
          this.statistics.totalSafetyBonus = totalSafetyBonus

          // 每日安全奖
          this.statistics.dailySafetyBonus = this.dailySafetyBonus.toFixed(2)

          // 计算总合计（与月度详细记录页面逻辑一致）
          const totalAmount = this.calculateTotalAmount(tableData)
          this.statistics.totalAmount = totalAmount

          // 计算公里费用（与月度详细记录页面逻辑一致）
          const mileageFee = await this.calculateMileageFee(totalMileage)
          this.statistics.mileageFee = mileageFee

          // 本月总收入 = 总合计 + 公里费用
          this.statistics.monthlyIncome = (parseFloat(totalAmount) + parseFloat(mileageFee)).toFixed(2)

          // 更新所有图表
          this.initIncomeChart()
          this.initCompositionChart()
          this.initHistoryChart()
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    },

    // 计算总合计（与月度详细记录页面逻辑一致）
    calculateTotalAmount(tableData) {
      // 计算除安全奖外的其他费用总和
      let otherAmount = 0
      const processedDates = new Set()

      tableData.forEach((row, index) => {
        const recordDate = row.recordDate
        // 只计算每天第一条记录的合计
        if (this.isFirstRecordOfDay(row, index, tableData) && !processedDates.has(recordDate)) {
          processedDates.add(recordDate)
          otherAmount += parseFloat(this.calculateTotalSubsidy(row, index, tableData))
        }
      })

      // 计算安全奖
      const totalSafetyBonus = parseFloat(this.calculateTotalSafetyBonus(tableData))

      // 加上公休日工资（按月汇总计算）
      const totalRestDayWage = this.statistics.totalRestDayWage ? parseFloat(this.statistics.totalRestDayWage) : 0

      // 直接相加得到总合计
      return (otherAmount + totalSafetyBonus + totalRestDayWage).toFixed(2)
    },

    // 计算合计（安全奖和值班补贴只计算当天的第一条记录）
    calculateTotalSubsidy(row, index, tableData) {
      const overtimeAmount = parseFloat(row.overtimeAmount) || 0
      const dutySubsidy = this.isFirstRecordOfDay(row, index, tableData) ? (parseFloat(row.dutySubsidy) || 0) : 0
      const holidayWage = parseFloat(row.holidayWage) || 0

      // 公休日工资按月汇总计算，不在每日记录中计算
      // 安全奖不在这里计算，而是在calculateTotalSafetyBonus中统一计算
      return (overtimeAmount + dutySubsidy + holidayWage).toFixed(2)
    },

    // 计算实际出勤天数（每天只计算一次）
    calculateActualWorkDays(tableData) {
      let actualWorkDays = 0
      const processedDates = new Set()

      tableData.forEach((row, index) => {
        if (this.isFirstRecordOfDay(row, index, tableData) && !processedDates.has(row.recordDate)) {
          processedDates.add(row.recordDate)
          actualWorkDays++
        }
      })

      return actualWorkDays
    },

    // 计算总安全奖
    calculateTotalSafetyBonus(tableData) {
      // 统计实际出勤天数（每天只计算一次）
      let actualWorkDays = this.calculateActualWorkDays(tableData)

      // 计算实际安全奖（按实际出勤天数计算）
      const actualSafetyBonus = this.dailySafetyBonus * actualWorkDays

      // 确保不超过安全奖标准（dailySafetyBonus * workDays）
      const maxSafetyBonus = this.dailySafetyBonus * this.workDays
      const finalSafetyBonus = Math.min(actualSafetyBonus, maxSafetyBonus)

      return finalSafetyBonus.toFixed(2)
    },

    // 判断某天是否是公休日
    isRestDay(date) {
      const dateStr = typeof date === 'string' ? date : date.toISOString().slice(0, 10)
      const isRest = this.restDays.includes(dateStr)
      return isRest
    },

    // 判断是否是当天的第一条记录
    isFirstRecordOfDay(row, index, tableData) {
      if (index === 0) return true
      const currentDate = row.recordDate
      const previousDate = tableData[index - 1].recordDate
      return currentDate !== previousDate
    },

    async calculateMileageFee(totalMileage) {
      const mileageUnitPrice = await this.getMileageUnitPrice()

      // 当每月总公里数小于5000公里时，按公里数*公里单价
      if (totalMileage <= 5000) {
        return (totalMileage * mileageUnitPrice).toFixed(2)
      }
      // 当每月公里数大于5000公里后，最大公里补贴为500元
      return '500.00'
    },

    async getMileageUnitPrice() {
      return this.mileageUnitPrice
    },

    initCharts() {
      this.initIncomeChart()
      this.initCompositionChart()
      this.initHistoryChart()
    },

    initIncomeChart() {
      this.incomeChart = echarts.init(this.$refs.incomeChart)

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        },
        yAxis: {
          type: 'value',
          name: '收入(元)'
        },
        series: [{
          data: [3200, 3500, 3800, 4200, 3900, 4500, 4800, 4600, 5000, 5200, 5500, 5800],
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#409eff'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
            ])
          }
        }]
      }

      this.incomeChart.setOption(option)
    },

    initCompositionChart() {
      this.compositionChart = echarts.init(this.$refs.compositionChart)

      // 获取月度详细记录数据
      const tableData = this.monthlyDetailData || []

      // 计算加班费总和
      const totalOvertimeAmount = tableData.reduce((sum, row) => sum + (parseFloat(row.overtimeAmount) || 0), 0)

      // 计算值班补贴总和（只计算每天第一条记录）
      let totalDutySubsidy = 0
      const processedDates = new Set()
      tableData.forEach((row, index) => {
        if (this.isFirstRecordOfDay(row, index, tableData) && !processedDates.has(row.recordDate)) {
          processedDates.add(row.recordDate)
          totalDutySubsidy += parseFloat(row.dutySubsidy) || 0
        }
      })

      // 计算公休日工资总和（基于实际出勤天数和标准工作天数）
      const actualWorkDays = this.calculateActualWorkDays(tableData)
      let totalRestDayWage = 0
      if (actualWorkDays > this.workDays) {
        // 实际出勤天数 > 标准工作天数：驾驶员在应休假的日期里也上班了，发放公休日工资
        const overtimeDays = actualWorkDays - this.workDays
        totalRestDayWage = overtimeDays * this.restDayWage
      } else if (actualWorkDays < this.workDays) {
        // 实际出勤天数 < 标准工作天数：驾驶员除了正常的每月休假外还请了假，扣除多休天数的工资
        const leaveDays = this.workDays - actualWorkDays
        totalRestDayWage = -(leaveDays * this.dailyWage)
      }
      // 实际出勤天数 = 标准工作天数：正常情况，不发放公休日工资，也不扣除工资

      // 计算节假日工资总和
      const totalHolidayWage = tableData.reduce((sum, row) => sum + (parseFloat(row.holidayWage) || 0), 0)

      // 计算安全奖总和
      const totalSafetyBonus = parseFloat(this.calculateTotalSafetyBonus(tableData))

      // 计算总里程
      const totalMileage = tableData.reduce((sum, row) => sum + (parseFloat(row.totalMileage) || 0), 0)

      // 计算公里费用
      let mileageFee = 0
      if (totalMileage <= 5000) {
        mileageFee = totalMileage * this.mileageUnitPrice
      } else {
        mileageFee = 500
      }

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c}元 ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '收入构成',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: mileageFee.toFixed(2), name: '公里费用', itemStyle: { color: '#5470c6' } },
              { value: totalOvertimeAmount.toFixed(2), name: '加班费', itemStyle: { color: '#91cc75' } },
              { value: totalDutySubsidy.toFixed(2), name: '值班补贴', itemStyle: { color: '#fac858' } },
              { value: totalRestDayWage.toFixed(2), name: '公休日工资', itemStyle: { color: '#73c0de' } },
              { value: totalHolidayWage.toFixed(2), name: '节假日工资', itemStyle: { color: '#3ba272' } },
              { value: totalSafetyBonus.toFixed(2), name: '安全奖', itemStyle: { color: '#ee6666' } }
            ]
          }
        ]
      }

      this.compositionChart.setOption(option)
    },

    initHistoryChart() {
      this.historyChart = echarts.init(this.$refs.historyChart)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['出车次数', '总里程', '总收入']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: [
          {
            type: 'value',
            name: '次数/里程',
            position: 'left'
          },
          {
            type: 'value',
            name: '收入(元)',
            position: 'right'
          }
        ],
        series: [
          {
            name: '出车次数',
            type: 'bar',
            data: [20, 22, 25, 28, 26, 30],
            itemStyle: { color: '#5470c6' }
          },
          {
            name: '总里程',
            type: 'bar',
            data: [3200, 3500, 3800, 4200, 3900, 4500],
            itemStyle: { color: '#91cc75' }
          },
          {
            name: '总收入',
            type: 'line',
            yAxisIndex: 1,
            data: [3200, 3500, 3800, 4200, 3900, 4500],
            itemStyle: { color: '#fac858' }
          }
        ]
      }

      this.historyChart.setOption(option)
    }
  }
}
</script>

<style scoped lang="scss">
.driver-statistics {
  .stat-card {
    margin-bottom: 20px;

    .stat-content {
      display: flex;
      align-items: center;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        margin-right: 20px;
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .card-header {
    font-weight: bold;
  }
}
</style>
