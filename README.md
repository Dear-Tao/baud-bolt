# Baud Bolt - 串口通信应用程序

<div align="center">
  <img src="https://img.shields.io/badge/Vue.js-3.3.4-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue.js">
  <img src="https://img.shields.io/badge/Element_Plus-2.3.8-409EFF?style=for-the-badge&logo=element&logoColor=white" alt="Element Plus">
  <img src="https://img.shields.io/badge/Vite-4.4.5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</div>

## 📖 项目简介

Baud Bolt 是一个基于 Vue.js 3 开发的现代化串口通信应用程序，提供了直观的用户界面来管理串口连接、实时数据传输和参数配置。该应用程序特别适用于嵌入式开发、硬件调试和串口设备测试。

## ✨ 主要功能

### 🔌 串口通信
- **多串口支持**: 自动检测并列出可用串口
- **灵活配置**: 支持多种波特率、数据位、停止位配置
- **实时连接**: 一键连接/断开串口设备
- **状态监控**: 实时显示连接状态和通信参数

### 📊 数据传输
- **双向通信**: 支持数据发送和接收
- **多格式支持**: 文本和十六进制数据格式
- **自动发送**: 可配置定时自动发送功能
- **数据验证**: 发送前数据格式验证

### 📈 实时数据显示
- **数据流监控**: 实时显示收发数据流
- **统计信息**: 发送/接收数据统计
- **会话管理**: 会话时长和数据速率监控
- **数据导出**: 支持数据导出功能
- **暂停/继续**: 可暂停数据显示进行分析

### ⚙️ 参数配置
- **串口参数**: 默认连接参数配置
- **显示设置**: 数据显示格式和样式配置
- **系统设置**: 应用程序行为配置
- **配置管理**: 配置导入/导出功能

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/Dear-Tao/baud-bolt.git
   cd baud-bolt
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或者使用 yarn
   yarn install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   # 或者使用 yarn
   yarn dev
   ```

4. **访问应用**
   
   打开浏览器访问 `http://localhost:3000`

### 构建生产版本

```bash
npm run build
# 或者使用 yarn
yarn build
```

构建完成后，生产文件将在 `dist` 目录中。

## 📱 使用指南

### 1. 串口连接

1. 在「串口通信」页面选择目标串口
2. 配置通信参数（波特率、数据位、停止位）
3. 点击「连接」按钮建立连接
4. 连接成功后状态指示器变为绿色

### 2. 数据发送

1. 在发送区域输入要发送的数据
2. 选择数据格式（文本或十六进制）
3. 点击「发送」按钮或启用自动发送
4. 发送的数据会在数据流中显示

### 3. 数据监控

1. 切换到「数据显示」页面
2. 查看实时数据流和统计信息
3. 使用暂停功能分析特定数据
4. 导出数据进行进一步分析

### 4. 参数配置

1. 在「参数配置」页面设置默认参数
2. 配置数据显示格式和行为
3. 保存配置以便下次使用

## 🛠️ 技术栈

- **前端框架**: Vue.js 3.3.4
- **UI 组件库**: Element Plus 2.3.8
- **路由管理**: Vue Router 4.2.4
- **构建工具**: Vite 4.4.5
- **开发语言**: JavaScript/HTML/CSS

## 📁 项目结构

```
baud-bolt/
├── src/
│   ├── components/          # 组件目录
│   │   ├── SerialCommunication.vue    # 串口通信组件
│   │   ├── DataDisplay.vue            # 数据显示组件
│   │   └── ParameterConfig.vue        # 参数配置组件
│   ├── App.vue             # 主应用组件
│   └── main.js             # 应用入口文件
├── dist/                   # 构建输出目录
├── index.html              # HTML 模板
├── package.json            # 项目配置文件
├── vite.config.js          # Vite 配置文件
└── README.md              # 项目说明文档
```

## 🔧 配置说明

### Vite 配置

项目使用 Vite 作为构建工具，配置文件为 `vite.config.js`：

- 开发服务器端口：3000
- 自动打开浏览器
- 构建输出目录：dist

### 串口配置

支持的串口参数：

- **波特率**: 9600, 19200, 38400, 57600, 115200
- **数据位**: 7, 8
- **停止位**: 1, 2
- **校验位**: 无, 奇校验, 偶校验

## 🤝 贡献指南

我们欢迎所有形式的贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 使用 ESLint 进行代码检查
- 遵循 Vue.js 官方风格指南
- 提交信息使用约定式提交格式
- 添加适当的注释和文档

## 📝 更新日志

### v1.0.0 (2024-01-01)

- ✨ 初始版本发布
- 🔌 基础串口通信功能
- 📊 实时数据显示
- ⚙️ 参数配置管理
- 🎨 现代化 UI 设计

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👥 作者

- **Dear-Tao** - *初始开发* - [GitHub](https://github.com/Dear-Tao)

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - 基于 Vue 3 的组件库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具

## 📞 支持

如果您在使用过程中遇到问题或有任何建议，请：

- 提交 [Issue](https://github.com/Dear-Tao/baud-bolt/issues)
- 发送邮件至项目维护者
- 查看项目 [Wiki](https://github.com/Dear-Tao/baud-bolt/wiki)

---

<div align="center">
  <p>⭐ 如果这个项目对您有帮助，请给它一个星标！</p>
  <p>Made with ❤️ by Dear-Tao</p>
</div>