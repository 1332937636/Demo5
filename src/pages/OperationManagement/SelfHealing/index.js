/*
 * @Author: your name
 * @Date: 2021-06-17 09:30:51
 * @LastEditTime: 2021-06-29 10:46:36
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /ompWeb/src/pages/OperationManagement/SelfHealing/index.js
 */
import React, { useEffect, useState, useContext } from "react";
import ContentWrapper from "@/layouts/ContentWrapper";
import {
  Badge,
  Icon,
  Input,
  Spin,
  Table,
  Button,
  Select,
  DatePicker,
  AutoComplete,
  message,
} from "antd";
import styles from "./index.less";
import moment from "moment";
import * as R from "ramda";
import {
  ColorfulNotice,
  handleResponse,
  paginationConfig,
  tableButtonHandler,
  _idxInit,
} from "@/utils/utils";
import { apiRequest } from "@/config/requestApi";
import { fetchGet, fetchPut } from "@/utils/request";
import { TableRowButton } from "@/components";
import { context } from "@/Root";
import { useHistory } from "react-router-dom";
const { Search } = Input;
const { RangePicker } = DatePicker;
function SelfHealing() {
  function disabledDate(current) {
    return current && current >= moment().endOf("day");
  }
  const appContext = useContext(context);
  const history = useHistory();
  // 搜索起止时间
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const [rangePickerValue, setRangePickerValue] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 已读功能勾选项
  const [checkedList, setCheckedList] = useState([]);

  const columns = [
    {
      title: "序列",
      key: "_idx",
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
      width: 60,
      fixed: "left",
    },
    {
      title: "IP地址",
      width: 120,
      key: "host_ip",
      dataIndex: "host_ip",
      //ellipsis: true,
      sorter: (a, b) => {
        if (!a.host_ip || !b.host_ip) return 0;
        const ip1 = a.host_ip
          .split(".")
          .map((el) => el.padStart(3, "0"))
          .join("");
        const ip2 = b.host_ip
          .split(".")
          .map((el) => el.padStart(3, "0"))
          .join("");
        return ip1 - ip2;
      },
      sortDirections: ["descend", "ascend"],
      align: "center",
      render: (text) => (text ? text : "-"),
    },
    {
      title: "服务名称",
      width: 180,
      key: "service_name",
      dataIndex: "service_name",
      //ellipsis: true,
      sorter: (a, b) => {
        const str1 = R.defaultTo(" ", a.service_name);
        const str2 = R.defaultTo(" ", b.service_name);
        return (
          str1.toLowerCase().charCodeAt(0) - str2.toLowerCase().charCodeAt(0)
        );
      },
      sortDirections: ["descend", "ascend"],
      align: "center",
      render: (text) => (text ? text : "-"),
    },
    {
      dataIndex: "state",
      title: "自愈状态",
      align: "center",
      width: 120,
      sorter: (a, b) => a.state - b.state,
      render: (text, record, index) => {
        if (text === 1) {
          return (
            <ColorfulNotice
              backgroundColor={"rgb(238, 250, 244)"}
              borderColor="rgb(84, 187, 166)"
              text={`自愈成功`}
              top={1}
              width={60}
            />
          );
        } else if (text === 2) {
          return (
            <ColorfulNotice
              backgroundColor="rgba(247, 231, 24,.2)"
              borderColor="#f5c773"
              text={`自愈中`}
              top={1}
              width={50}
            />
          );
        } else if (text === 0) {
          return (
            <ColorfulNotice
              backgroundColor={"#fbe7e6"}
              borderColor="#da4e48"
              text={`自愈失败`}
              top={1}
              width={60}
            />
          );
        } else {
          return <div>-</div>;
        }
      },
    },
    {
      dataIndex: "healing_count",
      title: "自愈重试次数",
      width: 120,
      align: "center",
      render: (text) => (text || text == 0 ? `${text}次` : "-"),
    },
    {
      dataIndex: "start_time",
      title: "自愈开始时间",
      align: "center",
      width: 160,
      sorter: (a, b) =>
        moment(a.start_time).valueOf() - moment(b.start_time).valueOf(),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "操作",
      key: "操作",
      dataIndex: "",
      render: function renderFunc(text, record, index) {
        return (
          <TableRowButton
            buttonsArr={[
              {
                btnText: "关联告警",
                btnHandler: () => {
                  fetchPut(apiRequest.operationManagement.selfHealingHistory, {
                    body: {
                      ids: [record.id],
                    },
                  }).then((res) => {
                    if (res.code == 0) {
                      setCheckedList([]);
                      //getHealingHistoryListData(pagination);
                      if (record.service_name) {
                        let key =
                          record.service_en_type == "self_dev"
                            ? "service"
                            : record.service_en_type == "component"
                            ? "basic"
                            : record.service_en_type;
                        history.push({
                          pathname: "/operation-management/waring-records",
                          state: {
                            start_time: moment(record.start_time).subtract(
                              1,
                              "minutes"
                            ),
                            end_time: record.end_time
                              ? moment(record.end_time)
                              : moment(),
                            key,
                            service_name: record.service_name,
                          },
                        });
                      }
                    }
                  });
                },
              },
              {
                btnText: "服务日志",
                btnHandler: () => {
                  if (record.monitor_log) {
                    window.open(
                      `${record.monitor_log}&var-env=${appContext.state.text}`
                    );
                  } else {
                    message.warn("请确认数据采集地址是否正确");
                  }
                  //已读操作
                  fetchPut(apiRequest.operationManagement.selfHealingHistory, {
                    body: {
                      ids: [record.id],
                    },
                  }).then((res) => {
                    handleResponse(res, () => {
                      if (res.code == 0) {
                        setCheckedList([]);
                        getHealingHistoryListData(pagination);
                      }
                    });
                  });
                },
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

  const [dataSource, setDataSource] = useState([]);

  // const [searchData, setSearchData] = useState([]);

  const [searchValue, setSearchValue] = useState();
  // location.state
  //   ? location.state.service_name
  //     ? location.state.service_name
  //     : location.state.host_ip
  //   : ""

  const [searchIpValue, setSearchIpValue] = useState("");
  //自愈状态控制字段
  const [selfHealingStatusValue, setSelfHealingStatusValue] = useState("");

  const [isLoading, setLoading] = useState(false);

  const [ipSelectListData, setIpSelectListData] = useState([]);

  //自愈记录数据请求
  const getHealingHistoryListData = (
    pageParams = { current: 1, pageSize: 10 },
    searchParams = {}
  ) => {
    setLoading(true);
    fetchGet(apiRequest.operationManagement.selfHealingHistory, {
      params: {
        page_num: pageParams.current,
        page_size: pageParams.pageSize,
        query_start_time:
          searchParams.query_start_time == "all_data_query"
            ? null
            : searchParams.query_start_time || startTime || null,
        query_end_time:
          searchParams.query_start_time == "all_data_query"
            ? null
            : searchParams.query_end_time || endTime || null,
        query_content:
          searchParams.query_content == "all_data_query"
            ? null
            : searchParams.query_content || searchValue || null,
        host_ip:
          searchParams.host_ip == "all_data_query"
            ? null
            : searchParams.host_ip || searchIpValue || null,
        state:
          searchParams.state == "all_data_query"
            ? null
            : searchParams.state == 0
            ? 0
            : searchParams.state ||
              (selfHealingStatusValue == "自愈成功"
                ? 1
                : selfHealingStatusValue == "自愈失败"
                ? 0
                : selfHealingStatusValue == "自愈中"
                ? 2
                : null),
      },
    })
      .then((res) => {
        //console.log(serviceDataRes.code);
        setPagination((pagination) => ({
          ...pagination,
          current: Number(res.data.page_num),
          pageSize: Number(res.data.per_page),
          total: res.data.total,
        }));
        if (res && res.code == 0) {
          handleResponse(res, () => {
            setDataSource(_idxInit(res.data.data));
          });
        }
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  };

  //ip筛选框数据请求
  const queryIpSelectData = () => {
    fetchGet(apiRequest.operationManagement.hostList).then((res) => {
      if (res.code == 0) {
        setIpSelectListData(res.data);
      }
    });
  };

  //已读操作
  const updateRead = (idArr) => {
    setLoading(true);
    fetchPut(apiRequest.operationManagement.selfHealingHistory, {
      body: {
        ids: idArr,
      },
    }).then((res) => {
      handleResponse(res, () => {
        if (res.code == 0) {
          setCheckedList([]);
          getHealingHistoryListData(pagination);
        }
      });
    });
  };

  useEffect(() => {
    getHealingHistoryListData();
    queryIpSelectData();
  }, []);
  /*eslint-disable*/
  return (
    <ContentWrapper>
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
          <AutoComplete
            allowClear
            dropdownMatchSelectWidth={false}
            dropdownStyle={{ width: 200 }}
            style={{ width: 200, marginLeft: 15 }}
            dataSource={ipSelectListData ? ipSelectListData : []}
            onSelect={(value) => {
              getHealingHistoryListData(pagination, { host_ip: value });
              //console.log(value, "Select");
            }}
            value={searchIpValue}
            onChange={(value) => {
              setSearchIpValue(value);
              if (!value) {
                getHealingHistoryListData(pagination, {
                  host_ip: "all_data_query",
                });
              }
            }}
            filterOption={(inputValue, option) =>
              option.props.children
                .toUpperCase()
                .indexOf(inputValue.toUpperCase()) !== -1
            }
            placeholder="请输入ip地址"
            optionLabelProp="value"
          >
            <Input
              suffix={<Icon type="search" className="certain-category-icon" />}
            />
          </AutoComplete>

          <AutoComplete
            allowClear
            dropdownMatchSelectWidth={false}
            dropdownStyle={{ width: 200 }}
            style={{ width: 200, marginLeft: 15 }}
            dataSource={["自愈成功", "自愈失败", "自愈中"]}
            onSelect={(value) => {
              console.log(value, "Select");
              if (value == "自愈成功") {
                getHealingHistoryListData(pagination, { state: 1 });
              } else if (value == "自愈失败") {
                getHealingHistoryListData(pagination, { state: 0 });
              } else if (value == "自愈中") {
                getHealingHistoryListData(pagination, { state: 2 });
              }
            }}
            value={selfHealingStatusValue}
            onChange={(value) => {
              console.log(value, "change");
              setSelfHealingStatusValue(value);
              if (!value) {
                getHealingHistoryListData(pagination, {
                  state: "all_data_query",
                });
              }
            }}
            filterOption={(inputValue, option) =>
              option.props.children
                .toUpperCase()
                .indexOf(inputValue.toUpperCase()) !== -1
            }
            placeholder="请输入自愈状态"
            optionLabelProp="value"
          >
            <Input
              suffix={<Icon type="search" className="certain-category-icon" />}
            />
          </AutoComplete>
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
            onChange={(dates, dateStrings) => {
              //console.log(dates,dateStrings);
              if (R.isEmpty(dates)) {
                getHealingHistoryListData(pagination, {
                  query_start_time: "all_data_query",
                });
              }
              setStartTime(dateStrings[0]);
              setEndTime(dateStrings[1]);
              setRangePickerValue(dates);
            }}
            onOk={(dates) => {
              const start = moment(dates[0]).format("YYYY-MM-DD HH:mm:ss");
              const end = moment(dates[1]).format("YYYY-MM-DD HH:mm:ss");
              getHealingHistoryListData(pagination, {
                query_start_time: start,
                query_end_time: end,
              });
              // getServiceData(undefined, {
              //   query_start_time: start,
              //   query_end_time: end,
              //   query_content: searchValue,
              // });
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
              getHealingHistoryListData(pagination, { query_content: value });
              // getServiceData(undefined, {
              //   query_start_time: startTime,
              //   query_end_time: endTime,
              //   query_content: value,
              // });
            }}
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              if (!e.target.value) {
                getHealingHistoryListData(pagination, {
                  query_content: "all_data_query",
                });
              }
              // if (R.isEmpty(e.target.value)) {
              //   if (startTime || endTime) {
              //     getServiceData(undefined, {
              //       query_start_time: startTime,
              //       query_end_time: endTime,
              //     });
              //   } else {
              //     setSearchValue(null);
              //     setSearchData(null);
              //   }
              // }
            }}
            enterButton
          />
        </div>
      </div>
      <Table
        size={"small"}
        rowKey={(record, index) => record.id}
        loading={isLoading}
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
        columns={columns}
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: () => (
            <span style={{ color: "rgb(152, 157, 171)" }}>
              共计{" "}
              <span style={{ color: "rgb(63, 64, 70)" }}>
                {pagination.total}
              </span>{" "}
              条
            </span>
          ),
          ...pagination,
        }}
        // pagination={paginationConfig(
        //   dataSource
        // )}
        dataSource={dataSource}
        onChange={(e) => getHealingHistoryListData(e)}
      />
    </ContentWrapper>
  );
}
/*eslint-disable*/
export default SelfHealing;
