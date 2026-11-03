# Every Bit · 可以玩的计算机小史

给约 8–12 岁孩子和陪伴阅读的大人的浏览器互动书。以 Linus 童年接触的 Commodore VIC-20 为第一站，沿着机器与使用方式的变化推进叙事。

当前交付是**第一章互动样章**，不是完成的整本书。封面、六个可操作的小节、探索手记、全书写作路线已经实现；QL、386/Linux、联网和现代计算机章节仍为写作规划。

[在线阅读](https://venomn.github.io/every-bit/) · [公有源码仓库](https://github.com/Venomn/every-bit)

## 本地运行

无需安装依赖或构建。Node.js 用于测试；Python 仅用于本地 HTTP 服务。

```sh
npm test
npm run dev
```

打开 `http://127.0.0.1:4173`。网站静态资源全部位于 `dist/`，运行不依赖外部字体、CDN、账户或在线模型。历史资料链接会打开外部网站。

运行 `npm run build:standalone` 会生成仓库根目录的 `index.html`。该文件包含全部运行所需的代码和样式，可下载后在浏览器打开。`npm test` 同时核对这个生成文件与模块源码是否一致。

## 六个小节

1. 坐到电脑前：开机、READY、键盘主机与电视。
2. 让它说声你好：直接输入 PRINT，尝试文字与算式。
3. 两行代码的魔法：行号、LIST、RUN、GOTO、停止与修改。
4. 拆开一个字节：8 个开关、位权、PETSCII 的大写字母。
5. 画一个像素朋友：单色 8×8 图案，逐行查看二进制和字节值。
6. 把程序装进磁带：SAVE → 关机丢失 RAM → 开机 → LOAD。

## 教学与史实边界

- 书桌、电视和键盘是原创 CSS 情境插画；不声称复原 Linus 家里的具体布置。
- 根据本人不同时期访谈，使用“1980 年代初”，避免把回忆中的约 10–12 岁写成确定日期。
- BASIC 是安全的有限子集解释器，不使用 `eval`，不加载 ROM，不模拟 6502、VIC 芯片、真实磁带格式或完整 PETSCII。完整 BASIC（FOR/NEXT、IF、POKE、屏幕编辑等）暂不支持。
- 支持 PRINT 字符串 / 算式 / CHR$(32–90)、数字变量、四则运算、行号、GOTO、END/STOP、LIST、RUN、NEW、虚拟 SAVE/LOAD。
- 运行按 180 ms 一步放慢，80 步后自动暂停；离开小节、进入后台和关机也会停止。运行中不允许编辑程序。
- 启动画面的 3583 BYTES FREE 是真机启动文字的教学再现，不是浏览器解释器实时可用内存。教学解释器限制为 100 行、每行 80 字符。
- 8×8 编辑器表示 1-bit 单色图案，不写入模拟主机内存。PETSCII 字符码与屏幕码明确区分。
- 手记、草稿程序、画布、虚拟磁带、关机后的练习状态和字号保存在版本化的浏览器 localStorage；无跨设备同步。刷新恢复阅读状态，明确关机才清空模拟程序。存储不可用时在手记中提示。

## 资料

- [Linus 本人访谈，Computing，2012](https://www.computing.co.uk/interview/2230892/linus-torvalds-interview-from-vic20-to-raspberry-pi)：外祖父、VIC-20、输入和修改程序。
- [Linus 本人访谈，Linux Journal，1999](https://www.linuxjournal.com/article/3655)：童年回忆与学习过程。
- [Commodore VIC-20 原版用户手册](https://museo.inf.uva.es/img/Computadores/VIC-20/Mas/ManualUsuario.pdf)：硬件外形、开机、BASIC、字符、存储。
- [VIC-20 Programmer's Reference Manual，字符表](https://www.manualslib.com/manual/950679/Commodore-Vic-20.html?page=290)：字符编码与屏幕码。
- [Glyn Moody 对 Linus 的访谈，Ars Technica](https://arstechnica.com/information-technology/2015/08/how-linux-was-born-as-told-by-linus-torvalds-himself/)：QL → 386 PC → Linux 的叙事路线。
- [CERN：万维网的诞生](https://home.cern/science/computing/the-birth-of-the-web)：后续网络章节依据。

## 验证

`tests/engine.test.mjs` 验证所有 256 个字节的往返、像素行编码、运算优先级、非法语法、行号覆盖与删除、循环与停止、运行错误、资源上限、损坏/旧版本持久化数据和磁带副本隔离。

浏览器验收覆盖真实输入/Enter、语法错误恢复、循环/停止、位开关（含 Space 键）、画布与逐行编码、SAVE → 关机 → 空 LIST → LOAD → 恢复 LIST、刷新恢复，以及 390/768/1024/1440 像素宽度。实际儿童试读、iOS Safari 与 Android 真机仍待验证。

## 部署

GitHub Pages 从 `main` 分支根目录发布 `index.html`。修改 `dist/` 后先运行 `npm run build:standalone` 与 `npm test`，把源码和生成文件一起提交。仓库不需要访问令牌、服务端、数据库或构建依赖。
