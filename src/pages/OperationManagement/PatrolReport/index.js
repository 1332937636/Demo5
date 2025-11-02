import { TableRowButton } from "@/components";
import { apiRequest } from "@/config/requestApi";
import ContentNav from "@/layouts/ContentNav";
import ContentWrapper from "@/layouts/ContentWrapper";
import styles from "@/pages/OperationManagement/index.less";
import ReportDetail from "@/pages/OperationManagement/PatrolReport/ReportDetail";
import { fetchGet, fetchPost } from "@/utils/request";
import {
  columnsConfig,
  handleResponse,
  isTableTextInvalid,
  paginationConfig,
} from "@/utils/utils";
import {
  Badge,
  Button,
  Checkbox,
  Input,
  Spin,
  Table,
  message,
} from "antd";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as R from "ramda";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import updata from "@/stores/globalStore";

const CheckboxGroup = Checkbox.Group;
const { Search } = Input;

const PatrolReport = () => {
  const location = useLocation();
  const [isLoading, setLoading] = useState(false);

  // 下载巡检报告
  const download = (filename = "巡检报告") => {
    setLoading(true);
    const element = document.getElementById("reportContent"); // 这个dom元素是要导出pdf的div容器
    const w = element.offsetWidth; // 获得该容器的宽
    const h = element.offsetHeight; // 获得该容器的高
    const offsetTop = element.offsetTop; // 获得该容器到文档顶部的距离
    const offsetLeft = element.offsetLeft; // 获得该容器到文档最左的距离
    const canvas = document.createElement("canvas");
    let abs = 0;
    const win_i = document.body.clientWidth; // 获得当前可视窗口的宽度（不包含滚动条）
    const win_o = window.innerWidth; // 获得当前窗口的宽度（包含滚动条）
    if (win_o > win_i) {
      abs = (win_o - win_i) / 2; // 获得滚动条长度的一半
    }
    canvas.width = w * 2; // 将画布宽&&高放大两倍
    canvas.height = h * 2;
    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.translate(-offsetLeft - abs, -offsetTop);
    // 这里默认横向没有滚动条的情况，因为offset.left(),有无滚动条的时候存在差值，因此
    // translate的时候，要把这个差值去掉
    html2canvas(element, {
      allowTaint: true,
      scale: 1, // 提升画面质量，但是会增加文件大小
      ignoreElements: (element) => {
        if (element.id === "invisible") return true;
      }, // 隐藏右上角按钮
    }).then(function (canvas) {
      const contentWidth = canvas.width;
      const contentHeight = canvas.height;
      //一页pdf显示html页面生成的canvas高度;
      const pageHeight = (contentWidth / 592.28) * 841.89;
      //未生成pdf的html页面高度
      let leftHeight = contentHeight;
      //页面偏移
      let position = 0;
      //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
      const imgWidth = 595.28;
      const imgHeight = (592.28 / contentWidth) * contentHeight;

      const pageData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF("", "pt", "a4");

      //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
      //当内容未超过pdf一页显示的范围，无需分页
      if (leftHeight < pageHeight) {
        pdf.addImage(pageData, "JPEG", 0, 0, imgWidth, imgHeight);
      } else {
        // 分页
        while (leftHeight > 0) {
          pdf.addImage(pageData, "JPEG", 0, position, imgWidth, imgHeight);
          leftHeight -= pageHeight;
          position -= 841.89;
          //避免添加空白页
          if (leftHeight > 0) {
            pdf.addPage();
          }
        }
      }
      pdf.save(`${filename}.pdf`);
      setLoading(false);
    });
  };

  // 当前tab
  const [currentList, setCurrentList] = useState("deep");

  // 左侧主机列表数据
  const [hostLeftList, setHostLeftList] = useState([]);
  // 左侧组件列表数据
  const [serviceLeftList, setServiceLeftList] = useState([]);

  // 页面报告列表
  const [deepReportData, setDeepReportData] = useState([]);
  const [deepReportPageNum, setDeepReportPageNum] = useState(0);
  const [hostReportData, setHostReportData] = useState([]);
  const [hostReportPageNum, setHostReportPageNum] = useState(0);
  const [serviceReportData, setServiceReportData] = useState([]);
  const [serviceReportPageNum, setServiceReportPageNum] = useState(0);

  // 左侧列表勾选项相关
  const [leftOriginList, setLeftOriginList] = useState([]);
  const [checkedLeftList, setCheckedLeftList] = useState([]);
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkedAll, setCheckedAll] = useState(true);

  // 搜索过滤
  // input搜索条件
  const [searchValue, setSearchValue] = useState(
    location.state ? location.state.host_ip : ""
  );
  const [searchData, setSearchData] = useState(null);

  const [reportData, setReportData] = useState(null);

  // 是否展示报告内容详情
  const [showReportDetail, setShowReportDetail] = useState(false);

  const [currentFilename, setCurrentFilename] = useState("巡检报告");

  // 初始请求数据：深度分析报告列表
  useEffect(() => {
    setLoading(true);
    fetchGet(apiRequest.operationManagement.deepInspection, {
      params: {
        page_size: 200,
      },
    })
      .then((deepReportList) => {
        if (deepReportList.code === 3) {
          message.warn("登录已过期，请重新登录");

          localStorage.clear();
          window.__history__.replace("/login");
          return;
        }
        handleResponse(deepReportList, () => {
          setDeepReportData(deepReportList.data.data);
          setDeepReportPageNum(deepReportList.data.next_page_number);
        });
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 请求数据：主机巡检报告列表、服务巡检报告列表、左侧主机列表、左侧服务列表
  useEffect(() => {
    Promise.allSettled([
      fetchGet(apiRequest.operationManagement.hostList),
      fetchGet(apiRequest.operationManagement.serviceList),
      fetchGet(apiRequest.operationManagement.normalInspection, {
        params: { query_type: "host", page_size: 200 },
      }),
      fetchGet(apiRequest.operationManagement.normalInspection, {
        params: { query_type: "service", page_size: 200 },
      }),
    ])
      .then(
        ([
          hostLeftList,
          serviceLeftList,
          hostReportList,
          serviceReportList,
        ]) => {
          if (hostLeftList.status === "fulfilled") {
            if (hostLeftList.value.code === 3) {
              // 先发的深度巡检接口请求，如果已经出错了那么此处不可以再弹一次提示
              localStorage.clear();
              window.__history__.replace("/login");
              return;
            }

            handleResponse(hostLeftList.value, () => {
              setHostLeftList(hostLeftList.value.data);
            });
          }

          if (serviceLeftList.status === "fulfilled") {
            handleResponse(serviceLeftList.value, () => {
              setServiceLeftList(serviceLeftList.value.data);
            });
          }

          if (hostReportList.status === "fulfilled") {
            handleResponse(hostReportList.value, () => {
              setHostReportData(hostReportList.value.data.data);
              setHostReportPageNum(hostReportList.value.data.next_page_number);
            });
          }

          if (serviceReportList.status === "fulfilled") {
            handleResponse(serviceReportList.value, () => {
              setServiceReportData(serviceReportList.value.data.data);
              setServiceReportPageNum(
                serviceReportList.value.data.next_page_number
              );
            });
          }
        }
      )
      .catch((e) => console.log(e))
      .finally(() => {});
  }, []);

  const contentNavData = [
    {
      name: "deep",
      text: "深度分析",
      handler: () => {
        if (currentList !== "deep") {
          setCurrentList("deep");
          setSearchValue("");
          setSearchData(null);
        }
      },
    },
    {
      name: "host",
      text: "主机巡检",
      handler: () => {
        if (currentList !== "host") {
          setCurrentList("host");
          setSearchValue("");
          setSearchData(null);
          setIndeterminate(false);
        }
      },
    },
    {
      name: "component",
      text: "组件巡检",
      handler: () => {
        if (currentList !== "component") {
          setCurrentList("component");
          setSearchValue("");
          setSearchData(null);
          setIndeterminate(false);
        }
      },
    },
  ];

  const deepColumns = [
    columnsConfig.idx,
    {
      title: "报告名称",
      width: 160,
      key: "inspection_name",
      dataIndex: "inspection_name",
      align: "center",
      render: (text, record, index) => {
        if (isTableTextInvalid(text)) {
          return "-";
        } else {
          return (
            <Badge dot={false}>
              <a style={{fontSize:12}} onClick={() => showReport(record.id, record.inspection_name)}>
                {text}
              </a>
            </Badge>
          );
        }
      },
    },
    columnsConfig.inspection_operator,
    columnsConfig.run_status,
    columnsConfig.execution_mdoal,
    // columnsConfig.service_status,
    // columnsConfig.host_risk,
    // columnsConfig.service_risk,
    columnsConfig.start_time,
    columnsConfig.use_time,
    {
      title: "操作",
      dataIndex: "",
      render: function renderFunc(text, record, index) {
        return (
          <TableRowButton
            buttonsArr={[
              {
                btnText: "查看",
                btnHandler: () => showReport(record.id, record.inspection_name),
              },
              {
                btnText: "导出",
                btnHandler: () =>
                  showReport(record.id, record.inspection_name, true),
              },
            ]}
          />
        );
      },
      width: 100,
      align: "center",
      fixed: "right",
    },
  ];

  const componentAndHostColumns = [
    columnsConfig.idx,
    {
      title: "报告名称",
      width: 200,
      key: "inspection_name",
      dataIndex: "inspection_name",
      align: "center",
      render: (text, record, index) => {
        if (isTableTextInvalid(text)) {
          return "-";
        } else {
          return (
            <Badge dot={false}>
              <a style={{fontSize:12}} onClick={() => showReport(record.id, record.inspection_name)}>
                {text}
              </a>
            </Badge>
          );
        }
      },
    },
    columnsConfig.inspection_operator,
    columnsConfig.inspection_status,
    columnsConfig.execution_mdoal,
    columnsConfig.patrol_start_time,
    columnsConfig.patrol_end_time,
    columnsConfig.use_time,
    {
      title: "操作",
      dataIndex: "",
      render: function renderFunc(text, record, index) {
        return (
          <TableRowButton
            buttonsArr={[
              {
                btnText: "查看",
                btnHandler: () => showReport(record.id, record.inspection_name),
              },
              {
                btnText: "导出",
                btnHandler: () =>
                  showReport(record.id, record.inspection_name, true),
              },
            ]}
          />
        );
      },
      width: 100,
      align: "center",
      fixed: "right",
    },
  ];

  const contentMap = {
    deep: {
      columns: deepColumns,
      list: [],
      data: deepReportData,
      next_page_number: deepReportPageNum,
      reportTitle: "深度分析报告",
      requestUrl: apiRequest.operationManagement.reportDeepDetail,
      getMoreUrl: apiRequest.operationManagement.deepInspection,
      executePatrol: () => {
        setLoading(true);
        fetchPost(apiRequest.operationManagement.executeDeepInspection,{
          body: {
            env_id:Number(updata()().value),
          },
        })
          .then((res) => {
            handleResponse(res);
          })
          .then(() => {
            fetchGet(apiRequest.operationManagement.deepInspection, {
              params: {
                page_size: 200,
              },
            }).then((res) => {
              handleResponse(res, () => setDeepReportData(res.data.data));
            });
          })
          .then(() => {
            setTimeout(() => {
              // 八秒后更新页面数据，以免去用户手动刷新
              fetchGet(apiRequest.operationManagement.deepInspection, {
                params: {
                  page_size: 200,
                },
              }).then((res) => {
                // eslint-disable-next-line max-nested-callbacks
                handleResponse(res, () => setDeepReportData(res.data.data));
              });
            }, 8000);
          })
          .catch((e) => console.log(e))
          .finally(() => setLoading(false));
      },
    },
    host: {
      columns: componentAndHostColumns,
      list: hostLeftList,
      data: hostReportData,
      next_page_number: hostReportPageNum,
      reportTitle: "主机分析报告",
      requestUrl: apiRequest.operationManagement.reportDetail,
      getMoreUrl: apiRequest.operationManagement.normalInspection,
      executePatrol: () => {
        setLoading(true);
        fetchPost(apiRequest.operationManagement.executeNormalInspection, {
          body: {
            inspection_type: "host",
            detail: checkedLeftList,
            env_id:Number(updata()().value),
          },
        })
          .then((res) => {
            handleResponse(res);
          })
          .then(() => {
            fetchGet(apiRequest.operationManagement.normalInspection, {
              params: { query_type: "host", page_size: 200 },
            }).then((res) => {
              handleResponse(res, () => setHostReportData(res.data.data));
            });
          })
          .then(() => {
            // 八秒后更新页面数据，以免去用户手动刷新
            setTimeout(() => {
              fetchGet(apiRequest.operationManagement.normalInspection, {
                params: { query_type: "host", page_size: 200 },
              }).then((res) => {
                // eslint-disable-next-line max-nested-callbacks
                handleResponse(res, () => setHostReportData(res.data.data));
              });
            }, 8000);
          })
          .catch((e) => console.log(e))
          .finally(() => setLoading(false));
      },
    },
    component: {
      columns: componentAndHostColumns,
      list: serviceLeftList,
      data: serviceReportData,
      next_page_number: serviceReportPageNum,
      reportTitle: "组件分析报告",
      requestUrl: apiRequest.operationManagement.reportDetail,
      getMoreUrl: apiRequest.operationManagement.normalInspection,
      executePatrol: () => {
        setLoading(true);
        fetchPost(apiRequest.operationManagement.executeNormalInspection, {
          body: {
            inspection_type: "service",
            detail: checkedLeftList,
            env_id:Number(updata()().value),
          },
        })
          .then((res) => {
            handleResponse(res);
          })
          .then(() => {
            fetchGet(apiRequest.operationManagement.normalInspection, {
              params: { query_type: "service", page_size: 200 },
            }).then((res) => {
              handleResponse(res, () => setServiceReportData(res.data.data));
            });
          })
          .then(() => {
            setTimeout(() => {
              fetchGet(apiRequest.operationManagement.normalInspection, {
                params: { query_type: "service", page_size: 200 },
              }).then((res) => {
                // eslint-disable-next-line max-nested-callbacks
                handleResponse(res, () => setServiceReportData(res.data.data));
              });
            }, 8000);
          })
          .catch((e) => console.log(e))
          .finally(() => setLoading(false));
      },
    },
  };

  const currentPageData = contentMap[currentList];

  useEffect(() => {
    setLeftOriginList(currentPageData.list);
    setCheckedLeftList(currentPageData.list);
    setCheckedAll(true);
  }, [currentList]);

  // 请求报告详情
  function showReport(id, filename, needDownload = false) {
    setLoading(true);
    if (!id) {
      return;
    }
    const deep_param = {
      deep_id: id,
    };
    const normal_param = { normal_id: id };
    fetchGet(currentPageData.requestUrl, {
      params: currentList === "deep" ? deep_param : normal_param,
    })
      .then((res) => {
        handleResponse(res, () => {
          if (!res.data) {
            return message.warn("暂无数据，请稍后再试");
          }
          setReportData(res.data);
          setCurrentFilename(filename);
          setShowReportDetail(true);
          // 直接开始下载pdf
          if (needDownload) {
            message.success("正在生成pdf，请稍等");
            setTimeout(() => download(filename), 10);
          }
        });
      })
      .catch((e) => console.log(e))
      .finally(() => setLoading(false));
  }

  function fetchMore() {
    // 查询参数，仅主机和服务有
    const query_type = R.call(() => {
      if (currentList === "host") {
        return { query_type: "host" };
      } else if (currentList === "service") {
        return { query_type: "service" };
      } else {
        return {};
      }
    });
    // todo
    fetchGet(currentPageData.getMoreUrl, {
      params: {
        page_num: currentPageData.next_page_number,
        page_size: 200,
        ...query_type,
      },
    })
      .then((res) => {
        handleResponse(res, () => {
          if (currentList === "deep") {
            setDeepReportData(deepReportData.concat(res.data.data));
            setDeepReportPageNum(res.data.next_page_number);
          } else if (currentList === "host") {
            setHostReportData(hostReportData.concat(res.data.data));
            setHostReportPageNum(res.data.next_page_number);
          } else if (currentList === "service") {
            setServiceReportData(serviceReportData.concat(res.data.data));
            setServiceReportPageNum(res.data.next_page_number);
          }
        });
      })
      .catch((e) => console.log(e))
      .finally(() => setLoading(false));
  }
 /*eslint-disable*/
  // 页面分页配置
  function pageConfig(data) {
    // 数据总量
    const totalSize = data.length;

    return {
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50", "100"],
      showTotal:() => <span style={{color:"rgb(152, 157, 171)"}}>共计 <span style={{color:"rgb(63, 64, 70)"}}>{totalSize}</span> 条</span>,
      total: totalSize,
      // onShowSizeChange: (current, pageSize) => {
      //   console.log(current, pageSize);
      // },
      onChange: (current, pageSize) => {
        // 总页数
        const totalPage = Math.ceil(totalSize / pageSize);

        if (current === totalPage) {
          // 如果当前点击的是最后一页，且后台数据分页有更多数据，则请求更多数据
          currentPageData.next_page_number > 0 && fetchMore();
        }
      },
    };
  }
 /*eslint-disable*/
  return (
    <ContentWrapper>
      <Spin spinning={isLoading}>
        {showReportDetail ? (
          <div className={styles.reportContentWrapper}>
            <ReportDetail
              // data={foo.data}
              data={reportData}
              title={currentPageData.reportTitle}
              download={() => download(currentFilename)}
              hide={() => setShowReportDetail(false)}
            />
          </div>
        ) : (
          <>
            <ContentNav data={contentNavData} currentFocus={currentList} />
            <div className={styles.contentLeftMenuWrapper}>
              {!R.isEmpty(currentPageData.list) && (
                <div className={styles.leftMenu}>
                  {/*列表全选项*/}
                  <Checkbox
                    style={{
                      //marginBottom: 15,
                      marginTop: 15,
                      fontWeight: 500,
                      color: "#333",
                    }}
                    indeterminate={indeterminate}
                    onChange={(e) => {
                      setCheckedLeftList(
                        e.target.checked ? leftOriginList : []
                      );
                      setIndeterminate(false);
                      setCheckedAll(e.target.checked);
                    }}
                    checked={checkedAll}
                  >
                    {currentList == "host" && (
                      <span
                        style={{ fontSize: 15, position: "relative", top: -2 }}
                      >
                        主机列表
                      </span>
                    )}
                    {currentList == "component" && (
                      <span
                        style={{ fontSize: 15, position: "relative", top: -2 }}
                      >
                        组件列表
                      </span>
                    )}
                  </Checkbox>
                  <CheckboxGroup
                    className={styles.leftMenuListContent}
                    options={leftOriginList}
                    value={checkedLeftList}
                    onChange={(checkedList) => {
                      setCheckedLeftList(checkedList);
                      setIndeterminate(
                        !!checkedList.length &&
                          checkedList.length < leftOriginList.length
                      );
                      setCheckedAll(
                        checkedList.length === leftOriginList.length
                      );
                    }}
                  />
                </div>
              )}

              <div
                style={
                  currentList !== "deep"
                    ? { width: "calc(100% - 240px)" }
                    : { width: "100%" }
                }
              >
                <div className={styles.warningSearch}>
                  <div>
                    <Button
                      style={{ marginRight: 15 }}
                      type={"primary"}
                      onClick={() => {
                        if (
                          currentList === "deep" ||
                          (checkedLeftList && checkedLeftList.length > 0)
                        ) {
                          currentPageData.executePatrol();
                        } else {
                          message.warn("请勾选巡检条目");
                        }
                      }}
                    >
                      执行巡检
                    </Button>
                  </div>
                  <div>
                    <Search
                      placeholder="请输入搜索关键词"
                      onSearch={(value) => {
                        if (!value) {
                          return message.warn("请输入搜索关键词");
                        }
                        switch (currentList) {
                          case "deep":
                            return fetchGet(
                              apiRequest.operationManagement.deepInspection,
                              {
                                params: {
                                  query_content: searchValue,
                                  page_size: 200,
                                },
                              }
                            )
                              .then((res) => {
                                handleResponse(res, () =>
                                  setSearchData(res.data.data)
                                );
                              })
                              .catch((e) => console.log(e))
                              .finally(() => setLoading(false));
                          case "service":
                            return fetchGet(
                              apiRequest.operationManagement.normalInspection,
                              {
                                params: {
                                  query_type: "service",
                                  query_content: searchValue,
                                  page_size: 200,
                                },
                              }
                            )
                              .then((res) => {
                                handleResponse(res, () =>
                                  setSearchData(res.data.data)
                                );
                              })
                              .catch((e) => console.log(e))
                              .finally(() => setLoading(false));
                          case "host":
                            return fetchGet(
                              apiRequest.operationManagement.normalInspection,
                              {
                                params: {
                                  query_type: "host",
                                  query_content: searchValue,
                                  page_size: 200,
                                },
                              }
                            )
                              .then((res) => {
                                handleResponse(res, () =>
                                  setSearchData(res.data.data)
                                );
                              })
                              .catch((e) => console.log(e))
                              .finally(() => setLoading(false));
                        }
                      }}
                      value={searchValue}
                      onChange={(e) => {
                        setSearchValue(e.target.value);
                        if (R.isEmpty(e.target.value)) {
                          setSearchValue(null);
                          setSearchData(null);
                        }
                      }}
                      enterButton
                    />
                  </div>
                </div>
                {currentList == "deep" && (
                  <Table
                    size={"small"}
                    //scroll={{ x: 1200 }}
                    rowKey={(record, index) => index}
                    columns={contentMap[currentList].columns}
                    pagination={pageConfig(
                      !R.isNil(searchData) ? searchData : currentPageData.data
                    )}
                    dataSource={
                      !R.isNil(searchData) ? searchData : currentPageData.data
                    }
                  />
                )}
                {currentList == "host" && (
                  <Table
                    size={"small"}
                    //scroll={{ x: 1200 }}
                    rowKey={(record, index) => index}
                    columns={contentMap[currentList].columns}
                    pagination={pageConfig(
                      !R.isNil(searchData) ? searchData : currentPageData.data
                    )}
                    dataSource={
                      !R.isNil(searchData) ? searchData : currentPageData.data
                    }
                  />
                )}
                {currentList == "component" && (
                  <Table
                    size={"small"}
                    //scroll={{ x: 1200 }}
                    rowKey={(record, index) => index}
                    columns={contentMap[currentList].columns}
                    pagination={pageConfig(
                      !R.isNil(searchData) ? searchData : currentPageData.data
                    )}
                    dataSource={
                      !R.isNil(searchData) ? searchData : currentPageData.data
                    }
                  />
                )}
              </div>
            </div>
          </>
        )}
      </Spin>
    </ContentWrapper>
  );
};

export default PatrolReport;
