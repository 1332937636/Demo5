import React from "react";
import { withRouter } from "react-router-dom";

const ActionsRecord = withRouter(({ children }) => {
  return <div>{children}</div>;
});

export default ActionsRecord;
