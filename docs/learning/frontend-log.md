# 前端理解学习日志

> 用途：脱离聊天记录也能继续。每次学习结束更新「已完成 / 下一步」。
> 最后更新：2026-11-23

## 目标

- 能在 42 评估中解释 `packages/web` 里任意文件的职责，并现场做小改动；
- 能明确区分「真实实现」和「占位页面」，不把计划说成已完成。

## 已完成

- [x] 本地开发命令：`make dev-all`（前后端一起起）、`make dev-stop`（清端口 8000/5173）
- [x] 第 1 课（阅读）：`main.tsx` → `router.tsx` → `appRoutes.tsx`
  - React 只负责挂载 `RouterProvider`；`createBrowserRouter(routes)` 接管 URL；
  - 路由是两棵树：`AuthLayout`（/login、/register）与 `AppShell`（其余全部）；
  - 布局用 `<Outlet />` 放子页面，`index: true` 是默认子页，`path: '*'` 是 404；
  - 守卫是包在 `element` 外的组件（`RequireAuth` / `RequireGuest` / `RequireAdmin`）；
  - 标题由 `lib/documentTitle.ts` 的 `exactTitles` 决定，新增路由要同步加标题；
  - `planned(...)` 返回占位页，**除 Feed / Login / Register / DesignSystem 外都是占位**。

## 下一步（按顺序做）

1. **TS 最小集（约 90 分钟）**：类型注解与推断、`type` 对象类型、字面量联合、可选属性、
   泛型只用不写、`unknown` + 类型守卫、`Record/Omit/Partial`。教材用：
   `types/api.ts`、`types/models.ts`、`lib/mappers.ts`、`lib/api.ts`（`request<T>`、`isRecord`）。
   先跳过：装饰器、`namespace`、条件类型、`infer`、映射类型。
2. **第 1 课练习**：新增 `/legal/cookies` 页面（见下方清单）。
3. **口述回答三个问题**（先不翻代码，答完再对照）。
4. **第 2 课**：`routes/RequireAuth.tsx` + `stores/auth.ts`（`unknown / authenticated / guest`
   三态、`restore()`、登录后为什么不会闪一下登录页）。

## 练习清单：新增 `/legal/cookies`

- [ ] `src/appRoutes.tsx` 中 `/legal/terms` 附近加 `path: 'legal/cookies'`，用
      `planned('Cookie Policy', 'How we use cookies.')`
- [ ] `src/lib/documentTitle.ts` 的 `exactTitles` 加 `'/legal/cookies': 'Cookie policy'`
- [ ] `src/appRoutes.test.tsx` 仿照现有用例加一条断言
- [ ] 验证：
      `cd packages/web && npx vitest run src/appRoutes.test.tsx`
      `make dev-all` → 打开 http://localhost:5173/legal/cookies
- [ ] 验收：页面显示、标签页为 `Cookie policy · Social Network`、`/missing` 仍是 404

## 待回答的三个问题

1. 未登录用户访问 `/messages`，从 URL 到看到画面经过哪些组件？最后停在哪个 URL？
2. `/login` 和 `/settings` 分别属于哪棵路由树？header 为什么不一样？
3. 删掉 `{ path: '*', element: <NotFoundPage /> }` 之后，访问 `/nope` 会怎样？

## 常用命令

```bash
make dev-all                 # 前后端一起启动，Ctrl-C 全停
make dev-stop                # 端口被旧进程占用时清理
cd packages/web
npm run typecheck            # 只做类型检查
npx vitest run src/appRoutes.test.tsx   # 跑单个测试文件
npx vitest run               # 全部 26 个文件 / 116 个用例
```

## 评估用关键事实（别记错）

| 功能 | 真实状态 |
|---|---|
| Feed / 登录 / 注册 / Design System | 已实现 |
| Profile、Friends、Messages、Communities、Blog、Events、Marketplace、Notifications、Search、Settings、Admin、Legal | `PlaceholderPage` 占位 |
| 实时聊天 `/ws` | **后端未实现**（前端只有重连客户端 `lib/ws.ts`），浏览器里会看到 `/ws 404` 属预期 |
| 后端 WebSocket 依赖 | 未安装 `websockets`/`wsproto`，uvicorn 会警告 `Unsupported upgrade request` |
| mock 开关 | `VITE_USE_MOCKS=false` 用真实 API；默认 / `web-test` 用 `lib/mock/` |
| 测试 | 前端 116 个用例全过（26 文件） |

## 恢复对话（可选）

```bash
opencode -s ses_df60bcd17ffew2LGRzv4VDK1yt     # 回到本会话（"make dev port conflict"）
opencode session list                          # 找不到就用这个列出会话
```

聊天会丢，这个文件不会。明天先看「下一步」，再决定要不要恢复会话。
