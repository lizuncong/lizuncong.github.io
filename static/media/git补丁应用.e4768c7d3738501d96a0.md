### 背景

项目 A dev 分支上某个`需求F`需要同步到项目 B dev 分支上。此时在项目 A dev 修改完并提交代码后，生成一个 hotfix 补丁文件

### 1. git log 查看提交记录

在项目 A 的 dev 分支下执行 git log 查看提交记录，找出 `需求F` 的 commit id

```shell
git log
```

![image](../../imgs/git-3.jpg)
复制需要生成补丁的 commit id，即那次修改的 commit 记录

### 2.git format-patch

在项目 A dev 分支下执行命令生成补丁文件

```shell
git format-patch 843d70f95d03dd053c9aa2a6ec3013229754b054 -1 --stdout > ./hotfix.patch
```

此时可以看到项目 A 目录下已经生成一个 hotfix.patch 文件

### 3. 补丁应用

可以使用

```shell
git apply --3way ./hotfix.patch
```

或者

```shell
git apply --reject ./hotfix.patch
```

hotfix.path 就是生成的补丁文件的位置

这两种方式有细微差别，具体可实践查看.
