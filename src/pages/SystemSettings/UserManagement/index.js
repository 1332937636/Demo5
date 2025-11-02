import { apiRequest } from "@/config/requestApi";
import ContentNav from "@/layouts/ContentNav";
import ContentWrapper from "@/layouts/ContentWrapper";
import { fetchGet } from "@/utils/request";
import {
  columnsConfig,
  handleResponse,
  isTableTextInvalid,
  paginationConfig,
  _idxInit,
} from "@/utils/utils";
import {
  AutoComplete,
  Badge,
  Icon,
  Input,
  message,
  Spin,
  Table,
} from "antd";
import * as R from "ramda";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "../index.less";

export default function UserManagement(props) {
  const [isLoading, setLoading] = useState(false);
  const [currentList, setCurrentList] = useState("user");
  const [roleListData, setRoleListData] = useState([]);
  const [allUsersData, setAllUsersData] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchGet(apiRequest.userManagement.allUsers, {
        params: {
          role_name: localStorage.getItem("role")
            ? localStorage.getItem("role")
            : "superuser",
        },
      }),
      fetchGet(apiRequest.userManagement.roleList, {
        params: {
          role_name: localStorage.getItem("role")
            ? localStorage.getItem("role")
            : "superuser",
        },
      }),
    ])
      .then(([allUsers, roleList]) => {
        if (allUsers.code === 3) {
          message.warn("登录已过期，请重新登录");

          localStorage.clear();
          window.__history__.replace("/login");
          return;
        }
        handleResponse(allUsers, () =>
          setAllUsersData(_idxInit(allUsers.data))
        );
        handleResponse(roleList, () =>
          setRoleListData(_idxInit(roleList.data))
        );
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const contentNavData = [
    {
      name: "user",
      text: "用户管理",
      handler: () => {
        if (currentList !== "user") {
          setCurrentList("user");
          setSearchData([]);
          setSearchValue("");
        }
      },
    },
    {
      name: "role",
      text: "角色管理",
      handler: () => {
        if (currentList !== "role") {
          setCurrentList("role");
          setSearchData([]);
          setSearchValue("");
        }
      },
    },
  ];

  const columnsUser = [
    columnsConfig.service_idx,
    columnsConfig.username,
    columnsConfig.role,
    columnsConfig.status,
    columnsConfig.date_joined,
    columnsConfig.desc,
    {
      title: "用户操作",
      dataIndex: "",
      // 此版本暂时不做修改他人密码
      // eslint-disable-next-line react/display-name
      render: () => <div style={{ color: "#d9d9d9" }}>修改密码</div>,
      // render: function renderFunc (text, record, index) {
      //   return <TableRowButton buttonsArr={[{
      //     btnText: '修改密码',
      //     btnHandler: () => console.log('改密码')
      //   }]}/>;
      // },
      align: "center",
      width: 150,
    },
  ];

  const columnsRole = [
    columnsConfig.service_idx,
    columnsConfig.role,
    columnsConfig.permission_count,
    {
      title: "用户个数",
      width: 120,
      key: "role_user_count",
      dataIndex: "role_user_count",
      render: (text, record, index) => {
        if (isTableTextInvalid(text)) {
          return "-";
        } else {
          if (record.role_user_count > 0) {
            return (
              <Badge dot={false}>
                <a
                  onClick={() => {
                    setCurrentList("user");
                    setSearchValue(record.role);
                    const result = R.filter(
                      R.propEq("role", record.role),
                      allUsersData
                    );
                    setSearchData(result);
                  }}
                >
                  {text}个
                </a>
              </Badge>
            );
          } else {
            return `${text}个`;
          }
        }
      },
      align: "center",
    },
    columnsConfig.date_joined,
    columnsConfig.desc,
  ];

  const contentMap = {
    user: {
      columns: columnsUser,
      data: allUsersData,
    },
    role: {
      columns: columnsRole,
      data: roleListData,
    },
  };

  const currentPageData = contentMap[currentList].data;

  const datasource = Array.from(
    new Set(
      R.flatten(
        R.map((item) => R.values(R.pick(["role"], item)), currentPageData)
      )
    ).filter(i=>i&&i)
  );

  return (
    <ContentWrapper>
      <Spin spinning={isLoading}>
        <ContentNav data={contentNavData} currentFocus={currentList} />
        <div className={styles.warningSearch}>
          <AutoComplete
            allowClear
            dropdownMatchSelectWidth={false}
            dropdownStyle={{ width: 200 }}
            style={{ width: 200 }}
            dataSource={datasource ? datasource : []}
            onSelect={(value) => {
              const result = R.filter(R.propEq("role", value), currentPageData);
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
            placeholder="请输入角色名"
            optionLabelProp="value"
          >
            <Input
              suffix={<Icon type="search" className="certain-category-icon" />}
            />
          </AutoComplete>
        </div>
        {currentList == "role" && (
          <Table
            size={"small"}
            rowKey={(record, index) => index}
            columns={contentMap[currentList].columns}
            pagination={paginationConfig(
              searchData.length > 0 ? searchData : currentPageData
            )}
            dataSource={searchData.length > 0 ? searchData : currentPageData}
          />
        )}
        {currentList == "user" && (
          <Table
            size={"small"}
            rowKey={(record, index) => index}
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
