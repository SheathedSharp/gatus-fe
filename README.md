# gatus-fe

Gatus 状态页前端：只消费 [Gatus](https://github.com/TwiN/gatus) 只读 API 的极简状态面板，Anthropic 风格排版与配色，深浅双主题。

Vue 3 · TypeScript · Vite · Tailwind CSS v4 · GSAP · Cloudflare Pages

## 特性

- 端点分组、可用率条、可用率与响应耗时统计
- 每个端点展示服务图标与可点击公网地址（受 Cloudflare Access 保护的会标注锁形图标）
- 检查详情悬浮窗：时间戳、响应时间、HTTP 状态、条件断言逐条展示
- 品牌短语 GSAP 轮播，适配 `prefers-reduced-motion`
- 30 秒轮询，相对时间实时刷新
- 后端地址与站点域名全部通过环境变量注入

## 快速开始

```bash
npm install
cp .env.example .env.local   # 填入 GATUS_API_BASE
npm run dev
```

## 环境变量

| 变量 | 用途 | 示例 |
| --- | --- | --- |
| `GATUS_API_BASE` | Gatus 后端地址（dev 代理 / Pages Function） | `https://monitor.example.com` |
| `VITE_API_BASE` | 生产构建时前端直连的 Pages Function 地址 | `https://your-project.pages.dev` |
| `VITE_SITE_HOST` | 页面展示的站点域名 | `status.example.com` |
| `VITE_SITE_URL` | 页脚外链地址 | `https://example.com` |
| `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET` | 后端受 Zero Trust 保护时的 Service Token（仅 `.env.local` / Pages 环境变量） | — |

参考 [`.env.example`](./.env.example)。

## 部署

Cloudflare Pages：

- Build command：`npm run build`
- Output directory：`dist`

或在本地配置 `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` 后运行 `npm run deploy`。

> Pages Function 代理见 `functions/api/[[path]].ts`；若后端受 Cloudflare Access 保护，需配置 Service Token。

## 自定义

| 想改什么 | 改哪里 |
| --- | --- |
| 配色 / 字体 / 圆角 / 主题 | `src/style.css` 顶部 CSS 变量与 `@font-face` |
| 头像 / favicon | `public/avatar.jpg`、`public/favicon.svg` |
| 品牌短语 | `src/App.vue` 的 `phrases` |
| 卡片 / 徽章 / 可用率条 | `src/components/` |
| 端点图标与跳转链接 | `src/api/presentation.ts`（子域名 + `VITE_SITE_URL` 推导地址） |
| 轮询间隔 / 数据加工 | `src/api/` |

## 目录结构

```
src/
├── api/          # Gatus 类型、请求、轮询、格式化
├── components/   # EndpointCard / StatusBadge / UptimeBars / AppIcon
├── App.vue
└── style.css     # 主题变量 + Tailwind
functions/api/[[path]].ts   # Pages Function 代理
```

## License

[MIT](./LICENSE)
