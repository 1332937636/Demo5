import React from 'react';
import { Modal, Descriptions, Badge, Collapse } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

// 健康度计算工具函数
const calculateHealthScore = (hostData) => {
  // SSH状态分计算 (0-100)
  const getSSHScore = (ssh_state) => {
    switch (ssh_state) {
      case 0: return 100; // 正常
      case 1: return 0; // 异常
      default: return 50; // 未知
    }
  };

  // Agent状态分计算 (0-100)
  const getAgentScore = (agent_state) => {
    switch (agent_state) {
      case 0: return 100; // 已安装
      case 1: return 0; // 未安装
      case 2: return 50; // 安装中
      default: return 25; // 未知
    }
  };

  // CPU健康分计算 (0-100)
  const getCPUScore = (cpu_rate) => {
    if (cpu_rate <= 50) return 100;
    if (cpu_rate <= 70) return 80;
    if (cpu_rate <= 85) return 60;
    if (cpu_rate <= 95) return 40;
    return 20;
  };

  // 内存健康分计算 (0-100)
  const getMemoryScore = (memory_rate) => {
    if (memory_rate <= 60) return 100;
    if (memory_rate <= 75) return 80;
    if (memory_rate <= 85) return 60;
    if (memory_rate <= 95) return 40;
    return 20;
  };

  // 磁盘健康分计算 (0-100)
  const getDiskScore = (disk_rate) => {
    if (disk_rate <= 70) return 100;
    if (disk_rate <= 80) return 80;
    if (disk_rate <= 90) return 60;
    if (disk_rate <= 95) return 40;
    return 20;
  };

  // 服务数量分计算 (0-100)
  const getServiceScore = (service_number) => {
    if (service_number === 0) return 100;
    if (service_number <= 5) return 80;
    if (service_number <= 10) return 60;
    if (service_number <= 20) return 40;
    return 20;
  };

  // 运行时长分计算 (0-100)
  const getRunningTimeScore = (running_time) => {
    const days = running_time / 86400;
    if (days <= 7) return 100;
    if (days <= 14) return 80;
    if (days <= 30) return 60;
    if (days <= 60) return 40;
    return 20;
  };

  // 计算各项指标得分
  const sshScore = getSSHScore(hostData.ssh_state);
  const agentScore = getAgentScore(hostData.agent_state);
  const cpuScore = getCPUScore(hostData.cpu_rate);
  const memoryScore = getMemoryScore(hostData.memory_rate);
  const diskScore = getDiskScore(hostData.disk_rate);
  const serviceScore = getServiceScore(hostData.service_number);
  const runningTimeScore = getRunningTimeScore(hostData.running_time);

  // 计算基础稳定性分
  const basicStabilityScore = Math.round(sshScore * 0.5 + agentScore * 0.5);

  // 计算性能表现分
  const performanceScore = Math.round(cpuScore * 0.4 + memoryScore * 0.4 + diskScore * 0.2);

  // 计算服务状态分
  const serviceStatusScore = Math.round(serviceScore * 0.6 + runningTimeScore * 0.4);

  // 计算健康度总分
  const totalScore = Math.round(basicStabilityScore * 0.4 + performanceScore * 0.3 + serviceStatusScore * 0.3);

  // 获取健康度等级
  const getHealthLevel = (score) => {
    if (score >= 90) return { level: '优秀', color: '#52c41a' };
    if (score >= 70) return { level: '良好', color: '#faad14' };
    if (score >= 50) return { level: '一般', color: '#fa8c16' };
    return { level: '较差', color: '#f5222d' };
  };

  // 获取优化建议
  const getOptimizationSuggestions = () => {
    const suggestions = [];

    if (sshScore < 100) {
      suggestions.push('SSH状态异常，建议检查SSH服务是否正常运行');
    }

    if (agentScore < 100) {
      if (hostData.agent_state === 1) {
        suggestions.push('Agent未安装，建议安装Agent以获得更好的监控体验');
      } else if (hostData.agent_state === 2) {
        suggestions.push('Agent正在安装中，请耐心等待');
      } else {
        suggestions.push('Agent状态未知，建议检查Agent服务状态');
      }
    }

    if (cpuScore < 100) {
      suggestions.push(`CPU使用率较高 (${hostData.cpu_rate}%)，建议优化应用程序或升级CPU`);
    }

    if (memoryScore < 100) {
      suggestions.push(`内存使用率较高 (${hostData.memory_rate}%)，建议优化应用程序或增加内存`);
    }

    if (diskScore < 100) {
      suggestions.push(`磁盘使用率较高 (${hostData.disk_rate}%)，建议清理磁盘空间或升级存储`);
    }

    if (serviceScore < 100) {
      suggestions.push(`运行服务数量较多 (${hostData.service_number}个)，建议检查并关闭不必要的服务`);
    }

    if (runningTimeScore < 100) {
      suggestions.push(`主机运行时间较长 (${Math.round(hostData.running_time / 86400)}天)，建议考虑重启以释放资源`);
    }

    if (suggestions.length === 0) {
      suggestions.push('主机各项指标正常，无需优化');
    }

    return suggestions;
  };

  return {
    totalScore,
    basicStabilityScore,
    performanceScore,
    serviceStatusScore,
    breakdown: {
      sshScore,
      agentScore,
      cpuScore,
      memoryScore,
      diskScore,
      serviceScore,
      runningTimeScore
    },
    level: getHealthLevel(totalScore),
    suggestions: getOptimizationSuggestions()
  };
};

const { Panel } = Collapse;

const HostDetailModal = ({ visible, hostData, onClose }) => {

  const healthScore = calculateHealthScore(hostData);

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
        <Descriptions.Item label="健康度总分">
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: healthScore.level.color }}>
            {healthScore.totalScore}分
          </span>
          <span style={{ marginLeft: 8, color: healthScore.level.color }}>
            ({healthScore.level.level})
          </span>
        </Descriptions.Item>
      </Descriptions>

      <Collapse style={{ marginTop: 16 }}>
        <Panel header="健康度详情" key="1">
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>各项指标得分</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 32px' }}>
              <div>
                <span style={{ color: '#666', marginRight: 8 }}>基础稳定性:</span>
                <span>{healthScore.basicStabilityScore}分</span>
              </div>
              <div>
                <span style={{ color: '#666', marginRight: 8 }}>性能表现:</span>
                <span>{healthScore.performanceScore}分</span>
              </div>
              <div>
                <span style={{ color: '#666', marginRight: 8 }}>服务状态:</span>
                <span>{healthScore.serviceStatusScore}分</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>详细指标</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 32px' }}>
              <div>
                <span style={{ color: '#666', marginRight: 8 }}>SSH状态:</span>
                <span>{healthScore.breakdown.sshScore}分</span>
              </div>
              <div>
                <span style={{ color: '#666', marginRight: 8 }}>Agent状态:</span>
                <span>{healthScore.breakdown.agentScore}分</span>
              </div>
              <div>
                <span style={{ color: '#666', marginRight: 8 }}>CPU使用率:</span>
                <span>{healthScore.breakdown.cpuScore}分</span>
              </div>
              <div>
                <span style={{ color: '#666', marginRight: 8 }}>内存使用率:</span>
                <span>{healthScore.breakdown.memoryScore}分</span>
              </div>
              <div>
                <span style={{ color: '#666', marginRight: 8 }}>磁盘使用率:</span>
                <span>{healthScore.breakdown.diskScore}分</span>
              </div>
              <div>
                <span style={{ color: '#666', marginRight: 8 }}>服务数量:</span>
                <span>{healthScore.breakdown.serviceScore}分</span>
              </div>
              <div>
                <span style={{ color: '#666', marginRight: 8 }}>运行时长:</span>
                <span>{healthScore.breakdown.runningTimeScore}分</span>
              </div>
            </div>
          </div>
        </Panel>

        <Panel header="优化建议" key="2">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            {healthScore.suggestions.map((suggestion, index) => (
              <li key={index} style={{ marginBottom: 4, color: '#666' }}>
                {suggestion}
              </li>
            ))}
          </ul>
        </Panel>
      </Collapse>
    </Modal>
  );
};

export default HostDetailModal;