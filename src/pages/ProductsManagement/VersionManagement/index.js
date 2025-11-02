import { apiRequest } from "@/config/requestApi";
import ContentWrapper from "@/layouts/ContentWrapper";
import styles from "./index.less";
import { fetchGet } from "@/utils/request";
import { columnsConfig, handleResponse, paginationConfig, _idxInit } from "@/utils/utils";
import { AutoComplete, Icon, Input, Spin, Table, Button } from "antd";
import * as R from "ramda";
import React, { useEffect, useState,useContext } from "react";
import { useHistory, useLocation } from "react-router-dom";
//import { context } from "@/Root";
const VersionManagement = ({ children }) => {
  const history = useHistory();
  const location = useLocation();
  const [isLoading, setLoading] = useState(false);
  const [allData, setAllData] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  //const appContext = useContext(context);
  useEffect(() => {
    setLoading(true);
    fetchGet(apiRequest.productSettings.versionHistoryList, {
      params: {
      },
    })
      .then((res) => {
        handleResponse(res, () => setAllData(_idxInit(res.data)));
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  }, []);

/*eslint-disable*/
const task_name = {
  title: "任务名称",
  key: "task_name",
  dataIndex: "task_name",
  align: "center",
  //ellipsis: true,
  width: 120,
  render: (text, record) => {
    if(record.data_source == "text"){
      return <span>{text}</span>
    }else{
      return (
        <a
          onClick={() => {
            history.push({
              pathname: "/products-management/version/installationDetails",
              state: {
                uuid: record.operation_uuid,
              },
            });
          }}
        >
          {text}
        </a>
      );
    }
  },
}

  const columns = [
    columnsConfig.service_idx,
    task_name,
    columnsConfig.operator,
    columnsConfig.install_process,
    columnsConfig.verson_start_time,
    columnsConfig.verson_end_time,
    columnsConfig.use_time
  ];

  const datasource = Array.from(
    new Set(
      R.flatten(R.map((item) => R.values(R.pick(["task_name"], item)), allData))
    ).filter(i=>i&&i)
  );
  
  // 判断当路由加载数据下载页面时，当前组件不再渲染列表而是为数据下载页面提供容器
  if(
    location.pathname.endsWith("/version/upload") || 
    location.pathname.endsWith("/version/rapidDeployment")
  || location.pathname.endsWith("/version/installationDetails")
  ){
    return (
      <div className={styles.contentWrapper}>{children}</div>
    );
  }else{
    return (
      <ContentWrapper>
        <Spin spinning={isLoading}>
          <div className={styles.warningSearch}>
            <div className={styles.buttonContainer}>
              <Button
                //style={{ marginRight: 15 }}
                type="primary"
                onClick={() => history.push("/products-management/version/rapidDeployment")}
              >
                快速部署
              </Button>
              <Button
                //style={{ marginRight: 15 }}
                type="primary"
                onClick={() => {
                //   appContext.dispatch({
                //   type: "ENVIRONMENT_LISTANDVALUE_CHANGE",
                //   payload: {
                //     list: [],
                //     // value: newEnv[0]?.id,
                //     // text: newEnv[0]?.env_name,
                //   },
                // });;
                history.push("/products-management/version/upload")}}
              >
                环境纳管
              </Button>
            </div>
            <div>
              <AutoComplete
                allowClear
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 200 }}
                style={{ width: 200 }}
                dataSource={datasource ? datasource : []}
                onSelect={(value) => {
                  const result = R.filter(R.propEq("task_name", value), allData);
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
                placeholder="请输入任务名称"
                optionLabelProp="value"
              >
                <Input
                  suffix={
                    <Icon type="search" className="certain-category-icon" />
                  }
                />
              </AutoComplete>
            </div>
          </div>
  
          <Table
            size={"small"}
            rowKey={(record, index) => index}
            columns={columns}
            pagination={paginationConfig(
              searchData.length > 0 ? searchData : allData
            )}
            dataSource={searchData.length > 0 ? searchData : allData}
            locale={{
              emptyText:<div className={styles.emptyText}>
                <p>暂无数据</p>
                <p>请点击 <span style={{color:"#84abf9",cursor:"pointer"}} onClick={() => history.push("/products-management/version/rapidDeployment")}>快速部署</span> ,进行部署</p>
                {/* <Button
                style={{ marginBottom: 10 }}
                type="primary"
                onClick={() => history.push("/products-management/version/rapidDeployment")}
              >
                快速部署
              </Button> */}
              <p>如果已经部署完成点击 <span style={{color:"#84abf9",cursor:"pointer"}} onClick={() => history.push("/products-management/version/upload")}>环境纳管</span> ,完成新的命名空间添加</p>
              </div>
            }}
          />
        </Spin>
      </ContentWrapper>
    );
  }
};
/*eslint-disable*/

export default VersionManagement;
