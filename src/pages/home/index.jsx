import React from "react";

function Index() {
  return <div className="home" onClick={() => {
        gtag('event', 'hello_test', {
        'app_name': 'myAppName',
        'screen_name': 'Home',
        '_my_test_time_': new Date().toLocaleString()
      });
}}>首页</div>;
}

export default Index;

        
