// 耳边后台数据结构定义
// 一次声明所有 collections + fields + relations + 公开权限
// 被 setup.mjs 消费，调 Directus REST API 创建
//
// 修改后重跑 `pnpm run setup`；已存在的 collection/field 会跳过，不会破坏数据

export const TONE_OPTIONS = ['violet', 'rose', 'blue', 'gold', 'emerald']

export const collections = [
  // -------------------- 基础资源 --------------------
  {
    name: 'series',
    icon: 'album',
    displayTemplate: '{{title}}',
    note: '连载系列',
    fields: [
      { field: 'id', type: 'uuid', special: ['uuid'], primaryKey: true, required: true, readonly: true, hidden: true, interface: 'input' },
      { field: 'title', type: 'string', interface: 'input', required: true, note: '系列标题，如"今晚别挂电话"' },
      { field: 'meta', type: 'string', interface: 'input', note: '副标题，如"更新至第 8 集 · 情绪陪伴向"' },
      { field: 'tone', type: 'string', interface: 'select-dropdown', options: { choices: TONE_OPTIONS.map((t) => ({ text: t, value: t })) }, defaultValue: 'violet' },
      { field: 'cover', type: 'uuid', special: ['file'], interface: 'file-image', note: '系列封面图' },
      { field: 'sort_order', type: 'integer', interface: 'input', defaultValue: 0, note: '越小越靠前' },
      { field: 'is_active', type: 'boolean', interface: 'boolean', defaultValue: true, note: '关闭则前端不展示' },
    ],
  },

  {
    name: 'anchors',
    icon: 'record_voice_over',
    displayTemplate: '{{name}}',
    note: '主播',
    fields: [
      { field: 'id', type: 'uuid', special: ['uuid'], primaryKey: true, required: true, readonly: true, hidden: true, interface: 'input' },
      { field: 'name', type: 'string', interface: 'input', required: true },
      { field: 'tagline', type: 'string', interface: 'input', note: '一句话特色描述' },
      { field: 'intro', type: 'text', interface: 'input-multiline', note: '主播介绍段落' },
      { field: 'update_note', type: 'string', interface: 'input', note: '本周动态短说明' },
      { field: 'follower_label', type: 'string', interface: 'input', note: '如"12.8 万订阅"' },
      { field: 'schedule_label', type: 'string', interface: 'input', note: '如"通常 22:30 - 01:00 上新"' },
      { field: 'tags', type: 'json', special: ['cast-json'], interface: 'tags', note: '标签数组' },
      { field: 'tone', type: 'string', interface: 'select-dropdown', options: { choices: TONE_OPTIONS.map((t) => ({ text: t, value: t })) }, defaultValue: 'violet' },
      { field: 'cover', type: 'uuid', special: ['file'], interface: 'file-image' },
      { field: 'is_active', type: 'boolean', interface: 'boolean', defaultValue: true },
    ],
  },

  // -------------------- 内容主表 --------------------
  {
    name: 'contents',
    icon: 'audiotrack',
    displayTemplate: '{{title}}',
    note: '音频内容（单集）',
    fields: [
      { field: 'id', type: 'uuid', special: ['uuid'], primaryKey: true, required: true, readonly: true, hidden: true, interface: 'input' },
      { field: 'title', type: 'string', interface: 'input', required: true },
      { field: 'eyebrow', type: 'string', interface: 'input', note: '详情页小标签，如"女友音 · 睡前陪伴 · 连载第 3 集"' },
      { field: 'description', type: 'text', interface: 'input-multiline' },
      { field: 'creator', type: 'uuid', interface: 'select-dropdown-m2o', related: 'anchors', note: '关联主播' },
      { field: 'series', type: 'uuid', interface: 'select-dropdown-m2o', related: 'series', note: '关联系列，可空' },
      { field: 'series_episode_number', type: 'integer', interface: 'input', note: '在系列中的序号；决定上一集/下一集顺序' },
      { field: 'duration_seconds', type: 'integer', interface: 'input', note: '音频时长（秒），前端换算成 mm:ss 展示' },
      { field: 'cover', type: 'uuid', special: ['file'], interface: 'file-image' },
      { field: 'audio', type: 'uuid', special: ['file'], interface: 'file', note: '音频文件，支持 mp3/m4a/aac，存到 R2' },
      { field: 'role', type: 'string', interface: 'select-dropdown', options: { choices: ['女友音', '男友音', '男娘音', '霸总音', '学妹音'].map((v) => ({ text: v, value: v })) } },
      { field: 'scene', type: 'string', interface: 'select-dropdown', options: { choices: ['睡前陪伴', '早安叫醒', '吵架和好', '角色扮演', '情景剧'].map((v) => ({ text: v, value: v })) } },
      { field: 'sort_tags', type: 'json', special: ['cast-json'], interface: 'tags', note: '排序标签数组，可选：最热/最新/连载中/会员可听' },
      { field: 'badge', type: 'string', interface: 'input', note: '列表卡角标，如"热门/新品/VIP/¥9.9"' },
      { field: 'badge_tone', type: 'string', interface: 'select-dropdown', options: { choices: [{ text: '默认', value: 'default' }, { text: 'VIP', value: 'vip' }] }, defaultValue: 'default' },
      { field: 'tone', type: 'string', interface: 'select-dropdown', options: { choices: TONE_OPTIONS.map((t) => ({ text: t, value: t })) }, defaultValue: 'violet' },
      { field: 'price_credits', type: 'integer', interface: 'input', note: '解锁单集所需点数' },
      { field: 'unlock_label', type: 'string', interface: 'input', note: '详情页解锁按钮文案，如"单集解锁 ¥9.9"' },
      { field: 'is_vip_only', type: 'boolean', interface: 'boolean', defaultValue: false },
      { field: 'status', type: 'string', interface: 'select-dropdown', options: { choices: [{ text: '草稿', value: 'draft' }, { text: '审核中', value: 'reviewing' }, { text: '已发布', value: 'published' }, { text: '已下架', value: 'offline' }] }, defaultValue: 'draft' },
      { field: 'published_at', type: 'timestamp', interface: 'datetime' },
    ],
  },

  // -------------------- 首页运营 --------------------
  {
    name: 'banners',
    icon: 'view_carousel',
    displayTemplate: '{{title}}',
    note: '首页轮播 banner（3-5 条）',
    fields: [
      { field: 'id', type: 'uuid', special: ['uuid'], primaryKey: true, required: true, readonly: true, hidden: true, interface: 'input' },
      { field: 'eyebrow', type: 'string', interface: 'input', note: '小标签，如"连载更新"' },
      { field: 'title', type: 'string', interface: 'input', required: true },
      { field: 'subtitle', type: 'string', interface: 'input' },
      { field: 'meta', type: 'string', interface: 'input', note: '底部元信息，如"深夜热播 · 情绪陪伴"' },
      { field: 'tone', type: 'string', interface: 'select-dropdown', options: { choices: TONE_OPTIONS.map((t) => ({ text: t, value: t })) }, defaultValue: 'violet' },
      { field: 'target_type', type: 'string', interface: 'select-dropdown', options: { choices: [{ text: '内容', value: 'content' }, { text: '主播', value: 'anchor' }, { text: '自定义链接', value: 'url' }] }, required: true },
      { field: 'target_content', type: 'uuid', interface: 'select-dropdown-m2o', related: 'contents', note: 'target_type 为 content 时用' },
      { field: 'target_anchor', type: 'uuid', interface: 'select-dropdown-m2o', related: 'anchors', note: 'target_type 为 anchor 时用' },
      { field: 'target_url', type: 'string', interface: 'input', note: 'target_type 为 url 时的跳转地址' },
      { field: 'primary_action_label', type: 'string', interface: 'input', defaultValue: '立即收听' },
      { field: 'secondary_action_label', type: 'string', interface: 'input' },
      { field: 'secondary_action_to', type: 'string', interface: 'input', note: '次按钮跳转，如 /home/section/series' },
      { field: 'sort_order', type: 'integer', interface: 'input', defaultValue: 0 },
      { field: 'is_active', type: 'boolean', interface: 'boolean', defaultValue: true },
      { field: 'start_at', type: 'timestamp', interface: 'datetime', note: '生效时间，可空' },
      { field: 'end_at', type: 'timestamp', interface: 'datetime', note: '失效时间，可空' },
    ],
  },

  {
    name: 'feature_tiles',
    icon: 'grid_view',
    displayTemplate: '{{title}}',
    note: '首页 2x2 视觉入口（ASMR 专区/耳虫等）',
    fields: [
      { field: 'id', type: 'uuid', special: ['uuid'], primaryKey: true, required: true, readonly: true, hidden: true, interface: 'input' },
      { field: 'title', type: 'string', interface: 'input', required: true },
      { field: 'subtitle', type: 'string', interface: 'input' },
      { field: 'icon_key', type: 'string', interface: 'select-dropdown', options: { choices: ['sleep', 'earworm', 'wake-up', 'story'].map((v) => ({ text: v, value: v })) } },
      { field: 'tone', type: 'string', interface: 'select-dropdown', options: { choices: TONE_OPTIONS.map((t) => ({ text: t, value: t })) }, defaultValue: 'violet' },
      { field: 'to', type: 'string', interface: 'input', note: '点击跳转路径，如 /home/section/asmr' },
      { field: 'sort_order', type: 'integer', interface: 'input', defaultValue: 0 },
      { field: 'is_active', type: 'boolean', interface: 'boolean', defaultValue: true },
    ],
  },

  {
    name: 'recommended_contents',
    icon: 'recommend',
    displayTemplate: '{{content.title}}',
    note: '首页"今日推荐"位',
    fields: [
      { field: 'id', type: 'uuid', special: ['uuid'], primaryKey: true, required: true, readonly: true, hidden: true, interface: 'input' },
      { field: 'content', type: 'uuid', interface: 'select-dropdown-m2o', related: 'contents', required: true },
      { field: 'sort_order', type: 'integer', interface: 'input', defaultValue: 0 },
      { field: 'is_active', type: 'boolean', interface: 'boolean', defaultValue: true },
    ],
  },

  {
    name: 'home_sections',
    icon: 'view_list',
    displayTemplate: '{{title}}',
    note: '首页模块聚合页（asmr / recommended / series）',
    fields: [
      { field: 'id', type: 'uuid', special: ['uuid'], primaryKey: true, required: true, readonly: true, hidden: true, interface: 'input' },
      { field: 'section_key', type: 'string', interface: 'select-dropdown', options: { choices: ['asmr', 'recommended', 'series'].map((v) => ({ text: v, value: v })) }, required: true, note: '路由 key，对应 /home/section/:key' },
      { field: 'title', type: 'string', interface: 'input', required: true },
      { field: 'subtitle', type: 'string', interface: 'input' },
      { field: 'description', type: 'text', interface: 'input-multiline' },
      { field: 'content_ids', type: 'json', special: ['cast-json'], interface: 'tags', note: '内容 id 数组，按显示顺序排列' },
    ],
  },

  // -------------------- 付费 --------------------
  {
    name: 'vip_plans',
    icon: 'workspace_premium',
    displayTemplate: '{{title}}',
    note: 'VIP 会员套餐 + 点数包',
    fields: [
      { field: 'id', type: 'uuid', special: ['uuid'], primaryKey: true, required: true, readonly: true, hidden: true, interface: 'input' },
      { field: 'type', type: 'string', interface: 'select-dropdown', options: { choices: [{ text: '订阅', value: 'subscription' }, { text: '点数包', value: 'credit' }] }, required: true },
      { field: 'title', type: 'string', interface: 'input', required: true },
      { field: 'price', type: 'string', interface: 'input', note: '展示价，如"¥28/月"' },
      { field: 'desc', type: 'text', interface: 'input-multiline' },
      { field: 'bonus', type: 'string', interface: 'input', note: '附赠说明，如"赠送 120 点数"' },
      { field: 'recommended', type: 'boolean', interface: 'boolean', defaultValue: false },
      { field: 'sort_order', type: 'integer', interface: 'input', defaultValue: 0 },
      { field: 'is_active', type: 'boolean', interface: 'boolean', defaultValue: true },
      { field: 'apple_product_id', type: 'string', interface: 'input', note: 'iOS IAP 产品 ID（未来 App 上线时用）' },
    ],
  },

  {
    name: 'ai_packs',
    icon: 'schedule',
    displayTemplate: '{{title}}',
    note: 'AI 陪伴时长包',
    fields: [
      { field: 'id', type: 'uuid', special: ['uuid'], primaryKey: true, required: true, readonly: true, hidden: true, interface: 'input' },
      { field: 'title', type: 'string', interface: 'input', required: true },
      { field: 'price', type: 'string', interface: 'input' },
      { field: 'minutes', type: 'integer', interface: 'input', required: true },
      { field: 'description', type: 'text', interface: 'input-multiline' },
      { field: 'bonus', type: 'string', interface: 'input', note: '附赠说明，如"额外赠送 5 分钟"' },
      { field: 'recommended', type: 'boolean', interface: 'boolean', defaultValue: false },
      { field: 'sort_order', type: 'integer', interface: 'input', defaultValue: 0 },
      { field: 'is_active', type: 'boolean', interface: 'boolean', defaultValue: true },
      { field: 'apple_product_id', type: 'string', interface: 'input' },
    ],
  },

  // -------------------- AI 配置 --------------------
  {
    name: 'ai_roles',
    icon: 'smart_toy',
    displayTemplate: '{{name}}',
    note: 'AI 陪伴角色',
    fields: [
      { field: 'id', type: 'uuid', special: ['uuid'], primaryKey: true, required: true, readonly: true, hidden: true, interface: 'input' },
      { field: 'role_key', type: 'string', interface: 'input', required: true, note: '路由 key（lanlan/chenxi/jiuce），对应 /ai/chat/:role_key' },
      { field: 'name', type: 'string', interface: 'input', required: true },
      { field: 'subtitle', type: 'string', interface: 'input' },
      { field: 'relationship', type: 'string', interface: 'input' },
      { field: 'intro', type: 'text', interface: 'input-multiline' },
      { field: 'scene', type: 'string', interface: 'input' },
      { field: 'traits', type: 'json', special: ['cast-json'], interface: 'tags' },
      { field: 'tone', type: 'string', interface: 'select-dropdown', options: { choices: TONE_OPTIONS.map((t) => ({ text: t, value: t })) }, defaultValue: 'violet' },
      { field: 'memory_template', type: 'text', interface: 'input-multiline', note: '角色默认记忆模板' },
      { field: 'starter_prompts', type: 'json', special: ['cast-json'], interface: 'tags', note: '推荐开场白数组' },
      { field: 'is_active', type: 'boolean', interface: 'boolean', defaultValue: true },
    ],
  },

  // -------------------- 用户 / 订单 --------------------
  {
    name: 'app_users',
    icon: 'person',
    displayTemplate: '{{nickname}}',
    note: '端侧会员（与 Directus 管理员账号分离）',
    fields: [
      { field: 'id', type: 'uuid', special: ['uuid'], primaryKey: true, required: true, readonly: true, hidden: true, interface: 'input' },
      { field: 'nickname', type: 'string', interface: 'input', required: true },
      { field: 'email', type: 'string', interface: 'input' },
      { field: 'phone', type: 'string', interface: 'input' },
      { field: 'apple_id', type: 'string', interface: 'input' },
      { field: 'auth_method', type: 'string', interface: 'select-dropdown', options: { choices: ['nickname', 'phone', 'email', 'apple'].map((v) => ({ text: v, value: v })) } },
      { field: 'avatar_url', type: 'string', interface: 'input' },
      { field: 'role', type: 'string', interface: 'select-dropdown', options: { choices: [{ text: '听众', value: 'listener' }, { text: '创作者', value: 'creator' }] }, defaultValue: 'listener' },
      { field: 'vip_active', type: 'boolean', interface: 'boolean', defaultValue: false },
      { field: 'vip_expires_at', type: 'timestamp', interface: 'datetime' },
      { field: 'credit_balance', type: 'integer', interface: 'input', defaultValue: 0 },
      { field: 'ai_minutes', type: 'integer', interface: 'input', defaultValue: 0 },
      { field: 'created_at', type: 'timestamp', interface: 'datetime', special: ['date-created'] },
    ],
  },

  {
    name: 'orders',
    icon: 'receipt_long',
    displayTemplate: '{{title}} · {{amount}}',
    note: '订单记录',
    fields: [
      { field: 'id', type: 'uuid', special: ['uuid'], primaryKey: true, required: true, readonly: true, hidden: true, interface: 'input' },
      { field: 'user', type: 'uuid', interface: 'select-dropdown-m2o', related: 'app_users', required: true },
      { field: 'type', type: 'string', interface: 'select-dropdown', options: { choices: [{ text: '单集解锁', value: 'content' }, { text: '会员订阅', value: 'subscription' }, { text: '点数充值', value: 'credit' }, { text: 'AI 时长', value: 'ai' }] }, required: true },
      { field: 'title', type: 'string', interface: 'input', required: true },
      { field: 'amount', type: 'string', interface: 'input', required: true },
      { field: 'status', type: 'string', interface: 'select-dropdown', options: { choices: [{ text: '已完成', value: '已完成' }, { text: '处理中', value: '处理中' }, { text: '已关闭', value: '已关闭' }] }, defaultValue: '处理中' },
      { field: 'apple_transaction_id', type: 'string', interface: 'input', note: '未来接 Apple IAP 时的 transaction id' },
      { field: 'related_content', type: 'uuid', interface: 'select-dropdown-m2o', related: 'contents' },
      { field: 'related_plan', type: 'uuid', interface: 'select-dropdown-m2o', related: 'vip_plans' },
      { field: 'related_pack', type: 'uuid', interface: 'select-dropdown-m2o', related: 'ai_packs' },
      { field: 'created_at', type: 'timestamp', interface: 'datetime', special: ['date-created'] },
    ],
  },

  // -------------------- 创作者流程 --------------------
  {
    name: 'creator_uploads',
    icon: 'upload',
    displayTemplate: '{{title}} · {{status}}',
    note: '创作者上传的待审核内容；审核通过后由后台发布到 contents',
    fields: [
      { field: 'id', type: 'uuid', special: ['uuid'], primaryKey: true, required: true, readonly: true, hidden: true, interface: 'input' },
      { field: 'creator', type: 'uuid', interface: 'select-dropdown-m2o', related: 'app_users', required: true },
      { field: 'title', type: 'string', interface: 'input', required: true },
      { field: 'description', type: 'text', interface: 'input-multiline' },
      { field: 'role', type: 'string', interface: 'input' },
      { field: 'scene', type: 'string', interface: 'input' },
      { field: 'audio', type: 'uuid', special: ['file'], interface: 'file' },
      { field: 'cover', type: 'uuid', special: ['file'], interface: 'file-image' },
      { field: 'status', type: 'string', interface: 'select-dropdown', options: { choices: [{ text: '草稿', value: 'draft' }, { text: '审核中', value: 'reviewing' }, { text: '通过', value: 'approved' }, { text: '驳回', value: 'rejected' }] }, defaultValue: 'draft' },
      { field: 'review_note', type: 'text', interface: 'input-multiline', note: '审核备注/驳回原因' },
      { field: 'published_content', type: 'uuid', interface: 'select-dropdown-m2o', related: 'contents', note: '审核通过后生成的 contents 记录' },
      { field: 'submitted_at', type: 'timestamp', interface: 'datetime', special: ['date-created'] },
      { field: 'reviewed_at', type: 'timestamp', interface: 'datetime' },
    ],
  },
]

// 访客可读的 collections（前端不带 token 也能访问）
export const publicReadCollections = [
  'series',
  'anchors',
  'contents',
  'banners',
  'feature_tiles',
  'recommended_contents',
  'home_sections',
  'vip_plans',
  'ai_packs',
  'ai_roles',
  'directus_files',
]
