export const errorWindowClosed = "window-closed";
export const dispatchedErrorEvent = "catchError";

export class PromiseController {
  cleanup() {
    // Empty until implemented in monitorWindowError.
  }
}

/**
 * Checks if there has been an error from the window on an interval.
 */
export function monitorWindowError(): {
  promise: Promise<void>;
  controller: PromiseController;
} {
  const controller = new PromiseController();
  const abortController = new AbortController();

  const promise: Promise<void> = new Promise((resolve, reject) => {
    const handleEvent = function (e: any) {
      window.removeEventListener(dispatchedErrorEvent, handleEvent);

      const err = e.detail;
      reject(err);
    };
    // @ts-expect-error doesn't recognize signal option.
    window.addEventListener(dispatchedErrorEvent, handleEvent, {
      signal: abortController.signal,
    });

    // Initialize cleanup function.
    controller.cleanup = () => {
      // Abort the event listener.
      abortController.abort();
      // Cleanup the promise.
      resolve();
    };
  });

  return { promise, controller };
}
