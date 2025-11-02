import React from "react";
import { Spin } from "antd";

const Loading = () => {
  return (
    <div style={{ textAlign: "center", padding: 50 }}>
      <Spin />
    </div>
  );
};

export default Loading;
