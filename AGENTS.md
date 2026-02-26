# AGENTS.md

本文件为 AI 编码代理（如 GitHub Copilot）提供项目开发规范。

## Workflow

在进行任何功能开发或 Bug 修复之前，必须遵循以下 **测试驱动开发 (TDD)** 工作流：

1. **测试用例设计 (Think First)**
   - 在编写任何代码之前，必须明确测试目标和预期行为。
   - **后端 API**: 必须验证 HTTP 状态码、响应 JSON 结构、边界条件（如空数据、分页）。
   - **前端交互**: 必须验证关键 UI 元素（按钮、输入框）、用户交互（点击、输入、滚动）及状态变化。
   - *示例*:
     - "验证点击 'Create Today' 按钮后，列表顶部出现当天的笔记项。"
     - "验证滚动到底部时，触发 API 请求并加载更多笔记。"

2. **编写测试 (Write Tests)**
   - 使用 Vitest (后端) 或 Playwright (前端 E2E) 编写 **失败的测试用例**。
   - 测试代码应清晰描述业务逻辑。
   - 确保测试覆盖了上述设计的所有场景。

3. **实现功能 (Code)**
   - 编写最小量的代码以通过测试。
   - 确保代码符合项目规范（Lint, Format, TypeScript）。

4. **验证与重构 (Refactor & Verify)**
   - 运行测试确保全部通过 (`bun run test`)。
   - 优化代码结构，确保可维护性。
   - 提交前再次运行所有检查。

### 验收报告

任务完成后，**必须** 以表格形式汇报测试结果，包含单测和 E2E 结果：

| Test Type | Description | Result |
|-----------|-------------|--------|
| Unit      | verify logic A | PASS   |
| E2E       | verify flow B  | PASS   |

**此外，每次任务完成后，必须提供应用当前的截图，以供用户验收视觉效果。**

## 沟通规范

**所有的 PR 描述、Commit Message、以及与用户的对话回复，必须使用中文。**

## 开发规范

### 依赖管理

- **禁止依赖 SemVer**: 所有依赖必须使用 **固定版本** (Strict Versioning)。
  - `package.json` 中禁止使用 `^` 或 `~` 前缀。
  - *示例*: `"react": "19.0.0"` (Correct), `"react": "^19.0.0"` (Wrong).

### 前端架构

- **Hooks 库**: 日常 Hooks 必须使用 **[ahooks](https://ahooks.js.org)**。
  - 禁止手动编写 `useDebounce`, `useThrottle` 等通用 Hooks。
- **状态管理**: 必须使用 **[Jotai](https://jotai.org)**。
  - 避免深层 Prop Drilling。
  - 使用原子化状态管理。
- **副作用管理**: **禁止直接使用 `useEffect`**。
  - 必须根据场景使用 ahooks 提供的替代方案：
    - 初始化逻辑 -> `useMount`
    - 清理逻辑 -> `useUnmount`
    - 依赖变更 -> `useUpdateEffect`
    - 异步操作 -> `useRequest` / `useAsyncEffect`
    - 防抖/节流 -> `useDebounceEffect` / `useThrottleEffect`

### 必须通过的检查

每一次代码改动（包括新功能、修复、重构）都 **必须** 确保以下检查全部通过后再提交：

1. **Lint 检查** — `bun run lint`
   - 使用 oxlint，已开启 typeaware 模式和严格规则
   - 所有规则均为 `error` 级别，不允许任何 lint 错误
2. **格式化检查** — `bun run format:check`
   - 使用 oxfmt 检查代码格式
   - 提交前可用 `bun run format` 自动修复格式
3. **TypeScript 类型检查** — `bun run typecheck`
   - 不允许提交任何类型错误

### 提交门禁

项目已配置 lint-staged + husky pre-commit hook，提交时自动执行：

- `oxlint --tsconfig tsconfig.json` — 对暂存文件进行 lint（按包区分配置）
- `oxfmt --check` — 对暂存文件进行格式检查
- `tsc --noEmit` — 各包 TypeScript 类型检查

### 技术栈

- **运行时**: Bun
- **后端**: Hono（`packages/server`）
- **前端**: React 19 + TanStack Router/Query + shadcn/ui + Tailwind CSS v4（`packages/web`）
- **状态管理**: Jotai
- **Hooks**: ahooks
- **打包**: Rspack（RSC 实验性支持已开启）
- **语言**: TypeScript（严格模式）
- **测试**: Vitest, Playwright
- **Lint**: oxlint（typeaware，严格规则，前后端分离配置）
- **格式化**: oxfmt（根目录统一配置）
- **环境管理**: Nix（flake.nix）

### 项目结构

本项目采用 monorepo 架构，使用 Bun workspaces 管理：

- `packages/web` — 前端应用（React + shadcn/ui + Rspack）
- `packages/server` — 后端服务（Hono + Bun）
- `docs/` — 规格说明文件

### 代码风格

- 所有代码必须通过 oxlint 严格规则检查
- 使用 oxfmt 统一格式化
- TypeScript 严格模式，不允许 `any`（已由 oxlint 规则强制）
- React 使用 automatic JSX runtime（无需手动 `import React`）
- 前端路径别名：`@/*` 指向 `packages/web/src/*`
- 后端路径别名：`@/*` 指向 `packages/server/src/*`
