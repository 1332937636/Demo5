import { combineReducers } from "redux";

import { reducer as customBreadcrumbReducer} from "@/layouts/CustomBreadcrumb/store";

const cReducer = combineReducers({
    customBreadcrumb:customBreadcrumbReducer,
});

export default cReducer;