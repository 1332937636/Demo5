/*
 * @Author: your name
 * @Date: 2021-06-24 16:47:43
 * @LastEditTime: 2021-06-25 19:00:10
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /omp-fontend123/src/router.js
 */

import { HashRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import OmpLayout from "@/layouts";
import routerConfig from "@/config/router.config";
//import HomePage from "@/pages/HomePage";

const OmpRouter = () => {
  let routerChildArr = routerConfig.map(item=>item.children).flat()
  return (
    <Router>
      <Switch>
        <Route
          path="/"
          component={() => (
            <OmpLayout>
              <Switch>
                <Route 
                  path="/homepage"
                  key="/homepage"
                  exact
                  render={()=><div />}
                />
                {routerChildArr.map((item) => {
                  return (
                    <Route
                      path={item.path}
                      key={item.path}
                      exact
                      render={() => <item.component />}
                    />
                  );
                })}
                <Redirect exact path="/" to="/homepage"/>
              </Switch>
            </OmpLayout>
          )}
        />
        
      </Switch>
    </Router>
  );
};

export default OmpRouter;
