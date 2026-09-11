export {};

declare global {
  interface Window {
    snap: {
      pay: (token: string, options?: SnapOptions) => void;
    };
  }
}

interface SnapOptions {
  onSuccess?: (result: any) => void;
  onPending?: (result: any) => void;
  onError?: (result: any) => void;
  onClose?: () => void;
  [key: string]: any;
}
