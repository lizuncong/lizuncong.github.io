## ZIP文件 
zip文件使用.zip或者.zipx后缀。以.jar、.war、.docx、.xlsx、.pptx、.odt、.ods、.odp等作为后缀的文件都是使用zip格式的，遵循zip文件协议规范。


- 观察得知：zip格式协议相关的字段均以小端字节序存储，而文件内容却以大端字节序存储。
- 只需包含三个基础也可以组成标准zip文件：本地文件头+中央目录头+中央目录记录结尾。
- data descriptor。用于标识该文件压缩结束。该结构只有在相应的header中通用标记字段的第3位设为1时才会出现，紧接在压缩文件源数据后。

### zip文件结构详解
zip格式压缩包主要由三大部分组成：数据区、中央目录记录区（也有叫核心目录记录）、中央目录记录尾部区

#### 数据区
数据区是由一系列本地文件记录组成，本地文件记录主要是记录了压缩前后文件的元数据以及存放压缩后的文件，组成部分也分为三大部分：本地文件头、文件数据、文件描述

#### 中央目录记录区（也称核心目录记录区 ）
中央目录记录区是有一系列中央目录记录所组成，一条中央目录记录对应数据区中的一个压缩文件记录，中央目录记录由以下部分构成： 1）0~3：4个字节，记录核心目录文件头标识：0x02014b50，用于解压时候，查找判断是否是中央目录的开始位置 2）4~5：2个字节，记录压缩所用的版本，同数据区本地文件头的解压所需版本，apk设置20 3）6~7：2个字节，记录解压所需的最小版本，同数据区本地文件头的解压所需版本，apk设置20 4) 8~9：2个字节，通用位标记，同数据区本地文件头的通用位标记 5）压缩方法、文件最后修改时间、文件最后修改日期、CRC-32校验码、压缩后大小、未压缩大小、文件名长度、扩展区长度，这几个字段的含义都等同于数据区本地文件头对应字段的含义 6）32~33：2个字节，记录文件注释的长度 7）34~35：2个字节，记录文件开始位置的磁盘编号，一般传0即可 8）内部文件属性、外部文件属性，一般也是传0即可 9）42~45：4个字节，记录数据区本地文件头相对于压缩包开始位置的偏移量

## 待整理
 ZIP格式的数据是按小端模式编排的，所以需要手动对ByteBuffer中的数据进行小端排序，那么，什么是小端模式，什么是大端模式呢？


- [https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT](https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT)


```js
// 均要以小端字节序排列

/**
 * ZIP文件格式
 * 
 * n * 文件描述块 + 存档解密头 + 存档额外数据记录 + n * 中央目录头 + 中央目录记录的zip64结尾 + 中央目录定位符的zip64结尾 + 中央目录记录的结尾
 * 
 * 
 * [local file header 1]                        [本地文件头1]
 * [encryption header 1]                        [加密头1]           根据有无加密存在
 * [file data 1]                                [文件数据1]         此四部分统称为文件描述块
 * [data descriptor 1]                          [数据描述符1]       根据通用标志位bit3确定是否存在
 * .
 * .
 * .
 * [local file header n]                        [本地文件头n]
 * [encryption header n]                        [加密头n]
 * [file data n]                                [文件数据n]
 * [data descriptor n]                          [数据描述符n]
 * 
 * [archive decryption header]                  [存档解密头]
 * [archive extra data record]                  [存档额外数据记录]
 * 
 * [central directory header 1]                 [中央目录头1]
 * .
 * .
 * .
 * [central directory header n]                 [中央目录头n]
 * 
 * [zip64 end of central directory record]      [中央目录记录的zip64结尾] 
 * [zip64 end of central directory locator]     [中央目录定位符的zip64结尾]
 * [end of central directory record]            [中央目录记录的结尾]
 * 
 * 
 * 一个本地文件头对应一个中央目录头
 */

/**
 * 本地文件头组成
 * 
 * local file header signature     4 bytes      本地文件头标识符 (0x04034b50(大端)) 
 * version needed to extract       2 bytes      提取需要的版本
 * general purpose bit flag        2 bytes      通用位标志
 * compression method              2 bytes      压缩方法
 * last mod file time              2 bytes      最后修改文件时间 时分秒
 * last mod file date              2 bytes      最后修改文件日期 年月日
 * crc-32                          4 bytes      crc-32(对压缩前的文件计算)
 * compressed size                 4 bytes      压缩大小
 * uncompressed size               4 bytes      未压缩大小
 * file name length                2 bytes      文件名长度
 * extra field length              2 bytes      额外字段长度
 * file name                 (variable size)    文件名
 * extra field               (variable size)    额外字段
 */

/**
 * 通用标志位说明
 * 
 * bit 0: 设为1时表示采用了压缩算法
 * 如果压缩方法是 6
 * bit 1: 0 -> 4k滑动字典; 1 -> 8k滑动字典
 * bit 2: 0 -> 2个香农-法诺树加密滑动字典; 1 -> 3个香农-法诺树加密滑动字典
 * 
 * 如果压缩方法为 8 和 9
 * bit 2   bit 1
 *   0       0      使用了正常压缩选项。 -en
 *   0       1      使用了最大压缩选项 (-exx/-ex)
 *   1       0      使用了快速压缩选项。(-ef)
 *   1       1      使用了超快速压缩选项。(-es)
 * 
 * 压缩方法为 14
 * bit 1: 0 -> 不存在EOS标记并且必须知道压缩数据大小才能提取; 1 -> 使用EOS标记压缩数据流的结束
 * 
 * 如果为其他压缩方法
 *  b1 b2不会被用到
 * 
 * 下面不论压缩方法, 均通用
 * bit 3: 0 -> 无用; 1 -> CRC32、压缩大小、压缩前大小在本地标头中设置为0，正确的值放在数据描述符中
 * bit 4: 为压缩方法8保留，用于增强型deflating
 * bit 5: 1 -> 表明该文件是压缩的补丁数据 (需要 PKZIP 2.70 或更高版本) (当对一个超大的已压缩文件进行分块时会用到)
 * bit 6: 强加密，参阅强加密部分
 * bit 7、8、9、10、12、14、15: 保留
 * bit 11 语言编码标志 1 -> 文件名和注释字段必须使用utf8
 */

/**
 * 压缩方法说明
 * 
 * unencrypted              0
 * UnShrinking              1
 * Expanding                2-5
 * Imploding                6   // 1-6不推荐使用
 * Tokenizing               7   // This method is not used by PKZIP.
 * Deflating                8
 * Enhanced Deflating       9
 * PKWARE Data Compression Library Imploding    10
 * BZIP2                    12
 * LZMA                     14
 * IBM z/OS CMPSC Compression   16
 * IBM TERSE                18
 * IBM LZ77 z Architecture  19
 * JPEG variant             96
 * WavPack                  97
 * PPMd                     98
 * AE-x Encryption marker   99
 * 
 * Reserved                 11, 13, 15, 17
 */

/**
 * 时间说明
 * 
 * 日期和时间以标准 MS-DOS 格式编码。
 * 0 - 4    秒 (除以2得到)
 * 5 - 10   分
 * 11 - 15  时
 * 16 - 20  日
 * 21 - 24  月
 * 25 - 31  年 (减去1980年得到)
 */

/**
 * CRC32说明
 * 
 * 
 */

/**
 * 数据描述符说明
 * 
 * 存储以下三个字段，当通用标志 bit3设为1时必须存在
 *      crc-32 4 字节
 *      压缩大小 4 字节
 *      未压缩大小 4 字
 */

/**
 * 加密头
 * 
 * 12字节。经过加密的
 * 
 * 加密数据头：
 * 1、初始化加密秘钥
 *      uint32_t Key[3];
 *      Key(0) = 305419896
 *      Key(1) = 591751049
 *      Key(2) = 878082192
 * 
 * loop for i = 0 to length(password) - 1
 *     update_keys(password(i))  // update_keys定义如下
 * end loop
 * 
 * 2、读取12字节的加密头到buffer[12]
 * loop for i = 0 to 11
 *     C = buffer(i) ^ decrypt_byte()
 *     update_keys(C)
 *     buffer(i) = C
 * end loop
 *
 * 3、说明
 * 经过第二步后已解密完毕
 * 如果PKZIP版本大于2.0则buffer的最后一个字节为buffer前11个字节的CRC校验
 * 如果PKZIP版本小于2.0则buffer的最后两个字节为buffer前10个字节的CRC检验
 * 此处的CRC用于校验密码提供的是否正确
 * 
 * 
 * unsigned char decrypt_byte()
 *     local unsigned short temp
 *     temp = Key(2) | 2
 *     decrypt_byte = (temp * (temp ^ 1)) >> 8
 * end decrypt_byte
 * 
 * update_keys(uint8_t c):
 *   Key(0) = crc32(key(0), c)
 *   Key(1) = Key(1) + (Key(0) & 0xFF)
 *   Key(1) = Key(1) * 134775813 + 1
 *   Key(2) = crc32(key(2),key(1) >> 24)
 * end update_key
 * 
 * crc32(uint32_t old_crc, uint8_t c);
 */


/**
 * 中央目录文件头
 * 
 * central file header signature   4 bytes      中央文件头标识符 (0x02014b50(大端)) 
 * version made by                 2 bytes      版本
 * version needed to extract       2 bytes      提取所需的版本
 * general purpose bit flag        2 bytes      通用位标志
 * compression method              2 bytes      压缩方法
 * last mod file time              2 bytes      最后修改文件时间  时分秒
 * last mod file date              2 bytes      最后修改文件日期 年月日
 * crc-32                          4 bytes      crc-32
 * compressed size                 4 bytes      压缩大小
 * uncompressed size               4 bytes      压缩前大小
 * file name length                2 bytes      文件名长度
 * extra field length              2 bytes      额外字段长度
 * file comment length             2 bytes      文件注释长度
 * disk number start               2 bytes      磁盘号
 * internal file attributes        2 bytes      内部文件属性
 * external file attributes        4 bytes      外部文件属性
 * relative offset of local header 4 bytes      本地头的相对偏移量 (对应的本地文件相对于文件开始的偏移量)
 * 
 * file name                (variable size)     文件名
 * extra field              (variable size)     额外字段
 * file comment             (variable size)     文件注释
 */

/**
 * 提取所需的版本
 * 
 * 
 */

/**
 * 外部文件属性
 * 
 * 高位字节表示文件属性的兼容性，如果外部文件属性与MS-DOS兼容，并且可以被2.04g的DOS版本的PKZIP所读取
 * 则该值为0。如果不兼容，则该值将标识属性兼容的主机系统。
 * 
 *  0 - MS-DOS and OS/2 (FAT / VFAT / FAT32 file systems)
 *  1 - Amiga                     2 - OpenVMS
 *  3 - UNIX                      4 - VM/CMS
 *  5 - Atari ST                  6 - OS/2 H.P.F.S.
 *  7 - Macintosh                 8 - Z-System
 *  9 - CP/M                     10 - Windows NTFS
 *  11 - MVS (OS/390 - Z/OS)      12 - VSE
 *  13 - Acorn Risc               14 - VFAT
 *  15 - alternate MVS            16 - BeOS
 *  17 - Tandem                   18 - OS/400
 *  19 - OS X (Darwin)            20 thru 255 - unused
 * 
 */

/**
 * 数字签名
 * 
 * header signature                4 bytes          数字签名标识符 (0x05054b50(大端))
 * size of data                    2 bytes          签名数据大小
 * signature data              (variable size)      签名数据
 */
 
/**
 * 中央目录记录的zip64结尾
 *
 * signature                       4 bytes  (0x06064b50)
 * size of zip64 end of central directory record                8 bytes
 * version made by                 2 bytes
 * version needed to extract       2 bytes
 * number of this disk             4 bytes
 * number of the disk with the start of the central directory  4 bytes
 * total number of entries in the central directory on this disk  8 bytes
 * total number of entries in the central directory               8 bytes
 * size of the central directory   8 bytes
 * offset of start of central directory with respect to the starting disk number        8 bytes
 * zip64 extensible data sector    (variable size)
 */

 /**
 * 中央目录定位符的zip64结尾
 *
 * signature                       4 bytes  (0x07064b50)
 * number of the disk with the start of the zip64 end of central directory	4 bytes		中央目录以zip64结尾的磁盘编号
 * relative offset of the zip64 end of central directory record 			8 bytes		中心目录记录的zip64结尾的相对偏移量
 * total number of disks           4 bytes 	磁盘总数
 */ 

/**
 * 中央目录记录结尾
 * 
 * end of central dir signature    4 bytes          中心目录结尾标识符 (0x06054b50(大端))
 * number of this disk             2 bytes          当前磁盘编号
 * number of the disk with the start of the central directory  2 bytes      目录区开始磁盘编号
 * total number of entries in the central directory on this disk  2 bytes   本磁盘上纪录总数 
 * total number of entries in the central directory           2 bytes       目录区中纪录总数
 * size of the central directory   4 bytes          目录区尺寸大小 (中央目录总的字节数)
 * offset of start of central directory with respect to the starting disk number  4 bytes
 *                                                  目录区对第一张磁盘的偏移量 (第一个中央目录区在此文件的位置(从0开始计算的值))
 * .ZIP file comment length        2 bytes          ZIP 文件注释长度
 * .ZIP file comment           (variable size)      ZIP 文件注释内容
 */

```