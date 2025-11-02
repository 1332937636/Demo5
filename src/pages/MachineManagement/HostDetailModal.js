import React from 'react';
import { Modal, Descriptions, Badge } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const HostDetailModal = ({ visible, hostData, onClose }) => {
  if (!hostData) return null;

  const getStatusBadge = (usage_status) => {
    switch (usage_status) {
      case 0:
        return <Badge status="error" text="离线" />;
      case 1:
        return <Badge status="success" text="在线" />;
      default:
        return <Badge status="default" text="未知" />;
    }
  };

  const getAgentStatus = (status) => {
    switch (status) {
      case 0:
        return <Badge status="error" text="未安装" />;
      case 1:
        return <Badge status="success" text="已安装" />;
      case 2:
        return <Badge status="processing" text="安装中" />;
      default:
        return <Badge status="default" text="未知" />;
    }
  };

  const getSSHStatus = (status) => {
    switch (status) {
      case 0:
        return <Badge status="error" text="异常" />;
      case 1:
        return <Badge status="success" text="正常" />;
      default:
        return <Badge status="default" text="未知" />;
    }
  };

  return (
    <Modal
      title="主机详情"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="IP地址">{hostData.ip}</Descriptions.Item>
        <Descriptions.Item label="主机状态">{getStatusBadge(hostData.usage_status)}</Descriptions.Item>
        <Descriptions.Item label="Agent状态">{getAgentStatus(hostData.agent_state)}</Descriptions.Item>
        <Descriptions.Item label="SSH状态">{getSSHStatus(hostData.ssh_state)}</Descriptions.Item>
        <Descriptions.Item label="CPU使用率">{hostData.cpu_rate}%</Descriptions.Item>
        <Descriptions.Item label="内存使用率">{hostData.memory_rate}%</Descriptions.Item>
        <Descriptions.Item label="磁盘使用率">{hostData.disk_rate}%</Descriptions.Item>
        <Descriptions.Item label="磁盘数据率">{hostData.disk_data_rate}</Descriptions.Item>
        <Descriptions.Item label="服务总数">{hostData.service_number}</Descriptions.Item>
        <Descriptions.Item label="是否OMP主机">{hostData.is_omp_host ? '是' : '否'}</Descriptions.Item>
        <Descriptions.Item label="最后在线时间">{hostData.last_online_time}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default HostDetailModal;