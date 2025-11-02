/*
 * @Author: your name
 * @Date: 2021-05-12 15:17:59
 * @LastEditTime: 2021-06-16 15:39:04
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /ompWeb/src/pages/SystemSettings/SystemManagement/index.js
 */
import ContentNav from "@/layouts/ContentNav";
import ContentWrapper from "@/layouts/ContentWrapper";
import BasicSettings from "@/pages/SystemSettings/SystemManagement/BasicSettings";
import PatrolSettings from "@/pages/SystemSettings/SystemManagement/PatrolSettings";
import ThresholdSettings from "@/pages/SystemSettings/SystemManagement/ThresholdSettings";
import React, { useState } from "react";
import SelfHealingSettings from "@/pages/SystemSettings/SystemManagement/SelfHealingSettings";

function SystemManagement(props) {
  const [currentTab, setCurrentTab] = useState("basic");

  const contentNavData = [
    {
      name: "basic",
      text: "基础设置",
      handler: () => setCurrentTab("basic"),
      component: <BasicSettings />,
    },
    {
      name: "patrol",
      text: "巡检设置",
      handler: () => setCurrentTab("patrol"),
      component: <PatrolSettings />,
    },
    {
      name: "threshold",
      text: "阈值设置",
      handler: () => setCurrentTab("threshold"),
      component: <ThresholdSettings />,
    },
    {
      name: "selfHealing",
      text: "自愈设置",
      handler: () => setCurrentTab("selfHealing"),
      component: <SelfHealingSettings />,
    },
  ];

  return (
    <ContentWrapper wrapperStyle={{backgroundColor:"#fff"}}>
      <ContentNav data={contentNavData} currentFocus={currentTab} />
      {contentNavData.find((item) => item.name === currentTab).component}
    </ContentWrapper>
  );
}

export default SystemManagement;
