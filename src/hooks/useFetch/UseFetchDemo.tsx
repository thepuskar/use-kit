import { useFetch } from "./useFetch";

interface IImageData {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

export default function UseFetchDemo() {
  const { data, loading, isSuccess, refetch, isError, error } = useFetch<IImageData[]>(
    "https://jsonplaceholder.typicode.com/photos",
    undefined,
    {
      cacheTime: 30_000,
    },
  );

  return (
    <div>
      {isError ? (
        <div className="error" role="alert">
          <span className="block sm:inline">{error?.message || "something went wrong"}</span>
        </div>
      ) : (
        <div className="image-lists flex flex-wrap gap-2 justify-center">
          {loading ? (
            "Loading..."
          ) : (
            <>
              {isSuccess &&
                data?.slice(0, 10)?.map((img: IImageData) => (
                  <div
                    key={img?.id}
                    className="w-60 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
                  >
                    <img className="rounded-t-lg" src={img?.url} alt="" />
                  </div>
                ))}
            </>
          )}
        </div>
      )}

      {isSuccess ? (
        <button type="button" onClick={refetch}>
          Refetch
        </button>
      ) : null}
    </div>
  );
}
