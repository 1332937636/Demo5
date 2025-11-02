import { SaveSettingsButtonGroup } from "@/components";
import { apiRequest } from "@/config/requestApi";
import { InfoTip } from "@/pages/SystemSettings/SystemManagement/BasicSettings";
import { fetchGet, fetchPut } from "@/utils/request";
import { handleResponse } from "@/utils/utils";
import {
  Collapse,
  Icon,
  Select,
  Spin,
  InputNumber,
  message,
} from "antd";
import * as R from "ramda";
import React, { useEffect, useState } from "react";
import styles from "../../index.less";
import updata from "@/stores/globalStore";

const { Panel } = Collapse;
const { Option } = Select;

const defaultData = [
  {
    condition: null,
    level: null,
    value: null,
  },
  {
    condition: null,
    level: null,
    value: null,
  },
];

function TargetItem({ data: { name, info, conditionsArr, handler } }) {
  return (
    <div className={styles.targetItem}>
      <div className={styles.itemTitle}>
        <span>指标项</span>: {name}
        <InfoTip text={info} />
      </div>
      <div className={styles.conditionItemWrapper}>
        {conditionsArr.map((item, idx) => {
          return (
            <div key={idx} className={styles.conditionItem}>
              阈值：
              <Select
                value={item.condition}
                placeholder={"请选择"}
                style={{ width: 90, marginRight: 10 }}
                onChange={(item) => {
                  const foo = R.clone(conditionsArr);
                  foo[idx] = R.assoc("condition", item, foo[idx]);
                  handler(foo);
                }}
              >
                <Option value="==">{"=="}</Option>
                <Option value=">=">{">="}</Option>
                {/* <Option value="<=">{"<="}</Option> */}
                <Option value=">">{">"}</Option>
                {/* <Option value="<">{"<"}</Option> */}
              </Select>
              <InputNumber
                style={{ width: 80, marginRight: 20 }}
                placeholder={"例如：80%"}
                min={0}
                max={100}
                value={item.value}
                formatter={(value) => `${value}%`}
                parser={(value) => value.replace("%", "")}
                onChange={(val) => {
                  const foo = R.clone(conditionsArr);
                  foo[idx] = R.assoc("value", val, foo[idx]);
                  handler(foo);
                }}
              />
              级别：
              <Select
                value={item.level}
                placeholder={"请选择"}
                style={{ width: 90, marginRight: 40 }}
                onChange={(item) => {
                  const foo = R.clone(conditionsArr);
                  foo[idx] = R.assoc("level", item, foo[idx]);
                  handler(foo);
                }}
              >
                <Option value="warning">警告</Option>
                <Option value="critical">严重</Option>
              </Select>
              {conditionsArr.length === 1 && (
                <Icon
                  onClick={() => {
                    const foo = R.clone(conditionsArr);
                    foo[1] = defaultData[1];
                    handler(foo);
                  }}
                  style={{
                    fontSize: 18,
                    marginRight: 20,
                  }}
                  type="plus-circle"
                  theme={"twoTone"}
                />
              )}
              {idx === 1 && (
                <Icon
                  onClick={() => {
                    const foo = R.clone(conditionsArr);
                    foo.splice(1, 1);
                    handler(foo);
                  }}
                  style={{ fontSize: 18 }}
                  type="minus-circle"
                  theme={"twoTone"}
                  twoToneColor="#f5222d"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ThresholdSettings() {
  const [cpuUsed, setCpuUsed] = useState([0, 1]);
  const [memoryUsed, setMemoryUsed] = useState([0, 1]);
  const [diskRootUsed, setDiskRootUsed] = useState([0, 1]);
  const [diskDataUsed, setDiskDataUsed] = useState([0, 1]);
  const [serviceActive, setServiceActive] = useState([0, 1]);
  const [serviceCpuUsed, setServiceCpuUsed] = useState([0, 1]);
  const [serviceMemoryUsed, setServiceMemoryUsed] = useState([0, 1]);

  const machineTargetsMap = [
    {
      name: "cpu_used",
      info: `主机当前“CPU”使用率`,
      conditionsArr: cpuUsed,
      handler: (val) => setCpuUsed(val),
    },
    {
      name: "memory_used",
      info: `主机当前“内存”使用率`,
      conditionsArr: memoryUsed,
      handler: (val) => setMemoryUsed(val),
    },
    {
      name: "disk_root_used",
      info: `主机当前“根分区”使用率`,
      conditionsArr: diskRootUsed,
      handler: (val) => setDiskRootUsed(val),
    },
    {
      name: "disk_data_used",
      info: `主机当前“数据分区”使用率`,
      conditionsArr: diskDataUsed,
      handler: (val) => setDiskDataUsed(val),
    },
  ];

  const serviceTargetsMap = [
    {
      name: "service_active",
      info: `服务当前“是否存活”，验证标准是端口是否可以连通`,
      conditionsArr: serviceActive,
      handler: (val) => setServiceActive(val),
    },
    {
      name: "service_cup_used",
      info: `服务当前“CPU”使用率`,
      conditionsArr: serviceCpuUsed,
      handler: (val) => setServiceCpuUsed(val),
    },
    {
      name: "service_memory_used",
      info: `服务当前“内存”使用率`,
      conditionsArr: serviceMemoryUsed,
      handler: (val) => setServiceMemoryUsed(val),
    },
  ];

  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchGet(apiRequest.systemSettings.hostThreshold),
      fetchGet(apiRequest.systemSettings.serviceThreshold),
    ])
      .then(([hostResponse, serviceResponse]) => {
        if (hostResponse.code === 3) {
          message.warn("登录已过期，请重新登录");

          localStorage.clear();
          window.__history__.replace("/login");
          return;
        }

        const {
          data: { cpu_used, memory_used, disk_root_used, disk_data_used },
        } = hostResponse;
        const {
          data: { service_active, service_cpu_used, service_memory_used },
        } = serviceResponse;

        setCpuUsed(cpu_used.length > 0 ? cpu_used : defaultData);
        setMemoryUsed(memory_used.length > 0 ? memory_used : defaultData);
        setDiskRootUsed(
          disk_root_used.length > 0 ? disk_root_used : defaultData
        );
        setDiskDataUsed(
          disk_data_used.length > 0 ? disk_data_used : defaultData
        );
        setServiceActive(
          service_active.length > 0 ? service_active : defaultData
        );
        setServiceCpuUsed(
          service_cpu_used.length > 0 ? service_cpu_used : defaultData
        );
        setServiceMemoryUsed(
          service_memory_used.length > 0 ? service_memory_used : defaultData
        );
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 判断严重和警告的阈值触发条件大小关系，严重的应该大于警告的
  // 但此处也有问题，因为阈值之前还可以选择比较关系，此处应该从产品设计上做更改，因为除了>=其他条件没啥必要，只会引起bug
  function isThresholdAccurate(data) {
    const invalidData = R.filter((item) => {
      const critical = R.find(R.propEq("level", "critical"), item) || {};
      const warning = R.find(R.propEq("level", "warning"), item) || {};
      return Number(critical.value) <= Number(warning.value);
    }, data);

    //判断级别不能相等
    const checkDataAgain = (data) => {
      let arr = Object.values(data).filter(item=>item.length==2);
      let result = arr.filter(item=>item[0].level==item[1].level);
      return result;
    };

    if (!R.isEmpty(invalidData)) {
      const type = R.values(invalidData)[0][0].index_type;
      message.warn(`请检查${type}的阈值触发规则，严重应该大于警告`);
    } else {
      if(checkDataAgain(data).length !== 0){
        const type = checkDataAgain(data)[0][0].index_type;
        message.warn(`请检查${type}的阈值触发规则，严重应该大于警告`);
        return; 
      }
      return true;
    }
  }

  return (
    <div>
      <Spin key={"threshold"} spinning={isLoading}>
        <Collapse
          bordered={false}
          defaultActiveKey={["machine", "service"]}
          style={{ marginTop: 10 }}
        >
          <Panel header="主机指标" key="machine" className={styles.panelItem}>
            <div className={styles.targetItemWrapper}>
              {machineTargetsMap.map((item, idx) => {
                return (
                  <TargetItem
                    handler={(val) => item.handler(val)}
                    key={`machine-${idx}`}
                    data={item}
                  />
                );
              })}
            </div>
            <SaveSettingsButtonGroup
              saveHandler={() => {
                const update_data = {
                  cpu_used: cpuUsed,
                  memory_used: memoryUsed,
                  disk_root_used: diskRootUsed,
                  disk_data_used: diskDataUsed,
                };
                // console.log(update_data);
                // 如果核验数据未通过，直接退出
                if (isThresholdAccurate(update_data)) {
                  setLoading(true);
                  fetchPut(apiRequest.systemSettings.hostThreshold, {
                    body: {
                      update_data: update_data,
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
                }
              }}
            />
          </Panel>
          <Panel header="服务指标" key="service" className={styles.panelItem}>
            <div className={styles.targetItemWrapper}>
              {serviceTargetsMap.map((item, idx) => {
                if (item.name === "service_active") {
                  //服务状态单独展示
                  const { name, info, conditionsArr, handler } = item;
                  return (
                    <div key={"service_active"} className={styles.targetItem}>
                      <div className={styles.itemTitle}>
                        <span>指标项</span>: {name}
                        <InfoTip text={info} />
                      </div>
                      <div
                        style={{ display: "inline-flex", flexFlow: "row wrap" }}
                      >
                        <div key={idx} className={styles.conditionItem}>
                          服务：
                          <Select
                            value={conditionsArr[0].condition}
                            placeholder={"请选择"}
                            style={{ width: 90, marginRight: 10 }}
                            onChange={(item) => {
                              const _clonedArr = R.clone(conditionsArr);
                              _clonedArr[idx] = R.assoc(
                                "condition",
                                item,
                                _clonedArr[idx]
                              );
                              handler(_clonedArr);
                            }}
                          >
                            <Option value="==">{"=="}</Option>
                          </Select>
                          <Select
                            value={conditionsArr[0].value}
                            placeholder={"请选择"}
                            style={{ width: 80, marginRight: 20 }}
                            onChange={(val) => {
                              const foo = R.clone(conditionsArr);
                              foo[idx] = R.assoc("value", val, foo[idx]);
                              handler(foo);
                            }}
                          >
                            <Option value="True">存活</Option>
                            <Option value="False">未存活</Option>
                          </Select>
                          级别：
                          <Select
                            value={conditionsArr[0].level}
                            placeholder={"请选择"}
                            style={{ width: 90, marginRight: 40 }}
                            onChange={(item) => {
                              const foo = R.clone(conditionsArr);
                              foo[idx] = R.assoc("level", item, foo[idx]);
                              handler(foo);
                            }}
                          >
                            <Option value="warning">警告</Option>
                            <Option value="critical">严重</Option>
                          </Select>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <TargetItem
                      key={item.name}
                      handler={(val) => item.handler(val)}
                      data={item}
                    />
                  );
                }
              })}
            </div>
            <SaveSettingsButtonGroup
              saveHandler={() => {
                const update_data = {
                  service_active: serviceActive,
                  service_cpu_used: serviceCpuUsed,
                  service_memory_used: serviceMemoryUsed,
                };

                // 不检查service_active，因为只有一项
                if (
                  isThresholdAccurate({
                    service_cpu_used: serviceCpuUsed,
                    service_memory_used: serviceMemoryUsed,
                  })
                ) {
                  setLoading(true);
                  fetchPut(apiRequest.systemSettings.serviceThreshold, {
                    body: {
                      update_data: update_data,
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
                }
              }}
            />
          </Panel>
        </Collapse>
      </Spin>
    </div>
  );
}

export default ThresholdSettings;
