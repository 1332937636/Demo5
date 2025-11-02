/*
 * @Author: your name
 * @Date: 2021-06-16 15:29:50
 * @LastEditTime: 2021-06-22 19:52:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /ompWeb/src/pages/SystemSettings/SystemManagement/SelfHealingSettings/index.js
 */

import { apiRequest } from "@/config/requestApi";
import styles from "@/pages/SystemSettings/index.less";
import { fetchGet, fetchPut } from "@/utils/request";
import { handleResponse, isValidIP } from "@/utils/utils";
import {
  Tooltip,
  Icon,
  Input,
  message,
  Spin,
  Button,
  Switch,
  InputNumber,
} from "antd";
import React, { useEffect, useState, useContext } from "react";
import updata from "@/stores/globalStore";
import { SaveSettingsButtonGroup } from "@/components";

export function InfoTip({ text }) {
  return (
    <Tooltip title={text}>
      <Icon
        style={{
          marginLeft: "10px",
          color: "#909090",
          height: "100%",
          display: "inline-flex",
          alignItems: "center",
        }}
        type="info-circle"
      />
    </Tooltip>
  );
}

function SelfHealingSettings() {
  //   const [prometheusAddress, setPrometheusAddress] = useState(null);
  //   const [grafanaAddress, setGrafanaAddress] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const [switchChecked, setSwitchChecked] = useState(false);

  const [alertCount, setAlertCount] = useState(0);

const [maxHealingCount, setMaxHealingCount] = useState(0);

  const switchOnChange = (e) => {
    setSwitchChecked(e);
  };

  const onHealingCountChange = (e) => {
    setMaxHealingCount(e);
  };

   /* 限制数字输入框只能输入整数 */
   const limitNumber = value => {
    if (typeof value === 'string') {
      return !isNaN(Number(value)) ? value.replace(/^(0+)|[^\d]/g, '') : '';
    } else if (typeof value === 'number') {
      return !isNaN(value) ? String(value).replace(/^(0+)|[^\d]/g, '') : '';
    } else {
      return '';
    }
  };
  
  useEffect(() => {
    setLoading(true);
    fetchGet(apiRequest.systemSettings.selfHealingSetting)
      .then((res) => {
        if (res.code === 0 && res.data) {
          console.log("res", res);
          setSwitchChecked(res.data.used);
          setAlertCount(res.data.alert_count);
          setMaxHealingCount(res.data.max_healing_count);
        }
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* <Button onClick={()=> appContext.dispatch({ type: "TEST", payload: { value: "TEST" } })}>{appContext.state.test}</Button> */}
      <div className={styles.tabItemWrapper}>
        <div className={styles.tabTitle}>自愈设置</div>
        <Spin key={"basic"} spinning={isLoading}>
          <div className={styles.tabContent} style={{ paddingLeft: 76 }}>
            <div>
              <div className={styles.inlineTabItemTitle}>启用：</div>
              <div className={styles.inlineTabItemSwitch}>
                <Switch checked={switchChecked} onChange={switchOnChange} />
              </div>
            </div>
            {/* <div>
              <div className={styles.inlineTabItemTitle}>告警次数：</div>
              <InputNumber value={alertCount} />
              <InfoTip text={"当触发告警阈值n次之后启动自愈操作"} />
            </div> */}
            {switchChecked? (<div style={{position:"relative"}}>
              <div className={styles.inlineTabItemTitle}>自愈尝试次数：</div>
              <div className={styles.inlineTabItemSwitch}>
                <InputNumber formatter={limitNumber} parser={limitNumber} min={1} disabled = {!switchChecked} value={maxHealingCount} onChange = {onHealingCountChange} />
                {maxHealingCount>50?<span style={{position:"absolute",width:200,top:35,left:-50,fontSize:13,color:"red"}}>自愈尝试次数最大不超过50次!</span>:""}
              </div>
              <InfoTip
                text={
                  "自愈操作执行第n次之后,服务依旧异常,停止自愈操作,发送告警邮件"
                }
              />
              <p><Icon type="warning" theme="filled" style={{color:"rgba(247, 207, 54)"}} /> <span style={{fontSize:13}}>当前版本不支持DOIM及监控宝的服务自愈！</span></p>
            </div>):""}
          </div>
        </Spin>
      </div>
      <SaveSettingsButtonGroup
        disabled={maxHealingCount>50&&switchChecked}
        saveHandler={() => {
            setLoading(true);
            fetchPut(apiRequest.systemSettings.selfHealingSetting, {
              body: {
                used:switchChecked,
                max_healing_count:maxHealingCount,
                env_id: Number(updata()().value),
                alert_count: alertCount
              },
            })
              .then((res) => {
                handleResponse(res);
              })
              .catch((e) => console.log(e))
              .finally(() => {
                setLoading(false);
              });
        }}
      />
    </div>
  );
}

export default SelfHealingSettings;
