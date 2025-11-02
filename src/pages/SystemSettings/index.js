/*
 * @Author: your name
 * @Date: 2021-05-12 15:17:59
 * @LastEditTime: 2021-05-28 15:21:28
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /ompWeb/src/pages/SystemSettings/index.js
 */
import React from "react";
import { withRouter } from "react-router-dom";

const SystemSettings = withRouter(({ children }) => {
  return <div style={{paddingBottom:30}}>{children}</div>;
});

export default SystemSettings;
