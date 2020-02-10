const useConsoleLog = label => {
  return (...objects) => {
    console.log(`${label}: `, ...objects);
  };
};

export default useConsoleLog;
