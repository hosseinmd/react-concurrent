import renderer, { act } from "react-test-renderer";
import React from "react";
import { useFetching } from "../lib";

function fetchMock() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ isMockedData: true });
    }, 10);
  });
}

function Tester() {
  const { data, isLoading, error } = useFetching(fetchMock);
  return <p {...{ data, isLoading, error }} />;
}

test("store: create theme store", async () => {
  const component = renderer.create(<Tester />);

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  await act(async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tree2 = component.toJSON();
        expect(tree2).toMatchSnapshot();
        resolve();
      }, 20);
    });
  });
});

// test("store: toggle theme", () => {
//   act(async () => {
//     return new Promise(() => {});
//   });

//   tree = component.toJSON();
//   expect(tree).toMatchSnapshot();
// });
