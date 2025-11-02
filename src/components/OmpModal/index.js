/*
 * @Author: your name
 * @Date: 2021-05-19 20:24:13
 * @LastEditTime: 2021-06-28 10:59:39
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /ompWeb/src/components/OmpModal/index.js
 */
import React from "react";
import { Modal, Button } from "antd";
/**
 * @name:
 * @test: test font
 * @msg:
 * @param {*} visibleHandle
 * @param {*} children
 * @return {*}
 */
const OmpModal = ({ visibleHandle, children, title, onOk, footer, loading=false, afterClose=()=>{}}) => {
  return (
    <Modal
      title={title}
      visible={visibleHandle[0]}
      onOk={() => onOk()}
      onCancel={() => visibleHandle[1](false)}
      footer={footer}
      destroyOnClose
      loading={loading}
      afterClose = {afterClose}
    >
      {children}
    </Modal>
  );
};

export default OmpModal;
