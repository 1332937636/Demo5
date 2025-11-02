import React from "react";
import { useThemeSwitcher } from "./main";
import { Button } from "antd";

function Switcher({ render }) {
  const { switcher, currentTheme } = useThemeSwitcher();

  function toggleDarkMode() {
    switcher({
      theme: currentTheme === "dark" ? "light" : "dark",
    });
  }
  if (render) {
    render({ currentTheme, switcher, useThemeSwitcher });
  }
  return <Button onClick={toggleDarkMode}>主题切换</Button>;
}

export default Switcher;
