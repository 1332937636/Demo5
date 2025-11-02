import React from "react";
import styles from "./index.less";

// 用于面包屑导航组件下部的 切换页面content的导航
const ContentNav = ({ data, currentFocus }) => {
  const focusedStyle = {
    color: "#1890ff",
    borderBottom: "2px solid #1890ff",
  };

  return (
    <div className={styles.warningListHeader}>
      {data.map((item, index) => {
        return (
          <div
            key={index}
            style={currentFocus === item.name ? focusedStyle : {}}
            onClick={() => item.handler()}
          >
            {item.text}
          </div>
        );
      })}
    </div>
  );
};
export default ContentNav;
