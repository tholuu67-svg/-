// Goblin Slayer Status Bar Extension Entry Point
// Handles both the Main Window (Floating Ball) and the Panel (React App) logic.

(async function() {
    const PANEL_ROOT_ID = 'gs-status-root';
    const rootElement = document.getElementById(PANEL_ROOT_ID);

    // ----------------------------------------------------------------------
    // LOGIC 1: MAIN WINDOW CONTEXT (Floating Ball)
    // ----------------------------------------------------------------------
    if (!rootElement) {
        console.log('GS Status Bar: Running in Main Window Context. Initializing Floating Ball...');

        // Avoid duplicate balls
        if (document.getElementById('gs-floating-ball')) return;

        // 1. Inject Styles for the Ball
        const style = document.createElement('style');
        style.textContent = `
            #gs-floating-ball {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #1a234f, #3c2a4d);
                color: #a8c0ff;
                border: 2px solid #a8c0ff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                user-select: none;
                transition: transform 0.2s, box-shadow 0.2s;
                font-family: serif;
                font-weight: bold;
                font-size: 24px;
            }
            #gs-floating-ball:hover {
                transform: scale(1.1);
                box-shadow: 0 0 20px rgba(168, 192, 255, 0.6);
                color: #fff;
            }
            #gs-floating-ball:active {
                transform: scale(0.95);
            }
            .gs-ball-icon {
                pointer-events: none;
                filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));
            }
        `;
        document.head.appendChild(style);

        // 2. Create the Ball
        const ball = document.createElement('div');
        ball.id = 'gs-floating-ball';
        ball.innerHTML = '<span class="gs-ball-icon">⚔️</span>';
        ball.title = 'Open Goblin Slayer Status';
        document.body.appendChild(ball);

        // 3. Drag Logic
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        let hasMoved = false;

        ball.addEventListener('mousedown', (e) => {
            isDragging = true;
            hasMoved = false;
            startX = e.clientX;
            startY = e.clientY;
            
            // Get computed style for accurate starting position
            const rect = ball.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            // Clear right/bottom to switch to left/top positioning for dragging
            ball.style.right = 'auto';
            ball.style.bottom = 'auto';
            ball.style.left = `${initialLeft}px`;
            ball.style.top = `${initialTop}px`;
            
            ball.style.cursor = 'grabbing';
            e.preventDefault(); // Prevent text selection
        });

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                hasMoved = true;
            }

            ball.style.left = `${initialLeft + dx}px`;
            ball.style.top = `${initialTop + dy}px`;
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                ball.style.cursor = 'pointer';
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        // 4. Click Logic (Open Panel)
        ball.addEventListener('click', () => {
            if (hasMoved) return; // Ignore click if it was a drag

            console.log('GS Status Bar: Floating ball clicked.');
            
            // Attempt to find and click the extension menu item
            // Strategy: Look for the extension name in the extensions menu or triggers
            // This is a heuristic because ST API varies. 
            // We assume the extension is named "Goblin Slayer Status Bar" in the UI.
            
            const extensionName = "Goblin Slayer Status Bar";
            
            // Try 1: Look for a button with the title or text
            const buttons = Array.from(document.querySelectorAll('div, button, li'));
            const target = buttons.find(el => 
                (el.innerText && el.innerText.includes(extensionName)) || 
                (el.title && el.title.includes(extensionName))
            );

            if (target) {
                target.click();
            } else {
                // Fallback: If we can't find the specific button, toggle the extensions menu
                // hoping the user can see it, or use jQuery if available (common in ST)
                if (window.jQuery) {
                    // Try standard ID pattern
                    const idSelector = '[data-extension-id="gs_status_bar_extension"]';
                    if (window.jQuery(idSelector).length) {
                        window.jQuery(idSelector).click();
                        return;
                    }
                }
                alert('Could not auto-open panel. Please open "Goblin Slayer Status Bar" from the Extensions menu.');
            }
        });

        return; // Stop execution for main window
    }

    // ----------------------------------------------------------------------
    // LOGIC 2: PANEL CONTEXT (React App)
    // ----------------------------------------------------------------------
    
    console.log('GS Status Bar: Running in Panel Context. Initializing App...');

    // 1. Load Dependencies
    // Using esm.sh for reliable module loading
    const { default: React, useState, useEffect, useMemo, useCallback, useRef } = await import('https://esm.sh/react@18.2.0');
    const { default: ReactDOM } = await import('https://esm.sh/react-dom@18.2.0/client');
    const { default: htm } = await import('https://esm.sh/htm@3.1.1');
    
    // Bind HTM to React
    const html = htm.bind(React.createElement);

    // ----------------------------------------------------------------------
    // SERVICES
    // ----------------------------------------------------------------------
    
    const MOCK_DATA = {
        世界: { 当前时间: '王国历 1024-05-12' },
        主角: {
          姓名: '哥布林杀手',
          所在地: '边境小镇',
          坐标: { x: 1110, y: 764 },
          生命值: { 当前值: 85, 最大值: 100 },
          魔力值: { 当前值: 20, 最大值: 50 },
          信仰力值: { 当前值: 0, 最大值: 0 },
          体力值: { 当前值: 90, 最大值: 100 },
          护甲值: { 当前值: 45, 最大值: 50 },
          能力: { 力量: 14, 敏捷: 16, 魅力: 8, 知识: 12 },
          历练进度: { 力量: 45, 敏捷: 10, 魅力: 0, 知识: 20 },
          职业: {
            战士: { 当前等级: 3, 最大等级: 10, 当前经验: 450, 升级所需: 1000 },
            游侠: { 当前等级: 2, 最大等级: 10, 当前经验: 100, 升级所需: 800 }
          },
          技能点: 1,
          技能列表: {
            '重击': { type: '主动', level: '初级', 熟练度: 15, description: '用力攻击。', cost: '5 体力' }
          },
          装备: {
            武器: { '短剑': { name: '短剑', type: '单手剑', tier: '普通', description: '普通的铁剑' } },
            防具: { '皮甲': { name: '皮甲', type: '轻甲', tier: '普通', description: '有点旧的皮甲', armor_value: 10 } },
            饰品: {}
          },
          背包: {
            金钱: { 金币: 10, 银币: 45, 铜币: 20 },
            消耗品: { '回复药': { name: '回复药', type: '药水', tier: '普通', description: '回复少量HP', quantity: 3 } }
          },
          身份背景: '专门狩猎哥布林的银等级冒险者。',
          外貌: '身穿脏兮兮的皮甲，戴着铁盔。',
          性格标签: { '冷酷': true, '务实': true }
        },
        关系列表: {
          '女神官': {
            姓名: '女神官', 职业: '神官', 种族: '人类', is_companion: true, 在场: true,
            与主角关系: '队友', 所处地点: '边境小镇', 好感度: 60, 信任度: 75
          }
        },
        敌人列表: {
          '哥布林A': { 类型: '人形', 生命值: { 当前值: 5, 最大值: 10 }, 护甲值: { 当前值: 0, 最大值: 0 }, 备注: '手持木棒' }
        },
        任务日志: {
          进行中: { '清理下水道': { 类型: '讨伐', 当前目标: '消灭3只巨鼠', 进度说明: '已消灭 1/3', 奖励预览: '10银币' } },
          已完成: {}
        },
        地图位标: {},
        资产: {}
      };
      
      const getStatData = async () => {
        try {
          if (window.parent && window.parent.Mvu) {
            const response = await window.parent.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
            return response.stat_data;
          }
          // Only use mock data if specifically developing locally, otherwise empty for production
          // console.warn("MVU API not found, using mock data.");
          return MOCK_DATA;
        } catch (error) {
          console.error("Error fetching MVU data:", error);
          return MOCK_DATA;
        }
      };

    // ----------------------------------------------------------------------
    // COMPONENTS
    // ----------------------------------------------------------------------

    const ProgressBar = ({ current, max, colorClass, label, icon, showValues = true }) => {
        const safeCurrent = Number(current) || 0;
        const safeMax = Number(max) || 1; 
        const percentage = Math.min(100, Math.max(0, (safeCurrent / safeMax) * 100));
      
        return html`
          <div className="mb-3">
            ${(label || showValues) && html`
              <div className="flex justify-between items-center mb-1 text-sm font-serif">
                <div className="flex items-center gap-2">
                  ${icon && html`<span>${icon}</span>`}
                  ${label && html`<span className="font-bold text-accentBlue">${label}</span>`}
                </div>
                ${showValues && html`
                  <span className="font-bold text-white text-shadow-sm">
                    ${safeCurrent}/${safeMax}
                  </span>
                `}
              </div>
            `}
            <div className="h-3 bg-black/40 rounded-full border border-accentBlue/20 shadow-inner overflow-hidden relative">
              <div 
                className="h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                style=${{ 
                  width: `${percentage}%`, 
                  backgroundColor: colorClass,
                  backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,0.1) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.1) 75%,transparent 75%,transparent)',
                  backgroundSize: '20px 20px'
                }}
              />
            </div>
          </div>
        `;
    };

    const StatusView = ({ player, openSkillTree }) => {
        const renderItem = (name, item) => html`
            <div key=${name} className="bg-white/5 border border-accentBlue/20 rounded p-2 mb-2 hover:border-accentBlue/50 transition-colors">
            <div className="flex justify-between items-start">
                <span className="font-bold text-accentBlue">${item.name || name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-white/20 bg-black/20 text-gray-300">
                ${item.tier || '普通'}
                </span>
            </div>
            <div className="text-xs text-gray-400 italic mt-1">${item.description}</div>
            ${item.quantity && html`<div className="text-xs text-right mt-1">x${item.quantity}</div>`}
            </div>
        `;

        const inventoryList = useMemo(() => {
            if (!player.背包) return null;
            return Object.entries(player.背包).map(([category, items]) => {
                if (category === '金钱') return null;
                if (!items || Object.keys(items).length === 0) return null;
                return html`
                    <details key=${category} className="mb-2 group bg-black/20 rounded border border-white/10 open:border-accentBlue/30">
                    <summary className="cursor-pointer p-2 font-display font-bold hover:bg-white/5 transition-colors select-none flex justify-between items-center">
                        <span>📦 ${category}</span>
                        <span className="group-open:rotate-90 transition-transform">›</span>
                    </summary>
                    <div className="p-2">
                        ${Object.entries(items).map(([name, item]) => renderItem(name, item))}
                    </div>
                    </details>
                `;
            });
        }, [player.背包]);

        return html`
            <div className="space-y-6 animate-fadeIn">
                <div className="bg-black/30 p-4 rounded-lg border border-accentBlue/30 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 font-decorative text-6xl pointer-events-none">GS</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h2 className="text-2xl font-display text-accentBlue mb-2">${player.姓名}</h2>
                            <p className="text-sm text-gray-300 mb-1"><span className="text-accentBlueDeep">所在地:</span> ${player.所在地} (${player.坐标.x}, ${player.坐标.y})</p>
                            <p className="text-sm text-gray-300"><span className="text-accentBlueDeep">身份:</span> ${player.身份背景}</p>
                        </div>
                        <div className="text-right flex flex-col items-end justify-center">
                            <div className="text-sm text-gray-400">技能点</div>
                            <div className="text-3xl font-bold text-staminaColor text-shadow-md">${player.技能点}</div>
                            <button 
                            onClick=${openSkillTree}
                            className="mt-2 text-xs bg-accentBlue/20 hover:bg-accentBlue/40 text-accentBlue border border-accentBlue/50 px-3 py-1 rounded transition-all"
                            >
                            管理职业 & 技能
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-black/30 p-4 rounded-lg border border-accentBlue/30">
                    <h3 className="font-display text-lg mb-4 text-center border-b border-white/10 pb-2">核心状态</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        <${ProgressBar} current=${player.生命值.当前值} max=${player.生命值.最大值} colorClass="#ff6b6b" label="生命值" icon="❤️" />
                        <${ProgressBar} current=${player.护甲值.当前值} max=${player.护甲值.最大值} colorClass="#8cb4ff" label="护甲值" icon="🛡️" />
                        <${ProgressBar} current=${player.魔力值.当前值} max=${player.魔力值.最大值} colorClass="#c792ea" label="魔力值" icon="🔮" />
                        <${ProgressBar} current=${player.信仰力值.当前值} max=${player.信仰力值.最大值} colorClass="#fffac8" label="信仰值" icon="🌟" />
                        <${ProgressBar} current=${player.体力值.当前值} max=${player.体力值.最大值} colorClass="#5fdba7" label="体力值" icon="⚡" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-black/30 p-4 rounded-lg border border-accentBlue/30">
                        <h3 className="font-display text-lg mb-4 text-center border-b border-white/10 pb-2">能力 & 历练</h3>
                        <div className="space-y-3">
                            ${player.能力 && Object.entries(player.能力).map(([key, value]) => html`
                                <div key=${key}>
                                    <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold">${key}</span>
                                    <span className="text-accentBlue font-bold text-lg">${value}</span>
                                    </div>
                                    ${player.历练进度 && html`
                                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-staminaColor/70" 
                                            style=${{ width: `${Math.min(100, player.历练进度[key] || 0)}%` }} 
                                        />
                                    </div>
                                    `}
                                </div>
                            `)}
                        </div>
                    </div>

                    <div className="bg-black/30 p-4 rounded-lg border border-accentBlue/30">
                    <h3 className="font-display text-lg mb-4 text-center border-b border-white/10 pb-2">装备槽</h3>
                    ${player.装备 && Object.entries(player.装备).map(([slot, items]) => html`
                        <div key=${slot} className="mb-3">
                        <div className="text-xs text-accentBlueDeep uppercase mb-1">${slot}</div>
                        ${Object.values(items).map((item, idx) => html`
                            <div key=${idx} className="bg-white/5 p-2 rounded flex justify-between items-center border border-white/5">
                            <span className="font-serif font-bold text-sm">${item.name}</span>
                            <span className="text-xs text-gray-400">${item.tier}</span>
                            </div>
                        `)}
                        ${Object.keys(items).length === 0 && html`<div className="text-sm text-gray-500 italic">空</div>`}
                        </div>
                    `)}
                    </div>
                </div>

                <div className="bg-black/30 p-4 rounded-lg border border-accentBlue/30">
                    <h3 className="font-display text-lg mb-4 text-center border-b border-white/10 pb-2">背包物品</h3>
                    ${player.背包 && player.背包.金钱 && html`
                    <div className="flex justify-center gap-4 mb-4 font-display text-sm">
                        <span className="text-yellow-400 drop-shadow-sm">📀 ${player.背包.金钱.金币} G</span>
                        <span className="text-gray-300 drop-shadow-sm">💿 ${player.背包.金钱.银币} S</span>
                        <span className="text-orange-700 drop-shadow-sm">cx ${player.背包.金钱.铜币} C</span>
                    </div>
                    `}
                    ${inventoryList}
                </div>
            </div>
        `;
    };

    const TaskView = ({ questLog }) => {
        const activeQuests = questLog.进行中 || {};
        const completedQuests = questLog.已完成 || {};

        const renderActiveQuest = (name, quest) => html`
            <div key=${name} className="bg-gradient-to-br from-blue-900/30 to-black/40 border border-accentBlue/40 rounded-lg p-4 mb-4 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-accentBlue/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none group-hover:bg-accentBlue/10 transition-colors"></div>
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <h4 className="font-display text-lg text-white font-bold tracking-wide">${name}</h4>
                    <span className="text-xs bg-accentBlue/20 text-accentBlue px-2 py-1 rounded border border-accentBlue/30">
                    ${quest.类型}
                    </span>
                </div>
                <div className="space-y-2 text-sm relative z-10">
                    <div className="flex items-start gap-2">
                    <span className="opacity-70 min-w-[3rem]">目标:</span>
                    <span className="text-gray-200">${quest.当前目标}</span>
                    </div>
                    ${quest.进度说明 && html`
                    <div className="flex items-start gap-2">
                        <span className="opacity-70 min-w-[3rem]">进度:</span>
                        <span className="text-staminaColor">${quest.进度说明}</span>
                    </div>
                    `}
                    <div className="flex items-start gap-2 mt-2 pt-2 border-t border-white/10">
                    <span className="opacity-70 min-w-[3rem]">奖励:</span>
                    <span className="text-yellow-200">${quest.奖励预览}</span>
                    </div>
                </div>
            </div>
        `;

        const renderCompletedQuest = (name, quest) => html`
            <div key=${name} className="bg-white/5 border border-white/10 rounded-lg p-3 mb-2 opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-center">
                    <h4 className="font-serif text-gray-300 font-bold line-through decoration-black/50">${name}</h4>
                    <span className="text-xs text-green-400">✓ 完成</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">评价: ${quest.完成评价}</div>
            </div>
        `;

        return html`
            <div className="space-y-6 animate-fadeIn">
                <div>
                    <h3 className="font-decorative text-xl text-accentBlue mb-4 flex items-center gap-2">
                    <span>⚔️</span> 进行中任务
                    </h3>
                    ${Object.keys(activeQuests).length === 0 ? html`
                    <div className="text-center p-8 border border-dashed border-white/20 rounded-lg text-gray-500 italic">
                        暂无进行中的任务
                    </div>
                    ` : Object.entries(activeQuests).map(([name, quest]) => renderActiveQuest(name, quest))}
                </div>

                <div>
                    <h3 className="font-decorative text-xl text-gray-400 mb-4 flex items-center gap-2">
                    <span>📜</span> 历史记录
                    </h3>
                    ${Object.keys(completedQuests).length === 0 ? html`
                    <div className="text-center p-4 text-gray-600 text-sm">暂无完成记录</div>
                    ` : Object.entries(completedQuests).map(([name, quest]) => renderCompletedQuest(name, quest))}
                </div>
            </div>
        `;
    };

    const WorldView = ({ relations, enemies }) => {
        const [activeSubTab, setActiveSubTab] = useState('relations');

        const renderRelationCard = (name, npc) => {
            const isPresent = npc.在场;
            return html`
                <details key=${name} className="group bg-black/30 border border-accentBlue/20 rounded-lg overflow-hidden mb-3 transition-all hover:border-accentBlue/40">
                    <summary className="flex items-center justify-between p-3 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors select-none">
                    <div className="flex items-center gap-2">
                        <span className=${`w-2 h-2 rounded-full ${isPresent ? 'bg-green-400 shadow-[0_0_5px_lime]' : 'bg-gray-600'}`}></span>
                        <span className="font-bold text-lg text-primaryText">${name}</span>
                        ${npc.is_companion && html`<span className="text-yellow-400 text-xs border border-yellow-400/50 px-1 rounded">队友</span>`}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">${npc.种族} | ${typeof npc.职业 === 'string' ? npc.职业 : '多职业'}</span>
                        <span className="text-accentBlue group-open:rotate-90 transition-transform">›</span>
                    </div>
                    </summary>
                    <div className="p-4 space-y-3 text-sm bg-black/20">
                        <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs text-gray-500 uppercase">关系</div>
                            <div className="font-bold text-accentBlue">${npc.与主角关系}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase">地点</div>
                            <div>${npc.所处地点}</div>
                        </div>
                        </div>
                        
                        ${(typeof npc.好感度 === 'number') && html`
                        <${ProgressBar} current=${npc.好感度} max=${100} colorClass="#ff85a2" label="好感度" />
                        `}
                        
                        ${npc.身份背景 && html`
                        <div className="bg-black/20 p-2 rounded border border-white/5">
                            <div className="text-xs text-gray-500 mb-1">背景</div>
                            <div className="italic text-gray-300">${npc.身份背景}</div>
                        </div>
                        `}
                    </div>
                </details>
            `;
        };

        const renderEnemyCard = (name, enemy) => html`
            <div key=${name} className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-red-200 text-lg">${name}</span>
                    <span className="text-xs text-red-400 border border-red-500/30 px-2 py-0.5 rounded">${enemy.类型}</span>
                </div>
                <${ProgressBar} current=${enemy.生命值.当前值} max=${enemy.生命值.最大值} colorClass="#ef4444" label="HP" icon="💀" />
                ${enemy.备注 && html`<div className="text-xs text-red-300 mt-2 bg-red-950/30 p-2 rounded">⚠️ ${enemy.备注}</div>`}
            </div>
        `;

        return html`
            <div className="animate-fadeIn">
                <div className="flex gap-2 mb-4 border-b border-white/10 pb-2">
                    <button 
                    onClick=${() => setActiveSubTab('relations')}
                    className=${`px-4 py-2 rounded-t-lg font-display text-sm transition-colors ${activeSubTab === 'relations' ? 'bg-accentBlue/20 text-accentBlue border-b-2 border-accentBlue' : 'text-gray-400 hover:text-white'}`}
                    >
                    关系者 (${Object.keys(relations || {}).length})
                    </button>
                    <button 
                    onClick=${() => setActiveSubTab('enemies')}
                    className=${`px-4 py-2 rounded-t-lg font-display text-sm transition-colors ${activeSubTab === 'enemies' ? 'bg-red-900/20 text-red-300 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
                    >
                    敌对者 (${Object.keys(enemies || {}).length})
                    </button>
                </div>

                <div className="min-h-[300px]">
                    ${activeSubTab === 'relations' ? (
                    Object.keys(relations || {}).length > 0 ? Object.entries(relations).map(([name, npc]) => renderRelationCard(name, npc)) : html`<p className="text-gray-500 text-center mt-10">暂无记录</p>`
                    ) : (
                    Object.keys(enemies || {}).length > 0 ? Object.entries(enemies).map(([name, enemy]) => renderEnemyCard(name, enemy)) : html`<p className="text-gray-500 text-center mt-10">周围安全</p>`
                    )}
                </div>
            </div>
        `;
    };

    const MapView = ({ player, waypoints }) => {
        const mapRef = useRef(null);
        const mapInstanceRef = useRef(null);

        useEffect(() => {
            if (!mapRef.current || typeof L === 'undefined') return;

            if (!mapInstanceRef.current) {
                const imageWidth = 2695;
                const imageHeight = 1840;
                const bounds = [[0, 0], [imageHeight, imageWidth]];

                const map = L.map(mapRef.current, {
                    crs: L.CRS.Simple,
                    minZoom: -2,
                    maxZoom: 2,
                    zoom: -1,
                    center: [imageHeight / 2, imageWidth / 2],
                    attributionControl: false
                });

                L.imageOverlay('https://files.catbox.moe/afahhd.png', bounds).addTo(map);
                map.fitBounds(bounds);
                mapInstanceRef.current = map;
            }

            const map = mapInstanceRef.current;
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            const flipY = (y) => 1840 - y;

            if (player.坐标) {
                const playerIcon = L.icon({
                    iconUrl: 'https://files.catbox.moe/euux9v.png',
                    iconSize: [48, 48],
                    iconAnchor: [24, 24],
                });
                L.marker([flipY(player.坐标.y), player.坐标.x], { icon: playerIcon, zIndexOffset: 1000 })
                .addTo(map)
                .bindPopup(`<b>${player.姓名}</b><br>${player.所在地}`);
            }

            if (waypoints) {
                const defaultIcon = L.icon({
                    iconUrl: 'https://s21.ax1x.com/2025/10/15/pVqASyD.png',
                    iconSize: [32, 32],
                });

                Object.entries(waypoints).forEach(([key, wp]) => {
                    if (wp.坐标) {
                        L.marker([flipY(wp.坐标.y), wp.坐标.x], { icon: defaultIcon })
                        .addTo(map)
                        .bindPopup(`<b>${key}</b><br>${wp.概况 || wp.类型}`);
                    }
                });
            }
        }, [player, waypoints]);

        return html`
            <div className="animate-fadeIn">
                <h3 className="font-decorative text-xl text-accentBlue mb-2">世界地图</h3>
                <div className="border-2 border-accentBlue/30 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(168,192,255,0.2)]">
                    <div ref=${mapRef} style=${{ height: '500px', width: '100%', background: '#111' }}></div>
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                    点击拖拽移动 · 滚轮缩放
                </div>
            </div>
        `;
    };

    const TerritoryView = ({ assets }) => {
        if (!assets || Object.keys(assets).length === 0) {
            return html`
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 animate-fadeIn">
                    <span className="text-4xl mb-2">🏚️</span>
                    <p>名下暂无资产或领地</p>
                </div>
            `;
        }

        return html`
            <div className="animate-fadeIn grid grid-cols-1 gap-6">
                ${Object.entries(assets).map(([key, asset]) => html`
                    <div key=${key} className="bg-black/30 border border-amber-600/30 rounded-lg p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl">🏰</div>
                        <h3 className="font-display text-2xl text-amber-500 mb-1">${asset.名称 || key}</h3>
                        <div className="text-sm text-amber-200/60 mb-4 flex items-center gap-2">
                            <span>📍</span> ${asset.位置}
                        </div>
                        
                        <div className="space-y-4">
                            <div className="bg-black/20 p-4 rounded border border-white/5">
                                <h4 className="text-xs text-gray-500 uppercase mb-1">整体介绍</h4>
                                <p className="text-gray-300 leading-relaxed font-serif text-sm">${asset.整体介绍}</p>
                            </div>
                            
                            ${asset.内部结构布局 && html`
                                <div className="bg-black/20 p-4 rounded border border-white/5">
                                    <h4 className="text-xs text-gray-500 uppercase mb-1">布局</h4>
                                    <p className="text-gray-300 leading-relaxed font-serif text-sm whitespace-pre-line">${asset.内部结构布局}</p>
                                </div>
                            `}
                        </div>
                    </div>
                `)}
            </div>
        `;
    };

    const App = () => {
        const [data, setData] = useState(null);
        const [activeTab, setActiveTab] = useState('Status');
        const [isLoading, setIsLoading] = useState(true);
        const [showSkillModal, setShowSkillModal] = useState(false);

        const fetchData = useCallback(async () => {
            const newData = await getStatData();
            if (newData) {
                setData(newData);
            }
            setIsLoading(false);
        }, []);

        useEffect(() => {
            fetchData();
            const interval = setInterval(fetchData, 2000);
            return () => clearInterval(interval);
        }, [fetchData]);

        if (isLoading) {
            return html`<div className="flex h-screen items-center justify-center text-accentBlue animate-pulse font-decorative">正在读取魔网数据...</div>`;
        }

        if (!data || !data.主角) {
            return html`<div className="text-center p-10 text-red-400">无法获取 MVU 数据，请确保 SillyTavern 插件正常运行。</div>`;
        }

        const renderContent = () => {
            switch (activeTab) {
                case 'Status': return html`<${StatusView} player=${data.主角} openSkillTree=${() => setShowSkillModal(true)} />`;
                case 'Tasks': return html`<${TaskView} questLog=${data.任务日志} />`;
                case 'World': return html`<${WorldView} relations=${data.关系列表} enemies=${data.敌人列表} />`;
                case 'Map': return html`<${MapView} player=${data.主角} waypoints=${data.地图位标} />`;
                case 'Territory': return html`<${TerritoryView} assets=${data.资产} />`;
                default: return null;
            }
        };

        return html`
            <div className="min-h-screen bg-gradient-to-br from-bgStart to-bgEnd pb-10">
                ${showSkillModal && html`
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
                        <div className="bg-bgStart border-2 border-accentBlue/40 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col shadow-[0_0_30px_rgba(168,192,255,0.2)]">
                            <div className="flex justify-between items-center p-4 border-b border-white/10">
                            <h2 className="font-decorative text-xl text-accentBlue">职业与技能树</h2>
                            <button onClick=${() => setShowSkillModal(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1">
                                <p className="text-gray-400 text-center italic">
                                    在此处可视化技能树节点 (待根据 worldbook 数据实现)<br/>
                                    当前技能点: <span className="text-staminaColor font-bold">${data.主角.技能点}</span>
                                </p>
                                <div className="mt-4 grid grid-cols-1 gap-2">
                                    ${Object.entries(data.主角.技能列表 || {}).map(([name, skill]) => html`
                                        <div key=${name} className="bg-white/5 p-2 rounded flex justify-between">
                                            <span>${name}</span>
                                            <span className="text-accentBlue">${skill.level}</span>
                                        </div>
                                    `)}
                                </div>
                            </div>
                            <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end">
                            <button onClick=${() => setShowSkillModal(false)} className="bg-accentBlue/20 hover:bg-accentBlue/40 text-accentBlue px-4 py-2 rounded">关闭</button>
                            </div>
                        </div>
                    </div>
                `}

                <div className="sticky top-0 z-40 bg-bgStart/90 backdrop-blur-md border-b border-accentBlue/20 shadow-lg">
                    <div className="flex justify-between items-center px-4 py-2">
                        <div className="font-decorative text-accentBlue text-lg hidden sm:block">Goblin Slayer</div>
                        <div className="flex space-x-1 overflow-x-auto no-scrollbar">
                            ${['Status', 'Tasks', 'World', 'Map', 'Territory'].map((tab) => html`
                            <button
                                key=${tab}
                                onClick=${() => setActiveTab(tab)}
                                className=${`px-3 py-2 rounded text-sm font-display tracking-wide transition-all ${
                                activeTab === tab 
                                    ? 'bg-accentBlue text-bgStart font-bold shadow-[0_0_10px_rgba(168,192,255,0.4)]' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                ${tab === 'Status' ? '状态' : 
                                tab === 'Tasks' ? '任务' : 
                                tab === 'World' ? '世界' : 
                                tab === 'Map' ? '地图' : '领地'}
                            </button>
                            `)}
                        </div>
                    </div>
                    <div className="bg-black/40 text-center py-1 text-xs text-gray-400 border-b border-white/5 font-serif">
                        ⏳ ${data.世界?.当前时间 || '未知时间'}
                    </div>
                </div>

                <div className="container mx-auto px-4 py-6 max-w-4xl">
                    ${renderContent()}
                </div>
            </div>
        `;
    };

    // ----------------------------------------------------------------------
    // INITIALIZATION
    // ----------------------------------------------------------------------

    if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(html`<${App} />`);
    } else {
        console.error('Target container #gs-status-root not found in panel.html (If seeing this in Main Window, it is expected)');
    }

})();