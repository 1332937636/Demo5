/*
 * @Author: your name
 * @Date: 2021-06-03 17:22:42
 * @LastEditTime: 2021-06-25 19:08:25
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /omp-fontend123/config-overrides.js
 */
const {
  addWebpackAlias,
  override,
  overrideDevServer,
  addLessLoader,
  addPostcssPlugins,
  fixBabelImports,
} = require("customize-cra");
//const CompressionWebpackPlugin = require("compression-webpack-plugin");
const path = require("path");
// 打包配置
// const addCustomize = () => config => {
//   if (process.env.NODE_ENV === 'production') {
//     // 关闭sourceMap
//     config.devtool = false;
//     // 配置打包后的文件位置
//     config.output.path = __dirname + '../dist/demo/';
//     config.output.publicPath = './demo';
//     // 添加js打包gzip配置
//     config.plugins.push(
//       new CompressionWebpackPlugin({
//         test: /\.js$|\.css$/,
//         threshold: 1024,
//       }),
//     )
//   }
//   return config;
// }
// 跨域配置
const devServerConfig = () => (config) => {
  return {
    ...config,
    // 服务开启gzip
    //compress: true,
    proxy: {
      "/api": {
        target: "http://10.0.2.113:19001/", //服务器地址 Xd8r$3jz
        changeOrigin: true,
        // pathRewrite: {
        //   '^/api': '/api',
        // },
      },
    },
  };
};
// module.exports = override(
//   // 针对antd 实现按需打包：根据import来打包 (使用babel-plugin-import)

//   //增加路径别名的处理
//   addWebpackAlias({
//     "@": path.resolve("./src"),
//   })
// );
module.exports = {
  webpack: override(
    fixBabelImports("import", {
      libraryName: "antd",
      libraryDirectory: "es",
      style: true, //自动打包相关的样式 默认为 style:'css'
    }),
    // 使用less-loader对源码重的less的变量进行重新制定，设置antd自定义主题
    addLessLoader({
      javascriptEnabled: true,
      modifyVars: { "@primary-color": "#4986f7" },
    }),
    addPostcssPlugins([require("postcss-px2rem-exclude")({
        remUnit: 16,
        propList: ['*'],
        exclude: ''
    })]),
    addWebpackAlias({
      "@": path.resolve(__dirname, "./src"),
      assets: path.resolve(__dirname, "./src/assets"),
      components: path.resolve(__dirname, "./src/components"),
      pages: path.resolve(__dirname, "./src/pages"),
      common: path.resolve(__dirname, "./src/common"),
    }),
    config => {
      if (process.env.NODE_ENV === 'production') {
        const paths = require('react-scripts/config/paths');
        paths.appBuild = path.join(path.dirname(paths.appBuild), 'dist');
        config.output.path = path.join(path.dirname(config.output.path), 'dist');
        }
        return config;
      }
  ),
  devServer: overrideDevServer(devServerConfig()),
};
