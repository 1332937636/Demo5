/*
 * @Author: your name
 * @Date: 2021-05-12 15:17:59
 * @LastEditTime: 2021-06-21 15:23:18
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /ompWeb/src/Root.js
 */
import React, { createContext, useReducer } from "react";
import defaultState, { reducer } from "./stores";
import App from "./App";

import store from "./reduxStore/reduxStore";
import { Provider } from "react-redux";

export const context = createContext(null);

function Root() {
  const [state, dispatch] = useReducer(reducer, defaultState);
  return (
    <Provider store={store}>
      <context.Provider value={{ state, dispatch }}>
        <App />
      </context.Provider>
    </Provider>
  );
}

export default Root;
