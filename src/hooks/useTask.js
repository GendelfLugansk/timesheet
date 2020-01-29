import { useEffect, useRef, useState } from "react";

const makeTaskInstance = (asyncFunc, statusCb) => {
  const taskInstance = {
    isCanceled: false,
    isComplete: false,
    isRunning: false,
    result: undefined,
    error: undefined
  };

  taskInstance.cancel = () => {
    if (!taskInstance.isComplete) {
      taskInstance.isCanceled = true;
      statusCb(taskInstance);
    }
  };

  taskInstance.getErrorIfNotCanceled = () => {
    if (taskInstance.isCanceled) {
      return;
    }

    return taskInstance.error;
  };

  taskInstance.discardError = () => {
    taskInstance.error = undefined;
    statusCb(taskInstance);
  };

  taskInstance.perform = async (...params) => {
    const canceledError = new Error("Task canceled");
    canceledError.isCanceled = true;

    try {
      taskInstance.isRunning = true;
      statusCb(taskInstance);
      const result = await asyncFunc(...params);

      if (taskInstance.isCanceled) {
        throw canceledError;
      }

      taskInstance.result = result;
      taskInstance.isRunning = false;
      taskInstance.isComplete = true;
      statusCb(taskInstance);
      return result;
    } catch (e) {
      taskInstance.error = e;
      taskInstance.isRunning = false;
      taskInstance.isComplete = true;
      statusCb(taskInstance);
      throw e;
    }
  };

  return taskInstance;
};

const CONCURRENCY_STRATEGY_DROP = instances => {
  return instances.filter(({ isComplete }) => !isComplete).length === 0;
};

const CONCURRENCY_STRATEGY_ALLOW = () => true;

const CONCURRENCY_STRATEGY_RESTART = instances => {
  instances
    .filter(({ isComplete }) => !isComplete)
    .forEach(instance => instance.cancel());
  return true;
};

const makeTask = (
  asyncFunc,
  performCanThrow,
  concurrencyStrategy,
  statusCb
) => {
  const task = {
    isRunning: false,
    isIdle: true,
    numRunning: 0,
    instances: [],
    latestInstance: undefined,
    result: undefined,
    error: undefined
  };

  const updateCounters = taskInstance => {
    task.numRunning = task.instances.filter(
      ({ isRunning }) => isRunning
    ).length;
    task.isRunning = task.numRunning > 0;
    task.isIdle = !task.isRunning;
    task.result =
      taskInstance !== undefined &&
      taskInstance.isComplete &&
      taskInstance.result !== undefined
        ? taskInstance.result
        : task.result;
    task.error =
      taskInstance !== undefined &&
      taskInstance.isComplete &&
      taskInstance.error !== undefined
        ? taskInstance.error
        : task.error;
    task.instances = task.instances.filter(({ isComplete }) => !isComplete);
    statusCb(task);
  };

  task.perform = async (...params) => {
    try {
      if (typeof concurrencyStrategy === "function") {
        if (!concurrencyStrategy(task.instances)) {
          throw new Error("Task perform not allowed by concurrency strategy");
        }
      }

      const instance = makeTaskInstance(asyncFunc, updateCounters);
      task.instances.push(instance);
      task.latestInstance = instance;
      return await instance.perform(...params);
    } catch (e) {
      if (performCanThrow) {
        throw e;
      }
    }
  };

  task.cancelAll = () => {
    task.instances.forEach(t => t.cancel());
    updateCounters();
  };

  task.getLatestInstanceErrorIfNotCanceled = () => {
    if (!task.latestInstance) {
      return;
    }

    if (task.latestInstance.isCanceled) {
      return;
    }

    return task.latestInstance.error;
  };

  task.discardLatestInstanceError = () => {
    if (!task.latestInstance) {
      return;
    }

    task.latestInstance.discardError();
  };

  return task;
};

const useTask = (
  asyncFunc,
  performCanThrow = false,
  concurrencyStrategy = CONCURRENCY_STRATEGY_DROP
) => {
  const [, render] = useState();
  const isMounted = useRef(true);
  const task = useRef(
    makeTask(asyncFunc, performCanThrow, concurrencyStrategy, () => {
      if (isMounted.current) {
        render({});
      }
    })
  );

  useEffect(() => {
    const taskRef = task.current;

    return () => {
      isMounted.current = false;
      taskRef && taskRef.cancelAll();
    };
  }, []);

  return task.current;
};

export {
  CONCURRENCY_STRATEGY_DROP,
  CONCURRENCY_STRATEGY_RESTART,
  CONCURRENCY_STRATEGY_ALLOW
};

export default useTask;
