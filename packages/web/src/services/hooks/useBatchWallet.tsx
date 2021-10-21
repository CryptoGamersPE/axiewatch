import { useQueries, UseQueryOptions, UseQueryResult } from 'react-query';
import { ethers } from 'ethers';

import slpAbi from '../../constants/abi/SLP.json';

interface UseBatchWalletData {
  isLoading: boolean;
  results: UseQueryResult<any, any>[];
}

export const useBatchWallet = (addresses: string[]): UseBatchWalletData => {
  const provider = new ethers.providers.JsonRpcProvider(
    {
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/rpc`,
    },
    { name: 'Ronin', chainId: 2020 }
  );

  const slpContract = new ethers.Contract(
    '0xa8754b9fa15fc18bb59458815510e40a12cd2014', // axie SLP contract (ronin)
    slpAbi,
    provider
  );

  const axsContract = new ethers.Contract(
    '0x97a9107c1793bc407d6f527b77e7fff4d812bece', // axie SLP contract (ronin)
    slpAbi,
    provider
  );

  const ethContract = new ethers.Contract(
    '0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5', // axie SLP contract (ronin)
    slpAbi,
    provider
  );

  const queries: UseQueryOptions[] = addresses.map(address => ({
    queryKey: ['wallet', address],
    queryFn: async () => {
      const slp = await slpContract.balanceOf(address);
      const axs = await axsContract.balanceOf(address);
      const eth = await ethContract.balanceOf(address);

      return {
        address,
        slp: Number(ethers.utils.formatUnits(slp, 'wei')),
        axs: Number(ethers.utils.formatEther(axs)),
        eth: Number(ethers.utils.formatEther(eth)),
      };
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  }));

  const results: UseQueryResult<any, any>[] = useQueries(queries);
  const isLoading = results.some(r => r.isLoading);

  return { isLoading, results };
};
