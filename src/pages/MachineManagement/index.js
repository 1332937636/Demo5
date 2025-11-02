import { TableRowButton } from "@/components";
import { apiRequest } from "@/config/requestApi";
import ContentWrapper from "@/layouts/ContentWrapper";
import styles from "@/pages/MachineManagement/index.module.less";
import { fetchGet, fetchPost } from "@/utils/request";
import {
  columnsConfig,
  handleResponse,
  isTableTextInvalid,
  paginationConfig,
  tableButtonHandler,
  renderFormattedTime,
  renderInformation,
  _idxInit,
  isValidIP,
} from "@/utils/utils";
import {
  AutoComplete,
  Badge,
  Button,
  Icon,
  Input,
  message,
  Spin,
  Table,
  Form,
  Select,
} from "antd";
// import { Table } from "antd";
import * as R from "ramda";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import updata from "@/stores/globalStore";
import OmpModal from "@/components/OmpModal";
import { fetchDelete } from "@/utils/request";
// import antdStyles from "antd/lib/table/style";
// import { ConfigProvider } from 'antd';
// import zh_CN from 'antd/lib/locale-provider/zh_CN';
// console.log(antdStyles);
/*eslint-disable*/
const MachineManagement = () => {
  const location = useLocation();
  const history = useHistory();
  const columns = [
    columnsConfig.machine_idx,
    //columnsConfig.ip,
    {
      title: "IP地址",
      width: 140,
      key: "ip",
      dataIndex: "ip",
      ellipsis: true,
      sorter: (a, b) => {
        if (!a.ip || !b.ip) return 0;

        const ip1 = a.ip
          .split(".")
          .map((el) => el.padStart(3, "0"))
          .join("");
        const ip2 = b.ip
          .split(".")
          .map((el) => el.padStart(3, "0"))
          .join("");
        return ip1 - ip2;
      },
      sortDirections: ["descend", "ascend"],
      align: "center",
      render: (text, record) => {
        let rotate = expandRowsKey.includes(record.id) ? 270 : 90;
        return (
          <span style={{ display: "flex", justifyContent: "space-around" }}>
            <span>{record.is_omp_host ? `${text}(OMP)` : text}</span>
            {/* <Icon
              rotate={rotate}
              style={{
                cursor: "pointer",
                color: "#3e91f7",
                position: "relative",
                top: 5,
                left: record.is_omp_host?6:0
              }}
              type="double-right"
            /> */}
          </span>
        );
      },
    },
    // columnsConfig.operating_system,
    // columnsConfig.configuration_information,
    columnsConfig.cpu_rate,
    columnsConfig.memory_rate,
    columnsConfig.disk_rate,
    {
      ...columnsConfig.disk_data_rate,
      width:120
    },
    {
      ...columnsConfig.ssh_state,
      width: 80,
    },
    {
      ...columnsConfig.agent_state,
      width: 80,
    },

    // columnsConfig.running_time,
    {
      title: "服务总数",
      width: 100,
      key: "service_number",
      dataIndex: "service_number",
      render: (text, record, index) => {
        if (isTableTextInvalid(text)) {
          return "-";
        } else if (Number(text) > 0) {
          return (
            <Badge dot={false}>
              <a
                onClick={() => {
                  history.push({
                    pathname: "/products-management/service",
                    state: {
                      host_ip: record.ip,
                    },
                  });
                }}
              >
                {`${text}`}个
              </a>
            </Badge>
          );
        } else {
          return `${text}个`;
        }
      },
      align: "center",
    },
    {
      title: "操作",
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
      align: "center",
      // fixed: "right",
      width: 100,
    },
  ];

  //主机添加操作数据
  const [addMachineForm, setAddMachineForm] = useState({
    username: undefined,
    password: undefined,
    ssh_port: undefined,
    ip: undefined,
  });

  //删除弹框的控制state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  //添加弹框的控制state
  const [addModalVisible, setAddMoadlVisible] = useState(false);

  const [isLoading, setLoading] = useState(false);
  const [usedData, setUsedData] = useState([]);
  const [unusedData, setUnusedData] = useState([]);
  const [checkedList, setCheckedList] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [searchValue, setSearchValue] = useState(
    location.state ? location.state.host_ip : ""
  );

  const [expandRowsKey, setExpandRowsKey] = useState([]);

  const [isSSHChecked, setIsSSHChecked] = useState(false);
  // 筛选状态
  const [sshFilter, setSshFilter] = useState('all'); // 'all', '0', '1'
  const [agentFilter, setAgentFilter] = useState('all'); // 'all', '0', '1', '2', '3'

  // 默认展示loading，但更新ssh状态可能等待较久，不在前台显示loading
  // 模拟数据
  const mockData = [
    {
      id: 1,
      ip: '192.168.1.100',
      is_omp_host: true,
      usage_status: 0,
      cpu: 8,
      memory: 16 * 1024 * 1024 * 1024,
      disk: 500 * 1024 * 1024 * 1024,
      cpu_rate: 30,
      memory_rate: 40,
      disk_rate: 50,
      disk_data_rate: 100,
      ssh_state: 0,
      agent_state: 2,
      service_number: 5,
      operating_system: 'CentOS 7.9',
      running_time: 86400 * 30, // 30天
    },
    {
      id: 2,
      ip: '192.168.1.101',
      is_omp_host: false,
      usage_status: 0,
      cpu: 16,
      memory: 32 * 1024 * 1024 * 1024,
      disk: 1000 * 1024 * 1024 * 1024,
      cpu_rate: 50,
      memory_rate: 60,
      disk_rate: 70,
      disk_data_rate: 200,
      ssh_state: 0,
      agent_state: 2,
      service_number: 3,
      operating_system: 'Ubuntu 20.04',
      running_time: 86400 * 15, // 15天
    },
    {
      id: 3,
      ip: '192.168.1.102',
      is_omp_host: false,
      usage_status: 1,
      cpu: 4,
      memory: 8 * 1024 * 1024 * 1024,
      disk: 250 * 1024 * 1024 * 1024,
      cpu_rate: 20,
      memory_rate: 30,
      disk_rate: 40,
      disk_data_rate: 50,
      ssh_state: 1,
      agent_state: 0,
      service_number: 0,
      operating_system: 'CentOS 7.8',
      running_time: 86400 * 10, // 10天
    },
  ];

  function fetchData(showLoading = true) {
    showLoading && setLoading(true);
    // 使用模拟数据代替API调用
    setTimeout(() => {
      try {
        const _used = mockData.filter((item) => item.usage_status === 0);
        const _unused = mockData.filter((item) => item.usage_status === 1);

        if (location.state && location.state.host_ip) {
          const result = R.filter(
            R.propEq("ip", location.state.host_ip),
            _used
          );
          setSearchData(result);
        }

        const ompHost = _used.filter((item) => item.is_omp_host);
        const unOmpHost = _used.filter((item) => !item.is_omp_host);
        const sorted_used = [...ompHost, ...unOmpHost];
        setUsedData(_idxInit(sorted_used));
        setUnusedData(_idxInit(_unused));

        // 每一项如果全都是1，就说明ssh状态无需更新
        let arr = _used.filter((item) => item.ssh_state !== 0);
        setIsSSHChecked(arr.length == 0);
      } catch (e) {
        console.log(e);
      } finally {
        setCheckedList([]);
        showLoading && setLoading(false);
      }
    }, 500); // 模拟网络延迟
  }

  useEffect(() => {
    fetchData();
  }, []);

  const currentPageData = location.pathname.includes("unused")
    ? unusedData
    : usedData;

  // 应用筛选条件
  const filteredData = currentPageData.filter(item => {
    const sshMatch = sshFilter === 'all' || item.ssh_state === parseInt(sshFilter);
    const agentMatch = agentFilter === 'all' || item.agent_state === parseInt(agentFilter);
    return sshMatch && agentMatch;
  });

  const datasource = Array.from(
    new Set(
      R.flatten(
        R.map((item) => R.values(R.pick(["ip"], item)), currentPageData)
      ).filter((i) => i && i)
    )
  );

  const operationMachine = (queryMethod, data) => {
    setLoading(true);    
    // 使用模拟数据代替API调用
    setTimeout(() => {
      try {
        if (queryMethod == "delete") {
          // 过滤掉被删除的项
          const updatedData = mockData.filter(
            (item) => !checkedList.some((checked) => checked.id === item.id)
          );
          
          // 更新模拟数据
          mockData.length = 0;
          mockData.push(...updatedData);
          
          setSearchData([]);
          setSearchValue("");
          fetchData();
          setDeleteModalVisible(false);
        } else if (queryMethod == "post") {
          delete data.passwordAgain;
          
          // 生成新的ID
          const newId = Math.max(...mockData.map((item) => item.id)) + 1;
          
          // 创建新主机对象
          const newHost = {
            id: newId,
            ip: data.ip,
            is_omp_host: false,
            usage_status: 0,
            cpu: 8,
            memory: 16 * 1024 * 1024 * 1024,
            disk: 500 * 1024 * 1024 * 1024,
            cpu_rate: 0,
            memory_rate: 0,
            disk_rate: 0,
            disk_data_rate: 0,
            ssh_state: 0,
            agent_state: 0,
            service_number: 0,
            operating_system: '',
            running_time: 0,
          };
          
          // 添加到模拟数据
          mockData.push(newHost);
          
          setSearchData([]);
          setSearchValue("");
          fetchData();
          setAddMoadlVisible(false);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setCheckedList([]);
        setLoading(false);
      }
    }, 500); // 模拟网络延迟
  };

  const validateFn = (data) => {
    for (let key in data) {
      if (!data[key]) {
        message.warn("输入数据不能为空");
        return false;
      }
    }
    if (!data.username) {
      message.warn("输入数据不能为空");
      return false;
    }
    if (!data.password) {
      message.warn("输入数据不能为空");
      return false;
    }
    if (!data.ssh_port) {
      message.warn("输入数据不能为空");
      return false;
    }
    if (/[\u4E00-\u9FA5]/g.test(data.password)) {
      message.warn("密码不支持中文");
      return false;
    }
    if (!data.ip) {
      message.warn("输入数据不能为空");
      return false;
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

  return (
    <ContentWrapper>
      <Spin spinning={isLoading}>
        {/* 筛选器 */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>SSH状态：</span>
            <Select
              value={sshFilter}
              onChange={setSshFilter}
              style={{ width: 120 }}
              options={[
                { value: 'all', label: '全部' },
                { value: '0', label: '正常' },
                { value: '1', label: '异常' }
              ]}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Agent状态：</span>
            <Select
              value={agentFilter}
              onChange={setAgentFilter}
              style={{ width: 120 }}
              options={[
                { value: 'all', label: '全部' },
                { value: '0', label: '未安装' },
                { value: '1', label: '安装中' },
                { value: '2', label: '已安装' },
                { value: '3', label: '安装失败' }
              ]}
            />
          </div>
          <Button
            type="default"
            onClick={() => {
              setSshFilter('all');
              setAgentFilter('all');
            }}
          >
            重置筛选
          </Button>
        </div>
        <div className={styles.warningSearch}>
          <div>
            <Button
              style={{ marginRight: 15 }}
              //type="primary"
              onClick={() => fetchData()}
            >
              刷新
              {/* <Icon type="sync" spin={isLoading} /> */}
            </Button>
            <Button
              type="primary"
              style={{ marginRight: 15 }}
              onClick={() => {
                if (checkedList.length === 0) {
                  message.warn("请选择要下发的主机");
                } else {
                  setLoading(true);
                  
                  // 使用模拟数据代替API调用
                  setTimeout(() => {
                    try {
                      // 更新模拟数据中的agent_state
                      checkedList.forEach((checkedItem) => {
                        const host = mockData.find((item) => item.id === checkedItem.id);
                        if (host) {
                          host.agent_state = 2; // 设置为已下发状态
                        }
                      });
                      
                      message.success("Agent下发成功");
                      fetchData(true);
                      setSearchData([]);
                      setSearchValue("");
                    } catch (e) {
                      console.log(e);
                    } finally {
                      setLoading(false);
                    }
                  }, 500); // 模拟网络延迟
                }
              }}
            >
              Agent下发
            </Button>
            <Button
              disabled={isSSHChecked}
              type="primary"
              onClick={() => {
                message.success("开始查询更新ssh状态");
                
                // 使用模拟数据代替API调用
                setTimeout(() => {
                  try {
                    // 随机更新ssh状态
                    mockData.forEach((host) => {
                      // 50%的概率将ssh_state设置为0（正常）或1（异常）
                      host.ssh_state = Math.random() > 0.5 ? 0 : 1;
                    });
                    
                    fetchData(false);
                    setSearchData([]);
                    setSearchValue("");
                    message.success("SSH状态更新完成");
                  } catch (e) {
                    console.log(e);
                  }
                }, 1000); // 模拟网络延迟
              }}
            >
              更新SSH状态
            </Button>
          </div>
          <div>
            <Button
              style={{ marginRight: 15 }}
              type={checkedList.length > 0 ? "danger" : null}
              onClick={() => {
                if (checkedList.length == 0) {
                  message.warn("请先选择要删除的主机");
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
              onClick={() => {
                setAddMoadlVisible(true);
                setAddMachineForm({});
              }}
            >
              添加
            </Button>
            {/* 仅在已使用主机页面保留刷新按钮*/}
            {/* {location.pathname.includes("machine-management/used") && (
              <> */}

            {/* </>
            )} */}
            <AutoComplete
              allowClear
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 200 }}
              style={{ width: 200 }}
              value={searchValue}
              dataSource={datasource ? datasource : []}
              onSelect={(value) => {
                const result = R.filter(R.propEq("ip", value), currentPageData);
                setSearchData(result);
              }}
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
              placeholder="请输入IP"
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
        {/* <ConfigProvider locale={zh_CN}> */}
        <Table
            rowClassName={styles.machineTable}
            // expandIcon={()=><span><span ><Icon style={{transform:"rotate(90deg)"}} type="double-right" /></span></span>}
            size={"small"}
            //tableLayout="auto"
            rowKey={(record) => record.id}
            // scroll={{ x: 1200 }}
            rowSelection={{
              onSelect: (record, selected, selectedRows) =>
                setCheckedList(selectedRows),
              onSelectAll: (selected, selectedRows, changeRows) =>
                setCheckedList(selectedRows),
              getCheckboxProps: (record) => ({
                //不是0，不是1就发
                // ssh状态不能是1
                // disabled:
                //   record.agent_state === 0 ||
                //   record.agent_state === 1 ||
                //   record.ssh_state === 1,
              }),
              selectedRowKeys: checkedList.map((item) => item.id),
            }}
            columns={columns}
            expandRowByClick={true}
            pagination={paginationConfig(
              searchData.length > 0 ? searchData : filteredData
            )}
            expandIconColumnIndex={-1}
            expandIconAsCell={false}
            dataSource={searchData.length > 0 ? searchData : filteredData}
            // expandable={{
            //   expandedRowRender: (record) => {
            //     return <p className={styles.antdTableExpandedRow}>
            //       <span>操作系统:{record["operating_system"]}</span>
            //       <span>配置信息:{renderInformation(null,record)}</span>
            //       <span>运行时长:{renderFormattedTime(record["running_time"])}</span>
            //     </p>;
            //   },
            //   // rowExpandable: record => record.name !== 'Not Expandable',
            // }}
            expandedRowRender={(record) => {
              return (
                <p className={styles.antdTableExpandedRow}>
                  <span>操作系统:{record["operating_system"]}</span>
                  <span>配置信息:{renderInformation(null, record)}</span>
                  <span>
                    运行时长:{renderFormattedTime(record["running_time"])}
                  </span>
                </p>
              );
            }}
            onExpandedRowsChange={(row) => {
              setExpandRowsKey(row);
            }}
          />
        {/* </ConfigProvider> */}
      </Spin>
      <OmpModal
        visibleHandle={[deleteModalVisible, setDeleteModalVisible]}
        title="删除"
        onOk={() => {
          operationMachine("delete");
          //console.log(checkedList);
          //serviceOperation("start");
        }}
      >
        <div>
          是否确认 <span style={{ color: "#ed5b56" }}>删除</span> 所选 主机 (共
          {checkedList.length}个) ？
          <p style={{ position: "relative", top: 10, fontSize: 13 }}>
            <Icon
              style={{ fontSize: 16, color: "red", marginRight: 10 }}
              type="warning"
            />
            执行此操作会导致该主机下的<span style={{ color: "#ed5b56" }}></span>
            服务被删除！
          </p>
        </div>
      </OmpModal>

      <OmpModal
        visibleHandle={[addModalVisible, setAddMoadlVisible]}
        title="新增主机"
        onOk={() => {
          // operationMachine("delete")
          // console.log(checkedList)
          //serviceOperation("start");
          if (validateFn(addMachineForm)) {
            operationMachine("post", addMachineForm);
          }
        }}
      >
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
      </OmpModal>
    </ContentWrapper>
  );
};

export default MachineManagement;
/*eslint-disable*/
