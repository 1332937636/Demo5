import { SaveSettingsButtonGroup } from "@/components";
import { apiRequest } from "@/config/requestApi";
import styles from "@/pages/SystemSettings/index.less";
import { InfoTip } from "@/pages/SystemSettings/SystemManagement/BasicSettings";
import { fetchGet, fetchPost, fetchPut } from "@/utils/request";
import { handleResponse } from "@/utils/utils";
import {
  Icon,
  Input,
  Select,
  Spin,
  Switch,
  TimePicker,
  message,
} from "antd";
import moment from "moment";
import * as R from "ramda";
import React, { useEffect, useState } from "react";
import updata from "@/stores/globalStore";

const { Option } = Select;
const basicComponent = {
  id: null,
  port: null,
  service_name: null,
  service_pass: null,
  service_user: null,
};

function PatrolSettings() {
  // 任务类型
  const [taskType, setTaskType] = useState("deep_analysis");
  // 任务名称
  const [taskTitle, setTaskTitle] = useState(null);
  // 巡检频率设置
  const [isOpenPatrol, setOpenPatrol] = useState(false);
  const [intervalType, setIntervalType] = useState(null);
  const [intervalWeekday, setIntervalWeekday] = useState(null);
  const [intervalMonthDay, setIntervalMonthDay] = useState(null);
  const [intervalTime, setIntervalTime] = useState("00:00");
  const [compsSourceData, setCompsSourceData] = useState([]);
  const [currentCompsList, setCurrentCompsList] = useState([basicComponent]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchGet(apiRequest.systemSettings.setting),
      fetchGet(apiRequest.systemSettings.userPass),
    ])
      .then(([settingResponse, userPassResponse]) => {
        if (settingResponse.code === 3) {
          message.warn("登录已过期，请重新登录");

          localStorage.clear();
          window.__history__.replace("/login");
          return;
        }
        /*eslint-disable*/
        handleResponse(settingResponse, () => {
          const { job_detail } = settingResponse.data;
          let allowDeep_analysis = Object.keys(job_detail);
          let idx = allowDeep_analysis.findIndex((item) =>
            item.startsWith("deep_analysis")
          );
          let allowKey = allowDeep_analysis[idx];
          let deep_analysis = job_detail[allowKey];
          if (deep_analysis) {
            setTaskType(deep_analysis.job_id);
            setTaskTitle(deep_analysis.job_name);
            //console.log(deep_analysis.is_start_crontab,"======");
            setOpenPatrol(deep_analysis.is_start_crontab === 0);
            if (
              deep_analysis.crontab_detail &&
              !R.isEmpty(deep_analysis.crontab_detail)
            ) {
              const { minute, hour, day, month, day_of_week } =
                deep_analysis.crontab_detail;

              if (day_of_week !== "*") {
                setIntervalType("week");
                setIntervalWeekday(day_of_week);
              } else if (day !== "*") {
                setIntervalType("month");
                setIntervalMonthDay(day);
              } else {
                setIntervalType("day");
              }
              setIntervalTime(`${hour}:${minute}`);
            }
          }
        });
        /*eslint-disable*/
        handleResponse(userPassResponse, () => {
          // 判断源数据是否为空
          if (userPassResponse.data && userPassResponse.data.length > 0) {
            setCompsSourceData(userPassResponse.data);

            const existedCompsData = userPassResponse.data.filter(
              // eslint-disable-next-line max-nested-callbacks
              (item) =>
                !R.isNil(item.service_user) || !R.isNil(item.service_pass)
            );
            if (!R.isEmpty(existedCompsData)) {
              // eslint-disable-next-line max-nested-callbacks
              let newArr = existedCompsData.filter((item) => item.service_user);
              console.log(newArr);
              setCurrentCompsList([newArr[0]]);
            }
          }
        });
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 账号设置-组件配置
  // const componentOptions = [
  //   'clickhouse', 'mysql', 'redis', 'arangodb', 'nacos', 'postgreSql'
  // ];
  //
  //
  // const [componentsArr, setComponentsArr] = useState([basicComponent]);

  // 调试保存日期
  // useEffect(() => {
  //   console.log('intervalType', intervalType);
  //   console.log('intervalMonthDay', intervalMonthDay);
  //   console.log('intervalWeekday', intervalWeekday);
  //   console.log('intervalTime', intervalTime);
  // }, [intervalMonthDay, intervalTime, intervalType, intervalWeekday]);

  // 调试保存的组件信息
  // useEffect(() => {
  //   console.log(currentCompsList);
  // }, [currentCompsList]);

  return (
    <div>
      <Spin key={"patrol"} spinning={isLoading}>
        <div className={styles.tabItemWrapper}>
          <div className={styles.tabTitle}>任务设置</div>

          <div className={styles.tabContent} style={{ paddingLeft: 76 }}>
            <div>
              <div className={styles.tabItemTitle}>任务类型：</div>
              <Select
                value={taskType}
                defaultValue="deep_analysis"
                style={{ width: 200 }}
                onChange={(item) => setTaskType(item)}
              >
                <Option value="deep_analysis">深度分析</Option>
              </Select>
              <InfoTip text={`当前版本只支持“深度分析”类型的巡检任务设置`} />
            </div>

            <div>
              <div className={styles.tabItemTitle}>任务名称：</div>
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                style={{ width: 200 }}
                placeholder={"例如：深度分析"}
              />
              <InfoTip
                text={`任务名称显示在“报告列表”及“报告内容”中，系统自动补充日期信息`}
              />
            </div>

            <div>
              <div className={styles.tabItemTitle} style={{ marginBottom: 10 }}>
                定时巡检：
                <Switch
                  style={{ marginLeft: "10px" }}
                  size={"small"}
                  checked={isOpenPatrol}
                  onChange={() => {
                    setOpenPatrol(!isOpenPatrol);
                  }}
                />
                <InfoTip
                  text={`开启定时巡检后，将在设定的时间，自动执行巡检任务`}
                />
              </div>
              {isOpenPatrol && (
                <div className={styles.patrolSettingWrapper}>
                  <div style={{ color: "#333", fontWeight: 500 }}>
                    定时策略：
                  </div>
                  <div>
                    <div style={{ marginRight: "10px", display: "flex" }}>
                      <div className={styles.chooseInterval}>
                        <Select
                          value={intervalType}
                          placeholder={"选择周期"}
                          style={{ width: 120 }}
                          onChange={(item) => {
                            setIntervalType(item);
                            switch (item) {
                              case "day":
                                setIntervalMonthDay(null);
                                setIntervalWeekday(null);
                                break;
                              case "week":
                                setIntervalMonthDay(null);
                                break;
                              case "month":
                                setIntervalWeekday(null);
                                break;
                            }
                          }}
                        >
                          <Option value="day">每天</Option>
                          <Option value="week">每周</Option>
                          <Option value="month">每月</Option>
                        </Select>
                      </div>
                      <div className={styles.intervalDetails}>
                        {(() => {
                          switch (intervalType) {
                            case "day":
                              return (
                                <TimePicker
                                  onChange={(time, timeString) =>
                                    setIntervalTime(
                                      timeString ? timeString : "00:00"
                                    )
                                  }
                                  format={"HH:mm"}
                                  value={moment(`${intervalTime}`, "HH:mm")}
                                  defaultOpenValue={moment("00:00", "HH:mm")}
                                />
                              );
                            case "week":
                              return (
                                <>
                                  <Select
                                    key={"week"}
                                    value={intervalWeekday}
                                    placeholder="请选择星期"
                                    style={{ width: 120, marginRight: 10 }}
                                    onChange={(item) =>
                                      setIntervalWeekday(item)
                                    }
                                  >
                                    <Option value="0">星期一</Option>
                                    <Option value="1">星期二</Option>
                                    <Option value="2">星期三</Option>
                                    <Option value="3">星期四</Option>
                                    <Option value="4">星期五</Option>
                                    <Option value="5">星期六</Option>
                                    <Option value="6">星期日</Option>
                                  </Select>
                                  <TimePicker
                                    value={moment(`${intervalTime}`, "HH:mm")}
                                    onChange={(time, timeString) =>
                                      setIntervalTime(
                                        timeString ? timeString : "00:00"
                                      )
                                    }
                                    format={"HH:mm"}
                                    defaultOpenValue={moment("00:00", "HH:mm")}
                                  />
                                </>
                              );
                            case "month":
                              return (
                                <>
                                  <Select
                                    value={intervalMonthDay}
                                    placeholder="请选择日期"
                                    key={"month"}
                                    style={{ width: 120, marginRight: 10 }}
                                    onChange={(item) =>
                                      setIntervalMonthDay(item)
                                    }
                                  >
                                    {new Array(28).fill(0).map((item, idx) => {
                                      return (
                                        <Option key={idx + 1} value={idx + 1}>
                                          {idx + 1}日
                                        </Option>
                                      );
                                    })}
                                  </Select>
                                  <TimePicker
                                    value={moment(`${intervalTime}`, "HH:mm")}
                                    onChange={(time, timeString) =>
                                      setIntervalTime(
                                        timeString ? timeString : "00:00"
                                      )
                                    }
                                    format={"HH:mm"}
                                    defaultOpenValue={moment("00:00", "HH:mm")}
                                  />
                                </>
                              );
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <SaveSettingsButtonGroup
          saveHandler={() => {
            if (!taskTitle) {
              return message.warn("请输入任务名称");
            }

            if (isOpenPatrol) {
              if (intervalType === "month" && !intervalMonthDay) {
                return message.warn("请选择月份日期");
              }
              if (intervalType === "week" && !intervalWeekday) {
                return message.warn("请选择星期");
              }
            }
            setLoading(true);
            fetchPost(apiRequest.systemSettings.saveSetting, {
              body: {
                job_setting: [
                  {
                    job_type: "深度分析",
                    job_id: "deep_analysis",
                    job_name: taskTitle,
                    is_start_crontab: isOpenPatrol ? 0 : 1,
                    crontab_detail: {
                      minute: intervalTime ? intervalTime.split(":")[1] : "0",
                      hour: intervalTime ? intervalTime.split(":")[0] : "0",
                      day: intervalType === "month" ? intervalMonthDay : "*",
                      month: "*",
                      day_of_week:
                        intervalType === "week" ? intervalWeekday : "*",
                    },
                  },
                ],
                env_id: Number(updata()().value),
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

        <div className={styles.tabItemWrapper}>
          <div className={styles.tabTitle}>
            账号设置{" "}
            <InfoTip
              text={
                "如组件账号未采用默认值，请添加最新账号信息，否则将无法采集数据"
              }
            />
          </div>
          <div className={styles.tabContent} style={{ paddingLeft: 76 }}>
            <div>
              {currentCompsList.map((item, idx) => {
                return (
                  <div key={idx} className={styles.compsItemWrapper}>
                    <div className={styles.tabItemTitle}>
                      组件名称：
                      <Select
                        value={item.service_name}
                        placeholder={"选择组件类型"}
                        style={{
                          width: 200,
                          fontWeight: 400,
                          marginRight: 10,
                        }}
                        onChange={(item) => {
                          setCurrentCompsList(
                            R.update(
                              idx,
                              R.find(
                                (a) => a.service_name === item,
                                compsSourceData
                              ),
                              currentCompsList
                            )
                          );
                        }}
                      >
                        {compsSourceData.map((item, idx) => {
                          return (
                            <Option key={idx} value={item.service_name}>
                              {item.service_name}
                            </Option>
                          );
                        })}
                      </Select>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 20,
                      }}
                    >
                      <div>用户名：</div>
                      <Input
                        style={{ width: 150, marginRight: 10 }}
                        value={item.service_user}
                        onChange={(e) => {
                          setCurrentCompsList(
                            R.update(
                              idx,
                              R.assoc(
                                "service_user",
                                e.target.value,
                                currentCompsList[idx]
                              ),
                              currentCompsList
                            )
                          );
                        }}
                        placeholder={"请输入用户名"}
                      />
                      <div>密码：</div>
                      <Input.Password
                        style={{ width: 150, marginRight: 10 }}
                        value={item.service_pass}
                        onChange={(e) => {
                          setCurrentCompsList(
                            R.update(
                              idx,
                              R.assoc(
                                "service_pass",
                                e.target.value,
                                currentCompsList[idx]
                              ),
                              currentCompsList
                            )
                          );
                        }}
                        placeholder={"请输入密码"}
                      />
                      <div>端口：</div>
                      <Input
                        style={{ width: 150, marginRight: 10 }}
                        value={item.port}
                        onChange={(e) => {
                          setCurrentCompsList(
                            R.update(
                              idx,
                              R.assoc(
                                "port",
                                e.target.value,
                                currentCompsList[idx]
                              ),
                              currentCompsList
                            )
                          );
                        }}
                        placeholder={"请输入端口"}
                      />
                      {/*删除按钮*/}
                      {currentCompsList.length > 1 && (
                        <Icon
                          onClick={() => {
                            const cloneData = R.clone(currentCompsList);
                            if (item.id !== null) {
                              setCurrentCompsList(
                                currentCompsList.filter((a) => a.id !== item.id)
                              );
                            } else {
                              cloneData.splice(idx, 1);
                              setCurrentCompsList(cloneData);
                            }
                          }}
                          style={{ fontSize: 18, marginRight: 20 }}
                          type="minus-circle"
                          theme={"twoTone"}
                          twoToneColor="#f5222d"
                        />
                      )}
                      {/*  新增按钮*/}
                      {idx === currentCompsList.length - 1 && (
                        <Icon
                          onClick={() =>
                            setCurrentCompsList(
                              currentCompsList.concat([basicComponent])
                            )
                          }
                          style={{ fontSize: 18 }}
                          type="plus-circle"
                          theme={"twoTone"}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <SaveSettingsButtonGroup
          saveHandler={() => {
            setLoading(true);
            fetchPut(apiRequest.systemSettings.userPass, {
              body: {
                update_data: currentCompsList.filter(
                  (item) =>
                    item.service_user !== null || item.service_pass !== null
                ),
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
      </Spin>
    </div>
  );
}

export default PatrolSettings;
