import { Toast } from 'antd-mobile';

/**
 * 从任意 error 对象中提取可读的错误信息。
 * 用于统一处理 apiRequest 抛出的 ApiError 以及其他异常。
 */
export function toErrorMessage(error: unknown, fallback = '操作失败，请稍后再试'): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

/**
 * 使用 antd-mobile 的 Toast 显示错误。
 */
export function showError(error: unknown, fallback?: string) {
  Toast.show({ icon: 'fail', content: toErrorMessage(error, fallback) });
}

/**
 * 使用 antd-mobile 的 Toast 显示成功消息。
 */
export function showSuccess(content: string) {
  Toast.show({ icon: 'success', content });
}
