import React from "react";
import {
  useFetching,
  useFetch,
  useResource,
  useFetchCallback,
} from "../../../src";

export default () => {
  const { data, isPending, error } = useFetching(() =>
    fetch("https://gorest.co.in/public-api/users", {
      method: "GET",
    }).then((r) => r.json()),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>{isPending ? "is loading ... " : JSON.stringify(data)}</div>
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

  const { data, isPending, error } = useResource(resource);
  return (
    <>
      <div>{isPending ? "is loading ... " : JSON.stringify(data)}</div>
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

  const { data, isPending, error } = useResource(resource);
  return (
    <>
      <button
        onClick={() => refetch()}
        style={{ width: 100, height: 40 }}
        title="start fetch"
      >
        start fetch
      </button>
      <div>{isPending ? "is loading ... " : JSON.stringify(data)}</div>
      <p>{error?.message ?? ""}</p>
    </>
  );
}
