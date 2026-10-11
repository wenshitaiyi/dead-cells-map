# dead-cells-map · 死亡细胞交互地图（中英双语版）

Dead Cells Interactive Map 的本地双语镜像：完整保留原站的生物群系流程图、DLC 筛选、
符文/锁定提示 tooltip 与视觉风格，并叠加**中 / 英一键切换**。

- 原站：<https://deadcells-map.cookies4later.com/>
- 原作者：FacelessB - Cookies4later
- 本仓库仅作学习 / 离线镜像用途，素材版权归原作者及 Motion Twin 所有。

## 功能

- 38 个生物群系的完整进阶路线图（含 5 个 DLC）
- DLC 复选框筛选（Bad Seed / Fatal Falls / Rise of the Giant / Queen of the Sea / Return to Castlevania）
- 鼠标悬停 tooltip：进入条件（符文 / Boss 细胞 / 锁定原因）
- 右上角 **EN / 中文** 一键切换，选择持久化（localStorage）
- 纯静态，无后端依赖

## 目录结构

```
dead_cells_map/
├── server/
│   ├── __init__.py
│   └── entry.py          # py-lite-server 子服务入口（自托管 dist 静态目录）
├── dist/                 # 静态站点产物（Next.js 静态导出 + i18n 叠加层）
│   ├── index.html
│   ├── i18n.js           # 中英双语翻译层（MutationObserver 处理动态 tooltip）
│   ├── _next/            # 原站 JS / CSS / 字体
│   ├── img/               # 群系图 / DLC 图 / 符文与物品图标
│   └── favicon.ico
└── README.md
```

## 作为 py-lite-server 子服务运行

```powershell
# 隔离端口、仅挂载本服务（避免占用 8000 / 影响他人）
.\venv\Scripts\python.exe main.py --port 8011 --services dead_cells_map
```

- 单独启动时：本服务自托管于 `http://localhost:8011/dead_cells_map/`
- 完整服务器启动时：由 `ui_service` 自动挂载到 `/ui/dead_cells_map/`
- 健康检查：`GET /api/dead_cells_map/ping`

## 独立部署（GitHub Pages / 任意静态服务器）

`dist/` 内所有资源均为**相对路径**，可直接把 `dist/` 目录扔到任意静态服务器根目录：

```bash
cd dist
python -m http.server 8080
# 浏览器打开 http://localhost:8080/
```

## 双语实现说明

未改动原站任何 JS/CSS 逻辑，仅在 `index.html` 末尾引入 `i18n.js`：

1. 内置英→中词典（群系名 / DLC / 符文 / 锁定说明 / UI 标签 / tooltip 模板）；
2. 遍历 DOM 文本节点做替换，切回英文时用反向词典还原；
3. `MutationObserver` 自动翻译悬停时动态生成的 tooltip；
4. 语言选择写入 `localStorage`（key: `dcmap_lang`）。
