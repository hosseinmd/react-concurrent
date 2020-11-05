import React, { memo, useState } from "react";
import {
  useFetching,
  useCreateResource,
  useResource,
  useFetchingCallback,
} from "../../../lib";

export default () => {
  const { data, isLoading, error, refetch } = useFetching(() =>
    fetch("https://gorest.co.in/public-api/users", {
      method: "GET",
    }).then((r) => r.json()),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h3>useFetching</h3>

      <div>
        {isLoading
          ? "is loading ... "
          : (JSON.stringify(data) || "").slice(0, 100)}
      </div>
      <p>{error?.message}</p>
      {error?.message && <button onClick={() => refetch()}>Try again</button>}

      <TestFetch />
      <TestFetchCallback />
      <TestFetchingCallback />
    </div>
  );
};

function TestFetch() {
  const [fakeDep, setFakeDep] = useState({});
  const { resource } = useCreateResource(
    () =>
      fetch("https://gorest.co.in/public-api/users", {
        method: "GET",
      }).then((r) => r.json()),
    [fakeDep],
    { startFetchAtFirstRender: false },
  );

  const { data, isLoading, error } = useResource(resource);
  return (
    <>
      <h3>
        (useCreateResource with startFetchAtFirstRender=false) and useResource
      </h3>
      <button
        onClick={() => setFakeDep({})}
        style={{ width: 100, height: 40 }}
        title="start fetch"
      >
        Fetch
      </button>
      <div style={{ height: 100, overflow: "hidden" }}>
        {isLoading
          ? "is loading ... "
          : (JSON.stringify(data) || "").slice(0, 100)}
      </div>
      <p>{error?.message ?? ""}</p>
    </>
  );
}

const TestFetchCallback = memo(() => {
  const { data, isLoading, error, refetch } = useFetching(async () => {
    const r = await fetch("https://gorest.co.in/public-api/users", {
      method: "GET",
    });
    return await r.json();
  });

  return (
    <>
      <h3>useFetching and refetch again</h3>

      <button
        onClick={() => refetch()}
        style={{ width: 100, height: 40 }}
        title="start fetch"
      >
        Refetch
      </button>
      <div style={{ height: 100 }}>
        {isLoading
          ? "is loading ... "
          : (JSON.stringify(data) || "").slice(0, 100)}
      </div>
      <p>{error?.message ?? ""}</p>
    </>
  );
});

function TestFetchingCallback() {
  const { data, isLoading, error, refetch } = useFetchingCallback(() =>
    fetch("https://gorest.co.in/public-api/users", {
      method: "GET",
    }).then((r) => r.json()),
  );

  return (
    <>
      <h3>useFetchingCallback</h3>
      <button
        onClick={() => refetch()}
        style={{ width: 100, height: 40 }}
        title="start fetch"
      >
        Fetch
      </button>
      <div style={{ height: 100 }}>
        {isLoading
          ? "is loading ... "
          : (JSON.stringify(data) || "").slice(0, 100)}
      </div>
      <p>{error?.message ?? ""}</p>
    </>
  );
}
