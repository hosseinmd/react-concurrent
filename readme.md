[![NPM](https://nodei.co/npm/react-concurrent.png)](https://nodei.co/npm/react-concurrent/)

[![install size](https://packagephobia.now.sh/badge?p=react-concurrent)](https://packagephobia.now.sh/result?p=react-concurrent) [![dependencies](https://david-dm.org/poolkhord/react-concurrent.svg)](https://david-dm.org/poolkhord/react-concurrent.svg)

# react-concurrent

The new Render-as-You-Fetch pattern for fetching data. This library aims at implementing that pattern for async APIs.

This is tested on huge project. Everything is stable. but we are improving that. if you have an idea you are so welcome.

## Use

### createResource

```js
import { createResource, useResource } from "react-concurrent";

const resource = createResource(() => fetch("http://example.com"));

const app = () => {
  const { data, isPending, error } = useResource(resource);
};
```

### useFetching

useFetching give us directly data, don't need to use useResource

```js
import { useFetching } from "react-concurrent";

const app = () => {
  const { data, isPending, error } = useFetching(() =>
    fetch("http://example.com"),
  );
};
```

### useFetch

useFetch give us a resource, we need to pass that to useResource for get data

```js
import { useFetch, useResource } from "react-concurrent";

const fetchApi = id => fetch(`http://example.com/${id}`);

const app = () => {
  const [id, setId] = useState(1); // fetch is calling again if this state changed
  const { resource } = useFetch(fetchApi, id);

  return <OtherComponent {...{ resource }} />;
};

const OtherComponent = ({ resource }) => {
  const { data, isPending, error } = useResource(resource);
};
```

### useFetchCallback

useFetchCallback doesn't call fetch until call refetch

```js
import { useFetchCallback, useResource } from "react-concurrent";

const app = () => {
  const { resource, refetch } = useFetchCallback(() =>
    fetch("http://example.com/"),
  );

  return (
    <>
      <Button onPress={() => refetch} title="start fetch" />
      <OtherComponent {...{ resource }} />;
    </>
  );
};

const OtherComponent = ({ resource }) => {
  const { data, isPending, error } = useResource(resource);
};
```

### React Concurrent Mode

As mentioned on react document you could use this

```js
import { createResource } from "react-concurrent";

const resource = createResource(() => fetch("http://example.com"));

const App = () => {
  return (
    <Suspense fallback={"Is loading ...."}>
      <OtherComponent />
    </Suspense>
  );
};

const OtherComponent = () => {
  const data = resource.read();

  return "loaded";
};
```
