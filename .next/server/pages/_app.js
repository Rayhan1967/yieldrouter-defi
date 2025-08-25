/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "(pages-dir-node)/./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_global_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/global.css */ \"(pages-dir-node)/./styles/global.css\");\n/* harmony import */ var _styles_global_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_global_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/head */ \"(pages-dir-node)/./node_modules/next/head.js\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @solana/wallet-adapter-react */ \"@solana/wallet-adapter-react\");\n/* harmony import */ var _solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @solana/wallet-adapter-react-ui */ \"@solana/wallet-adapter-react-ui\");\n/* harmony import */ var _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @solana/wallet-adapter-wallets */ \"@solana/wallet-adapter-wallets\");\n/* harmony import */ var _solana_web3_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @solana/web3.js */ \"@solana/web3.js\");\n/* harmony import */ var _solana_web3_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_solana_web3_js__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var buffer__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! buffer */ \"buffer\");\n/* harmony import */ var buffer__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(buffer__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var _solana_wallet_adapter_react_ui_styles_css__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @solana/wallet-adapter-react-ui/styles.css */ \"(pages-dir-node)/./node_modules/@solana/wallet-adapter-react-ui/styles.css\");\n/* harmony import */ var _solana_wallet_adapter_react_ui_styles_css__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_solana_wallet_adapter_react_ui_styles_css__WEBPACK_IMPORTED_MODULE_9__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__, _solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_4__, _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_5__]);\n([_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__, _solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_4__, _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_5__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n// _app.js - UPDATE VERSION\n\n\n\n\n\n\n\n\n\n// ✅ ADD THIS BUFFER POLYFILL - CRITICAL FOR ANCHOR\nif (false) {}\n// Import wallet CSS\n\nfunction MyApp({ Component, pageProps }) {\n    // Solana setup\n    const endpoint = (0,react__WEBPACK_IMPORTED_MODULE_7__.useMemo)({\n        \"MyApp.useMemo[endpoint]\": ()=>(0,_solana_web3_js__WEBPACK_IMPORTED_MODULE_6__.clusterApiUrl)('devnet')\n    }[\"MyApp.useMemo[endpoint]\"], []);\n    const wallets = (0,react__WEBPACK_IMPORTED_MODULE_7__.useMemo)({\n        \"MyApp.useMemo[wallets]\": ()=>[\n                new _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_5__.PhantomWalletAdapter(),\n                new _solana_wallet_adapter_wallets__WEBPACK_IMPORTED_MODULE_5__.SolflareWalletAdapter()\n            ]\n    }[\"MyApp.useMemo[wallets]\"], []);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_head__WEBPACK_IMPORTED_MODULE_2___default()), {\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"link\", {\n                        rel: \"icon\",\n                        href: \"/logo.png\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 34,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"link\", {\n                        rel: \"shortcut icon\",\n                        href: \"/logo.png\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 35,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"link\", {\n                        rel: \"apple-touch-icon\",\n                        href: \"/logo.png\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 36,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"link\", {\n                        rel: \"apple-touch-icon\",\n                        sizes: \"180x180\",\n                        href: \"/logo.png\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 37,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"link\", {\n                        rel: \"icon\",\n                        type: \"image/png\",\n                        sizes: \"32x32\",\n                        href: \"/logo.png\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 38,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"link\", {\n                        rel: \"icon\",\n                        type: \"image/png\",\n                        sizes: \"16x16\",\n                        href: \"/logo.png\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 39,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"title\", {\n                        children: \"YieldRouter DeFi - Solana Yield Vault Platform\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 42,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"description\",\n                        content: \"Cross-chain DeFi yield farming on Solana with Web3Auth embedded wallets and Yield Vault program\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 43,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"viewport\",\n                        content: \"width=device-width, initial-scale=1\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 44,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"theme-color\",\n                        content: \"#8b5cf6\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 45,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        property: \"og:title\",\n                        content: \"YieldRouter DeFi - Solana Yield Vault\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 48,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        property: \"og:description\",\n                        content: \"Automated yield farming with Web3Auth social login and Solana blockchain integration\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 49,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        property: \"og:image\",\n                        content: \"/logo.png\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 50,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        property: \"og:type\",\n                        content: \"website\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 51,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        property: \"og:url\",\n                        content: \"https://yieldrouter.app\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 52,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"twitter:card\",\n                        content: \"summary_large_image\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 55,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"twitter:title\",\n                        content: \"YieldRouter DeFi\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 56,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"twitter:description\",\n                        content: \"Solana Yield Vault with Web3Auth Integration\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 57,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"twitter:image\",\n                        content: \"/logo.png\"\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 58,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                lineNumber: 32,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__.ConnectionProvider, {\n                endpoint: endpoint,\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__.WalletProvider, {\n                    wallets: wallets,\n                    autoConnect: true,\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_solana_wallet_adapter_react_ui__WEBPACK_IMPORTED_MODULE_4__.WalletModalProvider, {\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                            ...pageProps\n                        }, void 0, false, {\n                            fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                            lineNumber: 64,\n                            columnNumber: 13\n                        }, this)\n                    }, void 0, false, {\n                        fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                        lineNumber: 63,\n                        columnNumber: 11\n                    }, this)\n                }, void 0, false, {\n                    fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                    lineNumber: 62,\n                    columnNumber: 9\n                }, this)\n            }, void 0, false, {\n                fileName: \"/home/rayhan/yieldrouter-defi/pages/_app.js\",\n                lineNumber: 61,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3BhZ2VzL19hcHAuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkJBQTJCOztBQUNFO0FBQ0Q7QUFDc0Q7QUFDWjtBQUN1QjtBQUM3QztBQUNoQjtBQUNBO0FBRWhDLG1EQUFtRDtBQUNuRCxJQUFJLEtBQStDLEVBQUUsRUFFcEQ7QUFFRCxvQkFBb0I7QUFDZ0M7QUFFcEQsU0FBU1UsTUFBTSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBRTtJQUNyQyxlQUFlO0lBQ2YsTUFBTUMsV0FBV04sOENBQU9BO21DQUFDLElBQU1ELDhEQUFhQSxDQUFDO2tDQUFXLEVBQUU7SUFDMUQsTUFBTVEsVUFBVVAsOENBQU9BO2tDQUNyQixJQUFNO2dCQUNKLElBQUlILGdGQUFvQkE7Z0JBQ3hCLElBQUlDLGlGQUFxQkE7YUFDMUI7aUNBQ0QsRUFBRTtJQUdKLHFCQUNFOzswQkFDRSw4REFBQ0wsa0RBQUlBOztrQ0FFSCw4REFBQ2U7d0JBQUtDLEtBQUk7d0JBQU9DLE1BQUs7Ozs7OztrQ0FDdEIsOERBQUNGO3dCQUFLQyxLQUFJO3dCQUFnQkMsTUFBSzs7Ozs7O2tDQUMvQiw4REFBQ0Y7d0JBQUtDLEtBQUk7d0JBQW1CQyxNQUFLOzs7Ozs7a0NBQ2xDLDhEQUFDRjt3QkFBS0MsS0FBSTt3QkFBbUJFLE9BQU07d0JBQVVELE1BQUs7Ozs7OztrQ0FDbEQsOERBQUNGO3dCQUFLQyxLQUFJO3dCQUFPRyxNQUFLO3dCQUFZRCxPQUFNO3dCQUFRRCxNQUFLOzs7Ozs7a0NBQ3JELDhEQUFDRjt3QkFBS0MsS0FBSTt3QkFBT0csTUFBSzt3QkFBWUQsT0FBTTt3QkFBUUQsTUFBSzs7Ozs7O2tDQUdyRCw4REFBQ0c7a0NBQU07Ozs7OztrQ0FDUCw4REFBQ0M7d0JBQUtDLE1BQUs7d0JBQWNDLFNBQVE7Ozs7OztrQ0FDakMsOERBQUNGO3dCQUFLQyxNQUFLO3dCQUFXQyxTQUFROzs7Ozs7a0NBQzlCLDhEQUFDRjt3QkFBS0MsTUFBSzt3QkFBY0MsU0FBUTs7Ozs7O2tDQUdqQyw4REFBQ0Y7d0JBQUtHLFVBQVM7d0JBQVdELFNBQVE7Ozs7OztrQ0FDbEMsOERBQUNGO3dCQUFLRyxVQUFTO3dCQUFpQkQsU0FBUTs7Ozs7O2tDQUN4Qyw4REFBQ0Y7d0JBQUtHLFVBQVM7d0JBQVdELFNBQVE7Ozs7OztrQ0FDbEMsOERBQUNGO3dCQUFLRyxVQUFTO3dCQUFVRCxTQUFROzs7Ozs7a0NBQ2pDLDhEQUFDRjt3QkFBS0csVUFBUzt3QkFBU0QsU0FBUTs7Ozs7O2tDQUdoQyw4REFBQ0Y7d0JBQUtDLE1BQUs7d0JBQWVDLFNBQVE7Ozs7OztrQ0FDbEMsOERBQUNGO3dCQUFLQyxNQUFLO3dCQUFnQkMsU0FBUTs7Ozs7O2tDQUNuQyw4REFBQ0Y7d0JBQUtDLE1BQUs7d0JBQXNCQyxTQUFROzs7Ozs7a0NBQ3pDLDhEQUFDRjt3QkFBS0MsTUFBSzt3QkFBZ0JDLFNBQVE7Ozs7Ozs7Ozs7OzswQkFHckMsOERBQUN0Qiw0RUFBa0JBO2dCQUFDWSxVQUFVQTswQkFDNUIsNEVBQUNYLHdFQUFjQTtvQkFBQ1ksU0FBU0E7b0JBQVNXLFdBQVc7OEJBQzNDLDRFQUFDdEIsZ0ZBQW1CQTtrQ0FDbEIsNEVBQUNROzRCQUFXLEdBQUdDLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBTXBDO0FBRUEsaUVBQWVGLEtBQUtBLEVBQUEiLCJzb3VyY2VzIjpbIi9ob21lL3JheWhhbi95aWVsZHJvdXRlci1kZWZpL3BhZ2VzL19hcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gX2FwcC5qcyAtIFVQREFURSBWRVJTSU9OXG5pbXBvcnQgJy4uL3N0eWxlcy9nbG9iYWwuY3NzJ1xuaW1wb3J0IEhlYWQgZnJvbSAnbmV4dC9oZWFkJ1xuaW1wb3J0IHsgQ29ubmVjdGlvblByb3ZpZGVyLCBXYWxsZXRQcm92aWRlciB9IGZyb20gJ0Bzb2xhbmEvd2FsbGV0LWFkYXB0ZXItcmVhY3QnO1xuaW1wb3J0IHsgV2FsbGV0TW9kYWxQcm92aWRlciB9IGZyb20gJ0Bzb2xhbmEvd2FsbGV0LWFkYXB0ZXItcmVhY3QtdWknO1xuaW1wb3J0IHsgUGhhbnRvbVdhbGxldEFkYXB0ZXIsIFNvbGZsYXJlV2FsbGV0QWRhcHRlciB9IGZyb20gJ0Bzb2xhbmEvd2FsbGV0LWFkYXB0ZXItd2FsbGV0cyc7XG5pbXBvcnQgeyBjbHVzdGVyQXBpVXJsIH0gZnJvbSAnQHNvbGFuYS93ZWIzLmpzJztcbmltcG9ydCB7IHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXInO1xuXG4vLyDinIUgQUREIFRISVMgQlVGRkVSIFBPTFlGSUxMIC0gQ1JJVElDQUwgRk9SIEFOQ0hPUlxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmICF3aW5kb3cuQnVmZmVyKSB7XG4gIHdpbmRvdy5CdWZmZXIgPSBCdWZmZXI7XG59XG5cbi8vIEltcG9ydCB3YWxsZXQgQ1NTXG5pbXBvcnQgJ0Bzb2xhbmEvd2FsbGV0LWFkYXB0ZXItcmVhY3QtdWkvc3R5bGVzLmNzcyc7XG5cbmZ1bmN0aW9uIE15QXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfSkge1xuICAvLyBTb2xhbmEgc2V0dXBcbiAgY29uc3QgZW5kcG9pbnQgPSB1c2VNZW1vKCgpID0+IGNsdXN0ZXJBcGlVcmwoJ2Rldm5ldCcpLCBbXSk7XG4gIGNvbnN0IHdhbGxldHMgPSB1c2VNZW1vKFxuICAgICgpID0+IFtcbiAgICAgIG5ldyBQaGFudG9tV2FsbGV0QWRhcHRlcigpLFxuICAgICAgbmV3IFNvbGZsYXJlV2FsbGV0QWRhcHRlcigpLFxuICAgIF0sXG4gICAgW11cbiAgKTtcblxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8SGVhZD5cbiAgICAgICAgey8qID09PT09PT0gRkFWSUNPTiAmIExPR08gU0VUVVAgPT09PT09PSAqL31cbiAgICAgICAgPGxpbmsgcmVsPVwiaWNvblwiIGhyZWY9XCIvbG9nby5wbmdcIiAvPlxuICAgICAgICA8bGluayByZWw9XCJzaG9ydGN1dCBpY29uXCIgaHJlZj1cIi9sb2dvLnBuZ1wiIC8+XG4gICAgICAgIDxsaW5rIHJlbD1cImFwcGxlLXRvdWNoLWljb25cIiBocmVmPVwiL2xvZ28ucG5nXCIgLz5cbiAgICAgICAgPGxpbmsgcmVsPVwiYXBwbGUtdG91Y2gtaWNvblwiIHNpemVzPVwiMTgweDE4MFwiIGhyZWY9XCIvbG9nby5wbmdcIiAvPlxuICAgICAgICA8bGluayByZWw9XCJpY29uXCIgdHlwZT1cImltYWdlL3BuZ1wiIHNpemVzPVwiMzJ4MzJcIiBocmVmPVwiL2xvZ28ucG5nXCIgLz5cbiAgICAgICAgPGxpbmsgcmVsPVwiaWNvblwiIHR5cGU9XCJpbWFnZS9wbmdcIiBzaXplcz1cIjE2eDE2XCIgaHJlZj1cIi9sb2dvLnBuZ1wiIC8+XG4gICAgICAgIFxuICAgICAgICB7LyogPT09PT09PSBNRVRBIFRBR1MgPT09PT09PSAqL31cbiAgICAgICAgPHRpdGxlPllpZWxkUm91dGVyIERlRmkgLSBTb2xhbmEgWWllbGQgVmF1bHQgUGxhdGZvcm08L3RpdGxlPlxuICAgICAgICA8bWV0YSBuYW1lPVwiZGVzY3JpcHRpb25cIiBjb250ZW50PVwiQ3Jvc3MtY2hhaW4gRGVGaSB5aWVsZCBmYXJtaW5nIG9uIFNvbGFuYSB3aXRoIFdlYjNBdXRoIGVtYmVkZGVkIHdhbGxldHMgYW5kIFlpZWxkIFZhdWx0IHByb2dyYW1cIiAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwidmlld3BvcnRcIiBjb250ZW50PVwid2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTFcIiAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwidGhlbWUtY29sb3JcIiBjb250ZW50PVwiIzhiNWNmNlwiIC8+XG4gICAgICAgIFxuICAgICAgICB7LyogPT09PT09PSBTT0NJQUwgU0hBUklORyAoT3BlbiBHcmFwaCkgPT09PT09PSAqL31cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJvZzp0aXRsZVwiIGNvbnRlbnQ9XCJZaWVsZFJvdXRlciBEZUZpIC0gU29sYW5hIFlpZWxkIFZhdWx0XCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJvZzpkZXNjcmlwdGlvblwiIGNvbnRlbnQ9XCJBdXRvbWF0ZWQgeWllbGQgZmFybWluZyB3aXRoIFdlYjNBdXRoIHNvY2lhbCBsb2dpbiBhbmQgU29sYW5hIGJsb2NrY2hhaW4gaW50ZWdyYXRpb25cIiAvPlxuICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOmltYWdlXCIgY29udGVudD1cIi9sb2dvLnBuZ1wiIC8+XG4gICAgICAgIDxtZXRhIHByb3BlcnR5PVwib2c6dHlwZVwiIGNvbnRlbnQ9XCJ3ZWJzaXRlXCIgLz5cbiAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJvZzp1cmxcIiBjb250ZW50PVwiaHR0cHM6Ly95aWVsZHJvdXRlci5hcHBcIiAvPlxuICAgICAgICBcbiAgICAgICAgey8qID09PT09PT0gVFdJVFRFUiBDQVJEID09PT09PT0gKi99XG4gICAgICAgIDxtZXRhIG5hbWU9XCJ0d2l0dGVyOmNhcmRcIiBjb250ZW50PVwic3VtbWFyeV9sYXJnZV9pbWFnZVwiIC8+XG4gICAgICAgIDxtZXRhIG5hbWU9XCJ0d2l0dGVyOnRpdGxlXCIgY29udGVudD1cIllpZWxkUm91dGVyIERlRmlcIiAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjpkZXNjcmlwdGlvblwiIGNvbnRlbnQ9XCJTb2xhbmEgWWllbGQgVmF1bHQgd2l0aCBXZWIzQXV0aCBJbnRlZ3JhdGlvblwiIC8+XG4gICAgICAgIDxtZXRhIG5hbWU9XCJ0d2l0dGVyOmltYWdlXCIgY29udGVudD1cIi9sb2dvLnBuZ1wiIC8+XG4gICAgICA8L0hlYWQ+XG5cbiAgICAgIDxDb25uZWN0aW9uUHJvdmlkZXIgZW5kcG9pbnQ9e2VuZHBvaW50fT5cbiAgICAgICAgPFdhbGxldFByb3ZpZGVyIHdhbGxldHM9e3dhbGxldHN9IGF1dG9Db25uZWN0PlxuICAgICAgICAgIDxXYWxsZXRNb2RhbFByb3ZpZGVyPlxuICAgICAgICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxuICAgICAgICAgIDwvV2FsbGV0TW9kYWxQcm92aWRlcj5cbiAgICAgICAgPC9XYWxsZXRQcm92aWRlcj5cbiAgICAgIDwvQ29ubmVjdGlvblByb3ZpZGVyPlxuICAgIDwvPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IE15QXBwXG4iXSwibmFtZXMiOlsiSGVhZCIsIkNvbm5lY3Rpb25Qcm92aWRlciIsIldhbGxldFByb3ZpZGVyIiwiV2FsbGV0TW9kYWxQcm92aWRlciIsIlBoYW50b21XYWxsZXRBZGFwdGVyIiwiU29sZmxhcmVXYWxsZXRBZGFwdGVyIiwiY2x1c3RlckFwaVVybCIsInVzZU1lbW8iLCJCdWZmZXIiLCJ3aW5kb3ciLCJNeUFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyIsImVuZHBvaW50Iiwid2FsbGV0cyIsImxpbmsiLCJyZWwiLCJocmVmIiwic2l6ZXMiLCJ0eXBlIiwidGl0bGUiLCJtZXRhIiwibmFtZSIsImNvbnRlbnQiLCJwcm9wZXJ0eSIsImF1dG9Db25uZWN0Il0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/./pages/_app.js\n");

/***/ }),

/***/ "(pages-dir-node)/./styles/global.css":
/*!***************************!*\
  !*** ./styles/global.css ***!
  \***************************/
/***/ (() => {



/***/ }),

/***/ "@solana/wallet-adapter-react":
/*!***********************************************!*\
  !*** external "@solana/wallet-adapter-react" ***!
  \***********************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@solana/wallet-adapter-react");;

/***/ }),

/***/ "@solana/wallet-adapter-react-ui":
/*!**************************************************!*\
  !*** external "@solana/wallet-adapter-react-ui" ***!
  \**************************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@solana/wallet-adapter-react-ui");;

/***/ }),

/***/ "@solana/wallet-adapter-wallets":
/*!*************************************************!*\
  !*** external "@solana/wallet-adapter-wallets" ***!
  \*************************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@solana/wallet-adapter-wallets");;

/***/ }),

/***/ "@solana/web3.js":
/*!**********************************!*\
  !*** external "@solana/web3.js" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@solana/web3.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc","vendor-chunks/@solana"], () => (__webpack_exec__("(pages-dir-node)/./pages/_app.js")));
module.exports = __webpack_exports__;

})();