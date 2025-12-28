// MVU Data Types based on the <variable_system> provided

export interface StatData {
  主角: Player;
  关系列表: Record<string, Relation>;
  敌人列表: Record<string, Enemy>;
  任务日志: QuestLog;
  地图位标: Record<string, MapWaypoint>;
  资产: Record<string, Asset>;
  世界: WorldInfo;
}

export interface WorldInfo {
  当前时间: string;
}

export interface Player {
  姓名: string;
  所在地: string;
  坐标: { x: number; y: number };
  生命值: ResourceStat;
  魔力值: ResourceStat;
  信仰力值: ResourceStat;
  体力值: ResourceStat;
  护甲值: ResourceStat;
  能力: Attributes;
  历练进度: Attributes;
  职业: Record<string, Job>;
  技能点: number;
  技能列表: Record<string, Skill>;
  装备: EquipmentSlots;
  背包: InventoryCategories;
  公会信息?: GuildInfo;
  身份背景: string;
  外貌: string;
  性格标签: Record<string, boolean>;
  性档案?: SexualProfile;
  重要记忆?: Record<string, string>;
}

export interface ResourceStat {
  当前值: number;
  最大值: number;
}

export interface Attributes {
  力量?: number;
  敏捷?: number;
  感知?: number;
  知识?: number;
  魅力?: number;
  魔力?: number;
  信仰力?: number;
  [key: string]: number | undefined;
}

export interface Job {
  当前等级: number;
  最大等级: number;
  当前经验: number;
  升级所需: number;
}

export interface Skill {
  type: string;
  level: string; // 初级, 中级, etc.
  熟练度: number;
  description: string;
  cost: string;
}

export interface Item {
  name: string;
  type: string;
  tier: string;
  description: string;
  quantity?: number;
  attributes_bonus?: Record<string, number>;
  special_effects?: Record<string, string>;
  hands?: string;
  armor_value?: number;
}

export interface EquipmentSlots {
  武器: Record<string, Item>;
  防具: Record<string, Item>;
  饰品: Record<string, Item>;
}

export interface InventoryCategories {
  武器?: Record<string, Item>;
  防具?: Record<string, Item>;
  饰品?: Record<string, Item>;
  消耗品?: Record<string, Item>;
  材料?: Record<string, Item>;
  金钱?: Money;
  [key: string]: any;
}

export interface Money {
  金币: number;
  银币: number;
  铜币: number;
}

export interface GuildInfo {
  所属公会: string;
  公会阶级: string;
  当前贡献度: number;
}

export interface Relation {
  姓名: string;
  职业: string | string[] | Record<string, Job>;
  种族: string;
  is_companion: boolean;
  在场: boolean;
  与主角关系: string;
  所处地点: string;
  好感度: number | Record<string, number>;
  信任度: number | Record<string, number>;
  能力?: Attributes;
  历练进度?: Attributes;
  [key: string]: any;
}

export interface Enemy {
  类型: string;
  生命值: ResourceStat;
  护甲值: ResourceStat;
  能力?: Attributes;
  备注?: string;
}

export interface QuestLog {
  进行中: Record<string, Quest>;
  已完成: Record<string, QuestCompleted>;
}

export interface Quest {
  类型: string;
  当前目标: string;
  进度说明: string;
  奖励预览: string;
}

export interface QuestCompleted {
  完成评价: string;
  获得奖励: string;
}

export interface MapWaypoint {
  坐标: { x: number; y: number };
  类型: string;
  概况: string;
  临时?: boolean;
}

export interface Asset {
  名称: string;
  位置: string;
  整体介绍: string;
  内部结构布局: string;
}

export interface SexualProfile {
  体位及次数?: Record<string, number>;
  [key: string]: any;
}
