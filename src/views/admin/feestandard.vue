<template>
  <div class="fee-standard">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>费用标准管理</span>
          <div class="header-actions">
            <el-button type="warning" @click="handleRecalculateAmounts">重新计算所有金额</el-button>
            <el-button type="info" @click="handleInitHolidayWage">初始化公休节假日工资</el-button>
            <el-button type="primary" @click="handleImport">导入CSV</el-button>
            <el-button type="success" @click="exportExcel">导出Excel</el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="工作时间" name="work_time">
          <el-form :model="workTimeForm" label-width="120px" style="max-width: 500px;">
            <el-form-item label="上班时间">
              <el-time-picker
                v-model="workTimeForm.startTime"
                format="HH:mm"
                value-format="HH:mm:ss"
                placeholder="选择上班时间"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="下班时间">
              <el-time-picker
                v-model="workTimeForm.endTime"
                format="HH:mm"
                value-format="HH:mm:ss"
                placeholder="选择下班时间"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="选择月份">
              <el-date-picker
                v-model="workTimeForm.selectedMonth"
                type="month"
                placeholder="选择月份"
                format="YYYY年MM月"
                value-format="YYYY-MM"
                @change="calculateWorkDays"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="月工作总天数">
              <el-input-number
                v-model="workTimeForm.workDays"
                :min="0"
                :max="31"
                :precision="0"
                placeholder="输入月工作总天数"
                style="width: 100%"
              />
              <el-text type="info" style="margin-left: 10px;">
                每月天数减去休息日天数（如每周单休，则减去周日数）
              </el-text>
            </el-form-item>
            <el-form-item label="当月公休日期">
              <div v-if="workTimeForm.restDays && typeof workTimeForm.restDays === 'string'" style="margin-bottom: 10px;">
                <el-tag
                  v-for="(date, index) in workTimeForm.restDays.split(',')"
                  :key="index"
                  style="margin-right: 5px; margin-bottom: 5px;"
                >
                  {{ date.trim() }}
                </el-tag>
              </div>
              <el-text v-else type="info">请先选择月份，系统将自动计算当月的公休日</el-text>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveWorkTime">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="公里补贴" name="mileage">
          <el-table :data="mileageStandards" border stripe>
            <el-table-column prop="description" label="项目" width="200" />
            <el-table-column prop="configValue" label="标准值" width="200">
              <template #default="{ row }">
                <el-input-number
                  v-if="row.isEditable === 1"
                  v-model="row.configValue"
                  :min="0"
                  :precision="2"
                  size="small"
                />
                <span v-else>{{ row.configValue }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="configKey" label="配置键" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button
                  v-if="row.isEditable === 1"
                  link
                  @click="handleUpdate(row)"
                >
                  保存
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="加班费" name="overtime">
          <el-table :data="overtimeRules" border stripe>
            <el-table-column label="时间段（小时）" width="200">
              <template #default="{ row, $index }">
                <el-input
                  v-model="row.timeRange"
                  placeholder="如：<2 或 2-3"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="费用（元）" width="200">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.amount"
                  :min="0"
                  :precision="2"
                  size="small"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row, $index }">
                <el-button
                  link
                  type="danger"
                  @click="handleRemoveOvertimeRule($index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 10px;">
            <el-button type="primary" size="small" @click="handleAddOvertimeRule">
              添加规则
            </el-button>
            <el-button type="success" size="small" @click="handleSaveOvertimeRules">
              保存所有规则
            </el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="值班补贴" name="duty">
          <el-table :data="dutyStandards" border stripe>
            <el-table-column prop="description" label="项目" width="200" />
            <el-table-column prop="configValue" label="标准值" width="200">
              <template #default="{ row }">
                <el-input-number
                  v-if="row.isEditable === 1"
                  v-model="row.configValue"
                  :min="0"
                  :precision="2"
                  size="small"
                />
                <span v-else>{{ row.configValue }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="configKey" label="配置键" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button
                  v-if="row.isEditable === 1"
                  link
                  @click="handleUpdate(row)"
                >
                  保存
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="安全奖" name="safety">
          <el-table :data="safetyStandards" border stripe>
            <el-table-column prop="description" label="项目" width="200" />
            <el-table-column prop="configValue" label="标准值" width="200">
              <template #default="{ row }">
                <el-input-number
                  v-if="row.isEditable === 1"
                  v-model="row.configValue"
                  :min="0"
                  :precision="2"
                  size="small"
                />
                <span v-else>{{ row.configValue }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="configKey" label="配置键" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button
                  v-if="row.isEditable === 1"
                  link
                  @click="handleUpdate(row)"
                >
                  保存
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="公休节假日工资" name="holiday">
          <el-alert
            title="说明"
            type="info"
            :closable="false"
            style="margin-bottom: 20px;"
          >
            <template #default>
              <div>公休日工资 = 驾驶员平均每日工资</div>
              <div>节假日工资 = 驾驶员平均每日工资 × 2</div>
              <div style="margin-top: 8px; color: #E6A23C;">
                注意：这些工资标准会在重新计算驾驶员每日工资时自动更新，手动修改可能被覆盖
              </div>
            </template>
          </el-alert>
          <el-table :data="holidayStandards" border stripe>
            <el-table-column prop="description" label="项目" width="200" />
            <el-table-column prop="configValue" label="标准值" width="200">
              <template #default="{ row }">
                <el-input-number
                  v-if="row.isEditable === 1"
                  v-model="row.configValue"
                  :min="0"
                  :precision="2"
                  size="small"
                />
                <span v-else>{{ row.configValue }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="configKey" label="配置键" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button
                  v-if="row.isEditable === 1"
                  link
                  @click="handleUpdate(row)"
                >
                  保存
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 导入CSV对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入费用标准"
      width="600px"
    >
      <el-form :model="importForm" label-width="100px">
        <el-form-item label="CSV内容">
          <el-input
            v-model="importForm.csvContent"
            type="textarea"
            :rows="10"
            placeholder="请输入CSV格式的内容"
          />
        </el-form-item>
        <el-form-item label="示例">
          <el-text type="info">
            configKey,configValue,configType,category,description<br>
            mileage_unit_price,0.1,DECIMAL,mileage,公里单价
          </el-text>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImportSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getAllFeeStandards, updateFeeStandard, importFeeStandardsFromCSV, initHolidayWageStandards } from '@/api/feestandard'

export default {
  name: 'FeeStandard',
  data() {
    return {
      activeTab: 'work_time',
      allStandards: [],
      overtimeRules: [],
      workTimeForm: {
        startTime: '08:00:00',
        endTime: '17:00:00',
        selectedMonth: '',
        workDays: 22,
        restDays: '' // 当月公休日期
      },
      importDialogVisible: false,
      importForm: {
        csvContent: ''
      }
    }
  },
  computed: {
    mileageStandards() {
      return this.allStandards.filter(item => item.category === 'mileage')
    },

    overtimeStandards() {
      return this.allStandards.filter(item => item.category === 'overtime')
    },

    dutyStandards() {
      return this.allStandards.filter(item => item.category === 'duty')
    },

    safetyStandards() {
      return this.allStandards.filter(item => item.category === 'safety')
    },

    holidayStandards() {
      return this.allStandards.filter(item => item.category === 'holiday')
    }
  },
  mounted() {
    this.loadStandards()
    // 设置当前月份
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    this.workTimeForm.selectedMonth = `${year}-${month}`
    // 先加载费用标准，再计算当前月份的工作天数
    this.loadStandards().then(() => {
      this.$nextTick(() => {
        // 如果数据库中没有公休日配置，则自动计算
        if (!this.workTimeForm.restDays) {
          this.calculateWorkDays()
        }
      })
    })
  },
  methods: {
    async loadStandards() {
      try {
        const res = await getAllFeeStandards()
        if (res.code === 200) {
          // 将configValue转换为数字类型（如果是数字的话）
          this.allStandards = (res.data || []).map(item => {
            // current_month_rest_days保持字符串类型，不转换
            if (item.configKey === 'current_month_rest_days') {
              return {
                ...item,
                configValue: String(item.configValue || '')
              }
            }
            if (item.configType === 'DECIMAL' || item.configType === 'INTEGER') {
              return {
                ...item,
                configValue: parseFloat(item.configValue) || 0
              }
            }
            return item
          })

          // 加载加班费规则
          this.loadOvertimeRules()

          // 加载工作时间
          this.loadWorkTime()
        }
      } catch (error) {
        console.error('加载费用标准失败:', error)
      }
    },

    calculateWorkDays() {
      if (!this.workTimeForm.selectedMonth) {
        return
      }

      const [year, month] = this.workTimeForm.selectedMonth.split('-').map(Number)
      const date = new Date(year, month - 1, 1)
      const daysInMonth = new Date(year, month, 0).getDate()

      let workDays = 0
      let sundayCount = 0
      const restDays = [] // 存储公休日

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month - 1, day)
        const dayOfWeek = currentDate.getDay()

        // 周日是0
        if (dayOfWeek === 0) {
          sundayCount++
          // 将公休日添加到数组中，格式为YYYY-MM-DD
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          restDays.push(dateStr)
        } else {
          workDays++
        }
      }

      this.workTimeForm.workDays = workDays
      // 将公休日数组转换为逗号分隔的字符串
      this.workTimeForm.restDays = restDays.join(',')
      this.$message.success(`${year}年${month}月共${daysInMonth}天，其中${sundayCount}个周日，工作天数为${workDays}天`)
      console.log('calculateWorkDays - 计算完成，公休日:', this.workTimeForm.restDays)
    },

    loadWorkTime() {
      // 从费用标准中获取工作时间
      const startTime = this.allStandards.find(item => item.configKey === 'work_start_time')
      const endTime = this.allStandards.find(item => item.configKey === 'work_end_time')
      const workDays = this.allStandards.find(item => item.configKey === 'monthly_working_days')
      const restDays = this.allStandards.find(item => item.configKey === 'current_month_rest_days')

      if (startTime) {
        this.workTimeForm.startTime = startTime.configValue
      }
      if (endTime) {
        this.workTimeForm.endTime = endTime.configValue
      }
      if (workDays) {
        this.workTimeForm.workDays = parseInt(workDays.configValue) || 22
      }
      if (restDays) {
        console.log('loadWorkTime - restDays配置项:', restDays)
        console.log('loadWorkTime - restDays.configValue:', restDays.configValue)
        console.log('loadWorkTime - restDays.configValue类型:', typeof restDays.configValue)
        this.workTimeForm.restDays = String(restDays.configValue || '')
        console.log('loadWorkTime - workTimeForm.restDays:', this.workTimeForm.restDays)
      }

      // 如果没有公休日配置或者配置为空，且已选择月份，则自动计算
      if ((!restDays || !restDays.configValue) && this.workTimeForm.selectedMonth) {
        console.log('loadWorkTime - 没有公休日配置，开始计算')
        this.calculateWorkDays()
      }
    },

    async handleSaveWorkTime() {
      if (!this.workTimeForm.startTime || !this.workTimeForm.endTime) {
        this.$message.warning('请选择上班时间和下班时间')
        return
      }
      if (!this.workTimeForm.workDays || this.workTimeForm.workDays <= 0) {
        this.$message.warning('请输入有效的月工作总天数')
        return
      }

      try {
        // 保存上班时间
        await updateFeeStandard({
          configKey: 'work_start_time',
          configValue: this.workTimeForm.startTime
        })

        // 保存下班时间
        await updateFeeStandard({
          configKey: 'work_end_time',
          configValue: this.workTimeForm.endTime
        })

        // 保存月工作总天数
        await updateFeeStandard({
          configKey: 'monthly_working_days',
          configValue: this.workTimeForm.workDays.toString()
        })

        // 保存当月公休日期
        await updateFeeStandard({
          configKey: 'current_month_rest_days',
          configValue: String(this.workTimeForm.restDays || '')
        })

        this.$message.success('保存成功')
        this.loadStandards()
      } catch (error) {
        console.error('保存失败:', error)
      }
    },

    loadOvertimeRules() {
      // 从费用标准中获取加班费规则
      const overtimeRule = this.overtimeStandards.find(item => item.configKey === 'overtime_rule')
      if (overtimeRule && overtimeRule.configValue) {
        try {
          // 解析JSON格式的加班费规则
          const rules = JSON.parse(overtimeRule.configValue)
          // 转换为数组格式
          this.overtimeRules = Object.entries(rules).map(([timeRange, amount]) => ({
            timeRange,
            amount: parseFloat(amount) || 0
          }))
        } catch (error) {
          console.error('解析加班费规则失败:', error)
          this.overtimeRules = []
        }
      } else {
        // 如果没有规则，添加默认规则
        this.overtimeRules = [
          { timeRange: '<2', amount: 0 },
          { timeRange: '2-3', amount: 40 },
          { timeRange: '3-4', amount: 60 },
          { timeRange: '≥4', amount: 80 }
        ]
      }
    },

    handleAddOvertimeRule() {
      this.overtimeRules.push({
        timeRange: '',
        amount: 0
      })
    },

    handleRemoveOvertimeRule(index) {
      this.overtimeRules.splice(index, 1)
    },

    async handleSaveOvertimeRules() {
      // 验证规则
      if (this.overtimeRules.length === 0) {
        this.$message.warning('请至少添加一条加班费规则')
        return
      }

      for (let i = 0; i < this.overtimeRules.length; i++) {
        const rule = this.overtimeRules[i]
        if (!rule.timeRange) {
          this.$message.warning(`第${i + 1}条规则的时间段不能为空`)
          return
        }
        if (rule.amount === undefined || rule.amount === null || rule.amount < 0) {
          this.$message.warning(`第${i + 1}条规则的费用不能为空且不能小于0`)
          return
        }
      }

      // 将规则转换为对象格式
      const rules = {}
      this.overtimeRules.forEach(rule => {
        rules[rule.timeRange] = rule.amount
      })

      try {
        const res = await updateFeeStandard({
          configKey: 'overtime_rule',
          configValue: JSON.stringify(rules)
        })

        if (res.code === 200) {
          this.$message.success('保存成功')
          this.loadStandards()
        }
      } catch (error) {
        console.error('保存失败:', error)
      }
    },

    async handleUpdate(row) {
      try {
        const res = await updateFeeStandard({
          configKey: row.configKey,
          configValue: row.configValue
        })

        if (res.code === 200) {
          this.$message.success('更新成功')
          this.loadStandards()
        }
      } catch (error) {
        console.error('更新失败:', error)
      }
    },

    handleImport() {
      this.importForm.csvContent = ''
      this.importDialogVisible = true
    },

    async handleImportSubmit() {
      if (!this.importForm.csvContent.trim()) {
        this.$message.warning('请输入CSV内容')
        return
      }

      try {
        const res = await importFeeStandardsFromCSV(this.importForm.csvContent)
        if (res.code === 200) {
          this.$message.success('导入成功')
          this.importDialogVisible = false
          this.loadStandards()
        }
      } catch (error) {
        console.error('导入失败:', error)
      }
    },

    async handleRecalculateAmounts() {
      try {
        await this.$confirm('确定要重新计算所有派车记录的金额吗？此操作将根据当前的费用标准更新所有记录。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const { recalculateAllAmounts } = await import('@/api/dispatch')
        const res = await recalculateAllAmounts()

        if (res.code === 200) {
          this.$message.success('重新计算成功')
        } else {
          this.$message.error('重新计算失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('重新计算失败:', error)
          this.$message.error('重新计算失败')
        }
      }
    },

    async handleInitHolidayWage() {
      try {
        await this.$confirm('确定要初始化公休节假日工资标准吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })

        const res = await initHolidayWageStandards()

        if (res.code === 200) {
          this.$message.success('初始化成功')
          // 重新加载费用标准
          await this.loadStandards()
        } else {
          this.$message.error('初始化失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('初始化失败:', error)
          this.$message.error('初始化失败')
        }
      }
    },

    exportExcel() {
      this.$message.info('导出Excel功能待实现')
    }
  }
}
</script>

<style scoped lang="scss">
.fee-standard {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }
}
</style>
