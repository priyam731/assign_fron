"use client";

import { parseAsString } from "nuqs";
import { useQueryState } from "nuqs";

/**
 * Shared nuqs URL state hooks for admin task table.
 * These keep filter/search state in the URL so the browser's back button works
 * and links are shareable.
 */
export function useTaskTableState() {
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [typeFilter, setTypeFilter] = useQueryState("type", parseAsString.withDefault("all"));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault("all"));
  return { search, setSearch, typeFilter, setTypeFilter, statusFilter, setStatusFilter };
}

/**
 * nuqs URL state for admin submissions screen.
 */
export function useSubmissionsState() {
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault("all"));
  const [groupByTask, setGroupByTask] = useQueryState("group", parseAsString.withDefault("false"));
  return {
    search, setSearch,
    statusFilter, setStatusFilter,
    groupByTask: groupByTask === "true",
    setGroupByTask: (v: boolean) => setGroupByTask(v ? "true" : "false"),
  };
}

/**
 * nuqs URL state for worker feed.
 */
export function useWorkerFeedState() {
  const [sort, setSort] = useQueryState("sort", parseAsString.withDefault("latest"));
  const [typeFilter, setTypeFilter] = useQueryState("type", parseAsString.withDefault("all"));
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  return { sort, setSort, typeFilter, setTypeFilter, search, setSearch };
}
