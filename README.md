# status-ui

自建的 Gatus 状态页前端。后端（Gatus）保持原样，本项目只消费它的只读 API：

- 数据源：`GET /api/v1/endpoints/statuses`
- 开发环境：Vite 代理 `/api/*` → `https://status.example.com`
- 生产环境：Cloudflare Pages Function 同源代理（见 `functions/api/[[path]].ts`）

## 技术栈

Vue 3 + TypeScript + Vite + Tailwind CSS v4

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:5173 即可。默认每 30 秒轮询一次。

后端地址可通过环境变量覆盖：

```bash
GATUS_API_BASE=https://monitor.example.com npm run dev
```

## 自定义指南

| 想改什么 | 改哪里 |
| --- | --- |
| 配色 / 圆角 / 明暗主题 | `src/style.css` 顶部的 CSS 变量（`--up` `--down` `--bg` `--text` …） |
| 状态徽章样式 | `src/components/StatusBadge.vue` |
| 可用率条（颜色、条数、高度） | `src/components/UptimeBars.vue` |
| 卡片布局 / 信息密度 | `src/components/EndpointCard.vue` |
| 整体页面结构（分组、排序、标题） | `src/App.vue` |
| 数据获取 / 轮询间隔 / 数据加工 | `src/api/useGatus.ts`、`src/api/gatus.ts` |
| 时间、耗时、可用率格式化 | `src/api/format.ts` |

## 构建

```bash
npm run build     # 类型检查 + 构建到 dist/
npm run preview   # 本地预览构建产物
```

## 部署到 Cloudflare Pages

方式一：Dashboard 连接 GitHub（推荐）

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
2. 选择本仓库，构建配置：
   - Build command: `npm run build`
   - Build output directory: `dist`
3. （可选）环境变量：`GATUS_API_BASE=https://status.example.com`
4. 部署后在 Pages 项目里绑定自定义域名

方式二：命令行

```bash
npm run build
npx wrangler pages deploy dist
```

> 域名切换建议：先用一个临时域名（如 `s.example.com`）验证新 UI，
> 确认没问题后再把 `status.example.com` 切过来，Gatus 后端挪到
> `monitor.example.com`（改 Pages 环境变量 `GATUS_API_BASE` 即可）。

## 目录结构

```
src/
├── api/
│   ├── gatus.ts        # API 类型 + 请求 + 状态推导
│   ├── useGatus.ts     # 轮询 composable
│   └── format.ts       # 格式化工具
├── components/
│   ├── StatusBadge.vue
│   ├── UptimeBars.vue
│   └── EndpointCard.vue
├── App.vue
├── main.ts
└── style.css           # 主题变量 + Tailwind
functions/
└── api/[[path]].ts     # Pages Function 代理
```
