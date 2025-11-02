import { apiRequest } from "@/config/requestApi";
import { fetchGet } from "@/utils/request";
import { handleResponse } from "@/utils/utils";
import {
  Progress,
  Spin,
  message,
} from "antd";
import React, { useEffect, useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import styles from "./index.less";
import OmpStateBlock from "@/components/OmpStateBlock";
import { context } from "@/Root";

function calcPercentage(abnormal = 0, total = 1) {
  const percent = (((total - abnormal) / total) * 100).toFixed(0);
  return isNaN(Number(percent)) ? 100 : Number(percent);
}

const Homepage = () => {
  const appContext = useContext(context);
  const history = useHistory();

  const [isLoading, setLoading] = useState(false);
  const [hostData, setHostData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [componentData, setComponentData] = useState([]);
  const [databaseData, setDatabaseData] = useState([]);
  const [externalData, setExternalData] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      fetchGet(apiRequest.homepage.host),
      fetchGet(apiRequest.homepage.service),
      fetchGet(apiRequest.homepage.component),
      fetchGet(apiRequest.homepage.database),
      fetchGet(apiRequest.homepage.external)
    ])
      .then(
        ([hostDataRes, serviceDataRes, componentDataRes, databaseDataRes, externalDataRes]) => {
          if (hostDataRes.status === "fulfilled") {
            // 当登陆过期时，不再执行后续几个请求，防止弹多次错误提示
            // 出现此问题的原因是项目中所有的接口都没有错误返回，目的就是让客户不看见错误。。。？
            // 约定了code值不为0时代表有问题，3代表登陆过期
            // 这样的话所有的catch其实没啥用，代码也不会在遇到第一个错误时退出执行
            if (hostDataRes.value.code === 3) {
              message.warn("登录已过期，请重新登录");

              localStorage.clear();
              window.__history__.replace("/login");
              return;
            }

            // 当用户配置了错误的prometheus地址时，首页接口都会报错
            // 为了只弹一次错误，增加此判断
            if (
              hostDataRes.value.code === 1 &&
              hostDataRes.value.message.includes("请确定Prometheus")
            ) {
              if(!appContext.state.value){
                message.warn(hostDataRes.value.message);
              }
              return;
            }
            handleResponse(hostDataRes.value, () => {
              //console.log(hostDataRes.value.data);
              setHostData(hostDataRes.value.data);
            });
          }
          if (serviceDataRes.status === "fulfilled") {
            handleResponse(serviceDataRes.value, () => {
              setServiceData(serviceDataRes.value.data);
            });
          }
          if (componentDataRes.status === "fulfilled") {
            handleResponse(componentDataRes.value, () => {
              setComponentData(componentDataRes.value.data);
            });
          }
          if (databaseDataRes.status === "fulfilled") {
            handleResponse(databaseDataRes.value, () => {
              setDatabaseData(databaseDataRes.value.data);
            });
          }
          if (externalDataRes.status === "fulfilled") {
            //外部组件数据请求成功
            //console.log("新接口请求成功",externalDataRes);
            setExternalData(externalDataRes.value.data);
          }
        }
      )
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.homepageWrapper}>
      <Spin spinning={isLoading}>
        <div className={styles.pageBlock}>
          <div className={styles.blockTitle}>状态概览</div>
          <div
            style={{
              display: "flex",
              flexFlow: "row wrap",
              justifyContent: "space-around",
            }}
            className={styles.blockContent}
          >
            <div className={styles.blockOverviewItem}>
              <Progress
                type="circle"
                percent={calcPercentage(
                  serviceData.abnormal_num,
                  serviceData.service_num
                )}
                strokeColor="#54bba6"
                trailColor="#ee686e"
                format={(percent) => {
                  return <span style={{color:percent==100?"#54bba6":(percent==0?"#ee686e":null)}}>{percent}%</span>;
                }}
              />
              <div className={styles.progressInfo}>
                <div>自有服务状态</div>
                <div
                  onClick={() => serviceData.service_num && history.push(
                    {
                      pathname:"/products-management/service",
                      state: {
                        key:"all"
                      },
                    }
                  )}
                  style={serviceData.service_num ? { cursor: "pointer" }:{}}
                >
                  服务总数：
                  <span style={serviceData.service_num ? { color: "#1890ff" }:{}}>
                    {serviceData.service_num}个
                  </span>
                </div>
                <div
                  style={
                    serviceData.abnormal_num > 0 ? { cursor: "pointer" } : {}
                  }
                  onClick={() =>
                    serviceData.abnormal_num > 0 &&
                    history.push({
                      pathname: "/operation-management/warnings",
                      state: {
                        defaultList: "service",
                        key:"all"
                      },
                    })
                  }
                >
                  异常服务：
                  <span
                    style={
                      serviceData.abnormal_num > 0 ? { color: "#cf1322" } : {}
                    }
                  >
                    {serviceData.abnormal_num}个
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.blockOverviewItem}>
              <Progress
                type="circle"
                percent={calcPercentage(
                  componentData.abnormal_num,
                  componentData.service_num
                )}
                strokeColor="#54bba6"
                trailColor="#ee686e"
                format={(percent) => <span style={{color:percent==100?"#54bba6":(percent==0?"#ee686e":null)}}>{percent}%</span>}
              />
              <div className={styles.progressInfo}>
                <div>自有组件状态</div>
                <div
                  onClick={() => componentData.service_num && history.push(
                    {
                      pathname:"/products-management/service",
                      state: {
                        key:"basic"
                      },
                    }
                  )}
                  style={componentData.service_num ? { cursor: "pointer" }:{}}
                >
                  组件实例：
                  <span style={componentData.service_num ? { color: "#1890ff" }:{}}>
                    {componentData.service_num}个
                  </span>
                </div>
                <div
                  style={
                    componentData.abnormal_num > 0 ? { cursor: "pointer" } : {}
                  }
                  onClick={() =>
                    componentData.abnormal_num > 0 &&
                    history.push({
                      pathname: "/operation-management/warnings",
                      state: {
                        defaultList: "service",
                        key:"basic"
                      },
                    })
                  }
                >
                  异常实例：
                  <span
                    style={
                      componentData.abnormal_num > 0 ? { color: "#cf1322" } : {}
                    }
                  >
                    {componentData.abnormal_num}个
                  </span>
                </div>
              </div>
            </div>
            <div
              style={{ marginRight: 0 }}
              className={styles.blockOverviewItem}
            >
              <Progress
                type="circle"
                percent={calcPercentage(
                  externalData.abnormal_num,
                  externalData.service_num
                )}
                strokeColor="#54bba6"
                trailColor="#ee686e"
                format={(percent) => <span style={{color:percent==100?"#54bba6":(percent==0?"#ee686e":null)}}>{percent}%</span>}
              />
              <div className={styles.progressInfo}>
                <div>三方组件状态</div>
                <div
                  style={externalData.service_num > 0 ? { cursor: "pointer" }:{}}
                  onClick={() => externalData.service_num && history.push(
                    {
                      pathname: "/products-management/service",
                      state: {
                        key:"thirdParty"
                      },
                    }
                  )} //带替换
                >
                  组件实例：
                  <span style={externalData.service_num > 0 ? { color: "#1890ff" }:{}}>
                    {externalData.service_num}个     
                  </span>
                </div>
                <div
                  style={externalData.abnormal_num > 0 ? { cursor: "pointer" } : {}}  
                  onClick={() =>
                    externalData.abnormal_num > 0 &&
                    history.push(
                      {
                        pathname: "/operation-management/warnings",
                        state: {
                          key:"thirdParty"
                        },
                      }
                    )
                  }
                >
                  异常个数：
                  <span
                    style={
                      externalData.abnormal_num > 0 ? { color: "#cf1322" } : {} 
                    }
                  >
                    {externalData.abnormal_num}个
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.blockOverviewItem}>
              <Progress
                type="circle"
                percent={calcPercentage(
                  databaseData.abnormal_num,
                  databaseData.service_num
                )}
                strokeColor="#54bba6"
                trailColor="#ee686e"
                format={(percent) => <span style={{color:percent==100?"#54bba6":(percent==0?"#ee686e":null)}}>{percent}%</span>}
              />
              <div className={styles.progressInfo}>
                <div>数据库状态</div>
                <div
                  style={ databaseData.service_num?{ cursor: "pointer" }:{}}
                  onClick={() => databaseData.service_num && history.push(
                    {
                      pathname: "/products-management/service",
                      state: {
                        key:"database"
                      },
                    }
                  )}
                >
                  数据库实例：
                  <span style={databaseData.service_num?{ color: "#1890ff" }:{}}>
                    {databaseData.service_num}个
                  </span>
                </div>
                <div
                  style={
                    databaseData.abnormal_num > 0 ? { cursor: "pointer" } : {}
                  }
                  onClick={() =>
                    databaseData.abnormal_num > 0 &&
                    history.push({
                      pathname: "/operation-management/warnings",
                      state: {
                        defaultList: "service",
                        key:"database"
                      },
                    })
                  }
                >
                  异常实例：
                  <span
                    style={
                      databaseData.abnormal_num > 0 ? { color: "#cf1322" } : {}
                    }
                  >
                    {databaseData.abnormal_num}个
                  </span>
                </div>
              </div>
            </div>
            <div
              style={{ marginRight: 0 }}
              className={styles.blockOverviewItem}
            >
              <Progress
                type="circle"
                percent={calcPercentage(
                  hostData.abnormal_num,
                  hostData.host_num
                )}
                strokeColor="#54bba6"
                trailColor="#ee686e"
                format={(percent) => <span style={{color:percent==100?"#54bba6":(percent==0?"#ee686e":null)}}>{percent}%</span>}
              />
              <div className={styles.progressInfo}>
                <div>主机状态</div>
                <div
                  style={hostData.host_num?{ cursor: "pointer" }:{}}
                  onClick={() => hostData.host_num && history.push("/machine-management/list")}
                >
                  主机总数：
                  <span style={hostData.host_num?{ color: "#1890ff" }:{}}>
                    {hostData.host_num}台
                  </span>
                </div>
                <div
                  style={hostData.abnormal_num > 0 ? { cursor: "pointer" } : {}}
                  onClick={() =>
                    hostData.abnormal_num > 0 &&
                    history.push("/operation-management/warnings")
                  }
                >
                  异常主机：
                  <span
                    style={
                      hostData.abnormal_num > 0 ? { color: "#cf1322" } : {}
                    }
                  >
                    {hostData.abnormal_num}台
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.pageBlock}>
          <OmpStateBlock
            key={"serviceData"}
            tag={"all"}
            title={"自有服务状态"}
            data={serviceData.service_detail}
          />
        </div>

        <div className={styles.pageBlock}>
          {/* <div className={styles.blockTitle}>自有组件状态</div> */}
          <OmpStateBlock
            key={"componentData"}
            tag={"basic"}
            title={"自有组件状态"}
            data={componentData.service_detail}
          />
        </div>

        <div className={styles.pageBlock}>
          {/* <div className={styles.blockTitle}>三方组件状态</div> */}
          <OmpStateBlock
            key={"externalData"}
            tag={"thirdParty"}
            title={"三方组件状态"}
            data={externalData.service_detail}
          />
        </div>

        <div className={styles.pageBlock}>
          {/* <div className={styles.blockTitle}>数据库状态</div> */}
          <OmpStateBlock
            key={"databaseData"}
            tag={"database"}
            title={"数据库状态"}
            data={databaseData.service_detail}
          />
        </div>

        <div className={styles.pageBlock}>
          {/* <div className={styles.blockTitle}>主机状态</div> */}
          <OmpStateBlock
            key={"hostData"}
            tag={"hostData"}
            title={"主机状态"}
            data={hostData.host_detail}
          />
        </div>

      </Spin>
    </div>
  );
};

export default Homepage;
