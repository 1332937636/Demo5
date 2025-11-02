/*
 * @Author: your name
 * @Date: 2021-06-24 17:23:37
 * @LastEditTime: 2021-06-28 18:15:10
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /omp-fontend123/src/layouts/index.js
 */
import { useState, useEffect, createContext, useReducer ,useContext} from "react";
import { Layout, Menu, Dropdown, message, Form, Input } from "antd";
import { fetchGet, fetchDelete, fetchPost } from "@/utils/request";
import { handleResponse } from "@/utils/utils";
import { apiRequest } from "@/config/requestApi";
import {
  DashboardOutlined,
  QuestionCircleFilled,
  CaretDownOutlined,
} from "@ant-design/icons";
import { useHistory, useLocation } from "react-router-dom";
import img from "@/config/logo/logo.svg";
import routerConfig from "@/config/router.config";
//import { OmpModal } from "@/components";
import styles from "./index.module.less";
import defaultState, { reducer } from "@/stores";
import { getSetViewSizeAction } from "./store/actionsCreators";
import { useDispatch } from "react-redux";
import CustomBreadcrumb from "@/layouts/CustomBreadcrumb";
import OmpEnvSelect from "src/components/OmpEnvSelect";
const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

export const context = createContext(null);

const OmpLayout = (props) => {
  const reduxDispatch = useDispatch();
  const appContext = useContext(context);
  const [state, dispatch] = useReducer(reducer, defaultState);

  const history = useHistory();
  const location = useLocation();
  //是否禁用
  console.log(props);
  //不可用状态是一个全局状态，放在layout
  const [disabled, setDisabled] = useState(false);
  const [isLoading, setLoading] = useState(false);
  //环境数据请求时，触发的loading
  const [envLoading, setEnvLoading] = useState(true);
  const [currentOpenedKeys, setCurrentOpenedKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const logout = () => {
    fetchDelete(apiRequest.auth.logout).then((data) => {
      data = data.data;
      if ([0, 3].includes(data.code)) {
        data.code == 0 && message.success(data.message);
        localStorage.clear();
        history.replace("/login");
      }
      if (data.code === 1) {
        message.error(data.message);
      }
    });
  };

  const rootSubmenuKeys = [
    "/machine-management",
    "/products-management",
    "/operation-management",
    "/actions-record",
    "/product-settings",
    "/system-settings",
  ];

  const headerLink = [
    { title: "仪表盘", path: "/homepage" },
    { title: "快速部署", path: "/products-management/version/rapidDeployment" },
    // { title: "数据上传", path: "/products-management/version/upload" },
    { title: "深度分析", path: "/operation-management/report" },
    {
      title: "监控平台",
      path: "/proxy/v1/grafana/d/XrwAXz_Mz/mian-ban-lie-biao",
    },
  ];

  //修改密码弹框
  const [showModal, setShowModal] = useState(false);

  const menu = (
    <Menu className="menu">
      <Menu.Item key="changePass" onClick={() => setShowModal(true)}>
        修改密码
      </Menu.Item>
      <Menu.Item key="logout">
        <span onClick={() => logout()}>退出登录</span>
      </Menu.Item>
    </Menu>
  );

  const onPathChange = (e) => {
    if (e.key === history.location.pathname) {
      return;
    }
    // homepage没有submenu
    if (e.key === "/homepage") {
      setCurrentOpenedKeys([]);
    }
    history.push(e.key);
  };

  const onOpenChange = (openKeys) => {
    const latestOpenKey = openKeys.find(
      (key) => currentOpenedKeys.indexOf(key) === -1
    );
    //console.log(latestOpenKey)
    if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setCurrentOpenedKeys(openKeys);
    } else {
      setCurrentOpenedKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const onPassWordChange = (data) => {
    setLoading(true);
    fetchPost(apiRequest.auth.password, {
      body: {
        ...data,
      },
    })
      .then((res) => {
        res = res.data;
        handleResponse(res);
        if (res.code == 0) {
          setShowModal(false);
          logout();
        }
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // let newEnvId = appContext.state.value;
    // let newEnvText = appContext.state.text;
    /*eslint-disable*/
    //环境列表查询
    fetchGet(apiRequest.environment.queryEnvList)
      .then((res) => {
        res = res.data;
        handleResponse(res, () => {
          if (res.code == 0) {
            dispatch({
              type: "ENVIRONMENT_LIST_CHANGE",
              payload: { list: [...res.data, { env_name: "mock", id: 999 }] },
            });
            if (res.data.length == 0) {
              setDisabled(true);
              history.replace("/products-management/version");
            } else {
              dispatch({
                type: "ENVIRONMENT_CHANGE",
                payload: {
                  value: state.value ? state.value : res.data[0].id,
                  text: state.text ? state.text : res.data[0].env_name,
                },
              });
            }
          }
        });
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setEnvLoading(false);
      });
  }, []);

  //校验是否已登录
  useEffect(() => {
    window.__history__ = history;
    if (!localStorage.getItem("username")) {
      history.replace("/login");
    }
  }, []);

  // 相应路由跳转，submenu打开
  useEffect(() => {
    try {
      if (
        location.pathname == "/products-management/version/rapidDeployment" ||
        location.pathname == "/products-management/version/upload" ||
        location.pathname == "/products-management/version/installationDetails"
      ) {
        setSelectedKeys(["/products-management/version"]);
      } else {
        setSelectedKeys([location.pathname]);
      }
      let pathArr = location.pathname.split("/");
      let newPath = `/${pathArr[1]}`;
      //console.log([newPath])
      setCurrentOpenedKeys([newPath]);
    } catch (e) {
      console.log(e);
    }
  }, [location]);

  // 这里做一个视口查询，存入store, 其他组件可以根据视口大小进行自适应
  // reduxDispatch(
  //   getSetViewSizeAction({
  //     height: document.documentElement.clientHeight,
  //     width: document.documentElement.clientWidth,
  //   })
  // );

  return (
    <context.Provider value={{ state, dispatch }}>
      <Layout className={styles.OmpLayoutContainer}>
        <Header className={styles.OmpHeader}>
          <div className={styles.headerLogo}>
            <img src={img} />
          </div>
          <div
            style={{ cursor: "pointer" }}
            onClick={() => history.push("/homepage")}
          >
            运维管理平台
          </div>
          {headerLink.map((item, idx) => {
            return (
              <div
                style={
                  window.location.hash.includes(item.path)
                    ? { fontSize: 14, background: "#31405e", color: "#fff" }
                    : { fontSize: 14, cursor: disabled ? "not-allowed" : null }
                }
                className={
                  !disabled || item.title === "快速部署"
                    ? styles.headerLink
                    : styles.headerLinkNohover
                }
                key={idx}
                onClick={() => {
                  if (!disabled || item.title === "快速部署") {
                    if (item.title === "监控平台") {
                      window.open(
                        "/proxy/v1/grafana/d/XrwAXz_Mz/mian-ban-lie-biao"
                      );
                    } else {
                      history.push(item.path);
                    }
                  }
                }}
              >
                {item.title}
              </div>
            );
          })}
          <div className={styles.userAvatar}>
            <Dropdown
              trigger={["click"]}
              placement="bottomCenter"
              overlay={
                <Menu className="menu">
                  <Menu.Item key="version">版本信息：V1.2.0</Menu.Item>
                </Menu>
              }
            >
              <div
                style={{
                  margin: "0 15px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: 14,
                }}
              >
                <QuestionCircleFilled />
              </div>
            </Dropdown>
            <Dropdown overlay={menu} trigger={["click"]}>
              <div style={{ fontWeight: 500, fontSize: 14, cursor: "pointer" }}>
                {localStorage.getItem("username")}{" "}
                <CaretDownOutlined className={styles.userAvatarIcon} />
              </div>
            </Dropdown>
          </div>
        </Header>
        <Layout>
          <Sider width={240} className={styles.siteLayoutBackground}>
            <div className={styles.MenuTop}>
              <OmpEnvSelect />
            </div>
            <Menu
              mode="inline"
              style={{ height: "calc(100% - 52px)", borderRight: 0 }}
              theme="dark"
              onClick={onPathChange}
              onOpenChange={onOpenChange}
              openKeys={currentOpenedKeys}
              selectedKeys={selectedKeys}
            >
              <Menu.Item key="/homepage" icon={<DashboardOutlined />}>
                仪表盘
              </Menu.Item>
              {routerConfig.map((item) => {
                return (
                  <SubMenu
                    key={item.menuKey}
                    icon={item.menuIcon}
                    title={item.menuTitle}
                  >
                    {item.children.map((i) => {
                      return <Menu.Item key={i.path}>{i.title}</Menu.Item>;
                    })}
                  </SubMenu>
                );
              })}
            </Menu>
          </Sider>
          <Layout style={{ padding: "0 24px 24px" }}>
            <CustomBreadcrumb />
            <Content
              className={styles.siteLayoutBackground}
              style={{
                padding: 20,
                paddingTop: 0,
                margin: 0,
                height: 280,
                overflowY: "auto",
              }}
            >
              {props.children}
            </Content>
          </Layout>
        </Layout>
        {/* <OmpModal
          loading={isLoading}
          onFinish={onPassWordChange}
          visibleHandle={[showModal, setShowModal]}
          title="修改密码"
        >
          <Form.Item
            label="当前密码"
            name="old_password"
            key="old_password"
            rules={[
              {
                required: true,
                message: "请输入当前用户密码",
              },
            ]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="new_password1"
            key="new_password1"
            rules={[
              {
                required: true,
                message: "请输入新密码",
              },
            ]}
          >
            <Input.Password placeholder="请设置新密码" />
          </Form.Item>
          <Form.Item
            label="确认密码"
            name="new_password2"
            key="new_password2"
            useforminstanceinvalidator="true"
            rules={[
              {
                required: true,
                message: "请再次输入新密码",
              },
              {
                validator: (rule, value, callback, passwordModalForm) => {
                  if (
                    passwordModalForm.getFieldValue().new_password1 === value ||
                    !value
                  ) {
                    return Promise.resolve("success");
                  } else {
                    return Promise.reject("两次密码输入不一致");
                  }
                },
              },
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </OmpModal> */}
      </Layout>
      </context.Provider>
  );
};

export default OmpLayout;
