import { SaveSettingsButtonGroup } from "@/components";
import { apiRequest } from "@/config/requestApi";
import styles from "@/pages/SystemSettings/index.less";
import { fetchGet, fetchPost } from "@/utils/request";
import { handleResponse, isValidIP } from "@/utils/utils";
import {
  Tooltip,
  Icon,
  Input,
  message,
  Spin,
  Button,
  Collapse,
  Switch,
  Tabs,
} from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import OmpMaintenanceModal from "@/components/OmpMaintenanceModal";
import updata from "@/stores/globalStore";

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

const { Panel } = Collapse;

function BasicSettings() {
  const { TabPane } = Tabs;
  //是否展示维护模式提示词
  const isMaintenance = useSelector(
    (state) => state.customBreadcrumb.isMaintenance
  );

  const [prometheusAddress, setPrometheusAddress] = useState(null);
  const [grafanaAddress, setGrafanaAddress] = useState(null);
  const [alertAddress, setAlertAddress] = useState(null);

  const [alertSendDataSource, setAlertSendDataSource] = useState({});

  const [isLoading, setLoading] = useState(false);

  const [isAlertLoading, setIsAlertLoading] = useState(false);

  const [maintainModal, setMaintainModal] = useState(false);
  const [isUsed, setIsUsed] = useState(false);

  const switchOnChange = (e) => {
    setIsUsed(e);
    setMaintainModal(true);
    //dispatch(getMaintenanceChangeAction(e));
  };

  useEffect(() => {
    setLoading(true);
    setIsAlertLoading(true);
    Promise.allSettled([
      fetchGet(apiRequest.systemSettings.monitor),
      fetchGet(apiRequest.systemSettings.alertSend),
    ])
      .then(([baseRes, alertSendRes]) => {
        if (baseRes.status === "fulfilled") {
          if (baseRes.value.code === 0 && baseRes.value.data.length > 0) {
            setGrafanaAddress(baseRes.value.data[0].grafana_info);
            setPrometheusAddress(baseRes.value.data[0].prometheus_info);
            setAlertAddress(baseRes.value.data[0].alert_manage_info);
          }
        }
        if (alertSendRes.status === "fulfilled") {
          if (alertSendRes.value.code === 0) {
            if (alertSendRes.value.data.doem)
              setAlertSendDataSource(alertSendRes.value.data.doem);
          }
        }
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
        setIsAlertLoading(false);
      });
  }, []);

  const AlertSwitchOnChange = (e) => {
    if (!e) {
      setIsAlertLoading(true);
      fetchPost(apiRequest.systemSettings.alertSend, {
        body: {
          //...alertSendDataSource,
          used: 0,
          env_id: Number(updata()().value),
        },
      })
        .then((res) => {
          handleResponse(res, () => {
            //console.log(res);
            if (res.code === 0) {
              setAlertSendDataSource({ used: false });
            }
          });
        })
        .catch((e) => console.log(e))
        .finally(() => {
          setIsAlertLoading(false);
        });
    } else {
      fetchGet(apiRequest.systemSettings.alertSend)
        .then((res) => {
          handleResponse(res, () => {
            //console.log(res);
            if (res.code === 0) {
              setAlertSendDataSource({ ...res.data.doem, used: true });
            }
          });
        })
        .catch((e) => console.log(e))
        .finally(() => {
          setIsAlertLoading(false);
        });
    }
    //setAlertSendDataSource({...alertSendDataSource, used: e });
  };

  const submitAlertSendData = () => {
    setIsAlertLoading(true);
    fetchPost(apiRequest.systemSettings.alertSend, {
      body: {
        ...alertSendDataSource,
        used: alertSendDataSource.used ? 1 : 0,
        env_id: Number(updata()().value),
      },
    })
      .then((res) => {
        handleResponse(
          res
          //   () => {
          //   if (res.code === 0) {

          //   }
          // }
        );
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setIsAlertLoading(false);
      });
  };

  return (
    <div>
      {/* <Button onClick={()=> appContext.dispatch({ type: "TEST", payload: { value: "TEST" } })}>{appContext.state.test}</Button> */}
      <div className={styles.tabItemWrapper}>
        <div className={styles.tabTitle}>基础设置</div>
        <Spin key={"basic"} spinning={isLoading}>
          <div className={styles.tabContent} style={{ paddingLeft: 76 }}>
            <div>
              <div className={styles.inlineTabItemTitle}>数据采集地址：</div>
              <Input
                value={prometheusAddress}
                onChange={(e) => setPrometheusAddress(e.target.value)}
                style={{ width: 250 }}
                placeholder={"例如：192.168.1.111:1000"}
              />
              <InfoTip
                text={
                  "此地址只兼容自监控平台的Prometheus地址，规则为IP:PORT，默认情况无需调整"
                }
              />
            </div>

            <div>
              <div className={styles.inlineTabItemTitle}>数据展示地址：</div>
              <Input
                value={grafanaAddress}
                onChange={(e) => setGrafanaAddress(e.target.value)}
                style={{ width: 250 }}
                placeholder={"例如：192.168.1.111:1000"}
              />
              <InfoTip
                text={
                  "此地址只兼容自监控平台的Grafana地址，规则为IP:PORT，默认情况无需调整"
                }
              />
            </div>

            <div>
              <div className={styles.inlineTabItemTitle}>告警平台地址：</div>
              <Input
                value={alertAddress}
                onChange={(e) => setAlertAddress(e.target.value)}
                style={{ width: 250 }}
                placeholder={"例如：192.168.1.111:1000"}
              />
              <InfoTip text={"地址只兼容自监控平台的Alertmanager地址"} />
            </div>
          </div>
        </Spin>
        <SaveSettingsButtonGroup
          saveHandler={() => {
            if (
              !isValidIP(prometheusAddress) ||
              !isValidIP(grafanaAddress) ||
              !isValidIP(alertAddress)
            ) {
              return message.warn("请输入正确的连接地址和端口号");
            }
            setLoading(true);
            fetchPost(apiRequest.systemSettings.monitor, {
              body: {
                prometheus_info: prometheusAddress,
                grafana_info: grafanaAddress,
                alert_manage_info: alertAddress,
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

      <Collapse
        bordered={false}
        defaultActiveKey={["maintenanceSettings"]}
        style={{ marginTop: 10 }}
      >
        <Panel
          header="告警通道设置"
          key="maintenanceSettings"
          className={styles.panelItem}
        >
          <Spin key={"basic"} spinning={isAlertLoading}>
            <Tabs tabPosition="left" type="card" style={{ marginTop: 10 }}>
              <TabPane tab="DOEM" key="1">
                <div className={styles.targetItemWrapper}>
                  <div className={styles.tabContent}>
                    <div>
                      <span
                        style={{
                          marginRight: 10,
                          textAlign: "right",
                          fontWeight: 500,
                          color: "#333",
                          width: 80,
                          display: "inline-block",
                        }}
                      >
                        启用:{" "}
                      </span>
                      <Switch
                        onChange={AlertSwitchOnChange}
                        checked={alertSendDataSource.used}
                      ></Switch>
                    </div>

                    <div style={{ marginTop: 20 }}>
                      <span
                        style={{
                          marginRight: 10,
                          textAlign: "right",
                          fontWeight: 500,
                          color: "#333",
                          width: 80,
                          display: "inline-block",
                        }}
                      >
                        接口地址:{" "}
                      </span>
                      <Input
                        disabled={!alertSendDataSource.used}
                        value={alertSendDataSource.server_url}
                        onChange={(e) =>
                          setAlertSendDataSource({
                            ...alertSendDataSource,
                            server_url: e.target.value,
                          })
                        }
                        style={{ width: 450 }}
                        placeholder={"请输入接口地址(以http开头)"}
                      />
                    </div>

                    <div style={{ marginTop: 20 }}>
                      <span
                        style={{
                          marginRight: 10,
                          textAlign: "right",
                          fontWeight: 500,
                          color: "#333",
                          width: 80,
                          display: "inline-block",
                        }}
                      >
                        appKey:{" "}
                      </span>
                      <Input
                        disabled={!alertSendDataSource.used}
                        value={alertSendDataSource.way_token}
                        onChange={(e) =>
                          setAlertSendDataSource({
                            ...alertSendDataSource,
                            way_token: e.target.value,
                          })
                        }
                        style={{ width: 450 }}
                        placeholder={"请输入appKey"}
                      />
                    </div>
                  </div>
                </div>
                <SaveSettingsButtonGroup
                  title="测试并保存"
                  style={{ position: "reactive", left: -55 }}
                  disabled={
                    !alertSendDataSource.way_token ||
                    !alertSendDataSource.server_url
                  }
                  saveHandler={() => {
                    submitAlertSendData();
                  }}
                />
              </TabPane>
            </Tabs>
          </Spin>
        </Panel>
      </Collapse>

      <Collapse
        bordered={false}
        defaultActiveKey={["maintenanceSettings"]}
        style={{ marginTop: 10 }}
      >
        <Panel
          header="维护模式设置"
          key="maintenanceSettings"
          className={styles.panelItem}
        >
          <div className={styles.targetItemWrapper}>
            <div className={styles.tabContent}>
              <p style={{
                  marginLeft: 65
                }}>
                <Icon
                  style={{
                    marginLeft: "10px",
                    color: "#909090",
                    height: "100%",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                  type="info-circle"
                />{" "}
                <span style={{ fontSize: 13 }}>
                  开启维护模式后，该环境内的监控数据会继续采集，但期间产生的告警信息不会发送。
                </span>
              </p>
              <span
                style={{
                  marginRight: 10,
                  textAlign: "right",
                  fontWeight: 500,
                  color: "#333",
                  width: 185,
                  display: "inline-block",
                }}
              >
                启用:{" "}
              </span>
              <Switch
                onChange={switchOnChange}
                checked={isMaintenance}
              ></Switch>
            </div>
          </div>
        </Panel>
      </Collapse>
      <OmpMaintenanceModal
        control={[maintainModal, setMaintainModal]}
        used={isUsed}
      />
    </div>
  );
}

export default BasicSettings;
