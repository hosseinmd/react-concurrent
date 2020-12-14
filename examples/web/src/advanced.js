import React, { useRef } from "react";
import { useFetchingCallback } from "../../../lib";

const Advanced = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "scroll",
        height: "100%",
      }}
    >
      <TestFetchingCallback />
      <div style={{ minHeight: "100px", width: "50px", display: "flex" }} />
    </div>
  );
};

function TestFetchingCallback() {
  const ref = useRef();
  const { data, isLoading, error, refetch } = useFetchingCallback(
    () => {
      const controller = new AbortController();
      const signal = controller.signal;
      ref.current = controller;
      return fetch("https://gorest.co.in/public-api/users", {
        signal,
        method: "GET",
      }).then((r) => r.json());
    },
    {
      keepDataAliveWhenFetching: false,
      abort: () => {
        console.log("abort");
        ref.current?.abort();
      },
    },
  );

  return (
    <>
      <h3>Abort previous fetch if not completed</h3>
      <span>Keep data alive when fetching</span>

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

export default Advanced;
