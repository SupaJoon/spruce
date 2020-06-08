import React from "react";
import {
  GET_AGENT_LOGS,
  GET_EVENT_LOGS,
  GET_SYSTEM_LOGS,
  GET_TASK_LOGS,
} from "gql/queries/get-task-logs";
import {
  EventLogsQuery,
  EventLogsQueryVariables,
  SystemLogsQuery,
  SystemLogsQueryVariables,
  AgentLogsQuery,
  AgentLogsQueryVariables,
  TaskLogsQuery,
  TaskLogsQueryVariables,
  LogMessage,
  TaskEventLogEntry,
} from "gql/generated/types";
import { useQuery } from "@apollo/react-hooks";
import { ApolloError } from "apollo-client";
import { useParams } from "react-router-dom";
import { Skeleton } from "antd";
import get from "lodash/get";
import { v4 as uuid } from "uuid";
import { LogMessageLine } from "./logTypes/LogMessageLine";
import { TaskEventLogLine } from "./logTypes/TaskEventLogLine";

interface TaskEventLogEntryType extends TaskEventLogEntry {
  kind?: "taskEventLogEntry";
}
interface LogMessageType extends LogMessage {
  kind?: "logMessage";
}
export const EventLog = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useQuery<
    EventLogsQuery,
    EventLogsQueryVariables
  >(GET_EVENT_LOGS, {
    variables: { id },
  });
  return useRenderBody({
    data: get(data, "taskLogs.eventLogs", []).map((v: TaskEventLogEntry) => ({
      ...v,
      kind: "taskEventLogEntry",
    })),
    loading,
    error,
  });
};

export const SystemLog = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useQuery<
    SystemLogsQuery,
    SystemLogsQueryVariables
  >(GET_SYSTEM_LOGS, {
    variables: { id },
  });
  return useRenderBody({
    data: get(data, "taskLogs.systemLogs", []),
    loading,
    error,
  });
};

export const AgentLog = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useQuery<
    AgentLogsQuery,
    AgentLogsQueryVariables
  >(GET_AGENT_LOGS, {
    variables: { id },
  });
  return useRenderBody({
    data: get(data, "taskLogs.agentLogs", []),
    loading,
    error,
  });
};

export const TaskLog = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useQuery<
    TaskLogsQuery,
    TaskLogsQueryVariables
  >(GET_TASK_LOGS, {
    variables: { id },
  });
  return useRenderBody({
    data: get(data, "taskLogs.taskLogs", []),
    loading,
    error,
  });
};

const useRenderBody: React.FC<{
  loading: boolean;
  error: ApolloError;
  data: [TaskEventLogEntryType | LogMessageType];
}> = ({ loading, error, data }) => {
  const noLogs = <div id="cy-no-logs">No logs</div>;

  if (loading) {
    return <Skeleton active title={false} paragraph={{ rows: 8 }} />;
  }
  if (error) {
    return <div>{error.message}</div>;
  }
  if (!data.length) {
    return noLogs;
  }

  return (
    <>
      {data.map((d) =>
        d.kind === "taskEventLogEntry" ? (
          <TaskEventLogLine key={uuid()} {...d} />
        ) : (
          <LogMessageLine key={uuid()} {...d} />
        )
      )}
    </>
  );
};