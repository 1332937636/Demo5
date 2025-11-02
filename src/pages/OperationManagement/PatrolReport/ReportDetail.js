import styles from "@/pages/OperationManagement/index.less";
import {
  columnsConfig,
  formatTableRenderData,
  host_memory_top_columns,
  host_port_connectivity_columns,
  kafka_offsets_columns,
  kafka_partition_columns,
  kafka_topic_size_columns,
} from "@/utils/utils";
import { Card, Collapse, message, Table, BackTop, Icon, Drawer } from "antd";
import * as R from "ramda";
import React, { useEffect, useState } from "react";

const { Panel } = Collapse;

const reportColumnConfig = [
  { ...columnsConfig.report_service_name, className: styles._bigfontSize },
  { ...columnsConfig.report_host_ip, className: styles._bigfontSize },
  { ...columnsConfig.report_service_port, className: styles._bigfontSize },
  { ...columnsConfig.report_service_status, className: styles._bigfontSize },
  { ...columnsConfig.report_cpu_usage, className: styles._bigfontSize },
  { ...columnsConfig.report_mem_usage, className: styles._bigfontSize },
  { ...columnsConfig.report_run_time, className: styles._bigfontSize },
  { ...columnsConfig.report_log_level, className: styles._bigfontSize },
  { ...columnsConfig.report_cluster_name, className: styles._bigfontSize },
];

export default function ReportDetail({ data, title, download, hide }) {
  useEffect(() => {
    // 需求点：当报告展开时，点击左侧菜单要能隐藏报告
    // 实现方式：
    // 因为effects只会执行一次, 故要首次先获取一定存在的元素才能加点击事件，
    // 但如果菜单未展开，点击盒子直接关闭略显奇怪，故在点击时再次获取当前选中的menu item
    // 最后判断"返回" 元素和 当前menu展开，就收起报告

    // 坑：不知道为啥js获取的元素上无法直接调用到hide事件，所以只好迂回解决此问题

    // 左侧菜单wrapper
    const menuEl = document.getElementsByClassName("cw-menu")[0];

    function clickCallback() {
      // '返回'元素
      const idObject = document.getElementsByClassName("goBackElement")[0];
      // 当前所在的menu item
      const selectedMenuItem = document.getElementsByClassName(
        "ant-menu-item ant-menu-item-selected"
      )[0];

      if (idObject && selectedMenuItem) {
        idObject.click();
      }
    }

    if (menuEl) {
      menuEl.addEventListener("click", clickCallback, true);
      return menuEl.removeEventListener("click", clickCallback);
    }
  }, []);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerText, setDrawerText] = useState("");

  return (
    <div id="reportContent" className={styles.reportContent}>
      <div id={"invisible"}>
        <BackTop
          target={() => document.getElementsByClassName("cw-content")[0]}
        />
      </div>
      <div className={styles.reportTitle}>
        <div>{title}</div>
        <div>
          <div
            className={"goBackElement"}
            id={"invisible"}
            onClick={() => hide()}
          >
            返回
          </div>
          <div
            id={"invisible"}
            onClick={() => {
              message.success("正在生成pdf，请稍等");
              download();
            }}
          >
            导出
          </div>
        </div>
      </div>
      <div>
        <Collapse
          bordered={false}
          defaultActiveKey={[
            "overview",
            "risk",
            "map",
            "host",
            "database",
            "component",
            "service",
          ]}
          style={{ marginTop: 10 }}
        >
          <Panel header="概述信息" key="overview" className={styles.panelItem}>
            <div className={styles.overviewItemWrapper}>
              <OverviewItem data={data.summary.task_info} type={"task_info"} />
              <OverviewItem data={data.summary.time_info} type={"time_info"} />
              <OverviewItem data={data.summary.scan_info} type={"scan_info"} />
              <OverviewItem
                data={data.summary.scan_result}
                type={"scan_result"}
              />
            </div>
          </Panel>

          {/* risks存在，且内部数据任一不为空才显示风险指标一栏 */}
          {data.risks &&
            (!R.isEmpty(data.risks.host_list) ||
              !R.isEmpty(data.risks.service_list)) && (
              <Panel header="风险指标" key="risk" className={styles.panelItem}>
                {data.risks.host_list.length > 0 && (
                  <Table
                    style={{ marginTop: 20 }}
                    size={"small"}
                    pagination={false}
                    rowKey={(record, index) => index}
                    columns={[
                      {
                        ...columnsConfig.report_idx,
                        className: styles._bigfontSize,
                      },
                      {
                        ...columnsConfig.report_host_ip,
                        className: styles._bigfontSize,
                      },
                      {
                        ...columnsConfig.report_system,
                        className: styles._bigfontSize,
                      },
                      {
                        ...columnsConfig.report_risk_level,
                        className: styles._bigfontSize,
                      },
                      {
                        ...columnsConfig.report_risk_describe,
                        className: styles._bigfontSize,
                      },
                      {
                        ...columnsConfig.report_resolve_info,
                        className: styles._bigfontSize,
                      },
                    ]}
                    title={() => "主机指标"}
                    dataSource={data.risks.host_list}
                  />
                )}
                {data.risks.service_list.length > 0 && (
                  <Table
                    style={{ marginTop: 20 }}
                    size={"small"}
                    pagination={false}
                    rowKey={(record, index) => index}
                    columns={[
                      {
                        ...columnsConfig.report_idx,
                        className: styles._bigfontSize,
                      },
                      {
                        ...columnsConfig.report_service_name,
                        className: styles._bigfontSize,
                      },
                      {
                        ...columnsConfig.report_host_ip,
                        className: styles._bigfontSize,
                      },
                      {
                        ...columnsConfig.report_service_port,
                        className: styles._bigfontSize,
                      },
                      {
                        ...columnsConfig.report_risk_level,
                        className: styles._bigfontSize,
                      },
                      {
                        ...columnsConfig.report_risk_describe,
                        className: styles._bigfontSize,
                      },
                      {
                        ...columnsConfig.report_resolve_info,
                        className: styles._bigfontSize,
                      },
                    ]}
                    title={() => "服务指标"}
                    dataSource={data.risks.service_list}
                  />
                )}
              </Panel>
            )}

          {!R.either(R.isNil, R.isEmpty)(data.service_topology) && (
            <Panel header="服务平面图" key="map" className={styles.panelItem}>
              <div
                style={{ display: "flex", flexFlow: "row wrap", margin: 10 }}
              >
                {R.addIndex(R.map)((item, index) => {
                  return (
                  <PlanChart
                    key={index}
                    title={item.host_ip}
                    list={item.service_list}
                    data={data}
                  />
                  );
                }, data.service_topology)}
              </div>
            </Panel>
          )}

          {!R.either(R.isNil, R.isEmpty)(data.detail_dict.host) && (
            <Panel header="主机列表" key="host" className={styles.panelItem}>
              <Table
                //rowClassName={()=>{return styles.didingyi;}}
                size={"small"}
                style={{ marginTop: 20 }}
                scroll={{ x: 1100 }}
                pagination={false}
                rowKey={(record, index) => index}
                // defaultExpandAllRows
                columns={[
                  {
                    ...columnsConfig.report_idx,
                    className: styles._bigfontSize,
                  },
                  {
                    ...columnsConfig.report_host_ip,
                    className: styles._bigfontSize,
                  },
                  {
                    ...columnsConfig.report_release_version,
                    className: styles._bigfontSize,
                  },
                  {
                    ...columnsConfig.report_host_massage,
                    className: styles._bigfontSize,
                  },
                  {
                    ...columnsConfig.report_cpu_usage,
                    className: styles._bigfontSize,
                  },
                  {
                    ...columnsConfig.report_mem_usage,
                    className: styles._bigfontSize,
                  },
                  {
                    ...columnsConfig.report_disk_usage_root,
                    className: styles._bigfontSize,
                  },
                  {
                    ...columnsConfig.report_disk_usage_data,
                    className: styles._bigfontSize,
                  },
                  {
                    ...columnsConfig.report_run_time,
                    className: styles._bigfontSize,
                  },
                  {
                    ...columnsConfig.report_sys_load,
                    className: styles._bigfontSize,
                  },
                ]}
                expandedRowRender={(...arg)=>RenderExpandedContent(...arg,drawerVisible, setDrawerVisible,drawerText, setDrawerText)}
                dataSource={data.detail_dict.host}
              />
            </Panel>
          )}

          {!R.either(R.isNil, R.isEmpty)(data.detail_dict.database) && (
            <Panel
              header="数据库列表"
              key="database"
              className={styles.panelItem}
            >
              <Table
                size={"small"}
                style={{ marginTop: 20 }}
                pagination={false}
                rowKey={(record, index) => index}
                // defaultExpandAllRows
                columns={reportColumnConfig}
                expandedRowRender={(...arg)=>RenderExpandedContent(...arg,drawerVisible, setDrawerVisible,drawerText, setDrawerText)}
                dataSource={data.detail_dict.database}
              />
            </Panel>
          )}

          {!R.either(R.isNil, R.isEmpty)(data.detail_dict.component) && (
            <Panel
              header="组件列表"
              key="component"
              className={styles.panelItem}
            >
              <Table
                size={"small"}
                style={{ marginTop: 20 }}
                pagination={false}
                rowKey={(record, index) => index}
                // defaultExpandAllRows
                columns={reportColumnConfig}
                expandedRowRender={(...arg)=>RenderExpandedContent(...arg,drawerVisible, setDrawerVisible,drawerText, setDrawerText)}
                dataSource={data.detail_dict.component}
              />
            </Panel>
          )}

          {!R.either(R.isNil, R.isEmpty)(data.detail_dict.service) && (
            <Panel header="服务列表" key="service" className={styles.panelItem}>
              <Table
                size={"small"}
                style={{ marginTop: 20 }}
                pagination={false}
                rowKey={(record, index) => index}
                // defaultExpandAllRows
                columns={reportColumnConfig}
                expandedRowRender={(...arg)=>RenderExpandedContent(...arg,drawerVisible, setDrawerVisible,drawerText, setDrawerText)}
                dataSource={data.detail_dict.service}
              />
            </Panel>
          )}
        </Collapse>
      </div>
    </div>
  );
}

function formatTime(text = 0) {
  let duration = text;
  const second = Math.round(Number(text)),
    days = Math.floor(second / 86400),
    hours = Math.floor((second % 86400) / 3600),
    minutes = Math.floor(((second % 86400) % 3600) / 60),
    seconds = Math.floor(((second % 86400) % 3600) % 60);

  if (days > 0) {
    duration = days + "天" + hours + "小时" + minutes + "分" + seconds + "秒";
  } else if (hours > 0) {
    duration = hours + "小时" + minutes + "分" + seconds + "秒";
  } else if (minutes > 0) {
    duration = minutes + "分" + seconds + "秒";
  } else if (seconds > 0) {
    duration = seconds + "秒";
  }

  return duration;
}

// 概览信息
function OverviewItem({ data, type }) {
  switch (type) {
    case "task_info":
      return (
        <div className={styles.overviewItem}>
          <div>任务信息</div>
          <div>
            <div>任务名称：{data.task_name}</div>
            <div>操作人员：{data.operator}</div>
            <div>任务状态：{data.task_status === 2 ? "已完成" : "失败"}</div>
          </div>
        </div>
      );
    case "time_info":
      return (
        <div className={styles.overviewItem}>
          <div>时间统计</div>
          <div>
            <div>开始时间：{data.start_time}</div>
            <div>结束时间：{data.end_time}</div>
            <div>任务耗时：{formatTime(data.cost)}</div>
          </div>
        </div>
      );
    case "scan_info":
      return (
        <div className={styles.overviewItem}>
          <div>扫描统计</div>
          <div>
            {data.host > 0 && <div>主机个数：{data.host}台</div>}
            {data.component > 0 && <div>组件个数：{data.component}个</div>}
            {data.service > 0 && <div>服务个数：{data.service}个</div>}
          </div>
        </div>
      );
    case "scan_result":
      return (
        <div className={styles.overviewItem}>
          <div>分析结果</div>
          <div>
            <div>总指标数：{data.all_target_num}</div>
            <div>异常指标：{data.abnormal_target}</div>
            <div>健康度：{data.healthy}</div>
          </div>
        </div>
      );
  }
}

//平面图
function PlanChart({ title, list, data }) {
  return (
    <div className={styles.planChartWrapper}>
      <div className={styles.planChartTitle}><span className={styles.planChartTitleCircular} />{title}</div>
      <div className={styles.planChartBlockWrapper}>
        {list.map(item=>{
          return (
            <div
            className={styles.stateButton}
            key={item}
          >
            <div>{item}</div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

// 拓扑图
function TopologyChart({ title, list }) {
  return (
    <div className={styles.topologyWrapper}>
      <div className={styles.rootItemBox}>
        <div
          style={{ fontWeight: "bold", height: 45 }}
          className={styles.topologyItem}
        >
          {title}
        </div>
        <span className={styles.connectLine} />
      </div>

      <div className={styles.topologyChildren}>
        <div>
          <div className={styles.verticalLine} />
          {list.map((item, idx) => {
            return (
              <div key={idx} className={styles.rootItemBox}>
                <span className={styles.connectLine} />
                <div key={idx} className={styles.topologyItem}>
                  {item}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Table渲染的子项
// 注：此处需要针对特殊属性渲染额外效果，故将已在table渲染过的属性单独拿出来
function RenderExpandedContent({
  basic,
  host_ip,
  service_status,
  run_time,
  log_level,
  mem_usage,
  cpu_usage,
  service_name,
  service_port,
  cluster_name,
  release_version,
  host_massage,
  disk_usage_root,
  disk_usage_data,
  sys_load,
  ...specialProps
},...arg) {
  const { topic_partition, kafka_offsets, topic_size } = specialProps;

  let [drawerVisible, setDrawerVisible, drawerText, setDrawerText] = arg.slice(-4);
  // console.log(specialProps);

  // const formattedData = R.compose(
  //   R.map(([key, value]) => ({ key, value })),
  //   R.toPairs
  // )(specialProps);

  // 将数据格式化为[[key, value], [key, value]]的形式，便于渲染
  const formattedData = Object.entries(specialProps).filter((item) =>
    Array.isArray(item[1])
  );

  /* eslint-disable */
  let deal_host_memory_top_columns = [
    {
      title: "TOP",
      dataIndex: "TOP",
      //ellipsis: true,
      width: 50,
      className:styles._bigfontSize
    },
    {
      title: "PID",
      dataIndex: "PID",
      //ellipsis: true,
      align: "center",
      width: 100,
      className:styles._bigfontSize
    },
    {
      title: "使用率",
      dataIndex: "P_RATE",
      //ellipsis: true,
      align: "center",
      width: 100,
      className:styles._bigfontSize
    },
    {
      title: "进程",
      dataIndex: "P_CMD",
      ellipsis: true,
      className:styles._bigfontSize,
      render:(text)=>{
        return <span style={{cursor:"pointer"}} onClick={()=>{setDrawerText(text);setDrawerVisible(true)}}>{text}</span>;
      }
    },
  ];
  /* eslint-disable */
  const contentMap = {
    // 主机列表
    port_connectivity: {
      columns: host_port_connectivity_columns,
      dataSource: specialProps.port_connectivity,
      title: "端口连通性",
    },
    memory_top: {
      columns: deal_host_memory_top_columns ,
      dataSource: specialProps.memory_top,
      title: "内存使用率Top10进程",
    },
    cpu_top: {
      columns: deal_host_memory_top_columns ,
      dataSource: specialProps.cpu_top,
      title: "cpu使用率Top10进程",
    },
    kernel_parameters: {
      columns: [],
      dataSource: specialProps.kernel_parameters,
      title: "内核参数",
    },
    //  服务列表
    topic_partition: {
      columns: kafka_partition_columns,
      dataSource: specialProps.topic_partition,
      title: "分区信息",
    },
    kafka_offsets: {
      columns: kafka_offsets_columns,
      dataSource: specialProps.kafka_offsets,
      title: "消费位移信息",
    },
    topic_size: {
      columns: kafka_topic_size_columns,
      dataSource: specialProps.topic_size,
      title: "Topic消息大小",
    },
  };

  return (
    <div className={styles.expandedRowWrapper}>
      {Array.isArray(basic) && <BasicCard basic={basic} />}
      {formattedData.length > 0 && (
        <Collapse
          defaultActiveKey={R.keys(specialProps)}
          style={{ marginTop: 10 }}
        >
          {formattedData.map((item, idx) => {
            // 根据当前渲染项，找到对应的content配置数据
            const currentContent = contentMap[item[0]];

            // 只取目前已经配置了的数据
            if (!R.isNil(currentContent)) {
              return (
                <Panel header={currentContent.title} key={item[0]}>
                  {currentContent.columns.length > 0 ? (
                    <Table
                      rowKey={(record, index) => index}
                      size={"small"}
                      columns={currentContent.columns}
                      dataSource={currentContent.dataSource}
                      pagination={false}
                    />
                  ) : (
                    <div className={styles.basicCardWrapper}>
                      {currentContent.dataSource.map((item, idx) => {
                        return (
                          <div key={idx} className={styles.basicCardItem}>
                            {item}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Panel>
              );
            } else {
              //   todo 其他数据项
              console.log("未配置的数据项", item);
            }
          })}
        </Collapse>
      )}
      <Drawer
        title="进程日志"
        placement="right"
        closable={false}
        onClose={()=>setDrawerVisible(false)}
        visible={drawerVisible}
        width={720}
        destroyOnClose
      >
        {drawerText}
      </Drawer>
    </div>
  );
}

// 卡片面板
function BasicCard({ basic }) {
  return (
    <Card>
      <div className={styles.basicCardWrapper}>
        {basic.map((item, idx) => (
          <div key={idx} className={styles.basicCardItem}>
            <span style={{ color: "#333" }}>{item.name_cn}: </span>
            <span>{formatTableRenderData(JSON.stringify(item.value))}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
