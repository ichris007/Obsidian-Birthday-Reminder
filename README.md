# Obsidian-生日提醒
## 1 📖 简介

**Birthday Reminder** 是一款为 Obsidian 设计的生日提醒插件，帮助你轻松管理亲朋好友、同事客户的重要生日信息。插件支持公历/农历转换、生肖星座显示、智能日历视图，并自动适配侧边栏和主窗口布局。

无论你是用 Obsidian 管理个人生活，还是作为 CRM 工具管理客户关系，这款插件都能让你的生日提醒变得优雅而高效。

（👇下方有界面预览）

## 2 ✨ 功能特点

### 2.1 🎯 核心功能

|功能|说明|
|---|---|
|**可配置生日属性**|✨ 支持自定义 frontmatter 属性名，兼容 `birthday`、`date_of_birth`、`DOB` 等任意命名|
|**智能生日计算**|自动计算下一个生日日期和剩余天数，准确判断今年生日是否已过|
|**年龄自动计算**|根据出生日期自动计算即将到来的年龄|
|**农历转换**|使用 `solarlunar` 精确转换公历到农历，支持闰月显示|
|**生肖星座**|自动显示生肖和星座信息，增添文化趣味|
|**目录过滤**|可指定扫描特定文件夹，避免扫描整个仓库|

### 2.2 📊 数据统计

- **统计卡片**：总人数、今日生日、7天内生日、30天内生日一目了然
- **自动分组**：今日生日、最近一周、最近一个月、更远的生日分类显示
- **排序展示**：按剩余天数自动排序，即将到来的生日优先显示

### 2.3 📅 日历视图

- **月历显示**：以日历形式展示所有生日，生日日期高亮显示
- **月份导航**：支持上月/下月切换，一键返回今天
- **生日预览**：日历格子上直接显示当天过生日的人名
- **点击跳转**：点击任意生日卡片或日历格子，直接跳转到对应笔记

### 2.4 🎨 界面适配

- **响应式布局**：自动检测窗口宽度，侧边栏模式紧凑显示，主窗口模式完整显示
- **多套配色**：5种内置配色方案（默认、温暖橙、清新蓝、自然绿、优雅紫）
- **深色/浅色主题**：完美适配 Obsidian 的深色和浅色主题

### 2.5 🌐 多语言支持

- **中文/英文**：支持界面语言切换，满足不同用户需求
- **文本本地化**：所有界面文本完整翻译，使用体验一致

### 2.6 ⚙️ 高度可配置

|配置项|说明|
|---|---|
|**生日属性名称**|✨ 自定义 frontmatter 属性名，默认 `birthday`，支持 `date_of_birth`、`DOB` 等|
|目标文件夹|指定扫描的文件夹路径|
|显示月数|日历视图显示的月份数量（1-6个月）|
|配色方案|5种主题配色自由切换|
|农历显示|开关农历日期显示|
|生肖星座|开关生肖星座显示|
|日历视图|开关月历显示|
|统计卡片|开关顶部统计信息|
|今日高亮|开关今日生日特殊高亮|
|界面语言|中文/English 切换|


## 3 🌟 亮点特色

### 3.1 可配置的生日属性

不再局限于 `birthday` 属性名！你可以使用任何喜欢的属性名：

**方式一：使用默认属性**

```
birthday: 1990-05-20
```

**方式二：自定义为 date_of_birth**

```
date_of_birth: 1990-05-20
```

**方式三：自定义为 DOB**

```
DOB: 1990-05-20
```


**只需在插件设置中配置对应的属性名，即可自动识别！**

### 3.2 无需额外属性，一个字段搞定

只需在笔记 frontmatter 中添加生日属性，所有功能自动生效。

### 3.3 侧边栏与主窗口完美适配

- 拖拽到侧边栏 → 自动切换紧凑模式，节省空间
- 拖拽到主窗口 → 自动切换完整模式，显示更多信息

### 3.4 农历精确转换

使用专业 `solarlunar` 库，支持 1900-2100 年农历精确转换，正确处理闰月。

### 3.5 优雅的日历视图

- 月初月末自动补全上月下月日期
- 跨月日期以半透明显示
- 今日日期特殊边框高亮
- 生日格子支持悬停提示

### 3.6 一键跳转笔记

点击任意生日卡片或日历中的生日人名，立即打开对应笔记，无需手动搜索。

### 3.7 性能优化

- 使用 `ResizeObserver` 监听窗口变化，实时调整布局
- 生日数据按月建立索引，日历渲染 O(1) 复杂度
- 每小时自动刷新一次数据


## 4 📸 界面预览

### 4.1 主窗口模式（完整布局）

<img src="https://github.com/ichris007/Obsidian-Birthday-Reminder/blob/main/demo/bd_reminder_fullwide_cn.jpg" width="70%">
<img src="https://raw.githubusercontent.com/ichris007/Obsidian-Birthday-Reminder/main/demo/bd_reminder_calendar_cn.jpg" width="70%">

### 4.2 侧边栏模式（紧凑布局）
<img src="https://raw.githubusercontent.com/ichris007/Obsidian-Birthday-Reminder/main/demo/bd_reminder_sidebar_cn.jpg" width="70%">

### 4.3 插件设置
<img src="https://raw.githubusercontent.com/ichris007/Obsidian-Birthday-Reminder/main/demo/bd_reminder_settings_cn.jpg" width="70%">

## 5 🚀 快速开始

### 5.1 安装方式

目前还没有上架社区插件商店。
可以通过以下方式安装：

#### 方法一：通过 BRAT 设置面板添加
1. 打开 **设置** → **BRAT**（在第三方插件列表中找到）
2. 点击 **Add Beta Plugin** 按钮
3. 在弹出的对话框中输入：
    - **Repository**: `https://github.com/ichris007/Obsidian-Birthday-Reminder`
    - **Name**: `Birthday Reminder`（可选）
4. 点击 **Add Plugin**
5. BRAT 会自动下载并安装

#### 方法二：手动安装：
1. 从 [Releases](https://github.com/ichris007/Obsidian-Birthday-Reminder/releases/tag/v1.0.0) 下载最新版本的`main.js`、`manifest.json`、
2. 解压到 `.obsidian/plugins/birthday-reminder/`
3. 重启 Obsidian 并启用插件

### 5.2 配置步骤

1. **启用插件**后，点击插件旁边的「设置」图标
2. **设置生日属性名称**（可选）：如果你使用自定义属性名如 `date_of_birth`，在此输入
3. **设置目标文件夹**：指定包含人员笔记的文件夹（如 `07Relations/`）
4. **根据需要调整其他选项**（配色、显示内容等）
5. **在目标文件夹的笔记中添加生日属性**：

以属性为`birthday`为例：

```
birthday: 1990-05-20
```

### 5.3 使用方式

- 点击左侧边栏的蛋糕图标 🎂 打开生日提醒面板
- 或使用命令面板（Ctrl/Cmd + P）输入「生日提醒」打开


## 6 📝 更新日志

### 6.1 v1.0.0 (2026-03-21)

- ✨ **首次发布**
- 🎯 **可配置生日属性**：支持自定义 frontmatter 属性名（`birthday`、`date_of_birth`、`DOB` 等）
- 🎯 智能生日计算和年龄计算
- 🌙 农历转换（使用 solarlunar 库）
- 🐉 生肖星座显示
- 📅 日历视图，支持月份导航
- 🎨 5套配色方案
- 🌐 中英文双语支持
- 📱 响应式布局，自动适配侧边栏/主窗口
- ⚙️ 丰富的可配置选项


## 7 🙏 致谢

- [lunar-javascript](https://github.com/6tail/lunar-javascript) - 农历计算库
- [solarlunar](https://github.com/6tail/solarlunar) - 公历农历转换
- [Obsidian](https://obsidian.md/) - 优秀的笔记软件


## 8 📄 开源协议

MIT License

## 9 🔗 相关链接

- [GitHub 仓库](https://github.com/ichris007/Obsidian-Birthday-Reminder)
- [问题反馈](https://github.com/yourname/obsidian-birthday-reminder/issues)


## 10 💡 常见问题

### 10.1 Q: 我使用的是 `date_of_birth` 属性，能支持吗？

A: 可以！在插件设置中将「生日属性名称」改为 `date_of_birth` 即可。

### 10.2 Q: 能否支持多个不同的属性名同时使用？

A: 目前只支持单一属性名，但你可以选择最常用的那个，其他笔记只需统一修改即可。

### 10.3 Q: 农历日期准确吗？

A: 插件使用专业 `solarlunar` 库，支持 1900-2100 年的精确农历转换，包含闰月处理。

### 11.4 Q: 侧边栏和主窗口的布局会自动切换吗？

A: 是的！插件会自动检测窗口宽度，小于 450px 时切换为紧凑模式，大于等于 450px 时切换为完整模式。


