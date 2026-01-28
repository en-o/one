import { useState, useCallback, useMemo } from 'react';
import YearInputModal from '@/components/YearInputModal';
import ScrollViewer from '@/components/ScrollViewer';
import type { YearData } from '@/types';
import { useScrollExport } from '@/hooks/useScrollExport';
import { Sparkles } from 'lucide-react';

// 生成模拟数据（彩蛋功能）- 基于输入年份的人生叙事
const generateDemoData = (startYear: number): YearData[] => {
  const current = new Date().getFullYear();
  const end = current + 3;
  const years: YearData[] = [];
  
  // 人生叙事模板，基于年龄段
  const lifeNarratives: Record<number, string[]> = {
    0: ['呱呱坠地，来到这个世界', '初识人世，满眼好奇', '襁褓之中，被爱包围'],
    1: ['蹒跚学步，探索世界', '牙牙学语，第一声爸妈', '周岁抓周，未来可期'],
    2: ['满地奔跑，无忧无虑', '开始记事，童年伊始', '天真烂漫，世界简单'],
    3: ['幼儿园里，初识伙伴', '第一次离开父母', '学会分享，学会等待'],
    4: ['画画唱歌，才艺初显', '为什么问个不停', '小小人儿，大大梦想'],
    5: ['大班孩子，即将入学', '最后一次幼儿园', '期待又忐忑的小学生'],
    6: ['背上书包，成为学生', '第一次考试，第一次分数', '新朋友，新环境'],
    7: ['适应学校，找到节奏', '开始有自己的小秘密', '喜欢什么，讨厌什么'],
    8: ['三年级了，课业渐重', '第一次自己回家', '有了自己的零花钱'],
    9: ['开始思考，开始质疑', '和朋友的第一次吵架', '学会了道歉和原谅'],
    10: ['小学高年级，觉得自己长大了', '有了暗恋的对象', '开始在意别人的看法'],
    11: ['小升初的压力来临', '和小学朋友告别', '不舍又期待'],
    12: ['升入初中，一切重新开始', '青春期悄悄来了', '身体开始变化'],
    13: ['初一的懵懂和迷茫', '科目变多，压力变大', '第一次住校'],
    14: ['初二的分水岭', '叛逆期开始', '和父母吵架变多'],
    15: ['中考在即，全力以赴', '告别初中同学', '那个夏天永生难忘'],
    16: ['进入高中，高手如云', '第一次感到差距', '暗下决心要努力'],
    17: ['高二文理分科', '选择了自己的路', '有了新的目标'],
    18: ['高三的苦与累', '无数个挑灯夜读', '为了梦想拼搏'],
    19: ['高考结束，如释重负', '成绩出来，几家欢喜几家愁', '填报志愿，选择城市'],
    20: ['进入大学，自由的味道', '第一次独立生活', '认识了来自各地的朋友'],
    21: ['大二了，不再是新生', '开始思考未来方向', '专业课变难'],
    22: ['大三实习，初入职场的体验', '第一次自己赚钱', '社会和学校不一样'],
    23: ['毕业在即，各奔东西', '找工作或考研的决定', '告别校园'],
    24: ['初入职场，战战兢兢', '租房独居，学会照顾自己', '工资不多，但很开心'],
    25: ['工作一年，渐入佳境', '开始存第一笔钱', '思考职业规划'],
    26: ['职场小油条了', '第一次跳槽或升职', '收入开始增加'],
    27: ['工作稳定，生活规律', '开始被催婚', '周末和朋友聚会'],
    28: ['考虑买房或继续租房', '存款有了一些', '但还不够'],
    29: ['三十而立前夕', '回顾过去，展望未来', '不再那么迷茫'],
    30: ['三十而立，新的开始', '或许已婚，或许单身', '但都在认真生活'],
    31: ['工作进入黄金期', '能力得到认可', '责任也更大了'],
    32: ['生活趋于稳定', '开始关注健康', '不再熬夜'],
    33: ['事业上升期', '可能有了小孩', '生活重心转移'],
    34: ['育儿和工作的平衡', '父母开始变老', '责任在肩'],
    35: ['中年危机初现', '但更多的是成熟', '知道自己要什么'],
    36: ['事业小有成就', '家庭和睦', '这是最好的时光'],
    37: ['开始为孩子教育操心', '各种补习班', '希望孩子好'],
    38: ['工作遇到瓶颈或突破', '思考人生意义', '不只是赚钱'],
    39: ['四十不惑前夕', '看淡了很多事', '珍惜眼前人'],
    40: ['四十不惑，内心平静', '不再轻易动摇', '有自己的节奏'],
    41: ['事业稳定期', '更多时间给家人', '周末带孩子出游'],
    42: ['父母健康问题开始显现', '陪伴变得重要', '常回家看看'],
    43: ['孩子进入青春期', '教育变得棘手', '回忆自己的当年'],
    44: ['中年人的日常', '工作家庭两点一线', '但心中有光'],
    45: ['知天命前夕', '回顾前半生', '有遗憾也有骄傲'],
    46: ['身体开始发出信号', '注重养生', '定期体检'],
    47: ['孩子即将高考或大学', '空巢期临近', '有点不舍'],
    48: ['事业进入守成期', '不再追求激进', '稳扎稳打'],
    49: ['五十岁即将到来', '心态更加平和', '接受不完美'],
    50: ['知天命，顺其自然', '不再强求', '活在当下'],
    51: ['孩子独立了，有自己的生活', '和老伴相依为命', '也挺好'],
    52: ['开始考虑退休生活', '培养兴趣爱好', '种花养鱼'],
    53: ['身体小毛病变多', '但心态年轻', '不服老'],
    54: ['工作开始交接', '培养年轻人', '传承经验'],
    55: ['退休倒计时', '规划退休生活', '想去的地方'],
    56: ['正式退休，告别职场', '有点失落，但更多自由', '时间都是自己的'],
    57: ['适应退休生活', '早上不用闹钟', '日子变慢了'],
    58: ['带孙子或外孙', '天伦之乐', '看着下一代成长'],
    59: ['老年生活渐入佳境', '广场舞或太极', '有了自己的圈子'],
    60: ['花甲之年，耳顺之年', '听什么都顺耳', '不再计较'],
    61: ['身体还算硬朗', '每年旅游几次', '看看大好河山'],
    62: ['老友相聚，回忆往事', '那些年轻时光', '仿佛就在昨日'],
    63: ['学会用智能手机', '和孩子们视频', '跟上时代'],
    64: ['身体健康最重要', '每天散步', '饮食清淡'],
    65: ['古稀之年即将到来', '回顾一生', '感恩所有'],
    66: ['老伴是最大财富', '相濡以沫', '携手同行'],
    67: [' grandchildren 长大了', '不再那么需要我', '有点失落'],
    68: ['身体大不如前', '但心态乐观', '活一天赚一天'],
    69: ['七十岁，古稀之年', '人生七十古来稀', '珍惜每一天'],
    70: ['走路变慢了', '但脑子还清楚', '喜欢回忆'],
    71: ['老友一个个离开', '伤感但接受', '这是自然规律'],
    72: ['和疾病共存', '定期去医院', '但不怕'],
    73: ['子女常来看望', '这是最大的安慰', '他们很孝顺'],
    74: ['生活简单规律', '早起早睡', '晒太阳'],
    75: ['杖国之年，可以拄杖出国', '但更喜欢在家', '熟悉的环境'],
    76: ['记忆力衰退', '但还记得重要的事', '爱的人'],
    77: ['需要人照顾了', '不想麻烦子女', '请护工'],
    78: ['回望一生', '有苦有甜', '但值得'],
    79: ['耄耋之年即将到来', '能活到这个年纪', '是福气'],
    80: ['耄耋之年，四世同堂', '看着重孙', '生命延续'],
    81: ['每天就是吃饭睡觉', '简单的幸福', '不再奢求'],
    82: ['和老伴说说话', '回忆年轻时光', '那些故事'],
    83: ['身体各种毛病', '但还活着', '就是胜利'],
    84: ['等待，但不焦虑', '顺其自然', '该来的会来'],
    85: ['杖朝之年，可以拄杖上朝', '虽然已经没有朝了', '但精神还在'],
    86: ['睡得多，醒得少', '但醒着的时候', '都很清醒'],
    87: ['子女孙辈围绕', '这是最大的幸福', '不孤单'],
    88: ['米寿之年，八十八', '中国人的智慧', '数字的吉祥'],
    89: ['每一天都是礼物', '感恩活着', '感恩被爱'],
    90: ['鲐背之年，背有鲐文', '长寿的象征', '活到老学到老'],
    91: ['几乎不出门了', '但心里有全世界', '回忆就是旅行'],
    92: ['等待那个时刻', '但不害怕', '这一生值了'],
    93: ['看着这个世界变化', '从年轻到年老', '见证历史'],
    94: ['还有人记得我', '还有人爱我', '这就够了'],
    95: ['期颐之年，百年可期', '真正的长寿', '稀有而珍贵'],
    96: ['每一天都是奇迹', '活着就是胜利', '微笑面对'],
    97: ['百岁了，世纪老人', '经历了太多', '故事讲不完'],
    98: ['生命的最后时光', '平静接受', '等待重逢'],
    99: ['这一生，值了', '爱过，被爱过', '无憾'],
  };
  
  for (let y = startYear; y <= end; y++) {
    const age = y - startYear;
    const isFuture = y > current;
    
    let text = '';
    if (!isFuture) {
      const narratives = lifeNarratives[age] || ['这一年，平凡而珍贵', '继续向前走', '生活还在继续'];
      // 根据年份选择不同的叙事
      const narrativeIndex = (y - startYear) % narratives.length;
      text = narratives[narrativeIndex];
    }
    
    years.push({
      year: y,
      text,
      isFuture,
    });
  }
  
  return years;
};

// 根据出生年份生成数据（空模板）
const generateLifeData = (birthYear: number): YearData[] => {
  const current = new Date().getFullYear();
  const end = current + 3;
  const years: YearData[] = [];
  
  for (let y = birthYear; y <= end; y++) {
    const isFuture = y > current;
    
    years.push({
      year: y,
      text: '',
      isFuture,
    });
  }
  
  return years;
};

function App() {
  const [showModal, setShowModal] = useState(true);
  const [years, setYears] = useState<YearData[]>([]);
  const { exportToPNG } = useScrollExport();
  
  const handleSubmit = useCallback((year: number) => {
    if (year === 1) {
      // 彩蛋：生成模拟数据（使用1995作为示例起点）
      setYears(generateDemoData(1995));
    } else {
      // 正常生成（空白模板）
      setYears(generateLifeData(year));
    }
    setShowModal(false);
  }, []);
  
  const handleReset = useCallback(() => {
    setYears([]);
    setShowModal(true);
  }, []);
  
  const handleExport = useCallback(async () => {
    if (years.length === 0) return;
    await exportToPNG(years);
  }, [years, exportToPNG]);
  
  // 更新某一年份的内容
  const handleUpdateYear = useCallback((year: number, text: string) => {
    setYears(prev => prev.map(y => 
      y.year === year ? { ...y, text } : y
    ));
  }, []);
  
  // 欢迎界面
  const WelcomeScreen = useMemo(() => (
    <div className="min-h-screen flex flex-col items-center justify-center paper-texture">
      <div className="text-center space-y-8 p-8">
        {/* 印章 */}
        <div className="flex justify-center">
          <div className="seal text-lg">一生</div>
        </div>
        
        {/* 标题 */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-medium brush-text text-[var(--ink)]">
            人生长卷
          </h1>
          <p className="text-lg text-[var(--light-ink)] tracking-widest">
            绘制你的人生画卷
          </p>
        </div>
        
        {/* 开始按钮 */}
        <button
          onClick={() => setShowModal(true)}
          className="group relative px-8 py-4 bg-[var(--ink)] text-[var(--paper)] rounded-full
                   hover:bg-[var(--light-ink)] transition-all shadow-lg hover:shadow-xl
                   hover:-translate-y-1 flex items-center gap-3 mx-auto"
        >
          <Sparkles size={18} className="group-hover:animate-pulse" />
          <span className="tracking-wide">开始绘制</span>
        </button>
        
        {/* 说明 */}
        <p className="text-sm text-[var(--light-ink)] opacity-60 max-w-md mx-auto leading-relaxed">
          输入你的出生年份，生成一幅属于你的"人生长卷"。
          <br />
          每一年都是一座独特的山峰，点击可编辑记录你的人生故事。
        </p>
      </div>
      
      {/* 装饰元素 */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[var(--light-ink)] opacity-40">
        <div className="w-16 h-px bg-current" />
        <span className="text-xs tracking-widest">卷</span>
        <div className="w-16 h-px bg-current" />
      </div>
    </div>
  ), []);
  
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* 输入模态框 */}
      <YearInputModal
        isOpen={showModal}
        onSubmit={handleSubmit}
        onClose={years.length > 0 ? () => setShowModal(false) : undefined}
      />
      
      {/* 主内容 */}
      {years.length === 0 ? (
        WelcomeScreen
      ) : (
        <ScrollViewer
          years={years}
          onReset={handleReset}
          onExport={handleExport}
          onUpdateYear={handleUpdateYear}
        />
      )}
    </div>
  );
}

export default App;
