import { apiRequest } from "@/config/requestApi";
import ContentWrapper from "@/layouts/ContentWrapper";
import styles from "@/pages/MachineManagement/index.less";
import { fetchGet } from "@/utils/request";
import { columnsConfig, handleResponse, paginationConfig, _idxInit } from "@/utils/utils";
import { AutoComplete, Icon, Input, Spin, Table } from "antd";
import * as R from "ramda";
import React, { useEffect, useState } from "react";

const LoginRecord = () => {
  const [isLoading, setLoading] = useState(false);
  const [allData, setAllData] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchGet(apiRequest.log.loginLog, {
      params: {
        username: localStorage.getItem("username")
          ? localStorage.getItem("username")
          : "admin",
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

  const columns = [
    columnsConfig.service_idx,
    columnsConfig.username,
    columnsConfig.ip,
    columnsConfig.role,
    columnsConfig.login_time,
  ];

  const datasource = Array.from(
    new Set(
      R.flatten(R.map((item) => R.values(R.pick(["username"], item)), allData))
    ).filter(i=>i&&i)
  );

  return (
    <ContentWrapper>
      <Spin spinning={isLoading}>
        <div className={styles.warningSearch}>
          <div>
            <AutoComplete
              allowClear
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 200 }}
              style={{ width: 200 }}
              dataSource={datasource ? datasource : []}
              onSelect={(value) => {
                const result = R.filter(R.propEq("username", value), allData);
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
              placeholder="请输入用户名"
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
        />
      </Spin>
    </ContentWrapper>
  );
};

export default LoginRecord;
