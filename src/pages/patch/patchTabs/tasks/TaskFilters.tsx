import React, { useEffect } from "react";
import { useFilterInputChangeHandler, useStatusesFilter } from "hooks";
import Icon from "@leafygreen-ui/icon";
import { PatchTasksQueryParams, TaskStatus } from "types/task";
import { TreeSelect } from "components/TreeSelect";
import { Input } from "antd";
import styled from "@emotion/styled";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { GET_PATCH_TASK_STATUSES } from "gql/queries";
import {
  GetPatchTaskStatusesQuery,
  GetPatchTaskStatusesQueryVariables,
} from "gql/generated/types";
import get from "lodash/get";
import { getCurrentStatuses } from "utils/statuses/getCurrentStatuses";

export const TaskFilters: React.FC = () => {
  const [
    variantFilterValue,
    variantFilterValueOnChange,
  ] = useFilterInputChangeHandler(PatchTasksQueryParams.Variant, true);
  const [
    taskNameFilterValue,
    taskNameFilterValueOnChange,
  ] = useFilterInputChangeHandler(PatchTasksQueryParams.TaskName, true);
  const [statusesVal, statusesValOnChange] = useStatusesFilter(
    PatchTasksQueryParams.Statuses,
    true
  );
  const [baseStatusesVal, baseStatusesValOnChange] = useStatusesFilter(
    PatchTasksQueryParams.BaseStatuses,
    true
  );

  // fetch and poll patch's task statuses so statuses filters only show statuses relevant to the patch
  const { id } = useParams<{ id: string }>();
  const { data, stopPolling } = useQuery<
    GetPatchTaskStatusesQuery,
    GetPatchTaskStatusesQueryVariables
  >(GET_PATCH_TASK_STATUSES, { variables: { id }, pollInterval: 5000 });
  useEffect(() => stopPolling, [stopPolling]);

  const statuses = get(data, "patch.taskStatuses", []);
  const baseStatuses = get(data, "patch.baseTaskStatuses", []);

  return (
    <FiltersWrapper>
      <Input
        style={{ width: "25%" }}
        data-cy="task-name-input"
        placeholder="Search Task Name"
        suffix={<Icon glyph="MagnifyingGlass" />}
        value={taskNameFilterValue}
        onChange={taskNameFilterValueOnChange}
      />
      <Input
        style={{ width: "25%" }}
        data-cy="variant-input"
        placeholder="Search Variant Name"
        suffix={<Icon glyph="MagnifyingGlass" />}
        value={variantFilterValue}
        onChange={variantFilterValueOnChange}
      />
      <TreeSelect
        onChange={statusesValOnChange}
        state={statusesVal}
        tData={getCurrentStatuses(statuses, statusesTreeData)}
        inputLabel="Task Status: "
        dataCy="task-status-filter"
        width="25%"
      />
      <TreeSelect
        onChange={baseStatusesValOnChange}
        state={baseStatusesVal}
        tData={getCurrentStatuses(baseStatuses, statusesTreeData)}
        inputLabel="Task Base Status: "
        dataCy="task-base-status-filter"
        width="25%"
      />
    </FiltersWrapper>
  );
};

const allKey = "all";

export interface Status {
  title: string;
  value: string;
  key: string;
  children?: Status[];
}

const statusesTreeData: Status[] = [
  {
    title: "All",
    value: allKey,
    key: allKey,
  },
  {
    title: "Failures",
    value: "all-failures",
    key: "all-failures",
    children: [
      {
        title: "Failed",
        value: TaskStatus.Failed,
        key: TaskStatus.Failed,
      },
      {
        title: "Test Timed Out",
        value: TaskStatus.TestTimedOut,
        key: TaskStatus.TestTimedOut,
      },
    ],
  },
  {
    title: "Success",
    value: TaskStatus.Succeeded,
    key: TaskStatus.Succeeded,
  },
  {
    title: "Running",
    value: TaskStatus.Dispatched,
    key: TaskStatus.Dispatched,
  },
  {
    title: "Started",
    value: TaskStatus.Started,
    key: TaskStatus.Started,
  },
  {
    title: "Scheduled",
    value: "scheduled",
    key: "scheduled",
    children: [
      {
        title: "Unstarted",
        value: TaskStatus.Unstarted,
        key: TaskStatus.Unstarted,
      },
      {
        title: "Undispatched",
        value: TaskStatus.Undispatched,
        key: TaskStatus.Undispatched,
      },
    ],
  },
  {
    title: "System Issues",
    value: "system-issues",
    key: "system-issues",
    children: [
      {
        title: "System Failed",
        value: TaskStatus.SystemFailed,
        key: TaskStatus.SystemFailed,
      },
    ],
  },
  {
    title: "Setup Failed",
    value: TaskStatus.SetupFailed,
    key: TaskStatus.SetupFailed,
  },
  {
    title: "Blocked",
    value: TaskStatus.StatusBlocked,
    key: TaskStatus.StatusBlocked,
  },
  {
    title: "Won't Run",
    value: TaskStatus.Inactive,
    key: TaskStatus.Inactive,
  },
];

const FiltersWrapper = styled.div`
  display: flex;
  margin-bottom: 12px;
  > :not(:last-child) {
    margin-right: 20px;
  }
`;