/*
 * @Author: your name
 * @Date: 2021-05-12 15:17:59
 * @LastEditTime: 2021-05-28 15:25:23
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /ompWeb/src/layouts/ContentWrapper/index.js
 */
import React from "react";
import styles from "./index.less";

function ContentWrapper({ children,wrapperStyle}) {
  return <div style={wrapperStyle} className={styles.contentWrapper}>{children}</div>;
}

export default ContentWrapper;
