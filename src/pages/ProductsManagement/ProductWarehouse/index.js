/*
 * @Author: your name
 * @Date: 2021-06-18 15:55:29
 * @LastEditTime: 2021-06-18 19:05:54
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /ompWeb/src/pages/ProductsManagement/ProductWarehouse/index.js
 */

import React, { useState, useEffect } from "react";
import ContentWrapper from "@/layouts/ContentWrapper";
import styles from "./index.less";
import { Button, Badge, Table, Icon } from "antd";
import { fetchGet } from "@/utils/request";
import { columnsConfig, handleResponse, _idxInit } from "@/utils/utils";
import { apiRequest } from "@/config/requestApi";
import OmpModal from "@/components/OmpModal";
/*eslint-disable*/
const ProductWarehouse = () => {
  const [isLoading, setLoading] = useState(false);
  const [checkedList, setCheckedList] = useState([]);
  // -------------------------------------------------------------------------------------------------------------------------------
  // 默认展示loading，但更新ssh状态可能等待较久，不在前台显示loading
  const [usedData, setUsedData] = useState([]);
  const [expandRowsKey, setExpandRowsKey] = useState([]);

  const columns = [
    //columnsConfig.machine_idx,
    //columnsConfig.ip,
    {
      title: "功能模块",
      //width: 120,
      key: "ip12",
      dataIndex: "ip12",
      ellipsis: true,
      // sorter: (a, b) => {
      //   if (!a.ip || !b.ip) return 0;

      //   const ip1 = a.ip
      //     .split(".")
      //     .map((el) => el.padStart(3, "0"))
      //     .join("");
      //   const ip2 = b.ip
      //     .split(".")
      //     .map((el) => el.padStart(3, "0"))
      //     .join("");
      //   return ip1 - ip2;
      // },
      sortDirections: ["descend", "ascend"],
      align: "center",
      render: (text, record) => {
        let rotate = expandRowsKey.includes(record.id) ? 270 : 90;
        return text ? (
          <span>
            <span>{text}</span>
          </span>
        ) : (
          <>
            配置中心{" "}
            <Icon
              rotate={rotate}
              style={{
                cursor: "pointer",
                color: "#3e91f7",
                position: "relative",
                left: 30,
                //top: 5,
              }}
              type="double-right"
            />
          </>
        );
      },
    },
    {
      title: "名称",
      dataIndex: "name",
      // render: function renderFunc(text, record, index) {
      //   return (
      //     <TableRowButton
      //       buttonsArr={[
      //         {
      //           btnText: "监控",
      //           btnHandler: () => tableButtonHandler(record),
      //         },
      //         {
      //           btnText: "分析",
      //           btnHandler: () => history.push("/operation-management/report"),
      //         },
      //       ]}
      //     />
      //   );
      // },
    },
    {
      title: "地址",
      dataIndex: "address",
    },
    {
      title: "年龄",
      dataIndex: "age",
    },
  ];

  function fetchData(showLoading = true) {
    showLoading && setLoading(true);
    fetchGet(apiRequest.machineManagement.hosts)
      .then((res) => {
        handleResponse(res, () => {
          // eslint-disable-next-line max-nested-callbacks
          const _used = res.data.filter((item) => item.usage_status === 0);
          // eslint-disable-next-line max-nested-callbacks
          const _unused = res.data.filter((item) => item.usage_status === 1);
          let dataSource = _idxInit(_used);
          console.log(dataSource);
          let mock = [
            {
              key: 131,
              name: "Jim Green",
              age: 42,
              address: "London No. 2 Lake Park",
              ip12: "Jim Green",
            },
            {
              key: 1311,
              name: "Jim Green jr.",
              age: 25,
              address: "London No. 3 Lake Park",
              ip12: "Jim Green jr.",
            },
          ];
          let ne1231w = dataSource.map((item) => {
            item.children = [...mock];
            return item;
          });
          ne1231w.push({ ...ne1231w[0] });
          ne1231w[1].children.push({
            key: 1311,
            name: "Jim G12321n jr.",
            age: 25,
            address: "Lon1123don No. 3 Lake Park",
            ip12: "Jim G123en jr.",
          });
          console.log(ne1231w);
          setUsedData(ne1231w);
          //setUnusedData(_idxInit(_unused));
        });
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setCheckedList([]);
        showLoading && setLoading(false);
      });
  }

  useEffect(() => {
    fetchData();
  }, []);
  // -----------------------------------------------------------------------------------------------------------------------------
  const [uploadModal, setUploadModal] = useState(false)
  const [isBtnLoading, setIsBtnLoading] = useState(false)
  return (
    <ContentWrapper>
      <div className={styles.warningSearch}>
        <div>
          <Button
            //style={{ marginRight: 15 }}
            type="primary"
            onClick={() => setUploadModal(true)}
          >
            上传
          </Button>
        </div>
      </div>

      <Table
        // expandIcon={()=><span><span ><Icon style={{transform:"rotate(90deg)"}} type="double-right" /></span></span>}
        size={"small"}
        //tableLayout="auto"
        rowKey={(record) => record.id}
        defaultExpandAllRows={true}
        scroll={{ x: 1100 }}
        rowClassName={(record, index) => {
          console.log(record, index);
          if (record.id) return "parentRow_";
        }}
        // rowSelection={{
        //   onSelect: (record, selected, selectedRows) =>
        //     setCheckedList(selectedRows),
        //   onSelectAll: (selected, selectedRows, changeRows) =>
        //     setCheckedList(selectedRows),
        //   getCheckboxProps: (record) => ({
        //     //不是0，不是1就发
        //     // ssh状态不能是1
        //     // disabled:
        //     //   record.agent_state === 0 ||
        //     //   record.agent_state === 1 ||
        //     //   record.ssh_state === 1,
        //   }),
        //   selectedRowKeys: checkedList.map((item) => item.id),
        // }}
        columns={columns}
        expandRowByClick={true}
        // pagination={paginationConfig(
        //   searchData.length > 0 ? searchData : currentPageData
        // )}
        expandIconColumnIndex={-1}
        expandIconAsCell={false}
        dataSource={usedData}
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
        // expandedRowRender={(record) => {
        //   return (
        //     <p className={styles.antdTableExpandedRow}>
        //       <span>操作系统:{record["operating_system"]}</span>
        //       {/* <span>配置信息:{renderInformation(null, record)}</span>
        //       <span>
        //         运行时长:{renderFormattedTime(record["running_time"])}
        //       </span> */}
        //     </p>
        //   );
        // }}
        onExpandedRowsChange={(row) => {
          setExpandRowsKey(row);
        }}
      />
      <OmpModal
      title="升级"
      visibleHandle={[uploadModal, setUploadModal]}
      onOk={() => {
        // operationMachine("delete")
        // console.log(checkedList)
        //serviceOperation("start");
        // if(validateFn(addMachineForm)){
        //   operationMachine("post",addMachineForm)
        // }
      }}
      footer={
        [
          <Button key="back" onClick={()=>setUploadModal(false)}>
            取消
          </Button>,
          <Button key="submit" loading={isBtnLoading} type="primary">
            开始安装
          </Button>,
        ]
      }
      >
        升级
      </OmpModal>
    </ContentWrapper>
  );
};
/*eslint-disable*/
export default ProductWarehouse;
