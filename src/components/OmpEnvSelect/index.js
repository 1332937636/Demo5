import { useContext } from "react";
import { Select } from "antd";
import { context } from "@/layouts";

const OmpEnvSelect = () => {
  const appContext = useContext(context);

  const evnSelectHandle = (e)=>{
    console.log(e)
    const selectedItem = appContext.state.list.filter(item=>item.id == e)
    console.log(selectedItem)
    appContext.dispatch({
      type: "ENVIRONMENT_CHANGE",
      payload: { value: e, text: selectedItem[0]?.env_name },
    });
  }

  return (
    <Select
      style={{ width: 220 }}
      value={appContext.state.value}
      onChange={evnSelectHandle}
      showArrow
    >
      {appContext.state.list.map((item) => {
        return (
          <Select.Option value={item.id} key={item.id}>
            {item.env_name}
          </Select.Option>
        );
      })}
      {/* <Select.Option value={2} key={2}>
        mock
      </Select.Option> */}
    </Select>
  );
};

export default OmpEnvSelect;
