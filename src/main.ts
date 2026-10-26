import { Command, Plugin, TAbstractFile, TFile, WorkspaceLeaf } from 'obsidian';
import { BirthdayReminderView, VIEW_TYPE } from './view';
import { BirthdayReminderSettings, DEFAULT_SETTINGS, BirthdayReminderSettingTab } from './settings';
import { birthdaySignatureFor } from './birthdays';
import { ReminderService } from './notifications';
import { getLocale, Language } from './locales';
import { isRecord } from './utils';

export default class BirthdayReminderPlugin extends Plugin {
  settings!: BirthdayReminderSettings;
  /** 各文件上一次渲染时的生日属性签名，用于判断 frontmatter 是否真的变了 */
  birthdaySnapshots: Map<string, string> = new Map();
  reminder!: ReminderService;
  /** 命令与 ribbon 图标只在 onload 注册一次，语言切换时要手动改名字 */
  private commandShow?: Command;
  private commandCheck?: Command;
  private ribbonEl?: HTMLElement;

  async onload() {
    await this.loadSettings();

    // 注册视图 - 不保存引用以避免内存泄漏
    this.registerView(
      VIEW_TYPE,
      (leaf: WorkspaceLeaf) => {
        return new BirthdayReminderView(leaf, this);
      }
    );

    const locale = getLocale(this.settings.language as Language);

    // 添加 ribbon 图标
    this.ribbonEl = this.addRibbonIcon('cake', locale.ribbonTooltip, () => {
      void this.activateView();
    });

    // 添加命令 - 使用简短 ID，不包含插件名
    this.commandShow = this.addCommand({
      id: 'show',
      name: locale.commandShowPanel,
      callback: () => void this.activateView()
    });

    this.commandCheck = this.addCommand({
      id: 'check-reminders',
      name: locale.commandCheckReminders,
      callback: () => this.reminder.check(true)
    });

    // 添加设置选项卡
    this.addSettingTab(new BirthdayReminderSettingTab(this.app, this));

    // 监听文件变化以自动刷新视图
    this.setupFileWatcher();

    // 每日提醒：布局就绪后再启动，避免启动瞬间弹通知
    this.reminder = new ReminderService(this);
    this.app.workspace.onLayoutReady(() => this.reminder.start());
  }

  setupFileWatcher(): void {
    const isMarkdown = (file: TAbstractFile): boolean =>
      file instanceof TFile && file.path.endsWith('.md');

    const refreshOnFileChange = (file: TAbstractFile): void => {
      if (isMarkdown(file)) this.refreshAllViews();
    };

    // 用 registerEvent 注册，插件卸载时自动解绑，避免监听器残留
    this.registerEvent(this.app.vault.on('create', refreshOnFileChange));
    this.registerEvent(this.app.vault.on('delete', refreshOnFileChange));
    this.registerEvent(this.app.vault.on('rename', refreshOnFileChange));

    // 只在生日属性真的变化时刷新：正文编辑、光标移动都不再触发全量重渲染
    this.registerEvent(
      this.app.metadataCache.on('changed', (file, _data, cache) => {
        if (!isMarkdown(file)) return;
        const frontmatter = isRecord(cache.frontmatter) ? cache.frontmatter : null;
        const next = birthdaySignatureFor(frontmatter, this.settings);
        if (this.birthdaySnapshots.get(file.path) === next) return;
        this.birthdaySnapshots.set(file.path, next);
        this.refreshAllViews();
      })
    );
  }

  refreshAllViews(): void {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
      if (leaf.view instanceof BirthdayReminderView) {
        leaf.view.refresh();
      }
    }
  }

  /**
   * 语言切换后同步命令面板与 ribbon 提示。
   * `addCommand` / `addRibbonIcon` 只在 onload 执行一次，命令名不会跟着设置走：
   * 不同步的话，切成英文只改了视图和设置页，命令面板里仍然是中文，要重启才生效。
   */
  refreshLocalizedText(): void {
    const locale = getLocale(this.settings.language as Language);
    if (this.commandShow) this.commandShow.name = locale.commandShowPanel;
    if (this.commandCheck) this.commandCheck.name = locale.commandCheckReminders;
    if (this.ribbonEl) this.ribbonEl.setAttribute('aria-label', locale.ribbonTooltip);
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
      await workspace.revealLeaf(leaf);
    }
  }

  async loadSettings(): Promise<void> {
    // loadData() 返回 any，先断言成目标类型，否则 @typescript-eslint/no-unsafe-assignment 会报
    const data = (await this.loadData()) as Partial<BirthdayReminderSettings> | undefined;
    this.settings = { ...DEFAULT_SETTINGS, ...(data ?? {}) };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    // 设置更改后刷新视图
    this.refreshAllViews();
  }

  onunload() {
    this.reminder?.stop();
    // 不要在这里 detachLeavesOfType：那会把用户拖到别处的标签页弹回默认位置。
    // Obsidian 卸载插件时会自行处理残留 leaf（下次启动时该 leaf 因找不到视图类型而变空）。
  }
}
