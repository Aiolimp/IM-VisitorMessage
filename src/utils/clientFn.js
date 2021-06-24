/**  调用客户端方法
 * @param {*} methodName 方法名
 * @param {*} params 方法所需参数
 */
export function handleClientMethods(methodName, params) {
  console.log("进入客户端方法", params);
    try {
        external.call(methodName, params, (error, result) => {
            console.log(result)
        })
    } catch (error) {
        console.log("====handleClientMethods error====", error)
    }
}