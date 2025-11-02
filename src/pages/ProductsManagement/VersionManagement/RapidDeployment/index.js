import { apiRequest } from "@/config/requestApi";
import { fetchPost } from "@/utils/request";
import { handleResponse } from "@/utils/utils";
import { Button, Icon, message, Spin, Upload } from "antd";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import styles from "../index.less";
import OmpModal from "@/components/OmpModal";

const RapidDeployment = () => {
  const history = useHistory();
  const [current, setCurrent] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const [modalVisible,setModalVisible] = useState(false);

  function onChange(info) {
    //console.log(fileList);
    if(info.file.name=="deployments.xlsx"){
      setFileList(info.fileList.slice(-1));
      if(info.file.response&&info.file.response.code == 0){
        message.success(`${info.file.name} 上传成功`);
        //console.log(info.file.response.message);
      }else if(info.file.response){
        message.error(`${info.file.response.message}`);
        setFileList([]);
        //console.log(info.fileList,fileList);
      }
    }else{
      setFileList([]);
      message.error("请上传deployments.xlsx文件!");
    }
    // if (info.response.status === "done") {
    //   message.success(`${info.file.name} 上传成功`);
    //   setUploadedFiles(uploadedFiles.concat([info.file.name]));
    // }

    // if (info.file.status === "error") {
    //   message.error(`${info.file.name} 上传失败`);
    // }

    // setFileList(info.fileList.slice(-3));
  }

  // useEffect(() => {
  //   console.log(uploadedFiles);
  // }, [uploadedFiles]);

  // function beforeUpload (file) {
  //   if (!['task.list', 'services_port.conf', 'setup.conf'].includes(file.name)) {
  //     message.error(`请核对文件名称`);
  //     return false;
  //   }
  // }

  //   const steps = [
  //     {
  //       title: "上传文件123",
  //       content: (
  //         <div>
  //           <div className={styles.stepsContent}>
  //             <div className={styles.infoHeader}>
  //               上传task.list、services_port.conf、setup.conf
  //             </div>
  //             <div className={styles.infoNotice}>
  //               1. 文件格式仅支持.list和.conf
  //             </div>
  //             <div className={styles.infoNotice}>
  //               2. 请一次性上传三个文件，且文件名必须符合要求
  //             </div>
  //             <div className={styles.infoNotice}>
  //               3. 部分文件出错时也请重新上传三个文件
  //             </div>
  //             <Upload
  //               key={"task.list"}
  //               accept=".list,.conf"
  //               name="file"
  //               fileList={fileList}
  //               multiple
  //               action={apiRequest.productSettings.uploadTaskFile}
  //               // beforeUpload={beforeUpload}
  //               onChange={onChange}
  //               showUploadList={{ showRemoveIcon: true }}
  //             >
  //               <Button>
  //                 <Icon type="upload" /> 上传
  //               </Button>
  //             </Upload>
  //           </div>
  //         </div>
  //       ),
  //     },
  //     {
  //       title: "校验数据",
  //       content: (
  //         <div
  //           className={styles.stepsContent}
  //           style={{
  //             display: "flex",
  //             justifyContent: "center",
  //             alignItems: "center",
  //             height: "200px",
  //           }}
  //         >
  //           <Icon
  //             style={{ fontSize: "30px" }}
  //             type="check-circle"
  //             theme="twoTone"
  //             twoToneColor="#52c41a"
  //           />
  //           <div className={styles.infoHeader} style={{ margin: "0 0 0 15px" }}>
  //             数据校验完成
  //           </div>
  //         </div>
  //       ),
  //     },
  //     {
  //       title: "写入数据",
  //       content: (
  //         <div
  //           className={styles.stepsContent}
  //           style={{
  //             display: "flex",
  //             justifyContent: "center",
  //             alignItems: "center",
  //             height: "200px",
  //           }}
  //         >
  //           <Icon
  //             style={{ fontSize: "30px" }}
  //             type="check-circle"
  //             theme="twoTone"
  //             twoToneColor="#52c41a"
  //           />
  //           <div className={styles.infoHeader} style={{ margin: "0 0 0 15px" }}>
  //             数据写入成功
  //           </div>
  //         </div>
  //       ),
  //     },
  //   ];

  function next() {
    // if (current === 0) {
    //   if (fileList.length !== 3) {
    //     message.warn("请一次性上传全部三个文件");
    //     setFileList([]);
    //     return;
    //   }
      setIsBtnLoading(true);
      // 校验
      fetchPost(apiRequest.productSettings.executeScript)
        .then((res) => {
          if(res.code==0){
            setTimeout(() => {
              history.replace({
                pathname:"/products-management/version/installationDetails",
                state:{
                  uuid:res.data.operation_uuid
                }
              });
            }, 200);
          }
        })
        .catch((e) => console.log(e))
        .finally(() => setIsBtnLoading(false));
  }

  function cancel() {
    // setUploadedFiles([]);
    // setCurrent(0);
    history.push("/products-management/version");
  }

  return (
    <Spin spinning={isLoading}>
      <div className={styles.stepsWrapper}>
        <div className={styles.header}>上传模版</div>
        <div
          style={{
            padding: "20px 20px 20px 20px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* <div>{steps[current].content}</div> */}
          <div>
            <div className={styles.stepsContent}>
              <div className={styles.mainContent}>
                <div className={styles.infoHeader}>下载模版</div>
                <div className={styles.infoNotice} style={{ marginLeft: 0 }}>
                  点击下方文字按钮，下载模版，并按照规定格式填写数据。
                </div>
                {/* <div className={styles.infoNotice}>
                  2. 请一次性上传三个文件，且文件名必须符合要求
                </div>
                <div className={styles.infoNotice}>
                  3. 部分文件出错时也请重新上传三个文件
                </div> */}
                {/* <Upload
                  key={"task.list"}
                  accept=".list,.conf"
                  name="file"
                  fileList={fileList}
                  multiple
                  action={apiRequest.productSettings.uploadTaskFile}
                  // beforeUpload={beforeUpload}
                  onChange={onChange}
                  showUploadList={{ showRemoveIcon: true }}
                > */}
                <Button
                  onClick={() => {
                    //使用window.open方法在下载时会导致浏览器闪一下，所以采用a标签的方法
                    //window.open("/download/deployments.xlsx");
                    let a = document.createElement("a");
                    a.href = apiRequest.productSettings.downloadXlsxFile;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                >
                  <Icon type="download" /> 下载模版
                </Button>
                {/* </Upload> */}
              </div>
            </div>

            <div className={styles.stepsContent}>
              <div className={styles.mainContent}>
                <div className={styles.infoHeader}>上传文件</div>
                <div className={styles.infoNotice} style={{ marginLeft: 0 }}>
                  上传模版文件，请按照固定格式填写真实信息。
                </div>
                {/* <div className={styles.infoNotice}>
                  2. 请一次性上传三个文件，且文件名必须符合要求
                </div>
                <div className={styles.infoNotice}>
                  3. 部分文件出错时也请重新上传三个文件
                </div> */}
                <Upload
                  key={"task.list"}
                  accept=".xlsx"
                  name="file"
                  fileList={fileList}
                  //multiple
                  action={apiRequest.productSettings.uploadExcel}
                  // beforeUpload={beforeUpload}
                  onChange={onChange}
                  showUploadList={{ showRemoveIcon: true }}
                >
                  <Button>
                    <Icon type="upload" /> 上传文件
                  </Button>
                </Upload>
              </div>
            </div>
          </div>
          <div className={styles.stepsAction}>
            <Button style={{ marginRight: 8 }} onClick={() => cancel()}>
              取消
            </Button>
            <Button
              disabled={fileList.length === 0}
              type="primary"
              onClick={() => {setModalVisible(true);}}
            >
              下一步
            </Button>
          </div>
        </div>
      </div>
      <OmpModal
        title="上传成功"
        visibleHandle = {[modalVisible,setModalVisible]}
        footer={
          [
            <Button key="back" onClick={()=>setModalVisible(false)}>
              取消
            </Button>,
            <Button key="submit" loading={isBtnLoading} type="primary" onClick={()=>{next();}}>
              开始安装
            </Button>,
          ]
        }
      >
        <div style={{fontSize:"16px"}}>
          模版上传完成
        </div>
      </OmpModal>
    </Spin>
  );
};

export default RapidDeployment;
