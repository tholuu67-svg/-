// Deeply mapped types based on the user's provided variable system
export interface AttributeSet {
  [key: string]: number;
}

export interface Vitals {
  当前值: number;
  最大值: number;
}

export interface Item {
  name: string;
  type?: string;
  tier?: string;
  description?: string;
  quantity?: number;
  armor_value?: number;
  hands?: '单手' | '双手';
  attributes_bonus?: Record<string, number>;
  special_effects?: Record<string, string> | string;
}

export interface InventorySection {
  [itemName: string]: Item;
}

export interface Inventory {
  武器?: InventorySection;
  防具?: InventorySection;
  饰品?: InventorySection;
  消耗品?: InventorySection;
  材料?: InventorySection;
  金钱?: {
    金币: number;
    银币: number;
    铜币: number;
  };
  [key: string]: any;
}

export interface Equipment {
  武器?: InventorySection;
  防具?: InventorySection;
  饰品?: InventorySection;
  [key: string]: any;
}

export interface Skill {
  type: '主动' | '被动';
  level: '初级' | '中级' | '高级' | '精通' | '大师' | string;
  熟练度: number;
  description: string;
  cost?: string;
}

export interface Job {
  当前等级: number;
  最大等级: number;
  当前经验: number;
  升级所需: number;
}

export interface Asset {
  名称: string;
  位置: string;
  整体介绍?: string;
  内部结构布局?: string;
}

export interface Buff {
  description: string;
  level: string;
  attributes_bonus?: Record<string, number>;
  special_effects?: Record<string, string>;
  type: '永久' | '临时';
}

export interface Task {
  类型?: string;
  当前目标?: string;
  进度说明?: string;
  奖励预览?: string;
  完成评价?: string;
  获得奖励?: string;
  description?: string; // Fallback for simple string tasks
}

export interface Character {
  姓名: string;
  种族?: string;
  职业?: Record<string, Job>;
  所在地?: string;
  坐标?: { x: number; y: number };
  生命值: Vitals;
  魔力值?: Vitals;
  信仰力值?: Vitals;
  体力值?: Vitals;
  护甲值?: Vitals;
  能力?: AttributeSet;
  历练进度?: AttributeSet;
  背包?: Inventory;
  装备?: Equipment;
  资产?: Record<string, Asset>;
  当前状态?: Record<string, Buff>;
  技能列表?: Record<string, Skill>;
  任务日志?: {
    进行中?: Record<string, Task | string>;
    已完成?: Record<string, Task | string>;
  };
  // Relationship specific
  is_companion?: boolean;
  在场?: boolean;
  好感度?: Record<string, number>;
  信任度?: Record<string, number>;
  身份背景?: string;
  外貌?: string;
  性格标签?: Record<string, boolean>;
  重要记忆?: Record<string, string>;
  公会信息?: {
    所属公会?: string;
    公会阶级?: string;
    当前贡献度?: number;
  };
}

export interface Enemy extends Character {
  类型: string;
  备注?: string;
}

export interface Waypoint {
  坐标: { x: number; y: number };
  类型: '战斗讨伐' | '护卫运输' | '探索采集' | '杂物' | '调查' | string;
  临时?: boolean;
  概况?: string;
}

export interface WorldData {
  当前时间: string;
}

export interface StatData {
  世界: WorldData;
  主角: Character;
  关系列表: Record<string, Character>;
  敌人列表: Record<string, Enemy>;
  地图位标: Record<string, Waypoint>;
}
