import React, { memo } from "react";
import {
  useFetching,
  useFetch,
  useResource,
  useFetchCallback,
  useFetchingCallback,
} from "../../../lib";

export default () => {
  const {
    data,
    isLoading,
    error: { message: errorMessage = "" },
    refetch,
  } = useFetching(() =>
    fetch("https://gorest.co.in/public-api/users", {
      method: "GET",
    }).then((r) => r.json()),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>
        {isLoading
          ? "is loading ... "
          : (JSON.stringify(data) || "").slice(0, 100)}
      </div>
      <p>{errorMessage}</p>
      {errorMessage && <button onClick={() => refetch()}>Try again</button>}

      <TestFetch />
      <TestFetchCallback />
      <TestFetchingCallback />
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
  const { resource, refetch } = useFetchCallback(async () => {
    const r = await fetch("https://gorest.co.in/public-api/users", {
      method: "GET",
    });
    return await r.json();
  });

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
      <button
        onClick={() => refetch()}
        style={{ width: 100, height: 40 }}
        title="start fetch"
      >
        start fetch
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
