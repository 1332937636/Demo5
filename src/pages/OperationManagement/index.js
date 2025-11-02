import React from "react";
import { withRouter } from "react-router-dom";

const OperationManagement = withRouter(({ children }) => {
  return <div>{children}</div>;
});

export default OperationManagement;
