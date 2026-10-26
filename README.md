# Obsidian Birthday Reminder

## 1 📖 Birthday Reminder

[English](https://github.com/ichris007/Obsidian-Birthday-Reminder/blob/main/README.md) | [中文文档](https://github.com/ichris007/Obsidian-Birthday-Reminder/blob/main/README-ZH.md)

[![Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%237c3aed&label=downloads&query=%24%5B%22birthday-reminder%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=birthday-reminder) ![Obsidian](https://img.shields.io/badge/dynamic/json?query=%24.minAppVersion&url=https%3A%2F%2Fraw.githubusercontent.com%2Fichris007%2FObsidian-Birthday-Reminder%2Fmain%2Fmanifest.json&label=Obsidian&color=7c3aed&prefix=v) [![GitHub stars](https://img.shields.io/github/stars/ichris007/Obsidian-Birthday-Reminder?style=flat&color=%237c3aed)](https://github.com/ichris007/Obsidian-Birthday-Reminder/stargazers) [![License](https://img.shields.io/github/license/ichris007/Obsidian-Birthday-Reminder?color=%237c3aed)](https://github.com/ichris007/Obsidian-Birthday-Reminder/blob/main/LICENSE)

[Report a bug](https://github.com/ichris007/Obsidian-Birthday-Reminder/issues/new) · [Request a feature](https://github.com/ichris007/Obsidian-Birthday-Reminder/issues/new)

An Obsidian plugin designed to help you easily manage important birthday information for friends, family, colleagues, and clients. The plugin supports Gregorian/Lunar calendar conversion, zodiac and Chinese animal sign display, intelligent calendar view, and automatically adapts to sidebar and main window layouts.

Whether you use Obsidian for personal life management or as a CRM tool for client relationships, this plugin makes birthday reminders elegant and efficient.

(Preview below)

>This plugin is fully AI-generated, so please bear with me if there are any issues.


## 2 ✨ Features

### 2.1 🎯 Core Features

|Feature|Description|
|---|---|
|**Configurable Birthday Property**|✨ Customize frontmatter property name – supports any naming like `birthday`, `date_of_birth`, `DOB`, etc.|
|**Intelligent Birthday Calculation**|Automatically calculates next birthday date and days remaining, accurately determines if this year's birthday has passed|
|**Automatic Age Calculation**|Automatically calculates upcoming age based on birth date|
|**Lunar Calendar Conversion**|Uses `solarlunar` for precise Gregorian to Lunar conversion, supports leap months|
|**Zodiac & Animal Signs**|Automatically displays zodiac sign and Chinese animal sign, adding cultural interest|
|**Folder Filtering**|Scan specific folders to avoid scanning entire vault|
|**Lunar Birthday**|✨ Record birthdays by the lunar calendar, leap month supported|
|**Daily Reminder**|Send one notification a day listing today's and upcoming birthdays|
|**Search & Sort**|Filter by name or alias (with a one-click clear button), sort by days left / name / age|

### 2.2 📊 Statistics

- **Statistics Cards**: Total count, today's birthdays, birthdays within 7 days, birthdays within 30 days at a glance
- **Auto-grouping**: Automatically categorized into today, next 7 days, next 30 days, and later birthdays
- **Switchable Sorting**: Defaults to days remaining; can also sort by name (pinyin for Chinese) or age. Sorting applies within each section

### 2.3 📅 Calendar View

- **Monthly Calendar**: Displays all birthdays in calendar format, birthday dates highlighted
- **Month Navigation**: Supports previous/next month switching, one-click return to today
- **Birthday Preview**: Shows names of people with birthdays directly on calendar cells
- **Click to Open**: Click any birthday card or calendar cell to jump directly to the corresponding note

### 2.4 🎨 Interface Adaptation

- **Responsive Layout**: Automatically detects window width – compact mode in sidebar, full mode in main window
- **Multiple Color Schemes**: 5 built-in color schemes (Default, Warm Orange, Cool Blue, Nature Green, Elegant Purple)
- **Dark/Light Theme**: Perfectly adapts to Obsidian's dark and light themes; custom schemes brighten automatically in dark theme and darken in light theme so text keeps WCAG AA contrast

### 2.5 🌐 Multi-language Support

- **Chinese/English**: Interface language switching to meet different user needs
- **Full Localization**: All interface text fully translated for consistent experience

### 2.6 ⚙️ Highly Configurable

|Setting|Description|
|---|---|
|**Birthday Property Name**|✨ Customize frontmatter property name, default `birthday`, supports `date_of_birth`, `DOB`, etc.|
|Target Folder|Specify folder path to scan|
|**Lunar Birthday Property**|✨ Frontmatter property for lunar birthdays, format `YYYY-MM-DD`, leap month as `2023-02L-01`|
|**Alias Property**|✨ Frontmatter property whose aliases are also matched when searching, default `aliases`; accepts a YAML list or a comma-separated line|
|**Daily Reminder**|Desktop system notification (Notice on mobile) summarizing today and upcoming birthdays|
|Reminder Time|Time of day for the daily check, 24-hour, default `09:00`|
|Remind Ahead|Extra days to remind in advance, comma separated, e.g. `1,3,7`|
|Visible Months|Number of months to display in calendar view (1-6 months)|
|Color Scheme|5 theme colors to choose from|
|Show Lunar Calendar|Toggle lunar date display|
|Show Zodiac & Animal|Toggle zodiac and animal sign display|
|Show Calendar View|Toggle monthly calendar display|
|Show Statistics|Toggle statistics cards display at top|
|Highlight Today's Birthdays|Toggle special highlighting for today's birthdays|
|Language|Chinese/English switching|


## 3 🌟 Highlights

### 3.1 Configurable Birthday Property 

No longer limited to the `birthday` property name! You can use any property name you prefer:

**Option 1: Use default property**
```
birthday: 1990-05-20
```

**Option 2: Customize to date_of_birth**
```
date_of_birth: 1990-05-20
```

**Option 3: Customize to DOB**
```
DOB: 1990-05-20
```

**Simply configure the corresponding property name in plugin settings, and it will be automatically recognized!**

### 3.2 One Field, All Features

Just add the birthday property to your note's frontmatter, and all features work automatically.

### 3.3 Perfect Sidebar & Main Window Adaptation

- Drag to sidebar → Automatically switches to compact mode, saving space
- Drag to main window → Automatically switches to full mode, displaying more information

### 3.4 Daily Reminder

The plugin checks once a minute and sends a notification on the first check after the configured time (default `09:00`), merging today's and upcoming birthdays into one message:

```
Today: John (36 years old), Mary (30 years old)
3d away: Alex (28 years old)
```

- Desktop uses a system notification; mobile or an unavailable notification API falls back to an in-app notice
- Clicking the notification opens the birthday panel
- At most one reminder per day, so it never becomes noise
- The command "Birthday Reminder: Check today's birthday reminders" shows what would be sent right now. It only uses an in-app notice and does not consume the day's slot, so testing in the morning does not suppress the 9 AM reminder

### 3.5 Lunar Birthdays

Besides Gregorian birthdays, you can record birthdays by the lunar calendar. The plugin converts the lunar date to its Gregorian equivalent every year:

```
lunar_birthday: 1990-04-26
```

For a leap month, append `L` to the month, e.g. `2023-02L-01`. If a particular year has no such leap month, the plugin falls back to the regular month instead of skipping the birthday. Lunar entries carry a "Lunar" badge and also appear in reminder summaries.

### 3.6 Search and Aliases

The search box matches both name and aliases, so typing part of either is enough:

```
birthday: 1990-05-20
aliases: [Johnny, Little Li]
```

Aliases can be a YAML list or a single comma-separated line (`aliases: Johnny, Little Li`). When a row is matched only through an alias, it is labelled "Alias: Johnny" — so you never wonder why someone showed up in the results.

The × button inside the search box appears whenever it has content; clicking it clears the field and keeps focus.

### 3.7 Precise Lunar Conversion

Uses the professional `solarlunar` library, supporting precise lunar conversion for years 1900-2100, correctly handling leap months.

### 3.8 Elegant Calendar View

- Automatically fills previous/next month dates at month boundaries
- Cross-month dates displayed semi-transparently
- Today's date highlighted with special border
- Birthday cells support hover tooltips

### 3.9 One-Click Note Navigation

Click any birthday card or birthday name in the calendar to immediately open the corresponding note – no manual searching required.

### 3.10 Performance Optimized

- Uses `ResizeObserver` to monitor window changes for real-time layout adjustment
- Birthday data indexed by month, O(1) complexity for calendar rendering
- Automatically refreshes data every hour
- Editing note bodies no longer redraws the list — only real changes to the birthday, lunar, or alias properties trigger a refresh

---

## 4 📸 Interface Preview

### 4.1 Main Window Mode (Full Layout)

<img src="https://github.com/ichris007/Obsidian-Birthday-Reminder/blob/main/demo/bd_reminder_fullwide_en.jpg" width="70%">
<img src="https://raw.githubusercontent.com/ichris007/Obsidian-Birthday-Reminder/main/demo/bd_reminder_calendar_en.jpg" width="70%">

### 4.2 Sidebar Mode (Compact Layout)
<img src="https://raw.githubusercontent.com/ichris007/Obsidian-Birthday-Reminder/main/demo/bd_reminder_sidebar_en.jpg" width="70%">

### 4.3 Plugin Settings
<img src="https://raw.githubusercontent.com/ichris007/Obsidian-Birthday-Reminder/main/demo/bd_reminder_settings_en.jpg" width="70%">

---

## 5 🚀 Quick Start

### 5.1 Installation

The plugin is now available in the **Obsidian Community Plugin Store**! 🎉

#### Method 1: Install from Community Plugins (Recommended)
1. Open **Settings** → **Community Plugins**
2. Click **Browse** and search for `Birthday Reminder`
3. Click **Install** and then **Enable**

#### Method 2: Install via BRAT
1. Open **Settings** → **BRAT** (under Community Plugins)
2. Click the **Add Beta Plugin** button
3. Enter the repository address: `https://github.com/ichris007/Obsidian-Birthday-Reminder`
4. Click **Add Plugin** – BRAT will automatically download and install it
5. Go to **Settings** → **Community Plugins**, find **Birthday Reminder**, and enable it

#### Method 3: Manual Installation
1. Download the latest release (`main.js`, `manifest.json`, `styles.css`) from the [Releases page](https://github.com/ichris007/Obsidian-Birthday-Reminder/releases)
2. Extract the files into: `.obsidian/plugins/birthday-reminder/`
3. Restart Obsidian and enable the plugin

### 5.2 Configuration Steps

1. **After enabling** the plugin, click the "Settings" icon next to it
2. **Set Birthday Property Name** (optional): If you use a custom property name like `date_of_birth`, enter it here
3. **Set Target Folder**: Specify the folder containing person notes (e.g., `07Relations/`)
4. **Adjust other options** as needed (color scheme, display settings, reminder time, etc.)
5. **Add birthday properties** to notes in the target folder:

The plugin reads three properties. All are optional — use whichever you need:

|Property|Purpose|Example|
|---|---|---|
|`birthday`|Gregorian birthday (name is configurable)|`birthday: 1990-05-20`|
|`lunar_birthday`|Lunar birthday, leap month with `L`|`lunar_birthday: 2023-02L-01`|
|`aliases`|Aliases, matched when searching|`aliases: [Johnny, Little Li]`|

A complete note header might look like this:

```yaml
---
birthday: 1990-05-20
lunar_birthday: 1990-04-26
aliases: [Johnny, Little Li]
---
```

If a note has both the Gregorian and lunar properties, it produces two entries (the same person appears twice). Fill in only one of them.

### 5.3 Usage

- Click the cake icon 🎂 in the left sidebar to open the birthday reminder panel
- Or use the Command Palette (Ctrl/Cmd + P) and type "Birthday Reminder: Show birthday panel"
- "Birthday Reminder: Check today's birthday reminders" in the Command Palette shows what would be sent today, without affecting the automatic reminder

---

## 6 📝 Changelog

### v1.6.1 (2026-10-26)
- ✅ **Marketplace review fixes** – `onunload` no longer detaches leaves (that used to snap the panel back to its default location even after you moved it). Swapped the deprecated `Notice.noticeEl` for `messageEl`
- 🌐 **Language switch** – Switching the interface language now also renames the command palette entries and the ribbon tooltip immediately; previously they kept the language they were registered with until Obsidian restarted
- 🏷️ **Command names** – Both commands now carry the plugin name as a prefix ("Birthday Reminder: Show birthday panel", "Birthday Reminder: Check today's birthday reminders"), so they group together in the command palette instead of scattering among other plugins' "show panel" commands
- 🛡️ **Type safety** – Removed ES2017 built-ins (`padStart`, `Object.entries`) that degrade to `any` when `@types/node` is not in the type environment, and added `ES2017` to `tsconfig`'s `lib` so the compiler no longer depends on that reference

### v1.6.0 (2026-10-26)
- 🔔 **Daily reminder** – One notification per day (desktop system notification, `Notice` on mobile) summarizing today and the next N days; click it to open the panel. Falls back to an in-app notice when notification permission is denied. New command "Check today's birthday reminders", which always answers with an in-app notice so it stays visible even when the OS silently drops system notifications
- 🌙 **Lunar birthdays** – New `lunar_birthday` property (`YYYY-MM-DD`, leap month as `2023-02L-01`). The next occurrence is converted to its Gregorian date every year, falling back to the regular month when that year has no such leap month
- 🔎 **Search & sort** – Filter by name or alias (alias-only hits are labelled with the matched alias) with a one-click clear button, sort by days left / name / age; the "later" section collapses to 20 entries with a "Show all" toggle
- 🐛 **Timezone fix** – Birthdays no longer shift by a day for users west of UTC, or when the property is parsed as a date object
- 🐛 **DST fix** – Days remaining is computed on calendar days, so the DST switch no longer reports "2 days" for tomorrow
- 🛡️ **Stability** – Vault events now unregister on unload; editing note bodies no longer re-renders the panel; every open view refreshes
- 🎨 **Colors** – Removed unused color variables; custom schemes brighten automatically in dark theme and darken in light theme (so accent text meets AA 4.5:1), and the settings preview now shares the same mixing as the view
- 🧹 **Cleanup** – Dropped the deprecated slider tooltip API and the empty `getSettingDefinitions()` override

### v1.5.2 (2026-07-16)
- 🐛 **Fixed age calculation logic** – Correctly handles birthdays that have already passed this year, preventing off-by-one-year age errors
- 🔧 Improved code clarity with explicit `birthMonth`/`birthDay` variable extraction

### v1.5.1 (2026-07-16)
- 🔧 **Installation fix** – Lowered `minAppVersion` to `1.12.7` to resolve "no appropriate version found" error
- 🌐 **Complete localization** – All settings UI text fully localized; color scheme names now display in the selected language
- ✨ **Slider dynamic tooltip** – Shows current value (e.g., "3 months") when dragging the visible months slider
- 🎨 **Color preview real-time update** – Preview updates immediately when switching color schemes
- 🔄 **Language switching instant** – Settings panel refreshes immediately when switching languages

<details>
    <summary>more details</summary>

### v1.5.0 (2026-07-15)
- 🏗️ **Settings API stabilization** – Reverted to traditional `Setting` class + `display()` method for better stability
- ⚙️ **Complete settings implementation** – All settings fully functional with proper type annotations
- 🎨 **Color preview** – Visual preview of selected color scheme
- 🔮 **Future upgrade path** – Reserved `getSettingDefinitions()` for future migration

### v1.4.1 (2026-07-15)
- 🛡️ **Zero `any` types** – Complete type safety overhaul
- 🏗️ **Settings API migration** – Migrated to new declarative API
- 🪟 **Popout window compatibility** – Full support for Obsidian popout windows

### v1.4.0 (2026-07-15)
- 🔄 **Auto-refresh** – View updates automatically when birthday notes are created, deleted, renamed, or modified
- 📦 **Updated minAppVersion** to `1.13.0`

### v1.3.0 (2026-07-15)
- ✨ **Auto-refresh on file changes** – Added file watcher with 100ms debounce
- 🔧 **Promise handling** – All async operations properly marked with `void`
- 🛡️ **Type safety** – Added type assertions and guards

### v1.2.0 (2026-07-15)
- 🎯 **Code quality** – All community plugin review issues resolved
- 🎨 **UI overhaul** – Replaced inline styles with CSS classes
- 🧹 **Memory leak fixes** – Removed leftover references and improved cleanup

### v1.1.0 (2026-03-21)
- ✨ New Features
  - Full English interface support with localized animal signs, zodiac signs, lunar dates, and age units
  - Dynamic interface text based on language settings
- 🐛 Bug Fixes
  - Fixed issue where animal signs and zodiac signs displayed in Chinese even in English mode
  - Fixed age unit showing "岁" (Chinese) instead of "years old" in English mode

### v1.0.0 (2026-03-21)
- ✨ **Initial Release**
- 🎯 Configurable birthday property support (`birthday`, `date_of_birth`, `DOB`, etc.)
- 🎯 Intelligent birthday calculation and age calculation
- 🌙 Lunar calendar conversion (using solarlunar library)
- 🐉 Zodiac and animal sign display
- 📅 Calendar view with month navigation
- 🎨 5 color schemes
- 🌐 Chinese/English bilingual support
- 📱 Responsive layout, automatically adapts to sidebar/main window
- ⚙️ Rich configuration options

</details>

---

## 7 🙏 Acknowledgments

- [solarlunar](https://www.npmjs.com/package/solarlunar)- Lunar calendar calculation library
- [Obsidian](https://obsidian.md/) - Excellent note-taking software

---

## 8 📄 License

MIT License

---

## 9 🔗 Links

- [GitHub Repository](https://github.com/ichris007/Obsidian-Birthday-Reminder)
- [Issue Tracker](https://github.com/ichris007/Obsidian-Birthday-Reminder/issues)
- [Lifein OS](https://lifein.vip/en) - A personal productivity and life management system built with Obsidian.
 
---

## 10 💡 FAQ

### 10.1 Q: I use the `date_of_birth` property. Can it be supported?
A: Yes! Simply change the "Birthday Property Name" in plugin settings to `date_of_birth`.

### 10.2 Q: Can multiple different property names be supported simultaneously?
A: Currently only one property name is supported, but you can choose the one you use most frequently and unify other notes accordingly.

### 10.3 Q: Is the lunar date accurate?
A: The plugin uses the professional `solarlunar` library, supporting precise lunar conversion for years 1900-2100, including leap month handling.

### 10.4 Q: Does the layout automatically switch between sidebar and main window?
A: Yes! The plugin automatically detects window width – switches to compact mode when width is less than 450px, and full mode when width is 450px or greater.

### 10.5 Q: How do I record a lunar birthday?
A: Add `lunar_birthday: 1990-04-26` to the note's frontmatter, where the year is the lunar year. For a leap month, append `L` to the month: `lunar_birthday: 2023-02L-01`. If a particular year has no such leap month, the plugin falls back to the regular month. To use a different property name, change "Lunar Birthday Property" in settings; leave it empty to disable lunar birthdays.

### 10.6 Q: When does the daily reminder fire?
A: Once a day, on the first check after the configured time (default `09:00`), and only if there is something to report. On desktop it uses a system notification, on mobile a notice. Clicking it opens the panel. You can also run "Birthday Reminder: Check today's birthday reminders" manually at any time.

### 10.7 Q: Can I search by alias?
A: Yes. The plugin reads the `aliases` property by default and matches both name and aliases:

```yaml
---
birthday: 1990-05-20
aliases: [Johnny, Little Li]
---
```

A single comma-separated line (`aliases: Johnny, Little Li`) works too. When a row is matched only through an alias, it shows "Alias: Johnny" so you know why it appeared. Change the property name in Settings → Data source → "Alias property"; leave it empty to search names only.

### 10.8 Q: The reminder time passed but I got nothing?
A: Check these in order:

1. Is "Enable daily reminder" turned on, and has the reminder time actually passed? The plugin checks once a minute, so expect up to 60 seconds of delay
2. Has today's reminder already fired? Only one is sent per day — clear `lastNotifiedDate` in the plugin data to test again
3. **macOS users**: Electron's `Notification.permission` is always `granted` on macOS, so the plugin cannot tell whether the master switch under System Settings → Notifications → Obsidian is off. If it is off, automatic reminders fail silently. Verify Obsidian's notification permission there and check whether Focus/Do Not Disturb is enabled

To confirm the plugin itself is fine, run "Birthday Reminder: Check today's birthday reminders" — it always answers with an in-app notice. If it shows content, your data is fine and the problem is the system notification permission.
