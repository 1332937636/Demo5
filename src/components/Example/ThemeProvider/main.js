import * as React from "react";
import {
  findCommentNode,
  arrayToObject,
  createLinkElement,
  isElement,
  fixedFlashing,
} from "./utils";

const Status = {
  idle: "idle",
  loading: "loading",
  loaded: "loaded",
};

const ThemeSwitcherContext = React.createContext({
  currentTheme: undefined,
  themes: [],
  switcher: () => {},
  status: Status,
});

// 是否开启多主题
const { useMultipleTheme = true } = process.env;

export function ThemeSwitcherProvider({
  themeMap = {},
  insertionPoint,
  defaultTheme,
  id = "current-theme-style",
  attr = "data-theme",
  themeVars = {},
  ...rest
}) {
  const [status, setStatus] = React.useState(Status.idle);
  const [currentTheme, setCurrentTheme] = React.useState();
  const isFirstLoaded = React.useRef(true);

  const insertStyle = React.useCallback(
    (linkElement) => {
      if (insertionPoint || insertionPoint === null) {
        const insertionPointElement = isElement(insertionPoint)
          ? insertionPoint
          : findCommentNode(insertionPoint);

        if (!insertionPointElement) {
          // eslint-disable-next-line no-console
          console.warn(
            `Insertion point '${insertionPoint}' does not exist. Be sure to add comment on head and that it matches the insertionPoint`
          );
          return document.head.appendChild(linkElement);
        }

        const { parentNode } = insertionPointElement;
        if (parentNode) {
          return parentNode.insertBefore(
            linkElement,
            insertionPointElement.nextSibling
          );
        }
      } else {
        return document.head.appendChild(linkElement);
      }
    },
    [insertionPoint]
  );

  /**
   * 判断是否是IE
   * @returns boolean
   */
  function isIE() {
    if (!!window.ActiveXobject || "ActiveXObject" in window) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 判断是否是IE11
   * @returns boolean
   */
  function isIE11() {
    if (/Trident\/7\./.test(navigator.userAgent)) {
      return true;
    } else {
      return false;
    }
  }

  const switcher = React.useCallback(
    ({ theme, isFirst = false }) => {
      if (theme === currentTheme) return;

      const previousStyle = document.getElementById(id);
      if (previousStyle) {
        if (isIE() || isIE11()) {
          previousStyle.removeNode(true);
        } else {
          previousStyle.remove();
        }
      }

      if (themeMap[theme]) {
        setStatus(Status.loading);

        const linkElement = createLinkElement({
          type: "text/css",
          rel: "stylesheet",
          id: id,
          href: themeMap[theme],
          onload: () => {
            if (isFirst) {
              isFirstLoaded.current = false;
            }
            setStatus(Status.loaded);
          },
        });

        insertStyle(linkElement);

        setCurrentTheme(theme);
      } else {
        // eslint-disable-next-line no-console
        return console.warn("Could not find specified theme");
      }

      document.body.setAttribute(attr, theme);
    },
    [themeMap, insertStyle, attr, id, currentTheme]
  );

  React.useEffect(() => {
    if (defaultTheme && useMultipleTheme) {
      switcher({ theme: defaultTheme, isFirst: true });
      fixedFlashing(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTheme, id]);

  React.useEffect(() => {
    if (!useMultipleTheme) {
      return;
    }

    const themes = Object.keys(themeMap);

    themes.map((theme) => {
      const themeAssetId = `theme-prefetch-${theme}`;
      if (!document.getElementById(themeAssetId)) {
        const stylePrefetch = document.createElement("link");
        stylePrefetch.rel = "prefetch";
        stylePrefetch.type = "text/css";
        stylePrefetch.id = themeAssetId;
        stylePrefetch.href = themeMap[theme];

        insertStyle(stylePrefetch);
      }
      return "";
    });
  }, [themeMap, insertStyle]);

  const value = React.useMemo(
    () => ({
      switcher,
      status,
      currentTheme,
      themes: arrayToObject(Object.keys(themeMap)),
      themeVars: useMultipleTheme ? themeVars[currentTheme] || {} : themeVars,
    }),
    [switcher, status, currentTheme, themeMap, themeVars]
  );
  if (status !== "loaded" && isFirstLoaded.current && useMultipleTheme) {
    return <div style={{ fontSize: 12 }}>页面加载中...</div>;
  }

  return <ThemeSwitcherContext.Provider value={value} {...rest} />;
}

export function useThemeSwitcher() {
  const context = React.useContext(ThemeSwitcherContext);
  if (!context) {
    throw new Error(
      "To use `useThemeSwitcher`, component must be within a ThemeSwitcherProvider"
    );
  }
  return context;
}
