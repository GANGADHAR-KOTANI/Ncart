import { useDispatch, useSelector } from "react-redux";
import { useMemo, useState, useEffect } from "react";
import { toggleFavorite, selectFavoriteIds } from "../redux/slices/favoritesSlice";

export default function useFavourite(productId) {
  const dispatch = useDispatch();
  const favoriteSet = useSelector(selectFavoriteIds);

  const isFavGlobal = favoriteSet.has(String(productId));

  const [localFavIds, setLocalFavIds] = useState(new Set());
  const [isLocalToggle, setIsLocalToggle] = useState(false);

  /** Sync from Redux → local */
  useEffect(() => {
    if (!isLocalToggle) {
      const newSet = new Set();
      if (isFavGlobal) newSet.add(String(productId));
      setLocalFavIds(newSet);
    }
  }, [isFavGlobal]);

  /** After toggle allow sync again */
  useEffect(() => {
    if (isLocalToggle) {
      const t = setTimeout(() => setIsLocalToggle(false), 300);
      return () => clearTimeout(t);
    }
  }, [isLocalToggle]);

  const isFav = localFavIds.has(String(productId));

  const toggleFav = async () => {
    const wasFav = localFavIds.has(String(productId));

    setIsLocalToggle(true);

    setLocalFavIds((prev) => {
      const next = new Set(prev);
      if (wasFav) next.delete(String(productId));
      else next.add(String(productId));
      return next;
    });

    try {
      await dispatch(toggleFavorite(productId)).unwrap();
    } catch (e) {
      console.log("toggleFav hook error:", e);
    }
  };

  return { isFav, toggleFav };
}
