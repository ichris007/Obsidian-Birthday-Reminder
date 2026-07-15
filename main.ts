import { Plugin, WorkspaceLeaf, TFile } from 'obsidian';
import { BirthdayReminderView, VIEW_TYPE } from './view';
import { BirthdayReminderSettings, DEFAULT_SETTINGS, BirthdayReminderSettingTab } from './settings';

export default class BirthdayReminderPlugin extends Plugin {
  settings: BirthdayReminderSettings;

  async onload() {
    await this.loadSettings();

    // 注册视图 - 不保存引用以避免内存泄漏
    this.registerView(
      VIEW_TYPE,
      (leaf: WorkspaceLeaf) => {
        return new BirthdayReminderView(leaf, this);
      }
    );

    // 添加 ribbon 图标
    this.addRibbonIcon('cake', '生日提醒', () => {
      this.activateView();
    });

    // 添加命令 - 使用简短 ID，不包含插件名
    this.addCommand({
      id: 'show',
      name: '显示生日提醒面板',
      callback: () => this.activateView()
    });

    // 添加设置选项卡
    this.addSettingTab(new BirthdayReminderSettingTab(this.app, this));

    // 监听文件变化以自动刷新视图
    this.setupFileWatcher();
  }

  setupFileWatcher(): void {
    const vault = this.app.vault;

    // 监听文件创建
    vault.on('create', (file) => {
      if (file instanceof TFile && file.path.endsWith('.md')) {
        this.refreshAllViews();
      }
    });

    // 监听文件删除
    vault.on('delete', (file) => {
      if (file instanceof TFile && file.path.endsWith('.md')) {
        this.refreshAllViews();
      }
    });

    // 监听文件重命名
    vault.on('rename', (file) => {
      if (file instanceof TFile && file.path.endsWith('.md')) {
        this.refreshAllViews();
      }
    });

    // 监听文件修改（frontmatter 变化）
    vault.on('modify', (file) => {
      if (file instanceof TFile && file.path.endsWith('.md')) {
        // 使用微延迟避免频繁刷新
        setTimeout(() => this.refreshAllViews(), 100);
      }
    });
  }

  refreshAllViews(): void {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    if (leaves.length > 0) {
      const view = leaves[0].view as BirthdayReminderView | null;
      if (view) {
        view.refresh();
      }
    }
  }
  
  async activateView(): Promise<void> {
    const { workspace } = this.app;

    // 查找是否已有生日提醒视图
    const leaves = workspace.getLeavesOfType(VIEW_TYPE);
    let leaf: WorkspaceLeaf | null = leaves.length > 0 ? leaves[0] : null;

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
  
  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    // 设置更改后刷新视图
    this.refreshAllViews();
  }
  
  onunload() {
    // 清理视图
    this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach(leaf => leaf.detach());
  }
}