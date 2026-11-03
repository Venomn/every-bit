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
    deeper: 'BASIC 是编程语言。这台机器内置的解释器负责读懂命令。此处为教学模拟，支持 PRINT、简单算式、数字变量、带行号的程序、GOTO、RUN、STOP、LIST、NEW，以及本书用到的 SAVE、LOAD。它不运行 VIC-20 ROM，也不模拟 6502 CPU；完整 BASIC 和游戏软件尚不支持。',
    source: ['manual']
  },
  {
    short: '两行代码的魔法', title: '只写两行，\n它就停不下来了。', kicker: '03 / 程序与循环', duration: '5 分钟',
    intro: '直接输入命令，电脑会立刻做。给命令加上行号，它会先把命令记住，等你说 RUN 再一起执行。',
    paragraphs: ['先输入 10 PRINT "HELLO"。再输入 20 GOTO 10。10 和 20 是行号；GOTO 10 的意思是“回到第 10 行”。', '输入 RUN。显示一次 HELLO，回到第 10 行，再显示一次……电脑会一直重复这两步，直到你按下 RUN/STOP。', '试着重新输入 10 PRINT "I CAN CODE"，再 RUN。相同的行号会替换旧内容。用 LIST 能查看已经存进内存的程序。'],
    task: '运行一段带 GOTO 的循环程序，再用 RUN/STOP 把它停下来。',
    takeaway: '程序是存好的指令；循环让机器重复做一件事。',
    deeper: '这段两行程序是本书的练习，并非声称是 Linus 当年输入的原文。教学模式放慢了执行速度，并在 80 步后暂停，方便观察；真实机器不会因为重复了 80 步就自动停下。',
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
    deeper: '这是 1-bit 单色字形编辑器，帮助理解字符图案。它没有写入真实 VIC-20 的字符内存。64 个点需要 64 bit，即 8 byte；这仅计算原始点阵，不包括颜色、尺寸等信息。',
    source: ['manual']
  },
  {
    short: '把程序装进磁带', title: '关机以后，\n它还会记得吗？', kicker: '06 / 内存与保存', duration: '5 分钟',
    intro: '你已经有了一段自己的程序。但如果拔掉电源，刚才记在内存里的东西，会怎么样？',
    paragraphs: ['机器运行时，把程序放在 RAM（内存）里。普通 RAM 需要电力维持内容；关机后，程序就会丢失。', '当年的一种办法，是用专用磁带机把程序录到磁带上。下次开机，再把它读回来。等待磁带转动，也是那个年代使用电脑的一部分。', '试一次完整的旅程：准备程序 → SAVE "HELLO" → 关机 → 开机 → LOAD "HELLO"。然后 LIST 或 RUN，看看老朋友是不是回来了。'],
    task: '把程序存到磁带，关机再开机，然后把它读回内存。',
    takeaway: '内存负责正在做的事；外部存储帮你跨过一次关机。',
    deeper: '这里的虚拟磁带保存到当前浏览器，只保留一份录制的程序；再次保存会替换它。为方便体验，省略了真机磁带的音频编码和漫长读写，也不生成真实磁带镜像。浏览器刷新会恢复阅读状态；只有明确按“关机”才清空模拟电脑的程序内存。',
    source: ['manual']
  }
];
export const eras = [
  {year: '1980s · 初', title: '外祖父的电脑', machine: 'Commodore VIC-20', text: '接上电视，敲下第一行 BASIC。发现命令、循环、比特、像素与磁带。', state: '样章已可体验', now: true},
  {year: '1980s · 后', title: '一台电脑，做几件事', machine: 'Sinclair QL 与更大的世界', text: '跟着 Linus 后来使用过的 QL，探索更丰富的程序、内存，以及“同时运行”背后的轮流工作。'},
  {year: '1991', title: '我也想写一个系统', machine: '386 PC · Linux 的起点', text: '从屏幕、键盘和磁盘出发，发现操作系统怎样管理一台机器。把一次小实验慢慢变成自己的系统。'},
  {year: '1990s', title: '电脑走出房间', machine: '调制解调器 · 互联网 · Web', text: '拨号连接远方，分享程序，再沿着一个超链接探索另一页。分清互联网与万维网。'},
  {year: '2000s → 今天', title: '电脑变得无处不在', machine: '口袋里的电脑与云端', text: '从触摸屏到远处的服务器，追踪一张图片、一条消息走过的路，再回头找到熟悉的每一个 bit。'}
];
