import renderer, { act } from "react-test-renderer";
import React from "react";
import { useFetchingCallback } from "../lib";

function fetchMock() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ isMockedData: true });
    }, 10);
  });
}

function Tester() {
  const { data, isLoading, error, refetch } = useFetchingCallback(fetchMock);
  // @ts-ignore
  return <p {...{ data, isLoading, error, refetch }} />;
}

test("useFetchingCallback", async () => {
  let component;
  await act(async () => {
    component = renderer.create(<Tester />);
  });

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  await act(async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tree2 = component.toJSON();
        expect(tree2).toMatchSnapshot();
        resolve();
      }, 12);
    });
  });

  act(() => {
    const tree2 = component.toJSON();
    tree2.props.refetch();
  });

  await act(async () => {
    const tree2 = component.toJSON();
    expect(tree2).toMatchSnapshot();
    return new Promise((resolve) => {
      setTimeout(() => {
        const tree3 = component.toJSON();
        expect(tree3).toMatchSnapshot();
        resolve();
      }, 20);
    });
  });
});
