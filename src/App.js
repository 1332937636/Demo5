/*
 * @Author: your name
 * @Date: 2021-05-31 09:22:53
 * @LastEditTime: 2021-06-25 19:05:08
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /omp-fontend123/src/App.js
 */

import Router from "./router.js";
import { Provider } from "react-redux";
import store from "@/reduxStore/reduxStore";
// 国际化
import zhCN from 'antd/es/locale/zh_CN';
//import en_antd from "antd/es/locale/en_US";
import { ConfigProvider } from "antd";
import "./App.css"
//import moment from 'moment'
import 'moment/locale/zh-cn'
//moment.locale('zh-cn')

const App = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Provider store={store}>
        <Router />
      </Provider>
    </ConfigProvider>
  );
};

export default App;
