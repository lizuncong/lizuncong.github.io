## 前言
我们一般都是用谷歌浏览器自带的`Lighthouse`测试网站的性能。但有时候我们明明已经做了很多优化，并且各项指标已经降下来了，可`Lighthouse`分数却一直没上去，这是为什么？比如下面图示

优化前：

![image](../../../imgs/p_01.jpg)

优化后：

![image](../../../imgs/p_02.jpg)

可以看出，优化后，FCP、LCP、SI这三个指标的下降幅度非常明显，可以看出优化力度很大，但为什么分数还是26呢？

实际上，这和`Lighthouse`指标计算有关。下面，让我们展开说说

## 大纲
- Lighthouse分数计算
- 实例讲解Lighthouse指标
- 性能预警：如何使用脚本跑分，并实现鉴权

## Lighthouse分数计算

可以从下图所示的地方进去Lighthouse分数计算规则页面。

![image](../../../imgs/p_03.jpg)

Lighthouse分数计算规则页面

![image](../../../imgs/p_04.jpg)

从上图至少可以得出以下几点结论
- 每个指标的权重不同。总分是根据这些指标的得分加权计算而来的。
- 每个指标的耗时都有最大值，最小值都是0。这个可以从拖动滑杆得知。
    + FCP最大耗时为4000ms。4000ms以及以上，得分为0
    + SI最大耗时为5000ms。5000ms以及以上，得分为0
    + LCP最大耗时为6000ms。6000ms以及以上，得分为0
    + TBT最大耗时为2000ms。2000ms以及以上，得分为0
    + CLS最大为0.82。0.82以及以上，得分为0。
- 各指标如果都是0，则总分满分。表示性能最好

![image](../../../imgs/p_05.jpg)


在上面的例子中，优化前
- FCP为10.2秒，远超4000ms，得分为0。
- LCP为10.2秒，远超6000ms，得分同样为0。

优化后
- FCP为6.0秒，减少了4秒，但还是大于4000ms，因此得分还是0
- LCP为6秒，刚好达到最大值，因此得分还是0

因此，虽然我们优化后，各指标下降很明显，视觉上我们的网页显示速度也快了很多，但由于各指标还是超过了最大值，得分依旧是0，加权后总分还是不变。


## Lighthouse指标实验

### FCP && LCP
以下面的代码为例

```html
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <title>test</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script>
        const startTime = Date.now();
        while (Date.now() - startTime < 9000) { }
    </script>

<body>
    <div id="root">
        hello world
        <button>btb</button>
    </div>
</body>
</html>
```

这里我们阻塞主线程9秒钟，跑分如下：

![image](../../../imgs/p_06.jpg)


如果我们修改阻塞时间，改成6秒

```html
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <title>test</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script>
        const startTime = Date.now();
        while (Date.now() - startTime < 6000) { }
    </script>

<body>
    <div id="root">
        hello world
        <button>btb</button>
    </div>
</body>
</html>
```

跑分如下：

![image](../../../imgs/p_07.jpg)

从2个demo可以看到，FCP和LCP都下降很明显，但是我们的分数还是没有提高。但页面显示速度明显变快了。

如果将阻塞时间调成500ms

```html
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <title>test</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script>
        const startTime = Date.now();
        while (Date.now() - startTime < 500) { }
    </script>

<body>
    <div id="root">
        hello world
        <button>btb</button>
    </div>
</body>
</html>
```

跑分如下：

![image](../../../imgs/p_08.jpg)

### TBT
这里我们通过在setTimeout里添加一个while循环以实验TBT耗时。
```html
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <title>test</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />

<body>
    <div id="root">
        hello world
        <button>btb</button>
    </div>
    <script>
        setTimeout(() => {
            const startTime = Date.now();
            while (Date.now() - startTime < 6000) { }
        }, 0);

    </script>
</body>

</html>
```

![image](../../../imgs/p_09.jpg)

可以看出，FCP和LCP都已经几乎满分，TBT耗时较大。

可以尝试着调整setTimeout里面while循环的时间，并跑分观察TBT耗时。

### CLS

```html
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <title>test</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
        .block {
            width: 5px;
            height: 5px;
            background-color: red;
        }
    </style>

<body>
    <div id="root">
        hello world
        <div id="block2" class="block">

        </div>
        <p>dsafdsd </p>
        <div id="block" class="block">

        </div>
        <button>btb</button>
        <p>
            hello world
        </p>

    </div>
    <script>
        let size = 5;
        const resize = (el) => {
            setTimeout(() => {
                size = size + 5;
                el.style.width = `${size}px`;
                el.style.height = `${size}px`;
                if (size < 1000) {
                    resize(el)
                }
            }, 1);
        }
        resize(block)
        resize(block2)

    </script>
</body>

</html>
```

![image](../../../imgs/p_10.jpg)

## 跑分系统
使用谷歌Lighthouse实现自动化跑分，代码如下：
```js
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = { logLevel: 'info', output: 'html', onlyCategories: ['performance'], port: chrome.port };
  const runnerResult = await lighthouse(url, options);
  await chrome.kill();
  return runnerResult;
}

const url = 'http://localhost:8080/';

runLighthouse(url, {})
  .then(runnerResult => {
    // report是个html
    delete runnerResult.report
    const score = runnerResult.lhr.categories.performance.score * 100;
    const fcp = runnerResult.lhr.audits['first-contentful-paint'].displayValue;
    const lcp = runnerResult.lhr.audits['largest-contentful-paint'].displayValue;
    const tbt = runnerResult.lhr.audits['total-blocking-time'].displayValue;
    const cls = runnerResult.lhr.audits['cumulative-layout-shift'].displayValue;
    const si = runnerResult.lhr.audits['speed-index'].displayValue;

    console.log({ score, fcp, lcp, tbt, cls, si });
  })
  .catch(error => {
    console.error(error);
  });

```

![image](../../../imgs/p_11.jpg)




要在Lighthouse跑分脚本中实现登录鉴权，可以使用Lighthouse提供的自定义加载器（custom gatherer）和自定义脚本（custom audit）功能。以下是一种可能的实现方法：

1. 创建自定义加载器：自定义加载器是一个可以在页面加载期间执行的脚本，用于模拟用户登录和鉴权操作。在自定义加载器中，你可以使用浏览器的API来模拟用户输入、点击等操作。创建一个名为`custom-login-gatherer.js`的文件，并在其中编写以下代码：
```javascript
const Gatherer = require('lighthouse').Gatherer;

class CustomLoginGatherer extends Gatherer {
  async afterPass(options) {
    const session = await options.driver.createSession();
    await session.sendCommand('Network.enable');
    await session.sendCommand('Page.enable');
    
    // 模拟用户登录和鉴权操作
    await session.sendCommand('Page.navigate', { url: 'https://example.com/login' });
    await session.sendCommand('Page.waitForNavigation');
    await session.sendCommand('Page.type', { text: 'username', selector: '#username' });
    await session.sendCommand('Page.type', { text: 'password', selector: '#password' });
    await session.sendCommand('Page.click', { selector: '#login-button' });
    await session.sendCommand('Page.waitForNavigation');
    
    const cookies = await session.sendCommand('Network.getAllCookies');
    await session.detach();

    return cookies.cookies;
  }
}

module.exports = CustomLoginGatherer;
```

2. 创建自定义脚本：自定义脚本用于分析和处理从自定义加载器中收集到的数据。在自定义脚本中，你可以根据需要执行鉴权检查，并生成相应的报告。创建一个名为`custom-auth-audit.js`的文件，并在其中编写以下代码：
```javascript
const Audit = require('lighthouse').Audit;

class CustomAuthAudit extends Audit {
  static get meta() {
    return {
      id: 'custom-auth-audit',
      title: '登录鉴权检查',
      description: '检查页面是否成功登录并通过鉴权',
      requiredArtifacts: ['CustomLoginGatherer']
    };
  }

  static audit(artifacts) {
    const cookies = artifacts.CustomLoginGatherer;
    
    // 根据需要进行鉴权检查
    const isAuthenticated = cookies.some(cookie => cookie.name === 'auth_token');
    
    return {
      rawValue: isAuthenticated,
      score: isAuthenticated ? 1 : 0
    };
  }
}

module.exports = CustomAuthAudit;
```

3. 更新Lighthouse配置文件：在你的Lighthouse配置文件中，指定使用自定义加载器和自定义脚本。在配置文件中添加以下内容：
```json
{
  "audits": [
    "custom-auth-audit"
  ],
  "passes": [
    {
      "gatherers": [
        "custom-login-gatherer"
      ]
    }
  ]
}
```

4. 更新跑分脚本：在之前的跑分脚本中，使用Lighthouse配置文件来运行Lighthouse，并获取跑分结果。更新`run-lighthouse.js`文件中的代码如下：
```javascript
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse(url, config) {
  const chrome = await chromeLauncher.launch();
  const options = { port: chrome.port };
  const runnerResult = await lighthouse(url, options, config);
  await chrome.kill();

  return runnerResult.report;
}

const url = 'https://example.com';
const config = require('./lighthouse-config.json');

runLighthouse(url, config)
  .then(report => {
    console.log(report);
  })
  .catch(error => {
    console.error(error);
  });
```

现在，当你运行跑分脚本时，Lighthouse将使用自定义加载器模拟用户登录和鉴权操作，并使用自定义脚本执行鉴权检查。你可以根据需要自定义自定义加载器和自定义脚本的逻辑，以满足你的登录鉴权需求。
