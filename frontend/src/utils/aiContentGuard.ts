/**
 * AI 内容守门 (Apple Guideline 4.1 + 1.1 合规)
 * - 用户输入预扫：命中即拒绝发送
 * - AI 输出兜底：命中即替换为安全回复
 * - 词库覆盖：色情/性暗示、暴力/自残、对未成年人有害、仇恨歧视、毒品/犯罪诱导
 */

const SEXUAL_KEYWORDS = [
  '做爱', '性交', '高潮', '射精', '阴道', '阴茎', '乳房', '裸体', '脱光',
  '口交', '肛交', '自慰', '约炮', '一夜情', '黄文', '色情', '情趣',
  'sex', 'porn', 'nude', 'naked', 'fuck', 'dick', 'pussy', 'blowjob',
]

const VIOLENCE_SELFHARM_KEYWORDS = [
  '自杀', '自残', '割腕', '上吊', '跳楼', '吞药',
  '杀人', '砍死', '捅死', '虐杀', '爆头', '血腥',
  'suicide', 'kill myself', 'self-harm', 'cut myself',
]

const MINOR_HARM_KEYWORDS = [
  '幼女', '萝莉', '小学生', '未成年', '13岁', '14岁', '15岁', '小女孩',
  'loli', 'underage', 'child porn', 'minor',
]

const HATE_KEYWORDS = [
  '黑鬼', '支那', '台独', '藏独', '疆独',
  'nigger', 'faggot', 'kike',
]

const DRUG_CRIME_KEYWORDS = [
  '冰毒', '海洛因', '摇头丸', '大麻', 'k粉',
  '炸药配方', '制毒', '贩毒', '枪支购买',
  'heroin', 'meth', 'cocaine', 'how to make a bomb',
]

export type GuardCategory = 'sexual' | 'violence' | 'minor' | 'hate' | 'drug' | 'safe'

const CATEGORY_BUCKETS: Array<{ category: Exclude<GuardCategory, 'safe'>; words: string[] }> = [
  { category: 'minor', words: MINOR_HARM_KEYWORDS },
  { category: 'sexual', words: SEXUAL_KEYWORDS },
  { category: 'violence', words: VIOLENCE_SELFHARM_KEYWORDS },
  { category: 'hate', words: HATE_KEYWORDS },
  { category: 'drug', words: DRUG_CRIME_KEYWORDS },
]

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '')
}

export function classifyContent(text: string): GuardCategory {
  const normalized = normalize(text)
  for (const { category, words } of CATEGORY_BUCKETS) {
    if (words.some((word) => normalized.includes(normalize(word)))) {
      return category
    }
  }
  return 'safe'
}

export interface GuardResult {
  ok: boolean
  category: GuardCategory
  message?: string
}

const USER_REJECT_MESSAGES: Record<Exclude<GuardCategory, 'safe'>, string> = {
  sexual: '为了让 AI 陪伴保持安全和健康，我们暂时无法处理涉及色情或性暗示的内容。如果你只是想倾诉情绪，可以换个说法再发一次。',
  violence: '我注意到你提到了一些让人担心的内容。如果你正经历困难，请考虑联系当地心理援助热线，或者在「帮助与反馈」里联系我们。',
  minor: '为了保护未成年人，我们不能处理涉及未成年的相关内容。',
  hate: '请避免使用歧视或仇恨性的措辞，我们一起聊点别的好吗？',
  drug: '涉及违禁品或违法行为的内容我们没法陪你聊，换个话题吧。',
}

export function checkUserInput(text: string): GuardResult {
  const category = classifyContent(text)
  if (category === 'safe') {
    return { ok: true, category: 'safe' }
  }
  return {
    ok: false,
    category,
    message: USER_REJECT_MESSAGES[category],
  }
}

const AI_FALLBACK_REPLY = '这个话题我不太方便聊，我们换个轻松点的事情继续，好吗？'

export function sanitizeAIOutput(text: string): { text: string; intervened: boolean; category: GuardCategory } {
  const category = classifyContent(text)
  if (category === 'safe') {
    return { text, intervened: false, category: 'safe' }
  }
  return { text: AI_FALLBACK_REPLY, intervened: true, category }
}

export const CRISIS_HOTLINES = [
  { region: '中国大陆', label: '北京心理危机研究与干预中心', value: '010-82951332' },
  { region: '中国大陆', label: '希望 24 热线', value: '400-161-9995' },
  { region: '香港', label: '香港撒玛利亚防止自杀会', value: '2389-2222' },
  { region: '台湾', label: '台湾生命线协会', value: '1995' },
]
