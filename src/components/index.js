/*
 * @Author: your name
 * @Date: 2021-05-12 15:17:59
 * @LastEditTime: 2021-06-22 14:46:49
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /domh/ompWeb/src/components/index.js
 */
import { Button, Input, Modal } from "antd";
import React, { useState } from "react";
import styles from "./index.module.less";

/**
 * 用于渲染表格中每一行的操作按钮，文字和回调函数外部传入
 * [{btnText: string, btnHandler: func}]
 * @param buttonsArr
 * @returns {JSX.Element}
 * @constructor
 */
export function TableRowButton({ buttonsArr }) {
  return (
    <div className={styles.listButton}>
      {buttonsArr.map((item, idx) => {
        return (
          <div key={idx} onClick={() => item.btnHandler()}>
            {item.btnText}
          </div>
        );
      })}
    </div>
  );
}

export function SaveSettingsButtonGroup({ saveHandler = () => ({}),disabled = false, style={}, title="保存"}) {
  return (
    <div className={styles.saveButtonWrapper}>
      <Button
        onClick={() => saveHandler()}
        type={"primary"}
        style={{ marginRight: 15,...style }}
        disabled={disabled}
      >
        {title}
      </Button>
    </div>
  );
}

export function ChangePassword({ visible, onCancel, onCreate }) {
  const [oldPassword, setOldPassword] = useState(null);
  const [newPassword, setNewPassword] = useState(null);
  const [confirmNewPassword, setConfirmNewPassword] = useState(null);

  return (
    <Modal
      centered
      visible={visible}
      title="修改密码"
      cancelText="取消"
      okText="修改"
      onCancel={onCancel}
      onOk={() => onCreate([oldPassword, newPassword, confirmNewPassword])}
      destroyOnClose
    >
      <div className={styles.formItem}>
        <span>旧密码：</span>
        <Input
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder={"旧密码"}
        />
      </div>

      <div className={styles.formItem}>
        <span>请输入新密码：</span>
        <Input
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder={"请输入新密码"}
        />
      </div>

      <div className={styles.formItem}>
        <span>请再输入一次：</span>
        <Input
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          placeholder={"请再输入一次"}
        />
      </div>
    </Modal>
  );
}
