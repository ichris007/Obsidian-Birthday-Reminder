import { Plugin, WorkspaceLeaf } from 'obsidian';
import { BirthdayReminderView, VIEW_TYPE } from './view';
import { BirthdayReminderSettings, DEFAULT_SETTINGS, BirthdayReminderSettingTab } from './settings';

export default class BirthdayReminderPlugin extends Plugin {
  settings: BirthdayReminderSettings;
  private view: BirthdayReminderView | null = null;

  async onload() {
    await this.loadSettings();
    
    // 注册视图
    this.registerView(
      VIEW_TYPE,
      (leaf: WorkspaceLeaf) => {
        this.view = new BirthdayReminderView(leaf, this);
        return this.view;
      }
    );
    
    // 添加 ribbon 图标
    this.addRibbonIcon('cake', '生日提醒', () => {
      this.activateView();
    });
    
    // 添加命令
    this.addCommand({
      id: 'show-birthday-reminder',
      name: '显示生日提醒面板',
      callback: () => this.activateView()
    });
    
    // 添加设置选项卡
    this.addSettingTab(new BirthdayReminderSettingTab(this.app, this));
  }
  
  async activateView() {
    const { workspace } = this.app;
    
    // 查找是否已有生日提醒视图
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];
    
    if (!leaf) {
      // 尝试获取右侧边栏
      const rightLeaf = workspace.getRightLeaf(false);
      if (rightLeaf) {
        leaf = rightLeaf;
        await leaf.setViewState({ type: VIEW_TYPE, active: true });
      } else {
        // 如果无法获取右侧 leaf，创建一个新的标签页
        const newLeaf = workspace.getLeaf('tab');
        if (newLeaf) {
          leaf = newLeaf;
          await leaf.setViewState({ type: VIEW_TYPE, active: true });
        }
      }
    }
    
    // 如果成功获取或创建了 leaf，则显示它
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }
  
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  
  async saveSettings() {
    await this.saveData(this.settings);
    // 通知视图刷新
    if (this.view) {
      this.view.refresh();
    }
  }
  
  onunload() {
    // 清理视图
    this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach(leaf => leaf.detach());
  }
}