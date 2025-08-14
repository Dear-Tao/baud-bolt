<template>
  <div class="serial-communication">
    <el-card class="connection-card">
      <template #header>
        <div class="card-header">
          <el-icon><Connection /></el-icon>
          <span>串口连接</span>
        </div>
      </template>
      
      <div class="connection-controls">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="串口">
              <el-select v-model="serialConfig.port" placeholder="选择串口">
                <el-option
                  v-for="port in availablePorts"
                  :key="port"
                  :label="port"
                  :value="port"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="波特率">
              <el-select v-model="serialConfig.baudRate">
                <el-option label="9600" value="9600" />
                <el-option label="19200" value="19200" />
                <el-option label="38400" value="38400" />
                <el-option label="57600" value="57600" />
                <el-option label="115200" value="115200" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="数据位">
              <el-select v-model="serialConfig.dataBits">
                <el-option label="7" value="7" />
                <el-option label="8" value="8" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="停止位">
              <el-select v-model="serialConfig.stopBits">
                <el-option label="1" value="1" />
                <el-option label="2" value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="操作">
              <el-button
                :type="isConnected ? 'danger' : 'primary'"
                @click="toggleConnection"
                :loading="connecting"
              >
                {{ isConnected ? '断开连接' : '连接' }}
              </el-button>
              <el-button @click="refreshPorts" :loading="refreshing">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 发送数据区域 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Upload /></el-icon>
              <span>发送数据</span>
            </div>
          </template>
          
          <div class="send-area">
            <el-input
              v-model="sendData"
              type="textarea"
              :rows="6"
              placeholder="请输入要发送的数据"
              :disabled="!isConnected"
            />
            <div class="send-controls">
              <div class="control-group">
                <el-checkbox v-model="sendAsHex">十六进制发送</el-checkbox>
                <el-checkbox v-model="autoSend">自动发送</el-checkbox>
                <el-input-number
                  v-if="autoSend"
                  v-model="autoSendInterval"
                  :min="100"
                  :max="10000"
                  :step="100"
                  size="small"
                  style="width: 120px;"
                />
                <span v-if="autoSend" style="color: #666; font-size: 12px;">ms</span>
              </div>
              
              <div class="button-group">
                 <el-button size="small" @click="showCommonCommands">
                    管理命令
                </el-button>
                <el-button size="small" @click="resetDevice" v-if="isConnected">
                    复位设备
                </el-button>
              </div>
            </div>
            <el-button
              type="primary"
              @click="sendSerialData"
              :disabled="!isConnected || !sendData.trim()"
              style="margin-top: 10px;"
            >
              <el-icon><Position /></el-icon>
              发送
            </el-button>
          </div>
        </el-card>
        
        <!-- 常用命令快捷操作区域 -->
        <el-card style="margin-top: 20px;" v-if="commonCommands.length > 0">
          <template #header>
            <div class="card-header">
              <el-icon><Collection /></el-icon>
              <span>常用命令</span>
              <div style="margin-left: auto; display: flex; gap: 8px;">
                <el-button
                  size="small"
                  @click="clearCommandsCache"
                  type="warning"
                >
                  清除缓存
                </el-button>
                <el-button
                  size="small"
                  @click="showCommonCommands"
                >
                  管理
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="quick-commands">
            <div 
              v-for="(command, index) in commonCommands.slice(0, 6)" 
              :key="index"
              class="quick-command-item"
            >
              <div class="command-info">
                <div class="command-name">{{ command.name }}</div>
                <div class="command-preview">{{ command.command.length > 20 ? command.command.substring(0, 20) + '...' : command.command }}</div>
              </div>
              <div class="command-actions">
                <el-button
                  size="small"
                  type="primary"
                  @click="useCommand(command)"
                  :disabled="!isConnected"
                >
                  <el-icon><Position /></el-icon>
                  发送
                </el-button>
                <el-button
                  size="small"
                  @click="copyToSendBox(command)"
                >
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </div>
            </div>
            
            <!-- 显示更多命令的提示 -->
            <div v-if="commonCommands.length > 6" class="more-commands">
              <el-button
                size="small"
                type="text"
                @click="showCommonCommands"
              >
                还有 {{ commonCommands.length - 6 }} 个命令...
              </el-button>
            </div>
          </div>
        </el-card>
        
        <!-- 空状态提示 -->
        <el-card style="margin-top: 20px;" v-else>
          <div class="empty-quick-commands">
            <el-icon><Plus /></el-icon>
            <p>暂无常用命令</p>
          </div>
        </el-card>
      </el-col>

      <!-- 接收数据区域 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Download /></el-icon>
              <span>接收数据</span>
              <el-button
                size="small"
                @click="clearReceiveData"
                style="margin-left: auto;"
              >
                清空
              </el-button>
            </div>
          </template>
          
          <div class="receive-area" ref="receiveContainer">
            <el-input
              v-model="receiveData"
              type="textarea"
              :rows="20"
              readonly
              placeholder="接收到的数据将显示在这里"
            />
            <div class="receive-controls">
              <el-checkbox v-model="displayAsHex">十六进制显示</el-checkbox>
              <el-checkbox v-model="autoScroll">自动滚动</el-checkbox>
              <span class="data-count">接收字节数: {{ receiveDataCount }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 连接状态指示器 -->
    <div class="status-indicator">
      <el-tag :type="isConnected ? 'success' : 'danger'" size="large">
        <el-icon><CircleCheck v-if="isConnected" /><CircleClose v-else /></el-icon>
        {{ isConnected ? '已连接' : '未连接' }}
      </el-tag>
      <div v-if="isConnected" class="connection-details">
        <el-tag size="small" type="info">{{ serialConfig.baudRate }} bps</el-tag>
        <el-tag size="small" type="info">{{ serialConfig.dataBits }}N{{ serialConfig.stopBits }}</el-tag>
        <el-tag size="small" type="success" v-if="dtrRtsEnabled">DTR/RTS</el-tag>
      </div>
    </div>

    <!-- 常用命令管理对话框 -->
    <el-dialog
      v-model="showCommandDialog"
      title="常用命令管理"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="command-management">
        <!-- 常用命令列表 -->
        <div class="command-list">
          <div class="list-header">
            <h4>已保存的常用命令</h4>
            <el-button type="primary" size="small" @click="openAddCommand">
              <el-icon><Plus /></el-icon>
              添加命令
            </el-button>
          </div>
          
          <div v-if="commonCommands.length === 0" class="empty-state">
            <el-empty description="暂无常用命令，点击上方按钮添加" />
          </div>
          
          <div v-else class="command-items">
            <div
              v-for="(cmd, index) in commonCommands"
              :key="index"
              class="command-item"
            >
              <div class="command-info">
                <div class="command-name">{{ cmd.name }}</div>
                <div class="command-desc">{{ cmd.description }}</div>
                <div class="command-value">
                  <el-tag :type="cmd.isHex ? 'warning' : 'info'" size="small">
                    {{ cmd.isHex ? 'HEX' : 'ASCII' }}
                  </el-tag>
                  <code>{{ cmd.command }}</code>
                </div>
              </div>
              <div class="command-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="useCommand(cmd)"
                  :disabled="!isConnected"
                >
                  <el-icon><Position /></el-icon>
                  发送
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  @click="copyToSendBox(cmd)"
                >
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
                <el-button
                  size="small"
                  @click="editCommand(index)"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="deleteCommand(index)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 添加/编辑命令表单 -->
        <div class="command-form" v-if="editingCommandIndex >= -1">
          <el-divider />
          <h4>{{ editingCommandIndex === -1 ? '添加新命令' : '编辑命令' }}</h4>
          <el-form :model="newCommand" label-width="80px">
            <el-form-item label="命令名称" required>
              <el-input
                v-model="newCommand.name"
                placeholder="请输入命令名称"
                maxlength="20"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item label="命令内容" required>
              <el-input
                v-model="newCommand.command"
                type="textarea"
                :rows="3"
                placeholder="请输入命令内容"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item label="数据格式">
              <el-radio-group v-model="newCommand.isHex">
                <el-radio :label="true">十六进制</el-radio>
                <el-radio :label="false">ASCII文本</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="命令描述">
              <el-input
                v-model="newCommand.description"
                placeholder="请输入命令描述（可选）"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveCommand">
                {{ editingCommandIndex === -1 ? '添加命令' : '保存修改' }}
              </el-button>
              <el-button @click="cancelEdit">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCommandDialog = false">关闭</el-button>
          <el-button type="warning" @click="exportCommands">
            <el-icon><Download /></el-icon>
            导出命令
          </el-button>
          <el-button type="success" @click="importCommands">
            <el-icon><Upload /></el-icon>
            导入命令
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SerialCommunication',
  data() {
    return {
      // 串口配置
      serialConfig: {
        port: '',
        baudRate: '9600',
        dataBits: '8',
        stopBits: '1'
      },
      // 可用串口列表
      availablePorts: ['COM1', 'COM2', 'COM3', 'COM4', 'COM5'],
      // 连接状态
      isConnected: false,
      connecting: false,
      refreshing: false,
      // 发送数据
      sendData: '',
      sendAsHex: false,
      autoSend: false,
      autoSendInterval: 1000,
      autoSendTimer: null,
      // 接收数据
      receiveData: '',
      receiveDataCount: 0,
      displayAsHex: false,
      autoScroll: true,
      // 模拟串口对象
      serialPort: null,
      // 读取器和写入器引用
      reader: null,
      writer: null,
      // DTR/RTS信号状态
      dtrRtsEnabled: false,
      // 连接开始时间
      connectionStartTime: null,
      // 常用命令相关
      commonCommands: [],
      showCommandDialog: false,
      newCommand: {
        name: '',
        command: '',
        description: '',
        isHex: true
      },
      editingCommandIndex: -1
    }
  },
  mounted() {
    // 组件挂载时加载常用命令
    this.loadCommands()
  },
  methods: {
    // 切换连接状态
    async toggleConnection() {
      if (this.isConnected) {
        await this.disconnect()
      } else {
        await this.connect()
      }
    },
    
    // 连接串口
    async connect() {
      this.connecting = true
      
      try {
        // 检查浏览器是否支持Web Serial API
        if ('serial' in navigator) {
          // 预检查：获取已授权的端口列表
          const ports = await navigator.serial.getPorts()
          console.log('已授权的串口设备:', ports.length, '个')
          
          if (ports.length > 0) {
            console.log('可用端口信息:', ports.map(port => ({
              readable: !!port.readable,
              writable: !!port.writable,
              info: port.getInfo()
            })))
          }
          // 请求串口权限（用户需要在弹出的对话框中选择串口）
          this.serialPort = await navigator.serial.requestPort({
            filters: [
              // 可以添加特定的USB设备过滤器
              // { usbVendorId: 0x2341, usbProductId: 0x0043 }, // Arduino Uno
              // { usbVendorId: 0x2341, usbProductId: 0x0001 }  // Arduino Uno SMD
            ]
          })
          
          // 获取并打印用户选择的端口信息
          const portInfo = this.serialPort.getInfo()
          const portDetails = {
            vendorId: portInfo.usbVendorId ? `0x${portInfo.usbVendorId.toString(16).toUpperCase()}` : '未知',
            productId: portInfo.usbProductId ? `0x${portInfo.usbProductId.toString(16).toUpperCase()}` : '未知',
            vendorName: this.getVendorName(portInfo.usbVendorId),
            productName: this.getProductName(portInfo.usbVendorId, portInfo.usbProductId)
          }
          
          console.log('=== 用户选择的串口设备信息 ===')
          console.log('厂商ID (VID):', portDetails.vendorId)
          console.log('产品ID (PID):', portDetails.productId)
          console.log('厂商名称:', portDetails.vendorName)
          console.log('产品名称:', portDetails.productName)
          console.log('完整设备信息:', portInfo)
          
          // 在接收区域显示端口选择信息
          const timestamp = new Date().toLocaleTimeString()
          
          // 尝试获取串口名称信息和COM端口号
          let portName = 'USB Serial Port'
          let comPortNumber = '未知'
          
          // 尝试从浏览器的串口信息中获取更多详细信息
          try {
            // 检查是否有可用的端口标识信息
            const allPorts = await navigator.serial.getPorts()
            const currentPortIndex = allPorts.findIndex(port => {
              const info = port.getInfo()
              return info.usbVendorId === portInfo.usbVendorId && 
                     info.usbProductId === portInfo.usbProductId
            })
            
            if (currentPortIndex >= 0) {
              // 基于设备类型和索引推断可能的COM端口号
              if (portDetails.vendorName.includes('Arduino')) {
                comPortNumber = `COM${currentPortIndex + 3}` // Arduino通常从COM3开始
                portName = `Arduino串口 (${comPortNumber})`
              } else if (portDetails.productName.includes('CH340') || portDetails.productName.includes('CH341')) {
                comPortNumber = `COM${currentPortIndex + 1}` // CH340通常从COM1开始
                portName = `CH340串口 (${comPortNumber})`
              } else if (portDetails.productName.includes('CP210')) {
                comPortNumber = `COM${currentPortIndex + 1}`
                portName = `CP210x串口 (${comPortNumber})`
              } else if (portDetails.productName.includes('FT232')) {
                comPortNumber = `COM${currentPortIndex + 1}`
                portName = `FT232串口 (${comPortNumber})`
              } else {
                comPortNumber = `COM${currentPortIndex + 1}`
                portName = `USB串口 (${comPortNumber})`
              }
            }
          } catch (error) {
            console.log('无法获取详细端口信息:', error)
            // 使用默认的推断方式
            if (portDetails.vendorName.includes('Arduino')) {
              comPortNumber = 'COM3-COM20范围'
              portName = 'Arduino串口'
            } else if (portDetails.productName.includes('CH340') || portDetails.productName.includes('CH341')) {
              comPortNumber = 'COM1-COM10范围'
              portName = 'CH340串口'
            }
          }
          
          console.log('推断的COM端口:', comPortNumber)
          console.log('设备名称:', portName)
          
          // 更新界面上的串口选择显示
          this.serialConfig.port = comPortNumber
          
          // 在界面上也显示选择的端口信息
          this.$message.success({
            message: '已选择串口设备',
            description: `${portDetails.vendorName} - ${portDetails.productName} (${comPortNumber})`,
            duration: 5
          })
          
          const portInfoText = `[${timestamp}] 已选择串口设备:\n` +
            `设备名称: ${portName}\n` +
            `COM端口: ${comPortNumber}\n` +
            `厂商: ${portDetails.vendorName}\n` +
            `产品: ${portDetails.productName}\n` +
            `VID: ${portDetails.vendorId}\n` +
            `PID: ${portDetails.productId}\n` +
            `波特率: ${this.serialConfig.baudRate}\n` +
            `数据位: ${this.serialConfig.dataBits}\n` +
            `停止位: ${this.serialConfig.stopBits}\n` +
            `校验位: 无\n` +
            `----------------------------------------\n`
          
          this.receiveData += portInfoText
          
          // 检查串口是否已经打开
          if (this.serialPort.readable && this.serialPort.readable.locked) {
            this.$message.warning('串口已被其他应用占用，请先关闭其他应用')
            return
          }
          
          // 打开串口 - 使用与桌面程序相同的配置
          const serialOptions = {
            baudRate: parseInt(this.serialConfig.baudRate), // 9600
            dataBits: parseInt(this.serialConfig.dataBits), // 8
            stopBits: parseInt(this.serialConfig.stopBits), // 1
            parity: 'none', // 无校验
            flowControl: 'none' // 无流控制
          }
          
          console.log('串口配置:', serialOptions)
          
          // 尝试打开串口，如果失败则重试
          let retryCount = 0
          const maxRetries = 3
          
          while (retryCount < maxRetries) {
            try {
              await this.serialPort.open(serialOptions)
              console.log('串口打开成功')
              break
            } catch (openError) {
              retryCount++
              console.warn(`串口打开失败，重试 ${retryCount}/${maxRetries}:`, openError.message)
              
              if (retryCount >= maxRetries) {
                throw openError
              }
              
              // 等待后重试
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
          
          // 设置DTR和RTS信号 - 这对某些设备很重要
           try {
             await this.serialPort.setSignals({
               dataTerminalReady: true, // DTR
               requestToSend: true      // RTS
             })
             this.dtrRtsEnabled = true
             console.log('DTR和RTS信号已设置')
           } catch (signalError) {
             this.dtrRtsEnabled = false
             console.warn('设置控制信号失败:', signalError)
             // 不阻止连接，某些设备可能不支持
           }
          
          this.isConnected = true
          this.connectionStartTime = new Date()
          this.$message.success('串口连接成功 - DTR/RTS已激活')
          
          // 在接收区域显示连接成功信息
          const connectTimestamp = new Date().toLocaleTimeString()
          const connectInfoText = `[${connectTimestamp}] 串口连接成功!\n` +
            `DTR/RTS信号: ${this.dtrRtsEnabled ? '已激活' : '未激活'}\n` +
            `连接状态: 已连接并准备通信\n` +
            `========================================\n`
          
          this.receiveData += connectInfoText
          
          // 开始读取数据
          this.startReading()
          
          // 如果启用自动发送，开始定时发送
          if (this.autoSend) {
            this.startAutoSend()
          }
        } else {
          // 浏览器不支持Web Serial API，使用模拟模式
          this.$message.warning('浏览器不支持Web Serial API，使用模拟模式')
          this.isConnected = true
          this.startSimulation()
        }
      } catch (error) {
        if (error.name === 'NotFoundError') {
          this.$message.warning('未选择串口设备，请重新尝试并选择一个串口')
        } else if (error.name === 'InvalidStateError') {
          this.$message.error('串口状态无效，可能已被其他应用占用')
        } else if (error.name === 'NetworkError') {
          this.$message.error({
            message: '串口连接失败 - NetworkError',
            description: '可能原因：1) 设备未正确连接 2) 驱动程序问题 3) 设备被其他程序占用 4) USB端口故障',
            duration: 8
          })
          console.error('NetworkError详细信息:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          })
        } else {
          this.$message.error({
            message: '连接失败: ' + error.name,
            description: error.message,
            duration: 6
          })
        }
        console.error('串口连接错误:', error)
      } finally {
        this.connecting = false
      }
    },
    
    // 获取连接时长
    getConnectionDuration() {
      if (!this.connectionStartTime) {
        return '未知'
      }
      
      const now = new Date()
      const duration = now - this.connectionStartTime
      const seconds = Math.floor(duration / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      
      if (hours > 0) {
        return `${hours}小时${minutes % 60}分钟${seconds % 60}秒`
      } else if (minutes > 0) {
        return `${minutes}分钟${seconds % 60}秒`
      } else {
        return `${seconds}秒`
      }
    },
    
    // 断开连接
    async disconnect() {
      try {
        // 在接收区域显示断开连接日志
        const disconnectTimestamp = new Date().toLocaleTimeString()
        const disconnectInfoText = `[${disconnectTimestamp}] 正在断开串口连接...\n` +
          `端口: ${this.serialConfig.port}\n` +
          `连接时长: ${this.getConnectionDuration()}\n`
        
        this.receiveData += disconnectInfoText
        
        this.isConnected = false
        this.dtrRtsEnabled = false
        this.connectionStartTime = null
        this.stopAutoSend()
        
        if (this.serialPort) {
          // 先释放读取器锁定
          if (this.reader) {
            try {
              // 检查reader是否仍然有效
              if (this.reader && typeof this.reader.cancel === 'function') {
                await this.reader.cancel()
              }
            } catch (cancelError) {
              console.warn('取消读取器失败:', cancelError)
            }
            
            try {
              // 检查reader是否仍然有效且有releaseLock方法
              if (this.reader && typeof this.reader.releaseLock === 'function') {
                this.reader.releaseLock()
              }
            } catch (readerError) {
              console.warn('释放读取器失败:', readerError)
            }
            this.reader = null
          }
          
          // 释放写入器锁定
          if (this.writer) {
            try {
              // 检查writer是否仍然有效且有releaseLock方法
              if (this.writer && typeof this.writer.releaseLock === 'function') {
                this.writer.releaseLock()
              }
            } catch (writerError) {
              console.warn('释放写入器失败:', writerError)
            }
            this.writer = null
          }
          
          // 等待一小段时间确保流被释放
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // 关闭串口
          try {
            if (this.serialPort && (this.serialPort.readable || this.serialPort.writable)) {
              await this.serialPort.close()
            }
          } catch (closeError) {
            console.warn('关闭串口失败:', closeError)
          }
          
          this.serialPort = null
        }
        
        // 在接收区域显示断开成功日志
        const disconnectSuccessTimestamp = new Date().toLocaleTimeString()
        const disconnectSuccessText = `[${disconnectSuccessTimestamp}] 串口连接已成功断开\n` +
          `状态: 已断开\n` +
          `========================================\n`
        
        this.receiveData += disconnectSuccessText
        
        this.$message.success('串口已断开')
        console.log('串口断开连接完成')
      } catch (error) {
        console.error('断开连接错误:', error)
        if (error.message.includes('locked')) {
          this.$message.warning('串口流被锁定，强制断开连接')
          // 强制重置状态
          this.serialPort = null
          this.reader = null
          this.writer = null
        } else {
          this.$message.error('断开连接失败: ' + error.message)
        }
      }
    },
    
    // 开始读取数据
    async startReading() {
      if (!this.serialPort || !this.serialPort.readable) return
      
      try {
        this.reader = this.serialPort.readable.getReader()
        
        while (this.isConnected && this.serialPort) {
          try {
            const { value, done } = await this.reader.read()
            if (done) break
            
            // 处理接收到的数据
            this.handleReceivedData(value)
          } catch (readError) {
            if (readError.name === 'NetworkError' || readError.name === 'InvalidStateError') {
              console.warn('读取中断:', readError.message)
              break
            }
            throw readError
          }
        }
      } catch (error) {
        if (this.isConnected) {
          console.error('读取数据错误:', error)
          this.$message.error('数据读取异常: ' + error.message)
        }
      } finally {
        // 确保释放读取器
        if (this.reader) {
          try {
            this.reader.releaseLock()
          } catch (releaseError) {
            console.warn('释放读取器失败:', releaseError)
          }
          this.reader = null
        }
      }
    },
    
    // 处理接收到的数据
    handleReceivedData(data) {
      const timestamp = new Date().toLocaleTimeString()
      let dataStr = ''
      
      if (this.displayAsHex) {
        // 十六进制显示
        dataStr = Array.from(data)
          .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
          .join(' ')
        this.receiveData += `[${timestamp}] 接收: ${dataStr}\n`
      } else {
        // ASCII显示
        dataStr = new TextDecoder().decode(data)
        this.receiveData += `[${timestamp}] 接收: ${dataStr}\n`
      }
      
      this.receiveDataCount += data.length
      
      // 在控制台输出接收到的原始数据用于调试
      console.log('接收到数据:', Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' '))
      
      // 自动滚动到底部
      if (this.autoScroll) {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },
    
    // 发送串口数据
    async sendSerialData() {
      if (!this.isConnected || !this.sendData.trim()) return
      
      try {
        let dataToSend
        
        if (this.sendAsHex) {
          // 十六进制发送
          const hexStr = this.sendData.replace(/[^0-9A-Fa-f]/g, '') // 只保留有效的十六进制字符
          
          // 验证十六进制字符串长度必须是偶数
          if (hexStr.length % 2 !== 0) {
            this.$message.error('十六进制数据长度必须是偶数')
            return
          }
          
          const bytes = []
          for (let i = 0; i < hexStr.length; i += 2) {
            const hexByte = hexStr.substring(i, i + 2)
            const byteValue = parseInt(hexByte, 16)
            
            // 验证转换结果
            if (isNaN(byteValue)) {
              this.$message.error(`无效的十六进制字符: ${hexByte}`)
              return
            }
            
            bytes.push(byteValue)
          }
          dataToSend = new Uint8Array(bytes)
          
          // 显示实际发送的字节数据用于调试
          console.log('发送的十六进制数据:', Array.from(dataToSend).map(b => b.toString(16).padStart(2, '0')).join(' '))
        } else {
          // ASCII发送
          dataToSend = new TextEncoder().encode(this.sendData)
        }
        
        if (this.serialPort && this.serialPort.writable) {
          try {
            // 检查串口状态
            console.log('串口状态:', {
              readable: !!this.serialPort.readable,
              writable: !!this.serialPort.writable,
              readableLocked: this.serialPort.readable?.locked,
              writableLocked: this.serialPort.writable?.locked
            })
            
            this.writer = this.serialPort.writable.getWriter()
            console.log('准备发送数据:', {
              length: dataToSend.length,
              bytes: Array.from(dataToSend),
              hex: Array.from(dataToSend).map(b => b.toString(16).padStart(2, '0')).join(' ')
            })
            
            // 添加发送前延迟，确保设备准备就绪
            await new Promise(resolve => setTimeout(resolve, 10))
            
            await this.writer.write(dataToSend)
            console.log('数据发送完成')
            
            // 发送后短暂延迟，确保数据完全传输
            await new Promise(resolve => setTimeout(resolve, 5))
            
            // 增加发送计数
            this.sendDataCount += dataToSend.length
          } finally {
            if (this.writer) {
              this.writer.releaseLock()
              this.writer = null
            }
          }
        } else {
          console.error('串口不可写:', {
            serialPort: !!this.serialPort,
            writable: !!this.serialPort?.writable
          })
          this.$message.error('串口不可写，请检查连接状态')
          return
        }
        
        // 在接收区域显示发送的数据（用于调试）
        const timestamp = new Date().toLocaleTimeString()
        if (this.sendAsHex) {
          const formattedHex = Array.from(dataToSend)
            .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
            .join(' ')
          this.receiveData += `[${timestamp}] 发送: ${formattedHex}\n`
        } else {
          this.receiveData += `[${timestamp}] 发送: ${this.sendData}\n`
        }
        
        this.$message.success('数据发送成功')
      } catch (error) {
        this.$message.error('发送失败: ' + error.message)
        console.error('发送数据错误:', error)
      }
    },
    
    // 开始自动发送
    startAutoSend() {
      if (this.autoSendTimer) {
        clearInterval(this.autoSendTimer)
      }
      
      this.autoSendTimer = setInterval(() => {
        if (this.isConnected && this.sendData.trim()) {
          this.sendSerialData()
        }
      }, this.autoSendInterval)
    },
    
    // 停止自动发送
    stopAutoSend() {
      if (this.autoSendTimer) {
        clearInterval(this.autoSendTimer)
        this.autoSendTimer = null
      }
    },
    
    // 清空接收数据
    clearReceiveData() {
      this.receiveData = ''
      this.receiveDataCount = 0
    },
    
    // 刷新串口列表
    async refreshPorts() {
      this.refreshing = true
      
      try {
        if ('serial' in navigator) {
          const ports = await navigator.serial.getPorts()
          // 这里可以获取已授权的串口列表
          this.$message.success('串口列表已刷新')
        } else {
          // 模拟刷新
          await new Promise(resolve => setTimeout(resolve, 1000))
          this.$message.success('串口列表已刷新（模拟模式）')
        }
      } catch (error) {
        this.$message.error('刷新失败: ' + error.message)
      } finally {
        this.refreshing = false
      }
    },
    

    
    // 显示常用命令管理对话框
    showCommonCommands() {
      this.showCommandDialog = true
      this.loadCommands()
    },
    
    // 从本地存储加载常用命令
    loadCommands() {
      try {
        const saved = localStorage.getItem('serialCommonCommands')
        if (saved) {
          this.commonCommands = JSON.parse(saved)
        } else {
          // 初始化一些默认命令
          this.commonCommands = [
            {
              name: '开灯',
              command: '55140CAAAA01FF0000000000',
              description: '控制开关打开',
              isHex: true
            },
            {
              name: '关灯',
              command: '55140CAAAA01000000000000',
              description: '控制开关关闭',
              isHex: true
            }
          ]
          this.saveCommands()
        }
      } catch (error) {
        console.error('加载常用命令失败:', error)
        this.commonCommands = []
      }
    },
    
    // 保存常用命令到本地存储
    saveCommands() {
      try {
        localStorage.setItem('serialCommonCommands', JSON.stringify(this.commonCommands))
      } catch (error) {
        console.error('保存常用命令失败:', error)
        this.$message.error('保存命令失败')
      }
    },
    
    // 清除常用命令缓存
    clearCommandsCache() {
      this.$confirm('确定要清除所有常用命令缓存吗？此操作不可恢复。', '确认清除', {
        confirmButtonText: '确定清除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        try {
          // 清除本地存储中的常用命令
          localStorage.removeItem('serialCommonCommands')
          // 清空当前内存中的命令列表
          this.commonCommands = []
          this.$message.success('常用命令缓存已清除')
        } catch (error) {
          console.error('清除缓存失败:', error)
          this.$message.error('清除缓存失败')
        }
      }).catch(() => {
        // 用户取消操作
      })
    },
    
    // 打开添加命令表单
    openAddCommand() {
      this.editingCommandIndex = -1
      this.newCommand = {
        name: '',
        command: '',
        description: '',
        isHex: true
      }
    },
    
    // 编辑命令
    editCommand(index) {
      this.editingCommandIndex = index
      const cmd = this.commonCommands[index]
      this.newCommand = {
        name: cmd.name,
        command: cmd.command,
        description: cmd.description,
        isHex: cmd.isHex
      }
    },
    
    // 保存命令
    saveCommand() {
      if (!this.newCommand.name.trim()) {
        this.$message.error('请输入命令名称')
        return
      }
      
      if (!this.newCommand.command.trim()) {
        this.$message.error('请输入命令内容')
        return
      }
      
      const command = {
        name: this.newCommand.name.trim(),
        command: this.newCommand.command.trim(),
        description: this.newCommand.description.trim(),
        isHex: this.newCommand.isHex
      }
      
      if (this.editingCommandIndex === -1) {
        // 添加新命令
        this.commonCommands.push(command)
        this.$message.success('命令添加成功')
      } else {
        // 更新现有命令
        this.commonCommands[this.editingCommandIndex] = command
        this.$message.success('命令更新成功')
      }
      
      this.saveCommands()
      this.cancelEdit()
    },
    
    // 取消编辑
    cancelEdit() {
      this.editingCommandIndex = -2
      this.newCommand = {
        name: '',
        command: '',
        description: '',
        isHex: true
      }
    },
    
    // 删除命令
    deleteCommand(index) {
      this.$confirm('确定要删除这个常用命令吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.commonCommands.splice(index, 1)
        this.saveCommands()
        this.$message.success('命令删除成功')
      }).catch(() => {})
    },
    
    // 使用命令（直接发送）
    async useCommand(cmd) {
      if (!this.isConnected) {
        this.$message.warning('请先连接串口')
        return
      }
      
      // 临时设置发送数据和格式
      const originalData = this.sendData
      const originalHex = this.sendAsHex
      
      this.sendData = cmd.command
      this.sendAsHex = cmd.isHex
      
      try {
        await this.sendSerialData()
        this.$message.success(`已发送命令: ${cmd.name}`)
      } catch (error) {
        this.$message.error('发送命令失败: ' + error.message)
      } finally {
        // 恢复原始设置
        this.sendData = originalData
        this.sendAsHex = originalHex
      }
    },
    
    // 复制命令到发送框
    copyToSendBox(cmd) {
      this.sendData = cmd.command
      this.sendAsHex = cmd.isHex
      this.$message.success(`已复制命令到发送框: ${cmd.name}`)
      this.showCommandDialog = false
    },
    
    // 滚动到底部
    scrollToBottom() {
      const container = this.$refs.receiveContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    
    // 导出命令
    exportCommands() {
      try {
        const dataStr = JSON.stringify(this.commonCommands, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `串口常用命令_${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        URL.revokeObjectURL(url)
        this.$message.success('命令导出成功')
      } catch (error) {
        console.error('导出命令失败:', error)
        this.$message.error('导出命令失败')
      }
    },
    
    // 导入命令
    importCommands() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      
      input.onchange = (event) => {
        const file = event.target.files[0]
        if (!file) return
        
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const commands = JSON.parse(e.target.result)
            
            // 验证数据格式
            if (!Array.isArray(commands)) {
              throw new Error('文件格式不正确')
            }
            
            for (const cmd of commands) {
              if (!cmd.name || !cmd.command || typeof cmd.isHex !== 'boolean') {
                throw new Error('命令数据格式不正确')
              }
            }
            
            this.$confirm(
              `将导入 ${commands.length} 个命令，是否覆盖现有命令？`,
              '确认导入',
              {
                confirmButtonText: '覆盖导入',
                cancelButtonText: '合并导入',
                distinguishCancelAndClose: true,
                type: 'warning'
              }
            ).then(() => {
              // 覆盖导入
              this.commonCommands = commands
              this.saveCommands()
              this.$message.success('命令导入成功（覆盖模式）')
            }).catch((action) => {
              if (action === 'cancel') {
                // 合并导入
                this.commonCommands = [...this.commonCommands, ...commands]
                this.saveCommands()
                this.$message.success('命令导入成功（合并模式）')
              }
            })
          } catch (error) {
            console.error('导入命令失败:', error)
            this.$message.error('导入命令失败: ' + error.message)
          }
        }
        
        reader.readAsText(file)
      }
      
      input.click()
    },
     

    
    // 根据厂商ID获取厂商名称
    getVendorName(vendorId) {
      const vendors = {
        0x2341: 'Arduino LLC',
        0x1A86: 'QinHeng Electronics',
        0x10C4: 'Silicon Labs',
        0x0403: 'FTDI',
        0x067B: 'Prolific Technology Inc',
        0x1B4F: 'SparkFun Electronics',
        0x239A: 'Adafruit Industries LLC',
        0x04D8: 'Microchip Technology Inc',
        0x16C0: 'Van Ooijen Technische Informatica',
        0x2E8A: 'Raspberry Pi',
        0x303A: 'Espressif Systems'
      }
      return vendors[vendorId] || `未知厂商 (0x${vendorId ? vendorId.toString(16).toUpperCase() : '????'})`
    },
    
    // 根据厂商ID和产品ID获取产品名称
    getProductName(vendorId, productId) {
      const products = {
        // Arduino 产品
        '0x2341': {
          0x0043: 'Arduino Uno Rev3',
          0x0001: 'Arduino Uno',
          0x0010: 'Arduino Mega 2560 Rev3',
          0x0042: 'Arduino Mega 2560',
          0x0243: 'Arduino Uno Rev3',
          0x8036: 'Arduino Leonardo',
          0x8037: 'Arduino Micro',
          0x804D: 'Arduino/Genuino Zero',
          0x804E: 'Arduino/Genuino MKR1000'
        },
        // CH340/CH341 系列
        '0x1A86': {
          0x7523: 'CH340 Serial',
          0x5523: 'CH341 Serial',
          0x55D4: 'CH341 Serial'
        },
        // Silicon Labs CP210x 系列
        '0x10C4': {
          0xEA60: 'CP2102 USB to UART Bridge',
          0xEA70: 'CP2105 Dual USB to UART Bridge',
          0xEA71: 'CP2108 Quad USB to UART Bridge'
        },
        // FTDI 系列
        '0x0403': {
          0x6001: 'FT232R USB UART',
          0x6014: 'FT232H Single HS USB-UART/FIFO IC',
          0x6015: 'FT231X USB UART'
        },
        // ESP32 系列
        '0x303A': {
          0x1001: 'ESP32-S2',
          0x0002: 'ESP32-S3',
          0x1002: 'ESP32-S3'
        }
      }
      
      const vendorKey = `0x${vendorId ? vendorId.toString(16).toUpperCase() : '????'}`
      const vendorProducts = products[vendorKey]
      
      if (vendorProducts && vendorProducts[productId]) {
        return vendorProducts[productId]
      }
      
      return `未知产品 (PID:0x${productId ? productId.toString(16).toUpperCase() : '????'})`
    },
     
     // 复位设备 (通过DTR信号)
     async resetDevice() {
       if (!this.serialPort || !this.isConnected) {
         this.$message.warning('请先连接串口')
         return
       }
       
       try {
         this.$message.info('正在复位设备...')
         
         // 拉低DTR信号
         await this.serialPort.setSignals({
           dataTerminalReady: false,
           requestToSend: false
         })
         
         // 等待100ms
         await new Promise(resolve => setTimeout(resolve, 100))
         
         // 重新拉高DTR和RTS信号
         await this.serialPort.setSignals({
           dataTerminalReady: true,
           requestToSend: true
         })
         
         this.$message.success('设备复位完成')
         console.log('设备复位完成')
         
         // 清空接收缓冲区
         this.receiveData = ''
         this.receiveDataCount = 0
         
       } catch (error) {
         this.$message.error('设备复位失败: ' + error.message)
         console.error('设备复位错误:', error)
       }
     },
     

    
    // 开始模拟模式（用于不支持Web Serial API的浏览器）
    startSimulation() {
      // 模拟接收数据
      setInterval(() => {
        if (this.isConnected) {
          const simulatedData = `模拟数据 ${new Date().toLocaleTimeString()}`
          this.receiveData += simulatedData + '\n'
          this.receiveDataCount += simulatedData.length
        }
      }, 2000)
    }
  },
  
  watch: {
    // 监听自动发送设置变化
    autoSend(newVal) {
      if (newVal && this.isConnected) {
        this.startAutoSend()
      } else {
        this.stopAutoSend()
      }
    },
    
    // 监听自动发送间隔变化
    autoSendInterval() {
      if (this.autoSend && this.isConnected) {
        this.startAutoSend()
      }
    }
  },
  
  async beforeUnmount() {
    // 组件销毁前断开连接
    this.stopAutoSend()
    if (this.isConnected) {
      await this.disconnect()
    }
    
    // 确保清理所有资源
    if (this.reader) {
      try {
        await this.reader.cancel()
        this.reader.releaseLock()
      } catch (error) {
        console.warn('清理读取器失败:', error)
      }
      this.reader = null
    }
    
    if (this.writer) {
      try {
        this.writer.releaseLock()
      } catch (error) {
        console.warn('清理写入器失败:', error)
      }
      this.writer = null
    }
    
    this.serialPort = null
  }
}
</script>

<style scoped>
.serial-communication {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.connection-controls {
  padding: 10px 0;
}

.send-area,
.receive-area {
  padding: 10px 0;
}

.send-controls,
.receive-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.button-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.send-controls .el-button {
  margin: 0;
}

.send-controls .el-checkbox {
  margin: 0;
}

.send-controls .el-input-number {
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .send-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .control-group,
  .button-group {
    width: 100%;
    justify-content: flex-start;
  }
  
  .button-group {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .button-group .el-button {
    flex: 1;
    min-width: 80px;
  }
}

.data-count {
  margin-left: auto;
  color: #666;
  font-size: 12px;
}

.status-indicator {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
}

.connection-details {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.connection-card {
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 0;
}

.el-textarea {
  font-family: 'Courier New', monospace;
}

/* 常用命令管理样式 */
.command-dialog {
  max-height: 80vh;
  overflow-y: auto;
}

.command-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  background: #fafafa;
}

.command-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.command-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
  transform: translateY(-1px);
}

.command-item:last-child {
  margin-bottom: 0;
}

.command-info {
  flex: 1;
  min-width: 0;
}

.command-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  font-size: 14px;
}

.command-content {
  font-family: 'Courier New', monospace;
  color: #606266;
  font-size: 12px;
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 3px;
  margin-bottom: 4px;
  word-break: break-all;
  border: 1px solid #e4e7ed;
}

.command-description {
  color: #909399;
  font-size: 11px;
  line-height: 1.4;
}

.command-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  margin-left: 12px;
}

.command-actions .el-button {
  padding: 4px 8px;
  font-size: 12px;
  min-width: auto;
}

.command-form {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.command-form h4 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.command-form .el-form-item {
  margin-bottom: 18px;
}

.command-form .el-input,
.command-form .el-textarea {
  font-size: 13px;
}

.command-form .el-textarea textarea {
  font-family: 'Courier New', monospace;
  line-height: 1.5;
}

.command-form .el-checkbox {
  margin-top: 8px;
}

.command-form .el-form-item__label {
  font-weight: 500;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.dialog-footer .left-actions {
  display: flex;
  gap: 10px;
}

.dialog-footer .right-actions {
  display: flex;
  gap: 10px;
}

.empty-commands {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.empty-commands .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.empty-commands p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .command-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .command-actions {
    width: 100%;
    justify-content: flex-end;
    margin-left: 0;
  }
  
  .dialog-footer {
    flex-direction: column;
    gap: 12px;
  }
  
  .dialog-footer .left-actions,
  .dialog-footer .right-actions {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .command-actions {
    flex-wrap: wrap;
  }
  
  .command-actions .el-button {
    flex: 1;
    min-width: 60px;
  }
}

/* 常用命令快捷操作区域样式 */
.quick-commands {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
  padding: 10px 0;
}

.quick-command-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.quick-command-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
  transform: translateY(-1px);
  background: #f0f9ff;
}

.quick-command-item .command-info {
  flex: 1;
  min-width: 0;
  margin-right: 12px;
}

.quick-command-item .command-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  font-size: 14px;
}

.quick-command-item .command-preview {
  font-family: 'Courier New', monospace;
  color: #606266;
  font-size: 12px;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  word-break: break-all;
}

.quick-command-item .command-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.quick-command-item .command-actions .el-button {
  padding: 6px 12px;
  font-size: 12px;
  min-width: auto;
}

.more-commands {
  grid-column: 1 / -1;
  text-align: center;
  padding: 10px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  background: #fafafa;
}

.more-commands .el-button {
  color: #909399;
  font-size: 13px;
}

.more-commands .el-button:hover {
  color: #409eff;
}

.empty-quick-commands {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.empty-quick-commands .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.empty-quick-commands p {
  margin: 0 0 16px 0;
  font-size: 14px;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .quick-commands {
    grid-template-columns: 1fr;
  }
  
  .quick-command-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .quick-command-item .command-info {
    width: 100%;
    margin-right: 0;
  }
  
  .quick-command-item .command-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .quick-command-item .command-actions {
    flex-wrap: wrap;
  }
  
  .quick-command-item .command-actions .el-button {
    flex: 1;
    min-width: 80px;
  }
}
</style>