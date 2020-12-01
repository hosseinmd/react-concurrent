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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "scroll",
        height: "100%",
      }}
    >
      <h3>useFetching</h3>
      <span>1 second loading start delay</span>
      <ShowResponse {...{ data, isLoading, refetch, error }} />
      <TestFetch />
      <TestFetchCallback />
      <TestFetchingCallback />
      <div style={{ minHeight: "100px", width: "50px", display: "flex" }} />
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
      <ShowResponse
        refetch={() => setFakeDep({})}
        {...{ data, isLoading, error }}
      />
    </>
  );
}

const TestFetchCallback = memo(function TestFetchCallback() {
  const { data, isLoading, error, refetch } = useFetching(async () => {
    const r = await fetch("https://gorest.co.in/public-api/users", {
      method: "GET",
    });
    return await r.json();
  });

  return (
    <>
      <h3>useFetching and refetch again</h3>
      <ShowResponse {...{ data, isLoading, refetch, error }} />
    </>
  );
});

function TestFetchingCallback() {
  const { data, isLoading, error, refetch } = useFetchingCallback(
    () =>
      fetch("https://gorest.co.in/public-api/users", {
        method: "GET",
      }).then((r) => r.json()),
    { keepDataAliveWhenFetching: false },
  );

  return (
    <>
      <h3>useFetchingCallback</h3>
      <span>keepDataAliveWhenFetching is true</span>

      <ShowResponse {...{ data, isLoading, refetch, error }} />
    </>
  );
}

function ShowResponse({ data, isLoading, refetch, error }) {
  return (
    <>
      <button
        onClick={refetch}
        style={{ width: 100, height: 20 }}
        title="start fetch"
      >
        Fetch
      </button>
      <span
        style={{
          marginBottom: 5,
          color: isLoading ? "blue" : "black",
        }}
      >
        {isLoading ? "is loading ... " : "loading is false"}
      </span>
      <span
        style={{
          color: data ? "green" : "red",
        }}
      >
        {data ? "Data is loaded" : "Data is not loaded"}
      </span>
      <span>{error?.message ?? ""}</span>
    </>
  );
}
