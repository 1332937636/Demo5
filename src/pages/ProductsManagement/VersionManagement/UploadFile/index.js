import { apiRequest } from "@/config/requestApi";
import { fetchPost, fetchGet } from "@/utils/request";
import { handleResponse } from "@/utils/utils";
import {
  Button,
  Icon,
  message,
  Spin,
  Steps,
  Upload,
  Select,
  Form,
  Input,
} from "antd";
import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import styles from "../index.less";
import { context } from "@/Root";
import OmpModal from "@/components/OmpModal";
//import updata from "@/stores/globalStore";

const { Step } = Steps;

const UploadFile = () => {
  const appContext = useContext(context);
  const history = useHistory();
  const [current, setCurrent] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  //新环境添加modal框
  const [newEnvVisible, setNewEnvVisible] = useState(false);

  //定义用于展示校验结果的文本
  const [checkResultText, setCheckResultText] = useState(
    <span>待校验...</span>
  );

  //因为上传xlsx文件额外需要数据，在这里定义
  const [xlsxParam, setXlsxParam] = useState({});

  //定义环境新增的环境名
  const [newEnvName, setNewEnvName] = useState("");

  //因为runbanv1和v2支持文件有区别，接口也不同，所以定义命名空间用以区分
  //定义版本区分state
  const [rubanVersion, setRubanVersion] = useState("v2");
  const fileOperation = {
    v2: {
      Upload: apiRequest.productSettings.v2Upload,
      Check: apiRequest.productSettings.v2Check,
      Write: apiRequest.productSettings.v2Write,
    },
    v1: {
      Upload: apiRequest.productSettings.v1UploadExcel,
      Check: apiRequest.productSettings.v1CheckExcel,
      Write: apiRequest.productSettings.v1WriteExcel,
    },
  };

  function onChange(info) {
    if (info.file.status === "done") {
      //只有上传xlsx时才需要接受后端返回的参数
      //判断是xlsx
      if (info.file.name.includes(".xlsx")) {
        setXlsxParam(info.file.response.data);
      } else {
        //  因为xlsx只能有一个，当上传其他文件时也就代表这，上传走的是三个文件的方式，否则也不会成功
        setXlsxParam({});
      }
      message.success(`${info.file.name} 上传成功`);
      setUploadedFiles(uploadedFiles.concat([info.file.name]));
    }

    if (info.file.status === "error") {
      setUploadedFiles([]);
      message.error(`${info.file.name} 上传失败`);
    }

    setFileList(info.fileList.slice(-3));
  }

  function beforeUpload(file) {
    return new Promise((resolve, reject) => {
      if (
        ![
          "task.list",
          "services_port.conf",
          "setup.conf",
          "deployments.xlsx",
        ].includes(file.name)
      ) {
        message.error(`请核对文件名称`);
        return reject();
      } else {
        if (
          ["task.list", "services_port.conf", "setup.conf"].includes(file.name)
        ) {
          setRubanVersion("v2");
        } else if (file.name == "deployments.xlsx") {
          setRubanVersion("v1");
        }
        return resolve();
      }
    });
  }

  const [envData, setEnvData] = useState([]);
  const [envLoading, setEnvLoading] = useState(true);
  const [envSelectValue, setEnvSelectValue] = useState("");

  const handleHeaderSelectChange = (v) => {
    //在这里把检测结果的txt初始化，防止第一次校验失败，用户重新传入后，展示的还是第一次的校验结果
    setCheckResultText(<span>待校验...</span>);
    setEnvSelectValue(v);
  };

  const steps = [
    {
      title: "环境选择",
      content: (
        <div>
          <div className={styles.stepsContent}>
            <div className={styles.mainContent}>
              <div className={styles.envSelectContainer}>
                <Form layout="inline">
                  <Form.Item
                    label={<span className={styles.infoHeader}>环境选择</span>}
                  >
                    <Select
                      value={envSelectValue ? envSelectValue : undefined}
                      placeholder="请选择"
                      disabled={envLoading}
                      loading={envLoading}
                      className={styles.envSelect}
                      // width={180}
                      onChange={handleHeaderSelectChange}
                    >
                      {envData.map((item) => {
                        return (
                          <Select.Option key={item.id} value={item.id}>
                            {item.env_name}
                          </Select.Option>
                        );
                      })}
                    </Select>
                    <Icon
                      style={{ color: "#5192f0", marginLeft: 10 }}
                      onClick={() => setNewEnvVisible(true)}
                      type="plus-circle"
                    />
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "上传文件",
      content: (
        <div>
          <div className={styles.stepsContent}>
            <div className={styles.mainContent}>
              <div className={styles.infoHeader}>
                {/* 上传task.list、services_port.conf、setup.conf */}
                上传文件
              </div>
              <div className={styles.infoNotice}>
                {/* 1. 文件格式仅支持.list和.conf */}
                1.仅支持Ruban部署的环境
              </div>
              <div className={styles.infoNotice}>
                {/* 2. 请一次性上传三个文件，且文件名必须符合要求 */}
                2.Ruban-V1部署的环境需要上传{" "}
                <span style={{ color: "black" }}>
                  task.list、services_port.conf、setup.conf
                </span>{" "}
                请一次性上传三个文件，且文件名必须符合要求
              </div>
              <div className={styles.infoNotice}>
                {/* 3. 部分文件出错时也请重新上传三个文件 */}
                3.Ruban-V2部署的环境需要上传{" "}
                <span style={{ color: "black" }}>deployments.xlsx</span>
              </div>
              <Upload
                key={"task.list"}
                accept=".list,.conf,.xlsx"
                name="file"
                fileList={fileList}
                multiple
                action={fileOperation[rubanVersion].Upload}
                beforeUpload={beforeUpload}
                onChange={onChange}
                showUploadList={{ showRemoveIcon: true }}
                data={{
                  env_id: envSelectValue,
                }}
              >
                <Button>
                  <Icon type="upload" /> 上传
                </Button>
              </Upload>
            </div>
          </div>
        </div>
      ),
      description: (
        <span
          className={styles.description}
          onClick={() => setNewEnvVisible(true)}
        >
          请上传指定格式文件
        </span>
      ),
    },
    {
      title: "校验数据",
      content: (
        <div
          className={styles.stepsContent}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <div
            className={styles.mainContent}
            style={{
              //display: "flex",
              //justifyContent: "center",
              //alignItems: "center",
              width: "100%",
            }}
          >
            {/* <Icon
              style={{ fontSize: "30px" }}
              type="check-circle"
              theme="twoTone"
              twoToneColor="#52c41a"
            /> */}
            <div className={styles.infoHeader}>文件校验</div>
            <div className={styles.infoNotice}>
              请点击 <span style={{ color: "#5192f0" }}>下一步</span>{" "}
              进行文件校验{" "}
              <Icon style={{ color: "black" }} type="file-search" />
            </div>
            <div className={styles.infoHeader}>校验结果</div>
            <div className={styles.infoNotice}>{checkResultText}</div>
          </div>
        </div>
      ),
      description: (
        <span className={styles.description}>检查数据格式是否正确</span>
      ),
    },
    {
      title: "写入数据",
      content: (
        <div
          className={styles.stepsContent}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <div
            className={styles.mainContent}
            style={{
              // display: "flex",
              // justifyContent: "center",
              // alignItems: "center",
              width: "100%",
            }}
          >
            <div className={styles.infoHeader}>写入数据</div>
            <div className={styles.infoNotice}>
              1.请点击 <span style={{ color: "#5192f0" }}>写入数据</span>{" "}
              进行写入 <Icon style={{ color: "black" }} type="edit" />
            </div>
            <div className={styles.infoNotice}>
              2.写入数据成功后会自动进行跳转回列表页
            </div>
          </div>
        </div>
      ),
      description: <span className={styles.description}>执行写入数据</span>,
    },
  ];

  function next() {
    if (current === 0) {
      setCheckResultText(<span>待校验...</span>);
      setCurrent(1);
    } else if (current === 1) {
      let fileNameList = fileList.map((item) => item.name);
      let isRubanV1 =
        fileNameList.includes("task.list") &&
        fileNameList.includes("services_port.conf") &&
        fileNameList.includes("setup.conf") &&
        fileNameList.length == 3;
      let isRubanV2 =
        fileNameList.includes("deployments.xlsx") && fileNameList.length == 1;
      if (isRubanV1 || isRubanV2) {
        //console.log(uploadedFiles,fileList);
        uploadedFiles.length > 0 && setCurrent(2);
      } else {
        message.warn(
          "请上传task.list、services_port.conf、setup.conf三个文件或者上传deployments.xlsx文件"
        );
        setFileList([]);
        setUploadedFiles([]);
        return;
      }

      //setLoading(true);

      // 校验
      // fetchPost(apiRequest.productSettings.checkFiles)
      //   .then((res) => {
      //     handleResponse(
      //       res,
      //       () => setCurrent(2),
      //       () => setFileList([])
      //     );
      //   })
      //   .catch((e) => console.log(e))
      //   .finally(() => setLoading(false));
    } else if (current === 2) {
      setLoading(true);
      // fetchPost(fileOperation[rubanVersion].Write)
      //   .then((res) => {
      //     handleResponse(
      //       res,
      //       () => setCurrent(3),
      //       () => setFileList([])
      //     );
      //   })
      //   .catch((e) => console.log(e))
      //   .finally(() => setLoading(false));
      setCheckResultText(
        <span className={styles.textContainer}>
          <Icon className={styles.icon} type="sync" /> 正在进行校验...
        </span>
      );
      fetchPost(fileOperation[rubanVersion].Check, {
        body: {
          ...xlsxParam,
          env_id: envSelectValue,
        },
      })
        .then((res) => {
          setCheckResultText(<span>{res.message}</span>);
          if (res.code == 0) {
            setXlsxParam({ ...xlsxParam, ...res.data });
            setCurrent(3);
          } else {
            setFileList([]);
          }
          // handleResponse(
          //   res,
          //   () => setCurrent(2),
          //   () => setFileList([])
          // );
        })
        .catch((e) => console.log(e))
        .finally(() => setLoading(false));
    } else if (current === 3) {
      setLoading(true);
      /*eslint-disable*/
      fetchPost(fileOperation[rubanVersion].Write, {
        body: {
          ...xlsxParam,
          env_id: envSelectValue,
        },
      })
        .then((writeRes) => {
          handleResponse(
            writeRes,
            () => {
              if (writeRes.code == 0) {
                fetchGet(apiRequest.environment.queryEnvList)
                  .then((res) => {
                    handleResponse(res, () => {
                      if (res.code == 0) {
                        // res.data=[];
                        appContext.dispatch({
                          type: "ENVIRONMENT_LIST_CHANGE",
                          payload: { list: res.data },
                        });
                        if (res.data.length !== 0) {
                          let newEnv = res.data.filter(
                            (item) => item.id == envSelectValue
                          );
                          appContext.dispatch({
                            type: "ENVIRONMENT_CHANGE",
                            payload: {
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
                    history.push("/products-management/version");
                    //setEnvLoading(false);
                  });
              } else {
                setCurrent(0);
              }
            },
            () => setFileList([])
          );
        })
        .catch((e) => console.log(e))
        .finally(() => setLoading(false));
      //history.push("/machine-management/list");
      setUploadedFiles([]);
      //
    }
  }
  /*eslint-disable*/
  function cancel() {
    setEnvSelectValue("");
    if (current == 0) {
      history.push("/products-management/version");
    } else {
      setUploadedFiles([]);
      setCurrent(0);
      setFileList([]);
    }
  }

  const [envAddLoading, setEnvAddLoading] = useState(false);
  const envAdd = (envName) => {
    setEnvAddLoading(true);
    fetchPost(apiRequest.environment.queryEnvList, {
      body: {
        env_name: envName,
      },
    })
      .then((res) => {
        handleResponse(res, () => {
          if (res.code == 0) {
            setNewEnvVisible(false);
            queryEnvList();
            setEnvSelectValue(res.data.id);
          }
        });
      })
      .catch((e) => console.log(e))
      .finally(() => setEnvAddLoading(false), setNewEnvName(""));
  };

  const queryEnvList = () => {
    fetchGet(apiRequest.environment.queryEnvList, {
      params: {
        all_env: 1,
      },
    })
      .then((res) => {
        handleResponse(res, () => {
          if (res.code == 0) {
            //res.data=[];
            // if (res.data.length == 0) {
            //   setDisabled(true);
            //   history.replace("/products-management/version");
            // } else {
            // appContext.dispatch({
            //   type: "ENVIRONMENT_CHANGE",
            //   payload: { value: res.data[0].id },
            // });
            // setEnvSelectText(res.data[0].env_name);
            //setEnvSelectValue(res.data[0].id);
            setEnvData(res.data);
            //}
          }
        });
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setEnvLoading(false);
      });
  };

  useEffect(() => {
    //环境列表查询
    queryEnvList();
  }, []);

  return (
    <div className={styles.contentWrapper}>
      {/* <Button
        onClick={() => {
          setCurrent(current + 1);
        }}
      >
        加
      </Button>
      <Button onClick={() => setCurrent(current - 1)}>减</Button> */}
      {/* <Button onClick={()=>{appContext.dispatch({
                type: "ENVIRONMENT_CHANGE",
                payload: { value: envSelectValue },
              });
              history.push("/products-management/version");}}>点我</Button> */}

      <Spin spinning={false}>
        <div className={styles.stepsWrapper}>
          <div className={styles.header}>导入数据</div>
          <div className={styles.steps}>
            <Steps current={current} size="small">
              {steps.map((item) => (
                <Step
                  key={item.title}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </Steps>
          </div>
          <div
            style={{
              padding: "0 20px 20px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div>{steps[current].content}</div>
            <div className={styles.stepsAction}>
              <Button style={{ marginRight: 8 }} onClick={() => cancel()}>
                取消
              </Button>
              <Button
                disabled={
                  current === 0 ? envSelectValue == "" : fileList.length === 0
                }
                type="primary"
                onClick={() => next()}
                loading={isLoading}
              >
                {current === 3
                  ? isLoading
                    ? "正在写入"
                    : "写入数据"
                  : "下一步"}
              </Button>
            </div>
          </div>
        </div>
      </Spin>
      <OmpModal
        visibleHandle={[newEnvVisible, setNewEnvVisible]}
        title="新建环境"
        onOk={() => {
          if (!newEnvName) {
            message.warn("请输入数据");
          } else {
            envAdd(newEnvName);
          }
        }}
      >
        <Spin spinning={envAddLoading}>
          <div className={styles.formItem}>
            <span>环境名称：</span>
            <Input
              value={newEnvName}
              onChange={(e) => {
                let regex= /^[a-zA-Z0-9_]{1,}$/;
                if (regex.test(e.target.value)||(!e.target.value)) {
                  setNewEnvName(e.target.value);
                }
              }}
              placeholder={"请输入新增环境名称"}
            />
          </div>
        </Spin>
      </OmpModal>
    </div>
  );
};

export default UploadFile;
