/*
 * @Author: your name
 * @Date: 2021-05-21 21:49:03
 * @LastEditTime: 2021-06-16 15:08:52
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /ompWeb/src/pages/ProductsManagement/VersionManagement/InstallationDetails/index.js
 */
import { fetchGet } from "@/utils/request";
import React, { useEffect, useRef, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { apiRequest } from "@/config/requestApi";
import { Button, Icon } from "antd";
import styles from "./index.less";
import { context } from "@/Root";
import { handleResponse } from "@/utils/utils";
/*eslint-disable*/

const InstallationDetails = () => {
  const appContext = useContext(context);
  // eslint-disable-next-line no-console
  const location = useLocation();
  const [text, setText] = useState("");
  const containerRef = useRef(null);
  const [isloading, setIsloading] = useState(false);
  const timer = useRef({
    current: {
      t: null,
    },
  });
  const getInstallLog = (uuid, digui) => {
    let isChangeScroll = digui ? containerRef.current.scrollTop + containerRef.current.clientHeight== containerRef.current.scrollHeight : true
    //console.log(isChangeScroll,"isChangeScroll",digui,containerRef.current.scrollTop ,containerRef.current.scrollHeight)
    fetchGet(apiRequest.productSettings.installLog, {
      params: {
        operation_uuid: uuid,
      },
    })
      .then((res) => {
        //console.log(res);
        handleResponse(res, () => {
          if (res.code == 0) {
            //res.data.install_status = 5
            if (
              res.data.install_status !== 9 &&
              res.data.install_status !== 10
            ) {
              // //if()
              // //console.log(res.data.env_id,appContext.state.value,"???????/")
              if (
                res.data.env_id &&
                res.data.env_id !== appContext.state.value
              ) {
                //console.log("检测id不一致")
                clearTimeout(timer.current.t);
                //if (digui == "digui") {
                  //console.log("开始请求")
                  fetchGet(apiRequest.environment.queryEnvList)
                    .then((reslist) => {
                      handleResponse(reslist, () => {
                        if (reslist.code == 0) {
                          // res.data=[];
                          // appContext.dispatch({
                          //   type: "ENVIRONMENT_LIST_CHANGE",
                          //   payload: { list: reslist.data },
                          // });
                          if (reslist.data.length !== 0) {
                            let newEnv = reslist.data.filter(
                              (item) => item.id == res.data.env_id
                            );
                            // if (newEnvId && newEnvId !== envSelectValue) {
                            //   //setEnvData(res.data);
                            //   // let newEnv = res.data.filter(item=>item.id == newEnvId);
                            //   // //console.log(1111111111111,newEnv)
                            //   // setEnvSelectText(newEnv[0]?.env_name);
                            //   // setEnvSelectValue(newEnv[0]?.id);
                            // } else {
                            //console.log(22222222222222,res.data[0])
                            //setEnvData(res.data);

                            // setEnvSelectText(res.data[0].env_name);
                            // setEnvSelectValue(res.data[0].id);
                            // appContext.dispatch({
                            //   type: "ENVIRONMENT_CHANGE",
                            //   payload: {
                            //     value: newEnv[0]?.id,
                            //     text: newEnv[0]?.env_name,
                            //   },
                            // });
                            // console.log("开始派发",reslist.data,
                            // newEnv[0]?.id,
                            // newEnv[0]?.env_name)
                            appContext.dispatch({
                              type: "ENVIRONMENT_LISTANDVALUE_CHANGE",
                              payload: {
                                list: reslist.data,
                                value: newEnv[0]?.id,
                                text: newEnv[0]?.env_name,
                              },
                            });
                            //}
                          }
                        }
                      });
                    })
                    .catch((e) => console.log(e))
                    .finally(() => {
                      //setEnvLoading(false);
                    });
                  //console.log("开始派发dispath")
                  // appContext.dispatch({
                  //   type: "ENVIRONMENT_CHANGE",
                  //   payload: { value: res.data.env_id },
                  // });
                //}
                // else{
                //   let envObj = appContext.state.list.filter(item=>item.id == res.data.env_id)
                //   console.log("envObj",envObj)
                //   appContext.dispatch({
                //     type: "ENVIRONMENT_CHANGE",
                //     payload: {
                //       value: res.data.env_id,
                //       text: envObj.env_name,
                //     },
                //   });
                // }
              } else {
                setIsloading(true);
                //containerRef.current.scrollTop = containerRef.current.scrollHeight;
                timer.current.t = setTimeout(() => {
                  getInstallLog(uuid, "digui");
                }, 5000);
              }
            } else {
              // if(res.data.env_id){

              // }
              setIsloading(false);
            }
            setText(res.data.stdout_log);
            if (containerRef.current && isChangeScroll && res.data.install_status !== 9 &&
              res.data.install_status !== 10) {
              //console.log("定了")
              containerRef.current.scrollTop =
                containerRef.current.scrollHeight;
            }
          }
        });
      })
      .catch((e) => console.log(e));
  };
  useEffect(() => {
    let uuid = sessionStorage.getItem("uuid");
    if (location.state && location.state.uuid) {
      //console.log("有")
      //console.log("jin");
      sessionStorage.setItem("uuid", location.state.uuid);
      getInstallLog(location.state.uuid);
    } else if (uuid) {
      //console.log("有123",uuid)
      getInstallLog(uuid);
    }
    return () => {
      //console.log("离开了");
      clearTimeout(timer.current.t);
      //sessionStorage.setItem("uuid",null)
    };
  }, []);

  // /useEffect(()=>{console.log('did mount')},[])
  return (
    <div>
      {/* <Button onClick={()=>{
        appContext.dispatch({
          type: "ENVIRONMENT_CHANGE",
          payload: { value: 10 },
        });
      }}>点我派发</Button> */}
      {/* <Button
        onClick={() => {
          fetchGet(apiRequest.environment.queryEnvList)
                  .then((reslist) => {
                    handleResponse(reslist, () => {
                      if (reslist.code == 0) {
                        // res.data=[];
                        
                        // if (reslist.data.length !== 0) {
                        //   let newEnv = reslist.data.filter(
                        //     (item) => item.id == res.data.env_id
                        //   );
                        //   // if (newEnvId && newEnvId !== envSelectValue) {
                        //   //   //setEnvData(res.data);
                        //   //   // let newEnv = res.data.filter(item=>item.id == newEnvId);
                        //   //   // //console.log(1111111111111,newEnv)
                        //   //   // setEnvSelectText(newEnv[0]?.env_name);
                        //   //   // setEnvSelectValue(newEnv[0]?.id);
                        //   // } else {
                        //   //console.log(22222222222222,res.data[0])
                        //   //setEnvData(res.data);

                        //   // setEnvSelectText(res.data[0].env_name);
                        //   // setEnvSelectValue(res.data[0].id);
                        //   appContext.dispatch({
                        //     type: "ENVIRONMENT_CHANGE",
                        //     payload: {
                        //       value: newEnv[0]?.id,
                        //       text: newEnv[0]?.env_name,
                        //     },
                        //   });
                        //   //}
                        // }
                      }
                    });
                  })
                  .catch((e) => console.log(e))
                  .finally(() => {
                    //setEnvLoading(false);
                  })
                }}
      >
        点击
      </Button> */}
      <div className={styles.container}>
        <div className={styles.title}>产品安装明细</div>
        <div ref={containerRef} className={styles.textContainer}>
          {text}
          {isloading && (
            <>
              <br />
              <Icon className={styles.icon} type="sync" /> 安装中...
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallationDetails;
/*eslint-disable*/
