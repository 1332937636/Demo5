import { TableRowButton } from "@/components";
import { apiRequest } from "@/config/requestApi";
import ContentNav from "@/layouts/ContentNav";
import ContentWrapper from "@/layouts/ContentWrapper";
import { fetchGet, fetchPost, fetchDelete } from "@/utils/request";
import {
  columnsConfig,
  handleResponse,
  isTableTextInvalid,
  isValidIP,
  paginationConfig,
  tableButtonHandler,
  _idxInit,
} from "@/utils/utils";
import {
  AutoComplete,
  Badge,
  Button,
  Icon,
  Input,
  message,
  Modal,
  Spin,
  Table,
  Popconfirm,
  Switch,
  Select,
} from "antd";
import * as R from "ramda";
import React, { useEffect, useState } from "react";
import styles from "./index.less";
import OmpModal from "@/components/OmpModal";
import { useHistory, useLocation } from "react-router-dom";
import updata from "@/stores/globalStore";

export default function ServiceManagement() {
  const location = useLocation();
  const history = useHistory();
  const searchCondition = R.call(() => {
    if (location.state) {
      if (location.state.service_name) {
        return location.state.service_name;
      }
      // else if (location.state.host_ip) {
      //   return location.state.host_ip;
      // }
    } else {
      return "";
    }
  });

  const searchIpCondition = R.call(() => {
    if (location.state) {
      if (location.state.host_ip) {
        return location.state.host_ip;
      }
    } else {
      return "";
    }
  });

  //删除弹框的控制state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  //基础和数据库的添加弹框的控制state
  const [addModalVisible, setAddMoadlVisible] = useState(false);

  //自研的添加弹框的控制state
  const [addSelfModalVisible, setSelfAddMoadlVisible] = useState(false);

  const [isLoading, setLoading] = useState(false);
  const [currentList, setCurrentList] = useState("all");
  // 自研服务dataSource
  const [selfData, setSelfData] = useState([]);
  // 三方组件dataSource
  const [thirdPartyData, setThirdPartyData] = useState([]);
  // 自有组件dataSource
  const [basicData, setBasicData] = useState([]);
  // 数据库
  const [databaseData, setDatabaseData] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [checkedList, setCheckedList] = useState([]);

  //服务筛选
  const [searchData, setSearchData] = useState([]);
  const [searchValue, setSearchValue] = useState(searchCondition);

  //ip筛选
  const [searchIpData, setSearchIpData] = useState([]);
  const [searchIpValue, setSearchIpValue] = useState(searchIpCondition);

  //功能模块筛选
  const [searchModalValue, setSearchModalValue] = useState("");

  //筛选框label
  const [searchBarController, setSearchBarController] =
    useState("service_name");

  //启动按钮visible
  const [visible, setVisible] = useState(false);
  //重启按钮visble
  const [reStartVisible, setReStartVisible] = useState(false);
  //停止按钮visble
  const [stopVisible, setStopVisible] = useState(false);
  //定义selectedRowKey用于控制表格选中数据
  const [selectedRowKeyData, setSelectedRowKeyData] = useState([]);
  useEffect(() => {
    if (location.state && location.state.key)
      setCurrentList(location.state.key);
    setLoading(true);
    Promise.allSettled([
      fetchGet(apiRequest.productsManagement.all),
      fetchGet(apiRequest.productsManagement.getExternal),
    ])
      .then(([allDataRes, thirdPartyDataRes]) => {
        if (allDataRes.status === "fulfilled") {
          if (allDataRes.value.code === 3) {
            message.warn("登录已过期，请重新登录");

            localStorage.clear();
            window.__history__.replace("/login");
            return;
          }
          //_idxInit(allDataRes.value.data);
          handleResponse(allDataRes.value, () => {
            // console.log(location.state);
            // let selfData = allDataRes.value.data.filter(item=>item.service_type=="0");
            // console.log(selfData,"llll");
            // _idxInit(selfData);
            // 路由来源：可能是搜服务名，也可能是搜ip
            if (location.state && location.state.service_name) {
              if (location.state.key !== "thirdParty") {
                setSearchBarController("service_name");
                const result = R.filter(
                  R.propEq("service_name", location.state.service_name),
                  allDataRes.value.data
                );
                setAddMachineForm(contentMap[location.state.key].addPramas);
                setSearchData(result);
              }
            }

            serviceDataHandle(allDataRes);
            //setAllData(allDataRes.value.data);
          });
        }
        if (thirdPartyDataRes.status === "fulfilled") {
          handleResponse(thirdPartyDataRes.value, () => {
            if (location.state && location.state.service_name) {
              if (location.state.key == "thirdParty") {
                setAddMachineForm(contentMap["thirdParty"].addPramas);
                //console.log("进来了？？？？？");
                setSearchBarController("service_name");
                const result = R.filter(
                  R.propEq("service_name", location.state.service_name),
                  thirdPartyDataRes.value.data
                );
                setSearchData(result);
              }
            }
            setThirdPartyData(_idxInit(thirdPartyDataRes.value.data));
          });
        }
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const serviceDataHandle = (allDataRes) => {
    /*eslint-disable*/
    // 自研服务
    let selfData = R.filter(
      (item) => item.service_type == "self_dev",
      allDataRes.value.data
    );
    //console.log("全部自研服务", selfData);

    //主机服务原本是跳到全部服务，但是现在全部被拆分，经过沟通决定跳转到自研服务
    if (location.state && location.state.host_ip) {
      setSearchBarController("ip");
      const result = R.filter(
        R.propEq("ip", location.state.host_ip),
        _idxInit(selfData)
      );
      setSearchData(result);
    }
    setSelfData(_idxInit(selfData));
    // 自有组件
    let basicData = R.filter(
      (item) => item.service_type == "component",
      allDataRes.value.data
    );
    //console.log("全部自有组件", basicData);
    setBasicData(_idxInit(basicData));
    // 数据库
    let databaseData = R.filter(
      (item) => item.service_type == "database",
      allDataRes.value.data
    );
    //console.log("全部数据库", databaseData);
    setDatabaseData(_idxInit(databaseData));
    /*eslint-disable*/
  };

  const alert_count = {
    title: "告警次数",
    width: 120,
    key: "alert_count",
    dataIndex: "alert_count",
    sortDirections: ["descend", "ascend"],
    sorter: (a, b) =>
      Number(isTableTextInvalid(a) ? 0 : a.alert_count) -
      Number(isTableTextInvalid(b) ? 0 : b.alert_count),
    render: (text, record, index) => {
      if (isTableTextInvalid(text)) {
        return "-";
      } else if (Number(text) > 0) {
        return (
          <Badge dot={false}>
            <a
              onClick={() => {
                history.push({
                  // 跳转告警记录
                  pathname: "/operation-management/waring-records",
                  state: {
                    service_name: record.service_name,
                    key: currentList,
                  },
                });
              }}
            >
              {`${text}`}次
            </a>
          </Badge>
        );
      } else {
        return `${text}次`;
      }
    },
    align: "center",
  };

  const columnsAll = [
    {
      ...columnsConfig.service_idx,
      width:64
    },
    columnsConfig.functional_module,
    columnsConfig.service_name,
    columnsConfig.product_service_status,
    columnsConfig.ip,
    columnsConfig.service_port_new,
    // 下个版本
    // columnsConfig.service_version,
    // columnsConfig.cluster_name,
    // columnsConfig.cpu_rate,
    // columnsConfig.memory_rate,
    // columnsConfig.running_time,
    alert_count,
    {
      title: "操作",
      dataIndex: "",
      render: function renderFunc(text, record, index) {
        return (
          <TableRowButton
            buttonsArr={[
              {
                btnText: "监控",
                btnHandler: () => tableButtonHandler(record, "monitor"),
              },
              {
                btnText: "日志",
                btnHandler: () => tableButtonHandler(record, "log"),
              },
            ]}
          />
        );
      },
      align: "center",
      fixed: "right",
      width: 150,
    },
  ];

  const columnsBasic = [
    {
      ...columnsConfig.service_idx,
      width:40
    },
    {
      ...columnsConfig.service_name,
      title: "组件名称",
    },
    columnsConfig.product_service_status,
    columnsConfig.ip,
    //columnsConfig._port_new,
    columnsConfig.service_port_new,
    // columnsConfig.service_version,
    // columnsConfig.cluster_name,
    // columnsConfig.cpu_rate,
    // columnsConfig.memory_rate,
    // columnsConfig.running_time,
    alert_count,
    {
      title: "操作",
      dataIndex: "",
      render: function renderFunc(text, record, index) {
        return (
          <TableRowButton
            buttonsArr={[
              {
                btnText: "监控",
                btnHandler: () => tableButtonHandler(record, "monitor"),
              },
              {
                btnText: "日志",
                btnHandler: () => tableButtonHandler(record, "log"),
              },
            ]}
          />
        );
      },
      fixed: "right",
      width: 150,
      align: "center",
    },
  ];
  const columnsThirdParty = [
    columnsConfig.service_idx,
    {
      ...columnsConfig.service_name,
      title: "组件名称",
    },
    columnsConfig.product_thrityPart_status,
    columnsConfig.thirdParty_ip,
    columnsConfig.cluster_mode,
    columnsConfig.quote,
    alert_count,
    columnsConfig.created_at,
  ];

  const columnsDatabaseData = [
    {
      ...columnsConfig.service_idx,
      width:40
    },
    columnsConfig.service_name,
    columnsConfig.product_service_status,
    columnsConfig.ip,
    columnsConfig.service_port_new,
    alert_count,
    {
      title: "操作",
      dataIndex: "",
      render: function renderFunc(text, record, index) {
        return (
          <TableRowButton
            buttonsArr={[
              {
                btnText: "监控",
                btnHandler: () => tableButtonHandler(record, "monitor"),
              },
              {
                btnText: "日志",
                btnHandler: () => tableButtonHandler(record, "log"),
              },
            ]}
          />
        );
      },
      fixed: "right",
      width: 150,
      align: "center",
    },
  ];

  const contentMap = {
    all: {
      columns: columnsAll,
      data: selfData,
      x: 1500,
      addPramas: {
        service_name: undefined,
        ip: undefined,
        service_port: undefined,
        product_name: undefined,
        product_cn_name: undefined,
      },
    },
    basic: {
      columns: columnsBasic,
      data: basicData,
      x: 1400,
      addPramas: {
        service_name: undefined,
        ip: undefined,
        service_port: undefined,
        service_user: undefined,
        service_pass: undefined,
      },
    },
    thirdParty: {
      columns: columnsThirdParty,
      data: thirdPartyData,
      x: 1000,
      addPramas: {},
    },
    database: {
      columns: columnsDatabaseData,
      data: databaseData,
      x: 1000,
      addPramas: {
        service_name: undefined,
        ip: undefined,
        service_port: undefined,
        service_user: undefined,
        service_pass: undefined,
      },
    },
  };

  //添加服务的formdata
  const [addServiceForm, setAddServiceForm] = useState(
    contentMap[currentList].addPramas
  );

  const currentPageData = contentMap[currentList].data;
  //console.log(currentPageData,"--------------")
  const datasource = Array.from(
    new Set(
      R.flatten(
        R.map(
          (item) => R.values(R.pick(["service_name"], item)),
          currentPageData
        )
      )
    ).filter(i=>i&&i)
  );

  const datasourceIp = Array.from(
    new Set(
      R.flatten(
        R.map((item) => R.values(R.pick(["ip"], item)), currentPageData)
      )
    ).filter(i=>i&&i)
  );

  const datasourceModal = Array.from(
    new Set(
      currentPageData
        .filter((item) => item.product_cn_name)
        .map((item) => item.product_cn_name)
      // R.flatten(
      //   R.map(
      //     (item) => R.values(R.pick(["product_cn_name"], item)),
      //     currentPageData
      //   )
      // )
    ).filter(i=>i&&i)
  );

  const contentNavData = [
    {
      name: "all",
      text: "自有服务",
      handler: () => {
        //console.log(addServiceForm)
        if (currentList !== "all") {
          setCurrentList("all");
          //setSearchData([]);
          // setSearchIpValue("");
          // setSearchValue("");
          setSelectedRowKeyData([]);
          //setCheckedList([]);
          //setSearchBarController("service_name");
          // if(searchBarController=="product_cn_name")setSearchIpValue(""),setSearchValue("");
          // if(searchBarController=="ip")setSearchModalValue(""),setSearchValue("");
          // if(searchBarController=="service_name")setSearchIpValue(""),setSearchModalValue("");
          setAddServiceForm(contentMap["all"].addPramas);

          let searchType = "";
          if (searchIpValue) (searchType = "ip"), setSearchBarController("ip");
          if (searchValue)
            (searchType = "service_name"),
              setSearchBarController("service_name");
          const result = R.filter(
            R.propEq(searchType, searchIpValue || searchValue),
            contentMap["all"].data
          );
          setSearchData(result);
        }
      },
    },
    {
      name: "basic",
      text: "自有组件",
      handler: () => {
        //console.log(addServiceForm)
        if (currentList !== "basic") {
          setCurrentList("basic");
          setSearchData([]);

          //清空功能模块
          setSearchModalValue("");

          // setSearchIpValue("");
          // setSearchValue("");
          // if(searchBarController=="product_cn_name")setSearchIpValue(""),setSearchValue("");
          // if(searchBarController=="ip")setSearchModalValue(""),setSearchValue("");
          // if(searchBarController=="service_name")setSearchIpValue(""),setSearchModalValue("");

          searchBarController == "product_cn_name" &&
            setSearchBarController("service_name");

          setSelectedRowKeyData([]);
          setCheckedList([]);

          setAddServiceForm(contentMap["basic"].addPramas);
          let searchType = "";
          if (searchIpValue) (searchType = "ip"), setSearchBarController("ip");
          if (searchValue)
            (searchType = "service_name"),
              setSearchBarController("service_name");
          const result = R.filter(
            R.propEq(searchType, searchIpValue || searchValue),
            contentMap["basic"].data
          );
          setSearchData(result);

          // setCurrentList("basic");
          // //setSearchData([]);
          // //setSearchIpValue("");
          // //setSearchValue("");
          // setSelectedRowKeyData([]);
          // setCheckedList([]);
          // //setSearchBarController("service_name");

          // console.log(searchBarController, searchValue, contentMap.basic.data)

          // const result = R.filter(
          //   R.propEq(searchBarController, searchValue?searchValue:searchIpValue),
          //   contentMap.basic.data
          // );
          // console.log(result)
          // setSearchData(result);
        }
      },
    },
    {
      name: "thirdParty",
      text: "三方组件",
      handler: () => {
        if (currentList !== "thirdParty") {
          // if(searchBarController=="product_cn_name")setSearchIpValue(""),setSearchValue("");
          // if(searchBarController=="ip")setSearchModalValue(""),setSearchValue("");
          // if(searchBarController=="service_name")setSearchIpValue(""),setSearchModalValue("");
          setAddServiceForm(contentMap["thirdParty"].addPramas);
          // setCurrentList("thirdParty");
          // setSearchData([]);
          // //setSearchIpValue("");
          // //setSearchValue("");
          // setSelectedRowKeyData([]);
          // setCheckedList([]);
          // //setSearchBarController("service_name");

          setCurrentList("thirdParty");
          //setSearchData([]);
          //setSearchIpValue("");
          //setSearchValue("");
          setSelectedRowKeyData([]);
          setCheckedList([]);

          searchBarController == "product_cn_name" ||
            (searchBarController == "ip" &&
              setSearchBarController("service_name"));

          let searchType = "";
          //if(searchIpValue) searchType = "ip"
          if (searchValue) searchType = "service_name";
          const result = R.filter(
            R.propEq(searchType, searchIpValue || searchValue),
            contentMap["thirdParty"].data
          );
          setSearchData(result);
        }
      },
    },
    {
      name: "database",
      text: "数据库",
      handler: () => {
        if (currentList !== "database") {
          // if(searchBarController=="product_cn_name")setSearchIpValue(""),setSearchValue("");
          // if(searchBarController=="ip")setSearchModalValue(""),setSearchValue("");
          // if(searchBarController=="service_name")setSearchIpValue(""),setSearchModalValue("");
          setAddServiceForm(contentMap["database"].addPramas);
          // setCurrentList("database");
          // setSearchData([]);
          // //setSearchIpValue("");
          // //setSearchValue("");
          // setSelectedRowKeyData([]);
          // setCheckedList([]);
          // //setSearchBarController("service_name");
          searchBarController == "product_cn_name" &&
            setSearchBarController("service_name");
          setCurrentList("database");
          //setSearchData([]);
          //setSearchIpValue("");
          //setSearchValue("");
          setSelectedRowKeyData([]);
          setCheckedList([]);
          //setSearchBarController("service_name");
          let searchType = "";
          if (searchIpValue) (searchType = "ip"), setSearchBarController("ip");
          if (searchValue)
            (searchType = "service_name"),
              setSearchBarController("service_name");
          const result = R.filter(
            R.propEq(searchType, searchIpValue || searchValue),
            contentMap["database"].data
          );
          setSearchData(result);
        }
      },
    },
  ];

  const messageWarn = (msg) => {
    message.warn(`请先选择要${msg}的${currentList == "thirdParty"||currentList == "basic"?"组件":"服务"}`);
  };

  //  服务执行启动重启停止操作
  const serviceOperation = (operation) => {
    setVisible(false);
    setReStartVisible(false);
    setStopVisible(false);
    setLoading(true);
    fetchPost(apiRequest.productsManagement.operation, {
      body: {
        ids: selectedRowKeyData,
        operation,
      },
    })
      .then((res) => {
        // 再调用一次列表
        handleResponse(res, () => {
          //console.log(res);
          if (res.code === 0) {
            setSearchData([]);
            //服务筛选
            setSearchValue("");
            //ip筛选
            setSearchIpValue("");
            //功能模块筛选
            setSearchModalValue("");
            setLoading(true);
            fetchGet(apiRequest.productsManagement.all)
              .then((res) => {
                serviceDataHandle({ value: res });
              })
              .catch((e) => console.log(e))
              .finally(() => {
                setLoading(false);
              });
          }
        });
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setSelectedRowKeyData([]);
        setCheckedList([]);
        setLoading(false);
      });
    setShowModal(false);
  };

  const operationService = (queryMethod, data) => {
    setLoading(true);
    if (queryMethod == "delete") {
      fetchDelete(apiRequest.productsManagement.serviceAdd_Delete, {
        body: {
          ids: checkedList.map((item) => item.id),
        },
      })
        .then((res) => {
          // 再调用一次列表
          handleResponse(res, () => {
            //console.log(res);
            if (res.code === 0) {
              setSearchData([]);
              //服务筛选
              setSearchValue("");
              //ip筛选
              setSearchIpValue("");
              //功能模块筛选
              setSearchModalValue("");
              fetchGet(apiRequest.productsManagement.all)
                .then((res) => {
                  serviceDataHandle({ value: res });
                })
                .catch((e) => console.log(e))
                .finally(() => {
                  setLoading(false);
                });
            }
          });
        })
        .catch((e) => console.log(e))
        .finally(() => {
          setSelectedRowKeyData([]);
          setCheckedList([]);
          setLoading(false);
        });
      setDeleteModalVisible(false);
      setSelfAddMoadlVisible(false);
    } else if (queryMethod == "post") {
      delete data.passwordAgain;
      fetchPost(apiRequest.productsManagement.serviceAdd_Delete, {
        body: {
          ...data,
          env_id: Number(updata()().value),
          service_type:
            currentList == "all"
              ? "1"
              : currentList == "basic"
              ? "0"
              : currentList == "database"
              ? "2"
              : null,
        },
      })
        .then((res) => {
          // 再调用一次列表
          handleResponse(res, () => {
            //console.log(res);
            if (res.code === 0) {
              setSearchData([]);
              //服务筛选
              setSearchValue("");
              //ip筛选
              setSearchIpValue("");
              //功能模块筛选
              setSearchModalValue("");
              fetchGet(apiRequest.productsManagement.all)
                .then((res) => {
                  serviceDataHandle({ value: res });
                })
                .catch((e) => console.log(e))
                .finally(() => {
                  setLoading(false);
                });
            }
          });
        })
        .catch((e) => console.log(e))
        .finally(() => {
          setSelectedRowKeyData([]);
          setCheckedList([]);
          setLoading(false);
        });
      setAddMoadlVisible(false);
      setSelfAddMoadlVisible(false);
    }
  };

  const validateFn = (dataSource, type) => {
    let data = JSON.parse(JSON.stringify(dataSource));
    if(/[\u4E00-\u9FA5]/g.test(data.service_pass)){message.warn("密码不支持中文");return false}
    delete data.service_user;
    delete data.service_pass;
    for (let key in data) {
      if (!data[key]) {
        message.warn("输入数据不能为空");
        return false;
      }
    }
    if (type == "machine") {
      if (!data.username) {
        message.warn("输入数据不能为空");
        return false;
      }

      if(/[\u4E00-\u9FA5]/g.test(data.password)){message.warn("密码不支持中文");return false}

      if (!data.password) {
        message.warn("输入数据不能为空");
        return false;
      }
      if (!data.ssh_port) {
        message.warn("输入数据不能为空");
        return false;
      }
      if (!data.ip) {
        message.warn("输入数据不能为空");
        return false;
      }
    } else {
      if (!data.service_port) {
        message.warn("输入数据不能为空");
        return false;
      }
    }
    if (data.password !== data.passwordAgain) {
      message.warn("两次密码输入不一致，请检查后重新输入");
      return false;
    }
    const reg =
      /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    if (!reg.test(data.ip)) {
      message.warn("请输入正确的ip地址");
      return false;
    }

    return true;
  };

  const [productData, setProductData] = useState([]);
  const [selectloading, setSelectloading] = useState(false);
  const queryProduct = () => {
    setSelectloading(true);
    fetchGet(apiRequest.productsManagement.queryProduct, {
      params: {
        env_id: Number(updata()().value),
      },
    })
      .then((res) => {
        // 再调用一次列表
        handleResponse(res, () => {
          //console.log(res);
          if (res.code === 0) {
            setProductData(res.data);
          }
        });
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setSelectloading(false);
      });
  };

  //主机添加操作数据
  const [addMachineForm, setAddMachineForm] = useState({
    username: undefined,
    password: undefined,
    ssh_port: undefined,
    ip: undefined,
  });

  //添加弹框的控制state
  const [addMachineModalVisible, setAddMachineMoadlVisible] = useState(false);
  const [machineLoading, setMachineLoading] = useState(false);
  const operationMachine = (data) => {
    setMachineLoading(true);
    delete data.passwordAgain;
    fetchPost(apiRequest.machineManagement.operation, {
      body: {
        ...data,
        env_id: Number(updata()().value),
      },
    })
      .then((res) => {
        // 再调用一次列表
        handleResponse(res, () => {
          //console.log(res);
          if (res.code === 0) {
            //fetchData();
          }
        });
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setAddMachineMoadlVisible(false);
        setMachineLoading(false);
      });
  };

  const [hostIpList, setHostIpList] = useState([]);
  const [hostListLoading, setHostIpListLoading] = useState(false);
  //添加服务的所属主机ip的列表查询
  const queryHostList = () => {
    setHostIpListLoading(false);
    fetchGet(apiRequest.operationManagement.hostList)
      .then((res) => {
        handleResponse(res, () => {
          //console.log(res);
          if (res.code === 0) {
            setHostIpList(res.data);
          }
        });
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setHostIpListLoading(false);
      });
  };

  return (
    <ContentWrapper>
      <ContentNav data={contentNavData} currentFocus={currentList} />
      <div className={styles.warningSearch}>
        <div className={styles.buttonContainer}>
          {currentList === "thirdParty" ? (
            <>
              <Button
                style={{ marginRight: 15 }}
                type="primary"
                onClick={() => {
                  setShowModal(true);
                }}
              >
                添加
              </Button>
              {checkedList.length === 0 ? (
                <Button
                  //type="danger"
                  //type="primary"
                  onClick={() => message.warn("请选择要删除的组件")}
                >
                  删除
                </Button>
              ) : (
                <Popconfirm
                  title="确认要删除选中组件吗？"
                  onConfirm={() => {
                    const idArr = R.flatten(
                      R.map(
                        (item) => R.values(R.pick(["id"], item)),
                        checkedList
                      )
                    );

                    setLoading(true);
                    fetchDelete(apiRequest.productsManagement.delExternal, {
                      body: { id: idArr },
                    })
                      .then((res) => {
                        handleResponse(res, () => {
                          setSearchData([]);
                          //服务筛选
                          setSearchValue("");
                          //ip筛选
                          setSearchIpValue("");
                          //功能模块筛选
                          setSearchModalValue("");
                          fetchGet(apiRequest.productsManagement.getExternal)
                            .then((res) => {
                              // eslint-disable-next-line max-nested-callbacks
                              handleResponse(res, () =>
                                setThirdPartyData(_idxInit(res.data))
                              );
                            })
                            .catch((e) => console.log(e))
                            .finally(() => {
                              setLoading(false);
                              setCheckedList([]);
                            });
                        });
                      })
                      .catch((e) => console.log(e))
                      .finally(() => {
                        setLoading(false);
                      });
                  }}
                  okText="是"
                  cancelText="否"
                >
                  <Button className={styles.redType}>删除</Button>
                </Popconfirm>
              )}
            </>
          ) : (
            <>
              <Button
                //className={styles.greenType}
                type="primary"
                onClick={() => {
                  checkedList == 0 ? messageWarn("启动") : setVisible(true);
                }}
              >
                启动
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  checkedList == 0
                    ? messageWarn("重启")
                    : setReStartVisible(true);
                }}
              >
                重启
              </Button>
              <Button
                //type="danger"
                type="primary"
                onClick={() => {
                  checkedList == 0 ? messageWarn("停止") : setStopVisible(true);
                }}
              >
                停止
              </Button>
              <div style={{ float: "right" }}>
                <Button
                  style={{ marginRight: 15 }}
                  type={checkedList.length > 0 ? "danger" : null}
                  onClick={() => {
                    if (checkedList.length == 0) {
                      message.warn(`请先选择要删除的${currentList == "thirdParty"||currentList == "basic"?"组件":"服务"}`);
                    } else {
                      setDeleteModalVisible(true);
                    }
                  }}
                >
                  删除
                </Button>
                <Button
                  style={{ marginRight: 15 }}
                  type="primary"
                  onClick={() =>
                    currentList === "all"
                      ? (setSelfAddMoadlVisible(true),
                        queryProduct(),
                        queryHostList(),
                        setAddServiceForm(contentMap[currentList].addPramas))
                      : (setAddMoadlVisible(true),
                        queryHostList(),
                        setAddServiceForm(contentMap[currentList].addPramas))
                  }
                >
                  添加
                </Button>
              </div>
            </>
          )}
        </div>

        <div className={styles.InputGroup}>
          <Input.Group compact style={{ display: "flex" }}>
            <Select
              defaultValue="service_name"
              value={searchBarController}
              onChange={(t) => {
                setSearchBarController(t);
                setSearchIpValue("");
                setSearchValue("");
                setSearchModalValue("");
              }}
              style={{
                width: 100,
              }}
            >
              <Select.Option value="service_name">{currentList == "thirdParty"||currentList == "basic"?"组件":"服务"}名称</Select.Option>
              {currentList !== "thirdParty" && (
                <Select.Option value="ip">IP地址</Select.Option>
              )}
              {currentList == "all" && (
                <Select.Option value="product_cn_name">功能模块</Select.Option>
              )}
            </Select>
            {searchBarController == "service_name" && (
              <AutoComplete
                allowClear
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 200 }}
                style={{ width: 200 }}
                dataSource={datasource ? datasource : []}
                onFocus={() => {
                  setSearchIpValue("");
                  //setSearchData([]);
                  setSearchModalValue("");
                }}
                onSelect={(value) => {
                  //setSearchIpValue("");
                  const result = R.filter(
                    R.propEq("service_name", value),
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
                placeholder={`请输入${currentList == "thirdParty"||currentList == "basic"?"组件":"服务"}名称`}
                optionLabelProp="value"
              >
                <Input
                  suffix={
                    <Icon
                      type="search"
                      className="certain-category-icon certain-category-icon-service"
                    />
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
                onSelect={(value) => {
                  //console.log("初始执行了")
                  // setSearchValue("");
                  // setSearchData([]);
                  // console.log(searchData, "ip");
                  //setSearchIpValue("");
                  const result = R.filter(
                    R.propEq("ip", value),
                    currentPageData
                  );
                  setSearchData(result);
                }}
                onFocus={() => {
                  setSearchModalValue("");
                  setSearchValue("");
                  //setSearchData([]);
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
                placeholder="请输入ip地址"
                optionLabelProp="value"
              >
                <Input
                  suffix={
                    <Icon
                      type="search"
                      className="certain-category-icon certain-category-icon-service"
                    />
                  }
                />
              </AutoComplete>
            )}
            {searchBarController == "product_cn_name" && (
              <AutoComplete
                //功能模块筛选
                allowClear
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 200 }}
                style={{ width: 200 }}
                dataSource={datasourceModal ? datasourceModal : []}
                onSelect={(value) => {
                  // setSearchValue("");
                  // setSearchData([]);
                  //console.log(searchData, "ip");
                  //setSearchIpValue("");
                  const result = R.filter(
                    R.propEq("product_cn_name", value),
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
                // children={<div>123</div>}
              >
                <Input
                  suffix={
                    <Icon
                      type="search"
                      className="certain-category-icon certain-category-icon-service"
                    />
                  }
                />
              </AutoComplete>
            )}
          </Input.Group>
        </div>
      </div>
      <Spin spinning={isLoading}>
        {currentList == "all" && (
          <Table
            size={"small"}
            rowKey={(record) => record.id}
            rowSelection={{
              onChange: (selectedRowKeys, selectedRows) => {
                setSelectedRowKeyData(selectedRowKeys);
                setCheckedList(selectedRows);
              },
              selectedRowKeys: selectedRowKeyData,
              getCheckboxProps: (record) => {
                return (
                  currentList !== "thirdParty" && {
                    disabled: record.is_web_service,
                  }
                );
              },
            }}
            // 下个版本
            // scroll={{ x: contentMap[currentList].x }}
            columns={contentMap[currentList].columns}
            pagination={paginationConfig(
              searchValue || searchIpValue || searchModalValue
                ? searchData
                : currentPageData
            )}
            dataSource={
              searchValue || searchIpValue || searchModalValue
                ? searchData
                  ? searchData
                  : []
                : currentPageData
            }
          />
        )}
        {currentList == "basic" && (
          <Table
            size={"small"}
            rowKey={(record) => record.id}
            rowSelection={{
              onChange: (selectedRowKeys, selectedRows) => {
                setSelectedRowKeyData(selectedRowKeys);
                setCheckedList(selectedRows);
              },
              selectedRowKeys: selectedRowKeyData,
              getCheckboxProps: (record) => {
                return (
                  currentList !== "thirdParty" && {
                    disabled: record.is_web_service,
                  }
                );
              },
            }}
            // 下个版本
            // scroll={{ x: contentMap[currentList].x }}
            columns={contentMap[currentList].columns}
            pagination={paginationConfig(
              searchValue || searchIpValue || searchModalValue
                ? searchData
                : currentPageData
            )}
            dataSource={
              searchValue || searchIpValue || searchModalValue
                ? searchData
                  ? searchData
                  : []
                : currentPageData
            }
          />
        )}
        {currentList == "thirdParty" && (
          <Table
            size={"small"}
            rowKey={(record) => record.id}
            rowSelection={{
              onChange: (selectedRowKeys, selectedRows) => {
                setSelectedRowKeyData(selectedRowKeys);
                setCheckedList(selectedRows);
              },
              selectedRowKeys: selectedRowKeyData,
              getCheckboxProps: (record) => {
                return (
                  currentList !== "thirdParty" && {
                    disabled: record.is_web_service,
                  }
                );
              },
            }}
            // 下个版本
            // scroll={{ x: contentMap[currentList].x }}
            columns={contentMap[currentList].columns}
            pagination={paginationConfig(
              searchValue || searchIpValue || searchModalValue
                ? searchData
                : currentPageData
            )}
            dataSource={
              searchValue || searchIpValue || searchModalValue
                ? searchData
                  ? searchData
                  : []
                : currentPageData
            }
          />
        )}
        {currentList == "database" && (
          <Table
            size={"small"}
            rowKey={(record) => record.id}
            rowSelection={{
              onChange: (selectedRowKeys, selectedRows) => {
                setSelectedRowKeyData(selectedRowKeys);
                setCheckedList(selectedRows);
              },
              selectedRowKeys: selectedRowKeyData,
              getCheckboxProps: (record) => {
                return (
                  currentList !== "thirdParty" && {
                    disabled: record.is_web_service,
                  }
                );
              },
            }}
            // 下个版本
            // scroll={{ x: contentMap[currentList].x }}
            columns={contentMap[currentList].columns}
            pagination={paginationConfig(
              searchValue || searchIpValue || searchModalValue
                ? searchData
                : currentPageData
            )}
            dataSource={
              searchValue || searchIpValue || searchModalValue
                ? searchData
                  ? searchData
                  : []
                : currentPageData
            }
          />
        )}
      </Spin>
      {/* 添加三方组件的弹框 */}
      <ThirdPartyForm
        visible={showModal}
        onCancel={() => setShowModal(false)}
        onCreate={(val) => {
          setLoading(true);
          fetchPost(apiRequest.productsManagement.addExternal, {
            body: { ...val, env_id: Number(updata()().value) },
          })
            .then((res) => {
              // 再调用一次更新第三方列表
              handleResponse(res, () => {
                setSearchData([]);
                //服务筛选
                setSearchValue("");
                //ip筛选
                setSearchIpValue("");
                //功能模块筛选
                setSearchModalValue("");
                fetchGet(apiRequest.productsManagement.getExternal)
                  .then((res) => {
                    // eslint-disable-next-line max-nested-callbacks
                    handleResponse(res, () =>
                      setThirdPartyData(_idxInit(res.data))
                    );
                  })
                  .catch((e) => console.log(e))
                  .finally(() => {
                    setLoading(false);
                  });
              });
            })
            .catch((e) => console.log(e))
            .finally(() => setLoading(false));
          setShowModal(false);
        }}
      />
      <OmpModal
        visibleHandle={[visible, setVisible]}
        title="提示"
        onOk={() => {
          serviceOperation("start");
        }}
      >
        <div>
          是否确认 <span style={{ color: "#6c9e6b" }}>启动</span> 所选 {currentList == "thirdParty"||currentList == "basic"?"组件":"服务"} (共
          {checkedList.length}个) ？
        </div>
      </OmpModal>
      <OmpModal
        visibleHandle={[reStartVisible, setReStartVisible]}
        title="提示"
        onOk={() => {
          serviceOperation("restart");
        }}
      >
        <div>
          是否确认 <span style={{ color: "#5192f0" }}>重启</span> 所选 {currentList == "thirdParty"||currentList == "basic"?"组件":"服务"} (共
          {checkedList.length}个) ？
        </div>
      </OmpModal>
      <OmpModal
        visibleHandle={[stopVisible, setStopVisible]}
        title="提示"
        onOk={() => {
          serviceOperation("stop");
        }}
      >
        <div>
          是否确认 <span style={{ color: "#ed5b56" }}>停止</span> 所选 {currentList == "thirdParty"||currentList == "basic"?"组件":"服务"} (共
          {checkedList.length}个) ？
        </div>
      </OmpModal>

      <OmpModal
        visibleHandle={[deleteModalVisible, setDeleteModalVisible]}
        title="删除"
        onOk={() => {
          operationService("delete");
          //serviceOperation("start");
        }}
      >
        <div>
          是否确认 <span style={{ color: "#ed5b56" }}>删除</span> 所选 {currentList == "thirdParty"||currentList == "basic"?"组件":"服务"} (共
          {checkedList.length}个) ？
        </div>
      </OmpModal>

      <OmpModal
        visibleHandle={[addModalVisible, setAddMoadlVisible]}
        title={`新增${currentList == "thirdParty"||currentList == "basic"?"组件":"服务"}`}
        onOk={() => {
          // operationMachine("delete")
          // console.log(checkedList)
          //serviceOperation("start");
          if (validateFn(addServiceForm)) {
            operationService("post", addServiceForm);
          }
        }}
        afterClose={() => {
          setAddServiceForm(contentMap[currentList].addPramas);
        }}
      >
        <div className={styles.formItem}>
          <span>
            <span style={{ color: "red" }}>* </span>{currentList == "thirdParty"||currentList == "basic"?"组件":"服务"}名称：
          </span>
          <Input
            onChange={(e) => {
              setAddServiceForm({
                ...addServiceForm,
                service_name: e.target.value,
              });
            }}
            placeholder={`请输入${currentList == "thirdParty"||currentList == "basic"?"组件":"服务"}名称`}
          />
        </div>

        <div className={styles.formItem}>
          <span>
            <span style={{ color: "red" }}>* </span>所属主机：
          </span>
          <Select
            showSearch={true}
            loading={hostListLoading}
            // /showSearch={true}
            placeholder="请选择主机"
            style={{ width: 218 }}
            onChange={(e) => {
              setAddServiceForm({
                ...addServiceForm,
                ip: e,
              });
            }}
          >
            {hostIpList.map((item) => {
              return (
                <Select.Option value={item} key={item}>
                  {item}
                </Select.Option>
              );
            })}
          </Select>
          {/* <Input
            style={{ width: 220 }}
            value={addServiceForm.ip}
            onChange={(e) => {
              const reg = /^([0-9.]+)$/;
              if (reg.test(e.target.value) || !e.target.value) {
                setAddServiceForm({
                  ...addServiceForm,
                  ip: e.target.value,
                });
              }
            }}
            placeholder={"请输入主机IP(必填)"}
          /> */}
          <Icon
            style={{ color: "#5192f0", marginLeft: 10 }}
            onClick={() => (
              setAddMachineForm({}),
              setAddMachineMoadlVisible(true),
              setAddMoadlVisible(false)
            )}
            type="plus-circle"
          />
        </div>

        <div className={styles.formItem}>
          <span>
            <span style={{ color: "red" }}>* </span>端口：
          </span>
          <Input
            value={addServiceForm.service_port}
            onChange={(e) => {
              const reg = /^-?[0-9]*([0-9]*)?$/;
              if (
                (!e.target.value.startsWith("0") || !e.target.value) &&
                !isNaN(Number(e.target.value)) &&
                reg.test(e.target.value)
              ) {
                setAddServiceForm({
                  ...addServiceForm,
                  service_port: e.target.value
                    ? Number(e.target.value) > 65535
                      ? 65535
                      : Number(e.target.value)
                    : e.target.value,
                });
              }
            }}
            placeholder={"请输入端口号"}
          />
        </div>

        <div className={styles.formItem}>
          <span>用户名：</span>
          <Input
            onChange={(e) => {
              setAddServiceForm({
                ...addServiceForm,
                service_user: e.target.value,
              });
            }}
            placeholder={"请输入用户名"}
          />
        </div>

        <div className={styles.formItem}>
          <span>密码：</span>
          <Input.Password
            style={{ width: 240 }}
            onChange={(e) => {
              setAddServiceForm({
                ...addServiceForm,
                service_pass: e.target.value,
              });
            }}
            placeholder={"请输入密码"}
          />
        </div>
      </OmpModal>

      <OmpModal
        visibleHandle={[addSelfModalVisible, setSelfAddMoadlVisible]}
        title="新增服务"
        onOk={() => {
          // operationMachine("delete")
          // console.log(checkedList)
          //serviceOperation("start");
          if (validateFn(addServiceForm)) {
            operationService("post", addServiceForm);
          }
        }}
        afterClose={() => {
          setAddServiceForm(contentMap[currentList].addPramas);
        }}
      >
        <div className={styles.formItem}>
          <span>
            <span style={{ color: "red" }}>* </span>服务名称：
          </span>
          <Input
            onChange={(e) => {
              setAddServiceForm({
                ...addServiceForm,
                service_name: e.target.value,
              });
            }}
            placeholder={"请输入服务名称"}
          />
        </div>

        <div className={styles.formItem}>
          <span>
            <span style={{ color: "red" }}>* </span>所属主机：
          </span>
          <Select
            showSearch={true}
            loading={hostListLoading}
            // /showSearch={true}
            placeholder="请选择主机"
            style={{ width: 218 }}
            onChange={(e) => {
              setAddServiceForm({
                ...addServiceForm,
                ip: e,
              });
            }}
          >
            {hostIpList.map((item) => {
              return (
                <Select.Option value={item} key={item}>
                  {item}
                </Select.Option>
              );
            })}
          </Select>
          {/* <Input
        style={{width:220}}
         value={addServiceForm.ip}
          onChange={(e) => {
            const reg = /^([0-9.]+)$/;
            if (reg.test(e.target.value) || (!e.target.value)) {
              setAddServiceForm({
                ...addServiceForm,
                ip: e.target.value,
              })
            }
          }}
          placeholder={"请输入主机IP(必填)"}
        /> */}
          <Icon
            style={{ color: "#5192f0", marginLeft: 10 }}
            onClick={() => (
              setAddMachineForm({}),
              setAddMachineMoadlVisible(true),
              setSelfAddMoadlVisible(false)
            )}
            type="plus-circle"
          />
        </div>

        <div className={styles.formItem}>
          <span>
            <span style={{ color: "red" }}>* </span>功能模块：
          </span>
          <Select
            onChange={(e) => {
              let arr = e.split(",");
              setAddServiceForm({
                ...addServiceForm,
                product_name: arr[0],
                product_cn_name: arr[1],
              });
            }}
            loading={selectloading}
            disabled={selectloading}
            style={{ width: 240 }}
            placeholder="请选择功能模块"
          >
            {productData.map((item) => {
              return (
                <Select.Option key={[item.product_name, item.product_cn_name]}>
                  {item.product_cn_name}
                </Select.Option>
              );
            })}
          </Select>
        </div>

        <div className={styles.formItem}>
          <span>
            <span style={{ color: "red" }}>* </span>服务端口：
          </span>
          <Input
            value={addServiceForm.service_port}
            onChange={(e) => {
              const reg = /^-?[0-9]*([0-9]*)?$/;
              if (
                (!e.target.value.startsWith("0") || !e.target.value) &&
                !isNaN(Number(e.target.value)) &&
                reg.test(e.target.value)
              ) {
                setAddServiceForm({
                  ...addServiceForm,
                  service_port: e.target.value
                    ? Number(e.target.value) > 65535
                      ? 65535
                      : Number(e.target.value)
                    : e.target.value,
                });
              }
            }}
            placeholder={"请输入服务端口号"}
          />
        </div>
      </OmpModal>

      <OmpModal
        visibleHandle={[addMachineModalVisible, setAddMachineMoadlVisible]}
        title="新增主机"
        onOk={() => {
          // operationMachine("delete")
          // console.log(checkedList)
          //serviceOperation("start");
          if (validateFn(addMachineForm, "machine")) {
            operationMachine(addMachineForm);
          }
        }}
        afterClose={() => {
          setAddMachineForm({
            username: undefined,
            password: undefined,
            ssh_port: undefined,
            ip: undefined,
          });
        }}
      >
        <Spin spinning={machineLoading}>
          <div className={styles.formItem}>
            <span>
              <span style={{ color: "red" }}>* </span>主机IP：
            </span>
            <Input
              value={addMachineForm.ip}
              onChange={(e) => {
                const reg = /^([0-9.]+)$/;
                if (reg.test(e.target.value) || !e.target.value) {
                  setAddMachineForm({
                    ...addMachineForm,
                    ip: e.target.value,
                  });
                }
              }}
              placeholder={"请输入主机IP"}
            />
          </div>

          <div className={styles.formItem}>
            <span>
              <span style={{ color: "red" }}>* </span>SSH端口：
            </span>
            <Input
              value={addMachineForm.ssh_port}
              onChange={(e) => {
                const reg = /^-?[0-9]*([0-9]*)?$/;
                if (
                  (!e.target.value.startsWith("0") || !e.target.value) &&
                  !isNaN(Number(e.target.value)) &&
                  reg.test(e.target.value)
                ) {
                  setAddMachineForm({
                    ...addMachineForm,
                    ssh_port: e.target.value
                      ? Number(e.target.value) > 65535
                        ? 65535
                        : Number(e.target.value)
                      : e.target.value,
                  });
                }
              }}
              placeholder={"请输入SSH端口号"}
            />
          </div>

          <div className={styles.formItem}>
            <span>
              <span style={{ color: "red" }}>* </span>登录用户：
            </span>
            <Input
              onChange={(e) => {
                setAddMachineForm({
                  ...addMachineForm,
                  username: e.target.value,
                });
              }}
              placeholder={"请输入用户名"}
            />
          </div>

          <div className={styles.formItem}>
            <span>
              <span style={{ color: "red" }}>* </span>输入密码：
            </span>
            <Input.Password
              style={{ width: 240 }}
              onChange={(e) => {
                setAddMachineForm({
                  ...addMachineForm,
                  password: e.target.value,
                });
              }}
              placeholder={"请输入密码"}
            />
          </div>

          <div className={styles.formItem}>
            <span>
              <span style={{ color: "red" }}>* </span>确认密码：
            </span>
            <Input.Password
              style={{ width: 240 }}
              onChange={(e) => {
                setAddMachineForm({
                  ...addMachineForm,
                  passwordAgain: e.target.value,
                });
              }}
              placeholder={"请再次确认密码"}
            />
          </div>
        </Spin>
      </OmpModal>
    </ContentWrapper>
  );
}

function ThirdPartyForm({ visible, onCancel, onCreate }) {
  const [service_name, setService] = useState(null);
  const [ip, setLink] = useState(null);
  const [cluster_mode, setCluster] = useState(null);
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState(null);
  const [quote, setQuote] = useState(1);

  return (
    <Modal
      centered
      destroyOnClose
      visible={visible}
      title="新增三方组件"
      cancelText="取消"
      okText="创建"
      onCancel={onCancel}
      onOk={() => {
        if (R.either(R.isNil, R.isEmpty)(service_name)) {
          return message.warn("请输入组件名称");
        }
        
        if(/[\u4E00-\u9FA5]/g.test(password)){message.warn("密码不支持中文");return false}

        if (R.either(R.isNil, R.isEmpty)(ip)) {
          return message.warn("请输入ip地址");
        } else {
          let arr = ip.split(",");
          for (let i of arr) {
            if (!isValidIP(i)) {
              return message.warn("请输入正确的ip地址和端口号");
            }
          }
        }
        onCreate({
          service_name,
          ip,
          cluster_mode,
          username: user,
          password,
          quote,
        });
      }}
      afterClose={() => {
        setService(null);
        setLink(null);
        setCluster(null);
        setUser(null);
        setPassword(null);
        setQuote(1);
      }}
    >
      <div className={styles.formItem}>
        <span>
          <span style={{ color: "red" }}>* </span>组件名称：
        </span>
        <Input
          onChange={(e) => setService(e.target.value)}
          placeholder={"请输入组件名称"}
        />
      </div>

      <div className={styles.formItem}>
        <span>
          <span style={{ color: "red" }}>* </span>IP地址：
        </span>
        <Input
          onChange={(e) => setLink(e.target.value)}
          placeholder={"请输入IP和端口号"}
        />
      </div>

      <div className={styles.formItem}>
        <span>集群模式：</span>
        <Input
          onChange={(e) => setCluster(e.target.value)}
          placeholder={"请输入集群模式"}
        />
      </div>

      <div className={styles.formItem}>
        <span>用户名：</span>
        <Input
          onChange={(e) => setUser(e.target.value)}
          placeholder={"请输入用户名"}
        />
      </div>

      <div className={styles.formItem}>
        <span>密码：</span>
        <Input.Password
          style={{ width: 240 }}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={"请输入密码"}
        />
      </div>

      <div className={styles.formItem}>
        <span>是否应用：</span>
        <Switch
          defaultChecked
          onChange={(e) => {
            e ? setQuote(1) : setQuote(0);
          }}
        />
      </div>
    </Modal>
  );
}
