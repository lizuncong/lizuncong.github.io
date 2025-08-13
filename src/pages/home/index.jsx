import React from "react";

function Index() {
  return <div className="home" onClick={() => {
    gtag('event', 'screen_view', {
        'app_name': 'myAppName',
        'screen_name': 'Home'
      });
        gtag('event', 'hello_test', {
        'app_name': 'myAppName',
        'screen_name': 'Home'
      });
}}>首页</div>;
}

export default Index;

        
