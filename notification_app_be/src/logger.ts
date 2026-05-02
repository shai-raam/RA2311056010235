import axios, { AxiosError } from "axios";

const LOG_API_URL =
  process.env.LOG_API_URL ?? "http://20.244.56.144/evaluation-service/logs";
const LOG_ACCESS_TOKEN = process.env.LOG_ACCESS_TOKEN;
let hasWarnedAboutMissingToken = false;

export async function Log(
  stack: string,
  level: string,
  packageName: string,
  message: string
) {
  if (!LOG_ACCESS_TOKEN) {
    if (!hasWarnedAboutMissingToken) {
      console.warn("Logging skipped: LOG_ACCESS_TOKEN is not set");
      hasWarnedAboutMissingToken = true;
    }
    return false;
  }

  try {
    const response = await axios.post(
      LOG_API_URL,
      {
        stack,
        level,
        package: packageName,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${LOG_ACCESS_TOKEN}`,
        },
        timeout: 3000,
      }
    );

    console.log("Log created:", response.data);
    return true;
  } catch (error) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const details =
      axiosError.response?.data ?? axiosError.message ?? "Unknown error";

    console.error(
      `Logging failed${status ? ` (${status})` : ""}:`,
      details
    );
    return false;
  }
}
