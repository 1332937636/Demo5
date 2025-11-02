import {
  ThemeSwitcherProvider as ThemeProvider,
  useThemeSwitcher,
} from "./main";
import Switcher from "./Switcher";

ThemeProvider.Switcher = Switcher;
ThemeProvider.useThemeSwitcher = useThemeSwitcher;

export default ThemeProvider;
