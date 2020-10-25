const monitorMessage = (fn: any) => {
  window.addEventListener("message", (e) => {
      if (e) {
          if (e.data && typeof e.data == "string") {
              return fn(JSON.parse(e.data));
          } else {
              return console.log("message有误！");
          }
      }
  })
}

const sendMessage = (handleData: any) => {
  if (window !== window.parent) {
      window.parent.postMessage(JSON.stringify({
          method: "onFileMessage",
          handleData: handleData
      }), '*');
  }
}

export { monitorMessage, sendMessage }