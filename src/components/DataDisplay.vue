<template>
  <div class="data-display">
    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <!-- 串口连接状态卡片 -->
       <el-col :span="8">
         <el-card class="stat-card serial-status-card">
           <div class="stat-content">
             <el-icon class="stat-icon" :class="{ 'connected': serialStatus.isConnected, 'disconnected': !serialStatus.isConnected }">
               <Connection />
             </el-icon>
             <div class="stat-info">
               <div class="serial-port-selector">
                 <el-select 
                   v-model="serialStatus.selectedPort" 
                   placeholder="选择串口"
                   size="small"
                   @change="handlePortChange"
                   class="port-select"
                 >
                   <el-option
                     v-for="port in availablePorts"
                     :key="port.value"
                     :label="port.label"
                     :value="port.value"
                   />
                 </el-select>
               </div>
               <div class="stat-label">
                 <span class="connection-status" :class="{ 'connected': serialStatus.isConnected, 'disconnected': !serialStatus.isConnected }">
                   {{ serialStatus.isConnected ? '已连接' : '未连接' }}
                 </span>
                 <span v-if="serialStatus.isConnected && serialStatus.baudRate" class="baud-rate">
                   | {{ serialStatus.baudRate }} bps
                 </span>
               </div>
             </div>
           </div>
         </el-card>
       </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon"><Upload /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalSent }}</div>
              <div class="stat-label">发送总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon"><Download /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalReceived }}</div>
              <div class="stat-label">接收总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon"><Timer /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.sessionTime }}</div>
              <div class="stat-label">会话时长</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon"><TrendCharts /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.dataRate }}</div>
              <div class="stat-label">数据速率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据显示主区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 实时数据流 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Monitor /></el-icon>
              <span>实时数据流</span>
              <div class="header-controls">
                <el-switch
                  v-model="autoScroll"
                  active-text="自动滚动"
                  inactive-text="手动滚动"
                  size="small"
                />
                <el-button size="small" @click="pauseDisplay">
                  <el-icon><VideoPause v-if="!isPaused" /><VideoPlay v-else /></el-icon>
                  {{ isPaused ? '继续' : '暂停' }}
                </el-button>
                <el-button size="small" @click="clearData">
                  <el-icon><Delete /></el-icon>
                  清空
                </el-button>
                <el-button size="small" @click="exportData">
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="data-stream-container">
            <div 
              ref="dataStream" 
              class="data-stream"
              :class="{ paused: isPaused }"
            >
              <div 
                v-for="(item, index) in displayData" 
                :key="index"
                class="data-item"
                :class="item.type"
              >
                <div class="data-timestamp">{{ item.timestamp }}</div>
                <div class="data-type-badge">
                  <el-tag 
                    :type="item.type === 'sent' ? 'warning' : item.type === 'received' ? 'success' : 'info'" 
                    size="small"
                  >
                    {{ item.type === 'sent' ? '发送' : item.type === 'received' ? '接收' : '系统' }}
                  </el-tag>
                </div>
                <div class="data-content">
                  <div class="data-raw">{{ item.data }}</div>
                  <div v-if="item.hex" class="data-hex">HEX: {{ item.hex }}</div>
                </div>
                <div class="data-length">{{ item.length }} 字节</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 数据过滤和搜索 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Filter /></el-icon>
              <span>数据过滤</span>
            </div>
          </template>
          
          <div class="filter-controls">
            <!-- 数据类型过滤 -->
            <el-form-item label="数据类型">
              <el-checkbox-group v-model="filters.dataTypes">
                <el-checkbox label="sent">发送数据</el-checkbox>
                <el-checkbox label="received">接收数据</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <!-- 数据格式 -->
            <el-form-item label="显示格式">
              <el-radio-group v-model="displayFormat">
                <el-radio label="ascii">ASCII</el-radio>
                <el-radio label="hex">十六进制</el-radio>
                <el-radio label="both">两者</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <!-- 搜索 -->
            <el-form-item label="搜索内容">
              <el-input
                v-model="searchKeyword"
                placeholder="输入搜索关键词"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <!-- 时间范围 -->
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                size="small"
              />
            </el-form-item>
            
            <!-- 数据长度过滤 -->
            <el-form-item label="数据长度">
              <el-slider
                v-model="filters.lengthRange"
                range
                :min="0"
                :max="1000"
                :step="10"
                show-stops
              />
              <div class="range-display">
                {{ filters.lengthRange[0] }} - {{ filters.lengthRange[1] }} 字节
              </div>
            </el-form-item>
          </div>
        </el-card>
        
        <!-- 数据分析 -->
        <el-card style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <el-icon><PieChart /></el-icon>
              <span>数据分析</span>
            </div>
          </template>
          
          <div class="analysis-content">
            <div class="analysis-item">
              <span class="analysis-label">平均包长度:</span>
              <span class="analysis-value">{{ analysis.avgPacketLength }} 字节</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">最大包长度:</span>
              <span class="analysis-value">{{ analysis.maxPacketLength }} 字节</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">最小包长度:</span>
              <span class="analysis-value">{{ analysis.minPacketLength }} 字节</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">错误包数:</span>
              <span class="analysis-value error">{{ analysis.errorCount }}</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">成功率:</span>
              <span class="analysis-value success">{{ analysis.successRate }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'DataDisplay',
  data() {
    return {
      // 原始数据存储
      rawData: [],
      // 显示的数据（经过过滤）
      displayData: [],
      // 显示控制
      autoScroll: true,
      isPaused: false,
      displayFormat: 'both',
      // 过滤器
      filters: {
        dataTypes: ['sent', 'received', 'system'],
        lengthRange: [0, 1000]
      },
      searchKeyword: '',
      timeRange: null,
      // 串口连接状态
      serialStatus: {
        isConnected: false,
        portName: '',
        baudRate: '',
        connectionTime: null,
        selectedPort: ''
      },
      // 可用串口列表
      availablePorts: [
        { value: 'COM1', label: 'COM1 (USB Serial Port)' },
        { value: 'COM2', label: 'COM2 (Bluetooth)' },
        { value: 'COM3', label: 'COM3 (Arduino Uno)' },
        { value: 'COM4', label: 'COM4 (ESP32)' },
        { value: 'COM5', label: 'COM5 (CH340)' },
        { value: 'COM6', label: 'COM6 (FT232)' },
        { value: 'COM7', label: 'COM7 (CP210x)' },
        { value: 'COM8', label: 'COM8 (USB-TTL)' }
      ],
      // 统计数据
      statistics: {
        totalSent: 0,
        totalReceived: 0,
        sessionTime: '00:00:00',
        dataRate: '0 B/s'
      },
      // 数据分析
      analysis: {
        avgPacketLength: 0,
        maxPacketLength: 0,
        minPacketLength: 0,
        errorCount: 0,
        successRate: 100
      },
      // 定时器
      sessionTimer: null,
      sessionStartTime: null,
      dataRateTimer: null,
      lastDataCount: 0
    }
  },
  
  mounted() {
    this.initializeSession()
    this.initializeSerialStatus()
    this.setupSerialDataListener()
  },
  
  beforeDestroy() {
    // 移除事件监听器
    window.removeEventListener('serialDataReceived', this.handleSerialDataReceived)
    window.removeEventListener('serialDataSent', this.handleSerialDataSent)
    window.removeEventListener('serialConnectionChanged', this.handleSerialConnectionChanged)
    window.removeEventListener('serialPortChanged', this.handleSerialPortChanged)
  },
  
  beforeUnmount() {
    this.clearTimers()
  },
  
  watch: {
    // 监听过滤条件变化
    filters: {
      handler() {
        this.applyFilters()
      },
      deep: true
    },
    searchKeyword() {
      this.applyFilters()
    },
    timeRange() {
      this.applyFilters()
    },
    displayFormat() {
      this.updateDisplayFormat()
    }
  },
  
  methods: {
    // 初始化会话
    initializeSession() {
      this.sessionStartTime = new Date()
      
      // 会话时长计时器
      this.sessionTimer = setInterval(() => {
        const now = new Date()
        const diff = now - this.sessionStartTime
        this.statistics.sessionTime = this.formatDuration(diff)
      }, 1000)
      
      // 数据速率计算器
      this.dataRateTimer = setInterval(() => {
        const currentDataCount = this.rawData.length
        const dataIncrease = currentDataCount - this.lastDataCount
        this.statistics.dataRate = `${dataIncrease} 包/s`
        this.lastDataCount = currentDataCount
      }, 1000)
    },
    
    // 添加数据项
    addDataItem(type, data, isError = false) {
      const timestamp = new Date().toLocaleTimeString()
      const dataItem = {
        id: Date.now() + Math.random(),
        timestamp,
        type,
        data,
        hex: this.stringToHex(data),
        length: data.length,
        isError
      }
      
      this.rawData.push(dataItem)
      
      // 更新统计（系统消息不计入统计）
      if (type === 'sent') {
        this.statistics.totalSent++
      } else if (type === 'received') {
        this.statistics.totalReceived++
      }
      
      // 更新分析数据
      this.updateAnalysis()
      
      // 应用过滤器
      this.applyFilters()
      
      // 自动滚动
      if (this.autoScroll && !this.isPaused) {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },
    
    // 应用过滤器
    applyFilters() {
      let filtered = [...this.rawData]
      
      // 数据类型过滤
      if (this.filters.dataTypes.length > 0) {
        filtered = filtered.filter(item => 
          this.filters.dataTypes.includes(item.type)
        )
      }
      
      // 长度过滤
      filtered = filtered.filter(item => 
        item.length >= this.filters.lengthRange[0] && 
        item.length <= this.filters.lengthRange[1]
      )
      
      // 关键词搜索
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        filtered = filtered.filter(item => 
          item.data.toLowerCase().includes(keyword) ||
          item.hex.toLowerCase().includes(keyword)
        )
      }
      
      // 时间范围过滤
      if (this.timeRange && this.timeRange.length === 2) {
        filtered = filtered.filter(item => {
          const itemTime = item.timestamp
          return itemTime >= this.timeRange[0] && itemTime <= this.timeRange[1]
        })
      }
      
      this.displayData = filtered
    },
    
    // 更新显示格式
    updateDisplayFormat() {
      // 重新应用过滤器以更新显示
      this.applyFilters()
    },
    
    // 更新分析数据
    updateAnalysis() {
      if (this.rawData.length === 0) return
      
      const lengths = this.rawData.map(item => item.length)
      const errorCount = this.rawData.filter(item => item.isError).length
      
      this.analysis = {
        avgPacketLength: Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length),
        maxPacketLength: Math.max(...lengths),
        minPacketLength: Math.min(...lengths),
        errorCount,
        successRate: Math.round(((this.rawData.length - errorCount) / this.rawData.length) * 100)
      }
    },
    
    // 字符串转十六进制
    stringToHex(str) {
      return Array.from(str)
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase())
        .join(' ')
    },
    
    // 格式化持续时间
    formatDuration(ms) {
      const seconds = Math.floor(ms / 1000) % 60
      const minutes = Math.floor(ms / (1000 * 60)) % 60
      const hours = Math.floor(ms / (1000 * 60 * 60))
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
    
    // 滚动到底部
    scrollToBottom() {
      const container = this.$refs.dataStream
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    
    // 暂停/继续显示
    pauseDisplay() {
      this.isPaused = !this.isPaused
    },
    
    // 清空数据
    clearData() {
      this.$confirm('确定要清空所有数据吗？', '确认清空', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.rawData = []
        this.displayData = []
        this.statistics.totalSent = 0
        this.statistics.totalReceived = 0
        this.analysis = {
          avgPacketLength: 0,
          maxPacketLength: 0,
          minPacketLength: 0,
          errorCount: 0,
          successRate: 100
        }
        this.$message.success('数据已清空')
      })
    },
    
    // 导出数据
    exportData() {
      const dataToExport = this.displayData.map(item => ({
        时间戳: item.timestamp,
        类型: item.type === 'sent' ? '发送' : '接收',
        数据: item.data,
        十六进制: item.hex,
        长度: item.length
      }))
      
      const csvContent = this.convertToCSV(dataToExport)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `串口数据_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      
      this.$message.success('数据导出成功')
    },
    
    // 转换为CSV格式
    convertToCSV(data) {
      if (data.length === 0) return ''
      
      const headers = Object.keys(data[0])
      const csvRows = []
      
      // 添加标题行
      csvRows.push(headers.join(','))
      
      // 添加数据行
      for (const row of data) {
        const values = headers.map(header => {
          const value = row[header]
          return `"${value}"`
        })
        csvRows.push(values.join(','))
      }
      
      return csvRows.join('\n')
    },
    
    // 清理定时器
    clearTimers() {
      if (this.sessionTimer) {
        clearInterval(this.sessionTimer)
      }
      if (this.dataRateTimer) {
        clearInterval(this.dataRateTimer)
      }
    },
    
    // 初始化串口状态（用于演示）
    initializeSerialStatus() {
      // 设置默认选中的串口
      this.serialStatus.selectedPort = 'COM3'
      
      // 模拟串口连接状态
      setTimeout(() => {
        this.serialStatus = {
          ...this.serialStatus,
          isConnected: true,
          portName: 'COM3 (Arduino Uno)',
          baudRate: '9600',
          connectionTime: new Date(),
          selectedPort: 'COM3'
        }
      }, 2000)
    },
    
    // 处理串口切换
    handlePortChange(selectedPort) {
      // 触发串口切换事件
      window.dispatchEvent(new CustomEvent('serialPortChanged', {
        detail: {
          portName: selectedPort,
          selectedPort: selectedPort
        }
      }))
    },
    

    
    // 设置串口数据监听器
    setupSerialDataListener() {
      // 监听串口数据事件
      window.addEventListener('serialDataReceived', this.handleSerialDataReceived)
      window.addEventListener('serialDataSent', this.handleSerialDataSent)
      window.addEventListener('serialConnectionChanged', this.handleSerialConnectionChanged)
      window.addEventListener('serialPortChanged', this.handleSerialPortChanged)
    },
    
    // 处理接收到的串口数据
    handleSerialDataReceived(event) {
      const { data, timestamp, isError } = event.detail
      this.addDataItem('received', data, isError || false)
    },
    
    // 处理发送的串口数据
    handleSerialDataSent(event) {
      const { data, timestamp } = event.detail
      this.addDataItem('sent', data, false)
    },
    
    // 处理串口连接状态变化
    handleSerialConnectionChanged(event) {
      const { isConnected, portName, baudRate, connectionTime } = event.detail
      this.serialStatus = {
        ...this.serialStatus,
        isConnected,
        portName: portName || this.serialStatus.portName,
        baudRate: baudRate || this.serialStatus.baudRate,
        connectionTime: connectionTime || this.serialStatus.connectionTime
      }
      
      // 在数据流中添加连接状态变化记录
      const statusText = isConnected ? '串口已连接' : '串口已断开'
      this.addDataItem('system', `${statusText}: ${portName || this.serialStatus.portName}`, false)
    },
    
    // 处理串口切换
    handleSerialPortChanged(event) {
      const { portName, selectedPort } = event.detail
      this.serialStatus.selectedPort = selectedPort
      this.serialStatus.portName = portName
      
      // 在数据流中添加切换记录
      this.addDataItem('system', `串口已切换到 ${portName}`, false)
    }
  }
}
</script>

<style scoped>
.data-display {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 32px;
  color: #409eff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 串口状态卡片样式 */
.serial-status-card {
  border-left: 4px solid #409eff;
}

.serial-status-card .stat-icon.connected {
  color: #67c23a;
}

.serial-status-card .stat-icon.disconnected {
  color: #f56c6c;
}

.serial-port-name {
  font-size: 18px !important;
  font-weight: 600;
  color: #303133;
}

.connection-status.connected {
  color: #67c23a;
  font-weight: 600;
}

.connection-status.disconnected {
  color: #f56c6c;
  font-weight: 600;
}

.baud-rate {
  color: #909399;
  font-size: 11px;
}

/* 串口选择器样式 */
.serial-port-selector {
  margin-bottom: 8px;
}

.port-select {
  width: 100%;
  max-width: 200px;
}

.port-select .el-input__inner {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.port-select .el-input__wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  transition: all 0.3s;
}

.port-select .el-input__wrapper:hover {
  border-color: #409eff;
}

.port-select.is-focus .el-input__wrapper {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.header-controls {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.data-stream-container {
  height: 500px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.data-stream {
  height: 100%;
  overflow-y: auto;
  padding: 10px;
  background: #fafafa;
  font-family: 'Courier New', monospace;
}

.data-stream.paused {
  background: #f5f5f5;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #409eff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-item.sent {
  border-left-color: #e6a23c;
}

.data-item.received {
  border-left-color: #67c23a;
}

.data-timestamp {
  font-size: 12px;
  color: #909399;
  min-width: 80px;
}

.data-type-badge {
  min-width: 50px;
}

.data-content {
  flex: 1;
  min-width: 0;
}

.data-raw {
  font-weight: 500;
  word-break: break-all;
}

.data-hex {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
  word-break: break-all;
}

.data-length {
  font-size: 11px;
  color: #909399;
  min-width: 60px;
  text-align: right;
}

.filter-controls {
  padding: 10px 0;
}

.filter-controls .el-form-item {
  margin-bottom: 20px;
}

.range-display {
  text-align: center;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.analysis-content {
  padding: 10px 0;
}

.analysis-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.analysis-item:last-child {
  border-bottom: none;
}

.analysis-label {
  font-size: 13px;
  color: #666;
}

.analysis-value {
  font-weight: 600;
  color: #303133;
}

.analysis-value.error {
  color: #f56c6c;
}

.analysis-value.success {
  color: #67c23a;
}
</style>