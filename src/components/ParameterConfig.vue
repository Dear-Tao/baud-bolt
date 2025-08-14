<template>
  <div class="parameter-config">
    <!-- 配置分类标签页 -->
    <el-tabs v-model="activeTab" type="card" class="config-tabs">
      <!-- 串口配置 -->
      <el-tab-pane label="串口配置" name="serial">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Connection /></el-icon>
              <span>串口通信参数</span>
              <el-button 
                size="small" 
                type="primary" 
                @click="saveSerialConfig"
                style="margin-left: auto;"
              >
                保存配置
              </el-button>
            </div>
          </template>
          
          <el-form :model="serialConfig" label-width="120px" class="config-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="默认波特率">
                  <el-select v-model="serialConfig.defaultBaudRate" style="width: 100%;">
                    <el-option label="9600" value="9600" />
                    <el-option label="19200" value="19200" />
                    <el-option label="38400" value="38400" />
                    <el-option label="57600" value="57600" />
                    <el-option label="115200" value="115200" />
                    <el-option label="230400" value="230400" />
                    <el-option label="460800" value="460800" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="默认数据位">
                  <el-select v-model="serialConfig.defaultDataBits" style="width: 100%;">
                    <el-option label="7" value="7" />
                    <el-option label="8" value="8" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="默认停止位">
                  <el-select v-model="serialConfig.defaultStopBits" style="width: 100%;">
                    <el-option label="1" value="1" />
                    <el-option label="2" value="2" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="默认校验位">
                  <el-select v-model="serialConfig.defaultParity" style="width: 100%;">
                    <el-option label="无" value="none" />
                    <el-option label="奇校验" value="odd" />
                    <el-option label="偶校验" value="even" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="连接超时(ms)">
                  <el-input-number 
                    v-model="serialConfig.connectionTimeout" 
                    :min="1000" 
                    :max="30000" 
                    :step="1000"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="读取超时(ms)">
                  <el-input-number 
                    v-model="serialConfig.readTimeout" 
                    :min="100" 
                    :max="10000" 
                    :step="100"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="自动重连">
              <el-switch v-model="serialConfig.autoReconnect" />
              <span style="margin-left: 10px; color: #666;">连接断开时自动尝试重连</span>
            </el-form-item>
            
            <el-form-item label="重连间隔(s)" v-if="serialConfig.autoReconnect">
              <el-input-number 
                v-model="serialConfig.reconnectInterval" 
                :min="1" 
                :max="60" 
                :step="1"
                style="width: 200px;"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <!-- 数据显示配置 -->
      <el-tab-pane label="数据显示" name="display">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Monitor /></el-icon>
              <span>数据显示参数</span>
              <el-button 
                size="small" 
                type="primary" 
                @click="saveDisplayConfig"
                style="margin-left: auto;"
              >
                保存配置
              </el-button>
            </div>
          </template>
          
          <el-form :model="displayConfig" label-width="150px" class="config-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="最大显示行数">
                  <el-input-number 
                    v-model="displayConfig.maxDisplayLines" 
                    :min="100" 
                    :max="10000" 
                    :step="100"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="刷新间隔(ms)">
                  <el-input-number 
                    v-model="displayConfig.refreshInterval" 
                    :min="50" 
                    :max="5000" 
                    :step="50"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="默认显示格式">
                  <el-select v-model="displayConfig.defaultFormat" style="width: 100%;">
                    <el-option label="ASCII" value="ascii" />
                    <el-option label="十六进制" value="hex" />
                    <el-option label="两者都显示" value="both" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="时间戳格式">
                  <el-select v-model="displayConfig.timestampFormat" style="width: 100%;">
                    <el-option label="HH:mm:ss" value="HH:mm:ss" />
                    <el-option label="HH:mm:ss.SSS" value="HH:mm:ss.SSS" />
                    <el-option label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="自动滚动">
              <el-switch v-model="displayConfig.autoScroll" />
              <span style="margin-left: 10px; color: #666;">新数据到达时自动滚动到底部</span>
            </el-form-item>
            
            <el-form-item label="高亮关键词">
              <el-switch v-model="displayConfig.highlightKeywords" />
              <span style="margin-left: 10px; color: #666;">在数据中高亮显示关键词</span>
            </el-form-item>
            
            <el-form-item label="关键词列表" v-if="displayConfig.highlightKeywords">
              <el-tag
                v-for="(keyword, index) in displayConfig.keywords"
                :key="index"
                closable
                @close="removeKeyword(index)"
                style="margin-right: 10px; margin-bottom: 5px;"
              >
                {{ keyword }}
              </el-tag>
              <el-input
                v-if="keywordInputVisible"
                ref="keywordInput"
                v-model="keywordInputValue"
                size="small"
                style="width: 120px;"
                @keyup.enter="addKeyword"
                @blur="addKeyword"
              />
              <el-button
                v-else
                size="small"
                @click="showKeywordInput"
              >
                + 添加关键词
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <!-- 数据处理配置 -->
      <el-tab-pane label="数据处理" name="processing">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>数据处理参数</span>
              <el-button 
                size="small" 
                type="primary" 
                @click="saveProcessingConfig"
                style="margin-left: auto;"
              >
                保存配置
              </el-button>
            </div>
          </template>
          
          <el-form :model="processingConfig" label-width="150px" class="config-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="数据缓冲区大小">
                  <el-input-number 
                    v-model="processingConfig.bufferSize" 
                    :min="1024" 
                    :max="1048576" 
                    :step="1024"
                    style="width: 100%;"
                  />
                  <div class="form-help">字节数，建议值: 8192-65536</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="数据包分隔符">
                  <el-input 
                    v-model="processingConfig.packetDelimiter" 
                    placeholder="如: \n, \r\n, ;等"
                    style="width: 100%;"
                  />
                  <div class="form-help">用于分割数据包的字符</div>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="最大包长度">
                  <el-input-number 
                    v-model="processingConfig.maxPacketLength" 
                    :min="1" 
                    :max="65536" 
                    :step="1"
                    style="width: 100%;"
                  />
                  <div class="form-help">超过此长度的包将被截断</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="数据编码">
                  <el-select v-model="processingConfig.encoding" style="width: 100%;">
                    <el-option label="UTF-8" value="utf-8" />
                    <el-option label="ASCII" value="ascii" />
                    <el-option label="GBK" value="gbk" />
                    <el-option label="Latin1" value="latin1" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="数据验证">
              <el-switch v-model="processingConfig.enableValidation" />
              <span style="margin-left: 10px; color: #666;">启用数据包完整性验证</span>
            </el-form-item>
            
            <el-form-item label="错误处理模式" v-if="processingConfig.enableValidation">
              <el-radio-group v-model="processingConfig.errorHandling">
                <el-radio label="ignore">忽略错误</el-radio>
                <el-radio label="log">记录错误</el-radio>
                <el-radio label="alert">弹出警告</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="数据过滤">
              <el-switch v-model="processingConfig.enableFiltering" />
              <span style="margin-left: 10px; color: #666;">启用数据过滤功能</span>
            </el-form-item>
            
            <el-form-item label="过滤规则" v-if="processingConfig.enableFiltering">
              <el-input 
                v-model="processingConfig.filterPattern" 
                type="textarea" 
                :rows="3"
                placeholder="输入正则表达式过滤规则，每行一个"
              />
              <div class="form-help">使用正则表达式定义过滤规则</div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <!-- 系统配置 -->
      <el-tab-pane label="系统设置" name="system">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Tools /></el-icon>
              <span>系统设置</span>
              <el-button 
                size="small" 
                type="primary" 
                @click="saveSystemConfig"
                style="margin-left: auto;"
              >
                保存配置
              </el-button>
            </div>
          </template>
          
          <el-form :model="systemConfig" label-width="150px" class="config-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="界面主题">
                  <el-select v-model="systemConfig.theme" style="width: 100%;">
                    <el-option label="浅色主题" value="light" />
                    <el-option label="深色主题" value="dark" />
                    <el-option label="自动切换" value="auto" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="语言设置">
                  <el-select v-model="systemConfig.language" style="width: 100%;">
                    <el-option label="简体中文" value="zh-CN" />
                    <el-option label="English" value="en-US" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="日志级别">
                  <el-select v-model="systemConfig.logLevel" style="width: 100%;">
                    <el-option label="调试" value="debug" />
                    <el-option label="信息" value="info" />
                    <el-option label="警告" value="warn" />
                    <el-option label="错误" value="error" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="日志保存天数">
                  <el-input-number 
                    v-model="systemConfig.logRetentionDays" 
                    :min="1" 
                    :max="365" 
                    :step="1"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="自动保存配置">
              <el-switch v-model="systemConfig.autoSaveConfig" />
              <span style="margin-left: 10px; color: #666;">配置更改时自动保存</span>
            </el-form-item>
            
            <el-form-item label="启动时恢复会话">
              <el-switch v-model="systemConfig.restoreSession" />
              <span style="margin-left: 10px; color: #666;">应用启动时恢复上次的连接状态</span>
            </el-form-item>
            
            <el-form-item label="性能监控">
              <el-switch v-model="systemConfig.enablePerformanceMonitor" />
              <span style="margin-left: 10px; color: #666;">监控应用性能指标</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 配置操作区域 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <el-icon><FolderOpened /></el-icon>
          <span>配置管理</span>
        </div>
      </template>
      
      <div class="config-actions">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-button type="primary" @click="exportConfig" style="width: 100%;">
              <el-icon><Download /></el-icon>
              导出配置
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-upload
              ref="configUpload"
              :auto-upload="false"
              :show-file-list="false"
              accept=".json"
              :on-change="importConfig"
              style="width: 100%;"
            >
              <el-button style="width: 100%;">
                <el-icon><Upload /></el-icon>
                导入配置
              </el-button>
            </el-upload>
          </el-col>
          <el-col :span="8">
            <el-button type="danger" @click="resetConfig" style="width: 100%;">
              <el-icon><RefreshLeft /></el-icon>
              重置为默认
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ParameterConfig',
  data() {
    return {
      activeTab: 'serial',
      
      // 串口配置
      serialConfig: {
        defaultBaudRate: '9600',
        defaultDataBits: '8',
        defaultStopBits: '1',
        defaultParity: 'none',
        connectionTimeout: 5000,
        readTimeout: 1000,
        autoReconnect: true,
        reconnectInterval: 5
      },
      
      // 显示配置
      displayConfig: {
        maxDisplayLines: 1000,
        refreshInterval: 100,
        defaultFormat: 'both',
        timestampFormat: 'HH:mm:ss',
        autoScroll: true,
        highlightKeywords: true,
        keywords: ['ERROR', 'WARNING', 'OK', 'FAIL']
      },
      
      // 数据处理配置
      processingConfig: {
        bufferSize: 8192,
        packetDelimiter: '\n',
        maxPacketLength: 1024,
        encoding: 'utf-8',
        enableValidation: true,
        errorHandling: 'log',
        enableFiltering: false,
        filterPattern: ''
      },
      
      // 系统配置
      systemConfig: {
        theme: 'light',
        language: 'zh-CN',
        logLevel: 'info',
        logRetentionDays: 30,
        autoSaveConfig: true,
        restoreSession: true,
        enablePerformanceMonitor: false
      },
      
      // 关键词输入
      keywordInputVisible: false,
      keywordInputValue: ''
    }
  },
  
  mounted() {
    this.loadConfigs()
  },
  
  methods: {
    // 加载配置
    loadConfigs() {
      try {
        const savedConfigs = localStorage.getItem('serialAppConfigs')
        if (savedConfigs) {
          const configs = JSON.parse(savedConfigs)
          this.serialConfig = { ...this.serialConfig, ...configs.serial }
          this.displayConfig = { ...this.displayConfig, ...configs.display }
          this.processingConfig = { ...this.processingConfig, ...configs.processing }
          this.systemConfig = { ...this.systemConfig, ...configs.system }
        }
      } catch (error) {
        console.error('加载配置失败:', error)
        this.$message.error('加载配置失败')
      }
    },
    
    // 保存串口配置
    saveSerialConfig() {
      this.saveConfig('serial', this.serialConfig)
    },
    
    // 保存显示配置
    saveDisplayConfig() {
      this.saveConfig('display', this.displayConfig)
    },
    
    // 保存处理配置
    saveProcessingConfig() {
      this.saveConfig('processing', this.processingConfig)
    },
    
    // 保存系统配置
    saveSystemConfig() {
      this.saveConfig('system', this.systemConfig)
    },
    
    // 保存配置到本地存储
    saveConfig(type, config) {
      try {
        const allConfigs = this.getAllConfigs()
        allConfigs[type] = config
        localStorage.setItem('serialAppConfigs', JSON.stringify(allConfigs))
        this.$message.success(`${this.getConfigTypeName(type)}配置已保存`)
      } catch (error) {
        console.error('保存配置失败:', error)
        this.$message.error('保存配置失败')
      }
    },
    
    // 获取所有配置
    getAllConfigs() {
      try {
        const savedConfigs = localStorage.getItem('serialAppConfigs')
        return savedConfigs ? JSON.parse(savedConfigs) : {}
      } catch (error) {
        return {}
      }
    },
    
    // 获取配置类型名称
    getConfigTypeName(type) {
      const names = {
        serial: '串口',
        display: '显示',
        processing: '数据处理',
        system: '系统'
      }
      return names[type] || type
    },
    
    // 添加关键词
    addKeyword() {
      if (this.keywordInputValue && !this.displayConfig.keywords.includes(this.keywordInputValue)) {
        this.displayConfig.keywords.push(this.keywordInputValue)
      }
      this.keywordInputVisible = false
      this.keywordInputValue = ''
    },
    
    // 移除关键词
    removeKeyword(index) {
      this.displayConfig.keywords.splice(index, 1)
    },
    
    // 显示关键词输入框
    showKeywordInput() {
      this.keywordInputVisible = true
      this.$nextTick(() => {
        this.$refs.keywordInput.focus()
      })
    },
    
    // 导出配置
    exportConfig() {
      try {
        const allConfigs = {
          serial: this.serialConfig,
          display: this.displayConfig,
          processing: this.processingConfig,
          system: this.systemConfig,
          exportTime: new Date().toISOString(),
          version: '1.0.0'
        }
        
        const configJson = JSON.stringify(allConfigs, null, 2)
        const blob = new Blob([configJson], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `串口应用配置_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        this.$message.success('配置导出成功')
      } catch (error) {
        console.error('导出配置失败:', error)
        this.$message.error('导出配置失败')
      }
    },
    
    // 导入配置
    importConfig(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const configs = JSON.parse(e.target.result)
          
          // 验证配置格式
          if (!this.validateConfigFormat(configs)) {
            this.$message.error('配置文件格式不正确')
            return
          }
          
          // 应用配置
          if (configs.serial) this.serialConfig = { ...this.serialConfig, ...configs.serial }
          if (configs.display) this.displayConfig = { ...this.displayConfig, ...configs.display }
          if (configs.processing) this.processingConfig = { ...this.processingConfig, ...configs.processing }
          if (configs.system) this.systemConfig = { ...this.systemConfig, ...configs.system }
          
          // 保存到本地存储
          localStorage.setItem('serialAppConfigs', JSON.stringify({
            serial: this.serialConfig,
            display: this.displayConfig,
            processing: this.processingConfig,
            system: this.systemConfig
          }))
          
          this.$message.success('配置导入成功')
        } catch (error) {
          console.error('导入配置失败:', error)
          this.$message.error('配置文件解析失败')
        }
      }
      reader.readAsText(file.raw)
    },
    
    // 验证配置格式
    validateConfigFormat(configs) {
      // 简单的格式验证
      return typeof configs === 'object' && configs !== null
    },
    
    // 重置配置
    resetConfig() {
      this.$confirm('确定要重置所有配置为默认值吗？此操作不可撤销。', '确认重置', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 重置为默认值
        this.serialConfig = {
          defaultBaudRate: '9600',
          defaultDataBits: '8',
          defaultStopBits: '1',
          defaultParity: 'none',
          connectionTimeout: 5000,
          readTimeout: 1000,
          autoReconnect: true,
          reconnectInterval: 5
        }
        
        this.displayConfig = {
          maxDisplayLines: 1000,
          refreshInterval: 100,
          defaultFormat: 'both',
          timestampFormat: 'HH:mm:ss',
          autoScroll: true,
          highlightKeywords: true,
          keywords: ['ERROR', 'WARNING', 'OK', 'FAIL']
        }
        
        this.processingConfig = {
          bufferSize: 8192,
          packetDelimiter: '\n',
          maxPacketLength: 1024,
          encoding: 'utf-8',
          enableValidation: true,
          errorHandling: 'log',
          enableFiltering: false,
          filterPattern: ''
        }
        
        this.systemConfig = {
          theme: 'light',
          language: 'zh-CN',
          logLevel: 'info',
          logRetentionDays: 30,
          autoSaveConfig: true,
          restoreSession: true,
          enablePerformanceMonitor: false
        }
        
        // 清除本地存储
        localStorage.removeItem('serialAppConfigs')
        
        this.$message.success('配置已重置为默认值')
      })
    }
  }
}
</script>

<style scoped>
.parameter-config {
  max-width: 1200px;
  margin: 0 auto;
}

.config-tabs {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.config-form {
  padding: 20px 0;
}

.config-form .el-form-item {
  margin-bottom: 24px;
}

.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.config-actions {
  padding: 20px 0;
}

.config-actions .el-button {
  height: 40px;
}

.el-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.el-input-number {
  width: 100%;
}

.el-upload {
  width: 100%;
}

.el-upload .el-button {
  width: 100%;
}
</style>