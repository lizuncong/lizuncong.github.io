```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0"
    />
    <title>promise</title>
    <style></style>
  </head>
  <body>
    <h1>test</h1>
    <script type="text/javascript">
      // 问题：promise的回调是在什么时候放入微任务队列当中的
      // 总结，promise只有在resolve状态下，且调用了then才会被放入微任务当中
      setTimeout(() => {
        console.log("ooooooooo");
      }, 4000);

      setTimeout(() => {
        console.log("timeout...0");
      }, 0);

      Promise.resolve().then((res) => {
        console.log("promise先执行....");
      });

      new Promise((resolve) => {
        setTimeout(() => {
          console.log("what the fuck...");
        }, 4000);
        setTimeout(() => resolve(), 4000);
      }).then((res) => {
        console.log("==========");
      });

      new Promise((resolve) => {
        setTimeout(() => resolve(), 4000);
      }).then((res) => {
        console.log("===+++++++=======");
      });

      new Promise((resolve) => {
        setTimeout(() => resolve(), 3500);
      }).then((res) => {
        console.log("++++++++++");
      });

      const times = [4000, 8000, 6300, 4500, 0];
      const promise = times.map(
        (i) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(i);
            }, i);
            // resolve(i)
          })
      );
      let print = () => {
        promise[0].then((res) => {
          console.log("res..", res);
        });

        new Promise((resolve) => {
          setTimeout(() => {
            resolve(6000);
          }, 6000);
        }).then((result) => {
          console.log("result...", result);

          const startTime = new Date().getTime();
          promise[1].then((res) => {
            console.log("res1..", res, new Date().getTime() - startTime);
          });
          console.log("hahahaahha");
          promise[2].then((res) => {
            console.log("res2..", res, new Date().getTime() - startTime);
          });
          promise[3].then((res) => {
            console.log("res3..", res, new Date().getTime() - startTime);
          });
          promise[4].then((res) => {
            console.log("res4..", res, new Date().getTime() - startTime);
          });
        });
      };

      print();

      //第一种写法1， 如果是这种写法，那么输出取决于promise的resolve执行时间
      let print = async () => {
        for (let i = 0; i < promise.length; i++) {
          if (i === 1) {
            const res = await new Promise((resolve) =>
              setTimeout(() => {
                resolve(6000);
              }, 6000)
            );
            console.log("hahah", res);
          }
          promise[i].then((res) => {
            console.log("res..", res);
          });
        }
      };

      // 因为第一种写法实际上相当于这样
      // let print = async () => {
      //   promise[0].then(res => {
      //     console.log('res..', res)
      //   })
      //   // const res  = await new Promise(resolve => setTimeout(() => { resolve(6000)}, 6000))
      //   // console.log('hahah', res)
      //   promise[1].then(res => {
      //     console.log('res..', res)
      //   })
      //   console.log('hahahaahha')
      //   promise[2].then(res => {
      //     console.log('res..', res)
      //   })
      //   promise[3].then(res => {
      //     console.log('res..', res)
      //   })
      // }

      // let print = async () => {
      //   promise[0].then(res => {
      //     console.log('res..', res)
      //   })
      //   promise[1].then(res => {
      //     console.log('res..', res)
      //   })
      //   console.log('hahahaahha')
      //   promise[2].then(res => {
      //     console.log('res..', res)
      //   })
      //   promise[3].then(res => {
      //     console.log('res..', res)
      //   })
      // }
      //
      // let print = () => {
      //   promise[0].then(res => {
      //     console.log('res..', res)
      //   })
      //
      //   new Promise(resolve => {
      //     setTimeout(() => {resolve(6000)}, 6000)
      //   }).then(res1 => {
      //     console.log('hahah..', res1)
      //     promise[1].then(res => {
      //       console.log('res..', res)
      //     })
      //     console.log('hahahaahha')
      //     promise[2].then(res => {
      //       console.log('res..', res)
      //     })
      //     promise[3].then(res => {
      //       console.log('res..', res)
      //     })
      //     promise[4].then(res => {
      //       console.log('res..', res)
      //     })
      //   })
      // }

      // const promise = times.map(i => new Promise(resolve => {
      //   console.log('new...', i) // 这个先执行了
      //   setTimeout(() => { resolve(i)}, i)
      //   // resolve(i)
      // }))
      // let print = () => {
      //   console.log('print=========')
      //
      //   promise[0].then(res => {
      //     console.log('res..', res)
      //   })
      //
      //   new Promise(resolve => {
      //     console.log('60000.....')
      //     setTimeout(() => {resolve(6000)}, 6000)
      //   }).then(res1 => {
      //     const startTime = new Date().getTime();
      //     console.log('hahah++++++++++++..', res1)
      //     promise[1].then(res => {
      //       console.log('res1..', res, new Date().getTime() - startTime)
      //     })
      //     console.log('hahahaahha')
      //     promise[2].then(res => {
      //       console.log('res2..', res, new Date().getTime() - startTime)
      //     })
      //     promise[3].then(res => {
      //       console.log('res3..', res, new Date().getTime() - startTime)
      //     })
      //     promise[4].then(res => {
      //       console.log('res4..', res, new Date().getTime() - startTime)
      //     })
      //   })
      // }

      // print();
      // 第二种写法，如果是这种写法，则是依次执行
      // let print2 = async () => {
      //   for(let i = 0; i < promise.length; i ++) {
      //     const res = await promise[i]
      //     console.log('res2..', res);
      //   }
      // }
      // 第二种写法相当于这样
      // let print = async () => {
      //   let res = await promise[0]
      //   console.log('res2...', res);
      //   let res = await promise[1]
      //   console.log('res2...', res);
      //   let res = await promise[2]
      //   console.log('res2...', res);
      //   let res = await promise[3]
      //   console.log('res2...', res);
      // }
      // print2();

      // 如果是map
      // promise.map(async p => {
      //   p.then(res => {
      //     console.log('res...', res)
      //   })
      // })
      //
      // promise.map(async p => {
      //   const res = await p();
      //   console.log('ress...')
      // })
    </script>
  </body>
</html>
```
