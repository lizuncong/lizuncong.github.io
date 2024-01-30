### 下面按优先级从高到低排列
- !important(无穷大)
- 行内样式(1000)
- id选择器(100)
- 类选择器，伪类选择器，属性选择器 ，权重都是10
- 标签选择器(1)
- 通配符，继承(0)

<style type="text/css">
    #content div.main_content h2{
        color:red;    
    }
    #content .main_content h2{
        color:blue;
    }
</style>
......
<div id="content">
    <div class="main_content">
        <h2>这是一个h2标题</h2>
    </div>
</div>
<!-- 
第一条样式的权重计算： 100+1+10+1，结果为112；
第二条样式的权重计算： 100+10+1，结果为111；
h2标题的最终颜色为red
-->
