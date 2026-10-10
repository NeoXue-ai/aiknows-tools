# AIknows Tools

AI 工具发现目录。公开站点使用 Next.js；工具内容由 Git 管理，运行时不需要数据库、站内账户或审核后台。

## 开发

需要 Node.js 22 和 pnpm 10。

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev --port 3010
```

`pnpm dev` 启动前生成目录，开发期间自动监听 `content/tools`。不使用此开发入口时，修改内容后运行 `pnpm catalog:build`。

```sh
pnpm check       # 生成目录、校验、测试、类型检查和格式检查
pnpm build       # 校验并生成内容，再构建全部公开页面
pnpm start --port 3010
```

## 修改入口

| 修改内容 | 位置 |
| --- | --- |
| 工具信息、详情、编辑点评和 FAQ | `content/tools/<slug>.json` |
| 大类、子分类、跨类关系及分类名称 | `features/catalog/taxonomy.ts` |
| 公开数据类型、查询与排序 | `features/catalog/types.ts`、`query.ts` |
| 服务端内容读取 | `features/catalog/server.ts` |
| 搜索索引加载 | `features/catalog/browser.ts` |
| 工具详情 SEO | `features/catalog/seo.ts` |
| 页面布局 | `app/`、`components/` |
| 投稿入口 | `SUBMISSION_URL`、`CORRECTIONS_URL` |
| 投稿转内容 PR | `.github/workflows/submission.yml`、`scripts/catalog/submission.ts` |

`content/tools` 是唯一可编辑的工具来源。`.catalog/` 与 `public/catalog/` 都是构建产物，不提交，不手动修改。每个工具文件的文件名必须等于稳定 slug；不要随意改 slug，否则已有链接会失效。

新工具可复制已有文件、修改字段后运行 `pnpm check`。未知字段会拒绝；未确认的发布时间用 `null`，不会补造导入时间。新增子分类时更新集中分类表及 Issue 模板说明。

## 投稿与发布

当前代码仓库已经公开，投稿默认使用本仓库的工具 Issue 模板，更正使用更正 Issue 模板。也可以通过环境变量替换为公开 HTTPS 表单或邮件入口；无需恢复站内登录。外部表单的记录由编辑整理为内容 PR，或先录入工具 Issue。`hello@aiknows.tools` 继续用于一般联系。

编辑确认工具 Issue 后，添加 `catalog:accepted` 标签。工作流会校验格式和重复记录、运行检查与生产构建，再创建内容 PR。人工审核并合并后，现有 Vercel Git 部署重新构建站点。不会自动合并、直接写主分支或在生产站点写数据库。

本仓库已创建 `catalog:submission`、`catalog:correction` 和 `catalog:accepted` 标签，并允许 Actions 创建 Pull Request；默认工作流权限仍为只读，投稿工作流单独声明所需写权限。Issue 模板和工作流在默认分支生效。使用 `GITHUB_TOKEN` 创建的 PR 检查可能需要编辑在 PR 中点击 **Approve workflows to run**；投稿工作流在创建 PR 前已执行相同检查。参考 [GitHub 的工作流触发规则](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)。

更正已有工具使用更正入口，由编辑修改原工具文件并提交 PR，保留 slug。

## 架构与迁移

详见 [架构说明](docs/architecture/catalog.md) 和 [迁移核对报告](docs/architecture/migration-audit.json)。

保留 `supabase/` 中的历史数据库结构用于追溯；应用不再连接它。本次迁移没有删除远程工具、投稿、用户或日志数据。旧 `/login` 和 `/admin/*` 跳到投稿说明，旧写入 API 与 OAuth 接口返回 `410 Gone`。
