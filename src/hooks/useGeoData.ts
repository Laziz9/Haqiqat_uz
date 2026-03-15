import { useAppContext } from "../context/AppContext";

export const useGeoData = () => {
  const { schools, kindergartens, hospitals, isLoadingGeo } = useAppContext();

  return { schools, kindergartens, hospitals, isLoadingGeo };
};
