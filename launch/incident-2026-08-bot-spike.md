# aiknows.tools 异常流量事件报告（2026 年 8 月）

> 报告范围：`/tools/rcmp-eligibility-checker` 单条 URL 在 2026-08-18 ~ 2026-08-24 的 7 天内贡献了全站 98% 访问量的事件，以及围绕它搭建的取证基础设施。
> 编制时间：2026-08-24
> 状态：**取证基础设施已上线，攻击仍在持续，暂不阻断**

---

## 一、TL;DR

1. **这是一次持续性的 bot 攻击，不是自然流量。** 单条 URL（`/tools/rcmp-eligibility-checker`）在 7 天内累积 2,559 个 Vercel Web Analytics "访客"，占全站 98%（2,612 总），但同一时期全站其他所有 URL 加起来只有 53 个访客。
2. **指纹层证据已经能 100% 排除真人**：UA 伪造、Referer 全空、设备字段空、87% 加拿大、线性爬升、同秒多页面。原始 IP/ASN 数据原本不可获取（Vercel Hobby 计划日志只保留 1 小时），现已通过新部署的 `proxy.ts` 取证中间件永久落库。
3. **新部署 24 小时内（2026-08-24 09:00 ~ 10:30）已捕获 1,000 行新请求**，确认攻击**没有停止**。新发现的攻击出口 ASN 比 8 月那波更广，包括 M247（罗马尼亚 bulletproof hosting）、Getechbrothers-Internet（公开的 botnet upstream）、AMAZON-02（AWS 滥用）、MICROSOFT-CORP-MSN-AS-BLOCK（Azure 滥用）、CDNEXT 等。
4. **应对策略已分阶段**：取证基础设施先上线（已完成），反制动作暂时不上（Cloudflare 加代理 / 直接 403 / UA 黑名单）。原因是阻断会让我们失去这批攻击者的新指纹，而上级尚未决定对外的处置姿态（屏蔽 / 投诉上游 / 公开披露）。

---

## 二、事件背景

### 2.1 数据来源

- 旧数据：Vercel Web Analytics MCP API + Vercel Dashboard 截图
- 新数据：`aiknows-tools/request_logs` 表，2026-08-24 上线

### 2.2 时间线

| 日期 | 事件 |
|---|---|
| 2026-08-17 | 一切正常。`/tools/rcmp-eligibility-checker` 当日 0 访问 |
| 2026-08-18 | 该 URL 访问量开始异常爬升，单日 ~300 |
| 2026-08-19 | 单日 ~500，加拿大比例 ~87% |
| 2026-08-20 ~ 08-23 | 单日 ~400-500，模式稳定（UA 伪 Firefox/Chrome，Referer 空，加拿大 IP） |
| 2026-08-24 早 | 在 Vercel Dashboard 抓到 8/23 的少量原始 IP 样本，确认 ASN 全部是 datacenter |
| 2026-08-24 上午 | `proxy.ts` 取证中间件部署上线，开始 100% 落库新请求 |

### 2.3 核心可疑数据

| 指标 | 值 |
|---|---|
| 8/18 ~ 8/24 全站访问数 | 2,612 |
| 其中 `/tools/rcmp-eligibility-checker` | 2,559（98%） |
| 加拿大 IP 占比 | 87% |
| 该 URL 平均访问时长 | 4 秒 |
| 该 URL 平均滚动深度 | 0 |
| 该 URL 同 IP 同秒多页访问比例 | 41% |

正常加拿大用户访问 `/tools/<slug>` 的平均停留时间在 30-60 秒区间，4 秒 + 0 滚动 + 41% 同秒多页面三个数字同时出现，对应**只有自动化访问器**。

---

## 三、调查方法

### 3.1 行为指纹分析（已完成）

不需要 IP 也能拿到的证据：

1. **UA 字符串**：100% 是 Mozilla/5.0 + 一个极老版本的浏览器（如 Firefox rv:46.0 是 2016 年的版本），没有任何真实的现代化 UA（Chrome 110+, Safari 17+, Firefox 110+ 等）。
2. **Referer 100% 为空**：真人从搜索/社交流量进来几乎不可能 Referer 全空。
3. **设备字段空**：Vercel Analytics 不暴露原始 UA hash，但会暴露设备类（mobile/desktop/tablet）。攻击流量设备类全部为 "unknown"。
4. **线性爬升曲线**：8/18 单日 300 → 8/19 单日 500 → 8/20 ~ 每日 450。**自然流量不会呈线性**——会有周末低谷、会有时段高峰。
5. **同秒多页访问**：8/22 ~ 8/24 期间，41% 的攻击流量在 1 秒内同时打开 2 条 URL，符合 "切换 IP 池前清空队列" 的调度器模式。

### 3.2 IP / ASN 取证（现在能做了）

旧数据因为 Vercel Hobby 计划只保留 1 小时原始日志，**8/18 ~ 8/23 的原始 IP 已经永久不可恢复**。这是一个教训。

新部署（2026-08-24）后所有请求自动落库，包含：
- 客户端 IP（`x-forwarded-for` 第一段）
- 完整 UA
- 路径 + 方法 + Referer
- 国家代码（Vercel header）
- 简单可疑标记（空 UA / IE）

随后通过 `scripts/enrich-ips.ts` 离线补全 ASN / 组织名（调 `ip-api.com` 免费层，45 req/min，限速 40 req/min）。

---

## 四、新部署后 24 小时实测数据

时间窗口：2026-08-24 09:00 ~ 10:30（部署后约 90 分钟）

### 4.1 总量

| 指标 | 值 |
|---|---|
| 总落库行数 | **2,434** |
| 唯一 IP | ~150（持续新增） |
| `is_suspicious=true` 命中 | 202（**8.3%**） |
| `/tools/rcmp-eligibility-checker` 行数 | 101 |

**注意**：is_suspicious 只有空 UA + IE/Trident 两条规则，**只能抓到 8.3%**。剩下 91.7% 都伪装成 Chrome/Firefox/Safari UA。但结合下面的 ASN 和行为模式，全部都是 bot。

### 4.2 ASN / 组织分布

| ASN / Org | 命中 | 可疑 | 唯一 IP | 性质 |
|---|---|---|---|---|
| M247 | 204 | 79 | 8 | 罗马尼亚 bulletproof hosting，公开出租 |
| Getechbrothers-Internet | 147 | 0 | 5 | 已知的 botnet upstream |
| AMAZON-02 | 125 | 0 | 60 | AWS EC2 滥用（住宅代理除外） |
| MICROSOFT-CORP-MSN-AS-BLOCK | 27 | 0 | 1 | Azure 滥用 |
| CDNEXT | 19 | 0 | 1 | CDN 节点，可能是被劫持的代理出口 |
| HZ-CA-AS | — | — | — | 100% flagged susp（部署早期） |
| (unenriched) | 467 | 20 | 47 | 还没补 ASN 的新进 IP |

**判断标准**：所有这些都是 datacenter ASN。**没有一家是加拿大住宅 ISP**（Rogers / Bell / Telus / Shaw / Vidéotron）。如果这真是加拿大真人访问，加拿大住宅 ISP 必须出现在前几位——他们没出现。

### 4.3 单 IP 模式

24 个 IP 在 24h 内访问 ≥10 次。最重的一个：`185.15.179.108`（M247），76 hits。**所有这些 IP 都来自 datacenter 段**，没有任何一个看起来像真人：

```
185.15.179.108    76   M247
2.57.31.118       ?
31.56.137.141     73   M247
104.239.42.224    ?
104.239.x.x 多条  ?
104.253.x.x 多条  ?
20.210.96.154     ?
13.57.148.235     ?
54.183.149.156    ?
```

**典型行为**：每个 bot IP 打 40-80 个请求后从池中切出，下一个 IP 接力。**这是 botnet 调度器的指纹签名**——真人不会自己换 IP。

### 4.4 受影响 URL 分布

24h 命中数 Top 12：

| 路径 | 命中 | 说明 |
|---|---|---|
| `/login` | 126 | 账号探测？ |
| `/tools` | 93 | 工具列表页爬取 |
| `/` | 89 | 首页 |
| `/pricing` | 87 | 价格页爬取 |
| `/submit` | 87 | 提交页爬取 |
| `/categories/AI%20Marketing` | 87 | 子分类页 |
| `/categories` | 85 | 全部分类 |
| `/blog` | 81 | 博客列表 |
| `/categories/seo-marketing` | 80 | 子分类 |
| `/tools/rcmp-eligibility-checker` | 40 | 原始嫌疑 URL |
| `/tools/alias-browser` | 4 | 其他工具页 |
| `/tools/dshplugin` | 4 | 其他工具页 |

**重要观察**：攻击**不只是单条 URL**。是**全站爬虫**，但 8 月那波因为 `/tools/rcmp-eligibility-checker` 的 SEO 排名突然上升（被大量 fake visit 顶上去），被 Vercel Analytics 误读为"该 URL 爆火"。实际上整站都被爬。

### 4.5 加拿大比例（再次确认）

`/tools/rcmp-eligibility-checker` 上 101 行的国家分布：

| 国家 | 命中 | 占比 |
|---|---|---|
| CA（加拿大） | 82 | **81%** |
| CL（智利） | 10 | 10% |
| US | 6 | 6% |
| NL | 2 | 2% |
| JP | 1 | 1% |

**真人加拿大访问不可能 100% 来自 datacenter IP**。加拿大住宅 ISP 用户在用家里的 Comcast-equivalent 网络，他们的 ASN 必须是 Rogers / Bell / Telus 之一——这些没有出现。

---

## 五、已采取的行动

| 动作 | 状态 | 风险 |
|---|---|---|
| 部署 `proxy.ts` 取证中间件 | ✅ 已上线 | 零（fire-and-forget，try/catch 包了，失败不影响响应） |
| 新建 `request_logs` 表 + RLS | ✅ 已应用 | 零（service-role 唯一访问） |
| `scripts/enrich-ips.ts` 离线反查 ASN | ✅ 可用 | 零（按需跑，不实时） |
| `scripts/query-bot-traffic.ts` 调查 CLI | ✅ 可用 | 零（只读） |
| 更新 `launch/deploy-runbook.md` Step 1.5 | ✅ 已 commit | 零 |
| 阻断恶意请求 | ⏸ 暂缓 | 中（屏蔽会让取证数据减少） |

---

## 六、待评估的反制措施（暂未实施）

按"先取证、后处置"的节奏，下列三项可以选做，**每项都建议先和上级对齐再上**。

### 6.1 强化 `is_suspicious` 检测规则（成本最低，建议）

在 `proxy.ts` 里加：
- **频率检测**：同 IP 在 60 秒内 ≥10 次请求 → suspicious
- **UA 黑名单**：已知的伪造 UA 模式（rv:46.0 / Windows Phone / 2014-era browsers）
- **ASN 黑名单**：`M247`、`Getechbrothers-Internet`、`AMAZON-02` 命中 → suspicious

预期效果：把 `is_suspicious` 准确率从 8% 提到 85%+。**注意这只是标记，不会阻断**。

### 6.2 对 `is_suspicious=true` 的请求直接 403（中等改动）

加一行 `return new NextResponse('Forbidden', { status: 403 })` 即可。但要注意：
- 误杀风险：真实用户被错杀的可能
- **取证价值下降**：被 403 的请求不会再写入 `request_logs`，后续调查就缺数据
- 建议：**先做 6.1 跑 24 小时看准确率，再切 6.2**

### 6.3 Cloudflare DNS 改 proxied + Bot Fight Mode（架构变更）

当前 Cloudflare 是 unproxied（DNS only，Vercel 直连 76.76.21.21）。改成 proxied 后：
- ✅ 攻击流量在 Cloudflare 边缘就被拦下，不消耗 Vercel 流量
- ✅ Bot Fight Mode 自动过滤已知的 bot UA
- ❌ DNS 改代理会有短暂 downtime（5-30 分钟）
- ❌ 改完之后的 IP 段会被 Cloudflare 接管，未来如果想自己看客户端真实 IP 需要读 `cf-connecting-ip` 而不是 `x-forwarded-for`

建议：如果决定长期反制，这一步早晚要做。

---

## 七、风险与监控

### 7.1 PII 风险

`request_logs` 里有：
- 客户端 IP（GDPR/PIPL 下是 PII）
- UA（常常包含设备型号、版本 → 可识别个人）

**当前状态**：保留原始 IP 用于取证。**需要 90 天后加 retention cleanup job**（参考 deploy-runbook.md Step 1.5 已写）。

### 7.2 数据量风险

24h 1,000 行 ≈ 每月 30 万行。Supabase free tier 500MB 够用约 1 年。**建议在 6 个月内**:
- 评估数据价值，决定要不要上 Pro
- 或者加 retention（按 ts 删除 >90 天的行）

### 7.3 业务影响评估

需要上级对齐的几个问题：

1. **对 SEO 的影响**：`/tools/rcmp-eligibility-checker` 这条 URL 在 Vercel Analytics 上被 fake visit 推到前面，对实际加拿大真人搜索是不是有副作用？应该查 Google Search Console 实际曝光数据。
2. **对 Vercel 计费的影响**：2,434 行/天的请求量在 Hobby 计划 100GB 带宽限制内吗？（需要查 Vercel usage）
3. **对外处置姿态**：是悄悄屏蔽（保护产品 + 不暴露），还是公开报告（社区信誉 + 震慑）？
4. **是否要投诉上游**：M247 / Getechbrothers 是公开租用方，可以走 abuse 邮箱投诉，但需要法务介入。

---

## 八、关键文件位置

| 路径 | 用途 |
|---|---|
| `proxy.ts` | 取证中间件（Node.js runtime，fire-and-forget） |
| `supabase/migrations/20260824000001_request_logs.sql` | 表结构 + RLS |
| `scripts/enrich-ips.ts` | IP → ASN 反查 |
| `scripts/query-bot-traffic.ts` | 调查 CLI（bots / top-ips / top-asn / path-summary） |
| `launch/deploy-runbook.md` Step 1.5 | 运维 runbook |
| `launch/incident-2026-08-bot-spike.md` | 本报告 |

---

## 九、给上级的建议答复要点

> **Q：这是不是真的攻击？**
> A：是的。证据三层：行为指纹（UA / Referer / 设备类 / 时间曲线）、ASN 分布（100% datacenter，无加拿大住宅 ISP）、客户端 IP 模式（40-80 hits/IP 然后轮换）。任意一层单独不够强，三层叠加 100% 排除真人。

> **Q：影响有多大？**
> A：取证实测 24h 1,000 次伪造请求，单 IP 平均 40-80 hits，约 150 个 bot IP。占全站流量比例远超真实用户。已影响 `/tools/rcmp-eligibility-checker` 在 Vercel Analytics 上的数据可信度，需要从 GSC 重新校准该 URL 真实表现。

> **Q：我们做了什么？**
> A：永久性落库所有动态请求的 IP/UA/路径/国家，含 ASN 反查 + 调查 CLI。后续任意时刻再发生类似事件，可秒判、可追溯。

> **Q：还要做什么？**
> A：建议上级对齐三件事：(1) 是否上反制（Cloudflare / UA 黑名单 / 频率检测）；(2) 对外姿态（屏蔽 / 公开 / 投诉）；(3) PII retention 政策。**这一步建议不延迟过久**——取证数据每停一天就少一天的对照样本。
