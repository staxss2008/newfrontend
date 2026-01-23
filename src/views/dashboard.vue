<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff;">
              <el-icon :size="30"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.driverCount || 0 }}</div>
              <div class="stat-label">驾驶员总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a;">
              <el-icon :size="30"><Van /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.vehicleCount || 0 }}</div>
              <div class="stat-label">车辆总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c;">
              <el-icon :size="30"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.todayDispatch || 0 }}</div>
              <div class="stat-label">今日派车</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c;">
              <el-icon :size="30"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ statistics.monthlyAmount || 0 }}</div>
              <div class="stat-label">本月支出</div>
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
              <span>派车趋势</span>
            </div>
          </template>
          <div ref="trendChart" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>费用分布</span>
            </div>
          </template>
          <div ref="pieChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getDriverList } from '@/api/driver'
import { getVehicleList } from '@/api/vehicle'
import { getDispatchRecordList } from '@/api/dispatch'

export default {
  name: 'Dashboard',
  data() {
    return {
      statistics: {
        driverCount: 0,
        vehicleCount: 0,
        todayDispatch: 0,
        monthlyAmount: 0
      },
      trendChart: null,
      pieChart: null
    }
  },
  mounted() {
    this.loadStatistics()
    this.initCharts()
  },
  beforeUnmount() {
    if (this.trendChart) {
      this.trendChart.dispose()
    }
    if (this.pieChart) {
      this.pieChart.dispose()
    }
  },
  methods: {
    async loadStatistics() {
      try {
        // 加载驾驶员数量
        const driverRes = await getDriverList({ current: 1, size: 1 })
        if (driverRes.code === 200) {
          this.statistics.driverCount = driverRes.data.total
        }

        // 加载车辆数量
        const vehicleRes = await getVehicleList({ current: 1, size: 1 })
        if (vehicleRes.code === 200) {
          this.statistics.vehicleCount = vehicleRes.data.total
        }

        // 加载今日派车数量
        const today = new Date().toISOString().split('T')[0]
        const dispatchRes = await getDispatchRecordList({
          current: 1,
          size: 1,
          startDate: today,
          endDate: today
        })
        if (dispatchRes.code === 200) {
          this.statistics.todayDispatch = dispatchRes.data.total
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    },

    initCharts() {
      this.initTrendChart()
      this.initPieChart()
    },

    initTrendChart() {
      this.trendChart = echarts.init(this.$refs.trendChart)

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: [12, 15, 10, 18, 20, 8, 5],
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#409eff'
          }
        }]
      }

      this.trendChart.setOption(option)
    },

    initPieChart() {
      this.pieChart = echarts.init(this.$refs.pieChart)

      const option = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '费用分布',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 1048, name: '公里补贴' },
              { value: 735, name: '加班费' },
              { value: 580, name: '值班补贴' },
              { value: 484, name: '安全奖' },
              { value: 300, name: '其他' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }

      this.pieChart.setOption(option)
    }
  }
}
</script>

<style scoped lang="scss">
.dashboard {
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
