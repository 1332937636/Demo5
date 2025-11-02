import { TableRowButton } from "@/components";
import { apiRequest } from "@/config/requestApi";
import ContentNav from "@/layouts/ContentNav";
import ContentWrapper from "@/layouts/ContentWrapper";
import { fetchGet } from "@/utils/request";
import {
  columnsConfig,
  handleResponse,
  paginationConfig,
  tableButtonHandler,
  _idxInit,
} from "@/utils/utils";
import {
  AutoComplete,
  Icon,
  Input,
  Spin,
  Table,
  Button,
  Select,
  Tooltip,
} from "antd";
import * as R from "ramda";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import styles from "../index.less";
/*eslint-disable*/
function WarningList() {
  const location = useLocation();
  const history = useHistory();
  const locationIpState = R.call(() => {
    if (!location.state) return "";

    // 路由携带IP、服务名称作为查询条件，不会存在两种查询同时存在
    const { host_ip, service_name } = location.state;

    if (host_ip) {
      return host_ip;
    }
    // else if (service_name) {
    //   return service_name;
    // }
    else {
      return "";
    }
  });

  const locationState = R.call(() => {
    if (!location.state) return "";

    // 路由携带IP、服务名称作为查询条件，不会存在两种查询同时存在
    const { host_ip, service_name } = location.state;

    // if (host_ip) {
    //   return host_ip;
    // } else
    if (service_name) {
      return service_name;
    } else {
      return "";
    }
  });

  const [isLoading, setLoading] = useState(false);
  const [currentList, setCurrentList] = useState("host");
  const [hostData, setHostData] = useState([]);
  //自研服务
  const [serviceData, setServiceData] = useState([]);
  // 三方组件dataSource
  const [thirdPartyData, setThirdPartyData] = useState([]);
  // 自有组件dataSource
  const [basicData, setBasicData] = useState([]);
  // 数据库
  const [databaseData, setDatabaseData] = useState([]);

  const [searchData, setSearchData] = useState([]);
  const [searchIpValue, setSearchIpValue] = useState(locationIpState);

  //功能模块筛选
  const [searchModalValue, setSearchModalValue] = useState("");

  const [searchValue, setSearchValue] = useState(locationState);

  //筛选框label
  const [searchBarController, setSearchBarController] = useState("ip");

  const contentNavData = [
    {
      name: "host",
      text: "主机异常",
      handler: () => {
        if (currentList !== "host") {
          setSearchIpValue("");
          setSearchValue("");
          setSearchData([]);
          setCurrentList("host");
          setSearchBarController("ip");
        }
      },
    },
    {
      name: "self_dev",
      text: "自有服务",
      handler: () => {
        if (currentList !== "self_dev") {
          setSearchIpValue("");
          setSearchValue("");
          setSearchData([]);
          setCurrentList("self_dev");
          setSearchBarController("service_name");
        }
      },
    },
    {
      name: "component",
      text: "自有组件",
      handler: () => {
        if (currentList !== "component") {
          setSearchIpValue("");
          setSearchValue("");
          setSearchData([]);
          setCurrentList("component");
          setSearchBarController("service_name");
        }
      },
    },
    {
      name: "thirdParty",
      text: "三方组件",
      handler: () => {
        if (currentList !== "thirdParty") {
          setSearchIpValue("");
          setSearchValue("");
          setSearchData([]);
          setCurrentList("thirdParty");
          setSearchBarController("service_name");
        }
      },
    },
    {
      name: "database",
      text: "数据库",
      handler: () => {
        if (currentList !== "database") {
          setSearchIpValue("");
          setSearchValue("");
          setSearchData([]);
          setCurrentList("database");
          setSearchBarController("service_name");
        }
      },
    },
  ];

  const selfColumnsService = [
    columnsConfig.service_idx,
    columnsConfig.alert_service_type,
    columnsConfig.alert_service_name,
    columnsConfig.alert_host_ip,
    columnsConfig.alert_level,
    columnsConfig.alert_time,
    columnsConfig.alert_describe,
    // columnsConfig.alert_receiver,
    // columnsConfig.alert_resolve,
    {
      title: "操作",
      key: "操作service",
      dataIndex: "",
      render: function renderFunc(text, record, index) {
        return (
          <TableRowButton
            buttonsArr={[
              {
                btnText: "监控",
                btnHandler: () => tableButtonHandler(record),
              },
              // {
              //   btnText: "分析",
              //   btnHandler: () => history.push("/operation-management/report"),
              // },
              {
                btnText: "日志",
                btnHandler: () => tableButtonHandler(record, "log"),
              },
            ]}
          />
        );
      },
      width: 150,
      align: "center",
      fixed: "right",
    },
  ];

  const basicColumnsService = [
    columnsConfig.service_idx,
    //columnsConfig.alert_service_type,
    {...columnsConfig.alert_service_name,
      title:"组件名称"
    },
    columnsConfig.alert_host_ip,
    columnsConfig.alert_level,
    columnsConfig.alert_time,
    columnsConfig.alert_describe,
    // columnsConfig.alert_receiver,
    // columnsConfig.alert_resolve,
    {
      title: "操作",
      key: "操作service",
      dataIndex: "",
      render: function renderFunc(text, record, index) {
        return (
          <TableRowButton
            buttonsArr={[
              {
                btnText: "监控",
                btnHandler: () => tableButtonHandler(record),
              },
              // {
              //   btnText: "分析",
              //   btnHandler: () => history.push("/operation-management/report"),
              // },
              {
                btnText: "日志",
                btnHandler: () => tableButtonHandler(record, "log"),
              },
            ]}
          />
        );
      },
      width: 150,
      align: "center",
      fixed: "right",
    },
  ]

  const columnsService = [
    columnsConfig.service_idx,
    //columnsConfig.alert_service_type,
    columnsConfig.alert_service_name,
    columnsConfig.alert_host_ip,
    columnsConfig.alert_level,
    columnsConfig.alert_time,
    columnsConfig.alert_describe,
    // columnsConfig.alert_receiver,
    // columnsConfig.alert_resolve,
    {
      title: "操作",
      key: "操作service",
      dataIndex: "",
      render: function renderFunc(text, record, index) {
        return (
          <TableRowButton
            buttonsArr={[
              {
                btnText: "监控",
                btnHandler: () => tableButtonHandler(record),
              },
              // {
              //   btnText: "分析",
              //   btnHandler: () => history.push("/operation-management/report"),
              // },
              {
                btnText: "日志",
                btnHandler: () => tableButtonHandler(record, "log"),
              },
            ]}
          />
        );
      },
      width: 150,
      align: "center",
      fixed: "right",
    },
  ];

  const columnsHost = [
    columnsConfig.service_idx,
    columnsConfig.alert_host_ip,
    // columnsConfig.alert_host_system,
    columnsConfig.alert_level,
    columnsConfig.alert_time,
    columnsConfig.alert_describe,
    // columnsConfig.alert_receiver,
    // columnsConfig.alert_resolve,
    {
      title: "操作",
      key: "操作",
      dataIndex: "",
      render: function renderFunc(text, record, index) {
        return (
          <TableRowButton
            buttonsArr={[
              {
                btnText: "监控",
                btnHandler: () => tableButtonHandler(record),
              },
              {
                btnText: "分析",
                btnHandler: () => history.push("/operation-management/report"),
              },
            ]}
          />
        );
      },
      width: 150,
      align: "center",
      fixed: "right",
    },
  ];

  const columnsThirdParty = [
    columnsConfig.service_idx,
    // columnsConfig.alert_service_type,
    //columnsConfig.service_name,
    {
      ...columnsConfig.service_name,
      title:"组件名称"
    },
    columnsConfig.ip,
    columnsConfig.alert_level,
    columnsConfig.alert_time,
    {
      title: "告警描述",
      key: "alert_describe",
      dataIndex: "alert_describe",
      width: 250,
      align: "center",
      ellipsis: true,
      render: (text, record, index) => {
        if (record.state_info && record.state_info.length > 0) {
          return (
            <>
              {record.state_info.map((item, idx) => {
                return (
                  <div key={item.ip}>
                    <Tooltip
                      title={item.describe}
                      placement={
                        idx == 0
                          ? "top"
                          : idx == record.state_info.length - 1
                          ? "bottom"
                          : "left"
                      }
                    >
                      <div
                        style={{
                          display: "block",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.describe}
                      </div>
                    </Tooltip>
                  </div>
                );
              })}
            </>
          );
        } else {
          return "-";
        }
      },
    },
    // columnsConfig.alert_receiver,
    // columnsConfig.alert_resolve,
    // {
    //   title: "操作",
    //   key: "操作service",
    //   dataIndex: "",
    //   render: function renderFunc(text, record, index) {
    //     return (
    //       <TableRowButton
    //         buttonsArr={[
    //           {
    //             btnText: "监控",
    //             btnHandler: () => tableButtonHandler(record),
    //           },
    //           {
    //             btnText: "分析",
    //             btnHandler: () => history.push("/operation-management/report"),
    //           },
    //         ]}
    //       />
    //     );
    //   },
    //   width: 150,
    //   align: "center",
    //   fixed: "right",
    // },
  ];

  const contentMap = {
    host: {
      columns: columnsHost,
      data: hostData,
    },
    self_dev: {
      columns: selfColumnsService,
      data: serviceData,
    },
    component: {
      columns: basicColumnsService,
      data: basicData,
    },
    thirdParty: {
      columns: columnsThirdParty,
      data: thirdPartyData,
    },
    database: {
      columns: columnsService,
      data: databaseData,
    },
  };

  const currentPageData = contentMap[currentList].data;

  const datasourceIp = Array.from(
    new Set(
      R.flatten(
        R.map(
          (item) =>
            R.values(
              R.pick(
                [currentList == "thirdParty" ? "ip" : "alert_host_ip"],
                item
              )
            ),
          currentPageData
        )
      )
    ).filter(i=>i&&i)
  );

  const datasource = Array.from(
    new Set(
      R.flatten(
        R.map(
          (item) =>
            R.values(
              R.pick(
                [
                  currentList == "thirdParty"
                    ? "service_name"
                    : "alert_service_name",
                ],
                item
              )
            ),
          currentPageData
        )
      )
    ).filter(i=>i&&i)
  );
  
  const datasourceModal = Array.from(
    new Set(
      R.flatten(
        R.map(
          (item) => R.values(R.pick(["alert_service_type"], item)),
          currentPageData
        )
      )
      // (()=>currentPageData.map(item=>{
      //   //console.log(item);
      //   if(item){
      //     return item.alert_service_type;
      //   }
      // }))()
    ).filter(i=>i&&i)
  );

  const queryData = () => {
    setLoading(true);
    fetchGet(apiRequest.operationManagement.alertList)
      .then((res) => {
        handleResponse(res, () => {
          if (res.data) {
            // eslint-disable-next-line max-nested-callbacks
            const host = _idxInit(
              res.data.filter((item) => item.alert_type === "host")
            );
            const service = res.data.filter(
              // eslint-disable-next-line max-nested-callbacks
              (item) => item.alert_type === "service"
            );

            const self_devData = _idxInit(
              service.filter(
                // eslint-disable-next-line max-nested-callbacks
                (item) => item.alert_service_en_type === "self_dev"
              )
            );

            const componentData = _idxInit(
              service.filter(
                // eslint-disable-next-line max-nested-callbacks
                (item) => item.alert_service_en_type === "component"
              )
            );

            const thirdPartyData = _idxInit(
              service.filter(
                // eslint-disable-next-line max-nested-callbacks
                (item) => item.alert_service_en_type === "external"
              )
            );

            const databaseData = _idxInit(
              service.filter(
                // eslint-disable-next-line max-nested-callbacks
                (item) => item.alert_service_en_type === "database"
              )
            );

            if (location.state && location.state.host_ip) {
              //console.log(contentMap[currentList]);
              setSearchBarController("ip");
              const result = R.filter(
                R.propEq("alert_host_ip", location.state.host_ip),
                host
              );
              //console.log(location.state.host_ip, host, result);
              setSearchData(result);
            }

            if (location.state && location.state.service_name) {
              setSearchBarController("service_name");
              //setCurrentList("service");
              const result = R.filter(
                R.propEq(
                  location.state.key == "thirdParty"
                    ? "service_name"
                    : "alert_service_name",
                  location.state.service_name
                ),
                service
              );
              // console.log(
              //   result,
              //   currentList,
              //   service,
              //   location.state.host_ip,
              //   currentList
              // );
              setSearchData(result);
            }

            // if (location.state && (location.state.service_name)) {
            //   //setCurrentList("service");
            //   const result = R.filter(
            //     R.propEq("alert_service_name",location.state.service_name),
            //     service
            //   );
            //   console.log(result,currentList,service,location.state.host_ip,currentList);
            //   setSearchData(result);
            // }
            //console.log(host, "-----");
            setHostData(host);
            setServiceData(self_devData);
            setThirdPartyData(thirdPartyData);
            setBasicData(componentData);
            setDatabaseData(databaseData);
          }
        });
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // console.log(location.state);
    // 首页-顶部信息栏-服务信息栏-异常服务数量，点击时跳往异常清单-服务清单
    if (location.state && location.state.key) {
      setSearchBarController("service_name");
      switch (location.state.key) {
        case "all":
          setCurrentList("self_dev");
          return;
        case "basic":
          setCurrentList("component");
          return;
        case "thirdParty":
          setCurrentList("thirdParty");
          return;
        case "database":
          setCurrentList("database");
          return;
        case "hostData":
          setCurrentList("host");
          return;
      }
    }
  }, []);

  useEffect(() => {
    queryData();
  }, []);

  return (
    <ContentWrapper>
      <Spin spinning={isLoading}>
        <ContentNav data={contentNavData} currentFocus={currentList} />
        <div className={styles.warningSearch}>
          <div className={styles.buttonContainer}>
            {/* <Button type="primary" onClick={() => {
                location.state={};
                queryData()
              }}>
              刷新
            </Button> */}
            <Button
              //style={{ marginRight: 15 }}
              //type="primary"
              onClick={() => {
                location.state = {};
                queryData();
              }}
            >
              刷新
              {/* <Icon type="sync" spin={isLoading} /> */}
            </Button>
          </div>
          <div>
            <Input.Group compact style={{ display: "flex" }}>
              <Select
                defaultValue="ip"
                value={searchBarController}
                onChange={(t) => setSearchBarController(t)}
                style={{
                  width: 100,
                }}
              >
                {currentList !== "host" && (
                  <Select.Option value="service_name">{currentList == "thirdParty"||currentList == "component"?"组件":"服务"}名称</Select.Option>
                )}
                {currentList == "self_dev" && (
                  <Select.Option value="alert_service_type">
                    功能模块
                  </Select.Option>
                )}
                <Select.Option value="ip">IP地址</Select.Option>
              </Select>
              {searchBarController == "service_name" && (
                <AutoComplete
                  allowClear
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ width: 200 }}
                  style={{ width: 200 }}
                  dataSource={datasource ? datasource : []}
                  onFocus={() => {
                    setSearchModalValue("");
                    setSearchIpValue("");
                    //setSearchData([]);
                  }}
                  onSelect={(value) => {
                    const result = R.filter(
                      R.propEq(
                        currentList == "thirdParty"
                          ? "service_name"
                          : "alert_service_name",
                        value
                      ),
                      currentPageData
                    );
                    setSearchData(result);
                  }}
                  value={searchValue}
                  onChange={(value) => {
                    setSearchValue(value);
                    if (!value) {
                      setSearchData([]);
                    }
                  }}
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                  placeholder={`请输入${currentList == "thirdParty"||currentList == "component"?"组件":"服务"}名称`}
                  optionLabelProp="value"
                >
                  <Input
                    suffix={
                      <Icon type="search" className="certain-category-icon certain-category-icon-service" />
                    }
                  />
                </AutoComplete>
              )}
              {searchBarController == "alert_service_type" && (
                <AutoComplete
                  //功能模块筛选
                  allowClear
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ width: 200 }}
                  style={{ width: 200 }}
                  dataSource={datasourceModal ? datasourceModal : []}
                  onSelect={(value) => {
                    const result = R.filter(
                      R.propEq("alert_service_type", value),
                      currentPageData
                    );
                    setSearchData(result);
                  }}
                  onFocus={() => {
                    setSearchIpValue("");
                    //console.log("click");
                    setSearchValue("");
                    //setSearchData([]);
                  }}
                  value={searchModalValue}
                  onChange={(value) => {
                    setSearchModalValue(value);
                    if (!value) {
                      setSearchData([]);
                    }
                  }}
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                  placeholder="请输入功能模块"
                  optionLabelProp="value"
                >
                  <Input
                    suffix={
                      <Icon type="search" className="certain-category-icon certain-category-icon-service" />
                    }
                  />
                </AutoComplete>
              )}
              {searchBarController == "ip" && (
                <AutoComplete
                  allowClear
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ width: 200 }}
                  style={{ width: 200 }}
                  dataSource={datasourceIp ? datasourceIp : []}
                  onFocus={() => {
                    setSearchModalValue("");
                    setSearchValue("");
                    //setSearchData([]);
                  }}
                  onSelect={(value) => {
                    const result = R.filter(
                      R.propEq(
                        currentList == "thirdParty" ? "ip" : "alert_host_ip",
                        value
                      ),
                      currentPageData
                    );
                    setSearchData(result);
                  }}
                  value={searchIpValue}
                  onChange={(value) => {
                    setSearchIpValue(value);
                    if (!value) {
                      setSearchData([]);
                    }
                  }}
                  filterOption={(inputValue, option) =>
                    option.props.children
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                  placeholder="请输入IP"
                  optionLabelProp="value"
                >
                  <Input
                    suffix={
                      <Icon type="search" className="certain-category-icon certain-category-icon-service" />
                    }
                  />
                </AutoComplete>
              )}
            </Input.Group>
          </div>
        </div>
        {currentList == "host" && (
          <Table
            size={"small"}
            rowKey={(record, index) => index}
            // scroll={{ x: 1200 }}
            columns={contentMap[currentList].columns}
            pagination={paginationConfig(
              searchData.length > 0 ? searchData : currentPageData
            )}
            dataSource={searchData.length > 0 ? searchData : currentPageData}
          />
        )}
        {currentList == "self_dev" && (
          <Table
            size={"small"}
            rowKey={(record, index) => index}
            // scroll={{ x: 1200 }}
            columns={contentMap[currentList].columns}
            pagination={paginationConfig(
              searchData.length > 0 ? searchData : currentPageData
            )}
            dataSource={searchData.length > 0 ? searchData : currentPageData}
          />
        )}
        {currentList == "component" && (
          <Table
            size={"small"}
            rowKey={(record, index) => index}
            // scroll={{ x: 1200 }}
            columns={contentMap[currentList].columns}
            pagination={paginationConfig(
              searchData.length > 0 ? searchData : currentPageData
            )}
            dataSource={searchData.length > 0 ? searchData : currentPageData}
          />
        )}
        {currentList == "thirdParty" && (
          <Table
            size={"small"}
            rowKey={(record, index) => index}
            // scroll={{ x: 1200 }}
            columns={contentMap[currentList].columns}
            pagination={paginationConfig(
              searchData.length > 0 ? searchData : currentPageData
            )}
            dataSource={searchData.length > 0 ? searchData : currentPageData}
          />
        )}
        {currentList == "database" && (
          <Table
            size={"small"}
            rowKey={(record, index) => index}
            // scroll={{ x: 1200 }}
            columns={contentMap[currentList].columns}
            pagination={paginationConfig(
              searchData.length > 0 ? searchData : currentPageData
            )}
            dataSource={searchData.length > 0 ? searchData : currentPageData}
          />
        )}
      </Spin>
    </ContentWrapper>
  );
}

export default WarningList;
/*eslint-disable*/
