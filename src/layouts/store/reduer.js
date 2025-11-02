/*
 * @Author: your name
 * @Date: 2021-06-13 15:59:12
 * @LastEditTime: 2021-06-22 17:31:22
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /omp_fontend/src/pages/ProductsManagement/VersionManagement/InstallationDetails/store/reduer.js
 */

import * as actionTypes from "./constants";

const defaultState = {
    viewSize:{height:0, width:0}
};

function reducer(state = defaultState,action){
    switch(action.type){
        case actionTypes.SET_VIEWSIZE:
            return {...state, viewSize: action.payload.viewSize};

        default:
            return state;
    }
}

export default reducer;