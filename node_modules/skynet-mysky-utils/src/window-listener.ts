export const errorWindowClosed = "window-closed";
export const dispatchedErrorEvent = "catchError";

export class PromiseController {
  cleanup(): void {
    // Empty until implemented in monitorWindowError.
  }
}

/**
 * Checks if there has been an error from the window on an interval.
 *
 * @returns - The promise that rejects if the listener encounters an error from the remote window, and a controller that can abort the event listener and clean up the promise.
 */
export function monitorWindowError(): {
  promise: Promise<void>;
  controller: PromiseController;
} {
  const controller = new PromiseController();
  const abortController = new AbortController();

  const promise: Promise<void> = new Promise((resolve, reject) => {
    const handleEvent = function (event: Event) {
      window.removeEventListener(dispatchedErrorEvent, handleEvent);

      const err = (<CustomEvent>event).detail;
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
