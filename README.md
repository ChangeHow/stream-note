# stream-note

> 一个像 Logseq 的笔记应用，但基于每日标准 Markdown 文件，而非子弹列表，并集成了语音输入、GTD（Things-like）任务管理与日程规划。

## 特性

- 📝 **每日笔记** — 每天自动创建一个独立的 Markdown 文件（`YYYY-MM-DD.md`）用于记录内容
- 🎙️ **语音输入** — 使用浏览器 Web Speech API 直接向笔记追加语音转文字内容
- ✅ **GTD 任务管理** — 类 Things 的任务管理，支持收集箱、今日任务与项目分组
- 🗓️ **日程管理** — 与每日笔记联动的日程视图

## 技术栈

| 层       | 技术                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| 运行时   | [Bun](https://bun.sh)                                                         |
| 后端框架 | [Hono](https://hono.dev)                                                      |
| 前端框架 | [React 19](https://react.dev)                                                 |
| 路由     | [TanStack Router](https://tanstack.com/router)                                |
| 数据请求 | [TanStack Query](https://tanstack.com/query)                                  |
| UI 组件  | [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS v4](https://tailwindcss.com) |
| 前端打包 | [Rspack](https://rspack.dev)（RSC 实验性支持）                                  |
| 语言     | [TypeScript](https://www.typescriptlang.org)                                  |
| 测试     | [Vitest](https://vitest.dev)                                                  |
| Lint     | [oxlint](https://oxc.rs/docs/guide/usage/linter.html)                         |
| 格式化   | [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html)                       |
| 环境管理 | [Nix](https://nixos.org)                                                      |

## 快速开始

### 前置条件

- [Nix](https://nixos.org/download.html)（推荐，自动提供 Bun 和 Node.js）
- 或 [Bun](https://bun.sh) >= 1.0.0

### 使用 Nix 进入开发环境

```bash
# 使用 direnv（推荐）
direnv allow

# 或手动进入
nix develop
```

### 安装依赖

```bash
bun install
```

### 开发

```bash
# 启动后端 API 服务（默认端口 3000）
cd packages/server && bun run dev

# 启动前端开发服务器（默认端口 3001，API 请求代理到 3000）
cd packages/web && bun run dev
```

### 构建

```bash
# 构建所有包
bun run build
```

### 测试

```bash
bun run test
```

### Lint & Format

```bash
bun run lint          # oxlint（typeaware 严格模式，按包配置）
bun run format        # oxfmt 格式化
bun run format:check  # oxfmt 格式检查
bun run typecheck     # TypeScript 类型检查
```

### 提交门禁

项目使用 lint-staged + husky，提交时自动检查：

- oxlint — lint 检查（typeaware，前后端分离配置）
- oxfmt — 格式检查
- tsc — TypeScript 类型检查

## 项目结构

```
stream-note/
├── packages/
│   ├── web/                    # 前端应用
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── ui/         # shadcn/ui 组件
│   │   │   ├── lib/
│   │   │   │   └── utils.ts    # cn() 工具函数
│   │   │   ├── App.tsx          # 根组件
│   │   │   ├── index.tsx        # React 入口
│   │   │   ├── index.css        # Tailwind CSS 入口 + shadcn 主题
│   │   │   └── index.html       # HTML 模板
│   │   ├── components.json      # shadcn/ui 配置
│   │   ├── rspack.config.ts     # Rspack 打包配置（RSC 已启用）
│   │   ├── postcss.config.js    # PostCSS 配置（Tailwind v4）
│   │   ├── vitest.config.ts     # 测试配置（jsdom）
│   │   ├── tsconfig.json        # TypeScript 配置
│   │   ├── .oxlintrc.json       # oxlint 规则（含 React 插件）
│   │   └── package.json
│   └── server/                  # 后端服务
│       ├── src/
│       │   └── index.ts         # Hono 服务入口
│       ├── vitest.config.ts     # 测试配置（node）
│       ├── tsconfig.json        # TypeScript 配置
│       ├── .oxlintrc.json       # oxlint 规则（无 React）
│       └── package.json
├── docs/                        # 规格说明文件
├── .husky/
│   └── pre-commit               # 提交门禁
├── flake.nix                    # Nix 开发环境
├── .envrc                       # direnv 配置
├── AGENTS.md                    # AI 代理开发规范
├── .oxlintrc.json               # 根目录 oxlint 基础规则
├── tsconfig.json                # 根 TypeScript 配置（项目引用）
└── package.json                 # 根 workspace 配置
```

## License

MIT
