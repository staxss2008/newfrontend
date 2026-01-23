<template>
  <div class="holiday-config">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>节假日配置</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">添加节假日</el-button>
            <el-button type="success" @click="handleImport">批量导入</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline>
        <el-form-item label="年份">
          <el-date-picker
            v-model="searchForm.year"
            type="year"
            placeholder="选择年份"
            value-format="YYYY"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.holidayType" placeholder="请选择类型" clearable>
            <el-option label="法定假日" :value="1" />
            <el-option label="公休日" :value="2" />
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
        <el-table-column prop="holidayDate" label="日期" width="120" />
        <el-table-column prop="holidayName" label="节假日名称" width="150" />
        <el-table-column prop="year" label="年份" width="80" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.holidayType === 1 ? 'danger' : 'warning'">
              {{ row.holidayType === 1 ? '法定假日' : '公休日' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="text" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="日期" prop="holidayDate">
          <el-date-picker
            v-model="form.holidayDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="节假日名称" prop="holidayName">
          <el-input v-model="form.holidayName" placeholder="请输入节假日名称" />
        </el-form-item>
        <el-form-item label="类型" prop="holidayType">
          <el-radio-group v-model="form.holidayType">
            <el-radio :label="1">法定假日</el-radio>
            <el-radio :label="2">公休日</el-radio>
          </el-radio-group>
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

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入节假日"
      width="600px"
    >
      <el-form :model="importForm" label-width="100px">
        <el-form-item label="年份">
          <el-date-picker
            v-model="importForm.year"
            type="year"
            placeholder="选择年份"
            value-format="YYYY"
          />
        </el-form-item>
        <el-form-item label="导入内容">
          <el-input
            v-model="importForm.content"
            type="textarea"
            :rows="10"
            placeholder="每行一个日期,格式: 日期,节假日名称,类型(1-法定假日,2-公休日)&#10;示例:&#10;2024-01-01,元旦,1&#10;2024-02-10,春节,1"
          />
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
import { getHolidayList, addHoliday, updateHoliday, deleteHoliday, importHolidays } from '@/api/holiday'

export default {
  name: 'HolidayConfig',
  data() {
    return {
      searchForm: {
        year: null,
        holidayType: null
      },
      tableData: [],
      loading: false,
      dialogVisible: false,
      dialogTitle: '添加节假日',
      form: {
        id: null,
        holidayDate: '',
        holidayName: '',
        holidayType: 1,
        remark: ''
      },
      rules: {
        holidayDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
        holidayName: [{ required: true, message: '请输入节假日名称', trigger: 'blur' }],
        holidayType: [{ required: true, message: '请选择类型', trigger: 'change' }]
      },
      importDialogVisible: false,
      importForm: {
        year: new Date().getFullYear().toString(),
        content: ''
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
        const res = await getHolidayList({
          year: this.searchForm.year,
          holidayType: this.searchForm.holidayType
        })

        if (res.code === 200) {
          this.tableData = res.data || []
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        this.loading = false
      }
    },

    handleReset() {
      this.searchForm = {
        year: null,
        holidayType: null
      }
      this.loadData()
    },

    handleAdd() {
      this.dialogTitle = '添加节假日'
      this.form = {
        id: null,
        holidayDate: '',
        holidayName: '',
        holidayType: 1,
        remark: ''
      }
      this.dialogVisible = true
    },

    handleEdit(row) {
      this.dialogTitle = '编辑节假日'
      this.form = {
        id: row.id,
        holidayDate: row.holidayDate,
        holidayName: row.holidayName,
        holidayType: row.holidayType,
        remark: row.remark
      }
      this.dialogVisible = true
    },

    handleDelete(row) {
      this.$confirm('确定要删除该节假日配置吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteHoliday(row.id)
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
              res = await updateHoliday(this.form.id, this.form)
            } else {
              res = await addHoliday(this.form)
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

    handleImport() {
      this.importForm.content = ''
      this.importDialogVisible = true
    },

    async handleImportSubmit() {
      if (!this.importForm.year) {
        this.$message.warning('请选择年份')
        return
      }

      if (!this.importForm.content.trim()) {
        this.$message.warning('请输入导入内容')
        return
      }

      try {
        const lines = this.importForm.content.trim().split('
')
        const holidays = lines.map(line => {
          const parts = line.split(',')
          return {
            holidayDate: parts[0].trim(),
            holidayName: parts[1].trim(),
            holidayType: parseInt(parts[2].trim()),
            year: parseInt(this.importForm.year)
          }
        })

        const res = await importHolidays(holidays)
        if (res.code === 200) {
          this.$message.success('导入成功')
          this.importDialogVisible = false
          this.loadData()
        }
      } catch (error) {
        console.error('导入失败:', error)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.holiday-config {
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
