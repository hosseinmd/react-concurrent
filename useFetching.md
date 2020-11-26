# React-Concurrent A collection of hooks for fetching data easily.

# useFetching

Get your api data easily by useFetching

```js
import { useFetching } from "react-concurrent";

const app = () => {
  const { data, isLoading, error, refetch } = useFetching(() =>
    fetch("http://example.com").then((res) => res.json()),
  );
};

//////// Axios
// If you are using axios
const { data, isLoading, error, refetch } = useFetching(async () => {
  const response = await axios.get("http://example.com");
  return response.data;
});
```

Fetching based on a state change.
In this example every time query change, api will be call again.

```js
import { useFetching } from "react-concurrent";

const app = () => {
  const [query, setQuery] = useState("a query");

  const { data, isLoading, error } = useFetching(
    () => fetch("http://example.com/search?query=" + query),
    [query], // Default is []
  );
};
```

Fetching options

```js
import { useFetching } from "react-concurrent";

const app = () => {
  const [query, setQuery] = useState("a query");

  // don't fetch until query change
  const { data, isLoading, error } = useFetching(
    () => fetch("http://example.com/search?query=" + query),
    [query],
    {
      // Set false to prevents fetching in the first step, just fetch after deps be changed, or refetch called. Default is true.
      startFetchAtFirstRender: false,
      // Adds a delay to loading so that loading is not shown if the api is fetched sooner
      // if you set it 1000 ms, loading not showing until 1000 ms
      loadingStartdelay: 1000,
    },
  );
};
```
