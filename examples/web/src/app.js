import React, { memo, useState } from "react";
import {
  useFetching,
  useCreateResource,
  useResource,
  useFetchingCallback,
} from "../../../lib";

export default () => {
  const { data, isLoading, error, refetch } = useFetching(
    () =>
      fetch("https://gorest.co.in/public-api/users", {
        method: "GET",
      }).then((r) => r.json()),
    [],
    {
      loadingStartDelay: 1000,
    },
  );

  console.log(data, isLoading);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h3>useFetching</h3>
      <span>1 second loading start delay</span>
      <button
        onClick={refetch}
        style={{ width: 100, height: 40 }}
        title="start fetch"
      >
        reFetch
      </button>
      <div
        style={{
          marginBottom: 30,
          color: isLoading ? "blue" : data ? "green" : "red",
        }}
      >
        {isLoading ? "is loading ... " : ""}
        {data ? "Data is loaded" : "Data is not loaded"}
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

  const { data, isLoading, error } = useResource(resource, {
    loadingStartDelay: 2000,
  });
  return (
    <>
      <h3>
        (useCreateResource with startFetchAtFirstRender=false) and useResource
      </h3>
      <span>2 second loading start delay</span>
      <button
        onClick={() => setFakeDep({})}
        style={{ width: 100, height: 40 }}
        title="start fetch"
      >
        Fetch
      </button>
      <div
        style={{
          marginBottom: 30,
          color: isLoading ? "blue" : data ? "green" : "red",
        }}
      >
        {isLoading ? "is loading ... " : ""}
        {data ? "Data is loaded" : "Data is not loaded"}
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
      <div
        style={{
          marginBottom: 30,
          color: isLoading ? "blue" : data ? "green" : "red",
        }}
      >
        {isLoading ? "is loading ... " : ""}
        {data ? "Data is loaded" : "Data is not loaded"}
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
      <div
        style={{
          marginBottom: 30,
          color: isLoading ? "blue" : data ? "green" : "red",
        }}
      >
        {isLoading ? "is loading ... " : ""}
        {data ? "Data is loaded" : "Data is not loaded"}
      </div>
      <p>{error?.message ?? ""}</p>
    </>
  );
}
