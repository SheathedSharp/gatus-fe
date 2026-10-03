# gatus-fe

自建的 Gatus 状态页前端。后端（Gatus）保持原样，本项目只消费它的只读 API：

- 数据源：`GET /api/v1/endpoints/statuses`
- 开发环境：Vite 代理 `/api/*` → `GATUS_API_BASE`（示例：`https://monitor.example.com`）
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

完整变量说明见下方「环境变量」，可复制 `.env.example` 到 `.env.local` 填写。

## 自定义指南

| 想改什么 | 改哪里 |
| --- | --- |
| 配色（酒红 / 蜜桃）/ 字体 / 圆角 / 明暗主题 | `src/style.css` 顶部的 CSS 变量与 `@font-face`（`--accent` `--up` `--bg` `--text` …） |
| 头像 / favicon | `public/avatar.jpg`、`public/favicon.svg` |
| 品牌短语（轮播与页脚） | `src/App.vue` 的 `phrases` |
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
3. 环境变量：`GATUS_API_BASE=https://monitor.example.com`，以及下方的站点展示变量
4. 部署后在 Pages 项目里绑定自定义域名

方式二：命令行（当前使用方式，Pages 项目 `gatus-fe`）

```bash
export CLOUDFLARE_API_TOKEN=xxx
export CLOUDFLARE_ACCOUNT_ID=xxx
npm run deploy   # 构建并部署到 Cloudflare Pages
```

默认地址：`https://<project>.pages.dev`

> 域名布局示例：`status.example.com` 为前端（Cloudflare Pages），
> `monitor.example.com` 为 Gatus 后端（Cloudflare Tunnel）。
> 所有真实域名通过环境变量注入，仓库内只保留占位符。

## 环境变量

| 变量 | 用途 | 示例 |
| --- | --- | --- |
| `GATUS_API_BASE` | Gatus 后端地址（dev 代理 / Pages Function） | `https://monitor.example.com` |
| `VITE_API_BASE` | 生产构建时前端直连的 Pages Function 地址 | `https://your-project.pages.dev` |
| `VITE_SITE_HOST` | 页面顶部展示的站点域名 | `status.example.com` |
| `VITE_SITE_URL` | 页脚外链地址 | `https://example.com` |
| `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET` | 后端受 Zero Trust 保护时的 Service Token（仅 Pages 环境变量 / `.env.local`） | — |

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

## License

[MIT](./LICENSE)
