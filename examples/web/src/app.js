import React from "react";
import {
  useFetching,
  useFetch,
  useResource,
  useFetchCallback,
} from "../../../src";

export default () => {
  const { data, isLoading, error } = useFetching(() =>
    fetch("https://gorest.co.in/public-api/users", {
      method: "GET",
    }).then((r) => r.json()),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>{isLoading ? "is loading ... " : JSON.stringify(data)}</div>
      <p>{error?.message ?? ""}</p>

      <TestFetch />
      <TestFetchCallback />
    </div>
  );
};

function TestFetch() {
  const { resource } = useFetch(() =>
    fetch("https://gorest.co.in/public-api/users", {
      method: "GET",
    }).then((r) => r.json()),
  );

  const { data, isLoading, error } = useResource(resource);
  return (
    <>
      <div>{isLoading ? "is loading ... " : JSON.stringify(data)}</div>
      <p>{error?.message ?? ""}</p>
    </>
  );
}

function TestFetchCallback() {
  const { resource, refetch } = useFetchCallback(() =>
    fetch("https://gorest.co.in/public-api/users", {
      method: "GET",
    }).then((r) => r.json()),
  );

  const { data, isLoading, error } = useResource(resource);
  return (
    <>
      <button
        onClick={() => refetch()}
        style={{ width: 100, height: 40 }}
        title="start fetch"
      >
        start fetch
      </button>
      <div>{isLoading ? "is loading ... " : JSON.stringify(data)}</div>
      <p>{error?.message ?? ""}</p>
    </>
  );
}
