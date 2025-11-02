/*
 * @Author: your name
 * @Date: 2021-05-12 15:17:59
 * @LastEditTime: 2021-06-11 11:50:09
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /ompWeb/src/stores/globalStore.js
 */

export let data = {};

const updata = (fn)=>{
  if(fn) data = fn(data);
  return function(){
    return data;
  };
};

export default updata;