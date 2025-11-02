/*
 * @Author: your name
 * @Date: 2021-05-12 15:17:59
 * @LastEditTime: 2021-06-21 11:23:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /ompWeb/src/stores/index.js
 */
import updata from "./globalStore";

const defaultState = {
  value: null,
  list: [],
  text: "",
};

export const reducer = (state, action) => {
  switch (action.type) {
    case "ENVIRONMENT_CHANGE":
      localStorage.setItem("defaultEnvID",action.payload.value);
      updata((data) => {
        //console.log(action.payload.text,"action.payload.text");
        return {
          ...data,
          value: action.payload.value,
          text: action.payload.text,
        };
      });
      //getModeInfo(action.payload.value, state);
      return {
        ...state,
        value: action.payload.value,
        text: action.payload.text,
      };
    case "ENVIRONMENT_LIST_CHANGE":
      return { ...state, list: action.payload.list };
    case "ENVIRONMENT_LISTANDVALUE_CHANGE":
      localStorage.setItem("defaultEnvID",action.payload.value);
      updata((data) => {
        return {
          ...data,
          value: action.payload.value,
          text: action.payload.text,
        };
      });
      //getModeInfo(action.payload.value);
      return {
        ...state,
        value: action.payload.value,
        text: action.payload.text,
        list: action.payload.list,
      };
    // case "MAINTENANCE_CHANGE":
    //   updata((data) => {
    //     return {
    //       ...data,
    //       value: action.payload.value,
    //       text: action.payload.text,
    //     };
    //   });
      //return { ...state, maintenance: action.payload.maintenance };
    default:
      return;
  }
};

export default defaultState;
