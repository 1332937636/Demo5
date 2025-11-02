import { TableRowButton } from "@/components";
import { apiRequest } from "@/config/requestApi";
import ContentNav from "@/layouts/ContentNav";
import ContentWrapper from "@/layouts/ContentWrapper";
import { fetchGet, fetchPut } from "@/utils/request";
import {
  columnsConfig,
  handleResponse,
  paginationConfig,
  tableButtonHandler,
  _idxInit,
} from "@/utils/utils";
import {
  Badge,
  Button,
  DatePicker,
  Input,
  message,
  Spin,
  Table,
} from "antd";
import moment from "moment";
import * as R from "ramda";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import styles from "../index.less";

const { RangePicker } = DatePicker;
const { Search } = Input;

function WarningRecord() {
  const location = useLocation();
  const history = useHistory();
  const [isLoading, setLoading] = useState(false);
  // 当前tab
  const [currentList, setCurrentList] = useState("host");
  // 已读功能勾选项
  const [checkedList, setCheckedList] = useState([]);

  // 主机数据、服务数据
  const [hostData, setHostData] = useState([]);
  //服务数据
  const [serviceData, setServiceData] = useState([]);
  // 自有组件dataSource
  // const [basicData, setBasicData] = useState([]);
  // 三方组件数据
  // const [thirdPartyData, setThirdPartyData] = useState([]);
  // 数据库
  // const [databaseData, setDatabaseData] = useState([]);

  // 搜索起止时间
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  // 带条件搜索拿到的数据：input、datePicker
  const [searchData, setSearchData] = useState(null);
  // input搜索条件
  const [searchValue, setSearchValue] = useState(
    location.state
      ? location.state.service_name
        ? location.state.service_name
        : location.state.host_ip
      : ""
  );

  const [rangePickerValue, setRangePickerValue] = useState(null);

  const alert_service_type = {
    service: "self_dev",
    basic: "component",
    database: "database",
    thirdParty: "external",
  };

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // function getDataBySearch(
  //   start,
  //   end,
  //   list,
  //   clearExistedData = false,
  //   searchText = ""
  // ) {
  //   setLoading(true);

  //   const params = {
  //     query_type: "normal",
  //     query_start_time: start,
  //     query_end_time: end,
  //     alert_type: list == "host" ? list : "service",
  //     page_num: 1,
  //     page_size: 200,
  //     query_content: searchText,
  //     alert_service_type: alert_service_type[currentList],
  //   };

  //   fetchGet(apiRequest.operationManagement.alertRecord, { params })
  //     .then((res) => {
  //       handleResponse(res, () => {
  //         // 使用搜索条件请求
  //         // console.log("条件搜索", params);
  //         setSearchData(
  //           _idxInit(
  //             clearExistedData
  //               ? res.data.data
  //               : R.defaultTo([], searchData).concat(res.data.data)
  //           )
  //         );
  //       });
  //     })
  //     .catch((e) => console.log(e))
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // }

  function getDataBySearch() {}

  // 外部进入时携带搜索条件: 服务名称、ip
  // useEffect(() => {
  //   if (location.state && location.state.key) {
  //     if (location.state.key == "all") {
  //       setCurrentList("service");
  //     } else {
  //       setCurrentList(location.state.key);
  //     }
  //   }
    
  // }, []);

  // 初始获取默认数据
  // useEffect(() => {
  //   setLoading(true);
  //   Promise.allSettled([
  //     fetchGet(apiRequest.operationManagement.alertRecord, {
  //       params: {
  //         alert_type: "host",
  //         page_num: 1,
  //         page_size: 200,
  //       },
  //     }),
  //   ])
  //     .then(([hostDataRes]) => {
  //       if (hostDataRes.status === "fulfilled") {
  //         if (hostDataRes.value.code === 3) {
  //           message.warn("登录已过期，请重新登录");

  //           localStorage.clear();
  //           window.__history__.replace("/login");
  //           return;
  //         }

  //         handleResponse(hostDataRes.value, () => {
  //           setHostData(_idxInit(hostDataRes.value.data.data));
  //         });
  //       }
  //     })
  //     .catch((e) => console.log(e))
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // }, []);

  const contentNavData = [
    {
      name: "host",
      text: "主机异常",
      handler: () => {
        if (currentList !== "host") {
          setSearchData(null);
          setSearchValue("");
          setCurrentList("host");
          setStartTime(null);
          setEndTime(null);
          setRangePickerValue(null);
          setCheckedList([]);
          setPagination({
            current: 1,
            pageSize: 10,
            total: 0,
          });
          // if (startTime && endTime) {
          //   getDataBySearch(startTime, endTime, "host", true, searchValue);
          // }
          setPagination({
            current: 1,
            pageSize: 10,
            total: 0,
          });
        }
      },
    },
    {
      name: "service",
      text: "自有服务",
      handler: () => {
        if (currentList !== "service") {
          setSearchData(null);
          setSearchValue("");
          setCurrentList("service");
          setStartTime(null);
          setEndTime(null);
          setRangePickerValue(null);
          setCheckedList([]);
          setPagination({
            current: 1,
            pageSize: 10,
            total: 0,
          });
          // if (startTime && endTime) {
          //   getDataBySearch(startTime, endTime, "service", true, searchValue);
          // }
          setPagination({
            current: 1,
            pageSize: 10,
            total: 0,
          });
        }
      },
    },
    {
      name: "basic",
      text: "自有组件",
      handler: () => {
        if (currentList !== "basic") {
          setSearchData(null);
          setSearchValue("");
          setCurrentList("basic");
          setStartTime(null);
          setEndTime(null);
          setRangePickerValue(null);
          setCheckedList([]);
          setPagination({
            current: 1,
            pageSize: 10,
            total: 0,
          });
          // if (startTime && endTime) {
          //   getDataBySearch(startTime, endTime, "service", true, searchValue);
          // }
          setPagination({
            current: 1,
            pageSize: 10,
            total: 0,
          });
        }
      },
    },
    {
      name: "thirdParty",
      text: "三方组件",
      handler: () => {
        if (currentList !== "thirdParty") {
          setSearchData(null);
          setSearchValue("");
          setCurrentList("thirdParty");
          setStartTime(null);
          setEndTime(null);
          setRangePickerValue(null);
          setCheckedList([]);
          setPagination({
            current: 1,
            pageSize: 10,
            total: 0,
          });
          // if (startTime && endTime) {
          //   getDataBySearch(startTime, endTime, "service", true, searchValue);
          // }
          setPagination({
            current: 1,
            pageSize: 10,
            total: 0,
          });
        }
      },
    },
    {
      name: "database",
      text: "数据库",
      handler: () => {
        if (currentList !== "database") {
          setSearchData(null);
          setSearchValue("");
          setCurrentList("database");
          setStartTime(null);
          setEndTime(null);
          setRangePickerValue(null);
          setCheckedList([]);
          setPagination({
            current: 1,
            pageSize: 10,
            total: 0,
          });
          // if (startTime && endTime) {
          //   getDataBySearch(startTime, endTime, "service", true, searchValue);
          // }
          setPagination({
            current: 1,
            pageSize: 10,
            total: 0,
          });
        }
      },
    },
  ];

  // 点击监控按钮时更新已读信息
  function updateRead(idArr) {
    setLoading(true);
    fetchPut(apiRequest.operationManagement.alertRecord, {
      body: {
        update_data: idArr,
      },
    })
      .then((res) => {
        handleResponse(res, () => {
          if(res.code == 0){
            getServiceData();
            setCheckedList([]);
          }
          // if (!R.isNil(searchData)) {
          //   const _data = R.map((item) => {
          //     if (idArr.includes(item.id)) {
          //       return R.assoc("is_read", 1, item);
          //     } else {
          //       return item;
          //     }
          //   }, searchData);
          //   setSearchData(_data);
          // } else if (currentList === "host") {
          //   const _data = R.map((item) => {
          //     if (idArr.includes(item.id)) {
          //       return R.assoc("is_read", 1, item);
          //     } else {
          //       return item;
          //     }
          //   }, hostData);
          //   setServiceData(_data);
          // } else{
          //   const _data = R.map((item) => {
          //     if (idArr.includes(item.id)) {
          //       return R.assoc("is_read", 1, item);
          //     } else {
          //       return item;
          //     }
          //   }, serviceData);
          //   setServiceData(_data);
          // }
        });
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  }

  const columnsHost = [
    {
      title: "序列",
      key: "index",
      // eslint-disable-next-line react/display-name
      render: (text, record, index) => {
        //console.log(record);
        let idx = record._idx + (pagination.current - 1) * pagination.pageSize;
        return (
          <Badge style={{ marginRight: "-8px" }} dot={record.is_read === 0}>
            {idx}
          </Badge>
        );
      },
      align: "center",
      width: 70,
      fixed: "left",
    },
    {
      ...columnsConfig.alert_host_ip,
      width:80
    },
    // columnsConfig.alert_host_system,
    columnsConfig.alert_level,
    columnsConfig.warning_record_alert_time,
    columnsConfig.alert_describe,
    // columnsConfig.alert_receiver,
    // columnsConfig.alert_resolve,
    {
      title: "操作",
      dataIndex: "",
      render: function renderFunc(text, record, index) {
        return (
          <TableRowButton
            buttonsArr={[
              {
                btnText: "监控",
                btnHandler: () => {
                  tableButtonHandler(record);
                  updateRead([record.id]);
                },
              },
              {
                btnText: "分析",
                btnHandler: () => history.push("/operation-management/report"),
              },
            ]}
          />
        );
      },
      width: 120,
      align: "center",
      fixed: "right",
    },
  ];

  const columnsService = [
    {
      title: "序列",
      key: "index",
      // eslint-disable-next-line react/display-name
      render: (text, record, index) => {
        let idx = record._idx + (pagination.current - 1) * pagination.pageSize;
        return (
          <Badge style={{ marginRight: "-8px" }} dot={record.is_read === 0}>
            {idx}
          </Badge>
        );
      },
      align: "center",
      width: 70,
      fixed: "left",
    },
    columnsConfig.alert_service_type,
    columnsConfig.alert_service_name,
    columnsConfig.alert_host_ip,
    columnsConfig.alert_level,
    columnsConfig.warning_record_alert_time,
    columnsConfig.alert_describe,
    // columnsConfig.alert_receiver,
    // columnsConfig.alert_resolve,
    {
      title: "操作",
      dataIndex: "",
      render: function renderFunc(text, record, index) {
        return (
          <TableRowButton
            buttonsArr={[
              {
                btnText: "监控",
                btnHandler: () => {
                  tableButtonHandler(record);
                  updateRead([record.id]);
                },
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
    {
      title: "序列",
      key: "index",
      // eslint-disable-next-line react/display-name
      render: (text, record, index) => {
        let idx = record._idx + (pagination.current - 1) * pagination.pageSize;
        return (
          <Badge style={{ marginRight: "-8px" }} dot={record.is_read === 0}>
            {idx}
          </Badge>
        );
      },
      align: "center",
      width: 70,
      fixed: "left",
    },
    columnsConfig.alert_service_type,
    {
      ...columnsConfig.alert_service_name,
      title:"组件名称"
    },
    columnsConfig.alert_host_ip,
    columnsConfig.alert_level,
    columnsConfig.warning_record_alert_time,
    columnsConfig.alert_describe,
    // columnsConfig.alert_receiver,
    // columnsConfig.alert_resolve,
    {
      title: "操作",
      dataIndex: "",
      render: function renderFunc(text, record, index) {
        return (
          <TableRowButton
            buttonsArr={[
              {
                btnText: "监控",
                btnHandler: () => {
                  tableButtonHandler(record);
                  updateRead([record.id]);
                },
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

  const columnsThridService = [
    {
      title: "序列",
      key: "index",
      // eslint-disable-next-line react/display-name
      render: (text, record, index) => {
        let idx = record._idx + (pagination.current - 1) * pagination.pageSize;
        return (
          <Badge style={{ marginRight: "-8px" }} dot={record.is_read === 0}>
            {idx}
          </Badge>
        );
      },
      align: "center",
      width: 70,
      fixed: "left",
    },
    columnsConfig.alert_service_type,
    {
      ...columnsConfig.alert_service_name,
      title: "组件名称"
    },
    columnsConfig.alert_host_ip,
    columnsConfig.alert_level,
    columnsConfig.warning_record_alert_time,
    columnsConfig.alert_describe,
    // columnsConfig.alert_receiver,
    // columnsConfig.alert_resolve,
  ];

  const contentMap = {
    host: {
      columns: columnsHost,
      data: serviceData,
    },
    service: {
      columns: columnsService,
      data: serviceData,
    },
    basic: {
      columns: basicColumnsService,
      data: serviceData,
    },
    thirdParty: {
      columns: columnsThridService,
      data: serviceData,
    },
    database: {
      columns: columnsService,
      data: serviceData,
    },
  };

  const currentPageData = contentMap[currentList].data;

  // datePicker onChange事件
  function onChange(dates, dateStrings) {
    //console.log(dates);
    //console.log(dates,dateStrings);
    if (R.isEmpty(dates)) {
      //setSearchData(null);
      getServiceData(pagination, {
        query_start_time: null,
        query_end_time: null,
        query_content: searchValue?searchValue:null,
      });
    }
    setStartTime(dateStrings[0]);
    setEndTime(dateStrings[1]);
    setRangePickerValue(dates);
  }

  // 不可选未来的日期
  function disabledDate(current) {
    return current && current >= moment().endOf("day");
  }

  // 调试数据
  // useEffect(() => {
  //   console.log("a", hostData);
  //   console.log("b", serviceData);
  // }, [hostData, serviceData]);

  // useEffect(() => {
  //   console.log("searchData: ", searchData);
  // }, [searchData]);
  //
  // useEffect(() => {
  //   console.log("searchDataHasNext: ", searchDataHasNext);
  // }, [searchDataHasNext]);

  // const getTableData = (pageParams = { current: 1, pageSize: 10 },searchParams={list:"service"}) =>{
  //   setLoading(true);

  //   const params = {
  //     query_type: "normal",
  //     query_start_time: searchParams.start,
  //     query_end_time: searchParams.end,
  //     alert_type: searchParams.list,
  //     query_content: searchParams.searchText,
  //     page_num: pageParams.current,
  //     page_size: pageParams.pageSize
  //   };

  //   fetchGet(apiRequest.operationManagement.alertRecord, { params })
  //     .then((res) => {
  //       handleResponse(res, () => {
  //         setPagination((pagination) => ({
  //           ...pagination,
  //           current:  Number(res.data.page_num),
  //           pageSize: Number(res.data.per_page),
  //           total: res.data.total,
  //         }));
  //         //set;
  //         setServiceData(res.data.data);
  //       });
  //     })
  //     .catch((e) => console.log(e))
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // };

  const getServiceData = (
    pageParams = { current: 1, pageSize: 10 },
    searchParams,key
  ) => {
    setLoading(true);
    fetchGet(apiRequest.operationManagement.alertRecord, {
      params: {
        query_type: "normal",
        alert_type: key?(key== "host" ? "host" : "service"):currentList == "host" ? "host" : "service",
        alert_service_type: key?alert_service_type[key]:alert_service_type[currentList],
        page_num: pageParams.current,
        page_size: pageParams.pageSize,
        ...searchParams,
      },
    })
      .then((serviceDataRes) => {
        //console.log(serviceDataRes.code);
        setPagination((pagination) => ({
          ...pagination,
          current: Number(serviceDataRes.data.page_num),
          pageSize: Number(serviceDataRes.data.per_page),
          total: serviceDataRes.data.total,
        }));
        if (serviceDataRes && serviceDataRes.code == 0) {
          // console.log("进来了", serviceDataRes);
          handleResponse(serviceDataRes, () => {
            // console.log("进来了");
            setServiceData(_idxInit(serviceDataRes.data.data));
          });
        }
      })
      .catch((e) => console.log(e))
      .finally(() => {
        if(key){location.state=undefined;}
        setLoading(false);
      });
  };
 /*eslint-disable*/
  useEffect(() => {
      if (location.state && location.state.key) {
        let key = "host";
        if (location.state.key == "all") {
          key = "service";
        } else {
          key = location.state.key;
        }
        if (location.state && location.state.service_name && (!location.state.start_time)) {
          //setCurrentList(location.state.key);
          setSearchValue(location.state.service_name);
          getServiceData(pagination,{
            query_content:location.state.service_name
          },key);
        }
    
        if (location.state && location.state.host_ip) {
          //setCurrentList(location.state.key);
          setSearchValue(location.state.host_ip);
          getServiceData(pagination,{
            query_content:location.state.host_ip
          },key);
        }

        if (location.state && location.state.service_name && location.state.start_time) {
          //console.log("是自愈");
          let stateStartTime = location.state.start_time.format("YYYY-MM-DD HH:mm:ss");
          let stateEndTime = location.state.end_time.format("YYYY-MM-DD HH:mm:ss");
          setStartTime(stateStartTime);
          setEndTime(stateEndTime);
          setSearchValue(location.state.service_name);
          setRangePickerValue([location.state.start_time,location.state.end_time]);
          //console.log(location.state.start_time);
          getServiceData(pagination,{
            query_content:location.state.service_name,
            query_start_time: stateStartTime,
            query_end_time: stateEndTime,
          },key);
        }
        setCurrentList(key);
      }
  }, []);

  useEffect(()=>{
    if (!location.state) {
      getServiceData(pagination);
    }
  },[currentList]);

  return (
    <ContentWrapper>
      <Spin spinning={isLoading}>
        <ContentNav data={contentNavData} currentFocus={currentList} />
        <div className={styles.warningSearch}>
          <div>
            <Button
              type={"primary"}
              onClick={() => {
                if (checkedList.length === 0) {
                  message.warn("请选择要已读的数据");
                } else {
                  const idArr = R.flatten(
                    R.map((item) => R.values(R.pick(["id"], item)), checkedList)
                  );
                  updateRead(idArr);
                }
              }}
            >
              批量已读
            </Button>
          </div>
          <div className={styles.rangePicker}>
            <RangePicker
              style={{ width: 390 }}
              ranges={{
                今天: [moment().startOf("day"), moment()],
                本周: [moment().startOf("week"), moment()],
                本月: [moment().startOf("month"), moment()],
              }}
              disabledDate={disabledDate}
              showTime={{
                hideDisabledOptions: true,
              }}
              value={rangePickerValue}
              format="YYYY-MM-DD HH:mm:ss"
              onChange={onChange}
              onOk={(dates) => {
                const start = moment(dates[0]).format("YYYY-MM-DD HH:mm:ss");
                const end = moment(dates[1]).format("YYYY-MM-DD HH:mm:ss");
                getServiceData(pagination, {
                  query_start_time: start,
                  query_end_time: end,
                  query_content: searchValue,
                });
              }}
            />
          </div>
          <div>
            <Search
              placeholder="请输入搜索关键词"
              onSearch={(value) => {
                if (!value) {
                  return message.warn("请输入搜索关键词");
                }
                setSearchValue(value);
                getServiceData(pagination, {
                  query_start_time: startTime,
                  query_end_time: endTime,
                  query_content: value,
                });
              }}
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                if (R.isEmpty(e.target.value)) {
                  if (startTime || endTime) {
                    getServiceData(pagination, {
                      query_start_time: startTime,
                      query_end_time: endTime,
                    });
                  } else {
                    setSearchValue(null);
                    setSearchData(null);
                  }
                }
              }}
              enterButton
            />
          </div>
        </div>
        <Table
          size={"small"}
          rowKey={(record, index) => record.id}
          rowSelection={{
            onSelect: (record, selected, selectedRows) =>
              setCheckedList(selectedRows),
            onSelectAll: (selected, selectedRows, changeRows) =>
              setCheckedList(selectedRows),
            getCheckboxProps: (record) => ({
              disabled: record.is_read === 1,
            }),
            selectedRowKeys: checkedList.map((item) => item.id),
          }}
          //scroll={{ x: 1200 }}
          columns={contentMap[currentList].columns}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: () => <span style={{color:"rgb(152, 157, 171)"}}>共计 <span style={{color:"rgb(63, 64, 70)"}}>{pagination.total}</span> 条</span>,
            ...pagination,
          }}
          // pagination={paginationConfig(
          //   !R.isNil(searchData) ? searchData : currentPageData
          // )}
          dataSource={!R.isNil(searchData) ? searchData : currentPageData}
          onChange={(e) =>
            getServiceData(e, {
              query_start_time: startTime,
              query_end_time: endTime,
              query_content: searchValue,
            })
          }
        />
      </Spin>
    </ContentWrapper>
  );
}

export default WarningRecord;
 /*eslint-disable*/