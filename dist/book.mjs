export const sources = {
  linus: {label: 'Linus 本人访谈 · Computing，2012', url: 'https://www.computing.co.uk/interview/2230892/linus-torvalds-interview-from-vic20-to-raspberry-pi'},
  childhood: {label: 'Linus 本人访谈 · Linux Journal，1999', url: 'https://www.linuxjournal.com/article/3655'},
  manual: {label: 'Commodore VIC-20 原版用户手册', url: 'https://museo.inf.uva.es/img/Computadores/VIC-20/Mas/ManualUsuario.pdf'},
  later: {label: 'Linus 本人回忆 QL 与 386 · Ars Technica', url: 'https://arstechnica.com/information-technology/2015/08/how-linux-was-born-as-told-by-linus-torvalds-himself/'},
  web: {label: '万维网的诞生 · CERN', url: 'https://home.cern/science/computing/the-birth-of-the-web'}
};
export const lessons = [
  {
    short: '坐到电脑前', title: '电脑藏在键盘里。', kicker: '01 / 第一次见面', duration: '3 分钟',
    intro: '时间来到 1980 年代初。芬兰，赫尔辛基。年少的 Linus 接触到外祖父的一台家用电脑：Commodore VIC-20。',
    paragraphs: ['仔细看，它没有今天的笔记本屏幕。米色的壳子里装着键盘，也装着电脑的主要电路。接上家里的电视，电视就成了它的屏幕。', 'Linus 的外祖父是一位统计学教授，会把 BASIC 程序写在纸上，再让他帮忙输入。Linus 后来回忆，自己也读说明书、输入示例，慢慢试着改动它们。', '现在，把椅子拉近一点。开机后，你会看见 READY.——“准备好了”。闪烁的小方块在等着你的第一句话。'],
    task: '按下电脑旁的开机键，找到屏幕上的 READY.',
    takeaway: '键盘下面也是电脑；电视负责把结果显示出来。',
    deeper: '这张书桌是根据当年的机器设计制作的情境插画，并非 Linus 家中房间的史实复原。关于接触电脑的年龄，他在不同时期的访谈中有约 10–12 岁的回忆，所以这里使用“1980 年代初”。',
    source: ['linus','childhood','manual']
  },
  {
    short: '让它说声你好', title: '你的第一句话，\n它听懂了。', kicker: '02 / 第一个指令', duration: '4 分钟',
    intro: '屏幕上没有图标。要让这台电脑做事，你可以直接告诉它该做什么。它认识一种叫 BASIC 的语言。',
    paragraphs: ['试着输入 PRINT "HELLO"，再按 RETURN（今天键盘上的 Enter）。PRINT 在这里表示“显示”，引号把你想说的话包起来。', 'HELLO 出现了！试着把它换成自己的英文名字。再试 PRINT 2+3：没有引号时，电脑会先计算，再显示结果。', '少打一个引号可能得到 SYNTAX ERROR。这只是说“我没看懂这句话的写法”。改好，再试一次就行。'],
    task: '输入一条 PRINT 命令，让屏幕显示文字或算式的结果。',
    takeaway: '你给出清楚的指令，电脑就照着执行。报错也是一种线索。',
    deeper: 'BASIC 是编程语言。这台机器内置的解释器负责读懂命令。这里实际运行 VIC-20 原版 BASIC / KERNAL ROM，并模拟 6502 CPU、VIA 与 VIC 芯片。你可以写完整的 BASIC V2 程序、操作内存、画图和发声。程序可以从空白写起；下面的灵感卡只是起点。',
    source: ['manual']
  },
  {
    short: '两行代码的魔法', title: '只写两行，\n它就停不下来了。', kicker: '03 / 程序与循环', duration: '5 分钟',
    intro: '直接输入命令，电脑会立刻做。给命令加上行号，它会先把命令记住，等你说 RUN 再一起执行。',
    paragraphs: ['先输入 10 PRINT "HELLO"。再输入 20 GOTO 10。10 和 20 是行号；GOTO 10 的意思是“回到第 10 行”。', '输入 RUN。显示一次 HELLO，回到第 10 行，再显示一次……电脑会一直重复这两步，直到你按下 RUN/STOP。', '试着重新输入 10 PRINT "I CAN CODE"，再 RUN。相同的行号会替换旧内容。用 LIST 能查看已经存进内存的程序。'],
    task: '运行一段带 GOTO 的循环程序，再用 RUN/STOP 把它停下来。',
    takeaway: '程序是存好的指令；循环让机器重复做一件事。',
    deeper: '这段两行程序是本书的练习，并非声称是 Linus 当年输入的原文。电脑按模拟的原机速度运行，没有 80 步限制。RUN/STOP 对应真机停止键；“暂停”则把模拟时间冻结，按“继续”能原地恢复。',
    source: ['linus','manual']
  },
  {
    short: '拆开一个字节', title: '一个 A 的背后，\n有八个小开关。', kicker: '04 / EVERY BIT', duration: '5 分钟',
    intro: '屏幕上的字母很好认，电路却不会像我们一样读字母。人们先给字符编上号码，再用 0 和 1 表示这些号码。',
    paragraphs: ['一个 bit（比特）只有两种状态：0 或 1。把八个 bit 排在一起，就得到一个 byte（字节）。', '下面的每个开关都有自己的分量。最右边是 1，往左依次是 2、4、8……把亮着的分量加起来，就是这个字节表示的无符号整数。', '在 VIC-20 使用的 PETSCII 编码中，大写 A 的号码是 65。试着打开 64 和 1 两个开关，你就亲手拼出了它。'],
    task: '拨动八个开关，让总数变成 65，找到字母 A。',
    takeaway: '8 个 bit 能组成 256 种状态；同一组 bit 的含义取决于怎样解释。',
    deeper: '这里演示 PETSCII 的大写英文字母范围（65–90）。字符编码、屏幕内存里的屏幕码、字符的像素图案并不是同一件事；例如字母 A 的 PETSCII 码是 65，VIC-20 的大写字符集屏幕码则是 1。中文和表情常需要多个字节，我们会在后面的时代继续探索。',
    source: ['manual']
  },
  {
    short: '画一个像素朋友', title: '小小的方格，\n装得下你的想象。', kicker: '05 / 从数字到图像', duration: '5 分钟',
    intro: '靠近旧电视看一看：那些字母和图案也可以拆成一个个小点。VIC-20 常见的一个字符图案，就是 8 × 8 个点。',
    paragraphs: ['在这张放大的画布里，一个点只用一个 bit：1 表示点亮，0 表示熄灭。每一排八个点，刚好是一个字节。', '点一点方格，画一张笑脸、一艘飞船，或者一个只有你认识的朋友。右边的数字会跟着变化：它们就是这幅黑白图案的另一种写法。', '八排就是八个字节。把这些字节按照同样的规则读回来，图案就能再次出现。颜色、动画和更大的图片，需要更多约定和空间。'],
    task: '点亮至少 8 个格子，再选中一行，观察它的 0 和 1。',
    takeaway: '图像可以变成数字；每次改动一个点，也就在改变一个 bit。',
    deeper: '这是 1-bit 单色字形编辑器，帮助理解字符图案。点“让老电脑画出来”，会把 8 个字节变成可编辑的 BASIC 程序；送入电脑后，用 POKE 写入真正模拟的字符内存。64 个点需要 64 bit，即 8 byte；这仅计算原始点阵，不包括颜色、尺寸等信息。',
    source: ['manual']
  },
  {
    short: '把程序保存下来', title: '关机以后，\n它还会记得吗？', kicker: '06 / 内存与保存', duration: '5 分钟',
    intro: '你已经有了一段自己的程序。但如果拔掉电源，刚才记在内存里的东西，会怎么样？',
    paragraphs: ['机器运行时，把程序放在 RAM（内存）里。普通 RAM 需要电力维持内容；关机后，程序就会丢失。', '当年的一种办法，是用专用磁带机把程序录到磁带上。下次开机，再把它读回来。等待磁带转动，也是那个年代使用电脑的一部分。', '试一次完整的旅程：写好并运行程序 → 存下电脑里的程序 → 关机 → 在作品盒里打开它 → RUN。看看老朋友是不是回来了。'],
    task: '把电脑里的程序存进作品盒，关机，再打开它并 RUN。',
    takeaway: '内存负责正在做的事；外部存储帮你跨过一次关机。',
    deeper: '当年可以把程序录在磁带上。这里的作品盒是现代保存工具，读写真实 BASIC PRG 文件，没有连接磁带机，不模拟磁带声音与等待。作品保存在当前浏览器，也能下载为 .prg 或 .bas。刷新会恢复程序与草稿，但不会恢复正在运行时的变量、按键或游戏位置。',
    source: ['manual']
  }
];

// The first six IDs stay stable so the published sample's bookmarks still work.
const more = [
  ['schedule',1,'一颗 CPU，两件事','看起来同时，\n其实轮流。','Linus 后来用上了 Sinclair QL。我们也离开单一的提示符，打开两个小窗口。','拨动时钟，让两个任务都前进至少 6 格。再试试暂停其中一个。','快速轮流执行，让一颗 CPU 也能照顾多个任务。','这个调度器每拍最多执行一个任务的一步。真实 QDOS 的调度更复杂；现代多核还可以真正并行。这里不是 QL 仿真器。',['later','ql','qlmanual']],
  ['memory',1,'给每个字节一个门牌','你的 A，\n住在哪一格？','程序变大了。电脑需要地址，才能找回某个字节。','选地址 9，写入 65，再读出来。也可以到别的地址转一圈。','地址告诉电脑去哪里；那里的字节告诉电脑读到了什么。','此处只有 16 个字节，4 个地址位就能选中一格。真实 QL 有 128 KB RAM。地址宽度与每格的数据宽度是不同的概念。',['ql','qlmanual']],
  ['branch',1,'教小机器人绕路','有石头，\n就换个走法。','长长的程序里，不是每一步都要执行。有时要先问一个问题。','先让机器人走到石头前，再装上“有石头就跳”的规则，走到旗子旁。','条件决定下一步；程序可以根据眼前的情况走不同的路。','这是本书原创的条件分支游戏，不是 Linus 当年的游戏。BASIC、汇编等语言都能表达条件，但写法和机器指令不同。',['manual']],
  ['color',1,'给像素添点颜色','多一个 bit，\n多几种颜色？','黑白朋友想换衣服。原来的一个开关，只够选两种颜色。','切到 2 bit，选橙色和绿色，各涂一个格子。再切回 1 bit 看看。','每增加一个 bit，可表示的状态数翻倍。','这是 4 色索引图像模型，并非 QL 显存格式。切到 1 bit 时只显示每个索引的最低位；保留原画，方便对比。真实 QL 有不同分辨率和颜色模式。',['ql','qlmanual']],
  ['cpu',2,'把机器放慢','一条指令，\n分三步看。','1991 年，Linus 换上了 386 PC，并开始探索怎样自己控制机器。先把 CPU 放慢。','反复拨动时钟，看它取指、译码、执行，最后输出 5。','CPU 从内存取出指令，解释它，再改变机器的状态。','LOAD 2、ADD 3、OUT、HALT 是本书虚构的教学指令，不是 x86 汇编。现代处理器还有流水线、缓存等机制。这里的一拍不是实际 CPU 时钟周期。',['later']],
  ['drivers',2,'让硬件听懂','谁来翻译\n键盘和磁盘？','Linus 的小实验逐渐需要键盘、屏幕和磁盘。操作系统与驱动，让程序能使用这些设备。','接通键盘驱动，送来 A；接通磁盘驱动，把 A 保存下来。','驱动连接系统与设备；程序可以通过系统请求硬件服务。','教学连线图省略了中断、缓冲区和权限。Linux 是内核；日常所说的 Linux 系统还包括命令行工具、图形桌面和其他软件。',['later','kernel']],
  ['files',2,'在磁盘里散步','文件，也有\n自己的住址。','程序、故事、图片越来越多。文件夹让磁盘不再像一堆没有标签的磁带。','进入 notes，写一个 dream.txt，再用 cat 读出来。按钮可以帮你填命令。','路径把名字连起来，让电脑找到文件。','这是隔离的玩具文件系统，只保存在本书的浏览器状态中。命令不会操作你的真实磁盘。可用 ls、pwd、cd、mkdir、write、cat；write 是教学命令，不是 Unix 标准命令。',['posix']],
  ['patch',2,'把一个修正传下去','我修好了，\n你也试试。','1991 年，Linus 把正在做的系统告诉了网上的其他人。可以读、改、分享的源码，让更多人参与进来。','把减号改成加号，跑过测试，再把修正送到朋友的副本。','源码能让人理解和改进软件；测试帮我们发现改错的地方。','这里没有真的发布或联系任何人。例子是原创的加法程序；分享和使用真实软件需要遵守其许可证。Linux 的许可历史不等于所有软件都可以随意复制。',['later','kernel']],
  ['modem',3,'让比特穿过电话线','看不见的 bit，\n变成起伏的信号。','1990 年代，许多家庭通过调制解调器拨号上网。电脑把数据转换成适合线路的信号。','用两种速度各发送一次。也可以翻转一个 bit，看看另一端收到什么。','相同数量的数据，传输速率越高，所需时间越短。','波形只示意用两种频率表示 0/1，不发出声音，也不仿真某种商用调制解调器。1 和 4 bit/秒是方便观察的虚构慢速；忽略线路开销。',['modem']],
  ['packets',3,'把消息拆成小包','先到的，\n不一定排在前面。','网络上有许多条路。我们把一句话拆开，给每个小包写上编号。','乱序送达四个包。试着丢掉一个再补送，也可以重复送。','接收方需要发现缺失、去掉重复，再按顺序还原数据。','本页借用可靠传输的思想。真实 TCP 面向字节流，按字节编号，并不是这里的四张词语卡；IP 本身不保证可靠、按序到达。',['tcp']],
  ['dns',3,'先问地址再出发','名字好记，\n地址好找。','网络早于万维网。1987 年的 DNS 规范，描述了把名字与信息联系起来的系统。','查询 book.test 并访问；让服务器搬家，清除旧缓存，再查询并访问。','名字和地址可以分开；缓存省时间，也可能暂时过时。','使用 .test 保留域名和文档专用 IP，不发出真实请求。DNS 不只存 IP；本例省略层级查询、TTL 计时、多地址等机制。',['dns']],
  ['web',3,'自己的第一张网页','一条链接，\n推开另一扇门。','1989 年，Tim Berners-Lee 在 CERN 提出万维网。网页和超链接，给已有的互联网带来新的浏览方式。','写一个标题，请求首页，然后点击页面里的月球链接。也试试不存在的地址。','浏览器请求页面、解释 HTML；超链接可以引导下一次请求。','这里展示安全的固定 HTML 模板，不执行用户脚本、不访问远端。互联网是网络基础设施；Web 是建立在其上的应用之一。1993 年 CERN 将 Web 软件放入公有领域。',['web']],
  ['touch',4,'电脑装进口袋','手指，也能\n发号施令。','2007 年推出的 iPhone 是触摸手机的重要节点之一。电脑的入口，从键盘扩展到手指。','点遍四个应用的区域，观察每次触点的坐标。','触摸位置变成坐标；程序再决定这个位置意味着什么。','这是 4×4 离散触摸区域模型，按钮也可用键盘操作。真实触摸屏采样更精细，常支持多个触点；智能手机的历史早于 iPhone。',['phone']],
  ['unicode',4,'让世界的文字相遇','A、你、🌱，\n各占几个字节？','互联网连接不同语言的人。早期机器的字符表装不下所有文字；Unicode 与 UTF-8 提供了更广的约定。','依次试 A、你、🌱，再点一个字节，拆开它的 8 个 bit。','同样是一个符号，UTF-8 可能需要不同数量的字节。','一个 Unicode 码点的 UTF-8 编码占 1–4 字节；人眼看到的一个字形可能由多个码点组成，例如组合重音和家庭表情。此处直接使用浏览器 TextEncoder。',['unicode']],
  ['cloud',4,'云端在什么地方','两台设备，\n同一份星星？','“云”仍然需要远处的计算机和网络。断网时，两台设备可能各自留下一份不同的修改。','离线修改 A 和 B；联网后依次同步 A、B。处理冲突，让三处内容相同。','同步需要传送数据，也需要决定不同版本怎样相处。','两台设备和服务器都只是本页内的模型，实际没有联网或跨设备同步。这里用版本号检测冲突，再由你选一份；真实服务可用不同策略，并非都会这样询问。',['cloud']],
  ['learn',4,'让机器从例子里猜','这次，\n先给它一些例子。','走到今天，有些程序从标注好的例子中寻找规律，而不是由人写出每一种情况。','给圆果和长果各贴几个标签，再让机器猜一个新形状。故意贴错一个，结果会怎样？','机器的猜测受训练例子与方法影响；它也会猜错。','这是只有一个形状特征的 1-近邻分类器，不是大型语言模型。它选择形状数值距离最近的标注，距离相同则选较小数值；不理解水果，也不代表所有 AI 的工作方式。',['ml']],
  ['message',4,'再说一次你好','穿过整本书，\n把你好送到另一端。','还记得旧电视上的 HELLO 吗？现在，你已经能一路追踪它背后的 bit。','写一句话 → 编码 → 发包 → 让所有包到达 → 保存 → 打开。','输入、编码、计算、网络、存储与显示，接起了一条消息的旅程。','消息只在本页模拟的两端之间移动，不会发给真实的人。每包最多 3 字节，故意允许一个 UTF-8 字符跨包；必须先完整重组，再解码。没有模拟加密、路由或完整协议。',['unicode','tcp']]
];
for(const [lab,chapter,short,title,intro,task,takeaway,deeper,source] of more) lessons.push({lab,chapter,short,title,intro,task,takeaway,deeper,source,duration:'3–6 分钟',paragraphs:[],kicker:''});
lessons.slice(0,6).forEach(l=>l.chapter=0);
export const eras = [
  {year:'1980s · 初',title:'外祖父的电脑',machine:'Commodore VIC-20',start:0,end:6,icon:'▤',text:'开机、敲命令、拆开字节。把第一段程序保存下来。'},
  {year:'1980s · 后',title:'一台电脑，做几件事',machine:'Sinclair QL 的时代',start:6,end:10,icon:'▥',text:'让任务轮流跑，寻找内存地址，教机器人绕路，给像素添颜色。'},
  {year:'1991',title:'我也想写一个系统',machine:'386 PC · Linux 的起点',start:10,end:14,icon:'▣',text:'拨动 CPU 时钟，接通驱动，在文件夹里散步，分享一个修正。'},
  {year:'1990s',title:'电脑走出房间',machine:'调制解调器 · 互联网 · Web',start:14,end:18,icon:'⌁',text:'比特变成信号。小包穿过网络，超链接打开新页面。'},
  {year:'2000s → 今天',title:'电脑变得无处不在',machine:'口袋里的电脑与云端',start:18,end:23,icon:'▯',text:'用手指点，用不同语言说话，解决同步冲突，教机器猜一猜。'}
];
Object.assign(sources,{
 ql:{label:'Sinclair QL 馆藏 · 计算机历史博物馆',url:'https://www.computerhistory.org/revolution/personal-computers/17/298/1180'},
 kernel:{label:'Linux 内核档案',url:'https://www.kernel.org/'},
 posix:{label:'文件与目录命令 · GNU Coreutils',url:'https://www.gnu.org/software/coreutils/manual/html_node/Directory-listing.html'},
 qlmanual:{label:'Sinclair QL 原版手册 · Concepts',url:'https://www.sinclairql.net/djw/docs/ebooks/olqlug/QL%20Manual%20-%20Concepts.htm'},
 modem:{label:'微型计算机数据通信资料（1982）· 博物馆档案',url:'https://archive.computerhistory.org/resources/access/text/2019/12/102796715-05-01-acc.pdf'},
 tcp:{label:'TCP 可靠传输规范 · RFC 9293',url:'https://www.rfc-editor.org/rfc/rfc9293'},
 dns:{label:'DNS 概念与设施 · RFC 1034（1987）',url:'https://www.rfc-editor.org/rfc/rfc1034'},
 phone:{label:'iPhone 发布资料 · Apple（2007）',url:'https://www.apple.com/newsroom/2007/01/09Apple-Reinvents-the-Phone-with-iPhone/'},
 unicode:{label:'UTF 编码问答 · Unicode 联盟',url:'https://www.unicode.org/faq/utf_bom.html'},
 cloud:{label:'云计算的定义 · NIST（2011）',url:'https://www.nist.gov/publications/nist-definition-cloud-computing'},
 ml:{label:'近邻分类的工作方式 · scikit-learn',url:'https://scikit-learn.org/stable/modules/neighbors.html'}
});
