import { useEffect, useState } from "react";

type ApiResponse = {
  prices: {
    [key: string]: string;
  };
  update_at: string;
};

const api = "https://q.hg.network/subgraphs/name/maki-exchanges/heco";

const useGetPriceData = () => {
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(api);
        const res: ApiResponse = await response.json();

        setData(res);
      } catch (error) {
        console.error("Unable to fetch price data:", error);
      }
    };

    fetchData();
  }, [setData]);

  return data;
};

export default useGetPriceData;
