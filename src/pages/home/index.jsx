import React from "react";
import Markdown from "@/components/markdown";
function Index() {
  return <div className="home" onClick={() => {
        gtag('event', 'hello_test', {
        'app_name': 'myAppName',
        'screen_name': 'Home',
        'my_test_time': new Date().toLocaleString()
      });
}}>
  <Markdown src={"/#/profile"} />
</div>;
}

export default Index;

        
