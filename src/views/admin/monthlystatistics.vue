<template>
  <div class="monthly-statistics">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>月度统计表</span>
          <div class="header-actions">
            <el-date-picker
              v-model="currentMonth"
              type="month"
              placeholder="选择月份"
              format="YYYY年MM月"
              value-format="YYYY-MM"
              @change="loadData"
            />
            <el-button type="primary" @click="handleCalculate">计算统计</el-button>
            <el-button type="success" @click="exportExcel">导出Excel</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border stripe v-loading="loading" :cell-style="{padding: '8px 0'}">
        <el-table-column type="index" label="序号" min-width="50" show-overflow-tooltip fixed />
        <el-table-column prop="driverName" label="姓名" min-width="80" show-overflow-tooltip fixed />
        <el-table-column prop="totalMileage" label="公里数" min-width="80">
          <template #default="{ row }">
            {{ row.totalMileage || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="mileageUnitPrice" label="单价" min-width="60">
          <template #default="{ row }">
            {{ row.mileageUnitPrice || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="mileageSubsidy" label="公里数补贴" min-width="100">
          <template #default="{ row }">
            ¥{{ row.mileageSubsidy || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="actualMileageAmount" label="实际金额" min-width="100">
          <template #default="{ row }">
            ¥{{ row.actualMileageAmount || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="overtimeAmount" label="小时加班费" min-width="100">
          <template #default="{ row }">
            ¥{{ row.overtimeAmount || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="dutySubsidy" label="值班补贴" min-width="80">
          <template #default="{ row }">
            ¥{{ row.dutySubsidy || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="legalHolidayAmount" label="法定假日加班费" min-width="120">
          <template #default="{ row }">
            ¥{{ row.legalHolidayAmount || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="restDayWageTotal" label="公休日工资" min-width="100">
          <template #default="{ row }">
            <span :style="{ color: row.restDayWageTotal >= 0 ? '#67C23A' : '#F56C6C' }">
              ¥{{ row.restDayWageTotal || 0 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="safetyBonusTotal" label="安全奖" min-width="80">
          <template #default="{ row }">
            ¥{{ row.safetyBonusTotal || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="baseSalary" label="底薪" min-width="80">
          <template #default="{ row }">
            ¥{{ row.baseSalary || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="合计金额" min-width="100">
          <template #default="{ row }">
            <span style="font-weight: bold; color: #f56c6c;">¥{{ row.totalAmount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="info">草稿</el-tag>
            <el-tag v-else-if="row.status === 2" type="warning">已确认</el-tag>
            <el-tag v-else-if="row.status === 3" type="success">已审核</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 1"
              type="text"
              @click="handleConfirm(row)"
            >
              确认
            </el-button>
            <el-button
              v-if="row.status === 2"
              type="text"
              @click="handleAudit(row)"
            >
              审核
            </el-button>
            <el-button type="text" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <el-descriptions :column="4" border>
          <el-descriptions-item label="总公里数">{{ summary.totalMileage || 0 }}</el-descriptions-item>
          <el-descriptions-item label="公里补贴合计">¥{{ summary.mileageSubsidy || 0 }}</el-descriptions-item>
          <el-descriptions-item label="加班费合计">¥{{ summary.overtimeAmount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="总金额">
            <span style="font-weight: bold; color: #f56c6c;">¥{{ summary.totalAmount || 0 }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getMonthlyStatisticsList } from '@/api/statistics'

export default {
  name: 'MonthlyStatistics',
  data() {
    return {
      currentMonth: new Date().toISOString().slice(0, 7),
      tableData: [],
      summary: {
        totalMileage: 0,
        mileageSubsidy: 0,
        overtimeAmount: 0,
        totalAmount: 0
      },
      loading: false
    }
  },
  computed: {
    ...mapGetters('user', ['userId'])
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      if (!this.currentMonth) return

      this.loading = true
      try {
        const res = await getMonthlyStatisticsList({
          yearMonth: this.currentMonth
        })

        console.log('loadData - response:', res)
        console.log('loadData - tableData:', res.data)

        if (res.code === 200) {
          this.tableData = res.data || []
          this.calculateSummary()
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        this.loading = false
      }
    },

    calculateSummary() {
      this.summary.totalMileage = this.tableData.reduce((sum, item) => sum + (item.totalMileage || 0), 0)
      this.summary.mileageSubsidy = this.tableData.reduce((sum, item) => sum + (item.mileageSubsidy || 0), 0)
      this.summary.overtimeAmount = this.tableData.reduce((sum, item) => sum + (item.overtimeAmount || 0), 0)
      this.summary.totalAmount = this.tableData.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
    },

    handleCalculate() {
      this.$message.info('计算统计功能待实现')
    },

    handleConfirm(row) {
      this.$confirm('确认该驾驶员的月度统计?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.info('确认功能待实现')
      }).catch(() => {})
    },

    handleAudit(row) {
      this.$confirm('审核该驾驶员的月度统计?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.info('审核功能待实现')
      }).catch(() => {})
    },

    handleView(row) {
      // 跳转到个人统计页面，并传递driverId
      this.$router.push({
        path: '/driver/statistics',
        query: {
          driverId: row.driverId
        }
      })
    },

    exportExcel() {
      this.$message.info('导出Excel功能待实现')
    }
  }
}
</script>

<style scoped lang="scss">
.monthly-statistics {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .table-footer {
    margin-top: 20px;
  }
}
</style>
